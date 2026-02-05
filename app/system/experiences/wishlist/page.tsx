'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Eye, Heart, LayoutTemplate, Loader2, Package, Save, ShoppingCart } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/app/admin/components/ui';
import { 
  ExperienceModuleLink, 
  ExperienceHintCard,
  ExampleLinks,
  WishlistPreview,
} from '@/components/experiences';
import {
  BrowserFrame,
  DeviceToggle,
  deviceWidths,
  LayoutTabs,
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
  showAddToCartButton: boolean;
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
  showAddToCartButton: true,
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
  'Nút Add to Cart phụ thuộc vào Cart + Orders module.',
  'Mỗi layout có config riêng - chuyển tab để chỉnh.',
];

function ModuleFeatureStatus({ label, enabled, href, moduleName }: { label: string; enabled: boolean; href: string; moduleName: string }) {
  return (
    <div className="mt-2 flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
      <div className="flex items-start gap-2">
        <span className={`mt-1 inline-flex h-2 w-2 rounded-full ${enabled ? 'bg-emerald-500' : 'bg-slate-400'}`} />
        <div>
          <p className="text-sm font-medium text-slate-700">{label}</p>
          <p className="text-xs text-slate-500">
            {enabled ? 'Đang bật' : 'Chưa bật'} · Nếu muốn {enabled ? 'tắt' : 'bật'} hãy vào {moduleName}
          </p>
        </div>
      </div>
      <Link href={href} className="text-xs font-medium text-cyan-600 hover:underline">
        Đi đến →
      </Link>
    </div>
  );
}

export default function WishlistExperiencePage() {
  const experienceSetting = useQuery(api.settings.getByKey, { key: EXPERIENCE_KEY });
  const wishlistModule = useQuery(api.admin.modules.getModuleByKey, { key: 'wishlist' });
  const cartModule = useQuery(api.admin.modules.getModuleByKey, { key: 'cart' });
  const ordersModule = useQuery(api.admin.modules.getModuleByKey, { key: 'orders' });
  const noteFeature = useQuery(api.admin.modules.getModuleFeature, { featureKey: 'enableNote', moduleKey: 'wishlist' });
  const notificationFeature = useQuery(api.admin.modules.getModuleFeature, { featureKey: 'enableNotification', moduleKey: 'wishlist' });
  const [previewDevice, setPreviewDevice] = useState<DeviceType>('desktop');

  const cartAvailable = (cartModule?.enabled ?? false) && (ordersModule?.enabled ?? false);

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

  const isLoading = experienceSetting === undefined || wishlistModule === undefined || cartModule === undefined || ordersModule === undefined;

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
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2">
            <LayoutTemplate className="w-5 h-5 text-pink-600" />
            <h1 className="text-2xl font-bold">Sản phẩm yêu thích</h1>
          </div>
          <Link href="/system/experiences" className="text-sm text-blue-600 hover:underline">
            Quay lại danh sách
          </Link>
        </div>
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

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Thiết lập hiển thị</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
            <ToggleRow
              label="Nút thêm giỏ hàng"
              description="Hiện nút add to cart"
              checked={currentLayoutConfig.showAddToCartButton}
              onChange={(v) => updateLayoutConfig('showAddToCartButton', v)}
              accentColor="#ec4899"
              disabled={!cartAvailable}
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
            <ModuleFeatureStatus
              label="Ghi chú"
              enabled={noteFeature?.enabled ?? false}
              href="/system/modules/wishlist"
              moduleName="module Wishlist"
            />
            <ModuleFeatureStatus
              label="Thông báo"
              enabled={notificationFeature?.enabled ?? false}
              href="/system/modules/wishlist"
              moduleName="module Wishlist"
            />
            <ExperienceModuleLink
              enabled={cartModule?.enabled ?? false}
              href="/system/modules/cart"
              icon={ShoppingCart}
              title="Giỏ hàng"
              colorScheme="pink"
            />
            <ExperienceModuleLink
              enabled={ordersModule?.enabled ?? false}
              href="/system/modules/orders"
              icon={Package}
              title="Đơn hàng"
              colorScheme="pink"
            />
          </ControlCard>

          <Card className="p-2">
            <div className="mb-2">
              <ExampleLinks
                links={[{ label: 'Trang wishlist', url: '/wishlist' }]}
                color="#ec4899"
                compact
              />
            </div>
            <ExperienceHintCard hints={HINTS} />
          </Card>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Eye size={18} /> Preview
            </CardTitle>
            <div className="flex items-center gap-3">
              <LayoutTabs
                layouts={LAYOUT_STYLES}
                activeLayout={config.layoutStyle}
                onChange={(layout) => setConfig(prev => ({ ...prev, layoutStyle: layout }))}
                accentColor="#ec4899"
              />
              <DeviceToggle value={previewDevice} onChange={setPreviewDevice} size="sm" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className={`mx-auto transition-all duration-300 ${deviceWidths[previewDevice]}`}>
            <BrowserFrame url="yoursite.com/wishlist">
              <WishlistPreview
                layoutStyle={config.layoutStyle}
                showWishlistButton={currentLayoutConfig.showWishlistButton}
                showNote={currentLayoutConfig.showNote && (noteFeature?.enabled ?? true)}
                showNotification={currentLayoutConfig.showNotification && (notificationFeature?.enabled ?? true)}
                showAddToCartButton={currentLayoutConfig.showAddToCartButton && cartAvailable}
                device={previewDevice}
                brandColor="#ec4899"
              />
            </BrowserFrame>
          </div>
          <div className="mt-3 text-xs text-slate-500">
            Style: <strong className="text-slate-700 dark:text-slate-300">{LAYOUT_STYLES.find(s => s.id === config.layoutStyle)?.label}</strong>
            {' • '}{previewDevice === 'desktop' && 'Desktop (1920px)'}{previewDevice === 'tablet' && 'Tablet (768px)'}{previewDevice === 'mobile' && 'Mobile (375px)'}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
