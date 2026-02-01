import React from 'react';
import { Clock, ShoppingCart, X } from 'lucide-react';

type CartPreviewProps = {
  layoutStyle: 'drawer' | 'page';
  showGuestCart: boolean;
  showExpiry: boolean;
  showNote: boolean;
};

type CartContentProps = {
  showGuestCart: boolean;
  showExpiry: boolean;
  showNote: boolean;
};

function CartContent({ showGuestCart, showExpiry, showNote }: CartContentProps) {
  return (
    <div className="space-y-2">
      {showGuestCart && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded p-1 text-amber-700 dark:text-amber-400 text-center">
          Guest Cart
        </div>
      )}
      {showExpiry && (
        <div className="flex items-center gap-1 text-red-600 dark:text-red-400 justify-center">
          <Clock size={10} />
          <span>Hết hạn sau 30 phút</span>
        </div>
      )}
      <div className="space-y-1">
        {[1, 2].map((i) => (
          <div key={i} className="border border-slate-200 dark:border-slate-700 rounded p-1 flex gap-1">
            <div className="bg-slate-200 dark:bg-slate-700 rounded w-8 h-8" />
            <div className="flex-1 space-y-0.5">
              <div className="bg-slate-200 dark:bg-slate-700 rounded h-2" />
              <div className="bg-slate-200 dark:bg-slate-700 rounded h-1 w-1/3" />
            </div>
            <X size={10} className="text-slate-400" />
          </div>
        ))}
      </div>
      {showNote && (
        <div className="bg-slate-100 dark:bg-slate-800 rounded p-1">
          <textarea 
            className="w-full bg-transparent text-xs text-slate-500 resize-none" 
            rows={2} 
            placeholder="Ghi chú đơn hàng..."
            disabled
          />
        </div>
      )}
      <div className="bg-orange-500 text-white rounded p-1 text-center">
        Checkout
      </div>
    </div>
  );
}

export function CartPreview({
  layoutStyle,
  showExpiry,
  showNote,
  showGuestCart,
}: CartPreviewProps) {
  return (
    <div className="space-y-3 text-xs">
      <div className="bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded p-2">
        <span className="font-medium text-orange-700 dark:text-orange-400">Layout: {layoutStyle}</span>
      </div>

      {layoutStyle === 'drawer' && (
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-slate-200 dark:bg-slate-700 rounded h-32 flex items-center justify-center text-slate-500">
            Page Content
          </div>
          <div className="border-l-2 border-orange-300 dark:border-orange-700 pl-2">
            <div className="flex items-center gap-1 mb-2 text-orange-600 dark:text-orange-400">
              <ShoppingCart size={10} />
              <span className="font-medium">Cart Drawer</span>
            </div>
            <CartContent showGuestCart={showGuestCart} showExpiry={showExpiry} showNote={showNote} />
          </div>
        </div>
      )}

      {layoutStyle === 'page' && (
        <div className="border border-orange-200 dark:border-orange-700 rounded p-2">
          <div className="flex items-center gap-1 mb-2 text-orange-600 dark:text-orange-400">
            <ShoppingCart size={12} />
            <span className="font-medium">Giỏ hàng của bạn</span>
          </div>
          <CartContent showGuestCart={showGuestCart} showExpiry={showExpiry} showNote={showNote} />
        </div>
      )}
    </div>
  );
}
