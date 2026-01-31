'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { QuickContactButtons, QuickContactCompact } from '@/components/site/QuickContact';
import { ArrowLeft, ArrowRight, Calendar, ChevronRight, Clock, Copy, Eye, Image as ImageIcon, Star } from 'lucide-react';
import type { Id } from '@/convex/_generated/dataModel';

export interface ServiceDetailData {
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

export interface RelatedService {
  _id: Id<"services">;
  title: string;
  slug: string;
  thumbnail?: string;
  price?: number;
}

export interface StyleProps {
  service: ServiceDetailData;
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

function FallbackServiceThumb({ brandColor }: { brandColor: string }) {
  return (
    <div
      className="w-full h-full flex items-center justify-center text-white"
      style={{
        background: `linear-gradient(135deg, ${brandColor}30, ${brandColor}80)`
      }}
    >
      <ImageIcon size={24} className="text-white/85" />
    </div>
  );
}

function RelatedServiceThumb({ title, thumbnail, brandColor, size }: { title: string; thumbnail?: string; brandColor: string; size: 'small' | 'large' }) {
  const [hasError, setHasError] = useState(false);
  if (!thumbnail || hasError) {
    return <FallbackServiceThumb brandColor={brandColor} />;
  }
  return (
    <Image
      src={thumbnail}
      alt={title}
      fill
      sizes={size === 'small' ? '64px' : '(max-width: 768px) 100vw, 33vw'}
      className={size === 'small' ? "object-cover group-hover:scale-110 transition-transform duration-300" : "object-cover group-hover:scale-110 transition-transform duration-500"}
      onError={() =>{  setHasError(true); }}
    />
  );
}

// STYLE 1: CLASSIC - Professional service page with sticky CTA sidebar
export function ClassicStyle({ service, brandColor, relatedServices, enabledFields }: StyleProps) {
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
          <div className="lg:col-span-3">
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

            <article className="prose prose-slate prose-lg max-w-none prose-headings:font-bold prose-headings:text-slate-900 prose-p:text-slate-600 prose-p:leading-relaxed prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl prose-strong:text-slate-900">
              <div dangerouslySetInnerHTML={{ __html: service.content }} />
            </article>

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

          <div className="mt-8 lg:mt-0">
            <div className="lg:sticky lg:top-8 space-y-6">
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
                          <RelatedServiceThumb title={s.title} thumbnail={s.thumbnail} brandColor={brandColor} size="small" />
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
              <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-700">Liên hệ nhanh</p>
                    <p className="text-xs text-slate-500">Tư vấn miễn phí, báo giá trong 24h.</p>
                  </div>
                  {showPrice && (
                    <div className="text-base font-semibold" style={{ color: brandColor }}>
                      {formatPrice(service.price)}
                    </div>
                  )}
                </div>
                <div className="mt-3">
                  <QuickContactButtons 
                    serviceName={service.title}
                    brandColor={brandColor}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// STYLE 2: MODERN - Landing page style with full-width hero and floating CTA
export function ModernStyle({ service, brandColor, relatedServices, enabledFields }: StyleProps) {
  const showPrice = enabledFields.has('price');
  const showDuration = enabledFields.has('duration');
  const showFeatured = enabledFields.has('featured');

  return (
    <div className="min-h-screen bg-white">
      <section className="relative overflow-hidden" style={{ backgroundColor: `${brandColor}08` }}>
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: `radial-gradient(circle at 20% 50%, ${brandColor}20 0%, transparent 50%), radial-gradient(circle at 80% 50%, ${brandColor}15 0%, transparent 50%)` }} />
        
        <div className="relative max-w-6xl mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl">
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

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight mb-6">
              {service.title}
            </h1>

            {service.excerpt && (
              <p className="text-xl text-slate-600 leading-relaxed mb-8 max-w-2xl">
                {service.excerpt}
              </p>
            )}

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
              />
            </div>

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

      <section className="max-w-3xl mx-auto px-4 py-16 md:py-24">
        <article className="prose prose-lg prose-slate max-w-none prose-headings:font-bold prose-headings:text-slate-900 prose-p:text-slate-600 prose-p:leading-relaxed prose-a:no-underline hover:prose-a:underline prose-img:rounded-2xl prose-strong:text-slate-900" style={{ '--tw-prose-links': brandColor } as React.CSSProperties}>
          <div dangerouslySetInnerHTML={{ __html: service.content }} />
        </article>

        <div className="mt-16 p-8 rounded-3xl text-center" style={{ backgroundColor: `${brandColor}08` }}>
          <h3 className="text-2xl font-bold text-slate-900 mb-3">Sẵn sàng bắt đầu?</h3>
          <p className="text-slate-600 mb-6 max-w-md mx-auto">
            Liên hệ ngay để được tư vấn miễn phí và nhận báo giá chi tiết cho dự án của bạn.
          </p>
          <div className="flex justify-center">
            <QuickContactButtons 
              serviceName={service.title}
              brandColor={brandColor}
            />
          </div>
        </div>
      </section>

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
                    <RelatedServiceThumb title={s.title} thumbnail={s.thumbnail} brandColor={brandColor} size="large" />
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

// STYLE 3: MINIMAL - Clean, distraction-free reading experience
export function MinimalStyle({ service, brandColor, relatedServices, enabledFields }: StyleProps) {
  const showPrice = enabledFields.has('price');
  const showDuration = enabledFields.has('duration');
  const showFeatured = enabledFields.has('featured');

  return (
    <div className="min-h-screen bg-white">
      <article className="max-w-2xl mx-auto px-4 py-12 md:py-20">
        <Link 
          href="/services"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-600 text-sm mb-12 transition-colors"
        >
          <ArrowLeft size={16} />
          Tất cả dịch vụ
        </Link>

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

        <div 
          className="prose prose-slate max-w-none prose-headings:font-semibold prose-headings:text-slate-900 prose-p:text-slate-600 prose-p:leading-relaxed prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl prose-blockquote:border-l-2 prose-blockquote:not-italic prose-blockquote:text-slate-600"
          style={{ '--tw-prose-links': brandColor, '--tw-prose-quote-borders': brandColor } as React.CSSProperties}
        >
          <div dangerouslySetInnerHTML={{ __html: service.content }} />
        </div>

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
