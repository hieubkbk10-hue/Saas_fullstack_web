 'use client';
 
 import React, { useMemo } from 'react';
 import { useQuery } from 'convex/react';
 import { api } from '@/convex/_generated/api';
import { AlertTriangle, Bell, CheckCircle, Clock, Info, Send, XCircle } from 'lucide-react';
import { Badge, Card, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/admin/components/ui';
 
 interface NotificationsDataTabProps {
   colorClasses: { button: string };
 }
 
 const TYPE_CONFIG = {
   error: { bg: 'bg-red-500/10', color: 'text-red-500', icon: XCircle },
   info: { bg: 'bg-blue-500/10', color: 'text-blue-500', icon: Info },
   success: { bg: 'bg-green-500/10', color: 'text-green-500', icon: CheckCircle },
   warning: { bg: 'bg-amber-500/10', color: 'text-amber-500', icon: AlertTriangle },
 };
 
 const STATUS_CONFIG = {
   Cancelled: { label: 'Đã hủy', variant: 'destructive' as const },
   Draft: { label: 'Bản nháp', variant: 'secondary' as const },
   Scheduled: { label: 'Đã hẹn', variant: 'warning' as const },
   Sent: { label: 'Đã gửi', variant: 'success' as const },
 };
 
export function NotificationsDataTab({ colorClasses: _colorClasses }: NotificationsDataTabProps) {
   const notificationsData = useQuery(api.notifications.listAll);
 
   const stats = useMemo(() => {
     const data = notificationsData ?? [];
     const sent = data.filter(n => n.status === 'Sent');
     const scheduled = data.filter(n => n.status === 'Scheduled');
     const drafts = data.filter(n => n.status === 'Draft');
     const totalReads = data.reduce((sum, n) => sum + (n.readCount ?? 0), 0);
     return { drafts: drafts.length, scheduled: scheduled.length, sent: sent.length, total: data.length, totalReads };
   }, [notificationsData]);
 
   const formatDate = (timestamp?: number) => {
     if (!timestamp) return '-';
     return new Date(timestamp).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' });
   };
 
   return (
     <div className="space-y-6">
       <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
         <Card className="p-4">
           <div className="flex items-center gap-3">
             <div className="p-2 bg-rose-500/10 rounded-lg"><Bell className="w-5 h-5 text-rose-600" /></div>
             <div><p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.total}</p><p className="text-sm text-slate-500">Tổng</p></div>
           </div>
         </Card>
         <Card className="p-4">
           <div className="flex items-center gap-3">
             <div className="p-2 bg-green-500/10 rounded-lg"><Send className="w-5 h-5 text-green-600" /></div>
             <div><p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.sent}</p><p className="text-sm text-slate-500">Đã gửi</p></div>
           </div>
         </Card>
         <Card className="p-4">
           <div className="flex items-center gap-3">
             <div className="p-2 bg-amber-500/10 rounded-lg"><Clock className="w-5 h-5 text-amber-600" /></div>
             <div><p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.scheduled}</p><p className="text-sm text-slate-500">Đã hẹn</p></div>
           </div>
         </Card>
         <Card className="p-4">
           <div className="flex items-center gap-3">
             <div className="p-2 bg-slate-500/10 rounded-lg"><Bell className="w-5 h-5 text-slate-600" /></div>
             <div><p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.drafts}</p><p className="text-sm text-slate-500">Bản nháp</p></div>
           </div>
         </Card>
         <Card className="p-4">
           <div className="flex items-center gap-3">
             <div className="p-2 bg-blue-500/10 rounded-lg"><CheckCircle className="w-5 h-5 text-blue-600" /></div>
             <div><p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.totalReads.toLocaleString()}</p><p className="text-sm text-slate-500">Lượt đọc</p></div>
           </div>
         </Card>
       </div>
 
       <Card>
         <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
           <Bell className="w-5 h-5 text-rose-500" />
           <h3 className="font-semibold text-slate-900 dark:text-slate-100">Danh sách thông báo ({notificationsData?.length ?? 0})</h3>
         </div>
         <Table>
           <TableHeader>
             <TableRow>
               <TableHead className="w-[40px]">Loại</TableHead>
               <TableHead>Tiêu đề</TableHead>
               <TableHead>Đối tượng</TableHead>
               <TableHead>Trạng thái</TableHead>
               <TableHead className="text-right">Đã đọc</TableHead>
               <TableHead>Thời gian</TableHead>
             </TableRow>
           </TableHeader>
           <TableBody>
             {notificationsData?.slice(0, 10).map(notif => {
               const typeConfig = TYPE_CONFIG[notif.type as keyof typeof TYPE_CONFIG];
               const statusConfig = STATUS_CONFIG[notif.status as keyof typeof STATUS_CONFIG];
               const TypeIcon = typeConfig?.icon || Bell;
               return (
                 <TableRow key={notif._id}>
                   <TableCell>
                     <div className={`w-8 h-8 rounded-lg ${typeConfig?.bg} flex items-center justify-center`}>
                       <TypeIcon size={16} className={typeConfig?.color} />
                     </div>
                   </TableCell>
                   <TableCell>
                     <div className="font-medium max-w-[250px] truncate">{notif.title}</div>
                     <div className="text-xs text-slate-500 max-w-[250px] truncate">{notif.content}</div>
                   </TableCell>
                   <TableCell>
                     <Badge variant="outline">{notif.targetType}</Badge>
                     {notif.sendEmail && <span className="ml-1 text-xs text-rose-500">&#128231;</span>}
                   </TableCell>
                   <TableCell><Badge variant={statusConfig?.variant}>{statusConfig?.label}</Badge></TableCell>
                   <TableCell className="text-right text-slate-500">{notif.readCount?.toLocaleString() ?? 0}</TableCell>
                   <TableCell className="text-slate-500 text-sm">
                     {notif.status === 'Sent' ? formatDate(notif.sentAt) : (notif.status === 'Scheduled' ? formatDate(notif.scheduledAt) : '-')}
                   </TableCell>
                 </TableRow>
               );
             })}
             {(!notificationsData || notificationsData.length === 0) && (
               <TableRow><TableCell colSpan={6} className="text-center py-8 text-slate-500">Chưa có thông báo nào.</TableCell></TableRow>
             )}
           </TableBody>
         </Table>
         {notificationsData && notificationsData.length > 10 && (
           <div className="p-3 border-t border-slate-100 dark:border-slate-800 text-sm text-slate-500 text-center">Hiển thị 10 / {notificationsData.length} thông báo</div>
         )}
       </Card>
     </div>
   );
 }
