'use client';

import React, { useMemo, useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { LayoutTemplate, Loader2, Save, ShoppingCart } from 'lucide-react';
import { Button, Card } from '@/app/admin/components/ui';
import { 
  ExperienceModuleLink, 
  ExperienceHintCard,
  CartPreview,
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

type CartLayoutStyle = 'drawer' | 'page';

type CartExperienceConfig = {
  layoutStyle: CartLayoutStyle;
  layouts: {
    drawer: LayoutConfig;
    page: LayoutConfig;
  };
};

type LayoutConfig = {
  showExpiry: boolean;
  showGuestCart: boolean;
  showNote: boolean;
};

const EXPERIENCE_KEY = 'cart_ui';

const LAYOUT_STYLES: LayoutOption<CartLayoutStyle>[] = [
  { description: 'Giỏ hàng dạng drawer/sidebar', id: 'drawer', label: 'Drawer' },
  { description: 'Giỏ hàng trang riêng', id: 'page', label: 'Page' },
];

const DEFAULT_LAYOUT_CONFIG: LayoutConfig = {
  showExpiry: false,
  showGuestCart: true,
  showNote: false,
};

const DEFAULT_CONFIG: CartExperienceConfig = {
  layoutStyle: 'drawer',
  layouts: {
    drawer: { ...DEFAULT_LAYOUT_CONFIG },
    page: { ...DEFAULT_LAYOUT_CONFIG },
  },
};

const HINTS = [
  'Drawer phù hợp cho quick checkout.',
  'Page layout cho cart phức tạp với nhiều options.',
  'Guest cart cần session management.',
  'Mỗi layout có config riêng - chuyển tab để chỉnh.',
];

export default function CartExperiencePage() {
  const experienceSetting = useQuery(api.settings.getByKey, { key: EXPERIENCE_KEY });
  const cartModule = useQuery(api.admin.modules.getModuleByKey, { key: 'cart' });
  const expiryFeature = useQuery(api.admin.modules.getModuleFeature, { featureKey: 'enableExpiry', moduleKey: 'cart' });
  const guestCartFeature = useQuery(api.admin.modules.getModuleFeature, { featureKey: 'enableGuestCart', moduleKey: 'cart' });
  const noteFeature = useQuery(api.admin.modules.getModuleFeature, { featureKey: 'enableNote', moduleKey: 'cart' });
  const [previewDevice, setPreviewDevice] = useState<DeviceType>('desktop');
  const [isPanelExpanded, setIsPanelExpanded] = useState(true);

  const serverConfig = useMemo<CartExperienceConfig>(() => {
    const raw = experienceSetting?.value as Partial<CartExperienceConfig> | undefined;
    const defaultLayoutWithModuleFeatures: LayoutConfig = {
      showExpiry: expiryFeature?.enabled ?? false,
      showGuestCart: guestCartFeature?.enabled ?? true,
      showNote: noteFeature?.enabled ?? false,
    };
    return {
      layoutStyle: raw?.layoutStyle ?? 'drawer',
      layouts: {
        drawer: { ...defaultLayoutWithModuleFeatures, ...raw?.layouts?.drawer },
        page: { ...defaultLayoutWithModuleFeatures, ...raw?.layouts?.page },
      },
    };
  }, [experienceSetting?.value, expiryFeature?.enabled, guestCartFeature?.enabled, noteFeature?.enabled]);

  const isLoading = experienceSetting === undefined || cartModule === undefined;

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
      {/* Header */}
      <header className="flex-shrink-0 px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-white dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-500/10 rounded-lg">
            <LayoutTemplate className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">Trải nghiệm: Giỏ hàng</h1>
            <p className="text-xs text-slate-500">/cart • Layout-specific config</p>
          </div>
        </div>
        <Button
          onClick={handleSave}
          disabled={!hasChanges || isSaving}
          className="bg-orange-600 hover:bg-orange-500 gap-2"
        >
          {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {hasChanges ? 'Lưu thay đổi' : 'Đã lưu'}
        </Button>
      </header>

      {/* Preview Area */}
      <main className="flex-1 overflow-auto p-6 bg-slate-50 dark:bg-slate-950">
        <div className="flex justify-center mb-4">
          <DeviceToggle value={previewDevice} onChange={setPreviewDevice} />
        </div>
        <div className={`mx-auto transition-all duration-300 ${deviceWidths[previewDevice]}`}>
          <BrowserFrame url="yoursite.com/cart" maxHeight="calc(100vh - 380px)">
            <CartPreview
              layoutStyle={config.layoutStyle}
              showGuestCart={currentLayoutConfig.showGuestCart}
              showExpiry={currentLayoutConfig.showExpiry}
              showNote={currentLayoutConfig.showNote}
            />
          </BrowserFrame>
        </div>
        <div className="mt-3 text-xs text-slate-500 text-center">
          Layout: <strong>{LAYOUT_STYLES.find(s => s.id === config.layoutStyle)?.label}</strong>
          {' • '}{previewDevice === 'desktop' ? '1920px' : (previewDevice === 'tablet' ? '768px' : '375px')}
        </div>
      </main>

      {/* Bottom Panel */}
      <ConfigPanel
        isExpanded={isPanelExpanded}
        onToggle={() => setIsPanelExpanded(!isPanelExpanded)}
        expandedHeight="280px"
        leftContent={
          <LayoutTabs
            layouts={LAYOUT_STYLES}
            activeLayout={config.layoutStyle}
            onChange={(layout) => setConfig(prev => ({ ...prev, layoutStyle: layout }))}
            accentColor="#f97316"
          />
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <ControlCard title="Khối hiển thị">
            <ToggleRow
              label="Guest Cart"
              description="Khách chưa đăng nhập"
              checked={currentLayoutConfig.showGuestCart}
              onChange={(v) => updateLayoutConfig('showGuestCart', v)}
              accentColor="#f97316"
              disabled={!cartModule?.enabled}
            />
            <ToggleRow
              label="Hết hạn giỏ"
              description="Thời gian hết hạn và tự xóa"
              checked={currentLayoutConfig.showExpiry}
              onChange={(v) => updateLayoutConfig('showExpiry', v)}
              accentColor="#f97316"
              disabled={!cartModule?.enabled}
            />
            <ToggleRow
              label="Ghi chú"
              description="Note cho đơn hàng"
              checked={currentLayoutConfig.showNote}
              onChange={(v) => updateLayoutConfig('showNote', v)}
              accentColor="#f97316"
              disabled={!cartModule?.enabled}
            />
          </ControlCard>

          <ControlCard title="Module liên quan">
            <ExperienceModuleLink
              enabled={cartModule?.enabled ?? false}
              href="/system/modules/cart"
              icon={ShoppingCart}
              title="Giỏ hàng"
              colorScheme="orange"
            />
          </ControlCard>

          <Card className="p-3 lg:col-span-2">
            <ExperienceHintCard hints={HINTS} />
          </Card>
        </div>
      </ConfigPanel>
    </div>
  );
}
