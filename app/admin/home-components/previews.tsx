'use client';

import React, { useState } from 'react';
import { 
  Monitor, Tablet, Smartphone, Eye, ChevronLeft, ChevronRight, ChevronDown,
  Image as ImageIcon, Star, Check, ExternalLink, Globe, Mail, HelpCircle,
  Phone, Package, FileText, Users, MapPin, Tag, ArrowUpRight, Briefcase, Plus, ArrowRight,
  X, ZoomIn, Maximize2, Building2, Clock, Zap, Shield, Target, Layers, Cpu, Rocket, Settings,
  Send, Facebook, MessageCircle, Instagram, Twitter, Linkedin, Youtube
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
// 6 Styles: slider, fade, bento, fullscreen, split, parallax
export type HeroStyle = 'slider' | 'fade' | 'bento' | 'fullscreen' | 'split' | 'parallax';

export interface HeroContent {
  badge?: string;
  heading?: string;
  description?: string;
  primaryButtonText?: string;
  secondaryButtonText?: string;
  countdownText?: string;
}

export const HeroBannerPreview = ({ 
  slides, 
  brandColor,
  selectedStyle = 'slider',
  onStyleChange,
  content
}: { 
  slides: Array<{ id: number; image: string; link: string }>; 
  brandColor: string;
  selectedStyle?: HeroStyle;
  onStyleChange?: (style: HeroStyle) => void;
  content?: HeroContent;
}) => {
  const [device, setDevice] = useState<PreviewDevice>('desktop');
  const [currentSlide, setCurrentSlide] = useState(0);

  const styles = [
    { id: 'slider' as const, label: 'Slider' },
    { id: 'fade' as const, label: 'Fade' },
    { id: 'bento' as const, label: 'Bento' },
    { id: 'fullscreen' as const, label: 'Fullscreen' },
    { id: 'split' as const, label: 'Split' },
    { id: 'parallax' as const, label: 'Parallax' }
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

  // Style 4: Fullscreen - Hero toàn màn hình với CTA overlay
  const renderFullscreenStyle = () => {
    const mainSlide = slides[currentSlide] || slides[0];
    const c = content || {};
    return (
      <section className="relative w-full bg-slate-900 overflow-hidden">
        <div className={cn(
          "relative w-full",
          device === 'mobile' ? 'h-[280px]' : device === 'tablet' ? 'h-[350px]' : 'h-[400px]'
        )}>
          {slides.length > 0 && mainSlide ? (
            <>
              {slides.map((slide, idx) => (
                <div key={slide.id} className={cn("absolute inset-0 transition-opacity duration-1000", idx === currentSlide ? "opacity-100" : "opacity-0 pointer-events-none")}>
                  {slide.image ? (
                    <div className="w-full h-full relative">
                      <img src={slide.image} alt="" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
                    </div>
                  ) : renderPlaceholder(idx)}
                </div>
              ))}
              {/* CTA Overlay Content */}
              <div className={cn(
                "absolute inset-0 z-10 flex flex-col justify-center",
                device === 'mobile' ? 'px-4' : 'px-8 md:px-16'
              )}>
                <div className={cn("max-w-xl", device === 'mobile' ? 'space-y-3' : 'space-y-4')}>
                  {c.badge && (
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: `${brandColor}30`, color: brandColor }}>
                      <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: brandColor }} />
                      {c.badge}
                    </div>
                  )}
                  <h1 className={cn("font-bold text-white leading-tight", device === 'mobile' ? 'text-xl' : device === 'tablet' ? 'text-2xl' : 'text-3xl md:text-4xl')}>
                    {c.heading || 'Tiêu đề chính'}
                  </h1>
                  {c.description && (
                    <p className={cn("text-white/80", device === 'mobile' ? 'text-sm line-clamp-2' : 'text-base')}>
                      {c.description}
                    </p>
                  )}
                  <div className={cn("flex gap-3", device === 'mobile' ? 'flex-col' : 'flex-row')}>
                    {c.primaryButtonText && (
                      <button className={cn("font-medium rounded-lg text-white", device === 'mobile' ? 'px-4 py-2 text-sm' : 'px-6 py-2.5')} style={{ backgroundColor: brandColor }}>
                        {c.primaryButtonText}
                      </button>
                    )}
                    {c.secondaryButtonText && (
                      <button className={cn("font-medium rounded-lg border border-white/30 text-white hover:bg-white/10", device === 'mobile' ? 'px-4 py-2 text-sm' : 'px-6 py-2.5')}>
                        {c.secondaryButtonText}
                      </button>
                    )}
                  </div>
                </div>
              </div>
              {/* Navigation dots */}
              {slides.length > 1 && (
                <div className="absolute bottom-4 right-4 flex gap-2 z-20">
                  {slides.map((_, idx) => (
                    <button key={idx} type="button" onClick={() => setCurrentSlide(idx)} 
                      className={cn("w-2 h-2 rounded-full transition-all", idx === currentSlide ? "w-6" : "bg-white/50")} 
                      style={idx === currentSlide ? { backgroundColor: brandColor } : {}} />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-800">
              <span className="text-slate-400 text-sm">Chưa có banner</span>
            </div>
          )}
        </div>
      </section>
    );
  };

  // Style 5: Split - Layout chia đôi (Content + Image)
  const renderSplitStyle = () => {
    const mainSlide = slides[currentSlide] || slides[0];
    const c = content || {};
    return (
      <section className="relative w-full bg-white dark:bg-slate-900 overflow-hidden">
        <div className={cn(
          "relative w-full flex",
          device === 'mobile' ? 'flex-col h-auto' : 'flex-row h-[320px]'
        )}>
          {slides.length > 0 && mainSlide ? (
            <>
              {/* Content Side */}
              <div className={cn(
                "flex flex-col justify-center bg-slate-50 dark:bg-slate-800/50",
                device === 'mobile' ? 'p-4 order-2' : 'w-1/2 p-8 lg:p-12'
              )}>
                <div className={cn("space-y-3", device === 'mobile' ? '' : 'max-w-md')}>
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide" style={{ backgroundColor: `${brandColor}15`, color: brandColor }}>
                    {c.badge || `Banner ${currentSlide + 1}/${slides.length}`}
                  </span>
                  <h2 className={cn("font-bold text-slate-900 dark:text-white leading-tight", device === 'mobile' ? 'text-lg' : 'text-2xl lg:text-3xl')}>
                    {c.heading || 'Tiêu đề nổi bật'}
                  </h2>
                  {c.description && (
                    <p className={cn("text-slate-600 dark:text-slate-300", device === 'mobile' ? 'text-sm' : 'text-base')}>
                      {c.description}
                    </p>
                  )}
                  {c.primaryButtonText && (
                    <div className="pt-2">
                      <button className={cn("font-medium rounded-lg text-white", device === 'mobile' ? 'px-4 py-2 text-sm' : 'px-6 py-2.5')} style={{ backgroundColor: brandColor }}>
                        {c.primaryButtonText}
                      </button>
                    </div>
                  )}
                </div>
                {/* Slide indicators */}
                {slides.length > 1 && device !== 'mobile' && (
                  <div className="flex gap-2 mt-6">
                    {slides.map((_, idx) => (
                      <button key={idx} type="button" onClick={() => setCurrentSlide(idx)}
                        className={cn("h-1 rounded-full transition-all", idx === currentSlide ? "w-8" : "w-4 bg-slate-300 dark:bg-slate-600")}
                        style={idx === currentSlide ? { backgroundColor: brandColor } : {}} />
                    ))}
                  </div>
                )}
              </div>
              {/* Image Side */}
              <div className={cn(
                "relative overflow-hidden",
                device === 'mobile' ? 'w-full h-[200px] order-1' : 'w-1/2'
              )}>
                {slides.map((slide, idx) => (
                  <div key={slide.id} className={cn("absolute inset-0 transition-all duration-700", idx === currentSlide ? "opacity-100 scale-100" : "opacity-0 scale-105 pointer-events-none")}>
                    {slide.image ? (
                      <img src={slide.image} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-200 dark:bg-slate-700">
                        <ImageIcon size={40} className="text-slate-400" />
                      </div>
                    )}
                  </div>
                ))}
                {/* Navigation arrows */}
                {slides.length > 1 && (
                  <>
                    <button type="button" onClick={prevSlide} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 shadow-lg flex items-center justify-center z-10">
                      <ChevronLeft size={16} style={{ color: brandColor }} />
                    </button>
                    <button type="button" onClick={nextSlide} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 shadow-lg flex items-center justify-center z-10">
                      <ChevronRight size={16} style={{ color: brandColor }} />
                    </button>
                  </>
                )}
              </div>
            </>
          ) : (
            <div className="w-full h-[300px] flex items-center justify-center bg-slate-100 dark:bg-slate-800">
              <span className="text-slate-400 text-sm">Chưa có banner</span>
            </div>
          )}
        </div>
      </section>
    );
  };

  // Style 6: Parallax - Hiệu ứng layer với depth
  const renderParallaxStyle = () => {
    const mainSlide = slides[currentSlide] || slides[0];
    const c = content || {};
    return (
      <section className="relative w-full bg-slate-900 overflow-hidden">
        <div className={cn(
          "relative w-full",
          device === 'mobile' ? 'h-[260px]' : device === 'tablet' ? 'h-[320px]' : 'h-[380px]'
        )}>
          {slides.length > 0 && mainSlide ? (
            <>
              {slides.map((slide, idx) => (
                <div key={slide.id} className={cn("absolute inset-0 transition-opacity duration-700", idx === currentSlide ? "opacity-100" : "opacity-0 pointer-events-none")}>
                  {slide.image ? (
                    <div className="w-full h-full relative">
                      {/* Background layer - slight scale for parallax effect */}
                      <div className="absolute inset-0 scale-110 transform-gpu" style={{ backgroundImage: `url(${slide.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
                    </div>
                  ) : renderPlaceholder(idx)}
                </div>
              ))}
              {/* Floating content card */}
              <div className={cn(
                "absolute z-10 flex items-end",
                device === 'mobile' ? 'inset-x-3 bottom-3' : 'inset-x-6 bottom-6'
              )}>
                <div className={cn(
                  "bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-xl shadow-2xl",
                  device === 'mobile' ? 'p-3 w-full' : 'p-5 max-w-lg'
                )}>
                  {c.badge && (
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: brandColor }} />
                      <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: brandColor }}>{c.badge}</span>
                    </div>
                  )}
                  <h3 className={cn("font-bold text-slate-900 dark:text-white", device === 'mobile' ? 'text-base' : 'text-xl')}>
                    {c.heading || 'Tiêu đề nổi bật'}
                  </h3>
                  {c.description && (
                    <p className={cn("text-slate-600 dark:text-slate-300 mt-1", device === 'mobile' ? 'text-xs' : 'text-sm')}>
                      {c.description}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-3">
                    {c.primaryButtonText && (
                      <button className={cn("font-medium rounded-lg text-white", device === 'mobile' ? 'px-3 py-1.5 text-xs' : 'px-5 py-2 text-sm')} style={{ backgroundColor: brandColor }}>
                        {c.primaryButtonText}
                      </button>
                    )}
                    {c.countdownText && (
                      <span className={cn("text-slate-500", device === 'mobile' ? 'text-xs' : 'text-sm')}>{c.countdownText}</span>
                    )}
                  </div>
                </div>
              </div>
              {/* Top navigation bar */}
              {slides.length > 1 && (
                <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
                  <button type="button" onClick={prevSlide} className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors">
                    <ChevronLeft size={16} className="text-white" />
                  </button>
                  <span className="text-white/80 text-xs font-medium px-2">{currentSlide + 1} / {slides.length}</span>
                  <button type="button" onClick={nextSlide} className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors">
                    <ChevronRight size={16} className="text-white" />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-800">
              <span className="text-slate-400 text-sm">Chưa có banner</span>
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
            <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1 flex-wrap">
              {styles.map((s) => (
                <button key={s.id} type="button" onClick={() => onStyleChange?.(s.id)}
                  className={cn("px-2 py-1 text-xs font-medium rounded-md transition-all",
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
            {selectedStyle === 'fullscreen' && renderFullscreenStyle()}
            {selectedStyle === 'split' && renderSplitStyle()}
            {selectedStyle === 'parallax' && renderParallaxStyle()}
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

        {/* Hướng dẫn kích thước ảnh tối ưu */}
        <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
          <div className="flex items-start gap-2">
            <ImageIcon size={14} className="text-slate-400 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-slate-600 dark:text-slate-400">
              {selectedStyle === 'slider' && (
                <p><strong>1920×600px</strong> (16:5) • Nhiều ảnh, auto slide</p>
              )}
              {selectedStyle === 'fade' && (
                <p><strong>1920×600px</strong> (16:5) • Nhiều ảnh, thumbnail navigation</p>
              )}
              {selectedStyle === 'bento' && (
                <p><strong>Slot 1:</strong> 800×500 • <strong>Slot 2:</strong> 800×250 • <strong>Slot 3-4:</strong> 400×250 • Tối đa 4 ảnh</p>
              )}
              {selectedStyle === 'fullscreen' && (
                <p><strong>1920×1080px</strong> (16:9) • Subject đặt bên phải (trái có overlay text)</p>
              )}
              {selectedStyle === 'split' && (
                <p><strong>960×600px</strong> (8:5) • Ảnh bên phải 50%, subject đặt giữa/trái</p>
              )}
              {selectedStyle === 'parallax' && (
                <p><strong>1920×1080px</strong> (16:9) • Để trống góc dưới trái cho card nổi</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// ============ STATS PREVIEW ============
// Professional Stats UI/UX - 6 Variants
type StatsItem = { value: string; label: string };
export type StatsStyle = 'horizontal' | 'cards' | 'icons' | 'gradient' | 'minimal' | 'counter';
export const StatsPreview = ({ items, brandColor, selectedStyle, onStyleChange }: { items: StatsItem[]; brandColor: string; selectedStyle?: StatsStyle; onStyleChange?: (style: StatsStyle) => void }) => {
  const [device, setDevice] = useState<PreviewDevice>('desktop');
  const previewStyle = selectedStyle || 'horizontal';
  const setPreviewStyle = (s: string) => onStyleChange?.(s as StatsStyle);
  const styles = [
    { id: 'horizontal', label: 'Thanh ngang' }, 
    { id: 'cards', label: 'Cards' }, 
    { id: 'icons', label: 'Circle' },
    { id: 'gradient', label: 'Gradient' },
    { id: 'minimal', label: 'Minimal' },
    { id: 'counter', label: 'Counter' },
  ];

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

  // Style 4: Gradient - Glass morphism với gradient background
  const renderGradientStyle = () => (
    <section className={cn("w-full", device === 'mobile' ? 'p-3' : 'p-6')}>
      <div 
        className="rounded-2xl overflow-hidden"
        style={{ 
          background: `linear-gradient(135deg, ${brandColor} 0%, ${brandColor}dd 50%, ${brandColor}bb 100%)`,
        }}
      >
        <div className={cn(
          "grid backdrop-blur-sm",
          device === 'mobile' ? 'grid-cols-2' : 'grid-cols-4'
        )}>
          {items.slice(0, 4).map((item, idx) => (
            <div 
              key={idx}
              className={cn(
                "relative flex flex-col items-center justify-center text-center text-white p-6",
                device === 'mobile' ? 'p-4' : 'p-8',
                idx !== items.slice(0, 4).length - 1 && (device === 'mobile' ? '' : 'border-r border-white/10')
              )}
            >
              {/* Decorative circle */}
              <div 
                className="absolute top-2 right-2 w-16 h-16 rounded-full bg-white/5 blur-xl"
              />
              <span className={cn(
                "font-extrabold tracking-tight tabular-nums leading-none mb-2 relative z-10",
                device === 'mobile' ? 'text-3xl' : 'text-4xl md:text-5xl'
              )}>
                {item.value || '0'}
              </span>
              <h3 className={cn(
                "font-medium opacity-90 relative z-10",
                device === 'mobile' ? 'text-xs' : 'text-sm'
              )}>
                {item.label || 'Label'}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  // Style 5: Minimal - Clean, simple với typography focus
  const renderMinimalStyle = () => (
    <section className={cn("w-full bg-slate-50 dark:bg-slate-900", device === 'mobile' ? 'py-8 px-4' : 'py-12 px-6')}>
      <div className={cn(
        "max-w-5xl mx-auto grid",
        device === 'mobile' ? 'grid-cols-2 gap-6' : 'grid-cols-4 gap-8'
      )}>
        {items.slice(0, 4).map((item, idx) => (
          <div 
            key={idx}
            className="flex flex-col items-start"
          >
            {/* Accent line */}
            <div 
              className="w-12 h-1 rounded-full mb-4"
              style={{ backgroundColor: brandColor }}
            />
            <span 
              className={cn(
                "font-bold tracking-tight tabular-nums leading-none text-slate-900 dark:text-white",
                device === 'mobile' ? 'text-3xl' : 'text-4xl md:text-5xl'
              )}
            >
              {item.value || '0'}
            </span>
            <h3 className={cn(
              "font-medium text-slate-500 dark:text-slate-400 mt-2",
              device === 'mobile' ? 'text-sm' : 'text-base'
            )}>
              {item.label || 'Label'}
            </h3>
          </div>
        ))}
      </div>
    </section>
  );

  // Style 6: Counter - Big numbers với animated feel & progress indicator
  const renderCounterStyle = () => (
    <section className={cn("w-full", device === 'mobile' ? 'py-6 px-3' : 'py-10 px-6')}>
      <div className={cn(
        "max-w-5xl mx-auto grid",
        device === 'mobile' ? 'grid-cols-2 gap-4' : 'grid-cols-4 gap-6'
      )}>
        {items.slice(0, 4).map((item, idx) => (
          <div 
            key={idx}
            className="relative bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden group"
          >
            {/* Top progress bar */}
            <div className="h-1 w-full bg-slate-100 dark:bg-slate-700">
              <div 
                className="h-full transition-all duration-500"
                style={{ 
                  backgroundColor: brandColor,
                  width: `${Math.min(100, (idx + 1) * 25)}%`
                }}
              />
            </div>
            
            <div className={cn(
              "flex flex-col items-center justify-center text-center",
              device === 'mobile' ? 'p-4' : 'p-6'
            )}>
              <span 
                className={cn(
                  "font-black tracking-tighter tabular-nums leading-none group-hover:scale-110 transition-transform duration-300",
                  device === 'mobile' ? 'text-4xl' : 'text-5xl md:text-6xl'
                )}
                style={{ color: brandColor }}
              >
                {item.value || '0'}
              </span>
              <h3 className={cn(
                "font-semibold text-slate-600 dark:text-slate-300 mt-2",
                device === 'mobile' ? 'text-xs' : 'text-sm'
              )}>
                {item.label || 'Label'}
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
    </section>
  );

  return (
    <PreviewWrapper title="Preview Stats" device={device} setDevice={setDevice} previewStyle={previewStyle} setPreviewStyle={setPreviewStyle} styles={styles} info={`${items.filter(i => i.value || i.label).length} số liệu`}>
      <BrowserFrame>
        {previewStyle === 'horizontal' && renderHorizontalStyle()}
        {previewStyle === 'cards' && renderCardsStyle()}
        {previewStyle === 'icons' && renderIconsStyle()}
        {previewStyle === 'gradient' && renderGradientStyle()}
        {previewStyle === 'minimal' && renderMinimalStyle()}
        {previewStyle === 'counter' && renderCounterStyle()}
      </BrowserFrame>
    </PreviewWrapper>
  );
};

// ============ FAQ PREVIEW ============
type FaqItem = { id: number; question: string; answer: string };
export type FaqStyle = 'accordion' | 'cards' | 'two-column' | 'minimal' | 'timeline' | 'tabbed';
export type FaqConfig = { description?: string; buttonText?: string; buttonLink?: string };
export const FaqPreview = ({ items, brandColor, selectedStyle, onStyleChange, config }: { items: FaqItem[]; brandColor: string; selectedStyle?: FaqStyle; onStyleChange?: (style: FaqStyle) => void; config?: FaqConfig }) => {
  const [device, setDevice] = useState<PreviewDevice>('desktop');
  const previewStyle = selectedStyle || 'accordion';
  const setPreviewStyle = (s: string) => onStyleChange?.(s as FaqStyle);
  const [openIndex, setOpenIndex] = useState(0);
  const [activeTab, setActiveTab] = useState(0);
  const styles = [
    { id: 'accordion', label: 'Accordion' }, 
    { id: 'cards', label: 'Cards' }, 
    { id: 'two-column', label: '2 Cột' },
    { id: 'minimal', label: 'Minimal' },
    { id: 'timeline', label: 'Timeline' },
    { id: 'tabbed', label: 'Tabbed' }
  ];

  const MAX_VISIBLE = device === 'mobile' ? 4 : 6;
  const visibleItems = items.slice(0, MAX_VISIBLE);
  const remainingCount = items.length - MAX_VISIBLE;

  // Empty state
  if (items.length === 0) {
    return (
      <PreviewWrapper title="Preview FAQ" device={device} setDevice={setDevice} previewStyle={previewStyle} setPreviewStyle={setPreviewStyle} styles={styles} info="0 câu hỏi">
        <BrowserFrame url="yoursite.com/faq">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: `${brandColor}10` }}>
              <HelpCircle size={32} style={{ color: brandColor }} />
            </div>
            <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-1">Chưa có câu hỏi nào</h3>
            <p className="text-sm text-slate-500">Thêm câu hỏi đầu tiên để bắt đầu</p>
          </div>
        </BrowserFrame>
      </PreviewWrapper>
    );
  }

  // Style 1: Accordion - with ARIA, keyboard nav, brandColor hover
  const renderAccordionStyle = () => (
    <div className={cn("py-10 px-4", device === 'mobile' && 'py-6 px-3')}>
      <h3 className={cn("font-bold text-center mb-8 text-slate-900 dark:text-slate-100", device === 'mobile' ? 'text-lg mb-6' : 'text-2xl')}>Câu hỏi thường gặp</h3>
      <div className="space-y-3 max-w-3xl mx-auto" role="region" aria-label="Câu hỏi thường gặp">
        {visibleItems.map((item, idx) => {
          const isOpen = openIndex === idx;
          const panelId = `faq-panel-${idx}`;
          const buttonId = `faq-button-${idx}`;
          return (
            <div 
              key={item.id} 
              className="rounded-xl overflow-hidden transition-all"
              style={{ 
                border: `1px solid ${isOpen ? brandColor + '40' : brandColor + '15'}`,
                boxShadow: isOpen ? `0 4px 12px ${brandColor}10` : 'none'
              }}
            >
              <button 
                type="button" 
                id={buttonId}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowDown') { e.preventDefault(); setOpenIndex(Math.min(idx + 1, items.length - 1)); }
                  if (e.key === 'ArrowUp') { e.preventDefault(); setOpenIndex(Math.max(idx - 1, 0)); }
                }}
                className={cn(
                  "w-full flex items-center justify-between text-left font-medium transition-colors",
                  device === 'mobile' ? 'px-4 py-3 min-h-[44px] text-sm' : 'px-5 py-4 text-base',
                  isOpen ? "bg-slate-50 dark:bg-slate-800" : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                )}
              >
                <span className="pr-4">{item.question || `Câu hỏi ${idx + 1}`}</span>
                <ChevronDown 
                  size={device === 'mobile' ? 16 : 18} 
                  className={cn("flex-shrink-0 transition-transform duration-200", isOpen && "rotate-180")} 
                  style={{ color: brandColor }} 
                />
              </button>
              <div 
                id={panelId}
                role="region"
                aria-labelledby={buttonId}
                className={cn(
                  "overflow-hidden transition-all duration-200",
                  isOpen ? "max-h-96" : "max-h-0"
                )}
              >
                <div className={cn(
                  "bg-slate-50 dark:bg-slate-800/50 border-t text-slate-600 dark:text-slate-300 leading-relaxed",
                  device === 'mobile' ? 'px-4 py-3 text-sm' : 'px-5 py-4'
                )} style={{ borderColor: `${brandColor}15` }}>
                  {item.answer || 'Câu trả lời...'}
                </div>
              </div>
            </div>
          );
        })}
        {remainingCount > 0 && (
          <div className="flex items-center justify-center py-4">
            <span className="text-sm font-medium px-4 py-2 rounded-full" style={{ backgroundColor: `${brandColor}10`, color: brandColor }}>
              +{remainingCount} câu hỏi khác
            </span>
          </div>
        )}
      </div>
    </div>
  );

  // Style 2: Cards - with brandColor hover
  const renderCardsStyle = () => (
    <div className={cn("py-10 px-4", device === 'mobile' && 'py-6 px-3')}>
      <h3 className={cn("font-bold text-center mb-8 text-slate-900 dark:text-slate-100", device === 'mobile' ? 'text-lg mb-6' : 'text-2xl')}>Câu hỏi thường gặp</h3>
      <div className={cn("grid gap-4 max-w-5xl mx-auto", device === 'mobile' ? 'grid-cols-1 gap-3' : 'grid-cols-2')}>
        {visibleItems.slice(0, device === 'mobile' ? 4 : 6).map((item, idx) => (
          <div 
            key={item.id} 
            className="bg-white dark:bg-slate-800 rounded-xl transition-all cursor-pointer group"
            style={{ 
              padding: device === 'mobile' ? '14px' : '20px',
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
            <div className="flex items-start gap-3">
              <div 
                className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-white text-sm font-bold"
                style={{ backgroundColor: brandColor }}
              >
                ?
              </div>
              <div className="flex-1 min-w-0">
                <h4 className={cn("font-semibold text-slate-900 dark:text-slate-100 mb-2 line-clamp-2", device === 'mobile' ? 'text-sm' : 'text-base')}>
                  {item.question || `Câu hỏi ${idx + 1}`}
                </h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {item.answer || 'Câu trả lời...'}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
      {remainingCount > 0 && (
        <div className="flex items-center justify-center mt-6">
          <span className="text-sm font-medium px-4 py-2 rounded-full" style={{ backgroundColor: `${brandColor}10`, color: brandColor }}>
            +{remainingCount} câu hỏi khác
          </span>
        </div>
      )}
    </div>
  );

  // Style 3: Two Column - with configurable CTA button
  const renderTwoColumnStyle = () => (
    <div className={cn("py-10 px-4", device === 'mobile' && 'py-6 px-3')}>
      <div className={cn("max-w-5xl mx-auto", device === 'mobile' ? 'space-y-6' : 'grid grid-cols-5 gap-10')}>
        <div className={cn(device === 'mobile' ? '' : 'col-span-2')}>
          <h3 className={cn("font-bold mb-3 text-slate-900 dark:text-slate-100", device === 'mobile' ? 'text-lg' : 'text-2xl')} style={{ color: brandColor }}>
            Câu hỏi thường gặp
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-5 leading-relaxed">
            {config?.description || 'Tìm câu trả lời cho các thắc mắc phổ biến của bạn'}
          </p>
          {config?.buttonText && (
            <a 
              href={config?.buttonLink || '#'}
              className={cn("inline-block rounded-lg text-white font-medium transition-all", device === 'mobile' ? 'px-4 py-2.5 text-sm min-h-[44px]' : 'px-5 py-2.5')}
              style={{ backgroundColor: brandColor, boxShadow: `0 4px 12px ${brandColor}30` }}
            >
              {config.buttonText}
            </a>
          )}
        </div>
        <div className={cn("space-y-4", device === 'mobile' ? '' : 'col-span-3')}>
          {visibleItems.slice(0, device === 'mobile' ? 3 : 5).map((item, idx) => (
            <div key={item.id} className="pb-4" style={{ borderBottom: `1px solid ${brandColor}15` }}>
              <h4 className={cn("font-semibold mb-2 text-slate-900 dark:text-slate-100", device === 'mobile' ? 'text-sm' : '')}>
                {item.question || `Câu hỏi ${idx + 1}`}
              </h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                {item.answer || 'Câu trả lời...'}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Style 4: Minimal - clean, simple, numbered
  const renderMinimalStyle = () => (
    <div className={cn("py-10 px-4", device === 'mobile' && 'py-6 px-3')}>
      <div className="max-w-3xl mx-auto">
        <h3 className={cn("font-bold mb-8 text-slate-900 dark:text-slate-100", device === 'mobile' ? 'text-lg mb-6' : 'text-2xl')}>
          Câu hỏi thường gặp
        </h3>
        <div className="space-y-6">
          {visibleItems.map((item, idx) => (
            <div key={item.id} className="flex gap-4">
              <span 
                className={cn("font-bold flex-shrink-0", device === 'mobile' ? 'text-lg' : 'text-xl')}
                style={{ color: brandColor }}
              >
                {String(idx + 1).padStart(2, '0')}
              </span>
              <div className="flex-1">
                <h4 className={cn("font-semibold mb-2 text-slate-900 dark:text-slate-100", device === 'mobile' ? 'text-sm' : '')}>
                  {item.question || `Câu hỏi ${idx + 1}`}
                </h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  {item.answer || 'Câu trả lời...'}
                </p>
              </div>
            </div>
          ))}
        </div>
        {remainingCount > 0 && (
          <div className="mt-6 pt-4" style={{ borderTop: `1px solid ${brandColor}15` }}>
            <span className="text-sm" style={{ color: brandColor }}>+{remainingCount} câu hỏi khác</span>
          </div>
        )}
      </div>
    </div>
  );

  // Style 5: Timeline - vertical line connector
  const renderTimelineStyle = () => (
    <div className={cn("py-10 px-4", device === 'mobile' && 'py-6 px-3')}>
      <h3 className={cn("font-bold text-center mb-8 text-slate-900 dark:text-slate-100", device === 'mobile' ? 'text-lg mb-6' : 'text-2xl')}>
        Câu hỏi thường gặp
      </h3>
      <div className="max-w-3xl mx-auto relative">
        {/* Vertical line */}
        <div 
          className="absolute left-4 top-0 bottom-0 w-0.5"
          style={{ backgroundColor: `${brandColor}20` }}
        />
        <div className="space-y-6">
          {visibleItems.map((item, idx) => (
            <div key={item.id} className="relative pl-12">
              {/* Dot */}
              <div 
                className="absolute left-2 top-1.5 w-5 h-5 rounded-full border-4 bg-white dark:bg-slate-900"
                style={{ borderColor: brandColor }}
              />
              <div className={cn("rounded-xl p-4", device === 'mobile' && 'p-3')} style={{ backgroundColor: `${brandColor}05` }}>
                <h4 className={cn("font-semibold mb-2 text-slate-900 dark:text-slate-100", device === 'mobile' ? 'text-sm' : '')}>
                  {item.question || `Câu hỏi ${idx + 1}`}
                </h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  {item.answer || 'Câu trả lời...'}
                </p>
              </div>
            </div>
          ))}
        </div>
        {remainingCount > 0 && (
          <div className="relative pl-12 mt-6">
            <div 
              className="absolute left-2 top-1.5 w-5 h-5 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${brandColor}20` }}
            >
              <Plus size={12} style={{ color: brandColor }} />
            </div>
            <span className="text-sm font-medium" style={{ color: brandColor }}>+{remainingCount} câu hỏi khác</span>
          </div>
        )}
      </div>
    </div>
  );

  // Style 6: Tabbed - horizontal tabs navigation
  const renderTabbedStyle = () => (
    <div className={cn("py-10 px-4", device === 'mobile' && 'py-6 px-3')}>
      <h3 className={cn("font-bold text-center mb-6 text-slate-900 dark:text-slate-100", device === 'mobile' ? 'text-lg' : 'text-2xl')}>
        Câu hỏi thường gặp
      </h3>
      <div className="max-w-4xl mx-auto">
        {/* Tabs */}
        <div className={cn("flex gap-2 mb-6 overflow-x-auto pb-2", device === 'mobile' && 'gap-1')}>
          {visibleItems.slice(0, device === 'mobile' ? 3 : 5).map((item, idx) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(idx)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex-shrink-0",
                device === 'mobile' && 'px-3 py-1.5 text-xs min-h-[36px]',
                activeTab === idx ? 'text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              )}
              style={activeTab === idx ? { backgroundColor: brandColor } : {}}
            >
              Q{idx + 1}
            </button>
          ))}
          {remainingCount > 0 && (
            <span className="px-3 py-2 text-xs text-slate-400 flex items-center">+{remainingCount}</span>
          )}
        </div>
        {/* Content */}
        <div 
          className="rounded-xl p-6"
          style={{ 
            backgroundColor: `${brandColor}05`,
            border: `1px solid ${brandColor}15`
          }}
        >
          {visibleItems[activeTab] && (
            <>
              <h4 className={cn("font-semibold mb-3 text-slate-900 dark:text-slate-100", device === 'mobile' ? 'text-base' : 'text-lg')}>
                {visibleItems[activeTab].question || `Câu hỏi ${activeTab + 1}`}
              </h4>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                {visibleItems[activeTab].answer || 'Câu trả lời...'}
              </p>
            </>
          )}
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
        {previewStyle === 'minimal' && renderMinimalStyle()}
        {previewStyle === 'timeline' && renderTimelineStyle()}
        {previewStyle === 'tabbed' && renderTabbedStyle()}
      </BrowserFrame>
    </PreviewWrapper>
  );
};

// ============ TESTIMONIALS PREVIEW ============
type TestimonialItem = { id: number; name: string; role: string; content: string; avatar: string; rating: number };
// ============ TESTIMONIALS PREVIEW ============
// 6 Professional Styles following Best Practices:
// - Authenticity: Real customer info (name, role, company)
// - Credibility indicators: Star ratings, avatar, verification
// - Diverse formats: Cards, Slider, Masonry, Quote, Carousel, Minimal
// - Mobile responsive with proper touch targets
export type TestimonialsStyle = 'cards' | 'slider' | 'masonry' | 'quote' | 'carousel' | 'minimal';
export const TestimonialsPreview = ({ items, brandColor, selectedStyle, onStyleChange }: { items: TestimonialItem[]; brandColor: string; selectedStyle?: TestimonialsStyle; onStyleChange?: (style: TestimonialsStyle) => void }) => {
  const [device, setDevice] = useState<PreviewDevice>('desktop');
  const previewStyle = selectedStyle || 'cards';
  const setPreviewStyle = (s: string) => onStyleChange?.(s as TestimonialsStyle);
  const [currentSlide, setCurrentSlide] = useState(0);
  const styles = [
    { id: 'cards', label: 'Cards' }, 
    { id: 'slider', label: 'Slider' }, 
    { id: 'masonry', label: 'Masonry' },
    { id: 'quote', label: 'Quote' },
    { id: 'carousel', label: 'Carousel' },
    { id: 'minimal', label: 'Minimal' }
  ];

  const renderStars = (rating: number, size: number = 12) => (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(star => (<Star key={star} size={size} className={star <= rating ? "text-yellow-400 fill-yellow-400" : "text-slate-300"} />))}
    </div>
  );

  // Helper: Get visible items with +N pattern
  const getVisibleItems = (maxVisible: number) => {
    const visible = items.slice(0, maxVisible);
    const remaining = items.length - maxVisible;
    return { visible, remaining };
  };

  // Empty State
  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: `${brandColor}10` }}>
        <Star size={32} style={{ color: brandColor }} />
      </div>
      <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-1">Chưa có đánh giá nào</h3>
      <p className="text-sm text-slate-500">Thêm đánh giá đầu tiên để bắt đầu</p>
    </div>
  );

  // Style 1: Cards - Grid layout with equal height
  const renderCardsStyle = () => {
    if (items.length === 0) return renderEmptyState();
    const maxVisible = device === 'mobile' ? 2 : device === 'tablet' ? 4 : 6;
    const { visible, remaining } = getVisibleItems(maxVisible);
    
    // Centered layout for 1-2 items
    const gridClass = items.length === 1 
      ? 'max-w-md mx-auto' 
      : items.length === 2 
        ? 'max-w-2xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4'
        : cn("grid gap-4", device === 'mobile' ? 'grid-cols-1' : device === 'tablet' ? 'grid-cols-2' : 'grid-cols-3');
    
    return (
      <div className={cn("py-8 px-4", device === 'mobile' ? 'py-6' : '')}>
        <h3 className={cn("font-bold text-center mb-6", device === 'mobile' ? 'text-lg' : 'text-xl')}>Khách hàng nói gì về chúng tôi</h3>
        <div className={gridClass}>
          {visible.map((item) => (
            <div key={item.id} className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col h-full">
              {renderStars(item.rating)}
              <p className="my-3 text-slate-600 dark:text-slate-300 line-clamp-3 text-sm flex-1 min-h-[3.5rem]">"{item.content || 'Nội dung đánh giá...'}"</p>
              <div className="flex items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-700 mt-auto">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0" style={{ backgroundColor: brandColor }}>{(item.name || 'U')[0]}</div>
                <div className="min-w-0">
                  <div className="font-medium text-sm truncate">{item.name || 'Tên khách hàng'}</div>
                  <div className="text-xs text-slate-500 truncate">{item.role || 'Chức vụ'}</div>
                </div>
              </div>
            </div>
          ))}
          {remaining > 0 && (
            <div className="flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-xl aspect-square border-2 border-dashed border-slate-300 dark:border-slate-600">
              <div className="text-center">
                <div className="text-2xl font-bold" style={{ color: brandColor }}>+{remaining}</div>
                <p className="text-xs text-slate-500 mt-1">đánh giá khác</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Style 2: Slider - Single testimonial with navigation
  const renderSliderStyle = () => {
    if (items.length === 0) return renderEmptyState();
    const current = items[currentSlide] || items[0];
    return (
      <div className={cn("py-12 px-4 relative overflow-hidden", device === 'mobile' ? 'py-8' : '')}>
        <div className="absolute top-4 left-1/2 -translate-x-1/2 text-[120px] leading-none font-serif opacity-5 pointer-events-none select-none" style={{ color: brandColor }}>"</div>
        <div className="max-w-6xl mx-auto relative">
          <div className={cn("bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 text-center relative", device === 'mobile' ? 'p-5' : '')} style={{ borderTop: `4px solid ${brandColor}` }}>
            <div className="flex justify-center mb-4">{renderStars(current?.rating || 5, 16)}</div>
            <p className={cn("text-slate-700 dark:text-slate-200 leading-relaxed mb-6", device === 'mobile' ? 'text-base' : 'text-lg')}>"{current?.content || 'Nội dung đánh giá...'}"</p>
            <div className="flex items-center justify-center gap-4">
              <div className="w-14 h-14 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-lg flex-shrink-0" style={{ backgroundColor: brandColor }}>{(current?.name || 'U')[0]}</div>
              <div className="text-left">
                <div className="font-semibold text-slate-900 dark:text-white">{current?.name || 'Tên khách hàng'}</div>
                <div className="text-sm text-slate-500">{current?.role || 'Chức vụ'}</div>
              </div>
            </div>
          </div>
          {items.length > 1 && (
            <div className="flex items-center justify-center gap-4 mt-6">
              <button type="button" onClick={() => setCurrentSlide(prev => prev === 0 ? items.length - 1 : prev - 1)} className="w-10 h-10 min-h-[44px] rounded-full bg-white dark:bg-slate-800 shadow-md flex items-center justify-center hover:scale-105 transition-transform"><ChevronLeft size={18} /></button>
              <div className="flex gap-2">
                {items.map((_, idx) => (<button key={idx} type="button" onClick={() => setCurrentSlide(idx)} className={cn("w-2.5 h-2.5 rounded-full transition-all", idx === currentSlide ? "w-8" : "bg-slate-300")} style={idx === currentSlide ? { backgroundColor: brandColor } : {}} />))}
              </div>
              <button type="button" onClick={() => setCurrentSlide(prev => (prev + 1) % items.length)} className="w-10 h-10 min-h-[44px] rounded-full bg-white dark:bg-slate-800 shadow-md flex items-center justify-center hover:scale-105 transition-transform"><ChevronRight size={18} /></button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Style 3: Masonry - Pinterest-like layout
  const renderMasonryStyle = () => {
    if (items.length === 0) return renderEmptyState();
    const maxVisible = device === 'mobile' ? 3 : 6;
    const { visible, remaining } = getVisibleItems(maxVisible);
    
    return (
      <div className={cn("py-8 px-4", device === 'mobile' ? 'py-6' : '')}>
        <h3 className={cn("font-bold text-center mb-6", device === 'mobile' ? 'text-lg' : 'text-xl')}>Khách hàng nói gì về chúng tôi</h3>
        <div className={cn("columns-1 gap-4", device === 'tablet' && 'columns-2', device === 'desktop' && 'columns-3')}>
          {visible.map((item, idx) => (
            <div key={item.id} className={cn("break-inside-avoid mb-4 bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700", idx % 2 === 0 ? '' : 'pt-6')}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ backgroundColor: brandColor }}>{(item.name || 'U')[0]}</div>
                <div className="min-w-0">
                  <div className="font-medium text-sm truncate">{item.name || 'Tên'}</div>
                  <div className="text-xs text-slate-500 truncate">{item.role || 'Chức vụ'}</div>
                </div>
              </div>
              {renderStars(item.rating)}
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">"{item.content || 'Nội dung...'}"</p>
            </div>
          ))}
        </div>
        {remaining > 0 && (
          <div className="text-center mt-4">
            <span className="text-sm font-medium" style={{ color: brandColor }}>+{remaining} đánh giá khác</span>
          </div>
        )}
      </div>
    );
  };

  // Style 4: Quote - Big quote focused, elegant typography
  const renderQuoteStyle = () => {
    if (items.length === 0) return renderEmptyState();
    const current = items[currentSlide] || items[0];
    
    return (
      <div className={cn("py-12 px-4", device === 'mobile' ? 'py-8' : '')} style={{ backgroundColor: `${brandColor}05` }}>
        <div className="max-w-4xl mx-auto text-center">
          {/* Large quote mark */}
          <div className="text-[80px] md:text-[120px] leading-none font-serif mb-[-30px] md:mb-[-50px] select-none" style={{ color: brandColor }}>"</div>
          
          <blockquote className={cn("text-slate-800 dark:text-slate-200 leading-relaxed font-medium italic", device === 'mobile' ? 'text-lg' : 'text-xl md:text-2xl')}>
            {current?.content || 'Nội dung đánh giá...'}
          </blockquote>
          
          <div className="mt-8 flex flex-col items-center gap-3">
            <div className="flex justify-center">{renderStars(current?.rating || 5, 18)}</div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: brandColor }}>
                {(current?.name || 'U')[0]}
              </div>
              <div className="text-left">
                <div className="font-semibold text-slate-900 dark:text-white">{current?.name || 'Tên khách hàng'}</div>
                <div className="text-sm text-slate-500">{current?.role || 'Chức vụ'}</div>
              </div>
            </div>
          </div>
          
          {items.length > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {items.map((_, idx) => (
                <button 
                  key={idx} 
                  type="button" 
                  onClick={() => setCurrentSlide(idx)} 
                  className={cn("w-3 h-3 rounded-full transition-all", idx === currentSlide ? "" : "bg-slate-300 hover:bg-slate-400")}
                  style={idx === currentSlide ? { backgroundColor: brandColor } : {}}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Style 5: Carousel - Horizontal scroll cards
  const renderCarouselStyle = () => {
    if (items.length === 0) return renderEmptyState();
    
    return (
      <div className={cn("py-8", device === 'mobile' ? 'py-6' : '')}>
        <h3 className={cn("font-bold text-center mb-6 px-4", device === 'mobile' ? 'text-lg' : 'text-xl')}>Khách hàng nói gì về chúng tôi</h3>
        
        <div className="relative">
          {/* Scroll container */}
          <div className="flex gap-4 overflow-x-auto px-4 pb-4 snap-x snap-mandatory scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {items.map((item) => (
              <div 
                key={item.id} 
                className={cn(
                  "flex-shrink-0 snap-center bg-white dark:bg-slate-800 rounded-xl p-5 shadow-md border flex flex-col",
                  device === 'mobile' ? 'w-[280px]' : 'w-[320px]'
                )}
                style={{ borderColor: `${brandColor}15` }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0" style={{ backgroundColor: brandColor }}>
                    {(item.name || 'U')[0]}
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-sm truncate">{item.name || 'Tên khách hàng'}</div>
                    <div className="text-xs text-slate-500 truncate">{item.role || 'Chức vụ'}</div>
                  </div>
                </div>
                {renderStars(item.rating, 14)}
                <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 line-clamp-4 flex-1">"{item.content || 'Nội dung đánh giá...'}"</p>
              </div>
            ))}
          </div>
          
          {/* Scroll indicators */}
          {items.length > 2 && (
            <div className="flex justify-center gap-1.5 mt-4">
              {items.map((_, idx) => (
                <div 
                  key={idx} 
                  className="w-1.5 h-1.5 rounded-full bg-slate-300"
                  style={idx === 0 ? { backgroundColor: brandColor } : {}}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Style 6: Minimal - Clean list with accent line
  const renderMinimalStyle = () => {
    if (items.length === 0) return renderEmptyState();
    const maxVisible = device === 'mobile' ? 3 : 4;
    const { visible, remaining } = getVisibleItems(maxVisible);
    
    return (
      <div className={cn("py-8 px-4", device === 'mobile' ? 'py-6' : '')}>
        <h3 className={cn("font-bold text-center mb-6", device === 'mobile' ? 'text-lg' : 'text-xl')}>Khách hàng nói gì về chúng tôi</h3>
        <div className="max-w-3xl mx-auto space-y-4">
          {visible.map((item) => (
            <div 
              key={item.id} 
              className="flex gap-4 p-4 rounded-lg bg-white dark:bg-slate-800 border-l-4 shadow-sm"
              style={{ borderLeftColor: brandColor }}
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0" style={{ backgroundColor: brandColor }}>
                {(item.name || 'U')[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-medium text-sm">{item.name || 'Tên khách hàng'}</span>
                  <span className="text-xs text-slate-500">•</span>
                  <span className="text-xs text-slate-500 truncate">{item.role || 'Chức vụ'}</span>
                  <div className="ml-auto">{renderStars(item.rating, 10)}</div>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">"{item.content || 'Nội dung...'}"</p>
              </div>
            </div>
          ))}
          {remaining > 0 && (
            <div className="text-center pt-2">
              <button type="button" className="text-sm font-medium px-4 py-2 rounded-lg transition-colors" style={{ color: brandColor, backgroundColor: `${brandColor}10` }}>
                Xem thêm {remaining} đánh giá
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <PreviewWrapper title="Preview Testimonials" device={device} setDevice={setDevice} previewStyle={previewStyle} setPreviewStyle={setPreviewStyle} styles={styles} info={`${items.length} đánh giá`}>
      <BrowserFrame>
        {previewStyle === 'cards' && renderCardsStyle()}
        {previewStyle === 'slider' && renderSliderStyle()}
        {previewStyle === 'masonry' && renderMasonryStyle()}
        {previewStyle === 'quote' && renderQuoteStyle()}
        {previewStyle === 'carousel' && renderCarouselStyle()}
        {previewStyle === 'minimal' && renderMinimalStyle()}
      </BrowserFrame>
    </PreviewWrapper>
  );
};

// ============ PRICING PREVIEW ============
// 6 Styles: cards, horizontal, minimal, comparison, featured, compact
// Best Practices: Monthly/Yearly toggle, highlight popular, feature comparison, CTA hierarchy
type PricingPlan = { 
  id: number; 
  name: string; 
  price: string; 
  yearlyPrice?: string;
  period: string; 
  features: string[]; 
  isPopular: boolean; 
  buttonText: string; 
  buttonLink: string;
};
export type PricingConfig = {
  subtitle?: string;
  showBillingToggle?: boolean;
  monthlyLabel?: string;
  yearlyLabel?: string;
  yearlySavingText?: string;
};
export type PricingStyle = 'cards' | 'horizontal' | 'minimal' | 'comparison' | 'featured' | 'compact';

export const PricingPreview = ({ 
  plans, 
  brandColor, 
  selectedStyle, 
  onStyleChange,
  config 
}: { 
  plans: PricingPlan[]; 
  brandColor: string; 
  selectedStyle?: PricingStyle; 
  onStyleChange?: (style: PricingStyle) => void;
  config?: PricingConfig;
}) => {
  const [device, setDevice] = useState<PreviewDevice>('desktop');
  const [isYearly, setIsYearly] = useState(false);
  const previewStyle = selectedStyle || 'cards';
  const setPreviewStyle = (s: string) => onStyleChange?.(s as PricingStyle);
  
  const styles = [
    { id: 'cards', label: 'Cards' }, 
    { id: 'horizontal', label: 'Ngang' }, 
    { id: 'minimal', label: 'Minimal' },
    { id: 'comparison', label: 'So sánh' },
    { id: 'featured', label: 'Nổi bật' },
    { id: 'compact', label: 'Gọn' }
  ];

  // Config defaults
  const subtitle = config?.subtitle || 'Chọn gói phù hợp với nhu cầu của bạn';
  const showBillingToggle = config?.showBillingToggle ?? true;
  const monthlyLabel = config?.monthlyLabel || 'Hàng tháng';
  const yearlyLabel = config?.yearlyLabel || 'Hàng năm';
  const yearlySavingText = config?.yearlySavingText || 'Tiết kiệm 17%';

  // Get display price based on billing period
  const getPrice = (plan: PricingPlan) => {
    if (isYearly && plan.yearlyPrice) return plan.yearlyPrice;
    return plan.price || '0';
  };
  const getPeriod = () => isYearly ? '/năm' : '/tháng';

  // Empty state
  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16 text-slate-400">
      <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: `${brandColor}10` }}>
        <Tag size={32} style={{ color: brandColor }} />
      </div>
      <p className="text-sm font-medium">Chưa có gói nào</p>
      <p className="text-xs mt-1">Thêm gói để xem preview</p>
    </div>
  );

  // Billing Toggle Component (ARIA accessible)
  const BillingToggle = () => showBillingToggle ? (
    <div className="flex items-center justify-center gap-3 mb-6">
      <span className={cn("text-sm font-medium transition-colors", !isYearly ? 'text-slate-900 dark:text-white' : 'text-slate-400')}>
        {monthlyLabel}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={isYearly}
        onClick={() => setIsYearly(!isYearly)}
        className={cn(
          "relative w-12 h-6 rounded-full transition-colors",
          isYearly ? '' : 'bg-slate-200 dark:bg-slate-700'
        )}
        style={isYearly ? { backgroundColor: brandColor } : {}}
      >
        <span className={cn(
          "absolute top-1 w-4 h-4 bg-white rounded-full transition-transform shadow-sm",
          isYearly ? 'translate-x-7' : 'translate-x-1'
        )} />
      </button>
      <span className={cn("text-sm font-medium transition-colors", isYearly ? 'text-slate-900 dark:text-white' : 'text-slate-400')}>
        {yearlyLabel}
      </span>
      {isYearly && yearlySavingText && (
        <span className="px-2 py-0.5 text-xs font-medium rounded-full text-white" style={{ backgroundColor: brandColor }}>
          {yearlySavingText}
        </span>
      )}
    </div>
  ) : null;

  // Centered layout helper for few items
  const getGridClass = (count: number) => {
    if (device === 'mobile') return 'grid-cols-1';
    if (device === 'tablet') return count <= 2 ? 'grid-cols-2' : 'grid-cols-2';
    if (count === 1) return 'grid-cols-1 max-w-md mx-auto';
    if (count === 2) return 'grid-cols-2 max-w-2xl mx-auto';
    return 'grid-cols-3';
  };

  // Style 1: Cards - Classic pricing cards with feature list
  const renderCardsStyle = () => {
    if (plans.length === 0) return renderEmptyState();
    const displayPlans = plans.slice(0, 6);
    return (
      <div className={cn("py-8 px-4", device === 'mobile' ? 'py-6' : '')}>
        <h3 className={cn("font-bold text-center mb-2", device === 'mobile' ? 'text-lg' : 'text-xl')}>Bảng giá dịch vụ</h3>
        <p className="text-center text-sm text-slate-500 mb-4">{subtitle}</p>
        <BillingToggle />
        <div className={cn("grid gap-4", getGridClass(displayPlans.length))}>
          {displayPlans.map((plan) => (
            <div 
              key={plan.id} 
              className={cn(
                "bg-white dark:bg-slate-800 rounded-xl border-2 relative flex flex-col h-full",
                device === 'mobile' ? 'p-4' : 'p-5',
                plan.isPopular ? "shadow-lg" : ""
              )} 
              style={{ 
                borderColor: plan.isPopular ? brandColor : '#e2e8f0',
                transform: plan.isPopular && device === 'desktop' ? 'scale(1.02)' : undefined
              }}
            >
              {plan.isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-medium text-white whitespace-nowrap" style={{ backgroundColor: brandColor }}>
                  Phổ biến
                </div>
              )}
              <h4 className="font-semibold text-center line-clamp-1">{plan.name || 'Tên gói'}</h4>
              <div className="text-center my-4">
                <span className={cn("font-bold tabular-nums", device === 'mobile' ? 'text-2xl' : 'text-3xl')} style={{ color: brandColor }}>
                  {getPrice(plan)}đ
                </span>
                <span className="text-sm text-slate-500">{getPeriod()}</span>
              </div>
              <ul className="space-y-2 mb-4 flex-1 min-h-[80px]">
                {(plan.features.length > 0 ? plan.features : ['Tính năng 1', 'Tính năng 2']).slice(0, 5).map((f, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <Check size={14} className="flex-shrink-0 mt-0.5" style={{ color: brandColor }} />
                    <span className="line-clamp-1">{f}</span>
                  </li>
                ))}
              </ul>
              <button 
                className={cn("w-full py-2.5 rounded-lg font-medium text-sm transition-opacity hover:opacity-90", plan.isPopular ? "text-white" : "border-2")} 
                style={plan.isPopular ? { backgroundColor: brandColor } : { borderColor: brandColor, color: brandColor }}
              >
                {plan.buttonText || 'Chọn gói'}
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Style 2: Horizontal - Compact horizontal rows
  const renderHorizontalStyle = () => {
    if (plans.length === 0) return renderEmptyState();
    return (
      <div className={cn("py-8 px-4", device === 'mobile' ? 'py-6' : '')}>
        <h3 className={cn("font-bold text-center mb-2", device === 'mobile' ? 'text-lg' : 'text-xl')}>Bảng giá dịch vụ</h3>
        <p className="text-center text-sm text-slate-500 mb-4">{subtitle}</p>
        <BillingToggle />
        <div className="space-y-3 max-w-3xl mx-auto">
          {plans.slice(0, 5).map((plan) => (
            <div 
              key={plan.id} 
              className={cn(
                "bg-white dark:bg-slate-800 rounded-xl p-4 border-2 flex items-center justify-between transition-all",
                device === 'mobile' ? 'flex-col gap-3 text-center' : ''
              )} 
              style={{ borderColor: plan.isPopular ? brandColor : '#e2e8f0' }}
            >
              <div className={cn(device === 'mobile' ? '' : 'flex items-center gap-3 min-w-0 flex-1')}>
                <h4 className="font-semibold truncate">{plan.name || 'Tên gói'}</h4>
                {plan.isPopular && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium text-white flex-shrink-0" style={{ backgroundColor: brandColor }}>
                    Hot
                  </span>
                )}
              </div>
              <div className={cn("text-sm text-slate-500 truncate", device === 'mobile' ? '' : 'flex-1 text-center')}>
                {(plan.features.length > 0 ? plan.features : ['Tính năng']).slice(0, 2).join(' • ')}
              </div>
              <div className={cn("flex items-center gap-4", device === 'mobile' ? 'flex-col gap-2' : 'flex-shrink-0')}>
                <span className="font-bold text-lg tabular-nums whitespace-nowrap" style={{ color: brandColor }}>
                  {getPrice(plan)}đ<span className="text-sm font-normal text-slate-500">{getPeriod()}</span>
                </span>
                <button className="px-4 py-2 rounded-lg text-sm text-white font-medium whitespace-nowrap" style={{ backgroundColor: brandColor }}>
                  {plan.buttonText || 'Chọn'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Style 3: Minimal - Clean list style
  const renderMinimalStyle = () => {
    if (plans.length === 0) return renderEmptyState();
    return (
      <div className={cn("py-10 px-4", device === 'mobile' ? 'py-6' : '')}>
        <h3 className={cn("font-bold text-center mb-2", device === 'mobile' ? 'text-lg' : 'text-xl')}>Bảng giá dịch vụ</h3>
        <p className="text-center text-sm text-slate-500 mb-4">{subtitle}</p>
        <BillingToggle />
        <div className={cn("max-w-3xl mx-auto", device === 'mobile' ? '' : 'border rounded-2xl overflow-hidden')}>
          {plans.slice(0, 5).map((plan, idx) => (
            <div 
              key={plan.id} 
              className={cn(
                "flex items-center gap-4 p-5 bg-white dark:bg-slate-800 transition-all relative",
                device === 'mobile' ? 'flex-col text-center rounded-xl border mb-3' : '',
                device !== 'mobile' && idx !== Math.min(plans.length, 5) - 1 && 'border-b'
              )} 
              style={plan.isPopular ? { backgroundColor: `${brandColor}08` } : {}}
            >
              {plan.isPopular && (
                <div 
                  className={cn(
                    "absolute px-3 py-1 rounded-full text-xs font-medium text-white",
                    device === 'mobile' ? '-top-2 left-1/2 -translate-x-1/2' : 'top-3 right-4'
                  )} 
                  style={{ backgroundColor: brandColor }}
                >
                  Phổ biến
                </div>
              )}
              <div className={cn("flex-1 min-w-0", device === 'mobile' ? 'pt-2' : '')}>
                <h4 className="font-semibold text-base truncate">{plan.name || 'Tên gói'}</h4>
                <div className="text-xs text-slate-500 truncate">
                  {(plan.features.length > 0 ? plan.features : ['Tính năng']).slice(0, 2).join(' • ')}
                </div>
              </div>
              <div className={cn("flex items-center gap-4", device === 'mobile' ? 'flex-col gap-3 mt-3' : '')}>
                <span className="text-2xl font-bold tabular-nums whitespace-nowrap" style={{ color: brandColor }}>
                  {getPrice(plan)}đ<span className="text-sm text-slate-500">{getPeriod()}</span>
                </span>
                <button 
                  className={cn("px-5 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap", plan.isPopular ? "text-white shadow-md" : "border-2")} 
                  style={plan.isPopular ? { backgroundColor: brandColor } : { borderColor: brandColor, color: brandColor }}
                >
                  {plan.buttonText || 'Chọn gói'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Style 4: Comparison - Feature comparison table
  const renderComparisonStyle = () => {
    if (plans.length === 0) return renderEmptyState();
    const displayPlans = plans.slice(0, device === 'mobile' ? 2 : 4);
    const allFeatures = [...new Set(displayPlans.flatMap(p => p.features))].slice(0, 8);
    
    return (
      <div className={cn("py-8 px-4", device === 'mobile' ? 'py-6 px-2' : '')}>
        <h3 className={cn("font-bold text-center mb-2", device === 'mobile' ? 'text-lg' : 'text-xl')}>So sánh các gói</h3>
        <p className="text-center text-sm text-slate-500 mb-4">{subtitle}</p>
        <BillingToggle />
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="p-3 text-left text-sm font-medium text-slate-500 border-b">Tính năng</th>
                {displayPlans.map((plan) => (
                  <th 
                    key={plan.id} 
                    className={cn("p-3 text-center border-b min-w-[120px]", device === 'mobile' ? 'text-xs' : 'text-sm')}
                    style={plan.isPopular ? { backgroundColor: `${brandColor}08` } : {}}
                  >
                    <div className="font-semibold">{plan.name || 'Gói'}</div>
                    <div className="font-bold mt-1" style={{ color: brandColor }}>
                      {getPrice(plan)}đ
                    </div>
                    {plan.isPopular && (
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium text-white" style={{ backgroundColor: brandColor }}>
                        Khuyên dùng
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allFeatures.map((feature, fIdx) => (
                <tr key={fIdx} className={fIdx % 2 === 0 ? 'bg-slate-50 dark:bg-slate-800/50' : ''}>
                  <td className="p-3 text-sm border-b">{feature}</td>
                  {displayPlans.map((plan) => (
                    <td 
                      key={plan.id} 
                      className="p-3 text-center border-b"
                      style={plan.isPopular ? { backgroundColor: `${brandColor}05` } : {}}
                    >
                      {plan.features.includes(feature) ? (
                        <Check size={18} className="mx-auto" style={{ color: brandColor }} />
                      ) : (
                        <X size={18} className="mx-auto text-slate-300" />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td className="p-3"></td>
                {displayPlans.map((plan) => (
                  <td key={plan.id} className="p-3 text-center" style={plan.isPopular ? { backgroundColor: `${brandColor}08` } : {}}>
                    <button 
                      className={cn("px-4 py-2 rounded-lg text-sm font-medium w-full", plan.isPopular ? "text-white" : "border-2")} 
                      style={plan.isPopular ? { backgroundColor: brandColor } : { borderColor: brandColor, color: brandColor }}
                    >
                      {plan.buttonText || 'Chọn'}
                    </button>
                  </td>
                ))}
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    );
  };

  // Style 5: Featured - One plan highlighted large
  const renderFeaturedStyle = () => {
    if (plans.length === 0) return renderEmptyState();
    const popularPlan = plans.find(p => p.isPopular) || plans[0];
    const otherPlans = plans.filter(p => p.id !== popularPlan.id).slice(0, 2);
    
    return (
      <div className={cn("py-8 px-4", device === 'mobile' ? 'py-6' : '')}>
        <h3 className={cn("font-bold text-center mb-2", device === 'mobile' ? 'text-lg' : 'text-xl')}>Bảng giá dịch vụ</h3>
        <p className="text-center text-sm text-slate-500 mb-4">{subtitle}</p>
        <BillingToggle />
        
        <div className={cn("max-w-4xl mx-auto", device === 'mobile' ? '' : 'flex gap-6 items-stretch')}>
          {/* Featured Plan */}
          <div 
            className={cn(
              "bg-white dark:bg-slate-800 rounded-2xl border-2 relative flex flex-col",
              device === 'mobile' ? 'p-5 mb-4' : 'p-8 flex-1'
            )}
            style={{ 
              borderColor: brandColor,
              boxShadow: `0 8px 30px ${brandColor}20`
            }}
          >
            <div 
              className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold text-white"
              style={{ backgroundColor: brandColor }}
            >
              ★ Phổ biến nhất
            </div>
            <h4 className={cn("font-bold text-center", device === 'mobile' ? 'text-lg mt-2' : 'text-xl mt-4')}>
              {popularPlan.name || 'Gói phổ biến'}
            </h4>
            <div className="text-center my-6">
              <span className={cn("font-bold tabular-nums", device === 'mobile' ? 'text-3xl' : 'text-4xl')} style={{ color: brandColor }}>
                {getPrice(popularPlan)}đ
              </span>
              <span className="text-slate-500">{getPeriod()}</span>
            </div>
            <ul className="space-y-3 mb-6 flex-1">
              {(popularPlan.features.length > 0 ? popularPlan.features : ['Tính năng 1', 'Tính năng 2', 'Tính năng 3']).slice(0, 6).map((f, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <Check size={18} className="flex-shrink-0 mt-0.5" style={{ color: brandColor }} />
                  <span className="line-clamp-1">{f}</span>
                </li>
              ))}
            </ul>
            <button 
              className="w-full py-3 rounded-xl font-semibold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: brandColor, boxShadow: `0 4px 12px ${brandColor}40` }}
            >
              {popularPlan.buttonText || 'Bắt đầu ngay'}
            </button>
          </div>

          {/* Other Plans */}
          {otherPlans.length > 0 && (
            <div className={cn("flex gap-4", device === 'mobile' ? 'flex-col' : 'flex-col justify-center w-64')}>
              {otherPlans.map((plan) => (
                <div 
                  key={plan.id}
                  className="bg-white dark:bg-slate-800 rounded-xl border p-4 flex flex-col"
                  style={{ borderColor: `${brandColor}20` }}
                >
                  <h5 className="font-semibold text-sm">{plan.name || 'Gói'}</h5>
                  <div className="my-2">
                    <span className="font-bold text-lg tabular-nums" style={{ color: brandColor }}>
                      {getPrice(plan)}đ
                    </span>
                    <span className="text-xs text-slate-500">{getPeriod()}</span>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2 flex-1 mb-3">
                    {plan.features.slice(0, 2).join(', ') || 'Các tính năng cơ bản'}
                  </p>
                  <button 
                    className="w-full py-2 rounded-lg text-sm font-medium border-2"
                    style={{ borderColor: brandColor, color: brandColor }}
                  >
                    {plan.buttonText || 'Chọn'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Style 6: Compact - Small dense cards
  const renderCompactStyle = () => {
    if (plans.length === 0) return renderEmptyState();
    const displayPlans = plans.slice(0, device === 'mobile' ? 4 : 6);
    
    return (
      <div className={cn("py-8 px-4", device === 'mobile' ? 'py-6' : '')}>
        <h3 className={cn("font-bold text-center mb-2", device === 'mobile' ? 'text-lg' : 'text-xl')}>Bảng giá dịch vụ</h3>
        <p className="text-center text-sm text-slate-500 mb-4">{subtitle}</p>
        <BillingToggle />
        
        <div className={cn(
          "grid gap-3",
          device === 'mobile' ? 'grid-cols-2' : device === 'tablet' ? 'grid-cols-3' : 'grid-cols-3 max-w-3xl mx-auto'
        )}>
          {displayPlans.map((plan) => (
            <div 
              key={plan.id}
              className={cn(
                "bg-white dark:bg-slate-800 rounded-lg border-2 p-3 relative flex flex-col text-center",
                plan.isPopular && "ring-2 ring-offset-2"
              )}
              style={{ 
                borderColor: plan.isPopular ? brandColor : '#e2e8f0',
                ...(plan.isPopular && { ringColor: brandColor })
              }}
            >
              {plan.isPopular && (
                <div 
                  className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded text-[10px] font-bold text-white"
                  style={{ backgroundColor: brandColor }}
                >
                  HOT
                </div>
              )}
              <h5 className="font-semibold text-sm truncate mt-1">{plan.name || 'Gói'}</h5>
              <div className="my-2">
                <span className={cn("font-bold tabular-nums", device === 'mobile' ? 'text-lg' : 'text-xl')} style={{ color: brandColor }}>
                  {getPrice(plan)}đ
                </span>
                <span className="text-[10px] text-slate-500 block">{getPeriod()}</span>
              </div>
              <p className="text-[11px] text-slate-500 line-clamp-2 min-h-[2rem] mb-2">
                {plan.features.slice(0, 2).join(', ') || 'Tính năng cơ bản'}
              </p>
              <button 
                className={cn(
                  "w-full py-1.5 rounded text-xs font-medium mt-auto",
                  plan.isPopular ? "text-white" : "border"
                )}
                style={plan.isPopular ? { backgroundColor: brandColor } : { borderColor: brandColor, color: brandColor }}
              >
                {plan.buttonText || 'Chọn'}
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Style hints for each style
  const getStyleHint = () => {
    const hints: Record<PricingStyle, string> = {
      cards: 'Classic cards với feature list đầy đủ, phù hợp 2-4 gói',
      horizontal: 'Dạng hàng ngang gọn, phù hợp hiển thị nhiều gói',
      minimal: 'Tối giản dạng list, phù hợp trang đơn giản',
      comparison: 'Bảng so sánh tính năng chi tiết giữa các gói',
      featured: 'Highlight 1 gói phổ biến, các gói khác nhỏ hơn',
      compact: 'Cards nhỏ gọn, phù hợp sidebar hoặc nhiều gói'
    };
    return hints[previewStyle];
  };

  return (
    <PreviewWrapper 
      title="Preview Pricing" 
      device={device} 
      setDevice={setDevice} 
      previewStyle={previewStyle} 
      setPreviewStyle={setPreviewStyle} 
      styles={styles} 
      info={`${plans.length} gói • ${getStyleHint()}`}
    >
      <BrowserFrame url="yoursite.com/pricing">
        {previewStyle === 'cards' && renderCardsStyle()}
        {previewStyle === 'horizontal' && renderHorizontalStyle()}
        {previewStyle === 'minimal' && renderMinimalStyle()}
        {previewStyle === 'comparison' && renderComparisonStyle()}
        {previewStyle === 'featured' && renderFeaturedStyle()}
        {previewStyle === 'compact' && renderCompactStyle()}
      </BrowserFrame>
    </PreviewWrapper>
  );
};

// ============ GALLERY/PARTNERS PREVIEW ============
// Gallery: 6 Professional Styles (Spotlight, Explore, Stories, Grid, Marquee, Masonry)
// Partners: 6 Professional Styles (Grid, Marquee, Mono, Badge, Carousel, Featured)
type GalleryItem = { id: number; url: string; link: string };
export type GalleryStyle = 'spotlight' | 'explore' | 'stories' | 'grid' | 'marquee' | 'masonry' | 'mono' | 'badge' | 'carousel' | 'featured';

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

// Lightbox Component for Gallery - with Arrow Keys Navigation
const GalleryLightbox = ({ 
  photo, 
  onClose,
  photos,
  currentIndex,
  onNavigate
}: { 
  photo: { url: string } | null; 
  onClose: () => void;
  photos?: Array<{ url: string }>;
  currentIndex?: number;
  onNavigate?: (direction: 'prev' | 'next') => void;
}) => {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && onNavigate) onNavigate('prev');
      if (e.key === 'ArrowRight' && onNavigate) onNavigate('next');
    };
    if (photo) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [photo, onClose, onNavigate]);

  if (!photo || !photo.url) return null;

  const hasMultiple = photos && photos.length > 1 && onNavigate;

  return (
    <div 
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 backdrop-blur-sm animate-in fade-in duration-200" 
      onClick={onClose}
    >
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-white/50 hover:text-white transition-colors z-[70]"
        aria-label="Đóng"
      >
        <X size={24} />
      </button>
      
      {/* Navigation Arrows */}
      {hasMultiple && (
        <>
          <button 
            onClick={(e) => { e.stopPropagation(); onNavigate('prev'); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors z-[70]"
            aria-label="Ảnh trước"
          >
            <ChevronLeft size={24} className="text-white" />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onNavigate('next'); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors z-[70]"
            aria-label="Ảnh sau"
          >
            <ChevronRight size={24} className="text-white" />
          </button>
        </>
      )}
      
      {/* Counter */}
      {hasMultiple && typeof currentIndex === 'number' && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-sm z-[70]">
          {currentIndex + 1} / {photos.length}
        </div>
      )}
      
      <div className="w-full h-full p-4 flex flex-col items-center justify-center" onClick={e => e.stopPropagation()}>
        <img 
          src={photo.url} 
          alt="Lightbox" 
          className="max-h-[90vh] max-w-full object-contain shadow-sm animate-in zoom-in-95 duration-300" 
        />
      </div>
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
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryItem | null>(null);
  const [carouselIndex, setCarouselIndex] = useState(0); // For carousel style pagination
  const previewStyle = selectedStyle || (componentType === 'Gallery' ? 'spotlight' : 'grid');
  const setPreviewStyle = (s: string) => onStyleChange?.(s as GalleryStyle);
  
  // Lightbox navigation handler
  const handleLightboxNavigate = (direction: 'prev' | 'next') => {
    if (!selectedPhoto) return;
    const currentIdx = items.findIndex(item => item.id === selectedPhoto.id);
    if (currentIdx === -1) return;
    const newIdx = direction === 'prev' 
      ? (currentIdx - 1 + items.length) % items.length 
      : (currentIdx + 1) % items.length;
    setSelectedPhoto(items[newIdx]);
  };

  // Get current photo index for lightbox
  const currentPhotoIndex = selectedPhoto ? items.findIndex(item => item.id === selectedPhoto.id) : -1;

  // Styles phụ thuộc vào componentType - Gallery có 6 styles BẮT BUỘC
  const styles = componentType === 'Gallery' 
    ? [
        { id: 'spotlight', label: 'Tiêu điểm' }, 
        { id: 'explore', label: 'Khám phá' },
        { id: 'stories', label: 'Câu chuyện' },
        { id: 'grid', label: 'Grid' },
        { id: 'marquee', label: 'Marquee' },
        { id: 'masonry', label: 'Masonry' }
      ]
    : componentType === 'Partners' 
    ? [
        { id: 'grid', label: 'Grid' }, 
        { id: 'marquee', label: 'Marquee' }, 
        { id: 'mono', label: 'Mono' },
        { id: 'badge', label: 'Badge' },
        { id: 'carousel', label: 'Carousel' },
        { id: 'featured', label: 'Featured' }
      ]
    : [
        { id: 'grid', label: 'Grid' }, 
        { id: 'marquee', label: 'Marquee' }
      ];

  // ============ GALLERY STYLES (Spotlight, Explore, Stories) ============
  
  // Style 1: Tiêu điểm (Spotlight) - Featured image with 3 smaller
  const renderSpotlightStyle = () => {
    if (items.length === 0) return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-400">
        <ImageIcon size={48} className="opacity-20 mb-4" />
        <p className="text-sm font-light">Chưa có hình ảnh nào.</p>
      </div>
    );
    const featured = items[0];
    const sub = items.slice(1, 4);

    return (
      <div className={cn(
        "grid gap-1 bg-slate-200 dark:bg-slate-700 border border-transparent",
        device === 'mobile' ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3'
      )}>
        <div 
          className={cn(
            "bg-slate-100 dark:bg-slate-800 relative group cursor-pointer overflow-hidden",
            device === 'mobile' ? 'aspect-[4/3]' : 'md:col-span-2 aspect-[4/3] md:aspect-auto md:row-span-1'
          )}
          style={device !== 'mobile' ? { minHeight: '300px' } : {}}
          onClick={() => setSelectedPhoto(featured)}
        >
          {featured.url ? (
            <img src={featured.url} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
          ) : (
            <div className="w-full h-full flex items-center justify-center"><ImageIcon size={48} className="text-slate-300" /></div>
          )}
        </div>
        <div className={cn(
          "grid gap-1",
          device === 'mobile' ? 'grid-cols-3' : 'grid-cols-1'
        )}>
          {sub.map((photo) => (
            <div 
              key={photo.id} 
              className="aspect-square bg-slate-100 dark:bg-slate-800 relative group cursor-pointer overflow-hidden"
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
    );
  };

  // Style 2: Khám phá (Explore) - Instagram-like grid
  const renderExploreStyle = () => {
    if (items.length === 0) return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-400">
        <ImageIcon size={48} className="opacity-20 mb-4" />
        <p className="text-sm font-light">Chưa có hình ảnh nào.</p>
      </div>
    );

    return (
      <div className={cn(
        "grid gap-0.5 bg-slate-200 dark:bg-slate-700",
        device === 'mobile' ? 'grid-cols-3' : device === 'tablet' ? 'grid-cols-4' : 'grid-cols-5'
      )}>
        {items.map((photo) => (
          <div 
            key={photo.id} 
            className="aspect-square relative group cursor-pointer overflow-hidden bg-slate-100 dark:bg-slate-800"
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
    );
  };

  // Style 3: Câu chuyện (Stories) - Masonry-like with varying sizes
  const renderStoriesStyle = () => {
    if (items.length === 0) return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-400">
        <ImageIcon size={48} className="opacity-20 mb-4" />
        <p className="text-sm font-light">Chưa có hình ảnh nào.</p>
      </div>
    );

    return (
      <div className={cn(
        "grid gap-4",
        device === 'mobile' ? 'grid-cols-1 auto-rows-[200px]' : 'grid-cols-1 md:grid-cols-3 auto-rows-[250px] md:auto-rows-[300px]'
      )}>
        {items.map((photo, i) => {
          const isLarge = i % 4 === 0 || i % 4 === 3;
          const colSpan = device !== 'mobile' && isLarge ? "md:col-span-2" : "md:col-span-1";
          
          return (
            <div 
              key={photo.id} 
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
                <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <ImageIcon size={32} className="text-slate-300" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // ============ GALLERY STYLES 4-6 (Grid, Marquee, Masonry) ============
  // Best Practices: Lightbox with keyboard nav, lazy loading, +N pattern

  // Gallery Empty State with brandColor
  const renderGalleryEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: `${brandColor}10` }}>
        <ImageIcon size={32} style={{ color: brandColor }} />
      </div>
      <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-1">Chưa có hình ảnh nào</h3>
      <p className="text-sm text-slate-500">Thêm ảnh đầu tiên để bắt đầu</p>
    </div>
  );

  // Style 4: Gallery Grid - Clean equal squares grid
  const renderGalleryGridStyle = () => {
    if (items.length === 0) return renderGalleryEmptyState();

    const MAX_VISIBLE = device === 'mobile' ? 6 : device === 'tablet' ? 9 : 12;
    const visibleItems = items.slice(0, MAX_VISIBLE);
    const remainingCount = items.length - MAX_VISIBLE;

    // Centered layout for 1-2 items
    if (items.length <= 2) {
      return (
        <div className="py-8 px-4">
          <div className={cn("mx-auto flex items-center justify-center gap-4", items.length === 1 ? 'max-w-sm' : 'max-w-xl')}>
            {items.map((photo) => (
              <div 
                key={photo.id} 
                className="flex-1 aspect-square rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 cursor-pointer group"
                onClick={() => setSelectedPhoto(photo)}
              >
                {photo.url ? (
                  <img src={photo.url} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><ImageIcon size={40} className="text-slate-300" /></div>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="py-8 px-4">
        <div className={cn(
          "grid gap-2",
          device === 'mobile' ? 'grid-cols-2' : device === 'tablet' ? 'grid-cols-3' : 'grid-cols-4'
        )}>
          {visibleItems.map((photo) => (
            <div 
              key={photo.id} 
              className="aspect-square rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 cursor-pointer group relative"
              onClick={() => setSelectedPhoto(photo)}
            >
              {photo.url ? (
                <img src={photo.url} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              ) : (
                <div className="w-full h-full flex items-center justify-center"><ImageIcon size={28} className="text-slate-300" /></div>
              )}
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
            </div>
          ))}
          {/* +N remaining */}
          {remainingCount > 0 && (
            <div 
              className="aspect-square rounded-lg overflow-hidden flex flex-col items-center justify-center cursor-pointer"
              style={{ backgroundColor: `${brandColor}10` }}
            >
              <Plus size={28} style={{ color: brandColor }} className="mb-1" />
              <span className="text-lg font-bold" style={{ color: brandColor }}>+{remainingCount}</span>
              <span className="text-xs text-slate-500">ảnh khác</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Style 5: Gallery Marquee - Auto scroll horizontal
  const renderGalleryMarqueeStyle = () => {
    if (items.length === 0) return renderGalleryEmptyState();

    return (
      <div className="py-8">
        <div className="w-full relative" onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}>
          <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-white dark:from-slate-900 to-transparent z-10 pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-white dark:from-slate-900 to-transparent z-10 pointer-events-none"></div>
          <AutoScrollSlider speed={0.6} isPaused={isPaused}>
            {items.map((photo) => (
              <div 
                key={`gallery-marquee-${photo.id}`} 
                className="shrink-0 h-48 md:h-64 aspect-[4/3] rounded-xl overflow-hidden cursor-pointer group"
                onClick={() => setSelectedPhoto(photo)}
              >
                {photo.url ? (
                  <img src={photo.url} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <ImageIcon size={32} className="text-slate-300" />
                  </div>
                )}
              </div>
            ))}
          </AutoScrollSlider>
        </div>
      </div>
    );
  };

  // Style 6: Gallery Masonry - Pinterest-like varying heights
  const renderGalleryMasonryStyle = () => {
    if (items.length === 0) return renderGalleryEmptyState();

    const MAX_VISIBLE = device === 'mobile' ? 6 : 10;
    const visibleItems = items.slice(0, MAX_VISIBLE);
    const remainingCount = items.length - MAX_VISIBLE;

    // Centered layout for 1-2 items
    if (items.length <= 2) {
      return (
        <div className="py-8 px-4">
          <div className={cn("mx-auto flex items-center justify-center gap-4", items.length === 1 ? 'max-w-md' : 'max-w-2xl')}>
            {items.map((photo, idx) => (
              <div 
                key={photo.id} 
                className={cn("flex-1 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 cursor-pointer group", idx % 2 === 0 ? 'aspect-[3/4]' : 'aspect-[4/3]')}
                onClick={() => setSelectedPhoto(photo)}
              >
                {photo.url ? (
                  <img src={photo.url} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><ImageIcon size={40} className="text-slate-300" /></div>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }

    // Masonry layout with CSS columns
    return (
      <div className="py-8 px-4">
        <div className={cn(
          "gap-3",
          device === 'mobile' ? 'columns-2' : device === 'tablet' ? 'columns-3' : 'columns-4'
        )}>
          {visibleItems.map((photo, idx) => {
            // Varying heights for masonry effect
            const heights = ['h-48', 'h-64', 'h-56', 'h-72', 'h-52', 'h-60'];
            const heightClass = heights[idx % heights.length];
            
            return (
              <div 
                key={photo.id} 
                className={cn("mb-3 break-inside-avoid rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 cursor-pointer group relative", heightClass)}
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
        {/* +N remaining */}
        {remainingCount > 0 && (
          <div className="flex items-center justify-center mt-4">
            <span className="text-sm font-medium px-4 py-2 rounded-full" style={{ backgroundColor: `${brandColor}10`, color: brandColor }}>
              +{remainingCount} ảnh khác
            </span>
          </div>
        )}
      </div>
    );
  };

  // ============ PARTNERS STYLES (Grid, Marquee, Mono, Badge, Carousel, Featured) ============
  // Compact spacing, larger logos (+10%), no hover effects

  // Style 1: Classic Grid - Clean responsive grid
  const renderGridStyle = () => {
    if (items.length === 0) {
      return (
        <section className="w-full py-6 bg-white dark:bg-slate-900">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-14 h-14 rounded-full flex items-center justify-center mb-3" style={{ backgroundColor: `${brandColor}10` }}>
              <Building2 size={28} style={{ color: brandColor }} />
            </div>
            <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-1">Chưa có đối tác nào</h3>
            <p className="text-sm text-slate-500">Thêm logo đối tác đầu tiên</p>
          </div>
        </section>
      );
    }

    const MAX_VISIBLE = device === 'mobile' ? 4 : 8;
    const visibleItems = items.slice(0, MAX_VISIBLE);
    const remainingCount = items.length - MAX_VISIBLE;

    if (items.length <= 2) {
      return (
        <section className="w-full py-6 bg-white dark:bg-slate-900 border-b border-slate-200/40 dark:border-slate-700/40">
          <div className="w-full max-w-7xl mx-auto px-4 md:px-6 space-y-4">
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 text-center">Đối tác</h2>
            <div className={cn("mx-auto flex items-center justify-center gap-6", items.length === 1 ? 'max-w-xs' : 'max-w-md')}>
              {items.map((item) => (
                <a key={item.id} href={item.link || '#'} target="_blank" rel="noopener noreferrer" className="p-4 rounded-lg border" style={{ borderColor: `${brandColor}15` }}>
                  {item.url ? <img src={item.url} alt="" className="h-14 w-auto object-contain" /> : <ImageIcon size={44} className="text-slate-300" />}
                </a>
              ))}
            </div>
          </div>
        </section>
      );
    }

    return (
      <section className="w-full py-6 bg-white dark:bg-slate-900 border-b border-slate-200/40 dark:border-slate-700/40">
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6 space-y-4">
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 relative pl-3">
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-full" style={{ backgroundColor: brandColor }}></span>
            Đối tác
          </h2>
          <div className={cn(
            "grid gap-3 items-center justify-items-center",
            device === 'mobile' ? 'grid-cols-2' : device === 'tablet' ? 'grid-cols-4' : 'grid-cols-4 lg:grid-cols-8'
          )}>
            {visibleItems.map((item) => (
              <a key={item.id} href={item.link || '#'} target="_blank" rel="noopener noreferrer"
                className="w-full flex items-center justify-center p-3 rounded-lg border" style={{ borderColor: `${brandColor}10` }}>
                {item.url ? <img src={item.url} alt="" className="h-11 w-auto object-contain" /> : <ImageIcon size={36} className="text-slate-300" />}
              </a>
            ))}
            {remainingCount > 0 && (
              <div className="w-full flex flex-col items-center justify-center p-3 rounded-lg border" style={{ borderColor: `${brandColor}20`, backgroundColor: `${brandColor}05` }}>
                <Plus size={20} style={{ color: brandColor }} />
                <span className="text-xs font-bold" style={{ color: brandColor }}>+{remainingCount}</span>
              </div>
            )}
          </div>
        </div>
      </section>
    );
  };

  // Style 2: Marquee - Auto scroll
  const renderMarqueeStyle = () => {
    if (items.length === 0) {
      return (
        <section className="w-full py-6 bg-white dark:bg-slate-900">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-14 h-14 rounded-full flex items-center justify-center mb-3" style={{ backgroundColor: `${brandColor}10` }}>
              <Building2 size={28} style={{ color: brandColor }} />
            </div>
            <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-1">Chưa có đối tác nào</h3>
            <p className="text-sm text-slate-500">Thêm logo đối tác đầu tiên</p>
          </div>
        </section>
      );
    }

    return (
      <section className="w-full py-6 bg-white dark:bg-slate-900 border-b border-slate-200/40 dark:border-slate-700/40">
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6 space-y-4">
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 relative pl-3">
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-full" style={{ backgroundColor: brandColor }}></span>
            Đối tác
          </h2>
          <div className="w-full relative py-4" onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}>
            <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-white dark:from-slate-900 to-transparent z-10 pointer-events-none"></div>
            <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white dark:from-slate-900 to-transparent z-10 pointer-events-none"></div>
            <AutoScrollSlider speed={0.8} isPaused={isPaused}>
              {items.map((item) => (
                <a key={`marquee-${item.id}`} href={item.link || '#'} target="_blank" rel="noopener noreferrer" className="shrink-0">
                  {item.url ? <img src={item.url} alt="" className="h-12 w-auto object-contain select-none" /> : <div className="h-12 w-24 bg-slate-200 dark:bg-slate-700 rounded flex items-center justify-center"><ImageIcon size={24} className="text-slate-400" /></div>}
                </a>
              ))}
            </AutoScrollSlider>
          </div>
        </div>
      </section>
    );
  };

  // Style 3: Mono - Grayscale scroll
  const renderMonoStyle = () => {
    if (items.length === 0) {
      return (
        <section className="w-full py-6 bg-white dark:bg-slate-900">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-14 h-14 rounded-full flex items-center justify-center mb-3" style={{ backgroundColor: `${brandColor}10` }}>
              <Building2 size={28} style={{ color: brandColor }} />
            </div>
            <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-1">Chưa có đối tác nào</h3>
            <p className="text-sm text-slate-500">Thêm logo đối tác đầu tiên</p>
          </div>
        </section>
      );
    }

    return (
      <section className="w-full py-6 bg-white dark:bg-slate-900 border-b border-slate-200/40 dark:border-slate-700/40">
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6 space-y-4">
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 relative pl-3">
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-full" style={{ backgroundColor: brandColor }}></span>
            Đối tác
          </h2>
          <div className="w-full relative py-3" onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}>
            <AutoScrollSlider speed={0.5} isPaused={isPaused}>
              {items.map((item) => (
                <a key={`mono-${item.id}`} href={item.link || '#'} target="_blank" rel="noopener noreferrer" className="shrink-0">
                  {item.url ? <img src={item.url} alt="" className="h-11 w-auto object-contain grayscale opacity-60 select-none" /> : <div className="h-11 w-24 bg-slate-200 dark:bg-slate-700 rounded flex items-center justify-center opacity-50"><ImageIcon size={22} className="text-slate-400" /></div>}
                </a>
              ))}
            </AutoScrollSlider>
          </div>
        </div>
      </section>
    );
  };

  // Style 4: Badge - Compact badges with name
  const renderBadgeStyle = () => {
    if (items.length === 0) {
      return (
        <section className="w-full py-6 bg-white dark:bg-slate-900">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-14 h-14 rounded-full flex items-center justify-center mb-3" style={{ backgroundColor: `${brandColor}10` }}>
              <Building2 size={28} style={{ color: brandColor }} />
            </div>
            <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-1">Chưa có đối tác nào</h3>
            <p className="text-sm text-slate-500">Thêm logo đối tác đầu tiên</p>
          </div>
        </section>
      );
    }

    const MAX_VISIBLE = device === 'mobile' ? 4 : 6;
    const visibleItems = items.slice(0, MAX_VISIBLE);
    const remainingCount = items.length - MAX_VISIBLE;

    return (
      <section className="w-full py-6 bg-white dark:bg-slate-900 border-b border-slate-200/40 dark:border-slate-700/40">
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6 space-y-4">
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 relative pl-3">
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-full" style={{ backgroundColor: brandColor }}></span>
            Đối tác
          </h2>
          <div className="w-full flex flex-wrap items-center justify-center gap-2">
            {visibleItems.map((item, idx) => (
              <a key={item.id} href={item.link || '#'} target="_blank" rel="noopener noreferrer"
                className="px-3 py-2 rounded-lg border flex items-center gap-2"
                style={{ backgroundColor: `${brandColor}05`, borderColor: `${brandColor}15` }}>
                {item.url ? <img src={item.url} alt="" className="h-6 w-auto" /> : <ImageIcon size={20} className="text-slate-400" />}
                <span className="text-xs font-semibold truncate max-w-[100px]" style={{ color: `${brandColor}cc` }}>
                  {(item as GalleryItem & { name?: string }).name || `Đối tác ${idx + 1}`}
                </span>
              </a>
            ))}
            {remainingCount > 0 && (
              <div className="px-3 py-2 rounded-lg border flex items-center gap-2" style={{ backgroundColor: `${brandColor}08`, borderColor: `${brandColor}20` }}>
                <Plus size={14} style={{ color: brandColor }} />
                <span className="text-xs font-bold" style={{ color: brandColor }}>+{remainingCount}</span>
              </div>
            )}
          </div>
        </div>
      </section>
    );
  };

  // Style 5: Carousel - Paginated grid with navigation
  const renderCarouselStyle = () => {
    const itemsPerPage = device === 'mobile' ? 2 : device === 'tablet' ? 4 : 6;
    const totalPages = Math.ceil(items.length / itemsPerPage);
    
    if (items.length === 0) {
      return (
        <section className="w-full py-6 bg-white dark:bg-slate-900">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-14 h-14 rounded-full flex items-center justify-center mb-3" style={{ backgroundColor: `${brandColor}10` }}>
              <Building2 size={28} style={{ color: brandColor }} />
            </div>
            <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-1">Chưa có đối tác nào</h3>
            <p className="text-sm text-slate-500">Thêm logo đối tác đầu tiên</p>
          </div>
        </section>
      );
    }

    const visibleItems = items.slice(carouselIndex * itemsPerPage, (carouselIndex + 1) * itemsPerPage);
    const canPrev = carouselIndex > 0;
    const canNext = carouselIndex < totalPages - 1;

    return (
      <section className="w-full py-6 bg-white dark:bg-slate-900 border-b border-slate-200/40 dark:border-slate-700/40">
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 relative pl-3">
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-full" style={{ backgroundColor: brandColor }}></span>
              Đối tác
            </h2>
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button onClick={() => setCarouselIndex(prev => Math.max(0, prev - 1))} disabled={!canPrev}
                  className="w-8 h-8 rounded-full border flex items-center justify-center disabled:opacity-30"
                  style={{ borderColor: `${brandColor}30`, color: brandColor }}>
                  <ChevronLeft size={16} />
                </button>
                <span className="text-xs font-medium text-slate-500 tabular-nums">{carouselIndex + 1}/{totalPages}</span>
                <button onClick={() => setCarouselIndex(prev => Math.min(totalPages - 1, prev + 1))} disabled={!canNext}
                  className="w-8 h-8 rounded-full border flex items-center justify-center disabled:opacity-30"
                  style={{ borderColor: `${brandColor}30`, color: brandColor }}>
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
          <div className={cn("grid gap-3 items-center", device === 'mobile' ? 'grid-cols-2' : device === 'tablet' ? 'grid-cols-4' : 'grid-cols-6')}>
            {visibleItems.map((item) => (
              <a key={item.id} href={item.link || '#'} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center p-3 rounded-lg border aspect-[3/2]"
                style={{ borderColor: `${brandColor}15`, backgroundColor: `${brandColor}03` }}>
                {item.url ? <img src={item.url} alt="" className="h-11 w-auto object-contain" /> : <ImageIcon size={32} className="text-slate-300" />}
              </a>
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1">
              {Array.from({ length: totalPages }).map((_, idx) => (
                <button key={idx} onClick={() => setCarouselIndex(idx)}
                  className={cn("h-1.5 rounded-full", idx === carouselIndex ? "w-5" : "w-1.5 bg-slate-200 dark:bg-slate-700")}
                  style={idx === carouselIndex ? { backgroundColor: brandColor } : {}} />
              ))}
            </div>
          )}
        </div>
      </section>
    );
  };

  // Style 6: Featured - Large featured + smaller grid
  const renderFeaturedStyle = () => {
    if (items.length === 0) {
      return (
        <section className="w-full py-6 bg-white dark:bg-slate-900">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-14 h-14 rounded-full flex items-center justify-center mb-3" style={{ backgroundColor: `${brandColor}10` }}>
              <Building2 size={28} style={{ color: brandColor }} />
            </div>
            <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-1">Chưa có đối tác nào</h3>
            <p className="text-sm text-slate-500">Thêm logo đối tác đầu tiên</p>
          </div>
        </section>
      );
    }

    const featured = items[0];
    const others = items.slice(1, device === 'mobile' ? 5 : 7);
    const MAX_OTHERS = device === 'mobile' ? 4 : 6;
    const remainingCount = Math.max(0, items.length - 1 - MAX_OTHERS);

    if (items.length <= 2) {
      return (
        <section className="w-full py-6 bg-white dark:bg-slate-900 border-b border-slate-200/40 dark:border-slate-700/40">
          <div className="w-full max-w-7xl mx-auto px-4 md:px-6 space-y-4">
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 text-center">Đối tác</h2>
            <div className={cn("mx-auto flex items-center justify-center gap-6", items.length === 1 ? 'max-w-xs' : 'max-w-md')}>
              {items.map((item) => (
                <a key={item.id} href={item.link || '#'} target="_blank" rel="noopener noreferrer"
                  className="p-5 rounded-xl border" style={{ borderColor: `${brandColor}20` }}>
                  {item.url ? <img src={item.url} alt="" className="h-16 w-auto object-contain" /> : <ImageIcon size={56} className="text-slate-300" />}
                </a>
              ))}
            </div>
          </div>
        </section>
      );
    }

    return (
      <section className="w-full py-6 bg-white dark:bg-slate-900 border-b border-slate-200/40 dark:border-slate-700/40">
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6 space-y-4">
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 relative pl-3">
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-full" style={{ backgroundColor: brandColor }}></span>
            Đối tác
          </h2>
          <div className={cn("grid gap-3", device === 'mobile' ? 'grid-cols-1' : 'grid-cols-3')}>
            <a href={featured.link || '#'} target="_blank" rel="noopener noreferrer"
              className={cn("relative rounded-xl border overflow-hidden", device === 'mobile' ? 'aspect-video' : 'row-span-2 aspect-square')}
              style={{ borderColor: `${brandColor}20`, background: `linear-gradient(135deg, ${brandColor}08 0%, ${brandColor}03 100%)` }}>
              <div className="absolute top-2 left-2">
                <span className="px-2 py-0.5 text-[10px] font-bold rounded" style={{ backgroundColor: `${brandColor}15`, color: brandColor }}>NỔI BẬT</span>
              </div>
              <div className="w-full h-full flex items-center justify-center p-6">
                {featured.url ? <img src={featured.url} alt="" className="max-h-28 w-auto object-contain" /> : <ImageIcon size={56} className="text-slate-300" />}
              </div>
            </a>
            <div className={cn("grid gap-2", device === 'mobile' ? 'grid-cols-2' : 'col-span-2 grid-cols-3')}>
              {others.slice(0, MAX_OTHERS).map((item) => (
                <a key={item.id} href={item.link || '#'} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center p-3 rounded-lg border aspect-[3/2]" style={{ borderColor: `${brandColor}15` }}>
                  {item.url ? <img src={item.url} alt="" className="h-9 w-auto object-contain" /> : <ImageIcon size={28} className="text-slate-300" />}
                </a>
              ))}
              {remainingCount > 0 && (
                <div className="flex flex-col items-center justify-center rounded-lg border aspect-[3/2]" style={{ borderColor: `${brandColor}20`, backgroundColor: `${brandColor}05` }}>
                  <Plus size={20} style={{ color: brandColor }} />
                  <span className="text-sm font-bold" style={{ color: brandColor }}>+{remainingCount}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    );
  };

  // Render Gallery styles with container and Lightbox (with keyboard navigation)
  const renderGalleryContent = () => (
    <section className="w-full bg-white dark:bg-slate-900">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-[1600px] py-8 md:py-12">
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-700 ease-out">
          {previewStyle === 'spotlight' && renderSpotlightStyle()}
          {previewStyle === 'explore' && renderExploreStyle()}
          {previewStyle === 'stories' && renderStoriesStyle()}
          {previewStyle === 'grid' && renderGalleryGridStyle()}
          {previewStyle === 'marquee' && renderGalleryMarqueeStyle()}
          {previewStyle === 'masonry' && renderGalleryMasonryStyle()}
        </div>
      </div>
      <GalleryLightbox 
        photo={selectedPhoto} 
        onClose={() => setSelectedPhoto(null)}
        photos={items}
        currentIndex={currentPhotoIndex}
        onNavigate={handleLightboxNavigate}
      />
    </section>
  );

  // Generate image size info based on style and item count
  const getGalleryImageSizeInfo = () => {
    if (componentType !== 'Gallery') return `${items.length} logo`;
    
    const count = items.length;
    switch (previewStyle) {
      case 'spotlight':
        if (count === 0) return 'Chưa có ảnh';
        if (count === 1) return 'Ảnh 1: 1200×800px (3:2)';
        if (count <= 4) return `Ảnh 1: 1200×800px • Ảnh 2-${count}: 600×600px`;
        return `Ảnh 1: 1200×800px • Ảnh 2-4: 600×600px (+${count - 4} ảnh)`;
      case 'explore':
        return `${count} ảnh • Tất cả: 600×600px (1:1)`;
      case 'stories':
        if (count === 0) return 'Chưa có ảnh';
        const largeCount = Math.ceil(count / 4) * 2; // ảnh 1,4,5,8... chiếm 2 cột
        const smallCount = count - largeCount;
        return `${largeCount} ảnh lớn: 1200×600px • ${smallCount} ảnh nhỏ: 800×600px`;
      case 'grid':
        return `${count} ảnh • Tất cả: 800×800px (1:1)`;
      case 'marquee':
        return `${count} ảnh • Tất cả: 800×600px (4:3)`;
      case 'masonry':
        return `${count} ảnh • Ngang: 600×400px • Dọc: 600×900px • Vuông: 600×600px`;
      default:
        return `${count} ảnh`;
    }
  };

  return (
    <PreviewWrapper 
      title={`Preview ${componentType === 'Gallery' ? 'Thư viện ảnh' : componentType}`} 
      device={device} 
      setDevice={setDevice} 
      previewStyle={previewStyle} 
      setPreviewStyle={setPreviewStyle} 
      styles={styles} 
      info={getGalleryImageSizeInfo()}
    >
      <BrowserFrame>
        {componentType === 'Gallery' ? (
          renderGalleryContent()
        ) : (
          <>
            {previewStyle === 'grid' && renderGridStyle()}
            {previewStyle === 'marquee' && renderMarqueeStyle()}
            {previewStyle === 'mono' && renderMonoStyle()}
            {previewStyle === 'badge' && renderBadgeStyle()}
            {previewStyle === 'carousel' && renderCarouselStyle()}
            {previewStyle === 'featured' && renderFeaturedStyle()}
          </>
        )}
      </BrowserFrame>
    </PreviewWrapper>
  );
};

// ============ SERVICES/BENEFITS PREVIEW ============
// Professional Services UI/UX - 6 Variants: Elegant Grid, Modern List, Big Number, Cards, Carousel, Timeline
type ServiceItem = { id: number; icon: string; title: string; description: string };
export type ServicesStyle = 'elegantGrid' | 'modernList' | 'bigNumber' | 'cards' | 'carousel' | 'timeline';

// Dynamic Icon component for Services
const ServiceIcon = ({ name, size = 24, className, style }: { name: string; size?: number; className?: string; style?: React.CSSProperties }) => {
  const icons: Record<string, React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>> = {
    Briefcase, Shield, Package, Star, Users, Phone, Target, Zap, Globe, Rocket, Settings, Layers, Cpu, Clock, MapPin, Mail, Building2, Check, HelpCircle, FileText
  };
  const IconComponent = icons[name] || Star;
  return <IconComponent size={size} className={className} style={style} />;
};

export const ServicesPreview = ({ items, brandColor, componentType, selectedStyle, onStyleChange }: { items: ServiceItem[]; brandColor: string; componentType: 'Services' | 'Benefits'; selectedStyle?: ServicesStyle; onStyleChange?: (style: ServicesStyle) => void }) => {
  const [device, setDevice] = useState<PreviewDevice>('desktop');
  const [carouselIndex, setCarouselIndex] = useState(0);
  const previewStyle = selectedStyle || 'elegantGrid';
  const setPreviewStyle = (s: string) => onStyleChange?.(s as ServicesStyle);
  const styles = [
    { id: 'elegantGrid', label: 'Elegant Grid' }, 
    { id: 'modernList', label: 'Modern List' }, 
    { id: 'bigNumber', label: 'Big Number' },
    { id: 'cards', label: 'Icon Cards' },
    { id: 'carousel', label: 'Carousel' },
    { id: 'timeline', label: 'Timeline' }
  ];
  const titles = { Services: 'Dịch vụ của chúng tôi', Benefits: 'Tại sao chọn chúng tôi' };

  // Empty State
  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: `${brandColor}10` }}>
        <Briefcase size={32} style={{ color: brandColor }} />
      </div>
      <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-1">Chưa có {componentType === 'Services' ? 'dịch vụ' : 'lợi ích'} nào</h3>
      <p className="text-sm text-slate-500">Thêm mục đầu tiên để bắt đầu</p>
    </div>
  );

  // Get visible items with "+N" pattern
  const MAX_VISIBLE = device === 'mobile' ? 3 : device === 'tablet' ? 4 : 6;
  const visibleItems = items.slice(0, MAX_VISIBLE);
  const remainingCount = Math.max(0, items.length - MAX_VISIBLE);

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

  // Style 4: Icon Cards - Cards with prominent icon
  const renderCardsStyle = () => {
    if (items.length === 0) return renderEmptyState();
    if (items.length <= 2) {
      return (
        <div className="w-full max-w-4xl mx-auto space-y-6 py-8 px-4">
          <h2 className={cn("font-bold tracking-tight text-slate-900 dark:text-slate-100 text-center", device === 'mobile' ? 'text-2xl' : 'text-3xl')}>{titles[componentType]}</h2>
          <div className={cn("mx-auto flex justify-center gap-6", items.length === 1 ? 'max-w-sm' : 'max-w-2xl')}>
            {items.map((item) => (
              <div key={item.id} className="flex-1 bg-white dark:bg-slate-800 rounded-2xl p-6 border shadow-sm" style={{ borderColor: `${brandColor}15` }}>
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: `${brandColor}10` }}>
                  <ServiceIcon name={item.icon} size={28} style={{ color: brandColor }} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">{item.title || 'Tiêu đề'}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{item.description || 'Mô tả...'}</p>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return (
      <div className="w-full max-w-6xl mx-auto space-y-8 py-8 px-4">
        <div className="text-center space-y-2">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider" style={{ backgroundColor: `${brandColor}15`, color: brandColor }}>{componentType === 'Services' ? 'Dịch vụ' : 'Lợi ích'}</span>
          <h2 className={cn("font-bold tracking-tight text-slate-900 dark:text-slate-100", device === 'mobile' ? 'text-2xl' : 'text-3xl md:text-4xl')}>{titles[componentType]}</h2>
        </div>
        <div className={cn("grid gap-5", device === 'mobile' ? 'grid-cols-1' : device === 'tablet' ? 'grid-cols-2' : 'grid-cols-3')}>
          {visibleItems.map((item) => (
            <div key={item.id} className="group bg-white dark:bg-slate-800 rounded-2xl p-6 border transition-all hover:shadow-lg" style={{ borderColor: `${brandColor}15` }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${brandColor}40`; e.currentTarget.style.boxShadow = `0 8px 30px ${brandColor}15`; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = `${brandColor}15`; e.currentTarget.style.boxShadow = 'none'; }}>
              <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110" style={{ backgroundColor: `${brandColor}10` }}>
                <ServiceIcon name={item.icon} size={28} style={{ color: brandColor }} />
              </div>
              <h3 className={cn("font-bold text-slate-900 dark:text-slate-100 mb-2", device === 'mobile' ? 'text-base' : 'text-lg')}>{item.title || 'Tiêu đề'}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2 min-h-[2.5rem]">{item.description || 'Mô tả dịch vụ...'}</p>
            </div>
          ))}
          {remainingCount > 0 && (
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6" style={{ borderColor: `${brandColor}30` }}>
              <Plus size={28} style={{ color: brandColor }} className="mb-2" />
              <span className="text-lg font-bold" style={{ color: brandColor }}>+{remainingCount}</span>
              <span className="text-xs text-slate-500">mục khác</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Style 5: Carousel - Horizontal scroll with navigation
  const renderCarouselStyle = () => {
    if (items.length === 0) return renderEmptyState();
    const itemsPerPage = device === 'mobile' ? 1 : device === 'tablet' ? 2 : 3;
    const totalPages = Math.ceil(items.length / itemsPerPage);
    const startIdx = carouselIndex * itemsPerPage;
    const pageItems = items.slice(startIdx, startIdx + itemsPerPage);

    return (
      <div className="w-full max-w-6xl mx-auto space-y-6 py-8 px-4">
        <div className="flex items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-700 pb-4">
          <h2 className={cn("font-bold tracking-tight text-slate-900 dark:text-slate-100", device === 'mobile' ? 'text-xl' : 'text-2xl md:text-3xl')}>{titles[componentType]}</h2>
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button onClick={() => setCarouselIndex(prev => Math.max(0, prev - 1))} disabled={carouselIndex === 0} className="w-9 h-9 rounded-full border flex items-center justify-center disabled:opacity-30" style={{ borderColor: `${brandColor}30`, color: brandColor }}><ChevronLeft size={18} /></button>
              <button onClick={() => setCarouselIndex(prev => Math.min(totalPages - 1, prev + 1))} disabled={carouselIndex === totalPages - 1} className="w-9 h-9 rounded-full border flex items-center justify-center disabled:opacity-30" style={{ borderColor: `${brandColor}30`, color: brandColor }}><ChevronRight size={18} /></button>
            </div>
          )}
        </div>
        <div className={cn("grid gap-5", device === 'mobile' ? 'grid-cols-1' : device === 'tablet' ? 'grid-cols-2' : 'grid-cols-3')}>
          {pageItems.map((item) => (
            <div key={item.id} className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden border shadow-sm" style={{ borderColor: `${brandColor}15` }}>
              <div className="h-2 w-full" style={{ background: `linear-gradient(to right, ${brandColor}66, ${brandColor})` }} />
              <div className="p-5">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${brandColor}10` }}>
                    <ServiceIcon name={item.icon} size={24} style={{ color: brandColor }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-1 truncate">{item.title || 'Tiêu đề'}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{item.description || 'Mô tả...'}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        {totalPages > 1 && (
          <div className="flex justify-center gap-1.5">
            {Array.from({ length: totalPages }).map((_, idx) => (
              <button key={idx} onClick={() => setCarouselIndex(idx)} className={cn("h-1.5 rounded-full transition-all", idx === carouselIndex ? "w-6" : "w-1.5 bg-slate-200 dark:bg-slate-700")} style={idx === carouselIndex ? { backgroundColor: brandColor } : {}} />
            ))}
          </div>
        )}
      </div>
    );
  };

  // Style 6: Timeline - Vertical timeline layout
  const renderTimelineStyle = () => {
    if (items.length === 0) return renderEmptyState();
    return (
      <div className="w-full max-w-4xl mx-auto space-y-8 py-8 px-4">
        <div className="text-center space-y-2">
          <h2 className={cn("font-bold tracking-tight text-slate-900 dark:text-slate-100", device === 'mobile' ? 'text-2xl' : 'text-3xl md:text-4xl')}>{titles[componentType]}</h2>
        </div>
        <div className="relative">
          <div className="absolute left-4 md:left-1/2 md:-translate-x-px top-0 bottom-0 w-0.5" style={{ backgroundColor: `${brandColor}20` }} />
          <div className="space-y-6">
            {visibleItems.map((item, idx) => (
              <div key={item.id} className={cn("relative flex", device !== 'mobile' && idx % 2 === 0 ? 'md:flex-row-reverse' : '')}>
                <div className="absolute left-4 md:left-1/2 md:-translate-x-1/2 w-10 h-10 rounded-full border-4 bg-white dark:bg-slate-800 flex items-center justify-center z-10" style={{ borderColor: brandColor }}>
                  <ServiceIcon name={item.icon} size={18} style={{ color: brandColor }} />
                </div>
                <div className={cn("ml-20 md:ml-0 md:w-5/12 bg-white dark:bg-slate-800 rounded-xl p-4 border shadow-sm", device !== 'mobile' && idx % 2 === 0 ? 'md:mr-auto md:ml-8' : 'md:ml-auto md:mr-8')} style={{ borderColor: `${brandColor}15` }}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-bold tabular-nums" style={{ color: brandColor }}>{String(idx + 1).padStart(2, '0')}</span>
                    <h3 className="font-bold text-slate-900 dark:text-slate-100">{item.title || 'Tiêu đề'}</h3>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{item.description || 'Mô tả...'}</p>
                </div>
              </div>
            ))}
            {remainingCount > 0 && (
              <div className="relative flex">
                <div className="absolute left-4 md:left-1/2 md:-translate-x-1/2 w-10 h-10 rounded-full border-2 border-dashed bg-white dark:bg-slate-800 flex items-center justify-center z-10" style={{ borderColor: `${brandColor}40` }}>
                  <Plus size={18} style={{ color: brandColor }} />
                </div>
                <div className="ml-20 md:ml-auto md:mr-8 md:w-5/12 text-sm font-medium" style={{ color: brandColor }}>+{remainingCount} mục khác</div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <PreviewWrapper title={`Preview ${componentType}`} device={device} setDevice={setDevice} previewStyle={previewStyle} setPreviewStyle={setPreviewStyle} styles={styles} info={`${items.length} mục`}>
      <BrowserFrame>
        {items.length === 0 ? renderEmptyState() : (
          <>
            {previewStyle === 'elegantGrid' && renderElegantGridStyle()}
            {previewStyle === 'modernList' && renderModernListStyle()}
            {previewStyle === 'bigNumber' && renderBigNumberStyle()}
            {previewStyle === 'cards' && renderCardsStyle()}
            {previewStyle === 'carousel' && renderCarouselStyle()}
            {previewStyle === 'timeline' && renderTimelineStyle()}
          </>
        )}
      </BrowserFrame>
    </PreviewWrapper>
  );
};

// ============ PRODUCT/SERVICE LIST PREVIEW ============
// Professional Product Showcase UI/UX - 6 Variants
// Style: Commerce Card, Luxury Minimal, Bento Grid, Carousel, Compact, Showcase
export type ProductListStyle = 'minimal' | 'commerce' | 'bento' | 'carousel' | 'compact' | 'showcase';
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

export const ProductListPreview = ({ brandColor, itemCount, componentType, selectedStyle, onStyleChange, items, subTitle = 'Bộ sưu tập', sectionTitle }: { 
  brandColor: string; 
  itemCount: number; 
  componentType: 'ProductList' | 'ServiceList'; 
  selectedStyle?: ProductListStyle; 
  onStyleChange?: (style: ProductListStyle) => void;
  items?: ProductListPreviewItem[];
  subTitle?: string;
  sectionTitle?: string;
}) => {
  // Use sectionTitle if provided, otherwise use default based on componentType
  const displayTitle = sectionTitle || (componentType === 'ProductList' ? 'Sản phẩm nổi bật' : 'Dịch vụ nổi bật');
  const buttonText = 'Xem tất cả';
  const [device, setDevice] = useState<PreviewDevice>('desktop');
  const previewStyle = selectedStyle || 'commerce';
  const setPreviewStyle = (s: string) => onStyleChange?.(s as ProductListStyle);
  const styles = [
    { id: 'commerce', label: 'Commerce' },
    { id: 'minimal', label: 'Minimal' },
    { id: 'bento', label: 'Bento' },
    { id: 'carousel', label: 'Carousel' },
    { id: 'compact', label: 'Compact' },
    { id: 'showcase', label: 'Showcase' }
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
              {subTitle}
            </div>
            <h2 className={cn("font-bold tracking-tight text-slate-900 dark:text-slate-100", device === 'mobile' ? 'text-2xl' : 'text-2xl md:text-4xl')}>
              {displayTitle}
            </h2>
          </div>
          {/* Mobile View All */}
          <button className="md:hidden p-0 h-auto font-semibold mb-1 gap-1 flex items-center" style={{ color: brandColor }}>
            {buttonText} <ArrowRight size={16} />
          </button>
        </div>
        {/* Desktop View All */}
        <button className="hidden md:flex gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 pl-6 border-l border-slate-200 dark:border-slate-700 transition-colors items-center">
          {buttonText} <ArrowRight size={16} />
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
              {subTitle}
            </div>
            <h2 className={cn("font-bold tracking-tight text-slate-900 dark:text-slate-100", device === 'mobile' ? 'text-2xl' : 'text-2xl md:text-4xl')}>
              {displayTitle}
            </h2>
          </div>
          <button className="md:hidden p-0 h-auto font-semibold mb-1 gap-1 flex items-center" style={{ color: brandColor }}>
            {buttonText} <ArrowRight size={16} />
          </button>
        </div>
        <button className="hidden md:flex gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 pl-6 border-l border-slate-200 dark:border-slate-700 transition-colors items-center">
          {buttonText} <ArrowRight size={16} />
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
                {subTitle}
              </div>
              <h2 className={cn("font-bold tracking-tight text-slate-900 dark:text-slate-100", device === 'mobile' ? 'text-2xl' : 'text-2xl md:text-4xl')}>
                {displayTitle}
              </h2>
            </div>
            <button className="md:hidden p-0 h-auto font-semibold mb-1 gap-1 flex items-center" style={{ color: brandColor }}>
              {buttonText} <ArrowRight size={16} />
            </button>
          </div>
          <button className="hidden md:flex gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 pl-6 border-l border-slate-200 dark:border-slate-700 transition-colors items-center">
            {buttonText} <ArrowRight size={16} />
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

  // Style 4: Carousel - Horizontal scrollable với arrows
  const renderCarouselStyle = () => (
      <section className={cn("py-8 md:py-10", device === 'mobile' ? 'px-3' : 'px-4 md:px-6')}>
        {/* Section Header */}
        <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-end md:justify-between md:mb-8">
          <div className="flex items-end justify-between w-full md:w-auto">
            <div className="space-y-1 md:space-y-2">
              <div className="flex items-center gap-2 font-bold text-xs md:text-sm uppercase tracking-widest" style={{ color: brandColor }}>
                <span className="w-6 h-[2px] md:w-8" style={{ backgroundColor: brandColor }}></span>
                {subTitle}
              </div>
              <h2 className={cn("font-bold tracking-tight text-slate-900 dark:text-slate-100", device === 'mobile' ? 'text-2xl' : 'text-2xl md:text-4xl')}>
                {displayTitle}
              </h2>
            </div>
            <div className="flex gap-2 md:hidden">
              <button className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800">
                <ChevronLeft size={16} />
              </button>
              <button className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <button className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <ChevronLeft size={18} />
            </button>
            <button className="w-10 h-10 rounded-full flex items-center justify-center text-white transition-colors" style={{ backgroundColor: brandColor }}>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Carousel */}
        <div className="relative overflow-hidden -mx-3 md:-mx-4 px-3 md:px-4">
          <div className={cn("flex gap-4", device === 'mobile' ? 'gap-3' : 'gap-5')}>
            {displayItems.slice(0, 6).map((item) => {
              const discount = getDiscount(item.price, item.originalPrice);
              return (
                <div 
                  key={item.id}
                  className={cn(
                    "flex-shrink-0 group cursor-pointer",
                    device === 'mobile' ? 'w-[160px]' : device === 'tablet' ? 'w-[220px]' : 'w-[260px]'
                  )}
                >
                  <div className="relative aspect-square overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800 mb-3 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center"><Package size={40} className="text-slate-300" /></div>
                    )}
                    {discount && (
                      <span className="absolute top-2 left-2 px-2 py-1 text-[10px] font-bold text-white rounded" style={{ backgroundColor: brandColor }}>{discount}</span>
                    )}
                  </div>
                  <h3 className="font-medium text-slate-900 dark:text-slate-100 text-sm truncate group-hover:opacity-80 transition-colors">{item.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-bold text-sm" style={{ color: brandColor }}>{item.price}</span>
                    {item.originalPrice && <span className="text-xs text-slate-400 line-through">{item.originalPrice}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dots indicator */}
        <div className="flex justify-center gap-2 mt-6">
          {[0, 1, 2].map((i) => (
            <button key={i} className={cn("h-2 rounded-full transition-all", i === 0 ? "w-6" : "w-2 bg-slate-200 dark:bg-slate-700")} style={i === 0 ? { backgroundColor: brandColor } : {}} />
          ))}
        </div>
      </section>
  );

  // Style 5: Compact - Dense grid với smaller cards, nhiều sản phẩm hơn
  const renderCompactStyle = () => (
    <section className={cn("py-8 md:py-10", device === 'mobile' ? 'px-3' : 'px-4 md:px-6')}>
      {/* Section Header */}
      <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-end md:justify-between md:mb-8">
        <div className="flex items-end justify-between w-full md:w-auto">
          <div className="space-y-1 md:space-y-2">
            <div className="flex items-center gap-2 font-bold text-xs md:text-sm uppercase tracking-widest" style={{ color: brandColor }}>
              <span className="w-6 h-[2px] md:w-8" style={{ backgroundColor: brandColor }}></span>
              {subTitle}
            </div>
            <h2 className={cn("font-bold tracking-tight text-slate-900 dark:text-slate-100", device === 'mobile' ? 'text-2xl' : 'text-2xl md:text-4xl')}>
              {displayTitle}
            </h2>
          </div>
          <button className="md:hidden p-0 h-auto font-semibold mb-1 gap-1 flex items-center" style={{ color: brandColor }}>
            {buttonText} <ArrowRight size={16} />
          </button>
        </div>
        <button className="hidden md:flex gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 pl-6 border-l border-slate-200 dark:border-slate-700 transition-colors items-center">
          {buttonText} <ArrowRight size={16} />
        </button>
      </div>

      {/* Compact Grid - More items, smaller cards */}
      <div className={cn(
        "grid gap-3",
        device === 'mobile' ? 'grid-cols-2' : device === 'tablet' ? 'grid-cols-4' : 'grid-cols-6'
      )}>
        {displayItems.slice(0, device === 'mobile' ? 6 : 6).map((item) => {
          const discount = getDiscount(item.price, item.originalPrice);
          return (
            <div key={item.id} className="group cursor-pointer bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700 p-2 hover:shadow-md hover:border-slate-200 dark:hover:border-slate-600 transition-all">
              <div className="relative aspect-square overflow-hidden rounded-md bg-slate-50 dark:bg-slate-700 mb-2">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center"><Package size={24} className="text-slate-300" /></div>
                )}
                {discount && (
                  <span className="absolute top-1 left-1 px-1.5 py-0.5 text-[9px] font-bold text-white rounded" style={{ backgroundColor: brandColor }}>{discount}</span>
                )}
              </div>
              <h3 className="font-medium text-xs text-slate-900 dark:text-slate-100 truncate group-hover:opacity-80 transition-colors">{item.name}</h3>
              <span className="font-bold text-xs mt-0.5 block" style={{ color: brandColor }}>{item.price}</span>
            </div>
          );
        })}
      </div>
    </section>
  );

  // Style 6: Showcase - Featured large item với grid nhỏ bên cạnh
  const renderShowcaseStyle = () => {
    const showcaseFeatured = displayItems[0];
    const showcaseOthers = displayItems.slice(1, 5);
    const featuredDiscount = getDiscount(showcaseFeatured?.price, showcaseFeatured?.originalPrice);

    return (
      <section className={cn("py-8 md:py-10", device === 'mobile' ? 'px-3' : 'px-4 md:px-6')}>
        {/* Section Header */}
        <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-end md:justify-between md:mb-8">
          <div className="flex items-end justify-between w-full md:w-auto">
            <div className="space-y-1 md:space-y-2">
              <div className="flex items-center gap-2 font-bold text-xs md:text-sm uppercase tracking-widest" style={{ color: brandColor }}>
                <span className="w-6 h-[2px] md:w-8" style={{ backgroundColor: brandColor }}></span>
                {subTitle}
              </div>
              <h2 className={cn("font-bold tracking-tight text-slate-900 dark:text-slate-100", device === 'mobile' ? 'text-2xl' : 'text-2xl md:text-4xl')}>
                {displayTitle}
              </h2>
            </div>
            <button className="md:hidden p-0 h-auto font-semibold mb-1 gap-1 flex items-center" style={{ color: brandColor }}>
              {buttonText} <ArrowRight size={16} />
            </button>
          </div>
          <button className="hidden md:flex gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 pl-6 border-l border-slate-200 dark:border-slate-700 transition-colors items-center">
            {buttonText} <ArrowRight size={16} />
          </button>
        </div>

        {/* Showcase Layout */}
        {device === 'mobile' ? (
          <div className="grid grid-cols-2 gap-3">
            {displayItems.slice(0, 4).map((item) => {
              const discount = getDiscount(item.price, item.originalPrice);
              return (
                <div key={item.id} className="group bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 flex flex-col cursor-pointer hover:shadow-md transition-all">
                  <div className="relative aspect-square w-full rounded-lg bg-slate-100 dark:bg-slate-700 overflow-hidden mb-2">
                    {item.image ? <img src={item.image} className="h-full w-full object-cover" alt={item.name} /> : <div className="h-full w-full flex items-center justify-center"><Package size={24} className="text-slate-300" /></div>}
                    {discount && <span className="absolute top-2 left-2 text-[10px] font-bold text-white px-1.5 py-0.5 rounded" style={{ backgroundColor: brandColor }}>{discount}</span>}
                  </div>
                  <h4 className="font-medium text-sm text-slate-900 dark:text-slate-100 truncate">{item.name}</h4>
                  <span className="text-sm font-bold mt-1" style={{ color: brandColor }}>{item.price}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className={cn("grid gap-4", device === 'tablet' ? 'grid-cols-2' : 'grid-cols-3')}>
            {/* Featured Large Item */}
            <div className="relative group rounded-2xl overflow-hidden cursor-pointer h-[400px] border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors" style={{ backgroundColor: `${brandColor}05` }}>
              {showcaseFeatured?.image ? (
                <img src={showcaseFeatured.image} alt={showcaseFeatured.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              ) : (
                <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-800"><Package size={64} className="text-slate-300" /></div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              {featuredDiscount && (
                <div className="absolute top-4 left-4 font-bold px-3 py-1 rounded-full text-sm shadow-lg text-white" style={{ backgroundColor: brandColor }}>{featuredDiscount}</div>
              )}
              <div className="absolute bottom-0 left-0 p-6 w-full">
                <span className="inline-block px-2 py-1 rounded text-xs font-medium text-white/90 mb-2" style={{ backgroundColor: `${brandColor}80` }}>Nổi bật</span>
                <h3 className="text-xl md:text-2xl font-bold text-white mb-2">{showcaseFeatured?.name}</h3>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-white">{showcaseFeatured?.price}</span>
                  <button className="px-4 py-2 rounded-lg text-white text-sm font-medium" style={{ backgroundColor: brandColor }}>Xem chi tiết</button>
                </div>
              </div>
            </div>

            {/* Right Grid - 2x2 */}
            <div className={cn("grid grid-cols-2 gap-3", device === 'desktop' && 'col-span-2')}>
              {showcaseOthers.map((item) => {
                const discount = getDiscount(item.price, item.originalPrice);
                return (
                  <div key={item.id} className="group bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 flex flex-col cursor-pointer hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600 transition-all">
                    <div className="relative aspect-square w-full rounded-lg bg-slate-50 dark:bg-slate-700 overflow-hidden mb-3">
                      {item.image ? <img src={item.image} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" alt={item.name} /> : <div className="h-full w-full flex items-center justify-center"><Package size={32} className="text-slate-300" /></div>}
                      {discount && <span className="absolute top-2 left-2 text-[10px] font-bold text-white px-1.5 py-0.5 rounded" style={{ backgroundColor: brandColor }}>{discount}</span>}
                    </div>
                    <h4 className="font-medium text-sm text-slate-900 dark:text-slate-100 truncate group-hover:opacity-80 transition-colors">{item.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-bold" style={{ color: brandColor }}>{item.price}</span>
                      {item.originalPrice && <span className="text-[10px] text-slate-400 line-through">{item.originalPrice}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
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
        {previewStyle === 'carousel' && renderCarouselStyle()}
        {previewStyle === 'compact' && renderCompactStyle()}
        {previewStyle === 'showcase' && renderShowcaseStyle()}
      </BrowserFrame>
    </PreviewWrapper>
  );
};

// ============ SERVICE LIST PREVIEW ============
// Luxury Services Gallery UI/UX - 6 Variants (added minimal & showcase)
export type ServiceListStyle = 'grid' | 'bento' | 'list' | 'carousel' | 'minimal' | 'showcase';
export interface ServiceListPreviewItem {
  id: string | number;
  name: string;
  image?: string;
  price?: string;
  description?: string;
  tag?: 'new' | 'hot';
}

// Badge component for service tags (uses brandColor for hot)
const ServiceBadge = ({ tag, brandColor }: { tag?: 'new' | 'hot'; brandColor?: string }) => {
  if (!tag) return null;
  if (tag === 'hot' && brandColor) {
    return (
      <span 
        className="inline-flex items-center rounded-sm px-2 py-1 text-[10px] font-medium uppercase tracking-widest text-white"
        style={{ backgroundColor: brandColor }}
      >
        Hot
      </span>
    );
  }
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

export const ServiceListPreview = ({ brandColor, itemCount, selectedStyle, onStyleChange, items, title: propTitle }: { 
  brandColor: string; 
  itemCount: number; 
  selectedStyle?: ServiceListStyle; 
  onStyleChange?: (style: ServiceListStyle) => void;
  items?: ServiceListPreviewItem[];
  title?: string;
}) => {
  const [device, setDevice] = useState<PreviewDevice>('desktop');
  const previewStyle = selectedStyle || 'grid';
  const setPreviewStyle = (s: string) => onStyleChange?.(s as ServiceListStyle);
  const title = propTitle || 'Dịch vụ';
  const styles = [
    { id: 'grid', label: 'Grid' }, 
    { id: 'bento', label: 'Bento' }, 
    { id: 'list', label: 'List' }, 
    { id: 'carousel', label: 'Carousel' },
    { id: 'minimal', label: 'Minimal' },
    { id: 'showcase', label: 'Showcase' }
  ];
  
  // Mock data for preview - always show at least 6 items
  const mockServices: ServiceListPreviewItem[] = [
    { id: 1, name: 'Thiết kế Nội thất Penthouse', description: 'Phong cách hiện đại, tối giản với vật liệu cao cấp nhập khẩu từ Ý.', price: '0', tag: 'hot' as const },
    { id: 2, name: 'Kiến trúc Xanh Vertical', description: 'Giải pháp bền vững cho đô thị.', price: '15000000', tag: 'new' as const },
    { id: 3, name: 'Cảnh quan Sân vườn Zen', description: 'Không gian thiền định tại gia.', price: '8500000' },
    { id: 4, name: 'Smart Home Hub', description: 'Tự động hóa toàn diện.', price: '25000000' },
    { id: 5, name: 'Biệt thự Cổ', description: 'Phục dựng di sản.', price: '0' },
    { id: 6, name: 'Lighting Art', description: 'Nghệ thuật ánh sáng.', price: '12000000', tag: 'new' as const }
  ];
  
  // Use real items if provided, otherwise fallback to mock (luxury services)
  const displayItems: ServiceListPreviewItem[] = items && items.length > 0 
    ? items 
    : mockServices;

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
            className="group cursor-pointer relative bg-white dark:bg-slate-800 border rounded-lg flex flex-col hover:-translate-y-1 transition-all duration-300 h-full p-3"
            style={{ borderColor: `${brandColor}10` }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${brandColor}30`; e.currentTarget.style.boxShadow = `0 4px 12px ${brandColor}10`; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = `${brandColor}10`; e.currentTarget.style.boxShadow = 'none'; }}
          >
            {/* Badge */}
            {item.tag && (
              <div className="absolute z-20 top-5 left-5">
                <ServiceBadge tag={item.tag} brandColor={brandColor} />
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
                <span className="text-sm font-semibold tracking-wide" style={{ color: brandColor }}>
                  {formatServicePrice(item.price)}
                </span>
                <ArrowUpRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" style={{ color: brandColor }} />
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
                <div 
                  className="h-full border rounded-xl p-3 transition-all flex flex-col"
                  style={{ borderColor: `${brandColor}15` }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${brandColor}40`; e.currentTarget.style.boxShadow = `0 4px 12px ${brandColor}10`; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = `${brandColor}15`; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  {item.tag && (
                    <div className="absolute z-20 top-4 left-4">
                      <ServiceBadge tag={item.tag} brandColor={brandColor} />
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
                  <span className="text-xs font-semibold mt-1" style={{ color: brandColor }}>{formatServicePrice(item.price)}</span>
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
                  <div 
                    className="h-full border rounded-xl p-4 transition-all flex flex-col cursor-pointer"
                    style={{ borderColor: `${brandColor}15`, boxShadow: i === 0 ? `0 4px 20px ${brandColor}08` : 'none' }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${brandColor}40`; e.currentTarget.style.boxShadow = `0 8px 24px ${brandColor}12`; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = `${brandColor}15`; e.currentTarget.style.boxShadow = i === 0 ? `0 4px 20px ${brandColor}08` : 'none'; }}
                  >
                    {item.tag && (
                      <div className="absolute z-20 top-6 left-6">
                        <ServiceBadge tag={item.tag} brandColor={brandColor} />
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
                        <span className="text-sm font-semibold tracking-wide" style={{ color: brandColor }}>
                          {formatServicePrice(item.price)}
                        </span>
                        <ArrowUpRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover/bento:opacity-100 group-hover/bento:translate-x-0 transition-all duration-300" style={{ color: brandColor }} />
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
            className="group cursor-pointer flex flex-row items-center gap-4 md:gap-6 py-4 border-b px-2 rounded-lg transition-all"
            style={{ borderColor: `${brandColor}10` }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = `${brandColor}05`; e.currentTarget.style.borderColor = `${brandColor}20`; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.borderColor = `${brandColor}10`; }}
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
                  <ServiceBadge tag={item.tag} brandColor={brandColor} />
                </div>
              )}
              <h3 className="font-medium text-base md:text-lg text-slate-900 dark:text-slate-100 leading-tight group-hover:opacity-70 transition-colors">
                {item.name}
              </h3>
              <div className="flex items-end justify-between mt-2">
                <span className="text-sm font-semibold tracking-wide" style={{ color: brandColor }}>
                  {formatServicePrice(item.price)}
                </span>
                <ArrowUpRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" style={{ color: brandColor }} />
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
            <div 
              className="group cursor-pointer relative bg-white dark:bg-slate-800 border rounded-xl p-3 flex flex-col hover:-translate-y-1 transition-all duration-300 h-full"
              style={{ borderColor: `${brandColor}10` }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${brandColor}30`; e.currentTarget.style.boxShadow = `0 8px 20px ${brandColor}12`; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = `${brandColor}10`; e.currentTarget.style.boxShadow = 'none'; }}
            >
              {/* Badge */}
              {item.tag && (
                <div className="absolute z-20 top-5 left-5">
                  <ServiceBadge tag={item.tag} brandColor={brandColor} />
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
                  <span className="text-sm font-semibold tracking-wide" style={{ color: brandColor }}>
                    {formatServicePrice(item.price)}
                  </span>
                  <ArrowUpRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" style={{ color: brandColor }} />
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

  // Style 5: Minimal - Clean typography-first design with subtle cards
  const renderMinimalStyle = () => (
    <section className="py-6 md:py-8 px-3 md:px-6">
      {/* Header */}
      <div className="flex flex-row items-center justify-between gap-3 border-b border-slate-200/40 dark:border-slate-700/40 pb-3 mb-6">
        <h2 className="text-xl md:text-2xl font-light tracking-tight text-slate-900 dark:text-slate-100">
          {title}
        </h2>
        <button className="group flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
          Xem tất cả 
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
      {/* Minimal Grid */}
      <div className={cn(
        "grid gap-6",
        device === 'mobile' ? 'grid-cols-1' : device === 'tablet' ? 'grid-cols-2' : 'grid-cols-3'
      )}>
        {displayItems.slice(0, device === 'mobile' ? 3 : 6).map((item) => (
          <div 
            key={item.id} 
            className="group cursor-pointer"
            onMouseEnter={(e) => { const img = e.currentTarget.querySelector('.img-wrapper'); if (img) (img as HTMLElement).style.boxShadow = `0 8px 24px ${brandColor}15`; }}
            onMouseLeave={(e) => { const img = e.currentTarget.querySelector('.img-wrapper'); if (img) (img as HTMLElement).style.boxShadow = 'none'; }}
          >
            {/* Image - More minimal, rounded corners */}
            <div className="img-wrapper relative overflow-hidden bg-slate-100 dark:bg-slate-800 rounded-2xl aspect-[3/2] mb-4 transition-shadow duration-300">
              {item.image ? (
                <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Briefcase size={40} className="text-slate-300 dark:text-slate-600" />
                </div>
              )}
              {item.tag && (
                <div className="absolute top-3 left-3">
                  <ServiceBadge tag={item.tag} brandColor={brandColor} />
                </div>
              )}
            </div>
            {/* Content - Typography focused */}
            <div className="space-y-2">
              <h3 className="font-medium text-lg text-slate-900 dark:text-slate-100 leading-snug group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
                {item.name}
              </h3>
              {item.description && (
                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{item.description}</p>
              )}
              <div className="flex items-center justify-between pt-2">
                <span className="text-base font-semibold" style={{ color: brandColor }}>{formatServicePrice(item.price)}</span>
                <span className="text-sm transition-colors flex items-center gap-1" style={{ color: `${brandColor}80` }}>
                  Chi tiết <ArrowUpRight className="w-4 h-4" style={{ color: brandColor }} />
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );

  // Style 6: Showcase - Featured large item + grid of smaller items
  const renderShowcaseStyle = () => {
    const featuredItem = displayItems[0];
    const otherItems = displayItems.slice(1, 5);
    return (
      <section className="py-6 md:py-8 px-3 md:px-6">
        {/* Header */}
        <div className="flex flex-row items-center justify-between gap-3 border-b border-slate-200/40 dark:border-slate-700/40 pb-3 mb-6">
          <h2 className="text-xl md:text-2xl font-light tracking-tight text-slate-900 dark:text-slate-100">{title}</h2>
          <button className="group flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
            Xem tất cả <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
        {/* Showcase Layout */}
        {device === 'mobile' ? (
          <div className="space-y-4">
            {featuredItem && (
              <div className="group cursor-pointer relative rounded-2xl overflow-hidden aspect-[4/3]" style={{ boxShadow: `0 4px 20px ${brandColor}15` }}>
                {featuredItem.image ? (
                  <img src={featuredItem.image} alt={featuredItem.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center"><Briefcase size={48} className="text-slate-300" /></div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                {featuredItem.tag && <div className="absolute top-3 left-3"><ServiceBadge tag={featuredItem.tag} brandColor={brandColor} /></div>}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <span className="text-xs uppercase tracking-wider font-medium" style={{ color: `${brandColor}cc` }}>Nổi bật</span>
                  <h3 className="text-lg font-semibold text-white mt-1">{featuredItem.name}</h3>
                  <span className="text-sm font-medium text-white/90 mt-1 block">{formatServicePrice(featuredItem.price)}</span>
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              {otherItems.map((item) => (
                <div key={item.id} className="group cursor-pointer rounded-xl p-2 transition-all" style={{ backgroundColor: 'transparent' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = `${brandColor}05`; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}>
                  <div className="relative overflow-hidden bg-slate-100 dark:bg-slate-800 rounded-xl aspect-square mb-2">
                    {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Briefcase size={24} className="text-slate-300" /></div>}
                  </div>
                  <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100 line-clamp-1">{item.name}</h4>
                  <span className="text-xs font-semibold" style={{ color: brandColor }}>{formatServicePrice(item.price)}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className={cn("grid gap-4", device === 'tablet' ? 'grid-cols-2' : 'grid-cols-3')}>
            {featuredItem && (
              <div className={cn("group cursor-pointer relative rounded-2xl overflow-hidden", device === 'desktop' ? 'row-span-2' : 'col-span-1')} style={{ boxShadow: `0 8px 30px ${brandColor}20` }}>
                <div className="h-full min-h-[400px]">
                  {featuredItem.image ? (
                    <img src={featuredItem.image} alt={featuredItem.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center"><Briefcase size={64} className="text-slate-300" /></div>
                  )}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                {featuredItem.tag && <div className="absolute top-4 left-4"><ServiceBadge tag={featuredItem.tag} brandColor={brandColor} /></div>}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <span className="text-xs uppercase tracking-wider font-medium" style={{ color: `${brandColor}cc` }}>Dịch vụ nổi bật</span>
                  <h3 className="text-xl md:text-2xl font-semibold text-white mt-2 leading-tight">{featuredItem.name}</h3>
                  {featuredItem.description && <p className="text-sm text-white/80 mt-2 line-clamp-2">{featuredItem.description}</p>}
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-lg font-semibold text-white">{formatServicePrice(featuredItem.price)}</span>
                    <button className="px-5 py-2.5 text-white text-sm font-medium rounded-lg transition-all hover:opacity-90 whitespace-nowrap" style={{ backgroundColor: brandColor, boxShadow: `0 4px 12px ${brandColor}40` }}>Xem chi tiết</button>
                  </div>
                </div>
              </div>
            )}
            <div className={cn("grid gap-3", device === 'desktop' ? 'col-span-2 grid-cols-2' : 'grid-cols-2')}>
              {otherItems.map((item) => (
                <div 
                  key={item.id} 
                  className="group cursor-pointer bg-white dark:bg-slate-800 border rounded-xl p-3 transition-all" 
                  style={{ borderColor: `${brandColor}15` }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${brandColor}40`; e.currentTarget.style.boxShadow = `0 4px 12px ${brandColor}10`; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = `${brandColor}15`; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <div className="relative overflow-hidden bg-slate-100 dark:bg-slate-700 rounded-lg aspect-[4/3] mb-3">
                    {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /> : <div className="w-full h-full flex items-center justify-center"><Briefcase size={28} className="text-slate-300" /></div>}
                    {item.tag && <div className="absolute top-2 left-2"><ServiceBadge tag={item.tag} brandColor={brandColor} /></div>}
                  </div>
                  <h4 className="font-medium text-sm text-slate-900 dark:text-slate-100 line-clamp-1 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">{item.name}</h4>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm font-semibold" style={{ color: brandColor }}>{formatServicePrice(item.price)}</span>
                    <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: brandColor }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    );
  };

  return (
    <PreviewWrapper title="Preview Dịch vụ" device={device} setDevice={setDevice} previewStyle={previewStyle} setPreviewStyle={setPreviewStyle} styles={styles} info={`${displayItems.length} dịch vụ`}>
      <BrowserFrame url="yoursite.com/services">
        {previewStyle === 'grid' && renderGridStyle()}
        {previewStyle === 'bento' && renderBentoStyle()}
        {previewStyle === 'list' && renderListStyle()}
        {previewStyle === 'carousel' && renderCarouselStyle()}
        {previewStyle === 'minimal' && renderMinimalStyle()}
        {previewStyle === 'showcase' && renderShowcaseStyle()}
      </BrowserFrame>
    </PreviewWrapper>
  );
};

// ============ BLOG PREVIEW ============
// Modern News Feed UI/UX - 6 Variants (Best Practice compliant)
// Styles: Grid, List, Featured, Magazine, Carousel, Minimal
export type BlogStyle = 'grid' | 'list' | 'featured' | 'magazine' | 'carousel' | 'minimal';

export interface BlogPreviewItem {
  id: string | number;
  title: string;
  excerpt?: string;
  thumbnail?: string;
  date?: string;
  category?: string;
  readTime?: string;
  views?: number;
}

export const BlogPreview = ({ 
  brandColor, 
  postCount, 
  selectedStyle, 
  onStyleChange,
  posts,
  title = 'Bài viết'
}: { 
  brandColor: string; 
  postCount: number; 
  selectedStyle?: BlogStyle; 
  onStyleChange?: (style: BlogStyle) => void;
  posts?: BlogPreviewItem[];
  title?: string;
}) => {
  const [device, setDevice] = useState<PreviewDevice>('desktop');
  const previewStyle = selectedStyle || 'grid';
  const setPreviewStyle = (s: string) => onStyleChange?.(s as BlogStyle);
  const styles = [
    { id: 'grid', label: 'Grid' }, 
    { id: 'list', label: 'List' }, 
    { id: 'featured', label: 'Featured' },
    { id: 'magazine', label: 'Magazine' },
    { id: 'carousel', label: 'Carousel' },
    { id: 'minimal', label: 'Minimal' }
  ];
  
  // Mock data
  const mockPosts: BlogPreviewItem[] = [
    { id: 1, title: 'Xu hướng thiết kế UI/UX nổi bật năm 2024', excerpt: 'Khám phá những phong cách thiết kế đang thống trị thế giới công nghệ hiện đại và cách áp dụng vào dự án của bạn.', date: '12/05/2024', category: 'Thiết kế', readTime: '5 phút đọc', views: 1250 },
    { id: 2, title: 'Tối ưu hóa hiệu năng React Application', excerpt: 'Những kỹ thuật và best practices để tối ưu performance cho ứng dụng React của bạn.', date: '11/05/2024', category: 'Lập trình', readTime: '8 phút đọc', views: 980 },
    { id: 3, title: 'AI và tương lai của thị trường lao động', excerpt: 'Phân tích sâu về tác động của AI đến việc làm và cách thích nghi với xu hướng mới.', date: '10/05/2024', category: 'Công nghệ', readTime: '6 phút đọc', views: 2100 },
    { id: 4, title: 'Hướng dẫn SEO cho Developers', excerpt: 'Tất cả những gì developer cần biết về SEO để xây dựng website thân thiện với công cụ tìm kiếm.', date: '09/05/2024', category: 'Marketing', readTime: '7 phút đọc', views: 750 },
    { id: 5, title: 'Bảo mật Web Application 101', excerpt: 'Những lỗ hổng bảo mật phổ biến và cách phòng tránh trong ứng dụng web.', date: '08/05/2024', category: 'Bảo mật', readTime: '10 phút đọc', views: 1500 },
    { id: 6, title: 'Microservices vs Monolith: Khi nào nên chọn gì?', excerpt: 'So sánh chi tiết giữa hai kiến trúc phổ biến và cách đưa ra quyết định phù hợp.', date: '07/05/2024', category: 'Architecture', readTime: '9 phút đọc', views: 890 }
  ];

  // Use real posts if provided, otherwise mock
  const displayPosts: BlogPreviewItem[] = posts && posts.length > 0 
    ? posts 
    : mockPosts.slice(0, Math.max(postCount, 6));
  
  const showViewAll = displayPosts.length > 3;

  // Image placeholder with brandColor
  const ImagePlaceholder = ({ size = 32 }: { size?: number }) => (
    <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: `${brandColor}10` }}>
      <FileText size={size} style={{ color: `${brandColor}40` }} />
    </div>
  );

  // Empty State
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: `${brandColor}10` }}>
        <FileText size={32} style={{ color: brandColor }} />
      </div>
      <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-1">Chưa có bài viết nào</h3>
      <p className="text-sm text-slate-500">Thêm bài viết để hiển thị ở đây</p>
    </div>
  );

  // "+N bài viết khác" component
  const MoreItemsCard = ({ count }: { count: number }) => (
    <div 
      className="flex flex-col items-center justify-center rounded-xl aspect-[16/10] border-2 border-dashed cursor-pointer"
      style={{ borderColor: `${brandColor}30`, backgroundColor: `${brandColor}05` }}
    >
      <div className="w-12 h-12 rounded-full flex items-center justify-center mb-2" style={{ backgroundColor: `${brandColor}15` }}>
        <Plus size={24} style={{ color: brandColor }} />
      </div>
      <span className="text-lg font-bold" style={{ color: brandColor }}>+{count}</span>
      <p className="text-xs text-slate-500">bài viết khác</p>
    </div>
  );

  // Style 1: Grid - Professional card grid với brandColor hover
  const renderGridStyle = () => {
    if (displayPosts.length === 0) return <EmptyState />;
    const visibleCount = device === 'mobile' ? 2 : 3;
    const visibleItems = displayPosts.slice(0, visibleCount);
    const remaining = displayPosts.length - visibleCount;

    // Centered layout for 1-2 items
    if (displayPosts.length <= 2) {
      return (
        <section className={cn("py-8 md:py-12", device === 'mobile' ? 'px-3' : 'px-4')}>
          <h2 className={cn("font-bold tracking-tighter text-left mb-6 md:mb-8", device === 'mobile' ? 'text-2xl' : 'text-3xl md:text-4xl')}>{title}</h2>
          <div className={cn("mx-auto", displayPosts.length === 1 ? 'max-w-md' : 'max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-4')}>
            {displayPosts.map((post) => (
              <article 
                key={post.id} 
                className="group flex flex-col overflow-hidden rounded-xl border bg-white dark:bg-slate-800 transition-all duration-300 cursor-pointer"
                style={{ borderColor: `${brandColor}15` }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${brandColor}40`; e.currentTarget.style.boxShadow = `0 8px 24px ${brandColor}15`; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = `${brandColor}15`; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  {post.thumbnail ? <img src={post.thumbnail} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /> : <ImagePlaceholder size={32} />}
                  <div className="absolute left-3 top-3">
                    <span className="px-2 py-1 text-xs font-medium rounded shadow-sm backdrop-blur-sm" style={{ backgroundColor: `${brandColor}15`, color: brandColor }}>{post.category || 'Tin tức'}</span>
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <h3 className="mb-2 text-base md:text-lg font-bold leading-tight text-slate-900 dark:text-slate-100 group-hover:opacity-80 transition-colors line-clamp-2">{post.title || 'Tiêu đề bài viết'}</h3>
                  {post.excerpt && <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-2">{post.excerpt}</p>}
                  <div className="mt-auto pt-2 flex items-center justify-between">
                    <time className="text-xs text-slate-500">{post.date || 'Hôm nay'}</time>
                    {post.readTime && <span className="text-xs text-slate-400">{post.readTime}</span>}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      );
    }

    return (
      <section className={cn("py-8 md:py-12", device === 'mobile' ? 'px-3' : 'px-4')}>
        <h2 className={cn("font-bold tracking-tighter text-left mb-6 md:mb-8", device === 'mobile' ? 'text-2xl' : 'text-3xl md:text-4xl')}>{title}</h2>
        <div className={cn("grid gap-4 md:gap-6", device === 'mobile' ? 'grid-cols-1' : device === 'tablet' ? 'grid-cols-2' : 'grid-cols-3')}>
          {visibleItems.map((post) => (
            <article 
              key={post.id} 
              className="group flex flex-col overflow-hidden rounded-xl border bg-white dark:bg-slate-800 transition-all duration-300 cursor-pointer"
              style={{ borderColor: `${brandColor}15` }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${brandColor}40`; e.currentTarget.style.boxShadow = `0 8px 24px ${brandColor}15`; e.currentTarget.style.transform = 'translateY(-4px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = `${brandColor}15`; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                {post.thumbnail ? <img src={post.thumbnail} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /> : <ImagePlaceholder size={32} />}
                <div className="absolute left-3 top-3">
                  <span className="px-2 py-1 text-xs font-medium rounded shadow-sm backdrop-blur-sm" style={{ backgroundColor: `${brandColor}15`, color: brandColor }}>{post.category || 'Tin tức'}</span>
                </div>
              </div>
              <div className="flex flex-1 flex-col p-4">
                <h3 className="mb-2 text-base md:text-lg font-bold leading-tight text-slate-900 dark:text-slate-100 group-hover:opacity-80 transition-colors line-clamp-2">{post.title || 'Tiêu đề bài viết'}</h3>
                {post.excerpt && <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-2">{post.excerpt}</p>}
                <div className="mt-auto pt-2 flex items-center justify-between">
                  <time className="text-xs text-slate-500">{post.date || 'Hôm nay'}</time>
                  {post.readTime && <span className="text-xs text-slate-400">{post.readTime}</span>}
                </div>
              </div>
            </article>
          ))}
          {remaining > 0 && device !== 'mobile' && <MoreItemsCard count={remaining} />}
        </div>
        {showViewAll && (
          <div className="flex justify-center pt-6 md:pt-8">
            <button className="group flex items-center gap-2 text-sm font-medium transition-colors" style={{ color: brandColor }}>
              Xem tất cả <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        )}
      </section>
    );
  };

  // Style 2: List - Horizontal cards với brandColor hover
  const renderListStyle = () => {
    if (displayPosts.length === 0) return <EmptyState />;
    return (
      <section className={cn("py-8 md:py-12", device === 'mobile' ? 'px-3' : 'px-4')}>
        <h2 className={cn("font-bold tracking-tighter text-left mb-6 md:mb-8", device === 'mobile' ? 'text-2xl' : 'text-3xl md:text-4xl')}>{title}</h2>
        <div className={cn("grid gap-4", device === 'mobile' ? 'grid-cols-1' : 'grid-cols-1 max-w-4xl mx-auto')}>
          {displayPosts.slice(0, 4).map((post) => (
            <article 
              key={post.id} 
              className={cn("group flex w-full overflow-hidden rounded-lg border bg-white dark:bg-slate-800 transition-all cursor-pointer", device === 'mobile' ? 'flex-col' : 'flex-row')}
              style={{ borderColor: `${brandColor}15` }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${brandColor}40`; e.currentTarget.style.boxShadow = `0 4px 12px ${brandColor}10`; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = `${brandColor}15`; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div className={cn("overflow-hidden flex-shrink-0", device === 'mobile' ? 'aspect-[16/9] w-full' : 'aspect-[4/3] w-[220px]')}>
                {post.thumbnail ? <img src={post.thumbnail} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /> : <ImagePlaceholder size={24} />}
              </div>
              <div className="flex flex-1 flex-col justify-center p-4 md:px-6">
                <div className="mb-2"><span className="text-xs font-semibold" style={{ color: brandColor }}>{post.category || 'Tin tức'}</span></div>
                <h3 className="mb-2 text-base md:text-lg font-bold leading-snug text-slate-900 dark:text-slate-100 group-hover:opacity-80 transition-colors line-clamp-2">{post.title || 'Tiêu đề bài viết'}</h3>
                {post.excerpt && <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-2">{post.excerpt}</p>}
                <div className="flex items-center gap-3">
                  <time className="text-xs text-slate-500">{post.date || 'Hôm nay'}</time>
                  {post.readTime && <span className="text-xs text-slate-400">• {post.readTime}</span>}
                </div>
              </div>
            </article>
          ))}
        </div>
        {showViewAll && (
          <div className="flex justify-center pt-6 md:pt-8">
            <button className="group flex items-center gap-2 text-sm font-medium transition-colors" style={{ color: brandColor }}>Xem tất cả <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" /></button>
          </div>
        )}
      </section>
    );
  };

  // Style 3: Featured - Hero card + sidebar with brandColor
  const renderFeaturedStyle = () => {
    if (displayPosts.length === 0) return <EmptyState />;
    const featuredPost = displayPosts[0];
    const sidebarPosts = displayPosts.slice(1, 5);
    return (
      <section className={cn("py-8 md:py-12", device === 'mobile' ? 'px-3' : 'px-4')}>
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <h2 className={cn("font-bold tracking-tighter", device === 'mobile' ? 'text-2xl' : 'text-3xl md:text-4xl')}>{title}</h2>
          {showViewAll && <button className="group flex items-center gap-1 text-sm font-medium transition-colors" style={{ color: brandColor }}>Xem tất cả <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" /></button>}
        </div>
        <div className={cn("grid gap-6 md:gap-8", device === 'mobile' ? 'grid-cols-1' : 'grid-cols-12')}>
          <div className={cn(device === 'mobile' ? '' : 'col-span-8')}>
            <article className="group relative flex h-full min-h-[300px] md:min-h-[400px] flex-col justify-end overflow-hidden rounded-xl text-white cursor-pointer transition-all" style={{ boxShadow: `0 8px 30px ${brandColor}20` }}>
              <div className="absolute inset-0 z-0">
                {featuredPost.thumbnail ? <img src={featuredPost.thumbnail} alt={featuredPost.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" /> : <div className="w-full h-full" style={{ background: `linear-gradient(135deg, ${brandColor}40, ${brandColor}80)` }} />}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />
              </div>
              <div className="relative z-10 p-5 md:p-8">
                <div className="mb-3 flex items-center space-x-3">
                  <span className="px-2.5 py-1 text-xs font-medium rounded backdrop-blur-md" style={{ backgroundColor: `${brandColor}60`, color: 'white' }}>{featuredPost.category || 'Tin tức'}</span>
                  {featuredPost.readTime && <span className="text-xs text-slate-300">{featuredPost.readTime}</span>}
                </div>
                <h3 className={cn("mb-2 font-bold leading-tight tracking-tight text-white", device === 'mobile' ? 'text-xl' : 'text-2xl md:text-3xl')}>{featuredPost.title || 'Tiêu đề bài viết'}</h3>
                {featuredPost.excerpt && <p className="text-sm text-slate-200 line-clamp-2 mb-3">{featuredPost.excerpt}</p>}
                <time className="text-sm font-medium text-slate-300">{featuredPost.date || 'Hôm nay'}</time>
              </div>
            </article>
          </div>
          <div className={cn("flex flex-col gap-3", device === 'mobile' ? '' : 'col-span-4')}>
            <h3 className="font-semibold text-base mb-1 px-1 text-slate-700 dark:text-slate-300">Đáng chú ý</h3>
            {sidebarPosts.map((post) => (
              <article 
                key={post.id} 
                className="group flex items-center space-x-4 rounded-lg p-2 border transition-all cursor-pointer"
                style={{ borderColor: `${brandColor}10` }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${brandColor}30`; e.currentTarget.style.backgroundColor = `${brandColor}05`; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = `${brandColor}10`; e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                <div className="relative h-14 w-14 md:h-16 md:w-16 shrink-0 overflow-hidden rounded-md border" style={{ borderColor: `${brandColor}15` }}>
                  {post.thumbnail ? <img src={post.thumbnail} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" /> : <ImagePlaceholder size={16} />}
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: brandColor }}>{post.category || 'Tin tức'}</span>
                  <h4 className="text-sm font-semibold leading-snug text-slate-900 dark:text-slate-100 line-clamp-2 group-hover:opacity-80 transition-colors">{post.title || 'Tiêu đề bài viết'}</h4>
                  <time className="mt-1 text-[10px] text-slate-500">{post.date || 'Hôm nay'}</time>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    );
  };

  // Style 4: Magazine - Bento grid layout
  const renderMagazineStyle = () => {
    if (displayPosts.length === 0) return <EmptyState />;
    const featured = displayPosts[0];
    const secondary = displayPosts.slice(1, 3);
    const others = displayPosts.slice(3, 6);
    return (
      <section className={cn("py-8 md:py-12", device === 'mobile' ? 'px-3' : 'px-4')}>
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <div className="space-y-1">
            <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-widest" style={{ color: brandColor }}><span className="w-6 h-[2px]" style={{ backgroundColor: brandColor }}></span>Magazine</div>
            <h2 className={cn("font-bold tracking-tighter", device === 'mobile' ? 'text-2xl' : 'text-3xl md:text-4xl')}>{title}</h2>
          </div>
          {showViewAll && <button className="group flex items-center gap-2 text-sm font-medium transition-colors" style={{ color: brandColor }}>Xem tất cả <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" /></button>}
        </div>
        {device === 'mobile' ? (
          <div className="space-y-4">
            <article className="group relative rounded-xl overflow-hidden aspect-[4/3] cursor-pointer" style={{ boxShadow: `0 4px 20px ${brandColor}15` }}>
              {featured.thumbnail ? <img src={featured.thumbnail} alt={featured.title} className="w-full h-full object-cover" /> : <div className="w-full h-full" style={{ background: `linear-gradient(135deg, ${brandColor}30, ${brandColor}60)` }} />}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <span className="px-2 py-1 text-[10px] font-bold rounded mb-2 inline-block" style={{ backgroundColor: brandColor, color: 'white' }}>{featured.category || 'Tin tức'}</span>
                <h3 className="text-lg font-bold text-white line-clamp-2">{featured.title || 'Tiêu đề'}</h3>
              </div>
            </article>
            <div className="grid grid-cols-2 gap-3">
              {secondary.concat(others).slice(0, 4).map((post) => (
                <article key={post.id} className="group rounded-xl border p-2 cursor-pointer transition-all" style={{ borderColor: `${brandColor}15` }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${brandColor}40`; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = `${brandColor}15`; }}>
                  <div className="aspect-[4/3] rounded-lg overflow-hidden mb-2">{post.thumbnail ? <img src={post.thumbnail} alt={post.title} className="w-full h-full object-cover" /> : <ImagePlaceholder size={20} />}</div>
                  <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100 line-clamp-2">{post.title || 'Tiêu đề'}</h4>
                  <time className="text-[10px] text-slate-500 mt-1 block">{post.date || 'Hôm nay'}</time>
                </article>
              ))}
            </div>
          </div>
        ) : (
          <div className={cn("grid gap-4", device === 'tablet' ? 'grid-cols-2 grid-rows-3' : 'grid-cols-4 grid-rows-2')}>
            <article className={cn("group relative rounded-2xl overflow-hidden cursor-pointer", device === 'desktop' ? 'col-span-2 row-span-2' : 'col-span-1 row-span-2')} style={{ boxShadow: `0 8px 30px ${brandColor}20` }}>
              <div className="h-full min-h-[350px]">{featured.thumbnail ? <img src={featured.thumbnail} alt={featured.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" /> : <div className="w-full h-full" style={{ background: `linear-gradient(135deg, ${brandColor}40, ${brandColor}80)` }} />}</div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <span className="px-2.5 py-1 text-xs font-bold rounded mb-3 inline-block" style={{ backgroundColor: brandColor, color: 'white' }}>{featured.category || 'Nổi bật'}</span>
                <h3 className="text-xl md:text-2xl font-bold text-white leading-tight line-clamp-2 mb-2">{featured.title || 'Tiêu đề'}</h3>
                {featured.excerpt && <p className="text-sm text-slate-200 line-clamp-2 mb-3">{featured.excerpt}</p>}
                <div className="flex items-center gap-3 text-sm text-slate-300"><time>{featured.date || 'Hôm nay'}</time>{featured.readTime && <span>• {featured.readTime}</span>}</div>
              </div>
            </article>
            {secondary.map((post) => (
              <article key={post.id} className="group rounded-xl border overflow-hidden cursor-pointer transition-all" style={{ borderColor: `${brandColor}15` }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${brandColor}40`; e.currentTarget.style.boxShadow = `0 4px 12px ${brandColor}10`; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = `${brandColor}15`; e.currentTarget.style.boxShadow = 'none'; }}>
                <div className="aspect-[16/9] overflow-hidden">{post.thumbnail ? <img src={post.thumbnail} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /> : <ImagePlaceholder size={24} />}</div>
                <div className="p-3"><span className="text-[10px] font-bold uppercase" style={{ color: brandColor }}>{post.category || 'Tin tức'}</span><h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 line-clamp-2 mt-1">{post.title || 'Tiêu đề'}</h4></div>
              </article>
            ))}
            {others.slice(0, device === 'desktop' ? 2 : 1).map((post) => (
              <article key={post.id} className="group flex items-center gap-3 rounded-xl border p-3 cursor-pointer transition-all" style={{ borderColor: `${brandColor}15` }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${brandColor}40`; e.currentTarget.style.backgroundColor = `${brandColor}05`; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = `${brandColor}15`; e.currentTarget.style.backgroundColor = 'transparent'; }}>
                <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">{post.thumbnail ? <img src={post.thumbnail} alt={post.title} className="w-full h-full object-cover" /> : <ImagePlaceholder size={16} />}</div>
                <div className="flex-1 min-w-0"><span className="text-[10px] font-bold uppercase" style={{ color: brandColor }}>{post.category || 'Tin tức'}</span><h4 className="text-sm font-medium text-slate-900 dark:text-slate-100 line-clamp-2">{post.title || 'Tiêu đề'}</h4></div>
              </article>
            ))}
          </div>
        )}
      </section>
    );
  };

  // Style 5: Carousel - Horizontal scrollable
  const renderCarouselStyle = () => {
    if (displayPosts.length === 0) return <EmptyState />;
    return (
      <section className={cn("py-8 md:py-12", device === 'mobile' ? 'px-3' : 'px-4')}>
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <h2 className={cn("font-bold tracking-tighter", device === 'mobile' ? 'text-2xl' : 'text-3xl md:text-4xl')}>{title}</h2>
          <div className="flex items-center gap-3">
            <button className="w-9 h-9 rounded-full border flex items-center justify-center transition-colors" style={{ borderColor: `${brandColor}30` }}><ChevronLeft size={18} style={{ color: brandColor }} /></button>
            <button className="w-9 h-9 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: brandColor }}><ChevronRight size={18} /></button>
          </div>
        </div>
        <div className="relative overflow-hidden -mx-3 md:-mx-4 px-3 md:px-4">
          <div className={cn("flex gap-4", device === 'mobile' ? 'gap-3' : 'gap-5')}>
            {displayPosts.slice(0, 6).map((post) => (
              <article 
                key={post.id}
                className={cn("flex-shrink-0 group cursor-pointer rounded-xl border overflow-hidden transition-all", device === 'mobile' ? 'w-[260px]' : device === 'tablet' ? 'w-[300px]' : 'w-[340px]')}
                style={{ borderColor: `${brandColor}15` }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${brandColor}40`; e.currentTarget.style.boxShadow = `0 8px 24px ${brandColor}15`; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = `${brandColor}15`; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div className="aspect-[16/10] overflow-hidden">{post.thumbnail ? <img src={post.thumbnail} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /> : <ImagePlaceholder size={32} />}</div>
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2"><span className="text-[10px] font-bold uppercase" style={{ color: brandColor }}>{post.category || 'Tin tức'}</span>{post.readTime && <span className="text-[10px] text-slate-400">• {post.readTime}</span>}</div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 line-clamp-2 mb-2 group-hover:opacity-80 transition-colors">{post.title || 'Tiêu đề bài viết'}</h3>
                  {post.excerpt && <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">{post.excerpt}</p>}
                  <div className="flex items-center justify-between"><time className="text-xs text-slate-500">{post.date || 'Hôm nay'}</time><ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: brandColor }} /></div>
                </div>
              </article>
            ))}
            <div className="flex-shrink-0 w-3 md:w-6" aria-hidden="true" />
          </div>
        </div>
      </section>
    );
  };

  // Style 6: Minimal - Typography-first, clean design
  const renderMinimalStyle = () => {
    if (displayPosts.length === 0) return <EmptyState />;
    return (
      <section className={cn("py-8 md:py-12", device === 'mobile' ? 'px-3' : 'px-4')}>
        <div className="flex items-center justify-between border-b pb-4 mb-8" style={{ borderColor: `${brandColor}20` }}>
          <h2 className={cn("font-light tracking-tight text-slate-900 dark:text-slate-100", device === 'mobile' ? 'text-xl' : 'text-2xl md:text-3xl')}>{title}</h2>
          {showViewAll && <button className="group flex items-center gap-2 text-sm transition-colors" style={{ color: brandColor }}>Xem tất cả <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" /></button>}
        </div>
        <div className="space-y-0">
          {displayPosts.slice(0, device === 'mobile' ? 4 : 5).map((post, index) => (
            <article 
              key={post.id}
              className="group flex items-start gap-4 py-5 border-b cursor-pointer transition-colors"
              style={{ borderColor: `${brandColor}10` }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = `${brandColor}03`; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              <span className={cn("font-bold tabular-nums flex-shrink-0", device === 'mobile' ? 'text-xl w-8' : 'text-2xl w-10')} style={{ color: `${brandColor}60` }}>{String(index + 1).padStart(2, '0')}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: brandColor }}>{post.category || 'Tin tức'}</span>
                  <span className="text-[10px] text-slate-400">•</span>
                  <time className="text-[10px] text-slate-500">{post.date || 'Hôm nay'}</time>
                </div>
                <h3 className={cn("font-semibold text-slate-900 dark:text-slate-100 group-hover:opacity-80 transition-colors line-clamp-2", device === 'mobile' ? 'text-base' : 'text-lg')}>{post.title || 'Tiêu đề bài viết'}</h3>
                {post.excerpt && <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1 mt-1">{post.excerpt}</p>}
              </div>
              <ArrowRight size={18} className="flex-shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1" style={{ color: brandColor }} />
            </article>
          ))}
        </div>
      </section>
    );
  };

  // Image guidelines component
  const ImageGuidelines = () => (
    <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
      <div className="flex items-start gap-2">
        <ImageIcon size={14} className="text-slate-400 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-slate-600 dark:text-slate-400">
          {previewStyle === 'grid' && <p><strong>800×500px</strong> (16:10) • Card thumbnail, nhiều bài hiển thị grid</p>}
          {previewStyle === 'list' && <p><strong>600×450px</strong> (4:3) • Thumbnail ngang, hiển thị bên trái</p>}
          {previewStyle === 'featured' && <p><strong>Hero:</strong> 1200×800px (3:2) • <strong>Sidebar:</strong> 200×200px (1:1)</p>}
          {previewStyle === 'magazine' && <p><strong>Featured:</strong> 1200×800px • <strong>Secondary:</strong> 600×340px • <strong>Small:</strong> 200×200px</p>}
          {previewStyle === 'carousel' && <p><strong>800×500px</strong> (16:10) • Card ngang, scroll horizontal</p>}
          {previewStyle === 'minimal' && <p><strong>Không cần ảnh</strong> • Style typography-first, focus vào nội dung text</p>}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <PreviewWrapper title="Preview Blog" device={device} setDevice={setDevice} previewStyle={previewStyle} setPreviewStyle={setPreviewStyle} styles={styles} info={`${displayPosts.length} bài viết`}>
        <BrowserFrame url="yoursite.com/blog">
          {previewStyle === 'grid' && renderGridStyle()}
          {previewStyle === 'list' && renderListStyle()}
          {previewStyle === 'featured' && renderFeaturedStyle()}
          {previewStyle === 'magazine' && renderMagazineStyle()}
          {previewStyle === 'carousel' && renderCarouselStyle()}
          {previewStyle === 'minimal' && renderMinimalStyle()}
        </BrowserFrame>
      </PreviewWrapper>
      <ImageGuidelines />
    </>
  );
};

// ============ FOOTER PREVIEW ============
// 6 Professional Styles: Classic Dark, Modern Center, Corporate, Minimal, Centered, Stacked
// Best Practices: Clear navigation hierarchy, Social proof, Contact accessibility, Mobile-first, Brand consistency
type SocialLinkItem = { id: number; platform: string; url: string; icon: string };
type FooterConfig = { 
  logo: string; 
  description: string; 
  columns: Array<{ id: number; title: string; links: Array<{ label: string; url: string }> }>; 
  socialLinks?: SocialLinkItem[];
  copyright: string; 
  showSocialLinks: boolean 
};
export type FooterStyle = 'classic' | 'modern' | 'corporate' | 'minimal' | 'centered' | 'stacked';
export const FooterPreview = ({ config, brandColor, selectedStyle, onStyleChange }: { config: FooterConfig; brandColor: string; selectedStyle?: FooterStyle; onStyleChange?: (style: FooterStyle) => void }) => {
  const [device, setDevice] = useState<PreviewDevice>('desktop');
  const previewStyle = selectedStyle || 'classic';
  const setPreviewStyle = (s: string) => onStyleChange?.(s as FooterStyle);
  const styles = [
    { id: 'classic', label: '1. Classic Dark' }, 
    { id: 'modern', label: '2. Modern Center' },
    { id: 'corporate', label: '3. Corporate' },
    { id: 'minimal', label: '4. Minimal' },
    { id: 'centered', label: '5. Centered' },
    { id: 'stacked', label: '6. Stacked' }
  ];

  // Best Practice: Dùng brandColor đậm làm nền thay vì màu đen cứng
  // Tạo shade từ brandColor bằng cách blend với đen
  const shadeColor = (hex: string, percent: number): string => {
    const num = parseInt(hex.replace('#', ''), 16);
    const R = Math.round((num >> 16) * (1 - percent / 100));
    const G = Math.round((num >> 8 & 0x00FF) * (1 - percent / 100));
    const B = Math.round((num & 0x0000FF) * (1 - percent / 100));
    return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
  };

  // Brand-based colors: shade của brandColor thay vì đen cứng
  const bgDark = shadeColor(brandColor, 65);       // Đậm nhất - nền footer
  const bgMedium = shadeColor(brandColor, 50);     // Medium - cards/sections
  const borderColor = shadeColor(brandColor, 30); // Nhẹ - borders

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
                  <a key={s.id} href={s.url} className="h-5 w-5 flex items-center justify-center rounded-full hover:opacity-80 transition-all duration-300" style={{ backgroundColor: '#ffffff', color: socialColors[s.platform] || '#94a3b8' }}>
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
              <a key={s.id} href={s.url} className="h-5 w-5 flex items-center justify-center rounded-full hover:opacity-80 transition-all duration-300" style={{ backgroundColor: '#ffffff', color: socialColors[s.platform] || '#94a3b8' }}>
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
                <a key={s.id} href={s.url} className="h-4 w-4 flex items-center justify-center rounded-full hover:opacity-80 transition-all duration-300" style={{ backgroundColor: '#ffffff', color: socialColors[s.platform] || '#94a3b8' }}>
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
                <a key={s.id} href={s.url} className="h-4 w-4 flex items-center justify-center rounded-full hover:opacity-80 transition-all duration-300" style={{ backgroundColor: '#ffffff', color: socialColors[s.platform] || '#94a3b8' }}>
                  {renderSocialIcon(s.platform, 12)}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  );

  // Style 5: Centered - Logo + social giữa, columns dàn 2 rows
  const renderCenteredStyle = () => (
    <footer className="w-full text-white py-8 md:py-10" style={{ backgroundColor: bgDark }}>
      <div className={cn("container max-w-6xl mx-auto text-center", device === 'mobile' ? 'px-3' : 'px-4')}>
        
        {/* Brand Center */}
        <div className="flex flex-col items-center gap-3 mb-6">
          <div 
            className="h-12 w-12 rounded-2xl flex items-center justify-center shadow-lg"
            style={{ backgroundColor: `${brandColor}20`, border: `2px solid ${brandColor}40` }}
          >
            {config.logo ? (
              <img src={config.logo} alt="Logo" className="h-7 w-7 object-contain" />
            ) : (
              <div className="h-7 w-7 rounded-lg flex items-center justify-center text-white font-bold" style={{ backgroundColor: brandColor }}>V</div>
            )}
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight">VietAdmin</h2>
          <p className={cn("text-xs leading-relaxed text-white/70 max-w-md", device === 'mobile' ? 'max-w-xs' : '')}>
            {config.description || 'Đối tác tin cậy của bạn trong mọi giải pháp công nghệ.'}
          </p>
        </div>

        {/* Columns in grid */}
        <div className={cn(
          "grid gap-4 mb-6",
          device === 'mobile' ? 'grid-cols-2 gap-3' : 'grid-cols-4 gap-6'
        )}>
          {getColumns().slice(0, 4).map((col) => (
            <div key={col.id} className="text-center">
              <h4 className="text-[10px] font-bold text-white uppercase tracking-wider mb-2">{col.title}</h4>
              <ul className="space-y-1">
                {col.links.slice(0, 4).map((link, lIdx) => (
                  <li key={lIdx}>
                    <a 
                      href={link.url} 
                      className="text-xs hover:text-white transition-colors inline-block text-white/60"
                      onMouseEnter={(e) => e.currentTarget.style.color = brandColor}
                      onMouseLeave={(e) => e.currentTarget.style.color = ''}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="w-16 h-px mx-auto mb-5" style={{ background: `linear-gradient(to right, transparent, ${brandColor}, transparent)` }}></div>

        {/* Socials Center */}
        {config.showSocialLinks && (
          <div className="flex justify-center gap-3 mb-4">
            {getSocials().map((s) => (
              <a 
                key={s.id} 
                href={s.url} 
                className="h-8 w-8 flex items-center justify-center rounded-full transition-all duration-300 hover:scale-110"
                style={{ backgroundColor: `${brandColor}20`, color: '#fff', border: `1px solid ${brandColor}30` }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = brandColor;
                  e.currentTarget.style.borderColor = brandColor;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = `${brandColor}20`;
                  e.currentTarget.style.borderColor = `${brandColor}30`;
                }}
              >
                {renderSocialIcon(s.platform, 16)}
              </a>
            ))}
          </div>
        )}

        {/* Copyright */}
        <p className="text-[10px] text-white/50">{config.copyright || '© 2024 VietAdmin. All rights reserved.'}</p>
      </div>
    </footer>
  );

  // Style 6: Stacked - Tất cả elements xếp chồng vertical, mobile-first compact
  const renderStackedStyle = () => (
    <footer className="w-full text-white py-6" style={{ backgroundColor: bgDark, borderTop: `3px solid ${brandColor}` }}>
      <div className={cn("container max-w-4xl mx-auto", device === 'mobile' ? 'px-4' : 'px-6')}>
        
        {/* Logo + Description */}
        <div className={cn("flex items-start gap-3 mb-5", device === 'mobile' ? 'flex-col items-center text-center' : '')}>
          <div 
            className="h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: brandColor }}
          >
            {config.logo ? (
              <img src={config.logo} alt="Logo" className="h-6 w-6 object-contain brightness-110" />
            ) : (
              <span className="text-white font-bold text-sm">V</span>
            )}
          </div>
          <div className={cn(device === 'mobile' ? '' : 'flex-1')}>
            <h3 className="text-sm font-bold text-white mb-1">VietAdmin</h3>
            <p className="text-xs text-white/70 leading-relaxed line-clamp-2">
              {config.description || 'Đối tác tin cậy của bạn trong mọi giải pháp công nghệ.'}
            </p>
          </div>
        </div>

        {/* Links in single row (flat) */}
        <div className="mb-5 pb-4" style={{ borderBottom: `1px solid ${borderColor}` }}>
          <div className={cn(
            "flex flex-wrap gap-x-4 gap-y-2",
            device === 'mobile' ? 'justify-center gap-x-3' : ''
          )}>
            {getColumns().flatMap(col => col.links).slice(0, device === 'mobile' ? 6 : 10).map((link, i) => (
              <a 
                key={i} 
                href={link.url} 
                className="text-xs font-medium text-white/60 hover:text-white transition-colors"
                onMouseEnter={(e) => e.currentTarget.style.color = brandColor}
                onMouseLeave={(e) => e.currentTarget.style.color = ''}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>

        {/* Bottom: Socials + Copyright */}
        <div className={cn(
          "flex items-center justify-between",
          device === 'mobile' ? 'flex-col gap-3' : ''
        )}>
          {config.showSocialLinks && (
            <div className="flex gap-2">
              {getSocials().map((s) => (
                <a 
                  key={s.id} 
                  href={s.url} 
                  className="h-7 w-7 flex items-center justify-center rounded-lg transition-all duration-300"
                  style={{ backgroundColor: `${brandColor}15`, color: '#fff' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = brandColor;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = `${brandColor}15`;
                  }}
                >
                  {renderSocialIcon(s.platform, 14)}
                </a>
              ))}
            </div>
          )}
          <p className="text-[10px] text-white/50">{config.copyright || '© 2024 VietAdmin. All rights reserved.'}</p>
        </div>
      </div>
    </footer>
  );

  // Logo size guidelines
  const logoGuidelines = {
    classic: '40×40px - Logo nhỏ trong header box',
    modern: '48×48px - Logo trong gradient box',
    corporate: '40×40px - Logo inline với brand name',
    minimal: '32×32px - Logo compact',
    centered: '48×48px - Logo nổi bật ở giữa',
    stacked: '40×40px - Logo với brandColor background'
  };

  return (
    <PreviewWrapper title="Preview Footer" device={device} setDevice={setDevice} previewStyle={previewStyle} setPreviewStyle={setPreviewStyle} styles={styles}>
      <BrowserFrame>
        {previewStyle === 'classic' && renderClassicStyle()}
        {previewStyle === 'modern' && renderModernStyle()}
        {previewStyle === 'corporate' && renderCorporateStyle()}
        {previewStyle === 'minimal' && renderMinimalStyle()}
        {previewStyle === 'centered' && renderCenteredStyle()}
        {previewStyle === 'stacked' && renderStackedStyle()}
      </BrowserFrame>
      {/* Logo size guidelines */}
      <div className="mt-3 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
        <div className="flex items-start gap-2">
          <ImageIcon size={12} className="text-slate-400 mt-0.5 flex-shrink-0" />
          <p className="text-[10px] text-slate-600 dark:text-slate-400">
            <strong>Logo:</strong> {logoGuidelines[previewStyle as keyof typeof logoGuidelines]} • PNG/SVG trong suốt, tỉ lệ 1:1
          </p>
        </div>
      </div>
    </PreviewWrapper>
  );
};

// ============ CTA PREVIEW ============
// 6 Styles: banner, centered, split, floating, gradient, minimal
// Best Practices: Clear CTA, Urgency indicators, Visual hierarchy, Touch-friendly (44px min), Whitespace, Action-oriented text
type CTAConfig = { 
  title: string; 
  description: string; 
  buttonText: string; 
  buttonLink: string; 
  secondaryButtonText: string; 
  secondaryButtonLink: string;
  badge?: string;
  backgroundImage?: string;
};
export type CTAStyle = 'banner' | 'centered' | 'split' | 'floating' | 'gradient' | 'minimal';
export const CTAPreview = ({ config, brandColor, selectedStyle, onStyleChange }: { config: CTAConfig; brandColor: string; selectedStyle?: CTAStyle; onStyleChange?: (style: CTAStyle) => void }) => {
  const [device, setDevice] = useState<PreviewDevice>('desktop');
  const previewStyle = selectedStyle || 'banner';
  const setPreviewStyle = (s: string) => onStyleChange?.(s as CTAStyle);
  const styles = [
    { id: 'banner', label: 'Banner' }, 
    { id: 'centered', label: 'Centered' }, 
    { id: 'split', label: 'Split' },
    { id: 'floating', label: 'Floating' },
    { id: 'gradient', label: 'Gradient' },
    { id: 'minimal', label: 'Minimal' }
  ];

  // Style 1: Banner - Full width với solid background
  const renderBannerStyle = () => (
    <section 
      className={cn("w-full", device === 'mobile' ? 'py-8 px-4' : 'py-12 px-6')} 
      style={{ backgroundColor: brandColor }}
    >
      <div className={cn(
        "max-w-4xl mx-auto flex items-center justify-between",
        device === 'mobile' ? 'flex-col text-center gap-6' : 'gap-8'
      )}>
        <div className={cn("flex-1", device === 'mobile' ? '' : 'max-w-lg')}>
          {config.badge && (
            <span className="inline-block px-3 py-1 mb-3 rounded-full text-xs font-semibold bg-white/20 text-white">
              {config.badge}
            </span>
          )}
          <h3 className={cn(
            "font-bold text-white line-clamp-2",
            device === 'mobile' ? 'text-xl' : 'text-2xl'
          )}>
            {config.title || 'Sẵn sàng bắt đầu?'}
          </h3>
          <p className={cn(
            "text-white/80 mt-2 line-clamp-2",
            device === 'mobile' ? 'text-sm' : 'text-base'
          )}>
            {config.description || 'Đăng ký ngay để nhận ưu đãi đặc biệt'}
          </p>
        </div>
        <div className={cn("flex gap-3 flex-shrink-0", device === 'mobile' ? 'flex-col w-full' : '')}>
          <button 
            className={cn(
              "bg-white rounded-lg font-medium whitespace-nowrap transition-all hover:shadow-lg hover:scale-105",
              device === 'mobile' ? 'px-5 py-3 min-h-[44px] text-sm' : 'px-6 py-3'
            )} 
            style={{ color: brandColor, boxShadow: `0 4px 12px ${brandColor}40` }}
          >
            {config.buttonText || 'Bắt đầu ngay'}
          </button>
          {config.secondaryButtonText && (
            <button className={cn(
              "border-2 border-white/50 text-white rounded-lg font-medium whitespace-nowrap hover:bg-white/10 transition-all",
              device === 'mobile' ? 'px-5 py-3 min-h-[44px] text-sm' : 'px-6 py-3'
            )}>
              {config.secondaryButtonText}
            </button>
          )}
        </div>
      </div>
    </section>
  );

  // Style 2: Centered - Text center với subtle background
  const renderCenteredStyle = () => (
    <section 
      className={cn("w-full text-center", device === 'mobile' ? 'py-10 px-4' : 'py-16 px-6')} 
      style={{ backgroundColor: `${brandColor}10` }}
    >
      <div className="max-w-2xl mx-auto">
        {config.badge && (
          <span 
            className="inline-block px-3 py-1 mb-4 rounded-full text-xs font-semibold"
            style={{ backgroundColor: `${brandColor}20`, color: brandColor }}
          >
            {config.badge}
          </span>
        )}
        <h3 
          className={cn("font-bold line-clamp-2", device === 'mobile' ? 'text-xl' : 'text-3xl')} 
          style={{ color: brandColor }}
        >
          {config.title || 'Sẵn sàng bắt đầu?'}
        </h3>
        <p className={cn(
          "text-slate-600 dark:text-slate-400 mt-3 line-clamp-3",
          device === 'mobile' ? 'text-sm' : 'text-base'
        )}>
          {config.description || 'Đăng ký ngay để nhận ưu đãi đặc biệt'}
        </p>
        <div className={cn("flex justify-center gap-3 mt-6", device === 'mobile' ? 'flex-col' : '')}>
          <button 
            className={cn(
              "rounded-lg font-medium text-white whitespace-nowrap transition-all hover:scale-105",
              device === 'mobile' ? 'px-6 py-3 min-h-[44px] text-sm' : 'px-8 py-3'
            )} 
            style={{ backgroundColor: brandColor, boxShadow: `0 4px 12px ${brandColor}40` }}
          >
            {config.buttonText || 'Bắt đầu ngay'}
          </button>
          {config.secondaryButtonText && (
            <button 
              className={cn(
                "border-2 rounded-lg font-medium whitespace-nowrap hover:bg-opacity-10 transition-all",
                device === 'mobile' ? 'px-6 py-3 min-h-[44px] text-sm' : 'px-8 py-3'
              )} 
              style={{ borderColor: brandColor, color: brandColor }}
            >
              {config.secondaryButtonText}
            </button>
          )}
        </div>
      </div>
    </section>
  );

  // Style 3: Split - Card với icon và border accent (khác Banner)
  const renderSplitStyle = () => (
    <section className={cn("w-full bg-slate-50 dark:bg-slate-900", device === 'mobile' ? 'py-8 px-4' : 'py-12 px-6')}>
      <div 
        className={cn(
          "max-w-4xl mx-auto bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border-l-4",
          device === 'mobile' ? 'p-5' : 'p-8'
        )}
        style={{ borderLeftColor: brandColor, boxShadow: `0 4px 20px ${brandColor}10` }}
      >
        <div className={cn(
          "flex items-start gap-5",
          device === 'mobile' ? 'flex-col' : ''
        )}>
          {/* Icon */}
          <div 
            className={cn(
              "rounded-xl flex items-center justify-center flex-shrink-0",
              device === 'mobile' ? 'w-12 h-12' : 'w-14 h-14'
            )}
            style={{ backgroundColor: `${brandColor}15` }}
          >
            <Rocket size={device === 'mobile' ? 24 : 28} style={{ color: brandColor }} />
          </div>
          
          {/* Content */}
          <div className="flex-1">
            {config.badge && (
              <span 
                className="inline-block px-2.5 py-0.5 mb-2 rounded text-xs font-semibold"
                style={{ backgroundColor: `${brandColor}15`, color: brandColor }}
              >
                {config.badge}
              </span>
            )}
            <h3 className={cn(
              "font-bold text-slate-900 dark:text-white line-clamp-2",
              device === 'mobile' ? 'text-lg' : 'text-xl'
            )}>
              {config.title || 'Sẵn sàng bắt đầu?'}
            </h3>
            <p className={cn(
              "text-slate-600 dark:text-slate-400 mt-1.5 line-clamp-2",
              device === 'mobile' ? 'text-sm' : 'text-base'
            )}>
              {config.description || 'Đăng ký ngay để nhận ưu đãi đặc biệt'}
            </p>
            
            {/* Buttons */}
            <div className={cn("flex gap-3 mt-4", device === 'mobile' ? 'flex-col' : '')}>
              <button 
                className={cn(
                  "rounded-lg font-medium text-white whitespace-nowrap transition-all hover:scale-105",
                  device === 'mobile' ? 'px-5 py-3 min-h-[44px] text-sm' : 'px-5 py-2.5'
                )} 
                style={{ backgroundColor: brandColor, boxShadow: `0 4px 12px ${brandColor}40` }}
              >
                {config.buttonText || 'Bắt đầu ngay'}
              </button>
              {config.secondaryButtonText && (
                <button 
                  className={cn(
                    "border rounded-lg font-medium whitespace-nowrap transition-all hover:bg-slate-50 dark:hover:bg-slate-700",
                    device === 'mobile' ? 'px-5 py-3 min-h-[44px] text-sm' : 'px-5 py-2.5'
                  )}
                  style={{ borderColor: `${brandColor}30`, color: brandColor }}
                >
                  {config.secondaryButtonText}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );

  // Style 4: Floating - Card nổi với shadow
  const renderFloatingStyle = () => (
    <section className={cn("w-full bg-slate-50 dark:bg-slate-900", device === 'mobile' ? 'py-8 px-4' : 'py-12 px-6')}>
      <div 
        className={cn(
          "max-w-4xl mx-auto bg-white dark:bg-slate-800 rounded-2xl border overflow-hidden",
          device === 'mobile' ? 'p-5' : 'p-8'
        )}
        style={{ 
          borderColor: `${brandColor}20`,
          boxShadow: `0 20px 40px ${brandColor}15`
        }}
      >
        <div className={cn(
          "flex items-center justify-between",
          device === 'mobile' ? 'flex-col text-center gap-5' : 'gap-8'
        )}>
          <div className={cn("flex-1", device === 'mobile' ? '' : 'max-w-md')}>
            {config.badge && (
              <span 
                className="inline-flex items-center gap-2 px-3 py-1 mb-3 rounded-full text-xs font-semibold"
                style={{ backgroundColor: `${brandColor}15`, color: brandColor }}
              >
                <Zap size={12} />
                {config.badge}
              </span>
            )}
            <h3 className={cn(
              "font-bold text-slate-900 dark:text-white line-clamp-2",
              device === 'mobile' ? 'text-lg' : 'text-2xl'
            )}>
              {config.title || 'Sẵn sàng bắt đầu?'}
            </h3>
            <p className={cn(
              "text-slate-600 dark:text-slate-400 mt-2 line-clamp-2",
              device === 'mobile' ? 'text-sm' : 'text-base'
            )}>
              {config.description || 'Đăng ký ngay để nhận ưu đãi đặc biệt'}
            </p>
          </div>
          <div className={cn("flex gap-3 flex-shrink-0", device === 'mobile' ? 'flex-col w-full' : '')}>
            <button 
              className={cn(
                "rounded-xl font-medium text-white whitespace-nowrap transition-all hover:scale-105",
                device === 'mobile' ? 'px-5 py-3 min-h-[44px] text-sm' : 'px-6 py-3'
              )} 
              style={{ backgroundColor: brandColor, boxShadow: `0 4px 12px ${brandColor}40` }}
            >
              {config.buttonText || 'Bắt đầu ngay'}
            </button>
            {config.secondaryButtonText && (
              <button 
                className={cn(
                  "rounded-xl font-medium whitespace-nowrap transition-all hover:bg-slate-100 dark:hover:bg-slate-700",
                  device === 'mobile' ? 'px-5 py-3 min-h-[44px] text-sm' : 'px-6 py-3'
                )}
                style={{ color: brandColor }}
              >
                {config.secondaryButtonText}
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );

  // Style 5: Gradient - Multi-color gradient với decorative elements
  const renderGradientStyle = () => (
    <section 
      className={cn("w-full relative overflow-hidden", device === 'mobile' ? 'py-10 px-4' : 'py-16 px-6')}
      style={{ 
        background: `linear-gradient(135deg, ${brandColor} 0%, ${brandColor}cc 50%, ${brandColor}99 100%)`
      }}
    >
      {/* Decorative circles */}
      <div 
        className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-20"
        style={{ backgroundColor: 'white' }}
      />
      <div 
        className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full opacity-10"
        style={{ backgroundColor: 'white' }}
      />
      
      <div className="max-w-3xl mx-auto text-center relative z-10">
        {config.badge && (
          <span className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 rounded-full text-xs font-semibold bg-white/20 text-white backdrop-blur-sm">
            <Star size={12} className="fill-white" />
            {config.badge}
          </span>
        )}
        <h3 className={cn(
          "font-bold text-white line-clamp-2",
          device === 'mobile' ? 'text-2xl' : 'text-4xl'
        )}>
          {config.title || 'Sẵn sàng bắt đầu?'}
        </h3>
        <p className={cn(
          "text-white/90 mt-4 max-w-xl mx-auto line-clamp-3",
          device === 'mobile' ? 'text-sm' : 'text-lg'
        )}>
          {config.description || 'Đăng ký ngay để nhận ưu đãi đặc biệt'}
        </p>
        <div className={cn("flex justify-center gap-4 mt-8", device === 'mobile' ? 'flex-col' : '')}>
          <button 
            className={cn(
              "bg-white rounded-full font-semibold whitespace-nowrap transition-all hover:scale-105 hover:shadow-xl",
              device === 'mobile' ? 'px-6 py-3 min-h-[44px] text-sm' : 'px-8 py-4'
            )} 
            style={{ color: brandColor, boxShadow: `0 8px 24px rgba(0,0,0,0.2)` }}
          >
            {config.buttonText || 'Bắt đầu ngay'}
          </button>
          {config.secondaryButtonText && (
            <button className={cn(
              "border-2 border-white text-white rounded-full font-semibold whitespace-nowrap hover:bg-white/10 transition-all",
              device === 'mobile' ? 'px-6 py-3 min-h-[44px] text-sm' : 'px-8 py-4'
            )}>
              {config.secondaryButtonText}
            </button>
          )}
        </div>
      </div>
    </section>
  );

  // Style 6: Minimal - Clean, simple với accent line
  const renderMinimalStyle = () => (
    <section className={cn(
      "w-full border-y",
      device === 'mobile' ? 'py-8 px-4' : 'py-12 px-6'
    )} style={{ borderColor: `${brandColor}20` }}>
      <div className={cn(
        "max-w-4xl mx-auto flex items-center",
        device === 'mobile' ? 'flex-col text-center gap-5' : 'justify-between gap-8'
      )}>
        <div className="flex items-center gap-4">
          {/* Accent line */}
          <div 
            className={cn("w-1 rounded-full flex-shrink-0", device === 'mobile' ? 'hidden' : 'h-16')}
            style={{ backgroundColor: brandColor }}
          />
          <div>
            <h3 className={cn(
              "font-bold text-slate-900 dark:text-white line-clamp-1",
              device === 'mobile' ? 'text-lg' : 'text-xl'
            )}>
              {config.title || 'Sẵn sàng bắt đầu?'}
            </h3>
            <p className={cn(
              "text-slate-500 dark:text-slate-400 mt-1 line-clamp-1",
              device === 'mobile' ? 'text-sm' : 'text-base'
            )}>
              {config.description || 'Đăng ký ngay để nhận ưu đãi đặc biệt'}
            </p>
          </div>
        </div>
        <div className={cn("flex gap-3 flex-shrink-0", device === 'mobile' ? 'w-full' : '')}>
          <button 
            className={cn(
              "rounded-lg font-medium text-white whitespace-nowrap transition-all hover:scale-105",
              device === 'mobile' ? 'flex-1 px-4 py-3 min-h-[44px] text-sm' : 'px-6 py-2.5'
            )} 
            style={{ backgroundColor: brandColor, boxShadow: `0 4px 12px ${brandColor}30` }}
          >
            {config.buttonText || 'Bắt đầu ngay'}
          </button>
          {config.secondaryButtonText && (
            <button 
              className={cn(
                "border rounded-lg font-medium whitespace-nowrap transition-all hover:bg-slate-50 dark:hover:bg-slate-800",
                device === 'mobile' ? 'flex-1 px-4 py-3 min-h-[44px] text-sm' : 'px-6 py-2.5'
              )}
              style={{ borderColor: `${brandColor}30`, color: brandColor }}
            >
              {config.secondaryButtonText}
            </button>
          )}
        </div>
      </div>
    </section>
  );

  return (
    <PreviewWrapper title="Preview CTA" device={device} setDevice={setDevice} previewStyle={previewStyle} setPreviewStyle={setPreviewStyle} styles={styles}>
      <BrowserFrame>
        {previewStyle === 'banner' && renderBannerStyle()}
        {previewStyle === 'centered' && renderCenteredStyle()}
        {previewStyle === 'split' && renderSplitStyle()}
        {previewStyle === 'floating' && renderFloatingStyle()}
        {previewStyle === 'gradient' && renderGradientStyle()}
        {previewStyle === 'minimal' && renderMinimalStyle()}
      </BrowserFrame>
    </PreviewWrapper>
  );
};

// ============ ABOUT PREVIEW ============
// Brand Story UI/UX - 6 Variants: classic, bento, minimal, split, timeline, showcase
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
  imageCaption?: string; // Configurable caption for bento style image overlay
};
export type AboutStyle = 'classic' | 'bento' | 'minimal' | 'split' | 'timeline' | 'showcase';

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
    { id: 'minimal', label: 'Minimal' },
    { id: 'split', label: 'Split' },
    { id: 'timeline', label: 'Timeline' },
    { id: 'showcase', label: 'Showcase' }
  ];

  // Empty state
  const hasContent = config.heading || config.description || config.image || config.stats.length > 0;
  if (!hasContent) {
    return (
      <PreviewWrapper title="Preview About" device={device} setDevice={setDevice} previewStyle={previewStyle} setPreviewStyle={setPreviewStyle} styles={styles}>
        <BrowserFrame url="yoursite.com/about">
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: `${brandColor}10` }}>
              <Users size={32} style={{ color: brandColor }} />
            </div>
            <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-1">Chưa có nội dung</h3>
            <p className="text-sm text-slate-500">Nhập tiêu đề và mô tả để bắt đầu</p>
          </div>
        </BrowserFrame>
      </PreviewWrapper>
    );
  }

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
          {(config.imageCaption || config.image) && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6 md:p-8">
              <p className="text-white font-medium text-base md:text-lg">
                {config.imageCaption || 'Kiến tạo không gian làm việc hiện đại & bền vững.'}
              </p>
            </div>
          )}
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

  // Style 4: Split - Layout chia đôi (Content trái, Image phải)
  const renderSplitStyle = () => (
    <section className="relative w-full bg-white dark:bg-slate-900 overflow-hidden">
      <div className={cn(
        "flex",
        device === 'mobile' ? 'flex-col h-auto' : 'flex-row min-h-[400px] md:min-h-[500px]'
      )}>
        {/* Content Side */}
        <div className={cn(
          "flex flex-col justify-center bg-slate-50 dark:bg-slate-800/50",
          device === 'mobile' ? 'p-6 order-2' : 'w-1/2 p-8 lg:p-12'
        )}>
          <div className={cn("space-y-4", device === 'mobile' ? '' : 'max-w-md')}>
            {config.subHeading && (
              <AboutBadge text={config.subHeading} variant="outline" brandColor={brandColor} />
            )}
            <h2 className={cn("font-bold text-slate-900 dark:text-white leading-tight", device === 'mobile' ? 'text-xl' : 'text-2xl lg:text-3xl')}>
              {config.heading || 'Câu chuyện của chúng tôi'}
            </h2>
            <p className={cn("text-slate-600 dark:text-slate-300 leading-relaxed", device === 'mobile' ? 'text-sm' : 'text-base')}>
              {config.description || 'Mô tả về công ty...'}
            </p>
            {/* Stats inline */}
            {config.stats.length > 0 && (
              <div className="flex gap-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                {config.stats.slice(0, 2).map((stat) => (
                  <div key={stat.id} className="flex flex-col">
                    <span className="text-2xl font-bold" style={{ color: brandColor }}>{stat.value || '0'}</span>
                    <span className="text-xs text-slate-500">{stat.label || 'Label'}</span>
                  </div>
                ))}
              </div>
            )}
            {config.buttonText && (
              <div className="pt-2">
                <button className={cn("font-medium rounded-lg text-white", device === 'mobile' ? 'px-4 py-2 text-sm' : 'px-6 py-2.5')} style={{ backgroundColor: brandColor }}>
                  {config.buttonText}
                </button>
              </div>
            )}
          </div>
        </div>
        {/* Image Side */}
        <div className={cn(
          "relative overflow-hidden",
          device === 'mobile' ? 'w-full h-[200px] order-1' : 'w-1/2'
        )}>
          {config.image ? (
            <img src={config.image} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-200 dark:bg-slate-700">
              <ImageIcon size={40} className="text-slate-400" />
            </div>
          )}
        </div>
      </div>
    </section>
  );

  // Style 5: Timeline - Vertical timeline với milestones
  const renderTimelineStyle = () => (
    <section className={cn("py-10", device === 'mobile' ? 'px-4' : 'px-6 md:px-8')}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          {config.subHeading && (
            <div className="flex justify-center mb-3">
              <AboutBadge text={config.subHeading} variant="default" brandColor={brandColor} />
            </div>
          )}
          <h2 className={cn("font-bold text-slate-900 dark:text-slate-100", device === 'mobile' ? 'text-xl' : 'text-2xl md:text-3xl')}>
            {config.heading || 'Hành trình phát triển'}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-2 max-w-2xl mx-auto text-sm">
            {config.description || 'Mô tả về công ty...'}
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-4 md:left-1/2 md:-translate-x-px top-0 bottom-0 w-0.5" style={{ backgroundColor: `${brandColor}20` }} />
          
          <div className="space-y-8">
            {config.stats.slice(0, 4).map((stat, idx) => (
              <div key={stat.id} className={cn("relative flex", device === 'mobile' ? 'pl-12' : idx % 2 === 0 ? 'md:flex-row-reverse' : '')}>
                {/* Dot */}
                <div className={cn(
                  "absolute w-8 h-8 rounded-full border-4 bg-white dark:bg-slate-900 flex items-center justify-center text-xs font-bold",
                  device === 'mobile' ? 'left-0' : 'left-1/2 -translate-x-1/2'
                )} style={{ borderColor: brandColor, color: brandColor }}>
                  {idx + 1}
                </div>
                {/* Content card */}
                <div className={cn(
                  "bg-white dark:bg-slate-800 rounded-xl p-4 border shadow-sm",
                  device === 'mobile' ? 'w-full' : 'w-5/12'
                )} style={{ borderColor: `${brandColor}15` }}>
                  <span className="text-2xl font-bold" style={{ color: brandColor }}>{stat.value || '0'}</span>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{stat.label || 'Milestone'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Image at bottom */}
        {config.image && (
          <div className="mt-10 rounded-2xl overflow-hidden aspect-[16/9] max-h-[300px]">
            <img src={config.image} alt="" className="w-full h-full object-cover" />
          </div>
        )}

        {config.buttonText && (
          <div className="text-center mt-8">
            <button className="px-6 py-2.5 rounded-lg font-medium text-white" style={{ backgroundColor: brandColor }}>
              {config.buttonText}
            </button>
          </div>
        )}
      </div>
    </section>
  );

  // Style 6: Showcase - Card nổi bật với ảnh lớn và stats gradient
  const renderShowcaseStyle = () => (
    <section className={cn("py-8", device === 'mobile' ? 'px-3' : 'py-10 px-6')}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          {config.subHeading && (
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-3" style={{ backgroundColor: `${brandColor}15`, color: brandColor }}>
              {config.subHeading}
            </span>
          )}
          <h2 className={cn("font-bold text-slate-900 dark:text-slate-100 mb-2", device === 'mobile' ? 'text-xl' : 'text-2xl md:text-3xl')}>
            {config.heading || 'Câu chuyện thương hiệu'}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-sm">
            {config.description || 'Mô tả về công ty...'}
          </p>
        </div>

        {/* Main Content Grid */}
        <div className={cn("grid gap-4", device === 'mobile' ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2 gap-5')}>
          {/* Image Card */}
          <div className={cn("relative rounded-2xl overflow-hidden group", device === 'mobile' ? 'aspect-[4/3]' : 'aspect-auto min-h-[320px]')}>
            {config.image ? (
              <>
                <img src={config.image} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-800">
                <ImageIcon size={48} className="text-slate-300" />
              </div>
            )}
            {config.buttonText && (
              <div className="absolute bottom-3 left-3 right-3">
                <button 
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white text-sm backdrop-blur-sm transition-all hover:scale-105"
                  style={{ backgroundColor: brandColor }}
                >
                  {config.buttonText}
                  <ArrowRight size={14} />
                </button>
              </div>
            )}
          </div>

          {/* Stats Cards Grid */}
          <div className={cn("grid gap-3", device === 'mobile' ? 'grid-cols-2' : 'grid-cols-2 gap-4')}>
            {config.stats.slice(0, 4).map((stat, idx) => (
              <div 
                key={stat.id} 
                className="rounded-xl p-4 flex flex-col justify-center text-center transition-all hover:scale-[1.02]"
                style={{ 
                  backgroundColor: idx === 0 ? brandColor : `${brandColor}${10 + idx * 5}`,
                }}
              >
                <span className={cn("font-bold mb-1", device === 'mobile' ? 'text-2xl' : 'text-3xl')} style={{ color: idx === 0 ? 'white' : brandColor }}>
                  {stat.value || '0'}
                </span>
                <span className={cn("text-xs font-medium", idx === 0 ? 'text-white/80' : 'text-slate-600 dark:text-slate-400')}>
                  {stat.label || 'Label'}
                </span>
              </div>
            ))}
            {/* Fill empty slots */}
            {config.stats.length < 4 && Array.from({ length: 4 - config.stats.length }).map((_, idx) => (
              <div 
                key={`empty-${idx}`} 
                className="rounded-xl p-4 flex items-center justify-center"
                style={{ backgroundColor: `${brandColor}08` }}
              >
                <Plus size={16} className="text-slate-300" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );

  // Image size guidelines component
  const ImageGuidelines = () => (
    <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
      <div className="flex items-start gap-2">
        <ImageIcon size={14} className="text-slate-400 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-slate-600 dark:text-slate-400">
          {previewStyle === 'classic' && <p><strong>1200×800px</strong> (3:2) • Ảnh bên trái, subject đặt giữa</p>}
          {previewStyle === 'bento' && <p><strong>1920×600px</strong> (16:5) • Banner ngang, góc dưới có caption overlay</p>}
          {previewStyle === 'minimal' && <p><strong>800×600px</strong> (4:3) • Ảnh bên phải chiếm 45%, object-cover</p>}
          {previewStyle === 'split' && <p><strong>960×600px</strong> (8:5) • Ảnh bên phải 50%, subject đặt giữa/trái</p>}
          {previewStyle === 'timeline' && <p><strong>1200×400px</strong> (3:1) • Banner ngang cuối section, optional</p>}
          {previewStyle === 'showcase' && <p><strong>800×600px</strong> (4:3) • Ảnh trái card lớn, subject đặt giữa/trái</p>}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <PreviewWrapper title="Preview About" device={device} setDevice={setDevice} previewStyle={previewStyle} setPreviewStyle={setPreviewStyle} styles={styles}>
        <BrowserFrame url="yoursite.com/about">
          {previewStyle === 'classic' && renderClassicStyle()}
          {previewStyle === 'bento' && renderBentoStyle()}
          {previewStyle === 'minimal' && renderMinimalStyle()}
          {previewStyle === 'split' && renderSplitStyle()}
          {previewStyle === 'timeline' && renderTimelineStyle()}
          {previewStyle === 'showcase' && renderShowcaseStyle()}
        </BrowserFrame>
      </PreviewWrapper>
      <ImageGuidelines />
    </>
  );
};

// ============ BENEFITS PREVIEW (Why Choose Us) ============
// 6 Professional Styles: Solid Cards, Accent List, Bold Bento, Icon Row, Carousel, Timeline
type BenefitItem = { id: number; icon: string; title: string; description: string };
export type BenefitsStyle = 'cards' | 'list' | 'bento' | 'row' | 'carousel' | 'timeline';
export type BenefitsConfig = { subHeading?: string; heading?: string; buttonText?: string; buttonLink?: string };
export const BenefitsPreview = ({ items, brandColor, selectedStyle, onStyleChange, config }: { items: BenefitItem[]; brandColor: string; selectedStyle?: BenefitsStyle; onStyleChange?: (style: BenefitsStyle) => void; config?: BenefitsConfig }) => {
  const [device, setDevice] = useState<PreviewDevice>('desktop');
  const previewStyle = selectedStyle || 'cards';
  const setPreviewStyle = (s: string) => onStyleChange?.(s as BenefitsStyle);
  const styles = [
    { id: 'cards', label: 'Solid Cards' }, 
    { id: 'list', label: 'Accent List' }, 
    { id: 'bento', label: 'Bold Bento' },
    { id: 'row', label: 'Icon Row' },
    { id: 'carousel', label: 'Carousel' },
    { id: 'timeline', label: 'Timeline' }
  ];
  const subHeading = config?.subHeading || 'Vì sao chọn chúng tôi?';
  const heading = config?.heading || 'Giá trị cốt lõi';

  // Header Component - reusable
  const BenefitsHeader = () => (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b-2 mb-6" style={{ borderColor: `${brandColor}20` }}>
      <div className="space-y-2">
        <div className="inline-block px-3 py-1 rounded text-xs font-bold uppercase tracking-wider" style={{ backgroundColor: `${brandColor}15`, color: brandColor }}>
          {subHeading}
        </div>
        <h2 className={cn("font-bold tracking-tight text-slate-900 dark:text-slate-100", device === 'mobile' ? 'text-xl' : 'text-2xl md:text-3xl')}>
          {heading}
        </h2>
      </div>
    </div>
  );

  // Empty State
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: `${brandColor}10` }}>
        <Check size={32} style={{ color: brandColor }} />
      </div>
      <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-1">Chưa có lợi ích nào</h3>
      <p className="text-sm text-slate-500">Thêm lợi ích đầu tiên để bắt đầu</p>
    </div>
  );

  // Max visible items
  const MAX_VISIBLE = device === 'mobile' ? 4 : 6;
  const visibleItems = items.slice(0, MAX_VISIBLE);
  const remainingCount = items.length - MAX_VISIBLE;

  // Style 1: Corporate Cards - Solid background với icon đậm màu chủ đạo
  const renderCardsStyle = () => (
    <div className={cn("py-8 px-4", device === 'mobile' ? 'py-6 px-3' : 'md:py-12 md:px-6')}>
      <BenefitsHeader />
      {items.length === 0 ? <EmptyState /> : (
        <div className={cn(
          "grid gap-4 md:gap-6",
          items.length === 1 ? 'max-w-md mx-auto' : items.length === 2 ? 'max-w-2xl mx-auto grid-cols-2' : '',
          items.length >= 3 && (device === 'mobile' ? 'grid-cols-1' : device === 'tablet' ? 'grid-cols-2' : 'grid-cols-2 lg:grid-cols-4')
        )}>
          {visibleItems.map((item) => (
            <div 
              key={item.id} 
              className="rounded-xl p-5 md:p-6 shadow-sm flex flex-col items-start border"
              style={{ backgroundColor: `${brandColor}08`, borderColor: `${brandColor}20` }}
            >
              <div 
                className="w-11 h-11 md:w-12 md:h-12 rounded-lg flex items-center justify-center mb-4 text-white"
                style={{ backgroundColor: brandColor, boxShadow: `0 4px 6px -1px ${brandColor}30` }}
              >
                <Check size={18} strokeWidth={3} />
              </div>
              <h3 className="font-bold text-base md:text-lg mb-2 line-clamp-2" style={{ color: brandColor }}>
                {item.title || 'Tiêu đề'}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3 min-h-[3.75rem]">
                {item.description || 'Mô tả lợi ích...'}
              </p>
            </div>
          ))}
          {remainingCount > 0 && (
            <div className="rounded-xl flex items-center justify-center border-2 border-dashed p-5" style={{ borderColor: `${brandColor}30` }}>
              <div className="text-center">
                <Plus size={28} className="mx-auto mb-2" style={{ color: brandColor }} />
                <span className="text-lg font-bold" style={{ color: brandColor }}>+{remainingCount}</span>
                <p className="text-xs text-slate-400">mục khác</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  // Style 2: Modern List - Thanh màu bên trái nhấn mạnh
  const renderListStyle = () => (
    <div className={cn("py-8 px-4", device === 'mobile' ? 'py-6 px-3' : 'md:py-12 md:px-6')}>
      <BenefitsHeader />
      {items.length === 0 ? <EmptyState /> : (
        <div className="flex flex-col gap-3 max-w-4xl mx-auto">
          {visibleItems.map((item, index) => (
            <div 
              key={item.id} 
              className="relative bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-lg p-4 md:p-5 pl-5 md:pl-6 overflow-hidden shadow-sm"
            >
              <div className="absolute top-0 bottom-0 left-0 w-1.5" style={{ backgroundColor: brandColor }} />
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-3">
                <div className="flex items-start gap-3 md:gap-4">
                  <div className="flex-shrink-0 mt-0.5">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center border" style={{ backgroundColor: `${brandColor}15`, borderColor: `${brandColor}30` }}>
                      <span className="text-[11px] font-bold" style={{ color: brandColor }}>{index + 1}</span>
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm md:text-base line-clamp-1">{item.title || 'Tiêu đề'}</h3>
                    <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1 md:mt-1.5 leading-normal line-clamp-2">{item.description || 'Mô tả lợi ích...'}</p>
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
          {remainingCount > 0 && (
            <div className="text-center py-3">
              <span className="text-sm font-medium" style={{ color: brandColor }}>+{remainingCount} mục khác</span>
            </div>
          )}
        </div>
      )}
    </div>
  );

  // Style 3: Trust Bento - Typography focused với layout 2-1 / 1-2
  const renderBentoStyle = () => (
    <div className={cn("py-8 px-4", device === 'mobile' ? 'py-6 px-3' : 'md:py-12 md:px-6')}>
      <BenefitsHeader />
      {items.length === 0 ? <EmptyState /> : (
        <div className={cn("grid gap-3 md:gap-4", device === 'mobile' ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3')}>
          {items.slice(0, 4).map((item, index) => {
            const isWide = index === 0 || index === 3;
            const isPrimary = index === 0;
            return (
              <div 
                key={item.id} 
                className={cn(
                  "flex flex-col justify-between p-5 md:p-6 lg:p-8 rounded-2xl transition-colors min-h-[160px] md:min-h-[180px]",
                  device !== 'mobile' && isWide ? "md:col-span-2" : device !== 'mobile' ? "md:col-span-1" : "",
                  isPrimary ? "text-white border border-transparent" : "bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700"
                )}
                style={isPrimary ? { backgroundColor: brandColor, boxShadow: `0 10px 15px -3px ${brandColor}30` } : {}}
              >
                <div className="flex justify-between items-start mb-3 md:mb-4">
                  <span className={cn("text-xs font-bold uppercase tracking-widest px-2 py-1 rounded", isPrimary ? "bg-white/20 text-white" : "")} style={!isPrimary ? { backgroundColor: `${brandColor}15`, color: brandColor } : {}}>
                    0{index + 1}
                  </span>
                </div>
                <div>
                  <h3 className={cn("font-bold mb-2 md:mb-3 tracking-tight line-clamp-2", device === 'mobile' ? 'text-lg' : 'text-xl md:text-2xl', isPrimary ? "text-white" : "text-slate-900 dark:text-slate-100")}>
                    {item.title || 'Tiêu đề'}
                  </h3>
                  <p className={cn("text-sm md:text-base leading-relaxed font-medium line-clamp-3", isPrimary ? "text-white/90" : "text-slate-500 dark:text-slate-400")}>
                    {item.description || 'Mô tả lợi ích...'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  // Style 4: Minimal Row - Icon to với dividers
  const renderRowStyle = () => (
    <div className={cn("py-8 px-4", device === 'mobile' ? 'py-6 px-3' : 'md:py-12 md:px-6')}>
      <BenefitsHeader />
      {items.length === 0 ? <EmptyState /> : (
        <div className="bg-white dark:bg-slate-800 border-y-2 rounded-lg overflow-hidden" style={{ borderColor: `${brandColor}15` }}>
          <div className={cn("flex items-stretch", device === 'mobile' ? 'flex-col divide-y' : 'flex-row divide-x')} style={{ borderColor: `${brandColor}15` }}>
            {items.slice(0, 4).map((item) => (
              <div key={item.id} className="flex-1 w-full p-5 md:p-6 lg:p-8 flex flex-col items-center text-center">
                <div className="mb-3 md:mb-4 p-3 rounded-full" style={{ backgroundColor: `${brandColor}15`, color: brandColor, boxShadow: `0 0 0 4px ${brandColor}08` }}>
                  <Check size={22} strokeWidth={3} />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-1.5 md:mb-2 text-sm md:text-base line-clamp-2 min-h-[2.5rem]">{item.title || 'Tiêu đề'}</h3>
                <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3">{item.description || 'Mô tả lợi ích...'}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // Style 5: Carousel - Horizontal scroll với navigation
  const [carouselIndex, setCarouselIndex] = useState(0);
  const renderCarouselStyle = () => {
    const itemsPerView = device === 'mobile' ? 1 : device === 'tablet' ? 2 : 3;
    const maxIndex = Math.max(0, items.length - itemsPerView);
    return (
      <div className={cn("py-8 px-4", device === 'mobile' ? 'py-6 px-3' : 'md:py-12 md:px-6')}>
        <BenefitsHeader />
        {items.length === 0 ? <EmptyState /> : (
          <div className="relative">
            {/* Navigation Arrows */}
            {items.length > itemsPerView && (
              <>
                <button
                  onClick={() => setCarouselIndex(Math.max(0, carouselIndex - 1))}
                  disabled={carouselIndex === 0}
                  className={cn("absolute -left-2 md:-left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white dark:bg-slate-800 shadow-lg border flex items-center justify-center transition-all", carouselIndex === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110')}
                  style={{ borderColor: `${brandColor}20` }}
                >
                  <ChevronLeft size={20} style={{ color: brandColor }} />
                </button>
                <button
                  onClick={() => setCarouselIndex(Math.min(maxIndex, carouselIndex + 1))}
                  disabled={carouselIndex >= maxIndex}
                  className={cn("absolute -right-2 md:-right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white dark:bg-slate-800 shadow-lg border flex items-center justify-center transition-all", carouselIndex >= maxIndex ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110')}
                  style={{ borderColor: `${brandColor}20` }}
                >
                  <ChevronRight size={20} style={{ color: brandColor }} />
                </button>
              </>
            )}
            {/* Carousel Container */}
            <div className="overflow-hidden mx-4 md:mx-8">
              <div className="flex transition-transform duration-300 ease-out gap-4" style={{ transform: `translateX(-${carouselIndex * (100 / itemsPerView)}%)` }}>
                {items.map((item, idx) => (
                  <div 
                    key={item.id} 
                    className="flex-shrink-0 rounded-xl p-5 md:p-6 border shadow-sm"
                    style={{ width: `calc(${100 / itemsPerView}% - ${(itemsPerView - 1) * 16 / itemsPerView}px)`, backgroundColor: idx === 0 ? brandColor : `${brandColor}08`, borderColor: `${brandColor}20` }}
                  >
                    <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center mb-4", idx === 0 ? 'bg-white/20' : '')} style={idx !== 0 ? { backgroundColor: brandColor } : {}}>
                      <Check size={18} strokeWidth={3} className={idx === 0 ? 'text-white' : ''} style={idx !== 0 ? { color: 'white' } : {}} />
                    </div>
                    <h3 className={cn("font-bold text-base mb-2 line-clamp-2", idx === 0 ? 'text-white' : '')} style={idx !== 0 ? { color: brandColor } : {}}>{item.title || 'Tiêu đề'}</h3>
                    <p className={cn("text-sm leading-relaxed line-clamp-3", idx === 0 ? 'text-white/80' : 'text-slate-500 dark:text-slate-400')}>{item.description || 'Mô tả...'}</p>
                  </div>
                ))}
              </div>
            </div>
            {/* Dots Indicator */}
            {items.length > itemsPerView && (
              <div className="flex justify-center gap-2 mt-4">
                {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
                  <button key={idx} onClick={() => setCarouselIndex(idx)} className={cn("w-2 h-2 rounded-full transition-all", carouselIndex === idx ? 'w-6' : '')} style={{ backgroundColor: carouselIndex === idx ? brandColor : `${brandColor}30` }} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Style 6: Timeline - Vertical timeline với milestones
  const renderTimelineStyle = () => (
    <div className={cn("py-8 px-4", device === 'mobile' ? 'py-6 px-3' : 'md:py-12 md:px-6')}>
      <BenefitsHeader />
      {items.length === 0 ? <EmptyState /> : (
        <div className="relative max-w-3xl mx-auto">
          {/* Vertical Line */}
          <div className={cn("absolute top-0 bottom-0 w-0.5", device === 'mobile' ? 'left-4' : 'left-1/2 -translate-x-px')} style={{ backgroundColor: `${brandColor}20` }} />
          <div className="space-y-6 md:space-y-8">
            {visibleItems.map((item, idx) => (
              <div key={item.id} className={cn("relative flex items-start", device === 'mobile' ? 'pl-12' : idx % 2 === 0 ? 'flex-row' : 'flex-row-reverse')}>
                {/* Dot */}
                <div className={cn("absolute w-8 h-8 rounded-full border-4 bg-white dark:bg-slate-900 flex items-center justify-center text-xs font-bold z-10", device === 'mobile' ? 'left-0' : 'left-1/2 -translate-x-1/2')} style={{ borderColor: brandColor, color: brandColor }}>
                  {idx + 1}
                </div>
                {/* Content Card */}
                <div className={cn("bg-white dark:bg-slate-800 rounded-xl p-4 md:p-5 border shadow-sm", device === 'mobile' ? 'w-full' : 'w-5/12')} style={{ borderColor: `${brandColor}15` }}>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-2 line-clamp-2" style={{ color: brandColor }}>{item.title || 'Tiêu đề'}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3">{item.description || 'Mô tả...'}</p>
                </div>
              </div>
            ))}
          </div>
          {remainingCount > 0 && (
            <div className="text-center mt-6">
              <span className="text-sm font-medium" style={{ color: brandColor }}>+{remainingCount} mục khác</span>
            </div>
          )}
          {/* CTA Button */}
          {config?.buttonText && (
            <div className="text-center mt-8">
              <a href={config.buttonLink || '#'} className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium text-white" style={{ backgroundColor: brandColor }}>
                {config.buttonText}
                <ArrowRight size={16} />
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <PreviewWrapper title="Preview Lợi ích" device={device} setDevice={setDevice} previewStyle={previewStyle} setPreviewStyle={setPreviewStyle} styles={styles} info={`${items.length} lợi ích`}>
      <BrowserFrame url="yoursite.com/why-us">
        {previewStyle === 'cards' && renderCardsStyle()}
        {previewStyle === 'list' && renderListStyle()}
        {previewStyle === 'bento' && renderBentoStyle()}
        {previewStyle === 'row' && renderRowStyle()}
        {previewStyle === 'carousel' && renderCarouselStyle()}
        {previewStyle === 'timeline' && renderTimelineStyle()}
      </BrowserFrame>
    </PreviewWrapper>
  );
};

// ============ CASE STUDY / PROJECTS PREVIEW ============
type ProjectItem = { id: number; title: string; category: string; image: string; description: string; link: string };
export type CaseStudyStyle = 'grid' | 'featured' | 'list' | 'masonry' | 'carousel' | 'timeline';
export const CaseStudyPreview = ({ projects, brandColor, selectedStyle, onStyleChange }: { projects: ProjectItem[]; brandColor: string; selectedStyle?: CaseStudyStyle; onStyleChange?: (style: CaseStudyStyle) => void }) => {
  const [device, setDevice] = useState<PreviewDevice>('desktop');
  const [carouselIndex, setCarouselIndex] = useState(0);
  const previewStyle = selectedStyle || 'grid';
  const setPreviewStyle = (s: string) => onStyleChange?.(s as CaseStudyStyle);
  const styles = [
    { id: 'grid', label: 'Grid' }, 
    { id: 'featured', label: 'Featured' }, 
    { id: 'list', label: 'List' },
    { id: 'masonry', label: 'Masonry' },
    { id: 'carousel', label: 'Carousel' },
    { id: 'timeline', label: 'Timeline' }
  ];

  // Dynamic Image Size Info
  const getImageSizeInfo = () => {
    const count = projects.length;
    if (count === 0) return 'Chưa có dự án';
    switch (previewStyle) {
      case 'grid':
        return `${count} dự án • Tất cả: 1200×800px (3:2)`;
      case 'featured':
        if (count === 1) return 'Dự án 1: 1200×800px (3:2)';
        return `Dự án 1: 1200×800px • Dự án 2-${Math.min(count, 3)}: 600×600px (1:1)`;
      case 'list':
        return `${count} dự án • Tất cả: 800×500px (16:10)`;
      case 'masonry':
        return `${count} dự án • Ngang: 800×500px • Dọc: 600×900px • Vuông: 800×800px`;
      case 'carousel':
        return `${count} dự án • Tất cả: 1000×750px (4:3)`;
      case 'timeline':
        return `${count} dự án • Tất cả: 800×600px (4:3)`;
      default:
        return `${count} dự án`;
    }
  };

  // Empty State
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" 
        style={{ backgroundColor: `${brandColor}10` }}>
        <FileText size={32} style={{ color: brandColor }} />
      </div>
      <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-1">Chưa có dự án nào</h3>
      <p className="text-sm text-slate-500">Thêm dự án đầu tiên để bắt đầu</p>
    </div>
  );

  // Style 1: Grid - Uniform 3-column grid with equal height cards
  const renderGridStyle = () => {
    const MAX_VISIBLE = device === 'mobile' ? 4 : device === 'tablet' ? 6 : 9;
    const visibleProjects = projects.slice(0, MAX_VISIBLE);
    const remainingCount = projects.length - MAX_VISIBLE;

    return (
      <div className={cn("px-4", device === 'mobile' ? 'py-4' : 'py-8')}>
        <h3 className={cn("font-bold text-center mb-6", device === 'mobile' ? 'text-lg' : 'text-xl')}>Dự án tiêu biểu</h3>
        {projects.length === 0 ? <EmptyState /> : (
          <div className="max-w-6xl mx-auto">
            <div className={cn("grid", device === 'mobile' ? 'grid-cols-1 gap-3' : device === 'tablet' ? 'grid-cols-2 gap-4' : 'grid-cols-3 gap-6')}>
              {visibleProjects.map((project) => (
                <div 
                  key={project.id} 
                  className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden border group transition-all cursor-pointer"
                  style={{ borderColor: `${brandColor}15` }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = `${brandColor}40`;
                    e.currentTarget.style.boxShadow = `0 4px 12px ${brandColor}10`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = `${brandColor}15`;
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div className="aspect-[3/2] bg-slate-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden">
                    {project.image ? (
                      <img src={project.image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <ImageIcon size={32} className="text-slate-300" />
                    )}
                  </div>
                  <div className={cn("flex flex-col h-full", device === 'mobile' ? 'p-3' : 'p-4')}>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full w-fit" style={{ backgroundColor: `${brandColor}15`, color: brandColor }}>
                      {project.category || 'Category'}
                    </span>
                    <h4 className="font-semibold mt-2 mb-1 line-clamp-2 min-h-[3rem]">{project.title || 'Tên dự án'}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 min-h-[2.5rem]">{project.description || 'Mô tả dự án...'}</p>
                    <div className="mt-3 flex items-center gap-1 text-sm font-medium transition-all" style={{ color: brandColor }}>
                      Xem chi tiết <ArrowRight size={14} />
                    </div>
                  </div>
                </div>
              ))}
              {/* "+N" pattern */}
              {remainingCount > 0 && (
                <div className="flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-xl aspect-square border" style={{ borderColor: `${brandColor}15` }}>
                  <div className="text-center">
                    <Plus size={32} className="mx-auto mb-2 text-slate-400" />
                    <span className="text-lg font-bold text-slate-600 dark:text-slate-300">+{remainingCount}</span>
                    <p className="text-xs text-slate-400">dự án khác</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Style 2: Featured - 1 large + 2 small layout
  const renderFeaturedStyle = () => (
    <div className={cn("px-4", device === 'mobile' ? 'py-4' : 'py-8')}>
      <h3 className={cn("font-bold text-center mb-6", device === 'mobile' ? 'text-lg' : 'text-xl')}>Dự án nổi bật</h3>
      {projects.length === 0 ? <EmptyState /> : (
        <div className="max-w-6xl mx-auto">
          <div className={cn("grid gap-4", device === 'mobile' ? 'grid-cols-1' : 'grid-cols-2')}>
            {/* Featured large card */}
            {projects[0] && (
              <div 
                className={cn("bg-white dark:bg-slate-800 rounded-xl overflow-hidden border group transition-all cursor-pointer", 
                  device === 'mobile' ? '' : 'row-span-2'
                )}
                style={{ borderColor: `${brandColor}15` }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = `${brandColor}40`;
                  e.currentTarget.style.boxShadow = `0 8px 24px ${brandColor}15`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = `${brandColor}15`;
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div className="aspect-[3/2] bg-slate-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden">
                  {projects[0].image ? (
                    <img src={projects[0].image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <ImageIcon size={48} className="text-slate-300" />
                  )}
                </div>
                <div className="p-5">
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: `${brandColor}15`, color: brandColor }}>
                    {projects[0].category || 'Category'}
                  </span>
                  <h3 className={cn("font-bold mt-2 mb-2", device === 'mobile' ? 'text-lg' : 'text-xl')}>{projects[0].title || 'Dự án chính'}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{projects[0].description || 'Mô tả dự án...'}</p>
                </div>
              </div>
            )}
            {/* Other smaller cards */}
            {projects.slice(1, 3).map((project) => (
              <div 
                key={project.id} 
                className="bg-white dark:bg-slate-800 rounded-xl p-4 border flex items-center gap-4 group transition-all cursor-pointer"
                style={{ borderColor: `${brandColor}15` }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = `${brandColor}40`;
                  e.currentTarget.style.boxShadow = `0 4px 12px ${brandColor}10`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = `${brandColor}15`;
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div className="w-20 h-20 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {project.image ? (
                    <img src={project.image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <ImageIcon size={24} className="text-slate-300" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: `${brandColor}15`, color: brandColor }}>
                    {project.category || 'Category'}
                  </span>
                  <h4 className="font-semibold text-sm mt-1 truncate">{project.title || 'Tên dự án'}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">{project.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // Style 3: List - Horizontal list layout
  const renderListStyle = () => {
    const MAX_VISIBLE = device === 'mobile' ? 4 : 6;
    const visibleProjects = projects.slice(0, MAX_VISIBLE);
    const remainingCount = projects.length - MAX_VISIBLE;

    return (
      <div className={cn("px-4", device === 'mobile' ? 'py-4' : 'py-8')}>
        <h3 className={cn("font-bold text-center mb-6", device === 'mobile' ? 'text-lg' : 'text-xl')}>Danh sách dự án</h3>
        {projects.length === 0 ? <EmptyState /> : (
          <div className="max-w-6xl mx-auto">
            <div className="space-y-3">
              {visibleProjects.map((project) => (
                <div 
                  key={project.id} 
                  className={cn("bg-white dark:bg-slate-800 rounded-xl overflow-hidden border flex group transition-all cursor-pointer", 
                    device === 'mobile' ? 'flex-col' : 'items-center'
                  )}
                  style={{ borderColor: `${brandColor}15` }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = `${brandColor}40`;
                    e.currentTarget.style.boxShadow = `0 4px 12px ${brandColor}10`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = `${brandColor}15`;
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div className={cn("bg-slate-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden", 
                    device === 'mobile' ? 'aspect-video w-full' : 'w-40 h-24 flex-shrink-0'
                  )}>
                    {project.image ? (
                      <img src={project.image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <ImageIcon size={24} className="text-slate-300" />
                    )}
                  </div>
                  <div className="p-4 flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: `${brandColor}15`, color: brandColor }}>
                        {project.category || 'Category'}
                      </span>
                    </div>
                    <h4 className="font-semibold truncate">{project.title || 'Tên dự án'}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{project.description || 'Mô tả...'}</p>
                  </div>
                </div>
              ))}
            </div>
            {remainingCount > 0 && (
              <div className="text-center mt-4">
                <span className="text-sm font-medium" style={{ color: brandColor }}>+{remainingCount} dự án khác</span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Style 4: Masonry - Pinterest-style layout
  const renderMasonryStyle = () => {
    const MAX_VISIBLE = device === 'mobile' ? 6 : 9;
    const visibleProjects = projects.slice(0, MAX_VISIBLE);
    const remainingCount = projects.length - MAX_VISIBLE;

    return (
      <div className={cn("px-4", device === 'mobile' ? 'py-4' : 'py-8')}>
        <h3 className={cn("font-bold text-center mb-6", device === 'mobile' ? 'text-lg' : 'text-xl')}>Portfolio Masonry</h3>
        {projects.length === 0 ? <EmptyState /> : (
          <div className="max-w-6xl mx-auto">
            <div className={cn("columns-1 gap-4", device === 'tablet' && 'columns-2', device === 'desktop' && 'columns-3')}>
              {visibleProjects.map((project, idx) => {
                const heights = ['aspect-[4/5]', 'aspect-[4/3]', 'aspect-square'];
                const height = heights[idx % 3];
                return (
                  <div 
                    key={project.id} 
                    className="break-inside-avoid mb-4 bg-white dark:bg-slate-800 rounded-xl overflow-hidden border group transition-all cursor-pointer"
                    style={{ borderColor: `${brandColor}15` }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = `${brandColor}40`;
                      e.currentTarget.style.boxShadow = `0 4px 12px ${brandColor}10`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = `${brandColor}15`;
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div className={cn(height, "bg-slate-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden")}>
                      {project.image ? (
                        <img src={project.image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <ImageIcon size={32} className="text-slate-300" />
                      )}
                    </div>
                    <div className="p-3">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: `${brandColor}15`, color: brandColor }}>
                        {project.category || 'Category'}
                      </span>
                      <h4 className="font-semibold text-sm mt-2 line-clamp-2">{project.title || 'Tên dự án'}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{project.description || 'Mô tả...'}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            {remainingCount > 0 && (
              <div className="text-center mt-6">
                <span className="text-sm font-medium" style={{ color: brandColor }}>+{remainingCount} dự án khác</span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Style 5: Carousel - Horizontal scroll carousel
  const renderCarouselStyle = () => {
    const itemsPerView = device === 'mobile' ? 1 : device === 'tablet' ? 2 : 3;
    const maxIndex = Math.max(0, projects.length - itemsPerView);

    return (
      <div className={cn("px-4", device === 'mobile' ? 'py-4' : 'py-8')}>
        <h3 className={cn("font-bold text-center mb-6", device === 'mobile' ? 'text-lg' : 'text-xl')}>Portfolio Carousel</h3>
        {projects.length === 0 ? <EmptyState /> : (
          <div className="max-w-6xl mx-auto relative">
            {/* Navigation Buttons */}
            {projects.length > itemsPerView && (
              <>
                <button
                  type="button"
                  onClick={() => setCarouselIndex(Math.max(0, carouselIndex - 1))}
                  disabled={carouselIndex === 0}
                  className="absolute -left-2 md:-left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white dark:bg-slate-800 shadow-lg border flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110"
                  style={{ borderColor: `${brandColor}20` }}
                >
                  <ChevronLeft size={20} style={{ color: brandColor }} />
                </button>
                <button
                  type="button"
                  onClick={() => setCarouselIndex(Math.min(maxIndex, carouselIndex + 1))}
                  disabled={carouselIndex >= maxIndex}
                  className="absolute -right-2 md:-right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white dark:bg-slate-800 shadow-lg border flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110"
                  style={{ borderColor: `${brandColor}20` }}
                >
                  <ChevronRight size={20} style={{ color: brandColor }} />
                </button>
              </>
            )}
            {/* Carousel Container */}
            <div className="overflow-hidden mx-4 md:mx-8">
              <div 
                className="flex transition-transform duration-300 ease-out gap-4" 
                style={{ transform: `translateX(-${carouselIndex * (100 / itemsPerView)}%)` }}
              >
                {projects.map((project) => (
                  <div 
                    key={project.id} 
                    className="flex-shrink-0 bg-white dark:bg-slate-800 rounded-xl overflow-hidden border group transition-all"
                    style={{ 
                      width: `calc(${100 / itemsPerView}% - ${(itemsPerView - 1) * 16 / itemsPerView}px)`,
                      borderColor: `${brandColor}15`
                    }}
                  >
                    <div className="aspect-[4/3] bg-slate-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden">
                      {project.image ? (
                        <img src={project.image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <ImageIcon size={32} className="text-slate-300" />
                      )}
                    </div>
                    <div className="p-4">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: `${brandColor}15`, color: brandColor }}>
                        {project.category || 'Category'}
                      </span>
                      <h4 className="font-semibold mt-2 line-clamp-2 min-h-[3rem]">{project.title || 'Tên dự án'}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 min-h-[2.5rem]">{project.description || 'Mô tả...'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Dots Indicator */}
            {projects.length > itemsPerView && (
              <div className="flex justify-center gap-2 mt-4">
                {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
                  <button 
                    key={idx} 
                    type="button"
                    onClick={() => setCarouselIndex(idx)} 
                    className={cn("h-2 rounded-full transition-all", carouselIndex === idx ? 'w-6' : 'w-2')} 
                    style={{ backgroundColor: carouselIndex === idx ? brandColor : `${brandColor}30` }} 
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Style 6: Timeline - Vertical timeline với project milestones
  const renderTimelineStyle = () => {
    const MAX_VISIBLE = device === 'mobile' ? 4 : 6;
    const visibleProjects = projects.slice(0, MAX_VISIBLE);
    const remainingCount = projects.length - MAX_VISIBLE;

    return (
      <div className={cn("px-4", device === 'mobile' ? 'py-4' : 'py-8')}>
        <h3 className={cn("font-bold text-center mb-6", device === 'mobile' ? 'text-lg' : 'text-xl')}>Timeline Dự án</h3>
        {projects.length === 0 ? <EmptyState /> : (
          <div className="max-w-4xl mx-auto relative">
            {/* Vertical Line */}
            <div 
              className={cn("absolute top-0 bottom-0 w-0.5", device === 'mobile' ? 'left-4' : 'left-1/2 -translate-x-px')} 
              style={{ backgroundColor: `${brandColor}20` }} 
            />
            <div className="space-y-6 md:space-y-8">
              {visibleProjects.map((project, idx) => (
                <div 
                  key={project.id} 
                  className={cn("relative flex items-start", device === 'mobile' ? 'pl-12' : idx % 2 === 0 ? 'flex-row' : 'flex-row-reverse')}
                >
                  {/* Dot */}
                  <div 
                    className={cn("absolute w-8 h-8 rounded-full border-4 bg-white dark:bg-slate-900 flex items-center justify-center text-xs font-bold z-10", 
                      device === 'mobile' ? 'left-0' : 'left-1/2 -translate-x-1/2'
                    )} 
                    style={{ borderColor: brandColor, color: brandColor }}
                  >
                    {idx + 1}
                  </div>
                  {/* Content Card */}
                  <div 
                    className={cn("bg-white dark:bg-slate-800 rounded-xl overflow-hidden border transition-all", 
                      device === 'mobile' ? 'w-full' : 'w-5/12'
                    )}
                    style={{ borderColor: `${brandColor}15` }}
                  >
                    <div className="aspect-[4/3] bg-slate-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden">
                      {project.image ? (
                        <img src={project.image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon size={32} className="text-slate-300" />
                      )}
                    </div>
                    <div className="p-4">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: `${brandColor}15`, color: brandColor }}>
                        {project.category || 'Category'}
                      </span>
                      <h4 className="font-bold text-slate-900 dark:text-slate-100 mt-2 mb-1 line-clamp-2">{project.title || 'Tên dự án'}</h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3">{project.description || 'Mô tả...'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {remainingCount > 0 && (
              <div className="text-center mt-6">
                <span className="text-sm font-medium" style={{ color: brandColor }}>+{remainingCount} dự án khác</span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <PreviewWrapper 
      title="Preview Projects" 
      device={device} 
      setDevice={setDevice} 
      previewStyle={previewStyle} 
      setPreviewStyle={setPreviewStyle} 
      styles={styles} 
      info={getImageSizeInfo()}
    >
      <BrowserFrame url="yoursite.com/projects">
        {previewStyle === 'grid' && renderGridStyle()}
        {previewStyle === 'featured' && renderFeaturedStyle()}
        {previewStyle === 'list' && renderListStyle()}
        {previewStyle === 'masonry' && renderMasonryStyle()}
        {previewStyle === 'carousel' && renderCarouselStyle()}
        {previewStyle === 'timeline' && renderTimelineStyle()}
      </BrowserFrame>
      
      {/* Image Guidelines - BẮT BUỘC */}
      <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
        <div className="flex items-start gap-2">
          <ImageIcon size={14} className="text-slate-400 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-slate-600 dark:text-slate-400">
            {previewStyle === 'grid' && (
              <p><strong>1200×800px</strong> (3:2) • Grid layout đều, hover scale effect</p>
            )}
            {previewStyle === 'featured' && (
              <p><strong>Dự án chính:</strong> 1200×800px (3:2) • <strong>Dự án phụ:</strong> 600×600px (1:1)</p>
            )}
            {previewStyle === 'list' && (
              <p><strong>800×500px</strong> (16:10) • Horizontal list, thumb bên trái</p>
            )}
            {previewStyle === 'masonry' && (
              <p><strong>Pinterest-style:</strong> Ngang 800×500px • Dọc 600×900px • Vuông 800×800px</p>
            )}
            {previewStyle === 'carousel' && (
              <p><strong>1000×750px</strong> (4:3) • Carousel với navigation buttons & dots</p>
            )}
            {previewStyle === 'timeline' && (
              <p><strong>800×600px</strong> (4:3) • Timeline dọc, alternate left-right</p>
            )}
          </div>
        </div>
      </div>
    </PreviewWrapper>
  );
};

// ============ CAREER PREVIEW ============
// 6 Professional Styles: Cards, List, Minimal, Table, Featured, Timeline
// Best Practices: Accessibility (semantic HTML, ARIA), Equal Height Cards, Line Clamp, Edge Cases
type JobPosition = { id: number; title: string; department: string; location: string; type: string; salary: string; description: string };
export type CareerStyle = 'cards' | 'list' | 'minimal' | 'table' | 'featured' | 'timeline';
export const CareerPreview = ({ jobs, brandColor, selectedStyle, onStyleChange }: { jobs: JobPosition[]; brandColor: string; selectedStyle?: CareerStyle; onStyleChange?: (style: CareerStyle) => void }) => {
  const [device, setDevice] = useState<PreviewDevice>('desktop');
  const previewStyle = selectedStyle || 'cards';
  const setPreviewStyle = (s: string) => onStyleChange?.(s as CareerStyle);
  
  const styles = [
    { id: 'cards', label: 'Cards' }, 
    { id: 'list', label: 'List' }, 
    { id: 'minimal', label: 'Minimal' },
    { id: 'table', label: 'Table' },
    { id: 'featured', label: 'Featured' },
    { id: 'timeline', label: 'Timeline' }
  ];

  // Dynamic info bar - shows job counts by type or department
  const getJobsInfo = () => {
    const count = jobs.length;
    if (count === 0) return 'Chưa có vị trí';
    
    const typeCount = jobs.reduce((acc, job) => {
      const type = job.type || 'Full-time';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const typeSummary = Object.entries(typeCount).slice(0, 3).map(([type, cnt]) => `${type} (${cnt})`).join(', ');
    return count <= 3 ? `${count} vị trí • ${typeSummary}` : `${count} vị trí`;
  };

  // Empty State Component
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: `${brandColor}10` }}>
        <Briefcase size={32} style={{ color: brandColor }} />
      </div>
      <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-1">Chưa có vị trí tuyển dụng</h3>
      <p className="text-sm text-slate-500">Thêm vị trí đầu tiên để bắt đầu</p>
    </div>
  );

  // Header Component
  const CareerHeader = ({ subtitle }: { subtitle?: string }) => (
    <div className="text-center mb-8">
      <h3 className={cn("font-bold text-slate-900 dark:text-slate-100", device === 'mobile' ? 'text-lg' : 'text-xl md:text-2xl')}>
        Cơ hội nghề nghiệp
      </h3>
      {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">{subtitle}</p>}
    </div>
  );

  // Style 1: Cards - Grid layout với hover effects (IMPROVED: Equal Height + Line Clamp)
  const renderCardsStyle = () => {
    const MAX_DISPLAY = device === 'mobile' ? 4 : 6;
    const visibleJobs = jobs.slice(0, MAX_DISPLAY);
    const remainingCount = Math.max(0, jobs.length - MAX_DISPLAY);

    // Edge case: 1-2 items
    if (jobs.length === 1) {
      return (
        <div className={cn("px-4", device === 'mobile' ? 'py-6' : 'py-10 md:py-16')}>
          <CareerHeader subtitle="Tham gia đội ngũ của chúng tôi" />
          <div className="max-w-md mx-auto">
            <JobCard job={jobs[0]} brandColor={brandColor} device={device} />
          </div>
        </div>
      );
    }

    if (jobs.length === 2) {
      return (
        <div className={cn("px-4", device === 'mobile' ? 'py-6' : 'py-10 md:py-16')}>
          <CareerHeader subtitle="Tham gia đội ngũ của chúng tôi" />
          <div className="max-w-2xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
            {jobs.map(job => <JobCard key={job.id} job={job} brandColor={brandColor} device={device} />)}
          </div>
        </div>
      );
    }

    return (
      <div className={cn("px-4", device === 'mobile' ? 'py-6' : 'py-10 md:py-16')}>
        <CareerHeader subtitle="Tham gia đội ngũ của chúng tôi" />
        {jobs.length === 0 ? <EmptyState /> : (
          <>
            <div className={cn("grid gap-4 max-w-6xl mx-auto", device === 'mobile' ? 'grid-cols-1' : device === 'tablet' ? 'grid-cols-2' : 'grid-cols-3')}>
              {visibleJobs.map((job) => <JobCard key={job.id} job={job} brandColor={brandColor} device={device} />)}
            </div>
            {remainingCount > 0 && (
              <div className="text-center mt-6">
                <span className="text-sm font-medium" style={{ color: brandColor }}>+{remainingCount} vị trí khác</span>
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  // Job Card Component - Reusable with Equal Height
  const JobCard = ({ job, brandColor, device }: { job: JobPosition; brandColor: string; device: PreviewDevice }) => (
    <article 
      className="bg-white dark:bg-slate-800 rounded-xl border flex flex-col h-full transition-all"
      style={{ borderColor: `${brandColor}15` }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = `${brandColor}40`;
        e.currentTarget.style.boxShadow = `0 4px 12px ${brandColor}15`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = `${brandColor}15`;
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div className={cn("p-4", device === 'mobile' ? 'p-4' : 'p-5')}>
        <div className="flex items-start justify-between mb-3">
          <span className="text-xs font-medium px-2 py-1 rounded whitespace-nowrap" style={{ backgroundColor: `${brandColor}15`, color: brandColor }}>
            {job.department || 'Đang cập nhật'}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">{job.type || 'Full-time'}</span>
        </div>
        <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2 line-clamp-2 min-h-[2.5rem]">
          {job.title || 'Vị trí tuyển dụng'}
        </h4>
        {job.description && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 line-clamp-2 min-h-[2rem]">
            {job.description}
          </p>
        )}
        <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400 mb-4">
          <div className="flex items-center gap-1.5">
            <MapPin size={12} className="flex-shrink-0" />
            <span className="truncate">{job.location || 'Remote'}</span>
          </div>
          {job.salary && (
            <div className="flex items-center gap-1.5">
              <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium" style={{ color: brandColor }}>{job.salary}</span>
            </div>
          )}
        </div>
      </div>
      <div className={cn("mt-auto border-t", device === 'mobile' ? 'p-3' : 'p-4')} style={{ borderColor: `${brandColor}10` }}>
        <button 
          className={cn("w-full rounded-lg font-medium text-white transition-opacity hover:opacity-90", device === 'mobile' ? 'py-2 text-sm' : 'py-2.5 text-sm')} 
          style={{ backgroundColor: brandColor }}
        >
          Ứng tuyển ngay
        </button>
      </div>
    </article>
  );

  // Style 2: List - Compact horizontal layout
  const renderListStyle = () => {
    const MAX_DISPLAY = device === 'mobile' ? 5 : 8;
    const visibleJobs = jobs.slice(0, MAX_DISPLAY);
    const remainingCount = Math.max(0, jobs.length - MAX_DISPLAY);

    return (
      <div className={cn("px-4", device === 'mobile' ? 'py-6' : 'py-10 md:py-16')}>
        <CareerHeader />
        {jobs.length === 0 ? <EmptyState /> : (
          <div className="max-w-4xl mx-auto">
            <ul className="space-y-3" role="list" aria-label="Danh sách vị trí tuyển dụng">
              {visibleJobs.map((job) => (
                <li key={job.id}>
                  <article 
                    className={cn("bg-white dark:bg-slate-800 rounded-xl border flex items-center justify-between transition-all", device === 'mobile' ? 'flex-col gap-3 text-center p-4' : 'p-5')}
                    style={{ borderColor: `${brandColor}15` }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = `${brandColor}30`;
                      e.currentTarget.style.boxShadow = `0 2px 8px ${brandColor}10`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = `${brandColor}15`;
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div className="min-w-0 flex-1">
                      <h4 className="font-semibold text-slate-900 dark:text-slate-100 line-clamp-1">{job.title || 'Vị trí'}</h4>
                      <div className={cn("flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mt-1", device === 'mobile' ? 'flex-wrap justify-center' : '')}>
                        <span className="whitespace-nowrap">{job.department || 'Đang cập nhật'}</span>
                        <span className="hidden md:inline">•</span>
                        <span className="whitespace-nowrap">{job.location || 'Remote'}</span>
                        <span className="hidden md:inline">•</span>
                        <span className="whitespace-nowrap">{job.type || 'Full-time'}</span>
                      </div>
                    </div>
                    <div className={cn("flex items-center gap-3 flex-shrink-0", device === 'mobile' ? 'w-full' : '')}>
                      {job.salary && <span className="text-sm font-medium whitespace-nowrap" style={{ color: brandColor }}>{job.salary}</span>}
                      <button className={cn("rounded-lg font-medium text-white whitespace-nowrap", device === 'mobile' ? 'flex-1 py-2.5 text-sm' : 'px-5 py-2 text-sm')} style={{ backgroundColor: brandColor }}>
                        Ứng tuyển
                      </button>
                    </div>
                  </article>
                </li>
              ))}
            </ul>
            {remainingCount > 0 && (
              <div className="text-center mt-6">
                <span className="text-sm font-medium" style={{ color: brandColor }}>+{remainingCount} vị trí khác</span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Style 3: Minimal - Split layout with sidebar
  const renderMinimalStyle = () => (
    <div className={cn("px-4", device === 'mobile' ? 'py-6' : 'py-10 md:py-16')} style={{ backgroundColor: `${brandColor}05` }}>
      {jobs.length === 0 ? (
        <div className="max-w-5xl mx-auto">
          <EmptyState />
        </div>
      ) : (
        <div className="max-w-5xl mx-auto">
          <div className={cn("flex gap-8", device === 'mobile' ? 'flex-col' : 'md:flex-row md:gap-12')}>
            <div className={cn("text-center md:text-left", device === 'mobile' ? 'mb-6' : 'md:w-1/3')}>
              <p className="text-sm font-medium mb-2 uppercase tracking-wide" style={{ color: brandColor }}>TUYỂN DỤNG</p>
              <h3 className={cn("font-bold text-slate-900 dark:text-slate-100 mb-3", device === 'mobile' ? 'text-lg' : 'text-2xl')}>
                Gia nhập đội ngũ
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Chúng tôi đang tìm kiếm những tài năng mới</p>
            </div>
            <div className="flex-1">
              <ul className="space-y-3" role="list">
                {jobs.slice(0, 6).map((job) => (
                  <li key={job.id}>
                    <article className="bg-white dark:bg-slate-800 rounded-xl p-4 md:p-5 border flex items-center justify-between transition-shadow hover:shadow-sm" style={{ borderColor: `${brandColor}15` }}>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-medium text-slate-900 dark:text-slate-100 line-clamp-1">{job.title || 'Vị trí'}</h4>
                        <span className="text-sm text-slate-500 dark:text-slate-400">{job.location || 'Remote'} • {job.type || 'Full-time'}</span>
                      </div>
                      <a href="#" className="text-sm font-medium hover:underline whitespace-nowrap ml-4" style={{ color: brandColor }}>Chi tiết →</a>
                    </article>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Style 4: Table - Spreadsheet-like layout (NEW)
  const renderTableStyle = () => (
    <div className={cn("px-4", device === 'mobile' ? 'py-6' : 'py-10 md:py-16')}>
      <CareerHeader subtitle="Danh sách vị trí đang tuyển" />
      {jobs.length === 0 ? <EmptyState /> : (
        <div className="max-w-6xl mx-auto overflow-x-auto">
          <table className="w-full bg-white dark:bg-slate-800 rounded-xl overflow-hidden border" style={{ borderColor: `${brandColor}15` }}>
            <thead>
              <tr className="border-b" style={{ backgroundColor: `${brandColor}05`, borderColor: `${brandColor}15` }}>
                <th className="text-left p-4 font-semibold text-sm text-slate-700 dark:text-slate-300">Vị trí</th>
                {device !== 'mobile' && <th className="text-left p-4 font-semibold text-sm text-slate-700 dark:text-slate-300">Phòng ban</th>}
                <th className="text-left p-4 font-semibold text-sm text-slate-700 dark:text-slate-300">Địa điểm</th>
                {device !== 'mobile' && <th className="text-left p-4 font-semibold text-sm text-slate-700 dark:text-slate-300">Loại hình</th>}
                {device !== 'mobile' && <th className="text-left p-4 font-semibold text-sm text-slate-700 dark:text-slate-300">Mức lương</th>}
                <th className="text-right p-4 font-semibold text-sm text-slate-700 dark:text-slate-300">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {jobs.slice(0, 10).map((job, idx) => (
                <tr key={job.id} className="border-b last:border-0 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50" style={{ borderColor: `${brandColor}10` }}>
                  <td className="p-4">
                    <h4 className="font-medium text-slate-900 dark:text-slate-100 line-clamp-1">{job.title || 'Vị trí tuyển dụng'}</h4>
                    {device === 'mobile' && job.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">{job.description}</p>
                    )}
                  </td>
                  {device !== 'mobile' && <td className="p-4 text-sm text-slate-600 dark:text-slate-400">{job.department || 'Đang cập nhật'}</td>}
                  <td className="p-4 text-sm text-slate-600 dark:text-slate-400 whitespace-nowrap">{job.location || 'Remote'}</td>
                  {device !== 'mobile' && <td className="p-4 text-sm text-slate-600 dark:text-slate-400">{job.type || 'Full-time'}</td>}
                  {device !== 'mobile' && <td className="p-4 text-sm font-medium" style={{ color: brandColor }}>{job.salary || 'Thỏa thuận'}</td>}
                  <td className="p-4 text-right">
                    <button className="px-4 py-1.5 rounded-lg text-xs font-medium text-white whitespace-nowrap" style={{ backgroundColor: brandColor }}>
                      {device === 'mobile' ? 'Ứng tuyển' : 'Xem chi tiết'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  // Style 5: Featured - Highlight 1-2 hot positions (NEW)
  const renderFeaturedStyle = () => {
    if (jobs.length === 0) {
      return (
        <div className={cn("px-4", device === 'mobile' ? 'py-6' : 'py-10 md:py-16')}>
          <EmptyState />
        </div>
      );
    }

    const featuredJob = jobs[0];
    const otherJobs = jobs.slice(1, 7);

    return (
      <div className={cn("px-4", device === 'mobile' ? 'py-6' : 'py-10 md:py-16')}>
        <CareerHeader subtitle="Vị trí nổi bật đang tuyển gấp" />
        <div className="max-w-6xl mx-auto">
          {/* Featured Job - Large Card */}
          <article 
            className="bg-white dark:bg-slate-800 rounded-2xl border-2 p-6 md:p-8 mb-6 relative overflow-hidden"
            style={{ borderColor: brandColor, boxShadow: `0 8px 30px ${brandColor}20` }}
          >
            <div className="absolute top-4 right-4">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold text-white" style={{ backgroundColor: brandColor }}>
                <Star size={12} fill="currentColor" />
                HOT
              </span>
            </div>
            <div className="max-w-3xl">
              <span className="text-xs font-medium px-2 py-1 rounded" style={{ backgroundColor: `${brandColor}15`, color: brandColor }}>
                {featuredJob.department || 'Đang cập nhật'}
              </span>
              <h3 className={cn("font-bold text-slate-900 dark:text-slate-100 mt-3 mb-2", device === 'mobile' ? 'text-xl' : 'text-2xl md:text-3xl')}>
                {featuredJob.title || 'Vị trí tuyển dụng'}
              </h3>
              {featuredJob.description && (
                <p className="text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">{featuredJob.description}</p>
              )}
              <div className="flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-400 mb-6">
                <div className="flex items-center gap-2">
                  <MapPin size={16} />
                  <span>{featuredJob.location || 'Remote'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={16} />
                  <span>{featuredJob.type || 'Full-time'}</span>
                </div>
                {featuredJob.salary && (
                  <div className="flex items-center gap-2 font-medium" style={{ color: brandColor }}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{featuredJob.salary}</span>
                  </div>
                )}
              </div>
              <button className="px-8 py-3 rounded-lg font-semibold text-white transition-opacity hover:opacity-90" style={{ backgroundColor: brandColor }}>
                Ứng tuyển ngay
              </button>
            </div>
          </article>

          {/* Other Jobs - Compact Grid */}
          {otherJobs.length > 0 && (
            <>
              <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-4 text-lg">Vị trí khác</h4>
              <div className={cn("grid gap-4", device === 'mobile' ? 'grid-cols-1' : device === 'tablet' ? 'grid-cols-2' : 'grid-cols-3')}>
                {otherJobs.map((job) => (
                  <article 
                    key={job.id} 
                    className="bg-white dark:bg-slate-800 rounded-lg border p-4 transition-all hover:shadow-md"
                    style={{ borderColor: `${brandColor}15` }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-xs font-medium px-2 py-0.5 rounded" style={{ backgroundColor: `${brandColor}10`, color: brandColor }}>
                        {job.department || 'Đang cập nhật'}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">{job.type || 'Full-time'}</span>
                    </div>
                    <h5 className="font-medium text-slate-900 dark:text-slate-100 mb-2 line-clamp-2 min-h-[2.5rem]">{job.title || 'Vị trí'}</h5>
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-3">
                      <MapPin size={12} />
                      <span>{job.location || 'Remote'}</span>
                    </div>
                    <a href="#" className="text-sm font-medium hover:underline" style={{ color: brandColor }}>Xem chi tiết →</a>
                  </article>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  // Style 6: Timeline - Grouped by department (NEW)
  const renderTimelineStyle = () => {
    if (jobs.length === 0) {
      return (
        <div className={cn("px-4", device === 'mobile' ? 'py-6' : 'py-10 md:py-16')}>
          <EmptyState />
        </div>
      );
    }

    // Group jobs by department with global index tracking
    const groupedJobs = jobs.reduce((acc, job, globalIdx) => {
      const dept = job.department || 'Đang cập nhật';
      if (!acc[dept]) acc[dept] = [];
      acc[dept].push({ ...job, globalIdx: globalIdx + 1 }); // Track global 1-based index
      return acc;
    }, {} as Record<string, (JobPosition & { globalIdx: number })[]>);

    return (
      <div className={cn("px-4", device === 'mobile' ? 'py-6' : 'py-10 md:py-16')}>
        <CareerHeader subtitle="Vị trí theo phòng ban" />
        <div className="max-w-4xl mx-auto relative">
          {/* Vertical timeline line */}
          <div className={cn("absolute top-0 bottom-0 w-0.5", device === 'mobile' ? 'left-4' : 'left-6')} style={{ backgroundColor: `${brandColor}20` }} />
          
          <div className="space-y-8">
            {Object.entries(groupedJobs).map(([department, deptJobs], deptIdx) => (
              <div key={deptIdx} className={cn("relative", device === 'mobile' ? 'pl-12' : 'pl-16')}>
                {/* Department Badge - shows department name initial */}
                <div 
                  className={cn("absolute rounded-full border-4 bg-white dark:bg-slate-900 flex items-center justify-center font-bold z-10", device === 'mobile' ? 'w-8 h-8 left-0 text-xs' : 'w-12 h-12 left-0 text-sm')} 
                  style={{ borderColor: brandColor, color: brandColor }}
                >
                  {department.charAt(0).toUpperCase()}
                </div>
                
                {/* Department Content */}
                <div>
                  <h4 className={cn("font-bold text-slate-900 dark:text-slate-100 mb-4", device === 'mobile' ? 'text-base' : 'text-lg')} style={{ color: brandColor }}>
                    {department}
                  </h4>
                  <ul className="space-y-3" role="list">
                    {deptJobs.map((job) => (
                      <li key={job.id}>
                        <article 
                          className="bg-white dark:bg-slate-800 rounded-xl border p-4 transition-all hover:shadow-md"
                          style={{ borderColor: `${brandColor}15` }}
                        >
                          <div className="flex items-start gap-3 mb-2">
                            {/* Job number badge */}
                            <div 
                              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5" 
                              style={{ backgroundColor: `${brandColor}15`, color: brandColor }}
                            >
                              {job.globalIdx}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <h5 className="font-semibold text-slate-900 dark:text-slate-100 line-clamp-2 flex-1">{job.title || 'Vị trí'}</h5>
                                <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">{job.type || 'Full-time'}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-3 text-xs text-slate-500 dark:text-slate-400 mb-3">
                            <div className="flex items-center gap-1">
                              <MapPin size={12} />
                              <span>{job.location || 'Remote'}</span>
                            </div>
                            {job.salary && (
                              <div className="flex items-center gap-1 font-medium" style={{ color: brandColor }}>
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>{job.salary}</span>
                              </div>
                            )}
                          </div>
                          <button className={cn("rounded-lg font-medium text-white", device === 'mobile' ? 'w-full py-2 text-sm' : 'px-5 py-2 text-sm')} style={{ backgroundColor: brandColor }}>
                            Ứng tuyển
                          </button>
                        </article>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <PreviewWrapper 
      title="Preview Careers" 
      device={device} 
      setDevice={setDevice} 
      previewStyle={previewStyle} 
      setPreviewStyle={setPreviewStyle} 
      styles={styles} 
      info={getJobsInfo()}
    >
      <BrowserFrame url="yoursite.com/careers">
        {previewStyle === 'cards' && renderCardsStyle()}
        {previewStyle === 'list' && renderListStyle()}
        {previewStyle === 'minimal' && renderMinimalStyle()}
        {previewStyle === 'table' && renderTableStyle()}
        {previewStyle === 'featured' && renderFeaturedStyle()}
        {previewStyle === 'timeline' && renderTimelineStyle()}
      </BrowserFrame>
    </PreviewWrapper>
  );
};

// ============ CONTACT PREVIEW ============
// 6 Professional Styles: Modern Split, Floating Card, Grid Cards, Elegant Clean, Minimal Form, Centered
// Best Practices: Clear labels, keyboard navigation, inline validation, ARIA attributes, social links, response time expectation
export type ContactConfig = {
  showMap: boolean;
  mapEmbed: string;
  address: string;
  phone: string;
  email: string;
  workingHours: string;
  formFields: string[];
  socialLinks: Array<{ id: number; platform: string; url: string }>;
  showForm?: boolean;
  formTitle?: string;
  formDescription?: string;
  submitButtonText?: string;
  responseTimeText?: string;
};
export type ContactStyle = 'modern' | 'floating' | 'grid' | 'elegant' | 'minimal' | 'centered';

const getSocialIcon = (platform: string) => {
  switch (platform.toLowerCase()) {
    case 'facebook': return Facebook;
    case 'zalo': return MessageCircle;
    case 'instagram': return Instagram;
    case 'twitter': return Twitter;
    case 'linkedin': return Linkedin;
    case 'youtube': return Youtube;
    default: return Globe;
  }
};

export const ContactPreview = ({ config, brandColor, selectedStyle, onStyleChange }: { config: ContactConfig; brandColor: string; selectedStyle?: ContactStyle; onStyleChange?: (style: ContactStyle) => void }) => {
  const [device, setDevice] = useState<PreviewDevice>('desktop');
  const previewStyle = selectedStyle || 'modern';
  const setPreviewStyle = (s: string) => onStyleChange?.(s as ContactStyle);
  const styles = [
    { id: 'modern', label: 'Modern Split' }, 
    { id: 'floating', label: 'Floating Card' }, 
    { id: 'grid', label: 'Grid Cards' },
    { id: 'elegant', label: 'Elegant Clean' },
    { id: 'minimal', label: 'Minimal Form' },
    { id: 'centered', label: 'Centered' }
  ];
  
  const activeSocials = config.socialLinks?.filter(s => s.url) || [];

  const getInfoText = () => {
    const parts: string[] = [];
    if (config.showMap && config.mapEmbed) parts.push('Có bản đồ');
    else if (config.showMap) parts.push('Bản đồ (chưa có URL)');
    if (config.showForm !== false && (previewStyle === 'minimal' || previewStyle === 'centered')) parts.push('Có form liên hệ');
    if (activeSocials.length > 0) parts.push(`${activeSocials.length} MXH`);
    return parts.length > 0 ? parts.join(' • ') : 'Thông tin liên hệ cơ bản';
  };

  const renderSocialLinks = (size: number = 18, className: string = "") => {
    if (activeSocials.length === 0) return null;
    return (
      <div className={cn("flex items-center gap-2", className)}>
        {activeSocials.map(social => {
          const Icon = getSocialIcon(social.platform);
          return (<a key={social.id} href={social.url || '#'} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full flex items-center justify-center transition-colors" style={{ backgroundColor: `${brandColor}10`, color: brandColor }} aria-label={social.platform}><Icon size={size} /></a>);
        })}
      </div>
    );
  };



  const renderMapOrPlaceholder = (className: string = "w-full h-full") => {
    if (config.mapEmbed) {
      return <iframe src={config.mapEmbed} className={`${className} border-0`} loading="lazy" title="Google Map" />;
    }
    return (
      <div className={`${className} bg-slate-100 dark:bg-slate-700 flex flex-col items-center justify-center text-slate-400`}>
        <Globe size={32} />
        <span className="text-xs mt-2">Chưa có URL bản đồ</span>
      </div>
    );
  };

  // Style 1: Modern Split - Chia đôi: thông tin bên trái, bản đồ bên phải
  const renderModernStyle = () => (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200/40 dark:border-slate-700/40 rounded-xl overflow-hidden shadow-sm">
      <div className={cn("flex min-h-[400px]", device === 'mobile' ? 'flex-col' : 'flex-col lg:flex-row')}>
        {/* Left Content */}
        <div className={cn("p-6 lg:p-10 flex flex-col justify-center bg-white dark:bg-slate-800", device === 'mobile' ? 'w-full' : 'lg:w-1/2')}>
          <div className="max-w-md mx-auto w-full">
            <span className="inline-block py-1 px-3 rounded-full text-xs font-semibold tracking-wide uppercase mb-4" style={{ backgroundColor: `${brandColor}15`, color: brandColor }}>
              Thông tin liên hệ
            </span>
            <h2 className={cn("font-bold tracking-tight mb-6 text-slate-900 dark:text-slate-100", device === 'mobile' ? 'text-xl' : 'text-2xl')}>
              Kết nối với chúng tôi
            </h2>

            <div className="space-y-5">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 shrink-0 mt-0.5">
                  <MapPin size={16} />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-sm mb-0.5">Địa chỉ văn phòng</h4>
                  <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{config.address || '123 Nguyễn Huệ, Q1, TP.HCM'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 shrink-0 mt-0.5">
                  <Mail size={16} />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-sm mb-0.5">Email & Điện thoại</h4>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">{config.email || 'contact@example.com'}</p>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">{config.phone || '1900 1234'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 shrink-0 mt-0.5">
                  <Clock size={16} />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-sm mb-0.5">Giờ làm việc</h4>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">{config.workingHours || 'Thứ 2 - Thứ 6: 8:00 - 17:00'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Map */}
        {config.showMap && (
          <div className={cn("bg-slate-100 dark:bg-slate-700 relative border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-700", device === 'mobile' ? 'w-full min-h-[200px]' : 'lg:w-1/2 min-h-[300px] lg:min-h-full')}>
            {renderMapOrPlaceholder("absolute inset-0")}
          </div>
        )}
      </div>
    </div>
  );

  // Style 2: Floating Card - Bản đồ nền với card thông tin nổi
  const renderFloatingStyle = () => (
    <div className={cn("w-full relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm group", device === 'mobile' ? 'h-[500px]' : 'h-[450px]')}>
      {/* Background Map */}
      <div className="absolute inset-0">
        {config.mapEmbed ? (
          <iframe src={config.mapEmbed} className="w-full h-full border-0 filter grayscale-[30%] group-hover:grayscale-0 transition-all duration-1000" loading="lazy" title="Google Map" />
        ) : (
          <div className="w-full h-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
            <Globe size={64} className="text-slate-300" />
          </div>
        )}
      </div>
      
      {/* Floating Card */}
      <div className={cn("absolute inset-0 pointer-events-none flex items-center p-4", device === 'mobile' ? 'justify-center' : 'justify-start lg:pl-12')}>
        <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm p-6 rounded-xl shadow-lg pointer-events-auto max-w-sm w-full border border-slate-200/50 dark:border-slate-700/50">
          <h2 className="text-lg font-bold mb-5 text-slate-900 dark:text-slate-100">Thông tin liên hệ</h2>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <MapPin size={16} className="mt-0.5 shrink-0" style={{ color: brandColor }} />
              <div>
                <p className="text-[10px] text-slate-500 font-medium uppercase mb-0.5">Địa chỉ</p>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100 leading-relaxed">{config.address || '123 Nguyễn Huệ, Q1, TP.HCM'}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone size={16} className="mt-0.5 shrink-0" style={{ color: brandColor }} />
              <div>
                <p className="text-[10px] text-slate-500 font-medium uppercase mb-0.5">Hotline</p>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{config.phone || '1900 1234'}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail size={16} className="mt-0.5 shrink-0" style={{ color: brandColor }} />
              <div>
                <p className="text-[10px] text-slate-500 font-medium uppercase mb-0.5">Email</p>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{config.email || 'contact@example.com'}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock size={16} className="mt-0.5 shrink-0" style={{ color: brandColor }} />
              <div>
                <p className="text-[10px] text-slate-500 font-medium uppercase mb-0.5">Giờ làm việc</p>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{config.workingHours || 'T2-T6: 8:00-17:00'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Style 3: Grid Cards - 3 cards nhỏ + bản đồ phía dưới
  const renderGridStyle = () => (
    <div className="w-full bg-slate-50 dark:bg-slate-800/30 p-6 rounded-xl border border-slate-200/40 dark:border-slate-700/40">
      <div className={cn("grid gap-3 mb-6", device === 'mobile' ? 'grid-cols-1' : 'grid-cols-3')}>
        {/* Card 1: Phone */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-lg shadow-sm border border-slate-200/60 dark:border-slate-700 flex flex-col items-center text-center">
          <div className="w-10 h-10 rounded-full flex items-center justify-center mb-3" style={{ backgroundColor: `${brandColor}15`, color: brandColor }}>
            <Phone size={18} />
          </div>
          <h3 className="font-medium text-sm text-slate-500 dark:text-slate-400 mb-1">Điện thoại</h3>
          <p className="font-semibold text-slate-900 dark:text-slate-100">{config.phone || '1900 1234'}</p>
        </div>

        {/* Card 2: Email */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-lg shadow-sm border border-slate-200/60 dark:border-slate-700 flex flex-col items-center text-center">
          <div className="w-10 h-10 rounded-full flex items-center justify-center mb-3" style={{ backgroundColor: `${brandColor}15`, color: brandColor }}>
            <Mail size={18} />
          </div>
          <h3 className="font-medium text-sm text-slate-500 dark:text-slate-400 mb-1">Email</h3>
          <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm">{config.email || 'contact@example.com'}</p>
        </div>

        {/* Card 3: Working Hours */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-lg shadow-sm border border-slate-200/60 dark:border-slate-700 flex flex-col items-center text-center">
          <div className="w-10 h-10 rounded-full flex items-center justify-center mb-3" style={{ backgroundColor: `${brandColor}15`, color: brandColor }}>
            <Clock size={18} />
          </div>
          <h3 className="font-medium text-sm text-slate-500 dark:text-slate-400 mb-1">Giờ làm việc</h3>
          <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm">{config.workingHours || 'T2-T6: 8:00-17:00'}</p>
        </div>
      </div>

      {/* Address + Map */}
      <div className={cn("bg-white dark:bg-slate-800 p-5 rounded-lg border border-slate-200/60 dark:border-slate-700", device === 'mobile' ? 'flex flex-col gap-4' : 'flex flex-row gap-6')}>
        <div className={cn("flex flex-col justify-center", device === 'mobile' ? 'w-full' : 'w-1/3')}>
          <div className="flex items-start gap-3">
            <MapPin size={20} className="shrink-0 mt-0.5" style={{ color: brandColor }} />
            <div>
              <h3 className="font-bold text-base mb-1.5 text-slate-900 dark:text-slate-100">Trụ sở chính</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{config.address || '123 Nguyễn Huệ, Q1, TP.HCM'}</p>
            </div>
          </div>
        </div>
        {config.showMap && (
          <div className={cn("rounded-md overflow-hidden bg-slate-100 dark:bg-slate-700", device === 'mobile' ? 'w-full h-48' : 'w-2/3 h-52')}>
            {renderMapOrPlaceholder()}
          </div>
        )}
      </div>
    </div>
  );

  // Style 4: Elegant Clean - Header section + chia đôi info/bản đồ
  const renderElegantStyle = () => (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200/40 dark:border-slate-700/40 rounded-xl shadow-sm overflow-hidden">
      {/* Top Header Section */}
      <div className="bg-slate-50 dark:bg-slate-800/50 p-6 border-b border-slate-200 dark:border-slate-700 text-center">
        <div className="inline-flex items-center justify-center w-11 h-11 rounded-full mb-3" style={{ backgroundColor: `${brandColor}10`, color: brandColor }}>
          <Building2 size={22} />
        </div>
        <h2 className={cn("font-bold tracking-tight text-slate-900 dark:text-slate-100", device === 'mobile' ? 'text-lg' : 'text-xl')}>Văn phòng của chúng tôi</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1.5 max-w-lg mx-auto text-sm">
          Thông tin liên hệ và vị trí bản đồ chính xác.
        </p>
      </div>

      <div className={cn("flex", device === 'mobile' ? 'flex-col' : 'flex-row')}>
        {/* Left Info List */}
        <div className={cn("p-6 space-y-0 divide-y divide-slate-200 dark:divide-slate-700", device === 'mobile' ? 'w-full' : 'w-5/12')}>
          <div className="py-4 first:pt-0">
            <p className="text-[10px] font-semibold uppercase text-slate-500 mb-1.5">Địa chỉ</p>
            <div className="flex items-start gap-2.5">
              <MapPin size={16} className="text-slate-600 dark:text-slate-400 shrink-0 mt-0.5" />
              <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{config.address || '123 Nguyễn Huệ, Q1, TP.HCM'}</span>
            </div>
          </div>

          <div className="py-4">
            <p className="text-[10px] font-semibold uppercase text-slate-500 mb-1.5">Liên lạc</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <Phone size={16} className="text-slate-600 dark:text-slate-400 shrink-0" />
                <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{config.phone || '1900 1234'}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail size={16} className="text-slate-600 dark:text-slate-400 shrink-0" />
                <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{config.email || 'contact@example.com'}</span>
              </div>
            </div>
          </div>

          <div className="py-4 last:pb-0">
            <p className="text-[10px] font-semibold uppercase text-slate-500 mb-1.5">Thời gian</p>
            <div className="flex items-center gap-2.5">
              <Clock size={16} className="text-slate-600 dark:text-slate-400 shrink-0" />
              <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{config.workingHours || 'T2-T6: 8:00-17:00'}</span>
            </div>
          </div>
        </div>

        {/* Right Map */}
        {config.showMap && (
          <div className={cn("bg-slate-100 dark:bg-slate-700 relative border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-700", device === 'mobile' ? 'w-full min-h-[250px]' : 'w-7/12 min-h-[320px]')}>
            {renderMapOrPlaceholder("absolute inset-0")}
          </div>
        )}
      </div>
    </div>
  );

  // Style 5: Minimal - Layout tối giản với info ngang hàng
  const renderMinimalStyle = () => (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200/40 dark:border-slate-700/40 rounded-xl overflow-hidden shadow-sm">
      <div className={cn("p-6 lg:p-10", device === 'mobile' ? '' : '')}>
        <div className="text-center mb-8">
          <h2 className={cn("font-bold tracking-tight text-slate-900 dark:text-slate-100", device === 'mobile' ? 'text-xl' : 'text-2xl')}>Liên hệ với chúng tôi</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">Chúng tôi luôn sẵn sàng hỗ trợ bạn</p>
        </div>
        <div className={cn("grid gap-4", device === 'mobile' ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-4')}>
          <a href={`tel:${config.phone}`} className="flex flex-col items-center p-5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-md transition-all text-center group">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors" style={{ backgroundColor: `${brandColor}10`, color: brandColor }}><Phone size={20} /></div>
            <span className="text-xs text-slate-500 mb-1">Điện thoại</span>
            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{config.phone || '1900 1234'}</span>
          </a>
          <a href={`mailto:${config.email}`} className="flex flex-col items-center p-5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-md transition-all text-center group">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors" style={{ backgroundColor: `${brandColor}10`, color: brandColor }}><Mail size={20} /></div>
            <span className="text-xs text-slate-500 mb-1">Email</span>
            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate max-w-full">{config.email || 'contact@example.com'}</span>
          </a>
          <div className="flex flex-col items-center p-5 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3" style={{ backgroundColor: `${brandColor}10`, color: brandColor }}><MapPin size={20} /></div>
            <span className="text-xs text-slate-500 mb-1">Địa chỉ</span>
            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 line-clamp-2">{config.address || '123 Nguyễn Huệ, Q1, TP.HCM'}</span>
          </div>
          <div className="flex flex-col items-center p-5 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3" style={{ backgroundColor: `${brandColor}10`, color: brandColor }}><Clock size={20} /></div>
            <span className="text-xs text-slate-500 mb-1">Giờ làm việc</span>
            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{config.workingHours || 'T2-T6: 8:00-17:00'}</span>
          </div>
        </div>
        {(activeSocials.length > 0 || config.showMap) && (
          <div className={cn("mt-8 pt-6 border-t border-slate-200 dark:border-slate-700", device === 'mobile' ? 'flex flex-col gap-4' : 'flex items-center justify-between')}>
            {renderSocialLinks(18, "")}
            {config.showMap && (<div className={cn("rounded-lg overflow-hidden", device === 'mobile' ? 'w-full h-48' : 'w-80 h-32')}>{renderMapOrPlaceholder()}</div>)}
          </div>
        )}
      </div>
    </div>
  );

  // Style 6: Centered - Layout centered với icon lớn
  const renderCenteredStyle = () => (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200/40 dark:border-slate-700/40 rounded-xl overflow-hidden shadow-sm">
      <div className="text-center p-6 lg:p-10" style={{ backgroundColor: `${brandColor}05` }}>
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-5" style={{ backgroundColor: `${brandColor}15`, color: brandColor }}><Phone size={28} /></div>
        <h2 className={cn("font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-2", device === 'mobile' ? 'text-xl' : 'text-2xl')}>Hãy kết nối với chúng tôi</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto">Đội ngũ của chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn</p>
      </div>
      <div className="p-6 lg:p-8">
        <div className={cn("grid gap-6", device === 'mobile' ? 'grid-cols-1' : 'grid-cols-3')}>
          <a href={`tel:${config.phone}`} className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${brandColor}15`, color: brandColor }}><Phone size={18} /></div>
            <div><p className="text-xs text-slate-500 mb-0.5">Hotline</p><p className="text-sm font-bold text-slate-900 dark:text-slate-100">{config.phone || '1900 1234'}</p></div>
          </a>
          <a href={`mailto:${config.email}`} className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${brandColor}15`, color: brandColor }}><Mail size={18} /></div>
            <div><p className="text-xs text-slate-500 mb-0.5">Email</p><p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{config.email || 'contact@example.com'}</p></div>
          </a>
          <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${brandColor}15`, color: brandColor }}><Clock size={18} /></div>
            <div><p className="text-xs text-slate-500 mb-0.5">Giờ làm việc</p><p className="text-sm font-bold text-slate-900 dark:text-slate-100">{config.workingHours || 'T2-T6: 8:00-17:00'}</p></div>
          </div>
        </div>
        <div className={cn("mt-6 p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50", device === 'mobile' ? '' : 'flex items-start gap-6')}>
          <div className="flex items-start gap-3 flex-1">
            <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${brandColor}15`, color: brandColor }}><MapPin size={18} /></div>
            <div><p className="text-xs text-slate-500 mb-0.5">Địa chỉ văn phòng</p><p className="text-sm font-medium text-slate-900 dark:text-slate-100">{config.address || '123 Nguyễn Huệ, Q1, TP.HCM'}</p></div>
          </div>
          {config.showMap && (<div className={cn("rounded-lg overflow-hidden shrink-0", device === 'mobile' ? 'w-full h-40 mt-4' : 'w-64 h-28')}>{renderMapOrPlaceholder()}</div>)}
        </div>
        {activeSocials.length > 0 && (<div className="mt-6 text-center">{renderSocialLinks(20, "justify-center")}</div>)}
      </div>
    </div>
  );

  return (
    <PreviewWrapper title="Preview Contact" device={device} setDevice={setDevice} previewStyle={previewStyle} setPreviewStyle={setPreviewStyle} styles={styles} info={getInfoText()}>
      <BrowserFrame url="yoursite.com/contact">
        {previewStyle === 'modern' && renderModernStyle()}
        {previewStyle === 'floating' && renderFloatingStyle()}
        {previewStyle === 'grid' && renderGridStyle()}
        {previewStyle === 'elegant' && renderElegantStyle()}
        {previewStyle === 'minimal' && renderMinimalStyle()}
        {previewStyle === 'centered' && renderCenteredStyle()}
      </BrowserFrame>
    </PreviewWrapper>
  );
};

// ============ TRUST BADGES / CERTIFICATIONS PREVIEW ============
// 6 Professional Styles: Grid, Cards, Marquee, Wall, Carousel, Featured
// Best Practices: Grayscale-to-color hover, lightbox/zoom indicator, verification links, alt text accessibility
type TrustBadgeItem = { id: number; url: string; link: string; name?: string };
export type TrustBadgesStyle = 'grid' | 'cards' | 'marquee' | 'wall' | 'carousel' | 'featured';
export type TrustBadgesConfig = { heading?: string; subHeading?: string; buttonText?: string; buttonLink?: string };

// Auto Scroll Slider cho Marquee style
const TrustBadgesAutoScroll = ({ children, speed = 0.6, isPaused }: { children: React.ReactNode; speed?: number; isPaused?: boolean }) => {
  const scrollRef = React.useRef<HTMLDivElement>(null);

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
    >
      <div className="flex shrink-0 gap-16 md:gap-20 items-center px-4">{children}</div>
      <div className="flex shrink-0 gap-16 md:gap-20 items-center px-4">{children}</div>
    </div>
  );
};

export const TrustBadgesPreview = ({ 
  items, 
  brandColor, 
  selectedStyle, 
  onStyleChange,
  config
}: { 
  items: TrustBadgeItem[]; 
  brandColor: string; 
  selectedStyle?: TrustBadgesStyle; 
  onStyleChange?: (style: TrustBadgesStyle) => void;
  config?: TrustBadgesConfig;
}) => {
  const [device, setDevice] = useState<PreviewDevice>('desktop');
  const [isPaused, setIsPaused] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const previewStyle = selectedStyle || 'cards';
  const setPreviewStyle = (s: string) => onStyleChange?.(s as TrustBadgesStyle);
  
  const styles = [
    { id: 'grid', label: 'Grid' }, 
    { id: 'cards', label: 'Cards' }, 
    { id: 'marquee', label: 'Marquee' },
    { id: 'wall', label: 'Wall' },
    { id: 'carousel', label: 'Carousel' },
    { id: 'featured', label: 'Featured' }
  ];

  // Config values with defaults
  const heading = config?.heading || 'Chứng nhận & Giải thưởng';
  const subHeading = config?.subHeading || 'Được công nhận bởi các tổ chức uy tín';

  // Max visible items pattern
  const MAX_VISIBLE = device === 'mobile' ? 4 : 8;
  const visibleItems = items.slice(0, MAX_VISIBLE);
  const remainingCount = items.length - MAX_VISIBLE;

  // Empty State Component
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: `${brandColor}10` }}>
        <Shield size={36} style={{ color: brandColor }} />
      </div>
      <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Chưa có chứng nhận</h3>
      <p className="text-sm text-slate-500 max-w-xs">Thêm chứng nhận, giải thưởng hoặc badge để tăng độ tin cậy</p>
    </div>
  );

  // Section Header Component
  const SectionHeader = ({ centered = true }: { centered?: boolean }) => (
    <div className={cn("mb-8 md:mb-10", centered && "text-center")}>
      {subHeading && (
        <span className="inline-block px-3 py-1 mb-3 rounded-full text-xs font-semibold uppercase tracking-wider" 
          style={{ backgroundColor: `${brandColor}15`, color: brandColor }}>
          {subHeading}
        </span>
      )}
      <h2 className={cn(
        "font-bold text-slate-900 dark:text-slate-100",
        device === 'mobile' ? 'text-xl' : 'text-2xl md:text-3xl'
      )}>
        {heading}
      </h2>
    </div>
  );

  // +N More Items Badge
  const MoreItemsBadge = ({ count }: { count: number }) => count > 0 ? (
    <div className="flex items-center justify-center py-4 mt-4">
      <span className="text-sm font-medium px-4 py-2 rounded-full" style={{ backgroundColor: `${brandColor}10`, color: brandColor }}>
        +{count} chứng nhận khác
      </span>
    </div>
  ) : null;

  // Style 1: Square Grid - Full color, with zoom icon
  const renderGridStyle = () => (
    <section className={cn("w-full bg-white dark:bg-slate-900", device === 'mobile' ? 'py-8 px-3' : 'py-12 px-6')}>
      <div className="container max-w-7xl mx-auto">
        <SectionHeader />
        {items.length === 0 ? <EmptyState /> : (
          <>
            <div className={cn(
              "grid gap-4 md:gap-5",
              device === 'mobile' ? 'grid-cols-2' : device === 'tablet' ? 'grid-cols-3' : 'grid-cols-4'
            )}>
              {visibleItems.map((item) => (
                <div 
                  key={item.id} 
                  className="group relative aspect-square bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center cursor-pointer transition-all duration-300"
                  style={{ 
                    padding: device === 'mobile' ? '16px' : '20px',
                    border: `1px solid ${brandColor}15`
                  }}
                  onMouseEnter={(e) => { 
                    e.currentTarget.style.borderColor = `${brandColor}40`; 
                    e.currentTarget.style.boxShadow = `0 8px 24px ${brandColor}15`; 
                    e.currentTarget.style.transform = 'translateY(-4px)';
                  }}
                  onMouseLeave={(e) => { 
                    e.currentTarget.style.borderColor = `${brandColor}15`; 
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {item.url ? (
                    <img src={item.url} className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105" alt={item.name || 'Chứng nhận'} />
                  ) : (
                    <ImageIcon size={device === 'mobile' ? 32 : 40} className="text-slate-300" />
                  )}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ backgroundColor: `${brandColor}15` }}>
                      <Maximize2 size={14} style={{ color: brandColor }} />
                    </div>
                  </div>
                  {item.name && (
                    <div className="absolute bottom-2 left-2 right-2 text-center">
                      <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 truncate block">{item.name}</span>
                    </div>
                  )}
                </div>
              ))}
              {remainingCount > 0 && (
                <div 
                  className="aspect-square rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all"
                  style={{ backgroundColor: `${brandColor}05`, border: `2px dashed ${brandColor}30` }}
                >
                  <Plus size={28} style={{ color: brandColor }} className="mb-1" />
                  <span className="text-lg font-bold" style={{ color: brandColor }}>+{remainingCount}</span>
                  <span className="text-[10px] text-slate-400">xem thêm</span>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );

  // Style 2: Feature Cards - Large cards with image and title, hover zoom effect
  const renderCardsStyle = () => {
    const cardItems = items.slice(0, device === 'mobile' ? 2 : 3);
    const cardRemaining = items.length - cardItems.length;
    return (
      <section className={cn("w-full bg-white dark:bg-slate-900", device === 'mobile' ? 'py-8 px-3' : 'py-12 px-6')}>
        <div className="container max-w-7xl mx-auto">
          <SectionHeader />
          {items.length === 0 ? <EmptyState /> : (
            <>
              <div className={cn(
                "grid gap-5 md:gap-6",
                device === 'mobile' ? 'grid-cols-1' : device === 'tablet' ? 'grid-cols-2' : 'grid-cols-3'
              )}>
                {cardItems.map((item) => (
                  <div 
                    key={item.id} 
                    className="group relative flex flex-col rounded-2xl overflow-hidden bg-white dark:bg-slate-800 shadow-sm cursor-pointer h-full transition-all duration-300"
                    style={{ border: `1px solid ${brandColor}15` }}
                    onMouseEnter={(e) => { 
                      e.currentTarget.style.borderColor = `${brandColor}30`; 
                      e.currentTarget.style.boxShadow = `0 12px 32px ${brandColor}15`; 
                    }}
                    onMouseLeave={(e) => { 
                      e.currentTarget.style.borderColor = `${brandColor}15`; 
                      e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                    }}
                  >
                    <div className={cn("bg-slate-50 dark:bg-slate-700/30 flex items-center justify-center relative overflow-hidden", device === 'mobile' ? 'aspect-[4/3] p-6' : 'aspect-[5/4] p-10')}>
                      <div className="absolute inset-0 bg-blue-50/0 group-hover:bg-blue-50/30 dark:group-hover:bg-blue-900/20 transition-colors duration-300" />
                      {item.url ? (
                        <img src={item.url} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500 z-10" alt={item.name || 'Chứng nhận'} />
                      ) : (
                        <ImageIcon size={48} className="text-slate-300" />
                      )}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                        <span className="bg-white/90 dark:bg-slate-800/90 px-4 py-2 rounded-full shadow-lg font-medium flex items-center gap-2 text-sm" style={{ color: brandColor }}>
                          <ZoomIn size={16} /> Xem chi tiết
                        </span>
                      </div>
                    </div>
                    <div className={cn("bg-white dark:bg-slate-800 border-t flex items-center justify-between group-hover:bg-slate-50 dark:group-hover:bg-slate-700/50 transition-colors", device === 'mobile' ? 'py-3 px-4 min-h-[48px]' : 'py-4 px-5')} style={{ borderColor: `${brandColor}10` }}>
                      <span className="font-semibold truncate text-sm" style={{ color: brandColor }}>
                        {item.name || 'Chứng nhận'}
                      </span>
                      <ArrowUpRight size={16} className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: brandColor }} />
                    </div>
                  </div>
                ))}
              </div>
              <MoreItemsBadge count={cardRemaining} />
            </>
          )}
        </div>
      </section>
    );
  };

  // Style 3: Marquee - Auto scroll slider with tooltip
  const renderMarqueeStyle = () => (
    <section 
      className={cn("w-full border-y", device === 'mobile' ? 'py-10' : 'py-14')}
      style={{ backgroundColor: `${brandColor}05`, borderColor: `${brandColor}15` }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="container max-w-7xl mx-auto px-4 mb-8 text-center">
        <SectionHeader />
      </div>
      {items.length === 0 ? <EmptyState /> : (
        <TrustBadgesAutoScroll speed={0.6} isPaused={isPaused}>
          {items.map((item) => (
            <div 
              key={item.id} 
              className={cn("w-auto flex items-center justify-center px-4 hover:scale-110 transition-all duration-300 cursor-pointer relative group", device === 'mobile' ? 'h-20' : 'h-24 md:h-28')}
            >
              {item.url ? (
                <img src={item.url} className="h-full w-auto object-contain max-w-[200px] transition-transform" alt={item.name || 'Chứng nhận'} />
              ) : (
                <div className="h-16 w-28 bg-slate-200 dark:bg-slate-700 rounded flex items-center justify-center">
                  <ImageIcon size={28} className="text-slate-400" />
                </div>
              )}
              {item.name && (
                <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded text-xs font-medium opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity pointer-events-none" style={{ backgroundColor: brandColor, color: 'white' }}>
                  {item.name}
                </div>
              )}
            </div>
          ))}
        </TrustBadgesAutoScroll>
      )}
    </section>
  );

  // Style 4: Framed Wall - Certificate frames hanging on wall
  const renderWallStyle = () => {
    const wallItems = items.slice(0, device === 'mobile' ? 4 : 6);
    const wallRemaining = items.length - wallItems.length;
    return (
      <section className={cn("w-full", device === 'mobile' ? 'py-10 px-3' : 'py-12 px-6')} style={{ backgroundColor: `${brandColor}05` }}>
        <div className="container max-w-7xl mx-auto">
          <SectionHeader />
          {items.length === 0 ? <EmptyState /> : (
            <>
              <div className={cn(
                "grid gap-4 md:gap-6 justify-items-center",
                device === 'mobile' ? 'grid-cols-2' : 'grid-cols-3'
              )}>
                {wallItems.map((item) => (
                  <div 
                    key={item.id} 
                    className={cn(
                      "group relative bg-white dark:bg-slate-800 shadow-md rounded-sm flex flex-col cursor-pointer transition-all duration-300",
                      device === 'mobile' ? 'w-[140px] h-[180px] p-2' : 'w-[160px] h-[210px] p-3'
                    )}
                    style={{ border: `1px solid ${brandColor}15` }}
                    onMouseEnter={(e) => { 
                      e.currentTarget.style.boxShadow = `0 12px 24px ${brandColor}20`; 
                      e.currentTarget.style.transform = 'translateY(-8px)';
                    }}
                    onMouseLeave={(e) => { 
                      e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-1 h-10 bg-gradient-to-b from-slate-400 to-transparent opacity-40"></div>
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full shadow-inner" style={{ backgroundColor: `${brandColor}60` }}></div>
                    <div className="flex-1 flex items-center justify-center p-3 relative overflow-hidden" style={{ backgroundColor: `${brandColor}05`, border: `1px solid ${brandColor}10` }}>
                      {item.url ? (
                        <img src={item.url} className="w-full h-full object-contain" alt={item.name || 'Chứng nhận'} />
                      ) : (
                        <ImageIcon size={28} className="text-slate-300" />
                      )}
                    </div>
                    <div className={cn("flex items-center justify-center", device === 'mobile' ? 'h-7 mt-1' : 'h-8 mt-1')}>
                      <span className={cn("font-semibold uppercase tracking-wider text-center truncate px-1", device === 'mobile' ? 'text-[8px]' : 'text-[9px]')} style={{ color: `${brandColor}cc` }}>
                        {item.name ? (item.name.length > 18 ? item.name.substring(0, 16) + '...' : item.name) : 'Certificate'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <MoreItemsBadge count={wallRemaining} />
            </>
          )}
        </div>
      </section>
    );
  };

  // Style 5: Carousel - Horizontal scroll với navigation arrows
  const renderCarouselStyle = () => {
    const itemsPerView = device === 'mobile' ? 2 : device === 'tablet' ? 3 : 4;
    const maxIndex = Math.max(0, items.length - itemsPerView);
    return (
      <section className={cn("w-full bg-white dark:bg-slate-900", device === 'mobile' ? 'py-8 px-3' : 'py-12 px-6')}>
        <div className="container max-w-7xl mx-auto">
          <SectionHeader />
          {items.length === 0 ? <EmptyState /> : (
            <div className="relative">
              {items.length > itemsPerView && (
                <>
                  <button
                    onClick={() => setCarouselIndex(Math.max(0, carouselIndex - 1))}
                    disabled={carouselIndex === 0}
                    className={cn("absolute top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white dark:bg-slate-800 shadow-lg flex items-center justify-center transition-all", carouselIndex === 0 ? 'opacity-40 cursor-not-allowed' : 'hover:scale-110')}
                    style={{ left: device === 'mobile' ? '-4px' : '-16px', border: `1px solid ${brandColor}20` }}
                  >
                    <ChevronLeft size={20} style={{ color: brandColor }} />
                  </button>
                  <button
                    onClick={() => setCarouselIndex(Math.min(maxIndex, carouselIndex + 1))}
                    disabled={carouselIndex >= maxIndex}
                    className={cn("absolute top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white dark:bg-slate-800 shadow-lg flex items-center justify-center transition-all", carouselIndex >= maxIndex ? 'opacity-40 cursor-not-allowed' : 'hover:scale-110')}
                    style={{ right: device === 'mobile' ? '-4px' : '-16px', border: `1px solid ${brandColor}20` }}
                  >
                    <ChevronRight size={20} style={{ color: brandColor }} />
                  </button>
                </>
              )}
              <div className={cn("overflow-hidden", device === 'mobile' ? 'mx-2' : 'mx-6')}>
                <div className="flex transition-transform duration-300 ease-out gap-4" style={{ transform: `translateX(-${carouselIndex * (100 / itemsPerView)}%)` }}>
                  {items.map((item) => (
                    <div 
                      key={item.id} 
                      className="flex-shrink-0 group cursor-pointer"
                      style={{ width: `calc(${100 / itemsPerView}% - ${(itemsPerView - 1) * 16 / itemsPerView}px)` }}
                    >
                      <div 
                        className="aspect-square rounded-xl flex items-center justify-center transition-all duration-300"
                        style={{ padding: device === 'mobile' ? '12px' : '16px', backgroundColor: `${brandColor}05`, border: `1px solid ${brandColor}15` }}
                        onMouseEnter={(e) => { 
                          e.currentTarget.style.borderColor = `${brandColor}40`; 
                          e.currentTarget.style.boxShadow = `0 8px 20px ${brandColor}15`; 
                          e.currentTarget.style.transform = 'translateY(-4px)';
                        }}
                        onMouseLeave={(e) => { 
                          e.currentTarget.style.borderColor = `${brandColor}15`; 
                          e.currentTarget.style.boxShadow = 'none';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                      >
                        {item.url ? (
                          <img src={item.url} className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105" alt={item.name || 'Chứng nhận'} />
                        ) : (
                          <ImageIcon size={32} className="text-slate-300" />
                        )}
                      </div>
                      {item.name && (
                        <p className="text-center text-xs font-medium text-slate-500 mt-2 truncate px-1">{item.name}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              {items.length > itemsPerView && (
                <div className="flex justify-center gap-2 mt-6">
                  {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
                    <button key={idx} onClick={() => setCarouselIndex(idx)} className={cn("h-2 rounded-full transition-all", carouselIndex === idx ? 'w-6' : 'w-2')} style={{ backgroundColor: carouselIndex === idx ? brandColor : `${brandColor}30` }} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    );
  };

  // Style 6: Featured - 1 item nổi bật + grid nhỏ bên dưới
  const renderFeaturedStyle = () => {
    const featuredItem = items[0];
    const otherItems = items.slice(1, device === 'mobile' ? 5 : 7);
    const featuredRemaining = items.length - 1 - otherItems.length;
    return (
      <section className={cn("w-full bg-white dark:bg-slate-900", device === 'mobile' ? 'py-8 px-3' : 'py-12 px-6')}>
        <div className="container max-w-7xl mx-auto">
          <SectionHeader />
          {items.length === 0 ? <EmptyState /> : (
            <div className={cn("grid gap-5", device === 'mobile' ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2')}>
              {featuredItem && (
                <div 
                  className="group cursor-pointer rounded-2xl overflow-hidden transition-all duration-300"
                  style={{ backgroundColor: `${brandColor}08`, border: `2px solid ${brandColor}20` }}
                  onMouseEnter={(e) => { 
                    e.currentTarget.style.borderColor = `${brandColor}40`; 
                    e.currentTarget.style.boxShadow = `0 12px 32px ${brandColor}15`; 
                  }}
                  onMouseLeave={(e) => { 
                    e.currentTarget.style.borderColor = `${brandColor}20`; 
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div className={cn("flex items-center justify-center relative", device === 'mobile' ? 'aspect-[4/3] p-6' : 'aspect-[4/3] p-10')}>
                    {featuredItem.url ? (
                      <img src={featuredItem.url} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" alt={featuredItem.name || 'Chứng nhận nổi bật'} />
                    ) : (
                      <ImageIcon size={64} className="text-slate-300" />
                    )}
                    <div className="absolute top-3 left-3">
                      <span className="px-3 py-1 rounded-full text-xs font-bold text-white" style={{ backgroundColor: brandColor }}>
                        NỔI BẬT
                      </span>
                    </div>
                    <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white shadow-lg" style={{ color: brandColor }}>
                        <ZoomIn size={20} />
                      </div>
                    </div>
                  </div>
                  <div className={cn("border-t flex items-center justify-center", device === 'mobile' ? 'py-3 min-h-[48px]' : 'py-4')} style={{ borderColor: `${brandColor}15` }}>
                    <span className="font-bold text-base" style={{ color: brandColor }}>
                      {featuredItem.name || 'Chứng nhận nổi bật'}
                    </span>
                  </div>
                </div>
              )}
              <div className={cn("grid gap-3", device === 'mobile' ? 'grid-cols-2' : 'grid-cols-3')}>
                {otherItems.map((item) => (
                  <div 
                    key={item.id} 
                    className="group aspect-square rounded-xl flex items-center justify-center cursor-pointer transition-all duration-300"
                    style={{ padding: device === 'mobile' ? '10px' : '12px', backgroundColor: `${brandColor}05`, border: `1px solid ${brandColor}15` }}
                    onMouseEnter={(e) => { 
                      e.currentTarget.style.borderColor = `${brandColor}40`; 
                      e.currentTarget.style.boxShadow = `0 4px 12px ${brandColor}10`; 
                    }}
                    onMouseLeave={(e) => { 
                      e.currentTarget.style.borderColor = `${brandColor}15`; 
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    {item.url ? (
                      <img src={item.url} className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105" alt={item.name || 'Chứng nhận'} />
                    ) : (
                      <ImageIcon size={24} className="text-slate-300" />
                    )}
                  </div>
                ))}
                {featuredRemaining > 0 && (
                  <div 
                    className="aspect-square rounded-xl flex flex-col items-center justify-center cursor-pointer"
                    style={{ backgroundColor: `${brandColor}08`, border: `2px dashed ${brandColor}30` }}
                  >
                    <Plus size={24} style={{ color: brandColor }} />
                    <span className="text-sm font-bold mt-1" style={{ color: brandColor }}>+{featuredRemaining}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    );
  };

  // Image Guidelines Component
  const ImageGuidelines = () => (
    <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
      <div className="flex items-start gap-2">
        <ImageIcon size={14} className="text-slate-400 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-slate-600 dark:text-slate-400">
          {previewStyle === 'grid' && (
            <p><strong>300×300px</strong> (1:1) • Ảnh vuông, nền trong suốt PNG. Scale up on hover.</p>
          )}
          {previewStyle === 'cards' && (
            <p><strong>400×320px</strong> (5:4) • Ảnh chứng nhận rõ ràng, zoom on hover.</p>
          )}
          {previewStyle === 'marquee' && (
            <p><strong>200×120px</strong> (5:3) • Logo/badge nhỏ gọn, auto scroll, hover pause.</p>
          )}
          {previewStyle === 'wall' && (
            <p><strong>250×300px</strong> (5:6) • Khung ảnh dọc như bằng khen treo tường.</p>
          )}
          {previewStyle === 'carousel' && (
            <p><strong>280×280px</strong> (1:1) • Grid vuông, navigation arrows, responsive.</p>
          )}
          {previewStyle === 'featured' && (
            <p><strong>Featured: 600×450px</strong> (4:3) • <strong>Others: 200×200px</strong> (1:1) • 1 nổi bật + grid nhỏ.</p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <PreviewWrapper 
        title="Preview Chứng nhận" 
        device={device} 
        setDevice={setDevice} 
        previewStyle={previewStyle} 
        setPreviewStyle={setPreviewStyle} 
        styles={styles} 
        info={`${items.length} chứng nhận`}
      >
        <BrowserFrame>
          {previewStyle === 'grid' && renderGridStyle()}
          {previewStyle === 'cards' && renderCardsStyle()}
          {previewStyle === 'marquee' && renderMarqueeStyle()}
          {previewStyle === 'wall' && renderWallStyle()}
          {previewStyle === 'carousel' && renderCarouselStyle()}
          {previewStyle === 'featured' && renderFeaturedStyle()}
        </BrowserFrame>
      </PreviewWrapper>
      <ImageGuidelines />
    </>
  );
};

// ============ SPEED DIAL PREVIEW ============
type SpeedDialAction = { id: number; icon: string; label: string; url: string; bgColor: string };
export type SpeedDialStyle = 'fab' | 'sidebar' | 'pills' | 'stack' | 'dock' | 'minimal';

const SpeedDialIcon = ({ name, size = 20 }: { name: string; size?: number }) => {
  const icons: Record<string, React.ReactNode> = {
    'phone': <Phone size={size} />,
    'mail': <Mail size={size} />,
    'message-circle': <span className="inline-flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/></svg></span>,
    'map-pin': <MapPin size={size} />,
    'facebook': <span className="inline-flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg></span>,
    'instagram': <span className="inline-flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg></span>,
    'youtube': <span className="inline-flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg></span>,
    'zalo': <span className="inline-flex items-center justify-center text-[10px] font-bold">Zalo</span>,
    'calendar': <span className="inline-flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg></span>,
    'shopping-cart': <span className="inline-flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg></span>,
    'headphones': <span className="inline-flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"/></svg></span>,
    'help-circle': <span className="inline-flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg></span>,
  };
  return <>{icons[name] || <Plus size={size} />}</>;
};

export const SpeedDialPreview = ({ 
  config, 
  brandColor, 
  selectedStyle, 
  onStyleChange 
}: { 
  config: {
    actions: SpeedDialAction[];
    style: SpeedDialStyle;
    position: 'bottom-right' | 'bottom-left';
    mainButtonColor: string;
    alwaysOpen?: boolean;
  };
  brandColor: string;
  selectedStyle?: SpeedDialStyle;
  onStyleChange?: (style: SpeedDialStyle) => void;
}) => {
  const [device, setDevice] = useState<PreviewDevice>('desktop');
  const previewStyle = selectedStyle || config.style || 'fab';
  const setPreviewStyle = (s: string) => onStyleChange?.(s as SpeedDialStyle);
  
  // BẮT BUỘC 6 styles theo Best Practice
  const styles = [
    { id: 'fab', label: 'FAB' },
    { id: 'sidebar', label: 'Sidebar' },
    { id: 'pills', label: 'Pills' },
    { id: 'stack', label: 'Stack' },
    { id: 'dock', label: 'Dock' },
    { id: 'minimal', label: 'Minimal' },
  ];

  const isRight = config.position !== 'bottom-left';
  const isMobile = device === 'mobile';
  const isTablet = device === 'tablet';
  const iconSize = isMobile ? 16 : 18;
  const gap = isMobile ? 'gap-2' : 'gap-2.5';

  // Empty State
  const renderEmptyState = () => (
    <div className={cn("absolute flex flex-col items-center justify-center", isRight ? "right-4 bottom-4" : "left-4 bottom-4")}>
      <div className="w-14 h-14 rounded-full flex items-center justify-center mb-2 opacity-40" style={{ backgroundColor: `${brandColor}20` }}>
        <Plus size={24} style={{ color: brandColor }} />
      </div>
      <p className="text-xs text-slate-400 text-center max-w-[100px]">Thêm hành động</p>
    </div>
  );

  // Style 1: FAB - Floating Action Buttons (vertical stack)
  const renderFabStyle = () => (
    <div className={cn(
      "absolute bottom-4 flex flex-col gap-2",
      isRight ? "right-4 items-end" : "left-4 items-start"
    )}>
      {config.actions.map((action) => (
        <a
          key={action.id}
          href={action.url || '#'}
          className="group flex items-center gap-2"
        >
          {isRight && action.label && (
            <span className="px-2.5 py-1 bg-slate-900/90 text-white text-xs font-medium rounded-md shadow-lg opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-200 whitespace-nowrap">
              {action.label}
            </span>
          )}
          <div
            className="w-11 h-11 rounded-full shadow-lg flex items-center justify-center text-white hover:scale-110 hover:shadow-xl transition-all duration-200 cursor-pointer"
            style={{ backgroundColor: action.bgColor || brandColor }}
          >
            <SpeedDialIcon name={action.icon} size={18} />
          </div>
          {!isRight && action.label && (
            <span className="px-2.5 py-1 bg-slate-900/90 text-white text-xs font-medium rounded-md shadow-lg opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0 transition-all duration-200 whitespace-nowrap">
              {action.label}
            </span>
          )}
        </a>
      ))}
    </div>
  );

  // Style 2: Sidebar - Vertical bar attached to edge
  const renderSidebarStyle = () => (
    <div className={cn(
      "absolute top-1/2 -translate-y-1/2 flex flex-col overflow-hidden shadow-xl",
      isRight ? "right-0 rounded-l-xl" : "left-0 rounded-r-xl"
    )}>
      {config.actions.map((action, idx) => (
        <a
          key={action.id}
          href={action.url || '#'}
          className="group relative flex items-center justify-center w-12 h-12 text-white hover:w-32 transition-all duration-200 overflow-hidden"
          style={{ backgroundColor: action.bgColor || brandColor }}
        >
          <div className={cn(
            "absolute flex items-center gap-2 transition-all duration-200",
            isRight ? "right-3" : "left-3"
          )}>
            <SpeedDialIcon name={action.icon} size={18} />
          </div>
          {action.label && (
            <span className={cn(
              "absolute text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200",
              isRight ? "right-10" : "left-10"
            )}>
              {action.label}
            </span>
          )}
          {idx < config.actions.length - 1 && (
            <div className="absolute bottom-0 left-2 right-2 h-px bg-white/20" />
          )}
        </a>
      ))}
    </div>
  );

  // Style 3: Pills - Rounded pills with labels
  const renderPillsStyle = () => (
    <div className={cn("absolute flex flex-col", gap, isRight ? "right-4 bottom-4 items-end" : "left-4 bottom-4 items-start")} role="group" aria-label="Liên hệ nhanh">
      {config.actions.map((action) => (
        <a key={action.id} href={action.url || '#'} className={cn("flex items-center rounded-full shadow-lg text-white hover:shadow-xl hover:scale-[1.02] transition-all duration-200 cursor-pointer min-h-[44px]", isMobile ? "gap-2 pl-3 pr-4 py-2" : "gap-2.5 pl-4 pr-5 py-2.5", isRight ? "flex-row" : "flex-row-reverse")} style={{ backgroundColor: action.bgColor || brandColor }} aria-label={action.label || action.icon}>
          <SpeedDialIcon name={action.icon} size={isMobile ? 14 : 16} />
          {action.label && <span className={cn("font-medium whitespace-nowrap", isMobile ? "text-[11px]" : "text-xs")}>{action.label}</span>}
        </a>
      ))}
    </div>
  );

  // Style 4: Stack - Overlapping buttons
  const renderStackStyle = () => (
    <div className={cn("absolute flex flex-col items-center", isRight ? "right-4 bottom-4" : "left-4 bottom-4")} role="group" aria-label="Liên hệ nhanh">
      <div className="relative" style={{ height: `${Math.min(config.actions.length * 32 + 20, 180)}px` }}>
        {config.actions.map((action, idx) => (
          <a key={action.id} href={action.url || '#'} className={cn("group absolute left-1/2 -translate-x-1/2 flex items-center justify-center rounded-full shadow-lg text-white hover:scale-110 hover:z-50 transition-all duration-200 cursor-pointer", isMobile ? "w-10 h-10" : "w-11 h-11")} style={{ backgroundColor: action.bgColor || brandColor, bottom: `${idx * (isMobile ? 28 : 32)}px`, zIndex: config.actions.length - idx, boxShadow: `0 4px 12px ${action.bgColor || brandColor}40` }} aria-label={action.label || action.icon}>
            <SpeedDialIcon name={action.icon} size={isMobile ? 14 : 16} />
            {action.label && <span className={cn("absolute px-2 py-1 bg-slate-900/90 text-white text-xs font-medium rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap", isRight ? "right-full mr-2" : "left-full ml-2")}>{action.label}</span>}
          </a>
        ))}
      </div>
    </div>
  );

  // Style 5: Dock - MacOS dock style
  const renderDockStyle = () => (
    <div className={cn("absolute bottom-4 left-1/2 -translate-x-1/2 flex items-end justify-center rounded-2xl p-2", isMobile ? "gap-1" : "gap-1.5")} style={{ backgroundColor: `${brandColor}10`, backdropFilter: 'blur(8px)' }} role="group" aria-label="Liên hệ nhanh">
      {config.actions.map((action) => (
        <a key={action.id} href={action.url || '#'} className={cn("group relative flex items-center justify-center rounded-xl text-white transition-all duration-200 cursor-pointer hover:scale-125 hover:-translate-y-2", isMobile ? "w-10 h-10" : "w-11 h-11")} style={{ backgroundColor: action.bgColor || brandColor, boxShadow: `0 4px 12px ${action.bgColor || brandColor}30` }} aria-label={action.label || action.icon}>
          <SpeedDialIcon name={action.icon} size={isMobile ? 14 : 16} />
          {action.label && <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-900/90 text-white text-[10px] font-medium rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap">{action.label}</span>}
        </a>
      ))}
    </div>
  );

  // Style 6: Minimal - Icons only, compact bar
  const renderMinimalStyle = () => (
    <div className={cn("absolute flex items-center bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-full shadow-lg px-2 py-1.5", isMobile ? "gap-1 bottom-3" : "gap-1.5 bottom-4", isRight ? "right-4" : "left-4")} style={{ boxShadow: `0 4px 20px ${brandColor}15` }} role="group" aria-label="Liên hệ nhanh">
      {config.actions.map((action, idx) => (
        <React.Fragment key={action.id}>
          <a href={action.url || '#'} className={cn("group relative flex items-center justify-center rounded-full transition-all duration-200 cursor-pointer hover:scale-110", isMobile ? "w-9 h-9" : "w-10 h-10")} style={{ color: action.bgColor || brandColor }} aria-label={action.label || action.icon}>
            <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200" style={{ backgroundColor: `${action.bgColor || brandColor}15` }} />
            <SpeedDialIcon name={action.icon} size={isMobile ? 16 : 18} />
            {action.label && <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-900/90 text-white text-[10px] font-medium rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap z-10">{action.label}</span>}
          </a>
          {idx < config.actions.length - 1 && <div className="w-px h-5 bg-slate-200 dark:bg-slate-600" />}
        </React.Fragment>
      ))}
    </div>
  );

  // Dynamic info
  const getInfo = () => {
    const count = config.actions.length;
    if (count === 0) return 'Chưa có hành động';
    const styleInfo: Record<string, string> = { fab: 'Buttons dọc với tooltip', sidebar: 'Thanh cố định bên cạnh', pills: 'Nhãn luôn hiển thị', stack: 'Buttons xếp chồng', dock: 'Dock style (phóng to hover)', minimal: 'Chỉ icons, gọn nhẹ' };
    return `${count} hành động • ${styleInfo[previewStyle] || ''}`;
  };

  return (
    <PreviewWrapper title="Preview Speed Dial" device={device} setDevice={setDevice} previewStyle={previewStyle} setPreviewStyle={setPreviewStyle} styles={styles} info={getInfo()}>
      <BrowserFrame>
        <div className={cn("relative bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 overflow-hidden", isMobile ? "h-64" : isTablet ? "h-72" : "h-80")}>
          {/* Sample page content */}
          <div className={cn("space-y-2", isMobile ? "p-3" : "p-4")}>
            <div className={cn("bg-slate-200 dark:bg-slate-700 rounded", isMobile ? "h-4 w-32" : "h-5 w-40")} />
            <div className="h-3 w-full bg-slate-100 dark:bg-slate-700/50 rounded" />
            <div className="h-3 w-4/5 bg-slate-100 dark:bg-slate-700/50 rounded" />
            <div className={cn("grid gap-2 mt-3", isMobile ? "grid-cols-2" : "grid-cols-3")}>
              <div className={cn("bg-slate-100 dark:bg-slate-700/50 rounded-lg", isMobile ? "h-12" : "h-16")} />
              <div className={cn("bg-slate-100 dark:bg-slate-700/50 rounded-lg", isMobile ? "h-12" : "h-16")} />
              {!isMobile && <div className="h-16 bg-slate-100 dark:bg-slate-700/50 rounded-lg" />}
            </div>
          </div>
          
          {/* Speed Dial - 6 styles + empty state */}
          {config.actions.length === 0 ? renderEmptyState() : (
            <>
              {previewStyle === 'fab' && renderFabStyle()}
              {previewStyle === 'sidebar' && renderSidebarStyle()}
              {previewStyle === 'pills' && renderPillsStyle()}
              {previewStyle === 'stack' && renderStackStyle()}
              {previewStyle === 'dock' && renderDockStyle()}
              {previewStyle === 'minimal' && renderMinimalStyle()}
            </>
          )}
        </div>
      </BrowserFrame>
    </PreviewWrapper>
  );
};

// ============ PRODUCT CATEGORIES PREVIEW ============
// Best Practices: Clear navigation, visual appeal, mobile optimization, hover effects
// 6 styles: grid, carousel, cards, minimal, showcase, marquee
type CategoryConfigItem = { id: number; categoryId: string; customImage?: string; imageMode?: 'default' | 'icon' | 'upload' | 'url' };
type CategoryData = { _id: string; name: string; slug: string; image?: string; description?: string };
export type ProductCategoriesStyle = 'grid' | 'carousel' | 'cards' | 'minimal' | 'showcase' | 'marquee';

// Import icon render helper
import { getCategoryIcon } from '@/app/admin/components/CategoryImageSelector';

export const ProductCategoriesPreview = ({ 
  config, 
  brandColor, 
  selectedStyle, 
  onStyleChange,
  categoriesData
}: { 
  config: {
    categories: CategoryConfigItem[];
    style: ProductCategoriesStyle;
    showProductCount: boolean;
    columnsDesktop: number;
    columnsMobile: number;
  };
  brandColor: string;
  selectedStyle?: ProductCategoriesStyle;
  onStyleChange?: (style: ProductCategoriesStyle) => void;
  categoriesData: CategoryData[];
}) => {
  const [device, setDevice] = useState<PreviewDevice>('desktop');
  const isMobile = device === 'mobile';
  const isTablet = device === 'tablet';
  const previewStyle = selectedStyle || config.style || 'grid';
  const setPreviewStyle = (s: string) => onStyleChange?.(s as ProductCategoriesStyle);
  
  const styles = [
    { id: 'grid', label: 'Grid' },
    { id: 'carousel', label: 'Carousel' },
    { id: 'cards', label: 'Cards' },
    { id: 'minimal', label: 'Minimal' },
    { id: 'showcase', label: 'Showcase' },
    { id: 'marquee', label: 'Marquee' },
  ];

  const categoryMap = React.useMemo(() => {
    const map: Record<string, CategoryData> = {};
    for (const cat of categoriesData) {
      map[cat._id] = cat;
    }
    return map;
  }, [categoriesData]);

  const resolvedCategories = config.categories
    .map((item, idx) => {
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
        itemId: item.id || idx, // Unique key from config item
        displayImage,
        displayIcon,
        imageMode,
      };
    })
    .filter(Boolean) as (CategoryData & { itemId: number; displayImage?: string; displayIcon?: string; imageMode: string })[];

  const getGridCols = () => {
    if (isMobile) return config.columnsMobile === 3 ? 'grid-cols-3' : 'grid-cols-2';
    if (isTablet) return 'grid-cols-3';
    switch (config.columnsDesktop) {
      case 3: return 'grid-cols-3';
      case 5: return 'grid-cols-5';
      case 6: return 'grid-cols-6';
      default: return 'grid-cols-4';
    }
  };

  // Max visible items for "+N" pattern
  const MAX_VISIBLE = isMobile ? 4 : isTablet ? 6 : 8;
  const visibleCategories = resolvedCategories.slice(0, MAX_VISIBLE);
  const remainingCount = resolvedCategories.length - MAX_VISIBLE;

  // Empty state với brandColor
  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div 
        className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
        style={{ backgroundColor: `${brandColor}10` }}
      >
        <Package size={32} style={{ color: brandColor }} />
      </div>
      <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-1">Chưa có danh mục nào</h3>
      <p className="text-sm text-slate-500">Thêm danh mục để bắt đầu hiển thị</p>
    </div>
  );

  // Render category image/icon helper
  const renderCategoryVisual = (cat: typeof resolvedCategories[0], size: 'sm' | 'md' | 'lg' = 'md') => {
    const iconData = cat.displayIcon ? getCategoryIcon(cat.displayIcon) : null;
    const iconSizes = { sm: isMobile ? 24 : 28, md: isMobile ? 32 : 40, lg: isMobile ? 40 : 56 };
    const iconSize = iconSizes[size];
    
    if (cat.displayIcon && iconData) {
      return (
        <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: brandColor }}>
          {React.createElement(iconData.icon, { size: iconSize, className: 'text-white' })}
        </div>
      );
    }
    if (cat.displayImage) {
      return <img src={cat.displayImage} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />;
    }
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-800">
        <Package size={iconSize} className="text-slate-300" />
      </div>
    );
  };

  // Style 1: Grid - Classic grid with hover effect + monochromatic
  const renderGridStyle = () => {
    // Centered layout for few items
    const gridItems = resolvedCategories.length <= 2 
      ? resolvedCategories 
      : visibleCategories;
    const containerClass = resolvedCategories.length === 1 
      ? 'max-w-xs mx-auto' 
      : resolvedCategories.length === 2 
        ? 'max-w-lg mx-auto grid grid-cols-2 gap-4'
        : cn("grid gap-4", getGridCols());

    return (
      <section className={cn("w-full", isMobile ? 'py-6 px-3' : 'py-10 px-6')}>
        <div className="max-w-7xl mx-auto">
          <h2 className={cn("font-bold mb-6 text-center", isMobile ? 'text-lg' : 'text-xl md:text-2xl')}>
            Danh mục sản phẩm
          </h2>
          
          {resolvedCategories.length === 0 ? renderEmptyState() : (
            <div className={containerClass}>
              {gridItems.map((cat) => (
                <div 
                  key={cat.itemId} 
                  className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer transition-all duration-300"
                  style={{ 
                    boxShadow: `0 2px 8px ${brandColor}10`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = `0 8px 24px ${brandColor}25`;
                    e.currentTarget.style.transform = 'translateY(-4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = `0 2px 8px ${brandColor}10`;
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {renderCategoryVisual(cat, 'lg')}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className={cn("absolute bottom-0 left-0 right-0 text-white", isMobile ? 'p-3' : 'p-4')}>
                    <h3 className={cn("font-semibold line-clamp-1", isMobile ? 'text-sm' : 'text-base')}>{cat.name}</h3>
                    {config.showProductCount && (
                      <p className="text-xs opacity-80 mt-0.5">12 sản phẩm</p>
                    )}
                  </div>
                </div>
              ))}
              
              {/* +N more pattern */}
              {remainingCount > 0 && resolvedCategories.length > 2 && (
                <div 
                  className="flex flex-col items-center justify-center aspect-square rounded-xl cursor-pointer transition-all"
                  style={{ backgroundColor: `${brandColor}08`, border: `2px dashed ${brandColor}30` }}
                >
                  <Plus size={isMobile ? 24 : 32} style={{ color: brandColor }} className="mb-2" />
                  <span className={cn("font-bold", isMobile ? 'text-base' : 'text-lg')} style={{ color: brandColor }}>
                    +{remainingCount}
                  </span>
                  <p className="text-xs text-slate-500 mt-1">danh mục khác</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    );
  };

  // Style 2: Carousel - Horizontal scroll with navigation
  const renderCarouselStyle = () => (
    <section className={cn("w-full", isMobile ? 'py-6' : 'py-10')}>
      <div className="max-w-7xl mx-auto">
        <div className={cn("flex items-center justify-between mb-6", isMobile ? 'px-3' : 'px-6')}>
          <h2 className={cn("font-bold", isMobile ? 'text-lg' : 'text-xl md:text-2xl')}>Danh mục sản phẩm</h2>
          <button 
            className="text-sm font-medium flex items-center gap-1 hover:underline whitespace-nowrap"
            style={{ color: brandColor }}
          >
            Xem tất cả <ChevronRight size={16} />
          </button>
        </div>
        
        {resolvedCategories.length === 0 ? (
          <div className={cn(isMobile ? 'px-3' : 'px-6')}>{renderEmptyState()}</div>
        ) : (
          <div className={cn("overflow-x-auto pb-4 scrollbar-hide", isMobile ? 'px-3' : 'px-6')}>
            <div className={cn("flex", isMobile ? 'gap-3' : 'gap-4')}>
              {resolvedCategories.map((cat) => (
                <div 
                  key={cat.itemId} 
                  className={cn("flex-shrink-0 group cursor-pointer", isMobile ? 'w-28' : 'w-40')}
                >
                  <div 
                    className="aspect-square rounded-xl overflow-hidden mb-2 transition-all"
                    style={{ border: `2px solid ${brandColor}15` }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${brandColor}40`; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = `${brandColor}15`; }}
                  >
                    {renderCategoryVisual(cat, 'md')}
                  </div>
                  <h3 className={cn("font-medium text-center line-clamp-1", isMobile ? 'text-xs' : 'text-sm')}>
                    {cat.name}
                  </h3>
                  {config.showProductCount && (
                    <p className="text-xs text-slate-500 text-center">12 sản phẩm</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );

  // Style 3: Cards - Modern horizontal cards with description
  const renderCardsStyle = () => {
    const displayItems = isMobile ? resolvedCategories.slice(0, 3) : resolvedCategories.slice(0, 6);
    
    return (
      <section className={cn("w-full", isMobile ? 'py-6 px-3' : 'py-10 px-6')} style={{ backgroundColor: `${brandColor}05` }}>
        <div className="max-w-7xl mx-auto">
          <h2 className={cn("font-bold mb-6 text-center", isMobile ? 'text-lg' : 'text-xl md:text-2xl')}>
            Khám phá theo danh mục
          </h2>
          
          {resolvedCategories.length === 0 ? renderEmptyState() : (
            <div className={cn("grid", isMobile ? 'grid-cols-1 gap-3' : isTablet ? 'grid-cols-2 gap-4' : 'grid-cols-3 gap-4')}>
              {displayItems.map((cat) => (
                <div 
                  key={cat.itemId} 
                  className="group bg-white dark:bg-slate-800 rounded-xl overflow-hidden flex cursor-pointer transition-all"
                  style={{ border: `1px solid ${brandColor}15` }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = `${brandColor}40`;
                    e.currentTarget.style.boxShadow = `0 4px 12px ${brandColor}15`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = `${brandColor}15`;
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div className={cn("flex-shrink-0", isMobile ? 'w-20 h-20' : 'w-28 h-28')}>
                    {renderCategoryVisual(cat, 'sm')}
                  </div>
                  <div className={cn("flex-1 flex flex-col justify-center", isMobile ? 'p-3' : 'p-4')}>
                    <h3 className={cn("font-semibold line-clamp-1 mb-1", isMobile ? 'text-sm' : 'text-base')}>{cat.name}</h3>
                    {cat.description && (
                      <p className="text-xs text-slate-500 line-clamp-2 mb-2 min-h-[2rem]">{cat.description}</p>
                    )}
                    <span className="text-xs font-medium flex items-center gap-1" style={{ color: brandColor }}>
                      Xem sản phẩm <ArrowRight size={12} />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    );
  };

  // Style 4: Minimal - Text-based with small icons, compact layout
  const renderMinimalStyle = () => (
    <section className={cn("w-full", isMobile ? 'py-6 px-3' : 'py-10 px-6')}>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className={cn("font-bold", isMobile ? 'text-lg' : 'text-xl')}>Danh mục</h2>
          <button className="text-sm font-medium hover:underline" style={{ color: brandColor }}>
            Tất cả →
          </button>
        </div>
        
        {resolvedCategories.length === 0 ? renderEmptyState() : (
          <div className={cn("flex flex-wrap", isMobile ? 'gap-2' : 'gap-3')}>
            {resolvedCategories.map((cat) => {
              const iconData = cat.displayIcon ? getCategoryIcon(cat.displayIcon) : null;
              return (
                <div 
                  key={cat.itemId} 
                  className={cn(
                    "flex items-center gap-2 rounded-full cursor-pointer transition-all",
                    isMobile ? 'px-3 py-2' : 'px-4 py-2.5'
                  )}
                  style={{ 
                    backgroundColor: `${brandColor}08`,
                    border: `1px solid ${brandColor}20`
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = `${brandColor}15`;
                    e.currentTarget.style.borderColor = `${brandColor}40`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = `${brandColor}08`;
                    e.currentTarget.style.borderColor = `${brandColor}20`;
                  }}
                >
                  {cat.displayIcon && iconData ? (
                    React.createElement(iconData.icon, { size: isMobile ? 14 : 16, style: { color: brandColor } })
                  ) : cat.displayImage ? (
                    <img src={cat.displayImage} alt="" className={cn("rounded-full object-cover", isMobile ? 'w-5 h-5' : 'w-6 h-6')} />
                  ) : (
                    <Package size={isMobile ? 14 : 16} style={{ color: brandColor }} />
                  )}
                  <span className={cn("font-medium whitespace-nowrap", isMobile ? 'text-xs' : 'text-sm')}>
                    {cat.name}
                  </span>
                  {config.showProductCount && (
                    <span className="text-xs text-slate-400">(12)</span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );

  // Style 5: Showcase - Featured first item + grid of smaller items
  const renderShowcaseStyle = () => {
    if (resolvedCategories.length === 0) return (
      <section className={cn("w-full", isMobile ? 'py-6 px-3' : 'py-10 px-6')}>
        <div className="max-w-7xl mx-auto">{renderEmptyState()}</div>
      </section>
    );
    
    const [featured, ...others] = resolvedCategories;
    const displayOthers = others.slice(0, isMobile ? 3 : 5);

    return (
      <section className={cn("w-full", isMobile ? 'py-6 px-3' : 'py-10 px-6')}>
        <div className="max-w-7xl mx-auto">
          <h2 className={cn("font-bold mb-6 text-center", isMobile ? 'text-lg' : 'text-xl md:text-2xl')}>
            Danh mục nổi bật
          </h2>
          
          <div className={cn("grid gap-4", isMobile ? 'grid-cols-1' : 'grid-cols-3')}>
            {/* Featured category */}
            <div 
              className={cn(
                "relative rounded-2xl overflow-hidden cursor-pointer group",
                isMobile ? 'aspect-[4/3]' : 'row-span-2 aspect-auto'
              )}
              style={{ boxShadow: `0 8px 30px ${brandColor}20` }}
            >
              {renderCategoryVisual(featured, 'lg')}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              <div className={cn("absolute bottom-0 left-0 right-0 text-white", isMobile ? 'p-4' : 'p-6')}>
                <span 
                  className="inline-block px-2 py-1 text-xs font-bold rounded mb-2"
                  style={{ backgroundColor: brandColor }}
                >
                  NỔI BẬT
                </span>
                <h3 className={cn("font-bold line-clamp-1", isMobile ? 'text-lg' : 'text-xl')}>{featured.name}</h3>
                {featured.description && (
                  <p className="text-sm opacity-80 line-clamp-2 mt-1">{featured.description}</p>
                )}
                {config.showProductCount && (
                  <p className="text-sm opacity-70 mt-2">12 sản phẩm</p>
                )}
              </div>
            </div>
            
            {/* Other categories grid */}
            <div className={cn("grid gap-3", isMobile ? 'grid-cols-2' : 'col-span-2 grid-cols-2 lg:grid-cols-3')}>
              {displayOthers.map((cat) => (
                <div 
                  key={cat.itemId} 
                  className="relative aspect-[4/3] rounded-xl overflow-hidden cursor-pointer group transition-all"
                  style={{ border: `2px solid ${brandColor}15` }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = `${brandColor}40`;
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = `${brandColor}15`;
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {renderCategoryVisual(cat, 'md')}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className={cn("absolute bottom-0 left-0 right-0 text-white", isMobile ? 'p-2' : 'p-3')}>
                    <h3 className={cn("font-semibold line-clamp-1", isMobile ? 'text-xs' : 'text-sm')}>{cat.name}</h3>
                  </div>
                </div>
              ))}
              
              {/* +N more */}
              {others.length > displayOthers.length && (
                <div 
                  className="flex flex-col items-center justify-center aspect-[4/3] rounded-xl cursor-pointer"
                  style={{ backgroundColor: `${brandColor}08`, border: `2px dashed ${brandColor}30` }}
                >
                  <Plus size={20} style={{ color: brandColor }} />
                  <span className="font-bold text-sm mt-1" style={{ color: brandColor }}>
                    +{others.length - displayOthers.length}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    );
  };

  // Style 6: Marquee - Auto-scrolling horizontal animation
  const renderMarqueeStyle = () => (
    <section className={cn("w-full overflow-hidden", isMobile ? 'py-6' : 'py-10')}>
      <div className="max-w-7xl mx-auto">
        <h2 className={cn("font-bold mb-6 text-center", isMobile ? 'text-lg px-3' : 'text-xl md:text-2xl')}>
          Khám phá danh mục
        </h2>
        
        {resolvedCategories.length === 0 ? (
          <div className={cn(isMobile ? 'px-3' : 'px-6')}>{renderEmptyState()}</div>
        ) : (
          <div className="relative">
            {/* Gradient masks */}
            <div className="absolute left-0 top-0 bottom-0 w-12 z-10 bg-gradient-to-r from-white dark:from-slate-900 to-transparent pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-12 z-10 bg-gradient-to-l from-white dark:from-slate-900 to-transparent pointer-events-none" />
            
            {/* Marquee track */}
            <div className="flex animate-marquee">
              {[...resolvedCategories, ...resolvedCategories].map((cat, idx) => (
                <div 
                  key={`${cat._id}-${idx}`} 
                  className={cn(
                    "flex-shrink-0 flex items-center gap-3 rounded-full cursor-pointer mx-2 transition-all",
                    isMobile ? 'px-3 py-2' : 'px-4 py-3'
                  )}
                  style={{ 
                    backgroundColor: 'white',
                    border: `2px solid ${brandColor}20`,
                    boxShadow: `0 2px 8px ${brandColor}10`
                  }}
                >
                  <div className={cn("rounded-full overflow-hidden flex-shrink-0", isMobile ? 'w-8 h-8' : 'w-10 h-10')}>
                    {renderCategoryVisual(cat, 'sm')}
                  </div>
                  <div className="min-w-0">
                    <h3 className={cn("font-semibold whitespace-nowrap", isMobile ? 'text-xs' : 'text-sm')}>
                      {cat.name}
                    </h3>
                    {config.showProductCount && (
                      <p className="text-xs text-slate-400 whitespace-nowrap">12 sản phẩm</p>
                    )}
                  </div>
                  <ArrowUpRight size={14} style={{ color: brandColor }} className="flex-shrink-0" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );

  // Dynamic info bar với image size recommendations
  const getPreviewInfo = () => {
    const count = resolvedCategories.length;
    if (count === 0) return 'Chưa có danh mục';
    
    const sizeRecommendations: Record<string, string> = {
      grid: `${count} danh mục • Ảnh: 400×400px (1:1)`,
      carousel: `${count} danh mục • Ảnh: 300×300px (1:1)`,
      cards: `${count} danh mục • Ảnh: 200×200px (1:1)`,
      minimal: `${count} danh mục • Icon/Ảnh: 48×48px`,
      showcase: `${count} danh mục • Featured: 600×800px (3:4) • Others: 400×300px (4:3)`,
      marquee: `${count} danh mục • Ảnh: 80×80px (1:1)`,
    };
    return sizeRecommendations[previewStyle] || `${count} danh mục`;
  };

  return (
    <>
      <PreviewWrapper 
        title="Preview Danh mục sản phẩm" 
        device={device} 
        setDevice={setDevice} 
        previewStyle={previewStyle} 
        setPreviewStyle={setPreviewStyle} 
        styles={styles} 
        info={getPreviewInfo()}
      >
        <BrowserFrame>
          {previewStyle === 'grid' && renderGridStyle()}
          {previewStyle === 'carousel' && renderCarouselStyle()}
          {previewStyle === 'cards' && renderCardsStyle()}
          {previewStyle === 'minimal' && renderMinimalStyle()}
          {previewStyle === 'showcase' && renderShowcaseStyle()}
          {previewStyle === 'marquee' && renderMarqueeStyle()}
        </BrowserFrame>
      </PreviewWrapper>
      
      {/* Image size guidelines - BẮT BUỘC cho component có ảnh */}
      <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
        <div className="flex items-start gap-2">
          <ImageIcon size={14} className="text-slate-400 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-slate-600 dark:text-slate-400">
            {previewStyle === 'grid' && (
              <p><strong>400×400px</strong> (1:1) • Ảnh vuông cho grid đều, overlay gradient tự động</p>
            )}
            {previewStyle === 'carousel' && (
              <p><strong>300×300px</strong> (1:1) • Ảnh vuông nhỏ gọn cho carousel horizontal</p>
            )}
            {previewStyle === 'cards' && (
              <p><strong>200×200px</strong> (1:1) • Thumbnail nhỏ bên trái card</p>
            )}
            {previewStyle === 'minimal' && (
              <p><strong>48×48px</strong> hoặc icon • Style text-based, ảnh chỉ làm accent</p>
            )}
            {previewStyle === 'showcase' && (
              <p><strong>Featured:</strong> 600×800px (3:4) • <strong>Others:</strong> 400×300px (4:3)</p>
            )}
            {previewStyle === 'marquee' && (
              <p><strong>80×80px</strong> (1:1) • Avatar nhỏ trong pill, auto-scroll animation</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

// ============ CATEGORY PRODUCTS PREVIEW ============
// Sản phẩm theo danh mục - Mỗi section là 1 danh mục với các sản phẩm thuộc danh mục đó
export type CategoryProductsStyle = 'grid' | 'carousel' | 'cards' | 'bento' | 'magazine' | 'showcase';

interface CategoryProductsSection {
  id: number;
  categoryId: string;
  itemCount: number;
}

interface CategoryProductsConfig {
  sections: CategoryProductsSection[];
  style: CategoryProductsStyle;
  showViewAll: boolean;
  columnsDesktop: number;
  columnsMobile: number;
}

interface ProductData {
  _id: string;
  name: string;
  image?: string;
  price?: number;
  salePrice?: number;
  categoryId?: string;
}

interface CategoryProductsPreviewProps {
  config: CategoryProductsConfig;
  brandColor: string;
  selectedStyle: CategoryProductsStyle;
  onStyleChange: (style: CategoryProductsStyle) => void;
  categoriesData: Array<{ _id: string; name: string; slug?: string; image?: string }>;
  productsData: ProductData[];
}

export const CategoryProductsPreview = ({ 
  config, 
  brandColor, 
  selectedStyle, 
  onStyleChange, 
  categoriesData,
  productsData 
}: CategoryProductsPreviewProps) => {
  const [device, setDevice] = useState<PreviewDevice>('desktop');
  const previewStyle = selectedStyle || 'grid';
  const setPreviewStyle = (s: string) => onStyleChange(s as CategoryProductsStyle);
  
  const styles = [
    { id: 'grid', label: 'Grid' },
    { id: 'carousel', label: 'Carousel' },
    { id: 'cards', label: 'Cards' },
    { id: 'bento', label: 'Bento' },
    { id: 'magazine', label: 'Magazine' },
    { id: 'showcase', label: 'Showcase' },
  ];

  // Resolve sections with category and products data
  const resolvedSections = config.sections
    .map(section => {
      const category = categoriesData.find(c => c._id === section.categoryId);
      if (!category) return null;
      
      const products = productsData
        .filter(p => p.categoryId === section.categoryId)
        .slice(0, section.itemCount);
      
      return {
        ...section,
        category,
        products,
      };
    })
    .filter(Boolean) as Array<CategoryProductsSection & { 
      category: { _id: string; name: string; slug?: string; image?: string }; 
      products: ProductData[] 
    }>;

  const getGridCols = () => {
    if (device === 'mobile') {
      return config.columnsMobile === 1 ? 'grid-cols-1' : 'grid-cols-2';
    }
    if (device === 'tablet') {
      return 'grid-cols-3';
    }
    switch (config.columnsDesktop) {
      case 3: return 'grid-cols-3';
      case 5: return 'grid-cols-5';
      default: return 'grid-cols-4';
    }
  };

  const formatPrice = (price?: number) => {
    if (!price) return '0đ';
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
  };

  // Get info for PreviewWrapper based on style with image size recommendations
  const getPreviewInfo = () => {
    const sectionCount = resolvedSections.length;
    const totalProducts = resolvedSections.reduce((sum, s) => sum + s.products.length, 0);
    
    if (sectionCount === 0) return 'Chưa có section nào';
    
    switch (previewStyle) {
      case 'grid':
        return `${sectionCount} section • ${totalProducts} SP • Ảnh: 800×800px (1:1)`;
      case 'carousel':
        return `${sectionCount} section • ${totalProducts} SP • Ảnh: 800×800px (1:1)`;
      case 'cards':
        return `${sectionCount} section • ${totalProducts} SP • Ảnh: 800×800px (1:1)`;
      case 'bento':
        return `${sectionCount} section • Featured: 800×800px • Others: 600×400px`;
      case 'magazine':
        return `${sectionCount} section • Featured: 800×1000px (4:5) • Grid: 600×600px`;
      case 'showcase':
        return `${sectionCount} section • Featured: 1200×800px (3:2) • Others: 600×600px`;
      default:
        return `${sectionCount} section • ${totalProducts} sản phẩm`;
    }
  };

  // Empty State Component with brandColor
  const EmptyState = ({ message, size = 'normal' }: { message: string; size?: 'small' | 'normal' }) => (
    <div 
      className={cn(
        "text-center rounded-xl flex flex-col items-center justify-center",
        size === 'small' ? 'py-6' : 'py-12'
      )}
      style={{ backgroundColor: `${brandColor}05` }}
    >
      <div 
        className={cn(
          "rounded-full flex items-center justify-center mb-3",
          size === 'small' ? 'w-12 h-12' : 'w-16 h-16'
        )}
        style={{ backgroundColor: `${brandColor}10` }}
      >
        <Package size={size === 'small' ? 24 : 32} style={{ color: `${brandColor}50` }} />
      </div>
      <p className="text-sm text-slate-500">{message}</p>
    </div>
  );

  // Product Card Component with Equal Height (line-clamp + min-height)
  const ProductCard = ({ product }: { product: ProductData }) => (
    <div className="group cursor-pointer flex flex-col h-full">
      <div className="aspect-square rounded-lg overflow-hidden mb-2" style={{ backgroundColor: `${brandColor}08` }}>
        {product.image ? (
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package size={24} style={{ color: `${brandColor}40` }} />
          </div>
        )}
      </div>
      <h4 className={cn(
        "font-medium line-clamp-2",
        device === 'mobile' ? 'text-xs min-h-[2rem]' : 'text-sm min-h-[2.5rem]'
      )}>{product.name || 'Tên sản phẩm'}</h4>
      <div className="flex flex-col mt-auto">
        {product.salePrice && product.salePrice < (product.price || 0) ? (
          <>
            <span className={cn("font-bold", device === 'mobile' ? 'text-xs' : 'text-sm')} style={{ color: brandColor }}>
              {formatPrice(product.salePrice)}
            </span>
            <span className="text-[10px] text-slate-400 line-through">{formatPrice(product.price)}</span>
          </>
        ) : (
          <span className={cn("font-bold", device === 'mobile' ? 'text-xs' : 'text-sm')} style={{ color: brandColor }}>
            {formatPrice(product.price)}
          </span>
        )}
      </div>
    </div>
  );

  // Style 1: Grid - Classic grid layout per section
  const renderGridStyle = () => (
    <div className="w-full py-4 space-y-8 md:space-y-12">
      {resolvedSections.length === 0 ? (
        <div className="px-4">
          <EmptyState message="Chưa chọn danh mục nào" />
        </div>
      ) : (
        resolvedSections.map((section) => (
          <section key={section.id} className="px-4">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <h2 className={cn(
                  "font-bold",
                  device === 'mobile' ? 'text-lg' : 'text-xl md:text-2xl'
                )}>{section.category.name}</h2>
                {config.showViewAll && (
                  <button 
                    className="text-sm font-medium flex items-center gap-1 hover:underline px-3 py-1.5 rounded-lg border transition-colors"
                    style={{ color: brandColor, borderColor: `${brandColor}30` }}
                  >
                    Xem danh mục <ArrowRight size={16} />
                  </button>
                )}
              </div>
              
              {section.products.length === 0 ? (
                <EmptyState message="Chưa có sản phẩm trong danh mục này" size="small" />
              ) : (
                <div className={cn("grid gap-4", getGridCols())}>
                  {section.products.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
              )}
            </div>
          </section>
        ))
      )}
    </div>
  );

  // Style 2: Carousel - Horizontal scroll
  const renderCarouselStyle = () => (
    <div className="w-full py-4 space-y-8 md:space-y-12">
      {resolvedSections.length === 0 ? (
        <div className="px-4">
          <EmptyState message="Chưa chọn danh mục nào" />
        </div>
      ) : (
        resolvedSections.map((section) => (
          <section key={section.id}>
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between px-4 mb-4">
                <h2 className={cn(
                  "font-bold",
                  device === 'mobile' ? 'text-lg' : 'text-xl md:text-2xl'
                )}>{section.category.name}</h2>
                {config.showViewAll && (
                  <button 
                    className="text-sm font-medium flex items-center gap-1 hover:underline"
                    style={{ color: brandColor }}
                  >
                    Xem danh mục <ArrowRight size={16} />
                  </button>
                )}
              </div>
              
              {section.products.length === 0 ? (
                <div className="mx-4">
                  <EmptyState message="Chưa có sản phẩm" size="small" />
                </div>
              ) : (
                <div className="overflow-x-auto pb-4 px-4 scrollbar-hide">
                  <div className="flex gap-4">
                    {section.products.map((product) => (
                      <div 
                        key={product._id}
                        className={cn(
                          "flex-shrink-0 group cursor-pointer",
                          device === 'mobile' ? 'w-36' : 'w-48'
                        )}
                      >
                        <div className="aspect-square rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 mb-2">
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
                        <h4 className={cn(
                          "font-medium line-clamp-2 mb-1",
                          device === 'mobile' ? 'text-xs' : 'text-sm'
                        )}>{product.name}</h4>
                        <span className={cn("font-bold", device === 'mobile' ? 'text-sm' : 'text-base')} style={{ color: brandColor }}>
                          {formatPrice(product.salePrice || product.price)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        ))
      )}
    </div>
  );

  // Style 3: Cards - Modern cards with category header
  const renderCardsStyle = () => (
    <div className="w-full py-4 space-y-8 md:space-y-12">
      {resolvedSections.length === 0 ? (
        <div className="px-4">
          <EmptyState message="Chưa chọn danh mục nào" />
        </div>
      ) : (
        resolvedSections.map((section) => (
          <section key={section.id} className="px-4">
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
                    <h2 className={cn(
                      "font-bold",
                      device === 'mobile' ? 'text-base' : 'text-lg'
                    )}>{section.category.name}</h2>
                  </div>
                  {config.showViewAll && (
                    <button 
                      className="text-sm font-medium flex items-center gap-1 hover:underline px-3 py-1.5 rounded-lg transition-colors"
                      style={{ color: brandColor, backgroundColor: `${brandColor}15` }}
                    >
                      Xem danh mục <ArrowRight size={14} />
                    </button>
                  )}
                </div>
                
                {/* Products Grid */}
                <div className="p-4 bg-white dark:bg-slate-900">
                  {section.products.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">
                      <Package size={32} className="mx-auto mb-2 opacity-30" />
                      <p className="text-sm">Chưa có sản phẩm</p>
                    </div>
                  ) : (
                    <div className={cn("grid gap-4", getGridCols())}>
                      {section.products.map((product) => (
                        <ProductCard key={product._id} product={product} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        ))
      )}
    </div>
  );

  // Style 4: Bento - Featured product với grid layout sáng tạo
  const renderBentoStyle = () => (
    <div className="w-full py-4 space-y-10 md:space-y-16">
      {resolvedSections.length === 0 ? (
        <div className="px-4">
          <EmptyState message="Chưa chọn danh mục nào" />
        </div>
      ) : (
        resolvedSections.map((section) => {
          const featured = section.products[0];
          const others = section.products.slice(1, 5);
          
          return (
            <section key={section.id} className="px-4">
              <div className="max-w-7xl mx-auto">
                {/* Header với accent line */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-1 h-8 rounded-full"
                      style={{ backgroundColor: brandColor }}
                    />
                    <h2 className={cn(
                      "font-bold",
                      device === 'mobile' ? 'text-lg' : 'text-xl md:text-2xl'
                    )}>{section.category.name}</h2>
                  </div>
                  {config.showViewAll && (
                    <button 
                      className="text-sm font-medium flex items-center gap-1.5 px-4 py-2 rounded-full transition-all hover:shadow-md"
                      style={{ backgroundColor: `${brandColor}10`, color: brandColor }}
                    >
                      Xem danh mục <ArrowRight size={14} />
                    </button>
                  )}
                </div>
                
                {section.products.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 bg-slate-50 dark:bg-slate-800/30 rounded-2xl">
                    <Package size={40} className="mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Chưa có sản phẩm</p>
                  </div>
                ) : device === 'mobile' ? (
                  // Mobile: 2 columns grid
                  <div className="grid grid-cols-2 gap-3">
                    {section.products.slice(0, 4).map((product) => (
                      <ProductCard key={product._id} product={product} />
                    ))}
                  </div>
                ) : (
                  // Desktop: Bento grid với featured
                  <div className="grid grid-cols-4 gap-4 auto-rows-[180px]">
                    {/* Featured - 2x2 */}
                    {featured && (
                      <div className="col-span-2 row-span-2 group cursor-pointer relative rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800">
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
                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        {/* Content */}
                        <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                          <span 
                            className="inline-block px-2 py-0.5 rounded text-xs font-medium mb-2"
                            style={{ backgroundColor: brandColor }}
                          >
                            Nổi bật
                          </span>
                          <h3 className="font-bold text-base line-clamp-2 mb-1">{featured.name}</h3>
                          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0">
                            {featured.salePrice && featured.salePrice < (featured.price || 0) ? (
                              <>
                                <span className="font-bold text-base">{formatPrice(featured.salePrice)}</span>
                                <span className="text-xs text-white/60 line-through">{formatPrice(featured.price)}</span>
                              </>
                            ) : (
                              <span className="font-bold text-base">{formatPrice(featured.price)}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Other products */}
                    {others.map((product) => (
                      <div key={product._id} className="group cursor-pointer relative rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800">
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
                          <h4 className="font-medium text-xs line-clamp-1">{product.name}</h4>
                          <span className="font-bold text-xs">{formatPrice(product.salePrice || product.price)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          );
        })
      )}
    </div>
  );

  // Style 5: Magazine - Editorial Grid với Featured Item + Grid nhỏ
  const renderMagazineStyle = () => (
    <div className="w-full py-4 space-y-12 md:space-y-16">
      {resolvedSections.length === 0 ? (
        <div className="px-4">
          <EmptyState message="Chưa chọn danh mục nào" />
        </div>
      ) : (
        resolvedSections.map((section) => {
          const featured = section.products[0];
          const gridItems = section.products.slice(1, 5);
          
          return (
            <section key={section.id} className="px-4">
              <div className="max-w-7xl mx-auto">
                {/* Editorial Header */}
                <div className="flex items-end justify-between mb-6 pb-4 border-b-2" style={{ borderColor: `${brandColor}20` }}>
                  <div>
                    <span 
                      className="text-xs font-bold uppercase tracking-widest"
                      style={{ color: brandColor }}
                    >
                      Bộ sưu tập
                    </span>
                    <h2 className={cn(
                      "font-bold tracking-tight mt-1",
                      device === 'mobile' ? 'text-2xl' : 'text-3xl md:text-4xl'
                    )}>{section.category.name}</h2>
                  </div>
                  {config.showViewAll && (
                    <button 
                      className={cn(
                        "font-semibold flex items-center gap-2 transition-all hover:gap-3",
                        device === 'mobile' ? 'text-sm' : 'text-base'
                      )}
                      style={{ color: brandColor }}
                    >
                      Xem tất cả <ArrowRight size={device === 'mobile' ? 16 : 18} />
                    </button>
                  )}
                </div>
                
                {section.products.length === 0 ? (
                  <EmptyState message="Chưa có sản phẩm" size="small" />
                ) : device === 'mobile' ? (
                  // Mobile: Simple 2-col grid
                  <div className="grid grid-cols-2 gap-3">
                    {section.products.slice(0, 4).map((product) => (
                      <ProductCard key={product._id} product={product} />
                    ))}
                  </div>
                ) : (
                  // Desktop: Featured (50%) + Grid 2x2 (50%)
                  <div className="grid grid-cols-2 gap-6">
                    {/* Featured Item - Large */}
                    {featured && (
                      <div className="group cursor-pointer relative rounded-2xl overflow-hidden aspect-[4/5]" style={{ backgroundColor: `${brandColor}08` }}>
                        {featured.image ? (
                          <img 
                            src={featured.image} 
                            alt={featured.name} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package size={48} style={{ color: `${brandColor}30` }} />
                          </div>
                        )}
                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                        {/* Content */}
                        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                          <span 
                            className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3"
                            style={{ backgroundColor: brandColor }}
                          >
                            Nổi bật
                          </span>
                          <h3 className="font-bold text-xl md:text-2xl line-clamp-2 mb-2">{featured.name}</h3>
                          <div className="flex items-baseline gap-3">
                            {featured.salePrice && featured.salePrice < (featured.price || 0) ? (
                              <>
                                <span className="font-bold text-2xl">{formatPrice(featured.salePrice)}</span>
                                <span className="text-sm text-white/60 line-through">{formatPrice(featured.price)}</span>
                              </>
                            ) : (
                              <span className="font-bold text-2xl">{formatPrice(featured.price)}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Grid 2x2 */}
                    <div className="grid grid-cols-2 gap-4">
                      {gridItems.map((product) => (
                        <div key={product._id} className="group cursor-pointer">
                          <div 
                            className="aspect-square rounded-xl overflow-hidden mb-3 relative"
                            style={{ backgroundColor: `${brandColor}08` }}
                          >
                            {product.image ? (
                              <img 
                                src={product.image} 
                                alt={product.name} 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package size={24} style={{ color: `${brandColor}30` }} />
                              </div>
                            )}
                            {/* Quick view overlay */}
                            <div 
                              className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              style={{ backgroundColor: `${brandColor}20` }}
                            >
                              <span 
                                className="px-4 py-2 rounded-full text-sm font-medium text-white"
                                style={{ backgroundColor: brandColor }}
                              >
                                Xem nhanh
                              </span>
                            </div>
                          </div>
                          <h4 className="font-medium text-sm line-clamp-2 min-h-[2.5rem]">{product.name}</h4>
                          <div className="flex items-baseline gap-2 mt-1">
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
                      ))}
                      
                      {/* Fill empty slots if less than 4 items */}
                      {gridItems.length < 4 && Array.from({ length: 4 - gridItems.length }).map((_, i) => (
                        <div 
                          key={`empty-${i}`} 
                          className="aspect-square rounded-xl flex items-center justify-center"
                          style={{ backgroundColor: `${brandColor}05`, border: `2px dashed ${brandColor}20` }}
                        >
                          <Package size={24} style={{ color: `${brandColor}20` }} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>
          );
        })
      )}
    </div>
  );

  // Style 6: Showcase - Gradient overlay với hover effects lung linh
  const renderShowcaseStyle = () => (
    <div className="w-full py-4 space-y-10 md:space-y-16">
      {resolvedSections.length === 0 ? (
        <div className="px-4">
          <EmptyState message="Chưa chọn danh mục nào" />
        </div>
      ) : (
        resolvedSections.map((section) => (
          <section key={section.id}>
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
                  <h2 className={cn(
                    "font-bold mt-1",
                    device === 'mobile' ? 'text-xl' : 'text-2xl md:text-3xl'
                  )}>{section.category.name}</h2>
                  <div 
                    className="h-1 w-16 rounded-full mt-2"
                    style={{ background: `linear-gradient(to right, ${brandColor}, ${brandColor}40)` }}
                  />
                </div>
                {config.showViewAll && (
                  <button 
                    className="group flex items-center gap-2 text-sm font-medium transition-colors"
                    style={{ color: brandColor }}
                  >
                    Xem tất cả 
                    <span 
                      className="w-8 h-8 rounded-full flex items-center justify-center group-hover:translate-x-1 transition-transform"
                      style={{ backgroundColor: `${brandColor}15` }}
                    >
                      <ArrowRight size={14} />
                    </span>
                  </button>
                )}
              </div>
              
              {section.products.length === 0 ? (
                <div className="text-center py-12 text-slate-400 bg-slate-50 dark:bg-slate-800/30 rounded-2xl">
                  <Package size={40} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Chưa có sản phẩm</p>
                </div>
              ) : (
                <div className={cn(
                  "grid gap-5",
                  device === 'mobile' ? 'grid-cols-2' : 'grid-cols-4'
                )}>
                  {section.products.map((product, idx) => (
                    <div 
                      key={product._id} 
                      className="group cursor-pointer"
                    >
                      {/* Image Container với effects */}
                      <div className="relative aspect-[3/4] rounded-2xl overflow-hidden mb-3">
                        {/* Background gradient */}
                        <div 
                          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
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
                          <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                            <Package size={32} className="text-slate-300" />
                          </div>
                        )}
                        
                        {/* Gradient overlay bottom */}
                        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        
                        {/* Quick action button */}
                        <div className="absolute bottom-3 left-3 right-3 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                          <button 
                            className="w-full py-2.5 rounded-xl text-sm font-medium text-white backdrop-blur-sm transition-colors"
                            style={{ backgroundColor: `${brandColor}dd` }}
                          >
                            Xem chi tiết
                          </button>
                        </div>
                        
                        {/* Badge for sale */}
                        {product.salePrice && product.salePrice < (product.price || 0) && (
                          <div 
                            className="absolute top-3 left-3 px-2 py-1 rounded-lg text-xs font-bold text-white"
                            style={{ backgroundColor: '#ef4444' }}
                          >
                            -{Math.round((1 - product.salePrice / (product.price || 1)) * 100)}%
                          </div>
                        )}
                      </div>
                      
                      {/* Product info */}
                      <div className="space-y-1">
                        <h4 className={cn(
                          "font-medium line-clamp-2 group-hover:text-opacity-80 transition-colors",
                          device === 'mobile' ? 'text-xs' : 'text-sm'
                        )}>{product.name}</h4>
                        <div className="flex flex-col">
                          {product.salePrice && product.salePrice < (product.price || 0) ? (
                            <>
                              <span 
                                className={cn("font-bold", device === 'mobile' ? 'text-xs' : 'text-sm')} 
                                style={{ color: brandColor }}
                              >
                                {formatPrice(product.salePrice)}
                              </span>
                              <span className="text-[10px] text-slate-400 line-through">{formatPrice(product.price)}</span>
                            </>
                          ) : (
                            <span 
                              className={cn("font-bold", device === 'mobile' ? 'text-xs' : 'text-sm')} 
                              style={{ color: brandColor }}
                            >
                              {formatPrice(product.price)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        ))
      )}
    </div>
  );

  return (
    <PreviewWrapper 
      title="Preview Sản phẩm theo danh mục" 
      device={device} 
      setDevice={setDevice} 
      previewStyle={previewStyle} 
      setPreviewStyle={setPreviewStyle} 
      styles={styles} 
      info={getPreviewInfo()}
    >
      <BrowserFrame>
        {previewStyle === 'grid' && renderGridStyle()}
        {previewStyle === 'carousel' && renderCarouselStyle()}
        {previewStyle === 'cards' && renderCardsStyle()}
        {previewStyle === 'bento' && renderBentoStyle()}
        {previewStyle === 'magazine' && renderMagazineStyle()}
        {previewStyle === 'showcase' && renderShowcaseStyle()}
      </BrowserFrame>
    </PreviewWrapper>
  );
};

// ============ TEAM PREVIEW ============
// Professional Team Section UI/UX - 6 Variants: Grid, Cards, Carousel, Hexagon, Timeline, Spotlight
type TeamMember = { id: number; name: string; role: string; avatar: string; bio: string; facebook: string; linkedin: string; twitter: string; email: string };
export type TeamStyle = 'grid' | 'cards' | 'carousel' | 'hexagon' | 'timeline' | 'spotlight';

export const TeamPreview = ({ members, brandColor, selectedStyle, onStyleChange }: { 
  members: TeamMember[]; 
  brandColor: string; 
  selectedStyle?: TeamStyle; 
  onStyleChange?: (style: TeamStyle) => void 
}) => {
  const [device, setDevice] = useState<PreviewDevice>('desktop');
  const previewStyle = selectedStyle || 'grid';
  const setPreviewStyle = (s: string) => onStyleChange?.(s as TeamStyle);
  const [currentSlide, setCurrentSlide] = useState(0);
  const styles = [
    { id: 'grid', label: 'Grid' }, 
    { id: 'cards', label: 'Cards' }, 
    { id: 'carousel', label: 'Carousel' },
    { id: 'hexagon', label: 'Marquee' },
    { id: 'timeline', label: 'Timeline' },
    { id: 'spotlight', label: 'Spotlight' }
  ];

  // Dynamic image size info based on style (Best Practice)
  const getImageSizeInfo = () => {
    const count = members.length;
    if (count === 0) return 'Chưa có thành viên';
    switch (previewStyle) {
      case 'grid': return `${count} thành viên • Avatar: 400×400px (1:1)`;
      case 'cards': return `${count} thành viên • Avatar: 160×160px (1:1)`;
      case 'carousel': return `${count} thành viên • Avatar: 600×450px (4:3) - Horizontal scroll`;
      case 'hexagon': return `${count} thành viên • Avatar: 160×160px (1:1) - Marquee scroll`;
      case 'timeline': return `${count} thành viên • Avatar: 100×100px (1:1)`;
      case 'spotlight': return `${count} thành viên • Avatar: 400×400px (1:1)`;
      default: return `${count} thành viên`;
    }
  };

  // Max visible items per device for +N pattern
  const getMaxVisible = () => {
    switch (previewStyle) {
      case 'grid': return device === 'mobile' ? 4 : 8;
      case 'cards': return device === 'mobile' ? 3 : 6;
      case 'carousel': return members.length; // All members scrollable
      case 'hexagon': return device === 'mobile' ? 4 : 5; // Overlap style shows 4-5 avatars
      case 'timeline': return device === 'mobile' ? 3 : 4;
      case 'spotlight': return device === 'mobile' ? 3 : 6;
      default: return 6;
    }
  };

  const maxVisible = getMaxVisible();
  const visibleMembers = members.slice(0, maxVisible);
  const remainingCount = members.length - maxVisible;

  // +N remaining card component
  const RemainingCard = ({ isHexagon = false }: { isHexagon?: boolean }) => {
    if (isHexagon) {
      return (
        <div className="group relative">
          <div className={cn("relative", device === 'mobile' ? 'w-28 h-32' : 'w-36 h-40')} style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}>
            <div className="absolute inset-1 flex items-center justify-center" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)', backgroundColor: '#f1f5f9' }}>
              <div className="text-center">
                <span className="text-lg font-bold" style={{ color: brandColor }}>+{remainingCount}</span>
                <p className="text-[10px] text-slate-400">khác</p>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className="flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-2xl aspect-square max-w-[180px] mx-auto">
        <div className="text-center">
          <span className="text-xl font-bold" style={{ color: brandColor }}>+{remainingCount}</span>
          <p className="text-xs text-slate-400">thành viên</p>
        </div>
      </div>
    );
  };

  const SocialIcon = ({ type, url }: { type: 'facebook' | 'linkedin' | 'twitter' | 'email'; url: string }) => {
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

  // Style 1: Grid - Clean grid với hover effects + "+N" pattern
  const renderGridStyle = () => (
    <div className={cn("py-8 px-4", device === 'mobile' ? 'py-6' : '')}>
      <h3 className={cn("font-bold text-center mb-8", device === 'mobile' ? 'text-lg' : 'text-2xl')}>Đội ngũ của chúng tôi</h3>
      <div className={cn(
        "grid gap-6",
        device === 'mobile' ? 'grid-cols-2 gap-4' : device === 'tablet' ? 'grid-cols-3' : 'grid-cols-4'
      )}>
        {visibleMembers.map((member) => (
          <div key={member.id} className="group text-center">
            <div className="relative mb-4 mx-auto overflow-hidden rounded-2xl aspect-square max-w-[180px]">
              {member.avatar ? (
                <img 
                  src={member.avatar} 
                  alt={member.name} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                />
              ) : (
                <div 
                  className="w-full h-full flex items-center justify-center text-3xl font-bold text-white"
                  style={{ backgroundColor: brandColor }}
                >
                  {(member.name || 'U').charAt(0)}
                </div>
              )}
              {/* Social overlay on hover */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-2">
                <SocialIcon type="facebook" url={member.facebook} />
                <SocialIcon type="linkedin" url={member.linkedin} />
                <SocialIcon type="twitter" url={member.twitter} />
                <SocialIcon type="email" url={member.email} />
              </div>
            </div>
            <h4 className="font-semibold text-slate-900 dark:text-slate-100">{member.name || 'Họ và tên'}</h4>
            <p className="text-sm mt-1" style={{ color: brandColor }}>{member.role || 'Chức vụ'}</p>
          </div>
        ))}
        {/* +N remaining */}
        {remainingCount > 0 && (
          <div className="text-center">
            <RemainingCard />
            <p className="text-sm mt-4 text-slate-500">thành viên</p>
          </div>
        )}
      </div>
    </div>
  );

  // Style 2: Cards - Horizontal cards với bio + equal height + "+N" pattern
  const renderCardsStyle = () => (
    <div className={cn("py-8 px-4", device === 'mobile' ? 'py-6' : '')}>
      <h3 className={cn("font-bold text-center mb-8", device === 'mobile' ? 'text-lg' : 'text-2xl')}>Đội ngũ của chúng tôi</h3>
      <div className={cn(
        "grid gap-6",
        device === 'mobile' ? 'grid-cols-1' : device === 'tablet' ? 'grid-cols-2' : 'grid-cols-3'
      )}>
        {visibleMembers.map((member) => (
          <div 
            key={member.id} 
            className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-700 flex gap-4 items-start group hover:shadow-md transition-shadow h-full"
          >
            <div className="flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden">
              {member.avatar ? (
                <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
              ) : (
                <div 
                  className="w-full h-full flex items-center justify-center text-xl font-bold text-white"
                  style={{ backgroundColor: brandColor }}
                >
                  {(member.name || 'U').charAt(0)}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0 flex flex-col">
              <h4 className="font-semibold text-slate-900 dark:text-slate-100 truncate">{member.name || 'Họ và tên'}</h4>
              <p className="text-sm mb-2" style={{ color: brandColor }}>{member.role || 'Chức vụ'}</p>
              {/* Equal height bio with min-height */}
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 min-h-[2.5rem]">{member.bio || ''}</p>
              <div className="flex gap-1.5 mt-auto pt-3">
                {member.facebook && <SocialIcon type="facebook" url={member.facebook} />}
                {member.linkedin && <SocialIcon type="linkedin" url={member.linkedin} />}
                {member.twitter && <SocialIcon type="twitter" url={member.twitter} />}
                {member.email && <SocialIcon type="email" url={member.email} />}
              </div>
            </div>
          </div>
        ))}
        {/* +N remaining */}
        {remainingCount > 0 && (
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-5 border border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center">
            <div className="text-center">
              <span className="text-2xl font-bold" style={{ color: brandColor }}>+{remainingCount}</span>
              <p className="text-sm text-slate-500 mt-1">thành viên khác</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Style 3: Carousel - Horizontal scroll với partial peek (Best Practice: 10-20% của card tiếp theo visible)
  const renderCarouselStyle = () => {
    const itemsPerView = device === 'mobile' ? 1.15 : device === 'tablet' ? 2.2 : 3.15; // Partial peek
    const cardWidth = device === 'mobile' ? 280 : device === 'tablet' ? 260 : 280;
    const gap = device === 'mobile' ? 12 : 16;
    
    return (
      <div className={cn("py-8 relative", device === 'mobile' ? 'py-6' : '')}>
        {/* Header với navigation */}
        <div className={cn("flex items-center justify-between mb-6", device === 'mobile' ? 'px-4' : 'px-6')}>
          <div>
            <h3 className={cn("font-bold text-slate-900 dark:text-slate-100", device === 'mobile' ? 'text-lg' : 'text-2xl')}>
              Đội ngũ của chúng tôi
            </h3>
            <p className="text-sm text-slate-500 mt-1">Vuốt để xem thêm →</p>
          </div>
          {/* Navigation arrows */}
          {members.length > 2 && (
            <div className="flex gap-2">
              <button 
                type="button"
                onClick={() => {
                  const container = document.getElementById(`team-carousel-${device}`);
                  if (container) container.scrollBy({ left: -cardWidth - gap, behavior: 'smooth' });
                }}
                className="w-9 h-9 rounded-full flex items-center justify-center bg-white dark:bg-slate-800 shadow-md hover:shadow-lg text-slate-700 dark:text-slate-300 transition-all border border-slate-200 dark:border-slate-600"
              >
                <ChevronLeft size={18} />
              </button>
              <button 
                type="button"
                onClick={() => {
                  const container = document.getElementById(`team-carousel-${device}`);
                  if (container) container.scrollBy({ left: cardWidth + gap, behavior: 'smooth' });
                }}
                className="w-9 h-9 rounded-full flex items-center justify-center text-white shadow-md hover:shadow-lg transition-all"
                style={{ backgroundColor: brandColor }}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>
        
        {/* Carousel container - contained với fade edges */}
        <div className="px-4 md:px-6">
          <div className="relative overflow-hidden rounded-xl">
            {/* Fade edges */}
            <div className="absolute left-0 top-0 bottom-0 w-10 md:w-16 bg-gradient-to-r from-white dark:from-slate-900 to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-10 md:w-16 bg-gradient-to-l from-white dark:from-slate-900 to-transparent z-10 pointer-events-none" />
            
            {/* Scrollable area - hidden scrollbar */}
            <div 
              id={`team-carousel-${device}`}
              className="team-carousel-scroll flex overflow-x-auto snap-x snap-mandatory scroll-smooth py-3 px-2"
              style={{ gap: `${gap}px` }}
            >
            {members.map((member) => (
              <div 
                key={member.id} 
                className="flex-shrink-0 snap-start group"
                style={{ width: cardWidth }}
              >
                {/* Card */}
                <div 
                  className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-700 transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1 h-full"
                  style={{ borderBottomColor: brandColor, borderBottomWidth: '3px' }}
                >
                  {/* Avatar */}
                  <div className="aspect-[4/3] relative overflow-hidden bg-slate-100 dark:bg-slate-700">
                    {member.avatar ? (
                      <img 
                        src={member.avatar} 
                        alt={member.name} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                      />
                    ) : (
                      <div 
                        className="w-full h-full flex items-center justify-center text-5xl font-bold text-white"
                        style={{ backgroundColor: brandColor }}
                      >
                        {(member.name || 'U').charAt(0)}
                      </div>
                    )}
                  </div>
                  
                  {/* Info */}
                  <div className="p-5">
                    <h4 className="font-bold text-lg text-slate-900 dark:text-slate-100 truncate">{member.name || 'Họ và tên'}</h4>
                    <p className="text-sm mt-0.5 truncate" style={{ color: brandColor }}>{member.role || 'Chức vụ'}</p>
                    {member.bio && (
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-3 line-clamp-2">{member.bio}</p>
                    )}
                    {/* Social */}
                    <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                      {member.facebook && <SocialIcon type="facebook" url={member.facebook} />}
                      {member.linkedin && <SocialIcon type="linkedin" url={member.linkedin} />}
                      {member.twitter && <SocialIcon type="twitter" url={member.twitter} />}
                      {member.email && <SocialIcon type="email" url={member.email} />}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {/* Spacer for partial peek effect */}
            <div className="flex-shrink-0 w-4" />
            </div>
          </div>
        </div>

        {/* CSS to hide scrollbar */}
        <style>{`
          .team-carousel-scroll {
            scrollbar-width: none;
            -ms-overflow-style: none;
          }
          .team-carousel-scroll::-webkit-scrollbar {
            display: none;
          }
        `}</style>
      </div>
    );
  };

  // Style 4: Marquee - Modern infinite scroll with featured member (Best Practice: Eye-catching, dynamic)
  const renderHexagonStyle = () => {
    const featured = members[0];
    const marqueeMembers = members.length > 1 ? [...members, ...members] : members; // Duplicate for infinite effect
    const cardSize = device === 'mobile' ? 140 : 160;
    
    return (
      <div className={cn("py-10 overflow-hidden", device === 'mobile' ? 'py-8' : '')}>
        {/* Header */}
        <div className="text-center mb-8 px-4">
          <span 
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium mb-3"
            style={{ backgroundColor: `${brandColor}10`, color: brandColor }}
          >
            <Users size={14} />
            Đội ngũ của chúng tôi
          </span>
          <h3 className={cn("font-bold text-slate-900 dark:text-slate-100", device === 'mobile' ? 'text-xl' : 'text-2xl')}>
            Những con người tuyệt vời
          </h3>
          <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
            Đội ngũ tài năng và đam mê đứng sau thành công của chúng tôi
          </p>
        </div>

        {/* Marquee Row - Contained infinite scroll */}
        <div className="mb-8 px-4">
          <div className="relative overflow-hidden rounded-xl">
            {/* Gradient fade edges */}
            <div className="absolute left-0 top-0 bottom-0 w-12 md:w-20 bg-gradient-to-r from-white dark:from-slate-900 to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-12 md:w-20 bg-gradient-to-l from-white dark:from-slate-900 to-transparent z-10 pointer-events-none" />
            
            {/* Scrolling container */}
            <div 
              className="flex gap-4 py-3"
              style={{ 
                width: 'max-content',
                animation: members.length > 2 ? 'marquee 20s linear infinite' : 'none'
              }}
            >
            {marqueeMembers.map((member, idx) => (
              <div 
                key={`${member.id}-${idx}`}
                className="group flex-shrink-0 text-center"
                style={{ width: cardSize }}
              >
                {/* Avatar */}
                <div 
                  className="relative mx-auto mb-3 rounded-2xl overflow-hidden shadow-md transition-all duration-300 group-hover:shadow-xl group-hover:scale-105"
                  style={{ width: cardSize, height: cardSize }}
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
                  {/* Hover overlay */}
                  <div 
                    className="absolute inset-0 flex items-end justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: `linear-gradient(to top, ${brandColor}ee, transparent)` }}
                  >
                    <div className="flex gap-1 pb-3">
                      {member.facebook && <SocialIcon type="facebook" url={member.facebook} />}
                      {member.linkedin && <SocialIcon type="linkedin" url={member.linkedin} />}
                      {member.email && <SocialIcon type="email" url={member.email} />}
                    </div>
                  </div>
                </div>
                {/* Name & Role */}
                <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate px-1">
                  {member.name || 'Họ và tên'}
                </h4>
                <p className="text-xs truncate px-1" style={{ color: brandColor }}>
                  {member.role || 'Chức vụ'}
                </p>
              </div>
            ))}
            </div>
          </div>
        </div>

        {/* Featured Member Card */}
        {featured && (
          <div className="max-w-2xl mx-auto px-4">
            <div 
              className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-100 dark:border-slate-700 flex flex-col md:flex-row gap-5 items-center"
              style={{ borderTopColor: brandColor, borderTopWidth: '3px' }}
            >
              {/* Large Avatar */}
              <div className="flex-shrink-0 w-24 h-24 md:w-28 md:h-28 rounded-2xl overflow-hidden shadow-md">
                {featured.avatar ? (
                  <img src={featured.avatar} alt={featured.name} className="w-full h-full object-cover" />
                ) : (
                  <div 
                    className="w-full h-full flex items-center justify-center text-3xl font-bold text-white"
                    style={{ backgroundColor: brandColor }}
                  >
                    {(featured.name || 'U').charAt(0)}
                  </div>
                )}
              </div>
              {/* Info */}
              <div className="flex-1 text-center md:text-left">
                <h4 className="font-bold text-xl text-slate-900 dark:text-slate-100">
                  {featured.name || 'Họ và tên'}
                </h4>
                <p className="text-sm font-medium mb-2" style={{ color: brandColor }}>
                  {featured.role || 'Chức vụ'}
                </p>
                {featured.bio && (
                  <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
                    {featured.bio}
                  </p>
                )}
                <div className="flex gap-2 justify-center md:justify-start">
                  {featured.facebook && <SocialIcon type="facebook" url={featured.facebook} />}
                  {featured.linkedin && <SocialIcon type="linkedin" url={featured.linkedin} />}
                  {featured.twitter && <SocialIcon type="twitter" url={featured.twitter} />}
                  {featured.email && <SocialIcon type="email" url={featured.email} />}
                </div>
              </div>
              {/* Team count badge */}
              <div 
                className="flex-shrink-0 w-16 h-16 rounded-full flex flex-col items-center justify-center"
                style={{ backgroundColor: `${brandColor}10` }}
              >
                <span className="text-xl font-bold" style={{ color: brandColor }}>{members.length}</span>
                <span className="text-[10px] text-slate-500">members</span>
              </div>
            </div>
          </div>
        )}

        {/* CSS Animation */}
        <style>{`
          @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `}</style>
      </div>
    );
  };

  // Style 5: Timeline - Dạng timeline sang trọng
  const renderTimelineStyle = () => (
    <div className={cn("py-8 px-4", device === 'mobile' ? 'py-6' : '')}>
      <div className="text-center mb-8">
        <h3 className={cn("font-bold text-slate-900 dark:text-slate-100 mb-2", device === 'mobile' ? 'text-lg' : 'text-2xl')}>
          Đội ngũ của chúng tôi
        </h3>
        <div 
          className="w-16 h-1 mx-auto rounded-full"
          style={{ background: `linear-gradient(90deg, transparent, ${brandColor}, transparent)` }}
        />
      </div>
      
      <div className="relative max-w-3xl mx-auto">
        {/* Timeline line */}
        <div 
          className={cn(
            "absolute top-0 bottom-0 w-0.5",
            device === 'mobile' ? 'left-4' : 'left-1/2 -translate-x-1/2'
          )}
          style={{ background: `linear-gradient(to bottom, transparent, ${brandColor}30, ${brandColor}30, transparent)` }}
        />
        
        <div className="space-y-6">
          {members.slice(0, device === 'mobile' ? 3 : 4).map((member, idx) => {
            const isEven = idx % 2 === 0;
            return (
              <div 
                key={member.id} 
                className={cn(
                  "relative flex items-center gap-4",
                  device === 'mobile' ? '' : isEven ? 'flex-row' : 'flex-row-reverse'
                )}
              >
                {/* Timeline dot */}
                <div 
                  className={cn(
                    "absolute w-3 h-3 rounded-full border-2 border-white shadow-md z-10",
                    device === 'mobile' ? 'left-4 -translate-x-1/2' : 'left-1/2 -translate-x-1/2'
                  )}
                  style={{ backgroundColor: brandColor }}
                />
                
                {/* Content card */}
                <div className={cn(
                  "flex-1",
                  device === 'mobile' ? 'ml-8' : isEven ? 'pr-8 text-right' : 'pl-8'
                )}>
                  <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-md border border-slate-100 dark:border-slate-700">
                    <div className={cn(
                      "flex items-center gap-3",
                      device !== 'mobile' && isEven ? 'flex-row-reverse' : ''
                    )}>
                      {/* Avatar */}
                      <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden ring-2 ring-white shadow-sm">
                        {member.avatar ? (
                          <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                        ) : (
                          <div 
                            className="w-full h-full flex items-center justify-center text-lg font-bold text-white"
                            style={{ backgroundColor: brandColor }}
                          >
                            {(member.name || 'U').charAt(0)}
                          </div>
                        )}
                      </div>
                      
                      {/* Info */}
                      <div className={cn("flex-1 min-w-0", device !== 'mobile' && isEven ? 'text-right' : '')}>
                        <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">{member.name || 'Họ và tên'}</h4>
                        <p className="text-xs" style={{ color: brandColor }}>{member.role || 'Chức vụ'}</p>
                      </div>
                    </div>
                    {member.bio && (
                      <p className={cn(
                        "text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2",
                        device !== 'mobile' && isEven ? 'text-right' : ''
                      )}>{member.bio}</p>
                    )}
                  </div>
                </div>
                
                {/* Spacer for opposite side on desktop */}
                {device !== 'mobile' && <div className="flex-1" />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  // Style 6: Spotlight - Glassmorphism với hiệu ứng ánh sáng
  const renderSpotlightStyle = () => (
    <div 
      className={cn("py-8 px-4 relative overflow-hidden", device === 'mobile' ? 'py-6' : '')}
      style={{ background: `linear-gradient(135deg, ${brandColor}08 0%, #f8fafc 50%, ${brandColor}05 100%)` }}
    >
      {/* Decorative background elements */}
      <div 
        className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-20 blur-3xl"
        style={{ background: `radial-gradient(circle, ${brandColor}40, transparent)` }}
      />
      <div 
        className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-15 blur-3xl"
        style={{ background: `radial-gradient(circle, ${brandColor}30, transparent)` }}
      />
      
      <div className="relative">
        <div className="text-center mb-8">
          <h3 className={cn("font-bold text-slate-900 dark:text-slate-100 mb-2", device === 'mobile' ? 'text-lg' : 'text-2xl')}>
            Đội ngũ của chúng tôi
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Những con người tài năng đứng sau thành công</p>
        </div>
        
        <div className={cn(
          "grid gap-5",
          device === 'mobile' ? 'grid-cols-1' : device === 'tablet' ? 'grid-cols-2' : 'grid-cols-3'
        )}>
          {members.slice(0, device === 'mobile' ? 3 : 6).map((member) => (
            <div key={member.id} className="group relative">
              {/* Glow effect behind card */}
              <div 
                className="absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-lg"
                style={{ background: `linear-gradient(135deg, ${brandColor}40, ${brandColor}20)` }}
              />
              
              {/* Main card with glassmorphism */}
              <div className="relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-5 border border-white/50 dark:border-slate-700/50 shadow-md hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
                {/* Spotlight effect */}
                <div 
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-24 rounded-full opacity-0 group-hover:opacity-30 transition-opacity duration-500"
                  style={{ 
                    background: `radial-gradient(circle, ${brandColor}, transparent)`,
                    filter: 'blur(15px)'
                  }}
                />
                
                {/* Avatar with ring effect */}
                <div className="relative mx-auto w-20 h-20 mb-4">
                  <div 
                    className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ 
                      background: `conic-gradient(from 0deg, ${brandColor}, ${brandColor}40, ${brandColor})`,
                      padding: '2px'
                    }}
                  />
                  <div className="absolute inset-0.5 rounded-full bg-white dark:bg-slate-800" />
                  <div className="absolute inset-1.5 rounded-full overflow-hidden">
                    {member.avatar ? (
                      <img 
                        src={member.avatar} 
                        alt={member.name} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div 
                        className="w-full h-full flex items-center justify-center text-2xl font-bold text-white"
                        style={{ backgroundColor: brandColor }}
                      >
                        {(member.name || 'U').charAt(0)}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Info */}
                <div className="text-center relative">
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-0.5">{member.name || 'Họ và tên'}</h4>
                  <p 
                    className="text-xs font-medium mb-2"
                    style={{ color: brandColor }}
                  >
                    {member.role || 'Chức vụ'}
                  </p>
                  
                  {member.bio && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 line-clamp-2">{member.bio}</p>
                  )}
                  
                  {/* Social icons with glass effect */}
                  <div className="flex justify-center gap-2">
                    {member.facebook && <SocialIcon type="facebook" url={member.facebook} />}
                    {member.linkedin && <SocialIcon type="linkedin" url={member.linkedin} />}
                    {member.twitter && <SocialIcon type="twitter" url={member.twitter} />}
                    {member.email && <SocialIcon type="email" url={member.email} />}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <PreviewWrapper 
      title="Preview Team" 
      device={device} 
      setDevice={setDevice} 
      previewStyle={previewStyle} 
      setPreviewStyle={setPreviewStyle} 
      styles={styles} 
      info={getImageSizeInfo()}
    >
      <BrowserFrame>
        {previewStyle === 'grid' && renderGridStyle()}
        {previewStyle === 'cards' && renderCardsStyle()}
        {previewStyle === 'carousel' && renderCarouselStyle()}
        {previewStyle === 'hexagon' && renderHexagonStyle()}
        {previewStyle === 'timeline' && renderTimelineStyle()}
        {previewStyle === 'spotlight' && renderSpotlightStyle()}
      </BrowserFrame>
    </PreviewWrapper>
  );
};

// ============ FEATURES PREVIEW (Product Features) ============
// 6 Professional Styles: Icon Grid, Alternating, Compact, Cards, Carousel, Timeline
type FeatureItem = { id: number; icon: string; title: string; description: string };
export type FeaturesStyle = 'iconGrid' | 'alternating' | 'compact' | 'cards' | 'carousel' | 'timeline';

const featureIcons: Record<string, React.ElementType> = { Zap, Shield, Target, Layers, Cpu, Globe, Rocket, Settings, Check, Star };

export const FeaturesPreview = ({ items, brandColor, selectedStyle, onStyleChange }: { items: FeatureItem[]; brandColor: string; selectedStyle?: FeaturesStyle; onStyleChange?: (style: FeaturesStyle) => void }) => {
  const [device, setDevice] = useState<PreviewDevice>('desktop');
  const [carouselIndex, setCarouselIndex] = useState(0);
  const previewStyle = selectedStyle || 'iconGrid';
  const setPreviewStyle = (s: string) => onStyleChange?.(s as FeaturesStyle);
  const styles = [
    { id: 'iconGrid', label: 'Icon Grid' }, { id: 'alternating', label: 'Alternating' }, { id: 'compact', label: 'Compact' },
    { id: 'cards', label: 'Cards' }, { id: 'carousel', label: 'Carousel' }, { id: 'timeline', label: 'Timeline' }
  ];

  const getIcon = (iconName: string) => featureIcons[iconName] || Zap;
  const MAX_VISIBLE = device === 'mobile' ? 4 : 6;

  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: `${brandColor}10` }}><Zap size={32} style={{ color: brandColor }} /></div>
      <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-1">Chưa có tính năng nào</h3>
      <p className="text-sm text-slate-500">Thêm tính năng đầu tiên để bắt đầu</p>
    </div>
  );

  const renderIconGridStyle = () => {
    if (items.length === 0) return renderEmptyState();
    const visibleItems = items.slice(0, MAX_VISIBLE);
    const remainingCount = items.length - MAX_VISIBLE;
    const gridClass = cn("grid gap-4 md:gap-6", items.length === 1 ? 'max-w-md mx-auto' : items.length === 2 ? 'max-w-2xl mx-auto grid-cols-2' : device === 'mobile' ? 'grid-cols-1' : device === 'tablet' ? 'grid-cols-2' : 'grid-cols-3');
    return (
      <div className={cn("py-8 px-4", device === 'mobile' ? 'py-6 px-3' : 'md:py-12 md:px-6')}>
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3" style={{ backgroundColor: `${brandColor}15`, color: brandColor }}><Zap size={12} />Tính năng</div>
          <h2 className={cn("font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-3", device === 'mobile' ? 'text-2xl' : 'text-3xl md:text-4xl')}>Tính năng nổi bật</h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">Khám phá những tính năng ưu việt giúp bạn đạt hiệu quả tối đa</p>
        </div>
        <div className={gridClass}>
          {visibleItems.map((item) => {
            const IconComponent = getIcon(item.icon);
            return (
              <div key={item.id} className="group bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 hover:border-transparent hover:shadow-xl transition-all duration-300 flex flex-col h-full">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 duration-300" style={{ background: `linear-gradient(135deg, ${brandColor} 0%, ${brandColor}cc 100%)`, boxShadow: `0 8px 16px -4px ${brandColor}40` }}><IconComponent size={24} className="text-white" strokeWidth={2} /></div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 mb-2 line-clamp-1">{item.title || 'Tên tính năng'}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2 min-h-[2.5rem]">{item.description || 'Mô tả tính năng...'}</p>
              </div>
            );
          })}
          {remainingCount > 0 && (<div className="flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-2xl aspect-square border-2 border-dashed border-slate-300 dark:border-slate-600"><div className="text-center"><Plus size={32} className="mx-auto mb-2 text-slate-400" /><span className="text-lg font-bold text-slate-600 dark:text-slate-300">+{remainingCount}</span><p className="text-xs text-slate-400">tính năng khác</p></div></div>)}
        </div>
      </div>
    );
  };

  const renderAlternatingStyle = () => {
    if (items.length === 0) return renderEmptyState();
    const maxItems = device === 'mobile' ? 4 : 6;
    const visibleItems = items.slice(0, maxItems);
    const remainingCount = items.length - maxItems;
    return (
      <div className={cn("py-6 px-4", device === 'mobile' ? 'py-4 px-3' : 'md:py-10 md:px-6')}>
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2" style={{ backgroundColor: `${brandColor}15`, color: brandColor }}><Zap size={12} />Tính năng</div>
          <h2 className={cn("font-bold tracking-tight text-slate-900 dark:text-slate-100", device === 'mobile' ? 'text-xl' : 'text-2xl md:text-3xl')}>Tính năng nổi bật</h2>
        </div>
        <div className={cn("max-w-3xl mx-auto", device === 'mobile' ? 'space-y-2' : 'grid grid-cols-2 gap-3')}>
          {visibleItems.map((item, idx) => {
            const IconComponent = getIcon(item.icon);
            return (
              <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                <div className="relative flex-shrink-0">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${brandColor}15` }}><IconComponent size={18} style={{ color: brandColor }} strokeWidth={2} /></div>
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[10px] font-bold text-white flex items-center justify-center" style={{ backgroundColor: brandColor }}>{idx + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100 line-clamp-1">{item.title || 'Tên tính năng'}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{item.description || 'Mô tả tính năng...'}</p>
                </div>
              </div>
            );
          })}
        </div>
        {remainingCount > 0 && (<div className="text-center mt-4"><span className="text-sm" style={{ color: brandColor }}>+{remainingCount} tính năng khác</span></div>)}
      </div>
    );
  };

  const renderCompactStyle = () => {
    if (items.length === 0) return renderEmptyState();
    const maxItems = device === 'mobile' ? 4 : 8;
    const visibleItems = items.slice(0, maxItems);
    const remainingCount = items.length - maxItems;
    return (
      <div className={cn("py-8 px-4", device === 'mobile' ? 'py-6 px-3' : 'md:py-12 md:px-6')}>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b-2 mb-6" style={{ borderColor: `${brandColor}20` }}>
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded text-xs font-bold uppercase tracking-wider" style={{ backgroundColor: `${brandColor}15`, color: brandColor }}><Zap size={12} />Tính năng</div>
            <h2 className={cn("font-bold tracking-tight text-slate-900 dark:text-slate-100", device === 'mobile' ? 'text-xl' : 'text-2xl md:text-3xl')}>Tính năng nổi bật</h2>
          </div>
          {remainingCount > 0 && <span className="text-sm text-slate-500">+{remainingCount} tính năng khác</span>}
        </div>
        <div className={cn("grid gap-3", device === 'mobile' ? 'grid-cols-1' : device === 'tablet' ? 'grid-cols-2' : 'grid-cols-2 lg:grid-cols-4')}>
          {visibleItems.map((item) => {
            const IconComponent = getIcon(item.icon);
            return (
              <div key={item.id} className="flex items-start gap-3 p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${brandColor}15` }}><IconComponent size={18} style={{ color: brandColor }} strokeWidth={2} /></div>
                <div className="flex-1 min-w-0"><h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100 mb-0.5 truncate">{item.title || 'Tính năng'}</h3><p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 min-h-[2rem]">{item.description || 'Mô tả...'}</p></div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderCardsStyle = () => {
    if (items.length === 0) return renderEmptyState();
    const visibleItems = items.slice(0, MAX_VISIBLE);
    const remainingCount = items.length - MAX_VISIBLE;
    return (
      <div className={cn("py-8 px-4", device === 'mobile' ? 'py-6 px-3' : 'md:py-12 md:px-6')}>
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3" style={{ backgroundColor: `${brandColor}15`, color: brandColor }}><Zap size={12} />Tính năng</div>
          <h2 className={cn("font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-3", device === 'mobile' ? 'text-2xl' : 'text-3xl md:text-4xl')}>Tính năng nổi bật</h2>
        </div>
        <div className={cn("grid gap-5", items.length === 1 ? 'max-w-sm mx-auto' : items.length === 2 ? 'max-w-2xl mx-auto grid-cols-2' : device === 'mobile' ? 'grid-cols-1' : device === 'tablet' ? 'grid-cols-2' : 'grid-cols-3')}>
          {visibleItems.map((item, idx) => {
            const IconComponent = getIcon(item.icon);
            return (
              <div key={item.id} className="group relative bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 flex flex-col">
                <div className="h-1" style={{ backgroundColor: brandColor }} />
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${brandColor}15` }}><IconComponent size={22} style={{ color: brandColor }} strokeWidth={2} /></div>
                    <span className="text-3xl font-bold opacity-20" style={{ color: brandColor }}>{String(idx + 1).padStart(2, '0')}</span>
                  </div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 mb-2 line-clamp-1">{item.title || 'Tên tính năng'}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3 min-h-[3.75rem] flex-1">{item.description || 'Mô tả tính năng...'}</p>
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700"><span className="inline-flex items-center gap-1 text-sm font-medium group-hover:gap-2 transition-all" style={{ color: brandColor }}>Tìm hiểu thêm <ArrowRight size={14} /></span></div>
                </div>
              </div>
            );
          })}
          {remainingCount > 0 && (<div className="flex items-center justify-center bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-600 min-h-[250px]"><div className="text-center"><Plus size={32} className="mx-auto mb-2 text-slate-400" /><span className="text-lg font-bold text-slate-600 dark:text-slate-300">+{remainingCount}</span><p className="text-xs text-slate-400">tính năng khác</p></div></div>)}
        </div>
      </div>
    );
  };

  const renderCarouselStyle = () => {
    if (items.length === 0) return renderEmptyState();
    const itemsPerView = device === 'mobile' ? 1 : device === 'tablet' ? 2 : 3;
    const maxIndex = Math.max(0, items.length - itemsPerView);
    return (
      <div className={cn("py-8 px-4", device === 'mobile' ? 'py-6 px-3' : 'md:py-12 md:px-6')}>
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3" style={{ backgroundColor: `${brandColor}15`, color: brandColor }}><Zap size={12} />Tính năng</div>
            <h2 className={cn("font-bold tracking-tight text-slate-900 dark:text-slate-100", device === 'mobile' ? 'text-2xl' : 'text-3xl md:text-4xl')}>Tính năng nổi bật</h2>
          </div>
          {items.length > itemsPerView && (<div className="flex gap-2">
            <button onClick={() => setCarouselIndex(Math.max(0, carouselIndex - 1))} disabled={carouselIndex === 0} className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center disabled:opacity-30 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"><ChevronLeft size={20} /></button>
            <button onClick={() => setCarouselIndex(Math.min(maxIndex, carouselIndex + 1))} disabled={carouselIndex >= maxIndex} className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center disabled:opacity-30 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"><ChevronRight size={20} /></button>
          </div>)}
        </div>
        <div className="overflow-hidden">
          <div className="flex gap-5 transition-transform duration-300" style={{ transform: `translateX(-${carouselIndex * (100 / itemsPerView)}%)`, width: `${(items.length / itemsPerView) * 100}%` }}>
            {items.map((item) => {
              const IconComponent = getIcon(item.icon);
              return (
                <div key={item.id} className="flex-shrink-0" style={{ width: `${100 / items.length}%` }}>
                  <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 h-full flex flex-col">
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-4" style={{ background: `linear-gradient(135deg, ${brandColor} 0%, ${brandColor}cc 100%)`, boxShadow: `0 8px 16px -4px ${brandColor}40` }}><IconComponent size={24} className="text-white" strokeWidth={2} /></div>
                    <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 mb-2 line-clamp-1">{item.title || 'Tên tính năng'}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3 min-h-[3.75rem]">{item.description || 'Mô tả tính năng...'}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        {items.length > itemsPerView && (<div className="flex justify-center gap-2 mt-6">{Array.from({ length: maxIndex + 1 }).map((_, idx) => (<button key={idx} onClick={() => setCarouselIndex(idx)} className={cn("w-2 h-2 rounded-full transition-all", idx === carouselIndex ? 'w-6' : 'bg-slate-300 dark:bg-slate-600')} style={idx === carouselIndex ? { backgroundColor: brandColor } : {}} />))}</div>)}
      </div>
    );
  };

  const renderTimelineStyle = () => {
    if (items.length === 0) return renderEmptyState();
    const maxItems = device === 'mobile' ? 4 : 6;
    const visibleItems = items.slice(0, maxItems);
    const remainingCount = items.length - maxItems;
    return (
      <div className={cn("py-6 px-4", device === 'mobile' ? 'py-4 px-3' : 'md:py-10 md:px-6')}>
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2" style={{ backgroundColor: `${brandColor}15`, color: brandColor }}><Zap size={12} />Tính năng</div>
          <h2 className={cn("font-bold tracking-tight text-slate-900 dark:text-slate-100", device === 'mobile' ? 'text-xl' : 'text-2xl md:text-3xl')}>Tính năng nổi bật</h2>
        </div>
        <div className="max-w-2xl mx-auto relative">
          <div className={cn("absolute top-0 bottom-0 w-px", device === 'mobile' ? 'left-3' : 'left-1/2')} style={{ backgroundColor: `${brandColor}30` }} />
          <div className={cn("relative", device === 'mobile' ? 'space-y-3' : 'space-y-4')}>
            {visibleItems.map((item, idx) => {
              const IconComponent = getIcon(item.icon);
              const isEven = idx % 2 === 0;
              return (
                <div key={item.id} className={cn("relative flex items-center", device === 'mobile' ? 'pl-8' : (isEven ? 'flex-row pr-[52%]' : 'flex-row-reverse pl-[52%]'))}>
                  <div className={cn("absolute flex items-center justify-center w-6 h-6 rounded-full border-2 border-white dark:border-slate-900 shadow z-10", device === 'mobile' ? 'left-0' : 'left-1/2 -translate-x-1/2')} style={{ backgroundColor: brandColor }}><IconComponent size={12} className="text-white" strokeWidth={2.5} /></div>
                  <div className="flex-1 bg-white dark:bg-slate-800 rounded-lg p-3 shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: `${brandColor}15`, color: brandColor }}>{idx + 1}</span>
                      <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100 line-clamp-1">{item.title || 'Tên tính năng'}</h3>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 pl-6">{item.description || 'Mô tả tính năng...'}</p>
                  </div>
                </div>
              );
            })}
          </div>
          {remainingCount > 0 && (<div className="text-center mt-4"><span className="text-sm" style={{ color: brandColor }}>+{remainingCount} tính năng khác</span></div>)}
        </div>
      </div>
    );
  };

  return (
    <PreviewWrapper title="Preview Features" device={device} setDevice={setDevice} previewStyle={previewStyle} setPreviewStyle={setPreviewStyle} styles={styles} info={`${items.length} tính năng`}>
      <BrowserFrame>
        {previewStyle === 'iconGrid' && renderIconGridStyle()}
        {previewStyle === 'alternating' && renderAlternatingStyle()}
        {previewStyle === 'compact' && renderCompactStyle()}
        {previewStyle === 'cards' && renderCardsStyle()}
        {previewStyle === 'carousel' && renderCarouselStyle()}
        {previewStyle === 'timeline' && renderTimelineStyle()}
      </BrowserFrame>
    </PreviewWrapper>
  );
};

// ============ PROCESS/HOW IT WORKS PREVIEW ============
// 4 Professional Styles: Timeline, Steps, Cards, Zigzag
type ProcessStep = { id: number; icon: string; title: string; description: string };
export type ProcessStyle = 'timeline' | 'steps' | 'cards' | 'zigzag';

export const ProcessPreview = ({ 
  steps, 
  brandColor, 
  selectedStyle, 
  onStyleChange 
}: { 
  steps: ProcessStep[]; 
  brandColor: string; 
  selectedStyle?: ProcessStyle; 
  onStyleChange?: (style: ProcessStyle) => void;
}) => {
  const [device, setDevice] = useState<PreviewDevice>('desktop');
  const previewStyle = selectedStyle || 'timeline';
  const setPreviewStyle = (s: string) => onStyleChange?.(s as ProcessStyle);
  const styles = [
    { id: 'timeline', label: 'Timeline' },
    { id: 'steps', label: 'Steps' },
    { id: 'cards', label: 'Cards' },
    { id: 'zigzag', label: 'Zigzag' },
  ];

  // Style 1: Timeline - Vertical timeline với connecting line
  const renderTimelineStyle = () => (
    <div className={cn("py-8 px-4", device === 'mobile' ? 'py-6 px-3' : 'md:py-12 md:px-6')}>
      {/* Header */}
      <div className="text-center mb-8 md:mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3" style={{ backgroundColor: `${brandColor}15`, color: brandColor }}>
          Quy trình
        </div>
        <h2 className={cn("font-bold tracking-tight text-slate-900 dark:text-slate-100", device === 'mobile' ? 'text-xl' : 'text-2xl md:text-3xl')}>
          Quy trình làm việc
        </h2>
      </div>
      
      {/* Timeline */}
      <div className="max-w-3xl mx-auto relative">
        {/* Vertical Line */}
        <div 
          className={cn(
            "absolute top-0 bottom-0 w-0.5",
            device === 'mobile' ? 'left-4' : 'left-1/2 -translate-x-1/2'
          )}
          style={{ backgroundColor: `${brandColor}20` }}
        />
        
        {/* Steps */}
        <div className="relative space-y-8 md:space-y-12">
          {steps.map((step, idx) => {
            const isEven = idx % 2 === 0;
            return (
              <div 
                key={step.id} 
                className={cn(
                  "relative flex items-start gap-4 md:gap-8",
                  device === 'mobile' ? 'pl-12' : (isEven ? 'md:flex-row' : 'md:flex-row-reverse'),
                  device !== 'mobile' && 'justify-center'
                )}
              >
                {/* Circle Marker */}
                <div 
                  className={cn(
                    "absolute flex items-center justify-center w-8 h-8 rounded-full text-white font-bold text-sm border-4 border-white dark:border-slate-900 shadow-lg z-10",
                    device === 'mobile' ? 'left-0' : 'left-1/2 -translate-x-1/2'
                  )}
                  style={{ backgroundColor: brandColor }}
                >
                  {step.icon || idx + 1}
                </div>
                
                {/* Content Card */}
                <div 
                  className={cn(
                    "bg-white dark:bg-slate-800 rounded-xl p-4 md:p-6 shadow-sm border border-slate-200 dark:border-slate-700",
                    device === 'mobile' ? 'flex-1' : 'w-[calc(50%-3rem)]',
                    device !== 'mobile' && (isEven ? 'text-right' : 'text-left')
                  )}
                >
                  <h3 className="font-bold text-base md:text-lg text-slate-900 dark:text-slate-100 mb-1">
                    {step.title || `Bước ${idx + 1}`}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                    {step.description || 'Mô tả bước này...'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  // Style 2: Steps - Horizontal steps với connector arrows
  const renderStepsStyle = () => (
    <div className={cn("py-8 px-4", device === 'mobile' ? 'py-6 px-3' : 'md:py-12 md:px-6')}>
      {/* Header */}
      <div className="text-center mb-8 md:mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3" style={{ backgroundColor: `${brandColor}15`, color: brandColor }}>
          Quy trình
        </div>
        <h2 className={cn("font-bold tracking-tight text-slate-900 dark:text-slate-100", device === 'mobile' ? 'text-xl' : 'text-2xl md:text-3xl')}>
          Các bước thực hiện
        </h2>
      </div>
      
      {/* Steps Grid */}
      <div className={cn(
        "grid gap-4",
        device === 'mobile' ? 'grid-cols-1' : device === 'tablet' ? 'grid-cols-2' : 'grid-cols-4'
      )}>
        {steps.slice(0, 4).map((step, idx) => (
          <div key={step.id} className="relative">
            {/* Connector Arrow (không hiện trên mobile và item cuối) */}
            {idx < steps.slice(0, 4).length - 1 && device === 'desktop' && (
              <div 
                className="absolute top-10 -right-2 w-4 h-4 z-10"
                style={{ color: brandColor }}
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                  <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"/>
                </svg>
              </div>
            )}
            
            {/* Step Card */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-5 md:p-6 border border-slate-200 dark:border-slate-700 text-center h-full">
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
              
              <h3 className="font-bold text-base md:text-lg text-slate-900 dark:text-slate-100 mb-2">
                {step.title || `Bước ${idx + 1}`}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                {step.description || 'Mô tả bước...'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Style 3: Cards - Grid cards với gradient header
  const renderCardsStyle = () => (
    <div className={cn("py-8 px-4", device === 'mobile' ? 'py-6 px-3' : 'md:py-12 md:px-6')}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b-2 mb-8" style={{ borderColor: `${brandColor}20` }}>
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded text-xs font-bold uppercase tracking-wider" style={{ backgroundColor: `${brandColor}15`, color: brandColor }}>
            Quy trình
          </div>
          <h2 className={cn("font-bold tracking-tight text-slate-900 dark:text-slate-100", device === 'mobile' ? 'text-xl' : 'text-2xl md:text-3xl')}>
            Cách chúng tôi làm việc
          </h2>
        </div>
      </div>
      
      {/* Cards Grid */}
      <div className={cn(
        "grid gap-4 md:gap-6",
        device === 'mobile' ? 'grid-cols-1' : device === 'tablet' ? 'grid-cols-2' : 'grid-cols-2 lg:grid-cols-4'
      )}>
        {steps.slice(0, 4).map((step, idx) => (
          <div 
            key={step.id} 
            className="group bg-white dark:bg-slate-800 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow"
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
              
              <h3 className="font-bold text-base md:text-lg text-slate-900 dark:text-slate-100 mb-2">
                {step.title || `Bước ${idx + 1}`}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                {step.description || 'Mô tả bước này...'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Style 4: Zigzag - Alternating layout với số lớn
  const renderZigzagStyle = () => (
    <div className={cn("py-8 px-4", device === 'mobile' ? 'py-6 px-3' : 'md:py-12 md:px-6')}>
      {/* Header */}
      <div className="text-center mb-8 md:mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3" style={{ backgroundColor: `${brandColor}15`, color: brandColor }}>
          Quy trình
        </div>
        <h2 className={cn("font-bold tracking-tight text-slate-900 dark:text-slate-100", device === 'mobile' ? 'text-xl' : 'text-2xl md:text-3xl')}>
          Quy trình làm việc
        </h2>
      </div>
      
      {/* Zigzag Steps */}
      <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
        {steps.slice(0, 4).map((step, idx) => {
          const isEven = idx % 2 === 0;
          return (
            <div 
              key={step.id} 
              className={cn(
                "flex items-center gap-6 md:gap-8",
                device !== 'mobile' && !isEven && 'flex-row-reverse'
              )}
            >
              {/* Big Number */}
              <div 
                className="relative flex-shrink-0"
                style={{ minWidth: device === 'mobile' ? '60px' : '80px' }}
              >
                <span 
                  className={cn(
                    "font-black leading-none",
                    device === 'mobile' ? 'text-5xl' : 'text-6xl md:text-7xl'
                  )}
                  style={{ 
                    color: brandColor,
                    opacity: 0.15
                  }}
                >
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <div 
                  className="absolute inset-0 flex items-center justify-center"
                >
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
                className={cn(
                  "flex-1 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-5 md:p-6 border border-slate-100 dark:border-slate-700",
                  device !== 'mobile' && !isEven && 'text-right'
                )}
              >
                <h3 className="font-bold text-base md:text-lg text-slate-900 dark:text-slate-100 mb-1">
                  {step.title || `Bước ${idx + 1}`}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  {step.description || 'Mô tả bước này...'}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <PreviewWrapper 
      title="Preview Process" 
      device={device} 
      setDevice={setDevice} 
      previewStyle={previewStyle} 
      setPreviewStyle={setPreviewStyle} 
      styles={styles} 
      info={`${steps.length} bước`}
    >
      <BrowserFrame>
        {previewStyle === 'timeline' && renderTimelineStyle()}
        {previewStyle === 'steps' && renderStepsStyle()}
        {previewStyle === 'cards' && renderCardsStyle()}
        {previewStyle === 'zigzag' && renderZigzagStyle()}
      </BrowserFrame>
    </PreviewWrapper>
  );
};

// ============ CLIENTS MARQUEE PREVIEW ============
// Auto-scroll Logo Marquee - 4 Styles: marquee, marqueeReverse, wave, logoWall
// Khác với Partners (static grid), Clients có hiệu ứng chạy tự động
type ClientItem = { id: number; url: string; link: string; name?: string };
export type ClientsStyle = 'marquee' | 'marqueeReverse' | 'wave' | 'logoWall';

// Infinite Marquee Component với CSS animation
const MarqueeTrack = ({ 
  children, 
  className, 
  reverse = false,
  speed = 30,
  pauseOnHover = true 
}: { 
  children: React.ReactNode; 
  className?: string; 
  reverse?: boolean;
  speed?: number;
  pauseOnHover?: boolean;
}) => {
  return (
    <div 
      className={cn(
        "flex overflow-hidden",
        pauseOnHover && "[&:hover_.marquee-track]:paused",
        className
      )}
      style={{ 
        maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
        WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)'
      }}
    >
      <div 
        className={cn(
          "marquee-track flex shrink-0 items-center gap-12 md:gap-16",
          reverse ? 'animate-marquee-reverse' : 'animate-marquee'
        )}
        style={{ 
          animationDuration: `${speed}s`,
          animationTimingFunction: 'linear',
          animationIterationCount: 'infinite'
        }}
      >
        {children}
      </div>
      <div 
        className={cn(
          "marquee-track flex shrink-0 items-center gap-12 md:gap-16",
          reverse ? 'animate-marquee-reverse' : 'animate-marquee'
        )}
        style={{ 
          animationDuration: `${speed}s`,
          animationTimingFunction: 'linear',
          animationIterationCount: 'infinite'
        }}
      >
        {children}
      </div>
    </div>
  );
};

export const ClientsPreview = ({ 
  items, 
  brandColor, 
  selectedStyle, 
  onStyleChange 
}: { 
  items: ClientItem[]; 
  brandColor: string; 
  selectedStyle?: ClientsStyle; 
  onStyleChange?: (style: ClientsStyle) => void;
}) => {
  const [device, setDevice] = useState<PreviewDevice>('desktop');
  const previewStyle = selectedStyle || 'marquee';
  const setPreviewStyle = (s: string) => onStyleChange?.(s as ClientsStyle);
  const styles = [
    { id: 'marquee', label: 'Marquee' },
    { id: 'marqueeReverse', label: 'Dual Row' },
    { id: 'wave', label: 'Wave' },
    { id: 'logoWall', label: 'Logo Wall' },
  ];

  // Empty state
  if (items.length === 0) {
    return (
      <PreviewWrapper 
        title="Preview Clients" 
        device={device} 
        setDevice={setDevice} 
        previewStyle={previewStyle} 
        setPreviewStyle={setPreviewStyle} 
        styles={styles}
      >
        <BrowserFrame>
          <section className="py-12 px-4">
            <div className="flex flex-col items-center justify-center h-48 text-slate-400">
              <ImageIcon size={48} className="opacity-20 mb-4" />
              <p className="text-sm">Chưa có logo khách hàng nào.</p>
              <p className="text-xs text-slate-300">Thêm ít nhất 3 logo để xem hiệu ứng marquee.</p>
            </div>
          </section>
        </BrowserFrame>
      </PreviewWrapper>
    );
  }

  // CSS keyframes inline (để hoạt động trong preview)
  const marqueeKeyframes = `
    @keyframes marquee {
      0% { transform: translateX(0); }
      100% { transform: translateX(-100%); }
    }
    @keyframes marquee-reverse {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(0); }
    }
    .animate-marquee { animation: marquee var(--marquee-duration, 30s) linear infinite; }
    .animate-marquee-reverse { animation: marquee-reverse var(--marquee-duration, 30s) linear infinite; }
    .paused { animation-play-state: paused !important; }
  `;

  // Logo item renderer
  const renderLogoItem = (item: ClientItem, idx: number, grayscale = false) => (
    <div key={`logo-${item.id}-${idx}`} className="shrink-0 group">
      {item.url ? (
        <img 
          src={item.url} 
          alt={item.name || `Client ${item.id}`}
          className={cn(
            "h-10 md:h-12 w-auto object-contain select-none pointer-events-none transition-all duration-500",
            grayscale && "grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100"
          )}
        />
      ) : (
        <div 
          className="h-10 md:h-12 w-24 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${brandColor}15` }}
        >
          <ImageIcon size={20} style={{ color: brandColor }} className="opacity-40" />
        </div>
      )}
    </div>
  );

  // Style 1: Simple Marquee - Single row auto-scroll left
  const renderMarqueeStyle = () => (
    <section className="w-full py-10 md:py-12 bg-white dark:bg-slate-900 border-b border-slate-200/40 dark:border-slate-700/40">
      <style>{marqueeKeyframes}</style>
      <div className="w-full max-w-7xl mx-auto px-4 md:px-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <h2 className={cn(
            "font-bold tracking-tight text-slate-900 dark:text-slate-100 relative pl-4",
            device === 'mobile' ? 'text-xl' : 'text-2xl'
          )}>
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-full" style={{ backgroundColor: brandColor }} />
            Khách hàng tin tưởng
          </h2>
        </div>
        
        {/* Marquee Track */}
        <div 
          className="relative py-6"
          style={{ 
            maskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
            WebkitMaskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)'
          }}
        >
          <div className="flex overflow-hidden">
            <div 
              className="flex shrink-0 items-center gap-12 md:gap-16 animate-marquee"
              style={{ animationDuration: `${Math.max(20, items.length * 4)}s` }}
            >
              {items.map((item, idx) => renderLogoItem(item, idx))}
              {items.map((item, idx) => renderLogoItem(item, idx + items.length))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );

  // Style 2: Dual Row Marquee - 2 rows chạy ngược chiều
  const renderMarqueeReverseStyle = () => (
    <section className="w-full py-10 md:py-12 bg-white dark:bg-slate-900 border-b border-slate-200/40 dark:border-slate-700/40">
      <style>{marqueeKeyframes}</style>
      <div className="w-full max-w-7xl mx-auto px-4 md:px-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <h2 className={cn(
            "font-bold tracking-tight text-slate-900 dark:text-slate-100 relative pl-4",
            device === 'mobile' ? 'text-xl' : 'text-2xl'
          )}>
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-full" style={{ backgroundColor: brandColor }} />
            Khách hàng tin tưởng
          </h2>
        </div>
        
        {/* Dual Row Marquee */}
        <div className="space-y-4">
          {/* Row 1 - Left to Right */}
          <div 
            className="relative py-4"
            style={{ 
              maskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
              WebkitMaskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)'
            }}
          >
            <div className="flex overflow-hidden">
              <div 
                className="flex shrink-0 items-center gap-12 md:gap-16 animate-marquee"
                style={{ animationDuration: `${Math.max(25, items.length * 5)}s` }}
              >
                {items.map((item, idx) => renderLogoItem(item, idx, true))}
                {items.map((item, idx) => renderLogoItem(item, idx + items.length, true))}
              </div>
            </div>
          </div>
          
          {/* Row 2 - Right to Left (Reverse) */}
          <div 
            className="relative py-4"
            style={{ 
              maskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
              WebkitMaskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)'
            }}
          >
            <div className="flex overflow-hidden">
              <div 
                className="flex shrink-0 items-center gap-12 md:gap-16 animate-marquee-reverse"
                style={{ animationDuration: `${Math.max(30, items.length * 6)}s` }}
              >
                {[...items].reverse().map((item, idx) => renderLogoItem(item, idx, true))}
                {[...items].reverse().map((item, idx) => renderLogoItem(item, idx + items.length, true))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );

  // Style 3: Wave - Logos with floating animation
  const renderWaveStyle = () => (
    <section className="w-full py-10 md:py-16 bg-gradient-to-b from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 border-b border-slate-200/40 dark:border-slate-700/40 overflow-hidden">
      <style>{`
        ${marqueeKeyframes}
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .animate-float { animation: float 3s ease-in-out infinite; }
      `}</style>
      <div className="w-full max-w-7xl mx-auto px-4 md:px-6 space-y-8">
        {/* Header - Centered */}
        <div className="text-center space-y-2">
          <div 
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
            style={{ backgroundColor: `${brandColor}15`, color: brandColor }}
          >
            Đối tác & Khách hàng
          </div>
          <h2 className={cn(
            "font-bold tracking-tight text-slate-900 dark:text-slate-100",
            device === 'mobile' ? 'text-xl' : 'text-2xl md:text-3xl'
          )}>
            Được tin tưởng bởi các thương hiệu hàng đầu
          </h2>
        </div>
        
        {/* Wave Logos */}
        <div 
          className="relative py-8"
          style={{ 
            maskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)',
            WebkitMaskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)'
          }}
        >
          <div className="flex overflow-hidden">
            <div 
              className="flex shrink-0 items-center gap-14 md:gap-20 animate-marquee"
              style={{ animationDuration: `${Math.max(35, items.length * 6)}s` }}
            >
              {items.map((item, idx) => (
                <div 
                  key={`wave-${item.id}-${idx}`} 
                  className="shrink-0 animate-float"
                  style={{ animationDelay: `${idx * 0.3}s` }}
                >
                  {item.url ? (
                    <div className="p-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                      <img 
                        src={item.url} 
                        alt={item.name || `Client ${item.id}`}
                        className="h-8 md:h-10 w-auto object-contain select-none pointer-events-none"
                      />
                    </div>
                  ) : (
                    <div 
                      className="h-16 w-28 rounded-xl flex items-center justify-center bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700"
                    >
                      <ImageIcon size={20} className="text-slate-300" />
                    </div>
                  )}
                </div>
              ))}
              {items.map((item, idx) => (
                <div 
                  key={`wave2-${item.id}-${idx}`} 
                  className="shrink-0 animate-float"
                  style={{ animationDelay: `${(idx + items.length) * 0.3}s` }}
                >
                  {item.url ? (
                    <div className="p-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                      <img 
                        src={item.url} 
                        alt={item.name || `Client ${item.id}`}
                        className="h-8 md:h-10 w-auto object-contain select-none pointer-events-none"
                      />
                    </div>
                  ) : (
                    <div 
                      className="h-16 w-28 rounded-xl flex items-center justify-center bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700"
                    >
                      <ImageIcon size={20} className="text-slate-300" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        
      </div>
    </section>
  );

  // Style 4: Logo Wall - Static grid với hover highlight (fallback khi ít logos)
  const renderLogoWallStyle = () => (
    <section className="w-full py-10 md:py-12 bg-white dark:bg-slate-900 border-b border-slate-200/40 dark:border-slate-700/40">
      <style>{marqueeKeyframes}</style>
      <div className="w-full max-w-7xl mx-auto px-4 md:px-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <h2 className={cn(
            "font-bold tracking-tight text-slate-900 dark:text-slate-100 relative pl-4",
            device === 'mobile' ? 'text-xl' : 'text-2xl'
          )}>
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-full" style={{ backgroundColor: brandColor }} />
            Khách hàng tiêu biểu
          </h2>
        </div>
        
        {/* Logo Wall Grid với auto-scroll nếu nhiều logos */}
        {items.length > 8 ? (
          <div 
            className="relative py-6"
            style={{ 
              maskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)',
              WebkitMaskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)'
            }}
          >
            <div className="flex overflow-hidden">
              <div 
                className="flex shrink-0 items-center gap-10 md:gap-14 animate-marquee"
                style={{ animationDuration: `${Math.max(40, items.length * 4)}s` }}
              >
                {items.map((item, idx) => (
                  <div 
                    key={`wall-${item.id}-${idx}`} 
                    className="shrink-0 group p-3 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
                  >
                    {item.url ? (
                      <img 
                        src={item.url} 
                        alt={item.name || `Client ${item.id}`}
                        className="h-10 md:h-12 w-auto object-contain select-none pointer-events-none grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300"
                      />
                    ) : (
                      <div 
                        className="h-10 md:h-12 w-24 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${brandColor}10` }}
                      >
                        <ImageIcon size={18} className="text-slate-300" />
                      </div>
                    )}
                    {item.name && (
                      <div className="text-[10px] text-slate-400 text-center mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {item.name}
                      </div>
                    )}
                  </div>
                ))}
                {items.map((item, idx) => (
                  <div 
                    key={`wall2-${item.id}-${idx}`} 
                    className="shrink-0 group p-3 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
                  >
                    {item.url ? (
                      <img 
                        src={item.url} 
                        alt={item.name || `Client ${item.id}`}
                        className="h-10 md:h-12 w-auto object-contain select-none pointer-events-none grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300"
                      />
                    ) : (
                      <div 
                        className="h-10 md:h-12 w-24 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${brandColor}10` }}
                      >
                        <ImageIcon size={18} className="text-slate-300" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Static Grid cho ít logos */
          <div className={cn(
            "grid gap-6 items-center justify-items-center py-6",
            device === 'mobile' ? 'grid-cols-2' : device === 'tablet' ? 'grid-cols-4' : 'grid-cols-4 lg:grid-cols-6'
          )}>
            {items.map((item) => (
              <div 
                key={`static-${item.id}`}
                className="group p-4 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer w-full flex flex-col items-center"
              >
                {item.url ? (
                  <img 
                    src={item.url} 
                    alt={item.name || `Client ${item.id}`}
                    className="h-10 md:h-12 w-auto object-contain select-none pointer-events-none grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300"
                  />
                ) : (
                  <div 
                    className="h-10 md:h-12 w-24 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${brandColor}10` }}
                  >
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

  return (
    <PreviewWrapper 
      title="Preview Clients" 
      device={device} 
      setDevice={setDevice} 
      previewStyle={previewStyle} 
      setPreviewStyle={setPreviewStyle} 
      styles={styles} 
      info={`${items.length} logo`}
    >
      <BrowserFrame>
        {previewStyle === 'marquee' && renderMarqueeStyle()}
        {previewStyle === 'marqueeReverse' && renderMarqueeReverseStyle()}
        {previewStyle === 'wave' && renderWaveStyle()}
        {previewStyle === 'logoWall' && renderLogoWallStyle()}
      </BrowserFrame>
    </PreviewWrapper>
  );
};

// ============ VIDEO PREVIEW ============
// 3 Professional Styles: Centered, Split, Fullwidth
import { Play, Video as VideoIcon } from 'lucide-react';

export type VideoStyle = 'centered' | 'split' | 'fullwidth';

interface VideoConfig {
  videoUrl: string;
  thumbnailUrl?: string;
  heading?: string;
  description?: string;
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
}

// Helper: Extract video ID and type
const getVideoInfo = (url: string): { type: 'youtube' | 'vimeo' | 'direct'; id?: string } => {
  if (!url) return { type: 'direct' };
  
  // YouTube
  const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&?/]+)/);
  if (ytMatch) return { type: 'youtube', id: ytMatch[1] };
  
  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeoMatch) return { type: 'vimeo', id: vimeoMatch[1] };
  
  return { type: 'direct' };
};

// Helper: Get YouTube thumbnail
const getYouTubeThumbnail = (videoId: string): string => {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
};

export const VideoPreview = ({ 
  config, 
  brandColor, 
  selectedStyle, 
  onStyleChange 
}: { 
  config: VideoConfig; 
  brandColor: string; 
  selectedStyle?: VideoStyle; 
  onStyleChange?: (style: VideoStyle) => void;
}) => {
  const [device, setDevice] = useState<PreviewDevice>('desktop');
  const [isPlaying, setIsPlaying] = useState(false);
  const previewStyle = selectedStyle || 'centered';
  const setPreviewStyle = (s: string) => onStyleChange?.(s as VideoStyle);
  
  const styles = [
    { id: 'centered', label: 'Centered' },
    { id: 'split', label: 'Split' },
    { id: 'fullwidth', label: 'Toàn màn hình' },
  ];

  const { videoUrl, thumbnailUrl, heading, description } = config;
  const videoInfo = getVideoInfo(videoUrl);
  
  // Determine thumbnail
  const displayThumbnail = thumbnailUrl || 
    (videoInfo.type === 'youtube' && videoInfo.id ? getYouTubeThumbnail(videoInfo.id) : '');

  // Play button component
  const PlayButton = ({ size = 'lg' }: { size?: 'sm' | 'lg' }) => (
    <button 
      type="button"
      onClick={() => setIsPlaying(true)}
      className={cn(
        "absolute inset-0 flex items-center justify-center group transition-all",
        "bg-black/30 hover:bg-black/40"
      )}
    >
      <div 
        className={cn(
          "rounded-full flex items-center justify-center transition-transform group-hover:scale-110 shadow-xl",
          size === 'lg' ? 'w-16 h-16 md:w-20 md:h-20' : 'w-12 h-12'
        )}
        style={{ backgroundColor: brandColor }}
      >
        <Play 
          className={cn("text-white ml-1", size === 'lg' ? 'w-7 h-7 md:w-8 md:h-8' : 'w-5 h-5')} 
          fill="white" 
        />
      </div>
    </button>
  );

  // Video embed component
  const VideoEmbed = ({ aspectRatio = '16/9' }: { aspectRatio?: string }) => {
    if (!isPlaying) return null;
    
    if (videoInfo.type === 'youtube' && videoInfo.id) {
      return (
        <iframe 
          src={`https://www.youtube.com/embed/${videoInfo.id}?autoplay=1&rel=0`}
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      );
    }
    
    if (videoInfo.type === 'vimeo' && videoInfo.id) {
      return (
        <iframe 
          src={`https://player.vimeo.com/video/${videoInfo.id}?autoplay=1`}
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
        autoPlay
      />
    );
  };

  // Empty state
  const EmptyState = () => (
    <div 
      className="w-full aspect-video flex flex-col items-center justify-center rounded-xl"
      style={{ backgroundColor: `${brandColor}10` }}
    >
      <VideoIcon size={48} className="text-slate-300 mb-3" />
      <p className="text-sm text-slate-400">Chưa có video</p>
      <p className="text-xs text-slate-300">Thêm URL video để xem preview</p>
    </div>
  );

  // Style 1: Centered - Video ở giữa với heading/description
  const renderCenteredStyle = () => (
    <section className={cn("py-12 px-4", device === 'mobile' ? 'py-8' : 'py-16')}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        {(heading || description) && (
          <div className="text-center mb-8">
            {heading && (
              <h2 className={cn(
                "font-bold text-slate-900 mb-3",
                device === 'mobile' ? 'text-xl' : 'text-2xl md:text-3xl'
              )}>
                {heading}
              </h2>
            )}
            {description && (
              <p className={cn(
                "text-slate-500 max-w-2xl mx-auto",
                device === 'mobile' ? 'text-sm' : 'text-base'
              )}>
                {description}
              </p>
            )}
          </div>
        )}
        
        {/* Video */}
        {!videoUrl ? (
          <EmptyState />
        ) : (
          <div className="relative aspect-video rounded-xl overflow-hidden shadow-2xl bg-slate-900">
            {!isPlaying && displayThumbnail && (
              <img 
                src={displayThumbnail} 
                alt="Video thumbnail" 
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}
            {!isPlaying && !displayThumbnail && (
              <div 
                className="absolute inset-0 flex items-center justify-center"
                style={{ backgroundColor: `${brandColor}20` }}
              >
                <VideoIcon size={64} className="text-slate-400" />
              </div>
            )}
            {!isPlaying && <PlayButton />}
            <VideoEmbed />
          </div>
        )}
      </div>
    </section>
  );

  // Style 2: Split - Video bên trái, content bên phải (hoặc ngược lại trên mobile)
  const renderSplitStyle = () => (
    <section className={cn("py-12 px-4", device === 'mobile' ? 'py-8' : 'py-16')}>
      <div className="max-w-6xl mx-auto">
        <div className={cn(
          "grid gap-8 items-center",
          device === 'mobile' ? 'grid-cols-1' : 'grid-cols-2 gap-12'
        )}>
          {/* Video */}
          <div className={cn(device === 'mobile' ? 'order-1' : 'order-1')}>
            {!videoUrl ? (
              <EmptyState />
            ) : (
              <div className="relative aspect-video rounded-xl overflow-hidden shadow-xl bg-slate-900">
                {!isPlaying && displayThumbnail && (
                  <img 
                    src={displayThumbnail} 
                    alt="Video thumbnail" 
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}
                {!isPlaying && !displayThumbnail && (
                  <div 
                    className="absolute inset-0 flex items-center justify-center"
                    style={{ backgroundColor: `${brandColor}20` }}
                  >
                    <VideoIcon size={48} className="text-slate-400" />
                  </div>
                )}
                {!isPlaying && <PlayButton size="sm" />}
                <VideoEmbed />
              </div>
            )}
          </div>
          
          {/* Content */}
          <div className={cn(device === 'mobile' ? 'order-2 text-center' : 'order-2')}>
            {heading && (
              <h2 className={cn(
                "font-bold text-slate-900 mb-4",
                device === 'mobile' ? 'text-xl' : 'text-2xl md:text-3xl'
              )}>
                {heading}
              </h2>
            )}
            {description && (
              <p className={cn(
                "text-slate-500 mb-6",
                device === 'mobile' ? 'text-sm' : 'text-base'
              )}>
                {description}
              </p>
            )}
            <button 
              type="button"
              className="px-6 py-2.5 rounded-lg text-white font-medium text-sm transition-opacity hover:opacity-90"
              style={{ backgroundColor: brandColor }}
            >
              Tìm hiểu thêm
            </button>
          </div>
        </div>
      </div>
    </section>
  );

  // Style 3: Fullwidth - Video toàn màn hình với overlay text
  const renderFullwidthStyle = () => (
    <section className="relative">
      {!videoUrl ? (
        <div className="py-16 px-4">
          <EmptyState />
        </div>
      ) : (
        <div className={cn(
          "relative overflow-hidden",
          device === 'mobile' ? 'aspect-video' : 'aspect-[21/9] min-h-[400px]'
        )}>
          {/* Video/Thumbnail */}
          {!isPlaying && displayThumbnail && (
            <img 
              src={displayThumbnail} 
              alt="Video thumbnail" 
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
          {!isPlaying && !displayThumbnail && (
            <div 
              className="absolute inset-0"
              style={{ backgroundColor: `${brandColor}30` }}
            />
          )}
          
          {/* Overlay gradient */}
          {!isPlaying && (
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
          )}
          
          {/* Content overlay */}
          {!isPlaying && (
            <div className={cn(
              "absolute inset-0 flex items-center",
              device === 'mobile' ? 'px-4' : 'px-8 md:px-16'
            )}>
              <div className="max-w-xl">
                {heading && (
                  <h2 className={cn(
                    "font-bold text-white mb-4",
                    device === 'mobile' ? 'text-xl' : 'text-3xl md:text-4xl'
                  )}>
                    {heading}
                  </h2>
                )}
                {description && (
                  <p className={cn(
                    "text-white/80 mb-6",
                    device === 'mobile' ? 'text-sm' : 'text-lg'
                  )}>
                    {description}
                  </p>
                )}
                <button 
                  type="button"
                  onClick={() => setIsPlaying(true)}
                  className="flex items-center gap-3 px-6 py-3 rounded-lg text-white font-medium transition-transform hover:scale-105"
                  style={{ backgroundColor: brandColor }}
                >
                  <Play className="w-5 h-5" fill="white" />
                  Xem video
                </button>
              </div>
            </div>
          )}
          
          {/* Center play button (alternative) */}
          {!isPlaying && device !== 'mobile' && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div 
                className="w-20 h-20 rounded-full flex items-center justify-center opacity-50"
                style={{ backgroundColor: brandColor }}
              >
                <Play className="w-8 h-8 text-white ml-1" fill="white" />
              </div>
            </div>
          )}
          
          <VideoEmbed />
        </div>
      )}
    </section>
  );

  return (
    <PreviewWrapper 
      title="Preview Video" 
      device={device} 
      setDevice={setDevice} 
      previewStyle={previewStyle} 
      setPreviewStyle={setPreviewStyle} 
      styles={styles}
      info={videoUrl ? (videoInfo.type === 'direct' ? 'Video trực tiếp' : videoInfo.type.charAt(0).toUpperCase() + videoInfo.type.slice(1)) : 'Chưa có video'}
    >
      <BrowserFrame>
        {previewStyle === 'centered' && renderCenteredStyle()}
        {previewStyle === 'split' && renderSplitStyle()}
        {previewStyle === 'fullwidth' && renderFullwidthStyle()}
      </BrowserFrame>
    </PreviewWrapper>
  );
};

// ============ COUNTDOWN / PROMOTION PREVIEW ============
// 4 Professional Styles: Banner, Floating, Minimal, Split
type CountdownConfig = {
  heading: string;
  subHeading: string;
  description: string;
  endDate: string;
  buttonText: string;
  buttonLink: string;
  backgroundImage: string;
  discountText: string;
  showDays: boolean;
  showHours: boolean;
  showMinutes: boolean;
  showSeconds: boolean;
};

export type CountdownStyle = 'banner' | 'floating' | 'minimal' | 'split';

// Countdown Timer Hook
const useCountdown = (endDate: string) => {
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

export const CountdownPreview = ({ 
  config, 
  brandColor, 
  selectedStyle, 
  onStyleChange 
}: { 
  config: CountdownConfig;
  brandColor: string; 
  selectedStyle?: CountdownStyle; 
  onStyleChange?: (style: CountdownStyle) => void;
}) => {
  const [device, setDevice] = useState<PreviewDevice>('desktop');
  const previewStyle = selectedStyle || 'banner';
  const setPreviewStyle = (s: string) => onStyleChange?.(s as CountdownStyle);
  const timeLeft = useCountdown(config.endDate);
  
  const styles = [
    { id: 'banner', label: 'Banner' },
    { id: 'floating', label: 'Nổi bật' },
    { id: 'minimal', label: 'Tối giản' },
    { id: 'split', label: 'Chia đôi' },
  ];

  // Time unit renderer
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
          <div 
            className="border-2 rounded-lg px-3 py-2 min-w-[50px] md:min-w-[60px]"
            style={{ borderColor: brandColor }}
          >
            <span className="text-2xl md:text-3xl font-bold tabular-nums" style={{ color: brandColor }}>{String(value).padStart(2, '0')}</span>
          </div>
          <span className="text-xs text-slate-500 mt-1 uppercase tracking-wider">{label}</span>
        </div>
      );
    }
    return (
      <div className="flex flex-col items-center">
        <div 
          className="rounded-lg px-3 py-2 min-w-[50px] md:min-w-[60px] text-white"
          style={{ backgroundColor: brandColor }}
        >
          <span className="text-2xl md:text-3xl font-bold tabular-nums">{String(value).padStart(2, '0')}</span>
        </div>
        <span className="text-xs text-slate-500 mt-1 uppercase tracking-wider">{label}</span>
      </div>
    );
  };

  // Timer Display
  const TimerDisplay = ({ variant = 'default' }: { variant?: 'default' | 'light' | 'outlined' }) => (
    <div className={cn("flex items-center gap-2 md:gap-3", device === 'mobile' && 'gap-1.5')}>
      {config.showDays && (
        <>
          <TimeUnit value={timeLeft.days} label="Ngày" variant={variant} />
          <span className={cn("text-xl font-bold", variant === 'light' ? 'text-white/60' : 'text-slate-300')}>:</span>
        </>
      )}
      {config.showHours && (
        <>
          <TimeUnit value={timeLeft.hours} label="Giờ" variant={variant} />
          <span className={cn("text-xl font-bold", variant === 'light' ? 'text-white/60' : 'text-slate-300')}>:</span>
        </>
      )}
      {config.showMinutes && (
        <>
          <TimeUnit value={timeLeft.minutes} label="Phút" variant={variant} />
          {config.showSeconds && <span className={cn("text-xl font-bold", variant === 'light' ? 'text-white/60' : 'text-slate-300')}>:</span>}
        </>
      )}
      {config.showSeconds && (
        <TimeUnit value={timeLeft.seconds} label="Giây" variant={variant} />
      )}
    </div>
  );

  // Style 1: Banner - Full width banner with gradient background
  const renderBannerStyle = () => (
    <section 
      className="relative w-full py-10 md:py-16 px-4 overflow-hidden"
      style={{ 
        background: config.backgroundImage 
          ? `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${config.backgroundImage}) center/cover`
          : `linear-gradient(135deg, ${brandColor} 0%, ${brandColor}cc 100%)`
      }}
    >
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10 blur-3xl" style={{ backgroundColor: 'white' }} />
      <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-10 blur-3xl" style={{ backgroundColor: 'white' }} />
      
      <div className="max-w-5xl mx-auto text-center relative z-10">
        {/* Discount badge */}
        {config.discountText && (
          <div className="inline-block mb-4">
            <span className="bg-yellow-400 text-yellow-900 px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider animate-pulse">
              {config.discountText}
            </span>
          </div>
        )}
        
        {config.subHeading && (
          <p className="text-white/80 text-sm md:text-base uppercase tracking-wider mb-2">{config.subHeading}</p>
        )}
        
        <h2 className={cn(
          "font-bold text-white mb-4",
          device === 'mobile' ? 'text-2xl' : 'text-3xl md:text-4xl'
        )}>
          {config.heading || 'Flash Sale'}
        </h2>
        
        {config.description && (
          <p className="text-white/90 mb-6 max-w-2xl mx-auto">{config.description}</p>
        )}
        
        {/* Countdown Timer */}
        <div className="flex justify-center mb-6">
          <TimerDisplay variant="light" />
        </div>
        
        {config.buttonText && (
          <a 
            href={config.buttonLink || '#'} 
            className="inline-flex items-center gap-2 px-8 py-3 bg-white rounded-lg font-semibold transition-transform hover:scale-105"
            style={{ color: brandColor }}
          >
            {config.buttonText}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        )}
      </div>
    </section>
  );

  // Style 2: Floating - Card style với shadow nổi bật
  const renderFloatingStyle = () => (
    <section className="py-8 md:py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div 
          className="relative rounded-2xl overflow-hidden shadow-2xl"
          style={{ 
            background: config.backgroundImage 
              ? `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${config.backgroundImage}) center/cover`
              : `linear-gradient(135deg, ${brandColor}ee 0%, ${brandColor} 100%)`
          }}
        >
          {/* Discount badge - corner ribbon */}
          {config.discountText && (
            <div className="absolute -right-12 top-6 rotate-45 bg-yellow-400 text-yellow-900 px-12 py-1 text-sm font-bold shadow-lg">
              {config.discountText}
            </div>
          )}
          
          <div className={cn(
            "p-6 md:p-10 text-center",
            device === 'mobile' ? 'p-5' : ''
          )}>
            {config.subHeading && (
              <div className="inline-block mb-3 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm">
                <span className="text-xs md:text-sm text-white font-medium uppercase tracking-wider">{config.subHeading}</span>
              </div>
            )}
            
            <h2 className={cn(
              "font-bold text-white mb-3",
              device === 'mobile' ? 'text-xl' : 'text-2xl md:text-3xl'
            )}>
              {config.heading || 'Khuyến mãi đặc biệt'}
            </h2>
            
            {config.description && (
              <p className="text-white/80 mb-6 text-sm md:text-base">{config.description}</p>
            )}
            
            {/* Countdown Timer */}
            <div className="flex justify-center mb-6">
              <TimerDisplay variant="light" />
            </div>
            
            {config.buttonText && (
              <a 
                href={config.buttonLink || '#'} 
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-white rounded-full font-semibold text-sm transition-all hover:shadow-lg hover:scale-105"
                style={{ color: brandColor }}
              >
                {config.buttonText}
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );

  // Style 3: Minimal - Clean, typography focused
  const renderMinimalStyle = () => (
    <section className="py-10 md:py-14 px-4 bg-slate-50 dark:bg-slate-900">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 md:p-10">
          <div className={cn(
            "flex items-center justify-between gap-6",
            device === 'mobile' ? 'flex-col text-center' : ''
          )}>
            {/* Left content */}
            <div className={cn("flex-1", device === 'mobile' ? '' : 'max-w-md')}>
              {config.discountText && (
                <span 
                  className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-3"
                  style={{ backgroundColor: `${brandColor}15`, color: brandColor }}
                >
                  {config.discountText}
                </span>
              )}
              
              {config.subHeading && (
                <p className="text-sm text-slate-500 mb-1">{config.subHeading}</p>
              )}
              
              <h2 className={cn(
                "font-bold text-slate-900 dark:text-white",
                device === 'mobile' ? 'text-xl mb-2' : 'text-2xl mb-2'
              )}>
                {config.heading || 'Ưu đãi có hạn'}
              </h2>
              
              {config.description && (
                <p className="text-slate-500 text-sm mb-4">{config.description}</p>
              )}
              
              {config.buttonText && device !== 'mobile' && (
                <a 
                  href={config.buttonLink || '#'} 
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-lg font-medium text-sm text-white transition-colors hover:opacity-90"
                  style={{ backgroundColor: brandColor }}
                >
                  {config.buttonText}
                </a>
              )}
            </div>
            
            {/* Right - Timer */}
            <div className="flex flex-col items-center">
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-3">Kết thúc sau</p>
              <TimerDisplay variant="outlined" />
              
              {config.buttonText && device === 'mobile' && (
                <a 
                  href={config.buttonLink || '#'} 
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-lg font-medium text-sm text-white mt-4 transition-colors hover:opacity-90"
                  style={{ backgroundColor: brandColor }}
                >
                  {config.buttonText}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );

  // Style 4: Split - Two columns with image
  const renderSplitStyle = () => (
    <section className="py-8 md:py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div 
          className={cn(
            "rounded-2xl overflow-hidden shadow-lg",
            device === 'mobile' ? 'flex flex-col' : 'grid grid-cols-2'
          )}
        >
          {/* Left - Image/Visual */}
          <div 
            className={cn(
              "relative flex items-center justify-center",
              device === 'mobile' ? 'h-48' : 'min-h-[300px]'
            )}
            style={{ 
              background: config.backgroundImage 
                ? `url(${config.backgroundImage}) center/cover`
                : `linear-gradient(135deg, ${brandColor}dd 0%, ${brandColor} 100%)`
            }}
          >
            {!config.backgroundImage && (
              <div className="text-center text-white p-6">
                {config.discountText && (
                  <div className="text-5xl md:text-7xl font-black mb-2">{config.discountText}</div>
                )}
                <div className="text-lg md:text-xl font-medium opacity-90">GIẢM GIÁ</div>
              </div>
            )}
            {config.backgroundImage && config.discountText && (
              <div className="absolute top-4 left-4 bg-yellow-400 text-yellow-900 px-4 py-2 rounded-lg font-bold text-xl">
                {config.discountText}
              </div>
            )}
          </div>
          
          {/* Right - Content */}
          <div className="bg-white dark:bg-slate-800 p-6 md:p-8 flex flex-col justify-center">
            {config.subHeading && (
              <p className="text-sm uppercase tracking-wider mb-2" style={{ color: brandColor }}>{config.subHeading}</p>
            )}
            
            <h2 className={cn(
              "font-bold text-slate-900 dark:text-white mb-3",
              device === 'mobile' ? 'text-xl' : 'text-2xl'
            )}>
              {config.heading || 'Khuyến mãi đặc biệt'}
            </h2>
            
            {config.description && (
              <p className="text-slate-500 text-sm mb-5">{config.description}</p>
            )}
            
            {/* Countdown */}
            <div className="mb-5">
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Còn lại</p>
              <TimerDisplay variant="default" />
            </div>
            
            {config.buttonText && (
              <a 
                href={config.buttonLink || '#'} 
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-white transition-all hover:opacity-90 w-full md:w-auto"
                style={{ backgroundColor: brandColor }}
              >
                {config.buttonText}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );

  return (
    <PreviewWrapper 
      title="Preview Countdown / Promotion" 
      device={device} 
      setDevice={setDevice} 
      previewStyle={previewStyle} 
      setPreviewStyle={setPreviewStyle} 
      styles={styles}
    >
      <BrowserFrame>
        {previewStyle === 'banner' && renderBannerStyle()}
        {previewStyle === 'floating' && renderFloatingStyle()}
        {previewStyle === 'minimal' && renderMinimalStyle()}
        {previewStyle === 'split' && renderSplitStyle()}
      </BrowserFrame>
    </PreviewWrapper>
  );
};
