'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { toast } from 'sonner';
import { Heart, LayoutTemplate } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, cn } from '@/app/admin/components/ui';
import { ModuleHeader, SettingsCard, SettingSelect, ToggleSwitch } from '@/components/modules/shared';

type WishlistLayoutStyle = 'grid' | 'list';

type WishlistExperienceConfig = {
  layoutStyle: WishlistLayoutStyle;
  showWishlistButton: boolean;
  showNote: boolean;
  showNotification: boolean;
};

const EXPERIENCE_GROUP = 'experience';
const EXPERIENCE_KEY = 'wishlist_ui';

const LAYOUT_STYLES: { id: WishlistLayoutStyle; label: string; description: string }[] = [
  { description: 'Hiển thị dạng lưới cards', id: 'grid', label: 'Grid' },
  { description: 'Hiển thị dạng danh sách chi tiết', id: 'list', label: 'List' },
];

const DEFAULT_CONFIG: WishlistExperienceConfig = {
  layoutStyle: 'grid',
  showNote: true,
  showNotification: true,
  showWishlistButton: true,
};

export default function WishlistExperiencePage() {
  const experienceSetting = useQuery(api.settings.getByKey, { key: EXPERIENCE_KEY });
  const wishlistModule = useQuery(api.admin.modules.getModuleByKey, { key: 'wishlist' });
  const noteFeature = useQuery(api.admin.modules.getModuleFeature, { featureKey: 'enableNote', moduleKey: 'wishlist' });
  const notificationFeature = useQuery(api.admin.modules.getModuleFeature, { featureKey: 'enableNotification', moduleKey: 'wishlist' });

  const setMultipleSettings = useMutation(api.settings.setMultiple);

  const serverConfig = useMemo<WishlistExperienceConfig>(() => {
    const raw = experienceSetting?.value as Partial<WishlistExperienceConfig> | undefined;
    return {
      layoutStyle: raw?.layoutStyle ?? 'grid',
      showNote: raw?.showNote ?? (noteFeature?.enabled ?? true),
      showNotification: raw?.showNotification ?? (notificationFeature?.enabled ?? true),
      showWishlistButton: raw?.showWishlistButton ?? true,
    };
  }, [experienceSetting?.value, noteFeature?.enabled, notificationFeature?.enabled]);

  const [config, setConfig] = useState<WishlistExperienceConfig>(DEFAULT_CONFIG);
  const [isSaving, setIsSaving] = useState(false);

  const isLoading = experienceSetting === undefined || wishlistModule === undefined;

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
      toast.success('Đã lưu cấu hình trải nghiệm Wishlist');
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
        title="Trải nghiệm: Sản phẩm yêu thích"
        description="Cấu hình layout, nút wishlist, note và notification."
        iconBgClass="bg-pink-500/10"
        iconTextClass="text-pink-600 dark:text-pink-400"
        buttonClass="bg-pink-600 hover:bg-pink-500"
        onSave={handleSave}
        hasChanges={hasChanges}
        isSaving={isSaving}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="space-y-4 lg:col-span-2">
          <SettingsCard>
            <SettingSelect
              label="Layout trang Wishlist"
              value={config.layoutStyle}
              onChange={(value) => setConfig(prev => ({ ...prev, layoutStyle: value as WishlistLayoutStyle }))}
              options={LAYOUT_STYLES.map(style => ({ label: `${style.label} - ${style.description}`, value: style.id }))}
              focusColor="focus:border-pink-500"
            />
          </SettingsCard>

          <Card className="p-4">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">Khối hiển thị</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Nút Wishlist trên product cards</p>
                  <p className="text-xs text-slate-500">Hiển thị icon Heart trên listing/detail</p>
                </div>
                <ToggleSwitch
                  enabled={config.showWishlistButton}
                  onChange={() => setConfig(prev => ({ ...prev, showWishlistButton: !prev.showWishlistButton }))}
                  color="bg-pink-500"
                  disabled={!wishlistModule?.enabled}
                />
              </div>

              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Ghi chú sản phẩm</p>
                  <p className="text-xs text-slate-500">Cho phép user thêm note cho SP yêu thích</p>
                </div>
                <ToggleSwitch
                  enabled={config.showNote}
                  onChange={() => setConfig(prev => ({ ...prev, showNote: !prev.showNote }))}
                  color="bg-pink-500"
                  disabled={!wishlistModule?.enabled}
                />
              </div>

              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Thông báo giá/hàng</p>
                  <p className="text-xs text-slate-500">Thông báo khi SP giảm giá hoặc có hàng</p>
                </div>
                <ToggleSwitch
                  enabled={config.showNotification}
                  onChange={() => setConfig(prev => ({ ...prev, showNotification: !prev.showNotification }))}
                  color="bg-pink-500"
                  disabled={!wishlistModule?.enabled}
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
                <p className="text-slate-500">Nút Wishlist</p>
                <p className="font-semibold text-slate-900 dark:text-slate-100">{config.showWishlistButton ? 'Bật' : 'Tắt'}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 rounded-md p-3">
                <p className="text-slate-500">Ghi chú</p>
                <p className="font-semibold text-slate-900 dark:text-slate-100">{config.showNote ? 'Bật' : 'Tắt'}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 rounded-md p-3">
                <p className="text-slate-500">Thông báo</p>
                <p className="font-semibold text-slate-900 dark:text-slate-100">{config.showNotification ? 'Bật' : 'Tắt'}</p>
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
                enabled={wishlistModule?.enabled ?? false}
                href="/system/modules/wishlist"
                icon={Heart}
                title="Sản phẩm yêu thích"
              />
            </CardContent>
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Gợi ý quan sát</h3>
            <ul className="text-xs text-slate-500 space-y-1">
              <li>• Bật module Wishlist trước khi cấu hình UX.</li>
              <li>• Nút wishlist sẽ xuất hiện trên product cards và detail.</li>
              <li>• Note và notification tùy chọn theo nhu cầu.</li>
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
          ? 'border-slate-200 dark:border-slate-700 hover:border-pink-500/60 dark:hover:border-pink-500/60'
          : 'border-slate-100 dark:border-slate-800 opacity-50'
      )}
    >
      <div className={cn(
        'w-8 h-8 rounded-lg flex items-center justify-center',
        enabled ? 'bg-pink-500/10 text-pink-600 dark:text-pink-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
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
