'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useQuery } from 'convex/react';
import { useSearchParams, useRouter } from 'next/navigation';
import { api } from '@/convex/_generated/api';
import { useBrandColor } from '@/components/site/hooks';
import { LayoutGrid, List } from 'lucide-react';
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

// Hook để lấy danh sách các fields đang bật cho posts module
function useEnabledPostFields(): Set<string> {
  const fields = useQuery(api.admin.modules.listEnabledModuleFields, { moduleKey: 'posts' });
  return useMemo(() => {
    if (!fields) return new Set<string>();
    return new Set(fields.map(f => f.fieldKey));
  }, [fields]);
}

export default function PostsPage() {
  const brandColor = useBrandColor();
  const layout = usePostsLayout();
  const enabledFields = useEnabledPostFields();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<Id<"postCategories"> | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Queries
  const categories = useQuery(api.postCategories.listActive, { limit: 20 });
  
  // Sync category from URL query param
  useEffect(() => {
    const catSlug = searchParams.get('catpost');
    if (catSlug && categories) {
      const matchedCategory = categories.find(c => c.slug === catSlug);
      if (matchedCategory) {
        setSelectedCategory(matchedCategory._id);
      }
    }
  }, [searchParams, categories]);
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
    
    // Update URL query param
    const params = new URLSearchParams(searchParams.toString());
    if (categoryId && categories) {
      const category = categories.find(c => c._id === categoryId);
      if (category) {
        params.set('catpost', category.slug);
      }
    } else {
      params.delete('catpost');
    }
    
    const newUrl = params.toString() ? `/posts?${params.toString()}` : '/posts';
    router.push(newUrl, { scroll: false });
  }, [searchParams, categories, router]);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleSortChange = useCallback((sort: SortOption) => {
    setSortBy(sort);
  }, []);

  // Loading state
  if (posts === undefined || categories === undefined) {
    return <PostsListSkeleton />;
  }

  return (
    <div className="py-8 md:py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
            Tin tức & Bài viết
          </h1>
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
              enabledFields={enabledFields}
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
            enabledFields={enabledFields}
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
            enabledFields={enabledFields}
          />
        )}

        {/* Load More (for all layouts) */}
        {posts.length >= 24 && (
          <div className="text-center mt-8">
            <button
              className="px-6 py-3 rounded-lg font-medium transition-colors duration-200 hover:opacity-80"
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

// Skeleton Loading Component
function PostsListSkeleton() {
  return (
    <div className="py-8 md:py-12 px-4 animate-pulse">
      <div className="max-w-7xl mx-auto">
        {/* Header skeleton */}
        <div className="text-center mb-8">
          <div className="h-10 w-64 bg-slate-200 rounded mx-auto" />
        </div>

        {/* Filter skeleton */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="h-10 flex-1 max-w-xs bg-slate-200 rounded-lg" />
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-8 w-20 bg-slate-200 rounded-full" />
              ))}
            </div>
          </div>
        </div>

        {/* Grid skeleton */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-xl overflow-hidden border border-slate-100">
              <div className="aspect-video bg-slate-200" />
              <div className="p-5 space-y-3">
                <div className="h-5 w-20 bg-slate-200 rounded-full" />
                <div className="h-6 w-full bg-slate-200 rounded" />
                <div className="h-4 w-3/4 bg-slate-200 rounded" />
                <div className="flex justify-between pt-3 border-t border-slate-100">
                  <div className="h-3 w-24 bg-slate-200 rounded" />
                  <div className="h-3 w-16 bg-slate-200 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
