'use client';

import React, { use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button, Card, CardContent, Input, Label } from '../../../components/ui';
import { mockCustomers } from '../../../mockData';

export default function CustomerEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const customer = mockCustomers.find(c => c.id === id);

  if (!customer) {
    return <div className="text-center py-8 text-slate-500">Không tìm thấy khách hàng</div>;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Đã cập nhật khách hàng");
    router.push('/admin/customers');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Chỉnh sửa khách hàng</h1>
        <Link href="/admin/customers" className="text-sm text-blue-600 hover:underline">Quay lại danh sách</Link>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Họ tên <span className="text-red-500">*</span></Label>
                <Input defaultValue={customer.name} required placeholder="Nhập họ tên..." />
              </div>
              <div className="space-y-2">
                <Label>Email <span className="text-red-500">*</span></Label>
                <Input type="email" defaultValue={customer.email} required placeholder="Nhập email..." />
              </div>
              <div className="space-y-2">
                <Label>Số điện thoại</Label>
                <Input defaultValue={customer.phone} placeholder="Nhập số điện thoại..." />
              </div>
              <div className="space-y-2">
                <Label>Thành phố</Label>
                <Input defaultValue={customer.city} placeholder="Nhập thành phố..." />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Địa chỉ</Label>
              <Input defaultValue={customer.address} placeholder="Nhập địa chỉ đầy đủ..." />
            </div>
            <div className="space-y-2">
              <Label>Ghi chú</Label>
              <textarea 
                className="w-full min-h-[100px] rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                defaultValue={customer.notes}
                placeholder="Ghi chú về khách hàng..."
              />
            </div>
          </CardContent>
          
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 rounded-b-lg flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => router.push('/admin/customers')}>Hủy bỏ</Button>
            <Button type="submit" variant="accent">Lưu thay đổi</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
