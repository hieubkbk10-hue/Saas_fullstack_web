'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button, Card, CardContent, Input, Label } from '../../components/ui';
import { mockCategories } from '../../mockData';

export default function CategoryCreatePage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [parent, setParent] = useState('');

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    const generatedSlug = val.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[đĐ]/g, "d")
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-');
    setSlug(generatedSlug);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Đã tạo danh mục mới");
    router.push('/admin/categories');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Thêm danh mục mới</h1>
          <Link href="/admin/categories" className="text-sm text-blue-600 hover:underline">Quay lại danh sách</Link>
        </div>
      </div>

      <Card className="max-w-md mx-auto md:mx-0">
        <form onSubmit={handleSubmit}>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <Label>Tên danh mục <span className="text-red-500">*</span></Label>
              <Input value={name} onChange={handleNameChange} required placeholder="Ví dụ: Điện thoại, Áo sơ mi..." autoFocus />
            </div>
            
            <div className="space-y-2">
              <Label>Danh mục cha</Label>
              <select 
                value={parent}
                onChange={(e) => setParent(e.target.value)}
                className="w-full h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
              >
                <option value="">-- Không có (Danh mục gốc) --</option>
                {mockCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </CardContent>
          
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 rounded-b-lg flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => router.push('/admin/categories')}>Hủy bỏ</Button>
            <Button type="submit" variant="accent">Tạo danh mục</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
