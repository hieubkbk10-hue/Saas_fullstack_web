'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { toast } from 'sonner';
import { ExternalLink, MessageSquare, Package, ShoppingCart, Heart, LayoutTemplate } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, cn } from '@/app/admin/components/ui';
import { ModuleHeader, SettingsCard, SettingSelect, ToggleSwitch } from '@/components/modules/shared';

type ProductsDetailStyle = 'classic' | 'modern' | 'minimal';

type ProductDetailExperienceConfig = {
  layoutStyle: ProductsDetailStyle;
  showAddToCart: boolean;
  showClassicHighlights: boolean;
  showRating: boolean;
  showWishlist: boolean;
};

const EXPERIENCE_GROUP = 'experience';
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

export default function ProductDetailExperiencePage() {
  const experienceSetting = useQuery(api.settings.getByKey, { key: EXPERIENCE_KEY });
  const detailStyleSetting = useQuery(api.settings.getByKey, { key: 'products_detail_style' });
  const classicHighlightsEnabledSetting = useQuery(api.settings.getByKey, { key: 'products_detail_classic_highlights_enabled' });
  const commentsModule = useQuery(api.admin.modules.getModuleByKey, { key: 'comments' });
  const wishlistModule = useQuery(api.admin.modules.getModuleByKey, { key: 'wishlist' });
  const cartModule = useQuery(api.admin.modules.getModuleByKey, { key: 'cart' });
  const ordersModule = useQuery(api.admin.modules.getModuleByKey, { key: 'orders' });

  const setMultipleSettings = useMutation(api.settings.setMultiple);

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

  const [config, setConfig] = useState<ProductDetailExperienceConfig>(DEFAULT_CONFIG);
  const [isSaving, setIsSaving] = useState(false);

  const isLoading = experienceSetting === undefined || detailStyleSetting === undefined || classicHighlightsEnabledSetting === undefined;

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
      if (config.layoutStyle !== serverDetailStyle) {
        settingsToSave.push({ group: 'products', key: 'products_detail_style', value: config.layoutStyle });
      }
      if (config.showClassicHighlights !== serverClassicHighlightsEnabled) {
        settingsToSave.push({ group: 'products', key: 'products_detail_classic_highlights_enabled', value: config.showClassicHighlights });
      }
      await setMultipleSettings({ settings: settingsToSave });
      toast.success('Đã lưu cấu hình trải nghiệm');
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
              onChange={(value) =>{  setConfig(prev => ({ ...prev, layoutStyle: value as ProductsDetailStyle })); }}
              options={DETAIL_STYLES.map(style => ({ label: `${style.label} - ${style.description}`, value: style.id }))}
              focusColor="focus:border-cyan-500"
            />
          </SettingsCard>

          <Card className="p-4">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">Khối hiển thị</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Đánh giá & bình luận</p>
                  <p className="text-xs text-slate-500">Nguồn: Module Bình luận và đánh giá</p>
                </div>
                <ToggleSwitch
                  enabled={config.showRating}
                  onChange={() =>{  setConfig(prev => ({ ...prev, showRating: !prev.showRating })); }}
                  color="bg-cyan-500"
                  disabled={!commentsModule?.enabled}
                />
              </div>

              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Nút yêu thích (Wishlist)</p>
                  <p className="text-xs text-slate-500">Nguồn: Module Sản phẩm yêu thích</p>
                </div>
                <ToggleSwitch
                  enabled={config.showWishlist}
                  onChange={() =>{  setConfig(prev => ({ ...prev, showWishlist: !prev.showWishlist })); }}
                  color="bg-cyan-500"
                  disabled={!wishlistModule?.enabled}
                />
              </div>

              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200">CTA Thêm vào giỏ</p>
                  <p className="text-xs text-slate-500">Nguồn: Module Giỏ hàng & Đơn hàng</p>
                </div>
                <ToggleSwitch
                  enabled={config.showAddToCart}
                  onChange={() =>{  setConfig(prev => ({ ...prev, showAddToCart: !prev.showAddToCart })); }}
                  color="bg-cyan-500"
                  disabled={!cartModule?.enabled || !ordersModule?.enabled}
                />
              </div>

              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Tiện ích Classic Highlights</p>
                  <p className="text-xs text-slate-500">Áp dụng cho layout Classic</p>
                </div>
                <ToggleSwitch
                  enabled={config.showClassicHighlights}
                  onChange={() =>{  setConfig(prev => ({ ...prev, showClassicHighlights: !prev.showClassicHighlights })); }}
                  color="bg-cyan-500"
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
                <p className="text-slate-500">Hiển thị rating</p>
                <p className="font-semibold text-slate-900 dark:text-slate-100">{config.showRating ? 'Bật' : 'Tắt'}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 rounded-md p-3">
                <p className="text-slate-500">Wishlist</p>
                <p className="font-semibold text-slate-900 dark:text-slate-100">{config.showWishlist ? 'Bật' : 'Tắt'}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 rounded-md p-3">
                <p className="text-slate-500">CTA giỏ hàng</p>
                <p className="font-semibold text-slate-900 dark:text-slate-100">{config.showAddToCart ? 'Bật' : 'Tắt'}</p>
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
                enabled={commentsModule?.enabled ?? false}
                href="/system/modules/comments"
                icon={MessageSquare}
                title="Bình luận & đánh giá"
              />
              <ModuleLink
                enabled={wishlistModule?.enabled ?? false}
                href="/system/modules/wishlist"
                icon={Heart}
                title="Sản phẩm yêu thích"
              />
              <ModuleLink
                enabled={cartModule?.enabled ?? false}
                href="/system/modules/cart"
                icon={ShoppingCart}
                title="Giỏ hàng"
              />
              <ModuleLink
                enabled={ordersModule?.enabled ?? false}
                href="/system/modules/orders"
                icon={Package}
                title="Đơn hàng"
              />
            </CardContent>
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Gợi ý quan sát</h3>
            <ul className="text-xs text-slate-500 space-y-1">
              <li>• Ưu tiên bật module trước khi bật toggle liên quan.</li>
              <li>• Layout Classic sẽ dùng Highlights theo toggle ở đây.</li>
              <li>• Có thể kiểm tra UI tại đường dẫn sản phẩm thật.</li>
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
        'flex items-center justify-between gap-3 rounded-md border border-slate-200 dark:border-slate-800 px-3 py-2 text-sm transition-colors',
        enabled
          ? 'hover:border-cyan-500/60 hover:text-cyan-600 dark:hover:text-cyan-400'
          : 'opacity-60'
      )}
    >
      <div className="flex items-center gap-2">
        <Icon size={16} />
        <span>{title}</span>
      </div>
      <span className={cn('text-[10px] px-2 py-0.5 rounded-full', enabled ? 'bg-emerald-500/10 text-emerald-600' : 'bg-slate-200 text-slate-500')}>{enabled ? 'Đang bật' : 'Đang tắt'}</span>
      <ExternalLink size={14} className="text-slate-400" />
    </Link>
  );
}
