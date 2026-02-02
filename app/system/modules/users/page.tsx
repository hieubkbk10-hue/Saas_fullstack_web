'use client';

import { ModuleConfigPage } from '@/components/modules/ModuleConfigPage';
import { usersModule } from '@/lib/modules/configs/users.config';
import { UsersDataTab } from '@/components/modules/users';

export default function UsersModuleConfigPage() {
  return (
    <ModuleConfigPage 
      config={usersModule}
      renderDataTab={({ colorClasses }) => (
        <UsersDataTab colorClasses={colorClasses} />
      )}
    />
  );
}
