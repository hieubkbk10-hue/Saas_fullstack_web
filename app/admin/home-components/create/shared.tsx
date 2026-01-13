'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { 
  Grid, LayoutTemplate, AlertCircle, Package, Briefcase, FileText, 
  Users, MousePointerClick, HelpCircle, User as UserIcon, Check, 
  Star, Award, Tag, Image as ImageIcon, Phone, Zap, FolderTree
} from 'lucide-react';
import { cn, Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from '../../components/ui';

export const COMPONENT_TYPES = [
  { value: 'Hero', label: 'Hero Banner', icon: LayoutTemplate, description: 'Banner chính đầu trang', route: 'hero' },
  { value: 'Stats', label: 'Thống kê', icon: AlertCircle, description: 'Số liệu nổi bật', route: 'stats' },
  { value: 'ProductList', label: 'Danh sách Sản phẩm', icon: Package, description: 'Sản phẩm theo danh mục', route: 'product-list?type=ProductList' },
  { value: 'ServiceList', label: 'Danh sách Dịch vụ', icon: Briefcase, description: 'Các dịch vụ cung cấp', route: 'product-list?type=ServiceList' },
  { value: 'Blog', label: 'Tin tức / Blog', icon: FileText, description: 'Bài viết mới nhất', route: 'product-list?type=Blog' },
  { value: 'Partners', label: 'Đối tác / Logos', icon: Users, description: 'Logo đối tác, khách hàng', route: 'gallery?type=Partners' },
  { value: 'CTA', label: 'Kêu gọi hành động (CTA)', icon: MousePointerClick, description: 'Nút đăng ký, mua ngay', route: 'cta' },
  { value: 'FAQ', label: 'Câu hỏi thường gặp', icon: HelpCircle, description: 'Hỏi đáp', route: 'faq' },
  { value: 'About', label: 'Về chúng tôi', icon: UserIcon, description: 'Giới thiệu ngắn gọn', route: 'about' },
  { value: 'Footer', label: 'Footer', icon: LayoutTemplate, description: 'Chân trang', route: 'footer' },
  { value: 'Services', label: 'Dịch vụ chi tiết', icon: Briefcase, description: 'Mô tả dịch vụ', route: 'services' },
  { value: 'Benefits', label: 'Lợi ích', icon: Check, description: 'Tại sao chọn chúng tôi', route: 'benefits' },
  { value: 'Testimonials', label: 'Đánh giá / Review', icon: Star, description: 'Ý kiến khách hàng', route: 'testimonials' },
  { value: 'TrustBadges', label: 'Chứng nhận', icon: Award, description: 'Giải thưởng, chứng chỉ', route: 'gallery?type=TrustBadges' },
  { value: 'Pricing', label: 'Bảng giá', icon: Tag, description: 'Các gói dịch vụ', route: 'pricing' },
  { value: 'Gallery', label: 'Thư viện ảnh', icon: ImageIcon, description: 'Hình ảnh hoạt động', route: 'gallery?type=Gallery' },
  { value: 'CaseStudy', label: 'Dự án thực tế', icon: FileText, description: 'Case study tiêu biểu', route: 'case-study' },
  { value: 'Career', label: 'Tuyển dụng', icon: Users, description: 'Vị trí đang tuyển', route: 'career' },
  { value: 'Contact', label: 'Liên hệ', icon: Phone, description: 'Form liên hệ, bản đồ', route: 'contact' },
  { value: 'SpeedDial', label: 'Speed Dial', icon: Zap, description: 'Nút liên hệ nhanh (FAB)', route: 'speed-dial' },
  { value: 'ProductCategories', label: 'Danh mục sản phẩm', icon: FolderTree, description: 'Hiển thị danh mục SP', route: 'product-categories' },
];

export const DEFAULT_BRAND_COLOR = '#3b82f6';

// Hook lấy brandColor từ settings - dùng cho tất cả Preview components
// Key trong settings table là 'site_brand_color' (theo moduleFields của settings module)
export function useBrandColor() {
  const setting = useQuery(api.settings.getByKey, { key: 'site_brand_color' });
  // setting === undefined: đang loading
  // setting === null: không có trong DB
  // setting.value: có data
  if (setting === undefined || setting === null) {
    return DEFAULT_BRAND_COLOR;
  }
  return (setting.value as string) || DEFAULT_BRAND_COLOR;
}

// Legacy export - giữ để không breaking change
export const BRAND_COLOR = DEFAULT_BRAND_COLOR;

export function getComponentType(type: string) {
  return COMPONENT_TYPES.find(t => t.value === type || t.route === type);
}

export function ComponentFormWrapper({ 
  type, 
  title, 
  setTitle, 
  active, 
  setActive, 
  onSubmit, 
  isSubmitting = false,
  children 
}: { 
  type: string;
  title: string;
  setTitle: (v: string) => void;
  active: boolean;
  setActive: (v: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting?: boolean;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const typeInfo = getComponentType(type);
  const TypeIcon = typeInfo?.icon || Grid;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Thêm {typeInfo?.label || 'Component'}
        </h1>
        <Link href="/admin/home-components/create" className="text-sm text-blue-600 hover:underline">
          ← Quay lại chọn loại
        </Link>
      </div>

      <form onSubmit={onSubmit}>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TypeIcon size={20} />
              Cấu hình {typeInfo?.label}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Tiêu đề hiển thị <span className="text-red-500">*</span></Label>
              <Input 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                required 
                placeholder="Nhập tiêu đề component..." 
              />
            </div>
            <div className="flex items-center gap-3">
              <Label>Trạng thái:</Label>
              <div 
                className={cn(
                  "cursor-pointer inline-flex items-center justify-center rounded-full w-8 h-4 transition-colors",
                  active ? "bg-green-500" : "bg-slate-300"
                )} 
                onClick={() => setActive(!active)}
              >
                <div className={cn(
                  "w-3 h-3 bg-white rounded-full transition-transform",
                  active ? "translate-x-2" : "-translate-x-2"
                )}></div>
              </div>
              <span className="text-sm text-slate-500">{active ? 'Bật' : 'Tắt'}</span>
            </div>
          </CardContent>
        </Card>

        {children}

        <div className="flex justify-end gap-3 mt-6">
          <Button type="button" variant="ghost" onClick={() => router.push('/admin/home-components')} disabled={isSubmitting}>
            Hủy bỏ
          </Button>
          <Button type="submit" variant="accent" disabled={isSubmitting}>
            {isSubmitting ? 'Đang tạo...' : 'Tạo Component'}
          </Button>
        </div>
      </form>
    </div>
  );
}

export function useComponentForm(defaultTitle: string, componentType: string) {
  const router = useRouter();
  const [title, setTitle] = React.useState(defaultTitle);
  const [active, setActive] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const createMutation = useMutation(api.homeComponents.create);

  const handleSubmit = async (e: React.FormEvent, config: Record<string, unknown> = {}) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      await createMutation({
        type: componentType,
        title,
        active,
        config,
      });
      toast.success('Đã thêm component mới');
      router.push('/admin/home-components');
    } catch (error) {
      toast.error('Lỗi khi tạo component');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return { title, setTitle, active, setActive, handleSubmit, isSubmitting, router };
}
