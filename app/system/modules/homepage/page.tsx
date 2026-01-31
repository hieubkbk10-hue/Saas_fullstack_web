'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { toast } from 'sonner';
import { Home, LayoutGrid, ImageIcon, FileText, Users, Phone, Loader2, Database, Trash2, RefreshCw, Settings, Eye, EyeOff, GripVertical } from 'lucide-react';
import { FieldConfig } from '@/types/moduleConfig';
import { 
  ModuleHeader, ModuleStatus, ConventionNote, Code,
  SettingsCard, SettingInput, SettingSelect,
  FeaturesCard, FieldsCard
} from '@/components/modules/shared';
import { Card, Badge, Button, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/app/admin/components/ui';

const MODULE_KEY = 'homepage';

const FEATURES_CONFIG = [
  { key: 'enableHero', label: 'Hero Banner', icon: ImageIcon },
  { key: 'enableAbout', label: 'Giới thiệu', icon: FileText },
  { key: 'enableProducts', label: 'Sản phẩm nổi bật', icon: LayoutGrid },
  { key: 'enablePosts', label: 'Bài viết mới', icon: FileText },
  { key: 'enablePartners', label: 'Đối tác', icon: Users },
  { key: 'enableContact', label: 'Liên hệ', icon: Phone },
];

const TYPE_ICONS: Record<string, React.ElementType> = {
  hero: ImageIcon,
  about: FileText,
  products: LayoutGrid,
  posts: FileText,
  partners: Users,
  contact: Phone,
};

const TYPE_COLORS: Record<string, string> = {
  hero: 'bg-blue-500/10 text-blue-600',
  about: 'bg-emerald-500/10 text-emerald-600',
  products: 'bg-purple-500/10 text-purple-600',
  posts: 'bg-cyan-500/10 text-cyan-600',
  partners: 'bg-amber-500/10 text-amber-600',
  contact: 'bg-pink-500/10 text-pink-600',
};

type FeaturesState = Record<string, boolean>;
type SettingsState = { maxSections: number; defaultSectionType: string };
type TabType = 'config' | 'data';

const SECTION_TYPES = [
  { value: 'hero', label: 'Hero Banner' },
  { value: 'about', label: 'Giới thiệu' },
  { value: 'products', label: 'Sản phẩm nổi bật' },
  { value: 'posts', label: 'Bài viết mới' },
  { value: 'partners', label: 'Đối tác' },
  { value: 'contact', label: 'Liên hệ' },
];

export default function HomepageModuleConfigPage() {
  const [activeTab, setActiveTab] = useState<TabType>('config');
  
  const moduleData = useQuery(api.admin.modules.getModuleByKey, { key: MODULE_KEY });
  const featuresData = useQuery(api.admin.modules.listModuleFeatures, { moduleKey: MODULE_KEY });
  const fieldsData = useQuery(api.admin.modules.listModuleFields, { moduleKey: MODULE_KEY });
  const settingsData = useQuery(api.admin.modules.listModuleSettings, { moduleKey: MODULE_KEY });

  // Data tab queries
  const componentsData = useQuery(api.homeComponents.listAll);
  const statsData = useQuery(api.homeComponents.getStats);

  const toggleFeature = useMutation(api.admin.modules.toggleModuleFeature);
  const updateField = useMutation(api.admin.modules.updateModuleField);
  const setSetting = useMutation(api.admin.modules.setModuleSetting);
  const seedHomepageModule = useMutation(api.seed.seedHomepageModule);
  const clearHomepageData = useMutation(api.seed.clearHomepageData);
  const toggleComponent = useMutation(api.homeComponents.toggle);

  const [localFeatures, setLocalFeatures] = useState<FeaturesState>({});
  const [localFields, setLocalFields] = useState<FieldConfig[]>([]);
  const [localSettings, setLocalSettings] = useState<SettingsState>({ maxSections: 10, defaultSectionType: 'hero' });
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
      const maxSections = settingsData.find(s => s.settingKey === 'maxSections')?.value as number ?? 10;
      const defaultSectionType = settingsData.find(s => s.settingKey === 'defaultSectionType')?.value as string ?? 'hero';
      setLocalSettings({ maxSections, defaultSectionType });
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
    const maxSections = settingsData?.find(s => s.settingKey === 'maxSections')?.value as number ?? 10;
    const defaultSectionType = settingsData?.find(s => s.settingKey === 'defaultSectionType')?.value as string ?? 'hero';
    return { maxSections, defaultSectionType };
  }, [settingsData]);

  // Check for changes
  const hasChanges = useMemo(() => {
    const featuresChanged = Object.keys(localFeatures).some(key => localFeatures[key] !== serverFeatures[key]);
    const fieldsChanged = localFields.some(f => {
      const server = serverFields.find(s => s.id === f.id);
      return server && f.enabled !== server.enabled;
    });
    const settingsChanged = 
      localSettings.maxSections !== serverSettings.maxSections ||
      localSettings.defaultSectionType !== serverSettings.defaultSectionType;
    return featuresChanged || fieldsChanged || settingsChanged;
  }, [localFeatures, serverFeatures, localFields, serverFields, localSettings, serverSettings]);

  const handleToggleFeature = (key: string) => {
    const newFeatureState = !localFeatures[key];
    setLocalFeatures(prev => ({ ...prev, [key]: newFeatureState }));
    // Also update linked fields
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

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Save features
      for (const key of Object.keys(localFeatures)) {
        if (localFeatures[key] !== serverFeatures[key]) {
          await toggleFeature({ moduleKey: MODULE_KEY, featureKey: key, enabled: localFeatures[key] });
        }
      }
      // Save fields
      for (const field of localFields) {
        const server = serverFields.find(s => s.id === field.id);
        if (server && field.enabled !== server.enabled) {
          await updateField({ id: field.id as Id<'moduleFields'>, enabled: field.enabled });
        }
      }
      // Save settings
      if (localSettings.maxSections !== serverSettings.maxSections) {
        await setSetting({ moduleKey: MODULE_KEY, settingKey: 'maxSections', value: localSettings.maxSections });
      }
      if (localSettings.defaultSectionType !== serverSettings.defaultSectionType) {
        await setSetting({ moduleKey: MODULE_KEY, settingKey: 'defaultSectionType', value: localSettings.defaultSectionType });
      }
      toast.success('Đã lưu cấu hình thành công!');
    } catch {
      toast.error('Có lỗi xảy ra khi lưu cấu hình');
    } finally {
      setIsSaving(false);
    }
  };

  // Data tab handlers
  const handleSeedAll = async () => {
    toast.loading('Đang tạo dữ liệu mẫu...');
    await seedHomepageModule();
    toast.dismiss();
    toast.success('Đã tạo dữ liệu mẫu thành công!');
  };

  const handleClearData = async () => {
    if (!confirm('Xóa toàn bộ sections trang chủ?')) return;
    toast.loading('Đang xóa dữ liệu...');
    await clearHomepageData();
    toast.dismiss();
    toast.success('Đã xóa toàn bộ sections!');
  };

  const handleResetAll = async () => {
    if (!confirm('Reset dữ liệu về mặc định?')) return;
    toast.loading('Đang reset dữ liệu...');
    await clearHomepageData();
    await seedHomepageModule();
    toast.dismiss();
    toast.success('Đã reset dữ liệu thành công!');
  };

  const handleToggleComponent = async (id: Id<'homeComponents'>) => {
    await toggleComponent({ id });
    toast.success('Đã cập nhật trạng thái section!');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-orange-500" />
      </div>
    );
  }

  // Sort components by order
  const sortedComponents = [...(componentsData || [])].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <ModuleHeader
        icon={Home}
        title="Module Trang chủ"
        description="Cấu hình các section trang chủ"
        iconBgClass="bg-orange-500/10"
        iconTextClass="text-orange-600 dark:text-orange-400"
        buttonClass="bg-orange-600 hover:bg-orange-500"
        onSave={activeTab === 'config' ? handleSave : undefined}
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
          <ModuleStatus isCore={moduleData?.isCore ?? false} enabled={moduleData?.enabled ?? true} toggleColor="bg-orange-500" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="space-y-4">
              <SettingsCard title="Cài đặt Homepage">
                <SettingInput
                  label="Số section tối đa"
                  value={localSettings.maxSections}
                  onChange={(v) => setLocalSettings(prev => ({ ...prev, maxSections: Number(v) }))}
                  type="number"
                  min={1}
                  max={20}
                  focusColor="focus:border-orange-500"
                />
                <SettingSelect
                  label="Loại section mặc định"
                  value={localSettings.defaultSectionType}
                  onChange={(v) => setLocalSettings(prev => ({ ...prev, defaultSectionType: v }))}
                  options={SECTION_TYPES}
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
                title="Trường section"
                icon={LayoutGrid}
                iconColorClass="text-orange-500"
                fields={localFields}
                onToggle={handleToggleField}
                fieldColorClass="bg-orange-500/10 text-orange-600 dark:text-orange-400"
                toggleColor="bg-orange-500"
              />
            </div>
          </div>

          <ConventionNote>
            <strong>Convention:</strong> <Code>type</Code>: hero, about, products, posts, partners, contact. <Code>config</Code> lưu JSON tùy chỉnh cho từng section.
          </ConventionNote>
        </>
      )}

      {activeTab === 'data' && (
        <div className="space-y-6">
          {/* Action buttons */}
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">Quản lý dữ liệu mẫu</h3>
                <p className="text-sm text-slate-500 mt-1">Seed, clear hoặc reset sections trang chủ</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleSeedAll} className="gap-2">
                  <Database size={16} /> Seed Data
                </Button>
                <Button variant="outline" onClick={handleClearData} className="gap-2 text-red-500 hover:text-red-600">
                  <Trash2 size={16} /> Clear All
                </Button>
                <Button onClick={handleResetAll} className="gap-2 bg-orange-600 hover:bg-orange-500">
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
                  <LayoutGrid className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{statsData?.totalCount ?? 0}</p>
                  <p className="text-sm text-slate-500">Tổng sections</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 rounded-lg">
                  <Eye className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{statsData?.activeCount ?? 0}</p>
                  <p className="text-sm text-slate-500">Đang hiển thị</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-500/10 rounded-lg">
                  <EyeOff className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{statsData?.inactiveCount ?? 0}</p>
                  <p className="text-sm text-slate-500">Đang ẩn</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Home className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{statsData?.typeBreakdown?.length ?? 0}</p>
                  <p className="text-sm text-slate-500">Loại section</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Type breakdown */}
          {statsData?.typeBreakdown && statsData.typeBreakdown.length > 0 && (
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <LayoutGrid className="w-5 h-5 text-orange-500" />
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">Phân loại sections</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {statsData.typeBreakdown.map(({ type, count }) => {
                  const Icon = TYPE_ICONS[type] || LayoutGrid;
                  const colorClass = TYPE_COLORS[type] || 'bg-slate-500/10 text-slate-600';
                  return (
                    <Badge key={type} variant="secondary" className={`${colorClass} gap-1`}>
                      <Icon size={12} />
                      {type}: {count}
                    </Badge>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Sections Table */}
          <Card>
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <LayoutGrid className="w-5 h-5 text-orange-500" />
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">Sections ({componentsData?.length ?? 0})</h3>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Tên section</TableHead>
                  <TableHead>Loại</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedComponents.map((component, index) => {
                  const Icon = TYPE_ICONS[component.type] || LayoutGrid;
                  const colorClass = TYPE_COLORS[component.type] || 'bg-slate-500/10 text-slate-600';
                  return (
                    <TableRow key={component._id}>
                      <TableCell>
                        <div className="flex items-center gap-1 text-slate-400">
                          <GripVertical size={14} />
                          {index + 1}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{component.title}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={`${colorClass} gap-1`}>
                          <Icon size={12} />
                          {component.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={component.active ? 'default' : 'secondary'}>
                          {component.active ? 'Hiển thị' : 'Ẩn'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleToggleComponent(component._id)}
                          className="gap-1"
                        >
                          {component.active ? <EyeOff size={14} /> : <Eye size={14} />}
                          {component.active ? 'Ẩn' : 'Hiện'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {(!componentsData || componentsData.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                      Chưa có section nào. Nhấn &quot;Seed Data&quot; để tạo dữ liệu mẫu.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </div>
      )}
    </div>
  );
}
