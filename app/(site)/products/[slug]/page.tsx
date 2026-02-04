'use client';

import React, { use, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useMutation, useQuery } from 'convex/react';
import { useRouter } from 'next/navigation';
import { api } from '@/convex/_generated/api';
import { useBrandColor } from '@/components/site/hooks';
import { useCustomerAuth } from '@/app/(site)/auth/context';
import { notifyAddToCart, useCart } from '@/lib/cart';
import { useCartConfig, useCheckoutConfig } from '@/lib/experiences';
import { ArrowLeft, Award, BadgeCheck, Bell, Bolt, Calendar, Camera, Check, CheckCircle2, ChevronRight, Clock, CreditCard, Gift, Globe, Heart, HeartHandshake, Leaf, Lock, MapPin, Minus, Package, Phone, Plus, RotateCcw, Share2, Shield, ShoppingBag, ShoppingCart, Star, ThumbsUp, Truck } from 'lucide-react';
import type { Id } from '@/convex/_generated/dataModel';

type ProductDetailStyle = 'classic' | 'modern' | 'minimal';
type ModernHeroStyle = 'full' | 'split' | 'minimal';
type MinimalContentWidth = 'narrow' | 'medium' | 'wide';

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
  heroStyle: ModernHeroStyle;
};

type MinimalLayoutConfig = {
  showRating: boolean;
  showWishlist: boolean;
  showAddToCart: boolean;
  contentWidth: MinimalContentWidth;
};

