'use client';

import React, { useMemo } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Heart, LayoutTemplate, MessageSquare, Package, ShoppingCart } from 'lucide-react';
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

type ProductsDetailStyle = 'classic' | 'modern' | 'minimal';

type ProductDetailExperienceConfig = {
  layoutStyle: ProductsDetailStyle;
  showAddToCart: boolean;
  showClassicHighlights: boolean;
  showRating: boolean;
  showWishlist: boolean;
};

const EXPERIENCE_KEY = 'product_detail_ui';

const DETAIL_STYLES: { id: ProductsDetailStyle; label: string; description: string }[] = [
  { description: 'Layout 2 cột với gallery và info', id: 'classic', label: 'Classic' },
  { description: 'Full-width hero, landing page style', id: 'modern', label: 'Modern' },
  { description: 'Tối giản, tập trung sản phẩm', id: 'minimal', label: 'Minimal' },
];

const DEFAULT_CONFIG: ProductDetailExperienceConfig = {
  layoutStyle: 'classic',
  showAddToCart: true,
  showClassicHighlights: true,
  showRating: true,
  showWishlist: true,
};

const HINTS = [
  'Ưu tiên bật module trước khi bật toggle liên quan.',
  'Layout Classic sẽ dùng Highlights theo toggle ở đây.',
  'Có thể kiểm tra UI tại đường dẫn sản phẩm thật.',
];

export default function ProductDetailExperiencePage() {
  const experienceSetting = useQuery(api.settings.getByKey, { key: EXPERIENCE_KEY });
  const detailStyleSetting = useQuery(api.settings.getByKey, { key: 'products_detail_style' });
  const classicHighlightsEnabledSetting = useQuery(api.settings.getByKey, { key: 'products_detail_classic_highlights_enabled' });
  const commentsModule = useQuery(api.admin.modules.getModuleByKey, { key: 'comments' });
  const wishlistModule = useQuery(api.admin.modules.getModuleByKey, { key: 'wishlist' });
  const cartModule = useQuery(api.admin.modules.getModuleByKey, { key: 'cart' });
  const ordersModule = useQuery(api.admin.modules.getModuleByKey, { key: 'orders' });

  const serverDetailStyle = (detailStyleSetting?.value as ProductsDetailStyle) || 'classic';
  const serverClassicHighlightsEnabled = (classicHighlightsEnabledSetting?.value as boolean) ?? true;

  const serverConfig = useMemo<ProductDetailExperienceConfig>(() => {
    const raw = experienceSetting?.value as Partial<ProductDetailExperienceConfig> | undefined;
    return {
      layoutStyle: raw?.layoutStyle ?? serverDetailStyle,
      showAddToCart: raw?.showAddToCart ?? true,
      showClassicHighlights: raw?.showClassicHighlights ?? serverClassicHighlightsEnabled,
      showRating: raw?.showRating ?? true,
      showWishlist: raw?.showWishlist ?? true,
    };
  }, [experienceSetting?.value, serverDetailStyle, serverClassicHighlightsEnabled]);

  const isLoading = experienceSetting === undefined || detailStyleSetting === undefined || classicHighlightsEnabledSetting === undefined;

  const { config, setConfig, hasChanges } = useExperienceConfig(serverConfig, DEFAULT_CONFIG, isLoading);

  // Additional legacy settings to save
  const additionalSettings = useMemo(() => {
    const settings: Array<{ group: string; key: string; value: unknown }> = [];
    
    if (config.layoutStyle !== serverDetailStyle) {
      settings.push({ group: 'products', key: 'products_detail_style', value: config.layoutStyle });
    }
    
    if (config.showClassicHighlights !== serverClassicHighlightsEnabled) {
      settings.push({ group: 'products', key: 'products_detail_classic_highlights_enabled', value: config.showClassicHighlights });
    }
    
    return settings.length > 0 ? settings : undefined;
  }, [config, serverDetailStyle, serverClassicHighlightsEnabled]);

  const { handleSave, isSaving } = useExperienceSave(
    EXPERIENCE_KEY, 
    config, 
    MESSAGES.saveSuccess(EXPERIENCE_NAMES[EXPERIENCE_KEY]),
    additionalSettings
  );

  const summaryItems: SummaryItem[] = [
    { label: 'Layout', value: config.layoutStyle, format: 'capitalize' },
    { label: 'Hiển thị rating', value: config.showRating },
    { label: 'Wishlist', value: config.showWishlist },
    { label: 'CTA giỏ hàng', value: config.showAddToCart },
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
        title="Trải nghiệm: Trang chi tiết sản phẩm"
        description="Gom cấu hình layout, rating, wishlist, CTA giỏ hàng để quản lý thống nhất."
        iconBgClass="bg-cyan-500/10"
        iconTextClass="text-cyan-600 dark:text-cyan-400"
        buttonClass="bg-cyan-600 hover:bg-cyan-500"
        onSave={handleSave}
        hasChanges={hasChanges}
        isSaving={isSaving}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="space-y-4 lg:col-span-2">
          <SettingsCard>
            <SettingSelect
              label="Layout chi tiết"
              value={config.layoutStyle}
              onChange={(value) => setConfig(prev => ({ ...prev, layoutStyle: value as ProductsDetailStyle }))}
              options={DETAIL_STYLES.map(style => ({ label: `${style.label} - ${style.description}`, value: style.id }))}
              focusColor="focus:border-cyan-500"
            />
          </SettingsCard>

          <Card className="p-4">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">Khối hiển thị</h3>
            <div className="space-y-3">
              <ExperienceBlockToggle
                label="Đánh giá & bình luận"
                description="Nguồn: Module Bình luận và đánh giá"
                enabled={config.showRating}
                onChange={() => setConfig(prev => ({ ...prev, showRating: !prev.showRating }))}
                color="bg-cyan-500"
                disabled={!commentsModule?.enabled}
              />

              <ExperienceBlockToggle
                label="Nút yêu thích (Wishlist)"
                description="Nguồn: Module Sản phẩm yêu thích"
                enabled={config.showWishlist}
                onChange={() => setConfig(prev => ({ ...prev, showWishlist: !prev.showWishlist }))}
                color="bg-cyan-500"
                disabled={!wishlistModule?.enabled}
              />

              <ExperienceBlockToggle
                label="CTA Thêm vào giỏ"
                description="Nguồn: Module Giỏ hàng & Đơn hàng"
                enabled={config.showAddToCart}
                onChange={() => setConfig(prev => ({ ...prev, showAddToCart: !prev.showAddToCart }))}
                color="bg-cyan-500"
                disabled={!cartModule?.enabled || !ordersModule?.enabled}
              />

              <ExperienceBlockToggle
                label="Tiện ích Classic Highlights"
                description="Áp dụng cho layout Classic"
                enabled={config.showClassicHighlights}
                onChange={() => setConfig(prev => ({ ...prev, showClassicHighlights: !prev.showClassicHighlights }))}
                color="bg-cyan-500"
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
                enabled={commentsModule?.enabled ?? false}
                href="/system/modules/comments"
                icon={MessageSquare}
                title="Bình luận & đánh giá"
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
            </CardContent>
          </Card>

          <ExperienceHintCard hints={HINTS} />
        </div>
      </div>
    </div>
  );
}
