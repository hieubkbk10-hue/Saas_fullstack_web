'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash2, ExternalLink, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Button, Card, Badge, Input, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui';
import { SortableHeader, BulkActionBar, SelectCheckbox, useSortableData } from '../components/TableUtilities';
import { mockPosts } from '../mockData';

export default function PostsListPage() {
  const [posts, setPosts] = useState(mockPosts);
  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'asc' | 'desc' }>({ key: null, direction: 'asc' });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

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

  const handleSort = (key: string) => {
    setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc' }));
  };

  const toggleSelectAll = () => setSelectedIds(selectedIds.length === sortedPosts.length ? [] : sortedPosts.map(p => p.id));
  const toggleSelectItem = (id: string) => setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

  const handleDelete = (id: string) => {
    if (confirm('Xóa bài viết này?')) {
      setPosts(prev => prev.filter(p => p.id !== id));
      toast.success('Đã xóa bài viết');
    }
  };

  const handleBulkDelete = () => {
    if (confirm(`Xóa ${selectedIds.length} bài viết đã chọn?`)) {
      setPosts(prev => prev.filter(p => !selectedIds.includes(p.id)));
      setSelectedIds([]);
      toast.success(`Đã xóa ${selectedIds.length} bài viết`);
    }
  };

  const openFrontend = (id: string) => {
    window.open(`https://example.com/post/${id}`, '_blank');
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Quản lý bài viết</h1>
        <Link href="/admin/posts/create"><Button className="gap-2"><Plus size={16}/> Thêm mới</Button></Link>
      </div>

      <BulkActionBar selectedCount={selectedIds.length} onDelete={handleBulkDelete} onClearSelection={() => setSelectedIds([])} />

      <Card>
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-4">
          <div className="relative max-w-xs flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input placeholder="Tìm kiếm bài viết..." className="pl-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <select className="h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="">Tất cả trạng thái</option>
            <option value="Published">Đã xuất bản</option>
            <option value="Draft">Bản nháp</option>
            <option value="Archived">Lưu trữ</option>
          </select>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]"><SelectCheckbox checked={selectedIds.length === sortedPosts.length && sortedPosts.length > 0} onChange={toggleSelectAll} indeterminate={selectedIds.length > 0 && selectedIds.length < sortedPosts.length} /></TableHead>
              <TableHead className="w-[80px]">Thumbnail</TableHead>
              <SortableHeader label="Tiêu đề" sortKey="title" sortConfig={sortConfig} onSort={handleSort} />
              <SortableHeader label="Danh mục" sortKey="category" sortConfig={sortConfig} onSort={handleSort} />
              <SortableHeader label="Trạng thái" sortKey="status" sortConfig={sortConfig} onSort={handleSort} />
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedPosts.map(post => (
              <TableRow key={post.id} className={selectedIds.includes(post.id) ? 'bg-blue-500/5' : ''}>
                <TableCell><SelectCheckbox checked={selectedIds.includes(post.id)} onChange={() => toggleSelectItem(post.id)} /></TableCell>
                <TableCell><img src={post.thumbnail} className="w-12 h-8 object-cover rounded" alt="" /></TableCell>
                <TableCell className="font-medium max-w-[300px] truncate">{post.title}</TableCell>
                <TableCell>{post.category}</TableCell>
                <TableCell>
                  <Badge variant={post.status === 'Published' ? 'success' : 'secondary'}>
                    {post.status === 'Published' ? 'Đã xuất bản' : post.status === 'Draft' ? 'Bản nháp' : 'Lưu trữ'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" className="text-blue-600 hover:text-blue-700" title="Xem bài viết" onClick={() => openFrontend(post.id)}><ExternalLink size={16}/></Button>
                    <Link href={`/admin/posts/${post.id}/edit`}><Button variant="ghost" size="icon"><Edit size={16}/></Button></Link>
                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => handleDelete(post.id)}><Trash2 size={16}/></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {sortedPosts.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                  {searchTerm || filterStatus ? 'Không tìm thấy kết quả phù hợp' : 'Chưa có bài viết nào'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {sortedPosts.length > 0 && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 text-sm text-slate-500">Hiển thị {sortedPosts.length} / {posts.length} bài viết</div>
        )}
      </Card>
    </div>
  );
}
