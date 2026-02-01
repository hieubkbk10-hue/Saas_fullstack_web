import React from 'react';
import { ChevronDown, FileText, Search, SlidersHorizontal } from 'lucide-react';

type ListLayoutStyle = 'fullwidth' | 'sidebar' | 'magazine' | 'grid' | 'list' | 'masonry';
type FilterPosition = 'sidebar' | 'top' | 'none';
type PreviewDevice = 'desktop' | 'tablet' | 'mobile';

type PostsListPreviewProps = {
  layoutStyle: ListLayoutStyle;
  filterPosition?: FilterPosition;
  showPagination?: boolean;
  showSearch?: boolean;
  showCategories?: boolean;
  brandColor?: string;
  device?: PreviewDevice;
};

const normalizeLayoutStyle = (style: ListLayoutStyle): 'fullwidth' | 'sidebar' | 'magazine' => {
  if (style === 'grid' || style === 'fullwidth') {return 'fullwidth';}
  if (style === 'list' || style === 'sidebar') {return 'sidebar';}
  return 'magazine';
};

export function PostsListPreview({
  layoutStyle,
  showPagination = true,
  showSearch = true,
  showCategories = true,
  brandColor = '#3b82f6',
  device = 'desktop',
}: PostsListPreviewProps) {
  const style = normalizeLayoutStyle(layoutStyle);
  const mockPosts = [
    { category: 'Tin tức', date: '10/01/2026', id: 1, title: 'Bài viết nổi bật số 1', views: 1234 },
    { category: 'Hướng dẫn', date: '09/01/2026', id: 2, title: 'Hướng dẫn sử dụng sản phẩm', views: 567 },
    { category: 'Tin tức', date: '08/01/2026', id: 3, title: 'Cập nhật tính năng mới', views: 890 },
    { category: 'Tips', date: '07/01/2026', id: 4, title: 'Tips và tricks hữu ích', views: 432 },
  ];
  const categories = ['Tất cả', 'Tin tức', 'Hướng dẫn', 'Tips'];
  const showFilterBar = showSearch || showCategories;

  const isMobile = device === 'mobile';
  const isCompact = device !== 'desktop';
  const visiblePosts = device === 'mobile' ? 2 : 4;
  const showCompactPanel = isCompact && (showSearch || showCategories);

  if (style === 'fullwidth') {
    return (
      <div className="py-6 md:py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-3">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Tin tức & Bài viết</h2>
          </div>
        {showFilterBar && (
          <div className="mb-5 space-y-2.5">
            <div className="bg-white rounded-lg border border-slate-200 p-3 shadow-sm">
              <div className="flex items-center gap-2">
                {showSearch && (
                  <div className="relative flex-1 max-w-xs">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Tìm kiếm..."
                      className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                      disabled
                    />
                  </div>
                )}
                {showCategories && !isCompact && (
                  <div className="hidden lg:block relative">
                    <select
                      className="appearance-none pl-3 pr-8 py-2 border border-slate-200 rounded-lg text-sm bg-white min-w-[140px]"
                      disabled
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                )}
                {!isCompact && <div className="hidden lg:block flex-1" />}
                {!isCompact && (
                  <div className="hidden lg:block relative">
                    <select
                      className="appearance-none pl-3 pr-8 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                      disabled
                    >
                      <option>Mới nhất</option>
                      <option>Cũ nhất</option>
                      <option>Xem nhiều</option>
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                )}
                {isCompact && (
                  <button
                    className="lg:hidden flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                    Bộ lọc
                  </button>
                )}
              </div>
              {showCompactPanel && (
                <div className="lg:hidden mt-3 pt-3 border-t border-slate-200 space-y-3">
                  {showCategories && (
                    <div>
                      <label className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5 block">
                        Danh mục
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {categories.map((cat, i) => (
                          <span
                            key={cat}
                            className={`px-2.5 py-1 rounded-full text-sm font-medium ${i === 0 ? 'text-white' : 'bg-slate-100 text-slate-600'}`}
                            style={i === 0 ? { backgroundColor: brandColor } : undefined}
                          >
                            {cat}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5 block">
                      Sắp xếp
                    </label>
                    <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white" disabled>
                      <option>Mới nhất</option>
                      <option>Cũ nhất</option>
                      <option>Xem nhiều</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-slate-500">4 bài viết</span>
                <span
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                  style={{ backgroundColor: `${brandColor}15`, color: brandColor }}
                >
                  Tin tức
                </span>
              </div>
              <button className="text-sm hover:underline" style={{ color: brandColor }}>
                Xóa bộ lọc
              </button>
            </div>
          </div>
        )}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {mockPosts.slice(0, visiblePosts).map((post) => (
            <div key={post.id} className="bg-white rounded-lg overflow-hidden shadow-sm border border-slate-100 h-full flex flex-col">
              <div className="aspect-video bg-slate-100 flex items-center justify-center">
                <FileText size={24} className="text-slate-300" />
              </div>
              <div className="p-3 flex-1 flex flex-col">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span
                    className="text-xs font-medium px-1.5 py-0.5 rounded"
                    style={{ backgroundColor: `${brandColor}15`, color: brandColor }}
                  >
                    {post.category}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-slate-900 line-clamp-2 flex-1">{post.title}</h3>
                <div className="h-3 bg-slate-100 rounded mt-1.5 w-4/5" />
                <div className="flex items-center justify-between text-xs text-slate-400 mt-2.5 pt-2.5 border-t border-slate-100">
                  <span>{post.date}</span>
                  <span>{post.views} views</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        {showPagination && (
          <div className="text-center mt-6">
            <button
              className="px-5 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 hover:opacity-80"
              style={{ backgroundColor: `${brandColor}15`, color: brandColor }}
            >
              Xem thêm bài viết
            </button>
          </div>
        )}
        </div>
      </div>
    );
  }

  if (style === 'sidebar') {
    return (
      <div className={`p-4 flex gap-4 ${isMobile ? 'p-3 flex-col' : ''}`}>
        <div className={`space-y-3 ${isMobile ? 'order-2' : 'w-1/3'}`}>
          {showSearch && (
            <div className="bg-slate-50 rounded-lg p-3">
              <h4 className="font-medium text-xs mb-2">Tìm kiếm</h4>
              <input type="text" placeholder="Nhập từ khóa..." className="w-full px-2 py-1.5 border rounded text-xs" disabled />
            </div>
          )}
          {showCategories && (
            <div className="bg-slate-50 rounded-lg p-3">
              <h4 className="font-medium text-xs mb-2">Danh mục</h4>
              <div className="space-y-1">
                {categories.map((cat, i) => (
                  <div 
                    key={cat} 
                    className={`px-2 py-1 rounded text-xs cursor-pointer ${i === 0 ? '' : 'text-slate-600'}`}
                    style={i === 0 ? { backgroundColor: `${brandColor}15`, color: brandColor } : undefined}
                  >
                    {cat}
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="bg-slate-50 rounded-lg p-3">
            <h4 className="font-medium text-xs mb-2">Bài mới nhất</h4>
            <div className="space-y-2">
              {mockPosts.slice(0, 2).map((post) => (
                <div key={post.id} className="flex gap-2">
                  <div className="w-10 h-8 bg-slate-200 rounded flex-shrink-0"></div>
                  <div className="text-xs line-clamp-2">{post.title}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className={`flex-1 space-y-3 ${isMobile ? 'order-1' : ''}`}>
          {mockPosts.slice(0, isMobile ? 2 : 3).map((post) => (
            <div key={post.id} className="bg-white border rounded-lg overflow-hidden flex">
              <div className="w-24 h-16 bg-slate-100 flex items-center justify-center flex-shrink-0">
                <FileText size={16} className="text-slate-300" />
              </div>
              <div className="p-2 flex-1">
                <span className="text-xs font-medium px-1.5 py-0.5 rounded" style={{ backgroundColor: `${brandColor}15`, color: brandColor }}>{post.category}</span>
                <h3 className="font-medium text-xs mt-1 line-clamp-1">{post.title}</h3>
                <span className="text-xs text-slate-400">{post.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 space-y-4 ${isMobile ? 'p-3' : ''}`}>
      <div className={`grid gap-3 ${isMobile ? 'grid-cols-1' : 'grid-cols-3'}`}>
        <div className={`relative rounded-xl overflow-hidden bg-slate-900 ${isMobile ? '' : 'col-span-2 row-span-2'}`}>
          <div className={`bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center ${isMobile ? 'aspect-video' : 'h-full min-h-[180px]'}`}>
            <FileText size={32} className="text-slate-600" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded text-xs font-medium text-white" style={{ backgroundColor: brandColor }}>Nổi bật</span>
              <span className="text-xs text-white/60">5 phút đọc</span>
            </div>
            <h3 className="font-bold text-sm text-white">{mockPosts[0].title}</h3>
          </div>
        </div>
        {!isMobile && mockPosts.slice(1, 3).map((post) => (
          <div key={post.id} className="relative rounded-lg overflow-hidden bg-slate-800">
            <div className="aspect-[16/10] bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center">
              <FileText size={16} className="text-slate-500" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-2">
              <span className="text-xs text-white/80 font-medium">{post.category}</span>
              <h4 className="font-semibold text-xs text-white line-clamp-2">{post.title}</h4>
            </div>
          </div>
        ))}
      </div>

      {showCategories && (
        <div className="flex gap-2 overflow-x-auto pb-1 border-b border-slate-200">
          {categories.map((cat, i) => (
            <span 
              key={cat} 
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${i === 0 ? 'text-white' : 'text-slate-600 hover:bg-slate-100'}`}
              style={i === 0 ? { backgroundColor: brandColor } : undefined}
            >
              {cat}
            </span>
          ))}
        </div>
      )}

      {!isMobile && (
        <div className="bg-slate-50 rounded-lg p-3">
          <div className="text-xs font-semibold text-slate-700 mb-2">Đang thịnh hành</div>
          <div className="grid grid-cols-2 gap-3">
            {mockPosts.slice(0, 2).map((post, i) => (
              <div key={post.id} className="flex gap-2">
                <span className="text-lg font-bold opacity-20" style={{ color: brandColor }}>{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <div className="text-xs font-medium line-clamp-2">{post.title}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{post.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="text-xs font-semibold text-slate-700 mb-2">Bài viết mới nhất</div>
        <div className={`grid gap-3 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
          {mockPosts.slice(0, isMobile ? 2 : 2).map((post) => (
            <div key={post.id} className="flex gap-3">
              <div className="w-16 h-12 rounded bg-slate-100 flex items-center justify-center flex-shrink-0">
                <FileText size={14} className="text-slate-300" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: brandColor }}>{post.category}</span>
                <h4 className="font-medium text-xs line-clamp-2 mt-0.5">{post.title}</h4>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ProductsListPreview(props: PostsListPreviewProps) {
  return <PostsListPreview {...props} />;
}

export function ServicesListPreview(props: PostsListPreviewProps) {
  return <PostsListPreview {...props} />;
}
