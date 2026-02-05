import React from 'react';
import {
  Award,
  BadgeCheck,
  Bell,
  Bolt,
  Calendar,
  Camera,
  CheckCircle2,
  Clock,
  ChevronRight,
  CreditCard,
  Gift,
  Globe,
  Heart,
  HeartHandshake,
  Leaf,
  Lock,
  MapPin,
  Minus,
  Phone,
  Plus,
  RotateCcw,
  Share2,
  Shield,
  ShoppingBag,
  ShoppingCart,
  Star,
  ThumbsUp,
  Truck,
} from 'lucide-react';

type ProductDetailPreviewProps = {
  layoutStyle: 'classic' | 'modern' | 'minimal';
  showRating: boolean;
  showWishlist: boolean;
  showAddToCart: boolean;
  showBuyNow: boolean;
  showClassicHighlights: boolean;
  classicHighlights?: { icon: string; text: string }[];
  heroStyle?: 'full' | 'split' | 'minimal';
  contentWidth?: 'narrow' | 'medium' | 'wide';
  device?: 'desktop' | 'tablet' | 'mobile';
  brandColor?: string;
};

const formatVND = (price: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

const CLASSIC_HIGHLIGHT_ICON_MAP: Record<string, React.ElementType> = {
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

function VariantPreview({ brandColor }: { brandColor: string }) {
  return (
    <div className="space-y-3">
      <div>
        <p className="text-xs font-semibold text-slate-600">Màu sắc</p>
        <div className="flex gap-2 mt-2">
          {['#111827', '#e11d48', '#0ea5e9'].map((color, index) => (
            <span
              key={color}
              className={`h-6 w-6 rounded-full border ${index === 0 ? 'ring-2 ring-offset-2' : 'opacity-70'}`}
              style={{ backgroundColor: color, borderColor: index === 0 ? brandColor : '#e2e8f0', boxShadow: index === 0 ? `0 0 0 2px ${brandColor}` : undefined }}
            />
          ))}
        </div>
      </div>
      <div>
        <p className="text-xs font-semibold text-slate-600">Dung lượng</p>
        <div className="flex gap-2 mt-2">
          {['128GB', '256GB', '512GB'].map((value, index) => (
            <span
              key={value}
              className={`px-3 py-1 rounded-full text-xs border ${index === 1 ? 'text-white' : 'text-slate-600'}`}
              style={index === 1 ? { backgroundColor: brandColor, borderColor: brandColor } : { borderColor: '#e2e8f0' }}
            >
              {value}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ProductDetailPreview({
  layoutStyle,
  showRating,
  showWishlist,
  showAddToCart,
  showBuyNow,
  showClassicHighlights,
  classicHighlights = [],
  heroStyle = 'full',
  contentWidth = 'medium',
  device = 'desktop',
  brandColor = '#06b6d4',
}: ProductDetailPreviewProps) {
  const isMobile = device === 'mobile';
  const productName = 'iPhone 15 Pro Max 256GB';
  const categoryName = 'Điện thoại';
  const sku = 'IP15PM-256';
  const stock = 12;
  const price = 34990000;
  const originalPrice = 36990000;
  const rating = 4.8;
  const reviews = 234;
  const discountPercent = Math.round((1 - price / originalPrice) * 100);
  const contentWidthClass = contentWidth === 'narrow'
    ? 'max-w-4xl'
    : contentWidth === 'wide'
      ? 'max-w-7xl'
      : 'max-w-6xl';
  const heroContainerClass = heroStyle === 'full'
    ? 'border border-slate-100 rounded-2xl bg-slate-50'
    : heroStyle === 'split'
      ? 'border border-slate-200 rounded-2xl bg-white'
      : 'border border-slate-200 rounded-xl bg-white';
  const heroImageWrapperClass = heroStyle === 'split'
    ? 'aspect-square flex items-center justify-center p-6'
    : heroStyle === 'minimal'
      ? 'aspect-square flex items-center justify-center p-3'
      : 'aspect-square flex items-center justify-center p-6';

  return (
    <div className="py-6 px-4 min-h-[300px]">
      <div className="max-w-6xl mx-auto">
        {layoutStyle === 'classic' && (
          <div className={`${isMobile ? 'space-y-4' : 'grid grid-cols-2 gap-8'}`}>
            <div className="space-y-3">
              <div className="aspect-square bg-slate-100 rounded-xl flex items-center justify-center">
                <div className="w-32 h-32 bg-slate-200 rounded-lg" />
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className={`aspect-square bg-slate-100 rounded-lg border-2 ${i === 1 ? '' : 'border-transparent'}`} style={i === 1 ? { borderColor: brandColor } : undefined} />
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-slate-900">{productName}</h1>
                {showRating && (
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={16} className={i < Math.floor(rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-200'} />
                      ))}
                    </div>
                    <span className="text-sm text-slate-500">{rating} ({reviews} đánh giá)</span>
                  </div>
                )}
              </div>
              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-bold" style={{ color: brandColor }}>{formatVND(price)}</span>
                <span className="text-lg text-slate-400 line-through">{formatVND(originalPrice)}</span>
                <span className="px-2 py-0.5 bg-red-100 text-red-600 text-sm font-medium rounded">-{Math.round((1 - price / originalPrice) * 100)}%</span>
              </div>
              <VariantPreview brandColor={brandColor} />
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center border border-slate-200 rounded-lg">
                  <button className="p-3" disabled>
                    <Minus size={18} className="text-slate-300" />
                  </button>
                  <span className="w-12 text-center font-medium">1</span>
                  <button className="p-3" disabled>
                    <Plus size={18} className="text-slate-300" />
                  </button>
                </div>

                <div className="flex flex-1 flex-col gap-2">
                  {showAddToCart && (
                    <button className="py-3.5 px-8 rounded-xl text-white font-semibold flex items-center justify-center gap-2" style={{ backgroundColor: brandColor }}>
                      <ShoppingCart size={20} />
                      Thêm vào giỏ hàng
                    </button>
                  )}
                  {showBuyNow && (
                    <button className="py-3.5 px-8 rounded-xl font-semibold flex items-center justify-center gap-2 border" style={{ borderColor: brandColor, color: brandColor }}>
                      Mua ngay
                    </button>
                  )}
                </div>

                {showWishlist && (
                  <button className="p-3.5 rounded-xl border border-slate-200">
                    <Heart size={20} className="text-slate-400" />
                  </button>
                )}
                <button className="p-3.5 rounded-xl border border-slate-200">
                  <Share2 size={20} className="text-slate-400" />
                </button>
              </div>

              {showClassicHighlights && (
                <div className="grid grid-cols-3 gap-4 p-4 bg-slate-50 rounded-xl">
                  {(classicHighlights.length > 0 ? classicHighlights : [
                    { icon: 'Star', text: 'Chip A17 Pro mạnh mẽ' },
                    { icon: 'Star', text: 'Camera 48MP chuyên nghiệp' },
                    { icon: 'Star', text: 'Titanium siêu bền' },
                  ]).map((item, index) => {
                    const Icon = CLASSIC_HIGHLIGHT_ICON_MAP[item.icon] ?? Star;
                    return (
                      <div key={`${item.icon}-${index}`} className="text-center">
                        <Icon size={24} className="mx-auto mb-2 text-slate-600" />
                        <p className="text-xs text-slate-600">{item.text}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {layoutStyle === 'modern' && (
          <div className="space-y-6">
            <header className="border-b border-slate-100 pb-4">
              <div className="flex items-center justify-between gap-4 text-sm text-slate-400">
                <div className="flex items-center gap-2 truncate">
                  <span className="hover:text-slate-600">Trang chủ</span>
                  <ChevronRight size={14} />
                  <span className="hover:text-slate-600">Sản phẩm</span>
                  <ChevronRight size={14} />
                  <span className="text-slate-600 truncate">{productName}</span>
                </div>
                {showWishlist && (
                  <button className="inline-flex items-center gap-2 text-sm text-slate-500">
                    <Heart size={16} className="text-slate-400" />
                    Yêu thích
                  </button>
                )}
              </div>
            </header>

            <div className="grid md:grid-cols-2 gap-6 lg:gap-10">
              <div className="space-y-4">
                {heroStyle === 'split' ? (
                  <div className={`overflow-hidden ${heroContainerClass}`}>
                    <div className="grid md:grid-cols-2 gap-4 items-center p-4 md:p-6">
                      <div className="aspect-square rounded-xl bg-slate-100 flex items-center justify-center">
                        <div className="w-32 h-32 bg-slate-200 rounded-lg" />
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
                      <div className="w-40 h-40 bg-slate-200 rounded-xl" />
                    </div>
                  </div>
                )}

                {heroStyle !== 'minimal' && (
                  <div className="grid grid-cols-3 gap-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="aspect-square bg-slate-100 rounded-xl border-2 border-transparent" />
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-5">
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                    {categoryName}
                  </span>
                </div>

                <h1 className="text-2xl md:text-3xl font-light tracking-tight text-slate-900">{productName}</h1>

                {showRating && (
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} size={14} className={star <= Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'} />
                      ))}
                    </div>
                    <span>{rating} ({reviews})</span>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-light" style={{ color: brandColor }}>{formatVND(price)}</span>
                    <span className="text-lg text-slate-400 line-through">{formatVND(originalPrice)}</span>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-red-500 px-3 py-1 text-xs font-semibold text-white">Giảm {discountPercent}%</span>
                </div>

                <VariantPreview brandColor={brandColor} />

                <div className="h-px w-full bg-slate-100" />

                <div className="text-slate-600 leading-relaxed text-sm">
                  Thiết kế sang trọng, màn hình sắc nét và hiệu năng mạnh mẽ cho nhu cầu cao cấp.
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Số lượng</label>
                  <div className="flex items-center gap-3">
                    <button type="button" className="h-10 w-10 border border-slate-200 rounded-full flex items-center justify-center">
                      <Minus className="w-4 h-4" />
                    </button>
                    <div className="w-16 text-center">
                      <span className="text-lg font-medium">1</span>
                    </div>
                    <button type="button" className="h-10 w-10 border border-slate-200 rounded-full flex items-center justify-center">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {(showAddToCart || showBuyNow || showWishlist) && (
                  <div className="space-y-3">
                    {showAddToCart && (
                      <button className="w-full h-12 text-base font-semibold text-white" style={{ backgroundColor: brandColor }}>
                        <ShoppingBag className="w-5 h-5 mr-2 inline-block" />
                        Thêm vào giỏ hàng
                      </button>
                    )}
                    {showBuyNow && (
                      <button className="w-full h-12 text-base font-semibold border" style={{ borderColor: brandColor, color: brandColor }}>
                        Mua ngay
                      </button>
                    )}
                    {showWishlist && (
                      <button className="w-full h-12 text-base border border-slate-200 text-slate-700">
                        <Heart className="w-5 h-5 mr-2 inline-block" />
                        Thêm vào yêu thích
                      </button>
                    )}
                  </div>
                )}

              </div>
            </div>
          </div>
        )}

        {layoutStyle === 'minimal' && (
          <div className={`space-y-6 ${contentWidthClass} mx-auto`}>
            <div className="text-xs text-slate-400 flex items-center gap-2">
              <span>Trang chủ</span>
              <ChevronRight size={12} />
              <span>Sản phẩm</span>
              <ChevronRight size={12} />
              <span className="text-slate-600 truncate max-w-[160px]">{productName}</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-8">
              <div className="lg:col-span-7">
                <div className="flex flex-col-reverse md:flex-row gap-4">
                  <div className="flex md:flex-col gap-4 overflow-x-auto md:overflow-y-auto md:w-24 shrink-0">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="relative aspect-square w-20 md:w-full overflow-hidden rounded-sm bg-slate-100 border border-transparent" />
                    ))}
                  </div>

                  <div className="flex-1 relative bg-slate-100 aspect-[4/5] rounded-sm overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-32 h-32 bg-slate-200 rounded-lg" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 px-0 md:px-2 py-6 lg:py-0 flex flex-col justify-center">
                <div className="mb-6">
                  <h1 className="text-3xl md:text-4xl font-light text-slate-900 tracking-tight mb-4">{productName}</h1>
                  {showRating && (
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} size={14} className={star <= Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'} />
                        ))}
                      </div>
                      <span>{rating} ({reviews})</span>
                    </div>
                  )}
                  <p className="text-2xl text-slate-600 font-light" style={{ color: brandColor }}>
                    {formatVND(price)}
                  </p>
                  <div className="mt-4">
                    <VariantPreview brandColor={brandColor} />
                  </div>
                </div>

                {(showAddToCart || showBuyNow || showWishlist) && (
                  <div className="flex flex-col gap-3 mb-6 border-t border-slate-100 pt-6">
                    <div className="flex gap-4">
                      {showAddToCart && (
                        <button className="flex-1 bg-black text-white h-14 uppercase tracking-wider text-sm font-medium">
                          Thêm vào giỏ
                        </button>
                      )}
                      {showWishlist && (
                        <button className="w-14 h-14 border flex items-center justify-center">
                          <Heart size={20} className="text-slate-400" />
                        </button>
                      )}
                    </div>
                    {showBuyNow && (
                      <button className="h-12 uppercase tracking-wider text-xs font-medium border" style={{ borderColor: '#0f172a', color: '#0f172a' }}>
                        Mua ngay
                      </button>
                    )}
                  </div>
                )}

                <div className="space-y-4 text-sm text-slate-500 font-light">
                  <div className="text-slate-600 leading-relaxed">
                    Thiết kế tối giản, tập trung trải nghiệm và chi tiết sản phẩm.
                  </div>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <span>SKU</span>
                    <span className="font-mono text-slate-700">{sku}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <span>Tình trạng</span>
                    <span className={stock > 0 ? 'text-emerald-600' : 'text-red-500'}>
                      {stock > 0 ? 'Còn hàng' : 'Hết hàng'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
