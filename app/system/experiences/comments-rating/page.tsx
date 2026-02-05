'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { LayoutTemplate, Loader2, MessageSquare, Save } from 'lucide-react';
import { Button, Card } from '@/app/admin/components/ui';
import { 
  ExperienceModuleLink, 
  ExperienceHintCard,
  CommentsRatingPreview,
} from '@/components/experiences';
import {
  BrowserFrame,
  DeviceToggle,
  deviceWidths,
  ConfigPanel,
  ControlCard,
  ToggleRow,
  SelectRow,
  type DeviceType,
} from '@/components/experiences/editor';
import { useExperienceConfig, useExperienceSave, EXPERIENCE_NAMES, MESSAGES } from '@/lib/experiences';

type RatingDisplayStyle = 'stars' | 'numbers' | 'both';
type CommentsSortOrder = 'newest' | 'oldest' | 'highest-rating' | 'most-liked';

type CommentsRatingExperienceConfig = {
  ratingDisplayStyle: RatingDisplayStyle;
  commentsSortOrder: CommentsSortOrder;
  showLikes: boolean;
  showReplies: boolean;
  showModeration: boolean;
};

const EXPERIENCE_KEY = 'comments_rating_ui';

const RATING_STYLES: { id: RatingDisplayStyle; label: string }[] = [
  { id: 'stars', label: 'Stars Only' },
  { id: 'numbers', label: 'Numbers Only' },
  { id: 'both', label: 'Stars + Numbers' },
];

const SORT_OPTIONS: { id: CommentsSortOrder; label: string }[] = [
  { id: 'newest', label: 'Mới nhất' },
  { id: 'oldest', label: 'Cũ nhất' },
  { id: 'highest-rating', label: 'Điểm cao nhất' },
  { id: 'most-liked', label: 'Nhiều like nhất' },
];

const DEFAULT_CONFIG: CommentsRatingExperienceConfig = {
  commentsSortOrder: 'newest',
  ratingDisplayStyle: 'both',
  showLikes: true,
  showModeration: true,
  showReplies: true,
};

