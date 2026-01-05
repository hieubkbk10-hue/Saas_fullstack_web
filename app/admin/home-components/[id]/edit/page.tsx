'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Grid, LayoutTemplate, AlertCircle, Package, Briefcase, FileText, 
  Users, MousePointerClick, HelpCircle, User as UserIcon, Check, 
  Star, Award, Tag, Image as ImageIcon, Phone, Plus, Trash2, ArrowUp, ArrowDown
} from 'lucide-react';
import { toast } from 'sonner';
import { cn, Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from '../../../components/ui';
import { mockHomeComponents } from '../../../mockData';

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
  // Alias for mockData compatibility
  { value: 'ProductGrid', label: 'Sản phẩm', icon: Package, description: 'Grid sản phẩm' },
  { value: 'News', label: 'Tin tức', icon: FileText, description: 'Tin mới' },
  { value: 'Banner', label: 'Banner', icon: LayoutTemplate, description: 'Banner slider' },
];

export default function HomeComponentEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const component = mockHomeComponents.find(c => c.id === id);
  
  const [title, setTitle] = useState(component?.title || '');
  const [active, setActive] = useState(component?.active ?? true);

  // Hero slides state
  const [heroSlides, setHeroSlides] = useState([
    { id: 1, image: 'https://picsum.photos/1920/600?random=1', link: '/promo-1' },
    { id: 2, image: 'https://picsum.photos/1920/600?random=2', link: '/promo-2' },
  ]);

  // Stats state
  const [statsItems, setStatsItems] = useState([
    { id: 1, value: '1000+', label: 'Khách hàng' },
    { id: 2, value: '50+', label: 'Đối tác' },
    { id: 3, value: '99%', label: 'Hài lòng' },
  ]);

  if (!component) {
    return <div className="text-center py-8 text-slate-500">Không tìm thấy component</div>;
  }

  const TypeIcon = COMPONENT_TYPES.find(t => t.value === component.type)?.icon || Grid;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Đã cập nhật component');
    router.push('/admin/home-components');
  };

  const handleAddSlide = () => {
    setHeroSlides([...heroSlides, { id: Date.now(), image: '', link: '' }]);
  };

  const handleRemoveSlide = (slideId: number) => {
    if (heroSlides.length > 1) {
      setHeroSlides(heroSlides.filter(s => s.id !== slideId));
    } else {
      toast.error('Cần tối thiểu 1 banner');
    }
  };

  const handleMoveSlide = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === heroSlides.length - 1)) return;
    const newSlides = [...heroSlides];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    [newSlides[index], newSlides[swapIndex]] = [newSlides[swapIndex], newSlides[index]];
    setHeroSlides(newSlides);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Chỉnh sửa Component</h1>
        <Link href="/admin/home-components" className="text-sm text-blue-600 hover:underline">Quay lại danh sách</Link>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TypeIcon size={20} />
              {COMPONENT_TYPES.find(t => t.value === component.type)?.label || component.type}
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
                  "cursor-pointer inline-flex items-center justify-center rounded-full w-12 h-6 transition-colors",
                  active ? "bg-green-500" : "bg-slate-300 dark:bg-slate-600"
                )}
                onClick={() => setActive(!active)}
              >
                <div className={cn(
                  "w-5 h-5 bg-white rounded-full transition-transform shadow",
                  active ? "translate-x-2.5" : "-translate-x-2.5"
                )}></div>
              </div>
              <span className="text-sm text-slate-500">{active ? 'Bật' : 'Tắt'}</span>
            </div>
          </CardContent>
        </Card>

        {/* Type-specific configuration */}
        {component.type === 'Banner' && (
          <Card className="mb-6">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Danh sách Banner (Slider)</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={handleAddSlide} className="gap-2">
                <Plus size={14} /> Thêm Banner
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {heroSlides.map((slide, index) => (
                <div key={slide.id} className="flex gap-4 items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div className="w-32 h-16 bg-slate-200 dark:bg-slate-700 rounded overflow-hidden flex-shrink-0">
                    {slide.image && <img src={slide.image} alt="" className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 space-y-2">
                    <Input placeholder="URL liên kết" defaultValue={slide.link} className="h-8" />
                  </div>
                  <div className="flex gap-1">
                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8" disabled={index === 0} onClick={() => handleMoveSlide(index, 'up')}>
                      <ArrowUp size={14} />
                    </Button>
                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8" disabled={index === heroSlides.length - 1} onClick={() => handleMoveSlide(index, 'down')}>
                      <ArrowDown size={14} />
                    </Button>
                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleRemoveSlide(slide.id)}>
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {component.type === 'Stats' && (
          <Card className="mb-6">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Số liệu thống kê</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={() => setStatsItems([...statsItems, { id: Date.now(), value: '', label: '' }])} className="gap-2">
                <Plus size={14} /> Thêm
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {statsItems.map((item, idx) => (
                <div key={item.id} className="flex gap-3 items-center">
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-sm font-medium text-slate-500">
                    {idx + 1}
                  </div>
                  <Input 
                    placeholder="Số liệu (VD: 1000+)" 
                    value={item.value}
                    onChange={(e) => setStatsItems(statsItems.map(s => s.id === item.id ? {...s, value: e.target.value} : s))}
                    className="flex-1"
                  />
                  <Input 
                    placeholder="Nhãn (VD: Khách hàng)" 
                    value={item.label}
                    onChange={(e) => setStatsItems(statsItems.map(s => s.id === item.id ? {...s, label: e.target.value} : s))}
                    className="flex-1"
                  />
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    className="text-red-500 h-8 w-8"
                    onClick={() => statsItems.length > 1 && setStatsItems(statsItems.filter(s => s.id !== item.id))}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {(component.type === 'ProductGrid' || component.type === 'News') && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-base">Nguồn dữ liệu</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Số lượng hiển thị</Label>
                  <Input type="number" defaultValue={8} />
                </div>
                <div className="space-y-2">
                  <Label>Sắp xếp theo</Label>
                  <select className="w-full h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm">
                    <option>Mới nhất</option>
                    <option>Bán chạy nhất</option>
                    <option>Ngẫu nhiên</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {component.type === 'CTA' && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-base">Nội dung CTA</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Tiêu đề CTA</Label>
                <Input defaultValue="Đăng ký ngay hôm nay!" />
              </div>
              <div className="space-y-2">
                <Label>Mô tả ngắn</Label>
                <textarea 
                  className="w-full min-h-[80px] rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  defaultValue="Nhận ngay ưu đãi đặc biệt khi đăng ký thành viên"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Text nút bấm</Label>
                  <Input defaultValue="Đăng ký" />
                </div>
                <div className="space-y-2">
                  <Label>Liên kết</Label>
                  <Input defaultValue="/register" />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={() => router.push('/admin/home-components')}>Hủy bỏ</Button>
          <Button type="submit" variant="accent">Lưu thay đổi</Button>
        </div>
      </form>
    </div>
  );
}
