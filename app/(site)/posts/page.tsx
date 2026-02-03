'use client';

import React, { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { usePaginatedQuery, useQuery } from 'convex/react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useInView } from 'react-intersection-observer';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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

function PostsGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
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
  );
}

function generatePaginationItems(currentPage: number, totalPages: number): (number | 'ellipsis')[] {
  const items: (number | 'ellipsis')[] = [];
  
  if (totalPages <= 9) {
    for (let i = 1; i <= totalPages; i++) items.push(i);
    return items;
  }
  
  // Always show first 2 pages
  items.push(1, 2);
  
  // Ellipsis after first pages if needed
  if (currentPage > 4) {
    items.push('ellipsis');
  }
  
  // Pages around current
  const start = Math.max(3, currentPage - 1);
  const end = Math.min(totalPages - 2, currentPage + 1);
  
  for (let i = start; i <= end; i++) {
    if (!items.includes(i)) items.push(i);
  }
  
  // Ellipsis before last pages if needed
  if (currentPage < totalPages - 3) {
    items.push('ellipsis');
  }
  
  // Always show last 2 pages
  if (!items.includes(totalPages - 1)) items.push(totalPages - 1);
  if (!items.includes(totalPages)) items.push(totalPages);
  
  return items;
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
  const [postsPerPage, setPostsPerPage] = useState(listConfig.postsPerPage ?? 12);
  
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

  useEffect(() => {
    setPostsPerPage(listConfig.postsPerPage ?? 12);
  }, [listConfig.postsPerPage]);

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
  
  // Use offset-based query for pagination mode (proper server-side pagination)
  const offset = (urlPage - 1) * postsPerPage;
  const paginatedPosts = useQuery(
    api.posts.listPublishedWithOffset,
    listConfig.paginationType === 'pagination' 
      ? {
          categoryId: activeCategory ?? undefined,
          limit: postsPerPage,
          offset,
          search: debouncedSearchQuery || undefined,
          sortBy,
        }
      : 'skip'
  );
  
  const posts = listConfig.paginationType === 'pagination'
    ? (paginatedPosts ?? [])
    : infiniteResults;
  
  // Loading state for pagination mode  
  const isLoadingPosts = listConfig.paginationType === 'pagination' && paginatedPosts === undefined;
  
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

  const handlePageSizeChange = useCallback((value: number) => {
    setPostsPerPage(value);
    const params = new URLSearchParams(searchParams.toString());
    params.delete('page');
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [searchParams, pathname, router]);
  
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
  
  // Reset page to 1 when search/filter/page size changes
  useEffect(() => {
    if (listConfig.paginationType === 'pagination' && urlPage !== 1) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete('page');
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }
  }, [debouncedSearchQuery, sortBy, activeCategory, postsPerPage, listConfig.paginationType, pathname, router, searchParams, urlPage]);

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
            {isLoadingPosts ? (
              <PostsGridSkeleton count={postsPerPage} />
            ) : (
              <FullWidthLayout
                posts={posts}
                brandColor={brandColor}
                categoryMap={categoryMap}
                enabledFields={enabledFields}
              />
            )}
          </>
        )}

        {layout === 'sidebar' && (
          isLoadingPosts ? (
            <PostsGridSkeleton count={postsPerPage} />
          ) : (
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
          )
        )}

        {layout === 'magazine' && (
          isLoadingPosts ? (
            <PostsGridSkeleton count={postsPerPage} />
          ) : (
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
          )
        )}

        {/* Pagination / Infinite Scroll */}
        {listConfig.paginationType === 'pagination' && totalPages > 1 && (
          <div className="mt-8 flex flex-col items-center gap-4">
            {/* Page navigation */}
            <nav className="flex items-center gap-1.5" aria-label="Phân trang">
              {/* Previous */}
              <button
                onClick={() => handlePageChange(urlPage - 1)}
                disabled={urlPage === 1}
                className="inline-flex items-center justify-center w-8 h-8 rounded-md text-slate-400 transition-colors hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Trang trước"
              >
                <ChevronLeft size={20} />
              </button>
              
              {/* Page numbers */}
              {generatePaginationItems(urlPage, totalPages).map((item, index) => (
                item === 'ellipsis' ? (
                  <span key={`ellipsis-${index}`} className="w-8 text-center text-slate-400 select-none">
                    …
                  </span>
                ) : (
                  <button
                    key={item}
                    onClick={() => handlePageChange(item)}
                    className={`inline-flex items-center justify-center w-8 h-8 rounded-md text-sm transition-colors ${
                      urlPage === item
                        ? 'font-semibold text-slate-900 border border-slate-300 bg-slate-100'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                    aria-current={urlPage === item ? 'page' : undefined}
                  >
                    {item}
                  </button>
                )
              ))}
              
              {/* Next */}
              <button
                onClick={() => handlePageChange(urlPage + 1)}
                disabled={urlPage === totalPages}
                className="inline-flex items-center justify-center w-8 h-8 rounded-md text-slate-400 transition-colors hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Trang sau"
              >
                <ChevronRight size={20} />
              </button>
            </nav>
            
            {/* Page info text */}
            <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-slate-500">
              <span>
                Hiển thị {totalCount ? ((urlPage - 1) * postsPerPage) + 1 : 0}–{Math.min(urlPage * postsPerPage, totalCount ?? 0)} trong {totalCount ?? 0} bài viết
              </span>
              <div className="flex items-center gap-1">
                <select
                  value={postsPerPage}
                  onChange={(event) => handlePageSizeChange(Number(event.target.value))}
                  className="h-8 rounded-md border border-slate-200 bg-white px-2 text-sm text-slate-600 shadow-sm focus:border-slate-300 focus:outline-none"
                  aria-label="Số bài mỗi trang"
                >
                  {[10, 12, 20, 30].map((size) => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
                <span>bài/trang</span>
              </div>
            </div>
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
