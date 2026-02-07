 'use client';
 
 import React, { useState, useMemo } from 'react';
 import { useMutation, useQuery } from 'convex/react';
 import { api } from '@/convex/_generated/api';
 import type { Id } from '@/convex/_generated/dataModel';
 import { toast } from 'sonner';
 import { Database, FolderTree, Link2, Loader2, Menu, RefreshCw, Trash2 } from 'lucide-react';
 import { Badge, Button, Card, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/admin/components/ui';
import { getSeedModuleInfo } from '@/lib/modules/seed-registry';
 
 interface MenusDataTabProps {
   colorClasses: { button: string };
 }
 
 interface MenuRecord {
   _id: Id<'menus'>;
   name: string;
   location: string;
   _creationTime?: number;
 }
 
 const LOCATION_LABELS: Record<string, string> = {
   footer: 'Footer',
   header: 'Header',
   sidebar: 'Sidebar',
 };
 
 export function MenusDataTab({ colorClasses }: MenusDataTabProps) {
   const [isSeeding, setIsSeeding] = useState(false);
   const [isClearing, setIsClearing] = useState(false);
 
   const menusData = useQuery(api.menus.listMenus);
 
  const seedModule = useMutation(api.seedManager.seedModule);
  const clearModule = useMutation(api.seedManager.clearModule);
  const defaultQuantity = getSeedModuleInfo('menus')?.defaultQuantity ?? 3;
 
   const menusByLocation = useMemo(() => {
     const map = new Map<string, MenuRecord[]>();
     (menusData as MenuRecord[] | undefined)?.forEach(menu => {
       const loc = menu.location || 'header';
       if (!map.has(loc)) map.set(loc, []);
       map.get(loc)!.push(menu);
     });
     return map;
   }, [menusData]);
 
   const handleSeedAll = async () => {
     setIsSeeding(true);
     try {
      await seedModule({ module: 'menus', quantity: defaultQuantity });
       toast.success('Đã tạo dữ liệu mẫu!');
     } catch (error) {
       toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra');
     } finally {
       setIsSeeding(false);
     }
   };
 
   const handleClearData = async () => {
     if (!confirm('Xóa toàn bộ menus?')) return;
     setIsClearing(true);
     try {
      await clearModule({ module: 'menus' });
       toast.success('Đã xóa toàn bộ menus!');
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
      await clearModule({ module: 'menus' });
      await seedModule({ module: 'menus', quantity: defaultQuantity, force: true });
       toast.success('Đã reset dữ liệu!');
     } catch (error) {
       toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra');
     } finally {
       setIsClearing(false);
     }
   };
 
   const menuList = menusData as MenuRecord[] | undefined;
 
   return (
     <div className="space-y-6">
       <Card className="p-4">
         <div className="flex items-center justify-between">
           <div>
             <h3 className="font-semibold text-slate-900 dark:text-slate-100">Quản lý dữ liệu mẫu</h3>
             <p className="text-sm text-slate-500 mt-1">Seed, clear hoặc reset dữ liệu menu</p>
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
 
       <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
         <Card className="p-4">
           <div className="flex items-center gap-3">
             <div className="p-2 bg-cyan-500/10 rounded-lg">
               <Menu className="w-5 h-5 text-cyan-600" />
             </div>
             <div>
               <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{menuList?.length ?? 0}</p>
               <p className="text-sm text-slate-500">Tổng menus</p>
             </div>
           </div>
         </Card>
         <Card className="p-4">
           <div className="flex items-center gap-3">
             <div className="p-2 bg-blue-500/10 rounded-lg">
               <FolderTree className="w-5 h-5 text-blue-600" />
             </div>
             <div>
               <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{menusByLocation.size}</p>
               <p className="text-sm text-slate-500">Vị trí</p>
             </div>
           </div>
         </Card>
         <Card className="p-4">
           <div className="flex items-center gap-3">
             <div className="p-2 bg-emerald-500/10 rounded-lg">
               <Link2 className="w-5 h-5 text-emerald-600" />
             </div>
             <div>
               <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                 {menusByLocation.get('header')?.length ?? 0}
               </p>
               <p className="text-sm text-slate-500">Header menus</p>
             </div>
           </div>
         </Card>
       </div>
 
       {menusByLocation.size > 0 && (
         <Card className="p-4">
           <div className="flex items-center gap-2 mb-3">
             <FolderTree className="w-5 h-5 text-cyan-500" />
             <h3 className="font-semibold text-slate-900 dark:text-slate-100">Phân loại theo vị trí</h3>
           </div>
           <div className="flex flex-wrap gap-2">
             {Array.from(menusByLocation.entries()).map(([loc, items]) => (
               <Badge key={loc} variant="secondary" className="bg-cyan-500/10 text-cyan-600">
                 {LOCATION_LABELS[loc] ?? loc}: {items.length}
               </Badge>
             ))}
           </div>
         </Card>
       )}
 
       <Card>
         <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
           <Menu className="w-5 h-5 text-cyan-500" />
           <h3 className="font-semibold text-slate-900 dark:text-slate-100">Menus ({menuList?.length ?? 0})</h3>
         </div>
         <Table>
           <TableHeader>
             <TableRow>
               <TableHead>Tên menu</TableHead>
               <TableHead>Vị trí</TableHead>
               <TableHead>Ngày tạo</TableHead>
             </TableRow>
           </TableHeader>
           <TableBody>
             {menuList?.slice(0, 10).map(menu => (
               <TableRow key={menu._id}>
                 <TableCell className="font-medium">{menu.name}</TableCell>
                 <TableCell>
                   <Badge variant="secondary" className="bg-cyan-500/10 text-cyan-600">
                     {LOCATION_LABELS[menu.location] ?? menu.location}
                   </Badge>
                 </TableCell>
                 <TableCell className="text-slate-500">
                   {menu._creationTime ? new Date(menu._creationTime).toLocaleDateString('vi-VN') : '-'}
                 </TableCell>
               </TableRow>
             ))}
             {(!menuList || menuList.length === 0) && (
               <TableRow>
                 <TableCell colSpan={3} className="text-center py-8 text-slate-500">
                   Chưa có menu nào. Nhấn &quot;Seed Data&quot; để tạo dữ liệu mẫu.
                 </TableCell>
               </TableRow>
             )}
           </TableBody>
         </Table>
         {menuList && menuList.length > 10 && (
           <div className="p-3 border-t border-slate-100 dark:border-slate-800 text-sm text-slate-500 text-center">
             Hiển thị 10 / {menuList.length} menus
           </div>
         )}
       </Card>
     </div>
   );
 }
