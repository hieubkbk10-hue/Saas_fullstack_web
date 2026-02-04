'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useMutation, useQuery } from 'convex/react';
import { Heart, Package, ShoppingCart } from 'lucide-react';
import { api } from '@/convex/_generated/api';
import { useBrandColor } from '@/components/site/hooks';
import { useCustomerAuth } from '@/app/(site)/auth/context';
import { useWishlistConfig } from '@/lib/experiences/useSiteConfig';
import type { Id } from '@/convex/_generated/dataModel';

function formatPrice(price: number): string {
  return new Intl.NumberFormat('vi-VN', { currency: 'VND', style: 'currency' }).format(price);
}

export default function WishlistPage() {
  const brandColor = useBrandColor();
  const { customer, isAuthenticated, openLoginModal } = useCustomerAuth();
  const config = useWishlistConfig();
  const wishlistModule = useQuery(api.admin.modules.getModuleByKey, { key: 'wishlist' });
  const itemsPerPageSetting = useQuery(api.admin.modules.getModuleSetting, { moduleKey: 'wishlist', settingKey: 'itemsPerPage' });
  const toggleWishlist = useMutation(api.wishlist.toggle);

  const itemsPerPage = useMemo(() => {
    const raw = itemsPerPageSetting?.value;
    return typeof raw === 'number' ? raw : 12;
  }, [itemsPerPageSetting?.value]);

  const wishlistItems = useQuery(
    api.wishlist.listByCustomerWithProducts,
    isAuthenticated && customer && (wishlistModule?.enabled ?? false)
      ? { customerId: customer.id as Id<'customers'>, limit: itemsPerPage }
      : 'skip'
  );

  const isLoadingWishlist = isAuthenticated && (wishlistModule?.enabled ?? true) && wishlistItems === undefined;

  if (wishlistModule && !wishlistModule.enabled) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-slate-100 flex items-center justify-center">
          <Heart size={32} className="text-slate-400" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Danh sách yêu thích đang tắt</h1>
        <p className="text-slate-500">Hãy bật module Wishlist để sử dụng tính năng này.</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-slate-100 flex items-center justify-center">
          <Heart size={32} className="text-slate-400" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Đăng nhập để xem danh sách yêu thích</h1>
        <p className="text-slate-500 mb-6">Bạn cần đăng nhập để quản lý sản phẩm yêu thích.</p>
        <button
          onClick={openLoginModal}
          className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-6 py-3 text-sm font-medium text-white hover:bg-slate-800"
        >
          Đăng nhập ngay
        </button>
      </div>
    );
  }

  if (isLoadingWishlist) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="mb-8">
          <div className="h-8 w-48 bg-slate-200 rounded-lg animate-pulse" />
          <div className="h-4 w-64 bg-slate-200 rounded-lg animate-pulse mt-3" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="bg-white rounded-2xl border border-slate-200 overflow-hidden animate-pulse">
              <div className="aspect-square bg-slate-200" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-slate-200 rounded" />
                <div className="h-4 w-2/3 bg-slate-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const items = wishlistItems ?? [];
  const isGrid = config.layoutStyle === 'grid';

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Danh sách yêu thích</h1>
        <p className="text-slate-500 mt-2">Lưu lại những sản phẩm bạn quan tâm.</p>
      </div>

      {config.showNotification && (
        <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          Bạn có {items.length} sản phẩm trong danh sách yêu thích.
        </div>
      )}

      {items.length === 0 ? (
        <div className="py-16 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-slate-100 flex items-center justify-center">
            <Package size={32} className="text-slate-400" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Chưa có sản phẩm yêu thích</h2>
          <p className="text-slate-500 mb-6">Hãy khám phá sản phẩm và thêm vào danh sách yêu thích.</p>
          <Link
            href="/products"
            className="inline-flex items-center justify-center rounded-lg px-6 py-3 text-sm font-medium text-white"
            style={{ backgroundColor: brandColor }}
          >
            Xem sản phẩm
          </Link>
        </div>
      ) : (
        <div className={isGrid ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6' : 'space-y-4'}>
          {items.map((item) => {
            const product = item.product;
            if (!product) {return null;}
            const price = product.salePrice ?? product.price;

            if (isGrid) {
              return (
                <Link
                  key={item._id}
                  href={`/products/${product.slug}`}
                  className="group bg-white rounded-2xl border border-slate-200 hover:border-slate-300 transition-all overflow-hidden"
                >
                  <div className="aspect-square bg-slate-100 relative">
                    {product.image ? (
                      <Image src={product.image} alt={product.name} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover group-hover:scale-105 transition-transform" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-8 h-8 text-slate-300" />
                      </div>
                    )}
                    <button
                      onClick={(event) => { event.preventDefault(); void toggleWishlist({ customerId: item.customerId, productId: item.productId }); }}
                      className="absolute top-2 right-2 p-2 rounded-full bg-white/90 text-red-500 shadow-sm"
                      aria-label="Bỏ khỏi yêu thích"
                    >
                      <Heart size={16} className="fill-current" />
                    </button>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-slate-900 text-sm mb-1 line-clamp-2">{product.name}</h3>
                    <div className="text-slate-900 font-bold text-sm">{formatPrice(price)}</div>
                    {config.showNote && item.note && (
                      <p className="mt-2 text-xs text-slate-500 line-clamp-2">{item.note}</p>
                    )}
                    {config.showAddToCartButton && (
                      <button
                        onClick={(event) => { event.preventDefault(); }}
                        className="mt-3 w-full py-2 rounded-lg text-sm font-medium text-white flex items-center justify-center gap-1.5 disabled:opacity-50"
                        style={{ backgroundColor: brandColor }}
                        disabled={product.stock === 0}
                      >
                        <ShoppingCart size={14} />
                        {product.stock === 0 ? 'Hết hàng' : 'Thêm vào giỏ'}
                      </button>
                    )}
                  </div>
                </Link>
              );
            }

            return (
              <div key={item._id} className="flex gap-4 bg-white border border-slate-200 rounded-2xl p-4">
                <Link href={`/products/${product.slug}`} className="relative w-24 h-24 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                  {product.image ? (
                    <Image src={product.image} alt={product.name} fill sizes="96px" className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-6 h-6 text-slate-300" />
                    </div>
                  )}
                </Link>
                <div className="flex-1">
                  <Link href={`/products/${product.slug}`} className="font-semibold text-slate-900 hover:underline">
                    {product.name}
                  </Link>
                  <div className="text-slate-900 font-bold text-sm mt-1">{formatPrice(price)}</div>
                  {config.showNote && item.note && (
                    <p className="mt-2 text-sm text-slate-500">{item.note}</p>
                  )}
                </div>
                <button
                  onClick={() =>{  void toggleWishlist({ customerId: item.customerId, productId: item.productId }); }}
                  className="self-start text-red-500 text-sm font-medium"
                >
                  Bỏ thích
                </button>
                {config.showAddToCartButton && (
                  <button
                    onClick={() => { }}
                    className="self-start px-3 py-1.5 rounded-lg text-xs font-medium text-white flex items-center gap-1 disabled:opacity-50"
                    style={{ backgroundColor: brandColor }}
                    disabled={product.stock === 0}
                  >
                    <ShoppingCart size={12} />
                    {product.stock === 0 ? 'Hết hàng' : 'Thêm'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
