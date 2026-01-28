'use client';

import React from 'react';
import Link from 'next/link';
import { FileText, Eye, Bookmark, Search, ChevronDown } from 'lucide-react';
import { Id } from '@/convex/_generated/dataModel';
import { SortOption } from '../PostsFilter';

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

interface MagazineLayoutProps {
  posts: Post[];
  brandColor: string;
  categoryMap: Map<string, string>;
  categories: Category[];
  selectedCategory: Id<"postCategories"> | null;
  onCategoryChange: (categoryId: Id<"postCategories"> | null) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  featuredPosts: Post[];
  enabledFields: Set<string>;
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'oldest', label: 'Cũ nhất' },
  { value: 'popular', label: 'Xem nhiều' },
  { value: 'title', label: 'Theo tên A-Z' },
];

export function MagazineLayout({
  posts,
  brandColor,
  categoryMap,
  categories,
  selectedCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  featuredPosts,
  enabledFields,
}: MagazineLayoutProps) {
  const showExcerpt = enabledFields.has('excerpt');
  // Separate featured and regular posts
  const mainFeatured = featuredPosts[0];
  const secondaryFeatured = featuredPosts.slice(1, 3);

  return (
    <div className="space-y-5">
      {/* Hero Section - Featured Stories Widget */}
      {!selectedCategory && !searchQuery && mainFeatured && (
        <section className="grid lg:grid-cols-3 gap-4">
          {/* Main Featured - Large Card */}
          <Link href={`/posts/${mainFeatured.slug}`} className="lg:col-span-2 group">
            <article className="relative h-full min-h-[280px] lg:min-h-[360px] rounded-xl overflow-hidden bg-slate-900">
              {mainFeatured.thumbnail ? (
                <img src={mainFeatured.thumbnail} alt={mainFeatured.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-900" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5 lg:p-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded text-xs font-medium text-white" style={{ backgroundColor: brandColor }}>
                    {categoryMap.get(mainFeatured.categoryId) || 'Nổi bật'}
                  </span>
                </div>
                <h2 className="text-xl lg:text-2xl font-bold text-white mb-2 leading-tight line-clamp-2">
                  {mainFeatured.title}
                </h2>
                {showExcerpt && mainFeatured.excerpt && (
                  <p className="text-white/70 text-sm line-clamp-2 mb-2">{mainFeatured.excerpt}</p>
                )}
                <div className="flex items-center gap-3 text-xs text-white/60">
                  <span>{mainFeatured.publishedAt ? new Date(mainFeatured.publishedAt).toLocaleDateString('vi-VN') : ''}</span>
                  <span className="flex items-center gap-1"><Eye size={12} />{mainFeatured.views.toLocaleString()}</span>
                </div>
              </div>
            </article>
          </Link>

          {/* Secondary Featured - Stacked Cards */}
          <div className="flex flex-col gap-4">
            {secondaryFeatured.map((post) => (
              <Link key={post._id} href={`/posts/${post.slug}`} className="group flex-1">
                <article className="relative h-full min-h-[140px] lg:min-h-0 rounded-lg overflow-hidden bg-slate-900">
                  {post.thumbnail ? (
                    <img src={post.thumbnail} alt={post.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-600 to-slate-800" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <span className="inline-block px-2 py-0.5 rounded text-xs font-medium text-white mb-1" style={{ backgroundColor: brandColor }}>
                      {categoryMap.get(post.categoryId) || 'Tin tức'}
                    </span>
                    <h3 className="text-base font-semibold text-white line-clamp-2">{post.title}</h3>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Filter Bar - Search, Category, Sort */}
      <section className="bg-white rounded-lg border border-slate-200 p-3 shadow-sm">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {/* Search Input */}
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 text-sm"
              style={{ '--tw-ring-color': brandColor } as React.CSSProperties}
            />
          </div>

          {/* Category Dropdown */}
          <div className="relative">
            <select
              value={selectedCategory || ''}
              onChange={(e) => onCategoryChange(e.target.value ? e.target.value as Id<"postCategories"> : null)}
              className="appearance-none pl-3 pr-8 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 cursor-pointer min-w-[140px]"
              style={{ '--tw-ring-color': brandColor } as React.CSSProperties}
            >
              <option value="">Tất cả danh mục</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>

          {/* Spacer */}
          <div className="hidden sm:block flex-1" />

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className="appearance-none pl-3 pr-8 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 cursor-pointer"
              style={{ '--tw-ring-color': brandColor } as React.CSSProperties}
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </section>

      {/* Main Posts Grid - Clean Card Design */}
      {posts.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-lg border border-slate-200">
          <Bookmark size={40} className="mx-auto mb-2 text-slate-300" />
          <h2 className="text-base font-semibold text-slate-600 mb-1">Không tìm thấy bài viết</h2>
          <p className="text-sm text-slate-500">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
        </div>
      ) : (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-slate-900">
              {selectedCategory ? categoryMap.get(selectedCategory) : 'Bài viết mới nhất'}
            </h2>
            <span className="text-sm text-slate-500">{posts.length} bài viết</span>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {posts.map((post) => (
              <Link key={post._id} href={`/posts/${post.slug}`} className="group">
                <article className="h-full flex flex-col bg-white rounded-lg overflow-hidden border border-slate-200 hover:shadow-md transition-shadow duration-200">
                  <div className="aspect-video overflow-hidden bg-slate-100">
                    {post.thumbnail ? (
                      <img src={post.thumbnail} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><FileText size={28} className="text-slate-300" /></div>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium px-2 py-0.5 rounded" style={{ backgroundColor: `${brandColor}15`, color: brandColor }}>
                        {categoryMap.get(post.categoryId) || 'Tin tức'}
                      </span>
                      {post.publishedAt && (
                        <>
                          <span className="text-slate-300">•</span>
                          <span className="text-xs text-slate-400">{new Date(post.publishedAt).toLocaleDateString('vi-VN')}</span>
                        </>
                      )}
                    </div>
                    <h3 className="text-sm font-semibold text-slate-900 line-clamp-2 group-hover:text-opacity-70 transition-colors duration-200 mb-1">
                      {post.title}
                    </h3>
                    {showExcerpt && post.excerpt && (
                      <p className="text-xs text-slate-500 line-clamp-2 mb-2 flex-1">{post.excerpt}</p>
                    )}
                    <div className="flex items-center gap-1 text-xs text-slate-400">
                      <Eye size={12} />
                      <span>{post.views.toLocaleString()}</span>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
