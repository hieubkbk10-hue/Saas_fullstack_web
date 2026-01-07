'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Plus, Edit, Trash2, Search, Loader2, RefreshCw, ShoppingBag, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { Button, Card, Badge, Input, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui';
import { ColumnToggle, SortableHeader, BulkActionBar, SelectCheckbox, useSortableData } from '../components/TableUtilities';
import { ModuleGuard } from '../components/ModuleGuard';

const MODULE_KEY = 'orders';

type OrderStatus = 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
type PaymentStatus = 'Pending' | 'Paid' | 'Failed' | 'Refunded';

const STATUS_COLORS: Record<OrderStatus, 'secondary' | 'warning' | 'success' | 'destructive'> = {
  Pending: 'secondary',
  Processing: 'warning',
  Shipped: 'warning',
  Delivered: 'success',
  Cancelled: 'destructive',
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  Pending: 'Chờ xử lý',
  Processing: 'Đang xử lý',
  Shipped: 'Đang giao',
  Delivered: 'Hoàn thành',
  Cancelled: 'Đã hủy',
};

const PAYMENT_STATUS_COLORS: Record<PaymentStatus, 'secondary' | 'success' | 'destructive'> = {
  Pending: 'secondary',
  Paid: 'success',
  Failed: 'destructive',
  Refunded: 'secondary',
};

const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  Pending: 'Chờ TT',
  Paid: 'Đã TT',
  Failed: 'Thất bại',
  Refunded: 'Hoàn tiền',
};

export default function OrdersListPage() {
  return (
    <ModuleGuard moduleKey="orders">
      <OrdersContent />
    </ModuleGuard>
  );
}

