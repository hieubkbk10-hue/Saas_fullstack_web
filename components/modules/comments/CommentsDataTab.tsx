 'use client';
 
 import React, { useMemo, useState } from 'react';
 import { useMutation, useQuery } from 'convex/react';
 import { api } from '@/convex/_generated/api';
 import { toast } from 'sonner';
 import { Database, FileText, Loader2, MessageSquare, Package, RefreshCw, Settings, Trash2 } from 'lucide-react';
 import { Badge, Button, Card, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/admin/components/ui';
 
 interface CommentsDataTabProps {
   colorClasses: { button: string };
 }
 
 export function CommentsDataTab({ colorClasses }: CommentsDataTabProps) {
   const [isSeeding, setIsSeeding] = useState(false);
   const [isClearing, setIsClearing] = useState(false);
 
   const commentsData = useQuery(api.comments.listAll, {});
   const postsData = useQuery(api.posts.listAll, {});
   const productsData = useQuery(api.products.listAll, {});
 
   const seedCommentsModule = useMutation(api.seed.seedCommentsModule);
   const seedComments = useMutation(api.seed.seedComments);
   const clearComments = useMutation(api.seed.clearComments);
   const clearCommentsConfig = useMutation(api.seed.clearCommentsConfig);
   const seedPostsModule = useMutation(api.seed.seedPostsModule);
   const seedProductsModule = useMutation(api.seed.seedProductsModule);
 
   const postMap = useMemo(() => {
     const map: Record<string, string> = {};
     postsData?.forEach(post => { map[post._id] = post.title; });
     return map;
   }, [postsData]);
 
   const productMap = useMemo(() => {
     const map: Record<string, string> = {};
     productsData?.forEach(product => { map[product._id] = product.name; });
     return map;
   }, [productsData]);
 
   const stats = useMemo(() => {
     const total = commentsData?.length ?? 0;
     const postComments = commentsData?.filter(c => c.targetType === 'post').length ?? 0;
     const productComments = commentsData?.filter(c => c.targetType === 'product').length ?? 0;
     const pending = commentsData?.filter(c => c.status === 'Pending').length ?? 0;
     const approved = commentsData?.filter(c => c.status === 'Approved').length ?? 0;
     const spam = commentsData?.filter(c => c.status === 'Spam').length ?? 0;
     return { approved, pending, postComments, productComments, spam, total };
   }, [commentsData]);
 
   const handleSeedConfig = async () => {
     setIsSeeding(true);
     try {
       await seedCommentsModule();
       toast.success('Đã tạo cấu hình module!');
     } catch (error) {
       toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra');
     } finally {
       setIsSeeding(false);
     }
   };
 
   const handleSeedData = async () => {
     setIsSeeding(true);
     try {
       await seedPostsModule();
       await seedProductsModule();
       await seedComments();
       toast.success('Đã tạo dữ liệu mẫu!');
     } catch (error) {
       toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra');
     } finally {
       setIsSeeding(false);
     }
   };
 
   const handleClearData = async () => {
     if (!confirm('Xóa toàn bộ bình luận?')) return;
     setIsClearing(true);
     try {
       await clearComments();
       toast.success('Đã xóa toàn bộ bình luận!');
     } catch (error) {
       toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra');
     } finally {
       setIsClearing(false);
     }
   };
 
   const handleResetAll = async () => {
     if (!confirm('Reset toàn bộ dữ liệu và cấu hình?')) return;
     setIsClearing(true);
     try {
       await clearComments();
       await clearCommentsConfig();
       await seedCommentsModule();
       await seedPostsModule();
       await seedProductsModule();
       await seedComments();
       toast.success('Đã reset thành công!');
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
             <h3 className="font-semibold text-slate-900 dark:text-slate-100">Quản lý dữ liệu</h3>
             <p className="text-sm text-slate-500 mt-1">Seed, clear hoặc reset dữ liệu bình luận</p>
           </div>
           <div className="flex gap-2">
             <Button variant="outline" onClick={handleSeedConfig} disabled={isSeeding} className="gap-2">
               {isSeeding ? <Loader2 size={16} className="animate-spin" /> : <Settings size={16} />}
               Seed Config
             </Button>
             <Button variant="outline" onClick={handleSeedData} disabled={isSeeding} className="gap-2">
               {isSeeding ? <Loader2 size={16} className="animate-spin" /> : <Database size={16} />}
               Seed Data
             </Button>
             <Button variant="outline" onClick={handleClearData} disabled={isClearing} className="gap-2 text-red-500 hover:text-red-600">
               {isClearing ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
               Clear
             </Button>
             <Button onClick={handleResetAll} disabled={isClearing || isSeeding} className={`gap-2 ${colorClasses.button} text-white`}>
               <RefreshCw size={16} />
               Reset All
             </Button>
           </div>
         </div>
       </Card>
 
       <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
         <Card className="p-4">
           <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.total}</p>
           <p className="text-sm text-slate-500">Tổng</p>
         </Card>
         <Card className="p-4">
           <div className="flex items-center gap-2">
             <FileText size={16} className="text-blue-500" />
             <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.postComments}</p>
           </div>
           <p className="text-sm text-slate-500">Bài viết</p>
         </Card>
         <Card className="p-4">
           <div className="flex items-center gap-2">
             <Package size={16} className="text-purple-500" />
             <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.productComments}</p>
           </div>
           <p className="text-sm text-slate-500">Sản phẩm</p>
         </Card>
         <Card className="p-4">
           <p className="text-2xl font-bold text-amber-500">{stats.pending}</p>
           <p className="text-sm text-slate-500">Chờ duyệt</p>
         </Card>
         <Card className="p-4">
           <p className="text-2xl font-bold text-green-500">{stats.approved}</p>
           <p className="text-sm text-slate-500">Đã duyệt</p>
         </Card>
         <Card className="p-4">
           <p className="text-2xl font-bold text-red-500">{stats.spam}</p>
           <p className="text-sm text-slate-500">Spam</p>
         </Card>
       </div>
 
       <Card>
         <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
           <MessageSquare className="w-5 h-5 text-cyan-500" />
           <h3 className="font-semibold text-slate-900 dark:text-slate-100">Bình luận ({stats.total})</h3>
         </div>
         <Table>
           <TableHeader>
             <TableRow>
               <TableHead>Người dùng</TableHead>
               <TableHead>Nội dung</TableHead>
               <TableHead>Đánh giá</TableHead>
               <TableHead>Loại</TableHead>
               <TableHead>Đối tượng</TableHead>
               <TableHead>Trạng thái</TableHead>
             </TableRow>
           </TableHeader>
           <TableBody>
             {commentsData?.slice(0, 15).map(comment => (
               <TableRow key={comment._id}>
                 <TableCell className="font-medium">{comment.authorName}</TableCell>
                 <TableCell className="text-slate-600 dark:text-slate-400 max-w-xs truncate">{comment.content}</TableCell>
                 <TableCell className="text-sm text-slate-500">
                   {comment.rating ? `${comment.rating}/5` : '—'}
                 </TableCell>
                 <TableCell>
                   <Badge variant={comment.targetType === 'post' ? 'secondary' : 'outline'} className="gap-1">
                     {comment.targetType === 'post' ? <FileText size={12} /> : <Package size={12} />}
                     {comment.targetType === 'post' ? 'Bài viết' : 'Sản phẩm'}
                   </Badge>
                 </TableCell>
                 <TableCell className="text-sm text-slate-500 max-w-[150px] truncate">
                   {comment.targetType === 'post' 
                     ? (postMap[comment.targetId] || 'N/A') 
                     : (productMap[comment.targetId] || 'N/A')}
                 </TableCell>
                 <TableCell>
                   <Badge variant={comment.status === 'Approved' ? 'default' : (comment.status === 'Pending' ? 'secondary' : 'destructive')}>
                     {comment.status === 'Approved' ? 'Đã duyệt' : (comment.status === 'Pending' ? 'Chờ duyệt' : 'Spam')}
                   </Badge>
                 </TableCell>
               </TableRow>
             ))}
             {(!commentsData || commentsData.length === 0) && (
               <TableRow>
                 <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                   Chưa có bình luận nào. Nhấn &quot;Seed Data&quot; để tạo dữ liệu mẫu.
                 </TableCell>
               </TableRow>
             )}
           </TableBody>
         </Table>
         {commentsData && commentsData.length > 15 && (
           <div className="p-3 border-t border-slate-100 dark:border-slate-800 text-sm text-slate-500 text-center">
             Hiển thị 15 / {commentsData.length} bình luận
           </div>
         )}
       </Card>
     </div>
   );
 }
