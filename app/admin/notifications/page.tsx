'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { AlertTriangle, Ban, Bell, CheckCircle, ChevronDown, Edit, Info, Plus, Search, Send, Trash2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Badge, Button, Card, Input, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui';
import { BulkActionBar, ColumnToggle, SelectCheckbox, SortableHeader, generatePaginationItems, useSortableData } from '../components/TableUtilities';
import { ModuleGuard } from '../components/ModuleGuard';

const MODULE_KEY = 'notifications';

const TYPE_CONFIG = {
  error: { bg: 'bg-red-500/10', color: 'text-red-500', icon: XCircle, label: 'Lỗi' },
  info: { bg: 'bg-blue-500/10', color: 'text-blue-500', icon: Info, label: 'Thông tin' },
  success: { bg: 'bg-green-500/10', color: 'text-green-500', icon: CheckCircle, label: 'Thành công' },
  warning: { bg: 'bg-amber-500/10', color: 'text-amber-500', icon: AlertTriangle, label: 'Cảnh báo' },
};

const STATUS_CONFIG = {
  Cancelled: { label: 'Đã hủy', variant: 'destructive' as const },
  Draft: { label: 'Bản nháp', variant: 'secondary' as const },
  Scheduled: { label: 'Đã hẹn', variant: 'warning' as const },
  Sent: { label: 'Đã gửi', variant: 'success' as const },
};

const TARGET_LABELS = {
  all: 'Tất cả',
  customers: 'Khách hàng',
  specific: 'Cụ thể',
  users: 'Admin',
};

export default function NotificationsListPage() {
  return (
    <ModuleGuard moduleKey={MODULE_KEY}>
      <NotificationsContent />
    </ModuleGuard>
  );
}

function NotificationsContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'' | 'Draft' | 'Scheduled' | 'Sent' | 'Cancelled'>('');
  const [filterType, setFilterType] = useState<'' | 'info' | 'success' | 'warning' | 'error'>('');
  const [manualSelectedIds, setManualSelectedIds] = useState<Id<"notifications">[]>([]);
  const [selectionMode, setSelectionMode] = useState<'manual' | 'all'>('manual');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSizeOverride, setPageSizeOverride] = useState<number | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'asc' | 'desc' }>({ direction: 'asc', key: null });
  const [visibleColumns, setVisibleColumns] = useState<string[]>(() => {
    if (typeof window === 'undefined') {
      return ['type', 'target', 'status', 'readCount', 'schedule'];
    }
    try {
      const stored = window.localStorage.getItem('admin_notifications_visible_columns');
      if (stored) {
        const parsed = JSON.parse(stored) as string[];
        return parsed.length > 0 ? parsed : ['type', 'target', 'status', 'readCount', 'schedule'];
      }
    } catch {
      return ['type', 'target', 'status', 'readCount', 'schedule'];
    }
    return ['type', 'target', 'status', 'readCount', 'schedule'];
  });
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const isSelectAllActive = selectionMode === 'all';

  const settingsData = useQuery(api.admin.modules.listModuleSettings, { moduleKey: MODULE_KEY });
  const featuresData = useQuery(api.admin.modules.listModuleFeatures, { moduleKey: MODULE_KEY });
  const deleteNotification = useMutation(api.notifications.remove);
  const sendNotification = useMutation(api.notifications.send);
  const cancelNotification = useMutation(api.notifications.cancel);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () =>{  clearTimeout(timer); };
  }, [searchTerm]);

  useEffect(() => {
    window.localStorage.setItem('admin_notifications_visible_columns', JSON.stringify(visibleColumns));
  }, [visibleColumns]);

  const itemsPerPage = useMemo(() => {
    const setting = settingsData?.find(s => s.settingKey === 'itemsPerPage');
    return (setting?.value as number) || 20;
  }, [settingsData]);

  const resolvedItemsPerPage = pageSizeOverride ?? itemsPerPage;
  const offset = (currentPage - 1) * resolvedItemsPerPage;
  const resolvedSearch = debouncedSearchTerm.trim() ? debouncedSearchTerm.trim() : undefined;

  const notificationsData = useQuery(api.notifications.listAdminWithOffset, {
    limit: resolvedItemsPerPage,
    offset,
    search: resolvedSearch,
    status: filterStatus || undefined,
    type: filterType || undefined,
  });

  const totalCountData = useQuery(api.notifications.countAdmin, {
    search: resolvedSearch,
    status: filterStatus || undefined,
    type: filterType || undefined,
  });

  const selectAllData = useQuery(
    api.notifications.listAdminIds,
    isSelectAllActive
      ? {
          search: resolvedSearch,
          status: filterStatus || undefined,
          type: filterType || undefined,
        }
      : 'skip'
  );

  const isTableLoading = notificationsData === undefined
    || totalCountData === undefined
    || settingsData === undefined
    || featuresData === undefined;

  const enabledFeatures = useMemo(() => {
    const features: Record<string, boolean> = {};
    featuresData?.forEach(f => { features[f.featureKey] = f.enabled; });
    return features;
  }, [featuresData]);

  const columns = [
    { key: 'type', label: 'Loại' },
    ...(enabledFeatures.enableTargeting ?? true ? [{ key: 'target', label: 'Đối tượng' }] : []),
    { key: 'status', label: 'Trạng thái' },
    { key: 'readCount', label: 'Đã đọc' },
    ...(enabledFeatures.enableScheduling ?? true ? [{ key: 'schedule', label: 'Thời gian' }] : []),
  ];

  const resolvedVisibleColumns = visibleColumns.filter(key => columns.some(col => col.key === key));

  useEffect(() => {
    if (selectAllData?.hasMore) {
      toast.info('Đã chọn tối đa 5.000 thông báo phù hợp.');
    }
  }, [selectAllData?.hasMore]);

  const notifications = useMemo(() => notificationsData?.map(n => ({
    ...n,
    typeLabel: TYPE_CONFIG[n.type]?.label || n.type,
    statusLabel: STATUS_CONFIG[n.status]?.label || n.status,
    targetLabel: TARGET_LABELS[n.targetType] || n.targetType,
  })) ?? [], [notificationsData]);

  const sortedNotifications = useSortableData(notifications, sortConfig);

  const totalCount = totalCountData?.count ?? 0;
  const totalPages = totalCount ? Math.ceil(totalCount / resolvedItemsPerPage) : 1;
  const paginatedNotifications = sortedNotifications;
  const tableColumnCount = resolvedVisibleColumns.length + 3;
  const selectedIds = isSelectAllActive && selectAllData ? selectAllData.ids : manualSelectedIds;
  const isSelectingAll = isSelectAllActive && selectAllData === undefined;

  const applyManualSelection = (nextIds: Id<"notifications">[]) => {
    setSelectionMode('manual');
    setManualSelectedIds(nextIds);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
    setFilterStatus('');
    setFilterType('');
    setCurrentPage(1);
    setPageSizeOverride(null);
    applyManualSelection([]);
  };

  const handleSort = (key: string) => {
    setSortConfig(prev => ({ direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc', key }));
    setCurrentPage(1);
  };

  const handleStatusChange = (value: string) => {
    setFilterStatus(value as '' | 'Draft' | 'Scheduled' | 'Sent' | 'Cancelled');
    setCurrentPage(1);
    applyManualSelection([]);
  };

  const handleTypeChange = (value: string) => {
    setFilterType(value as '' | 'info' | 'success' | 'warning' | 'error');
    setCurrentPage(1);
    applyManualSelection([]);
  };

  const selectedOnPage = paginatedNotifications.filter(notif => selectedIds.includes(notif._id));
  const isPageSelected = paginatedNotifications.length > 0 && selectedOnPage.length === paginatedNotifications.length;
  const isPageIndeterminate = selectedOnPage.length > 0 && selectedOnPage.length < paginatedNotifications.length;

  const toggleSelectAll = () => {
    if (isPageSelected) {
      const remaining = selectedIds.filter(id => !paginatedNotifications.some(notif => notif._id === id));
      applyManualSelection(remaining);
      return;
    }
    const next = new Set(selectedIds);
    paginatedNotifications.forEach(notif => next.add(notif._id));
    applyManualSelection(Array.from(next));
  };

  const toggleSelectItem = (id: Id<"notifications">) => {
    const next = selectedIds.includes(id)
      ? selectedIds.filter(i => i !== id)
      : [...selectedIds, id];
    applyManualSelection(next);
  };

  const handleDelete = async (id: Id<"notifications">) => {
    if (confirm('Xóa thông báo này?')) {
      try {
        await deleteNotification({ id });
        toast.success('Đã xóa thông báo');
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra');
      }
    }
  };

  const handleSend = async (id: Id<"notifications">) => {
    if (confirm('Gửi thông báo này ngay?')) {
      try {
        await sendNotification({ id });
        toast.success('Đã gửi thông báo');
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra');
      }
    }
  };

  const handleCancel = async (id: Id<"notifications">) => {
    if (confirm('Hủy thông báo này?')) {
      try {
        await cancelNotification({ id });
        toast.success('Đã hủy thông báo');
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra');
      }
    }
  };

  const handleBulkDelete = async () => {
    if (confirm(`Xóa ${selectedIds.length} thông báo đã chọn?`)) {
      try {
        setIsBulkDeleting(true);
        await Promise.all(selectedIds.map( async id => deleteNotification({ id })));
        applyManualSelection([]);
        toast.success(`Đã xóa ${selectedIds.length} thông báo`);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra');
      } finally {
        setIsBulkDeleting(false);
      }
    }
  };

  const formatDate = (timestamp?: number) => {
    if (!timestamp) {return '-';}
    return new Date(timestamp).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Thông báo</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Quản lý thông báo hệ thống</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/notifications/create"><Button className="gap-2 bg-pink-600 hover:bg-pink-500"><Plus size={16}/> Tạo thông báo</Button></Link>
        </div>
      </div>

      <BulkActionBar selectedCount={selectedIds.length} onDelete={handleBulkDelete} onClearSelection={() =>{  applyManualSelection([]); }} isLoading={isBulkDeleting} />
      {selectedIds.length > 0 && (
        <div className="flex flex-wrap gap-2 text-sm">
          <Button variant="outline" size="sm" onClick={() =>{  applyManualSelection(paginatedNotifications.map(notif => notif._id)); }}>
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
            <Input placeholder="Tìm kiếm tiêu đề, nội dung..." className="pl-9" value={searchTerm} onChange={(e) =>{  setSearchTerm(e.target.value); setCurrentPage(1); applyManualSelection([]); }} />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              className="h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
              value={filterStatus}
              onChange={(e) =>{  handleStatusChange(e.target.value); }}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="Draft">Bản nháp</option>
              <option value="Scheduled">Đã hẹn</option>
              <option value="Sent">Đã gửi</option>
              <option value="Cancelled">Đã hủy</option>
            </select>
            <select
              className="h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
              value={filterType}
              onChange={(e) =>{  handleTypeChange(e.target.value); }}
            >
              <option value="">Tất cả loại</option>
              <option value="info">Thông tin</option>
              <option value="success">Thành công</option>
              <option value="warning">Cảnh báo</option>
              <option value="error">Lỗi</option>
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
              {resolvedVisibleColumns.includes('type') && <TableHead className="w-[40px]">Loại</TableHead>}
              <SortableHeader label="Tiêu đề" sortKey="title" sortConfig={sortConfig} onSort={handleSort} />
              {resolvedVisibleColumns.includes('target') && <TableHead>Đối tượng</TableHead>}
              {resolvedVisibleColumns.includes('status') && <SortableHeader label="Trạng thái" sortKey="status" sortConfig={sortConfig} onSort={handleSort} />}
              {resolvedVisibleColumns.includes('readCount') && <SortableHeader label="Đã đọc" sortKey="readCount" sortConfig={sortConfig} onSort={handleSort} />}
              {resolvedVisibleColumns.includes('schedule') && <TableHead>Thời gian</TableHead>}
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isTableLoading ? (
              Array.from({ length: resolvedItemsPerPage }).map((_, index) => (
                <TableRow key={`loading-${index}`}>
                  <TableCell>
                    <div className="h-4 w-4 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
                  </TableCell>
                  {resolvedVisibleColumns.includes('type') && (
                    <TableCell>
                      <div className="h-8 w-8 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
                    </TableCell>
                  )}
                  <TableCell>
                    <div className="space-y-2">
                      <div className="h-4 w-40 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
                      <div className="h-3 w-56 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
                    </div>
                  </TableCell>
                  {resolvedVisibleColumns.includes('target') && (
                    <TableCell>
                      <div className="h-5 w-20 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse" />
                    </TableCell>
                  )}
                  {resolvedVisibleColumns.includes('status') && (
                    <TableCell>
                      <div className="h-5 w-20 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse" />
                    </TableCell>
                  )}
                  {resolvedVisibleColumns.includes('readCount') && (
                    <TableCell>
                      <div className="h-4 w-16 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
                    </TableCell>
                  )}
                  {resolvedVisibleColumns.includes('schedule') && (
                    <TableCell>
                      <div className="h-4 w-24 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
                    </TableCell>
                  )}
                  <TableCell className="text-right">
                    <div className="ml-auto h-8 w-20 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <>
                {paginatedNotifications.map(notif => {
                  const TypeIcon = TYPE_CONFIG[notif.type]?.icon || Bell;
                  const typeConfig = TYPE_CONFIG[notif.type];
                  const statusConfig = STATUS_CONFIG[notif.status];
                  return (
                    <TableRow key={notif._id} className={selectedIds.includes(notif._id) ? 'bg-pink-500/5' : ''}>
                      <TableCell><SelectCheckbox checked={selectedIds.includes(notif._id)} onChange={() =>{  toggleSelectItem(notif._id); }} /></TableCell>
                      {resolvedVisibleColumns.includes('type') && (
                        <TableCell>
                          <div className={`w-8 h-8 rounded-lg ${typeConfig?.bg} flex items-center justify-center`}>
                            <TypeIcon size={16} className={typeConfig?.color} />
                          </div>
                        </TableCell>
                      )}
                      <TableCell>
                        <div className="font-medium max-w-[250px] truncate">{notif.title}</div>
                        <div className="text-xs text-slate-500 max-w-[250px] truncate">{notif.content}</div>
                      </TableCell>
                      {resolvedVisibleColumns.includes('target') && (
                        <TableCell>
                          <Badge variant="outline">{notif.targetLabel}</Badge>
                          {(enabledFeatures.enableEmail ?? true) && notif.sendEmail && <span className="ml-1 text-xs text-pink-500">📧</span>}
                        </TableCell>
                      )}
                      {resolvedVisibleColumns.includes('status') && (
                        <TableCell>
                          <Badge variant={statusConfig?.variant}>{statusConfig?.label}</Badge>
                        </TableCell>
                      )}
                      {resolvedVisibleColumns.includes('readCount') && (
                        <TableCell className="text-slate-500">{notif.readCount.toLocaleString()}</TableCell>
                      )}
                      {resolvedVisibleColumns.includes('schedule') && (
                        <TableCell className="text-slate-500 text-sm">
                          {notif.status === 'Sent' ? formatDate(notif.sentAt) : (notif.status === 'Scheduled' ? formatDate(notif.scheduledAt) : '-')}
                        </TableCell>
                      )}
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          {(notif.status === 'Draft' || notif.status === 'Scheduled') && (
                            <Button variant="ghost" size="icon" className="text-green-500 hover:text-green-600" onClick={ async () => handleSend(notif._id)} title="Gửi ngay">
                              <Send size={16}/>
                            </Button>
                          )}
                          {notif.status === 'Scheduled' && (
                            <Button variant="ghost" size="icon" className="text-amber-500 hover:text-amber-600" onClick={ async () => handleCancel(notif._id)} title="Hủy">
                              <Ban size={16}/>
                            </Button>
                          )}
                          {notif.status !== 'Sent' && (
                            <Link href={`/admin/notifications/${notif._id}/edit`}>
                              <Button variant="ghost" size="icon"><Edit size={16}/></Button>
                            </Link>
                          )}
                          <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={ async () => handleDelete(notif._id)}><Trash2 size={16}/></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </>
            )}
            {!isTableLoading && paginatedNotifications.length === 0 && (
              <TableRow>
                <TableCell colSpan={tableColumnCount} className="text-center py-8 text-slate-500">
                  {searchTerm || filterStatus || filterType ? 'Không tìm thấy kết quả phù hợp' : 'Chưa có thông báo nào'}
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
                  value={resolvedItemsPerPage}
                  onChange={(event) =>{  setPageSizeOverride(Number(event.target.value)); setCurrentPage(1); applyManualSelection([]); }}
                  className="h-8 w-[70px] appearance-none rounded-md border border-slate-200 bg-white px-2 text-sm font-medium text-slate-900 shadow-sm focus:border-slate-300 focus:outline-none"
                  aria-label="Số thông báo mỗi trang"
                >
                  {[10, 20, 30, 50, 100].map((size) => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
                <span>thông báo/trang</span>
              </div>

              <div className="text-right sm:text-left">
                <span className="font-medium text-slate-900">
                  {totalCount ? ((currentPage - 1) * resolvedItemsPerPage) + 1 : 0}–{Math.min(currentPage * resolvedItemsPerPage, totalCount)}
                </span>
                <span className="mx-1 text-slate-300">/</span>
                <span className="font-medium text-slate-900">
                  {totalCount}{totalCountData?.hasMore ? '+' : ''}
                </span>
                <span className="ml-1 text-slate-500">thông báo</span>
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
                          ? 'bg-pink-600 text-white shadow-sm border font-medium'
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
    </div>
  );
}
