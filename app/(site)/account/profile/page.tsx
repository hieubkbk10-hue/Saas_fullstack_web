'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from 'convex/react';
import {
  ArrowRight,
  Award,
  CreditCard,
  Heart,
  Mail,
  MapPin,
  PackageCheck,
  Phone,
  Settings,
  ShoppingBag,
  User,
} from 'lucide-react';
import { api } from '@/convex/_generated/api';
import { useCustomerAuth } from '@/app/(site)/auth/context';
import { useBrandColor } from '@/components/site/hooks';
import { useAccountProfileConfig } from '@/lib/experiences';

export default function AccountProfilePage() {
  const brandColor = useBrandColor();
  const config = useAccountProfileConfig();
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
  const joinedDate = 'Đang cập nhật';
  const address = 'Chưa cập nhật';

  const actions = [
    {
      id: 'orders',
      label: 'Đơn hàng của tôi',
      description: 'Xem lịch sử và trạng thái',
      icon: PackageCheck,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      href: '/account/orders',
    },
    {
      id: 'shop',
      label: 'Tiếp tục mua sắm',
      description: 'Khám phá sản phẩm mới',
      icon: ShoppingBag,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      href: '/products',
    },
    {
      id: 'wishlist',
      label: 'Danh sách yêu thích',
      description: 'Sản phẩm đã lưu',
      icon: Heart,
      color: 'text-rose-600',
      bg: 'bg-rose-50',
      href: '/wishlist',
    },
    {
      id: 'payment',
      label: 'Phương thức thanh toán',
      description: 'Quản lý thẻ & ví',
      icon: CreditCard,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      href: '/cart',
    },
    {
      id: 'settings',
      label: 'Cài đặt tài khoản',
      description: 'Bảo mật & thông báo',
      icon: Settings,
      color: 'text-slate-600',
      bg: 'bg-slate-100',
      href: '/account/profile',
    },
  ];

  const selectedActionIds = config.actionItems.length > 0
    ? config.actionItems
    : actions.map((action) => action.id);
  const visibleActions = config.showQuickActions
    ? actions.filter((action) => selectedActionIds.includes(action.id))
    : [];

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Tài khoản của tôi</h1>
        <p className="text-slate-500 mt-2">Quản lý thông tin cá nhân và đơn hàng.</p>
      </div>

      {config.layoutStyle === 'card' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-14 h-14 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: brandColor }}>
                  <User size={22} />
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
              </div>
              <div>
                <div className="text-lg font-semibold text-slate-900">{displayName}</div>
                {config.showLoyaltyBadge && (
                  <div className="mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ color: brandColor, backgroundColor: `${brandColor}1A` }}>
                    <Award size={12} /> Khách hàng thân thiết
                  </div>
                )}
              </div>
            </div>

            {(config.showContactInfo || config.showAddress) && (
              <div className="mt-5 grid gap-3 text-sm text-slate-600">
                {config.showContactInfo && (
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                      <Mail size={16} className="text-slate-400" />
                      <span>{customer.email}</span>
                    </div>
                    <div className="h-1 w-1 rounded-full bg-slate-300" />
                    <div className="flex items-center gap-2">
                      <Phone size={16} className="text-slate-400" />
                      <span>{customer.phone || 'Chưa cập nhật'}</span>
                    </div>
                  </div>
                )}
                {config.showAddress && (
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-slate-400" />
                    <span>{address}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {visibleActions.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <div className="text-sm font-semibold text-slate-700 mb-4">Tác vụ nhanh</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {visibleActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <Link
                      key={action.id}
                      href={action.href}
                      className="flex items-center gap-4 rounded-xl border border-slate-200 px-4 py-4 hover:border-slate-300"
                    >
                      <div className={`w-11 h-11 rounded-lg flex items-center justify-center ${action.bg} ${action.color}`}>
                        <Icon size={20} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-900">{action.label}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{action.description}</p>
                      </div>
                      <ArrowRight size={18} className="text-slate-300" />
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {config.layoutStyle === 'sidebar' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col lg:flex-row">
          <div className="text-white p-6 lg:w-1/3" style={{ backgroundColor: brandColor }}>
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full border-2 border-white/40 bg-white/10 flex items-center justify-center">
                <User size={28} className="text-white" />
              </div>
              <h2 className="text-lg font-semibold uppercase tracking-tight mt-4">{displayName}</h2>
              {config.showLoyaltyBadge && (
                <div className="mt-2 inline-flex items-center gap-1 text-xs text-white/80">
                  <Award size={12} /> Khách hàng thân thiết
                </div>
              )}
            </div>

            {(config.showContactInfo || config.showAddress) && (
              <div className="mt-6 space-y-3 text-sm">
                {config.showContactInfo && (
                  <div className="flex items-center gap-2 text-white/90">
                    <Mail size={14} className="text-white/70" />
                    <span className="truncate">{customer.email}</span>
                  </div>
                )}
                {config.showContactInfo && (
                  <div className="flex items-center gap-2 text-white/90">
                    <Phone size={14} className="text-white/70" />
                    <span className="truncate">{customer.phone || 'Chưa cập nhật'}</span>
                  </div>
                )}
                {config.showAddress && (
                  <div className="flex items-center gap-2 text-white/90">
                    <MapPin size={14} className="text-white/70" />
                    <span className="truncate">{address}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="p-6 lg:w-2/3 bg-white">
            <div className="mb-5">
              <h3 className="text-lg font-medium text-slate-800">Chào mừng trở lại.</h3>
              {config.showJoinDate && (
                <div className="text-xs text-slate-500 mt-1">Tham gia {joinedDate}</div>
              )}
            </div>
            <div className="grid grid-cols-1 gap-3">
              {visibleActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.id}
                    href={action.href}
                    className="flex items-center gap-4 p-4 border border-slate-100 rounded-xl shadow-sm"
                  >
                    <div className={`w-11 h-11 rounded-lg flex items-center justify-center ${action.bg} ${action.color}`}>
                      <Icon size={20} />
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-semibold ${action.color}`}>{action.label}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{action.description}</p>
                    </div>
                    <ArrowRight size={18} className="text-slate-300" />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {config.layoutStyle === 'compact' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col lg:flex-row">
          <div className="p-5 text-white lg:w-1/3" style={{ backgroundColor: brandColor }}>
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full border border-white/30 flex items-center justify-center">
                <User size={20} className="text-white" />
              </div>
              <div>
                <h3 className="text-base font-semibold">{displayName}</h3>
                {config.showLoyaltyBadge && <p className="text-xs text-white/80">Khách hàng thân thiết</p>}
              </div>
            </div>
            {config.showContactInfo && (
              <div className="mt-4 space-y-2 text-xs text-white/90">
                <div className="flex items-center gap-2">
                  <Mail size={12} className="text-white/70" />
                  <span className="truncate">{customer.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={12} className="text-white/70" />
                  <span>{customer.phone || 'Chưa cập nhật'}</span>
                </div>
              </div>
            )}
          </div>

          <div className="p-5 lg:w-2/3 bg-white">
            <h4 className="text-sm font-semibold text-slate-900 mb-4 border-l-4 pl-2" style={{ borderColor: brandColor }}>
              Truy cập nhanh
            </h4>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {visibleActions.map((action) => {
                const Icon = action.icon;
                const isHighlight = action.id === 'shop';
                if (isHighlight) {
                  return (
                    <Link
                      key={action.id}
                      href={action.href}
                      className="col-span-2 rounded-xl text-white p-4 flex items-center justify-between shadow-sm"
                      style={{ background: `linear-gradient(135deg, ${brandColor}, #0f172a)` }}
                    >
                      <div>
                        <p className="text-sm font-semibold">{action.label}</p>
                        <p className="text-xs text-white/80">{action.description}</p>
                      </div>
                      <Icon size={18} />
                    </Link>
                  );
                }
                return (
                  <Link key={action.id} href={action.href} className="rounded-xl border border-slate-100 p-3 bg-white shadow-sm">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${action.bg} ${action.color}`}>
                      <Icon size={18} />
                    </div>
                    <p className="text-xs font-semibold text-slate-800 mt-3">{action.label}</p>
                    <p className="text-[10px] text-slate-400 mt-1">{action.description}</p>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
