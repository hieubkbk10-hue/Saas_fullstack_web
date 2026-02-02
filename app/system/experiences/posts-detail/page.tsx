'use client';

import React, { useMemo } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { toast } from 'sonner';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import Link from 'next/link';
import { FileText, LayoutTemplate, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/admin/components/ui';
import { ModuleHeader, SettingsCard } from '@/components/modules/shared';
import { 
  ExperienceModuleLink, 
  ExperienceSummaryGrid, 
  ExperienceBlockToggle,
  ExperienceHintCard,
  ExperiencePreview,
  PostDetailPreview,
  ExampleLinks,
  type SummaryItem 
} from '@/components/experiences';
import { useExperienceConfig, useExamplePostSlug, EXPERIENCE_GROUP, EXPERIENCE_NAMES, MESSAGES } from '@/lib/experiences';

type DetailLayoutStyle = 'classic' | 'modern' | 'minimal';

type PostDetailExperienceConfig = {
  layoutStyle: DetailLayoutStyle;
  showAuthor: boolean;
  showRelated: boolean;
  showShare: boolean;
  showComments: boolean;
};

const EXPERIENCE_KEY = 'posts_detail_ui';
const AUTHOR_FIELD_KEY = 'author_id';

// Legacy key for backward compatibility
const LEGACY_DETAIL_STYLE_KEY = 'posts_detail_style';

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
  const postFields = useQuery(api.admin.modules.listModuleFields, { moduleKey: 'posts' });
  const examplePostSlug = useExamplePostSlug();
  const legacyDetailStyleSetting = useQuery(api.settings.getByKey, { key: LEGACY_DETAIL_STYLE_KEY });
  const setMultipleSettings = useMutation(api.settings.setMultiple);
  const updateField = useMutation(api.admin.modules.updateModuleField);

  const serverConfig = useMemo<PostDetailExperienceConfig>(() => {
    const raw = experienceSetting?.value as Partial<PostDetailExperienceConfig> | undefined;
    const legacyStyle = (legacyDetailStyleSetting?.value as DetailLayoutStyle) ?? 'classic';
    
    return {
      layoutStyle: raw?.layoutStyle ?? legacyStyle,
      showAuthor: raw?.showAuthor ?? true,
      showRelated: raw?.showRelated ?? true,
      showShare: raw?.showShare ?? true,
      showComments: raw?.showComments ?? true,
    };
  }, [experienceSetting?.value, legacyDetailStyleSetting?.value]);

  const isLoading = experienceSetting === undefined || postsModule === undefined || postFields === undefined;

  const { config, setConfig, hasChanges } = useExperienceConfig(serverConfig, DEFAULT_CONFIG, isLoading);
  const authorField = useMemo(() => postFields?.find(field => field.fieldKey === AUTHOR_FIELD_KEY), [postFields]);
  const authorFieldEnabled = authorField?.enabled ?? false;
  const isAuthorSyncPending = Boolean(authorField) && authorFieldEnabled !== config.showAuthor;
  
  // Sync with legacy key
  const additionalSettings = useMemo(() => [
    { group: 'posts', key: LEGACY_DETAIL_STYLE_KEY, value: config.layoutStyle }
  ], [config.layoutStyle]);
  
  const [isSaving, setIsSaving] = React.useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const settingsToSave: Array<{ group: string; key: string; value: unknown }> = [
        { group: EXPERIENCE_GROUP, key: EXPERIENCE_KEY, value: config },
        ...additionalSettings,
      ];

      const tasks: Promise<unknown>[] = [setMultipleSettings({ settings: settingsToSave })];

      if (authorField && authorFieldEnabled !== config.showAuthor) {
        tasks.push(updateField({ enabled: config.showAuthor, id: authorField._id as Id<'moduleFields'> }));
      }

      await Promise.all(tasks);
      toast.success(MESSAGES.saveSuccess(EXPERIENCE_NAMES[EXPERIENCE_KEY]));
    } catch {
      toast.error(MESSAGES.saveError);
    } finally {
      setIsSaving(false);
    }
  };

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

      {/* Full-width Preview - Realtime */}
      <ExperiencePreview title="Chi tiết bài viết">
        <PostDetailPreview
          layoutStyle={config.layoutStyle}
          showAuthor={config.showAuthor}
          showRelated={config.showRelated}
          showShare={config.showShare}
          showComments={config.showComments}
        />
      </ExperiencePreview>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="space-y-4 lg:col-span-2">
          <Card className="p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-shrink-0">
                <h3 className="font-medium text-sm text-slate-900 dark:text-slate-100">Trang chi tiết</h3>
                <p className="text-xs text-slate-500">/posts/[slug]</p>
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

          {config.layoutStyle === 'classic' && (
            <SettingsCard title="Cấu hình thêm cho Classic">
              <div className="space-y-2">
                <ExperienceBlockToggle
                  label="Thông tin tác giả"
                  description="Hiển thị author và ngày đăng"
                  enabled={config.showAuthor}
                  onChange={() => setConfig(prev => ({ ...prev, showAuthor: !prev.showAuthor }))}
                  color="bg-blue-500"
                  disabled={!postsModule?.enabled || !authorField}
                />

                {authorField ? (
                  <div className="rounded-lg border border-blue-100 bg-blue-50/60 px-3 py-2 text-xs text-slate-600 dark:border-blue-900/40 dark:bg-blue-900/20 dark:text-slate-300">
                    <div className="flex items-center justify-between gap-3">
                      <span>
                        Đồng bộ với <Link href="/system/modules/posts" className="text-blue-600 hover:text-blue-700 dark:text-blue-400">Module Bài viết</Link>
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          authorFieldEnabled ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200'
                            : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                        }`}
                      >
                        Tác giả: {authorFieldEnabled ? 'Bật' : 'Tắt'}
                      </span>
                    </div>
                    <p className="mt-1">
                      {isAuthorSyncPending ? 'Trạng thái đang lệch, bấm Lưu để đồng bộ module.' : 'Trạng thái đã đồng bộ với module.'}
                    </p>
                  </div>
                ) : (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200">
                    Chưa có trường Tác giả trong Module Bài viết. Vui lòng kiểm tra mục <Link href="/system/modules/posts" className="font-medium underline">/system/modules/posts</Link>.
                  </div>
                )}
              </div>

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
            </SettingsCard>
          )}

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
