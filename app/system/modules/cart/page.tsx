'use client';

import { ModuleConfigPage } from '@/components/modules/ModuleConfigPage';
import { cartModule } from '@/lib/modules/configs/cart.config';
import { CartDataTab } from '@/components/modules/cart/CartDataTab';

export default function CartModuleConfigPage() {
  return (
    <ModuleConfigPage 
      config={cartModule}
      renderDataTab={({ colorClasses }) => <CartDataTab colorClasses={colorClasses} />}
    />
  );
}
