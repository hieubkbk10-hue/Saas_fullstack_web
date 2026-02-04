'use client';

import React, { useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Clock, Minus, Plus, ShoppingCart, Trash2, X } from 'lucide-react';
import { useCart } from '@/lib/cart';
import { useCartConfig } from '@/lib/experiences';
import { useBrandColor } from './hooks';
import { useCustomerAuth } from '@/app/(site)/auth/context';

const formatVND = (value: number) => new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
}).format(value);

export function CartDrawer() {
  const brandColor = useBrandColor();
  const { cart, items, itemsCount, totalAmount, isDrawerOpen, closeDrawer, updateQuantity, removeItem, updateNote } = useCart();
  const { layoutStyle, showExpiry, showNote } = useCartConfig();
  const { isAuthenticated, openLoginModal } = useCustomerAuth();

  const expiresAt = cart?.expiresAt ?? null;
  const expiresInText = useMemo(() => {
    if (!expiresAt) {
      return null;
    }
    const expiry = new Date(expiresAt);
    return `Giỏ hàng hết hạn lúc ${expiry.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
  }, [expiresAt]);

  if (layoutStyle !== 'drawer' || !isDrawerOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[60] flex">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        onClick={closeDrawer}
        aria-label="Đóng giỏ hàng"
      />
      <div className="ml-auto w-full max-w-sm bg-white dark:bg-slate-900 h-full shadow-xl flex flex-col relative">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <ShoppingCart size={18} style={{ color: brandColor }} />
            <h3 className="font-semibold text-slate-900 dark:text-white">Giỏ hàng ({itemsCount})</h3>
          </div>
          <button type="button" className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded" onClick={closeDrawer}>
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        {!isAuthenticated && (
          <div className="p-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-700 text-center">
              Vui lòng đăng nhập để sử dụng giỏ hàng.
            </div>
            <button
              type="button"
              onClick={openLoginModal}
              className="mt-3 w-full py-2.5 rounded-lg text-white font-semibold text-sm"
              style={{ backgroundColor: brandColor }}
            >
              Đăng nhập
            </button>
          </div>
        )}

        {isAuthenticated && (
          <>
            {showExpiry && expiresInText && (
              <div className="px-4 pt-3">
                <div className="flex items-center justify-center gap-1.5 text-xs text-red-500">
                  <Clock size={12} />
                  <span>{expiresInText}</span>
                </div>
              </div>
            )}

            <div className="flex-1 overflow-auto px-4 py-3 space-y-3">
              {items.length === 0 && (
                <div className="text-sm text-slate-500 text-center py-8">Giỏ hàng đang trống.</div>
              )}
              {items.map(item => (
                <div key={item._id} className="flex gap-3 py-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
                  <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-lg flex-shrink-0 overflow-hidden">
                    {item.productImage ? (
                      <Image src={item.productImage} alt={item.productName} width={64} height={64} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-slate-200 dark:bg-slate-700" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-slate-900 dark:text-white text-sm line-clamp-2">{item.productName}</h4>
                    <p className="text-sm font-semibold mt-0.5" style={{ color: brandColor }}>{formatVND(item.price)}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        type="button"
                        className="w-6 h-6 rounded border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800"
                        onClick={() => updateQuantity(item._id, item.quantity - 1)}
                      >
                        <Minus size={12} className="text-slate-500" />
                      </button>
                      <span className="text-sm font-medium w-6 text-center text-slate-700 dark:text-slate-200">{item.quantity}</span>
                      <button
                        type="button"
                        className="w-6 h-6 rounded border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800"
                        onClick={() => updateQuantity(item._id, item.quantity + 1)}
                      >
                        <Plus size={12} className="text-slate-500" />
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <button
                      type="button"
                      className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                      onClick={() => removeItem(item._id)}
                    >
                      <Trash2 size={14} className="text-slate-400 hover:text-red-500" />
                    </button>
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{formatVND(item.subtotal)}</span>
                  </div>
                </div>
              ))}
            </div>

            {showNote && (
              <div className="px-4 pb-2">
                <textarea
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm resize-none bg-white dark:bg-slate-900"
                  rows={2}
                  placeholder="Ghi chú đơn hàng..."
                  value={cart?.note ?? ''}
                  onChange={(event) => updateNote(event.target.value)}
                />
              </div>
            )}

            <div className="mt-auto px-4 py-4 border-t border-slate-200 dark:border-slate-700">
              <div className="flex justify-between mb-3">
                <span className="text-sm text-slate-500">Tổng cộng</span>
                <span className="font-bold" style={{ color: brandColor }}>{formatVND(totalAmount)}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/cart"
                  onClick={closeDrawer}
                  className="py-2 rounded-lg text-center text-sm font-medium border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
                >
                  Xem giỏ hàng
                </Link>
                <button
                  type="button"
                  className="py-2 rounded-lg text-white text-sm font-semibold"
                  style={{ backgroundColor: brandColor }}
                  disabled={items.length === 0}
                >
                  Thanh toán
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
