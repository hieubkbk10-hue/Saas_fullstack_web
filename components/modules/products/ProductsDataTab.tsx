 'use client';
 
 import React, { useState } from 'react';
 import { useMutation, usePaginatedQuery, useQuery } from 'convex/react';
 import { api } from '@/convex/_generated/api';
 import { toast } from 'sonner';
 import { Database, FolderTree, Loader2, MessageSquare, Package, RefreshCw, Trash2 } from 'lucide-react';
 import { Badge, Button, Card, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/admin/components/ui';
import { getSeedModuleInfo } from '@/lib/modules/seed-registry';
 
 interface ProductsDataTabProps {
   colorClasses: { button: string };
 }
 
 export function ProductsDataTab({ colorClasses }: ProductsDataTabProps) {
   const [isSeeding, setIsSeeding] = useState(false);
   const [isClearing, setIsClearing] = useState(false);
 
   const productStats = useQuery(api.products.getStats);
   const categoryStats = useQuery(api.productCategories.listActive);
   
   const { results: productsData, status: productsStatus, loadMore: loadMoreProducts } = usePaginatedQuery(
     api.products.list,
     {},
     { initialNumItems: 10 }
   );
   const { results: reviewsData, status: reviewsStatus, loadMore: loadMoreReviews } = usePaginatedQuery(
     api.comments.listByTargetTypePaginated,
     { targetType: "product" },
     { initialNumItems: 10 }
   );
 
  const seedModule = useMutation(api.seedManager.seedModule);
  const clearModule = useMutation(api.seedManager.clearModule);
   const initStats = useMutation(api.products.initStats);

  const defaultQuantity = getSeedModuleInfo('products')?.defaultQuantity ?? 10;
  const commentQuantity = getSeedModuleInfo('comments')?.defaultQuantity ?? 10;
 
   const categoryMap: Record<string, string> = {};
   categoryStats?.forEach(cat => { categoryMap[cat._id] = cat.name; });
 
   const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN', { currency: 'VND', style: 'currency' }).format(price);
 
   const handleSeedAll = async () => {
     setIsSeeding(true);
     try {
      await Promise.all([
        seedModule({ module: 'products', quantity: defaultQuantity }),
        seedModule({ module: 'comments', quantity: commentQuantity }),
        initStats(),
      ]);
       toast.success('Đã tạo dữ liệu mẫu!');
     } catch (error) {
       toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra');
     } finally {
       setIsSeeding(false);
     }
   };
 
   const handleClearData = async () => {
     if (!confirm('Xóa toàn bộ dữ liệu sản phẩm, danh mục và đánh giá?')) return;
     setIsClearing(true);
     try {
      await Promise.all([
        clearModule({ module: 'comments' }),
        clearModule({ module: 'products' }),
        initStats(),
      ]);
       toast.success('Đã xóa toàn bộ dữ liệu!');
     } catch (error) {
       toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra');
     } finally {
       setIsClearing(false);
     }
   };
 
   const handleResetAll = async () => {
     if (!confirm('Reset toàn bộ dữ liệu về mặc định?')) return;
     setIsClearing(true);
     try {
      await clearModule({ module: 'comments' });
      await clearModule({ module: 'products' });
      await seedModule({ module: 'products', quantity: defaultQuantity, force: true });
      await seedModule({ module: 'comments', quantity: commentQuantity, force: true });
       await initStats();
       toast.success('Đã reset dữ liệu!');
     } catch (error) {
       toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra');
     } finally {
       setIsClearing(false);
     }
   };
 
   return (
     <div className="space-y-6">
       <Card className="p-4">
         <div className="flex items-center justify-between">
           <div>
             <h3 className="font-semibold text-slate-900 dark:text-slate-100">Quản lý dữ liệu mẫu</h3>
             <p className="text-sm text-slate-500 mt-1">Seed, clear hoặc reset dữ liệu cho module sản phẩm</p>
           </div>
           <div className="flex gap-2">
             <Button variant="outline" onClick={handleSeedAll} disabled={isSeeding} className="gap-2">
               {isSeeding ? <Loader2 size={16} className="animate-spin" /> : <Database size={16} />}
               Seed Data
             </Button>
             <Button variant="outline" onClick={handleClearData} disabled={isClearing} className="gap-2 text-red-500 hover:text-red-600">
               {isClearing ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
               Clear All
             </Button>
             <Button onClick={handleResetAll} disabled={isClearing || isSeeding} className={`gap-2 ${colorClasses.button} text-white`}>
               <RefreshCw size={16} />
               Reset
             </Button>
           </div>
         </div>
       </Card>
 
       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         <Card className="p-4">
           <div className="flex items-center gap-3">
             <div className="p-2 bg-orange-500/10 rounded-lg">
               <Package className="w-5 h-5 text-orange-600" />
             </div>
             <div>
               <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{productStats?.total ?? 0}</p>
               <p className="text-sm text-slate-500">Sản phẩm</p>
             </div>
           </div>
         </Card>
         <Card className="p-4">
           <div className="flex items-center gap-3">
             <div className="p-2 bg-amber-500/10 rounded-lg">
               <FolderTree className="w-5 h-5 text-amber-600" />
             </div>
             <div>
               <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{categoryStats?.length ?? 0}</p>
               <p className="text-sm text-slate-500">Danh mục</p>
             </div>
           </div>
         </Card>
         <Card className="p-4">
           <div className="flex items-center gap-3">
             <div className="p-2 bg-blue-500/10 rounded-lg">
               <MessageSquare className="w-5 h-5 text-blue-600" />
             </div>
             <div>
               <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{reviewsData?.length ?? 0}+</p>
               <p className="text-sm text-slate-500">Đánh giá</p>
             </div>
           </div>
         </Card>
       </div>
 
       <Card>
         <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
           <Package className="w-5 h-5 text-orange-500" />
           <h3 className="font-semibold text-slate-900 dark:text-slate-100">Sản phẩm ({productStats?.total ?? 0})</h3>
         </div>
         <Table>
           <TableHeader>
             <TableRow>
               <TableHead>Tên sản phẩm</TableHead>
               <TableHead>SKU</TableHead>
               <TableHead>Danh mục</TableHead>
               <TableHead className="text-right">Giá</TableHead>
               <TableHead className="text-center">Tồn kho</TableHead>
               <TableHead>Trạng thái</TableHead>
             </TableRow>
           </TableHeader>
           <TableBody>
             {productsData?.map(product => (
               <TableRow key={product._id}>
                 <TableCell className="font-medium max-w-[200px] truncate">{product.name}</TableCell>
                 <TableCell className="font-mono text-xs text-slate-500">{product.sku}</TableCell>
                 <TableCell><Badge variant="secondary">{categoryMap[product.categoryId] || 'N/A'}</Badge></TableCell>
                 <TableCell className="text-right">
                   {product.salePrice ? (
                     <span className="text-red-500">{formatPrice(product.salePrice)}</span>
                   ) : (
                     formatPrice(product.price)
                   )}
                 </TableCell>
                 <TableCell className={`text-center ${product.stock < 10 ? 'text-red-500 font-medium' : ''}`}>{product.stock}</TableCell>
                 <TableCell>
                   <Badge variant={product.status === 'Active' ? 'success' : (product.status === 'Draft' ? 'secondary' : 'warning')}>
                     {product.status === 'Active' ? 'Đang bán' : (product.status === 'Draft' ? 'Nháp' : 'Lưu trữ')}
                   </Badge>
                 </TableCell>
               </TableRow>
             ))}
             {(!productsData || productsData.length === 0) && (
               <TableRow>
                 <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                   Chưa có sản phẩm nào. Nhấn &quot;Seed Data&quot; để tạo dữ liệu mẫu.
                 </TableCell>
               </TableRow>
             )}
           </TableBody>
         </Table>
         {productsStatus === 'CanLoadMore' && (
           <div className="p-3 border-t border-slate-100 dark:border-slate-800 text-center">
             <Button variant="ghost" size="sm" onClick={() => loadMoreProducts(10)}>
               Tải thêm sản phẩm
             </Button>
           </div>
         )}
       </Card>
 
       <Card>
         <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
           <FolderTree className="w-5 h-5 text-amber-500" />
           <h3 className="font-semibold text-slate-900 dark:text-slate-100">Danh mục ({categoryStats?.length ?? 0})</h3>
         </div>
         <Table>
           <TableHeader>
             <TableRow>
               <TableHead>Tên danh mục</TableHead>
               <TableHead>Slug</TableHead>
               <TableHead>Trạng thái</TableHead>
             </TableRow>
           </TableHeader>
           <TableBody>
             {categoryStats?.map(cat => (
               <TableRow key={cat._id}>
                 <TableCell className="font-medium">{cat.name}</TableCell>
                 <TableCell className="text-slate-500 font-mono text-sm">{cat.slug}</TableCell>
                 <TableCell>
                   <Badge variant={cat.active ? 'success' : 'secondary'}>{cat.active ? 'Hoạt động' : 'Ẩn'}</Badge>
                 </TableCell>
               </TableRow>
             ))}
             {(!categoryStats || categoryStats.length === 0) && (
               <TableRow>
                 <TableCell colSpan={3} className="text-center py-8 text-slate-500">
                   Chưa có danh mục nào.
                 </TableCell>
               </TableRow>
             )}
           </TableBody>
         </Table>
       </Card>
 
       <Card>
         <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
           <MessageSquare className="w-5 h-5 text-blue-500" />
           <h3 className="font-semibold text-slate-900 dark:text-slate-100">Đánh giá sản phẩm</h3>
         </div>
         <Table>
           <TableHeader>
             <TableRow>
               <TableHead>Người đánh giá</TableHead>
               <TableHead>Nội dung</TableHead>
               <TableHead>Trạng thái</TableHead>
             </TableRow>
           </TableHeader>
           <TableBody>
             {reviewsData?.map(review => (
               <TableRow key={review._id}>
                 <TableCell className="font-medium">{review.authorName}</TableCell>
                 <TableCell className="text-slate-600 dark:text-slate-400 max-w-xs truncate">{review.content}</TableCell>
                 <TableCell>
                   <Badge variant={review.status === 'Approved' ? 'success' : (review.status === 'Pending' ? 'secondary' : 'destructive')}>
                     {review.status === 'Approved' ? 'Đã duyệt' : (review.status === 'Pending' ? 'Chờ duyệt' : 'Spam')}
                   </Badge>
                 </TableCell>
               </TableRow>
             ))}
             {(!reviewsData || reviewsData.length === 0) && (
               <TableRow>
                 <TableCell colSpan={3} className="text-center py-8 text-slate-500">
                   Chưa có đánh giá nào.
                 </TableCell>
               </TableRow>
             )}
           </TableBody>
         </Table>
         {reviewsStatus === 'CanLoadMore' && (
           <div className="p-3 border-t border-slate-100 dark:border-slate-800 text-center">
             <Button variant="ghost" size="sm" onClick={() => loadMoreReviews(10)}>
               Tải thêm đánh giá
             </Button>
           </div>
         )}
       </Card>
     </div>
   );
 }
