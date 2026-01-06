'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash2, Shield, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Button, Card, Badge, Input, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui';
import { ColumnToggle, SortableHeader, BulkActionBar, SelectCheckbox, useSortableData } from '../components/TableUtilities';
import { ModuleGuard } from '../components/ModuleGuard';
import { mockRoles } from '../mockData';

export default function RolesListPage() {
  return (
    <ModuleGuard moduleKey="roles">
      <RolesContent />
    </ModuleGuard>
  );
}

function RolesContent() {
  const [roles, setRoles] = useState(mockRoles);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'asc' | 'desc' }>({ key: null, direction: 'asc' });
  const [visibleColumns, setVisibleColumns] = useState(['select', 'name', 'description', 'usersCount', 'type', 'actions']);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const columns = [
    { key: 'select', label: 'Chọn' },
    { key: 'name', label: 'Tên vai trò', required: true },
    { key: 'description', label: 'Mô tả' },
    { key: 'usersCount', label: 'Số người dùng' },
    { key: 'type', label: 'Loại' },
    { key: 'actions', label: 'Hành động', required: true }
  ];

  const handleSort = (key: string) => {
    setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc' }));
  };

  const toggleColumn = (key: string) => {
    setVisibleColumns(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  const filteredData = useMemo(() => {
    let data = [...roles];
    if (searchTerm) {
      data = data.filter(r => r.name.toLowerCase().includes(searchTerm.toLowerCase()) || r.description.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    if (filterType === 'system') {
      data = data.filter(r => r.isSystem);
    } else if (filterType === 'custom') {
      data = data.filter(r => !r.isSystem);
    }
    return data;
  }, [roles, searchTerm, filterType]);

  const sortedData = useSortableData(filteredData, sortConfig);

  const selectableRoles = sortedData.filter(r => !r.isSystem);
  const toggleSelectAll = () => setSelectedIds(selectedIds.length === selectableRoles.length ? [] : selectableRoles.map(r => r.id));
  const toggleSelectItem = (id: string) => setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

  const handleDelete = (id: string) => {
    const role = roles.find(r => r.id === id);
    if (role?.isSystem) {
      toast.error('Không thể xóa vai trò hệ thống');
      return;
    }
    if (confirm('Xóa vai trò này?')) {
      setRoles(prev => prev.filter(r => r.id !== id));
      toast.success('Đã xóa vai trò');
    }
  };

  const handleBulkDelete = () => {
    if (confirm(`Xóa ${selectedIds.length} vai trò đã chọn?`)) {
      setRoles(prev => prev.filter(r => !selectedIds.includes(r.id)));
      setSelectedIds([]);
      toast.success(`Đã xóa ${selectedIds.length} vai trò`);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Phân quyền vai trò</h1>
          <p className="text-sm text-slate-500">Định nghĩa quyền truy cập cho từng nhóm người dùng</p>
        </div>
        <Link href="/admin/roles/create"><Button className="gap-2"><Plus size={16}/> Thêm vai trò</Button></Link>
      </div>

      <BulkActionBar selectedCount={selectedIds.length} onDelete={handleBulkDelete} onClearSelection={() => setSelectedIds([])} />

      <Card>
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex flex-wrap gap-3 flex-1">
            <div className="relative max-w-xs">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input placeholder="Tìm vai trò..." className="pl-9 w-48" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <select className="h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
              <option value="">Tất cả loại</option>
              <option value="system">Hệ thống</option>
              <option value="custom">Tùy chỉnh</option>
            </select>
          </div>
          <ColumnToggle columns={columns} visibleColumns={visibleColumns} onToggle={toggleColumn} />
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              {visibleColumns.includes('select') && <TableHead className="w-[40px]"><SelectCheckbox checked={selectedIds.length === selectableRoles.length && selectableRoles.length > 0} onChange={toggleSelectAll} indeterminate={selectedIds.length > 0 && selectedIds.length < selectableRoles.length} /></TableHead>}
              {visibleColumns.includes('name') && <SortableHeader label="Tên vai trò" sortKey="name" sortConfig={sortConfig} onSort={handleSort} />}
              {visibleColumns.includes('description') && <TableHead>Mô tả</TableHead>}
              {visibleColumns.includes('usersCount') && <SortableHeader label="Số người dùng" sortKey="usersCount" sortConfig={sortConfig} onSort={handleSort} className="text-center" />}
              {visibleColumns.includes('type') && <TableHead className="text-center">Loại</TableHead>}
              {visibleColumns.includes('actions') && <TableHead className="text-right">Hành động</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.map(role => (
              <TableRow key={role.id} className={selectedIds.includes(role.id) ? 'bg-blue-500/5' : ''}>
                {visibleColumns.includes('select') && (
                  <TableCell>
                    {role.isSystem ? (
                      <span className="w-4 h-4 block" title="Không thể chọn vai trò hệ thống" />
                    ) : (
                      <SelectCheckbox checked={selectedIds.includes(role.id)} onChange={() => toggleSelectItem(role.id)} />
                    )}
                  </TableCell>
                )}
                {visibleColumns.includes('name') && (
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <Shield size={16} className="text-blue-500" />
                      </div>
                      <span className="font-medium">{role.name}</span>
                    </div>
                  </TableCell>
                )}
                {visibleColumns.includes('description') && (
                  <TableCell className="text-slate-500 max-w-[300px] truncate">{role.description}</TableCell>
                )}
                {visibleColumns.includes('usersCount') && (
                  <TableCell className="text-center">
                    <Badge variant="secondary">{role.usersCount}</Badge>
                  </TableCell>
                )}
                {visibleColumns.includes('type') && (
                  <TableCell className="text-center">
                    {role.isSystem ? (
                      <Badge variant="info">Hệ thống</Badge>
                    ) : (
                      <Badge variant="secondary">Tùy chỉnh</Badge>
                    )}
                  </TableCell>
                )}
                {visibleColumns.includes('actions') && (
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/admin/roles/${role.id}/edit`}>
                        <Button variant="ghost" size="icon"><Edit size={16}/></Button>
                      </Link>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className={role.isSystem ? "text-slate-300 cursor-not-allowed" : "text-red-500 hover:text-red-600"} 
                        onClick={() => handleDelete(role.id)}
                        disabled={role.isSystem}
                        title={role.isSystem ? "Không thể xóa vai trò hệ thống" : "Xóa"}
                      >
                        <Trash2 size={16}/>
                      </Button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
            {sortedData.length === 0 && (
              <TableRow>
                <TableCell colSpan={visibleColumns.length} className="text-center py-8 text-slate-500">
                  {searchTerm || filterType ? 'Không tìm thấy kết quả phù hợp' : 'Chưa có vai trò nào'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {sortedData.length > 0 && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 text-sm text-slate-500">
            Hiển thị {sortedData.length} / {roles.length} vai trò
          </div>
        )}
      </Card>
    </div>
  );
}
