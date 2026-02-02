import { ModuleConfigPage } from '@/components/modules/ModuleConfigPage';
import { promotionsModule } from '@/lib/modules/configs/promotions.config';
import { PromotionsDataTab } from '@/components/modules/promotions/PromotionsDataTab';

export default function PromotionsModuleConfigPage() {
  return (
    <ModuleConfigPage 
      config={promotionsModule}
      renderDataTab={({ colorClasses }) => <PromotionsDataTab colorClasses={colorClasses} />}
    />
  );
}
