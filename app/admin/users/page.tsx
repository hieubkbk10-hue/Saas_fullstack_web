'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Button, Card, Badge, Input, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui';
import { SortableHeader, BulkActionBar, SelectCheckbox, useSortableData } from '../components/TableUtilities';
import { mockUsers } from '../mockData';

export default function UsersListPage() {
  const [users, setUsers] = useState(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'asc' | 'desc' }>({ key: null, direction: 'asc' });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleSort = (key: string) => {
    setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc' }));
  };

  const filteredData = useMemo(() => {
    let data = [...users];
    if (searchTerm) {
      data = data.filter(u => 
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return data;
  }, [users, searchTerm]);

  const sortedData = useSortableData(filteredData, sortConfig);

  const toggleSelectAll = () => setSelectedIds(selectedIds.length === sortedData.length ? [] : sortedData.map(u => u.id));
  const toggleSelectItem = (id: string) => setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

  const handleDelete = (id: string) => {
    if (confirm('Xóa người dùng này?')) {
      setUsers(prev => prev.filter(u => u.id !== id));
      toast.success('Đã xóa người dùng');
    }
  };

  const handleBulkDelete = () => {
    if (confirm(`Xóa ${selectedIds.length} người dùng đã chọn?`)) {
      setUsers(prev => prev.filter(u => !selectedIds.includes(u.id)));
      setSelectedIds([]);
      toast.success(`Đã xóa ${selectedIds.length} người dùng`);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Danh sách User</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Quản lý tài khoản người dùng hệ thống</p>
        </div>
        <Link href="/admin/users/create"><Button className="gap-2"><Plus size={16}/> Thêm User</Button></Link>
      </div>

      <BulkActionBar selectedCount={selectedIds.length} onDelete={handleBulkDelete} onClearSelection={() => setSelectedIds([])} />

      <Card>
        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
          <div className="relative max-w-xs">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input placeholder="Tìm tên, email..." className="pl-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]"><SelectCheckbox checked={selectedIds.length === sortedData.length && sortedData.length > 0} onChange={toggleSelectAll} indeterminate={selectedIds.length > 0 && selectedIds.length < sortedData.length} /></TableHead>
              <TableHead className="w-[60px]">Avatar</TableHead>
              <SortableHeader label="Họ tên" sortKey="name" sortConfig={sortConfig} onSort={handleSort} />
              <SortableHeader label="Email" sortKey="email" sortConfig={sortConfig} onSort={handleSort} />
              <SortableHeader label="Vai trò" sortKey="role" sortConfig={sortConfig} onSort={handleSort} />
              <TableHead>Đăng nhập cuối</TableHead>
              <SortableHeader label="Trạng thái" sortKey="status" sortConfig={sortConfig} onSort={handleSort} />
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.map(user => (
              <TableRow key={user.id} className={selectedIds.includes(user.id) ? 'bg-blue-500/5' : ''}>
                <TableCell><SelectCheckbox checked={selectedIds.includes(user.id)} onChange={() => toggleSelectItem(user.id)} /></TableCell>
                <TableCell><img src={user.avatar} className="w-10 h-10 object-cover rounded-full" alt="" /></TableCell>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell className="text-slate-500">{user.email}</TableCell>
                <TableCell><Badge variant="info">{user.role}</Badge></TableCell>
                <TableCell className="text-slate-500 text-sm">{user.lastLogin}</TableCell>
                <TableCell>
                  <Badge variant={user.status === 'Active' ? 'success' : user.status === 'Inactive' ? 'secondary' : 'destructive'}>
                    {user.status === 'Active' ? 'Hoạt động' : user.status === 'Inactive' ? 'Không hoạt động' : 'Bị cấm'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Link href={`/admin/users/${user.id}/edit`}><Button variant="ghost" size="icon"><Edit size={16}/></Button></Link>
                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => handleDelete(user.id)}><Trash2 size={16}/></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {sortedData.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                  {searchTerm ? 'Không tìm thấy kết quả phù hợp' : 'Chưa có người dùng nào'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {sortedData.length > 0 && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 text-sm text-slate-500">
            Hiển thị {sortedData.length} / {users.length} người dùng
          </div>
        )}
      </Card>
    </div>
  );
}
