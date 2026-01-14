'use client';

import React from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useBrandColor } from './hooks';
import { BlogSection } from './BlogSection';
import { ProductListSection } from './ProductListSection';
import { ServiceListSection } from './ServiceListSection';
import { 
  LayoutTemplate, Package, FileText, HelpCircle, MousePointerClick, 
  Users, Star, Phone, Briefcase, Image as ImageIcon, Check, ZoomIn, Maximize2, X,
  Building2, Clock, MapPin, Mail, Zap, Shield, Target, Layers, Cpu, Globe, Rocket, Settings, ArrowRight,
  ChevronLeft, ChevronRight
} from 'lucide-react';

interface HomeComponent {
  _id: string;
  type: string;
  title: string;
  active: boolean;
  order: number;
  config: Record<string, unknown>;
}

interface ComponentRendererProps {
  component: HomeComponent;
}

export function ComponentRenderer({ component }: ComponentRendererProps) {
  const brandColor = useBrandColor();
  const { type, title, config } = component;

  // Render component dựa vào type
  switch (type) {
    case 'Hero':
      return <HeroSection config={config} brandColor={brandColor} />;
    case 'Stats':
      return <StatsSection config={config} brandColor={brandColor} title={title} />;
    case 'About':
      return <AboutSection config={config} brandColor={brandColor} title={title} />;
    case 'Services':
      return <ServicesSection config={config} brandColor={brandColor} title={title} />;
    case 'Benefits':
      return <BenefitsSection config={config} brandColor={brandColor} title={title} />;
    case 'FAQ':
      return <FAQSection config={config} brandColor={brandColor} title={title} />;
    case 'CTA':
      return <CTASection config={config} brandColor={brandColor} />;
    case 'Testimonials':
      return <TestimonialsSection config={config} brandColor={brandColor} title={title} />;
    case 'Contact':
      return <ContactSection config={config} brandColor={brandColor} title={title} />;
    case 'Gallery':
    case 'Partners':
      return <GallerySection config={config} brandColor={brandColor} title={title} type={type} />;
    case 'TrustBadges':
      return <TrustBadgesSection config={config} brandColor={brandColor} title={title} />;
    case 'Pricing':
      return <PricingSection config={config} brandColor={brandColor} title={title} />;
    case 'ProductList':
      return <ProductListSection config={config} brandColor={brandColor} title={title} />;
    case 'ServiceList':
      return <ServiceListSection config={config} brandColor={brandColor} title={title} />;
    case 'Blog':
      return <BlogSection config={config} brandColor={brandColor} title={title} />;
    case 'Career':
      return <CareerSection config={config} brandColor={brandColor} title={title} />;
    case 'CaseStudy':
      return <CaseStudySection config={config} brandColor={brandColor} title={title} />;
    case 'SpeedDial':
      return <SpeedDialSection config={config} brandColor={brandColor} />;
    case 'ProductCategories':
      return <ProductCategoriesSection config={config} brandColor={brandColor} title={title} />;
    case 'CategoryProducts':
      return <CategoryProductsSection config={config} brandColor={brandColor} title={title} />;
    case 'Team':
      return <TeamSection config={config} brandColor={brandColor} title={title} />;
    case 'Features':
      return <FeaturesSection config={config} brandColor={brandColor} title={title} />;
    case 'Process':
      return <ProcessSection config={config} brandColor={brandColor} title={title} />;
    case 'Clients':
      return <ClientsSection config={config} brandColor={brandColor} title={title} />;
    case 'Video':
      return <VideoSection config={config} brandColor={brandColor} title={title} />;
    case 'Countdown':
      return <CountdownSection config={config} brandColor={brandColor} title={title} />;
    case 'Footer':
      return <FooterSection config={config} brandColor={brandColor} />;
    default:
      return <PlaceholderSection type={type} title={title} />;
  }
}

// ============ HERO SECTION ============
// Best Practice: Blurred Background Fill - fills letterbox gaps with blurred version of same image
// Supports 6 styles: slider, fade, bento, fullscreen, split, parallax
type HeroStyle = 'slider' | 'fade' | 'bento' | 'fullscreen' | 'split' | 'parallax';

interface HeroContent {
  badge?: string;
  heading?: string;
  description?: string;
  primaryButtonText?: string;
  secondaryButtonText?: string;
  countdownText?: string;
}

