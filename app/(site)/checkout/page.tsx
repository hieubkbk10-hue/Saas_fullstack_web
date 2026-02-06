'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useMutation, useQuery } from 'convex/react';
import { Check, CreditCard, MapPin, Package, Truck } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/convex/_generated/api';
import { useBrandColor } from '@/components/site/hooks';
import { useCheckoutConfig } from '@/lib/experiences';
import { useCustomerAuth } from '@/app/(site)/auth/context';
import type { Id } from '@/convex/_generated/dataModel';

const formatPrice = (value: number) => new Intl.NumberFormat('vi-VN', { currency: 'VND', style: 'currency' }).format(value);

type ShippingMethodConfig = {
  id: string;
  label: string;
  description?: string;
  fee: number;
  estimate?: string;
};

type PaymentMethodConfig = {
  id: string;
  label: string;
  description?: string;
  type: 'COD' | 'BankTransfer' | 'VietQR' | 'CreditCard' | 'EWallet';
};

type AddressOption = {
  code: string;
  name: string;
  parentCode?: string;
};

type TwoLevelProvince = {
  code: number;
  name: string;
  wards: TwoLevelWard[];
};

type TwoLevelWard = {
  code: number;
  name: string;
};

type VariantOptionValue = {
  optionId: Id<'productOptions'>;
  valueId: Id<'productOptionValues'>;
  customValue?: string;
};

const DEFAULT_SHIPPING_METHODS: ShippingMethodConfig[] = [
  { id: 'standard', label: 'Giao hàng tiêu chuẩn', description: '2-4 ngày', fee: 30000, estimate: '2-4 ngày' },
  { id: 'express', label: 'Giao hàng nhanh', description: 'Trong 24h', fee: 50000, estimate: 'Trong 24h' },
];

const DEFAULT_PAYMENT_METHODS: PaymentMethodConfig[] = [
  { id: 'cod', label: 'COD', description: 'Thanh toán khi nhận hàng', type: 'COD' },
  { id: 'bank', label: 'Chuyển khoản ngân hàng', description: 'Chuyển khoản trước khi giao', type: 'BankTransfer' },
  { id: 'vietqr', label: 'VietQR', description: 'Quét mã QR để thanh toán', type: 'VietQR' },
];

const parseJsonSetting = <T,>(value: unknown, fallback: T): T => {
  if (!value) {
    return fallback;
  }
  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  }
  if (typeof value === 'object') {
    return value as T;
  }
  return fallback;
};

const getStringSetting = (value: unknown, fallback: string) => {
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  return fallback;
};

const buildVariantLabel = (
  optionValues: VariantOptionValue[],
  optionMap: Map<Id<'productOptions'>, { name: string }>,
  valueMap: Map<Id<'productOptionValues'>, { label?: string; value?: string }>
): string | null => {
  const parts = optionValues
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

  return parts.length > 0 ? parts.join(' • ') : null;
};

