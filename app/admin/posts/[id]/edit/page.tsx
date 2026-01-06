'use client';

import React, { useState, use, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Upload, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button, Card, CardHeader, CardTitle, CardContent, Input, Label } from '../../../components/ui';
import { LexicalEditor } from '../../../components/LexicalEditor';

const MODULE_KEY = 'posts';

export default function PostEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const postData = useQuery(api.posts.getById, { id: id as Id<"posts"> });
  const categoriesData = useQuery(api.postCategories.listAll);
  const updatePost = useMutation(api.posts.update);
  const fieldsData = useQuery(api.admin.modules.listEnabledModuleFields, { moduleKey: MODULE_KEY });

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [status, setStatus] = useState<'Draft' | 'Published' | 'Archived'>('Draft');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check which fields are enabled
  const enabledFields = useMemo(() => {
    const fields = new Set<string>();
    fieldsData?.forEach(f => fields.add(f.fieldKey));
    return fields;
  }, [fieldsData]);

  useEffect(() => {
    if (postData) {
      setTitle(postData.title);
      setSlug(postData.slug);
      setContent(postData.content);
      setExcerpt(postData.excerpt || '');
      setCategoryId(postData.categoryId);
      setStatus(postData.status);
    }
  }, [postData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      await updatePost({
        id: id as Id<"posts">,
        title: title.trim(),
        slug: slug.trim(),
        content,
        excerpt: excerpt.trim() || undefined,
        categoryId: categoryId as Id<"postCategories">,
        status,
      });
      toast.success("Cập nhật bài viết thành công");
      router.push('/admin/posts');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể cập nhật bài viết");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (postData === undefined) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-blue-500" />
      </div>
    );
  }

  if (postData === null) {
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
              {/* title - always shown (system field) */}
              <div className="space-y-2">
                <Label>Tiêu đề <span className="text-red-500">*</span></Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>
              {/* slug - always shown (system field) */}
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input value={slug} onChange={(e) => setSlug(e.target.value)} className="font-mono text-sm" />
              </div>
              {/* excerpt - conditional */}
              {enabledFields.has('excerpt') && (
                <div className="space-y-2">
                  <Label>Mô tả ngắn</Label>
                  <Input value={excerpt} onChange={(e) => setExcerpt(e.target.value)} />
                </div>
              )}
              {/* content - always shown (system field) */}
              <div className="space-y-2">
                <Label>Nội dung</Label>
                <LexicalEditor onChange={setContent} initialContent={postData.content} />
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
                <select 
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'Draft' | 'Published' | 'Archived')}
                  className="w-full h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                >
                  <option value="Draft">Bản nháp</option>
                  <option value="Published">Đã xuất bản</option>
                  <option value="Archived">Lưu trữ</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Danh mục</Label>
                <select 
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                >
                  {categoriesData?.map(cat => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader><CardTitle className="text-base">Ảnh đại diện</CardTitle></CardHeader>
            <CardContent>
              {postData.thumbnail ? (
                <div className="relative">
                  <img src={postData.thumbnail} alt="" className="w-full h-40 object-cover rounded-lg" />
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
          <Button type="button" variant="secondary" onClick={() => setStatus('Draft')}>Lưu nháp</Button>
          <Button type="submit" variant="accent" disabled={isSubmitting}>
            {isSubmitting && <Loader2 size={16} className="animate-spin mr-2" />}
            Cập nhật
          </Button>
        </div>
      </div>
    </form>
  );
}
