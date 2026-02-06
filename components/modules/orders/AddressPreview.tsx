'use client';

import React from 'react';
import { Input } from '@/app/admin/components/ui';

interface AddressPreviewProps {
  format: string;
}

export function AddressPreview({ format }: AddressPreviewProps) {
  if (format === 'text') {
    return (
      <div className="space-y-2">
        <div className="text-xs text-slate-500">Khách hàng sẽ nhập một dòng địa chỉ.</div>
        <Input placeholder="Địa chỉ giao hàng" disabled />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-3 md:grid-cols-3">
        <select className="h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 text-sm" disabled>
          <option>Chọn Tỉnh/Thành</option>
        </select>
        {format === '3-level' && (
          <select className="h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 text-sm" disabled>
            <option>Chọn Quận/Huyện</option>
          </select>
        )}
        <select className="h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 text-sm" disabled>
          <option>Chọn Phường/Xã</option>
        </select>
      </div>
      <Input placeholder="Số nhà, tên đường" disabled />
    </div>
  );
}
