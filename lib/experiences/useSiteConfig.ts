import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useMemo } from 'react';

type PostsListConfig = {
  layoutStyle: 'grid' | 'list' | 'masonry';
  filterPosition: 'sidebar' | 'top' | 'none';
  showPagination: boolean;
  showSearch: boolean;
  showCategories: boolean;
};

export function usePostsListConfig(): PostsListConfig {
  const experienceSetting = useQuery(api.settings.getByKey, { key: 'posts_list_ui' });
  
  return useMemo(() => {
    const raw = experienceSetting?.value as Partial<PostsListConfig> | undefined;
    return {
      layoutStyle: raw?.layoutStyle ?? 'grid',
      filterPosition: raw?.filterPosition ?? 'sidebar',
      showPagination: raw?.showPagination ?? true,
      showSearch: raw?.showSearch ?? true,
      showCategories: raw?.showCategories ?? true,
    };
  }, [experienceSetting?.value]);
}

type ProductsListConfig = {
  layoutStyle: 'grid' | 'list' | 'masonry';
  filterPosition: 'sidebar' | 'top' | 'none';
  showPagination: boolean;
  showSearch: boolean;
  showCategories: boolean;
};

export function useProductsListConfig(): ProductsListConfig {
  const experienceSetting = useQuery(api.settings.getByKey, { key: 'products_list_ui' });
  
  return useMemo(() => {
    const raw = experienceSetting?.value as Partial<ProductsListConfig> | undefined;
    return {
      layoutStyle: raw?.layoutStyle ?? 'grid',
      filterPosition: raw?.filterPosition ?? 'sidebar',
      showPagination: raw?.showPagination ?? true,
      showSearch: raw?.showSearch ?? true,
      showCategories: raw?.showCategories ?? true,
    };
  }, [experienceSetting?.value]);
}

type ServicesListConfig = {
  layoutStyle: 'grid' | 'list' | 'masonry';
  filterPosition: 'sidebar' | 'top' | 'none';
  showPagination: boolean;
  showSearch: boolean;
  showCategories: boolean;
};

export function useServicesListConfig(): ServicesListConfig {
  const experienceSetting = useQuery(api.settings.getByKey, { key: 'services_list_ui' });
  
  return useMemo(() => {
    const raw = experienceSetting?.value as Partial<ServicesListConfig> | undefined;
    return {
      layoutStyle: raw?.layoutStyle ?? 'grid',
      filterPosition: raw?.filterPosition ?? 'sidebar',
      showPagination: raw?.showPagination ?? true,
      showSearch: raw?.showSearch ?? true,
      showCategories: raw?.showCategories ?? true,
    };
  }, [experienceSetting?.value]);
}
