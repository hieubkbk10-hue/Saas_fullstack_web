 'use client';
 
 import React, { useState } from 'react';
 import { useMutation, useQuery } from 'convex/react';
 import { api } from '@/convex/_generated/api';
 import { toast } from 'sonner';
 import { Database, DollarSign, Loader2, MapPin, RefreshCw, ShoppingBag, Trash2, UserCheck, Users } from 'lucide-react';
 import { Badge, Button, Card, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/admin/components/ui';
import { getSeedModuleInfo } from '@/lib/modules/seed-registry';
 
 interface CustomersDataTabProps {
   colorClasses: { button: string };
 }
 
 function formatCurrency(amount: number): string {
   return new Intl.NumberFormat('vi-VN', { currency: 'VND', style: 'currency' }).format(amount);
 }
 
 export function CustomersDataTab({ colorClasses }: CustomersDataTabProps) {
   const [isSeeding, setIsSeeding] = useState(false);
   const [isClearing, setIsClearing] = useState(false);
 
   const customersData = useQuery(api.customers.listAll, { limit: 100 });
   const statsData = useQuery(api.customers.getStats, {});
   const citiesData = useQuery(api.customers.getCities, {});
 
  const seedModule = useMutation(api.seedManager.seedModule);
  const clearModule = useMutation(api.seedManager.clearModule);

  const defaultQuantity = getSeedModuleInfo('customers')?.defaultQuantity ?? 10;
 
   const handleSeedAll = async () => {
     setIsSeeding(true);
     try {
      await seedModule({ module: 'customers', quantity: defaultQuantity });
       toast.success('Đã tạo dữ liệu mẫu!');
     } catch (error) {
       toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra');
     } finally {
       setIsSeeding(false);
     }
   };
 
   const handleClearData = async () => {
     if (!confirm('Xóa toàn bộ khách hàng?')) return;
     setIsClearing(true);
     try {
      await clearModule({ module: 'customers' });
       toast.success('Đã xóa toàn bộ khách hàng!');
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
      await clearModule({ module: 'customers' });
      await seedModule({ module: 'customers', quantity: defaultQuantity, force: true });
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
             <p className="text-sm text-slate-500 mt-1">Seed, clear hoặc reset dữ liệu khách hàng</p>
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
             <div className="p-2 bg-violet-500/10 rounded-lg">
               <Users className="w-5 h-5 text-violet-600" />
             </div>
             <div>
               <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{statsData?.totalCount ?? 0}</p>
               <p className="text-sm text-slate-500">Tổng KH</p>
             </div>
           </div>
         </Card>
         <Card className="p-4">
           <div className="flex items-center gap-3">
             <div className="p-2 bg-emerald-500/10 rounded-lg">
               <UserCheck className="w-5 h-5 text-emerald-600" />
             </div>
             <div>
               <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{statsData?.activeCount ?? 0}</p>
               <p className="text-sm text-slate-500">Hoạt động</p>
             </div>
           </div>
         </Card>
         <Card className="p-4">
           <div className="flex items-center gap-3">
             <div className="p-2 bg-amber-500/10 rounded-lg">
               <DollarSign className="w-5 h-5 text-amber-600" />
             </div>
             <div>
               <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{formatCurrency(statsData?.totalSpent ?? 0)}</p>
               <p className="text-sm text-slate-500">Tổng chi tiêu</p>
             </div>
           </div>
         </Card>
         <Card className="p-4">
           <div className="flex items-center gap-3">
             <div className="p-2 bg-blue-500/10 rounded-lg">
               <ShoppingBag className="w-5 h-5 text-blue-600" />
             </div>
             <div>
               <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{statsData?.totalOrders ?? 0}</p>
               <p className="text-sm text-slate-500">Tổng đơn hàng</p>
             </div>
           </div>
         </Card>
       </div>
 
       {citiesData && citiesData.length > 0 && (
         <Card className="p-4">
           <div className="flex items-center gap-2 mb-3">
             <MapPin className="w-5 h-5 text-violet-500" />
             <h3 className="font-semibold text-slate-900 dark:text-slate-100">Thành phố ({citiesData.length})</h3>
           </div>
           <div className="flex flex-wrap gap-2">
             {citiesData.map(city => (
               <Badge key={city} variant="secondary">{city}</Badge>
             ))}
           </div>
         </Card>
       )}
 
       <Card>
         <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
           <Users className="w-5 h-5 text-violet-500" />
           <h3 className="font-semibold text-slate-900 dark:text-slate-100">Khách hàng ({customersData?.length ?? 0})</h3>
         </div>
         <Table>
           <TableHeader>
             <TableRow>
               <TableHead>Họ tên</TableHead>
               <TableHead>Email</TableHead>
               <TableHead>Thành phố</TableHead>
               <TableHead>Trạng thái</TableHead>
               <TableHead className="text-right">Đơn hàng</TableHead>
               <TableHead className="text-right">Chi tiêu</TableHead>
             </TableRow>
           </TableHeader>
           <TableBody>
             {customersData?.slice(0, 10).map(customer => (
               <TableRow key={customer._id}>
                 <TableCell className="font-medium">{customer.name}</TableCell>
                 <TableCell className="text-slate-500">{customer.email}</TableCell>
                 <TableCell>{customer.city ?? '-'}</TableCell>
                 <TableCell>
                   <Badge variant={customer.status === 'Active' ? 'default' : 'secondary'}>
                     {customer.status === 'Active' ? 'Hoạt động' : 'Ngừng'}
                   </Badge>
                 </TableCell>
                 <TableCell className="text-right">{customer.ordersCount}</TableCell>
                 <TableCell className="text-right">{formatCurrency(customer.totalSpent)}</TableCell>
               </TableRow>
             ))}
             {(!customersData || customersData.length === 0) && (
               <TableRow>
                 <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                   Chưa có khách hàng nào. Nhấn &quot;Seed Data&quot; để tạo dữ liệu mẫu.
                 </TableCell>
               </TableRow>
             )}
           </TableBody>
         </Table>
         {customersData && customersData.length > 10 && (
           <div className="p-3 border-t border-slate-100 dark:border-slate-800 text-sm text-slate-500 text-center">
             Hiển thị 10 / {customersData.length} khách hàng
           </div>
         )}
       </Card>
     </div>
   );
 }
