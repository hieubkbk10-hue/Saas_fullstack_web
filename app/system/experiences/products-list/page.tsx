'use client';

import React, { useMemo, useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { LayoutTemplate, Loader2, Package, Save } from 'lucide-react';
import { Button, Card } from '@/app/admin/components/ui';
import { 
  ExperienceModuleLink, 
  ExperienceHintCard,
  ProductsListPreview,
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
  SelectRow,
  type DeviceType,
  type LayoutOption,
} from '@/components/experiences/editor';
import { useExperienceConfig, useExperienceSave, EXPERIENCE_NAMES, MESSAGES } from '@/lib/experiences';

type ListLayoutStyle = 'grid' | 'list' | 'masonry';
type FilterPosition = 'sidebar' | 'top' | 'none';
type PaginationType = 'pagination' | 'infiniteScroll';

type ProductsListExperienceConfig = {
  layoutStyle: ListLayoutStyle;
  layouts: {
    grid: LayoutConfig;
    list: LayoutConfig;
    masonry: LayoutConfig;
  };
};

type LayoutConfig = {
  filterPosition: FilterPosition;
  paginationType: PaginationType;
  showSearch: boolean;
  showCategories: boolean;
  postsPerPage: number;
};

const EXPERIENCE_KEY = 'products_list_ui';

const LAYOUT_STYLES: LayoutOption<ListLayoutStyle>[] = [
  { description: 'Hiển thị dạng lưới cards', id: 'grid', label: 'Grid' },
  { description: 'Hiển thị dạng danh sách', id: 'list', label: 'List' },
  { description: 'Hiển thị dạng masonry', id: 'masonry', label: 'Masonry' },
];

const FILTER_POSITIONS: LayoutOption<FilterPosition>[] = [
  { description: 'Filters ở thanh bên trái', id: 'sidebar', label: 'Sidebar' },
  { description: 'Filters ở trên cùng', id: 'top', label: 'Top' },
  { description: 'Không hiển thị filters', id: 'none', label: 'None' },
];

const DEFAULT_LAYOUT_CONFIG: LayoutConfig = {
  filterPosition: 'sidebar',
  paginationType: 'pagination',
  showSearch: true,
  showCategories: true,
  postsPerPage: 12,
};

const DEFAULT_CONFIG: ProductsListExperienceConfig = {
  layoutStyle: 'grid',
  layouts: {
    grid: { ...DEFAULT_LAYOUT_CONFIG },
    list: { ...DEFAULT_LAYOUT_CONFIG },
    masonry: { ...DEFAULT_LAYOUT_CONFIG },
  },
};

const HINTS = [
  'Grid layout tiêu chuẩn cho e-commerce.',
  'Sidebar filters quan trọng cho shop có nhiều sản phẩm.',
  'Search giúp user tìm sản phẩm nhanh.',
  'Mỗi layout có config riêng - chuyển tab để chỉnh.',
];

export default function ProductsListExperiencePage() {
  const experienceSetting = useQuery(api.settings.getByKey, { key: EXPERIENCE_KEY });
  const productsModule = useQuery(api.admin.modules.getModuleByKey, { key: 'products' });
  const brandColorSetting = useQuery(api.settings.getByKey, { key: 'site_brand_color' });
  const [previewDevice, setPreviewDevice] = useState<DeviceType>('desktop');
  const [isPanelExpanded, setIsPanelExpanded] = useState(true);

  const serverConfig = useMemo<ProductsListExperienceConfig>(() => {
    const raw = experienceSetting?.value as Partial<ProductsListExperienceConfig> | undefined;
    
    const normalizePaginationType = (value?: string | boolean): PaginationType => {
      if (value === 'infiniteScroll') return 'infiniteScroll';
      if (value === 'pagination') return 'pagination';
      if (value === false) return 'infiniteScroll';
      return 'pagination';
    };
    
    const normalizeLayoutConfig = (cfg?: Partial<LayoutConfig & { showPagination?: boolean }>): LayoutConfig => ({
      filterPosition: cfg?.filterPosition ?? 'sidebar',
      paginationType: normalizePaginationType(cfg?.paginationType ?? cfg?.showPagination),
      showSearch: cfg?.showSearch ?? true,
      showCategories: cfg?.showCategories ?? true,
      postsPerPage: cfg?.postsPerPage ?? 12,
    });
    
    return {
      layoutStyle: raw?.layoutStyle ?? 'grid',
      layouts: {
        grid: normalizeLayoutConfig(raw?.layouts?.grid as Partial<LayoutConfig & { showPagination?: boolean }>),
        list: normalizeLayoutConfig(raw?.layouts?.list as Partial<LayoutConfig & { showPagination?: boolean }>),
        masonry: normalizeLayoutConfig(raw?.layouts?.masonry as Partial<LayoutConfig & { showPagination?: boolean }>),
      },
    };
  }, [experienceSetting?.value]);

  const isLoading = experienceSetting === undefined || productsModule === undefined;
  const brandColor = (brandColorSetting?.value as string) || '#10b981';

  const { config, setConfig, hasChanges } = useExperienceConfig(serverConfig, DEFAULT_CONFIG, isLoading);
  const { handleSave, isSaving } = useExperienceSave(
    EXPERIENCE_KEY,
    config,
    MESSAGES.saveSuccess(EXPERIENCE_NAMES[EXPERIENCE_KEY])
  );

  const currentLayoutConfig = config.layouts[config.layoutStyle];

  const updateLayoutConfig = <K extends keyof LayoutConfig>(
    key: K,
    value: LayoutConfig[K]
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
          <LayoutTemplate className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">Danh sách sản phẩm</span>
        </div>
        <div className="flex items-center gap-3">
          <DeviceToggle value={previewDevice} onChange={setPreviewDevice} size="sm" />
          <Button
            size="sm"
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            className="bg-emerald-600 hover:bg-emerald-500 gap-1.5"
          >
            {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            <span>{hasChanges ? 'Lưu' : 'Đã lưu'}</span>
          </Button>
        </div>
      </header>

      {/* Preview Area */}
      <main className="flex-1 overflow-auto p-4 bg-slate-50 dark:bg-slate-950">
        <div className={`mx-auto transition-all duration-300 ${deviceWidths[previewDevice]}`}>
          <BrowserFrame url="yoursite.com/products" maxHeight="calc(100vh - 320px)">
            <ProductsListPreview
              layoutStyle={config.layoutStyle}
              filterPosition={currentLayoutConfig.filterPosition}
              paginationType={currentLayoutConfig.paginationType}
              showSearch={currentLayoutConfig.showSearch}
              showCategories={currentLayoutConfig.showCategories}
              brandColor={brandColor}
              device={previewDevice}
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
            accentColor="#10b981"
          />
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <ControlCard title="Vị trí Filters">
            {FILTER_POSITIONS.map((pos) => (
              <ToggleRow
                key={pos.id}
                label={pos.label}
                checked={currentLayoutConfig.filterPosition === pos.id}
                onChange={() => updateLayoutConfig('filterPosition', pos.id)}
                accentColor="#10b981"
              />
            ))}
          </ControlCard>

          <ControlCard title="Khối hiển thị">
            <ToggleRow
              label="Tìm kiếm"
              checked={currentLayoutConfig.showSearch}
              onChange={(v) => updateLayoutConfig('showSearch', v)}
              accentColor="#10b981"
              disabled={!productsModule?.enabled}
            />
            <ToggleRow
              label="Danh mục"
              checked={currentLayoutConfig.showCategories}
              onChange={(v) => updateLayoutConfig('showCategories', v)}
              accentColor="#10b981"
              disabled={!productsModule?.enabled}
            />
          </ControlCard>

          <ControlCard title="Phân trang">
            <SelectRow
              label="Kiểu"
              value={currentLayoutConfig.paginationType}
              options={[
                { value: 'pagination', label: 'Phân trang' },
                { value: 'infiniteScroll', label: 'Cuộn vô hạn' },
              ]}
              onChange={(v) => updateLayoutConfig('paginationType', v as PaginationType)}
              disabled={!productsModule?.enabled}
            />
            <SelectRow
              label="Bài mỗi trang"
              value={String(currentLayoutConfig.postsPerPage)}
              options={[
                { value: '12', label: '12' },
                { value: '20', label: '20' },
                { value: '24', label: '24' },
                { value: '48', label: '48' },
              ]}
              onChange={(v) => updateLayoutConfig('postsPerPage', Number(v))}
              disabled={!productsModule?.enabled}
            />
          </ControlCard>

          <ControlCard title="Module liên quan">
            <ExperienceModuleLink
              enabled={productsModule?.enabled ?? false}
              href="/system/modules/products"
              icon={Package}
              title="Sản phẩm"
              colorScheme="cyan"
            />
          </ControlCard>

          <Card className="p-2">
            <div className="mb-2">
              <ExampleLinks
                links={[{ label: 'Trang danh sách', url: '/products' }]}
                color="#10b981"
                compact
              />
            </div>
            <ExperienceHintCard hints={HINTS} />
          </Card>
        </div>
      </ConfigPanel>
    </div>
  );
}
