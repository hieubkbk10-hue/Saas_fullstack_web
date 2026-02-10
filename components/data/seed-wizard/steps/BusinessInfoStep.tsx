'use client';

import React from 'react';
import { Input, Label } from '@/app/admin/components/ui';
import type { BusinessInfo } from '../types';

const BUSINESS_TYPE_OPTIONS = [
  'LocalBusiness',
  'Store',
  'Restaurant',
  'CafeOrCoffeeShop',
  'Hotel',
  'MedicalClinic',
  'RealEstateAgent',
  'ProfessionalService',
];

const SELECT_CLASS =
  'flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100';

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
        <div className="space-y-2">
          <Label>Màu thương hiệu</Label>
          <Input
            type="color"
            value={value.brandColor}
            onChange={(event) => updateField('brandColor', event.target.value)}
          />
          <p className="text-xs text-slate-500">Áp dụng cho nút bấm và màu nhấn.</p>
        </div>
        <div className="space-y-2">
          <Label>Loại hình doanh nghiệp</Label>
          <select
            className={SELECT_CLASS}
            value={value.businessType}
            onChange={(event) => updateField('businessType', event.target.value)}
          >
            {BUSINESS_TYPE_OPTIONS.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          <p className="text-xs text-slate-500">Giúp Google hiểu loại hình kinh doanh.</p>
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

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Facebook URL</Label>
          <Input
            value={value.socialFacebook}
            onChange={(event) => updateField('socialFacebook', event.target.value)}
            placeholder="https://facebook.com/yourpage"
          />
        </div>
        <div className="space-y-2">
          <Label>Giờ mở cửa</Label>
          <Input
            value={value.openingHours}
            onChange={(event) => updateField('openingHours', event.target.value)}
            placeholder="Mo-Su 08:00-22:00"
          />
          <p className="text-xs text-slate-500">Format gợi ý: Mo-Su 08:00-22:00</p>
        </div>
      </div>
    </div>
  );
}
