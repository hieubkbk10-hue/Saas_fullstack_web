'use client';

import React, { use, useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { Briefcase, ExternalLink, Loader2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from '../../../components/ui';
import { LexicalEditor } from '../../../components/LexicalEditor';
import { ImageUploader } from '../../../components/ImageUploader';
import { useFormShortcuts } from '../../../components/useKeyboardShortcuts';
import { QuickCreateServiceCategoryModal } from '../../../components/QuickCreateServiceCategoryModal';
import { stripHtml, truncateText } from '@/lib/seo';

const MODULE_KEY = 'services';

export default function ServiceEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const serviceData = useQuery(api.services.getById, { id: id as Id<"services"> });
  const categoriesData = useQuery(api.serviceCategories.listAll, {});
  const updateService = useMutation(api.services.update);
  const fieldsData = useQuery(api.admin.modules.listEnabledModuleFields, { moduleKey: MODULE_KEY });

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [thumbnail, setThumbnail] = useState<string | undefined>();
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState<number | undefined>();
  const [duration, setDuration] = useState('');
  const [featured, setFeatured] = useState(false);
  const [status, setStatus] = useState<'Draft' | 'Published' | 'Archived'>('Draft');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const handleSaveShortcut = useCallback(() => {
    const form = document.querySelector('form');
    if (form && title.trim()) {
      form.requestSubmit();
    }
  }, [title]);

  const handleCancelShortcut = useCallback(() => {
    router.push('/admin/services');
  }, [router]);

  useFormShortcuts({
    onCancel: handleCancelShortcut,
    onSave: handleSaveShortcut,
  });

  const enabledFields = useMemo(() => {
    const fields = new Set<string>();
    fieldsData?.forEach(f => fields.add(f.fieldKey));
    return fields;
  }, [fieldsData]);

  useEffect(() => {
    if (serviceData) {
      setTitle(serviceData.title);
      setSlug(serviceData.slug);
      setContent(serviceData.content);
      setExcerpt(serviceData.excerpt ?? '');
      setMetaTitle(serviceData.metaTitle ?? '');
      setMetaDescription(serviceData.metaDescription ?? '');
      setThumbnail(serviceData.thumbnail);
      setCategoryId(serviceData.categoryId);
      setPrice(serviceData.price);
      setDuration(serviceData.duration ?? '');
      setFeatured(serviceData.featured ?? false);
      setStatus(serviceData.status);
    }
  }, [serviceData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {return;}

    setIsSubmitting(true);
    try {
      const resolvedMetaTitle = truncateText(title.trim(), 60);
      const resolvedMetaDescription = truncateText(stripHtml(excerpt || content || ''), 160);
      await updateService({
        categoryId: categoryId as Id<"serviceCategories">,
        content,
        duration: duration.trim() || undefined,
        excerpt: excerpt.trim() || undefined,
        featured,
        id: id as Id<"services">,
        metaDescription: enabledFields.has('metaDescription')
          ? (metaDescription.trim() || resolvedMetaDescription || undefined)
          : undefined,
        metaTitle: enabledFields.has('metaTitle')
          ? (metaTitle.trim() || resolvedMetaTitle || undefined)
          : undefined,
        price,
        slug: slug.trim(),
        status,
        thumbnail,
        title: title.trim(),
      });
      toast.success("Cập nhật dịch vụ thành công");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể cập nhật dịch vụ");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (serviceData === undefined) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-teal-500" />
      </div>
    );
  }

  if (serviceData === null) {
    return <div className="text-center py-8 text-slate-500">Không tìm thấy dịch vụ</div>;
  }

  return (
    <>
    <QuickCreateServiceCategoryModal 
      isOpen={showCategoryModal} 
      onClose={() =>{  setShowCategoryModal(false); }} 
      onCreated={(id) =>{  setCategoryId(id); }}
    />
    <form onSubmit={handleSubmit} className="space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-500/10 rounded-lg">
            <Briefcase className="w-6 h-6 text-teal-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Chỉnh sửa dịch vụ</h1>
             <div className="text-sm text-slate-500 mt-1">Cập nhật thông tin dịch vụ</div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => window.open(`/services/${slug}`, '_blank')}
            className="gap-2"
          >
            <ExternalLink size={16} />
            Xem trên web
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label>Tiêu đề <span className="text-red-500">*</span></Label>
                <Input value={title} onChange={(e) =>{  setTitle(e.target.value); }} required />
              </div>
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input value={slug} onChange={(e) =>{  setSlug(e.target.value); }} className="font-mono text-sm" />
              </div>
              {enabledFields.has('excerpt') && (
                <div className="space-y-2">
                  <Label>Mô tả ngắn</Label>
                  <Input value={excerpt} onChange={(e) =>{  setExcerpt(e.target.value); }} />
                </div>
              )}
              <div className="space-y-2">
                <Label>Nội dung</Label>
                <LexicalEditor onChange={setContent} initialContent={serviceData.content} />
              </div>
            </CardContent>
          </Card>

          {(enabledFields.has('metaTitle') || enabledFields.has('metaDescription')) && (
            <Card>
              <CardHeader><CardTitle className="text-base">SEO</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {enabledFields.has('metaTitle') && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Meta Title</Label>
                      <span className={`text-xs ${metaTitle.length > 60 ? 'text-red-500' : 'text-slate-400'}`}>
                        {metaTitle.length}/60
                      </span>
                    </div>
                    <Input
                      value={metaTitle}
                      onChange={(e) =>{  setMetaTitle(e.target.value); }}
                      placeholder="Tiêu đề hiển thị trên Google"
                    />
                  </div>
                )}
                {enabledFields.has('metaDescription') && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Meta Description</Label>
                      <span className={`text-xs ${metaDescription.length > 160 ? 'text-red-500' : 'text-slate-400'}`}>
                        {metaDescription.length}/160
                      </span>
                    </div>
                    <textarea
                      value={metaDescription}
                      onChange={(e) =>{  setMetaDescription(e.target.value); }}
                      className="w-full min-h-[90px] rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                      placeholder="Mô tả ngắn cho kết quả tìm kiếm"
                    />
                  </div>
                )}
                <div className="rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-3 text-sm">
                  <div className="text-blue-600 font-medium truncate">
                    {metaTitle.trim() || title || 'Tên dịch vụ'}
                  </div>
                  <div className="text-emerald-600 text-xs">
                    /services/{slug || 'dich-vu'}
                  </div>
                  <div className="text-slate-600 text-xs mt-1 line-clamp-2">
                    {metaDescription.trim() || excerpt || 'Mô tả ngắn sẽ hiển thị tại đây.'}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
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
              {enabledFields.has('featured') && (
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="featured" 
                    checked={featured} 
                    onChange={(e) =>{  setFeatured(e.target.checked); }}
                    className="w-4 h-4 rounded border-slate-300"
                  />
                  <Label htmlFor="featured" className="cursor-pointer">Dịch vụ nổi bật</Label>
                </div>
              )}
            </CardContent>
          </Card>

          {(enabledFields.has('price') || enabledFields.has('duration')) && (
            <Card>
              <CardHeader><CardTitle className="text-base">Thông tin dịch vụ</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {enabledFields.has('price') && (
                  <div className="space-y-2">
                    <Label>Giá dịch vụ (VND)</Label>
                    <Input 
                      type="number" 
                      value={price ?? ''} 
                      onChange={(e) =>{  setPrice(e.target.value ? Number(e.target.value) : undefined); }} 
                      placeholder="0"
                    />
                  </div>
                )}
                {enabledFields.has('duration') && (
                  <div className="space-y-2">
                    <Label>Thời gian thực hiện</Label>
                    <Input 
                      value={duration} 
                      onChange={(e) =>{  setDuration(e.target.value); }} 
                      placeholder="VD: 2-3 tuần"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          )}
          
          <Card>
            <CardHeader><CardTitle className="text-base">Ảnh đại diện</CardTitle></CardHeader>
            <CardContent>
              <ImageUploader
                value={thumbnail}
                onChange={(url) =>{  setThumbnail(url); }}
                folder="services"
                aspectRatio="video"
              />
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 lg:left-[280px] right-0 p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center z-10">
        <Button type="button" variant="ghost" onClick={() =>{  router.push('/admin/services'); }} title="Hủy (Esc)">Hủy bỏ</Button>
        <div className="flex gap-2">
          <span className="text-xs text-slate-400 self-center hidden sm:block">Ctrl+S để lưu</span>
           <Button type="button" variant="secondary" onClick={() =>{  setStatus('Draft'); }}>Lưu nháp</Button>
           <Button type="submit" variant="accent" disabled={isSubmitting} title="Lưu (Ctrl+S)" className="bg-teal-600 hover:bg-teal-500">
             {isSubmitting && <Loader2 size={16} className="animate-spin mr-2" />}
             Cập nhật
           </Button>
        </div>
      </div>
    </form>
    </>
  );
}
