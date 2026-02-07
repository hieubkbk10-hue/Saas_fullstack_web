'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery } from 'convex/react';
import { ArrowUpRight, ChevronDown, Package, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { useCustomerAuth } from '@/app/(site)/auth/context';
import { useBrandColor } from '@/components/site/hooks';
import { useAccountOrdersConfig } from '@/lib/experiences';

const formatPrice = (value: number) => new Intl.NumberFormat('vi-VN', { currency: 'VND', style: 'currency' }).format(value);

const STATUS_LABELS: Record<string, string> = {
  Pending: 'Chờ xử lý',
  Processing: 'Đang xử lý',
  Shipped: 'Đang giao',
  Delivered: 'Đã giao',
  Cancelled: 'Đã huỷ',
};

const STATUS_STYLES: Record<string, string> = {
  Pending: 'bg-amber-100 text-amber-700',
  Processing: 'bg-blue-100 text-blue-700',
  Shipped: 'bg-indigo-100 text-indigo-700',
  Delivered: 'bg-emerald-100 text-emerald-700',
  Cancelled: 'bg-rose-100 text-rose-700',
};

const TIMELINE_STEPS = ['Đặt hàng', 'Xác nhận', 'Vận chuyển', 'Hoàn thành'];

const STATUS_STEPS: Record<string, number> = {
  Pending: 1,
  Processing: 2,
  Shipped: 3,
  Delivered: 4,
};

const PAYMENT_LABELS: Record<string, string> = {
  COD: 'Thanh toán khi nhận hàng',
  BankTransfer: 'Chuyển khoản ngân hàng',
  VietQR: 'VietQR',
  CreditCard: 'Thẻ tín dụng',
  EWallet: 'Ví điện tử',
};

function OrderMeta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] text-slate-500">{label}</div>
      <div className="text-xs font-medium text-slate-900">{value}</div>
    </div>
  );
}

function TimelineProgress({ status }: { status: string }) {
  const step = STATUS_STEPS[status] ?? 1;
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
      <div className="text-xs text-slate-500">Bước hiện tại: {TIMELINE_STEPS[step - 1] ?? TIMELINE_STEPS[0]}</div>
    </div>
  );
}

