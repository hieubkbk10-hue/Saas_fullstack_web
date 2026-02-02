'use client';

import React, { useMemo, useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Heart, LayoutTemplate, Loader2, Save } from 'lucide-react';
import { Button, Card } from '@/app/admin/components/ui';
import { 
  ExperienceModuleLink, 
  ExperienceHintCard,
  WishlistPreview,
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

type WishlistLayoutStyle = 'grid' | 'list';

type WishlistExperienceConfig = {
  layoutStyle: WishlistLayoutStyle;
  layouts: {
    grid: LayoutConfig;
    list: LayoutConfig;
  };
};

type LayoutConfig = {
  showWishlistButton: boolean;
  showNote: boolean;
  showNotification: boolean;
};

const EXPERIENCE_KEY = 'wishlist_ui';

const LAYOUT_STYLES: LayoutOption<WishlistLayoutStyle>[] = [
  { description: 'Hiển thị dạng lưới cards', id: 'grid', label: 'Grid' },
  { description: 'Hiển thị dạng danh sách chi tiết', id: 'list', label: 'List' },
];

const DEFAULT_LAYOUT_CONFIG: LayoutConfig = {
  showWishlistButton: true,
  showNote: true,
  showNotification: true,
};

const DEFAULT_CONFIG: WishlistExperienceConfig = {
  layoutStyle: 'grid',
  layouts: {
    grid: { ...DEFAULT_LAYOUT_CONFIG },
    list: { ...DEFAULT_LAYOUT_CONFIG },
  },
};

const HINTS = [
  'Bật module Wishlist trước khi cấu hình UX.',
  'Nút wishlist sẽ xuất hiện trên product cards và detail.',
  'Note và notification tùy chọn theo nhu cầu.',
  'Mỗi layout có config riêng - chuyển tab để chỉnh.',
];

export default function WishlistExperiencePage() {
  const experienceSetting = useQuery(api.settings.getByKey, { key: EXPERIENCE_KEY });
  const wishlistModule = useQuery(api.admin.modules.getModuleByKey, { key: 'wishlist' });
  const noteFeature = useQuery(api.admin.modules.getModuleFeature, { featureKey: 'enableNote', moduleKey: 'wishlist' });
  const notificationFeature = useQuery(api.admin.modules.getModuleFeature, { featureKey: 'enableNotification', moduleKey: 'wishlist' });
  const [previewDevice, setPreviewDevice] = useState<DeviceType>('desktop');
  const [isPanelExpanded, setIsPanelExpanded] = useState(true);

  const serverConfig = useMemo<WishlistExperienceConfig>(() => {
    const raw = experienceSetting?.value as Partial<WishlistExperienceConfig> | undefined;
    return {
      layoutStyle: raw?.layoutStyle ?? 'grid',
      layouts: {
        grid: { ...DEFAULT_LAYOUT_CONFIG, showNote: noteFeature?.enabled ?? true, showNotification: notificationFeature?.enabled ?? true, ...raw?.layouts?.grid },
        list: { ...DEFAULT_LAYOUT_CONFIG, showNote: noteFeature?.enabled ?? true, showNotification: notificationFeature?.enabled ?? true, ...raw?.layouts?.list },
      },
    };
  }, [experienceSetting?.value, noteFeature?.enabled, notificationFeature?.enabled]);

  const isLoading = experienceSetting === undefined || wishlistModule === undefined;

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
          <LayoutTemplate className="w-4 h-4 text-pink-600 dark:text-pink-400" />
          <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">Sản phẩm yêu thích</span>
        </div>
        <div className="flex items-center gap-3">
          <DeviceToggle value={previewDevice} onChange={setPreviewDevice} size="sm" />
          <Button
            size="sm"
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            className="bg-pink-600 hover:bg-pink-500 gap-1.5"
          >
            {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            <span>{hasChanges ? 'Lưu' : 'Đã lưu'}</span>
          </Button>
        </div>
      </header>

      {/* Preview Area */}
      <main className="flex-1 overflow-auto p-4 bg-slate-50 dark:bg-slate-950">
        <div className={`mx-auto transition-all duration-300 ${deviceWidths[previewDevice]}`}>
          <BrowserFrame url="yoursite.com/wishlist" maxHeight="calc(100vh - 320px)">
            <WishlistPreview
              layoutStyle={config.layoutStyle}
              showWishlistButton={currentLayoutConfig.showWishlistButton}
              showNote={currentLayoutConfig.showNote}
              showNotification={currentLayoutConfig.showNotification}
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
            accentColor="#ec4899"
          />
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <ControlCard title="Khối hiển thị">
            <ToggleRow
              label="Nút Wishlist"
              checked={currentLayoutConfig.showWishlistButton}
              onChange={(v) => updateLayoutConfig('showWishlistButton', v)}
              accentColor="#ec4899"
              disabled={!wishlistModule?.enabled}
            />
            <ToggleRow
              label="Ghi chú SP"
              checked={currentLayoutConfig.showNote}
              onChange={(v) => updateLayoutConfig('showNote', v)}
              accentColor="#ec4899"
              disabled={!wishlistModule?.enabled}
            />
            <ToggleRow
              label="Thông báo"
              checked={currentLayoutConfig.showNotification}
              onChange={(v) => updateLayoutConfig('showNotification', v)}
              accentColor="#ec4899"
              disabled={!wishlistModule?.enabled}
            />
          </ControlCard>

          <ControlCard title="Module liên quan">
            <ExperienceModuleLink
              enabled={wishlistModule?.enabled ?? false}
              href="/system/modules/wishlist"
              icon={Heart}
              title="Sản phẩm yêu thích"
              colorScheme="pink"
            />
          </ControlCard>

          <Card className="p-2 lg:col-span-2">
            <ExperienceHintCard hints={HINTS} />
          </Card>
        </div>
      </ConfigPanel>
    </div>
  );
}