export default function CheckoutPage() {
  const brandColor = useBrandColor();
  const searchParams = useSearchParams();
  const { customer, isAuthenticated, openLoginModal } = useCustomerAuth();
  const checkoutConfig = useCheckoutConfig();
  const ordersModule = useQuery(api.admin.modules.getModuleByKey, { key: 'orders' });
  const promotionsModule = useQuery(api.admin.modules.getModuleByKey, { key: 'promotions' });
  const ordersSettings = useQuery(api.admin.modules.listModuleSettings, { moduleKey: 'orders' });
  const paymentFeature = useQuery(api.admin.modules.getModuleFeature, { featureKey: 'enablePayment', moduleKey: 'orders' });
  const shippingFeature = useQuery(api.admin.modules.getModuleFeature, { featureKey: 'enableShipping', moduleKey: 'orders' });
  const createOrder = useMutation(api.orders.create);
  const incrementPromotionUsage = useMutation(api.promotions.incrementUsage);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [addressDetail, setAddressDetail] = useState('');
  const [provinceCode, setProvinceCode] = useState('');
  const [districtCode, setDistrictCode] = useState('');
  const [wardCode, setWardCode] = useState('');
  const [paymentMethodId, setPaymentMethodId] = useState('');
  const [shippingMethodId, setShippingMethodId] = useState('');
  const [couponInput, setCouponInput] = useState('');
  const [appliedCode, setAppliedCode] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [activeWizardStep, setActiveWizardStep] = useState(0);
  const [twoLevelData, setTwoLevelData] = useState<TwoLevelProvince[]>([]);
  const [provinceList, setProvinceList] = useState<AddressOption[]>([]);
  const [districtList, setDistrictList] = useState<AddressOption[]>([]);
  const [wardList, setWardList] = useState<AddressOption[]>([]);

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

  const settingsMap = useMemo(() => {
    const map: Record<string, unknown> = {};
    (ordersSettings ?? []).forEach((setting) => {
      map[setting.settingKey] = setting.value;
    });
    return map;
  }, [ordersSettings]);

  const rawAddressFormat = typeof settingsMap.addressFormat === 'string' ? settingsMap.addressFormat : 'text';
  const addressFormat = rawAddressFormat === '2-level' || rawAddressFormat === '3-level' ? rawAddressFormat : 'text';
  const shippingMethods = useMemo(() => {
    const parsed = parseJsonSetting<ShippingMethodConfig[]>(settingsMap.shippingMethods, DEFAULT_SHIPPING_METHODS);
    return Array.isArray(parsed) ? parsed : DEFAULT_SHIPPING_METHODS;
  }, [settingsMap.shippingMethods]);
  const paymentMethods = useMemo(() => {
    const parsed = parseJsonSetting<PaymentMethodConfig[]>(settingsMap.paymentMethods, DEFAULT_PAYMENT_METHODS);
    return Array.isArray(parsed) ? parsed : DEFAULT_PAYMENT_METHODS;
  }, [settingsMap.paymentMethods]);
  const bankInfo = useMemo(() => ({
    bankName: getStringSetting(settingsMap.bankName, 'Vietcombank'),
    bankCode: getStringSetting(settingsMap.bankCode, 'VCB'),
    accountName: getStringSetting(settingsMap.bankAccountName, 'CÔNG TY VIETADMIN'),
    accountNumber: getStringSetting(settingsMap.bankAccountNumber, '0123456789'),
    branch: getStringSetting(settingsMap.bankBranch, 'Chi nhánh Hà Nội'),
    vietQrTemplate: getStringSetting(settingsMap.vietQrTemplate, 'compact'),
  }), [settingsMap.bankAccountName, settingsMap.bankAccountNumber, settingsMap.bankBranch, settingsMap.bankCode, settingsMap.bankName, settingsMap.vietQrTemplate]);

  const isShippingEnabled = checkoutConfig.showShippingOptions && (shippingFeature?.enabled ?? true);
  const isPaymentEnabled = checkoutConfig.showPaymentMethods && (paymentFeature?.enabled ?? true);
  const isPromotionEnabled = promotionsModule?.enabled ?? true;

  useEffect(() => {
    if (!shippingMethods.find((method) => method.id === shippingMethodId)) {
      setShippingMethodId(shippingMethods[0]?.id ?? '');
    }
  }, [shippingMethods, shippingMethodId]);

  useEffect(() => {
    if (!paymentMethods.find((method) => method.id === paymentMethodId)) {
      setPaymentMethodId(paymentMethods[0]?.id ?? '');
    }
  }, [paymentMethods, paymentMethodId]);

  useEffect(() => {
    setProvinceCode('');
    setDistrictCode('');
    setWardCode('');
    setAddressDetail('');
  }, [addressFormat]);

  useEffect(() => {
    if (addressFormat === 'text') {
      return;
    }

    let cancelled = false;
    const loadAddressData = async () => {
      try {
        if (addressFormat === '2-level') {
          const response = await fetch('/data/address-2-level.json');
          const data = await response.json() as TwoLevelProvince[];
          if (cancelled) return;
          setTwoLevelData(data);
          setProvinceList(data.map((province) => ({ code: String(province.code), name: province.name })));
          setDistrictList([]);
          setWardList([]);
        } else {
          const [provincesRes, districtsRes, wardsRes] = await Promise.all([
            fetch('/data/address-provinces.json'),
            fetch('/data/address-districts.json'),
            fetch('/data/address-wards.json'),
          ]);

          const provinces = await provincesRes.json() as { id: string; name: string }[];
          const districtsRaw = await districtsRes.json() as Record<string, { code: string; name_with_type?: string; name: string; parent_code: string }>;
          const wardsRaw = await wardsRes.json() as Record<string, { code: string; name_with_type?: string; name: string; parent_code: string }>;

          if (cancelled) return;
          setProvinceList(provinces.map((province) => ({ code: province.id, name: province.name })));
          setDistrictList(Object.values(districtsRaw).map((district) => ({
            code: district.code,
            name: district.name_with_type ?? district.name,
            parentCode: district.parent_code,
          })));
          setWardList(Object.values(wardsRaw).map((ward) => ({
            code: ward.code,
            name: ward.name_with_type ?? ward.name,
            parentCode: ward.parent_code,
          })));
          setTwoLevelData([]);
        }
      } catch (error) {
        console.error(error);
        toast.error('Không thể tải dữ liệu địa chỉ.');
      }
    };

    void loadAddressData();
    return () => {
      cancelled = true;
    };
  }, [addressFormat]);

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
      return [] as Id<'productOptions'>[];
    }
    return Array.from(new Set(selectedVariant.optionValues.map((optionValue) => optionValue.optionId)));
  }, [selectedVariant]);

  const valueIds = useMemo(() => {
    if (!selectedVariant) {
      return [] as Id<'productOptionValues'>[];
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
    return buildVariantLabel(selectedVariant.optionValues, optionMap, valueMap);
  }, [selectedVariant, variantOptions, variantValues]);

  const cartVariantIds = useMemo(() => {
    if (!cartItems) {
      return [] as Id<'productVariants'>[];
    }
    const ids = cartItems.map((item) => item.variantId).filter((id): id is Id<'productVariants'> => Boolean(id));
    return Array.from(new Set(ids));
  }, [cartItems]);

  const cartVariants = useQuery(
    api.productVariants.listByIds,
    cartVariantIds.length > 0 ? { ids: cartVariantIds } : 'skip'
  );

  const cartOptionIds = useMemo(() => {
    if (!cartVariants) {
      return [] as Id<'productOptions'>[];
    }
    return Array.from(new Set(cartVariants.flatMap((variant) => variant.optionValues.map((optionValue) => optionValue.optionId))));
  }, [cartVariants]);

  const cartValueIds = useMemo(() => {
    if (!cartVariants) {
      return [] as Id<'productOptionValues'>[];
    }
    return Array.from(new Set(cartVariants.flatMap((variant) => variant.optionValues.map((optionValue) => optionValue.valueId))));
  }, [cartVariants]);

  const cartOptions = useQuery(
    api.productOptions.listByIds,
    cartOptionIds.length > 0 ? { ids: cartOptionIds } : 'skip'
  );

  const cartValues = useQuery(
    api.productOptionValues.listByIds,
    cartValueIds.length > 0 ? { ids: cartValueIds } : 'skip'
  );

  const cartVariantTitleMap = useMemo(() => {
    if (!cartVariants) {
      return new Map<Id<'productVariants'>, string>();
    }
    const optionMap = new Map(cartOptions?.map((option) => [option._id, option]) ?? []);
    const valueMap = new Map(cartValues?.map((value) => [value._id, value]) ?? []);
    return new Map(cartVariants.map((variant) => [
      variant._id,
      buildVariantLabel(variant.optionValues, optionMap, valueMap) ?? '',
    ]));
  }, [cartOptions, cartValues, cartVariants]);

  const basePrice = selectedVariant?.price ?? product?.price ?? 0;
  const salePrice = selectedVariant ? selectedVariant.salePrice : product?.salePrice;
  const unitPrice = salePrice ?? basePrice;
  const subtotal = unitPrice * quantity;
  const selectedShipping = shippingMethods.find((method) => method.id === shippingMethodId);
  const selectedPayment = paymentMethods.find((method) => method.id === paymentMethodId);
  const shippingFee = isShippingEnabled ? (selectedShipping?.fee ?? 0) : 0;

  const totalAmount = fromCart ? (cart?.totalAmount ?? 0) : subtotal;
  const promotionResult = useQuery(
    api.promotions.validateCode,
    appliedCode && isPromotionEnabled ? { code: appliedCode, orderAmount: totalAmount } : 'skip'
  );
  const isCartLoading = fromCart && (cart === undefined || (cart && cartItems === undefined));

  const appliedPromotion = promotionResult?.valid ? promotionResult : null;
  const discountAmount = appliedPromotion?.discountAmount ?? 0;
  const totalAfterDiscount = Math.max(0, totalAmount - discountAmount);
  const finalTotal = totalAfterDiscount + shippingFee;

  const orderItems = useMemo(() => {
    if (fromCart) {
      return (cartItems ?? []).map((item) => ({
        productId: item.productId,
        productName: item.productName,
        price: item.price,
        quantity: item.quantity,
        variantId: item.variantId,
        variantTitle: item.variantId ? cartVariantTitleMap.get(item.variantId) || undefined : undefined,
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
  }, [cartItems, cartVariantTitleMap, fromCart, product, quantity, unitPrice, variantId, variantTitle]);

  const summaryItems = useMemo(() => {
    if (fromCart) {
      return (cartItems ?? []).map((item) => ({
        id: item._id,
        name: item.productName,
        quantity: item.quantity,
        price: item.price,
        image: item.productImage ?? undefined,
        variantTitle: item.variantId ? cartVariantTitleMap.get(item.variantId) || undefined : undefined,
      }));
    }

    return product
      ? [{
          id: product._id,
          name: product.name,
          quantity,
          price: unitPrice,
          image: product.image ?? undefined,
          variantTitle: variantTitle ?? undefined,
        }]
      : [];
  }, [cartItems, cartVariantTitleMap, fromCart, product, quantity, unitPrice, variantTitle]);

  const selectedProvince = useMemo(() => {
    return provinceList.find((province) => province.code === provinceCode) ?? null;
  }, [provinceList, provinceCode]);
  const selectedTwoLevelProvince = useMemo(() => {
    if (addressFormat !== '2-level') {
      return null;
    }
    return twoLevelData.find((province) => String(province.code) === provinceCode) ?? null;
  }, [addressFormat, provinceCode, twoLevelData]);

  const availableDistricts = useMemo(() => {
    if (addressFormat !== '3-level') {
      return [] as AddressOption[];
    }
    return districtList.filter((district) => district.parentCode === provinceCode);
  }, [addressFormat, districtList, provinceCode]);

  const availableWards = useMemo<AddressOption[]>(() => {
    if (addressFormat === '2-level') {
      return selectedTwoLevelProvince?.wards.map((ward) => ({ code: String(ward.code), name: ward.name })) ?? [];
    }
    if (addressFormat === '3-level') {
      return wardList.filter((ward) => ward.parentCode === districtCode);
    }
    return [] as AddressOption[];
  }, [addressFormat, districtCode, selectedTwoLevelProvince, wardList]);

  const selectedDistrict = useMemo(() => {
    if (addressFormat !== '3-level') {
      return null;
    }
    return availableDistricts.find((district) => district.code === districtCode) ?? null;
  }, [addressFormat, availableDistricts, districtCode]);

  const selectedWard = useMemo(() => {
    return availableWards.find((ward) => ward.code === wardCode) ?? null;
  }, [availableWards, wardCode]);

  const selectedProvinceName = useMemo(() => {
    if (addressFormat === '2-level') {
      return selectedTwoLevelProvince?.name;
    }
    return selectedProvince?.name;
  }, [addressFormat, selectedProvince, selectedTwoLevelProvince]);

  const resolvedAddress = useMemo(() => {
    if (addressFormat === 'text') {
      return shippingAddress.trim();
    }
    const parts = [
      addressDetail.trim(),
      selectedWard?.name,
      selectedDistrict?.name,
      selectedProvinceName,
    ].filter((part): part is string => Boolean(part));

    return parts.join(', ');
  }, [addressDetail, addressFormat, selectedDistrict, selectedProvinceName, selectedWard, shippingAddress]);

  const isAddressValid = addressFormat === 'text'
    ? Boolean(shippingAddress.trim())
    : Boolean(addressDetail.trim() && selectedProvinceName && selectedWard && (addressFormat === '2-level' || selectedDistrict));

  const wizardStepCount = 1 + (isShippingEnabled ? 1 : 0) + (isPaymentEnabled ? 1 : 0);

  useEffect(() => {
    if (customer && !customerName) {
      setCustomerName(customer.name ?? '');
    }
    if (customer && !customerPhone) {
      setCustomerPhone(customer.phone ?? '');
    }
  }, [customer, customerName, customerPhone]);

  useEffect(() => {
    if (activeWizardStep >= wizardStepCount) {
      setActiveWizardStep(0);
    }
  }, [activeWizardStep, wizardStepCount]);

  const handleApplyCoupon = () => {
    const normalized = couponInput.trim().toUpperCase();
    if (!normalized) {
      toast.error('Vui lòng nhập mã khuyến mãi.');
      return;
    }
    setAppliedCode(normalized);
  };

  const handleRemoveCoupon = () => {
    setAppliedCode(null);
    setCouponInput('');
  };

  const handlePlaceOrder = async () => {
    if (!customer) {
      openLoginModal();
      return;
    }

    if (!customerName.trim() || !customerPhone.trim() || !isAddressValid) {
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
        paymentMethod: selectedPayment?.type ?? 'COD',
        promotionId: appliedPromotion?.promotion?._id,
        promotionCode: appliedPromotion?.promotion?.code,
        discountAmount,
        shippingAddress: `${customerName} | ${customerPhone} | ${resolvedAddress}`,
        shippingFee,
      });
      if (appliedPromotion?.promotion?._id) {
        await incrementPromotionUsage({ id: appliedPromotion.promotion._id });
      }
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

  const StepIndicator = (
    <div className="flex items-center justify-between mb-6">
      {[
        { label: 'Thông tin', icon: MapPin },
        { label: 'Vận chuyển', icon: Truck },
        { label: 'Thanh toán', icon: CreditCard },
      ].filter((step) => (step.label !== 'Vận chuyển' || isShippingEnabled) && (step.label !== 'Thanh toán' || isPaymentEnabled))
        .map((step, index, arr) => (
          <React.Fragment key={step.label}>
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${index === 0 ? 'text-white' : 'bg-slate-100 text-slate-400'}`}
                style={index === 0 ? { backgroundColor: brandColor } : undefined}
              >
                {index === 0 ? <Check size={18} /> : <step.icon size={18} />}
              </div>
              <span className={`text-xs mt-1 ${index === 0 ? 'font-medium' : 'text-slate-400'}`} style={index === 0 ? { color: brandColor } : undefined}>
                {step.label}
              </span>
            </div>
            {index < arr.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 ${index === 0 ? '' : 'bg-slate-200'}`} style={index === 0 ? { backgroundColor: brandColor } : undefined} />
            )}
          </React.Fragment>
        ))}
    </div>
  );

  const ShippingInfoCard = () => (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
      <div className="flex items-center gap-2">
        <MapPin className="w-5 h-5" style={{ color: brandColor }} />
        <h2 className="text-lg font-semibold text-slate-900">Thông tin giao hàng</h2>
      </div>
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
        {addressFormat === 'text' ? (
          <input
            type="text"
            placeholder="Địa chỉ giao hàng"
            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm"
            value={shippingAddress}
            onChange={(event) => setShippingAddress(event.target.value)}
          />
        ) : (
          <div className="grid gap-3">
            <div className={`grid gap-3 ${addressFormat === '3-level' ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
              <select
                value={provinceCode}
                onChange={(event) => {
                  setProvinceCode(event.target.value);
                  setDistrictCode('');
                  setWardCode('');
                }}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white"
              >
                <option value="">Chọn Tỉnh/Thành</option>
                {provinceList.map((province) => (
                  <option key={province.code} value={province.code}>{province.name}</option>
                ))}
              </select>
              {addressFormat === '3-level' && (
                <select
                  value={districtCode}
                  onChange={(event) => {
                    setDistrictCode(event.target.value);
                    setWardCode('');
                  }}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white"
                  disabled={!provinceCode}
                >
                  <option value="">Chọn Quận/Huyện</option>
                  {availableDistricts.map((district) => (
                    <option key={district.code} value={district.code}>{district.name}</option>
                  ))}
                </select>
              )}
              <select
                value={wardCode}
                onChange={(event) => setWardCode(event.target.value)}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white"
                disabled={addressFormat === '3-level' ? !districtCode : !provinceCode}
              >
                <option value="">Chọn Phường/Xã</option>
                {availableWards.map((ward) => (
                  <option key={ward.code} value={ward.code}>{ward.name}</option>
                ))}
              </select>
            </div>
            <input
              type="text"
              placeholder="Số nhà, tên đường"
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm"
              value={addressDetail}
              onChange={(event) => setAddressDetail(event.target.value)}
            />
          </div>
        )}
      </div>
    </div>
  );

  const ShippingOptionsCard = () => {
    if (!isShippingEnabled) {
      return null;
    }
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Truck className="w-5 h-5 text-slate-400" />
          <h2 className="text-lg font-semibold text-slate-900">Vận chuyển</h2>
        </div>
        <div className="space-y-2 text-sm text-slate-600">
          {shippingMethods.map((method) => (
            <label key={method.id} className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer ${shippingMethodId === method.id ? '' : 'hover:bg-slate-50'}`} style={shippingMethodId === method.id ? { borderColor: brandColor, backgroundColor: `${brandColor}08` } : undefined}>
              <input
                type="radio"
                name="shipping"
                checked={shippingMethodId === method.id}
                onChange={() => setShippingMethodId(method.id)}
                className="w-4 h-4"
                style={{ accentColor: brandColor }}
              />
              <div className="flex-1">
                <div className="font-medium text-sm text-slate-900">{method.label}</div>
                {method.description && <div className="text-xs text-slate-500">{method.description}</div>}
                {method.estimate && <div className="text-xs text-slate-400">{method.estimate}</div>}
              </div>
              <span className="font-semibold text-sm text-slate-900">{formatPrice(method.fee)}</span>
            </label>
          ))}
        </div>
      </div>
    );
  };

  const PaymentMethodsCard = () => {
    if (!isPaymentEnabled) {
      return null;
    }
    const vietQrInfo = encodeURIComponent(`DH ${orderId ?? 'PENDING'}`);
    const vietQrAccountName = encodeURIComponent(bankInfo.accountName);
    const vietQrUrl = `https://img.vietqr.io/image/${bankInfo.bankCode}-${bankInfo.accountNumber}-${bankInfo.vietQrTemplate}.jpg?amount=${finalTotal}&addInfo=${vietQrInfo}&accountName=${vietQrAccountName}`;
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
        <div className="flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-slate-400" />
          <h2 className="text-lg font-semibold text-slate-900">Thanh toán</h2>
        </div>
        <div className="space-y-2 text-sm text-slate-600">
          {paymentMethods.map((method) => (
            <label key={method.id} className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer ${paymentMethodId === method.id ? '' : 'hover:bg-slate-50'}`} style={paymentMethodId === method.id ? { borderColor: brandColor, backgroundColor: `${brandColor}08` } : undefined}>
              <input
                type="radio"
                name="payment"
                checked={paymentMethodId === method.id}
                onChange={() => setPaymentMethodId(method.id)}
                className="w-4 h-4"
                style={{ accentColor: brandColor }}
              />
              <div className="flex-1">
                <div className="font-medium text-sm text-slate-900">{method.label}</div>
                {method.description && <div className="text-xs text-slate-500">{method.description}</div>}
              </div>
            </label>
          ))}
        </div>
        {(selectedPayment?.type === 'BankTransfer' || selectedPayment?.type === 'VietQR') && (
          <div className="border border-slate-200 rounded-lg p-3 text-sm text-slate-600 bg-slate-50">
            <div className="font-medium text-slate-900 mb-1">Thông tin chuyển khoản</div>
            <div>Ngân hàng: {bankInfo.bankName} ({bankInfo.bankCode})</div>
            <div>Số tài khoản: {bankInfo.accountNumber}</div>
            <div>Chủ tài khoản: {bankInfo.accountName}</div>
            <div>Chi nhánh: {bankInfo.branch}</div>
            {selectedPayment.type === 'VietQR' && (
              <div className="mt-3 flex flex-col items-center gap-2">
                <Image
                  src={vietQrUrl}
                  alt="VietQR"
                  width={192}
                  height={192}
                  className="w-48 h-48 rounded-lg border border-slate-200 bg-white"
                  loading="lazy"
                  unoptimized
                />
                <div className="text-xs text-slate-500">Quét mã để thanh toán {formatPrice(finalTotal)}</div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const SummaryCard = (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-4">
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-500">Sản phẩm</span>
        <span className="font-medium">{fromCart ? cart?.itemsCount ?? 0 : quantity}x</span>
      </div>
      <div className="space-y-3">
        {summaryItems.map((item) => (
          <div key={item.id} className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-lg bg-slate-100 overflow-hidden flex items-center justify-center">
              {item.image ? (
                <Image src={item.image} alt={item.name} width={56} height={56} className="object-cover w-full h-full" unoptimized />
              ) : (
                <Package size={20} className="text-slate-400" />
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-900">{item.name}</p>
              {item.variantTitle && <p className="text-xs text-slate-500">{item.variantTitle}</p>}
              <p className="text-xs text-slate-500">Số lượng: {item.quantity}</p>
            </div>
            <div className="text-right text-sm font-semibold text-slate-900">
              {formatPrice(item.price * item.quantity)}
            </div>
          </div>
        ))}
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Tạm tính</span>
          <span className="font-semibold text-slate-900">{formatPrice(totalAmount)}</span>
        </div>
        {discountAmount > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Giảm giá</span>
            <span className="font-semibold text-emerald-600">-{formatPrice(discountAmount)}</span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Phí vận chuyển</span>
          <span className="font-semibold text-slate-900">{formatPrice(shippingFee)}</span>
        </div>
      </div>
      <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
        <span className="text-sm text-slate-500">Tổng cộng</span>
        <span className="text-lg font-bold text-slate-900">{formatPrice(finalTotal)}</span>
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

  const CouponCard = isPromotionEnabled ? (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Mã khuyến mãi</h3>
          <p className="text-xs text-slate-500">Nhập mã để áp dụng giảm giá.</p>
        </div>
        {appliedCode && (
          <button type="button" className="text-xs text-slate-500 hover:text-slate-700" onClick={handleRemoveCoupon}>
            Bỏ áp dụng
          </button>
        )}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="VD: TET2026"
          className="flex-1 px-3 py-2.5 border border-slate-200 rounded-lg text-sm"
          value={couponInput}
          onChange={(event) => setCouponInput(event.target.value)}
        />
        <button
          type="button"
          className="px-4 py-2.5 rounded-lg text-sm font-medium text-white"
          style={{ backgroundColor: brandColor }}
          onClick={handleApplyCoupon}
        >
          Áp dụng
        </button>
      </div>
      {promotionResult && appliedCode && (
        <div className={`text-xs ${promotionResult.valid ? 'text-emerald-600' : 'text-rose-500'}`}>
          {promotionResult.message}
        </div>
      )}
    </div>
  ) : null;

  const wizardSteps = [
    { key: 'info', label: 'Thông tin khách hàng', content: <ShippingInfoCard /> },
    ...(isShippingEnabled ? [{ key: 'shipping', label: 'Vận chuyển', content: <ShippingOptionsCard /> }] : []),
    ...(isPaymentEnabled ? [{ key: 'payment', label: 'Thanh toán', content: <PaymentMethodsCard /> }] : []),
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Thanh toán</h1>
        <p className="text-slate-500 mt-2">Hoàn tất đơn hàng của bạn trong vài bước.</p>
      </div>

      <div className={`grid gap-6 ${checkoutConfig.orderSummaryPosition === 'right' ? 'lg:grid-cols-3' : 'grid-cols-1'}`}>
        <div className={checkoutConfig.orderSummaryPosition === 'right' ? 'lg:col-span-2 space-y-6' : 'space-y-6'}>
          {checkoutConfig.flowStyle === 'multi-step' && StepIndicator}
          {checkoutConfig.flowStyle === 'wizard-accordion' ? (
            <div className="space-y-3">
              {wizardSteps.map((step, index) => (
                <div key={step.key} className="rounded-2xl border border-slate-200 bg-white">
                  <button
                    type="button"
                    className="w-full flex items-center justify-between px-4 py-3"
                    onClick={() => setActiveWizardStep(index)}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${index === activeWizardStep ? 'text-white' : 'bg-slate-100 text-slate-400'}`}
                        style={index === activeWizardStep ? { backgroundColor: brandColor } : undefined}
                      >
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 text-sm">{step.label}</div>
                        <div className="text-xs text-slate-500">Nhập thông tin</div>
                      </div>
                    </div>
                  </button>
                  {index === activeWizardStep && <div className="px-4 pb-4">{step.content}</div>}
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              <ShippingInfoCard />
              <ShippingOptionsCard />
              <PaymentMethodsCard />
            </div>
          )}

          {CouponCard}
        </div>

        {checkoutConfig.orderSummaryPosition === 'right' ? (
          <div className="space-y-4">
            {SummaryCard}
          </div>
        ) : (
          <div className="mt-2 space-y-4">
            {SummaryCard}
          </div>
        )}
      </div>
    </div>
  );
}
