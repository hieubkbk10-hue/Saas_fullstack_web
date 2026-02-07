'use client';

import React from 'react';
import { ArrowUpRight, Package } from 'lucide-react';

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
  pending: { label: 'Chờ xử lý', badge: 'bg-amber-100 text-amber-700', step: 1 },
  processing: { label: 'Đang xử lý', badge: 'bg-blue-100 text-blue-700', step: 2 },
  shipping: { label: 'Đang giao', badge: 'bg-indigo-100 text-indigo-700', step: 3 },
  delivered: { label: 'Đã giao', badge: 'bg-emerald-100 text-emerald-700', step: 4 },
};

const TIMELINE_STEPS = ['Đặt hàng', 'Xác nhận', 'Vận chuyển', 'Hoàn thành'];

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
      { name: 'Áo thun VietAdmin', quantity: 1, price: 320000 },
      { name: 'Nón VietAdmin', quantity: 1, price: 320000 },
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
    items: [{ name: 'Áo khoác VietAdmin', quantity: 1, price: 320000 }],
  },
];

type Order = (typeof MOCK_ORDERS)[number];

function StatusBadge({ status }: { status: Order['status'] }) {
  const statusConfig = STATUS_CONFIG[status];
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusConfig.badge}`}>
      {statusConfig.label}
    </span>
  );
}

function OrderItems({ items }: { items: Order['items'] }) {
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item.name} className="flex items-center justify-between text-xs text-slate-700">
          <span className="flex items-center gap-2">
            <Package size={12} className="text-slate-400" />
            {item.name} (x{item.quantity})
          </span>
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

function TimelineProgress({ status }: { status: Order['status'] }) {
  const step = STATUS_CONFIG[status].step;
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        {TIMELINE_STEPS.map((label, index) => {
          const active = index < step;
          return (
            <div key={label} className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${active ? 'bg-emerald-500' : 'bg-slate-200'}`} />
              {index < TIMELINE_STEPS.length - 1 && (
                <div className={`h-[2px] w-8 ${active ? 'bg-emerald-400' : 'bg-slate-200'}`} />
              )}
            </div>
          );
        })}
      </div>
      <div className="text-xs text-slate-500">Bước hiện tại: {TIMELINE_STEPS[step - 1]}</div>
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
          {['Tổng chi tiêu', 'Đang xử lý', 'Đã giao', 'Sản phẩm'].map((label) => (
            <div key={label} className="rounded-xl bg-white border border-slate-200 p-3">
              <div className="text-[10px] text-slate-500">{label}</div>
              <div className="text-sm font-semibold text-slate-900">{label === 'Tổng chi tiêu' ? formatPrice(1280000) : '6'}</div>
            </div>
          ))}
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
                  <StatusBadge status={order.status} />
                </div>
                <div className="text-xs text-slate-500">{order.itemsCount} sản phẩm · {formatPrice(order.total)}</div>
                {expanded && (
                  <div className="border-t border-slate-100 pt-3 space-y-3">
                    {showOrderItems && (
                      <div>
                        <div className="text-[10px] text-slate-500 mb-2">Sản phẩm</div>
                        <OrderItems items={order.items} />
                      </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {showPaymentMethod && <OrderMeta label="Thanh toán" value={order.paymentMethod} />}
                      {showShippingMethod && <OrderMeta label="Giao hàng" value={order.shippingMethod} />}
                      {showTracking && <OrderMeta label="Tracking" value={order.trackingCode} />}
                    </div>
                    {showShippingAddress && <OrderMeta label="Địa chỉ" value={order.shippingAddress} />}
                    {showTimeline && <TimelineProgress status={order.status} />}
                    <div className="flex flex-wrap justify-end gap-2">
                      <button className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 border border-slate-200">
                        Xem chi tiết
                      </button>
                      {allowCancel && order.status === 'pending' && (
                        <button className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white" style={{ backgroundColor: brandColor }}>
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
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Mã đơn</th>
                    <th className="px-4 py-3 text-left font-medium">Ngày</th>
                    <th className="px-4 py-3 text-left font-medium">Số SP</th>
                    <th className="px-4 py-3 text-left font-medium">Tổng</th>
                    <th className="px-4 py-3 text-left font-medium">Trạng thái</th>
                    <th className="px-4 py-3 text-right font-medium">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_ORDERS.map((order) => (
                    <tr key={order.id} className="border-t">
                      <td className="px-4 py-3 font-medium text-slate-900">{order.id}</td>
                      <td className="px-4 py-3 text-slate-500">{order.date}</td>
                      <td className="px-4 py-3 text-slate-700">{order.itemsCount}</td>
                      <td className="px-4 py-3 font-semibold text-slate-900">{formatPrice(order.total)}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600">
                          Chi tiết <ArrowUpRight size={12} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
                    <StatusBadge status={order.status} />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                    <span>{order.itemsCount} sản phẩm</span>
                    <button className="text-indigo-600 font-semibold">Chi tiết</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {layoutStyle === 'timeline' && (
        <div className="space-y-6">
          {MOCK_ORDERS.map((order, index) => {
            const statusConfig = STATUS_CONFIG[order.status];
            return (
              <div key={order.id} className="relative pl-8">
                <div className="absolute left-3 top-2 h-full w-px bg-slate-200" />
                <div className={`absolute left-1.5 top-2 h-4 w-4 rounded-full border-2 border-white ${statusConfig.badge.replace('text-', 'bg-').split(' ')[0]}`} />
                <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xs text-slate-500">{order.date}</div>
                      <div className="text-sm font-semibold text-slate-900">{order.id}</div>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>
                  <div className="text-xs text-slate-500">{order.itemsCount} sản phẩm · {formatPrice(order.total)}</div>
                  {showTimeline && <TimelineProgress status={order.status} />}
                  {(showOrderItems || showTracking) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      {showOrderItems && <OrderItems items={order.items} />}
                      {showTracking && <OrderMeta label="Tracking" value={order.trackingCode} />}
                    </div>
                  )}
                  <div className="flex flex-wrap justify-end gap-2">
                    {allowCancel && order.status === 'pending' && (
                      <button className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white" style={{ backgroundColor: brandColor }}>
                        Hủy đơn
                      </button>
                    )}
                  </div>
                </div>
                {index === MOCK_ORDERS.length - 1 && <div className="absolute left-3 bottom-0 h-4 w-px bg-slate-50" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
