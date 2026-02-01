'use client';

import React, { useMemo } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Briefcase, LayoutTemplate } from 'lucide-react';
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
import { useExperienceConfig, useExperienceSave, EXPERIENCE_NAMES, MESSAGES } from '@/lib/experiences';

type ListLayoutStyle = 'grid' | 'list' | 'masonry';
type FilterPosition = 'sidebar' | 'top' | 'none';

type ServicesListExperienceConfig = {
  layoutStyle: ListLayoutStyle;
  filterPosition: FilterPosition;
  showPagination: boolean;
  showSearch: boolean;
  showCategories: boolean;
};

const EXPERIENCE_KEY = 'services_list_ui';

const LAYOUT_STYLES: { id: ListLayoutStyle; label: string; description: string }[] = [
  { description: 'Hiển thị dạng lưới cards', id: 'grid', label: 'Grid' },
  { description: 'Hiển thị dạng danh sách', id: 'list', label: 'List' },
  { description: 'Hiển thị dạng masonry', id: 'masonry', label: 'Masonry' },
];

const FILTER_POSITIONS: { id: FilterPosition; label: string; description: string }[] = [
  { description: 'Filters ở thanh bên trái', id: 'sidebar', label: 'Sidebar' },
  { description: 'Filters ở trên cùng', id: 'top', label: 'Top' },
  { description: 'Không hiển thị filters', id: 'none', label: 'None' },
];

const DEFAULT_CONFIG: ServicesListExperienceConfig = {
  layoutStyle: 'grid',
  filterPosition: 'sidebar',
  showPagination: true,
  showSearch: true,
  showCategories: true,
};

const HINTS = [
  'Grid layout phù hợp cho service cards.',
  'List layout tốt cho services có nhiều thông tin.',
  'Filters giúp user tìm services phù hợp.',
];

export default function ServicesListExperiencePage() {
  const experienceSetting = useQuery(api.settings.getByKey, { key: EXPERIENCE_KEY });
  const servicesModule = useQuery(api.admin.modules.getModuleByKey, { key: 'services' });

  const serverConfig = useMemo<ServicesListExperienceConfig>(() => {
    const raw = experienceSetting?.value as Partial<ServicesListExperienceConfig> | undefined;
    return {
      layoutStyle: raw?.layoutStyle ?? 'grid',
      filterPosition: raw?.filterPosition ?? 'sidebar',
      showPagination: raw?.showPagination ?? true,
      showSearch: raw?.showSearch ?? true,
      showCategories: raw?.showCategories ?? true,
    };
  }, [experienceSetting?.value]);

  const isLoading = experienceSetting === undefined || servicesModule === undefined;

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
        title="Trải nghiệm: Danh sách dịch vụ"
        description="Cấu hình layout, filters, search và pagination cho trang danh sách dịch vụ."
        iconBgClass="bg-violet-500/10"
        iconTextClass="text-violet-600 dark:text-violet-400"
        buttonClass="bg-violet-600 hover:bg-violet-500"
        onSave={handleSave}
        hasChanges={hasChanges}
        isSaving={isSaving}
      />

      {/* Full-width Preview */}
      <LivePreview
        url="/services"
        title="Danh sách dịch vụ"
      />

      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="space-y-4 lg:col-span-2">
          <SettingsCard>
            <SettingSelect
              label="Layout danh sách"
              value={config.layoutStyle}
              onChange={(value) => setConfig(prev => ({ ...prev, layoutStyle: value as ListLayoutStyle }))}
              options={LAYOUT_STYLES.map(style => ({ label: `${style.label} - ${style.description}`, value: style.id }))}
              focusColor="focus:border-violet-500"
            />
          </SettingsCard>

          <SettingsCard>
            <SettingSelect
              label="Vị trí Filters"
              value={config.filterPosition}
              onChange={(value) => setConfig(prev => ({ ...prev, filterPosition: value as FilterPosition }))}
              options={FILTER_POSITIONS.map(pos => ({ label: `${pos.label} - ${pos.description}`, value: pos.id }))}
              focusColor="focus:border-violet-500"
            />
          </SettingsCard>

          <Card className="p-4">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">Khối hiển thị</h3>
            <div className="space-y-3">
              <ExperienceBlockToggle
                label="Tìm kiếm"
                description="Thanh search cho dịch vụ"
                enabled={config.showSearch}
                onChange={() => setConfig(prev => ({ ...prev, showSearch: !prev.showSearch }))}
                color="bg-violet-500"
                disabled={!servicesModule?.enabled}
              />

              <ExperienceBlockToggle
                label="Categories"
                description="Filter theo danh mục dịch vụ"
                enabled={config.showCategories}
                onChange={() => setConfig(prev => ({ ...prev, showCategories: !prev.showCategories }))}
                color="bg-violet-500"
                disabled={!servicesModule?.enabled}
              />

              <ExperienceBlockToggle
                label="Pagination"
                description="Phân trang kết quả"
                enabled={config.showPagination}
                onChange={() => setConfig(prev => ({ ...prev, showPagination: !prev.showPagination }))}
                color="bg-violet-500"
                disabled={!servicesModule?.enabled}
              />
            </div>
          </Card>

          <ExperienceSummaryGrid items={summaryItems} />
        </div>

        <div className="space-y-4">
          <ExampleLinks
            links={[
              { label: 'Trang danh sách dịch vụ', url: '/services', description: 'Xem tất cả dịch vụ' },
            ]}
            color="#8b5cf6"
          />

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Module liên quan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
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
