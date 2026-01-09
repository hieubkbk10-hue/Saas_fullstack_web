'use client';

import React from 'react';
import { useBrandColor } from './hooks';
import { 
  LayoutTemplate, Package, FileText, HelpCircle, MousePointerClick, 
  Users, Star, Phone, Briefcase, Image as ImageIcon
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
    case 'Benefits':
      return <ServicesSection config={config} brandColor={brandColor} title={title} />;
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
    case 'ServiceList':
    case 'Blog':
      return <ProductListSection config={config} brandColor={brandColor} title={title} type={type} />;
    case 'Career':
      return <CareerSection config={config} brandColor={brandColor} title={title} />;
    case 'CaseStudy':
      return <CaseStudySection config={config} brandColor={brandColor} title={title} />;
    default:
      return <PlaceholderSection type={type} title={title} />;
  }
}

// ============ HERO SECTION ============
function HeroSection({ config, brandColor }: { config: Record<string, unknown>; brandColor: string }) {
  const slides = (config.slides as Array<{ image: string; link: string }>) || [];
  const [currentSlide, setCurrentSlide] = React.useState(0);

  React.useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

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

  return (
    <section className="relative h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden">
      {slides.map((slide, idx) => (
        <div
          key={idx}
          className={`absolute inset-0 transition-opacity duration-700 ${idx === currentSlide ? 'opacity-100' : 'opacity-0'}`}
        >
          {slide.image ? (
            <a href={slide.link || '#'} className="block w-full h-full">
              <img src={slide.image} alt="" className="w-full h-full object-cover" />
            </a>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900" />
          )}
        </div>
      ))}
      
      {/* Dots */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`w-3 h-3 rounded-full transition-all ${idx === currentSlide ? 'w-8' : 'bg-white/50'}`}
              style={idx === currentSlide ? { backgroundColor: brandColor } : {}}
            />
          ))}
        </div>
      )}
    </section>
  );
}

