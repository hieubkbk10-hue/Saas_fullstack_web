'use client';

import React, { useMemo } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { LayoutTemplate, Package } from 'lucide-react';
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

type ProductsListExperienceConfig = {
  layoutStyle: ListLayoutStyle;
  filterPosition: FilterPosition;
  showPagination: boolean;
  showSearch: boolean;
  showCategories: boolean;
};

const EXPERIENCE_KEY = 'products_list_ui';

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

const DEFAULT_CONFIG: ProductsListExperienceConfig = {
  layoutStyle: 'grid',
  filterPosition: 'sidebar',
  showPagination: true,
  showSearch: true,
  showCategories: true,
};

const HINTS = [
  'Grid layout tiêu chuẩn cho e-commerce.',
  'Sidebar filters quan trọng cho shop có nhiều sản phẩm.',
  'Search giúp user tìm sản phẩm nhanh.',
];

export default function ProductsListExperiencePage() {
  const experienceSetting = useQuery(api.settings.getByKey, { key: EXPERIENCE_KEY });
  const productsModule = useQuery(api.admin.modules.getModuleByKey, { key: 'products' });

  const serverConfig = useMemo<ProductsListExperienceConfig>(() => {
    const raw = experienceSetting?.value as Partial<ProductsListExperienceConfig> | undefined;
    return {
      layoutStyle: raw?.layoutStyle ?? 'grid',
      filterPosition: raw?.filterPosition ?? 'sidebar',
      showPagination: raw?.showPagination ?? true,
      showSearch: raw?.showSearch ?? true,
      showCategories: raw?.showCategories ?? true,
    };
  }, [experienceSetting?.value]);

  const isLoading = experienceSetting === undefined || productsModule === undefined;

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
        title="Trải nghiệm: Danh sách sản phẩm"
        description="Cấu hình layout, filters, search và pagination cho trang danh sách sản phẩm."
        iconBgClass="bg-emerald-500/10"
        iconTextClass="text-emerald-600 dark:text-emerald-400"
        buttonClass="bg-emerald-600 hover:bg-emerald-500"
        onSave={handleSave}
        hasChanges={hasChanges}
        isSaving={isSaving}
      />

      {/* Full-width Preview */}
      <LivePreview
        url="/products"
        title="Danh sách sản phẩm"
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
              focusColor="focus:border-emerald-500"
            />
          </SettingsCard>

          <SettingsCard>
            <SettingSelect
              label="Vị trí Filters"
              value={config.filterPosition}
              onChange={(value) => setConfig(prev => ({ ...prev, filterPosition: value as FilterPosition }))}
              options={FILTER_POSITIONS.map(pos => ({ label: `${pos.label} - ${pos.description}`, value: pos.id }))}
              focusColor="focus:border-emerald-500"
            />
          </SettingsCard>

          <Card className="p-4">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">Khối hiển thị</h3>
            <div className="space-y-3">
              <ExperienceBlockToggle
                label="Tìm kiếm"
                description="Thanh search cho sản phẩm"
                enabled={config.showSearch}
                onChange={() => setConfig(prev => ({ ...prev, showSearch: !prev.showSearch }))}
                color="bg-emerald-500"
                disabled={!productsModule?.enabled}
              />

              <ExperienceBlockToggle
                label="Categories"
                description="Filter theo danh mục sản phẩm"
                enabled={config.showCategories}
                onChange={() => setConfig(prev => ({ ...prev, showCategories: !prev.showCategories }))}
                color="bg-emerald-500"
                disabled={!productsModule?.enabled}
              />

              <ExperienceBlockToggle
                label="Pagination"
                description="Phân trang kết quả"
                enabled={config.showPagination}
                onChange={() => setConfig(prev => ({ ...prev, showPagination: !prev.showPagination }))}
                color="bg-emerald-500"
                disabled={!productsModule?.enabled}
              />
            </div>
          </Card>

          <ExperienceSummaryGrid items={summaryItems} />
        </div>

        <div className="space-y-4">
          <ExampleLinks
            links={[
              { label: 'Trang danh sách sản phẩm', url: '/products', description: 'Xem tất cả sản phẩm' },
            ]}
            color="#10b981"
          />

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Module liên quan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <ExperienceModuleLink
                enabled={productsModule?.enabled ?? false}
                href="/system/modules/products"
                icon={Package}
                title="Sản phẩm"
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
