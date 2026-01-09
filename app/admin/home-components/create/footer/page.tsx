'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Input, Label } from '../../../components/ui';
import { ComponentFormWrapper, useComponentForm, useBrandColor } from '../shared';
import { FooterPreview } from '../../previews';

export default function FooterCreatePage() {
  const { title, setTitle, active, setActive, handleSubmit, isSubmitting } = useComponentForm('Footer', 'Footer');
  const brandColor = useBrandColor();
  
  const [footerConfig, setFooterConfig] = useState({
    logo: '',
    description: 'Công ty TNHH ABC - Đối tác tin cậy của bạn',
    columns: [
      { id: 1, title: 'Về chúng tôi', links: [{ label: 'Giới thiệu', url: '/about' }, { label: 'Tuyển dụng', url: '/careers' }] },
      { id: 2, title: 'Hỗ trợ', links: [{ label: 'FAQ', url: '/faq' }, { label: 'Liên hệ', url: '/contact' }] }
    ],
    copyright: '© 2024 VietAdmin. All rights reserved.',
    showSocialLinks: true
  });

  const onSubmit = (e: React.FormEvent) => {
    handleSubmit(e, footerConfig);
  };

  return (
    <ComponentFormWrapper
      type="Footer"
      title={title}
      setTitle={setTitle}
      active={active}
      setActive={setActive}
      onSubmit={onSubmit}
      isSubmitting={isSubmitting}
    >
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Cấu hình Footer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Mô tả công ty</Label>
            <textarea 
              value={footerConfig.description} 
              onChange={(e) => setFooterConfig({...footerConfig, description: e.target.value})} 
              placeholder="Công ty TNHH ABC..."
              className="w-full min-h-[60px] rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm" 
            />
          </div>
          <div className="space-y-2">
            <Label>Copyright</Label>
            <Input 
              value={footerConfig.copyright} 
              onChange={(e) => setFooterConfig({...footerConfig, copyright: e.target.value})} 
              placeholder="© 2024 Company" 
            />
          </div>
          <div className="flex items-center gap-2">
            <input 
              type="checkbox" 
              checked={footerConfig.showSocialLinks} 
              onChange={(e) => setFooterConfig({...footerConfig, showSocialLinks: e.target.checked})} 
              className="w-4 h-4 rounded" 
            />
            <Label>Hiển thị social links</Label>
          </div>
        </CardContent>
      </Card>

      <FooterPreview config={footerConfig} brandColor={brandColor} />
    </ComponentFormWrapper>
  );
}
