'use client';

import React, { useMemo, useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { FileText, LayoutTemplate, Loader2, Save } from 'lucide-react';
import { Button, Card } from '@/app/admin/components/ui';
import {
  ExperienceModuleLink, 
  ExperienceHintCard,
  PostsListPreview,
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
import { useExperienceConfig, useExperienceSave, useExamplePostCategorySlug, EXPERIENCE_NAMES, MESSAGES } from '@/lib/experiences';

type ListLayoutStyle = 'fullwidth' | 'sidebar' | 'magazine';

type PostsListExperienceConfig = {
  layoutStyle: ListLayoutStyle;
  showSearch: boolean;
  showCategories: boolean;
  showPagination: boolean;
  postsPerPage: number;
};

const EXPERIENCE_KEY = 'posts_list_ui';

// Legacy keys for backward compatibility with /posts page
const LEGACY_LAYOUT_KEY = 'posts_list_style';

const LAYOUT_STYLES: LayoutOption<ListLayoutStyle>[] = [
  { description: 'Horizontal filter bar + grid/list toggle, tối ưu mobile', id: 'fullwidth', label: 'Full Width' },
  { description: 'Classic blog với sidebar filters, categories, recent posts', id: 'sidebar', label: 'Sidebar' },
  { description: 'Hero slider + category tabs, phong cách editorial', id: 'magazine', label: 'Magazine' },
];

const DEFAULT_CONFIG: PostsListExperienceConfig = {
  layoutStyle: 'fullwidth',
  showSearch: true,
  showCategories: true,
  showPagination: true,
  postsPerPage: 12,
};

const HINTS = [
  'Full Width phù hợp blog có nhiều bài viết, filter rõ ràng.',
  'Sidebar giúp nhấn mạnh bộ lọc và bài viết mới.',
  'Magazine tạo cảm giác editorial, phù hợp nội dung nổi bật.',
  'Real-time preview hiển thị chính xác với giao diện thực.',
];

export default function PostsListExperiencePage() {
  const experienceSetting = useQuery(api.settings.getByKey, { key: EXPERIENCE_KEY });
  const postsModule = useQuery(api.admin.modules.getModuleByKey, { key: 'posts' });
  const brandColorSetting = useQuery(api.settings.getByKey, { key: 'site_brand_color' });
  const exampleCategorySlug = useExamplePostCategorySlug();
  const [previewDevice, setPreviewDevice] = useState<DeviceType>('desktop');
  const [isPanelExpanded, setIsPanelExpanded] = useState(true);
  
  // Read legacy layout setting
  const legacyLayoutSetting = useQuery(api.settings.getByKey, { key: LEGACY_LAYOUT_KEY });

  const serverConfig = useMemo<PostsListExperienceConfig>(() => {
    const raw = experienceSetting?.value as Partial<PostsListExperienceConfig> | undefined;
    const legacyLayout = legacyLayoutSetting?.value as string;
    const rawLayout = raw?.layoutStyle as string | undefined;
    
    const normalizeLayoutStyle = (value?: string): ListLayoutStyle => {
      if (value === 'fullwidth' || value === 'grid') {return 'fullwidth';}
      if (value === 'sidebar' || value === 'list') {return 'sidebar';}
      if (value === 'magazine' || value === 'masonry') {return 'magazine';}
      return 'fullwidth';
    };
    
    return {
      layoutStyle: normalizeLayoutStyle(rawLayout ?? legacyLayout),
      showSearch: raw?.showSearch ?? true,
      showCategories: raw?.showCategories ?? true,
      showPagination: raw?.showPagination ?? true,
      postsPerPage: raw?.postsPerPage ?? 12,
    };
  }, [experienceSetting?.value, legacyLayoutSetting?.value]);

  const isLoading = experienceSetting === undefined || postsModule === undefined;
  const brandColor = (brandColorSetting?.value as string) || '#3b82f6';

  const { config, setConfig, hasChanges } = useExperienceConfig(serverConfig, DEFAULT_CONFIG, isLoading);
  
  // Additional settings to sync with legacy keys
  const additionalSettings = useMemo(() => [
    { group: 'posts', key: LEGACY_LAYOUT_KEY, value: config.layoutStyle }
  ], [config.layoutStyle]);
  
  const { handleSave, isSaving } = useExperienceSave(
    EXPERIENCE_KEY, 
    config, 
    MESSAGES.saveSuccess(EXPERIENCE_NAMES[EXPERIENCE_KEY]),
    additionalSettings
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
      {/* Compact Header - 48px */}
      <header className="h-12 px-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
        <div className="flex items-center gap-2">
          <LayoutTemplate className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">Danh sách bài viết</span>
        </div>
        <div className="flex items-center gap-3">
          <DeviceToggle value={previewDevice} onChange={setPreviewDevice} size="sm" />
          <Button 
            size="sm"
            onClick={handleSave} 
            disabled={!hasChanges || isSaving}
            className="bg-blue-600 hover:bg-blue-500 gap-1.5"
          >
            {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            <span>{hasChanges ? 'Lưu' : 'Đã lưu'}</span>
          </Button>
        </div>
      </header>
      
      {/* Preview Area */}
      <main className="flex-1 overflow-auto p-4 bg-slate-50 dark:bg-slate-950">
        <div className={`mx-auto transition-all duration-300 ${deviceWidths[previewDevice]}`}>
          <BrowserFrame url="yoursite.com/posts" maxHeight="calc(100vh - 320px)">
            <PostsListPreview
              layoutStyle={config.layoutStyle}
              brandColor={brandColor}
              device={previewDevice}
              showSearch={config.showSearch}
              showCategories={config.showCategories}
              showPagination={config.showPagination}
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
            accentColor="#3b82f6"
          />
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <ControlCard title="Hiển thị">
            <ToggleRow label="Tìm kiếm" checked={config.showSearch} onChange={(v) => setConfig(prev => ({ ...prev, showSearch: v }))} accentColor="#3b82f6" />
            <ToggleRow label="Danh mục" checked={config.showCategories} onChange={(v) => setConfig(prev => ({ ...prev, showCategories: v }))} accentColor="#3b82f6" />
            <ToggleRow label="Phân trang" checked={config.showPagination} onChange={(v) => setConfig(prev => ({ ...prev, showPagination: v }))} accentColor="#3b82f6" />
          </ControlCard>
          
          <ControlCard title="Module liên quan">
            <ExperienceModuleLink
              enabled={postsModule?.enabled ?? false}
              href="/system/modules/posts"
              icon={FileText}
              title="Bài viết"
              colorScheme="cyan"
            />
          </ControlCard>
          
          <ControlCard title="Link xem thử">
            <ExampleLinks
              links={[
                { label: 'Trang danh sách', url: '/posts', description: 'Xem tất cả bài viết' },
                ...(exampleCategorySlug ? [{ label: 'Lọc theo category', url: `/posts?catpost=${exampleCategorySlug}`, description: 'Ví dụ filter' }] : []),
              ]}
              color="#3b82f6"
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
