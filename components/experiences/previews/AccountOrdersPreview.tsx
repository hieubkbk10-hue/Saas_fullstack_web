'use client';

import React from 'react';
import Image from 'next/image';
import { ArrowUpRight, CheckCircle2, Clock, DollarSign, Package, ShoppingBag } from 'lucide-react';

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

const STATUS_CONFIG = {
  pending: { label: 'Chờ xử lý', step: 1 },
  processing: { label: 'Đang xử lý', step: 2 },
  shipping: { label: 'Đang giao', step: 3 },
  delivered: { label: 'Đã giao', step: 4 },
};

const STATUS_TONES: Record<string, number> = {
  pending: 0.08,
  processing: 0.12,
  shipping: 0.16,
  delivered: 0.2,
};

const TIMELINE_STEPS = ['Đặt hàng', 'Xác nhận', 'Vận chuyển', 'Hoàn thành'];

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

const getBrandTint = (color: string, opacity: number) => hexToRgba(color, opacity);

const MOCK_ORDERS = [
  {
    id: 'ORD-20260207-1234',
    date: '07/02/2026',
    total: 640000,
    itemsCount: 2,
    status: 'pending' as const,
    paymentMethod: 'COD',
    shippingMethod: 'Giao hàng tiêu chuẩn',
    shippingAddress: 'Nguyễn Văn A | 0909 000 000 | Q1, HCM',
    trackingCode: 'Chưa có',
    items: [
      { name: 'Áo thun VietAdmin', quantity: 1, price: 320000, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200' },
      { name: 'Nón VietAdmin', quantity: 1, price: 320000, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=201' },
    ],
  },
  {
    id: 'ORD-20260205-4567',
    date: '05/02/2026',
    total: 320000,
    itemsCount: 1,
    status: 'delivered' as const,
    paymentMethod: 'Chuyển khoản',
    shippingMethod: 'Giao nhanh 2h',
    shippingAddress: 'Nguyễn Văn A | 0909 000 000 | Q1, HCM',
    trackingCode: 'GHTK-456789',
    items: [{ name: 'Áo khoác VietAdmin', quantity: 1, price: 320000, image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=200' }],
  },
];

type Order = (typeof MOCK_ORDERS)[number];

function StatusBadge({ status, brandColor }: { status: Order['status']; brandColor: string }) {
  const statusConfig = STATUS_CONFIG[status];
  const tone = STATUS_TONES[status] ?? 0.1;
  return (
    <span
      className="text-xs font-semibold px-2.5 py-1 rounded-full border"
      style={{
        backgroundColor: getBrandTint(brandColor, tone),
        color: brandColor,
        borderColor: getBrandTint(brandColor, 0.3),
      }}
    >
      {statusConfig.label}
    </span>
  );
}

function OrderItems({ items, brandColor }: { items: Order['items']; brandColor: string }) {
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item.name} className="flex items-center gap-3 text-xs text-slate-700">
          <div
            className="h-8 w-8 rounded-md border overflow-hidden flex items-center justify-center"
            style={{ borderColor: getBrandTint(brandColor, 0.2), backgroundColor: getBrandTint(brandColor, 0.08) }}
          >
            {item.image ? (
              <Image src={item.image} alt={item.name} width={32} height={32} className="h-full w-full object-cover" />
            ) : (
              <Package size={12} style={{ color: brandColor }} />
            )}
          </div>
          <div className="flex-1">
            <div className="font-medium text-slate-900">{item.name}</div>
            <div className="text-[10px] text-slate-500">Số lượng: {item.quantity}</div>
          </div>
          <span className="font-medium">{formatPrice(item.price)}</span>
        </div>
      ))}
    </div>
  );
}

function OrderMeta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] text-slate-500">{label}</div>
      <div className="text-xs font-medium text-slate-900">{value}</div>
    </div>
  );
}

