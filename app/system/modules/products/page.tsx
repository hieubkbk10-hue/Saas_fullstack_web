'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, usePaginatedQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { toast } from 'sonner';
import { Package, FolderTree, Tag, DollarSign, Box, Image, Loader2, Database, Trash2, RefreshCw, MessageSquare, Settings } from 'lucide-react';
import { FieldConfig } from '@/types/moduleConfig';
import { 
  ModuleHeader, ModuleStatus, ConventionNote, Code,
  SettingsCard, SettingInput, SettingSelect,
  FeaturesCard, FieldsCard
} from '@/components/modules/shared';
import { Card, Badge, Button, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/app/admin/components/ui';

const MODULE_KEY = 'products';
const CATEGORY_MODULE_KEY = 'productCategories';

const FEATURES_CONFIG = [
  { key: 'enableSalePrice', label: 'Giá khuyến mãi', icon: DollarSign, linkedField: 'salePrice' },
  { key: 'enableGallery', label: 'Thư viện ảnh', icon: Image, linkedField: 'images' },
  { key: 'enableSKU', label: 'Mã SKU', icon: Tag, linkedField: 'sku' },
  { key: 'enableStock', label: 'Quản lý kho', icon: Box, linkedField: 'stock' },
];

type FeaturesState = Record<string, boolean>;
type SettingsState = { productsPerPage: number; defaultStatus: string; lowStockThreshold: number };
type TabType = 'config' | 'data';

export default function ProductsModuleConfigPage() {
  const [activeTab, setActiveTab] = useState<TabType>('config');
  const moduleData = useQuery(api.admin.modules.getModuleByKey, { key: MODULE_KEY });
  const featuresData = useQuery(api.admin.modules.listModuleFeatures, { moduleKey: MODULE_KEY });
  const fieldsData = useQuery(api.admin.modules.listModuleFields, { moduleKey: MODULE_KEY });
  const categoryFieldsData = useQuery(api.admin.modules.listModuleFields, { moduleKey: CATEGORY_MODULE_KEY });
  const settingsData = useQuery(api.admin.modules.listModuleSettings, { moduleKey: MODULE_KEY });

  // FIX #6: Use stats instead of listAll for counts
  const productStats = useQuery(api.products.getStats);
  const categoryStats = useQuery(api.productCategories.listActive);
  
  // Data tab queries with pagination
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

  const [localFeatures, setLocalFeatures] = useState<FeaturesState>({});
  const [localProductFields, setLocalProductFields] = useState<FieldConfig[]>([]);
  const [localCategoryFields, setLocalCategoryFields] = useState<FieldConfig[]>([]);
  const [localSettings, setLocalSettings] = useState<SettingsState>({ productsPerPage: 12, defaultStatus: 'Draft', lowStockThreshold: 10 });
  const [isSaving, setIsSaving] = useState(false);

  const isLoading = moduleData === undefined || featuresData === undefined || 
                    fieldsData === undefined || categoryFieldsData === undefined || settingsData === undefined;

  // Sync features
  useEffect(() => {
    if (featuresData) {
      const features: FeaturesState = {};
      featuresData.forEach(f => { features[f.featureKey] = f.enabled; });
      setLocalFeatures(features);
    }
  }, [featuresData]);

  // Sync product fields
  useEffect(() => {
    if (fieldsData) {
      setLocalProductFields(fieldsData.map(f => ({
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

  // Sync category fields
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

  // Sync settings
  useEffect(() => {
    if (settingsData) {
      const productsPerPage = settingsData.find(s => s.settingKey === 'productsPerPage')?.value as number ?? 12;
      const defaultStatus = settingsData.find(s => s.settingKey === 'defaultStatus')?.value as string ?? 'Draft';
      const lowStockThreshold = settingsData.find(s => s.settingKey === 'lowStockThreshold')?.value as number ?? 10;
      setLocalSettings({ productsPerPage, defaultStatus, lowStockThreshold });
    }
  }, [settingsData]);

  // Server state for comparison
  const serverFeatures = useMemo(() => {
    const result: FeaturesState = {};
    featuresData?.forEach(f => { result[f.featureKey] = f.enabled; });
    return result;
  }, [featuresData]);

  const serverProductFields = useMemo(() => {
    return fieldsData?.map(f => ({ id: f._id, enabled: f.enabled })) || [];
  }, [fieldsData]);

  const serverCategoryFields = useMemo(() => {
    return categoryFieldsData?.map(f => ({ id: f._id, enabled: f.enabled })) || [];
  }, [categoryFieldsData]);

  const serverSettings = useMemo(() => {
    const productsPerPage = settingsData?.find(s => s.settingKey === 'productsPerPage')?.value as number ?? 12;
    const defaultStatus = settingsData?.find(s => s.settingKey === 'defaultStatus')?.value as string ?? 'Draft';
    const lowStockThreshold = settingsData?.find(s => s.settingKey === 'lowStockThreshold')?.value as number ?? 10;
    return { productsPerPage, defaultStatus, lowStockThreshold };
  }, [settingsData]);

  // Check for changes
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
    if (!field) return;
    
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
      for (const field of localProductFields) {
        const server = serverProductFields.find(s => s.id === field.id);
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

  // Data tab handlers
  const handleSeedAll = async () => {
    toast.loading('Đang tạo dữ liệu mẫu...');
    await seedProductsModule();
    await seedComments();
    await initStats();
    toast.dismiss();
    toast.success('Đã tạo dữ liệu mẫu thành công!');
  };

  const handleClearAll = async () => {
    if (!confirm('Xóa toàn bộ dữ liệu sản phẩm, danh mục và đánh giá?')) return;
    toast.loading('Đang xóa dữ liệu...');
    await clearComments();
    await clearProductsData();
    await initStats();
    toast.dismiss();
    toast.success('Đã xóa toàn bộ dữ liệu!');
  };

  const handleResetAll = async () => {
    if (!confirm('Reset toàn bộ dữ liệu về mặc định?')) return;
    toast.loading('Đang reset dữ liệu...');
    await clearComments();
    await clearProductsData();
    await seedProductsModule();
    await seedComments();
    await initStats();
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

  // Build category map for lookup (O(1))
  const categoryMap: Record<string, string> = {};
  categoryStats?.forEach(cat => { categoryMap[cat._id] = cat.name; });

  const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <ModuleHeader
        icon={Package}
        title="Module Sản phẩm"
        description="Cấu hình sản phẩm và danh mục"
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
              <SettingsCard>
                <SettingInput 
                  label="Số SP / trang" 
                  value={localSettings.productsPerPage} 
                  onChange={(v) => setLocalSettings({...localSettings, productsPerPage: v})}
                  focusColor="focus:border-orange-500"
                />
                <SettingSelect
                  label="Trạng thái mặc định"
                  value={localSettings.defaultStatus}
                  onChange={(v) => setLocalSettings({...localSettings, defaultStatus: v})}
                  options={[{ value: 'Draft', label: 'Bản nháp' }, { value: 'Active', label: 'Đang bán' }]}
                  focusColor="focus:border-orange-500"
                />
                <SettingInput 
                  label="Ngưỡng tồn kho thấp" 
                  value={localSettings.lowStockThreshold} 
                  onChange={(v) => setLocalSettings({...localSettings, lowStockThreshold: v})}
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
          {/* Action buttons */}
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

          {/* Statistics - FIX #6: Use stats queries instead of counting all */}
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

          {/* Products Table - Using paginated data */}
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
                      <Badge variant={product.status === 'Active' ? 'success' : product.status === 'Draft' ? 'secondary' : 'warning'}>
                        {product.status === 'Active' ? 'Đang bán' : product.status === 'Draft' ? 'Nháp' : 'Lưu trữ'}
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
                <Button variant="ghost" size="sm" onClick={() => loadMoreProducts(10)}>
                  Tải thêm sản phẩm
                </Button>
              </div>
            )}
          </Card>

          {/* Categories Table */}
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

          {/* Reviews Table - Using paginated data */}
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
                      <Badge variant={review.status === 'Approved' ? 'success' : review.status === 'Pending' ? 'secondary' : 'destructive'}>
                        {review.status === 'Approved' ? 'Đã duyệt' : review.status === 'Pending' ? 'Chờ duyệt' : 'Spam'}
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
                <Button variant="ghost" size="sm" onClick={() => loadMoreReviews(10)}>
                  Tải thêm đánh giá
                </Button>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
