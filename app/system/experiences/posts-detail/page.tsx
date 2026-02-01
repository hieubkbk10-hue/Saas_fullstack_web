'use client';

import React, { useMemo } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { FileText, LayoutTemplate, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/admin/components/ui';
import { ModuleHeader, SettingsCard, SettingSelect } from '@/components/modules/shared';
import { 
  ExperienceModuleLink, 
  ExperienceSummaryGrid, 
  ExperienceBlockToggle,
  ExperienceHintCard,
  LivePreview,
  ExampleLinks,
  type SummaryItem 
} from '@/components/experiences';
import { useExperienceConfig, useExperienceSave, useExamplePostSlug, EXPERIENCE_NAMES, MESSAGES } from '@/lib/experiences';

type DetailLayoutStyle = 'classic' | 'modern' | 'minimal';

type PostDetailExperienceConfig = {
  layoutStyle: DetailLayoutStyle;
  showAuthor: boolean;
  showRelated: boolean;
  showShare: boolean;
  showComments: boolean;
};

const EXPERIENCE_KEY = 'posts_detail_ui';

const LAYOUT_STYLES: { id: DetailLayoutStyle; label: string; description: string }[] = [
  { description: 'Layout truyền thống với sidebar', id: 'classic', label: 'Classic' },
  { description: 'Hero image, full-width', id: 'modern', label: 'Modern' },
  { description: 'Tối giản, tập trung nội dung', id: 'minimal', label: 'Minimal' },
];

const DEFAULT_CONFIG: PostDetailExperienceConfig = {
  layoutStyle: 'classic',
  showAuthor: true,
  showRelated: true,
  showShare: true,
  showComments: true,
};

const HINTS = [
  'Classic layout phù hợp blog truyền thống.',
  'Modern layout tốt cho bài viết có hình ảnh đẹp.',
  'Related posts giúp tăng pageview.',
];

export default function PostDetailExperiencePage() {
  const experienceSetting = useQuery(api.settings.getByKey, { key: EXPERIENCE_KEY });
  const postsModule = useQuery(api.admin.modules.getModuleByKey, { key: 'posts' });
  const commentsModule = useQuery(api.admin.modules.getModuleByKey, { key: 'comments' });
  const examplePostSlug = useExamplePostSlug();

  const serverConfig = useMemo<PostDetailExperienceConfig>(() => {
    const raw = experienceSetting?.value as Partial<PostDetailExperienceConfig> | undefined;
    return {
      layoutStyle: raw?.layoutStyle ?? 'classic',
      showAuthor: raw?.showAuthor ?? true,
      showRelated: raw?.showRelated ?? true,
      showShare: raw?.showShare ?? true,
      showComments: raw?.showComments ?? true,
    };
  }, [experienceSetting?.value]);

  const isLoading = experienceSetting === undefined || postsModule === undefined;

  const { config, setConfig, hasChanges } = useExperienceConfig(serverConfig, DEFAULT_CONFIG, isLoading);
  const { handleSave, isSaving } = useExperienceSave(EXPERIENCE_KEY, config, MESSAGES.saveSuccess(EXPERIENCE_NAMES[EXPERIENCE_KEY]));

  const summaryItems: SummaryItem[] = [
    { label: 'Layout', value: config.layoutStyle, format: 'capitalize' },
    { label: 'Author Info', value: config.showAuthor },
    { label: 'Comments', value: config.showComments },
    { label: 'Related Posts', value: config.showRelated },
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
        title="Trải nghiệm: Chi tiết bài viết"
        description="Cấu hình layout, author info, comments và related posts."
        iconBgClass="bg-blue-500/10"
        iconTextClass="text-blue-600 dark:text-blue-400"
        buttonClass="bg-blue-600 hover:bg-blue-500"
        onSave={handleSave}
        hasChanges={hasChanges}
        isSaving={isSaving}
      />

      {/* Full-width Preview */}
      {examplePostSlug && (
        <LivePreview
          url={`/posts/${examplePostSlug}`}
          title="Chi tiết bài viết"
        />
      )}

      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="space-y-4 lg:col-span-2">
          <SettingsCard>
            <SettingSelect
              label="Layout chi tiết"
              value={config.layoutStyle}
              onChange={(value) => setConfig(prev => ({ ...prev, layoutStyle: value as DetailLayoutStyle }))}
              options={LAYOUT_STYLES.map(style => ({ label: `${style.label} - ${style.description}`, value: style.id }))}
              focusColor="focus:border-blue-500"
            />
          </SettingsCard>

          <Card className="p-4">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">Khối hiển thị</h3>
            <div className="space-y-3">
              <ExperienceBlockToggle
                label="Thông tin tác giả"
                description="Hiển thị author và ngày đăng"
                enabled={config.showAuthor}
                onChange={() => setConfig(prev => ({ ...prev, showAuthor: !prev.showAuthor }))}
                color="bg-blue-500"
                disabled={!postsModule?.enabled}
              />

              <ExperienceBlockToggle
                label="Chia sẻ mạng xã hội"
                description="Nút share Facebook, Twitter..."
                enabled={config.showShare}
                onChange={() => setConfig(prev => ({ ...prev, showShare: !prev.showShare }))}
                color="bg-blue-500"
                disabled={!postsModule?.enabled}
              />

              <ExperienceBlockToggle
                label="Bình luận"
                description="Nguồn: Module Comments"
                enabled={config.showComments}
                onChange={() => setConfig(prev => ({ ...prev, showComments: !prev.showComments }))}
                color="bg-blue-500"
                disabled={!commentsModule?.enabled}
              />

              <ExperienceBlockToggle
                label="Bài viết liên quan"
                description="Hiển thị related posts"
                enabled={config.showRelated}
                onChange={() => setConfig(prev => ({ ...prev, showRelated: !prev.showRelated }))}
                color="bg-blue-500"
                disabled={!postsModule?.enabled}
              />
            </div>
          </Card>

          <ExperienceSummaryGrid items={summaryItems} />
        </div>

        <div className="space-y-4">
          {examplePostSlug && (
            <ExampleLinks
              links={[
                { label: 'Xem bài viết mẫu', url: `/posts/${examplePostSlug}`, description: 'Open in new tab để test' },
              ]}
              color="#3b82f6"
            />
          )}

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
              <ExperienceModuleLink
                enabled={commentsModule?.enabled ?? false}
                href="/system/modules/comments"
                icon={MessageSquare}
                title="Comments"
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
