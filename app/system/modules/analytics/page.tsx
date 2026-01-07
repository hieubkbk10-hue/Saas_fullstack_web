'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { toast } from 'sonner';
import { BarChart3, TrendingUp, Users, Package, Eye, Loader2, Database, Settings, RefreshCw, Trash2, FileDown } from 'lucide-react';
import { FieldConfig } from '@/types/moduleConfig';
import { 
  ModuleHeader, ModuleStatus, ConventionNote, Code,
  SettingsCard, SettingSelect, SettingInput, FeaturesCard, FieldsCard, ToggleSwitch
} from '@/components/modules/shared';
import { Card, Badge, Button } from '@/app/admin/components/ui';

const MODULE_KEY = 'analytics';

const FEATURES_CONFIG = [
  { key: 'enableSales', label: 'Báo cáo doanh thu', icon: TrendingUp, description: 'Thống kê đơn hàng, doanh thu theo thời gian', linkedField: 'revenue' },
  { key: 'enableCustomers', label: 'Báo cáo khách hàng', icon: Users, description: 'Khách mới, khách quay lại, phân khúc', linkedField: 'newCustomers' },
  { key: 'enableProducts', label: 'Báo cáo sản phẩm', icon: Package, description: 'Sản phẩm bán chạy, tồn kho, xu hướng', linkedField: 'topProducts' },
  { key: 'enableTraffic', label: 'Báo cáo lượt truy cập', icon: Eye, description: 'Pageviews, sessions, nguồn traffic', linkedField: 'pageviews' },
  { key: 'enableExport', label: 'Xuất báo cáo', icon: FileDown, description: 'Export CSV, Excel, PDF', linkedField: 'exportFormat' },
];

type FeaturesState = Record<string, boolean>;
type SettingsState = { defaultPeriod: string; autoRefresh: boolean; refreshInterval: number };
type TabType = 'config' | 'data';

