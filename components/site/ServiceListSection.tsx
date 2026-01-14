'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Briefcase, Loader2, ArrowRight, ArrowUpRight, Plus } from 'lucide-react';

// Luxury Services Gallery UI/UX - 6 Variants (added minimal & showcase)
type ServiceListStyle = 'grid' | 'bento' | 'list' | 'carousel' | 'minimal' | 'showcase';

interface ServiceListSectionProps {
  config: Record<string, unknown>;
  brandColor: string;
  title: string;
}

// Helper to strip HTML tags from description
const stripHtml = (html?: string) => {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '').trim();
};

// Format price helper (monochromatic style)
const formatServicePrice = (price?: number) => {
  if (!price || price === 0) return 'Liên hệ';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(price);
};

// Badge component for service status (uses brandColor for hot)
const ServiceBadge = ({ isNew, isHot, brandColor }: { isNew?: boolean; isHot?: boolean; brandColor?: string }) => {
  if (!isNew && !isHot) return null;
  if (isHot) {
    return (
      <span 
        className="inline-flex items-center rounded-sm px-2 py-1 text-[10px] font-medium uppercase tracking-widest text-white"
        style={{ backgroundColor: brandColor || '#1e293b' }}
      >
        Hot
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-sm px-2 py-1 text-[10px] font-medium uppercase tracking-widest bg-slate-200 text-slate-700">
      New
    </span>
  );
};

export function ServiceListSection({ config, brandColor, title }: ServiceListSectionProps) {
  const style = (config.style as ServiceListStyle) || 'grid';
  const itemCount = (config.itemCount as number) || 8;
  const selectionMode = (config.selectionMode as 'auto' | 'manual') || 'auto';
  const selectedServiceIds = (config.selectedServiceIds as string[]) || [];
  
  // Query services based on selection mode
  const servicesData = useQuery(
    api.services.listAll, 
    selectionMode === 'auto' ? { limit: Math.min(itemCount, 20) } : { limit: 100 }
  );
  
  // Query categories for mapping
  const categories = useQuery(api.serviceCategories.listActive, { limit: 50 });
  
  // Build category map for O(1) lookup
  const categoryMap = React.useMemo(() => {
    if (!categories) return new Map<string, string>();
    return new Map(categories.map(c => [c._id, c.name]));
  }, [categories]);

  // Get services to display based on selection mode
  const services = React.useMemo(() => {
    if (!servicesData) return [];
    
    if (selectionMode === 'manual' && selectedServiceIds.length > 0) {
      const serviceMap = new Map(servicesData.map(s => [s._id, s]));
      return selectedServiceIds
        .map(id => serviceMap.get(id as Id<"services">))
        .filter((s): s is NonNullable<typeof s> => s !== undefined && s.status === 'Published');
    }
    
    return servicesData.filter(s => s.status === 'Published').slice(0, itemCount);
  }, [servicesData, selectionMode, selectedServiceIds, itemCount]);

  const showViewAll = services.length >= 3;

  // Loading state
  if (servicesData === undefined) {
    return (
      <section className="py-12 md:py-16 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-center min-h-[200px]">
          <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
        </div>
      </section>
    );
  }

  // No services state
  if (services.length === 0) {
    return (
      <section className="py-12 md:py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-light tracking-tight text-slate-900 mb-4">{title}</h2>
          <p className="text-slate-500">Chưa có dịch vụ nào.</p>
        </div>
      </section>
    );
  }

  // Style 1: Grid - Clean cards với hover lift và arrow icon
  if (style === 'grid') {
    return (
      <section className="py-12 md:py-16 px-3 md:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-row items-center justify-between gap-3 border-b border-slate-200/40 pb-3 mb-6">
            <h2 className="text-xl md:text-2xl lg:text-3xl font-light tracking-tight text-slate-900">
              {title}
            </h2>
            {showViewAll && (
              <Link 
                href="/services" 
                className="group flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors"
              >
                Xem tất cả 
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            )}
          </div>
          
          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {services.slice(0, 6).map((service, idx) => (
              <Link key={service._id} href={`/services/${service.slug}`} className="group">
                <article className="cursor-pointer relative bg-white flex flex-col hover:-translate-y-1 transition-all duration-300 h-full">
                  {/* Badge */}
                  {idx < 2 && (
                    <div className="absolute z-20 top-3 left-3">
                      <ServiceBadge isHot={idx === 0} isNew={idx === 1} brandColor={brandColor} />
                    </div>
                  )}

                  {/* Image Container */}
                  <div className="relative overflow-hidden bg-slate-100 mb-3 rounded-lg aspect-[4/3] w-full">
                    {service.thumbnail ? (
                      <img 
                        src={service.thumbnail} 
                        alt={service.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Briefcase size={32} className="text-slate-300" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex flex-col justify-between flex-shrink-0 pt-1">
                    <h3 className="font-medium text-base text-slate-900 leading-tight group-hover:opacity-70 transition-colors line-clamp-2">
                      {service.title}
                    </h3>

                    <div className="flex items-end justify-between mt-3">
                      <span className="text-sm font-semibold tracking-wide text-slate-700">
                        {formatServicePrice(service.price)}
                      </span>
                      <ArrowUpRight className="w-4 h-4 text-slate-400 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Style 2: Bento - Asymmetric grid với featured large card
  if (style === 'bento') {
    const bentoServices = services.slice(0, 4);
    const remainingCount = services.length - 4;
    
    return (
      <section className="py-12 md:py-16 px-3 md:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-row items-center justify-between gap-3 border-b border-slate-200/40 pb-3 mb-6">
            <h2 className="text-xl md:text-2xl lg:text-3xl font-light tracking-tight text-slate-900">
              {title}
            </h2>
            {showViewAll && (
              <Link 
                href="/services" 
                className="group flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors"
              >
                Xem tất cả 
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            )}
          </div>
          
          {/* Bento Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:auto-rows-[300px]">
            {bentoServices.map((service, i) => {
              const isLastItem = i === 3;
              
              return (
                <Link 
                  key={service._id}
                  href={`/services/${service.slug}`}
                  className={`h-full min-h-[200px] md:min-h-0 relative group/bento ${
                    i === 0 ? 'md:col-span-2 md:row-span-2' : ''
                  } ${i === 3 ? 'md:col-span-2' : ''}`}
                >
                  <article className="h-full border border-slate-200/40 rounded-xl p-3 md:p-4 hover:shadow-md hover:border-slate-300 transition-all flex flex-col cursor-pointer">
                    {/* Badge */}
                    {i < 2 && (
                      <div className="absolute z-20 top-5 left-5 md:top-6 md:left-6">
                        <ServiceBadge isHot={i === 0} isNew={i === 1} brandColor={brandColor} />
                      </div>
                    )}
                    
                    {/* Image */}
                    <div className="flex-1 min-h-[100px] md:min-h-[160px] w-full rounded-lg overflow-hidden bg-slate-100 mb-3">
                      {service.thumbnail ? (
                        <img 
                          src={service.thumbnail} 
                          alt={service.title}
                          className="w-full h-full object-cover group-hover/bento:scale-105 transition-transform duration-700 ease-out"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Briefcase size={i === 0 ? 48 : 28} className="text-slate-300" />
                        </div>
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="space-y-1">
                      <h3 className={`font-medium text-slate-900 leading-tight group-hover/bento:opacity-70 transition-colors line-clamp-2 ${
                        i === 0 ? 'text-base md:text-lg' : 'text-sm md:text-base'
                      }`}>
                        {service.title}
                      </h3>
                      {i === 0 && service.excerpt && (
                        <p className="text-sm text-slate-500 line-clamp-2 mt-1 hidden md:block">
                          {stripHtml(service.excerpt)}
                        </p>
                      )}
                      <div className="flex items-end justify-between mt-2">
                        <span className="text-sm font-semibold tracking-wide text-slate-700">
                          {formatServicePrice(service.price)}
                        </span>
                        <ArrowUpRight className="w-4 h-4 text-slate-400 opacity-0 -translate-x-2 group-hover/bento:opacity-100 group-hover/bento:translate-x-0 transition-all duration-300" />
                      </div>
                    </div>
                  </article>
                  
                  {/* "+N more" overlay on last item */}
                  {isLastItem && remainingCount > 0 && (
                    <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-[2px] rounded-xl flex items-center justify-center cursor-pointer transition-opacity opacity-100 md:opacity-0 md:group-hover/bento:opacity-100 z-30">
                      <div className="text-white text-center">
                        <span className="text-3xl md:text-4xl font-light flex items-center justify-center gap-1">
                          <Plus className="w-6 h-6 md:w-8 md:h-8" />{remainingCount}
                        </span>
                        <p className="text-sm font-medium mt-1">Dịch vụ khác</p>
                      </div>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    );
  }

  // Style 3: List - Horizontal row layout với divider
  if (style === 'list') {
    return (
      <section className="py-12 md:py-16 px-3 md:px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex flex-row items-center justify-between gap-3 border-b border-slate-200/40 pb-3 mb-6">
            <h2 className="text-xl md:text-2xl lg:text-3xl font-light tracking-tight text-slate-900">
              {title}
            </h2>
            {showViewAll && (
              <Link 
                href="/services" 
                className="group flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors"
              >
                Xem tất cả 
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            )}
          </div>
          
          {/* List */}
          <div className="flex flex-col gap-2">
            {services.slice(0, 6).map((service, idx) => (
              <Link key={service._id} href={`/services/${service.slug}`} className="group block">
                <article className="cursor-pointer flex flex-row items-center gap-4 md:gap-6 py-4 border-b border-slate-200/40 hover:bg-slate-50 px-2 rounded-lg transition-all">
                  {/* Image */}
                  <div className="flex-shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-md overflow-hidden bg-slate-100">
                    {service.thumbnail ? (
                      <img 
                        src={service.thumbnail} 
                        alt={service.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Briefcase size={24} className="text-slate-300" />
                      </div>
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className="py-1 flex-1">
                    {idx < 2 && (
                      <div className="mb-1">
                        <ServiceBadge isHot={idx === 0} isNew={idx === 1} brandColor={brandColor} />
                      </div>
                    )}
                    <h3 className="font-medium text-base md:text-lg text-slate-900 leading-tight group-hover:opacity-70 transition-colors line-clamp-2">
                      {service.title}
                    </h3>
                    <div className="flex items-end justify-between mt-2">
                      <span className="text-sm font-semibold tracking-wide text-slate-700">
                        {formatServicePrice(service.price)}
                      </span>
                      <ArrowUpRight className="w-4 h-4 text-slate-400 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Style 4: Carousel - Horizontal scroll với snap
  if (style === 'carousel') {
    return (
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-row items-center justify-between gap-3 border-b border-slate-200/40 pb-3 mb-6 px-3 md:px-6">
            <h2 className="text-xl md:text-2xl lg:text-3xl font-light tracking-tight text-slate-900">{title}</h2>
            {showViewAll && (
              <Link href="/services" className="group flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors">
                Xem tất cả <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            )}
          </div>
          {/* Carousel Container */}
          <div className="flex gap-4 overflow-x-auto pb-4 px-3 md:px-6 snap-x snap-mandatory scroll-smooth" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}>
            {services.slice(0, 8).map((service, idx) => (
              <Link key={service._id} href={`/services/${service.slug}`} className="snap-start flex-shrink-0 w-[75vw] sm:w-[280px]">
                <article className="group cursor-pointer relative bg-white flex flex-col hover:-translate-y-1 transition-all duration-300 h-full">
                  {idx < 2 && <div className="absolute z-20 top-3 left-3"><ServiceBadge isHot={idx === 0} isNew={idx === 1} brandColor={brandColor} /></div>}
                  <div className="relative overflow-hidden bg-slate-100 mb-3 rounded-lg aspect-[4/3] w-full">
                    {service.thumbnail ? (
                      <img src={service.thumbnail} alt={service.title} draggable={false} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><Briefcase size={32} className="text-slate-300" /></div>
                    )}
                  </div>
                  <div className="flex flex-col justify-between flex-shrink-0 pt-1">
                    <h3 className="font-medium text-base text-slate-900 leading-tight group-hover:opacity-70 transition-colors line-clamp-2">{service.title}</h3>
                    <div className="flex items-end justify-between mt-3">
                      <span className="text-sm font-semibold tracking-wide text-slate-700">{formatServicePrice(service.price)}</span>
                      <ArrowUpRight className="w-4 h-4 text-slate-400 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                    </div>
                  </div>
                </article>
              </Link>
            ))}
            <div className="snap-start flex-shrink-0 w-3 md:w-6" aria-hidden="true" />
          </div>
        </div>
      </section>
    );
  }

  // Style 5: Minimal - Clean typography-first design
  if (style === 'minimal') {
    return (
      <section className="py-12 md:py-16 px-3 md:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-row items-center justify-between gap-3 border-b border-slate-200/40 pb-3 mb-8">
            <h2 className="text-xl md:text-2xl lg:text-3xl font-light tracking-tight text-slate-900">{title}</h2>
            {showViewAll && (
              <Link href="/services" className="group flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors">
                Xem tất cả <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            )}
          </div>
          {/* Minimal Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.slice(0, 6).map((service, idx) => (
              <Link key={service._id} href={`/services/${service.slug}`} className="group">
                <article className="cursor-pointer">
                  {/* Image - More minimal, rounded corners */}
                  <div className="relative overflow-hidden bg-slate-100 rounded-2xl aspect-[3/2] mb-5">
                    {service.thumbnail ? (
                      <img src={service.thumbnail} alt={service.title} className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><Briefcase size={40} className="text-slate-300" /></div>
                    )}
                    {idx < 2 && <div className="absolute top-3 left-3"><ServiceBadge isHot={idx === 0} isNew={idx === 1} brandColor={brandColor} /></div>}
                  </div>
                  {/* Content - Typography focused */}
                  <div className="space-y-2">
                    <h3 className="font-medium text-lg text-slate-900 leading-snug group-hover:text-slate-600 transition-colors line-clamp-2">{service.title}</h3>
                    {service.excerpt && <p className="text-sm text-slate-500 line-clamp-2">{stripHtml(service.excerpt)}</p>}
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-base font-semibold text-slate-800">{formatServicePrice(service.price)}</span>
                      <span className="text-sm text-slate-400 group-hover:text-slate-600 transition-colors flex items-center gap-1">
                        Chi tiết <ArrowUpRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Style 6: Showcase - Featured large item + grid of smaller items (default fallback)
  const featuredService = services[0];
  const otherServices = services.slice(1, 5);
  
  return (
    <section className="py-12 md:py-16 px-3 md:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-row items-center justify-between gap-3 border-b border-slate-200/40 pb-3 mb-8">
          <h2 className="text-xl md:text-2xl lg:text-3xl font-light tracking-tight text-slate-900">{title}</h2>
          {showViewAll && (
            <Link href="/services" className="group flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors">
              Xem tất cả <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          )}
        </div>
        
        {/* Showcase Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Featured Large Item */}
          {featuredService && (
            <Link href={`/services/${featuredService.slug}`} className="lg:row-span-2 group">
              <article className="cursor-pointer relative rounded-2xl overflow-hidden h-full min-h-[300px] lg:min-h-[500px]" style={{ boxShadow: `0 8px 30px ${brandColor}20` }}>
                {featuredService.thumbnail ? (
                  <img src={featuredService.thumbnail} alt={featuredService.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" />
                ) : (
                  <div className="absolute inset-0 w-full h-full bg-slate-100 flex items-center justify-center"><Briefcase size={64} className="text-slate-300" /></div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute top-4 left-4"><ServiceBadge isHot={true} brandColor={brandColor} /></div>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <span className="text-xs uppercase tracking-wider font-medium" style={{ color: `${brandColor}cc` }}>Dịch vụ nổi bật</span>
                  <h3 className="text-xl md:text-2xl font-semibold text-white mt-2 leading-tight line-clamp-2">{featuredService.title}</h3>
                  {featuredService.excerpt && <p className="text-sm text-white/80 mt-2 line-clamp-2">{stripHtml(featuredService.excerpt)}</p>}
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-lg font-semibold text-white">{formatServicePrice(featuredService.price)}</span>
                    <span className="px-5 py-2.5 text-white text-sm font-medium rounded-lg whitespace-nowrap transition-all hover:opacity-90" style={{ backgroundColor: brandColor, boxShadow: `0 4px 12px ${brandColor}40` }}>Xem chi tiết</span>
                  </div>
                </div>
              </article>
            </Link>
          )}
          
          {/* Right Grid - 2x2 */}
          <div className="lg:col-span-2 grid grid-cols-2 gap-3">
            {otherServices.map((service, idx) => (
              <Link key={service._id} href={`/services/${service.slug}`} className="group">
                <article 
                  className="cursor-pointer bg-white border rounded-xl p-3 transition-all h-full hover:shadow-md" 
                  style={{ borderColor: `${brandColor}15` }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = `${brandColor}40`; (e.currentTarget as HTMLElement).style.boxShadow = `0 4px 12px ${brandColor}10`; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = `${brandColor}15`; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}
                >
                  <div className="relative overflow-hidden bg-slate-100 rounded-lg aspect-[4/3] mb-3">
                    {service.thumbnail ? (
                      <img src={service.thumbnail} alt={service.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><Briefcase size={28} className="text-slate-300" /></div>
                    )}
                    {idx === 0 && <div className="absolute top-2 left-2"><ServiceBadge isNew={true} brandColor={brandColor} /></div>}
                  </div>
                  <h4 className="font-medium text-sm text-slate-900 line-clamp-1 group-hover:text-slate-600 transition-colors">{service.title}</h4>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm font-semibold" style={{ color: brandColor }}>{formatServicePrice(service.price)}</span>
                    <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: brandColor }} />
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
