'use client';

import React, { useMemo } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { LayoutTemplate, ShoppingCart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/admin/components/ui';
import { ModuleHeader, SettingsCard, SettingSelect } from '@/components/modules/shared';
import { 
  ExperienceModuleLink, 
  ExperienceSummaryGrid, 
  ExperienceBlockToggle,
  ExperienceHintCard,
  type SummaryItem 
} from '@/components/experiences';
import { useExperienceConfig, useExperienceSave, EXPERIENCE_NAMES, MESSAGES } from '@/lib/experiences';

type CartLayoutStyle = 'drawer' | 'page';

type CartExperienceConfig = {
  layoutStyle: CartLayoutStyle;
  showExpiry: boolean;
  showGuestCart: boolean;
  showNote: boolean;
};

const EXPERIENCE_KEY = 'cart_ui';

const LAYOUT_STYLES: { id: CartLayoutStyle; label: string; description: string }[] = [
  { description: 'Giỏ hàng dạng drawer/sidebar', id: 'drawer', label: 'Drawer' },
  { description: 'Giỏ hàng trang riêng', id: 'page', label: 'Page' },
];

const DEFAULT_CONFIG: CartExperienceConfig = {
  layoutStyle: 'drawer',
  showExpiry: false,
  showGuestCart: true,
  showNote: false,
};

const HINTS = [
  'Drawer phù hợp cho quick checkout.',
  'Page layout cho cart phức tạp với nhiều options.',
  'Guest cart cần session management.',
];

export default function CartExperiencePage() {
  const experienceSetting = useQuery(api.settings.getByKey, { key: EXPERIENCE_KEY });
  const cartModule = useQuery(api.admin.modules.getModuleByKey, { key: 'cart' });
  const expiryFeature = useQuery(api.admin.modules.getModuleFeature, { featureKey: 'enableExpiry', moduleKey: 'cart' });
  const guestCartFeature = useQuery(api.admin.modules.getModuleFeature, { featureKey: 'enableGuestCart', moduleKey: 'cart' });
  const noteFeature = useQuery(api.admin.modules.getModuleFeature, { featureKey: 'enableNote', moduleKey: 'cart' });

  const serverConfig = useMemo<CartExperienceConfig>(() => {
    const raw = experienceSetting?.value as Partial<CartExperienceConfig> | undefined;
    return {
      layoutStyle: raw?.layoutStyle ?? 'drawer',
      showExpiry: raw?.showExpiry ?? (expiryFeature?.enabled ?? false),
      showGuestCart: raw?.showGuestCart ?? (guestCartFeature?.enabled ?? true),
      showNote: raw?.showNote ?? (noteFeature?.enabled ?? false),
    };
  }, [experienceSetting?.value, expiryFeature?.enabled, guestCartFeature?.enabled, noteFeature?.enabled]);

  const isLoading = experienceSetting === undefined || cartModule === undefined;

  const { config, setConfig, hasChanges } = useExperienceConfig(serverConfig, DEFAULT_CONFIG, isLoading);
  const { handleSave, isSaving } = useExperienceSave(EXPERIENCE_KEY, config, MESSAGES.saveSuccess(EXPERIENCE_NAMES[EXPERIENCE_KEY]));

  const summaryItems: SummaryItem[] = [
    { label: 'Layout', value: config.layoutStyle, format: 'capitalize' },
    { label: 'Guest Cart', value: config.showGuestCart },
    { label: 'Hết hạn', value: config.showExpiry },
    { label: 'Ghi chú', value: config.showNote },
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
        title="Trải nghiệm: Giỏ hàng"
        description="Cấu hình layout, guest cart, expiry và note."
        iconBgClass="bg-orange-500/10"
        iconTextClass="text-orange-600 dark:text-orange-400"
        buttonClass="bg-orange-600 hover:bg-orange-500"
        onSave={handleSave}
        hasChanges={hasChanges}
        isSaving={isSaving}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="space-y-4 lg:col-span-2">
          <SettingsCard>
            <SettingSelect
              label="Layout giỏ hàng"
              value={config.layoutStyle}
              onChange={(value) => setConfig(prev => ({ ...prev, layoutStyle: value as CartLayoutStyle }))}
              options={LAYOUT_STYLES.map(style => ({ label: `${style.label} - ${style.description}`, value: style.id }))}
              focusColor="focus:border-orange-500"
            />
          </SettingsCard>

          <Card className="p-4">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">Khối hiển thị</h3>
            <div className="space-y-3">
              <ExperienceBlockToggle
                label="Giỏ hàng khách (Guest Cart)"
                description="Cho phép khách chưa đăng nhập sử dụng giỏ"
                enabled={config.showGuestCart}
                onChange={() => setConfig(prev => ({ ...prev, showGuestCart: !prev.showGuestCart }))}
                color="bg-orange-500"
                disabled={!cartModule?.enabled}
              />

              <ExperienceBlockToggle
                label="Hết hạn giỏ hàng"
                description="Hiển thị thời gian hết hạn và tự xóa"
                enabled={config.showExpiry}
                onChange={() => setConfig(prev => ({ ...prev, showExpiry: !prev.showExpiry }))}
                color="bg-orange-500"
                disabled={!cartModule?.enabled}
              />

              <ExperienceBlockToggle
                label="Ghi chú đơn hàng"
                description="Cho phép user thêm note cho đơn"
                enabled={config.showNote}
                onChange={() => setConfig(prev => ({ ...prev, showNote: !prev.showNote }))}
                color="bg-orange-500"
                disabled={!cartModule?.enabled}
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
                enabled={cartModule?.enabled ?? false}
                href="/system/modules/cart"
                icon={ShoppingCart}
                title="Giỏ hàng"
                colorScheme="orange"
              />
            </CardContent>
          </Card>

          <ExperienceHintCard hints={HINTS} />
        </div>
      </div>
    </div>
  );
}
