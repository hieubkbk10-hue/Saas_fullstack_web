'use client';

import React, { useMemo } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Briefcase, FileText, LayoutTemplate, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/admin/components/ui';
import { ModuleHeader, SettingsCard, SettingSelect } from '@/components/modules/shared';
import { 
  ExperienceModuleLink, 
  ExperienceSummaryGrid, 
  ExperienceBlockToggle,
  ExperienceHintCard,
  ExperiencePreview,
  SearchFilterPreview,
  type SummaryItem 
} from '@/components/experiences';
import { useExperienceConfig, useExperienceSave, EXPERIENCE_NAMES, MESSAGES } from '@/lib/experiences';

type SearchLayoutStyle = 'search-only' | 'with-filters' | 'advanced';
type ResultsDisplayStyle = 'grid' | 'list';

type SearchFilterExperienceConfig = {
  layoutStyle: SearchLayoutStyle;
  resultsDisplayStyle: ResultsDisplayStyle;
  showFilters: boolean;
  showSorting: boolean;
  showResultCount: boolean;
};

const EXPERIENCE_KEY = 'search_filter_ui';

const LAYOUT_STYLES: { id: SearchLayoutStyle; label: string; description: string }[] = [
  { description: 'Chỉ có search bar và results', id: 'search-only', label: 'Search Only' },
  { description: 'Search + sidebar filters', id: 'with-filters', label: 'With Filters' },
  { description: 'Advanced với filter chips', id: 'advanced', label: 'Advanced' },
];

const DISPLAY_STYLES: { id: ResultsDisplayStyle; label: string; description: string }[] = [
  { description: 'Hiển thị dạng lưới', id: 'grid', label: 'Grid' },
  { description: 'Hiển thị dạng list', id: 'list', label: 'List' },
];

const DEFAULT_CONFIG: SearchFilterExperienceConfig = {
  layoutStyle: 'with-filters',
  resultsDisplayStyle: 'grid',
  showFilters: true,
  showSorting: true,
  showResultCount: true,
};

const HINTS = [
  'Advanced layout tốt cho search phức tạp.',
  'Filters giúp users tìm kết quả chính xác.',
  'Result count giúp users biết được số lượng.',
];

export default function SearchFilterExperiencePage() {
  const experienceSetting = useQuery(api.settings.getByKey, { key: EXPERIENCE_KEY });
  const postsModule = useQuery(api.admin.modules.getModuleByKey, { key: 'posts' });
  const productsModule = useQuery(api.admin.modules.getModuleByKey, { key: 'products' });
  const servicesModule = useQuery(api.admin.modules.getModuleByKey, { key: 'services' });

  const serverConfig = useMemo<SearchFilterExperienceConfig>(() => {
    const raw = experienceSetting?.value as Partial<SearchFilterExperienceConfig> | undefined;
    return {
      layoutStyle: raw?.layoutStyle ?? 'with-filters',
      resultsDisplayStyle: raw?.resultsDisplayStyle ?? 'grid',
      showFilters: raw?.showFilters ?? true,
      showSorting: raw?.showSorting ?? true,
      showResultCount: raw?.showResultCount ?? true,
    };
  }, [experienceSetting?.value]);

  const isLoading = experienceSetting === undefined;

  const { config, setConfig, hasChanges } = useExperienceConfig(serverConfig, DEFAULT_CONFIG, isLoading);
  const { handleSave, isSaving } = useExperienceSave(EXPERIENCE_KEY, config, MESSAGES.saveSuccess(EXPERIENCE_NAMES[EXPERIENCE_KEY]));

  const summaryItems: SummaryItem[] = [
    { label: 'Layout', value: config.layoutStyle, format: 'capitalize' },
    { label: 'Results Display', value: config.resultsDisplayStyle, format: 'capitalize' },
    { label: 'Filters', value: config.showFilters },
    { label: 'Sorting', value: config.showSorting },
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
        title="Trải nghiệm: Tìm kiếm & Lọc"
        description="Cấu hình search layout, filters, sorting và results display."
        iconBgClass="bg-teal-500/10"
        iconTextClass="text-teal-600 dark:text-teal-400"
        buttonClass="bg-teal-600 hover:bg-teal-500"
        onSave={handleSave}
        hasChanges={hasChanges}
        isSaving={isSaving}
      />

      {/* Full-width Preview */}
      <ExperiencePreview title="Trang tìm kiếm">
        <SearchFilterPreview
          layoutStyle={config.layoutStyle}
          resultsDisplayStyle={config.resultsDisplayStyle}
          showFilters={config.showFilters}
          showSorting={config.showSorting}
          showResultCount={config.showResultCount}
        />
      </ExperiencePreview>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="space-y-4 lg:col-span-2">
          <SettingsCard>
            <SettingSelect
              label="Search layout"
              value={config.layoutStyle}
              onChange={(value) => setConfig(prev => ({ ...prev, layoutStyle: value as SearchLayoutStyle }))}
              options={LAYOUT_STYLES.map(style => ({ label: `${style.label} - ${style.description}`, value: style.id }))}
              focusColor="focus:border-teal-500"
            />
          </SettingsCard>

          <SettingsCard>
            <SettingSelect
              label="Results display style"
              value={config.resultsDisplayStyle}
              onChange={(value) => setConfig(prev => ({ ...prev, resultsDisplayStyle: value as ResultsDisplayStyle }))}
              options={DISPLAY_STYLES.map(style => ({ label: `${style.label} - ${style.description}`, value: style.id }))}
              focusColor="focus:border-teal-500"
            />
          </SettingsCard>

          <Card className="p-4">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">Khối hiển thị</h3>
            <div className="space-y-3">
              <ExperienceBlockToggle
                label="Advanced Filters"
                description="Filters theo categories, price, etc."
                enabled={config.showFilters}
                onChange={() => setConfig(prev => ({ ...prev, showFilters: !prev.showFilters }))}
                color="bg-teal-500"
              />

              <ExperienceBlockToggle
                label="Sorting options"
                description="Sắp xếp kết quả (newest, price...)"
                enabled={config.showSorting}
                onChange={() => setConfig(prev => ({ ...prev, showSorting: !prev.showSorting }))}
                color="bg-teal-500"
              />

              <ExperienceBlockToggle
                label="Result count"
                description="Hiển thị số lượng kết quả"
                enabled={config.showResultCount}
                onChange={() => setConfig(prev => ({ ...prev, showResultCount: !prev.showResultCount }))}
                color="bg-teal-500"
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
              <ExperienceModuleLink
                enabled={productsModule?.enabled ?? false}
                href="/system/modules/products"
                icon={Package}
                title="Sản phẩm"
                colorScheme="cyan"
              />
              <ExperienceModuleLink
                enabled={servicesModule?.enabled ?? false}
                href="/system/modules/services"
                icon={Briefcase}
                title="Dịch vụ"
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
