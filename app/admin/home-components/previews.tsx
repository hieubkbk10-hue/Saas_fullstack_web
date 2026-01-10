'use client';

import React, { useState } from 'react';
import { 
  Monitor, Tablet, Smartphone, Eye, ChevronLeft, ChevronRight, 
  Image as ImageIcon, Star, Check, ExternalLink, Globe, Mail, 
  Phone, Package, FileText, Users, MapPin, Tag
} from 'lucide-react';
import { cn, Card, CardHeader, CardTitle, CardContent } from '../components/ui';

type PreviewDevice = 'desktop' | 'tablet' | 'mobile';

const deviceWidths = {
  desktop: 'w-full',
  tablet: 'w-[768px] max-w-full',
  mobile: 'w-[375px] max-w-full'
};

const devices = [
  { id: 'desktop' as const, icon: Monitor, label: 'Desktop' },
  { id: 'tablet' as const, icon: Tablet, label: 'Tablet' },
  { id: 'mobile' as const, icon: Smartphone, label: 'Mobile' }
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
          {' • '}{device === 'desktop' && '1920px'}{device === 'tablet' && '768px'}{device === 'mobile' && '375px'}
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
                <button type="button" onClick={prevSlide} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white shadow-lg flex items-center justify-center transition-all z-20" style={{ opacity: 0.7 }}>
                  <ChevronLeft size={14} />
                </button>
                <button type="button" onClick={nextSlide} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white shadow-lg flex items-center justify-center transition-all z-20" style={{ opacity: 0.7 }}>
                  <ChevronRight size={14} />
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
                    className={cn("rounded overflow-hidden transition-all border-2", idx === currentSlide ? "border-white scale-105" : "border-transparent opacity-70 hover:opacity-100", device === 'mobile' ? 'w-10 h-7' : 'w-14 h-9')}>
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
              <div className="col-span-2 row-span-2 relative rounded-xl overflow-hidden">
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
            {/* Fake header */}
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
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
          {' • '}{device === 'desktop' && 'Desktop (1920px)'}{device === 'tablet' && 'Tablet (768px)'}{device === 'mobile' && 'Mobile (375px)'}
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
      <div className="space-y-2 max-w-2xl mx-auto">
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
        <div className="max-w-3xl mx-auto relative">
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
      <div className={cn("max-w-3xl mx-auto", device === 'mobile' ? '' : 'border rounded-2xl overflow-hidden')}>
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

// ============ GALLERY PREVIEW ============
type GalleryItem = { id: number; url: string; link: string };
export type GalleryStyle = 'slider' | 'grid' | 'marquee';
export const GalleryPreview = ({ items, brandColor, componentType, selectedStyle, onStyleChange }: { items: GalleryItem[]; brandColor: string; componentType: 'Partners' | 'Gallery' | 'TrustBadges'; selectedStyle?: GalleryStyle; onStyleChange?: (style: GalleryStyle) => void }) => {
  const [device, setDevice] = useState<PreviewDevice>('desktop');
  const previewStyle = selectedStyle || 'slider';
  const setPreviewStyle = (s: string) => onStyleChange?.(s as GalleryStyle);
  const styles = [{ id: 'slider', label: 'Slider' }, { id: 'grid', label: 'Grid' }, { id: 'marquee', label: 'Split' }];
  const titles = { Partners: 'Đối tác tin cậy', Gallery: 'Thư viện ảnh', TrustBadges: 'Chứng nhận & Giải thưởng' };

  const renderSliderStyle = () => (
    <div className={cn("py-8 px-4", device === 'mobile' ? 'py-6' : '')}>
      <h3 className={cn("font-bold text-center mb-6", device === 'mobile' ? 'text-lg' : 'text-xl')}>{titles[componentType]}</h3>
      <div className="relative">
        <div className={cn("flex gap-4 overflow-hidden", device === 'mobile' ? 'gap-3' : '')}>
          {items.slice(0, device === 'mobile' ? 3 : 6).map((item) => (
            <div key={item.id} className={cn("flex-shrink-0 bg-white dark:bg-slate-800 rounded-lg border flex items-center justify-center", componentType === 'Gallery' ? 'aspect-square' : 'aspect-[3/1]', device === 'mobile' ? 'w-24 h-16' : 'w-32 h-20')}>
              {item.url ? <img src={item.url} alt="" className="w-full h-full object-cover rounded-lg" /> : <ImageIcon size={24} className="text-slate-300" />}
            </div>
          ))}
        </div>
        <button className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-8 bg-white shadow rounded-full flex items-center justify-center"><ChevronLeft size={16} /></button>
        <button className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 bg-white shadow rounded-full flex items-center justify-center"><ChevronRight size={16} /></button>
      </div>
    </div>
  );

  const renderGridStyle = () => (
    <div className={cn("py-8 px-4", device === 'mobile' ? 'py-6' : '')}>
      <h3 className={cn("font-bold text-center mb-6", device === 'mobile' ? 'text-lg' : 'text-xl')}>{titles[componentType]}</h3>
      <div className={cn("grid gap-4", device === 'mobile' ? 'grid-cols-3 gap-2' : 'grid-cols-6')}>
        {items.slice(0, 6).map((item) => (
          <div key={item.id} className={cn("bg-white dark:bg-slate-800 rounded-lg border flex items-center justify-center p-2 group hover:border-slate-300", componentType === 'Gallery' ? 'aspect-square' : 'aspect-[3/2]')}>
            {item.url ? <img src={item.url} alt="" className="w-full h-full object-cover rounded" /> : <ImageIcon size={20} className="text-slate-300" />}
          </div>
        ))}
      </div>
    </div>
  );

  const renderSplitStyle = () => (
    <div className={cn("py-10 px-6", device === 'mobile' ? 'py-6 px-4' : '')} style={{ backgroundColor: `${brandColor}03` }}>
      <div className={cn("flex gap-8", device === 'mobile' ? 'flex-col' : 'items-center')}>
        <div className={cn("flex-shrink-0", device === 'mobile' ? 'text-center' : 'w-1/3')}>
          <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: brandColor }}>{componentType === 'Partners' ? 'Đối tác' : componentType === 'TrustBadges' ? 'Chứng nhận' : 'Bộ sưu tập'}</p>
          <h3 className={cn("font-bold mb-3", device === 'mobile' ? 'text-lg' : 'text-xl')}>{titles[componentType]}</h3>
          <p className="text-sm text-slate-500">Được tin tưởng bởi các thương hiệu hàng đầu</p>
        </div>
        <div className={cn("flex-1 grid gap-4", device === 'mobile' ? 'grid-cols-3' : 'grid-cols-3')}>
          {items.slice(0, 6).map((item) => (
            <div key={item.id} className={cn("bg-white dark:bg-slate-800 rounded-xl border flex items-center justify-center overflow-hidden group", componentType === 'Gallery' ? 'aspect-square' : 'aspect-[3/2] p-3')}>
              {item.url ? <img src={item.url} alt="" className={cn("transition-all duration-300", componentType === 'Gallery' ? 'w-full h-full object-cover' : 'max-h-full max-w-full object-contain grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100')} /> : <ImageIcon size={22} className="text-slate-300" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <PreviewWrapper title={`Preview ${componentType}`} device={device} setDevice={setDevice} previewStyle={previewStyle} setPreviewStyle={setPreviewStyle} styles={styles} info={`${items.length} ảnh`}>
      <BrowserFrame>
        {previewStyle === 'slider' && renderSliderStyle()}
        {previewStyle === 'grid' && renderGridStyle()}
        {previewStyle === 'marquee' && renderSplitStyle()}
      </BrowserFrame>
    </PreviewWrapper>
  );
};

// ============ SERVICES/BENEFITS PREVIEW ============
type ServiceItem = { id: number; icon: string; title: string; description: string };
export type ServicesStyle = 'grid' | 'list' | 'icons';
export const ServicesPreview = ({ items, brandColor, componentType, selectedStyle, onStyleChange }: { items: ServiceItem[]; brandColor: string; componentType: 'Services' | 'Benefits'; selectedStyle?: ServicesStyle; onStyleChange?: (style: ServicesStyle) => void }) => {
  const [device, setDevice] = useState<PreviewDevice>('desktop');
  const previewStyle = selectedStyle || 'grid';
  const setPreviewStyle = (s: string) => onStyleChange?.(s as ServicesStyle);
  const styles = [{ id: 'grid', label: 'Grid' }, { id: 'list', label: 'List' }, { id: 'icons', label: 'Icon Center' }];
  const titles = { Services: 'Dịch vụ của chúng tôi', Benefits: 'Tại sao chọn chúng tôi' };

  const renderGridStyle = () => (
    <div className={cn("py-8 px-4", device === 'mobile' ? 'py-6' : '')}>
      <h3 className={cn("font-bold text-center mb-6", device === 'mobile' ? 'text-lg' : 'text-xl')}>{titles[componentType]}</h3>
      <div className={cn("grid gap-4", device === 'mobile' ? 'grid-cols-1' : device === 'tablet' ? 'grid-cols-2' : 'grid-cols-3')}>
        {items.slice(0, device === 'mobile' ? 3 : 6).map((item) => (
          <div key={item.id} className="bg-white dark:bg-slate-800 rounded-xl p-5 border hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: `${brandColor}15` }}><Star size={24} style={{ color: brandColor }} /></div>
            <h4 className="font-semibold mb-2">{item.title || 'Tiêu đề'}</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{item.description || 'Mô tả dịch vụ...'}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderListStyle = () => (
    <div className={cn("py-8 px-4", device === 'mobile' ? 'py-6' : '')}>
      <h3 className={cn("font-bold text-center mb-6", device === 'mobile' ? 'text-lg' : 'text-xl')}>{titles[componentType]}</h3>
      <div className="max-w-2xl mx-auto space-y-4">
        {items.slice(0, 4).map((item, idx) => (
          <div key={item.id} className="flex gap-4 items-start p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold" style={{ backgroundColor: brandColor }}>{idx + 1}</div>
            <div>
              <h4 className="font-semibold mb-1">{item.title || 'Tiêu đề'}</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400">{item.description || 'Mô tả...'}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderIconsStyle = () => (
    <div className={cn("py-10 px-4", device === 'mobile' ? 'py-6' : '')} style={{ backgroundColor: `${brandColor}05` }}>
      <h3 className={cn("font-bold text-center mb-8", device === 'mobile' ? 'text-lg' : 'text-xl')}>{titles[componentType]}</h3>
      <div className={cn("grid gap-8", device === 'mobile' ? 'grid-cols-2 gap-4' : 'grid-cols-4')}>
        {items.slice(0, 4).map((item) => (
          <div key={item.id} className="text-center">
            <div className={cn("rounded-full flex items-center justify-center mx-auto mb-3", device === 'mobile' ? 'w-12 h-12' : 'w-16 h-16')} style={{ backgroundColor: brandColor }}><Star size={device === 'mobile' ? 20 : 28} className="text-white" /></div>
            <h4 className={cn("font-semibold mb-1", device === 'mobile' ? 'text-sm' : '')}>{item.title || 'Tiêu đề'}</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{item.description || 'Mô tả...'}</p>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <PreviewWrapper title={`Preview ${componentType}`} device={device} setDevice={setDevice} previewStyle={previewStyle} setPreviewStyle={setPreviewStyle} styles={styles} info={`${items.length} mục`}>
      <BrowserFrame>
        {previewStyle === 'grid' && renderGridStyle()}
        {previewStyle === 'list' && renderListStyle()}
        {previewStyle === 'icons' && renderIconsStyle()}
      </BrowserFrame>
    </PreviewWrapper>
  );
};

// ============ PRODUCT/SERVICE LIST PREVIEW ============
// Professional Product Showcase UI/UX - 3 Variants from elegant-product-showcase
export type ProductListStyle = 'grid' | 'list' | 'carousel';
export interface ProductListPreviewItem {
  id: string | number;
  name: string;
  image?: string;
  price?: string;
  originalPrice?: string;
  description?: string;
  tag?: 'new' | 'hot' | 'sale';
}

// Helper to strip HTML tags from description
const stripHtml = (html?: string) => {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '').trim();
};

// Badge component for product tags
const ProductBadge = ({ tag, discount }: { tag?: 'new' | 'hot' | 'sale'; discount?: string }) => {
  if (!tag && !discount) return null;
  return (
    <div className="absolute top-2 left-2 z-10 flex flex-col gap-1.5">
      {tag === 'new' && (
        <span className="px-1.5 py-0.5 text-[10px] font-medium bg-blue-500 text-white rounded">Mới</span>
      )}
      {tag === 'hot' && (
        <span className="px-1.5 py-0.5 text-[10px] font-medium bg-orange-500 text-white rounded">Hot</span>
      )}
      {discount && (
        <span className="px-1.5 py-0.5 text-[10px] font-medium bg-red-500 text-white rounded">{discount}</span>
      )}
    </div>
  );
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
  const previewStyle = selectedStyle || 'grid';
  const setPreviewStyle = (s: string) => onStyleChange?.(s as ProductListStyle);
  const styles = [{ id: 'grid', label: 'Grid' }, { id: 'list', label: 'List' }, { id: 'carousel', label: 'Carousel' }];
  const isProduct = componentType === 'ProductList';
  const title = isProduct ? 'Sản phẩm nổi bật' : 'Dịch vụ của chúng tôi';
  
  // Use real items if provided, otherwise fallback to mock
  const displayItems: ProductListPreviewItem[] = items && items.length > 0 
    ? items 
    : Array.from({ length: Math.max(itemCount, 4) }, (_, i) => ({ 
        id: i + 1, 
        name: isProduct ? `Tai nghe Bluetooth Pro ${i + 1}` : `Dịch vụ ${i + 1}`, 
        price: isProduct ? `${(i + 1) * 250}.000đ` : '', 
        originalPrice: i % 2 === 0 ? `${(i + 1) * 320}.000đ` : undefined,
        description: 'Sản phẩm chất lượng cao, được tin dùng bởi hàng nghìn khách hàng.',
        tag: i === 0 ? 'hot' : i === 1 ? 'new' : i === 2 ? 'sale' : undefined
      }));
  const showViewAll = displayItems.length > 3;

  // Calculate discount percentage
  const getDiscount = (price?: string, originalPrice?: string) => {
    if (!price || !originalPrice) return null;
    const p = parseInt(price.replace(/\D/g, ''));
    const op = parseInt(originalPrice.replace(/\D/g, ''));
    if (op <= p) return null;
    return `-${Math.round(((op - p) / op) * 100)}%`;
  };

  // Style 1: Grid - Professional cards với hover effects
  const renderGridStyle = () => (
    <section className={cn("py-8 md:py-12", device === 'mobile' ? 'px-3' : 'px-4')}>
      <h2 className={cn("font-bold tracking-tight text-center mb-6 md:mb-8", device === 'mobile' ? 'text-xl' : 'text-2xl sm:text-3xl')}>{title}</h2>
      <div className={cn("grid gap-3 md:gap-6", device === 'mobile' ? 'grid-cols-2' : device === 'tablet' ? 'grid-cols-3' : 'grid-cols-4')}>
        {displayItems.slice(0, 4).map((item) => {
          const discount = getDiscount(item.price, item.originalPrice);
          return (
            <div 
              key={item.id} 
              className="group relative bg-white dark:bg-slate-800 rounded-xl overflow-hidden border border-slate-200/60 dark:border-slate-700 hover:border-opacity-30 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col h-full"
              style={{ '--hover-border': `${brandColor}30` } as React.CSSProperties}
            >
              <ProductBadge tag={item.tag} discount={discount || undefined} />
              
              {/* Image Container */}
              <div className="relative aspect-square overflow-hidden bg-slate-100/50 dark:bg-slate-700/50">
                {item.image ? (
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package size={32} className="text-slate-300" />
                  </div>
                )}
              </div>
              
              {/* Content */}
              <div className={cn("flex-1 flex flex-col", device === 'mobile' ? 'p-2.5' : 'p-3 md:p-4')}>
                <h4 className={cn(
                  "font-semibold text-slate-900 dark:text-slate-100 group-hover:text-opacity-80 transition-colors line-clamp-2 leading-tight",
                  device === 'mobile' ? 'text-sm' : 'text-sm md:text-base'
                )}>
                  {item.name}
                </h4>
                
                {/* Price */}
                <div className="flex items-center mt-1.5">
                  <span className={cn("font-bold", device === 'mobile' ? 'text-sm' : 'text-base md:text-lg')} style={{ color: brandColor }}>
                    {item.price || '0đ'}
                  </span>
                </div>
              </div>
              
              {/* Footer Action */}
              <div className={cn("", device === 'mobile' ? 'p-2.5 pt-0' : 'p-3 pt-0 md:p-4 md:pt-0')}>
                <button 
                  className={cn(
                    "w-full gap-1.5 font-medium shadow-none rounded-md transition-all duration-200",
                    device === 'mobile' ? 'h-8 text-xs' : 'h-8 md:h-9 text-xs md:text-sm',
                    "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:text-white"
                  )}
                  style={{ '--hover-bg': brandColor } as React.CSSProperties}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = brandColor; e.currentTarget.style.color = 'white'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = ''; e.currentTarget.style.color = ''; }}
                >
                  <span className="flex items-center justify-center gap-1.5">
                    <Package size={14} />
                    {isProduct ? 'Mua ngay' : 'Xem chi tiết'}
                  </span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* View All Button */}
      {showViewAll && (
        <div className="flex justify-center pt-6 md:pt-8">
          <button 
            className="group flex items-center gap-2 px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg font-medium text-sm hover:border-slate-300 transition-all"
          >
            Xem toàn bộ
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </button>
        </div>
      )}
    </section>
  );

  // Style 2: List - Horizontal cards với 2 columns
  const renderListStyle = () => (
    <section className={cn("py-8 md:py-12", device === 'mobile' ? 'px-3' : 'px-4')}>
      <h2 className={cn("font-bold tracking-tight text-center mb-6 md:mb-8", device === 'mobile' ? 'text-xl' : 'text-2xl sm:text-3xl')}>{title}</h2>
      <div className={cn("grid gap-3 md:gap-4", device === 'mobile' ? 'grid-cols-1' : 'grid-cols-2')}>
        {displayItems.slice(0, 4).map((item) => {
          const discount = getDiscount(item.price, item.originalPrice);
          return (
            <div 
              key={item.id} 
              className={cn(
                "group relative bg-white dark:bg-slate-800 rounded-xl overflow-hidden border border-slate-200/60 dark:border-slate-700 hover:border-opacity-30 hover:shadow-md transition-all duration-300 flex",
                device === 'mobile' ? 'h-28' : 'h-32 md:h-40'
              )}
            >
              {/* Badges */}
              <div className="absolute top-2 left-2 z-10 flex flex-row gap-1.5">
                {item.tag === 'new' && <span className="px-1.5 py-0.5 text-[10px] font-medium bg-blue-500 text-white rounded">Mới</span>}
                {item.tag === 'hot' && <span className="px-1.5 py-0.5 text-[10px] font-medium bg-orange-500 text-white rounded">Hot</span>}
                {discount && <span className="px-1.5 py-0.5 text-[10px] font-medium bg-red-500 text-white rounded">{discount}</span>}
              </div>
              
              {/* Image */}
              <div className={cn("relative overflow-hidden bg-slate-100/50 dark:bg-slate-700/50 flex-shrink-0", device === 'mobile' ? 'w-24' : 'w-28')}>
                {item.image ? (
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package size={24} className="text-slate-300" />
                  </div>
                )}
              </div>
              
              {/* Content */}
              <div className="flex flex-col flex-1 min-w-0 justify-between">
                <div className={cn("flex-1", device === 'mobile' ? 'p-2.5 pr-3' : 'p-3 pr-4')}>
                  <h4 className={cn(
                    "font-semibold text-slate-900 dark:text-slate-100 group-hover:text-opacity-80 transition-colors line-clamp-2",
                    device === 'mobile' ? 'text-sm' : 'text-sm md:text-base'
                  )}>
                    {item.name}
                  </h4>
                  <div className="flex items-center mt-1">
                    <span className={cn("font-bold", device === 'mobile' ? 'text-sm' : 'text-base')} style={{ color: brandColor }}>
                      {item.price || '0đ'}
                    </span>
                  </div>
                </div>
                
                {/* Action */}
                <div className={cn("", device === 'mobile' ? 'p-2.5 pt-0 flex justify-end' : 'p-3 pt-0 flex justify-end')}>
                  <button 
                    className="px-3 h-8 text-xs font-medium rounded-md text-white transition-all"
                    style={{ backgroundColor: brandColor }}
                  >
                    {isProduct ? 'Mua ngay' : 'Xem'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* View All */}
      {showViewAll && (
        <div className="flex justify-center pt-6 md:pt-8">
          <button className="group flex items-center gap-2 px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg font-medium text-sm hover:border-slate-300 transition-all">
            Xem toàn bộ
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </button>
        </div>
      )}
    </section>
  );

  // Style 3: Carousel - Drag to scroll với snap
  const renderCarouselStyle = () => (
    <section className={cn("py-8 md:py-12 relative group/carousel")}>
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6 md:mb-8 px-4">
        <h2 className={cn("font-bold tracking-tight", device === 'mobile' ? 'text-xl' : 'text-2xl sm:text-3xl')}>{title}</h2>
      </div>
      
      {/* Navigation Buttons (Desktop) */}
      {device === 'desktop' && (
        <>
          <button className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-white dark:bg-slate-800 shadow-md items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity -ml-2">
            <ChevronLeft size={20} />
          </button>
          <button className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-white dark:bg-slate-800 shadow-md items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity -mr-2">
            <ChevronRight size={20} />
          </button>
        </>
      )}
      
      {/* Carousel Container */}
      <div 
        className={cn(
          "flex overflow-x-auto gap-3 md:gap-6 pb-4 -mx-4 px-4 scrollbar-hide cursor-grab snap-x snap-mandatory"
        )}
      >
        {displayItems.slice(0, 5).map((item) => {
          const discount = getDiscount(item.price, item.originalPrice);
          return (
            <div 
              key={item.id} 
              className={cn(
                "flex-shrink-0 snap-center select-none",
                device === 'mobile' ? 'min-w-[180px]' : 'min-w-[200px] md:min-w-[280px]'
              )}
            >
              <div className="group relative bg-white dark:bg-slate-800 rounded-xl overflow-hidden border border-slate-200/60 dark:border-slate-700 hover:border-opacity-30 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col h-full">
                <ProductBadge tag={item.tag} discount={discount || undefined} />
                
                {/* Image */}
                <div className={cn(
                  "relative overflow-hidden bg-slate-100/50 dark:bg-slate-700/50",
                  device === 'mobile' ? 'aspect-square' : 'h-[200px] md:h-[280px]'
                )}>
                  {item.image ? (
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      draggable={false}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package size={32} className="text-slate-300" />
                    </div>
                  )}
                </div>
                
                {/* Content */}
                <div className="p-3 space-y-1.5">
                  <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100 line-clamp-2 leading-tight">
                    {item.name}
                  </h4>
                  <div className="flex items-center">
                    <span className="font-bold text-base" style={{ color: brandColor }}>
                      {item.price || '0đ'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* View All */}
      <div className="flex justify-center pt-6 md:pt-8">
        <button className="group flex items-center gap-2 px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg font-medium text-sm hover:border-slate-300 transition-all min-w-[160px] justify-center">
          Xem toàn bộ
          <span className="transition-transform group-hover:translate-x-1">→</span>
        </button>
      </div>
    </section>
  );

  return (
    <PreviewWrapper title={`Preview ${componentType}`} device={device} setDevice={setDevice} previewStyle={previewStyle} setPreviewStyle={setPreviewStyle} styles={styles}>
      <BrowserFrame url={`yoursite.com/${isProduct ? 'products' : 'services'}`}>
        {previewStyle === 'grid' && renderGridStyle()}
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
type FooterConfig = { logo: string; description: string; columns: Array<{ id: number; title: string; links: Array<{ label: string; url: string }> }>; copyright: string; showSocialLinks: boolean };
export type FooterStyle = 'columns' | 'centered' | 'minimal';
export const FooterPreview = ({ config, brandColor, selectedStyle, onStyleChange }: { config: FooterConfig; brandColor: string; selectedStyle?: FooterStyle; onStyleChange?: (style: FooterStyle) => void }) => {
  const [device, setDevice] = useState<PreviewDevice>('desktop');
  const previewStyle = selectedStyle || 'columns';
  const setPreviewStyle = (s: string) => onStyleChange?.(s as FooterStyle);
  const styles = [{ id: 'columns', label: 'Columns' }, { id: 'centered', label: 'Centered' }, { id: 'minimal', label: 'Minimal' }];

  const renderColumnsStyle = () => (
    <div className={cn("py-10 px-6", device === 'mobile' ? 'py-8 px-4' : '')} style={{ backgroundColor: '#1f2937' }}>
      <div className={cn("grid gap-8", device === 'mobile' ? 'grid-cols-1' : device === 'tablet' ? 'grid-cols-3' : 'grid-cols-4')}>
        <div className={device === 'mobile' ? 'text-center' : ''}>
          <div className="w-10 h-10 rounded-lg mb-4 mx-auto md:mx-0" style={{ backgroundColor: brandColor }}></div>
          <p className="text-sm text-slate-400">{config.description || 'Mô tả công ty...'}</p>
          {config.showSocialLinks && (
            <div className={cn("flex gap-2 mt-4", device === 'mobile' ? 'justify-center' : '')}>
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center"><Globe size={14} className="text-slate-400" /></div>
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center"><Mail size={14} className="text-slate-400" /></div>
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center"><Phone size={14} className="text-slate-400" /></div>
            </div>
          )}
        </div>
        {config.columns.slice(0, 2).map((col) => (
          <div key={col.id} className={device === 'mobile' ? 'text-center' : ''}>
            <h4 className="font-semibold text-white mb-3">{col.title || 'Tiêu đề'}</h4>
            <ul className="space-y-2">
              {(col.links.length > 0 ? col.links : [{ label: 'Link 1', url: '#' }, { label: 'Link 2', url: '#' }]).map((link, idx) => (<li key={idx}><a href="#" className="text-sm text-slate-400 hover:text-white">{link.label}</a></li>))}
            </ul>
          </div>
        ))}
        <div className={device === 'mobile' ? 'text-center' : ''}>
          <h4 className="font-semibold text-white mb-3">Liên hệ</h4>
          <ul className="space-y-2 text-sm text-slate-400">
            <li>Email: contact@example.com</li>
            <li>Hotline: 1900 1234</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-700 mt-8 pt-6 text-center text-xs text-slate-500">{config.copyright || '© 2024 Company. All rights reserved.'}</div>
    </div>
  );

  const renderCenteredStyle = () => (
    <div className={cn("py-10 px-6 text-center", device === 'mobile' ? 'py-8 px-4' : '')} style={{ backgroundColor: '#1f2937' }}>
      <div className="w-12 h-12 rounded-lg mx-auto mb-4" style={{ backgroundColor: brandColor }}></div>
      <p className="text-sm text-slate-400 max-w-md mx-auto mb-6">{config.description || 'Mô tả công ty...'}</p>
      <div className={cn("flex flex-wrap justify-center gap-6 mb-6", device === 'mobile' ? 'gap-4' : '')}>
        {config.columns.flatMap(col => col.links).slice(0, 5).map((link, idx) => (<a key={idx} href="#" className="text-sm text-slate-400 hover:text-white">{link.label || `Link ${idx + 1}`}</a>))}
      </div>
      {config.showSocialLinks && (
        <div className="flex justify-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center"><Globe size={16} className="text-slate-400" /></div>
          <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center"><Mail size={16} className="text-slate-400" /></div>
          <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center"><Phone size={16} className="text-slate-400" /></div>
        </div>
      )}
      <div className="text-xs text-slate-500">{config.copyright || '© 2024 Company. All rights reserved.'}</div>
    </div>
  );

  const renderMinimalStyle = () => (
    <div className={cn("py-6 px-6", device === 'mobile' ? 'py-4 px-4' : '')} style={{ backgroundColor: '#1f2937' }}>
      <div className={cn("flex items-center justify-between", device === 'mobile' ? 'flex-col gap-4 text-center' : '')}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: brandColor }}></div>
          <span className="text-white font-semibold">YourBrand</span>
        </div>
        <div className={cn("flex gap-6", device === 'mobile' ? 'flex-wrap justify-center gap-4' : '')}>
          {['Trang chủ', 'Dịch vụ', 'Liên hệ'].map((item, idx) => (<a key={idx} href="#" className="text-sm text-slate-400 hover:text-white">{item}</a>))}
        </div>
        <div className="text-xs text-slate-500">{config.copyright || '© 2024'}</div>
      </div>
    </div>
  );

  return (
    <PreviewWrapper title="Preview Footer" device={device} setDevice={setDevice} previewStyle={previewStyle} setPreviewStyle={setPreviewStyle} styles={styles}>
      <BrowserFrame>
        {previewStyle === 'columns' && renderColumnsStyle()}
        {previewStyle === 'centered' && renderCenteredStyle()}
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
type AboutConfig = {
  layout: string;
  subHeading: string;
  heading: string;
  description: string;
  image: string;
  stats: Array<{ id: number; value: string; label: string }>;
  buttonText: string;
  buttonLink: string;
};
export type AboutStyle = 'split' | 'center' | 'overlay';
export const AboutPreview = ({ config, brandColor, selectedStyle, onStyleChange }: { config: AboutConfig; brandColor: string; selectedStyle?: AboutStyle; onStyleChange?: (style: AboutStyle) => void }) => {
  const [device, setDevice] = useState<PreviewDevice>('desktop');
  const previewStyle = selectedStyle || 'split';
  const setPreviewStyle = (s: string) => onStyleChange?.(s as AboutStyle);
  const styles = [{ id: 'split', label: 'Split' }, { id: 'center', label: 'Cards' }, { id: 'overlay', label: 'Overlay' }];

  const renderSplitStyle = () => (
    <div className={cn("flex gap-8", device === 'mobile' ? 'flex-col p-4' : 'p-8')}>
      <div className={cn("flex-1", device === 'mobile' ? 'order-2' : '')}>
        {config.subHeading && <p className="text-sm font-medium mb-2" style={{ color: brandColor }}>{config.subHeading}</p>}
        <h2 className={cn("font-bold mb-4", device === 'mobile' ? 'text-xl' : 'text-2xl')}>{config.heading || 'Về chúng tôi'}</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-4">{config.description || 'Mô tả về công ty...'}</p>
        {config.stats.length > 0 && (
          <div className={cn("flex gap-6 mb-4", device === 'mobile' ? 'gap-4' : '')}>
            {config.stats.slice(0, 3).map((stat) => (
              <div key={stat.id}>
                <div className="font-bold text-xl" style={{ color: brandColor }}>{stat.value}</div>
                <div className="text-xs text-slate-500">{stat.label}</div>
              </div>
            ))}
          </div>
        )}
        {config.buttonText && <button className="px-5 py-2 rounded-lg text-white text-sm" style={{ backgroundColor: brandColor }}>{config.buttonText}</button>}
      </div>
      <div className={cn("flex-1", device === 'mobile' ? 'order-1' : '')}>
        <div className="aspect-video rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800">
          {config.image ? <img src={config.image} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><ImageIcon size={32} className="text-slate-300" /></div>}
        </div>
      </div>
    </div>
  );

  const renderCardsStyle = () => (
    <div className={cn("py-10 px-4", device === 'mobile' ? 'py-6' : '')} style={{ backgroundColor: `${brandColor}05` }}>
      <div className="max-w-4xl mx-auto">
        <div className={cn("text-center mb-8", device === 'mobile' ? 'mb-6' : '')}>
          {config.subHeading && <p className="text-sm font-medium mb-2" style={{ color: brandColor }}>{config.subHeading}</p>}
          <h2 className={cn("font-bold", device === 'mobile' ? 'text-xl' : 'text-2xl')}>{config.heading || 'Về chúng tôi'}</h2>
        </div>
        <div className={cn("grid gap-4", device === 'mobile' ? 'grid-cols-1' : 'grid-cols-3')}>
          <div className={cn("rounded-2xl overflow-hidden", device === 'mobile' ? 'aspect-video' : 'col-span-2 row-span-2')}>
            {config.image ? <img src={config.image} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: `${brandColor}15` }}><ImageIcon size={48} style={{ color: brandColor }} className="opacity-50" /></div>}
          </div>
          {config.stats.slice(0, 2).map((stat) => (
            <div key={stat.id} className={cn("bg-white dark:bg-slate-800 rounded-2xl p-5 flex flex-col justify-center", device === 'mobile' ? 'text-center' : '')} style={{ borderLeft: `4px solid ${brandColor}` }}>
              <div className={cn("font-bold mb-1", device === 'mobile' ? 'text-2xl' : 'text-3xl')} style={{ color: brandColor }}>{stat.value || '0'}</div>
              <div className="text-sm text-slate-500 dark:text-slate-400">{stat.label || 'Label'}</div>
            </div>
          ))}
        </div>
        <div className={cn("mt-6 text-center", device === 'mobile' ? 'mt-4' : '')}>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-4">{config.description || 'Mô tả về công ty...'}</p>
          {config.buttonText && <button className="px-6 py-2.5 rounded-full text-white font-medium" style={{ backgroundColor: brandColor }}>{config.buttonText}</button>}
        </div>
      </div>
    </div>
  );

  const renderOverlayStyle = () => (
    <div className="relative">
      <div className={cn("aspect-[21/9]", device === 'mobile' ? 'aspect-[4/3]' : '')}>
        {config.image ? <img src={config.image} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full" style={{ backgroundColor: `${brandColor}20` }}></div>}
        <div className="absolute inset-0 bg-black/50"></div>
      </div>
      <div className={cn("absolute inset-0 flex flex-col justify-center text-white", device === 'mobile' ? 'p-4 text-center' : 'p-12')}>
        {config.subHeading && <p className="text-sm font-medium mb-2 opacity-80">{config.subHeading}</p>}
        <h2 className={cn("font-bold mb-4", device === 'mobile' ? 'text-xl' : 'text-3xl')}>{config.heading || 'Về chúng tôi'}</h2>
        <p className={cn("text-sm opacity-80 mb-4", device === 'mobile' ? '' : 'max-w-lg')}>{config.description || 'Mô tả...'}</p>
        {config.buttonText && <div><button className="px-5 py-2 rounded-lg text-white border border-white/30 hover:bg-white/10 transition-colors text-sm">{config.buttonText}</button></div>}
      </div>
    </div>
  );

  return (
    <PreviewWrapper title="Preview About" device={device} setDevice={setDevice} previewStyle={previewStyle} setPreviewStyle={setPreviewStyle} styles={styles}>
      <BrowserFrame url="yoursite.com/about">
        {previewStyle === 'split' && renderSplitStyle()}
        {previewStyle === 'center' && renderCardsStyle()}
        {previewStyle === 'overlay' && renderOverlayStyle()}
      </BrowserFrame>
    </PreviewWrapper>
  );
};

// ============ BENEFITS PREVIEW (Why Choose Us) ============
type BenefitItem = { id: number; icon: string; title: string; description: string };
export type BenefitsStyle = 'timeline' | 'comparison' | 'highlights';
export const BenefitsPreview = ({ items, brandColor, selectedStyle, onStyleChange }: { items: BenefitItem[]; brandColor: string; selectedStyle?: BenefitsStyle; onStyleChange?: (style: BenefitsStyle) => void }) => {
  const [device, setDevice] = useState<PreviewDevice>('desktop');
  const previewStyle = selectedStyle || 'timeline';
  const setPreviewStyle = (s: string) => onStyleChange?.(s as BenefitsStyle);
  const styles = [{ id: 'timeline', label: 'Timeline' }, { id: 'comparison', label: 'Zigzag' }, { id: 'highlights', label: 'Checklist' }];

  const renderTimelineStyle = () => (
    <div className={cn("py-10 px-6", device === 'mobile' ? 'py-6 px-4' : '')}>
      <div className="text-center mb-8">
        <p className="text-sm font-medium mb-2" style={{ color: brandColor }}>TẠI SAO CHỌN CHÚNG TÔI</p>
        <h3 className={cn("font-bold", device === 'mobile' ? 'text-lg' : 'text-2xl')}>Hành trình cùng bạn</h3>
      </div>
      <div className="relative max-w-2xl mx-auto">
        <div className="absolute left-6 top-0 bottom-0 w-0.5" style={{ backgroundColor: `${brandColor}30` }}></div>
        <div className="space-y-6">
          {items.slice(0, 4).map((item, idx) => (
            <div key={item.id} className="relative flex gap-6 pl-2">
              <div className="relative z-10 flex-shrink-0">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: brandColor }}>{idx + 1}</div>
              </div>
              <div className="flex-1 bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                <h4 className="font-semibold mb-1">{item.title || `Bước ${idx + 1}`}</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400">{item.description || 'Mô tả lợi ích...'}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderZigzagStyle = () => (
    <div className={cn("py-10 px-6", device === 'mobile' ? 'py-6 px-4' : '')}>
      <div className="text-center mb-8">
        <p className="text-sm font-medium mb-2" style={{ color: brandColor }}>TẠI SAO CHỌN CHÚNG TÔI</p>
        <h3 className={cn("font-bold", device === 'mobile' ? 'text-lg' : 'text-2xl')}>Lợi ích khi hợp tác</h3>
      </div>
      <div className="max-w-3xl mx-auto space-y-6">
        {items.slice(0, 4).map((item, idx) => (
          <div key={item.id} className={cn("flex items-center gap-6", device === 'mobile' ? 'flex-col text-center' : idx % 2 === 1 ? 'flex-row-reverse' : '')}>
            <div className={cn("flex-shrink-0 rounded-2xl flex items-center justify-center", device === 'mobile' ? 'w-16 h-16' : 'w-24 h-24')} style={{ backgroundColor: `${brandColor}15` }}>
              <Star size={device === 'mobile' ? 28 : 40} style={{ color: brandColor }} />
            </div>
            <div className={cn("flex-1", device !== 'mobile' && idx % 2 === 1 ? 'text-right' : '')}>
              <h4 className="font-semibold text-lg mb-2">{item.title || `Lợi ích ${idx + 1}`}</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400">{item.description || 'Mô tả chi tiết lợi ích...'}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderChecklistStyle = () => (
    <div className={cn("py-10 px-6", device === 'mobile' ? 'py-6 px-4' : '')}>
      <div className={cn("max-w-4xl mx-auto rounded-2xl overflow-hidden", device === 'mobile' ? '' : 'flex')}>
        <div className={cn("p-6 text-white", device === 'mobile' ? 'text-center' : 'w-2/5')} style={{ backgroundColor: brandColor }}>
          <p className="text-sm opacity-80 mb-2">TẠI SAO CHỌN</p>
          <h3 className={cn("font-bold mb-4", device === 'mobile' ? 'text-xl' : 'text-2xl')}>Chúng tôi?</h3>
          <p className="text-sm opacity-80">Những lý do khiến bạn tin tưởng lựa chọn dịch vụ của chúng tôi</p>
        </div>
        <div className={cn("bg-white dark:bg-slate-800 p-6", device === 'mobile' ? '' : 'flex-1')}>
          <ul className="space-y-4">
            {items.slice(0, 5).map((item, idx) => (
              <li key={item.id} className="flex items-start gap-3 group">
                <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" style={{ backgroundColor: `${brandColor}15` }}>
                  <Check size={14} style={{ color: brandColor }} />
                </div>
                <div>
                  <h4 className="font-medium">{item.title || `Lợi ích ${idx + 1}`}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{item.description || 'Mô tả...'}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );

  return (
    <PreviewWrapper title="Preview Lợi ích" device={device} setDevice={setDevice} previewStyle={previewStyle} setPreviewStyle={setPreviewStyle} styles={styles} info={`${items.length} lợi ích`}>
      <BrowserFrame url="yoursite.com/why-us">
        {previewStyle === 'timeline' && renderTimelineStyle()}
        {previewStyle === 'comparison' && renderZigzagStyle()}
        {previewStyle === 'highlights' && renderChecklistStyle()}
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
      <div className="max-w-3xl mx-auto space-y-4">
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
      <div className="max-w-3xl mx-auto space-y-3">
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
      <div className={cn("grid gap-8 max-w-4xl mx-auto", device === 'mobile' ? 'grid-cols-1' : 'grid-cols-2')}>
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
      <div className={cn("max-w-xl mx-auto bg-white dark:bg-slate-800 rounded-2xl p-6 border shadow-sm")}>
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
      <div className={cn("grid gap-4 max-w-4xl mx-auto", device === 'mobile' ? 'grid-cols-1' : 'grid-cols-3')}>
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
        <div className="max-w-4xl mx-auto mt-6 aspect-[21/9] bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden border">
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
