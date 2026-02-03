'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { AlertTriangle, Ban, Bell, CheckCircle, ChevronLeft, ChevronRight, Edit, Info, Loader2, Plus, Search, Send, Trash2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Badge, Button, Card, Input, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui';
import { BulkActionBar, SelectCheckbox, SortableHeader, useSortableData } from '../components/TableUtilities';
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
    <ModuleGuard moduleKey="notifications">
      <NotificationsContent />
    </ModuleGuard>
  );
}

function NotificationsContent() {
  const notificationsData = useQuery(api.notifications.listAll);
  const settingsData = useQuery(api.admin.modules.listModuleSettings, { moduleKey: MODULE_KEY });
  const featuresData = useQuery(api.admin.modules.listModuleFeatures, { moduleKey: MODULE_KEY });
  const deleteNotification = useMutation(api.notifications.remove);
  const sendNotification = useMutation(api.notifications.send);
  const cancelNotification = useMutation(api.notifications.cancel);

  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'asc' | 'desc' }>({ direction: 'asc', key: null });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [selectedIds, setSelectedIds] = useState<Id<"notifications">[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const isLoading = notificationsData === undefined;

  // Lấy itemsPerPage từ module settings
  const itemsPerPage = useMemo(() => {
    const setting = settingsData?.find(s => s.settingKey === 'itemsPerPage');
    return (setting?.value as number) || 20;
  }, [settingsData]);

  // Lấy enabled features
  const enabledFeatures = useMemo(() => {
    const features: Record<string, boolean> = {};
    featuresData?.forEach(f => { features[f.featureKey] = f.enabled; });
    return features;
  }, [featuresData]);

  const notifications = useMemo(() => notificationsData?.map(n => ({
      ...n,
      typeLabel: TYPE_CONFIG[n.type]?.label || n.type,
      statusLabel: STATUS_CONFIG[n.status]?.label || n.status,
      targetLabel: TARGET_LABELS[n.targetType] || n.targetType,
    })) ?? [], [notificationsData]);

  const filteredNotifications = useMemo(() => {
    let data = [...notifications];
    if (searchTerm) {
      data = data.filter(n => n.title.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    if (filterStatus) {
      data = data.filter(n => n.status === filterStatus);
    }
    if (filterType) {
      data = data.filter(n => n.type === filterType);
    }
    return data;
  }, [notifications, searchTerm, filterStatus, filterType]);

  const sortedNotifications = useSortableData(filteredNotifications, sortConfig);

  // Pagination
  const totalPages = Math.ceil(sortedNotifications.length / itemsPerPage);
  const paginatedNotifications = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedNotifications.slice(start, start + itemsPerPage);
  }, [sortedNotifications, currentPage, itemsPerPage]);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleStatusChange = (value: string) => {
    setFilterStatus(value);
    setCurrentPage(1);
  };

  const handleTypeChange = (value: string) => {
    setFilterType(value);
    setCurrentPage(1);
  };

  const handleSort = (key: string) => {
    setSortConfig(prev => ({ direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc', key }));
    setCurrentPage(1);
  };

  const toggleSelectAll = () =>{  setSelectedIds(selectedIds.length === paginatedNotifications.length ? [] : paginatedNotifications.map(n => n._id)); };
  const toggleSelectItem = (id: Id<"notifications">) =>{  setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]); };

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

  // HIGH-006 FIX: Dùng Promise.all thay vì sequential
  const handleBulkDelete = async () => {
    if (confirm(`Xóa ${selectedIds.length} thông báo đã chọn?`)) {
      try {
        await Promise.all(selectedIds.map( async id => deleteNotification({ id })));
        setSelectedIds([]);
        toast.success(`Đã xóa ${selectedIds.length} thông báo`);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra');
      }
    }
  };

  const formatDate = (timestamp?: number) => {
    if (!timestamp) {return '-';}
    return new Date(timestamp).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' });
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
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Thông báo</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Quản lý thông báo hệ thống</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/notifications/create"><Button className="gap-2 bg-pink-600 hover:bg-pink-500"><Plus size={16}/> Tạo thông báo</Button></Link>
        </div>
      </div>

      <BulkActionBar selectedCount={selectedIds.length} onDelete={handleBulkDelete} onClearSelection={() =>{  setSelectedIds([]); }} />

      <Card>
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-4">
          <div className="relative max-w-xs flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input placeholder="Tìm kiếm tiêu đề..." className="pl-9" value={searchTerm} onChange={(e) =>{  handleSearchChange(e.target.value); }} />
          </div>
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
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]"><SelectCheckbox checked={selectedIds.length === paginatedNotifications.length && paginatedNotifications.length > 0} onChange={toggleSelectAll} indeterminate={selectedIds.length > 0 && selectedIds.length < paginatedNotifications.length} /></TableHead>
              <TableHead className="w-[40px]">Loại</TableHead>
              <SortableHeader label="Tiêu đề" sortKey="title" sortConfig={sortConfig} onSort={handleSort} />
              {(enabledFeatures.enableTargeting ?? true) && <TableHead>Đối tượng</TableHead>}
              <SortableHeader label="Trạng thái" sortKey="status" sortConfig={sortConfig} onSort={handleSort} />
              <SortableHeader label="Đã đọc" sortKey="readCount" sortConfig={sortConfig} onSort={handleSort} />
              {(enabledFeatures.enableScheduling ?? true) && <TableHead>Thời gian</TableHead>}
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedNotifications.map(notif => {
              const TypeIcon = TYPE_CONFIG[notif.type]?.icon || Bell;
              const typeConfig = TYPE_CONFIG[notif.type];
              const statusConfig = STATUS_CONFIG[notif.status];
              return (
                <TableRow key={notif._id} className={selectedIds.includes(notif._id) ? 'bg-pink-500/5' : ''}>
                  <TableCell><SelectCheckbox checked={selectedIds.includes(notif._id)} onChange={() =>{  toggleSelectItem(notif._id); }} /></TableCell>
                  <TableCell>
                    <div className={`w-8 h-8 rounded-lg ${typeConfig?.bg} flex items-center justify-center`}>
                      <TypeIcon size={16} className={typeConfig?.color} />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium max-w-[250px] truncate">{notif.title}</div>
                    <div className="text-xs text-slate-500 max-w-[250px] truncate">{notif.content}</div>
                  </TableCell>
                  {(enabledFeatures.enableTargeting ?? true) && (
                    <TableCell>
                      <Badge variant="outline">{notif.targetLabel}</Badge>
                      {(enabledFeatures.enableEmail ?? true) && notif.sendEmail && <span className="ml-1 text-xs text-pink-500">📧</span>}
                    </TableCell>
                  )}
                  <TableCell>
                    <Badge variant={statusConfig?.variant}>{statusConfig?.label}</Badge>
                  </TableCell>
                  <TableCell className="text-slate-500">{notif.readCount.toLocaleString()}</TableCell>
                  {(enabledFeatures.enableScheduling ?? true) && (
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
            {paginatedNotifications.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                  {searchTerm || filterStatus || filterType ? 'Không tìm thấy kết quả phù hợp' : 'Chưa có thông báo nào'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {sortedNotifications.length > 0 && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-sm text-slate-500">
              Hiển thị {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, sortedNotifications.length)} / {sortedNotifications.length} thông báo
            </span>
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={currentPage === 1}
                  onClick={() =>{  setCurrentPage(p => p - 1); }}
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
                  onClick={() =>{  setCurrentPage(p => p + 1); }}
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
