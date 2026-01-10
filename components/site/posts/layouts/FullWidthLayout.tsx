'use client';

import React from 'react';
import Link from 'next/link';
import { FileText, Calendar, Eye } from 'lucide-react';
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

interface FullWidthLayoutProps {
  posts: Post[];
  brandColor: string;
  categoryMap: Map<string, string>;
  viewMode: 'grid' | 'list';
}

export function FullWidthLayout({ posts, brandColor, categoryMap, viewMode }: FullWidthLayoutProps) {
  if (posts.length === 0) {
    return (
      <div className="text-center py-16">
        <FileText size={64} className="mx-auto mb-4 text-slate-300" />
        <h2 className="text-xl font-semibold text-slate-600 mb-2">Không tìm thấy bài viết</h2>
        <p className="text-slate-500">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
      </div>
    );
  }

  if (viewMode === 'list') {
    return (
      <div className="space-y-4">
        {posts.map((post) => (
          <Link key={post._id} href={`/posts/${post.slug}`} className="group block">
            <article className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-slate-100 flex flex-col md:flex-row">
              <div className="md:w-64 lg:w-72 flex-shrink-0">
                <div className="aspect-video md:aspect-[4/3] md:h-full bg-slate-100 overflow-hidden relative">
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
                    {post.views.toLocaleString()} lượt xem
                  </span>
                  <span 
                    className="font-medium group-hover:gap-2 transition-all flex items-center gap-1" 
                    style={{ color: brandColor }}
                  >
                    Đọc tiếp <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </span>
                </div>
              </div>
            </article>
          </Link>
        ))}
      </div>
    );
  }

  // Grid view
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
                  <span>{post.views.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </article>
        </Link>
      ))}
    </div>
  );
}
