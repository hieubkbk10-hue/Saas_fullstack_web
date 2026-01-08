'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Trash2, Search, Loader2, RefreshCw, Heart, User, Package, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { Button, Card, Input, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui';
import { ColumnToggle, SortableHeader, BulkActionBar, SelectCheckbox, useSortableData } from '../components/TableUtilities';
import { ModuleGuard } from '../components/ModuleGuard';

const MODULE_KEY = 'wishlist';

export default function WishlistListPage() {
  return (
    <ModuleGuard moduleKey="wishlist">
      <WishlistContent />
    </ModuleGuard>
  );
}

function WishlistContent() {
  const wishlistData = useQuery(api.wishlist.listAll);
  const customersData = useQuery(api.customers.listAll);
  const productsData = useQuery(api.products.listAll, {});
  const fieldsData = useQuery(api.admin.modules.listEnabledModuleFields, { moduleKey: MODULE_KEY });
  const settingsData = useQuery(api.admin.modules.listModuleSettings, { moduleKey: MODULE_KEY });
  const removeItem = useMutation(api.wishlist.remove);
  const seedWishlistModule = useMutation(api.seed.seedWishlistModule);
  const clearWishlistData = useMutation(api.seed.clearWishlistData);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCustomer, setFilterCustomer] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'asc' | 'desc' }>({ key: null, direction: 'asc' });
  const [visibleColumns, setVisibleColumns] = useState<string[]>([]);
  const [selectedIds, setSelectedIds] = useState<Id<"wishlist">[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const isLoading = wishlistData === undefined || customersData === undefined || productsData === undefined || fieldsData === undefined;

  // Lấy setting itemsPerPage từ module settings
  const itemsPerPage = useMemo(() => {
    const setting = settingsData?.find(s => s.settingKey === 'itemsPerPage');
    return (setting?.value as number) || 20;
  }, [settingsData]);

  const enabledFields = useMemo(() => {
    const fields = new Set<string>();
    fieldsData?.forEach(f => fields.add(f.fieldKey));
    return fields;
  }, [fieldsData]);

  const columns = useMemo(() => {
    const cols = [
      { key: 'select', label: 'Chọn' },
      { key: 'customer', label: 'Khách hàng', required: true },
      { key: 'product', label: 'Sản phẩm', required: true },
      { key: 'price', label: 'Giá' },
    ];
    if (enabledFields.has('note')) cols.push({ key: 'note', label: 'Ghi chú' });
    cols.push({ key: 'createdAt', label: 'Ngày thêm' });
    cols.push({ key: 'actions', label: 'Hành động', required: true });
    return cols;
  }, [enabledFields]);

  useEffect(() => {
    if (columns.length > 0 && visibleColumns.length === 0) {
      setVisibleColumns(columns.map(c => c.key));
    }
  }, [columns, visibleColumns.length]);

  useEffect(() => {
    if (fieldsData !== undefined) {
      setVisibleColumns(prev => {
        const validKeys = columns.map(c => c.key);
        return prev.filter(key => validKeys.includes(key));
      });
    }
  }, [fieldsData, columns]);

  const customerMap = useMemo(() => {
    const map: Record<string, { name: string; email: string }> = {};
    customersData?.forEach(c => { map[c._id] = { name: c.name, email: c.email }; });
    return map;
  }, [customersData]);

  const productMap = useMemo(() => {
    const map: Record<string, { name: string; price: number; salePrice?: number; image?: string }> = {};
    productsData?.forEach(p => { map[p._id] = { name: p.name, price: p.price, salePrice: p.salePrice, image: p.image }; });
    return map;
  }, [productsData]);

  const wishlistItems = useMemo(() => {
    return wishlistData?.map(item => ({
      ...item,
      id: item._id,
      customerName: customerMap[item.customerId]?.name || 'Không xác định',
      customerEmail: customerMap[item.customerId]?.email || '',
      productName: productMap[item.productId]?.name || 'Không xác định',
      productPrice: productMap[item.productId]?.price || 0,
      productSalePrice: productMap[item.productId]?.salePrice,
      productImage: productMap[item.productId]?.image,
    })) || [];
  }, [wishlistData, customerMap, productMap]);

  const handleSort = (key: string) => {
    setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc' }));
  };

  const toggleColumn = (key: string) => {
    setVisibleColumns(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  const filteredData = useMemo(() => {
    let data = [...wishlistItems];
    if (searchTerm) {
      data = data.filter(item => 
        item.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.productName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (filterCustomer) {
      data = data.filter(item => item.customerId === filterCustomer);
    }
    return data;
  }, [wishlistItems, searchTerm, filterCustomer]);

  const sortedData = useSortableData(filteredData, sortConfig);

  // Pagination
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(start, start + itemsPerPage);
  }, [sortedData, currentPage, itemsPerPage]);

  // Reset page khi filter/sort thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterCustomer, sortConfig]);

  const toggleSelectAll = () => setSelectedIds(selectedIds.length === paginatedData.length ? [] : paginatedData.map(item => item._id));
  const toggleSelectItem = (id: Id<"wishlist">) => setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

  const handleDelete = async (id: Id<"wishlist">) => {
    if (confirm('Xóa sản phẩm này khỏi wishlist?')) {
      try {
        await removeItem({ id });
        toast.success('Đã xóa khỏi wishlist');
      } catch {
        toast.error('Có lỗi khi xóa');
      }
    }
  };

  const handleBulkDelete = async () => {
    if (confirm(`Xóa ${selectedIds.length} mục đã chọn?`)) {
      try {
        for (const id of selectedIds) {
          await removeItem({ id });
        }
        setSelectedIds([]);
        toast.success(`Đã xóa ${selectedIds.length} mục`);
      } catch {
        toast.error('Có lỗi khi xóa');
      }
    }
  };

  const handleReset = async () => {
    if (confirm('Xóa tất cả và seed lại dữ liệu mẫu?')) {
      try {
        await clearWishlistData();
        await seedWishlistModule();
        setSelectedIds([]);
        toast.success('Đã reset dữ liệu wishlist');
      } catch {
        toast.error('Có lỗi khi reset dữ liệu');
      }
    }
  };

  const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  const formatDate = (timestamp: number) => new Date(timestamp).toLocaleDateString('vi-VN');

  // Stats
  const stats = useMemo(() => {
    const customerCounts: Record<string, number> = {};
    const productCounts: Record<string, number> = {};
    wishlistItems.forEach(item => {
      customerCounts[item.customerId] = (customerCounts[item.customerId] || 0) + 1;
      productCounts[item.productId] = (productCounts[item.productId] || 0) + 1;
    });
    return {
      totalItems: wishlistItems.length,
      uniqueCustomers: Object.keys(customerCounts).length,
      uniqueProducts: Object.keys(productCounts).length,
      mostWishlisted: Object.entries(productCounts).sort((a, b) => b[1] - a[1])[0],
    };
  }, [wishlistItems]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-pink-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Sản phẩm yêu thích</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Quản lý wishlist của khách hàng</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={handleReset} title="Reset dữ liệu mẫu">
            <RefreshCw size={16}/> Reset
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-pink-500/10 rounded-lg">
              <Heart className="w-5 h-5 text-pink-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.totalItems}</p>
              <p className="text-sm text-slate-500">Tổng mục</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.uniqueCustomers}</p>
              <p className="text-sm text-slate-500">Khách hàng</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <Package className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.uniqueProducts}</p>
              <p className="text-sm text-slate-500">Sản phẩm</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <Heart className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate max-w-[120px]">
                {stats.mostWishlisted ? productMap[stats.mostWishlisted[0]]?.name : 'N/A'}
              </p>
              <p className="text-xs text-slate-500">Được thích nhiều nhất ({stats.mostWishlisted?.[1] || 0})</p>
            </div>
          </div>
        </Card>
      </div>

      <BulkActionBar selectedCount={selectedIds.length} onDelete={handleBulkDelete} onClearSelection={() => setSelectedIds([])} />

      <Card>
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex flex-wrap gap-3 flex-1">
            <div className="relative max-w-xs">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input placeholder="Tìm khách hàng, sản phẩm..." className="pl-9 w-48" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <select className="h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm" value={filterCustomer} onChange={(e) => setFilterCustomer(e.target.value)}>
              <option value="">Tất cả khách hàng</option>
              {customersData?.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
          <ColumnToggle columns={columns} visibleColumns={visibleColumns} onToggle={toggleColumn} />
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              {visibleColumns.includes('select') && <TableHead className="w-[40px]"><SelectCheckbox checked={selectedIds.length === paginatedData.length && paginatedData.length > 0} onChange={toggleSelectAll} indeterminate={selectedIds.length > 0 && selectedIds.length < paginatedData.length} /></TableHead>}
              {visibleColumns.includes('customer') && <SortableHeader label="Khách hàng" sortKey="customerName" sortConfig={sortConfig} onSort={handleSort} />}
              {visibleColumns.includes('product') && <SortableHeader label="Sản phẩm" sortKey="productName" sortConfig={sortConfig} onSort={handleSort} />}
              {visibleColumns.includes('price') && <SortableHeader label="Giá" sortKey="productPrice" sortConfig={sortConfig} onSort={handleSort} />}
              {visibleColumns.includes('note') && enabledFields.has('note') && <TableHead>Ghi chú</TableHead>}
              {visibleColumns.includes('createdAt') && <SortableHeader label="Ngày thêm" sortKey="_creationTime" sortConfig={sortConfig} onSort={handleSort} />}
              {visibleColumns.includes('actions') && <TableHead className="text-right">Hành động</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map(item => (
              <TableRow key={item._id} className={selectedIds.includes(item._id) ? 'bg-pink-500/5' : ''}>
                {visibleColumns.includes('select') && <TableCell><SelectCheckbox checked={selectedIds.includes(item._id)} onChange={() => toggleSelectItem(item._id)} /></TableCell>}
                {visibleColumns.includes('customer') && (
                  <TableCell>
                    <div>
                      <p className="font-medium">{item.customerName}</p>
                      <p className="text-xs text-slate-500">{item.customerEmail}</p>
                    </div>
                  </TableCell>
                )}
                {visibleColumns.includes('product') && (
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {item.productImage ? (
                        <img src={item.productImage} className="w-10 h-10 object-cover rounded bg-slate-100" alt="" />
                      ) : (
                        <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded flex items-center justify-center">
                          <Package size={16} className="text-slate-400" />
                        </div>
                      )}
                      <span className="font-medium max-w-[200px] truncate">{item.productName}</span>
                    </div>
                  </TableCell>
                )}
                {visibleColumns.includes('price') && (
                  <TableCell>
                    {item.productSalePrice ? (
                      <div>
                        <span className="text-red-500 font-medium">{formatPrice(item.productSalePrice)}</span>
                        <span className="text-slate-400 line-through text-xs ml-1">{formatPrice(item.productPrice)}</span>
                      </div>
                    ) : (
                      formatPrice(item.productPrice)
                    )}
                  </TableCell>
                )}
                {visibleColumns.includes('note') && enabledFields.has('note') && (
                  <TableCell className="text-slate-500 text-sm max-w-[150px] truncate">{item.note || '-'}</TableCell>
                )}
                {visibleColumns.includes('createdAt') && <TableCell className="text-slate-500 text-sm">{formatDate(item._creationTime)}</TableCell>}
                {visibleColumns.includes('actions') && (
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => handleDelete(item._id)}><Trash2 size={16}/></Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
            {paginatedData.length === 0 && (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-8 text-slate-500">
                  {searchTerm || filterCustomer ? 'Không tìm thấy kết quả phù hợp' : 'Chưa có sản phẩm yêu thích nào. Nhấn Reset để tạo dữ liệu mẫu.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {sortedData.length > 0 && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-sm text-slate-500">
              Hiển thị {Math.min((currentPage - 1) * itemsPerPage + 1, sortedData.length)} - {Math.min(currentPage * itemsPerPage, sortedData.length)} / {sortedData.length} mục
            </span>
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => p - 1)}
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
                  onClick={() => setCurrentPage(p => p + 1)}
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
