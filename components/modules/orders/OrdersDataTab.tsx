 'use client';
 
 import React, { useState, useMemo } from 'react';
 import { useMutation, useQuery } from 'convex/react';
 import { api } from '@/convex/_generated/api';
 import type { Doc } from '@/convex/_generated/dataModel';
 import { toast } from 'sonner';
 import { CreditCard, Database, Loader2, RefreshCw, ShoppingBag, Trash2, Truck, Users } from 'lucide-react';
 import { Badge, Button, Card, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/admin/components/ui';
 
 interface OrdersDataTabProps {
   colorClasses: { button: string };
 }
 
 const STATUS_LABELS: Record<string, string> = {
   Cancelled: 'Đã hủy',
   Delivered: 'Hoàn thành',
   Pending: 'Chờ xử lý',
   Processing: 'Đang xử lý',
   Shipped: 'Đang giao',
 };
 
 const PAYMENT_STATUS_LABELS: Record<string, string> = {
   Failed: 'Thất bại',
   Paid: 'Đã TT',
   Pending: 'Chờ TT',
   Refunded: 'Hoàn tiền',
 };
 
 function formatCurrency(amount: number): string {
   return new Intl.NumberFormat('vi-VN', { currency: 'VND', style: 'currency' }).format(amount);
 }
 
 export function OrdersDataTab({ colorClasses }: OrdersDataTabProps) {
   const [isSeeding, setIsSeeding] = useState(false);
   const [isClearing, setIsClearing] = useState(false);
 
   const orderStats = useQuery(api.orders.getStats, { limit: 100 });
   const ordersData = useQuery(api.orders.listAll, { limit: 10 });
   const customersCount = useQuery(api.customers.count, {});
   const customersForTable = useQuery(api.customers.listAll, { limit: 50 });
 
   const seedOrdersModule = useMutation(api.seed.seedOrdersModule);
   const clearOrdersData = useMutation(api.seed.clearOrdersData);
 
   const customerMap = useMemo(() => {
     const map = new Map<string, Doc<'customers'>>();
     customersForTable?.forEach(c => map.set(c._id, c));
     return map;
   }, [customersForTable]);
 
   const handleSeedAll = async () => {
     setIsSeeding(true);
     try {
       await seedOrdersModule();
       toast.success('Đã tạo dữ liệu mẫu!');
     } catch (error) {
       toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra');
     } finally {
       setIsSeeding(false);
     }
   };
 
   const handleClearData = async () => {
     if (!confirm('Xóa toàn bộ đơn hàng?')) return;
     setIsClearing(true);
     try {
       await clearOrdersData();
       toast.success('Đã xóa toàn bộ đơn hàng!');
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
       await clearOrdersData();
       await seedOrdersModule();
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
             <p className="text-sm text-slate-500 mt-1">Seed, clear hoặc reset dữ liệu đơn hàng</p>
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
 
       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         <Card className="p-4">
           <div className="flex items-center gap-3">
             <div className="p-2 bg-emerald-500/10 rounded-lg">
               <ShoppingBag className="w-5 h-5 text-emerald-600" />
             </div>
             <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{orderStats?.total ?? 0}</p>
               <p className="text-sm text-slate-500">Tổng đơn</p>
             </div>
           </div>
         </Card>
         <Card className="p-4">
           <div className="flex items-center gap-3">
             <div className="p-2 bg-amber-500/10 rounded-lg">
               <CreditCard className="w-5 h-5 text-amber-600" />
             </div>
             <div>
               <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{formatCurrency(orderStats?.totalRevenue ?? 0)}</p>
               <p className="text-sm text-slate-500">Doanh thu</p>
             </div>
           </div>
         </Card>
         <Card className="p-4">
           <div className="flex items-center gap-3">
             <div className="p-2 bg-blue-500/10 rounded-lg">
               <Truck className="w-5 h-5 text-blue-600" />
             </div>
             <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{orderStats?.pending ?? 0}</p>
               <p className="text-sm text-slate-500">Chờ xử lý</p>
             </div>
           </div>
         </Card>
         <Card className="p-4">
           <div className="flex items-center gap-3">
             <div className="p-2 bg-violet-500/10 rounded-lg">
               <Users className="w-5 h-5 text-violet-600" />
             </div>
             <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{customersCount?.count ?? 0}</p>
               <p className="text-sm text-slate-500">Khách hàng</p>
             </div>
           </div>
         </Card>
       </div>
 
       <Card>
         <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
           <ShoppingBag className="w-5 h-5 text-emerald-500" />
           <h3 className="font-semibold text-slate-900 dark:text-slate-100">Đơn hàng gần đây</h3>
         </div>
         <Table>
           <TableHeader>
             <TableRow>
               <TableHead>Mã đơn</TableHead>
               <TableHead>Khách hàng</TableHead>
               <TableHead>Tổng tiền</TableHead>
               <TableHead>Trạng thái</TableHead>
               <TableHead>Thanh toán</TableHead>
             </TableRow>
           </TableHeader>
           <TableBody>
             {ordersData?.map(order => {
               const customer = customerMap.get(order.customerId);
               return (
                 <TableRow key={order._id}>
                   <TableCell className="font-mono text-sm">{order.orderNumber}</TableCell>
                   <TableCell>{customer?.name ?? 'N/A'}</TableCell>
                   <TableCell className="font-medium">{formatCurrency(order.totalAmount)}</TableCell>
                   <TableCell>
                     <Badge variant="secondary">{STATUS_LABELS[order.status] ?? order.status}</Badge>
                   </TableCell>
                   <TableCell>
                     <Badge 
                       variant={order.paymentStatus === 'Paid' ? 'default' : 'secondary'}
                       className={order.paymentStatus === 'Paid' ? 'bg-emerald-500' : ''}
                     >
                       {PAYMENT_STATUS_LABELS[order.paymentStatus ?? 'Pending'] ?? order.paymentStatus}
                     </Badge>
                   </TableCell>
                 </TableRow>
               );
             })}
             {(!ordersData || ordersData.length === 0) && (
               <TableRow>
                 <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                   Chưa có đơn hàng nào. Nhấn &quot;Seed Data&quot; để tạo dữ liệu mẫu.
                 </TableCell>
               </TableRow>
             )}
           </TableBody>
         </Table>
       </Card>
     </div>
   );
 }
