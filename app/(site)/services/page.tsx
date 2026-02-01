'use client';

import React, { Suspense, useCallback, useMemo, useState } from 'react';
import { useQuery } from 'convex/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/convex/_generated/api';
import { useBrandColor } from '@/components/site/hooks';
import type { Id } from '@/convex/_generated/dataModel';
import {
  FullWidthLayout,
  MagazineLayout,
  type ServiceSortOption,
  ServicesFilter,
  SidebarLayout,
} from '@/components/site/services';

type ServicesListLayout = 'fullwidth' | 'sidebar' | 'magazine';

// Hook to get services layout from experience settings
function useServicesLayout(): ServicesListLayout {
  const setting = useQuery(api.settings.getByKey, { key: 'services_list_ui' });
  const config = setting?.value as { layoutStyle?: string } | undefined;
  const layoutStyle = config?.layoutStyle;
  
  // Map experience config to actual layout
  if (layoutStyle === 'grid') {return 'fullwidth';}
  if (layoutStyle === 'sidebar') {return 'sidebar';}
  if (layoutStyle === 'masonry') {return 'magazine';}
  
  return 'fullwidth';
}

// Hook to get enabled service fields
function useEnabledServiceFields(): Set<string> {
  const fields = useQuery(api.admin.modules.listEnabledModuleFields, { moduleKey: 'services' });
  return useMemo(() => {
    if (!fields) {return new Set<string>();}
    return new Set(fields.map(f => f.fieldKey));
  }, [fields]);
}

function ServicesListSkeleton() {
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

export default function ServicesPage() {
  return (
    <Suspense fallback={<ServicesListSkeleton />}>
      <ServicesContent />
    </Suspense>
  );
}

function ServicesContent() {
  // SVC-013: Use brandColor hook
  const brandColor = useBrandColor();
  const layout = useServicesLayout();
  const enabledFields = useEnabledServiceFields();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<Id<"serviceCategories"> | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<ServiceSortOption>('newest');

  // Queries
  const categories = useQuery(api.serviceCategories.listActive, { limit: 20 });
  type CategoriesResult = NonNullable<typeof categories>;
  const [cachedCategories, setCachedCategories] = useState<CategoriesResult | null>(null);
  const stableCategories = categories ?? cachedCategories;

  const categoryFromUrl = useMemo(() => {
    const catSlug = searchParams.get('category');
    if (!catSlug || !stableCategories) {return null;}
    const matchedCategory = stableCategories.find((c) => c.slug === catSlug);
    return matchedCategory?._id ?? null;
  }, [searchParams, stableCategories]);

  const activeCategory = selectedCategory ?? categoryFromUrl;

  const services = useQuery(api.services.searchPublished, {
    categoryId: activeCategory ?? undefined,
    limit: 24,
    search: searchQuery || undefined,
    sortBy,
  });

  const totalCount = useQuery(api.services.countPublished, {
    categoryId: activeCategory ?? undefined,
  });

  const featuredServices = useQuery(api.services.listFeatured, { limit: 5 });

  type ServicesResult = NonNullable<typeof services>;
  const [cachedServices, setCachedServices] = useState<ServicesResult | null>(null);
  const [cachedTotalCount, setCachedTotalCount] = useState<number | null>(null);

  React.useEffect(() => {
    if (services) {
      setCachedServices(services);
    }
  }, [services]);

  React.useEffect(() => {
    if (categories) {
      setCachedCategories(categories);
    }
  }, [categories]);

  React.useEffect(() => {
    if (totalCount !== undefined) {
      setCachedTotalCount(totalCount ?? null);
    }
  }, [totalCount]);

  const displayServices = services ?? cachedServices ?? [];
  const displayTotalCount = totalCount ?? cachedTotalCount ?? displayServices.length;

  // Build category map for O(1) lookup
  const categoryMap = useMemo(() => {
    if (!stableCategories) {return new Map<string, string>();}
    return new Map(stableCategories.map((c) => [c._id, c.name]));
  }, [stableCategories]);

  // Handlers - SVC-009: Update URL with category
  const handleCategoryChange = useCallback((categoryId: Id<"serviceCategories"> | null) => {
    setSelectedCategory(categoryId);
    
    const params = new URLSearchParams(searchParams.toString());
    if (categoryId && stableCategories) {
      const category = stableCategories.find(c => c._id === categoryId);
      if (category) {
        params.set('category', category.slug);
      }
    } else {
      params.delete('category');
    }
    
    const newUrl = params.toString() ? `/services?${params.toString()}` : '/services';
    router.push(newUrl, { scroll: false });
  }, [searchParams, stableCategories, router]);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleSortChange = useCallback((sort: ServiceSortOption) => {
    setSortBy(sort);
  }, []);

  // Loading state
  if (!stableCategories && displayServices.length === 0) {
    return <ServicesListSkeleton />;
  }

  return (
    <div className="py-6 md:py-10 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
            Dịch vụ của chúng tôi
          </h1>
        </div>

        {/* Layout based rendering */}
        {layout === 'fullwidth' && (
          <>
            {/* Filter Bar */}
            <div className="mb-8">
              <ServicesFilter
                categories={stableCategories ?? []}
                selectedCategory={selectedCategory}
                onCategoryChange={handleCategoryChange}
                searchQuery={searchQuery}
                onSearchChange={handleSearchChange}
                sortBy={sortBy}
                onSortChange={handleSortChange}
                totalResults={displayTotalCount}
                brandColor={brandColor}
              />
            </div>

            {/* Services */}
            <FullWidthLayout
              services={displayServices}
              brandColor={brandColor}
              categoryMap={categoryMap}
              viewMode="grid"
              enabledFields={enabledFields}
            />
          </>
        )}

        {layout === 'sidebar' && (
          <SidebarLayout
            services={displayServices}
            brandColor={brandColor}
            categoryMap={categoryMap}
            categories={stableCategories ?? []}
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            enabledFields={enabledFields}
          />
        )}

        {layout === 'magazine' && (
          <MagazineLayout
            services={displayServices}
            brandColor={brandColor}
            categoryMap={categoryMap}
            categories={stableCategories ?? []}
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
            featuredServices={featuredServices ?? []}
            enabledFields={enabledFields}
          />
        )}

        {/* Load More (for all layouts) */}
        {displayServices.length >= 24 && (
          <div className="text-center mt-8">
            <button
              className="px-6 py-3 rounded-lg font-medium transition-colors duration-200 hover:opacity-80"
              style={{ backgroundColor: `${brandColor}15`, color: brandColor }}
            >
              Xem thêm dịch vụ
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
