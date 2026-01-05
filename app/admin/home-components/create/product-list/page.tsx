'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, Input, Label } from '../../../components/ui';
import { ComponentFormWrapper, useComponentForm, BRAND_COLOR } from '../shared';
import { ProductListPreview, BlogPreview } from '../../previews';

function ProductListCreateContent() {
  const searchParams = useSearchParams();
  const type = (searchParams.get('type') as 'ProductList' | 'ServiceList' | 'Blog') || 'ProductList';
  
  const titles: Record<string, string> = {
    ProductList: 'Danh sách Sản phẩm',
    ServiceList: 'Danh sách Dịch vụ',
    Blog: 'Tin tức / Blog'
  };
  
  const { title, setTitle, active, setActive, handleSubmit } = useComponentForm(titles[type]);
  
  const [itemCount, setItemCount] = useState(8);

  return (
    <ComponentFormWrapper
      type={type}
      title={title}
      setTitle={setTitle}
      active={active}
      setActive={setActive}
      onSubmit={handleSubmit}
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
              <select className="w-full h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm">
                <option>Mới nhất</option>
                <option>Bán chạy nhất</option>
                <option>Ngẫu nhiên</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {type === 'Blog' ? (
        <BlogPreview brandColor={BRAND_COLOR} postCount={itemCount} />
      ) : (
        <ProductListPreview brandColor={BRAND_COLOR} itemCount={itemCount} componentType={type as 'ProductList' | 'ServiceList'} />
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
