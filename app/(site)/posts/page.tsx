'use client';

import React, { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { usePaginatedQuery, useQuery } from 'convex/react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useInView } from 'react-intersection-observer';
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
  const listConfig = usePostsListConfig();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Read page from URL for pagination mode
  const urlPage = Number(searchParams.get('page')) || 1;
  
  // Filter states (client-side for search)
  const [selectedCategory, setSelectedCategory] = useState<Id<"postCategories"> | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const postsPerPage = listConfig.postsPerPage ?? 12;
  
  // Intersection observer for infinite scroll
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.1,
    rootMargin: '100px',
  });

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
  
  // Map sortBy to the limited options supported by listPublishedPaginated
  const paginatedSortBy = sortBy === 'popular' ? 'popular' : (sortBy === 'oldest' ? 'oldest' : 'newest');
  
  // Use usePaginatedQuery for infinite scroll mode (reactive, accumulates results)
  const {
    results: infiniteResults,
    status: infiniteStatus,
    loadMore,
  } = usePaginatedQuery(
    api.posts.listPublishedPaginated,
    { 
      categoryId: activeCategory ?? undefined,
      sortBy: paginatedSortBy,
    },
    { initialNumItems: postsPerPage }
  );
  
  // Use regular query for pagination mode (page-based)
  const paginatedPosts = useQuery(
    api.posts.searchPublished,
    listConfig.paginationType === 'pagination' 
      ? {
          categoryId: activeCategory ?? undefined,
          limit: postsPerPage,
          search: debouncedSearchQuery || undefined,
          sortBy,
        }
      : 'skip'
  );
  
  // Calculate offset-based posts for pagination mode
  const allPaginatedPosts = paginatedPosts ?? [];
  const startIndex = (urlPage - 1) * postsPerPage;
  const posts = listConfig.paginationType === 'pagination'
    ? allPaginatedPosts.slice(startIndex, startIndex + postsPerPage)
    : infiniteResults;
  
  const totalCount = useQuery(api.posts.countPublished, {
    categoryId: activeCategory ?? undefined,
  });
  const featuredPosts = useQuery(api.posts.listFeatured, { limit: 5 });
  
  // Load more when scrolling to bottom (infinite scroll mode)
  useEffect(() => {
    if (listConfig.paginationType === 'infiniteScroll' && inView && infiniteStatus === 'CanLoadMore') {
      loadMore(postsPerPage);
    }
  }, [inView, infiniteStatus, loadMore, postsPerPage, listConfig.paginationType]);
  
  // Calculate total pages
  const totalPages = useMemo(() => {
    if (!totalCount) return 1;
    return Math.ceil(totalCount / postsPerPage);
  }, [totalCount, postsPerPage]);

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
  
  // Update URL when page changes (pagination mode)
  const handlePageChange = useCallback((page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (page === 1) {
      params.delete('page');
    } else {
      params.set('page', page.toString());
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [searchParams, pathname, router]);
  
  // Reset page to 1 when search/filter changes
  useEffect(() => {
    if (listConfig.paginationType === 'pagination' && urlPage !== 1) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete('page');
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }
  }, [debouncedSearchQuery, sortBy, activeCategory]);

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
              posts={posts}
              brandColor={brandColor}
              categoryMap={categoryMap}
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
            sortBy={sortBy}
            onSortChange={handleSortChange}
            enabledFields={enabledFields}
            showSearch={listConfig.showSearch}
            showCategories={listConfig.showCategories}
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

        {/* Pagination / Infinite Scroll */}
        {listConfig.paginationType === 'pagination' && totalPages > 1 && (
          <div className="text-center mt-6">
            <nav className="inline-flex items-center gap-1">
              {/* Previous button */}
              <button
                onClick={() => handlePageChange(urlPage - 1)}
                disabled={urlPage === 1}
                className="px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100"
              >
                &larr;
              </button>
              
              {/* Page numbers */}
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (urlPage <= 3) {
                  pageNum = i + 1;
                } else if (urlPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = urlPage - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className="px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                    style={urlPage === pageNum 
                      ? { backgroundColor: brandColor, color: 'white' }
                      : undefined
                    }
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              {/* Ellipsis and last page */}
              {totalPages > 5 && urlPage < totalPages - 2 && (
                <>
                  <span className="px-2 text-slate-400">...</span>
                  <button
                    onClick={() => handlePageChange(totalPages)}
                    className="px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-slate-100"
                  >
                    {totalPages}
                  </button>
                </>
              )}
              
              {/* Next button */}
              <button
                onClick={() => handlePageChange(urlPage + 1)}
                disabled={urlPage === totalPages}
                className="px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100"
              >
                &rarr;
              </button>
            </nav>
          </div>
        )}
        
        {/* Infinite scroll trigger */}
        {listConfig.paginationType === 'infiniteScroll' && infiniteStatus !== 'Exhausted' && (
          <div ref={loadMoreRef} className="text-center mt-6 py-8">
            {infiniteStatus === 'LoadingMore' ? (
              <div className="flex justify-center gap-1">
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: brandColor }} />
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: brandColor, opacity: 0.7 }} />
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: brandColor, opacity: 0.5 }} />
              </div>
            ) : infiniteStatus === 'CanLoadMore' ? (
              <p className="text-sm text-slate-400">Cuộn để xem thêm...</p>
            ) : null}
          </div>
        )}
        
        {/* Show "All loaded" message for infinite scroll */}
        {listConfig.paginationType === 'infiniteScroll' && infiniteStatus === 'Exhausted' && posts.length > 0 && (
          <div className="text-center mt-6">
            <p className="text-sm text-slate-400">Đã hiển thị tất cả {posts.length} bài viết</p>
          </div>
        )}
      </div>
    </div>
  );
}
