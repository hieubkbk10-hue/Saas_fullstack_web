'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { toast } from 'sonner';
import { LayoutTemplate, ShoppingCart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, cn } from '@/app/admin/components/ui';
import { ModuleHeader, SettingsCard, SettingSelect, ToggleSwitch } from '@/components/modules/shared';

type CartLayoutStyle = 'drawer' | 'page';

type CartExperienceConfig = {
  layoutStyle: CartLayoutStyle;
  showExpiry: boolean;
  showGuestCart: boolean;
  showNote: boolean;
};

const EXPERIENCE_GROUP = 'experience';
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

export default function CartExperiencePage() {
  const experienceSetting = useQuery(api.settings.getByKey, { key: EXPERIENCE_KEY });
  const cartModule = useQuery(api.admin.modules.getModuleByKey, { key: 'cart' });
  const expiryFeature = useQuery(api.admin.modules.getModuleFeature, { featureKey: 'enableExpiry', moduleKey: 'cart' });
  const guestCartFeature = useQuery(api.admin.modules.getModuleFeature, { featureKey: 'enableGuestCart', moduleKey: 'cart' });
  const noteFeature = useQuery(api.admin.modules.getModuleFeature, { featureKey: 'enableNote', moduleKey: 'cart' });

  const setMultipleSettings = useMutation(api.settings.setMultiple);

  const serverConfig = useMemo<CartExperienceConfig>(() => {
    const raw = experienceSetting?.value as Partial<CartExperienceConfig> | undefined;
    return {
      layoutStyle: raw?.layoutStyle ?? 'drawer',
      showExpiry: raw?.showExpiry ?? (expiryFeature?.enabled ?? false),
      showGuestCart: raw?.showGuestCart ?? (guestCartFeature?.enabled ?? true),
      showNote: raw?.showNote ?? (noteFeature?.enabled ?? false),
    };
  }, [experienceSetting?.value, expiryFeature?.enabled, guestCartFeature?.enabled, noteFeature?.enabled]);

  const [config, setConfig] = useState<CartExperienceConfig>(DEFAULT_CONFIG);
  const [isSaving, setIsSaving] = useState(false);

  const isLoading = experienceSetting === undefined || cartModule === undefined;

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
      toast.success('Đã lưu cấu hình trải nghiệm Giỏ hàng');
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
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Giỏ hàng khách (Guest Cart)</p>
                  <p className="text-xs text-slate-500">Cho phép khách chưa đăng nhập sử dụng giỏ</p>
                </div>
                <ToggleSwitch
                  enabled={config.showGuestCart}
                  onChange={() => setConfig(prev => ({ ...prev, showGuestCart: !prev.showGuestCart }))}
                  color="bg-orange-500"
                  disabled={!cartModule?.enabled}
                />
              </div>

              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Hết hạn giỏ hàng</p>
                  <p className="text-xs text-slate-500">Hiển thị thời gian hết hạn và tự xóa</p>
                </div>
                <ToggleSwitch
                  enabled={config.showExpiry}
                  onChange={() => setConfig(prev => ({ ...prev, showExpiry: !prev.showExpiry }))}
                  color="bg-orange-500"
                  disabled={!cartModule?.enabled}
                />
              </div>

              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Ghi chú đơn hàng</p>
                  <p className="text-xs text-slate-500">Cho phép user thêm note cho đơn</p>
                </div>
                <ToggleSwitch
                  enabled={config.showNote}
                  onChange={() => setConfig(prev => ({ ...prev, showNote: !prev.showNote }))}
                  color="bg-orange-500"
                  disabled={!cartModule?.enabled}
                />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">Tóm tắt áp dụng</h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 dark:bg-slate-800 rounded-md p-3">
                <p className="text-slate-500">Layout</p>
                <p className="font-semibold text-slate-900 dark:text-slate-100 capitalize">{config.layoutStyle}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 rounded-md p-3">
                <p className="text-slate-500">Guest Cart</p>
                <p className="font-semibold text-slate-900 dark:text-slate-100">{config.showGuestCart ? 'Bật' : 'Tắt'}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 rounded-md p-3">
                <p className="text-slate-500">Hết hạn</p>
                <p className="font-semibold text-slate-900 dark:text-slate-100">{config.showExpiry ? 'Bật' : 'Tắt'}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 rounded-md p-3">
                <p className="text-slate-500">Ghi chú</p>
                <p className="font-semibold text-slate-900 dark:text-slate-100">{config.showNote ? 'Bật' : 'Tắt'}</p>
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
              <li>• Drawer phù hợp cho quick checkout.</li>
              <li>• Page layout cho cart phức tạp với nhiều options.</li>
              <li>• Guest cart cần session management.</li>
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
          ? 'border-slate-200 dark:border-slate-700 hover:border-orange-500/60 dark:hover:border-orange-500/60'
          : 'border-slate-100 dark:border-slate-800 opacity-50'
      )}
    >
      <div className={cn(
        'w-8 h-8 rounded-lg flex items-center justify-center',
        enabled ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
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
