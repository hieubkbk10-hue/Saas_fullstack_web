'use client';

import React from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';

type OrderDetailItem = {
  name: string;
  quantity: number;
  priceLabel: string;
  image?: string;
  variantTitle?: string;
};

type OrderDetailDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  brandColor: string;
  title: string;
  subtitle?: string;
  statusLabel: string;
  statusColor?: string;
  totalLabel: string;
  items?: OrderDetailItem[];
  showItems?: boolean;
  showTimeline?: boolean;
  timelineStep?: number;
  timelineLabels?: string[];
  showPaymentMethod?: boolean;
  paymentMethod?: string;
  showShippingMethod?: boolean;
  shippingMethod?: string;
  showTracking?: boolean;
  tracking?: string;
  showShippingAddress?: boolean;
  shippingAddress?: string;
  allowCancel?: boolean;
  onCancel?: () => void;
  onReorder?: () => void;
};

const hexToRgba = (hex: string, opacity: number) => {
  const cleaned = hex.replace('#', '');
  if (cleaned.length !== 3 && cleaned.length !== 6) {
    return hex;
  }
  const normalized = cleaned.length === 3
    ? cleaned.split('').map((char) => char + char).join('')
    : cleaned;
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) {
    return hex;
  }
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

const getTint = (color: string, opacity: number) => hexToRgba(color, opacity);

export function OrderDetailDrawer({
  isOpen,
  onClose,
  brandColor,
  title,
  subtitle,
  statusLabel,
  statusColor,
  totalLabel,
  items,
  showItems,
  showTimeline,
  timelineStep,
  timelineLabels,
  showPaymentMethod,
  paymentMethod,
  showShippingMethod,
  shippingMethod,
  showTracking,
  tracking,
  showShippingAddress,
  shippingAddress,
  allowCancel,
  onCancel,
  onReorder,
}: OrderDetailDrawerProps) {
  if (!isOpen) {
    return null;
  }

  const badgeColor = statusColor ?? brandColor;
  const timelineSteps = timelineLabels ?? [];
  const safeStep = Math.min(Math.max(timelineStep ?? 1, 1), timelineSteps.length || 1);

  return (
    <div className="fixed inset-0 z-[70] flex">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-label="Đóng chi tiết đơn hàng"
      />
      <div className="ml-auto w-full max-w-xl bg-white h-full shadow-xl flex flex-col relative">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <div className="space-y-1">
            <div className="text-xs text-slate-500">{subtitle}</div>
            <div className="text-lg font-semibold text-slate-900">{title}</div>
          </div>
          <div className="flex items-center gap-3">
            <span
              className="px-3 py-1 rounded-full text-xs font-semibold border"
              style={{
                backgroundColor: getTint(badgeColor, 0.12),
                color: badgeColor,
                borderColor: getTint(badgeColor, 0.3),
              }}
            >
              {statusLabel}
            </span>
            <button type="button" className="p-1 rounded hover:bg-slate-100" onClick={onClose}>
              <X size={18} className="text-slate-500" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto px-5 py-4 space-y-5">
          <div className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 bg-slate-50">
            <div className="text-xs text-slate-500 uppercase">Tổng tiền</div>
            <div className="text-lg font-semibold" style={{ color: brandColor }}>
              {totalLabel}
            </div>
          </div>

          {showTimeline && timelineSteps.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-500 uppercase">Tiến trình</div>
              <div className="flex items-center gap-2">
                {timelineSteps.map((label, index) => {
                  const active = index < safeStep;
                  return (
                    <div key={label} className="flex items-center gap-2">
                      <div
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: active ? brandColor : getTint(brandColor, 0.2) }}
                      />
                      {index < timelineSteps.length - 1 && (
                        <div
                          className="h-[2px] w-8"
                          style={{ backgroundColor: active ? brandColor : getTint(brandColor, 0.2) }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="text-xs text-slate-500">Bước hiện tại: {timelineSteps[safeStep - 1]}</div>
            </div>
          )}

          {showItems && items && items.length > 0 && (
            <div className="space-y-3">
              <div className="text-xs font-semibold text-slate-500 uppercase">Sản phẩm</div>
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={`${item.name}-${item.quantity}`} className="flex items-start gap-3">
                    <div
                      className="h-12 w-12 rounded-md border overflow-hidden flex items-center justify-center"
                      style={{ borderColor: getTint(brandColor, 0.2), backgroundColor: getTint(brandColor, 0.08) }}
                    >
                      {item.image ? (
                        <Image src={item.image} alt={item.name} width={48} height={48} className="h-full w-full object-cover" />
                      ) : (
                        <div className="text-xs font-semibold" style={{ color: brandColor }}>IMG</div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-slate-900">{item.name}</div>
                      {item.variantTitle && <div className="text-xs text-slate-500">{item.variantTitle}</div>}
                      <div className="text-xs text-slate-500">Số lượng: {item.quantity}</div>
                    </div>
                    <div className="text-sm font-semibold text-slate-900">{item.priceLabel}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(showPaymentMethod || showShippingMethod || showTracking) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {showPaymentMethod && (
                <div>
                  <div className="text-[10px] text-slate-500">Thanh toán</div>
                  <div className="text-xs font-medium text-slate-900">{paymentMethod}</div>
                </div>
              )}
              {showShippingMethod && (
                <div>
                  <div className="text-[10px] text-slate-500">Giao hàng</div>
                  <div className="text-xs font-medium text-slate-900">{shippingMethod}</div>
                </div>
              )}
              {showTracking && (
                <div>
                  <div className="text-[10px] text-slate-500">Tracking</div>
                  <div className="text-xs font-medium text-slate-900">{tracking}</div>
                </div>
              )}
            </div>
          )}

          {showShippingAddress && (
            <div>
              <div className="text-[10px] text-slate-500">Địa chỉ</div>
              <div className="text-xs font-medium text-slate-900">{shippingAddress}</div>
            </div>
          )}
        </div>

        <div className="px-5 py-4 border-t border-slate-200 flex flex-wrap justify-end gap-2">
          {onReorder && (
            <button
              type="button"
              onClick={onReorder}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
              style={{ backgroundColor: brandColor }}
            >
              Mua lại
            </button>
          )}
          {allowCancel && onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
              style={{ backgroundColor: brandColor }}
            >
              Hủy đơn
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-semibold border"
            style={{ borderColor: getTint(brandColor, 0.3), color: brandColor }}
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
