'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Doc, Id } from '@/convex/_generated/dataModel';
import { toast } from 'sonner';
import { ShoppingBag, Truck, MapPin, CreditCard, Loader2, Database, Trash2, RefreshCw, Settings, Users } from 'lucide-react';
import { FieldConfig } from '@/types/moduleConfig';
import { 
  ModuleHeader, ModuleStatus, ConventionNote, Code,
  SettingsCard, SettingInput, SettingSelect,
  FeaturesCard, FieldsCard
} from '@/components/modules/shared';
import { Card, Badge, Button, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/app/admin/components/ui';

const MODULE_KEY = 'orders';

const FEATURES_CONFIG = [
  { key: 'enablePayment', label: 'Thanh toán', icon: CreditCard, description: 'Phương thức & trạng thái thanh toán', linkedField: 'paymentMethod' },
  { key: 'enableShipping', label: 'Vận chuyển', icon: Truck, description: 'Phí ship, địa chỉ giao hàng', linkedField: 'shippingAddress' },
  { key: 'enableTracking', label: 'Theo dõi vận đơn', icon: MapPin, description: 'Mã vận đơn, tracking', linkedField: 'trackingNumber' },
];

const STATUS_LABELS: Record<string, string> = {
  Pending: 'Chờ xử lý',
  Processing: 'Đang xử lý',
  Shipped: 'Đang giao',
  Delivered: 'Hoàn thành',
  Cancelled: 'Đã hủy',
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  Pending: 'Chờ TT',
  Paid: 'Đã TT',
  Failed: 'Thất bại',
  Refunded: 'Hoàn tiền',
};

type FeaturesState = Record<string, boolean>;
type SettingsState = { ordersPerPage: number; defaultStatus: string };
type TabType = 'config' | 'data';

export default function OrdersModuleConfigPage() {
  const [activeTab, setActiveTab] = useState<TabType>('config');

  // Config tab queries
  const moduleData = useQuery(api.admin.modules.getModuleByKey, { key: MODULE_KEY });
  const featuresData = useQuery(api.admin.modules.listModuleFeatures, { moduleKey: MODULE_KEY });
  const fieldsData = useQuery(api.admin.modules.listModuleFields, { moduleKey: MODULE_KEY });
  const settingsData = useQuery(api.admin.modules.listModuleSettings, { moduleKey: MODULE_KEY });

  // Data tab queries - use efficient stats query instead of listAll
  // Only fetch when on data tab
  const orderStats = useQuery(api.orders.getStats, activeTab === 'data' ? { limit: 100 } : "skip");
  const ordersData = useQuery(api.orders.listAll, activeTab === 'data' ? { limit: 10 } : "skip");
  const customersCount = useQuery(api.customers.count, activeTab === 'data' ? {} : "skip");

  // Build customer map only when needed and with limit
  const customersForTable = useQuery(
    api.customers.listAll,
    activeTab === 'data' ? { limit: 50 } : "skip"
  );

  // Mutations
  const toggleFeature = useMutation(api.admin.modules.toggleModuleFeature);
  const updateField = useMutation(api.admin.modules.updateModuleField);
  const setSetting = useMutation(api.admin.modules.setModuleSetting);
  const seedOrdersModule = useMutation(api.seed.seedOrdersModule);
  const clearOrdersData = useMutation(api.seed.clearOrdersData);

  // Local state
  const [localFeatures, setLocalFeatures] = useState<FeaturesState>({});
  const [localFields, setLocalFields] = useState<FieldConfig[]>([]);
  const [localSettings, setLocalSettings] = useState<SettingsState>({ ordersPerPage: 20, defaultStatus: 'Pending' });
  const [isSaving, setIsSaving] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

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
      const ordersPerPage = settingsData.find(s => s.settingKey === 'ordersPerPage')?.value as number ?? 20;
      const defaultStatus = settingsData.find(s => s.settingKey === 'defaultStatus')?.value as string ?? 'Pending';
      setLocalSettings({ ordersPerPage, defaultStatus });
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
    const ordersPerPage = settingsData?.find(s => s.settingKey === 'ordersPerPage')?.value as number ?? 20;
    const defaultStatus = settingsData?.find(s => s.settingKey === 'defaultStatus')?.value as string ?? 'Pending';
    return { ordersPerPage, defaultStatus };
  }, [settingsData]);

  // Check for changes
  const hasChanges = useMemo(() => {
    const featuresChanged = Object.keys(localFeatures).some(key => localFeatures[key] !== serverFeatures[key]);
    const fieldsChanged = localFields.some(f => {
      const server = serverFields.find(s => s.id === f.id);
      return server && f.enabled !== server.enabled;
    });
    const settingsChanged = localSettings.ordersPerPage !== serverSettings.ordersPerPage ||
                           localSettings.defaultStatus !== serverSettings.defaultStatus;
    return featuresChanged || fieldsChanged || settingsChanged;
  }, [localFeatures, serverFeatures, localFields, serverFields, localSettings, serverSettings]);

  const handleToggleFeature = (key: string) => {
    setLocalFeatures(prev => ({ ...prev, [key]: !prev[key] }));
    setLocalFields(prev => prev.map(f => 
      f.linkedFeature === key ? { ...f, enabled: !localFeatures[key] } : f
    ));
  };

  const handleToggleField = (id: string) => {
    const field = localFields.find(f => f.id === id);
    if (field?.linkedFeature) {
      handleToggleFeature(field.linkedFeature);
    } else {
      setLocalFields(prev => prev.map(f => f.id === id ? { ...f, enabled: !f.enabled } : f));
    }
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
      if (localSettings.ordersPerPage !== serverSettings.ordersPerPage) {
        promises.push(setSetting({ moduleKey: MODULE_KEY, settingKey: 'ordersPerPage', value: localSettings.ordersPerPage }));
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

  // Data tab handlers
  const handleSeedData = async () => {
    setIsSeeding(true);
    try {
      await seedOrdersModule();
      toast.success('Đã tạo dữ liệu mẫu thành công!');
    } catch {
      toast.error('Có lỗi xảy ra');
    } finally {
      setIsSeeding(false);
    }
  };

  const handleClearData = async () => {
    if (!confirm('Xóa toàn bộ dữ liệu đơn hàng?')) return;
    setIsClearing(true);
    try {
      await clearOrdersData();
      toast.success('Đã xóa toàn bộ dữ liệu!');
    } catch {
      toast.error('Có lỗi xảy ra');
    } finally {
      setIsClearing(false);
    }
  };

  const handleResetData = async () => {
    if (!confirm('Reset toàn bộ dữ liệu về mặc định?')) return;
    setIsResetting(true);
    try {
      await clearOrdersData();
      await seedOrdersModule();
      toast.success('Đã reset dữ liệu thành công!');
    } catch {
      toast.error('Có lỗi xảy ra');
    } finally {
      setIsResetting(false);
    }
  };

  // Use Map for O(1) lookup
  const customerMap = useMemo(() => {
    const map = new Map<string, string>();
    customersForTable?.forEach((c: Doc<"customers">) => map.set(c._id, c.name));
    return map;
  }, [customersForTable]);

  const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  const formatDate = (timestamp: number) => new Date(timestamp).toLocaleDateString('vi-VN');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <ModuleHeader
        icon={ShoppingBag}
        title="Module Đơn hàng"
        description="Cấu hình quản lý đơn hàng và vận chuyển"
        iconBgClass="bg-emerald-500/10"
        iconTextClass="text-emerald-600 dark:text-emerald-400"
        buttonClass="bg-emerald-600 hover:bg-emerald-500"
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
          <ModuleStatus isCore={moduleData?.isCore ?? false} enabled={moduleData?.enabled ?? true} toggleColor="bg-emerald-500" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="space-y-4">
              <SettingsCard>
                <SettingInput 
                  label="Số đơn / trang" 
                  value={localSettings.ordersPerPage} 
                  onChange={(v) => setLocalSettings({...localSettings, ordersPerPage: v})}
                  focusColor="focus:border-emerald-500"
                />
                <SettingSelect
                  label="Trạng thái mặc định"
                  value={localSettings.defaultStatus}
                  onChange={(v) => setLocalSettings({...localSettings, defaultStatus: v})}
                  options={[
                    { value: 'Pending', label: 'Chờ xử lý' },
                    { value: 'Processing', label: 'Đang xử lý' },
                  ]}
                  focusColor="focus:border-emerald-500"
                />
              </SettingsCard>

              <FeaturesCard
                features={FEATURES_CONFIG.map(f => ({ config: f, enabled: localFeatures[f.key] ?? false }))}
                onToggle={handleToggleFeature}
                toggleColor="bg-emerald-500"
              />
            </div>

            <div className="lg:col-span-2">
              <FieldsCard
                title="Trường đơn hàng"
                icon={ShoppingBag}
                iconColorClass="text-emerald-500"
                fields={localFields}
                onToggle={handleToggleField}
                fieldColorClass="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                toggleColor="bg-emerald-500"
              />
            </div>
          </div>

          <ConventionNote>
            <strong>Convention:</strong> <Code>orderNumber</Code> tự sinh unique (ORD-YYYYMMDD-XXXX). Status: Pending, Processing, Shipped, Delivered, Cancelled.
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
                <p className="text-sm text-slate-500 mt-1">Seed, clear hoặc reset dữ liệu cho module đơn hàng</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleSeedData} disabled={isSeeding} className="gap-2">
                  {isSeeding ? <Loader2 size={16} className="animate-spin" /> : <Database size={16} />} Seed Data
                </Button>
                <Button variant="outline" onClick={handleClearData} disabled={isClearing} className="gap-2 text-red-500 hover:text-red-600">
                  {isClearing ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />} Clear All
                </Button>
                <Button onClick={handleResetData} disabled={isResetting} className="gap-2 bg-emerald-600 hover:bg-emerald-500">
                  {isResetting ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />} Reset
                </Button>
              </div>
            </div>
          </Card>

          {/* Statistics - use orderStats query */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 rounded-lg">
                  <ShoppingBag className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{orderStats?.total ?? 0}</p>
                  <p className="text-sm text-slate-500">Tổng đơn</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-500/10 rounded-lg">
                  <ShoppingBag className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{orderStats?.pending ?? 0}</p>
                  <p className="text-sm text-slate-500">Chờ xử lý</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500/10 rounded-lg">
                  <Truck className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{orderStats?.processing ?? 0}</p>
                  <p className="text-sm text-slate-500">Đang giao</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <ShoppingBag className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{orderStats?.delivered ?? 0}</p>
                  <p className="text-sm text-slate-500">Hoàn thành</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500/10 rounded-lg">
                  <ShoppingBag className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{orderStats?.cancelled ?? 0}</p>
                  <p className="text-sm text-slate-500">Đã hủy</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{customersCount?.count ?? 0}</p>
                  <p className="text-sm text-slate-500">Khách hàng</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Revenue Card */}
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Tổng doanh thu (đơn hoàn thành)</p>
                <p className="text-3xl font-bold text-emerald-600">{formatPrice(orderStats?.totalRevenue ?? 0)}</p>
              </div>
            </div>
          </Card>

          {/* Orders Table - only shows 10 items */}
          <Card>
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-emerald-500" />
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">Đơn hàng gần đây (tối đa 10)</h3>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã đơn</TableHead>
                  <TableHead>Khách hàng</TableHead>
                  <TableHead className="text-right">Tổng tiền</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Thanh toán</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ordersData?.map((order: Doc<"orders">) => (
                  <TableRow key={order._id}>
                    <TableCell className="font-mono text-sm text-emerald-600 font-medium">{order.orderNumber}</TableCell>
                    <TableCell>{customerMap.get(order.customerId) || 'N/A'}</TableCell>
                    <TableCell className="text-right font-medium">{formatPrice(order.totalAmount)}</TableCell>
                    <TableCell>
                      <Badge variant={order.status === 'Delivered' ? 'success' : order.status === 'Cancelled' ? 'destructive' : 'secondary'}>
                        {STATUS_LABELS[order.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {order.paymentStatus && (
                        <Badge variant={order.paymentStatus === 'Paid' ? 'success' : 'secondary'}>
                          {PAYMENT_STATUS_LABELS[order.paymentStatus]}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-slate-500 text-sm">{formatDate(order._creationTime)}</TableCell>
                  </TableRow>
                ))}
                {(!ordersData || ordersData.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                      Chưa có đơn hàng nào. Nhấn &quot;Seed Data&quot; để tạo dữ liệu mẫu.
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