function HeroSection({ config, brandColor }: { config: Record<string, unknown>; brandColor: string }) {
  const slides = (config.slides as Array<{ image: string; link: string }>) || [];
  const style = (config.style as HeroStyle) || 'slider';
  const content = (config.content as HeroContent) || {};
  const [currentSlide, setCurrentSlide] = React.useState(0);

  React.useEffect(() => {
    if (slides.length <= 1 || style === 'bento') return;
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length, style]);

  if (slides.length === 0) {
    return (
      <section className="relative h-[500px] bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-4xl font-bold mb-4">Chào mừng đến với chúng tôi</h1>
          <p className="text-slate-300">Khám phá sản phẩm và dịch vụ tuyệt vời</p>
        </div>
      </section>
    );
  }

  // Helper: Render slide với blurred background
  const renderSlideWithBlur = (slide: { image: string; link: string }, idx: number) => (
    <a href={slide.link || '#'} className="block w-full h-full relative">
      <div className="absolute inset-0 scale-110" style={{ backgroundImage: `url(${slide.image})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(30px)' }} />
      <div className="absolute inset-0 bg-black/20" />
      <img src={slide.image} alt="" className="relative w-full h-full object-contain z-10" />
    </a>
  );

  // Style 1: Slider
  if (style === 'slider') {
    return (
      <section className="relative w-full bg-slate-900 overflow-hidden">
        <div className="relative w-full aspect-[16/9] md:aspect-[21/9] max-h-[400px] md:max-h-[550px]">
          {slides.map((slide, idx) => (
            <div key={idx} className={`absolute inset-0 transition-opacity duration-700 ${idx === currentSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
              {slide.image ? renderSlideWithBlur(slide, idx) : <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900" />}
            </div>
          ))}
          {slides.length > 1 && (
            <>
              <button onClick={() => setCurrentSlide(prev => prev === 0 ? slides.length - 1 : prev - 1)} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white shadow-lg flex items-center justify-center transition-all z-20" style={{ opacity: 0.7 }}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <button onClick={() => setCurrentSlide(prev => (prev + 1) % slides.length)} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white shadow-lg flex items-center justify-center transition-all z-20" style={{ opacity: 0.7 }}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                {slides.map((_, idx) => (
                  <button key={idx} onClick={() => setCurrentSlide(idx)} className={`w-3 h-3 rounded-full transition-all ${idx === currentSlide ? 'w-8' : 'bg-white/50'}`} style={idx === currentSlide ? { backgroundColor: brandColor } : {}} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    );
  }

  // Style 2: Fade with Thumbnails
  if (style === 'fade') {
    return (
      <section className="relative w-full bg-slate-900 overflow-hidden">
        <div className="relative w-full aspect-[16/9] md:aspect-[21/9] max-h-[450px] md:max-h-[600px]">
          {slides.map((slide, idx) => (
            <div key={idx} className={`absolute inset-0 transition-opacity duration-700 ${idx === currentSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
              {slide.image ? renderSlideWithBlur(slide, idx) : <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900" />}
            </div>
          ))}
          {slides.length > 1 && (
            <div className="absolute bottom-0 left-0 right-0 p-3 flex justify-center gap-2 bg-gradient-to-t from-black/60 to-transparent z-20">
              {slides.map((slide, idx) => (
                <button key={idx} onClick={() => setCurrentSlide(idx)} className={`rounded overflow-hidden transition-all border-2 w-16 h-10 md:w-20 md:h-12 ${idx === currentSlide ? 'border-white scale-105' : 'border-transparent opacity-70 hover:opacity-100'}`}>
                  {slide.image ? <img src={slide.image} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full" style={{ backgroundColor: brandColor }} />}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>
    );
  }

  // Style 3: Bento Grid
  if (style === 'bento') {
    const bentoSlides = slides.slice(0, 4);
    return (
      <section className="relative w-full bg-slate-900 overflow-hidden p-2 md:p-4">
        <div className="max-h-[400px] md:max-h-[550px]">
          {/* Mobile: 2x2 grid */}
          <div className="grid grid-cols-2 gap-2 md:hidden" style={{ height: '320px' }}>
            {bentoSlides.slice(0, 4).map((slide, idx) => (
              <a key={idx} href={slide.link || '#'} className="relative rounded-xl overflow-hidden">
                {slide.image ? (
                  <div className="w-full h-full relative">
                    <div className="absolute inset-0 scale-110" style={{ backgroundImage: `url(${slide.image})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(20px)' }} />
                    <div className="absolute inset-0 bg-black/20" />
                    <img src={slide.image} alt="" className="relative w-full h-full object-contain z-10" />
                  </div>
                ) : (
                  <div className="w-full h-full bg-slate-800" />
                )}
              </a>
            ))}
          </div>
          {/* Desktop: Bento layout */}
          <div className="hidden md:grid grid-cols-4 grid-rows-2 gap-3" style={{ height: '500px' }}>
            <a href={bentoSlides[0]?.link || '#'} className="col-span-2 row-span-2 relative rounded-2xl overflow-hidden">
              {bentoSlides[0]?.image ? (
                <div className="w-full h-full relative">
                  <div className="absolute inset-0 scale-110" style={{ backgroundImage: `url(${bentoSlides[0].image})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(25px)' }} />
                  <div className="absolute inset-0 bg-black/20" />
                  <img src={bentoSlides[0].image} alt="" className="relative w-full h-full object-contain z-10" />
                </div>
              ) : <div className="w-full h-full bg-slate-800" />}
            </a>
            <a href={bentoSlides[1]?.link || '#'} className="col-span-2 relative rounded-2xl overflow-hidden">
              {bentoSlides[1]?.image ? (
                <div className="w-full h-full relative">
                  <div className="absolute inset-0 scale-110" style={{ backgroundImage: `url(${bentoSlides[1].image})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(20px)' }} />
                  <div className="absolute inset-0 bg-black/20" />
                  <img src={bentoSlides[1].image} alt="" className="relative w-full h-full object-contain z-10" />
                </div>
              ) : <div className="w-full h-full bg-slate-800" />}
            </a>
            <a href={bentoSlides[2]?.link || '#'} className="relative rounded-2xl overflow-hidden">
              {bentoSlides[2]?.image ? (
                <div className="w-full h-full relative">
                  <div className="absolute inset-0 scale-110" style={{ backgroundImage: `url(${bentoSlides[2].image})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(15px)' }} />
                  <div className="absolute inset-0 bg-black/20" />
                  <img src={bentoSlides[2].image} alt="" className="relative w-full h-full object-contain z-10" />
                </div>
              ) : <div className="w-full h-full bg-slate-800" />}
            </a>
            <a href={bentoSlides[3]?.link || '#'} className="relative rounded-2xl overflow-hidden">
              {bentoSlides[3]?.image ? (
                <div className="w-full h-full relative">
                  <div className="absolute inset-0 scale-110" style={{ backgroundImage: `url(${bentoSlides[3].image})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(15px)' }} />
                  <div className="absolute inset-0 bg-black/20" />
                  <img src={bentoSlides[3].image} alt="" className="relative w-full h-full object-contain z-10" />
                </div>
              ) : <div className="w-full h-full bg-slate-800" />}
            </a>
          </div>
        </div>
      </section>
    );
  }

  // Style 4: Fullscreen - Hero toàn màn hình với CTA overlay
  if (style === 'fullscreen') {
    return (
      <section className="relative w-full bg-slate-900 overflow-hidden">
        <div className="relative w-full h-[400px] md:h-[550px] lg:h-[650px]">
          {slides.map((slide, idx) => (
            <div key={idx} className={`absolute inset-0 transition-opacity duration-1000 ${idx === currentSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
              {slide.image ? (
                <div className="w-full h-full relative">
                  <img src={slide.image} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
                </div>
              ) : <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900" />}
            </div>
          ))}
          {/* CTA Overlay Content */}
          <div className="absolute inset-0 z-10 flex flex-col justify-center px-4 md:px-8 lg:px-16">
            <div className="max-w-xl space-y-4 md:space-y-6">
              {content.badge && (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: `${brandColor}30`, color: brandColor }}>
                  <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: brandColor }} />
                  {content.badge}
                </div>
              )}
              <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
                {content.heading || 'Tiêu đề chính'}
              </h1>
              {content.description && (
                <p className="text-white/80 text-sm md:text-lg">
                  {content.description}
                </p>
              )}
              <div className="flex flex-col sm:flex-row gap-3">
                {content.primaryButtonText && (
                  <a href={slides[currentSlide]?.link || '#'} className="px-6 py-3 font-medium rounded-lg text-white text-center" style={{ backgroundColor: brandColor }}>
                    {content.primaryButtonText}
                  </a>
                )}
                {content.secondaryButtonText && (
                  <a href="#" className="px-6 py-3 font-medium rounded-lg border border-white/30 text-white hover:bg-white/10 transition-colors text-center">
                    {content.secondaryButtonText}
                  </a>
                )}
              </div>
            </div>
          </div>
          {/* Navigation dots */}
          {slides.length > 1 && (
            <div className="absolute bottom-6 right-6 flex gap-2 z-20">
              {slides.map((_, idx) => (
                <button key={idx} onClick={() => setCurrentSlide(idx)} className={`w-3 h-3 rounded-full transition-all ${idx === currentSlide ? 'w-8' : 'bg-white/50'}`} style={idx === currentSlide ? { backgroundColor: brandColor } : {}} />
              ))}
            </div>
          )}
        </div>
      </section>
    );
  }

  // Style 5: Split - Layout chia đôi (Content + Image)
  if (style === 'split') {
    return (
      <section className="relative w-full bg-white overflow-hidden">
        <div className="flex flex-col md:flex-row md:h-[450px] lg:h-[550px]">
          {/* Content Side */}
          <div className="w-full md:w-1/2 flex flex-col justify-center bg-slate-50 p-6 md:p-10 lg:p-16 order-2 md:order-1">
            <div className="max-w-md space-y-4">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide" style={{ backgroundColor: `${brandColor}15`, color: brandColor }}>
                {content.badge || `Banner ${currentSlide + 1}/${slides.length}`}
              </span>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 leading-tight">
                {content.heading || 'Tiêu đề nổi bật'}
              </h2>
              {content.description && (
                <p className="text-slate-600 text-base md:text-lg">
                  {content.description}
                </p>
              )}
              {content.primaryButtonText && (
                <div className="pt-2">
                  <a href={slides[currentSlide]?.link || '#'} className="inline-block px-6 py-3 font-medium rounded-lg text-white" style={{ backgroundColor: brandColor }}>
                    {content.primaryButtonText}
                  </a>
                </div>
              )}
            </div>
            {/* Slide indicators */}
            {slides.length > 1 && (
              <div className="flex gap-2 mt-8">
                {slides.map((_, idx) => (
                  <button key={idx} onClick={() => setCurrentSlide(idx)} className={`h-1.5 rounded-full transition-all ${idx === currentSlide ? 'w-10' : 'w-6 bg-slate-300'}`} style={idx === currentSlide ? { backgroundColor: brandColor } : {}} />
                ))}
              </div>
            )}
          </div>
          {/* Image Side */}
          <div className="w-full md:w-1/2 h-[280px] md:h-full relative overflow-hidden order-1 md:order-2">
            {slides.map((slide, idx) => (
              <div key={idx} className={`absolute inset-0 transition-all duration-700 ${idx === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'}`}>
                {slide.image ? (
                  <img src={slide.image} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-200">
                    <LayoutTemplate size={48} className="text-slate-400" />
                  </div>
                )}
              </div>
            ))}
            {/* Navigation arrows */}
            {slides.length > 1 && (
              <>
                <button onClick={() => setCurrentSlide(prev => prev === 0 ? slides.length - 1 : prev - 1)} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center z-10">
                  <svg className="w-5 h-5" style={{ color: brandColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <button onClick={() => setCurrentSlide(prev => (prev + 1) % slides.length)} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center z-10">
                  <svg className="w-5 h-5" style={{ color: brandColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
              </>
            )}
          </div>
        </div>
      </section>
    );
  }

  // Style 6: Parallax - Hiệu ứng layer với floating card
  if (style === 'parallax') {
    return (
      <section className="relative w-full bg-slate-900 overflow-hidden">
        <div className="relative w-full h-[350px] md:h-[450px] lg:h-[550px]">
          {slides.map((slide, idx) => (
            <div key={idx} className={`absolute inset-0 transition-opacity duration-700 ${idx === currentSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
              {slide.image ? (
                <div className="w-full h-full relative">
                  <div className="absolute inset-0 scale-110 transform-gpu" style={{ backgroundImage: `url(${slide.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
                </div>
              ) : <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900" />}
            </div>
          ))}
          {/* Floating content card */}
          <div className="absolute z-10 inset-x-4 md:inset-x-8 bottom-4 md:bottom-8 flex items-end">
            <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl p-4 md:p-6 max-w-lg">
              {content.badge && (
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: brandColor }} />
                  <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: brandColor }}>{content.badge}</span>
                </div>
              )}
              <h3 className="text-lg md:text-xl font-bold text-slate-900">
                {content.heading || 'Tiêu đề nổi bật'}
              </h3>
              {content.description && (
                <p className="text-slate-600 text-sm mt-1">
                  {content.description}
                </p>
              )}
              <div className="flex items-center gap-3 mt-4">
                {content.primaryButtonText && (
                  <a href={slides[currentSlide]?.link || '#'} className="px-5 py-2 font-medium rounded-lg text-white text-sm" style={{ backgroundColor: brandColor }}>
                    {content.primaryButtonText}
                  </a>
                )}
                {content.countdownText && (
                  <span className="text-slate-500 text-sm">{content.countdownText}</span>
                )}
              </div>
            </div>
          </div>
          {/* Top navigation bar */}
          {slides.length > 1 && (
            <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
              <button onClick={() => setCurrentSlide(prev => prev === 0 ? slides.length - 1 : prev - 1)} className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <span className="text-white/80 text-xs font-medium px-2">{currentSlide + 1} / {slides.length}</span>
              <button onClick={() => setCurrentSlide(prev => (prev + 1) % slides.length)} className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          )}
        </div>
      </section>
    );
  }

  return null;
}

// ============ STATS SECTION ============
// Professional Stats UI/UX - 6 Variants
type StatsStyle = 'horizontal' | 'cards' | 'icons' | 'gradient' | 'minimal' | 'counter';
function StatsSection({ config, brandColor, title }: { config: Record<string, unknown>; brandColor: string; title: string }) {
  const items = (config.items as Array<{ value: string; label: string }>) || [];
  const style = (config.style as StatsStyle) || 'horizontal';

  // Style 1: Thanh ngang - Full width bar với dividers
  if (style === 'horizontal') {
    return (
      <section className="py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div 
            className="w-full rounded-lg shadow-md overflow-hidden"
            style={{ backgroundColor: brandColor, boxShadow: `0 4px 6px -1px ${brandColor}20` }}
          >
            <div className="flex flex-col md:flex-row items-center justify-between divide-y md:divide-y-0 md:divide-x divide-white/10">
              {items.map((item, idx) => (
                <div 
                  key={idx} 
                  className="flex-1 w-full py-6 px-4 flex flex-col items-center justify-center text-center text-white hover:bg-white/5 transition-colors duration-200 cursor-default"
                >
                  <span className="text-3xl md:text-4xl font-bold tracking-tight tabular-nums leading-none mb-1">
                    {item.value}
                  </span>
                  <h3 className="text-xs font-medium uppercase tracking-wider opacity-85">
                    {item.label}
                  </h3>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Style 2: Cards - Grid cards với hover effects và accent line
  if (style === 'cards') {
    return (
      <section className="py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {items.map((item, idx) => (
              <div 
                key={idx}
                className="group bg-white border border-slate-100 rounded-xl p-5 flex flex-col items-center text-center shadow-sm hover:shadow-md hover:border-slate-200 transition-all duration-200"
              >
                <span 
                  className="text-3xl font-bold mb-1 tracking-tight tabular-nums group-hover:scale-105 transition-transform duration-200"
                  style={{ color: brandColor }}
                >
                  {item.value}
                </span>
                <h3 className="text-sm font-semibold text-slate-700">
                  {item.label}
                </h3>
                {/* Minimal accent line */}
                <div 
                  className="w-8 h-0.5 bg-slate-100 rounded-full mt-3 group-hover:opacity-50 transition-colors duration-200"
                  style={{ backgroundColor: brandColor + '30' }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Style 3: Icon Grid - Circle containers với shadow và hover scale
  if (style === 'icons') {
    return (
      <section className="py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {items.map((item, idx) => (
              <div key={idx} className="flex flex-col items-center group">
                {/* Circle Container with shadow and border */}
                <div 
                  className="relative w-24 h-24 md:w-28 md:h-28 rounded-full flex items-center justify-center mb-3 group-hover:scale-105 transition-all duration-300 ease-out border-[3px] border-white ring-1 ring-slate-100"
                  style={{ 
                    backgroundColor: brandColor,
                    boxShadow: `0 10px 15px -3px ${brandColor}30, 0 4px 6px -4px ${brandColor}20`
                  }}
                >
                  <span className="text-2xl md:text-3xl font-bold text-white tracking-tight z-10 tabular-nums">
                    {item.value}
                  </span>
                </div>
                <h3 className="text-base font-semibold text-slate-800 group-hover:text-opacity-80 transition-colors">
                  {item.label}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Style 4: Gradient - Glass morphism với gradient background
  if (style === 'gradient') {
    return (
      <section className="py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div 
            className="rounded-2xl overflow-hidden"
            style={{ 
              background: `linear-gradient(135deg, ${brandColor} 0%, ${brandColor}dd 50%, ${brandColor}bb 100%)`,
            }}
          >
            <div className="grid grid-cols-2 md:grid-cols-4 backdrop-blur-sm">
              {items.map((item, idx) => (
                <div 
                  key={idx}
                  className={`relative flex flex-col items-center justify-center text-center text-white p-6 md:p-8 ${
                    idx !== items.length - 1 ? 'md:border-r md:border-white/10' : ''
                  }`}
                >
                  {/* Decorative circle */}
                  <div className="absolute top-2 right-2 w-16 h-16 rounded-full bg-white/5 blur-xl" />
                  <span className="text-4xl md:text-5xl font-extrabold tracking-tight tabular-nums leading-none mb-2 relative z-10">
                    {item.value}
                  </span>
                  <h3 className="text-sm font-medium opacity-90 relative z-10">
                    {item.label}
                  </h3>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Style 5: Minimal - Clean, simple với typography focus
  if (style === 'minimal') {
    return (
      <section className="py-12 md:py-16 px-4 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {items.map((item, idx) => (
              <div key={idx} className="flex flex-col items-start">
                {/* Accent line */}
                <div 
                  className="w-12 h-1 rounded-full mb-4"
                  style={{ backgroundColor: brandColor }}
                />
                <span className="text-4xl md:text-5xl font-bold tracking-tight tabular-nums leading-none text-slate-900">
                  {item.value}
                </span>
                <h3 className="text-base font-medium text-slate-500 mt-2">
                  {item.label}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Style 6: Counter - Big numbers với animated feel & progress indicator
  return (
    <section className="py-12 md:py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {items.map((item, idx) => (
            <div 
              key={idx}
              className="relative bg-white rounded-2xl border border-slate-100 overflow-hidden group"
            >
              {/* Top progress bar */}
              <div className="h-1 w-full bg-slate-100">
                <div 
                  className="h-full transition-all duration-500"
                  style={{ 
                    backgroundColor: brandColor,
                    width: `${Math.min(100, (idx + 1) * 25)}%`
                  }}
                />
              </div>
              
              <div className="flex flex-col items-center justify-center text-center p-6">
                <span 
                  className="text-5xl md:text-6xl font-black tracking-tighter tabular-nums leading-none group-hover:scale-110 transition-transform duration-300"
                  style={{ color: brandColor }}
                >
                  {item.value}
                </span>
                <h3 className="text-sm font-semibold text-slate-600 mt-2">
                  {item.label}
                </h3>
              </div>
              
              {/* Decorative watermark */}
              <div 
                className="absolute -bottom-4 -right-4 text-[5rem] font-black opacity-[0.03] select-none pointer-events-none leading-none"
                style={{ color: brandColor }}
              >
                {idx + 1}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============ ABOUT SECTION ============
// Brand Story UI/UX - 6 Variants: classic, bento, minimal, split, timeline, showcase
type AboutStyle = 'classic' | 'bento' | 'minimal' | 'split' | 'timeline' | 'showcase';

// Badge Component for About - Monochromatic with brandColor
const AboutBadge = ({ text, variant = 'default', brandColor }: { text: string; variant?: 'default' | 'outline' | 'minimal'; brandColor: string }) => {
  const baseStyles = "inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold uppercase tracking-wider w-fit";
  
  if (variant === 'outline') {
    return (
      <div 
        className={`${baseStyles} bg-transparent font-medium`}
        style={{ borderColor: `${brandColor}40`, color: brandColor }}
      >
        {text}
      </div>
    );
  }
  if (variant === 'minimal') {
    return (
      <div 
        className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md text-xs font-medium w-fit border-transparent normal-case tracking-normal"
        style={{ backgroundColor: `${brandColor}15`, color: brandColor }}
      >
        {text}
      </div>
    );
  }
  return (
    <div 
      className={baseStyles}
      style={{ backgroundColor: `${brandColor}10`, color: brandColor, borderColor: `${brandColor}20` }}
    >
      {text}
    </div>
  );
};

// StatBox Component for About - 3 variants
const AboutStatBox = ({ stat, variant = 'classic', brandColor }: { 
  stat: { value: string; label: string }; 
  variant?: 'classic' | 'bento' | 'minimal';
  brandColor: string;
}) => {
  if (variant === 'bento') {
    return (
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200/50 shadow-sm flex flex-col items-start justify-end h-full hover:border-slate-300 transition-colors group">
        <span 
          className="text-4xl md:text-5xl font-bold tracking-tighter mb-2 group-hover:scale-105 transition-transform origin-left"
          style={{ color: brandColor }}
        >
          {stat.value || '0'}
        </span>
        <span className="text-sm font-medium text-slate-500 uppercase tracking-wide">
          {stat.label || 'Label'}
        </span>
      </div>
    );
  }

  if (variant === 'minimal') {
    return (
      <div 
        className="flex flex-col border-l-2 pl-6 py-1"
        style={{ borderColor: `${brandColor}30` }}
      >
        <span className="text-3xl font-bold tracking-tight" style={{ color: brandColor }}>{stat.value || '0'}</span>
        <span className="text-sm text-slate-500 font-medium">{stat.label || 'Label'}</span>
      </div>
    );
  }

  // Classic variant
  return (
    <div className="flex flex-col gap-1">
      <span className="text-5xl font-extrabold tracking-tighter" style={{ color: brandColor }}>{stat.value || '0'}</span>
      <span className="text-sm font-semibold text-slate-500 uppercase tracking-wide">{stat.label || 'Label'}</span>
    </div>
  );
};

function AboutSection({ config, brandColor, title }: { config: Record<string, unknown>; brandColor: string; title: string }) {
  const { subHeading, heading, description, image, imageCaption, buttonText, buttonLink, stats, style } = config as {
    subHeading?: string;
    heading?: string;
    description?: string;
    image?: string;
    imageCaption?: string;
    buttonText?: string;
    buttonLink?: string;
    stats?: Array<{ value: string; label: string }>;
    style?: AboutStyle;
  };

  const aboutStyle = style || 'bento';

  // Style 1: Classic - Open Layout, Image Left, Typography Focused
  if (aboutStyle === 'classic') {
    return (
      <section className="py-12 md:py-20 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 lg:gap-20 items-center">
            {/* Image Side (Left on desktop) */}
            <div className="order-2 lg:order-1 relative rounded-2xl overflow-hidden shadow-2xl aspect-[4/3]">
              {image ? (
                <img 
                  src={image} 
                  alt="Brand Story" 
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-100">
                  <ImageIcon size={48} className="text-slate-300" />
                </div>
              )}
            </div>

            {/* Text Side (Right on desktop) */}
            <div className="order-1 lg:order-2 flex flex-col justify-center space-y-8 md:space-y-10">
              <div className="space-y-4 md:space-y-6">
                {subHeading && (
                  <AboutBadge text={subHeading} variant="outline" brandColor={brandColor} />
                )}
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight leading-[1.1]">
                  {heading || title}
                </h2>
                <p className="text-base md:text-lg lg:text-xl text-slate-600 leading-relaxed">
                  {description}
                </p>
              </div>
              
              {/* Stats - Horizontal row */}
              {stats && stats.length > 0 && (
                <div className="flex flex-row gap-8 md:gap-12 border-t border-slate-200 pt-6 md:pt-8">
                  {stats.slice(0, 2).map((stat, idx) => (
                    <AboutStatBox key={idx} stat={stat} variant="classic" brandColor={brandColor} />
                  ))}
                </div>
              )}

              {buttonText && (
                <div>
                  <a 
                    href={buttonLink || '#'}
                    className="inline-flex items-center gap-2 p-0 h-auto text-lg font-semibold hover:opacity-80 transition-opacity group"
                    style={{ color: brandColor }}
                  >
                    {buttonText} 
                    <svg className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Style 2: Bento Grid - Modern Tech Grid
  if (aboutStyle === 'bento') {
    return (
      <section className="py-8 md:py-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-slate-50/50 rounded-3xl p-4 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              {/* Cell 1: Main Content */}
              <div className="md:col-span-2 bg-white rounded-2xl p-6 md:p-8 lg:p-12 border border-slate-200/50 shadow-sm flex flex-col justify-center space-y-4 md:space-y-6">
                <div className="space-y-3 md:space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-2 w-2 rounded-full animate-pulse" style={{ backgroundColor: brandColor }} />
                    <span className="text-sm font-semibold uppercase tracking-wide" style={{ color: brandColor }}>
                      {subHeading || 'Câu chuyện thương hiệu'}
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900">
                    {heading || title}
                  </h2>
                  <p className="text-slate-600">
                    {description}
                  </p>
                </div>
                {buttonText && (
                  <div className="pt-2 md:pt-4">
                    <a 
                      href={buttonLink || '#'}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border-2 font-medium transition-colors hover:text-white"
                      style={{ borderColor: brandColor, color: brandColor }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = brandColor; (e.currentTarget as HTMLElement).style.color = 'white'; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; (e.currentTarget as HTMLElement).style.color = brandColor; }}
                    >
                      {buttonText}
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </a>
                  </div>
                )}
              </div>

              {/* Cell 2 & 3: Stats Stacked */}
              <div className="grid grid-cols-2 md:grid-cols-1 gap-4 md:gap-6">
                {stats && stats.slice(0, 2).map((stat, idx) => (
                  <AboutStatBox key={idx} stat={stat} variant="bento" brandColor={brandColor} />
                ))}
              </div>

              {/* Cell 4: Wide Image */}
              <div className="md:col-span-3 h-48 md:h-64 lg:h-80 rounded-2xl overflow-hidden relative group">
                {image ? (
                  <img 
                    src={image} 
                    alt="Office" 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                  />
                ) : (
                  <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                    <ImageIcon size={48} className="text-slate-300" />
                  </div>
                )}
                {(imageCaption || image) && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6 md:p-8">
                    <p className="text-white font-medium text-base md:text-lg">
                      {imageCaption || 'Kiến tạo không gian làm việc hiện đại & bền vững.'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Style 3: Minimal - Safe/Boring Design, Boxed Layout
  if (aboutStyle === 'minimal') {
    return (
      <section className="py-8 md:py-12 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="flex flex-col lg:flex-row h-full min-h-[400px] md:min-h-[500px]">
              {/* Left: Content */}
              <div className="flex-1 p-6 md:p-10 lg:p-16 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-slate-200">
                <div className="max-w-xl space-y-6 md:space-y-8">
                  {subHeading && (
                    <AboutBadge text={subHeading} variant="minimal" brandColor={brandColor} />
                  )}
                  
                  <div className="space-y-3 md:space-y-4">
                    <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold tracking-tight text-slate-900">
                      {heading || title}
                    </h2>
                    <p className="text-base md:text-lg text-slate-600 leading-relaxed">
                      {description}
                    </p>
                  </div>

                  {/* Stats with vertical bar */}
                  {stats && stats.length > 0 && (
                    <div className="flex gap-6 md:gap-8 py-4">
                      {stats.slice(0, 2).map((stat, idx) => (
                        <AboutStatBox key={idx} stat={stat} variant="minimal" brandColor={brandColor} />
                      ))}
                    </div>
                  )}

                  {buttonText && (
                    <div>
                      <a 
                        href={buttonLink || '#'}
                        className="inline-flex h-12 px-6 rounded-md font-medium transition-colors items-center justify-center hover:opacity-90"
                        style={{ backgroundColor: brandColor, color: 'white' }}
                      >
                        {buttonText}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Image */}
              <div className="relative bg-slate-100 h-64 lg:h-auto lg:w-[45%]">
                {image ? (
                  <img 
                    src={image} 
                    alt="Brand" 
                    className="absolute inset-0 w-full h-full object-cover" 
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ImageIcon size={48} className="text-slate-300" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Style 4: Split - Layout chia đôi (Content trái, Image phải)
  if (aboutStyle === 'split') {
    return (
      <section className="relative w-full bg-white overflow-hidden">
        <div className="flex flex-col md:flex-row md:min-h-[450px] lg:min-h-[500px]">
          {/* Content Side */}
          <div className="w-full md:w-1/2 flex flex-col justify-center bg-slate-50 p-6 md:p-10 lg:p-16 order-2 md:order-1">
            <div className="max-w-md space-y-4">
              {subHeading && (
                <AboutBadge text={subHeading || ''} variant="outline" brandColor={brandColor} />
              )}
              <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-900 leading-tight">
                {heading || title}
              </h2>
              <p className="text-slate-600 leading-relaxed">
                {description || ''}
              </p>
              {/* Stats inline */}
              {(stats ?? []).length > 0 && (
                <div className="flex gap-6 pt-4 border-t border-slate-200">
                  {(stats ?? []).slice(0, 2).map((stat, idx) => (
                    <div key={idx} className="flex flex-col">
                      <span className="text-2xl font-bold" style={{ color: brandColor }}>{stat.value || '0'}</span>
                      <span className="text-xs text-slate-500">{stat.label || ''}</span>
                    </div>
                  ))}
                </div>
              )}
              {buttonText && (
                <div className="pt-2">
                  <a href={buttonLink || '#'} className="inline-block px-6 py-2.5 font-medium rounded-lg text-white" style={{ backgroundColor: brandColor }}>
                    {buttonText}
                  </a>
                </div>
              )}
            </div>
          </div>
          {/* Image Side */}
          <div className="w-full md:w-1/2 h-[250px] md:h-auto relative overflow-hidden order-1 md:order-2">
            {image ? (
              <img src={image} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-slate-200">
                <ImageIcon size={48} className="text-slate-400" />
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }

  // Style 5: Timeline - Vertical timeline với milestones
  if (aboutStyle === 'timeline') {
    return (
      <section className="py-12 md:py-16 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            {subHeading && (
              <div className="flex justify-center mb-3">
                <AboutBadge text={subHeading || ''} variant="default" brandColor={brandColor} />
              </div>
            )}
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
              {heading || title}
            </h2>
            <p className="text-slate-600 mt-2 max-w-2xl mx-auto">
              {description || ''}
            </p>
          </div>

          {/* Timeline */}
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-4 md:left-1/2 md:-translate-x-px top-0 bottom-0 w-0.5" style={{ backgroundColor: `${brandColor}20` }} />
            
            <div className="space-y-8">
              {(stats ?? []).slice(0, 4).map((stat, idx) => (
                <div key={idx} className={`relative flex ${idx % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                  {/* Dot */}
                  <div className="absolute left-4 md:left-1/2 md:-translate-x-1/2 w-8 h-8 rounded-full border-4 bg-white flex items-center justify-center text-xs font-bold" style={{ borderColor: brandColor, color: brandColor }}>
                    {idx + 1}
                  </div>
                  {/* Content card */}
                  <div className="ml-16 md:ml-0 md:w-5/12 bg-white rounded-xl p-4 border shadow-sm" style={{ borderColor: `${brandColor}15` }}>
                    <span className="text-2xl font-bold" style={{ color: brandColor }}>{stat.value || ''}</span>
                    <p className="text-sm text-slate-600 mt-1">{stat.label || ''}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Image at bottom */}
          {image && (
            <div className="mt-12 rounded-2xl overflow-hidden aspect-[16/9] max-h-[350px]">
              <img src={image} alt="" className="w-full h-full object-cover" />
            </div>
          )}

          {buttonText && (
            <div className="text-center mt-10">
              <a href={buttonLink || '#'} className="inline-block px-6 py-2.5 rounded-lg font-medium text-white" style={{ backgroundColor: brandColor }}>
                {buttonText}
              </a>
            </div>
          )}
        </div>
      </section>
    );
  }

  // Style 6: Showcase - Card nổi bật với ảnh lớn và stats gradient (default fallback)
  return (
    <section className="py-12 md:py-16 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          {subHeading && (
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-4" style={{ backgroundColor: `${brandColor}15`, color: brandColor }}>
              {subHeading}
            </span>
          )}
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 mb-3">
            {heading || title}
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            {description || ''}
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Image Card */}
          <div className="relative rounded-2xl overflow-hidden aspect-[4/3] lg:aspect-auto lg:min-h-[400px] group">
            {image ? (
              <>
                <img src={image} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-slate-100">
                <ImageIcon size={48} className="text-slate-300" />
              </div>
            )}
            {buttonText && (
              <div className="absolute bottom-4 left-4 right-4">
                <a 
                  href={buttonLink || '#'} 
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-white backdrop-blur-sm transition-all hover:scale-105"
                  style={{ backgroundColor: brandColor }}
                >
                  {buttonText}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>
              </div>
            )}
          </div>

          {/* Stats Cards Grid */}
          <div className="grid grid-cols-2 gap-4">
            {(stats ?? []).slice(0, 4).map((stat, idx) => (
              <div 
                key={idx} 
                className="rounded-xl p-5 flex flex-col justify-center text-center transition-all hover:scale-[1.02]"
                style={{ 
                  backgroundColor: idx === 0 ? brandColor : `${brandColor}${10 + idx * 5}`,
                  color: idx === 0 ? 'white' : 'inherit'
                }}
              >
                <span className={`text-3xl md:text-4xl font-bold mb-1 ${idx === 0 ? 'text-white' : ''}`} style={idx !== 0 ? { color: brandColor } : {}}>
                  {stat.value || '0'}
                </span>
                <span className={`text-sm font-medium ${idx === 0 ? 'text-white/80' : 'text-slate-600'}`}>
                  {stat.label || ''}
                </span>
              </div>
            ))}
            {/* Fill empty slots if less than 4 stats */}
            {(stats ?? []).length < 4 && Array.from({ length: 4 - (stats ?? []).length }).map((_, idx) => (
              <div 
                key={`empty-${idx}`} 
                className="rounded-xl p-5 flex items-center justify-center"
                style={{ backgroundColor: `${brandColor}08` }}
              >
                <span className="text-slate-300 text-sm">+</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ============ SERVICES SECTION ============
// Professional Services UI/UX - 6 Variants: Elegant Grid, Modern List, Big Number, Cards, Carousel, Timeline
type ServicesStyle = 'elegantGrid' | 'modernList' | 'bigNumber' | 'cards' | 'carousel' | 'timeline';

// Dynamic Icon for Services
const ServiceIconRenderer = ({ name, size = 24, style }: { name?: string; size?: number; style?: React.CSSProperties }) => {
  const icons: Record<string, React.ComponentType<{ size?: number; style?: React.CSSProperties }>> = {
    Briefcase, Shield, Package, Star, Users, Phone, Target, Zap, Globe, Rocket, Settings, Layers, Cpu, Clock, MapPin, Mail, Building2, Check
  };
  const IconComponent = icons[name || 'Star'] || Star;
  return <IconComponent size={size} style={style} />;
};

function ServicesSection({ config, brandColor, title }: { config: Record<string, unknown>; brandColor: string; title: string }) {
  const items = (config.items as Array<{ icon?: string; title: string; description: string }>) || [];
  const style = (config.style as ServicesStyle) || 'elegantGrid';

  // Empty state
  if (items.length === 0) {
    return (
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: `${brandColor}10` }}>
            <Briefcase size={32} style={{ color: brandColor }} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">{title || 'Dịch vụ'}</h2>
          <p className="text-slate-500">Chưa có dịch vụ nào</p>
        </div>
      </section>
    );
  }

  const MAX_VISIBLE = 6;
  const visibleItems = items.slice(0, MAX_VISIBLE);
  const remainingCount = Math.max(0, items.length - MAX_VISIBLE);

  // Style 1: Elegant Grid - Clean cards with top accent line
  if (style === 'elegantGrid') {
    return (
      <section className="py-12 md:py-16 px-4">
        <div className="max-w-6xl mx-auto space-y-10">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-4">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
              {title}
            </h2>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item, idx) => (
              <div 
                key={idx} 
                className="bg-white p-6 pt-8 rounded-xl shadow-sm border border-slate-200/60 relative overflow-hidden"
              >
                {/* Top Accent Line with gradient */}
                <div 
                  className="absolute top-0 left-0 right-0 h-1.5 w-full"
                  style={{ background: `linear-gradient(to right, ${brandColor}66, ${brandColor})` }}
                />
                
                <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-2 tracking-tight">
                  {item.title}
                </h3>
                <p className="text-slate-500 leading-relaxed text-sm">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Style 2: Modern List - Clean horizontal layout
  if (style === 'modernList') {
    return (
      <section className="py-10 md:py-12 px-4">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Header */}
          <div className="border-b border-slate-200 pb-3">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
              {title}
            </h2>
          </div>

          {/* List */}
          <div className="space-y-0">
            {items.map((item, idx) => (
              <div 
                key={idx}
                className="flex items-baseline gap-3 md:gap-5 py-4 border-b border-slate-100 last:border-b-0"
              >
                {/* Number */}
                <span 
                  className="text-2xl md:text-3xl font-bold tabular-nums flex-shrink-0 w-10 md:w-12"
                  style={{ color: brandColor }}
                >
                  {String(idx + 1).padStart(2, '0')}
                </span>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-base md:text-lg font-semibold text-slate-900 mb-0.5">
                    {item.title}
                  </h3>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Style 3: Big Number Tiles
  if (style === 'bigNumber') {
    return (
      <section className="py-12 md:py-16 px-4">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-4">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-slate-900">{title}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {visibleItems.map((item, idx) => {
              const isHighlighted = idx === 1;
              return (
                <div key={idx} className={`relative overflow-hidden rounded-xl p-6 min-h-[180px] flex flex-col justify-end border ${isHighlighted ? 'text-white border-transparent' : 'bg-slate-100/50 text-slate-900 border-slate-200/50'}`}
                  style={isHighlighted ? { backgroundColor: brandColor } : {}}>
                  <span className={`absolute -top-6 -right-3 text-[8rem] font-black leading-none select-none pointer-events-none ${isHighlighted ? 'text-white opacity-[0.15]' : 'text-slate-900 opacity-[0.07]'}`}>{idx + 1}</span>
                  <div className="relative z-10 space-y-2">
                    <div className="w-6 h-1 mb-3 opacity-50 rounded-full" style={{ backgroundColor: isHighlighted ? 'white' : brandColor }} />
                    <h3 className="text-lg md:text-xl font-bold tracking-tight">{item.title || 'Tiêu đề'}</h3>
                    <p className={`text-sm leading-relaxed ${isHighlighted ? 'text-white/90' : 'text-slate-500'}`}>{item.description || 'Mô tả...'}</p>
                  </div>
                </div>
              );
            })}
            {remainingCount > 0 && (
              <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 min-h-[180px]" style={{ borderColor: `${brandColor}30` }}>
                <span className="text-2xl font-bold" style={{ color: brandColor }}>+{remainingCount}</span>
                <span className="text-sm text-slate-500">dịch vụ khác</span>
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }

  // Style 4: Icon Cards - Cards with prominent icon
  if (style === 'cards') {
    if (items.length <= 2) {
      return (
        <section className="py-12 md:py-16 px-4">
          <div className="max-w-4xl mx-auto space-y-8">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 text-center">{title}</h2>
            <div className={`mx-auto flex justify-center gap-6 ${items.length === 1 ? 'max-w-sm' : 'max-w-2xl'}`}>
              {items.map((item, idx) => (
                <div key={idx} className="flex-1 bg-white rounded-2xl p-6 border shadow-sm" style={{ borderColor: `${brandColor}15` }}>
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: `${brandColor}10` }}>
                    <ServiceIconRenderer name={item.icon} size={28} style={{ color: brandColor }} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title || 'Tiêu đề'}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{item.description || 'Mô tả...'}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      );
    }
    return (
      <section className="py-12 md:py-16 px-4">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider" style={{ backgroundColor: `${brandColor}15`, color: brandColor }}>Dịch vụ</span>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900">{title}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleItems.map((item, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-6 border shadow-sm transition-shadow hover:shadow-md" style={{ borderColor: `${brandColor}15` }}>
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: `${brandColor}10` }}>
                  <ServiceIconRenderer name={item.icon} size={28} style={{ color: brandColor }} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title || 'Tiêu đề'}</h3>
                <p className="text-sm text-slate-500 leading-relaxed line-clamp-2">{item.description || 'Mô tả...'}</p>
              </div>
            ))}
            {remainingCount > 0 && (
              <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6" style={{ borderColor: `${brandColor}30` }}>
                <span className="text-2xl font-bold" style={{ color: brandColor }}>+{remainingCount}</span>
                <span className="text-sm text-slate-500">dịch vụ khác</span>
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }

  // Style 5: Carousel - Horizontal cards layout
  if (style === 'carousel') {
    return (
      <section className="py-12 md:py-16 px-4">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="border-b border-slate-200 pb-4">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">{title}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {visibleItems.map((item, idx) => (
              <div key={idx} className="bg-white rounded-xl overflow-hidden border shadow-sm" style={{ borderColor: `${brandColor}15` }}>
                <div className="h-2 w-full" style={{ background: `linear-gradient(to right, ${brandColor}66, ${brandColor})` }} />
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${brandColor}10` }}>
                      <ServiceIconRenderer name={item.icon} size={24} style={{ color: brandColor }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-900 mb-1">{item.title || 'Tiêu đề'}</h3>
                      <p className="text-sm text-slate-500 line-clamp-2">{item.description || 'Mô tả...'}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Style 6: Timeline - Vertical timeline layout
  if (style === 'timeline') {
    return (
      <section className="py-12 md:py-16 px-4">
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900">{title}</h2>
          </div>
          <div className="relative">
            <div className="absolute left-4 md:left-1/2 md:-translate-x-px top-0 bottom-0 w-0.5" style={{ backgroundColor: `${brandColor}20` }} />
            <div className="space-y-8">
              {visibleItems.map((item, idx) => (
                <div key={idx} className={`relative flex ${idx % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                  <div className="absolute left-4 md:left-1/2 md:-translate-x-1/2 w-10 h-10 rounded-full border-4 bg-white flex items-center justify-center z-10" style={{ borderColor: brandColor }}>
                    <ServiceIconRenderer name={item.icon} size={18} style={{ color: brandColor }} />
                  </div>
                  <div className={`ml-20 md:ml-0 md:w-5/12 bg-white rounded-xl p-5 border shadow-sm ${idx % 2 === 0 ? 'md:mr-auto md:ml-8' : 'md:ml-auto md:mr-8'}`} style={{ borderColor: `${brandColor}15` }}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-bold tabular-nums" style={{ color: brandColor }}>{String(idx + 1).padStart(2, '0')}</span>
                      <h3 className="font-bold text-slate-900">{item.title || 'Tiêu đề'}</h3>
                    </div>
                    <p className="text-sm text-slate-500">{item.description || 'Mô tả...'}</p>
                  </div>
                </div>
              ))}
              {remainingCount > 0 && (
                <div className="relative flex">
                  <div className="absolute left-4 md:left-1/2 md:-translate-x-1/2 w-10 h-10 rounded-full border-2 border-dashed bg-white flex items-center justify-center z-10" style={{ borderColor: `${brandColor}40` }}>
                    <span className="text-xs font-bold" style={{ color: brandColor }}>+{remainingCount}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Default fallback - elegantGrid
  return (
    <section className="py-12 md:py-16 px-4">
      <div className="max-w-6xl mx-auto space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-slate-900">{title}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item, idx) => (
            <div key={idx} className="bg-white p-6 pt-8 rounded-xl shadow-sm border border-slate-200/60 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 w-full" style={{ background: `linear-gradient(to right, ${brandColor}66, ${brandColor})` }} />
              <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-2 tracking-tight">{item.title || 'Tiêu đề'}</h3>
              <p className="text-slate-500 leading-relaxed text-sm">{item.description || 'Mô tả...'}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============ BENEFITS SECTION ============
// 6 Professional Styles: Solid Cards, Accent List, Bold Bento, Icon Row, Carousel, Timeline
type BenefitsStyle = 'cards' | 'list' | 'bento' | 'row' | 'carousel' | 'timeline';
function BenefitsSection({ config, brandColor, title }: { config: Record<string, unknown>; brandColor: string; title: string }) {
  const items = (config.items as Array<{ icon?: string; title: string; description: string }>) || [];
  const style = (config.style as BenefitsStyle) || 'cards';
  const subHeading = (config.subHeading as string) || 'Vì sao chọn chúng tôi?';
  const heading = (config.heading as string) || title;
  const buttonText = (config.buttonText as string) || '';
  const buttonLink = (config.buttonLink as string) || '';

  // Empty state
  if (items.length === 0) {
    return (
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: `${brandColor}10` }}>
            <Check size={32} style={{ color: brandColor }} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">{title || 'Lợi ích'}</h2>
          <p className="text-slate-500">Chưa có lợi ích nào</p>
        </div>
      </section>
    );
  }

  // Reusable Header
  const BenefitsHeader = () => (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b-2" style={{ borderColor: `${brandColor}20` }}>
      <div className="space-y-2">
        <div className="inline-block px-3 py-1 rounded text-xs font-bold uppercase tracking-wider" style={{ backgroundColor: `${brandColor}15`, color: brandColor }}>
          {subHeading}
        </div>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">{heading}</h2>
      </div>
    </div>
  );

  // Style 1: Solid Cards - Corporate style với icon đậm màu chủ đạo
  if (style === 'cards') {
    return (
      <section className="py-12 md:py-16 px-4">
        <div className="max-w-6xl mx-auto space-y-8">
          <BenefitsHeader />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {items.map((item, idx) => (
              <div key={idx} className="rounded-xl p-5 md:p-6 shadow-sm flex flex-col items-start border" style={{ backgroundColor: `${brandColor}08`, borderColor: `${brandColor}20` }}>
                <div className="w-11 h-11 md:w-12 md:h-12 rounded-lg flex items-center justify-center mb-4 text-white" style={{ backgroundColor: brandColor, boxShadow: `0 4px 6px -1px ${brandColor}30` }}>
                  <Check size={18} strokeWidth={3} />
                </div>
                <h3 className="font-bold text-base md:text-lg mb-2 line-clamp-2" style={{ color: brandColor }}>{item.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed line-clamp-3 min-h-[3.75rem]">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Style 2: Accent List - Thanh màu bên trái nhấn mạnh
  if (style === 'list') {
    return (
      <section className="py-12 md:py-16 px-4">
        <div className="max-w-5xl mx-auto space-y-6">
          <BenefitsHeader />
          <div className="flex flex-col gap-3">
            {items.map((item, idx) => (
              <div key={idx} className="relative bg-white border border-slate-200/60 rounded-lg p-4 md:p-5 pl-5 md:pl-6 overflow-hidden shadow-sm">
                <div className="absolute top-0 bottom-0 left-0 w-1.5" style={{ backgroundColor: brandColor }} />
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-3">
                  <div className="flex items-start gap-3 md:gap-4">
                    <div className="flex-shrink-0 mt-0.5">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center border" style={{ backgroundColor: `${brandColor}15`, borderColor: `${brandColor}30` }}>
                        <span className="text-[11px] font-bold" style={{ color: brandColor }}>{idx + 1}</span>
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-slate-900 text-sm md:text-base line-clamp-1">{item.title}</h3>
                      <p className="text-xs md:text-sm text-slate-500 mt-1 md:mt-1.5 leading-normal line-clamp-2">{item.description}</p>
                    </div>
                  </div>
                  <div className="hidden md:block flex-shrink-0">
                    <svg className="w-[18px] h-[18px] opacity-60" style={{ color: brandColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Style 3: Bold Bento - Typography focused với layout 2-1 / 1-2
  if (style === 'bento') {
    return (
      <section className="py-12 md:py-16 px-4">
        <div className="max-w-6xl mx-auto space-y-8">
          <BenefitsHeader />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
            {items.slice(0, 4).map((item, idx) => {
              const isWide = idx === 0 || idx === 3;
              const isPrimary = idx === 0;
              return (
                <div key={idx} className={`flex flex-col justify-between p-5 md:p-6 lg:p-8 rounded-2xl transition-colors min-h-[160px] md:min-h-[180px] ${isWide ? 'md:col-span-2' : 'md:col-span-1'} ${isPrimary ? 'text-white border border-transparent' : 'bg-white border border-slate-200/60'}`} style={isPrimary ? { backgroundColor: brandColor, boxShadow: `0 10px 15px -3px ${brandColor}30` } : {}}>
                  <div className="flex justify-between items-start mb-3 md:mb-4">
                    <span className={`text-xs font-bold uppercase tracking-widest px-2 py-1 rounded ${isPrimary ? 'bg-white/20 text-white' : ''}`} style={!isPrimary ? { backgroundColor: `${brandColor}15`, color: brandColor } : {}}>
                      0{idx + 1}
                    </span>
                  </div>
                  <div>
                    <h3 className={`font-bold text-lg md:text-xl lg:text-2xl mb-2 md:mb-3 tracking-tight line-clamp-2 ${isPrimary ? 'text-white' : 'text-slate-900'}`}>{item.title}</h3>
                    <p className={`text-sm md:text-base leading-relaxed font-medium line-clamp-3 ${isPrimary ? 'text-white/90' : 'text-slate-500'}`}>{item.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    );
  }

  // Style 4: Icon Row - Horizontal layout với dividers
  if (style === 'row') {
    return (
      <section className="py-12 md:py-16 px-4">
        <div className="max-w-6xl mx-auto space-y-8">
          <BenefitsHeader />
          <div className="bg-white border-y-2 rounded-lg overflow-hidden" style={{ borderColor: `${brandColor}15` }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x" style={{ borderColor: `${brandColor}15` }}>
              {items.slice(0, 4).map((item, idx) => (
                <div key={idx} className="p-5 md:p-6 lg:p-8 flex flex-col items-center text-center">
                  <div className="mb-3 md:mb-4 p-3 rounded-full" style={{ backgroundColor: `${brandColor}15`, color: brandColor, boxShadow: `0 0 0 4px ${brandColor}08` }}>
                    <Check size={22} strokeWidth={3} />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-1.5 md:mb-2 text-sm md:text-base line-clamp-2 min-h-[2.5rem]">{item.title}</h3>
                  <p className="text-xs md:text-sm text-slate-500 leading-relaxed line-clamp-3">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Style 5: Carousel - Horizontal scroll với navigation arrows
  if (style === 'carousel') {
    const scrollRef = React.useRef<HTMLDivElement>(null);
    const scroll = (direction: 'left' | 'right') => {
      if (!scrollRef.current) return;
      const cardWidth = 320 + 16; // card width + gap
      scrollRef.current.scrollBy({ left: direction === 'left' ? -cardWidth : cardWidth, behavior: 'smooth' });
    };
    return (
      <section className="py-12 md:py-16 px-4">
        <div className="max-w-6xl mx-auto space-y-8">
          <BenefitsHeader />
          <div className="relative group">
            {/* Navigation Arrows */}
            <button
              onClick={() => scroll('left')}
              className="absolute -left-2 md:-left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-lg border flex items-center justify-center transition-all hover:scale-110 opacity-0 group-hover:opacity-100"
              style={{ borderColor: `${brandColor}20` }}
            >
              <ChevronLeft size={20} style={{ color: brandColor }} />
            </button>
            <button
              onClick={() => scroll('right')}
              className="absolute -right-2 md:-right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-lg border flex items-center justify-center transition-all hover:scale-110 opacity-0 group-hover:opacity-100"
              style={{ borderColor: `${brandColor}20` }}
            >
              <ChevronRight size={20} style={{ color: brandColor }} />
            </button>
            {/* Carousel Container - hidden scrollbar */}
            <div 
              ref={scrollRef}
              className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              <style>{`.benefits-carousel::-webkit-scrollbar { display: none; }`}</style>
              {items.map((item, idx) => (
                <div 
                  key={idx} 
                  className="w-[280px] md:w-[320px] flex-shrink-0 snap-start rounded-xl p-5 md:p-6 border shadow-sm"
                  style={{ backgroundColor: idx === 0 ? brandColor : `${brandColor}08`, borderColor: `${brandColor}20` }}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${idx === 0 ? 'bg-white/20' : ''}`} style={idx !== 0 ? { backgroundColor: brandColor } : {}}>
                    <Check size={18} strokeWidth={3} className="text-white" />
                  </div>
                  <h3 className={`font-bold text-base mb-2 line-clamp-2 ${idx === 0 ? 'text-white' : ''}`} style={idx !== 0 ? { color: brandColor } : {}}>{item.title}</h3>
                  <p className={`text-sm leading-relaxed line-clamp-3 ${idx === 0 ? 'text-white/80' : 'text-slate-500'}`}>{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Style 6: Timeline - Vertical timeline với milestones (default)
  return (
    <section className="py-12 md:py-16 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        <BenefitsHeader />
        <div className="relative">
          <div className="absolute left-4 md:left-1/2 md:-translate-x-px top-0 bottom-0 w-0.5" style={{ backgroundColor: `${brandColor}20` }} />
          <div className="space-y-6 md:space-y-8">
            {items.map((item, idx) => (
              <div key={idx} className={`relative flex items-start pl-12 md:pl-0 ${idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                <div className="absolute left-0 md:left-1/2 md:-translate-x-1/2 w-8 h-8 rounded-full border-4 bg-white flex items-center justify-center text-xs font-bold z-10" style={{ borderColor: brandColor, color: brandColor }}>
                  {idx + 1}
                </div>
                <div className="bg-white rounded-xl p-4 md:p-5 border shadow-sm w-full md:w-5/12" style={{ borderColor: `${brandColor}15` }}>
                  <h3 className="font-bold text-slate-900 mb-2 line-clamp-2" style={{ color: brandColor }}>{item.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed line-clamp-3">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        {buttonText && (
          <div className="text-center">
            <a href={buttonLink || '#'} className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium text-white" style={{ backgroundColor: brandColor }}>
              {buttonText}
              <ArrowRight size={16} />
            </a>
          </div>
        )}
      </div>
    </section>
  );
}

// ============ FAQ SECTION ============
// ============ FAQ SECTION ============
// 6 Styles: accordion, cards, two-column, minimal, timeline, tabbed
// Best Practices: ARIA, keyboard nav, brandColor hover, responsive, SEO schema, touch targets
type FaqStyle = 'accordion' | 'cards' | 'two-column' | 'minimal' | 'timeline' | 'tabbed';
function FAQSection({ config, brandColor, title }: { config: Record<string, unknown>; brandColor: string; title: string }) {
  const items = (config.items as Array<{ question: string; answer: string }>) || [];
  const style = (config.style as FaqStyle) || 'accordion';
  const description = (config.description as string) || '';
  const buttonText = (config.buttonText as string) || '';
  const buttonLink = (config.buttonLink as string) || '';
  const [openIndex, setOpenIndex] = React.useState<number | null>(0);
  const [activeTab, setActiveTab] = React.useState(0);

  // Empty state
  if (items.length === 0) {
    return (
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: `${brandColor}10` }}>
            <HelpCircle size={32} style={{ color: brandColor }} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">{title || 'Câu hỏi thường gặp'}</h2>
          <p className="text-slate-500">Chưa có câu hỏi nào</p>
        </div>
      </section>
    );
  }

  // FAQ Schema for SEO
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": items.map(item => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.answer
      }
    }))
  };

  // Style 1: Accordion - with ARIA, keyboard nav, brandColor monochromatic
  if (style === 'accordion') {
    return (
      <section className="py-12 md:py-16 px-4">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12 text-slate-900">{title}</h2>
          <div className="space-y-3" role="region" aria-label="Câu hỏi thường gặp">
            {items.map((item, idx) => {
              const isOpen = openIndex === idx;
              const panelId = `faq-panel-${idx}`;
              const buttonId = `faq-button-${idx}`;
              return (
                <div 
                  key={idx} 
                  className="rounded-xl overflow-hidden transition-all"
                  style={{ 
                    border: `1px solid ${isOpen ? brandColor + '40' : brandColor + '15'}`,
                    boxShadow: isOpen ? `0 4px 12px ${brandColor}10` : 'none'
                  }}
                >
                  <button
                    id={buttonId}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                    onKeyDown={(e) => {
                      if (e.key === 'ArrowDown') { e.preventDefault(); setOpenIndex(Math.min((openIndex ?? -1) + 1, items.length - 1)); }
                      if (e.key === 'ArrowUp') { e.preventDefault(); setOpenIndex(Math.max((openIndex ?? 1) - 1, 0)); }
                    }}
                    className={`w-full px-5 py-4 md:px-6 md:py-5 min-h-[44px] text-left flex items-center justify-between font-medium text-slate-900 transition-colors ${isOpen ? 'bg-slate-50' : 'hover:bg-slate-50'}`}
                  >
                    <span className="pr-4">{item.question || 'Câu hỏi'}</span>
                    <svg 
                      className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
                      style={{ color: brandColor }}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div 
                    id={panelId}
                    role="region"
                    aria-labelledby={buttonId}
                    className={`overflow-hidden transition-all duration-200 ${isOpen ? 'max-h-[500px]' : 'max-h-0'}`}
                  >
                    <div className="px-5 py-4 md:px-6 md:py-5 bg-slate-50 text-slate-600 border-t leading-relaxed" style={{ borderColor: `${brandColor}15` }}>
                      {item.answer || 'Câu trả lời'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    );
  }

  // Style 2: Cards - with brandColor hover
  if (style === 'cards') {
    return (
      <section className="py-12 md:py-16 px-4">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12 text-slate-900">{title}</h2>
          <div className="grid md:grid-cols-2 gap-4 md:gap-6">
            {items.map((item, idx) => (
              <div 
                key={idx} 
                className="bg-white rounded-xl p-5 md:p-6 transition-all group"
                style={{ 
                  border: `1px solid ${brandColor}15`,
                }}
                onMouseEnter={(e) => { 
                  e.currentTarget.style.borderColor = `${brandColor}40`; 
                  e.currentTarget.style.boxShadow = `0 4px 12px ${brandColor}10`; 
                }}
                onMouseLeave={(e) => { 
                  e.currentTarget.style.borderColor = `${brandColor}15`; 
                  e.currentTarget.style.boxShadow = 'none'; 
                }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold" style={{ backgroundColor: brandColor }}>?</div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold mb-2 text-slate-900 line-clamp-2">{item.question || 'Câu hỏi'}</h4>
                    <p className="text-sm text-slate-500 leading-relaxed line-clamp-3">{item.answer || 'Câu trả lời'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Style 3: Two Column - with configurable CTA
  if (style === 'two-column') {
    return (
      <section className="py-12 md:py-16 px-4">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-5 gap-8 md:gap-12">
            <div className="md:col-span-2">
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-slate-900" style={{ color: brandColor }}>{title}</h2>
              <p className="text-slate-500 mb-6 leading-relaxed">{description || 'Tìm câu trả lời cho các thắc mắc phổ biến của bạn'}</p>
              {buttonText && (
                <a 
                  href={buttonLink || '#'}
                  className="inline-block px-6 py-3 min-h-[44px] rounded-lg text-white font-medium transition-all" 
                  style={{ backgroundColor: brandColor, boxShadow: `0 4px 12px ${brandColor}30` }}
                >
                  {buttonText}
                </a>
              )}
            </div>
            <div className="md:col-span-3 space-y-5">
              {items.map((item, idx) => (
                <div key={idx} className="pb-5" style={{ borderBottom: `1px solid ${brandColor}15` }}>
                  <h4 className="font-semibold mb-2 text-slate-900">{item.question || 'Câu hỏi'}</h4>
                  <p className="text-sm text-slate-500 leading-relaxed">{item.answer || 'Câu trả lời'}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Style 4: Minimal - clean, numbered
  if (style === 'minimal') {
    return (
      <section className="py-12 md:py-16 px-4">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 md:mb-12 text-slate-900">{title}</h2>
          <div className="space-y-6 md:space-y-8">
            {items.map((item, idx) => (
              <div key={idx} className="flex gap-4 md:gap-6">
                <span 
                  className="text-xl md:text-2xl font-bold flex-shrink-0"
                  style={{ color: brandColor }}
                >
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <div className="flex-1">
                  <h4 className="font-semibold mb-2 text-slate-900">{item.question || 'Câu hỏi'}</h4>
                  <p className="text-sm md:text-base text-slate-500 leading-relaxed">{item.answer || 'Câu trả lời'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Style 5: Timeline - vertical connector
  if (style === 'timeline') {
    return (
      <section className="py-12 md:py-16 px-4">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12 text-slate-900">{title}</h2>
          <div className="relative">
            {/* Vertical line */}
            <div 
              className="absolute left-4 md:left-5 top-0 bottom-0 w-0.5"
              style={{ backgroundColor: `${brandColor}20` }}
            />
            <div className="space-y-6 md:space-y-8">
              {items.map((item, idx) => (
                <div key={idx} className="relative pl-12 md:pl-14">
                  {/* Dot */}
                  <div 
                    className="absolute left-2 md:left-3 top-2 w-5 h-5 rounded-full border-4 bg-white"
                    style={{ borderColor: brandColor }}
                  />
                  <div className="rounded-xl p-4 md:p-5" style={{ backgroundColor: `${brandColor}05` }}>
                    <h4 className="font-semibold mb-2 text-slate-900">{item.question || 'Câu hỏi'}</h4>
                    <p className="text-sm text-slate-500 leading-relaxed">{item.answer || 'Câu trả lời'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Style 6: Tabbed
  return (
    <section className="py-12 md:py-16 px-4">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 md:mb-8 text-slate-900">{title}</h2>
        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2" role="tablist">
          {items.slice(0, 6).map((_, idx) => (
            <button
              key={idx}
              role="tab"
              aria-selected={activeTab === idx}
              aria-controls={`tabpanel-${idx}`}
              onClick={() => setActiveTab(idx)}
              className={`px-4 py-2 min-h-[44px] rounded-full text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                activeTab === idx ? 'text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
              style={activeTab === idx ? { backgroundColor: brandColor } : {}}
            >
              Q{idx + 1}
            </button>
          ))}
          {items.length > 6 && (
            <span className="px-3 py-2 text-sm text-slate-400 flex items-center">+{items.length - 6}</span>
          )}
        </div>
        {/* Content */}
        <div 
          id={`tabpanel-${activeTab}`}
          role="tabpanel"
          className="rounded-xl p-6 md:p-8"
          style={{ 
            backgroundColor: `${brandColor}05`,
            border: `1px solid ${brandColor}15`
          }}
        >
          {items[activeTab] && (
            <>
              <h4 className="text-lg md:text-xl font-semibold mb-3 text-slate-900">
                {items[activeTab].question || 'Câu hỏi'}
              </h4>
              <p className="text-slate-600 leading-relaxed">
                {items[activeTab].answer || 'Câu trả lời'}
              </p>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

// ============ CTA SECTION ============
// 6 Styles: banner, centered, split, floating, gradient, minimal
// Best Practices: Clear CTA, Touch-friendly (44px min), Visual hierarchy, Action-oriented text, Box-shadow brandColor
type CTAStyle = 'banner' | 'centered' | 'split' | 'floating' | 'gradient' | 'minimal';
function CTASection({ config, brandColor }: { config: Record<string, unknown>; brandColor: string }) {
  const { title, description, buttonText, buttonLink, secondaryButtonText, secondaryButtonLink, badge, style: ctaStyle } = config as {
    title?: string;
    description?: string;
    buttonText?: string;
    buttonLink?: string;
    secondaryButtonText?: string;
    secondaryButtonLink?: string;
    badge?: string;
    style?: CTAStyle;
  };
  const style = ctaStyle || 'banner';

  // Style 1: Banner (default) - Full width solid background
  if (style === 'banner') {
    return (
      <section className="py-12 md:py-16 px-4" style={{ backgroundColor: brandColor }}>
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
          <div className="text-white text-center md:text-left flex-1 max-w-lg">
            {badge && (
              <span className="inline-block px-3 py-1 mb-3 rounded-full text-xs font-semibold bg-white/20 text-white">
                {badge}
              </span>
            )}
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold mb-2 line-clamp-2">{title || 'Sẵn sàng bắt đầu?'}</h2>
            <p className="opacity-90 line-clamp-2 text-sm md:text-base">{description}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0 w-full sm:w-auto">
            {buttonText && (
              <a 
                href={buttonLink || '#'} 
                className="px-6 py-3 min-h-[44px] bg-white rounded-lg font-medium hover:bg-slate-100 transition-all hover:scale-105 text-center whitespace-nowrap" 
                style={{ color: brandColor, boxShadow: `0 4px 12px ${brandColor}40` }}
              >
                {buttonText}
              </a>
            )}
            {secondaryButtonText && (
              <a 
                href={secondaryButtonLink || '#'} 
                className="px-6 py-3 min-h-[44px] border-2 border-white/50 text-white rounded-lg font-medium hover:bg-white/10 transition-all text-center whitespace-nowrap"
              >
                {secondaryButtonText}
              </a>
            )}
          </div>
        </div>
      </section>
    );
  }

  // Style 2: Centered - Text center với subtle background
  if (style === 'centered') {
    return (
      <section className="py-12 md:py-20 px-4" style={{ backgroundColor: `${brandColor}10` }}>
        <div className="max-w-2xl mx-auto text-center">
          {badge && (
            <span 
              className="inline-block px-3 py-1 mb-4 rounded-full text-xs font-semibold"
              style={{ backgroundColor: `${brandColor}20`, color: brandColor }}
            >
              {badge}
            </span>
          )}
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 line-clamp-2" style={{ color: brandColor }}>{title || 'Sẵn sàng bắt đầu?'}</h2>
          <p className="text-slate-600 text-base md:text-lg mb-8 line-clamp-3">{description}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {buttonText && (
              <a 
                href={buttonLink || '#'} 
                className="px-8 py-3 min-h-[44px] rounded-lg font-medium text-white transition-all hover:scale-105 whitespace-nowrap" 
                style={{ backgroundColor: brandColor, boxShadow: `0 4px 12px ${brandColor}40` }}
              >
                {buttonText}
              </a>
            )}
            {secondaryButtonText && (
              <a 
                href={secondaryButtonLink || '#'} 
                className="px-8 py-3 min-h-[44px] border-2 rounded-lg font-medium transition-all hover:bg-opacity-10 whitespace-nowrap" 
                style={{ borderColor: brandColor, color: brandColor }}
              >
                {secondaryButtonText}
              </a>
            )}
          </div>
        </div>
      </section>
    );
  }

  // Style 3: Split - Card với icon và border accent (khác Banner)
  if (style === 'split') {
    return (
      <section className="py-12 md:py-16 px-4 bg-slate-50 dark:bg-slate-900">
        <div 
          className="max-w-4xl mx-auto bg-white dark:bg-slate-800 rounded-2xl p-6 md:p-8 overflow-hidden border-l-4"
          style={{ borderLeftColor: brandColor, boxShadow: `0 4px 20px ${brandColor}10` }}
        >
          <div className="flex flex-col md:flex-row items-start gap-5">
            {/* Icon */}
            <div 
              className="w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${brandColor}15` }}
            >
              <Rocket size={28} style={{ color: brandColor }} />
            </div>
            
            {/* Content */}
            <div className="flex-1">
              {badge && (
                <span 
                  className="inline-block px-2.5 py-0.5 mb-2 rounded text-xs font-semibold"
                  style={{ backgroundColor: `${brandColor}15`, color: brandColor }}
                >
                  {badge}
                </span>
              )}
              <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white line-clamp-2">{title || 'Sẵn sàng bắt đầu?'}</h2>
              <p className="text-slate-600 dark:text-slate-400 mt-1.5 text-sm md:text-base line-clamp-2">{description}</p>
              
              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 mt-4">
                {buttonText && (
                  <a 
                    href={buttonLink || '#'} 
                    className="px-5 py-2.5 min-h-[44px] rounded-lg font-medium text-white transition-all hover:scale-105 text-center whitespace-nowrap" 
                    style={{ backgroundColor: brandColor, boxShadow: `0 4px 12px ${brandColor}40` }}
                  >
                    {buttonText}
                  </a>
                )}
                {secondaryButtonText && (
                  <a 
                    href={secondaryButtonLink || '#'} 
                    className="px-5 py-2.5 min-h-[44px] border rounded-lg font-medium transition-all hover:bg-slate-50 dark:hover:bg-slate-700 text-center whitespace-nowrap"
                    style={{ borderColor: `${brandColor}30`, color: brandColor }}
                  >
                    {secondaryButtonText}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Style 4: Floating - Card nổi với shadow
  if (style === 'floating') {
    return (
      <section className="py-12 md:py-16 px-4 bg-slate-50 dark:bg-slate-900">
        <div 
          className="max-w-4xl mx-auto bg-white dark:bg-slate-800 rounded-2xl p-6 md:p-8 border overflow-hidden"
          style={{ borderColor: `${brandColor}20`, boxShadow: `0 20px 40px ${brandColor}15` }}
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-5 md:gap-8">
            <div className="text-center md:text-left flex-1 max-w-md">
              {badge && (
                <span 
                  className="inline-flex items-center gap-2 px-3 py-1 mb-3 rounded-full text-xs font-semibold"
                  style={{ backgroundColor: `${brandColor}15`, color: brandColor }}
                >
                  <Zap size={12} />
                  {badge}
                </span>
              )}
              <h2 className="text-lg md:text-2xl font-bold text-slate-900 dark:text-white line-clamp-2">{title || 'Sẵn sàng bắt đầu?'}</h2>
              <p className="text-slate-600 dark:text-slate-400 mt-2 text-sm md:text-base line-clamp-2">{description}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0 w-full md:w-auto">
              {buttonText && (
                <a 
                  href={buttonLink || '#'} 
                  className="px-6 py-3 min-h-[44px] rounded-xl font-medium text-white transition-all hover:scale-105 text-center whitespace-nowrap" 
                  style={{ backgroundColor: brandColor, boxShadow: `0 4px 12px ${brandColor}40` }}
                >
                  {buttonText}
                </a>
              )}
              {secondaryButtonText && (
                <a 
                  href={secondaryButtonLink || '#'} 
                  className="px-6 py-3 min-h-[44px] rounded-xl font-medium transition-all hover:bg-slate-100 dark:hover:bg-slate-700 text-center whitespace-nowrap"
                  style={{ color: brandColor }}
                >
                  {secondaryButtonText}
                </a>
              )}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Style 5: Gradient - Multi-color gradient với decorative elements
  if (style === 'gradient') {
    return (
      <section 
        className="py-12 md:py-20 px-4 relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${brandColor} 0%, ${brandColor}cc 50%, ${brandColor}99 100%)` }}
      >
        {/* Decorative circles */}
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/20 pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-white/10 pointer-events-none" />
        
        <div className="max-w-3xl mx-auto text-center relative z-10">
          {badge && (
            <span className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 rounded-full text-xs font-semibold bg-white/20 text-white backdrop-blur-sm">
              <Star size={12} className="fill-white" />
              {badge}
            </span>
          )}
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white line-clamp-2">{title || 'Sẵn sàng bắt đầu?'}</h2>
          <p className="text-white/90 mt-4 text-sm md:text-lg max-w-xl mx-auto line-clamp-3">{description}</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
            {buttonText && (
              <a 
                href={buttonLink || '#'} 
                className="px-8 py-3 md:py-4 min-h-[44px] bg-white rounded-full font-semibold transition-all hover:scale-105 hover:shadow-xl text-center whitespace-nowrap" 
                style={{ color: brandColor, boxShadow: `0 8px 24px rgba(0,0,0,0.2)` }}
              >
                {buttonText}
              </a>
            )}
            {secondaryButtonText && (
              <a 
                href={secondaryButtonLink || '#'} 
                className="px-8 py-3 md:py-4 min-h-[44px] border-2 border-white text-white rounded-full font-semibold hover:bg-white/10 transition-all text-center whitespace-nowrap"
              >
                {secondaryButtonText}
              </a>
            )}
          </div>
        </div>
      </section>
    );
  }

  // Style 6: Minimal - Clean, simple với accent line
  return (
    <section className="py-10 md:py-12 px-4 border-y" style={{ borderColor: `${brandColor}20` }}>
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-5 md:gap-8">
        <div className="flex items-center gap-4 text-center md:text-left">
          {/* Accent line */}
          <div className="hidden md:block w-1 h-16 rounded-full flex-shrink-0" style={{ backgroundColor: brandColor }} />
          <div>
            <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white line-clamp-1">{title || 'Sẵn sàng bắt đầu?'}</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm md:text-base line-clamp-1">{description}</p>
          </div>
        </div>
        <div className="flex gap-3 flex-shrink-0 w-full md:w-auto">
          {buttonText && (
            <a 
              href={buttonLink || '#'} 
              className="flex-1 md:flex-none px-6 py-3 min-h-[44px] rounded-lg font-medium text-white transition-all hover:scale-105 text-center whitespace-nowrap" 
              style={{ backgroundColor: brandColor, boxShadow: `0 4px 12px ${brandColor}30` }}
            >
              {buttonText}
            </a>
          )}
          {secondaryButtonText && (
            <a 
              href={secondaryButtonLink || '#'} 
              className="flex-1 md:flex-none px-6 py-3 min-h-[44px] border rounded-lg font-medium transition-all hover:bg-slate-50 dark:hover:bg-slate-800 text-center whitespace-nowrap"
              style={{ borderColor: `${brandColor}30`, color: brandColor }}
            >
              {secondaryButtonText}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}

// ============ TESTIMONIALS SECTION ============
// 6 Professional Styles: Cards, Slider, Masonry, Quote, Carousel, Minimal
// Best Practices: Authenticity, Credibility indicators, Diverse formats, Mobile responsive
type TestimonialsStyle = 'cards' | 'slider' | 'masonry' | 'quote' | 'carousel' | 'minimal';
function TestimonialsSection({ config, brandColor, title }: { config: Record<string, unknown>; brandColor: string; title: string }) {
  const items = (config.items as Array<{ name: string; role: string; content: string; rating: number }>) || [];
  const style = (config.style as TestimonialsStyle) || 'cards';
  const [currentSlide, setCurrentSlide] = React.useState(0);

  // Auto slide for slider/quote styles
  React.useEffect(() => {
    if ((style !== 'slider' && style !== 'quote') || items.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % items.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [items.length, style]);

  const renderStars = (rating: number, size: number = 16) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <Star key={star} size={size} className={star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'} />
      ))}
    </div>
  );

  // Empty state
  if (items.length === 0) {
    return (
      <section className="py-16 px-4 bg-slate-50">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4 text-slate-900">{title}</h2>
          <p className="text-slate-500">Chưa có đánh giá nào</p>
        </div>
      </section>
    );
  }

  // Style 1: Cards - Grid layout with equal height
  if (style === 'cards') {
    return (
      <section className="py-16 px-4 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-slate-900">{title}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item, idx) => (
              <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col h-full">
                {renderStars(item.rating)}
                <p className="text-slate-600 my-4 line-clamp-4 flex-1 min-h-[5rem]">"{item.content}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-slate-100 mt-auto">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0" style={{ backgroundColor: brandColor }}>
                    {(item.name || 'U').charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium text-slate-900 truncate">{item.name}</div>
                    <div className="text-sm text-slate-500 truncate">{item.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Style 2: Slider - Single testimonial with navigation
  if (style === 'slider') {
    const current = items[currentSlide] || items[0];
    if (!current) return null;

    return (
      <section className="py-16 md:py-20 px-4 bg-slate-50 relative overflow-hidden">
        <div className="absolute top-8 left-1/2 -translate-x-1/2 text-[120px] md:text-[180px] leading-none font-serif opacity-5 pointer-events-none select-none" style={{ color: brandColor }}>"</div>
        
        <div className="max-w-4xl mx-auto relative">
          <h2 className="text-3xl font-bold text-center mb-12 text-slate-900">{title}</h2>
          
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center relative" style={{ borderTop: `4px solid ${brandColor}` }}>
            <div className="flex justify-center mb-6">{renderStars(current.rating, 18)}</div>
            <p className="text-lg md:text-xl text-slate-700 leading-relaxed mb-8">"{current.content}"</p>
            <div className="flex items-center justify-center gap-4">
              <div className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg flex-shrink-0" style={{ backgroundColor: brandColor }}>
                {(current.name || 'U').charAt(0)}
              </div>
              <div className="text-left">
                <div className="font-semibold text-slate-900">{current.name}</div>
                <div className="text-sm text-slate-500">{current.role}</div>
              </div>
            </div>
          </div>

          {items.length > 1 && (
            <div className="flex items-center justify-center gap-4 mt-8">
              <button 
                onClick={() => setCurrentSlide(prev => prev === 0 ? items.length - 1 : prev - 1)} 
                className="w-10 h-10 min-h-[44px] rounded-full bg-white shadow-md flex items-center justify-center hover:bg-slate-50 hover:scale-105 transition-all"
              >
                <ChevronLeft size={20} />
              </button>
              <div className="flex gap-2">
                {items.map((_, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => setCurrentSlide(idx)} 
                    className={`h-2.5 rounded-full transition-all ${idx === currentSlide ? 'w-8' : 'w-2.5 bg-slate-300 hover:bg-slate-400'}`}
                    style={idx === currentSlide ? { backgroundColor: brandColor } : {}}
                  />
                ))}
              </div>
              <button 
                onClick={() => setCurrentSlide(prev => (prev + 1) % items.length)} 
                className="w-10 h-10 min-h-[44px] rounded-full bg-white shadow-md flex items-center justify-center hover:bg-slate-50 hover:scale-105 transition-all"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>
      </section>
    );
  }

  // Style 3: Masonry - Pinterest-like layout
  if (style === 'masonry') {
    return (
      <section className="py-16 px-4 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-slate-900">{title}</h2>
          <div className="columns-1 md:columns-2 lg:columns-3 gap-6">
            {items.map((item, idx) => (
              <div key={idx} className={`break-inside-avoid mb-6 bg-white rounded-xl p-6 shadow-sm border border-slate-100 ${idx % 2 === 1 ? 'pt-8' : ''}`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0" style={{ backgroundColor: brandColor }}>
                    {(item.name || 'U').charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium text-slate-900 truncate">{item.name}</div>
                    <div className="text-sm text-slate-500 truncate">{item.role}</div>
                  </div>
                </div>
                {renderStars(item.rating)}
                <p className="mt-4 text-slate-600">"{item.content}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Style 4: Quote - Big quote focused, elegant typography
  if (style === 'quote') {
    const current = items[currentSlide] || items[0];
    if (!current) return null;

    return (
      <section className="py-16 md:py-20 px-4" style={{ backgroundColor: `${brandColor}05` }}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8 text-slate-900">{title}</h2>
          
          <div className="text-[80px] md:text-[120px] leading-none font-serif mb-[-30px] md:mb-[-50px] select-none" style={{ color: brandColor }}>"</div>
          
          <blockquote className="text-xl md:text-2xl lg:text-3xl text-slate-800 leading-relaxed font-medium italic">
            {current.content}
          </blockquote>
          
          <div className="mt-10 flex flex-col items-center gap-4">
            <div className="flex justify-center">{renderStars(current.rating, 20)}</div>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold" style={{ backgroundColor: brandColor }}>
                {(current.name || 'U').charAt(0)}
              </div>
              <div className="text-left">
                <div className="font-semibold text-lg text-slate-900">{current.name}</div>
                <div className="text-slate-500">{current.role}</div>
              </div>
            </div>
          </div>
          
          {items.length > 1 && (
            <div className="flex justify-center gap-3 mt-10">
              {items.map((_, idx) => (
                <button 
                  key={idx} 
                  onClick={() => setCurrentSlide(idx)} 
                  className={`w-3 h-3 rounded-full transition-all ${idx === currentSlide ? '' : 'bg-slate-300 hover:bg-slate-400'}`}
                  style={idx === currentSlide ? { backgroundColor: brandColor } : {}}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    );
  }

  // Style 5: Carousel - Horizontal scroll cards
  if (style === 'carousel') {
    return (
      <section className="py-16 px-4 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-slate-900">{title}</h2>
          
          <div className="relative">
            <div 
              className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory" 
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {items.map((item, idx) => (
                <div 
                  key={idx} 
                  className="flex-shrink-0 snap-center w-[320px] md:w-[360px] bg-white rounded-xl p-6 shadow-md border flex flex-col"
                  style={{ borderColor: `${brandColor}15` }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0" style={{ backgroundColor: brandColor }}>
                      {(item.name || 'U').charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-slate-900 truncate">{item.name}</div>
                      <div className="text-sm text-slate-500 truncate">{item.role}</div>
                    </div>
                  </div>
                  {renderStars(item.rating)}
                  <p className="mt-4 text-slate-600 line-clamp-4 flex-1">"{item.content}"</p>
                </div>
              ))}
            </div>
            
            {items.length > 3 && (
              <div className="flex justify-center gap-2 mt-6">
                {items.map((_, idx) => (
                  <div 
                    key={idx} 
                    className="w-2 h-2 rounded-full bg-slate-300"
                    style={idx === 0 ? { backgroundColor: brandColor } : {}}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }

  // Style 6: Minimal - Clean list with accent line
  return (
    <section className="py-16 px-4 bg-slate-50">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12 text-slate-900">{title}</h2>
        <div className="space-y-4">
          {items.map((item, idx) => (
            <div 
              key={idx} 
              className="flex gap-4 p-5 rounded-lg bg-white border-l-4 shadow-sm"
              style={{ borderLeftColor: brandColor }}
            >
              <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0" style={{ backgroundColor: brandColor }}>
                {(item.name || 'U').charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <span className="font-medium text-slate-900">{item.name}</span>
                  <span className="text-slate-400">•</span>
                  <span className="text-sm text-slate-500 truncate">{item.role}</span>
                  <div className="ml-auto">{renderStars(item.rating, 12)}</div>
                </div>
                <p className="text-slate-600 line-clamp-2">"{item.content}"</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============ CONTACT SECTION ============
// 4 Professional Styles from contact-section-showcase: Modern Split, Floating Card, Grid Cards, Elegant Clean
type ContactStyle = 'modern' | 'floating' | 'grid' | 'elegant';
function ContactSection({ config, brandColor, title }: { config: Record<string, unknown>; brandColor: string; title: string }) {
  const { address, phone, email, workingHours, showMap, mapEmbed, style: contactStyle } = config as {
    address?: string;
    phone?: string;
    email?: string;
    workingHours?: string;
    showMap?: boolean;
    mapEmbed?: string;
    style?: ContactStyle;
  };
  const style = contactStyle || 'modern';

  const renderMapOrPlaceholder = (className: string = "w-full h-full") => {
    if (mapEmbed) {
      return <iframe src={mapEmbed} className={`${className} border-0`} loading="lazy" title="Google Map" />;
    }
    return (
      <div className={`${className} bg-slate-100 flex flex-col items-center justify-center text-slate-400`}>
        <MapPin size={32} />
        <span className="text-xs mt-2">Chưa có URL bản đồ</span>
      </div>
    );
  };

  // Style 1: Modern Split - Chia đôi: thông tin bên trái, bản đồ bên phải
  if (style === 'modern') {
    return (
      <section className="py-12 md:py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white border border-slate-200/40 rounded-xl overflow-hidden shadow-sm">
            <div className="flex flex-col lg:flex-row min-h-[450px]">
              {/* Left Content */}
              <div className="lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
                <div className="max-w-md mx-auto w-full">
                  <span className="inline-block py-1 px-3 rounded-full text-xs font-semibold tracking-wide uppercase mb-5" style={{ backgroundColor: `${brandColor}15`, color: brandColor }}>
                    Thông tin liên hệ
                  </span>
                  <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-8 text-slate-900">
                    Kết nối với chúng tôi
                  </h2>

                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 shrink-0 mt-0.5">
                        <MapPin size={18} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-1">Địa chỉ văn phòng</h4>
                        <p className="text-slate-500 text-sm leading-relaxed">{address || '123 Nguyễn Huệ, Q1, TP.HCM'}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 shrink-0 mt-0.5">
                        <Mail size={18} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-1">Email & Điện thoại</h4>
                        <p className="text-slate-500 text-sm">{email || 'contact@example.com'}</p>
                        <p className="text-slate-500 text-sm mt-1">{phone || '1900 1234'}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 shrink-0 mt-0.5">
                        <Clock size={18} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-1">Giờ làm việc</h4>
                        <p className="text-slate-500 text-sm">{workingHours || 'Thứ 2 - Thứ 6: 8:00 - 17:00'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Map */}
              {showMap !== false && (
                <div className="lg:w-1/2 bg-slate-100 relative min-h-[300px] lg:min-h-full border-t lg:border-t-0 lg:border-l border-slate-200">
                  {renderMapOrPlaceholder("absolute inset-0")}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Style 2: Floating Card - Bản đồ nền với card thông tin nổi
  if (style === 'floating') {
    return (
      <section className="py-12 md:py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="relative h-[550px] md:h-[500px] rounded-xl overflow-hidden border border-slate-200 shadow-sm group">
            {/* Background Map */}
            <div className="absolute inset-0">
              {mapEmbed ? (
                <iframe src={mapEmbed} className="w-full h-full border-0 filter grayscale-[30%] group-hover:grayscale-0 transition-all duration-1000" loading="lazy" title="Google Map" />
              ) : (
                <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                  <MapPin size={64} className="text-slate-300" />
                </div>
              )}
            </div>
            
            {/* Floating Card */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center lg:justify-start lg:pl-16 p-4">
              <div className="bg-white/95 backdrop-blur-sm p-7 rounded-xl shadow-lg pointer-events-auto max-w-sm w-full border border-slate-200/50">
                <h2 className="text-xl font-bold mb-6 text-slate-900">Thông tin liên hệ</h2>
                
                <div className="space-y-5">
                  <div className="flex items-start gap-3">
                    <MapPin size={18} className="mt-0.5 shrink-0" style={{ color: brandColor }} />
                    <div>
                      <p className="text-[10px] text-slate-500 font-medium uppercase mb-0.5">Địa chỉ</p>
                      <p className="text-sm font-medium text-slate-900 leading-relaxed">{address || '123 Nguyễn Huệ, Q1, TP.HCM'}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone size={18} className="mt-0.5 shrink-0" style={{ color: brandColor }} />
                    <div>
                      <p className="text-[10px] text-slate-500 font-medium uppercase mb-0.5">Hotline</p>
                      <p className="text-sm font-medium text-slate-900">{phone || '1900 1234'}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Mail size={18} className="mt-0.5 shrink-0" style={{ color: brandColor }} />
                    <div>
                      <p className="text-[10px] text-slate-500 font-medium uppercase mb-0.5">Email</p>
                      <p className="text-sm font-medium text-slate-900">{email || 'contact@example.com'}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock size={18} className="mt-0.5 shrink-0" style={{ color: brandColor }} />
                    <div>
                      <p className="text-[10px] text-slate-500 font-medium uppercase mb-0.5">Giờ làm việc</p>
                      <p className="text-sm font-medium text-slate-900">{workingHours || 'T2-T6: 8:00-17:00'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Style 3: Grid Cards - 3 cards nhỏ + bản đồ phía dưới
  if (style === 'grid') {
    return (
      <section className="py-12 md:py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-slate-50/70 p-6 md:p-8 rounded-xl border border-slate-200/40">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {/* Card 1: Phone */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200/60 flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: `${brandColor}15`, color: brandColor }}>
                  <Phone size={20} />
                </div>
                <h3 className="font-medium text-sm text-slate-500 mb-1">Điện thoại</h3>
                <p className="font-semibold text-slate-900">{phone || '1900 1234'}</p>
              </div>

              {/* Card 2: Email */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200/60 flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: `${brandColor}15`, color: brandColor }}>
                  <Mail size={20} />
                </div>
                <h3 className="font-medium text-sm text-slate-500 mb-1">Email</h3>
                <p className="font-semibold text-slate-900 text-sm">{email || 'contact@example.com'}</p>
              </div>

              {/* Card 3: Working Hours */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200/60 flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: `${brandColor}15`, color: brandColor }}>
                  <Clock size={20} />
                </div>
                <h3 className="font-medium text-sm text-slate-500 mb-1">Giờ làm việc</h3>
                <p className="font-semibold text-slate-900 text-sm">{workingHours || 'T2-T6: 8:00-17:00'}</p>
              </div>
            </div>

            {/* Address + Map */}
            <div className="flex flex-col md:flex-row gap-8 bg-white p-6 rounded-lg border border-slate-200/60">
              <div className="md:w-1/3 flex flex-col justify-center">
                <div className="flex items-start gap-3">
                  <MapPin size={24} className="shrink-0 mt-1" style={{ color: brandColor }} />
                  <div>
                    <h3 className="font-bold text-lg mb-2 text-slate-900">Trụ sở chính</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">{address || '123 Nguyễn Huệ, Q1, TP.HCM'}</p>
                  </div>
                </div>
              </div>
              {showMap !== false && (
                <div className="md:w-2/3 h-64 rounded-md overflow-hidden bg-slate-100">
                  {renderMapOrPlaceholder()}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Style 4: Elegant Clean - Header section + chia đôi info/bản đồ
  return (
    <section className="py-12 md:py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white border border-slate-200/40 rounded-xl shadow-sm overflow-hidden">
          {/* Top Header Section */}
          <div className="bg-slate-50/80 p-8 border-b border-slate-200 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-4" style={{ backgroundColor: `${brandColor}10`, color: brandColor }}>
              <Building2 size={24} />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Văn phòng của chúng tôi</h2>
            <p className="text-slate-500 mt-2 max-w-lg mx-auto">
              Thông tin liên hệ và vị trí bản đồ chính xác.
            </p>
          </div>

          <div className="flex flex-col md:flex-row">
            {/* Left Info List */}
            <div className="md:w-5/12 p-8 space-y-0 divide-y divide-slate-200">
              <div className="py-4 first:pt-0">
                <p className="text-xs font-semibold uppercase text-slate-500 mb-2">Địa chỉ</p>
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="text-slate-600 shrink-0 mt-0.5" />
                  <span className="text-sm font-medium text-slate-900">{address || '123 Nguyễn Huệ, Q1, TP.HCM'}</span>
                </div>
              </div>

              <div className="py-4">
                <p className="text-xs font-semibold uppercase text-slate-500 mb-2">Liên lạc</p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Phone size={18} className="text-slate-600 shrink-0" />
                    <span className="text-sm font-medium text-slate-900">{phone || '1900 1234'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail size={18} className="text-slate-600 shrink-0" />
                    <span className="text-sm font-medium text-slate-900">{email || 'contact@example.com'}</span>
                  </div>
                </div>
              </div>

              <div className="py-4 last:pb-0">
                <p className="text-xs font-semibold uppercase text-slate-500 mb-2">Thời gian</p>
                <div className="flex items-center gap-3">
                  <Clock size={18} className="text-slate-600 shrink-0" />
                  <span className="text-sm font-medium text-slate-900">{workingHours || 'T2-T6: 8:00-17:00'}</span>
                </div>
              </div>
            </div>

            {/* Right Map */}
            {showMap !== false && (
              <div className="md:w-7/12 min-h-[350px] bg-slate-100 relative border-t md:border-t-0 md:border-l border-slate-200">
                {renderMapOrPlaceholder("absolute inset-0")}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// ============ GALLERY/PARTNERS SECTION ============
// Gallery: 6 Professional Styles (Spotlight, Explore, Stories, Grid, Marquee, Masonry)
// Partners: 6 Professional Styles (Grid, Marquee, Mono, Badge, Carousel, Featured)
type GalleryStyle = 'spotlight' | 'explore' | 'stories' | 'grid' | 'marquee' | 'masonry' | 'mono' | 'badge' | 'carousel' | 'featured';

// Auto Scroll Slider Component for Marquee/Mono styles
const AutoScrollSlider = ({ children, speed = 0.5 }: { children: React.ReactNode; speed?: number }) => {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = React.useState(false);

  React.useEffect(() => {
    const scroller = scrollRef.current;
    if (!scroller) return;

    let animationId: number;
    let position = scroller.scrollLeft;

    const step = () => {
      if (!isPaused && scroller) {
        position += speed;
        if (position >= scroller.scrollWidth / 3) {
          position = 0;
        }
        scroller.scrollLeft = position;
      } else if (scroller) {
        position = scroller.scrollLeft;
      }
      animationId = requestAnimationFrame(step);
    };

    animationId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationId);
  }, [isPaused, speed]);

  return (
    <div 
      ref={scrollRef}
      className="flex overflow-x-auto cursor-grab active:cursor-grabbing touch-pan-x"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      <style>{`.no-scrollbar::-webkit-scrollbar { display: none; }`}</style>
      <div className="flex shrink-0 gap-16 items-center px-4">{children}</div>
      <div className="flex shrink-0 gap-16 items-center px-4">{children}</div>
      <div className="flex shrink-0 gap-16 items-center px-4">{children}</div>
    </div>
  );
};

// Lightbox Component for Gallery
const GalleryLightbox = ({ photo, onClose }: { photo: { url: string } | null; onClose: () => void }) => {
  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    if (photo) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEsc);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEsc);
    };
  }, [photo, onClose]);

  if (!photo || !photo.url) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-sm animate-in fade-in duration-200" 
      onClick={onClose}
    >
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 md:top-8 md:right-8 p-2 rounded-full bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition-all z-50"
        aria-label="Close"
      >
        <X size={32} />
      </button>
      <div className="w-full h-full p-4 flex flex-col items-center justify-center" onClick={e => e.stopPropagation()}>
        <img 
          src={photo.url} 
          alt="Lightbox" 
          className="max-h-[90vh] max-w-full object-contain shadow-2xl bg-white p-2 md:p-4 rounded-lg animate-in zoom-in-95 duration-300" 
        />
      </div>
    </div>
  );
};

// ============ TRUST BADGES / CERTIFICATIONS SECTION ============
// 4 Styles: grid, cards, marquee, wall (matching the reference UI)

type TrustBadgesStyle = 'grid' | 'cards' | 'marquee' | 'wall';
type TrustBadgeItem = { url: string; link?: string; name?: string };

// Auto Scroll component for TrustBadges Marquee
const TrustBadgesAutoScroll = ({ children, speed = 0.6 }: { children: React.ReactNode; speed?: number }) => {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = React.useState(false);

  React.useEffect(() => {
    const scroller = scrollRef.current;
    if (!scroller) return;

    let animationId: number;
    let position = scroller.scrollLeft;

    const step = () => {
      if (!isPaused && scroller) {
        position += speed;
        if (position >= scroller.scrollWidth / 2) {
          position = 0;
        }
        scroller.scrollLeft = position;
      } else if (scroller) {
        position = scroller.scrollLeft;
      }
      animationId = requestAnimationFrame(step);
    };

    animationId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationId);
  }, [isPaused, speed]);

  return (
    <div 
      ref={scrollRef}
      className="flex overflow-hidden select-none w-full cursor-grab active:cursor-grabbing"
      style={{ 
        maskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)',
        WebkitMaskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)'
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="flex shrink-0 gap-16 md:gap-20 items-center px-4">{children}</div>
      <div className="flex shrink-0 gap-16 md:gap-20 items-center px-4">{children}</div>
    </div>
  );
};

// Modal Lightbox for viewing certificates
const CertificateModal = ({ 
  item, 
  isOpen, 
  onClose 
}: { 
  item: TrustBadgeItem | null; 
  isOpen: boolean; 
  onClose: () => void;
}) => {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !item || !item.url) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 md:top-8 md:right-8 p-2 rounded-full bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition-all focus:outline-none z-50"
        aria-label="Close modal"
      >
        <X size={32} />
      </button>
      <div 
        className="relative max-w-5xl w-full max-h-[90vh] p-4 flex flex-col items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative w-auto h-auto flex flex-col items-center">
          <img 
            src={item.url} 
            alt={item.name || ''} 
            className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl bg-white p-2 md:p-4 animate-in zoom-in-95 duration-300" 
          />
          {item.name && (
            <p className="mt-4 text-white/90 text-lg md:text-xl font-medium tracking-wide text-center">
              {item.name}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

function TrustBadgesSection({ config, brandColor, title }: { config: Record<string, unknown>; brandColor: string; title: string }) {
  const items = (config.items as TrustBadgeItem[]) || [];
  const style = (config.style as TrustBadgesStyle) || 'cards';
  const [selectedCert, setSelectedCert] = React.useState<TrustBadgeItem | null>(null);

  // Style 1: Square Grid - Grayscale hover to color, clickable to lightbox
  if (style === 'grid') {
    return (
      <section className="w-full py-12 md:py-16 bg-white">
        <div className="container max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold" style={{ color: brandColor }}>{title}</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {items.map((item, idx) => (
              <div 
                key={idx} 
                onClick={() => setSelectedCert(item)}
                className="group relative aspect-square bg-white border border-slate-200 rounded-xl flex items-center justify-center p-6 md:p-8 cursor-zoom-in hover:border-blue-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                {item.url ? (
                  <img 
                    src={item.url} 
                    className="w-full h-full object-contain filter grayscale group-hover:grayscale-0 opacity-70 group-hover:opacity-100 transition-all duration-300" 
                    alt={item.name || ''} 
                  />
                ) : (
                  <ImageIcon size={40} className="text-slate-300" />
                )}
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Maximize2 className="w-5 h-5 text-blue-500" />
                </div>
                {item.name && (
                  <div className="absolute bottom-2 left-2 right-2 text-center">
                    <span className="text-[10px] font-medium text-slate-500 truncate block px-2">{item.name}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        <CertificateModal item={selectedCert} isOpen={!!selectedCert} onClose={() => setSelectedCert(null)} />
      </section>
    );
  }

  // Style 2: Feature Cards - Large cards with title, hover zoom (BEST)
  if (style === 'cards') {
    return (
      <section className="w-full py-12 md:py-16 bg-white">
        <div className="container max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold" style={{ color: brandColor }}>{title}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {items.map((item, idx) => (
              <div 
                key={idx} 
                onClick={() => setSelectedCert(item)}
                className="group relative flex flex-col border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-2xl hover:border-blue-200 transition-all duration-500 cursor-zoom-in h-full"
              >
                <div className="aspect-[5/4] bg-slate-50/50 flex items-center justify-center p-8 md:p-12 relative overflow-hidden">
                  <div className="absolute inset-0 bg-blue-50/0 group-hover:bg-blue-50/30 transition-colors duration-300" />
                  {item.url ? (
                    <img 
                      src={item.url} 
                      className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500 z-10" 
                      alt={item.name || ''} 
                    />
                  ) : (
                    <ImageIcon size={48} className="text-slate-300" />
                  )}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                    <span className="bg-white/90 text-slate-800 px-4 py-2 rounded-full shadow-lg font-medium flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform text-sm">
                      <ZoomIn size={16} /> Xem chi tiết
                    </span>
                  </div>
                </div>
                <div className="py-4 px-5 bg-white border-t border-slate-100 flex items-center justify-between group-hover:bg-slate-50 transition-colors">
                  <span className="font-semibold truncate transition-colors text-sm" style={{ color: brandColor }}>
                    {item.name || 'Chứng nhận'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <CertificateModal item={selectedCert} isOpen={!!selectedCert} onClose={() => setSelectedCert(null)} />
      </section>
    );
  }

  // Style 3: Marquee - Auto scroll slider with tooltip
  if (style === 'marquee') {
    return (
      <section className="w-full py-16 md:py-20 bg-slate-50 border-y border-slate-200">
        <div className="container max-w-7xl mx-auto px-4 mb-10 text-center">
          <h2 className="text-2xl md:text-3xl font-bold" style={{ color: brandColor }}>{title}</h2>
        </div>
        <TrustBadgesAutoScroll speed={0.6}>
          {items.map((item, idx) => (
            <div 
              key={idx} 
              onClick={() => setSelectedCert(item)}
              className="h-28 md:h-36 w-auto flex items-center justify-center px-4 opacity-60 hover:opacity-100 hover:scale-110 transition-all duration-300 cursor-zoom-in relative group"
            >
              {item.url ? (
                <img src={item.url} className="h-full w-auto object-contain max-w-[250px]" alt={item.name || ''} />
              ) : (
                <div className="h-20 w-32 bg-slate-200 rounded flex items-center justify-center">
                  <ImageIcon size={32} className="text-slate-400" />
                </div>
              )}
              {item.name && (
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-black/80 text-white text-xs px-3 py-1.5 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity pointer-events-none">
                  {item.name}
                </div>
              )}
            </div>
          ))}
        </TrustBadgesAutoScroll>
        <CertificateModal item={selectedCert} isOpen={!!selectedCert} onClose={() => setSelectedCert(null)} />
      </section>
    );
  }

  // Style 4: Framed Wall - Certificate frames hanging on wall (default)
  return (
    <section className="w-full py-14 md:py-20 bg-slate-100">
      <div className="container max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold" style={{ color: brandColor }}>{title}</h2>
        </div>
        <div className="flex flex-wrap justify-center gap-6 md:gap-10">
          {items.map((item, idx) => (
            <div 
              key={idx} 
              onClick={() => setSelectedCert(item)}
              className="group relative bg-white p-3 md:p-4 shadow-md rounded-sm border border-slate-200 flex flex-col hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-zoom-in w-40 h-52 md:w-52 md:h-64"
            >
              {/* Hanging Wire */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-1.5 h-12 bg-gradient-to-b from-slate-300 to-transparent opacity-50 z-0"></div>
              <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-slate-300 shadow-inner z-10"></div>
              
              <div className="flex-1 flex items-center justify-center bg-white border border-slate-100 p-4 relative z-10 overflow-hidden">
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors z-20 pointer-events-none"></div>
                {item.url ? (
                  <img src={item.url} className="w-full h-full object-contain" alt={item.name || ''} />
                ) : (
                  <ImageIcon size={32} className="text-slate-300" />
                )}
              </div>
              <div className="h-8 md:h-10 flex items-center justify-center relative z-10">
                <span className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-slate-600 transition-colors text-center truncate px-1">
                  {item.name ? (item.name.length > 20 ? item.name.substring(0, 18) + '...' : item.name) : 'Certificate'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <CertificateModal item={selectedCert} isOpen={!!selectedCert} onClose={() => setSelectedCert(null)} />
    </section>
  );
}

function GallerySection({ config, brandColor, title, type }: { config: Record<string, unknown>; brandColor: string; title: string; type: string }) {
  const items = (config.items as Array<{ url: string; link?: string }>) || [];
  const style = (config.style as GalleryStyle) || (type === 'Gallery' ? 'spotlight' : 'grid');
  const [selectedPhoto, setSelectedPhoto] = React.useState<{ url: string; link?: string } | null>(null);

  // ============ GALLERY STYLES (Spotlight, Explore, Stories) - Only for type === 'Gallery' ============

  // Style 1: Tiêu điểm (Spotlight) - Featured image with 3 smaller
  if (style === 'spotlight' && type === 'Gallery') {
    if (items.length === 0) {
      return (
        <section className="w-full py-12 bg-white">
          <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-[1600px]">
            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
              <ImageIcon size={48} className="opacity-20 mb-4" />
              <p className="text-sm font-light">Chưa có hình ảnh nào.</p>
            </div>
          </div>
        </section>
      );
    }
    const featured = items[0];
    const sub = items.slice(1, 4);

    return (
      <section className="w-full bg-white">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-[1600px] py-8 md:py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-1 bg-slate-200 border border-transparent">
            <div 
              className="md:col-span-2 aspect-[4/3] md:aspect-auto bg-slate-100 relative group cursor-pointer overflow-hidden"
              style={{ minHeight: '300px' }}
              onClick={() => setSelectedPhoto(featured)}
            >
              {featured.url ? (
                <img src={featured.url} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              ) : (
                <div className="w-full h-full flex items-center justify-center"><ImageIcon size={48} className="text-slate-300" /></div>
              )}
            </div>
            <div className="grid grid-cols-3 md:grid-cols-1 gap-1">
              {sub.map((photo, idx) => (
                <div 
                  key={idx} 
                  className="aspect-square bg-slate-100 relative group cursor-pointer overflow-hidden"
                  onClick={() => setSelectedPhoto(photo)}
                >
                  {photo.url ? (
                    <img src={photo.url} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><ImageIcon size={24} className="text-slate-300" /></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        <GalleryLightbox photo={selectedPhoto} onClose={() => setSelectedPhoto(null)} />
      </section>
    );
  }

  // Style 2: Khám phá (Explore) - Instagram-like grid
  if (style === 'explore' && type === 'Gallery') {
    if (items.length === 0) {
      return (
        <section className="w-full py-12 bg-white">
          <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-[1600px]">
            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
              <ImageIcon size={48} className="opacity-20 mb-4" />
              <p className="text-sm font-light">Chưa có hình ảnh nào.</p>
            </div>
          </div>
        </section>
      );
    }

    return (
      <section className="w-full bg-white">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-[1600px] py-8 md:py-12">
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-0.5 bg-slate-200">
            {items.map((photo, idx) => (
              <div 
                key={idx} 
                className="aspect-square relative group cursor-pointer overflow-hidden bg-slate-100"
                onClick={() => setSelectedPhoto(photo)}
              >
                {photo.url ? (
                  <img 
                    src={photo.url} 
                    alt="" 
                    className="w-full h-full object-cover transition-opacity duration-300 hover:opacity-90"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><ImageIcon size={24} className="text-slate-300" /></div>
                )}
              </div>
            ))}
          </div>
        </div>
        <GalleryLightbox photo={selectedPhoto} onClose={() => setSelectedPhoto(null)} />
      </section>
    );
  }

  // Style 3: Câu chuyện (Stories) - Masonry-like with varying sizes
  if (style === 'stories' && type === 'Gallery') {
    if (items.length === 0) {
      return (
        <section className="w-full py-12 bg-white">
          <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-[1600px]">
            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
              <ImageIcon size={48} className="opacity-20 mb-4" />
              <p className="text-sm font-light">Chưa có hình ảnh nào.</p>
            </div>
          </div>
        </section>
      );
    }

    return (
      <section className="w-full bg-white">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-[1600px] py-8 md:py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[250px] md:auto-rows-[350px]">
            {items.map((photo, i) => {
              const isLarge = i % 4 === 0 || i % 4 === 3;
              const colSpan = isLarge ? "md:col-span-2" : "md:col-span-1";
              
              return (
                <div 
                  key={i} 
                  className={`${colSpan} relative group cursor-pointer overflow-hidden rounded-sm`}
                  onClick={() => setSelectedPhoto(photo)}
                >
                  {photo.url ? (
                    <img 
                      src={photo.url} 
                      alt="" 
                      className="w-full h-full object-cover grayscale-[15%] group-hover:grayscale-0 transition-all duration-700"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                      <ImageIcon size={32} className="text-slate-300" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        <GalleryLightbox photo={selectedPhoto} onClose={() => setSelectedPhoto(null)} />
      </section>
    );
  }

  // ============ GALLERY STYLES 4-6 (Grid, Marquee, Masonry) - Only for type === 'Gallery' ============

  // Style 4: Gallery Grid - Clean equal squares grid
  if (style === 'grid' && type === 'Gallery') {
    if (items.length === 0) {
      return (
        <section className="w-full py-12 bg-white">
          <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-[1600px]">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: `${brandColor}10` }}>
                <ImageIcon size={32} style={{ color: brandColor }} />
              </div>
              <h3 className="font-medium text-slate-900 mb-1">Chưa có hình ảnh nào</h3>
              <p className="text-sm text-slate-500">Thêm ảnh đầu tiên để bắt đầu</p>
            </div>
          </div>
        </section>
      );
    }

    return (
      <section className="w-full bg-white">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-[1600px] py-8 md:py-12">
          {title && <h2 className="text-2xl font-bold mb-6" style={{ color: brandColor }}>{title}</h2>}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {items.map((photo, idx) => (
              <div 
                key={idx} 
                className="aspect-square rounded-lg overflow-hidden bg-slate-100 cursor-pointer group relative"
                onClick={() => setSelectedPhoto(photo)}
              >
                {photo.url ? (
                  <img src={photo.url} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><ImageIcon size={28} className="text-slate-300" /></div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
              </div>
            ))}
          </div>
        </div>
        <GalleryLightbox photo={selectedPhoto} onClose={() => setSelectedPhoto(null)} />
      </section>
    );
  }

  // Style 5: Gallery Marquee - Auto scroll horizontal
  if (style === 'marquee' && type === 'Gallery') {
    if (items.length === 0) {
      return (
        <section className="w-full py-12 bg-white">
          <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-[1600px]">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: `${brandColor}10` }}>
                <ImageIcon size={32} style={{ color: brandColor }} />
              </div>
              <h3 className="font-medium text-slate-900 mb-1">Chưa có hình ảnh nào</h3>
              <p className="text-sm text-slate-500">Thêm ảnh đầu tiên để bắt đầu</p>
            </div>
          </div>
        </section>
      );
    }

    return (
      <section className="w-full bg-white py-8 md:py-12">
        {title && <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: brandColor }}>{title}</h2>}
        <div className="w-full relative">
          <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>
          <AutoScrollSlider speed={0.6}>
            {items.map((photo, idx) => (
              <div 
                key={idx} 
                className="shrink-0 h-48 md:h-64 aspect-[4/3] rounded-xl overflow-hidden cursor-pointer group"
                onClick={() => setSelectedPhoto(photo)}
              >
                {photo.url ? (
                  <img src={photo.url} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                    <ImageIcon size={32} className="text-slate-300" />
                  </div>
                )}
              </div>
            ))}
          </AutoScrollSlider>
        </div>
        <GalleryLightbox photo={selectedPhoto} onClose={() => setSelectedPhoto(null)} />
      </section>
    );
  }

  // Style 6: Gallery Masonry - Pinterest-like varying heights
  if (style === 'masonry' && type === 'Gallery') {
    if (items.length === 0) {
      return (
        <section className="w-full py-12 bg-white">
          <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-[1600px]">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: `${brandColor}10` }}>
                <ImageIcon size={32} style={{ color: brandColor }} />
              </div>
              <h3 className="font-medium text-slate-900 mb-1">Chưa có hình ảnh nào</h3>
              <p className="text-sm text-slate-500">Thêm ảnh đầu tiên để bắt đầu</p>
            </div>
          </div>
        </section>
      );
    }

    const heights = ['h-48', 'h-64', 'h-56', 'h-72', 'h-52', 'h-60'];

    return (
      <section className="w-full bg-white">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-[1600px] py-8 md:py-12">
          {title && <h2 className="text-2xl font-bold mb-6" style={{ color: brandColor }}>{title}</h2>}
          <div className="columns-2 md:columns-3 lg:columns-4 gap-3">
            {items.map((photo, idx) => {
              const heightClass = heights[idx % heights.length];
              return (
                <div 
                  key={idx} 
                  className={`mb-3 break-inside-avoid rounded-xl overflow-hidden bg-slate-100 cursor-pointer group relative ${heightClass}`}
                  onClick={() => setSelectedPhoto(photo)}
                >
                  {photo.url ? (
                    <img src={photo.url} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><ImageIcon size={28} className="text-slate-300" /></div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                </div>
              );
            })}
          </div>
        </div>
        <GalleryLightbox photo={selectedPhoto} onClose={() => setSelectedPhoto(null)} />
      </section>
    );
  }

  // ============ PARTNERS STYLES (Grid, Marquee, Mono, Badge) ============

  // Style: Classic Grid - Hover effect, responsive grid
  if (style === 'grid') {
    return (
      <section className="w-full py-10 bg-white border-b border-slate-200/40">
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6 space-y-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 relative pl-4">
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-full" style={{ backgroundColor: brandColor }}></span>
              {title}
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-8 items-center justify-items-center">
            {items.map((item, idx) => (
              <a 
                key={idx} 
                href={item.link || '#'}
                className="w-full flex items-center justify-center p-4 rounded-xl hover:bg-slate-100/50 transition-colors duration-300 cursor-pointer group"
              >
                {item.url ? (
                  <img 
                    src={item.url} 
                    alt="" 
                    className="h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-110" 
                  />
                ) : (
                  <ImageIcon size={40} className="text-slate-300" />
                )}
              </a>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Style: Marquee - Auto scroll, swipeable
  if (style === 'marquee') {
    return (
      <section className="w-full py-10 bg-white border-b border-slate-200/40">
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6 space-y-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 relative pl-4">
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-full" style={{ backgroundColor: brandColor }}></span>
              {title}
            </h2>
          </div>
          <div className="w-full relative group py-8">
            {/* Fade Edges */}
            <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
            <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>
            
            <AutoScrollSlider speed={0.8}>
              {items.map((item, idx) => (
                <a key={idx} href={item.link || '#'} className="shrink-0">
                  {item.url ? (
                    <img 
                      src={item.url} 
                      alt="" 
                      className="h-11 w-auto object-contain hover:scale-110 transition-transform duration-300 select-none" 
                    />
                  ) : (
                    <div className="h-11 w-24 bg-slate-200 rounded flex items-center justify-center">
                      <ImageIcon size={24} className="text-slate-400" />
                    </div>
                  )}
                </a>
              ))}
            </AutoScrollSlider>
          </div>
        </div>
      </section>
    );
  }

  // Style: Mono - Grayscale, hover to color
  if (style === 'mono') {
    return (
      <section className="w-full py-10 bg-white border-b border-slate-200/40">
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6 space-y-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 relative pl-4">
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-full" style={{ backgroundColor: brandColor }}></span>
              {title}
            </h2>
          </div>
          <div className="w-full relative py-6">
            <AutoScrollSlider speed={0.5}>
              {items.map((item, idx) => (
                <a key={idx} href={item.link || '#'} className="shrink-0 group">
                  {item.url ? (
                    <img 
                      src={item.url} 
                      alt="" 
                      className="h-10 w-auto object-contain grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500 select-none" 
                    />
                  ) : (
                    <div className="h-10 w-24 bg-slate-200 rounded flex items-center justify-center opacity-50">
                      <ImageIcon size={22} className="text-slate-400" />
                    </div>
                  )}
                </a>
              ))}
            </AutoScrollSlider>
          </div>
        </div>
      </section>
    );
  }

  // Style: Carousel - Paginated grid with navigation
  if (style === 'carousel') {
    return (
      <section className="w-full py-10 bg-white border-b border-slate-200/40">
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6 space-y-8">
          <div className="flex items-center justify-between gap-6">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 relative pl-4">
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-full" style={{ backgroundColor: brandColor }}></span>
              {title}
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 items-center">
            {items.slice(0, 6).map((item, idx) => (
              <a
                key={idx}
                href={item.link || '#'}
                className="group flex flex-col items-center justify-center p-4 rounded-xl border transition-all aspect-[3/2] hover:shadow-lg"
                style={{ borderColor: `${brandColor}15` }}
              >
                {item.url ? (
                  <img 
                    src={item.url} 
                    alt=""
                    className="h-10 w-auto object-contain grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300" 
                  />
                ) : (
                  <ImageIcon size={36} className="text-slate-300" />
                )}
              </a>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Style: Featured - Large featured + smaller grid
  if (style === 'featured') {
    const featured = items[0];
    const others = items.slice(1, 7);
    
    return (
      <section className="w-full py-10 bg-white border-b border-slate-200/40">
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6 space-y-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 relative pl-4">
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-full" style={{ backgroundColor: brandColor }}></span>
              {title}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Featured Partner */}
            {featured && (
              <a
                href={featured.link || '#'}
                className="group relative md:row-span-2 rounded-2xl border overflow-hidden flex items-center justify-center p-8 aspect-square md:aspect-auto"
                style={{ 
                  borderColor: `${brandColor}20`,
                  background: `linear-gradient(135deg, ${brandColor}08 0%, ${brandColor}03 100%)`
                }}
              >
                <div className="absolute top-3 left-3">
                  <span 
                    className="px-2 py-1 text-[10px] font-bold rounded"
                    style={{ backgroundColor: `${brandColor}15`, color: brandColor }}
                  >
                    ĐỐI TÁC NỔI BẬT
                  </span>
                </div>
                {featured.url ? (
                  <img 
                    src={featured.url} 
                    alt=""
                    className="max-h-24 w-auto object-contain group-hover:scale-110 transition-transform duration-500" 
                  />
                ) : (
                  <ImageIcon size={64} className="text-slate-300" />
                )}
              </a>
            )}
            {/* Other Partners */}
            <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-3">
              {others.map((item, idx) => (
                <a
                  key={idx}
                  href={item.link || '#'}
                  className="group flex items-center justify-center p-4 rounded-xl border transition-all aspect-[3/2] hover:shadow-md"
                  style={{ borderColor: `${brandColor}15` }}
                >
                  {item.url ? (
                    <img 
                      src={item.url} 
                      alt=""
                      className="h-8 w-auto object-contain grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300" 
                    />
                  ) : (
                    <ImageIcon size={28} className="text-slate-300" />
                  )}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Style: Badge - Compact badges with name (default fallback)
  return (
    <section className="w-full py-10 bg-white border-b border-slate-200/40">
      <div className="w-full max-w-7xl mx-auto px-4 md:px-6 space-y-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 relative pl-4">
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-full" style={{ backgroundColor: brandColor }}></span>
            {title}
          </h2>
        </div>
        <div className="w-full flex flex-wrap items-center justify-center gap-3">
          {items.slice(0, 6).map((item, idx) => (
            <a 
              key={idx} 
              href={item.link || '#'}
              className="px-4 py-2 rounded-lg border transition-all flex items-center gap-3 group"
              style={{ 
                backgroundColor: `${brandColor}05`,
                borderColor: `${brandColor}15`
              }}
            >
              {item.url ? (
                <img src={item.url} alt="" className="h-5 w-auto grayscale group-hover:grayscale-0 transition-all" />
              ) : (
                <ImageIcon size={20} className="text-slate-400" />
              )}
              <span className="text-xs font-semibold" style={{ color: `${brandColor}cc` }}>Đối tác {idx + 1}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============ PRICING SECTION ============
type PricingStyle = 'cards' | 'horizontal' | 'minimal';
function PricingSection({ config, brandColor, title }: { config: Record<string, unknown>; brandColor: string; title: string }) {
  const plans = (config.plans as Array<{ name: string; price: string; period: string; features: string[]; isPopular: boolean; buttonText: string; buttonLink: string }>) || [];
  const style = (config.style as PricingStyle) || 'cards';

  // Style: Cards (default)
  if (style === 'cards') {
    return (
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4 text-slate-900">{title}</h2>
          <p className="text-center text-slate-500 mb-12">Chọn gói phù hợp với nhu cầu của bạn</p>
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, idx) => (
              <div
                key={idx}
                className={`bg-white p-6 rounded-xl border-2 relative ${plan.isPopular ? 'shadow-lg scale-105' : ''}`}
                style={{ borderColor: plan.isPopular ? brandColor : '#e2e8f0' }}
              >
                {plan.isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 text-xs font-medium text-white rounded-full" style={{ backgroundColor: brandColor }}>
                    Phổ biến
                  </div>
                )}
                <h3 className="text-lg font-semibold text-center mb-4">{plan.name}</h3>
                <div className="text-center mb-6">
                  <span className="text-3xl font-bold" style={{ color: brandColor }}>{plan.price}đ</span>
                  <span className="text-slate-500">{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((f, fIdx) => (
                    <li key={fIdx} className="flex items-center gap-2 text-sm">
                      <span style={{ color: brandColor }}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <a
                  href={plan.buttonLink || '#'}
                  className={`block w-full py-3 text-center rounded-lg font-medium ${plan.isPopular ? 'text-white' : ''}`}
                  style={plan.isPopular ? { backgroundColor: brandColor } : { border: `2px solid ${brandColor}`, color: brandColor }}
                >
                  {plan.buttonText}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Style: Horizontal
  if (style === 'horizontal') {
    return (
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-slate-900">{title}</h2>
          <div className="space-y-4">
            {plans.map((plan, idx) => (
              <div
                key={idx}
                className="bg-white p-5 rounded-xl border flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                style={{ borderColor: plan.isPopular ? brandColor : '#e2e8f0' }}
              >
                <div className="flex items-center gap-4">
                  <h3 className="font-semibold text-lg">{plan.name}</h3>
                  {plan.isPopular && (
                    <span className="px-2 py-0.5 text-xs font-medium text-white rounded-full" style={{ backgroundColor: brandColor }}>Hot</span>
                  )}
                </div>
                <div className="text-sm text-slate-500">
                  {plan.features.slice(0, 2).join(' • ')}
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xl font-bold" style={{ color: brandColor }}>
                    {plan.price}đ<span className="text-sm font-normal text-slate-500">{plan.period}</span>
                  </span>
                  <a
                    href={plan.buttonLink || '#'}
                    className="px-5 py-2 rounded-lg text-sm text-white font-medium"
                    style={{ backgroundColor: brandColor }}
                  >
                    {plan.buttonText}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Style: Minimal
  return (
    <section className="py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12 text-slate-900">{title}</h2>
        <div className="border rounded-2xl overflow-hidden">
          {plans.map((plan, idx) => (
            <div
              key={idx}
              className={`flex flex-col md:flex-row md:items-center gap-4 p-6 bg-white transition-all ${idx !== plans.length - 1 ? 'border-b' : ''}`}
              style={plan.isPopular ? { backgroundColor: `${brandColor}08` } : {}}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-lg">{plan.name}</h3>
                  {plan.isPopular && (
                    <span className="px-2 py-0.5 text-xs font-medium text-white rounded-full" style={{ backgroundColor: brandColor }}>Phổ biến</span>
                  )}
                </div>
                <p className="text-sm text-slate-500 mt-1">{plan.features.slice(0, 2).join(' • ')}</p>
              </div>
              <div className="flex items-center gap-6">
                <span className="text-2xl font-bold" style={{ color: brandColor }}>
                  {plan.price}đ<span className="text-sm text-slate-500">{plan.period}</span>
                </span>
                <a
                  href={plan.buttonLink || '#'}
                  className={`px-6 py-2.5 rounded-lg text-sm font-medium ${plan.isPopular ? 'text-white shadow-md' : ''}`}
                  style={plan.isPopular ? { backgroundColor: brandColor } : { border: `2px solid ${brandColor}`, color: brandColor }}
                >
                  {plan.buttonText}
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============ CAREER SECTION ============
// 3 Professional Styles: Cards, List, Minimal
type CareerStyle = 'cards' | 'list' | 'minimal';
function CareerSection({ config, brandColor, title }: { config: Record<string, unknown>; brandColor: string; title: string }) {
  const jobs = (config.jobs as Array<{ title: string; department: string; location: string; type: string; salary: string }>) || [];
  const style = (config.style as CareerStyle) || 'cards';

  // Style 1: Cards - Grid layout với hover effects
  if (style === 'cards') {
    return (
      <section className="py-16 px-4 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-slate-900">{title}</h2>
            <p className="text-slate-500 mt-2">Tham gia đội ngũ của chúng tôi</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job, idx) => (
              <div key={idx} className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-lg hover:border-slate-300 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <span className="text-xs font-medium px-3 py-1 rounded-full" style={{ backgroundColor: `${brandColor}15`, color: brandColor }}>
                    {job.department || 'Department'}
                  </span>
                  <span className="text-xs text-slate-500">{job.type || 'Full-time'}</span>
                </div>
                <h3 className="font-semibold text-lg mb-3 text-slate-900">{job.title || 'Vị trí tuyển dụng'}</h3>
                <div className="space-y-2 text-sm text-slate-500 mb-4">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    {job.location || 'Hà Nội'}
                  </div>
                  {job.salary && (
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      {job.salary}
                    </div>
                  )}
                </div>
                <button className="w-full py-2.5 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90" style={{ backgroundColor: brandColor }}>
                  Ứng tuyển ngay
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Style 2: List - Compact horizontal layout
  if (style === 'list') {
    return (
      <section className="py-16 px-4 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-slate-900">{title}</h2>
          </div>
          <div className="space-y-3">
            {jobs.map((job, idx) => (
              <div key={idx} className="bg-white rounded-xl p-5 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-md transition-shadow">
                <div>
                  <h3 className="font-semibold text-slate-900">{job.title || 'Vị trí'}</h3>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500 mt-1">
                    <span>{job.department || 'Department'}</span>
                    <span className="hidden md:inline">•</span>
                    <span>{job.location || 'Location'}</span>
                    <span className="hidden md:inline">•</span>
                    <span>{job.type || 'Full-time'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {job.salary && <span className="text-sm font-medium" style={{ color: brandColor }}>{job.salary}</span>}
                  <button className="px-5 py-2 rounded-lg text-sm font-medium text-white whitespace-nowrap" style={{ backgroundColor: brandColor }}>
                    Ứng tuyển
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Style 3: Minimal - Split layout with sidebar
  return (
    <section className="py-16 px-4" style={{ backgroundColor: `${brandColor}05` }}>
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8 md:gap-12">
          <div className="md:w-1/3 text-center md:text-left">
            <p className="text-sm font-medium mb-2" style={{ color: brandColor }}>TUYỂN DỤNG</p>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">{title}</h2>
            <p className="text-slate-500">Chúng tôi đang tìm kiếm những tài năng mới</p>
          </div>
          <div className="flex-1 space-y-3">
            {jobs.map((job, idx) => (
              <div key={idx} className="bg-white rounded-xl p-5 border border-slate-200 flex items-center justify-between hover:shadow-sm transition-shadow">
                <div>
                  <h3 className="font-medium text-slate-900">{job.title || 'Vị trí'}</h3>
                  <span className="text-sm text-slate-500">{job.location} • {job.type}</span>
                </div>
                <a href="#" className="text-sm font-medium hover:underline" style={{ color: brandColor }}>Chi tiết →</a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ============ CASE STUDY SECTION ============
// 3 Professional Styles: Grid, Featured, List
type CaseStudyStyle = 'grid' | 'featured' | 'list';
function CaseStudySection({ config, brandColor, title }: { config: Record<string, unknown>; brandColor: string; title: string }) {
  const projects = (config.projects as Array<{ title: string; category: string; image: string; description: string; link: string }>) || [];
  const style = (config.style as CaseStudyStyle) || 'grid';

  // Style 1: Grid - 3 columns grid layout
  if (style === 'grid') {
    return (
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-slate-900">{title}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, idx) => (
              <a key={idx} href={project.link || '#'} className="group block bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-slate-100">
                <div className="aspect-video bg-slate-100 overflow-hidden">
                  {project.image ? (
                    <img src={project.image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon size={32} className="text-slate-300" />
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: `${brandColor}15`, color: brandColor }}>
                    {project.category || 'Category'}
                  </span>
                  <h3 className="font-semibold text-slate-900 mt-2 mb-1">{project.title || 'Tên dự án'}</h3>
                  <p className="text-slate-500 text-sm line-clamp-2">{project.description}</p>
                  <span className="text-sm mt-3 inline-block" style={{ color: brandColor }}>Xem chi tiết →</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Style 2: Featured - 1 large + 2 small layout
  if (style === 'featured') {
    const featured = projects[0];
    const others = projects.slice(1, 3);
    
    return (
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-slate-900">{title}</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Featured large card */}
            {featured && (
              <a href={featured.link || '#'} className="group block bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-slate-100 md:row-span-2">
                <div className="aspect-video bg-slate-100 overflow-hidden">
                  {featured.image ? (
                    <img src={featured.image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon size={48} className="text-slate-300" />
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <span className="text-xs font-medium" style={{ color: brandColor }}>{featured.category || 'Category'}</span>
                  <h3 className="text-xl font-bold text-slate-900 mt-1 mb-2">{featured.title || 'Dự án chính'}</h3>
                  <p className="text-slate-500">{featured.description}</p>
                </div>
              </a>
            )}
            
            {/* Other smaller cards */}
            {others.map((project, idx) => (
              <a key={idx} href={project.link || '#'} className="group block bg-white rounded-xl p-5 border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className="w-24 h-24 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {project.image ? (
                    <img src={project.image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <ImageIcon size={24} className="text-slate-300" />
                  )}
                </div>
                <div>
                  <span className="text-xs font-medium" style={{ color: brandColor }}>{project.category || 'Category'}</span>
                  <h4 className="font-semibold text-slate-900 mt-1">{project.title || 'Tên dự án'}</h4>
                  <p className="text-sm text-slate-500 mt-1 line-clamp-1">{project.description}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Style 3: List - Horizontal list layout
  return (
    <section className="py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12 text-slate-900">{title}</h2>
        <div className="space-y-4">
          {projects.map((project, idx) => (
            <a key={idx} href={project.link || '#'} className="group block bg-white rounded-xl overflow-hidden border border-slate-100 flex flex-col md:flex-row md:items-center hover:shadow-md transition-shadow">
              <div className="aspect-video md:aspect-auto md:w-48 md:h-28 bg-slate-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {project.image ? (
                  <img src={project.image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <ImageIcon size={24} className="text-slate-300" />
                )}
              </div>
              <div className="p-5 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: `${brandColor}15`, color: brandColor }}>
                    {project.category || 'Category'}
                  </span>
                </div>
                <h4 className="font-semibold text-slate-900">{project.title || 'Tên dự án'}</h4>
                <p className="text-sm text-slate-500 mt-1">{project.description}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============ SPEED DIAL SECTION ============
// Floating action buttons for quick contact - always visible
type SpeedDialStyle = 'fab' | 'sidebar' | 'pills';

const SpeedDialIcon = ({ name, size = 18 }: { name: string; size?: number }) => {
  const icons: Record<string, React.ReactNode> = {
    'phone': <Phone size={size} />,
    'mail': <Mail size={size} />,
    'message-circle': <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/></svg>,
    'map-pin': <MapPin size={size} />,
    'facebook': <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>,
    'instagram': <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>,
    'youtube': <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>,
    'zalo': <span className="text-[10px] font-bold">Zalo</span>,
    'calendar': <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>,
    'shopping-cart': <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>,
    'headphones': <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"/></svg>,
    'help-circle': <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>,
  };
  return <span className="inline-flex items-center justify-center">{icons[name] || <Phone size={size} />}</span>;
};

function SpeedDialSection({ config, brandColor }: { config: Record<string, unknown>; brandColor: string }) {
  const actions = (config.actions as Array<{ icon: string; label: string; url: string; bgColor: string }>) || [];
  const style = (config.style as SpeedDialStyle) || 'fab';
  const position = (config.position as 'bottom-right' | 'bottom-left') || 'bottom-right';
  const isRight = position !== 'bottom-left';

  if (actions.length === 0) return null;

  // Style 1: FAB - Floating Action Buttons (vertical stack)
  if (style === 'fab') {
    return (
      <div className={`fixed bottom-6 z-50 flex flex-col gap-3 ${isRight ? 'right-6 items-end' : 'left-6 items-start'}`}>
        {actions.map((action, idx) => (
          <a
            key={idx}
            href={action.url || '#'}
            target={action.url?.startsWith('http') ? '_blank' : undefined}
            rel={action.url?.startsWith('http') ? 'noopener noreferrer' : undefined}
            className="group flex items-center gap-3"
          >
            {isRight && action.label && (
              <span className="px-3 py-1.5 bg-slate-900/90 text-white text-sm font-medium rounded-lg shadow-lg opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-200 whitespace-nowrap">
                {action.label}
              </span>
            )}
            <div
              className="w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-white hover:scale-110 hover:shadow-xl transition-all duration-200 cursor-pointer"
              style={{ backgroundColor: action.bgColor || brandColor }}
            >
              <SpeedDialIcon name={action.icon} size={20} />
            </div>
            {!isRight && action.label && (
              <span className="px-3 py-1.5 bg-slate-900/90 text-white text-sm font-medium rounded-lg shadow-lg opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-200 whitespace-nowrap">
                {action.label}
              </span>
            )}
          </a>
        ))}
      </div>
    );
  }

  // Style 2: Sidebar - Vertical bar attached to edge
  if (style === 'sidebar') {
    return (
      <div className={`fixed top-1/2 -translate-y-1/2 z-50 flex flex-col overflow-hidden shadow-xl ${isRight ? 'right-0 rounded-l-xl' : 'left-0 rounded-r-xl'}`}>
        {actions.map((action, idx) => (
          <a
            key={idx}
            href={action.url || '#'}
            target={action.url?.startsWith('http') ? '_blank' : undefined}
            rel={action.url?.startsWith('http') ? 'noopener noreferrer' : undefined}
            className="group relative flex items-center justify-center w-14 h-14 text-white hover:w-36 transition-all duration-200 overflow-hidden"
            style={{ backgroundColor: action.bgColor || brandColor }}
          >
            <div className={`absolute flex items-center gap-3 transition-all duration-200 ${isRight ? 'right-4' : 'left-4'}`}>
              <SpeedDialIcon name={action.icon} size={20} />
            </div>
            {action.label && (
              <span className={`absolute text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${isRight ? 'right-12' : 'left-12'}`}>
                {action.label}
              </span>
            )}
            {idx < actions.length - 1 && (
              <div className="absolute bottom-0 left-3 right-3 h-px bg-white/20" />
            )}
          </a>
        ))}
      </div>
    );
  }

  // Style 3: Pills - Horizontal pills with labels
  return (
    <div className={`fixed bottom-6 z-50 flex flex-col gap-3 ${isRight ? 'right-6 items-end' : 'left-6 items-start'}`}>
      {actions.map((action, idx) => (
        <a
          key={idx}
          href={action.url || '#'}
          target={action.url?.startsWith('http') ? '_blank' : undefined}
          rel={action.url?.startsWith('http') ? 'noopener noreferrer' : undefined}
          className={`flex items-center gap-2.5 pl-4 pr-5 py-2.5 rounded-full shadow-lg text-white hover:shadow-xl hover:scale-[1.02] transition-all duration-200 cursor-pointer ${isRight ? 'flex-row' : 'flex-row-reverse'}`}
          style={{ backgroundColor: action.bgColor || brandColor }}
        >
          <SpeedDialIcon name={action.icon} size={18} />
          {action.label && (
            <span className="text-sm font-medium whitespace-nowrap">
              {action.label}
            </span>
          )}
        </a>
      ))}
    </div>
  );
}

// ============ PRODUCT CATEGORIES SECTION ============
import { getCategoryIcon } from '@/app/admin/components/CategoryImageSelector';

type ProductCategoriesStyle = 'grid' | 'carousel' | 'cards';
function ProductCategoriesSection({ config, brandColor, title }: { config: Record<string, unknown>; brandColor: string; title: string }) {
  const categoriesConfig = (config.categories as Array<{ categoryId: string; customImage?: string; imageMode?: string }>) || [];
  const style = (config.style as ProductCategoriesStyle) || 'grid';
  const showProductCount = (config.showProductCount as boolean) ?? true;
  const columnsDesktop = (config.columnsDesktop as number) || 4;
  const columnsMobile = (config.columnsMobile as number) || 2;
  
  const categoriesData = useQuery(api.productCategories.listActive);
  const productsData = useQuery(api.products.listAll, {});
  
  const categoryMap = React.useMemo(() => {
    const map: Record<string, { name: string; slug: string; image?: string; description?: string }> = {};
    if (categoriesData) {
      for (const cat of categoriesData) {
        map[cat._id] = cat;
      }
    }
    return map;
  }, [categoriesData]);
  
  const productCountMap = React.useMemo(() => {
    const map: Record<string, number> = {};
    if (productsData) {
      for (const p of productsData) {
        map[p.categoryId] = (map[p.categoryId] || 0) + 1;
      }
    }
    return map;
  }, [productsData]);
  
  const resolvedCategories = categoriesConfig
    .map(item => {
      const cat = categoryMap[item.categoryId];
      if (!cat) return null;
      
      const imageMode = item.imageMode || 'default';
      let displayImage = cat.image;
      let displayIcon: string | undefined;
      
      if (imageMode === 'icon' && item.customImage?.startsWith('icon:')) {
        displayIcon = item.customImage.replace('icon:', '');
        displayImage = undefined;
      } else if (imageMode === 'upload' || imageMode === 'url') {
        displayImage = item.customImage || cat.image;
      }
      
      return {
        ...cat,
        id: item.categoryId,
        displayImage,
        displayIcon,
        productCount: productCountMap[item.categoryId] || 0,
      };
    })
    .filter(Boolean) as Array<{ id: string; name: string; slug: string; image?: string; description?: string; displayImage?: string; displayIcon?: string; productCount: number }>;

  if (resolvedCategories.length === 0) return null;

  const getGridCols = () => {
    switch (columnsDesktop) {
      case 3: return 'md:grid-cols-3';
      case 5: return 'md:grid-cols-5';
      case 6: return 'md:grid-cols-6';
      default: return 'md:grid-cols-4';
    }
  };

  const getMobileGridCols = () => {
    return columnsMobile === 3 ? 'grid-cols-3' : 'grid-cols-2';
  };

  // Style 1: Grid
  if (style === 'grid') {
    return (
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">{title}</h2>
          <div className={`grid gap-4 md:gap-6 ${getMobileGridCols()} ${getGridCols()}`}>
            {resolvedCategories.map((cat) => {
              const iconData = cat.displayIcon ? getCategoryIcon(cat.displayIcon) : null;
              return (
                <a 
                  key={cat.id}
                  href={`/danh-muc/${cat.slug}`}
                  className="group relative aspect-square rounded-xl overflow-hidden bg-slate-100"
                >
                  {cat.displayIcon && iconData ? (
                    <div 
                      className="w-full h-full flex items-center justify-center"
                      style={{ backgroundColor: brandColor }}
                    >
                      {React.createElement(iconData.icon, { size: 56, className: 'text-white' })}
                    </div>
                  ) : cat.displayImage ? (
                    <img 
                      src={cat.displayImage} 
                      alt={cat.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package size={48} className="text-slate-300" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5 text-white">
                    <h3 className="font-semibold text-base md:text-lg truncate">{cat.name}</h3>
                    {showProductCount && (
                      <p className="text-sm opacity-80 mt-1">{cat.productCount} sản phẩm</p>
                    )}
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </section>
    );
  }

  // Style 2: Carousel
  if (style === 'carousel') {
    return (
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between px-4 mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">{title}</h2>
            <a 
              href="/danh-muc"
              className="text-sm font-medium flex items-center gap-1 hover:underline"
              style={{ color: brandColor }}
            >
              Xem tất cả
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
          <div className="overflow-x-auto pb-4 px-4 scrollbar-hide">
            <div className="flex gap-4 md:gap-6">
              {resolvedCategories.map((cat) => {
                const iconData = cat.displayIcon ? getCategoryIcon(cat.displayIcon) : null;
                return (
                  <a 
                    key={cat.id}
                    href={`/danh-muc/${cat.slug}`}
                    className="flex-shrink-0 w-36 md:w-48 group cursor-pointer"
                  >
                    <div className="aspect-square rounded-xl overflow-hidden bg-slate-100 mb-3">
                      {cat.displayIcon && iconData ? (
                        <div 
                          className="w-full h-full flex items-center justify-center"
                          style={{ backgroundColor: brandColor }}
                        >
                          {React.createElement(iconData.icon, { size: 48, className: 'text-white' })}
                        </div>
                      ) : cat.displayImage ? (
                        <img 
                          src={cat.displayImage} 
                          alt={cat.name} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package size={40} className="text-slate-300" />
                        </div>
                      )}
                    </div>
                    <h3 className="font-medium text-center truncate">{cat.name}</h3>
                    {showProductCount && (
                      <p className="text-sm text-slate-500 text-center">{cat.productCount} sản phẩm</p>
                    )}
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Style 3: Cards
  return (
    <section className="py-12 md:py-16 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">{title}</h2>
        <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {resolvedCategories.map((cat) => {
            const iconData = cat.displayIcon ? getCategoryIcon(cat.displayIcon) : null;
            return (
              <a 
                key={cat.id}
                href={`/danh-muc/${cat.slug}`}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow flex"
              >
                <div className="w-28 h-28 md:w-36 md:h-36 flex-shrink-0 bg-slate-100">
                  {cat.displayIcon && iconData ? (
                    <div 
                      className="w-full h-full flex items-center justify-center"
                      style={{ backgroundColor: brandColor }}
                    >
                      {React.createElement(iconData.icon, { size: 40, className: 'text-white' })}
                    </div>
                  ) : cat.displayImage ? (
                    <img 
                      src={cat.displayImage} 
                      alt={cat.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package size={40} className="text-slate-300" />
                    </div>
                  )}
                </div>
                <div className="flex-1 p-4 md:p-5 flex flex-col justify-center">
                  <h3 className="font-semibold text-base md:text-lg mb-1">{cat.name}</h3>
                  {cat.description && (
                    <p className="text-sm text-slate-500 line-clamp-2 mb-2">{cat.description}</p>
                  )}
                  <span 
                    className="text-sm font-medium flex items-center gap-1"
                    style={{ color: brandColor }}
                  >
                    {showProductCount && `${cat.productCount} sản phẩm`}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ============ CATEGORY PRODUCTS SECTION ============
// Sản phẩm theo danh mục - Mỗi section là 1 danh mục với các sản phẩm thuộc danh mục đó
type CategoryProductsStyle = 'grid' | 'carousel' | 'cards' | 'bento' | 'magazine' | 'showcase';

function CategoryProductsSection({ config, brandColor, title }: { config: Record<string, unknown>; brandColor: string; title: string }) {
  const sections = (config.sections as Array<{ categoryId: string; itemCount: number }>) || [];
  const style = (config.style as CategoryProductsStyle) || 'grid';
  const showViewAll = (config.showViewAll as boolean) ?? true;
  const columnsDesktop = (config.columnsDesktop as number) || 4;
  const columnsMobile = (config.columnsMobile as number) || 2;

  // Query categories and products
  const categoriesData = useQuery(api.productCategories.listActive);
  const productsData = useQuery(api.products.listAll, { limit: 100 });

  // Resolve sections with category and products data
  const resolvedSections = sections
    .map(section => {
      const category = categoriesData?.find(c => c._id === section.categoryId);
      if (!category) return null;
      
      const products = (productsData || [])
        .filter(p => p.categoryId === section.categoryId)
        .slice(0, section.itemCount);
      
      return {
        ...section,
        category,
        products,
      };
    })
    .filter(Boolean) as Array<{ 
      categoryId: string; 
      itemCount: number;
      category: { _id: string; name: string; slug?: string; image?: string }; 
      products: Array<{ _id: string; name: string; image?: string; price?: number; salePrice?: number; slug?: string }> 
    }>;

  const getGridCols = () => {
    switch (columnsDesktop) {
      case 3: return 'md:grid-cols-3';
      case 5: return 'md:grid-cols-5';
      default: return 'md:grid-cols-4';
    }
  };

  const getMobileGridCols = () => {
    return columnsMobile === 1 ? 'grid-cols-1' : 'grid-cols-2';
  };

  const formatPrice = (price?: number) => {
    if (!price) return '0đ';
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
  };

  // Product Card Component
  const ProductCard = ({ product }: { product: { _id: string; name: string; image?: string; price?: number; salePrice?: number; slug?: string } }) => (
    <a href={`/san-pham/${product.slug || product._id}`} className="group cursor-pointer block">
      <div className="aspect-square rounded-lg overflow-hidden bg-slate-100 mb-2">
        {product.image ? (
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package size={24} className="text-slate-300" />
          </div>
        )}
      </div>
      <h4 className="font-medium text-sm line-clamp-2 mb-1">{product.name}</h4>
      <div className="flex flex-col">
        {product.salePrice && product.salePrice < (product.price || 0) ? (
          <>
            <span className="font-bold text-sm" style={{ color: brandColor }}>
              {formatPrice(product.salePrice)}
            </span>
            <span className="text-xs text-slate-400 line-through">{formatPrice(product.price)}</span>
          </>
        ) : (
          <span className="font-bold text-sm" style={{ color: brandColor }}>
            {formatPrice(product.price)}
          </span>
        )}
      </div>
    </a>
  );

  if (resolvedSections.length === 0) {
    return null;
  }

  // Style 1: Grid
  if (style === 'grid') {
    return (
      <div className="py-8 md:py-12 space-y-10 md:space-y-16">
        {resolvedSections.map((section, idx) => (
          <section key={idx} className="px-4">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl md:text-2xl font-bold">{section.category.name}</h2>
                {showViewAll && (
                  <a 
                    href={`/danh-muc/${section.category.slug || section.category._id}`}
                    className="text-sm font-medium flex items-center gap-1 hover:underline px-3 py-1.5 rounded-lg border transition-colors"
                    style={{ color: brandColor, borderColor: `${brandColor}30` }}
                  >
                    Xem danh mục
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </a>
                )}
              </div>
              
              {section.products.length > 0 ? (
                <div className={`grid gap-4 ${getMobileGridCols()} ${getGridCols()}`}>
                  {section.products.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-lg">
                  <Package size={32} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Chưa có sản phẩm trong danh mục này</p>
                </div>
              )}
            </div>
          </section>
        ))}
      </div>
    );
  }

  // Style 2: Carousel
  if (style === 'carousel') {
    return (
      <div className="py-8 md:py-12 space-y-10 md:space-y-16">
        {resolvedSections.map((section, idx) => (
          <section key={idx}>
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between px-4 mb-6">
                <h2 className="text-xl md:text-2xl font-bold">{section.category.name}</h2>
                {showViewAll && (
                  <a 
                    href={`/danh-muc/${section.category.slug || section.category._id}`}
                    className="text-sm font-medium flex items-center gap-1 hover:underline"
                    style={{ color: brandColor }}
                  >
                    Xem danh mục
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </a>
                )}
              </div>
              
              {section.products.length > 0 ? (
                <div className="overflow-x-auto pb-4 px-4">
                  <div className="flex gap-4">
                    {section.products.map((product) => (
                      <a 
                        key={product._id}
                        href={`/san-pham/${product.slug || product._id}`}
                        className="flex-shrink-0 w-40 md:w-48 group cursor-pointer"
                      >
                        <div className="aspect-square rounded-lg overflow-hidden bg-slate-100 mb-2">
                          {product.image ? (
                            <img 
                              src={product.image} 
                              alt={product.name} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package size={24} className="text-slate-300" />
                            </div>
                          )}
                        </div>
                        <h4 className="font-medium text-sm line-clamp-2 mb-1">{product.name}</h4>
                        <span className="font-bold text-base" style={{ color: brandColor }}>
                          {formatPrice(product.salePrice || product.price)}
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-lg mx-4">
                  <Package size={32} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Chưa có sản phẩm</p>
                </div>
              )}
            </div>
          </section>
        ))}
      </div>
    );
  }

  // Style 3: Cards - Modern cards with category header
  if (style === 'cards') {
    return (
      <div className="py-8 md:py-12 space-y-10 md:space-y-16">
        {resolvedSections.map((section, idx) => (
          <section key={idx} className="px-4">
            <div className="max-w-7xl mx-auto">
              <div 
                className="rounded-xl overflow-hidden"
                style={{ border: `1px solid ${brandColor}20` }}
              >
                {/* Category Header */}
                <div 
                  className="px-4 py-3 flex items-center justify-between"
                  style={{ backgroundColor: `${brandColor}08` }}
                >
                  <div className="flex items-center gap-3">
                    {section.category.image && (
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-white">
                        <img 
                          src={section.category.image} 
                          alt={section.category.name} 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                    )}
                    <h2 className="text-lg font-bold">{section.category.name}</h2>
                  </div>
                  {showViewAll && (
                    <a 
                      href={`/danh-muc/${section.category.slug || section.category._id}`}
                      className="text-sm font-medium flex items-center gap-1 hover:underline px-3 py-1.5 rounded-lg transition-colors"
                      style={{ color: brandColor, backgroundColor: `${brandColor}15` }}
                    >
                      Xem danh mục
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </a>
                  )}
                </div>
                
                {/* Products Grid */}
                <div className="p-4 bg-white">
                  {section.products.length > 0 ? (
                    <div className={`grid gap-4 ${getMobileGridCols()} ${getGridCols()}`}>
                      {section.products.map((product) => (
                        <ProductCard key={product._id} product={product} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-400">
                      <Package size={32} className="mx-auto mb-2 opacity-30" />
                      <p className="text-sm">Chưa có sản phẩm</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        ))}
      </div>
    );
  }

  // Style 4: Bento - Featured product với bento grid
  if (style === 'bento') {
    return (
      <div className="py-8 md:py-12 space-y-10 md:space-y-16">
        {resolvedSections.map((section, idx) => {
          const featured = section.products[0];
          const others = section.products.slice(1, 5);
          
          return (
            <section key={idx} className="px-4">
              <div className="max-w-7xl mx-auto">
                {/* Header với accent line */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-1 h-8 rounded-full"
                      style={{ backgroundColor: brandColor }}
                    />
                    <h2 className="text-xl md:text-2xl font-bold">{section.category.name}</h2>
                  </div>
                  {showViewAll && (
                    <a 
                      href={`/danh-muc/${section.category.slug || section.category._id}`}
                      className="text-sm font-medium flex items-center gap-1.5 px-4 py-2 rounded-full transition-all hover:shadow-md"
                      style={{ backgroundColor: `${brandColor}10`, color: brandColor }}
                    >
                      Xem danh mục
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </a>
                  )}
                </div>
                
                {section.products.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 bg-slate-50 rounded-2xl">
                    <Package size={40} className="mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Chưa có sản phẩm</p>
                  </div>
                ) : (
                  <>
                    {/* Mobile: 2 columns grid */}
                    <div className="grid grid-cols-2 gap-3 md:hidden">
                      {section.products.slice(0, 4).map((product) => (
                        <ProductCard key={product._id} product={product} />
                      ))}
                    </div>
                    
                    {/* Desktop: Bento grid */}
                    <div className="hidden md:grid grid-cols-4 gap-4 auto-rows-[180px]">
                      {/* Featured - 2x2 */}
                      {featured && (
                        <a 
                          href={`/san-pham/${featured.slug || featured._id}`}
                          className="col-span-2 row-span-2 group cursor-pointer relative rounded-2xl overflow-hidden bg-slate-100"
                        >
                          {featured.image ? (
                            <img 
                              src={featured.image} 
                              alt={featured.name} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package size={48} className="text-slate-300" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                          <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                            <span 
                              className="inline-block px-2 py-0.5 rounded text-xs font-medium mb-2"
                              style={{ backgroundColor: brandColor }}
                            >
                              Nổi bật
                            </span>
                            <h3 className="font-bold text-lg line-clamp-2 mb-1">{featured.name}</h3>
                            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0">
                              {featured.salePrice && featured.salePrice < (featured.price || 0) ? (
                                <>
                                  <span className="font-bold text-lg">{formatPrice(featured.salePrice)}</span>
                                  <span className="text-xs text-white/60 line-through">{formatPrice(featured.price)}</span>
                                </>
                              ) : (
                                <span className="font-bold text-lg">{formatPrice(featured.price)}</span>
                              )}
                            </div>
                          </div>
                        </a>
                      )}
                      
                      {/* Other products */}
                      {others.map((product) => (
                        <a 
                          key={product._id}
                          href={`/san-pham/${product.slug || product._id}`}
                          className="group cursor-pointer relative rounded-xl overflow-hidden bg-slate-100"
                        >
                          {product.image ? (
                            <img 
                              src={product.image} 
                              alt={product.name} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package size={24} className="text-slate-300" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          <div className="absolute bottom-0 left-0 right-0 p-3 text-white transform translate-y-full group-hover:translate-y-0 transition-transform">
                            <h4 className="font-medium text-sm line-clamp-1">{product.name}</h4>
                            <span className="font-bold text-sm">{formatPrice(product.salePrice || product.price)}</span>
                          </div>
                        </a>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </section>
          );
        })}
      </div>
    );
  }

  // Style 5: Magazine - Layout tạp chí với category banner bên cạnh
  if (style === 'magazine') {
    return (
      <div className="py-8 md:py-12 space-y-10 md:space-y-16">
        {resolvedSections.map((section, sectionIdx) => {
          const isReversed = sectionIdx % 2 === 1;
          
          return (
            <section key={sectionIdx} className="px-4">
              <div className="max-w-7xl mx-auto">
                <div className={`flex gap-6 ${isReversed ? 'md:flex-row-reverse' : ''} flex-col md:flex-row`}>
                  {/* Category Banner Side */}
                  <div className="relative rounded-2xl overflow-hidden h-40 md:h-auto md:w-72 flex-shrink-0">
                    {section.category.image ? (
                      <img 
                        src={section.category.image} 
                        alt={section.category.name} 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <div 
                        className="w-full h-full"
                        style={{ background: `linear-gradient(135deg, ${brandColor} 0%, ${brandColor}99 100%)` }}
                      />
                    )}
                    <div 
                      className="absolute inset-0"
                      style={{ background: `linear-gradient(135deg, ${brandColor}ee 0%, ${brandColor}88 100%)` }}
                    />
                    <div className="absolute inset-0 p-5 flex flex-col justify-between text-white">
                      <div>
                        <span className="text-xs font-medium uppercase tracking-wider opacity-80">Danh mục</span>
                        <h2 className="text-xl md:text-2xl font-bold mt-1">{section.category.name}</h2>
                      </div>
                      {showViewAll && (
                        <a 
                          href={`/danh-muc/${section.category.slug || section.category._id}`}
                          className="self-start flex items-center gap-2 text-sm font-medium bg-white/20 hover:bg-white/30 px-4 py-2 rounded-full transition-colors backdrop-blur-sm"
                        >
                          Khám phá
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>
                  
                  {/* Products Side */}
                  <div className="flex-1 min-w-0">
                    {section.products.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-slate-400 bg-slate-50 rounded-xl">
                        <div className="text-center py-8">
                          <Package size={32} className="mx-auto mb-2 opacity-30" />
                          <p className="text-sm">Chưa có sản phẩm</p>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 h-full">
                        {section.products.slice(0, 6).map((product, idx) => (
                          <a 
                            key={product._id}
                            href={`/san-pham/${product.slug || product._id}`}
                            className={`group cursor-pointer ${idx === 0 ? 'md:row-span-2' : ''}`}
                          >
                            <div className={`rounded-xl overflow-hidden bg-slate-100 mb-2 ${idx === 0 ? 'md:h-full' : 'aspect-square'}`}>
                              {product.image ? (
                                <img 
                                  src={product.image} 
                                  alt={product.name} 
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package size={24} className="text-slate-300" />
                                </div>
                              )}
                            </div>
                            {idx !== 0 && (
                              <>
                                <h4 className="font-medium text-sm line-clamp-1">{product.name}</h4>
                                <span className="font-bold text-sm" style={{ color: brandColor }}>
                                  {formatPrice(product.salePrice || product.price)}
                                </span>
                              </>
                            )}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>
          );
        })}
      </div>
    );
  }

  // Style 6: Showcase - Gradient overlay với hover effects lung linh
  return (
    <div className="py-8 md:py-12 space-y-10 md:space-y-16">
      {resolvedSections.map((section, idx) => (
        <section key={idx}>
          <div className="max-w-7xl mx-auto px-4">
            {/* Header với underline effect */}
            <div className="flex items-end justify-between mb-8">
              <div>
                <span 
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: brandColor }}
                >
                  Bộ sưu tập
                </span>
                <h2 className="text-xl md:text-2xl lg:text-3xl font-bold mt-1">{section.category.name}</h2>
                <div 
                  className="h-1 w-16 rounded-full mt-2"
                  style={{ background: `linear-gradient(to right, ${brandColor}, ${brandColor}40)` }}
                />
              </div>
              {showViewAll && (
                <a 
                  href={`/danh-muc/${section.category.slug || section.category._id}`}
                  className="group flex items-center gap-2 text-sm font-medium transition-colors"
                  style={{ color: brandColor }}
                >
                  Xem tất cả 
                  <span 
                    className="w-8 h-8 rounded-full flex items-center justify-center group-hover:translate-x-1 transition-transform"
                    style={{ backgroundColor: `${brandColor}15` }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                </a>
              )}
            </div>
            
            {section.products.length === 0 ? (
              <div className="text-center py-12 text-slate-400 bg-slate-50 rounded-2xl">
                <Package size={40} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">Chưa có sản phẩm</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                {section.products.map((product) => (
                  <a 
                    key={product._id}
                    href={`/san-pham/${product.slug || product._id}`}
                    className="group cursor-pointer block"
                  >
                    {/* Image Container với effects */}
                    <div className="relative aspect-[3/4] rounded-2xl overflow-hidden mb-3">
                      {/* Background gradient on hover */}
                      <div 
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
                        style={{ 
                          background: `linear-gradient(135deg, ${brandColor}20 0%, transparent 50%, ${brandColor}10 100%)` 
                        }}
                      />
                      
                      {product.image ? (
                        <img 
                          src={product.image} 
                          alt={product.name} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                          <Package size={32} className="text-slate-300" />
                        </div>
                      )}
                      
                      {/* Gradient overlay bottom */}
                      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20" />
                      
                      {/* Quick action button */}
                      <div className="absolute bottom-3 left-3 right-3 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-30">
                        <span 
                          className="block w-full py-2.5 rounded-xl text-sm font-medium text-white text-center backdrop-blur-sm"
                          style={{ backgroundColor: `${brandColor}dd` }}
                        >
                          Xem chi tiết
                        </span>
                      </div>
                      
                      {/* Badge for sale */}
                      {product.salePrice && product.salePrice < (product.price || 0) && (
                        <div className="absolute top-3 left-3 px-2 py-1 rounded-lg text-xs font-bold text-white bg-red-500 z-30">
                          -{Math.round((1 - product.salePrice / (product.price || 1)) * 100)}%
                        </div>
                      )}
                    </div>
                    
                    {/* Product info */}
                    <div className="space-y-1">
                      <h4 className="font-medium text-sm line-clamp-2 group-hover:opacity-80 transition-opacity">{product.name}</h4>
                      <div className="flex flex-col">
                        {product.salePrice && product.salePrice < (product.price || 0) ? (
                          <>
                            <span className="font-bold text-sm" style={{ color: brandColor }}>
                              {formatPrice(product.salePrice)}
                            </span>
                            <span className="text-xs text-slate-400 line-through">{formatPrice(product.price)}</span>
                          </>
                        ) : (
                          <span className="font-bold text-sm" style={{ color: brandColor }}>
                            {formatPrice(product.price)}
                          </span>
                        )}
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        </section>
      ))}
    </div>
  );
}

// ============ TEAM SECTION ============
// 6 Professional Styles: Grid, Cards, Carousel, Hexagon, Timeline, Spotlight
type TeamStyle = 'grid' | 'cards' | 'carousel' | 'hexagon' | 'timeline' | 'spotlight';

interface TeamMember {
  name: string;
  role: string;
  avatar: string;
  bio: string;
  facebook?: string;
  linkedin?: string;
  twitter?: string;
  email?: string;
}

const SocialIcon = ({ type, url, brandColor }: { type: 'facebook' | 'linkedin' | 'twitter' | 'email'; url?: string; brandColor: string }) => {
  if (!url) return null;
  const icons = {
    facebook: <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>,
    linkedin: <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>,
    twitter: <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
    email: <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
  };
  return (
    <a 
      href={type === 'email' ? `mailto:${url}` : url} 
      target="_blank" 
      rel="noopener noreferrer"
      className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
      style={{ backgroundColor: `${brandColor}15`, color: brandColor }}
    >
      {icons[type]}
    </a>
  );
};

function TeamSection({ config, brandColor, title }: { config: Record<string, unknown>; brandColor: string; title: string }) {
  const members = (config.members as TeamMember[]) || [];
  const style = (config.style as TeamStyle) || 'grid';
  const [currentSlide, setCurrentSlide] = React.useState(0);

  // Auto slide for carousel style
  React.useEffect(() => {
    if (style !== 'carousel' || members.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % members.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [members.length, style]);

  if (members.length === 0) {
    return (
      <section className="py-16 px-4 bg-slate-50">
        <div className="max-w-6xl mx-auto text-center">
          <Users size={48} className="mx-auto mb-4 text-slate-400" />
          <h2 className="text-2xl font-bold mb-2 text-slate-600">{title}</h2>
          <p className="text-slate-500">Chưa có thành viên nào</p>
        </div>
      </section>
    );
  }

  // Style 1: Grid - Clean grid với hover effects
  if (style === 'grid') {
    return (
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-slate-900">{title}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {members.map((member, idx) => (
              <div key={idx} className="group text-center">
                <div className="relative mb-4 mx-auto overflow-hidden rounded-2xl aspect-square max-w-[200px]">
                  {member.avatar ? (
                    <img 
                      src={member.avatar} 
                      alt={member.name} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                    />
                  ) : (
                    <div 
                      className="w-full h-full flex items-center justify-center text-4xl font-bold text-white"
                      style={{ backgroundColor: brandColor }}
                    >
                      {(member.name || 'U').charAt(0)}
                    </div>
                  )}
                  {/* Social overlay on hover */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-2">
                    <SocialIcon type="facebook" url={member.facebook} brandColor={brandColor} />
                    <SocialIcon type="linkedin" url={member.linkedin} brandColor={brandColor} />
                    <SocialIcon type="twitter" url={member.twitter} brandColor={brandColor} />
                    <SocialIcon type="email" url={member.email} brandColor={brandColor} />
                  </div>
                </div>
                <h4 className="font-semibold text-lg text-slate-900">{member.name || 'Họ và tên'}</h4>
                <p className="text-sm mt-1" style={{ color: brandColor }}>{member.role || 'Chức vụ'}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Style 2: Cards - Horizontal cards với bio
  if (style === 'cards') {
    return (
      <section className="py-16 px-4 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-slate-900">{title}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {members.map((member, idx) => (
              <div 
                key={idx} 
                className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 flex gap-4 items-start group hover:shadow-md transition-shadow"
              >
                <div className="flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden">
                  {member.avatar ? (
                    <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                  ) : (
                    <div 
                      className="w-full h-full flex items-center justify-center text-2xl font-bold text-white"
                      style={{ backgroundColor: brandColor }}
                    >
                      {(member.name || 'U').charAt(0)}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-slate-900 truncate">{member.name || 'Họ và tên'}</h4>
                  <p className="text-sm mb-2" style={{ color: brandColor }}>{member.role || 'Chức vụ'}</p>
                  <p className="text-sm text-slate-500 line-clamp-2">{member.bio || 'Giới thiệu ngắn...'}</p>
                  <div className="flex gap-1.5 mt-3">
                    <SocialIcon type="facebook" url={member.facebook} brandColor={brandColor} />
                    <SocialIcon type="linkedin" url={member.linkedin} brandColor={brandColor} />
                    <SocialIcon type="twitter" url={member.twitter} brandColor={brandColor} />
                    <SocialIcon type="email" url={member.email} brandColor={brandColor} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Style 3: Carousel - Single member spotlight với navigation
  if (style === 'carousel') {
    const current = members[currentSlide] || members[0];
    return (
      <section className="py-16 md:py-20 px-4 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-slate-900">{title}</h2>
          
          <div 
            className="bg-white rounded-2xl shadow-xl overflow-hidden"
            style={{ borderTop: `4px solid ${brandColor}` }}
          >
            <div className="flex flex-col md:flex-row">
              {/* Avatar side */}
              <div className="flex-shrink-0 w-full md:w-1/3 aspect-square md:aspect-[3/4] max-h-[300px] md:max-h-none bg-slate-100">
                {current.avatar ? (
                  <img src={current.avatar} alt={current.name} className="w-full h-full object-cover" />
                ) : (
                  <div 
                    className="w-full h-full flex items-center justify-center text-6xl font-bold text-white"
                    style={{ backgroundColor: brandColor }}
                  >
                    {(current.name || 'U').charAt(0)}
                  </div>
                )}
              </div>

              {/* Info side */}
              <div className="flex-1 p-6 md:p-10 flex flex-col justify-center">
                <span 
                  className="text-sm font-semibold uppercase tracking-wider mb-2"
                  style={{ color: brandColor }}
                >
                  {current.role || 'Chức vụ'}
                </span>
                <h4 className="text-2xl md:text-4xl font-bold text-slate-900 mb-4">
                  {current.name || 'Họ và tên'}
                </h4>
                <p className="text-slate-500 leading-relaxed mb-6">
                  {current.bio || 'Giới thiệu về thành viên này...'}
                </p>
                <div className="flex gap-3">
                  <SocialIcon type="facebook" url={current.facebook} brandColor={brandColor} />
                  <SocialIcon type="linkedin" url={current.linkedin} brandColor={brandColor} />
                  <SocialIcon type="twitter" url={current.twitter} brandColor={brandColor} />
                  <SocialIcon type="email" url={current.email} brandColor={brandColor} />
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          {members.length > 1 && (
            <div className="flex items-center justify-center gap-4 mt-8">
              <button 
                onClick={() => setCurrentSlide(prev => prev === 0 ? members.length - 1 : prev - 1)} 
                className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-slate-50 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <div className="flex gap-2">
                {members.map((_, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => setCurrentSlide(idx)} 
                    className={`h-2.5 rounded-full transition-all ${idx === currentSlide ? 'w-8' : 'w-2.5 bg-slate-300 hover:bg-slate-400'}`}
                    style={idx === currentSlide ? { backgroundColor: brandColor } : {}}
                  />
                ))}
              </div>
              <button 
                onClick={() => setCurrentSlide(prev => (prev + 1) % members.length)} 
                className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-slate-50 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          )}
        </div>
      </section>
    );
  }

  // Style 4: Hexagon - Hình lục giác sáng tạo với hiệu ứng hover
  if (style === 'hexagon') {
    return (
      <section className="py-16 md:py-20 px-4 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span 
              className="inline-block px-4 py-1.5 rounded-full text-sm font-medium mb-4"
              style={{ backgroundColor: `${brandColor}15`, color: brandColor }}
            >
              Đội ngũ của chúng tôi
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">{title}</h2>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6 md:gap-8">
            {members.map((member, idx) => (
              <div key={idx} className="group relative">
                {/* Hexagon container */}
                <div 
                  className="relative w-36 h-40 md:w-44 md:h-48"
                  style={{
                    clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                  }}
                >
                  {/* Background glow effect */}
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ 
                      background: `linear-gradient(135deg, ${brandColor}40, ${brandColor}20)`,
                      filter: 'blur(20px)',
                      transform: 'scale(1.2)'
                    }}
                  />
                  
                  {/* Main hexagon */}
                  <div 
                    className="absolute inset-1 transition-transform duration-500 group-hover:scale-[0.98]"
                    style={{
                      clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                      backgroundColor: '#f1f5f9'
                    }}
                  >
                    {member.avatar ? (
                      <img 
                        src={member.avatar} 
                        alt={member.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div 
                        className="w-full h-full flex items-center justify-center text-4xl font-bold text-white"
                        style={{ backgroundColor: brandColor }}
                      >
                        {(member.name || 'U').charAt(0)}
                      </div>
                    )}
                    
                    {/* Overlay on hover */}
                    <div 
                      className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
                      style={{ backgroundColor: `${brandColor}ee` }}
                    >
                      <div className="flex gap-2">
                        {member.facebook && (
                          <a href={member.facebook} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors">
                            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                          </a>
                        )}
                        {member.linkedin && (
                          <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors">
                            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                          </a>
                        )}
                        {member.email && (
                          <a href={`mailto:${member.email}`} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors">
                            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Border effect */}
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                      background: `linear-gradient(135deg, ${brandColor}, ${brandColor}60)`,
                    }}
                  />
                </div>
                
                {/* Info below hexagon */}
                <div className="text-center mt-4">
                  <h4 className="font-semibold text-slate-900">{member.name || 'Họ và tên'}</h4>
                  <p className="text-sm mt-0.5" style={{ color: brandColor }}>{member.role || 'Chức vụ'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Style 5: Timeline - Dạng timeline sang trọng
  if (style === 'timeline') {
    return (
      <section className="py-16 md:py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">{title}</h2>
            <div 
              className="w-20 h-1 mx-auto rounded-full"
              style={{ background: `linear-gradient(90deg, transparent, ${brandColor}, transparent)` }}
            />
          </div>
          
          <div className="relative">
            {/* Timeline line - center on desktop, left on mobile */}
            <div 
              className="absolute top-0 bottom-0 w-0.5 left-6 md:left-1/2 md:-translate-x-1/2"
              style={{ background: `linear-gradient(to bottom, transparent, ${brandColor}30, ${brandColor}30, transparent)` }}
            />
            
            <div className="space-y-8 md:space-y-12">
              {members.map((member, idx) => {
                const isEven = idx % 2 === 0;
                return (
                  <div 
                    key={idx} 
                    className={`relative flex items-center gap-6 md:gap-0 ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'}`}
                  >
                    {/* Timeline dot */}
                    <div 
                      className="absolute left-6 md:left-1/2 w-4 h-4 rounded-full border-4 border-white shadow-lg -translate-x-1/2 z-10"
                      style={{ backgroundColor: brandColor }}
                    />
                    
                    {/* Content card */}
                    <div className={`flex-1 ml-12 md:ml-0 ${isEven ? 'md:pr-12 md:text-right' : 'md:pl-12'}`}>
                      <div 
                        className="group bg-white rounded-2xl p-5 md:p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100"
                        style={{ '--hover-border': `${brandColor}30` } as React.CSSProperties}
                      >
                        <div className={`flex items-center gap-4 ${isEven ? 'md:flex-row-reverse' : ''}`}>
                          {/* Avatar */}
                          <div 
                            className="flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden ring-4 ring-white shadow-md"
                          >
                            {member.avatar ? (
                              <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                            ) : (
                              <div 
                                className="w-full h-full flex items-center justify-center text-2xl font-bold text-white"
                                style={{ backgroundColor: brandColor }}
                              >
                                {(member.name || 'U').charAt(0)}
                              </div>
                            )}
                          </div>
                          
                          {/* Info */}
                          <div className={`flex-1 min-w-0 ${isEven ? 'md:text-right' : ''}`}>
                            <h4 className="font-bold text-lg text-slate-900">{member.name || 'Họ và tên'}</h4>
                            <p 
                              className="text-sm font-medium"
                              style={{ color: brandColor }}
                            >
                              {member.role || 'Chức vụ'}
                            </p>
                            {member.bio && (
                              <p className="text-sm text-slate-500 mt-2 line-clamp-2">{member.bio}</p>
                            )}
                            
                            {/* Social icons */}
                            <div className={`flex gap-2 mt-3 ${isEven ? 'md:justify-end' : ''}`}>
                              <SocialIcon type="facebook" url={member.facebook} brandColor={brandColor} />
                              <SocialIcon type="linkedin" url={member.linkedin} brandColor={brandColor} />
                              <SocialIcon type="twitter" url={member.twitter} brandColor={brandColor} />
                              <SocialIcon type="email" url={member.email} brandColor={brandColor} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Spacer for opposite side on desktop */}
                    <div className="hidden md:block flex-1" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Style 6: Spotlight - Glassmorphism với hiệu ứng ánh sáng
  return (
    <section 
      className="py-16 md:py-20 px-4 relative overflow-hidden"
      style={{ background: `linear-gradient(135deg, ${brandColor}08 0%, #f8fafc 50%, ${brandColor}05 100%)` }}
    >
      {/* Decorative background elements */}
      <div 
        className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-20 blur-3xl"
        style={{ background: `radial-gradient(circle, ${brandColor}40, transparent)` }}
      />
      <div 
        className="absolute bottom-0 left-0 w-80 h-80 rounded-full opacity-15 blur-3xl"
        style={{ background: `radial-gradient(circle, ${brandColor}30, transparent)` }}
      />
      
      <div className="max-w-6xl mx-auto relative">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">{title}</h2>
          <p className="text-slate-500 max-w-2xl mx-auto">Những con người tài năng đứng sau thành công của chúng tôi</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {members.map((member, idx) => (
            <div 
              key={idx} 
              className="group relative"
            >
              {/* Glow effect behind card */}
              <div 
                className="absolute -inset-1 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"
                style={{ background: `linear-gradient(135deg, ${brandColor}40, ${brandColor}20)` }}
              />
              
              {/* Main card with glassmorphism */}
              <div 
                className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
              >
                {/* Spotlight effect */}
                <div 
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full opacity-0 group-hover:opacity-30 transition-opacity duration-500"
                  style={{ 
                    background: `radial-gradient(circle, ${brandColor}, transparent)`,
                    filter: 'blur(20px)'
                  }}
                />
                
                {/* Avatar with ring effect */}
                <div className="relative mx-auto w-28 h-28 md:w-32 md:h-32 mb-5">
                  <div 
                    className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ 
                      background: `conic-gradient(from 0deg, ${brandColor}, ${brandColor}40, ${brandColor})`,
                      animation: 'spin 4s linear infinite',
                      padding: '3px'
                    }}
                  />
                  <div className="absolute inset-1 rounded-full bg-white" />
                  <div className="absolute inset-2 rounded-full overflow-hidden">
                    {member.avatar ? (
                      <img 
                        src={member.avatar} 
                        alt={member.name} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div 
                        className="w-full h-full flex items-center justify-center text-4xl font-bold text-white"
                        style={{ backgroundColor: brandColor }}
                      >
                        {(member.name || 'U').charAt(0)}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Info */}
                <div className="text-center relative">
                  <h4 className="font-bold text-xl text-slate-900 mb-1">{member.name || 'Họ và tên'}</h4>
                  <p 
                    className="text-sm font-medium mb-3"
                    style={{ color: brandColor }}
                  >
                    {member.role || 'Chức vụ'}
                  </p>
                  
                  {member.bio && (
                    <p className="text-sm text-slate-500 mb-4 line-clamp-2">{member.bio}</p>
                  )}
                  
                  {/* Social icons with glass effect */}
                  <div className="flex justify-center gap-2">
                    {member.facebook && (
                      <a 
                        href={member.facebook} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-110 backdrop-blur-sm"
                        style={{ backgroundColor: `${brandColor}15`, color: brandColor }}
                      >
                        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                      </a>
                    )}
                    {member.linkedin && (
                      <a 
                        href={member.linkedin} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-110 backdrop-blur-sm"
                        style={{ backgroundColor: `${brandColor}15`, color: brandColor }}
                      >
                        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                      </a>
                    )}
                    {member.twitter && (
                      <a 
                        href={member.twitter} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-110 backdrop-blur-sm"
                        style={{ backgroundColor: `${brandColor}15`, color: brandColor }}
                      >
                        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                      </a>
                    )}
                    {member.email && (
                      <a 
                        href={`mailto:${member.email}`}
                        className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-110 backdrop-blur-sm"
                        style={{ backgroundColor: `${brandColor}15`, color: brandColor }}
                      >
                        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Add keyframes for spinning animation */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </section>
  );
}

// ============ FEATURES SECTION ============
// 3 Professional Styles: Icon Grid, Alternating, Compact
type FeaturesStyle = 'iconGrid' | 'alternating' | 'compact';

// Icon mapping for features
const featureIcons: Record<string, React.ElementType> = {
  Zap, Shield, Target, Layers, Cpu, Globe, Rocket, Settings, Check, Star
};

function FeaturesSection({ config, brandColor, title }: { config: Record<string, unknown>; brandColor: string; title: string }) {
  const items = (config.items as Array<{ icon?: string; title: string; description: string }>) || [];
  const style = (config.style as FeaturesStyle) || 'iconGrid';

  const getIcon = (iconName?: string) => {
    return featureIcons[iconName || 'Zap'] || Zap;
  };

  // Style 1: Icon Grid - Grid với icon nổi bật
  if (style === 'iconGrid') {
    return (
      <section className="py-12 md:py-16 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10 md:mb-14">
            <div 
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3"
              style={{ backgroundColor: `${brandColor}15`, color: brandColor }}
            >
              <Zap size={12} />
              Tính năng
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-3">{title}</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">
              Khám phá những tính năng ưu việt giúp bạn đạt hiệu quả tối đa
            </p>
          </div>
          
          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item, idx) => {
              const IconComponent = getIcon(item.icon);
              return (
                <div 
                  key={idx} 
                  className="group bg-white rounded-2xl p-6 border border-slate-200 hover:border-transparent hover:shadow-xl transition-all duration-300"
                >
                  {/* Icon với background gradient */}
                  <div 
                    className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 duration-300"
                    style={{ 
                      background: `linear-gradient(135deg, ${brandColor} 0%, ${brandColor}cc 100%)`,
                      boxShadow: `0 8px 16px -4px ${brandColor}40`
                    }}
                  >
                    <IconComponent size={24} className="text-white" strokeWidth={2} />
                  </div>
                  
                  <h3 className="font-bold text-lg text-slate-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    );
  }

  // Style 2: Alternating - Layout xen kẽ trái/phải
  if (style === 'alternating') {
    return (
      <section className="py-12 md:py-16 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10 md:mb-14">
            <div 
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3"
              style={{ backgroundColor: `${brandColor}15`, color: brandColor }}
            >
              <Zap size={12} />
              Tính năng
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">{title}</h2>
          </div>
          
          {/* Features List */}
          <div className="max-w-4xl mx-auto space-y-6">
            {items.map((item, idx) => {
              const IconComponent = getIcon(item.icon);
              const isEven = idx % 2 === 0;
              return (
                <div 
                  key={idx} 
                  className={`flex items-center gap-6 p-6 rounded-2xl bg-slate-50 border border-slate-100 ${!isEven ? 'md:flex-row-reverse' : ''}`}
                >
                  {/* Icon + Number */}
                  <div className="relative flex-shrink-0">
                    <div 
                      className="w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center"
                      style={{ 
                        background: `linear-gradient(135deg, ${brandColor}15 0%, ${brandColor}05 100%)`,
                        border: `2px solid ${brandColor}20`
                      }}
                    >
                      <IconComponent size={32} style={{ color: brandColor }} strokeWidth={1.5} />
                    </div>
                    {/* Number badge */}
                    <span 
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full text-xs font-bold text-white flex items-center justify-center"
                      style={{ backgroundColor: brandColor }}
                    >
                      {idx + 1}
                    </span>
                  </div>
                  
                  {/* Content */}
                  <div className={`flex-1 ${!isEven ? 'md:text-right' : ''}`}>
                    <h3 className="font-bold text-lg text-slate-900 mb-1">
                      {item.title}
                    </h3>
                    <p className="text-sm text-slate-500 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    );
  }

  // Style 3: Compact - Danh sách nhỏ gọn với icon inline
  return (
    <section className="py-12 md:py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b-2 mb-8" style={{ borderColor: `${brandColor}20` }}>
          <div className="space-y-2">
            <div 
              className="inline-flex items-center gap-2 px-3 py-1 rounded text-xs font-bold uppercase tracking-wider"
              style={{ backgroundColor: `${brandColor}15`, color: brandColor }}
            >
              <Zap size={12} />
              Tính năng
            </div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">{title}</h2>
          </div>
        </div>
        
        {/* Compact Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {items.map((item, idx) => {
            const IconComponent = getIcon(item.icon);
            return (
              <div 
                key={idx} 
                className="flex items-start gap-3 p-4 bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition-colors"
              >
                {/* Small Icon */}
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${brandColor}15` }}
                >
                  <IconComponent size={18} style={{ color: brandColor }} strokeWidth={2} />
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-slate-900 mb-0.5 truncate">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ============ PROCESS SECTION ============
// 4 Professional Styles: Timeline, Steps, Cards, Zigzag
type ProcessStyle = 'timeline' | 'steps' | 'cards' | 'zigzag';

function ProcessSection({ config, brandColor, title }: { config: Record<string, unknown>; brandColor: string; title: string }) {
  const steps = (config.steps as Array<{ icon: string; title: string; description: string }>) || [];
  const style = (config.style as ProcessStyle) || 'timeline';

  // Style 1: Timeline - Vertical timeline với connecting line
  if (style === 'timeline') {
    return (
      <section className="py-12 md:py-16 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10 md:mb-14">
            <div 
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3"
              style={{ backgroundColor: `${brandColor}15`, color: brandColor }}
            >
              Quy trình
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">{title}</h2>
          </div>
          
          {/* Timeline */}
          <div className="max-w-3xl mx-auto relative">
            {/* Vertical Line */}
            <div 
              className="absolute top-0 bottom-0 left-4 md:left-1/2 md:-translate-x-1/2 w-0.5"
              style={{ backgroundColor: `${brandColor}20` }}
            />
            
            {/* Steps */}
            <div className="relative space-y-8 md:space-y-12">
              {steps.map((step, idx) => {
                const isEven = idx % 2 === 0;
                return (
                  <div 
                    key={idx} 
                    className={`relative flex items-start gap-4 md:gap-8 pl-12 md:pl-0 ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} md:justify-center`}
                  >
                    {/* Circle Marker */}
                    <div 
                      className="absolute left-0 md:left-1/2 md:-translate-x-1/2 flex items-center justify-center w-8 h-8 rounded-full text-white font-bold text-sm border-4 border-white shadow-lg z-10"
                      style={{ backgroundColor: brandColor }}
                    >
                      {step.icon || idx + 1}
                    </div>
                    
                    {/* Content Card */}
                    <div 
                      className={`flex-1 md:w-[calc(50%-3rem)] bg-white rounded-xl p-5 md:p-6 shadow-sm border border-slate-200 ${isEven ? 'md:text-right' : 'md:text-left'}`}
                    >
                      <h3 className="font-bold text-base md:text-lg text-slate-900 mb-1">
                        {step.title || `Bước ${idx + 1}`}
                      </h3>
                      <p className="text-sm text-slate-500 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Style 2: Steps - Horizontal steps với connector arrows
  if (style === 'steps') {
    return (
      <section className="py-12 md:py-16 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10 md:mb-14">
            <div 
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3"
              style={{ backgroundColor: `${brandColor}15`, color: brandColor }}
            >
              Quy trình
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">{title}</h2>
          </div>
          
          {/* Steps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {steps.map((step, idx) => (
              <div key={idx} className="relative">
                {/* Connector Arrow */}
                {idx < steps.length - 1 && (
                  <div 
                    className="hidden lg:block absolute top-10 -right-2 w-4 h-4 z-10"
                    style={{ color: brandColor }}
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                      <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"/>
                    </svg>
                  </div>
                )}
                
                {/* Step Card */}
                <div className="bg-white rounded-xl p-5 md:p-6 border border-slate-200 text-center h-full">
                  {/* Step Number */}
                  <div 
                    className="w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-lg md:text-xl"
                    style={{ 
                      backgroundColor: brandColor,
                      boxShadow: `0 4px 14px ${brandColor}40`
                    }}
                  >
                    {step.icon || idx + 1}
                  </div>
                  
                  <h3 className="font-bold text-base md:text-lg text-slate-900 mb-2">
                    {step.title || `Bước ${idx + 1}`}
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Style 3: Cards - Grid cards với gradient header
  if (style === 'cards') {
    return (
      <section className="py-12 md:py-16 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b-2 mb-8" style={{ borderColor: `${brandColor}20` }}>
            <div className="space-y-2">
              <div 
                className="inline-flex items-center gap-2 px-3 py-1 rounded text-xs font-bold uppercase tracking-wider"
                style={{ backgroundColor: `${brandColor}15`, color: brandColor }}
              >
                Quy trình
              </div>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">{title}</h2>
            </div>
          </div>
          
          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {steps.map((step, idx) => (
              <div 
                key={idx} 
                className="group bg-white rounded-xl overflow-hidden border border-slate-200 hover:shadow-lg transition-shadow"
              >
                {/* Gradient Header */}
                <div 
                  className="h-2"
                  style={{ background: `linear-gradient(to right, ${brandColor}, ${brandColor}99)` }}
                />
                
                <div className="p-5 md:p-6">
                  {/* Step Badge */}
                  <div className="flex items-center gap-3 mb-4">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: brandColor }}
                    >
                      {step.icon || idx + 1}
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Bước {idx + 1}
                    </span>
                  </div>
                  
                  <h3 className="font-bold text-base md:text-lg text-slate-900 mb-2">
                    {step.title || `Bước ${idx + 1}`}
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Style 4: Zigzag - Alternating layout với số lớn (default)
  return (
    <section className="py-12 md:py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10 md:mb-14">
          <div 
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3"
            style={{ backgroundColor: `${brandColor}15`, color: brandColor }}
          >
            Quy trình
          </div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">{title}</h2>
        </div>
        
        {/* Zigzag Steps */}
        <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
          {steps.map((step, idx) => {
            const isEven = idx % 2 === 0;
            return (
              <div 
                key={idx} 
                className={`flex items-center gap-6 md:gap-8 ${!isEven ? 'md:flex-row-reverse' : ''}`}
              >
                {/* Big Number */}
                <div className="relative flex-shrink-0" style={{ minWidth: '80px' }}>
                  <span 
                    className="text-6xl md:text-7xl font-black leading-none"
                    style={{ color: brandColor, opacity: 0.15 }}
                  >
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div 
                      className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: brandColor }}
                    >
                      {step.icon || idx + 1}
                    </div>
                  </div>
                </div>
                
                {/* Content */}
                <div 
                  className={`flex-1 bg-slate-50 rounded-xl p-5 md:p-6 border border-slate-100 ${!isEven ? 'md:text-right' : ''}`}
                >
                  <h3 className="font-bold text-base md:text-lg text-slate-900 mb-1">
                    {step.title || `Bước ${idx + 1}`}
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ============ CLIENTS MARQUEE SECTION ============
// Auto-scroll Logo Marquee - 4 Styles: marquee, marqueeReverse, wave, logoWall
type ClientsStyle = 'marquee' | 'marqueeReverse' | 'wave' | 'logoWall';

function ClientsSection({ config, brandColor, title }: { config: Record<string, unknown>; brandColor: string; title: string }) {
  const items = (config.items as Array<{ url: string; link: string; name?: string }>) || [];
  const style = (config.style as ClientsStyle) || 'marquee';

  if (items.length === 0) {
    return null;
  }

  // CSS keyframes for marquee animation
  const marqueeStyles = `
    @keyframes clients-marquee {
      0% { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }
    @keyframes clients-marquee-reverse {
      0% { transform: translateX(-50%); }
      100% { transform: translateX(0); }
    }
    @keyframes clients-float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-8px); }
    }
  `;

  // Logo item renderer
  const renderLogoItem = (item: { url: string; link: string; name?: string }, idx: number, grayscale = false) => {
    const logo = item.url ? (
      <img 
        src={item.url} 
        alt={item.name || `Client ${idx + 1}`}
        className={`h-10 md:h-12 w-auto object-contain select-none pointer-events-none transition-all duration-500 ${
          grayscale ? 'grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100' : ''
        }`}
      />
    ) : (
      <div 
        className="h-10 md:h-12 w-24 rounded-lg flex items-center justify-center"
        style={{ backgroundColor: `${brandColor}15` }}
      >
        <ImageIcon size={20} style={{ color: brandColor }} className="opacity-40" />
      </div>
    );

    return item.link ? (
      <a 
        key={`logo-${idx}`}
        href={item.link} 
        target="_blank" 
        rel="noopener noreferrer"
        className="shrink-0 group"
      >
        {logo}
      </a>
    ) : (
      <div key={`logo-${idx}`} className="shrink-0 group">{logo}</div>
    );
  };

  // Calculate animation duration based on items count
  const baseDuration = Math.max(20, items.length * 4);

  // Style 1: Simple Marquee
  if (style === 'marquee') {
    return (
      <section className="w-full py-10 md:py-12 bg-white border-b border-slate-200/40">
        <style>{marqueeStyles}</style>
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 relative pl-4">
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-full" style={{ backgroundColor: brandColor }} />
              {title}
            </h2>
          </div>
          
          <div 
            className="relative py-6 overflow-hidden"
            style={{ 
              maskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
              WebkitMaskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)'
            }}
          >
            <div 
              className="flex items-center gap-12 md:gap-16"
              style={{ 
                animation: `clients-marquee ${baseDuration}s linear infinite`,
                width: 'max-content'
              }}
            >
              {items.map((item, idx) => renderLogoItem(item, idx))}
              {items.map((item, idx) => renderLogoItem(item, idx + items.length))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Style 2: Dual Row Marquee
  if (style === 'marqueeReverse') {
    return (
      <section className="w-full py-10 md:py-12 bg-white border-b border-slate-200/40">
        <style>{marqueeStyles}</style>
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 relative pl-4">
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-full" style={{ backgroundColor: brandColor }} />
              {title}
            </h2>
          </div>
          
          <div className="space-y-4">
            {/* Row 1 */}
            <div 
              className="relative py-4 overflow-hidden"
              style={{ 
                maskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
                WebkitMaskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)'
              }}
            >
              <div 
                className="flex items-center gap-12 md:gap-16"
                style={{ 
                  animation: `clients-marquee ${baseDuration + 5}s linear infinite`,
                  width: 'max-content'
                }}
              >
                {items.map((item, idx) => renderLogoItem(item, idx, true))}
                {items.map((item, idx) => renderLogoItem(item, idx + items.length, true))}
              </div>
            </div>
            
            {/* Row 2 - Reverse */}
            <div 
              className="relative py-4 overflow-hidden"
              style={{ 
                maskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
                WebkitMaskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)'
              }}
            >
              <div 
                className="flex items-center gap-12 md:gap-16"
                style={{ 
                  animation: `clients-marquee-reverse ${baseDuration + 10}s linear infinite`,
                  width: 'max-content'
                }}
              >
                {[...items].reverse().map((item, idx) => renderLogoItem(item, idx, true))}
                {[...items].reverse().map((item, idx) => renderLogoItem(item, idx + items.length, true))}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Style 3: Wave
  if (style === 'wave') {
    return (
      <section className="w-full py-10 md:py-16 bg-gradient-to-b from-slate-50 to-white border-b border-slate-200/40 overflow-hidden">
        <style>{marqueeStyles}</style>
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6 space-y-8">
          <div className="text-center space-y-2">
            <div 
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
              style={{ backgroundColor: `${brandColor}15`, color: brandColor }}
            >
              Đối tác & Khách hàng
            </div>
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold tracking-tight text-slate-900">
              {title}
            </h2>
          </div>
          
          <div 
            className="relative py-8 overflow-hidden"
            style={{ 
              maskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)',
              WebkitMaskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)'
            }}
          >
            <div 
              className="flex items-center gap-14 md:gap-20"
              style={{ 
                animation: `clients-marquee ${baseDuration + 15}s linear infinite`,
                width: 'max-content'
              }}
            >
              {items.map((item, idx) => (
                <div 
                  key={`wave-${idx}`}
                  className="shrink-0"
                  style={{ animation: `clients-float 3s ease-in-out infinite`, animationDelay: `${idx * 0.3}s` }}
                >
                  {item.url ? (
                    <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-100">
                      <img 
                        src={item.url} 
                        alt={item.name || `Client ${idx + 1}`}
                        className="h-8 md:h-10 w-auto object-contain select-none pointer-events-none"
                      />
                    </div>
                  ) : (
                    <div className="h-16 w-28 rounded-xl flex items-center justify-center bg-white shadow-sm border border-slate-100">
                      <ImageIcon size={20} className="text-slate-300" />
                    </div>
                  )}
                </div>
              ))}
              {items.map((item, idx) => (
                <div 
                  key={`wave2-${idx}`}
                  className="shrink-0"
                  style={{ animation: `clients-float 3s ease-in-out infinite`, animationDelay: `${(idx + items.length) * 0.3}s` }}
                >
                  {item.url ? (
                    <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-100">
                      <img 
                        src={item.url} 
                        alt={item.name || `Client ${idx + 1}`}
                        className="h-8 md:h-10 w-auto object-contain select-none pointer-events-none"
                      />
                    </div>
                  ) : (
                    <div className="h-16 w-28 rounded-xl flex items-center justify-center bg-white shadow-sm border border-slate-100">
                      <ImageIcon size={20} className="text-slate-300" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
        </div>
      </section>
    );
  }

  // Style 4: Logo Wall (default) - Grid or Marquee based on items count
  return (
    <section className="w-full py-10 md:py-12 bg-white border-b border-slate-200/40">
      <style>{marqueeStyles}</style>
      <div className="w-full max-w-7xl mx-auto px-4 md:px-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 relative pl-4">
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-full" style={{ backgroundColor: brandColor }} />
            {title}
          </h2>
        </div>
        
        {items.length > 8 ? (
          /* Marquee for many logos */
          <div 
            className="relative py-6 overflow-hidden"
            style={{ 
              maskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)',
              WebkitMaskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)'
            }}
          >
            <div 
              className="flex items-center gap-10 md:gap-14"
              style={{ 
                animation: `clients-marquee ${baseDuration + 20}s linear infinite`,
                width: 'max-content'
              }}
            >
              {items.map((item, idx) => (
                <div 
                  key={`wall-${idx}`}
                  className="shrink-0 group p-3 rounded-xl border border-transparent hover:border-slate-200 hover:bg-slate-50 transition-all cursor-pointer"
                >
                  {item.url ? (
                    <img 
                      src={item.url} 
                      alt={item.name || `Client ${idx + 1}`}
                      className="h-10 md:h-12 w-auto object-contain select-none pointer-events-none grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300"
                    />
                  ) : (
                    <div className="h-10 md:h-12 w-24 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${brandColor}10` }}>
                      <ImageIcon size={18} className="text-slate-300" />
                    </div>
                  )}
                </div>
              ))}
              {items.map((item, idx) => (
                <div 
                  key={`wall2-${idx}`}
                  className="shrink-0 group p-3 rounded-xl border border-transparent hover:border-slate-200 hover:bg-slate-50 transition-all cursor-pointer"
                >
                  {item.url ? (
                    <img 
                      src={item.url} 
                      alt={item.name || `Client ${idx + 1}`}
                      className="h-10 md:h-12 w-auto object-contain select-none pointer-events-none grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300"
                    />
                  ) : (
                    <div className="h-10 md:h-12 w-24 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${brandColor}10` }}>
                      <ImageIcon size={18} className="text-slate-300" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Static Grid for fewer logos */
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 items-center justify-items-center py-6">
            {items.map((item, idx) => (
              <div 
                key={`static-${idx}`}
                className="group p-4 rounded-xl border border-transparent hover:border-slate-200 hover:bg-slate-50 transition-all cursor-pointer w-full flex flex-col items-center"
              >
                {item.url ? (
                  <img 
                    src={item.url} 
                    alt={item.name || `Client ${idx + 1}`}
                    className="h-10 md:h-12 w-auto object-contain select-none pointer-events-none grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300"
                  />
                ) : (
                  <div className="h-10 md:h-12 w-24 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${brandColor}10` }}>
                    <ImageIcon size={18} className="text-slate-300" />
                  </div>
                )}
                {item.name && (
                  <div className="text-[10px] text-slate-400 text-center mt-2 opacity-0 group-hover:opacity-100 transition-opacity truncate max-w-full">
                    {item.name}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// ============ VIDEO SECTION ============
// 3 Styles: centered, split, fullwidth
import { Play, Video as VideoIcon } from 'lucide-react';

type VideoStyle = 'centered' | 'split' | 'fullwidth';

// Helper: Extract video ID and type
const getVideoInfo = (url: string): { type: 'youtube' | 'vimeo' | 'direct'; id?: string } => {
  if (!url) return { type: 'direct' };
  const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&?/]+)/);
  if (ytMatch) return { type: 'youtube', id: ytMatch[1] };
  const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeoMatch) return { type: 'vimeo', id: vimeoMatch[1] };
  return { type: 'direct' };
};

const getYouTubeThumbnail = (videoId: string): string => `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

function VideoSection({ config, brandColor, title }: { config: Record<string, unknown>; brandColor: string; title: string }) {
  const videoUrl = (config.videoUrl as string) || '';
  const thumbnailUrl = (config.thumbnailUrl as string) || '';
  const heading = (config.heading as string) || title;
  const description = (config.description as string) || '';
  const style = (config.style as VideoStyle) || 'centered';
  const autoplay = config.autoplay as boolean || false;
  const loop = config.loop as boolean || false;
  const muted = config.muted as boolean ?? true;
  
  const [isPlaying, setIsPlaying] = React.useState(false);
  const videoInfo = getVideoInfo(videoUrl);
  const displayThumbnail = thumbnailUrl || (videoInfo.type === 'youtube' && videoInfo.id ? getYouTubeThumbnail(videoInfo.id) : '');

  // Video embed component
  const VideoEmbed = () => {
    if (!isPlaying) return null;
    
    const autoplayParams = autoplay ? '&autoplay=1' : '';
    const loopParams = loop ? '&loop=1' : '';
    const muteParams = muted ? '&mute=1' : '';
    
    if (videoInfo.type === 'youtube' && videoInfo.id) {
      return (
        <iframe 
          src={`https://www.youtube.com/embed/${videoInfo.id}?autoplay=1&rel=0${loopParams}${muteParams}`}
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      );
    }
    
    if (videoInfo.type === 'vimeo' && videoInfo.id) {
      return (
        <iframe 
          src={`https://player.vimeo.com/video/${videoInfo.id}?autoplay=1${loopParams}${muteParams}`}
          className="absolute inset-0 w-full h-full"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      );
    }
    
    return (
      <video 
        src={videoUrl}
        className="absolute inset-0 w-full h-full object-cover"
        controls
        autoPlay={autoplay}
        loop={loop}
        muted={muted}
      />
    );
  };

  // Play button
  const PlayButton = ({ size = 'lg' }: { size?: 'sm' | 'lg' }) => (
    <button 
      onClick={() => setIsPlaying(true)}
      className="absolute inset-0 flex items-center justify-center group transition-all bg-black/30 hover:bg-black/40"
    >
      <div 
        className={`rounded-full flex items-center justify-center transition-transform group-hover:scale-110 shadow-xl ${size === 'lg' ? 'w-16 h-16 md:w-20 md:h-20' : 'w-12 h-12'}`}
        style={{ backgroundColor: brandColor }}
      >
        <Play className={`text-white ml-1 ${size === 'lg' ? 'w-7 h-7 md:w-8 md:h-8' : 'w-5 h-5'}`} fill="white" />
      </div>
    </button>
  );

  if (!videoUrl) {
    return (
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="w-full aspect-video flex flex-col items-center justify-center rounded-xl" style={{ backgroundColor: `${brandColor}10` }}>
            <VideoIcon size={48} className="text-slate-300 mb-3" />
            <p className="text-sm text-slate-400">Chưa cấu hình video</p>
          </div>
        </div>
      </section>
    );
  }

  // Style 1: Centered
  if (style === 'centered') {
    return (
      <section className="py-12 md:py-16 px-4">
        <div className="max-w-4xl mx-auto">
          {(heading || description) && (
            <div className="text-center mb-8">
              {heading && <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">{heading}</h2>}
              {description && <p className="text-slate-500 max-w-2xl mx-auto">{description}</p>}
            </div>
          )}
          <div className="relative aspect-video rounded-xl overflow-hidden shadow-2xl bg-slate-900">
            {!isPlaying && displayThumbnail && <img src={displayThumbnail} alt="Video thumbnail" className="absolute inset-0 w-full h-full object-cover" />}
            {!isPlaying && !displayThumbnail && <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: `${brandColor}20` }}><VideoIcon size={64} className="text-slate-400" /></div>}
            {!isPlaying && <PlayButton />}
            <VideoEmbed />
          </div>
        </div>
      </section>
    );
  }

  // Style 2: Split
  if (style === 'split') {
    return (
      <section className="py-12 md:py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className="order-1">
              <div className="relative aspect-video rounded-xl overflow-hidden shadow-xl bg-slate-900">
                {!isPlaying && displayThumbnail && <img src={displayThumbnail} alt="Video thumbnail" className="absolute inset-0 w-full h-full object-cover" />}
                {!isPlaying && !displayThumbnail && <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: `${brandColor}20` }}><VideoIcon size={48} className="text-slate-400" /></div>}
                {!isPlaying && <PlayButton size="sm" />}
                <VideoEmbed />
              </div>
            </div>
            <div className="order-2">
              {heading && <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">{heading}</h2>}
              {description && <p className="text-slate-500 mb-6">{description}</p>}
              <a href="#" className="inline-block px-6 py-2.5 rounded-lg text-white font-medium text-sm transition-opacity hover:opacity-90" style={{ backgroundColor: brandColor }}>Tìm hiểu thêm</a>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Style 3: Fullwidth
  return (
    <section className="relative">
      <div className="relative overflow-hidden aspect-video md:aspect-[21/9] md:min-h-[400px]">
        {!isPlaying && displayThumbnail && <img src={displayThumbnail} alt="Video thumbnail" className="absolute inset-0 w-full h-full object-cover" />}
        {!isPlaying && !displayThumbnail && <div className="absolute inset-0" style={{ backgroundColor: `${brandColor}30` }} />}
        {!isPlaying && <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center px-4 md:px-8 lg:px-16">
            <div className="max-w-xl">
              {heading && <h2 className="text-xl md:text-3xl lg:text-4xl font-bold text-white mb-4">{heading}</h2>}
              {description && <p className="text-sm md:text-lg text-white/80 mb-6">{description}</p>}
              <button onClick={() => setIsPlaying(true)} className="flex items-center gap-3 px-6 py-3 rounded-lg text-white font-medium transition-transform hover:scale-105" style={{ backgroundColor: brandColor }}>
                <Play className="w-5 h-5" fill="white" />Xem video
              </button>
            </div>
          </div>
        )}
        <VideoEmbed />
      </div>
    </section>
  );
}

// ============ COUNTDOWN / PROMOTION SECTION ============
// 4 Styles: banner, floating, minimal, split
type CountdownStyle = 'banner' | 'floating' | 'minimal' | 'split';

// Countdown Timer Hook for live countdown
const useCountdownTimer = (endDate: string) => {
  const [timeLeft, setTimeLeft] = React.useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  React.useEffect(() => {
    const calculateTime = () => {
      const end = new Date(endDate).getTime();
      const now = Date.now();
      const diff = Math.max(0, end - now);

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [endDate]);

  return timeLeft;
};

function CountdownSection({ config, brandColor, title }: { config: Record<string, unknown>; brandColor: string; title: string }) {
  const heading = (config.heading as string) || title;
  const subHeading = (config.subHeading as string) || '';
  const description = (config.description as string) || '';
  const endDate = (config.endDate as string) || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const buttonText = (config.buttonText as string) || '';
  const buttonLink = (config.buttonLink as string) || '#';
  const backgroundImage = (config.backgroundImage as string) || '';
  const discountText = (config.discountText as string) || '';
  const showDays = config.showDays !== false;
  const showHours = config.showHours !== false;
  const showMinutes = config.showMinutes !== false;
  const showSeconds = config.showSeconds !== false;
  const style = (config.style as CountdownStyle) || 'banner';

  const timeLeft = useCountdownTimer(endDate);

  // Time Unit Component
  const TimeUnit = ({ value, label, variant = 'default' }: { value: number; label: string; variant?: 'default' | 'light' | 'outlined' }) => {
    if (variant === 'light') {
      return (
        <div className="flex flex-col items-center">
          <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 min-w-[50px] md:min-w-[60px]">
            <span className="text-2xl md:text-3xl font-bold text-white tabular-nums">{String(value).padStart(2, '0')}</span>
          </div>
          <span className="text-xs text-white/80 mt-1 uppercase tracking-wider">{label}</span>
        </div>
      );
    }
    if (variant === 'outlined') {
      return (
        <div className="flex flex-col items-center">
          <div className="border-2 rounded-lg px-3 py-2 min-w-[50px] md:min-w-[60px]" style={{ borderColor: brandColor }}>
            <span className="text-2xl md:text-3xl font-bold tabular-nums" style={{ color: brandColor }}>{String(value).padStart(2, '0')}</span>
          </div>
          <span className="text-xs text-slate-500 mt-1 uppercase tracking-wider">{label}</span>
        </div>
      );
    }
    return (
      <div className="flex flex-col items-center">
        <div className="rounded-lg px-3 py-2 min-w-[50px] md:min-w-[60px] text-white" style={{ backgroundColor: brandColor }}>
          <span className="text-2xl md:text-3xl font-bold tabular-nums">{String(value).padStart(2, '0')}</span>
        </div>
        <span className="text-xs text-slate-500 mt-1 uppercase tracking-wider">{label}</span>
      </div>
    );
  };

  // Timer Display
  const TimerDisplay = ({ variant = 'default' }: { variant?: 'default' | 'light' | 'outlined' }) => (
    <div className="flex items-center gap-2 md:gap-3">
      {showDays && (
        <>
          <TimeUnit value={timeLeft.days} label="Ngày" variant={variant} />
          <span className={`text-xl font-bold ${variant === 'light' ? 'text-white/60' : 'text-slate-300'}`}>:</span>
        </>
      )}
      {showHours && (
        <>
          <TimeUnit value={timeLeft.hours} label="Giờ" variant={variant} />
          <span className={`text-xl font-bold ${variant === 'light' ? 'text-white/60' : 'text-slate-300'}`}>:</span>
        </>
      )}
      {showMinutes && (
        <>
          <TimeUnit value={timeLeft.minutes} label="Phút" variant={variant} />
          {showSeconds && <span className={`text-xl font-bold ${variant === 'light' ? 'text-white/60' : 'text-slate-300'}`}>:</span>}
        </>
      )}
      {showSeconds && <TimeUnit value={timeLeft.seconds} label="Giây" variant={variant} />}
    </div>
  );

  // Style 1: Banner
  if (style === 'banner') {
    return (
      <section 
        className="relative w-full py-10 md:py-16 px-4 overflow-hidden"
        style={{ 
          background: backgroundImage 
            ? `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${backgroundImage}) center/cover`
            : `linear-gradient(135deg, ${brandColor} 0%, ${brandColor}cc 100%)`
        }}
      >
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10 blur-3xl" style={{ backgroundColor: 'white' }} />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-10 blur-3xl" style={{ backgroundColor: 'white' }} />
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          {discountText && (
            <div className="inline-block mb-4">
              <span className="bg-yellow-400 text-yellow-900 px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider animate-pulse">{discountText}</span>
            </div>
          )}
          {subHeading && <p className="text-white/80 text-sm md:text-base uppercase tracking-wider mb-2">{subHeading}</p>}
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4">{heading}</h2>
          {description && <p className="text-white/90 mb-6 max-w-2xl mx-auto">{description}</p>}
          <div className="flex justify-center mb-6"><TimerDisplay variant="light" /></div>
          {buttonText && (
            <a href={buttonLink} className="inline-flex items-center gap-2 px-8 py-3 bg-white rounded-lg font-semibold transition-transform hover:scale-105" style={{ color: brandColor }}>
              {buttonText}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </a>
          )}
        </div>
      </section>
    );
  }

  // Style 2: Floating
  if (style === 'floating') {
    return (
      <section className="py-8 md:py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div 
            className="relative rounded-2xl overflow-hidden shadow-2xl"
            style={{ 
              background: backgroundImage 
                ? `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${backgroundImage}) center/cover`
                : `linear-gradient(135deg, ${brandColor}ee 0%, ${brandColor} 100%)`
            }}
          >
            {discountText && (
              <div className="absolute -right-12 top-6 rotate-45 bg-yellow-400 text-yellow-900 px-12 py-1 text-sm font-bold shadow-lg">{discountText}</div>
            )}
            <div className="p-6 md:p-10 text-center">
              {subHeading && (
                <div className="inline-block mb-3 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm">
                  <span className="text-xs md:text-sm text-white font-medium uppercase tracking-wider">{subHeading}</span>
                </div>
              )}
              <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-3">{heading}</h2>
              {description && <p className="text-white/80 mb-6 text-sm md:text-base">{description}</p>}
              <div className="flex justify-center mb-6"><TimerDisplay variant="light" /></div>
              {buttonText && (
                <a href={buttonLink} className="inline-flex items-center gap-2 px-6 py-2.5 bg-white rounded-full font-semibold text-sm transition-all hover:shadow-lg hover:scale-105" style={{ color: brandColor }}>
                  {buttonText}
                </a>
              )}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Style 3: Minimal
  if (style === 'minimal') {
    return (
      <section className="py-10 md:py-14 px-4 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl border border-slate-200 p-6 md:p-10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex-1 text-center md:text-left">
                {discountText && (
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-3" style={{ backgroundColor: `${brandColor}15`, color: brandColor }}>{discountText}</span>
                )}
                {subHeading && <p className="text-sm text-slate-500 mb-1">{subHeading}</p>}
                <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-2">{heading}</h2>
                {description && <p className="text-slate-500 text-sm mb-4">{description}</p>}
                {buttonText && (
                  <a href={buttonLink} className="hidden md:inline-flex items-center gap-2 px-5 py-2 rounded-lg font-medium text-sm text-white transition-colors hover:opacity-90" style={{ backgroundColor: brandColor }}>
                    {buttonText}
                  </a>
                )}
              </div>
              <div className="flex flex-col items-center">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-3">Kết thúc sau</p>
                <TimerDisplay variant="outlined" />
                {buttonText && (
                  <a href={buttonLink} className="md:hidden inline-flex items-center gap-2 px-5 py-2 rounded-lg font-medium text-sm text-white mt-4 transition-colors hover:opacity-90" style={{ backgroundColor: brandColor }}>
                    {buttonText}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Style 4: Split
  return (
    <section className="py-8 md:py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="rounded-2xl overflow-hidden shadow-lg grid grid-cols-1 md:grid-cols-2">
          <div 
            className="relative flex items-center justify-center min-h-[200px] md:min-h-[300px]"
            style={{ 
              background: backgroundImage 
                ? `url(${backgroundImage}) center/cover`
                : `linear-gradient(135deg, ${brandColor}dd 0%, ${brandColor} 100%)`
            }}
          >
            {!backgroundImage && (
              <div className="text-center text-white p-6">
                {discountText && <div className="text-5xl md:text-7xl font-black mb-2">{discountText}</div>}
                <div className="text-lg md:text-xl font-medium opacity-90">GIẢM GIÁ</div>
              </div>
            )}
            {backgroundImage && discountText && (
              <div className="absolute top-4 left-4 bg-yellow-400 text-yellow-900 px-4 py-2 rounded-lg font-bold text-xl">{discountText}</div>
            )}
          </div>
          <div className="bg-white p-6 md:p-8 flex flex-col justify-center">
            {subHeading && <p className="text-sm uppercase tracking-wider mb-2" style={{ color: brandColor }}>{subHeading}</p>}
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-3">{heading}</h2>
            {description && <p className="text-slate-500 text-sm mb-5">{description}</p>}
            <div className="mb-5">
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Còn lại</p>
              <TimerDisplay variant="default" />
            </div>
            {buttonText && (
              <a href={buttonLink} className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-white transition-all hover:opacity-90 w-full md:w-auto" style={{ backgroundColor: brandColor }}>
                {buttonText}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// ============ FOOTER SECTION ============
// 6 Styles: classic, modern, corporate, minimal, centered, stacked
// Synced with previews.tsx FooterPreview
type FooterStyle = 'classic' | 'modern' | 'corporate' | 'minimal' | 'centered' | 'stacked';
type FooterColumn = { title: string; links: Array<{ label: string; url: string }> };
type SocialLinkItem = { platform: string; url: string; icon: string };

function FooterSection({ config, brandColor }: { config: Record<string, unknown>; brandColor: string }) {
  const style = (config.style as FooterStyle) || 'classic';
  const logo = (config.logo as string) || '';
  const description = (config.description as string) || 'Đối tác tin cậy của bạn trong mọi giải pháp công nghệ.';
  const columns = (config.columns as FooterColumn[]) || [];
  const socialLinks = (config.socialLinks as SocialLinkItem[]) || [];
  const copyright = (config.copyright as string) || '© 2024 VietAdmin. All rights reserved.';
  const showSocialLinks = config.showSocialLinks !== false;

  // Best Practice: Dùng brandColor đậm làm nền thay vì màu đen cứng
  const shadeColor = (hex: string, percent: number): string => {
    const num = parseInt(hex.replace('#', ''), 16);
    const R = Math.round((num >> 16) * (1 - percent / 100));
    const G = Math.round((num >> 8 & 0x00FF) * (1 - percent / 100));
    const B = Math.round((num & 0x0000FF) * (1 - percent / 100));
    return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
  };

  const bgDark = shadeColor(brandColor, 65);
  const bgMedium = shadeColor(brandColor, 50);
  const borderColor = shadeColor(brandColor, 30);

  const socialColors: Record<string, string> = {
    facebook: '#1877F2', instagram: '#E4405F', youtube: '#FF0000',
    tiktok: '#000000', zalo: '#0084FF', twitter: '#1DA1F2', linkedin: '#0A66C2'
  };

  // Social icons
  const renderSocialIcon = (platform: string, size: number = 18) => {
    switch (platform) {
      case 'facebook':
        return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>;
      case 'instagram':
        return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>;
      case 'youtube':
        return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="white"/></svg>;
      case 'tiktok':
        return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>;
      case 'zalo':
        return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M12.49 10.2722v-.4496h1.3467v6.3218h-.7704a.576.576 0 01-.5763-.5729l-.0006.0005a3.273 3.273 0 01-1.9372.6321c-1.8138 0-3.2844-1.4697-3.2844-3.2823 0-1.8125 1.4706-3.2822 3.2844-3.2822a3.273 3.273 0 011.9372.6321l.0006.0005zM6.9188 7.7896v.205c0 .3823-.051.6944-.2995 1.0605l-.03.0343c-.0542.0615-.1815.206-.2421.2843L2.024 14.8h4.8948v.7682a.5764.5764 0 01-.5767.5761H0v-.3622c0-.4436.1102-.6414.2495-.8476L4.8582 9.23H.1922V7.7896h6.7266zm8.5513 8.3548a.4805.4805 0 01-.4803-.4798v-7.875h1.4416v8.3548H15.47zM20.6934 9.6C22.52 9.6 24 11.0807 24 12.9044c0 1.8252-1.4801 3.306-3.3066 3.306-1.8264 0-3.3066-1.4808-3.3066-3.306 0-1.8237 1.4802-3.3044 3.3066-3.3044zm-10.1412 5.253c1.0675 0 1.9324-.8645 1.9324-1.9312 0-1.065-.865-1.9295-1.9324-1.9295s-1.9324.8644-1.9324 1.9295c0 1.0667.865 1.9312 1.9324 1.9312zm10.1412-.0033c1.0737 0 1.945-.8707 1.945-1.9453 0-1.073-.8713-1.9436-1.945-1.9436-1.0753 0-1.945.8706-1.945 1.9436 0 1.0746.8697 1.9453 1.945 1.9453z"/></svg>;
      default:
        return <Globe size={size} />;
    }
  };

  const getSocials = () => socialLinks.length > 0 ? socialLinks : [
    { platform: 'facebook', url: '#', icon: 'facebook' },
    { platform: 'instagram', url: '#', icon: 'instagram' },
    { platform: 'youtube', url: '#', icon: 'youtube' }
  ];

  const getColumns = () => columns.length > 0 ? columns : [
    { title: 'Về chúng tôi', links: [{ label: 'Giới thiệu', url: '/about' }, { label: 'Tuyển dụng', url: '/careers' }] },
    { title: 'Hỗ trợ', links: [{ label: 'FAQ', url: '/faq' }, { label: 'Liên hệ', url: '/contact' }] }
  ];

  // Style 1: Classic Dark
  if (style === 'classic') {
    return (
      <footer className="w-full text-white py-6 md:py-8" style={{ backgroundColor: bgDark, borderTop: `1px solid ${borderColor}` }}>
        <div className="max-w-7xl mx-auto px-3 md:px-4">
          <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-12">
            <div className="md:col-span-5 space-y-3 text-center md:text-left">
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <div className="p-1.5 rounded-lg" style={{ backgroundColor: bgMedium, border: `1px solid ${borderColor}` }}>
                  {logo ? <img src={logo} alt="Logo" className="h-5 w-5 object-contain brightness-110" /> : <div className="h-5 w-5 rounded flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: brandColor }}>V</div>}
                </div>
                <span className="text-base font-bold tracking-tight text-white">VietAdmin</span>
              </div>
              <p className="text-xs leading-relaxed text-white/80 md:max-w-sm">{description}</p>
              {showSocialLinks && (
                <div className="flex gap-2 justify-center md:justify-start">
                  {getSocials().map((s, i) => (
                    <a key={i} href={s.url} className="h-6 w-6 flex items-center justify-center rounded-full bg-white hover:opacity-80 transition-all" style={{ color: socialColors[s.platform] || '#94a3b8' }}>
                      {renderSocialIcon(s.platform, 14)}
                    </a>
                  ))}
                </div>
              )}
            </div>
            <div className="md:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-5 text-center md:text-left">
              {getColumns().slice(0, 3).map((col, i) => (
                <div key={i}>
                  <h3 className="font-semibold text-white text-xs tracking-wide mb-2">{col.title}</h3>
                  <ul className="space-y-1.5">
                    {col.links.map((link, j) => (
                      <li key={j}><a href={link.url} className="text-xs text-white/70 hover:text-white transition-colors">{link.label}</a></li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-6 pt-3 text-center md:text-left" style={{ borderTop: `1px solid ${borderColor}50` }}>
            <p className="text-[10px] text-white/60">{copyright}</p>
          </div>
        </div>
      </footer>
    );
  }

  // Style 2: Modern Center
  if (style === 'modern') {
    return (
      <footer className="w-full text-white py-6 md:py-8" style={{ backgroundColor: bgDark }}>
        <div className="max-w-5xl mx-auto px-3 md:px-4 flex flex-col items-center text-center space-y-3 md:space-y-4">
          <div className="flex flex-col items-center gap-2">
            <div className="h-10 w-10 rounded-xl flex items-center justify-center shadow-lg shadow-black/20 mb-1" style={{ background: `linear-gradient(to top right, ${bgMedium}, ${borderColor})` }}>
              {logo ? <img src={logo} alt="Logo" className="h-6 w-6 object-contain drop-shadow-md" /> : <div className="h-6 w-6 rounded-lg flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: brandColor }}>V</div>}
            </div>
            <h2 className="text-base font-bold text-white tracking-tight">VietAdmin</h2>
            <p className="text-xs leading-relaxed text-white/80 max-w-xs md:max-w-md">{description}</p>
          </div>
          <div className="flex flex-wrap justify-center gap-x-3 md:gap-x-4 gap-y-1.5">
            {getColumns().flatMap(col => col.links).slice(0, 8).map((link, i) => (
              <a key={i} href={link.url} className="text-xs font-medium text-white/70 hover:text-white hover:underline underline-offset-4 transition-all" style={{ textDecorationColor: brandColor }}>{link.label}</a>
            ))}
          </div>
          <div className="w-12 h-px" style={{ background: `linear-gradient(to right, transparent, ${borderColor}, transparent)` }}></div>
          {showSocialLinks && (
            <div className="flex gap-3">
              {getSocials().map((s, i) => (
                <a key={i} href={s.url} className="h-6 w-6 flex items-center justify-center rounded-full bg-white hover:opacity-80 transition-all" style={{ color: socialColors[s.platform] || '#94a3b8' }}>
                  {renderSocialIcon(s.platform, 14)}
                </a>
              ))}
            </div>
          )}
          <p className="text-[10px] font-medium text-white/60">{copyright}</p>
        </div>
      </footer>
    );
  }

  // Style 3: Corporate
  if (style === 'corporate') {
    return (
      <footer className="w-full text-white py-6 md:py-8" style={{ backgroundColor: bgDark, borderTop: `1px solid ${borderColor}` }}>
        <div className="max-w-7xl mx-auto px-3 md:px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3 pb-4" style={{ borderBottom: `1px solid ${borderColor}` }}>
            <div className="flex items-center gap-2">
              {logo ? <img src={logo} alt="Logo" className="h-5 w-5 object-contain" /> : <div className="h-5 w-5 rounded flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: brandColor }}>V</div>}
              <span className="text-sm font-bold text-white">VietAdmin</span>
            </div>
            {showSocialLinks && (
              <div className="flex gap-2">
                {getSocials().map((s, i) => (
                  <a key={i} href={s.url} className="h-5 w-5 flex items-center justify-center rounded-full bg-white hover:opacity-80 transition-all" style={{ color: socialColors[s.platform] || '#94a3b8' }}>
                    {renderSocialIcon(s.platform, 12)}
                  </a>
                ))}
              </div>
            )}
          </div>
          <div className="py-5 grid grid-cols-1 md:grid-cols-4 gap-5 text-center md:text-left">
            <div className="md:col-span-2 md:pr-4">
              <h4 className="text-[10px] font-bold text-white uppercase tracking-wider mb-2">Về Công Ty</h4>
              <p className="text-xs leading-relaxed text-white/80">{description}</p>
            </div>
            {getColumns().slice(0, 2).map((col, i) => (
              <div key={i}>
                <h4 className="text-[10px] font-bold text-white uppercase tracking-wider mb-2">{col.title}</h4>
                <ul className="space-y-1">
                  {col.links.map((link, j) => (
                    <li key={j}><a href={link.url} className="text-xs text-white/70 hover:text-white transition-colors">{link.label}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="pt-3 text-center md:text-left">
            <p className="text-[10px] text-white/60">{copyright}</p>
          </div>
        </div>
      </footer>
    );
  }

  // Style 4: Minimal
  if (style === 'minimal') {
    return (
      <footer className="w-full text-white py-3 md:py-4" style={{ backgroundColor: bgDark, borderTop: `1px solid ${borderColor}` }}>
        <div className="max-w-7xl mx-auto px-3 md:px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex flex-col md:flex-row items-center gap-2">
              {logo ? <img src={logo} alt="Logo" className="h-4 w-4 opacity-80" /> : <div className="h-4 w-4 rounded flex items-center justify-center text-white text-[10px] font-bold" style={{ backgroundColor: brandColor }}>V</div>}
              <span className="text-[10px] font-medium text-white/60">{copyright}</span>
            </div>
            {showSocialLinks && (
              <div className="flex gap-2">
                {getSocials().map((s, i) => (
                  <a key={i} href={s.url} className="h-5 w-5 flex items-center justify-center rounded-full bg-white hover:opacity-80 transition-all" style={{ color: socialColors[s.platform] || '#94a3b8' }}>
                    {renderSocialIcon(s.platform, 12)}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </footer>
    );
  }

  // Style 5: Centered
  if (style === 'centered') {
    return (
      <footer className="w-full text-white py-8 md:py-10" style={{ backgroundColor: bgDark }}>
        <div className="max-w-6xl mx-auto px-3 md:px-4 text-center">
          <div className="flex flex-col items-center gap-3 mb-6">
            <div className="h-12 w-12 rounded-2xl flex items-center justify-center shadow-lg" style={{ backgroundColor: `${brandColor}20`, border: `2px solid ${brandColor}40` }}>
              {logo ? <img src={logo} alt="Logo" className="h-7 w-7 object-contain" /> : <div className="h-7 w-7 rounded-lg flex items-center justify-center text-white font-bold" style={{ backgroundColor: brandColor }}>V</div>}
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">VietAdmin</h2>
            <p className="text-xs leading-relaxed text-white/70 max-w-xs md:max-w-md">{description}</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-6">
            {getColumns().slice(0, 4).map((col, i) => (
              <div key={i} className="text-center">
                <h4 className="text-[10px] font-bold text-white uppercase tracking-wider mb-2">{col.title}</h4>
                <ul className="space-y-1">
                  {col.links.slice(0, 4).map((link, j) => (
                    <li key={j}><a href={link.url} className="text-xs text-white/60 hover:text-white transition-colors">{link.label}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="w-16 h-px mx-auto mb-5" style={{ background: `linear-gradient(to right, transparent, ${brandColor}, transparent)` }}></div>
          {showSocialLinks && (
            <div className="flex justify-center gap-3 mb-4">
              {getSocials().map((s, i) => (
                <a key={i} href={s.url} className="h-8 w-8 flex items-center justify-center rounded-full transition-all hover:scale-110" style={{ backgroundColor: `${brandColor}20`, color: '#fff', border: `1px solid ${brandColor}30` }}>
                  {renderSocialIcon(s.platform, 16)}
                </a>
              ))}
            </div>
          )}
          <p className="text-[10px] text-white/50">{copyright}</p>
        </div>
      </footer>
    );
  }

  // Style 6: Stacked (default)
  return (
    <footer className="w-full text-white py-6" style={{ backgroundColor: bgDark, borderTop: `3px solid ${brandColor}` }}>
      <div className="max-w-4xl mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-3 mb-5 text-center md:text-left">
          <div className="h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: brandColor }}>
            {logo ? <img src={logo} alt="Logo" className="h-6 w-6 object-contain brightness-110" /> : <span className="text-white font-bold text-sm">V</span>}
          </div>
          <div className="md:flex-1">
            <h3 className="text-sm font-bold text-white mb-1">VietAdmin</h3>
            <p className="text-xs text-white/70 leading-relaxed line-clamp-2">{description}</p>
          </div>
        </div>
        <div className="mb-5 pb-4" style={{ borderBottom: `1px solid ${borderColor}` }}>
          <div className="flex flex-wrap justify-center md:justify-start gap-x-3 md:gap-x-4 gap-y-2">
            {getColumns().flatMap(col => col.links).slice(0, 10).map((link, i) => (
              <a key={i} href={link.url} className="text-xs font-medium text-white/60 hover:text-white transition-colors">{link.label}</a>
            ))}
          </div>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {showSocialLinks && (
            <div className="flex gap-2">
              {getSocials().map((s, i) => (
                <a key={i} href={s.url} className="h-7 w-7 flex items-center justify-center rounded-lg transition-all" style={{ backgroundColor: `${brandColor}15`, color: '#fff' }}>
                  {renderSocialIcon(s.platform, 14)}
                </a>
              ))}
            </div>
          )}
          <p className="text-[10px] text-white/50">{copyright}</p>
        </div>
      </div>
    </footer>
  );
}

// ============ PLACEHOLDER SECTION ============
function PlaceholderSection({ type, title }: { type: string; title: string }) {
  return (
    <section className="py-16 px-4 bg-slate-100">
      <div className="max-w-4xl mx-auto text-center">
        <LayoutTemplate size={48} className="mx-auto mb-4 text-slate-400" />
        <h3 className="text-xl font-semibold text-slate-600 mb-2">{title}</h3>
        <p className="text-slate-500">Component type "{type}" chưa được implement</p>
      </div>
    </section>
  );
}
