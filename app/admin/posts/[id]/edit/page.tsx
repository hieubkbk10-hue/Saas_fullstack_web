'use client';

import React, { use, useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { Loader2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from '../../../components/ui';
import { LexicalEditor } from '../../../components/LexicalEditor';
import { ImageUploader } from '../../../components/ImageUploader';
import { useFormShortcuts } from '../../../components/useKeyboardShortcuts';
import { QuickCreateCategoryModal } from '../../../components/QuickCreateCategoryModal';

const MODULE_KEY = 'posts';

export default function PostEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const postData = useQuery(api.posts.getById, { id: id as Id<"posts"> });
  const categoriesData = useQuery(api.postCategories.listAll, {});
  const updatePost = useMutation(api.posts.update);
  const fieldsData = useQuery(api.admin.modules.listEnabledModuleFields, { moduleKey: MODULE_KEY });

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [thumbnail, setThumbnail] = useState<string | undefined>();
  const [categoryId, setCategoryId] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [status, setStatus] = useState<'Draft' | 'Published' | 'Archived'>('Draft');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  // Keyboard shortcuts
  const handleSaveShortcut = useCallback(() => {
    const form = document.querySelector('form');
    if (form && title.trim()) {
      form.requestSubmit();
    }
  }, [title]);

  const handleCancelShortcut = useCallback(() => {
    router.push('/admin/posts');
  }, [router]);

  useFormShortcuts({
    onCancel: handleCancelShortcut,
    onSave: handleSaveShortcut,
  });

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
      setExcerpt(postData.excerpt ?? '');
      setThumbnail(postData.thumbnail);
      setCategoryId(postData.categoryId);
      setAuthorName(postData.authorName ?? '');
      setStatus(postData.status);
    }
  }, [postData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {return;}

    setIsSubmitting(true);
    try {
      await updatePost({
        authorName: enabledFields.has('author_name') ? authorName.trim() || undefined : undefined,
        categoryId: categoryId as Id<"postCategories">,
        content,
        excerpt: excerpt.trim() || undefined,
        id: id as Id<"posts">,
        slug: slug.trim(),
        status,
        thumbnail,
        title: title.trim(),
      });
      toast.success("Cập nhật bài viết thành công");
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
    <>
    <QuickCreateCategoryModal 
      isOpen={showCategoryModal} 
      onClose={() =>{  setShowCategoryModal(false); }} 
      onCreated={(id) =>{  setCategoryId(id); }}
    />
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
              {/* Title - always shown (system field) */}
              <div className="space-y-2">
                <Label>Tiêu đề <span className="text-red-500">*</span></Label>
                <Input value={title} onChange={(e) =>{  setTitle(e.target.value); }} required />
              </div>
              {/* Slug - always shown (system field) */}
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input value={slug} onChange={(e) =>{  setSlug(e.target.value); }} className="font-mono text-sm" />
              </div>
              {/* Excerpt - conditional */}
              {enabledFields.has('excerpt') && (
                <div className="space-y-2">
                  <Label>Mô tả ngắn</Label>
                  <Input value={excerpt} onChange={(e) =>{  setExcerpt(e.target.value); }} />
                </div>
              )}
              {/* Content - always shown (system field) */}
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
                  onChange={(e) =>{  setStatus(e.target.value as 'Draft' | 'Published' | 'Archived'); }}
                  className="w-full h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                >
                  <option value="Draft">Bản nháp</option>
                  <option value="Published">Đã xuất bản</option>
                  <option value="Archived">Lưu trữ</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Danh mục</Label>
                <div className="flex gap-2">
                  <select 
                    value={categoryId}
                    onChange={(e) =>{  setCategoryId(e.target.value); }}
                    className="flex-1 h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                  >
                    {categoriesData?.map(cat => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="icon"
                    onClick={() =>{  setShowCategoryModal(true); }}
                    title="Tạo danh mục mới"
                  >
                    <Plus size={16} />
                  </Button>
                </div>
              </div>
              {enabledFields.has('author_name') && (
                <div className="space-y-2">
                  <Label>Tác giả</Label>
                  <Input
                    value={authorName}
                    onChange={(e) =>{  setAuthorName(e.target.value); }}
                    placeholder="Nhập tên tác giả..."
                  />
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader><CardTitle className="text-base">Ảnh đại diện</CardTitle></CardHeader>
            <CardContent>
              <ImageUploader
                value={thumbnail}
                onChange={(url) =>{  setThumbnail(url); }}
                folder="posts"
                aspectRatio="video"
              />
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 lg:left-[280px] right-0 p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center z-10">
        <Button type="button" variant="ghost" onClick={() =>{  router.push('/admin/posts'); }} title="Hủy (Esc)">Hủy bỏ</Button>
        <div className="flex gap-2">
          <span className="text-xs text-slate-400 self-center hidden sm:block">Ctrl+S để lưu</span>
          <Button type="button" variant="secondary" onClick={() =>{  setStatus('Draft'); }}>Lưu nháp</Button>
          <Button type="submit" variant="accent" disabled={isSubmitting} title="Lưu (Ctrl+S)">
            {isSubmitting && <Loader2 size={16} className="animate-spin mr-2" />}
            Cập nhật
          </Button>
        </div>
      </div>
    </form>
    </>
  );
}
