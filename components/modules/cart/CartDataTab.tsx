 'use client';
 
 import React, { useMemo, useState } from 'react';
 import { useMutation, useQuery } from 'convex/react';
 import { api } from '@/convex/_generated/api';
import { toast } from 'sonner';
import { AlertTriangle, CheckCircle, Database, Loader2, RefreshCw, ShoppingCart, Trash2 } from 'lucide-react';
import { Badge, Button, Card, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/admin/components/ui';
import { getSeedModuleInfo } from '@/lib/modules/seed-registry';
 
 interface CartDataTabProps {
   colorClasses: { button: string };
 }
 
export function CartDataTab({ colorClasses }: CartDataTabProps) {
  const [isSeeding, setIsSeeding] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

   const cartsData = useQuery(api.cart.listAll, { limit: 100 });
   const cartItemsData = useQuery(api.cart.listAllItems, { limit: 100 });
   const statsData = useQuery(api.cart.getStats);
   const customersData = useQuery(api.customers.listAll, { limit: 100 });

  const seedModule = useMutation(api.seedManager.seedModule);
  const clearModule = useMutation(api.seedManager.clearModule);
  const defaultQuantity = getSeedModuleInfo('cart')?.defaultQuantity ?? 10;
 
   const customerMap = useMemo(() => {
     const map: Record<string, string> = {};
     customersData?.forEach(c => { map[c._id] = c.name; });
     return map;
   }, [customersData]);
 
   const stats = useMemo(() => ({
     total: statsData?.total ?? cartsData?.length ?? 0,
     active: statsData?.active ?? cartsData?.filter(c => c.status === 'Active').length ?? 0,
     abandoned: statsData?.abandoned ?? cartsData?.filter(c => c.status === 'Abandoned').length ?? 0,
     converted: statsData?.converted ?? cartsData?.filter(c => c.status === 'Converted').length ?? 0,
     totalValue: statsData?.totalValue ?? cartsData?.filter(c => c.status === 'Active').reduce((sum, c) => sum + c.totalAmount, 0) ?? 0,
     totalItems: cartItemsData?.length ?? 0,
   }), [statsData, cartsData, cartItemsData]);

  const handleSeedAll = async () => {
    setIsSeeding(true);
    try {
      await seedModule({ module: 'cart', quantity: defaultQuantity });
      toast.success('Đã tạo dữ liệu mẫu!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra');
    } finally {
      setIsSeeding(false);
    }
  };

  const handleClearData = async () => {
    if (!confirm('Xóa toàn bộ giỏ hàng?')) return;
    setIsClearing(true);
    try {
      await clearModule({ module: 'cart' });
      toast.success('Đã xóa toàn bộ giỏ hàng!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra');
    } finally {
      setIsClearing(false);
    }
  };

  const handleResetAll = async () => {
    if (!confirm('Reset dữ liệu về mặc định?')) return;
    setIsClearing(true);
    try {
      await clearModule({ module: 'cart' });
      await seedModule({ module: 'cart', quantity: defaultQuantity, force: true });
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
             <p className="text-sm text-slate-500 mt-1">Seed, clear hoặc reset dữ liệu giỏ hàng</p>
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

       <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
         <Card className="p-4"><p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.total}</p><p className="text-sm text-slate-500">Tổng giỏ hàng</p></Card>
         <Card className="p-4"><div className="flex items-center gap-2"><ShoppingCart size={16} className="text-emerald-500" /><p className="text-2xl font-bold text-emerald-600">{stats.active}</p></div><p className="text-sm text-slate-500">Đang hoạt động</p></Card>
         <Card className="p-4"><div className="flex items-center gap-2"><AlertTriangle size={16} className="text-amber-500" /><p className="text-2xl font-bold text-amber-600">{stats.abandoned}</p></div><p className="text-sm text-slate-500">Bỏ dở</p></Card>
         <Card className="p-4"><div className="flex items-center gap-2"><CheckCircle size={16} className="text-blue-500" /><p className="text-2xl font-bold text-blue-600">{stats.converted}</p></div><p className="text-sm text-slate-500">Đã đặt hàng</p></Card>
         <Card className="p-4"><p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.totalItems}</p><p className="text-sm text-slate-500">Tổng items</p></Card>
         <Card className="p-4"><p className="text-lg font-bold text-emerald-600">{stats.totalValue.toLocaleString('vi-VN')}đ</p><p className="text-sm text-slate-500">Giá trị active</p></Card>
       </div>
 
       <Card>
         <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
           <ShoppingCart className="w-5 h-5 text-emerald-500" />
           <h3 className="font-semibold text-slate-900 dark:text-slate-100">Giỏ hàng ({stats.total})</h3>
         </div>
         <Table>
           <TableHeader>
             <TableRow>
               <TableHead>Khách hàng / Session</TableHead>
               <TableHead className="text-center">Số SP</TableHead>
               <TableHead className="text-right">Tổng tiền</TableHead>
               <TableHead>Trạng thái</TableHead>
               <TableHead>Hết hạn</TableHead>
             </TableRow>
           </TableHeader>
           <TableBody>
             {cartsData?.slice(0, 15).map(cart => (
               <TableRow key={cart._id}>
                 <TableCell className="font-medium">
                   {cart.customerId ? customerMap[cart.customerId] || 'Khách hàng' : <span className="text-slate-400">Guest: {cart.sessionId?.slice(0, 15)}...</span>}
                 </TableCell>
                 <TableCell className="text-center">{cart.itemsCount}</TableCell>
                 <TableCell className="text-right font-medium">{cart.totalAmount.toLocaleString('vi-VN')}đ</TableCell>
                 <TableCell>
                   <Badge variant={cart.status === 'Active' ? 'default' : (cart.status === 'Converted' ? 'secondary' : 'destructive')}>
                     {cart.status === 'Active' ? 'Hoạt động' : (cart.status === 'Converted' ? 'Đã đặt' : 'Bỏ dở')}
                   </Badge>
                 </TableCell>
                 <TableCell className="text-sm text-slate-500">{cart.expiresAt ? new Date(cart.expiresAt).toLocaleDateString('vi-VN') : '-'}</TableCell>
               </TableRow>
             ))}
             {(!cartsData || cartsData.length === 0) && (
               <TableRow><TableCell colSpan={5} className="text-center py-8 text-slate-500">Chưa có giỏ hàng nào.</TableCell></TableRow>
             )}
           </TableBody>
         </Table>
         {cartsData && cartsData.length > 15 && (
           <div className="p-3 border-t border-slate-100 dark:border-slate-800 text-sm text-slate-500 text-center">Hiển thị 15 / {cartsData.length} giỏ hàng</div>
         )}
       </Card>
     </div>
   );
 }
