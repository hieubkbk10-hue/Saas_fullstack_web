'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { toast } from 'sonner';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from '../../../components/ui';
import { mockMenus, mockMenuItems } from '../../../mockData';

export default function MenuEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const menu = mockMenus.find(m => m.id === id);
  const [menuItems, setMenuItems] = useState(mockMenuItems.filter(item => item.menuId === id));

  if (!menu) {
    return <div className="text-center py-8 text-slate-500">Không tìm thấy menu</div>;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Đã cập nhật menu");
    router.push('/admin/menus');
  };

  const handleDeleteItem = (itemId: string) => {
    setMenuItems(prev => prev.filter(item => item.id !== itemId));
    toast.success('Đã xóa mục menu');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Chỉnh sửa menu</h1>
        <Link href="/admin/menus" className="text-sm text-blue-600 hover:underline">Quay lại danh sách</Link>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="mb-6">
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tên menu <span className="text-red-500">*</span></Label>
                <Input defaultValue={menu.name} required />
              </div>
              <div className="space-y-2">
                <Label>Vị trí hiển thị</Label>
                <select className="w-full h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm" defaultValue={menu.location}>
                  <option value="Header">Header</option>
                  <option value="Footer Col 1">Footer Col 1</option>
                  <option value="Footer Col 2">Footer Col 2</option>
                  <option value="Sidebar">Sidebar</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Các mục trong menu</CardTitle>
            <Button type="button" size="sm" variant="outline" className="gap-2">
              <Plus size={14} /> Thêm mục
            </Button>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-2">
              {menuItems.map(item => (
                <div 
                  key={item.id} 
                  className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg"
                  style={{ marginLeft: item.depth * 24 }}
                >
                  <GripVertical size={16} className="text-slate-400 cursor-grab" />
                  <Input defaultValue={item.label} className="flex-1 h-9" />
                  <Input defaultValue={item.url} className="flex-1 h-9" placeholder="URL" />
                  <Button type="button" variant="ghost" size="icon" className="text-red-500 hover:text-red-600 h-9 w-9" onClick={() => handleDeleteItem(item.id)}>
                    <Trash2 size={14} />
                  </Button>
                </div>
              ))}
              {menuItems.length === 0 && (
                <div className="text-center py-8 text-slate-500">Chưa có mục nào trong menu này</div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={() => router.push('/admin/menus')}>Hủy bỏ</Button>
          <Button type="submit" variant="accent">Lưu thay đổi</Button>
        </div>
      </form>
    </div>
  );
}
