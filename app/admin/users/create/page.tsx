'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button, Card, CardContent, Input, Label } from '../../components/ui';
import { mockRoles } from '../../mockData';

export default function UserCreatePage() {
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Đã tạo người dùng mới");
    router.push('/admin/users');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Thêm User mới</h1>
        <Link href="/admin/users" className="text-sm text-blue-600 hover:underline">Quay lại danh sách</Link>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Họ tên <span className="text-red-500">*</span></Label>
                <Input required placeholder="Nhập họ tên..." />
              </div>
              <div className="space-y-2">
                <Label>Email <span className="text-red-500">*</span></Label>
                <Input type="email" required placeholder="Nhập email..." />
              </div>
              <div className="space-y-2">
                <Label>Mật khẩu <span className="text-red-500">*</span></Label>
                <Input type="password" required placeholder="Nhập mật khẩu..." />
              </div>
              <div className="space-y-2">
                <Label>Số điện thoại</Label>
                <Input placeholder="Nhập số điện thoại..." />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Vai trò</Label>
                <select className="w-full h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm">
                  {mockRoles.map(role => (
                    <option key={role.id} value={role.id}>{role.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Trạng thái</Label>
                <select className="w-full h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm">
                  <option value="Active">Hoạt động</option>
                  <option value="Inactive">Không hoạt động</option>
                </select>
              </div>
            </div>
          </CardContent>
          
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 rounded-b-lg flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => router.push('/admin/users')}>Hủy bỏ</Button>
            <Button type="submit" variant="accent">Tạo User</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
