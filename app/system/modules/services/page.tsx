'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, usePaginatedQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { toast } from 'sonner';
import { Briefcase, FolderTree, DollarSign, Clock, Star, Loader2, Database, Trash2, RefreshCw, Settings, Palette, Eye, Monitor, Tablet, Smartphone } from 'lucide-react';
import { FieldConfig } from '@/types/moduleConfig';
import { 
  ModuleHeader, ModuleStatus, ConventionNote, Code,
  SettingsCard, SettingInput, SettingSelect,
  FeaturesCard, FieldsCard
} from '@/components/modules/shared';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, cn } from '@/app/admin/components/ui';

const MODULE_KEY = 'services';
const CATEGORY_MODULE_KEY = 'serviceCategories';

const FEATURES_CONFIG = [
  { key: 'enablePrice', label: 'Hiển thị giá', icon: DollarSign, linkedField: 'price' },
  { key: 'enableDuration', label: 'Thời gian', icon: Clock, linkedField: 'duration' },
  { key: 'enableFeatured', label: 'Nổi bật', icon: Star, linkedField: 'featured' },
];

type FeaturesState = Record<string, boolean>;
type SettingsState = { servicesPerPage: number; defaultStatus: string };
type TabType = 'config' | 'data' | 'appearance';
type ServicesListStyle = 'fullwidth' | 'sidebar' | 'magazine';
type ServicesDetailStyle = 'classic' | 'modern' | 'minimal';
type PreviewDevice = 'desktop' | 'tablet' | 'mobile';

const LIST_STYLES: { id: ServicesListStyle; label: string; description: string }[] = [
  { id: 'fullwidth', label: 'Full Width', description: 'Horizontal filter bar + grid/list toggle, tối ưu mobile' },
  { id: 'sidebar', label: 'Sidebar', description: 'Classic với sidebar filters, categories, recent services' },
  { id: 'magazine', label: 'Magazine', description: 'Hero slider + category tabs, phong cách editorial' },
];

const DETAIL_STYLES: { id: ServicesDetailStyle; label: string; description: string }[] = [
  { id: 'classic', label: 'Classic', description: 'Truyền thống với sidebar thông tin & liên quan' },
  { id: 'modern', label: 'Modern', description: 'Hero lớn, full-width, hiện đại' },
  { id: 'minimal', label: 'Minimal', description: 'Tối giản, tập trung vào nội dung' },
];

const deviceWidths = {
  desktop: 'w-full',
  tablet: 'w-[768px] max-w-full',
  mobile: 'w-[375px] max-w-full'
};

const devices = [
  { id: 'desktop' as const, icon: Monitor, label: 'Desktop' },
  { id: 'tablet' as const, icon: Tablet, label: 'Tablet' },
  { id: 'mobile' as const, icon: Smartphone, label: 'Mobile' }
];

