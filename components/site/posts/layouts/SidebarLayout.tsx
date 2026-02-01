'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronDown, Eye, FileText, Folder, Search } from 'lucide-react';
import type { Id } from '@/convex/_generated/dataModel';
import type { SortOption } from '../PostsFilter';

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
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  enabledFields: Set<string>;
  showSearch?: boolean;
  showCategories?: boolean;
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { label: 'Mới nhất', value: 'newest' },
  { label: 'Cũ nhất', value: 'oldest' },
  { label: 'Xem nhiều', value: 'popular' },
  { label: 'Theo tên A-Z', value: 'title' },
];

export function SidebarLayout({
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
  enabledFields,
  showSearch = true,
  showCategories = true,
}: SidebarLayoutProps) {
  const showExcerpt = enabledFields.has('excerpt');

  return (
    <div className="flex flex-col lg:flex-row gap-5">
      {/* Sidebar */}
      <aside className="lg:w-64 flex-shrink-0 order-2 lg:order-1">
        <div className="lg:sticky lg:top-24 space-y-3">
          {/* Search Widget */}
          {showSearch && (
            <div className="bg-white rounded-lg border border-slate-200 p-3">
              <h3 className="font-semibold text-slate-900 text-sm mb-2 flex items-center gap-2">
                <Search size={14} style={{ color: brandColor }} />
                Tìm kiếm
              </h3>
              <input
                type="text"
                placeholder="Nhập từ khóa..."
                value={searchQuery}
                onChange={(e) =>{  onSearchChange(e.target.value); }}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': brandColor } as React.CSSProperties}
              />
            </div>
          )}

          {/* Categories Widget */}
          {showCategories && (
            <div className="bg-white rounded-lg border border-slate-200 p-3">
              <h3 className="font-semibold text-slate-900 text-sm mb-2 flex items-center gap-2">
                <Folder size={14} style={{ color: brandColor }} />
                Danh mục
              </h3>
              <ul className="space-y-0.5">
                <li>
                  <button
                    onClick={() =>{  onCategoryChange(null); }}
                    className={`w-full text-left px-2.5 py-1.5 rounded text-sm transition-colors ${
                      !selectedCategory ? 'font-medium' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                    style={!selectedCategory ? { backgroundColor: `${brandColor}15`, color: brandColor } : undefined}
                  >
                    Tất cả
                  </button>
                </li>
                {categories.map((category) => (
                  <li key={category._id}>
                    <button
                      onClick={() =>{  onCategoryChange(category._id); }}
                      className={`w-full text-left px-2.5 py-1.5 rounded text-sm transition-colors ${
                        selectedCategory === category._id ? 'font-medium' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                      style={selectedCategory === category._id ? { backgroundColor: `${brandColor}15`, color: brandColor } : undefined}
                    >
                      {category.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Sort Widget */}
          <div className="bg-white rounded-lg border border-slate-200 p-3">
            <h3 className="font-semibold text-slate-900 text-sm mb-2">Sắp xếp</h3>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) =>{  onSortChange(e.target.value as SortOption); }}
                className="w-full appearance-none px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 cursor-pointer"
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
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 order-1 lg:order-2">
        {posts.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-lg border border-slate-200">
            <FileText size={40} className="mx-auto mb-2 text-slate-300" />
            <h2 className="text-base font-semibold text-slate-600 mb-1">Không tìm thấy bài viết</h2>
            <p className="text-sm text-slate-500">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {posts.map((post) => (
              <Link key={post._id} href={`/posts/${post.slug}`} className="group block">
                <article className="bg-white rounded-lg overflow-hidden hover:shadow-md transition-all duration-200 border border-slate-200">
                  <div className="flex flex-col sm:flex-row">
                    <div className="sm:w-40 md:w-48 flex-shrink-0">
                      <div className="aspect-video sm:aspect-[4/3] sm:h-full bg-slate-100 overflow-hidden relative">
                      {post.thumbnail ? (
                        <Image
                          src={post.thumbnail}
                          alt={post.title}
                          fill
                          sizes="96px"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <FileText size={28} className="text-slate-300" />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="p-3 flex-1 flex flex-col justify-center">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium px-2 py-0.5 rounded" style={{ backgroundColor: `${brandColor}15`, color: brandColor }}>
                          {categoryMap.get(post.categoryId) ?? 'Tin tức'}
                        </span>
                        {post.publishedAt && (
                          <span className="text-xs text-slate-400">
                            {new Date(post.publishedAt).toLocaleDateString('vi-VN')}
                          </span>
                        )}
                      </div>
                      <h2 className="text-sm font-semibold text-slate-900 group-hover:text-opacity-70 transition-colors duration-200 line-clamp-2 mb-1">
                        {post.title}
                      </h2>
                      {showExcerpt && post.excerpt && (
                        <p className="text-xs text-slate-500 line-clamp-2 mb-1.5">{post.excerpt}</p>
                      )}
                      <div className="flex items-center gap-1 text-xs text-slate-400">
                        <Eye size={12} />
                        <span>{post.views.toLocaleString()}</span>
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

export function SidebarLayoutSkeleton() {
  return (
    <div className="flex flex-col lg:flex-row gap-5 animate-pulse">
      {/* Sidebar Skeleton */}
      <aside className="lg:w-64 flex-shrink-0 order-2 lg:order-1">
        <div className="lg:sticky lg:top-24 space-y-3">
          {/* Search Widget Skeleton */}
          <div className="bg-white rounded-lg border border-slate-200 p-3">
            <div className="h-4 w-20 bg-slate-200 rounded mb-2" />
            <div className="h-9 bg-slate-200 rounded-lg" />
          </div>

          {/* Categories Widget Skeleton */}
          <div className="bg-white rounded-lg border border-slate-200 p-3">
            <div className="h-4 w-16 bg-slate-200 rounded mb-2" />
            <div className="space-y-0.5">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-8 bg-slate-200 rounded" />
              ))}
            </div>
          </div>

          {/* Sort Widget Skeleton */}
          <div className="bg-white rounded-lg border border-slate-200 p-3">
            <div className="h-4 w-16 bg-slate-200 rounded mb-2" />
            <div className="h-9 bg-slate-200 rounded-lg" />
          </div>
        </div>
      </aside>

      {/* Main Content Skeleton */}
      <main className="flex-1 order-1 lg:order-2">
        <div className="space-y-2.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-white rounded-lg overflow-hidden border border-slate-200">
              <div className="flex flex-col sm:flex-row">
                <div className="sm:w-40 md:w-48 flex-shrink-0">
                  <div className="aspect-video sm:aspect-[4/3] bg-slate-200" />
                </div>
                <div className="p-3 flex-1 space-y-2">
                  <div className="h-4 w-16 bg-slate-200 rounded" />
                  <div className="h-4 w-full bg-slate-200 rounded" />
                  <div className="h-4 w-3/4 bg-slate-200 rounded" />
                  <div className="h-3 w-12 bg-slate-200 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
