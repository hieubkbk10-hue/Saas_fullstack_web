'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { ChevronDown, Edit, Plus, Search, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Badge, Button, Card, Input, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui';
import { BulkActionBar, ColumnToggle, SelectCheckbox, SortableHeader, generatePaginationItems, useSortableData } from '../components/TableUtilities';
import { ModuleGuard } from '../components/ModuleGuard';
import { DeleteConfirmDialog } from '../components/DeleteConfirmDialog';

const MODULE_KEY = 'users';

export default function UsersListPage() {
  return (
    <ModuleGuard moduleKey={MODULE_KEY}>
      <UsersContent />
    </ModuleGuard>
  );
}

function UsersContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<Id<"roles"> | ''>('');
  const [filterStatus, setFilterStatus] = useState<'' | 'Active' | 'Inactive' | 'Banned'>('');
  const [manualSelectedIds, setManualSelectedIds] = useState<Id<"users">[]>([]);
  const [selectionMode, setSelectionMode] = useState<'manual' | 'all'>('manual');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSizeOverride, setPageSizeOverride] = useState<number | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<Id<"users"> | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<string[]>(() => {
    if (typeof window === 'undefined') {
      return ['role', 'status'];
    }
    try {
      const stored = window.localStorage.getItem('admin_users_visible_columns');
      if (stored) {
        const parsed = JSON.parse(stored) as string[];
        return parsed.length > 0 ? parsed : ['role', 'status'];
      }
    } catch {
      return ['role', 'status'];
    }
    return ['role', 'status'];
  });
  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'asc' | 'desc' }>({ direction: 'asc', key: null });
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const isSelectAllActive = selectionMode === 'all';

  const rolesData = useQuery(api.roles.listAll);
  const settingsData = useQuery(api.admin.modules.listModuleSettings, { moduleKey: MODULE_KEY });
  const featuresData = useQuery(api.admin.modules.listModuleFeatures, { moduleKey: MODULE_KEY });
  const deleteUser = useMutation(api.users.remove);
  const bulkDeleteUsers = useMutation(api.users.bulkRemove);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () =>{  clearTimeout(timer); };
  }, [searchTerm]);

  useEffect(() => {
    window.localStorage.setItem('admin_users_visible_columns', JSON.stringify(visibleColumns));
  }, [visibleColumns]);

  const usersPerPage = useMemo(() => {
    const setting = settingsData?.find(s => s.settingKey === 'usersPerPage');
    return (setting?.value as number) || 20;
  }, [settingsData]);

  const resolvedUsersPerPage = pageSizeOverride ?? usersPerPage;
  const offset = (currentPage - 1) * resolvedUsersPerPage;
  const resolvedSearch = debouncedSearchTerm.trim() ? debouncedSearchTerm.trim() : undefined;

  const usersData = useQuery(api.users.listAdminWithOffset, {
    limit: resolvedUsersPerPage,
    offset,
    roleId: filterRole || undefined,
    search: resolvedSearch,
    status: filterStatus || undefined,
  });

  const totalCountData = useQuery(api.users.countAdmin, {
    roleId: filterRole || undefined,
    search: resolvedSearch,
    status: filterStatus || undefined,
  });

  const deleteInfo = useQuery(
    api.users.getDeleteInfo,
    deleteTargetId ? { id: deleteTargetId } : 'skip'
  );

  const selectAllData = useQuery(
    api.users.listAdminIds,
    isSelectAllActive
      ? {
          roleId: filterRole || undefined,
          search: resolvedSearch,
          status: filterStatus || undefined,
        }
      : 'skip'
  );

  const isTableLoading = usersData === undefined || totalCountData === undefined || rolesData === undefined;

  const enabledFeatures = useMemo(() => {
    const features: Record<string, boolean> = {};
    featuresData?.forEach(f => { features[f.featureKey] = f.enabled; });
    return features;
  }, [featuresData]);

  const showAvatar = enabledFeatures.enableAvatar ?? true;
  const showPhone = enabledFeatures.enablePhone ?? true;
  const showLastLogin = enabledFeatures.enableLastLogin ?? true;

  const columns = [
    { key: 'role', label: 'Vai trò', required: true },
    { key: 'status', label: 'Trạng thái', required: true },
    ...(showPhone ? [{ key: 'phone', label: 'Số điện thoại' }] : []),
    ...(showLastLogin ? [{ key: 'lastLogin', label: 'Đăng nhập cuối' }] : []),
  ];

  const requiredColumnKeys = columns.filter(col => col.required).map(col => col.key);
  const resolvedVisibleColumns = Array.from(new Set([...requiredColumnKeys, ...visibleColumns]))
    .filter(key => columns.some(col => col.key === key));

  useEffect(() => {
    if (selectAllData?.hasMore) {
      toast.info('Đã chọn tối đa 5.000 người dùng phù hợp.');
    }
  }, [selectAllData?.hasMore]);

  const roleMap = useMemo(() => {
    const map: Record<string, { name: string; color?: string }> = {};
    rolesData?.forEach(role => { map[role._id] = { color: role.color, name: role.name }; });
    return map;
  }, [rolesData]);

  const users = useMemo(() => usersData?.map(user => ({
    ...user,
    roleName: roleMap[user.roleId]?.name || 'N/A',
    roleColor: roleMap[user.roleId]?.color,
  })) ?? [], [usersData, roleMap]);

  const sortedUsers = useSortableData(users, sortConfig);

  const totalCount = totalCountData?.count ?? 0;
  const totalPages = totalCount ? Math.ceil(totalCount / resolvedUsersPerPage) : 1;
  const paginatedUsers = sortedUsers;
  const tableColumnCount = resolvedVisibleColumns.length + 3;
  const selectedIds = isSelectAllActive && selectAllData ? selectAllData.ids : manualSelectedIds;
  const isSelectingAll = isSelectAllActive && selectAllData === undefined;

  const applyManualSelection = (nextIds: Id<"users">[]) => {
    setSelectionMode('manual');
    setManualSelectedIds(nextIds);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
    setFilterRole('');
    setFilterStatus('');
    setCurrentPage(1);
    setPageSizeOverride(null);
    applyManualSelection([]);
  };

  const handleSort = (key: string) => {
    setSortConfig(prev => ({ direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc', key }));
    setCurrentPage(1);
  };

  const handleFilterRole = (value: string) => {
    setFilterRole(value as Id<"roles"> | '');
    setCurrentPage(1);
    applyManualSelection([]);
  };

  const handleFilterStatus = (value: string) => {
    setFilterStatus(value as '' | 'Active' | 'Inactive' | 'Banned');
    setCurrentPage(1);
    applyManualSelection([]);
  };

  const selectedOnPage = paginatedUsers.filter(user => selectedIds.includes(user._id));
  const isPageSelected = paginatedUsers.length > 0 && selectedOnPage.length === paginatedUsers.length;
  const isPageIndeterminate = selectedOnPage.length > 0 && selectedOnPage.length < paginatedUsers.length;

  const toggleSelectAll = () => {
    if (isPageSelected) {
      const remaining = selectedIds.filter(id => !paginatedUsers.some(user => user._id === id));
      applyManualSelection(remaining);
      return;
    }
    const next = new Set(selectedIds);
    paginatedUsers.forEach(user => next.add(user._id));
    applyManualSelection(Array.from(next));
  };

  const toggleSelectItem = (id: Id<"users">) => {
    const next = selectedIds.includes(id)
      ? selectedIds.filter(i => i !== id)
      : [...selectedIds, id];
    applyManualSelection(next);
  };

  const handleDelete = async (id: Id<"users">) => {
    setDeleteTargetId(id);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetId) {return;}
    setIsDeleteLoading(true);
    try {
      await deleteUser({ cascade: true, id: deleteTargetId });
      toast.success('Đã xóa người dùng');
      setIsDeleteOpen(false);
      setDeleteTargetId(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra');
    } finally {
      setIsDeleteLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (confirm(`Xóa ${selectedIds.length} người dùng đã chọn? Tất cả dữ liệu liên quan sẽ bị xóa.`)) {
      try {
        setIsBulkDeleting(true);
        const count = selectedIds.length;
        await bulkDeleteUsers({ cascade: true, ids: selectedIds });
        applyManualSelection([]);
        toast.success(`Đã xóa ${count} người dùng`);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra');
      } finally {
        setIsBulkDeleting(false);
      }
    }
  };

  const formatLastLogin = (timestamp?: number) => {
    if (!timestamp) {return 'Chưa đăng nhập';}
    const date = new Date(timestamp);
    return date.toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Người dùng hệ thống</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Quản lý tài khoản truy cập vào Admin</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/users/create"><Button className="gap-2"><Plus size={16}/> Thêm User</Button></Link>
        </div>
      </div>

      <BulkActionBar selectedCount={selectedIds.length} onDelete={handleBulkDelete} onClearSelection={() =>{  applyManualSelection([]); }} isLoading={isBulkDeleting} />
      {selectedIds.length > 0 && (
        <div className="flex flex-wrap gap-2 text-sm">
          <Button variant="outline" size="sm" onClick={() =>{  applyManualSelection(paginatedUsers.map(user => user._id)); }}>
            Chọn trang này
          </Button>
          <Button variant="outline" size="sm" onClick={() =>{  setSelectionMode('all'); }} disabled={isSelectingAll}>
            {isSelectingAll ? 'Đang chọn...' : 'Chọn tất cả kết quả'}
          </Button>
        </div>
      )}

      <Card>
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
          <div className="relative max-w-xs flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Tìm kiếm theo tên, email, điện thoại..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) =>{  setSearchTerm(e.target.value); setCurrentPage(1); applyManualSelection([]); }}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              className="h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
              value={filterRole}
              onChange={(e) =>{  handleFilterRole(e.target.value); }}
            >
              <option value="">Tất cả vai trò</option>
              {rolesData?.map(r => <option key={r._id} value={r._id}>{r.name}</option>)}
            </select>
            <select
              className="h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
              value={filterStatus}
              onChange={(e) =>{  handleFilterStatus(e.target.value); }}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="Active">Hoạt động</option>
              <option value="Inactive">Không hoạt động</option>
              <option value="Banned">Bị cấm</option>
            </select>
            <Button variant="outline" size="sm" onClick={handleResetFilters}>
              Xóa lọc
            </Button>
            <ColumnToggle
              columns={columns}
              visibleColumns={resolvedVisibleColumns}
              onToggle={(key) => {
                setVisibleColumns(prev => prev.includes(key) ? prev.filter(col => col !== key) : [...prev, key]);
              }}
            />
          </div>
        </div>
        <Table>
          <TableHeader className="[&_th]:sticky [&_th]:top-0 [&_th]:z-10 [&_th]:bg-white dark:[&_th]:bg-slate-900">
            <TableRow>
              <TableHead className="w-[40px]"><SelectCheckbox checked={isPageSelected} onChange={toggleSelectAll} indeterminate={isPageIndeterminate} /></TableHead>
              <SortableHeader label="Người dùng" sortKey="name" sortConfig={sortConfig} onSort={handleSort} />
              {resolvedVisibleColumns.includes('role') && <SortableHeader label="Vai trò" sortKey="roleName" sortConfig={sortConfig} onSort={handleSort} />}
              {resolvedVisibleColumns.includes('status') && <SortableHeader label="Trạng thái" sortKey="status" sortConfig={sortConfig} onSort={handleSort} />}
              {resolvedVisibleColumns.includes('phone') && <SortableHeader label="Số điện thoại" sortKey="phone" sortConfig={sortConfig} onSort={handleSort} />}
              {resolvedVisibleColumns.includes('lastLogin') && <SortableHeader label="Đăng nhập cuối" sortKey="lastLogin" sortConfig={sortConfig} onSort={handleSort} />}
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isTableLoading ? (
              Array.from({ length: resolvedUsersPerPage }).map((_, index) => (
                <TableRow key={`loading-${index}`}>
                  <TableCell>
                    <div className="h-4 w-4 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {showAvatar && <div className="h-9 w-9 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse" />}
                      <div className="space-y-2">
                        <div className="h-4 w-32 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
                        <div className="h-3 w-24 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
                      </div>
                    </div>
                  </TableCell>
                  {resolvedVisibleColumns.includes('role') && (
                    <TableCell>
                      <div className="h-5 w-20 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse" />
                    </TableCell>
                  )}
                  {resolvedVisibleColumns.includes('status') && (
                    <TableCell>
                      <div className="h-5 w-24 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse" />
                    </TableCell>
                  )}
                  {resolvedVisibleColumns.includes('phone') && (
                    <TableCell>
                      <div className="h-4 w-24 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
                    </TableCell>
                  )}
                  {resolvedVisibleColumns.includes('lastLogin') && (
                    <TableCell>
                      <div className="h-4 w-32 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
                    </TableCell>
                  )}
                  <TableCell className="text-right">
                    <div className="ml-auto h-8 w-20 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <>
                {paginatedUsers.map(user => (
                  <TableRow key={user._id} className={selectedIds.includes(user._id) ? 'bg-blue-500/5' : ''}>
                    <TableCell><SelectCheckbox checked={selectedIds.includes(user._id)} onChange={() =>{  toggleSelectItem(user._id); }} /></TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {showAvatar && (
                          user.avatar ? (
                            <Image src={user.avatar} width={36} height={36} className="w-9 h-9 rounded-full object-cover" alt={user.name} />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-sm font-medium text-slate-500">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                          )
                        )}
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-xs text-slate-500">{user.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    {resolvedVisibleColumns.includes('role') && (
                      <TableCell>
                        {user.roleColor ? (
                          <span
                            className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold"
                            style={{ backgroundColor: user.roleColor, borderColor: user.roleColor, color: '#fff' }}
                          >
                            {user.roleName}
                          </span>
                        ) : (
                          <Badge variant="secondary">{user.roleName}</Badge>
                        )}
                      </TableCell>
                    )}
                    {resolvedVisibleColumns.includes('status') && (
                      <TableCell>
                        <Badge variant={user.status === 'Active' ? 'success' : (user.status === 'Inactive' ? 'secondary' : 'destructive')}>
                          {user.status === 'Active' ? 'Hoạt động' : (user.status === 'Inactive' ? 'Không hoạt động' : 'Bị cấm')}
                        </Badge>
                      </TableCell>
                    )}
                    {resolvedVisibleColumns.includes('phone') && (
                      <TableCell className="text-slate-600">
                        {user.phone || '—'}
                      </TableCell>
                    )}
                    {resolvedVisibleColumns.includes('lastLogin') && (
                      <TableCell className="text-slate-500 text-sm">{formatLastLogin(user.lastLogin)}</TableCell>
                    )}
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/admin/users/${user._id}/edit`}><Button variant="ghost" size="icon"><Edit size={16}/></Button></Link>
                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={ async () => handleDelete(user._id)}><Trash2 size={16}/></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </>
            )}
            {!isTableLoading && paginatedUsers.length === 0 && (
              <TableRow>
                <TableCell colSpan={tableColumnCount} className="text-center py-8 text-slate-500">
                  {searchTerm || filterRole || filterStatus ? 'Không tìm thấy kết quả phù hợp' : 'Chưa có người dùng nào'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {totalCount > 0 && !isTableLoading && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="order-2 flex w-full items-center justify-between text-sm text-slate-500 sm:order-1 sm:w-auto sm:justify-start sm:gap-6">
              <div className="flex items-center gap-2">
                <span className="text-slate-600">Hiển thị</span>
                <select
                  value={resolvedUsersPerPage}
                  onChange={(event) =>{  setPageSizeOverride(Number(event.target.value)); setCurrentPage(1); applyManualSelection([]); }}
                  className="h-8 w-[70px] appearance-none rounded-md border border-slate-200 bg-white px-2 text-sm font-medium text-slate-900 shadow-sm focus:border-slate-300 focus:outline-none"
                  aria-label="Số người dùng mỗi trang"
                >
                  {[10, 20, 30, 50, 100].map((size) => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
                <span>người dùng/trang</span>
              </div>

              <div className="text-right sm:text-left">
                <span className="font-medium text-slate-900">
                  {totalCount ? ((currentPage - 1) * resolvedUsersPerPage) + 1 : 0}–{Math.min(currentPage * resolvedUsersPerPage, totalCount)}
                </span>
                <span className="mx-1 text-slate-300">/</span>
                <span className="font-medium text-slate-900">
                  {totalCount}{totalCountData?.hasMore ? '+' : ''}
                </span>
                <span className="ml-1 text-slate-500">người dùng</span>
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
                          ? 'bg-blue-600 text-white shadow-sm border font-medium'
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
      <DeleteConfirmDialog
        open={isDeleteOpen}
        onOpenChange={(open) => {
          setIsDeleteOpen(open);
          if (!open) {setDeleteTargetId(null);}
        }}
        title="Xóa người dùng"
        itemName={users.find((user) => user._id === deleteTargetId)?.name ?? 'người dùng'}
        dependencies={deleteInfo?.dependencies ?? []}
        onConfirm={async () => handleConfirmDelete()}
        isLoading={isDeleteLoading}
      />
    </div>
  );
}
