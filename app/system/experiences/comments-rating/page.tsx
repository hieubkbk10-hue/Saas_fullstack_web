'use client';

import React, { useMemo, useState } from 'react';
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
      {/* Header */}
      <header className="flex-shrink-0 px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-white dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/10 rounded-lg">
            <LayoutTemplate className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">Trải nghiệm: Bình luận & Đánh giá</h1>
            <p className="text-xs text-slate-500">Comments & Rating section trên product/post pages</p>
          </div>
        </div>
        <Button
          onClick={handleSave}
          disabled={!hasChanges || isSaving}
          className="bg-purple-600 hover:bg-purple-500 gap-2"
        >
          {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {hasChanges ? 'Lưu thay đổi' : 'Đã lưu'}
        </Button>
      </header>

      {/* Preview Area */}
      <main className="flex-1 overflow-auto p-6 bg-slate-50 dark:bg-slate-950">
        <div className="flex justify-center mb-4">
          <DeviceToggle value={previewDevice} onChange={setPreviewDevice} />
        </div>
        <div className={`mx-auto transition-all duration-300 ${deviceWidths[previewDevice]}`}>
          <BrowserFrame url="yoursite.com/products/example#comments" maxHeight="calc(100vh - 380px)">
            <CommentsRatingPreview
              ratingDisplayStyle={config.ratingDisplayStyle}
              commentsSortOrder={config.commentsSortOrder}
              showLikes={config.showLikes}
              showReplies={config.showReplies}
              showModeration={config.showModeration}
            />
          </BrowserFrame>
        </div>
        <div className="mt-3 text-xs text-slate-500 text-center">
          Rating: <strong>{RATING_STYLES.find(s => s.id === config.ratingDisplayStyle)?.label}</strong>
          {' • '}{previewDevice === 'desktop' ? '1920px' : (previewDevice === 'tablet' ? '768px' : '375px')}
        </div>
      </main>

      {/* Bottom Panel */}
      <ConfigPanel
        isExpanded={isPanelExpanded}
        onToggle={() => setIsPanelExpanded(!isPanelExpanded)}
        expandedHeight="280px"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
            <ToggleRow label="Likes" description="Cho phép like bình luận" checked={config.showLikes} onChange={(v) => setConfig(prev => ({ ...prev, showLikes: v }))} accentColor="#a855f7" disabled={!commentsModule?.enabled} />
            <ToggleRow label="Replies" description="Cho phép reply bình luận" checked={config.showReplies} onChange={(v) => setConfig(prev => ({ ...prev, showReplies: v }))} accentColor="#a855f7" disabled={!commentsModule?.enabled} />
            <ToggleRow label="Moderation" description="Trạng thái duyệt trong admin" checked={config.showModeration} onChange={(v) => setConfig(prev => ({ ...prev, showModeration: v }))} accentColor="#a855f7" disabled={!commentsModule?.enabled} />
          </ControlCard>

          <ControlCard title="Module liên quan">
            <ExperienceModuleLink
              enabled={commentsModule?.enabled ?? false}
              href="/system/modules/comments"
              icon={MessageSquare}
              title="Bình luận & Đánh giá"
              colorScheme="purple"
            />
          </ControlCard>

          <Card className="p-3">
            <ExperienceHintCard hints={HINTS} />
          </Card>
        </div>
      </ConfigPanel>
    </div>
  );
}
