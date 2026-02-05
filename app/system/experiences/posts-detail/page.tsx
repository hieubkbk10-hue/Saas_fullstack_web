'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery } from 'convex/react';
import { toast } from 'sonner';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { LayoutTemplate, Loader2, Save, AlertCircle } from 'lucide-react';
import { Button, Card } from '@/app/admin/components/ui';
import {
  ExperienceHintCard,
  PostDetailPreview,
  ExampleLinks,
} from '@/components/experiences';
import {
  BrowserFrame,
  DeviceToggle,
  deviceWidths,
  LayoutTabs,
  ConfigPanel,
  ControlCard,
  ToggleRow,
  type DeviceType,
  type LayoutOption,
} from '@/components/experiences/editor';
import { useExperienceConfig, useExamplePostSlug, EXPERIENCE_GROUP, EXPERIENCE_NAMES, MESSAGES } from '@/lib/experiences';

type DetailLayoutStyle = 'classic' | 'modern' | 'minimal';

type PostDetailExperienceConfig = {
  layoutStyle: DetailLayoutStyle;
  layouts: {
    classic: ClassicLayoutConfig;
    modern: ModernLayoutConfig;
    minimal: MinimalLayoutConfig;
  };
};

type ClassicLayoutConfig = {
  showAuthor: boolean;
  showTags: boolean;
  showShare: boolean;
  showComments: boolean;
  showCommentLikes: boolean;
  showCommentReplies: boolean;
  showRelated: boolean;
};

type ModernLayoutConfig = {
  showAuthor: boolean;
  showTags: boolean;
  showShare: boolean;
  showComments: boolean;
  showCommentLikes: boolean;
  showCommentReplies: boolean;
  showRelated: boolean;
};

type MinimalLayoutConfig = {
  showAuthor: boolean;
  showTags: boolean;
  showShare: boolean;
  showComments: boolean;
  showCommentLikes: boolean;
  showCommentReplies: boolean;
  showRelated: boolean;
};

const EXPERIENCE_KEY = 'posts_detail_ui';
const AUTHOR_FIELD_KEY = 'author_name';

// Legacy key for backward compatibility
const LEGACY_DETAIL_STYLE_KEY = 'posts_detail_style';

const LAYOUT_STYLES: LayoutOption<DetailLayoutStyle>[] = [
  { description: 'Layout truyền thống với sidebar', id: 'classic', label: 'Classic' },
  { description: 'Hero image, full-width', id: 'modern', label: 'Modern' },
  { description: 'Tối giản, tập trung nội dung', id: 'minimal', label: 'Minimal' },
];

const DEFAULT_CONFIG: PostDetailExperienceConfig = {
  layoutStyle: 'classic',
  layouts: {
    classic: { showAuthor: true, showTags: true, showShare: true, showComments: true, showCommentLikes: true, showCommentReplies: true, showRelated: true },
    modern: { showAuthor: true, showTags: true, showShare: true, showComments: true, showCommentLikes: true, showCommentReplies: true, showRelated: true },
    minimal: { showAuthor: false, showTags: true, showShare: true, showComments: true, showCommentLikes: true, showCommentReplies: true, showRelated: true },
  },
};

const HINTS = [
  'Classic layout phù hợp blog truyền thống.',
  'Modern layout tốt cho bài viết có hình ảnh đẹp.',
  'Minimal tập trung vào nội dung, ít distraction.',
  'Related posts giúp tăng pageview.',
  'Mỗi layout có config riêng - chuyển tab để chỉnh.',
];

function ModuleFeatureStatus({ label, enabled, href, moduleName }: { label: string; enabled: boolean; href: string; moduleName: string }) {
  return (
    <div className="mt-2 flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
      <div className="flex items-start gap-2">
        <span className={`mt-1 inline-flex h-2 w-2 rounded-full ${enabled ? 'bg-emerald-500' : 'bg-slate-400'}`} />
        <div>
          <p className="text-sm font-medium text-slate-700">{label}</p>
          <p className="text-xs text-slate-500">
            {enabled ? 'Đang bật' : 'Chưa bật'} · Nếu muốn {enabled ? 'tắt' : 'bật'} hãy vào {moduleName}
          </p>
        </div>
      </div>
      <Link href={href} className="text-xs font-medium text-cyan-600 hover:underline">
        Đi đến →
      </Link>
    </div>
  );
}

