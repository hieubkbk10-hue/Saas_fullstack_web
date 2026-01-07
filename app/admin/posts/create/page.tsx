'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Loader2, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button, Card, CardHeader, CardTitle, CardContent, Input, Label } from '../../components/ui';
import { LexicalEditor } from '../../components/LexicalEditor';
import { ImageUploader } from '../../components/ImageUploader';

function QuickCreateCategoryModal({ 
  isOpen, 
  onClose, 
  onCreated 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onCreated: (id: string) => void;
}) {
  const createCategory = useMutation(api.postCategories.create);
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      const slug = name.toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[đĐ]/g, "d")
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-');
      
      const id = await createCategory({
        name: name.trim(),
        slug,
      });
      toast.success('Tạo danh mục thành công');
      onCreated(id);
      setName('');
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể tạo danh mục');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-900 rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Tạo danh mục nhanh</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Tên danh mục <span className="text-red-500">*</span></Label>
              <Input 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
                placeholder="VD: Tin tức, Hướng dẫn..." 
                autoFocus 
              />
              <p className="text-xs text-slate-500">Slug sẽ được tạo tự động từ tên</p>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="ghost" onClick={onClose}>Hủy</Button>
            <Button type="submit" variant="accent" disabled={isSubmitting}>
              {isSubmitting && <Loader2 size={16} className="animate-spin mr-2" />}
              Tạo danh mục
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

const MODULE_KEY = 'posts';

export default function PostCreatePage() {
  const router = useRouter();
  const categoriesData = useQuery(api.postCategories.listAll);
  const usersData = useQuery(api.users.listAll);
  const createPost = useMutation(api.posts.create);
  const fieldsData = useQuery(api.admin.modules.listEnabledModuleFields, { moduleKey: MODULE_KEY });

  const settingsData = useQuery(api.admin.modules.listModuleSettings, { moduleKey: MODULE_KEY });

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [thumbnail, setThumbnail] = useState<string | undefined>();
  const [categoryId, setCategoryId] = useState('');
  const [status, setStatus] = useState<'Draft' | 'Published'>('Draft');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  // Sync default status from settings
  useEffect(() => {
    if (settingsData) {
      const defaultStatus = settingsData.find(s => s.settingKey === 'defaultStatus')?.value as string;
      if (defaultStatus === 'published') {
        setStatus('Published');
      }
    }
  }, [settingsData]);

  // Check which fields are enabled
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
    if (!title.trim() || !categoryId || !usersData?.length) return;

    setIsSubmitting(true);
    try {
      await createPost({
        title: title.trim(),
        slug: slug.trim() || title.toLowerCase().replace(/\s+/g, '-'),
        content,
        excerpt: excerpt.trim() || undefined,
        thumbnail,
        categoryId: categoryId as Id<"postCategories">,
        authorId: usersData[0]._id,
        status,
      });
      toast.success("Tạo bài viết mới thành công");
      router.push('/admin/posts');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể tạo bài viết");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
    <QuickCreateCategoryModal 
      isOpen={showCategoryModal} 
      onClose={() => setShowCategoryModal(false)} 
      onCreated={(id) => setCategoryId(id)}
    />
    <form onSubmit={handleSubmit} className="space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Thêm bài viết mới</h1>
          <div className="text-sm text-slate-500 mt-1">Tạo nội dung mới cho website</div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6 space-y-4">
              {/* title - always shown (system field) */}
              <div className="space-y-2">
                <Label>Tiêu đề <span className="text-red-500">*</span></Label>
                <Input value={title} onChange={handleTitleChange} required placeholder="Nhập tiêu đề bài viết..." />
              </div>
              {/* slug - always shown (system field) */}
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="tu-dong-tao-tu-tieu-de" className="font-mono text-sm" />
              </div>
              {/* excerpt - conditional */}
              {enabledFields.has('excerpt') && (
                <div className="space-y-2">
                  <Label>Mô tả ngắn</Label>
                  <Input value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="Tóm tắt nội dung bài viết..." />
                </div>
              )}
              {/* content - always shown (system field) */}
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
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader><CardTitle className="text-base">Ảnh đại diện</CardTitle></CardHeader>
            <CardContent>
              <ImageUploader
                value={thumbnail}
                onChange={(url) => setThumbnail(url)}
                folder="posts"
                aspectRatio="video"
              />
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 lg:left-[280px] right-0 p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center z-10">
        <Button type="button" variant="ghost" onClick={() => router.push('/admin/posts')}>Hủy bỏ</Button>
        <div className="flex gap-2">
          <Button type="button" variant="secondary" onClick={() => { setStatus('Draft'); }}>Lưu nháp</Button>
          <Button type="submit" variant="accent" disabled={isSubmitting}>
            {isSubmitting && <Loader2 size={16} className="animate-spin mr-2" />}
            Đăng bài
          </Button>
        </div>
      </div>
    </form>
    </>
  );
}
