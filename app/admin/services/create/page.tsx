'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Loader2, Plus, Briefcase } from 'lucide-react';
import { toast } from 'sonner';
import { Button, Card, CardHeader, CardTitle, CardContent, Input, Label } from '../../components/ui';
import { LexicalEditor } from '../../components/LexicalEditor';
import { ImageUploader } from '../../components/ImageUploader';
import { useFormShortcuts } from '../../components/useKeyboardShortcuts';
import { QuickCreateServiceCategoryModal } from '../../components/QuickCreateServiceCategoryModal';

const MODULE_KEY = 'services';

export default function ServiceCreatePage() {
  const router = useRouter();
  const categoriesData = useQuery(api.serviceCategories.listAll, {});
  const createService = useMutation(api.services.create);
  const fieldsData = useQuery(api.admin.modules.listEnabledModuleFields, { moduleKey: MODULE_KEY });
  const settingsData = useQuery(api.admin.modules.listModuleSettings, { moduleKey: MODULE_KEY });

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [thumbnail, setThumbnail] = useState<string | undefined>();
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState<number | undefined>();
  const [duration, setDuration] = useState('');
  const [featured, setFeatured] = useState(false);
  const [status, setStatus] = useState<'Draft' | 'Published'>('Draft');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  useEffect(() => {
    if (settingsData) {
      const defaultStatus = settingsData.find(s => s.settingKey === 'defaultStatus')?.value as string;
      if (defaultStatus === 'published') {
        setStatus('Published');
      }
    }
  }, [settingsData]);

  const handleSaveShortcut = useCallback(() => {
    const form = document.querySelector('form');
    if (form && title.trim() && categoryId) {
      form.requestSubmit();
    }
  }, [title, categoryId]);

  const handleCancelShortcut = useCallback(() => {
    router.push('/admin/services');
  }, [router]);

  useFormShortcuts({
    onSave: handleSaveShortcut,
    onCancel: handleCancelShortcut,
  });

  const enabledFields = useMemo(() => {
    const fields = new Set<string>();
    fieldsData?.forEach(f => fields.add(f.fieldKey));
    return fields;
  }, [fieldsData]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    const generatedSlug = val.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[đĐ]/g, "d")
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-');
    setSlug(generatedSlug);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !categoryId) return;

    setIsSubmitting(true);
    try {
      await createService({
        title: title.trim(),
        slug: slug.trim() || title.toLowerCase().replace(/\s+/g, '-'),
        content,
        excerpt: excerpt.trim() || undefined,
        thumbnail,
        categoryId: categoryId as Id<"serviceCategories">,
        price,
        duration: duration.trim() || undefined,
        featured,
        status,
      });
      toast.success("Tạo dịch vụ mới thành công");
      router.push('/admin/services');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể tạo dịch vụ");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
    <QuickCreateServiceCategoryModal 
      isOpen={showCategoryModal} 
      onClose={() => setShowCategoryModal(false)} 
      onCreated={(id) => setCategoryId(id)}
    />
    <form onSubmit={handleSubmit} className="space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-500/10 rounded-lg">
            <Briefcase className="w-6 h-6 text-teal-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Thêm dịch vụ mới</h1>
            <div className="text-sm text-slate-500 mt-1">Tạo dịch vụ mới cho website</div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                 <Label>Tiêu đề <span className="text-red-500">*</span></Label>
                <Input value={title} onChange={handleTitleChange} required placeholder="Nhập tiêu đề dịch vụ..." />
              </div>
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="tu-dong-tao-tu-tieu-de" className="font-mono text-sm" />
              </div>
              {enabledFields.has('excerpt') && (
                 <div className="space-y-2">
                   <Label>Mô tả ngắn</Label>
                   <Input value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="Tóm tắt nội dung dịch vụ..." />
                 </div>
               )}
              <div className="space-y-2">
                 <Label>Nội dung</Label>
                 <LexicalEditor onChange={setContent} />
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
                  onChange={(e) => setStatus(e.target.value as 'Draft' | 'Published')}
                  className="w-full h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                >
                  <option value="Draft">Bản nháp</option>
                   <option value="Published">Đã xuất bản</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Danh mục <span className="text-red-500">*</span></Label>
                <div className="flex gap-2">
                  <select 
                    value={categoryId} 
                    onChange={(e) => setCategoryId(e.target.value)}
                    required
                    className="flex-1 h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                  >
                    <option value="">-- Chọn danh mục --</option>
                    {categoriesData?.map(cat => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="icon"
                    onClick={() => setShowCategoryModal(true)}
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
                    onChange={(e) => setFeatured(e.target.checked)}
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
                      value={price || ''} 
                      onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : undefined)} 
                      placeholder="0"
                    />
                  </div>
                )}
                {enabledFields.has('duration') && (
                  <div className="space-y-2">
                    <Label>Thời gian thực hiện</Label>
                    <Input 
                      value={duration} 
                      onChange={(e) => setDuration(e.target.value)} 
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
                onChange={(url) => setThumbnail(url)}
                folder="services"
                aspectRatio="video"
              />
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 lg:left-[280px] right-0 p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center z-10">
        <Button type="button" variant="ghost" onClick={() => router.push('/admin/services')} title="Hủy (Esc)">Hủy bỏ</Button>
        <div className="flex gap-2">
          <span className="text-xs text-slate-400 self-center hidden sm:block">Ctrl+S để lưu</span>
          <Button type="button" variant="secondary" onClick={() => { setStatus('Draft'); }}>Lưu nháp</Button>
          <Button type="submit" variant="accent" disabled={isSubmitting} title="Lưu (Ctrl+S)" className="bg-teal-600 hover:bg-teal-500">
            {isSubmitting && <Loader2 size={16} className="animate-spin mr-2" />}
            Đăng
          </Button>
        </div>
      </div>
    </form>
    </>
  );
}
