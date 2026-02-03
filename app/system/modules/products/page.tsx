'use client';

import { ModuleConfigPage } from '@/components/modules/ModuleConfigPage';
import { productsModule } from '@/lib/modules/configs/products.config';
import { ProductsDataTab } from '@/components/modules/products/ProductsDataTab';

export default function ProductsModuleConfigPage() {
  return (
    <ModuleConfigPage 
      config={productsModule}
      renderDataTab={({ colorClasses }) => <ProductsDataTab colorClasses={colorClasses} />}
    />
  );
}
