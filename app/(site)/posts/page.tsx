'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useBrandColor } from '@/components/site/hooks';
import { Loader2, FileText, Calendar, Eye } from 'lucide-react';
import { Id } from '@/convex/_generated/dataModel';

type PostsListStyle = 'grid' | 'list' | 'magazine';

// Hook lấy posts style từ settings
function usePostsStyle(): PostsListStyle {
  const setting = useQuery(api.settings.getByKey, { key: 'posts_list_style' });
  return (setting?.value as PostsListStyle) || 'grid';
}

export default function PostsPage() {
  const brandColor = useBrandColor();
  const style = usePostsStyle();
  const posts = useQuery(api.posts.listPublished, { paginationOpts: { numItems: 12, cursor: null } });
  const categories = useQuery(api.postCategories.listActive, { limit: 20 });
  
  // Build category map for O(1) lookup
  const categoryMap = React.useMemo(() => {
    if (!categories) return new Map<string, string>();
    return new Map(categories.map(c => [c._id, c.name]));
  }, [categories]);

  if (posts === undefined) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  const postList = posts.page;

  return (
    <div className="py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-sm font-medium uppercase tracking-wider mb-2" style={{ color: brandColor }}>Blog</p>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Tin tức & Bài viết</h1>
          <p className="text-slate-500 max-w-2xl mx-auto">Cập nhật những tin tức mới nhất và các bài viết hữu ích từ chúng tôi</p>
        </div>

        {postList.length === 0 ? (
          <div className="text-center py-20">
            <FileText size={64} className="mx-auto mb-4 text-slate-300" />
            <h2 className="text-xl font-semibold text-slate-600 mb-2">Chưa có bài viết</h2>
            <p className="text-slate-500">Các bài viết sẽ xuất hiện ở đây khi được xuất bản.</p>
          </div>
        ) : (
          <>
            {style === 'grid' && <GridStyle posts={postList} brandColor={brandColor} categoryMap={categoryMap} />}
            {style === 'list' && <ListStyle posts={postList} brandColor={brandColor} categoryMap={categoryMap} />}
            {style === 'magazine' && <MagazineStyle posts={postList} brandColor={brandColor} categoryMap={categoryMap} />}
          </>
        )}
      </div>
    </div>
  );
}

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

interface StyleProps {
  posts: Post[];
  brandColor: string;
  categoryMap: Map<string, string>;
}

// Style 1: Grid - Cards đều nhau
function GridStyle({ posts, brandColor, categoryMap }: StyleProps) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {posts.map((post) => (
        <Link key={post._id} href={`/posts/${post.slug}`} className="group">
          <article className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-slate-100 h-full flex flex-col">
            <div className="aspect-video bg-slate-100 overflow-hidden relative">
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
            <div className="p-5 flex-1 flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <span 
                  className="text-xs font-medium px-2.5 py-1 rounded-full"
                  style={{ backgroundColor: `${brandColor}15`, color: brandColor }}
                >
                  {categoryMap.get(post.categoryId) || 'Tin tức'}
                </span>
              </div>
              <h2 className="text-lg font-semibold text-slate-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors flex-1">
                {post.title}
              </h2>
              {post.excerpt && (
                <p className="text-sm text-slate-500 line-clamp-2 mb-4">{post.excerpt}</p>
              )}
              <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-1">
                  <Calendar size={12} />
                  <span>{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('vi-VN') : ''}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye size={12} />
                  <span>{post.views}</span>
                </div>
              </div>
            </div>
          </article>
        </Link>
      ))}
    </div>
  );
}

// Style 2: List - Danh sách ngang
function ListStyle({ posts, brandColor, categoryMap }: StyleProps) {
  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <Link key={post._id} href={`/posts/${post.slug}`} className="group block">
          <article className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-slate-100 flex flex-col md:flex-row">
            <div className="md:w-72 lg:w-80 flex-shrink-0">
              <div className="aspect-video md:aspect-[4/3] bg-slate-100 overflow-hidden h-full relative">
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
            </div>
            <div className="p-6 flex-1 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-3">
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
              <h2 className="text-xl font-semibold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                {post.title}
              </h2>
              {post.excerpt && (
                <p className="text-sm text-slate-500 line-clamp-2 mb-4">{post.excerpt}</p>
              )}
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1 text-slate-400">
                  <Eye size={14} />
                  {post.views} lượt xem
                </span>
                <span className="font-medium group-hover:gap-2 transition-all flex items-center gap-1" style={{ color: brandColor }}>
                  Đọc tiếp <span>→</span>
                </span>
              </div>
            </div>
          </article>
        </Link>
      ))}
    </div>
  );
}

// Style 3: Magazine - Bài đầu lớn + grid nhỏ
function MagazineStyle({ posts, brandColor, categoryMap }: StyleProps) {
  const [featuredPost, ...otherPosts] = posts;

  return (
    <div className="space-y-8">
      {/* Featured Post */}
      {featuredPost && (
        <Link href={`/posts/${featuredPost.slug}`} className="group block">
          <article className="relative rounded-2xl overflow-hidden bg-slate-900">
            <div className="aspect-[16/9] md:aspect-[21/9] relative">
              {featuredPost.thumbnail ? (
                <img 
                  src={featuredPost.thumbnail} 
                  alt={featuredPost.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
                  <FileText size={80} className="text-slate-600" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 text-white">
              <span 
                className="inline-block px-3 py-1 rounded-full text-xs font-medium mb-4"
                style={{ backgroundColor: brandColor }}
              >
                {categoryMap.get(featuredPost.categoryId) || 'Tin tức'}
              </span>
              <h2 className="text-2xl md:text-4xl font-bold mb-3 group-hover:underline decoration-2 underline-offset-4">
                {featuredPost.title}
              </h2>
              {featuredPost.excerpt && (
                <p className="text-white/80 line-clamp-2 max-w-3xl mb-4 text-sm md:text-base">{featuredPost.excerpt}</p>
              )}
              <div className="flex items-center gap-4 text-sm text-white/60">
                <span className="flex items-center gap-1">
                  <Calendar size={14} />
                  {featuredPost.publishedAt ? new Date(featuredPost.publishedAt).toLocaleDateString('vi-VN') : ''}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Eye size={14} />
                  {featuredPost.views} lượt xem
                </span>
              </div>
            </div>
          </article>
        </Link>
      )}

      {/* Other Posts Grid */}
      {otherPosts.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {otherPosts.map((post) => (
            <Link key={post._id} href={`/posts/${post.slug}`} className="group">
              <article className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-slate-100">
                <div className="aspect-video bg-slate-100 overflow-hidden relative">
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
                <div className="p-4">
                  <span 
                    className="text-xs font-medium"
                    style={{ color: brandColor }}
                  >
                    {categoryMap.get(post.categoryId) || 'Tin tức'}
                  </span>
                  <h3 className="font-semibold text-slate-900 mt-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {post.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-3 text-xs text-slate-400">
                    <span>{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('vi-VN') : ''}</span>
                    <span>•</span>
                    <span>{post.views} views</span>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
