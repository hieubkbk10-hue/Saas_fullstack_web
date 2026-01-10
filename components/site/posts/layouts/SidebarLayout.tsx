'use client';

import React from 'react';
import Link from 'next/link';
import { FileText, Calendar, Eye, Search, Tag, Clock, Folder } from 'lucide-react';
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
}: SidebarLayoutProps) {
  const [localSearch, setLocalSearch] = React.useState(searchQuery);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(localSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearch, onSearchChange]);

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Sidebar */}
      <aside className="lg:w-80 flex-shrink-0 order-2 lg:order-1">
        <div className="lg:sticky lg:top-24 space-y-6">
          {/* Search Widget */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Search size={18} style={{ color: brandColor }} />
              Tìm kiếm
            </h3>
            <div className="relative">
              <input
                type="text"
                placeholder="Nhập từ khóa..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': brandColor } as React.CSSProperties}
              />
            </div>
          </div>

          {/* Categories Widget */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Folder size={18} style={{ color: brandColor }} />
              Danh mục
            </h3>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onCategoryChange(null)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between ${
                    !selectedCategory
                      ? 'font-medium'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                  style={!selectedCategory ? { backgroundColor: `${brandColor}15`, color: brandColor } : undefined}
                >
                  <span>Tất cả bài viết</span>
                </button>
              </li>
              {categories.map((category) => (
                <li key={category._id}>
                  <button
                    onClick={() => onCategoryChange(category._id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between ${
                      selectedCategory === category._id
                        ? 'font-medium'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                    style={selectedCategory === category._id ? { backgroundColor: `${brandColor}15`, color: brandColor } : undefined}
                  >
                    <span>{category.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Recent Posts Widget */}
          {recentPosts.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Clock size={18} style={{ color: brandColor }} />
                Bài viết mới
              </h3>
              <div className="space-y-4">
                {recentPosts.slice(0, 5).map((post) => (
                  <Link
                    key={post._id}
                    href={`/posts/${post.slug}`}
                    className="flex gap-3 group"
                  >
                    <div className="w-16 h-12 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0">
                      {post.thumbnail ? (
                        <img
                          src={post.thumbnail}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FileText size={16} className="text-slate-300" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-slate-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {post.title}
                      </h4>
                      <span className="text-xs text-slate-400">
                        {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('vi-VN') : ''}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Popular Posts Widget */}
          {popularPosts.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Eye size={18} style={{ color: brandColor }} />
                Xem nhiều nhất
              </h3>
              <div className="space-y-4">
                {popularPosts.slice(0, 5).map((post, index) => (
                  <Link
                    key={post._id}
                    href={`/posts/${post.slug}`}
                    className="flex gap-3 group"
                  >
                    <span
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0"
                      style={{ backgroundColor: `${brandColor}15`, color: brandColor }}
                    >
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-slate-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {post.title}
                      </h4>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Eye size={10} /> {post.views.toLocaleString()} views
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Tags Cloud (placeholder) */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Tag size={18} style={{ color: brandColor }} />
              Tags phổ biến
            </h3>
            <div className="flex flex-wrap gap-2">
              {['Tips', 'Hướng dẫn', 'Tin tức', 'Review', 'Tutorial', 'Cập nhật'].map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 text-xs rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer transition-colors"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 order-1 lg:order-2">
        {posts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
            <FileText size={64} className="mx-auto mb-4 text-slate-300" />
            <h2 className="text-xl font-semibold text-slate-600 mb-2">Không tìm thấy bài viết</h2>
            <p className="text-slate-500">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <Link key={post._id} href={`/posts/${post.slug}`} className="group block">
                <article className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-slate-100">
                  <div className="flex flex-col sm:flex-row">
                    <div className="sm:w-56 md:w-64 flex-shrink-0">
                      <div className="aspect-video sm:aspect-[4/3] sm:h-full bg-slate-100 overflow-hidden relative">
                        {post.thumbnail ? (
                          <img
                            src={post.thumbnail}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <FileText size={40} className="text-slate-300" />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="p-5 flex-1 flex flex-col justify-center">
                      <div className="flex items-center gap-3 mb-2">
                        <span
                          className="text-xs font-medium px-2.5 py-1 rounded-full"
                          style={{ backgroundColor: `${brandColor}15`, color: brandColor }}
                        >
                          {categoryMap.get(post.categoryId) || 'Tin tức'}
                        </span>
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Calendar size={12} />
                          {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('vi-VN') : ''}
                        </span>
                      </div>
                      <h2 className="text-lg font-semibold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {post.title}
                      </h2>
                      {post.excerpt && (
                        <p className="text-sm text-slate-500 line-clamp-2 mb-3">{post.excerpt}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1 text-slate-400">
                          <Eye size={14} />
                          {post.views.toLocaleString()} views
                        </span>
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
