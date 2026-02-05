'use client';

import React, { useState } from 'react';
import { useQuery } from 'convex/react';
import { Package, Search } from 'lucide-react';
import { api } from '@/convex/_generated/api';
import { useBrandColor } from '@/components/site/hooks';

export default function OrderTrackingPage() {
  const brandColor = useBrandColor();
  const ordersModule = useQuery(api.admin.modules.getModuleByKey, { key: 'orders' });
  const [orderCode, setOrderCode] = useState('');
  const [phone, setPhone] = useState('');

  if (ordersModule && !ordersModule.enabled) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-slate-100 flex items-center justify-center">
          <Package size={32} className="text-slate-400" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Theo dõi đơn hàng đang tắt</h1>
        <p className="text-slate-500">Hãy bật module Đơn hàng để sử dụng tính năng này.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Theo dõi đơn hàng</h1>
        <p className="text-slate-500 mt-2">Nhập mã đơn hàng và số điện thoại để kiểm tra trạng thái.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <form
          className="space-y-4"
          onSubmit={(event) => event.preventDefault()}
        >
          <div>
            <label className="text-sm font-medium text-slate-700">Mã đơn hàng</label>
            <input
              type="text"
              value={orderCode}
              onChange={(event) => setOrderCode(event.target.value)}
              placeholder="VD: DH123456"
              className="mt-2 w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Số điện thoại nhận hàng</label>
            <input
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="VD: 0901234567"
              className="mt-2 w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
          </div>
          <button
            type="submit"
            className="w-full h-12 rounded-xl text-white font-semibold flex items-center justify-center gap-2"
            style={{ backgroundColor: brandColor }}
          >
            <Search size={18} />
            Tra cứu đơn hàng
          </button>
        </form>
      </div>
    </div>
  );
}
