 'use client';
 
 import React, { useState } from 'react';
 import { useMutation, useQuery } from 'convex/react';
 import { api } from '@/convex/_generated/api';
 import type { Id } from '@/convex/_generated/dataModel';
 import { toast } from 'sonner';
 import { Database, Eye, EyeOff, FileText, GripVertical, Home, ImageIcon, LayoutGrid, Loader2, Phone, RefreshCw, Trash2, Users } from 'lucide-react';
 import { Badge, Button, Card, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/admin/components/ui';
 
 interface HomepageDataTabProps {
   colorClasses: { button: string };
 }
 
 const TYPE_ICONS: Record<string, React.ElementType> = {
   about: FileText,
   contact: Phone,
   hero: ImageIcon,
   partners: Users,
   posts: FileText,
   products: LayoutGrid,
 };
 
 const TYPE_COLORS: Record<string, string> = {
   about: 'bg-emerald-500/10 text-emerald-600',
   contact: 'bg-pink-500/10 text-pink-600',
   hero: 'bg-blue-500/10 text-blue-600',
   partners: 'bg-amber-500/10 text-amber-600',
   posts: 'bg-cyan-500/10 text-cyan-600',
   products: 'bg-purple-500/10 text-purple-600',
 };
 
 export function HomepageDataTab({ colorClasses }: HomepageDataTabProps) {
   const [isSeeding, setIsSeeding] = useState(false);
   const [isClearing, setIsClearing] = useState(false);
 
   const componentsData = useQuery(api.homeComponents.listAll);
   const statsData = useQuery(api.homeComponents.getStats);
 
   const seedHomepageModule = useMutation(api.seed.seedHomepageModule);
   const clearHomepageData = useMutation(api.seed.clearHomepageData);
   const toggleComponent = useMutation(api.homeComponents.toggle);
 
   const sortedComponents = [...(componentsData ?? [])].sort((a, b) => a.order - b.order);
 
   const handleSeedAll = async () => {
     setIsSeeding(true);
     try {
       await seedHomepageModule();
       toast.success('Đã tạo dữ liệu mẫu!');
     } catch (error) {
       toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra');
     } finally {
       setIsSeeding(false);
     }
   };
 
   const handleClearData = async () => {
     if (!confirm('Xóa toàn bộ sections trang chủ?')) return;
     setIsClearing(true);
     try {
       await clearHomepageData();
       toast.success('Đã xóa toàn bộ sections!');
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
       await clearHomepageData();
       await seedHomepageModule();
       toast.success('Đã reset dữ liệu!');
     } catch (error) {
       toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra');
     } finally {
       setIsClearing(false);
     }
   };
 
   const handleToggleComponent = async (id: Id<'homeComponents'>) => {
     await toggleComponent({ id });
     toast.success('Đã cập nhật trạng thái section!');
   };
 
   return (
     <div className="space-y-6">
       <Card className="p-4">
         <div className="flex items-center justify-between">
           <div>
             <h3 className="font-semibold text-slate-900 dark:text-slate-100">Quản lý dữ liệu mẫu</h3>
             <p className="text-sm text-slate-500 mt-1">Seed, clear hoặc reset sections trang chủ</p>
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
             <div className="p-2 bg-orange-500/10 rounded-lg">
               <LayoutGrid className="w-5 h-5 text-orange-600" />
             </div>
             <div>
               <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{statsData?.totalCount ?? 0}</p>
               <p className="text-sm text-slate-500">Tổng sections</p>
             </div>
           </div>
         </Card>
         <Card className="p-4">
           <div className="flex items-center gap-3">
             <div className="p-2 bg-emerald-500/10 rounded-lg">
               <Eye className="w-5 h-5 text-emerald-600" />
             </div>
             <div>
               <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{statsData?.activeCount ?? 0}</p>
               <p className="text-sm text-slate-500">Đang hiển thị</p>
             </div>
           </div>
         </Card>
         <Card className="p-4">
           <div className="flex items-center gap-3">
             <div className="p-2 bg-slate-500/10 rounded-lg">
               <EyeOff className="w-5 h-5 text-slate-600" />
             </div>
             <div>
               <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{statsData?.inactiveCount ?? 0}</p>
               <p className="text-sm text-slate-500">Đang ẩn</p>
             </div>
           </div>
         </Card>
         <Card className="p-4">
           <div className="flex items-center gap-3">
             <div className="p-2 bg-blue-500/10 rounded-lg">
               <Home className="w-5 h-5 text-blue-600" />
             </div>
             <div>
               <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{statsData?.typeBreakdown?.length ?? 0}</p>
               <p className="text-sm text-slate-500">Loại section</p>
             </div>
           </div>
         </Card>
       </div>
 
       {statsData?.typeBreakdown && statsData.typeBreakdown.length > 0 && (
         <Card className="p-4">
           <div className="flex items-center gap-2 mb-3">
             <LayoutGrid className="w-5 h-5 text-orange-500" />
             <h3 className="font-semibold text-slate-900 dark:text-slate-100">Phân loại sections</h3>
           </div>
           <div className="flex flex-wrap gap-2">
             {statsData.typeBreakdown.map(({ type, count }) => {
               const Icon = TYPE_ICONS[type] || LayoutGrid;
               const colorClass = TYPE_COLORS[type] || 'bg-slate-500/10 text-slate-600';
               return (
                 <Badge key={type} variant="secondary" className={`${colorClass} gap-1`}>
                   <Icon size={12} />
                   {type}: {count}
                 </Badge>
               );
             })}
           </div>
         </Card>
       )}
 
       <Card>
         <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
           <LayoutGrid className="w-5 h-5 text-orange-500" />
           <h3 className="font-semibold text-slate-900 dark:text-slate-100">Sections ({componentsData?.length ?? 0})</h3>
         </div>
         <Table>
           <TableHeader>
             <TableRow>
               <TableHead className="w-12">#</TableHead>
               <TableHead>Tên section</TableHead>
               <TableHead>Loại</TableHead>
               <TableHead>Trạng thái</TableHead>
               <TableHead className="text-right">Thao tác</TableHead>
             </TableRow>
           </TableHeader>
           <TableBody>
             {sortedComponents.map((component, index) => {
               const Icon = TYPE_ICONS[component.type] || LayoutGrid;
               const colorClass = TYPE_COLORS[component.type] || 'bg-slate-500/10 text-slate-600';
               return (
                 <TableRow key={component._id}>
                   <TableCell>
                     <div className="flex items-center gap-1 text-slate-400">
                       <GripVertical size={14} />
                       {index + 1}
                     </div>
                   </TableCell>
                   <TableCell className="font-medium">{component.title}</TableCell>
                   <TableCell>
                     <Badge variant="secondary" className={`${colorClass} gap-1`}>
                       <Icon size={12} />
                       {component.type}
                     </Badge>
                   </TableCell>
                   <TableCell>
                     <Badge variant={component.active ? 'default' : 'secondary'}>
                       {component.active ? 'Hiển thị' : 'Ẩn'}
                     </Badge>
                   </TableCell>
                   <TableCell className="text-right">
                     <Button 
                       variant="ghost" 
                       size="sm"
                       onClick={async () => handleToggleComponent(component._id)}
                       className="gap-1"
                     >
                       {component.active ? <EyeOff size={14} /> : <Eye size={14} />}
                       {component.active ? 'Ẩn' : 'Hiện'}
                     </Button>
                   </TableCell>
                 </TableRow>
               );
             })}
             {(!componentsData || componentsData.length === 0) && (
               <TableRow>
                 <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                   Chưa có section nào. Nhấn &quot;Seed Data&quot; để tạo dữ liệu mẫu.
                 </TableCell>
               </TableRow>
             )}
           </TableBody>
         </Table>
       </Card>
     </div>
   );
 }
