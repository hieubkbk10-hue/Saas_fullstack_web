'use client';

import { ModuleConfigPage } from '@/components/modules/ModuleConfigPage';
import { menusModule } from '@/lib/modules/configs/menus.config';
import { MenusDataTab } from '@/components/modules/menus';

export default function MenusModuleConfigPage() {
  return (
    <ModuleConfigPage 
      config={menusModule}
      renderDataTab={({ colorClasses }) => (
        <MenusDataTab colorClasses={colorClasses} />
      )}
    />
  );
}
