'use client';

import { ModuleConfigPage } from '@/components/modules/ModuleConfigPage';
import { analyticsModule } from '@/lib/modules/configs/analytics.config';
import { AnalyticsDataTab } from '@/components/modules/analytics/AnalyticsDataTab';

export default function AnalyticsModuleConfigPage() {
  return (
    <ModuleConfigPage 
      config={analyticsModule}
      renderDataTab={({ colorClasses }) => <AnalyticsDataTab colorClasses={colorClasses} />}
    />
  );
}
