 'use client';
 
 import React, { useState, useMemo } from 'react';
 import { useMutation, useQuery } from 'convex/react';
 import { api } from '@/convex/_generated/api';
 import { toast } from 'sonner';
import { Crown, Database, Loader2, RefreshCw, Shield, Trash2, Users } from 'lucide-react';
 import { Badge, Button, Card, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/admin/components/ui';
 
 interface RolesDataTabProps {
   colorClasses: { button: string };
 }
 
 export function RolesDataTab({ colorClasses }: RolesDataTabProps) {
   const [isSeeding, setIsSeeding] = useState(false);
   const [isClearing, setIsClearing] = useState(false);
 
   const rolesData = useQuery(api.roles.listAll);
   const statsData = useQuery(api.roles.getStats);
   const userCountByRole = useQuery(api.roles.getUserCountByRole);
 
   const seedRolesModule = useMutation(api.seed.seedRolesModule);
   const clearRolesData = useMutation(api.seed.clearRolesData);
 
   const userCountMap = useMemo(() => {
     const map = new Map<string, number>();
    userCountByRole?.forEach(item => map.set(item.roleId, item.userCount));
     return map;
   }, [userCountByRole]);
 
   const handleSeedAll = async () => {
     setIsSeeding(true);
     try {
       await seedRolesModule();
       toast.success('Đã tạo dữ liệu mẫu!');
     } catch (error) {
       toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra');
     } finally {
       setIsSeeding(false);
     }
   };
 
   const handleClearData = async () => {
     if (!confirm('Xóa toàn bộ roles?')) return;
     setIsClearing(true);
     try {
       await clearRolesData();
       toast.success('Đã xóa toàn bộ roles!');
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
       await clearRolesData();
       await seedRolesModule();
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
             <p className="text-sm text-slate-500 mt-1">Seed, clear hoặc reset dữ liệu vai trò</p>
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
             <div className="p-2 bg-amber-500/10 rounded-lg">
               <Shield className="w-5 h-5 text-amber-600" />
             </div>
             <div>
               <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{statsData?.totalCount ?? 0}</p>
               <p className="text-sm text-slate-500">Tổng vai trò</p>
             </div>
           </div>
         </Card>
         <Card className="p-4">
           <div className="flex items-center gap-3">
             <div className="p-2 bg-purple-500/10 rounded-lg">
               <Crown className="w-5 h-5 text-purple-600" />
             </div>
             <div>
               <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{statsData?.systemCount ?? 0}</p>
               <p className="text-sm text-slate-500">System roles</p>
             </div>
           </div>
         </Card>
         <Card className="p-4">
           <div className="flex items-center gap-3">
             <div className="p-2 bg-blue-500/10 rounded-lg">
               <Users className="w-5 h-5 text-blue-600" />
             </div>
             <div>
               <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{statsData?.customCount ?? 0}</p>
               <p className="text-sm text-slate-500">Custom roles</p>
             </div>
           </div>
         </Card>
         <Card className="p-4">
           <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/10 rounded-lg">
              <Crown className="w-5 h-5 text-red-600" />
             </div>
             <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{statsData?.superAdminCount ?? 0}</p>
              <p className="text-sm text-slate-500">Super Admin</p>
             </div>
           </div>
         </Card>
       </div>
 
       <Card>
         <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
           <Shield className="w-5 h-5 text-amber-500" />
           <h3 className="font-semibold text-slate-900 dark:text-slate-100">Vai trò ({rolesData?.length ?? 0})</h3>
         </div>
         <Table>
           <TableHeader>
             <TableRow>
               <TableHead>Tên vai trò</TableHead>
               <TableHead>Quyền</TableHead>
               <TableHead>Users</TableHead>
               <TableHead>Loại</TableHead>
             </TableRow>
           </TableHeader>
           <TableBody>
             {rolesData?.map(role => (
               <TableRow key={role._id}>
                 <TableCell>
                   <div className="flex items-center gap-2">
                     {role.color && (
                       <div className="w-3 h-3 rounded-full" style={{ backgroundColor: role.color }} />
                     )}
                     <span className="font-medium">{role.name}</span>
                   </div>
                 </TableCell>
                <TableCell>{Object.keys(role.permissions ?? {}).length}</TableCell>
                 <TableCell>{userCountMap.get(role._id) ?? 0}</TableCell>
                 <TableCell>
                   <Badge variant={role.isSystem ? 'default' : 'secondary'} className={role.isSystem ? 'bg-purple-500' : ''}>
                     {role.isSystem ? 'System' : 'Custom'}
                   </Badge>
                 </TableCell>
               </TableRow>
             ))}
             {(!rolesData || rolesData.length === 0) && (
               <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-slate-500">
                   Chưa có vai trò nào. Nhấn &quot;Seed Data&quot; để tạo dữ liệu mẫu.
                 </TableCell>
               </TableRow>
             )}
           </TableBody>
         </Table>
       </Card>
     </div>
   );
 }
