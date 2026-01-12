'use client';

import React, { useState } from 'react';
import { 
  Monitor, Tablet, Smartphone, Eye, ChevronLeft, ChevronRight, 
  Image as ImageIcon, Star, Check, ExternalLink, Globe, Mail, 
  Phone, Package, FileText, Users, MapPin, Tag, ArrowUpRight, Briefcase, Plus, ArrowRight
} from 'lucide-react';
import { cn, Card, CardHeader, CardTitle, CardContent } from '../components/ui';

type PreviewDevice = 'desktop' | 'tablet' | 'mobile';

const deviceWidths = {
  desktop: 'w-full max-w-7xl',
  tablet: 'w-[768px] max-w-full',
  mobile: 'w-[375px] max-w-full'
};

const devices = [
  { id: 'desktop' as const, icon: Monitor, label: 'Desktop (max-w-7xl)' },
  { id: 'tablet' as const, icon: Tablet, label: 'Tablet (768px)' },
  { id: 'mobile' as const, icon: Smartphone, label: 'Mobile (375px)' }
];

// Browser Frame Component
const BrowserFrame = ({ children, url = 'yoursite.com' }: { children: React.ReactNode; url?: string }) => (
  <div className="border rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-lg">
    <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2 flex items-center gap-2 border-b">
      <div className="flex gap-1.5">
        <div className="w-3 h-3 rounded-full bg-red-400"></div>
        <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
        <div className="w-3 h-3 rounded-full bg-green-400"></div>
      </div>
      <div className="flex-1 ml-4">
        <div className="bg-white dark:bg-slate-700 rounded-md px-3 py-1 text-xs text-slate-400 max-w-xs">{url}</div>
      </div>
    </div>
    {children}
  </div>
);