export default function AnalyticsModuleConfigPage() {
  const [activeTab, setActiveTab] = useState<TabType>('config');

  // Queries
  const moduleData = useQuery(api.admin.modules.getModuleByKey, { key: MODULE_KEY });
  const featuresData = useQuery(api.admin.modules.listModuleFeatures, { moduleKey: MODULE_KEY });
  const fieldsData = useQuery(api.admin.modules.listModuleFields, { moduleKey: MODULE_KEY });
  const settingsData = useQuery(api.admin.modules.listModuleSettings, { moduleKey: MODULE_KEY });

  // Mutations
  const toggleFeature = useMutation(api.admin.modules.toggleModuleFeature);
  const updateField = useMutation(api.admin.modules.updateModuleField);
  const setSetting = useMutation(api.admin.modules.setModuleSetting);
  const seedAnalyticsModule = useMutation(api.seed.seedAnalyticsModule);
  const clearAnalyticsConfig = useMutation(api.seed.clearAnalyticsConfig);

  // Local state
  const [localFeatures, setLocalFeatures] = useState<FeaturesState>({});
  const [localFields, setLocalFields] = useState<FieldConfig[]>([]);
  const [localSettings, setLocalSettings] = useState<SettingsState>({ defaultPeriod: '30d', autoRefresh: true, refreshInterval: 300 });
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
      const defaultPeriod = settingsData.find(s => s.settingKey === 'defaultPeriod')?.value as string ?? '30d';
      const autoRefresh = settingsData.find(s => s.settingKey === 'autoRefresh')?.value as boolean ?? true;
      const refreshInterval = settingsData.find(s => s.settingKey === 'refreshInterval')?.value as number ?? 300;
      setLocalSettings({ defaultPeriod, autoRefresh, refreshInterval });
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
    const defaultPeriod = settingsData?.find(s => s.settingKey === 'defaultPeriod')?.value as string ?? '30d';
    const autoRefresh = settingsData?.find(s => s.settingKey === 'autoRefresh')?.value as boolean ?? true;
    const refreshInterval = settingsData?.find(s => s.settingKey === 'refreshInterval')?.value as number ?? 300;
    return { defaultPeriod, autoRefresh, refreshInterval };
  }, [settingsData]);

  // Check for changes
  const hasChanges = useMemo(() => {
    const featuresChanged = Object.keys(localFeatures).some(key => localFeatures[key] !== serverFeatures[key]);
    const fieldsChanged = localFields.some(f => {
      const serverField = serverFields.find(sf => sf.id === f.id);
      return serverField && f.enabled !== serverField.enabled;
    });
    const settingsChanged = 
      localSettings.defaultPeriod !== serverSettings.defaultPeriod ||
      localSettings.autoRefresh !== serverSettings.autoRefresh ||
      localSettings.refreshInterval !== serverSettings.refreshInterval;
    return featuresChanged || fieldsChanged || settingsChanged;
  }, [localFeatures, serverFeatures, localFields, serverFields, localSettings, serverSettings]);

  const handleToggleFeature = (key: string) => {
    setLocalFeatures(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleToggleField = (key: string) => {
    setLocalFields(prev => prev.map(f => f.key === key ? { ...f, enabled: !f.enabled } : f));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Save changed features
      for (const key of Object.keys(localFeatures)) {
        if (localFeatures[key] !== serverFeatures[key]) {
          await toggleFeature({ moduleKey: MODULE_KEY, featureKey: key, enabled: localFeatures[key] });
        }
      }
      // Save changed fields
      for (const field of localFields) {
        const serverField = serverFields.find(sf => sf.id === field.id);
        if (serverField && field.enabled !== serverField.enabled) {
          await updateField({ id: field.id as Id<"moduleFields">, enabled: field.enabled });
        }
      }
      // Save changed settings
      if (localSettings.defaultPeriod !== serverSettings.defaultPeriod) {
        await setSetting({ moduleKey: MODULE_KEY, settingKey: 'defaultPeriod', value: localSettings.defaultPeriod });
      }
      if (localSettings.autoRefresh !== serverSettings.autoRefresh) {
        await setSetting({ moduleKey: MODULE_KEY, settingKey: 'autoRefresh', value: localSettings.autoRefresh });
      }
      if (localSettings.refreshInterval !== serverSettings.refreshInterval) {
        await setSetting({ moduleKey: MODULE_KEY, settingKey: 'refreshInterval', value: localSettings.refreshInterval });
      }
      toast.success('Đã lưu cấu hình thành công!');
    } catch {
      toast.error('Có lỗi xảy ra khi lưu cấu hình');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSeedData = async () => {
    toast.loading('Đang khởi tạo dữ liệu...');
    await seedAnalyticsModule();
    toast.dismiss();
    toast.success('Đã khởi tạo dữ liệu thành công!');
  };

  const handleClearConfig = async () => {
    toast.loading('Đang xóa cấu hình...');
    await clearAnalyticsConfig();
    toast.dismiss();
    toast.success('Đã xóa cấu hình thành công!');
  };

  const handleResetConfig = async () => {
    toast.loading('Đang reset cấu hình...');
    await clearAnalyticsConfig();
    await seedAnalyticsModule();
    toast.dismiss();
    toast.success('Đã reset cấu hình thành công!');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-pink-500" />
      </div>
    );
  }

  const hasConfig = featuresData && featuresData.length > 0;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <ModuleHeader
        icon={BarChart3}
        title="Module Báo cáo & Thống kê"
        description="Dashboard phân tích dữ liệu kinh doanh"
        iconBgClass="bg-pink-500/10"
        iconTextClass="text-pink-600 dark:text-pink-400"
        buttonClass="bg-pink-600 hover:bg-pink-500"
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
          {!hasConfig ? (
            <Card className="p-8 text-center">
              <BarChart3 size={48} className="mx-auto text-slate-300 mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">Chưa có cấu hình module</h3>
              <p className="text-slate-500 mb-4">Nhấn nút bên dưới để khởi tạo cấu hình cho module Analytics</p>
              <Button onClick={handleSeedData} className="bg-pink-600 hover:bg-pink-500">
                <Database size={16} className="mr-2" /> Khởi tạo cấu hình
              </Button>
            </Card>
          ) : (
            <>
              <ModuleStatus isCore={moduleData?.isCore ?? false} enabled={moduleData?.enabled ?? true} toggleColor="bg-pink-500" />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="space-y-4">
                  <SettingsCard>
                    <SettingSelect
                      label="Khoảng thời gian mặc định"
                      value={localSettings.defaultPeriod}
                      onChange={(v) => setLocalSettings({...localSettings, defaultPeriod: v})}
                      options={[
                        { value: '7d', label: '7 ngày' },
                        { value: '30d', label: '30 ngày' },
                        { value: '90d', label: '90 ngày' },
                        { value: '1y', label: '1 năm' },
                      ]}
                      focusColor="focus:border-pink-500"
                    />
                    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-950">
                      <span className="text-xs text-slate-700 dark:text-slate-200">Tự động refresh</span>
                      <ToggleSwitch 
                        enabled={localSettings.autoRefresh}
                        onChange={() => setLocalSettings({...localSettings, autoRefresh: !localSettings.autoRefresh})}
                        color="bg-pink-500"
                      />
                    </div>
                    {localSettings.autoRefresh && (
                      <SettingInput
                        label="Refresh interval (giây)"
                        value={localSettings.refreshInterval}
                        onChange={(v) => setLocalSettings({...localSettings, refreshInterval: v})}
                        focusColor="focus:border-pink-500"
                      />
                    )}
                  </SettingsCard>

                  <FeaturesCard
                    features={FEATURES_CONFIG.map(f => ({ config: f, enabled: localFeatures[f.key] ?? false }))}
                    onToggle={handleToggleFeature}
                    toggleColor="bg-pink-500"
                  />
                </div>

                <div className="lg:col-span-2">
                  <FieldsCard
                    title="Trường dữ liệu"
                    icon={BarChart3}
                    iconColorClass="text-pink-500"
                    fields={localFields}
                    onToggle={handleToggleField}
                    fieldColorClass="bg-pink-500/10 text-pink-600 dark:text-pink-400"
                    toggleColor="bg-pink-500"
                  />
                </div>
              </div>

              <ConventionNote>
                <strong>Convention:</strong> Dữ liệu thống kê được cache và refresh định kỳ theo <Code>refreshInterval</Code>. Hỗ trợ export CSV/Excel/PDF.
              </ConventionNote>
            </>
          )}
        </>
      )}

      {activeTab === 'data' && (
        <AnalyticsDataTab
          featuresEnabled={localFeatures}
          onSeedData={handleSeedData}
          onClearConfig={handleClearConfig}
          onResetConfig={handleResetConfig}
        />
      )}
    </div>
  );
}