type ProductDetailExperienceConfig = {
  layoutStyle: ProductDetailStyle;
  showAddToCart: boolean;
  showClassicHighlights: boolean;
  showRating: boolean;
  showWishlist: boolean;
  showBuyNow: boolean;
  heroStyle: ModernHeroStyle;
  contentWidth: MinimalContentWidth;
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
interface ClassicHighlightItem { icon: ClassicHighlightIcon; text: string }

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

const DEFAULT_CLASSIC_HIGHLIGHTS: ClassicHighlightItem[] = [
  { icon: 'Truck', text: 'Giao hàng nhanh' },
  { icon: 'Shield', text: 'Bảo hành chính hãng' },
  { icon: 'RotateCcw', text: 'Đổi trả 30 ngày' },
];

function useProductDetailExperienceConfig(): ProductDetailExperienceConfig {
  const experienceSetting = useQuery(api.settings.getByKey, { key: 'product_detail_ui' });
  const detailStyleSetting = useQuery(api.settings.getByKey, { key: 'products_detail_style' });
  const highlightsSetting = useQuery(api.settings.getByKey, { key: 'products_detail_classic_highlights_enabled' });
  const cartModule = useQuery(api.admin.modules.getModuleByKey, { key: 'cart' });
  const ordersModule = useQuery(api.admin.modules.getModuleByKey, { key: 'orders' });

  const legacyStyle = (detailStyleSetting?.value as ProductDetailStyle) || 'classic';
  const legacyHighlightsEnabled = (highlightsSetting?.value as boolean) ?? true;
  const cartAvailable = (cartModule?.enabled ?? false) && (ordersModule?.enabled ?? false);

  return useMemo(() => {
    const raw = experienceSetting?.value as Partial<{
      layoutStyle: ProductDetailStyle;
      layouts: Partial<Record<ProductDetailStyle, Partial<ClassicLayoutConfig & ModernLayoutConfig & MinimalLayoutConfig>>>;
      showAddToCart: boolean;
      showClassicHighlights: boolean;
      showHighlights: boolean;
      showRating: boolean;
      showWishlist: boolean;
      showBuyNow: boolean;
      heroStyle: ModernHeroStyle;
      contentWidth: MinimalContentWidth;
    }> | undefined;
    const layoutStyle = raw?.layoutStyle ?? legacyStyle;
    const layoutConfig = raw?.layouts?.[layoutStyle];
    const configShowAddToCart = layoutConfig?.showAddToCart ?? raw?.showAddToCart ?? true;
    const layoutHighlights = layoutStyle === 'classic'
      ? (layoutConfig as Partial<ClassicLayoutConfig>)?.showClassicHighlights
      : undefined;
    const legacyLayoutHighlights = layoutStyle === 'classic'
      ? (layoutConfig as Partial<Record<'showHighlights', boolean>>)?.showHighlights
      : undefined;
    return {
      layoutStyle,
      showAddToCart: configShowAddToCart && cartAvailable,
      showClassicHighlights: layoutHighlights ?? legacyLayoutHighlights ?? raw?.showClassicHighlights ?? raw?.showHighlights ?? legacyHighlightsEnabled,
      showRating: layoutConfig?.showRating ?? raw?.showRating ?? true,
      showWishlist: layoutConfig?.showWishlist ?? raw?.showWishlist ?? true,
      showBuyNow: raw?.showBuyNow ?? true,
      heroStyle: layoutStyle === 'modern'
        ? (layoutConfig as Partial<ModernLayoutConfig>)?.heroStyle ?? raw?.heroStyle ?? 'full'
        : 'full',
      contentWidth: layoutStyle === 'minimal'
        ? (layoutConfig as Partial<MinimalLayoutConfig>)?.contentWidth ?? raw?.contentWidth ?? 'medium'
        : 'medium',
    };
  }, [experienceSetting?.value, legacyHighlightsEnabled, legacyStyle, cartAvailable]);
}

function useClassicHighlightsEnabled(): boolean {
  const setting = useQuery(api.settings.getByKey, { key: 'products_detail_classic_highlights_enabled' });
  return (setting?.value as boolean) ?? true;
}

type RatingSummary = { average: number | null; count: number };

function useProductRatingSummary(productId?: Id<"products">, enabled?: boolean): RatingSummary {
  const ratingsPage = useQuery(
    api.comments.listByTarget,
    productId && enabled
      ? { paginationOpts: { cursor: null, numItems: 50 }, status: 'Approved', targetId: productId, targetType: 'product' }
      : 'skip'
  );

  return useMemo(() => {
    const ratings = ratingsPage?.page
      .map(item => item.rating)
      .filter((value): value is number => typeof value === 'number');
    if (!ratings || ratings.length === 0) {
      return { average: null, count: 0 };
    }
    const sum = ratings.reduce((acc, value) => acc + value, 0);
    return { average: sum / ratings.length, count: ratings.length };
  }, [ratingsPage?.page]);
}

function normalizeClassicHighlights(value: unknown): ClassicHighlightItem[] {
  if (!Array.isArray(value)) {
    return DEFAULT_CLASSIC_HIGHLIGHTS;
  }
  const normalized = value
    .filter((item): item is { icon: unknown; text: unknown } => typeof item === 'object' && item !== null && 'icon' in item && 'text' in item)
    .map((item) => {
      const icon = typeof item.icon === 'string' && item.icon in CLASSIC_HIGHLIGHT_ICON_MAP
        ? (item.icon as ClassicHighlightIcon)
        : null;
      const text = typeof item.text === 'string' ? item.text.trim() : '';
      if (!icon || text.length === 0) {return null;}
      return { icon, text } satisfies ClassicHighlightItem;
    })
    .filter((item): item is ClassicHighlightItem => item !== null);

  return normalized.length > 0 ? normalized : DEFAULT_CLASSIC_HIGHLIGHTS;
}

function useClassicHighlights(): ClassicHighlightItem[] {
  const setting = useQuery(api.settings.getByKey, { key: 'products_detail_classic_highlights' });
  return useMemo(() => normalizeClassicHighlights(setting?.value), [setting?.value]);
}

function useEnabledProductFields(): Set<string> {
  const fields = useQuery(api.admin.modules.listEnabledModuleFields, { moduleKey: 'products' });
  return useMemo(() => {
    if (!fields) {return new Set<string>();}
    return new Set(fields.map(f => f.fieldKey));
  }, [fields]);
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function ProductDetailPage({ params }: PageProps) {
  const { slug } = use(params);
  const brandColor = useBrandColor();
  const experienceConfig = useProductDetailExperienceConfig();
  const classicHighlights = useClassicHighlights();
  const classicHighlightsEnabled = useClassicHighlightsEnabled() && experienceConfig.showClassicHighlights;
  const enabledFields = useEnabledProductFields();
  const { customer, isAuthenticated, openLoginModal } = useCustomerAuth();
  const { addItem, openDrawer } = useCart();
  const cartConfig = useCartConfig();
  const checkoutConfig = useCheckoutConfig();
  const router = useRouter();
  const wishlistModule = useQuery(api.admin.modules.getModuleByKey, { key: 'wishlist' });
  const ordersModule = useQuery(api.admin.modules.getModuleByKey, { key: 'orders' });
  const toggleWishlist = useMutation(api.wishlist.toggle);
  
  const product = useQuery(api.products.getBySlug, { slug });
  const category = useQuery(
    api.productCategories.getById,
    product?.categoryId ? { id: product.categoryId } : 'skip'
  );
  
  const relatedProducts = useQuery(
    api.products.searchPublished,
    product?.categoryId ? { categoryId: product.categoryId, limit: 4 } : 'skip'
  );

  const wishlistStatus = useQuery(
    api.wishlist.isInWishlist,
    isAuthenticated && customer && product?._id && (wishlistModule?.enabled ?? false)
      ? { customerId: customer.id as Id<'customers'>, productId: product._id }
      : 'skip'
  );
  const isWishlisted = wishlistStatus ?? false;
  const canUseWishlist = experienceConfig.showWishlist && (wishlistModule?.enabled ?? false);

  const handleWishlistToggle = async () => {
    if (!isAuthenticated || !customer || !product?._id) {
      openLoginModal();
      return;
    }
    await toggleWishlist({ customerId: customer.id as Id<'customers'>, productId: product._id });
  };

  const handleAddToCart = async (quantity: number) => {
    if (!product?._id) {
      return;
    }
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }
    await addItem(product._id, quantity);
    notifyAddToCart();
    if (cartConfig.layoutStyle === 'drawer') {
      openDrawer();
    } else {
      router.push('/cart');
    }
  };

  const handleBuyNow = async (quantity: number) => {
    if (!product?._id) {
      return;
    }
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }
    router.push(`/checkout?productId=${product._id}&quantity=${quantity}`);
  };

  const canBuyNow = experienceConfig.showBuyNow && checkoutConfig.showBuyNow && (ordersModule?.enabled ?? false);

  const ratingSummary = useProductRatingSummary(product?._id, experienceConfig.showRating);

  if (product === undefined) {
    return <ProductDetailSkeleton />;
  }

  if (product === null) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-slate-100 flex items-center justify-center">
            <Package size={32} className="text-slate-400" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Không tìm thấy sản phẩm</h1>
          <p className="text-slate-500 mb-8 max-w-sm mx-auto">Sản phẩm này không tồn tại hoặc đã bị xóa.</p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-white font-medium transition-all hover:shadow-lg hover:scale-105"
            style={{ backgroundColor: brandColor }}
          >
            <ArrowLeft size={18} />
            Xem tất cả sản phẩm
          </Link>
        </div>
      </div>
    );
  }

  const filteredRelated = relatedProducts?.filter(p => p._id !== product._id).slice(0, 4) ?? [];
  const productData = { ...product, categoryName: category?.name ?? 'Sản phẩm', categorySlug: category?.slug };

  return (
    <>
      {experienceConfig.layoutStyle === 'classic' && (
        <ClassicStyle
          product={productData}
          brandColor={brandColor}
          relatedProducts={filteredRelated}
          enabledFields={enabledFields}
          highlights={classicHighlights}
          highlightsEnabled={classicHighlightsEnabled}
          ratingSummary={ratingSummary}
          showAddToCart={experienceConfig.showAddToCart}
          showRating={experienceConfig.showRating}
          showWishlist={canUseWishlist}
          showBuyNow={canBuyNow}
          isWishlisted={isWishlisted}
          onToggleWishlist={handleWishlistToggle}
          onAddToCart={handleAddToCart}
          onBuyNow={handleBuyNow}
        />
      )}
      {experienceConfig.layoutStyle === 'modern' && (
        <ModernStyle
          product={productData}
          brandColor={brandColor}
          relatedProducts={filteredRelated}
          enabledFields={enabledFields}
          ratingSummary={ratingSummary}
          showAddToCart={experienceConfig.showAddToCart}
          showRating={experienceConfig.showRating}
          showWishlist={canUseWishlist}
          showBuyNow={canBuyNow}
          heroStyle={experienceConfig.heroStyle}
          isWishlisted={isWishlisted}
          onToggleWishlist={handleWishlistToggle}
          onAddToCart={handleAddToCart}
          onBuyNow={handleBuyNow}
        />
      )}
      {experienceConfig.layoutStyle === 'minimal' && (
        <MinimalStyle
          product={productData}
          brandColor={brandColor}
          relatedProducts={filteredRelated}
          enabledFields={enabledFields}
          ratingSummary={ratingSummary}
          showAddToCart={experienceConfig.showAddToCart}
          showRating={experienceConfig.showRating}
          showWishlist={canUseWishlist}
          showBuyNow={canBuyNow}
          contentWidth={experienceConfig.contentWidth}
          isWishlisted={isWishlisted}
          onToggleWishlist={handleWishlistToggle}
          onAddToCart={handleAddToCart}
          onBuyNow={handleBuyNow}
        />
      )}
    </>
  );
}

