'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useMutation, useQuery } from 'convex/react';
import { CreditCard, Package, Truck } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/convex/_generated/api';
import { useBrandColor } from '@/components/site/hooks';
import { useCheckoutConfig } from '@/lib/experiences';
import { useCustomerAuth } from '@/app/(site)/auth/context';
import type { Id } from '@/convex/_generated/dataModel';

const formatPrice = (value: number) => new Intl.NumberFormat('vi-VN', { currency: 'VND', style: 'currency' }).format(value);

export default function CheckoutPage() {
  const brandColor = useBrandColor();
  const searchParams = useSearchParams();
  const { customer, isAuthenticated, openLoginModal } = useCustomerAuth();
  const checkoutConfig = useCheckoutConfig();
  const ordersModule = useQuery(api.admin.modules.getModuleByKey, { key: 'orders' });
  const createOrder = useMutation(api.orders.create);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'BankTransfer'>('COD');
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'fast'>('standard');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  const fromCart = searchParams.get('fromCart') === 'true';

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
  const cart = useQuery(
    api.cart.getByCustomer,
    fromCart && customer ? { customerId: customer.id as Id<'customers'> } : 'skip'
  );
  const cartItems = useQuery(
    api.cart.listCartItems,
    fromCart && cart?._id ? { cartId: cart._id } : 'skip'
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
  const shippingFee = checkoutConfig.showShippingOptions
    ? (shippingMethod === 'fast' ? 30000 : 15000)
    : 0;

  const orderItems = useMemo(() => {
    if (fromCart) {
      return (cartItems ?? []).map((item) => ({
        productId: item.productId,
        productName: item.productName,
        price: item.price,
        quantity: item.quantity,
        variantId: item.variantId,
      }));
    }

    if (!product) {
      return [];
    }

    return [{
      productId: product._id,
      productName: product.name,
      price: unitPrice,
      quantity,
      variantId: variantId ?? undefined,
      variantTitle: variantTitle ?? undefined,
    }];
  }, [cartItems, fromCart, product, quantity, unitPrice, variantId, variantTitle]);

  const totalAmount = fromCart ? (cart?.totalAmount ?? 0) : subtotal;
  const isCartLoading = fromCart && (cart === undefined || (cart && cartItems === undefined));

  useEffect(() => {
    if (customer && !customerName) {
      setCustomerName(customer.name ?? '');
    }
    if (customer && !customerPhone) {
      setCustomerPhone(customer.phone ?? '');
    }
  }, [customer, customerName, customerPhone]);

  const handlePlaceOrder = async () => {
    if (!customer) {
      openLoginModal();
      return;
    }

    if (!customerName.trim() || !customerPhone.trim() || !shippingAddress.trim()) {
      toast.error('Vui lòng nhập đầy đủ tên, số điện thoại và địa chỉ.');
      return;
    }

    if (orderItems.length === 0) {
      toast.error('Không có sản phẩm để đặt hàng.');
      return;
    }

    setIsSubmitting(true);
    try {
      const createdOrderId = await createOrder({
        customerId: customer.id as Id<'customers'>,
        items: orderItems,
        note: fromCart ? cart?.note : undefined,
        paymentMethod,
        shippingAddress: `${customerName} | ${customerPhone} | ${shippingAddress}`,
        shippingFee,
      });
      setOrderId(createdOrderId);
      toast.success('Đặt hàng thành công.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể tạo đơn hàng.');
    } finally {
      setIsSubmitting(false);
    }
  };

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

  if (!fromCart && !productId) {
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

  if (!fromCart && product === undefined) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <div className="h-6 w-48 bg-slate-200 rounded-lg animate-pulse mx-auto" />
        <div className="h-4 w-64 bg-slate-200 rounded-lg animate-pulse mt-3 mx-auto" />
      </div>
    );
  }

  if (!fromCart && !product) {
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

  if (fromCart && isCartLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <div className="h-6 w-48 bg-slate-200 rounded-lg animate-pulse mx-auto" />
        <div className="h-4 w-64 bg-slate-200 rounded-lg animate-pulse mt-3 mx-auto" />
      </div>
    );
  }

  if (fromCart && (!cart || !cartItems || cartItems.length === 0)) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-slate-100 flex items-center justify-center">
          <Package size={32} className="text-slate-400" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Giỏ hàng trống</h1>
        <p className="text-slate-500 mb-6">Hãy thêm sản phẩm trước khi thanh toán.</p>
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

  const SummaryCard = (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-4">
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-500">Sản phẩm</span>
        <span className="font-medium">{fromCart ? cart?.itemsCount ?? 0 : quantity}x</span>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-500">Tạm tính</span>
        <span className="font-semibold text-slate-900">{formatPrice(totalAmount)}</span>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-500">Phí vận chuyển</span>
        <span className="font-semibold text-slate-900">{formatPrice(shippingFee)}</span>
      </div>
      <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
        <span className="text-sm text-slate-500">Tổng cộng</span>
        <span className="text-lg font-bold text-slate-900">{formatPrice(totalAmount + shippingFee)}</span>
      </div>
      <button
        type="button"
        className="w-full h-11 rounded-lg text-sm font-semibold text-white"
        style={{ backgroundColor: brandColor }}
        onClick={handlePlaceOrder}
        disabled={isSubmitting || Boolean(orderId)}
      >
        {orderId ? 'Đã đặt hàng' : isSubmitting ? 'Đang xử lý...' : 'Đặt hàng ngay'}
      </button>
      {orderId && (
        <div className="text-xs text-emerald-600 text-center">
          Mã đơn: {orderId}
        </div>
      )}
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
            {fromCart && cartItems ? (
              <div className="space-y-3">
                {cartItems.map((item) => (
                  <div key={item._id} className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium text-slate-900">{item.productName}</p>
                      <p className="text-sm text-slate-500">Số lượng: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-500">Đơn giá</p>
                      <p className="font-semibold text-slate-900">{formatPrice(item.price)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-slate-900">{product?.name}</p>
                  {variantTitle && <p className="text-xs text-slate-500 mt-1">{variantTitle}</p>}
                  <p className="text-sm text-slate-500">Số lượng: {quantity}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-500">Đơn giá</p>
                  <p className="font-semibold text-slate-900">{formatPrice(unitPrice)}</p>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h2 className="text-lg font-semibold text-slate-900 mb-3">Thông tin giao hàng</h2>
            <div className="grid gap-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Họ tên"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm"
                  value={customerName}
                  onChange={(event) => setCustomerName(event.target.value)}
                />
                <input
                  type="text"
                  placeholder="Số điện thoại"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm"
                  value={customerPhone}
                  onChange={(event) => setCustomerPhone(event.target.value)}
                />
              </div>
              <input
                type="text"
                placeholder="Địa chỉ giao hàng"
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm"
                value={shippingAddress}
                onChange={(event) => setShippingAddress(event.target.value)}
              />
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
                  <input
                    type="radio"
                    name="shipping"
                    checked={shippingMethod === 'standard'}
                    onChange={() => setShippingMethod('standard')}
                    className="accent-slate-900"
                  />
                  <span>Giao tiêu chuẩn (2-4 ngày)</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="shipping"
                    checked={shippingMethod === 'fast'}
                    onChange={() => setShippingMethod('fast')}
                    className="accent-slate-900"
                  />
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
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'COD'}
                    onChange={() => setPaymentMethod('COD')}
                    className="accent-slate-900"
                  />
                  <span>COD - Thanh toán khi nhận hàng</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'BankTransfer'}
                    onChange={() => setPaymentMethod('BankTransfer')}
                    className="accent-slate-900"
                  />
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
