'use client';

import React, { useState, use, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button, Card, CardHeader, CardTitle, CardContent, Input, Label } from '../../../components/ui';
import { LexicalEditor } from '../../../components/LexicalEditor';
import { ImageUpload } from '../../../components/ImageUpload';

const MODULE_KEY = 'products';

export default function ProductEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const productData = useQuery(api.products.getById, { id: id as Id<"products"> });
  const categoriesData = useQuery(api.productCategories.listAll);
  const updateProduct = useMutation(api.products.update);
  const fieldsData = useQuery(api.admin.modules.listEnabledModuleFields, { moduleKey: MODULE_KEY });

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [sku, setSku] = useState('');
  const [price, setPrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [stock, setStock] = useState('0');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<string | undefined>();
  const [status, setStatus] = useState<'Draft' | 'Active' | 'Archived'>('Draft');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const enabledFields = useMemo(() => {
    const fields = new Set<string>();
    fieldsData?.forEach(f => fields.add(f.fieldKey));
    return fields;
  }, [fieldsData]);

  useEffect(() => {
    if (productData && !isDataLoaded) {
      setName(productData.name);
      setSlug(productData.slug);
      setSku(productData.sku);
      setPrice(productData.price.toString());
      setSalePrice(productData.salePrice?.toString() || '');
      setStock(productData.stock.toString());
      setCategoryId(productData.categoryId);
      setDescription(productData.description || '');
      setImage(productData.image);
      setStatus(productData.status);
      setIsDataLoaded(true);
    }
  }, [productData, isDataLoaded]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !categoryId || !price) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }
    if (enabledFields.has('sku') && !sku.trim()) {
      toast.error('Vui lòng nhập mã SKU');
      return;
    }

    setIsSubmitting(true);
    try {
      await updateProduct({
        id: id as Id<"products">,
        name: name.trim(),
        slug: slug.trim(),
        sku: sku.trim() || productData?.sku || `SKU-${Date.now()}`,
        price: parseInt(price) || 0,
        salePrice: salePrice ? parseInt(salePrice) : undefined,
        stock: parseInt(stock) || 0,
        categoryId: categoryId as Id<"productCategories">,
        description: description.trim() || undefined,
        image,
        status,
      });
      toast.success("Cập nhật sản phẩm thành công");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể cập nhật sản phẩm");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (productData === undefined || fieldsData === undefined) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-orange-500" />
      </div>
    );
  }

  if (productData === null) {
    return (
      <div className="text-center py-8 text-slate-500">
        Không tìm thấy sản phẩm
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Chỉnh sửa sản phẩm</h1>
          <Link href="/admin/products" className="text-sm text-orange-600 hover:underline">Quay lại danh sách</Link>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Thông tin cơ bản</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Tên sản phẩm <span className="text-red-500">*</span></Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Nhập tên sản phẩm..." autoFocus />
              </div>
              <div className={enabledFields.has('sku') ? "grid grid-cols-2 gap-4" : ""}>
                <div className="space-y-2">
                  <Label>Slug</Label>
                  <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="slug" className="font-mono text-sm" />
                </div>
                {enabledFields.has('sku') && (
                  <div className="space-y-2">
                    <Label>Mã SKU <span className="text-red-500">*</span></Label>
                    <Input value={sku} onChange={(e) => setSku(e.target.value)} required placeholder="VD: PROD-001" className="font-mono" />
                  </div>
                )}
              </div>
              {enabledFields.has('description') && (
                <div className="space-y-2">
                  <Label>Mô tả sản phẩm</Label>
                  {isDataLoaded && (
                    <LexicalEditor 
                      onChange={setDescription} 
                      initialContent={productData.description}
                      folder="products-content"
                    />
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Giá & Kho hàng</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className={enabledFields.has('salePrice') ? "grid grid-cols-2 gap-4" : ""}>
                <div className="space-y-2">
                  <Label>Giá bán (VNĐ) <span className="text-red-500">*</span></Label>
                  <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required placeholder="0" min="0" />
                </div>
                {enabledFields.has('salePrice') && (
                  <div className="space-y-2">
                    <Label>Giá khuyến mãi (VNĐ)</Label>
                    <Input type="number" value={salePrice} onChange={(e) => setSalePrice(e.target.value)} placeholder="Để trống nếu không KM" min="0" />
                  </div>
                )}
              </div>
              {enabledFields.has('stock') && (
                <div className="space-y-2">
                  <Label>Số lượng tồn kho</Label>
                  <Input type="number" value={stock} onChange={(e) => setStock(e.target.value)} placeholder="0" min="0" />
                </div>
              )}
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
                  onChange={(e) => setStatus(e.target.value as 'Draft' | 'Active' | 'Archived')}
                  className="w-full h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                >
                  <option value="Draft">Bản nháp</option>
                  <option value="Active">Đang bán</option>
                  <option value="Archived">Lưu trữ</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Danh mục <span className="text-red-500">*</span></Label>
                <select 
                  value={categoryId} 
                  onChange={(e) => setCategoryId(e.target.value)}
                  required
                  className="w-full h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                >
                  <option value="">-- Chọn danh mục --</option>
                  {categoriesData?.filter(cat => cat.active || cat._id === productData?.categoryId).map(cat => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}{!cat.active ? ' (Đã ẩn)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader><CardTitle className="text-base">Ảnh sản phẩm</CardTitle></CardHeader>
            <CardContent>
              <ImageUpload value={image} onChange={setImage} folder="products" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Thống kê</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Đã bán:</span>
                <span className="font-medium">{productData.sales.toLocaleString()}</span>
              </div>
              {enabledFields.has('stock') && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Tồn kho:</span>
                  <span className={`font-medium ${productData.stock < 10 ? 'text-red-500' : ''}`}>{productData.stock}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 lg:left-[280px] right-0 p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center z-10">
        <Button type="button" variant="ghost" onClick={() => router.push('/admin/products')}>Hủy bỏ</Button>
        <Button type="submit" variant="accent" disabled={isSubmitting}>
          {isSubmitting && <Loader2 size={16} className="animate-spin mr-2" />}
          Lưu thay đổi
        </Button>
      </div>
    </form>
  );
}
