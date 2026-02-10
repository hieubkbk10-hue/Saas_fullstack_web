'use client';

import React, { use, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useMutation, useQuery } from 'convex/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { api } from '@/convex/_generated/api';
import { useBrandColor } from '@/components/site/hooks';
import { useCustomerAuth } from '@/app/(site)/auth/context';
import { notifyAddToCart, useCart } from '@/lib/cart';
import { useCartConfig, useCheckoutConfig } from '@/lib/experiences';
import { ArrowLeft, Award, BadgeCheck, Bell, Bolt, Calendar, Camera, Check, CheckCircle2, ChevronRight, Clock, CreditCard, Gift, Globe, Heart, HeartHandshake, Leaf, Lock, MapPin, MessageSquare, Minus, Package, Phone, Plus, Reply, RotateCcw, Share2, Shield, ShoppingBag, ShoppingCart, Star, ThumbsUp, Truck } from 'lucide-react';
import { VariantSelector, type VariantSelectorOption } from '@/components/products/VariantSelector';
import type { Id } from '@/convex/_generated/dataModel';

type ProductDetailStyle = 'classic' | 'modern' | 'minimal';
type ModernHeroStyle = 'full' | 'split' | 'minimal';
type MinimalContentWidth = 'narrow' | 'medium' | 'wide';
type ProductsSaleMode = 'cart' | 'contact' | 'affiliate';

type ClassicLayoutConfig = {
  showRating: boolean;
  showComments: boolean;
  showCommentLikes: boolean;
  showCommentReplies: boolean;
  showWishlist: boolean;
  showAddToCart: boolean;
  showClassicHighlights: boolean;
};

type ModernLayoutConfig = {
  showRating: boolean;
  showComments: boolean;
  showCommentLikes: boolean;
  showCommentReplies: boolean;
  showWishlist: boolean;
  showAddToCart: boolean;
  heroStyle: ModernHeroStyle;
};

type MinimalLayoutConfig = {
  showRating: boolean;
  showComments: boolean;
  showCommentLikes: boolean;
  showCommentReplies: boolean;
  showWishlist: boolean;
  showAddToCart: boolean;
  contentWidth: MinimalContentWidth;
};

type ProductDetailExperienceConfig = {
  layoutStyle: ProductDetailStyle;
  showAddToCart: boolean;
  showClassicHighlights: boolean;
  showRating: boolean;
  showComments: boolean;
  showCommentLikes: boolean;
  showCommentReplies: boolean;
  showWishlist: boolean;
  showBuyNow: boolean;
  heroStyle: ModernHeroStyle;
  contentWidth: MinimalContentWidth;
};

type ProductVariantOptionValue = {
  optionId: Id<'productOptions'>;
  valueId: Id<'productOptionValues'>;
  customValue?: string;
};

type ProductVariant = {
  _id: Id<'productVariants'>;
  optionValues: ProductVariantOptionValue[];
  price?: number;
  salePrice?: number;
  stock?: number;
  sku: string;
  image?: string;
  images?: string[];
};

type ProductOption = {
  _id: Id<'productOptions'>;
  name: string;
  order: number;
  displayType: VariantSelectorOption['displayType'];
  inputType?: VariantSelectorOption['inputType'];
};

