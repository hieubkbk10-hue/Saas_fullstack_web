 'use client';
 
 import React from 'react';
 import { useQuery } from 'convex/react';
 import { api } from '@/convex/_generated/api';
import { FileText, FileVideo, FolderTree, HardDrive, Image as ImageIcon } from 'lucide-react';
import { Badge, Card, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/admin/components/ui';
 
 interface MediaDataTabProps {
   colorClasses: { button: string };
 }
 
 function formatBytes(bytes: number): string {
   if (bytes === 0) return '0 B';
   const k = 1024;
   const sizes = ['B', 'KB', 'MB', 'GB'];
   const i = Math.floor(Math.log(bytes) / Math.log(k));
   return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
 }
 
export function MediaDataTab({ colorClasses: _colorClasses }: MediaDataTabProps) {
   const mediaData = useQuery(api.media.listAll);
   const statsData = useQuery(api.media.getStats);
   const foldersData = useQuery(api.media.getFolders);
 
   return (
     <div className="space-y-6">
       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         <Card className="p-4">
           <div className="flex items-center gap-3">
             <div className="p-2 bg-cyan-500/10 rounded-lg"><ImageIcon className="w-5 h-5 text-cyan-600" /></div>
             <div><p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{statsData?.imageCount ?? 0}</p><p className="text-sm text-slate-500">Hình ảnh</p></div>
           </div>
         </Card>
         <Card className="p-4">
           <div className="flex items-center gap-3">
             <div className="p-2 bg-purple-500/10 rounded-lg"><FileVideo className="w-5 h-5 text-purple-600" /></div>
             <div><p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{statsData?.videoCount ?? 0}</p><p className="text-sm text-slate-500">Video</p></div>
           </div>
         </Card>
         <Card className="p-4">
           <div className="flex items-center gap-3">
             <div className="p-2 bg-amber-500/10 rounded-lg"><FileText className="w-5 h-5 text-amber-600" /></div>
             <div><p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{statsData?.documentCount ?? 0}</p><p className="text-sm text-slate-500">Tài liệu</p></div>
           </div>
         </Card>
         <Card className="p-4">
           <div className="flex items-center gap-3">
             <div className="p-2 bg-emerald-500/10 rounded-lg"><HardDrive className="w-5 h-5 text-emerald-600" /></div>
             <div><p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{formatBytes(statsData?.totalSize ?? 0)}</p><p className="text-sm text-slate-500">Tổng dung lượng</p></div>
           </div>
         </Card>
       </div>
 
       {foldersData && foldersData.length > 0 && (
         <Card className="p-4">
           <div className="flex items-center gap-2 mb-3"><FolderTree className="w-5 h-5 text-cyan-500" /><h3 className="font-semibold text-slate-900 dark:text-slate-100">Thư mục ({foldersData.length})</h3></div>
           <div className="flex flex-wrap gap-2">{foldersData.map(folder => <Badge key={folder} variant="secondary">{folder}</Badge>)}</div>
         </Card>
       )}
 
       <Card>
         <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
           <ImageIcon className="w-5 h-5 text-cyan-500" />
           <h3 className="font-semibold text-slate-900 dark:text-slate-100">Media ({mediaData?.length ?? 0})</h3>
         </div>
         <Table>
           <TableHeader>
             <TableRow>
               <TableHead>Tên file</TableHead>
               <TableHead>Loại</TableHead>
               <TableHead>Thư mục</TableHead>
               <TableHead className="text-right">Kích thước</TableHead>
             </TableRow>
           </TableHeader>
           <TableBody>
             {mediaData?.slice(0, 10).map(media => (
               <TableRow key={media._id}>
                 <TableCell className="font-medium max-w-xs truncate">{media.filename}</TableCell>
                 <TableCell>
                   <Badge variant={media.mimeType.startsWith('image/') ? 'default' : (media.mimeType.startsWith('video/') ? 'secondary' : 'outline')}>
                     {media.mimeType.split('/')[1]?.toUpperCase() || media.mimeType}
                   </Badge>
                 </TableCell>
                 <TableCell className="text-slate-500">{media.folder ?? '-'}</TableCell>
                 <TableCell className="text-right">{formatBytes(media.size)}</TableCell>
               </TableRow>
             ))}
             {(!mediaData || mediaData.length === 0) && (
               <TableRow><TableCell colSpan={4} className="text-center py-8 text-slate-500">Chưa có media nào.</TableCell></TableRow>
             )}
           </TableBody>
         </Table>
         {mediaData && mediaData.length > 10 && (
           <div className="p-3 border-t border-slate-100 dark:border-slate-800 text-sm text-slate-500 text-center">Hiển thị 10 / {mediaData.length} files</div>
         )}
       </Card>
     </div>
   );
 }
