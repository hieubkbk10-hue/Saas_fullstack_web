import React from 'react';
import { ChevronDown, Clock, Eye, Folder, Search, Star, TrendingUp } from 'lucide-react';
import Image from 'next/image';

type ListLayoutStyle = 'grid' | 'sidebar' | 'masonry';
type FilterPosition = 'sidebar' | 'top' | 'none';
type DeviceType = 'desktop' | 'tablet' | 'mobile';

type ServicesListPreviewProps = {
  layoutStyle: ListLayoutStyle;
  filterPosition?: FilterPosition;
  showPagination?: boolean;
  showSearch?: boolean;
  showCategories?: boolean;
  brandColor?: string;
  device?: DeviceType;
};

const MOCK_SERVICES = [
  { _id: '1', title: 'Tư vấn chuyển đổi số cho doanh nghiệp', category: 'Tư vấn', price: 15000000, duration: '3 tháng', views: 1234, featured: true, thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400' },
  { _id: '2', title: 'Thiết kế website chuyên nghiệp', category: 'Thiết kế', price: 25000000, duration: '2 tháng', views: 2340, featured: false, thumbnail: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=400' },
  { _id: '3', title: 'Phát triển ứng dụng di động', category: 'Phát triển', price: 35000000, duration: '4 tháng', views: 890, featured: false, thumbnail: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400' },
  { _id: '4', title: 'Quản trị hệ thống', category: 'Vận hành', price: 10000000, duration: '1 tháng', views: 432, featured: false, thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400' },
];

const MOCK_CATEGORIES = ['Tất cả', 'Tư vấn', 'Thiết kế', 'Phát triển', 'Vận hành'];

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

// FullWidth Layout (Grid view only)
function FullWidthPreview({ showSearch, showCategories, showPagination, brandColor = '#8b5cf6' }: ServicesListPreviewProps) {

  return (
    <div className="py-6 md:py-10 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Dịch vụ của chúng tôi</h1>
        </div>

        {/* Filter Bar */}
        {(showSearch || showCategories) && (
          <div className="mb-8">
            <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                {showSearch && (
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Tìm kiếm dịch vụ..."
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm"
                      disabled
                    />
                  </div>
                )}
                
                {showCategories && (
                  <div className="relative">
                    <select className="appearance-none pl-4 pr-10 py-2.5 border border-slate-200 rounded-lg text-sm bg-white min-w-[160px]" disabled>
                      {MOCK_CATEGORIES.map(cat => (
                        <option key={cat}>{cat}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                )}
                
                <div className="relative">
                  <select className="appearance-none pl-4 pr-10 py-2.5 border border-slate-200 rounded-lg text-sm bg-white" disabled>
                    <option>Mới nhất</option>
                    <option>Giá tăng dần</option>
                    <option>Giá giảm dần</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Services Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {MOCK_SERVICES.map(service => (
            <article key={service._id} className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 border border-slate-100 h-full flex flex-col">
              <div className="aspect-[16/10] bg-slate-100 overflow-hidden relative">
                <Image src={service.thumbnail} alt={service.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
                {service.featured && (
                  <div className="absolute top-2 left-2 px-2 py-1 bg-amber-500 text-white text-xs font-medium rounded flex items-center gap-1">
                    <Star size={10} className="fill-current" /> Nổi bật
                  </div>
                )}
              </div>
              <div className="p-3 flex-1 flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium px-2 py-0.5 rounded" style={{ backgroundColor: `${brandColor}15`, color: brandColor }}>
                    {service.category}
                  </span>
                </div>
                <h2 className="text-base font-semibold text-slate-900 line-clamp-2 flex-1">
                  {service.title}
                </h2>
                <div className="flex items-center justify-between text-xs text-slate-400 mt-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {service.duration}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold" style={{ color: brandColor }}>
                      {formatPrice(service.price)}
                    </span>
                    <span className="inline-flex items-center justify-center px-3 py-2 text-xs font-medium rounded-lg text-white" style={{ backgroundColor: brandColor }}>
                      Xem ngay
                    </span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Load More */}
        {showPagination && (
          <div className="text-center mt-8">
            <button className="px-6 py-3 rounded-lg font-medium transition-colors duration-200 hover:opacity-80" style={{ backgroundColor: `${brandColor}15`, color: brandColor }}>
              Xem thêm dịch vụ
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Sidebar Layout
function SidebarPreview({ showSearch, showCategories, brandColor = '#8b5cf6' }: ServicesListPreviewProps) {
  return (
    <div className="py-6 md:py-10 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Dịch vụ của chúng tôi</h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <aside className="lg:w-72 flex-shrink-0 order-2 lg:order-1">
            <div className="lg:sticky lg:top-24 space-y-4">
              {showSearch && (
                <div className="bg-white rounded-lg border border-slate-200 p-4">
                  <h3 className="font-semibold text-slate-900 text-sm mb-3 flex items-center gap-2">
                    <Search size={16} style={{ color: brandColor }} />
                    Tìm kiếm
                  </h3>
                  <input type="text" placeholder="Nhập từ khóa..." className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" disabled />
                </div>
              )}

              {showCategories && (
                <div className="bg-white rounded-lg border border-slate-200 p-4">
                  <h3 className="font-semibold text-slate-900 text-sm mb-3 flex items-center gap-2">
                    <Folder size={16} style={{ color: brandColor }} />
                    Danh mục
                  </h3>
                  <ul className="space-y-1">
                    {MOCK_CATEGORIES.map((cat, i) => (
                      <li key={cat}>
                        <button
                          className={`w-full text-left px-3 py-2.5 rounded text-sm transition-colors min-h-11 ${i === 0 ? 'font-medium' : 'text-slate-600 hover:bg-slate-50'}`}
                          style={i === 0 ? { backgroundColor: `${brandColor}15`, color: brandColor } : undefined}
                          disabled
                        >
                          {cat}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 order-1 lg:order-2">
            <div className="space-y-3">
              {MOCK_SERVICES.map(service => (
                <article key={service._id} className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 border border-slate-100">
                  <div className="flex flex-col sm:flex-row">
                    <div className="sm:w-44 md:w-52 flex-shrink-0">
                      <div className="aspect-video sm:aspect-[4/3] sm:h-full bg-slate-100 overflow-hidden relative">
                        <Image src={service.thumbnail} alt={service.title} fill sizes="96px" className="object-cover" />
                        {service.featured && (
                          <div className="absolute top-2 left-2 px-2 py-1 bg-amber-500 text-white text-xs font-medium rounded flex items-center gap-1">
                            <Star size={10} className="fill-current" /> Nổi bật
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-center">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-xs font-medium px-2 py-0.5 rounded" style={{ backgroundColor: `${brandColor}15`, color: brandColor }}>
                          {service.category}
                        </span>
                      </div>
                      <h2 className="text-base font-semibold text-slate-900 line-clamp-2">
                        {service.title}
                      </h2>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-3 text-xs text-slate-400">
                          <span className="flex items-center gap-1"><Eye size={12} />{service.views.toLocaleString()}</span>
                          <span className="flex items-center gap-1"><Clock size={12} />{service.duration}</span>
                        </div>
                        <span className="text-base font-bold" style={{ color: brandColor }}>
                          {formatPrice(service.price)}
                        </span>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

// Magazine Layout
function MagazinePreview({ showCategories, brandColor = '#8b5cf6' }: ServicesListPreviewProps) {
  const mainFeatured = MOCK_SERVICES[0];
  const secondaryFeatured = MOCK_SERVICES.slice(1, 3);
  const trendingServices = MOCK_SERVICES.slice(0, 4);

  return (
    <div className="py-6 md:py-10 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Dịch vụ của chúng tôi</h1>
        </div>

        <div className="space-y-6">
          {/* Hero Section */}
          <section className="grid lg:grid-cols-3 gap-4">
            <article className="lg:col-span-2 relative h-full min-h-[280px] lg:min-h-[360px] rounded-xl overflow-hidden bg-slate-900">
              <Image src={mainFeatured.thumbnail} alt={mainFeatured.title} fill sizes="(max-width: 1024px) 100vw, 66vw" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5 lg:p-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded text-xs font-semibold text-white bg-black/60 backdrop-blur-sm ring-1 ring-black/30">
                    {mainFeatured.category}
                  </span>
                  <span className="px-2 py-0.5 rounded text-xs font-semibold bg-black/60 text-white flex items-center gap-1 backdrop-blur-sm ring-1 ring-black/30">
                    <Star size={10} className="fill-current" /> Dịch vụ nổi bật
                  </span>
                </div>
                <h2 className="text-xl lg:text-2xl font-bold text-white mb-2 leading-tight line-clamp-2">
                  {mainFeatured.title}
                </h2>
                <div className="flex items-center gap-4">
                  <span className="text-xl font-bold text-white">{formatPrice(mainFeatured.price)}</span>
                  <div className="flex items-center gap-3 text-xs text-white/60">
                    <span className="flex items-center gap-1"><Eye size={12} />{mainFeatured.views.toLocaleString()}</span>
                    <span className="flex items-center gap-1"><Clock size={12} />{mainFeatured.duration}</span>
                  </div>
                </div>
              </div>
            </article>

            <div className="flex flex-col gap-4">
              {secondaryFeatured.map(service => (
                <article key={service._id} className="relative flex-1 min-h-[140px] lg:min-h-0 rounded-lg overflow-hidden bg-slate-900">
                  <Image src={service.thumbnail} alt={service.title} fill sizes="(max-width: 1024px) 100vw, 33vw" className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold text-white mb-1 bg-black/60 backdrop-blur-sm ring-1 ring-black/30">
                      {service.category}
                    </span>
                    <h3 className="text-base font-semibold text-white line-clamp-2">{service.title}</h3>
                    <span className="text-sm font-bold text-white mt-1 block">{formatPrice(service.price)}</span>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* Category Pills */}
          {showCategories && (
            <section className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin border-b border-slate-200">
              {MOCK_CATEGORIES.map((cat, i) => (
                <button
                  key={cat}
                  className={`px-4 py-2.5 min-h-11 rounded-full text-sm font-medium whitespace-nowrap transition-all ${i === 0 ? 'text-white' : 'bg-transparent text-slate-600 hover:bg-slate-100'}`}
                  style={i === 0 ? { backgroundColor: brandColor } : undefined}
                  disabled
                >
                  {cat}
                </button>
              ))}
            </section>
          )}

          {/* Trending */}
          <section className="bg-slate-50 -mx-4 px-4 py-6 rounded-xl">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={18} style={{ color: brandColor }} />
              <h2 className="text-base font-bold text-slate-900">Dịch vụ phổ biến</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {trendingServices.map((service, index) => (
                <div key={service._id} className="flex gap-3">
                  <span className="text-2xl font-bold opacity-40" style={{ color: brandColor }}>
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-medium" style={{ color: brandColor }}>{service.category}</span>
                    <h3 className="text-sm font-semibold text-slate-900 line-clamp-2 mt-0.5">{service.title}</h3>
                    <span className="text-xs font-bold mt-1 block" style={{ color: brandColor }}>{formatPrice(service.price)}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Main Grid */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900">Dịch vụ mới nhất</h2>
              <span className="text-sm text-slate-500">{MOCK_SERVICES.length} dịch vụ</span>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {MOCK_SERVICES.map(service => (
                <article key={service._id} className="h-full flex flex-col">
                  <div className="aspect-[16/10] rounded-lg overflow-hidden bg-slate-100 mb-3 relative">
                    <Image src={service.thumbnail} alt={service.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
                    {service.featured && (
                      <div className="absolute top-2 left-2 px-2 py-1 bg-amber-500 text-white text-xs font-medium rounded flex items-center gap-1">
                        <Star size={10} className="fill-current" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium" style={{ color: brandColor }}>{service.category}</span>
                    </div>
                    <h3 className="text-base font-semibold text-slate-900 line-clamp-2">{service.title}</h3>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <span className="flex items-center gap-1"><Eye size={12} />{service.views.toLocaleString()}</span>
                        <span className="flex items-center gap-1"><Clock size={12} />{service.duration}</span>
                      </div>
                      <span className="text-base font-bold" style={{ color: brandColor }}>{formatPrice(service.price)}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

// Main Component
export function ServicesListPreview({
  layoutStyle,
  filterPosition = 'sidebar',
  showPagination = true,
  showSearch = true,
  showCategories = true,
  brandColor = '#8b5cf6',
  device = 'desktop',
}: ServicesListPreviewProps) {
  const props = { layoutStyle, filterPosition, showPagination, showSearch, showCategories, brandColor, device };

  // Map layoutStyle to actual implementation
  if (layoutStyle === 'masonry') {
    return <MagazinePreview {...props} />;
  }
  
  if (layoutStyle === 'sidebar') {
    return <SidebarPreview {...props} />;
  }

  // Default: grid
  return <FullWidthPreview {...props} />;
}
