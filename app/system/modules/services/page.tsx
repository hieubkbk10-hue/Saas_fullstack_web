import { ModuleConfigPage } from '@/components/modules/ModuleConfigPage';
import { servicesModule } from '@/lib/modules/configs/services.config';
import { ServicesDataTab } from '@/components/modules/services/ServicesDataTab';

export default function ServicesModuleConfigPage() {
  return (
    <ModuleConfigPage 
      config={servicesModule}
      renderDataTab={({ colorClasses }) => <ServicesDataTab colorClasses={colorClasses} />}
    />
  );
}
