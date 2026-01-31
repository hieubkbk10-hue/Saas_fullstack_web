'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useMutation, usePaginatedQuery, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { toast } from 'sonner';
import { Box, Database, DollarSign, Eye, FolderTree, Image, Loader2, MessageSquare, Monitor, Package, Palette, RefreshCw, Settings, ShoppingCart, Smartphone, Tablet, Tag, Trash2 } from 'lucide-react';
import type { FieldConfig } from '@/types/module-config';
import { 
  Code, ConventionNote, FeaturesCard, FieldsCard,
  ModuleHeader, ModuleStatus, SettingInput,
  SettingSelect, SettingsCard
} from '@/components/modules/shared';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, cn } from '@/app/admin/components/ui';

const MODULE_KEY = 'products';
const CATEGORY_MODULE_KEY = 'productCategories';

const FEATURES_CONFIG = [
  { icon: DollarSign, key: 'enableSalePrice', label: 'Giá khuyến mãi', linkedField: 'salePrice' },
  { icon: Image, key: 'enableGallery', label: 'Thư viện ảnh', linkedField: 'images' },
  { icon: Tag, key: 'enableSKU', label: 'Mã SKU', linkedField: 'sku' },
  { icon: Box, key: 'enableStock', label: 'Quản lý kho', linkedField: 'stock' },
];

type FeaturesState = Record<string, boolean>;
interface SettingsState { productsPerPage: number; defaultStatus: string; lowStockThreshold: number }
type TabType = 'config' | 'data' | 'appearance';
type ProductsListStyle = 'grid' | 'list' | 'catalog';
type ProductsDetailStyle = 'classic' | 'modern' | 'minimal';
type PreviewDevice = 'desktop' | 'tablet' | 'mobile';

const LIST_STYLES: { id: ProductsListStyle; label: string; description: string }[] = [
  { description: 'Lưới sản phẩm với filter bar, phổ biến nhất', id: 'grid', label: 'Grid' },
  { description: 'Danh sách dọc với ảnh thumbnail, phù hợp so sánh', id: 'list', label: 'List' },
  { description: 'Kiểu catalog với sidebar danh mục', id: 'catalog', label: 'Catalog' },
];

const DETAIL_STYLES: { id: ProductsDetailStyle; label: string; description: string }[] = [
  { description: 'Layout 2 cột với gallery và info', id: 'classic', label: 'Classic' },
  { description: 'Full-width hero, landing page style', id: 'modern', label: 'Modern' },
  { description: 'Tối giản, tập trung sản phẩm', id: 'minimal', label: 'Minimal' },
];

const deviceWidths = {
  desktop: 'w-full',
  mobile: 'w-[375px] max-w-full',
  tablet: 'w-[768px] max-w-full'
};

const devices = [
  { icon: Monitor, id: 'desktop' as const, label: 'Desktop' },
  { icon: Tablet, id: 'tablet' as const, label: 'Tablet' },
  { icon: Smartphone, id: 'mobile' as const, label: 'Mobile' }
];

