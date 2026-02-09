'use client';

import React, { use, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { ExternalLink, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from '../../../components/ui';
import { LexicalEditor } from '../../../components/LexicalEditor';
import { ImageUpload } from '../../../components/ImageUpload';
import type { ImageItem } from '../../../components/MultiImageUploader';
import { MultiImageUploader } from '../../../components/MultiImageUploader';
import { ModuleGuard } from '../../../components/ModuleGuard';
import { DigitalCredentialsForm } from '@/components/orders/DigitalCredentialsForm';
import { stripHtml, truncateText } from '@/lib/seo';

const MODULE_KEY = 'products';

export default function ProductEditPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <ModuleGuard moduleKey="products">
      <ProductEditContent params={params} />
    </ModuleGuard>
  );
}

function ProductEditContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const productData = useQuery(api.products.getById, { id: id as Id<"products"> });
  const categoriesData = useQuery(api.productCategories.listActive);
  const updateProduct = useMutation(api.products.update);
  const fieldsData = useQuery(api.admin.modules.listEnabledModuleFields, { moduleKey: MODULE_KEY });
  const settingsData = useQuery(api.admin.modules.listModuleSettings, { moduleKey: MODULE_KEY });
  const optionsData = useQuery(api.productOptions.listActive);

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [sku, setSku] = useState('');
  const [price, setPrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [stock, setStock] = useState('0');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [image, setImage] = useState<string | undefined>();
  const [galleryItems, setGalleryItems] = useState<ImageItem[]>([]);
  const [status, setStatus] = useState<'Draft' | 'Active' | 'Archived'>('Draft');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [hasVariants, setHasVariants] = useState(false);
  const [selectedOptionIds, setSelectedOptionIds] = useState<Id<'productOptions'>[]>([]);
  const [productType, setProductType] = useState<'physical' | 'digital'>('physical');
  const [digitalDeliveryType, setDigitalDeliveryType] = useState<'account' | 'license' | 'download' | 'custom'>('account');
  const [digitalCredentialsTemplate, setDigitalCredentialsTemplate] = useState<{
    username?: string;
    password?: string;
    licenseKey?: string;
    downloadUrl?: string;
    customContent?: string;
    expiresAt?: number;
  }>({});

  const enabledFields = useMemo(() => {
    const fields = new Set<string>();
    fieldsData?.forEach(f => fields.add(f.fieldKey));
    return fields;
  }, [fieldsData]);

  const variantEnabled = useMemo(() => {
    const setting = settingsData?.find(s => s.settingKey === 'variantEnabled');
    return Boolean(setting?.value);
  }, [settingsData]);

  const digitalEnabled = useMemo(() => {
    const setting = settingsData?.find(s => s.settingKey === 'enableDigitalProducts');
    return Boolean(setting?.value);
  }, [settingsData]);

  useEffect(() => {
    if (productData && !isDataLoaded) {
      setName(productData.name);
      setSlug(productData.slug);
      setSku(productData.sku);
      setPrice(productData.price.toString());
      setSalePrice(productData.salePrice?.toString() ?? '');
      setStock(productData.stock.toString());
      setCategoryId(productData.categoryId);
      setDescription(productData.description ?? '');
      setMetaTitle(productData.metaTitle ?? '');
      setMetaDescription(productData.metaDescription ?? '');
      setImage(productData.image);
      setGalleryItems((productData.images ?? []).map((url, index) => ({ id: `${productData._id}-img-${index}`, url })));
      setStatus(productData.status);
      setHasVariants(productData.hasVariants ?? false);
      setSelectedOptionIds(productData.optionIds ?? []);
      setProductType(productData.productType ?? 'physical');
      setDigitalDeliveryType(productData.digitalDeliveryType ?? 'account');
      setDigitalCredentialsTemplate(productData.digitalCredentialsTemplate ?? {});
      setIsDataLoaded(true);
    }
  }, [productData, isDataLoaded]);

  useEffect(() => {
    if (!hasVariants) {
      setSelectedOptionIds([]);
    }
  }, [hasVariants]);

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
    if (variantEnabled && hasVariants && selectedOptionIds.length === 0) {
      toast.error('Vui lòng chọn ít nhất một tùy chọn cho phiên bản');
      return;
    }

    setIsSubmitting(true);
    try {
      const resolvedStock = productType === 'digital' ? 0 : (parseInt(stock) || 0);
      const resolvedMetaTitle = truncateText(name.trim(), 60);
      const resolvedMetaDescription = truncateText(stripHtml(description || ''), 160);
      const resolvedImages = galleryItems.map(item => item.url).filter(Boolean);
      await updateProduct({
        categoryId: categoryId as Id<"productCategories">,
        description: description.trim() || undefined,
        id: id as Id<"products">,
        hasVariants: variantEnabled ? hasVariants : undefined,
        image,
        images: enabledFields.has('images') ? resolvedImages : undefined,
        metaDescription: enabledFields.has('metaDescription')
          ? (metaDescription.trim() || resolvedMetaDescription || undefined)
          : undefined,
        metaTitle: enabledFields.has('metaTitle')
          ? (metaTitle.trim() || resolvedMetaTitle || undefined)
          : undefined,
        name: name.trim(),
        optionIds: variantEnabled ? (hasVariants ? selectedOptionIds : []) : undefined,
        price: parseInt(price) || 0,
        salePrice: salePrice ? parseInt(salePrice) : undefined,
        sku: (sku.trim() || productData?.sku) ?? `SKU-${Date.now()}`,
        slug: slug.trim(),
        status,
        stock: resolvedStock,
        productType: digitalEnabled ? productType : undefined,
        digitalDeliveryType: digitalEnabled && productType === 'digital' ? digitalDeliveryType : undefined,
        digitalCredentialsTemplate: digitalEnabled && productType === 'digital' && Object.keys(digitalCredentialsTemplate).length > 0
          ? digitalCredentialsTemplate
          : undefined,
      });
      toast.success("Cập nhật sản phẩm thành công");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể cập nhật sản phẩm");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (productData === undefined || fieldsData === undefined || settingsData === undefined) {
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
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => window.open(`/products/${slug}`, '_blank')}
            className="gap-2"
          >
            <ExternalLink size={16} />
            Xem trên web
          </Button>
          {variantEnabled && hasVariants && (
            <Link href={`/admin/products/${id}/variants`}>
              <Button variant="outline">Quản lý phiên bản</Button>
            </Link>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Thông tin cơ bản</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Tên sản phẩm <span className="text-red-500">*</span></Label>
                <Input value={name} onChange={(e) => {
                  const val = e.target.value;
                  setName(val);
                  const generatedSlug = val.toLowerCase()
                    .normalize("NFD").replaceAll(/[\u0300-\u036F]/g, "")
                    .replaceAll(/[đĐ]/g, "d")
                    .replaceAll(/[^a-z0-9\s]/g, '')
                    .replaceAll(/\s+/g, '-');
                  setSlug(generatedSlug);
                }} required placeholder="Nhập tên sản phẩm..." autoFocus />
              </div>
              <div className={enabledFields.has('sku') ? "grid grid-cols-2 gap-4" : ""}>
                <div className="space-y-2">
                  <Label>Slug</Label>
                  <Input value={slug} onChange={(e) =>{  setSlug(e.target.value); }} placeholder="slug" className="font-mono text-sm" />
                </div>
                {enabledFields.has('sku') && (
                  <div className="space-y-2">
                    <Label>Mã SKU <span className="text-red-500">*</span></Label>
                    <Input value={sku} onChange={(e) =>{  setSku(e.target.value); }} required placeholder="VD: PROD-001" className="font-mono" />
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
                    {metaTitle.trim() || name || 'Tên sản phẩm'}
                  </div>
                  <div className="text-emerald-600 text-xs">
                    /products/{slug || 'san-pham'}
                  </div>
                  <div className="text-slate-600 text-xs mt-1 line-clamp-2">
                    {metaDescription.trim() || stripHtml(description || '') || 'Mô tả ngắn sẽ hiển thị tại đây.'}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader><CardTitle className="text-base">Giá & Kho hàng</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className={enabledFields.has('salePrice') ? "grid grid-cols-2 gap-4" : ""}>
                <div className="space-y-2">
                  <Label>Giá bán (VNĐ) <span className="text-red-500">*</span></Label>
                  <Input type="number" value={price} onChange={(e) =>{  setPrice(e.target.value); }} required placeholder="0" min="0" />
                </div>
                {enabledFields.has('salePrice') && (
                  <div className="space-y-2">
                    <Label>Giá khuyến mãi (VNĐ)</Label>
                    <Input type="number" value={salePrice} onChange={(e) =>{  setSalePrice(e.target.value); }} placeholder="Để trống nếu không KM" min="0" />
                  </div>
                )}
              </div>
              {enabledFields.has('stock') && productType !== 'digital' && (
                <div className="space-y-2">
                  <Label>Số lượng tồn kho</Label>
                  <Input type="number" value={stock} onChange={(e) =>{  setStock(e.target.value); }} placeholder="0" min="0" />
                </div>
              )}
            </CardContent>
          </Card>

          {digitalEnabled && (
            <Card>
              <CardHeader><CardTitle className="text-base">Loại sản phẩm</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="productType"
                      checked={productType === 'physical'}
                      onChange={() => setProductType('physical')}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Vật lý (cần giao hàng)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="productType"
                      checked={productType === 'digital'}
                      onChange={() => setProductType('digital')}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Digital (giao qua mạng)</span>
                  </label>
                </div>

                {productType === 'digital' && (
                  <>
                    <div className="space-y-2">
                      <Label>Loại giao hàng Digital</Label>
                      <select
                        value={digitalDeliveryType}
                        onChange={(e) => setDigitalDeliveryType(e.target.value as 'account' | 'license' | 'download' | 'custom')}
                        className="w-full h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                      >
                        <option value="account">Tài khoản (username/password)</option>
                        <option value="license">License Key</option>
                        <option value="download">File Download</option>
                        <option value="custom">Tùy chỉnh</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label>Template Credentials (tùy chọn)</Label>
                      <p className="text-xs text-slate-500">Nhập sẵn thông tin sẽ tự động giao khi xác nhận thanh toán</p>
                      <DigitalCredentialsForm
                        type={digitalDeliveryType}
                        value={digitalCredentialsTemplate}
                        onChange={setDigitalCredentialsTemplate}
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {variantEnabled && (
            <Card>
              <CardHeader><CardTitle className="text-base">Phiên bản sản phẩm</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="has-variants"
                    checked={hasVariants}
                    onChange={(e) =>{  setHasVariants(e.target.checked); }}
                    className="w-4 h-4 rounded border-slate-300"
                  />
                  <Label htmlFor="has-variants" className="cursor-pointer">Sản phẩm có nhiều phiên bản</Label>
                </div>
                {hasVariants && (
                  <div className="space-y-2">
                    <Label>Chọn tùy chọn cho phiên bản</Label>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {optionsData?.map(option => (
                        <label key={option._id} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                          <input
                            type="checkbox"
                            checked={selectedOptionIds.includes(option._id)}
                            onChange={() =>{
                              setSelectedOptionIds(prev => prev.includes(option._id)
                                ? prev.filter(item => item !== option._id)
                                : [...prev, option._id]);
                            }}
                            className="w-4 h-4 rounded border-slate-300"
                          />
                          <span>{option.name}</span>
                        </label>
                      ))}
                    </div>
                    {optionsData?.length === 0 && (
                      <p className="text-xs text-slate-500">Chưa có tùy chọn nào. Hãy tạo option trước.</p>
                    )}
                  </div>
                )}
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
                  onChange={(e) =>{  setStatus(e.target.value as 'Draft' | 'Active' | 'Archived'); }}
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
                  onChange={(e) =>{  setCategoryId(e.target.value); }}
                  required
                  className="w-full h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                >
                  <option value="">-- Chọn danh mục --</option>
                  {categoriesData?.map(cat => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
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

          {enabledFields.has('images') && (
            <Card>
              <CardHeader><CardTitle className="text-base">Thư viện ảnh</CardTitle></CardHeader>
              <CardContent>
                <MultiImageUploader<ImageItem>
                  items={galleryItems}
                  onChange={setGalleryItems}
                  folder="products"
                  imageKey="url"
                  minItems={0}
                  maxItems={20}
                  aspectRatio="square"
                  columns={2}
                  addButtonText="Thêm ảnh"
                  emptyText="Chưa có ảnh trong thư viện"
                  layout="vertical"
                />
              </CardContent>
            </Card>
          )}

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
        <Button type="button" variant="ghost" onClick={() =>{  router.push('/admin/products'); }}>Hủy bỏ</Button>
        <Button type="submit" variant="accent" disabled={isSubmitting}>
          {isSubmitting && <Loader2 size={16} className="animate-spin mr-2" />}
          Lưu thay đổi
        </Button>
      </div>
    </form>
  );
}
