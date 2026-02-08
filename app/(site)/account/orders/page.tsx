'use client';

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from 'convex/react';
import { ArrowUpRight, CheckCircle2, ChevronDown, Clock, DollarSign, Package, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { useCustomerAuth } from '@/app/(site)/auth/context';
import { useBrandColor } from '@/components/site/hooks';
import { StatusFilterDropdown } from '@/components/orders/StatusFilterDropdown';
import { useAccountOrdersConfig, useOrderStatuses } from '@/lib/experiences';
import { notifyAddToCart, useCart } from '@/lib/cart';

const formatPrice = (value: number) => new Intl.NumberFormat('vi-VN', { currency: 'VND', style: 'currency' }).format(value);

const TIMELINE_STEPS = ['Đặt hàng', 'Xác nhận', 'Vận chuyển', 'Hoàn thành'];

const PAYMENT_LABELS: Record<string, string> = {
  COD: 'Thanh toán khi nhận hàng',
  BankTransfer: 'Chuyển khoản ngân hàng',
  VietQR: 'VietQR',
  CreditCard: 'Thẻ tín dụng',
  EWallet: 'Ví điện tử',
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

const getBrandTint = (color: string, opacity: number) => hexToRgba(color, opacity);

function OrderMeta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] text-slate-500">{label}</div>
      <div className="text-xs font-medium text-slate-900">{value}</div>
    </div>
  );
}

