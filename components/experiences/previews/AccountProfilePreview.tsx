'use client';

import React from 'react';
import { Mail, Phone, User } from 'lucide-react';

type AccountProfilePreviewProps = {
  showQuickActions: boolean;
  showContactInfo: boolean;
  showLoyaltyBadge: boolean;
  brandColor: string;
};

export function AccountProfilePreview({
  showQuickActions,
  showContactInfo,
  showLoyaltyBadge,
  brandColor,
}: AccountProfilePreviewProps) {
  return (
    <div className="bg-slate-50 rounded-2xl p-4 space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">Tài khoản của tôi</h3>
        <p className="text-xs text-slate-500">Preview account profile</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: brandColor }}>
            <User size={18} />
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-900">Nguyễn Văn A</div>
            {showLoyaltyBadge && <div className="text-xs text-slate-500">Khách hàng thân thiết</div>}
          </div>
        </div>

        {showContactInfo && (
          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <Mail size={14} className="text-slate-400" />
              customer@email.com
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <Phone size={14} className="text-slate-400" />
              0909 000 000
            </div>
          </div>
        )}
      </div>

      {showQuickActions && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-2">
          <div className="text-xs font-semibold text-slate-700">Tác vụ nhanh</div>
          <div className="grid grid-cols-1 gap-2 text-xs">
            <div className="rounded-lg border border-slate-200 px-3 py-2 text-slate-600">Đơn hàng của tôi</div>
            <div className="rounded-lg border border-slate-200 px-3 py-2 text-slate-600">Danh sách yêu thích</div>
            <div className="rounded-lg border border-slate-200 px-3 py-2 text-slate-600">Tiếp tục mua sắm</div>
          </div>
        </div>
      )}
    </div>
  );
}