export default function ServicesModuleConfigPage() {
  const [activeTab, setActiveTab] = useState<TabType>('config');
  const moduleData = useQuery(api.admin.modules.getModuleByKey, { key: MODULE_KEY });
  const featuresData = useQuery(api.admin.modules.listModuleFeatures, { moduleKey: MODULE_KEY });
  const fieldsData = useQuery(api.admin.modules.listModuleFields, { moduleKey: MODULE_KEY });
  const categoryFieldsData = useQuery(api.admin.modules.listModuleFields, { moduleKey: CATEGORY_MODULE_KEY });
  const settingsData = useQuery(api.admin.modules.listModuleSettings, { moduleKey: MODULE_KEY });

  const { results: servicesData, status: servicesStatus, loadMore: loadMoreServices } = usePaginatedQuery(
    api.services.list,
    {},
    { initialNumItems: 10 }
  );
  const categoriesData = useQuery(api.serviceCategories.listAll, { limit: 50 });

  const toggleFeature = useMutation(api.admin.modules.toggleModuleFeature);
  const updateField = useMutation(api.admin.modules.updateModuleField);
  const setSetting = useMutation(api.admin.modules.setModuleSetting);
  const seedServicesModule = useMutation(api.seed.seedServicesModule);
  const clearServicesData = useMutation(api.seed.clearServicesData);
  const setMultipleSettings = useMutation(api.settings.setMultiple);

  // Appearance tab queries
  const listStyleSetting = useQuery(api.settings.getByKey, { key: 'services_list_style' });
  const detailStyleSetting = useQuery(api.settings.getByKey, { key: 'services_detail_style' });
  const brandColorSetting = useQuery(api.settings.getByKey, { key: 'site_brand_color' });

  const [localFeatures, setLocalFeatures] = useState<FeaturesState>({});
  const [localServiceFields, setLocalServiceFields] = useState<FieldConfig[]>([]);
  const [localCategoryFields, setLocalCategoryFields] = useState<FieldConfig[]>([]);
  const [localSettings, setLocalSettings] = useState<SettingsState>({ servicesPerPage: 10, defaultStatus: 'draft' });
  const [isSaving, setIsSaving] = useState(false);

  // Appearance tab states
  const [listStyle, setListStyle] = useState<ServicesListStyle>('fullwidth');
  const [detailStyle, setDetailStyle] = useState<ServicesDetailStyle>('classic');
  const [previewDevice, setPreviewDevice] = useState<PreviewDevice>('desktop');
  const [activePreview, setActivePreview] = useState<'list' | 'detail'>('list');
  const [appearanceHasChanges, setAppearanceHasChanges] = useState(false);

  const brandColor = (brandColorSetting?.value as string) || '#14b8a6';

  const isLoading = moduleData === undefined || featuresData === undefined || 
                    fieldsData === undefined || categoryFieldsData === undefined || settingsData === undefined;

  useEffect(() => {
    if (featuresData) {
      const features: FeaturesState = {};
      featuresData.forEach(f => { features[f.featureKey] = f.enabled; });
      setLocalFeatures(features);
    }
  }, [featuresData]);

  useEffect(() => {
    if (fieldsData) {
      setLocalServiceFields(fieldsData.map(f => ({
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

  useEffect(() => {
    if (categoryFieldsData) {
      setLocalCategoryFields(categoryFieldsData.map(f => ({
        id: f._id,
        key: f.fieldKey,
        name: f.name,
        type: f.type,
        required: f.required,
        enabled: f.enabled,
        isSystem: f.isSystem,
      })));
    }
  }, [categoryFieldsData]);

  useEffect(() => {
    if (settingsData) {
      const servicesPerPage = settingsData.find(s => s.settingKey === 'servicesPerPage')?.value as number ?? 10;
      const defaultStatus = settingsData.find(s => s.settingKey === 'defaultStatus')?.value as string ?? 'draft';
      setLocalSettings({ servicesPerPage, defaultStatus });
    }
  }, [settingsData]);

  // Sync appearance settings
  useEffect(() => {
    if (listStyleSetting?.value) {
      setListStyle(listStyleSetting.value as ServicesListStyle);
    }
    if (detailStyleSetting?.value) {
      setDetailStyle(detailStyleSetting.value as ServicesDetailStyle);
    }
  }, [listStyleSetting, detailStyleSetting]);

  const serverFeatures = useMemo(() => {
    const result: FeaturesState = {};
    featuresData?.forEach(f => { result[f.featureKey] = f.enabled; });
    return result;
  }, [featuresData]);

  const serverServiceFields = useMemo(() => {
    return fieldsData?.map(f => ({ id: f._id, enabled: f.enabled })) || [];
  }, [fieldsData]);

  const serverCategoryFields = useMemo(() => {
    return categoryFieldsData?.map(f => ({ id: f._id, enabled: f.enabled })) || [];
  }, [categoryFieldsData]);

  const serverSettings = useMemo(() => {
    const servicesPerPage = settingsData?.find(s => s.settingKey === 'servicesPerPage')?.value as number ?? 10;
    const defaultStatus = settingsData?.find(s => s.settingKey === 'defaultStatus')?.value as string ?? 'draft';
    return { servicesPerPage, defaultStatus };
  }, [settingsData]);

  const hasChanges = useMemo(() => {
    const featuresChanged = Object.keys(localFeatures).some(key => localFeatures[key] !== serverFeatures[key]);
    const serviceFieldsChanged = localServiceFields.some(f => {
      const server = serverServiceFields.find(s => s.id === f.id);
      return server && f.enabled !== server.enabled;
    });
    const categoryFieldsChanged = localCategoryFields.some(f => {
      const server = serverCategoryFields.find(s => s.id === f.id);
      return server && f.enabled !== server.enabled;
    });
    const settingsChanged = localSettings.servicesPerPage !== serverSettings.servicesPerPage ||
                           localSettings.defaultStatus !== serverSettings.defaultStatus;
    return featuresChanged || serviceFieldsChanged || categoryFieldsChanged || settingsChanged;
  }, [localFeatures, serverFeatures, localServiceFields, serverServiceFields, localCategoryFields, serverCategoryFields, localSettings, serverSettings]);

  const handleToggleFeature = (key: string) => {
    const newFeatureState = !localFeatures[key];
    setLocalFeatures(prev => ({ ...prev, [key]: newFeatureState }));
    setLocalServiceFields(prev => prev.map(f => 
      f.linkedFeature === key ? { ...f, enabled: newFeatureState } : f
    ));
  };

  const handleToggleServiceField = (id: string) => {
    const field = localServiceFields.find(f => f.id === id);
    if (!field) return;
    
    const newFieldState = !field.enabled;
    setLocalServiceFields(prev => {
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

  const handleToggleCategoryField = (id: string) => {
    setLocalCategoryFields(prev => prev.map(f => f.id === id ? { ...f, enabled: !f.enabled } : f));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const promises: Promise<unknown>[] = [];
      
      for (const key of Object.keys(localFeatures)) {
        if (localFeatures[key] !== serverFeatures[key]) {
          promises.push(toggleFeature({ moduleKey: MODULE_KEY, featureKey: key, enabled: localFeatures[key] }));
        }
      }
      
      for (const field of localServiceFields) {
        const server = serverServiceFields.find(s => s.id === field.id);
        if (server && field.enabled !== server.enabled) {
          promises.push(updateField({ id: field.id as Id<"moduleFields">, enabled: field.enabled }));
        }
      }
      
      for (const field of localCategoryFields) {
        const server = serverCategoryFields.find(s => s.id === field.id);
        if (server && field.enabled !== server.enabled) {
          promises.push(updateField({ id: field.id as Id<"moduleFields">, enabled: field.enabled }));
        }
      }
      
      if (localSettings.servicesPerPage !== serverSettings.servicesPerPage) {
        promises.push(setSetting({ moduleKey: MODULE_KEY, settingKey: 'servicesPerPage', value: localSettings.servicesPerPage }));
      }
      if (localSettings.defaultStatus !== serverSettings.defaultStatus) {
        promises.push(setSetting({ moduleKey: MODULE_KEY, settingKey: 'defaultStatus', value: localSettings.defaultStatus }));
      }
      
      await Promise.all(promises);
      toast.success('Đã lưu cấu hình thành công!');
    } catch {
      toast.error('Có lỗi xảy ra khi lưu cấu hình');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSeedAll = async () => {
    toast.loading('Đang tạo dữ liệu mẫu...');
    await seedServicesModule();
    toast.dismiss();
    toast.success('Đã tạo dữ liệu mẫu thành công!');
  };

  const handleClearAll = async () => {
    if (!confirm('Xóa toàn bộ dữ liệu dịch vụ và danh mục?')) return;
    toast.loading('Đang xóa dữ liệu...');
    await clearServicesData();
    toast.dismiss();
    toast.success('Đã xóa toàn bộ dữ liệu!');
  };

  const handleResetAll = async () => {
    if (!confirm('Reset toàn bộ dữ liệu về mặc định?')) return;
    toast.loading('Đang reset dữ liệu...');
    await clearServicesData();
    await seedServicesModule();
    toast.dismiss();
    toast.success('Đã reset dữ liệu thành công!');
  };

  // Appearance tab handlers
  const handleListStyleChange = (style: ServicesListStyle) => {
    setListStyle(style);
    setAppearanceHasChanges(true);
  };

  const handleDetailStyleChange = (style: ServicesDetailStyle) => {
    setDetailStyle(style);
    setAppearanceHasChanges(true);
  };

  const handleSaveAppearance = async () => {
    setIsSaving(true);
    try {
      await setMultipleSettings({
        settings: [
          { key: 'services_list_style', value: listStyle, group: 'services' },
          { key: 'services_detail_style', value: detailStyle, group: 'services' },
        ]
      });
      setAppearanceHasChanges(false);
      toast.success('Đã lưu cài đặt giao diện!');
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Có lỗi khi lưu cài đặt');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-teal-500" />
      </div>
    );
  }

  const categoryMap: Record<string, string> = {};
  categoriesData?.forEach(cat => { categoryMap[cat._id] = cat.name; });

  const formatPrice = (price?: number) => {
    if (!price) return '-';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <ModuleHeader
        icon={Briefcase}
        title="Module Dịch vụ"
        description="Cấu hình dịch vụ và danh mục"
        iconBgClass="bg-teal-500/10"
        iconTextClass="text-teal-600 dark:text-teal-400"
        buttonClass="bg-teal-600 hover:bg-teal-500"
        onSave={activeTab === 'config' ? handleSave : activeTab === 'appearance' ? handleSaveAppearance : undefined}
        hasChanges={activeTab === 'config' ? hasChanges : activeTab === 'appearance' ? appearanceHasChanges : false}
        isSaving={isSaving}
      />

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700">
        <button
          onClick={() => setActiveTab('config')}
          className={cn(
            "flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors",
            activeTab === 'config'
              ? "border-teal-500 text-teal-600 dark:text-teal-400"
              : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          )}
        >
          <Settings size={16} /> Cấu hình
        </button>
        <button
          onClick={() => setActiveTab('data')}
          className={cn(
            "flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors",
            activeTab === 'data'
              ? "border-teal-500 text-teal-600 dark:text-teal-400"
              : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          )}
        >
          <Database size={16} /> Dữ liệu
        </button>
        <button
          onClick={() => setActiveTab('appearance')}
          className={cn(
            "flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors",
            activeTab === 'appearance'
              ? "border-teal-500 text-teal-600 dark:text-teal-400"
              : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          )}
        >
          <Palette size={16} /> Giao diện
        </button>
      </div>

      {activeTab === 'config' && (
        <>
          <ModuleStatus isCore={moduleData?.isCore ?? false} enabled={moduleData?.enabled ?? true} toggleColor="bg-teal-500" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="space-y-4">
              <SettingsCard>
                <SettingInput 
                  label="Số dịch vụ / trang" 
                  value={localSettings.servicesPerPage} 
                  onChange={(v) => setLocalSettings({...localSettings, servicesPerPage: v})}
                  focusColor="focus:border-teal-500"
                />
                <SettingSelect
                  label="Trạng thái mặc định"
                  value={localSettings.defaultStatus}
                  onChange={(v) => setLocalSettings({...localSettings, defaultStatus: v})}
                  options={[{ value: 'draft', label: 'Bản nháp' }, { value: 'published', label: 'Xuất bản' }]}
                  focusColor="focus:border-teal-500"
                />
              </SettingsCard>

              <FeaturesCard
                features={FEATURES_CONFIG.map(f => ({ config: f, enabled: localFeatures[f.key] ?? false }))}
                onToggle={handleToggleFeature}
                toggleColor="bg-teal-500"
              />
            </div>

            <FieldsCard
              title="Trường dịch vụ"
              icon={Briefcase}
              iconColorClass="text-teal-500"
              fields={localServiceFields}
              onToggle={handleToggleServiceField}
              fieldColorClass="bg-teal-500/10 text-teal-600 dark:text-teal-400"
              toggleColor="bg-teal-500"
            />

            <FieldsCard
              title="Trường danh mục"
              icon={FolderTree}
              iconColorClass="text-emerald-500"
              fields={localCategoryFields}
              onToggle={handleToggleCategoryField}
              fieldColorClass="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              toggleColor="bg-emerald-500"
            />
          </div>

          <ConventionNote>
            <strong>Convention:</strong> Slug tự động từ tiêu đề. Trường <Code>order</Code> và <Code>active</Code> bắt buộc theo Rails convention.
          </ConventionNote>
        </>
      )}

      {activeTab === 'data' && (
        <div className="space-y-6">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">Quản lý dữ liệu mẫu</h3>
                <p className="text-sm text-slate-500 mt-1">Seed, clear hoặc reset dữ liệu cho module dịch vụ</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleSeedAll} className="gap-2">
                  <Database size={16} /> Seed Data
                </Button>
                <Button variant="outline" onClick={handleClearAll} className="gap-2 text-red-500 hover:text-red-600">
                  <Trash2 size={16} /> Clear All
                </Button>
                <Button onClick={handleResetAll} className="gap-2 bg-teal-600 hover:bg-teal-500">
                  <RefreshCw size={16} /> Reset
                </Button>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-teal-500/10 rounded-lg">
                  <Briefcase className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{servicesData?.length ?? 0}{servicesStatus === 'CanLoadMore' ? '+' : ''}</p>
                  <p className="text-sm text-slate-500">Dịch vụ</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 rounded-lg">
                  <FolderTree className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{categoriesData?.length ?? 0}</p>
                  <p className="text-sm text-slate-500">Danh mục</p>
                </div>
              </div>
            </Card>
          </div>

          <Card>
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-teal-500" />
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">Dịch vụ ({servicesData?.length ?? 0}{servicesStatus === 'CanLoadMore' ? '+' : ''})</h3>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tiêu đề</TableHead>
                  <TableHead>Danh mục</TableHead>
                  <TableHead>Giá</TableHead>
                  <TableHead>Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {servicesData?.map(service => (
                  <TableRow key={service._id}>
                    <TableCell className="font-medium">{service.title}</TableCell>
                    <TableCell><Badge variant="secondary">{categoryMap[service.categoryId] || 'N/A'}</Badge></TableCell>
                    <TableCell>{formatPrice(service.price)}</TableCell>
                    <TableCell>
                      <Badge variant={service.status === 'Published' ? 'default' : service.status === 'Draft' ? 'secondary' : 'outline'}>
                        {service.status === 'Published' ? 'Xuất bản' : service.status === 'Draft' ? 'Nháp' : 'Lưu trữ'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {(!servicesData || servicesData.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-slate-500">
                      Chưa có dịch vụ nào. Nhấn &quot;Seed Data&quot; để tạo dữ liệu mẫu.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            {servicesStatus === 'CanLoadMore' && (
              <div className="p-3 border-t border-slate-100 dark:border-slate-800 text-center">
                <Button variant="ghost" size="sm" onClick={() => loadMoreServices(10)}>
                  Tải thêm dịch vụ
                </Button>
              </div>
            )}
          </Card>

          <Card>
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <FolderTree className="w-5 h-5 text-emerald-500" />
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">Danh mục ({categoriesData?.length ?? 0})</h3>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên danh mục</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Số dịch vụ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categoriesData?.map(cat => {
                  const serviceCount = servicesData?.filter(s => s.categoryId === cat._id).length ?? 0;
                  return (
                    <TableRow key={cat._id}>
                      <TableCell className="font-medium">{cat.name}</TableCell>
                      <TableCell className="text-slate-500 font-mono text-sm">{cat.slug}</TableCell>
                      <TableCell>
                        <Badge variant={cat.active ? 'default' : 'secondary'}>{cat.active ? 'Hoạt động' : 'Ẩn'}</Badge>
                      </TableCell>
                      <TableCell className="text-right">{serviceCount}</TableCell>
                    </TableRow>
                  );
                })}
                {(!categoriesData || categoriesData.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-slate-500">
                      Chưa có danh mục nào.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </div>
      )}

      {activeTab === 'appearance' && (
        <div className="space-y-6">
          {/* Compact Style Selectors */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* List Style Selector */}
            <Card className="p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-shrink-0">
                  <h3 className="font-medium text-sm text-slate-900 dark:text-slate-100">Trang danh sách</h3>
                  <p className="text-xs text-slate-500">/services</p>
                </div>
                <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                  {LIST_STYLES.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => {
                        handleListStyleChange(style.id);
                        setActivePreview('list');
                      }}
                      title={style.description}
                      className={cn(
                        "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                        listStyle === style.id 
                          ? "bg-teal-500 text-white shadow-sm" 
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                      )}
                    >
                      {style.label}
                    </button>
                  ))}
                </div>
              </div>
            </Card>

            {/* Detail Style Selector */}
            <Card className="p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-shrink-0">
                  <h3 className="font-medium text-sm text-slate-900 dark:text-slate-100">Trang chi tiết</h3>
                  <p className="text-xs text-slate-500">/services/[slug]</p>
                </div>
                <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                  {DETAIL_STYLES.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => {
                        handleDetailStyleChange(style.id);
                        setActivePreview('detail');
                      }}
                      title={style.description}
                      className={cn(
                        "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                        detailStyle === style.id 
                          ? "bg-teal-500 text-white shadow-sm" 
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                      )}
                    >
                      {style.label}
                    </button>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Full Width Preview */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Eye size={18} /> Preview
                </CardTitle>
                <div className="flex items-center gap-4">
                  {/* Page toggle */}
                  <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                    <button
                      onClick={() => setActivePreview('list')}
                      className={cn(
                        "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                        activePreview === 'list' ? "bg-white dark:bg-slate-700 shadow-sm" : "text-slate-500"
                      )}
                    >
                      Danh sách
                    </button>
                    <button
                      onClick={() => setActivePreview('detail')}
                      className={cn(
                        "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                        activePreview === 'detail' ? "bg-white dark:bg-slate-700 shadow-sm" : "text-slate-500"
                      )}
                    >
                      Chi tiết
                    </button>
                  </div>
                  {/* Device selector */}
                  <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                    {devices.map((d) => (
                      <button
                        key={d.id}
                        onClick={() => setPreviewDevice(d.id)}
                        title={d.label}
                        className={cn(
                          "p-1.5 rounded-md transition-all",
                          previewDevice === d.id ? "bg-white dark:bg-slate-700 shadow-sm" : "text-slate-400 hover:text-slate-600"
                        )}
                      >
                        <d.icon size={16} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className={cn("mx-auto transition-all duration-300", deviceWidths[previewDevice])}>
                <BrowserFrame>
                  {activePreview === 'list' 
                    ? <ListPreview style={listStyle} brandColor={brandColor} device={previewDevice} />
                    : <DetailPreview style={detailStyle} brandColor={brandColor} device={previewDevice} />
                  }
                </BrowserFrame>
              </div>
              <div className="mt-3 text-xs text-slate-500 text-center">
                {activePreview === 'list' ? 'Trang /services' : 'Trang /services/[slug]'}
                {' • '}Style: <strong>{activePreview === 'list' ? LIST_STYLES.find(s => s.id === listStyle)?.label : DETAIL_STYLES.find(s => s.id === detailStyle)?.label}</strong>
                {' • '}{previewDevice === 'desktop' ? '1920px' : previewDevice === 'tablet' ? '768px' : '375px'}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

// Browser Frame Component
function BrowserFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="border rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-lg">
      <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2 flex items-center gap-2 border-b">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
          <div className="w-3 h-3 rounded-full bg-green-400"></div>
        </div>
        <div className="flex-1 ml-4">
          <div className="bg-white dark:bg-slate-700 rounded-md px-3 py-1 text-xs text-slate-400 max-w-xs">yoursite.com/services</div>
        </div>
      </div>
      <div className="max-h-[500px] overflow-y-auto">
        {children}
      </div>
    </div>
  );
}

// List Preview Component
function ListPreview({ style, brandColor, device }: { style: ServicesListStyle; brandColor: string; device: PreviewDevice }) {
  const mockServices = [
    { id: 1, title: 'Dịch vụ tư vấn chuyên nghiệp', category: 'Tư vấn', price: 5000000, duration: '2-3 tuần' },
    { id: 2, title: 'Thiết kế website doanh nghiệp', category: 'Thiết kế', price: 15000000, duration: '4-6 tuần' },
    { id: 3, title: 'Marketing online tổng hợp', category: 'Marketing', price: 8000000, duration: '1 tháng' },
    { id: 4, title: 'Phát triển ứng dụng mobile', category: 'Phát triển', price: 25000000, duration: '8-12 tuần' },
  ];
  const categories = ['Tất cả', 'Tư vấn', 'Thiết kế', 'Marketing', 'Phát triển'];
  const formatPrice = (p: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);

  if (style === 'fullwidth') {
    return (
      <div className={cn("p-4", device === 'mobile' ? 'p-3' : '')}>
        <h2 className={cn("font-bold text-center mb-4", device === 'mobile' ? 'text-lg' : 'text-xl')}>Dịch vụ của chúng tôi</h2>
        <div className="bg-white border rounded-lg p-3 mb-4">
          <div className={cn("flex gap-2 items-center", device === 'mobile' ? 'flex-col' : '')}>
            <div className="flex-1 relative">
              <input type="text" placeholder="Tìm kiếm dịch vụ..." className="w-full px-3 py-1.5 border rounded-lg text-xs bg-slate-50" />
            </div>
            <div className="flex gap-1 flex-wrap">
              {categories.slice(0, device === 'mobile' ? 3 : 4).map((cat, i) => (
                <span key={cat} className={cn("px-2 py-1 rounded-full text-xs cursor-pointer", i === 0 ? "text-white" : "bg-slate-100")} style={i === 0 ? { backgroundColor: brandColor } : undefined}>
                  {cat}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="text-xs text-slate-500 mb-3">4 dịch vụ</div>
        <div className={cn("grid gap-3", device === 'mobile' ? 'grid-cols-1' : 'grid-cols-2')}>
          {mockServices.slice(0, device === 'mobile' ? 2 : 4).map((service) => (
            <div key={service.id} className="bg-white border rounded-lg overflow-hidden">
              <div className="aspect-video bg-slate-100 flex items-center justify-center">
                <Briefcase size={24} className="text-slate-300" />
              </div>
              <div className="p-3">
                <span className="text-xs font-medium" style={{ color: brandColor }}>{service.category}</span>
                <h3 className="font-medium text-sm mt-1 line-clamp-2">{service.title}</h3>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-slate-400">{service.duration}</span>
                  <span className="font-bold text-sm" style={{ color: brandColor }}>{formatPrice(service.price)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (style === 'sidebar') {
    return (
      <div className={cn("p-4 flex gap-4", device === 'mobile' ? 'p-3 flex-col' : '')}>
        <div className={cn("space-y-3", device === 'mobile' ? 'order-2' : 'w-1/3')}>
          <div className="bg-slate-50 rounded-lg p-3">
            <h4 className="font-medium text-xs mb-2">Tìm kiếm</h4>
            <input type="text" placeholder="Nhập từ khóa..." className="w-full px-2 py-1.5 border rounded text-xs" />
          </div>
          <div className="bg-slate-50 rounded-lg p-3">
            <h4 className="font-medium text-xs mb-2">Danh mục</h4>
            <div className="space-y-1">
              {categories.map((cat, i) => (
                <div key={cat} className={cn("px-2 py-1 rounded text-xs cursor-pointer", i === 0 ? "" : "text-slate-600")} style={i === 0 ? { backgroundColor: `${brandColor}15`, color: brandColor } : undefined}>
                  {cat}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className={cn("flex-1 space-y-3", device === 'mobile' ? 'order-1' : '')}>
          {mockServices.slice(0, 3).map((service) => (
            <div key={service.id} className="bg-white border rounded-lg overflow-hidden flex">
              <div className="w-24 h-16 bg-slate-100 flex items-center justify-center flex-shrink-0">
                <Briefcase size={16} className="text-slate-300" />
              </div>
              <div className="p-2 flex-1">
                <span className="text-xs font-medium px-1.5 py-0.5 rounded" style={{ backgroundColor: `${brandColor}15`, color: brandColor }}>{service.category}</span>
                <h3 className="font-medium text-xs mt-1 line-clamp-1">{service.title}</h3>
                <span className="text-xs font-bold" style={{ color: brandColor }}>{formatPrice(service.price)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Magazine Layout
  return (
    <div className={cn("p-4 space-y-4", device === 'mobile' ? 'p-3' : '')}>
      <div className={cn("grid gap-3", device === 'mobile' ? 'grid-cols-1' : 'grid-cols-3')}>
        <div className={cn("relative rounded-xl overflow-hidden bg-slate-900", device === 'mobile' ? '' : 'col-span-2 row-span-2')}>
          <div className={cn("bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center", device === 'mobile' ? 'aspect-video' : 'h-full min-h-[180px]')}>
            <Briefcase size={32} className="text-slate-600" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded text-xs font-medium text-white" style={{ backgroundColor: brandColor }}>Nổi bật</span>
            </div>
            <h3 className="font-bold text-sm text-white">{mockServices[0].title}</h3>
            <span className="text-white font-bold text-sm">{formatPrice(mockServices[0].price)}</span>
          </div>
        </div>
        {device !== 'mobile' && mockServices.slice(1, 3).map((service) => (
          <div key={service.id} className="relative rounded-lg overflow-hidden bg-slate-800">
            <div className="aspect-[16/10] bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center">
              <Briefcase size={16} className="text-slate-500" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-2">
              <span className="text-xs text-white/80 font-medium">{service.category}</span>
              <h4 className="font-semibold text-xs text-white line-clamp-2">{service.title}</h4>
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1 border-b border-slate-200">
        {categories.map((cat, i) => (
          <span key={cat} className={cn("px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap", i === 0 ? "text-white" : "text-slate-600 hover:bg-slate-100")} style={i === 0 ? { backgroundColor: brandColor } : undefined}>
            {cat}
          </span>
        ))}
      </div>
      <div className={cn("grid gap-3", device === 'mobile' ? 'grid-cols-1' : 'grid-cols-2')}>
        {mockServices.slice(0, device === 'mobile' ? 2 : 2).map((service) => (
          <div key={service.id} className="flex gap-3">
            <div className="w-16 h-12 rounded bg-slate-100 flex items-center justify-center flex-shrink-0">
              <Briefcase size={14} className="text-slate-300" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: brandColor }}>{service.category}</span>
              <h4 className="font-medium text-xs line-clamp-2 mt-0.5">{service.title}</h4>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Detail Preview Component
function DetailPreview({ style, brandColor, device }: { style: ServicesDetailStyle; brandColor: string; device: PreviewDevice }) {
  if (style === 'classic') {
    return (
      <div className={cn("p-4", device === 'mobile' ? 'p-3' : '')}>
        <div className="text-xs text-slate-400 mb-3">Trang chủ › Dịch vụ › Chi tiết</div>
        <div className={cn("flex gap-4", device === 'mobile' ? 'flex-col' : '')}>
          <div className="flex-1">
            <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: `${brandColor}15`, color: brandColor }}>Tư vấn</span>
            <h1 className="font-bold text-lg mt-2 mb-3">Dịch vụ tư vấn chuyên nghiệp</h1>
            <div className="aspect-video bg-slate-100 rounded-lg mb-3 flex items-center justify-center">
              <Briefcase size={32} className="text-slate-300" />
            </div>
            <div className="space-y-2">
              <div className="h-3 bg-slate-100 rounded w-full"></div>
              <div className="h-3 bg-slate-100 rounded w-5/6"></div>
            </div>
          </div>
          {device !== 'mobile' && (
            <div className="w-1/3">
              <div className="bg-slate-50 rounded-lg p-3 text-center">
                <p className="text-xs text-slate-500 mb-1">Giá dịch vụ</p>
                <p className="text-xl font-bold" style={{ color: brandColor }}>5.000.000 ₫</p>
                <p className="text-xs text-slate-500 mt-2">Thời gian: 2-3 tuần</p>
                <button className="w-full mt-3 py-2 text-white text-xs font-medium rounded-lg" style={{ backgroundColor: brandColor }}>Liên hệ tư vấn</button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (style === 'modern') {
    return (
      <div className="bg-white">
        <div className={cn("border-b border-slate-100", device === 'mobile' ? 'p-3' : 'p-4')}>
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: brandColor }}>Tư vấn</span>
          <h1 className={cn("font-bold text-slate-900 leading-tight mt-1", device === 'mobile' ? 'text-base' : 'text-lg')}>
            Dịch vụ tư vấn chuyên nghiệp
          </h1>
          <p className="text-xl font-bold mt-2" style={{ color: brandColor }}>5.000.000 ₫</p>
        </div>
        <div className="p-4">
          <div className="aspect-[16/9] bg-slate-100 rounded-lg flex items-center justify-center">
            <Briefcase size={24} className="text-slate-300" />
          </div>
        </div>
        <div className={cn("space-y-3", device === 'mobile' ? 'px-3 pb-3' : 'px-4 pb-4')}>
          <div className="h-3 bg-slate-100 rounded w-full"></div>
          <div className="h-3 bg-slate-100 rounded w-5/6"></div>
        </div>
        <div className="border-t border-slate-100 p-3 text-center">
          <span className="inline-flex items-center gap-1 text-xs font-medium text-white px-3 py-1.5 rounded-full" style={{ backgroundColor: brandColor }}>
            Liên hệ tư vấn
          </span>
        </div>
      </div>
    );
  }

  // Minimal
  return (
    <div className={cn("p-6", device === 'mobile' ? 'p-4' : '')}>
      <div className="text-center mb-4">
        <span className="text-xs font-medium uppercase tracking-wider" style={{ color: brandColor }}>Tư vấn</span>
        <h1 className="font-bold text-lg mt-2">Dịch vụ tư vấn chuyên nghiệp</h1>
        <p className="text-xl font-bold mt-2" style={{ color: brandColor }}>5.000.000 ₫</p>
      </div>
      <div className="aspect-[2/1] bg-slate-100 rounded-lg mb-4 flex items-center justify-center">
        <Briefcase size={32} className="text-slate-300" />
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-slate-100 rounded w-full"></div>
        <div className="h-3 bg-slate-100 rounded w-5/6"></div>
      </div>
    </div>
  );
}