// ============ STATS SECTION ============
function StatsSection({ config, brandColor, title }: { config: Record<string, unknown>; brandColor: string; title: string }) {
  const items = (config.items as Array<{ value: string; label: string }>) || [];

  return (
    <section className="py-16 px-4" style={{ backgroundColor: brandColor }}>
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
          {items.map((item, idx) => (
            <div key={idx}>
              <div className="text-3xl md:text-4xl font-bold mb-2">{item.value}</div>
              <div className="text-sm opacity-80">{item.label}</div>
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
function ServicesSection({ config, brandColor, title }: { config: Record<string, unknown>; brandColor: string; title: string }) {
  const items = (config.items as Array<{ icon?: string; title: string; description: string }>) || [];

  return (
    <section className="py-16 px-4 bg-slate-50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12 text-slate-900">{title}</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {items.map((item, idx) => (
            <div key={idx} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                style={{ backgroundColor: `${brandColor}15` }}
              >
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

// ============ FAQ SECTION ============
function FAQSection({ config, brandColor, title }: { config: Record<string, unknown>; brandColor: string; title: string }) {
  const items = (config.items as Array<{ question: string; answer: string }>) || [];
  const [openIndex, setOpenIndex] = React.useState<number | null>(0);

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
                <span 
                  className={`transition-transform ${openIndex === idx ? 'rotate-180' : ''}`}
                  style={{ color: brandColor }}
                >
                  ▼
                </span>
              </button>
              {openIndex === idx && (
                <div className="px-6 py-4 bg-slate-50 text-slate-600 border-t">
                  {item.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============ CTA SECTION ============
function CTASection({ config, brandColor }: { config: Record<string, unknown>; brandColor: string }) {
  const { title, description, buttonText, buttonLink, secondaryButtonText, secondaryButtonLink } = config as {
    title?: string;
    description?: string;
    buttonText?: string;
    buttonLink?: string;
    secondaryButtonText?: string;
    secondaryButtonLink?: string;
  };

  return (
    <section className="py-16 px-4" style={{ backgroundColor: brandColor }}>
      <div className="max-w-4xl mx-auto text-center text-white">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">{title || 'Sẵn sàng bắt đầu?'}</h2>
        <p className="text-lg opacity-90 mb-8">{description}</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {buttonText && (
            <a
              href={buttonLink || '#'}
              className="px-8 py-3 bg-white rounded-lg font-medium hover:bg-slate-100 transition-colors"
              style={{ color: brandColor }}
            >
              {buttonText}
            </a>
          )}
          {secondaryButtonText && (
            <a
              href={secondaryButtonLink || '#'}
              className="px-8 py-3 border-2 border-white rounded-lg font-medium hover:bg-white/10 transition-colors"
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
function ContactSection({ config, brandColor, title }: { config: Record<string, unknown>; brandColor: string; title: string }) {
  const { address, phone, email, workingHours } = config as {
    address?: string;
    phone?: string;
    email?: string;
    workingHours?: string;
  };

  return (
    <section className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12 text-slate-900">{title}</h2>
        <div className="grid md:grid-cols-2 gap-12">
          <div className="space-y-6">
            {phone && (
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${brandColor}15` }}>
                  <Phone size={24} style={{ color: brandColor }} />
                </div>
                <div>
                  <div className="text-sm text-slate-500">Điện thoại</div>
                  <div className="font-medium">{phone}</div>
                </div>
              </div>
            )}
            {email && (
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${brandColor}15` }}>
                  <Phone size={24} style={{ color: brandColor }} />
                </div>
                <div>
                  <div className="text-sm text-slate-500">Email</div>
                  <div className="font-medium">{email}</div>
                </div>
              </div>
            )}
            {address && (
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${brandColor}15` }}>
                  <Phone size={24} style={{ color: brandColor }} />
                </div>
                <div>
                  <div className="text-sm text-slate-500">Địa chỉ</div>
                  <div className="font-medium">{address}</div>
                </div>
              </div>
            )}
          </div>
          <div className="bg-slate-100 rounded-xl p-8">
            <form className="space-y-4">
              <input type="text" placeholder="Họ tên" className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2" style={{ '--tw-ring-color': brandColor } as React.CSSProperties} />
              <input type="email" placeholder="Email" className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2" />
              <textarea placeholder="Nội dung" rows={4} className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2"></textarea>
              <button type="submit" className="w-full py-3 text-white rounded-lg font-medium hover:opacity-90" style={{ backgroundColor: brandColor }}>
                Gửi tin nhắn
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============ GALLERY SECTION ============
function GallerySection({ config, brandColor, title, type }: { config: Record<string, unknown>; brandColor: string; title: string; type: string }) {
  const items = (config.items as Array<{ url: string; link?: string }>) || [];
  const cols = type === 'Partners' ? 'grid-cols-3 md:grid-cols-6' : 'grid-cols-2 md:grid-cols-4';

  return (
    <section className="py-16 px-4 bg-slate-50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12 text-slate-900">{title}</h2>
        <div className={`grid ${cols} gap-6`}>
          {items.map((item, idx) => (
            <a key={idx} href={item.link || '#'} className="block aspect-video bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              {item.url ? (
                <img src={item.url} alt="" className="w-full h-full object-contain p-4" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon size={32} className="text-slate-300" />
                </div>
              )}
            </a>
          ))}
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

// ============ PRODUCT LIST SECTION (Placeholder) ============
function ProductListSection({ config, brandColor, title, type }: { config: Record<string, unknown>; brandColor: string; title: string; type: string }) {
  return (
    <section className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12 text-slate-900">{title}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(idx => (
            <div key={idx} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="aspect-square bg-slate-100 flex items-center justify-center">
                <Package size={48} className="text-slate-300" />
              </div>
              <div className="p-4">
                <div className="h-4 bg-slate-200 rounded mb-2"></div>
                <div className="h-3 bg-slate-100 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-8">
          <a href="#" className="inline-flex px-6 py-3 rounded-lg font-medium" style={{ backgroundColor: `${brandColor}15`, color: brandColor }}>
            Xem tất cả
          </a>
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
