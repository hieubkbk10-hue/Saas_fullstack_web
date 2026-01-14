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

  // Style 1: Grid - Professional card grid với brandColor hover
  if (style === 'grid') {
    return (
      <section className="py-12 md:py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tighter text-left mb-8 md:mb-10 text-slate-900">{title}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 xl:gap-8">
            {posts.slice(0, 6).map((post) => (
              <Link key={post._id} href={`/posts/${post.slug}`} className="group">
                <article 
                  className="flex flex-col overflow-hidden rounded-xl border bg-white transition-all duration-300 h-full hover:-translate-y-1"
                  style={{ borderColor: `${brandColor}15`, boxShadow: `0 2px 8px ${brandColor}08` }}
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    {post.thumbnail ? (
                      <img src={post.thumbnail} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: `${brandColor}10` }}>
                        <FileText size={32} style={{ color: `${brandColor}40` }} />
                      </div>
                    )}
                    <div className="absolute left-3 top-3">
                      <span className="px-2 py-1 text-xs font-medium rounded shadow-sm backdrop-blur-sm" style={{ backgroundColor: `${brandColor}15`, color: brandColor }}>
                        {categoryMap.get(post.categoryId) || 'Tin tức'}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <h3 className="mb-2 text-base md:text-lg font-bold leading-tight tracking-tight text-slate-900 group-hover:opacity-80 transition-colors line-clamp-2">{post.title}</h3>
                    {post.excerpt && <p className="text-sm text-slate-500 line-clamp-2 mb-2">{post.excerpt}</p>}
                    <div className="mt-auto pt-2">
                      <time className="text-xs text-slate-500">{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('vi-VN') : ''}</time>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
          {showViewAll && (
            <div className="flex justify-center pt-8 md:pt-10">
              <Link href="/posts" className="group inline-flex items-center gap-2 text-sm font-medium transition-colors" style={{ color: brandColor }}>
                Xem tất cả <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          )}
        </div>
      </section>
    );
  }

  // Style 2: List - Horizontal cards với brandColor hover
  if (style === 'list') {
    return (
      <section className="py-12 md:py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tighter text-left mb-8 md:mb-10 text-slate-900">{title}</h2>
          <div className="grid gap-4">
            {posts.slice(0, 5).map((post) => (
              <Link key={post._id} href={`/posts/${post.slug}`} className="group block">
                <article className="flex w-full flex-col sm:flex-row overflow-hidden rounded-lg border bg-white transition-all" style={{ borderColor: `${brandColor}15` }}>
                  <div className="aspect-[16/9] sm:aspect-[4/3] w-full sm:w-[220px] overflow-hidden flex-shrink-0">
                    {post.thumbnail ? (
                      <img src={post.thumbnail} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: `${brandColor}10` }}>
                        <FileText size={24} style={{ color: `${brandColor}40` }} />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col justify-center p-4 sm:px-6">
                    <div className="mb-2"><span className="text-xs font-semibold" style={{ color: brandColor }}>{categoryMap.get(post.categoryId) || 'Tin tức'}</span></div>
                    <h3 className="mb-2 text-base md:text-lg font-bold leading-snug text-slate-900 group-hover:opacity-80 transition-colors line-clamp-2">{post.title}</h3>
                    {post.excerpt && <p className="text-sm text-slate-500 line-clamp-2 mb-2">{post.excerpt}</p>}
                    <div className="flex items-center gap-3">
                      <time className="text-xs text-slate-500">{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('vi-VN') : ''}</time>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
          {showViewAll && (
            <div className="flex justify-center pt-8 md:pt-10">
              <Link href="/posts" className="group inline-flex items-center gap-2 text-sm font-medium transition-colors" style={{ color: brandColor }}>
                Xem tất cả <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          )}
        </div>
      </section>
    );
  }

  // Style 3: Featured - Hero card + sidebar compact list
  if (style === 'featured') {
    const [featuredPost, ...otherPosts] = posts;
    return (
      <section className="py-12 md:py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8 md:mb-10">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tighter text-slate-900">{title}</h2>
            {showViewAll && (
              <Link href="/posts" className="group flex items-center gap-1 text-sm font-medium transition-colors" style={{ color: brandColor }}>
                Xem tất cả <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </Link>
            )}
          </div>
          <div className="grid gap-6 md:gap-8 lg:grid-cols-12">
            {featuredPost && (
              <Link href={`/posts/${featuredPost.slug}`} className="lg:col-span-8 group">
                <article className="relative flex h-full min-h-[300px] md:min-h-[400px] lg:min-h-[500px] flex-col justify-end overflow-hidden rounded-xl text-white transition-all" style={{ boxShadow: `0 8px 30px ${brandColor}20` }}>
                  <div className="absolute inset-0 z-0">
                    {featuredPost.thumbnail ? (
                      <img src={featuredPost.thumbnail} alt={featuredPost.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    ) : (
                      <div className="w-full h-full" style={{ background: `linear-gradient(135deg, ${brandColor}40, ${brandColor}80)` }} />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />
                  </div>
                  <div className="relative z-10 p-6 md:p-8">
                    <div className="mb-3 flex items-center space-x-3">
                      <span className="px-2.5 py-1 text-xs font-medium rounded backdrop-blur-md" style={{ backgroundColor: `${brandColor}60`, color: 'white' }}>
                        {categoryMap.get(featuredPost.categoryId) || 'Tin tức'}
                      </span>
                    </div>
                    <h3 className="mb-2 text-xl sm:text-2xl md:text-3xl font-bold leading-tight tracking-tight text-white">{featuredPost.title}</h3>
                    {featuredPost.excerpt && <p className="text-sm text-slate-200 line-clamp-2 mb-3">{featuredPost.excerpt}</p>}
                    <time className="text-sm font-medium text-slate-300">{featuredPost.publishedAt ? new Date(featuredPost.publishedAt).toLocaleDateString('vi-VN') : ''}</time>
                  </div>
                </article>
              </Link>
            )}
            <div className="flex flex-col gap-3 lg:col-span-4">
              <h3 className="font-semibold text-base mb-1 px-1 text-slate-700">Đáng chú ý</h3>
              {otherPosts.slice(0, 4).map((post) => (
                <Link key={post._id} href={`/posts/${post.slug}`} className="group">
                  <article className="flex items-center space-x-4 rounded-lg p-2 border transition-all" style={{ borderColor: `${brandColor}10` }}>
                    <div className="relative h-14 w-14 md:h-16 md:w-16 shrink-0 overflow-hidden rounded-md border" style={{ borderColor: `${brandColor}15` }}>
                      {post.thumbnail ? (
                        <img src={post.thumbnail} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" loading="lazy" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: `${brandColor}10` }}>
                          <FileText size={16} style={{ color: `${brandColor}40` }} />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: brandColor }}>{categoryMap.get(post.categoryId) || 'Tin tức'}</span>
                      <h4 className="text-sm font-semibold leading-snug text-slate-900 line-clamp-2 group-hover:opacity-80 transition-colors">{post.title}</h4>
                      <time className="mt-1 text-[10px] text-slate-500">{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('vi-VN') : ''}</time>
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

  // Style 4: Magazine - Clean 3-column grid layout
  if (style === 'magazine') {
    const [featured, ...rest] = posts;
    const otherPosts = rest.slice(0, 4);
    return (
      <section className="py-12 md:py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8 md:mb-10">
            <div className="space-y-1">
              <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-widest" style={{ color: brandColor }}>
                <span className="w-6 h-[2px]" style={{ backgroundColor: brandColor }}></span>Magazine
              </div>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tighter text-slate-900">{title}</h2>
            </div>
            {showViewAll && (
              <Link href="/posts" className="group flex items-center gap-2 text-sm font-medium transition-colors" style={{ color: brandColor }}>
                Xem tất cả <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </Link>
            )}
          </div>
          {/* Mobile layout */}
          <div className="lg:hidden space-y-4">
            {featured && (
              <Link href={`/posts/${featured.slug}`} className="group block">
                <article className="relative rounded-xl overflow-hidden aspect-[16/9]" style={{ boxShadow: `0 4px 20px ${brandColor}15` }}>
                  {featured.thumbnail ? <img src={featured.thumbnail} alt={featured.title} className="w-full h-full object-cover" /> : <div className="w-full h-full" style={{ background: `linear-gradient(135deg, ${brandColor}30, ${brandColor}60)` }} />}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <span className="px-2 py-1 text-[10px] font-bold rounded mb-2 inline-block" style={{ backgroundColor: brandColor, color: 'white' }}>{categoryMap.get(featured.categoryId) || 'Tin tức'}</span>
                    <h3 className="text-lg font-bold text-white line-clamp-2">{featured.title}</h3>
                  </div>
                </article>
              </Link>
            )}
            <div className="grid grid-cols-2 gap-3">
              {otherPosts.map((post) => (
                <Link key={post._id} href={`/posts/${post.slug}`} className="group">
                  <article className="rounded-xl border overflow-hidden transition-all h-full" style={{ borderColor: `${brandColor}15` }}>
                    <div className="aspect-[16/10] overflow-hidden">
                      {post.thumbnail ? <img src={post.thumbnail} alt={post.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: `${brandColor}10` }}><FileText size={20} style={{ color: `${brandColor}40` }} /></div>}
                    </div>
                    <div className="p-3">
                      <h4 className="text-sm font-medium text-slate-900 line-clamp-2">{post.title}</h4>
                      <time className="text-[10px] text-slate-500 mt-1 block">{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('vi-VN') : ''}</time>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>
          {/* Desktop layout - Clean 3 column */}
          <div className="hidden lg:grid lg:grid-cols-3 gap-6">
            {/* Featured - Large card */}
            {featured && (
              <Link href={`/posts/${featured.slug}`} className="lg:row-span-2 group">
                <article className="relative rounded-2xl overflow-hidden h-full min-h-[420px]" style={{ boxShadow: `0 8px 30px ${brandColor}20` }}>
                  {featured.thumbnail ? <img src={featured.thumbnail} alt={featured.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" /> : <div className="w-full h-full" style={{ background: `linear-gradient(135deg, ${brandColor}40, ${brandColor}80)` }} />}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <span className="px-2.5 py-1 text-xs font-bold rounded mb-3 inline-block" style={{ backgroundColor: brandColor, color: 'white' }}>{categoryMap.get(featured.categoryId) || 'Nổi bật'}</span>
                    <h3 className="text-xl font-bold text-white leading-tight line-clamp-2 mb-2">{featured.title}</h3>
                    {featured.excerpt && <p className="text-sm text-slate-200 line-clamp-2 mb-3">{featured.excerpt}</p>}
                    <time className="text-sm text-slate-300">{featured.publishedAt ? new Date(featured.publishedAt).toLocaleDateString('vi-VN') : ''}</time>
                  </div>
                </article>
              </Link>
            )}
            {/* Other posts - Uniform cards */}
            {otherPosts.map((post) => (
              <Link key={post._id} href={`/posts/${post.slug}`} className="group">
                <article className="rounded-xl border overflow-hidden h-full flex flex-col transition-all" style={{ borderColor: `${brandColor}15` }}>
                  <div className="aspect-[16/10] overflow-hidden flex-shrink-0">
                    {post.thumbnail ? <img src={post.thumbnail} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /> : <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: `${brandColor}10` }}><FileText size={28} style={{ color: `${brandColor}40` }} /></div>}
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <span className="text-[10px] font-bold uppercase mb-1" style={{ color: brandColor }}>{categoryMap.get(post.categoryId) || 'Tin tức'}</span>
                    <h4 className="text-base font-semibold text-slate-900 line-clamp-2 mb-2 group-hover:opacity-80 transition-colors">{post.title}</h4>
                    <time className="text-xs text-slate-500 mt-auto">{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('vi-VN') : ''}</time>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Style 5: Carousel - Horizontal scrollable (hidden scrollbar)
  if (style === 'carousel') {
    return (
      <section className="py-12 md:py-16 px-4 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8 md:mb-10">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tighter text-slate-900">{title}</h2>
            <div className="flex items-center gap-3">
              <button className="w-9 h-9 rounded-full border flex items-center justify-center transition-colors" style={{ borderColor: `${brandColor}30` }}><ChevronLeft size={18} style={{ color: brandColor }} /></button>
              <button className="w-9 h-9 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: brandColor }}><ChevronRight size={18} /></button>
            </div>
          </div>
          <div 
            className="relative -mx-4 px-4 pb-4 overflow-x-auto"
            style={{ 
              scrollbarWidth: 'none', 
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            <style>{`.carousel-scroll::-webkit-scrollbar { display: none; }`}</style>
            <div className="carousel-scroll flex gap-4 md:gap-5 items-stretch" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {posts.slice(0, 6).map((post) => (
                <Link key={post._id} href={`/posts/${post.slug}`} className="flex-shrink-0 w-[280px] md:w-[320px] lg:w-[360px] group">
                  <article className="rounded-xl border overflow-hidden transition-all h-full flex flex-col" style={{ borderColor: `${brandColor}15` }}>
                    <div className="aspect-[16/10] overflow-hidden flex-shrink-0">{post.thumbnail ? <img src={post.thumbnail} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /> : <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: `${brandColor}10` }}><FileText size={32} style={{ color: `${brandColor}40` }} /></div>}</div>
                    <div className="p-4 flex flex-col flex-1">
                      <div className="flex items-center gap-2 mb-2"><span className="text-[10px] font-bold uppercase" style={{ color: brandColor }}>{categoryMap.get(post.categoryId) || 'Tin tức'}</span></div>
                      <h3 className="font-bold text-slate-900 line-clamp-2 mb-2 group-hover:opacity-80 transition-colors">{post.title}</h3>
                      <p className="text-sm text-slate-500 line-clamp-2 mb-3 flex-1">{post.excerpt || ''}</p>
                      <div className="flex items-center justify-between mt-auto"><time className="text-xs text-slate-500">{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('vi-VN') : ''}</time><ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: brandColor }} /></div>
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

  // Style 6: Minimal - Typography-first, clean design
  if (style === 'minimal') {
    return (
      <section className="py-12 md:py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between border-b pb-4 mb-8" style={{ borderColor: `${brandColor}20` }}>
            <h2 className="text-xl md:text-2xl lg:text-3xl font-light tracking-tight text-slate-900">{title}</h2>
            {showViewAll && (
              <Link href="/posts" className="group flex items-center gap-2 text-sm transition-colors" style={{ color: brandColor }}>
                Xem tất cả <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </Link>
            )}
          </div>
          <div className="space-y-0">
            {posts.slice(0, 5).map((post, index) => (
              <Link key={post._id} href={`/posts/${post.slug}`} className="group block">
                <article className="flex items-start gap-4 py-5 border-b transition-colors" style={{ borderColor: `${brandColor}10` }}>
                  <span className="text-xl md:text-2xl font-bold tabular-nums flex-shrink-0 w-8 md:w-10" style={{ color: `${brandColor}60` }}>{String(index + 1).padStart(2, '0')}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: brandColor }}>{categoryMap.get(post.categoryId) || 'Tin tức'}</span>
                      <span className="text-[10px] text-slate-400">•</span>
                      <time className="text-[10px] text-slate-500">{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('vi-VN') : ''}</time>
                    </div>
                    <h3 className="text-base md:text-lg font-semibold text-slate-900 group-hover:opacity-80 transition-colors line-clamp-2">{post.title}</h3>
                    {post.excerpt && <p className="text-sm text-slate-500 line-clamp-1 mt-1">{post.excerpt}</p>}
                  </div>
                  <ArrowRight size={18} className="flex-shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1" style={{ color: brandColor }} />
                </article>
              </Link>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Default fallback to grid
  return null;
}
