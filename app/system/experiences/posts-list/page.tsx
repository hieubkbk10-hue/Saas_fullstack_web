'use client';

import React, { useMemo } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { FileText, LayoutTemplate } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/admin/components/ui';
import { ModuleHeader, SettingsCard, SettingSelect } from '@/components/modules/shared';
import { 
  ExperienceModuleLink, 
  ExperienceSummaryGrid, 
  ExperienceBlockToggle,
  ExperienceHintCard,
  ExperiencePreview,
  PostsListPreview,
  type SummaryItem 
} from '@/components/experiences';
import { useExperienceConfig, useExperienceSave, EXPERIENCE_NAMES, MESSAGES } from '@/lib/experiences';

type ListLayoutStyle = 'grid' | 'list' | 'masonry';
type FilterPosition = 'sidebar' | 'top' | 'none';

type PostsListExperienceConfig = {
  layoutStyle: ListLayoutStyle;
  filterPosition: FilterPosition;
  showPagination: boolean;
  showSearch: boolean;
  showCategories: boolean;
};

const EXPERIENCE_KEY = 'posts_list_ui';

const LAYOUT_STYLES: { id: ListLayoutStyle; label: string; description: string }[] = [
  { description: 'Hiển thị dạng lưới cards', id: 'grid', label: 'Grid' },
  { description: 'Hiển thị dạng danh sách', id: 'list', label: 'List' },
  { description: 'Hiển thị dạng masonry (Pinterest-like)', id: 'masonry', label: 'Masonry' },
];

const FILTER_POSITIONS: { id: FilterPosition; label: string; description: string }[] = [
  { description: 'Filters ở thanh bên trái', id: 'sidebar', label: 'Sidebar' },
  { description: 'Filters ở trên cùng', id: 'top', label: 'Top' },
  { description: 'Không hiển thị filters', id: 'none', label: 'None' },
];

const DEFAULT_CONFIG: PostsListExperienceConfig = {
  layoutStyle: 'grid',
  filterPosition: 'sidebar',
  showPagination: true,
  showSearch: true,
  showCategories: true,
};

const HINTS = [
  'Grid layout phù hợp với blog có nhiều hình ảnh.',
  'Masonry layout tạo giao diện độc đáo nhưng phức tạp hơn.',
  'Sidebar filters giúp user dễ lọc content.',
];

export default function PostsListExperiencePage() {
  const experienceSetting = useQuery(api.settings.getByKey, { key: EXPERIENCE_KEY });
  const postsModule = useQuery(api.admin.modules.getModuleByKey, { key: 'posts' });

  const serverConfig = useMemo<PostsListExperienceConfig>(() => {
    const raw = experienceSetting?.value as Partial<PostsListExperienceConfig> | undefined;
    return {
      layoutStyle: raw?.layoutStyle ?? 'grid',
      filterPosition: raw?.filterPosition ?? 'sidebar',
      showPagination: raw?.showPagination ?? true,
      showSearch: raw?.showSearch ?? true,
      showCategories: raw?.showCategories ?? true,
    };
  }, [experienceSetting?.value]);

  const isLoading = experienceSetting === undefined || postsModule === undefined;

  const { config, setConfig, hasChanges } = useExperienceConfig(serverConfig, DEFAULT_CONFIG, isLoading);
  const { handleSave, isSaving } = useExperienceSave(EXPERIENCE_KEY, config, MESSAGES.saveSuccess(EXPERIENCE_NAMES[EXPERIENCE_KEY]));

  const summaryItems: SummaryItem[] = [
    { label: 'Layout', value: config.layoutStyle, format: 'capitalize' },
    { label: 'Filter Position', value: config.filterPosition, format: 'capitalize' },
    { label: 'Search', value: config.showSearch },
    { label: 'Pagination', value: config.showPagination },
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="space-y-4 lg:col-span-2">
          <ExperiencePreview title="Danh sách bài viết">
            <PostsListPreview
              layoutStyle={config.layoutStyle}
              filterPosition={config.filterPosition}
              showPagination={config.showPagination}
              showSearch={config.showSearch}
              showCategories={config.showCategories}
            />
          </ExperiencePreview>

          <SettingsCard>
            <SettingSelect
              label="Layout danh sách"
              value={config.layoutStyle}
              onChange={(value) => setConfig(prev => ({ ...prev, layoutStyle: value as ListLayoutStyle }))}
              options={LAYOUT_STYLES.map(style => ({ label: `${style.label} - ${style.description}`, value: style.id }))}
              focusColor="focus:border-blue-500"
            />
          </SettingsCard>

          <SettingsCard>
            <SettingSelect
              label="Vị trí Filters"
              value={config.filterPosition}
              onChange={(value) => setConfig(prev => ({ ...prev, filterPosition: value as FilterPosition }))}
              options={FILTER_POSITIONS.map(pos => ({ label: `${pos.label} - ${pos.description}`, value: pos.id }))}
              focusColor="focus:border-blue-500"
            />
          </SettingsCard>

          <Card className="p-4">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">Khối hiển thị</h3>
            <div className="space-y-3">
              <ExperienceBlockToggle
                label="Tìm kiếm"
                description="Thanh search cho bài viết"
                enabled={config.showSearch}
                onChange={() => setConfig(prev => ({ ...prev, showSearch: !prev.showSearch }))}
                color="bg-blue-500"
                disabled={!postsModule?.enabled}
              />

              <ExperienceBlockToggle
                label="Categories"
                description="Filter theo danh mục"
                enabled={config.showCategories}
                onChange={() => setConfig(prev => ({ ...prev, showCategories: !prev.showCategories }))}
                color="bg-blue-500"
                disabled={!postsModule?.enabled}
              />

              <ExperienceBlockToggle
                label="Pagination"
                description="Phân trang kết quả"
                enabled={config.showPagination}
                onChange={() => setConfig(prev => ({ ...prev, showPagination: !prev.showPagination }))}
                color="bg-blue-500"
                disabled={!postsModule?.enabled}
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
