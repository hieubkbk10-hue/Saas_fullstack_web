 'use client';
 
 import React, { useMemo, useState } from 'react';
 import { useMutation, usePaginatedQuery, useQuery } from 'convex/react';
 import { api } from '@/convex/_generated/api';
 import { toast } from 'sonner';
 import { Database, FileText, FolderTree, Loader2, MessageSquare, RefreshCw, Trash2 } from 'lucide-react';
 import { Badge, Button, Card, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/admin/components/ui';
import { getSeedModuleInfo } from '@/lib/modules/seed-registry';
 
 interface PostsDataTabProps {
   colorClasses: { button: string };
 }
 
 export function PostsDataTab({ colorClasses }: PostsDataTabProps) {
   const [isSeeding, setIsSeeding] = useState(false);
   const [isClearing, setIsClearing] = useState(false);
   
   const { results: postsData, status: postsStatus, loadMore: loadMorePosts } = usePaginatedQuery(
     api.posts.list,
     {},
     { initialNumItems: 10 }
   );
   const categoriesData = useQuery(api.postCategories.listAll, { limit: 50 });
   const { results: commentsData, status: commentsStatus, loadMore: loadMoreComments } = usePaginatedQuery(
     api.comments.listByTargetTypePaginated,
     { targetType: "post" },
     { initialNumItems: 10 }
   );
   
  const seedModule = useMutation(api.seedManager.seedModule);
  const clearModule = useMutation(api.seedManager.clearModule);

  const defaultQuantity = getSeedModuleInfo('posts')?.defaultQuantity ?? 10;
  const commentQuantity = getSeedModuleInfo('comments')?.defaultQuantity ?? 10;
   
   const categoryMap = useMemo(() => {
     const map: Record<string, string> = {};
     categoriesData?.forEach(cat => { map[cat._id] = cat.name; });
     return map;
   }, [categoriesData]);
   
   const handleSeedAll = async () => {
     setIsSeeding(true);
     try {
      await seedModule({ module: 'posts', quantity: defaultQuantity });
      await seedModule({ module: 'comments', quantity: commentQuantity });
       toast.success('Đã tạo dữ liệu mẫu!');
     } catch (error) {
       toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra');
     } finally {
       setIsSeeding(false);
     }
   };
   
   const handleClearAll = async () => {
     if (!confirm('Xóa toàn bộ dữ liệu?')) return;
     setIsClearing(true);
     try {
      await clearModule({ module: 'comments' });
      await clearModule({ module: 'posts' });
       toast.success('Đã xóa dữ liệu!');
     } catch (error) {
       toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra');
     } finally {
       setIsClearing(false);
     }
   };
   
   const handleReset = async () => {
     if (!confirm('Reset toàn bộ dữ liệu?')) return;
     setIsClearing(true);
     try {
      await clearModule({ module: 'comments' });
      await clearModule({ module: 'posts' });
      await seedModule({ module: 'posts', quantity: defaultQuantity, force: true });
      await seedModule({ module: 'comments', quantity: commentQuantity, force: true });
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
             <p className="text-sm text-slate-500 mt-1">Seed, clear hoặc reset dữ liệu module</p>
           </div>
           <div className="flex gap-2">
             <Button variant="outline" onClick={handleSeedAll} disabled={isSeeding} className="gap-2">
               {isSeeding ? <Loader2 size={16} className="animate-spin" /> : <Database size={16} />}
               Seed Data
             </Button>
             <Button variant="outline" onClick={handleClearAll} disabled={isClearing} className="gap-2 text-red-500 hover:text-red-600">
               {isClearing ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
               Clear All
             </Button>
             <Button onClick={handleReset} disabled={isClearing || isSeeding} className={`gap-2 ${colorClasses.button} text-white`}>
               <RefreshCw size={16} /> Reset
             </Button>
           </div>
         </div>
       </Card>
 
       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         <Card className="p-4">
           <div className="flex items-center gap-3">
             <div className="p-2 bg-cyan-500/10 rounded-lg">
               <FileText className="w-5 h-5 text-cyan-600" />
             </div>
             <div>
               <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{postsData?.length ?? 0}{postsStatus === 'CanLoadMore' ? '+' : ''}</p>
               <p className="text-sm text-slate-500">Bài viết</p>
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
         <Card className="p-4">
           <div className="flex items-center gap-3">
             <div className="p-2 bg-amber-500/10 rounded-lg">
               <MessageSquare className="w-5 h-5 text-amber-600" />
             </div>
             <div>
               <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{commentsData?.length ?? 0}{commentsStatus === 'CanLoadMore' ? '+' : ''}</p>
               <p className="text-sm text-slate-500">Bình luận</p>
             </div>
           </div>
         </Card>
       </div>
 
       <Card>
         <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
           <FileText className="w-5 h-5 text-cyan-500" />
           <h3 className="font-semibold text-slate-900 dark:text-slate-100">Bài viết ({postsData?.length ?? 0}{postsStatus === 'CanLoadMore' ? '+' : ''})</h3>
         </div>
         <Table>
           <TableHeader>
             <TableRow>
               <TableHead>Tiêu đề</TableHead>
               <TableHead>Danh mục</TableHead>
               <TableHead>Trạng thái</TableHead>
               <TableHead className="text-right">Lượt xem</TableHead>
             </TableRow>
           </TableHeader>
           <TableBody>
             {postsData?.map(post => (
               <TableRow key={post._id}>
                 <TableCell className="font-medium">{post.title}</TableCell>
                 <TableCell><Badge variant="secondary">{categoryMap[post.categoryId] || 'N/A'}</Badge></TableCell>
                 <TableCell>
                   <Badge variant={post.status === 'Published' ? 'default' : 'secondary'}>
                     {post.status === 'Published' ? 'Xuất bản' : 'Nháp'}
                   </Badge>
                 </TableCell>
                 <TableCell className="text-right">{post.views?.toLocaleString() ?? 0}</TableCell>
               </TableRow>
             ))}
             {(!postsData || postsData.length === 0) && (
               <TableRow>
                 <TableCell colSpan={4} className="text-center py-8 text-slate-500">
                   Chưa có bài viết. Nhấn &quot;Seed Data&quot; để tạo dữ liệu mẫu.
                 </TableCell>
               </TableRow>
             )}
           </TableBody>
         </Table>
         {postsStatus === 'CanLoadMore' && (
           <div className="p-3 border-t border-slate-100 dark:border-slate-800 text-center">
             <Button variant="ghost" size="sm" onClick={() => loadMorePosts(10)}>Tải thêm bài viết</Button>
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
               <TableHead className="text-right">Số bài viết</TableHead>
             </TableRow>
           </TableHeader>
           <TableBody>
             {categoriesData?.map(cat => {
               const postCount = postsData?.filter(p => p.categoryId === cat._id).length ?? 0;
               return (
                 <TableRow key={cat._id}>
                   <TableCell className="font-medium">{cat.name}</TableCell>
                   <TableCell className="text-slate-500 font-mono text-sm">{cat.slug}</TableCell>
                   <TableCell>
                     <Badge variant={cat.active ? 'default' : 'secondary'}>{cat.active ? 'Hoạt động' : 'Ẩn'}</Badge>
                   </TableCell>
                   <TableCell className="text-right">{postCount}</TableCell>
                 </TableRow>
               );
             })}
             {(!categoriesData || categoriesData.length === 0) && (
               <TableRow>
                 <TableCell colSpan={4} className="text-center py-8 text-slate-500">Chưa có danh mục.</TableCell>
               </TableRow>
             )}
           </TableBody>
         </Table>
       </Card>
 
       <Card>
         <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
           <MessageSquare className="w-5 h-5 text-amber-500" />
           <h3 className="font-semibold text-slate-900 dark:text-slate-100">Bình luận ({commentsData?.length ?? 0}{commentsStatus === 'CanLoadMore' ? '+' : ''})</h3>
         </div>
         <Table>
           <TableHeader>
             <TableRow>
               <TableHead>Người bình luận</TableHead>
               <TableHead>Nội dung</TableHead>
               <TableHead>Trạng thái</TableHead>
             </TableRow>
           </TableHeader>
           <TableBody>
             {commentsData?.map(comment => (
               <TableRow key={comment._id}>
                 <TableCell className="font-medium">{comment.authorName}</TableCell>
                 <TableCell className="text-slate-600 dark:text-slate-400 max-w-xs truncate">{comment.content}</TableCell>
                 <TableCell>
                   <Badge variant={comment.status === 'Approved' ? 'default' : (comment.status === 'Pending' ? 'secondary' : 'destructive')}>
                     {comment.status === 'Approved' ? 'Đã duyệt' : (comment.status === 'Pending' ? 'Chờ duyệt' : 'Spam')}
                   </Badge>
                 </TableCell>
               </TableRow>
             ))}
             {(!commentsData || commentsData.length === 0) && (
               <TableRow>
                 <TableCell colSpan={3} className="text-center py-8 text-slate-500">Chưa có bình luận.</TableCell>
               </TableRow>
             )}
           </TableBody>
         </Table>
         {commentsStatus === 'CanLoadMore' && (
           <div className="p-3 border-t border-slate-100 dark:border-slate-800 text-center">
             <Button variant="ghost" size="sm" onClick={() => loadMoreComments(10)}>Tải thêm bình luận</Button>
           </div>
         )}
       </Card>
     </div>
   );
 }