export default function ProductsModuleConfigPage() {
  const [activeTab, setActiveTab] = useState<TabType>('config');
  const moduleData = useQuery(api.admin.modules.getModuleByKey, { key: MODULE_KEY });
  const featuresData = useQuery(api.admin.modules.listModuleFeatures, { moduleKey: MODULE_KEY });
  const fieldsData = useQuery(api.admin.modules.listModuleFields, { moduleKey: MODULE_KEY });
  const categoryFieldsData = useQuery(api.admin.modules.listModuleFields, { moduleKey: CATEGORY_MODULE_KEY });
  const settingsData = useQuery(api.admin.modules.listModuleSettings, { moduleKey: MODULE_KEY });

  const productStats = useQuery(api.products.getStats);
  const categoryStats = useQuery(api.productCategories.listActive);
  
  const { results: productsData, status: productsStatus, loadMore: loadMoreProducts } = usePaginatedQuery(
    api.products.list,
    {},
    { initialNumItems: 10 }
  );
  const { results: reviewsData, status: reviewsStatus, loadMore: loadMoreReviews } = usePaginatedQuery(
    api.comments.listByTargetTypePaginated,
    { targetType: "product" },
    { initialNumItems: 10 }
  );

  const toggleFeature = useMutation(api.admin.modules.toggleModuleFeature);
  const updateField = useMutation(api.admin.modules.updateModuleField);
  const setSetting = useMutation(api.admin.modules.setModuleSetting);
  const seedProductsModule = useMutation(api.seed.seedProductsModule);
  const clearProductsData = useMutation(api.seed.clearProductsData);
  const seedComments = useMutation(api.seed.seedComments);
  const clearComments = useMutation(api.seed.clearComments);
  const initStats = useMutation(api.products.initStats);
  const setMultipleSettings = useMutation(api.settings.setMultiple);

  // Appearance tab queries
  const listStyleSetting = useQuery(api.settings.getByKey, { key: 'products_list_style' });
  const detailStyleSetting = useQuery(api.settings.getByKey, { key: 'products_detail_style' });
  const brandColorSetting = useQuery(api.settings.getByKey, { key: 'site_brand_color' });

  const [localFeatures, setLocalFeatures] = useState<FeaturesState>({});
  const [localProductFields, setLocalProductFields] = useState<FieldConfig[]>([]);
  const [localCategoryFields, setLocalCategoryFields] = useState<FieldConfig[]>([]);
  const [localSettings, setLocalSettings] = useState<SettingsState>({ defaultStatus: 'Draft', lowStockThreshold: 10, productsPerPage: 12 });
  const [isSaving, setIsSaving] = useState(false);

  // Appearance tab states
  const [listStyle, setListStyle] = useState<ProductsListStyle>('grid');
  const [detailStyle, setDetailStyle] = useState<ProductsDetailStyle>('classic');
  const [previewDevice, setPreviewDevice] = useState<PreviewDevice>('desktop');
  const [activePreview, setActivePreview] = useState<'list' | 'detail'>('list');
  const [appearanceHasChanges, setAppearanceHasChanges] = useState(false);

  const brandColor = (brandColorSetting?.value as string) || '#f97316';

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
      setLocalProductFields(fieldsData.map(f => ({
        enabled: f.enabled,
        id: f._id,
        isSystem: f.isSystem,
        key: f.fieldKey,
        linkedFeature: f.linkedFeature,
        name: f.name,
        required: f.required,
        type: f.type,
      })));
    }
  }, [fieldsData]);

  useEffect(() => {
    if (categoryFieldsData) {
      setLocalCategoryFields(categoryFieldsData.map(f => ({
        enabled: f.enabled,
        id: f._id,
        isSystem: f.isSystem,
        key: f.fieldKey,
        name: f.name,
        required: f.required,
        type: f.type,
      })));
    }
  }, [categoryFieldsData]);

  useEffect(() => {
    if (settingsData) {
      const productsPerPage = settingsData.find(s => s.settingKey === 'productsPerPage')?.value as number ?? 12;
      const defaultStatus = settingsData.find(s => s.settingKey === 'defaultStatus')?.value as string ?? 'Draft';
      const lowStockThreshold = settingsData.find(s => s.settingKey === 'lowStockThreshold')?.value as number ?? 10;
      setLocalSettings({ defaultStatus, lowStockThreshold, productsPerPage });
    }
  }, [settingsData]);

  // Sync appearance settings
  useEffect(() => {
    if (listStyleSetting?.value) {
      setListStyle(listStyleSetting.value as ProductsListStyle);
    }
    if (detailStyleSetting?.value) {
      setDetailStyle(detailStyleSetting.value as ProductsDetailStyle);
    }
  }, [listStyleSetting, detailStyleSetting]);

  const serverFeatures = useMemo(() => {
    const result: FeaturesState = {};
    featuresData?.forEach(f => { result[f.featureKey] = f.enabled; });
    return result;
  }, [featuresData]);

  const serverProductFields = useMemo(() => fieldsData?.map(f => ({ enabled: f.enabled, id: f._id })) ?? [], [fieldsData]);

  const serverCategoryFields = useMemo(() => categoryFieldsData?.map(f => ({ enabled: f.enabled, id: f._id })) ?? [], [categoryFieldsData]);

  const serverSettings = useMemo(() => {
    const productsPerPage = settingsData?.find(s => s.settingKey === 'productsPerPage')?.value as number ?? 12;
    const defaultStatus = settingsData?.find(s => s.settingKey === 'defaultStatus')?.value as string ?? 'Draft';
    const lowStockThreshold = settingsData?.find(s => s.settingKey === 'lowStockThreshold')?.value as number ?? 10;
    return { defaultStatus, lowStockThreshold, productsPerPage };
  }, [settingsData]);

  const hasChanges = useMemo(() => {
    const featuresChanged = Object.keys(localFeatures).some(key => localFeatures[key] !== serverFeatures[key]);
    const productFieldsChanged = localProductFields.some(f => {
      const server = serverProductFields.find(s => s.id === f.id);
      return server && f.enabled !== server.enabled;
    });
    const categoryFieldsChanged = localCategoryFields.some(f => {
      const server = serverCategoryFields.find(s => s.id === f.id);
      return server && f.enabled !== server.enabled;
    });
    const settingsChanged = localSettings.productsPerPage !== serverSettings.productsPerPage ||
                           localSettings.defaultStatus !== serverSettings.defaultStatus ||
                           localSettings.lowStockThreshold !== serverSettings.lowStockThreshold;
    return featuresChanged || productFieldsChanged || categoryFieldsChanged || settingsChanged;
  }, [localFeatures, serverFeatures, localProductFields, serverProductFields, localCategoryFields, serverCategoryFields, localSettings, serverSettings]);

  const handleToggleFeature = (key: string) => {
    const newFeatureState = !localFeatures[key];
    setLocalFeatures(prev => ({ ...prev, [key]: newFeatureState }));
    setLocalProductFields(prev => prev.map(f => 
      f.linkedFeature === key ? { ...f, enabled: newFeatureState } : f
    ));
  };

  const handleToggleProductField = (id: string) => {
    const field = localProductFields.find(f => f.id === id);
    if (!field) {return;}
    
    const newFieldState = !field.enabled;
    setLocalProductFields(prev => {
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
          promises.push(toggleFeature({ enabled: localFeatures[key], featureKey: key, moduleKey: MODULE_KEY }));
        }
      }
      for (const field of localProductFields) {
        const server = serverProductFields.find(s => s.id === field.id);
        if (server && field.enabled !== server.enabled) {
          promises.push(updateField({ enabled: field.enabled, id: field.id as Id<"moduleFields"> }));
        }
      }
      for (const field of localCategoryFields) {
        const server = serverCategoryFields.find(s => s.id === field.id);
        if (server && field.enabled !== server.enabled) {
          promises.push(updateField({ enabled: field.enabled, id: field.id as Id<"moduleFields"> }));
        }
      }
      if (localSettings.productsPerPage !== serverSettings.productsPerPage) {
        promises.push(setSetting({ moduleKey: MODULE_KEY, settingKey: 'productsPerPage', value: localSettings.productsPerPage }));
      }
      if (localSettings.defaultStatus !== serverSettings.defaultStatus) {
        promises.push(setSetting({ moduleKey: MODULE_KEY, settingKey: 'defaultStatus', value: localSettings.defaultStatus }));
      }
      if (localSettings.lowStockThreshold !== serverSettings.lowStockThreshold) {
        promises.push(setSetting({ moduleKey: MODULE_KEY, settingKey: 'lowStockThreshold', value: localSettings.lowStockThreshold }));
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
    await seedProductsModule();
    await seedComments();
    await initStats();
    toast.dismiss();
    toast.success('Đã tạo dữ liệu mẫu thành công!');
  };

  const handleClearAll = async () => {
    if (!confirm('Xóa toàn bộ dữ liệu sản phẩm, danh mục và đánh giá?')) {return;}
    toast.loading('Đang xóa dữ liệu...');
    await clearComments();
    await clearProductsData();
    await initStats();
    toast.dismiss();
    toast.success('Đã xóa toàn bộ dữ liệu!');
  };

  const handleResetAll = async () => {
    if (!confirm('Reset toàn bộ dữ liệu về mặc định?')) {return;}
    toast.loading('Đang reset dữ liệu...');
    await clearComments();
    await clearProductsData();
    await seedProductsModule();
    await seedComments();
    await initStats();
    toast.dismiss();
    toast.success('Đã reset dữ liệu thành công!');
  };

  // Appearance tab handlers
  const handleListStyleChange = (style: ProductsListStyle) => {
    setListStyle(style);
    setAppearanceHasChanges(true);
  };

  const handleDetailStyleChange = (style: ProductsDetailStyle) => {
    setDetailStyle(style);
    setAppearanceHasChanges(true);
  };

  const handleSaveAppearance = async () => {
    setIsSaving(true);
    try {
      await setMultipleSettings({
        settings: [
          { group: 'products', key: 'products_list_style', value: listStyle },
          { group: 'products', key: 'products_detail_style', value: detailStyle },
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
        <Loader2 size={32} className="animate-spin text-orange-500" />
      </div>
    );
  }

  const categoryMap: Record<string, string> = {};
  categoryStats?.forEach(cat => { categoryMap[cat._id] = cat.name; });

  const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN', { currency: 'VND', style: 'currency' }).format(price);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <ModuleHeader
        icon={Package}
        title="Module Sản phẩm"
        description="Cấu hình sản phẩm và danh mục"
        iconBgClass="bg-orange-500/10"
        iconTextClass="text-orange-600 dark:text-orange-400"
        buttonClass="bg-orange-600 hover:bg-orange-500"
        onSave={activeTab === 'config' ? handleSave : (activeTab === 'appearance' ? handleSaveAppearance : undefined)}
        hasChanges={activeTab === 'config' ? hasChanges : (activeTab === 'appearance' ? appearanceHasChanges : false)}
        isSaving={isSaving}
      />

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700">
        <button
          onClick={() =>{  setActiveTab('config'); }}
          className={cn(
            "flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors",
            activeTab === 'config'
              ? "border-orange-500 text-orange-600 dark:text-orange-400"
              : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          )}
        >
          <Settings size={16} /> Cấu hình
        </button>
        <button
          onClick={() =>{  setActiveTab('data'); }}
          className={cn(
            "flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors",
            activeTab === 'data'
              ? "border-orange-500 text-orange-600 dark:text-orange-400"
              : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          )}
        >
          <Database size={16} /> Dữ liệu
        </button>
        <button
          onClick={() =>{  setActiveTab('appearance'); }}
          className={cn(
            "flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors",
            activeTab === 'appearance'
              ? "border-orange-500 text-orange-600 dark:text-orange-400"
              : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          )}
        >
          <Palette size={16} /> Giao diện
        </button>
      </div>

      {activeTab === 'config' && (
        <>
          <ModuleStatus isCore={moduleData?.isCore ?? false} enabled={moduleData?.enabled ?? true} toggleColor="bg-orange-500" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="space-y-4">
              <SettingsCard>
                <SettingInput 
                  label="Số SP / trang" 
                  value={localSettings.productsPerPage} 
                  onChange={(v) =>{  setLocalSettings({...localSettings, productsPerPage: v}); }}
                  focusColor="focus:border-orange-500"
                />
                <SettingSelect
                  label="Trạng thái mặc định"
                  value={localSettings.defaultStatus}
                  onChange={(v) =>{  setLocalSettings({...localSettings, defaultStatus: v}); }}
                  options={[{ label: 'Bản nháp', value: 'Draft' }, { label: 'Đang bán', value: 'Active' }]}
                  focusColor="focus:border-orange-500"
                />
                <SettingInput 
                  label="Ngưỡng tồn kho thấp" 
                  value={localSettings.lowStockThreshold} 
                  onChange={(v) =>{  setLocalSettings({...localSettings, lowStockThreshold: v}); }}
                  focusColor="focus:border-orange-500"
                />
              </SettingsCard>

              <FeaturesCard
                features={FEATURES_CONFIG.map(f => ({ config: f, enabled: localFeatures[f.key] ?? false }))}
                onToggle={handleToggleFeature}
                toggleColor="bg-orange-500"
              />
            </div>

            <FieldsCard
              title="Trường sản phẩm"
              icon={Package}
              iconColorClass="text-orange-500"
              fields={localProductFields}
              onToggle={handleToggleProductField}
              fieldColorClass="bg-orange-500/10 text-orange-600 dark:text-orange-400"
              toggleColor="bg-orange-500"
            />

            <FieldsCard
              title="Trường danh mục"
              icon={FolderTree}
              iconColorClass="text-amber-500"
              fields={localCategoryFields}
              onToggle={handleToggleCategoryField}
              fieldColorClass="bg-amber-500/10 text-amber-600 dark:text-amber-400"
              toggleColor="bg-amber-500"
            />
          </div>

          <ConventionNote>
            <strong>Convention:</strong> Slug tự động từ tên. <Code>SKU</Code> phải unique. Trường <Code>price</Code> và <Code>status</Code> bắt buộc.
          </ConventionNote>
        </>
      )}

      {activeTab === 'data' && (
        <div className="space-y-6">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">Quản lý dữ liệu mẫu</h3>
                <p className="text-sm text-slate-500 mt-1">Seed, clear hoặc reset dữ liệu cho module sản phẩm</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleSeedAll} className="gap-2">
                  <Database size={16} /> Seed Data
                </Button>
                <Button variant="outline" onClick={handleClearAll} className="gap-2 text-red-500 hover:text-red-600">
                  <Trash2 size={16} /> Clear All
                </Button>
                <Button onClick={handleResetAll} className="gap-2 bg-orange-600 hover:bg-orange-500">
                  <RefreshCw size={16} /> Reset
                </Button>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <Package className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{productStats?.total ?? 0}</p>
                  <p className="text-sm text-slate-500">Sản phẩm</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 rounded-lg">
                  <FolderTree className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{categoryStats?.length ?? 0}</p>
                  <p className="text-sm text-slate-500">Danh mục</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{reviewsData?.length ?? 0}+</p>
                  <p className="text-sm text-slate-500">Đánh giá</p>
                </div>
              </div>
            </Card>
          </div>

          <Card>
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <Package className="w-5 h-5 text-orange-500" />
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">Sản phẩm ({productStats?.total ?? 0})</h3>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên sản phẩm</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Danh mục</TableHead>
                  <TableHead className="text-right">Giá</TableHead>
                  <TableHead className="text-center">Tồn kho</TableHead>
                  <TableHead>Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productsData?.map(product => (
                  <TableRow key={product._id}>
                    <TableCell className="font-medium max-w-[200px] truncate">{product.name}</TableCell>
                    <TableCell className="font-mono text-xs text-slate-500">{product.sku}</TableCell>
                    <TableCell><Badge variant="secondary">{categoryMap[product.categoryId] || 'N/A'}</Badge></TableCell>
                    <TableCell className="text-right">
                      {product.salePrice ? (
                        <span className="text-red-500">{formatPrice(product.salePrice)}</span>
                      ) : (
                        formatPrice(product.price)
                      )}
                    </TableCell>
                    <TableCell className={`text-center ${product.stock < 10 ? 'text-red-500 font-medium' : ''}`}>{product.stock}</TableCell>
                    <TableCell>
                      <Badge variant={product.status === 'Active' ? 'success' : (product.status === 'Draft' ? 'secondary' : 'warning')}>
                        {product.status === 'Active' ? 'Đang bán' : (product.status === 'Draft' ? 'Nháp' : 'Lưu trữ')}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {(!productsData || productsData.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                      Chưa có sản phẩm nào. Nhấn &quot;Seed Data&quot; để tạo dữ liệu mẫu.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            {productsStatus === 'CanLoadMore' && (
              <div className="p-3 border-t border-slate-100 dark:border-slate-800 text-center">
                <Button variant="ghost" size="sm" onClick={() =>{  loadMoreProducts(10); }}>
                  Tải thêm sản phẩm
                </Button>
              </div>
            )}
          </Card>

          <Card>
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <FolderTree className="w-5 h-5 text-amber-500" />
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">Danh mục ({categoryStats?.length ?? 0})</h3>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên danh mục</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categoryStats?.map(cat => (
                  <TableRow key={cat._id}>
                    <TableCell className="font-medium">{cat.name}</TableCell>
                    <TableCell className="text-slate-500 font-mono text-sm">{cat.slug}</TableCell>
                    <TableCell>
                      <Badge variant={cat.active ? 'success' : 'secondary'}>{cat.active ? 'Hoạt động' : 'Ẩn'}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {(!categoryStats || categoryStats.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8 text-slate-500">
                      Chưa có danh mục nào.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>

          <Card>
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-500" />
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">Đánh giá sản phẩm</h3>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Người đánh giá</TableHead>
                  <TableHead>Nội dung</TableHead>
                  <TableHead>Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reviewsData?.map(review => (
                  <TableRow key={review._id}>
                    <TableCell className="font-medium">{review.authorName}</TableCell>
                    <TableCell className="text-slate-600 dark:text-slate-400 max-w-xs truncate">{review.content}</TableCell>
                    <TableCell>
                      <Badge variant={review.status === 'Approved' ? 'success' : (review.status === 'Pending' ? 'secondary' : 'destructive')}>
                        {review.status === 'Approved' ? 'Đã duyệt' : (review.status === 'Pending' ? 'Chờ duyệt' : 'Spam')}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {(!reviewsData || reviewsData.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8 text-slate-500">
                      Chưa có đánh giá nào.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            {reviewsStatus === 'CanLoadMore' && (
              <div className="p-3 border-t border-slate-100 dark:border-slate-800 text-center">
                <Button variant="ghost" size="sm" onClick={() =>{  loadMoreReviews(10); }}>
                  Tải thêm đánh giá
                </Button>
              </div>
            )}
          </Card>
        </div>
      )}

      {activeTab === 'appearance' && (
        <div className="space-y-6">
          {/* Compact Style Selectors */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-shrink-0">
                  <h3 className="font-medium text-sm text-slate-900 dark:text-slate-100">Trang danh sách</h3>
                  <p className="text-xs text-slate-500">/products</p>
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
                          ? "bg-orange-500 text-white shadow-sm" 
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                      )}
                    >
                      {style.label}
                    </button>
                  ))}
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-shrink-0">
                  <h3 className="font-medium text-sm text-slate-900 dark:text-slate-100">Trang chi tiết</h3>
                  <p className="text-xs text-slate-500">/products/[slug]</p>
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
                          ? "bg-orange-500 text-white shadow-sm" 
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
                  <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                    <button
                      onClick={() =>{  setActivePreview('list'); }}
                      className={cn(
                        "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                        activePreview === 'list' ? "bg-white dark:bg-slate-700 shadow-sm" : "text-slate-500"
                      )}
                    >
                      Danh sách
                    </button>
                    <button
                      onClick={() =>{  setActivePreview('detail'); }}
                      className={cn(
                        "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                        activePreview === 'detail' ? "bg-white dark:bg-slate-700 shadow-sm" : "text-slate-500"
                      )}
                    >
                      Chi tiết
                    </button>
                  </div>
                  <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                    {devices.map((d) => (
                      <button
                        key={d.id}
                        onClick={() =>{  setPreviewDevice(d.id); }}
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
                {activePreview === 'list' ? 'Trang /products' : 'Trang /products/[slug]'}
                {' • '}Style: <strong>{activePreview === 'list' ? LIST_STYLES.find(s => s.id === listStyle)?.label : DETAIL_STYLES.find(s => s.id === detailStyle)?.label}</strong>
                {' • '}{previewDevice === 'desktop' ? '1920px' : (previewDevice === 'tablet' ? '768px' : '375px')}
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
          <div className="bg-white dark:bg-slate-700 rounded-md px-3 py-1 text-xs text-slate-400 max-w-xs">yoursite.com/products</div>
        </div>
      </div>
      <div className="max-h-[500px] overflow-y-auto">
        {children}
      </div>
    </div>
  );
}

// List Preview Component
function ListPreview({ style, brandColor, device }: { style: ProductsListStyle; brandColor: string; device: PreviewDevice }) {
  const mockProducts = [
    { category: 'Điện thoại', id: 1, name: 'iPhone 15 Pro Max 256GB', price: 29_990_000, salePrice: 27_990_000 },
    { category: 'Laptop', id: 2, name: 'MacBook Air M2 13 inch', price: 27_990_000, salePrice: null },
    { category: 'Phụ kiện', id: 3, name: 'AirPods Pro 2', price: 5_990_000, salePrice: 4_990_000 },
    { category: 'Đồng hồ', id: 4, name: 'Apple Watch Series 9', price: 11_990_000, salePrice: null },
  ];
  const categories = ['Tất cả', 'Điện thoại', 'Laptop', 'Phụ kiện', 'Đồng hồ'];
  const formatPrice = (p: number) => new Intl.NumberFormat('vi-VN', { currency: 'VND', style: 'currency' }).format(p);

  if (style === 'grid') {
    return (
      <div className={cn("p-4", device === 'mobile' ? 'p-3' : '')}>
        <h2 className={cn("font-bold text-center mb-4", device === 'mobile' ? 'text-lg' : 'text-xl')}>Sản phẩm</h2>
        <div className="bg-white border rounded-lg p-3 mb-4">
          <div className={cn("flex gap-2 items-center", device === 'mobile' ? 'flex-col' : '')}>
            <div className="flex-1 relative">
              <input type="text" placeholder="Tìm kiếm sản phẩm..." className="w-full px-3 py-1.5 border rounded-lg text-xs bg-slate-50" />
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
        <div className={cn("grid gap-3", device === 'mobile' ? 'grid-cols-2' : 'grid-cols-4')}>
          {mockProducts.slice(0, device === 'mobile' ? 4 : 4).map((product) => (
            <div key={product.id} className="bg-white border rounded-lg overflow-hidden">
              <div className="aspect-square bg-slate-100 flex items-center justify-center relative">
                <Package size={24} className="text-slate-300" />
                {product.salePrice && (
                  <span className="absolute top-1 left-1 px-1.5 py-0.5 bg-red-500 text-white text-xs font-bold rounded">
                    -{Math.round((1 - product.salePrice / product.price) * 100)}%
                  </span>
                )}
              </div>
              <div className="p-2">
                <span className="text-xs text-slate-400">{product.category}</span>
                <h3 className="font-medium text-xs mt-0.5 line-clamp-2">{product.name}</h3>
                <div className="flex items-center gap-1 mt-1">
                  <span className="font-bold text-xs" style={{ color: brandColor }}>{formatPrice(product.salePrice ?? product.price)}</span>
                  {product.salePrice && (
                    <span className="text-xs text-slate-400 line-through">{formatPrice(product.price)}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (style === 'list') {
    return (
      <div className={cn("p-4", device === 'mobile' ? 'p-3' : '')}>
        <h2 className={cn("font-bold text-center mb-4", device === 'mobile' ? 'text-lg' : 'text-xl')}>Sản phẩm</h2>
        <div className="space-y-3">
          {mockProducts.slice(0, 3).map((product) => (
            <div key={product.id} className="bg-white border rounded-lg overflow-hidden flex">
              <div className={cn("bg-slate-100 flex items-center justify-center flex-shrink-0 relative", device === 'mobile' ? 'w-20 h-20' : 'w-28 h-24')}>
                <Package size={20} className="text-slate-300" />
                {product.salePrice && (
                  <span className="absolute top-1 left-1 px-1 py-0.5 bg-red-500 text-white text-xs font-bold rounded">
                    -{Math.round((1 - product.salePrice / product.price) * 100)}%
                  </span>
                )}
              </div>
              <div className="p-3 flex-1 flex flex-col justify-center">
                <span className="text-xs text-slate-400">{product.category}</span>
                <h3 className="font-medium text-sm line-clamp-1">{product.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-bold text-sm" style={{ color: brandColor }}>{formatPrice(product.salePrice ?? product.price)}</span>
                  {product.salePrice && (
                    <span className="text-xs text-slate-400 line-through">{formatPrice(product.price)}</span>
                  )}
                </div>
              </div>
              {device !== 'mobile' && (
                <div className="p-3 flex items-center">
                  <button className="p-2 rounded-full border" style={{ borderColor: brandColor, color: brandColor }}>
                    <ShoppingCart size={14} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Catalog Layout
  return (
    <div className={cn("p-4 flex gap-4", device === 'mobile' ? 'p-3 flex-col' : '')}>
      <div className={cn("space-y-3", device === 'mobile' ? 'order-2' : 'w-1/4')}>
        <div className="bg-slate-50 rounded-lg p-3">
          <h4 className="font-medium text-xs mb-2">Danh mục</h4>
          <div className="space-y-1">
            {categories.map((cat, i) => (
              <div key={cat} className={cn("px-2 py-1.5 rounded text-xs cursor-pointer", i === 0 ? "" : "text-slate-600 hover:bg-slate-100")} style={i === 0 ? { backgroundColor: `${brandColor}15`, color: brandColor } : undefined}>
                {cat}
              </div>
            ))}
          </div>
        </div>
        <div className="bg-slate-50 rounded-lg p-3">
          <h4 className="font-medium text-xs mb-2">Khoảng giá</h4>
          <div className="space-y-1 text-xs text-slate-600">
            <div className="flex items-center gap-2"><input type="checkbox" /> Dưới 5 triệu</div>
            <div className="flex items-center gap-2"><input type="checkbox" /> 5 - 15 triệu</div>
            <div className="flex items-center gap-2"><input type="checkbox" /> Trên 15 triệu</div>
          </div>
        </div>
      </div>
      <div className={cn("flex-1", device === 'mobile' ? 'order-1' : '')}>
        <div className={cn("grid gap-3", device === 'mobile' ? 'grid-cols-2' : 'grid-cols-3')}>
          {mockProducts.slice(0, device === 'mobile' ? 4 : 3).map((product) => (
            <div key={product.id} className="bg-white border rounded-lg overflow-hidden">
              <div className="aspect-square bg-slate-100 flex items-center justify-center relative">
                <Package size={20} className="text-slate-300" />
                {product.salePrice && (
                  <span className="absolute top-1 left-1 px-1 py-0.5 bg-red-500 text-white text-xs font-bold rounded">
                    Sale
                  </span>
                )}
              </div>
              <div className="p-2">
                <h3 className="font-medium text-xs line-clamp-2">{product.name}</h3>
                <span className="font-bold text-xs block mt-1" style={{ color: brandColor }}>{formatPrice(product.salePrice ?? product.price)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Detail Preview Component
function DetailPreview({ style, brandColor, device }: { style: ProductsDetailStyle; brandColor: string; device: PreviewDevice }) {
  const formatPrice = (p: number) => new Intl.NumberFormat('vi-VN', { currency: 'VND', style: 'currency' }).format(p);

  if (style === 'classic') {
    return (
      <div className={cn("p-4", device === 'mobile' ? 'p-3' : '')}>
        <div className="text-xs text-slate-400 mb-3">Trang chủ › Sản phẩm › Chi tiết</div>
        <div className={cn("flex gap-4", device === 'mobile' ? 'flex-col' : '')}>
          <div className={cn(device === 'mobile' ? '' : 'w-1/2')}>
            <div className="aspect-square bg-slate-100 rounded-lg flex items-center justify-center relative">
              <Package size={48} className="text-slate-300" />
              <span className="absolute top-2 left-2 px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded">-7%</span>
            </div>
            <div className="flex gap-2 mt-2">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-12 h-12 bg-slate-100 rounded flex items-center justify-center">
                  <Package size={12} className="text-slate-300" />
                </div>
              ))}
            </div>
          </div>
          <div className={cn(device === 'mobile' ? '' : 'w-1/2')}>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: `${brandColor}15`, color: brandColor }}>Điện thoại</span>
            <h1 className="font-bold text-lg mt-2">iPhone 15 Pro Max 256GB</h1>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xl font-bold" style={{ color: brandColor }}>{formatPrice(27_990_000)}</span>
              <span className="text-sm text-slate-400 line-through">{formatPrice(29_990_000)}</span>
            </div>
            <div className="flex items-center gap-2 mt-3 text-xs text-green-600">
              <span className="w-2 h-2 bg-green-500 rounded-full" />
              Còn hàng
            </div>
            <div className="mt-4 flex gap-2">
              <button className="flex-1 py-2 rounded-lg text-white text-sm font-medium flex items-center justify-center gap-2" style={{ backgroundColor: brandColor }}>
                <ShoppingCart size={16} /> Thêm vào giỏ
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (style === 'modern') {
    return (
      <div className="bg-white">
        <div className={cn("p-4", device === 'mobile' ? 'p-3' : '')} style={{ backgroundColor: `${brandColor}06` }}>
          <span className="inline-flex items-center rounded-full bg-white/80 px-3 py-1 text-xs font-semibold" style={{ color: brandColor }}>Điện thoại</span>
          <h1 className={cn("font-bold text-slate-900 leading-tight mt-2", device === 'mobile' ? 'text-lg' : 'text-xl')}>
            iPhone 15 Pro Max 256GB
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-xl font-bold" style={{ color: brandColor }}>{formatPrice(27_990_000)}</span>
            <span className="text-xs text-slate-400 line-through">{formatPrice(29_990_000)}</span>
            <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-semibold rounded-full">-7%</span>
          </div>
          <button className="mt-4 px-6 py-2.5 rounded-full text-white text-sm font-medium flex items-center gap-2" style={{ backgroundColor: brandColor }}>
            <ShoppingCart size={16} /> Mua ngay
          </button>
        </div>
        <div className="p-4">
          <div className="aspect-[4/3] bg-slate-100 rounded-xl flex items-center justify-center">
            <Package size={32} className="text-slate-300" />
          </div>
        </div>
        <div className={cn("px-4 pb-4 space-y-2", device === 'mobile' ? 'px-3 pb-3' : '')}>
          <div className="h-3 bg-slate-100 rounded w-full"></div>
          <div className="h-3 bg-slate-100 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  // Minimal
  return (
    <div className={cn("p-4", device === 'mobile' ? 'p-3' : '')}>
      <div className="text-[10px] text-slate-400 mb-3">Trang chủ › Sản phẩm › Chi tiết</div>
      <div className={cn("grid gap-4", device === 'mobile' ? '' : 'grid-cols-[1fr_0.8fr]')}>
        <div className="aspect-[4/5] bg-slate-100 rounded-sm flex items-center justify-center">
          <Package size={32} className="text-slate-300" />
        </div>
        <div className="flex flex-col justify-center">
          <span className="text-xs uppercase tracking-wider text-slate-400">Điện thoại</span>
          <h1 className="font-semibold text-sm mt-2 text-slate-900">iPhone 15 Pro Max 256GB</h1>
          <div className="text-base font-semibold mt-2" style={{ color: brandColor }}>{formatPrice(27_990_000)}</div>
          <button className="mt-4 h-10 bg-black text-white text-xs uppercase tracking-wider font-medium">
            Thêm vào giỏ
          </button>
        </div>
      </div>
    </div>
  );
}
