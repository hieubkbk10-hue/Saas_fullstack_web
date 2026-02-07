'use client';

import React from 'react';
import { Package } from 'lucide-react';

type AccountOrdersPreviewProps = {
  layoutStyle: 'cards' | 'compact' | 'timeline';
  showStats: boolean;
  showOrderItems: boolean;
  showPaymentMethod: boolean;
  showShippingMethod: boolean;
  showShippingAddress: boolean;
  showTracking: boolean;
  showTimeline: boolean;
  allowCancel: boolean;
  brandColor: string;
  device: 'desktop' | 'tablet' | 'mobile';
};

const formatPrice = (value: number) => new Intl.NumberFormat('vi-VN', { currency: 'VND', style: 'currency' }).format(value);

export function AccountOrdersPreview({
  layoutStyle,
  showStats,
  showOrderItems,
  showPaymentMethod,
  showShippingMethod,
  showShippingAddress,
  showTracking,
  showTimeline,
  allowCancel,
  brandColor,
  device,
}: AccountOrdersPreviewProps) {
  const containerClasses =
    layoutStyle === 'compact'
      ? 'bg-slate-50 rounded-2xl p-3 space-y-3'
      : 'bg-slate-50 rounded-2xl p-4 space-y-4';

  const orderCardClasses =
    layoutStyle === 'timeline'
      ? 'bg-white border border-slate-200 rounded-2xl p-4 space-y-3 border-l-4 border-l-slate-300'
      : 'bg-white border border-slate-200 rounded-2xl p-4 space-y-3';

  return (
    <div className={containerClasses}>
      <div>
        <h3 className="text-lg font-semibold text-slate-900">Đơn hàng của tôi</h3>
        <p className="text-xs text-slate-500">Preview account orders</p>
      </div>

      {showStats && (
        <div className={`grid gap-3 ${device === 'mobile' ? 'grid-cols-2' : 'grid-cols-4'}`}>
          {['Tổng chi tiêu', 'Đang xử lý', 'Đã giao', 'Sản phẩm'].map((label) => (
            <div key={label} className="rounded-xl bg-white border border-slate-200 p-3">
              <div className="text-[10px] text-slate-500">{label}</div>
              <div className="text-sm font-semibold text-slate-900">{label === 'Tổng chi tiêu' ? formatPrice(1280000) : '6'}</div>
            </div>
          ))}
        </div>
      )}

      <div className={orderCardClasses}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500">Mã đơn hàng</div>
            <div className="text-sm font-semibold text-slate-900">ORD-20260207-1234</div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">Chờ xử lý</span>
        </div>

        <div className="text-xs text-slate-500">2 sản phẩm · {formatPrice(640000)}</div>

        <div className="border-t border-slate-100 pt-3 space-y-3">
          {showPaymentMethod && (
            <div>
              <div className="text-[10px] text-slate-500">Thanh toán</div>
              <div className="text-xs font-medium text-slate-900">COD</div>
            </div>
          )}

          {showShippingMethod && (
            <div>
              <div className="text-[10px] text-slate-500">Giao hàng</div>
              <div className="text-xs font-medium text-slate-900">Giao hàng tiêu chuẩn</div>
            </div>
          )}

          {showShippingAddress && (
            <div>
              <div className="text-[10px] text-slate-500">Địa chỉ</div>
              <div className="text-xs text-slate-700">Nguyễn Văn A | 0909 000 000 | Q1, HCM</div>
            </div>
          )}

          {showOrderItems && (
            <div className="space-y-2">
              <div className="text-[10px] text-slate-500">Sản phẩm</div>
              <div className="flex items-center justify-between text-xs text-slate-700">
                <span className="flex items-center gap-2">
                  <Package size={12} className="text-slate-400" />
                  Áo thun VietAdmin (x1)
                </span>
                <span className="font-medium">{formatPrice(320000)}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-700">
                <span className="flex items-center gap-2">
                  <Package size={12} className="text-slate-400" />
                  Nón VietAdmin (x1)
                </span>
                <span className="font-medium">{formatPrice(320000)}</span>
              </div>
            </div>
          )}

          {showTracking && (
            <div>
              <div className="text-[10px] text-slate-500">Mã vận đơn</div>
              <div className="text-xs text-slate-700">Chưa có</div>
            </div>
          )}

          {showTimeline && (
            <div>
              <div className="text-[10px] text-slate-500">Timeline</div>
              <div className="text-xs text-slate-700">07/02/2026 10:30 · Đặt hàng</div>
              <div className="text-xs text-slate-500">Đang xử lý</div>
            </div>
          )}

          {allowCancel && (
            <div className="flex justify-end">
              <button className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white" style={{ backgroundColor: brandColor }}>
                Hủy đơn
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
