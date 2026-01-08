'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Plus, Edit, Trash2, ExternalLink, Search, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Button, Card, Badge, Input, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui';
import { ColumnToggle, SortableHeader, BulkActionBar, SelectCheckbox, useSortableData } from '../components/TableUtilities';
import { ModuleGuard } from '../components/ModuleGuard';

export default function PostCategoriesListPage() {
  return (
    <ModuleGuard moduleKey="posts">
      <PostCategoriesContent />
    </ModuleGuard>
  );
}

function PostCategoriesContent() {
  const categoriesData = useQuery(api.postCategories.listAll, {});
  const postsData = useQuery(api.posts.listAll, {});
  const deleteCategory = useMutation(api.postCategories.remove);
  const seedPostsModule = useMutation(api.seed.seedPostsModule);
  const clearPostsData = useMutation(api.seed.clearPostsData);

  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'asc' | 'desc' }>({ key: null, direction: 'asc' });
  const [visibleColumns, setVisibleColumns] = useState(['select', 'thumbnail', 'name', 'slug', 'count', 'status', 'actions']);
  const [selectedIds, setSelectedIds] = useState<Id<"postCategories">[]>([]);

  const isLoading = categoriesData === undefined || postsData === undefined;

  // Count posts per category
  const postCountMap = useMemo(() => {
    const map: Record<string, number> = {};
    postsData?.forEach(post => {
      map[post.categoryId] = (map[post.categoryId] || 0) + 1;
    });
    return map;
  }, [postsData]);

  const categories = useMemo(() => {
    return categoriesData?.map(cat => ({
      ...cat,
      id: cat._id,
      count: postCountMap[cat._id] || 0,
    })) || [];
  }, [categoriesData, postCountMap]);

  const columns = [
    { key: 'select', label: 'Chọn' },
    { key: 'thumbnail', label: 'Ảnh' },
    { key: 'name', label: 'Tên danh mục', required: true },
    { key: 'slug', label: 'Slug' },
    { key: 'count', label: 'Số bài viết' },
    { key: 'status', label: 'Trạng thái' },
    { key: 'actions', label: 'Hành động', required: true }
  ];

  const handleSort = (key: string) => {
    setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc' }));
  };

  const toggleColumn = (key: string) => {
    setVisibleColumns(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  const filteredData = useMemo(() => {
    let data = [...categories];
    if (searchTerm) {
      data = data.filter(cat => cat.name.toLowerCase().includes(searchTerm.toLowerCase()) || cat.slug.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    return data;
  }, [categories, searchTerm]);

  const sortedData = useSortableData(filteredData, sortConfig);

  const toggleSelectAll = () => setSelectedIds(selectedIds.length === sortedData.length ? [] : sortedData.map(item => item.id as Id<"postCategories">));
  const toggleSelectItem = (id: Id<"postCategories">) => setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

  const handleDelete = async (id: Id<"postCategories">) => {
    if (confirm('Xóa danh mục này?')) {
      try {
        await deleteCategory({ id });
        toast.success('Đã xóa danh mục thành công');
      } catch {
        toast.error('Không thể xóa danh mục');
      }
    }
  };

  const handleBulkDelete = async () => {
    if (confirm(`Xóa ${selectedIds.length} danh mục đã chọn?`)) {
      try {
        for (const id of selectedIds) {
          await deleteCategory({ id });
        }
        setSelectedIds([]);
        toast.success(`Đã xóa ${selectedIds.length} danh mục`);
      } catch {
        toast.error('Không thể xóa danh mục');
      }
    }
  };

  const handleReset = async () => {
    if (confirm('Reset dữ liệu danh mục? Tất cả dữ liệu cũ sẽ bị xóa.')) {
      await clearPostsData();
      await seedPostsModule();
      setSelectedIds([]);
      toast.success('Đã reset dữ liệu danh mục');
    }
  };

  const openFrontend = (slug: string) => {
    window.open(`https://example.com/category/${slug}`, '_blank');
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
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Danh mục bài viết</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Quản lý phân loại nội dung cho website</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset} className="gap-2"><RefreshCw size={16}/> Reset</Button>
          <Link href="/admin/post-categories/create"><Button className="gap-2"><Plus size={16}/> Thêm danh mục</Button></Link>
        </div>
      </div>

      <BulkActionBar selectedCount={selectedIds.length} onDelete={handleBulkDelete} onClearSelection={() => setSelectedIds([])} />
      
      <Card>
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex gap-4 flex-1">
            <div className="relative max-w-xs flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input placeholder="Tìm kiếm danh mục..." className="pl-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
          </div>
          <ColumnToggle columns={columns} visibleColumns={visibleColumns} onToggle={toggleColumn} />
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              {visibleColumns.includes('select') && (
                <TableHead className="w-[40px]">
                  <SelectCheckbox checked={selectedIds.length === sortedData.length && sortedData.length > 0} onChange={toggleSelectAll} indeterminate={selectedIds.length > 0 && selectedIds.length < sortedData.length} />
                </TableHead>
              )}
              {visibleColumns.includes('thumbnail') && <TableHead className="w-[60px]">Ảnh</TableHead>}
              {visibleColumns.includes('name') && <SortableHeader label="Tên danh mục" sortKey="name" sortConfig={sortConfig} onSort={handleSort} />}
              {visibleColumns.includes('slug') && <SortableHeader label="Slug" sortKey="slug" sortConfig={sortConfig} onSort={handleSort} />}
              {visibleColumns.includes('count') && <SortableHeader label="Số bài viết" sortKey="count" sortConfig={sortConfig} onSort={handleSort} className="text-center" />}
              {visibleColumns.includes('status') && <SortableHeader label="Trạng thái" sortKey="status" sortConfig={sortConfig} onSort={handleSort} />}
              {visibleColumns.includes('actions') && <TableHead className="text-right">Hành động</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.map(cat => (
              <TableRow key={cat.id} className={selectedIds.includes(cat.id) ? 'bg-blue-500/5' : ''}>
                {visibleColumns.includes('select') && (
                  <TableCell><SelectCheckbox checked={selectedIds.includes(cat.id)} onChange={() => toggleSelectItem(cat.id)} /></TableCell>
                )}
                {visibleColumns.includes('thumbnail') && (
                  <TableCell>
                    {cat.thumbnail ? (
                      <img src={cat.thumbnail} alt="" className="w-10 h-8 object-cover rounded" />
                    ) : (
                      <div className="w-10 h-8 bg-slate-200 dark:bg-slate-700 rounded flex items-center justify-center text-xs text-slate-400">-</div>
                    )}
                  </TableCell>
                )}
                {visibleColumns.includes('name') && <TableCell className="font-medium">{cat.name}</TableCell>}
                {visibleColumns.includes('slug') && <TableCell className="text-slate-500 font-mono text-sm">{cat.slug}</TableCell>}
                {visibleColumns.includes('count') && <TableCell className="text-center"><Badge variant="secondary">{cat.count}</Badge></TableCell>}
                {visibleColumns.includes('status') && (
                  <TableCell>
                    <Badge variant={cat.active ? 'default' : 'secondary'}>{cat.active ? 'Hoạt động' : 'Ẩn'}</Badge>
                  </TableCell>
                )}
                {visibleColumns.includes('actions') && (
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" className="text-blue-600 hover:text-blue-700" title="Xem trên web" onClick={() => openFrontend(cat.slug)}><ExternalLink size={16}/></Button>
                      <Link href={`/admin/post-categories/${cat.id}/edit`}><Button variant="ghost" size="icon"><Edit size={16}/></Button></Link>
                      <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => handleDelete(cat.id as Id<"postCategories">)}><Trash2 size={16}/></Button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
            {sortedData.length === 0 && (
              <TableRow>
                <TableCell colSpan={visibleColumns.length} className="text-center py-8 text-slate-500">
                  {searchTerm ? 'Không tìm thấy kết quả phù hợp' : 'Chưa có danh mục nào'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {sortedData.length > 0 && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 text-sm text-slate-500">
            Hiển thị {sortedData.length} / {categories.length} danh mục
          </div>
        )}
      </Card>
    </div>
  );
}
