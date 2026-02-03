'use client';

import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePaginatedQuery, useQuery } from 'convex/react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useInView } from 'react-intersection-observer';
import { api } from '@/convex/_generated/api';
import { useBrandColor } from '@/components/site/hooks';
import { useProductsListConfig } from '@/lib/experiences';
import { ChevronDown, Package, Search, ShoppingCart, SlidersHorizontal, X } from 'lucide-react';
import type { Id } from '@/convex/_generated/dataModel';

type ProductSortOption = 'newest' | 'oldest' | 'popular' | 'price_asc' | 'price_desc' | 'name';
type ProductsListLayout = 'grid' | 'list' | 'catalog';

function useEnabledProductFields(): Set<string> {
  const fields = useQuery(api.admin.modules.listEnabledModuleFields, { moduleKey: 'products' });
  return useMemo(() => {
    if (!fields) {return new Set<string>();}
    return new Set(fields.map(f => f.fieldKey));
  }, [fields]);
}

function ProductsListSkeleton() {
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
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="bg-white rounded-xl overflow-hidden border border-slate-100">
              <div className="aspect-square bg-slate-200" />
              <div className="p-4 space-y-3">
                <div className="h-4 w-full bg-slate-200 rounded" />
                <div className="h-5 w-24 bg-slate-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function generatePaginationItems(currentPage: number, totalPages: number): (number | 'ellipsis')[] {
  const items: (number | 'ellipsis')[] = [];
  const siblingCount = 1;

  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) {
      items.push(i);
    }
    return items;
  }

  const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
  const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

  const shouldShowLeftDots = leftSiblingIndex > 2;
  const shouldShowRightDots = rightSiblingIndex < totalPages - 2;

  const firstPageIndex = 1;
  const lastPageIndex = totalPages;

  if (!shouldShowLeftDots && shouldShowRightDots) {
    const leftRange = 3 + 2 * siblingCount;
    for (let i = 1; i <= leftRange; i++) {
      items.push(i);
    }
    items.push('ellipsis');
    items.push(totalPages);
    return items;
  }

  if (shouldShowLeftDots && !shouldShowRightDots) {
    items.push(firstPageIndex);
    items.push('ellipsis');
    const rightRange = 3 + 2 * siblingCount;
    for (let i = totalPages - rightRange + 1; i <= totalPages; i++) {
      items.push(i);
    }
    return items;
  }

  items.push(firstPageIndex);
  items.push('ellipsis');
  for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
    items.push(i);
  }
  items.push('ellipsis');
  items.push(lastPageIndex);

  return items;
}

function ProductsGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl overflow-hidden border border-slate-100">
          <div className="aspect-square bg-slate-200" />
          <div className="p-4 space-y-3">
            <div className="h-4 w-full bg-slate-200 rounded" />
            <div className="h-5 w-24 bg-slate-200 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<ProductsListSkeleton />}>
      <ProductsContent />
    </Suspense>
  );
}

