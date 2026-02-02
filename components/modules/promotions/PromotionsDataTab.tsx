 'use client';
 
 import React from 'react';
 import { useQuery } from 'convex/react';
 import { api } from '@/convex/_generated/api';
 import { CheckCircle, Clock, DollarSign, Percent, Ticket, Users } from 'lucide-react';
 import { Badge, Card, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/admin/components/ui';
 
 interface PromotionsDataTabProps {
   colorClasses: { button: string };
 }
 
 function formatCurrency(amount: number): string {
   return new Intl.NumberFormat('vi-VN', { currency: 'VND', style: 'currency' }).format(amount);
 }
 
 function formatDate(timestamp: number | undefined): string {
   if (!timestamp) return '-';
   return new Date(timestamp).toLocaleDateString('vi-VN');
 }
 
export function PromotionsDataTab({ colorClasses: _colorClasses }: PromotionsDataTabProps) {
  void _colorClasses;
   const promotionsData = useQuery(api.promotions.listAll);
   const statsData = useQuery(api.promotions.getStats);
 
   const getStatusBadge = (status: string) => {
     switch (status) {
       case 'Active': return <Badge variant="success">Hoạt động</Badge>;
       case 'Inactive': return <Badge variant="secondary">Tạm dừng</Badge>;
       case 'Expired': return <Badge variant="destructive">Hết hạn</Badge>;
       case 'Scheduled': return <Badge variant="warning">Chờ kích hoạt</Badge>;
       default: return <Badge variant="outline">{status}</Badge>;
     }
   };
 
   return (
     <div className="space-y-6">
       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         <Card className="p-4">
           <div className="flex items-center gap-3">
             <div className="p-2 bg-rose-500/10 rounded-lg"><Ticket className="w-5 h-5 text-rose-600" /></div>
             <div><p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{statsData?.totalCount ?? 0}</p><p className="text-sm text-slate-500">Tổng voucher</p></div>
           </div>
         </Card>
         <Card className="p-4">
           <div className="flex items-center gap-3">
             <div className="p-2 bg-emerald-500/10 rounded-lg"><CheckCircle className="w-5 h-5 text-emerald-600" /></div>
             <div><p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{statsData?.activeCount ?? 0}</p><p className="text-sm text-slate-500">Đang hoạt động</p></div>
           </div>
         </Card>
         <Card className="p-4">
           <div className="flex items-center gap-3">
             <div className="p-2 bg-amber-500/10 rounded-lg"><Clock className="w-5 h-5 text-amber-600" /></div>
             <div><p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{statsData?.scheduledCount ?? 0}</p><p className="text-sm text-slate-500">Chờ kích hoạt</p></div>
           </div>
         </Card>
         <Card className="p-4">
           <div className="flex items-center gap-3">
             <div className="p-2 bg-blue-500/10 rounded-lg"><Users className="w-5 h-5 text-blue-600" /></div>
             <div><p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{statsData?.totalUsed ?? 0}</p><p className="text-sm text-slate-500">Lượt sử dụng</p></div>
           </div>
         </Card>
       </div>
 
       <div className="grid grid-cols-2 gap-4">
         <Card className="p-4">
           <div className="flex items-center gap-3">
             <div className="p-2 bg-purple-500/10 rounded-lg"><Percent className="w-5 h-5 text-purple-600" /></div>
             <div><p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{statsData?.percentTypeCount ?? 0}</p><p className="text-sm text-slate-500">Giảm theo %</p></div>
           </div>
         </Card>
         <Card className="p-4">
           <div className="flex items-center gap-3">
             <div className="p-2 bg-cyan-500/10 rounded-lg"><DollarSign className="w-5 h-5 text-cyan-600" /></div>
             <div><p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{statsData?.fixedTypeCount ?? 0}</p><p className="text-sm text-slate-500">Giảm cố định</p></div>
           </div>
         </Card>
       </div>
 
       <Card>
         <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
           <Ticket className="w-5 h-5 text-rose-500" />
           <h3 className="font-semibold text-slate-900 dark:text-slate-100">Khuyến mãi ({promotionsData?.length ?? 0})</h3>
         </div>
         <Table>
           <TableHeader>
             <TableRow>
               <TableHead>Tên / Mã</TableHead>
               <TableHead>Giảm giá</TableHead>
               <TableHead>Thời gian</TableHead>
               <TableHead>Trạng thái</TableHead>
               <TableHead className="text-right">Đã dùng</TableHead>
             </TableRow>
           </TableHeader>
           <TableBody>
             {promotionsData?.map(promo => (
               <TableRow key={promo._id}>
                 <TableCell>
                   <div>
                     <p className="font-medium">{promo.name}</p>
                     <code className="text-xs text-rose-600 bg-rose-50 dark:bg-rose-900/20 px-1.5 py-0.5 rounded">{promo.code}</code>
                   </div>
                 </TableCell>
                 <TableCell>
                   {promo.discountType === 'percent' ? (
                     <Badge variant="secondary" className="bg-purple-500/10 text-purple-600">-{promo.discountValue}%</Badge>
                   ) : (
                     <Badge variant="secondary" className="bg-cyan-500/10 text-cyan-600">-{formatCurrency(promo.discountValue)}</Badge>
                   )}
                 </TableCell>
                 <TableCell className="text-sm text-slate-500">{formatDate(promo.startDate)} - {formatDate(promo.endDate)}</TableCell>
                 <TableCell>{getStatusBadge(promo.status)}</TableCell>
                 <TableCell className="text-right">
                   {promo.usageLimit ? <span>{promo.usedCount}/{promo.usageLimit}</span> : <span>{promo.usedCount}</span>}
                 </TableCell>
               </TableRow>
             ))}
             {(!promotionsData || promotionsData.length === 0) && (
               <TableRow><TableCell colSpan={5} className="text-center py-8 text-slate-500">Chưa có khuyến mãi nào.</TableCell></TableRow>
             )}
           </TableBody>
         </Table>
       </Card>
     </div>
   );
 }
