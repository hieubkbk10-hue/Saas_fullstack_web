'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Briefcase, Loader2, ArrowRight, Eye } from 'lucide-react';

// Helper to strip HTML tags from description
const stripHtml = (html?: string) => {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '').trim();
};

type ServiceListStyle = 'grid' | 'list' | 'carousel';

interface ServiceListSectionProps {
  config: Record<string, unknown>;
  brandColor: string;
  title: string;
}

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
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-center min-h-[200px]">
          <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
        </div>
      </section>
    );
  }

  // No services state
  if (services.length === 0) {
    return (
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">{title}</h2>
          <p className="text-slate-500">Chưa có dịch vụ nào.</p>
        </div>
      </section>
    );
  }

  // Format price
  const formatPrice = (price?: number) => {
    if (!price) return 'Liên hệ';
    return price.toLocaleString('vi-VN') + 'đ';
  };

  // Style 1: Grid
  if (style === 'grid') {
    return (
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-slate-900">{title}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {services.slice(0, 8).map((service) => (
              <Link key={service._id} href={`/services/${service.slug}`} className="group">
                <article className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border h-full flex flex-col">
                  <div className="aspect-video bg-slate-100 overflow-hidden">
                    {service.thumbnail ? (
                      <img 
                        src={service.thumbnail} 
                        alt={service.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Briefcase size={48} className="text-slate-300" />
                      </div>
                    )}
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <span className="text-xs text-slate-500 mb-1">
                      {categoryMap.get(service.categoryId) || 'Dịch vụ'}
                    </span>
                    <h4 className="font-semibold text-sm line-clamp-2 flex-1 group-hover:text-blue-600 transition-colors">
                      {service.title}
                    </h4>
                    {service.excerpt && (
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1">{stripHtml(service.excerpt)}</p>
                    )}
                    <div className="mt-2 flex items-center justify-between">
                      <span className="font-bold text-sm" style={{ color: brandColor }}>
                        {formatPrice(service.price)}
                      </span>
                      {service.duration && (
                        <span className="text-xs text-slate-400">{service.duration}</span>
                      )}
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
          {showViewAll && (
            <div className="text-center mt-8">
              <Link 
                href="/services" 
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all hover:gap-3 group" 
                style={{ backgroundColor: `${brandColor}15`, color: brandColor }}
              >
                Xem tất cả
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          )}
        </div>
      </section>
    );
  }

  // Style 2: List
  if (style === 'list') {
    return (
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-slate-900">{title}</h2>
          <div className="space-y-4">
            {services.slice(0, 6).map((service) => (
              <Link key={service._id} href={`/services/${service.slug}`} className="group block">
                <article className="bg-white rounded-xl border flex items-center p-4 gap-4 hover:shadow-md transition-shadow">
                  <div className="w-24 h-16 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                    {service.thumbnail ? (
                      <img 
                        src={service.thumbnail} 
                        alt={service.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Briefcase size={24} className="text-slate-300" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs text-slate-500">
                      {categoryMap.get(service.categoryId) || 'Dịch vụ'}
                    </span>
                    <h4 className="font-semibold group-hover:text-blue-600 transition-colors line-clamp-1">
                      {service.title}
                    </h4>
                    {service.excerpt && (
                      <p className="text-sm text-slate-500 line-clamp-1 mt-0.5">{stripHtml(service.excerpt)}</p>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="font-bold" style={{ color: brandColor }}>
                      {formatPrice(service.price)}
                    </div>
                    {service.duration && (
                      <div className="text-xs text-slate-400">{service.duration}</div>
                    )}
                  </div>
                </article>
              </Link>
            ))}
          </div>
          {showViewAll && (
            <div className="text-center mt-8">
              <Link 
                href="/services" 
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all hover:gap-3 group" 
                style={{ backgroundColor: `${brandColor}15`, color: brandColor }}
              >
                Xem tất cả
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          )}
        </div>
      </section>
    );
  }

  // Style 3: Carousel
  return (
    <section className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-slate-900">{title}</h2>
          {showViewAll && (
            <Link 
              href="/services" 
              className="text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all group" 
              style={{ color: brandColor }}
            >
              Xem tất cả
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          )}
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {services.slice(0, 8).map((service) => (
            <Link key={service._id} href={`/services/${service.slug}`} className="group flex-shrink-0 w-64">
              <article className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border">
                <div className="aspect-video bg-slate-100 overflow-hidden">
                  {service.thumbnail ? (
                    <img 
                      src={service.thumbnail} 
                      alt={service.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Briefcase size={32} className="text-slate-300" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h4 className="font-semibold line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {service.title}
                  </h4>
                  {service.excerpt && (
                    <p className="text-sm text-slate-500 line-clamp-2 mt-1">{stripHtml(service.excerpt)}</p>
                  )}
                  <div className="mt-3 flex items-center justify-between">
                    <span className="font-bold" style={{ color: brandColor }}>
                      {formatPrice(service.price)}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Eye size={12} />
                      {service.views}
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
