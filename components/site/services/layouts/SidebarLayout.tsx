'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Briefcase, Eye, Search, Clock, Folder, Star } from 'lucide-react';
import { Id } from '@/convex/_generated/dataModel';

interface Service {
  _id: Id<"services">;
  title: string;
  slug: string;
  excerpt?: string;
  thumbnail?: string;
  categoryId: Id<"serviceCategories">;
  price?: number;
  duration?: string;
  views: number;
  publishedAt?: number;
  featured?: boolean;
}

interface Category {
  _id: Id<"serviceCategories">;
  name: string;
  slug: string;
}

interface SidebarLayoutProps {
  services: Service[];
  brandColor: string;
  categoryMap: Map<string, string>;
  categories: Category[];
  selectedCategory: Id<"serviceCategories"> | null;
  onCategoryChange: (categoryId: Id<"serviceCategories"> | null) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  recentServices: Service[];
  popularServices: Service[];
  enabledFields: Set<string>;
}

function formatPrice(price?: number): string {
  if (!price) return 'Liên hệ';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}

export function SidebarLayout({
  services,
  brandColor,
  categoryMap,
  categories,
  selectedCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
  recentServices,
  popularServices,
  enabledFields,
}: SidebarLayoutProps) {
  const ringStyle = (style?: React.CSSProperties) =>
    ({ ...style, ['--tw-ring-color' as string]: brandColor } as React.CSSProperties);
  const showExcerpt = enabledFields.has('excerpt');
  const showPrice = enabledFields.has('price');
  const showDuration = enabledFields.has('duration');
  const showFeatured = enabledFields.has('featured');
  const [localSearch, setLocalSearch] = React.useState(searchQuery);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(localSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearch, onSearchChange]);

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Sidebar */}
      <aside className="lg:w-72 flex-shrink-0 order-2 lg:order-1">
        <div className="lg:sticky lg:top-24 space-y-4">
          {/* Search Widget */}
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <h3 className="font-semibold text-slate-900 text-sm mb-3 flex items-center gap-2">
              <Search size={16} style={{ color: brandColor }} />
              Tìm kiếm
            </h3>
            <label htmlFor="services-sidebar-search" className="sr-only">
              Tìm kiếm dịch vụ
            </label>
            <input
              id="services-sidebar-search"
              type="text"
              placeholder="Nhập từ khóa..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2"
              style={{ '--tw-ring-color': brandColor } as React.CSSProperties}
            />
          </div>

          {/* Categories Widget */}
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <h3 className="font-semibold text-slate-900 text-sm mb-3 flex items-center gap-2">
              <Folder size={16} style={{ color: brandColor }} />
              Danh mục
            </h3>
            <ul className="space-y-1">
              <li>
                <button
                  onClick={() => onCategoryChange(null)}
                  className={`w-full text-left px-3 py-2.5 rounded text-sm transition-colors min-h-11 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                    !selectedCategory ? 'font-medium' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                  style={
                    ringStyle(!selectedCategory ? { backgroundColor: `${brandColor}15`, color: brandColor } : undefined)
                  }
                >
                  Tất cả
                </button>
              </li>
              {categories.map((category) => (
                <li key={category._id}>
                  <button
                    onClick={() => onCategoryChange(category._id)}
                    className={`w-full text-left px-3 py-2.5 rounded text-sm transition-colors min-h-11 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                      selectedCategory === category._id ? 'font-medium' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                    style={
                      ringStyle(selectedCategory === category._id ? { backgroundColor: `${brandColor}15`, color: brandColor } : undefined)
                    }
                  >
                    {category.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Recent Services Widget */}
          {recentServices.length > 0 && (
            <div className="bg-white rounded-lg border border-slate-200 p-4">
              <h3 className="font-semibold text-slate-900 text-sm mb-3 flex items-center gap-2">
                <Clock size={16} style={{ color: brandColor }} />
                Dịch vụ mới
              </h3>
              <div className="space-y-3">
                {recentServices.slice(0, 4).map((service) => (
                  <Link
                    key={service._id}
                    href={`/services/${service.slug}`}
                    className="flex gap-2 group rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                    style={{ '--tw-ring-color': brandColor } as React.CSSProperties}
                  >
                    <div className="w-14 h-10 rounded bg-slate-100 overflow-hidden flex-shrink-0 relative">
                        {service.thumbnail ? (
                          <Image src={service.thumbnail} alt={service.title} fill sizes="64px" className="object-cover" />
                        ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Briefcase size={14} className="text-slate-300" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-medium text-slate-900 line-clamp-2 group-hover:opacity-70 transition-opacity duration-200">
                        {service.title}
                      </h4>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Popular Services Widget */}
          {popularServices.length > 0 && (
            <div className="bg-white rounded-lg border border-slate-200 p-4">
              <h3 className="font-semibold text-slate-900 text-sm mb-3 flex items-center gap-2">
                <Eye size={16} style={{ color: brandColor }} />
                Xem nhiều
              </h3>
              <div className="space-y-2">
                {popularServices.slice(0, 4).map((service, index) => (
                  <Link
                    key={service._id}
                    href={`/services/${service.slug}`}
                    className="flex gap-2 group rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                    style={{ '--tw-ring-color': brandColor } as React.CSSProperties}
                  >
                    <span
                      className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{ backgroundColor: `${brandColor}15`, color: brandColor }}
                    >
                      {index + 1}
                    </span>
                    <h4 className="text-xs font-medium text-slate-900 line-clamp-2 group-hover:opacity-70 transition-opacity duration-200 flex-1">
                      {service.title}
                    </h4>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 order-1 lg:order-2">
        {services.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
            <Briefcase size={48} className="mx-auto mb-3 text-slate-300" />
            <h2 className="text-lg font-semibold text-slate-600 mb-1">Không tìm thấy dịch vụ</h2>
            <p className="text-sm text-slate-500">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
          </div>
        ) : (
          <div className="space-y-3">
            {services.map((service) => (
              <Link
                key={service._id}
                href={`/services/${service.slug}`}
                className="group block rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                style={{ '--tw-ring-color': brandColor } as React.CSSProperties}
              >
                <article className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 border border-slate-100">
                  <div className="flex flex-col sm:flex-row">
                    <div className="sm:w-44 md:w-52 flex-shrink-0">
                      <div className="aspect-video sm:aspect-[4/3] sm:h-full bg-slate-100 overflow-hidden relative">
                          {service.thumbnail ? (
                            <Image src={service.thumbnail} alt={service.title} fill sizes="96px" className="object-cover group-hover:scale-105 transition-transform duration-300" />
                          ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Briefcase size={32} className="text-slate-300" />
                          </div>
                        )}
                        {showFeatured && service.featured && (
                          <div className="absolute top-2 left-2 px-2 py-1 bg-amber-500 text-white text-xs font-medium rounded flex items-center gap-1">
                            <Star size={10} className="fill-current" /> Nổi bật
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-center">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-xs font-medium px-2 py-0.5 rounded" style={{ backgroundColor: `${brandColor}15`, color: brandColor }}>
                          {categoryMap.get(service.categoryId) || 'Dịch vụ'}
                        </span>
                        <span className="text-xs text-slate-400">{service.publishedAt ? new Date(service.publishedAt).toLocaleDateString('vi-VN') : ''}</span>
                      </div>
                      <h2 className="text-base font-semibold text-slate-900 group-hover:opacity-70 transition-opacity duration-200 line-clamp-2">
                        {service.title}
                      </h2>
                      {showExcerpt && service.excerpt && (
                        <p className="text-sm text-slate-500 line-clamp-1 mt-1">{service.excerpt}</p>
                      )}
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-3 text-xs text-slate-400">
                          <span className="flex items-center gap-1"><Eye size={12} />{service.views.toLocaleString()}</span>
                          {showDuration && service.duration && (
                            <span className="flex items-center gap-1"><Clock size={12} />{service.duration}</span>
                          )}
                        </div>
                        {showPrice && (
                          <span className="text-base font-bold" style={{ color: brandColor }}>
                            {formatPrice(service.price)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
