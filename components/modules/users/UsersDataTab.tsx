 'use client';
 
 import React, { useState, useMemo } from 'react';
 import { useMutation, useQuery } from 'convex/react';
 import { api } from '@/convex/_generated/api';
 import { toast } from 'sonner';
 import Image from 'next/image';
 import { Database, Loader2, RefreshCw, Shield, Trash2, UserCog } from 'lucide-react';
 import { Badge, Button, Card, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/admin/components/ui';
import { getSeedModuleInfo } from '@/lib/modules/seed-registry';
 
 interface UsersDataTabProps {
   colorClasses: { button: string };
 }
 
 export function UsersDataTab({ colorClasses }: UsersDataTabProps) {
   const [isSeeding, setIsSeeding] = useState(false);
   const [isClearing, setIsClearing] = useState(false);
 
   const usersData = useQuery(api.users.listAll);
   const rolesData = useQuery(api.roles.listAll);
 
  const seedModule = useMutation(api.seedManager.seedModule);
  const clearModule = useMutation(api.seedManager.clearModule);
  const defaultQuantity = getSeedModuleInfo('users')?.defaultQuantity ?? 10;
 
   const rolesMap = useMemo(() => {
     const map = new Map<string, string>();
     rolesData?.forEach(role => map.set(role._id, role.name));
     return map;
   }, [rolesData]);
 
   const handleSeedAll = async () => {
     setIsSeeding(true);
     try {
      await seedModule({ module: 'users', quantity: defaultQuantity });
       toast.success('Đã tạo dữ liệu mẫu!');
     } catch (error) {
       toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra');
     } finally {
       setIsSeeding(false);
     }
   };
 
   const handleClearData = async () => {
     if (!confirm('Xóa toàn bộ users?')) return;
     setIsClearing(true);
     try {
      await clearModule({ module: 'users' });
       toast.success('Đã xóa toàn bộ users!');
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
      await clearModule({ module: 'users' });
      await seedModule({ module: 'users', quantity: defaultQuantity, force: true });
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
             <p className="text-sm text-slate-500 mt-1">Seed, clear hoặc reset dữ liệu người dùng</p>
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
             <div className="p-2 bg-indigo-500/10 rounded-lg">
               <UserCog className="w-5 h-5 text-indigo-600" />
             </div>
             <div>
               <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{usersData?.length ?? 0}</p>
               <p className="text-sm text-slate-500">Tổng users</p>
             </div>
           </div>
         </Card>
         <Card className="p-4">
           <div className="flex items-center gap-3">
             <div className="p-2 bg-amber-500/10 rounded-lg">
               <Shield className="w-5 h-5 text-amber-600" />
             </div>
             <div>
               <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{rolesData?.length ?? 0}</p>
               <p className="text-sm text-slate-500">Vai trò</p>
             </div>
           </div>
         </Card>
         <Card className="p-4">
           <div className="flex items-center gap-3">
             <div className="p-2 bg-emerald-500/10 rounded-lg">
               <UserCog className="w-5 h-5 text-emerald-600" />
             </div>
             <div>
               <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {usersData?.filter(u => u.status === 'Active').length ?? 0}
               </p>
               <p className="text-sm text-slate-500">Đang hoạt động</p>
             </div>
           </div>
         </Card>
       </div>
 
       <Card>
         <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
           <UserCog className="w-5 h-5 text-indigo-500" />
           <h3 className="font-semibold text-slate-900 dark:text-slate-100">Người dùng ({usersData?.length ?? 0})</h3>
         </div>
         <Table>
           <TableHeader>
             <TableRow>
               <TableHead></TableHead>
               <TableHead>Tên</TableHead>
               <TableHead>Email</TableHead>
               <TableHead>Vai trò</TableHead>
               <TableHead>Trạng thái</TableHead>
             </TableRow>
           </TableHeader>
           <TableBody>
             {usersData?.slice(0, 10).map(user => (
               <TableRow key={user._id}>
                 <TableCell className="w-12">
                   {user.avatar ? (
                     <Image src={user.avatar} alt="" width={32} height={32} className="rounded-full" />
                   ) : (
                     <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                       <UserCog className="w-4 h-4 text-indigo-600" />
                     </div>
                   )}
                 </TableCell>
                 <TableCell className="font-medium">{user.name}</TableCell>
                 <TableCell className="text-slate-500">{user.email}</TableCell>
                 <TableCell>
                   <Badge variant="secondary" className="bg-amber-500/10 text-amber-600">
                     {user.roleId ? rolesMap.get(user.roleId) ?? 'N/A' : 'N/A'}
                   </Badge>
                 </TableCell>
                 <TableCell>
                  <Badge variant={user.status === 'Active' ? 'default' : 'secondary'}>
                    {user.status === 'Active' ? 'Hoạt động' : 'Ngừng'}
                   </Badge>
                 </TableCell>
               </TableRow>
             ))}
             {(!usersData || usersData.length === 0) && (
               <TableRow>
                 <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                   Chưa có user nào. Nhấn &quot;Seed Data&quot; để tạo dữ liệu mẫu.
                 </TableCell>
               </TableRow>
             )}
           </TableBody>
         </Table>
         {usersData && usersData.length > 10 && (
           <div className="p-3 border-t border-slate-100 dark:border-slate-800 text-sm text-slate-500 text-center">
             Hiển thị 10 / {usersData.length} users
           </div>
         )}
       </Card>
     </div>
   );
 }