interface ProductData {
  _id: Id<"products">;
  name: string;
  slug: string;
  sku: string;
  price: number;
  salePrice?: number;
  stock: number;
  image?: string;
  images?: string[];
  description?: string;
  categoryId: Id<"productCategories">;
  categoryName: string;
  categorySlug?: string;
}

interface RelatedProduct {
  _id: Id<"products">;
  name: string;
  slug: string;
  price: number;
  salePrice?: number;
  image?: string;
}

interface StyleProps {
  product: ProductData;
  brandColor: string;
  relatedProducts: RelatedProduct[];
  enabledFields: Set<string>;
}

interface ExperienceBlocksProps {
  ratingSummary: RatingSummary;
  showAddToCart: boolean;
  showRating: boolean;
  showWishlist: boolean;
  showBuyNow: boolean;
  isWishlisted: boolean;
  onToggleWishlist: () => void;
  onAddToCart: (quantity: number) => void;
  onBuyNow: (quantity: number) => void;
}

interface ClassicStyleProps extends StyleProps, ExperienceBlocksProps {
  highlights: ClassicHighlightItem[];
  highlightsEnabled: boolean;
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('vi-VN', { currency: 'VND', style: 'currency' }).format(price);
}

function RatingInline({ summary }: { summary: RatingSummary }) {
  const average = summary.average ?? 0;
  return (
    <div className="flex items-center gap-2 text-xs text-slate-500">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={14}
            className={star <= Math.round(average) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'}
          />
        ))}
      </div>
      {summary.average ? (
        <span>{summary.average.toFixed(1)} ({summary.count})</span>
      ) : (
        <span>Chưa có đánh giá</span>
      )}
    </div>
  );
}

