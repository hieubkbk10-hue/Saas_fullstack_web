'use client';

import React from 'react';
import { useBrandColor } from './hooks';
import { BlogSection } from './BlogSection';
import { ProductListSection } from './ProductListSection';
import { ServiceListSection } from './ServiceListSection';
import { 
  LayoutTemplate, Package, FileText, HelpCircle, MousePointerClick, 
  Users, Star, Phone, Briefcase, Image as ImageIcon, Check, ZoomIn, Maximize2, X,
  Building2, Clock, MapPin, Mail
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
// Brand Story UI/UX - 3 Variants: classic, bento, minimal
type AboutStyle = 'classic' | 'bento' | 'minimal';

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
  const { subHeading, heading, description, image, buttonText, buttonLink, stats, style } = config as {
    subHeading?: string;
    heading?: string;
    description?: string;
    image?: string;
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
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6 md:p-8">
                  <p className="text-white font-medium text-base md:text-lg">
                    Kiến tạo không gian làm việc hiện đại & bền vững.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Style 3: Minimal - Safe/Boring Design, Boxed Layout
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

// ============ SERVICES SECTION ============
// Professional Services UI/UX - 3 Variants: Elegant Grid, Modern List, Big Number
// No hover effects - mobile friendly
type ServicesStyle = 'elegantGrid' | 'modernList' | 'bigNumber';
function ServicesSection({ config, brandColor, title }: { config: Record<string, unknown>; brandColor: string; title: string }) {
  const items = (config.items as Array<{ icon?: string; title: string; description: string }>) || [];
  const style = (config.style as ServicesStyle) || 'elegantGrid';

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

  // Style 3: Big Number Tiles - Bento/Typographic style with giant numbers
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map((item, idx) => {
            const isHighlighted = idx === 1;
            return (
              <div 
                key={idx} 
                className={`relative overflow-hidden rounded-xl p-6 min-h-[180px] flex flex-col justify-end border ${
                  isHighlighted 
                    ? 'text-white border-transparent' 
                    : 'bg-slate-100/50 text-slate-900 border-slate-200/50'
                }`}
                style={isHighlighted ? { backgroundColor: brandColor } : {}}
              >
                {/* Giant Number Watermark */}
                <span className={`absolute -top-6 -right-3 text-[8rem] font-black leading-none select-none pointer-events-none ${
                  isHighlighted ? 'text-white opacity-[0.15]' : 'text-slate-900 opacity-[0.07]'
                }`}>
                  {idx + 1}
                </span>

                <div className="relative z-10 space-y-2">
                  {/* Accent bar */}
                  <div 
                    className="w-6 h-1 mb-3 opacity-50 rounded-full"
                    style={{ backgroundColor: isHighlighted ? 'white' : brandColor }}
                  />
                  <h3 className="text-lg md:text-xl font-bold tracking-tight">
                    {item.title}
                  </h3>
                  <p className={`text-sm leading-relaxed ${
                    isHighlighted ? 'text-white/90' : 'text-slate-500'
                  }`}>
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

// ============ BENEFITS SECTION ============
// 4 Professional Styles: Solid Cards, Accent List, Bold Bento, Icon Row
type BenefitsStyle = 'cards' | 'list' | 'bento' | 'row';
function BenefitsSection({ config, brandColor, title }: { config: Record<string, unknown>; brandColor: string; title: string }) {
  const items = (config.items as Array<{ icon?: string; title: string; description: string }>) || [];
  const style = (config.style as BenefitsStyle) || 'cards';

  // Style 1: Solid Cards - Corporate style với icon đậm màu chủ đạo
  if (style === 'cards') {
    return (
      <section className="py-12 md:py-16 px-4">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b-2" style={{ borderColor: `${brandColor}20` }}>
            <div className="space-y-2">
              <div className="inline-block px-3 py-1 rounded text-xs font-bold uppercase tracking-wider" style={{ backgroundColor: `${brandColor}15`, color: brandColor }}>
                Vì sao chọn chúng tôi?
              </div>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
                {title}
              </h2>
            </div>
          </div>
          
          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {items.map((item, idx) => (
              <div 
                key={idx} 
                className="rounded-xl p-5 md:p-6 shadow-sm flex flex-col items-start border"
                style={{ backgroundColor: `${brandColor}08`, borderColor: `${brandColor}20` }}
              >
                <div 
                  className="w-11 h-11 md:w-12 md:h-12 rounded-lg flex items-center justify-center mb-4 text-white"
                  style={{ backgroundColor: brandColor, boxShadow: `0 4px 6px -1px ${brandColor}30` }}
                >
                  <Check size={18} strokeWidth={3} />
                </div>
                <h3 className="font-bold text-base md:text-lg mb-2" style={{ color: brandColor }}>
                  {item.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {item.description}
                </p>
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
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b-2" style={{ borderColor: `${brandColor}20` }}>
            <div className="space-y-2">
              <div className="inline-block px-3 py-1 rounded text-xs font-bold uppercase tracking-wider" style={{ backgroundColor: `${brandColor}15`, color: brandColor }}>
                Vì sao chọn chúng tôi?
              </div>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
                {title}
              </h2>
            </div>
          </div>
          
          {/* List */}
          <div className="flex flex-col gap-3">
            {items.map((item, idx) => (
              <div 
                key={idx} 
                className="relative bg-white border border-slate-200/60 rounded-lg p-4 md:p-5 pl-5 md:pl-6 overflow-hidden shadow-sm"
              >
                {/* Thanh màu bên trái */}
                <div className="absolute top-0 bottom-0 left-0 w-1.5" style={{ backgroundColor: brandColor }} />
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-3">
                  <div className="flex items-start gap-3 md:gap-4">
                    <div className="flex-shrink-0 mt-0.5">
                      <div 
                        className="w-6 h-6 rounded-full flex items-center justify-center border"
                        style={{ backgroundColor: `${brandColor}15`, borderColor: `${brandColor}30` }}
                      >
                        <span className="text-[11px] font-bold" style={{ color: brandColor }}>{idx + 1}</span>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm md:text-base">
                        {item.title}
                      </h3>
                      <p className="text-xs md:text-sm text-slate-500 mt-1 md:mt-1.5 leading-normal">
                        {item.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="hidden md:block">
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
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b-2" style={{ borderColor: `${brandColor}20` }}>
            <div className="space-y-2">
              <div className="inline-block px-3 py-1 rounded text-xs font-bold uppercase tracking-wider" style={{ backgroundColor: `${brandColor}15`, color: brandColor }}>
                Vì sao chọn chúng tôi?
              </div>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
                {title}
              </h2>
            </div>
          </div>
          
          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
            {items.slice(0, 4).map((item, idx) => {
              const isWide = idx === 0 || idx === 3;
              const isPrimary = idx === 0;
              
              return (
                <div 
                  key={idx} 
                  className={`flex flex-col justify-between p-5 md:p-6 lg:p-8 rounded-2xl transition-colors min-h-[160px] md:min-h-[180px] ${
                    isWide ? 'md:col-span-2' : 'md:col-span-1'
                  } ${
                    isPrimary 
                      ? 'text-white border border-transparent' 
                      : 'bg-white border border-slate-200/60'
                  }`}
                  style={isPrimary ? { backgroundColor: brandColor, boxShadow: `0 10px 15px -3px ${brandColor}30` } : {}}
                >
                  {/* Header: Number Index */}
                  <div className="flex justify-between items-start mb-3 md:mb-4">
                    <span 
                      className={`text-xs font-bold uppercase tracking-widest px-2 py-1 rounded ${
                        isPrimary ? 'bg-white/20 text-white' : ''
                      }`}
                      style={!isPrimary ? { backgroundColor: `${brandColor}15`, color: brandColor } : {}}
                    >
                      0{idx + 1}
                    </span>
                  </div>

                  {/* Content: Pure Typography */}
                  <div>
                    <h3 className={`font-bold text-lg md:text-xl lg:text-2xl mb-2 md:mb-3 tracking-tight ${
                      isPrimary ? 'text-white' : 'text-slate-900'
                    }`}>
                      {item.title}
                    </h3>
                    <p className={`text-sm md:text-base leading-relaxed font-medium ${
                      isPrimary ? 'text-white/90' : 'text-slate-500'
                    }`}>
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

  // Style 4: Icon Row - Horizontal layout với dividers
  return (
    <section className="py-12 md:py-16 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b-2" style={{ borderColor: `${brandColor}20` }}>
          <div className="space-y-2">
            <div className="inline-block px-3 py-1 rounded text-xs font-bold uppercase tracking-wider" style={{ backgroundColor: `${brandColor}15`, color: brandColor }}>
              Vì sao chọn chúng tôi?
            </div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
              {title}
            </h2>
          </div>
        </div>
        
        {/* Row */}
        <div className="bg-white border-y-2 rounded-lg overflow-hidden" style={{ borderColor: `${brandColor}15` }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x" style={{ borderColor: `${brandColor}15` }}>
            {items.map((item, idx) => (
              <div key={idx} className="p-5 md:p-6 lg:p-8 flex flex-col items-center text-center">
                <div 
                  className="mb-3 md:mb-4 p-3 rounded-full"
                  style={{ 
                    backgroundColor: `${brandColor}15`, 
                    color: brandColor,
                    boxShadow: `0 0 0 4px ${brandColor}08`
                  }}
                >
                  <Check size={22} strokeWidth={3} />
                </div>
                <h3 className="font-bold text-slate-900 mb-1.5 md:mb-2 text-sm md:text-base">{item.title}</h3>
                <p className="text-xs md:text-sm text-slate-500 leading-relaxed">{item.description}</p>
              </div>
            ))}
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
// 3 Professional Styles: Cards, Slider, Masonry
type TestimonialsStyle = 'cards' | 'slider' | 'masonry';
function TestimonialsSection({ config, brandColor, title }: { config: Record<string, unknown>; brandColor: string; title: string }) {
  const items = (config.items as Array<{ name: string; role: string; content: string; rating: number }>) || [];
  const style = (config.style as TestimonialsStyle) || 'cards';
  const [currentSlide, setCurrentSlide] = React.useState(0);

  // Auto slide for slider style
  React.useEffect(() => {
    if (style !== 'slider' || items.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % items.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [items.length, style]);

  const renderStars = (rating: number) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <Star key={star} size={16} className={star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'} />
      ))}
    </div>
  );

  // Style 1: Cards - Grid layout
  if (style === 'cards') {
    return (
      <section className="py-16 px-4 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-slate-900">{title}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item, idx) => (
              <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                {renderStars(item.rating)}
                <p className="text-slate-600 my-4 line-clamp-4">"{item.content}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: brandColor }}>
                    {(item.name || 'U').charAt(0)}
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

  // Style 2: Slider - Single testimonial with navigation
  if (style === 'slider') {
    const current = items[currentSlide] || items[0];
    if (!current) return null;

    return (
      <section className="py-16 md:py-20 px-4 bg-slate-50 relative overflow-hidden">
        {/* Big quote decoration */}
        <div className="absolute top-8 left-1/2 -translate-x-1/2 text-[120px] md:text-[180px] leading-none font-serif opacity-5 pointer-events-none select-none" style={{ color: brandColor }}>"</div>
        
        <div className="max-w-4xl mx-auto relative">
          <h2 className="text-3xl font-bold text-center mb-12 text-slate-900">{title}</h2>
          
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center relative" style={{ borderTop: `4px solid ${brandColor}` }}>
            <div className="flex justify-center mb-6">{renderStars(current.rating)}</div>
            <p className="text-lg md:text-xl text-slate-700 leading-relaxed mb-8">"{current.content}"</p>
            <div className="flex items-center justify-center gap-4">
              <div className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg" style={{ backgroundColor: brandColor }}>
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
                className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-slate-50 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
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

  // Style 3: Masonry - Pinterest-like layout
  return (
    <section className="py-16 px-4 bg-slate-50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12 text-slate-900">{title}</h2>
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6">
          {items.map((item, idx) => (
            <div key={idx} className={`break-inside-avoid mb-6 bg-white rounded-xl p-6 shadow-sm border border-slate-100 ${idx % 2 === 1 ? 'pt-8' : ''}`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: brandColor }}>
                  {(item.name || 'U').charAt(0)}
                </div>
                <div>
                  <div className="font-medium text-slate-900">{item.name}</div>
                  <div className="text-sm text-slate-500">{item.role}</div>
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
// Gallery: 3 Professional Styles from pure-visual-gallery (Spotlight, Explore, Stories)
// Partners: 4 Professional Styles from partner-&-logo-manager (Grid, Marquee, Mono, Badge)
type GalleryStyle = 'spotlight' | 'explore' | 'stories' | 'grid' | 'marquee' | 'mono' | 'badge';

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
              className="bg-slate-100/50 hover:bg-slate-100 px-4 py-2 rounded-lg border border-transparent hover:border-slate-200/50 transition-all flex items-center gap-3 cursor-pointer"
              style={{ borderColor: `${brandColor}10` }}
            >
              {item.url ? (
                <img src={item.url} alt="" className="h-5 w-auto grayscale" />
              ) : (
                <ImageIcon size={20} className="text-slate-400" />
              )}
              <span className="text-xs font-semibold text-slate-500">Partner {idx + 1}</span>
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
