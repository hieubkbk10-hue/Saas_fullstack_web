'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { toast } from 'sonner';
import { Ticket, Users, ShoppingCart, Percent, DollarSign, Loader2, Database, Trash2, RefreshCw, Settings, Clock, CalendarClock, CheckCircle } from 'lucide-react';
import { FieldConfig } from '@/types/moduleConfig';
import { 
  ModuleHeader, ModuleStatus, ConventionNote, Code,
  SettingsCard, SettingInput,
  FeaturesCard, FieldsCard
} from '@/components/modules/shared';
import { Card, Badge, Button, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/app/admin/components/ui';
import { useUnsavedChangesWarning } from '../../hooks/useUnsavedChangesWarning';

const MODULE_KEY = 'promotions';

const FEATURES_CONFIG = [
  { key: 'enableUsageLimit', label: 'Giới hạn lượt dùng', icon: Users, linkedField: 'usageLimit' },
  { key: 'enableMinOrder', label: 'Đơn tối thiểu', icon: ShoppingCart, linkedField: 'minOrderAmount' },
  { key: 'enableMaxDiscount', label: 'Giảm tối đa', icon: DollarSign, linkedField: 'maxDiscountAmount' },
  { key: 'enableSchedule', label: 'Hẹn giờ', icon: CalendarClock },
  { key: 'enableApplicable', label: 'Áp dụng có chọn lọc', icon: CheckCircle },
];

type FeaturesState = Record<string, boolean>;
type SettingsState = { promotionsPerPage: number };
type TabType = 'config' | 'data';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

function formatDate(timestamp: number | undefined): string {
  if (!timestamp) return '-';
  return new Date(timestamp).toLocaleDateString('vi-VN');
}

export default function PromotionsModuleConfigPage() {
  const [activeTab, setActiveTab] = useState<TabType>('config');
  
  const moduleData = useQuery(api.admin.modules.getModuleByKey, { key: MODULE_KEY });
  const featuresData = useQuery(api.admin.modules.listModuleFeatures, { moduleKey: MODULE_KEY });
  const fieldsData = useQuery(api.admin.modules.listModuleFields, { moduleKey: MODULE_KEY });
  const settingsData = useQuery(api.admin.modules.listModuleSettings, { moduleKey: MODULE_KEY });

  // Data tab queries
  const promotionsData = useQuery(api.promotions.listAll);
  const statsData = useQuery(api.promotions.getStats);

  const toggleFeature = useMutation(api.admin.modules.toggleModuleFeature);
  const updateField = useMutation(api.admin.modules.updateModuleField);
  const setSetting = useMutation(api.admin.modules.setModuleSetting);
  const seedPromotionsModule = useMutation(api.seed.seedPromotionsModule);
  const clearPromotionsData = useMutation(api.seed.clearPromotionsData);

  const [localFeatures, setLocalFeatures] = useState<FeaturesState>({});
  const [localFields, setLocalFields] = useState<FieldConfig[]>([]);
  const [localSettings, setLocalSettings] = useState<SettingsState>({ promotionsPerPage: 20 });
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
      const promotionsPerPage = settingsData.find(s => s.settingKey === 'promotionsPerPage')?.value as number ?? 20;
      setLocalSettings({ promotionsPerPage });
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
    const promotionsPerPage = settingsData?.find(s => s.settingKey === 'promotionsPerPage')?.value as number ?? 20;
    return { promotionsPerPage };
  }, [settingsData]);

  // Check for changes
  const hasChanges = useMemo(() => {
    const featuresChanged = Object.keys(localFeatures).some(key => localFeatures[key] !== serverFeatures[key]);
    const fieldsChanged = localFields.some(f => {
      const server = serverFields.find(s => s.id === f.id);
      return server && f.enabled !== server.enabled;
    });
    const settingsChanged = localSettings.promotionsPerPage !== serverSettings.promotionsPerPage;
    return featuresChanged || fieldsChanged || settingsChanged;
  }, [localFeatures, serverFeatures, localFields, serverFields, localSettings, serverSettings]);

  // SYS-012: Unsaved changes warning
  useUnsavedChangesWarning(hasChanges && activeTab === 'config');

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
      if (localSettings.promotionsPerPage !== serverSettings.promotionsPerPage) {
        await setSetting({ moduleKey: MODULE_KEY, settingKey: 'promotionsPerPage', value: localSettings.promotionsPerPage });
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
    await seedPromotionsModule();
    toast.dismiss();
    toast.success('Đã tạo dữ liệu mẫu thành công!');
  };

  const handleClearData = async () => {
    if (!confirm('Xóa toàn bộ voucher/khuyến mãi?')) return;
    toast.loading('Đang xóa dữ liệu...');
    await clearPromotionsData();
    toast.dismiss();
    toast.success('Đã xóa toàn bộ khuyến mãi!');
  };

  const handleResetAll = async () => {
    if (!confirm('Reset dữ liệu về mặc định?')) return;
    toast.loading('Đang reset dữ liệu...');
    await clearPromotionsData();
    await seedPromotionsModule();
    toast.dismiss();
    toast.success('Đã reset dữ liệu thành công!');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-pink-500" />
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return <Badge variant="success">Hoạt động</Badge>;
      case 'Inactive':
        return <Badge variant="secondary">Tạm dừng</Badge>;
      case 'Expired':
        return <Badge variant="destructive">Hết hạn</Badge>;
      case 'Scheduled':
        return <Badge variant="warning">Chờ kích hoạt</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <ModuleHeader
        icon={Ticket}
        title="Module Khuyến mãi"
        description="Quản lý voucher và mã giảm giá"
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
          onClick={() => setActiveTab('config')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'config'
              ? 'border-pink-500 text-pink-600 dark:text-pink-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Settings size={16} /> Cấu hình
        </button>
        <button
          onClick={() => setActiveTab('data')}
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
          <ModuleStatus isCore={moduleData?.isCore ?? false} enabled={moduleData?.enabled ?? true} toggleColor="bg-pink-500" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="space-y-4">
              <SettingsCard>
                <SettingInput 
                  label="Số voucher / trang" 
                  value={localSettings.promotionsPerPage} 
                  onChange={(v) => setLocalSettings({...localSettings, promotionsPerPage: v})}
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
                title="Trường khuyến mãi"
                icon={Ticket}
                iconColorClass="text-pink-500"
                fields={localFields}
                onToggle={handleToggleField}
                fieldColorClass="bg-pink-500/10 text-pink-600 dark:text-pink-400"
                toggleColor="bg-pink-500"
              />
            </div>
          </div>

          <ConventionNote>
            <strong>Convention:</strong> <Code>discountType</Code>: percent, fixed. <Code>code</Code> unique và uppercase. Validate trước khi áp dụng.
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
                <p className="text-sm text-slate-500 mt-1">Seed, clear hoặc reset dữ liệu khuyến mãi</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleSeedAll} className="gap-2">
                  <Database size={16} /> Seed Data
                </Button>
                <Button variant="outline" onClick={handleClearData} className="gap-2 text-red-500 hover:text-red-600">
                  <Trash2 size={16} /> Clear All
                </Button>
                <Button onClick={handleResetAll} className="gap-2 bg-pink-600 hover:bg-pink-500">
                  <RefreshCw size={16} /> Reset
                </Button>
              </div>
            </div>
          </Card>

          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-pink-500/10 rounded-lg">
                  <Ticket className="w-5 h-5 text-pink-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{statsData?.totalCount ?? 0}</p>
                  <p className="text-sm text-slate-500">Tổng voucher</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{statsData?.activeCount ?? 0}</p>
                  <p className="text-sm text-slate-500">Đang hoạt động</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 rounded-lg">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{statsData?.scheduledCount ?? 0}</p>
                  <p className="text-sm text-slate-500">Chờ kích hoạt</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{statsData?.totalUsed ?? 0}</p>
                  <p className="text-sm text-slate-500">Lượt sử dụng</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Type breakdown */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <Percent className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{statsData?.percentTypeCount ?? 0}</p>
                  <p className="text-sm text-slate-500">Giảm theo %</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-cyan-500/10 rounded-lg">
                  <DollarSign className="w-5 h-5 text-cyan-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{statsData?.fixedTypeCount ?? 0}</p>
                  <p className="text-sm text-slate-500">Giảm cố định</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Promotions Table */}
          <Card>
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <Ticket className="w-5 h-5 text-pink-500" />
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">Khuyến mãi ({promotionsData?.length ?? 0})</h3>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên / Mã</TableHead>
                  <TableHead>Giảm giá</TableHead>
                  <TableHead>Thời gian</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Đã dùng</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {promotionsData?.map(promo => (
                  <TableRow key={promo._id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{promo.name}</p>
                        <code className="text-xs text-pink-600 bg-pink-50 dark:bg-pink-900/20 px-1.5 py-0.5 rounded">{promo.code}</code>
                      </div>
                    </TableCell>
                    <TableCell>
                      {promo.discountType === 'percent' ? (
                        <Badge variant="secondary" className="bg-purple-500/10 text-purple-600">
                          -{promo.discountValue}%
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-cyan-500/10 text-cyan-600">
                          -{formatCurrency(promo.discountValue)}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-slate-500">
                      {formatDate(promo.startDate)} - {formatDate(promo.endDate)}
                    </TableCell>
                    <TableCell>{getStatusBadge(promo.status)}</TableCell>
                    <TableCell className="text-right">
                      {promo.usageLimit ? (
                        <span>{promo.usedCount}/{promo.usageLimit}</span>
                      ) : (
                        <span>{promo.usedCount}</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {(!promotionsData || promotionsData.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                      Chưa có khuyến mãi nào. Nhấn &quot;Seed Data&quot; để tạo dữ liệu mẫu.
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
