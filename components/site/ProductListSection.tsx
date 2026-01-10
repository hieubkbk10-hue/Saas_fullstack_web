'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Package, Loader2, ArrowRight, ShoppingCart } from 'lucide-react';

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

// Badge component for product tags
const ProductBadge = ({ 
  isNew, 
  isSale, 
  discount 
}: { 
  isNew?: boolean; 
  isSale?: boolean; 
  discount?: number;
}) => {
  if (!isNew && !isSale && !discount) return null;
  return (
    <div className="absolute top-2 left-2 z-10 flex flex-col gap-1.5">
      {isNew && (
        <span className="px-1.5 py-0.5 text-[10px] font-medium bg-blue-500 text-white rounded">Mới</span>
      )}
      {discount && discount > 0 && (
        <span className="px-1.5 py-0.5 text-[10px] font-medium bg-red-500 text-white rounded">-{discount}%</span>
      )}
    </div>
  );
};

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
      <section className="py-12 md:py-16 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-center min-h-[200px]">
          <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
        </div>
      </section>
    );
  }

  // No products state
  if (products.length === 0) {
    return (
      <section className="py-12 md:py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 mb-4">{title}</h2>
          <p className="text-slate-500">Chưa có sản phẩm nào.</p>
        </div>
      </section>
    );
  }

  // Format price
  const formatPrice = (price?: number) => {
    if (!price) return '';
    return price.toLocaleString('vi-VN') + 'đ';
  };

  // Calculate discount
  const getDiscount = (price?: number, salePrice?: number) => {
    if (!price || !salePrice || salePrice >= price) return 0;
    return Math.round(((price - salePrice) / price) * 100);
  };

  // Style 1: Grid - Professional cards với hover effects
  if (style === 'grid') {
    return (
      <section className="py-12 md:py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-center mb-8 md:mb-12 text-slate-900">{title}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
            {products.slice(0, 8).map((product) => {
              const discount = getDiscount(product.price, product.salePrice);
              return (
                <Link key={product._id} href={`/products/${product.slug}`} className="group">
                  <article className="relative bg-white rounded-xl overflow-hidden border border-slate-200/60 hover:border-slate-300/50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 h-full flex flex-col">
                    <ProductBadge discount={discount} />
                    
                    {/* Image */}
                    <div className="relative aspect-square overflow-hidden bg-slate-100/50">
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
                    
                    {/* Content */}
                    <div className="p-3 md:p-4 flex-1 flex flex-col">
                      <h4 className="font-semibold text-sm md:text-base text-slate-900 line-clamp-2 leading-tight group-hover:text-opacity-80 transition-colors flex-1">
                        {product.name}
                      </h4>
                      
                      {/* Price */}
                      <div className="mt-2 flex items-center gap-2">
                        <span className="font-bold text-base md:text-lg" style={{ color: brandColor }}>
                          {formatPrice(product.salePrice || product.price)}
                        </span>
                      </div>
                    </div>
                    
                    {/* Action Button */}
                    <div className="p-3 md:p-4 pt-0">
                      <button 
                        className="w-full h-8 md:h-9 flex items-center justify-center gap-1.5 font-medium text-xs md:text-sm rounded-md bg-slate-100 text-slate-700 hover:text-white transition-all duration-200"
                        style={{ '--hover-bg': brandColor } as React.CSSProperties}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = brandColor; e.currentTarget.style.color = 'white'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = ''; e.currentTarget.style.color = ''; }}
                      >
                        <ShoppingCart size={14} />
                        Mua ngay
                      </button>
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
          {showViewAll && (
            <div className="flex justify-center pt-8 md:pt-10">
              <Link 
                href="/products" 
                className="group inline-flex items-center gap-2 px-5 py-2.5 border border-slate-200 rounded-lg font-medium text-sm hover:border-slate-300 transition-all"
              >
                Xem toàn bộ
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          )}
        </div>
      </section>
    );
  }

  // Style 2: List - Horizontal cards với 2 columns
  if (style === 'list') {
    return (
      <section className="py-12 md:py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-center mb-8 md:mb-12 text-slate-900">{title}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            {products.slice(0, 6).map((product) => {
              const discount = getDiscount(product.price, product.salePrice);
              return (
                <Link key={product._id} href={`/products/${product.slug}`} className="group block">
                  <article className="relative bg-white rounded-xl border border-slate-200/60 hover:border-slate-300/50 hover:shadow-md transition-all duration-300 flex h-32 md:h-40 overflow-hidden">
                    {/* Badges */}
                    <div className="absolute top-2 left-2 z-10 flex flex-row gap-1.5">
                      {discount > 0 && (
                        <span className="px-1.5 py-0.5 text-[10px] font-medium bg-red-500 text-white rounded">-{discount}%</span>
                      )}
                    </div>
                    
                    {/* Image */}
                    <div className="relative w-28 md:w-32 flex-shrink-0 overflow-hidden bg-slate-100/50">
                      {product.image ? (
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package size={24} className="text-slate-300" />
                        </div>
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="flex flex-col flex-1 min-w-0 justify-between">
                      <div className="flex-1 p-3 md:p-4 pr-3">
                        <h4 className="font-semibold text-sm md:text-base text-slate-900 line-clamp-2 group-hover:text-opacity-80 transition-colors">
                          {product.name}
                        </h4>
                        <div className="flex items-center mt-1.5 gap-2">
                          <span className="font-bold text-base" style={{ color: brandColor }}>
                            {formatPrice(product.salePrice || product.price)}
                          </span>
                        </div>
                      </div>
                      
                      {/* Action */}
                      <div className="p-3 md:p-4 pt-0 flex justify-end">
                        <span 
                          className="px-3 py-1.5 text-xs font-medium rounded-md text-white transition-all"
                          style={{ backgroundColor: brandColor }}
                        >
                          Mua ngay
                        </span>
                      </div>
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
          {showViewAll && (
            <div className="flex justify-center pt-8 md:pt-10">
              <Link 
                href="/products" 
                className="group inline-flex items-center gap-2 px-5 py-2.5 border border-slate-200 rounded-lg font-medium text-sm hover:border-slate-300 transition-all"
              >
                Xem toàn bộ
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          )}
        </div>
      </section>
    );
  }

  // Style 3: Carousel - Drag to scroll với snap
  return (
    <section className="py-12 md:py-16 relative group/carousel">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 md:mb-10 px-4">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">{title}</h2>
        </div>
        
        {/* Carousel Container */}
        <div className="flex overflow-x-auto gap-3 md:gap-6 pb-4 px-4 scrollbar-hide cursor-grab snap-x snap-mandatory">
          {products.slice(0, 8).map((product) => {
            const discount = getDiscount(product.price, product.salePrice);
            return (
              <Link 
                key={product._id} 
                href={`/products/${product.slug}`} 
                className="group flex-shrink-0 snap-center select-none min-w-[180px] md:min-w-[280px]"
                draggable={false}
              >
                <article className="relative bg-white rounded-xl overflow-hidden border border-slate-200/60 hover:border-slate-300/50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col h-full">
                  <ProductBadge discount={discount} />
                  
                  {/* Image */}
                  <div className="relative aspect-square md:h-[280px] overflow-hidden bg-slate-100/50">
                    {product.image ? (
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        draggable={false}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package size={32} className="text-slate-300" />
                      </div>
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className="p-3 space-y-1.5">
                    <h4 className="font-semibold text-sm text-slate-900 line-clamp-2 leading-tight">
                      {product.name}
                    </h4>
                    <div className="flex items-center">
                      <span className="font-bold text-base" style={{ color: brandColor }}>
                        {formatPrice(product.salePrice || product.price)}
                      </span>
                    </div>
                  </div>
                </article>
              </Link>
            );
          })}
        </div>
        
        {/* View All */}
        {showViewAll && (
          <div className="flex justify-center pt-6 md:pt-8 px-4">
            <Link 
              href="/products" 
              className="group inline-flex items-center gap-2 px-5 py-2.5 border border-slate-200 rounded-lg font-medium text-sm hover:border-slate-300 transition-all min-w-[160px] justify-center"
            >
              Xem toàn bộ
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
