import { ModuleConfigPage } from '@/components/modules/ModuleConfigPage';
import { mediaModule } from '@/lib/modules/configs/media.config';
import { MediaDataTab } from '@/components/modules/media/MediaDataTab';

export default function MediaModuleConfigPage() {
  return (
    <ModuleConfigPage 
      config={mediaModule}
      renderDataTab={({ colorClasses }) => <MediaDataTab colorClasses={colorClasses} />}
    />
  );
}
