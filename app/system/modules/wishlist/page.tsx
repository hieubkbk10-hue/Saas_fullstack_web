'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { toast } from 'sonner';
import { Bell, Database, Heart, Loader2, Package, RefreshCw, Settings, Trash2, User } from 'lucide-react';
import type { FieldConfig } from '@/types/module-config';
import { 
  Code, ConventionNote, FeaturesCard, FieldsCard,
  ModuleHeader, ModuleStatus,
  SettingInput, SettingsCard
} from '@/components/modules/shared';
import { Button, Card, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/admin/components/ui';

const MODULE_KEY = 'wishlist';

const FEATURES_CONFIG = [
  { description: 'Cho phép khách thêm ghi chú cho SP yêu thích', icon: Heart, key: 'enableNote', label: 'Ghi chú', linkedField: 'note' },
  { description: 'Thông báo khi SP giảm giá/có hàng', icon: Bell, key: 'enableNotification', label: 'Thông báo' },
];

type FeaturesState = Record<string, boolean>;
interface SettingsState { maxItemsPerCustomer: number; itemsPerPage: number }
type TabType = 'config' | 'data';

export default function WishlistModuleConfigPage() {
  const [activeTab, setActiveTab] = useState<TabType>('config');

  // Queries
  const moduleData = useQuery(api.admin.modules.getModuleByKey, { key: MODULE_KEY });
  const featuresData = useQuery(api.admin.modules.listModuleFeatures, { moduleKey: MODULE_KEY });
  const fieldsData = useQuery(api.admin.modules.listModuleFields, { moduleKey: MODULE_KEY });
  const settingsData = useQuery(api.admin.modules.listModuleSettings, { moduleKey: MODULE_KEY });

  // WL-008 FIX: Lazy load data queries - chỉ fetch khi ở tab 'data'
  const wishlistData = useQuery(api.wishlist.listAll, activeTab === 'data' ? { limit: 100 } : 'skip');
  const customersData = useQuery(api.customers.listAll, activeTab === 'data' ? { limit: 100 } : 'skip');
  const productsData = useQuery(api.products.listAll, activeTab === 'data' ? { limit: 100 } : 'skip');

  // Mutations
  const toggleFeature = useMutation(api.admin.modules.toggleModuleFeature);
  const updateField = useMutation(api.admin.modules.updateModuleField);
  const setSetting = useMutation(api.admin.modules.setModuleSetting);
  const seedWishlistModule = useMutation(api.seed.seedWishlistModule);
  const clearWishlistData = useMutation(api.seed.clearWishlistData);

  // Local state
  const [localFeatures, setLocalFeatures] = useState<FeaturesState>({});
  const [localFields, setLocalFields] = useState<FieldConfig[]>([]);
  const [localSettings, setLocalSettings] = useState<SettingsState>({ itemsPerPage: 20, maxItemsPerCustomer: 50 });
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

  // Sync settings
  useEffect(() => {
    if (settingsData) {
      const maxItemsPerCustomer = settingsData.find(s => s.settingKey === 'maxItemsPerCustomer')?.value as number ?? 50;
      const itemsPerPage = settingsData.find(s => s.settingKey === 'itemsPerPage')?.value as number ?? 20;
      setLocalSettings({ itemsPerPage, maxItemsPerCustomer });
    }
  }, [settingsData]);

  // Server state for comparison
  const serverFeatures = useMemo(() => {
    const result: FeaturesState = {};
    featuresData?.forEach(f => { result[f.featureKey] = f.enabled; });
    return result;
  }, [featuresData]);

  const serverFields = useMemo(() => fieldsData?.map(f => ({ enabled: f.enabled, id: f._id })) ?? [], [fieldsData]);

  const serverSettings = useMemo(() => {
    const maxItemsPerCustomer = settingsData?.find(s => s.settingKey === 'maxItemsPerCustomer')?.value as number ?? 50;
    const itemsPerPage = settingsData?.find(s => s.settingKey === 'itemsPerPage')?.value as number ?? 20;
    return { itemsPerPage, maxItemsPerCustomer };
  }, [settingsData]);

  // Check for changes
  const hasChanges = useMemo(() => {
    const featuresChanged = Object.keys(localFeatures).some(key => localFeatures[key] !== serverFeatures[key]);
    const fieldsChanged = localFields.some(f => {
      const server = serverFields.find(s => s.id === f.id);
      return server && f.enabled !== server.enabled;
    });
    const settingsChanged = localSettings.maxItemsPerCustomer !== serverSettings.maxItemsPerCustomer ||
                           localSettings.itemsPerPage !== serverSettings.itemsPerPage;
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
    if (!field) {return;}
    
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
      for (const key of Object.keys(localFeatures)) {
        if (localFeatures[key] !== serverFeatures[key]) {
          await toggleFeature({ enabled: localFeatures[key], featureKey: key, moduleKey: MODULE_KEY });
        }
      }
      for (const field of localFields) {
        const server = serverFields.find(s => s.id === field.id);
        if (server && field.enabled !== server.enabled) {
          await updateField({ enabled: field.enabled, id: field.id as Id<'moduleFields'> });
        }
      }
      if (localSettings.maxItemsPerCustomer !== serverSettings.maxItemsPerCustomer) {
        await setSetting({ moduleKey: MODULE_KEY, settingKey: 'maxItemsPerCustomer', value: localSettings.maxItemsPerCustomer });
      }
      if (localSettings.itemsPerPage !== serverSettings.itemsPerPage) {
        await setSetting({ moduleKey: MODULE_KEY, settingKey: 'itemsPerPage', value: localSettings.itemsPerPage });
      }
      toast.success('Đã lưu cấu hình thành công!');
    } catch {
      toast.error('Có lỗi xảy ra khi lưu cấu hình');
    } finally {
      setIsSaving(false);
    }
  };

  // WL-010 FIX: Thêm error handling cho data tab handlers
  const handleSeedData = async () => {
    try {
      toast.loading('Đang tạo dữ liệu mẫu...');
      await seedWishlistModule();
      toast.dismiss();
      toast.success('Đã tạo dữ liệu mẫu thành công!');
    } catch (error) {
      toast.dismiss();
      toast.error('Có lỗi xảy ra khi tạo dữ liệu mẫu');
      console.error('Seed error:', error);
    }
  };

  const handleClearData = async () => {
    if (!confirm('Xóa toàn bộ dữ liệu wishlist?')) {return;}
    try {
      toast.loading('Đang xóa dữ liệu...');
      await clearWishlistData();
      toast.dismiss();
      toast.success('Đã xóa toàn bộ dữ liệu!');
    } catch (error) {
      toast.dismiss();
      toast.error('Có lỗi xảy ra khi xóa dữ liệu');
      console.error('Clear error:', error);
    }
  };

  const handleResetData = async () => {
    if (!confirm('Reset toàn bộ dữ liệu về mặc định?')) {return;}
    try {
      toast.loading('Đang reset dữ liệu...');
      await clearWishlistData();
      await seedWishlistModule();
      toast.dismiss();
      toast.success('Đã reset dữ liệu thành công!');
    } catch (error) {
      toast.dismiss();
      toast.error('Có lỗi xảy ra khi reset dữ liệu');
      console.error('Reset error:', error);
    }
  };

  // Stats & Maps
  const customerMap = useMemo(() => {
    const map: Record<string, string> = {};
    customersData?.forEach(c => { map[c._id] = c.name; });
    return map;
  }, [customersData]);

  const productMap = useMemo(() => {
    const map: Record<string, { name: string; price: number }> = {};
    productsData?.forEach(p => { map[p._id] = { name: p.name, price: p.salePrice ?? p.price }; });
    return map;
  }, [productsData]);

  const stats = useMemo(() => {
    if (!wishlistData) {return { total: 0, uniqueCustomers: 0, uniqueProducts: 0 };}
    const customerIds = new Set(wishlistData.map(w => w.customerId));
    const productIds = new Set(wishlistData.map(w => w.productId));
    return {
      total: wishlistData.length,
      uniqueCustomers: customerIds.size,
      uniqueProducts: productIds.size,
    };
  }, [wishlistData]);

  const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN', { currency: 'VND', style: 'currency' }).format(price);
  const formatDate = (timestamp: number) => new Date(timestamp).toLocaleDateString('vi-VN');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-pink-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <ModuleHeader
        icon={Heart}
        title="Module Sản phẩm yêu thích"
        description="Cấu hình danh sách SP yêu thích của khách hàng"
        iconBgClass="bg-pink-500/10"
        iconTextClass="text-pink-600 dark:text-pink-400"
        buttonClass="bg-pink-600 hover:bg-pink-500"
        onSave={activeTab === 'config' ? handleSave : undefined}
        hasChanges={activeTab === 'config' ? hasChanges : false}
        isSaving={isSaving}
      />

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700">
        <button
          onClick={() =>{  setActiveTab('config'); }}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'config'
              ? 'border-pink-500 text-pink-600 dark:text-pink-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Settings size={16} /> Cấu hình
        </button>
        <button
          onClick={() =>{  setActiveTab('data'); }}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'data'
              ? 'border-pink-500 text-pink-600 dark:text-pink-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Database size={16} /> Dữ liệu
        </button>
      </div>

      {activeTab === 'config' && (
        <>
          <ModuleStatus isCore={moduleData?.isCore ?? false} enabled={moduleData?.enabled ?? false} toggleColor="bg-pink-500" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="space-y-4">
              <SettingsCard>
                <SettingInput 
                  label="Max SP / khách" 
                  value={localSettings.maxItemsPerCustomer} 
                  onChange={(v) =>{  setLocalSettings({...localSettings, maxItemsPerCustomer: v}); }}
                  focusColor="focus:border-pink-500"
                />
                <SettingInput 
                  label="Số mục / trang" 
                  value={localSettings.itemsPerPage} 
                  onChange={(v) =>{  setLocalSettings({...localSettings, itemsPerPage: v}); }}
                  focusColor="focus:border-pink-500"
                />
              </SettingsCard>

              <FeaturesCard
                features={FEATURES_CONFIG.map(f => ({ config: f, enabled: localFeatures[f.key] ?? false }))}
                onToggle={handleToggleFeature}
                toggleColor="bg-pink-500"
              />
            </div>

            <div className="lg:col-span-2">
              <FieldsCard
                title="Trường wishlist"
                icon={Heart}
                iconColorClass="text-pink-500"
                fields={localFields}
                onToggle={handleToggleField}
                fieldColorClass="bg-pink-500/10 text-pink-600 dark:text-pink-400"
                toggleColor="bg-pink-500"
              />
            </div>
          </div>

          <ConventionNote>
            <strong>Convention:</strong> Wishlist phụ thuộc module <Code>Sản phẩm</Code>. Mỗi cặp <Code>customerId + productId</Code> là unique.
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
                <p className="text-sm text-slate-500 mt-1">Seed, clear hoặc reset dữ liệu cho module wishlist</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleSeedData} className="gap-2">
                  <Database size={16} /> Seed Data
                </Button>
                <Button variant="outline" onClick={handleClearData} className="gap-2 text-red-500 hover:text-red-600">
                  <Trash2 size={16} /> Clear All
                </Button>
                <Button onClick={handleResetData} className="gap-2 bg-pink-600 hover:bg-pink-500">
                  <RefreshCw size={16} /> Reset
                </Button>
              </div>
            </div>
          </Card>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-pink-500/10 rounded-lg">
                  <Heart className="w-5 h-5 text-pink-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.total}</p>
                  <p className="text-sm text-slate-500">Tổng mục</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.uniqueCustomers}</p>
                  <p className="text-sm text-slate-500">Khách hàng</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <Package className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.uniqueProducts}</p>
                  <p className="text-sm text-slate-500">Sản phẩm được thích</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Wishlist Table */}
          <Card>
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <Heart className="w-5 h-5 text-pink-500" />
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">Wishlist ({wishlistData?.length ?? 0})</h3>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Khách hàng</TableHead>
                  <TableHead>Sản phẩm</TableHead>
                  <TableHead className="text-right">Giá</TableHead>
                  <TableHead>Ghi chú</TableHead>
                  <TableHead>Ngày thêm</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {wishlistData?.slice(0, 10).map(item => (
                  <TableRow key={item._id}>
                    <TableCell className="font-medium">{customerMap[item.customerId] || 'N/A'}</TableCell>
                    <TableCell>{productMap[item.productId]?.name || 'N/A'}</TableCell>
                    <TableCell className="text-right">{productMap[item.productId] ? formatPrice(productMap[item.productId].price) : '-'}</TableCell>
                    <TableCell className="text-slate-500 text-sm max-w-[150px] truncate">{item.note ?? '-'}</TableCell>
                    <TableCell className="text-slate-500 text-sm">{formatDate(item._creationTime)}</TableCell>
                  </TableRow>
                ))}
                {(!wishlistData || wishlistData.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                      Chưa có dữ liệu wishlist. Nhấn &quot;Seed Data&quot; để tạo dữ liệu mẫu.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            {wishlistData && wishlistData.length > 10 && (
              <div className="p-3 border-t border-slate-100 dark:border-slate-800 text-sm text-slate-500 text-center">
                Hiển thị 10 / {wishlistData.length} mục
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
