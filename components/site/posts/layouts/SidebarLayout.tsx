'use client';

import React from 'react';
import Link from 'next/link';
import { FileText, Eye, Search, Clock, Folder } from 'lucide-react';
import { Id } from '@/convex/_generated/dataModel';

interface Post {
  _id: Id<"posts">;
  title: string;
  slug: string;
  excerpt?: string;
  thumbnail?: string;
  categoryId: Id<"postCategories">;
  views: number;
  publishedAt?: number;
}

interface Category {
  _id: Id<"postCategories">;
  name: string;
  slug: string;
}

interface SidebarLayoutProps {
  posts: Post[];
  brandColor: string;
  categoryMap: Map<string, string>;
  categories: Category[];
  selectedCategory: Id<"postCategories"> | null;
  onCategoryChange: (categoryId: Id<"postCategories"> | null) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  recentPosts: Post[];
  popularPosts: Post[];
  enabledFields: Set<string>;
}

export function SidebarLayout({
  posts,
  brandColor,
  categoryMap,
  categories,
  selectedCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
  recentPosts,
  popularPosts,
  enabledFields,
}: SidebarLayoutProps) {
  const showExcerpt = enabledFields.has('excerpt');
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
            <input
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
                  className={`w-full text-left px-3 py-1.5 rounded text-sm transition-colors ${
                    !selectedCategory ? 'font-medium' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                  style={!selectedCategory ? { backgroundColor: `${brandColor}15`, color: brandColor } : undefined}
                >
                  Tất cả
                </button>
              </li>
              {categories.map((category) => (
                <li key={category._id}>
                  <button
                    onClick={() => onCategoryChange(category._id)}
                    className={`w-full text-left px-3 py-1.5 rounded text-sm transition-colors ${
                      selectedCategory === category._id ? 'font-medium' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                    style={selectedCategory === category._id ? { backgroundColor: `${brandColor}15`, color: brandColor } : undefined}
                  >
                    {category.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Recent Posts Widget */}
          {recentPosts.length > 0 && (
            <div className="bg-white rounded-lg border border-slate-200 p-4">
              <h3 className="font-semibold text-slate-900 text-sm mb-3 flex items-center gap-2">
                <Clock size={16} style={{ color: brandColor }} />
                Bài viết mới
              </h3>
              <div className="space-y-3">
                {recentPosts.slice(0, 4).map((post) => (
                  <Link key={post._id} href={`/posts/${post.slug}`} className="flex gap-2 group">
                    <div className="w-14 h-10 rounded bg-slate-100 overflow-hidden flex-shrink-0">
                      {post.thumbnail ? (
                        <img src={post.thumbnail} alt={post.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FileText size={14} className="text-slate-300" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-medium text-slate-900 line-clamp-2 group-hover:opacity-70 transition-opacity duration-200">
                        {post.title}
                      </h4>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Popular Posts Widget */}
          {popularPosts.length > 0 && (
            <div className="bg-white rounded-lg border border-slate-200 p-4">
              <h3 className="font-semibold text-slate-900 text-sm mb-3 flex items-center gap-2">
                <Eye size={16} style={{ color: brandColor }} />
                Xem nhiều
              </h3>
              <div className="space-y-2">
                {popularPosts.slice(0, 4).map((post, index) => (
                  <Link key={post._id} href={`/posts/${post.slug}`} className="flex gap-2 group">
                    <span
                      className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{ backgroundColor: `${brandColor}15`, color: brandColor }}
                    >
                      {index + 1}
                    </span>
                    <h4 className="text-xs font-medium text-slate-900 line-clamp-2 group-hover:opacity-70 transition-opacity duration-200 flex-1">
                      {post.title}
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
        {posts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
            <FileText size={48} className="mx-auto mb-3 text-slate-300" />
            <h2 className="text-lg font-semibold text-slate-600 mb-1">Không tìm thấy bài viết</h2>
            <p className="text-sm text-slate-500">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map((post) => (
              <Link key={post._id} href={`/posts/${post.slug}`} className="group block">
                <article className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 border border-slate-100">
                  <div className="flex flex-col sm:flex-row">
                    <div className="sm:w-44 md:w-52 flex-shrink-0">
                      <div className="aspect-video sm:aspect-[4/3] sm:h-full bg-slate-100 overflow-hidden">
                        {post.thumbnail ? (
                          <img src={post.thumbnail} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <FileText size={32} className="text-slate-300" />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-center">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-xs font-medium px-2 py-0.5 rounded" style={{ backgroundColor: `${brandColor}15`, color: brandColor }}>
                          {categoryMap.get(post.categoryId) || 'Tin tức'}
                        </span>
                        <span className="text-xs text-slate-400">{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('vi-VN') : ''}</span>
                      </div>
                      <h2 className="text-base font-semibold text-slate-900 group-hover:opacity-70 transition-opacity duration-200 line-clamp-2">
                        {post.title}
                      </h2>
                      {showExcerpt && post.excerpt && (
                        <p className="text-sm text-slate-500 line-clamp-1 mt-1">{post.excerpt}</p>
                      )}
                      <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                        <span className="flex items-center gap-1"><Eye size={12} />{post.views.toLocaleString()}</span>
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
