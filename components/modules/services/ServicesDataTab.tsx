 'use client';
 
 import React, { useState } from 'react';
 import { useMutation, usePaginatedQuery, useQuery } from 'convex/react';
 import { api } from '@/convex/_generated/api';
 import { toast } from 'sonner';
 import { Briefcase, Database, FolderTree, Loader2, RefreshCw, Trash2 } from 'lucide-react';
 import { Badge, Button, Card, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/admin/components/ui';
import { getSeedModuleInfo } from '@/lib/modules/seed-registry';
 
 interface ServicesDataTabProps {
   colorClasses: { button: string };
 }
 
 export function ServicesDataTab({ colorClasses }: ServicesDataTabProps) {
   const [isSeeding, setIsSeeding] = useState(false);
   const [isClearing, setIsClearing] = useState(false);
 
   const { results: servicesData, status: servicesStatus, loadMore: loadMoreServices } = usePaginatedQuery(
     api.services.list,
     {},
     { initialNumItems: 10 }
   );
   const categoriesData = useQuery(api.serviceCategories.listAll, { limit: 50 });
 
  const seedModule = useMutation(api.seedManager.seedModule);
   const clearServicesData = useMutation(api.seed.clearServicesData);

  const defaultQuantity = getSeedModuleInfo('services')?.defaultQuantity ?? 10;
 
   const categoryMap: Record<string, string> = {};
   categoriesData?.forEach(cat => { categoryMap[cat._id] = cat.name; });
 
   const formatPrice = (price?: number) => {
     if (!price) return '-';
     return new Intl.NumberFormat('vi-VN', { currency: 'VND', style: 'currency' }).format(price);
   };
 
   const handleSeedAll = async () => {
     setIsSeeding(true);
     try {
      await seedModule({ module: 'services', quantity: defaultQuantity });
       toast.success('Đã tạo dữ liệu mẫu!');
     } catch (error) {
       toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra');
     } finally {
       setIsSeeding(false);
     }
   };
 
   const handleClearData = async () => {
     if (!confirm('Xóa toàn bộ dữ liệu dịch vụ và danh mục?')) return;
     setIsClearing(true);
     try {
       await clearServicesData();
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
       await clearServicesData();
      await seedModule({ module: 'services', quantity: defaultQuantity });
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
             <p className="text-sm text-slate-500 mt-1">Seed, clear hoặc reset dữ liệu cho module dịch vụ</p>
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
 
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         <Card className="p-4">
           <div className="flex items-center gap-3">
             <div className="p-2 bg-teal-500/10 rounded-lg">
               <Briefcase className="w-5 h-5 text-teal-600" />
             </div>
             <div>
               <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{servicesData?.length ?? 0}{servicesStatus === 'CanLoadMore' ? '+' : ''}</p>
               <p className="text-sm text-slate-500">Dịch vụ</p>
             </div>
           </div>
         </Card>
         <Card className="p-4">
           <div className="flex items-center gap-3">
             <div className="p-2 bg-emerald-500/10 rounded-lg">
               <FolderTree className="w-5 h-5 text-emerald-600" />
             </div>
             <div>
               <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{categoriesData?.length ?? 0}</p>
               <p className="text-sm text-slate-500">Danh mục</p>
             </div>
           </div>
         </Card>
       </div>
 
       <Card>
         <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
           <Briefcase className="w-5 h-5 text-teal-500" />
           <h3 className="font-semibold text-slate-900 dark:text-slate-100">Dịch vụ ({servicesData?.length ?? 0}{servicesStatus === 'CanLoadMore' ? '+' : ''})</h3>
         </div>
         <Table>
           <TableHeader>
             <TableRow>
               <TableHead>Tiêu đề</TableHead>
               <TableHead>Danh mục</TableHead>
               <TableHead>Giá</TableHead>
               <TableHead>Trạng thái</TableHead>
             </TableRow>
           </TableHeader>
           <TableBody>
             {servicesData?.map(service => (
               <TableRow key={service._id}>
                 <TableCell className="font-medium">{service.title}</TableCell>
                 <TableCell><Badge variant="secondary">{categoryMap[service.categoryId] || 'N/A'}</Badge></TableCell>
                 <TableCell>{formatPrice(service.price)}</TableCell>
                 <TableCell>
                   <Badge variant={service.status === 'Published' ? 'default' : (service.status === 'Draft' ? 'secondary' : 'outline')}>
                     {service.status === 'Published' ? 'Xuất bản' : (service.status === 'Draft' ? 'Nháp' : 'Lưu trữ')}
                   </Badge>
                 </TableCell>
               </TableRow>
             ))}
             {(!servicesData || servicesData.length === 0) && (
               <TableRow>
                 <TableCell colSpan={4} className="text-center py-8 text-slate-500">
                   Chưa có dịch vụ nào. Nhấn &quot;Seed Data&quot; để tạo dữ liệu mẫu.
                 </TableCell>
               </TableRow>
             )}
           </TableBody>
         </Table>
         {servicesStatus === 'CanLoadMore' && (
           <div className="p-3 border-t border-slate-100 dark:border-slate-800 text-center">
             <Button variant="ghost" size="sm" onClick={() => loadMoreServices(10)}>
               Tải thêm dịch vụ
             </Button>
           </div>
         )}
       </Card>
 
       <Card>
         <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
           <FolderTree className="w-5 h-5 text-emerald-500" />
           <h3 className="font-semibold text-slate-900 dark:text-slate-100">Danh mục ({categoriesData?.length ?? 0})</h3>
         </div>
         <Table>
           <TableHeader>
             <TableRow>
               <TableHead>Tên danh mục</TableHead>
               <TableHead>Slug</TableHead>
               <TableHead>Trạng thái</TableHead>
               <TableHead className="text-right">Số dịch vụ</TableHead>
             </TableRow>
           </TableHeader>
           <TableBody>
             {categoriesData?.map(cat => {
               const serviceCount = servicesData?.filter(s => s.categoryId === cat._id).length ?? 0;
               return (
                 <TableRow key={cat._id}>
                   <TableCell className="font-medium">{cat.name}</TableCell>
                   <TableCell className="text-slate-500 font-mono text-sm">{cat.slug}</TableCell>
                   <TableCell>
                     <Badge variant={cat.active ? 'default' : 'secondary'}>{cat.active ? 'Hoạt động' : 'Ẩn'}</Badge>
                   </TableCell>
                   <TableCell className="text-right">{serviceCount}</TableCell>
                 </TableRow>
               );
             })}
             {(!categoriesData || categoriesData.length === 0) && (
               <TableRow>
                 <TableCell colSpan={4} className="text-center py-8 text-slate-500">
                   Chưa có danh mục nào.
                 </TableCell>
               </TableRow>
             )}
           </TableBody>
         </Table>
       </Card>
     </div>
   );
 }
