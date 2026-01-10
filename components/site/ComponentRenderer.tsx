'use client';

import React from 'react';
import { useBrandColor } from './hooks';
import { BlogSection } from './BlogSection';
import { ProductListSection } from './ProductListSection';
import { ServiceListSection } from './ServiceListSection';
import { 
  LayoutTemplate, Package, FileText, HelpCircle, MousePointerClick, 
  Users, Star, Phone, Briefcase, Image as ImageIcon, Check
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
    case 'TrustBadges':
      return <GallerySection config={config} brandColor={brandColor} title={title} type={type} />;
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
    default:
      return <PlaceholderSection type={type} title={title} />;
  }
}

// ============ HERO SECTION ============
// Best Practice: Blurred Background Fill - fills letterbox gaps with blurred version of same image
// Supports 3 styles: slider, fade (with thumbnails), bento (grid)
type HeroStyle = 'slider' | 'fade' | 'bento';

function HeroSection({ config, brandColor }: { config: Record<string, unknown>; brandColor: string }) {
  const slides = (config.slides as Array<{ image: string; link: string }>) || [];
  const style = (config.style as HeroStyle) || 'slider';
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

  return null;
}

// ============ STATS SECTION ============
// Professional Stats UI/UX - 3 Variants from professional-stats-components
type StatsStyle = 'horizontal' | 'cards' | 'icons';
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