function AnalyticsDataTab({
  featuresEnabled,
  onSeedData,
  onClearConfig,
  onResetConfig
}: {
  featuresEnabled: FeaturesState;
  onSeedData: () => Promise<void>;
  onClearConfig: () => Promise<void>;
  onResetConfig: () => Promise<void>;
}) {
  // Sample statistics (in real app, these would come from queries)
  const stats = [
    { label: 'Doanh thu tháng', value: '125.5M', change: '+12%', icon: TrendingUp, enabled: featuresEnabled.enableSales },
    { label: 'Đơn hàng', value: '1,234', change: '+8%', icon: Package, enabled: featuresEnabled.enableSales },
    { label: 'Khách mới', value: '256', change: '+15%', icon: Users, enabled: featuresEnabled.enableCustomers },
    { label: 'Lượt xem', value: '45.2K', change: '+22%', icon: Eye, enabled: featuresEnabled.enableTraffic },
  ];

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.filter(s => s.enabled !== false).map((stat, i) => (
          <Card key={i} className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-pink-500/10 rounded-lg">
                <stat.icon size={20} className="text-pink-600 dark:text-pink-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500">{stat.label}</p>
                <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{stat.value}</p>
                <Badge variant="success" className="text-xs">{stat.change}</Badge>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Chart placeholder */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Biểu đồ doanh thu</h3>
        <div className="h-64 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
          <div className="text-center text-slate-500">
            <BarChart3 size={48} className="mx-auto mb-2 opacity-50" />
            <p>Chart placeholder</p>
            <p className="text-xs">Tích hợp recharts hoặc chart.js tại đây</p>
          </div>
        </div>
      </Card>

      {/* Top Products placeholder */}
      {featuresEnabled.enableProducts && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Sản phẩm bán chạy</h3>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-pink-600">#{i}</span>
                  <span className="text-sm text-slate-700 dark:text-slate-300">Sản phẩm mẫu {i}</span>
                </div>
                <Badge variant="default">{100 - i * 15} đã bán</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Actions */}
      <Card className="p-4">
        <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Quản lý cấu hình</h4>
        <div className="flex flex-wrap gap-2">
          <Button onClick={onSeedData} variant="outline" size="sm">
            <Database size={14} className="mr-1" /> Seed Config
          </Button>
          <Button onClick={onClearConfig} variant="outline" size="sm" className="text-red-600 border-red-300 hover:bg-red-50">
            <Trash2 size={14} className="mr-1" /> Xóa Config
          </Button>
          <Button onClick={onResetConfig} variant="outline" size="sm">
            <RefreshCw size={14} className="mr-1" /> Reset Config
          </Button>
        </div>
      </Card>
    </div>
  );
}
