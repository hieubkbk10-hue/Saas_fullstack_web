'use client';

import { ModuleConfigPage } from '@/components/modules/ModuleConfigPage';
import { homepageModule } from '@/lib/modules/configs/homepage.config';
import { HomepageDataTab } from '@/components/modules/homepage';

export default function HomepageModuleConfigPage() {
  return (
    <ModuleConfigPage 
      config={homepageModule}
      renderDataTab={({ colorClasses }) => (
        <HomepageDataTab colorClasses={colorClasses} />
      )}
    />
  );
}
