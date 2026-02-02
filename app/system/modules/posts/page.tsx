'use client';
 
 import React, { useRef, useState, useCallback } from 'react';
 import { ModuleConfigPage } from '@/components/modules/ModuleConfigPage';
 import { postsModule } from '@/lib/modules/configs/posts.config';
 import { PostsDataTab, PostsAppearanceTab } from '@/components/modules/posts';

export default function PostsModuleConfigPage() {
  const [appearanceHasChanges, setAppearanceHasChanges] = useState(false);
  const appearanceSaveRef = useRef<(() => Promise<void>) | null>(null);
  
  const handleAppearanceSave = useCallback(async () => {
    if (appearanceSaveRef.current) {
      await appearanceSaveRef.current();
    }
  }, []);
  
  return (
    <ModuleConfigPage 
      config={postsModule}
      renderDataTab={({ colorClasses }) => (
        <PostsDataTab colorClasses={colorClasses} />
      )}
      renderAppearanceTab={() => (
        <PostsAppearanceTab 
          onHasChanges={setAppearanceHasChanges}
          onSaveRef={appearanceSaveRef}
        />
      )}
      onAppearanceSave={handleAppearanceSave}
      appearanceHasChanges={appearanceHasChanges}
    />
  );
}
