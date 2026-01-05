'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash2, ExternalLink, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Button, Card, Badge, Input, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui';
import { ColumnToggle, SortableHeader, BulkActionBar, SelectCheckbox, useSortableData } from '../components/TableUtilities';
import { mockProducts, mockCategories } from '../mockData';

export default function ProductsListPage() {
  const [products, setProducts] = useState(mockProducts);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'asc' | 'desc' }>({ key: null, direction: 'asc' });
  const [visibleColumns, setVisibleColumns] = useState(['select', 'image', 'name', 'sku', 'price', 'stock', 'status', 'actions']);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const columns = [
    { key: 'select', label: 'Chọn' },
    { key: 'image', label: 'Ảnh' },
    { key: 'name', label: 'Tên sản phẩm', required: true },
    { key: 'sku', label: 'SKU' },
    { key: 'category', label: 'Danh mục' },
    { key: 'price', label: 'Giá bán' },
    { key: 'stock', label: 'Tồn kho' },
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
    let data = [...products];
    if (searchTerm) {
      data = data.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    if (filterCategory) {
      data = data.filter(p => p.category === filterCategory);
    }
    if (filterStatus) {
      data = data.filter(p => p.status === filterStatus);
    }
    return data;
  }, [products, searchTerm, filterCategory, filterStatus]);

  const sortedData = useSortableData(filteredData, sortConfig);

  const toggleSelectAll = () => setSelectedIds(selectedIds.length === sortedData.length ? [] : sortedData.map(p => p.id));
  const toggleSelectItem = (id: string) => setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

  const openFrontend = (id: string) => {
    window.open(`https://example.com/product/${id}`, '_blank');
  };

  const handleDelete = (id: string) => {
    if (confirm('Xóa sản phẩm này?')) {
      setProducts(prev => prev.filter(p => p.id !== id));
      toast.success('Đã xóa sản phẩm');
    }
  };

  const handleBulkDelete = () => {
    if (confirm(`Xóa ${selectedIds.length} sản phẩm đã chọn?`)) {
      setProducts(prev => prev.filter(p => !selectedIds.includes(p.id)));
      setSelectedIds([]);
      toast.success(`Đã xóa ${selectedIds.length} sản phẩm`);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Sản phẩm</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Quản lý kho hàng và thông tin sản phẩm</p>
        </div>
        <Link href="/admin/products/create"><Button className="gap-2"><Plus size={16}/> Thêm sản phẩm</Button></Link>
      </div>

      <BulkActionBar selectedCount={selectedIds.length} onDelete={handleBulkDelete} onClearSelection={() => setSelectedIds([])} />

      <Card>
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex flex-wrap gap-3 flex-1">
            <div className="relative max-w-xs">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input placeholder="Tìm tên, SKU..." className="pl-9 w-48" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <select className="h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
              <option value="">Tất cả danh mục</option>
              {mockCategories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
            <select className="h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="">Tất cả trạng thái</option>
              <option value="Active">Đang bán</option>
              <option value="Draft">Bản nháp</option>
              <option value="Archived">Lưu trữ</option>
            </select>
          </div>
          <ColumnToggle columns={columns} visibleColumns={visibleColumns} onToggle={toggleColumn} />
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              {visibleColumns.includes('select') && <TableHead className="w-[40px]"><SelectCheckbox checked={selectedIds.length === sortedData.length && sortedData.length > 0} onChange={toggleSelectAll} indeterminate={selectedIds.length > 0 && selectedIds.length < sortedData.length} /></TableHead>}
              {visibleColumns.includes('image') && <TableHead className="w-[60px]">Ảnh</TableHead>}
              {visibleColumns.includes('name') && <SortableHeader label="Tên sản phẩm" sortKey="name" sortConfig={sortConfig} onSort={handleSort} />}
              {visibleColumns.includes('sku') && <SortableHeader label="SKU" sortKey="sku" sortConfig={sortConfig} onSort={handleSort} />}
              {visibleColumns.includes('category') && <SortableHeader label="Danh mục" sortKey="category" sortConfig={sortConfig} onSort={handleSort} />}
              {visibleColumns.includes('price') && <SortableHeader label="Giá bán" sortKey="price" sortConfig={sortConfig} onSort={handleSort} />}
              {visibleColumns.includes('stock') && <SortableHeader label="Tồn kho" sortKey="stock" sortConfig={sortConfig} onSort={handleSort} />}
              {visibleColumns.includes('status') && <SortableHeader label="Trạng thái" sortKey="status" sortConfig={sortConfig} onSort={handleSort} />}
              {visibleColumns.includes('actions') && <TableHead className="text-right">Hành động</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.map(product => (
              <TableRow key={product.id} className={selectedIds.includes(product.id) ? 'bg-blue-500/5' : ''}>
                {visibleColumns.includes('select') && <TableCell><SelectCheckbox checked={selectedIds.includes(product.id)} onChange={() => toggleSelectItem(product.id)} /></TableCell>}
                {visibleColumns.includes('image') && <TableCell><img src={product.image} className="w-10 h-10 object-cover rounded bg-slate-100" alt="" /></TableCell>}
                {visibleColumns.includes('name') && <TableCell className="font-medium">{product.name}</TableCell>}
                {visibleColumns.includes('sku') && <TableCell className="font-mono text-xs text-slate-500">{product.sku}</TableCell>}
                {visibleColumns.includes('category') && <TableCell>{product.category}</TableCell>}
                {visibleColumns.includes('price') && <TableCell>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}</TableCell>}
                {visibleColumns.includes('stock') && <TableCell className={product.stock < 10 ? 'text-red-500 font-medium' : ''}>{product.stock}</TableCell>}
                {visibleColumns.includes('status') && (
                  <TableCell>
                    <Badge variant={product.status === 'Active' ? 'success' : 'secondary'}>
                      {product.status === 'Active' ? 'Đang bán' : product.status === 'Draft' ? 'Bản nháp' : 'Lưu trữ'}
                    </Badge>
                  </TableCell>
                )}
                {visibleColumns.includes('actions') && (
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" className="text-blue-600 hover:text-blue-700" title="Xem trên web" onClick={() => openFrontend(product.id)}><ExternalLink size={16}/></Button>
                      <Link href={`/admin/products/${product.id}/edit`}><Button variant="ghost" size="icon"><Edit size={16}/></Button></Link>
                      <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => handleDelete(product.id)}><Trash2 size={16}/></Button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
            {sortedData.length === 0 && (
              <TableRow>
                <TableCell colSpan={visibleColumns.length} className="text-center py-8 text-slate-500">
                  {searchTerm || filterCategory || filterStatus ? 'Không tìm thấy kết quả phù hợp' : 'Chưa có sản phẩm nào'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {sortedData.length > 0 && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 text-sm text-slate-500">
            Hiển thị {sortedData.length} / {products.length} sản phẩm
          </div>
        )}
      </Card>
    </div>
  );
}
