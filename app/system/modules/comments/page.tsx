'use client';

import { ModuleConfigPage } from '@/components/modules/ModuleConfigPage';
import { commentsModule } from '@/lib/modules/configs/comments.config';
import { CommentsDataTab } from '@/components/modules/comments';

export default function CommentsModuleConfigPage() {
  return (
    <ModuleConfigPage 
      config={commentsModule}
      renderDataTab={({ colorClasses }) => (
        <CommentsDataTab colorClasses={colorClasses} />
      )}
    />
  );
}
