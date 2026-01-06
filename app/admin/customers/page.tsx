'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Button, Card, Badge, Input, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui';
import { ColumnToggle, SortableHeader, BulkActionBar, SelectCheckbox, useSortableData } from '../components/TableUtilities';
import { ModuleGuard } from '../components/ModuleGuard';
import { mockCustomers } from '../mockData';

export default function CustomersListPage() {
  return (
    <ModuleGuard moduleKey="customers">
      <CustomersContent />
    </ModuleGuard>
  );
}

function CustomersContent() {
  const [customers, setCustomers] = useState(mockCustomers);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'asc' | 'desc' }>({ key: null, direction: 'asc' });
  const [visibleColumns, setVisibleColumns] = useState(['select', 'customer', 'contact', 'orders', 'totalSpent', 'status', 'actions']);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const columns = [
    { key: 'select', label: 'Chọn' },
    { key: 'customer', label: 'Khách hàng', required: true },
    { key: 'contact', label: 'Liên hệ' },
    { key: 'orders', label: 'Đơn hàng' },
    { key: 'totalSpent', label: 'Tổng chi tiêu' },
    { key: 'joined', label: 'Ngày tham gia' },
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
    let data = [...customers];
    if (searchTerm) {
      data = data.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone.includes(searchTerm)
      );
    }
    if (filterStatus) {
      data = data.filter(c => c.status === filterStatus);
    }
    return data;
  }, [customers, searchTerm, filterStatus]);

  const sortedData = useSortableData(filteredData, sortConfig);

  const toggleSelectAll = () => setSelectedIds(selectedIds.length === sortedData.length ? [] : sortedData.map(c => c.id));
  const toggleSelectItem = (id: string) => setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

  const handleDelete = (id: string) => {
    if (confirm('Xóa khách hàng này?')) {
      setCustomers(prev => prev.filter(c => c.id !== id));
      toast.success('Đã xóa khách hàng');
    }
  };

  const handleBulkDelete = () => {
    if (confirm(`Xóa ${selectedIds.length} khách hàng đã chọn?`)) {
      setCustomers(prev => prev.filter(c => !selectedIds.includes(c.id)));
      setSelectedIds([]);
      toast.success(`Đã xóa ${selectedIds.length} khách hàng`);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Khách hàng</h1>
          <p className="text-sm text-slate-500">Danh sách người dùng và lịch sử mua hàng</p>
        </div>
        <Link href="/admin/customers/create"><Button className="gap-2"><Plus size={16}/> Thêm mới</Button></Link>
      </div>

      <BulkActionBar selectedCount={selectedIds.length} onDelete={handleBulkDelete} onClearSelection={() => setSelectedIds([])} />

      <Card>
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex flex-wrap gap-3 flex-1">
            <div className="relative max-w-xs">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input placeholder="Tìm tên, email, SĐT..." className="pl-9 w-56" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <select className="h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
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
              {visibleColumns.includes('select') && <TableHead className="w-[40px]"><SelectCheckbox checked={selectedIds.length === sortedData.length && sortedData.length > 0} onChange={toggleSelectAll} indeterminate={selectedIds.length > 0 && selectedIds.length < sortedData.length} /></TableHead>}
              {visibleColumns.includes('customer') && <SortableHeader label="Khách hàng" sortKey="name" sortConfig={sortConfig} onSort={handleSort} />}
              {visibleColumns.includes('contact') && <TableHead>Liên hệ</TableHead>}
              {visibleColumns.includes('orders') && <SortableHeader label="Đơn hàng" sortKey="ordersCount" sortConfig={sortConfig} onSort={handleSort} className="text-center" />}
              {visibleColumns.includes('totalSpent') && <SortableHeader label="Tổng chi tiêu" sortKey="totalSpent" sortConfig={sortConfig} onSort={handleSort} className="text-right" />}
              {visibleColumns.includes('joined') && <SortableHeader label="Ngày tham gia" sortKey="joined" sortConfig={sortConfig} onSort={handleSort} />}
              {visibleColumns.includes('status') && <SortableHeader label="Trạng thái" sortKey="status" sortConfig={sortConfig} onSort={handleSort} className="text-center" />}
              {visibleColumns.includes('actions') && <TableHead className="text-right">Hành động</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.map(cus => (
              <TableRow key={cus.id} className={selectedIds.includes(cus.id) ? 'bg-blue-500/5' : ''}>
                {visibleColumns.includes('select') && <TableCell><SelectCheckbox checked={selectedIds.includes(cus.id)} onChange={() => toggleSelectItem(cus.id)} /></TableCell>}
                {visibleColumns.includes('customer') && (
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img src={cus.avatar} className="w-9 h-9 rounded-full object-cover" alt="" />
                      <div className="font-medium">{cus.name}</div>
                    </div>
                  </TableCell>
                )}
                {visibleColumns.includes('contact') && (
                  <TableCell>
                    <div className="text-sm">{cus.email}</div>
                    <div className="text-xs text-slate-500">{cus.phone}</div>
                  </TableCell>
                )}
                {visibleColumns.includes('orders') && <TableCell className="text-center"><Badge variant="secondary">{cus.ordersCount}</Badge></TableCell>}
                {visibleColumns.includes('totalSpent') && <TableCell className="text-right font-medium">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(cus.totalSpent)}</TableCell>}
                {visibleColumns.includes('joined') && <TableCell className="text-slate-500 text-sm">{new Date(cus.joined).toLocaleDateString('vi-VN')}</TableCell>}
                {visibleColumns.includes('status') && (
                  <TableCell className="text-center">
                    <Badge variant={cus.status === 'Active' ? 'success' : 'secondary'}>{cus.status === 'Active' ? 'Hoạt động' : 'Đã khóa'}</Badge>
                  </TableCell>
                )}
                {visibleColumns.includes('actions') && (
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/admin/customers/${cus.id}/edit`}><Button variant="ghost" size="icon"><Edit size={16}/></Button></Link>
                      <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => handleDelete(cus.id)}><Trash2 size={16}/></Button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
            {sortedData.length === 0 && (
              <TableRow>
                <TableCell colSpan={visibleColumns.length} className="text-center py-8 text-slate-500">
                  {searchTerm || filterStatus ? 'Không tìm thấy kết quả phù hợp' : 'Chưa có khách hàng nào'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {sortedData.length > 0 && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 text-sm text-slate-500">
            Hiển thị {sortedData.length} / {customers.length} khách hàng
          </div>
        )}
      </Card>
    </div>
  );
}
