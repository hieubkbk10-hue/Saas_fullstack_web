import React from 'react';
import { Clock, Minus, Plus, ShoppingCart, Trash2, X } from 'lucide-react';

type CartPreviewProps = {
  layoutStyle: 'drawer' | 'page';
  showGuestCart: boolean;
  showExpiry: boolean;
  showNote: boolean;
  device?: 'desktop' | 'tablet' | 'mobile';
  brandColor?: string;
};

const mockCartItems = [
  { id: 1, name: 'iPhone 15 Pro Max 256GB', price: 34990000, quantity: 1 },
  { id: 2, name: 'AirPods Pro 2nd Gen', price: 6490000, quantity: 2 },
];

const formatVND = (price: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
const subtotal = mockCartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

type CartItem = (typeof mockCartItems)[number];

function CartItemRow({ item, brandColor }: { item: CartItem; brandColor: string }) {
  return (
    <div className="flex gap-3 py-3 border-b border-slate-100 last:border-0">
      <div className="w-16 h-16 bg-slate-100 rounded-lg flex-shrink-0 flex items-center justify-center">
        <div className="w-10 h-10 bg-slate-200 rounded" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-slate-900 text-sm line-clamp-1">{item.name}</h4>
        <p className="text-sm font-semibold mt-0.5" style={{ color: brandColor }}>{formatVND(item.price)}</p>
        <div className="flex items-center gap-2 mt-2">
          <button className="w-6 h-6 rounded border border-slate-200 flex items-center justify-center hover:bg-slate-50">
            <Minus size={12} className="text-slate-500" />
          </button>
          <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
          <button className="w-6 h-6 rounded border border-slate-200 flex items-center justify-center hover:bg-slate-50">
            <Plus size={12} className="text-slate-500" />
          </button>
        </div>
      </div>
      <div className="flex flex-col items-end justify-between">
        <button className="p-1 hover:bg-red-50 rounded">
          <Trash2 size={14} className="text-slate-400 hover:text-red-500" />
        </button>
        <span className="text-sm font-semibold text-slate-700">{formatVND(item.price * item.quantity)}</span>
      </div>
    </div>
  );
}

function CartSummary({ subtotal, brandColor }: { subtotal: number; brandColor: string }) {
  return (
    <div className="bg-slate-50 rounded-xl p-4 space-y-3">
      <div className="flex justify-between text-sm">
        <span className="text-slate-500">Tạm tính</span>
        <span className="font-medium">{formatVND(subtotal)}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-slate-500">Phí vận chuyển</span>
        <span className="text-slate-400">Tính khi checkout</span>
      </div>
      <div className="border-t border-slate-200 pt-3 flex justify-between">
        <span className="font-semibold text-slate-900">Tổng cộng</span>
        <span className="text-lg font-bold" style={{ color: brandColor }}>{formatVND(subtotal)}</span>
      </div>
      <button className="w-full py-3 rounded-xl text-white font-semibold text-sm" style={{ backgroundColor: brandColor }}>
        Tiến hành thanh toán
      </button>
    </div>
  );
}

export function CartPreview({
  layoutStyle,
  showGuestCart,
  showExpiry,
  showNote,
  device = 'desktop',
  brandColor = '#f97316',
}: CartPreviewProps) {
  const isMobile = device === 'mobile';


  return (
    <div className="min-h-[300px]">
      {layoutStyle === 'drawer' ? (
        <div className="flex h-full">
          {/* Main page content placeholder */}
          <div className="flex-1 bg-slate-50 p-4 flex items-center justify-center">
            <div className="text-center text-slate-400">
              <div className="w-20 h-20 bg-slate-200 rounded-lg mx-auto mb-2" />
              <p className="text-sm">Nội dung trang</p>
            </div>
          </div>
          {/* Drawer */}
          <div className="w-80 bg-white border-l border-slate-200 p-4 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ShoppingCart size={18} style={{ color: brandColor }} />
                <h3 className="font-semibold text-slate-900">Giỏ hàng ({mockCartItems.length})</h3>
              </div>
              <button className="p-1 hover:bg-slate-100 rounded">
                <X size={18} className="text-slate-400" />
              </button>
            </div>
            {showGuestCart && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 mb-3 text-xs text-amber-700 text-center">
                Đăng nhập để lưu giỏ hàng
              </div>
            )}
            {showExpiry && (
              <div className="flex items-center justify-center gap-1.5 text-xs text-red-500 mb-3">
                <Clock size={12} />
                <span>Giỏ hàng hết hạn sau 29:45</span>
              </div>
            )}
            <div className="flex-1 overflow-auto">
              {mockCartItems.map(item => <CartItemRow key={item.id} item={item} brandColor={brandColor} />)}
            </div>
            {showNote && (
              <div className="mt-3">
                <textarea 
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none" 
                  rows={2} 
                  placeholder="Ghi chú đơn hàng..."
                  disabled
                />
              </div>
            )}
            <div className="mt-3 pt-3 border-t border-slate-200">
              <div className="flex justify-between mb-3">
                <span className="text-sm text-slate-500">Tổng cộng</span>
                <span className="font-bold" style={{ color: brandColor }}>{formatVND(subtotal)}</span>
              </div>
              <button className="w-full py-2.5 rounded-lg text-white font-semibold text-sm" style={{ backgroundColor: brandColor }}>
                Thanh toán
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="py-6 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-slate-900">Giỏ hàng của bạn</h1>
                <p className="text-sm text-slate-500">{mockCartItems.length} sản phẩm</p>
              </div>
            </div>
            {showGuestCart && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 text-sm text-amber-700 text-center">
                Bạn đang mua với tư cách khách. Đăng nhập để lưu giỏ hàng!
              </div>
            )}
            {showExpiry && (
              <div className="flex items-center justify-center gap-2 text-sm text-red-500 mb-4">
                <Clock size={14} />
                <span>Giỏ hàng sẽ hết hạn sau 29:45</span>
              </div>
            )}
            <div className={`${isMobile ? 'space-y-4' : 'grid grid-cols-3 gap-6'}`}>
              <div className={`${isMobile ? '' : 'col-span-2'} bg-white rounded-xl border border-slate-200 p-4`}>
                {mockCartItems.map(item => <CartItemRow key={item.id} item={item} brandColor={brandColor} />)}
              </div>
              <div className={`${isMobile ? '' : ''}`}>
                {showNote && (
                  <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4">
                    <h4 className="font-medium text-slate-900 text-sm mb-2">Ghi chú đơn hàng</h4>
                    <textarea 
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none" 
                      rows={3} 
                      placeholder="Ghi chú cho shop..."
                      disabled
                    />
                  </div>
                )}
                <CartSummary subtotal={subtotal} brandColor={brandColor} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
