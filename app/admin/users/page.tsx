'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Plus, Edit, Trash2, Search, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Button, Card, Badge, Input, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui';
import { SortableHeader, BulkActionBar, SelectCheckbox, useSortableData } from '../components/TableUtilities';
import { ModuleGuard } from '../components/ModuleGuard';

export default function UsersListPage() {
  return (
    <ModuleGuard moduleKey="users">
      <UsersContent />
    </ModuleGuard>
  );
}

function UsersContent() {
  const usersData = useQuery(api.users.listAll);
  const rolesData = useQuery(api.roles.listAll);
  const deleteUser = useMutation(api.users.remove);
  const seedUsersModule = useMutation(api.seed.seedUsersModule);
  const clearUsersData = useMutation(api.seed.clearUsersData);

  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'asc' | 'desc' }>({ key: null, direction: 'asc' });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedIds, setSelectedIds] = useState<Id<"users">[]>([]);

  const isLoading = usersData === undefined || rolesData === undefined;

  const roleMap = useMemo(() => {
    const map: Record<string, { name: string; color?: string }> = {};
    rolesData?.forEach(role => { map[role._id] = { name: role.name, color: role.color }; });
    return map;
  }, [rolesData]);

  const users = useMemo(() => {
    return usersData?.map(user => ({
      ...user,
      roleName: roleMap[user.roleId]?.name || 'N/A',
      roleColor: roleMap[user.roleId]?.color,
    })) || [];
  }, [usersData, roleMap]);

  const filteredUsers = useMemo(() => {
    let data = [...users];
    if (searchTerm) {
      data = data.filter(u => 
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (filterRole) {
      data = data.filter(u => u.roleId === filterRole);
    }
    if (filterStatus) {
      data = data.filter(u => u.status === filterStatus);
    }
    return data;
  }, [users, searchTerm, filterRole, filterStatus]);

  const sortedUsers = useSortableData(filteredUsers, sortConfig);

  const handleSort = (key: string) => {
    setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc' }));
  };

  const toggleSelectAll = () => setSelectedIds(selectedIds.length === sortedUsers.length ? [] : sortedUsers.map(u => u._id));
  const toggleSelectItem = (id: Id<"users">) => setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

  const handleDelete = async (id: Id<"users">) => {
    if (confirm('Bạn có chắc muốn xóa người dùng này?')) {
      try {
        await deleteUser({ id });
        toast.success('Đã xóa người dùng');
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra');
      }
    }
  };

  const handleBulkDelete = async () => {
    if (confirm(`Xóa ${selectedIds.length} người dùng đã chọn?`)) {
      try {
        for (const id of selectedIds) {
          await deleteUser({ id });
        }
        setSelectedIds([]);
        toast.success(`Đã xóa ${selectedIds.length} người dùng`);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra');
      }
    }
  };

  const handleReseed = async () => {
    if (confirm('Xóa tất cả users/roles và seed lại dữ liệu mẫu?')) {
      try {
        await clearUsersData();
        await seedUsersModule();
        toast.success('Đã reset dữ liệu users');
      } catch {
        toast.error('Có lỗi khi reset dữ liệu');
      }
    }
  };

  const formatLastLogin = (timestamp?: number) => {
    if (!timestamp) return 'Chưa đăng nhập';
    const date = new Date(timestamp);
    return date.toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' });
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
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Người dùng hệ thống</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Quản lý tài khoản truy cập vào Admin</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={handleReseed} title="Reset dữ liệu mẫu">
            <RefreshCw size={16}/> Reset
          </Button>
          <Link href="/admin/users/create"><Button className="gap-2"><Plus size={16}/> Thêm User</Button></Link>
        </div>
      </div>

      <BulkActionBar selectedCount={selectedIds.length} onDelete={handleBulkDelete} onClearSelection={() => setSelectedIds([])} />

      <Card>
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-4">
          <div className="relative max-w-xs flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input placeholder="Tìm kiếm theo tên, email..." className="pl-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <select 
            className="h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm" 
            value={filterRole} 
            onChange={(e) => setFilterRole(e.target.value)}
          >
            <option value="">Tất cả vai trò</option>
            {rolesData?.map(r => <option key={r._id} value={r._id}>{r.name}</option>)}
          </select>
          <select 
            className="h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm" 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="Active">Hoạt động</option>
            <option value="Inactive">Không hoạt động</option>
            <option value="Banned">Bị cấm</option>
          </select>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]"><SelectCheckbox checked={selectedIds.length === sortedUsers.length && sortedUsers.length > 0} onChange={toggleSelectAll} indeterminate={selectedIds.length > 0 && selectedIds.length < sortedUsers.length} /></TableHead>
              <SortableHeader label="Người dùng" sortKey="name" sortConfig={sortConfig} onSort={handleSort} />
              <SortableHeader label="Vai trò" sortKey="roleName" sortConfig={sortConfig} onSort={handleSort} />
              <SortableHeader label="Trạng thái" sortKey="status" sortConfig={sortConfig} onSort={handleSort} />
              <TableHead>Đăng nhập cuối</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedUsers.map(user => (
              <TableRow key={user._id} className={selectedIds.includes(user._id) ? 'bg-blue-500/5' : ''}>
                <TableCell><SelectCheckbox checked={selectedIds.includes(user._id)} onChange={() => toggleSelectItem(user._id)} /></TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    {user.avatar ? (
                      <img src={user.avatar} className="w-9 h-9 rounded-full object-cover" alt="" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-sm font-medium text-slate-500">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-xs text-slate-500">{user.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {user.roleColor ? (
                    <span 
                      className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold"
                      style={{ backgroundColor: user.roleColor, color: '#fff', borderColor: user.roleColor }}
                    >
                      {user.roleName}
                    </span>
                  ) : (
                    <Badge variant="secondary">{user.roleName}</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={user.status === 'Active' ? 'success' : user.status === 'Inactive' ? 'secondary' : 'destructive'}>
                    {user.status === 'Active' ? 'Hoạt động' : user.status === 'Inactive' ? 'Không hoạt động' : 'Bị cấm'}
                  </Badge>
                </TableCell>
                <TableCell className="text-slate-500 text-sm">{formatLastLogin(user.lastLogin)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Link href={`/admin/users/${user._id}/edit`}><Button variant="ghost" size="icon"><Edit size={16}/></Button></Link>
                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => handleDelete(user._id)}><Trash2 size={16}/></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {sortedUsers.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                  {searchTerm || filterRole || filterStatus ? 'Không tìm thấy kết quả phù hợp' : 'Chưa có người dùng nào'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {sortedUsers.length > 0 && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 text-sm text-slate-500">
            Hiển thị {sortedUsers.length} / {users.length} người dùng
          </div>
        )}
      </Card>
    </div>
  );
}
