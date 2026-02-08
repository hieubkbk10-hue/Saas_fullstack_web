'use client';

import React from 'react';
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

type AccountProfilePreviewProps = {
  layoutStyle: 'card' | 'sidebar' | 'compact';
  device: 'desktop' | 'tablet' | 'mobile';
  showQuickActions: boolean;
  showContactInfo: boolean;
  showLoyaltyBadge: boolean;
  showAddress: boolean;
  showMemberId: boolean;
  showJoinDate: boolean;
  actionItems: string[];
  brandColor: string;
};

const ACTIONS = [
  {
    id: 'orders',
    label: 'Đơn hàng của tôi',
    description: 'Xem lịch sử và trạng thái',
    icon: PackageCheck,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    id: 'shop',
    label: 'Tiếp tục mua sắm',
    description: 'Khám phá sản phẩm mới',
    icon: ShoppingBag,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },
  {
    id: 'wishlist',
    label: 'Danh sách yêu thích',
    description: 'Sản phẩm đã lưu',
    icon: Heart,
    color: 'text-rose-600',
    bg: 'bg-rose-50',
  },
  {
    id: 'payment',
    label: 'Phương thức thanh toán',
    description: 'Quản lý thẻ & ví',
    icon: CreditCard,
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
  },
  {
    id: 'settings',
    label: 'Cài đặt tài khoản',
    description: 'Bảo mật & thông báo',
    icon: Settings,
    color: 'text-slate-600',
    bg: 'bg-slate-100',
  },
];

const DEFAULT_ACTION_IDS = ACTIONS.map((action) => action.id);

