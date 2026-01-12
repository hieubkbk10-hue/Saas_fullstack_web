'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Package, Loader2, ArrowRight } from 'lucide-react';

// 3 Styles mới theo mẫu BrandStory.tsx
// 'minimal' = Luxury Minimal, 'commerce' = Commerce Card, 'bento' = Bento Grid
type ProductListStyle = 'minimal' | 'commerce' | 'bento';

interface ProductListSectionProps {
  config: Record<string, unknown>;
  brandColor: string;
  title: string;
}

export function ProductListSection({ config, brandColor, title }: ProductListSectionProps) {
  const style = (config.style as ProductListStyle) || 'commerce';
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
    if (!price || !salePrice || salePrice >= price) return null;
    return `-${Math.round(((price - salePrice) / price) * 100)}%`;
  };

  // Common Header Component - Giữ nhất quán cho cả 3 styles
  const SectionHeader = () => (
    <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-end md:justify-between md:mb-10">
      <div className="flex items-end justify-between w-full md:w-auto">
        <div className="space-y-1 md:space-y-2">
          <div className="flex items-center gap-2 font-bold text-xs md:text-sm uppercase tracking-widest" style={{ color: brandColor }}>
            <span className="w-6 h-[2px] md:w-8" style={{ backgroundColor: brandColor }}></span>
            Bộ sưu tập
          </div>
          <h2 className="text-2xl md:text-4xl font-bold tracking-tight text-slate-900">
            {title}
          </h2>
        </div>
        {/* Mobile View All */}
        {showViewAll && (
          <Link href="/products" className="md:hidden p-0 h-auto font-semibold mb-1 gap-1 flex items-center" style={{ color: brandColor }}>
            Xem tất cả <ArrowRight size={16} />
          </Link>
        )}
      </div>
      {/* Desktop View All */}
      {showViewAll && (
        <Link href="/products" className="hidden md:flex gap-2 text-slate-500 hover:text-slate-900 pl-6 border-l border-slate-200 transition-colors items-center">
          Xem tất cả <ArrowRight size={16} />
        </Link>
      )}
    </div>
  );

  // Style 1: Luxury Minimal - Clean grid với hover effects và view details button
  if (style === 'minimal') {
    return (
      <section className="py-10 md:py-16 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <SectionHeader />
          
          {/* Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 gap-y-6 md:gap-x-6 md:gap-y-10">
            {products.slice(0, 4).map((product) => {
              const discount = getDiscount(product.price, product.salePrice);
              return (
                <Link key={product._id} href={`/products/${product.slug}`} className="group cursor-pointer">
                  {/* Image Container */}
                  <div className="relative aspect-square overflow-hidden rounded-2xl bg-slate-100 mb-4 border border-transparent hover:border-slate-200 transition-all">
                    {product.image ? (
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <Package size={48} className="text-slate-300" />
                      </div>
                    )}
                    
                    {/* Discount / New Badge */}
                    <div className="absolute top-3 left-3 flex flex-col gap-1">
                      {discount && (
                        <span className="px-2 py-1 text-[10px] font-bold text-white rounded shadow-sm" style={{ backgroundColor: brandColor, boxShadow: `0 2px 4px ${brandColor}20` }}>
                          {discount}
                        </span>
                      )}
                    </div>

                    {/* View Details Button (Hover) */}
                    <div className="absolute inset-x-4 bottom-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 opacity-0 group-hover:opacity-100">
                      <span className="block w-full bg-white/95 hover:bg-white backdrop-blur-md shadow-lg font-bold py-2 px-4 rounded-lg text-sm text-center" style={{ color: brandColor }}>
                        Xem chi tiết
                      </span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="space-y-1">
                    <h3 className="font-medium text-slate-900 text-base truncate group-hover:opacity-80 transition-colors">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-bold text-slate-900">{formatPrice(product.salePrice || product.price)}</span>
                      {product.salePrice && product.price && product.salePrice < product.price && (
                        <span className="text-xs text-slate-400 line-through">
                          {formatPrice(product.price)}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    );
  }

  // Style 2: Commerce Card - Cards với button Xem chi tiết và hover effects
  if (style === 'commerce') {
    return (
      <section className="py-10 md:py-16 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <SectionHeader />
          
          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {products.slice(0, 4).map((product) => {
              const discount = getDiscount(product.price, product.salePrice);
              return (
                <Link 
                  key={product._id} 
                  href={`/products/${product.slug}`}
                  className="group bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-slate-300 transition-all duration-300 flex flex-col"
                >
                  {/* Image */}
                  <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                    {product.image ? (
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <Package size={40} className="text-slate-300" />
                      </div>
                    )}
                    {discount && (
                      <div className="absolute top-2 right-2 text-xs font-bold px-2 py-1 rounded text-white shadow-sm" style={{ backgroundColor: brandColor, boxShadow: `0 2px 4px ${brandColor}20` }}>
                        {discount}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="font-bold text-slate-900 line-clamp-1 mb-1 group-hover:opacity-80 transition-colors">
                      {product.name}
                    </h3>
                    
                    <div className="flex items-baseline gap-2 mb-4 mt-auto pt-2">
                      <span className="text-base font-bold text-slate-900 group-hover:opacity-80 transition-colors">{formatPrice(product.salePrice || product.price)}</span>
                      {product.salePrice && product.price && product.salePrice < product.price && (
                        <span className="text-xs text-slate-400 line-through">
                          {formatPrice(product.price)}
                        </span>
                      )}
                    </div>

                    <span 
                      className="w-full gap-1.5 md:gap-2 border-2 py-1.5 md:py-2 px-2 md:px-4 rounded-lg font-medium flex items-center justify-center transition-colors hover:bg-opacity-10 whitespace-nowrap text-xs md:text-sm"
                      style={{ borderColor: `${brandColor}30`, color: brandColor }}
                    >
                      Xem chi tiết
                      <ArrowRight className="w-3 h-3 md:w-3.5 md:h-3.5 flex-shrink-0" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    );
  }

  // Style 3: Bento Grid - Asymmetric layout với hero card lớn
  const featured = products[products.length - 1] || products[0];
  const others = products.slice(0, 4);
  const featuredDiscount = getDiscount(featured?.price, featured?.salePrice);

  return (
    <section className="py-10 md:py-16 px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        <SectionHeader />
        
        {/* Bento Grid - Desktop */}
        <div className="hidden md:grid grid-cols-4 grid-rows-2 gap-4 h-auto">
          {/* Hero Item (Span 2x2) */}
          <Link 
            href={`/products/${featured?.slug}`}
            className="col-span-2 row-span-2 relative group rounded-2xl overflow-hidden cursor-pointer min-h-[400px] border border-transparent hover:border-slate-300 transition-colors"
            style={{ backgroundColor: `${brandColor}10` }}
          >
            {featured?.image ? (
              <img 
                src={featured.image} 
                alt={featured.name} 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-slate-100">
                <Package size={64} className="text-slate-300" />
              </div>
            )}
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
            
            {/* Discount Badge */}
            {featuredDiscount && (
              <div className="absolute top-4 right-4 font-bold px-3 py-1 rounded-full text-sm shadow-lg text-white" style={{ backgroundColor: brandColor, boxShadow: `0 4px 6px ${brandColor}30` }}>
                {featuredDiscount}
              </div>
            )}

            <div className="absolute bottom-0 left-0 p-6 md:p-8 w-full">
              <h3 className="text-2xl md:text-4xl font-bold mb-3 leading-tight text-white">{featured?.name}</h3>
              
              <div className="flex flex-row items-center justify-between gap-4 mt-2">
                <span className="text-2xl font-bold text-white">{formatPrice(featured?.salePrice || featured?.price)}</span>
                
                <span className="rounded-full px-6 py-2 text-white border-0 shadow-lg" style={{ backgroundColor: brandColor, boxShadow: `0 4px 6px ${brandColor}20` }}>
                  Xem chi tiết
                </span>
              </div>
            </div>
          </Link>

          {/* Small Grid Items */}
          {others.slice(0, 4).map((product) => {
            const discount = getDiscount(product.price, product.salePrice);
            return (
              <Link 
                key={product._id}
                href={`/products/${product.slug}`}
                className="col-span-1 row-span-1 bg-white border border-slate-200 rounded-2xl p-3 flex flex-col group hover:shadow-lg hover:border-slate-300 transition-all cursor-pointer relative overflow-hidden"
              >
                {/* Image Area */}
                <div className="relative aspect-square w-full rounded-xl overflow-hidden mb-3" style={{ backgroundColor: `${brandColor}08` }}>
                  {product.image ? (
                    <img 
                      src={product.image} 
                      className="h-full w-full object-contain p-2 transition-transform duration-300 group-hover:scale-110" 
                      alt={product.name} 
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <Package size={32} className="text-slate-300" />
                    </div>
                  )}
                  
                  {/* Discount Badge */}
                  {discount && (
                    <span className="absolute top-2 left-2 text-[10px] font-bold text-white px-1.5 py-0.5 rounded" style={{ backgroundColor: brandColor }}>
                      {discount}
                    </span>
                  )}

                  {/* Hover Action Button */}
                  <div className="absolute bottom-2 right-2 translate-y-10 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    <div className="text-white p-2 rounded-full shadow-lg" style={{ backgroundColor: brandColor }}>
                      <ArrowRight size={16} />
                    </div>
                  </div>
                </div>

                {/* Info Area */}
                <div className="mt-auto px-1">
                  <h4 className="font-medium text-sm text-slate-900 truncate group-hover:opacity-80 transition-colors">
                    {product.name}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-bold" style={{ color: brandColor }}>
                      {formatPrice(product.salePrice || product.price)}
                    </span>
                    {product.salePrice && product.price && product.salePrice < product.price && (
                      <span className="text-[10px] text-slate-400 line-through opacity-70">
                        {formatPrice(product.price)}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Mobile: 2x2 simple grid */}
        <div className="grid md:hidden grid-cols-2 gap-3">
          {products.slice(0, 4).map((product) => {
            const discount = getDiscount(product.price, product.salePrice);
            return (
              <Link key={product._id} href={`/products/${product.slug}`} className="group bg-white border border-slate-200 rounded-xl p-2 flex flex-col cursor-pointer hover:shadow-md transition-all">
                <div className="relative aspect-square w-full rounded-lg bg-slate-100 overflow-hidden mb-2">
                  {product.image ? (
                    <img src={product.image} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" alt={product.name} />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center"><Package size={24} className="text-slate-300" /></div>
                  )}
                  {discount && (
                    <span className="absolute top-2 left-2 text-[10px] font-bold text-white px-1.5 py-0.5 rounded" style={{ backgroundColor: brandColor }}>
                      {discount}
                    </span>
                  )}
                </div>
                <h4 className="font-medium text-sm text-slate-900 truncate group-hover:opacity-80 transition-colors">{product.name}</h4>
                <span className="text-sm font-bold mt-1" style={{ color: brandColor }}>{formatPrice(product.salePrice || product.price)}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
