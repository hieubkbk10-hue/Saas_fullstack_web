'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Input, Label, Button } from '../../../components/ui';
import { ComponentFormWrapper, useComponentForm, useBrandColor } from '../shared';
import { ContactPreview, type ContactStyle, type ContactConfig } from '../../previews';
import { Plus, X, Facebook, MessageCircle, Instagram, Twitter, Linkedin, Youtube, Globe } from 'lucide-react';

const SOCIAL_PLATFORMS = [
  { value: 'facebook', label: 'Facebook', icon: Facebook },
  { value: 'zalo', label: 'Zalo', icon: MessageCircle },
  { value: 'instagram', label: 'Instagram', icon: Instagram },
  { value: 'twitter', label: 'Twitter/X', icon: Twitter },
  { value: 'linkedin', label: 'LinkedIn', icon: Linkedin },
  { value: 'youtube', label: 'YouTube', icon: Youtube },
  { value: 'other', label: 'Khác', icon: Globe },
];

export default function ContactCreatePage() {
  const { title, setTitle, active, setActive, handleSubmit, isSubmitting } = useComponentForm('Liên hệ', 'Contact');
  const brandColor = useBrandColor();
  
  const [contactConfig, setContactConfig] = useState<ContactConfig>({
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
    ],
    formTitle: '',
    formDescription: '',
    submitButtonText: 'Gửi tin nhắn',
    responseTimeText: 'Phản hồi trong 24h'
  });
  const [style, setStyle] = useState<ContactStyle>('modern');

  const addSocialLink = () => {
    const newId = Math.max(0, ...contactConfig.socialLinks.map(s => s.id)) + 1;
    setContactConfig({
      ...contactConfig,
      socialLinks: [...contactConfig.socialLinks, { id: newId, platform: 'facebook', url: '' }]
    });
  };

  const removeSocialLink = (id: number) => {
    setContactConfig({
      ...contactConfig,
      socialLinks: contactConfig.socialLinks.filter(s => s.id !== id)
    });
  };

  const updateSocialLink = (id: number, field: 'platform' | 'url', value: string) => {
    setContactConfig({
      ...contactConfig,
      socialLinks: contactConfig.socialLinks.map(s => s.id === id ? { ...s, [field]: value } : s)
    });
  };

  const onSubmit = (e: React.FormEvent) => {
    void handleSubmit(e, { ...contactConfig, style });
  };

  const showFormConfig = style === 'minimal' || style === 'centered';

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
          <CardTitle className="text-base">Thông tin liên hệ cơ bản</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Địa chỉ</Label>
              <Input value={contactConfig.address} onChange={(e) => setContactConfig({...contactConfig, address: e.target.value})} placeholder="123 Nguyễn Huệ, Q1, TP.HCM" />
            </div>
            <div className="space-y-2">
              <Label>Số điện thoại</Label>
              <Input value={contactConfig.phone} onChange={(e) => setContactConfig({...contactConfig, phone: e.target.value})} placeholder="1900 1234" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={contactConfig.email} onChange={(e) => setContactConfig({...contactConfig, email: e.target.value})} placeholder="contact@example.com" />
            </div>
            <div className="space-y-2">
              <Label>Giờ làm việc</Label>
              <Input value={contactConfig.workingHours} onChange={(e) => setContactConfig({...contactConfig, workingHours: e.target.value})} placeholder="T2-T6: 8:00-17:00" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={contactConfig.showMap} onChange={(e) => setContactConfig({...contactConfig, showMap: e.target.checked})} className="w-4 h-4 rounded" />
            <Label>Hiển thị bản đồ</Label>
          </div>
          {contactConfig.showMap && (
            <div className="space-y-2">
              <Label>Google Maps Embed URL</Label>
              <Input value={contactConfig.mapEmbed} onChange={(e) => setContactConfig({...contactConfig, mapEmbed: e.target.value})} placeholder="https://www.google.com/maps/embed?pb=..." />
              <p className="text-xs text-muted-foreground">Lấy từ Google Maps: Chia sẻ → Nhúng bản đồ → Copy URL trong src của iframe</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Mạng xã hội</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {contactConfig.socialLinks.map((social) => {
            const platform = SOCIAL_PLATFORMS.find(p => p.value === social.platform);
            const Icon = platform?.icon || Globe;
            return (
              <div key={social.id} className="flex items-center gap-3">
                <select value={social.platform} onChange={(e) => updateSocialLink(social.id, 'platform', e.target.value)} className="w-36 px-3 py-2 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm">
                  {SOCIAL_PLATFORMS.map(p => (<option key={p.value} value={p.value}>{p.label}</option>))}
                </select>
                <div className="flex-1 flex items-center gap-2">
                  <Icon size={18} className="text-slate-400 shrink-0" />
                  <Input value={social.url} onChange={(e) => updateSocialLink(social.id, 'url', e.target.value)} placeholder={`URL ${platform?.label || 'trang'}`} className="flex-1" />
                </div>
                <Button type="button" variant="ghost" size="icon" onClick={() => removeSocialLink(social.id)} className="text-slate-400 hover:text-red-500"><X size={16} /></Button>
              </div>
            );
          })}
          <Button type="button" variant="outline" size="sm" onClick={addSocialLink} className="w-full"><Plus size={16} className="mr-2" />Thêm mạng xã hội</Button>
        </CardContent>
      </Card>

      {showFormConfig && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">Cấu hình Form liên hệ</CardTitle>
            <p className="text-xs text-muted-foreground">Áp dụng cho style Minimal Form và Centered</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tiêu đề form</Label>
                <Input value={contactConfig.formTitle || ''} onChange={(e) => setContactConfig({...contactConfig, formTitle: e.target.value})} placeholder="Gửi tin nhắn cho chúng tôi" />
              </div>
              <div className="space-y-2">
                <Label>Nút gửi</Label>
                <Input value={contactConfig.submitButtonText || ''} onChange={(e) => setContactConfig({...contactConfig, submitButtonText: e.target.value})} placeholder="Gửi tin nhắn" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Mô tả form</Label>
                <Input value={contactConfig.formDescription || ''} onChange={(e) => setContactConfig({...contactConfig, formDescription: e.target.value})} placeholder="Điền thông tin bên dưới..." />
              </div>
              <div className="space-y-2">
                <Label>Thời gian phản hồi</Label>
                <Input value={contactConfig.responseTimeText || ''} onChange={(e) => setContactConfig({...contactConfig, responseTimeText: e.target.value})} placeholder="Phản hồi trong 24h" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <ContactPreview config={contactConfig} brandColor={brandColor} selectedStyle={style} onStyleChange={setStyle} />
    </ComponentFormWrapper>
  );
}
