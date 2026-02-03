import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useMemo } from 'react';

type PaginationType = 'pagination' | 'infiniteScroll';
type FilterPosition = 'sidebar' | 'top' | 'none';

type PostsListConfig = {
  layoutStyle: 'grid' | 'list' | 'masonry';
  filterPosition: FilterPosition;
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
  layoutStyle: 'grid' | 'sidebar' | 'list';
  paginationType: PaginationType;
  showSearch: boolean;
  showCategories: boolean;
  postsPerPage: number;
};

export function useProductsListConfig(): ProductsListConfig {
  const experienceSetting = useQuery(api.settings.getByKey, { key: 'products_list_ui' });
  
  return useMemo(() => {
    const raw = experienceSetting?.value as {
      layoutStyle?: ProductsListConfig['layoutStyle'] | 'masonry';
      layouts?: Record<string, Partial<Omit<ProductsListConfig, 'layoutStyle'> & { showPagination?: boolean }>>;
      paginationType?: string | boolean;
      showPagination?: boolean;
      showSearch?: boolean;
      showCategories?: boolean;
      postsPerPage?: number;
    } | undefined;

    const rawLayout = raw?.layoutStyle;
    const layoutStyle: ProductsListConfig['layoutStyle'] = rawLayout === 'masonry' ? 'sidebar' : (rawLayout ?? 'grid');
    const layoutConfig = layoutStyle === 'sidebar'
      ? (raw?.layouts?.sidebar ?? raw?.layouts?.masonry)
      : raw?.layouts?.[layoutStyle];
    return {
      layoutStyle,
      paginationType: normalizePaginationType(layoutConfig?.paginationType ?? raw?.paginationType ?? layoutConfig?.showPagination ?? raw?.showPagination),
      showSearch: layoutConfig?.showSearch ?? raw?.showSearch ?? true,
      showCategories: layoutConfig?.showCategories ?? raw?.showCategories ?? true,
      postsPerPage: layoutConfig?.postsPerPage ?? raw?.postsPerPage ?? 12,
    };
  }, [experienceSetting?.value]);
}

type ServicesListConfig = {
   layoutStyle: 'grid' | 'sidebar' | 'masonry';
  filterPosition: 'sidebar' | 'top' | 'none';
  paginationType: PaginationType;
  showSearch: boolean;
  showCategories: boolean;
  postsPerPage: number;
};

export function useServicesListConfig(): ServicesListConfig {
  const experienceSetting = useQuery(api.settings.getByKey, { key: 'services_list_ui' });
  
  return useMemo(() => {
    const raw = experienceSetting?.value as {
       layoutStyle?: ServicesListConfig['layoutStyle'] | 'list';
      layouts?: Record<string, Partial<Omit<ServicesListConfig, 'layoutStyle'> & { showPagination?: boolean }>>;
      filterPosition?: FilterPosition;
      paginationType?: string | boolean;
      showPagination?: boolean;
      showSearch?: boolean;
      showCategories?: boolean;
      postsPerPage?: number;
    } | undefined;

     const rawLayout = raw?.layoutStyle;
     const layoutStyle: ServicesListConfig['layoutStyle'] = rawLayout === 'list' ? 'sidebar' : (rawLayout ?? 'grid');
    const layoutConfig = raw?.layouts?.[layoutStyle];
    return {
      layoutStyle,
      filterPosition: layoutConfig?.filterPosition ?? raw?.filterPosition ?? 'sidebar',
      paginationType: normalizePaginationType(layoutConfig?.paginationType ?? raw?.paginationType ?? layoutConfig?.showPagination ?? raw?.showPagination),
      showSearch: layoutConfig?.showSearch ?? raw?.showSearch ?? true,
      showCategories: layoutConfig?.showCategories ?? raw?.showCategories ?? true,
      postsPerPage: layoutConfig?.postsPerPage ?? raw?.postsPerPage ?? 12,
    };
  }, [experienceSetting?.value]);
}
