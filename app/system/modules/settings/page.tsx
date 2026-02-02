import { ModuleConfigPage } from '@/components/modules/ModuleConfigPage';
import { settingsModule } from '@/lib/modules/configs/settings.config';
import { SettingsDataTab } from '@/components/modules/settings/SettingsDataTab';

export default function SettingsModuleConfigPage() {
  return (
    <ModuleConfigPage 
      config={settingsModule}
      renderDataTab={({ colorClasses }) => <SettingsDataTab colorClasses={colorClasses} />}
    />
  );
}
