'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { ChevronDown, Edit, ExternalLink, Loader2, Package, Plus, RefreshCw, Search, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Badge, Button, Card, Input, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui';
import { BulkActionBar, ColumnToggle, generatePaginationItems, SelectCheckbox, SortableHeader, useSortableData } from '../components/TableUtilities';
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
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<Id<"productCategories"> | ''>('');
  const [filterStatus, setFilterStatus] = useState<'' | 'Active' | 'Archived' | 'Draft'>('');
  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'asc' | 'desc' }>({ direction: 'asc', key: null });
  const [visibleColumns, setVisibleColumns] = useState<string[]>(() => {
    if (typeof window === 'undefined') {
      return [];
    }
    try {
      const stored = window.localStorage.getItem('admin_products_visible_columns');
      if (stored) {
        const parsed = JSON.parse(stored) as string[];
        return parsed.length > 0 ? parsed : [];
      }
    } catch {
      return [];
    }
    return [];
  });
  const [manualSelectedIds, setManualSelectedIds] = useState<Id<"products">[]>([]);
  const [selectionMode, setSelectionMode] = useState<'manual' | 'all'>('manual');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSizeOverride, setPageSizeOverride] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const isSelectAllActive = selectionMode === 'all';

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () =>{  clearTimeout(timer); };
  }, [searchTerm]);

  useEffect(() => {
    if (visibleColumns.length > 0) {
      window.localStorage.setItem('admin_products_visible_columns', JSON.stringify(visibleColumns));
    }
  }, [visibleColumns]);

  // Get productsPerPage from module settings
  const productsPerPage = useMemo(() => {
    const setting = settingsData?.find(s => s.settingKey === 'productsPerPage');
    return (setting?.value as number) || 12;
  }, [settingsData]);

  const resolvedProductsPerPage = pageSizeOverride ?? productsPerPage;
  const offset = (currentPage - 1) * resolvedProductsPerPage;

  const productsData = useQuery(api.products.listAdminWithOffset, {
    limit: resolvedProductsPerPage,
    offset,
    search: debouncedSearchTerm.trim() ? debouncedSearchTerm.trim() : undefined,
    categoryId: filterCategory || undefined,
    status: filterStatus || undefined,
  });

  const totalCountData = useQuery(api.products.countAdmin, {
    search: debouncedSearchTerm.trim() ? debouncedSearchTerm.trim() : undefined,
    categoryId: filterCategory || undefined,
    status: filterStatus || undefined,
  });

  const selectAllData = useQuery(
    api.products.listAdminIds,
    isSelectAllActive
      ? {
          search: debouncedSearchTerm.trim() ? debouncedSearchTerm.trim() : undefined,
          categoryId: filterCategory || undefined,
          status: filterStatus || undefined,
        }
      : 'skip'
  );

  const isLoading = productsData === undefined || totalCountData === undefined || categoriesData === undefined || fieldsData === undefined;

  useEffect(() => {
    if (selectAllData?.hasMore) {
      toast.info('Đã chọn tối đa 5.000 sản phẩm phù hợp.');
    }
  }, [selectAllData?.hasMore]);

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
    
    if (enabledFields.has('sku')) {cols.push({ key: 'sku', label: 'SKU' });}
    cols.push({ key: 'category', label: 'Danh mục' });
    cols.push({ key: 'price', label: 'Giá bán' });
    if (enabledFields.has('stock')) {cols.push({ key: 'stock', label: 'Tồn kho' });}
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
        const validKeys = new Set(columns.map(c => c.key));
        return prev.filter(key => validKeys.has(key));
      });
    }
  }, [fieldsData, columns]);

  // Build category map for lookup (O(1) instead of O(n))
  const categoryMap = useMemo(() => {
    const map: Record<string, string> = {};
    categoriesData?.forEach(cat => { map[cat._id] = cat.name; });
    return map;
  }, [categoriesData]);

  const products = useMemo(() => productsData?.map(p => ({
      ...p,
      id: p._id,
      category: categoryMap[p.categoryId] || 'Không có',
    })) || [], [productsData, categoryMap]);

  const handleSort = (key: string) => {
    setSortConfig(prev => ({ direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc', key }));
  };

  const toggleColumn = (key: string) => {
    setVisibleColumns(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  const sortedData = useSortableData(products, sortConfig);

  const totalCount = totalCountData?.count ?? 0;
  const totalPages = totalCount ? Math.ceil(totalCount / resolvedProductsPerPage) : 1;
  const paginatedData = sortedData;
  const tableColumnCount = visibleColumns.length;
  const selectedIds = isSelectAllActive && selectAllData ? selectAllData.ids : manualSelectedIds;
  const isSelectingAll = isSelectAllActive && selectAllData === undefined;

  const applyManualSelection = (nextIds: Id<"products">[]) => {
    setSelectionMode('manual');
    setManualSelectedIds(nextIds);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
    setFilterCategory('');
    setFilterStatus('');
    setCurrentPage(1);
    setPageSizeOverride(null);
    applyManualSelection([]);
  };

  const handleFilterChange = (type: 'category' | 'status', value: string) => {
    if (type === 'category') {
      setFilterCategory(value as Id<"productCategories"> | '');
    } else {
      setFilterStatus(value as '' | 'Active' | 'Archived' | 'Draft');
    }
    setCurrentPage(1);
    applyManualSelection([]);
  };

  const selectedOnPage = paginatedData.filter(product => selectedIds.includes(product._id));
  const isPageSelected = paginatedData.length > 0 && selectedOnPage.length === paginatedData.length;
  const isPageIndeterminate = selectedOnPage.length > 0 && selectedOnPage.length < paginatedData.length;

  const toggleSelectAll = () => {
    if (isPageSelected) {
      const remaining = selectedIds.filter(id => !paginatedData.some(product => product._id === id));
      applyManualSelection(remaining);
      return;
    }
    const next = new Set(selectedIds);
    paginatedData.forEach(product => next.add(product._id));
    applyManualSelection(Array.from(next));
  };

  const toggleSelectItem = (id: Id<"products">) => {
    const next = selectedIds.includes(id)
      ? selectedIds.filter(i => i !== id)
      : [...selectedIds, id];
    applyManualSelection(next);
  };

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
        applyManualSelection([]);
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
        applyManualSelection([]);
        toast.success('Đã reset dữ liệu sản phẩm');
      } catch {
        toast.error('Có lỗi khi reset dữ liệu');
      }
    }
  };

  const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN', { currency: 'VND', style: 'currency' }).format(price);

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
        onClearSelection={() =>{  applyManualSelection([]); }} 
        isLoading={isDeleting}
      />
      {selectedIds.length > 0 && (
        <div className="flex flex-wrap gap-2 text-sm">
          <Button variant="outline" size="sm" onClick={() =>{  applyManualSelection(paginatedData.map(product => product._id)); }}>
            Chọn trang này
          </Button>
          <Button variant="outline" size="sm" onClick={() =>{  setSelectionMode('all'); }} disabled={isSelectingAll}>
            {isSelectingAll ? 'Đang chọn...' : 'Chọn tất cả kết quả'}
          </Button>
        </div>
      )}

      <Card>
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex flex-wrap gap-3 flex-1">
            <div className="relative max-w-xs">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input 
                placeholder={enabledFields.has('sku') ? "Tìm tên, SKU..." : "Tìm tên sản phẩm..."} 
                className="pl-9 w-48" 
                value={searchTerm} 
                onChange={(e) =>{  setSearchTerm(e.target.value); setCurrentPage(1); applyManualSelection([]); }} 
              />
            </div>
            <select className="h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm" value={filterCategory} onChange={(e) =>{  handleFilterChange('category', e.target.value); }}>
              <option value="">Tất cả danh mục</option>
              {categoriesData?.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
            <select className="h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm" value={filterStatus} onChange={(e) =>{  handleFilterChange('status', e.target.value); }}>
              <option value="">Tất cả trạng thái</option>
              <option value="Active">Đang bán</option>
              <option value="Draft">Bản nháp</option>
              <option value="Archived">Lưu trữ</option>
            </select>
            <Button variant="outline" size="sm" onClick={handleResetFilters}>Xóa lọc</Button>
          </div>
          <ColumnToggle columns={columns} visibleColumns={visibleColumns} onToggle={toggleColumn} />
        </div>
        <Table>
          <TableHeader className="[&_th]:sticky [&_th]:top-0 [&_th]:z-10 [&_th]:bg-white dark:[&_th]:bg-slate-900">
            <TableRow>
              {visibleColumns.includes('select') && <TableHead className="w-[40px]"><SelectCheckbox checked={isPageSelected} onChange={toggleSelectAll} indeterminate={isPageIndeterminate} /></TableHead>}
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
            {paginatedData.map(product => (
              <TableRow key={product._id} className={selectedIds.includes(product._id) ? 'bg-orange-500/5' : ''}>
                {visibleColumns.includes('select') && <TableCell><SelectCheckbox checked={selectedIds.includes(product._id)} onChange={() =>{  toggleSelectItem(product._id); }} /></TableCell>}
                {visibleColumns.includes('image') && (
                  <TableCell>
                    {product.image ? (
                      <Image src={product.image} width={40} height={40} className="w-10 h-10 object-cover rounded bg-slate-100" alt={product.name} />
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
                    <Badge variant={product.status === 'Active' ? 'success' : (product.status === 'Draft' ? 'secondary' : 'warning')}>
                      {product.status === 'Active' ? 'Đang bán' : (product.status === 'Draft' ? 'Bản nháp' : 'Lưu trữ')}
                    </Badge>
                  </TableCell>
                )}
                {visibleColumns.includes('actions') && (
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" className="text-blue-600 hover:text-blue-700" title="Xem trên web" onClick={() =>{  openFrontend(product.slug); }}><ExternalLink size={16}/></Button>
                      <Link href={`/admin/products/${product._id}/edit`}><Button variant="ghost" size="icon"><Edit size={16}/></Button></Link>
                      <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={ async () => handleDelete(product._id)}><Trash2 size={16}/></Button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
            {paginatedData.length === 0 && (
              <TableRow>
                <TableCell colSpan={tableColumnCount} className="text-center py-8 text-slate-500">
                  {searchTerm || filterCategory || filterStatus ? 'Không tìm thấy kết quả phù hợp' : 'Chưa có sản phẩm nào. Nhấn Reset để tạo dữ liệu mẫu.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {totalCount > 0 && !isLoading && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="order-2 flex w-full items-center justify-between text-sm text-slate-500 sm:order-1 sm:w-auto sm:justify-start sm:gap-6">
              <div className="flex items-center gap-2">
                <span className="text-slate-600">Hiển thị</span>
                <select
                  value={resolvedProductsPerPage}
                  onChange={(event) =>{  setPageSizeOverride(Number(event.target.value)); setCurrentPage(1); applyManualSelection([]); }}
                  className="h-8 w-[70px] appearance-none rounded-md border border-slate-200 bg-white px-2 text-sm font-medium text-slate-900 shadow-sm focus:border-slate-300 focus:outline-none"
                  aria-label="Số sản phẩm mỗi trang"
                >
                  {[12, 20, 30, 50, 100].map((size) => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
                <span>sản phẩm/trang</span>
              </div>

              <div className="text-right sm:text-left">
                <span className="font-medium text-slate-900">
                  {totalCount ? ((currentPage - 1) * resolvedProductsPerPage) + 1 : 0}–{Math.min(currentPage * resolvedProductsPerPage, totalCount)}
                </span>
                <span className="mx-1 text-slate-300">/</span>
                <span className="font-medium text-slate-900">
                  {totalCount}{totalCountData?.hasMore ? '+' : ''}
                </span>
                <span className="ml-1 text-slate-500">sản phẩm</span>
              </div>
            </div>

            <div className="order-1 flex w-full justify-center sm:order-2 sm:w-auto sm:justify-end">
              <nav className="flex items-center space-x-1 sm:space-x-2" aria-label="Phân trang">
                <button
                  onClick={() =>{  setCurrentPage((prev) => Math.max(1, prev - 1)); }}
                  disabled={currentPage === 1}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label="Trang trước"
                >
                  <ChevronDown className="h-4 w-4 rotate-90" />
                </button>

                {generatePaginationItems(currentPage, totalPages).map((item, index) => {
                  if (item === 'ellipsis') {
                    return (
                      <div key={`ellipsis-${index}`} className="flex h-8 w-8 items-center justify-center text-slate-400">
                        …
                      </div>
                    );
                  }

                  const pageNum = item as number;
                  const isActive = pageNum === currentPage;
                  const isMobileHidden = !isActive && pageNum !== 1 && pageNum !== totalPages;

                  return (
                    <button
                      key={pageNum}
                      onClick={() =>{  setCurrentPage(pageNum); }}
                      className={`inline-flex h-8 w-8 items-center justify-center rounded-md text-sm transition-all duration-200 ${
                        isActive
                          ? 'bg-orange-600 text-white shadow-sm border font-medium'
                          : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                      } ${isMobileHidden ? 'hidden sm:inline-flex' : ''}`}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() =>{  setCurrentPage((prev) => Math.min(totalPages, prev + 1)); }}
                  disabled={currentPage >= totalPages}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label="Trang sau"
                >
                  <ChevronDown className="h-4 w-4 -rotate-90" />
                </button>
              </nav>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
