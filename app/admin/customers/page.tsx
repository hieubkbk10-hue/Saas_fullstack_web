'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Plus, Edit, Trash2, Search, Loader2, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { Button, Card, Badge, Input, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui';
import { ColumnToggle, SortableHeader, BulkActionBar, SelectCheckbox, useSortableData } from '../components/TableUtilities';
import { ModuleGuard } from '../components/ModuleGuard';

const MODULE_KEY = 'customers';

export default function CustomersListPage() {
  return (
    <ModuleGuard moduleKey={MODULE_KEY}>
      <CustomersContent />
    </ModuleGuard>
  );
}

function CustomersContent() {
  // Convex queries
  const customersData = useQuery(api.customers.listAll);
  const settingsData = useQuery(api.admin.modules.listModuleSettings, { moduleKey: MODULE_KEY });
  const featuresData = useQuery(api.admin.modules.listModuleFeatures, { moduleKey: MODULE_KEY });

  // Convex mutations
  const deleteCustomer = useMutation(api.customers.remove);
  const seedCustomersModule = useMutation(api.seed.seedCustomersModule);
  const clearCustomersData = useMutation(api.seed.clearCustomersData);

  // States
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'asc' | 'desc' }>({ key: null, direction: 'asc' });
  const [visibleColumns, setVisibleColumns] = useState(['select', 'customer', 'contact', 'orders', 'totalSpent', 'status', 'actions']);
  const [selectedIds, setSelectedIds] = useState<Id<"customers">[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const isLoading = customersData === undefined;

  // Get customersPerPage from settings
  const customersPerPage = useMemo(() => {
    const setting = settingsData?.find(s => s.settingKey === 'customersPerPage');
    return (setting?.value as number) || 20;
  }, [settingsData]);

  // Get enabled features
  const enabledFeatures = useMemo(() => {
    const features: Record<string, boolean> = {};
    featuresData?.forEach(f => { features[f.featureKey] = f.enabled; });
    return features;
  }, [featuresData]);

  const showAvatar = enabledFeatures.enableAvatar ?? true;

  const columns = [
    { key: 'select', label: 'Chọn' },
    { key: 'customer', label: 'Khách hàng', required: true },
    { key: 'contact', label: 'Liên hệ' },
    { key: 'city', label: 'Thành phố' },
    { key: 'orders', label: 'Đơn hàng' },
    { key: 'totalSpent', label: 'Tổng chi tiêu' },
    { key: 'status', label: 'Trạng thái' },
    { key: 'actions', label: 'Hành động', required: true }
  ];

  // Map customers data
  const customers = useMemo(() => {
    return customersData?.map(c => ({
      ...c,
      id: c._id,
    })) || [];
  }, [customersData]);

  // Filter data
  const filteredData = useMemo(() => {
    let data = [...customers];
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      data = data.filter(c =>
        c.name.toLowerCase().includes(term) ||
        c.email.toLowerCase().includes(term) ||
        c.phone.includes(searchTerm)
      );
    }
    if (filterStatus) {
      data = data.filter(c => c.status === filterStatus);
    }
    return data;
  }, [customers, searchTerm, filterStatus]);

  const sortedData = useSortableData(filteredData, sortConfig);

  // Pagination
  const totalPages = Math.ceil(sortedData.length / customersPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * customersPerPage;
    return sortedData.slice(start, start + customersPerPage);
  }, [sortedData, currentPage, customersPerPage]);

  const handleSort = (key: string) => {
    setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc' }));
    setCurrentPage(1);
    setSelectedIds([]);
  };

  const handleFilterChange = (value: string) => {
    setFilterStatus(value);
    setCurrentPage(1);
    setSelectedIds([]);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
    setSelectedIds([]);
  };

  const toggleColumn = (key: string) => {
    setVisibleColumns(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  const toggleSelectAll = () => setSelectedIds(selectedIds.length === paginatedData.length ? [] : paginatedData.map(c => c._id));
  const toggleSelectItem = (id: Id<"customers">) => setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

  const handleDelete = async (id: Id<"customers">) => {
    if (confirm('Xóa khách hàng này? Các đơn hàng liên quan sẽ được giữ lại.')) {
      try {
        await deleteCustomer({ id, cascadeOrders: false });
        toast.success('Đã xóa khách hàng');
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Có lỗi khi xóa khách hàng';
        toast.error(message);
      }
    }
  };

  const handleBulkDelete = async () => {
    if (confirm(`Xóa ${selectedIds.length} khách hàng đã chọn?`)) {
      try {
        for (const id of selectedIds) {
          await deleteCustomer({ id, cascadeOrders: false });
        }
        setSelectedIds([]);
        toast.success(`Đã xóa ${selectedIds.length} khách hàng`);
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Có lỗi khi xóa khách hàng';
        toast.error(message);
      }
    }
  };

  const handleReseed = async () => {
    if (confirm('Reset dữ liệu khách hàng về mẫu ban đầu?')) {
      try {
        await clearCustomersData();
        await seedCustomersModule();
        toast.success('Đã reset dữ liệu khách hàng');
      } catch {
        toast.error('Có lỗi khi reset dữ liệu');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Khách hàng</h1>
          <p className="text-sm text-slate-500">Quản lý thông tin khách hàng và lịch sử mua hàng</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={handleReseed} title="Reset dữ liệu mẫu">
            <RefreshCw size={16} /> Reset
          </Button>
          <Link href="/admin/customers/create">
            <Button className="gap-2"><Plus size={16} /> Thêm mới</Button>
          </Link>
        </div>
      </div>

      <BulkActionBar selectedCount={selectedIds.length} onDelete={handleBulkDelete} onClearSelection={() => setSelectedIds([])} />

      <Card>
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex flex-wrap gap-3 flex-1">
            <div className="relative max-w-xs">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Tìm tên, email, SĐT..."
                className="pl-9 w-56"
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </div>
            <select
              className="h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
              value={filterStatus}
              onChange={(e) => handleFilterChange(e.target.value)}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="Active">Hoạt động</option>
              <option value="Inactive">Đã khóa</option>
            </select>
          </div>
          <ColumnToggle columns={columns} visibleColumns={visibleColumns} onToggle={toggleColumn} />
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              {visibleColumns.includes('select') && (
                <TableHead className="w-[40px]">
                  <SelectCheckbox
                    checked={selectedIds.length === paginatedData.length && paginatedData.length > 0}
                    onChange={toggleSelectAll}
                    indeterminate={selectedIds.length > 0 && selectedIds.length < paginatedData.length}
                  />
                </TableHead>
              )}
              {visibleColumns.includes('customer') && <SortableHeader label="Khách hàng" sortKey="name" sortConfig={sortConfig} onSort={handleSort} />}
              {visibleColumns.includes('contact') && <TableHead>Liên hệ</TableHead>}
              {visibleColumns.includes('city') && <SortableHeader label="Thành phố" sortKey="city" sortConfig={sortConfig} onSort={handleSort} />}
              {visibleColumns.includes('orders') && <SortableHeader label="Đơn hàng" sortKey="ordersCount" sortConfig={sortConfig} onSort={handleSort} className="text-center" />}
              {visibleColumns.includes('totalSpent') && <SortableHeader label="Tổng chi tiêu" sortKey="totalSpent" sortConfig={sortConfig} onSort={handleSort} className="text-right" />}
              {visibleColumns.includes('status') && <SortableHeader label="Trạng thái" sortKey="status" sortConfig={sortConfig} onSort={handleSort} className="text-center" />}
              {visibleColumns.includes('actions') && <TableHead className="text-right">Hành động</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map(customer => (
              <TableRow key={customer._id} className={selectedIds.includes(customer._id) ? 'bg-blue-500/5' : ''}>
                {visibleColumns.includes('select') && (
                  <TableCell>
                    <SelectCheckbox checked={selectedIds.includes(customer._id)} onChange={() => toggleSelectItem(customer._id)} />
                  </TableCell>
                )}
                {visibleColumns.includes('customer') && (
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {showAvatar && (
                        customer.avatar ? (
                          <img src={customer.avatar} className="w-9 h-9 rounded-full object-cover" alt="" />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 font-medium text-sm">
                            {customer.name.charAt(0).toUpperCase()}
                          </div>
                        )
                      )}
                      <div className="font-medium">{customer.name}</div>
                    </div>
                  </TableCell>
                )}
                {visibleColumns.includes('contact') && (
                  <TableCell>
                    <div className="text-sm">{customer.email}</div>
                    <div className="text-xs text-slate-500">{customer.phone}</div>
                  </TableCell>
                )}
                {visibleColumns.includes('city') && (
                  <TableCell className="text-slate-500">{customer.city || '-'}</TableCell>
                )}
                {visibleColumns.includes('orders') && (
                  <TableCell className="text-center">
                    <Badge variant="secondary">{customer.ordersCount}</Badge>
                  </TableCell>
                )}
                {visibleColumns.includes('totalSpent') && (
                  <TableCell className="text-right font-medium">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(customer.totalSpent)}
                  </TableCell>
                )}
                {visibleColumns.includes('status') && (
                  <TableCell className="text-center">
                    <Badge variant={customer.status === 'Active' ? 'success' : 'secondary'}>
                      {customer.status === 'Active' ? 'Hoạt động' : 'Đã khóa'}
                    </Badge>
                  </TableCell>
                )}
                {visibleColumns.includes('actions') && (
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/admin/customers/${customer._id}/edit`}>
                        <Button variant="ghost" size="icon"><Edit size={16} /></Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-600"
                        onClick={() => handleDelete(customer._id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
            {paginatedData.length === 0 && (
              <TableRow>
                <TableCell colSpan={visibleColumns.length} className="text-center py-8 text-slate-500">
                  {searchTerm || filterStatus ? 'Không tìm thấy kết quả phù hợp' : 'Chưa có khách hàng nào'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {sortedData.length > 0 && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-sm text-slate-500">
              Hiển thị {(currentPage - 1) * customersPerPage + 1} - {Math.min(currentPage * customersPerPage, sortedData.length)} / {sortedData.length} khách hàng
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
