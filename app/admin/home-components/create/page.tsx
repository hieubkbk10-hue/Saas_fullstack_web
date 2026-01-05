'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Grid, LayoutTemplate, AlertCircle, Package, Briefcase, FileText, 
  Users, MousePointerClick, HelpCircle, User as UserIcon, Check, 
  Star, Award, Tag, Image as ImageIcon, Phone, ArrowRight, Plus, Trash2, 
  ArrowUp, ArrowDown, Upload
} from 'lucide-react';
import { toast } from 'sonner';
import { cn, Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from '../../components/ui';
import { 
  HeroBannerPreview, StatsPreview, FaqPreview, TestimonialsPreview, 
  PricingPreview, GalleryPreview, ServicesPreview, ProductListPreview, 
  BlogPreview, FooterPreview, CTAPreview, AboutPreview, BenefitsPreview,
  CaseStudyPreview, CareerPreview, ContactPreview
} from '../previews';

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
];

export default function HomeComponentCreatePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState('');
  const [title, setTitle] = useState('');
  const [active, setActive] = useState(true);

  // Brand color
  const brandColor = '#3b82f6';

  // Hero Slides state
  const [heroSlides, setHeroSlides] = useState([{ id: Date.now(), image: '', link: '' }]);

  // Stats state
  const [statsItems, setStatsItems] = useState([
    { id: 1, value: '1000+', label: 'Khách hàng' },
    { id: 2, value: '50+', label: 'Đối tác' },
    { id: 3, value: '99%', label: 'Hài lòng' },
    { id: 4, value: '24/7', label: 'Hỗ trợ' }
  ]);

  // FAQ state
  const [faqItems, setFaqItems] = useState([
    { id: 1, question: 'Làm thế nào để đặt hàng?', answer: 'Bạn có thể đặt hàng trực tuyến qua website hoặc gọi hotline.' },
    { id: 2, question: 'Chính sách đổi trả ra sao?', answer: 'Chúng tôi hỗ trợ đổi trả trong vòng 30 ngày.' }
  ]);

  // Gallery/Partners state
  const [galleryItems, setGalleryItems] = useState([
    { id: 1, url: '', link: '' },
    { id: 2, url: '', link: '' }
  ]);

  // Testimonials state
  const [testimonials, setTestimonials] = useState([
    { id: 1, name: 'Nguyễn Văn A', role: 'CEO, ABC Corp', content: 'Dịch vụ tuyệt vời!', avatar: '', rating: 5 },
    { id: 2, name: 'Trần Thị B', role: 'Manager, XYZ Ltd', content: 'Chất lượng vượt mong đợi.', avatar: '', rating: 5 }
  ]);

  // Pricing state
  const [pricingPlans, setPricingPlans] = useState([
    { id: 1, name: 'Cơ bản', price: '0', period: '/tháng', features: ['Tính năng A', 'Tính năng B'], isPopular: false, buttonText: 'Bắt đầu', buttonLink: '/register' },
    { id: 2, name: 'Chuyên nghiệp', price: '299.000', period: '/tháng', features: ['Tất cả Cơ bản', 'Tính năng C'], isPopular: true, buttonText: 'Mua ngay', buttonLink: '/checkout' },
    { id: 3, name: 'Doanh nghiệp', price: 'Liên hệ', period: '', features: ['Tất cả Pro', 'Hỗ trợ 24/7'], isPopular: false, buttonText: 'Liên hệ', buttonLink: '/contact' }
  ]);

  // Services/Benefits state
  const [servicesItems, setServicesItems] = useState([
    { id: 1, icon: 'Briefcase', title: 'Tư vấn chiến lược', description: 'Đội ngũ chuyên gia giàu kinh nghiệm' },
    { id: 2, icon: 'Shield', title: 'Bảo hành trọn đời', description: 'Cam kết chất lượng sản phẩm' },
    { id: 3, icon: 'Truck', title: 'Giao hàng nhanh', description: 'Miễn phí vận chuyển toàn quốc' }
  ]);

  // CTA state
  const [ctaConfig, setCtaConfig] = useState({
    title: 'Sẵn sàng bắt đầu?',
    description: 'Đăng ký ngay hôm nay để nhận ưu đãi đặc biệt',
    buttonText: 'Đăng ký ngay',
    buttonLink: '/register',
    secondaryButtonText: 'Tìm hiểu thêm',
    secondaryButtonLink: '/about'
  });

  // Footer state
  const [footerConfig, setFooterConfig] = useState({
    logo: '',
    description: 'Công ty TNHH ABC - Đối tác tin cậy của bạn',
    columns: [
      { id: 1, title: 'Về chúng tôi', links: [{ label: 'Giới thiệu', url: '/about' }, { label: 'Tuyển dụng', url: '/careers' }] },
      { id: 2, title: 'Hỗ trợ', links: [{ label: 'FAQ', url: '/faq' }, { label: 'Liên hệ', url: '/contact' }] }
    ],
    copyright: '© 2024 VietAdmin. All rights reserved.',
    showSocialLinks: true
  });

  // Product/Blog count
  const [itemCount, setItemCount] = useState(8);

  // About config
  const [aboutConfig, setAboutConfig] = useState({
    layout: 'split-left',
    subHeading: 'Câu chuyện thương hiệu',
    heading: 'Mang đến giá trị thực',
    description: 'Chúng tôi là đội ngũ chuyên gia với hơn 10 năm kinh nghiệm trong lĩnh vực...',
    image: '',
    stats: [
      { id: 1, value: '10+', label: 'Năm kinh nghiệm' },
      { id: 2, value: '5000+', label: 'Khách hàng tin dùng' }
    ],
    buttonText: 'Xem chi tiết',
    buttonLink: '/about'
  });

  // Benefits config (different from Services)
  const [benefitsItems, setBenefitsItems] = useState([
    { id: 1, icon: 'Check', title: 'Chất lượng đảm bảo', description: 'Sản phẩm chính hãng 100%' },
    { id: 2, icon: 'Clock', title: 'Tiết kiệm thời gian', description: 'Giao hàng trong 24h' },
    { id: 3, icon: 'Shield', title: 'An toàn bảo mật', description: 'Thanh toán được mã hóa' }
  ]);

  // Projects/CaseStudy config
  const [projects, setProjects] = useState([
    { id: 1, title: 'Dự án Website ABC Corp', category: 'Website', image: '', description: 'Thiết kế và phát triển website doanh nghiệp', link: '' },
    { id: 2, title: 'Ứng dụng Mobile XYZ', category: 'Mobile App', image: '', description: 'Ứng dụng đặt hàng cho chuỗi F&B', link: '' }
  ]);

  // Career/Jobs config
  const [jobPositions, setJobPositions] = useState([
    { id: 1, title: 'Frontend Developer', department: 'Engineering', location: 'Hà Nội', type: 'Full-time', salary: '15-25 triệu', description: '' },
    { id: 2, title: 'UI/UX Designer', department: 'Design', location: 'Remote', type: 'Full-time', salary: '12-20 triệu', description: '' }
  ]);

  // Contact config
  const [contactConfig, setContactConfig] = useState({
    showMap: true,
    mapEmbed: '',
    address: '123 Nguyễn Huệ, Quận 1, TP.HCM',
    phone: '1900 1234',
    email: 'contact@example.com',
    workingHours: 'Thứ 2 - Thứ 6: 8:00 - 17:00',
    formFields: ['name', 'email', 'phone', 'message'],
    socialLinks: [
      { id: 1, platform: 'facebook', url: '' },
      { id: 2, platform: 'zalo', url: '' }
    ]
  });

  const handleTypeSelect = (type: string) => {
    setSelectedType(type);
    const typeInfo = COMPONENT_TYPES.find(t => t.value === type);
    if (typeInfo) setTitle(typeInfo.label);
    setStep(2);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Đã thêm component mới');
    router.push('/admin/home-components');
  };

  // Handlers
  const handleAddSlide = () => setHeroSlides([...heroSlides, { id: Date.now(), image: '', link: '' }]);
  const handleRemoveSlide = (id: number) => heroSlides.length > 1 ? setHeroSlides(heroSlides.filter(s => s.id !== id)) : toast.error('Cần tối thiểu 1 banner');
  const handleMoveSlide = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === heroSlides.length - 1)) return;
    const newSlides = [...heroSlides];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    [newSlides[index], newSlides[swapIndex]] = [newSlides[swapIndex], newSlides[index]];
    setHeroSlides(newSlides);
  };

  const handleAddFaq = () => setFaqItems([...faqItems, { id: Date.now(), question: '', answer: '' }]);
  const handleRemoveFaq = (id: number) => faqItems.length > 1 && setFaqItems(faqItems.filter(f => f.id !== id));

  const handleAddGallery = () => setGalleryItems([...galleryItems, { id: Date.now(), url: '', link: '' }]);
  const handleRemoveGallery = (id: number) => galleryItems.length > 1 && setGalleryItems(galleryItems.filter(g => g.id !== id));

  const handleAddTestimonial = () => setTestimonials([...testimonials, { id: Date.now(), name: '', role: '', content: '', avatar: '', rating: 5 }]);
  const handleRemoveTestimonial = (id: number) => testimonials.length > 1 && setTestimonials(testimonials.filter(t => t.id !== id));

  const handleAddService = () => setServicesItems([...servicesItems, { id: Date.now(), icon: 'Star', title: '', description: '' }]);
  const handleRemoveService = (id: number) => servicesItems.length > 1 && setServicesItems(servicesItems.filter(s => s.id !== id));

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Thêm Component mới</h1>
        <Link href="/admin/home-components" className="text-sm text-blue-600 hover:underline">Quay lại danh sách</Link>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-4">
        <div className={cn("flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium", step >= 1 ? "bg-blue-500 text-white" : "bg-slate-100 text-slate-500")}>
          <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">1</span>
          Chọn loại
        </div>
        <ArrowRight size={16} className="text-slate-300" />
        <div className={cn("flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium", step >= 2 ? "bg-blue-500 text-white" : "bg-slate-100 text-slate-500")}>
          <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">2</span>
          Cấu hình
        </div>
      </div>

      {step === 1 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Chọn loại Component</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {COMPONENT_TYPES.map((type) => {
                const Icon = type.icon;
                return (
                  <div key={type.value} onClick={() => handleTypeSelect(type.value)}
                    className={cn("cursor-pointer border-2 rounded-xl p-4 transition-all hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10",
                      selectedType === type.value ? "border-blue-500 bg-blue-50 dark:bg-blue-500/10" : "border-slate-200 dark:border-slate-700")}>
                    <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
                      <Icon size={24} className="text-slate-600 dark:text-slate-400" />
                    </div>
                    <h3 className="font-medium text-slate-900 dark:text-slate-100">{type.label}</h3>
                    <p className="text-xs text-slate-500 mt-1">{type.description}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <form onSubmit={handleSubmit}>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                {(() => { const TypeIcon = COMPONENT_TYPES.find(t => t.value === selectedType)?.icon || Grid; return <TypeIcon size={20} />; })()}
                Cấu hình {COMPONENT_TYPES.find(t => t.value === selectedType)?.label}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Tiêu đề hiển thị <span className="text-red-500">*</span></Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Nhập tiêu đề component..." />
              </div>
              <div className="flex items-center gap-3">
                <Label>Trạng thái:</Label>
                <div className={cn("cursor-pointer inline-flex items-center justify-center rounded-full w-8 h-4 transition-colors", active ? "bg-green-500" : "bg-slate-300")} onClick={() => setActive(!active)}>
                  <div className={cn("w-3 h-3 bg-white rounded-full transition-transform", active ? "translate-x-2" : "-translate-x-2")}></div>
                </div>
                <span className="text-sm text-slate-500">{active ? 'Bật' : 'Tắt'}</span>
              </div>
            </CardContent>
          </Card>

          {/* Hero Banner Config */}
          {selectedType === 'Hero' && (
            <>
              <Card className="mb-6">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base">Danh sách Banner (Slider)</CardTitle>
                  <Button type="button" variant="outline" size="sm" onClick={handleAddSlide} className="gap-2"><Plus size={14} /> Thêm Banner</Button>
                </CardHeader>
                <CardContent className="space-y-3">
                  {heroSlides.map((slide, index) => (
                    <div key={slide.id} className="flex gap-4 items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <div className="w-32 h-16 bg-slate-200 dark:bg-slate-700 rounded overflow-hidden flex-shrink-0 flex items-center justify-center">
                        {slide.image ? <img src={slide.image} alt="" className="w-full h-full object-cover" /> : <Upload size={20} className="text-slate-400" />}
                      </div>
                      <div className="flex-1 space-y-2">
                        <Input placeholder="URL ảnh banner" value={slide.image} onChange={(e) => setHeroSlides(heroSlides.map(s => s.id === slide.id ? {...s, image: e.target.value} : s))} className="h-8" />
                        <Input placeholder="URL liên kết" value={slide.link} onChange={(e) => setHeroSlides(heroSlides.map(s => s.id === slide.id ? {...s, link: e.target.value} : s))} className="h-8" />
                      </div>
                      <div className="flex gap-1">
                        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" disabled={index === 0} onClick={() => handleMoveSlide(index, 'up')}><ArrowUp size={14} /></Button>
                        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" disabled={index === heroSlides.length - 1} onClick={() => handleMoveSlide(index, 'down')}><ArrowDown size={14} /></Button>
                        <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleRemoveSlide(slide.id)}><Trash2 size={14} /></Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
              <HeroBannerPreview slides={heroSlides} brandColor={brandColor} />
            </>
          )}

          {/* Stats Config */}
          {selectedType === 'Stats' && (
            <>
              <Card className="mb-6">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base">Số liệu thống kê</CardTitle>
                  <Button type="button" variant="outline" size="sm" onClick={() => setStatsItems([...statsItems, { id: Date.now(), value: '', label: '' }])} className="gap-2"><Plus size={14} /> Thêm</Button>
                </CardHeader>
                <CardContent className="space-y-3">
                  {statsItems.map((item, idx) => (
                    <div key={item.id} className="flex gap-3 items-center">
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-sm font-medium text-slate-500">{idx + 1}</div>
                      <Input placeholder="Số liệu (VD: 1000+)" value={item.value} onChange={(e) => setStatsItems(statsItems.map(s => s.id === item.id ? {...s, value: e.target.value} : s))} className="flex-1" />
                      <Input placeholder="Nhãn (VD: Khách hàng)" value={item.label} onChange={(e) => setStatsItems(statsItems.map(s => s.id === item.id ? {...s, label: e.target.value} : s))} className="flex-1" />
                      <Button type="button" variant="ghost" size="icon" className="text-red-500 h-8 w-8" onClick={() => statsItems.length > 1 && setStatsItems(statsItems.filter(s => s.id !== item.id))}><Trash2 size={14} /></Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
              <StatsPreview items={statsItems} brandColor={brandColor} />
            </>
          )}

          {/* FAQ Config */}
          {selectedType === 'FAQ' && (
            <>
              <Card className="mb-6">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base">Câu hỏi thường gặp</CardTitle>
                  <Button type="button" variant="outline" size="sm" onClick={handleAddFaq} className="gap-2"><Plus size={14} /> Thêm</Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {faqItems.map((item, idx) => (
                    <div key={item.id} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <Label>Câu hỏi {idx + 1}</Label>
                        <Button type="button" variant="ghost" size="icon" className="text-red-500 h-8 w-8" onClick={() => handleRemoveFaq(item.id)}><Trash2 size={14} /></Button>
                      </div>
                      <Input placeholder="Nhập câu hỏi..." value={item.question} onChange={(e) => setFaqItems(faqItems.map(f => f.id === item.id ? {...f, question: e.target.value} : f))} />
                      <textarea placeholder="Nhập câu trả lời..." value={item.answer} onChange={(e) => setFaqItems(faqItems.map(f => f.id === item.id ? {...f, answer: e.target.value} : f))}
                        className="w-full min-h-[80px] rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm" />
                    </div>
                  ))}
                </CardContent>
              </Card>
              <FaqPreview items={faqItems} brandColor={brandColor} />
            </>
          )}

          {/* Partners/Gallery/TrustBadges Config */}
          {(selectedType === 'Partners' || selectedType === 'Gallery' || selectedType === 'TrustBadges') && (
            <>
              <Card className="mb-6">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base">{selectedType === 'Partners' ? 'Logo đối tác' : selectedType === 'TrustBadges' ? 'Chứng nhận' : 'Thư viện ảnh'}</CardTitle>
                  <Button type="button" variant="outline" size="sm" onClick={handleAddGallery} className="gap-2"><Plus size={14} /> Thêm</Button>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {galleryItems.map((item) => (
                      <div key={item.id} className="relative group">
                        <div className="aspect-[3/2] bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center overflow-hidden">
                          {item.url ? <img src={item.url} alt="" className="w-full h-full object-cover" /> : <Upload size={24} className="text-slate-400" />}
                        </div>
                        <Input placeholder="URL ảnh" value={item.url} onChange={(e) => setGalleryItems(galleryItems.map(g => g.id === item.id ? {...g, url: e.target.value} : g))} className="mt-2 h-8" />
                        <Button type="button" variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6 bg-red-500 text-white opacity-0 group-hover:opacity-100" onClick={() => handleRemoveGallery(item.id)}><Trash2 size={12} /></Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <GalleryPreview items={galleryItems} brandColor={brandColor} componentType={selectedType as 'Partners' | 'Gallery' | 'TrustBadges'} />
            </>
          )}

          {/* Testimonials Config */}
          {selectedType === 'Testimonials' && (
            <>
              <Card className="mb-6">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base">Đánh giá khách hàng</CardTitle>
                  <Button type="button" variant="outline" size="sm" onClick={handleAddTestimonial} className="gap-2"><Plus size={14} /> Thêm</Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {testimonials.map((item, idx) => (
                    <div key={item.id} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <Label>Đánh giá {idx + 1}</Label>
                        <Button type="button" variant="ghost" size="icon" className="text-red-500 h-8 w-8" onClick={() => handleRemoveTestimonial(item.id)}><Trash2 size={14} /></Button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <Input placeholder="Tên khách hàng" value={item.name} onChange={(e) => setTestimonials(testimonials.map(t => t.id === item.id ? {...t, name: e.target.value} : t))} />
                        <Input placeholder="Chức vụ / Công ty" value={item.role} onChange={(e) => setTestimonials(testimonials.map(t => t.id === item.id ? {...t, role: e.target.value} : t))} />
                      </div>
                      <textarea placeholder="Nội dung đánh giá..." value={item.content} onChange={(e) => setTestimonials(testimonials.map(t => t.id === item.id ? {...t, content: e.target.value} : t))}
                        className="w-full min-h-[60px] rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm" />
                      <div className="flex items-center gap-2">
                        <Label className="text-sm">Đánh giá:</Label>
                        {[1,2,3,4,5].map(star => (
                          <Star key={star} size={20} className={cn("cursor-pointer", star <= item.rating ? "text-yellow-400 fill-yellow-400" : "text-slate-300")}
                            onClick={() => setTestimonials(testimonials.map(t => t.id === item.id ? {...t, rating: star} : t))} />
                        ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
              <TestimonialsPreview items={testimonials} brandColor={brandColor} />
            </>
          )}

          {/* Pricing Config */}
          {selectedType === 'Pricing' && (
            <>
              <Card className="mb-6">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base">Các gói dịch vụ</CardTitle>
                  <Button type="button" variant="outline" size="sm" onClick={() => setPricingPlans([...pricingPlans, { id: Date.now(), name: '', price: '', period: '/tháng', features: [], isPopular: false, buttonText: 'Chọn gói', buttonLink: '' }])} className="gap-2"><Plus size={14} /> Thêm gói</Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {pricingPlans.map((plan, idx) => (
                    <div key={plan.id} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <Label>Gói {idx + 1}</Label>
                        <div className="flex items-center gap-2">
                          <label className="flex items-center gap-2 text-sm">
                            <input type="checkbox" checked={plan.isPopular} onChange={(e) => setPricingPlans(pricingPlans.map(p => p.id === plan.id ? {...p, isPopular: e.target.checked} : p))} className="w-4 h-4 rounded" />
                            Nổi bật
                          </label>
                          <Button type="button" variant="ghost" size="icon" className="text-red-500 h-8 w-8" onClick={() => pricingPlans.length > 1 && setPricingPlans(pricingPlans.filter(p => p.id !== plan.id))}><Trash2 size={14} /></Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <Input placeholder="Tên gói" value={plan.name} onChange={(e) => setPricingPlans(pricingPlans.map(p => p.id === plan.id ? {...p, name: e.target.value} : p))} />
                        <Input placeholder="Giá (VD: 299.000)" value={plan.price} onChange={(e) => setPricingPlans(pricingPlans.map(p => p.id === plan.id ? {...p, price: e.target.value} : p))} />
                      </div>
                      <Input placeholder="Tính năng (phân cách bởi dấu phẩy)" value={plan.features.join(', ')} onChange={(e) => setPricingPlans(pricingPlans.map(p => p.id === plan.id ? {...p, features: e.target.value.split(', ').filter(Boolean)} : p))} />
                      <div className="grid grid-cols-2 gap-3">
                        <Input placeholder="Text nút bấm" value={plan.buttonText} onChange={(e) => setPricingPlans(pricingPlans.map(p => p.id === plan.id ? {...p, buttonText: e.target.value} : p))} />
                        <Input placeholder="Liên kết" value={plan.buttonLink} onChange={(e) => setPricingPlans(pricingPlans.map(p => p.id === plan.id ? {...p, buttonLink: e.target.value} : p))} />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
              <PricingPreview plans={pricingPlans} brandColor={brandColor} />
            </>
          )}

          {/* Services Config */}
          {selectedType === 'Services' && (
            <>
              <Card className="mb-6">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base">Dịch vụ</CardTitle>
                  <Button type="button" variant="outline" size="sm" onClick={handleAddService} className="gap-2"><Plus size={14} /> Thêm</Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {servicesItems.map((item, idx) => (
                    <div key={item.id} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <Label>Dịch vụ {idx + 1}</Label>
                        <Button type="button" variant="ghost" size="icon" className="text-red-500 h-8 w-8" onClick={() => handleRemoveService(item.id)}><Trash2 size={14} /></Button>
                      </div>
                      <Input placeholder="Tiêu đề" value={item.title} onChange={(e) => setServicesItems(servicesItems.map(s => s.id === item.id ? {...s, title: e.target.value} : s))} />
                      <Input placeholder="Mô tả ngắn" value={item.description} onChange={(e) => setServicesItems(servicesItems.map(s => s.id === item.id ? {...s, description: e.target.value} : s))} />
                    </div>
                  ))}
                </CardContent>
              </Card>
              <ServicesPreview items={servicesItems} brandColor={brandColor} componentType="Services" />
            </>
          )}

          {/* CTA Config */}
          {selectedType === 'CTA' && (
            <>
              <Card className="mb-6">
                <CardHeader><CardTitle className="text-base">Nội dung CTA</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Tiêu đề</Label>
                    <Input value={ctaConfig.title} onChange={(e) => setCtaConfig({...ctaConfig, title: e.target.value})} placeholder="Sẵn sàng bắt đầu?" />
                  </div>
                  <div className="space-y-2">
                    <Label>Mô tả</Label>
                    <textarea value={ctaConfig.description} onChange={(e) => setCtaConfig({...ctaConfig, description: e.target.value})} placeholder="Đăng ký ngay..."
                      className="w-full min-h-[60px] rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Text nút chính</Label>
                      <Input value={ctaConfig.buttonText} onChange={(e) => setCtaConfig({...ctaConfig, buttonText: e.target.value})} placeholder="Đăng ký ngay" />
                    </div>
                    <div className="space-y-2">
                      <Label>Liên kết nút chính</Label>
                      <Input value={ctaConfig.buttonLink} onChange={(e) => setCtaConfig({...ctaConfig, buttonLink: e.target.value})} placeholder="/register" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Text nút phụ (tùy chọn)</Label>
                      <Input value={ctaConfig.secondaryButtonText} onChange={(e) => setCtaConfig({...ctaConfig, secondaryButtonText: e.target.value})} placeholder="Tìm hiểu thêm" />
                    </div>
                    <div className="space-y-2">
                      <Label>Liên kết nút phụ</Label>
                      <Input value={ctaConfig.secondaryButtonLink} onChange={(e) => setCtaConfig({...ctaConfig, secondaryButtonLink: e.target.value})} placeholder="/about" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <CTAPreview config={ctaConfig} brandColor={brandColor} />
            </>
          )}

          {/* Footer Config */}
          {selectedType === 'Footer' && (
            <>
              <Card className="mb-6">
                <CardHeader><CardTitle className="text-base">Cấu hình Footer</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Mô tả công ty</Label>
                    <textarea value={footerConfig.description} onChange={(e) => setFooterConfig({...footerConfig, description: e.target.value})} placeholder="Công ty TNHH ABC..."
                      className="w-full min-h-[60px] rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm" />
                  </div>
                  <div className="space-y-2">
                    <Label>Copyright</Label>
                    <Input value={footerConfig.copyright} onChange={(e) => setFooterConfig({...footerConfig, copyright: e.target.value})} placeholder="© 2024 Company" />
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" checked={footerConfig.showSocialLinks} onChange={(e) => setFooterConfig({...footerConfig, showSocialLinks: e.target.checked})} className="w-4 h-4 rounded" />
                    <Label>Hiển thị social links</Label>
                  </div>
                </CardContent>
              </Card>
              <FooterPreview config={footerConfig} brandColor={brandColor} />
            </>
          )}

          {/* ProductList/ServiceList/Blog Config */}
          {(selectedType === 'ProductList' || selectedType === 'ServiceList' || selectedType === 'Blog') && (
            <>
              <Card className="mb-6">
                <CardHeader><CardTitle className="text-base">Nguồn dữ liệu</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Số lượng hiển thị</Label>
                      <Input type="number" value={itemCount} onChange={(e) => setItemCount(parseInt(e.target.value) || 8)} />
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
              {selectedType === 'Blog' ? (
                <BlogPreview brandColor={brandColor} postCount={itemCount} />
              ) : (
                <ProductListPreview brandColor={brandColor} itemCount={itemCount} componentType={selectedType as 'ProductList' | 'ServiceList'} />
              )}
            </>
          )}

          {/* About Config */}
          {selectedType === 'About' && (
            <>
              <Card className="mb-6">
                <CardHeader><CardTitle className="text-base">Cấu hình Về chúng tôi</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Tiêu đề nhỏ (Sub-heading)</Label>
                      <Input value={aboutConfig.subHeading} onChange={(e) => setAboutConfig({...aboutConfig, subHeading: e.target.value})} placeholder="Về chúng tôi" />
                    </div>
                    <div className="space-y-2">
                      <Label>Tiêu đề chính (Heading)</Label>
                      <Input value={aboutConfig.heading} onChange={(e) => setAboutConfig({...aboutConfig, heading: e.target.value})} placeholder="Mang đến giá trị thực" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Mô tả</Label>
                    <textarea value={aboutConfig.description} onChange={(e) => setAboutConfig({...aboutConfig, description: e.target.value})} placeholder="Mô tả về công ty..."
                      className="w-full min-h-[100px] rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm" />
                  </div>
                  <div className="space-y-2">
                    <Label>URL Hình ảnh</Label>
                    <Input value={aboutConfig.image} onChange={(e) => setAboutConfig({...aboutConfig, image: e.target.value})} placeholder="https://..." />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Text nút bấm</Label>
                      <Input value={aboutConfig.buttonText} onChange={(e) => setAboutConfig({...aboutConfig, buttonText: e.target.value})} placeholder="Xem thêm" />
                    </div>
                    <div className="space-y-2">
                      <Label>Liên kết</Label>
                      <Input value={aboutConfig.buttonLink} onChange={(e) => setAboutConfig({...aboutConfig, buttonLink: e.target.value})} placeholder="/about" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Số liệu nổi bật</Label>
                      <Button type="button" variant="outline" size="sm" onClick={() => setAboutConfig({...aboutConfig, stats: [...aboutConfig.stats, { id: Date.now(), value: '', label: '' }]})} className="gap-2"><Plus size={14} /> Thêm</Button>
                    </div>
                    {aboutConfig.stats.map((stat, idx) => (
                      <div key={stat.id} className="flex gap-3 items-center">
                        <Input placeholder="Số liệu" value={stat.value} onChange={(e) => setAboutConfig({...aboutConfig, stats: aboutConfig.stats.map(s => s.id === stat.id ? {...s, value: e.target.value} : s)})} className="flex-1" />
                        <Input placeholder="Nhãn" value={stat.label} onChange={(e) => setAboutConfig({...aboutConfig, stats: aboutConfig.stats.map(s => s.id === stat.id ? {...s, label: e.target.value} : s)})} className="flex-1" />
                        <Button type="button" variant="ghost" size="icon" className="text-red-500 h-8 w-8" onClick={() => aboutConfig.stats.length > 1 && setAboutConfig({...aboutConfig, stats: aboutConfig.stats.filter(s => s.id !== stat.id)})}><Trash2 size={14} /></Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <AboutPreview config={aboutConfig} brandColor={brandColor} />
            </>
          )}

          {/* Benefits Config (different from Services) */}
          {selectedType === 'Benefits' && (
            <>
              <Card className="mb-6">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base">Lợi ích / Tại sao chọn chúng tôi</CardTitle>
                  <Button type="button" variant="outline" size="sm" onClick={() => setBenefitsItems([...benefitsItems, { id: Date.now(), icon: 'Star', title: '', description: '' }])} className="gap-2"><Plus size={14} /> Thêm</Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {benefitsItems.map((item, idx) => (
                    <div key={item.id} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <Label>Lợi ích {idx + 1}</Label>
                        <Button type="button" variant="ghost" size="icon" className="text-red-500 h-8 w-8" onClick={() => benefitsItems.length > 1 && setBenefitsItems(benefitsItems.filter(b => b.id !== item.id))}><Trash2 size={14} /></Button>
                      </div>
                      <Input placeholder="Tiêu đề" value={item.title} onChange={(e) => setBenefitsItems(benefitsItems.map(b => b.id === item.id ? {...b, title: e.target.value} : b))} />
                      <Input placeholder="Mô tả ngắn" value={item.description} onChange={(e) => setBenefitsItems(benefitsItems.map(b => b.id === item.id ? {...b, description: e.target.value} : b))} />
                    </div>
                  ))}
                </CardContent>
              </Card>
              <BenefitsPreview items={benefitsItems} brandColor={brandColor} />
            </>
          )}

          {/* CaseStudy/Projects Config */}
          {selectedType === 'CaseStudy' && (
            <>
              <Card className="mb-6">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base">Dự án tiêu biểu</CardTitle>
                  <Button type="button" variant="outline" size="sm" onClick={() => setProjects([...projects, { id: Date.now(), title: '', category: '', image: '', description: '', link: '' }])} className="gap-2"><Plus size={14} /> Thêm dự án</Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {projects.map((project, idx) => (
                    <div key={project.id} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <Label>Dự án {idx + 1}</Label>
                        <Button type="button" variant="ghost" size="icon" className="text-red-500 h-8 w-8" onClick={() => projects.length > 1 && setProjects(projects.filter(p => p.id !== project.id))}><Trash2 size={14} /></Button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <Input placeholder="Tên dự án" value={project.title} onChange={(e) => setProjects(projects.map(p => p.id === project.id ? {...p, title: e.target.value} : p))} />
                        <Input placeholder="Danh mục (Website, Mobile...)" value={project.category} onChange={(e) => setProjects(projects.map(p => p.id === project.id ? {...p, category: e.target.value} : p))} />
                      </div>
                      <Input placeholder="URL hình ảnh" value={project.image} onChange={(e) => setProjects(projects.map(p => p.id === project.id ? {...p, image: e.target.value} : p))} />
                      <Input placeholder="Mô tả ngắn" value={project.description} onChange={(e) => setProjects(projects.map(p => p.id === project.id ? {...p, description: e.target.value} : p))} />
                      <Input placeholder="Link chi tiết" value={project.link} onChange={(e) => setProjects(projects.map(p => p.id === project.id ? {...p, link: e.target.value} : p))} />
                    </div>
                  ))}
                </CardContent>
              </Card>
              <CaseStudyPreview projects={projects} brandColor={brandColor} />
            </>
          )}

          {/* Career Config */}
          {selectedType === 'Career' && (
            <>
              <Card className="mb-6">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base">Vị trí tuyển dụng</CardTitle>
                  <Button type="button" variant="outline" size="sm" onClick={() => setJobPositions([...jobPositions, { id: Date.now(), title: '', department: '', location: '', type: 'Full-time', salary: '', description: '' }])} className="gap-2"><Plus size={14} /> Thêm vị trí</Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {jobPositions.map((job, idx) => (
                    <div key={job.id} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <Label>Vị trí {idx + 1}</Label>
                        <Button type="button" variant="ghost" size="icon" className="text-red-500 h-8 w-8" onClick={() => jobPositions.length > 1 && setJobPositions(jobPositions.filter(j => j.id !== job.id))}><Trash2 size={14} /></Button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <Input placeholder="Vị trí tuyển dụng" value={job.title} onChange={(e) => setJobPositions(jobPositions.map(j => j.id === job.id ? {...j, title: e.target.value} : j))} />
                        <Input placeholder="Phòng ban" value={job.department} onChange={(e) => setJobPositions(jobPositions.map(j => j.id === job.id ? {...j, department: e.target.value} : j))} />
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <Input placeholder="Địa điểm" value={job.location} onChange={(e) => setJobPositions(jobPositions.map(j => j.id === job.id ? {...j, location: e.target.value} : j))} />
                        <select className="h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm" value={job.type} onChange={(e) => setJobPositions(jobPositions.map(j => j.id === job.id ? {...j, type: e.target.value} : j))}>
                          <option>Full-time</option>
                          <option>Part-time</option>
                          <option>Contract</option>
                          <option>Internship</option>
                        </select>
                        <Input placeholder="Mức lương" value={job.salary} onChange={(e) => setJobPositions(jobPositions.map(j => j.id === job.id ? {...j, salary: e.target.value} : j))} />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
              <CareerPreview jobs={jobPositions} brandColor={brandColor} />
            </>
          )}

          {/* Contact Config */}
          {selectedType === 'Contact' && (
            <>
              <Card className="mb-6">
                <CardHeader><CardTitle className="text-base">Cấu hình Liên hệ</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Địa chỉ</Label>
                      <Input value={contactConfig.address} onChange={(e) => setContactConfig({...contactConfig, address: e.target.value})} placeholder="123 Nguyễn Huệ, Q1, TP.HCM" />
                    </div>
                    <div className="space-y-2">
                      <Label>Số điện thoại</Label>
                      <Input value={contactConfig.phone} onChange={(e) => setContactConfig({...contactConfig, phone: e.target.value})} placeholder="1900 1234" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input value={contactConfig.email} onChange={(e) => setContactConfig({...contactConfig, email: e.target.value})} placeholder="contact@example.com" />
                    </div>
                    <div className="space-y-2">
                      <Label>Giờ làm việc</Label>
                      <Input value={contactConfig.workingHours} onChange={(e) => setContactConfig({...contactConfig, workingHours: e.target.value})} placeholder="T2-T6: 8:00-17:00" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" checked={contactConfig.showMap} onChange={(e) => setContactConfig({...contactConfig, showMap: e.target.checked})} className="w-4 h-4 rounded" />
                    <Label>Hiển thị bản đồ</Label>
                  </div>
                </CardContent>
              </Card>
              <ContactPreview config={contactConfig} brandColor={brandColor} />
            </>
          )}

          <div className="flex justify-between">
            <Button type="button" variant="ghost" onClick={() => setStep(1)}>Quay lại</Button>
            <div className="flex gap-3">
              <Button type="button" variant="ghost" onClick={() => router.push('/admin/home-components')}>Hủy bỏ</Button>
              <Button type="submit" variant="accent">Tạo Component</Button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
