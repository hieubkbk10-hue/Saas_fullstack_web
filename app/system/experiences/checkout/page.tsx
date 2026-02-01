'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { toast } from 'sonner';
import { LayoutTemplate, Package, ShoppingCart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, cn } from '@/app/admin/components/ui';
import { ModuleHeader, SettingsCard, SettingSelect, ToggleSwitch } from '@/components/modules/shared';

type CheckoutFlowStyle = 'single-page' | 'multi-step';
type OrderSummaryPosition = 'right' | 'bottom';

type CheckoutExperienceConfig = {
  flowStyle: CheckoutFlowStyle;
  orderSummaryPosition: OrderSummaryPosition;
  showPaymentMethods: boolean;
  showShippingOptions: boolean;
};

const EXPERIENCE_GROUP = 'experience';
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

export default function CheckoutExperiencePage() {
  const experienceSetting = useQuery(api.settings.getByKey, { key: EXPERIENCE_KEY });
  const ordersModule = useQuery(api.admin.modules.getModuleByKey, { key: 'orders' });
  const cartModule = useQuery(api.admin.modules.getModuleByKey, { key: 'cart' });

  const setMultipleSettings = useMutation(api.settings.setMultiple);

  const serverConfig = useMemo<CheckoutExperienceConfig>(() => {
    const raw = experienceSetting?.value as Partial<CheckoutExperienceConfig> | undefined;
    return {
      flowStyle: raw?.flowStyle ?? 'multi-step',
      orderSummaryPosition: raw?.orderSummaryPosition ?? 'right',
      showPaymentMethods: raw?.showPaymentMethods ?? true,
      showShippingOptions: raw?.showShippingOptions ?? true,
    };
  }, [experienceSetting?.value]);

  const [config, setConfig] = useState<CheckoutExperienceConfig>(DEFAULT_CONFIG);
  const [isSaving, setIsSaving] = useState(false);

  const isLoading = experienceSetting === undefined || ordersModule === undefined || cartModule === undefined;

  useEffect(() => {
    if (!isLoading) {
      setConfig(serverConfig);
    }
  }, [isLoading, serverConfig]);

  const hasChanges = useMemo(() => JSON.stringify(config) !== JSON.stringify(serverConfig), [config, serverConfig]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const settingsToSave: Array<{ group: string; key: string; value: unknown }> = [
        { group: EXPERIENCE_GROUP, key: EXPERIENCE_KEY, value: config }
      ];
      await setMultipleSettings({ settings: settingsToSave });
      toast.success('Đã lưu cấu hình trải nghiệm Checkout');
    } catch {
      toast.error('Có lỗi khi lưu cấu hình');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500">Đang tải...</div>
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
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Phương thức thanh toán</p>
                  <p className="text-xs text-slate-500">Hiển thị options payment methods</p>
                </div>
                <ToggleSwitch
                  enabled={config.showPaymentMethods}
                  onChange={() => setConfig(prev => ({ ...prev, showPaymentMethods: !prev.showPaymentMethods }))}
                  color="bg-green-500"
                  disabled={!ordersModule?.enabled}
                />
              </div>

              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Tùy chọn vận chuyển</p>
                  <p className="text-xs text-slate-500">Hiển thị shipping options</p>
                </div>
                <ToggleSwitch
                  enabled={config.showShippingOptions}
                  onChange={() => setConfig(prev => ({ ...prev, showShippingOptions: !prev.showShippingOptions }))}
                  color="bg-green-500"
                  disabled={!ordersModule?.enabled}
                />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">Tóm tắt áp dụng</h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 dark:bg-slate-800 rounded-md p-3">
                <p className="text-slate-500">Flow Style</p>
                <p className="font-semibold text-slate-900 dark:text-slate-100">{config.flowStyle === 'single-page' ? 'Single Page' : 'Multi-Step'}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 rounded-md p-3">
                <p className="text-slate-500">Summary Position</p>
                <p className="font-semibold text-slate-900 dark:text-slate-100">{config.orderSummaryPosition === 'right' ? 'Right' : 'Bottom'}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 rounded-md p-3">
                <p className="text-slate-500">Payment Methods</p>
                <p className="font-semibold text-slate-900 dark:text-slate-100">{config.showPaymentMethods ? 'Bật' : 'Tắt'}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 rounded-md p-3">
                <p className="text-slate-500">Shipping Options</p>
                <p className="font-semibold text-slate-900 dark:text-slate-100">{config.showShippingOptions ? 'Bật' : 'Tắt'}</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Module liên quan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <ModuleLink
                enabled={ordersModule?.enabled ?? false}
                href="/system/modules/orders"
                icon={Package}
                title="Đơn hàng"
              />
              <ModuleLink
                enabled={cartModule?.enabled ?? false}
                href="/system/modules/cart"
                icon={ShoppingCart}
                title="Giỏ hàng"
              />
            </CardContent>
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Gợi ý quan sát</h3>
            <ul className="text-xs text-slate-500 space-y-1">
              <li>• Multi-step dễ theo dõi, single-page nhanh hơn.</li>
              <li>• Right sidebar phù hợp desktop, bottom cho mobile.</li>
              <li>• Payment/shipping cần bật module Orders trước.</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}

function ModuleLink({ enabled, href, icon: Icon, title }: { enabled: boolean; href: string; icon: React.ElementType; title: string }) {
  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg border transition-colors',
        enabled
          ? 'border-slate-200 dark:border-slate-700 hover:border-green-500/60 dark:hover:border-green-500/60'
          : 'border-slate-100 dark:border-slate-800 opacity-50'
      )}
    >
      <div className={cn(
        'w-8 h-8 rounded-lg flex items-center justify-center',
        enabled ? 'bg-green-500/10 text-green-600 dark:text-green-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
      )}>
        <Icon size={16} />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{title}</p>
        <p className="text-xs text-slate-500">{enabled ? 'Đã bật' : 'Chưa bật'}</p>
      </div>
    </Link>
  );
}
