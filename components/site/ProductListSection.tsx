'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Package, Loader2, ArrowRight } from 'lucide-react';

// Helper to strip HTML tags from description
const stripHtml = (html?: string) => {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '').trim();
};

type ProductListStyle = 'grid' | 'list' | 'carousel';

interface ProductListSectionProps {
  config: Record<string, unknown>;
  brandColor: string;
  title: string;
}

export function ProductListSection({ config, brandColor, title }: ProductListSectionProps) {
  const style = (config.style as ProductListStyle) || 'grid';
  const itemCount = (config.itemCount as number) || 8;
  const selectionMode = (config.selectionMode as 'auto' | 'manual') || 'auto';
  const selectedProductIds = (config.selectedProductIds as string[]) || [];
  
  // Query products based on selection mode
  const productsData = useQuery(
    api.products.listAll, 
    selectionMode === 'auto' ? { limit: Math.min(itemCount, 20) } : { limit: 100 }
  );
  
  // Query categories for mapping
  const categories = useQuery(api.productCategories.listAll, { limit: 50 });
  
  // Build category map for O(1) lookup
  const categoryMap = React.useMemo(() => {
    if (!categories) return new Map<string, string>();
    return new Map(categories.map(c => [c._id, c.name]));
  }, [categories]);

  // Get products to display based on selection mode
  const products = React.useMemo(() => {
    if (!productsData) return [];
    
    if (selectionMode === 'manual' && selectedProductIds.length > 0) {
      const productMap = new Map(productsData.map(p => [p._id, p]));
      return selectedProductIds
        .map(id => productMap.get(id as Id<"products">))
        .filter((p): p is NonNullable<typeof p> => p !== undefined && p.status === 'Active');
    }
    
    return productsData.filter(p => p.status === 'Active').slice(0, itemCount);
  }, [productsData, selectionMode, selectedProductIds, itemCount]);

  const showViewAll = products.length >= 3;

  // Loading state
  if (productsData === undefined) {
    return (
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-center min-h-[200px]">
          <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
        </div>
      </section>
    );
  }

  // No products state
  if (products.length === 0) {
    return (
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">{title}</h2>
          <p className="text-slate-500">Chưa có sản phẩm nào.</p>
        </div>
      </section>
    );
  }

  // Format price
  const formatPrice = (price?: number, salePrice?: number) => {
    if (!price) return '';
    const displayPrice = salePrice || price;
    return displayPrice.toLocaleString('vi-VN') + 'đ';
  };

  // Style 1: Grid
  if (style === 'grid') {
    return (
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-slate-900">{title}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {products.slice(0, 8).map((product) => (
              <Link key={product._id} href={`/products/${product.slug}`} className="group">
                <article className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border h-full flex flex-col">
                  <div className="aspect-square bg-slate-100 overflow-hidden">
                    {product.image ? (
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package size={48} className="text-slate-300" />
                      </div>
                    )}
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <span className="text-xs text-slate-500 mb-1">
                      {categoryMap.get(product.categoryId) || 'Sản phẩm'}
                    </span>
                    <h4 className="font-semibold text-sm line-clamp-2 flex-1 group-hover:text-blue-600 transition-colors">
                      {product.name}
                    </h4>
                    <div className="mt-2 flex items-center gap-2">
                      {product.salePrice ? (
                        <>
                          <span className="font-bold" style={{ color: brandColor }}>
                            {formatPrice(product.salePrice)}
                          </span>
                          <span className="text-xs text-slate-400 line-through">
                            {formatPrice(product.price)}
                          </span>
                        </>
                      ) : (
                        <span className="font-bold" style={{ color: brandColor }}>
                          {formatPrice(product.price)}
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
          {showViewAll && (
            <div className="text-center mt-8">
              <Link 
                href="/products" 
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all hover:gap-3 group" 
                style={{ backgroundColor: `${brandColor}15`, color: brandColor }}
              >
                Xem tất cả
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          )}
        </div>
      </section>
    );
  }

  // Style 2: List
  if (style === 'list') {
    return (
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-slate-900">{title}</h2>
          <div className="space-y-4">
            {products.slice(0, 6).map((product) => (
              <Link key={product._id} href={`/products/${product.slug}`} className="group block">
                <article className="bg-white rounded-xl border flex items-center p-4 gap-4 hover:shadow-md transition-shadow">
                  <div className="w-20 h-20 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                    {product.image ? (
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package size={24} className="text-slate-300" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs text-slate-500">
                      {categoryMap.get(product.categoryId) || 'Sản phẩm'}
                    </span>
                    <h4 className="font-semibold group-hover:text-blue-600 transition-colors line-clamp-1">
                      {product.name}
                    </h4>
                    {product.description && (
                      <p className="text-sm text-slate-500 line-clamp-1 mt-0.5">{stripHtml(product.description)}</p>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    {product.salePrice ? (
                      <>
                        <div className="font-bold" style={{ color: brandColor }}>
                          {formatPrice(product.salePrice)}
                        </div>
                        <div className="text-xs text-slate-400 line-through">
                          {formatPrice(product.price)}
                        </div>
                      </>
                    ) : (
                      <div className="font-bold" style={{ color: brandColor }}>
                        {formatPrice(product.price)}
                      </div>
                    )}
                  </div>
                </article>
              </Link>
            ))}
          </div>
          {showViewAll && (
            <div className="text-center mt-8">
              <Link 
                href="/products" 
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all hover:gap-3 group" 
                style={{ backgroundColor: `${brandColor}15`, color: brandColor }}
              >
                Xem tất cả
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          )}
        </div>
      </section>
    );
  }

  // Style 3: Carousel
  return (
    <section className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-slate-900">{title}</h2>
          {showViewAll && (
            <Link 
              href="/products" 
              className="text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all group" 
              style={{ color: brandColor }}
            >
              Xem tất cả
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          )}
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {products.slice(0, 8).map((product) => (
            <Link key={product._id} href={`/products/${product.slug}`} className="group flex-shrink-0 w-52">
              <article className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border">
                <div className="aspect-square bg-slate-100 overflow-hidden">
                  {product.image ? (
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package size={32} className="text-slate-300" />
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h4 className="font-semibold text-sm line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {product.name}
                  </h4>
                  <div className="mt-2">
                    {product.salePrice ? (
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm" style={{ color: brandColor }}>
                          {formatPrice(product.salePrice)}
                        </span>
                        <span className="text-xs text-slate-400 line-through">
                          {formatPrice(product.price)}
                        </span>
                      </div>
                    ) : (
                      <span className="font-bold text-sm" style={{ color: brandColor }}>
                        {formatPrice(product.price)}
                      </span>
                    )}
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
