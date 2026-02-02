'use client';

import React, { useMemo, useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { toast } from 'sonner';
import { api } from '@/convex/_generated/api';
import { AlertCircle, Heart, LayoutTemplate, Loader2, MessageSquare, Package, Save, ShoppingCart } from 'lucide-react';
import { Button, Card } from '@/app/admin/components/ui';
import { 
  ExperienceModuleLink, 
  ExperienceHintCard,
  ProductDetailPreview,
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
import { useExperienceConfig, useExampleProductSlug, EXPERIENCE_GROUP, EXPERIENCE_NAMES, MESSAGES } from '@/lib/experiences';

type ProductsDetailStyle = 'classic' | 'modern' | 'minimal';

type ProductDetailExperienceConfig = {
  layoutStyle: ProductsDetailStyle;
  layouts: {
    classic: ClassicLayoutConfig;
    modern: ModernLayoutConfig;
    minimal: MinimalLayoutConfig;
  };
};

type ClassicLayoutConfig = {
  showRating: boolean;
  showWishlist: boolean;
  showAddToCart: boolean;
  showHighlights: boolean;
};

type ModernLayoutConfig = {
  showRating: boolean;
  showWishlist: boolean;
  showAddToCart: boolean;
  heroStyle: 'full' | 'split' | 'minimal';
};

type MinimalLayoutConfig = {
  showRating: boolean;
  showWishlist: boolean;
  showAddToCart: boolean;
  contentWidth: 'narrow' | 'medium' | 'wide';
};

const EXPERIENCE_KEY = 'product_detail_ui';
const LEGACY_DETAIL_STYLE_KEY = 'products_detail_style';
const LEGACY_HIGHLIGHTS_KEY = 'products_detail_classic_highlights_enabled';

const LAYOUT_STYLES: LayoutOption<ProductsDetailStyle>[] = [
  { description: 'Layout 2 cột với gallery và info', id: 'classic', label: 'Classic' },
  { description: 'Full-width hero, landing page style', id: 'modern', label: 'Modern' },
  { description: 'Tối giản, tập trung sản phẩm', id: 'minimal', label: 'Minimal' },
];

const DEFAULT_CONFIG: ProductDetailExperienceConfig = {
  layoutStyle: 'classic',
  layouts: {
    classic: { showRating: true, showWishlist: true, showAddToCart: true, showHighlights: true },
    modern: { showRating: true, showWishlist: true, showAddToCart: true, heroStyle: 'full' },
    minimal: { showRating: true, showWishlist: true, showAddToCart: true, contentWidth: 'medium' },
  },
};

const HINTS = [
  'Classic layout phù hợp shop truyền thống.',
  'Modern layout tốt cho landing page sản phẩm.',
  'Mỗi layout có config riêng - chuyển tab để chỉnh.',
  'Có thể kiểm tra UI tại đường dẫn sản phẩm thật.',
];

export default function ProductDetailExperiencePage() {
  const experienceSetting = useQuery(api.settings.getByKey, { key: EXPERIENCE_KEY });
  const legacyStyleSetting = useQuery(api.settings.getByKey, { key: LEGACY_DETAIL_STYLE_KEY });
  const legacyHighlightsSetting = useQuery(api.settings.getByKey, { key: LEGACY_HIGHLIGHTS_KEY });
  const commentsModule = useQuery(api.admin.modules.getModuleByKey, { key: 'comments' });
  const wishlistModule = useQuery(api.admin.modules.getModuleByKey, { key: 'wishlist' });
  const ordersModule = useQuery(api.admin.modules.getModuleByKey, { key: 'orders' });
  const cartModule = useQuery(api.admin.modules.getModuleByKey, { key: 'cart' });
  const exampleProductSlug = useExampleProductSlug();
  const setMultipleSettings = useMutation(api.settings.setMultiple);
  const [previewDevice, setPreviewDevice] = useState<DeviceType>('desktop');
  const [isPanelExpanded, setIsPanelExpanded] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const legacyStyle = legacyStyleSetting?.value as ProductsDetailStyle | undefined;
  const legacyHighlights = (legacyHighlightsSetting?.value as boolean) ?? true;

  const serverConfig = useMemo<ProductDetailExperienceConfig>(() => {
    const raw = experienceSetting?.value as Partial<ProductDetailExperienceConfig> | undefined;
    return {
      layoutStyle: raw?.layoutStyle ?? legacyStyle ?? DEFAULT_CONFIG.layoutStyle,
      layouts: {
        classic: { ...DEFAULT_CONFIG.layouts.classic, showHighlights: legacyHighlights, ...raw?.layouts?.classic },
        modern: { ...DEFAULT_CONFIG.layouts.modern, ...raw?.layouts?.modern },
        minimal: { ...DEFAULT_CONFIG.layouts.minimal, ...raw?.layouts?.minimal },
      },
    };
  }, [experienceSetting?.value, legacyStyle, legacyHighlights]);

  const isLoading = experienceSetting === undefined || legacyStyleSetting === undefined || legacyHighlightsSetting === undefined;

  const { config, setConfig, hasChanges } = useExperienceConfig(serverConfig, DEFAULT_CONFIG, isLoading);

  const currentLayoutConfig = config.layouts[config.layoutStyle];

  const updateLayoutConfig = <K extends keyof typeof currentLayoutConfig>(
    key: K,
    value: (typeof currentLayoutConfig)[K]
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

  const additionalSettings = useMemo(() => {
    return [
      { group: 'products', key: LEGACY_DETAIL_STYLE_KEY, value: config.layoutStyle },
      { group: 'products', key: LEGACY_HIGHLIGHTS_KEY, value: config.layouts.classic.showHighlights },
    ];
  }, [config.layoutStyle, config.layouts.classic.showHighlights]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const settingsToSave = [
        { group: EXPERIENCE_GROUP, key: EXPERIENCE_KEY, value: config },
        ...additionalSettings,
      ];
      await setMultipleSettings({ settings: settingsToSave });
      toast.success(MESSAGES.saveSuccess(EXPERIENCE_NAMES[EXPERIENCE_KEY]));
    } catch {
      toast.error(MESSAGES.saveError);
    } finally {
      setIsSaving(false);
    }
  };

  const getPreviewProps = () => {
    const base = {
      layoutStyle: config.layoutStyle,
      showRating: currentLayoutConfig.showRating,
      showWishlist: currentLayoutConfig.showWishlist,
      showAddToCart: currentLayoutConfig.showAddToCart,
      showClassicHighlights: config.layoutStyle === 'classic' 
        ? (currentLayoutConfig as ClassicLayoutConfig).showHighlights 
        : false,
    };

    return base;
  };

  const renderLayoutSpecificControls = () => {
    if (config.layoutStyle === 'classic') {
      const layoutConfig = currentLayoutConfig as ClassicLayoutConfig;
      return (
        <ToggleRow
          label="Highlights"
          description="Hiện tính năng nổi bật"
          checked={layoutConfig.showHighlights}
          onChange={(v) => updateLayoutConfig('showHighlights' as keyof typeof currentLayoutConfig, v as never)}
          accentColor="#06b6d4"
        />
      );
    }
    if (config.layoutStyle === 'modern') {
      const layoutConfig = currentLayoutConfig as ModernLayoutConfig;
      return (
        <SelectRow
          label="Hero Style"
          value={layoutConfig.heroStyle}
          options={[
            { label: 'Full Width', value: 'full' },
            { label: 'Split Layout', value: 'split' },
            { label: 'Minimal', value: 'minimal' },
          ]}
          onChange={(v) => updateLayoutConfig('heroStyle' as keyof typeof currentLayoutConfig, v as never)}
        />
      );
    }
    if (config.layoutStyle === 'minimal') {
      const layoutConfig = currentLayoutConfig as MinimalLayoutConfig;
      return (
        <SelectRow
          label="Content Width"
          value={layoutConfig.contentWidth}
          options={[
            { label: 'Narrow', value: 'narrow' },
            { label: 'Medium', value: 'medium' },
            { label: 'Wide', value: 'wide' },
          ]}
          onChange={(v) => updateLayoutConfig('contentWidth' as keyof typeof currentLayoutConfig, v as never)}
        />
      );
    }
    return null;
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
      {/* Header */}
      <header className="flex-shrink-0 px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-white dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-500/10 rounded-lg">
            <LayoutTemplate className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">Trải nghiệm: Chi tiết sản phẩm</h1>
            <p className="text-xs text-slate-500">/products/[slug] • Layout-specific config</p>
          </div>
        </div>
        <Button
          onClick={handleSave}
          disabled={!hasChanges || isSaving}
          className="bg-cyan-600 hover:bg-cyan-500 gap-2"
        >
          {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {hasChanges ? 'Lưu thay đổi' : 'Đã lưu'}
        </Button>
      </header>

      {/* Preview Area */}
      <main className="flex-1 overflow-auto p-6 bg-slate-50 dark:bg-slate-950">
        <div className="flex justify-center mb-4">
          <DeviceToggle value={previewDevice} onChange={setPreviewDevice} />
        </div>
        <div className={`mx-auto transition-all duration-300 ${deviceWidths[previewDevice]}`}>
          <BrowserFrame url={`yoursite.com/products/${exampleProductSlug || 'example-product'}`} maxHeight="calc(100vh - 380px)">
            <ProductDetailPreview {...getPreviewProps()} />
          </BrowserFrame>
        </div>
        <div className="mt-3 text-xs text-slate-500 text-center">
          Layout: <strong>{LAYOUT_STYLES.find(s => s.id === config.layoutStyle)?.label}</strong>
          {' • '}{previewDevice === 'desktop' ? '1920px' : (previewDevice === 'tablet' ? '768px' : '375px')}
        </div>
      </main>

      {/* Bottom Panel */}
      <ConfigPanel
        isExpanded={isPanelExpanded}
        onToggle={() => setIsPanelExpanded(!isPanelExpanded)}
        expandedHeight="320px"
        leftContent={
          <LayoutTabs
            layouts={LAYOUT_STYLES}
            activeLayout={config.layoutStyle}
            onChange={(layout) => setConfig(prev => ({ ...prev, layoutStyle: layout }))}
            accentColor="#06b6d4"
          />
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <ControlCard title="Khối hiển thị">
            <ToggleRow
              label="Đánh giá"
              description="Rating & Reviews"
              checked={currentLayoutConfig.showRating}
              onChange={(v) => updateLayoutConfig('showRating', v)}
              accentColor="#06b6d4"
              disabled={!commentsModule?.enabled}
            />
            <ToggleRow
              label="Wishlist"
              description="Nút yêu thích"
              checked={currentLayoutConfig.showWishlist}
              onChange={(v) => updateLayoutConfig('showWishlist', v)}
              accentColor="#06b6d4"
              disabled={!wishlistModule?.enabled}
            />
            <ToggleRow
              label="Add to Cart"
              description="CTA thêm vào giỏ"
              checked={currentLayoutConfig.showAddToCart}
              onChange={(v) => updateLayoutConfig('showAddToCart', v)}
              accentColor="#06b6d4"
              disabled={!cartModule?.enabled || !ordersModule?.enabled}
            />
          </ControlCard>

          <ControlCard title={`Cấu hình ${config.layoutStyle}`}>
            {renderLayoutSpecificControls()}
          </ControlCard>

          <ControlCard title="Module liên quan">
            {(!commentsModule?.enabled || !wishlistModule?.enabled || !cartModule?.enabled) && (
              <div className="flex items-start gap-2 p-2 bg-amber-50 dark:bg-amber-500/10 rounded-lg text-xs text-amber-700 dark:text-amber-300 mb-2">
                <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                <span>Một số module chưa bật.</span>
              </div>
            )}
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
          </ControlCard>

          <Card className="p-3">
            {exampleProductSlug && (
              <div className="mb-3">
                <ExampleLinks
                  links={[{ label: 'Xem sản phẩm mẫu', url: `/products/${exampleProductSlug}` }]}
                  color="#06b6d4"
                  compact
                />
              </div>
            )}
            <ExperienceHintCard hints={HINTS} />
          </Card>
        </div>
      </ConfigPanel>
    </div>
  );
}