function Stepper({ step, brandColor }: { step: number; brandColor: string }) {
  return (
    <div className="w-full">
      <div className="flex items-center w-full px-2 sm:px-4">
        {TIMELINE_STEPS.map((label, index) => {
          const active = index < step;
          return (
            <React.Fragment key={label}>
              <div className="relative flex flex-col items-center">
                <div
                  className="w-4 h-4 rounded-full border-[3px] z-10 transition-all duration-300 box-content bg-white"
                  style={{
                    backgroundColor: active ? brandColor : undefined,
                    borderColor: active ? brandColor : getBrandTint(brandColor, 0.3),
                    boxShadow: active ? `0 0 0 4px ${getBrandTint(brandColor, 0.1)}` : undefined,
                  }}
                />
                <div className="absolute top-8 w-max max-w-[140px] hidden sm:flex flex-col items-center text-center">
                  <span
                    className={`text-xs font-semibold tracking-tight transition-colors duration-300 ${active ? '' : 'text-slate-400'}`}
                    style={{ color: active ? brandColor : undefined }}
                  >
                    {label}
                  </span>
                </div>
              </div>
              {index < TIMELINE_STEPS.length - 1 && (
                <div className="flex-1 h-0.5 relative mx-2 sm:mx-4">
                  <div className="absolute inset-0 bg-slate-100" />
                  <div
                    className="absolute inset-0 transition-all duration-700 ease-out origin-left"
                    style={{
                      backgroundColor: brandColor,
                      transform: index + 1 < step ? 'scaleX(1)' : 'scaleX(0)',
                      transformOrigin: 'left',
                    }}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
      <div className="hidden sm:block h-10" />
      <div className="sm:hidden mt-3 flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-100">
        <span className="text-xs font-medium text-slate-500 uppercase">Trạng thái hiện tại</span>
        <span className="text-sm font-semibold" style={{ color: brandColor }}>
          {TIMELINE_STEPS[step - 1] ?? TIMELINE_STEPS[0]}
        </span>
      </div>
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
      className={`relative overflow-hidden rounded-xl border p-5 transition-all duration-200 hover:shadow-md ${highlight ? '' : 'bg-white border-slate-200'}`}
      style={highlight ? { backgroundColor: brandColor, borderColor: brandColor } : undefined}
    >
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <p className={`text-sm font-medium ${highlight ? 'text-white/80' : 'text-slate-500'}`}>
            {label}
          </p>
          <h3 className={`text-xl font-bold tracking-tight ${highlight ? 'text-white' : 'text-slate-900'}`}>
            {value}
          </h3>
        </div>
        <div
          className={`p-2 rounded-lg ${highlight ? 'text-white' : ''}`}
          style={{ backgroundColor: highlight ? getBrandTint(brandColor, 0.2) : getBrandTint(brandColor, 0.08), color: highlight ? undefined : brandColor }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function AccountOrdersPage() {
  const brandColor = useBrandColor();
  const config = useAccountOrdersConfig();
  const { statuses: orderStatuses } = useOrderStatuses();
  const router = useRouter();
  const { customer, isAuthenticated, openLoginModal } = useCustomerAuth();
  const { addItem } = useCart();
  const ordersModule = useQuery(api.admin.modules.getModuleByKey, { key: 'orders' });
  const stockFeature = useQuery(api.admin.modules.getModuleFeature, { featureKey: 'enableStock', moduleKey: 'products' });
  const cancelOrder = useMutation(api.orders.cancel);

  const orders = useQuery(
    api.orders.listAllByCustomer,
    isAuthenticated && customer
      ? { customerId: customer.id as Id<'customers'>, limit: 20 }
      : 'skip'
  );

  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = config.ordersPerPage ?? 12;
  const statusKeys = useMemo(() => orderStatuses.map((status) => status.key), [orderStatuses]);
  const statusMap = useMemo(() => new Map(orderStatuses.map((status) => [status.key, status])), [orderStatuses]);
  const normalizedDefaultStatuses = useMemo(
    () => (config.defaultStatusFilter ?? []).filter((status) => statusKeys.includes(status)),
    [config.defaultStatusFilter, statusKeys]
  );
  const pendingStatusKey = useMemo(
    () => orderStatuses.find((status) => status.key === 'Pending')?.key ?? statusKeys[0],
    [orderStatuses, statusKeys]
  );
  const deliveredStatusKey = useMemo(
    () => orderStatuses.find((status) => status.key === 'Delivered')?.key ?? statusKeys[statusKeys.length - 1],
    [orderStatuses, statusKeys]
  );
  const stockEnabled = stockFeature?.enabled ?? false;

  const ordersList = useMemo(() => orders ?? [], [orders]);
  const totalOrders = ordersList.length;

  const stats = {
    totalSpent: ordersList.reduce((sum, order) => sum + order.totalAmount, 0),
    pending: pendingStatusKey ? ordersList.filter((order) => order.status === pendingStatusKey).length : 0,
    delivered: deliveredStatusKey ? ordersList.filter((order) => order.status === deliveredStatusKey).length : 0,
    totalItems: ordersList.reduce((sum, order) => sum + order.items.reduce((acc, item) => acc + item.quantity, 0), 0),
  };

  const getStatusStyle = (status: string) => {
    const statusConfig = statusMap.get(status);
    const color = statusConfig?.color ?? brandColor;
    return {
      backgroundColor: getBrandTint(color, 0.12),
      color,
      borderColor: getBrandTint(color, 0.3),
    };
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

  const handleViewDetail = (orderNumber: string) => {
    toast.info(`Đang mở chi tiết đơn ${orderNumber}.`);
  };

  const handleReorder = async (order: (typeof ordersList)[number]) => {
    const availableItems: Array<(typeof order.items)[number]> = [];
    const outOfStockItems: Array<(typeof order.items)[number]> = [];

    for (const item of order.items) {
      try {
        await addItem(item.productId as Id<'products'>, item.quantity, item.variantId);
        availableItems.push(item);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Không thể thêm sản phẩm vào giỏ hàng.';
        if (stockEnabled && /stock|tồn kho|hết hàng|insufficient/i.test(message)) {
          outOfStockItems.push(item);
        } else {
          toast.error(message);
        }
      }
    }

    if (availableItems.length > 0) {
      notifyAddToCart();
      router.push('/cart');
    }

    if (stockEnabled && outOfStockItems.length > 0) {
      toast.error(`Sản phẩm đã hết hàng: ${outOfStockItems.map((item) => item.productName).join(', ')}`);
    }

    if (availableItems.length === 0 && outOfStockItems.length > 0) {
      toast.error('Tất cả sản phẩm trong đơn đã hết hàng');
    }
  };

  const activeStatuses = selectedStatuses.length > 0
    ? selectedStatuses
    : (normalizedDefaultStatuses.length > 0 ? normalizedDefaultStatuses : statusKeys);

  const filteredOrders = useMemo(() => {
    if (activeStatuses.length === statusKeys.length) {
      return ordersList;
    }
    return ordersList.filter((order) => activeStatuses.includes(order.status));
  }, [activeStatuses, ordersList, statusKeys.length]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / ordersPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pageStart = (safeCurrentPage - 1) * ordersPerPage;
  const pageEnd = pageStart + ordersPerPage;
  const displayStart = filteredOrders.length === 0 ? 0 : pageStart + 1;
  const displayEnd = Math.min(pageEnd, filteredOrders.length);
  const visibleOrders = config.paginationType === 'pagination'
    ? filteredOrders.slice(pageStart, pageEnd)
    : filteredOrders.slice(0, ordersPerPage);

  const toggleStatus = (status: string) => {
    setCurrentPage(1);
    setSelectedStatuses((prev) => {
      const base = prev.length > 0 ? prev : (normalizedDefaultStatuses.length > 0 ? normalizedDefaultStatuses : statusKeys);
      return base.includes(status) ? base.filter((item) => item !== status) : [...base, status];
    });
  };

  const isAllActive = activeStatuses.length === statusKeys.length;

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
          className="inline-flex items-center justify-center rounded-lg px-6 py-3 text-sm font-medium text-white"
          style={{ backgroundColor: brandColor }}
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

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Đơn hàng của tôi</h1>
        <p className="text-slate-500 mt-2">Bạn đang có {totalOrders} đơn hàng gần đây.</p>
      </div>

      {ordersList.length > 0 && (
        <div className="mb-4">
          <StatusFilterDropdown
            options={orderStatuses.map((status) => ({ key: status.key, label: status.label }))}
            activeKeys={activeStatuses}
            isAllActive={isAllActive}
            onToggleKey={toggleStatus}
            onToggleAll={() => setSelectedStatuses(isAllActive ? [] : statusKeys)}
            brandColor={brandColor}
          />
        </div>
      )}

      {config.showStats && ordersList.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            label="Tổng chi tiêu"
            value={formatPrice(stats.totalSpent)}
            icon={<DollarSign className="w-5 h-5" />}
            highlight
            brandColor={brandColor}
          />
          <StatCard
            label={statusMap.get(pendingStatusKey ?? '')?.label ?? 'Đang xử lý'}
            value={stats.pending}
            icon={<Clock className="w-5 h-5" />}
            brandColor={brandColor}
          />
          <StatCard
            label={statusMap.get(deliveredStatusKey ?? '')?.label ?? 'Đã giao'}
            value={stats.delivered}
            icon={<CheckCircle2 className="w-5 h-5" />}
            brandColor={brandColor}
          />
          <StatCard
            label="Sản phẩm đã mua"
            value={stats.totalItems}
            icon={<ShoppingBag className="w-5 h-5" />}
            brandColor={brandColor}
          />
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
              {visibleOrders.map((order) => {
                const createdAt = new Date(order._creationTime);
                const statusLabel = statusMap.get(order.status)?.label ?? order.status;
                const statusStyle = getStatusStyle(order.status);
                const quantity = order.items.reduce((sum, item) => sum + item.quantity, 0);
                const isExpanded = expandedOrderId === order._id;
                const paymentLabel = order.paymentMethod ? PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod : 'Chưa chọn';
                const shippingMethodLabel = order.shippingMethodLabel ?? 'Chưa xác định';
                const trackingLabel = order.trackingNumber ?? 'Chưa có';
                const step = statusMap.get(order.status)?.step ?? 1;

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
                        <span className="px-3 py-1 rounded-full text-xs font-semibold border" style={statusStyle}>
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
                      <div className="px-5 pb-5 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div
                          className="rounded-xl border p-4 space-y-4"
                          style={{ backgroundColor: getBrandTint(brandColor, 0.04), borderColor: getBrandTint(brandColor, 0.16) }}
                        >
                          {config.showOrderItems && (
                            <div>
                              <div className="text-[10px] text-slate-500 mb-3 uppercase tracking-wide">Sản phẩm</div>
                              <div className="space-y-3">
                                {order.items.map((item, itemIndex) => (
                                  <div key={`${item.productId}-${itemIndex}`} className="flex items-center gap-4">
                                    <div
                                      className="h-12 w-12 rounded-md border overflow-hidden flex items-center justify-center"
                                      style={{ borderColor: getBrandTint(brandColor, 0.2), backgroundColor: getBrandTint(brandColor, 0.08) }}
                                    >
                                      {item.productImage ? (
                                        <Image
                                          src={item.productImage}
                                          alt={item.productName}
                                          width={48}
                                          height={48}
                                          className="h-full w-full object-cover"
                                        />
                                      ) : (
                                        <Package size={18} style={{ color: brandColor }} />
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="text-sm font-medium text-slate-900 truncate">{item.productName}</div>
                                      {item.variantTitle && (
                                        <div className="text-xs text-slate-500">{item.variantTitle}</div>
                                      )}
                                      <div className="text-xs text-slate-500">Số lượng: {item.quantity}</div>
                                    </div>
                                    <div className="text-sm font-semibold text-slate-900">
                                      {formatPrice(item.price * item.quantity)}
                                    </div>
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

                          {config.showTimeline && <Stepper step={step} brandColor={brandColor} />}

                          <div className="flex flex-wrap justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => { void handleReorder(order); }}
                              className="px-3 py-2 rounded-lg text-xs font-semibold text-white"
                              style={{ backgroundColor: brandColor }}
                            >
                              Mua lại
                            </button>
                            {statusMap.get(order.status)?.allowCancel && (
                              <button
                                type="button"
                                onClick={() => { void handleCancelOrder(order._id); }}
                                className="px-3 py-2 rounded-lg text-xs font-semibold text-white"
                                style={{ backgroundColor: brandColor }}
                              >
                                Hủy đơn
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              {visibleOrders.length === 0 && (
                <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-6 text-center text-sm text-slate-500">
                  Không có đơn hàng phù hợp.
                </div>
              )}
            </div>
          )}

          {config.layoutStyle === 'compact' && (
            <div className="space-y-3">
              <div className="hidden md:block overflow-hidden shadow ring-1 ring-black/5 sm:rounded-lg bg-white">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">Mã đơn</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">Ngày</th>
                      {config.showOrderItems && (
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">Số SP</th>
                      )}
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">Tổng</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">Trạng thái</th>
                      {config.showPaymentMethod && (
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">Thanh toán</th>
                      )}
                      {config.showShippingMethod && (
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">Giao hàng</th>
                      )}
                      {config.showTracking && (
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">Tracking</th>
                      )}
                      {config.showShippingAddress && (
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">Địa chỉ</th>
                      )}
                      {config.showTimeline && (
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">Bước</th>
                      )}
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleOrders.map((order) => {
                      const createdAt = new Date(order._creationTime);
                      const statusLabel = statusMap.get(order.status)?.label ?? order.status;
                      const statusStyle = getStatusStyle(order.status);
                      const quantity = order.items.reduce((sum, item) => sum + item.quantity, 0);
                      const step = statusMap.get(order.status)?.step ?? 1;
                      return (
                        <tr key={order._id} className="border-t hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 py-3 font-medium text-slate-900">{order.orderNumber}</td>
                          <td className="px-4 py-3 text-slate-500">{createdAt.toLocaleDateString('vi-VN')}</td>
                          {config.showOrderItems && <td className="px-4 py-3 text-slate-700">{quantity}</td>}
                          <td className="px-4 py-3 font-semibold text-slate-900">{formatPrice(order.totalAmount)}</td>
                          <td className="px-4 py-3">
                            <span className="px-2.5 py-1 rounded-full text-xs font-semibold border" style={statusStyle}>
                              {statusLabel}
                            </span>
                          </td>
                          {config.showPaymentMethod && (
                            <td className="px-4 py-3 text-slate-500">{order.paymentMethod}</td>
                          )}
                          {config.showShippingMethod && (
                            <td className="px-4 py-3 text-slate-500">{order.shippingMethodLabel}</td>
                          )}
                          {config.showTracking && (
                            <td className="px-4 py-3 text-slate-500">{order.trackingNumber ?? 'Đang cập nhật'}</td>
                          )}
                          {config.showShippingAddress && (
                            <td className="px-4 py-3 text-slate-500">{order.shippingAddress}</td>
                          )}
                          {config.showTimeline && (
                            <td className="px-4 py-3 text-slate-500">{TIMELINE_STEPS[step - 1] ?? TIMELINE_STEPS[0]}</td>
                          )}
                          <td className="px-4 py-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleViewDetail(order.orderNumber)}
                              className="inline-flex items-center gap-1 text-xs font-semibold"
                              style={{ color: brandColor }}
                            >
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
                {visibleOrders.map((order) => {
                  const createdAt = new Date(order._creationTime);
                  const statusLabel = statusMap.get(order.status)?.label ?? order.status;
                  const statusStyle = getStatusStyle(order.status);
                  const step = statusMap.get(order.status)?.step ?? 1;
                  return (
                    <div key={order._id} className="bg-white border border-slate-200 rounded-xl p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs text-slate-500">{order.orderNumber} · {createdAt.toLocaleDateString('vi-VN')}</div>
                          <div className="text-sm font-semibold text-slate-900">{formatPrice(order.totalAmount)}</div>
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold border" style={statusStyle}>
                          {statusLabel}
                        </span>
                      </div>
                      {config.showOrderItems && (
                        <div className="mt-2 text-xs text-slate-500">
                          {order.items.reduce((sum, item) => sum + item.quantity, 0)} sản phẩm
                        </div>
                      )}
                      {(config.showPaymentMethod || config.showShippingMethod || config.showTracking || config.showShippingAddress) && (
                        <div className="mt-2 space-y-1 text-xs text-slate-500">
                          {config.showPaymentMethod && <div>Thanh toán: {order.paymentMethod}</div>}
                          {config.showShippingMethod && <div>Giao hàng: {order.shippingMethodLabel}</div>}
                          {config.showTracking && <div>Tracking: {order.trackingNumber ?? 'Đang cập nhật'}</div>}
                          {config.showShippingAddress && <div>Địa chỉ: {order.shippingAddress}</div>}
                        </div>
                      )}
                      {config.showTimeline && (
                        <div className="mt-2 text-xs text-slate-500">Bước: {TIMELINE_STEPS[step - 1] ?? TIMELINE_STEPS[0]}</div>
                      )}
                      <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                        <button
                          type="button"
                          onClick={() => handleViewDetail(order.orderNumber)}
                          className="font-semibold"
                          style={{ color: brandColor }}
                        >
                          Chi tiết
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {config.layoutStyle === 'timeline' && (
            <div className="space-y-6">
              {visibleOrders.map((order) => {
                const createdAt = new Date(order._creationTime);
                const statusLabel = statusMap.get(order.status)?.label ?? order.status;
                const statusStyle = getStatusStyle(order.status);
                const trackingLabel = order.trackingNumber ?? 'Đang cập nhật';
                const step = statusMap.get(order.status)?.step ?? 1;
                return (
                  <div key={order._id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                    <div className="px-6 py-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-50/50">
                      <div className="flex flex-wrap items-center gap-4">
                        <div>
                          <div className="text-xs text-slate-500 uppercase tracking-wide">Ngày đặt</div>
                          <div className="text-sm font-semibold text-slate-900">{createdAt.toLocaleDateString('vi-VN')}</div>
                        </div>
                        <div className="hidden md:block h-8 w-px bg-slate-200" />
                        <div>
                          <div className="text-xs text-slate-500 uppercase tracking-wide">Mã đơn</div>
                          <div className="text-sm font-semibold text-slate-900">{order.orderNumber}</div>
                        </div>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-semibold border" style={statusStyle}>
                        {statusLabel}
                      </span>
                    </div>

                    <div className="p-6 space-y-6">
                      {config.showTimeline && <Stepper step={step} brandColor={brandColor} />}
                      {(config.showPaymentMethod || config.showShippingMethod || config.showShippingAddress) && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {config.showPaymentMethod && (
                            <OrderMeta label="Thanh toán" value={order.paymentMethod ?? 'Đang cập nhật'} />
                          )}
                          {config.showShippingMethod && (
                            <OrderMeta label="Giao hàng" value={order.shippingMethodLabel ?? 'Đang cập nhật'} />
                          )}
                          {config.showShippingAddress && (
                            <OrderMeta label="Địa chỉ" value={order.shippingAddress ?? 'Đang cập nhật'} />
                          )}
                        </div>
                      )}
                      {config.showOrderItems && (
                        <div className="space-y-4">
                          {order.items.map((item, itemIndex) => (
                            <div key={`${item.productId}-${itemIndex}`} className="flex flex-col sm:flex-row gap-4 items-start">
                              <div
                                className="w-16 h-16 rounded-lg border overflow-hidden flex items-center justify-center"
                                style={{ borderColor: getBrandTint(brandColor, 0.2), backgroundColor: getBrandTint(brandColor, 0.08) }}
                              >
                                {item.productImage ? (
                                  <Image
                                    src={item.productImage}
                                    alt={item.productName}
                                    width={64}
                                    height={64}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <Package size={20} style={{ color: brandColor }} />
                                )}
                              </div>
                              <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                <div>
                                  <div className="text-sm font-semibold text-slate-900">{item.productName}</div>
                                  {item.variantTitle && <div className="text-xs text-slate-500">{item.variantTitle}</div>}
                                  <div className="text-xs text-slate-500">Số lượng: {item.quantity}</div>
                                </div>
                                <div className="text-base font-semibold text-slate-900">{formatPrice(item.price * item.quantity)}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {config.showTracking && (
                        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
                          <span className="text-slate-500 font-medium">Tracking:</span>
                          <span
                            className="font-mono font-semibold px-2 py-0.5 rounded border text-xs"
                            style={{ borderColor: getBrandTint(brandColor, 0.2), color: brandColor, backgroundColor: getBrandTint(brandColor, 0.08) }}
                          >
                            {trackingLabel}
                          </span>
                        </div>
                      )}
                      <div className="flex flex-col sm:flex-row items-center gap-4">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Tổng tiền</span>
                          <span className="text-xl font-bold" style={{ color: brandColor }}>
                            {formatPrice(order.totalAmount)}
                          </span>
                        </div>
                        {statusMap.get(order.status)?.allowCancel ? (
                          <button
                            type="button"
                            onClick={() => { void handleCancelOrder(order._id); }}
                            className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
                            style={{ backgroundColor: brandColor }}
                          >
                            Hủy đơn hàng
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleViewDetail(order.orderNumber)}
                            className="px-4 py-2 rounded-lg text-sm font-semibold border"
                            style={{ borderColor: getBrandTint(brandColor, 0.3), color: brandColor }}
                          >
                            Xem chi tiết
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {config.layoutStyle !== 'cards' && visibleOrders.length === 0 && (
            <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-6 text-center text-sm text-slate-500">
              Không có đơn hàng phù hợp.
            </div>
          )}

          {filteredOrders.length > 0 && (
            <div className="pt-2">
              {config.paginationType === 'pagination' ? (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
                  <p className="text-slate-500">
                    Hiển thị <span className="font-semibold text-slate-700">{displayStart}</span> đến{' '}
                    <span className="font-semibold text-slate-700">{displayEnd}</span> / {filteredOrders.length}
                  </p>
                  <div className="flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={safeCurrentPage === 1}
                      className="px-3 py-1.5 rounded-lg font-semibold border disabled:opacity-50"
                      style={{ borderColor: getBrandTint(brandColor, 0.3), color: brandColor }}
                    >
                      Trước
                    </button>
                    <div className="text-slate-500">
                      Trang <span className="font-semibold text-slate-700">{safeCurrentPage}</span> / {totalPages}
                    </div>
                    <button
                      type="button"
                      onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                      disabled={safeCurrentPage === totalPages}
                      className="px-3 py-1.5 rounded-lg font-semibold border disabled:opacity-50"
                      style={{ borderColor: getBrandTint(brandColor, 0.3), color: brandColor }}
                    >
                      Sau
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center mt-2 space-y-2">
                  <div className="flex justify-center gap-1">
                    <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: brandColor }} />
                    <div className="w-2 h-2 rounded-full animate-pulse delay-100" style={{ backgroundColor: brandColor, opacity: 0.7 }} />
                    <div className="w-2 h-2 rounded-full animate-pulse delay-200" style={{ backgroundColor: brandColor, opacity: 0.5 }} />
                  </div>
                  <p className="text-xs text-slate-400">Cuộn để xem thêm...</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
