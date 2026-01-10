'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { FileText, Calendar, Eye, Loader2 } from 'lucide-react';

type BlogStyle = 'grid' | 'list' | 'featured';

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
      <section className="py-16 px-4">
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
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">{title}</h2>
          <p className="text-slate-500">Chưa có bài viết nào được xuất bản.</p>
        </div>
      </section>
    );
  }

  // Style 1: Grid
  if (style === 'grid') {
    return (
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-slate-900">{title}</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {posts.slice(0, 3).map((post) => (
              <Link key={post._id} href={`/posts/${post.slug}`} className="group">
                <article className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border h-full flex flex-col">
                  <div className="aspect-video bg-slate-100 overflow-hidden">
                    {post.thumbnail ? (
                      <img 
                        src={post.thumbnail} 
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FileText size={48} className="text-slate-300" />
                      </div>
                    )}
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <span className="text-xs font-medium" style={{ color: brandColor }}>
                      {categoryMap.get(post.categoryId) || 'Tin tức'}
                    </span>
                    <h4 className="font-semibold mt-1 mb-2 line-clamp-2 flex-1 group-hover:text-blue-600 transition-colors">
                      {post.title}
                    </h4>
                    {post.excerpt && (
                      <p className="text-sm text-slate-500 line-clamp-2 mb-3">{post.excerpt}</p>
                    )}
                    <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('vi-VN') : ''}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye size={12} />
                        {post.views}
                      </span>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
          {showViewAll && (
            <div className="text-center mt-8">
              <Link 
                href="/posts" 
                className="inline-flex px-6 py-3 rounded-lg font-medium transition-colors hover:opacity-80" 
                style={{ backgroundColor: `${brandColor}15`, color: brandColor }}
              >
                Xem tất cả
              </Link>
            </div>
          )}
        </div>
      </section>
    );
  }

  // Style 2: List
  if (style === 'list') {
    return (
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-slate-900">{title}</h2>
          <div className="space-y-4">
            {posts.slice(0, 4).map((post) => (
              <Link key={post._id} href={`/posts/${post.slug}`} className="group block">
                <article className="bg-white rounded-xl overflow-hidden border flex flex-col md:flex-row md:items-center hover:shadow-md transition-shadow">
                  <div className="aspect-video md:w-48 md:h-28 bg-slate-100 overflow-hidden flex-shrink-0">
                    {post.thumbnail ? (
                      <img 
                        src={post.thumbnail} 
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FileText size={24} className="text-slate-300" />
                      </div>
                    )}
                  </div>
                  <div className="p-4 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span 
                        className="text-xs font-medium px-2 py-0.5 rounded-full" 
                        style={{ backgroundColor: `${brandColor}15`, color: brandColor }}
                      >
                        {categoryMap.get(post.categoryId) || 'Tin tức'}
                      </span>
                      <span className="text-xs text-slate-400">
                        {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('vi-VN') : ''}
                      </span>
                    </div>
                    <h4 className="font-semibold group-hover:text-blue-600 transition-colors">{post.title}</h4>
                    {post.excerpt && (
                      <p className="text-sm text-slate-500 mt-1 line-clamp-2">{post.excerpt}</p>
                    )}
                  </div>
                </article>
              </Link>
            ))}
          </div>
          {showViewAll && (
            <div className="text-center mt-8">
              <Link 
                href="/posts" 
                className="inline-flex px-6 py-3 rounded-lg font-medium transition-colors hover:opacity-80" 
                style={{ backgroundColor: `${brandColor}15`, color: brandColor }}
              >
                Xem tất cả
              </Link>
            </div>
          )}
        </div>
      </section>
    );
  }

  // Style 3: Featured (modern hero + grid layout)
  const [featuredPost, ...otherPosts] = posts;
  
  return (
    <section className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-sm font-medium uppercase tracking-wider mb-1" style={{ color: brandColor }}>Blog</p>
            <h2 className="text-3xl font-bold text-slate-900">{title}</h2>
          </div>
          {showViewAll && (
            <Link 
              href="/posts" 
              className="text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all" 
              style={{ color: brandColor }}
            >
              Xem tất cả <span>→</span>
            </Link>
          )}
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {/* Main Featured Post */}
          {featuredPost && (
            <Link href={`/posts/${featuredPost.slug}`} className="md:col-span-2 group">
              <article className="relative rounded-2xl overflow-hidden bg-slate-900 h-full">
                <div className="aspect-[16/10] relative">
                  {featuredPost.thumbnail ? (
                    <img 
                      src={featuredPost.thumbnail} 
                      alt={featuredPost.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
                      <FileText size={64} className="text-slate-600" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <span 
                    className="inline-block px-3 py-1 rounded-full text-xs font-medium mb-3" 
                    style={{ backgroundColor: brandColor }}
                  >
                    {categoryMap.get(featuredPost.categoryId) || 'Tin tức'}
                  </span>
                  <h3 className="text-2xl font-bold mb-2 group-hover:underline decoration-2 underline-offset-4">
                    {featuredPost.title}
                  </h3>
                  {featuredPost.excerpt && (
                    <p className="text-white/80 line-clamp-2 mb-3">{featuredPost.excerpt}</p>
                  )}
                  <div className="flex items-center gap-3 text-sm text-white/60">
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      {featuredPost.publishedAt ? new Date(featuredPost.publishedAt).toLocaleDateString('vi-VN') : ''}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Eye size={14} />
                      {featuredPost.views} views
                    </span>
                  </div>
                </div>
              </article>
            </Link>
          )}
          
          {/* Secondary Posts */}
          <div className="flex flex-col gap-4">
            {otherPosts.slice(0, 2).map((post) => (
              <Link key={post._id} href={`/posts/${post.slug}`} className="group flex-1">
                <article className="bg-white rounded-xl border overflow-hidden h-full flex flex-col hover:shadow-md transition-shadow">
                  <div className="h-28 bg-slate-100 overflow-hidden flex-shrink-0">
                    {post.thumbnail ? (
                      <img 
                        src={post.thumbnail} 
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FileText size={32} className="text-slate-300" />
                      </div>
                    )}
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <span className="text-xs font-medium" style={{ color: brandColor }}>
                      {categoryMap.get(post.categoryId) || 'Tin tức'}
                    </span>
                    <h4 className="font-semibold mt-1 line-clamp-2 group-hover:text-blue-600 transition-colors flex-1">
                      {post.title}
                    </h4>
                    <span className="text-xs text-slate-400 mt-2">
                      {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('vi-VN') : ''}
                    </span>
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
