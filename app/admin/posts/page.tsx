'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Plus, Edit, Trash2, ExternalLink, Search, Loader2, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { Button, Card, Badge, Input, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui';
import { SortableHeader, BulkActionBar, SelectCheckbox, useSortableData } from '../components/TableUtilities';
import { ModuleGuard } from '../components/ModuleGuard';

export default function PostsListPage() {
  return (
    <ModuleGuard moduleKey="posts">
      <PostsContent />
    </ModuleGuard>
  );
}

function PostsContent() {
  const postsData = useQuery(api.posts.listAll, {});
  const categoriesData = useQuery(api.postCategories.listAll, {});
  const settingsData = useQuery(api.admin.modules.listModuleSettings, { moduleKey: 'posts' });
  const deletePost = useMutation(api.posts.remove);
  const seedPostsModule = useMutation(api.seed.seedPostsModule);
  const clearPostsData = useMutation(api.seed.clearPostsData);
  
  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'asc' | 'desc' }>({ key: null, direction: 'asc' });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedIds, setSelectedIds] = useState<Id<"posts">[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const isLoading = postsData === undefined || categoriesData === undefined;

  // Lấy setting postsPerPage từ module settings
  const postsPerPage = useMemo(() => {
    const setting = settingsData?.find(s => s.settingKey === 'postsPerPage');
    return (setting?.value as number) || 10;
  }, [settingsData]);

  // Map category ID to name
  const categoryMap = useMemo(() => {
    const map: Record<string, string> = {};
    categoriesData?.forEach(cat => { map[cat._id] = cat.name; });
    return map;
  }, [categoriesData]);

  const posts = useMemo(() => {
    return postsData?.map(post => ({
      ...post,
      id: post._id,
      category: categoryMap[post.categoryId] || 'Không có',
    })) || [];
  }, [postsData, categoryMap]);

  const filteredPosts = useMemo(() => {
    let data = [...posts];
    if (searchTerm) {
      data = data.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    if (filterStatus) {
      data = data.filter(p => p.status === filterStatus);
    }
    return data;
  }, [posts, searchTerm, filterStatus]);

  const sortedPosts = useSortableData(filteredPosts, sortConfig);

  // Pagination
  const totalPages = Math.ceil(sortedPosts.length / postsPerPage);
  const paginatedPosts = useMemo(() => {
    const start = (currentPage - 1) * postsPerPage;
    return sortedPosts.slice(start, start + postsPerPage);
  }, [sortedPosts, currentPage, postsPerPage]);

  const handleSort = (key: string) => {
    setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc' }));
    setCurrentPage(1);
  };

  const handleFilterChange = (value: string) => {
    setFilterStatus(value);
    setCurrentPage(1);
  };

  const toggleSelectAll = () => setSelectedIds(selectedIds.length === paginatedPosts.length ? [] : paginatedPosts.map(p => p._id));
  const toggleSelectItem = (id: Id<"posts">) => setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

  const handleDelete = async (id: Id<"posts">) => {
    if (confirm('Xóa bài viết này?')) {
      try {
        await deletePost({ id });
        toast.success('Đã xóa bài viết');
      } catch {
        toast.error('Có lỗi khi xóa bài viết');
      }
    }
  };

  const handleBulkDelete = async () => {
    if (confirm(`Xóa ${selectedIds.length} bài viết đã chọn?`)) {
      try {
        for (const id of selectedIds) {
          await deletePost({ id });
        }
        setSelectedIds([]);
        toast.success(`Đã xóa ${selectedIds.length} bài viết`);
      } catch {
        toast.error('Có lỗi khi xóa bài viết');
      }
    }
  };

  const handleReseed = async () => {
    if (confirm('Xóa tất cả bài viết và seed lại dữ liệu mẫu?')) {
      try {
        await clearPostsData();
        await seedPostsModule();
        toast.success('Đã reset dữ liệu bài viết');
      } catch {
        toast.error('Có lỗi khi reset dữ liệu');
      }
    }
  };

  const openFrontend = (slug: string) => {
    window.open(`/posts/${slug}`, '_blank');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Quản lý bài viết</h1>
        <div className="flex gap-1.5">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={handleReseed} title="Reset dữ liệu mẫu">
            <RefreshCw size={14}/> Reset
          </Button>
          <Link href="/admin/posts/create"><Button size="sm" className="gap-1.5"><Plus size={14}/> Thêm mới</Button></Link>
        </div>
      </div>

      <BulkActionBar selectedCount={selectedIds.length} onDelete={handleBulkDelete} onClearSelection={() => setSelectedIds([])} />

      <Card>
        <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-2">
          <div className="relative max-w-xs flex-1">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input placeholder="Tìm kiếm bài viết..." className="pl-8 h-9 text-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <select className="h-9 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-sm" value={filterStatus} onChange={(e) => handleFilterChange(e.target.value)}>
            <option value="">Tất cả trạng thái</option>
            <option value="Published">Đã xuất bản</option>
            <option value="Draft">Bản nháp</option>
            <option value="Archived">Lưu trữ</option>
          </select>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[36px] py-2"><SelectCheckbox checked={selectedIds.length === paginatedPosts.length && paginatedPosts.length > 0} onChange={toggleSelectAll} indeterminate={selectedIds.length > 0 && selectedIds.length < paginatedPosts.length} /></TableHead>
              <TableHead className="w-[70px] py-2">Ảnh</TableHead>
              <SortableHeader label="Tiêu đề" sortKey="title" sortConfig={sortConfig} onSort={handleSort} className="py-2" />
              <SortableHeader label="Danh mục" sortKey="category" sortConfig={sortConfig} onSort={handleSort} className="py-2" />
              <SortableHeader label="Lượt xem" sortKey="views" sortConfig={sortConfig} onSort={handleSort} className="py-2" />
              <SortableHeader label="Trạng thái" sortKey="status" sortConfig={sortConfig} onSort={handleSort} className="py-2" />
              <TableHead className="text-right py-2">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedPosts.map(post => (
              <TableRow key={post._id} className={selectedIds.includes(post._id) ? 'bg-blue-500/5' : ''}>
                <TableCell className="py-2.5"><SelectCheckbox checked={selectedIds.includes(post._id)} onChange={() => toggleSelectItem(post._id)} /></TableCell>
                <TableCell className="py-2.5">
                  {post.thumbnail ? (
                    <img src={post.thumbnail} className="w-10 h-7 object-cover rounded" alt="" />
                  ) : (
                    <div className="w-10 h-7 bg-slate-200 dark:bg-slate-700 rounded flex items-center justify-center text-[10px] text-slate-400">No img</div>
                  )}
                </TableCell>
                <TableCell className="py-2.5 font-medium max-w-[300px] truncate text-sm">{post.title}</TableCell>
                <TableCell className="py-2.5 text-sm">{post.category}</TableCell>
                <TableCell className="py-2.5 text-slate-500 text-sm">{post.views.toLocaleString()}</TableCell>
                <TableCell className="py-2.5">
                  <Badge variant={post.status === 'Published' ? 'success' : post.status === 'Draft' ? 'secondary' : 'warning'} className="text-xs">
                    {post.status === 'Published' ? 'Đã xuất bản' : post.status === 'Draft' ? 'Bản nháp' : 'Lưu trữ'}
                  </Badge>
                </TableCell>
                <TableCell className="py-2.5 text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-blue-600 hover:text-blue-700" title="Xem bài viết" onClick={() => openFrontend(post.slug)}><ExternalLink size={14}/></Button>
                    <Link href={`/admin/posts/${post._id}/edit`}><Button variant="ghost" size="icon" className="h-7 w-7"><Edit size={14}/></Button></Link>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-600" onClick={() => handleDelete(post._id)}><Trash2 size={14}/></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {paginatedPosts.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6 text-slate-500 text-sm">
                  {searchTerm || filterStatus ? 'Không tìm thấy kết quả phù hợp' : 'Chưa có bài viết nào'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {sortedPosts.length > 0 && (
          <div className="p-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              Hiển thị {(currentPage - 1) * postsPerPage + 1} - {Math.min(currentPage * postsPerPage, sortedPosts.length)} / {sortedPosts.length} bài viết
            </span>
            {totalPages > 1 && (
              <div className="flex items-center gap-1.5">
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                  className="h-7 px-2"
                >
                  <ChevronLeft size={14} />
                </Button>
                <span className="text-slate-600 dark:text-slate-400 px-1">
                  Trang {currentPage} / {totalPages}
                </span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => p + 1)}
                  className="h-7 px-2"
                >
                  <ChevronRight size={14} />
                </Button>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
