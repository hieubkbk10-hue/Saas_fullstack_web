'use client';

import React from 'react';
import { Input, Label } from '@/app/admin/components/ui';
import type { BusinessInfo } from '../types';

type BusinessInfoStepProps = {
  value: BusinessInfo;
  onChange: (value: BusinessInfo) => void;
};

export function BusinessInfoStep({ value, onChange }: BusinessInfoStepProps) {
  const updateField = (field: keyof BusinessInfo, fieldValue: string) => {
    onChange({ ...value, [field]: fieldValue });
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
          Điền thông tin website
        </h3>
        <p className="text-xs text-slate-500">Dùng để seed settings, SEO, trang liên hệ.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Tên website</Label>
          <Input
            value={value.siteName}
            onChange={(event) => updateField('siteName', event.target.value)}
            placeholder="VietAdmin"
          />
        </div>
        <div className="space-y-2">
          <Label>Slogan</Label>
          <Input
            value={value.tagline}
            onChange={(event) => updateField('tagline', event.target.value)}
            placeholder="Hệ thống quản trị website"
          />
        </div>
        <div className="space-y-2">
          <Label>Email liên hệ</Label>
          <Input
            value={value.email}
            onChange={(event) => updateField('email', event.target.value)}
            placeholder="contact@example.com"
          />
        </div>
        <div className="space-y-2">
          <Label>Số điện thoại</Label>
          <Input
            value={value.phone}
            onChange={(event) => updateField('phone', event.target.value)}
            placeholder="0901234567"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Địa chỉ</Label>
        <Input
          value={value.address}
          onChange={(event) => updateField('address', event.target.value)}
          placeholder="123 Nguyễn Huệ, Q.1, TP.HCM"
        />
      </div>
    </div>
  );
}
