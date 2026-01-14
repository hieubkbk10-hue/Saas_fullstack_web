'use client';

import React, { useState, Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Package, Briefcase, FileText, Search, GripVertical, X, Check } from 'lucide-react';
import { cn, Card, CardContent, CardHeader, CardTitle, Input, Label, Button } from '../../../components/ui';
import { ComponentFormWrapper, useComponentForm, useBrandColor } from '../shared';
import { ProductListPreview, ServiceListPreview, BlogPreview, type BlogStyle, type ProductListStyle, type ServiceListStyle, type ServiceListPreviewItem } from '../../previews';

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
  
  // Config text fields
  const [subTitle, setSubTitle] = useState('Bộ sưu tập');
  const [sectionTitle, setSectionTitle] = useState('Sản phẩm nổi bật');
  
  // Selection mode states
  const [selectionMode, setSelectionMode] = useState<'auto' | 'manual'>('auto');
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [selectedPostIds, setSelectedPostIds] = useState<string[]>([]);
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [serviceSearchTerm, setServiceSearchTerm] = useState('');
  const [postSearchTerm, setPostSearchTerm] = useState('');
  
  // Query data based on type
  const productsData = useQuery(
    api.products.listAll, 
    type === 'ProductList' ? { limit: 100 } : 'skip'
  );
  const servicesData = useQuery(
    api.services.listAll, 
    type === 'ServiceList' ? { limit: 100 } : 'skip'
  );
  const postsData = useQuery(
    api.posts.listAll, 
    type === 'Blog' ? { limit: 100 } : 'skip'
  );

  // Filter and get selected items
  const filteredProducts = useMemo(() => {
    if (!productsData) return [];
    return productsData
      .filter(product => product.status === 'Active')
      .filter(product => 
        !productSearchTerm || 
        product.name.toLowerCase().includes(productSearchTerm.toLowerCase())
      );
  }, [productsData, productSearchTerm]);

  const selectedProducts = useMemo(() => {
    if (!productsData || selectedProductIds.length === 0) return [];
    const productMap = new Map(productsData.map(p => [p._id, p]));
    return selectedProductIds
      .map(id => productMap.get(id as Id<"products">))
      .filter((p): p is NonNullable<typeof p> => p !== undefined);
  }, [productsData, selectedProductIds]);

  const filteredServices = useMemo(() => {
    if (!servicesData) return [];
    return servicesData
      .filter(service => service.status === 'Published')
      .filter(service => 
        !serviceSearchTerm || 
        service.title.toLowerCase().includes(serviceSearchTerm.toLowerCase())
      );
  }, [servicesData, serviceSearchTerm]);

  const selectedServices = useMemo(() => {
    if (!servicesData || selectedServiceIds.length === 0) return [];
    const serviceMap = new Map(servicesData.map(s => [s._id, s]));
    return selectedServiceIds
      .map(id => serviceMap.get(id as Id<"services">))
      .filter((s): s is NonNullable<typeof s> => s !== undefined);
  }, [servicesData, selectedServiceIds]);

  // Convert selectedServices to preview format (manual mode)
  const servicePreviewItems: ServiceListPreviewItem[] = useMemo(() => {
    return selectedServices.map((s, idx) => ({
      id: s._id,
      name: s.title,
      image: s.thumbnail,
      price: s.price?.toString(),
      description: s.excerpt,
      tag: idx === 0 ? 'hot' as const : idx === 1 ? 'new' as const : undefined
    }));
  }, [selectedServices]);

  // Convert servicesData to preview format (auto mode)
  const autoServicePreviewItems: ServiceListPreviewItem[] = useMemo(() => {
    if (!servicesData) return [];
    return servicesData
      .filter(s => s.status === 'Published')
      .slice(0, itemCount)
      .map((s, idx) => ({
        id: s._id,
        name: s.title,
        image: s.thumbnail,
        price: s.price?.toString(),
        description: s.excerpt,
        tag: idx === 0 ? 'hot' as const : idx === 1 ? 'new' as const : undefined
      }));
  }, [servicesData, itemCount]);

  const filteredPosts = useMemo(() => {
    if (!postsData) return [];
    return postsData
      .filter(post => post.status === 'Published')
      .filter(post => 
        !postSearchTerm || 
        post.title.toLowerCase().includes(postSearchTerm.toLowerCase())
      );
  }, [postsData, postSearchTerm]);

  const selectedPosts = useMemo(() => {
    if (!postsData || selectedPostIds.length === 0) return [];
    const postMap = new Map(postsData.map(p => [p._id, p]));
    return selectedPostIds
      .map(id => postMap.get(id as Id<"posts">))
      .filter((p): p is NonNullable<typeof p> => p !== undefined);
  }, [postsData, selectedPostIds]);

  const onSubmit = (e: React.FormEvent) => {
    const style = type === 'Blog' ? blogStyle : type === 'ServiceList' ? serviceStyle : productStyle;
    const config: Record<string, unknown> = { itemCount, sortBy, style, selectionMode };
    
    // Chỉ thêm subTitle/sectionTitle cho ProductList
    if (type === 'ProductList') {
      config.subTitle = subTitle;
      config.sectionTitle = sectionTitle;
    }
    
    if (selectionMode === 'manual') {
      if (type === 'ProductList') config.selectedProductIds = selectedProductIds;
      else if (type === 'ServiceList') config.selectedServiceIds = selectedServiceIds;
      else if (type === 'Blog') config.selectedPostIds = selectedPostIds;
    }
    
    handleSubmit(e, config);
  };

  const getSelectionModeLabel = () => {
    if (type === 'ProductList') return 'sản phẩm';
    if (type === 'ServiceList') return 'dịch vụ';
    return 'bài viết';
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
      {/* Config hiển thị - chỉ hiện cho ProductList */}
      {type === 'ProductList' && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">Cấu hình hiển thị</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tiêu đề phụ (badge)</Label>
                <Input 
                  value={subTitle} 
                  onChange={(e) => setSubTitle(e.target.value)} 
                  placeholder="VD: Bộ sưu tập, Sản phẩm hot..."
                />
              </div>
              <div className="space-y-2">
                <Label>Tiêu đề chính</Label>
                <Input 
                  value={sectionTitle} 
                  onChange={(e) => setSectionTitle(e.target.value)} 
                  placeholder="VD: Sản phẩm nổi bật, Bán chạy nhất..."
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Nguồn dữ liệu</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Selection Mode Toggle */}
          <div className="space-y-2">
            <Label>Chế độ chọn {getSelectionModeLabel()}</Label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSelectionMode('auto')}
                className={cn(
                  "flex-1 py-2.5 px-4 rounded-lg border text-sm font-medium transition-all",
                  selectionMode === 'auto'
                    ? "border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400"
                    : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                )}
              >
                Tự động
              </button>
              <button
                type="button"
                onClick={() => setSelectionMode('manual')}
                className={cn(
                  "flex-1 py-2.5 px-4 rounded-lg border text-sm font-medium transition-all",
                  selectionMode === 'manual'
                    ? "border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400"
                    : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                )}
              >
                Chọn thủ công
              </button>
            </div>
            <p className="text-xs text-slate-500">
              {selectionMode === 'auto' 
                ? `Hiển thị ${getSelectionModeLabel()} tự động theo số lượng và sắp xếp` 
                : `Chọn từng ${getSelectionModeLabel()} cụ thể để hiển thị`}
            </p>
          </div>

          {/* Auto mode settings */}
          {selectionMode === 'auto' && (
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
                  {type === 'ProductList' && <option value="bestseller">Bán chạy nhất</option>}
                  {type === 'ServiceList' && <option value="popular">Xem nhiều nhất</option>}
                  {type === 'Blog' && <option value="popular">Xem nhiều nhất</option>}
                  <option value="random">Ngẫu nhiên</option>
                </select>
              </div>
            </div>
          )}

          {/* Manual mode - ProductList */}
          {selectionMode === 'manual' && type === 'ProductList' && (
            <div className="space-y-4">
              {selectedProducts.length > 0 && (
                <div className="space-y-2">
                  <Label>Sản phẩm đã chọn ({selectedProducts.length})</Label>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {selectedProducts.map((product, index) => (
                      <div 
                        key={product._id} 
                        className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg group"
                      >
                        <div className="text-slate-400 cursor-move"><GripVertical size={16} /></div>
                        <span className="w-6 h-6 flex items-center justify-center bg-blue-500 text-white text-xs rounded-full font-medium">{index + 1}</span>
                        {product.image ? (
                          <img src={product.image} alt="" className="w-12 h-12 object-cover rounded" />
                        ) : (
                          <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded flex items-center justify-center"><Package size={16} className="text-slate-400" /></div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{product.name}</p>
                          <p className="text-xs text-slate-500">{product.price?.toLocaleString('vi-VN')}đ</p>
                        </div>
                        <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-500" onClick={() => setSelectedProductIds(ids => ids.filter(id => id !== product._id))}><X size={16} /></Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <Label>Thêm sản phẩm</Label>
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input placeholder="Tìm kiếm sản phẩm..." className="pl-9" value={productSearchTerm} onChange={(e) => setProductSearchTerm(e.target.value)} />
                </div>
                <div className="border border-slate-200 dark:border-slate-700 rounded-lg max-h-[250px] overflow-y-auto">
                  {filteredProducts.length === 0 ? (
                    <div className="p-4 text-center text-sm text-slate-500">{productsData === undefined ? 'Đang tải...' : 'Không tìm thấy sản phẩm'}</div>
                  ) : (
                    filteredProducts.map(product => {
                      const isSelected = selectedProductIds.includes(product._id);
                      return (
                        <div 
                          key={product._id}
                          onClick={() => isSelected ? setSelectedProductIds(ids => ids.filter(id => id !== product._id)) : setSelectedProductIds(ids => [...ids, product._id])}
                          className={cn("flex items-center gap-3 p-3 cursor-pointer border-b border-slate-100 dark:border-slate-800 last:border-0 transition-colors", isSelected ? "bg-blue-50 dark:bg-blue-500/10" : "hover:bg-slate-50 dark:hover:bg-slate-800")}
                        >
                          <div className={cn("w-5 h-5 rounded border-2 flex items-center justify-center transition-colors", isSelected ? "border-blue-500 bg-blue-500" : "border-slate-300 dark:border-slate-600")}>{isSelected && <Check size={12} className="text-white" />}</div>
                          {product.image ? <img src={product.image} alt="" className="w-10 h-10 object-cover rounded" /> : <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded flex items-center justify-center"><Package size={14} className="text-slate-400" /></div>}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{product.name}</p>
                            <p className="text-xs text-slate-500">{product.price?.toLocaleString('vi-VN')}đ</p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Manual mode - ServiceList */}
          {selectionMode === 'manual' && type === 'ServiceList' && (
            <div className="space-y-4">
              {selectedServices.length > 0 && (
                <div className="space-y-2">
                  <Label>Dịch vụ đã chọn ({selectedServices.length})</Label>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {selectedServices.map((service, index) => (
                      <div 
                        key={service._id} 
                        className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg group"
                      >
                        <div className="text-slate-400 cursor-move"><GripVertical size={16} /></div>
                        <span className="w-6 h-6 flex items-center justify-center bg-blue-500 text-white text-xs rounded-full font-medium">{index + 1}</span>
                        {service.thumbnail ? (
                          <img src={service.thumbnail} alt="" className="w-12 h-12 object-cover rounded" />
                        ) : (
                          <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded flex items-center justify-center"><Briefcase size={16} className="text-slate-400" /></div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{service.title}</p>
                          <p className="text-xs text-slate-500">{service.views} lượt xem</p>
                        </div>
                        <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-500" onClick={() => setSelectedServiceIds(ids => ids.filter(id => id !== service._id))}><X size={16} /></Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <Label>Thêm dịch vụ</Label>
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input placeholder="Tìm kiếm dịch vụ..." className="pl-9" value={serviceSearchTerm} onChange={(e) => setServiceSearchTerm(e.target.value)} />
                </div>
                <div className="border border-slate-200 dark:border-slate-700 rounded-lg max-h-[250px] overflow-y-auto">
                  {filteredServices.length === 0 ? (
                    <div className="p-4 text-center text-sm text-slate-500">{servicesData === undefined ? 'Đang tải...' : 'Không tìm thấy dịch vụ'}</div>
                  ) : (
                    filteredServices.map(service => {
                      const isSelected = selectedServiceIds.includes(service._id);
                      return (
                        <div 
                          key={service._id}
                          onClick={() => isSelected ? setSelectedServiceIds(ids => ids.filter(id => id !== service._id)) : setSelectedServiceIds(ids => [...ids, service._id])}
                          className={cn("flex items-center gap-3 p-3 cursor-pointer border-b border-slate-100 dark:border-slate-800 last:border-0 transition-colors", isSelected ? "bg-blue-50 dark:bg-blue-500/10" : "hover:bg-slate-50 dark:hover:bg-slate-800")}
                        >
                          <div className={cn("w-5 h-5 rounded border-2 flex items-center justify-center transition-colors", isSelected ? "border-blue-500 bg-blue-500" : "border-slate-300 dark:border-slate-600")}>{isSelected && <Check size={12} className="text-white" />}</div>
                          {service.thumbnail ? <img src={service.thumbnail} alt="" className="w-10 h-10 object-cover rounded" /> : <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded flex items-center justify-center"><Briefcase size={14} className="text-slate-400" /></div>}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{service.title}</p>
                            <p className="text-xs text-slate-500">{service.views} lượt xem</p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Manual mode - Blog */}
          {selectionMode === 'manual' && type === 'Blog' && (
            <div className="space-y-4">
              {selectedPosts.length > 0 && (
                <div className="space-y-2">
                  <Label>Bài viết đã chọn ({selectedPosts.length})</Label>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {selectedPosts.map((post, index) => (
                      <div 
                        key={post._id} 
                        className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg group"
                      >
                        <div className="text-slate-400 cursor-move"><GripVertical size={16} /></div>
                        <span className="w-6 h-6 flex items-center justify-center bg-blue-500 text-white text-xs rounded-full font-medium">{index + 1}</span>
                        {post.thumbnail ? (
                          <img src={post.thumbnail} alt="" className="w-12 h-12 object-cover rounded" />
                        ) : (
                          <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded flex items-center justify-center"><FileText size={16} className="text-slate-400" /></div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{post.title}</p>
                          <p className="text-xs text-slate-500">{post.views} lượt xem</p>
                        </div>
                        <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-500" onClick={() => setSelectedPostIds(ids => ids.filter(id => id !== post._id))}><X size={16} /></Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <Label>Thêm bài viết</Label>
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input placeholder="Tìm kiếm bài viết..." className="pl-9" value={postSearchTerm} onChange={(e) => setPostSearchTerm(e.target.value)} />
                </div>
                <div className="border border-slate-200 dark:border-slate-700 rounded-lg max-h-[250px] overflow-y-auto">
                  {filteredPosts.length === 0 ? (
                    <div className="p-4 text-center text-sm text-slate-500">{postsData === undefined ? 'Đang tải...' : 'Không tìm thấy bài viết'}</div>
                  ) : (
                    filteredPosts.map(post => {
                      const isSelected = selectedPostIds.includes(post._id);
                      return (
                        <div 
                          key={post._id}
                          onClick={() => isSelected ? setSelectedPostIds(ids => ids.filter(id => id !== post._id)) : setSelectedPostIds(ids => [...ids, post._id])}
                          className={cn("flex items-center gap-3 p-3 cursor-pointer border-b border-slate-100 dark:border-slate-800 last:border-0 transition-colors", isSelected ? "bg-blue-50 dark:bg-blue-500/10" : "hover:bg-slate-50 dark:hover:bg-slate-800")}
                        >
                          <div className={cn("w-5 h-5 rounded border-2 flex items-center justify-center transition-colors", isSelected ? "border-blue-500 bg-blue-500" : "border-slate-300 dark:border-slate-600")}>{isSelected && <Check size={12} className="text-white" />}</div>
                          {post.thumbnail ? <img src={post.thumbnail} alt="" className="w-10 h-10 object-cover rounded" /> : <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded flex items-center justify-center"><FileText size={14} className="text-slate-400" /></div>}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{post.title}</p>
                            <p className="text-xs text-slate-500">{post.views} lượt xem</p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {type === 'Blog' ? (
        <BlogPreview brandColor={brandColor} postCount={selectionMode === 'manual' ? selectedPostIds.length : itemCount} selectedStyle={blogStyle} onStyleChange={setBlogStyle} />
      ) : type === 'ServiceList' ? (
        <ServiceListPreview 
          brandColor={brandColor} 
          itemCount={selectionMode === 'manual' ? selectedServiceIds.length : itemCount} 
          selectedStyle={serviceStyle} 
          onStyleChange={setServiceStyle} 
          items={selectionMode === 'manual' && servicePreviewItems.length > 0 
            ? servicePreviewItems 
            : autoServicePreviewItems.length > 0 
              ? autoServicePreviewItems 
              : undefined
          }
          title={title}
        />
      ) : (
        <ProductListPreview brandColor={brandColor} itemCount={selectionMode === 'manual' ? selectedProductIds.length : itemCount} componentType="ProductList" selectedStyle={productStyle} onStyleChange={setProductStyle} subTitle={subTitle} sectionTitle={sectionTitle} />
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
