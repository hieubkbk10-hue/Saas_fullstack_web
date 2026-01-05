'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button, Card, CardContent, Input, Label } from '../../components/ui';

export default function MenuCreatePage() {
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Đã tạo menu mới");
    router.push('/admin/menus');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Thêm menu mới</h1>
        <Link href="/admin/menus" className="text-sm text-blue-600 hover:underline">Quay lại danh sách</Link>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <Label>Tên menu <span className="text-red-500">*</span></Label>
              <Input required placeholder="Ví dụ: Header Menu, Footer Menu..." />
            </div>
            <div className="space-y-2">
              <Label>Vị trí hiển thị</Label>
              <select className="w-full h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm">
                <option value="Header">Header</option>
                <option value="Footer Col 1">Footer Col 1</option>
                <option value="Footer Col 2">Footer Col 2</option>
                <option value="Sidebar">Sidebar</option>
              </select>
            </div>
          </CardContent>
          
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 rounded-b-lg flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => router.push('/admin/menus')}>Hủy bỏ</Button>
            <Button type="submit" variant="accent">Tạo menu</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