function ProductsContent() {
  const brandColor = useBrandColor();
  const listConfig = useProductsListConfig();
  const layout: ProductsListLayout = listConfig.layoutStyle === 'sidebar' ? 'catalog' : listConfig.layoutStyle;
  const enabledFields = useEnabledProductFields();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const urlPage = Number(searchParams.get('page')) || 1;

  const [selectedCategory, setSelectedCategory] = useState<Id<"productCategories"> | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<ProductSortOption>('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [pageSizeOverride, setPageSizeOverride] = useState<number | null>(null);
  const postsPerPage = pageSizeOverride ?? (listConfig.postsPerPage ?? 12);

  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.1,
    rootMargin: '100px',
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () =>{  clearTimeout(timer); };
  }, [searchQuery]);

  const categories = useQuery(api.productCategories.listActive);

  const categoryFromUrl = useMemo(() => {
    const catSlug = searchParams.get('category');
    if (!catSlug || !categories) {return null;}
    const matchedCategory = categories.find((c) => c.slug === catSlug);
    return matchedCategory?._id ?? null;
  }, [searchParams, categories]);

  const activeCategory = selectedCategory ?? categoryFromUrl;

  const paginatedSortBy = sortBy === 'popular' ? 'popular' : (sortBy === 'oldest' ? 'oldest' : 'newest');

  const {
    results: infiniteResults,
    status: infiniteStatus,
    loadMore,
  } = usePaginatedQuery(
    api.products.listPublishedPaginated,
    {
      categoryId: activeCategory ?? undefined,
      sortBy: paginatedSortBy,
    },
    { initialNumItems: postsPerPage }
  );

  const useCursorPagination =
    listConfig.paginationType === 'pagination' &&
    !debouncedSearchQuery?.trim() &&
    ['newest', 'oldest', 'popular'].includes(sortBy);

  const offset = (urlPage - 1) * postsPerPage;
  const paginatedProducts = useQuery(
    api.products.listPublishedWithOffset,
    listConfig.paginationType === 'pagination' && !useCursorPagination
      ? {
          categoryId: activeCategory ?? undefined,
          limit: postsPerPage,
          offset,
          search: debouncedSearchQuery || undefined,
          sortBy,
        }
      : 'skip'
  );

  const products = listConfig.paginationType === 'pagination'
    ? (useCursorPagination
      ? infiniteResults.slice(offset, offset + postsPerPage)
      : (paginatedProducts ?? []))
    : infiniteResults;

  const totalCount = useQuery(api.products.countPublished, {
    categoryId: activeCategory ?? undefined,
  });

  const categoryMap = useMemo(() => {
    if (!categories) {return new Map<string, string>();}
    return new Map(categories.map((c) => [c._id, c.name]));
  }, [categories]);

  const requiredCount = urlPage * postsPerPage;

  useEffect(() => {
    if (listConfig.paginationType === 'infiniteScroll' && inView && infiniteStatus === 'CanLoadMore') {
      loadMore(postsPerPage);
    }
  }, [inView, infiniteStatus, loadMore, postsPerPage, listConfig.paginationType]);

  useEffect(() => {
    if (!useCursorPagination) return;
    if (infiniteStatus !== 'CanLoadMore') return;
    if (infiniteResults.length >= requiredCount) return;
    loadMore(requiredCount - infiniteResults.length);
  }, [useCursorPagination, infiniteStatus, infiniteResults.length, requiredCount, loadMore]);

  const handleCategoryChange = useCallback((categoryId: Id<"productCategories"> | null) => {
    setSelectedCategory(categoryId);
    const params = new URLSearchParams(searchParams.toString());
    if (categoryId && categories) {
      const category = categories.find(c => c._id === categoryId);
      if (category) {
        params.set('category', category.slug);
      }
    } else {
      params.delete('category');
    }
    const newUrl = params.toString() ? `/products?${params.toString()}` : '/products';
    router.push(newUrl, { scroll: false });
  }, [searchParams, categories, router]);

  const handlePageSizeChange = useCallback((value: number) => {
    setPageSizeOverride(value);
    const params = new URLSearchParams(searchParams.toString());
    params.delete('page');
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [searchParams, pathname, router]);

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

  const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN', { currency: 'VND', style: 'currency' }).format(price);

  const filterKey = `${activeCategory ?? ''}|${debouncedSearchQuery}|${sortBy}|${postsPerPage}`;
  const prevFilterKeyRef = useRef(filterKey);

  useEffect(() => {
    if (listConfig.paginationType !== 'pagination') {
      prevFilterKeyRef.current = filterKey;
      return;
    }

    const hasFilterChanged = prevFilterKeyRef.current !== filterKey;
    if (hasFilterChanged && urlPage !== 1) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete('page');
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }
    prevFilterKeyRef.current = filterKey;
  }, [filterKey, listConfig.paginationType, pathname, router, searchParams, urlPage]);
  const isLoadingProducts = listConfig.paginationType === 'pagination' && (
    useCursorPagination
      ? infiniteStatus === 'LoadingFirstPage' || infiniteResults.length < requiredCount
      : paginatedProducts === undefined
  );

  if (categories === undefined) {
    return <ProductsListSkeleton />;
  }

  const showPrice = enabledFields.has('price') || enabledFields.size === 0;
  const showSalePrice = enabledFields.has('salePrice');
  const showStock = enabledFields.has('stock');

  const paginationNode = (
    <>
      {listConfig.paginationType === 'pagination' && totalCount && totalCount > postsPerPage && (
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="order-2 flex w-full items-center justify-between text-sm text-slate-500 sm:order-1 sm:w-auto sm:justify-start sm:gap-6">
            <div className="flex items-center gap-2">
              <span className="text-slate-600">Hiển thị</span>
              <select
                value={postsPerPage}
                onChange={(event) => handlePageSizeChange(Number(event.target.value))}
                className="h-8 w-[70px] appearance-none rounded-md border border-slate-200 bg-white px-2 text-sm font-medium text-slate-900 shadow-sm focus:border-slate-300 focus:outline-none"
                style={{ borderColor: brandColor }}
                aria-label="Số bài mỗi trang"
              >
                {[12, 20, 24, 48, 100].map((size) => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
              <span>bài/trang</span>
            </div>

            <div className="text-right sm:text-left">
              <span className="font-medium text-slate-900">
                {totalCount ? ((urlPage - 1) * postsPerPage) + 1 : 0}–{Math.min(urlPage * postsPerPage, totalCount ?? 0)}
              </span>
              <span className="mx-1 text-slate-300">/</span>
              <span className="font-medium text-slate-900">{totalCount ?? 0}</span>
              <span className="ml-1 text-slate-500">sản phẩm</span>
            </div>
          </div>

          <div className="order-1 flex w-full justify-center sm:order-2 sm:w-auto sm:justify-end">
            <nav className="flex items-center space-x-1 sm:space-x-2" aria-label="Phân trang">
              <button
                onClick={() => handlePageChange(urlPage - 1)}
                disabled={urlPage === 1}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
                style={urlPage === 1 ? undefined : { color: brandColor, borderColor: brandColor }}
                aria-label="Trang trước"
              >
                <ChevronDown className="h-4 w-4 rotate-90" />
              </button>

              {generatePaginationItems(urlPage, Math.ceil(totalCount / postsPerPage)).map((item, index) => {
                if (item === 'ellipsis') {
                  return (
                    <div key={`ellipsis-${index}`} className="flex h-8 w-8 items-center justify-center text-slate-400">
                      …
                    </div>
                  );
                }

                const pageNum = item as number;
                const isActive = pageNum === urlPage;
                const isMobileHidden = !isActive && pageNum !== 1 && pageNum !== Math.ceil(totalCount / postsPerPage);

                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`inline-flex h-8 w-8 items-center justify-center rounded-md text-sm transition-all duration-200 ${
                      isActive
                        ? 'text-white shadow-sm border font-medium'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                    } ${isMobileHidden ? 'hidden sm:inline-flex' : ''}`}
                    style={isActive ? { backgroundColor: brandColor, borderColor: brandColor } : undefined}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => handlePageChange(urlPage + 1)}
                disabled={totalCount ? urlPage >= Math.ceil(totalCount / postsPerPage) : true}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
                style={totalCount && urlPage < Math.ceil(totalCount / postsPerPage) ? { color: brandColor, borderColor: brandColor } : undefined}
                aria-label="Trang sau"
              >
                <ChevronDown className="h-4 w-4 -rotate-90" />
              </button>
            </nav>
          </div>
        </div>
      )}

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

      {listConfig.paginationType === 'infiniteScroll' && infiniteStatus === 'Exhausted' && products.length > 0 && (
        <div className="text-center mt-6">
          <p className="text-sm text-slate-400">Đã hiển thị tất cả {products.length} sản phẩm</p>
        </div>
      )}
    </>
  );

  // Render based on layout setting
  if (layout === 'catalog') {
    return (
      <CatalogLayout
        products={isLoadingProducts ? [] : products}
        categories={categories}
        categoryMap={categoryMap}
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortBy={sortBy}
        onSortChange={setSortBy}
        brandColor={brandColor}
        showPrice={showPrice}
        showSalePrice={showSalePrice}
        showStock={showStock}
        formatPrice={formatPrice}
        totalCount={totalCount}
        paginationNode={paginationNode}
      />
    );
  }

  if (layout === 'list') {
    return (
      <ListLayout
        products={isLoadingProducts ? [] : products}
        categories={categories}
        categoryMap={categoryMap}
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortBy={sortBy}
        onSortChange={setSortBy}
        brandColor={brandColor}
        showPrice={showPrice}
        showSalePrice={showSalePrice}
        showStock={showStock}
        formatPrice={formatPrice}
        totalCount={totalCount}
        paginationNode={paginationNode}
      />
    );
  }

  // Default: Grid Layout
  return (
    <div className="py-8 md:py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Sản phẩm</h1>
          <p className="text-slate-500 mt-2">Khám phá các sản phẩm chất lượng của chúng tôi</p>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                value={searchQuery}
                onChange={(e) =>{  setSearchQuery(e.target.value); }}
                className="w-full h-10 pl-10 pr-4 rounded-lg border border-slate-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-colors"
              />
              {searchQuery && (
                <button onClick={() =>{  setSearchQuery(''); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X size={16} />
                </button>
              )}
            </div>

            <div className="hidden lg:flex items-center gap-2">
              <div className="relative">
                <select
                  value={selectedCategory ?? ''}
                  onChange={(e) =>{  handleCategoryChange(e.target.value ? e.target.value as Id<"productCategories"> : null); }}
                  className="h-10 pl-3 pr-8 rounded-lg border border-slate-200 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none min-w-[180px]"
                >
                  <option value="">Tất cả danh mục</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <button onClick={() =>{  setShowFilters(!showFilters); }} className="lg:hidden flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-slate-200 text-slate-600">
              <SlidersHorizontal size={18} /> Bộ lọc
            </button>

            <div className="flex items-center gap-2 ml-auto">
              <select value={sortBy} onChange={(e) =>{  setSortBy(e.target.value as ProductSortOption); }} className="h-10 px-3 rounded-lg border border-slate-200 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none">
                <option value="newest">Mới nhất</option>
                <option value="popular">Bán chạy</option>
                <option value="price_asc">Giá thấp → cao</option>
                <option value="price_desc">Giá cao → thấp</option>
                <option value="name">Tên A-Z</option>
              </select>
            </div>
          </div>

          {showFilters && (
            <div className="lg:hidden mt-4 pt-4 border-t border-slate-100">
              <p className="text-sm font-medium text-slate-700 mb-3">Danh mục</p>
              <div className="flex flex-wrap gap-2">
                <button onClick={() =>{  handleCategoryChange(null); }} className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${selectedCategory === null ? 'text-white' : 'bg-slate-100 text-slate-600'}`} style={selectedCategory === null ? { backgroundColor: brandColor } : undefined}>
                  Tất cả
                </button>
                {categories.map((cat) => (
                  <button key={cat._id} onClick={() =>{  handleCategoryChange(cat._id); }} className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${selectedCategory === cat._id ? 'text-white' : 'bg-slate-100 text-slate-600'}`} style={selectedCategory === cat._id ? { backgroundColor: brandColor } : undefined}>
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-slate-500">
            Hiển thị <span className="font-medium text-slate-900">{products.length}</span>
            {totalCount !== undefined && totalCount > products.length && <> / {totalCount}</>} sản phẩm
          </p>
        </div>

        {/* Products Grid/List */}
        {isLoadingProducts ? (
          <ProductsGridSkeleton count={postsPerPage} />
        ) : products.length === 0 ? (
          <EmptyState brandColor={brandColor} onReset={() => { setSearchQuery(''); handleCategoryChange(null); }} />
        ) : (
          <ProductGrid products={products} categoryMap={categoryMap} brandColor={brandColor} showPrice={showPrice} showSalePrice={showSalePrice} showStock={showStock} formatPrice={formatPrice} />
        )}

        {paginationNode}
      </div>
    </div>
  );
}

// ========== SHARED COMPONENTS ==========

interface ProductCardProps {
  product: {
    _id: string;
    name: string;
    slug: string;
    image?: string;
    price: number;
    salePrice?: number;
    stock: number;
    categoryId: string;
    description?: string;
  };
  categoryMap: Map<string, string>;
  brandColor: string;
  showPrice: boolean;
  showSalePrice: boolean;
  showStock: boolean;
  formatPrice: (price: number) => string;
}

function ProductGrid({ products, categoryMap, brandColor, showPrice, showSalePrice, showStock, formatPrice }: { products: ProductCardProps['product'][]; categoryMap: Map<string, string>; brandColor: string; showPrice: boolean; showSalePrice: boolean; showStock: boolean; formatPrice: (price: number) => string }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {products.map((product) => (
        <Link key={product._id} href={`/products/${product.slug}`} className="group bg-white rounded-xl overflow-hidden border border-slate-100 hover:shadow-lg hover:border-slate-200 transition-all duration-300">
          <div className="aspect-square overflow-hidden bg-slate-100 relative">
            {product.image ? (
                <Image src={product.image} alt={product.name} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover group-hover:scale-110 transition-transform duration-500" />
            ) : (
              <div className="w-full h-full flex items-center justify-center"><Package size={48} className="text-slate-300" /></div>
            )}
            {showSalePrice && product.salePrice && (
              <span className="absolute top-2 left-2 px-2 py-1 bg-red-500 text-white text-xs font-semibold rounded">-{Math.round((1 - product.salePrice / product.price) * 100)}%</span>
            )}
          </div>
          <div className="p-4">
            <p className="text-xs text-slate-500 mb-1">{categoryMap.get(product.categoryId) ?? 'Sản phẩm'}</p>
            <h3 className="font-medium text-slate-900 line-clamp-2 group-hover:text-orange-600 transition-colors mb-2">{product.name}</h3>
            {showPrice && (
              <div className="flex items-center gap-2">
                <span className="font-bold" style={{ color: brandColor }}>{formatPrice(product.salePrice ?? product.price)}</span>
                {showSalePrice && product.salePrice && <span className="text-sm text-slate-400 line-through">{formatPrice(product.price)}</span>}
              </div>
            )}
            {showStock && product.stock <= 5 && product.stock > 0 && <p className="text-xs text-orange-600 mt-2">Chỉ còn {product.stock} sản phẩm</p>}
            {showStock && product.stock === 0 && <p className="text-xs text-red-500 mt-2">Hết hàng</p>}
          </div>
        </Link>
      ))}
    </div>
  );
}

function ProductList({ products, categoryMap, brandColor, showPrice, showSalePrice, showStock, formatPrice }: { products: ProductCardProps['product'][]; categoryMap: Map<string, string>; brandColor: string; showPrice: boolean; showSalePrice: boolean; showStock: boolean; formatPrice: (price: number) => string }) {
  return (
    <div className="space-y-4">
      {products.map((product) => (
        <Link key={product._id} href={`/products/${product.slug}`} className="group flex gap-4 bg-white rounded-xl overflow-hidden border border-slate-100 hover:shadow-lg hover:border-slate-200 transition-all duration-300 p-4">
          <div className="w-32 h-32 md:w-40 md:h-40 shrink-0 overflow-hidden bg-slate-100 rounded-lg relative">
            {product.image ? (
                <Image src={product.image} alt={product.name} fill sizes="160px" className="object-cover group-hover:scale-110 transition-transform duration-500" />
            ) : (
              <div className="w-full h-full flex items-center justify-center"><Package size={32} className="text-slate-300" /></div>
            )}
            {showSalePrice && product.salePrice && (
              <span className="absolute top-2 left-2 px-2 py-1 bg-red-500 text-white text-xs font-semibold rounded">-{Math.round((1 - product.salePrice / product.price) * 100)}%</span>
            )}
          </div>
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <p className="text-xs text-slate-500 mb-1">{categoryMap.get(product.categoryId) ?? 'Sản phẩm'}</p>
            <h3 className="font-semibold text-slate-900 text-lg group-hover:text-orange-600 transition-colors mb-2">{product.name}</h3>
            {product.description && <p className="text-sm text-slate-500 line-clamp-2 mb-3" dangerouslySetInnerHTML={{ __html: product.description.slice(0, 150) }} />}
            <div className="flex items-center gap-4">
              {showPrice && (
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold" style={{ color: brandColor }}>{formatPrice(product.salePrice ?? product.price)}</span>
                  {showSalePrice && product.salePrice && <span className="text-sm text-slate-400 line-through">{formatPrice(product.price)}</span>}
                </div>
              )}
              {showStock && product.stock <= 5 && product.stock > 0 && <span className="text-xs text-orange-600">Chỉ còn {product.stock}</span>}
              {showStock && product.stock === 0 && <span className="text-xs text-red-500">Hết hàng</span>}
            </div>
          </div>
          <div className="hidden md:flex items-center">
            <button className="p-3 rounded-full border-2 transition-colors hover:bg-slate-50" style={{ borderColor: brandColor, color: brandColor }} onClick={(e) => { e.preventDefault(); }}>
              <ShoppingCart size={20} />
            </button>
          </div>
        </Link>
      ))}
    </div>
  );
}

function EmptyState({ brandColor, onReset }: { brandColor: string; onReset: () => void }) {
  return (
    <div className="text-center py-16">
      <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-slate-100 flex items-center justify-center">
        <Package size={32} className="text-slate-400" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-2">Không tìm thấy sản phẩm</h3>
      <p className="text-slate-500 mb-6">Thử thay đổi từ khóa hoặc bộ lọc khác</p>
      <button onClick={onReset} className="px-6 py-2 rounded-lg font-medium text-white transition-colors" style={{ backgroundColor: brandColor }}>
        Xóa bộ lọc
      </button>
    </div>
  );
}

// ========== CATALOG LAYOUT ==========

interface LayoutProps {
  products: ProductCardProps['product'][];
  categories: { _id: Id<"productCategories">; name: string; slug: string }[];
  categoryMap: Map<string, string>;
  selectedCategory: Id<"productCategories"> | null;
  onCategoryChange: (id: Id<"productCategories"> | null) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  sortBy: ProductSortOption;
  onSortChange: (s: ProductSortOption) => void;
  brandColor: string;
  showPrice: boolean;
  showSalePrice: boolean;
  showStock: boolean;
  formatPrice: (price: number) => string;
  totalCount: number | undefined;
  paginationNode?: React.ReactNode;
}

function CatalogLayout({ products, categories, selectedCategory, onCategoryChange, searchQuery, onSearchChange, sortBy, onSortChange, brandColor, showPrice, showSalePrice, formatPrice, totalCount, paginationNode }: LayoutProps) {
  return (
    <div className="py-8 md:py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Sản phẩm</h1>
          <p className="text-slate-500 mt-2">Khám phá các sản phẩm chất lượng của chúng tôi</p>
        </div>

        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="hidden lg:block w-64 shrink-0 space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <h3 className="font-semibold text-slate-900 mb-3">Tìm kiếm</h3>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" placeholder="Tìm sản phẩm..." value={searchQuery} onChange={(e) =>{  onSearchChange(e.target.value); }} className="w-full h-9 pl-9 pr-3 rounded-lg border border-slate-200 text-sm focus:border-orange-500 outline-none" />
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <h3 className="font-semibold text-slate-900 mb-3">Danh mục</h3>
              <div className="space-y-1">
                <button onClick={() =>{  onCategoryChange(null); }} className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedCategory === null ? 'font-medium' : 'text-slate-600 hover:bg-slate-50'}`} style={selectedCategory === null ? { backgroundColor: `${brandColor}15`, color: brandColor } : undefined}>
                  Tất cả sản phẩm
                </button>
                {categories.map((cat) => (
                  <button key={cat._id} onClick={() =>{  onCategoryChange(cat._id); }} className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedCategory === cat._id ? 'font-medium' : 'text-slate-600 hover:bg-slate-50'}`} style={selectedCategory === cat._id ? { backgroundColor: `${brandColor}15`, color: brandColor } : undefined}>
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <h3 className="font-semibold text-slate-900 mb-3">Sắp xếp</h3>
              <select value={sortBy} onChange={(e) =>{  onSortChange(e.target.value as ProductSortOption); }} className="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm">
                <option value="newest">Mới nhất</option>
                <option value="popular">Bán chạy</option>
                <option value="price_asc">Giá thấp → cao</option>
                <option value="price_desc">Giá cao → thấp</option>
                <option value="name">Tên A-Z</option>
              </select>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-slate-500">
                Hiển thị <span className="font-medium text-slate-900">{products.length}</span>
                {totalCount !== undefined && totalCount > products.length && <> / {totalCount}</>} sản phẩm
              </p>
            </div>

            {products.length === 0 ? (
              <EmptyState brandColor={brandColor} onReset={() => { onSearchChange(''); onCategoryChange(null); }} />
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {products.map((product) => (
                  <Link key={product._id} href={`/products/${product.slug}`} className="group bg-white rounded-xl overflow-hidden border border-slate-100 hover:shadow-lg hover:border-slate-200 transition-all duration-300">
                    <div className="aspect-square overflow-hidden bg-slate-100 relative">
                      {product.image ? (
                        <Image src={product.image} alt={product.name} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover group-hover:scale-110 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><Package size={32} className="text-slate-300" /></div>
                      )}
                      {showSalePrice && product.salePrice && (
                        <span className="absolute top-2 left-2 px-2 py-1 bg-red-500 text-white text-xs font-semibold rounded">Sale</span>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="font-medium text-sm text-slate-900 line-clamp-2 group-hover:text-orange-600 transition-colors">{product.name}</h3>
                      {showPrice && <span className="font-bold text-sm block mt-1" style={{ color: brandColor }}>{formatPrice(product.salePrice ?? product.price)}</span>}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {paginationNode}
      </div>
    </div>
  );
}

// ========== LIST LAYOUT (Full width list view) ==========

function ListLayout({ products, categories, categoryMap, selectedCategory, onCategoryChange, searchQuery, onSearchChange, sortBy, onSortChange, brandColor, showPrice, showSalePrice, showStock, formatPrice, totalCount, paginationNode }: LayoutProps) {
  return (
    <div className="py-8 md:py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Sản phẩm</h1>
          <p className="text-slate-500 mt-2">Khám phá các sản phẩm chất lượng của chúng tôi</p>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Tìm kiếm sản phẩm..." value={searchQuery} onChange={(e) =>{  onSearchChange(e.target.value); }} className="w-full h-10 pl-10 pr-4 rounded-lg border border-slate-200 focus:border-orange-500 outline-none" />
            </div>
            <select value={selectedCategory ?? ''} onChange={(e) =>{  onCategoryChange(e.target.value ? e.target.value as Id<"productCategories"> : null); }} className="h-10 px-3 rounded-lg border border-slate-200 text-sm">
              <option value="">Tất cả danh mục</option>
              {categories.map((cat) => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
            </select>
            <select value={sortBy} onChange={(e) =>{  onSortChange(e.target.value as ProductSortOption); }} className="h-10 px-3 rounded-lg border border-slate-200 text-sm">
              <option value="newest">Mới nhất</option>
              <option value="popular">Bán chạy</option>
              <option value="price_asc">Giá thấp → cao</option>
              <option value="price_desc">Giá cao → thấp</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-slate-500">
            Hiển thị <span className="font-medium text-slate-900">{products.length}</span>
            {totalCount !== undefined && totalCount > products.length && <> / {totalCount}</>} sản phẩm
          </p>
        </div>

        {products.length === 0 ? (
          <EmptyState brandColor={brandColor} onReset={() => { onSearchChange(''); onCategoryChange(null); }} />
        ) : (
          <ProductList products={products} categoryMap={categoryMap} brandColor={brandColor} showPrice={showPrice} showSalePrice={showSalePrice} showStock={showStock} formatPrice={formatPrice} />
        )}

        {paginationNode}
      </div>
    </div>
  );
}
