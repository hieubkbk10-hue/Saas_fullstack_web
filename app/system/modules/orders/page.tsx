'use client';

import { ModuleConfigPage } from '@/components/modules/ModuleConfigPage';
import { ordersModule } from '@/lib/modules/configs/orders.config';
import { OrdersDataTab } from '@/components/modules/orders';
import { OrdersConfigTab } from '@/components/modules/orders/OrdersConfigTab';

export default function OrdersModuleConfigPage() {
  return (
    <ModuleConfigPage 
      config={ordersModule}
      renderConfigTab={(props) => <OrdersConfigTab {...props} />}
      renderDataTab={({ colorClasses }) => (
        <OrdersDataTab colorClasses={colorClasses} />
      )}
    />
  );
}
