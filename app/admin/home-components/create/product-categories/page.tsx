'use client';

import React, { useState } from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Card, CardContent, CardHeader, CardTitle, Input, Label, Button } from '../../../components/ui';
import { ComponentFormWrapper, useComponentForm, useBrandColor } from '../shared';
import { ProductCategoriesPreview, type ProductCategoriesStyle } from '../../previews';

interface CategoryItem {
  id: number;
  categoryId: string;
  customImage?: string;
}

export default function ProductCategoriesCreatePage() {
  const { title, setTitle, active, setActive, handleSubmit, isSubmitting } = useComponentForm('Danh mục sản phẩm', 'ProductCategories');
  const brandColor = useBrandColor();
  
  const categoriesData = useQuery(api.productCategories.listActive);
  
  const [selectedCategories, setSelectedCategories] = useState<CategoryItem[]>([]);
  const [style, setStyle] = useState<ProductCategoriesStyle>('grid');
  const [showProductCount, setShowProductCount] = useState(true);
  const [columnsDesktop, setColumnsDesktop] = useState(4);
  const [columnsMobile, setColumnsMobile] = useState(2);

  const addCategory = () => {
    if (!categoriesData || categoriesData.length === 0) return;
    const newId = Math.max(0, ...selectedCategories.map(c => c.id)) + 1;
    setSelectedCategories([...selectedCategories, { id: newId, categoryId: '' }]);
  };

  const removeCategory = (id: number) => {
    setSelectedCategories(selectedCategories.filter(c => c.id !== id));
  };

  const updateCategory = (id: number, field: keyof CategoryItem, value: string) => {
    setSelectedCategories(selectedCategories.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const onSubmit = (e: React.FormEvent) => {
    handleSubmit(e, {
      categories: selectedCategories.map(c => ({ 
        categoryId: c.categoryId, 
        customImage: c.customImage 
      })),
      style,
      showProductCount,
      columnsDesktop,
      columnsMobile,
    });
  };

  const availableCategories = categoriesData || [];

  return (
    <ComponentFormWrapper
      type="ProductCategories"
      title={title}
      setTitle={setTitle}
      active={active}
      setActive={setActive}
      onSubmit={onSubmit}
      isSubmitting={isSubmitting}
    >
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Cấu hình hiển thị</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Số cột (Desktop)</Label>
              <select
                value={columnsDesktop}
                onChange={(e) => setColumnsDesktop(parseInt(e.target.value))}
                className="w-full h-9 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm"
              >
                <option value={3}>3 cột</option>
                <option value={4}>4 cột</option>
                <option value={5}>5 cột</option>
                <option value={6}>6 cột</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Số cột (Mobile)</Label>
              <select
                value={columnsMobile}
                onChange={(e) => setColumnsMobile(parseInt(e.target.value))}
                className="w-full h-9 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm"
              >
                <option value={2}>2 cột</option>
                <option value={3}>3 cột</option>
              </select>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="showProductCount"
              checked={showProductCount}
              onChange={(e) => setShowProductCount(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300"
            />
            <Label htmlFor="showProductCount" className="cursor-pointer">Hiển thị số lượng sản phẩm</Label>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Chọn danh mục ({selectedCategories.length})</CardTitle>
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={addCategory}
            disabled={selectedCategories.length >= 12 || availableCategories.length === 0}
            className="gap-2"
          >
            <Plus size={14} /> Thêm
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {availableCategories.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-4">
              Chưa có danh mục sản phẩm. Vui lòng tạo danh mục trước.
            </p>
          ) : selectedCategories.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-4">
              Chưa chọn danh mục nào. Nhấn &quot;Thêm&quot; để bắt đầu.
            </p>
          ) : (
            selectedCategories.map((item, idx) => (
              <div key={item.id} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GripVertical size={16} className="text-slate-400 cursor-move" />
                    <Label>Danh mục {idx + 1}</Label>
                  </div>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    className="text-red-500 h-8 w-8" 
                    onClick={() => removeCategory(item.id)}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-xs text-slate-500">Danh mục</Label>
                    <select
                      value={item.categoryId}
                      onChange={(e) => updateCategory(item.id, 'categoryId', e.target.value)}
                      className="w-full h-9 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm"
                    >
                      <option value="">-- Chọn danh mục --</option>
                      {availableCategories.map(cat => (
                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-slate-500">Ảnh tùy chỉnh (URL)</Label>
                    <Input 
                      value={item.customImage || ''} 
                      onChange={(e) => updateCategory(item.id, 'customImage', e.target.value)}
                      placeholder="Để trống sử dụng ảnh danh mục"
                    />
                  </div>
                </div>
              </div>
            ))
          )}
          
          <p className="text-xs text-slate-500">
            Tối đa 12 danh mục. Để trống ảnh tùy chỉnh sẽ sử dụng ảnh từ danh mục gốc.
          </p>
        </CardContent>
      </Card>

      <ProductCategoriesPreview 
        config={{
          categories: selectedCategories,
          style,
          showProductCount,
          columnsDesktop,
          columnsMobile,
        }}
        brandColor={brandColor}
        selectedStyle={style}
        onStyleChange={setStyle}
        categoriesData={availableCategories}
      />
    </ComponentFormWrapper>
  );
}
