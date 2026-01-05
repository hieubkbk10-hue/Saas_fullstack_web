'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Button, Card, Badge, Input, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui';
import { SortableHeader, BulkActionBar, SelectCheckbox, useSortableData } from '../components/TableUtilities';
import { mockCustomers } from '../mockData';

export default function CustomersListPage() {
  const [customers, setCustomers] = useState(mockCustomers);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'asc' | 'desc' }>({ key: null, direction: 'asc' });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleSort = (key: string) => {
    setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc' }));
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
    return data;
  }, [customers, searchTerm]);

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
          <p className="text-sm text-slate-500 dark:text-slate-400">Quản lý thông tin khách hàng</p>
        </div>
        <Link href="/admin/customers/create"><Button className="gap-2"><Plus size={16}/> Thêm khách hàng</Button></Link>
      </div>

      <BulkActionBar selectedCount={selectedIds.length} onDelete={handleBulkDelete} onClearSelection={() => setSelectedIds([])} />

      <Card>
        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
          <div className="relative max-w-xs">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input placeholder="Tìm tên, email, SĐT..." className="pl-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]"><SelectCheckbox checked={selectedIds.length === sortedData.length && sortedData.length > 0} onChange={toggleSelectAll} indeterminate={selectedIds.length > 0 && selectedIds.length < sortedData.length} /></TableHead>
              <TableHead className="w-[60px]">Avatar</TableHead>
              <SortableHeader label="Họ tên" sortKey="name" sortConfig={sortConfig} onSort={handleSort} />
              <SortableHeader label="Email" sortKey="email" sortConfig={sortConfig} onSort={handleSort} />
              <SortableHeader label="Điện thoại" sortKey="phone" sortConfig={sortConfig} onSort={handleSort} />
              <SortableHeader label="Đơn hàng" sortKey="ordersCount" sortConfig={sortConfig} onSort={handleSort} />
              <SortableHeader label="Trạng thái" sortKey="status" sortConfig={sortConfig} onSort={handleSort} />
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.map(customer => (
              <TableRow key={customer.id} className={selectedIds.includes(customer.id) ? 'bg-blue-500/5' : ''}>
                <TableCell><SelectCheckbox checked={selectedIds.includes(customer.id)} onChange={() => toggleSelectItem(customer.id)} /></TableCell>
                <TableCell><img src={customer.avatar} className="w-10 h-10 object-cover rounded-full" alt="" /></TableCell>
                <TableCell className="font-medium">{customer.name}</TableCell>
                <TableCell className="text-slate-500">{customer.email}</TableCell>
                <TableCell>{customer.phone}</TableCell>
                <TableCell><Badge variant="secondary">{customer.ordersCount}</Badge></TableCell>
                <TableCell>
                  <Badge variant={customer.status === 'Active' ? 'success' : 'secondary'}>
                    {customer.status === 'Active' ? 'Hoạt động' : 'Không hoạt động'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Link href={`/admin/customers/${customer.id}/edit`}><Button variant="ghost" size="icon"><Edit size={16}/></Button></Link>
                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => handleDelete(customer.id)}><Trash2 size={16}/></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {sortedData.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                  {searchTerm ? 'Không tìm thấy kết quả phù hợp' : 'Chưa có khách hàng nào'}
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
