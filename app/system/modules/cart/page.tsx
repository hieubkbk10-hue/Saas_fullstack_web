'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { toast } from 'sonner';
import { ShoppingCart, Clock, Users, StickyNote, Loader2, Database, Trash2, RefreshCw, Settings, Package, AlertTriangle, CheckCircle } from 'lucide-react';
import { FieldConfig } from '@/types/moduleConfig';
import { 
  ModuleHeader, ModuleStatus, ConventionNote, Code,
  SettingsCard, SettingInput,
  FeaturesCard, FieldsCard
} from '@/components/modules/shared';
import { Card, Badge, Button, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/app/admin/components/ui';

const MODULE_KEY = 'cart';
const CART_ITEMS_KEY = 'cartItems';

const FEATURES_CONFIG = [
  { key: 'enableExpiry', label: 'Hết hạn giỏ hàng', icon: Clock, linkedField: 'expiresAt' },
  { key: 'enableGuestCart', label: 'Giỏ hàng khách', icon: Users, linkedField: 'sessionId' },
  { key: 'enableNote', label: 'Ghi chú', icon: StickyNote, linkedField: 'note' },
];

type FeaturesState = Record<string, boolean>;
type SettingsState = { cartsPerPage: number; expiryDays: number; maxItemsPerCart: number; autoCleanupAbandoned: boolean };
type TabType = 'config' | 'data';

export default function CartModuleConfigPage() {
  const [activeTab, setActiveTab] = useState<TabType>('config');

  // Queries
  const moduleData = useQuery(api.admin.modules.getModuleByKey, { key: MODULE_KEY });
  const featuresData = useQuery(api.admin.modules.listModuleFeatures, { moduleKey: MODULE_KEY });
  const fieldsData = useQuery(api.admin.modules.listModuleFields, { moduleKey: MODULE_KEY });
  const cartItemFieldsData = useQuery(api.admin.modules.listModuleFields, { moduleKey: CART_ITEMS_KEY });
  const settingsData = useQuery(api.admin.modules.listModuleSettings, { moduleKey: MODULE_KEY });

  // Data tab queries - FIX: Add limits to prevent fetching ALL
  const cartsData = useQuery(api.cart.listAll, { limit: 100 });
  const cartItemsData = useQuery(api.cart.listAllItems, { limit: 100 });
  const statsData = useQuery(api.cart.getStats);
  const customersData = useQuery(api.customers.listAll, { limit: 100 });

  // Mutations
  const toggleFeature = useMutation(api.admin.modules.toggleModuleFeature);
  const updateField = useMutation(api.admin.modules.updateModuleField);
  const setSetting = useMutation(api.admin.modules.setModuleSetting);
  const seedCartModule = useMutation(api.seed.seedCartModule);
  const seedProductsModule = useMutation(api.seed.seedProductsModule);
  const clearCartData = useMutation(api.seed.clearCartData);
  const clearCartConfig = useMutation(api.seed.clearCartConfig);

  // Local state
  const [localFeatures, setLocalFeatures] = useState<FeaturesState>({});
  const [localCartFields, setLocalCartFields] = useState<FieldConfig[]>([]);
  const [localItemFields, setLocalItemFields] = useState<FieldConfig[]>([]);
  const [localSettings, setLocalSettings] = useState<SettingsState>({ cartsPerPage: 20, expiryDays: 7, maxItemsPerCart: 50, autoCleanupAbandoned: true });
  const [isSaving, setIsSaving] = useState(false);

  const isLoading = moduleData === undefined || featuresData === undefined || 
                    fieldsData === undefined || cartItemFieldsData === undefined || settingsData === undefined;

  // Sync features
  useEffect(() => {
    if (featuresData) {
      const features: FeaturesState = {};
      featuresData.forEach(f => { features[f.featureKey] = f.enabled; });
      setLocalFeatures(features);
    }
  }, [featuresData]);

  // Sync cart fields
  useEffect(() => {
    if (fieldsData) {
      setLocalCartFields(fieldsData.map(f => ({
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

  // Sync cart item fields
  useEffect(() => {
    if (cartItemFieldsData) {
      setLocalItemFields(cartItemFieldsData.map(f => ({
        id: f._id,
        key: f.fieldKey,
        name: f.name,
        type: f.type,
        required: f.required,
        enabled: f.enabled,
        isSystem: f.isSystem,
      })));
    }
  }, [cartItemFieldsData]);

  // FIX Issue #9: Convert settings to Map for O(1) lookup instead of O(n) Array.find()
  const settingsMap = useMemo(() => {
    return new Map(settingsData?.map(s => [s.settingKey, s.value]) ?? []);
  }, [settingsData]);

  // Sync settings using Map lookup
  useEffect(() => {
    if (settingsData && settingsMap.size > 0) {
      const cartsPerPage = (settingsMap.get('cartsPerPage') as number) ?? 20;
      const expiryDays = (settingsMap.get('expiryDays') as number) ?? 7;
      const maxItemsPerCart = (settingsMap.get('maxItemsPerCart') as number) ?? 50;
      const autoCleanupAbandoned = (settingsMap.get('autoCleanupAbandoned') as boolean) ?? true;
      setLocalSettings({ cartsPerPage, expiryDays, maxItemsPerCart, autoCleanupAbandoned });
    }
  }, [settingsData, settingsMap]);

  // Server state for comparison
  const serverFeatures = useMemo(() => {
    const result: FeaturesState = {};
    featuresData?.forEach(f => { result[f.featureKey] = f.enabled; });
    return result;
  }, [featuresData]);

  const serverCartFields = useMemo(() => {
    return fieldsData?.map(f => ({ id: f._id, enabled: f.enabled })) || [];
  }, [fieldsData]);

  const serverItemFields = useMemo(() => {
    return cartItemFieldsData?.map(f => ({ id: f._id, enabled: f.enabled })) || [];
  }, [cartItemFieldsData]);

  // FIX Issue #9: Use Map lookup for server settings comparison
  const serverSettings = useMemo(() => {
    const cartsPerPage = (settingsMap.get('cartsPerPage') as number) ?? 20;
    const expiryDays = (settingsMap.get('expiryDays') as number) ?? 7;
    const maxItemsPerCart = (settingsMap.get('maxItemsPerCart') as number) ?? 50;
    const autoCleanupAbandoned = (settingsMap.get('autoCleanupAbandoned') as boolean) ?? true;
    return { cartsPerPage, expiryDays, maxItemsPerCart, autoCleanupAbandoned };
  }, [settingsMap]);

  // FIX Issue #9: Convert server fields to Maps for O(1) lookup
  const serverCartFieldsMap = useMemo(() => {
    return new Map<string, boolean>(serverCartFields.map(f => [String(f.id), f.enabled]));
  }, [serverCartFields]);

  const serverItemFieldsMap = useMemo(() => {
    return new Map<string, boolean>(serverItemFields.map(f => [String(f.id), f.enabled]));
  }, [serverItemFields]);

  // Check for changes using Map lookups
  const hasChanges = useMemo(() => {
    const featuresChanged = Object.keys(localFeatures).some(key => localFeatures[key] !== serverFeatures[key]);
    const cartFieldsChanged = localCartFields.some(f => {
      const serverEnabled = serverCartFieldsMap.get(f.id);
      return serverEnabled !== undefined && f.enabled !== serverEnabled;
    });
    const itemFieldsChanged = localItemFields.some(f => {
      const serverEnabled = serverItemFieldsMap.get(f.id);
      return serverEnabled !== undefined && f.enabled !== serverEnabled;
    });
    const settingsChanged = localSettings.cartsPerPage !== serverSettings.cartsPerPage ||
                           localSettings.expiryDays !== serverSettings.expiryDays ||
                           localSettings.maxItemsPerCart !== serverSettings.maxItemsPerCart ||
                           localSettings.autoCleanupAbandoned !== serverSettings.autoCleanupAbandoned;
    return featuresChanged || cartFieldsChanged || itemFieldsChanged || settingsChanged;
  }, [localFeatures, serverFeatures, localCartFields, serverCartFieldsMap, localItemFields, serverItemFieldsMap, localSettings, serverSettings]);

  const handleToggleFeature = (key: string) => {
    const newFeatureState = !localFeatures[key];
    setLocalFeatures(prev => ({ ...prev, [key]: newFeatureState }));
    setLocalCartFields(prev => prev.map(f => 
      f.linkedFeature === key ? { ...f, enabled: newFeatureState } : f
    ));
  };

  const handleToggleCartField = (id: string) => {
    const field = localCartFields.find(f => f.id === id);
    if (!field) return;
    
    const newFieldState = !field.enabled;
    setLocalCartFields(prev => {
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

  const handleToggleItemField = (id: string) => {
    setLocalItemFields(prev => prev.map(f => f.id === id ? { ...f, enabled: !f.enabled } : f));
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
      // Save cart fields - FIX: Use Map lookup instead of Array.find()
      for (const field of localCartFields) {
        const serverEnabled = serverCartFieldsMap.get(field.id);
        if (serverEnabled !== undefined && field.enabled !== serverEnabled) {
          await updateField({ id: field.id as Id<'moduleFields'>, enabled: field.enabled });
        }
      }
      // Save item fields - FIX: Use Map lookup instead of Array.find()
      for (const field of localItemFields) {
        const serverEnabled = serverItemFieldsMap.get(field.id);
        if (serverEnabled !== undefined && field.enabled !== serverEnabled) {
          await updateField({ id: field.id as Id<'moduleFields'>, enabled: field.enabled });
        }
      }
      // Save settings
      if (localSettings.cartsPerPage !== serverSettings.cartsPerPage) {
        await setSetting({ moduleKey: MODULE_KEY, settingKey: 'cartsPerPage', value: localSettings.cartsPerPage });
      }
      if (localSettings.expiryDays !== serverSettings.expiryDays) {
        await setSetting({ moduleKey: MODULE_KEY, settingKey: 'expiryDays', value: localSettings.expiryDays });
      }
      if (localSettings.maxItemsPerCart !== serverSettings.maxItemsPerCart) {
        await setSetting({ moduleKey: MODULE_KEY, settingKey: 'maxItemsPerCart', value: localSettings.maxItemsPerCart });
      }
      if (localSettings.autoCleanupAbandoned !== serverSettings.autoCleanupAbandoned) {
        await setSetting({ moduleKey: MODULE_KEY, settingKey: 'autoCleanupAbandoned', value: localSettings.autoCleanupAbandoned });
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
    toast.loading('Đang tạo dữ liệu...');
    await seedProductsModule();
    await seedCartModule();
    toast.dismiss();
    toast.success('Đã tạo dữ liệu thành công!');
  };

  const handleClearData = async () => {
    if (!confirm('Xóa toàn bộ giỏ hàng?')) return;
    toast.loading('Đang xóa dữ liệu...');
    await clearCartData();
    toast.dismiss();
    toast.success('Đã xóa toàn bộ giỏ hàng!');
  };

  const handleResetAll = async () => {
    if (!confirm('Reset toàn bộ dữ liệu và cấu hình?')) return;
    toast.loading('Đang reset...');
    await clearCartData();
    await clearCartConfig();
    await seedProductsModule();
    await seedCartModule();
    toast.dismiss();
    toast.success('Đã reset thành công!');
  };

  // Maps
  const customerMap = useMemo(() => {
    const map: Record<string, string> = {};
    customersData?.forEach(c => { map[c._id] = c.name; });
    return map;
  }, [customersData]);

  // FIX: Use statsData from server for efficient statistics
  const stats = useMemo(() => {
    const total = statsData?.total ?? cartsData?.length ?? 0;
    const active = statsData?.active ?? cartsData?.filter(c => c.status === 'Active').length ?? 0;
    const abandoned = statsData?.abandoned ?? cartsData?.filter(c => c.status === 'Abandoned').length ?? 0;
    const converted = statsData?.converted ?? cartsData?.filter(c => c.status === 'Converted').length ?? 0;
    const totalValue = statsData?.totalValue ?? cartsData?.filter(c => c.status === 'Active').reduce((sum, c) => sum + c.totalAmount, 0) ?? 0;
    const totalItems = cartItemsData?.length ?? 0;
    return { total, active, abandoned, converted, totalValue, totalItems };
  }, [statsData, cartsData, cartItemsData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-emerald-500" />
      </div>
    );
  }

  // Check if config is seeded
  const hasConfig = featuresData && featuresData.length > 0;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <ModuleHeader
        icon={ShoppingCart}
        title="Module Giỏ hàng"
        description="Cấu hình chức năng giỏ hàng cho khách"
        iconBgClass="bg-emerald-500/10"
        iconTextClass="text-emerald-600 dark:text-emerald-400"
        buttonClass="bg-emerald-600 hover:bg-emerald-500"
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
              ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Settings size={16} /> Cấu hình
        </button>
        <button
          onClick={() => setActiveTab('data')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'data'
              ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
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
              <ShoppingCart size={48} className="mx-auto text-slate-300 mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">Chưa có cấu hình module</h3>
              <p className="text-slate-500 mb-4">Nhấn nút bên dưới để khởi tạo cấu hình cho module Giỏ hàng</p>
              <Button onClick={handleSeedAll} className="bg-emerald-600 hover:bg-emerald-500">
                <Database size={16} className="mr-2" /> Khởi tạo cấu hình
              </Button>
            </Card>
          ) : (
            <>
              <ModuleStatus isCore={moduleData?.isCore ?? false} enabled={moduleData?.enabled ?? true} toggleColor="bg-emerald-500" />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="space-y-4">
                  <SettingsCard>
                    <SettingInput 
                      label="Số giỏ hàng / trang" 
                      value={localSettings.cartsPerPage} 
                      onChange={(v) => setLocalSettings({...localSettings, cartsPerPage: v})}
                      focusColor="focus:border-emerald-500"
                    />
                    <SettingInput 
                      label="Hết hạn sau (ngày)" 
                      value={localSettings.expiryDays} 
                      onChange={(v) => setLocalSettings({...localSettings, expiryDays: v})}
                      focusColor="focus:border-emerald-500"
                    />
                    <SettingInput 
                      label="Tối đa SP / giỏ" 
                      value={localSettings.maxItemsPerCart} 
                      onChange={(v) => setLocalSettings({...localSettings, maxItemsPerCart: v})}
                      focusColor="focus:border-emerald-500"
                    />
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-slate-600 dark:text-slate-300">Tự động dọn abandoned</span>
                      <button
                        onClick={() => setLocalSettings({...localSettings, autoCleanupAbandoned: !localSettings.autoCleanupAbandoned})}
                        className={`w-10 h-5 rounded-full transition-colors ${localSettings.autoCleanupAbandoned ? 'bg-emerald-500' : 'bg-slate-300'}`}
                      >
                        <span className={`block w-4 h-4 rounded-full bg-white transform transition-transform ${localSettings.autoCleanupAbandoned ? 'translate-x-5' : 'translate-x-0.5'}`} />
                      </button>
                    </div>
                  </SettingsCard>

                  <FeaturesCard
                    features={FEATURES_CONFIG.map(f => ({ config: f, enabled: localFeatures[f.key] ?? false }))}
                    onToggle={handleToggleFeature}
                    toggleColor="bg-emerald-500"
                  />
                </div>

                <FieldsCard
                  title="Trường giỏ hàng"
                  icon={ShoppingCart}
                  iconColorClass="text-emerald-500"
                  fields={localCartFields}
                  onToggle={handleToggleCartField}
                  fieldColorClass="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  toggleColor="bg-emerald-500"
                />

                <FieldsCard
                  title="Trường sản phẩm trong giỏ"
                  icon={Package}
                  iconColorClass="text-blue-500"
                  fields={localItemFields}
                  onToggle={handleToggleItemField}
                  fieldColorClass="bg-blue-500/10 text-blue-600 dark:text-blue-400"
                  toggleColor="bg-blue-500"
                />
              </div>

              <ConventionNote>
                <strong>Convention:</strong> Giỏ hàng phụ thuộc module <Code>Sản phẩm</Code>. 
                Giá lưu tại thời điểm thêm vào giỏ. Trạng thái: Active, Converted, Abandoned.
              </ConventionNote>
            </>
          )}
        </>
      )}

      {activeTab === 'data' && (
        <div className="space-y-6">
          {/* Action buttons */}
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">Quản lý dữ liệu</h3>
                <p className="text-sm text-slate-500 mt-1">Seed, clear hoặc reset dữ liệu giỏ hàng</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleSeedAll} className="gap-2">
                  <Database size={16} /> Seed All
                </Button>
                <Button variant="outline" onClick={handleClearData} className="gap-2 text-red-500 hover:text-red-600">
                  <Trash2 size={16} /> Clear
                </Button>
                <Button onClick={handleResetAll} className="gap-2 bg-emerald-600 hover:bg-emerald-500">
                  <RefreshCw size={16} /> Reset
                </Button>
              </div>
            </div>
          </Card>

          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Card className="p-4">
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.total}</p>
              <p className="text-sm text-slate-500">Tổng giỏ hàng</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2">
                <ShoppingCart size={16} className="text-emerald-500" />
                <p className="text-2xl font-bold text-emerald-600">{stats.active}</p>
              </div>
              <p className="text-sm text-slate-500">Đang hoạt động</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle size={16} className="text-amber-500" />
                <p className="text-2xl font-bold text-amber-600">{stats.abandoned}</p>
              </div>
              <p className="text-sm text-slate-500">Bỏ dở</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-blue-500" />
                <p className="text-2xl font-bold text-blue-600">{stats.converted}</p>
              </div>
              <p className="text-sm text-slate-500">Đã đặt hàng</p>
            </Card>
            <Card className="p-4">
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.totalItems}</p>
              <p className="text-sm text-slate-500">Tổng items</p>
            </Card>
            <Card className="p-4">
              <p className="text-lg font-bold text-emerald-600">{stats.totalValue.toLocaleString('vi-VN')}đ</p>
              <p className="text-sm text-slate-500">Giá trị active</p>
            </Card>
          </div>

          {/* Carts Table */}
          <Card>
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-emerald-500" />
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">Giỏ hàng ({stats.total})</h3>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Khách hàng / Session</TableHead>
                  <TableHead className="text-center">Số SP</TableHead>
                  <TableHead className="text-right">Tổng tiền</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Hết hạn</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cartsData?.slice(0, 15).map(cart => (
                  <TableRow key={cart._id}>
                    <TableCell className="font-medium">
                      {cart.customerId 
                        ? customerMap[cart.customerId] || 'Khách hàng' 
                        : <span className="text-slate-400">Guest: {cart.sessionId?.slice(0, 15)}...</span>}
                    </TableCell>
                    <TableCell className="text-center">{cart.itemsCount}</TableCell>
                    <TableCell className="text-right font-medium">{cart.totalAmount.toLocaleString('vi-VN')}đ</TableCell>
                    <TableCell>
                      <Badge variant={
                        cart.status === 'Active' ? 'default' : 
                        cart.status === 'Converted' ? 'secondary' : 'destructive'
                      }>
                        {cart.status === 'Active' ? 'Hoạt động' : 
                         cart.status === 'Converted' ? 'Đã đặt' : 'Bỏ dở'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-slate-500">
                      {cart.expiresAt 
                        ? new Date(cart.expiresAt).toLocaleDateString('vi-VN')
                        : '-'}
                    </TableCell>
                  </TableRow>
                ))}
                {(!cartsData || cartsData.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                      Chưa có giỏ hàng nào. Nhấn &quot;Seed All&quot; để tạo dữ liệu mẫu.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            {cartsData && cartsData.length > 15 && (
              <div className="p-3 border-t border-slate-100 dark:border-slate-800 text-sm text-slate-500 text-center">
                Hiển thị 15 / {cartsData.length} giỏ hàng
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
