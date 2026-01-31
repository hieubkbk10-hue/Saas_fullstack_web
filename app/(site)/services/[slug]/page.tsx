'use client';

import React, { use, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useBrandColor } from '@/components/site/hooks';
import { QuickContactButtons, QuickContactCompact } from '@/components/site/QuickContact';
import { ArrowLeft, ArrowRight, Briefcase, Calendar, CheckCircle2, ChevronRight, Clock, Copy, Eye, Star } from 'lucide-react';
import type { Id } from '@/convex/_generated/dataModel';

type ServiceDetailStyle = 'classic' | 'modern' | 'minimal';

function useServiceDetailStyle(): ServiceDetailStyle {
  const setting = useQuery(api.settings.getByKey, { key: 'services_detail_style' });
  return (setting?.value as ServiceDetailStyle) || 'classic';
}

function useEnabledServiceFields(): Set<string> {
  const fields = useQuery(api.admin.modules.listEnabledModuleFields, { moduleKey: 'services' });
  return useMemo(() => {
    if (!fields) {return new Set<string>();}
    return new Set(fields.map(f => f.fieldKey));
  }, [fields]);
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function ServiceDetailPage({ params }: PageProps) {
  const { slug } = use(params);
  const brandColor = useBrandColor();
  const style = useServiceDetailStyle();
  const enabledFields = useEnabledServiceFields();
  
  const service = useQuery(api.services.getBySlug, { slug });
  const category = useQuery(
    api.serviceCategories.getById,
    service?.categoryId ? { id: service.categoryId } : 'skip'
  );
  const incrementViews = useMutation(api.services.incrementViews);
  
  const relatedServices = useQuery(
    api.services.searchPublished,
    service?.categoryId ? { categoryId: service.categoryId, limit: 4 } : 'skip'
  );

  useEffect(() => {
    if (service?._id) {
      void incrementViews({ id: service._id });
    }
  }, [service?._id, incrementViews]);

  if (service === undefined) {
    return <ServiceDetailSkeleton />;
  }

  if (service === null) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-slate-100 flex items-center justify-center">
            <Briefcase size={32} className="text-slate-400" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Không tìm thấy dịch vụ</h1>
          <p className="text-slate-500 mb-8 max-w-sm mx-auto">Dịch vụ này không tồn tại hoặc đã bị xóa khỏi hệ thống.</p>
          <Link
            href="/services"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-white font-medium transition-all hover:shadow-lg hover:scale-105"
            style={{ backgroundColor: brandColor }}
          >
            <ArrowLeft size={18} />
            Xem tất cả dịch vụ
          </Link>
        </div>
      </div>
    );
  }

  const filteredRelated = relatedServices?.filter(s => s._id !== service._id).slice(0, 3) ?? [];
  const serviceData = { ...service, categoryName: category?.name ?? 'Dịch vụ' };

  return (
    <>
      {style === 'classic' && <ClassicStyle service={serviceData} brandColor={brandColor} relatedServices={filteredRelated} enabledFields={enabledFields} />}
      {style === 'modern' && <ModernStyle service={serviceData} brandColor={brandColor} relatedServices={filteredRelated} enabledFields={enabledFields} />}
      {style === 'minimal' && <MinimalStyle service={serviceData} brandColor={brandColor} relatedServices={filteredRelated} enabledFields={enabledFields} />}
    </>
  );
}

interface ServiceData {
  _id: Id<"services">;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  thumbnail?: string;
  categoryId: Id<"serviceCategories">;
  categoryName: string;
  price?: number;
  duration?: string;
  views: number;
  publishedAt?: number;
  featured?: boolean;
}

interface RelatedService {
  _id: Id<"services">;
  title: string;
  slug: string;
  thumbnail?: string;
  price?: number;
}

interface StyleProps {
  service: ServiceData;
  brandColor: string;
  relatedServices: RelatedService[];
  enabledFields: Set<string>;
}

function formatPrice(price?: number): string {
  if (!price) {return 'Liên hệ';}
  return new Intl.NumberFormat('vi-VN', { currency: 'VND', style: 'currency' }).format(price);
}