const HINTS = [
  'Rating style phụ thuộc vào thiết kế tổng thể.',
  'Most-liked sort khuyến khích tương tác.',
  'Moderation quan trọng với UGC.',
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

export default function CommentsRatingExperiencePage() {
  const experienceSetting = useQuery(api.settings.getByKey, { key: EXPERIENCE_KEY });
  const commentsModule = useQuery(api.admin.modules.getModuleByKey, { key: 'comments' });
  const likesFeature = useQuery(api.admin.modules.getModuleFeature, { featureKey: 'enableLikes', moduleKey: 'comments' });
  const repliesFeature = useQuery(api.admin.modules.getModuleFeature, { featureKey: 'enableReplies', moduleKey: 'comments' });
  const moderationFeature = useQuery(api.admin.modules.getModuleFeature, { featureKey: 'enableModeration', moduleKey: 'comments' });
  const [previewDevice, setPreviewDevice] = useState<DeviceType>('desktop');
  const [isPanelExpanded, setIsPanelExpanded] = useState(true);

  const serverConfig = useMemo<CommentsRatingExperienceConfig>(() => {
    const raw = experienceSetting?.value as Partial<CommentsRatingExperienceConfig> | undefined;
    return {
      commentsSortOrder: raw?.commentsSortOrder ?? 'newest',
      ratingDisplayStyle: raw?.ratingDisplayStyle ?? 'both',
      showLikes: raw?.showLikes ?? (likesFeature?.enabled ?? true),
      showModeration: raw?.showModeration ?? (moderationFeature?.enabled ?? true),
      showReplies: raw?.showReplies ?? (repliesFeature?.enabled ?? true),
    };
  }, [experienceSetting?.value, likesFeature?.enabled, repliesFeature?.enabled, moderationFeature?.enabled]);

  const isLoading = experienceSetting === undefined || commentsModule === undefined;

  const { config, setConfig, hasChanges } = useExperienceConfig(serverConfig, DEFAULT_CONFIG, isLoading);
  const { handleSave, isSaving } = useExperienceSave(
    EXPERIENCE_KEY,
    config,
    MESSAGES.saveSuccess(EXPERIENCE_NAMES[EXPERIENCE_KEY])
  );

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
          <LayoutTemplate className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">Bình luận & Đánh giá</span>
        </div>
        <div className="flex items-center gap-3">
          <DeviceToggle value={previewDevice} onChange={setPreviewDevice} size="sm" />
          <Button
            size="sm"
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            className="bg-purple-600 hover:bg-purple-500 gap-1.5"
          >
            {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            <span>{hasChanges ? 'Lưu' : 'Đã lưu'}</span>
          </Button>
        </div>
      </header>

      {/* Preview Area */}
      <main className="flex-1 overflow-auto p-4 bg-slate-50 dark:bg-slate-950">
        <div className={`mx-auto transition-all duration-300 ${deviceWidths[previewDevice]}`}>
          <BrowserFrame url="yoursite.com/products/example#comments" maxHeight="calc(100vh - 320px)">
            <CommentsRatingPreview
              ratingDisplayStyle={config.ratingDisplayStyle}
              commentsSortOrder={config.commentsSortOrder}
              showLikes={config.showLikes && (likesFeature?.enabled ?? true)}
              showReplies={config.showReplies && (repliesFeature?.enabled ?? true)}
              showModeration={config.showModeration && (moderationFeature?.enabled ?? true)}
              device={previewDevice}
              brandColor="#a855f7"
            />
          </BrowserFrame>
        </div>
      </main>

      {/* Bottom Panel */}
      <ConfigPanel
        isExpanded={isPanelExpanded}
        onToggle={() => setIsPanelExpanded(!isPanelExpanded)}
        expandedHeight="220px"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <ControlCard title="Hiển thị">
            <SelectRow
              label="Kiểu rating"
              value={config.ratingDisplayStyle}
              onChange={(v) => setConfig(prev => ({ ...prev, ratingDisplayStyle: v as RatingDisplayStyle }))}
              options={RATING_STYLES.map(s => ({ label: s.label, value: s.id }))}
            />
            <SelectRow
              label="Sắp xếp mặc định"
              value={config.commentsSortOrder}
              onChange={(v) => setConfig(prev => ({ ...prev, commentsSortOrder: v as CommentsSortOrder }))}
              options={SORT_OPTIONS.map(s => ({ label: s.label, value: s.id }))}
            />
          </ControlCard>

          <ControlCard title="Tính năng">
            <ToggleRow label="Likes" checked={config.showLikes} onChange={(v) => setConfig(prev => ({ ...prev, showLikes: v }))} accentColor="#a855f7" disabled={!commentsModule?.enabled} />
            <ToggleRow label="Replies" checked={config.showReplies} onChange={(v) => setConfig(prev => ({ ...prev, showReplies: v }))} accentColor="#a855f7" disabled={!commentsModule?.enabled} />
            <ToggleRow label="Moderation" checked={config.showModeration} onChange={(v) => setConfig(prev => ({ ...prev, showModeration: v }))} accentColor="#a855f7" disabled={!commentsModule?.enabled} />
          </ControlCard>

          <ControlCard title="Module liên quan">
            <ExperienceModuleLink
              enabled={commentsModule?.enabled ?? false}
              href="/system/modules/comments"
              icon={MessageSquare}
              title="Bình luận & Đánh giá"
              colorScheme="purple"
            />
            <ModuleFeatureStatus
              label="Likes"
              enabled={likesFeature?.enabled ?? false}
              href="/system/modules/comments"
              moduleName="module Bình luận"
            />
            <ModuleFeatureStatus
              label="Replies"
              enabled={repliesFeature?.enabled ?? false}
              href="/system/modules/comments"
              moduleName="module Bình luận"
            />
            <ModuleFeatureStatus
              label="Moderation"
              enabled={moderationFeature?.enabled ?? false}
              href="/system/modules/comments"
              moduleName="module Bình luận"
            />
          </ControlCard>

          <Card className="p-2">
            <ExperienceHintCard hints={HINTS} />
          </Card>
        </div>
      </ConfigPanel>
    </div>
  );
}
