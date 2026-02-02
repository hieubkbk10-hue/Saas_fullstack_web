'use client';

import React, { useMemo, useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { LayoutTemplate, Loader2, Package, Save, ShoppingCart } from 'lucide-react';
import { Button, Card } from '@/app/admin/components/ui';
import { 
  ExperienceModuleLink, 
  ExperienceHintCard,
  CheckoutPreview,
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

type CheckoutFlowStyle = 'single-page' | 'multi-step';
type OrderSummaryPosition = 'right' | 'bottom';

type CheckoutExperienceConfig = {
  flowStyle: CheckoutFlowStyle;
  layouts: {
    'single-page': LayoutConfig;
    'multi-step': LayoutConfig;
  };
};

type LayoutConfig = {
  orderSummaryPosition: OrderSummaryPosition;
  showPaymentMethods: boolean;
  showShippingOptions: boolean;
};

const EXPERIENCE_KEY = 'checkout_ui';

const FLOW_STYLES: LayoutOption<CheckoutFlowStyle>[] = [
  { description: 'Tất cả trong 1 trang', id: 'single-page', label: 'Single Page' },
  { description: 'Chia thành nhiều bước', id: 'multi-step', label: 'Multi-Step' },
];

const SUMMARY_POSITIONS: { id: OrderSummaryPosition; label: string }[] = [
  { id: 'right', label: 'Right Sidebar' },
  { id: 'bottom', label: 'Bottom' },
];

const DEFAULT_LAYOUT_CONFIG: LayoutConfig = {
  orderSummaryPosition: 'right',
  showPaymentMethods: true,
  showShippingOptions: true,
};

const DEFAULT_CONFIG: CheckoutExperienceConfig = {
  flowStyle: 'multi-step',
  layouts: {
    'single-page': { ...DEFAULT_LAYOUT_CONFIG },
    'multi-step': { ...DEFAULT_LAYOUT_CONFIG },
  },
};

const HINTS = [
  'Multi-step dễ theo dõi, single-page nhanh hơn.',
  'Right sidebar phù hợp desktop, bottom cho mobile.',
  'Payment/shipping cần bật module Orders trước.',
  'Mỗi flow có config riêng - chuyển tab để chỉnh.',
];

export default function CheckoutExperiencePage() {
  const experienceSetting = useQuery(api.settings.getByKey, { key: EXPERIENCE_KEY });
  const ordersModule = useQuery(api.admin.modules.getModuleByKey, { key: 'orders' });
  const cartModule = useQuery(api.admin.modules.getModuleByKey, { key: 'cart' });
  const [previewDevice, setPreviewDevice] = useState<DeviceType>('desktop');
  const [isPanelExpanded, setIsPanelExpanded] = useState(true);

  const serverConfig = useMemo<CheckoutExperienceConfig>(() => {
    const raw = experienceSetting?.value as Partial<CheckoutExperienceConfig> | undefined;
    return {
      flowStyle: raw?.flowStyle ?? 'multi-step',
      layouts: {
        'single-page': { ...DEFAULT_LAYOUT_CONFIG, ...raw?.layouts?.['single-page'] },
        'multi-step': { ...DEFAULT_LAYOUT_CONFIG, ...raw?.layouts?.['multi-step'] },
      },
    };
  }, [experienceSetting?.value]);

  const isLoading = experienceSetting === undefined || ordersModule === undefined || cartModule === undefined;

  const { config, setConfig, hasChanges } = useExperienceConfig(serverConfig, DEFAULT_CONFIG, isLoading);
  const { handleSave, isSaving } = useExperienceSave(
    EXPERIENCE_KEY,
    config,
    MESSAGES.saveSuccess(EXPERIENCE_NAMES[EXPERIENCE_KEY])
  );

  const currentLayoutConfig = config.layouts[config.flowStyle];

  const updateLayoutConfig = <K extends keyof LayoutConfig>(
    key: K,
    value: LayoutConfig[K]
  ) => {
    setConfig(prev => ({
      ...prev,
      layouts: {
        ...prev.layouts,
        [prev.flowStyle]: {
          ...prev.layouts[prev.flowStyle],
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
          <LayoutTemplate className="w-4 h-4 text-green-600 dark:text-green-400" />
          <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">Thanh toán</span>
        </div>
        <div className="flex items-center gap-3">
          <DeviceToggle value={previewDevice} onChange={setPreviewDevice} size="sm" />
          <Button
            size="sm"
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            className="bg-green-600 hover:bg-green-500 gap-1.5"
          >
            {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            <span>{hasChanges ? 'Lưu' : 'Đã lưu'}</span>
          </Button>
        </div>
      </header>

      {/* Preview Area */}
      <main className="flex-1 overflow-auto p-4 bg-slate-50 dark:bg-slate-950">
        <div className={`mx-auto transition-all duration-300 ${deviceWidths[previewDevice]}`}>
          <BrowserFrame url="yoursite.com/checkout" maxHeight="calc(100vh - 320px)">
            <CheckoutPreview
              flowStyle={config.flowStyle}
              orderSummaryPosition={currentLayoutConfig.orderSummaryPosition}
              showPaymentMethods={currentLayoutConfig.showPaymentMethods}
              showShippingOptions={currentLayoutConfig.showShippingOptions}
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
            layouts={FLOW_STYLES}
            activeLayout={config.flowStyle}
            onChange={(layout) => setConfig(prev => ({ ...prev, flowStyle: layout }))}
            accentColor="#22c55e"
          />
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <ControlCard title="Khối hiển thị">
            <ToggleRow
              label="Payment Methods"
              checked={currentLayoutConfig.showPaymentMethods}
              onChange={(v) => updateLayoutConfig('showPaymentMethods', v)}
              accentColor="#22c55e"
              disabled={!ordersModule?.enabled}
            />
            <ToggleRow
              label="Shipping Options"
              checked={currentLayoutConfig.showShippingOptions}
              onChange={(v) => updateLayoutConfig('showShippingOptions', v)}
              accentColor="#22c55e"
              disabled={!ordersModule?.enabled}
            />
          </ControlCard>

          <ControlCard title={`Cấu hình ${config.flowStyle}`}>
            <SelectRow
              label="Vị trí Order Summary"
              value={currentLayoutConfig.orderSummaryPosition}
              onChange={(v) => updateLayoutConfig('orderSummaryPosition', v as OrderSummaryPosition)}
              options={SUMMARY_POSITIONS.map(p => ({ label: p.label, value: p.id }))}
            />
          </ControlCard>

          <ControlCard title="Module liên quan">
            <ExperienceModuleLink
              enabled={ordersModule?.enabled ?? false}
              href="/system/modules/orders"
              icon={Package}
              title="Đơn hàng"
              colorScheme="green"
            />
            <ExperienceModuleLink
              enabled={cartModule?.enabled ?? false}
              href="/system/modules/cart"
              icon={ShoppingCart}
              title="Giỏ hàng"
              colorScheme="green"
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
