'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Upload, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button, Card, CardHeader, CardTitle, CardContent, Input, Label } from '../../../components/ui';
import { mockPostCategories, mockPosts } from '../../../mockData';

export default function PostEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const currentPost = mockPosts.find(p => p.id === id);
  const [content, setContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Cập nhật bài viết thành công");
    router.push('/admin/posts');
  }

  if (!currentPost) {
    return <div className="text-center py-8 text-slate-500">Không tìm thấy bài viết</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Chỉnh sửa bài viết</h1>
          <div className="text-sm text-slate-500 mt-1">Cập nhật nội dung bài viết hiện có</div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label>Tiêu đề</Label>
                <Input defaultValue={currentPost.title} required />
              </div>
              
              <div className="space-y-2">
                <Label>Nội dung</Label>
                <textarea 
                  className="w-full min-h-[300px] rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập nội dung bài viết..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Xuất bản</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Trạng thái</Label>
                <select className="w-full h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm" defaultValue={currentPost.status}>
                  <option value="Draft">Bản nháp</option>
                  <option value="Published">Đã xuất bản</option>
                  <option value="Archived">Lưu trữ</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Danh mục</Label>
                <select className="w-full h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm" defaultValue={currentPost.category}>
                  {mockPostCategories.map(cat => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader><CardTitle className="text-base">Ảnh đại diện</CardTitle></CardHeader>
            <CardContent>
              {currentPost.thumbnail ? (
                <div className="relative">
                  <img src={currentPost.thumbnail} alt="" className="w-full h-40 object-cover rounded-lg" />
                  <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-8 w-8"><Trash2 size={14} /></Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  <Upload size={24} className="text-slate-400 mb-2"/>
                  <span className="text-sm text-slate-500">Kéo thả hoặc click để tải lên</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 lg:left-[280px] right-0 p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center z-10">
        <Button type="button" variant="ghost" onClick={() => router.push('/admin/posts')}>Hủy bỏ</Button>
        <div className="flex gap-2">
          <Button type="button" variant="secondary">Lưu nháp</Button>
          <Button type="submit" variant="accent">Cập nhật</Button>
        </div>
      </div>
    </form>
  )
}
