'use client';

import React, { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery } from 'convex/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/convex/_generated/api';
import { useBrandColor } from '@/components/site/hooks';
import { usePostsListConfig } from '@/lib/experiences';
import type { Id } from '@/convex/_generated/dataModel';
import {
  FullWidthLayout,
  MagazineLayout,
  PostsFilter,
  SidebarLayout,
  type SortOption,
} from '@/components/site/posts';

type PostsListLayout = 'fullwidth' | 'sidebar' | 'magazine';

function usePostsLayout(): PostsListLayout {
  const setting = useQuery(api.settings.getByKey, { key: 'posts_list_style' });
  const value = setting?.value as string;
  if (value === 'fullwidth' || value === 'grid' || value === 'list') {return 'fullwidth';}
  if (value === 'sidebar') {return 'sidebar';}
  if (value === 'magazine') {return 'magazine';}
  return 'fullwidth';
}

function useEnabledPostFields(): Set<string> {
  const fields = useQuery(api.admin.modules.listEnabledModuleFields, { moduleKey: 'posts' });
  return useMemo(() => {
    if (!fields) {return new Set<string>();}
    return new Set(fields.map(f => f.fieldKey));
  }, [fields]);
}

function PostsListSkeleton() {
  return (
    <div className="py-8 md:py-12 px-4 animate-pulse">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <div className="h-10 w-64 bg-slate-200 rounded mx-auto" />
        </div>
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
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-xl overflow-hidden border border-slate-100">
              <div className="aspect-video bg-slate-200" />
              <div className="p-5 space-y-3">
                <div className="h-5 w-20 bg-slate-200 rounded-full" />
                <div className="h-6 w-full bg-slate-200 rounded" />
                <div className="h-4 w-3/4 bg-slate-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function PostsPage() {
  return (
    <Suspense fallback={<PostsListSkeleton />}>
      <PostsContent />
    </Suspense>
  );
}

function PostsContent() {
  const brandColor = useBrandColor();
  const layout = usePostsLayout();
  const enabledFields = useEnabledPostFields();
  const listConfig = usePostsListConfig(); // New: Read experience config
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<Id<"postCategories"> | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () =>{  clearTimeout(timer); };
  }, [searchQuery]);

  // Queries
  const categories = useQuery(api.postCategories.listActive, { limit: 20 });
  
  const categoryFromUrl = useMemo(() => {
    const catSlug = searchParams.get('catpost');
    if (!catSlug || !categories) {return null;}
    const matchedCategory = categories.find((c) => c.slug === catSlug);
    return matchedCategory?._id ?? null;
  }, [searchParams, categories]);

  const activeCategory = selectedCategory ?? categoryFromUrl;
  const posts = useQuery(api.posts.searchPublished, {
    categoryId: activeCategory ?? undefined,
    limit: 24,
    search: debouncedSearchQuery || undefined,
    sortBy,
  });
  const totalCount = useQuery(api.posts.countPublished, {
    categoryId: activeCategory ?? undefined,
  });
  const featuredPosts = useQuery(api.posts.listFeatured, { limit: 5 });

  // Build category map for O(1) lookup
  const categoryMap = useMemo(() => {
    if (!categories) {return new Map<string, string>();}
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

  // Initial loading state only (not on search/filter changes)
  const isInitialLoading = categories === undefined;

  if (isInitialLoading) {
    return <PostsListSkeleton />;
  }

  return (
    <div className="py-6 md:py-10 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-3">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
            Tin tức & Bài viết
          </h1>
        </div>

        {/* Layout based rendering */}
        {layout === 'fullwidth' && (
          <>
            {/* Filter Bar - Hide based on config */}
            {(listConfig.showSearch || listConfig.showCategories) && (
              <div className="mb-5">
                <PostsFilter
                  categories={categories}
                  selectedCategory={selectedCategory}
                  onCategoryChange={handleCategoryChange}
                  searchQuery={searchQuery}
                  onSearchChange={handleSearchChange}
                  sortBy={sortBy}
                  onSortChange={handleSortChange}
                  totalResults={totalCount ?? (posts?.length ?? 0)}
                  brandColor={brandColor}
                  showSearch={listConfig.showSearch}
                  showCategories={listConfig.showCategories}
                />
              </div>
            )}

            {/* Posts */}
            <FullWidthLayout
              posts={posts ?? []}
              brandColor={brandColor}
              categoryMap={categoryMap}
              enabledFields={enabledFields}
            />
          </>
        )}

        {layout === 'sidebar' && (
          <SidebarLayout
            posts={posts ?? []}
            brandColor={brandColor}
            categoryMap={categoryMap}
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            sortBy={sortBy}
            onSortChange={handleSortChange}
            enabledFields={enabledFields}
            showSearch={listConfig.showSearch}
            showCategories={listConfig.showCategories}
          />
        )}

        {layout === 'magazine' && (
          <MagazineLayout
            posts={posts ?? []}
            brandColor={brandColor}
            categoryMap={categoryMap}
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            sortBy={sortBy}
            onSortChange={handleSortChange}
            featuredPosts={featuredPosts ?? []}
            enabledFields={enabledFields}
            showSearch={listConfig.showSearch}
            showCategories={listConfig.showCategories}
          />
        )}

        {/* Load More (for all layouts) - Hide based on config */}
        {(posts?.length ?? 0) >= 24 && (
          listConfig.paginationType === 'pagination' ? (
            <div className="text-center mt-6">
              <nav className="inline-flex items-center gap-1">
                <button
                  className="px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                  style={{ backgroundColor: brandColor, color: 'white' }}
                >
                  1
                </button>
                {[2, 3, 4].map((page) => (
                  <button
                    key={page}
                    className="px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-slate-100"
                  >
                    {page}
                  </button>
                ))}
                <span className="px-2 text-slate-400">...</span>
                <button className="px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-slate-100">
                  10
                </button>
              </nav>
            </div>
          ) : (
            <div className="text-center mt-6 space-y-2">
              <div className="flex justify-center gap-1">
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: brandColor }} />
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: brandColor, opacity: 0.7 }} />
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: brandColor, opacity: 0.5 }} />
              </div>
              <p className="text-sm text-slate-400">Cuộn để xem thêm...</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
