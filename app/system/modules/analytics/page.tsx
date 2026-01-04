'use client';

import React, { useState } from 'react';
import { BarChart3, TrendingUp, Users, Package, Eye } from 'lucide-react';
import { 
  ModuleHeader, ModuleStatus, ConventionNote,
  SettingsCard, SettingSelect, FeaturesCard, ToggleSwitch
} from '@/components/modules/shared';

const FEATURES = [
  { key: 'enableSales', label: 'Báo cáo doanh thu', icon: TrendingUp, description: 'Thống kê đơn hàng, doanh thu' },
  { key: 'enableCustomers', label: 'Báo cáo khách hàng', icon: Users, description: 'Khách mới, khách quay lại' },
  { key: 'enableProducts', label: 'Báo cáo sản phẩm', icon: Package, description: 'SP bán chạy, tồn kho' },
  { key: 'enableTraffic', label: 'Báo cáo lượt truy cập', icon: Eye, description: 'Pageviews, sessions' },
];

export default function AnalyticsModuleConfigPage() {
  const [features, setFeatures] = useState({ 
    enableSales: true, 
    enableCustomers: true, 
    enableProducts: true, 
    enableTraffic: false 
  });
  const [settings, setSettings] = useState({ defaultPeriod: '30d', autoRefresh: true });

  const handleToggleFeature = (key: string) => {
    setFeatures(prev => ({ ...prev, [key]: !(prev as any)[key] }));
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <ModuleHeader
        icon={BarChart3}
        title="Module Báo cáo & Thống kê"
        description="Dashboard phân tích dữ liệu"
        iconBgClass="bg-pink-500/10"
        iconTextClass="text-pink-600 dark:text-pink-400"
        buttonClass="bg-pink-600 hover:bg-pink-500"
      />

      <ModuleStatus isCore={false} enabled={true} toggleColor="bg-pink-500" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="space-y-4">
          <SettingsCard>
            <SettingSelect
              label="Khoảng thời gian mặc định"
              value={settings.defaultPeriod}
              onChange={(v) => setSettings({...settings, defaultPeriod: v})}
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
                enabled={settings.autoRefresh} 
                onChange={() => setSettings({...settings, autoRefresh: !settings.autoRefresh})}
                color="bg-pink-500"
              />
            </div>
          </SettingsCard>
        </div>

        <div className="lg:col-span-2">
          <FeaturesCard
            features={FEATURES.map(f => ({ config: f, enabled: (features as any)[f.key] }))}
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