// Preview Wrapper Component
const PreviewWrapper = ({ 
  title, 
  children, 
  device, 
  setDevice, 
  previewStyle, 
  setPreviewStyle, 
  styles,
  info 
}: { 
  title: string;
  children: React.ReactNode;
  device: PreviewDevice;
  setDevice: (d: PreviewDevice) => void;
  previewStyle: string;
  setPreviewStyle: (s: string) => void;
  styles: Array<{ id: string; label: string }>;
  info?: string;
}) => (
  <Card className="mt-6">
    <CardHeader className="pb-3">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Eye size={18} /> {title}
        </CardTitle>
        <div className="flex items-center gap-4">
          <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
            {styles.map((s) => (
              <button key={s.id} type="button" onClick={() => setPreviewStyle(s.id)}
                className={cn("px-3 py-1 text-xs font-medium rounded-md transition-all",
                  previewStyle === s.id ? "bg-white dark:bg-slate-700 shadow-sm" : "text-slate-500 hover:text-slate-700")}>
                {s.label}
              </button>
            ))}
          </div>
          <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
            {devices.map((d) => (
              <button key={d.id} type="button" onClick={() => setDevice(d.id)} title={d.label}
                className={cn("p-1.5 rounded-md transition-all",
                  device === d.id ? "bg-white dark:bg-slate-700 shadow-sm" : "text-slate-400 hover:text-slate-600")}>
                <d.icon size={16} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </CardHeader>
    <CardContent>
      <div className={cn("mx-auto transition-all duration-300", deviceWidths[device])}>
        {children}
      </div>
      {info && (
        <div className="mt-3 text-xs text-slate-500">
          Style: <strong className="text-slate-700 dark:text-slate-300">{styles.find(s => s.id === previewStyle)?.label}</strong>
          {' • '}{device === 'desktop' && 'max-w-7xl (1280px)'}{device === 'tablet' && '768px'}{device === 'mobile' && '375px'}
          {info && ` • ${info}`}
        </div>
      )}
    </CardContent>
  </Card>
);

// ============ HERO BANNER PREVIEW ============
// Admin chọn style -> lưu vào config -> trang chủ render theo style đã chọn
// Tất cả styles đều tuân thủ best practice: blurred background + object-contain + max-height
export type HeroStyle = 'slider' | 'fade' | 'bento';

export const HeroBannerPreview = ({ 
  slides, 
  brandColor,
  selectedStyle = 'slider',
  onStyleChange
}: { 
  slides: Array<{ id: number; image: string; link: string }>; 
  brandColor: string;
  selectedStyle?: HeroStyle;
  onStyleChange?: (style: HeroStyle) => void;
}) => {
  const [device, setDevice] = useState<PreviewDevice>('desktop');
  const [currentSlide, setCurrentSlide] = useState(0);

  const styles = [
    { id: 'slider' as const, label: 'Slider' },
    { id: 'fade' as const, label: 'Fade + Thumbs' },
    { id: 'bento' as const, label: 'Bento Grid' }
  ];

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  // Helper: Render slide với blurred background (best practice)
  const renderSlideWithBlur = (slide: { image: string }, idx: number) => (
    <div className="block w-full h-full relative">
      {/* Blurred background layer - fills letterbox gaps */}
      <div 
        className="absolute inset-0 scale-110"
        style={{
          backgroundImage: `url(${slide.image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(30px)',
        }}
      />
      {/* Dark overlay to soften blur */}
      <div className="absolute inset-0 bg-black/20" />
      {/* Main image - object-contain to show full image */}
      <img 
        src={slide.image} 
        alt={`Slide ${idx + 1}`}
        className="relative w-full h-full object-contain z-10"
      />
    </div>
  );

  // Helper: Render placeholder khi chưa có ảnh
  const renderPlaceholder = (idx: number) => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-2" style={{ backgroundColor: `${brandColor}25` }}>
        <ImageIcon size={24} style={{ color: brandColor }} />
      </div>
      <div className="text-sm font-medium text-slate-400">Banner #{idx + 1}</div>
      <div className="text-xs text-slate-500 mt-1">Khuyến nghị: 1920x600px</div>
    </div>
  );

  // Style 1: Slider - slide ngang với dots
  const renderSliderStyle = () => (
    <section className="relative w-full bg-slate-900 overflow-hidden">
      <div className={cn(
        "relative w-full",
        device === 'mobile' ? 'aspect-[16/9] max-h-[200px]' : device === 'tablet' ? 'aspect-[16/9] max-h-[250px]' : 'aspect-[21/9] max-h-[280px]'
      )}>
        {slides.length > 0 ? (
          <>
            {slides.map((slide, idx) => (
              <div key={slide.id} className={cn("absolute inset-0 transition-opacity duration-700", idx === currentSlide ? "opacity-100" : "opacity-0 pointer-events-none")}>
                {slide.image ? renderSlideWithBlur(slide, idx) : renderPlaceholder(idx)}
              </div>
            ))}
            {slides.length > 1 && (
              <>
                <button type="button" onClick={prevSlide} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white shadow-lg flex items-center justify-center transition-all z-20 border-2 border-transparent hover:scale-105" style={{ borderColor: `${brandColor}40` }}>
                  <ChevronLeft size={14} style={{ color: brandColor }} />
                </button>
                <button type="button" onClick={nextSlide} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white shadow-lg flex items-center justify-center transition-all z-20 border-2 border-transparent hover:scale-105" style={{ borderColor: `${brandColor}40` }}>
                  <ChevronRight size={14} style={{ color: brandColor }} />
                </button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                  {slides.map((_, idx) => (
                    <button key={idx} type="button" onClick={() => setCurrentSlide(idx)} className={cn("w-2 h-2 rounded-full transition-all", idx === currentSlide ? "w-6" : "bg-white/50")} style={idx === currentSlide ? { backgroundColor: brandColor } : {}} />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-800"><span className="text-slate-400 text-sm">Chưa có banner</span></div>
        )}
      </div>
    </section>
  );

  // Style 2: Fade + Thumbnails - fade với thumbnail navigation
  const renderFadeStyle = () => (
    <section className="relative w-full bg-slate-900 overflow-hidden">
      <div className={cn(
        "relative w-full",
        device === 'mobile' ? 'aspect-[16/9] max-h-[220px]' : device === 'tablet' ? 'aspect-[16/9] max-h-[270px]' : 'aspect-[21/9] max-h-[300px]'
      )}>
        {slides.length > 0 ? (
          <>
            {slides.map((slide, idx) => (
              <div key={slide.id} className={cn("absolute inset-0 transition-opacity duration-700", idx === currentSlide ? "opacity-100" : "opacity-0 pointer-events-none")}>
                {slide.image ? renderSlideWithBlur(slide, idx) : renderPlaceholder(idx)}
              </div>
            ))}
            {slides.length > 1 && (
              <div className="absolute bottom-0 left-0 right-0 p-2 flex justify-center gap-2 bg-gradient-to-t from-black/60 to-transparent z-20">
                {slides.map((slide, idx) => (
                  <button key={idx} type="button" onClick={() => setCurrentSlide(idx)}
                    className={cn("rounded overflow-hidden transition-all border-2", idx === currentSlide ? "scale-105" : "border-transparent opacity-70 hover:opacity-100", device === 'mobile' ? 'w-10 h-7' : 'w-14 h-9')}
                    style={idx === currentSlide ? { borderColor: brandColor } : {}}>
                    {slide.image ? <img src={slide.image} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full" style={{ backgroundColor: brandColor }}></div>}
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-800"><span className="text-slate-400 text-sm">Chưa có banner</span></div>
        )}
      </div>
    </section>
  );

  // Style 3: Bento Grid - layout dạng grid
  const renderBentoStyle = () => {
    const bentoSlides = slides.slice(0, 4);
    return (
      <section className="relative w-full bg-slate-900 overflow-hidden p-2">
        <div className={cn(
          "relative w-full",
          device === 'mobile' ? 'max-h-[240px]' : device === 'tablet' ? 'max-h-[280px]' : 'max-h-[300px]'
        )}>
          {device === 'mobile' ? (
            <div className="grid grid-cols-2 gap-2 h-full">
              {bentoSlides.slice(0, 4).map((slide, idx) => (
                <div key={slide.id} className="relative rounded-xl overflow-hidden aspect-video">
                  {slide.image ? (
                    <div className="w-full h-full relative">
                      <div className="absolute inset-0 scale-110" style={{ backgroundImage: `url(${slide.image})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(20px)' }} />
                      <div className="absolute inset-0 bg-black/20" />
                      <img src={slide.image} alt="" className="relative w-full h-full object-contain z-10" />
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: `${brandColor}${15 + idx * 5}` }}><ImageIcon size={20} className="text-white/50" /></div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-4 grid-rows-2 gap-2 h-full" style={{ height: device === 'desktop' ? '280px' : '260px' }}>
              <div className="col-span-2 row-span-2 relative rounded-xl overflow-hidden ring-2 ring-offset-1 ring-offset-slate-900" style={{ '--tw-ring-color': `${brandColor}60` } as React.CSSProperties}>
                {bentoSlides[0]?.image ? (
                  <div className="w-full h-full relative">
                    <div className="absolute inset-0 scale-110" style={{ backgroundImage: `url(${bentoSlides[0].image})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(25px)' }} />
                    <div className="absolute inset-0 bg-black/20" />
                    <img src={bentoSlides[0].image} alt="" className="relative w-full h-full object-contain z-10" />
                  </div>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center" style={{ backgroundColor: `${brandColor}15` }}>
                    <ImageIcon size={28} style={{ color: brandColor }} /><span className="text-xs text-slate-400 mt-1">Banner chính</span>
                  </div>
                )}
              </div>
              <div className="col-span-2 relative rounded-xl overflow-hidden">
                {bentoSlides[1]?.image ? (
                  <div className="w-full h-full relative">
                    <div className="absolute inset-0 scale-110" style={{ backgroundImage: `url(${bentoSlides[1].image})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(20px)' }} />
                    <div className="absolute inset-0 bg-black/20" />
                    <img src={bentoSlides[1].image} alt="" className="relative w-full h-full object-contain z-10" />
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: `${brandColor}20` }}><ImageIcon size={20} className="text-white/50" /></div>
                )}
              </div>
              <div className="relative rounded-xl overflow-hidden">
                {bentoSlides[2]?.image ? (
                  <div className="w-full h-full relative">
                    <div className="absolute inset-0 scale-110" style={{ backgroundImage: `url(${bentoSlides[2].image})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(15px)' }} />
                    <div className="absolute inset-0 bg-black/20" />
                    <img src={bentoSlides[2].image} alt="" className="relative w-full h-full object-contain z-10" />
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: `${brandColor}25` }}><ImageIcon size={16} className="text-white/50" /></div>
                )}
              </div>
              <div className="relative rounded-xl overflow-hidden">
                {bentoSlides[3]?.image ? (
                  <div className="w-full h-full relative">
                    <div className="absolute inset-0 scale-110" style={{ backgroundImage: `url(${bentoSlides[3].image})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(15px)' }} />
                    <div className="absolute inset-0 bg-black/20" />
                    <img src={bentoSlides[3].image} alt="" className="relative w-full h-full object-contain z-10" />
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: `${brandColor}30` }}><ImageIcon size={16} className="text-white/50" /></div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    );
  };

  return (
    <Card className="mt-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Eye size={18} /> Preview Hero
          </CardTitle>
          <div className="flex items-center gap-4">
            {/* Style selector - admin chọn style để lưu */}
            <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
              {styles.map((s) => (
                <button key={s.id} type="button" onClick={() => onStyleChange?.(s.id)}
                  className={cn("px-3 py-1 text-xs font-medium rounded-md transition-all",
                    selectedStyle === s.id ? "bg-white dark:bg-slate-700 shadow-sm" : "text-slate-500 hover:text-slate-700")}>
                  {s.label}
                </button>
              ))}
            </div>
            {/* Device selector */}
            <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
              {devices.map((d) => (
                <button key={d.id} type="button" onClick={() => setDevice(d.id)} title={d.label}
                  className={cn("p-1.5 rounded-md transition-all",
                    device === d.id ? "bg-white dark:bg-slate-700 shadow-sm" : "text-slate-400 hover:text-slate-600")}>
                  <d.icon size={16} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className={cn("mx-auto transition-all duration-300", deviceWidths[device])}>
          <BrowserFrame url="yoursite.com">
            {/* Fake header với accent line */}
            <div className="relative px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              {/* Subtle top accent line */}
              <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ backgroundColor: brandColor, opacity: 0.6 }} />
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: brandColor }}></div>
                <div className="w-20 h-3 bg-slate-200 dark:bg-slate-700 rounded"></div>
              </div>
              {device !== 'mobile' && <div className="flex gap-4">{[1,2,3,4].map(i => (<div key={i} className="w-12 h-2 bg-slate-100 dark:bg-slate-800 rounded"></div>))}</div>}
            </div>
            {/* Hero section - render theo style đã chọn */}
            {selectedStyle === 'slider' && renderSliderStyle()}
            {selectedStyle === 'fade' && renderFadeStyle()}
            {selectedStyle === 'bento' && renderBentoStyle()}
            {/* Fake content bên dưới */}
            <div className="p-4 space-y-3">
              <div className="flex gap-3">{[1,2,3,4].slice(0, device === 'mobile' ? 2 : 4).map(i => (<div key={i} className="flex-1 h-16 bg-slate-100 dark:bg-slate-800 rounded-lg"></div>))}</div>
            </div>
          </BrowserFrame>
        </div>
        <div className="mt-3 text-xs text-slate-500">
          Style: <strong className="text-slate-700 dark:text-slate-300">{styles.find(s => s.id === selectedStyle)?.label}</strong>
          {' • '}{device === 'desktop' && 'Desktop max-w-7xl (1280px)'}{device === 'tablet' && 'Tablet (768px)'}{device === 'mobile' && 'Mobile (375px)'}
          {selectedStyle !== 'bento' && ` • Slide ${currentSlide + 1} / ${slides.length || 1}`}
        </div>
      </CardContent>
    </Card>
  );
};

// ============ STATS PREVIEW ============
// Professional Stats UI/UX - 3 Variants from professional-stats-components
type StatsItem = { value: string; label: string };
export type StatsStyle = 'horizontal' | 'cards' | 'icons';
export const StatsPreview = ({ items, brandColor, selectedStyle, onStyleChange }: { items: StatsItem[]; brandColor: string; selectedStyle?: StatsStyle; onStyleChange?: (style: StatsStyle) => void }) => {
  const [device, setDevice] = useState<PreviewDevice>('desktop');
  const previewStyle = selectedStyle || 'horizontal';
  const setPreviewStyle = (s: string) => onStyleChange?.(s as StatsStyle);
  const styles = [{ id: 'horizontal', label: 'Thanh ngang' }, { id: 'cards', label: 'Cards' }, { id: 'icons', label: 'Icon Grid' }];

  // Style 1: Thanh ngang - Full width bar với dividers
  const renderHorizontalStyle = () => (
    <section className="w-full rounded-lg shadow-md overflow-hidden" style={{ backgroundColor: brandColor, boxShadow: `0 4px 6px -1px ${brandColor}20` }}>
      <div className={cn(
        "flex items-center justify-between",
        device === 'mobile' ? 'flex-col divide-y' : 'flex-row divide-x',
        "divide-white/10"
      )}>
        {items.slice(0, device === 'mobile' ? 2 : 4).map((item, idx) => (
          <div 
            key={idx} 
            className={cn(
              "flex-1 w-full flex flex-col items-center justify-center text-center text-white hover:bg-white/5 transition-colors duration-200 cursor-default",
              device === 'mobile' ? 'py-5 px-4' : 'py-6 px-4'
            )}
          >
            <span className={cn(
              "font-bold tracking-tight tabular-nums leading-none mb-1",
              device === 'mobile' ? 'text-2xl' : 'text-3xl md:text-4xl'
            )}>
              {item.value || '0'}
            </span>
            <h3 className="text-xs font-medium uppercase tracking-wider opacity-85">
              {item.label || 'Label'}
            </h3>
          </div>
        ))}
      </div>
    </section>
  );

  // Style 2: Cards - Grid cards với hover effects và accent line
  const renderCardsStyle = () => (
    <section className={cn("w-full", device === 'mobile' ? 'p-3' : 'p-4')}>
      <div className={cn("grid gap-4", device === 'mobile' ? 'grid-cols-2' : 'grid-cols-4')}>
        {items.slice(0, 4).map((item, idx) => (
          <div 
            key={idx}
            className="group bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl p-5 flex flex-col items-center text-center shadow-sm hover:shadow-md hover:border-opacity-50 transition-all duration-200"
            style={{ '--hover-border-color': `${brandColor}30` } as React.CSSProperties}
          >
            <span 
              className={cn(
                "font-bold mb-1 tracking-tight tabular-nums group-hover:scale-105 transition-transform duration-200",
                device === 'mobile' ? 'text-2xl' : 'text-3xl'
              )} 
              style={{ color: brandColor }}
            >
              {item.value || '0'}
            </span>
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {item.label || 'Label'}
            </h3>
            {/* Minimal accent line */}
            <div className="w-8 h-0.5 bg-slate-100 dark:bg-slate-700 rounded-full mt-3 group-hover:bg-opacity-50 transition-colors duration-200" style={{ '--hover-bg': `${brandColor}50` } as React.CSSProperties} />
          </div>
        ))}
      </div>
    </section>
  );

  // Style 3: Icon Grid - Circle containers với shadow và hover scale
  const renderIconsStyle = () => (
    <section className={cn("w-full", device === 'mobile' ? 'py-4 px-3' : 'py-6 px-4')}>
      <div className={cn("grid gap-6", device === 'mobile' ? 'grid-cols-2 gap-4' : 'grid-cols-4 md:gap-8')}>
        {items.slice(0, 4).map((item, idx) => (
          <div key={idx} className="flex flex-col items-center group">
            {/* Circle Container with shadow and border */}
            <div 
              className={cn(
                "relative rounded-full flex items-center justify-center mb-3 group-hover:scale-105 transition-all duration-300 ease-out border-[3px] border-white ring-1 ring-slate-100 dark:ring-slate-700",
                device === 'mobile' ? 'w-20 h-20' : 'w-24 h-24 md:w-28 md:h-28'
              )}
              style={{ 
                backgroundColor: brandColor,
                boxShadow: `0 10px 15px -3px ${brandColor}30, 0 4px 6px -4px ${brandColor}20`
              }}
            >
              <span className={cn(
                "font-bold text-white tracking-tight z-10 tabular-nums",
                device === 'mobile' ? 'text-xl' : 'text-2xl md:text-3xl'
              )}>
                {item.value || '0'}
              </span>
            </div>
            <h3 
              className={cn(
                "font-semibold text-slate-800 dark:text-slate-200 group-hover:transition-colors",
                device === 'mobile' ? 'text-sm' : 'text-base'
              )}
              style={{ '--hover-color': brandColor } as React.CSSProperties}
            >
              {item.label || 'Label'}
            </h3>
          </div>
        ))}
      </div>
    </section>
  );

  return (
    <PreviewWrapper title="Preview Stats" device={device} setDevice={setDevice} previewStyle={previewStyle} setPreviewStyle={setPreviewStyle} styles={styles} info={`${items.filter(i => i.value || i.label).length} số liệu`}>
      <BrowserFrame>
        {previewStyle === 'horizontal' && renderHorizontalStyle()}
        {previewStyle === 'cards' && renderCardsStyle()}
        {previewStyle === 'icons' && renderIconsStyle()}
      </BrowserFrame>
    </PreviewWrapper>
  );
};

// ============ FAQ PREVIEW ============
type FaqItem = { id: number; question: string; answer: string };
export type FaqStyle = 'accordion' | 'cards' | 'two-column';
export const FaqPreview = ({ items, brandColor, selectedStyle, onStyleChange }: { items: FaqItem[]; brandColor: string; selectedStyle?: FaqStyle; onStyleChange?: (style: FaqStyle) => void }) => {
  const [device, setDevice] = useState<PreviewDevice>('desktop');
  const previewStyle = selectedStyle || 'accordion';
  const setPreviewStyle = (s: string) => onStyleChange?.(s as FaqStyle);
  const [openIndex, setOpenIndex] = useState(0);
  const styles = [{ id: 'accordion', label: 'Accordion' }, { id: 'cards', label: 'Cards' }, { id: 'two-column', label: '2 Cột' }];

  const renderAccordionStyle = () => (
    <div className={cn("p-6", device === 'mobile' ? 'p-4' : '')}>
      <h3 className={cn("font-bold text-center mb-6", device === 'mobile' ? 'text-lg' : 'text-xl')}>Câu hỏi thường gặp</h3>
      <div className="space-y-2 max-w-3xl mx-auto">
        {items.map((item, idx) => (
          <div key={item.id} className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
            <button type="button" onClick={() => setOpenIndex(openIndex === idx ? -1 : idx)}
              className={cn("w-full px-4 py-3 flex items-center justify-between text-left font-medium transition-colors", openIndex === idx ? "bg-slate-50 dark:bg-slate-800" : "hover:bg-slate-50", device === 'mobile' ? 'text-sm' : '')}>
              <span>{item.question || `Câu hỏi ${idx + 1}`}</span>
              <ChevronRight size={16} className={cn("transition-transform", openIndex === idx && "rotate-90")} style={{ color: brandColor }} />
            </button>
            {openIndex === idx && <div className={cn("px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 text-sm")}>{item.answer || 'Câu trả lời...'}</div>}
          </div>
        ))}
      </div>
    </div>
  );

  const renderCardsStyle = () => (
    <div className={cn("p-6", device === 'mobile' ? 'p-4' : '')}>
      <h3 className={cn("font-bold text-center mb-6", device === 'mobile' ? 'text-lg' : 'text-xl')}>Câu hỏi thường gặp</h3>
      <div className={cn("grid gap-4", device === 'mobile' ? 'grid-cols-1' : 'grid-cols-2')}>
        {items.slice(0, 4).map((item, idx) => (
          <div key={item.id} className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white text-sm font-bold" style={{ backgroundColor: brandColor }}>?</div>
              <div>
                <h4 className={cn("font-medium mb-2", device === 'mobile' ? 'text-sm' : '')}>{item.question || `Câu hỏi ${idx + 1}`}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{item.answer || 'Câu trả lời...'}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTwoColumnStyle = () => (
    <div className={cn("p-6", device === 'mobile' ? 'p-4' : '')}>
      <div className={cn("grid gap-8", device === 'mobile' ? 'grid-cols-1' : 'grid-cols-2')}>
        <div>
          <h3 className={cn("font-bold mb-4", device === 'mobile' ? 'text-lg' : 'text-xl')} style={{ color: brandColor }}>Câu hỏi thường gặp</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Tìm câu trả lời cho các thắc mắc phổ biến của bạn</p>
          <button className="px-4 py-2 rounded-lg text-sm text-white" style={{ backgroundColor: brandColor }}>Liên hệ hỗ trợ</button>
        </div>
        <div className="space-y-4">
          {items.slice(0, 3).map((item, idx) => (
            <div key={item.id} className="border-b border-slate-200 dark:border-slate-700 pb-4">
              <h4 className={cn("font-medium mb-1", device === 'mobile' ? 'text-sm' : '')}>{item.question || `Câu hỏi ${idx + 1}`}</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">{item.answer || 'Câu trả lời...'}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <PreviewWrapper title="Preview FAQ" device={device} setDevice={setDevice} previewStyle={previewStyle} setPreviewStyle={setPreviewStyle} styles={styles} info={`${items.length} câu hỏi`}>
      <BrowserFrame url="yoursite.com/faq">
        {previewStyle === 'accordion' && renderAccordionStyle()}
        {previewStyle === 'cards' && renderCardsStyle()}
        {previewStyle === 'two-column' && renderTwoColumnStyle()}
      </BrowserFrame>
    </PreviewWrapper>
  );
};

// ============ TESTIMONIALS PREVIEW ============
type TestimonialItem = { id: number; name: string; role: string; content: string; avatar: string; rating: number };
export type TestimonialsStyle = 'cards' | 'slider' | 'masonry';
export const TestimonialsPreview = ({ items, brandColor, selectedStyle, onStyleChange }: { items: TestimonialItem[]; brandColor: string; selectedStyle?: TestimonialsStyle; onStyleChange?: (style: TestimonialsStyle) => void }) => {
  const [device, setDevice] = useState<PreviewDevice>('desktop');
  const previewStyle = selectedStyle || 'cards';
  const setPreviewStyle = (s: string) => onStyleChange?.(s as TestimonialsStyle);
  const [currentSlide, setCurrentSlide] = useState(0);
  const styles = [{ id: 'cards', label: 'Cards' }, { id: 'slider', label: 'Slider' }, { id: 'masonry', label: 'Masonry' }];

  const renderStars = (rating: number) => (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(star => (<Star key={star} size={12} className={star <= rating ? "text-yellow-400 fill-yellow-400" : "text-slate-300"} />))}
    </div>
  );

  const renderCardsStyle = () => (
    <div className={cn("py-8 px-4", device === 'mobile' ? 'py-6' : '')}>
      <h3 className={cn("font-bold text-center mb-6", device === 'mobile' ? 'text-lg' : 'text-xl')}>Khách hàng nói gì về chúng tôi</h3>
      <div className={cn("grid gap-4", device === 'mobile' ? 'grid-cols-1' : device === 'tablet' ? 'grid-cols-2' : 'grid-cols-3')}>
        {items.slice(0, device === 'mobile' ? 2 : 3).map((item) => (
          <div key={item.id} className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-100 dark:border-slate-700">
            {renderStars(item.rating)}
            <p className={cn("my-3 text-slate-600 dark:text-slate-300 line-clamp-3 text-sm")}>"{item.content || 'Nội dung đánh giá...'}"</p>
            <div className="flex items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-700">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: brandColor }}>{(item.name || 'U')[0]}</div>
              <div>
                <div className="font-medium text-sm">{item.name || 'Tên khách hàng'}</div>
                <div className="text-xs text-slate-500">{item.role || 'Chức vụ'}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSliderStyle = () => {
    const current = items[currentSlide] || items[0];
    return (
      <div className={cn("py-12 px-4 relative overflow-hidden", device === 'mobile' ? 'py-8' : '')}>
        <div className="absolute top-4 left-1/2 -translate-x-1/2 text-[120px] leading-none font-serif opacity-5 pointer-events-none" style={{ color: brandColor }}>"</div>
        <div className="max-w-6xl mx-auto relative">
          <div className={cn("bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 text-center relative", device === 'mobile' ? 'p-5' : '')} style={{ borderTop: `4px solid ${brandColor}` }}>
            <div className="flex justify-center mb-4">{renderStars(current?.rating || 5)}</div>
            <p className={cn("text-slate-700 dark:text-slate-200 leading-relaxed mb-6", device === 'mobile' ? 'text-base' : 'text-lg')}>"{current?.content || 'Nội dung đánh giá...'}"</p>
            <div className="flex items-center justify-center gap-4">
              <div className="w-14 h-14 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-lg" style={{ backgroundColor: brandColor }}>{(current?.name || 'U')[0]}</div>
              <div className="text-left">
                <div className="font-semibold text-slate-900 dark:text-white">{current?.name || 'Tên khách hàng'}</div>
                <div className="text-sm text-slate-500">{current?.role || 'Chức vụ'}</div>
              </div>
            </div>
          </div>
          {items.length > 1 && (
            <div className="flex items-center justify-center gap-4 mt-6">
              <button type="button" onClick={() => setCurrentSlide(prev => prev === 0 ? items.length - 1 : prev - 1)} className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 shadow-md flex items-center justify-center"><ChevronLeft size={18} /></button>
              <div className="flex gap-2">
                {items.map((_, idx) => (<button key={idx} type="button" onClick={() => setCurrentSlide(idx)} className={cn("w-2.5 h-2.5 rounded-full transition-all", idx === currentSlide ? "w-8" : "bg-slate-300")} style={idx === currentSlide ? { backgroundColor: brandColor } : {}} />))}
              </div>
              <button type="button" onClick={() => setCurrentSlide(prev => (prev + 1) % items.length)} className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 shadow-md flex items-center justify-center"><ChevronRight size={18} /></button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderMasonryStyle = () => (
    <div className={cn("py-8 px-4", device === 'mobile' ? 'py-6' : '')}>
      <h3 className={cn("font-bold text-center mb-6", device === 'mobile' ? 'text-lg' : 'text-xl')}>Khách hàng nói gì về chúng tôi</h3>
      <div className={cn("columns-1 gap-4", device === 'tablet' && 'columns-2', device === 'desktop' && 'columns-3')}>
        {items.slice(0, 4).map((item, idx) => (
          <div key={item.id} className={cn("break-inside-avoid mb-4 bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border", idx % 2 === 0 ? '' : 'pt-6')}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: brandColor }}>{(item.name || 'U')[0]}</div>
              <div>
                <div className="font-medium text-sm">{item.name || 'Tên'}</div>
                <div className="text-xs text-slate-500">{item.role || 'Chức vụ'}</div>
              </div>
            </div>
            {renderStars(item.rating)}
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">"{item.content || 'Nội dung...'}"</p>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <PreviewWrapper title="Preview Testimonials" device={device} setDevice={setDevice} previewStyle={previewStyle} setPreviewStyle={setPreviewStyle} styles={styles} info={`${items.length} đánh giá`}>
      <BrowserFrame>
        {previewStyle === 'cards' && renderCardsStyle()}
        {previewStyle === 'slider' && renderSliderStyle()}
        {previewStyle === 'masonry' && renderMasonryStyle()}
      </BrowserFrame>
    </PreviewWrapper>
  );
};

// ============ PRICING PREVIEW ============
type PricingPlan = { id: number; name: string; price: string; period: string; features: string[]; isPopular: boolean; buttonText: string; buttonLink: string };
export type PricingStyle = 'cards' | 'horizontal' | 'minimal';
export const PricingPreview = ({ plans, brandColor, selectedStyle, onStyleChange }: { plans: PricingPlan[]; brandColor: string; selectedStyle?: PricingStyle; onStyleChange?: (style: PricingStyle) => void }) => {
  const [device, setDevice] = useState<PreviewDevice>('desktop');
  const previewStyle = selectedStyle || 'cards';
  const setPreviewStyle = (s: string) => onStyleChange?.(s as PricingStyle);
  const styles = [{ id: 'cards', label: 'Cards' }, { id: 'horizontal', label: 'Ngang' }, { id: 'minimal', label: 'Minimal' }];

  const renderCardsStyle = () => (
    <div className={cn("py-8 px-4", device === 'mobile' ? 'py-6' : '')}>
      <h3 className={cn("font-bold text-center mb-2", device === 'mobile' ? 'text-lg' : 'text-xl')}>Bảng giá dịch vụ</h3>
      <p className="text-center text-sm text-slate-500 mb-6">Chọn gói phù hợp với nhu cầu của bạn</p>
      <div className={cn("grid gap-4", device === 'mobile' ? 'grid-cols-1' : device === 'tablet' ? 'grid-cols-2' : 'grid-cols-3')}>
        {plans.slice(0, 3).map((plan) => (
          <div key={plan.id} className={cn("bg-white dark:bg-slate-800 rounded-xl p-5 border-2 relative", plan.isPopular ? "border-accent shadow-lg scale-105" : "border-slate-200 dark:border-slate-700")} style={plan.isPopular ? { borderColor: brandColor } : {}}>
            {plan.isPopular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-medium text-white" style={{ backgroundColor: brandColor }}>Phổ biến</div>}
            <h4 className="font-semibold text-center">{plan.name || 'Tên gói'}</h4>
            <div className="text-center my-4">
              <span className={cn("font-bold", device === 'mobile' ? 'text-2xl' : 'text-3xl')} style={{ color: brandColor }}>{plan.price || '0'}d</span>
              <span className="text-sm text-slate-500">{plan.period}</span>
            </div>
            <ul className="space-y-2 mb-4">
              {(plan.features.length > 0 ? plan.features : ['Tính năng 1', 'Tính năng 2']).slice(0, 4).map((f, idx) => (<li key={idx} className="flex items-center gap-2 text-sm"><Check size={14} style={{ color: brandColor }} /><span>{f}</span></li>))}
            </ul>
            <button className={cn("w-full py-2 rounded-lg font-medium text-sm", plan.isPopular ? "text-white" : "border")} style={plan.isPopular ? { backgroundColor: brandColor } : { borderColor: brandColor, color: brandColor }}>{plan.buttonText || 'Chọn gói'}</button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderHorizontalStyle = () => (
    <div className={cn("py-8 px-4", device === 'mobile' ? 'py-6' : '')}>
      <h3 className={cn("font-bold text-center mb-6", device === 'mobile' ? 'text-lg' : 'text-xl')}>Bảng giá dịch vụ</h3>
      <div className="space-y-3">
        {plans.slice(0, 3).map((plan) => (
          <div key={plan.id} className={cn("bg-white dark:bg-slate-800 rounded-xl p-4 border flex items-center justify-between", device === 'mobile' ? 'flex-col gap-3 text-center' : '', plan.isPopular ? "border-accent" : "border-slate-200")} style={plan.isPopular ? { borderColor: brandColor } : {}}>
            <div className={cn(device === 'mobile' ? '' : 'flex items-center gap-4')}>
              <h4 className="font-semibold">{plan.name || 'Tên gói'}</h4>
              {plan.isPopular && <span className="px-2 py-0.5 rounded-full text-xs font-medium text-white" style={{ backgroundColor: brandColor }}>Hot</span>}
            </div>
            <div className="text-sm text-slate-500">{(plan.features.length > 0 ? plan.features : ['Tính năng']).slice(0, 2).join(' • ')}</div>
            <div className="flex items-center gap-4">
              <span className="font-bold text-lg" style={{ color: brandColor }}>{plan.price || '0'}d<span className="text-sm font-normal text-slate-500">{plan.period}</span></span>
              <button className="px-4 py-1.5 rounded-lg text-sm text-white" style={{ backgroundColor: brandColor }}>{plan.buttonText || 'Chọn'}</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderMinimalStyle = () => (
    <div className={cn("py-10 px-4", device === 'mobile' ? 'py-6' : '')}>
      <h3 className={cn("font-bold text-center mb-8", device === 'mobile' ? 'text-lg' : 'text-xl')}>Bảng giá dịch vụ</h3>
      <div className={cn("max-w-6xl mx-auto", device === 'mobile' ? '' : 'border rounded-2xl overflow-hidden')}>
        {plans.slice(0, 3).map((plan, idx) => (
          <div key={plan.id} className={cn("flex items-center gap-4 p-5 bg-white dark:bg-slate-800 transition-all", device === 'mobile' ? 'flex-col text-center rounded-xl border mb-3' : '', device !== 'mobile' && idx !== plans.slice(0, 3).length - 1 && 'border-b')} style={plan.isPopular ? { backgroundColor: `${brandColor}08` } : {}}>
            {plan.isPopular && <div className={cn("absolute px-3 py-1 rounded-full text-xs font-medium text-white", device === 'mobile' ? '-top-2 left-1/2 -translate-x-1/2' : 'top-2 right-4')} style={{ backgroundColor: brandColor }}>Phổ biến</div>}
            <div className={cn("flex-1", device === 'mobile' ? 'pt-2' : '')}>
              <h4 className="font-semibold text-base">{plan.name || 'Tên gói'}</h4>
              <div className="text-xs text-slate-500">{(plan.features.length > 0 ? plan.features : ['Tính năng']).slice(0, 2).join(' • ')}</div>
            </div>
            <div className={cn("flex items-center gap-4", device === 'mobile' ? 'flex-col gap-3 mt-3' : '')}>
              <span className="text-2xl font-bold" style={{ color: brandColor }}>{plan.price || '0'}d<span className="text-sm text-slate-500">{plan.period}</span></span>
              <button className={cn("px-5 py-2 rounded-lg text-sm font-medium", plan.isPopular ? "text-white shadow-md" : "border-2")} style={plan.isPopular ? { backgroundColor: brandColor } : { borderColor: brandColor, color: brandColor }}>{plan.buttonText || 'Chọn gói'}</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <PreviewWrapper title="Preview Pricing" device={device} setDevice={setDevice} previewStyle={previewStyle} setPreviewStyle={setPreviewStyle} styles={styles} info={`${plans.length} gói`}>
      <BrowserFrame url="yoursite.com/pricing">
        {previewStyle === 'cards' && renderCardsStyle()}
        {previewStyle === 'horizontal' && renderHorizontalStyle()}
        {previewStyle === 'minimal' && renderMinimalStyle()}
      </BrowserFrame>
    </PreviewWrapper>
  );
};

// ============ GALLERY/PARTNERS PREVIEW ============
// 4 Professional Styles from partner-&-logo-manager: Grid, Marquee, Mono, Badge
type GalleryItem = { id: number; url: string; link: string };
export type GalleryStyle = 'grid' | 'marquee' | 'mono' | 'badge';

// Auto Scroll Slider Component for Marquee/Mono styles
const AutoScrollSlider = ({ children, className, speed = 0.5, isPaused }: { 
  children: React.ReactNode; 
  className?: string; 
  speed?: number;
  isPaused: boolean;
}) => {
  const scrollRef = React.useRef<HTMLDivElement>(null);

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
      className={cn("flex overflow-x-auto cursor-grab active:cursor-grabbing touch-pan-x", className)}
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      <style>{`.no-scrollbar::-webkit-scrollbar { display: none; }`}</style>
      <div className="flex shrink-0 gap-16 items-center px-4">{children}</div>
      <div className="flex shrink-0 gap-16 items-center px-4">{children}</div>
      <div className="flex shrink-0 gap-16 items-center px-4">{children}</div>
    </div>
  );
};

export const GalleryPreview = ({ items, brandColor, componentType, selectedStyle, onStyleChange }: { 
  items: GalleryItem[]; 
  brandColor: string; 
  componentType: 'Partners' | 'Gallery' | 'TrustBadges'; 
  selectedStyle?: GalleryStyle; 
  onStyleChange?: (style: GalleryStyle) => void;
}) => {
  const [device, setDevice] = useState<PreviewDevice>('desktop');
  const [isPaused, setIsPaused] = useState(false);
  const previewStyle = selectedStyle || 'grid';
  const setPreviewStyle = (s: string) => onStyleChange?.(s as GalleryStyle);
  
  // Styles phụ thuộc vào componentType
  const styles = componentType === 'Partners' 
    ? [
        { id: 'grid', label: 'Grid' }, 
        { id: 'marquee', label: 'Marquee' }, 
        { id: 'mono', label: 'Mono' },
        { id: 'badge', label: 'Badge' }
      ]
    : [
        { id: 'grid', label: 'Grid' }, 
        { id: 'marquee', label: 'Marquee' }
      ];

  // Style 1: Classic Grid - Hover effect, responsive grid
  const renderGridStyle = () => (
    <section className="w-full py-10 bg-white dark:bg-slate-900 border-b border-slate-200/40 dark:border-slate-700/40">
      <div className="w-full max-w-7xl mx-auto px-4 md:px-6 space-y-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 relative pl-4">
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-full" style={{ backgroundColor: brandColor }}></span>
            {componentType === 'Partners' ? 'Đối tác' : componentType === 'TrustBadges' ? 'Chứng nhận' : 'Thư viện ảnh'}
          </h2>
        </div>
        <div className={cn(
          "grid gap-8 items-center justify-items-center",
          device === 'mobile' ? 'grid-cols-2' : device === 'tablet' ? 'grid-cols-4' : 'grid-cols-4 lg:grid-cols-8'
        )}>
          {items.slice(0, device === 'mobile' ? 4 : 8).map((item) => (
            <div 
              key={item.id} 
              className="w-full flex items-center justify-center p-4 rounded-xl hover:bg-slate-100/50 dark:hover:bg-slate-800/30 transition-colors duration-300 cursor-pointer group"
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
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  // Style 2: Marquee - Auto scroll, swipeable
  const renderMarqueeStyle = () => (
    <section className="w-full py-10 bg-white dark:bg-slate-900 border-b border-slate-200/40 dark:border-slate-700/40">
      <div className="w-full max-w-7xl mx-auto px-4 md:px-6 space-y-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 relative pl-4">
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-full" style={{ backgroundColor: brandColor }}></span>
            {componentType === 'Partners' ? 'Đối tác' : componentType === 'TrustBadges' ? 'Chứng nhận' : 'Thư viện ảnh'}
          </h2>
        </div>
        <div 
          className="w-full relative group py-8"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Fade Edges */}
          <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-white dark:from-slate-900 to-transparent z-10 pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-white dark:from-slate-900 to-transparent z-10 pointer-events-none"></div>
          
          <AutoScrollSlider speed={0.8} isPaused={isPaused}>
            {items.map((item) => (
              <div key={`marquee-${item.id}`} className="shrink-0">
                {item.url ? (
                  <img 
                    src={item.url} 
                    alt="" 
                    className="h-11 w-auto object-contain hover:scale-110 transition-transform duration-300 select-none pointer-events-none" 
                  />
                ) : (
                  <div className="h-11 w-24 bg-slate-200 dark:bg-slate-700 rounded flex items-center justify-center">
                    <ImageIcon size={24} className="text-slate-400" />
                  </div>
                )}
              </div>
            ))}
          </AutoScrollSlider>
        </div>
      </div>
    </section>
  );

  // Style 3: Mono - Grayscale, hover to color
  const renderMonoStyle = () => (
    <section className="w-full py-10 bg-white dark:bg-slate-900 border-b border-slate-200/40 dark:border-slate-700/40">
      <div className="w-full max-w-7xl mx-auto px-4 md:px-6 space-y-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 relative pl-4">
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-full" style={{ backgroundColor: brandColor }}></span>
            {componentType === 'Partners' ? 'Đối tác' : componentType === 'TrustBadges' ? 'Chứng nhận' : 'Thư viện ảnh'}
          </h2>
        </div>
        <div 
          className="w-full relative py-6"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <AutoScrollSlider speed={0.5} isPaused={isPaused}>
            {items.map((item) => (
              <div key={`mono-${item.id}`} className="shrink-0 group">
                {item.url ? (
                  <img 
                    src={item.url} 
                    alt="" 
                    className="h-10 w-auto object-contain grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500 select-none pointer-events-none" 
                  />
                ) : (
                  <div className="h-10 w-24 bg-slate-200 dark:bg-slate-700 rounded flex items-center justify-center opacity-50">
                    <ImageIcon size={22} className="text-slate-400" />
                  </div>
                )}
              </div>
            ))}
          </AutoScrollSlider>
        </div>
      </div>
    </section>
  );

  // Style 4: Badge - Compact badges with name
  const renderBadgeStyle = () => (
    <section className="w-full py-10 bg-white dark:bg-slate-900 border-b border-slate-200/40 dark:border-slate-700/40">
      <div className="w-full max-w-7xl mx-auto px-4 md:px-6 space-y-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 relative pl-4">
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-full" style={{ backgroundColor: brandColor }}></span>
            {componentType === 'Partners' ? 'Đối tác' : componentType === 'TrustBadges' ? 'Chứng nhận' : 'Thư viện ảnh'}
          </h2>
        </div>
        <div className="w-full flex flex-wrap items-center justify-center gap-3">
          {items.slice(0, device === 'mobile' ? 4 : 6).map((item, idx) => (
            <div 
              key={item.id} 
              className="bg-slate-100/50 dark:bg-slate-800/30 hover:bg-slate-100 dark:hover:bg-slate-800/60 px-4 py-2 rounded-lg border border-transparent hover:border-slate-200/50 dark:hover:border-slate-700/50 transition-all flex items-center gap-3 cursor-default"
              style={{ borderColor: `${brandColor}10` }}
            >
              {item.url ? (
                <img src={item.url} alt="" className="h-5 w-auto grayscale" />
              ) : (
                <ImageIcon size={20} className="text-slate-400" />
              )}
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Partner {idx + 1}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  return (
    <PreviewWrapper 
      title={`Preview ${componentType}`} 
      device={device} 
      setDevice={setDevice} 
      previewStyle={previewStyle} 
      setPreviewStyle={setPreviewStyle} 
      styles={styles} 
      info={`${items.length} ảnh`}
    >
      <BrowserFrame>
        {previewStyle === 'grid' && renderGridStyle()}
        {previewStyle === 'marquee' && renderMarqueeStyle()}
        {previewStyle === 'mono' && renderMonoStyle()}
        {previewStyle === 'badge' && renderBadgeStyle()}
      </BrowserFrame>
    </PreviewWrapper>
  );
};

// ============ SERVICES/BENEFITS PREVIEW ============
// Professional Services UI/UX - 3 Variants: Elegant Grid, Modern List, Big Number
type ServiceItem = { id: number; icon: string; title: string; description: string };
export type ServicesStyle = 'elegantGrid' | 'modernList' | 'bigNumber';
export const ServicesPreview = ({ items, brandColor, componentType, selectedStyle, onStyleChange }: { items: ServiceItem[]; brandColor: string; componentType: 'Services' | 'Benefits'; selectedStyle?: ServicesStyle; onStyleChange?: (style: ServicesStyle) => void }) => {
  const [device, setDevice] = useState<PreviewDevice>('desktop');
  const previewStyle = selectedStyle || 'elegantGrid';
  const setPreviewStyle = (s: string) => onStyleChange?.(s as ServicesStyle);
  const styles = [
    { id: 'elegantGrid', label: 'Elegant Grid' }, 
    { id: 'modernList', label: 'Modern List' }, 
    { id: 'bigNumber', label: 'Big Number' }
  ];
  const titles = { Services: 'Dịch vụ của chúng tôi', Benefits: 'Tại sao chọn chúng tôi' };

  // Style 1: Elegant Grid - Clean cards with top accent line, hover lift
  const renderElegantGridStyle = () => (
    <div className="w-full max-w-6xl mx-auto space-y-8 py-8 px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-700 pb-4">
        <h2 className={cn(
          "font-bold tracking-tight text-slate-900 dark:text-slate-100",
          device === 'mobile' ? 'text-2xl' : 'text-3xl md:text-4xl'
        )}>
          {titles[componentType]}
        </h2>
      </div>

      {/* Grid */}
      <div className={cn(
        "grid gap-6",
        device === 'mobile' ? 'grid-cols-1' : device === 'tablet' ? 'grid-cols-2' : 'grid-cols-3'
      )}>
        {items.slice(0, device === 'mobile' ? 3 : 6).map((item) => (
          <div 
            key={item.id} 
            className="group bg-white dark:bg-slate-800 p-6 pt-8 rounded-xl shadow-sm border border-slate-200/60 dark:border-slate-700 relative overflow-hidden transition-all hover:shadow-md hover:-translate-y-1"
          >
            {/* Top Accent Line with gradient */}
            <div 
              className="absolute top-0 left-0 right-0 h-1.5 w-full group-hover:h-2 transition-all"
              style={{ background: `linear-gradient(to right, ${brandColor}66, ${brandColor})` }}
            />
            
            <h3 className={cn(
              "font-bold text-slate-900 dark:text-slate-100 mb-2 tracking-tight",
              device === 'mobile' ? 'text-lg' : 'text-xl'
            )}>
              {item.title || 'Tiêu đề'}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm">
              {item.description || 'Mô tả dịch vụ...'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );

  // Style 2: Modern List - Clean horizontal layout with big numbers
  const renderModernListStyle = () => (
    <div className="w-full max-w-5xl mx-auto space-y-5 py-6 px-4">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-700 pb-3">
        <h2 className={cn(
          "font-bold tracking-tight text-slate-900 dark:text-slate-100",
          device === 'mobile' ? 'text-xl' : 'text-2xl md:text-3xl'
        )}>
          {titles[componentType]}
        </h2>
      </div>

      {/* List */}
      <div className="space-y-0">
        {items.slice(0, device === 'mobile' ? 4 : 6).map((item, index) => (
          <div 
            key={item.id}
            className="flex items-baseline gap-3 md:gap-4 py-3 border-b border-slate-100 dark:border-slate-800 last:border-b-0"
          >
            {/* Number */}
            <span 
              className={cn(
                "font-bold tabular-nums flex-shrink-0",
                device === 'mobile' ? 'text-xl w-8' : 'text-2xl w-10'
              )}
              style={{ color: brandColor }}
            >
              {String(index + 1).padStart(2, '0')}
            </span>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className={cn(
                "font-semibold text-slate-900 dark:text-slate-100 mb-0.5",
                device === 'mobile' ? 'text-sm' : 'text-base'
              )}>
                {item.title || 'Tiêu đề'}
              </h3>
              <p className={cn(
                "text-slate-500 dark:text-slate-400 leading-relaxed",
                device === 'mobile' ? 'text-xs' : 'text-sm'
              )}>
                {item.description || 'Mô tả dịch vụ...'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Style 3: Big Number Tiles - Bento/Typographic style with giant numbers
  const renderBigNumberStyle = () => (
    <div className="w-full max-w-6xl mx-auto space-y-8 py-8 px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-700 pb-4">
        <h2 className={cn(
          "font-bold tracking-tight text-slate-900 dark:text-slate-100",
          device === 'mobile' ? 'text-2xl' : 'text-3xl md:text-4xl'
        )}>
          {titles[componentType]}
        </h2>
      </div>

      {/* Grid */}
      <div className={cn(
        "grid gap-3",
        device === 'mobile' ? 'grid-cols-1' : device === 'tablet' ? 'grid-cols-2' : 'grid-cols-3'
      )}>
        {items.slice(0, device === 'mobile' ? 3 : 6).map((item, index) => {
          const isHighlighted = index === 1;
          return (
            <div 
              key={item.id} 
              className={cn(
                "relative overflow-hidden rounded-xl p-5 flex flex-col justify-end group border transition-colors",
                device === 'mobile' ? 'min-h-[150px]' : 'min-h-[180px]',
                isHighlighted 
                  ? "text-white border-transparent" 
                  : "bg-slate-100/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200/50 dark:border-slate-700"
              )}
              style={isHighlighted ? { backgroundColor: brandColor } : {}}
            >
              {/* Giant Number Watermark */}
              <span className={cn(
                "absolute -top-6 -right-3 font-black leading-none select-none pointer-events-none transition-transform group-hover:scale-105 duration-500",
                device === 'mobile' ? 'text-[6rem]' : 'text-[8rem]',
                isHighlighted ? "text-white opacity-[0.15]" : "text-slate-900 dark:text-slate-100 opacity-[0.07]"
              )}>
                {index + 1}
              </span>

              <div className="relative z-10 space-y-2">
                {/* Accent bar */}
                <div 
                  className="w-6 h-1 mb-3 opacity-50 rounded-full"
                  style={{ backgroundColor: isHighlighted ? 'white' : brandColor }}
                />
                <h3 className={cn(
                  "font-bold tracking-tight",
                  device === 'mobile' ? 'text-lg' : 'text-xl'
                )}>
                  {item.title || 'Tiêu đề'}
                </h3>
                <p className={cn(
                  "text-sm leading-relaxed",
                  isHighlighted ? "text-white/90" : "text-slate-500 dark:text-slate-400"
                )}>
                  {item.description || 'Mô tả dịch vụ...'}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <PreviewWrapper title={`Preview ${componentType}`} device={device} setDevice={setDevice} previewStyle={previewStyle} setPreviewStyle={setPreviewStyle} styles={styles} info={`${items.length} mục`}>
      <BrowserFrame>
        {previewStyle === 'elegantGrid' && renderElegantGridStyle()}
        {previewStyle === 'modernList' && renderModernListStyle()}
        {previewStyle === 'bigNumber' && renderBigNumberStyle()}
      </BrowserFrame>
    </PreviewWrapper>
  );
};

// ============ PRODUCT/SERVICE LIST PREVIEW ============
// Professional Product Showcase UI/UX - 3 Variants from featured-products-component
// Style: Luxury Minimal, Commerce Card, Bento Grid
export type ProductListStyle = 'minimal' | 'commerce' | 'bento';
export interface ProductListPreviewItem {
  id: string | number;
  name: string;
  image?: string;
  price?: string;
  originalPrice?: string;
  description?: string;
  category?: string;
  tag?: 'new' | 'hot' | 'sale';
}

// Helper to strip HTML tags from description
const stripHtml = (html?: string) => {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '').trim();
};

export const ProductListPreview = ({ brandColor, itemCount, componentType, selectedStyle, onStyleChange, items }: { 
  brandColor: string; 
  itemCount: number; 
  componentType: 'ProductList' | 'ServiceList'; 
  selectedStyle?: ProductListStyle; 
  onStyleChange?: (style: ProductListStyle) => void;
  items?: ProductListPreviewItem[];
}) => {
  const [device, setDevice] = useState<PreviewDevice>('desktop');
  const previewStyle = selectedStyle || 'commerce';
  const setPreviewStyle = (s: string) => onStyleChange?.(s as ProductListStyle);
  const styles = [
    { id: 'commerce', label: 'Commerce Card' },
    { id: 'minimal', label: 'Luxury Minimal' },
    { id: 'bento', label: 'Bento Grid' }
  ];
  const isProduct = componentType === 'ProductList';
  
  // Mock data with realistic product info
  const mockProducts: ProductListPreviewItem[] = [
    { id: 1, name: 'iPhone 15 Pro Max', category: 'Smartphone', price: '34.990.000đ', originalPrice: '36.990.000đ', tag: 'new', image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500&h=500&fit=crop&q=80' },
    { id: 2, name: 'MacBook Pro M3', category: 'Laptop', price: '45.990.000đ', image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca4?w=500&h=500&fit=crop&q=80' },
    { id: 3, name: 'Sony WH-1000XM5', category: 'Audio', price: '8.490.000đ', originalPrice: '9.290.000đ', tag: 'sale', image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=500&h=500&fit=crop&q=80' },
    { id: 4, name: 'Apple Watch Ultra 2', category: 'Wearable', price: '21.990.000đ', tag: 'new', image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=500&h=500&fit=crop&q=80' },
    { id: 5, name: 'iPad Air 5 M1', category: 'Tablet', price: '14.990.000đ', originalPrice: '16.500.000đ', tag: 'sale', image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&h=500&fit=crop&q=80' },
    { id: 6, name: 'Marshall Stanmore III', category: 'Audio', price: '9.890.000đ', image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=500&h=500&fit=crop&q=80' },
    { id: 7, name: 'Logitech MX Master 3S', category: 'Accessories', price: '2.490.000đ', image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500&h=500&fit=crop&q=80' },
    { id: 8, name: 'Fujifilm X-T5', category: 'Camera', price: '42.990.000đ', originalPrice: '45.000.000đ', tag: 'hot', image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&h=500&fit=crop&q=80' }
  ];
  
  const displayItems: ProductListPreviewItem[] = items && items.length > 0 ? items : mockProducts.slice(0, Math.max(itemCount, 8));

  // Calculate discount percentage
  const getDiscount = (price?: string, originalPrice?: string) => {
    if (!price || !originalPrice) return null;
    const p = parseInt(price.replace(/\D/g, ''));
    const op = parseInt(originalPrice.replace(/\D/g, ''));
    if (op <= p) return null;
    return `-${Math.round(((op - p) / op) * 100)}%`;
  };

  // Style 1: Luxury Minimal - Clean grid với hover effects và view details button
  const renderMinimalStyle = () => (
    <section className={cn("py-8 md:py-10", device === 'mobile' ? 'px-3' : 'px-4 md:px-6')}>
      {/* Section Header */}
      <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-end md:justify-between md:mb-10">
        <div className="flex items-end justify-between w-full md:w-auto">
          <div className="space-y-1 md:space-y-2">
            <div className="flex items-center gap-2 font-bold text-xs md:text-sm uppercase tracking-widest" style={{ color: brandColor }}>
              <span className="w-6 h-[2px] md:w-8" style={{ backgroundColor: brandColor }}></span>
              Bộ sưu tập
            </div>
            <h2 className={cn("font-bold tracking-tight text-slate-900 dark:text-slate-100", device === 'mobile' ? 'text-2xl' : 'text-2xl md:text-4xl')}>
              Sản phẩm nổi bật
            </h2>
          </div>
          {/* Mobile View All */}
          <button className="md:hidden p-0 h-auto font-semibold mb-1 gap-1 flex items-center" style={{ color: brandColor }}>
            Xem tất cả <ArrowRight size={16} />
          </button>
        </div>
        {/* Desktop View All */}
        <button className="hidden md:flex gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 pl-6 border-l border-slate-200 dark:border-slate-700 transition-colors items-center">
          Xem tất cả <ArrowRight size={16} />
        </button>
      </div>

      {/* Grid */}
      <div className={cn(
        "grid gap-x-6 gap-y-10",
        device === 'mobile' ? 'grid-cols-2 gap-x-3 gap-y-6' : device === 'tablet' ? 'grid-cols-3' : 'grid-cols-4'
      )}>
        {displayItems.slice(0, device === 'mobile' ? 4 : 4).map((item) => {
          const discount = getDiscount(item.price, item.originalPrice);
          return (
            <div key={item.id} className="group cursor-pointer">
              {/* Image Container */}
              <div className="relative aspect-square overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-800 mb-4 border border-transparent transition-all" style={{ '--hover-border': `${brandColor}20` } as React.CSSProperties}>
                {item.image ? (
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <Package size={48} className="text-slate-300" />
                  </div>
                )}
                
                {/* Discount / New Badge */}
                <div className="absolute top-3 left-3 flex flex-col gap-1">
                  {discount && (
                    <span className="px-2 py-1 text-[10px] font-bold text-white rounded shadow-sm" style={{ backgroundColor: brandColor, boxShadow: `0 2px 4px ${brandColor}20` }}>
                      {discount}
                    </span>
                  )}
                  {item.tag === 'new' && !discount && (
                    <span className="px-2 py-1 text-[10px] font-bold bg-white/90 backdrop-blur-sm rounded shadow-sm" style={{ color: brandColor }}>
                      NEW
                    </span>
                  )}
                </div>

                {/* View Details Button (Hover) */}
                <div className="absolute inset-x-4 bottom-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 opacity-0 group-hover:opacity-100">
                  <button className="w-full bg-white/95 hover:bg-white backdrop-blur-md shadow-lg border-0 font-bold py-2 px-4 rounded-lg text-sm" style={{ color: brandColor }}>
                    Xem chi tiết
                  </button>
                </div>
              </div>

              {/* Info */}
              <div className="space-y-1">
                <h3 className="font-medium text-slate-900 dark:text-slate-100 text-base truncate group-hover:opacity-80 transition-colors">
                  {item.name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-bold text-slate-900 dark:text-slate-100">{item.price}</span>
                  {item.originalPrice && (
                    <span className="text-xs text-slate-400 line-through">
                      {item.originalPrice}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );

  // Style 2: Commerce Card - Cards với button Xem chi tiết và hover effects
  const renderCommerceStyle = () => (
    <section className={cn("py-8 md:py-10", device === 'mobile' ? 'px-3' : 'px-4 md:px-6')}>
      {/* Section Header */}
      <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-end md:justify-between md:mb-10">
        <div className="flex items-end justify-between w-full md:w-auto">
          <div className="space-y-1 md:space-y-2">
            <div className="flex items-center gap-2 font-bold text-xs md:text-sm uppercase tracking-widest" style={{ color: brandColor }}>
              <span className="w-6 h-[2px] md:w-8" style={{ backgroundColor: brandColor }}></span>
              Bộ sưu tập
            </div>
            <h2 className={cn("font-bold tracking-tight text-slate-900 dark:text-slate-100", device === 'mobile' ? 'text-2xl' : 'text-2xl md:text-4xl')}>
              Sản phẩm nổi bật
            </h2>
          </div>
          <button className="md:hidden p-0 h-auto font-semibold mb-1 gap-1 flex items-center" style={{ color: brandColor }}>
            Xem tất cả <ArrowRight size={16} />
          </button>
        </div>
        <button className="hidden md:flex gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 pl-6 border-l border-slate-200 dark:border-slate-700 transition-colors items-center">
          Xem tất cả <ArrowRight size={16} />
        </button>
      </div>

      {/* Grid */}
      <div className={cn(
        "grid gap-6",
        device === 'mobile' ? 'grid-cols-1 sm:grid-cols-2 gap-4' : device === 'tablet' ? 'grid-cols-2' : 'grid-cols-4'
      )}>
        {displayItems.slice(0, device === 'mobile' ? 4 : 4).map((item) => {
          const discount = getDiscount(item.price, item.originalPrice);
          return (
            <div 
              key={item.id} 
              className="group bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col"
              style={{ '--hover-shadow': `0 10px 15px -3px ${brandColor}10`, '--hover-border': `${brandColor}30` } as React.CSSProperties}
            >
              {/* Image */}
              <div className="relative aspect-[4/3] bg-slate-100 dark:bg-slate-700 overflow-hidden">
                {item.image ? (
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <Package size={40} className="text-slate-300" />
                  </div>
                )}
                {discount && (
                  <div className="absolute top-2 right-2 text-xs font-bold px-2 py-1 rounded text-white shadow-sm" style={{ backgroundColor: brandColor, boxShadow: `0 2px 4px ${brandColor}20` }}>
                    {discount}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4 flex flex-col flex-1">
                <h3 className="font-bold text-slate-900 dark:text-slate-100 line-clamp-1 mb-1 group-hover:opacity-80 transition-colors cursor-pointer">
                  {item.name}
                </h3>
                
                <div className="flex items-baseline gap-2 mb-4 mt-auto pt-2">
                  <span className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:opacity-80 transition-colors">{item.price}</span>
                  {item.originalPrice && (
                    <span className="text-xs text-slate-400 line-through">
                      {item.originalPrice}
                    </span>
                  )}
                </div>

                <button 
                  className="w-full gap-1.5 md:gap-2 border-2 py-1.5 md:py-2 px-2 md:px-4 rounded-lg font-medium flex items-center justify-center transition-colors whitespace-nowrap text-xs md:text-sm"
                  style={{ borderColor: `${brandColor}20`, color: brandColor }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = brandColor; e.currentTarget.style.backgroundColor = `${brandColor}08`; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = `${brandColor}20`; e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  Xem chi tiết
                  <ArrowRight className="w-3 h-3 md:w-3.5 md:h-3.5 flex-shrink-0" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );

  // Style 3: Bento Grid - Asymmetric layout với hero card lớn
  const renderBentoStyle = () => {
    const featured = displayItems[displayItems.length > 7 ? 7 : displayItems.length - 1] || displayItems[0]; // Fujifilm X-T5 or last item
    const others = displayItems.slice(0, 4);
    const discount = getDiscount(featured?.price, featured?.originalPrice);

    return (
      <section className={cn("py-8 md:py-10", device === 'mobile' ? 'px-3' : 'px-4 md:px-6')}>
        {/* Section Header */}
        <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-end md:justify-between md:mb-10">
          <div className="flex items-end justify-between w-full md:w-auto">
            <div className="space-y-1 md:space-y-2">
              <div className="flex items-center gap-2 font-bold text-xs md:text-sm uppercase tracking-widest" style={{ color: brandColor }}>
                <span className="w-6 h-[2px] md:w-8" style={{ backgroundColor: brandColor }}></span>
                Bộ sưu tập
              </div>
              <h2 className={cn("font-bold tracking-tight text-slate-900 dark:text-slate-100", device === 'mobile' ? 'text-2xl' : 'text-2xl md:text-4xl')}>
                Sản phẩm nổi bật
              </h2>
            </div>
            <button className="md:hidden p-0 h-auto font-semibold mb-1 gap-1 flex items-center" style={{ color: brandColor }}>
              Xem tất cả <ArrowRight size={16} />
            </button>
          </div>
          <button className="hidden md:flex gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 pl-6 border-l border-slate-200 dark:border-slate-700 transition-colors items-center">
            Xem tất cả <ArrowRight size={16} />
          </button>
        </div>

        {/* Bento Grid */}
        {device === 'mobile' ? (
          // Mobile: 2x2 simple grid
          <div className="grid grid-cols-2 gap-3">
            {others.slice(0, 4).map((item) => {
              const itemDiscount = getDiscount(item.price, item.originalPrice);
              return (
                <div key={item.id} className="group bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 flex flex-col cursor-pointer hover:shadow-md transition-all">
                  <div className="relative aspect-square w-full rounded-lg bg-slate-100 dark:bg-slate-700 overflow-hidden mb-2">
                    {item.image ? (
                      <img src={item.image} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" alt={item.name} />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center"><Package size={24} className="text-slate-300" /></div>
                    )}
                    {itemDiscount && (
                      <span className="absolute top-2 left-2 text-[10px] font-bold text-white px-1.5 py-0.5 rounded" style={{ backgroundColor: brandColor }}>
                        {itemDiscount}
                      </span>
                    )}
                  </div>
                  <h4 className="font-medium text-sm text-slate-900 dark:text-slate-100 truncate group-hover:opacity-80 transition-colors">{item.name}</h4>
                  <span className="text-sm font-bold mt-1" style={{ color: brandColor }}>{item.price}</span>
                </div>
              );
            })}
          </div>
        ) : (
          // Desktop/Tablet: Bento layout
          <div className={cn(
            "grid gap-4 h-auto",
            device === 'tablet' ? 'grid-cols-3 grid-rows-2' : 'grid-cols-4 grid-rows-2'
          )}>
            {/* Hero Item (Span 2x2) */}
            <div className="col-span-2 row-span-2 relative group rounded-2xl overflow-hidden cursor-pointer min-h-[400px] border border-transparent transition-colors" style={{ backgroundColor: `${brandColor}10`, '--hover-border': `${brandColor}50` } as React.CSSProperties}>
              {featured?.image ? (
                <img 
                  src={featured.image} 
                  alt={featured.name} 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-800">
                  <Package size={64} className="text-slate-300" />
                </div>
              )}
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
              
              {/* Discount Badge */}
              {discount && (
                <div className="absolute top-4 right-4 font-bold px-3 py-1 rounded-full text-sm shadow-lg text-white" style={{ backgroundColor: brandColor, boxShadow: `0 4px 6px ${brandColor}30` }}>
                  {discount}
                </div>
              )}

              <div className="absolute bottom-0 left-0 p-6 md:p-8 w-full">
                <h3 className="text-2xl md:text-4xl font-bold mb-3 leading-tight text-white">{featured?.name}</h3>
                
                <div className="flex flex-row items-center justify-between gap-4 mt-2">
                  <span className="text-2xl font-bold text-white">{featured?.price}</span>
                  
                  <button className="rounded-full px-6 py-2 text-white border-0 shadow-lg transition-all hover:scale-105" style={{ backgroundColor: brandColor, boxShadow: `0 4px 6px ${brandColor}20` }}>
                    Xem chi tiết
                  </button>
                </div>
              </div>
            </div>

            {/* Small Grid Items */}
            {others.slice(0, 4).map((item) => {
              const itemDiscount = getDiscount(item.price, item.originalPrice);
              return (
                <div 
                  key={item.id} 
                  className="col-span-1 row-span-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-3 flex flex-col group hover:shadow-lg transition-all cursor-pointer relative overflow-hidden"
                  style={{ '--hover-border': `${brandColor}40` } as React.CSSProperties}
                >
                  {/* Image Area */}
                  <div className="relative aspect-square w-full rounded-xl overflow-hidden mb-3" style={{ backgroundColor: `${brandColor}08` }}>
                    {item.image ? (
                      <img 
                        src={item.image} 
                        className="h-full w-full object-contain p-2 transition-transform duration-300 group-hover:scale-110" 
                        alt={item.name} 
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <Package size={32} className="text-slate-300" />
                      </div>
                    )}
                    
                    {/* Discount Badge */}
                    {itemDiscount && (
                      <span className="absolute top-2 left-2 text-[10px] font-bold text-white px-1.5 py-0.5 rounded" style={{ backgroundColor: brandColor }}>
                        {itemDiscount}
                      </span>
                    )}

                    {/* Hover Action Button */}
                    <div className="absolute bottom-2 right-2 translate-y-10 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="text-white p-2 rounded-full shadow-lg" style={{ backgroundColor: brandColor }}>
                        <ArrowRight size={16} />
                      </div>
                    </div>
                  </div>

                  {/* Info Area */}
                  <div className="mt-auto px-1">
                    <h4 className="font-medium text-sm text-slate-900 dark:text-slate-100 truncate group-hover:opacity-80 transition-colors">
                      {item.name}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-bold" style={{ color: brandColor }}>
                        {item.price}
                      </span>
                      {item.originalPrice && (
                        <span className="text-[10px] text-slate-400 line-through opacity-70">
                          {item.originalPrice}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    );
  };

  return (
    <PreviewWrapper title={`Preview ${isProduct ? 'Sản phẩm' : 'Dịch vụ'}`} device={device} setDevice={setDevice} previewStyle={previewStyle} setPreviewStyle={setPreviewStyle} styles={styles}>
      <BrowserFrame url={`yoursite.com/${isProduct ? 'products' : 'services'}`}>
        {previewStyle === 'minimal' && renderMinimalStyle()}
        {previewStyle === 'commerce' && renderCommerceStyle()}
        {previewStyle === 'bento' && renderBentoStyle()}
      </BrowserFrame>
    </PreviewWrapper>
  );
};

// ============ SERVICE LIST PREVIEW ============
// Luxury Services Gallery UI/UX - 4 Variants from luxury-services-gallery
export type ServiceListStyle = 'grid' | 'bento' | 'list' | 'carousel';
export interface ServiceListPreviewItem {
  id: string | number;
  name: string;
  image?: string;
  price?: string;
  description?: string;
  tag?: 'new' | 'hot';
}

// Badge component for service tags (monochromatic style)
const ServiceBadge = ({ tag }: { tag?: 'new' | 'hot' }) => {
  if (!tag) return null;
  return (
    <span className={cn(
      "inline-flex items-center rounded-sm px-2 py-1 text-[10px] font-medium uppercase tracking-widest transition-colors",
      tag === 'hot' 
        ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900" 
        : "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200"
    )}>
      {tag === 'hot' ? 'Hot' : 'New'}
    </span>
  );
};

// Format price helper
const formatServicePrice = (price?: string | number) => {
  if (!price) return 'Liên hệ';
  if (typeof price === 'string') {
    const num = parseInt(price.replace(/\D/g, ''));
    if (isNaN(num) || num === 0) return 'Liên hệ';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(num);
  }
  if (price === 0) return 'Liên hệ';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(price);
};

export const ServiceListPreview = ({ brandColor, itemCount, selectedStyle, onStyleChange, items }: { 
  brandColor: string; 
  itemCount: number; 
  selectedStyle?: ServiceListStyle; 
  onStyleChange?: (style: ServiceListStyle) => void;
  items?: ServiceListPreviewItem[];
}) => {
  const [device, setDevice] = useState<PreviewDevice>('desktop');
  const previewStyle = selectedStyle || 'grid';
  const setPreviewStyle = (s: string) => onStyleChange?.(s as ServiceListStyle);
  const styles = [
    { id: 'grid', label: 'Grid' }, 
    { id: 'bento', label: 'Bento' }, 
    { id: 'list', label: 'List' }, 
    { id: 'carousel', label: 'Carousel' }
  ];
  const title = 'Dịch vụ';
  
  // Use real items if provided, otherwise fallback to mock (luxury services)
  const displayItems: ServiceListPreviewItem[] = items && items.length > 0 
    ? items 
    : [
        { id: 1, name: 'Thiết kế Nội thất Penthouse', description: 'Phong cách hiện đại, tối giản với vật liệu cao cấp nhập khẩu từ Ý.', price: '0', tag: 'hot' as const },
        { id: 2, name: 'Kiến trúc Xanh Vertical', description: 'Giải pháp bền vững cho đô thị.', price: '15000000', tag: 'new' as const },
        { id: 3, name: 'Cảnh quan Sân vườn Zen', description: 'Không gian thiền định tại gia.', price: '8500000' },
        { id: 4, name: 'Smart Home Hub', description: 'Tự động hóa toàn diện.', price: '25000000' },
        { id: 5, name: 'Biệt thự Cổ', description: 'Phục dựng di sản.', price: '0' },
        { id: 6, name: 'Lighting Art', description: 'Nghệ thuật ánh sáng.', price: '12000000', tag: 'new' as const }
      ].slice(0, Math.max(itemCount, 6));

  // Style 1: Grid - Clean cards với hover lift và arrow icon
  const renderGridStyle = () => (
    <section className="py-6 md:py-8 px-3 md:px-6">
      {/* Header */}
      <div className="flex flex-row items-center justify-between gap-3 border-b border-slate-200/40 dark:border-slate-700/40 pb-3 mb-4">
        <h2 className="text-xl md:text-2xl font-light tracking-tight text-slate-900 dark:text-slate-100">
          {title}
        </h2>
        <button className="group flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
          Xem tất cả 
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
      
      {/* Grid */}
      <div className={cn(
        "grid gap-4",
        device === 'mobile' ? 'grid-cols-1' : device === 'tablet' ? 'grid-cols-2' : 'grid-cols-3'
      )}>
        {displayItems.slice(0, device === 'mobile' ? 3 : 6).map((item) => (
          <div 
            key={item.id} 
            className="group cursor-pointer relative bg-white dark:bg-slate-800 flex flex-col hover:-translate-y-1 transition-all duration-300 h-full"
          >
            {/* Badge */}
            {item.tag && (
              <div className="absolute z-20 top-3 left-3">
                <ServiceBadge tag={item.tag} />
              </div>
            )}

            {/* Image Container */}
            <div className="relative overflow-hidden bg-slate-100 dark:bg-slate-700 mb-3 rounded-lg aspect-[4/3] w-full">
              {item.image ? (
                <img 
                  src={item.image} 
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Briefcase size={32} className="text-slate-300 dark:text-slate-500" />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex flex-col justify-between flex-shrink-0 pt-1">
              <h3 className="font-medium text-base text-slate-900 dark:text-slate-100 leading-tight group-hover:opacity-70 transition-colors">
                {item.name}
              </h3>

              <div className="flex items-end justify-between mt-3">
                <span className="text-sm font-semibold tracking-wide text-slate-700 dark:text-slate-300">
                  {formatServicePrice(item.price)}
                </span>
                <ArrowUpRight className="w-4 h-4 text-slate-400 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );

  // Style 2: Bento - Asymmetric grid với featured large card
  const renderBentoStyle = () => {
    const bentoItems = displayItems.slice(0, 4);
    const remainingCount = displayItems.length - 4;
    
    return (
      <section className="py-6 md:py-8 px-3 md:px-6">
        {/* Header */}
        <div className="flex flex-row items-center justify-between gap-3 border-b border-slate-200/40 dark:border-slate-700/40 pb-3 mb-4">
          <h2 className="text-xl md:text-2xl font-light tracking-tight text-slate-900 dark:text-slate-100">
            {title}
          </h2>
          <button className="group flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
            Xem tất cả 
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
        
        {/* Bento Grid */}
        {device === 'mobile' ? (
          <div className="grid grid-cols-2 gap-3">
            {bentoItems.map((item, i) => (
              <div key={item.id} className="group cursor-pointer h-[160px] relative">
                <div className="h-full border border-slate-200/40 dark:border-slate-700 rounded-xl p-3 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600 transition-all flex flex-col">
                  {item.tag && (
                    <div className="absolute z-20 top-4 left-4">
                      <ServiceBadge tag={item.tag} />
                    </div>
                  )}
                  <div className="flex-1 rounded-md overflow-hidden bg-slate-100 dark:bg-slate-700 min-h-[80px] mb-2">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Briefcase size={20} className="text-slate-300" />
                      </div>
                    )}
                  </div>
                  <h3 className="text-sm font-medium leading-tight line-clamp-1">{item.name}</h3>
                  <span className="text-xs text-slate-500 mt-1">{formatServicePrice(item.price)}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={cn(
            "grid gap-4 auto-rows-[300px]",
            device === 'tablet' ? 'grid-cols-3' : 'grid-cols-4'
          )}>
            {bentoItems.map((item, i) => {
              const isLastItem = i === 3;
              
              return (
                <div 
                  key={item.id}
                  className={cn(
                    "h-full min-h-[240px] relative group/bento",
                    i === 0 ? "col-span-2 row-span-2" : "",
                    i === 3 ? "col-span-2" : ""
                  )}
                >
                  <div className="h-full border border-slate-200/40 dark:border-slate-700 rounded-xl p-4 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600 transition-all flex flex-col cursor-pointer">
                    {item.tag && (
                      <div className="absolute z-20 top-6 left-6">
                        <ServiceBadge tag={item.tag} />
                      </div>
                    )}
                    
                    {/* Image */}
                    <div className="flex-1 min-h-[160px] w-full rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-700 mb-3">
                      {item.image ? (
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="w-full h-full object-cover group-hover/bento:scale-105 transition-transform duration-700 ease-out"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Briefcase size={i === 0 ? 48 : 28} className="text-slate-300" />
                        </div>
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="space-y-1">
                      <h3 className={cn(
                        "font-medium text-slate-900 dark:text-slate-100 leading-tight group-hover/bento:opacity-70 transition-colors",
                        i === 0 ? 'text-lg' : 'text-base'
                      )}>
                        {item.name}
                      </h3>
                      {i === 0 && item.description && (
                        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                          {item.description}
                        </p>
                      )}
                      <div className="flex items-end justify-between mt-2">
                        <span className="text-sm font-semibold tracking-wide text-slate-700 dark:text-slate-300">
                          {formatServicePrice(item.price)}
                        </span>
                        <ArrowUpRight className="w-4 h-4 text-slate-400 opacity-0 -translate-x-2 group-hover/bento:opacity-100 group-hover/bento:translate-x-0 transition-all duration-300" />
                      </div>
                    </div>
                  </div>
                  
                  {/* "+N more" overlay on last item */}
                  {isLastItem && remainingCount > 0 && (
                    <div className="absolute inset-0 bg-slate-900/90 dark:bg-slate-100/90 backdrop-blur-[2px] rounded-xl flex items-center justify-center cursor-pointer transition-opacity opacity-100 md:opacity-0 md:group-hover/bento:opacity-100 z-30">
                      <div className="text-white dark:text-slate-900 text-center">
                        <span className="text-4xl font-light flex items-center justify-center gap-1">
                          <Plus className="w-8 h-8" />{remainingCount}
                        </span>
                        <p className="text-sm font-medium mt-1">Dịch vụ khác</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    );
  };

  // Style 3: List - Horizontal row layout với divider
  const renderListStyle = () => (
    <section className="py-6 md:py-8 px-3 md:px-6">
      {/* Header */}
      <div className="flex flex-row items-center justify-between gap-3 border-b border-slate-200/40 dark:border-slate-700/40 pb-3 mb-4">
        <h2 className="text-xl md:text-2xl font-light tracking-tight text-slate-900 dark:text-slate-100">
          {title}
        </h2>
        <button className="group flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
          Xem tất cả 
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
      
      {/* List */}
      <div className="flex flex-col gap-2 max-w-4xl mx-auto">
        {displayItems.slice(0, device === 'mobile' ? 4 : 6).map((item) => (
          <div 
            key={item.id}
            className="group cursor-pointer flex flex-row items-center gap-4 md:gap-6 py-4 border-b border-slate-200/40 dark:border-slate-700/40 hover:bg-slate-50 dark:hover:bg-slate-800/50 px-2 rounded-lg transition-all"
          >
            {/* Image */}
            <div className={cn(
              "flex-shrink-0 rounded-md overflow-hidden bg-slate-100 dark:bg-slate-700",
              device === 'mobile' ? 'w-20 h-20' : 'w-24 h-24'
            )}>
              {item.image ? (
                <img 
                  src={item.image} 
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Briefcase size={24} className="text-slate-300" />
                </div>
              )}
            </div>
            
            {/* Content */}
            <div className="py-1 flex-1">
              {item.tag && (
                <div className="mb-1">
                  <ServiceBadge tag={item.tag} />
                </div>
              )}
              <h3 className="font-medium text-base md:text-lg text-slate-900 dark:text-slate-100 leading-tight group-hover:opacity-70 transition-colors">
                {item.name}
              </h3>
              <div className="flex items-end justify-between mt-2">
                <span className="text-sm font-semibold tracking-wide text-slate-700 dark:text-slate-300">
                  {formatServicePrice(item.price)}
                </span>
                <ArrowUpRight className="w-4 h-4 text-slate-400 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );

  // Style 4: Carousel - Horizontal scroll với snap (best practice: wider cards, snap-start, smooth scroll)
  const renderCarouselStyle = () => (
    <section className="py-6 md:py-8">
      {/* Header */}
      <div className="flex flex-row items-center justify-between gap-3 border-b border-slate-200/40 dark:border-slate-700/40 pb-3 mb-4 px-3 md:px-6">
        <h2 className="text-xl md:text-2xl font-light tracking-tight text-slate-900 dark:text-slate-100">
          {title}
        </h2>
        <button className="group flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
          Xem tất cả 
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
      
      {/* Carousel Container */}
      <div 
        className="flex gap-4 overflow-x-auto pb-4 px-3 md:px-6 snap-x snap-mandatory scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
      >
        {displayItems.map((item, idx) => (
          <div 
            key={item.id} 
            className={cn(
              "snap-start flex-shrink-0",
              device === 'mobile' ? 'w-[75vw]' : 'w-[280px]'
            )}
          >
            <div className="group cursor-pointer relative bg-white dark:bg-slate-800 flex flex-col hover:-translate-y-1 transition-all duration-300 h-full">
              {/* Badge */}
              {item.tag && (
                <div className="absolute z-20 top-3 left-3">
                  <ServiceBadge tag={item.tag} />
                </div>
              )}

              {/* Image Container */}
              <div className="relative overflow-hidden bg-slate-100 dark:bg-slate-700 mb-3 rounded-lg aspect-[4/3] w-full">
                {item.image ? (
                  <img 
                    src={item.image} 
                    alt={item.name}
                    draggable={false}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Briefcase size={32} className="text-slate-300 dark:text-slate-500" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex flex-col justify-between flex-shrink-0 pt-1">
                <h3 className="font-medium text-base text-slate-900 dark:text-slate-100 leading-tight group-hover:opacity-70 transition-colors line-clamp-2">
                  {item.name}
                </h3>

                <div className="flex items-end justify-between mt-3">
                  <span className="text-sm font-semibold tracking-wide text-slate-700 dark:text-slate-300">
                    {formatServicePrice(item.price)}
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-slate-400 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                </div>
              </div>
            </div>
          </div>
        ))}
        {/* Spacer at end for last item visibility */}
        <div className="snap-start flex-shrink-0 w-3 md:w-6" aria-hidden="true" />
      </div>
    </section>
  );

  return (
    <PreviewWrapper title="Preview Dịch vụ" device={device} setDevice={setDevice} previewStyle={previewStyle} setPreviewStyle={setPreviewStyle} styles={styles} info={`${displayItems.length} dịch vụ`}>
      <BrowserFrame url="yoursite.com/services">
        {previewStyle === 'grid' && renderGridStyle()}
        {previewStyle === 'bento' && renderBentoStyle()}
        {previewStyle === 'list' && renderListStyle()}
        {previewStyle === 'carousel' && renderCarouselStyle()}
      </BrowserFrame>
    </PreviewWrapper>
  );
};

// ============ BLOG PREVIEW ============
// Modern News Feed UI/UX - 3 Variants from modern-news-feed
export type BlogStyle = 'grid' | 'list' | 'featured';
export const BlogPreview = ({ brandColor, postCount, selectedStyle, onStyleChange }: { brandColor: string; postCount: number; selectedStyle?: BlogStyle; onStyleChange?: (style: BlogStyle) => void }) => {
  const [device, setDevice] = useState<PreviewDevice>('desktop');
  const previewStyle = selectedStyle || 'grid';
  const setPreviewStyle = (s: string) => onStyleChange?.(s as BlogStyle);
  const styles = [{ id: 'grid', label: 'Lưới' }, { id: 'list', label: 'Danh sách' }, { id: 'featured', label: 'Nổi bật' }];
  
  const mockPosts = Array.from({ length: Math.max(postCount, 5) }, (_, i) => ({ 
    id: i + 1, 
    title: i === 0 ? 'Xu hướng thiết kế UI/UX nổi bật năm 2024' : 
           i === 1 ? 'Tối ưu hóa hiệu năng React Application' :
           i === 2 ? 'AI và tương lai của thị trường lao động' :
           `Bài viết chất lượng cao số ${i + 1}`,
    excerpt: 'Khám phá những phong cách thiết kế đang thống trị thế giới công nghệ hiện đại.',
    date: `${12 - i}/05/2024`,
    category: i % 3 === 0 ? 'Thiết kế' : i % 3 === 1 ? 'Lập trình' : 'Công nghệ',
    readTime: `${5 + i} phút đọc`
  }));
  const showViewAll = postCount > 3;

  // Style 1: Grid - Professional card grid với hover lift
  const renderGridStyle = () => (
    <section className={cn("py-8 md:py-12", device === 'mobile' ? 'px-3' : 'px-4')}>
      <h2 className={cn("font-bold tracking-tighter text-left mb-6 md:mb-8", device === 'mobile' ? 'text-2xl' : 'text-3xl md:text-4xl')}>
        Bài viết
      </h2>
      <div className={cn("grid gap-4 md:gap-6", device === 'mobile' ? 'grid-cols-1' : device === 'tablet' ? 'grid-cols-2' : 'grid-cols-3')}>
        {mockPosts.slice(0, device === 'mobile' ? 2 : 3).map((post) => (
          <article 
            key={post.id} 
            className="group flex flex-col overflow-hidden rounded-xl border border-slate-200/60 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
          >
            {/* Image */}
            <div className="relative aspect-[16/10] overflow-hidden">
              <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-600 dark:to-slate-700 flex items-center justify-center">
                <FileText size={32} className="text-slate-400" />
              </div>
              <div className="absolute left-3 top-3">
                <span className="px-2 py-1 text-xs font-medium rounded bg-white/90 dark:bg-slate-800/90 shadow-sm backdrop-blur-sm">
                  {post.category}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="flex flex-1 flex-col p-4">
              <h3 className="mb-2 text-base md:text-lg font-bold leading-tight tracking-tight text-slate-900 dark:text-slate-100 group-hover:text-opacity-80 transition-colors line-clamp-2">
                {post.title}
              </h3>
              <div className="mt-auto pt-2">
                <time className="text-xs text-slate-500 dark:text-slate-400">{post.date}</time>
              </div>
            </div>
          </article>
        ))}
      </div>
      
      {/* View All */}
      {showViewAll && (
        <div className="flex justify-center pt-6 md:pt-8">
          <button className="group flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
            Xem tất cả
            <span className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5">↗</span>
          </button>
        </div>
      )}
    </section>
  );

  // Style 2: List - Horizontal cards với image trái
  const renderListStyle = () => (
    <section className={cn("py-8 md:py-12", device === 'mobile' ? 'px-3' : 'px-4')}>
      <h2 className={cn("font-bold tracking-tighter text-left mb-6 md:mb-8", device === 'mobile' ? 'text-2xl' : 'text-3xl md:text-4xl')}>
        Bài viết
      </h2>
      <div className={cn("grid gap-4", device === 'mobile' ? 'grid-cols-1' : 'grid-cols-1 max-w-4xl mx-auto')}>
        {mockPosts.slice(0, 4).map((post) => (
          <article 
            key={post.id} 
            className={cn(
              "group flex w-full overflow-hidden rounded-lg border border-slate-200/60 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/80 transition-all",
              device === 'mobile' ? 'flex-col' : 'flex-row'
            )}
          >
            {/* Image */}
            <div className={cn(
              "overflow-hidden flex-shrink-0",
              device === 'mobile' ? 'aspect-[16/9] w-full' : 'aspect-[4/3] w-[220px]'
            )}>
              <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-600 dark:to-slate-700 flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                <FileText size={24} className="text-slate-400" />
              </div>
            </div>
            
            {/* Content */}
            <div className="flex flex-1 flex-col justify-center p-4 md:px-6">
              <div className="mb-2">
                <span className="text-xs font-semibold" style={{ color: brandColor }}>{post.category}</span>
              </div>
              <h3 className="mb-2 text-base md:text-lg font-bold leading-snug text-slate-900 dark:text-slate-100 group-hover:text-opacity-80 transition-colors line-clamp-2">
                {post.title}
              </h3>
              <time className="text-xs text-slate-500 dark:text-slate-400">{post.date}</time>
            </div>
          </article>
        ))}
      </div>
      
      {/* View All */}
      {showViewAll && (
        <div className="flex justify-center pt-6 md:pt-8">
          <button className="group flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
            Xem tất cả
            <span className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5">↗</span>
          </button>
        </div>
      )}
    </section>
  );

  // Style 3: Featured - Hero card + sidebar compact list
  const renderFeaturedStyle = () => (
    <section className={cn("py-8 md:py-12", device === 'mobile' ? 'px-3' : 'px-4')}>
      <div className="flex items-center justify-between mb-6 md:mb-8">
        <h2 className={cn("font-bold tracking-tighter", device === 'mobile' ? 'text-2xl' : 'text-3xl md:text-4xl')}>
          Bài viết
        </h2>
        {showViewAll && (
          <button className="group flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
            Xem tất cả
            <span className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5">↗</span>
          </button>
        )}
      </div>
      
      <div className={cn("grid gap-6 md:gap-8", device === 'mobile' ? 'grid-cols-1' : 'grid-cols-12')}>
        {/* Main Hero Card - 8 columns */}
        <div className={cn(device === 'mobile' ? '' : 'col-span-8')}>
          <article className="group relative flex h-full min-h-[300px] md:min-h-[400px] flex-col justify-end overflow-hidden rounded-xl bg-slate-900 text-white shadow-md hover:shadow-xl transition-all">
            {/* Background */}
            <div className="absolute inset-0 z-0">
              <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-900 opacity-60 group-hover:opacity-50 group-hover:scale-105 transition-all duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />
            </div>

            {/* Content */}
            <div className="relative z-10 p-5 md:p-8">
              <div className="mb-3 flex items-center space-x-3">
                <span 
                  className="px-2.5 py-1 text-xs font-medium rounded backdrop-blur-md"
                  style={{ backgroundColor: `${brandColor}40`, color: 'white' }}
                >
                  {mockPosts[0].category}
                </span>
              </div>
              
              <h3 className={cn(
                "mb-2 font-bold leading-tight tracking-tight text-white",
                device === 'mobile' ? 'text-xl' : 'text-2xl md:text-3xl'
              )}>
                {mockPosts[0].title}
              </h3>
              
              <time className="text-sm font-medium text-slate-300">{mockPosts[0].date}</time>
            </div>
          </article>
        </div>

        {/* Sidebar List - 4 columns */}
        <div className={cn("flex flex-col gap-4", device === 'mobile' ? '' : 'col-span-4')}>
          <h3 className="font-semibold text-base md:text-lg mb-1 px-1 text-slate-700 dark:text-slate-300">Đáng chú ý khác</h3>
          {mockPosts.slice(1, 5).map((post) => (
            <article key={post.id} className="group flex items-center space-x-4 rounded-lg p-2 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors">
              <div className="relative h-14 w-14 md:h-16 md:w-16 shrink-0 overflow-hidden rounded-md border border-slate-200 dark:border-slate-700">
                <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-600 dark:to-slate-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <FileText size={16} className="text-slate-400" />
                </div>
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: brandColor }}>{post.category}</span>
                <h4 className="text-sm font-semibold leading-snug text-slate-900 dark:text-slate-100 line-clamp-2 group-hover:text-opacity-80 transition-colors">
                  {post.title}
                </h4>
                <time className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">{post.date}</time>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );

  return (
    <PreviewWrapper title="Preview Blog" device={device} setDevice={setDevice} previewStyle={previewStyle} setPreviewStyle={setPreviewStyle} styles={styles}>
      <BrowserFrame url="yoursite.com/blog">
        {previewStyle === 'grid' && renderGridStyle()}
        {previewStyle === 'list' && renderListStyle()}
        {previewStyle === 'featured' && renderFeaturedStyle()}
      </BrowserFrame>
    </PreviewWrapper>
  );
};

// ============ FOOTER PREVIEW ============
// 4 Professional Styles from footer reference: Classic Dark, Modern Center, Corporate, Minimal
type SocialLinkItem = { id: number; platform: string; url: string; icon: string };
type FooterConfig = { 
  logo: string; 
  description: string; 
  columns: Array<{ id: number; title: string; links: Array<{ label: string; url: string }> }>; 
  socialLinks?: SocialLinkItem[];
  copyright: string; 
  showSocialLinks: boolean 
};
export type FooterStyle = 'classic' | 'modern' | 'corporate' | 'minimal';
export const FooterPreview = ({ config, brandColor, selectedStyle, onStyleChange }: { config: FooterConfig; brandColor: string; selectedStyle?: FooterStyle; onStyleChange?: (style: FooterStyle) => void }) => {
  const [device, setDevice] = useState<PreviewDevice>('desktop');
  const previewStyle = selectedStyle || 'classic';
  const setPreviewStyle = (s: string) => onStyleChange?.(s as FooterStyle);
  const styles = [
    { id: 'classic', label: '1. Classic Dark' }, 
    { id: 'modern', label: '2. Modern Center' },
    { id: 'corporate', label: '3. Corporate' },
    { id: 'minimal', label: '4. Minimal' }
  ];

  // Utility: Darken a hex color
  const darkenColor = (hex: string, percent: number): string => {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max((num >> 16) - amt, 0);
    const G = Math.max((num >> 8 & 0x00FF) - amt, 0);
    const B = Math.max((num & 0x0000FF) - amt, 0);
    return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
  };

  // Background colors from brandColor, text uses neutral colors
  const bgDark = darkenColor(brandColor, 70);      // Dark background
  const bgMedium = darkenColor(brandColor, 60);    // Medium dark for cards/sections
  const borderColor = darkenColor(brandColor, 45); // Border color (subtle)

  // Social media brand colors
  const socialColors: Record<string, string> = {
    facebook: '#1877F2',
    instagram: '#E4405F',
    youtube: '#FF0000',
    tiktok: '#000000',
    zalo: '#0084FF',
    twitter: '#1DA1F2',
    linkedin: '#0A66C2',
    github: '#181717',
  };

  // Custom Facebook icon
  const FacebookIcon = ({ size = 18 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
    </svg>
  );

  // Custom Instagram icon
  const InstagramIcon = ({ size = 18 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
    </svg>
  );

  // Custom Youtube icon
  const YoutubeIcon = ({ size = 18 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="white"/>
    </svg>
  );

  // Custom TikTok icon
  const TikTokIcon = ({ size = 18 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
    </svg>
  );

  // Custom Zalo icon (Simple Icons - monochrome)
  const ZaloIcon = ({ size = 18 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.49 10.2722v-.4496h1.3467v6.3218h-.7704a.576.576 0 01-.5763-.5729l-.0006.0005a3.273 3.273 0 01-1.9372.6321c-1.8138 0-3.2844-1.4697-3.2844-3.2823 0-1.8125 1.4706-3.2822 3.2844-3.2822a3.273 3.273 0 011.9372.6321l.0006.0005zM6.9188 7.7896v.205c0 .3823-.051.6944-.2995 1.0605l-.03.0343c-.0542.0615-.1815.206-.2421.2843L2.024 14.8h4.8948v.7682a.5764.5764 0 01-.5767.5761H0v-.3622c0-.4436.1102-.6414.2495-.8476L4.8582 9.23H.1922V7.7896h6.7266zm8.5513 8.3548a.4805.4805 0 01-.4803-.4798v-7.875h1.4416v8.3548H15.47zM20.6934 9.6C22.52 9.6 24 11.0807 24 12.9044c0 1.8252-1.4801 3.306-3.3066 3.306-1.8264 0-3.3066-1.4808-3.3066-3.306 0-1.8237 1.4802-3.3044 3.3066-3.3044zm-10.1412 5.253c1.0675 0 1.9324-.8645 1.9324-1.9312 0-1.065-.865-1.9295-1.9324-1.9295s-1.9324.8644-1.9324 1.9295c0 1.0667.865 1.9312 1.9324 1.9312zm10.1412-.0033c1.0737 0 1.945-.8707 1.945-1.9453 0-1.073-.8713-1.9436-1.945-1.9436-1.0753 0-1.945.8706-1.945 1.9436 0 1.0746.8697 1.9453 1.945 1.9453z"/>
    </svg>
  );

  // Render social icons based on platform
  const renderSocialIcon = (platform: string, size: number = 18) => {
    switch (platform) {
      case 'facebook': return <FacebookIcon size={size} />;
      case 'instagram': return <InstagramIcon size={size} />;
      case 'youtube': return <YoutubeIcon size={size} />;
      case 'tiktok': return <TikTokIcon size={size} />;
      case 'zalo': return <ZaloIcon size={size} />;
      default: return <Globe size={size} />;
    }
  };

  // Get socials - use config.socialLinks if available, else default
  const getSocials = () => {
    if (config.socialLinks && config.socialLinks.length > 0) {
      return config.socialLinks;
    }
    return [
      { id: 1, platform: 'facebook', url: '#', icon: 'facebook' },
      { id: 2, platform: 'instagram', url: '#', icon: 'instagram' },
      { id: 3, platform: 'youtube', url: '#', icon: 'youtube' },
    ];
  };

  // Default columns if none provided
  const getColumns = () => {
    if (config.columns && config.columns.length > 0) {
      return config.columns;
    }
    return [
      { id: 1, title: 'Về chúng tôi', links: [{ label: 'Giới thiệu', url: '/about' }, { label: 'Tuyển dụng', url: '/careers' }, { label: 'Đội ngũ', url: '/team' }, { label: 'Tin tức', url: '/blog' }] },
      { id: 2, title: 'Hỗ trợ', links: [{ label: 'FAQ', url: '/faq' }, { label: 'Liên hệ', url: '/contact' }, { label: 'Chính sách', url: '/policy' }, { label: 'Báo cáo', url: '/report' }] }
    ];
  };

  // Style 1: Classic Dark - Standard layout với brand column và menu columns
  const renderClassicStyle = () => (
    <footer className="w-full text-white py-6 md:py-8" style={{ backgroundColor: bgDark, borderTop: `1px solid ${borderColor}` }}>
      <div className={cn("container max-w-7xl mx-auto", device === 'mobile' ? 'px-3' : 'px-4')}>
        <div className={cn(
          "grid gap-6",
          device === 'mobile' ? 'grid-cols-1 gap-4' : device === 'tablet' ? 'grid-cols-2 gap-5' : 'grid-cols-12 lg:gap-5'
        )}>
          
          {/* Brand Column */}
          <div className={cn(device === 'mobile' ? 'text-center' : device === 'tablet' ? 'col-span-2' : 'lg:col-span-5', "space-y-3")}>
            <div className={cn("flex items-center gap-2", device === 'mobile' ? 'justify-center' : '')}>
              <div className="p-1.5 rounded-lg" style={{ backgroundColor: bgMedium, border: `1px solid ${borderColor}` }}>
                {config.logo ? (
                  <img src={config.logo} alt="Logo" className="h-5 w-5 object-contain brightness-110" />
                ) : (
                  <div className="h-5 w-5 rounded flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: brandColor }}>V</div>
                )}
              </div>
              <span className="text-base font-bold tracking-tight text-white">VietAdmin</span>
            </div>
            <p className={cn("text-xs leading-relaxed text-white/80", device === 'mobile' ? '' : 'max-w-sm')}>
              {config.description || 'Đối tác tin cậy của bạn trong mọi giải pháp công nghệ và sáng tạo kỹ thuật số.'}
            </p>
            {config.showSocialLinks && (
              <div className={cn("flex gap-2", device === 'mobile' ? 'justify-center' : '')}>
                {getSocials().map((s) => (
                  <a key={s.id} href={s.url} className="h-7 w-7 flex items-center justify-center rounded-full hover:opacity-80 transition-all duration-300" style={{ backgroundColor: '#ffffff', color: socialColors[s.platform] || '#94a3b8' }}>
                    {renderSocialIcon(s.platform, 14)}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Dynamic Columns */}
          <div className={cn(
            "grid gap-5",
            device === 'mobile' ? 'grid-cols-2 text-center' : device === 'tablet' ? 'grid-cols-2' : 'lg:col-span-7 grid-cols-2 md:grid-cols-3'
          )}>
            {getColumns().slice(0, 2).map((col) => (
              <div key={col.id}>
                <h3 className="font-semibold text-white text-xs tracking-wide mb-2">{col.title}</h3>
                <ul className="space-y-1.5">
                  {col.links.map((link, lIdx) => (
                    <li key={lIdx}>
                      <a href={link.url} className="text-xs hover:text-white transition-colors block text-white/70">
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 pt-3" style={{ borderTop: `1px solid ${borderColor}50` }}>
          <p className={cn("text-[10px] text-white/60", device === 'mobile' ? 'text-center' : '')}>{config.copyright || '© 2024 VietAdmin. All rights reserved.'}</p>
        </div>
      </div>
    </footer>
  );

  // Style 2: Modern Centered - Elegant centered layout
  const renderModernStyle = () => (
    <footer className="w-full text-white py-6 md:py-8" style={{ backgroundColor: bgDark }}>
      <div className={cn("container max-w-5xl mx-auto flex flex-col items-center text-center space-y-4", device === 'mobile' ? 'px-3 space-y-3' : 'px-4')}>
        
        {/* Brand */}
        <div className="flex flex-col items-center gap-2">
          <div className="h-10 w-10 rounded-xl flex items-center justify-center shadow-lg shadow-black/20 mb-1" style={{ background: `linear-gradient(to top right, ${bgMedium}, ${borderColor})` }}>
            {config.logo ? (
              <img src={config.logo} alt="Logo" className="h-6 w-6 object-contain drop-shadow-md" />
            ) : (
              <div className="h-6 w-6 rounded-lg flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: brandColor }}>V</div>
            )}
          </div>
          <h2 className="text-base font-bold text-white tracking-tight">VietAdmin</h2>
          <p className={cn("text-xs leading-relaxed text-white/80", device === 'mobile' ? 'max-w-xs' : 'max-w-md')}>
            {config.description || 'Đối tác tin cậy của bạn trong mọi giải pháp công nghệ.'}
          </p>
        </div>

        {/* Navigation (Flat) */}
        <div className={cn("flex flex-wrap justify-center gap-x-4 gap-y-1.5", device === 'mobile' ? 'gap-x-3' : '')}>
          {getColumns().flatMap(col => col.links).slice(0, device === 'mobile' ? 4 : 8).map((link, i) => (
            <a key={i} href={link.url} className="text-xs font-medium hover:text-white hover:underline underline-offset-4 transition-all text-white/70" style={{ textDecorationColor: brandColor }}>
              {link.label}
            </a>
          ))}
        </div>

        <div className="w-12 h-px" style={{ background: `linear-gradient(to right, transparent, ${borderColor}, transparent)` }}></div>

        {/* Socials */}
        {config.showSocialLinks && (
          <div className="flex gap-3">
            {getSocials().map((s) => (
              <a key={s.id} href={s.url} className="h-7 w-7 flex items-center justify-center rounded-full hover:opacity-80 transition-all duration-300" style={{ backgroundColor: '#ffffff', color: socialColors[s.platform] || '#94a3b8' }}>
                {renderSocialIcon(s.platform, 14)}
              </a>
            ))}
          </div>
        )}

        {/* Copyright */}
        <div className="text-[10px] font-medium text-white/60">
          {config.copyright || '© 2024 VietAdmin. All rights reserved.'}
        </div>
      </div>
    </footer>
  );

  // Style 3: Corporate Grid - Structured professional layout
  const renderCorporateStyle = () => (
    <footer className="w-full text-white py-6 md:py-8" style={{ backgroundColor: bgDark, borderTop: `1px solid ${borderColor}` }}>
      <div className={cn("container max-w-7xl mx-auto", device === 'mobile' ? 'px-3' : 'px-4')}>
        
        {/* Top Row: Logo & Socials */}
        <div className={cn(
          "flex justify-between items-start gap-3 pb-4",
          device === 'mobile' ? 'flex-col items-center text-center' : 'md:flex-row md:items-center'
        )} style={{ borderBottom: `1px solid ${borderColor}` }}>
          <div className={cn("flex items-center gap-2", device === 'mobile' ? 'justify-center' : '')}>
            {config.logo ? (
              <img src={config.logo} alt="Logo" className="h-5 w-5 object-contain" />
            ) : (
              <div className="h-5 w-5 rounded flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: brandColor }}>V</div>
            )}
            <span className="text-sm font-bold text-white">VietAdmin</span>
          </div>
          {config.showSocialLinks && (
            <div className="flex gap-2">
              {getSocials().map((s) => (
                <a key={s.id} href={s.url} className="h-6 w-6 flex items-center justify-center rounded-full hover:opacity-80 transition-all duration-300" style={{ backgroundColor: '#ffffff', color: socialColors[s.platform] || '#94a3b8' }}>
                  {renderSocialIcon(s.platform, 12)}
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Middle Row: Columns */}
        <div className={cn(
          "py-5 grid gap-5",
          device === 'mobile' ? 'grid-cols-1 text-center' : device === 'tablet' ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-2 md:grid-cols-4'
        )}>
          <div className={cn(device === 'mobile' ? '' : 'col-span-2 md:col-span-2 pr-4')}>
            <h4 className="text-[10px] font-bold text-white uppercase tracking-wider mb-2">Về Công Ty</h4>
            <p className="text-xs leading-relaxed text-white/80">{config.description || 'Đối tác tin cậy của bạn trong mọi giải pháp công nghệ.'}</p>
          </div>
          
          {getColumns().slice(0, 2).map((col) => (
            <div key={col.id}>
              <h4 className="text-[10px] font-bold text-white uppercase tracking-wider mb-2">{col.title}</h4>
              <ul className="space-y-1">
                {col.links.map((link, lIdx) => (
                  <li key={lIdx}>
                    <a href={link.url} className="text-xs hover:text-white transition-colors text-white/70">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Row */}
        <div className={cn("pt-3 text-[10px] text-white/60", device === 'mobile' ? 'text-center' : '')}>
          {config.copyright || '© 2024 VietAdmin. All rights reserved.'}
        </div>
      </div>
    </footer>
  );

  // Style 4: Minimal - Compact single row
  const renderMinimalStyle = () => (
    <footer className="w-full text-white py-3 md:py-4" style={{ backgroundColor: bgDark, borderTop: `1px solid ${borderColor}` }}>
      <div className={cn("container max-w-7xl mx-auto", device === 'mobile' ? 'px-3' : 'px-4')}>
        <div className={cn(
          "flex items-center justify-between gap-3",
          device === 'mobile' ? 'flex-col text-center' : 'md:flex-row'
        )}>
          
          {/* Left: Logo & Copy */}
          <div className={cn("flex items-center gap-2", device === 'mobile' ? 'flex-col' : '')}>
            {config.logo ? (
              <img src={config.logo} alt="Logo" className="h-4 w-4 opacity-80" />
            ) : (
              <div className="h-4 w-4 rounded flex items-center justify-center text-white text-[10px] font-bold" style={{ backgroundColor: brandColor }}>V</div>
            )}
            <span className="text-[10px] font-medium text-white/60">{config.copyright || '© 2024 VietAdmin. All rights reserved.'}</span>
          </div>

          {/* Right: Socials only */}
          {config.showSocialLinks && (
            <div className="flex gap-2">
              {getSocials().map((s) => (
                <a key={s.id} href={s.url} className="h-6 w-6 flex items-center justify-center rounded-full hover:opacity-80 transition-all duration-300" style={{ backgroundColor: '#ffffff', color: socialColors[s.platform] || '#94a3b8' }}>
                  {renderSocialIcon(s.platform, 12)}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  );

  return (
    <PreviewWrapper title="Preview Footer" device={device} setDevice={setDevice} previewStyle={previewStyle} setPreviewStyle={setPreviewStyle} styles={styles}>
      <BrowserFrame>
        {previewStyle === 'classic' && renderClassicStyle()}
        {previewStyle === 'modern' && renderModernStyle()}
        {previewStyle === 'corporate' && renderCorporateStyle()}
        {previewStyle === 'minimal' && renderMinimalStyle()}
      </BrowserFrame>
    </PreviewWrapper>
  );
};

// ============ CTA PREVIEW ============
type CTAConfig = { title: string; description: string; buttonText: string; buttonLink: string; secondaryButtonText: string; secondaryButtonLink: string };
export type CTAStyle = 'banner' | 'centered' | 'split';
export const CTAPreview = ({ config, brandColor, selectedStyle, onStyleChange }: { config: CTAConfig; brandColor: string; selectedStyle?: CTAStyle; onStyleChange?: (style: CTAStyle) => void }) => {
  const [device, setDevice] = useState<PreviewDevice>('desktop');
  const previewStyle = selectedStyle || 'banner';
  const setPreviewStyle = (s: string) => onStyleChange?.(s as CTAStyle);
  const styles = [{ id: 'banner', label: 'Banner' }, { id: 'centered', label: 'Centered' }, { id: 'split', label: 'Split' }];

  const renderBannerStyle = () => (
    <div className={cn("py-12 px-6", device === 'mobile' ? 'py-8 px-4' : '')} style={{ backgroundColor: brandColor }}>
      <div className={cn("max-w-4xl mx-auto flex items-center justify-between", device === 'mobile' ? 'flex-col text-center gap-6' : '')}>
        <div>
          <h3 className={cn("font-bold text-white", device === 'mobile' ? 'text-xl' : 'text-2xl')}>{config.title || 'Sẵn sàng bắt đầu?'}</h3>
          <p className="text-white/80 mt-2">{config.description || 'Đăng ký ngay để nhận ưu đãi đặc biệt'}</p>
        </div>
        <div className={cn("flex gap-3", device === 'mobile' ? 'flex-col w-full' : '')}>
          <button className="px-6 py-3 bg-white rounded-lg font-medium" style={{ color: brandColor }}>{config.buttonText || 'Bắt đầu ngay'}</button>
          {config.secondaryButtonText && <button className="px-6 py-3 border-2 border-white/50 text-white rounded-lg font-medium">{config.secondaryButtonText}</button>}
        </div>
      </div>
    </div>
  );

  const renderCenteredStyle = () => (
    <div className={cn("py-16 px-6 text-center", device === 'mobile' ? 'py-10 px-4' : '')} style={{ backgroundColor: `${brandColor}10` }}>
      <h3 className={cn("font-bold", device === 'mobile' ? 'text-xl' : 'text-3xl')} style={{ color: brandColor }}>{config.title || 'Sẵn sàng bắt đầu?'}</h3>
      <p className="text-slate-600 mt-3 max-w-xl mx-auto">{config.description || 'Đăng ký ngay để nhận ưu đãi đặc biệt'}</p>
      <div className={cn("flex justify-center gap-3 mt-6", device === 'mobile' ? 'flex-col' : '')}>
        <button className="px-8 py-3 rounded-lg font-medium text-white" style={{ backgroundColor: brandColor }}>{config.buttonText || 'Bắt đầu ngay'}</button>
        {config.secondaryButtonText && <button className="px-8 py-3 border-2 rounded-lg font-medium" style={{ borderColor: brandColor, color: brandColor }}>{config.secondaryButtonText}</button>}
      </div>
    </div>
  );

  const renderSplitStyle = () => (
    <div className={cn("py-12 px-6", device === 'mobile' ? 'py-8 px-4' : '')} style={{ background: `linear-gradient(135deg, ${brandColor} 50%, ${brandColor}dd 100%)` }}>
      <div className={cn("max-w-4xl mx-auto grid gap-8", device === 'mobile' ? 'grid-cols-1 text-center' : 'grid-cols-2 items-center')}>
        <div>
          <h3 className={cn("font-bold text-white", device === 'mobile' ? 'text-xl' : 'text-2xl')}>{config.title || 'Sẵn sàng bắt đầu?'}</h3>
          <p className="text-white/80 mt-2">{config.description || 'Đăng ký ngay để nhận ưu đãi đặc biệt'}</p>
        </div>
        <div className={cn("flex gap-3", device === 'mobile' ? 'flex-col' : 'justify-end')}>
          <button className="px-6 py-3 bg-white rounded-lg font-medium shadow-lg" style={{ color: brandColor }}>{config.buttonText || 'Bắt đầu ngay'}</button>
        </div>
      </div>
    </div>
  );

  return (
    <PreviewWrapper title="Preview CTA" device={device} setDevice={setDevice} previewStyle={previewStyle} setPreviewStyle={setPreviewStyle} styles={styles}>
      <BrowserFrame>
        {previewStyle === 'banner' && renderBannerStyle()}
        {previewStyle === 'centered' && renderCenteredStyle()}
        {previewStyle === 'split' && renderSplitStyle()}
      </BrowserFrame>
    </PreviewWrapper>
  );
};

// ============ ABOUT PREVIEW ============
// Brand Story UI/UX - 3 Variants from brand-story-component: classic, bento, minimal
type AboutConfig = {
  layout?: string;
  subHeading: string;
  heading: string;
  description: string;
  image: string;
  stats: Array<{ id: number; value: string; label: string }>;
  buttonText: string;
  buttonLink: string;
  style?: AboutStyle;
};
export type AboutStyle = 'classic' | 'bento' | 'minimal';

// Badge Component for About - Monochromatic with brandColor
const AboutBadge = ({ text, variant = 'default', brandColor }: { text: string; variant?: 'default' | 'outline' | 'minimal'; brandColor: string }) => {
  const baseStyles = "inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold uppercase tracking-wider w-fit";
  
  // Monochromatic variants using brandColor tints/shades
  if (variant === 'outline') {
    return (
      <div 
        className={cn(baseStyles, "bg-transparent font-medium")}
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
  
  // Default variant
  return (
    <div 
      className={cn(baseStyles)}
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
      <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm flex flex-col items-start justify-end h-full hover:border-slate-300 dark:hover:border-slate-600 transition-colors group">
        <span 
          className="text-4xl md:text-5xl font-bold tracking-tighter mb-2 group-hover:scale-105 transition-transform origin-left"
          style={{ color: brandColor }}
        >
          {stat.value || '0'}
        </span>
        <span className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
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
        <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">{stat.label || 'Label'}</span>
      </div>
    );
  }

  // Classic variant
  return (
    <div className="flex flex-col gap-1">
      <span className="text-5xl font-extrabold tracking-tighter" style={{ color: brandColor }}>{stat.value || '0'}</span>
      <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{stat.label || 'Label'}</span>
    </div>
  );
};

export const AboutPreview = ({ config, brandColor, selectedStyle, onStyleChange }: { config: AboutConfig; brandColor: string; selectedStyle?: AboutStyle; onStyleChange?: (style: AboutStyle) => void }) => {
  const [device, setDevice] = useState<PreviewDevice>('desktop');
  const previewStyle = selectedStyle || config.style || 'bento';
  const setPreviewStyle = (s: string) => onStyleChange?.(s as AboutStyle);
  const styles = [
    { id: 'classic', label: 'Classic' }, 
    { id: 'bento', label: 'Bento Grid' }, 
    { id: 'minimal', label: 'Minimal' }
  ];

  // Style 1: Classic - Open Layout, Image Left, Typography Focused
  const renderClassicStyle = () => (
    <section className={cn("py-10 md:py-16", device === 'mobile' ? 'px-4' : 'px-6 md:px-8')}>
      <div className={cn(
        "grid gap-8 md:gap-12 lg:gap-20 items-center",
        device === 'mobile' ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'
      )}>
        {/* Image Side (Left on desktop) */}
        <div className={cn("relative rounded-2xl overflow-hidden shadow-2xl", device === 'mobile' ? 'order-2 aspect-[4/3]' : 'order-1 aspect-[4/3]')}>
          {config.image ? (
            <img 
              src={config.image} 
              alt="Brand Story" 
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" 
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-800">
              <ImageIcon size={48} className="text-slate-300" />
            </div>
          )}
        </div>

        {/* Text Side (Right on desktop) */}
        <div className={cn("flex flex-col justify-center space-y-8 md:space-y-10", device === 'mobile' ? 'order-1' : 'order-2')}>
          <div className="space-y-4 md:space-y-6">
            {config.subHeading && (
              <AboutBadge text={config.subHeading} variant="outline" brandColor={brandColor} />
            )}
            <h2 className={cn(
              "font-bold text-slate-900 dark:text-slate-100 tracking-tight leading-[1.1]",
              device === 'mobile' ? 'text-3xl' : 'text-4xl md:text-5xl lg:text-6xl'
            )}>
              {config.heading || 'Mang đến giá trị thực'}
            </h2>
            <p className={cn(
              "text-slate-600 dark:text-slate-400 leading-relaxed",
              device === 'mobile' ? 'text-base' : 'text-lg md:text-xl'
            )}>
              {config.description || 'Mô tả về công ty...'}
            </p>
          </div>
          
          {/* Stats - Horizontal row */}
          {config.stats.length > 0 && (
            <div className={cn(
              "flex flex-row gap-8 md:gap-12 border-t border-slate-200 dark:border-slate-700 pt-6 md:pt-8",
              device === 'mobile' ? 'gap-6' : ''
            )}>
              {config.stats.slice(0, 2).map((stat) => (
                <AboutStatBox key={stat.id} stat={stat} variant="classic" brandColor={brandColor} />
              ))}
            </div>
          )}

          {config.buttonText && (
            <div>
              <button 
                className="inline-flex items-center gap-2 p-0 h-auto text-lg font-semibold hover:opacity-80 transition-opacity group"
                style={{ color: brandColor }}
              >
                {config.buttonText} 
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );

  // Style 2: Bento Grid - Modern Tech Grid
  const renderBentoStyle = () => (
    <section className={cn(
      "rounded-3xl",
      device === 'mobile' ? 'p-3' : 'p-4 md:p-8'
    )} style={{ backgroundColor: 'rgba(0,0,0,0.02)' }}>
      <div className={cn(
        "grid gap-3 md:gap-6",
        device === 'mobile' ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3'
      )}>
        {/* Cell 1: Main Content */}
        <div className={cn(
          "bg-white dark:bg-slate-800 rounded-2xl p-6 md:p-8 lg:p-12 border border-slate-200/50 dark:border-slate-700/50 shadow-sm flex flex-col justify-center space-y-4 md:space-y-6",
          device === 'mobile' ? '' : 'md:col-span-2'
        )}>
          <div className="space-y-3 md:space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-2 w-2 rounded-full animate-pulse" style={{ backgroundColor: brandColor }} />
              <span className="text-sm font-semibold uppercase tracking-wide" style={{ color: brandColor }}>
                {config.subHeading || 'Câu chuyện thương hiệu'}
              </span>
            </div>
            <h2 className={cn(
              "font-bold text-slate-900 dark:text-slate-100",
              device === 'mobile' ? 'text-2xl' : 'text-3xl md:text-4xl lg:text-5xl'
            )}>
              {config.heading || 'Mang đến giá trị thực'}
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              {config.description || 'Mô tả về công ty...'}
            </p>
          </div>
          {config.buttonText && (
            <div className="pt-2 md:pt-4">
              <button 
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border-2 font-medium transition-colors hover:text-white"
                style={{ borderColor: brandColor, color: brandColor }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = brandColor; e.currentTarget.style.color = 'white'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = brandColor; }}
              >
                {config.buttonText} <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Cell 2 & 3: Stats Stacked */}
        <div className={cn(
          "grid gap-3 md:gap-6",
          device === 'mobile' ? 'grid-cols-2' : 'grid-cols-1'
        )}>
          {config.stats.slice(0, 2).map((stat) => (
            <AboutStatBox key={stat.id} stat={stat} variant="bento" brandColor={brandColor} />
          ))}
        </div>

        {/* Cell 4: Wide Image */}
        <div className={cn(
          "h-48 md:h-64 lg:h-80 rounded-2xl overflow-hidden relative group",
          device === 'mobile' ? '' : 'md:col-span-3'
        )}>
          {config.image ? (
            <img 
              src={config.image} 
              alt="Office" 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
            />
          ) : (
            <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
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
    </section>
  );

  // Style 3: Minimal - Safe/Boring Design, Boxed Layout
  const renderMinimalStyle = () => (
    <section className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
      <div className={cn(
        "flex h-full min-h-[400px] md:min-h-[500px]",
        device === 'mobile' ? 'flex-col' : 'flex-col lg:flex-row'
      )}>
        {/* Left: Content */}
        <div className={cn(
          "flex-1 p-6 md:p-10 lg:p-16 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-700",
          device === 'mobile' ? '' : ''
        )}>
          <div className="max-w-xl space-y-6 md:space-y-8">
            {config.subHeading && (
              <AboutBadge text={config.subHeading} variant="minimal" brandColor={brandColor} />
            )}
            
            <div className="space-y-3 md:space-y-4">
              <h2 className={cn(
                "font-semibold tracking-tight text-slate-900 dark:text-slate-100",
                device === 'mobile' ? 'text-2xl' : 'text-3xl md:text-4xl'
              )}>
                {config.heading || 'Mang đến giá trị thực'}
              </h2>
              <p className={cn(
                "text-slate-600 dark:text-slate-400 leading-relaxed",
                device === 'mobile' ? 'text-base' : 'text-lg'
              )}>
                {config.description || 'Mô tả về công ty...'}
              </p>
            </div>

            {/* Stats with vertical bar */}
            {config.stats.length > 0 && (
              <div className={cn("flex gap-6 md:gap-8 py-4", device === 'mobile' ? 'gap-4' : '')}>
                {config.stats.slice(0, 2).map((stat) => (
                  <AboutStatBox key={stat.id} stat={stat} variant="minimal" brandColor={brandColor} />
                ))}
              </div>
            )}

            {config.buttonText && (
              <div>
                <button 
                  className="h-12 px-6 rounded-md font-medium transition-colors hover:opacity-90"
                  style={{ backgroundColor: brandColor, color: 'white' }}
                >
                  {config.buttonText}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right: Image */}
        <div className={cn(
          "relative bg-slate-100 dark:bg-slate-900",
          device === 'mobile' ? 'h-64' : 'lg:w-[45%] h-64 lg:h-auto'
        )}>
          {config.image ? (
            <img 
              src={config.image} 
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
    </section>
  );

  return (
    <PreviewWrapper title="Preview About" device={device} setDevice={setDevice} previewStyle={previewStyle} setPreviewStyle={setPreviewStyle} styles={styles}>
      <BrowserFrame url="yoursite.com/about">
        {previewStyle === 'classic' && renderClassicStyle()}
        {previewStyle === 'bento' && renderBentoStyle()}
        {previewStyle === 'minimal' && renderMinimalStyle()}
      </BrowserFrame>
    </PreviewWrapper>
  );
};

// ============ BENEFITS PREVIEW (Why Choose Us) ============
// 4 Professional Styles: Solid Cards, Accent List, Bold Bento, Icon Row
type BenefitItem = { id: number; icon: string; title: string; description: string };
export type BenefitsStyle = 'cards' | 'list' | 'bento' | 'row';
export const BenefitsPreview = ({ items, brandColor, selectedStyle, onStyleChange }: { items: BenefitItem[]; brandColor: string; selectedStyle?: BenefitsStyle; onStyleChange?: (style: BenefitsStyle) => void }) => {
  const [device, setDevice] = useState<PreviewDevice>('desktop');
  const previewStyle = selectedStyle || 'cards';
  const setPreviewStyle = (s: string) => onStyleChange?.(s as BenefitsStyle);
  const styles = [
    { id: 'cards', label: 'Solid Cards' }, 
    { id: 'list', label: 'Accent List' }, 
    { id: 'bento', label: 'Bold Bento' },
    { id: 'row', label: 'Icon Row' }
  ];

  // Style 1: Corporate Cards - Solid background với icon đậm màu chủ đạo
  const renderCardsStyle = () => (
    <div className={cn("py-8 px-4", device === 'mobile' ? 'py-6 px-3' : 'md:py-12 md:px-6')}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b-2 mb-6" style={{ borderColor: `${brandColor}20` }}>
        <div className="space-y-2">
          <div className="inline-block px-3 py-1 rounded text-xs font-bold uppercase tracking-wider" style={{ backgroundColor: `${brandColor}15`, color: brandColor }}>
            Vì sao chọn chúng tôi?
          </div>
          <h2 className={cn("font-bold tracking-tight text-slate-900 dark:text-slate-100", device === 'mobile' ? 'text-xl' : 'text-2xl md:text-3xl')}>
            Giá trị cốt lõi
          </h2>
        </div>
      </div>
      
      {/* Grid */}
      <div className={cn(
        "grid gap-4 md:gap-6",
        device === 'mobile' ? 'grid-cols-1' : device === 'tablet' ? 'grid-cols-2' : 'grid-cols-2 lg:grid-cols-4'
      )}>
        {items.slice(0, 4).map((item) => (
          <div 
            key={item.id} 
            className="rounded-xl p-5 md:p-6 shadow-sm flex flex-col items-start border"
            style={{ backgroundColor: `${brandColor}08`, borderColor: `${brandColor}20` }}
          >
            {/* Icon luôn hiển thị trạng thái active */}
            <div 
              className="w-11 h-11 md:w-12 md:h-12 rounded-lg flex items-center justify-center mb-4 text-white"
              style={{ backgroundColor: brandColor, boxShadow: `0 4px 6px -1px ${brandColor}30` }}
            >
              <Check size={18} strokeWidth={3} />
            </div>
            
            <h3 className="font-bold text-base md:text-lg mb-2" style={{ color: brandColor }}>
              {item.title || 'Tiêu đề'}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {item.description || 'Mô tả lợi ích...'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );

  // Style 2: Modern List - Thanh màu bên trái nhấn mạnh
  const renderListStyle = () => (
    <div className={cn("py-8 px-4", device === 'mobile' ? 'py-6 px-3' : 'md:py-12 md:px-6')}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b-2 mb-6" style={{ borderColor: `${brandColor}20` }}>
        <div className="space-y-2">
          <div className="inline-block px-3 py-1 rounded text-xs font-bold uppercase tracking-wider" style={{ backgroundColor: `${brandColor}15`, color: brandColor }}>
            Vì sao chọn chúng tôi?
          </div>
          <h2 className={cn("font-bold tracking-tight text-slate-900 dark:text-slate-100", device === 'mobile' ? 'text-xl' : 'text-2xl md:text-3xl')}>
            Giá trị cốt lõi
          </h2>
        </div>
      </div>
      
      {/* List */}
      <div className="flex flex-col gap-3 max-w-4xl mx-auto">
        {items.slice(0, 4).map((item, index) => (
          <div 
            key={item.id} 
            className="relative bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-lg p-4 md:p-5 pl-5 md:pl-6 overflow-hidden shadow-sm"
          >
            {/* Thanh màu chủ đạo nhấn mạnh bên trái */}
            <div className="absolute top-0 bottom-0 left-0 w-1.5" style={{ backgroundColor: brandColor }} />
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-3">
              <div className="flex items-start gap-3 md:gap-4">
                <div className="flex-shrink-0 mt-0.5">
                  <div 
                    className="w-6 h-6 rounded-full flex items-center justify-center border"
                    style={{ backgroundColor: `${brandColor}15`, borderColor: `${brandColor}30` }}
                  >
                    <span className="text-[11px] font-bold" style={{ color: brandColor }}>{index + 1}</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm md:text-base">
                    {item.title || 'Tiêu đề'}
                  </h3>
                  <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1 md:mt-1.5 leading-normal">
                    {item.description || 'Mô tả lợi ích...'}
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
  );

  // Style 3: Trust Bento - Typography focused với layout 2-1 / 1-2
  const renderBentoStyle = () => (
    <div className={cn("py-8 px-4", device === 'mobile' ? 'py-6 px-3' : 'md:py-12 md:px-6')}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b-2 mb-6" style={{ borderColor: `${brandColor}20` }}>
        <div className="space-y-2">
          <div className="inline-block px-3 py-1 rounded text-xs font-bold uppercase tracking-wider" style={{ backgroundColor: `${brandColor}15`, color: brandColor }}>
            Vì sao chọn chúng tôi?
          </div>
          <h2 className={cn("font-bold tracking-tight text-slate-900 dark:text-slate-100", device === 'mobile' ? 'text-xl' : 'text-2xl md:text-3xl')}>
            Giá trị cốt lõi
          </h2>
        </div>
      </div>
      
      {/* Bento Grid */}
      <div className={cn(
        "grid gap-3 md:gap-4",
        device === 'mobile' ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3'
      )}>
        {items.slice(0, 4).map((item, index) => {
          // Layout: Item 0 span 2, Item 3 span 2, Items 1 & 2 span 1
          const isWide = index === 0 || index === 3;
          const isPrimary = index === 0;
          
          return (
            <div 
              key={item.id} 
              className={cn(
                "flex flex-col justify-between p-5 md:p-6 lg:p-8 rounded-2xl transition-colors min-h-[160px] md:min-h-[180px]",
                device !== 'mobile' && isWide ? "md:col-span-2" : device !== 'mobile' ? "md:col-span-1" : "",
                isPrimary 
                  ? "text-white border border-transparent" 
                  : "bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700"
              )}
              style={isPrimary ? { backgroundColor: brandColor, boxShadow: `0 10px 15px -3px ${brandColor}30` } : {}}
            >
              {/* Header: Number Index */}
              <div className="flex justify-between items-start mb-3 md:mb-4">
                <span className={cn(
                  "text-xs font-bold uppercase tracking-widest px-2 py-1 rounded",
                  isPrimary ? "bg-white/20 text-white" : ""
                )} style={!isPrimary ? { backgroundColor: `${brandColor}15`, color: brandColor } : {}}>
                  0{index + 1}
                </span>
              </div>

              {/* Content: Pure Typography */}
              <div>
                <h3 className={cn(
                  "font-bold mb-2 md:mb-3 tracking-tight",
                  device === 'mobile' ? 'text-lg' : 'text-xl md:text-2xl',
                  isPrimary ? "text-white" : "text-slate-900 dark:text-slate-100"
                )}>
                  {item.title || 'Tiêu đề'}
                </h3>
                <p className={cn(
                  "text-sm md:text-base leading-relaxed font-medium",
                  isPrimary ? "text-white/90" : "text-slate-500 dark:text-slate-400"
                )}>
                  {item.description || 'Mô tả lợi ích...'}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // Style 4: Minimal Row - Icon to với dividers
  const renderRowStyle = () => (
    <div className={cn("py-8 px-4", device === 'mobile' ? 'py-6 px-3' : 'md:py-12 md:px-6')}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b-2 mb-6" style={{ borderColor: `${brandColor}20` }}>
        <div className="space-y-2">
          <div className="inline-block px-3 py-1 rounded text-xs font-bold uppercase tracking-wider" style={{ backgroundColor: `${brandColor}15`, color: brandColor }}>
            Vì sao chọn chúng tôi?
          </div>
          <h2 className={cn("font-bold tracking-tight text-slate-900 dark:text-slate-100", device === 'mobile' ? 'text-xl' : 'text-2xl md:text-3xl')}>
            Giá trị cốt lõi
          </h2>
        </div>
      </div>
      
      {/* Row */}
      <div className="bg-white dark:bg-slate-800 border-y-2 rounded-lg overflow-hidden" style={{ borderColor: `${brandColor}15` }}>
        <div className={cn(
          "flex items-center justify-between",
          device === 'mobile' ? 'flex-col divide-y' : 'flex-row divide-x',
        )} style={{ '--tw-divide-opacity': '1', borderColor: `${brandColor}15` } as React.CSSProperties}>
          {items.slice(0, 4).map((item) => (
            <div key={item.id} className="flex-1 w-full p-5 md:p-6 lg:p-8 flex flex-col items-center text-center">
              <div 
                className="mb-3 md:mb-4 p-3 rounded-full"
                style={{ 
                  backgroundColor: `${brandColor}15`, 
                  color: brandColor,
                  boxShadow: `0 0 0 4px ${brandColor}08`
                }}
              >
                <Check size={22} md-size={24} strokeWidth={3} />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-1.5 md:mb-2 text-sm md:text-base">{item.title || 'Tiêu đề'}</h3>
              <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{item.description || 'Mô tả lợi ích...'}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <PreviewWrapper title="Preview Lợi ích" device={device} setDevice={setDevice} previewStyle={previewStyle} setPreviewStyle={setPreviewStyle} styles={styles} info={`${items.length} lợi ích`}>
      <BrowserFrame url="yoursite.com/why-us">
        {previewStyle === 'cards' && renderCardsStyle()}
        {previewStyle === 'list' && renderListStyle()}
        {previewStyle === 'bento' && renderBentoStyle()}
        {previewStyle === 'row' && renderRowStyle()}
      </BrowserFrame>
    </PreviewWrapper>
  );
};

// ============ CASE STUDY / PROJECTS PREVIEW ============
type ProjectItem = { id: number; title: string; category: string; image: string; description: string; link: string };
export type CaseStudyStyle = 'grid' | 'featured' | 'list';
export const CaseStudyPreview = ({ projects, brandColor, selectedStyle, onStyleChange }: { projects: ProjectItem[]; brandColor: string; selectedStyle?: CaseStudyStyle; onStyleChange?: (style: CaseStudyStyle) => void }) => {
  const [device, setDevice] = useState<PreviewDevice>('desktop');
  const previewStyle = selectedStyle || 'grid';
  const setPreviewStyle = (s: string) => onStyleChange?.(s as CaseStudyStyle);
  const styles = [{ id: 'grid', label: 'Grid' }, { id: 'featured', label: 'Featured' }, { id: 'list', label: 'List' }];

  const renderGridStyle = () => (
    <div className={cn("py-8 px-4", device === 'mobile' ? 'py-6' : '')}>
      <h3 className={cn("font-bold text-center mb-6", device === 'mobile' ? 'text-lg' : 'text-xl')}>Dự án tiêu biểu</h3>
      <div className={cn("grid gap-4", device === 'mobile' ? 'grid-cols-1' : device === 'tablet' ? 'grid-cols-2' : 'grid-cols-3')}>
        {projects.slice(0, 3).map((project) => (
          <div key={project.id} className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden border group">
            <div className="aspect-video bg-slate-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden">
              {project.image ? <img src={project.image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" /> : <ImageIcon size={32} className="text-slate-300" />}
            </div>
            <div className="p-4">
              <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: `${brandColor}15`, color: brandColor }}>{project.category || 'Category'}</span>
              <h4 className="font-semibold mt-2 mb-1">{project.title || 'Tên dự án'}</h4>
              <p className="text-xs text-slate-500 line-clamp-2">{project.description || 'Mô tả dự án...'}</p>
              <button className="text-sm mt-3" style={{ color: brandColor }}>Xem chi tiết →</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderFeaturedStyle = () => (
    <div className={cn("py-8 px-4", device === 'mobile' ? 'py-6' : '')}>
      <h3 className={cn("font-bold text-center mb-6", device === 'mobile' ? 'text-lg' : 'text-xl')}>Dự án nổi bật</h3>
      <div className={cn("grid gap-4", device === 'mobile' ? 'grid-cols-1' : 'grid-cols-2')}>
        <div className={cn("bg-white dark:bg-slate-800 rounded-xl overflow-hidden border group", device === 'mobile' ? '' : 'row-span-2')}>
          <div className="aspect-video bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
            {projects[0]?.image ? <img src={projects[0].image} alt="" className="w-full h-full object-cover" /> : <ImageIcon size={48} className="text-slate-300" />}
          </div>
          <div className="p-5">
            <span className="text-xs font-medium" style={{ color: brandColor }}>{projects[0]?.category || 'Category'}</span>
            <h3 className={cn("font-bold mt-1 mb-2", device === 'mobile' ? 'text-lg' : 'text-xl')}>{projects[0]?.title || 'Dự án chính'}</h3>
            <p className="text-sm text-slate-500">{projects[0]?.description || 'Mô tả dự án...'}</p>
          </div>
        </div>
        {projects.slice(1, 3).map((project) => (
          <div key={project.id} className="bg-white dark:bg-slate-800 rounded-xl p-4 border flex items-center gap-4">
            <div className="w-20 h-20 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0 overflow-hidden">
              {project.image ? <img src={project.image} alt="" className="w-full h-full object-cover" /> : <ImageIcon size={24} className="text-slate-300" />}
            </div>
            <div>
              <span className="text-xs font-medium" style={{ color: brandColor }}>{project.category || 'Category'}</span>
              <h4 className="font-semibold text-sm mt-1">{project.title || 'Tên dự án'}</h4>
              <p className="text-xs text-slate-500 mt-1 line-clamp-1">{project.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderListStyle = () => (
    <div className={cn("py-8 px-4", device === 'mobile' ? 'py-6' : '')}>
      <h3 className={cn("font-bold text-center mb-6", device === 'mobile' ? 'text-lg' : 'text-xl')}>Danh sách dự án</h3>
      <div className="max-w-6xl mx-auto space-y-4">
        {projects.slice(0, 4).map((project) => (
          <div key={project.id} className={cn("bg-white dark:bg-slate-800 rounded-xl overflow-hidden border flex", device === 'mobile' ? 'flex-col' : 'items-center')}>
            <div className={cn("bg-slate-100 dark:bg-slate-700 flex items-center justify-center", device === 'mobile' ? 'aspect-video w-full' : 'w-40 h-24 flex-shrink-0')}>
              {project.image ? <img src={project.image} alt="" className="w-full h-full object-cover" /> : <ImageIcon size={24} className="text-slate-300" />}
            </div>
            <div className="p-4 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: `${brandColor}15`, color: brandColor }}>{project.category || 'Category'}</span>
              </div>
              <h4 className="font-semibold">{project.title || 'Tên dự án'}</h4>
              <p className="text-xs text-slate-500 mt-1">{project.description || 'Mô tả...'}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <PreviewWrapper title="Preview Projects" device={device} setDevice={setDevice} previewStyle={previewStyle} setPreviewStyle={setPreviewStyle} styles={styles} info={`${projects.length} dự án`}>
      <BrowserFrame url="yoursite.com/projects">
        {previewStyle === 'grid' && renderGridStyle()}
        {previewStyle === 'featured' && renderFeaturedStyle()}
        {previewStyle === 'list' && renderListStyle()}
      </BrowserFrame>
    </PreviewWrapper>
  );
};

// ============ CAREER PREVIEW ============
type JobPosition = { id: number; title: string; department: string; location: string; type: string; salary: string; description: string };
export type CareerStyle = 'cards' | 'list' | 'minimal';
export const CareerPreview = ({ jobs, brandColor, selectedStyle, onStyleChange }: { jobs: JobPosition[]; brandColor: string; selectedStyle?: CareerStyle; onStyleChange?: (style: CareerStyle) => void }) => {
  const [device, setDevice] = useState<PreviewDevice>('desktop');
  const previewStyle = selectedStyle || 'cards';
  const setPreviewStyle = (s: string) => onStyleChange?.(s as CareerStyle);
  const styles = [{ id: 'cards', label: 'Cards' }, { id: 'list', label: 'List' }, { id: 'minimal', label: 'Minimal' }];

  const renderCardsStyle = () => (
    <div className={cn("py-8 px-4", device === 'mobile' ? 'py-6' : '')}>
      <div className="text-center mb-6">
        <h3 className={cn("font-bold", device === 'mobile' ? 'text-lg' : 'text-xl')}>Cơ hội nghề nghiệp</h3>
        <p className="text-sm text-slate-500 mt-1">Tham gia đội ngũ của chúng tôi</p>
      </div>
      <div className={cn("grid gap-4", device === 'mobile' ? 'grid-cols-1' : device === 'tablet' ? 'grid-cols-2' : 'grid-cols-3')}>
        {jobs.slice(0, 3).map((job) => (
          <div key={job.id} className="bg-white dark:bg-slate-800 rounded-xl p-5 border hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <span className="text-xs font-medium px-2 py-1 rounded" style={{ backgroundColor: `${brandColor}15`, color: brandColor }}>{job.department || 'Department'}</span>
              <span className="text-xs text-slate-500">{job.type || 'Full-time'}</span>
            </div>
            <h4 className="font-semibold mb-2">{job.title || 'Vị trí tuyển dụng'}</h4>
            <div className="space-y-1 text-xs text-slate-500 mb-3">
              <div className="flex items-center gap-1"><MapPin size={12} /> {job.location || 'Hà Nội'}</div>
              {job.salary && <div className="flex items-center gap-1"><Tag size={12} /> {job.salary}</div>}
            </div>
            <button className="w-full py-2 rounded-lg text-sm font-medium text-white" style={{ backgroundColor: brandColor }}>Ứng tuyển ngay</button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderListStyle = () => (
    <div className={cn("py-8 px-4", device === 'mobile' ? 'py-6' : '')}>
      <div className="text-center mb-6">
        <h3 className={cn("font-bold", device === 'mobile' ? 'text-lg' : 'text-xl')}>Vị trí đang tuyển</h3>
      </div>
      <div className="max-w-4xl mx-auto space-y-3">
        {jobs.slice(0, 4).map((job) => (
          <div key={job.id} className={cn("bg-white dark:bg-slate-800 rounded-xl p-4 border flex items-center justify-between", device === 'mobile' ? 'flex-col gap-3 text-center' : '')}>
            <div>
              <h4 className="font-semibold">{job.title || 'Vị trí'}</h4>
              <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                <span>{job.department || 'Department'}</span>
                <span>•</span>
                <span>{job.location || 'Location'}</span>
                <span>•</span>
                <span>{job.type || 'Full-time'}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {job.salary && <span className="text-sm font-medium" style={{ color: brandColor }}>{job.salary}</span>}
              <button className="px-4 py-2 rounded-lg text-sm text-white" style={{ backgroundColor: brandColor }}>Ứng tuyển</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderMinimalStyle = () => (
    <div className={cn("py-10 px-6", device === 'mobile' ? 'py-6 px-4' : '')} style={{ backgroundColor: `${brandColor}05` }}>
      <div className={cn("max-w-4xl mx-auto", device === 'mobile' ? '' : 'flex gap-8')}>
        <div className={cn(device === 'mobile' ? 'text-center mb-6' : 'w-1/3')}>
          <p className="text-sm font-medium mb-2" style={{ color: brandColor }}>TUYỂN DỤNG</p>
          <h3 className={cn("font-bold mb-2", device === 'mobile' ? 'text-lg' : 'text-xl')}>Gia nhập đội ngũ</h3>
          <p className="text-sm text-slate-500">Chúng tôi đang tìm kiếm những tài năng mới</p>
        </div>
        <div className="flex-1 space-y-3">
          {jobs.slice(0, 3).map((job) => (
            <div key={job.id} className="bg-white dark:bg-slate-800 rounded-xl p-4 border flex items-center justify-between">
              <div>
                <h4 className="font-medium">{job.title || 'Vị trí'}</h4>
                <span className="text-xs text-slate-500">{job.location} • {job.type}</span>
              </div>
              <button className="text-sm" style={{ color: brandColor }}>Chi tiết →</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <PreviewWrapper title="Preview Careers" device={device} setDevice={setDevice} previewStyle={previewStyle} setPreviewStyle={setPreviewStyle} styles={styles} info={`${jobs.length} vị trí`}>
      <BrowserFrame url="yoursite.com/careers">
        {previewStyle === 'cards' && renderCardsStyle()}
        {previewStyle === 'list' && renderListStyle()}
        {previewStyle === 'minimal' && renderMinimalStyle()}
      </BrowserFrame>
    </PreviewWrapper>
  );
};

// ============ CONTACT PREVIEW ============
type ContactConfig = {
  showMap: boolean;
  mapEmbed: string;
  address: string;
  phone: string;
  email: string;
  workingHours: string;
  formFields: string[];
  socialLinks: Array<{ id: number; platform: string; url: string }>;
};
export type ContactStyle = 'split' | 'centered' | 'cards';
export const ContactPreview = ({ config, brandColor, selectedStyle, onStyleChange }: { config: ContactConfig; brandColor: string; selectedStyle?: ContactStyle; onStyleChange?: (style: ContactStyle) => void }) => {
  const [device, setDevice] = useState<PreviewDevice>('desktop');
  const previewStyle = selectedStyle || 'split';
  const setPreviewStyle = (s: string) => onStyleChange?.(s as ContactStyle);
  const styles = [{ id: 'split', label: 'Split' }, { id: 'centered', label: 'Centered' }, { id: 'cards', label: 'Cards' }];

  const renderSplitStyle = () => (
    <div className={cn("py-8 px-4", device === 'mobile' ? 'py-6' : '')}>
      <h3 className={cn("font-bold text-center mb-6", device === 'mobile' ? 'text-lg' : 'text-xl')}>Liên hệ với chúng tôi</h3>
      <div className={cn("grid gap-8 max-w-6xl mx-auto", device === 'mobile' ? 'grid-cols-1' : 'grid-cols-2')}>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${brandColor}15` }}>
              <MapPin size={18} style={{ color: brandColor }} />
            </div>
            <div>
              <h4 className="font-medium text-sm">Địa chỉ</h4>
              <p className="text-sm text-slate-500">{config.address || '123 Nguyễn Huệ, Q1, TP.HCM'}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${brandColor}15` }}>
              <Phone size={18} style={{ color: brandColor }} />
            </div>
            <div>
              <h4 className="font-medium text-sm">Điện thoại</h4>
              <p className="text-sm text-slate-500">{config.phone || '1900 1234'}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${brandColor}15` }}>
              <Mail size={18} style={{ color: brandColor }} />
            </div>
            <div>
              <h4 className="font-medium text-sm">Email</h4>
              <p className="text-sm text-slate-500">{config.email || 'contact@example.com'}</p>
            </div>
          </div>
        </div>
        {config.showMap && (
          <div className="aspect-video bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden border">
            <div className="w-full h-full flex items-center justify-center text-slate-400">
              <Globe size={32} />
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderCenteredStyle = () => (
    <div className={cn("py-10 px-4", device === 'mobile' ? 'py-6' : '')}>
      <div className="text-center mb-8">
        <h3 className={cn("font-bold", device === 'mobile' ? 'text-lg' : 'text-2xl')}>Liên hệ</h3>
        <p className="text-sm text-slate-500 mt-2">Chúng tôi luôn sẵn sàng hỗ trợ bạn</p>
      </div>
      <div className={cn("max-w-3xl mx-auto bg-white dark:bg-slate-800 rounded-2xl p-6 border shadow-sm")}>
        <div className={cn("grid gap-6", device === 'mobile' ? 'grid-cols-1' : 'grid-cols-3')}>
          <div className="text-center">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: `${brandColor}15` }}>
              <MapPin size={20} style={{ color: brandColor }} />
            </div>
            <h4 className="font-medium text-sm mb-1">Địa chỉ</h4>
            <p className="text-xs text-slate-500">{config.address || '123 Nguyễn Huệ, Q1'}</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: `${brandColor}15` }}>
              <Phone size={20} style={{ color: brandColor }} />
            </div>
            <h4 className="font-medium text-sm mb-1">Điện thoại</h4>
            <p className="text-xs text-slate-500">{config.phone || '1900 1234'}</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: `${brandColor}15` }}>
              <Mail size={20} style={{ color: brandColor }} />
            </div>
            <h4 className="font-medium text-sm mb-1">Email</h4>
            <p className="text-xs text-slate-500">{config.email || 'contact@example.com'}</p>
          </div>
        </div>
        {config.showMap && (
          <div className="mt-6 aspect-video bg-slate-100 dark:bg-slate-700 rounded-xl overflow-hidden">
            <div className="w-full h-full flex items-center justify-center text-slate-400">
              <Globe size={32} />
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderCardsStyle = () => (
    <div className={cn("py-8 px-4", device === 'mobile' ? 'py-6' : '')}>
      <h3 className={cn("font-bold text-center mb-6", device === 'mobile' ? 'text-lg' : 'text-xl')}>Thông tin liên hệ</h3>
      <div className={cn("grid gap-4 max-w-6xl mx-auto", device === 'mobile' ? 'grid-cols-1' : 'grid-cols-3')}>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border text-center">
          <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: `${brandColor}15` }}>
            <MapPin size={20} style={{ color: brandColor }} />
          </div>
          <h4 className="font-medium mb-1">Địa chỉ</h4>
          <p className="text-sm text-slate-500">{config.address || '123 Nguyễn Huệ, Q1'}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border text-center">
          <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: `${brandColor}15` }}>
            <Phone size={20} style={{ color: brandColor }} />
          </div>
          <h4 className="font-medium mb-1">Điện thoại</h4>
          <p className="text-sm text-slate-500">{config.phone || '1900 1234'}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border text-center">
          <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: `${brandColor}15` }}>
            <Mail size={20} style={{ color: brandColor }} />
          </div>
          <h4 className="font-medium mb-1">Email</h4>
          <p className="text-sm text-slate-500">{config.email || 'contact@example.com'}</p>
        </div>
      </div>
      {config.showMap && (
        <div className="max-w-6xl mx-auto mt-6 aspect-[21/9] bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden border">
          <div className="w-full h-full flex items-center justify-center text-slate-400">
            <Globe size={48} />
          </div>
        </div>
      )}
    </div>
  );

  return (
    <PreviewWrapper title="Preview Contact" device={device} setDevice={setDevice} previewStyle={previewStyle} setPreviewStyle={setPreviewStyle} styles={styles}>
      <BrowserFrame url="yoursite.com/contact">
        {previewStyle === 'split' && renderSplitStyle()}
        {previewStyle === 'centered' && renderCenteredStyle()}
        {previewStyle === 'cards' && renderCardsStyle()}
      </BrowserFrame>
    </PreviewWrapper>
  );
};
