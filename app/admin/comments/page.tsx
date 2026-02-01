'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { Ban, Check, ChevronLeft, ChevronRight, Edit, FileText, Loader2, Package, Plus, RefreshCw, Search, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Badge, Button, Card, Input, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui';
import { SelectCheckbox, SortableHeader, useSortableData } from '../components/TableUtilities';
import { ModuleGuard } from '../components/ModuleGuard';

export default function CommentsListPage() {
  return (
    <ModuleGuard moduleKey="comments" requiredModules={['posts', 'products']} requiredModulesType="any">
      <CommentsContent />
    </ModuleGuard>
  );
}

function CommentsContent() {
  const commentsData = useQuery(api.comments.listAll, {});
  const postsData = useQuery(api.posts.listAll, {});
  const productsData = useQuery(api.products.listAll, {});
  const settingsData = useQuery(api.admin.modules.listModuleSettings, { moduleKey: 'comments' });
  const deleteComment = useMutation(api.comments.remove);
  const approveComment = useMutation(api.comments.approve);
  const markAsSpam = useMutation(api.comments.markAsSpam);
  const bulkUpdateStatus = useMutation(api.comments.bulkUpdateStatus);
  const seedComments = useMutation(api.seed.seedComments);
  const clearComments = useMutation(api.seed.clearComments);
  const seedPostsModule = useMutation(api.seed.seedPostsModule);
  const seedProductsModule = useMutation(api.seed.seedProductsModule);

  const [selectedIds, setSelectedIds] = useState<Id<"comments">[]>([]);
  const [filterType, setFilterType] = useState<'' | 'post' | 'product'>('');
  const [filterStatus, setFilterStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'asc' | 'desc' }>({ direction: 'desc', key: 'created' });
  const [currentPage, setCurrentPage] = useState(1);

  const isLoading = commentsData === undefined;

  // Lấy setting commentsPerPage từ module settings
  const commentsPerPage = useMemo(() => {
    const setting = settingsData?.find(s => s.settingKey === 'commentsPerPage');
    return (setting?.value as number) || 20;
  }, [settingsData]);

  // Map post IDs to titles
  const postMap = useMemo(() => {
    const map: Record<string, string> = {};
    postsData?.forEach(post => { map[post._id] = post.title; });
    return map;
  }, [postsData]);

  // Map product IDs to names
  const productMap = useMemo(() => {
    const map: Record<string, string> = {};
    productsData?.forEach(product => { map[product._id] = product.name; });
    return map;
  }, [productsData]);

  const comments = useMemo(() => {
    let data = commentsData?.map(c => ({
      ...c,
      id: c._id,
      author: c.authorName,
      targetName: c.targetType === 'post' 
        ? (postMap[c.targetId] || 'Bài viết không tồn tại') 
        : (productMap[c.targetId] || 'Sản phẩm không tồn tại'),
      created: c._creationTime,
    })) ?? [];

    // Apply filters
    if (filterType) {
      data = data.filter(c => c.targetType === filterType);
    }
    if (filterStatus) {
      data = data.filter(c => c.status === filterStatus);
    }
    if (searchTerm) {
      data = data.filter(c => 
        c.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return data;
  }, [commentsData, postMap, productMap, filterType, filterStatus, searchTerm]);

  const sortedComments = useSortableData(comments, sortConfig);

  // Pagination
  const totalPages = Math.ceil(sortedComments.length / commentsPerPage);
  const paginatedComments = useMemo(() => {
    const start = (currentPage - 1) * commentsPerPage;
    return sortedComments.slice(start, start + commentsPerPage);
  }, [sortedComments, currentPage, commentsPerPage]);

  // Reset page when filters change
  const handleFilterChange = (setter: (v: string) => void, value: string) => {
    setter(value);
    setCurrentPage(1);
  };

  const handleSort = (key: string) => {
    setSortConfig(prev => ({ direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc', key }));
    setCurrentPage(1);
  };

  const toggleSelectAll = () =>{  setSelectedIds(selectedIds.length === paginatedComments.length ? [] : paginatedComments.map(c => c.id)); };
  const toggleSelectItem = (id: Id<"comments">) =>{  setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]); };

  const handleDelete = async (id: Id<"comments">) => {
    if(confirm('Xóa vĩnh viễn bình luận này?')) {
      try {
        await deleteComment({ id });
        toast.success('Đã xóa bình luận');
      } catch {
        toast.error('Không thể xóa bình luận');
      }
    }
  };

  const handleBulkDelete = async () => {
    if (confirm(`Xóa ${selectedIds.length} bình luận đã chọn?`)) {
      try {
        for (const id of selectedIds) {
          await deleteComment({ id });
        }
        setSelectedIds([]);
        toast.success(`Đã xóa ${selectedIds.length} bình luận`);
      } catch {
        toast.error('Không thể xóa bình luận');
      }
    }
  };

  const handleApprove = async (id: Id<"comments">) => {
    await approveComment({ id });
    toast.success('Đã duyệt bình luận');
  };

  const handleSpam = async (id: Id<"comments">) => {
    await markAsSpam({ id });
    toast.success('Đã đánh dấu spam');
  };

  const handleReset = async () => {
    if (confirm('Reset dữ liệu bình luận?')) {
      await clearComments();
      await seedPostsModule();
      await seedProductsModule();
      await seedComments();
      setSelectedIds([]);
      toast.success('Đã reset dữ liệu bình luận');
    }
  };

  const handleBulkApprove = async () => {
    if (selectedIds.length === 0) {return;}
    try {
      await bulkUpdateStatus({ ids: selectedIds, status: 'Approved' });
      setSelectedIds([]);
      toast.success(`Đã duyệt ${selectedIds.length} bình luận`);
    } catch {
      toast.error('Không thể duyệt bình luận');
    }
  };

  const handleBulkSpam = async () => {
    if (selectedIds.length === 0) {return;}
    try {
      await bulkUpdateStatus({ ids: selectedIds, status: 'Spam' });
      setSelectedIds([]);
      toast.success(`Đã đánh dấu spam ${selectedIds.length} bình luận`);
    } catch {
      toast.error('Không thể đánh dấu spam');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Quản lý bình luận và đánh giá</h1>
          <p className="text-sm text-slate-500">Xem danh sách bình luận và đánh giá mới nhất</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset} className="gap-2"><RefreshCw size={16}/> Reset</Button>
          <Link href="/admin/comments/create"><Button className="gap-2"><Plus size={16}/> Thêm mới</Button></Link>
        </div>
      </div>

      {selectedIds.length > 0 && (
        <Card className="p-3 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-700 dark:text-blue-300">
              Đã chọn {selectedIds.length} bình luận
            </span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="text-green-600 hover:text-green-700 gap-1" onClick={handleBulkApprove}>
                <Check size={14} /> Duyệt
              </Button>
              <Button size="sm" variant="outline" className="text-orange-600 hover:text-orange-700 gap-1" onClick={handleBulkSpam}>
                <Ban size={14} /> Spam
              </Button>
              <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700 gap-1" onClick={handleBulkDelete}>
                <Trash2 size={14} /> Xóa
              </Button>
              <Button size="sm" variant="ghost" onClick={() =>{  setSelectedIds([]); }}>Bỏ chọn</Button>
            </div>
          </div>
        </Card>
      )}

      <Card>
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-4">
          <div className="relative max-w-xs">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input placeholder="Tìm kiếm..." className="pl-9 w-48" value={searchTerm} onChange={(e) =>{  setSearchTerm(e.target.value); }} />
          </div>
          <select className="h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm" value={filterType} onChange={(e) =>{  handleFilterChange((v) =>{  setFilterType(v as '' | 'post' | 'product'); }, e.target.value); }}>
            <option value="">Tất cả loại</option>
            <option value="post">Bình luận bài viết</option>
            <option value="product">Đánh giá sản phẩm</option>
          </select>
          <select className="h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm" value={filterStatus} onChange={(e) =>{  handleFilterChange(setFilterStatus, e.target.value); }}>
            <option value="">Tất cả trạng thái</option>
            <option value="Approved">Đã duyệt</option>
            <option value="Pending">Chờ duyệt</option>
            <option value="Spam">Spam</option>
          </select>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]"><SelectCheckbox checked={selectedIds.length === paginatedComments.length && paginatedComments.length > 0} onChange={toggleSelectAll} indeterminate={selectedIds.length > 0 && selectedIds.length < paginatedComments.length} /></TableHead>
              <SortableHeader label="Người dùng" sortKey="author" sortConfig={sortConfig} onSort={handleSort} className="w-[180px]" />
              <TableHead>Nội dung</TableHead>
              <TableHead className="w-[90px]">Đánh giá</TableHead>
              <TableHead className="w-[80px]">Loại</TableHead>
              <TableHead className="w-[180px]">Bài viết / Sản phẩm</TableHead>
              <SortableHeader label="Trạng thái" sortKey="status" sortConfig={sortConfig} onSort={handleSort} className="w-[100px]" />
              <SortableHeader label="Thời gian" sortKey="created" sortConfig={sortConfig} onSort={handleSort} className="w-[120px]" />
              <TableHead className="text-right w-[140px]">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedComments.map(comment => (
              <TableRow key={comment.id} className={selectedIds.includes(comment.id) ? 'bg-blue-500/5' : ''}>
                <TableCell><SelectCheckbox checked={selectedIds.includes(comment.id)} onChange={() =>{  toggleSelectItem(comment.id); }} /></TableCell>
                <TableCell>
                  <div className="font-medium">{comment.author}</div>
                  <div className="text-xs text-slate-400">IP: {comment.authorIp ?? 'N/A'}</div>
                </TableCell>
                <TableCell><p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-2">{comment.content}</p></TableCell>
                <TableCell className="text-sm text-slate-500">{comment.rating ? `${comment.rating}/5` : '—'}</TableCell>
                <TableCell>
                  <Badge variant={comment.targetType === 'post' ? 'secondary' : 'outline'} className="gap-1 whitespace-nowrap">
                    {comment.targetType === 'post' ? <FileText size={12} /> : <Package size={12} />}
                    {comment.targetType === 'post' ? 'Bài viết' : 'Sản phẩm'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 truncate max-w-[180px]">
                    {comment.targetName}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={comment.status === 'Approved' ? 'default' : (comment.status === 'Pending' ? 'secondary' : 'destructive')} className="whitespace-nowrap">
                    {comment.status === 'Approved' ? 'Đã duyệt' : (comment.status === 'Pending' ? 'Chờ duyệt' : 'Spam')}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-slate-500">{new Date(comment.created).toLocaleString('vi-VN')}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    {comment.status !== 'Approved' && (
                      <Button variant="ghost" size="icon" className="text-green-500 hover:text-green-600" title="Duyệt" onClick={ async () => handleApprove(comment.id)}><Check size={16}/></Button>
                    )}
                    {comment.status !== 'Spam' && (
                      <Button variant="ghost" size="icon" className="text-orange-500 hover:text-orange-600" title="Đánh dấu spam" onClick={ async () => handleSpam(comment.id)}><Ban size={16}/></Button>
                    )}
                    <Link href={`/admin/comments/${comment.id}/edit`}>
                      <Button variant="ghost" size="icon" title="Chỉnh sửa"><Edit size={16}/></Button>
                    </Link>
                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" title="Xóa" onClick={ async () => handleDelete(comment.id)}><Trash2 size={16}/></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {paginatedComments.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center text-slate-500">
                  {filterType || filterStatus || searchTerm ? 'Không tìm thấy kết quả phù hợp' : 'Không có bình luận nào. Nhấn Reset để tạo dữ liệu mẫu.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {sortedComments.length > 0 && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-sm text-slate-500">
              Hiển thị {(currentPage - 1) * commentsPerPage + 1} - {Math.min(currentPage * commentsPerPage, sortedComments.length)} / {sortedComments.length} bình luận
            </span>
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={currentPage === 1}
                  onClick={() =>{  setCurrentPage(p => p - 1); }}
                >
                  <ChevronLeft size={16} />
                </Button>
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  Trang {currentPage} / {totalPages}
                </span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={currentPage === totalPages}
                  onClick={() =>{  setCurrentPage(p => p + 1); }}
                >
                  <ChevronRight size={16} />
                </Button>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
