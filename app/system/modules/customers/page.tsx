'use client';

import { ModuleConfigPage } from '@/components/modules/ModuleConfigPage';
import { customersModule } from '@/lib/modules/configs/customers.config';
import { CustomersDataTab } from '@/components/modules/customers';

export default function CustomersModuleConfigPage() {
  return (
    <ModuleConfigPage 
      config={customersModule}
      renderDataTab={({ colorClasses }) => (
        <CustomersDataTab colorClasses={colorClasses} />
      )}
    />
  );
}
