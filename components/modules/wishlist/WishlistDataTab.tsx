 'use client';
 
 import React, { useMemo, useState } from 'react';
 import { useMutation, useQuery } from 'convex/react';
 import { api } from '@/convex/_generated/api';
 import { toast } from 'sonner';
 import { Database, Heart, Loader2, Package, RefreshCw, Trash2, User } from 'lucide-react';
 import { Button, Card, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/admin/components/ui';
 
 interface WishlistDataTabProps {
   colorClasses: { button: string };
 }
 
 export function WishlistDataTab({ colorClasses }: WishlistDataTabProps) {
   const [isSeeding, setIsSeeding] = useState(false);
   const [isClearing, setIsClearing] = useState(false);
 
   const wishlistData = useQuery(api.wishlist.listAll, { limit: 100 });
   const customersData = useQuery(api.customers.listAll, { limit: 100 });
   const productsData = useQuery(api.products.listAll, { limit: 100 });
 
   const seedWishlistModule = useMutation(api.seed.seedWishlistModule);
   const clearWishlistData = useMutation(api.seed.clearWishlistData);
 
   const customerMap = useMemo(() => {
     const map: Record<string, string> = {};
     customersData?.forEach(c => { map[c._id] = c.name; });
     return map;
   }, [customersData]);
 
   const productMap = useMemo(() => {
     const map: Record<string, { name: string; price: number }> = {};
     productsData?.forEach(p => { map[p._id] = { name: p.name, price: p.salePrice ?? p.price }; });
     return map;
   }, [productsData]);
 
   const stats = useMemo(() => {
     if (!wishlistData) return { total: 0, uniqueCustomers: 0, uniqueProducts: 0 };
     const customerIds = new Set(wishlistData.map(w => w.customerId));
     const productIds = new Set(wishlistData.map(w => w.productId));
     return {
       total: wishlistData.length,
       uniqueCustomers: customerIds.size,
       uniqueProducts: productIds.size,
     };
   }, [wishlistData]);
 
   const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN', { currency: 'VND', style: 'currency' }).format(price);
   const formatDate = (timestamp: number) => new Date(timestamp).toLocaleDateString('vi-VN');
 
   const handleSeedData = async () => {
     setIsSeeding(true);
     try {
       await seedWishlistModule();
       toast.success('Đã tạo dữ liệu mẫu!');
     } catch (error) {
       toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra');
     } finally {
       setIsSeeding(false);
     }
   };
 
   const handleClearData = async () => {
     if (!confirm('Xóa toàn bộ dữ liệu wishlist?')) return;
     setIsClearing(true);
     try {
       await clearWishlistData();
       toast.success('Đã xóa toàn bộ dữ liệu!');
     } catch (error) {
       toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra');
     } finally {
       setIsClearing(false);
     }
   };
 
   const handleResetData = async () => {
     if (!confirm('Reset toàn bộ dữ liệu về mặc định?')) return;
     setIsClearing(true);
     try {
       await clearWishlistData();
       await seedWishlistModule();
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
             <p className="text-sm text-slate-500 mt-1">Seed, clear hoặc reset dữ liệu cho module wishlist</p>
           </div>
           <div className="flex gap-2">
             <Button variant="outline" onClick={handleSeedData} disabled={isSeeding} className="gap-2">
               {isSeeding ? <Loader2 size={16} className="animate-spin" /> : <Database size={16} />}
               Seed Data
             </Button>
             <Button variant="outline" onClick={handleClearData} disabled={isClearing} className="gap-2 text-red-500 hover:text-red-600">
               {isClearing ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
               Clear All
             </Button>
             <Button onClick={handleResetData} disabled={isClearing || isSeeding} className={`gap-2 ${colorClasses.button} text-white`}>
               <RefreshCw size={16} />
               Reset
             </Button>
           </div>
         </div>
       </Card>
 
       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         <Card className="p-4">
           <div className="flex items-center gap-3">
             <div className="p-2 bg-rose-500/10 rounded-lg">
               <Heart className="w-5 h-5 text-rose-600" />
             </div>
             <div>
               <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.total}</p>
               <p className="text-sm text-slate-500">Tổng mục</p>
             </div>
           </div>
         </Card>
         <Card className="p-4">
           <div className="flex items-center gap-3">
             <div className="p-2 bg-blue-500/10 rounded-lg">
               <User className="w-5 h-5 text-blue-600" />
             </div>
             <div>
               <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.uniqueCustomers}</p>
               <p className="text-sm text-slate-500">Khách hàng</p>
             </div>
           </div>
         </Card>
         <Card className="p-4">
           <div className="flex items-center gap-3">
             <div className="p-2 bg-orange-500/10 rounded-lg">
               <Package className="w-5 h-5 text-orange-600" />
             </div>
             <div>
               <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.uniqueProducts}</p>
               <p className="text-sm text-slate-500">Sản phẩm được thích</p>
             </div>
           </div>
         </Card>
       </div>
 
       <Card>
         <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
           <Heart className="w-5 h-5 text-rose-500" />
           <h3 className="font-semibold text-slate-900 dark:text-slate-100">Wishlist ({wishlistData?.length ?? 0})</h3>
         </div>
         <Table>
           <TableHeader>
             <TableRow>
               <TableHead>Khách hàng</TableHead>
               <TableHead>Sản phẩm</TableHead>
               <TableHead className="text-right">Giá</TableHead>
               <TableHead>Ghi chú</TableHead>
               <TableHead>Ngày thêm</TableHead>
             </TableRow>
           </TableHeader>
           <TableBody>
             {wishlistData?.slice(0, 10).map(item => (
               <TableRow key={item._id}>
                 <TableCell className="font-medium">{customerMap[item.customerId] || 'N/A'}</TableCell>
                 <TableCell>{productMap[item.productId]?.name || 'N/A'}</TableCell>
                 <TableCell className="text-right">{productMap[item.productId] ? formatPrice(productMap[item.productId].price) : '-'}</TableCell>
                 <TableCell className="text-slate-500 text-sm max-w-[150px] truncate">{item.note ?? '-'}</TableCell>
                 <TableCell className="text-slate-500 text-sm">{formatDate(item._creationTime)}</TableCell>
               </TableRow>
             ))}
             {(!wishlistData || wishlistData.length === 0) && (
               <TableRow>
                 <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                   Chưa có dữ liệu wishlist. Nhấn &quot;Seed Data&quot; để tạo dữ liệu mẫu.
                 </TableCell>
               </TableRow>
             )}
           </TableBody>
         </Table>
         {wishlistData && wishlistData.length > 10 && (
           <div className="p-3 border-t border-slate-100 dark:border-slate-800 text-sm text-slate-500 text-center">
             Hiển thị 10 / {wishlistData.length} mục
           </div>
         )}
       </Card>
     </div>
   );
 }
