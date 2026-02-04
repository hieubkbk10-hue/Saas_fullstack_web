import React from 'react';
import { Heart, ShoppingCart, Star } from 'lucide-react';

type ProductDetailPreviewProps = {
  layoutStyle: 'classic' | 'modern' | 'minimal';
  showRating: boolean;
  showWishlist: boolean;
  showAddToCart: boolean;
  showBuyNow: boolean;
  showClassicHighlights: boolean;
  device?: 'desktop' | 'tablet' | 'mobile';
  brandColor?: string;
};

const formatVND = (price: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

export function ProductDetailPreview({
  layoutStyle,
  showRating,
  showWishlist,
  showAddToCart,
  showBuyNow,
  showClassicHighlights,
  device = 'desktop',
  brandColor = '#06b6d4',
}: ProductDetailPreviewProps) {
  const isMobile = device === 'mobile';
  const productName = 'iPhone 15 Pro Max 256GB';
  const price = 34990000;
  const originalPrice = 36990000;
  const rating = 4.8;
  const reviews = 234;

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
              {showClassicHighlights && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <h4 className="font-medium text-amber-800 mb-2">Điểm nổi bật</h4>
                  <ul className="text-sm text-amber-700 space-y-1">
                    <li>• Chip A17 Pro mạnh mẽ</li>
                    <li>• Camera 48MP chuyên nghiệp</li>
                    <li>• Titanium siêu bền</li>
                  </ul>
                </div>
              )}
              <div className="flex flex-col gap-3">
                {showWishlist && (
                  <button className="p-3 border border-slate-200 rounded-xl hover:bg-pink-50 hover:border-pink-300">
                    <Heart size={20} className="text-pink-500" />
                  </button>
                )}
                {showAddToCart && (
                  <button className="flex-1 py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2" style={{ backgroundColor: brandColor }}>
                    <ShoppingCart size={18} />
                    Thêm vào giỏ hàng
                  </button>
                )}
                {showBuyNow && (
                  <button className="flex-1 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 border" style={{ borderColor: brandColor, color: brandColor }}>
                    Mua ngay
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {layoutStyle === 'modern' && (
          <div className="space-y-6">
            <div className="relative h-48 md:h-64 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center">
              <div className="w-40 h-40 bg-white rounded-xl shadow-lg" />
              {showWishlist && (
                <button className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-sm">
                  <Heart size={20} className="text-pink-500" />
                </button>
              )}
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="aspect-square bg-slate-100 rounded-lg" />
              ))}
            </div>
            <div className="space-y-3">
              <h1 className="text-xl font-bold text-slate-900">{productName}</h1>
              <div className="flex items-center justify-between">
                {showRating && (
                  <div className="flex items-center gap-1">
                    <Star size={16} className="text-amber-400 fill-amber-400" />
                    <span className="font-medium">{rating}</span>
                    <span className="text-slate-400 text-sm">({reviews})</span>
                  </div>
                )}
                <span className="text-xl font-bold" style={{ color: brandColor }}>{formatVND(price)}</span>
              </div>
              {(showAddToCart || showBuyNow) && (
                <div className="space-y-2">
                  {showAddToCart && (
                    <button className="w-full py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2" style={{ backgroundColor: brandColor }}>
                      <ShoppingCart size={18} />
                      Thêm vào giỏ hàng
                    </button>
                  )}
                  {showBuyNow && (
                    <button className="w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 border" style={{ borderColor: brandColor, color: brandColor }}>
                      Mua ngay
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {layoutStyle === 'minimal' && (
          <div className="space-y-4">
            <div className="aspect-video bg-slate-100 rounded-xl flex items-center justify-center">
              <div className="w-32 h-32 bg-slate-200 rounded-lg" />
            </div>
            <div className="space-y-3">
              <h1 className="text-lg font-semibold text-slate-900">{productName}</h1>
              {showRating && (
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className={i < Math.floor(rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-200'} />
                  ))}
                </div>
              )}
              <span className="text-xl font-bold block" style={{ color: brandColor }}>{formatVND(price)}</span>
              <div className="flex flex-col gap-2">
                {showWishlist && (
                  <button className="p-2.5 border border-pink-200 rounded-lg">
                    <Heart size={16} className="text-pink-500" />
                  </button>
                )}
                {showAddToCart && (
                  <button className="flex-1 py-2.5 rounded-lg text-white font-medium flex items-center justify-center gap-1.5 text-sm" style={{ backgroundColor: brandColor }}>
                    <ShoppingCart size={14} />
                    Thêm vào giỏ
                  </button>
                )}
                {showBuyNow && (
                  <button className="flex-1 py-2.5 rounded-lg font-medium flex items-center justify-center gap-1.5 text-sm border" style={{ borderColor: brandColor, color: brandColor }}>
                    Mua ngay
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
