'use client';

import { ModuleConfigPage } from '@/components/modules/ModuleConfigPage';
import { wishlistModule } from '@/lib/modules/configs/wishlist.config';
import { WishlistDataTab } from '@/components/modules/wishlist';

export default function WishlistModuleConfigPage() {
  return (
    <ModuleConfigPage 
      config={wishlistModule}
      renderDataTab={({ colorClasses }) => (
        <WishlistDataTab colorClasses={colorClasses} />
      )}
    />
  );
}