// ============ ABOUT SECTION ============
function AboutSection({ config, brandColor, title }: { config: Record<string, unknown>; brandColor: string; title: string }) {
  const { subHeading, heading, description, image, buttonText, buttonLink, stats } = config as {
    subHeading?: string;
    heading?: string;
    description?: string;
    image?: string;
    buttonText?: string;
    buttonLink?: string;
    stats?: Array<{ value: string; label: string }>;
  };

  return (
    <section className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            {subHeading && (
              <p className="text-sm font-medium mb-2" style={{ color: brandColor }}>{subHeading}</p>
            )}
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900">{heading || title}</h2>
            <p className="text-slate-600 mb-6">{description}</p>
            
            {stats && stats.length > 0 && (
              <div className="flex gap-8 mb-6">
                {stats.map((stat, idx) => (
                  <div key={idx}>
                    <div className="text-2xl font-bold" style={{ color: brandColor }}>{stat.value}</div>
                    <div className="text-sm text-slate-500">{stat.label}</div>
                  </div>
                ))}
              </div>
            )}
            
            {buttonText && (
              <a
                href={buttonLink || '#'}
                className="inline-flex px-6 py-3 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
                style={{ backgroundColor: brandColor }}
              >
                {buttonText}
              </a>
            )}
          </div>
          <div>
            {image ? (
              <img src={image} alt="" className="w-full rounded-xl shadow-lg" />
            ) : (
              <div className="aspect-video bg-slate-200 rounded-xl flex items-center justify-center">
                <ImageIcon size={48} className="text-slate-400" />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// ============ SERVICES SECTION ============
type ServicesStyle = 'grid' | 'list' | 'icons';
function ServicesSection({ config, brandColor, title }: { config: Record<string, unknown>; brandColor: string; title: string }) {
  const items = (config.items as Array<{ icon?: string; title: string; description: string }>) || [];
  const style = (config.style as ServicesStyle) || 'grid';

  // Style 1: Grid
  if (style === 'grid') {
    return (
      <section className="py-16 px-4 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-slate-900">{title}</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {items.map((item, idx) => (
              <div key={idx} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: `${brandColor}15` }}>
                  <Briefcase size={24} style={{ color: brandColor }} />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-slate-900">{item.title}</h3>
                <p className="text-slate-600 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Style 2: List
  if (style === 'list') {
    return (
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-slate-900">{title}</h2>
          <div className="space-y-6">
            {items.map((item, idx) => (
              <div key={idx} className="flex gap-4 items-start p-4 rounded-xl hover:bg-slate-50 transition-colors">
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold" style={{ backgroundColor: brandColor }}>{idx + 1}</div>
                <div>
                  <h4 className="font-semibold mb-1 text-slate-900">{item.title}</h4>
                  <p className="text-sm text-slate-500">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Style 3: Icons center
  return (
    <section className="py-16 px-4" style={{ backgroundColor: `${brandColor}05` }}>
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12 text-slate-900">{title}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {items.map((item, idx) => (
            <div key={idx} className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: brandColor }}>
                <Briefcase size={28} className="text-white" />
              </div>
              <h4 className="font-semibold mb-1 text-slate-900">{item.title}</h4>
              <p className="text-xs text-slate-500">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============ BENEFITS SECTION ============
type BenefitsStyle = 'timeline' | 'comparison' | 'highlights';
function BenefitsSection({ config, brandColor, title }: { config: Record<string, unknown>; brandColor: string; title: string }) {
  const items = (config.items as Array<{ icon?: string; title: string; description: string }>) || [];
  const style = (config.style as BenefitsStyle) || 'timeline';

  // Style 1: Timeline
  if (style === 'timeline') {
    return (
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-slate-900">{title}</h2>
          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-0.5" style={{ backgroundColor: `${brandColor}30` }}></div>
            <div className="space-y-8">
              {items.map((item, idx) => (
                <div key={idx} className="relative flex gap-6 pl-2">
                  <div className="relative z-10 flex-shrink-0">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: brandColor }}>{idx + 1}</div>
                  </div>
                  <div className="flex-1 bg-white rounded-xl p-5 border shadow-sm">
                    <h4 className="font-semibold mb-2 text-slate-900">{item.title}</h4>
                    <p className="text-sm text-slate-500">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Style 2: Comparison (Zigzag)
  if (style === 'comparison') {
    return (
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-slate-900">{title}</h2>
          <div className="space-y-8">
            {items.map((item, idx) => (
              <div key={idx} className={`flex items-center gap-8 ${idx % 2 === 1 ? 'flex-row-reverse' : ''}`}>
                <div className="flex-shrink-0 w-24 h-24 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${brandColor}15` }}>
                  <Star size={40} style={{ color: brandColor }} />
                </div>
                <div className={`flex-1 ${idx % 2 === 1 ? 'text-right' : ''}`}>
                  <h4 className="text-xl font-semibold mb-2 text-slate-900">{item.title}</h4>
                  <p className="text-slate-500">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Style 3: Highlights (Checklist)
  return (
    <section className="py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="rounded-2xl overflow-hidden flex flex-col md:flex-row">
          <div className="p-8 text-white md:w-2/5" style={{ backgroundColor: brandColor }}>
            <p className="text-sm opacity-80 mb-2">TẠI SAO CHỌN</p>
            <h2 className="text-3xl font-bold mb-4">{title}</h2>
            <p className="opacity-80">Những lý do khiến bạn tin tưởng lựa chọn dịch vụ của chúng tôi</p>
          </div>
          <div className="bg-white p-8 flex-1">
            <ul className="space-y-4">
              {items.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: `${brandColor}15` }}>
                    <Check size={14} style={{ color: brandColor }} />
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900">{item.title}</h4>
                    <p className="text-sm text-slate-500 mt-0.5">{item.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============ FAQ SECTION ============
type FaqStyle = 'accordion' | 'cards' | 'two-column';
function FAQSection({ config, brandColor, title }: { config: Record<string, unknown>; brandColor: string; title: string }) {
  const items = (config.items as Array<{ question: string; answer: string }>) || [];
  const style = (config.style as FaqStyle) || 'accordion';
  const [openIndex, setOpenIndex] = React.useState<number | null>(0);

  // Style 1: Accordion
  if (style === 'accordion') {
    return (
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-slate-900">{title}</h2>
          <div className="space-y-4">
            {items.map((item, idx) => (
              <div key={idx} className="border border-slate-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between font-medium text-slate-900 hover:bg-slate-50"
                >
                  {item.question}
                  <span className={`transition-transform ${openIndex === idx ? 'rotate-180' : ''}`} style={{ color: brandColor }}>▼</span>
                </button>
                {openIndex === idx && (
                  <div className="px-6 py-4 bg-slate-50 text-slate-600 border-t">{item.answer}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Style 2: Cards
  if (style === 'cards') {
    return (
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-slate-900">{title}</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {items.map((item, idx) => (
              <div key={idx} className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold" style={{ backgroundColor: brandColor }}>?</div>
                  <div>
                    <h4 className="font-semibold mb-2 text-slate-900">{item.question}</h4>
                    <p className="text-sm text-slate-500">{item.answer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Style 3: Two Column
  return (
    <section className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-3xl font-bold mb-4 text-slate-900" style={{ color: brandColor }}>{title}</h2>
            <p className="text-slate-500 mb-6">Tìm câu trả lời cho các thắc mắc phổ biến của bạn</p>
            <button className="px-6 py-3 rounded-lg text-white" style={{ backgroundColor: brandColor }}>Liên hệ hỗ trợ</button>
          </div>
          <div className="space-y-6">
            {items.map((item, idx) => (
              <div key={idx} className="border-b border-slate-200 pb-4">
                <h4 className="font-semibold mb-2 text-slate-900">{item.question}</h4>
                <p className="text-sm text-slate-500">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ============ CTA SECTION ============
type CTAStyle = 'banner' | 'centered' | 'split';
function CTASection({ config, brandColor }: { config: Record<string, unknown>; brandColor: string }) {
  const { title, description, buttonText, buttonLink, secondaryButtonText, secondaryButtonLink, style: ctaStyle } = config as {
    title?: string;
    description?: string;
    buttonText?: string;
    buttonLink?: string;
    secondaryButtonText?: string;
    secondaryButtonLink?: string;
    style?: CTAStyle;
  };
  const style = ctaStyle || 'banner';

  // Style 1: Banner (default)
  if (style === 'banner') {
    return (
      <section className="py-16 px-4" style={{ backgroundColor: brandColor }}>
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-white text-center md:text-left">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">{title || 'Sẵn sàng bắt đầu?'}</h2>
            <p className="opacity-90">{description}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            {buttonText && (
              <a href={buttonLink || '#'} className="px-8 py-3 bg-white rounded-lg font-medium hover:bg-slate-100 transition-colors" style={{ color: brandColor }}>{buttonText}</a>
            )}
            {secondaryButtonText && (
              <a href={secondaryButtonLink || '#'} className="px-8 py-3 border-2 border-white/50 text-white rounded-lg font-medium hover:bg-white/10">{secondaryButtonText}</a>
            )}
          </div>
        </div>
      </section>
    );
  }

  // Style 2: Centered
  if (style === 'centered') {
    return (
      <section className="py-20 px-4" style={{ backgroundColor: `${brandColor}10` }}>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: brandColor }}>{title || 'Sẵn sàng bắt đầu?'}</h2>
          <p className="text-slate-600 text-lg mb-8">{description}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {buttonText && (
              <a href={buttonLink || '#'} className="px-8 py-3 rounded-lg font-medium text-white" style={{ backgroundColor: brandColor }}>{buttonText}</a>
            )}
            {secondaryButtonText && (
              <a href={secondaryButtonLink || '#'} className="px-8 py-3 border-2 rounded-lg font-medium" style={{ borderColor: brandColor, color: brandColor }}>{secondaryButtonText}</a>
            )}
          </div>
        </div>
      </section>
    );
  }

  // Style 3: Split
  return (
    <section className="py-16 px-4" style={{ background: `linear-gradient(135deg, ${brandColor} 50%, ${brandColor}dd 100%)` }}>
      <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8 items-center">
        <div className="text-white text-center md:text-left">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">{title || 'Sẵn sàng bắt đầu?'}</h2>
          <p className="opacity-90">{description}</p>
        </div>
        <div className="flex justify-center md:justify-end">
          {buttonText && (
            <a href={buttonLink || '#'} className="px-8 py-3 bg-white rounded-lg font-medium shadow-lg" style={{ color: brandColor }}>{buttonText}</a>
          )}
        </div>
      </div>
    </section>
  );
}

// ============ TESTIMONIALS SECTION ============
function TestimonialsSection({ config, brandColor, title }: { config: Record<string, unknown>; brandColor: string; title: string }) {
  const items = (config.items as Array<{ name: string; role: string; content: string; rating: number }>) || [];

  return (
    <section className="py-16 px-4 bg-slate-50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12 text-slate-900">{title}</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {items.map((item, idx) => (
            <div key={idx} className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star
                    key={star}
                    size={16}
                    className={star <= item.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'}
                  />
                ))}
              </div>
              <p className="text-slate-600 mb-4">"{item.content}"</p>
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: brandColor }}
                >
                  {item.name.charAt(0)}
                </div>
                <div>
                  <div className="font-medium text-slate-900">{item.name}</div>
                  <div className="text-sm text-slate-500">{item.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============ CONTACT SECTION ============
type ContactStyle = 'split' | 'centered' | 'cards';
function ContactSection({ config, brandColor, title }: { config: Record<string, unknown>; brandColor: string; title: string }) {
  const { address, phone, email, workingHours, style: contactStyle } = config as {
    address?: string;
    phone?: string;
    email?: string;
    workingHours?: string;
    style?: ContactStyle;
  };
  const style = contactStyle || 'split';

  // Style 1: Split (form bên phải)
  if (style === 'split') {
    return (
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-slate-900">{title}</h2>
          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-6">
              {phone && (
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${brandColor}15` }}><Phone size={24} style={{ color: brandColor }} /></div>
                  <div><div className="text-sm text-slate-500">Điện thoại</div><div className="font-medium">{phone}</div></div>
                </div>
              )}
              {email && (
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${brandColor}15` }}><Phone size={24} style={{ color: brandColor }} /></div>
                  <div><div className="text-sm text-slate-500">Email</div><div className="font-medium">{email}</div></div>
                </div>
              )}
              {address && (
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${brandColor}15` }}><Phone size={24} style={{ color: brandColor }} /></div>
                  <div><div className="text-sm text-slate-500">Địa chỉ</div><div className="font-medium">{address}</div></div>
                </div>
              )}
            </div>
            <div className="bg-slate-100 rounded-xl p-8">
              <form className="space-y-4">
                <input type="text" placeholder="Họ tên" className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2" />
                <input type="email" placeholder="Email" className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2" />
                <textarea placeholder="Nội dung" rows={4} className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2"></textarea>
                <button type="submit" className="w-full py-3 text-white rounded-lg font-medium hover:opacity-90" style={{ backgroundColor: brandColor }}>Gửi tin nhắn</button>
              </form>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Style 2: Centered
  if (style === 'centered') {
    return (
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4 text-slate-900">{title}</h2>
          <p className="text-slate-500 mb-8">Chúng tôi luôn sẵn sàng hỗ trợ bạn</p>
          <div className="bg-white rounded-2xl p-8 border shadow-sm">
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {phone && (
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: `${brandColor}15` }}><Phone size={20} style={{ color: brandColor }} /></div>
                  <h4 className="font-medium text-sm mb-1">Điện thoại</h4>
                  <p className="text-xs text-slate-500">{phone}</p>
                </div>
              )}
              {email && (
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: `${brandColor}15` }}><Phone size={20} style={{ color: brandColor }} /></div>
                  <h4 className="font-medium text-sm mb-1">Email</h4>
                  <p className="text-xs text-slate-500">{email}</p>
                </div>
              )}
              {address && (
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: `${brandColor}15` }}><Phone size={20} style={{ color: brandColor }} /></div>
                  <h4 className="font-medium text-sm mb-1">Địa chỉ</h4>
                  <p className="text-xs text-slate-500">{address}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Style 3: Cards
  return (
    <section className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12 text-slate-900">{title}</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {phone && (
            <div className="bg-white rounded-xl p-6 border text-center">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: `${brandColor}15` }}><Phone size={20} style={{ color: brandColor }} /></div>
              <h4 className="font-medium mb-1">Điện thoại</h4>
              <p className="text-sm text-slate-500">{phone}</p>
            </div>
          )}
          {email && (
            <div className="bg-white rounded-xl p-6 border text-center">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: `${brandColor}15` }}><Phone size={20} style={{ color: brandColor }} /></div>
              <h4 className="font-medium mb-1">Email</h4>
              <p className="text-sm text-slate-500">{email}</p>
            </div>
          )}
          {address && (
            <div className="bg-white rounded-xl p-6 border text-center">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: `${brandColor}15` }}><Phone size={20} style={{ color: brandColor }} /></div>
              <h4 className="font-medium mb-1">Địa chỉ</h4>
              <p className="text-sm text-slate-500">{address}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// ============ GALLERY SECTION ============
type GalleryStyle = 'slider' | 'grid' | 'marquee';
function GallerySection({ config, brandColor, title, type }: { config: Record<string, unknown>; brandColor: string; title: string; type: string }) {
  const items = (config.items as Array<{ url: string; link?: string }>) || [];
  const style = (config.style as GalleryStyle) || 'grid';
  const [currentIndex, setCurrentIndex] = React.useState(0);

  // Style 1: Slider
  if (style === 'slider') {
    return (
      <section className="py-16 px-4 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-slate-900">{title}</h2>
          <div className="relative">
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {items.map((item, idx) => (
                <a key={idx} href={item.link || '#'} className="flex-shrink-0 w-32 h-20 bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow flex items-center justify-center p-2 border">
                  {item.url ? <img src={item.url} alt="" className="max-w-full max-h-full object-contain" /> : <ImageIcon size={24} className="text-slate-300" />}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Style 2: Grid (default)
  if (style === 'grid') {
    const cols = type === 'Partners' ? 'grid-cols-3 md:grid-cols-6' : 'grid-cols-2 md:grid-cols-4';
    return (
      <section className="py-16 px-4 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-slate-900">{title}</h2>
          <div className={`grid ${cols} gap-6`}>
            {items.map((item, idx) => (
              <a key={idx} href={item.link || '#'} className="block aspect-video bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                {item.url ? <img src={item.url} alt="" className="w-full h-full object-contain p-4" /> : <div className="w-full h-full flex items-center justify-center"><ImageIcon size={32} className="text-slate-300" /></div>}
              </a>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Style 3: Split/Marquee
  return (
    <section className="py-16 px-4" style={{ backgroundColor: `${brandColor}05` }}>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8 items-center">
          <div className="md:w-1/3 text-center md:text-left">
            <p className="text-sm font-semibold uppercase tracking-wider mb-2" style={{ color: brandColor }}>{type === 'Partners' ? 'Đối tác' : type === 'TrustBadges' ? 'Chứng nhận' : 'Bộ sưu tập'}</p>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">{title}</h2>
            <p className="text-sm text-slate-500">Được tin tưởng bởi các thương hiệu hàng đầu</p>
          </div>
          <div className="flex-1 grid grid-cols-3 gap-4">
            {items.slice(0, 6).map((item, idx) => (
              <a key={idx} href={item.link || '#'} className="aspect-[3/2] bg-white rounded-xl border flex items-center justify-center p-3 group">
                {item.url ? <img src={item.url} alt="" className="max-w-full max-h-full object-contain grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all" /> : <ImageIcon size={22} className="text-slate-300" />}
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ============ PRICING SECTION ============
function PricingSection({ config, brandColor, title }: { config: Record<string, unknown>; brandColor: string; title: string }) {
  const plans = (config.plans as Array<{ name: string; price: string; period: string; features: string[]; isPopular: boolean; buttonText: string; buttonLink: string }>) || [];

  return (
    <section className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12 text-slate-900">{title}</h2>
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
                <span className="text-3xl font-bold" style={{ color: brandColor }}>{plan.price}</span>
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

// ============ CAREER SECTION ============
function CareerSection({ config, brandColor, title }: { config: Record<string, unknown>; brandColor: string; title: string }) {
  const jobs = (config.jobs as Array<{ title: string; department: string; location: string; type: string; salary: string }>) || [];

  return (
    <section className="py-16 px-4 bg-slate-50">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12 text-slate-900">{title}</h2>
        <div className="space-y-4">
          {jobs.map((job, idx) => (
            <div key={idx} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg text-slate-900">{job.title}</h3>
                <div className="flex gap-4 text-sm text-slate-500 mt-1">
                  <span>{job.department}</span>
                  <span>•</span>
                  <span>{job.location}</span>
                  <span>•</span>
                  <span>{job.type}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium" style={{ color: brandColor }}>{job.salary}</div>
                <a href="#" className="text-sm hover:underline" style={{ color: brandColor }}>Ứng tuyển →</a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============ CASE STUDY SECTION ============
function CaseStudySection({ config, brandColor, title }: { config: Record<string, unknown>; brandColor: string; title: string }) {
  const projects = (config.projects as Array<{ title: string; category: string; image: string; description: string; link: string }>) || [];

  return (
    <section className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12 text-slate-900">{title}</h2>
        <div className="grid md:grid-cols-2 gap-8">
          {projects.map((project, idx) => (
            <a key={idx} href={project.link || '#'} className="group block bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="aspect-video bg-slate-100 overflow-hidden">
                {project.image ? (
                  <img src={project.image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon size={48} className="text-slate-300" />
                  </div>
                )}
              </div>
              <div className="p-6">
                <div className="text-sm font-medium mb-2" style={{ color: brandColor }}>{project.category}</div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{project.title}</h3>
                <p className="text-slate-600 text-sm">{project.description}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
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
