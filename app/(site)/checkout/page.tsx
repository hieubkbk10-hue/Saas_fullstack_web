'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useQuery } from 'convex/react';
import { CreditCard, Package, Truck } from 'lucide-react';
import { api } from '@/convex/_generated/api';
import { useBrandColor } from '@/components/site/hooks';
import { useCheckoutConfig } from '@/lib/experiences';
import { useCustomerAuth } from '@/app/(site)/auth/context';
import type { Id } from '@/convex/_generated/dataModel';

const formatPrice = (value: number) => new Intl.NumberFormat('vi-VN', { currency: 'VND', style: 'currency' }).format(value);

export default function CheckoutPage() {
  const brandColor = useBrandColor();
  const searchParams = useSearchParams();
  const { isAuthenticated, openLoginModal } = useCustomerAuth();
  const checkoutConfig = useCheckoutConfig();
  const ordersModule = useQuery(api.admin.modules.getModuleByKey, { key: 'orders' });

  const { productId, quantity, variantId } = useMemo(() => {
    const rawId = searchParams.get('productId');
    const rawQuantity = Number(searchParams.get('quantity'));
    const rawVariantId = searchParams.get('variantId');
    return {
      productId: rawId as Id<'products'> | null,
      quantity: Number.isFinite(rawQuantity) && rawQuantity > 0 ? Math.min(rawQuantity, 99) : 1,
      variantId: rawVariantId as Id<'productVariants'> | null,
    };
  }, [searchParams]);

  const product = useQuery(api.products.getById, productId ? { id: productId } : 'skip');
  const variants = useQuery(
    api.productVariants.listByIds,
    variantId ? { ids: [variantId] } : 'skip'
  );

  const selectedVariant = variants?.[0] ?? null;
  const optionIds = useMemo(() => {
    if (!selectedVariant) {
      return [];
    }
    return Array.from(new Set(selectedVariant.optionValues.map((optionValue) => optionValue.optionId)));
  }, [selectedVariant]);

  const valueIds = useMemo(() => {
    if (!selectedVariant) {
      return [];
    }
    return Array.from(new Set(selectedVariant.optionValues.map((optionValue) => optionValue.valueId)));
  }, [selectedVariant]);

  const variantOptions = useQuery(
    api.productOptions.listByIds,
    optionIds.length > 0 ? { ids: optionIds } : 'skip'
  );

  const variantValues = useQuery(
    api.productOptionValues.listByIds,
    valueIds.length > 0 ? { ids: valueIds } : 'skip'
  );

  const variantTitle = useMemo(() => {
    if (!selectedVariant) {
      return null;
    }
    const optionMap = new Map(variantOptions?.map((option) => [option._id, option]) ?? []);
    const valueMap = new Map(variantValues?.map((value) => [value._id, value]) ?? []);
    const parts = selectedVariant.optionValues
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

    return parts.join(' • ');
  }, [selectedVariant, variantOptions, variantValues]);

  const basePrice = selectedVariant?.price ?? product?.price ?? 0;
  const salePrice = selectedVariant ? selectedVariant.salePrice : product?.salePrice;
  const unitPrice = salePrice ?? basePrice;
  const subtotal = unitPrice * quantity;

  if (ordersModule && !ordersModule.enabled) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-slate-100 flex items-center justify-center">
          <Package size={32} className="text-slate-400" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Thanh toán đang tắt</h1>
        <p className="text-slate-500">Hãy bật module Đơn hàng để sử dụng tính năng này.</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-slate-100 flex items-center justify-center">
          <CreditCard size={32} className="text-slate-400" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Đăng nhập để thanh toán</h1>
        <p className="text-slate-500 mb-6">Bạn cần đăng nhập để tạo đơn hàng.</p>
        <button
          onClick={openLoginModal}
          className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-6 py-3 text-sm font-medium text-white hover:bg-slate-800"
        >
          Đăng nhập ngay
        </button>
      </div>
    );
  }

  if (!productId) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-slate-100 flex items-center justify-center">
          <Package size={32} className="text-slate-400" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Chưa chọn sản phẩm</h1>
        <p className="text-slate-500 mb-6">Vui lòng chọn sản phẩm trước khi thanh toán.</p>
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

  if (product === undefined) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <div className="h-6 w-48 bg-slate-200 rounded-lg animate-pulse mx-auto" />
        <div className="h-4 w-64 bg-slate-200 rounded-lg animate-pulse mt-3 mx-auto" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-slate-100 flex items-center justify-center">
          <Package size={32} className="text-slate-400" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Sản phẩm không tồn tại</h1>
        <p className="text-slate-500 mb-6">Sản phẩm đã bị xoá hoặc không còn khả dụng.</p>
        <Link
          href="/products"
          className="inline-flex items-center justify-center rounded-lg px-6 py-3 text-sm font-medium text-white"
          style={{ backgroundColor: brandColor }}
        >
          Quay lại shop
        </Link>
      </div>
    );
  }

  const SummaryCard = (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-4">
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-500">Sản phẩm</span>
        <span className="font-medium">{quantity}x</span>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-500">Tạm tính</span>
        <span className="font-semibold text-slate-900">{formatPrice(subtotal)}</span>
      </div>
      <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
        <span className="text-sm text-slate-500">Tổng cộng</span>
        <span className="text-lg font-bold text-slate-900">{formatPrice(subtotal)}</span>
      </div>
      <button
        className="w-full h-11 rounded-lg text-sm font-semibold text-white"
        style={{ backgroundColor: brandColor }}
      >
        Đặt hàng ngay
      </button>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Thanh toán</h1>
        <p className="text-slate-500 mt-2">Hoàn tất đơn hàng của bạn trong vài bước.</p>
      </div>

      <div className={`grid gap-6 ${checkoutConfig.orderSummaryPosition === 'right' ? 'lg:grid-cols-3' : 'grid-cols-1'}`}>
        <div className={checkoutConfig.orderSummaryPosition === 'right' ? 'lg:col-span-2 space-y-6' : 'space-y-6'}>
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h2 className="text-lg font-semibold text-slate-900 mb-3">Sản phẩm</h2>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-medium text-slate-900">{product.name}</p>
                {variantTitle && <p className="text-xs text-slate-500 mt-1">{variantTitle}</p>}
                <p className="text-sm text-slate-500">Số lượng: {quantity}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-500">Đơn giá</p>
                <p className="font-semibold text-slate-900">{formatPrice(unitPrice)}</p>
              </div>
            </div>
          </div>

          {checkoutConfig.showShippingOptions && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <div className="flex items-center gap-2 mb-3">
                <Truck className="w-5 h-5 text-slate-400" />
                <h2 className="text-lg font-semibold text-slate-900">Vận chuyển</h2>
              </div>
              <div className="space-y-2 text-sm text-slate-600">
                <label className="flex items-center gap-2">
                  <input type="radio" name="shipping" defaultChecked className="accent-slate-900" />
                  <span>Giao tiêu chuẩn (2-4 ngày)</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" name="shipping" className="accent-slate-900" />
                  <span>Giao nhanh (24h)</span>
                </label>
              </div>
            </div>
          )}

          {checkoutConfig.showPaymentMethods && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <div className="flex items-center gap-2 mb-3">
                <CreditCard className="w-5 h-5 text-slate-400" />
                <h2 className="text-lg font-semibold text-slate-900">Thanh toán</h2>
              </div>
              <div className="space-y-2 text-sm text-slate-600">
                <label className="flex items-center gap-2">
                  <input type="radio" name="payment" defaultChecked className="accent-slate-900" />
                  <span>COD - Thanh toán khi nhận hàng</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" name="payment" className="accent-slate-900" />
                  <span>Chuyển khoản ngân hàng</span>
                </label>
              </div>
            </div>
          )}
        </div>

        {checkoutConfig.orderSummaryPosition === 'right' ? (
          <div>{SummaryCard}</div>
        ) : (
          <div className="mt-2">{SummaryCard}</div>
        )}
      </div>
    </div>
  );
}
