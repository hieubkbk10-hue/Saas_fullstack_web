'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from '../../../components/ui';
import { mockRoles } from '../../../mockData';

const permissionModules = [
  { key: 'posts', label: 'Bài viết' },
  { key: 'products', label: 'Sản phẩm' },
  { key: 'orders', label: 'Đơn hàng' },
  { key: 'users', label: 'Người dùng' },
  { key: 'settings', label: 'Cài đặt' },
];

const permissionActions = ['view', 'create', 'edit', 'delete'];

export default function RoleEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const role = mockRoles.find(r => r.id === id);
  const [permissions, setPermissions] = useState<Record<string, string[]>>(role?.permissions || {});

  if (!role) {
    return <div className="text-center py-8 text-slate-500">Không tìm thấy vai trò</div>;
  }

  const togglePermission = (module: string, action: string) => {
    setPermissions(prev => {
      const current = prev[module] || [];
      if (current.includes(action)) {
        return { ...prev, [module]: current.filter(a => a !== action) };
      } else {
        return { ...prev, [module]: [...current, action] };
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Đã cập nhật vai trò");
    router.push('/admin/roles');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Chỉnh sửa vai trò</h1>
        <Link href="/admin/roles" className="text-sm text-blue-600 hover:underline">Quay lại danh sách</Link>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="mb-6">
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <Label>Tên vai trò <span className="text-red-500">*</span></Label>
              <Input defaultValue={role.name} required placeholder="Ví dụ: Biên tập viên..." disabled={role.isSystem} />
            </div>
            <div className="space-y-2">
              <Label>Mô tả</Label>
              <textarea 
                className="w-full min-h-[80px] rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                defaultValue={role.description}
                placeholder="Mô tả quyền hạn của vai trò này..."
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Phân quyền chi tiết</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="grid grid-cols-5 gap-4 pb-2 border-b border-slate-200 dark:border-slate-700">
                <div className="font-medium text-sm text-slate-500">Module</div>
                {permissionActions.map(action => (
                  <div key={action} className="text-center text-sm font-medium text-slate-500 capitalize">{action === 'view' ? 'Xem' : action === 'create' ? 'Tạo' : action === 'edit' ? 'Sửa' : 'Xóa'}</div>
                ))}
              </div>
              {permissionModules.map(module => (
                <div key={module.key} className="grid grid-cols-5 gap-4 items-center py-2">
                  <div className="font-medium text-slate-700 dark:text-slate-300">{module.label}</div>
                  {permissionActions.map(action => (
                    <div key={action} className="flex justify-center">
                      <input
                        type="checkbox"
                        checked={permissions[module.key]?.includes(action) || false}
                        onChange={() => togglePermission(module.key, action)}
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={() => router.push('/admin/roles')}>Hủy bỏ</Button>
          <Button type="submit" variant="accent">Lưu thay đổi</Button>
        </div>
      </form>
    </div>
  );
}
