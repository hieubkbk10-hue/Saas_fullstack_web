'use client';

import React, { useMemo } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Heart, LayoutTemplate } from 'lucide-react';
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

type WishlistLayoutStyle = 'grid' | 'list';

type WishlistExperienceConfig = {
  layoutStyle: WishlistLayoutStyle;
  showWishlistButton: boolean;
  showNote: boolean;
  showNotification: boolean;
};

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

const HINTS = [
  'Bật module Wishlist trước khi cấu hình UX.',
  'Nút wishlist sẽ xuất hiện trên product cards và detail.',
  'Note và notification tùy chọn theo nhu cầu.',
];

export default function WishlistExperiencePage() {
  const experienceSetting = useQuery(api.settings.getByKey, { key: EXPERIENCE_KEY });
  const wishlistModule = useQuery(api.admin.modules.getModuleByKey, { key: 'wishlist' });
  const noteFeature = useQuery(api.admin.modules.getModuleFeature, { featureKey: 'enableNote', moduleKey: 'wishlist' });
  const notificationFeature = useQuery(api.admin.modules.getModuleFeature, { featureKey: 'enableNotification', moduleKey: 'wishlist' });

  const serverConfig = useMemo<WishlistExperienceConfig>(() => {
    const raw = experienceSetting?.value as Partial<WishlistExperienceConfig> | undefined;
    return {
      layoutStyle: raw?.layoutStyle ?? 'grid',
      showNote: raw?.showNote ?? (noteFeature?.enabled ?? true),
      showNotification: raw?.showNotification ?? (notificationFeature?.enabled ?? true),
      showWishlistButton: raw?.showWishlistButton ?? true,
    };
  }, [experienceSetting?.value, noteFeature?.enabled, notificationFeature?.enabled]);

  const isLoading = experienceSetting === undefined || wishlistModule === undefined;

  const { config, setConfig, hasChanges } = useExperienceConfig(serverConfig, DEFAULT_CONFIG, isLoading);
  const { handleSave, isSaving } = useExperienceSave(EXPERIENCE_KEY, config, MESSAGES.saveSuccess(EXPERIENCE_NAMES[EXPERIENCE_KEY]));

  const summaryItems: SummaryItem[] = [
    { label: 'Layout', value: config.layoutStyle, format: 'capitalize' },
    { label: 'Nút Wishlist', value: config.showWishlistButton },
    { label: 'Ghi chú', value: config.showNote },
    { label: 'Thông báo', value: config.showNotification },
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
              <ExperienceBlockToggle
                label="Nút Wishlist trên product cards"
                description="Hiển thị icon Heart trên listing/detail"
                enabled={config.showWishlistButton}
                onChange={() => setConfig(prev => ({ ...prev, showWishlistButton: !prev.showWishlistButton }))}
                color="bg-pink-500"
                disabled={!wishlistModule?.enabled}
              />

              <ExperienceBlockToggle
                label="Ghi chú sản phẩm"
                description="Cho phép user thêm note cho SP yêu thích"
                enabled={config.showNote}
                onChange={() => setConfig(prev => ({ ...prev, showNote: !prev.showNote }))}
                color="bg-pink-500"
                disabled={!wishlistModule?.enabled}
              />

              <ExperienceBlockToggle
                label="Thông báo giá/hàng"
                description="Thông báo khi SP giảm giá hoặc có hàng"
                enabled={config.showNotification}
                onChange={() => setConfig(prev => ({ ...prev, showNotification: !prev.showNotification }))}
                color="bg-pink-500"
                disabled={!wishlistModule?.enabled}
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
                enabled={wishlistModule?.enabled ?? false}
                href="/system/modules/wishlist"
                icon={Heart}
                title="Sản phẩm yêu thích"
                colorScheme="pink"
              />
            </CardContent>
          </Card>

          <ExperienceHintCard hints={HINTS} />
        </div>
      </div>
    </div>
  );
}
