'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import type { Doc, Id } from '@/convex/_generated/dataModel';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from '../../../../components/ui';
import { ImageUpload } from '../../../../components/ImageUpload';

type VariantSettings = {
  variantImages: string;
  variantPricing: string;
  variantStock: string;
};

export type VariantFormPayload = {
  allowBackorder?: boolean;
  barcode?: string;
  image?: string;
  optionValues: { optionId: Id<'productOptions'>; valueId: Id<'productOptionValues'>; customValue?: string }[];
  price?: number;
  salePrice?: number;
  sku: string;
  status: 'Active' | 'Inactive';
  stock?: number;
};

type VariantFormProps = {
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: (payload: VariantFormPayload) => Promise<void>;
  options: Doc<'productOptions'>[];
  optionValues: Doc<'productOptionValues'>[];
  product: Doc<'products'>;
  settings: VariantSettings;
  submitLabel: string;
  variant?: Doc<'productVariants'> | null;
};

export function VariantForm({
  isSubmitting,
  onCancel,
  onSubmit,
  options,
  optionValues,
  product,
  settings,
  submitLabel,
  variant,
}: VariantFormProps) {
  const [sku, setSku] = useState('');
  const [barcode, setBarcode] = useState('');
  const [price, setPrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [stock, setStock] = useState('');
  const [allowBackorder, setAllowBackorder] = useState(false);
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');
  const [image, setImage] = useState<string | undefined>();
  const [optionSelections, setOptionSelections] = useState<Record<string, { valueId?: Id<'productOptionValues'>; customValue?: string }>>({});
  const [isLoaded, setIsLoaded] = useState(false);

  const optionValuesByOption = useMemo(() => {
    const map = new Map<string, Doc<'productOptionValues'>[]>();
    optionValues.forEach((value) => {
      if (!value.active) {return;}
      const list = map.get(value.optionId) ?? [];
      list.push(value);
      map.set(value.optionId, list);
    });
    return map;
  }, [optionValues]);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    if (variant && !isLoaded) {
      setSku(variant.sku);
      setBarcode(variant.barcode ?? '');
      setPrice(variant.price?.toString() ?? '');
      setSalePrice(variant.salePrice?.toString() ?? '');
      setStock(variant.stock?.toString() ?? '');
      setAllowBackorder(variant.allowBackorder ?? false);
      setStatus(variant.status);
      setImage(variant.image);
      const selectionMap: Record<string, { valueId?: Id<'productOptionValues'>; customValue?: string }> = {};
      variant.optionValues.forEach((item) => {
        selectionMap[item.optionId] = { valueId: item.valueId, customValue: item.customValue };
      });
      setOptionSelections(selectionMap);
      setIsLoaded(true);
    }
    if (!variant && !isLoaded) {
      setIsLoaded(true);
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [variant, isLoaded]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!sku.trim()) {
      toast.error('Vui lòng nhập SKU');
      return;
    }

    const missingOption = options.find((option) => !optionSelections[option._id]?.valueId);
    if (missingOption) {
      toast.error(`Vui lòng chọn giá trị cho ${missingOption.name}`);
      return;
    }

    const optionValuesPayload = options.map((option) => {
      const selection = optionSelections[option._id];
      return {
        optionId: option._id,
        valueId: selection?.valueId as Id<'productOptionValues'>,
        customValue: selection?.customValue?.trim() || undefined,
      };
    });

    await onSubmit({
      allowBackorder: settings.variantStock === 'variant' ? allowBackorder : undefined,
      barcode: barcode.trim() || undefined,
      image: settings.variantImages === 'inherit' ? undefined : image,
      optionValues: optionValuesPayload,
      price: settings.variantPricing === 'variant' ? (price.trim() === '' ? undefined : Number.parseInt(price)) : undefined,
      salePrice: settings.variantPricing === 'variant' ? (salePrice.trim() === '' ? undefined : Number.parseInt(salePrice)) : undefined,
      sku: sku.trim(),
      status,
      stock: settings.variantStock === 'variant' ? (stock.trim() === '' ? undefined : Number.parseInt(stock)) : undefined,
    });
  };

  const formatPrice = (value: number) => new Intl.NumberFormat('vi-VN', { currency: 'VND', style: 'currency' }).format(value);

  const showVariantPricing = settings.variantPricing === 'variant';
  const showVariantStock = settings.variantStock === 'variant';
  const showVariantImages = settings.variantImages !== 'inherit';

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Thông tin phiên bản</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>SKU <span className="text-red-500">*</span></Label>
                  <Input value={sku} onChange={(e) =>{  setSku(e.target.value); }} placeholder="VD: PROD-RED-M" className="font-mono" required />
                </div>
                <div className="space-y-2">
                  <Label>Barcode</Label>
                  <Input value={barcode} onChange={(e) =>{  setBarcode(e.target.value); }} placeholder="Barcode (nếu có)" className="font-mono" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Tùy chọn phiên bản</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {options.map(option => {
                const values = optionValuesByOption.get(option._id) ?? [];
                const selection = optionSelections[option._id];
                const needsCustomValue = ['text_input', 'number_input', 'color_picker'].includes(option.displayType);
                const customInputType = option.displayType === 'number_input'
                  ? 'number'
                  : option.displayType === 'color_picker'
                    ? 'color'
                    : 'text';

                return (
                  <div key={option._id} className="space-y-2">
                    <Label>{option.name} <span className="text-red-500">*</span></Label>
                    <div className={needsCustomValue ? 'grid grid-cols-1 md:grid-cols-2 gap-3' : ''}>
                      <select
                        value={selection?.valueId ?? ''}
                        onChange={(e) =>{
                          const valueId = e.target.value as Id<'productOptionValues'>;
                          setOptionSelections(prev => ({
                            ...prev,
                            [option._id]: { ...prev[option._id], valueId },
                          }));
                        }}
                        className="w-full h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                      >
                        <option value="">-- Chọn giá trị --</option>
                        {values.map(value => (
                          <option key={value._id} value={value._id}>{value.label ?? value.value}</option>
                        ))}
                      </select>
                      {needsCustomValue && (
                        <Input
                          type={customInputType}
                          value={selection?.customValue ?? (option.displayType === 'color_picker' ? '#000000' : '')}
                          onChange={(e) =>{
                            const customValue = e.target.value;
                            setOptionSelections(prev => ({
                              ...prev,
                              [option._id]: { ...prev[option._id], customValue },
                            }));
                          }}
                          placeholder={option.displayType === 'color_picker' ? '' : 'Nhập giá trị custom'}
                        />
                      )}
                    </div>
                    {values.length === 0 && (
                      <p className="text-xs text-slate-500">Option này chưa có giá trị hoạt động.</p>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Giá & Kho hàng</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {showVariantPricing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Giá bán (VNĐ)</Label>
                    <Input type="number" value={price} onChange={(e) =>{  setPrice(e.target.value); }} placeholder="0" min="0" />
                  </div>
                  <div className="space-y-2">
                    <Label>Giá khuyến mãi (VNĐ)</Label>
                    <Input type="number" value={salePrice} onChange={(e) =>{  setSalePrice(e.target.value); }} placeholder="Để trống nếu không KM" min="0" />
                  </div>
                </div>
              ) : (
                <div className="text-sm text-slate-500">Giá lấy từ sản phẩm: <span className="font-medium text-slate-700">{formatPrice(product.salePrice ?? product.price)}</span></div>
              )}

              {showVariantStock ? (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label>Số lượng tồn kho</Label>
                    <Input type="number" value={stock} onChange={(e) =>{  setStock(e.target.value); }} placeholder="0" min="0" />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="allow-backorder"
                      checked={allowBackorder}
                      onChange={(e) =>{  setAllowBackorder(e.target.checked); }}
                      className="w-4 h-4 rounded border-slate-300"
                    />
                    <Label htmlFor="allow-backorder" className="cursor-pointer">Cho phép đặt hàng khi hết</Label>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-slate-500">Tồn kho lấy từ sản phẩm: <span className="font-medium text-slate-700">{product.stock}</span></div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Trạng thái</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Trạng thái</Label>
                <select
                  value={status}
                  onChange={(e) =>{  setStatus(e.target.value as 'Active' | 'Inactive'); }}
                  className="w-full h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                >
                  <option value="Active">Đang bán</option>
                  <option value="Inactive">Ẩn</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {showVariantImages && (
            <Card>
              <CardHeader><CardTitle className="text-base">Ảnh phiên bản</CardTitle></CardHeader>
              <CardContent>
                <ImageUpload value={image} onChange={setImage} folder="product-variants" />
                {settings.variantImages === 'both' && (
                  <p className="text-xs text-slate-500 mt-2">Nếu không chọn ảnh, sẽ dùng ảnh sản phẩm.</p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 lg:left-[280px] right-0 p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center z-10">
        <Button type="button" variant="ghost" onClick={onCancel}>Hủy bỏ</Button>
        <div className="flex gap-2">
          <Button type="submit" variant="accent" disabled={isSubmitting}>
            {isSubmitting && <Loader2 size={16} className="animate-spin mr-2" />}
            {submitLabel}
          </Button>
        </div>
      </div>
    </form>
  );
}
