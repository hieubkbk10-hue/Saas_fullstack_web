'use client';

import React, { useMemo, useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { AlertCircle, Heart, LayoutTemplate, Loader2, Package, Save, ShoppingCart, Tag } from 'lucide-react';
import { Button, Card } from '@/app/admin/components/ui';
import { 
  ExperienceModuleLink, 
  ExperienceHintCard,
  ProductsListPreview,
  ExampleLinks,
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

type ListLayoutStyle = 'grid' | 'sidebar' | 'list';
type PaginationType = 'pagination' | 'infiniteScroll';

type ProductsListExperienceConfig = {
  layoutStyle: ListLayoutStyle;
  layouts: {
    grid: LayoutConfig;
    sidebar: LayoutConfig;
    list: LayoutConfig;
  };
  showWishlistButton: boolean;
  showAddToCartButton: boolean;
  showBuyNowButton: boolean;
  showPromotionBadge: boolean;
  enableQuickAddVariant: boolean;
};

type LayoutConfig = {
  paginationType: PaginationType;
  showSearch: boolean;
  showCategories: boolean;
  postsPerPage: number;
};

const EXPERIENCE_KEY = 'products_list_ui';

const LAYOUT_STYLES: LayoutOption<ListLayoutStyle>[] = [
  { description: 'Hiển thị dạng lưới cards', id: 'grid', label: 'Grid' },
  { description: 'Sidebar filters + grid', id: 'sidebar', label: 'Sidebar' },
  { description: 'Hiển thị dạng danh sách', id: 'list', label: 'List' },
];

const DEFAULT_LAYOUT_CONFIG: LayoutConfig = {
  paginationType: 'pagination',
  showSearch: true,
  showCategories: true,
  postsPerPage: 12,
};

const DEFAULT_CONFIG: ProductsListExperienceConfig = {
  layoutStyle: 'grid',
  layouts: {
    grid: { ...DEFAULT_LAYOUT_CONFIG },
    sidebar: { ...DEFAULT_LAYOUT_CONFIG },
    list: { ...DEFAULT_LAYOUT_CONFIG },
  },
  showWishlistButton: true,
  showAddToCartButton: true,
  showBuyNowButton: true,
  showPromotionBadge: true,
  enableQuickAddVariant: true,
};

const HINTS = [
  'Grid layout tiêu chuẩn cho e-commerce.',
  'Sidebar filters quan trọng cho shop có nhiều sản phẩm.',
  'Search giúp user tìm sản phẩm nhanh.',
  'Mỗi layout có config riêng - chuyển tab để chỉnh.',
  'Wishlist, Add to Cart và Buy Now có thể toggle từ đây.',
];

export default function ProductsListExperiencePage() {
  const experienceSetting = useQuery(api.settings.getByKey, { key: EXPERIENCE_KEY });
  const productsModule = useQuery(api.admin.modules.getModuleByKey, { key: 'products' });
  const wishlistModule = useQuery(api.admin.modules.getModuleByKey, { key: 'wishlist' });
  const cartModule = useQuery(api.admin.modules.getModuleByKey, { key: 'cart' });
  const ordersModule = useQuery(api.admin.modules.getModuleByKey, { key: 'orders' });
  const promotionsModule = useQuery(api.admin.modules.getModuleByKey, { key: 'promotions' });
  const brandColorSetting = useQuery(api.settings.getByKey, { key: 'site_brand_color' });
  const [previewDevice, setPreviewDevice] = useState<DeviceType>('desktop');
  const [isPanelExpanded, setIsPanelExpanded] = useState(true);

  const serverConfig = useMemo<ProductsListExperienceConfig>(() => {
    const raw = experienceSetting?.value as {
      layoutStyle?: ListLayoutStyle | 'masonry';
      layouts?: Partial<Record<'grid' | 'list' | 'sidebar' | 'masonry', Partial<LayoutConfig & { showPagination?: boolean }>>>;
      showWishlistButton?: boolean;
      showAddToCartButton?: boolean;
      showBuyNowButton?: boolean;
      showPromotionBadge?: boolean;
      enableQuickAddVariant?: boolean;
    } | undefined;
    
    const normalizePaginationType = (value?: string | boolean): PaginationType => {
      if (value === 'infiniteScroll') return 'infiniteScroll';
      if (value === 'pagination') return 'pagination';
      if (value === false) return 'infiniteScroll';
      return 'pagination';
    };
    
    const normalizeLayoutConfig = (cfg?: Partial<LayoutConfig & { showPagination?: boolean }>): LayoutConfig => ({
      paginationType: normalizePaginationType(cfg?.paginationType ?? cfg?.showPagination),
      showSearch: cfg?.showSearch ?? true,
      showCategories: cfg?.showCategories ?? true,
      postsPerPage: cfg?.postsPerPage ?? 12,
    });
    
    const layoutStyle: ListLayoutStyle = raw?.layoutStyle === 'masonry' ? 'sidebar' : (raw?.layoutStyle ?? 'grid');
    const sidebarConfig = raw?.layouts?.sidebar ?? raw?.layouts?.masonry;

    return {
      layoutStyle,
      layouts: {
        grid: normalizeLayoutConfig(raw?.layouts?.grid as Partial<LayoutConfig & { showPagination?: boolean }>),
        sidebar: normalizeLayoutConfig(sidebarConfig as Partial<LayoutConfig & { showPagination?: boolean }>),
        list: normalizeLayoutConfig(raw?.layouts?.list as Partial<LayoutConfig & { showPagination?: boolean }>),
      },
      showWishlistButton: raw?.showWishlistButton ?? true,
      showAddToCartButton: raw?.showAddToCartButton ?? true,
      showBuyNowButton: raw?.showBuyNowButton ?? true,
      showPromotionBadge: raw?.showPromotionBadge ?? true,
      enableQuickAddVariant: raw?.enableQuickAddVariant ?? true,
    };
  }, [experienceSetting?.value]);

  const isLoading = experienceSetting === undefined || productsModule === undefined || wishlistModule === undefined || cartModule === undefined || ordersModule === undefined || promotionsModule === undefined;
  const brandColor = (brandColorSetting?.value as string) || '#10b981';

  const { config, setConfig, hasChanges } = useExperienceConfig(serverConfig, DEFAULT_CONFIG, isLoading);
  const { handleSave, isSaving } = useExperienceSave(
    EXPERIENCE_KEY,
    config,
    MESSAGES.saveSuccess(EXPERIENCE_NAMES[EXPERIENCE_KEY])
  );

  const currentLayoutConfig = config.layouts[config.layoutStyle] ?? DEFAULT_LAYOUT_CONFIG;
  const hasDisabledModules = !wishlistModule?.enabled || !cartModule?.enabled || !ordersModule?.enabled || !promotionsModule?.enabled;

  const updateLayoutConfig = <K extends keyof LayoutConfig>(
    key: K,
    value: LayoutConfig[K]
  ) => {
    setConfig(prev => ({
      ...prev,
      layouts: {
        ...prev.layouts,
        [prev.layoutStyle]: {
          ...DEFAULT_LAYOUT_CONFIG,
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
    <div className="h-[calc(100vh-64px)] flex flex-col">
      {/* Compact Header - 48px */}
      <header className="h-12 px-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
        <div className="flex items-center gap-2">
          <LayoutTemplate className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">Danh sách sản phẩm</span>
        </div>
        <div className="flex items-center gap-3">
          <DeviceToggle value={previewDevice} onChange={setPreviewDevice} size="sm" />
          <Button
            size="sm"
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            className="bg-emerald-600 hover:bg-emerald-500 gap-1.5"
          >
            {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            <span>{hasChanges ? 'Lưu' : 'Đã lưu'}</span>
          </Button>
        </div>
      </header>

      {/* Preview Area */}
      <main className="flex-1 overflow-auto p-4 bg-slate-50 dark:bg-slate-950">
        <div className={`mx-auto transition-all duration-300 ${deviceWidths[previewDevice]}`}>
          <BrowserFrame url="yoursite.com/products" maxHeight="calc(100vh - 320px)">
            <ProductsListPreview
              layoutStyle={config.layoutStyle}
              paginationType={currentLayoutConfig.paginationType}
              showSearch={currentLayoutConfig.showSearch}
              showCategories={currentLayoutConfig.showCategories}
              brandColor={brandColor}
              device={previewDevice}
              showWishlistButton={config.showWishlistButton && (wishlistModule?.enabled ?? false)}
              showAddToCartButton={config.showAddToCartButton && (cartModule?.enabled ?? false) && (ordersModule?.enabled ?? false)}
              showBuyNowButton={config.showBuyNowButton && (ordersModule?.enabled ?? false)}
              showPromotionBadge={config.showPromotionBadge && (promotionsModule?.enabled ?? false)}
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
            layouts={LAYOUT_STYLES}
            activeLayout={config.layoutStyle}
            onChange={(layout) => setConfig(prev => ({ ...prev, layoutStyle: layout }))}
            accentColor="#10b981"
          />
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <ControlCard title="Khối hiển thị">
            <ToggleRow
              label="Tìm kiếm"
              checked={currentLayoutConfig.showSearch}
              onChange={(v) => updateLayoutConfig('showSearch', v)}
              accentColor="#10b981"
              disabled={!productsModule?.enabled}
            />
            <ToggleRow
              label="Buy Now"
              checked={config.showBuyNowButton}
              onChange={(v) => setConfig(prev => ({ ...prev, showBuyNowButton: v }))}
              accentColor="#10b981"
              disabled={!ordersModule?.enabled}
            />
            <ToggleRow
              label="Danh mục"
              checked={currentLayoutConfig.showCategories}
              onChange={(v) => updateLayoutConfig('showCategories', v)}
              accentColor="#10b981"
              disabled={!productsModule?.enabled}
            />
          </ControlCard>

          <ControlCard title="Phân trang">
            <SelectRow
              label="Kiểu"
              value={currentLayoutConfig.paginationType}
              options={[
                { value: 'pagination', label: 'Phân trang' },
                { value: 'infiniteScroll', label: 'Cuộn vô hạn' },
              ]}
              onChange={(v) => updateLayoutConfig('paginationType', v as PaginationType)}
              disabled={!productsModule?.enabled}
            />
            <SelectRow
              label="Bài mỗi trang"
              value={String(currentLayoutConfig.postsPerPage)}
              options={[
                { value: '12', label: '12' },
                { value: '20', label: '20' },
                { value: '24', label: '24' },
                { value: '48', label: '48' },
              ]}
              onChange={(v) => updateLayoutConfig('postsPerPage', Number(v))}
              disabled={!productsModule?.enabled}
            />
          </ControlCard>

          <ControlCard title="Tính năng sản phẩm">
            <ToggleRow
              label="Nút yêu thích"
              description="Hiện nút thêm vào wishlist"
              checked={config.showWishlistButton}
              onChange={(v) => setConfig(prev => ({ ...prev, showWishlistButton: v }))}
              accentColor="#10b981"
              disabled={!wishlistModule?.enabled}
            />
            <ToggleRow
              label="Nút thêm giỏ hàng"
              description="Hiện nút add to cart"
              checked={config.showAddToCartButton}
              onChange={(v) => setConfig(prev => ({ ...prev, showAddToCartButton: v }))}
              accentColor="#10b981"
              disabled={!cartModule?.enabled || !ordersModule?.enabled}
            />
            <ToggleRow
              label="Quick add phiên bản"
              description="Mở modal chọn phiên bản khi thêm giỏ"
              checked={config.enableQuickAddVariant}
              onChange={(v) => setConfig(prev => ({ ...prev, enableQuickAddVariant: v }))}
              accentColor="#10b981"
              disabled={!cartModule?.enabled || !ordersModule?.enabled}
            />
            <ToggleRow
              label="Badge khuyến mãi"
              description="Hiện badge giảm giá"
              checked={config.showPromotionBadge}
              onChange={(v) => setConfig(prev => ({ ...prev, showPromotionBadge: v }))}
              accentColor="#10b981"
              disabled={!promotionsModule?.enabled}
            />
          </ControlCard>

          <ControlCard title="Module liên quan">
            {hasDisabledModules && (
              <div className="flex items-start gap-2 p-2 bg-amber-50 dark:bg-amber-500/10 rounded-lg text-xs text-amber-700 dark:text-amber-300 mb-2">
                <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                <span>Một số module chưa bật.</span>
              </div>
            )}
            <ExperienceModuleLink
              enabled={productsModule?.enabled ?? false}
              href="/system/modules/products"
              icon={Package}
              title="Sản phẩm"
              colorScheme="cyan"
            />
            <ExperienceModuleLink
              enabled={wishlistModule?.enabled ?? false}
              href="/system/modules/wishlist"
              icon={Heart}
              title="Sản phẩm yêu thích"
              colorScheme="cyan"
            />
            <ExperienceModuleLink
              enabled={cartModule?.enabled ?? false}
              href="/system/modules/cart"
              icon={ShoppingCart}
              title="Giỏ hàng"
              colorScheme="cyan"
            />
            <ExperienceModuleLink
              enabled={ordersModule?.enabled ?? false}
              href="/system/modules/orders"
              icon={Package}
              title="Đơn hàng"
              colorScheme="cyan"
            />
            <ExperienceModuleLink
              enabled={promotionsModule?.enabled ?? false}
              href="/system/modules/promotions"
              icon={Tag}
              title="Khuyến mãi"
              colorScheme="cyan"
            />
          </ControlCard>

          <Card className="p-2">
            <div className="mb-2">
              <ExampleLinks
                links={[{ label: 'Trang danh sách', url: '/products' }]}
                color="#10b981"
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
