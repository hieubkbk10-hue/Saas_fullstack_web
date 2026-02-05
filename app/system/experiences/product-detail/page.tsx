'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery } from 'convex/react';
import { toast } from 'sonner';
import { api } from '@/convex/_generated/api';
import {
  AlertCircle,
  Award,
  BadgeCheck,
  Bell,
  Bolt,
  Calendar,
  Camera,
  CheckCircle2,
  Clock,
  CreditCard,
  Eye,
  Gift,
  Globe,
  Heart,
  HeartHandshake,
  LayoutTemplate,
  Leaf,
  Loader2,
  Lock,
  MapPin,
  MessageSquare,
  Package,
  Phone,
  Plus,
  RotateCcw,
  Save,
  Shield,
  ShoppingCart,
  Star,
  ThumbsUp,
  Trash2,
  Truck,
} from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from '@/app/admin/components/ui';
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
  showBuyNow: boolean;
};

type ClassicLayoutConfig = {
  showRating: boolean;
  showWishlist: boolean;
  showAddToCart: boolean;
  showClassicHighlights: boolean;
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

type ClassicHighlightIcon =
  | 'Award'
  | 'BadgeCheck'
  | 'Bell'
  | 'Bolt'
  | 'Calendar'
  | 'Camera'
  | 'CheckCircle2'
  | 'Clock'
  | 'CreditCard'
  | 'Gift'
  | 'Globe'
  | 'HeartHandshake'
  | 'Leaf'
  | 'Lock'
  | 'MapPin'
  | 'Phone'
  | 'RotateCcw'
  | 'Shield'
  | 'Star'
  | 'ThumbsUp'
  | 'Truck';

type ClassicHighlightItem = { icon: ClassicHighlightIcon; text: string };

const EXPERIENCE_KEY = 'product_detail_ui';
const LEGACY_DETAIL_STYLE_KEY = 'products_detail_style';
const LEGACY_HIGHLIGHTS_KEY = 'products_detail_classic_highlights_enabled';
const CLASSIC_HIGHLIGHTS_KEY = 'products_detail_classic_highlights';

const LAYOUT_STYLES: LayoutOption<ProductsDetailStyle>[] = [
  { description: 'Layout 2 cột với gallery và info', id: 'classic', label: 'Classic' },
  { description: 'Full-width hero, landing page style', id: 'modern', label: 'Modern' },
  { description: 'Tối giản, tập trung sản phẩm', id: 'minimal', label: 'Minimal' },
];

const DEFAULT_CONFIG: ProductDetailExperienceConfig = {
  layoutStyle: 'classic',
  layouts: {
    classic: { showRating: true, showWishlist: true, showAddToCart: true, showClassicHighlights: true },
    modern: { showRating: true, showWishlist: true, showAddToCart: true, heroStyle: 'full' },
    minimal: { showRating: true, showWishlist: true, showAddToCart: true, contentWidth: 'medium' },
  },
  showBuyNow: true,
};

const HINTS = [
  'Classic layout phù hợp shop truyền thống.',
  'Modern layout tốt cho landing page sản phẩm.',
  'Mỗi layout có config riêng - chuyển tab để chỉnh.',
  'Buy now phụ thuộc module Orders + Checkout.',
  'Có thể kiểm tra UI tại đường dẫn sản phẩm thật.',
];

const DEFAULT_CLASSIC_HIGHLIGHTS: ClassicHighlightItem[] = [
  { icon: 'Truck', text: 'Giao hàng nhanh' },
  { icon: 'Shield', text: 'Bảo hành chính hãng' },
  { icon: 'RotateCcw', text: 'Đổi trả 30 ngày' },
];

const HIGHLIGHT_ICON_OPTIONS: ClassicHighlightIcon[] = [
  'Award',
  'BadgeCheck',
  'Bell',
  'Bolt',
  'Calendar',
  'Camera',
  'CheckCircle2',
  'Clock',
  'CreditCard',
  'Gift',
  'Globe',
  'HeartHandshake',
  'Leaf',
  'Lock',
  'MapPin',
  'Phone',
  'RotateCcw',
  'Shield',
  'Star',
  'ThumbsUp',
  'Truck',
];

const CLASSIC_HIGHLIGHT_ICON_MAP: Record<ClassicHighlightIcon, React.ElementType> = {
  Award,
  BadgeCheck,
  Bell,
  Bolt,
  Calendar,
  Camera,
  CheckCircle2,
  Clock,
  CreditCard,
  Gift,
  Globe,
  HeartHandshake,
  Leaf,
  Lock,
  MapPin,
  Phone,
  RotateCcw,
  Shield,
  Star,
  ThumbsUp,
  Truck,
};

function VariantFeatureStatus({ enabled, href, moduleName }: { enabled: boolean; href: string; moduleName: string }) {
  return (
    <div className="mt-2 flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
      <div className="flex items-start gap-2">
        <span className={`mt-1 inline-flex h-2 w-2 rounded-full ${enabled ? 'bg-emerald-500' : 'bg-slate-400'}`} />
        <div>
          <p className="text-sm font-medium text-slate-700">Phiên bản sản phẩm</p>
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

const normalizeClassicHighlights = (value: unknown): ClassicHighlightItem[] => {
  if (!Array.isArray(value)) {
    return DEFAULT_CLASSIC_HIGHLIGHTS;
  }
  const normalized = value
    .filter((item): item is { icon: unknown; text: unknown } => typeof item === 'object' && item !== null && 'icon' in item && 'text' in item)
    .map((item) => {
      const icon = typeof item.icon === 'string' && HIGHLIGHT_ICON_OPTIONS.includes(item.icon as ClassicHighlightIcon)
        ? (item.icon as ClassicHighlightIcon)
        : null;
      const text = typeof item.text === 'string' ? item.text.trim() : '';
      if (!icon || text.length === 0) {
        return null;
      }
      return { icon, text } satisfies ClassicHighlightItem;
    })
    .filter((item): item is ClassicHighlightItem => item !== null);

  return normalized.length > 0 ? normalized : DEFAULT_CLASSIC_HIGHLIGHTS;
};

export default function ProductDetailExperiencePage() {
  const experienceSetting = useQuery(api.settings.getByKey, { key: EXPERIENCE_KEY });
  const legacyStyleSetting = useQuery(api.settings.getByKey, { key: LEGACY_DETAIL_STYLE_KEY });
  const legacyHighlightsSetting = useQuery(api.settings.getByKey, { key: LEGACY_HIGHLIGHTS_KEY });
  const highlightsSetting = useQuery(api.settings.getByKey, { key: CLASSIC_HIGHLIGHTS_KEY });
  const commentsModule = useQuery(api.admin.modules.getModuleByKey, { key: 'comments' });
  const wishlistModule = useQuery(api.admin.modules.getModuleByKey, { key: 'wishlist' });
  const ordersModule = useQuery(api.admin.modules.getModuleByKey, { key: 'orders' });
  const cartModule = useQuery(api.admin.modules.getModuleByKey, { key: 'cart' });
  const variantsSetting = useQuery(api.admin.modules.getModuleSetting, { moduleKey: 'products', settingKey: 'variantEnabled' });
  const exampleProductSlug = useExampleProductSlug();
  const setMultipleSettings = useMutation(api.settings.setMultiple);
  const [previewDevice, setPreviewDevice] = useState<DeviceType>('desktop');
  const [isSaving, setIsSaving] = useState(false);

  const legacyStyle = legacyStyleSetting?.value as ProductsDetailStyle | undefined;
  const legacyHighlights = (legacyHighlightsSetting?.value as boolean) ?? true;
  const serverHighlights = useMemo(
    () => normalizeClassicHighlights(highlightsSetting?.value),
    [highlightsSetting?.value]
  );
  const [classicHighlights, setClassicHighlights] = useState<ClassicHighlightItem[]>(serverHighlights);

  useEffect(() => {
    setClassicHighlights(serverHighlights);
  }, [serverHighlights]);

  const serverConfig = useMemo<ProductDetailExperienceConfig>(() => {
    const raw = experienceSetting?.value as Partial<ProductDetailExperienceConfig> | undefined;
    return {
      layoutStyle: raw?.layoutStyle ?? legacyStyle ?? DEFAULT_CONFIG.layoutStyle,
      layouts: {
        classic: { ...DEFAULT_CONFIG.layouts.classic, showClassicHighlights: legacyHighlights, ...raw?.layouts?.classic },
        modern: { ...DEFAULT_CONFIG.layouts.modern, ...raw?.layouts?.modern },
        minimal: { ...DEFAULT_CONFIG.layouts.minimal, ...raw?.layouts?.minimal },
      },
      showBuyNow: raw?.showBuyNow ?? true,
    };
  }, [experienceSetting?.value, legacyStyle, legacyHighlights]);

  const isLoading = experienceSetting === undefined || legacyStyleSetting === undefined || legacyHighlightsSetting === undefined || highlightsSetting === undefined;

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
      { group: 'products', key: LEGACY_HIGHLIGHTS_KEY, value: config.layouts.classic.showClassicHighlights ?? true },
    ];
  }, [config.layoutStyle, config.layouts.classic.showClassicHighlights]);

  const hasHighlightsChanges = useMemo(
    () => JSON.stringify(classicHighlights) !== JSON.stringify(serverHighlights),
    [classicHighlights, serverHighlights]
  );

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const settingsToSave = [
        { group: EXPERIENCE_GROUP, key: EXPERIENCE_KEY, value: config },
        { group: 'products', key: CLASSIC_HIGHLIGHTS_KEY, value: classicHighlights },
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
      showBuyNow: config.showBuyNow,
      showVariants: (variantsSetting?.value as boolean | undefined) ?? false,
      heroStyle: config.layoutStyle === 'modern'
        ? (currentLayoutConfig as ModernLayoutConfig).heroStyle
        : 'full',
      contentWidth: config.layoutStyle === 'minimal'
        ? (currentLayoutConfig as MinimalLayoutConfig).contentWidth
        : 'medium',
      showClassicHighlights: config.layoutStyle === 'classic' 
        ? (currentLayoutConfig as ClassicLayoutConfig).showClassicHighlights 
        : false,
      classicHighlights,
      device: previewDevice,
      brandColor: '#06b6d4',
    };

    return base;
  };

  const updateHighlight = (index: number, value: Partial<ClassicHighlightItem>) => {
    setClassicHighlights(prev => prev.map((item, i) => (i === index ? { ...item, ...value } : item)));
  };

  const addHighlight = () => {
    setClassicHighlights(prev => ([...prev, { icon: 'Star', text: 'Điểm nổi bật mới' }]));
  };

  const removeHighlight = (index: number) => {
    setClassicHighlights(prev => prev.filter((_, i) => i !== index));
  };

  const renderLayoutSpecificControls = () => {
    if (config.layoutStyle === 'classic') {
      const layoutConfig = currentLayoutConfig as ClassicLayoutConfig;
      return (
        <div className="space-y-3">
          <ToggleRow
            label="Highlights"
            description="Hiện tính năng nổi bật"
            checked={layoutConfig.showClassicHighlights}
            onChange={(v) => updateLayoutConfig('showClassicHighlights' as keyof typeof currentLayoutConfig, v as never)}
            accentColor="#06b6d4"
          />
          {classicHighlights.map((item, index) => {
            const Icon = CLASSIC_HIGHLIGHT_ICON_MAP[item.icon];
            return (
              <div key={`${item.icon}-${index}`} className="space-y-2 rounded-md border border-slate-200 bg-white p-2">
                <div className="grid grid-cols-6 gap-1">
                  {HIGHLIGHT_ICON_OPTIONS.map((icon) => {
                    const IconOption = CLASSIC_HIGHLIGHT_ICON_MAP[icon];
                    const isActive = icon === item.icon;
                    return (
                      <button
                        key={`${icon}-${index}`}
                        type="button"
                        aria-label={icon}
                        onClick={() => updateHighlight(index, { icon })}
                        className={`h-7 w-7 rounded border flex items-center justify-center transition-colors ${
                          isActive
                            ? 'border-cyan-500 bg-cyan-50 text-cyan-600'
                            : 'border-slate-200 text-slate-500 hover:border-slate-300'
                        }`}
                      >
                        <IconOption size={14} />
                      </button>
                    );
                  })}
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded border border-slate-200 flex items-center justify-center text-slate-600">
                    <Icon size={14} />
                  </div>
                  <Input
                    value={item.text}
                    onChange={(e) => updateHighlight(index, { text: e.target.value })}
                    className="h-8 text-xs"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeHighlight(index)}
                    className="h-8 w-8"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            );
          })}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addHighlight}
            className="gap-1.5 text-xs"
          >
            <Plus size={12} />
            Thêm highlight
          </Button>
        </div>
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
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2">
            <LayoutTemplate className="w-5 h-5 text-cyan-600" />
            <h1 className="text-2xl font-bold">Chi tiết sản phẩm</h1>
          </div>
          <Link href="/system/experiences" className="text-sm text-blue-600 hover:underline">
            Quay lại danh sách
          </Link>
        </div>
        <Button
          size="sm"
          onClick={handleSave}
          disabled={(!hasChanges && !hasHighlightsChanges) || isSaving}
          className="bg-cyan-600 hover:bg-cyan-500 gap-1.5"
        >
          {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          <span>{hasChanges || hasHighlightsChanges ? 'Lưu' : 'Đã lưu'}</span>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Thiết lập hiển thị</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <ControlCard title="Khối hiển thị">
            <ToggleRow
              label="Đánh giá"
              checked={currentLayoutConfig.showRating}
              onChange={(v) => updateLayoutConfig('showRating', v)}
              accentColor="#06b6d4"
              disabled={!commentsModule?.enabled}
            />
            <ToggleRow
              label="Wishlist"
              checked={currentLayoutConfig.showWishlist}
              onChange={(v) => updateLayoutConfig('showWishlist', v)}
              accentColor="#06b6d4"
              disabled={!wishlistModule?.enabled}
            />
            <ToggleRow
              label="Add to Cart"
              checked={currentLayoutConfig.showAddToCart}
              onChange={(v) => updateLayoutConfig('showAddToCart', v)}
              accentColor="#06b6d4"
              disabled={!cartModule?.enabled || !ordersModule?.enabled}
            />
            <ToggleRow
              label="Buy Now"
              checked={config.showBuyNow}
              onChange={(v) => setConfig(prev => ({ ...prev, showBuyNow: v }))}
              accentColor="#06b6d4"
              disabled={!ordersModule?.enabled}
            />
            <VariantFeatureStatus
              enabled={(variantsSetting?.value as boolean | undefined) ?? false}
              href="/system/modules/products"
              moduleName="module Sản phẩm"
            />
          </ControlCard>

          <ControlCard title={config.layoutStyle === 'classic' ? 'Highlights (Classic)' : `Cấu hình ${config.layoutStyle}`}>
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Link & ghi chú</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="p-2">
            {exampleProductSlug && (
              <div className="mb-2">
                <ExampleLinks
                  links={[{ label: 'Xem sản phẩm mẫu', url: `/products/${exampleProductSlug}` }]}
                  color="#06b6d4"
                  compact
                />
              </div>
            )}
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
                accentColor="#06b6d4"
              />
              <DeviceToggle value={previewDevice} onChange={setPreviewDevice} size="sm" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className={`mx-auto transition-all duration-300 ${deviceWidths[previewDevice]}`}>
            <BrowserFrame url={`yoursite.com/products/${exampleProductSlug || 'example-product'}`}>
              <ProductDetailPreview {...getPreviewProps()} />
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
