'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useBrandColor } from '@/components/site/hooks';
import { Loader2, LayoutGrid, List } from 'lucide-react';
import { Id } from '@/convex/_generated/dataModel';
import {
  PostsFilter,
  FullWidthLayout,
  SidebarLayout,
  MagazineLayout,
  type SortOption,
} from '@/components/site/posts';

type PostsListLayout = 'fullwidth' | 'sidebar' | 'magazine';

function usePostsLayout(): PostsListLayout {
  const setting = useQuery(api.settings.getByKey, { key: 'posts_list_style' });
  const value = setting?.value as string;
  // Map old values to new layout types
  if (value === 'grid' || value === 'list') return 'fullwidth';
  if (value === 'sidebar') return 'sidebar';
  if (value === 'magazine') return 'magazine';
  return 'fullwidth'; // default
}

export default function PostsPage() {
  const brandColor = useBrandColor();
  const layout = usePostsLayout();
  
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<Id<"postCategories"> | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Queries
  const categories = useQuery(api.postCategories.listActive, { limit: 20 });
  const posts = useQuery(api.posts.searchPublished, {
    search: searchQuery || undefined,
    categoryId: selectedCategory ?? undefined,
    sortBy,
    limit: 24,
  });
  const totalCount = useQuery(api.posts.countPublished, {
    categoryId: selectedCategory ?? undefined,
  });
  const featuredPosts = useQuery(api.posts.listFeatured, { limit: 5 });
  const recentPosts = useQuery(api.posts.searchPublished, { sortBy: 'newest', limit: 5 });
  const popularPosts = useQuery(api.posts.searchPublished, { sortBy: 'popular', limit: 5 });

  // Build category map for O(1) lookup
  const categoryMap = useMemo(() => {
    if (!categories) return new Map<string, string>();
    return new Map(categories.map((c) => [c._id, c.name]));
  }, [categories]);

  // Handlers
  const handleCategoryChange = useCallback((categoryId: Id<"postCategories"> | null) => {
    setSelectedCategory(categoryId);
  }, []);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleSortChange = useCallback((sort: SortOption) => {
    setSortBy(sort);
  }, []);

  // Loading state
  if (posts === undefined || categories === undefined) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="py-8 md:py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <p
            className="text-sm font-medium uppercase tracking-wider mb-2"
            style={{ color: brandColor }}
          >
            Blog
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Tin tức & Bài viết
          </h1>
          <p className="text-slate-500 max-w-2xl mx-auto">
            Cập nhật những tin tức mới nhất và các bài viết hữu ích từ chúng tôi
          </p>
        </div>

        {/* Layout based rendering */}
        {layout === 'fullwidth' && (
          <>
            {/* Filter Bar */}
            <div className="mb-8">
              <PostsFilter
                categories={categories}
                selectedCategory={selectedCategory}
                onCategoryChange={handleCategoryChange}
                searchQuery={searchQuery}
                onSearchChange={handleSearchChange}
                sortBy={sortBy}
                onSortChange={handleSortChange}
                totalResults={totalCount ?? posts.length}
                brandColor={brandColor}
              />
            </div>

            {/* View Mode Toggle */}
            <div className="flex justify-end mb-4">
              <div className="flex bg-slate-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-white shadow-sm text-slate-900'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                  title="Hiển thị lưới"
                >
                  <LayoutGrid size={18} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'list'
                      ? 'bg-white shadow-sm text-slate-900'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                  title="Hiển thị danh sách"
                >
                  <List size={18} />
                </button>
              </div>
            </div>

            {/* Posts */}
            <FullWidthLayout
              posts={posts}
              brandColor={brandColor}
              categoryMap={categoryMap}
              viewMode={viewMode}
            />
          </>
        )}

        {layout === 'sidebar' && (
          <SidebarLayout
            posts={posts}
            brandColor={brandColor}
            categoryMap={categoryMap}
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            recentPosts={recentPosts ?? []}
            popularPosts={popularPosts ?? []}
          />
        )}

        {layout === 'magazine' && (
          <MagazineLayout
            posts={posts}
            brandColor={brandColor}
            categoryMap={categoryMap}
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
            featuredPosts={featuredPosts ?? []}
          />
        )}

        {/* Load More (for all layouts) */}
        {posts.length >= 24 && (
          <div className="text-center mt-8">
            <button
              className="px-6 py-3 rounded-lg font-medium transition-colors"
              style={{ backgroundColor: `${brandColor}15`, color: brandColor }}
            >
              Xem thêm bài viết
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
