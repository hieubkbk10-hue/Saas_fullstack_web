'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { toast } from 'sonner';
import { Users, KeyRound, MapPin, ImageIcon, StickyNote, Loader2, Database, Trash2, RefreshCw, Settings, UserCheck, DollarSign, ShoppingBag } from 'lucide-react';
import { FieldConfig } from '@/types/moduleConfig';
import { 
  ModuleHeader, ModuleStatus, ConventionNote, Code,
  SettingsCard, SettingInput,
  FeaturesCard, FieldsCard
} from '@/components/modules/shared';
import { Card, Badge, Button, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/app/admin/components/ui';

const MODULE_KEY = 'customers';

const FEATURES_CONFIG = [
  { key: 'enableLogin', label: 'Đăng nhập KH', icon: KeyRound, linkedField: 'password' },
  { key: 'enableAddresses', label: 'Sổ địa chỉ', icon: MapPin, linkedField: 'addresses' },
  { key: 'enableAvatar', label: 'Ảnh đại diện', icon: ImageIcon, linkedField: 'avatar' },
  { key: 'enableNotes', label: 'Ghi chú', icon: StickyNote, linkedField: 'notes' },
];

type FeaturesState = Record<string, boolean>;
type SettingsState = { customersPerPage: number };
type TabType = 'config' | 'data';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

export default function CustomersModuleConfigPage() {
  const [activeTab, setActiveTab] = useState<TabType>('config');
  
  const moduleData = useQuery(api.admin.modules.getModuleByKey, { key: MODULE_KEY });
  const featuresData = useQuery(api.admin.modules.listModuleFeatures, { moduleKey: MODULE_KEY });
  const fieldsData = useQuery(api.admin.modules.listModuleFields, { moduleKey: MODULE_KEY });
  const settingsData = useQuery(api.admin.modules.listModuleSettings, { moduleKey: MODULE_KEY });

  // Data tab queries
  const customersData = useQuery(api.customers.listAll, { limit: 100 });
  const statsData = useQuery(api.customers.getStats, { limit: 1000 });
  const citiesData = useQuery(api.customers.getCities, { limit: 500 });

  const toggleFeature = useMutation(api.admin.modules.toggleModuleFeature);
  const updateField = useMutation(api.admin.modules.updateModuleField);
  const setSetting = useMutation(api.admin.modules.setModuleSetting);
  const seedCustomersModule = useMutation(api.seed.seedCustomersModule);
  const clearCustomersData = useMutation(api.seed.clearCustomersData);

  const [localFeatures, setLocalFeatures] = useState<FeaturesState>({});
  const [localFields, setLocalFields] = useState<FieldConfig[]>([]);
  const [localSettings, setLocalSettings] = useState<SettingsState>({ customersPerPage: 20 });
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
      const customersPerPage = settingsData.find(s => s.settingKey === 'customersPerPage')?.value as number ?? 20;
      setLocalSettings({ customersPerPage });
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
    const customersPerPage = settingsData?.find(s => s.settingKey === 'customersPerPage')?.value as number ?? 20;
    return { customersPerPage };
  }, [settingsData]);

  // Check for changes
  const hasChanges = useMemo(() => {
    const featuresChanged = Object.keys(localFeatures).some(key => localFeatures[key] !== serverFeatures[key]);
    const fieldsChanged = localFields.some(f => {
      const server = serverFields.find(s => s.id === f.id);
      return server && f.enabled !== server.enabled;
    });
    const settingsChanged = localSettings.customersPerPage !== serverSettings.customersPerPage;
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

  const handleSave = async () => {
    setIsSaving(true);
    try {
      for (const key of Object.keys(localFeatures)) {
        if (localFeatures[key] !== serverFeatures[key]) {
          await toggleFeature({ moduleKey: MODULE_KEY, featureKey: key, enabled: localFeatures[key] });
        }
      }
      for (const field of localFields) {
        const server = serverFields.find(s => s.id === field.id);
        if (server && field.enabled !== server.enabled) {
          await updateField({ id: field.id as any, enabled: field.enabled });
        }
      }
      if (localSettings.customersPerPage !== serverSettings.customersPerPage) {
        await setSetting({ moduleKey: MODULE_KEY, settingKey: 'customersPerPage', value: localSettings.customersPerPage });
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
    await seedCustomersModule();
    toast.dismiss();
    toast.success('Đã tạo dữ liệu mẫu thành công!');
  };

  const handleClearData = async () => {
    if (!confirm('Xóa toàn bộ khách hàng? Thao tác này không thể hoàn tác.')) return;
    toast.loading('Đang xóa dữ liệu...');
    await clearCustomersData();
    toast.dismiss();
    toast.success('Đã xóa toàn bộ khách hàng!');
  };

  const handleResetAll = async () => {
    if (!confirm('Reset dữ liệu về mặc định?')) return;
    toast.loading('Đang reset dữ liệu...');
    await clearCustomersData();
    await seedCustomersModule();
    toast.dismiss();
    toast.success('Đã reset dữ liệu thành công!');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <ModuleHeader
        icon={Users}
        title="Module Khách hàng"
        description="Quản lý thông tin khách hàng"
        iconBgClass="bg-purple-500/10"
        iconTextClass="text-purple-600 dark:text-purple-400"
        buttonClass="bg-purple-600 hover:bg-purple-500"
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
              ? 'border-purple-500 text-purple-600 dark:text-purple-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Settings size={16} /> Cấu hình
        </button>
        <button
          onClick={() => setActiveTab('data')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'data'
              ? 'border-purple-500 text-purple-600 dark:text-purple-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Database size={16} /> Dữ liệu
        </button>
      </div>

      {activeTab === 'config' && (
        <>
          <ModuleStatus isCore={moduleData?.isCore ?? true} enabled={moduleData?.enabled ?? true} toggleColor="bg-purple-500" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="space-y-4">
              <SettingsCard>
                <SettingInput 
                  label="Số KH / trang" 
                  value={localSettings.customersPerPage} 
                  onChange={(v) => setLocalSettings({...localSettings, customersPerPage: v})}
                  focusColor="focus:border-purple-500"
                />
              </SettingsCard>

              <FeaturesCard
                features={FEATURES_CONFIG.map(f => ({ config: f, enabled: localFeatures[f.key] ?? false }))}
                onToggle={handleToggleFeature}
                toggleColor="bg-purple-500"
              />
            </div>

            <div className="lg:col-span-2">
              <FieldsCard
                title="Trường khách hàng"
                icon={Users}
                iconColorClass="text-purple-500"
                fields={localFields}
                onToggle={handleToggleField}
                fieldColorClass="bg-purple-500/10 text-purple-600 dark:text-purple-400"
                toggleColor="bg-purple-500"
              />
            </div>
          </div>

          <ConventionNote>
            <strong>Convention:</strong> Email unique và lowercase. Mật khẩu hash bằng bcrypt. <Code>ordersCount</Code> và <Code>totalSpent</Code> tự động cập nhật.
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
                <p className="text-sm text-slate-500 mt-1">Seed, clear hoặc reset dữ liệu khách hàng</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleSeedAll} className="gap-2">
                  <Database size={16} /> Seed Data
                </Button>
                <Button variant="outline" onClick={handleClearData} className="gap-2 text-red-500 hover:text-red-600">
                  <Trash2 size={16} /> Clear All
                </Button>
                <Button onClick={handleResetAll} className="gap-2 bg-purple-600 hover:bg-purple-500">
                  <RefreshCw size={16} /> Reset
                </Button>
              </div>
            </div>
          </Card>

          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{statsData?.totalCount ?? 0}</p>
                  <p className="text-sm text-slate-500">Tổng KH</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 rounded-lg">
                  <UserCheck className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{statsData?.activeCount ?? 0}</p>
                  <p className="text-sm text-slate-500">Hoạt động</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 rounded-lg">
                  <DollarSign className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{formatCurrency(statsData?.totalSpent ?? 0)}</p>
                  <p className="text-sm text-slate-500">Tổng chi tiêu</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <ShoppingBag className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{statsData?.totalOrders ?? 0}</p>
                  <p className="text-sm text-slate-500">Tổng đơn hàng</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Cities */}
          {citiesData && citiesData.length > 0 && (
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-5 h-5 text-purple-500" />
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">Thành phố ({citiesData.length})</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {citiesData.map(city => (
                  <Badge key={city} variant="secondary">{city}</Badge>
                ))}
              </div>
            </Card>
          )}

          {/* Customers Table */}
          <Card>
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-500" />
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">Khách hàng ({customersData?.length ?? 0})</h3>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Họ tên</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Thành phố</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Đơn hàng</TableHead>
                  <TableHead className="text-right">Chi tiêu</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customersData?.slice(0, 10).map(customer => (
                  <TableRow key={customer._id}>
                    <TableCell className="font-medium">{customer.name}</TableCell>
                    <TableCell className="text-slate-500">{customer.email}</TableCell>
                    <TableCell>{customer.city || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={customer.status === 'Active' ? 'default' : 'secondary'}>
                        {customer.status === 'Active' ? 'Hoạt động' : 'Ngừng'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{customer.ordersCount}</TableCell>
                    <TableCell className="text-right">{formatCurrency(customer.totalSpent)}</TableCell>
                  </TableRow>
                ))}
                {(!customersData || customersData.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                      Chưa có khách hàng nào. Nhấn &quot;Seed Data&quot; để tạo dữ liệu mẫu.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            {customersData && customersData.length > 10 && (
              <div className="p-3 border-t border-slate-100 dark:border-slate-800 text-sm text-slate-500 text-center">
                Hiển thị 10 / {customersData.length} khách hàng
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
