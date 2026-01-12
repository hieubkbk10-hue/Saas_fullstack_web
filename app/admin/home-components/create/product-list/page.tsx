'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, Input, Label } from '../../../components/ui';
import { ComponentFormWrapper, useComponentForm, useBrandColor } from '../shared';
import { ProductListPreview, ServiceListPreview, BlogPreview, type BlogStyle, type ProductListStyle, type ServiceListStyle } from '../../previews';

function ProductListCreateContent() {
  const searchParams = useSearchParams();
  const type = (searchParams.get('type') as 'ProductList' | 'ServiceList' | 'Blog') || 'ProductList';
  
  const titles: Record<string, string> = {
    ProductList: 'Danh sách Sản phẩm',
    ServiceList: 'Danh sách Dịch vụ',
    Blog: 'Tin tức / Blog'
  };
  
  const { title, setTitle, active, setActive, handleSubmit, isSubmitting } = useComponentForm(titles[type], type);
  const brandColor = useBrandColor();
  
  const [itemCount, setItemCount] = useState(8);
  const [sortBy, setSortBy] = useState('newest');
  const [blogStyle, setBlogStyle] = useState<BlogStyle>('grid');
  const [productStyle, setProductStyle] = useState<ProductListStyle>('commerce');
  const [serviceStyle, setServiceStyle] = useState<ServiceListStyle>('grid');

  const onSubmit = (e: React.FormEvent) => {
    const style = type === 'Blog' ? blogStyle : type === 'ServiceList' ? serviceStyle : productStyle;
    handleSubmit(e, { itemCount, sortBy, style });
  };

  return (
    <ComponentFormWrapper
      type={type}
      title={title}
      setTitle={setTitle}
      active={active}
      setActive={setActive}
      onSubmit={onSubmit}
      isSubmitting={isSubmitting}
    >
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Nguồn dữ liệu</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Số lượng hiển thị</Label>
              <Input 
                type="number" 
                value={itemCount} 
                onChange={(e) => setItemCount(parseInt(e.target.value) || 8)} 
              />
            </div>
            <div className="space-y-2">
              <Label>Sắp xếp theo</Label>
              <select 
                className="w-full h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">Mới nhất</option>
                <option value="bestseller">Bán chạy nhất</option>
                <option value="random">Ngẫu nhiên</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {type === 'Blog' ? (
        <BlogPreview brandColor={brandColor} postCount={itemCount} selectedStyle={blogStyle} onStyleChange={setBlogStyle} />
      ) : type === 'ServiceList' ? (
        <ServiceListPreview brandColor={brandColor} itemCount={itemCount} selectedStyle={serviceStyle} onStyleChange={setServiceStyle} />
      ) : (
        <ProductListPreview brandColor={brandColor} itemCount={itemCount} componentType="ProductList" selectedStyle={productStyle} onStyleChange={setProductStyle} />
      )}
    </ComponentFormWrapper>
  );
}

export default function ProductListCreatePage() {
  return (
    <Suspense fallback={<div className="p-4">Loading...</div>}>
      <ProductListCreateContent />
    </Suspense>
  );
}
