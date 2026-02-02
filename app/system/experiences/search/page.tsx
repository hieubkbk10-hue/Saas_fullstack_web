'use client';

import React, { useMemo, useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Briefcase, FileText, LayoutTemplate, Loader2, Package, Save } from 'lucide-react';
import { Button, Card } from '@/app/admin/components/ui';
import { 
  ExperienceModuleLink, 
  ExperienceHintCard,
  SearchFilterPreview,
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

type SearchLayoutStyle = 'search-only' | 'with-filters' | 'advanced';
type ResultsDisplayStyle = 'grid' | 'list';

type SearchFilterExperienceConfig = {
  layoutStyle: SearchLayoutStyle;
  layouts: {
    'search-only': LayoutConfig;
    'with-filters': LayoutConfig;
    'advanced': LayoutConfig;
  };
};

type LayoutConfig = {
  resultsDisplayStyle: ResultsDisplayStyle;
  showFilters: boolean;
  showSorting: boolean;
  showResultCount: boolean;
};

const EXPERIENCE_KEY = 'search_filter_ui';

const LAYOUT_STYLES: LayoutOption<SearchLayoutStyle>[] = [
  { description: 'Chỉ có search bar và results', id: 'search-only', label: 'Search Only' },
  { description: 'Search + sidebar filters', id: 'with-filters', label: 'With Filters' },
  { description: 'Advanced với filter chips', id: 'advanced', label: 'Advanced' },
];

const DISPLAY_STYLES: { id: ResultsDisplayStyle; label: string }[] = [
  { id: 'grid', label: 'Grid' },
  { id: 'list', label: 'List' },
];

const DEFAULT_LAYOUT_CONFIG: LayoutConfig = {
  resultsDisplayStyle: 'grid',
  showFilters: true,
  showSorting: true,
  showResultCount: true,
};

const DEFAULT_CONFIG: SearchFilterExperienceConfig = {
  layoutStyle: 'with-filters',
  layouts: {
    'search-only': { ...DEFAULT_LAYOUT_CONFIG, showFilters: false },
    'with-filters': { ...DEFAULT_LAYOUT_CONFIG },
    'advanced': { ...DEFAULT_LAYOUT_CONFIG },
  },
};

const HINTS = [
  'Advanced layout tốt cho search phức tạp.',
  'Filters giúp users tìm kết quả chính xác.',
  'Result count giúp users biết được số lượng.',
  'Mỗi layout có config riêng - chuyển tab để chỉnh.',
];

export default function SearchFilterExperiencePage() {
  const experienceSetting = useQuery(api.settings.getByKey, { key: EXPERIENCE_KEY });
  const postsModule = useQuery(api.admin.modules.getModuleByKey, { key: 'posts' });
  const productsModule = useQuery(api.admin.modules.getModuleByKey, { key: 'products' });
  const servicesModule = useQuery(api.admin.modules.getModuleByKey, { key: 'services' });
  const [previewDevice, setPreviewDevice] = useState<DeviceType>('desktop');
  const [isPanelExpanded, setIsPanelExpanded] = useState(true);

  const serverConfig = useMemo<SearchFilterExperienceConfig>(() => {
    const raw = experienceSetting?.value as Partial<SearchFilterExperienceConfig> | undefined;
    return {
      layoutStyle: raw?.layoutStyle ?? 'with-filters',
      layouts: {
        'search-only': { ...DEFAULT_CONFIG.layouts['search-only'], ...raw?.layouts?.['search-only'] },
        'with-filters': { ...DEFAULT_CONFIG.layouts['with-filters'], ...raw?.layouts?.['with-filters'] },
        'advanced': { ...DEFAULT_CONFIG.layouts['advanced'], ...raw?.layouts?.['advanced'] },
      },
    };
  }, [experienceSetting?.value]);

  const isLoading = experienceSetting === undefined;

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
          <LayoutTemplate className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">Tìm kiếm & Lọc</span>
        </div>
        <div className="flex items-center gap-3">
          <DeviceToggle value={previewDevice} onChange={setPreviewDevice} size="sm" />
          <Button
            size="sm"
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            className="bg-teal-600 hover:bg-teal-500 gap-1.5"
          >
            {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            <span>{hasChanges ? 'Lưu' : 'Đã lưu'}</span>
          </Button>
        </div>
      </header>

      {/* Preview Area */}
      <main className="flex-1 overflow-auto p-4 bg-slate-50 dark:bg-slate-950">
        <div className={`mx-auto transition-all duration-300 ${deviceWidths[previewDevice]}`}>
          <BrowserFrame url="yoursite.com/search?q=keyword" maxHeight="calc(100vh - 320px)">
            <SearchFilterPreview
              layoutStyle={config.layoutStyle}
              resultsDisplayStyle={currentLayoutConfig.resultsDisplayStyle}
              showFilters={currentLayoutConfig.showFilters}
              showSorting={currentLayoutConfig.showSorting}
              showResultCount={currentLayoutConfig.showResultCount}
              device={previewDevice}
              brandColor="#14b8a6"
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
            accentColor="#14b8a6"
          />
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <ControlCard title="Khối hiển thị">
            <ToggleRow label="Filters" checked={currentLayoutConfig.showFilters} onChange={(v) => updateLayoutConfig('showFilters', v)} accentColor="#14b8a6" />
            <ToggleRow label="Sorting" checked={currentLayoutConfig.showSorting} onChange={(v) => updateLayoutConfig('showSorting', v)} accentColor="#14b8a6" />
            <ToggleRow label="Result count" checked={currentLayoutConfig.showResultCount} onChange={(v) => updateLayoutConfig('showResultCount', v)} accentColor="#14b8a6" />
          </ControlCard>

          <ControlCard title={`Cấu hình ${config.layoutStyle}`}>
            <SelectRow
              label="Kiểu hiển thị kết quả"
              value={currentLayoutConfig.resultsDisplayStyle}
              onChange={(v) => updateLayoutConfig('resultsDisplayStyle', v as ResultsDisplayStyle)}
              options={DISPLAY_STYLES.map(s => ({ label: s.label, value: s.id }))}
            />
          </ControlCard>

          <ControlCard title="Module liên quan">
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
          </ControlCard>

          <Card className="p-2">
            <ExperienceHintCard hints={HINTS} />
          </Card>
        </div>
      </ConfigPanel>
    </div>
  );
}
