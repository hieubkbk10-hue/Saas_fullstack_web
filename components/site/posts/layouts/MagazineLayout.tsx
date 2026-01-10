'use client';

import React from 'react';
import Link from 'next/link';
import { FileText, Eye, TrendingUp, Bookmark } from 'lucide-react';
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

interface MagazineLayoutProps {
  posts: Post[];
  brandColor: string;
  categoryMap: Map<string, string>;
  categories: Category[];
  selectedCategory: Id<"postCategories"> | null;
  onCategoryChange: (categoryId: Id<"postCategories"> | null) => void;
  featuredPosts: Post[];
  enabledFields: Set<string>;
}

export function MagazineLayout({
  posts,
  brandColor,
  categoryMap,
  categories,
  selectedCategory,
  onCategoryChange,
  featuredPosts,
  enabledFields,
}: MagazineLayoutProps) {
  const showExcerpt = enabledFields.has('excerpt');
  // Separate featured and regular posts
  const mainFeatured = featuredPosts[0];
  const secondaryFeatured = featuredPosts.slice(1, 3);
  const trendingPosts = featuredPosts.slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Hero Section - Featured Stories Widget */}
      {!selectedCategory && mainFeatured && (
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

      {/* Category Navigation - Pill Style */}
      <section className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin border-b border-slate-200">
        <button
          onClick={() => onCategoryChange(null)}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
            !selectedCategory ? 'text-white' : 'bg-transparent text-slate-600 hover:bg-slate-100'
          }`}
          style={!selectedCategory ? { backgroundColor: brandColor } : undefined}
        >
          Tất cả
        </button>
        {categories.map((category) => (
          <button
            key={category._id}
            onClick={() => onCategoryChange(category._id)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              selectedCategory === category._id ? 'text-white' : 'bg-transparent text-slate-600 hover:bg-slate-100'
            }`}
            style={selectedCategory === category._id ? { backgroundColor: brandColor } : undefined}
          >
            {category.name}
          </button>
        ))}
      </section>

      {/* Trending Section - Only show when no category selected */}
      {!selectedCategory && trendingPosts.length > 0 && (
        <section className="bg-slate-50 -mx-4 px-4 py-6 lg:-mx-6 lg:px-6 rounded-xl">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={18} style={{ color: brandColor }} />
            <h2 className="text-base font-bold text-slate-900">Đang thịnh hành</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {trendingPosts.map((post, index) => (
              <Link key={post._id} href={`/posts/${post.slug}`} className="group flex gap-3">
                <span className="text-2xl font-bold opacity-20 group-hover:opacity-40 transition-opacity" style={{ color: brandColor }}>
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-medium" style={{ color: brandColor }}>{categoryMap.get(post.categoryId) || 'Tin tức'}</span>
                  <h3 className="text-sm font-semibold text-slate-900 line-clamp-2 group-hover:opacity-70 transition-opacity duration-200 mt-0.5">{post.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Main Posts Grid - Clean Card Design */}
      {posts.length === 0 ? (
        <div className="text-center py-12">
          <Bookmark size={48} className="mx-auto mb-3 text-slate-300" />
          <h2 className="text-lg font-semibold text-slate-600 mb-1">Không tìm thấy bài viết</h2>
          <p className="text-sm text-slate-500">Thử chọn danh mục khác</p>
        </div>
      ) : (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900">
              {selectedCategory ? categoryMap.get(selectedCategory) : 'Bài viết mới nhất'}
            </h2>
            <span className="text-sm text-slate-500">{posts.length} bài viết</span>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {posts.map((post) => (
              <Link key={post._id} href={`/posts/${post.slug}`} className="group">
                <article className="h-full flex flex-col">
                  <div className="aspect-[16/10] rounded-lg overflow-hidden bg-slate-100 mb-3">
                    {post.thumbnail ? (
                      <img src={post.thumbnail} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><FileText size={32} className="text-slate-300" /></div>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium" style={{ color: brandColor }}>{categoryMap.get(post.categoryId) || 'Tin tức'}</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-xs text-slate-400">{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('vi-VN') : ''}</span>
                    </div>
                    <h3 className="text-base font-semibold text-slate-900 line-clamp-2 group-hover:opacity-70 transition-opacity duration-200">
                      {post.title}
                    </h3>
                    {showExcerpt && post.excerpt && (
                      <p className="text-sm text-slate-500 line-clamp-2 mt-1 flex-1">{post.excerpt}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
                      <span className="flex items-center gap-1"><Eye size={12} />{post.views.toLocaleString()}</span>
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
