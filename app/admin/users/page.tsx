'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Button, Card, Badge, Input, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui';
import { BulkActionBar, SelectCheckbox } from '../components/TableUtilities';
import { mockUsers, mockRoles } from '../mockData';

export default function UsersListPage() {
  const [users, setUsers] = useState(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const filteredData = useMemo(() => {
    let data = [...users];
    if (searchTerm) {
      data = data.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    if (filterRole) {
      data = data.filter(u => u.roleId === filterRole);
    }
    return data;
  }, [users, searchTerm, filterRole]);

  const toggleSelectAll = () => setSelectedIds(selectedIds.length === filteredData.length ? [] : filteredData.map(u => u.id));
  const toggleSelectItem = (id: string) => setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

  const handleDelete = (id: string) => {
    if (confirm('Bạn có chắc muốn xóa người dùng này?')) {
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
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Người dùng hệ thống</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Quản lý tài khoản truy cập vào Admin</p>
        </div>
        <Link href="/admin/users/create"><Button className="gap-2"><Plus size={16}/> Thêm User</Button></Link>
      </div>

      <BulkActionBar selectedCount={selectedIds.length} onDelete={handleBulkDelete} onClearSelection={() => setSelectedIds([])} />

      <Card>
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex gap-4">
          <div className="relative max-w-xs flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input placeholder="Tìm kiếm theo tên, email..." className="pl-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <select className="h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm" value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
            <option value="">Tất cả vai trò</option>
            {mockRoles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]"><SelectCheckbox checked={selectedIds.length === filteredData.length && filteredData.length > 0} onChange={toggleSelectAll} indeterminate={selectedIds.length > 0 && selectedIds.length < filteredData.length} /></TableHead>
              <TableHead>Người dùng</TableHead>
              <TableHead>Vai trò</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Đăng nhập cuối</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map(user => (
              <TableRow key={user.id} className={selectedIds.includes(user.id) ? 'bg-blue-500/5' : ''}>
                <TableCell><SelectCheckbox checked={selectedIds.includes(user.id)} onChange={() => toggleSelectItem(user.id)} /></TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <img src={user.avatar} className="w-9 h-9 rounded-full object-cover" alt="" />
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-xs text-slate-500">{user.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={user.roleId === 'ROLE-ADMIN' ? 'default' : 'secondary'} className={user.roleId === 'ROLE-ADMIN' ? 'bg-purple-600' : ''}>
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={user.status === 'Active' ? 'success' : 'destructive'}>
                    {user.status === 'Active' ? 'Hoạt động' : 'Đã khóa'}
                  </Badge>
                </TableCell>
                <TableCell className="text-slate-500 text-sm">{user.lastLogin}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Link href={`/admin/users/${user.id}/edit`}><Button variant="ghost" size="icon"><Edit size={16}/></Button></Link>
                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => handleDelete(user.id)}><Trash2 size={16}/></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filteredData.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                  {searchTerm || filterRole ? 'Không tìm thấy kết quả phù hợp' : 'Chưa có người dùng nào'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {filteredData.length > 0 && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 text-sm text-slate-500">
            Hiển thị {filteredData.length} / {users.length} người dùng
          </div>
        )}
      </Card>
    </div>
  );
}
