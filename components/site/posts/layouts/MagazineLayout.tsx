'use client';

import React from 'react';
import Link from 'next/link';
import { FileText, Calendar, Eye, TrendingUp, Clock, Bookmark } from 'lucide-react';
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
}

export function MagazineLayout({
  posts,
  brandColor,
  categoryMap,
  categories,
  selectedCategory,
  onCategoryChange,
  featuredPosts,
}: MagazineLayoutProps) {
  // Separate featured and regular posts
  const mainFeatured = featuredPosts[0];
  const secondaryFeatured = featuredPosts.slice(1, 3);
  const trendingPosts = featuredPosts.slice(0, 4);

  return (
    <div className="space-y-10">
      {/* Hero Section - Featured Stories Widget */}
      {!selectedCategory && mainFeatured && (
        <section className="grid lg:grid-cols-3 gap-6">
          {/* Main Featured - Large Card */}
          <Link href={`/posts/${mainFeatured.slug}`} className="lg:col-span-2 group">
            <article className="relative h-full min-h-[400px] lg:min-h-[480px] rounded-2xl overflow-hidden bg-slate-900">
              {mainFeatured.thumbnail ? (
                <img
                  src={mainFeatured.thumbnail}
                  alt={mainFeatured.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-900" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <span
                    className="px-3 py-1 rounded-full text-xs font-semibold text-white"
                    style={{ backgroundColor: brandColor }}
                  >
                    {categoryMap.get(mainFeatured.categoryId) || 'Nổi bật'}
                  </span>
                  <span className="text-white/60 text-sm flex items-center gap-1">
                    <Clock size={14} />
                    5 phút đọc
                  </span>
                </div>
                <h2 className="text-2xl lg:text-4xl font-bold text-white mb-3 leading-tight group-hover:underline decoration-2 underline-offset-4">
                  {mainFeatured.title}
                </h2>
                {mainFeatured.excerpt && (
                  <p className="text-white/80 text-base lg:text-lg line-clamp-2 mb-4 max-w-2xl">
                    {mainFeatured.excerpt}
                  </p>
                )}
                <div className="flex items-center gap-4 text-sm text-white/60">
                  <span className="flex items-center gap-1">
                    <Calendar size={14} />
                    {mainFeatured.publishedAt ? new Date(mainFeatured.publishedAt).toLocaleDateString('vi-VN') : ''}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye size={14} />
                    {mainFeatured.views.toLocaleString()}
                  </span>
                </div>
              </div>
            </article>
          </Link>

          {/* Secondary Featured - Stacked Cards */}
          <div className="flex flex-col gap-6">
            {secondaryFeatured.map((post) => (
              <Link key={post._id} href={`/posts/${post.slug}`} className="group flex-1">
                <article className="relative h-full min-h-[200px] lg:min-h-0 rounded-xl overflow-hidden bg-slate-900">
                  {post.thumbnail ? (
                    <img
                      src={post.thumbnail}
                      alt={post.title}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-600 to-slate-800" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 lg:p-5">
                    <span
                      className="inline-block px-2 py-0.5 rounded text-xs font-medium text-white mb-2"
                      style={{ backgroundColor: brandColor }}
                    >
                      {categoryMap.get(post.categoryId) || 'Tin tức'}
                    </span>
                    <h3 className="text-lg font-bold text-white line-clamp-2 group-hover:underline decoration-1 underline-offset-2">
                      {post.title}
                    </h3>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Category Navigation - Pill Style */}
      <section className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin border-b border-slate-200">
        <button
          onClick={() => onCategoryChange(null)}
          className={`px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
            !selectedCategory
              ? 'text-white shadow-lg'
              : 'bg-transparent text-slate-600 hover:bg-slate-100'
          }`}
          style={!selectedCategory ? { backgroundColor: brandColor } : undefined}
        >
          Tất cả
        </button>
        {categories.map((category) => (
          <button
            key={category._id}
            onClick={() => onCategoryChange(category._id)}
            className={`px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              selectedCategory === category._id
                ? 'text-white shadow-lg'
                : 'bg-transparent text-slate-600 hover:bg-slate-100'
            }`}
            style={selectedCategory === category._id ? { backgroundColor: brandColor } : undefined}
          >
            {category.name}
          </button>
        ))}
      </section>

      {/* Trending Section - Only show when no category selected */}
      {!selectedCategory && trendingPosts.length > 0 && (
        <section className="bg-slate-50 -mx-4 px-4 py-8 lg:-mx-8 lg:px-8 rounded-2xl">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp size={20} style={{ color: brandColor }} />
            <h2 className="text-lg font-bold text-slate-900">Đang thịnh hành</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {trendingPosts.map((post, index) => (
              <Link key={post._id} href={`/posts/${post.slug}`} className="group flex gap-4">
                <span
                  className="text-3xl font-bold opacity-20 group-hover:opacity-40 transition-opacity"
                  style={{ color: brandColor }}
                >
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-medium" style={{ color: brandColor }}>
                    {categoryMap.get(post.categoryId) || 'Tin tức'}
                  </span>
                  <h3 className="font-semibold text-slate-900 line-clamp-2 group-hover:text-slate-600 transition-colors mt-1">
                    {post.title}
                  </h3>
                  <span className="text-xs text-slate-400 mt-2 block">
                    {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('vi-VN') : ''}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Main Posts Grid - Clean Card Design */}
      {posts.length === 0 ? (
        <div className="text-center py-16">
          <Bookmark size={64} className="mx-auto mb-4 text-slate-300" />
          <h2 className="text-xl font-semibold text-slate-600 mb-2">Không tìm thấy bài viết</h2>
          <p className="text-slate-500">Thử chọn danh mục khác</p>
        </div>
      ) : (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-900">
              {selectedCategory ? categoryMap.get(selectedCategory) : 'Bài viết mới nhất'}
            </h2>
            <span className="text-sm text-slate-500">{posts.length} bài viết</span>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Link key={post._id} href={`/posts/${post.slug}`} className="group">
                <article className="h-full flex flex-col">
                  {/* Image */}
                  <div className="aspect-[16/10] rounded-xl overflow-hidden bg-slate-100 mb-4">
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
                  {/* Content */}
                  <div className="flex-1 flex flex-col">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className="text-xs font-semibold uppercase tracking-wide"
                        style={{ color: brandColor }}
                      >
                        {categoryMap.get(post.categoryId) || 'Tin tức'}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-xs text-slate-400">
                        {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('vi-VN') : ''}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 line-clamp-2 group-hover:text-slate-600 transition-colors mb-2">
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className="text-sm text-slate-500 line-clamp-2 flex-1">
                        {post.excerpt}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-100 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Eye size={12} />
                        {post.views.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        3 phút đọc
                      </span>
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
