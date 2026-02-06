'use client';

import React from 'react';
import { Button, Input } from '@/app/admin/components/ui';

export type PaymentMethodType = 'COD' | 'BankTransfer' | 'VietQR' | 'CreditCard' | 'EWallet';

export interface PaymentMethodConfig {
  id: string;
  label: string;
  description?: string;
  type: PaymentMethodType;
}

interface PaymentMethodsEditorProps {
  methods: PaymentMethodConfig[];
  onChange: (methods: PaymentMethodConfig[]) => void;
}

const PAYMENT_TYPES: { value: PaymentMethodType; label: string }[] = [
  { value: 'COD', label: 'COD' },
  { value: 'BankTransfer', label: 'Chuyển khoản' },
  { value: 'VietQR', label: 'VietQR' },
  { value: 'CreditCard', label: 'Thẻ tín dụng' },
  { value: 'EWallet', label: 'Ví điện tử' },
];

export function PaymentMethodsEditor({ methods, onChange }: PaymentMethodsEditorProps) {
  const handleAdd = () => {
    onChange([
      ...methods,
      { id: `payment-${Date.now()}`, label: '', description: '', type: 'COD' },
    ]);
  };

  const handleRemove = (index: number) => {
    onChange(methods.filter((_, idx) => idx !== index));
  };

  const handleUpdate = (index: number, patch: Partial<PaymentMethodConfig>) => {
    onChange(methods.map((item, idx) => (idx === index ? { ...item, ...patch } : item)));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-700">Phương thức thanh toán</p>
        <Button type="button" variant="outline" size="sm" onClick={handleAdd}>
          + Thêm
        </Button>
      </div>
      <div className="space-y-3">
        {methods.length === 0 && (
          <div className="rounded-lg border border-dashed border-slate-200 p-4 text-xs text-slate-500">
            Chưa có phương thức thanh toán. Hãy thêm mới.
          </div>
        )}
        {methods.map((method, index) => (
          <div key={`${method.id}-${index}`} className="rounded-lg border border-slate-200 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-700">Phương thức #{index + 1}</p>
              <Button type="button" variant="ghost" size="sm" onClick={() => handleRemove(index)}>
                Xóa
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input
                placeholder="Mã phương thức (id)"
                value={method.id}
                onChange={(event) => handleUpdate(index, { id: event.target.value })}
              />
              <Input
                placeholder="Tên hiển thị"
                value={method.label}
                onChange={(event) => handleUpdate(index, { label: event.target.value })}
              />
              <Input
                placeholder="Mô tả"
                value={method.description ?? ''}
                onChange={(event) => handleUpdate(index, { description: event.target.value })}
              />
              <select
                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700"
                value={method.type}
                onChange={(event) => handleUpdate(index, { type: event.target.value as PaymentMethodType })}
              >
                {PAYMENT_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