function Stepper({ status, brandColor }: { status: Order['status']; brandColor: string }) {
  const step = STATUS_CONFIG[status].step;
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        {TIMELINE_STEPS.map((label, index) => {
          const active = index < step;
          return (
            <div key={label} className="flex items-center gap-2">
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: active ? brandColor : getBrandTint(brandColor, 0.2) }}
              />
              {index < TIMELINE_STEPS.length - 1 && (
                <div
                  className="h-[2px] w-8"
                  style={{ backgroundColor: active ? brandColor : getBrandTint(brandColor, 0.2) }}
                />
              )}
            </div>
          );
        })}
      </div>
      <div className="text-xs text-slate-500">Bước hiện tại: {TIMELINE_STEPS[step - 1]}</div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  highlight,
  brandColor,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  highlight?: boolean;
  brandColor: string;
}) {
  return (
    <div
      className={`rounded-xl border p-3 ${highlight ? '' : 'bg-white border-slate-200'}`}
      style={highlight ? { backgroundColor: brandColor, borderColor: brandColor } : undefined}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className={`text-[10px] ${highlight ? 'text-white/80' : 'text-slate-500'}`}>{label}</div>
          <div className={`text-sm font-semibold ${highlight ? 'text-white' : 'text-slate-900'}`}>{value}</div>
        </div>
        <div
          className={`p-1.5 rounded-lg ${highlight ? 'text-white' : ''}`}
          style={{ backgroundColor: highlight ? getBrandTint(brandColor, 0.2) : getBrandTint(brandColor, 0.08), color: highlight ? undefined : brandColor }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

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
  const isMobile = device === 'mobile';

  return (
    <div className="bg-slate-50 rounded-2xl p-4 space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">Đơn hàng của tôi</h3>
        <p className="text-xs text-slate-500">Preview account orders</p>
      </div>

      {showStats && layoutStyle === 'cards' && (
        <div className={`grid gap-3 ${isMobile ? 'grid-cols-2' : 'grid-cols-4'}`}>
          <StatCard
            label="Tổng chi tiêu"
            value={formatPrice(1280000)}
            icon={<DollarSign size={14} />}
            highlight
            brandColor={brandColor}
          />
          <StatCard label="Đang xử lý" value="6" icon={<Clock size={14} />} brandColor={brandColor} />
          <StatCard label="Đã giao" value="6" icon={<CheckCircle2 size={14} />} brandColor={brandColor} />
          <StatCard label="Sản phẩm" value="6" icon={<ShoppingBag size={14} />} brandColor={brandColor} />
        </div>
      )}

      {layoutStyle === 'cards' && (
        <div className="space-y-3">
          {MOCK_ORDERS.map((order, index) => {
            const expanded = index === 0;
            return (
              <div key={order.id} className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-slate-500">Mã đơn hàng · {order.date}</div>
                    <div className="text-sm font-semibold text-slate-900">{order.id}</div>
                  </div>
                  <StatusBadge status={order.status} brandColor={brandColor} />
                </div>
                <div className="text-xs text-slate-500">{order.itemsCount} sản phẩm · {formatPrice(order.total)}</div>
                <div className="border-t pt-3 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Tổng thanh toán</span>
                  <span className="font-semibold text-slate-900">{formatPrice(order.total)}</span>
                </div>
                {expanded && (
                  <div
                    className="border-t pt-3 space-y-3"
                    style={{ borderColor: getBrandTint(brandColor, 0.16) }}
                  >
                    {showOrderItems && (
                      <div>
                        <div className="text-[10px] text-slate-500 mb-2">Sản phẩm</div>
                        <OrderItems items={order.items} brandColor={brandColor} />
                      </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {showPaymentMethod && <OrderMeta label="Thanh toán" value={order.paymentMethod} />}
                      {showShippingMethod && <OrderMeta label="Giao hàng" value={order.shippingMethod} />}
                      {showTracking && <OrderMeta label="Tracking" value={order.trackingCode} />}
                    </div>
                    {showShippingAddress && <OrderMeta label="Địa chỉ" value={order.shippingAddress} />}
                    {showTimeline && <Stepper status={order.status} brandColor={brandColor} />}
                    <div className="flex flex-wrap justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {}}
                        className="px-3 py-2 rounded-lg text-xs font-semibold border"
                        style={{ borderColor: getBrandTint(brandColor, 0.3), color: brandColor }}
                      >
                        Hóa đơn VAT
                      </button>
                      <button
                        type="button"
                        onClick={() => {}}
                        className="px-3 py-2 rounded-lg text-xs font-semibold text-white"
                        style={{ backgroundColor: brandColor }}
                      >
                        Mua lại
                      </button>
                      <button
                        type="button"
                        onClick={() => {}}
                        className="px-3 py-2 rounded-lg text-xs font-semibold border"
                        style={{ borderColor: getBrandTint(brandColor, 0.3), color: brandColor }}
                      >
                        Xem chi tiết
                      </button>
                      {allowCancel && order.status === 'pending' && (
                        <button
                          type="button"
                          onClick={() => {}}
                          className="px-3 py-2 rounded-lg text-xs font-semibold text-white"
                          style={{ backgroundColor: brandColor }}
                        >
                          Hủy đơn
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {layoutStyle === 'compact' && (
        <div className="space-y-3">
          {!isMobile ? (
            <div className="overflow-hidden shadow ring-1 ring-black/5 sm:rounded-lg bg-white">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">Mã đơn</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">Ngày</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">Số SP</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">Tổng</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">Trạng thái</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_ORDERS.map((order) => (
                    <tr key={order.id} className="border-t hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-900">{order.id}</td>
                      <td className="px-4 py-3 text-slate-500">{order.date}</td>
                      <td className="px-4 py-3 text-slate-700">{order.itemsCount}</td>
                      <td className="px-4 py-3 font-semibold text-slate-900">{formatPrice(order.total)}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={order.status} brandColor={brandColor} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => {}}
                          className="inline-flex items-center gap-1 text-xs font-semibold"
                          style={{ color: brandColor }}
                        >
                          Chi tiết <ArrowUpRight size={12} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex items-center justify-between border-t border-slate-200 bg-white px-4 py-3">
                <p className="text-sm text-slate-600">
                  Hiển thị <span className="font-medium text-slate-900">1</span> đến{' '}
                  <span className="font-medium text-slate-900">{MOCK_ORDERS.length}</span> trong số{' '}
                  <span className="font-medium text-slate-900">{MOCK_ORDERS.length}</span> kết quả
                </p>
                <div className="inline-flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {}}
                    className="px-3 py-1.5 text-xs font-semibold border rounded-md"
                    style={{ borderColor: getBrandTint(brandColor, 0.3), color: brandColor }}
                  >
                    Trước
                  </button>
                  <button
                    type="button"
                    onClick={() => {}}
                    className="px-3 py-1.5 text-xs font-semibold text-white rounded-md"
                    style={{ backgroundColor: brandColor }}
                  >
                    Sau
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {MOCK_ORDERS.map((order) => (
                <div key={order.id} className="bg-white border border-slate-200 rounded-xl p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-slate-500">{order.id} · {order.date}</div>
                      <div className="text-sm font-semibold text-slate-900">{formatPrice(order.total)}</div>
                    </div>
                    <StatusBadge status={order.status} brandColor={brandColor} />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                    <span>{order.itemsCount} sản phẩm</span>
                    <button
                      type="button"
                      onClick={() => {}}
                      className="font-semibold"
                      style={{ color: brandColor }}
                    >
                      Chi tiết
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {layoutStyle === 'timeline' && (
        <div className="space-y-6">
          {MOCK_ORDERS.map((order) => (
            <div key={order.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-50/50">
                <div className="flex flex-wrap items-center gap-4">
                  <div>
                    <div className="text-xs text-slate-500 uppercase tracking-wide">Ngày đặt</div>
                    <div className="text-sm font-semibold text-slate-900">{order.date}</div>
                  </div>
                  <div className="hidden md:block h-8 w-px bg-slate-200" />
                  <div>
                    <div className="text-xs text-slate-500 uppercase tracking-wide">Mã đơn</div>
                    <div className="text-sm font-semibold text-slate-900">{order.id}</div>
                  </div>
                </div>
                <StatusBadge status={order.status} brandColor={brandColor} />
              </div>

              <div className="p-6 space-y-6">
                {showTimeline && <Stepper status={order.status} brandColor={brandColor} />}
                {showOrderItems && <OrderItems items={order.items} brandColor={brandColor} />}
              </div>

              <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {showTracking && (
                  <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
                    <span className="text-slate-500 font-medium">Tracking:</span>
                    <span
                      className="font-mono font-semibold px-2 py-0.5 rounded border text-xs"
                      style={{ borderColor: getBrandTint(brandColor, 0.2), color: brandColor, backgroundColor: getBrandTint(brandColor, 0.08) }}
                    >
                      {order.trackingCode}
                    </span>
                  </div>
                )}
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Tổng tiền</span>
                    <span className="text-xl font-bold" style={{ color: brandColor }}>
                      {formatPrice(order.total)}
                    </span>
                  </div>
                  {allowCancel && order.status === 'pending' ? (
                    <button
                      type="button"
                      onClick={() => {}}
                      className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
                      style={{ backgroundColor: brandColor }}
                    >
                      Hủy đơn hàng
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {}}
                      className="px-4 py-2 rounded-lg text-sm font-semibold border"
                      style={{ borderColor: getBrandTint(brandColor, 0.3), color: brandColor }}
                    >
                      Xem chi tiết
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
