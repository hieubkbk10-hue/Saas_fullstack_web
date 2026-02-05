'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from 'convex/react';
import { Mail, Phone, User } from 'lucide-react';
import { api } from '@/convex/_generated/api';
import { useCustomerAuth } from '@/app/(site)/auth/context';
import { useBrandColor } from '@/components/site/hooks';

export default function AccountProfilePage() {
  const brandColor = useBrandColor();
  const { customer, isAuthenticated, openLoginModal } = useCustomerAuth();
  const customersModule = useQuery(api.admin.modules.getModuleByKey, { key: 'customers' });
  const loginFeature = useQuery(api.admin.modules.getModuleFeature, { moduleKey: 'customers', featureKey: 'enableLogin' });

  if (customersModule && !customersModule.enabled) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-slate-100 flex items-center justify-center">
          <User size={32} className="text-slate-400" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Tài khoản đang tắt</h1>
        <p className="text-slate-500">Hãy bật module Khách hàng để sử dụng tính năng này.</p>
      </div>
    );
  }

  if (loginFeature && !loginFeature.enabled) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-slate-100 flex items-center justify-center">
          <User size={32} className="text-slate-400" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Đăng nhập đang tắt</h1>
        <p className="text-slate-500">Hãy bật tính năng đăng nhập trong module Khách hàng.</p>
      </div>
    );
  }

  if (!isAuthenticated || !customer) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-slate-100 flex items-center justify-center">
          <User size={32} className="text-slate-400" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Đăng nhập để xem tài khoản</h1>
        <p className="text-slate-500 mb-6">Bạn cần đăng nhập để quản lý thông tin cá nhân.</p>
        <button
          onClick={openLoginModal}
          className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-6 py-3 text-sm font-medium text-white hover:bg-slate-800"
        >
          Đăng nhập ngay
        </button>
      </div>
    );
  }

  const displayName = customer.name || 'Khách hàng';

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Tài khoản của tôi</h1>
        <p className="text-slate-500 mt-2">Quản lý thông tin cá nhân và đơn hàng.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: brandColor }}>
              <User size={22} />
            </div>
            <div>
              <div className="text-lg font-semibold text-slate-900">{displayName}</div>
              <div className="text-sm text-slate-500">Khách hàng thân thiết</div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail size={18} className="text-slate-400" />
              <div>
                <div className="text-sm font-medium text-slate-700">Email</div>
                <div className="text-sm text-slate-500">{customer.email}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone size={18} className="text-slate-400" />
              <div>
                <div className="text-sm font-medium text-slate-700">Số điện thoại</div>
                <div className="text-sm text-slate-500">{customer.phone || 'Chưa cập nhật'}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-700">Tác vụ nhanh</h2>
            <p className="text-xs text-slate-500">Quản lý nhanh các mục liên quan.</p>
          </div>
          <div className="space-y-2">
            <Link
              href="/account/orders"
              className="block w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:border-slate-300"
            >
              Đơn hàng của tôi
            </Link>
            <Link
              href="/wishlist"
              className="block w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:border-slate-300"
            >
              Danh sách yêu thích
            </Link>
            <Link
              href="/products"
              className="block w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:border-slate-300"
            >
              Tiếp tục mua sắm
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
