'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { 
  AlertCircle, Award, Briefcase, Check, FileText, FolderTree, 
  Grid, HelpCircle, Image as ImageIcon, LayoutTemplate, MousePointerClick, 
  Package, Phone, ShoppingBag, Star, Tag, UserCircle, User as UserIcon, Users, Zap
} from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label, cn } from '../../components/ui';

export const COMPONENT_TYPES = [
  { description: 'Banner chính đầu trang', icon: LayoutTemplate, label: 'Hero Banner', route: 'hero', value: 'Hero' },
  { description: 'Số liệu nổi bật', icon: AlertCircle, label: 'Thống kê', route: 'stats', value: 'Stats' },
  { description: 'Sản phẩm theo danh mục', icon: Package, label: 'Danh sách Sản phẩm', route: 'product-list?type=ProductList', value: 'ProductList' },
  { description: 'Các dịch vụ cung cấp', icon: Briefcase, label: 'Danh sách Dịch vụ', route: 'product-list?type=ServiceList', value: 'ServiceList' },
  { description: 'Bài viết mới nhất', icon: FileText, label: 'Tin tức / Blog', route: 'product-list?type=Blog', value: 'Blog' },
  { description: 'Logo đối tác, khách hàng', icon: Users, label: 'Đối tác / Logos', route: 'gallery?type=Partners', value: 'Partners' },
  { description: 'Nút đăng ký, mua ngay', icon: MousePointerClick, label: 'Kêu gọi hành động (CTA)', route: 'cta', value: 'CTA' },
  { description: 'Hỏi đáp', icon: HelpCircle, label: 'Câu hỏi thường gặp', route: 'faq', value: 'FAQ' },
  { description: 'Giới thiệu ngắn gọn', icon: UserIcon, label: 'Về chúng tôi', route: 'about', value: 'About' },
  { description: 'Chân trang', icon: LayoutTemplate, label: 'Footer', route: 'footer', value: 'Footer' },
  { description: 'Mô tả dịch vụ', icon: Briefcase, label: 'Dịch vụ chi tiết', route: 'services', value: 'Services' },
  { description: 'Tại sao chọn chúng tôi', icon: Check, label: 'Lợi ích', route: 'benefits', value: 'Benefits' },
  { description: 'Ý kiến khách hàng', icon: Star, label: 'Đánh giá / Review', route: 'testimonials', value: 'Testimonials' },
  { description: 'Giải thưởng, chứng chỉ', icon: Award, label: 'Chứng nhận', route: 'gallery?type=TrustBadges', value: 'TrustBadges' },
  { description: 'Các gói dịch vụ', icon: Tag, label: 'Bảng giá', route: 'pricing', value: 'Pricing' },
  { description: 'Hình ảnh hoạt động', icon: ImageIcon, label: 'Thư viện ảnh', route: 'gallery?type=Gallery', value: 'Gallery' },
  { description: 'Case study tiêu biểu', icon: FileText, label: 'Dự án thực tế', route: 'case-study', value: 'CaseStudy' },
  { description: 'Vị trí đang tuyển', icon: Users, label: 'Tuyển dụng', route: 'career', value: 'Career' },
  { description: 'Form liên hệ, bản đồ', icon: Phone, label: 'Liên hệ', route: 'contact', value: 'Contact' },
  { description: 'Nút liên hệ nhanh (FAB)', icon: Zap, label: 'Speed Dial', route: 'speed-dial', value: 'SpeedDial' },
  { description: 'Hiển thị danh mục SP', icon: FolderTree, label: 'Danh mục sản phẩm', route: 'product-categories', value: 'ProductCategories' },
  { description: 'SP trong từng danh mục', icon: ShoppingBag, label: 'Sản phẩm theo danh mục', route: 'category-products', value: 'CategoryProducts' },
  { description: 'Giới thiệu đội ngũ với ảnh, chức vụ, social links', icon: UserCircle, label: 'Đội ngũ', route: 'team', value: 'Team' },
  { description: 'Tính năng nổi bật với icon grid', icon: Zap, label: 'Tính năng', route: 'features', value: 'Features' },
  { description: 'Các bước quy trình/timeline cho dịch vụ', icon: LayoutTemplate, label: 'Quy trình', route: 'process', value: 'Process' },
  { description: 'Logo khách hàng chạy auto-scroll', icon: Users, label: 'Khách hàng (Marquee)', route: 'clients', value: 'Clients' },
  { description: 'Video giới thiệu hoặc demo sản phẩm', icon: LayoutTemplate, label: 'Video / Media', route: 'video', value: 'Video' },
  { description: 'Banner khuyến mãi với đếm ngược thời gian', icon: AlertCircle, label: 'Khuyến mãi / Countdown', route: 'countdown', value: 'Countdown' },
];

export const DEFAULT_BRAND_COLOR = '#3b82f6';

// Hook lấy brandColor từ settings - dùng cho tất cả Preview components
// Key trong settings table là 'site_brand_color' (theo moduleFields của settings module)
export function useBrandColor() {
  const setting = useQuery(api.settings.getByKey, { key: 'site_brand_color' });
  // Setting === undefined: đang loading
  // Setting === null: không có trong DB
  // Setting.value: có data
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
  const TypeIcon = typeInfo?.icon ?? Grid;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Thêm {typeInfo?.label ?? 'Component'}
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
                onChange={(e) =>{  setTitle(e.target.value); }} 
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
                onClick={() =>{  setActive(!active); }}
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
          <Button type="button" variant="ghost" onClick={() =>{  router.push('/admin/home-components'); }} disabled={isSubmitting}>
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
    if (isSubmitting) {return;}
    
    setIsSubmitting(true);
    try {
      await createMutation({
        active,
        config,
        title,
        type: componentType,
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

  return { active, handleSubmit, isSubmitting, router, setActive, setTitle, title };
}
