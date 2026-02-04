'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { toast } from 'sonner';
import { api } from '@/convex/_generated/api';
import { FileText, Heart, LayoutTemplate, Loader2, Package, Save, ShoppingCart } from 'lucide-react';
import { Button, Card, Input, Label } from '@/app/admin/components/ui';
import {
  ExperienceHintCard,
  ExperienceModuleLink,
  ExampleLinks,
} from '@/components/experiences';
import {
  BrowserFrame,
  ConfigPanel,
  ControlCard,
  DeviceToggle,
  deviceWidths,
  LayoutTabs,
  ToggleRow,
  type DeviceType,
  type LayoutOption,
} from '@/components/experiences/editor';
import { HeaderMenuPreview, type HeaderLayoutStyle, type HeaderMenuConfig } from '@/components/experiences/previews/HeaderMenuPreview';
import { MESSAGES, useExperienceConfig } from '@/lib/experiences';

const DEFAULT_CONFIG: HeaderMenuConfig = {
  brandName: 'YourBrand',
  cart: { show: true, url: '/cart' },
  cta: { show: true, text: 'Liên hệ', url: '/contact' },
  login: { show: true, text: 'Đăng nhập', url: '/login' },
  search: { placeholder: 'Tìm kiếm...', searchPosts: true, searchProducts: true, show: true },
  topbar: {
    email: 'contact@example.com',
    hotline: '1900 1234',
    show: true,
    showStoreSystem: true,
    showTrackOrder: true,
    storeSystemUrl: '/stores',
    trackOrderUrl: '/orders/tracking',
    useSettingsData: false,
  },
  wishlist: { show: true, url: '/wishlist' },
};

const LAYOUT_STYLES: LayoutOption<HeaderLayoutStyle>[] = [
  { id: 'classic', label: 'Classic', description: 'Header tiêu chuẩn, menu ngang đơn giản.' },
  { id: 'topbar', label: 'Topbar', description: 'Có topbar, search, tiện ích nhanh.' },
  { id: 'transparent', label: 'Transparent', description: 'Header trong suốt cho hero.' },
];

const HINTS = [
  'Menu items được quản lý ở /admin/menus.',
  'Topbar phù hợp site bán hàng cần hotline + search.',
  'Transparent nên dùng khi có hero/banner lớn.',
  'Cart/Wishlist chỉ bật khi module tương ứng đang active.',
];

