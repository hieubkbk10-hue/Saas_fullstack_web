'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, usePaginatedQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Plus, Edit, Trash2, ExternalLink, Search, Loader2, RefreshCw, Package, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { Button, Card, Badge, Input, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui';
import { ColumnToggle, SortableHeader, BulkActionBar, SelectCheckbox, useSortableData } from '../components/TableUtilities';
import { ModuleGuard } from '../components/ModuleGuard';

const MODULE_KEY = 'products';

export default function ProductsListPage() {
  return (
    <ModuleGuard moduleKey="products">
      <ProductsContent />
    </ModuleGuard>
  );
}

function ProductsContent() {
  // FIX #5: Use server-side pagination instead of listAll
  const categoriesData = useQuery(api.productCategories.listActive);
  const fieldsData = useQuery(api.admin.modules.listEnabledModuleFields, { moduleKey: MODULE_KEY });
  const settingsData = useQuery(api.admin.modules.listModuleSettings, { moduleKey: MODULE_KEY });
  const productStats = useQuery(api.products.getStats);
  
  const deleteProduct = useMutation(api.products.remove);
  const bulkRemove = useMutation(api.products.bulkRemove);
  const seedProductsModule = useMutation(api.seed.seedProductsModule);
  const clearProductsData = useMutation(api.seed.clearProductsData);
  const initStats = useMutation(api.products.initStats);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'asc' | 'desc' }>({ key: null, direction: 'asc' });
  const [visibleColumns, setVisibleColumns] = useState<string[]>([]);
  const [selectedIds, setSelectedIds] = useState<Id<"products">[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  // Get productsPerPage from module settings
  const productsPerPage = useMemo(() => {
    const setting = settingsData?.find(s => s.settingKey === 'productsPerPage');
    return (setting?.value as number) || 12;
  }, [settingsData]);

  // FIX #5: Server-side pagination
  const { results: productsData, status, loadMore } = usePaginatedQuery(
    api.products.list,
    {},
    { initialNumItems: productsPerPage }
  );

  const isLoading = productsData === undefined || categoriesData === undefined || fieldsData === undefined;

  // Get enabled fields from system config
  const enabledFields = useMemo(() => {
    const fields = new Set<string>();
    fieldsData?.forEach(f => fields.add(f.fieldKey));
    return fields;
  }, [fieldsData]);

  // Build columns based on enabled fields
  const columns = useMemo(() => {
    const cols = [
      { key: 'select', label: 'Chọn' },
      { key: 'image', label: 'Ảnh' },
      { key: 'name', label: 'Tên sản phẩm', required: true },
    ];
    
    if (enabledFields.has('sku')) cols.push({ key: 'sku', label: 'SKU' });
    cols.push({ key: 'category', label: 'Danh mục' });
    cols.push({ key: 'price', label: 'Giá bán' });
    if (enabledFields.has('stock')) cols.push({ key: 'stock', label: 'Tồn kho' });
    cols.push({ key: 'status', label: 'Trạng thái' });
    cols.push({ key: 'actions', label: 'Hành động', required: true });
    
    return cols;
  }, [enabledFields]);

  // Initialize visible columns when columns change
  useEffect(() => {
    if (columns.length > 0 && visibleColumns.length === 0) {
      setVisibleColumns(columns.map(c => c.key));
    }
  }, [columns, visibleColumns.length]);

  // Update visible columns when fields change
  useEffect(() => {
    if (fieldsData !== undefined) {
      setVisibleColumns(prev => {
        const validKeys = columns.map(c => c.key);
        return prev.filter(key => validKeys.includes(key));
      });
    }
  }, [fieldsData, columns]);

  // Build category map for lookup (O(1) instead of O(n))
  const categoryMap = useMemo(() => {
    const map: Record<string, string> = {};
    categoriesData?.forEach(cat => { map[cat._id] = cat.name; });
    return map;
  }, [categoriesData]);

  const products = useMemo(() => {
    return productsData?.map(p => ({
      ...p,
      id: p._id,
      category: categoryMap[p.categoryId] || 'Không có',
    })) || [];
  }, [productsData, categoryMap]);

  const handleSort = (key: string) => {
    setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc' }));
  };

  const toggleColumn = (key: string) => {
    setVisibleColumns(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  // Client-side filtering (on paginated data)
  const filteredData = useMemo(() => {
    let data = [...products];
    if (searchTerm) {
      data = data.filter(p => {
        const matchName = p.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchSku = enabledFields.has('sku') && p.sku.toLowerCase().includes(searchTerm.toLowerCase());
        return matchName || matchSku;
      });
    }
    if (filterCategory) {
      data = data.filter(p => p.categoryId === filterCategory);
    }
    if (filterStatus) {
      data = data.filter(p => p.status === filterStatus);
    }
    return data;
  }, [products, searchTerm, filterCategory, filterStatus, enabledFields]);

  const sortedData = useSortableData(filteredData, sortConfig);

  const toggleSelectAll = () => setSelectedIds(selectedIds.length === sortedData.length ? [] : sortedData.map(p => p._id));
  const toggleSelectItem = (id: Id<"products">) => setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

  const openFrontend = (slug: string) => {
    window.open(`/products/${slug}`, '_blank');
  };

  const handleDelete = async (id: Id<"products">) => {
    if (confirm('Xóa sản phẩm này?')) {
      try {
        await deleteProduct({ id });
        toast.success('Đã xóa sản phẩm');
      } catch {
        toast.error('Có lỗi khi xóa sản phẩm');
      }
    }
  };

  // FIX #10: Add loading state for bulk delete
  const handleBulkDelete = async () => {
    if (confirm(`Xóa ${selectedIds.length} sản phẩm đã chọn?`)) {
      setIsDeleting(true);
      try {
        const count = await bulkRemove({ ids: selectedIds });
        setSelectedIds([]);
        toast.success(`Đã xóa ${count} sản phẩm`);
      } catch {
        toast.error('Có lỗi khi xóa sản phẩm');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleReset = async () => {
    if (confirm('Xóa tất cả sản phẩm và seed lại dữ liệu mẫu?')) {
      try {
        await clearProductsData();
        await seedProductsModule();
        await initStats();
        setSelectedIds([]);
        toast.success('Đã reset dữ liệu sản phẩm');
      } catch {
        toast.error('Có lỗi khi reset dữ liệu');
      }
    }
  };

  const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Sản phẩm</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Quản lý kho hàng và thông tin sản phẩm
            {productStats && (
              <span className="ml-2 text-xs">
                (Tổng: {productStats.total} | Active: {productStats.active} | Draft: {productStats.draft})
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={handleReset} title="Reset dữ liệu mẫu">
            <RefreshCw size={16}/> Reset
          </Button>
          <Link href="/admin/products/create"><Button className="gap-2"><Plus size={16}/> Thêm sản phẩm</Button></Link>
        </div>
      </div>

      <BulkActionBar 
        selectedCount={selectedIds.length} 
        onDelete={handleBulkDelete} 
        onClearSelection={() => setSelectedIds([])} 
        isLoading={isDeleting}
      />

      <Card>
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex flex-wrap gap-3 flex-1">
            <div className="relative max-w-xs">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input 
                placeholder={enabledFields.has('sku') ? "Tìm tên, SKU..." : "Tìm tên sản phẩm..."} 
                className="pl-9 w-48" 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
              />
            </div>
            <select className="h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
              <option value="">Tất cả danh mục</option>
              {categoriesData?.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
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
              {visibleColumns.includes('sku') && enabledFields.has('sku') && <SortableHeader label="SKU" sortKey="sku" sortConfig={sortConfig} onSort={handleSort} />}
              {visibleColumns.includes('category') && <SortableHeader label="Danh mục" sortKey="category" sortConfig={sortConfig} onSort={handleSort} />}
              {visibleColumns.includes('price') && <SortableHeader label="Giá bán" sortKey="price" sortConfig={sortConfig} onSort={handleSort} />}
              {visibleColumns.includes('stock') && enabledFields.has('stock') && <SortableHeader label="Tồn kho" sortKey="stock" sortConfig={sortConfig} onSort={handleSort} />}
              {visibleColumns.includes('status') && <SortableHeader label="Trạng thái" sortKey="status" sortConfig={sortConfig} onSort={handleSort} />}
              {visibleColumns.includes('actions') && <TableHead className="text-right">Hành động</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.map(product => (
              <TableRow key={product._id} className={selectedIds.includes(product._id) ? 'bg-orange-500/5' : ''}>
                {visibleColumns.includes('select') && <TableCell><SelectCheckbox checked={selectedIds.includes(product._id)} onChange={() => toggleSelectItem(product._id)} /></TableCell>}
                {visibleColumns.includes('image') && (
                  <TableCell>
                    {product.image ? (
                      <img src={product.image} className="w-10 h-10 object-cover rounded bg-slate-100" alt="" />
                    ) : (
                      <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded flex items-center justify-center">
                        <Package size={16} className="text-slate-400" />
                      </div>
                    )}
                  </TableCell>
                )}
                {visibleColumns.includes('name') && <TableCell className="font-medium max-w-[200px] truncate">{product.name}</TableCell>}
                {visibleColumns.includes('sku') && enabledFields.has('sku') && <TableCell className="font-mono text-xs text-slate-500">{product.sku}</TableCell>}
                {visibleColumns.includes('category') && <TableCell>{product.category}</TableCell>}
                {visibleColumns.includes('price') && (
                  <TableCell>
                    <div>
                      {product.salePrice && enabledFields.has('salePrice') ? (
                        <>
                          <span className="text-red-500 font-medium">{formatPrice(product.salePrice)}</span>
                          <span className="text-slate-400 line-through text-xs ml-1">{formatPrice(product.price)}</span>
                        </>
                      ) : (
                        <span>{formatPrice(product.price)}</span>
                      )}
                    </div>
                  </TableCell>
                )}
                {visibleColumns.includes('stock') && enabledFields.has('stock') && <TableCell className={product.stock < 10 ? 'text-red-500 font-medium' : ''}>{product.stock}</TableCell>}
                {visibleColumns.includes('status') && (
                  <TableCell>
                    <Badge variant={product.status === 'Active' ? 'success' : product.status === 'Draft' ? 'secondary' : 'warning'}>
                      {product.status === 'Active' ? 'Đang bán' : product.status === 'Draft' ? 'Bản nháp' : 'Lưu trữ'}
                    </Badge>
                  </TableCell>
                )}
                {visibleColumns.includes('actions') && (
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" className="text-blue-600 hover:text-blue-700" title="Xem trên web" onClick={() => openFrontend(product.slug)}><ExternalLink size={16}/></Button>
                      <Link href={`/admin/products/${product._id}/edit`}><Button variant="ghost" size="icon"><Edit size={16}/></Button></Link>
                      <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => handleDelete(product._id)}><Trash2 size={16}/></Button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
            {sortedData.length === 0 && (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-8 text-slate-500">
                  {searchTerm || filterCategory || filterStatus ? 'Không tìm thấy kết quả phù hợp' : 'Chưa có sản phẩm nào. Nhấn Reset để tạo dữ liệu mẫu.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {sortedData.length > 0 && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-sm text-slate-500">
              Hiển thị {sortedData.length} sản phẩm
              {productStats && ` / ${productStats.total} tổng`}
            </span>
            {status === 'CanLoadMore' && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => loadMore(productsPerPage)}
                className="gap-2"
              >
                <ChevronRight size={16} /> Tải thêm
              </Button>
            )}
            {status === 'LoadingMore' && (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Loader2 size={16} className="animate-spin" /> Đang tải...
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
