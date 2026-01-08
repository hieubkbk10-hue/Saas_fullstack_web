'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Plus, Edit, Trash2, Search, Loader2, RefreshCw, Ticket, ChevronLeft, ChevronRight, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Button, Card, Badge, Input, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui';
import { SortableHeader, BulkActionBar, SelectCheckbox, useSortableData } from '../components/TableUtilities';
import { ModuleGuard } from '../components/ModuleGuard';

const MODULE_KEY = 'promotions';

export default function PromotionsListPage() {
  return (
    <ModuleGuard moduleKey="promotions">
      <PromotionsContent />
    </ModuleGuard>
  );
}

function PromotionsContent() {
  const promotionsData = useQuery(api.promotions.listAll);
  const settingsData = useQuery(api.admin.modules.listModuleSettings, { moduleKey: MODULE_KEY });
  const featuresData = useQuery(api.admin.modules.listModuleFeatures, { moduleKey: MODULE_KEY });
  const deletePromotion = useMutation(api.promotions.remove);
  const seedPromotionsModule = useMutation(api.seed.seedPromotionsModule);
  const clearPromotionsData = useMutation(api.seed.clearPromotionsData);
  
  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'asc' | 'desc' }>({ key: null, direction: 'asc' });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [selectedIds, setSelectedIds] = useState<Id<"promotions">[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const isLoading = promotionsData === undefined;

  // Get promotionsPerPage from module settings
  const promotionsPerPage = useMemo(() => {
    const setting = settingsData?.find(s => s.settingKey === 'promotionsPerPage');
    return (setting?.value as number) || 20;
  }, [settingsData]);

  // Get enabled features from system config
  const enabledFeatures = useMemo(() => {
    const features: Record<string, boolean> = {};
    featuresData?.forEach(f => { features[f.featureKey] = f.enabled; });
    return features;
  }, [featuresData]);

  const promotions = useMemo(() => {
    return promotionsData?.map(p => ({
      ...p,
      id: p._id,
    })) || [];
  }, [promotionsData]);

  const filteredPromotions = useMemo(() => {
    let data = [...promotions];
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      data = data.filter(p => 
        p.name.toLowerCase().includes(term) || 
        p.code.toLowerCase().includes(term)
      );
    }
    if (filterStatus) {
      data = data.filter(p => p.status === filterStatus);
    }
    if (filterType) {
      data = data.filter(p => p.discountType === filterType);
    }
    return data;
  }, [promotions, searchTerm, filterStatus, filterType]);

  const sortedPromotions = useSortableData(filteredPromotions, sortConfig);

  // Pagination
  const totalPages = Math.ceil(sortedPromotions.length / promotionsPerPage);
  const paginatedPromotions = useMemo(() => {
    const start = (currentPage - 1) * promotionsPerPage;
    return sortedPromotions.slice(start, start + promotionsPerPage);
  }, [sortedPromotions, currentPage, promotionsPerPage]);

  const handleSort = (key: string) => {
    setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc' }));
    setCurrentPage(1);
  };

  const handleFilterChange = (type: 'status' | 'type', value: string) => {
    if (type === 'status') setFilterStatus(value);
    else setFilterType(value);
    setCurrentPage(1);
  };

  const toggleSelectAll = () => setSelectedIds(selectedIds.length === paginatedPromotions.length ? [] : paginatedPromotions.map(p => p._id));
  const toggleSelectItem = (id: Id<"promotions">) => setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

  // TICKET #10 FIX: Show detailed error message
  const handleDelete = async (id: Id<"promotions">) => {
    if (confirm('Xóa khuyến mãi này?')) {
      try {
        await deletePromotion({ id });
        toast.success('Đã xóa khuyến mãi');
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Có lỗi khi xóa khuyến mãi');
      }
    }
  };

  // HIGH-006 FIX: Dùng Promise.all thay vì sequential
  // TICKET #10 FIX: Show detailed error message
  const handleBulkDelete = async () => {
    if (confirm(`Xóa ${selectedIds.length} khuyến mãi đã chọn?`)) {
      try {
        await Promise.all(selectedIds.map(id => deletePromotion({ id })));
        setSelectedIds([]);
        toast.success(`Đã xóa ${selectedIds.length} khuyến mãi`);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Có lỗi khi xóa khuyến mãi');
      }
    }
  };

  // TICKET #10 FIX: Show detailed error message
  const handleReseed = async () => {
    if (confirm('Xóa tất cả khuyến mãi và seed lại dữ liệu mẫu?')) {
      try {
        await clearPromotionsData();
        await seedPromotionsModule();
        setSelectedIds([]);
        toast.success('Đã reset dữ liệu khuyến mãi');
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Có lỗi khi reset dữ liệu');
      }
    }
  };

  // TICKET #12 FIX: Handle clipboard API errors
  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      toast.success('Đã copy mã voucher');
      setTimeout(() => setCopiedCode(null), 2000);
    } catch {
      toast.error('Không thể copy, vui lòng copy thủ công');
    }
  };

  const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  
  const formatDate = (timestamp: number | undefined) => {
    if (!timestamp) return '-';
    return new Date(timestamp).toLocaleDateString('vi-VN');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return <Badge variant="success">Hoạt động</Badge>;
      case 'Inactive':
        return <Badge variant="secondary">Tạm dừng</Badge>;
      case 'Expired':
        return <Badge variant="destructive">Hết hạn</Badge>;
      case 'Scheduled':
        return <Badge variant="warning">Chờ kích hoạt</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-pink-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Khuyến mãi</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Quản lý voucher và mã giảm giá</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={handleReseed} title="Reset dữ liệu mẫu">
            <RefreshCw size={16}/> Reset
          </Button>
          <Link href="/admin/promotions/create"><Button className="gap-2 bg-pink-600 hover:bg-pink-500"><Plus size={16}/> Thêm mới</Button></Link>
        </div>
      </div>

      <BulkActionBar selectedCount={selectedIds.length} onDelete={handleBulkDelete} onClearSelection={() => setSelectedIds([])} />

      <Card>
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-4">
          <div className="relative max-w-xs flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input placeholder="Tìm tên, mã voucher..." className="pl-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <select className="h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm" value={filterStatus} onChange={(e) => handleFilterChange('status', e.target.value)}>
            <option value="">Tất cả trạng thái</option>
            <option value="Active">Hoạt động</option>
            <option value="Inactive">Tạm dừng</option>
            <option value="Expired">Hết hạn</option>
            <option value="Scheduled">Chờ kích hoạt</option>
          </select>
          <select className="h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm" value={filterType} onChange={(e) => handleFilterChange('type', e.target.value)}>
            <option value="">Tất cả loại</option>
            <option value="percent">Giảm theo %</option>
            <option value="fixed">Giảm cố định</option>
          </select>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]"><SelectCheckbox checked={selectedIds.length === paginatedPromotions.length && paginatedPromotions.length > 0} onChange={toggleSelectAll} indeterminate={selectedIds.length > 0 && selectedIds.length < paginatedPromotions.length} /></TableHead>
              <SortableHeader label="Tên / Mã" sortKey="name" sortConfig={sortConfig} onSort={handleSort} />
              <SortableHeader label="Giảm giá" sortKey="discountValue" sortConfig={sortConfig} onSort={handleSort} />
              {enabledFeatures.enableSchedule && <TableHead>Thời gian</TableHead>}
              {enabledFeatures.enableUsageLimit && <SortableHeader label="Đã dùng" sortKey="usedCount" sortConfig={sortConfig} onSort={handleSort} />}
              <SortableHeader label="Trạng thái" sortKey="status" sortConfig={sortConfig} onSort={handleSort} />
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedPromotions.map(promo => (
              <TableRow key={promo._id} className={selectedIds.includes(promo._id) ? 'bg-pink-500/5' : ''}>
                <TableCell><SelectCheckbox checked={selectedIds.includes(promo._id)} onChange={() => toggleSelectItem(promo._id)} /></TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-slate-100">{promo.name}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <code className="text-xs text-pink-600 bg-pink-50 dark:bg-pink-900/20 px-1.5 py-0.5 rounded font-mono">{promo.code}</code>
                      <button 
                        onClick={() => copyCode(promo.code)}
                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                        title="Copy mã"
                      >
                        {copiedCode === promo.code ? <Check size={12} className="text-green-500" /> : <Copy size={12} className="text-slate-400" />}
                      </button>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {promo.discountType === 'percent' ? (
                    <Badge variant="secondary" className="bg-purple-500/10 text-purple-600">
                      -{promo.discountValue}%
                      {enabledFeatures.enableMaxDiscount && promo.maxDiscountAmount && (
                        <span className="text-xs ml-1">(max {formatPrice(promo.maxDiscountAmount)})</span>
                      )}
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-cyan-500/10 text-cyan-600">
                      -{formatPrice(promo.discountValue)}
                    </Badge>
                  )}
                  {enabledFeatures.enableMinOrder && promo.minOrderAmount && (
                    <p className="text-xs text-slate-500 mt-1">Đơn tối thiểu: {formatPrice(promo.minOrderAmount)}</p>
                  )}
                </TableCell>
                {enabledFeatures.enableSchedule && (
                  <TableCell className="text-sm text-slate-500">
                    {formatDate(promo.startDate)} - {formatDate(promo.endDate)}
                  </TableCell>
                )}
                {enabledFeatures.enableUsageLimit && (
                  <TableCell>
                    {promo.usageLimit ? (
                      <span className={promo.usedCount >= promo.usageLimit ? 'text-red-500 font-medium' : ''}>
                        {promo.usedCount}/{promo.usageLimit}
                      </span>
                    ) : (
                      <span className="text-slate-500">{promo.usedCount}</span>
                    )}
                  </TableCell>
                )}
                <TableCell>{getStatusBadge(promo.status)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Link href={`/admin/promotions/${promo._id}/edit`}><Button variant="ghost" size="icon"><Edit size={16}/></Button></Link>
                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => handleDelete(promo._id)}><Trash2 size={16}/></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {paginatedPromotions.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                  {searchTerm || filterStatus || filterType ? 'Không tìm thấy kết quả phù hợp' : 'Chưa có khuyến mãi nào. Nhấn Reset để tạo dữ liệu mẫu.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {sortedPromotions.length > 0 && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-sm text-slate-500">
              Hiển thị {(currentPage - 1) * promotionsPerPage + 1} - {Math.min(currentPage * promotionsPerPage, sortedPromotions.length)} / {sortedPromotions.length} khuyến mãi
            </span>
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => p - 1)}
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
                  onClick={() => setCurrentPage(p => p + 1)}
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
