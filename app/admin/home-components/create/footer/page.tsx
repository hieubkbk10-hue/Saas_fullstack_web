'use client';

import React, { useState } from 'react';
import { Plus, Trash2, Download } from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, Input, Label, Button } from '../../../components/ui';
import { ComponentFormWrapper, useComponentForm, useBrandColor } from '../shared';
import { FooterPreview, type FooterStyle } from '../../previews';
import { SettingsImageUploader } from '../../../components/SettingsImageUploader';

type FooterLink = { label: string; url: string };
type FooterColumn = { id: number; title: string; links: FooterLink[] };
type SocialLink = { id: number; platform: string; url: string; icon: string };

const SOCIAL_PLATFORMS = [
  { key: 'facebook', label: 'Facebook', icon: 'facebook' },
  { key: 'instagram', label: 'Instagram', icon: 'instagram' },
  { key: 'youtube', label: 'Youtube', icon: 'youtube' },
  { key: 'tiktok', label: 'TikTok', icon: 'tiktok' },
  { key: 'zalo', label: 'Zalo', icon: 'zalo' },
];

export default function FooterCreatePage() {
  const { title, setTitle, active, setActive, handleSubmit, isSubmitting } = useComponentForm('Footer', 'Footer');
  const brandColor = useBrandColor();
  
  // Load settings from Convex
  const siteLogo = useQuery(api.settings.getByKey, { key: 'site_logo' });
  const socialFacebook = useQuery(api.settings.getByKey, { key: 'social_facebook' });
  const socialInstagram = useQuery(api.settings.getByKey, { key: 'social_instagram' });
  const socialYoutube = useQuery(api.settings.getByKey, { key: 'social_youtube' });
  const socialTiktok = useQuery(api.settings.getByKey, { key: 'social_tiktok' });
  const socialZalo = useQuery(api.settings.getByKey, { key: 'social_zalo' });
  
  const [footerConfig, setFooterConfig] = useState({
    logo: '',
    description: 'Công ty TNHH ABC - Đối tác tin cậy của bạn',
    columns: [
      { id: 1, title: 'Về chúng tôi', links: [{ label: 'Giới thiệu', url: '/about' }, { label: 'Tuyển dụng', url: '/careers' }] },
      { id: 2, title: 'Hỗ trợ', links: [{ label: 'FAQ', url: '/faq' }, { label: 'Liên hệ', url: '/contact' }] }
    ] as FooterColumn[],
    socialLinks: [] as SocialLink[],
    copyright: '© 2024 VietAdmin. All rights reserved.',
    showSocialLinks: true
  });
  const [style, setStyle] = useState<FooterStyle>('classic');

  // Load from Settings
  const loadFromSettings = () => {
    const newSocialLinks: SocialLink[] = [];
    let idCounter = 1;
    
    if (socialFacebook?.value) {
      newSocialLinks.push({ id: idCounter++, platform: 'facebook', url: socialFacebook.value as string, icon: 'facebook' });
    }
    if (socialInstagram?.value) {
      newSocialLinks.push({ id: idCounter++, platform: 'instagram', url: socialInstagram.value as string, icon: 'instagram' });
    }
    if (socialYoutube?.value) {
      newSocialLinks.push({ id: idCounter++, platform: 'youtube', url: socialYoutube.value as string, icon: 'youtube' });
    }
    if (socialTiktok?.value) {
      newSocialLinks.push({ id: idCounter++, platform: 'tiktok', url: socialTiktok.value as string, icon: 'tiktok' });
    }
    if (socialZalo?.value) {
      newSocialLinks.push({ id: idCounter++, platform: 'zalo', url: socialZalo.value as string, icon: 'zalo' });
    }
    
    setFooterConfig(prev => ({
      ...prev,
      logo: (siteLogo?.value as string) || prev.logo,
      socialLinks: newSocialLinks.length > 0 ? newSocialLinks : prev.socialLinks,
    }));
    
    toast.success('Đã load dữ liệu từ Settings');
  };

  const onSubmit = (e: React.FormEvent) => {
    handleSubmit(e, { ...footerConfig, style });
  };

  // Column management
  const addColumn = () => {
    const newId = Math.max(0, ...footerConfig.columns.map(c => c.id)) + 1;
    setFooterConfig({
      ...footerConfig,
      columns: [...footerConfig.columns, { id: newId, title: `Cột ${newId}`, links: [{ label: 'Link mới', url: '#' }] }]
    });
  };

  const removeColumn = (columnId: number) => {
    setFooterConfig({
      ...footerConfig,
      columns: footerConfig.columns.filter(c => c.id !== columnId)
    });
  };

  const updateColumn = (columnId: number, field: 'title', value: string) => {
    setFooterConfig({
      ...footerConfig,
      columns: footerConfig.columns.map(c => c.id === columnId ? { ...c, [field]: value } : c)
    });
  };

  // Link management
  const addLink = (columnId: number) => {
    setFooterConfig({
      ...footerConfig,
      columns: footerConfig.columns.map(c => 
        c.id === columnId ? { ...c, links: [...c.links, { label: 'Link mới', url: '#' }] } : c
      )
    });
  };

  const removeLink = (columnId: number, linkIndex: number) => {
    setFooterConfig({
      ...footerConfig,
      columns: footerConfig.columns.map(c => 
        c.id === columnId ? { ...c, links: c.links.filter((_, idx) => idx !== linkIndex) } : c
      )
    });
  };

  const updateLink = (columnId: number, linkIndex: number, field: 'label' | 'url', value: string) => {
    setFooterConfig({
      ...footerConfig,
      columns: footerConfig.columns.map(c => 
        c.id === columnId ? { 
          ...c, 
          links: c.links.map((link, idx) => idx === linkIndex ? { ...link, [field]: value } : link)
        } : c
      )
    });
  };

  // Social links management
  const addSocialLink = () => {
    const usedPlatforms = footerConfig.socialLinks.map(s => s.platform);
    const availablePlatform = SOCIAL_PLATFORMS.find(p => !usedPlatforms.includes(p.key));
    if (!availablePlatform) {
      toast.error('Đã thêm đủ tất cả mạng xã hội');
      return;
    }
    const newId = Math.max(0, ...footerConfig.socialLinks.map(s => s.id)) + 1;
    setFooterConfig({
      ...footerConfig,
      socialLinks: [...footerConfig.socialLinks, { id: newId, platform: availablePlatform.key, url: '', icon: availablePlatform.icon }]
    });
  };

  const removeSocialLink = (id: number) => {
    setFooterConfig({
      ...footerConfig,
      socialLinks: footerConfig.socialLinks.filter(s => s.id !== id)
    });
  };

  const updateSocialLink = (id: number, field: 'platform' | 'url', value: string) => {
    setFooterConfig({
      ...footerConfig,
      socialLinks: footerConfig.socialLinks.map(s => {
        if (s.id !== id) return s;
        if (field === 'platform') {
          const platform = SOCIAL_PLATFORMS.find(p => p.key === value);
          return { ...s, platform: value, icon: platform?.icon || value };
        }
        return { ...s, [field]: value };
      })
    });
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
      {/* Load from Settings Button */}
      <div className="mb-4 flex justify-end">
        <Button type="button" variant="outline" size="sm" onClick={loadFromSettings}>
          <Download size={14} className="mr-1" /> Load từ Settings
        </Button>
      </div>

      {/* Logo & Basic Info */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Thông tin cơ bản</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Logo</Label>
            <SettingsImageUploader
              value={footerConfig.logo}
              onChange={(url) => setFooterConfig({...footerConfig, logo: url || ''})}
              folder="footer"
              previewSize="sm"
            />
          </div>
          <div className="space-y-2">
            <Label>Mô tả công ty</Label>
            <textarea 
              value={footerConfig.description} 
              onChange={(e) => setFooterConfig({...footerConfig, description: e.target.value})} 
              placeholder="Công ty TNHH ABC - Đối tác tin cậy của bạn"
              className="w-full min-h-[60px] rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm" 
            />
          </div>
          <div className="space-y-2">
            <Label>Copyright</Label>
            <Input 
              value={footerConfig.copyright} 
              onChange={(e) => setFooterConfig({...footerConfig, copyright: e.target.value})} 
              placeholder="© 2024 Company. All rights reserved." 
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

      {/* Menu Columns */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Cột menu ({footerConfig.columns.length})</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addColumn} disabled={footerConfig.columns.length >= 4}>
              <Plus size={14} className="mr-1" /> Thêm cột
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {footerConfig.columns.length === 0 ? (
            <div className="text-center py-6 text-slate-500 text-sm">
              Chưa có cột menu nào. Nhấn "Thêm cột" để bắt đầu.
            </div>
          ) : (
            footerConfig.columns.map((column) => (
              <div key={column.id} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Input
                    value={column.title}
                    onChange={(e) => updateColumn(column.id, 'title', e.target.value)}
                    placeholder="Tiêu đề cột"
                    className="flex-1"
                  />
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => removeColumn(column.id)}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
                
                {/* Links */}
                <div className="pl-4 space-y-2">
                  <Label className="text-xs text-slate-500">Links ({column.links.length})</Label>
                  {column.links.map((link, linkIdx) => (
                    <div key={linkIdx} className="flex items-center gap-2">
                      <Input
                        value={link.label}
                        onChange={(e) => updateLink(column.id, linkIdx, 'label', e.target.value)}
                        placeholder="Tên link"
                        className="flex-1"
                      />
                      <Input
                        value={link.url}
                        onChange={(e) => updateLink(column.id, linkIdx, 'url', e.target.value)}
                        placeholder="/url"
                        className="flex-1"
                      />
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => removeLink(column.id, linkIdx)}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 flex-shrink-0"
                        disabled={column.links.length <= 1}
                      >
                        <Trash2 size={12} />
                      </Button>
                    </div>
                  ))}
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => addLink(column.id)}
                    className="text-slate-500 hover:text-slate-700"
                  >
                    <Plus size={12} className="mr-1" /> Thêm link
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Social Links */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Mạng xã hội ({footerConfig.socialLinks.length})</CardTitle>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={addSocialLink}
              disabled={footerConfig.socialLinks.length >= SOCIAL_PLATFORMS.length}
            >
              <Plus size={14} className="mr-1" /> Thêm MXH
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {footerConfig.socialLinks.length === 0 ? (
            <div className="text-center py-6 text-slate-500 text-sm">
              Chưa có mạng xã hội nào. Nhấn "Thêm MXH" hoặc "Load từ Settings".
            </div>
          ) : (
            footerConfig.socialLinks.map((social) => (
              <div key={social.id} className="flex items-center gap-3">
                <select
                  value={social.platform}
                  onChange={(e) => updateSocialLink(social.id, 'platform', e.target.value)}
                  className="w-36 h-9 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm"
                >
                  {SOCIAL_PLATFORMS.map(p => (
                    <option 
                      key={p.key} 
                      value={p.key}
                      disabled={footerConfig.socialLinks.some(s => s.platform === p.key && s.id !== social.id)}
                    >
                      {p.label}
                    </option>
                  ))}
                </select>
                <Input
                  value={social.url}
                  onChange={(e) => updateSocialLink(social.id, 'url', e.target.value)}
                  placeholder="https://facebook.com/yourpage"
                  className="flex-1"
                />
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => removeSocialLink(social.id)}
                  className="text-red-500 hover:text-red-600 hover:bg-red-50 flex-shrink-0"
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <FooterPreview config={footerConfig} brandColor={brandColor} selectedStyle={style} onStyleChange={setStyle} />
    </ComponentFormWrapper>
  );
}
