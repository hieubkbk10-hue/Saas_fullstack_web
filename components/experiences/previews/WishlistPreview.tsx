import React from 'react';
import { Bell, Heart, ShoppingCart, Trash2, X } from 'lucide-react';

type WishlistPreviewProps = {
  layoutStyle: 'grid' | 'list' | 'masonry';
  showWishlistButton: boolean;
  showNote: boolean;
  showNotification: boolean;
  showAddToCartButton?: boolean;
  device?: 'desktop' | 'tablet' | 'mobile';
  brandColor?: string;
};

const mockWishlistItems = [
  { id: 1, name: 'iPhone 15 Pro Max 256GB', price: 34990000, originalPrice: 36990000, inStock: true },
  { id: 2, name: 'MacBook Pro 14" M3 Pro', price: 52990000, originalPrice: null, inStock: true },
  { id: 3, name: 'AirPods Pro 2nd Gen', price: 6490000, originalPrice: 6990000, inStock: false },
];

const masonryRatios = ['aspect-square', 'aspect-[4/5]', 'aspect-[3/4]', 'aspect-[16/9]'];

const formatVND = (price: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

export function WishlistPreview({
  layoutStyle,
  showWishlistButton,
  showNote,
  showNotification,
  showAddToCartButton = true,
  device = 'desktop',
  brandColor = '#ec4899',
}: WishlistPreviewProps) {
  const isMobile = device === 'mobile';
  const gridCols = isMobile ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-3';

  return (
    <div className="py-6 px-4 min-h-[300px]">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Heart className="w-6 h-6" style={{ color: brandColor }} fill={brandColor} />
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-slate-900">Sản phẩm yêu thích</h1>
              <p className="text-sm text-slate-500">{mockWishlistItems.length} sản phẩm</p>
            </div>
          </div>
          {showWishlistButton && (
            <button className="text-sm font-medium px-3 py-1.5 rounded-lg" style={{ backgroundColor: `${brandColor}15`, color: brandColor }}>
              Thêm tất cả vào giỏ
            </button>
          )}
        </div>

        {layoutStyle === 'grid' && (
          <div className={`grid ${gridCols} gap-4`}>
            {mockWishlistItems.map((item) => (
              <div key={item.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="aspect-square bg-slate-100 relative flex items-center justify-center">
                  <div className="w-20 h-20 bg-slate-200 rounded-lg" />
                  {!item.inStock && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="bg-slate-800 text-white text-xs px-2 py-1 rounded">Hết hàng</span>
                    </div>
                  )}
                  <button className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-sm hover:bg-red-50">
                    <Trash2 size={14} className="text-slate-400 hover:text-red-500" />
                  </button>
                </div>
                <div className="p-3 space-y-2">
                  <h3 className="font-medium text-slate-900 text-sm line-clamp-2">{item.name}</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-base font-bold" style={{ color: brandColor }}>{formatVND(item.price)}</span>
                    {item.originalPrice && (
                      <span className="text-xs text-slate-400 line-through">{formatVND(item.originalPrice)}</span>
                    )}
                  </div>
                  {showNote && (
                    <div className="bg-slate-50 rounded-lg p-2 text-xs text-slate-500">
                      <span className="font-medium">Ghi chú:</span> Mua khi giảm giá
                    </div>
                  )}
                  {showNotification && (
                    <div className="flex items-center gap-1.5 text-xs text-amber-600">
                      <Bell size={12} />
                      <span>Thông báo khi giảm giá</span>
                    </div>
                  )}
                  {showAddToCartButton && (
                    <button 
                      className="w-full py-2 rounded-lg text-sm font-medium text-white flex items-center justify-center gap-1.5 disabled:opacity-50"
                      style={{ backgroundColor: brandColor }}
                      disabled={!item.inStock}
                    >
                      <ShoppingCart size={14} />
                      {item.inStock ? 'Thêm vào giỏ' : 'Hết hàng'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {layoutStyle === 'list' && (
          <div className="space-y-3">
            {mockWishlistItems.map((item) => (
              <div key={item.id} className="bg-white rounded-xl border border-slate-200 p-4 flex gap-4 items-start hover:shadow-sm transition-shadow">
                <div className="w-20 h-20 bg-slate-100 rounded-lg flex-shrink-0 flex items-center justify-center relative">
                  <div className="w-12 h-12 bg-slate-200 rounded" />
                  {!item.inStock && (
                    <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center">
                      <span className="text-white text-xs">Hết</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-slate-900 text-sm line-clamp-1">{item.name}</h3>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-base font-bold" style={{ color: brandColor }}>{formatVND(item.price)}</span>
                    {item.originalPrice && (
                      <span className="text-xs text-slate-400 line-through">{formatVND(item.originalPrice)}</span>
                    )}
                  </div>
                  {showNote && (
                    <div className="mt-2 bg-slate-50 rounded p-1.5 text-xs text-slate-500">
                      Ghi chú: Cần mua khi giảm giá
                    </div>
                  )}
                  {showNotification && (
                    <div className="flex items-center gap-1.5 text-xs text-amber-600 mt-1.5">
                      <Bell size={12} />
                      <span>Thông báo khi giảm giá</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2 items-end">
                  <button className="p-1.5 hover:bg-red-50 rounded">
                    <X size={16} className="text-slate-400 hover:text-red-500" />
                  </button>
                  {showAddToCartButton && (
                    <button 
                      className="px-3 py-1.5 rounded-lg text-xs font-medium text-white flex items-center gap-1 disabled:opacity-50"
                      style={{ backgroundColor: brandColor }}
                      disabled={!item.inStock}
                    >
                      <ShoppingCart size={12} />
                      Thêm
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {layoutStyle === 'masonry' && (
          <div className="columns-1 sm:columns-2 lg:columns-3 [column-gap:1rem]">
            {mockWishlistItems.map((item, index) => (
              <div key={item.id} className="mb-4 break-inside-avoid">
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                  <div className={`${masonryRatios[index % masonryRatios.length]} bg-slate-100 relative flex items-center justify-center`}>
                    <div className="w-20 h-20 bg-slate-200 rounded-lg" />
                    {!item.inStock && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="bg-slate-800 text-white text-xs px-2 py-1 rounded">Hết hàng</span>
                      </div>
                    )}
                    <button className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-sm hover:bg-red-50">
                      <Trash2 size={14} className="text-slate-400 hover:text-red-500" />
                    </button>
                  </div>
                  <div className="p-3 space-y-2">
                    <h3 className="font-medium text-slate-900 text-sm line-clamp-2">{item.name}</h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-base font-bold" style={{ color: brandColor }}>{formatVND(item.price)}</span>
                      {item.originalPrice && (
                        <span className="text-xs text-slate-400 line-through">{formatVND(item.originalPrice)}</span>
                      )}
                    </div>
                    {showNote && (
                      <div className="bg-slate-50 rounded-lg p-2 text-xs text-slate-500">
                        <span className="font-medium">Ghi chú:</span> Mua khi giảm giá
                      </div>
                    )}
                    {showNotification && (
                      <div className="flex items-center gap-1.5 text-xs text-amber-600">
                        <Bell size={12} />
                        <span>Thông báo khi giảm giá</span>
                      </div>
                    )}
                    {showAddToCartButton && (
                      <button
                        className="w-full py-2 rounded-lg text-sm font-medium text-white flex items-center justify-center gap-1.5 disabled:opacity-50"
                        style={{ backgroundColor: brandColor }}
                        disabled={!item.inStock}
                      >
                        <ShoppingCart size={14} />
                        {item.inStock ? 'Thêm vào giỏ' : 'Hết hàng'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
