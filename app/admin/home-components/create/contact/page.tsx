'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Input, Label } from '../../../components/ui';
import { ComponentFormWrapper, useComponentForm, useBrandColor } from '../shared';
import { ContactPreview, type ContactStyle } from '../../previews';

export default function ContactCreatePage() {
  const { title, setTitle, active, setActive, handleSubmit, isSubmitting } = useComponentForm('Liên hệ', 'Contact');
  const brandColor = useBrandColor();
  
  const [contactConfig, setContactConfig] = useState({
    showMap: true,
    mapEmbed: '',
    address: '123 Nguyễn Huệ, Quận 1, TP.HCM',
    phone: '1900 1234',
    email: 'contact@example.com',
    workingHours: 'Thứ 2 - Thứ 6: 8:00 - 17:00',
    formFields: ['name', 'email', 'phone', 'message'],
    socialLinks: [
      { id: 1, platform: 'facebook', url: '' },
      { id: 2, platform: 'zalo', url: '' }
    ]
  });
  const [style, setStyle] = useState<ContactStyle>('modern');

  const onSubmit = (e: React.FormEvent) => {
    handleSubmit(e, { ...contactConfig, style });
  };

  return (
    <ComponentFormWrapper
      type="Contact"
      title={title}
      setTitle={setTitle}
      active={active}
      setActive={setActive}
      onSubmit={onSubmit}
      isSubmitting={isSubmitting}
    >
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Cấu hình Liên hệ</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Địa chỉ</Label>
              <Input 
                value={contactConfig.address} 
                onChange={(e) => setContactConfig({...contactConfig, address: e.target.value})} 
                placeholder="123 Nguyễn Huệ, Q1, TP.HCM" 
              />
            </div>
            <div className="space-y-2">
              <Label>Số điện thoại</Label>
              <Input 
                value={contactConfig.phone} 
                onChange={(e) => setContactConfig({...contactConfig, phone: e.target.value})} 
                placeholder="1900 1234" 
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input 
                value={contactConfig.email} 
                onChange={(e) => setContactConfig({...contactConfig, email: e.target.value})} 
                placeholder="contact@example.com" 
              />
            </div>
            <div className="space-y-2">
              <Label>Giờ làm việc</Label>
              <Input 
                value={contactConfig.workingHours} 
                onChange={(e) => setContactConfig({...contactConfig, workingHours: e.target.value})} 
                placeholder="T2-T6: 8:00-17:00" 
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input 
              type="checkbox" 
              checked={contactConfig.showMap} 
              onChange={(e) => setContactConfig({...contactConfig, showMap: e.target.checked})} 
              className="w-4 h-4 rounded" 
            />
            <Label>Hiển thị bản đồ</Label>
          </div>
          {contactConfig.showMap && (
            <div className="space-y-2">
              <Label>Google Maps Embed URL</Label>
              <Input 
                value={contactConfig.mapEmbed} 
                onChange={(e) => setContactConfig({...contactConfig, mapEmbed: e.target.value})} 
                placeholder="https://www.google.com/maps/embed?pb=..." 
              />
              <p className="text-xs text-muted-foreground">
                Lấy từ Google Maps: Chia sẻ → Nhúng bản đồ → Copy URL trong src của iframe
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <ContactPreview config={contactConfig} brandColor={brandColor} selectedStyle={style} onStyleChange={setStyle} />
    </ComponentFormWrapper>
  );
}
