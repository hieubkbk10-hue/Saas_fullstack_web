'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Plus, Edit, Trash2, ExternalLink, Search, Loader2, RefreshCw, ChevronLeft, ChevronRight, Briefcase } from 'lucide-react';
import { toast } from 'sonner';
import { Button, Card, Badge, Input, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui';
import { SortableHeader, BulkActionBar, SelectCheckbox, useSortableData } from '../components/TableUtilities';
import { ModuleGuard } from '../components/ModuleGuard';

export default function ServicesListPage() {
  return (
    <ModuleGuard moduleKey="services">
      <ServicesContent />
    </ModuleGuard>
  );
}

function ServicesContent() {
  const servicesData = useQuery(api.services.listAll, {});
  const categoriesData = useQuery(api.serviceCategories.listAll, {});
  const settingsData = useQuery(api.admin.modules.listModuleSettings, { moduleKey: 'services' });
  const deleteService = useMutation(api.services.remove);
  const seedServicesModule = useMutation(api.seed.seedServicesModule);
  const clearServicesData = useMutation(api.seed.clearServicesData);
  
  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'asc' | 'desc' }>({ key: null, direction: 'asc' });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedIds, setSelectedIds] = useState<Id<"services">[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const isLoading = servicesData === undefined || categoriesData === undefined;

  const servicesPerPage = useMemo(() => {
    const setting = settingsData?.find(s => s.settingKey === 'servicesPerPage');
    return (setting?.value as number) || 10;
  }, [settingsData]);

  const categoryMap = useMemo(() => {
    const map: Record<string, string> = {};
    categoriesData?.forEach(cat => { map[cat._id] = cat.name; });
    return map;
  }, [categoriesData]);

  const services = useMemo(() => {
    return servicesData?.map(service => ({
      ...service,
      id: service._id,
      category: categoryMap[service.categoryId] || 'Không có',
    })) || [];
  }, [servicesData, categoryMap]);

  const filteredServices = useMemo(() => {
    let data = [...services];
    if (searchTerm) {
      data = data.filter(s => s.title.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    if (filterStatus) {
      data = data.filter(s => s.status === filterStatus);
    }
    return data;
  }, [services, searchTerm, filterStatus]);

  const sortedServices = useSortableData(filteredServices, sortConfig);

  const totalPages = Math.ceil(sortedServices.length / servicesPerPage);
  const paginatedServices = useMemo(() => {
    const start = (currentPage - 1) * servicesPerPage;
    return sortedServices.slice(start, start + servicesPerPage);
  }, [sortedServices, currentPage, servicesPerPage]);

  const handleSort = (key: string) => {
    setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc' }));
    setCurrentPage(1);
  };

  const handleFilterChange = (value: string) => {
    setFilterStatus(value);
    setCurrentPage(1);
  };

  const toggleSelectAll = () => setSelectedIds(selectedIds.length === paginatedServices.length ? [] : paginatedServices.map(s => s._id));
  const toggleSelectItem = (id: Id<"services">) => setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

  const handleDelete = async (id: Id<"services">) => {
    if (confirm('Xóa dịch vụ này?')) {
      try {
        await deleteService({ id });
        toast.success('Đã xóa dịch vụ');
      } catch {
        toast.error('Có lỗi khi xóa dịch vụ');
      }
    }
  };

  const handleBulkDelete = async () => {
    if (confirm(`Xóa ${selectedIds.length} dịch vụ đã chọn?`)) {
      try {
        for (const id of selectedIds) {
          await deleteService({ id });
        }
        setSelectedIds([]);
        toast.success(`Đã xóa ${selectedIds.length} dịch vụ`);
      } catch {
        toast.error('Có lỗi khi xóa dịch vụ');
      }
    }
  };

  const handleReseed = async () => {
    if (confirm('Xóa tất cả dịch vụ và seed lại dữ liệu mẫu?')) {
      try {
        await clearServicesData();
        await seedServicesModule();
        toast.success('Đã reset dữ liệu dịch vụ');
      } catch {
        toast.error('Có lỗi khi reset dữ liệu');
      }
    }
  };

  const formatPrice = (price?: number) => {
    if (!price) return '-';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const openFrontend = (slug: string) => {
    window.open(`/services/${slug}`, '_blank');
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
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-500/10 rounded-lg">
            <Briefcase className="w-6 h-6 text-teal-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Quản lý dịch vụ</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={handleReseed} title="Reset dữ liệu mẫu">
            <RefreshCw size={16}/> Reset
          </Button>
          <Link href="/admin/services/create"><Button className="gap-2 bg-teal-600 hover:bg-teal-500"><Plus size={16}/> Thêm mới</Button></Link>
        </div>
      </div>

      <BulkActionBar selectedCount={selectedIds.length} onDelete={handleBulkDelete} onClearSelection={() => setSelectedIds([])} />

      <Card>
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-4">
          <div className="relative max-w-xs flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input placeholder="Tìm kiếm dịch vụ..." className="pl-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <select className="h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm" value={filterStatus} onChange={(e) => handleFilterChange(e.target.value)}>
            <option value="">Tất cả trạng thái</option>
            <option value="Published">Đã xuất bản</option>
            <option value="Draft">Bản nháp</option>
            <option value="Archived">Lưu trữ</option>
          </select>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]"><SelectCheckbox checked={selectedIds.length === paginatedServices.length && paginatedServices.length > 0} onChange={toggleSelectAll} indeterminate={selectedIds.length > 0 && selectedIds.length < paginatedServices.length} /></TableHead>
              <TableHead className="w-[80px]">Ảnh</TableHead>
              <SortableHeader label="Tiêu đề" sortKey="title" sortConfig={sortConfig} onSort={handleSort} />
              <SortableHeader label="Danh mục" sortKey="category" sortConfig={sortConfig} onSort={handleSort} />
              <SortableHeader label="Giá" sortKey="price" sortConfig={sortConfig} onSort={handleSort} />
              <SortableHeader label="Trạng thái" sortKey="status" sortConfig={sortConfig} onSort={handleSort} />
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedServices.map(service => (
              <TableRow key={service._id} className={selectedIds.includes(service._id) ? 'bg-teal-500/5' : ''}>
                <TableCell><SelectCheckbox checked={selectedIds.includes(service._id)} onChange={() => toggleSelectItem(service._id)} /></TableCell>
                <TableCell>
                  {service.thumbnail ? (
                    <Image src={service.thumbnail} width={48} height={32} className="w-12 h-8 object-cover rounded" alt={service.title} />
                  ) : (
                    <div className="w-12 h-8 bg-slate-200 dark:bg-slate-700 rounded flex items-center justify-center text-xs text-slate-400">No img</div>
                  )}
                </TableCell>
                <TableCell className="font-medium max-w-[300px] truncate">{service.title}</TableCell>
                <TableCell>{service.category}</TableCell>
                <TableCell className="text-slate-500">{formatPrice(service.price)}</TableCell>
                <TableCell>
                  <Badge variant={service.status === 'Published' ? 'success' : service.status === 'Draft' ? 'secondary' : 'warning'}>
                    {service.status === 'Published' ? 'Đã xuất bản' : service.status === 'Draft' ? 'Bản nháp' : 'Lưu trữ'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" className="text-teal-600 hover:text-teal-700" title="Xem dịch vụ" onClick={() => openFrontend(service.slug)}><ExternalLink size={16}/></Button>
                    <Link href={`/admin/services/${service._id}/edit`}><Button variant="ghost" size="icon"><Edit size={16}/></Button></Link>
                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => handleDelete(service._id)}><Trash2 size={16}/></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {paginatedServices.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                   {searchTerm || filterStatus ? 'Không tìm thấy kết quả phù hợp' : 'Chưa có dịch vụ nào'}
                 </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {sortedServices.length > 0 && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-sm text-slate-500">
              Hiển thị {(currentPage - 1) * servicesPerPage + 1} - {Math.min(currentPage * servicesPerPage, sortedServices.length)} / {sortedServices.length} dịch vụ
            </span>
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}><ChevronLeft size={16} /></Button>
                <span className="text-sm text-slate-600 dark:text-slate-400">Trang {currentPage} / {totalPages}</span>
                <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}><ChevronRight size={16} /></Button>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
