'use client';

import React from 'react';
import { Button, Input } from '@/app/admin/components/ui';

export interface ShippingMethodConfig {
  id: string;
  label: string;
  description?: string;
  fee: number;
  estimate?: string;
}

interface ShippingMethodsEditorProps {
  methods: ShippingMethodConfig[];
  onChange: (methods: ShippingMethodConfig[]) => void;
}

export function ShippingMethodsEditor({ methods, onChange }: ShippingMethodsEditorProps) {
  const handleAdd = () => {
    onChange([
      ...methods,
      { id: `shipping-${Date.now()}`, label: '', description: '', fee: 0, estimate: '' },
    ]);
  };

  const handleRemove = (index: number) => {
    onChange(methods.filter((_, idx) => idx !== index));
  };

  const handleUpdate = (index: number, patch: Partial<ShippingMethodConfig>) => {
    onChange(methods.map((item, idx) => (idx === index ? { ...item, ...patch } : item)));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-700">Phương thức vận chuyển</p>
        <Button type="button" variant="outline" size="sm" onClick={handleAdd}>
          + Thêm
        </Button>
      </div>
      <div className="space-y-3">
        {methods.length === 0 && (
          <div className="rounded-lg border border-dashed border-slate-200 p-4 text-xs text-slate-500">
            Chưa có phương thức vận chuyển. Hãy thêm mới.
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
              <Input
                type="number"
                placeholder="Phí vận chuyển"
                value={Number.isFinite(method.fee) ? method.fee : 0}
                onChange={(event) => handleUpdate(index, { fee: Number(event.target.value || 0) })}
              />
              <Input
                placeholder="Thời gian dự kiến"
                value={method.estimate ?? ''}
                onChange={(event) => handleUpdate(index, { estimate: event.target.value })}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
