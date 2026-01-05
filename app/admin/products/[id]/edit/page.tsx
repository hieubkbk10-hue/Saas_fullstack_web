'use client';

import React, { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn, Button, Card, CardContent, Input, Label } from '../../../components/ui';
import { mockCategories, mockProducts } from '../../../mockData';

export default function ProductEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const currentProduct = mockProducts.find(p => p.id === id);
  const [activeTab, setActiveTab] = useState('general');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Đã cập nhật sản phẩm");
    router.push('/admin/products');
  }

  if (!currentProduct) {
    return <div className="text-center py-8 text-slate-500">Không tìm thấy sản phẩm</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Chỉnh sửa sản phẩm</h1>
          <div className="text-sm text-slate-500 mt-1">Cập nhật thông tin: {currentProduct.name}</div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-16 z-10 flex gap-6 px-4">
            {['general', 'pricing', 'images'].map(tab => (
              <button 
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "py-3 text-sm font-medium border-b-2 transition-colors capitalize",
                  activeTab === tab ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-800"
                )}
              >
                {tab === 'general' ? 'Thông tin chung' : tab === 'pricing' ? 'Giá & Kho' : 'Hình ảnh'}
              </button>
            ))}
          </div>

          <div className="space-y-6">
            {activeTab === 'general' && (
              <Card>
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-2">
                    <Label>Tên sản phẩm</Label>
                    <Input defaultValue={currentProduct.name} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Mã SKU</Label>
                    <Input defaultValue={currentProduct.sku} placeholder="VD: SKU-12345" />
                  </div>
                  <div className="space-y-2">
                    <Label>Mô tả chi tiết</Label>
                    <textarea 
                      className="w-full min-h-[200px] rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      defaultValue={currentProduct.description}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'pricing' && (
              <Card>
                <CardContent className="p-6 space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Giá bán (VNĐ)</Label>
                      <Input type="number" defaultValue={currentProduct.price} required />
                    </div>
                    <div className="space-y-2">
                      <Label>Giá khuyến mãi (VNĐ)</Label>
                      <Input type="number" defaultValue={currentProduct.salePrice} placeholder="Nhập 0 nếu không giảm" />
                    </div>
                    <div className="space-y-2">
                      <Label>Số lượng tồn kho</Label>
                      <Input type="number" defaultValue={currentProduct.stock} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'images' && (
              <Card>
                <CardContent className="p-6">
                  <div className="grid grid-cols-4 gap-4 mb-4">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="aspect-square bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center relative group">
                        {i === 1 && currentProduct.image ? (
                          <>
                            <img src={currentProduct.image} alt="" className="w-full h-full object-cover rounded-lg" />
                            <Button variant="destructive" size="icon" className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={12} /></Button>
                          </>
                        ) : (
                          <Upload className="text-slate-400" />
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <Upload size={24} className="text-slate-400 mb-2"/>
                    <span className="text-sm text-slate-500">Kéo thả hoặc click để tải thêm ảnh</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label>Trạng thái</Label>
                <select className="w-full h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm" defaultValue={currentProduct.status}>
                  <option value="Draft">Bản nháp</option>
                  <option value="Active">Đang bán</option>
                  <option value="Archived">Lưu trữ</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Danh mục</Label>
                <select className="w-full h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm" defaultValue={currentProduct.category}>
                  {mockCategories.map(cat => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 lg:left-[280px] right-0 p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center z-10">
        <Button type="button" variant="ghost" onClick={() => router.push('/admin/products')}>Hủy bỏ</Button>
        <div className="flex gap-2">
          <Button type="button" variant="secondary">Lưu nháp</Button>
          <Button type="submit" variant="accent">Cập nhật</Button>
        </div>
      </div>
    </form>
  )
}
