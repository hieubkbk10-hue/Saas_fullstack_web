'use client';

import React, { useMemo } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { LayoutTemplate, Package, ShoppingCart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/admin/components/ui';
import { ModuleHeader, SettingsCard, SettingSelect } from '@/components/modules/shared';
import { 
  ExperienceModuleLink, 
  ExperienceSummaryGrid, 
  ExperienceBlockToggle,
  ExperienceHintCard,
  ExperiencePreview,
  CheckoutPreview,
  type SummaryItem 
} from '@/components/experiences';
import { useExperienceConfig, useExperienceSave, EXPERIENCE_NAMES, MESSAGES } from '@/lib/experiences';

type CheckoutFlowStyle = 'single-page' | 'multi-step';
type OrderSummaryPosition = 'right' | 'bottom';

type CheckoutExperienceConfig = {
  flowStyle: CheckoutFlowStyle;
  orderSummaryPosition: OrderSummaryPosition;
  showPaymentMethods: boolean;
  showShippingOptions: boolean;
};

const EXPERIENCE_KEY = 'checkout_ui';

const FLOW_STYLES: { id: CheckoutFlowStyle; label: string; description: string }[] = [
  { description: 'Tất cả trong 1 trang', id: 'single-page', label: 'Single Page' },
  { description: 'Chia thành nhiều bước', id: 'multi-step', label: 'Multi-Step' },
];

const SUMMARY_POSITIONS: { id: OrderSummaryPosition; label: string; description: string }[] = [
  { description: 'Tóm tắt đơn bên phải', id: 'right', label: 'Right Sidebar' },
  { description: 'Tóm tắt đơn ở dưới', id: 'bottom', label: 'Bottom' },
];

const DEFAULT_CONFIG: CheckoutExperienceConfig = {
  flowStyle: 'multi-step',
  orderSummaryPosition: 'right',
  showPaymentMethods: true,
  showShippingOptions: true,
};

const HINTS = [
  'Multi-step dễ theo dõi, single-page nhanh hơn.',
  'Right sidebar phù hợp desktop, bottom cho mobile.',
  'Payment/shipping cần bật module Orders trước.',
];

export default function CheckoutExperiencePage() {
  const experienceSetting = useQuery(api.settings.getByKey, { key: EXPERIENCE_KEY });
  const ordersModule = useQuery(api.admin.modules.getModuleByKey, { key: 'orders' });
  const cartModule = useQuery(api.admin.modules.getModuleByKey, { key: 'cart' });

  const serverConfig = useMemo<CheckoutExperienceConfig>(() => {
    const raw = experienceSetting?.value as Partial<CheckoutExperienceConfig> | undefined;
    return {
      flowStyle: raw?.flowStyle ?? 'multi-step',
      orderSummaryPosition: raw?.orderSummaryPosition ?? 'right',
      showPaymentMethods: raw?.showPaymentMethods ?? true,
      showShippingOptions: raw?.showShippingOptions ?? true,
    };
  }, [experienceSetting?.value]);

  const isLoading = experienceSetting === undefined || ordersModule === undefined || cartModule === undefined;

  const { config, setConfig, hasChanges } = useExperienceConfig(serverConfig, DEFAULT_CONFIG, isLoading);
  const { handleSave, isSaving } = useExperienceSave(EXPERIENCE_KEY, config, MESSAGES.saveSuccess(EXPERIENCE_NAMES[EXPERIENCE_KEY]));

  const summaryItems: SummaryItem[] = [
    { label: 'Flow Style', value: config.flowStyle === 'single-page' ? 'Single Page' : 'Multi-Step' },
    { label: 'Summary Position', value: config.orderSummaryPosition === 'right' ? 'Right' : 'Bottom' },
    { label: 'Payment Methods', value: config.showPaymentMethods },
    { label: 'Shipping Options', value: config.showShippingOptions },
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
        title="Trải nghiệm: Thanh toán & Đặt hàng"
        description="Cấu hình checkout flow, payment, shipping và order summary."
        iconBgClass="bg-green-500/10"
        iconTextClass="text-green-600 dark:text-green-400"
        buttonClass="bg-green-600 hover:bg-green-500"
        onSave={handleSave}
        hasChanges={hasChanges}
        isSaving={isSaving}
      />

      {/* Full-width Preview */}
      <ExperiencePreview title="Checkout Flow">
        <CheckoutPreview
          flowStyle={config.flowStyle}
          orderSummaryPosition={config.orderSummaryPosition}
          showPaymentMethods={config.showPaymentMethods}
          showShippingOptions={config.showShippingOptions}
        />
      </ExperiencePreview>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="space-y-4 lg:col-span-2">
          <SettingsCard>
            <SettingSelect
              label="Checkout flow style"
              value={config.flowStyle}
              onChange={(value) => setConfig(prev => ({ ...prev, flowStyle: value as CheckoutFlowStyle }))}
              options={FLOW_STYLES.map(style => ({ label: `${style.label} - ${style.description}`, value: style.id }))}
              focusColor="focus:border-green-500"
            />
          </SettingsCard>

          <SettingsCard>
            <SettingSelect
              label="Vị trí Order Summary"
              value={config.orderSummaryPosition}
              onChange={(value) => setConfig(prev => ({ ...prev, orderSummaryPosition: value as OrderSummaryPosition }))}
              options={SUMMARY_POSITIONS.map(pos => ({ label: `${pos.label} - ${pos.description}`, value: pos.id }))}
              focusColor="focus:border-green-500"
            />
          </SettingsCard>

          <Card className="p-4">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">Khối hiển thị</h3>
            <div className="space-y-3">
              <ExperienceBlockToggle
                label="Phương thức thanh toán"
                description="Hiển thị options payment methods"
                enabled={config.showPaymentMethods}
                onChange={() => setConfig(prev => ({ ...prev, showPaymentMethods: !prev.showPaymentMethods }))}
                color="bg-green-500"
                disabled={!ordersModule?.enabled}
              />

              <ExperienceBlockToggle
                label="Tùy chọn vận chuyển"
                description="Hiển thị shipping options"
                enabled={config.showShippingOptions}
                onChange={() => setConfig(prev => ({ ...prev, showShippingOptions: !prev.showShippingOptions }))}
                color="bg-green-500"
                disabled={!ordersModule?.enabled}
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
            </CardContent>
          </Card>

          <ExperienceHintCard hints={HINTS} />
        </div>
      </div>
    </div>
  );
}
