import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useMemo } from 'react';

type PaginationType = 'pagination' | 'infiniteScroll';

type PostsListConfig = {
  layoutStyle: 'grid' | 'list' | 'masonry';
  filterPosition: 'sidebar' | 'top' | 'none';
  paginationType: PaginationType;
  showSearch: boolean;
  showCategories: boolean;
  postsPerPage: number;
};

const normalizePaginationType = (value?: string | boolean): PaginationType => {
  if (value === 'infiniteScroll') return 'infiniteScroll';
  if (value === 'pagination') return 'pagination';
  if (value === false) return 'infiniteScroll';
  return 'pagination';
};

export function usePostsListConfig(): PostsListConfig {
  const experienceSetting = useQuery(api.settings.getByKey, { key: 'posts_list_ui' });
  
  return useMemo(() => {
    const raw = experienceSetting?.value as Partial<PostsListConfig & { showPagination?: boolean }> | undefined;
    return {
      layoutStyle: raw?.layoutStyle ?? 'grid',
      filterPosition: raw?.filterPosition ?? 'sidebar',
      paginationType: normalizePaginationType(raw?.paginationType ?? raw?.showPagination),
      showSearch: raw?.showSearch ?? true,
      showCategories: raw?.showCategories ?? true,
      postsPerPage: raw?.postsPerPage ?? 12,
    };
  }, [experienceSetting?.value]);
}

type ProductsListConfig = {
  layoutStyle: 'grid' | 'list' | 'masonry';
  filterPosition: 'sidebar' | 'top' | 'none';
  paginationType: PaginationType;
  showSearch: boolean;
  showCategories: boolean;
};

export function useProductsListConfig(): ProductsListConfig {
  const experienceSetting = useQuery(api.settings.getByKey, { key: 'products_list_ui' });
  
  return useMemo(() => {
    const raw = experienceSetting?.value as Partial<ProductsListConfig & { showPagination?: boolean }> | undefined;
    return {
      layoutStyle: raw?.layoutStyle ?? 'grid',
      filterPosition: raw?.filterPosition ?? 'sidebar',
      paginationType: normalizePaginationType(raw?.paginationType ?? raw?.showPagination),
      showSearch: raw?.showSearch ?? true,
      showCategories: raw?.showCategories ?? true,
    };
  }, [experienceSetting?.value]);
}

type ServicesListConfig = {
  layoutStyle: 'grid' | 'list' | 'masonry';
  filterPosition: 'sidebar' | 'top' | 'none';
  paginationType: PaginationType;
  showSearch: boolean;
  showCategories: boolean;
};

export function useServicesListConfig(): ServicesListConfig {
  const experienceSetting = useQuery(api.settings.getByKey, { key: 'services_list_ui' });
  
  return useMemo(() => {
    const raw = experienceSetting?.value as Partial<ServicesListConfig & { showPagination?: boolean }> | undefined;
    return {
      layoutStyle: raw?.layoutStyle ?? 'grid',
      filterPosition: raw?.filterPosition ?? 'sidebar',
      paginationType: normalizePaginationType(raw?.paginationType ?? raw?.showPagination),
      showSearch: raw?.showSearch ?? true,
      showCategories: raw?.showCategories ?? true,
    };
  }, [experienceSetting?.value]);
}
