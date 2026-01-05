'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { Button, Card, CardContent, Input, Label, Badge, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, cn } from '../../../components/ui';
import { mockPostCategories, mockPosts } from '../../../mockData';

export default function PostCategoryEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const currentCategory = mockPostCategories.find(c => c.id === id);
  
  const [activeTab, setActiveTab] = useState('info');
  const [name, setName] = useState(currentCategory?.name || '');
  const [slug] = useState(currentCategory?.slug || '');

  if (!currentCategory) {
    return <div className="text-center py-8 text-slate-500">Không tìm thấy danh mục</div>;
  }

  const relatedPosts = mockPosts.filter(p => p.category === currentCategory.name);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Đã cập nhật danh mục");
    router.push('/admin/post-categories');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Chỉnh sửa danh mục</h1>
          <Link href="/admin/post-categories" className="text-sm text-blue-600 hover:underline">Quay lại danh sách</Link>
        </div>
        <Button variant="outline" className="gap-2" onClick={() => window.open(`https://example.com/category/${slug}`, '_blank')}>
          <ExternalLink size={16}/> Xem trên web
        </Button>
      </div>

      <div className="flex border-b border-slate-200 dark:border-slate-700">
        <button
          onClick={() => setActiveTab('info')}
          className={cn(
            "px-6 py-3 text-sm font-medium border-b-2 transition-colors",
            activeTab === 'info' ? "border-blue-500 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"
          )}
        >
          Thông tin chung
        </button>
        <button
          onClick={() => setActiveTab('posts')}
          className={cn(
            "px-6 py-3 text-sm font-medium border-b-2 transition-colors",
            activeTab === 'posts' ? "border-blue-500 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"
          )}
        >
          Bài viết thuộc danh mục <Badge variant="secondary" className="ml-1">{relatedPosts.length}</Badge>
        </button>
      </div>

      {activeTab === 'info' ? (
        <Card className="max-w-md mx-auto md:mx-0">
          <form onSubmit={handleSubmit}>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label>Tên danh mục <span className="text-red-500">*</span></Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Ví dụ: Công nghệ, Đời sống..." autoFocus />
              </div>
            </CardContent>
            
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 rounded-b-lg flex justify-end gap-3">
              <Button type="button" variant="ghost" onClick={() => router.push('/admin/post-categories')}>Hủy bỏ</Button>
              <Button type="submit" variant="accent">Lưu thay đổi</Button>
            </div>
          </form>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Hình ảnh</TableHead>
                <TableHead>Tiêu đề bài viết</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {relatedPosts.map(post => (
                <TableRow key={post.id}>
                  <TableCell><img src={post.thumbnail} className="w-10 h-8 object-cover rounded" alt="" /></TableCell>
                  <TableCell className="font-medium">{post.title}</TableCell>
                  <TableCell className="text-slate-500 text-xs">{new Date(post.created).toLocaleDateString('vi-VN')}</TableCell>
                  <TableCell className="text-right">
                    <Link href={`/admin/posts/${post.id}/edit`}>
                      <Button variant="ghost" size="sm" className="h-8">Sửa</Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
              {relatedPosts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-slate-500">
                    Chưa có bài viết nào trong danh mục này.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
