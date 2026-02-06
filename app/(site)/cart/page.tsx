'use client';

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Clock, Minus, Package, Plus, Search, ShoppingCart, Trash2 } from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useBrandColor } from '@/components/site/hooks';
import { useCart } from '@/lib/cart';
import { useCartConfig } from '@/lib/experiences';
import { useCustomerAuth } from '@/app/(site)/auth/context';
import type { Id } from '@/convex/_generated/dataModel';

const formatPrice = (value: number) => new Intl.NumberFormat('vi-VN', { currency: 'VND', style: 'currency' }).format(value);

export default function CartPage() {
  const brandColor = useBrandColor();
  const { cart, items, itemsCount, totalAmount, isLoading, updateQuantity, removeItem, clearCart, updateNote } = useCart();
  const { isAuthenticated, openLoginModal } = useCustomerAuth();
  const cartConfig = useCartConfig();
  const cartModule = useQuery(api.admin.modules.getModuleByKey, { key: 'cart' });
  const layoutStyle = cartConfig.layoutStyle;
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<'newest' | 'name-asc' | 'price-asc' | 'price-desc' | 'qty-desc'>('newest');

  const variantIds = useMemo(
    () => Array.from(new Set(
      items
        .map((item) => item.variantId)
        .filter((id): id is Id<'productVariants'> => Boolean(id))
    )),
    [items]
  );

  const variants = useQuery(
    api.productVariants.listByIds,
    variantIds.length > 0 ? { ids: variantIds } : 'skip'
  );

  const optionIds = useMemo(() => {
    if (!variants) {
      return [];
    }
    const ids = new Set(variants.flatMap((variant) => variant.optionValues.map((optionValue) => optionValue.optionId)));
    return Array.from(ids);
  }, [variants]);

  const valueIds = useMemo(() => {
    if (!variants) {
      return [];
    }
    const ids = new Set(variants.flatMap((variant) => variant.optionValues.map((optionValue) => optionValue.valueId)));
    return Array.from(ids);
  }, [variants]);

  const variantOptions = useQuery(
    api.productOptions.listByIds,
    optionIds.length > 0 ? { ids: optionIds } : 'skip'
  );

  const variantValues = useQuery(
    api.productOptionValues.listByIds,
    valueIds.length > 0 ? { ids: valueIds } : 'skip'
  );

  const variantTitleById = useMemo(() => {
    if (!variants) {
      return new Map();
    }
    const optionMap = new Map(variantOptions?.map((option) => [option._id, option]) ?? []);
    const valueMap = new Map(variantValues?.map((value) => [value._id, value]) ?? []);

    return new Map(
      variants.map((variant) => {
        const parts = variant.optionValues
          .map((optionValue) => {
            const optionName = optionMap.get(optionValue.optionId)?.name;
            const value = valueMap.get(optionValue.valueId);
            const valueLabel = optionValue.customValue ?? value?.label ?? value?.value;
            if (!valueLabel) {
              return null;
            }
            return optionName ? `${optionName}: ${valueLabel}` : valueLabel;
          })
          .filter((part): part is string => Boolean(part));

        return [variant._id, parts.join(' • ')];
      })
    );
  }, [variantOptions, variantValues, variants]);

  const expiresAt = cart?.expiresAt ?? null;
  const expiresInText = useMemo(() => {
    if (!expiresAt) {
      return null;
    }
    const expiry = new Date(expiresAt);
    return `Giỏ hàng hết hạn lúc ${expiry.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
  }, [expiresAt]);

  const filteredItems = useMemo(() => {
    if (layoutStyle !== 'table') {
      return items;
    }

    let result = items;
    const query = searchQuery.trim().toLowerCase();
    if (query) {
      result = result.filter((item) => item.productName.toLowerCase().includes(query));
    }

    switch (sortOption) {
      case 'name-asc':
        result = [...result].sort((a, b) => a.productName.localeCompare(b.productName));
        break;
      case 'price-asc':
        result = [...result].sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result = [...result].sort((a, b) => b.price - a.price);
        break;
      case 'qty-desc':
        result = [...result].sort((a, b) => b.quantity - a.quantity);
        break;
      default:
        break;
    }

    return result;
  }, [items, layoutStyle, searchQuery, sortOption]);

  if (cartModule && !cartModule.enabled) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-slate-100 flex items-center justify-center">
          <ShoppingCart size={32} className="text-slate-400" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Giỏ hàng đang tắt</h1>
        <p className="text-slate-500">Hãy bật module Giỏ hàng để sử dụng tính năng này.</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-slate-100 flex items-center justify-center">
          <ShoppingCart size={32} className="text-slate-400" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Đăng nhập để xem giỏ hàng</h1>
        <p className="text-slate-500 mb-6">Bạn cần đăng nhập để quản lý giỏ hàng của mình.</p>
        <button
          onClick={openLoginModal}
          className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-6 py-3 text-sm font-medium text-white hover:bg-slate-800"
        >
          Đăng nhập ngay
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="mb-8">
          <div className="h-8 w-48 bg-slate-200 rounded-lg animate-pulse" />
          <div className="h-4 w-64 bg-slate-200 rounded-lg animate-pulse mt-3" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="bg-white rounded-2xl border border-slate-200 p-4 flex gap-4 animate-pulse">
                <div className="w-20 h-20 bg-slate-200 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-2/3 bg-slate-200 rounded" />
                  <div className="h-4 w-1/2 bg-slate-200 rounded" />
                </div>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-4 h-48 animate-pulse" />
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-slate-100 flex items-center justify-center">
          <Package size={32} className="text-slate-400" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Giỏ hàng trống</h1>
        <p className="text-slate-500 mb-6">Hãy chọn thêm sản phẩm để tiếp tục mua sắm.</p>
        <Link
          href="/products"
          className="inline-flex items-center justify-center rounded-lg px-6 py-3 text-sm font-medium text-white"
          style={{ backgroundColor: brandColor }}
        >
          Xem sản phẩm
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8 flex flex-col gap-3">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Giỏ hàng của bạn</h1>
          <p className="text-slate-500 mt-2">{itemsCount} sản phẩm trong giỏ hàng.</p>
        </div>
        {cartConfig.showExpiry && expiresInText && (
          <div className="flex items-center gap-2 text-sm text-red-500">
            <Clock size={14} />
            <span>{expiresInText}</span>
          </div>
        )}
      </div>

      {layoutStyle === 'table' ? (
        <div className="space-y-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="text-sm text-slate-500">Hiển thị {filteredItems.length} sản phẩm</div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Tìm theo tên sản phẩm..."
                  className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-200"
                />
              </div>
              <select
                value={sortOption}
                onChange={(event) => setSortOption(event.target.value as typeof sortOption)}
                className="w-full sm:w-48 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-200"
              >
                <option value="newest">Mới nhất</option>
                <option value="name-asc">Tên A-Z</option>
                <option value="price-asc">Giá tăng dần</option>
                <option value="price-desc">Giá giảm dần</option>
                <option value="qty-desc">Số lượng giảm dần</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="hidden md:block overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium">Sản phẩm</th>
                      <th className="px-4 py-3 text-left font-medium">Đơn giá</th>
                      <th className="px-4 py-3 text-left font-medium">Số lượng</th>
                      <th className="px-4 py-3 text-left font-medium">Thành tiền</th>
                      <th className="px-4 py-3 text-right font-medium">Xóa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.map((item) => (
                      <tr key={item._id} className="border-t">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0">
                              {item.productImage ? (
                                <Image src={item.productImage} alt={item.productName} width={48} height={48} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package className="w-5 h-5 text-slate-300" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="font-medium text-slate-900 line-clamp-2">{item.productName}</div>
                              {item.variantId && variantTitleById.get(item.variantId) && (
                                <div className="text-xs text-slate-500 mt-1">{variantTitleById.get(item.variantId)}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 font-medium" style={{ color: brandColor }}>{formatPrice(item.price)}</td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50"
                              onClick={() => updateQuantity(item._id, item.quantity - 1)}
                            >
                              <Minus size={12} className="text-slate-500" />
                            </button>
                            <span className="w-7 text-center text-sm font-medium text-slate-700">{item.quantity}</span>
                            <button
                              type="button"
                              className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50"
                              onClick={() => updateQuantity(item._id, item.quantity + 1)}
                            >
                              <Plus size={12} className="text-slate-500" />
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-4 font-semibold text-slate-900">{formatPrice(item.subtotal)}</td>
                        <td className="px-4 py-4 text-right">
                          <button
                            type="button"
                            className="p-2 rounded-lg hover:bg-red-50"
                            onClick={() => removeItem(item._id)}
                          >
                            <Trash2 size={16} className="text-slate-400 hover:text-red-500" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="md:hidden space-y-4">
                {filteredItems.map(item => (
                  <div key={item._id} className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col sm:flex-row gap-4">
                    <div className="w-24 h-24 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0">
                      {item.productImage ? (
                        <Image src={item.productImage} alt={item.productName} width={96} height={96} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-6 h-6 text-slate-300" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900 text-base line-clamp-2">{item.productName}</h3>
                      {item.variantId && variantTitleById.get(item.variantId) && (
                        <p className="text-xs text-slate-500 mt-1">{variantTitleById.get(item.variantId)}</p>
                      )}
                      <div className="text-slate-900 font-bold text-sm mt-1">{formatPrice(item.price)}</div>
                      <div className="mt-4 flex items-center gap-2">
                        <button
                          type="button"
                          className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50"
                          onClick={() => updateQuantity(item._id, item.quantity - 1)}
                        >
                          <Minus size={14} className="text-slate-500" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium text-slate-700">{item.quantity}</span>
                        <button
                          type="button"
                          className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50"
                          onClick={() => updateQuantity(item._id, item.quantity + 1)}
                        >
                          <Plus size={14} className="text-slate-500" />
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col items-end justify-between">
                      <button
                        type="button"
                        className="p-2 rounded-lg hover:bg-red-50"
                        onClick={() => removeItem(item._id)}
                      >
                        <Trash2 size={16} className="text-slate-400 hover:text-red-500" />
                      </button>
                      <div className="text-sm font-semibold text-slate-900">{formatPrice(item.subtotal)}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end mt-4">
                <button
                  type="button"
                  onClick={() => clearCart()}
                  className="text-sm text-slate-500 hover:text-slate-900"
                >
                  Xóa toàn bộ giỏ hàng
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {cartConfig.showNote && (
                <div className="bg-white rounded-2xl border border-slate-200 p-4">
                  <h4 className="font-medium text-slate-900 text-sm mb-2">Ghi chú đơn hàng</h4>
                  <textarea
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none"
                    rows={3}
                    placeholder="Ghi chú cho shop..."
                    value={cart?.note ?? ''}
                    onChange={(event) => updateNote(event.target.value)}
                  />
                </div>
              )}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Tạm tính</span>
                  <span className="font-medium">{formatPrice(totalAmount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Phí vận chuyển</span>
                  <span className="text-slate-400">Tính khi checkout</span>
                </div>
                <div className="border-t border-slate-200 pt-3 flex justify-between">
                  <span className="font-semibold text-slate-900">Tổng cộng</span>
                  <span className="text-lg font-bold" style={{ color: brandColor }}>{formatPrice(totalAmount)}</span>
                </div>
                <Link
                  href="/checkout?fromCart=true"
                  className="w-full py-3 rounded-xl text-white font-semibold text-sm text-center"
                  style={{ backgroundColor: brandColor }}
                >
                  Thanh toán
                </Link>
                <Link
                  href="/products"
                  className="block text-center text-sm text-slate-500 hover:text-slate-900"
                >
                  Tiếp tục mua sắm
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {items.map(item => (
              <div key={item._id} className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col sm:flex-row gap-4">
                <div className="w-24 h-24 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0">
                  {item.productImage ? (
                    <Image src={item.productImage} alt={item.productName} width={96} height={96} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-6 h-6 text-slate-300" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900 text-base line-clamp-2">{item.productName}</h3>
                  {item.variantId && variantTitleById.get(item.variantId) && (
                    <p className="text-xs text-slate-500 mt-1">{variantTitleById.get(item.variantId)}</p>
                  )}
                  <div className="text-slate-900 font-bold text-sm mt-1">{formatPrice(item.price)}</div>
                  <div className="mt-4 flex items-center gap-2">
                    <button
                      type="button"
                      className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50"
                      onClick={() => updateQuantity(item._id, item.quantity - 1)}
                    >
                      <Minus size={14} className="text-slate-500" />
                    </button>
                    <span className="w-8 text-center text-sm font-medium text-slate-700">{item.quantity}</span>
                    <button
                      type="button"
                      className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50"
                      onClick={() => updateQuantity(item._id, item.quantity + 1)}
                    >
                      <Plus size={14} className="text-slate-500" />
                    </button>
                  </div>
                </div>
                <div className="flex flex-col items-end justify-between">
                  <button
                    type="button"
                    className="p-2 rounded-lg hover:bg-red-50"
                    onClick={() => removeItem(item._id)}
                  >
                    <Trash2 size={16} className="text-slate-400 hover:text-red-500" />
                  </button>
                  <div className="text-sm font-semibold text-slate-900">{formatPrice(item.subtotal)}</div>
                </div>
              </div>
            ))}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => clearCart()}
                className="text-sm text-slate-500 hover:text-slate-900"
              >
                Xóa toàn bộ giỏ hàng
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {cartConfig.showNote && (
              <div className="bg-white rounded-2xl border border-slate-200 p-4">
                <h4 className="font-medium text-slate-900 text-sm mb-2">Ghi chú đơn hàng</h4>
                <textarea
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none"
                  rows={3}
                  placeholder="Ghi chú cho shop..."
                  value={cart?.note ?? ''}
                  onChange={(event) => updateNote(event.target.value)}
                />
              </div>
            )}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Tạm tính</span>
                <span className="font-medium">{formatPrice(totalAmount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Phí vận chuyển</span>
                <span className="text-slate-400">Tính khi checkout</span>
              </div>
              <div className="border-t border-slate-200 pt-3 flex justify-between">
                <span className="font-semibold text-slate-900">Tổng cộng</span>
                <span className="text-lg font-bold" style={{ color: brandColor }}>{formatPrice(totalAmount)}</span>
              </div>
              <Link
                href="/checkout?fromCart=true"
                className="w-full py-3 rounded-xl text-white font-semibold text-sm text-center"
                style={{ backgroundColor: brandColor }}
              >
                Thanh toán
              </Link>
              <Link
                href="/products"
                className="block text-center text-sm text-slate-500 hover:text-slate-900"
              >
                Tiếp tục mua sắm
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
