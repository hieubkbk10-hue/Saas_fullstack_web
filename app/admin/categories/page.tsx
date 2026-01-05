'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash2, ExternalLink, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Button, Card, Badge, Input, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui';
import { ColumnToggle, SortableHeader, BulkActionBar, SelectCheckbox, useSortableData } from '../components/TableUtilities';
import { mockCategories } from '../mockData';

export default function CategoriesListPage() {
  const [categories, setCategories] = useState(mockCategories);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'asc' | 'desc' }>({ key: null, direction: 'asc' });
  const [visibleColumns, setVisibleColumns] = useState(['select', 'name', 'slug', 'count', 'actions']);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const columns = [
    { key: 'select', label: 'Chọn' },
    { key: 'name', label: 'Tên danh mục', required: true },
    { key: 'slug', label: 'Slug' },
    { key: 'count', label: 'Số sản phẩm' },
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

  const toggleSelectAll = () => setSelectedIds(selectedIds.length === sortedData.length ? [] : sortedData.map(item => item.id));
  const toggleSelectItem = (id: string) => setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

  const handleDelete = (id: string) => {
    if (confirm('Xóa danh mục này?')) {
      setCategories(prev => prev.filter(c => c.id !== id));
      toast.success('Đã xóa danh mục');
    }
  };

  const handleBulkDelete = () => {
    if (confirm(`Xóa ${selectedIds.length} danh mục đã chọn?`)) {
      setCategories(prev => prev.filter(c => !selectedIds.includes(c.id)));
      setSelectedIds([]);
      toast.success(`Đã xóa ${selectedIds.length} danh mục`);
    }
  };

  const openFrontend = (slug: string) => {
    window.open(`https://example.com/shop/category/${slug}`, '_blank');
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Danh mục sản phẩm</h1>
          <p className="text-sm text-slate-500">Tổ chức cây thư mục cho cửa hàng</p>
        </div>
        <Link href="/admin/categories/create"><Button className="gap-2"><Plus size={16}/> Thêm danh mục</Button></Link>
      </div>

      <BulkActionBar selectedCount={selectedIds.length} onDelete={handleBulkDelete} onClearSelection={() => setSelectedIds([])} />
      
      <Card>
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative max-w-xs flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input placeholder="Tìm kiếm danh mục..." className="pl-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <ColumnToggle columns={columns} visibleColumns={visibleColumns} onToggle={toggleColumn} />
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              {visibleColumns.includes('select') && <TableHead className="w-[40px]"><SelectCheckbox checked={selectedIds.length === sortedData.length && sortedData.length > 0} onChange={toggleSelectAll} indeterminate={selectedIds.length > 0 && selectedIds.length < sortedData.length} /></TableHead>}
              {visibleColumns.includes('name') && <SortableHeader label="Tên danh mục" sortKey="name" sortConfig={sortConfig} onSort={handleSort} />}
              {visibleColumns.includes('slug') && <SortableHeader label="Slug" sortKey="slug" sortConfig={sortConfig} onSort={handleSort} />}
              {visibleColumns.includes('count') && <SortableHeader label="Số sản phẩm" sortKey="count" sortConfig={sortConfig} onSort={handleSort} className="text-center" />}
              {visibleColumns.includes('actions') && <TableHead className="text-right">Hành động</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.map(cat => (
              <TableRow key={cat.id} className={selectedIds.includes(cat.id) ? 'bg-blue-500/5' : ''}>
                {visibleColumns.includes('select') && <TableCell><SelectCheckbox checked={selectedIds.includes(cat.id)} onChange={() => toggleSelectItem(cat.id)} /></TableCell>}
                {visibleColumns.includes('name') && <TableCell className="font-medium">{cat.name}</TableCell>}
                {visibleColumns.includes('slug') && <TableCell className="text-slate-500 font-mono text-sm">{cat.slug}</TableCell>}
                {visibleColumns.includes('count') && <TableCell className="text-center"><Badge variant="secondary">{cat.count}</Badge></TableCell>}
                {visibleColumns.includes('actions') && (
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" className="text-blue-600 hover:text-blue-700" title="Xem trên web" onClick={() => openFrontend(cat.slug)}><ExternalLink size={16}/></Button>
                      <Link href={`/admin/categories/${cat.id}/edit`}><Button variant="ghost" size="icon"><Edit size={16}/></Button></Link>
                      <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => handleDelete(cat.id)}><Trash2 size={16}/></Button>
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
