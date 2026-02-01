'use client';

import React, { useMemo } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { FileText, LayoutTemplate } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/admin/components/ui';
import { ModuleHeader } from '@/components/modules/shared';
import { 
  ExperienceModuleLink, 
  ExperienceSummaryGrid, 
  ExperienceHintCard,
  ExperiencePreview,
  PostsListPreview,
  ExampleLinks,
  type SummaryItem 
} from '@/components/experiences';
import { useExperienceConfig, useExperienceSave, useExamplePostCategorySlug, EXPERIENCE_NAMES, MESSAGES } from '@/lib/experiences';

type ListLayoutStyle = 'fullwidth' | 'sidebar' | 'magazine';

type PostsListExperienceConfig = {
  layoutStyle: ListLayoutStyle;
};

const EXPERIENCE_KEY = 'posts_list_ui';

// Legacy keys for backward compatibility with /posts page
const LEGACY_LAYOUT_KEY = 'posts_list_style';

const LAYOUT_STYLES: { id: ListLayoutStyle; label: string; description: string }[] = [
  { description: 'Horizontal filter bar + grid/list toggle, tối ưu mobile', id: 'fullwidth', label: 'Full Width' },
  { description: 'Classic blog với sidebar filters, categories, recent posts', id: 'sidebar', label: 'Sidebar' },
  { description: 'Hero slider + category tabs, phong cách editorial', id: 'magazine', label: 'Magazine' },
];

const DEFAULT_CONFIG: PostsListExperienceConfig = {
  layoutStyle: 'fullwidth',
};

const HINTS = [
  'Grid layout phù hợp với blog có nhiều hình ảnh.',
  'Masonry layout tạo giao diện độc đáo nhưng phức tạp hơn.',
  'Sidebar filters giúp user dễ lọc content.',
];

export default function PostsListExperiencePage() {
  const experienceSetting = useQuery(api.settings.getByKey, { key: EXPERIENCE_KEY });
  const postsModule = useQuery(api.admin.modules.getModuleByKey, { key: 'posts' });
  const exampleCategorySlug = useExamplePostCategorySlug();
  
  // Read legacy layout setting
  const legacyLayoutSetting = useQuery(api.settings.getByKey, { key: LEGACY_LAYOUT_KEY });

  const serverConfig = useMemo<PostsListExperienceConfig>(() => {
    const raw = experienceSetting?.value as Partial<PostsListExperienceConfig> | undefined;
    const legacyLayout = legacyLayoutSetting?.value as string;
    const rawLayout = raw?.layoutStyle as string | undefined;
    
    const normalizeLayoutStyle = (value?: string): ListLayoutStyle => {
      if (value === 'fullwidth' || value === 'grid') {return 'fullwidth';}
      if (value === 'sidebar' || value === 'list') {return 'sidebar';}
      if (value === 'magazine' || value === 'masonry') {return 'magazine';}
      return 'fullwidth';
    };
    
    return {
      layoutStyle: normalizeLayoutStyle(rawLayout ?? legacyLayout),
    };
  }, [experienceSetting?.value, legacyLayoutSetting?.value]);

  const isLoading = experienceSetting === undefined || postsModule === undefined;

  const { config, setConfig, hasChanges } = useExperienceConfig(serverConfig, DEFAULT_CONFIG, isLoading);
  
  // Additional settings to sync with legacy keys
  const additionalSettings = useMemo(() => [
    { group: 'posts', key: LEGACY_LAYOUT_KEY, value: config.layoutStyle }
  ], [config.layoutStyle]);
  
  const { handleSave, isSaving } = useExperienceSave(
    EXPERIENCE_KEY, 
    config, 
    MESSAGES.saveSuccess(EXPERIENCE_NAMES[EXPERIENCE_KEY]),
    additionalSettings
  );

  const summaryItems: SummaryItem[] = [
    { label: 'Layout', value: config.layoutStyle, format: 'capitalize' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500">{MESSAGES.loading}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <ModuleHeader
        icon={LayoutTemplate}
        title="Trải nghiệm: Danh sách bài viết"
        description="Cấu hình layout, filters, search và pagination cho trang danh sách bài viết."
        iconBgClass="bg-blue-500/10"
        iconTextClass="text-blue-600 dark:text-blue-400"
        buttonClass="bg-blue-600 hover:bg-blue-500"
        onSave={handleSave}
        hasChanges={hasChanges}
        isSaving={isSaving}
      />

      {/* Full-width Preview - Realtime khi config thay đổi */}
      <ExperiencePreview title="Danh sách bài viết">
        <PostsListPreview
          layoutStyle={config.layoutStyle}
        />
      </ExperiencePreview>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="space-y-4 lg:col-span-2">
          <Card className="p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-shrink-0">
                <h3 className="font-medium text-sm text-slate-900 dark:text-slate-100">Trang danh sách</h3>
                <p className="text-xs text-slate-500">/posts</p>
              </div>
              <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                {LAYOUT_STYLES.map((style) => (
                  <button
                    key={style.id}
                    onClick={() =>{  setConfig(prev => ({ ...prev, layoutStyle: style.id })); }}
                    title={style.description}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                      config.layoutStyle === style.id 
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    {style.label}
                  </button>
                ))}
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              {LAYOUT_STYLES.find((style) => style.id === config.layoutStyle)?.description}
            </p>
          </Card>

          <ExperienceSummaryGrid items={summaryItems} />
        </div>

        <div className="space-y-4">
          <ExampleLinks
            links={[
              { label: 'Trang danh sách bài viết', url: '/posts', description: 'Xem tất cả bài viết' },
              ...(exampleCategorySlug ? [{ label: 'Lọc theo category', url: `/posts?catpost=${exampleCategorySlug}`, description: 'Ví dụ filter' }] : []),
            ]}
            color="#3b82f6"
          />

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Module liên quan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <ExperienceModuleLink
                enabled={postsModule?.enabled ?? false}
                href="/system/modules/posts"
                icon={FileText}
                title="Bài viết"
                colorScheme="cyan"
              />
            </CardContent>
          </Card>

          <ExperienceHintCard hints={HINTS} />
        </div>
      </div>
    </div>
  );
}
