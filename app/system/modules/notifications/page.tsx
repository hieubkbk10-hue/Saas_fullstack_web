'use client';

import { ModuleConfigPage } from '@/components/modules/ModuleConfigPage';
import { notificationsModule } from '@/lib/modules/configs/notifications.config';
import { NotificationsDataTab } from '@/components/modules/notifications/NotificationsDataTab';

export default function NotificationsModuleConfigPage() {
  return (
    <ModuleConfigPage 
      config={notificationsModule}
      renderDataTab={({ colorClasses }) => <NotificationsDataTab colorClasses={colorClasses} />}
    />
  );
}
