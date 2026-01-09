'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { 
  Grid, LayoutTemplate, AlertCircle, Package, Briefcase, FileText, 
  Users, MousePointerClick, HelpCircle, User as UserIcon, Check, 
  Star, Award, Tag, Image as ImageIcon, Phone, Plus, Trash2, Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { cn, Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from '../../../components/ui';
import { MultiImageUploader, ImageItem } from '../../../components/MultiImageUploader';

const COMPONENT_TYPES = [
  { value: 'Hero', label: 'Hero Banner', icon: LayoutTemplate },
  { value: 'Stats', label: 'Thống kê', icon: AlertCircle },
  { value: 'ProductList', label: 'Danh sách Sản phẩm', icon: Package },
  { value: 'ServiceList', label: 'Danh sách Dịch vụ', icon: Briefcase },
  { value: 'Blog', label: 'Tin tức / Blog', icon: FileText },
  { value: 'Partners', label: 'Đối tác / Logos', icon: Users },
  { value: 'CTA', label: 'Kêu gọi hành động (CTA)', icon: MousePointerClick },
  { value: 'FAQ', label: 'Câu hỏi thường gặp', icon: HelpCircle },
  { value: 'About', label: 'Về chúng tôi', icon: UserIcon },
  { value: 'Footer', label: 'Footer', icon: LayoutTemplate },
  { value: 'Services', label: 'Dịch vụ chi tiết', icon: Briefcase },
  { value: 'Benefits', label: 'Lợi ích', icon: Check },
  { value: 'Testimonials', label: 'Đánh giá / Review', icon: Star },
  { value: 'TrustBadges', label: 'Chứng nhận', icon: Award },
  { value: 'Pricing', label: 'Bảng giá', icon: Tag },
  { value: 'Gallery', label: 'Thư viện ảnh', icon: ImageIcon },
  { value: 'CaseStudy', label: 'Dự án thực tế', icon: FileText },
  { value: 'Career', label: 'Tuyển dụng', icon: Users },
  { value: 'Contact', label: 'Liên hệ', icon: Phone },
  { value: 'ProductGrid', label: 'Sản phẩm', icon: Package },
  { value: 'News', label: 'Tin tức', icon: FileText },
  { value: 'Banner', label: 'Banner', icon: LayoutTemplate },
];

interface HeroSlide extends ImageItem {
  id: string | number;
  url: string;
  link: string;
}

interface GalleryItem extends ImageItem {
  id: string | number;
  url: string;
  link: string;
}

export default function HomeComponentEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  
  const component = useQuery(api.homeComponents.getById, { id: id as Id<"homeComponents"> });
  const updateMutation = useMutation(api.homeComponents.update);
  
  const [title, setTitle] = useState('');
  const [active, setActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Config states for different component types
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [statsItems, setStatsItems] = useState<{id: number, value: string, label: string}[]>([]);
  const [ctaConfig, setCtaConfig] = useState({ title: '', description: '', buttonText: '', buttonLink: '', secondaryButtonText: '', secondaryButtonLink: '' });
  const [faqItems, setFaqItems] = useState<{id: number, question: string, answer: string}[]>([]);
  const [aboutConfig, setAboutConfig] = useState({ subHeading: '', heading: '', description: '', image: '', buttonText: '', buttonLink: '', stats: [] as {id: number, value: string, label: string}[] });
  const [footerConfig, setFooterConfig] = useState({ description: '', copyright: '', showSocialLinks: true });
  const [servicesItems, setServicesItems] = useState<{id: number, icon: string, title: string, description: string}[]>([]);
  const [testimonialsItems, setTestimonialsItems] = useState<{id: number, name: string, role: string, content: string, avatar: string, rating: number}[]>([]);
  const [pricingPlans, setPricingPlans] = useState<{id: number, name: string, price: string, period: string, features: string[], isPopular: boolean, buttonText: string, buttonLink: string}[]>([]);
  const [caseStudyProjects, setCaseStudyProjects] = useState<{id: number, title: string, category: string, image: string, description: string, link: string}[]>([]);
  const [careerJobs, setCareerJobs] = useState<{id: number, title: string, department: string, location: string, type: string, salary: string, description: string}[]>([]);
  const [contactConfig, setContactConfig] = useState({ address: '', phone: '', email: '', workingHours: '', showMap: true });
  const [productListConfig, setProductListConfig] = useState({ itemCount: 8, sortBy: 'newest' });

  // Initialize form with component data
  useEffect(() => {
    if (component && !isInitialized) {
      setTitle(component.title);
      setActive(component.active);
      
      const config = component.config || {};
      
      // Initialize config based on type
      switch (component.type) {
        case 'Hero':
        case 'Banner':
          setHeroSlides(config.slides?.map((s: {image: string, link: string}, i: number) => ({ id: `slide-${i}`, url: s.image, link: s.link || '' })) || [{ id: 'slide-1', url: '', link: '' }]);
          break;
        case 'Gallery':
        case 'Partners':
        case 'TrustBadges':
          setGalleryItems(config.items?.map((item: {url: string, link: string}, i: number) => ({ id: `item-${i}`, url: item.url, link: item.link || '' })) || [{ id: 'item-1', url: '', link: '' }]);
          break;
        case 'Stats':
          setStatsItems(config.items?.map((item: {value: string, label: string}, i: number) => ({ id: i, value: item.value, label: item.label })) || [{ id: 1, value: '', label: '' }]);
          break;
        case 'CTA':
          setCtaConfig({ title: config.title || '', description: config.description || '', buttonText: config.buttonText || '', buttonLink: config.buttonLink || '', secondaryButtonText: config.secondaryButtonText || '', secondaryButtonLink: config.secondaryButtonLink || '' });
          break;
        case 'FAQ':
          setFaqItems(config.items?.map((item: {question: string, answer: string}, i: number) => ({ id: i, question: item.question, answer: item.answer })) || [{ id: 1, question: '', answer: '' }]);
          break;
        case 'About':
          setAboutConfig({ ...config, stats: config.stats?.map((s: {value: string, label: string}, i: number) => ({ id: i, value: s.value, label: s.label })) || [] });
          break;
        case 'Footer':
          setFooterConfig({ description: config.description || '', copyright: config.copyright || '', showSocialLinks: config.showSocialLinks ?? true });
          break;
        case 'Services':
          setServicesItems(config.items?.map((item: {icon: string, title: string, description: string}, i: number) => ({ id: i, icon: item.icon, title: item.title, description: item.description })) || []);
          break;
        case 'Benefits':
          setServicesItems(config.items?.map((item: {icon: string, title: string, description: string}, i: number) => ({ id: i, icon: item.icon, title: item.title, description: item.description })) || []);
          break;
        case 'Testimonials':
          setTestimonialsItems(config.items?.map((item: {name: string, role: string, content: string, avatar: string, rating: number}, i: number) => ({ id: i, ...item })) || []);
          break;
        case 'Pricing':
          setPricingPlans(config.plans?.map((p: {name: string, price: string, period: string, features: string[], isPopular: boolean, buttonText: string, buttonLink: string}, i: number) => ({ id: i, ...p })) || []);
          break;
        case 'CaseStudy':
          setCaseStudyProjects(config.projects?.map((p: {title: string, category: string, image: string, description: string, link: string}, i: number) => ({ id: i, ...p })) || []);
          break;
        case 'Career':
          setCareerJobs(config.jobs?.map((j: {title: string, department: string, location: string, type: string, salary: string, description: string}, i: number) => ({ id: i, ...j })) || []);
          break;
        case 'Contact':
          setContactConfig({ address: config.address || '', phone: config.phone || '', email: config.email || '', workingHours: config.workingHours || '', showMap: config.showMap ?? true });
          break;
        case 'ProductList':
        case 'ServiceList':
        case 'Blog':
          setProductListConfig({ itemCount: config.itemCount || 8, sortBy: config.sortBy || 'newest' });
          break;
      }
      
      setIsInitialized(true);
    }
  }, [component, isInitialized]);

  if (component === undefined) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (component === null) {
    return <div className="text-center py-8 text-slate-500">Không tìm thấy component</div>;
  }

  const TypeIcon = COMPONENT_TYPES.find(t => t.value === component.type)?.icon || Grid;
  const typeLabel = COMPONENT_TYPES.find(t => t.value === component.type)?.label || component.type;

  const buildConfig = () => {
    switch (component.type) {
      case 'Hero':
      case 'Banner':
        return { slides: heroSlides.map(s => ({ image: s.url, link: s.link })) };
      case 'Gallery':
      case 'Partners':
      case 'TrustBadges':
        return { items: galleryItems.map(g => ({ url: g.url, link: g.link })) };
      case 'Stats':
        return { items: statsItems.map(s => ({ value: s.value, label: s.label })) };
      case 'CTA':
        return ctaConfig;
      case 'FAQ':
        return { items: faqItems.map(f => ({ question: f.question, answer: f.answer })) };
      case 'About':
        return aboutConfig;
      case 'Footer':
        return footerConfig;
      case 'Services':
      case 'Benefits':
        return { items: servicesItems.map(s => ({ icon: s.icon, title: s.title, description: s.description })) };
      case 'Testimonials':
        return { items: testimonialsItems.map(t => ({ name: t.name, role: t.role, content: t.content, avatar: t.avatar, rating: t.rating })) };
      case 'Pricing':
        return { plans: pricingPlans.map(p => ({ name: p.name, price: p.price, period: p.period, features: p.features, isPopular: p.isPopular, buttonText: p.buttonText, buttonLink: p.buttonLink })) };
      case 'CaseStudy':
        return { projects: caseStudyProjects.map(p => ({ title: p.title, category: p.category, image: p.image, description: p.description, link: p.link })) };
      case 'Career':
        return { jobs: careerJobs.map(j => ({ title: j.title, department: j.department, location: j.location, type: j.type, salary: j.salary, description: j.description })) };
      case 'Contact':
        return contactConfig;
      case 'ProductList':
      case 'ServiceList':
      case 'Blog':
        return productListConfig;
      default:
        return {};
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      await updateMutation({
        id: id as Id<"homeComponents">,
        title,
        active,
        config: buildConfig(),
      });
      toast.success('Đã cập nhật component');
      router.push('/admin/home-components');
    } catch (error) {
      toast.error('Lỗi khi cập nhật');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
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
              {typeLabel}
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

        {/* Hero/Banner slides */}
        {(component.type === 'Banner' || component.type === 'Hero') && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-base">Danh sách Banner (Slider)</CardTitle>
            </CardHeader>
            <CardContent>
              <MultiImageUploader<HeroSlide>
                items={heroSlides}
                onChange={setHeroSlides}
                folder="hero-banners"
                imageKey="url"
                extraFields={[{ key: 'link', placeholder: 'URL liên kết (khi click vào banner)', type: 'url' }]}
                minItems={1}
                maxItems={10}
                aspectRatio="banner"
                columns={1}
                showReorder={true}
                addButtonText="Thêm Banner"
              />
            </CardContent>
          </Card>
        )}

        {/* Gallery / Partners / TrustBadges */}
        {(component.type === 'Gallery' || component.type === 'Partners' || component.type === 'TrustBadges') && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-base">
                {component.type === 'Partners' ? 'Logo đối tác' : component.type === 'TrustBadges' ? 'Chứng nhận' : 'Thư viện ảnh'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MultiImageUploader<GalleryItem>
                items={galleryItems}
                onChange={setGalleryItems}
                folder={component.type.toLowerCase()}
                imageKey="url"
                extraFields={component.type === 'Partners' ? [{ key: 'link', placeholder: 'Link website đối tác', type: 'url' }] : []}
                minItems={1}
                maxItems={20}
                aspectRatio={component.type === 'Partners' ? 'video' : 'square'}
                columns={component.type === 'Gallery' ? 3 : 4}
                showReorder={true}
                addButtonText={component.type === 'Partners' ? 'Thêm logo' : 'Thêm ảnh'}
              />
            </CardContent>
          </Card>
        )}

        {/* Stats */}
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
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-sm font-medium text-slate-500">{idx + 1}</div>
                  <Input placeholder="Số liệu (VD: 1000+)" value={item.value} onChange={(e) => setStatsItems(statsItems.map(s => s.id === item.id ? {...s, value: e.target.value} : s))} className="flex-1" />
                  <Input placeholder="Nhãn (VD: Khách hàng)" value={item.label} onChange={(e) => setStatsItems(statsItems.map(s => s.id === item.id ? {...s, label: e.target.value} : s))} className="flex-1" />
                  <Button type="button" variant="ghost" size="icon" className="text-red-500 h-8 w-8" onClick={() => statsItems.length > 1 && setStatsItems(statsItems.filter(s => s.id !== item.id))}><Trash2 size={14} /></Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* CTA */}
        {component.type === 'CTA' && (
          <Card className="mb-6">
            <CardHeader><CardTitle className="text-base">Nội dung CTA</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Tiêu đề CTA</Label>
                <Input value={ctaConfig.title} onChange={(e) => setCtaConfig({...ctaConfig, title: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Mô tả</Label>
                <textarea value={ctaConfig.description} onChange={(e) => setCtaConfig({...ctaConfig, description: e.target.value})} className="w-full min-h-[80px] rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Text nút chính</Label><Input value={ctaConfig.buttonText} onChange={(e) => setCtaConfig({...ctaConfig, buttonText: e.target.value})} /></div>
                <div className="space-y-2"><Label>Liên kết</Label><Input value={ctaConfig.buttonLink} onChange={(e) => setCtaConfig({...ctaConfig, buttonLink: e.target.value})} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Text nút phụ</Label><Input value={ctaConfig.secondaryButtonText} onChange={(e) => setCtaConfig({...ctaConfig, secondaryButtonText: e.target.value})} /></div>
                <div className="space-y-2"><Label>Liên kết nút phụ</Label><Input value={ctaConfig.secondaryButtonLink} onChange={(e) => setCtaConfig({...ctaConfig, secondaryButtonLink: e.target.value})} /></div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* FAQ */}
        {component.type === 'FAQ' && (
          <Card className="mb-6">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Câu hỏi thường gặp</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={() => setFaqItems([...faqItems, { id: Date.now(), question: '', answer: '' }])} className="gap-2"><Plus size={14} /> Thêm</Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {faqItems.map((item, idx) => (
                <div key={item.id} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Câu hỏi {idx + 1}</Label>
                    <Button type="button" variant="ghost" size="icon" className="text-red-500 h-8 w-8" onClick={() => faqItems.length > 1 && setFaqItems(faqItems.filter(f => f.id !== item.id))}><Trash2 size={14} /></Button>
                  </div>
                  <Input placeholder="Nhập câu hỏi..." value={item.question} onChange={(e) => setFaqItems(faqItems.map(f => f.id === item.id ? {...f, question: e.target.value} : f))} />
                  <textarea placeholder="Nhập câu trả lời..." value={item.answer} onChange={(e) => setFaqItems(faqItems.map(f => f.id === item.id ? {...f, answer: e.target.value} : f))} className="w-full min-h-[80px] rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm" />
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        {component.type === 'Footer' && (
          <Card className="mb-6">
            <CardHeader><CardTitle className="text-base">Cấu hình Footer</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2"><Label>Mô tả công ty</Label><textarea value={footerConfig.description} onChange={(e) => setFooterConfig({...footerConfig, description: e.target.value})} className="w-full min-h-[60px] rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm" /></div>
              <div className="space-y-2"><Label>Copyright</Label><Input value={footerConfig.copyright} onChange={(e) => setFooterConfig({...footerConfig, copyright: e.target.value})} /></div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={footerConfig.showSocialLinks} onChange={(e) => setFooterConfig({...footerConfig, showSocialLinks: e.target.checked})} className="w-4 h-4 rounded" />
                <Label>Hiển thị social links</Label>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Services / Benefits */}
        {(component.type === 'Services' || component.type === 'Benefits') && (
          <Card className="mb-6">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">{component.type === 'Services' ? 'Dịch vụ' : 'Lợi ích'}</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={() => setServicesItems([...servicesItems, { id: Date.now(), icon: 'Star', title: '', description: '' }])} className="gap-2"><Plus size={14} /> Thêm</Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {servicesItems.map((item, idx) => (
                <div key={item.id} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Mục {idx + 1}</Label>
                    <Button type="button" variant="ghost" size="icon" className="text-red-500 h-8 w-8" onClick={() => servicesItems.length > 1 && setServicesItems(servicesItems.filter(s => s.id !== item.id))}><Trash2 size={14} /></Button>
                  </div>
                  <Input placeholder="Tiêu đề" value={item.title} onChange={(e) => setServicesItems(servicesItems.map(s => s.id === item.id ? {...s, title: e.target.value} : s))} />
                  <Input placeholder="Mô tả ngắn" value={item.description} onChange={(e) => setServicesItems(servicesItems.map(s => s.id === item.id ? {...s, description: e.target.value} : s))} />
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Contact */}
        {component.type === 'Contact' && (
          <Card className="mb-6">
            <CardHeader><CardTitle className="text-base">Thông tin liên hệ</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Địa chỉ</Label><Input value={contactConfig.address} onChange={(e) => setContactConfig({...contactConfig, address: e.target.value})} /></div>
                <div className="space-y-2"><Label>Số điện thoại</Label><Input value={contactConfig.phone} onChange={(e) => setContactConfig({...contactConfig, phone: e.target.value})} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Email</Label><Input value={contactConfig.email} onChange={(e) => setContactConfig({...contactConfig, email: e.target.value})} /></div>
                <div className="space-y-2"><Label>Giờ làm việc</Label><Input value={contactConfig.workingHours} onChange={(e) => setContactConfig({...contactConfig, workingHours: e.target.value})} /></div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={contactConfig.showMap} onChange={(e) => setContactConfig({...contactConfig, showMap: e.target.checked})} className="w-4 h-4 rounded" />
                <Label>Hiển thị bản đồ</Label>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ProductList/Blog */}
        {(component.type === 'ProductList' || component.type === 'ServiceList' || component.type === 'Blog') && (
          <Card className="mb-6">
            <CardHeader><CardTitle className="text-base">Nguồn dữ liệu</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Số lượng hiển thị</Label>
                  <Input type="number" value={productListConfig.itemCount} onChange={(e) => setProductListConfig({...productListConfig, itemCount: parseInt(e.target.value) || 8})} />
                </div>
                <div className="space-y-2">
                  <Label>Sắp xếp theo</Label>
                  <select className="w-full h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm" value={productListConfig.sortBy} onChange={(e) => setProductListConfig({...productListConfig, sortBy: e.target.value})}>
                    <option value="newest">Mới nhất</option>
                    <option value="bestseller">Bán chạy nhất</option>
                    <option value="random">Ngẫu nhiên</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={() => router.push('/admin/home-components')} disabled={isSubmitting}>Hủy bỏ</Button>
          <Button type="submit" variant="accent" disabled={isSubmitting}>{isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}</Button>
        </div>
      </form>
    </div>
  );
}