export function AccountProfilePreview({
  layoutStyle,
  device,
  showQuickActions,
  showContactInfo,
  showLoyaltyBadge,
  showAddress,
  showMemberId: _showMemberId,
  showJoinDate: _showJoinDate,
  actionItems,
  brandColor,
}: AccountProfilePreviewProps) {
  const selectedActionIds = actionItems.length > 0 ? actionItems : DEFAULT_ACTION_IDS;
  const visibleActions = showQuickActions
    ? ACTIONS.filter((action) => selectedActionIds.includes(action.id))
    : [];
  const isMobile = device === 'mobile';

  const user = {
    name: 'Nguyễn Văn A',
    role: 'Quản lý dự án',
    email: 'nguyen.van.a@doanhnghiep.com',
    phone: '0909 000 000',
    address: 'Tầng 12, Bitexco, Q.1, TP.HCM',
    joinDate: '2023-01-15',
    memberId: 'CUS-1024',
  };

  if (layoutStyle === 'sidebar') {
    return (
      <div className="bg-slate-50 rounded-2xl p-4">
        <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden ${isMobile ? 'flex flex-col' : 'flex'}`}>
          <div
            className={`text-white ${isMobile ? 'w-full' : 'w-1/3'} p-6 flex flex-col justify-center`}
            style={{ backgroundColor: brandColor }}
          >
            <div className={`flex ${isMobile ? 'flex-row items-center gap-4' : 'flex-col items-center'} text-center`}
            >
              <div className="relative mb-4">
                <div className="w-20 h-20 rounded-full border-2 border-white/40 overflow-hidden bg-white/10 flex items-center justify-center">
                  <User className="text-white" size={28} />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold uppercase tracking-tight">{user.name}</h3>
                {showLoyaltyBadge && (
                  <div className="mt-1 inline-flex items-center gap-1 text-xs text-white/80">
                    <Award size={12} /> {user.role}
                  </div>
                )}
              </div>
            </div>

            {showContactInfo && (
              <div className="mt-6 space-y-3 text-left">
                <div className="flex items-center gap-2 text-xs text-white/90">
                  <Mail size={14} className="text-white/70" />
                  <span className="truncate">{user.email}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-white/90">
                  <Phone size={14} className="text-white/70" />
                  <span className="truncate">{user.phone}</span>
                </div>
              </div>
            )}
          </div>

          <div className={`${isMobile ? 'w-full' : 'w-2/3'} p-6 bg-white`}>
            <div className="mb-5">
              <h4 className="text-lg font-medium text-slate-800">Chào mừng trở lại.</h4>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {visibleActions.map((action) => {
                const Icon = action.icon;
                return (
                  <div key={action.id} className="flex items-center gap-4 p-4 border border-slate-100 rounded-xl shadow-sm">
                    <div className={`w-11 h-11 rounded-lg flex items-center justify-center ${action.bg} ${action.color}`}>
                      <Icon size={20} />
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-semibold ${action.color}`}>{action.label}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{action.description}</p>
                    </div>
                    <ArrowRight size={18} className="text-slate-300" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (layoutStyle === 'compact') {
    const shopAction = visibleActions.find((action) => action.id === 'shop');
    const otherActions = visibleActions.filter((action) => action.id !== 'shop');

    return (
      <div className="bg-slate-50 rounded-2xl p-3">
        <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden ${isMobile ? 'flex flex-col' : 'flex'}`}>
          <div
            className={`${isMobile ? 'w-full' : 'w-1/3'} p-5 text-white flex flex-col justify-center`}
            style={{ backgroundColor: brandColor }}
          >
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full border border-white/30 flex items-center justify-center">
                <User size={20} className="text-white" />
              </div>
              <div>
                <h3 className="text-base font-semibold">{user.name}</h3>
                {showLoyaltyBadge && <p className="text-xs text-white/80">{user.role}</p>}
              </div>
            </div>
            {showContactInfo && (
              <div className="mt-4 space-y-2 text-xs text-white/90">
                <div className="flex items-center gap-2">
                  <Mail size={12} className="text-white/70" />
                  <span className="truncate">{user.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={12} className="text-white/70" />
                  <span>{user.phone}</span>
                </div>
              </div>
            )}
          </div>

          <div className={`${isMobile ? 'w-full' : 'w-2/3'} p-5 bg-white`}>
            <h4 className="text-sm font-semibold text-slate-900 mb-4 border-l-4 pl-2" style={{ borderColor: brandColor }}>
              Truy cập nhanh
            </h4>
            <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-4'} gap-3`}>
              {shopAction && (
                <div
                  className={`${isMobile ? 'col-span-2' : 'col-span-2'} rounded-xl text-white p-4 flex items-center justify-between shadow-sm`}
                  style={{ background: `linear-gradient(135deg, ${brandColor}, #0f172a)` }}
                >
                  <div>
                    <p className="text-sm font-semibold">{shopAction.label}</p>
                    <p className="text-xs text-white/80">{shopAction.description}</p>
                  </div>
                  <shopAction.icon size={18} />
                </div>
              )}
              {otherActions.map((action) => {
                const Icon = action.icon;
                return (
                  <div key={action.id} className="rounded-xl border border-slate-100 p-3 bg-white shadow-sm">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${action.bg} ${action.color}`}>
                      <Icon size={18} />
                    </div>
                    <p className="text-xs font-semibold text-slate-800 mt-3">{action.label}</p>
                    <p className="text-[10px] text-slate-400 mt-1">{action.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const quickActionGridClass = isMobile ? 'grid grid-cols-1 gap-3 text-xs' : 'grid grid-cols-3 gap-4 text-xs';

  return (
    <div className="bg-slate-50 rounded-2xl p-4 space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">Tài khoản của tôi</h3>
        <p className="text-xs text-slate-500">Preview account profile</p>
      </div>

      <div className="space-y-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: brandColor }}>
                <User size={20} />
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
            </div>
            <div>
              <div className="text-base font-semibold text-slate-900">{user.name}</div>
              {showLoyaltyBadge && (
                <div className="mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ color: brandColor, backgroundColor: `${brandColor}1A` }}>
                  <Award size={12} /> Khách hàng thân thiết
                </div>
              )}
            </div>
          </div>

          {(showContactInfo || showAddress) && (
            <div className="mt-5 grid gap-3 text-xs text-slate-600">
              {showContactInfo && (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Mail size={14} className="text-slate-400" />
                    <span>{user.email}</span>
                  </div>
                  <div className="h-1 w-1 rounded-full bg-slate-300" />
                  <div className="flex items-center gap-2">
                    <Phone size={14} className="text-slate-400" />
                    <span>{user.phone}</span>
                  </div>
                </div>
              )}
              {showAddress && (
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-slate-400" />
                  <span>{user.address}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {visibleActions.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
            <div className="text-xs font-semibold text-slate-700">Tác vụ nhanh</div>
            <div className={quickActionGridClass}>
              {visibleActions.map((action) => {
                const Icon = action.icon;
                return (
                  <div key={action.id} className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${action.bg} ${action.color}`}>
                      <Icon size={18} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-900">{action.label}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{action.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
