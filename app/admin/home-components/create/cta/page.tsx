'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Input, Label } from '../../../components/ui';
import { ComponentFormWrapper, useComponentForm, useBrandColor } from '../shared';
import { CTAPreview, type CTAStyle } from '../../previews';

export default function CTACreatePage() {
  const { title, setTitle, active, setActive, handleSubmit, isSubmitting } = useComponentForm('Kêu gọi hành động (CTA)', 'CTA');
  const brandColor = useBrandColor();
  
  const [ctaConfig, setCtaConfig] = useState({
    title: 'Sẵn sàng bắt đầu?',
    description: 'Đăng ký ngay hôm nay để nhận ưu đãi đặc biệt',
    buttonText: 'Đăng ký ngay',
    buttonLink: '/register',
    secondaryButtonText: 'Tìm hiểu thêm',
    secondaryButtonLink: '/about',
    badge: ''
  });
  const [style, setStyle] = useState<CTAStyle>('banner');

  const onSubmit = (e: React.FormEvent) => {
    handleSubmit(e, { ...ctaConfig, style });
  };

  return (
    <ComponentFormWrapper
      type="CTA"
      title={title}
      setTitle={setTitle}
      active={active}
      setActive={setActive}
      onSubmit={onSubmit}
      isSubmitting={isSubmitting}
    >
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Nội dung CTA</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Badge (tùy chọn)</Label>
            <Input 
              value={ctaConfig.badge} 
              onChange={(e) => setCtaConfig({...ctaConfig, badge: e.target.value})} 
              placeholder="VD: Ưu đãi có hạn, Hot deal, Mới..." 
            />
            <p className="text-xs text-slate-500">Hiển thị nhãn nổi bật phía trên tiêu đề (urgency indicator)</p>
          </div>
          <div className="space-y-2">
            <Label>Tiêu đề</Label>
            <Input 
              value={ctaConfig.title} 
              onChange={(e) => setCtaConfig({...ctaConfig, title: e.target.value})} 
              placeholder="Sẵn sàng bắt đầu?" 
            />
          </div>
          <div className="space-y-2">
            <Label>Mô tả</Label>
            <textarea 
              value={ctaConfig.description} 
              onChange={(e) => setCtaConfig({...ctaConfig, description: e.target.value})} 
              placeholder="Đăng ký ngay..."
              className="w-full min-h-[60px] rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm" 
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Text nút chính</Label>
              <Input 
                value={ctaConfig.buttonText} 
                onChange={(e) => setCtaConfig({...ctaConfig, buttonText: e.target.value})} 
                placeholder="Đăng ký ngay" 
              />
            </div>
            <div className="space-y-2">
              <Label>Liên kết nút chính</Label>
              <Input 
                value={ctaConfig.buttonLink} 
                onChange={(e) => setCtaConfig({...ctaConfig, buttonLink: e.target.value})} 
                placeholder="/register" 
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Text nút phụ (tùy chọn)</Label>
              <Input 
                value={ctaConfig.secondaryButtonText} 
                onChange={(e) => setCtaConfig({...ctaConfig, secondaryButtonText: e.target.value})} 
                placeholder="Tìm hiểu thêm" 
              />
            </div>
            <div className="space-y-2">
              <Label>Liên kết nút phụ</Label>
              <Input 
                value={ctaConfig.secondaryButtonLink} 
                onChange={(e) => setCtaConfig({...ctaConfig, secondaryButtonLink: e.target.value})} 
                placeholder="/about" 
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <CTAPreview config={ctaConfig} brandColor={brandColor} selectedStyle={style} onStyleChange={setStyle} />
    </ComponentFormWrapper>
  );
}
