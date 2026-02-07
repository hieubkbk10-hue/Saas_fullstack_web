 'use client';
 
 import React, { useState } from 'react';
 import { useMutation, useQuery } from 'convex/react';
 import { api } from '@/convex/_generated/api';
import type { Doc } from '@/convex/_generated/dataModel';
import { toast } from 'sonner';
 import { CheckCircle, Clock, Database, DollarSign, Loader2, Percent, RefreshCw, Ticket, Trash2, Users } from 'lucide-react';
 import { Badge, Button, Card, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/admin/components/ui';
import { getSeedModuleInfo } from '@/lib/modules/seed-registry';
 
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
 
export function PromotionsDataTab({ colorClasses }: PromotionsDataTabProps) {
  const [isSeeding, setIsSeeding] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

   const promotionsData = useQuery(api.promotions.listAll) as Doc<'promotions'>[] | undefined;
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

  const typeSummary = [
    { label: 'Coupon', value: statsData?.couponCount ?? 0 },
    { label: 'Chương trình', value: statsData?.campaignCount ?? 0 },
    { label: 'Flash sale', value: statsData?.flashSaleCount ?? 0 },
    { label: 'Combo', value: statsData?.bundleCount ?? 0 },
    { label: 'Loyalty', value: statsData?.loyaltyCount ?? 0 },
  ];

  const discountSummary = [
    { label: 'Mua X tặng Y', value: statsData?.buyXGetYCount ?? 0 },
    { label: 'Mua A tặng B', value: statsData?.buyAGetBCount ?? 0 },
    { label: 'Giảm bậc', value: statsData?.tieredCount ?? 0 },
    { label: 'Free ship', value: statsData?.freeShippingCount ?? 0 },
    { label: 'Tặng quà', value: statsData?.giftCount ?? 0 },
  ];

  const seedModule = useMutation(api.seedManager.seedModule);
  const clearModule = useMutation(api.seedManager.clearModule);
  const defaultQuantity = getSeedModuleInfo('promotions')?.defaultQuantity ?? 5;

  const handleSeedAll = async () => {
    setIsSeeding(true);
    try {
      await seedModule({ module: 'promotions', quantity: defaultQuantity });
      toast.success('Đã tạo dữ liệu mẫu!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra');
    } finally {
      setIsSeeding(false);
    }
  };

  const handleClearData = async () => {
    if (!confirm('Xóa toàn bộ khuyến mãi?')) return;
    setIsClearing(true);
    try {
      await clearModule({ module: 'promotions' });
      toast.success('Đã xóa toàn bộ khuyến mãi!');
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
      await clearModule({ module: 'promotions' });
      await seedModule({ module: 'promotions', quantity: defaultQuantity, force: true });
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
             <p className="text-sm text-slate-500 mt-1">Seed, clear hoặc reset dữ liệu khuyến mãi</p>
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
        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">Phân loại khuyến mãi</h3>
          <p className="text-xs text-slate-500 mt-1">Tổng hợp theo loại chương trình và loại giảm giá</p>
        </div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Loại chương trình</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {typeSummary.map(item => (
                <span key={item.label} className="text-xs bg-rose-500/10 text-rose-600 px-2 py-1 rounded-full">
                  {item.label}: {item.value}
                </span>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Loại giảm giá nâng cao</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {discountSummary.map(item => (
                <span key={item.label} className="text-xs bg-slate-500/10 text-slate-600 px-2 py-1 rounded-full">
                  {item.label}: {item.value}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Card>
 
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
                    {promo.code ? (
                      <code className="text-xs text-rose-600 bg-rose-50 dark:bg-rose-900/20 px-1.5 py-0.5 rounded">{promo.code}</code>
                    ) : (
                      <span className="text-xs text-slate-500">Tự động áp dụng</span>
                    )}
                   </div>
                 </TableCell>
                 <TableCell>
                   {promo.discountType === 'percent' ? (
                    <Badge variant="secondary" className="bg-purple-500/10 text-purple-600">-{promo.discountValue ?? 0}%</Badge>
                   ) : (
                    <Badge variant="secondary" className="bg-cyan-500/10 text-cyan-600">-{formatCurrency(promo.discountValue ?? 0)}</Badge>
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