export default function AccountOrdersPage() {
  const brandColor = useBrandColor();
  const config = useAccountOrdersConfig();
  const { customer, isAuthenticated, openLoginModal } = useCustomerAuth();
  const ordersModule = useQuery(api.admin.modules.getModuleByKey, { key: 'orders' });
  const cancelOrder = useMutation(api.orders.cancel);

  const orders = useQuery(
    api.orders.listAllByCustomer,
    isAuthenticated && customer
      ? { customerId: customer.id as Id<'customers'>, limit: 20 }
      : 'skip'
  );

  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  if (ordersModule && !ordersModule.enabled) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-slate-100 flex items-center justify-center">
          <Package size={32} className="text-slate-400" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Đơn hàng đang tắt</h1>
        <p className="text-slate-500">Hãy bật module Đơn hàng để sử dụng tính năng này.</p>
      </div>
    );
  }

  if (!isAuthenticated || !customer) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-slate-100 flex items-center justify-center">
          <ShoppingBag size={32} className="text-slate-400" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Đăng nhập để xem đơn hàng</h1>
        <p className="text-slate-500 mb-6">Bạn cần đăng nhập để quản lý lịch sử đơn hàng.</p>
        <button
          onClick={openLoginModal}
          className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-6 py-3 text-sm font-medium text-white hover:bg-slate-800"
        >
          Đăng nhập ngay
        </button>
      </div>
    );
  }

  if (orders === undefined) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="h-8 w-48 bg-slate-200 rounded-lg animate-pulse" />
        <div className="h-4 w-64 bg-slate-200 rounded-lg animate-pulse mt-3" />
        <div className="mt-6 space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-20 bg-white border border-slate-200 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const ordersList = orders ?? [];
  const totalOrders = ordersList.length;

  const stats = {
    totalSpent: ordersList.reduce((sum, order) => sum + order.totalAmount, 0),
    pending: ordersList.filter((order) => order.status === 'Pending').length,
    delivered: ordersList.filter((order) => order.status === 'Delivered').length,
    totalItems: ordersList.reduce((sum, order) => sum + order.items.reduce((acc, item) => acc + item.quantity, 0), 0),
  };

  const handleCancelOrder = async (orderId: Id<'orders'>) => {
    if (!confirm('Bạn chắc chắn muốn hủy đơn hàng này?')) {
      return;
    }
    try {
      await cancelOrder({ id: orderId });
      toast.success('Đã hủy đơn hàng thành công.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể hủy đơn hàng.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Đơn hàng của tôi</h1>
        <p className="text-slate-500 mt-2">Bạn đang có {totalOrders} đơn hàng gần đây.</p>
      </div>

      {config.showStats && config.layoutStyle === 'cards' && ordersList.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-4">
            <div className="text-xs text-slate-500">Tổng chi tiêu</div>
            <div className="text-lg font-semibold text-slate-900">{formatPrice(stats.totalSpent)}</div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-4">
            <div className="text-xs text-slate-500">Đơn đang xử lý</div>
            <div className="text-lg font-semibold text-slate-900">{stats.pending}</div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-4">
            <div className="text-xs text-slate-500">Đã giao</div>
            <div className="text-lg font-semibold text-slate-900">{stats.delivered}</div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-4">
            <div className="text-xs text-slate-500">Sản phẩm đã mua</div>
            <div className="text-lg font-semibold text-slate-900">{stats.totalItems}</div>
          </div>
        </div>
      )}

      {ordersList.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
            <ShoppingBag size={28} className="text-slate-400" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">Chưa có đơn hàng</h2>
          <p className="text-slate-500 mb-6">Khám phá sản phẩm để bắt đầu mua sắm.</p>
          <Link
            href="/products"
            className="inline-flex items-center justify-center rounded-lg px-6 py-3 text-sm font-medium text-white"
            style={{ backgroundColor: brandColor }}
          >
            Xem sản phẩm
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {config.layoutStyle === 'cards' && (
            <div className="space-y-4">
              {ordersList.map((order) => {
                const createdAt = new Date(order._creationTime);
                const statusLabel = STATUS_LABELS[order.status] ?? order.status;
                const statusClass = STATUS_STYLES[order.status] ?? 'bg-slate-100 text-slate-600';
                const quantity = order.items.reduce((sum, item) => sum + item.quantity, 0);
                const isExpanded = expandedOrderId === order._id;
                const paymentLabel = order.paymentMethod ? PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod : 'Chưa chọn';
                const shippingMethodLabel = order.shippingMethodLabel ?? 'Chưa xác định';
                const trackingLabel = order.trackingNumber ?? 'Chưa có';

                return (
                  <div key={order._id} className="bg-white rounded-2xl border border-slate-200 shadow-sm">
                    <button
                      type="button"
                      onClick={() => setExpandedOrderId(isExpanded ? null : order._id)}
                      className="w-full flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-5 text-left"
                    >
                      <div>
                        <div className="text-xs text-slate-500">Mã đơn hàng · {createdAt.toLocaleDateString('vi-VN')}</div>
                        <div className="text-sm font-semibold text-slate-900">{order.orderNumber}</div>
                      </div>
                      <div className="flex flex-col items-start md:items-end gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusClass}`}>
                          {statusLabel}
                        </span>
                        <div className="text-xs text-slate-500">{quantity} sản phẩm</div>
                      </div>
                      <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>

                    <div className="px-5 pb-5">
                      <div className="flex items-center justify-between border-t border-slate-100 pt-4 text-sm">
                        <div className="text-slate-500">Tổng thanh toán</div>
                        <div className="font-semibold text-slate-900">{formatPrice(order.totalAmount)}</div>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="px-5 pb-5 space-y-4">
                        {config.showOrderItems && (
                          <div className="border-t border-slate-100 pt-4">
                            <div className="text-[10px] text-slate-500 mb-2">Sản phẩm</div>
                            <div className="space-y-2">
                              {order.items.map((item, itemIndex) => (
                                <div key={`${item.productId}-${itemIndex}`} className="flex items-center justify-between text-xs text-slate-700">
                                  <span className="flex items-center gap-2">
                                    <Package size={12} className="text-slate-400" />
                                    {item.productName} (x{item.quantity})
                                  </span>
                                  <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {config.showPaymentMethod && <OrderMeta label="Thanh toán" value={paymentLabel} />}
                          {config.showShippingMethod && <OrderMeta label="Giao hàng" value={shippingMethodLabel} />}
                          {config.showTracking && <OrderMeta label="Tracking" value={trackingLabel} />}
                        </div>

                        {config.showShippingAddress && order.shippingAddress && (
                          <OrderMeta label="Địa chỉ" value={order.shippingAddress} />
                        )}

                        {config.showTimeline && <TimelineProgress status={order.status} />}

                        <div className="flex flex-wrap justify-end gap-2">
                          <button
                            type="button"
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 border border-slate-200"
                          >
                            Xem chi tiết
                          </button>
                          {config.allowCancel && order.status === 'Pending' && (
                            <button
                              type="button"
                              onClick={() => { void handleCancelOrder(order._id); }}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-rose-500 hover:bg-rose-600"
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

          {config.layoutStyle === 'compact' && (
            <div className="space-y-3">
              <div className="hidden md:block overflow-hidden rounded-xl border border-slate-200 bg-white">
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
                    {ordersList.map((order) => {
                      const createdAt = new Date(order._creationTime);
                      const statusLabel = STATUS_LABELS[order.status] ?? order.status;
                      const statusClass = STATUS_STYLES[order.status] ?? 'bg-slate-100 text-slate-600';
                      const quantity = order.items.reduce((sum, item) => sum + item.quantity, 0);
                      return (
                        <tr key={order._id} className="border-t">
                          <td className="px-4 py-3 font-medium text-slate-900">{order.orderNumber}</td>
                          <td className="px-4 py-3 text-slate-500">{createdAt.toLocaleDateString('vi-VN')}</td>
                          <td className="px-4 py-3 text-slate-700">{quantity}</td>
                          <td className="px-4 py-3 font-semibold text-slate-900">{formatPrice(order.totalAmount)}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusClass}`}>
                              {statusLabel}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600">
                              Chi tiết <ArrowUpRight size={12} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="space-y-2 md:hidden">
                {ordersList.map((order) => {
                  const createdAt = new Date(order._creationTime);
                  const statusLabel = STATUS_LABELS[order.status] ?? order.status;
                  const statusClass = STATUS_STYLES[order.status] ?? 'bg-slate-100 text-slate-600';
                  return (
                    <div key={order._id} className="bg-white border border-slate-200 rounded-xl p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs text-slate-500">{order.orderNumber} · {createdAt.toLocaleDateString('vi-VN')}</div>
                          <div className="text-sm font-semibold text-slate-900">{formatPrice(order.totalAmount)}</div>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusClass}`}>
                          {statusLabel}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                        <span>{order.items.reduce((sum, item) => sum + item.quantity, 0)} sản phẩm</span>
                        <button className="text-indigo-600 font-semibold">Chi tiết</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {config.layoutStyle === 'timeline' && (
            <div className="space-y-6">
              {ordersList.map((order, index) => {
                const createdAt = new Date(order._creationTime);
                const statusLabel = STATUS_LABELS[order.status] ?? order.status;
                const statusClass = STATUS_STYLES[order.status] ?? 'bg-slate-100 text-slate-600';
                const badgeBg = statusClass.split(' ').find((item) => item.startsWith('bg-')) ?? 'bg-slate-200';
                const trackingLabel = order.trackingNumber ?? 'Chưa có';
                return (
                  <div key={order._id} className="relative pl-8">
                    <div className="absolute left-3 top-2 h-full w-px bg-slate-200" />
                    <div className={`absolute left-1.5 top-2 h-4 w-4 rounded-full border-2 border-white ${badgeBg}`} />
                    <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-xs text-slate-500">{createdAt.toLocaleDateString('vi-VN')}</div>
                          <div className="text-sm font-semibold text-slate-900">{order.orderNumber}</div>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusClass}`}>
                          {statusLabel}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500">
                        {order.items.reduce((sum, item) => sum + item.quantity, 0)} sản phẩm · {formatPrice(order.totalAmount)}
                      </div>
                      {config.showTimeline && <TimelineProgress status={order.status} />}
                      {(config.showOrderItems || config.showTracking) && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          {config.showOrderItems && (
                            <div className="space-y-2">
                              {order.items.map((item, itemIndex) => (
                                <div key={`${item.productId}-${itemIndex}`} className="flex items-center justify-between text-xs text-slate-700">
                                  <span className="flex items-center gap-2">
                                    <Package size={12} className="text-slate-400" />
                                    {item.productName} (x{item.quantity})
                                  </span>
                                  <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                                </div>
                              ))}
                            </div>
                          )}
                          {config.showTracking && <OrderMeta label="Tracking" value={trackingLabel} />}
                        </div>
                      )}
                      <div className="flex flex-wrap justify-end gap-2">
                        {config.allowCancel && order.status === 'Pending' && (
                          <button
                            type="button"
                            onClick={() => { void handleCancelOrder(order._id); }}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-rose-500 hover:bg-rose-600"
                          >
                            Hủy đơn
                          </button>
                        )}
                      </div>
                    </div>
                    {index === ordersList.length - 1 && <div className="absolute left-3 bottom-0 h-4 w-px bg-slate-50" />}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
