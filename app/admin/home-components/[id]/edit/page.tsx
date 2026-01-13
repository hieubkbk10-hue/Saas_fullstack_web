'use client';

import React, { useState, useEffect, use, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { 
  Grid, LayoutTemplate, AlertCircle, Package, Briefcase, FileText, 
  Users, MousePointerClick, HelpCircle, User as UserIcon, Check, 
  Star, Award, Tag, Image as ImageIcon, Phone, Plus, Trash2, Loader2, Download,
  Search, GripVertical, X, Zap
} from 'lucide-react';
import { toast } from 'sonner';
import { cn, Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from '../../../components/ui';
import { MultiImageUploader, ImageItem } from '../../../components/MultiImageUploader';
import { ImageFieldWithUpload } from '../../../components/ImageFieldWithUpload';
import { 
  HeroBannerPreview, HeroStyle,
  StatsPreview, StatsStyle,
  FaqPreview, FaqStyle,
  CTAPreview, CTAStyle,
  ServicesPreview, ServicesStyle,
  BenefitsPreview, BenefitsStyle,
  GalleryPreview, GalleryStyle,
  TrustBadgesPreview, TrustBadgesStyle,
  ContactPreview, ContactStyle,
  BlogPreview, BlogStyle,
  ProductListPreview, ProductListStyle,
  ServiceListPreview, ServiceListStyle,
  FooterPreview, FooterStyle,
  AboutPreview, AboutStyle,
  TestimonialsPreview, TestimonialsStyle,
  PricingPreview, PricingStyle,
  CaseStudyPreview, CaseStudyStyle,
  CareerPreview, CareerStyle,
  SpeedDialPreview, SpeedDialStyle,
  ProductCategoriesPreview, ProductCategoriesStyle,
  CategoryProductsPreview, CategoryProductsStyle,
  TeamPreview, TeamStyle
} from '../../previews';
import { useBrandColor } from '../../create/shared';
import { CategoryImageSelector } from '../../../components/CategoryImageSelector';

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
  { value: 'SpeedDial', label: 'Speed Dial', icon: Zap },
  { value: 'ProductCategories', label: 'Danh mục sản phẩm', icon: Package },
  { value: 'CategoryProducts', label: 'Sản phẩm theo danh mục', icon: Package },
  { value: 'Team', label: 'Đội ngũ', icon: Users },
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
  name?: string;
}

export default function HomeComponentEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const brandColor = useBrandColor();
  
  const component = useQuery(api.homeComponents.getById, { id: id as Id<"homeComponents"> });
  const updateMutation = useMutation(api.homeComponents.update);
  // Query posts for Blog manual selection
  const postsData = useQuery(api.posts.listAll, { limit: 100 });
  // Query services for ServiceList manual selection
  const servicesData = useQuery(api.services.listAll, { limit: 100 });
  // Query products for ProductList manual selection
  const productsData = useQuery(api.products.listAll, { limit: 100 });
  // Query product categories for ProductCategories component
  const productCategoriesData = useQuery(api.productCategories.listActive);
  // Query settings for Footer
  const siteLogo = useQuery(api.settings.getByKey, { key: 'site_logo' });
  const socialFacebook = useQuery(api.settings.getByKey, { key: 'social_facebook' });
  const socialInstagram = useQuery(api.settings.getByKey, { key: 'social_instagram' });
  const socialYoutube = useQuery(api.settings.getByKey, { key: 'social_youtube' });
  const socialTiktok = useQuery(api.settings.getByKey, { key: 'social_tiktok' });
  const socialZalo = useQuery(api.settings.getByKey, { key: 'social_zalo' });
  
  const [title, setTitle] = useState('');
  const [active, setActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Config states for different component types
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [heroStyle, setHeroStyle] = useState<HeroStyle>('slider');
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [galleryStyle, setGalleryStyle] = useState<GalleryStyle>('grid');
  const [trustBadgesStyle, setTrustBadgesStyle] = useState<TrustBadgesStyle>('cards');
  const [statsItems, setStatsItems] = useState<{id: number, value: string, label: string}[]>([]);
  const [statsStyle, setStatsStyle] = useState<StatsStyle>('horizontal');
  const [ctaConfig, setCtaConfig] = useState({ title: '', description: '', buttonText: '', buttonLink: '', secondaryButtonText: '', secondaryButtonLink: '' });
  const [ctaStyle, setCtaStyle] = useState<CTAStyle>('banner');
  const [faqItems, setFaqItems] = useState<{id: number, question: string, answer: string}[]>([]);
  const [faqStyle, setFaqStyle] = useState<FaqStyle>('accordion');
  const [aboutConfig, setAboutConfig] = useState({ style: 'bento' as AboutStyle, subHeading: '', heading: '', description: '', image: '', buttonText: '', buttonLink: '', stats: [] as {id: number, value: string, label: string}[] });
  const [footerConfig, setFooterConfig] = useState({
    logo: '',
    description: '',
    columns: [] as { id: number; title: string; links: { label: string; url: string }[] }[],
    socialLinks: [] as { id: number; platform: string; url: string; icon: string }[],
    copyright: '',
    showSocialLinks: true
  });
  const [footerStyle, setFooterStyle] = useState<FooterStyle>('classic');
  const [servicesItems, setServicesItems] = useState<{id: number, icon: string, title: string, description: string}[]>([]);
  const [servicesStyle, setServicesStyle] = useState<ServicesStyle>('elegantGrid');
  const [benefitsStyle, setBenefitsStyle] = useState<BenefitsStyle>('cards');
  const [testimonialsItems, setTestimonialsItems] = useState<{id: number, name: string, role: string, content: string, avatar: string, rating: number}[]>([]);
  const [testimonialsStyle, setTestimonialsStyle] = useState<TestimonialsStyle>('cards');
  const [pricingPlans, setPricingPlans] = useState<{id: number, name: string, price: string, period: string, features: string[], isPopular: boolean, buttonText: string, buttonLink: string}[]>([]);
  const [pricingStyle, setPricingStyle] = useState<PricingStyle>('cards');
  const [caseStudyProjects, setCaseStudyProjects] = useState<{id: number, title: string, category: string, image: string, description: string, link: string}[]>([]);
  const [caseStudyStyle, setCaseStudyStyle] = useState<CaseStudyStyle>('grid');
  const [careerJobs, setCareerJobs] = useState<{id: number, title: string, department: string, location: string, type: string, salary: string, description: string}[]>([]);
  const [careerStyle, setCareerStyle] = useState<CareerStyle>('cards');
  const [speedDialActions, setSpeedDialActions] = useState<{id: number, icon: string, label: string, url: string, bgColor: string}[]>([]);
  const [speedDialStyle, setSpeedDialStyle] = useState<SpeedDialStyle>('fab');
  const [speedDialPosition, setSpeedDialPosition] = useState<'bottom-right' | 'bottom-left'>('bottom-right');
  const [speedDialAlwaysOpen, setSpeedDialAlwaysOpen] = useState(true);
  // ProductCategories states
  const [productCategoriesItems, setProductCategoriesItems] = useState<{id: number, categoryId: string, customImage: string, imageMode?: 'default' | 'icon' | 'upload' | 'url'}[]>([]);
  const [productCategoriesStyle, setProductCategoriesStyle] = useState<ProductCategoriesStyle>('grid');
  const [productCategoriesShowCount, setProductCategoriesShowCount] = useState(true);
  const [productCategoriesColsDesktop, setProductCategoriesColsDesktop] = useState(4);
  const [productCategoriesColsMobile, setProductCategoriesColsMobile] = useState(2);
  // CategoryProducts states
  const [categoryProductsSections, setCategoryProductsSections] = useState<{id: number, categoryId: string, itemCount: number}[]>([]);
  const [categoryProductsStyle, setCategoryProductsStyle] = useState<CategoryProductsStyle>('grid');
  const [categoryProductsShowViewAll, setCategoryProductsShowViewAll] = useState(true);
  const [categoryProductsColsDesktop, setCategoryProductsColsDesktop] = useState(4);
  const [categoryProductsColsMobile, setCategoryProductsColsMobile] = useState(2);
  // Team states
  const [teamMembers, setTeamMembers] = useState<{id: number, name: string, role: string, avatar: string, bio: string, facebook: string, linkedin: string, twitter: string, email: string}[]>([]);
  const [teamStyle, setTeamStyle] = useState<TeamStyle>('grid');
  const [contactConfig, setContactConfig] = useState({ address: '', phone: '', email: '', workingHours: '', showMap: true, mapEmbed: '' });
  const [contactStyle, setContactStyle] = useState<ContactStyle>('modern');
  const [productListConfig, setProductListConfig] = useState({ itemCount: 8, sortBy: 'newest' });
  const [productListStyle, setProductListStyle] = useState<ProductListStyle>('commerce');
  const [serviceListStyle, setServiceListStyle] = useState<ServiceListStyle>('grid');
  const [blogStyle, setBlogStyle] = useState<BlogStyle>('grid');
  // Blog manual selection states
  const [blogSelectionMode, setBlogSelectionMode] = useState<'auto' | 'manual'>('auto');
  const [selectedPostIds, setSelectedPostIds] = useState<string[]>([]);
  const [postSearchTerm, setPostSearchTerm] = useState('');
  // ServiceList manual selection states
  const [serviceSelectionMode, setServiceSelectionMode] = useState<'auto' | 'manual'>('auto');
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [serviceSearchTerm, setServiceSearchTerm] = useState('');
  // ProductList manual selection states
  const [productSelectionMode, setProductSelectionMode] = useState<'auto' | 'manual'>('auto');
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [productSearchTerm, setProductSearchTerm] = useState('');

  // Filter posts for search and get selected posts data
  const filteredPosts = useMemo(() => {
    if (!postsData) return [];
    return postsData
      .filter(post => post.status === 'Published')
      .filter(post => 
        !postSearchTerm || 
        post.title.toLowerCase().includes(postSearchTerm.toLowerCase())
      );
  }, [postsData, postSearchTerm]);

  const selectedPosts = useMemo(() => {
    if (!postsData || selectedPostIds.length === 0) return [];
    const postMap = new Map(postsData.map(p => [p._id, p]));
    return selectedPostIds
      .map(id => postMap.get(id as Id<"posts">))
      .filter((p): p is NonNullable<typeof p> => p !== undefined);
  }, [postsData, selectedPostIds]);

  // Filter services for search and get selected services data
  const filteredServices = useMemo(() => {
    if (!servicesData) return [];
    return servicesData
      .filter(service => service.status === 'Published')
      .filter(service => 
        !serviceSearchTerm || 
        service.title.toLowerCase().includes(serviceSearchTerm.toLowerCase())
      );
  }, [servicesData, serviceSearchTerm]);

  const selectedServices = useMemo(() => {
    if (!servicesData || selectedServiceIds.length === 0) return [];
    const serviceMap = new Map(servicesData.map(s => [s._id, s]));
    return selectedServiceIds
      .map(id => serviceMap.get(id as Id<"services">))
      .filter((s): s is NonNullable<typeof s> => s !== undefined);
  }, [servicesData, selectedServiceIds]);

  // Filter products for search and get selected products data
  const filteredProducts = useMemo(() => {
    if (!productsData) return [];
    return productsData
      .filter(product => product.status === 'Active')
      .filter(product => 
        !productSearchTerm || 
        product.name.toLowerCase().includes(productSearchTerm.toLowerCase())
      );
  }, [productsData, productSearchTerm]);

  const selectedProducts = useMemo(() => {
    if (!productsData || selectedProductIds.length === 0) return [];
    const productMap = new Map(productsData.map(p => [p._id, p]));
    return selectedProductIds
      .map(id => productMap.get(id as Id<"products">))
      .filter((p): p is NonNullable<typeof p> => p !== undefined);
  }, [productsData, selectedProductIds]);

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
          setHeroStyle((config.style as HeroStyle) || 'slider');
          break;
        case 'Gallery':
        case 'Partners':
          setGalleryItems(config.items?.map((item: {url: string, link: string, name?: string}, i: number) => ({ id: `item-${i}`, url: item.url, link: item.link || '', name: item.name || '' })) || [{ id: 'item-1', url: '', link: '', name: '' }]);
          setGalleryStyle((config.style as GalleryStyle) || 'grid');
          break;
        case 'TrustBadges':
          setGalleryItems(config.items?.map((item: {url: string, link: string, name?: string}, i: number) => ({ id: `item-${i}`, url: item.url, link: item.link || '', name: item.name || '' })) || [{ id: 'item-1', url: '', link: '', name: '' }]);
          setTrustBadgesStyle((config.style as TrustBadgesStyle) || 'cards');
          break;
        case 'Stats':
          setStatsItems(config.items?.map((item: {value: string, label: string}, i: number) => ({ id: i, value: item.value, label: item.label })) || [{ id: 1, value: '', label: '' }]);
          setStatsStyle((config.style as StatsStyle) || 'horizontal');
          break;
        case 'CTA':
          setCtaConfig({ title: config.title || '', description: config.description || '', buttonText: config.buttonText || '', buttonLink: config.buttonLink || '', secondaryButtonText: config.secondaryButtonText || '', secondaryButtonLink: config.secondaryButtonLink || '' });
          setCtaStyle((config.style as CTAStyle) || 'banner');
          break;
        case 'FAQ':
          setFaqItems(config.items?.map((item: {question: string, answer: string}, i: number) => ({ id: i, question: item.question, answer: item.answer })) || [{ id: 1, question: '', answer: '' }]);
          setFaqStyle((config.style as FaqStyle) || 'accordion');
          break;
        case 'About':
          setAboutConfig({ 
            style: (config.style as AboutStyle) || 'bento',
            subHeading: config.subHeading || '',
            heading: config.heading || '',
            description: config.description || '',
            image: config.image || '',
            buttonText: config.buttonText || '',
            buttonLink: config.buttonLink || '',
            stats: config.stats?.map((s: {value: string, label: string}, i: number) => ({ id: i, value: s.value, label: s.label })) || [] 
          });
          break;
        case 'Footer':
          setFooterConfig({
            logo: config.logo || '',
            description: config.description || '',
            columns: config.columns?.map((c: { title: string; links: { label: string; url: string }[] }, i: number) => ({
              id: i + 1,
              title: c.title,
              links: c.links || []
            })) || [],
            socialLinks: config.socialLinks?.map((s: { platform: string; url: string; icon: string }, i: number) => ({
              id: i + 1,
              platform: s.platform,
              url: s.url,
              icon: s.icon
            })) || [],
            copyright: config.copyright || '',
            showSocialLinks: config.showSocialLinks ?? true
          });
          setFooterStyle((config.style as FooterStyle) || 'classic');
          break;
        case 'Services':
          setServicesItems(config.items?.map((item: {icon: string, title: string, description: string}, i: number) => ({ id: i, icon: item.icon, title: item.title, description: item.description })) || []);
          setServicesStyle((config.style as ServicesStyle) || 'elegantGrid');
          break;
        case 'Benefits':
          setServicesItems(config.items?.map((item: {icon: string, title: string, description: string}, i: number) => ({ id: i, icon: item.icon, title: item.title, description: item.description })) || []);
          setBenefitsStyle((config.style as BenefitsStyle) || 'cards');
          break;
        case 'Testimonials':
          setTestimonialsItems(config.items?.map((item: {name: string, role: string, content: string, avatar: string, rating: number}, i: number) => ({ id: i, ...item })) || []);
          setTestimonialsStyle((config.style as TestimonialsStyle) || 'cards');
          break;
        case 'Pricing':
          setPricingPlans(config.plans?.map((p: {name: string, price: string, period: string, features: string[], isPopular: boolean, buttonText: string, buttonLink: string}, i: number) => ({ id: i, ...p })) || []);
          setPricingStyle((config.style as PricingStyle) || 'cards');
          break;
        case 'CaseStudy':
          setCaseStudyProjects(config.projects?.map((p: {title: string, category: string, image: string, description: string, link: string}, i: number) => ({ id: i, ...p })) || []);
          setCaseStudyStyle((config.style as CaseStudyStyle) || 'grid');
          break;
        case 'Career':
          setCareerJobs(config.jobs?.map((j: {title: string, department: string, location: string, type: string, salary: string, description: string}, i: number) => ({ id: i, ...j })) || []);
          setCareerStyle((config.style as CareerStyle) || 'cards');
          break;
        case 'Contact':
          setContactConfig({ address: config.address || '', phone: config.phone || '', email: config.email || '', workingHours: config.workingHours || '', showMap: config.showMap ?? true, mapEmbed: config.mapEmbed || '' });
          setContactStyle((config.style as ContactStyle) || 'modern');
          break;
        case 'ProductList':
          setProductListConfig({ itemCount: config.itemCount || 8, sortBy: config.sortBy || 'newest' });
          setProductListStyle((config.style as ProductListStyle) || 'commerce');
          setProductSelectionMode(config.selectionMode || 'auto');
          setSelectedProductIds(config.selectedProductIds || []);
          break;
        case 'ServiceList':
          setProductListConfig({ itemCount: config.itemCount || 8, sortBy: config.sortBy || 'newest' });
          setServiceListStyle((config.style as ServiceListStyle) || 'grid');
          setServiceSelectionMode(config.selectionMode || 'auto');
          setSelectedServiceIds(config.selectedServiceIds || []);
          break;
        case 'Blog':
          setProductListConfig({ itemCount: config.itemCount || 8, sortBy: config.sortBy || 'newest' });
          setBlogStyle((config.style as BlogStyle) || 'grid');
          setBlogSelectionMode(config.selectionMode || 'auto');
          setSelectedPostIds(config.selectedPostIds || []);
          break;
        case 'SpeedDial':
          setSpeedDialActions(config.actions?.map((a: {icon: string, label: string, url: string, bgColor: string}, i: number) => ({ id: i, ...a })) || [{ id: 1, icon: 'phone', label: 'Gọi ngay', url: '', bgColor: '#22c55e' }]);
          setSpeedDialStyle((config.style as SpeedDialStyle) || 'fab');
          setSpeedDialPosition(config.position || 'bottom-right');
          setSpeedDialAlwaysOpen(config.alwaysOpen ?? true);
          break;
        case 'ProductCategories':
          setProductCategoriesItems(config.categories?.map((c: {categoryId: string, customImage?: string, imageMode?: string}, i: number) => ({ id: i, categoryId: c.categoryId, customImage: c.customImage || '', imageMode: (c.imageMode as 'default' | 'icon' | 'upload' | 'url') || 'default' })) || []);
          setProductCategoriesStyle((config.style as ProductCategoriesStyle) || 'grid');
          setProductCategoriesShowCount(config.showProductCount ?? true);
          setProductCategoriesColsDesktop(config.columnsDesktop || 4);
          setProductCategoriesColsMobile(config.columnsMobile || 2);
          break;
        case 'CategoryProducts':
          setCategoryProductsSections(config.sections?.map((s: {categoryId: string, itemCount: number}, i: number) => ({ id: i, categoryId: s.categoryId, itemCount: s.itemCount || 4 })) || []);
          setCategoryProductsStyle((config.style as CategoryProductsStyle) || 'grid');
          setCategoryProductsShowViewAll(config.showViewAll ?? true);
          setCategoryProductsColsDesktop(config.columnsDesktop || 4);
          setCategoryProductsColsMobile(config.columnsMobile || 2);
          break;
        case 'Team':
          setTeamMembers(config.members?.map((m: {name: string, role: string, avatar: string, bio: string, facebook?: string, linkedin?: string, twitter?: string, email?: string}, i: number) => ({ 
            id: i, 
            name: m.name || '', 
            role: m.role || '', 
            avatar: m.avatar || '', 
            bio: m.bio || '', 
            facebook: m.facebook || '', 
            linkedin: m.linkedin || '', 
            twitter: m.twitter || '', 
            email: m.email || '' 
          })) || []);
          setTeamStyle((config.style as TeamStyle) || 'grid');
          break;
      }
      
      setIsInitialized(true);
    }
  }, [component, isInitialized, brandColor]);

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
        return { slides: heroSlides.map(s => ({ image: s.url, link: s.link })), style: heroStyle };
      case 'Gallery':
      case 'Partners':
        return { items: galleryItems.map(g => ({ url: g.url, link: g.link, name: g.name })), style: galleryStyle };
      case 'TrustBadges':
        return { items: galleryItems.map(g => ({ url: g.url, link: g.link, name: g.name })), style: trustBadgesStyle };
      case 'Stats':
        return { items: statsItems.map(s => ({ value: s.value, label: s.label })), style: statsStyle };
      case 'CTA':
        return { ...ctaConfig, style: ctaStyle };
      case 'FAQ':
        return { items: faqItems.map(f => ({ question: f.question, answer: f.answer })), style: faqStyle };
      case 'About':
        return aboutConfig;
      case 'Footer':
        return {
          logo: footerConfig.logo,
          description: footerConfig.description,
          columns: footerConfig.columns.map(c => ({ title: c.title, links: c.links })),
          socialLinks: footerConfig.socialLinks.map(s => ({ platform: s.platform, url: s.url, icon: s.icon })),
          copyright: footerConfig.copyright,
          showSocialLinks: footerConfig.showSocialLinks,
          style: footerStyle
        };
      case 'Services':
        return { items: servicesItems.map(s => ({ icon: s.icon, title: s.title, description: s.description })), style: servicesStyle };
      case 'Benefits':
        return { items: servicesItems.map(s => ({ icon: s.icon, title: s.title, description: s.description })), style: benefitsStyle };
      case 'Testimonials':
        return { items: testimonialsItems.map(t => ({ name: t.name, role: t.role, content: t.content, avatar: t.avatar, rating: t.rating })), style: testimonialsStyle };
      case 'Pricing':
        return { plans: pricingPlans.map(p => ({ name: p.name, price: p.price, period: p.period, features: p.features, isPopular: p.isPopular, buttonText: p.buttonText, buttonLink: p.buttonLink })), style: pricingStyle };
      case 'CaseStudy':
        return { projects: caseStudyProjects.map(p => ({ title: p.title, category: p.category, image: p.image, description: p.description, link: p.link })), style: caseStudyStyle };
      case 'Career':
        return { jobs: careerJobs.map(j => ({ title: j.title, department: j.department, location: j.location, type: j.type, salary: j.salary, description: j.description })), style: careerStyle };
      case 'Contact':
        return { ...contactConfig, style: contactStyle };
      case 'ProductList':
        return { 
          ...productListConfig, 
          style: productListStyle, 
          selectionMode: productSelectionMode,
          selectedProductIds: productSelectionMode === 'manual' ? selectedProductIds : [],
        };
      case 'ServiceList':
        return { 
          ...productListConfig, 
          style: serviceListStyle, 
          selectionMode: serviceSelectionMode,
          selectedServiceIds: serviceSelectionMode === 'manual' ? selectedServiceIds : [],
        };
      case 'Blog':
        return { 
          ...productListConfig, 
          style: blogStyle, 
          selectionMode: blogSelectionMode,
          selectedPostIds: blogSelectionMode === 'manual' ? selectedPostIds : [],
        };
      case 'SpeedDial':
        return {
          actions: speedDialActions.map(a => ({ icon: a.icon, label: a.label, url: a.url, bgColor: a.bgColor })),
          style: speedDialStyle,
          position: speedDialPosition,
          alwaysOpen: speedDialAlwaysOpen,
          mainButtonColor: brandColor,
        };
      case 'ProductCategories':
        return {
          categories: productCategoriesItems.map(c => ({ categoryId: c.categoryId, customImage: c.customImage || undefined, imageMode: c.imageMode || 'default' })),
          style: productCategoriesStyle,
          showProductCount: productCategoriesShowCount,
          columnsDesktop: productCategoriesColsDesktop,
          columnsMobile: productCategoriesColsMobile,
        };
      case 'CategoryProducts':
        return {
          sections: categoryProductsSections.map(s => ({ categoryId: s.categoryId, itemCount: s.itemCount })),
          style: categoryProductsStyle,
          showViewAll: categoryProductsShowViewAll,
          columnsDesktop: categoryProductsColsDesktop,
          columnsMobile: categoryProductsColsMobile,
        };
      case 'Team':
        return {
          members: teamMembers.map(m => ({ 
            name: m.name, 
            role: m.role, 
            avatar: m.avatar, 
            bio: m.bio, 
            facebook: m.facebook, 
            linkedin: m.linkedin, 
            twitter: m.twitter, 
            email: m.email 
          })),
          style: teamStyle,
        };
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
          <>
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
            <HeroBannerPreview 
              slides={heroSlides.map((s, idx) => ({ id: idx + 1, image: s.url, link: s.link }))} 
              brandColor={brandColor}
              selectedStyle={heroStyle}
              onStyleChange={setHeroStyle}
            />
          </>
        )}

        {/* Gallery / Partners / TrustBadges */}
        {(component.type === 'Gallery' || component.type === 'Partners' || component.type === 'TrustBadges') && (
          <>
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
                  extraFields={
                    component.type === 'Partners' 
                      ? [{ key: 'link', placeholder: 'Link website đối tác', type: 'url' }] 
                      : component.type === 'TrustBadges'
                      ? [{ key: 'name', placeholder: 'Tên chứng nhận/bằng cấp', type: 'text' }]
                      : []
                  }
                  minItems={1}
                  maxItems={20}
                  aspectRatio={component.type === 'Partners' ? 'video' : component.type === 'Gallery' ? 'video' : 'square'}
                  columns={component.type === 'Gallery' ? 2 : component.type === 'TrustBadges' ? 3 : 4}
                  showReorder={true}
                  addButtonText={component.type === 'Partners' ? 'Thêm logo' : component.type === 'TrustBadges' ? 'Thêm chứng nhận' : 'Thêm ảnh'}
                  layout={component.type === 'Gallery' ? 'vertical' : component.type === 'TrustBadges' ? 'vertical' : 'horizontal'}
                />
              </CardContent>
            </Card>
            {component.type === 'TrustBadges' ? (
              <TrustBadgesPreview 
                items={galleryItems.map((g, idx) => ({ id: idx + 1, url: g.url, link: g.link, name: g.name }))} 
                brandColor={brandColor}
                selectedStyle={trustBadgesStyle}
                onStyleChange={setTrustBadgesStyle}
              />
            ) : (
              <GalleryPreview 
                items={galleryItems.map((g, idx) => ({ id: idx + 1, url: g.url, link: g.link }))} 
                brandColor={brandColor}
                componentType={component.type as 'Gallery' | 'Partners'}
                selectedStyle={galleryStyle}
                onStyleChange={setGalleryStyle}
              />
            )}
          </>
        )}

        {/* Stats */}
        {component.type === 'Stats' && (
          <>
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
            <StatsPreview 
              items={statsItems.map(s => ({ value: s.value, label: s.label }))} 
              brandColor={brandColor}
              selectedStyle={statsStyle}
              onStyleChange={setStatsStyle}
            />
          </>
        )}

        {/* CTA */}
        {component.type === 'CTA' && (
          <>
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
            <CTAPreview 
              config={ctaConfig} 
              brandColor={brandColor}
              selectedStyle={ctaStyle}
              onStyleChange={setCtaStyle}
            />
          </>
        )}

        {/* FAQ */}
        {component.type === 'FAQ' && (
          <>
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
            <FaqPreview 
              items={faqItems} 
              brandColor={brandColor}
              selectedStyle={faqStyle}
              onStyleChange={setFaqStyle}
            />
          </>
        )}

        {/* Footer */}
        {component.type === 'Footer' && (
          <>
            {/* Load from Settings Button */}
            <div className="mb-4 flex justify-end">
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  const newSocialLinks: { id: number; platform: string; url: string; icon: string }[] = [];
                  let idCounter = 1;
                  if (socialFacebook?.value) {
                    newSocialLinks.push({ id: idCounter++, platform: 'facebook', url: socialFacebook.value as string, icon: 'facebook' });
                  }
                  if (socialInstagram?.value) {
                    newSocialLinks.push({ id: idCounter++, platform: 'instagram', url: socialInstagram.value as string, icon: 'instagram' });
                  }
                  if (socialYoutube?.value) {
                    newSocialLinks.push({ id: idCounter++, platform: 'youtube', url: socialYoutube.value as string, icon: 'youtube' });
                  }
                  if (socialTiktok?.value) {
                    newSocialLinks.push({ id: idCounter++, platform: 'tiktok', url: socialTiktok.value as string, icon: 'tiktok' });
                  }
                  if (socialZalo?.value) {
                    newSocialLinks.push({ id: idCounter++, platform: 'zalo', url: socialZalo.value as string, icon: 'zalo' });
                  }
                  setFooterConfig(prev => ({
                    ...prev,
                    logo: (siteLogo?.value as string) || prev.logo,
                    socialLinks: newSocialLinks.length > 0 ? newSocialLinks : prev.socialLinks,
                  }));
                  toast.success('Đã load dữ liệu từ Settings');
                }}
              >
                <Download size={14} className="mr-1" /> Load từ Settings
              </Button>
            </div>

            {/* Logo & Basic Info */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-base">Thông tin cơ bản</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ImageFieldWithUpload
                  label="Logo"
                  value={footerConfig.logo}
                  onChange={(url) => setFooterConfig({...footerConfig, logo: url})}
                  folder="footer"
                  aspectRatio="square"
                  quality={0.9}
                  placeholder="https://example.com/logo.png"
                />
                <div className="space-y-2">
                  <Label>Mô tả công ty</Label>
                  <textarea 
                    value={footerConfig.description} 
                    onChange={(e) => setFooterConfig({...footerConfig, description: e.target.value})} 
                    placeholder="Công ty TNHH ABC - Đối tác tin cậy của bạn"
                    className="w-full min-h-[60px] rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm" 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Copyright</Label>
                  <Input 
                    value={footerConfig.copyright} 
                    onChange={(e) => setFooterConfig({...footerConfig, copyright: e.target.value})} 
                    placeholder="© 2024 Company. All rights reserved." 
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    checked={footerConfig.showSocialLinks} 
                    onChange={(e) => setFooterConfig({...footerConfig, showSocialLinks: e.target.checked})} 
                    className="w-4 h-4 rounded" 
                  />
                  <Label>Hiển thị social links</Label>
                </div>
              </CardContent>
            </Card>

            {/* Menu Columns */}
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Cột menu ({footerConfig.columns.length})</CardTitle>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      const newId = Math.max(0, ...footerConfig.columns.map(c => c.id), 0) + 1;
                      setFooterConfig({
                        ...footerConfig,
                        columns: [...footerConfig.columns, { id: newId, title: `Cột ${newId}`, links: [{ label: 'Link mới', url: '#' }] }]
                      });
                    }}
                    disabled={footerConfig.columns.length >= 4}
                  >
                    <Plus size={14} className="mr-1" /> Thêm cột
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {footerConfig.columns.length === 0 ? (
                  <div className="text-center py-6 text-slate-500 text-sm">
                    Chưa có cột menu nào. Nhấn "Thêm cột" để bắt đầu.
                  </div>
                ) : (
                  footerConfig.columns.map((column) => (
                    <div key={column.id} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 space-y-3">
                      <div className="flex items-center gap-3">
                        <Input
                          value={column.title}
                          onChange={(e) => setFooterConfig({
                            ...footerConfig,
                            columns: footerConfig.columns.map(c => c.id === column.id ? { ...c, title: e.target.value } : c)
                          })}
                          placeholder="Tiêu đề cột"
                          className="flex-1"
                        />
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setFooterConfig({
                            ...footerConfig,
                            columns: footerConfig.columns.filter(c => c.id !== column.id)
                          })}
                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                      
                      {/* Links */}
                      <div className="pl-4 space-y-2">
                        <Label className="text-xs text-slate-500">Links ({column.links.length})</Label>
                        {column.links.map((link, linkIdx) => (
                          <div key={linkIdx} className="flex items-center gap-2">
                            <Input
                              value={link.label}
                              onChange={(e) => setFooterConfig({
                                ...footerConfig,
                                columns: footerConfig.columns.map(c => 
                                  c.id === column.id ? { 
                                    ...c, 
                                    links: c.links.map((l, idx) => idx === linkIdx ? { ...l, label: e.target.value } : l)
                                  } : c
                                )
                              })}
                              placeholder="Tên link"
                              className="flex-1"
                            />
                            <Input
                              value={link.url}
                              onChange={(e) => setFooterConfig({
                                ...footerConfig,
                                columns: footerConfig.columns.map(c => 
                                  c.id === column.id ? { 
                                    ...c, 
                                    links: c.links.map((l, idx) => idx === linkIdx ? { ...l, url: e.target.value } : l)
                                  } : c
                                )
                              })}
                              placeholder="/url"
                              className="flex-1"
                            />
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => setFooterConfig({
                                ...footerConfig,
                                columns: footerConfig.columns.map(c => 
                                  c.id === column.id ? { ...c, links: c.links.filter((_, idx) => idx !== linkIdx) } : c
                                )
                              })}
                              className="text-red-500 hover:text-red-600 hover:bg-red-50 flex-shrink-0"
                              disabled={column.links.length <= 1}
                            >
                              <Trash2 size={12} />
                            </Button>
                          </div>
                        ))}
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setFooterConfig({
                            ...footerConfig,
                            columns: footerConfig.columns.map(c => 
                              c.id === column.id ? { ...c, links: [...c.links, { label: 'Link mới', url: '#' }] } : c
                            )
                          })}
                          className="text-slate-500 hover:text-slate-700"
                        >
                          <Plus size={12} className="mr-1" /> Thêm link
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Social Links */}
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Mạng xã hội ({footerConfig.socialLinks.length})</CardTitle>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      const platforms = ['facebook', 'instagram', 'youtube', 'tiktok', 'zalo'];
                      const usedPlatforms = footerConfig.socialLinks.map(s => s.platform);
                      const availablePlatform = platforms.find(p => !usedPlatforms.includes(p));
                      if (!availablePlatform) return;
                      const newId = Math.max(0, ...footerConfig.socialLinks.map(s => s.id), 0) + 1;
                      setFooterConfig({
                        ...footerConfig,
                        socialLinks: [...footerConfig.socialLinks, { id: newId, platform: availablePlatform, url: '', icon: availablePlatform }]
                      });
                    }}
                    disabled={footerConfig.socialLinks.length >= 5}
                  >
                    <Plus size={14} className="mr-1" /> Thêm MXH
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {footerConfig.socialLinks.length === 0 ? (
                  <div className="text-center py-6 text-slate-500 text-sm">
                    Chưa có mạng xã hội nào. Nhấn "Thêm MXH" để bắt đầu.
                  </div>
                ) : (
                  footerConfig.socialLinks.map((social) => (
                    <div key={social.id} className="flex items-center gap-3">
                      <select
                        value={social.platform}
                        onChange={(e) => setFooterConfig({
                          ...footerConfig,
                          socialLinks: footerConfig.socialLinks.map(s => 
                            s.id === social.id ? { ...s, platform: e.target.value, icon: e.target.value } : s
                          )
                        })}
                        className="w-36 h-9 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm"
                      >
                        {[
                          { key: 'facebook', label: 'Facebook' },
                          { key: 'instagram', label: 'Instagram' },
                          { key: 'youtube', label: 'Youtube' },
                          { key: 'tiktok', label: 'TikTok' },
                          { key: 'zalo', label: 'Zalo' },
                        ].map(p => (
                          <option 
                            key={p.key} 
                            value={p.key}
                            disabled={footerConfig.socialLinks.some(s => s.platform === p.key && s.id !== social.id)}
                          >
                            {p.label}
                          </option>
                        ))}
                      </select>
                      <Input
                        value={social.url}
                        onChange={(e) => setFooterConfig({
                          ...footerConfig,
                          socialLinks: footerConfig.socialLinks.map(s => 
                            s.id === social.id ? { ...s, url: e.target.value } : s
                          )
                        })}
                        placeholder="https://facebook.com/yourpage"
                        className="flex-1"
                      />
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setFooterConfig({
                          ...footerConfig,
                          socialLinks: footerConfig.socialLinks.filter(s => s.id !== social.id)
                        })}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 flex-shrink-0"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <FooterPreview 
              config={footerConfig} 
              brandColor={brandColor}
              selectedStyle={footerStyle}
              onStyleChange={setFooterStyle}
            />
          </>
        )}

        {/* Services */}
        {component.type === 'Services' && (
          <>
            <Card className="mb-6">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Dịch vụ</CardTitle>
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
            <ServicesPreview 
              items={servicesItems} 
              brandColor={brandColor}
              componentType="Services"
              selectedStyle={servicesStyle}
              onStyleChange={setServicesStyle}
            />
          </>
        )}

        {/* Benefits */}
        {component.type === 'Benefits' && (
          <>
            <Card className="mb-6">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Lợi ích</CardTitle>
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
            <BenefitsPreview 
              items={servicesItems} 
              brandColor={brandColor}
              selectedStyle={benefitsStyle}
              onStyleChange={setBenefitsStyle}
            />
          </>
        )}

        {/* Testimonials */}
        {component.type === 'Testimonials' && (
          <>
            <Card className="mb-6">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Đánh giá khách hàng</CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={() => setTestimonialsItems([...testimonialsItems, { id: Date.now(), name: '', role: '', content: '', avatar: '', rating: 5 }])} className="gap-2"><Plus size={14} /> Thêm</Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {testimonialsItems.map((item, idx) => (
                  <div key={item.id} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Đánh giá {idx + 1}</Label>
                      <Button type="button" variant="ghost" size="icon" className="text-red-500 h-8 w-8" onClick={() => testimonialsItems.length > 1 && setTestimonialsItems(testimonialsItems.filter(t => t.id !== item.id))}><Trash2 size={14} /></Button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Input placeholder="Tên khách hàng" value={item.name} onChange={(e) => setTestimonialsItems(testimonialsItems.map(t => t.id === item.id ? {...t, name: e.target.value} : t))} />
                      <Input placeholder="Chức vụ / Công ty" value={item.role} onChange={(e) => setTestimonialsItems(testimonialsItems.map(t => t.id === item.id ? {...t, role: e.target.value} : t))} />
                    </div>
                    <textarea 
                      placeholder="Nội dung đánh giá..." 
                      value={item.content} 
                      onChange={(e) => setTestimonialsItems(testimonialsItems.map(t => t.id === item.id ? {...t, content: e.target.value} : t))}
                      className="w-full min-h-[60px] rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm" 
                    />
                    <div className="flex items-center gap-2">
                      <Label className="text-sm">Đánh giá:</Label>
                      {[1,2,3,4,5].map(star => (
                        <Star 
                          key={star} 
                          size={20} 
                          className={cn("cursor-pointer", star <= item.rating ? "text-yellow-400 fill-yellow-400" : "text-slate-300")}
                          onClick={() => setTestimonialsItems(testimonialsItems.map(t => t.id === item.id ? {...t, rating: star} : t))} 
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
            <TestimonialsPreview 
              items={testimonialsItems} 
              brandColor={brandColor}
              selectedStyle={testimonialsStyle}
              onStyleChange={setTestimonialsStyle}
            />
          </>
        )}

        {/* Pricing */}
        {component.type === 'Pricing' && (
          <>
            <Card className="mb-6">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Các gói dịch vụ</CardTitle>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setPricingPlans([...pricingPlans, { id: Date.now(), name: '', price: '', period: '/tháng', features: [], isPopular: false, buttonText: 'Chọn gói', buttonLink: '' }])} 
                  className="gap-2"
                >
                  <Plus size={14} /> Thêm gói
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {pricingPlans.map((plan, idx) => (
                  <div key={plan.id} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Gói {idx + 1}</Label>
                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-2 text-sm">
                          <input 
                            type="checkbox" 
                            checked={plan.isPopular} 
                            onChange={(e) => setPricingPlans(pricingPlans.map(p => p.id === plan.id ? {...p, isPopular: e.target.checked} : p))} 
                            className="w-4 h-4 rounded" 
                          />
                          Nổi bật
                        </label>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          className="text-red-500 h-8 w-8" 
                          onClick={() => pricingPlans.length > 1 && setPricingPlans(pricingPlans.filter(p => p.id !== plan.id))}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Input 
                        placeholder="Tên gói" 
                        value={plan.name} 
                        onChange={(e) => setPricingPlans(pricingPlans.map(p => p.id === plan.id ? {...p, name: e.target.value} : p))} 
                      />
                      <Input 
                        placeholder="Giá (VD: 299.000)" 
                        value={plan.price} 
                        onChange={(e) => setPricingPlans(pricingPlans.map(p => p.id === plan.id ? {...p, price: e.target.value} : p))} 
                      />
                    </div>
                    <Input 
                      placeholder="Tính năng (phân cách bởi dấu phẩy)" 
                      value={plan.features.join(', ')} 
                      onChange={(e) => setPricingPlans(pricingPlans.map(p => p.id === plan.id ? {...p, features: e.target.value.split(', ').filter(Boolean)} : p))} 
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <Input 
                        placeholder="Text nút bấm" 
                        value={plan.buttonText} 
                        onChange={(e) => setPricingPlans(pricingPlans.map(p => p.id === plan.id ? {...p, buttonText: e.target.value} : p))} 
                      />
                      <Input 
                        placeholder="Liên kết" 
                        value={plan.buttonLink} 
                        onChange={(e) => setPricingPlans(pricingPlans.map(p => p.id === plan.id ? {...p, buttonLink: e.target.value} : p))} 
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
            <PricingPreview 
              plans={pricingPlans} 
              brandColor={brandColor}
              selectedStyle={pricingStyle}
              onStyleChange={setPricingStyle}
            />
          </>
        )}

        {/* Contact */}
        {component.type === 'Contact' && (
          <>
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
                {contactConfig.showMap && (
                  <div className="space-y-2">
                    <Label>Google Maps Embed URL</Label>
                    <Input value={contactConfig.mapEmbed} onChange={(e) => setContactConfig({...contactConfig, mapEmbed: e.target.value})} placeholder="https://www.google.com/maps/embed?pb=..." />
                    <p className="text-xs text-muted-foreground">Lấy từ Google Maps: Chia sẻ → Nhúng bản đồ → Copy URL trong src của iframe</p>
                  </div>
                )}
              </CardContent>
            </Card>
            <ContactPreview 
              config={{ ...contactConfig, formFields: [], socialLinks: [] }} 
              brandColor={brandColor}
              selectedStyle={contactStyle}
              onStyleChange={setContactStyle}
            />
          </>
        )}

        {/* About */}
        {component.type === 'About' && (
          <>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-base">Cấu hình Về chúng tôi</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tiêu đề nhỏ (Sub-heading)</Label>
                    <Input 
                      value={aboutConfig.subHeading} 
                      onChange={(e) => setAboutConfig({...aboutConfig, subHeading: e.target.value})} 
                      placeholder="Về chúng tôi" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tiêu đề chính (Heading)</Label>
                    <Input 
                      value={aboutConfig.heading} 
                      onChange={(e) => setAboutConfig({...aboutConfig, heading: e.target.value})} 
                      placeholder="Mang đến giá trị thực" 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Mô tả</Label>
                  <textarea 
                    value={aboutConfig.description} 
                    onChange={(e) => setAboutConfig({...aboutConfig, description: e.target.value})} 
                    placeholder="Mô tả về công ty..."
                    className="w-full min-h-[100px] rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm" 
                  />
                </div>
                <ImageFieldWithUpload
                  label="Hình ảnh"
                  value={aboutConfig.image}
                  onChange={(url) => setAboutConfig({...aboutConfig, image: url})}
                  folder="home-components"
                  aspectRatio="video"
                  quality={0.85}
                  placeholder="https://example.com/about-image.jpg"
                />
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Text nút bấm</Label>
                    <Input 
                      value={aboutConfig.buttonText} 
                      onChange={(e) => setAboutConfig({...aboutConfig, buttonText: e.target.value})} 
                      placeholder="Xem thêm" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Liên kết</Label>
                    <Input 
                      value={aboutConfig.buttonLink} 
                      onChange={(e) => setAboutConfig({...aboutConfig, buttonLink: e.target.value})} 
                      placeholder="/about" 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Số liệu nổi bật</Label>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setAboutConfig({...aboutConfig, stats: [...aboutConfig.stats, { id: Date.now(), value: '', label: '' }]})} 
                      className="gap-2"
                    >
                      <Plus size={14} /> Thêm
                    </Button>
                  </div>
                  {aboutConfig.stats.map((stat) => (
                    <div key={stat.id} className="flex gap-3 items-center">
                      <Input 
                        placeholder="Số liệu" 
                        value={stat.value} 
                        onChange={(e) => setAboutConfig({...aboutConfig, stats: aboutConfig.stats.map(s => s.id === stat.id ? {...s, value: e.target.value} : s)})} 
                        className="flex-1" 
                      />
                      <Input 
                        placeholder="Nhãn" 
                        value={stat.label} 
                        onChange={(e) => setAboutConfig({...aboutConfig, stats: aboutConfig.stats.map(s => s.id === stat.id ? {...s, label: e.target.value} : s)})} 
                        className="flex-1" 
                      />
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        className="text-red-500 h-8 w-8" 
                        onClick={() => aboutConfig.stats.length > 1 && setAboutConfig({...aboutConfig, stats: aboutConfig.stats.filter(s => s.id !== stat.id)})}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <AboutPreview 
              config={aboutConfig} 
              brandColor={brandColor}
              selectedStyle={aboutConfig.style}
              onStyleChange={(style) => setAboutConfig({...aboutConfig, style})}
            />
          </>
        )}

        {/* ProductList */}
        {component.type === 'ProductList' && (
          <>
            <Card className="mb-6">
              <CardHeader><CardTitle className="text-base">Nguồn dữ liệu</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {/* Selection Mode Toggle */}
                <div className="space-y-2">
                  <Label>Chế độ chọn sản phẩm</Label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setProductSelectionMode('auto')}
                      className={cn(
                        "flex-1 py-2.5 px-4 rounded-lg border text-sm font-medium transition-all",
                        productSelectionMode === 'auto'
                          ? "border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400"
                          : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                      )}
                    >
                      Tự động
                    </button>
                    <button
                      type="button"
                      onClick={() => setProductSelectionMode('manual')}
                      className={cn(
                        "flex-1 py-2.5 px-4 rounded-lg border text-sm font-medium transition-all",
                        productSelectionMode === 'manual'
                          ? "border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400"
                          : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                      )}
                    >
                      Chọn thủ công
                    </button>
                  </div>
                  <p className="text-xs text-slate-500">
                    {productSelectionMode === 'auto' 
                      ? 'Hiển thị sản phẩm tự động theo số lượng và sắp xếp' 
                      : 'Chọn từng sản phẩm cụ thể để hiển thị'}
                  </p>
                </div>

                {/* Auto mode settings */}
                {productSelectionMode === 'auto' && (
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
                )}

                {/* Manual mode - Product selector */}
                {productSelectionMode === 'manual' && (
                  <div className="space-y-4">
                    {/* Selected products list */}
                    {selectedProducts.length > 0 && (
                      <div className="space-y-2">
                        <Label>Sản phẩm đã chọn ({selectedProducts.length})</Label>
                        <div className="space-y-2 max-h-[300px] overflow-y-auto">
                          {selectedProducts.map((product, index) => (
                            <div 
                              key={product._id} 
                              className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg group"
                            >
                              <div className="text-slate-400 cursor-move">
                                <GripVertical size={16} />
                              </div>
                              <span className="w-6 h-6 flex items-center justify-center bg-blue-500 text-white text-xs rounded-full font-medium">
                                {index + 1}
                              </span>
                              {product.image ? (
                                <img src={product.image} alt="" className="w-12 h-12 object-cover rounded" />
                              ) : (
                                <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded flex items-center justify-center">
                                  <Package size={16} className="text-slate-400" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">{product.name}</p>
                                <p className="text-xs text-slate-500">{product.price?.toLocaleString('vi-VN')}đ</p>
                              </div>
                              <Button 
                                type="button" 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-slate-400 hover:text-red-500"
                                onClick={() => setSelectedProductIds(ids => ids.filter(id => id !== product._id))}
                              >
                                <X size={16} />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Search and add products */}
                    <div className="space-y-2">
                      <Label>Thêm sản phẩm</Label>
                      <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <Input 
                          placeholder="Tìm kiếm sản phẩm..." 
                          className="pl-9"
                          value={productSearchTerm}
                          onChange={(e) => setProductSearchTerm(e.target.value)}
                        />
                      </div>
                      <div className="border border-slate-200 dark:border-slate-700 rounded-lg max-h-[250px] overflow-y-auto">
                        {filteredProducts.length === 0 ? (
                          <div className="p-4 text-center text-sm text-slate-500">
                            {productsData === undefined ? 'Đang tải...' : 'Không tìm thấy sản phẩm'}
                          </div>
                        ) : (
                          filteredProducts.map(product => {
                            const isSelected = selectedProductIds.includes(product._id);
                            return (
                              <div 
                                key={product._id}
                                onClick={() => {
                                  if (isSelected) {
                                    setSelectedProductIds(ids => ids.filter(id => id !== product._id));
                                  } else {
                                    setSelectedProductIds(ids => [...ids, product._id]);
                                  }
                                }}
                                className={cn(
                                  "flex items-center gap-3 p-3 cursor-pointer border-b border-slate-100 dark:border-slate-800 last:border-0 transition-colors",
                                  isSelected 
                                    ? "bg-blue-50 dark:bg-blue-500/10" 
                                    : "hover:bg-slate-50 dark:hover:bg-slate-800"
                                )}
                              >
                                <div className={cn(
                                  "w-5 h-5 rounded border-2 flex items-center justify-center transition-colors",
                                  isSelected 
                                    ? "border-blue-500 bg-blue-500" 
                                    : "border-slate-300 dark:border-slate-600"
                                )}>
                                  {isSelected && <Check size={12} className="text-white" />}
                                </div>
                                {product.image ? (
                                  <img src={product.image} alt="" className="w-10 h-10 object-cover rounded" />
                                ) : (
                                  <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded flex items-center justify-center">
                                    <Package size={14} className="text-slate-400" />
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">{product.name}</p>
                                  <p className="text-xs text-slate-500">{product.price?.toLocaleString('vi-VN')}đ</p>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            <ProductListPreview 
              brandColor={brandColor}
              itemCount={productSelectionMode === 'manual' ? selectedProductIds.length : productListConfig.itemCount}
              componentType="ProductList"
              selectedStyle={productListStyle}
              onStyleChange={setProductListStyle}
              items={productSelectionMode === 'manual' && selectedProducts.length > 0 
                ? selectedProducts.map(p => ({ id: p._id, name: p.name, image: p.image, price: p.price?.toLocaleString('vi-VN') + 'đ', description: p.description }))
                : filteredProducts.slice(0, productListConfig.itemCount).map(p => ({ id: p._id, name: p.name, image: p.image, price: p.price?.toLocaleString('vi-VN') + 'đ', description: p.description }))
              }
            />
          </>
        )}

        {/* ServiceList */}
        {component.type === 'ServiceList' && (
          <>
            <Card className="mb-6">
              <CardHeader><CardTitle className="text-base">Nguồn dữ liệu</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {/* Selection Mode Toggle */}
                <div className="space-y-2">
                  <Label>Chế độ chọn dịch vụ</Label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setServiceSelectionMode('auto')}
                      className={cn(
                        "flex-1 py-2.5 px-4 rounded-lg border text-sm font-medium transition-all",
                        serviceSelectionMode === 'auto'
                          ? "border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400"
                          : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                      )}
                    >
                      Tự động
                    </button>
                    <button
                      type="button"
                      onClick={() => setServiceSelectionMode('manual')}
                      className={cn(
                        "flex-1 py-2.5 px-4 rounded-lg border text-sm font-medium transition-all",
                        serviceSelectionMode === 'manual'
                          ? "border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400"
                          : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                      )}
                    >
                      Chọn thủ công
                    </button>
                  </div>
                  <p className="text-xs text-slate-500">
                    {serviceSelectionMode === 'auto' 
                      ? 'Hiển thị dịch vụ tự động theo số lượng và sắp xếp' 
                      : 'Chọn từng dịch vụ cụ thể để hiển thị'}
                  </p>
                </div>

                {/* Auto mode settings */}
                {serviceSelectionMode === 'auto' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Số lượng hiển thị</Label>
                      <Input type="number" value={productListConfig.itemCount} onChange={(e) => setProductListConfig({...productListConfig, itemCount: parseInt(e.target.value) || 8})} />
                    </div>
                    <div className="space-y-2">
                      <Label>Sắp xếp theo</Label>
                      <select className="w-full h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm" value={productListConfig.sortBy} onChange={(e) => setProductListConfig({...productListConfig, sortBy: e.target.value})}>
                        <option value="newest">Mới nhất</option>
                        <option value="popular">Xem nhiều nhất</option>
                        <option value="random">Ngẫu nhiên</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Manual mode - Service selector */}
                {serviceSelectionMode === 'manual' && (
                  <div className="space-y-4">
                    {/* Selected services list */}
                    {selectedServices.length > 0 && (
                      <div className="space-y-2">
                        <Label>Dịch vụ đã chọn ({selectedServices.length})</Label>
                        <div className="space-y-2 max-h-[300px] overflow-y-auto">
                          {selectedServices.map((service, index) => (
                            <div 
                              key={service._id} 
                              className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg group"
                            >
                              <div className="text-slate-400 cursor-move">
                                <GripVertical size={16} />
                              </div>
                              <span className="w-6 h-6 flex items-center justify-center bg-blue-500 text-white text-xs rounded-full font-medium">
                                {index + 1}
                              </span>
                              {service.thumbnail ? (
                                <img src={service.thumbnail} alt="" className="w-12 h-12 object-cover rounded" />
                              ) : (
                                <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded flex items-center justify-center">
                                  <Briefcase size={16} className="text-slate-400" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">{service.title}</p>
                                <p className="text-xs text-slate-500">{service.views} lượt xem</p>
                              </div>
                              <Button 
                                type="button" 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-slate-400 hover:text-red-500"
                                onClick={() => setSelectedServiceIds(ids => ids.filter(id => id !== service._id))}
                              >
                                <X size={16} />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Search and add services */}
                    <div className="space-y-2">
                      <Label>Thêm dịch vụ</Label>
                      <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <Input 
                          placeholder="Tìm kiếm dịch vụ..." 
                          className="pl-9"
                          value={serviceSearchTerm}
                          onChange={(e) => setServiceSearchTerm(e.target.value)}
                        />
                      </div>
                      <div className="border border-slate-200 dark:border-slate-700 rounded-lg max-h-[250px] overflow-y-auto">
                        {filteredServices.length === 0 ? (
                          <div className="p-4 text-center text-sm text-slate-500">
                            {servicesData === undefined ? 'Đang tải...' : 'Không tìm thấy dịch vụ'}
                          </div>
                        ) : (
                          filteredServices.map(service => {
                            const isSelected = selectedServiceIds.includes(service._id);
                            return (
                              <div 
                                key={service._id}
                                onClick={() => {
                                  if (isSelected) {
                                    setSelectedServiceIds(ids => ids.filter(id => id !== service._id));
                                  } else {
                                    setSelectedServiceIds(ids => [...ids, service._id]);
                                  }
                                }}
                                className={cn(
                                  "flex items-center gap-3 p-3 cursor-pointer border-b border-slate-100 dark:border-slate-800 last:border-0 transition-colors",
                                  isSelected 
                                    ? "bg-blue-50 dark:bg-blue-500/10" 
                                    : "hover:bg-slate-50 dark:hover:bg-slate-800"
                                )}
                              >
                                <div className={cn(
                                  "w-5 h-5 rounded border-2 flex items-center justify-center transition-colors",
                                  isSelected 
                                    ? "border-blue-500 bg-blue-500" 
                                    : "border-slate-300 dark:border-slate-600"
                                )}>
                                  {isSelected && <Check size={12} className="text-white" />}
                                </div>
                                {service.thumbnail ? (
                                  <img src={service.thumbnail} alt="" className="w-10 h-10 object-cover rounded" />
                                ) : (
                                  <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded flex items-center justify-center">
                                    <Briefcase size={14} className="text-slate-400" />
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">{service.title}</p>
                                  <p className="text-xs text-slate-500">{service.views} lượt xem</p>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            <ServiceListPreview 
              brandColor={brandColor}
              itemCount={serviceSelectionMode === 'manual' ? selectedServiceIds.length : productListConfig.itemCount}
              selectedStyle={serviceListStyle}
              onStyleChange={setServiceListStyle}
              items={serviceSelectionMode === 'manual' && selectedServices.length > 0 
                ? selectedServices.map(s => ({ id: s._id, name: s.title, image: s.thumbnail, price: s.price ? s.price.toLocaleString('vi-VN') + 'đ' : 'Liên hệ', description: s.excerpt }))
                : filteredServices.slice(0, productListConfig.itemCount).map(s => ({ id: s._id, name: s.title, image: s.thumbnail, price: s.price ? s.price.toLocaleString('vi-VN') + 'đ' : 'Liên hệ', description: s.excerpt }))
              }
            />
          </>
        )}

        {/* Blog */}
        {component.type === 'Blog' && (
          <>
            <Card className="mb-6">
              <CardHeader><CardTitle className="text-base">Nguồn dữ liệu</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {/* Selection Mode Toggle */}
                <div className="space-y-2">
                  <Label>Chế độ chọn bài viết</Label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setBlogSelectionMode('auto')}
                      className={cn(
                        "flex-1 py-2.5 px-4 rounded-lg border text-sm font-medium transition-all",
                        blogSelectionMode === 'auto'
                          ? "border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400"
                          : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                      )}
                    >
                      Tự động
                    </button>
                    <button
                      type="button"
                      onClick={() => setBlogSelectionMode('manual')}
                      className={cn(
                        "flex-1 py-2.5 px-4 rounded-lg border text-sm font-medium transition-all",
                        blogSelectionMode === 'manual'
                          ? "border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400"
                          : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                      )}
                    >
                      Chọn thủ công
                    </button>
                  </div>
                  <p className="text-xs text-slate-500">
                    {blogSelectionMode === 'auto' 
                      ? 'Hiển thị bài viết tự động theo số lượng và sắp xếp' 
                      : 'Chọn từng bài viết cụ thể để hiển thị'}
                  </p>
                </div>

                {/* Auto mode settings */}
                {blogSelectionMode === 'auto' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Số lượng hiển thị</Label>
                      <Input type="number" value={productListConfig.itemCount} onChange={(e) => setProductListConfig({...productListConfig, itemCount: parseInt(e.target.value) || 8})} />
                    </div>
                    <div className="space-y-2">
                      <Label>Sắp xếp theo</Label>
                      <select className="w-full h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm" value={productListConfig.sortBy} onChange={(e) => setProductListConfig({...productListConfig, sortBy: e.target.value})}>
                        <option value="newest">Mới nhất</option>
                        <option value="popular">Xem nhiều nhất</option>
                        <option value="random">Ngẫu nhiên</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Manual mode - Post selector */}
                {blogSelectionMode === 'manual' && (
                  <div className="space-y-4">
                    {/* Selected posts list */}
                    {selectedPosts.length > 0 && (
                      <div className="space-y-2">
                        <Label>Bài viết đã chọn ({selectedPosts.length})</Label>
                        <div className="space-y-2 max-h-[300px] overflow-y-auto">
                          {selectedPosts.map((post, index) => (
                            <div 
                              key={post._id} 
                              className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg group"
                            >
                              <div className="text-slate-400 cursor-move">
                                <GripVertical size={16} />
                              </div>
                              <span className="w-6 h-6 flex items-center justify-center bg-blue-500 text-white text-xs rounded-full font-medium">
                                {index + 1}
                              </span>
                              {post.thumbnail ? (
                                <img src={post.thumbnail} alt="" className="w-12 h-12 object-cover rounded" />
                              ) : (
                                <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded flex items-center justify-center">
                                  <FileText size={16} className="text-slate-400" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">{post.title}</p>
                                <p className="text-xs text-slate-500">{new Date(post._creationTime).toLocaleDateString('vi-VN')}</p>
                              </div>
                              <Button 
                                type="button" 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-slate-400 hover:text-red-500"
                                onClick={() => setSelectedPostIds(ids => ids.filter(id => id !== post._id))}
                              >
                                <X size={16} />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Search and add posts */}
                    <div className="space-y-2">
                      <Label>Thêm bài viết</Label>
                      <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <Input 
                          placeholder="Tìm kiếm bài viết..." 
                          className="pl-9"
                          value={postSearchTerm}
                          onChange={(e) => setPostSearchTerm(e.target.value)}
                        />
                      </div>
                      <div className="border border-slate-200 dark:border-slate-700 rounded-lg max-h-[250px] overflow-y-auto">
                        {filteredPosts.length === 0 ? (
                          <div className="p-4 text-center text-sm text-slate-500">
                            {postsData === undefined ? 'Đang tải...' : 'Không tìm thấy bài viết'}
                          </div>
                        ) : (
                          filteredPosts.map(post => {
                            const isSelected = selectedPostIds.includes(post._id);
                            return (
                              <div 
                                key={post._id}
                                onClick={() => {
                                  if (isSelected) {
                                    setSelectedPostIds(ids => ids.filter(id => id !== post._id));
                                  } else {
                                    setSelectedPostIds(ids => [...ids, post._id]);
                                  }
                                }}
                                className={cn(
                                  "flex items-center gap-3 p-3 cursor-pointer border-b border-slate-100 dark:border-slate-800 last:border-0 transition-colors",
                                  isSelected 
                                    ? "bg-blue-50 dark:bg-blue-500/10" 
                                    : "hover:bg-slate-50 dark:hover:bg-slate-800"
                                )}
                              >
                                <div className={cn(
                                  "w-5 h-5 rounded border-2 flex items-center justify-center transition-colors",
                                  isSelected 
                                    ? "border-blue-500 bg-blue-500" 
                                    : "border-slate-300 dark:border-slate-600"
                                )}>
                                  {isSelected && <Check size={12} className="text-white" />}
                                </div>
                                {post.thumbnail ? (
                                  <img src={post.thumbnail} alt="" className="w-10 h-10 object-cover rounded" />
                                ) : (
                                  <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded flex items-center justify-center">
                                    <FileText size={14} className="text-slate-400" />
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">{post.title}</p>
                                  <p className="text-xs text-slate-500">{post.views} lượt xem</p>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            <BlogPreview 
              brandColor={brandColor}
              postCount={blogSelectionMode === 'manual' ? selectedPostIds.length : productListConfig.itemCount}
              selectedStyle={blogStyle}
              onStyleChange={setBlogStyle}
            />
          </>
        )}

        {/* CaseStudy */}
        {component.type === 'CaseStudy' && (
          <>
            <Card className="mb-6">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Dự án tiêu biểu</CardTitle>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setCaseStudyProjects([...caseStudyProjects, { id: Date.now(), title: '', category: '', image: '', description: '', link: '' }])} 
                  className="gap-2"
                >
                  <Plus size={14} /> Thêm dự án
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {caseStudyProjects.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 text-sm">
                    Chưa có dự án nào. Nhấn "Thêm dự án" để bắt đầu.
                  </div>
                ) : (
                  caseStudyProjects.map((project, idx) => (
                    <div key={project.id} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <Label>Dự án {idx + 1}</Label>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          className="text-red-500 h-8 w-8" 
                          onClick={() => setCaseStudyProjects(caseStudyProjects.filter(p => p.id !== project.id))}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Left: Image upload */}
                        <div>
                          <Label className="text-sm mb-2 block">Hình ảnh dự án</Label>
                          <ImageFieldWithUpload
                            label=""
                            value={project.image}
                            onChange={(url) => setCaseStudyProjects(caseStudyProjects.map(p => p.id === project.id ? {...p, image: url} : p))}
                            folder="case-studies"
                            aspectRatio="video"
                            quality={0.85}
                            placeholder="Chọn hoặc upload ảnh dự án"
                          />
                        </div>
                        
                        {/* Right: Info fields */}
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label className="text-xs text-slate-500">Tên dự án</Label>
                              <Input 
                                placeholder="VD: Website ABC Corp" 
                                value={project.title} 
                                onChange={(e) => setCaseStudyProjects(caseStudyProjects.map(p => p.id === project.id ? {...p, title: e.target.value} : p))} 
                              />
                            </div>
                            <div>
                              <Label className="text-xs text-slate-500">Danh mục</Label>
                              <Input 
                                placeholder="VD: Website, Mobile..." 
                                value={project.category} 
                                onChange={(e) => setCaseStudyProjects(caseStudyProjects.map(p => p.id === project.id ? {...p, category: e.target.value} : p))} 
                              />
                            </div>
                          </div>
                          <div>
                            <Label className="text-xs text-slate-500">Mô tả ngắn</Label>
                            <Input 
                              placeholder="Mô tả ngắn về dự án" 
                              value={project.description} 
                              onChange={(e) => setCaseStudyProjects(caseStudyProjects.map(p => p.id === project.id ? {...p, description: e.target.value} : p))} 
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-slate-500">Link chi tiết</Label>
                            <Input 
                              placeholder="https://example.com/project" 
                              value={project.link} 
                              onChange={(e) => setCaseStudyProjects(caseStudyProjects.map(p => p.id === project.id ? {...p, link: e.target.value} : p))} 
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
            <CaseStudyPreview 
              projects={caseStudyProjects.map(p => ({ 
                id: p.id, 
                title: p.title, 
                category: p.category, 
                image: p.image, 
                description: p.description, 
                link: p.link 
              }))} 
              brandColor={brandColor}
              selectedStyle={caseStudyStyle}
              onStyleChange={setCaseStudyStyle}
            />
          </>
        )}

        {/* Career */}
        {component.type === 'Career' && (
          <>
            <Card className="mb-6">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Vị trí tuyển dụng</CardTitle>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setCareerJobs([...careerJobs, { id: Date.now(), title: '', department: '', location: '', type: 'Full-time', salary: '', description: '' }])} 
                  className="gap-2"
                >
                  <Plus size={14} /> Thêm vị trí
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {careerJobs.map((job, idx) => (
                  <div key={job.id} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Vị trí {idx + 1}</Label>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        className="text-red-500 h-8 w-8" 
                        onClick={() => careerJobs.length > 1 && setCareerJobs(careerJobs.filter(j => j.id !== job.id))}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Input 
                        placeholder="Vị trí tuyển dụng" 
                        value={job.title} 
                        onChange={(e) => setCareerJobs(careerJobs.map(j => j.id === job.id ? {...j, title: e.target.value} : j))} 
                      />
                      <Input 
                        placeholder="Phòng ban" 
                        value={job.department} 
                        onChange={(e) => setCareerJobs(careerJobs.map(j => j.id === job.id ? {...j, department: e.target.value} : j))} 
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <Input 
                        placeholder="Địa điểm" 
                        value={job.location} 
                        onChange={(e) => setCareerJobs(careerJobs.map(j => j.id === job.id ? {...j, location: e.target.value} : j))} 
                      />
                      <select 
                        className="h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm" 
                        value={job.type} 
                        onChange={(e) => setCareerJobs(careerJobs.map(j => j.id === job.id ? {...j, type: e.target.value} : j))}
                      >
                        <option>Full-time</option>
                        <option>Part-time</option>
                        <option>Contract</option>
                        <option>Internship</option>
                      </select>
                      <Input 
                        placeholder="Mức lương" 
                        value={job.salary} 
                        onChange={(e) => setCareerJobs(careerJobs.map(j => j.id === job.id ? {...j, salary: e.target.value} : j))} 
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
            <CareerPreview 
              jobs={careerJobs} 
              brandColor={brandColor}
              selectedStyle={careerStyle}
              onStyleChange={setCareerStyle}
            />
          </>
        )}

        {/* SpeedDial */}
        {component.type === 'SpeedDial' && (
          <>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-base">Cấu hình chung</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Vị trí hiển thị</Label>
                  <select
                    value={speedDialPosition}
                    onChange={(e) => setSpeedDialPosition(e.target.value as 'bottom-right' | 'bottom-left')}
                    className="w-full h-9 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm"
                  >
                    <option value="bottom-right">Góc phải</option>
                    <option value="bottom-left">Góc trái</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Danh sách hành động ({speedDialActions.length})</CardTitle>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    const newId = Math.max(0, ...speedDialActions.map(a => a.id)) + 1;
                    setSpeedDialActions([...speedDialActions, { id: newId, icon: 'phone', label: '', url: '', bgColor: brandColor }]);
                  }}
                  disabled={speedDialActions.length >= 6}
                  className="gap-2"
                >
                  <Plus size={14} /> Thêm
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {speedDialActions.map((action, idx) => (
                  <div key={action.id} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Hành động {idx + 1}</Label>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        className="text-red-500 h-8 w-8" 
                        onClick={() => speedDialActions.length > 1 && setSpeedDialActions(speedDialActions.filter(a => a.id !== action.id))}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label className="text-xs text-slate-500">Icon</Label>
                        <select
                          value={action.icon}
                          onChange={(e) => setSpeedDialActions(speedDialActions.map(a => a.id === action.id ? {...a, icon: e.target.value} : a))}
                          className="w-full h-9 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm"
                        >
                          <option value="phone">Điện thoại</option>
                          <option value="mail">Email</option>
                          <option value="message-circle">Chat</option>
                          <option value="map-pin">Địa chỉ</option>
                          <option value="facebook">Facebook</option>
                          <option value="instagram">Instagram</option>
                          <option value="youtube">Youtube</option>
                          <option value="zalo">Zalo</option>
                          <option value="calendar">Đặt lịch</option>
                          <option value="shopping-cart">Giỏ hàng</option>
                          <option value="headphones">Hỗ trợ</option>
                          <option value="help-circle">FAQ</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs text-slate-500">Màu nền</Label>
                        <div className="flex gap-2">
                          <Input 
                            type="color" 
                            value={action.bgColor} 
                            onChange={(e) => setSpeedDialActions(speedDialActions.map(a => a.id === action.id ? {...a, bgColor: e.target.value} : a))}
                            className="w-12 h-9 p-1 cursor-pointer"
                          />
                          <Input 
                            value={action.bgColor} 
                            onChange={(e) => setSpeedDialActions(speedDialActions.map(a => a.id === action.id ? {...a, bgColor: e.target.value} : a))}
                            className="flex-1"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label className="text-xs text-slate-500">Nhãn</Label>
                        <Input 
                          value={action.label} 
                          onChange={(e) => setSpeedDialActions(speedDialActions.map(a => a.id === action.id ? {...a, label: e.target.value} : a))}
                          placeholder="VD: Gọi ngay"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs text-slate-500">URL / Liên kết</Label>
                        <Input 
                          value={action.url} 
                          onChange={(e) => setSpeedDialActions(speedDialActions.map(a => a.id === action.id ? {...a, url: e.target.value} : a))}
                          placeholder="tel:0123456789"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                
                <p className="text-xs text-slate-500">
                  Gợi ý URL: tel:0123456789 (gọi điện), mailto:email@example.com (email), https://zalo.me/... (Zalo)
                </p>
              </CardContent>
            </Card>

            <SpeedDialPreview 
              config={{
                actions: speedDialActions,
                style: speedDialStyle,
                position: speedDialPosition,
                alwaysOpen: speedDialAlwaysOpen,
                mainButtonColor: brandColor,
              }}
              brandColor={brandColor}
              selectedStyle={speedDialStyle}
              onStyleChange={setSpeedDialStyle}
            />
          </>
        )}

        {/* ProductCategories */}
        {component.type === 'ProductCategories' && (
          <>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-base">Cấu hình hiển thị</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Số cột (Desktop)</Label>
                    <select
                      value={productCategoriesColsDesktop}
                      onChange={(e) => setProductCategoriesColsDesktop(parseInt(e.target.value))}
                      className="w-full h-9 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm"
                    >
                      <option value={3}>3 cột</option>
                      <option value={4}>4 cột</option>
                      <option value={5}>5 cột</option>
                      <option value={6}>6 cột</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Số cột (Mobile)</Label>
                    <select
                      value={productCategoriesColsMobile}
                      onChange={(e) => setProductCategoriesColsMobile(parseInt(e.target.value))}
                      className="w-full h-9 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm"
                    >
                      <option value={2}>2 cột</option>
                      <option value={3}>3 cột</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="showProductCount"
                    checked={productCategoriesShowCount}
                    onChange={(e) => setProductCategoriesShowCount(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300"
                  />
                  <Label htmlFor="showProductCount" className="cursor-pointer">Hiển thị số lượng sản phẩm</Label>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Chọn danh mục ({productCategoriesItems.length})</CardTitle>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    const newId = Math.max(0, ...productCategoriesItems.map(c => c.id)) + 1;
                    setProductCategoriesItems([...productCategoriesItems, { id: newId, categoryId: '', customImage: '' }]);
                  }}
                  disabled={productCategoriesItems.length >= 12 || !productCategoriesData?.length}
                  className="gap-2"
                >
                  <Plus size={14} /> Thêm
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {!productCategoriesData?.length ? (
                  <p className="text-sm text-slate-500 text-center py-4">
                    Chưa có danh mục sản phẩm. Vui lòng tạo danh mục trước.
                  </p>
                ) : productCategoriesItems.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-4">
                    Chưa chọn danh mục nào. Nhấn &quot;Thêm&quot; để bắt đầu.
                  </p>
                ) : (
                  productCategoriesItems.map((item, idx) => (
                    <div key={item.id} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <GripVertical size={16} className="text-slate-400 cursor-move" />
                          <Label>Danh mục {idx + 1}</Label>
                        </div>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          className="text-red-500 h-8 w-8" 
                          onClick={() => setProductCategoriesItems(productCategoriesItems.filter(c => c.id !== item.id))}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label className="text-xs text-slate-500">Danh mục</Label>
                          <select
                            value={item.categoryId}
                            onChange={(e) => setProductCategoriesItems(productCategoriesItems.map(c => c.id === item.id ? {...c, categoryId: e.target.value} : c))}
                            className="w-full h-9 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm"
                          >
                            <option value="">-- Chọn danh mục --</option>
                            {productCategoriesData?.map(cat => (
                              <option key={cat._id} value={cat._id}>{cat.name}</option>
                            ))}
                          </select>
                        </div>
                        
                        {item.categoryId && (
                          <div className="space-y-2">
                            <Label className="text-xs text-slate-500">Hình ảnh hiển thị</Label>
                            <CategoryImageSelector
                              value={item.customImage || ''}
                              onChange={(value, mode) => setProductCategoriesItems(productCategoriesItems.map(c => c.id === item.id ? {...c, customImage: value, imageMode: mode} : c))}
                              categoryImage={productCategoriesData?.find(cat => cat._id === item.categoryId)?.image}
                              brandColor={brandColor}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
                
                <p className="text-xs text-slate-500">
                  Tối đa 12 danh mục. Mỗi danh mục có thể: sử dụng ảnh gốc, chọn icon, upload ảnh, hoặc nhập URL.
                </p>
              </CardContent>
            </Card>

            <ProductCategoriesPreview 
              config={{
                categories: productCategoriesItems,
                style: productCategoriesStyle,
                showProductCount: productCategoriesShowCount,
                columnsDesktop: productCategoriesColsDesktop,
                columnsMobile: productCategoriesColsMobile,
              }}
              brandColor={brandColor}
              selectedStyle={productCategoriesStyle}
              onStyleChange={setProductCategoriesStyle}
              categoriesData={productCategoriesData || []}
            />
          </>
        )}

        {/* CategoryProducts - Sản phẩm theo danh mục */}
        {component.type === 'CategoryProducts' && (
          <>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-base">Cấu hình hiển thị</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Số cột (Desktop)</Label>
                    <select
                      value={categoryProductsColsDesktop}
                      onChange={(e) => setCategoryProductsColsDesktop(parseInt(e.target.value))}
                      className="w-full h-9 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm"
                    >
                      <option value={3}>3 cột</option>
                      <option value={4}>4 cột</option>
                      <option value={5}>5 cột</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Số cột (Mobile)</Label>
                    <select
                      value={categoryProductsColsMobile}
                      onChange={(e) => setCategoryProductsColsMobile(parseInt(e.target.value))}
                      className="w-full h-9 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm"
                    >
                      <option value={1}>1 cột</option>
                      <option value={2}>2 cột</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="categoryProductsShowViewAll"
                    checked={categoryProductsShowViewAll}
                    onChange={(e) => setCategoryProductsShowViewAll(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300"
                  />
                  <Label htmlFor="categoryProductsShowViewAll" className="cursor-pointer">Hiển thị nút "Xem danh mục"</Label>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Các section danh mục ({categoryProductsSections.length})</CardTitle>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    const newId = Math.max(0, ...categoryProductsSections.map(s => s.id)) + 1;
                    setCategoryProductsSections([...categoryProductsSections, { id: newId, categoryId: '', itemCount: 4 }]);
                  }}
                  disabled={categoryProductsSections.length >= 6 || !productCategoriesData?.length}
                  className="gap-2"
                >
                  <Plus size={14} /> Thêm
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {!productCategoriesData?.length ? (
                  <p className="text-sm text-slate-500 text-center py-4">
                    Chưa có danh mục sản phẩm. Vui lòng tạo danh mục trước.
                  </p>
                ) : categoryProductsSections.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-4">
                    Chưa có section nào. Nhấn &quot;Thêm&quot; để bắt đầu.
                  </p>
                ) : (
                  categoryProductsSections.map((item, idx) => (
                    <div key={item.id} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="font-semibold">Section {idx + 1}</Label>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          className="text-red-500 h-8 w-8" 
                          onClick={() => setCategoryProductsSections(categoryProductsSections.filter(s => s.id !== item.id))}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label className="text-xs text-slate-500">Danh mục</Label>
                          <select
                            value={item.categoryId}
                            onChange={(e) => setCategoryProductsSections(categoryProductsSections.map(s => s.id === item.id ? {...s, categoryId: e.target.value} : s))}
                            className="w-full h-9 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm"
                          >
                            <option value="">-- Chọn danh mục --</option>
                            {productCategoriesData?.map(cat => (
                              <option key={cat._id} value={cat._id}>{cat.name}</option>
                            ))}
                          </select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-xs text-slate-500">Số sản phẩm hiển thị</Label>
                          <Input
                            type="number"
                            min={2}
                            max={12}
                            value={item.itemCount}
                            onChange={(e) => setCategoryProductsSections(categoryProductsSections.map(s => s.id === item.id ? {...s, itemCount: parseInt(e.target.value) || 4} : s))}
                          />
                        </div>
                      </div>
                    </div>
                  ))
                )}
                
                <p className="text-xs text-slate-500">
                  Tối đa 6 section. Mỗi section là 1 danh mục với các sản phẩm thuộc danh mục đó.
                </p>
              </CardContent>
            </Card>

            <CategoryProductsPreview 
              config={{
                sections: categoryProductsSections,
                style: categoryProductsStyle,
                showViewAll: categoryProductsShowViewAll,
                columnsDesktop: categoryProductsColsDesktop,
                columnsMobile: categoryProductsColsMobile,
              }}
              brandColor={brandColor}
              selectedStyle={categoryProductsStyle}
              onStyleChange={setCategoryProductsStyle}
              categoriesData={productCategoriesData || []}
              productsData={productsData || []}
            />
          </>
        )}

        {/* Team - Đội ngũ */}
        {component.type === 'Team' && (
          <>
            <Card className="mb-6">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Thành viên đội ngũ</CardTitle>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    const newId = Math.max(0, ...teamMembers.map(m => m.id)) + 1;
                    setTeamMembers([...teamMembers, { id: newId, name: '', role: '', avatar: '', bio: '', facebook: '', linkedin: '', twitter: '', email: '' }]);
                  }}
                  className="gap-2"
                >
                  <Plus size={14} /> Thêm
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {teamMembers.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-4">
                    Chưa có thành viên nào. Nhấn &quot;Thêm&quot; để bắt đầu.
                  </p>
                ) : (
                  teamMembers.map((member, idx) => (
                    <div key={member.id} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="font-medium">Thành viên {idx + 1}</Label>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          className="text-red-500 h-8 w-8" 
                          onClick={() => setTeamMembers(teamMembers.filter(m => m.id !== member.id))}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <Input 
                          placeholder="Họ và tên" 
                          value={member.name} 
                          onChange={(e) => setTeamMembers(teamMembers.map(m => m.id === member.id ? {...m, name: e.target.value} : m))} 
                        />
                        <Input 
                          placeholder="Chức vụ" 
                          value={member.role} 
                          onChange={(e) => setTeamMembers(teamMembers.map(m => m.id === member.id ? {...m, role: e.target.value} : m))} 
                        />
                      </div>

                      <ImageFieldWithUpload
                        label="Ảnh đại diện"
                        value={member.avatar}
                        onChange={(url) => setTeamMembers(teamMembers.map(m => m.id === member.id ? {...m, avatar: url} : m))}
                        folder="team-avatars"
                        aspectRatio="square"
                        quality={0.85}
                        placeholder="https://example.com/avatar.jpg"
                      />

                      <textarea 
                        placeholder="Giới thiệu ngắn..." 
                        value={member.bio} 
                        onChange={(e) => setTeamMembers(teamMembers.map(m => m.id === member.id ? {...m, bio: e.target.value} : m))}
                        className="w-full min-h-[60px] rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm" 
                      />

                      <div className="space-y-2">
                        <Label className="text-xs text-slate-500">Social Links</Label>
                        <div className="grid grid-cols-2 gap-2">
                          <Input 
                            placeholder="Facebook URL" 
                            value={member.facebook} 
                            onChange={(e) => setTeamMembers(teamMembers.map(m => m.id === member.id ? {...m, facebook: e.target.value} : m))} 
                            className="text-xs"
                          />
                          <Input 
                            placeholder="LinkedIn URL" 
                            value={member.linkedin} 
                            onChange={(e) => setTeamMembers(teamMembers.map(m => m.id === member.id ? {...m, linkedin: e.target.value} : m))} 
                            className="text-xs"
                          />
                          <Input 
                            placeholder="Twitter URL" 
                            value={member.twitter} 
                            onChange={(e) => setTeamMembers(teamMembers.map(m => m.id === member.id ? {...m, twitter: e.target.value} : m))} 
                            className="text-xs"
                          />
                          <Input 
                            placeholder="Email" 
                            value={member.email} 
                            onChange={(e) => setTeamMembers(teamMembers.map(m => m.id === member.id ? {...m, email: e.target.value} : m))} 
                            className="text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <TeamPreview 
              members={teamMembers} 
              brandColor={brandColor}
              selectedStyle={teamStyle}
              onStyleChange={setTeamStyle}
            />
          </>
        )}

        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={() => router.push('/admin/home-components')} disabled={isSubmitting}>Hủy bỏ</Button>
          <Button type="submit" variant="accent" disabled={isSubmitting}>{isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}</Button>
        </div>
      </form>
    </div>
  );
}
