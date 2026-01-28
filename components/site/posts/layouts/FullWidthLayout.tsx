'use client';

import React from 'react';
import Link from 'next/link';
import { FileText, Eye } from 'lucide-react';
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
  enabledFields: Set<string>;
}

export function FullWidthLayout({ posts, brandColor, categoryMap, enabledFields }: FullWidthLayoutProps) {
  const showExcerpt = enabledFields.has('excerpt');
  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText size={48} className="mx-auto mb-3 text-slate-300" />
        <h2 className="text-lg font-semibold text-slate-600 mb-2">Không tìm thấy bài viết</h2>
        <p className="text-sm text-slate-500">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
      </div>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {posts.map((post) => (
        <Link key={post._id} href={`/posts/${post.slug}`} className="group">
          <article className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 border border-slate-100 h-full flex flex-col">
            <div className="aspect-video bg-slate-100 overflow-hidden">
              {post.thumbnail ? (
                <img 
                  src={post.thumbnail} 
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <FileText size={32} className="text-slate-300" />
                </div>
              )}
            </div>
            <div className="p-3 flex-1 flex flex-col">
              <div className="flex items-center gap-1.5 mb-1.5">
                <span 
                  className="text-xs font-medium px-1.5 py-0.5 rounded"
                  style={{ backgroundColor: `${brandColor}15`, color: brandColor }}
                >
                  {categoryMap.get(post.categoryId) || 'Tin tức'}
                </span>
              </div>
              <h2 className="text-sm font-semibold text-slate-900 line-clamp-2 group-hover:opacity-70 transition-opacity duration-200 flex-1">
                {post.title}
              </h2>
              {showExcerpt && post.excerpt && (
                <p className="text-xs text-slate-500 line-clamp-2 mt-1.5">{post.excerpt}</p>
              )}
              <div className="flex items-center justify-between text-xs text-slate-400 mt-2.5 pt-2.5 border-t border-slate-100">
                <span>{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('vi-VN') : ''}</span>
                <span className="flex items-center gap-1">
                  <Eye size={11} />
                  {post.views.toLocaleString()}
                </span>
              </div>
            </div>
          </article>
        </Link>
      ))}
    </div>
  );
}
