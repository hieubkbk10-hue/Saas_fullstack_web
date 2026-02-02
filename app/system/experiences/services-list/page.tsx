'use client';

import React, { useMemo, useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Briefcase, LayoutTemplate, Loader2, Save } from 'lucide-react';
import { Button, Card } from '@/app/admin/components/ui';
import { 
  ExperienceModuleLink, 
  ExperienceHintCard,
  ServicesListPreview,
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
  type DeviceType,
  type LayoutOption,
} from '@/components/experiences/editor';
import { useExperienceConfig, useExperienceSave, EXPERIENCE_NAMES, MESSAGES } from '@/lib/experiences';

type ListLayoutStyle = 'grid' | 'sidebar' | 'masonry';

type ServicesListExperienceConfig = {
  layoutStyle: ListLayoutStyle;
  layouts: {
    grid: LayoutConfig;
    sidebar: LayoutConfig;
    masonry: LayoutConfig;
  };
};

type LayoutConfig = {
  showSearch: boolean;
  showCategories: boolean;
  showPagination: boolean;
};

const EXPERIENCE_KEY = 'services_list_ui';

const LAYOUT_STYLES: LayoutOption<ListLayoutStyle>[] = [
  { description: 'Hiển thị dạng lưới cards', id: 'grid', label: 'Grid' },
  { description: 'Hiển thị với sidebar bên trái', id: 'sidebar', label: 'Sidebar' },
  { description: 'Hiển thị dạng magazine chuyên nghiệp', id: 'masonry', label: 'Magazine' },
];

const DEFAULT_LAYOUT_CONFIG: LayoutConfig = {
  showSearch: true,
  showCategories: true,
  showPagination: true,
};

const DEFAULT_CONFIG: ServicesListExperienceConfig = {
  layoutStyle: 'grid',
  layouts: {
    grid: { ...DEFAULT_LAYOUT_CONFIG },
    sidebar: { ...DEFAULT_LAYOUT_CONFIG },
    masonry: { ...DEFAULT_LAYOUT_CONFIG },
  },
};

const HINTS = [
  'Grid layout hiển thị cards dạng lưới gọn gàng.',
  'Sidebar layout có sidebar trái với search và categories.',
  'Magazine layout tạo cảm giác chuyên nghiệp với hero featured.',
  'Mỗi layout có config riêng - chuyển tab để chỉnh.',
];

export default function ServicesListExperiencePage() {
  const experienceSetting = useQuery(api.settings.getByKey, { key: EXPERIENCE_KEY });
  const servicesModule = useQuery(api.admin.modules.getModuleByKey, { key: 'services' });
  const brandColorSetting = useQuery(api.settings.getByKey, { key: 'site_brand_color' });
  const [previewDevice, setPreviewDevice] = useState<DeviceType>('desktop');
  const [isPanelExpanded, setIsPanelExpanded] = useState(true);

  const serverConfig = useMemo<ServicesListExperienceConfig>(() => {
    const raw = experienceSetting?.value as Partial<ServicesListExperienceConfig> | undefined;
    // Migrate legacy 'list' layout to 'sidebar'
    const rawLayout = raw?.layoutStyle as string | undefined;
    const normalizedLayout = rawLayout === 'list' ? 'sidebar' : rawLayout;
    return {
      layoutStyle: (normalizedLayout as ListLayoutStyle | undefined) ?? 'grid',
      layouts: {
        grid: { ...DEFAULT_LAYOUT_CONFIG, ...raw?.layouts?.grid },
        sidebar: { ...DEFAULT_LAYOUT_CONFIG, ...raw?.layouts?.sidebar },
        masonry: { ...DEFAULT_LAYOUT_CONFIG, ...raw?.layouts?.masonry },
      },
    };
  }, [experienceSetting?.value]);

  const isLoading = experienceSetting === undefined || servicesModule === undefined;
  const brandColor = (brandColorSetting?.value as string) || '#8b5cf6';

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
          <LayoutTemplate className="w-4 h-4 text-violet-600 dark:text-violet-400" />
          <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">Danh sách dịch vụ</span>
        </div>
        <div className="flex items-center gap-3">
          <DeviceToggle value={previewDevice} onChange={setPreviewDevice} size="sm" />
          <Button
            size="sm"
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            className="bg-violet-600 hover:bg-violet-500 gap-1.5"
          >
            {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            <span>{hasChanges ? 'Lưu' : 'Đã lưu'}</span>
          </Button>
        </div>
      </header>

      {/* Preview Area */}
      <main className="flex-1 overflow-auto p-4 bg-slate-50 dark:bg-slate-950">
        <div className={`mx-auto transition-all duration-300 ${deviceWidths[previewDevice]}`}>
          <BrowserFrame url="yoursite.com/services" maxHeight="calc(100vh - 320px)">
            <ServicesListPreview
              layoutStyle={config.layoutStyle}
              showSearch={currentLayoutConfig.showSearch}
              showCategories={currentLayoutConfig.showCategories}
              showPagination={currentLayoutConfig.showPagination}
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
            accentColor="#8b5cf6"
          />
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <ControlCard title="Khối hiển thị">
            <ToggleRow
              label="Tìm kiếm"
              checked={currentLayoutConfig.showSearch}
              onChange={(v) => updateLayoutConfig('showSearch', v)}
              accentColor="#8b5cf6"
              disabled={!servicesModule?.enabled}
            />
            <ToggleRow
              label="Danh mục"
              checked={currentLayoutConfig.showCategories}
              onChange={(v) => updateLayoutConfig('showCategories', v)}
              accentColor="#8b5cf6"
              disabled={!servicesModule?.enabled}
            />
            <ToggleRow
              label="Phân trang"
              checked={currentLayoutConfig.showPagination}
              onChange={(v) => updateLayoutConfig('showPagination', v)}
              accentColor="#8b5cf6"
              disabled={!servicesModule?.enabled}
            />
          </ControlCard>

          <ControlCard title="Module liên quan">
            <ExperienceModuleLink
              enabled={servicesModule?.enabled ?? false}
              href="/system/modules/services"
              icon={Briefcase}
              title="Dịch vụ"
              colorScheme="cyan"
            />
          </ControlCard>

          <ControlCard title="Link xem thử">
            <ExampleLinks
              links={[{ label: 'Trang danh sách', url: '/services' }]}
              color="#8b5cf6"
              compact
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