export default function PostDetailExperiencePage() {
  const experienceSetting = useQuery(api.settings.getByKey, { key: EXPERIENCE_KEY });
  const postsModule = useQuery(api.admin.modules.getModuleByKey, { key: 'posts' });
  const commentsModule = useQuery(api.admin.modules.getModuleByKey, { key: 'comments' });
  const brandColorSetting = useQuery(api.settings.getByKey, { key: 'site_brand_color' });
  const postFields = useQuery(api.admin.modules.listModuleFields, { moduleKey: 'posts' });
  const examplePostSlug = useExamplePostSlug();
  const legacyDetailStyleSetting = useQuery(api.settings.getByKey, { key: LEGACY_DETAIL_STYLE_KEY });
  const [previewDevice, setPreviewDevice] = useState<DeviceType>('desktop');
  const [isPanelExpanded, setIsPanelExpanded] = useState(true);
  const setMultipleSettings = useMutation(api.settings.setMultiple);
  const updateField = useMutation(api.admin.modules.updateModuleField);
  const commentsLikesFeature = useQuery(api.admin.modules.getModuleFeature, { featureKey: 'enableLikes', moduleKey: 'comments' });
  const commentsRepliesFeature = useQuery(api.admin.modules.getModuleFeature, { featureKey: 'enableReplies', moduleKey: 'comments' });
  const tagsFeature = useQuery(api.admin.modules.getModuleFeature, { featureKey: 'enableTags', moduleKey: 'posts' });
  const featuredFeature = useQuery(api.admin.modules.getModuleFeature, { featureKey: 'enableFeatured', moduleKey: 'posts' });
  const schedulingFeature = useQuery(api.admin.modules.getModuleFeature, { featureKey: 'enableScheduling', moduleKey: 'posts' });

  const serverConfig = useMemo<PostDetailExperienceConfig>(() => {
    const raw = experienceSetting?.value as Partial<PostDetailExperienceConfig> | undefined;
    const legacyStyle = legacyDetailStyleSetting?.value as DetailLayoutStyle | undefined;

    return {
      layoutStyle: raw?.layoutStyle ?? legacyStyle ?? DEFAULT_CONFIG.layoutStyle,
      layouts: {
        classic: { ...DEFAULT_CONFIG.layouts.classic, ...raw?.layouts?.classic },
        modern: { ...DEFAULT_CONFIG.layouts.modern, ...raw?.layouts?.modern },
        minimal: { ...DEFAULT_CONFIG.layouts.minimal, ...raw?.layouts?.minimal },
      },
    };
  }, [experienceSetting?.value, legacyDetailStyleSetting?.value]);

  const isLoading = experienceSetting === undefined || postsModule === undefined || postFields === undefined;
  const brandColor = (brandColorSetting?.value as string) || '#3b82f6';

  const { config, setConfig, hasChanges } = useExperienceConfig(serverConfig, DEFAULT_CONFIG, isLoading);

  // Get current layout config for preview
  const currentLayoutConfig = config.layouts[config.layoutStyle];

  // Update current layout's config
  const updateLayoutConfig = <K extends keyof typeof currentLayoutConfig>(
    key: K,
    value: (typeof currentLayoutConfig)[K]
  ) => {
    setConfig(prev => ({
      ...prev,
      layouts: {
        ...prev.layouts,
        [prev.layoutStyle]: {
          ...prev.layouts[prev.layoutStyle],
          [key]: value,
        },
      },
    }));
  };

  const authorField = useMemo(() => postFields?.find(field => field.fieldKey === AUTHOR_FIELD_KEY), [postFields]);
  const authorFieldEnabled = authorField?.enabled ?? false;
  const isAuthorSyncPending = Boolean(authorField) && authorFieldEnabled !== currentLayoutConfig.showAuthor;

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

      if (authorField && authorFieldEnabled !== currentLayoutConfig.showAuthor) {
        tasks.push(updateField({ enabled: currentLayoutConfig.showAuthor, id: authorField._id as Id<'moduleFields'> }));
      }

      await Promise.all(tasks);
      toast.success(MESSAGES.saveSuccess(EXPERIENCE_NAMES[EXPERIENCE_KEY]));
    } catch {
      toast.error(MESSAGES.saveError);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500">{MESSAGES.loading}</div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col">
      {/* Compact Header - 48px */}
      <header className="h-12 px-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
        <div className="flex items-center gap-2">
          <LayoutTemplate className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">Chi tiết bài viết</span>
        </div>
        <div className="flex items-center gap-3">
          <DeviceToggle value={previewDevice} onChange={setPreviewDevice} size="sm" />
          <Button 
            size="sm"
            onClick={handleSave} 
            disabled={!hasChanges || isSaving}
            className="bg-blue-600 hover:bg-blue-500 gap-1.5"
          >
            {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            <span>{hasChanges ? 'Lưu' : 'Đã lưu'}</span>
          </Button>
        </div>
      </header>
      
      {/* Preview Area */}
      <main className="flex-1 overflow-auto p-4 bg-slate-50 dark:bg-slate-950">
        <div className={`mx-auto transition-all duration-300 ${deviceWidths[previewDevice]}`}>
          <BrowserFrame url={`yoursite.com/posts/${examplePostSlug || 'example-post'}`} maxHeight="calc(100vh - 320px)">
            <PostDetailPreview
              layoutStyle={config.layoutStyle}
              showAuthor={currentLayoutConfig.showAuthor}
              showTags={currentLayoutConfig.showTags}
              showRelated={currentLayoutConfig.showRelated}
              showShare={currentLayoutConfig.showShare}
              showComments={currentLayoutConfig.showComments}
              showCommentLikes={currentLayoutConfig.showCommentLikes}
              showCommentReplies={currentLayoutConfig.showCommentReplies}
              device={previewDevice}
              brandColor={brandColor}
            />
          </BrowserFrame>
        </div>
      </main>
      
      {/* Bottom Panel */}
      <ConfigPanel
        isExpanded={isPanelExpanded}
        onToggle={() => setIsPanelExpanded(!isPanelExpanded)}
        expandedHeight="220px"
        leftContent={
          <LayoutTabs
            layouts={LAYOUT_STYLES}
            activeLayout={config.layoutStyle}
            onChange={(layout) => setConfig(prev => ({ ...prev, layoutStyle: layout }))}
            accentColor="#3b82f6"
          />
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <ControlCard title="Hiển thị nội dung">
            <ToggleRow 
              label="Thông tin tác giả" 
              checked={currentLayoutConfig.showAuthor} 
              onChange={(v) => updateLayoutConfig('showAuthor', v)} 
              accentColor="#3b82f6"
              disabled={!authorField}
            />
            <ToggleRow 
              label="Danh sách tags" 
              checked={currentLayoutConfig.showTags} 
              onChange={(v) => updateLayoutConfig('showTags', v)} 
              accentColor="#3b82f6"
            />
            <ToggleRow 
              label="Nút chia sẻ" 
              checked={currentLayoutConfig.showShare} 
              onChange={(v) => updateLayoutConfig('showShare', v)} 
              accentColor="#3b82f6" 
            />
            <ToggleRow 
              label="Bài viết liên quan" 
              checked={currentLayoutConfig.showRelated} 
              onChange={(v) => updateLayoutConfig('showRelated', v)} 
              accentColor="#3b82f6" 
            />
          </ControlCard>
          
          {/* Comments section */}
          <ControlCard title="Bình luận">
            <ToggleRow 
              label="Hiển thị bình luận" 
              checked={currentLayoutConfig.showComments} 
              onChange={(v) => updateLayoutConfig('showComments', v)} 
              accentColor="#3b82f6"
            />
            <ToggleRow 
              label="Nút thích" 
              checked={currentLayoutConfig.showCommentLikes} 
              onChange={(v) => updateLayoutConfig('showCommentLikes', v)} 
              accentColor="#3b82f6"
            />
            <ToggleRow 
              label="Nút trả lời" 
              checked={currentLayoutConfig.showCommentReplies} 
              onChange={(v) => updateLayoutConfig('showCommentReplies', v)} 
              accentColor="#3b82f6"
            />
            <ModuleFeatureStatus
              label="Module bình luận"
              enabled={commentsModule?.enabled ?? false}
              href="/system/modules/comments"
              moduleName="Module Bình luận"
            />
            <ModuleFeatureStatus
              label="Tính năng thích"
              enabled={commentsLikesFeature?.enabled ?? false}
              href="/system/modules/comments"
              moduleName="Module Bình luận"
            />
            <ModuleFeatureStatus
              label="Tính năng trả lời"
              enabled={commentsRepliesFeature?.enabled ?? false}
              href="/system/modules/comments"
              moduleName="Module Bình luận"
            />
          </ControlCard>
          
          <ControlCard title="Trạng thái Module">
            {isAuthorSyncPending && (
              <div className="flex items-start gap-2 p-2 bg-amber-50 dark:bg-amber-500/10 rounded-lg text-xs text-amber-700 dark:text-amber-300 mb-2">
                <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                <span>Cập nhật trường tác giả sẽ áp dụng khi bấm Lưu.</span>
              </div>
            )}
            <ModuleFeatureStatus
              label="Tags"
              enabled={tagsFeature?.enabled ?? false}
              href="/system/modules/posts"
              moduleName="Module Bài viết"
            />
            <ModuleFeatureStatus
              label="Nổi bật"
              enabled={featuredFeature?.enabled ?? false}
              href="/system/modules/posts"
              moduleName="Module Bài viết"
            />
            <ModuleFeatureStatus
              label="Hẹn giờ xuất bản"
              enabled={schedulingFeature?.enabled ?? false}
              href="/system/modules/posts"
              moduleName="Module Bài viết"
            />
          </ControlCard>
          
          {/* Links & hints */}
          <Card className="p-2">
            {examplePostSlug && (
              <div className="mb-2">
                <ExampleLinks
                  links={[{ label: 'Xem bài viết mẫu', url: `/posts/${examplePostSlug}` }]}
                  color="#3b82f6"
                  compact
                />
              </div>
            )}
            <ExperienceHintCard hints={HINTS} />
          </Card>
        </div>
      </ConfigPanel>
    </div>
  );
}
