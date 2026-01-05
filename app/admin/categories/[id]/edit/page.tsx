'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { Button, Card, CardContent, Input, Label } from '../../../components/ui';
import { mockCategories } from '../../../mockData';

export default function CategoryEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const currentCategory = mockCategories.find(c => c.id === id);
  
  const [name, setName] = useState(currentCategory?.name || '');
  const [parent, setParent] = useState(currentCategory?.parent || '');
  const [slug, setSlug] = useState(currentCategory?.slug || '');

  if (!currentCategory) {
    return <div className="text-center py-8 text-slate-500">Không tìm thấy danh mục</div>;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Đã cập nhật danh mục");
    router.push('/admin/categories');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Chỉnh sửa danh mục</h1>
          <Link href="/admin/categories" className="text-sm text-blue-600 hover:underline">Quay lại danh sách</Link>
        </div>
        <Button variant="outline" className="gap-2" onClick={() => window.open(`https://example.com/shop/category/${slug}`, '_blank')}>
          <ExternalLink size={16}/> Xem trên web
        </Button>
      </div>

      <Card className="max-w-md mx-auto md:mx-0">
        <form onSubmit={handleSubmit}>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <Label>Tên danh mục <span className="text-red-500">*</span></Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Ví dụ: Điện thoại, Áo sơ mi..." autoFocus />
            </div>
            
            <div className="space-y-2">
              <Label>Danh mục cha</Label>
              <select 
                value={parent}
                onChange={(e) => setParent(e.target.value)}
                className="w-full h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
              >
                <option value="">-- Không có (Danh mục gốc) --</option>
                {mockCategories.filter(c => c.id !== id).map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </CardContent>
          
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 rounded-b-lg flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => router.push('/admin/categories')}>Hủy bỏ</Button>
            <Button type="submit" variant="accent">Lưu thay đổi</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
