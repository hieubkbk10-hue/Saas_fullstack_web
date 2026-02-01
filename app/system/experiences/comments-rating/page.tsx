'use client';

import React, { useMemo } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { LayoutTemplate, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/admin/components/ui';
import { ModuleHeader, SettingsCard, SettingSelect } from '@/components/modules/shared';
import { 
  ExperienceModuleLink, 
  ExperienceSummaryGrid, 
  ExperienceBlockToggle,
  ExperienceHintCard,
  ExperiencePreview,
  CommentsRatingPreview,
  type SummaryItem 
} from '@/components/experiences';
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

const RATING_STYLES: { id: RatingDisplayStyle; label: string; description: string }[] = [
  { description: 'Chỉ hiển thị sao', id: 'stars', label: 'Stars Only' },
  { description: 'Chỉ hiển thị số điểm', id: 'numbers', label: 'Numbers Only' },
  { description: 'Hiển thị cả sao và số', id: 'both', label: 'Both' },
];

const SORT_OPTIONS: { id: CommentsSortOrder; label: string; description: string }[] = [
  { description: 'Mới nhất trước', id: 'newest', label: 'Newest First' },
  { description: 'Cũ nhất trước', id: 'oldest', label: 'Oldest First' },
  { description: 'Điểm cao nhất', id: 'highest-rating', label: 'Highest Rating' },
  { description: 'Nhiều like nhất', id: 'most-liked', label: 'Most Liked' },
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
  const { handleSave, isSaving } = useExperienceSave(EXPERIENCE_KEY, config, MESSAGES.saveSuccess(EXPERIENCE_NAMES[EXPERIENCE_KEY]));

  const sortLabel = SORT_OPTIONS.find(o => o.id === config.commentsSortOrder)?.label ?? 'Newest First';
  
  const summaryItems: SummaryItem[] = [
    { label: 'Rating Style', value: config.ratingDisplayStyle, format: 'capitalize' },
    { label: 'Sort Order', value: sortLabel },
    { label: 'Likes', value: config.showLikes },
    { label: 'Replies', value: config.showReplies },
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
        title="Trải nghiệm: Bình luận & Đánh giá"
        description="Cấu hình hiển thị rating, sort, likes, replies và moderation."
        iconBgClass="bg-purple-500/10"
        iconTextClass="text-purple-600 dark:text-purple-400"
        buttonClass="bg-purple-600 hover:bg-purple-500"
        onSave={handleSave}
        hasChanges={hasChanges}
        isSaving={isSaving}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="space-y-4 lg:col-span-2">
          <ExperiencePreview title="Comments & Rating">
            <CommentsRatingPreview
              ratingDisplayStyle={config.ratingDisplayStyle}
              commentsSortOrder={config.commentsSortOrder}
              showLikes={config.showLikes}
              showReplies={config.showReplies}
              showModeration={config.showModeration}
            />
          </ExperiencePreview>

          <SettingsCard>
            <SettingSelect
              label="Kiểu hiển thị rating"
              value={config.ratingDisplayStyle}
              onChange={(value) => setConfig(prev => ({ ...prev, ratingDisplayStyle: value as RatingDisplayStyle }))}
              options={RATING_STYLES.map(style => ({ label: `${style.label} - ${style.description}`, value: style.id }))}
              focusColor="focus:border-purple-500"
            />
          </SettingsCard>

          <SettingsCard>
            <SettingSelect
              label="Sắp xếp bình luận mặc định"
              value={config.commentsSortOrder}
              onChange={(value) => setConfig(prev => ({ ...prev, commentsSortOrder: value as CommentsSortOrder }))}
              options={SORT_OPTIONS.map(opt => ({ label: `${opt.label} - ${opt.description}`, value: opt.id }))}
              focusColor="focus:border-purple-500"
            />
          </SettingsCard>

          <Card className="p-4">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">Khối hiển thị</h3>
            <div className="space-y-3">
              <ExperienceBlockToggle
                label="Lượt thích (Likes)"
                description="Cho phép like bình luận"
                enabled={config.showLikes}
                onChange={() => setConfig(prev => ({ ...prev, showLikes: !prev.showLikes }))}
                color="bg-purple-500"
                disabled={!commentsModule?.enabled}
              />

              <ExperienceBlockToggle
                label="Trả lời (Replies)"
                description="Cho phép reply bình luận"
                enabled={config.showReplies}
                onChange={() => setConfig(prev => ({ ...prev, showReplies: !prev.showReplies }))}
                color="bg-purple-500"
                disabled={!commentsModule?.enabled}
              />

              <ExperienceBlockToggle
                label="Kiểm duyệt (Moderation)"
                description="Hiển thị trạng thái duyệt trong admin"
                enabled={config.showModeration}
                onChange={() => setConfig(prev => ({ ...prev, showModeration: !prev.showModeration }))}
                color="bg-purple-500"
                disabled={!commentsModule?.enabled}
              />
            </div>
          </Card>

          <ExperienceSummaryGrid items={summaryItems} />
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Module liên quan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <ExperienceModuleLink
                enabled={commentsModule?.enabled ?? false}
                href="/system/modules/comments"
                icon={MessageSquare}
                title="Bình luận & Đánh giá"
                colorScheme="purple"
              />
            </CardContent>
          </Card>

          <ExperienceHintCard hints={HINTS} />
        </div>
      </div>
    </div>
  );
}
