'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { toast } from 'sonner';
import { LayoutTemplate, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, cn } from '@/app/admin/components/ui';
import { ModuleHeader, SettingsCard, SettingSelect, ToggleSwitch } from '@/components/modules/shared';

type RatingDisplayStyle = 'stars' | 'numbers' | 'both';
type CommentsSortOrder = 'newest' | 'oldest' | 'highest-rating' | 'most-liked';

type CommentsRatingExperienceConfig = {
  ratingDisplayStyle: RatingDisplayStyle;
  commentsSortOrder: CommentsSortOrder;
  showLikes: boolean;
  showReplies: boolean;
  showModeration: boolean;
};

const EXPERIENCE_GROUP = 'experience';
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

export default function CommentsRatingExperiencePage() {
  const experienceSetting = useQuery(api.settings.getByKey, { key: EXPERIENCE_KEY });
  const commentsModule = useQuery(api.admin.modules.getModuleByKey, { key: 'comments' });
  const likesFeature = useQuery(api.admin.modules.getModuleFeature, { featureKey: 'enableLikes', moduleKey: 'comments' });
  const repliesFeature = useQuery(api.admin.modules.getModuleFeature, { featureKey: 'enableReplies', moduleKey: 'comments' });
  const moderationFeature = useQuery(api.admin.modules.getModuleFeature, { featureKey: 'enableModeration', moduleKey: 'comments' });

  const setMultipleSettings = useMutation(api.settings.setMultiple);

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

  const [config, setConfig] = useState<CommentsRatingExperienceConfig>(DEFAULT_CONFIG);
  const [isSaving, setIsSaving] = useState(false);

  const isLoading = experienceSetting === undefined || commentsModule === undefined;

  useEffect(() => {
    if (!isLoading) {
      setConfig(serverConfig);
    }
  }, [isLoading, serverConfig]);

  const hasChanges = useMemo(() => JSON.stringify(config) !== JSON.stringify(serverConfig), [config, serverConfig]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const settingsToSave: Array<{ group: string; key: string; value: unknown }> = [
        { group: EXPERIENCE_GROUP, key: EXPERIENCE_KEY, value: config }
      ];
      await setMultipleSettings({ settings: settingsToSave });
      toast.success('Đã lưu cấu hình trải nghiệm Comments & Rating');
    } catch {
      toast.error('Có lỗi khi lưu cấu hình');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500">Đang tải...</div>
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
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Lượt thích (Likes)</p>
                  <p className="text-xs text-slate-500">Cho phép like bình luận</p>
                </div>
                <ToggleSwitch
                  enabled={config.showLikes}
                  onChange={() => setConfig(prev => ({ ...prev, showLikes: !prev.showLikes }))}
                  color="bg-purple-500"
                  disabled={!commentsModule?.enabled}
                />
              </div>

              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Trả lời (Replies)</p>
                  <p className="text-xs text-slate-500">Cho phép reply bình luận</p>
                </div>
                <ToggleSwitch
                  enabled={config.showReplies}
                  onChange={() => setConfig(prev => ({ ...prev, showReplies: !prev.showReplies }))}
                  color="bg-purple-500"
                  disabled={!commentsModule?.enabled}
                />
              </div>

              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Kiểm duyệt (Moderation)</p>
                  <p className="text-xs text-slate-500">Hiển thị trạng thái duyệt trong admin</p>
                </div>
                <ToggleSwitch
                  enabled={config.showModeration}
                  onChange={() => setConfig(prev => ({ ...prev, showModeration: !prev.showModeration }))}
                  color="bg-purple-500"
                  disabled={!commentsModule?.enabled}
                />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">Tóm tắt áp dụng</h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 dark:bg-slate-800 rounded-md p-3">
                <p className="text-slate-500">Rating Style</p>
                <p className="font-semibold text-slate-900 dark:text-slate-100 capitalize">{config.ratingDisplayStyle}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 rounded-md p-3">
                <p className="text-slate-500">Sort Order</p>
                <p className="font-semibold text-slate-900 dark:text-slate-100">{SORT_OPTIONS.find(o => o.id === config.commentsSortOrder)?.label}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 rounded-md p-3">
                <p className="text-slate-500">Likes</p>
                <p className="font-semibold text-slate-900 dark:text-slate-100">{config.showLikes ? 'Bật' : 'Tắt'}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 rounded-md p-3">
                <p className="text-slate-500">Replies</p>
                <p className="font-semibold text-slate-900 dark:text-slate-100">{config.showReplies ? 'Bật' : 'Tắt'}</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Module liên quan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <ModuleLink
                enabled={commentsModule?.enabled ?? false}
                href="/system/modules/comments"
                icon={MessageSquare}
                title="Bình luận & Đánh giá"
              />
            </CardContent>
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Gợi ý quan sát</h3>
            <ul className="text-xs text-slate-500 space-y-1">
              <li>• Rating style phụ thuộc vào thiết kế tổng thể.</li>
              <li>• Most-liked sort khuyến khích tương tác.</li>
              <li>• Moderation quan trọng với UGC.</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}

function ModuleLink({ enabled, href, icon: Icon, title }: { enabled: boolean; href: string; icon: React.ElementType; title: string }) {
  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg border transition-colors',
        enabled
          ? 'border-slate-200 dark:border-slate-700 hover:border-purple-500/60 dark:hover:border-purple-500/60'
          : 'border-slate-100 dark:border-slate-800 opacity-50'
      )}
    >
      <div className={cn(
        'w-8 h-8 rounded-lg flex items-center justify-center',
        enabled ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
      )}>
        <Icon size={16} />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{title}</p>
        <p className="text-xs text-slate-500">{enabled ? 'Đã bật' : 'Chưa bật'}</p>
      </div>
    </Link>
  );
}
