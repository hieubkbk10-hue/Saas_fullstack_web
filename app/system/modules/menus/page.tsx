'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { toast } from 'sonner';
import { Menu, ExternalLink, FolderTree, Loader2, Database, Trash2, RefreshCw, Settings, Link2 } from 'lucide-react';
import { FieldConfig } from '@/types/moduleConfig';
import { 
  ModuleHeader, ModuleStatus, ConventionNote, Code,
  SettingsCard, SettingInput, SettingSelect,
  FeaturesCard, FieldsCard
} from '@/components/modules/shared';
import { Card, Badge, Button, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/app/admin/components/ui';

const MODULE_KEY = 'menus';

type MenuRecord = {
  _id: Id<'menus'>;
  name: string;
  location: string;
  _creationTime?: number;
};

const FEATURES_CONFIG = [
  { key: 'enableNested', label: 'Menu lồng nhau', icon: FolderTree, description: 'Cho phép tạo menu con nhiều cấp', linkedField: 'parentId' },
  { key: 'enableNewTab', label: 'Mở tab mới', icon: ExternalLink, description: 'Cho phép mở link trong tab mới', linkedField: 'openInNewTab' },
  { key: 'enableIcon', label: 'Icon menu', icon: Menu, description: 'Cho phép gán icon cho menu item', linkedField: 'icon' },
];

type FeaturesState = Record<string, boolean>;
type SettingsState = { maxDepth: number; defaultLocation: string; menusPerPage: number };
type TabType = 'config' | 'data';

export default function MenusModuleConfigPage() {
  const [activeTab, setActiveTab] = useState<TabType>('config');

  // Queries
  const moduleData = useQuery(api.admin.modules.getModuleByKey, { key: MODULE_KEY });
  const featuresData = useQuery(api.admin.modules.listModuleFeatures, { moduleKey: MODULE_KEY });
  const fieldsData = useQuery(api.admin.modules.listModuleFields, { moduleKey: MODULE_KEY });
  const settingsData = useQuery(api.admin.modules.listModuleSettings, { moduleKey: MODULE_KEY });

  // Data tab queries
  const menusData = useQuery(api.menus.listMenus);

  // Mutations
  const toggleFeature = useMutation(api.admin.modules.toggleModuleFeature);
  const updateField = useMutation(api.admin.modules.updateModuleField);
  const setSetting = useMutation(api.admin.modules.setModuleSetting);
  const seedMenusModule = useMutation(api.seed.seedMenusModule);
  const clearMenusData = useMutation(api.seed.clearMenusData);

  // Local state
  const [localFeatures, setLocalFeatures] = useState<FeaturesState>({});
  const [localFields, setLocalFields] = useState<FieldConfig[]>([]);
  const [localSettings, setLocalSettings] = useState<SettingsState>({ maxDepth: 3, defaultLocation: 'header', menusPerPage: 10 });
  const [isSaving, setIsSaving] = useState(false);

  const isLoading = moduleData === undefined || featuresData === undefined || 
                    fieldsData === undefined || settingsData === undefined;

  // Sync features
  useEffect(() => {
    if (featuresData) {
      const features: FeaturesState = {};
      featuresData.forEach(f => { features[f.featureKey] = f.enabled; });
      setLocalFeatures(features);
    }
  }, [featuresData]);

  // Sync fields
  useEffect(() => {
    if (fieldsData) {
      setLocalFields(fieldsData.map(f => ({
        id: f._id,
        key: f.fieldKey,
        name: f.name,
        type: f.type,
        required: f.required,
        enabled: f.enabled,
        isSystem: f.isSystem,
        linkedFeature: f.linkedFeature,
      })));
    }
  }, [fieldsData]);

  // Sync settings
  useEffect(() => {
    if (settingsData) {
      const maxDepth = settingsData.find(s => s.settingKey === 'maxDepth')?.value as number ?? 3;
      const defaultLocation = settingsData.find(s => s.settingKey === 'defaultLocation')?.value as string ?? 'header';
      const menusPerPage = settingsData.find(s => s.settingKey === 'menusPerPage')?.value as number ?? 10;
      setLocalSettings({ maxDepth, defaultLocation, menusPerPage });
    }
  }, [settingsData]);

  // Server state for comparison
  const serverFeatures = useMemo(() => {
    const result: FeaturesState = {};
    featuresData?.forEach(f => { result[f.featureKey] = f.enabled; });
    return result;
  }, [featuresData]);

  const serverFields = useMemo(() => {
    return fieldsData?.map(f => ({ id: f._id, enabled: f.enabled })) || [];
  }, [fieldsData]);

  const serverSettings = useMemo(() => {
    const maxDepth = settingsData?.find(s => s.settingKey === 'maxDepth')?.value as number ?? 3;
    const defaultLocation = settingsData?.find(s => s.settingKey === 'defaultLocation')?.value as string ?? 'header';
    const menusPerPage = settingsData?.find(s => s.settingKey === 'menusPerPage')?.value as number ?? 10;
    return { maxDepth, defaultLocation, menusPerPage };
  }, [settingsData]);

  // Check for changes
  const hasChanges = useMemo(() => {
    const featuresChanged = Object.keys(localFeatures).some(key => localFeatures[key] !== serverFeatures[key]);
    const fieldsChanged = localFields.some(f => {
      const server = serverFields.find(s => s.id === f.id);
      return server && f.enabled !== server.enabled;
    });
    const settingsChanged = localSettings.maxDepth !== serverSettings.maxDepth ||
                           localSettings.defaultLocation !== serverSettings.defaultLocation ||
                           localSettings.menusPerPage !== serverSettings.menusPerPage;
    return featuresChanged || fieldsChanged || settingsChanged;
  }, [localFeatures, serverFeatures, localFields, serverFields, localSettings, serverSettings]);

  const handleToggleFeature = (key: string) => {
    const newFeatureState = !localFeatures[key];
    setLocalFeatures(prev => ({ ...prev, [key]: newFeatureState }));
    setLocalFields(prev => prev.map(f => 
      f.linkedFeature === key ? { ...f, enabled: newFeatureState } : f
    ));
  };

  const handleToggleField = (id: string) => {
    const field = localFields.find(f => f.id === id);
    if (!field) return;
    
    const newFieldState = !field.enabled;
    setLocalFields(prev => {
      const updated = prev.map(f => f.id === id ? { ...f, enabled: newFieldState } : f);
      
      if (field.linkedFeature) {
        const linkedFields = updated.filter(f => f.linkedFeature === field.linkedFeature);
        const allDisabled = linkedFields.every(f => !f.enabled);
        const anyEnabled = linkedFields.some(f => f.enabled);
        
        if (allDisabled) {
          setLocalFeatures(prevFeatures => ({ ...prevFeatures, [field.linkedFeature!]: false }));
        } else if (anyEnabled) {
          setLocalFeatures(prevFeatures => ({ ...prevFeatures, [field.linkedFeature!]: true }));
        }
      }
      return updated;
    });
  };

  // QA FIX: Batch save với Promise.all
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const promises: Promise<unknown>[] = [];
      
      for (const key of Object.keys(localFeatures)) {
        if (localFeatures[key] !== serverFeatures[key]) {
          promises.push(toggleFeature({ moduleKey: MODULE_KEY, featureKey: key, enabled: localFeatures[key] }));
        }
      }
      for (const field of localFields) {
        const server = serverFields.find(s => s.id === field.id);
        if (server && field.enabled !== server.enabled) {
          promises.push(updateField({ id: field.id as Id<"moduleFields">, enabled: field.enabled }));
        }
      }
      if (localSettings.maxDepth !== serverSettings.maxDepth) {
        promises.push(setSetting({ moduleKey: MODULE_KEY, settingKey: 'maxDepth', value: localSettings.maxDepth }));
      }
      if (localSettings.defaultLocation !== serverSettings.defaultLocation) {
        promises.push(setSetting({ moduleKey: MODULE_KEY, settingKey: 'defaultLocation', value: localSettings.defaultLocation }));
      }
      if (localSettings.menusPerPage !== serverSettings.menusPerPage) {
        promises.push(setSetting({ moduleKey: MODULE_KEY, settingKey: 'menusPerPage', value: localSettings.menusPerPage }));
      }
      
      await Promise.all(promises);
      toast.success('Đã lưu cấu hình thành công!');
    } catch {
      toast.error('Có lỗi xảy ra khi lưu cấu hình');
    } finally {
      setIsSaving(false);
    }
  };

  // Data tab handlers
  const handleSeedData = async () => {
    toast.loading('Đang tạo dữ liệu mẫu...');
    await seedMenusModule();
    toast.dismiss();
    toast.success('Đã tạo dữ liệu mẫu thành công!');
  };

  const handleClearData = async () => {
    if (!confirm('Xóa toàn bộ dữ liệu menu?')) return;
    toast.loading('Đang xóa dữ liệu...');
    await clearMenusData();
    toast.dismiss();
    toast.success('Đã xóa toàn bộ dữ liệu!');
  };

  const handleResetData = async () => {
    if (!confirm('Reset toàn bộ dữ liệu về mặc định?')) return;
    toast.loading('Đang reset dữ liệu...');
    await clearMenusData();
    await seedMenusModule();
    toast.dismiss();
    toast.success('Đã reset dữ liệu thành công!');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-orange-500" />
      </div>
    );
  }

  // Check if config is seeded
  const hasConfig = featuresData && featuresData.length > 0;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <ModuleHeader
        icon={Menu}
        title="Module Menu điều hướng"
        description="Cấu hình menu header, footer, sidebar"
        iconBgClass="bg-orange-500/10"
        iconTextClass="text-orange-600 dark:text-orange-400"
        buttonClass="bg-orange-600 hover:bg-orange-500"
        onSave={activeTab === 'config' && hasConfig ? handleSave : undefined}
        hasChanges={activeTab === 'config' ? hasChanges : false}
        isSaving={isSaving}
      />

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700">
        <button
          onClick={() => setActiveTab('config')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'config'
              ? 'border-orange-500 text-orange-600 dark:text-orange-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Settings size={16} /> Cấu hình
        </button>
        <button
          onClick={() => setActiveTab('data')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'data'
              ? 'border-orange-500 text-orange-600 dark:text-orange-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Database size={16} /> Dữ liệu
        </button>
      </div>

      {activeTab === 'config' && (
        <>
          {!hasConfig ? (
            <Card className="p-8 text-center">
              <Menu size={48} className="mx-auto text-slate-300 mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">Chưa có cấu hình module</h3>
              <p className="text-slate-500 mb-4">Nhấn nút bên dưới để khởi tạo cấu hình cho module Menu</p>
              <Button onClick={handleSeedData} className="bg-orange-600 hover:bg-orange-500">
                <Database size={16} className="mr-2" /> Khởi tạo cấu hình
              </Button>
            </Card>
          ) : (
            <>
              <ModuleStatus isCore={moduleData?.isCore ?? false} enabled={moduleData?.enabled ?? true} toggleColor="bg-orange-500" />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="space-y-4">
                  <SettingsCard>
                    <SettingInput 
                      label="Độ sâu tối đa" 
                      value={localSettings.maxDepth} 
                      onChange={(v) => setLocalSettings({...localSettings, maxDepth: v})}
                      focusColor="focus:border-orange-500"
                    />
                    <SettingInput 
                      label="Items mỗi trang" 
                      value={localSettings.menusPerPage} 
                      onChange={(v) => setLocalSettings({...localSettings, menusPerPage: v})}
                      focusColor="focus:border-orange-500"
                    />
                    <SettingSelect
                      label="Vị trí mặc định"
                      value={localSettings.defaultLocation}
                      onChange={(v) => setLocalSettings({...localSettings, defaultLocation: v})}
                      options={[
                        { value: 'header', label: 'Header' },
                        { value: 'footer', label: 'Footer' },
                        { value: 'sidebar', label: 'Sidebar' },
                      ]}
                      focusColor="focus:border-orange-500"
                    />
                  </SettingsCard>

                  <FeaturesCard
                    features={FEATURES_CONFIG.map(f => ({ config: f, enabled: localFeatures[f.key] ?? false }))}
                    onToggle={handleToggleFeature}
                    toggleColor="bg-orange-500"
                  />
                </div>

                <div className="lg:col-span-2">
                  <FieldsCard
                    title="Trường menu"
                    icon={Menu}
                    iconColorClass="text-orange-500"
                    fields={localFields}
                    onToggle={handleToggleField}
                    fieldColorClass="bg-orange-500/10 text-orange-600 dark:text-orange-400"
                    toggleColor="bg-orange-500"
                  />
                </div>
              </div>

              <ConventionNote>
                <strong>Convention:</strong> <Code>location</Code>: header, footer, sidebar. Menu sắp xếp theo <Code>order</Code>. Hỗ trợ tối đa 3 cấp menu.
              </ConventionNote>
            </>
          )}
        </>
      )}

      {activeTab === 'data' && (
        <MenusDataTab 
          menusData={menusData || []}
          onSeedData={handleSeedData}
          onClearData={handleClearData}
          onResetData={handleResetData}
        />
      )}
    </div>
  );
}