function OrdersContent() {
  const ordersData = useQuery(api.orders.listAll);
  const customersData = useQuery(api.customers.listAll);
  const fieldsData = useQuery(api.admin.modules.listEnabledModuleFields, { moduleKey: MODULE_KEY });
  const settingsData = useQuery(api.admin.modules.listModuleSettings, { moduleKey: MODULE_KEY });
  const deleteOrder = useMutation(api.orders.remove);
  const seedOrdersModule = useMutation(api.seed.seedOrdersModule);
  const clearOrdersData = useMutation(api.seed.clearOrdersData);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPaymentStatus, setFilterPaymentStatus] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'asc' | 'desc' }>({ key: null, direction: 'asc' });
  const [visibleColumns, setVisibleColumns] = useState<string[]>([]);
  const [selectedIds, setSelectedIds] = useState<Id<"orders">[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const isLoading = ordersData === undefined || customersData === undefined || fieldsData === undefined;

  const enabledFields = useMemo(() => {
    const fields = new Set<string>();
    fieldsData?.forEach(f => fields.add(f.fieldKey));
    return fields;
  }, [fieldsData]);

  const columns = useMemo(() => {
    const cols = [
      { key: 'select', label: 'Chọn' },
      { key: 'orderNumber', label: 'Mã đơn', required: true },
      { key: 'customer', label: 'Khách hàng' },
      { key: 'items', label: 'Sản phẩm' },
      { key: 'totalAmount', label: 'Tổng tiền' },
      { key: 'status', label: 'Trạng thái' },
    ];
    if (enabledFields.has('paymentStatus')) cols.push({ key: 'paymentStatus', label: 'Thanh toán' });
    if (enabledFields.has('trackingNumber')) cols.push({ key: 'trackingNumber', label: 'Mã vận đơn' });
    cols.push({ key: 'createdAt', label: 'Ngày tạo' });
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
    const map: Record<string, string> = {};
    customersData?.forEach(c => { map[c._id] = c.name; });
    return map;
  }, [customersData]);

  const orders = useMemo(() => {
    return ordersData?.map(o => ({
      ...o,
      id: o._id,
      customerName: customerMap[o.customerId] || 'Không xác định',
      itemsCount: o.items.reduce((sum, item) => sum + item.quantity, 0),
    })) || [];
  }, [ordersData, customerMap]);

  const handleSort = (key: string) => {
    setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc' }));
  };

  const toggleColumn = (key: string) => {
    setVisibleColumns(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  const filteredData = useMemo(() => {
    let data = [...orders];
    if (searchTerm) {
      data = data.filter(o => 
        o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.customerName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (filterStatus) data = data.filter(o => o.status === filterStatus);
    if (filterPaymentStatus) data = data.filter(o => o.paymentStatus === filterPaymentStatus);
    return data;
  }, [orders, searchTerm, filterStatus, filterPaymentStatus]);

  const sortedData = useSortableData(filteredData, sortConfig);

  // Lấy ordersPerPage từ settings
  const ordersPerPage = useMemo(() => {
    const setting = settingsData?.find(s => s.settingKey === 'ordersPerPage');
    return (setting?.value as number) || 20;
  }, [settingsData]);

  // Pagination
  const totalPages = Math.ceil(sortedData.length / ordersPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * ordersPerPage;
    return sortedData.slice(start, start + ordersPerPage);
  }, [sortedData, currentPage, ordersPerPage]);

  // Reset page khi filter thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, filterPaymentStatus]);

  const toggleSelectAll = () => setSelectedIds(selectedIds.length === paginatedData.length ? [] : paginatedData.map(o => o._id));
  const toggleSelectItem = (id: Id<"orders">) => setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

  const handleDelete = async (id: Id<"orders">) => {
    if (confirm('Xóa đơn hàng này?')) {
      try {
        await deleteOrder({ id });
        toast.success('Đã xóa đơn hàng');
      } catch {
        toast.error('Có lỗi khi xóa đơn hàng');
      }
    }
  };

  const handleBulkDelete = async () => {
    if (confirm(`Xóa ${selectedIds.length} đơn hàng đã chọn?`)) {
      try {
        for (const id of selectedIds) {
          await deleteOrder({ id });
        }
        setSelectedIds([]);
        toast.success(`Đã xóa ${selectedIds.length} đơn hàng`);
      } catch {
        toast.error('Có lỗi khi xóa đơn hàng');
      }
    }
  };

  const handleReset = async () => {
    if (confirm('Xóa tất cả đơn hàng và seed lại dữ liệu mẫu?')) {
      try {
        await clearOrdersData();
        await seedOrdersModule();
        setSelectedIds([]);
        toast.success('Đã reset dữ liệu đơn hàng');
      } catch {
        toast.error('Có lỗi khi reset dữ liệu');
      }
    }
  };

  const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  const formatDate = (timestamp: number) => new Date(timestamp).toLocaleDateString('vi-VN');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Đơn hàng</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Quản lý đơn hàng và vận chuyển</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={handleReset} title="Reset dữ liệu mẫu">
            <RefreshCw size={16}/> Reset
          </Button>
          <Link href="/admin/orders/create"><Button className="gap-2 bg-emerald-600 hover:bg-emerald-500"><Plus size={16}/> Tạo đơn hàng</Button></Link>
        </div>
      </div>

      <BulkActionBar selectedCount={selectedIds.length} onDelete={handleBulkDelete} onClearSelection={() => setSelectedIds([])} />

      <Card>
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex flex-wrap gap-3 flex-1">
            <div className="relative max-w-xs">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input placeholder="Tìm mã đơn, khách hàng..." className="pl-9 w-48" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <select className="h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="">Tất cả trạng thái</option>
              <option value="Pending">Chờ xử lý</option>
              <option value="Processing">Đang xử lý</option>
              <option value="Shipped">Đang giao</option>
              <option value="Delivered">Hoàn thành</option>
              <option value="Cancelled">Đã hủy</option>
            </select>
            {enabledFields.has('paymentStatus') && (
              <select className="h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm" value={filterPaymentStatus} onChange={(e) => setFilterPaymentStatus(e.target.value)}>
                <option value="">Tất cả TT toán</option>
                <option value="Pending">Chờ thanh toán</option>
                <option value="Paid">Đã thanh toán</option>
                <option value="Failed">Thất bại</option>
                <option value="Refunded">Hoàn tiền</option>
              </select>
            )}
          </div>
          <ColumnToggle columns={columns} visibleColumns={visibleColumns} onToggle={toggleColumn} />
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              {visibleColumns.includes('select') && <TableHead className="w-[40px]"><SelectCheckbox checked={selectedIds.length === paginatedData.length && paginatedData.length > 0} onChange={toggleSelectAll} indeterminate={selectedIds.length > 0 && selectedIds.length < paginatedData.length} /></TableHead>}
              {visibleColumns.includes('orderNumber') && <SortableHeader label="Mã đơn" sortKey="orderNumber" sortConfig={sortConfig} onSort={handleSort} />}
              {visibleColumns.includes('customer') && <SortableHeader label="Khách hàng" sortKey="customerName" sortConfig={sortConfig} onSort={handleSort} />}
              {visibleColumns.includes('items') && <TableHead>Sản phẩm</TableHead>}
              {visibleColumns.includes('totalAmount') && <SortableHeader label="Tổng tiền" sortKey="totalAmount" sortConfig={sortConfig} onSort={handleSort} />}
              {visibleColumns.includes('status') && <SortableHeader label="Trạng thái" sortKey="status" sortConfig={sortConfig} onSort={handleSort} />}
              {visibleColumns.includes('paymentStatus') && enabledFields.has('paymentStatus') && <SortableHeader label="Thanh toán" sortKey="paymentStatus" sortConfig={sortConfig} onSort={handleSort} />}
              {visibleColumns.includes('trackingNumber') && enabledFields.has('trackingNumber') && <TableHead>Mã vận đơn</TableHead>}
              {visibleColumns.includes('createdAt') && <SortableHeader label="Ngày tạo" sortKey="_creationTime" sortConfig={sortConfig} onSort={handleSort} />}
              {visibleColumns.includes('actions') && <TableHead className="text-right">Hành động</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map(order => (
              <TableRow key={order._id} className={selectedIds.includes(order._id) ? 'bg-emerald-500/5' : ''}>
                {visibleColumns.includes('select') && <TableCell><SelectCheckbox checked={selectedIds.includes(order._id)} onChange={() => toggleSelectItem(order._id)} /></TableCell>}
                {visibleColumns.includes('orderNumber') && <TableCell className="font-mono text-sm font-medium text-emerald-600">{order.orderNumber}</TableCell>}
                {visibleColumns.includes('customer') && <TableCell>{order.customerName}</TableCell>}
                {visibleColumns.includes('items') && (
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <ShoppingBag size={14} className="text-slate-400" />
                      <span>{order.itemsCount} sản phẩm</span>
                    </div>
                  </TableCell>
                )}
                {visibleColumns.includes('totalAmount') && <TableCell className="font-medium">{formatPrice(order.totalAmount)}</TableCell>}
                {visibleColumns.includes('status') && (
                  <TableCell>
                    <Badge variant={STATUS_COLORS[order.status as OrderStatus]}>
                      {STATUS_LABELS[order.status as OrderStatus]}
                    </Badge>
                  </TableCell>
                )}
                {visibleColumns.includes('paymentStatus') && enabledFields.has('paymentStatus') && order.paymentStatus && (
                  <TableCell>
                    <Badge variant={PAYMENT_STATUS_COLORS[order.paymentStatus as PaymentStatus]}>
                      {PAYMENT_STATUS_LABELS[order.paymentStatus as PaymentStatus]}
                    </Badge>
                  </TableCell>
                )}
                {visibleColumns.includes('trackingNumber') && enabledFields.has('trackingNumber') && (
                  <TableCell className="font-mono text-xs text-slate-500">{order.trackingNumber || '-'}</TableCell>
                )}
                {visibleColumns.includes('createdAt') && <TableCell className="text-slate-500 text-sm">{formatDate(order._creationTime)}</TableCell>}
                {visibleColumns.includes('actions') && (
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/admin/orders/${order._id}/edit`}><Button variant="ghost" size="icon" title="Xem chi tiết"><Eye size={16}/></Button></Link>
                      <Link href={`/admin/orders/${order._id}/edit`}><Button variant="ghost" size="icon"><Edit size={16}/></Button></Link>
                      <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => handleDelete(order._id)}><Trash2 size={16}/></Button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
            {paginatedData.length === 0 && (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-8 text-slate-500">
                  {searchTerm || filterStatus || filterPaymentStatus ? 'Không tìm thấy kết quả phù hợp' : 'Chưa có đơn hàng nào. Nhấn Reset để tạo dữ liệu mẫu.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {sortedData.length > 0 && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-sm text-slate-500">
              Hiển thị {(currentPage - 1) * ordersPerPage + 1} - {Math.min(currentPage * ordersPerPage, sortedData.length)} / {sortedData.length} đơn hàng
            </span>
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                >
                  Trước
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
                  Sau
                </Button>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
