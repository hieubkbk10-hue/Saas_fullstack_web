'use client';

import { ModuleConfigPage } from '@/components/modules/ModuleConfigPage';
import { ordersModule } from '@/lib/modules/configs/orders.config';
import { OrdersDataTab } from '@/components/modules/orders';

export default function OrdersModuleConfigPage() {
  return (
    <ModuleConfigPage 
      config={ordersModule}
      renderDataTab={({ colorClasses }) => (
        <OrdersDataTab colorClasses={colorClasses} />
      )}
    />
  );
}