function MenusDataTab({ 
  menusData, 
  onSeedData, 
  onClearData, 
  onResetData 
}: { 
  menusData: MenuRecord[];
  onSeedData: () => Promise<void>;
  onClearData: () => Promise<void>;
  onResetData: () => Promise<void>;
}) {
  // Get menu items for each menu
  const headerMenu = menusData.find(m => m.location === 'header');
  const footerMenu = menusData.find(m => m.location === 'footer');
  const sidebarMenu = menusData.find(m => m.location === 'sidebar');

  const headerItemsData = useQuery(api.menus.listMenuItems, headerMenu ? { menuId: headerMenu._id } : "skip");
  const footerItemsData = useQuery(api.menus.listMenuItems, footerMenu ? { menuId: footerMenu._id } : "skip");
  const sidebarItemsData = useQuery(api.menus.listMenuItems, sidebarMenu ? { menuId: sidebarMenu._id } : "skip");

  const totalItems = (headerItemsData?.length || 0) + (footerItemsData?.length || 0) + (sidebarItemsData?.length || 0);

  return (
    <div className="space-y-6">
      {/* Action buttons */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">Quản lý dữ liệu mẫu</h3>
            <p className="text-sm text-slate-500 mt-1">Seed, clear hoặc reset dữ liệu cho module menu</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onSeedData} className="gap-2">
              <Database size={16} /> Seed Data
            </Button>
            <Button variant="outline" onClick={onClearData} className="gap-2 text-red-500 hover:text-red-600">
              <Trash2 size={16} /> Clear All
            </Button>
            <Button onClick={onResetData} className="gap-2 bg-orange-600 hover:bg-orange-500">
              <RefreshCw size={16} /> Reset
            </Button>
          </div>
        </div>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <Menu className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{menusData.length}</p>
              <p className="text-sm text-slate-500">Menus</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Link2 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{totalItems}</p>
              <p className="text-sm text-slate-500">Menu Items</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <Menu className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{headerItemsData?.length || 0}</p>
              <p className="text-sm text-slate-500">Header Items</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Menu className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{footerItemsData?.length || 0}</p>
              <p className="text-sm text-slate-500">Footer Items</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Menus Table */}
      <Card>
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
          <Menu className="w-5 h-5 text-orange-500" />
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">Danh sách Menus ({menusData.length})</h3>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên menu</TableHead>
              <TableHead>Vị trí</TableHead>
              <TableHead className="text-right">Số items</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {menusData.map(menu => {
              let itemCount = 0;
              if (menu.location === 'header') itemCount = headerItemsData?.length || 0;
              else if (menu.location === 'footer') itemCount = footerItemsData?.length || 0;
              else if (menu.location === 'sidebar') itemCount = sidebarItemsData?.length || 0;
              
              return (
                <TableRow key={menu._id}>
                  <TableCell className="font-medium">{menu.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{menu.location}</Badge>
                  </TableCell>
                  <TableCell className="text-right">{itemCount}</TableCell>
                </TableRow>
              );
            })}
            {menusData.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8 text-slate-500">
                  Chưa có menu nào. Nhấn &quot;Seed Data&quot; để tạo dữ liệu mẫu.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Header Menu Items */}
      {headerMenu && headerItemsData && headerItemsData.length > 0 && (
        <Card>
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
            <Menu className="w-5 h-5 text-green-500" />
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">Header Menu ({headerItemsData.length})</h3>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Label</TableHead>
                <TableHead>URL</TableHead>
                <TableHead>Cấp</TableHead>
                <TableHead>Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {headerItemsData.slice(0, 10).map(item => (
                <TableRow key={item._id}>
                  <TableCell className="font-medium" style={{ paddingLeft: `${item.depth * 24 + 16}px` }}>
                    {item.depth > 0 && <span className="text-slate-400 mr-2">└</span>}
                    {item.label}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-slate-500">{item.url}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">Cấp {item.depth + 1}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={item.active ? 'success' : 'secondary'}>
                      {item.active ? 'Hiện' : 'Ẩn'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {headerItemsData.length > 10 && (
            <div className="p-3 border-t border-slate-100 dark:border-slate-800 text-sm text-slate-500 text-center">
              Hiển thị 10 / {headerItemsData.length} items
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