export default function HeaderMenuExperiencePage() {
  const headerStyleSetting = useQuery(api.settings.getByKey, { key: 'header_style' });
  const headerConfigSetting = useQuery(api.settings.getByKey, { key: 'header_config' });
  const brandColorSetting = useQuery(api.settings.getByKey, { key: 'site_brand_color' });
  const menuData = useQuery(api.menus.getFullMenu, { location: 'header' });
  const contactSettings = useQuery(api.settings.listByGroup, { group: 'contact' });

  const cartModule = useQuery(api.admin.modules.getModuleByKey, { key: 'cart' });
  const wishlistModule = useQuery(api.admin.modules.getModuleByKey, { key: 'wishlist' });
  const productsModule = useQuery(api.admin.modules.getModuleByKey, { key: 'products' });
  const postsModule = useQuery(api.admin.modules.getModuleByKey, { key: 'posts' });

  const setMultipleSettings = useMutation(api.settings.setMultiple);

  const [previewDevice, setPreviewDevice] = useState<DeviceType>('desktop');
  const [isPanelExpanded, setIsPanelExpanded] = useState(true);
  const [previewStyle, setPreviewStyle] = useState<HeaderLayoutStyle>('classic');
  const [isSaving, setIsSaving] = useState(false);

  const savedStyle = (headerStyleSetting?.value as HeaderLayoutStyle) ?? 'classic';

  useEffect(() => {
    setPreviewStyle(savedStyle);
  }, [savedStyle]);

  const serverConfig = useMemo<HeaderMenuConfig>(() => {
    const raw = headerConfigSetting?.value as Partial<HeaderMenuConfig> | undefined;
    return {
      ...DEFAULT_CONFIG,
      ...raw,
      topbar: { ...DEFAULT_CONFIG.topbar, ...raw?.topbar },
      search: { ...DEFAULT_CONFIG.search, ...raw?.search },
      cta: { ...DEFAULT_CONFIG.cta, ...raw?.cta },
      cart: { ...DEFAULT_CONFIG.cart, ...raw?.cart },
      wishlist: { ...DEFAULT_CONFIG.wishlist, ...raw?.wishlist },
      login: { ...DEFAULT_CONFIG.login, ...raw?.login },
    };
  }, [headerConfigSetting?.value]);

  const isLoading = headerStyleSetting === undefined
    || headerConfigSetting === undefined
    || brandColorSetting === undefined
    || menuData === undefined
    || contactSettings === undefined
    || cartModule === undefined
    || wishlistModule === undefined
    || productsModule === undefined
    || postsModule === undefined;

  const brandColor = typeof brandColorSetting?.value === 'string' ? brandColorSetting.value : '#f97316';

  const menuItems = menuData?.items ?? [];
  const settingsPhone = contactSettings?.find(s => s.key === 'contact_phone')?.value as string | undefined;
  const settingsEmail = contactSettings?.find(s => s.key === 'contact_email')?.value as string | undefined;

  const { config, setConfig, hasChanges } = useExperienceConfig(serverConfig, DEFAULT_CONFIG, isLoading);

  const hasStyleChanges = previewStyle !== savedStyle;

  const updateTopbar = <K extends keyof HeaderMenuConfig['topbar']>(key: K, value: HeaderMenuConfig['topbar'][K]) => {
    setConfig(prev => ({ ...prev, topbar: { ...prev.topbar, [key]: value } }));
  };

  const updateSearch = <K extends keyof HeaderMenuConfig['search']>(key: K, value: HeaderMenuConfig['search'][K]) => {
    setConfig(prev => ({ ...prev, search: { ...prev.search, [key]: value } }));
  };

  const updateCart = <K extends keyof HeaderMenuConfig['cart']>(key: K, value: HeaderMenuConfig['cart'][K]) => {
    setConfig(prev => ({ ...prev, cart: { ...prev.cart, [key]: value } }));
  };

  const updateWishlist = <K extends keyof HeaderMenuConfig['wishlist']>(key: K, value: HeaderMenuConfig['wishlist'][K]) => {
    setConfig(prev => ({ ...prev, wishlist: { ...prev.wishlist, [key]: value } }));
  };

  const updateLogin = <K extends keyof HeaderMenuConfig['login']>(key: K, value: HeaderMenuConfig['login'][K]) => {
    setConfig(prev => ({ ...prev, login: { ...prev.login, [key]: value } }));
  };

  const updateCta = <K extends keyof HeaderMenuConfig['cta']>(key: K, value: HeaderMenuConfig['cta'][K]) => {
    setConfig(prev => ({ ...prev, cta: { ...prev.cta, [key]: value } }));
  };

  const updateBrandName = (value: string) => {
    setConfig(prev => ({ ...prev, brandName: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await setMultipleSettings({
        settings: [
          { group: 'site', key: 'header_style', value: previewStyle },
          { group: 'site', key: 'header_config', value: config },
        ],
      });
      toast.success('Đã lưu cấu hình Header Menu');
    } catch {
      toast.error(MESSAGES.saveError);
    } finally {
      setIsSaving(false);
    }
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
      <header className="h-12 px-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
        <div className="flex items-center gap-2">
          <LayoutTemplate className="w-4 h-4" style={{ color: brandColor }} />
          <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">Header Menu</span>
        </div>
        <div className="flex items-center gap-3">
          <DeviceToggle value={previewDevice} onChange={setPreviewDevice} size="sm" />
          <Button
            size="sm"
            onClick={handleSave}
            disabled={(!hasChanges && !hasStyleChanges) || isSaving}
            className="gap-1.5"
            style={{ backgroundColor: brandColor }}
          >
            {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            <span>{hasChanges || hasStyleChanges ? 'Lưu' : 'Đã lưu'}</span>
          </Button>
        </div>
      </header>

      <main className="flex-1 overflow-auto p-4 bg-slate-50 dark:bg-slate-950">
        <div className={`mx-auto transition-all duration-300 ${deviceWidths[previewDevice]}`}>
          <BrowserFrame url="yoursite.com" maxHeight="calc(100vh - 320px)">
            <HeaderMenuPreview
              brandColor={brandColor}
              config={config}
              device={previewDevice}
              layoutStyle={previewStyle}
              menuItems={menuItems}
              settingsEmail={settingsEmail}
              settingsPhone={settingsPhone}
            />
          </BrowserFrame>
        </div>
      </main>

      <ConfigPanel
        isExpanded={isPanelExpanded}
        onToggle={() => setIsPanelExpanded(!isPanelExpanded)}
        expandedHeight="220px"
        leftContent={
          <LayoutTabs
            layouts={LAYOUT_STYLES}
            activeLayout={previewStyle}
            onChange={setPreviewStyle}
            accentColor={brandColor}
          />
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <ControlCard title="Hiển thị">
            <ToggleRow
              label="Topbar"
              checked={config.topbar.show}
              onChange={(v) => updateTopbar('show', v)}
              accentColor={brandColor}
            />
            <ToggleRow
              label="Search"
              checked={config.search.show}
              onChange={(v) => updateSearch('show', v)}
              accentColor={brandColor}
            />
            <ToggleRow
              label="Cart"
              checked={config.cart.show}
              onChange={(v) => updateCart('show', v)}
              accentColor={brandColor}
              disabled={!cartModule?.enabled}
            />
            <ToggleRow
              label="Wishlist"
              checked={config.wishlist.show}
              onChange={(v) => updateWishlist('show', v)}
              accentColor={brandColor}
              disabled={!wishlistModule?.enabled}
            />
            <ToggleRow
              label="Login"
              checked={config.login.show}
              onChange={(v) => updateLogin('show', v)}
              accentColor={brandColor}
            />
            <ToggleRow
              label="CTA"
              checked={config.cta.show}
              onChange={(v) => updateCta('show', v)}
              accentColor={brandColor}
            />
          </ControlCard>

          <ControlCard title="Topbar & Search">
            <div className="space-y-2">
              <ToggleRow
                label="Dùng settings liên hệ"
                checked={config.topbar.useSettingsData}
                onChange={(v) => updateTopbar('useSettingsData', v)}
                accentColor={brandColor}
              />
              <div className="space-y-1">
                <Label className="text-xs">Hotline</Label>
                <Input
                  value={config.topbar.hotline}
                  onChange={(e) => updateTopbar('hotline', e.target.value)}
                  className="h-8 text-sm"
                  disabled={config.topbar.useSettingsData}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Email</Label>
                <Input
                  value={config.topbar.email}
                  onChange={(e) => updateTopbar('email', e.target.value)}
                  className="h-8 text-sm"
                  disabled={config.topbar.useSettingsData}
                />
              </div>
              <ToggleRow
                label="Theo dõi đơn"
                checked={config.topbar.showTrackOrder}
                onChange={(v) => updateTopbar('showTrackOrder', v)}
                accentColor={brandColor}
              />
              {config.topbar.showTrackOrder && (
                <Input
                  value={config.topbar.trackOrderUrl}
                  onChange={(e) => updateTopbar('trackOrderUrl', e.target.value)}
                  className="h-8 text-sm"
                  placeholder="/orders/tracking"
                />
              )}
              <ToggleRow
                label="Hệ thống cửa hàng"
                checked={config.topbar.showStoreSystem}
                onChange={(v) => updateTopbar('showStoreSystem', v)}
                accentColor={brandColor}
              />
              {config.topbar.showStoreSystem && (
                <Input
                  value={config.topbar.storeSystemUrl}
                  onChange={(e) => updateTopbar('storeSystemUrl', e.target.value)}
                  className="h-8 text-sm"
                  placeholder="/stores"
                />
              )}
              <div className="space-y-1">
                <Label className="text-xs">Placeholder search</Label>
                <Input
                  value={config.search.placeholder}
                  onChange={(e) => updateSearch('placeholder', e.target.value)}
                  className="h-8 text-sm"
                  disabled={!config.search.show}
                />
              </div>
              <ToggleRow
                label="Search sản phẩm"
                checked={config.search.searchProducts}
                onChange={(v) => updateSearch('searchProducts', v)}
                accentColor={brandColor}
                disabled={!productsModule?.enabled || !config.search.show}
              />
              <ToggleRow
                label="Search bài viết"
                checked={config.search.searchPosts}
                onChange={(v) => updateSearch('searchPosts', v)}
                accentColor={brandColor}
                disabled={!postsModule?.enabled || !config.search.show}
              />
            </div>
          </ControlCard>

          <ControlCard title="Liên kết & Brand">
            <div className="space-y-2">
              <div className="space-y-1">
                <Label className="text-xs">Brand name</Label>
                <Input value={config.brandName} onChange={(e) => updateBrandName(e.target.value)} className="h-8 text-sm" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Cart URL</Label>
                <Input
                  value={config.cart.url}
                  onChange={(e) => updateCart('url', e.target.value)}
                  className="h-8 text-sm"
                  disabled={!config.cart.show || !cartModule?.enabled}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Wishlist URL</Label>
                <Input
                  value={config.wishlist.url}
                  onChange={(e) => updateWishlist('url', e.target.value)}
                  className="h-8 text-sm"
                  disabled={!config.wishlist.show || !wishlistModule?.enabled}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Login text</Label>
                <Input
                  value={config.login.text}
                  onChange={(e) => updateLogin('text', e.target.value)}
                  className="h-8 text-sm"
                  disabled={!config.login.show}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Login URL</Label>
                <Input
                  value={config.login.url}
                  onChange={(e) => updateLogin('url', e.target.value)}
                  className="h-8 text-sm"
                  disabled={!config.login.show}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">CTA text</Label>
                <Input
                  value={config.cta.text}
                  onChange={(e) => updateCta('text', e.target.value)}
                  className="h-8 text-sm"
                  disabled={!config.cta.show}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">CTA URL</Label>
                <Input
                  value={config.cta.url}
                  onChange={(e) => updateCta('url', e.target.value)}
                  className="h-8 text-sm"
                  disabled={!config.cta.show}
                />
              </div>
            </div>
          </ControlCard>

          <ControlCard title="Module liên quan">
            <ExperienceModuleLink
              enabled={cartModule?.enabled ?? false}
              href="/system/modules/cart"
              icon={ShoppingCart}
              title="Giỏ hàng"
              colorScheme="orange"
            />
            <ExperienceModuleLink
              enabled={wishlistModule?.enabled ?? false}
              href="/system/modules/wishlist"
              icon={Heart}
              title="Wishlist"
              colorScheme="pink"
            />
            <ExperienceModuleLink
              enabled={productsModule?.enabled ?? false}
              href="/system/modules/products"
              icon={Package}
              title="Sản phẩm"
              colorScheme="green"
            />
            <ExperienceModuleLink
              enabled={postsModule?.enabled ?? false}
              href="/system/modules/posts"
              icon={FileText}
              title="Bài viết"
              colorScheme="purple"
            />
          </ControlCard>

          <Card className="p-2 lg:col-span-2">
            <div className="mb-2">
              <ExampleLinks
                links={[{ label: 'Trang chủ', url: '/' }]}
                color={brandColor}
                compact
              />
            </div>
            <ExperienceHintCard hints={HINTS} />
          </Card>
        </div>
      </ConfigPanel>
    </div>
  );
}
