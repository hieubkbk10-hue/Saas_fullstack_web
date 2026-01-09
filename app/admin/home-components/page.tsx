'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Plus, Edit, Trash2, Grid, LayoutTemplate, AlertCircle, Package, 
  Briefcase, FileText, Users, MousePointerClick, HelpCircle, 
  User as UserIcon, Check, Star, Award, Tag, Image as ImageIcon, Phone, Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { cn, Button, Card, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui';
import { BulkActionBar, SelectCheckbox } from '../components/TableUtilities';
import { ModuleGuard } from '../components/ModuleGuard';

export default function HomeComponentsPageWrapper() {
  return (
    <ModuleGuard moduleKey="homepage">
      <HomeComponentsPage />
    </ModuleGuard>
  );
}

const COMPONENT_TYPES = [
  { value: 'Hero', label: 'Hero Banner', icon: LayoutTemplate, description: 'Banner chính đầu trang' },
  { value: 'Stats', label: 'Thống kê', icon: AlertCircle, description: 'Số liệu nổi bật' },
  { value: 'ProductList', label: 'Danh sách Sản phẩm', icon: Package, description: 'Sản phẩm theo danh mục' },
  { value: 'ServiceList', label: 'Danh sách Dịch vụ', icon: Briefcase, description: 'Các dịch vụ cung cấp' },
  { value: 'Blog', label: 'Tin tức / Blog', icon: FileText, description: 'Bài viết mới nhất' },
  { value: 'Partners', label: 'Đối tác / Logos', icon: Users, description: 'Logo đối tác, khách hàng' },
  { value: 'CTA', label: 'Kêu gọi hành động (CTA)', icon: MousePointerClick, description: 'Nút đăng ký, mua ngay' },
  { value: 'FAQ', label: 'Câu hỏi thường gặp', icon: HelpCircle, description: 'Hỏi đáp' },
  { value: 'About', label: 'Về chúng tôi', icon: UserIcon, description: 'Giới thiệu ngắn gọn' },
  { value: 'Footer', label: 'Footer', icon: LayoutTemplate, description: 'Chân trang' },
  { value: 'Services', label: 'Dịch vụ chi tiết', icon: Briefcase, description: 'Mô tả dịch vụ' },
  { value: 'Benefits', label: 'Lợi ích', icon: Check, description: 'Tại sao chọn chúng tôi' },
  { value: 'Testimonials', label: 'Đánh giá / Review', icon: Star, description: 'Ý kiến khách hàng' },
  { value: 'TrustBadges', label: 'Chứng nhận', icon: Award, description: 'Giải thưởng, chứng chỉ' },
  { value: 'Pricing', label: 'Bảng giá', icon: Tag, description: 'Các gói dịch vụ' },
  { value: 'Gallery', label: 'Thư viện ảnh', icon: ImageIcon, description: 'Hình ảnh hoạt động' },
  { value: 'CaseStudy', label: 'Dự án thực tế', icon: FileText, description: 'Case study tiêu biểu' },
  { value: 'Career', label: 'Tuyển dụng', icon: Users, description: 'Vị trí đang tuyển' },
  { value: 'Contact', label: 'Liên hệ', icon: Phone, description: 'Form liên hệ, bản đồ' },
  { value: 'ProductGrid', label: 'Sản phẩm', icon: Package, description: 'Grid sản phẩm' },
  { value: 'News', label: 'Tin tức', icon: FileText, description: 'Tin mới' },
  { value: 'Banner', label: 'Banner', icon: LayoutTemplate, description: 'Banner slider' },
];

function HomeComponentsPage() {
  const components = useQuery(api.homeComponents.listAll);
  const removeMutation = useMutation(api.homeComponents.remove);
  const toggleMutation = useMutation(api.homeComponents.toggle);
  
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  if (components === undefined) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }
  
  const sortedComponents = [...components].sort((a, b) => a.order - b.order);

  const toggleSelectAll = () => setSelectedIds(selectedIds.length === sortedComponents.length ? [] : sortedComponents.map(c => c._id));
  const toggleSelectItem = (id: string) => setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

  const handleDelete = async (id: Id<"homeComponents">) => {
    if (confirm('Xóa component này khỏi trang chủ?')) {
      try {
        await removeMutation({ id });
        toast.success('Đã xóa component');
      } catch {
        toast.error('Lỗi khi xóa component');
      }
    }
  };

  const handleBulkDelete = async () => {
    if (confirm(`Xóa ${selectedIds.length} component đã chọn?`)) {
      try {
        await Promise.all(selectedIds.map(id => removeMutation({ id: id as Id<"homeComponents"> })));
        setSelectedIds([]);
        toast.success(`Đã xóa ${selectedIds.length} component`);
      } catch {
        toast.error('Lỗi khi xóa components');
      }
    }
  };

  const toggleActive = async (id: Id<"homeComponents">) => {
    try {
      await toggleMutation({ id });
    } catch {
      toast.error('Lỗi khi cập nhật trạng thái');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Giao diện Trang chủ</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Quản lý các khối nội dung hiển thị trên trang chủ</p>
        </div>
        <Link href="/admin/home-components/create">
          <Button className="gap-2" variant="accent">
            <Plus size={16} /> Thêm Component
          </Button>
        </Link>
      </div>

      <BulkActionBar selectedCount={selectedIds.length} onDelete={handleBulkDelete} onClearSelection={() => setSelectedIds([])} />

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">
                <SelectCheckbox 
                  checked={selectedIds.length === sortedComponents.length && sortedComponents.length > 0} 
                  onChange={toggleSelectAll} 
                  indeterminate={selectedIds.length > 0 && selectedIds.length < sortedComponents.length} 
                />
              </TableHead>
              <TableHead className="w-[50px]">TT</TableHead>
              <TableHead>Tên Component</TableHead>
              <TableHead>Loại</TableHead>
              <TableHead className="text-center">Trạng thái</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedComponents.map((comp, index) => {
              const TypeIcon = COMPONENT_TYPES.find(t => t.value === comp.type)?.icon || Grid;
              return (
                <TableRow key={comp._id} className={selectedIds.includes(comp._id) ? 'bg-blue-500/5' : ''}>
                  <TableCell>
                    <SelectCheckbox checked={selectedIds.includes(comp._id)} onChange={() => toggleSelectItem(comp._id)} />
                  </TableCell>
                  <TableCell className="font-medium text-slate-500">{index + 1}</TableCell>
                  <TableCell>
                    <div className="font-medium">{comp.title}</div>
                    <div className="text-xs text-slate-400 truncate max-w-[300px]">{comp.config?.preview || comp.config?.description || ''}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="p-1 bg-slate-100 dark:bg-slate-800 rounded">
                        <TypeIcon size={14} className="text-slate-600 dark:text-slate-400" />
                      </div>
                      <span className="text-sm">{comp.type}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div 
                      className={cn(
                        "cursor-pointer inline-flex items-center justify-center rounded-full w-8 h-4 transition-colors",
                        comp.active ? "bg-green-500" : "bg-slate-300"
                      )}
                      onClick={() => toggleActive(comp._id)}
                    >
                      <div className={cn(
                        "w-3 h-3 bg-white rounded-full transition-transform",
                        comp.active ? "translate-x-2" : "-translate-x-2"
                      )}></div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/admin/home-components/${comp._id}/edit`}>
                        <Button variant="ghost" size="icon"><Edit size={16} /></Button>
                      </Link>
                      <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => handleDelete(comp._id)}>
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {sortedComponents.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-slate-500">Chưa có component nào</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {sortedComponents.length > 0 && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 text-sm text-slate-500">
            Hiển thị {sortedComponents.length} component
          </div>
        )}
      </Card>
    </div>
  );
}
