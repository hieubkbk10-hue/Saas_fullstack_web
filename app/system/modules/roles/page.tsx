'use client';

import { ModuleConfigPage } from '@/components/modules/ModuleConfigPage';
import { rolesModule } from '@/lib/modules/configs/roles.config';
import { RolesDataTab } from '@/components/modules/roles';

export default function RolesModuleConfigPage() {
  return (
    <ModuleConfigPage 
      config={rolesModule}
      renderDataTab={({ colorClasses }) => (
        <RolesDataTab colorClasses={colorClasses} />
      )}
    />
  );
}