// ====================================================================================
// STYLE 1: CLASSIC - Standard e-commerce product page
// ====================================================================================
function ClassicStyle({ product, brandColor, relatedProducts, enabledFields, highlights, highlightsEnabled, ratingSummary, showAddToCart, showRating, showWishlist, showBuyNow, isWishlisted, onToggleWishlist, onAddToCart, onBuyNow }: ClassicStyleProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  const showPrice = enabledFields.has('price') || enabledFields.size === 0;
  const showSalePrice = enabledFields.has('salePrice');
  const showStock = enabledFields.has('stock');
  const showDescription = enabledFields.has('description');
  const showSku = enabledFields.has('sku');

  const images = product.images?.length ? product.images : (product.image ? [product.image] : []);
  const discountPercent = product.salePrice ? Math.round((1 - product.salePrice / product.price) * 100) : 0;
  const inStock = !showStock || product.stock > 0;

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-sm text-slate-500">
            <Link href="/" className="hover:text-slate-900 transition-colors">Trang chủ</Link>
            <ChevronRight size={14} />
            <Link href="/products" className="hover:text-slate-900 transition-colors">Sản phẩm</Link>
            <ChevronRight size={14} />
            {product.categorySlug && (
              <>
                <Link href={`/products?category=${product.categorySlug}`} className="hover:text-slate-900 transition-colors">{product.categoryName}</Link>
                <ChevronRight size={14} />
              </>
            )}
            <span className="text-slate-900 font-medium truncate max-w-[200px]">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-12">
          {/* Product Images */}
          <div className="mb-8 lg:mb-0">
            <div className="aspect-square rounded-2xl overflow-hidden bg-slate-100 mb-4 relative">
              {images.length > 0 ? (
                <Image src={images[selectedImage]} alt={product.name} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center"><Package size={64} className="text-slate-300" /></div>
              )}
              {showSalePrice && product.salePrice && (
                <span className="absolute top-4 left-4 px-3 py-1.5 bg-red-500 text-white text-sm font-bold rounded-lg">-{discountPercent}%</span>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-3">
                {images.map((img, index) => (
                  <button key={index} onClick={() =>{  setSelectedImage(index); }} className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${selectedImage === index ? 'border-orange-500' : 'border-slate-200 hover:border-slate-300'}`}>
                    <Image src={img} alt="" width={80} height={80} className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <Link href={`/products?category=${product.categorySlug}`} className="inline-block px-3 py-1 text-sm font-medium rounded-full mb-4 transition-colors hover:opacity-80" style={{ backgroundColor: `${brandColor}10`, color: brandColor }}>
              {product.categoryName}
            </Link>

            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">{product.name}</h1>

            <div className="flex flex-wrap items-center gap-4 mb-6">
              {showSku && <span className="text-sm text-slate-500">SKU: <span className="font-mono">{product.sku}</span></span>}
              {showRating && <RatingInline summary={ratingSummary} />}
            </div>

            {showPrice && (
              <div className="flex items-end gap-3 mb-6">
                <span className="text-3xl font-bold" style={{ color: brandColor }}>{formatPrice(product.salePrice ?? product.price)}</span>
                {showSalePrice && product.salePrice && (
                  <>
                    <span className="text-xl text-slate-400 line-through">{formatPrice(product.price)}</span>
                    <span className="px-2 py-0.5 bg-red-100 text-red-600 text-sm font-medium rounded">Tiết kiệm {formatPrice(product.price - product.salePrice)}</span>
                  </>
                )}
              </div>
            )}

            {showStock && (
              <div className="flex items-center gap-2 mb-6">
                {product.stock > 10 ? (
                  <><Check size={18} className="text-green-500" /><span className="text-green-600 font-medium">Còn hàng</span></>
                ) : (product.stock > 0 ? (
                  <><span className="w-2 h-2 bg-orange-500 rounded-full" /><span className="text-orange-600 font-medium">Chỉ còn {product.stock} sản phẩm</span></>
                ) : (
                  <><span className="w-2 h-2 bg-red-500 rounded-full" /><span className="text-red-600 font-medium">Hết hàng</span></>
                ))}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-4 mb-8">
              <div className="flex items-center border border-slate-200 rounded-lg">
                <button onClick={() =>{  setQuantity(q => Math.max(1, q - 1)); }} className="p-3 hover:bg-slate-50 transition-colors" disabled={quantity <= 1}>
                  <Minus size={18} className={quantity <= 1 ? 'text-slate-300' : 'text-slate-600'} />
                </button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <button onClick={() =>{  setQuantity(q => Math.min(showStock ? product.stock : 99, q + 1)); }} className="p-3 hover:bg-slate-50 transition-colors" disabled={showStock && quantity >= product.stock}>
                  <Plus size={18} className={showStock && quantity >= product.stock ? 'text-slate-300' : 'text-slate-600'} />
                </button>
              </div>

              <div className="flex flex-1 flex-col gap-2">
                {showAddToCart && (
                  <button
                    className={`py-3.5 px-8 rounded-xl text-white font-semibold flex items-center justify-center gap-2 transition-all ${inStock ? 'hover:shadow-lg hover:scale-[1.02]' : 'opacity-50 cursor-not-allowed'}`}
                    style={{ backgroundColor: brandColor }}
                    disabled={!inStock}
                    onClick={() => { if (inStock) { onAddToCart(quantity); } }}
                  >
                    <ShoppingCart size={20} />
                    {inStock ? 'Thêm vào giỏ hàng' : 'Hết hàng'}
                  </button>
                )}
                {showBuyNow && (
                  <button
                    className={`py-3.5 px-8 rounded-xl font-semibold flex items-center justify-center gap-2 border transition-all ${inStock ? 'hover:bg-slate-50' : 'opacity-50 cursor-not-allowed'}`}
                    style={{ borderColor: brandColor, color: brandColor }}
                    disabled={!inStock}
                    onClick={() => { if (inStock) { onBuyNow(quantity); } }}
                  >
                    Mua ngay
                  </button>
                )}
              </div>

              {showWishlist && (
                <button
                  onClick={onToggleWishlist}
                  className={`p-3.5 rounded-xl border transition-colors group ${isWishlisted ? 'border-red-200 bg-red-50' : 'border-slate-200 hover:border-red-200 hover:bg-red-50'}`}
                  aria-label="Thêm vào yêu thích"
                >
                  <Heart size={20} className={`transition-colors ${isWishlisted ? 'text-red-500 fill-red-500' : 'text-slate-400 group-hover:text-red-500'}`} />
                </button>
              )}
              <button className="p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors">
                <Share2 size={20} className="text-slate-400" />
              </button>
            </div>

            {highlightsEnabled && highlights.length > 0 && (
              <div className="grid grid-cols-3 gap-4 p-4 bg-slate-50 rounded-xl mb-8">
                {highlights.map((item, index) => {
                  const Icon = CLASSIC_HIGHLIGHT_ICON_MAP[item.icon];
                  return (
                    <div key={`${item.icon}-${index}`} className="text-center">
                      <Icon size={24} className="mx-auto mb-2 text-slate-600" />
                      <p className="text-xs text-slate-600">{item.text}</p>
                    </div>
                  );
                })}
              </div>
            )}

            {showDescription && product.description && (
              <div className="border-t border-slate-100 pt-6">
                <h3 className="font-semibold text-slate-900 mb-4">Mô tả sản phẩm</h3>
                <div className="prose prose-slate prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: product.description }} />
              </div>
            )}
          </div>
        </div>

        <RelatedProductsSection products={relatedProducts} categorySlug={product.categorySlug} brandColor={brandColor} showPrice={enabledFields.has('price') || enabledFields.size === 0} showSalePrice={enabledFields.has('salePrice')} />

        <div className="mt-12 pt-8 border-t border-slate-100">
          <Link href="/products" className="inline-flex items-center gap-2 text-sm font-medium transition-colors hover:opacity-80" style={{ color: brandColor }}>
            <ArrowLeft size={16} /> Quay lại danh sách sản phẩm
          </Link>
        </div>
      </div>
    </div>
  );
}

// ====================================================================================
// STYLE 2: MODERN - Landing page style with hero
// ====================================================================================
function ModernStyle({ product, brandColor, relatedProducts, enabledFields, ratingSummary, showAddToCart, showRating, showWishlist, showBuyNow, heroStyle, isWishlisted, onToggleWishlist, onAddToCart, onBuyNow }: StyleProps & ExperienceBlocksProps & { heroStyle: ModernHeroStyle }) {
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const showPrice = enabledFields.has('price') || enabledFields.size === 0;
  const showSalePrice = enabledFields.has('salePrice');
  const showStock = enabledFields.has('stock');
  const showDescription = enabledFields.has('description');

  const images = product.images?.length ? product.images : (product.image ? [product.image] : []);
  const discountPercent = product.salePrice ? Math.round((1 - product.salePrice / product.price) * 100) : 0;
  const inStock = !showStock || product.stock > 0;

  const heroContainerClass = heroStyle === 'full'
    ? 'border border-slate-100 rounded-2xl bg-slate-50'
    : heroStyle === 'split'
      ? 'border border-slate-200 rounded-2xl bg-white'
      : 'border border-slate-200 rounded-xl bg-white';

  const heroImageClass = heroStyle === 'minimal'
    ? 'max-w-full max-h-full object-contain'
    : 'max-w-full max-h-full object-contain';

  const heroImageWrapperClass = heroStyle === 'split'
    ? 'aspect-square flex items-center justify-center p-6'
    : heroStyle === 'minimal'
      ? 'aspect-square flex items-center justify-center p-3'
      : 'aspect-square flex items-center justify-center p-6';

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <nav className="flex items-center justify-between gap-4">
            <div className="text-sm text-slate-400 truncate">
              <Link href="/" className="hover:text-slate-600 transition-colors">Trang chủ</Link>
              {' / '}
              <Link href="/products" className="hover:text-slate-600 transition-colors">Sản phẩm</Link>
              {' / '}
              <span className="text-slate-600">{product.name}</span>
            </div>
            <button
              type="button"
              onClick={onToggleWishlist}
              className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700"
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
              Yêu thích
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 lg:py-12">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          <div className="space-y-4">
            {heroStyle === 'split' ? (
              <div className={`overflow-hidden ${heroContainerClass}`}>
                <div className="grid md:grid-cols-2 gap-4 items-center p-4 md:p-6">
                  <div className="relative aspect-square rounded-xl bg-slate-50 flex items-center justify-center">
                    {images[selectedImageIndex] ? (
                      <Image
                        src={images[selectedImageIndex]}
                        alt={product.name}
                        width={520}
                        height={520}
                        className={heroImageClass}
                      />
                    ) : (
                      <div className="text-center">
                        <div className="bg-slate-200 rounded-lg w-48 h-48 mx-auto mb-3" />
                        <p className="text-sm text-slate-400">Chưa có hình ảnh sản phẩm</p>
                      </div>
                    )}
                  </div>
                  <div className="hidden md:flex flex-col gap-3 text-sm text-slate-500">
                    <span className="text-xs uppercase tracking-widest text-slate-400">Điểm nổi bật</span>
                    <ul className="space-y-2">
                      <li>• Thiết kế cao cấp, hoàn thiện tinh tế</li>
                      <li>• Công nghệ mới nhất, hiệu năng ổn định</li>
                      <li>• Bảo hành chính hãng toàn quốc</li>
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <div className={`overflow-hidden ${heroContainerClass}`}>
                <div className={heroImageWrapperClass}>
                  {images[selectedImageIndex] ? (
                    <Image
                      src={images[selectedImageIndex]}
                      alt={product.name}
                      width={560}
                      height={560}
                      className={heroImageClass}
                    />
                  ) : (
                    <div className="text-center">
                      <div className="bg-slate-200 rounded-lg w-64 h-64 mx-auto mb-4" />
                      <p className="text-sm text-slate-400">Chưa có hình ảnh sản phẩm</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {images.length > 0 && heroStyle !== 'minimal' && (
              <div className="grid grid-cols-3 gap-3">
                {images.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative aspect-square overflow-hidden rounded-xl border-2 transition-all ${
                      selectedImageIndex === index ? 'border-slate-900' : 'border-transparent hover:border-slate-300'
                    }`}
                  >
                    <Image src={image} alt={`${product.name} ${index + 1}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6 lg:space-y-8">
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                {product.categoryName}
              </span>
            </div>

            <h1 className="text-3xl lg:text-4xl font-light tracking-tight text-slate-900">
              {product.name}
            </h1>

            {showRating && <RatingInline summary={ratingSummary} />}

            {showPrice && (
              <div className="space-y-2">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl lg:text-4xl font-light" style={{ color: brandColor }}>
                    {formatPrice(product.salePrice ?? product.price)}
                  </span>
                  {showSalePrice && product.salePrice && (
                    <span className="text-lg text-slate-400 line-through">
                      {formatPrice(product.price)}
                    </span>
                  )}
                </div>
                {showSalePrice && product.salePrice && (
                  <span className="inline-flex items-center rounded-full bg-red-500 px-3 py-1 text-xs font-semibold text-white">
                    Giảm {discountPercent}%
                  </span>
                )}
              </div>
            )}

            <div className="h-px w-full bg-slate-100" />

            {showDescription && product.description && (
              <div
                className="text-slate-600 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Số lượng</label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() =>{  setQuantity(q => Math.max(1, q - 1)); }}
                  disabled={quantity <= 1}
                  className="h-10 w-10 border border-slate-200 rounded-full flex items-center justify-center hover:bg-slate-50 disabled:opacity-50"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <div className="w-16 text-center">
                  <span className="text-lg font-medium">{quantity}</span>
                </div>
                <button
                  type="button"
                  onClick={() =>{  setQuantity(q => Math.min(10, q + 1)); }}
                  disabled={quantity >= 10}
                  className="h-10 w-10 border border-slate-200 rounded-full flex items-center justify-center hover:bg-slate-50 disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {(showAddToCart || showBuyNow || showWishlist) && (
              <div className="space-y-3">
                {showAddToCart && (
                  <button
                    className={`w-full h-12 text-base font-semibold text-white transition-all ${inStock ? 'hover:shadow-lg hover:scale-[1.01]' : 'opacity-50 cursor-not-allowed'}`}
                    style={{ backgroundColor: brandColor }}
                    disabled={!inStock}
                    onClick={() => { if (inStock) { onAddToCart(quantity); } }}
                  >
                    <ShoppingBag className="w-5 h-5 mr-2 inline-block" />
                    {inStock ? 'Thêm vào giỏ hàng' : 'Hết hàng'}
                  </button>
                )}
                {showBuyNow && (
                  <button
                    className={`w-full h-12 text-base font-semibold border transition-all ${inStock ? 'hover:bg-slate-50' : 'opacity-50 cursor-not-allowed'}`}
                    style={{ borderColor: brandColor, color: brandColor }}
                    disabled={!inStock}
                    onClick={() => { if (inStock) { onBuyNow(quantity); } }}
                  >
                    Mua ngay
                  </button>
                )}
                {showWishlist && (
                  <button
                    type="button"
                    onClick={onToggleWishlist}
                    className="w-full h-12 text-base border border-slate-200 text-slate-700 hover:bg-slate-50"
                  >
                    <Heart className={`w-5 h-5 mr-2 inline-block ${isWishlisted ? 'fill-current text-red-500' : ''}`} />
                    {isWishlisted ? 'Đã yêu thích' : 'Thêm vào yêu thích'}
                  </button>
                )}
              </div>
            )}

            {showStock && (
              <div className="grid grid-cols-3 gap-4 pt-2">
                <div className="text-center space-y-2">
                  <div className="mx-auto w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                    <Truck className="w-4 h-4 text-slate-500" />
                  </div>
                  <p className="text-xs text-slate-500">Miễn phí vận chuyển</p>
                </div>
                <div className="text-center space-y-2">
                  <div className="mx-auto w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                    <Shield className="w-4 h-4 text-slate-500" />
                  </div>
                  <p className="text-xs text-slate-500">Bảo hành 12 tháng</p>
                </div>
                <div className="text-center space-y-2">
                  <div className="mx-auto w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                    <ShoppingBag className="w-4 h-4 text-slate-500" />
                  </div>
                  <p className="text-xs text-slate-500">Đổi trả 30 ngày</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-12 lg:mt-16">
          <div className="grid w-full grid-cols-2 gap-2">
            <div className="text-center py-3 border border-slate-200 text-sm font-medium">Mô tả</div>
            <div className="text-center py-3 border border-slate-200 text-sm font-medium">Thông tin</div>
          </div>
          <div className="mt-6 border border-slate-100 rounded-2xl p-6">
            {showDescription && product.description ? (
              <div
                className="prose prose-sm max-w-none text-slate-600"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            ) : (
              <p className="text-slate-500">Chưa có mô tả chi tiết.</p>
            )}
          </div>
        </div>

        <div className="mt-12">
          <RelatedProductsSection
            products={relatedProducts}
            categorySlug={product.categorySlug}
            brandColor={brandColor}
            showPrice={showPrice}
            showSalePrice={showSalePrice}
          />
        </div>
      </main>
    </div>
  );
}

// ====================================================================================
// STYLE 3: MINIMAL - Clean, focused design
// ====================================================================================
function MinimalStyle({ product, relatedProducts, enabledFields, ratingSummary, showAddToCart, showRating, showWishlist, showBuyNow, contentWidth, isWishlisted, onToggleWishlist, onAddToCart, onBuyNow }: StyleProps & ExperienceBlocksProps & { contentWidth: MinimalContentWidth }) {
  const [selectedImage, setSelectedImage] = useState(0);

  const showPrice = enabledFields.has('price') || enabledFields.size === 0;
  const showStock = enabledFields.has('stock');
  const showDescription = enabledFields.has('description');
  const showSku = enabledFields.has('sku');

  const images = product.images?.length ? product.images : (product.image ? [product.image] : []);
  const inStock = !showStock || product.stock > 0;

  const contentWidthClass = contentWidth === 'narrow'
    ? 'max-w-4xl'
    : contentWidth === 'wide'
      ? 'max-w-7xl'
      : 'max-w-6xl';

  return (
    <div className="min-h-screen bg-white">
      <main className={`${contentWidthClass} mx-auto px-0 md:px-6 py-10`}>
        <div className="px-6 md:px-0 mb-6">
          <nav className="flex items-center gap-2 text-xs text-slate-400">
            <Link href="/" className="hover:text-slate-600 transition-colors">Trang chủ</Link>
            <ChevronRight size={12} />
            <Link href="/products" className="hover:text-slate-600 transition-colors">Sản phẩm</Link>
            <ChevronRight size={12} />
            <span className="text-slate-600 truncate max-w-[160px]">{product.name}</span>
          </nav>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-12 min-h-[calc(100vh-4rem)]">
          <div className="lg:col-span-7 h-[60vh] lg:h-auto lg:py-0">
            <div className="lg:sticky lg:top-8 lg:h-[calc(100vh-4rem)]">
              <div className="flex flex-col-reverse md:flex-row gap-4 h-full">
                <div className="flex md:flex-col gap-4 overflow-x-auto md:overflow-y-auto no-scrollbar md:w-24 shrink-0 px-6 md:px-0">
                  {images.length > 0 ? (
                    images.map((img, index) => (
                      <button
                        key={img}
                        onClick={() =>{  setSelectedImage(index); }}
                        className={`relative aspect-square w-20 md:w-full overflow-hidden rounded-sm transition-all duration-300 ${
                          selectedImage === index ? 'ring-1 ring-black opacity-100' : 'opacity-70 hover:opacity-100'
                        }`}
                      >
                        <Image src={img} alt={product.name} fill sizes="(max-width: 768px) 80px, 96px" className="object-cover" />
                      </button>
                    ))
                  ) : (
                    <div className="w-20 h-20 bg-slate-100 rounded-sm flex items-center justify-center">
                      <Package size={20} className="text-slate-300" />
                    </div>
                  )}
                </div>

                <div className="flex-1 relative bg-slate-100 aspect-[4/5] md:aspect-auto rounded-sm overflow-hidden group">
                  {images.length > 0 ? (
                    <Image
                      src={images[selectedImage]}
                      alt={product.name}
                      fill
                      sizes="(max-width: 1024px) 100vw, 60vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package size={64} className="text-slate-300" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 px-6 py-6 lg:py-0 bg-white flex flex-col justify-center">
            <div className="mb-6">
              <h1 className="text-3xl md:text-5xl font-light text-slate-900 tracking-tight mb-4">
                {product.name}
              </h1>
              {showRating && <RatingInline summary={ratingSummary} />}
              {showPrice && (
                <p className="text-2xl text-slate-600 font-light">
                  {formatPrice(product.salePrice ?? product.price)}
                </p>
              )}
            </div>

            {(showAddToCart || showBuyNow || showWishlist) && (
              <div className="flex flex-col gap-3 mb-8 border-t border-slate-100 pt-6">
                <div className="flex gap-4">
                  {showAddToCart && (
                    <button
                      className={`flex-1 bg-black text-white h-14 uppercase tracking-wider text-sm font-medium transition-colors ${inStock ? 'hover:bg-slate-900' : 'opacity-50 cursor-not-allowed'}`}
                      disabled={!inStock}
                      onClick={() => { if (inStock) { onAddToCart(1); } }}
                    >
                      {inStock ? 'Thêm vào giỏ' : 'Hết hàng'}
                    </button>
                  )}
                  {showWishlist && (
                    <button
                      onClick={onToggleWishlist}
                      className={`w-14 h-14 border flex items-center justify-center transition-colors ${isWishlisted ? 'border-red-200 text-red-500' : 'border-slate-200 text-slate-400 hover:text-black hover:border-black'}`}
                      aria-label="Thêm vào yêu thích"
                    >
                      <Heart size={20} className={isWishlisted ? 'fill-current' : ''} />
                    </button>
                  )}
                </div>
                {showBuyNow && (
                  <button
                    className={`h-12 uppercase tracking-wider text-xs font-medium border transition-colors ${inStock ? 'hover:bg-slate-50' : 'opacity-50 cursor-not-allowed'}`}
                    style={{ borderColor: '#0f172a', color: '#0f172a' }}
                    disabled={!inStock}
                    onClick={() => { if (inStock) { onBuyNow(1); } }}
                  >
                    Mua ngay
                  </button>
                )}
              </div>
            )}

            <div className="space-y-5 pt-0 flex-1">
              {showDescription && product.description && (
                <div
                  className="text-slate-600 leading-relaxed font-light text-justify"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              )}

              <div className="space-y-3 text-sm text-slate-500 font-light">
                {showSku && product.sku && (
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <span>SKU</span>
                    <span className="font-mono text-slate-700">{product.sku}</span>
                  </div>
                )}
                {showStock && (
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <span>Tình trạng</span>
                    <span className={inStock ? 'text-emerald-600' : 'text-red-500'}>
                      {inStock ? 'Còn hàng' : 'Hết hàng'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <section className="px-6 py-16 border-t border-slate-100 mt-10">
            <h2 className="text-2xl font-light mb-8 text-center">Có thể bạn sẽ thích</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <Link key={p._id} href={`/products/${p.slug}`} className="group cursor-pointer">
                  <div className="aspect-[3/4] bg-slate-100 mb-4 overflow-hidden relative">
                    {p.image ? (
                      <Image
                        src={p.image}
                        alt={p.name}
                        fill
                        sizes="(max-width: 768px) 50vw, 25vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package size={32} className="text-slate-300" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <h3 className="text-sm font-medium text-slate-900">{p.name}</h3>
                  {showPrice && (
                    <p className="text-sm text-slate-500 mt-1">{formatPrice(p.salePrice ?? p.price)}</p>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

// Shared Related Products Section
function RelatedProductsSection({ products, categorySlug, brandColor, showPrice, showSalePrice }: { products: RelatedProduct[]; categorySlug?: string; brandColor: string; showPrice: boolean; showSalePrice: boolean }) {
  if (products.length === 0) {return null;}

  return (
    <section className="mt-16 pt-12 border-t border-slate-100">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Sản phẩm liên quan</h2>
        {categorySlug && (
          <Link href={`/products?category=${categorySlug}`} className="text-sm font-medium flex items-center gap-1 transition-colors hover:opacity-80" style={{ color: brandColor }}>
            Xem tất cả <ChevronRight size={16} />
          </Link>
        )}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {products.map((p) => (
          <Link key={p._id} href={`/products/${p.slug}`} className="group bg-white rounded-xl overflow-hidden border border-slate-100 hover:shadow-lg hover:border-slate-200 transition-all duration-300">
            <div className="aspect-square overflow-hidden bg-slate-100 relative">
              {p.image ? (
                <Image src={p.image} alt={p.name} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover group-hover:scale-110 transition-transform duration-500" />
              ) : (
                <div className="w-full h-full flex items-center justify-center"><Package size={32} className="text-slate-300" /></div>
              )}
              {showSalePrice && p.salePrice && (
                <span className="absolute top-2 left-2 px-2 py-1 bg-red-500 text-white text-xs font-semibold rounded">-{Math.round((1 - p.salePrice / p.price) * 100)}%</span>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-medium text-slate-900 line-clamp-2 group-hover:text-orange-600 transition-colors mb-2 text-sm">{p.name}</h3>
              {showPrice && (
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm" style={{ color: brandColor }}>{formatPrice(p.salePrice ?? p.price)}</span>
                  {showSalePrice && p.salePrice && <span className="text-xs text-slate-400 line-through">{formatPrice(p.price)}</span>}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function ProductDetailSkeleton() {
  return (
    <div className="min-h-screen bg-white animate-pulse">
      <div className="border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 py-3"><div className="h-4 w-64 bg-slate-200 rounded" /></div>
      </div>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-12">
          <div>
            <div className="aspect-square bg-slate-200 rounded-2xl mb-4" />
            <div className="flex gap-3">{[1, 2, 3, 4].map((i) => (<div key={i} className="w-20 h-20 bg-slate-200 rounded-lg" />))}</div>
          </div>
          <div className="mt-8 lg:mt-0 space-y-4">
            <div className="h-6 w-24 bg-slate-200 rounded-full" />
            <div className="h-10 w-full bg-slate-200 rounded" />
            <div className="h-4 w-48 bg-slate-200 rounded" />
            <div className="h-10 w-40 bg-slate-200 rounded" />
            <div className="h-12 w-full bg-slate-200 rounded-xl" />
            <div className="h-32 w-full bg-slate-200 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
