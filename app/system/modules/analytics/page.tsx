'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { toast } from 'sonner';
import { BarChart3, TrendingUp, Users, Package, Eye, Loader2 } from 'lucide-react';
import { 
  ModuleHeader, ModuleStatus, ConventionNote,
  SettingsCard, SettingSelect, FeaturesCard, ToggleSwitch
} from '@/components/modules/shared';

const FEATURES_CONFIG = [
  { key: 'enableSales', label: 'Báo cáo doanh thu', icon: TrendingUp, description: 'Thống kê đơn hàng, doanh thu' },
  { key: 'enableCustomers', label: 'Báo cáo khách hàng', icon: Users, description: 'Khách mới, khách quay lại' },
  { key: 'enableProducts', label: 'Báo cáo sản phẩm', icon: Package, description: 'SP bán chạy, tồn kho' },
  { key: 'enableTraffic', label: 'Báo cáo lượt truy cập', icon: Eye, description: 'Pageviews, sessions' },
];

const MODULE_KEY = 'analytics';

type FeaturesState = Record<string, boolean>;
type SettingsState = { defaultPeriod: string; autoRefresh: boolean };

export default function AnalyticsModuleConfigPage() {
  const moduleData = useQuery(api.admin.modules.getModuleByKey, { key: MODULE_KEY });
  const featuresData = useQuery(api.admin.modules.listModuleFeatures, { moduleKey: MODULE_KEY });
  const settingsData = useQuery(api.admin.modules.listModuleSettings, { moduleKey: MODULE_KEY });
  
  const toggleFeature = useMutation(api.admin.modules.toggleModuleFeature);
  const setSetting = useMutation(api.admin.modules.setModuleSetting);
  const seedAnalyticsFeatures = useMutation(api.seed.seedAnalyticsFeatures);

  const [localFeatures, setLocalFeatures] = useState<FeaturesState>({});
  const [localSettings, setLocalSettings] = useState<SettingsState>({ defaultPeriod: '30d', autoRefresh: true });
  const [isSaving, setIsSaving] = useState(false);

  const isLoading = moduleData === undefined || featuresData === undefined || settingsData === undefined;

  // Seed features nếu chưa có
  useEffect(() => {
    if (featuresData !== undefined && featuresData.length === 0) {
      seedAnalyticsFeatures();
    }
  }, [featuresData, seedAnalyticsFeatures]);

  // Sync server data to local state
  useEffect(() => {
    if (featuresData) {
      const features: FeaturesState = {};
      featuresData.forEach(f => { features[f.featureKey] = f.enabled; });
      setLocalFeatures(features);
    }
  }, [featuresData]);

  useEffect(() => {
    if (settingsData) {
      const period = settingsData.find(s => s.settingKey === 'defaultPeriod')?.value as string ?? '30d';
      const refresh = settingsData.find(s => s.settingKey === 'autoRefresh')?.value as boolean ?? true;
      setLocalSettings({ defaultPeriod: period, autoRefresh: refresh });
    }
  }, [settingsData]);

  // Server state để so sánh
  const serverFeatures = useMemo(() => {
    const result: FeaturesState = {};
    featuresData?.forEach(f => { result[f.featureKey] = f.enabled; });
    return result;
  }, [featuresData]);

  const serverSettings = useMemo(() => {
    const period = settingsData?.find(s => s.settingKey === 'defaultPeriod')?.value as string ?? '30d';
    const refresh = settingsData?.find(s => s.settingKey === 'autoRefresh')?.value as boolean ?? true;
    return { defaultPeriod: period, autoRefresh: refresh };
  }, [settingsData]);

  // Check có thay đổi không
  const hasChanges = useMemo(() => {
    const featuresChanged = Object.keys(localFeatures).some(
      key => localFeatures[key] !== serverFeatures[key]
    );
    const settingsChanged = 
      localSettings.defaultPeriod !== serverSettings.defaultPeriod ||
      localSettings.autoRefresh !== serverSettings.autoRefresh;
    return featuresChanged || settingsChanged;
  }, [localFeatures, serverFeatures, localSettings, serverSettings]);

  const handleToggleFeature = (key: string) => {
    setLocalFeatures(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSettingChange = (settingKey: keyof SettingsState, value: string | boolean) => {
    setLocalSettings(prev => ({ ...prev, [settingKey]: value }));
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
      // Save changed settings
      if (localSettings.defaultPeriod !== serverSettings.defaultPeriod) {
        await setSetting({ moduleKey: MODULE_KEY, settingKey: 'defaultPeriod', value: localSettings.defaultPeriod });
      }
      if (localSettings.autoRefresh !== serverSettings.autoRefresh) {
        await setSetting({ moduleKey: MODULE_KEY, settingKey: 'autoRefresh', value: localSettings.autoRefresh });
      }
      toast.success('Đã lưu cấu hình thành công!');
    } catch {
      toast.error('Có lỗi xảy ra khi lưu cấu hình');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-pink-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <ModuleHeader
        icon={BarChart3}
        title="Module Báo cáo & Thống kê"
        description="Dashboard phân tích dữ liệu"
        iconBgClass="bg-pink-500/10"
        iconTextClass="text-pink-600 dark:text-pink-400"
        buttonClass="bg-pink-600 hover:bg-pink-500"
        onSave={handleSave}
        hasChanges={hasChanges}
        isSaving={isSaving}
      />

      <ModuleStatus isCore={moduleData?.isCore ?? false} enabled={moduleData?.enabled ?? true} toggleColor="bg-pink-500" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="space-y-4">
          <SettingsCard>
            <SettingSelect
              label="Khoảng thời gian mặc định"
              value={localSettings.defaultPeriod}
              onChange={(v) => handleSettingChange('defaultPeriod', v)}
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
                onChange={() => handleSettingChange('autoRefresh', !localSettings.autoRefresh)}
                color="bg-pink-500"
              />
            </div>
          </SettingsCard>
        </div>

        <div className="lg:col-span-2">
          <FeaturesCard
            features={FEATURES_CONFIG.map(f => ({ 
              config: f, 
              enabled: localFeatures[f.key] ?? false 
            }))}
            onToggle={handleToggleFeature}
            toggleColor="bg-pink-500"
          />
        </div>
      </div>

      <ConventionNote>
        <strong>Convention:</strong> Dữ liệu thống kê được cache và refresh định kỳ. Hỗ trợ export CSV/Excel.
      </ConventionNote>
    </div>
  );
}
