import React from 'react';
import { FileText } from 'lucide-react';

type ListLayoutStyle = 'fullwidth' | 'sidebar' | 'magazine' | 'grid' | 'list' | 'masonry';
type FilterPosition = 'sidebar' | 'top' | 'none';

type PostsListPreviewProps = {
  layoutStyle: ListLayoutStyle;
  filterPosition?: FilterPosition;
  showPagination?: boolean;
  showSearch?: boolean;
  showCategories?: boolean;
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

  if (style === 'fullwidth') {
    return (
      <div className="p-4">
        <h2 className="font-bold text-center mb-4 text-xl">Tin tức & Bài viết</h2>
        {showFilterBar && (
          <div className="bg-white border rounded-lg p-3 mb-4">
            <div className="flex gap-2 items-center">
              {showSearch && (
                <div className="flex-1 relative">
                  <input 
                    type="text" 
                    placeholder="Tìm kiếm..." 
                    className="w-full px-3 py-1.5 border rounded-lg text-xs bg-slate-50"
                    disabled
                  />
                </div>
              )}
              {showCategories && (
                <div className="flex gap-1 flex-wrap">
                  {categories.map((cat, i) => (
                    <span 
                      key={cat} 
                      className={`px-2 py-1 rounded-full text-xs cursor-pointer ${i === 0 ? 'text-white' : 'bg-slate-100'}`}
                      style={i === 0 ? { backgroundColor: '#3b82f6' } : undefined}
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        <div className="text-xs text-slate-500 mb-3">4 bài viết</div>
        <div className="grid gap-3 grid-cols-2">
          {mockPosts.slice(0, 4).map((post) => (
            <div key={post.id} className="bg-white border rounded-lg overflow-hidden">
              <div className="aspect-video bg-slate-100 flex items-center justify-center">
                <FileText size={24} className="text-slate-300" />
              </div>
              <div className="p-3">
                <span className="text-xs font-medium" style={{ color: '#3b82f6' }}>{post.category}</span>
                <h3 className="font-medium text-sm mt-1 line-clamp-2">{post.title}</h3>
                <div className="flex items-center justify-between mt-2 text-xs text-slate-400">
                  <span>{post.date}</span>
                  <span>{post.views} views</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        {showPagination && (
          <div className="text-center mt-4">
            <button className="px-4 py-2 text-xs rounded-lg bg-slate-100 text-slate-600">
              Xem thêm bài viết
            </button>
          </div>
        )}
      </div>
    );
  }

  if (style === 'sidebar') {
    return (
      <div className="p-4 flex gap-4">
        <div className="space-y-3 w-1/3">
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
                    style={i === 0 ? { backgroundColor: '#3b82f615', color: '#3b82f6' } : undefined}
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
        <div className="flex-1 space-y-3">
          {mockPosts.slice(0, 3).map((post) => (
            <div key={post.id} className="bg-white border rounded-lg overflow-hidden flex">
              <div className="w-24 h-16 bg-slate-100 flex items-center justify-center flex-shrink-0">
                <FileText size={16} className="text-slate-300" />
              </div>
              <div className="p-2 flex-1">
                <span className="text-xs font-medium px-1.5 py-0.5 rounded" style={{ backgroundColor: '#3b82f615', color: '#3b82f6' }}>{post.category}</span>
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
    <div className="p-4 space-y-4">
      <div className="grid gap-3 grid-cols-3">
        <div className="relative rounded-xl overflow-hidden bg-slate-900 col-span-2 row-span-2">
          <div className="bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center h-full min-h-[180px]">
            <FileText size={32} className="text-slate-600" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded text-xs font-medium text-white" style={{ backgroundColor: '#3b82f6' }}>Nổi bật</span>
              <span className="text-xs text-white/60">5 phút đọc</span>
            </div>
            <h3 className="font-bold text-sm text-white">{mockPosts[0].title}</h3>
          </div>
        </div>
        {mockPosts.slice(1, 3).map((post) => (
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
              style={i === 0 ? { backgroundColor: '#3b82f6' } : undefined}
            >
              {cat}
            </span>
          ))}
        </div>
      )}

      <div className="bg-slate-50 rounded-lg p-3">
        <div className="text-xs font-semibold text-slate-700 mb-2">Đang thịnh hành</div>
        <div className="grid grid-cols-2 gap-3">
          {mockPosts.slice(0, 2).map((post, i) => (
            <div key={post.id} className="flex gap-2">
              <span className="text-lg font-bold opacity-20" style={{ color: '#3b82f6' }}>{String(i + 1).padStart(2, '0')}</span>
              <div>
                <div className="text-xs font-medium line-clamp-2">{post.title}</div>
                <div className="text-xs text-slate-400 mt-0.5">{post.date}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="text-xs font-semibold text-slate-700 mb-2">Bài viết mới nhất</div>
        <div className="grid gap-3 grid-cols-2">
          {mockPosts.slice(0, 2).map((post) => (
            <div key={post.id} className="flex gap-3">
              <div className="w-16 h-12 rounded bg-slate-100 flex items-center justify-center flex-shrink-0">
                <FileText size={14} className="text-slate-300" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#3b82f6' }}>{post.category}</span>
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