function formatDate(timestamp?: number): string {
  if (!timestamp) {return '';}
  return new Date(timestamp).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// ====================================================================================
// STYLE 1: CLASSIC - Professional service page with sticky CTA sidebar
// Best for: Business services, consulting, professional services
// ====================================================================================
function ClassicStyle({ service, brandColor, relatedServices, enabledFields }: StyleProps) {
  const showPrice = enabledFields.has('price');
  const showDuration = enabledFields.has('duration');
  const showFeatured = enabledFields.has('featured');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (typeof window === 'undefined' || !navigator.clipboard) {return;}
    const url = window.location.href;
    navigator.clipboard.writeText(url)
      .then(() => {
        setCopied(true);
        window.setTimeout(() => { setCopied(false); }, 1500);
      })
      .catch(() => { setCopied(false); });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb - Simple navigation */}
      <div className="border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-xs md:text-sm text-slate-400">
            <Link href="/" className="hover:text-slate-900 transition-colors">Trang chủ</Link>
            <ChevronRight size={14} />
            <Link href="/services" className="hover:text-slate-900 transition-colors">Dịch vụ</Link>
            <ChevronRight size={14} />
            <span className="text-slate-700 font-medium truncate max-w-[200px]">{service.title}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="lg:grid lg:grid-cols-4 lg:gap-12">
          {/* Main Content - 3/4 width */}
          <div className="lg:col-span-3">
            {/* Hero Section */}
            <header className="mb-8">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {showFeatured && service.featured && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 text-sm font-medium rounded-full">
                    <Star size={14} className="fill-amber-400 text-amber-400" />
                    Dịch vụ nổi bật
                  </span>
                )}
                <Link 
                  href={`/services?category=${service.categoryId}`}
                  className="px-3 py-1 text-sm font-medium rounded-full transition-colors hover:opacity-80"
                  style={{ backgroundColor: `${brandColor}10`, color: brandColor }}
                >
                  {service.categoryName}
                </Link>
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight mb-4">
                {service.title}
              </h1>
              
              {service.excerpt && (
                <p className="text-lg text-slate-600 leading-relaxed max-w-[60ch]">
                  {service.excerpt}
                </p>
              )}

              {/* Meta info */}
              <div className="flex flex-wrap items-center gap-4 mt-6 pt-6 border-t border-slate-100">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Eye size={16} />
                  <span>{service.views.toLocaleString()} lượt xem</span>
                </div>
                {service.publishedAt && (
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Calendar size={16} />
                    <span>{formatDate(service.publishedAt)}</span>
                  </div>
                )}
                {showDuration && service.duration && (
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Clock size={16} />
                    <span>{service.duration}</span>
                  </div>
                )}
              </div>
            </header>

            {/* Featured Image */}
            {service.thumbnail && (
              <div className="mb-8 rounded-2xl overflow-hidden bg-slate-100 relative aspect-[16/9]">
                <Image
                  src={service.thumbnail}
                  alt={service.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 800px"
                  className="object-cover"
                />
              </div>
            )}

            {/* Quick Contact */}
            <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Liên hệ nhanh</p>
                  <p className="text-sm text-slate-600 mt-1">Tư vấn miễn phí và báo giá trong 24h.</p>
                </div>
                {showPrice && (
                  <div className="text-xl font-bold" style={{ color: brandColor }}>
                    {formatPrice(service.price)}
                  </div>
                )}
              </div>
              <div className="mt-5">
                <QuickContactButtons 
                  serviceName={service.title}
                  brandColor={brandColor}
                  variant="horizontal"
                />
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <CheckCircle2 size={18} className="text-green-500 shrink-0" />
                  <span>Tư vấn miễn phí</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <CheckCircle2 size={18} className="text-green-500 shrink-0" />
                  <span>Hỗ trợ 24/7</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <CheckCircle2 size={18} className="text-green-500 shrink-0" />
                  <span>Cam kết chất lượng</span>
                </div>
              </div>
            </div>

            {/* Content */}
            <article className="prose prose-slate prose-lg max-w-none prose-headings:font-bold prose-headings:text-slate-900 prose-p:text-slate-600 prose-p:leading-relaxed prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl prose-strong:text-slate-900">
              <div dangerouslySetInnerHTML={{ __html: service.content }} />
            </article>

            {/* Share & Actions */}
            <div className="mt-12 pt-8 border-t border-slate-200">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-slate-500">Chia sẻ:</span>
                  <button
                    type="button"
                    aria-label="Copy dịch vụ"
                    onClick={handleCopy}
                    className="inline-flex items-center gap-2 min-h-11 px-4 rounded-full bg-slate-100 hover:bg-slate-200 text-sm font-medium text-slate-700 transition-colors"
                  >
                    <Copy size={16} />
                    {copied ? 'Đã copy' : 'Copy dịch vụ'}
                  </button>
                </div>
                <Link 
                  href="/services"
                  className="inline-flex items-center gap-2 text-sm font-medium transition-colors hover:opacity-80"
                  style={{ color: brandColor }}
                >
                  <ArrowLeft size={16} />
                  Xem tất cả dịch vụ
                </Link>
              </div>
            </div>
          </div>

          {/* Sidebar - 1/4 width */}
          <div className="mt-8 lg:mt-0">
            <div className="lg:sticky lg:top-8 space-y-6">
              {/* Related Services */}
              {relatedServices.length > 0 && (
                <div className="bg-slate-50 rounded-2xl p-6">
                  <h3 className="font-bold text-slate-900 mb-4">Dịch vụ liên quan</h3>
                  <div className="space-y-4">
                    {relatedServices.map(s => (
                      <Link 
                        key={s._id} 
                        href={`/services/${s.slug}`}
                        className="flex gap-4 group"
                      >
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-white shrink-0 relative">
                          {s.thumbnail ? (
                            <Image src={s.thumbnail} alt={s.title} fill sizes="64px" className="object-cover group-hover:scale-110 transition-transform duration-300" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: `${brandColor}10` }}>
                              <Briefcase size={20} style={{ color: brandColor }} />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-slate-900 text-sm line-clamp-2 group-hover:opacity-70 transition-opacity">
                            {s.title}
                          </h4>
                          {showPrice && (
                            <p className="text-sm font-semibold mt-1" style={{ color: brandColor }}>
                              {formatPrice(s.price)}
                            </p>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ====================================================================================
// STYLE 2: MODERN - Landing page style with full-width hero and floating CTA
// Best for: Marketing services, digital agencies, creative services
// ====================================================================================
function ModernStyle({ service, brandColor, relatedServices, enabledFields }: StyleProps) {
  const showPrice = enabledFields.has('price');
  const showDuration = enabledFields.has('duration');
  const showFeatured = enabledFields.has('featured');

  return (
    <div className="min-h-screen bg-white">
      {/* Full-width Hero Section */}
      <section className="relative overflow-hidden" style={{ backgroundColor: `${brandColor}08` }}>
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: `radial-gradient(circle at 20% 50%, ${brandColor}20 0%, transparent 50%), radial-gradient(circle at 80% 50%, ${brandColor}15 0%, transparent 50%)` }} />
        
        <div className="relative max-w-6xl mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              {showFeatured && service.featured && (
                <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-amber-400 text-amber-900 text-sm font-semibold rounded-full shadow-sm">
                  <Star size={14} className="fill-current" />
                  Nổi bật
                </span>
              )}
              <span className="px-4 py-1.5 bg-white/80 backdrop-blur-sm text-sm font-medium rounded-full shadow-sm" style={{ color: brandColor }}>
                {service.categoryName}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight mb-6">
              {service.title}
            </h1>

            {/* Excerpt */}
            {service.excerpt && (
              <p className="text-xl text-slate-600 leading-relaxed mb-8 max-w-2xl">
                {service.excerpt}
              </p>
            )}

            {/* Price & CTA Row */}
            <div className="flex flex-wrap items-center gap-6">
              {showPrice && (
                <div>
                  <p className="text-sm text-slate-500 mb-1">Chỉ từ</p>
                  <p className="text-4xl font-bold" style={{ color: brandColor }}>
                    {formatPrice(service.price)}
                  </p>
                </div>
              )}
              <QuickContactButtons 
                serviceName={service.title}
                brandColor={brandColor}
                variant="horizontal"
              />
            </div>

            {/* Stats Row */}
            <div className="flex flex-wrap items-center gap-8 mt-10 pt-10 border-t border-slate-200/50">
              <div className="flex items-center gap-2">
                <Eye size={20} className="text-slate-400" />
                <span className="text-slate-600"><strong className="text-slate-900">{service.views.toLocaleString()}</strong> lượt xem</span>
              </div>
              {showDuration && service.duration && (
                <div className="flex items-center gap-2">
                  <Clock size={20} className="text-slate-400" />
                  <span className="text-slate-600">Hoàn thành trong <strong className="text-slate-900">{service.duration}</strong></span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Image - Edge to edge on mobile */}
      {service.thumbnail && (
        <div className="max-w-5xl mx-auto px-4 -mt-8 relative z-10">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-[16/9]">
            <Image
              src={service.thumbnail}
              alt={service.title}
              fill
              sizes="(max-width: 1024px) 100vw, 800px"
              className="object-cover"
            />
          </div>
        </div>
      )}

      {/* Content Section */}
      <section className="max-w-3xl mx-auto px-4 py-16 md:py-24">
        <article className="prose prose-lg prose-slate max-w-none prose-headings:font-bold prose-headings:text-slate-900 prose-p:text-slate-600 prose-p:leading-relaxed prose-a:no-underline hover:prose-a:underline prose-img:rounded-2xl prose-strong:text-slate-900" style={{ '--tw-prose-links': brandColor } as React.CSSProperties}>
          <div dangerouslySetInnerHTML={{ __html: service.content }} />
        </article>

        {/* Bottom CTA */}
        <div className="mt-16 p-8 rounded-3xl text-center" style={{ backgroundColor: `${brandColor}08` }}>
          <h3 className="text-2xl font-bold text-slate-900 mb-3">Sẵn sàng bắt đầu?</h3>
          <p className="text-slate-600 mb-6 max-w-md mx-auto">
            Liên hệ ngay để được tư vấn miễn phí và nhận báo giá chi tiết cho dự án của bạn.
          </p>
          <div className="flex justify-center">
            <QuickContactButtons 
              serviceName={service.title}
              brandColor={brandColor}
              variant="horizontal"
            />
          </div>
        </div>
      </section>

      {/* Related Services */}
      {relatedServices.length > 0 && (
        <section className="bg-slate-50 py-16">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-slate-900">Dịch vụ liên quan</h2>
              <Link 
                href="/services"
                className="text-sm font-medium flex items-center gap-1 transition-colors hover:opacity-80"
                style={{ color: brandColor }}
              >
                Xem tất cả
                <ArrowRight size={16} />
              </Link>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedServices.map((s) => (
                <Link 
                  key={s._id} 
                  href={`/services/${s.slug}`}
                  className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
                >
                  <div className="aspect-[16/10] overflow-hidden bg-slate-100 relative">
                    {s.thumbnail ? (
                      <Image
                        src={s.thumbnail}
                        alt={s.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: `${brandColor}10` }}>
                        <Briefcase size={32} style={{ color: brandColor }} />
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="font-semibold text-slate-900 mb-2 group-hover:opacity-70 transition-opacity">
                      {s.title}
                    </h3>
                    {showPrice && (
                      <p className="font-bold" style={{ color: brandColor }}>
                        {formatPrice(s.price)}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Back link */}
      <div className="max-w-6xl mx-auto px-4 py-8 border-t border-slate-100">
        <Link 
          href="/services"
          className="inline-flex items-center gap-2 text-sm font-medium transition-colors hover:opacity-80"
          style={{ color: brandColor }}
        >
          <ArrowLeft size={16} />
          Quay lại danh sách dịch vụ
        </Link>
      </div>
    </div>
  );
}

// ====================================================================================
// STYLE 3: MINIMAL - Clean, distraction-free reading experience
// Best for: Content-focused services, educational content, documentation
// ====================================================================================
function MinimalStyle({ service, brandColor, relatedServices, enabledFields }: StyleProps) {
  const showPrice = enabledFields.has('price');
  const showDuration = enabledFields.has('duration');
  const showFeatured = enabledFields.has('featured');

  return (
    <div className="min-h-screen bg-white">
      <article className="max-w-2xl mx-auto px-4 py-12 md:py-20">
        {/* Back Navigation */}
        <Link 
          href="/services"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-600 text-sm mb-12 transition-colors"
        >
          <ArrowLeft size={16} />
          Tất cả dịch vụ
        </Link>

        {/* Header */}
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            {showFeatured && service.featured && (
              <Star size={18} className="fill-amber-400 text-amber-400" />
            )}
            <span 
              className="text-sm font-medium uppercase tracking-wider"
              style={{ color: brandColor }}
            >
              {service.categoryName}
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 leading-tight mb-6">
            {service.title}
          </h1>

          {service.excerpt && (
            <p className="text-xl text-slate-500 leading-relaxed">
              {service.excerpt}
            </p>
          )}

          {/* Meta & Price */}
          <div className="flex flex-wrap items-center gap-6 mt-8 pt-8 border-t border-slate-100">
            {showPrice && (
              <div className="text-2xl font-bold" style={{ color: brandColor }}>
                {formatPrice(service.price)}
              </div>
            )}
            <div className="flex items-center gap-4 text-sm text-slate-400">
              {showDuration && service.duration && (
                <>
                  <span>{service.duration}</span>
                  <span>·</span>
                </>
              )}
              <span>{service.views.toLocaleString()} views</span>
              {service.publishedAt && (
                <>
                  <span>·</span>
                  <span>{formatDate(service.publishedAt)}</span>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Featured Image */}
        {service.thumbnail && (
          <figure className="mb-12">
            <div className="relative rounded-xl overflow-hidden aspect-[2/1]">
              <Image
                src={service.thumbnail}
                alt={service.title}
                fill
                sizes="(max-width: 1024px) 100vw, 800px"
                className="object-cover"
              />
            </div>
          </figure>
        )}

        {/* Content */}
        <div 
          className="prose prose-slate max-w-none prose-headings:font-semibold prose-headings:text-slate-900 prose-p:text-slate-600 prose-p:leading-relaxed prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl prose-blockquote:border-l-2 prose-blockquote:not-italic prose-blockquote:text-slate-600"
          style={{ '--tw-prose-links': brandColor, '--tw-prose-quote-borders': brandColor } as React.CSSProperties}
        >
          <div dangerouslySetInnerHTML={{ __html: service.content }} />
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-3 mb-8">
            <div className="w-16 h-px bg-slate-200" />
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: brandColor }} />
            <div className="w-16 h-px bg-slate-200" />
          </div>
          
          <p className="text-slate-500 mb-6">Quan tâm đến dịch vụ này?</p>
          
          <QuickContactCompact 
            serviceName={service.title}
            brandColor={brandColor}
            className="max-w-xs mx-auto"
          />
        </div>

        {/* Related Services */}
        {relatedServices.length > 0 && (
          <div className="mt-20 pt-12 border-t border-slate-100">
            <h3 className="text-xs font-medium uppercase tracking-wider text-slate-400 mb-8 text-center">
              Có thể bạn quan tâm
            </h3>
            <div className="space-y-1">
              {relatedServices.map((s, index) => (
                <Link 
                  key={s._id} 
                  href={`/services/${s.slug}`}
                  className="group flex items-center justify-between py-4 border-b border-slate-100 hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-slate-300 font-mono">{String(index + 1).padStart(2, '0')}</span>
                    <h4 className="font-medium text-slate-900 group-hover:opacity-70 transition-opacity">
                      {s.title}
                    </h4>
                  </div>
                  {showPrice && (
                    <span className="text-sm font-semibold" style={{ color: brandColor }}>
                      {formatPrice(s.price)}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>
    </div>
  );
}

// Skeleton Loading
function ServiceDetailSkeleton() {
  return (
    <div className="min-h-screen bg-white animate-pulse">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="h-4 w-24 bg-slate-200 rounded mb-12" />
        <div className="space-y-4 mb-8">
          <div className="h-3 w-20 bg-slate-200 rounded" />
          <div className="h-12 w-full bg-slate-200 rounded" />
          <div className="h-12 w-3/4 bg-slate-200 rounded" />
        </div>
        <div className="h-6 w-32 bg-slate-200 rounded mb-12" />
        <div className="aspect-[2/1] bg-slate-200 rounded-xl mb-12" />
        <div className="space-y-4">
          <div className="h-4 bg-slate-200 rounded w-full" />
          <div className="h-4 bg-slate-200 rounded w-5/6" />
          <div className="h-4 bg-slate-200 rounded w-full" />
          <div className="h-4 bg-slate-200 rounded w-4/6" />
        </div>
      </div>
    </div>
  );
}
