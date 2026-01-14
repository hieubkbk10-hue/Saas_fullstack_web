'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { FileText, Loader2, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

// Modern News Feed UI/UX - 6 Variants (synced with BlogPreview)
type BlogStyle = 'grid' | 'list' | 'featured' | 'magazine' | 'carousel' | 'minimal';

interface BlogSectionProps {
  config: Record<string, unknown>;
  brandColor: string;
  title: string;
}

export function BlogSection({ config, brandColor, title }: BlogSectionProps) {
  const style = (config.style as BlogStyle) || 'grid';
  const itemCount = (config.itemCount as number) || 6;
  
  // Query real posts from database
  const postsData = useQuery(api.posts.listPublished, { 
    paginationOpts: { numItems: Math.min(itemCount, 10), cursor: null } 
  });
  
  // Query categories for mapping
  const categories = useQuery(api.postCategories.listActive, { limit: 20 });
  
  // Build category map for O(1) lookup
  const categoryMap = React.useMemo(() => {
    if (!categories) return new Map<string, string>();
    return new Map(categories.map(c => [c._id, c.name]));
  }, [categories]);

  // Loading state
  if (postsData === undefined) {
    return (
      <section className="py-12 md:py-16 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-center min-h-[200px]">
          <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
        </div>
      </section>
    );
  }

  const posts = postsData.page;
  const showViewAll = posts.length > 0;

  // No posts state
  if (posts.length === 0) {
    return (
      <section className="py-12 md:py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tighter text-slate-900 mb-4">{title}</h2>
          <p className="text-slate-500">Chưa có bài viết nào được xuất bản.</p>
        </div>
      </section>
    );
  }

  // Style 1: Grid - Professional card grid với hover lift
  if (style === 'grid') {
    return (
      <section className="py-12 md:py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tighter text-left mb-8 md:mb-10 text-slate-900">
            {title}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 xl:gap-8">
            {posts.slice(0, 6).map((post) => (
              <Link key={post._id} href={`/posts/${post.slug}`} className="group">
                <article className="flex flex-col overflow-hidden rounded-xl border border-slate-200/60 bg-white shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 h-full">
                  {/* Image */}
                  <div className="relative aspect-[16/10] overflow-hidden">
                    {post.thumbnail ? (
                      <img 
                        src={post.thumbnail} 
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                        <FileText size={32} className="text-slate-400" />
                      </div>
                    )}
                    <div className="absolute left-3 top-3">
                      <span className="px-2 py-1 text-xs font-medium rounded bg-white/90 shadow-sm backdrop-blur-sm">
                        {categoryMap.get(post.categoryId) || 'Tin tức'}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex flex-1 flex-col p-4">
                    <h3 className="mb-2 text-base md:text-lg font-bold leading-tight tracking-tight text-slate-900 group-hover:text-opacity-80 transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <div className="mt-auto pt-2">
                      <time className="text-xs text-slate-500">
                        {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('vi-VN') : ''}
                      </time>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
          
          {/* View All */}
          {showViewAll && (
            <div className="flex justify-center pt-8 md:pt-10">
              <Link 
                href="/posts" 
                className="group inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
              >
                Xem tất cả
                <span className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5">↗</span>
              </Link>
            </div>
          )}
        </div>
      </section>
    );
  }

  // Style 2: List - Horizontal cards với image trái
  if (style === 'list') {
    return (
      <section className="py-12 md:py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tighter text-left mb-8 md:mb-10 text-slate-900">
            {title}
          </h2>
          <div className="grid gap-4">
            {posts.slice(0, 5).map((post) => (
              <Link key={post._id} href={`/posts/${post.slug}`} className="group block">
                <article className="flex w-full flex-col sm:flex-row overflow-hidden rounded-lg border border-slate-200/60 bg-white hover:bg-slate-50/50 transition-all">
                  {/* Image */}
                  <div className="aspect-[16/9] sm:aspect-[4/3] w-full sm:w-[220px] overflow-hidden flex-shrink-0">
                    {post.thumbnail ? (
                      <img 
                        src={post.thumbnail} 
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                        <FileText size={24} className="text-slate-400" />
                      </div>
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className="flex flex-1 flex-col justify-center p-4 sm:px-6">
                    <div className="mb-2">
                      <span className="text-xs font-semibold" style={{ color: brandColor }}>
                        {categoryMap.get(post.categoryId) || 'Tin tức'}
                      </span>
                    </div>
                    <h3 className="mb-2 text-base md:text-lg font-bold leading-snug text-slate-900 group-hover:text-opacity-80 transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <time className="text-xs text-slate-500">
                      {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('vi-VN') : ''}
                    </time>
                  </div>
                </article>
              </Link>
            ))}
          </div>
          
          {/* View All */}
          {showViewAll && (
            <div className="flex justify-center pt-8 md:pt-10">
              <Link 
                href="/posts" 
                className="group inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
              >
                Xem tất cả
                <span className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5">↗</span>
              </Link>
            </div>
          )}
        </div>
      </section>
    );
  }

  // Style 3: Featured - Hero card + sidebar compact list
  const [featuredPost, ...otherPosts] = posts;
  
  return (
    <section className="py-12 md:py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8 md:mb-10">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tighter text-slate-900">
            {title}
          </h2>
          {showViewAll && (
            <Link 
              href="/posts" 
              className="group flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
            >
              Xem tất cả
              <span className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5">↗</span>
            </Link>
          )}
        </div>
        
        <div className="grid gap-6 md:gap-8 lg:grid-cols-12">
          {/* Main Hero Card - 8 columns */}
          {featuredPost && (
            <Link href={`/posts/${featuredPost.slug}`} className="lg:col-span-8 group">
              <article className="relative flex h-full min-h-[300px] md:min-h-[400px] lg:min-h-[500px] flex-col justify-end overflow-hidden rounded-xl bg-slate-900 text-white shadow-md hover:shadow-xl transition-all">
                {/* Background */}
                <div className="absolute inset-0 z-0">
                  {featuredPost.thumbnail ? (
                    <img 
                      src={featuredPost.thumbnail} 
                      alt={featuredPost.title}
                      className="w-full h-full object-cover opacity-60 group-hover:scale-105 group-hover:opacity-50 transition-all duration-700"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-900 opacity-60 group-hover:opacity-50 transition-opacity duration-700" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />
                </div>

                {/* Content */}
                <div className="relative z-10 p-6 md:p-8">
                  <div className="mb-3 flex items-center space-x-3">
                    <span 
                      className="px-2.5 py-1 text-xs font-medium rounded backdrop-blur-md border-none"
                      style={{ backgroundColor: `${brandColor}40`, color: 'white' }}
                    >
                      {categoryMap.get(featuredPost.categoryId) || 'Tin tức'}
                    </span>
                  </div>
                  
                  <h3 className="mb-2 text-xl sm:text-2xl md:text-3xl font-bold leading-tight tracking-tight text-white">
                    {featuredPost.title}
                  </h3>
                  
                  <time className="text-sm font-medium text-slate-300">
                    {featuredPost.publishedAt ? new Date(featuredPost.publishedAt).toLocaleDateString('vi-VN') : ''}
                  </time>
                </div>
              </article>
            </Link>
          )}

          {/* Sidebar List - 4 columns */}
          <div className="flex flex-col gap-4 lg:col-span-4">
            <h3 className="font-semibold text-base md:text-lg mb-1 px-1 text-slate-700">Đáng chú ý khác</h3>
            {otherPosts.slice(0, 4).map((post) => (
              <Link key={post._id} href={`/posts/${post.slug}`} className="group">
                <article className="flex items-center space-x-4 rounded-lg p-2 hover:bg-slate-100/50 transition-colors">
                  <div className="relative h-14 w-14 md:h-16 md:w-16 shrink-0 overflow-hidden rounded-md border border-slate-200">
                    {post.thumbnail ? (
                      <img 
                        src={post.thumbnail} 
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                        <FileText size={16} className="text-slate-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: brandColor }}>
                      {categoryMap.get(post.categoryId) || 'Tin tức'}
                    </span>
                    <h4 className="text-sm font-semibold leading-snug text-slate-900 line-clamp-2 group-hover:text-opacity-80 transition-colors">
                      {post.title}
                    </h4>
                    <time className="mt-1 text-[10px] text-slate-500">
                      {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('vi-VN') : ''}
                    </time>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
