'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery } from 'convex/react';
import { toast } from 'sonner';
import { api } from '@/convex/_generated/api';
import { CreditCard, FileText, Heart, LayoutTemplate, Loader2, Mail, Package, Save, ShoppingCart, Users } from 'lucide-react';
import { Button, Card, Input, Label, cn } from '@/app/admin/components/ui';
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
  headerBackground: 'white',
  headerSeparator: 'none',
  headerSticky: true,
  showBrandAccent: false,
  cart: { show: true },
  cta: { show: true, text: 'Liên hệ' },
  login: { show: true, text: 'Đăng nhập' },
  search: { placeholder: 'Tìm kiếm...', searchPosts: true, searchProducts: true, show: true },
  topbar: {
    email: 'contact@example.com',
    hotline: '1900 1234',
    show: true,
    showStoreSystem: true,
    showTrackOrder: true,
    useSettingsData: false,
  },
  wishlist: { show: true },
};

const LAYOUT_STYLES: LayoutOption<HeaderLayoutStyle>[] = [
  { id: 'classic', label: 'Classic', description: 'Header tiêu chuẩn, menu ngang đơn giản.' },
  { id: 'topbar', label: 'Topbar', description: 'Có topbar, search, tiện ích nhanh.' },
  { id: 'centered', label: 'Centered', description: 'Logo giữa, menu cân đối hai bên.' },
];

const HINTS = [
  'Menu items được quản lý ở /admin/menus.',
  'Topbar phù hợp site bán hàng cần hotline + search.',
  'Centered phù hợp brand cần nhấn mạnh logo.',
  'Login chỉ hiển thị khi bật Module Khách hàng + tính năng Đăng nhập KH.',
  'Cart/Wishlist chỉ bật khi module tương ứng đang active.',
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
  const customersModule = useQuery(api.admin.modules.getModuleByKey, { key: 'customers' });
  const ordersModule = useQuery(api.admin.modules.getModuleByKey, { key: 'orders' });
  const customerLoginFeature = useQuery(api.admin.modules.getModuleFeature, { moduleKey: 'customers', featureKey: 'enableLogin' });

  const setMultipleSettings = useMutation(api.settings.setMultiple);

  const [previewDevice, setPreviewDevice] = useState<DeviceType>('desktop');
  const [isPanelExpanded, setIsPanelExpanded] = useState(true);
  const [previewStyle, setPreviewStyle] = useState<HeaderLayoutStyle>('classic');
  const [isSaving, setIsSaving] = useState(false);

  const savedStyleRaw = headerStyleSetting?.value as string | undefined;
  const savedStyle = (savedStyleRaw === 'transparent' ? 'centered' : savedStyleRaw) as HeaderLayoutStyle | undefined ?? 'classic';

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
    || postsModule === undefined
    || customersModule === undefined
    || ordersModule === undefined
    || customerLoginFeature === undefined;

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

  const updateHeaderBackground = (value: HeaderMenuConfig['headerBackground']) => {
    setConfig(prev => ({ ...prev, headerBackground: value }));
  };

  const updateHeaderSeparator = (value: HeaderMenuConfig['headerSeparator']) => {
    setConfig(prev => ({ ...prev, headerSeparator: value }));
  };

  const updateShowBrandAccent = (value: boolean) => {
    setConfig(prev => ({ ...prev, showBrandAccent: value }));
  };

  const updateHeaderSticky = (value: boolean) => {
    setConfig(prev => ({ ...prev, headerSticky: value }));
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
              customersEnabled={customersModule?.enabled ?? false}
              loginFeatureEnabled={customerLoginFeature?.enabled ?? false}
              ordersEnabled={ordersModule?.enabled ?? false}
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
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
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
              <ToggleRow
                label="Hệ thống cửa hàng"
                checked={config.topbar.showStoreSystem}
                onChange={(v) => updateTopbar('showStoreSystem', v)}
                accentColor={brandColor}
              />
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
          <ControlCard title="CTA & Brand">
            <div className="space-y-2">
              <div className="space-y-1">
                <Label className="text-xs">Brand name</Label>
                <Input value={config.brandName} onChange={(e) => updateBrandName(e.target.value)} className="h-8 text-sm" />
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
                <Label className="text-xs">Login text</Label>
                <Input
                  value={config.login.text}
                  onChange={(e) => updateLogin('text', e.target.value)}
                  className="h-8 text-sm"
                  disabled={!config.login.show}
                />
              </div>
            </div>
          </ControlCard>

          {previewStyle === 'classic' && (
            <ControlCard title="Giao diện Classic">
              <div className="space-y-2">
                <div className="space-y-2">
                  <Label className="text-xs">Classic background</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {([
                      { id: 'white', label: 'Solid' },
                      { id: 'dots', label: 'Dots' },
                      { id: 'stripes', label: 'Stripes' },
                    ] as const).map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => updateHeaderBackground(option.id)}
                        className={cn(
                          'h-8 rounded-md border text-xs font-medium transition-colors',
                          config.headerBackground === option.id
                            ? 'border-slate-900 bg-slate-900 text-white dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800'
                        )}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
                <ToggleRow
                  label="Brand accent line"
                  checked={config.showBrandAccent}
                  onChange={updateShowBrandAccent}
                  accentColor={brandColor}
                />
                <div className="space-y-2">
                  <Label className="text-xs">Header separator</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {([
                      { id: 'none', label: 'None' },
                      { id: 'shadow', label: 'Shadow' },
                      { id: 'border', label: 'Border' },
                      { id: 'gradient', label: 'Gradient' },
                    ] as const).map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => updateHeaderSeparator(option.id)}
                        className={cn(
                          'h-8 rounded-md border text-xs font-medium transition-colors',
                          config.headerSeparator === option.id
                            ? 'border-slate-900 bg-slate-900 text-white dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800'
                        )}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
                <ToggleRow
                  label="Sticky header"
                  checked={config.headerSticky}
                  onChange={updateHeaderSticky}
                  accentColor={brandColor}
                />
              </div>
            </ControlCard>
          )}

          <Card className="p-2 lg:col-span-4">
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

        <div className="mt-3">
          <ControlCard title="Module & Experience liên quan">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
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
              <ExperienceModuleLink
                enabled={customersModule?.enabled ?? false}
                href="/system/modules/customers"
                icon={Users}
                title="Khách hàng"
                colorScheme="purple"
              />
              <ExperienceModuleLink
                enabled
                href="/system/experiences/contact"
                icon={Mail}
                title="Trang liên hệ"
                colorScheme="blue"
              />
              <ExperienceModuleLink
                enabled
                href="/system/experiences/checkout"
                icon={CreditCard}
                title="Checkout"
                colorScheme="cyan"
              />
            </div>
          </ControlCard>
        </div>
        <div className="mt-3">
          <ControlCard title="Trạng thái đăng nhập">
            <ModuleFeatureStatus
              label="Module Khách hàng"
              enabled={customersModule?.enabled ?? false}
              href="/system/modules/customers"
              moduleName="Module Khách hàng"
            />
            <ModuleFeatureStatus
              label="Tính năng đăng nhập"
              enabled={customerLoginFeature?.enabled ?? false}
              href="/system/modules/customers"
              moduleName="Module Khách hàng"
            />
            <ModuleFeatureStatus
              label="Theo dõi đơn hàng"
              enabled={ordersModule?.enabled ?? false}
              href="/system/modules/orders"
              moduleName="Module Đơn hàng"
            />
          </ControlCard>
        </div>
      </ConfigPanel>
    </div>
  );
}
