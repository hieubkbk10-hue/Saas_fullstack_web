'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Input, Label } from '../../../components/ui';
import { ImageFieldWithUpload } from '../../../components/ImageFieldWithUpload';
import { ComponentFormWrapper, useComponentForm, useBrandColor } from '../shared';
import { CountdownPreview, CountdownStyle } from '../../previews';

const DEFAULT_END_DATE = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16);

export default function CountdownCreatePage() {
  const { title, setTitle, active, setActive, handleSubmit, isSubmitting } = useComponentForm('Khuyến mãi đặc biệt', 'Countdown');
  const brandColor = useBrandColor();
  
  const [countdownStyle, setCountdownStyle] = useState<CountdownStyle>('banner');
  const [countdownConfig, setCountdownConfig] = useState({
    heading: 'Flash Sale - Giảm giá sốc!',
    subHeading: 'Ưu đãi có hạn',
    description: 'Nhanh tay đặt hàng trước khi hết thời gian khuyến mãi',
    endDate: DEFAULT_END_DATE,
    buttonText: 'Mua ngay',
    buttonLink: '/products',
    backgroundImage: '',
    discountText: '-50%',
    showDays: true,
    showHours: true,
    showMinutes: true,
    showSeconds: true,
  });

  const onSubmit = (e: React.FormEvent) => {
    void handleSubmit(e, { 
      ...countdownConfig,
      style: countdownStyle 
    });
  };

  return (
    <ComponentFormWrapper
      type="Countdown"
      title={title}
      setTitle={setTitle}
      active={active}
      setActive={setActive}
      onSubmit={onSubmit}
      isSubmitting={isSubmitting}
    >
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Nội dung khuyến mãi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tiêu đề chính</Label>
              <Input 
                value={countdownConfig.heading} 
                onChange={(e) => setCountdownConfig({...countdownConfig, heading: e.target.value})} 
                placeholder="Flash Sale - Giảm giá sốc!" 
              />
            </div>
            <div className="space-y-2">
              <Label>Tiêu đề phụ</Label>
              <Input 
                value={countdownConfig.subHeading} 
                onChange={(e) => setCountdownConfig({...countdownConfig, subHeading: e.target.value})} 
                placeholder="Ưu đãi có hạn" 
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Mô tả</Label>
            <textarea 
              value={countdownConfig.description} 
              onChange={(e) => setCountdownConfig({...countdownConfig, description: e.target.value})} 
              placeholder="Nhanh tay đặt hàng trước khi hết thời gian khuyến mãi"
              className="w-full min-h-[60px] rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm" 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Thời gian kết thúc <span className="text-red-500">*</span></Label>
              <Input 
                type="datetime-local"
                value={countdownConfig.endDate} 
                onChange={(e) => setCountdownConfig({...countdownConfig, endDate: e.target.value})} 
              />
            </div>
            <div className="space-y-2">
              <Label>Text giảm giá (VD: -50%)</Label>
              <Input 
                value={countdownConfig.discountText} 
                onChange={(e) => setCountdownConfig({...countdownConfig, discountText: e.target.value})} 
                placeholder="-50%" 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Text nút bấm</Label>
              <Input 
                value={countdownConfig.buttonText} 
                onChange={(e) => setCountdownConfig({...countdownConfig, buttonText: e.target.value})} 
                placeholder="Mua ngay" 
              />
            </div>
            <div className="space-y-2">
              <Label>Liên kết</Label>
              <Input 
                value={countdownConfig.buttonLink} 
                onChange={(e) => setCountdownConfig({...countdownConfig, buttonLink: e.target.value})} 
                placeholder="/products" 
              />
            </div>
          </div>

          <ImageFieldWithUpload
            label="Ảnh nền (tùy chọn)"
            value={countdownConfig.backgroundImage}
            onChange={(url) => setCountdownConfig({...countdownConfig, backgroundImage: url})}
            folder="countdown"
            aspectRatio="banner"
            quality={0.85}
            placeholder="https://example.com/banner.jpg"
          />

          <div className="space-y-2">
            <Label>Hiển thị đơn vị thời gian</Label>
            <div className="flex flex-wrap gap-4 mt-2">
              <label className="flex items-center gap-2 text-sm">
                <input 
                  type="checkbox" 
                  checked={countdownConfig.showDays} 
                  onChange={(e) => setCountdownConfig({...countdownConfig, showDays: e.target.checked})} 
                  className="w-4 h-4 rounded" 
                />
                Ngày
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input 
                  type="checkbox" 
                  checked={countdownConfig.showHours} 
                  onChange={(e) => setCountdownConfig({...countdownConfig, showHours: e.target.checked})} 
                  className="w-4 h-4 rounded" 
                />
                Giờ
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input 
                  type="checkbox" 
                  checked={countdownConfig.showMinutes} 
                  onChange={(e) => setCountdownConfig({...countdownConfig, showMinutes: e.target.checked})} 
                  className="w-4 h-4 rounded" 
                />
                Phút
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input 
                  type="checkbox" 
                  checked={countdownConfig.showSeconds} 
                  onChange={(e) => setCountdownConfig({...countdownConfig, showSeconds: e.target.checked})} 
                  className="w-4 h-4 rounded" 
                />
                Giây
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      <CountdownPreview 
        config={countdownConfig}
        brandColor={brandColor}
        selectedStyle={countdownStyle}
        onStyleChange={setCountdownStyle}
      />
    </ComponentFormWrapper>
  );
}
