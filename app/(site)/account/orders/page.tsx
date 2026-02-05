'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from 'convex/react';
import { Package, ShoppingBag } from 'lucide-react';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { useCustomerAuth } from '@/app/(site)/auth/context';
import { useBrandColor } from '@/components/site/hooks';

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

export default function AccountOrdersPage() {
  const brandColor = useBrandColor();
  const { customer, isAuthenticated, openLoginModal } = useCustomerAuth();
  const ordersModule = useQuery(api.admin.modules.getModuleByKey, { key: 'orders' });

  const orders = useQuery(
    api.orders.listAllByCustomer,
    isAuthenticated && customer
      ? { customerId: customer.id as Id<'customers'>, limit: 20 }
      : 'skip'
  );

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

  const itemsCount = ordersList.map((order) => order.items.reduce((sum, item) => sum + item.quantity, 0));

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Đơn hàng của tôi</h1>
        <p className="text-slate-500 mt-2">Bạn đang có {totalOrders} đơn hàng gần đây.</p>
      </div>

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
          {ordersList.map((order, index) => {
            const createdAt = new Date(order._creationTime);
            const statusLabel = STATUS_LABELS[order.status] ?? order.status;
            const statusClass = STATUS_STYLES[order.status] ?? 'bg-slate-100 text-slate-600';
            const quantity = itemsCount[index] ?? 0;

            return (
              <div key={order._id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <div className="text-sm text-slate-500">Mã đơn hàng</div>
                    <div className="text-lg font-semibold text-slate-900">{order.orderNumber}</div>
                    <div className="text-sm text-slate-500 mt-1">
                      {createdAt.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </div>
                  </div>
                  <div className="flex flex-col items-start md:items-end gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusClass}`}>
                      {statusLabel}
                    </span>
                    <div className="text-sm text-slate-500">{quantity} sản phẩm</div>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                  <div className="text-sm text-slate-500">Tổng thanh toán</div>
                  <div className="text-base font-semibold text-slate-900">{formatPrice(order.totalAmount)}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