type ProductOptionValue = {
  _id: Id<'productOptionValues'>;
  optionId: Id<'productOptions'>;
  order: number;
  value: string;
  label?: string;
  colorCode?: string;
  image?: string;
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
      showComments: boolean;
      showCommentLikes: boolean;
      showCommentReplies: boolean;
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
    const layoutComments = layoutConfig as Partial<ClassicLayoutConfig & ModernLayoutConfig & MinimalLayoutConfig> | undefined;
    const showComments = layoutComments?.showComments ?? raw?.showComments ?? true;
    const showCommentLikes = layoutComments?.showCommentLikes ?? raw?.showCommentLikes ?? true;
    const showCommentReplies = layoutComments?.showCommentReplies ?? raw?.showCommentReplies ?? true;
    return {
      layoutStyle,
      showAddToCart: configShowAddToCart && cartAvailable,
      showClassicHighlights: layoutHighlights ?? legacyLayoutHighlights ?? raw?.showClassicHighlights ?? raw?.showHighlights ?? legacyHighlightsEnabled,
      showRating: layoutConfig?.showRating ?? raw?.showRating ?? true,
      showComments,
      showCommentLikes,
      showCommentReplies,
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
  const commentsModule = useQuery(api.admin.modules.getModuleByKey, { key: 'comments' });
  const commentsLikesFeature = useQuery(api.admin.modules.getModuleFeature, { featureKey: 'enableLikes', moduleKey: 'comments' });
  const commentsRepliesFeature = useQuery(api.admin.modules.getModuleFeature, { featureKey: 'enableReplies', moduleKey: 'comments' });
  const commentsSettings = useQuery(api.admin.modules.listModuleSettings, { moduleKey: 'comments' });
  const saleModeSetting = useQuery(api.admin.modules.getModuleSetting, { moduleKey: 'products', settingKey: 'saleMode' });
  const wishlistModule = useQuery(api.admin.modules.getModuleByKey, { key: 'wishlist' });
  const ordersModule = useQuery(api.admin.modules.getModuleByKey, { key: 'orders' });
  const toggleWishlist = useMutation(api.wishlist.toggle);
  const createComment = useMutation(api.comments.create);
  const incrementLike = useMutation(api.comments.incrementLike);
  const decrementLike = useMutation(api.comments.decrementLike);
  
  const product = useQuery(api.products.getBySlug, { slug });
  const category = useQuery(
    api.productCategories.getById,
    product?.categoryId ? { id: product.categoryId } : 'skip'
  );
  
  const relatedProducts = useQuery(
    api.products.searchPublished,
    product?.categoryId ? { categoryId: product.categoryId, limit: 4 } : 'skip'
  );

  const variants = useQuery(
    api.productVariants.listByProductActive,
    product?._id && product?.hasVariants ? { productId: product._id } : 'skip'
  );

  const variantOptionIds = useMemo(() => {
    if (!variants || variants.length === 0) {
      return [] as Id<'productOptions'>[];
    }
    const ids = new Set<Id<'productOptions'>>();
    variants.forEach((variant) => variant.optionValues.forEach((item) => ids.add(item.optionId)));
    return Array.from(ids);
  }, [variants]);

  const variantValueIds = useMemo(() => {
    if (!variants || variants.length === 0) {
      return [] as Id<'productOptionValues'>[];
    }
    const ids = new Set<Id<'productOptionValues'>>();
    variants.forEach((variant) => variant.optionValues.forEach((item) => ids.add(item.valueId)));
    return Array.from(ids);
  }, [variants]);

  const variantOptionsSource = useQuery(
    api.productOptions.listByIds,
    variantOptionIds.length > 0 ? { ids: variantOptionIds } : 'skip'
  );

  const variantValuesSource = useQuery(
    api.productOptionValues.listByIds,
    variantValueIds.length > 0 ? { ids: variantValueIds } : 'skip'
  );

  const variantOptions = useMemo(() => {
    if (!variantOptionsSource || !variantValuesSource) {
      return [] as VariantSelectorOption[];
    }

    const valuesByOption = new Map<Id<'productOptions'>, ProductOptionValue[]>();
    variantValuesSource.forEach((value) => {
      const existing = valuesByOption.get(value.optionId) ?? [];
      existing.push(value);
      valuesByOption.set(value.optionId, existing);
    });

    return (variantOptionsSource as ProductOption[])
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((option) => ({
        id: option._id,
        name: option.name,
        displayType: option.displayType,
        inputType: option.inputType,
        values: (valuesByOption.get(option._id) ?? [])
          .slice()
          .sort((a, b) => a.order - b.order)
          .map((value) => ({
            id: value._id,
            label: value.label ?? value.value,
            value: value.value,
            colorCode: value.colorCode,
            image: value.image,
          })),
      }))
      .filter((option) => option.values.length > 0);
  }, [variantOptionsSource, variantValuesSource]);

  const wishlistStatus = useQuery(
    api.wishlist.isInWishlist,
    isAuthenticated && customer && product?._id && (wishlistModule?.enabled ?? false)
      ? { customerId: customer.id as Id<'customers'>, productId: product._id }
      : 'skip'
  );
  const isWishlisted = wishlistStatus ?? false;
  const canUseWishlist = experienceConfig.showWishlist && (wishlistModule?.enabled ?? false);
  const commentsEnabled = commentsModule?.enabled ?? false;
  const shouldShowComments = commentsEnabled && experienceConfig.showComments;
  const shouldShowCommentLikes = shouldShowComments && (commentsLikesFeature?.enabled ?? false) && experienceConfig.showCommentLikes;
  const shouldShowCommentReplies = shouldShowComments && (commentsRepliesFeature?.enabled ?? false) && experienceConfig.showCommentReplies;
  const commentsPerPageSetting = useMemo(() => {
    const perPage = commentsSettings?.find(setting => setting.settingKey === 'commentsPerPage')?.value as number | undefined;
    return perPage ?? 20;
  }, [commentsSettings]);
  const defaultStatus = useMemo(() => {
    const setting = commentsSettings?.find(setting => setting.settingKey === 'defaultStatus')?.value as string | undefined;
    return (setting === 'Approved' ? 'Approved' : 'Pending') as 'Approved' | 'Pending';
  }, [commentsSettings]);
  const commentsPage = useQuery(
    api.comments.listByTarget,
    product && shouldShowComments
      ? { paginationOpts: { cursor: null, numItems: Math.min(commentsPerPageSetting * 2, 60) }, status: 'Approved', targetId: product._id, targetType: 'product' }
      : 'skip'
  );
  const comments = useMemo(() => commentsPage?.page ?? [], [commentsPage?.page]);
  const saleMode = useMemo<ProductsSaleMode>(() => {
    const value = saleModeSetting?.value;
    if (value === 'contact' || value === 'affiliate') {
      return value;
    }
    return 'cart';
  }, [saleModeSetting?.value]);
  const commentRepliesMap = useMemo(() => {
    const map = new Map<string, CommentData[]>();
    comments.forEach((comment) => {
      if (!comment.parentId) {return;}
      const list = map.get(comment.parentId) ?? [];
      list.push(comment);
      map.set(comment.parentId, list);
    });
    return map;
  }, [comments]);
  const rootComments = useMemo(() => comments.filter(comment => !comment.parentId), [comments]);
  const [commentName, setCommentName] = useState('');
  const [commentEmail, setCommentEmail] = useState('');
  const [commentContent, setCommentContent] = useState('');
  const [commentRating, setCommentRating] = useState(5);
  const [commentMessage, setCommentMessage] = useState<string | null>(null);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [replyDrafts, setReplyDrafts] = useState<Record<string, { content: string; email: string; name: string }>>({});
  const [replySubmittingId, setReplySubmittingId] = useState<string | null>(null);
  const [likingIds, setLikingIds] = useState<Set<string>>(new Set());

  const handleWishlistToggle = async () => {
    if (!isAuthenticated || !customer || !product?._id) {
      openLoginModal();
      return;
    }
    await toggleWishlist({ customerId: customer.id as Id<'customers'>, productId: product._id });
  };

  const handleAddToCart = async (quantity: number, variantId?: Id<'productVariants'>) => {
    if (!product?._id) {
      return;
    }
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }
    if (product.hasVariants && !variantId) {
      toast.error('Vui lòng chọn phiên bản trước khi thêm vào giỏ hàng');
      return;
    }
    await addItem(product._id, quantity, variantId);
    notifyAddToCart();
    if (cartConfig.layoutStyle === 'drawer') {
      openDrawer();
    } else {
      router.push('/cart');
    }
  };

  const handleBuyNow = async (quantity: number, variantId?: Id<'productVariants'>) => {
    if (!product?._id) {
      return;
    }
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }
    if (product.hasVariants && !variantId) {
      toast.error('Vui lòng chọn phiên bản trước khi thanh toán');
      return;
    }
    const variantParam = variantId ? `&variantId=${variantId}` : '';
    router.push(`/checkout?productId=${product._id}&quantity=${quantity}${variantParam}`);
  };

  const handlePrimaryAction = async (quantity: number, variantId?: Id<'productVariants'>) => {
    if (!product) {
      return;
    }

    if (saleMode === 'contact') {
      router.push('/contact');
      return;
    }

    if (saleMode === 'affiliate') {
      const affiliateLink = (product as { affiliateLink?: string }).affiliateLink?.trim();
      if (!affiliateLink) {
        toast.error('Sản phẩm chưa có link affiliate');
        return;
      }
      window.open(affiliateLink, '_blank', 'noopener,noreferrer');
      return;
    }

    await handleBuyNow(quantity, variantId);
  };

  const handleSubmitComment = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!product || !commentName.trim() || !commentContent.trim()) {return;}
    setIsSubmittingComment(true);
    setCommentMessage(null);
    try {
      await createComment({
        authorEmail: commentEmail.trim() || undefined,
        authorName: commentName.trim(),
        content: commentContent.trim(),
        rating: commentRating > 0 ? commentRating : undefined,
        targetId: product._id,
        targetType: 'product',
      });
      setCommentName('');
      setCommentEmail('');
      setCommentContent('');
      setCommentRating(5);
      setCommentMessage(defaultStatus === 'Approved' ? 'Đánh giá đã được đăng.' : 'Đánh giá đã được gửi, vui lòng chờ duyệt.');
    } catch {
      setCommentMessage('Không thể gửi đánh giá. Vui lòng thử lại.');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleReplyDraftChange = (parentId: Id<'comments'>, key: 'name' | 'email' | 'content', value: string) => {
    setReplyDrafts(prev => ({
      ...prev,
      [parentId]: {
        name: prev[parentId]?.name ?? '',
        email: prev[parentId]?.email ?? '',
        content: prev[parentId]?.content ?? '',
        [key]: value,
      },
    }));
  };

  const handleSubmitReply = async (parentId: Id<'comments'>) => {
    if (!product) {return;}
    const draft = replyDrafts[parentId];
    if (!draft?.name?.trim() || !draft?.content?.trim()) {return;}
    setReplySubmittingId(parentId);
    try {
      await createComment({
        authorEmail: draft.email?.trim() || undefined,
        authorName: draft.name.trim(),
        content: draft.content.trim(),
        parentId,
        targetId: product._id,
        targetType: 'product',
      });
      setReplyDrafts(prev => {
        const next = { ...prev };
        delete next[parentId];
        return next;
      });
    } finally {
      setReplySubmittingId(null);
    }
  };

  const handleLike = async (id: Id<'comments'>) => {
    if (likingIds.has(id)) {return;}
    setLikingIds(prev => new Set(prev).add(id));
    try {
      await incrementLike({ id });
    } finally {
      setLikingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleUnlike = async (id: Id<'comments'>) => {
    if (likingIds.has(id)) {return;}
    setLikingIds(prev => new Set(prev).add(id));
    try {
      await decrementLike({ id });
    } finally {
      setLikingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const canBuyNow = experienceConfig.showBuyNow && checkoutConfig.showBuyNow && (ordersModule?.enabled ?? false);
  const canUseCartActions = saleMode === 'cart';
  const buyNowLabel = saleMode === 'contact' ? 'Liên hệ' : 'Mua ngay';
  const requireStockForBuyNow = saleMode === 'cart';

  const ratingSummary = useProductRatingSummary(product?._id, experienceConfig.showRating);

  const commentsSection = shouldShowComments ? (
    <ProductCommentsSection
      brandColor={brandColor}
      ratingSummary={ratingSummary}
      comments={rootComments}
      replyMap={commentRepliesMap}
      commentName={commentName}
      commentEmail={commentEmail}
      commentContent={commentContent}
      commentRating={commentRating}
      commentMessage={commentMessage}
      isSubmitting={isSubmittingComment}
      replyDrafts={replyDrafts}
      replySubmittingId={replySubmittingId}
      showLikes={shouldShowCommentLikes}
      showReplies={shouldShowCommentReplies}
      onNameChange={setCommentName}
      onEmailChange={setCommentEmail}
      onContentChange={setCommentContent}
      onRatingChange={setCommentRating}
      onSubmit={handleSubmitComment}
      onLike={handleLike}
      onUnlike={handleUnlike}
      onReplyDraftChange={handleReplyDraftChange}
      onReplySubmit={handleSubmitReply}
    />
  ) : null;

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
  const productData = {
    ...product,
    categoryName: category?.name ?? 'Sản phẩm',
    categorySlug: category?.slug,
    hasVariants: product.hasVariants,
  };

  return (
    <>
      {experienceConfig.layoutStyle === 'classic' && (
        <ClassicStyle
          product={productData}
          brandColor={brandColor}
          relatedProducts={filteredRelated}
          enabledFields={enabledFields}
          variants={variants ?? []}
          variantOptions={variantOptions}
          highlights={classicHighlights}
          highlightsEnabled={classicHighlightsEnabled}
          ratingSummary={ratingSummary}
          showAddToCart={canUseCartActions ? experienceConfig.showAddToCart : false}
          showRating={experienceConfig.showRating}
          showWishlist={canUseWishlist}
          showBuyNow={canUseCartActions ? canBuyNow : true}
          buyNowLabel={buyNowLabel}
          requireStockForBuyNow={requireStockForBuyNow}
          isWishlisted={isWishlisted}
          onToggleWishlist={handleWishlistToggle}
          onAddToCart={handleAddToCart}
          onBuyNow={handlePrimaryAction}
          commentsSection={commentsSection}
        />
      )}
      {experienceConfig.layoutStyle === 'modern' && (
        <ModernStyle
          product={productData}
          brandColor={brandColor}
          relatedProducts={filteredRelated}
          enabledFields={enabledFields}
          variants={variants ?? []}
          variantOptions={variantOptions}
          ratingSummary={ratingSummary}
          showAddToCart={canUseCartActions ? experienceConfig.showAddToCart : false}
          showRating={experienceConfig.showRating}
          showWishlist={canUseWishlist}
          showBuyNow={canUseCartActions ? canBuyNow : true}
          buyNowLabel={buyNowLabel}
          requireStockForBuyNow={requireStockForBuyNow}
          heroStyle={experienceConfig.heroStyle}
          isWishlisted={isWishlisted}
          onToggleWishlist={handleWishlistToggle}
          onAddToCart={handleAddToCart}
          onBuyNow={handlePrimaryAction}
          commentsSection={commentsSection}
        />
      )}
      {experienceConfig.layoutStyle === 'minimal' && (
        <MinimalStyle
          product={productData}
          brandColor={brandColor}
          relatedProducts={filteredRelated}
          enabledFields={enabledFields}
          variants={variants ?? []}
          variantOptions={variantOptions}
          ratingSummary={ratingSummary}
          showAddToCart={canUseCartActions ? experienceConfig.showAddToCart : false}
          showRating={experienceConfig.showRating}
          showWishlist={canUseWishlist}
          showBuyNow={canUseCartActions ? canBuyNow : true}
          buyNowLabel={buyNowLabel}
          requireStockForBuyNow={requireStockForBuyNow}
          contentWidth={experienceConfig.contentWidth}
          isWishlisted={isWishlisted}
          onToggleWishlist={handleWishlistToggle}
          onAddToCart={handleAddToCart}
          onBuyNow={handlePrimaryAction}
          commentsSection={commentsSection}
        />
      )}
    </>
  );
}

interface ProductData {
  _id: Id<"products">;
  affiliateLink?: string;
  name: string;
  slug: string;
  sku: string;
  price: number;
  salePrice?: number;
  stock: number;
  image?: string;
  images?: string[];
  description?: string;
  hasVariants?: boolean;
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

interface CommentData {
  _id: Id<'comments'>;
  _creationTime: number;
  authorName: string;
  content: string;
  likesCount?: number;
  parentId?: Id<'comments'>;
  rating?: number;
}

interface StyleProps {
  product: ProductData;
  brandColor: string;
  relatedProducts: RelatedProduct[];
  enabledFields: Set<string>;
  variants: ProductVariant[];
  variantOptions: VariantSelectorOption[];
  commentsSection?: React.ReactNode;
}

interface ExperienceBlocksProps {
  ratingSummary: RatingSummary;
  showAddToCart: boolean;
  showRating: boolean;
  showWishlist: boolean;
  showBuyNow: boolean;
  buyNowLabel: string;
  requireStockForBuyNow: boolean;
  isWishlisted: boolean;
  onToggleWishlist: () => void;
  onAddToCart: (quantity: number, variantId?: Id<'productVariants'>) => void;
  onBuyNow: (quantity: number, variantId?: Id<'productVariants'>) => void;
}

interface ClassicStyleProps extends StyleProps, ExperienceBlocksProps {
  highlights: ClassicHighlightItem[];
  highlightsEnabled: boolean;
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('vi-VN', { currency: 'VND', style: 'currency' }).format(price);
}

type VariantSelectionMap = Record<string, Id<'productOptionValues'>>;

const buildSelectionFromVariant = (variant: ProductVariant): VariantSelectionMap =>
  variant.optionValues.reduce<VariantSelectionMap>((acc, optionValue) => {
    acc[optionValue.optionId] = optionValue.valueId;
    return acc;
  }, {});

const findMatchingVariant = (variants: ProductVariant[], selection: VariantSelectionMap) =>
  variants.find((variant) =>
    variant.optionValues.every((optionValue) => {
      const selected = selection[optionValue.optionId];
      return !selected || selected === optionValue.valueId;
    })
  ) ?? null;

const findExactVariant = (variants: ProductVariant[], selection: VariantSelectionMap) =>
  variants.find((variant) =>
    variant.optionValues.every((optionValue) => selection[optionValue.optionId] === optionValue.valueId)
  ) ?? null;

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
function ClassicStyle({ product, brandColor, relatedProducts, enabledFields, variants, variantOptions, highlights, highlightsEnabled, ratingSummary, showAddToCart, showRating, showWishlist, showBuyNow, buyNowLabel, requireStockForBuyNow, isWishlisted, onToggleWishlist, onAddToCart, onBuyNow, commentsSection }: ClassicStyleProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<VariantSelectionMap>({});

  const hasVariants = Boolean(product.hasVariants && variants.length > 0 && variantOptions.length > 0);

  useEffect(() => {
    if (!hasVariants) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedOptions({});
      return;
    }
    setSelectedOptions(buildSelectionFromVariant(variants[0]));
  }, [hasVariants, variants]);

  const selectedVariant = useMemo(
    () => (hasVariants ? findExactVariant(variants, selectedOptions) : null),
    [hasVariants, variants, selectedOptions]
  );

  const handleSelectOption = (optionId: Id<'productOptions'>, valueId: Id<'productOptionValues'>) => {
    if (!hasVariants) {
      return;
    }
    const nextSelection = { ...selectedOptions, [optionId]: valueId };
    const matching = findMatchingVariant(variants, nextSelection);
    setSelectedOptions(matching ? buildSelectionFromVariant(matching) : nextSelection);
  };

  const isOptionValueAvailable = (optionId: Id<'productOptions'>, valueId: Id<'productOptionValues'>) =>
    variants.some((variant) =>
      variant.optionValues.every((optionValue) => {
        if (optionValue.optionId === optionId) {
          return optionValue.valueId === valueId;
        }
        const selected = selectedOptions[optionValue.optionId];
        return !selected || selected === optionValue.valueId;
      })
    );

  const showPrice = enabledFields.has('price') || enabledFields.size === 0;
  const showSalePrice = enabledFields.has('salePrice');
  const showStock = enabledFields.has('stock');
  const showDescription = enabledFields.has('description');
  const showSku = enabledFields.has('sku');

  const images = product.images?.length ? product.images : (product.image ? [product.image] : []);
  const basePrice = selectedVariant?.price ?? product.price;
  const salePrice = selectedVariant ? selectedVariant.salePrice : product.salePrice;
  const discountPercent = salePrice ? Math.round((1 - salePrice / basePrice) * 100) : 0;
  const displayPrice = salePrice ?? basePrice;
  const stockValue = selectedVariant?.stock ?? product.stock;
  const inStock = !showStock || stockValue > 0;
  const buyNowDisabled = requireStockForBuyNow && !inStock;

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
              {showSalePrice && salePrice && (
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
                <span className="text-3xl font-bold" style={{ color: brandColor }}>{formatPrice(displayPrice)}</span>
                {showSalePrice && salePrice && (
                  <>
                    <span className="text-xl text-slate-400 line-through">{formatPrice(basePrice)}</span>
                    <span className="px-2 py-0.5 bg-red-100 text-red-600 text-sm font-medium rounded">Tiết kiệm {formatPrice(basePrice - salePrice)}</span>
                  </>
                )}
              </div>
            )}

            {hasVariants && (
              <div className="mb-6">
                <VariantSelector
                  options={variantOptions}
                  selectedOptions={selectedOptions}
                  onSelect={handleSelectOption}
                  isOptionValueAvailable={isOptionValueAvailable}
                  accentColor={brandColor}
                />
              </div>
            )}

            {showStock && (
              <div className="flex items-center gap-2 mb-6">
                {stockValue > 10 ? (
                  <><Check size={18} className="text-green-500" /><span className="text-green-600 font-medium">Còn hàng</span></>
                ) : (stockValue > 0 ? (
                  <><span className="w-2 h-2 bg-orange-500 rounded-full" /><span className="text-orange-600 font-medium">Chỉ còn {stockValue} sản phẩm</span></>
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
                <button onClick={() =>{  setQuantity(q => Math.min(showStock ? stockValue : 99, q + 1)); }} className="p-3 hover:bg-slate-50 transition-colors" disabled={showStock && quantity >= stockValue}>
                  <Plus size={18} className={showStock && quantity >= stockValue ? 'text-slate-300' : 'text-slate-600'} />
                </button>
              </div>

              <div className="flex flex-1 flex-col gap-2">
                {showAddToCart && (
                  <button
                    className={`py-3.5 px-8 rounded-xl text-white font-semibold flex items-center justify-center gap-2 transition-all ${inStock ? 'hover:shadow-lg hover:scale-[1.02]' : 'opacity-50 cursor-not-allowed'}`}
                    style={{ backgroundColor: brandColor }}
                    disabled={!inStock}
                    onClick={() => { if (inStock) { onAddToCart(quantity, selectedVariant?._id); } }}
                  >
                    <ShoppingCart size={20} />
                    {inStock ? 'Thêm vào giỏ hàng' : 'Hết hàng'}
                  </button>
                )}
                {showBuyNow && (
                  <button
                    className={`py-3.5 px-8 rounded-xl font-semibold flex items-center justify-center gap-2 border transition-all ${buyNowDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-50'}`}
                    style={{ borderColor: brandColor, color: brandColor }}
                    disabled={buyNowDisabled}
                    onClick={() => { if (!buyNowDisabled) { onBuyNow(quantity, selectedVariant?._id); } }}
                  >
                    {buyNowLabel}
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

      {commentsSection}

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
function ModernStyle({ product, brandColor, relatedProducts, enabledFields, variants, variantOptions, ratingSummary, showAddToCart, showRating, showWishlist, showBuyNow, buyNowLabel, requireStockForBuyNow, heroStyle, isWishlisted, onToggleWishlist, onAddToCart, onBuyNow, commentsSection }: StyleProps & ExperienceBlocksProps & { heroStyle: ModernHeroStyle }) {
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<VariantSelectionMap>({});

  const hasVariants = Boolean(product.hasVariants && variants.length > 0 && variantOptions.length > 0);

  useEffect(() => {
    if (!hasVariants) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedOptions({});
      return;
    }
    setSelectedOptions(buildSelectionFromVariant(variants[0]));
  }, [hasVariants, variants]);

  const selectedVariant = useMemo(
    () => (hasVariants ? findExactVariant(variants, selectedOptions) : null),
    [hasVariants, variants, selectedOptions]
  );

  const handleSelectOption = (optionId: Id<'productOptions'>, valueId: Id<'productOptionValues'>) => {
    if (!hasVariants) {
      return;
    }
    const nextSelection = { ...selectedOptions, [optionId]: valueId };
    const matching = findMatchingVariant(variants, nextSelection);
    setSelectedOptions(matching ? buildSelectionFromVariant(matching) : nextSelection);
  };

  const isOptionValueAvailable = (optionId: Id<'productOptions'>, valueId: Id<'productOptionValues'>) =>
    variants.some((variant) =>
      variant.optionValues.every((optionValue) => {
        if (optionValue.optionId === optionId) {
          return optionValue.valueId === valueId;
        }
        const selected = selectedOptions[optionValue.optionId];
        return !selected || selected === optionValue.valueId;
      })
    );

  const showPrice = enabledFields.has('price') || enabledFields.size === 0;
  const showSalePrice = enabledFields.has('salePrice');
  const showStock = enabledFields.has('stock');
  const showDescription = enabledFields.has('description');

  const images = product.images?.length ? product.images : (product.image ? [product.image] : []);
  const basePrice = selectedVariant?.price ?? product.price;
  const salePrice = selectedVariant ? selectedVariant.salePrice : product.salePrice;
  const discountPercent = salePrice ? Math.round((1 - salePrice / basePrice) * 100) : 0;
  const displayPrice = salePrice ?? basePrice;
  const stockValue = selectedVariant?.stock ?? product.stock;
  const inStock = !showStock || stockValue > 0;
  const buyNowDisabled = requireStockForBuyNow && !inStock;
  const maxQuantity = showStock ? Math.min(stockValue, 10) : 10;

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
                    {formatPrice(displayPrice)}
                  </span>
                  {showSalePrice && salePrice && (
                    <span className="text-lg text-slate-400 line-through">
                      {formatPrice(basePrice)}
                    </span>
                  )}
                </div>
                {showSalePrice && salePrice && (
                  <span className="inline-flex items-center rounded-full bg-red-500 px-3 py-1 text-xs font-semibold text-white">
                    Giảm {discountPercent}%
                  </span>
                )}
              </div>
            )}

            {hasVariants && (
              <VariantSelector
                options={variantOptions}
                selectedOptions={selectedOptions}
                onSelect={handleSelectOption}
                isOptionValueAvailable={isOptionValueAvailable}
                accentColor={brandColor}
              />
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
                  onClick={() =>{  setQuantity(q => Math.min(maxQuantity, q + 1)); }}
                  disabled={quantity >= maxQuantity}
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
                    onClick={() => { if (inStock) { onAddToCart(quantity, selectedVariant?._id); } }}
                  >
                    <ShoppingBag className="w-5 h-5 mr-2 inline-block" />
                    {inStock ? 'Thêm vào giỏ hàng' : 'Hết hàng'}
                  </button>
                )}
                {showBuyNow && (
                  <button
                    className={`w-full h-12 text-base font-semibold border transition-all ${buyNowDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-50'}`}
                    style={{ borderColor: brandColor, color: brandColor }}
                    disabled={buyNowDisabled}
                    onClick={() => { if (!buyNowDisabled) { onBuyNow(quantity, selectedVariant?._id); } }}
                  >
                    {buyNowLabel}
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

        {commentsSection}

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
function MinimalStyle({ product, brandColor, relatedProducts, enabledFields, variants, variantOptions, ratingSummary, showAddToCart, showRating, showWishlist, showBuyNow, buyNowLabel, requireStockForBuyNow, contentWidth, isWishlisted, onToggleWishlist, onAddToCart, onBuyNow, commentsSection }: StyleProps & ExperienceBlocksProps & { contentWidth: MinimalContentWidth }) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<VariantSelectionMap>({});

  const hasVariants = Boolean(product.hasVariants && variants.length > 0 && variantOptions.length > 0);

  useEffect(() => {
    if (!hasVariants) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedOptions({});
      return;
    }
    setSelectedOptions(buildSelectionFromVariant(variants[0]));
  }, [hasVariants, variants]);

  const selectedVariant = useMemo(
    () => (hasVariants ? findExactVariant(variants, selectedOptions) : null),
    [hasVariants, variants, selectedOptions]
  );

  const handleSelectOption = (optionId: Id<'productOptions'>, valueId: Id<'productOptionValues'>) => {
    if (!hasVariants) {
      return;
    }
    const nextSelection = { ...selectedOptions, [optionId]: valueId };
    const matching = findMatchingVariant(variants, nextSelection);
    setSelectedOptions(matching ? buildSelectionFromVariant(matching) : nextSelection);
  };

  const isOptionValueAvailable = (optionId: Id<'productOptions'>, valueId: Id<'productOptionValues'>) =>
    variants.some((variant) =>
      variant.optionValues.every((optionValue) => {
        if (optionValue.optionId === optionId) {
          return optionValue.valueId === valueId;
        }
        const selected = selectedOptions[optionValue.optionId];
        return !selected || selected === optionValue.valueId;
      })
    );

  const showPrice = enabledFields.has('price') || enabledFields.size === 0;
  const showStock = enabledFields.has('stock');
  const showDescription = enabledFields.has('description');
  const showSku = enabledFields.has('sku');

  const images = product.images?.length ? product.images : (product.image ? [product.image] : []);
  const basePrice = selectedVariant?.price ?? product.price;
  const salePrice = selectedVariant ? selectedVariant.salePrice : product.salePrice;
  const displayPrice = salePrice ?? basePrice;
  const stockValue = selectedVariant?.stock ?? product.stock;
  const inStock = !showStock || stockValue > 0;
  const buyNowDisabled = requireStockForBuyNow && !inStock;

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
                  {formatPrice(displayPrice)}
                </p>
              )}
            </div>

            {hasVariants && (
              <div className="mb-6">
                <VariantSelector
                  options={variantOptions}
                  selectedOptions={selectedOptions}
                  onSelect={handleSelectOption}
                  isOptionValueAvailable={isOptionValueAvailable}
                  accentColor={brandColor}
                />
              </div>
            )}

            {(showAddToCart || showBuyNow || showWishlist) && (
              <div className="flex flex-col gap-3 mb-8 border-t border-slate-100 pt-6">
                <div className="flex gap-4">
                  {showAddToCart && (
                    <button
                      className={`flex-1 bg-black text-white h-14 uppercase tracking-wider text-sm font-medium transition-colors ${inStock ? 'hover:bg-slate-900' : 'opacity-50 cursor-not-allowed'}`}
                      disabled={!inStock}
                      onClick={() => { if (inStock) { onAddToCart(1, selectedVariant?._id); } }}
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
                    className={`h-12 uppercase tracking-wider text-xs font-medium border transition-colors ${buyNowDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-50'}`}
                    style={{ borderColor: '#0f172a', color: '#0f172a' }}
                    disabled={buyNowDisabled}
                    onClick={() => { if (!buyNowDisabled) { onBuyNow(1, selectedVariant?._id); } }}
                  >
                    {buyNowLabel}
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

        {commentsSection}

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

type ProductCommentsSectionProps = {
  brandColor: string;
  ratingSummary: RatingSummary;
  comments: CommentData[];
  replyMap: Map<string, CommentData[]>;
  commentName: string;
  commentEmail: string;
  commentContent: string;
  commentRating: number;
  commentMessage: string | null;
  isSubmitting: boolean;
  replyDrafts: Record<string, { content: string; email: string; name: string }>;
  replySubmittingId: string | null;
  showLikes: boolean;
  showReplies: boolean;
  onNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onContentChange: (value: string) => void;
  onRatingChange: (value: number) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onLike: (id: Id<'comments'>) => void;
  onUnlike: (id: Id<'comments'>) => void;
  onReplyDraftChange: (parentId: Id<'comments'>, key: 'name' | 'email' | 'content', value: string) => void;
  onReplySubmit: (parentId: Id<'comments'>) => void;
};

function RatingStars({ value, size = 14, onChange }: { value: number; size?: number; onChange?: (next: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={onChange ? () => onChange(star) : undefined}
          className={onChange ? 'transition-transform hover:scale-105' : 'cursor-default'}
          aria-label={`${star} sao`}
        >
          <Star
            size={size}
            className={star <= Math.round(value) ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}
          />
        </button>
      ))}
    </div>
  );
}

function ProductCommentsSection({
  brandColor,
  ratingSummary,
  comments,
  replyMap,
  commentName,
  commentEmail,
  commentContent,
  commentRating,
  commentMessage,
  isSubmitting,
  replyDrafts,
  replySubmittingId,
  showLikes,
  showReplies,
  onNameChange,
  onEmailChange,
  onContentChange,
  onRatingChange,
  onSubmit,
  onLike,
  onUnlike,
  onReplyDraftChange,
  onReplySubmit,
}: ProductCommentsSectionProps) {
  const [showForm, setShowForm] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [openReplyIds, setOpenReplyIds] = useState<Set<string>>(new Set());
  const [openReplies, setOpenReplies] = useState<Set<string>>(new Set());

  const avatarColors = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#14b8a6'];
  const getAvatarColor = (id: string) => avatarColors[id.charCodeAt(1) % avatarColors.length];
  const visibleComments = showAllComments ? comments : comments.slice(0, 3);

  const handleToggleLike = (id: Id<'comments'>) => {
    if (likedIds.has(id)) {
      setLikedIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      onUnlike(id);
    } else {
      setLikedIds(prev => new Set(prev).add(id));
      onLike(id);
    }
  };

  const toggleReplyForm = (id: Id<'comments'>) => {
    setOpenReplyIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleReplies = (id: Id<'comments'>) => {
    setOpenReplies(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <section className="mt-12 border-t border-slate-100 pt-8">
      <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-start gap-3">
          <MessageSquare className="h-5 w-5" style={{ color: brandColor }} />
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Đánh giá & Bình luận</h3>
            <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
              {ratingSummary.average ? (
                <>
                  <RatingStars value={ratingSummary.average} size={14} />
                  <span>{ratingSummary.average.toFixed(1)} ({ratingSummary.count} đánh giá)</span>
                </>
              ) : (
                <span>Chưa có đánh giá</span>
              )}
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="text-xs font-medium px-3 py-1.5 rounded-full transition-colors"
          style={{ backgroundColor: `${brandColor}15`, color: brandColor }}
        >
          {showForm ? 'Đóng' : 'Viết đánh giá'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={onSubmit} className="mt-4 rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-3">
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            <input
              value={commentName}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="Họ và tên *"
              className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-200"
              required
            />
            <input
              value={commentEmail}
              onChange={(e) => onEmailChange(e.target.value)}
              placeholder="Email (không bắt buộc)"
              className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-200"
              type="email"
            />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-600 mb-1">Chọn số sao</p>
            <RatingStars value={commentRating} size={18} onChange={onRatingChange} />
          </div>
          <textarea
            value={commentContent}
            onChange={(e) => onContentChange(e.target.value)}
            placeholder="Chia sẻ trải nghiệm của bạn..."
            className="min-h-[90px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-200"
            required
          />
          {commentMessage && <p className="text-xs text-slate-500">{commentMessage}</p>}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="h-8 rounded-full px-4 text-xs font-medium text-white"
              style={{ backgroundColor: brandColor }}
            >
              {isSubmitting ? 'Đang gửi...' : 'Gửi đánh giá'}
            </button>
          </div>
        </form>
      )}

      <div className="mt-4 space-y-2">
        {visibleComments.length > 0 ? (
          visibleComments.map((comment) => {
            const replies = replyMap.get(comment._id) ?? [];
            const showReplyForm = openReplyIds.has(comment._id);
            const showRepliesList = openReplies.has(comment._id);
            return (
              <div key={comment._id} className="rounded-xl border border-slate-100 bg-white p-4">
                <div className="flex gap-3">
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
                    style={{ backgroundColor: getAvatarColor(comment._id) }}
                  >
                    {comment.authorName.split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium text-slate-900">{comment.authorName}</span>
                      <span className="text-xs text-slate-400">• {new Date(comment._creationTime).toLocaleDateString('vi-VN')}</span>
                    </div>
                    {typeof comment.rating === 'number' && (
                      <div className="mt-1">
                        <RatingStars value={comment.rating} size={12} />
                      </div>
                    )}
                    <p className="mt-2 text-sm text-slate-600">{comment.content}</p>
                    {(showLikes || showReplies) && (
                      <div className="mt-2 flex items-center gap-3">
                        {showLikes && (
                          <button
                            type="button"
                            onClick={() => handleToggleLike(comment._id)}
                            className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-700"
                            style={likedIds.has(comment._id) ? { color: brandColor } : undefined}
                          >
                            <ThumbsUp className={`h-3 w-3 ${likedIds.has(comment._id) ? 'fill-current' : ''}`} />
                            {(comment.likesCount ?? 0) > 0 ? comment.likesCount : 'Thích'}
                          </button>
                        )}
                        {showReplies && (
                          <button
                            type="button"
                            onClick={() => toggleReplyForm(comment._id)}
                            className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-700"
                          >
                            <Reply className="h-3 w-3" />
                            {showReplyForm ? 'Đóng' : 'Trả lời'}
                          </button>
                        )}
                        {showReplies && replies.length > 0 && (
                          <button
                            type="button"
                            onClick={() => toggleReplies(comment._id)}
                            className="text-xs font-medium text-slate-400 hover:text-slate-600"
                          >
                            {showRepliesList ? 'Ẩn' : 'Xem'} {replies.length} phản hồi
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {showReplies && showReplyForm && (
                  <div className="mt-4 rounded-lg border border-slate-100 bg-slate-50 p-3 space-y-2">
                    <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                      <input
                        value={replyDrafts[comment._id]?.name ?? ''}
                        onChange={(e) => onReplyDraftChange(comment._id, 'name', e.target.value)}
                        placeholder="Họ và tên *"
                        className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-200"
                        required
                      />
                      <input
                        value={replyDrafts[comment._id]?.email ?? ''}
                        onChange={(e) => onReplyDraftChange(comment._id, 'email', e.target.value)}
                        placeholder="Email (không bắt buộc)"
                        className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-200"
                        type="email"
                      />
                    </div>
                    <textarea
                      value={replyDrafts[comment._id]?.content ?? ''}
                      onChange={(e) => onReplyDraftChange(comment._id, 'content', e.target.value)}
                      placeholder="Nội dung phản hồi..."
                      className="min-h-[70px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-200"
                      required
                    />
                    <div className="flex justify-end">
                      <button
                        type="button"
                        disabled={replySubmittingId === comment._id}
                        onClick={() => onReplySubmit(comment._id)}
                        className="h-8 rounded-full px-4 text-xs font-medium text-white"
                        style={{ backgroundColor: brandColor }}
                      >
                        {replySubmittingId === comment._id ? 'Đang gửi...' : 'Gửi phản hồi'}
                      </button>
                    </div>
                  </div>
                )}

                {showReplies && showRepliesList && replies.length > 0 && (
                  <div className="mt-4 space-y-3 border-l-2 pl-4" style={{ borderColor: `${brandColor}40` }}>
                    {replies.map((reply) => (
                      <div key={reply._id} className="flex gap-3">
                        <div
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white"
                          style={{ backgroundColor: brandColor }}
                        >
                          {reply.authorName.split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold" style={{ color: brandColor }}>{reply.authorName}</span>
                            <span className="text-xs text-slate-400">• {new Date(reply._creationTime).toLocaleDateString('vi-VN')}</span>
                          </div>
                          <p className="text-sm text-slate-600 mt-1">{reply.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
            Chưa có đánh giá nào cho sản phẩm này.
          </div>
        )}
      </div>

      {comments.length > 3 && (
        <button
          type="button"
          onClick={() => setShowAllComments(!showAllComments)}
          className="mt-4 w-full rounded-lg border border-dashed border-slate-200 py-2 text-sm font-medium text-slate-500 hover:text-slate-700"
        >
          {showAllComments ? 'Thu gọn' : `Xem thêm ${comments.length - 3} đánh giá`}
        </button>
      )}
    </section>
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
