'use client';

import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from '../../../components/ui';
import { ComponentFormWrapper, useComponentForm, useBrandColor } from '../shared';
import { AboutPreview, AboutStyle } from '../../previews';
import { ImageFieldWithUpload } from '../../../components/ImageFieldWithUpload';

export default function AboutCreatePage() {
  const { title, setTitle, active, setActive, handleSubmit, isSubmitting } = useComponentForm('Về chúng tôi', 'About');
  const brandColor = useBrandColor();
  
  const [aboutConfig, setAboutConfig] = useState({
    style: 'bento' as AboutStyle,
    subHeading: 'Câu chuyện thương hiệu',
    heading: 'Mang đến giá trị thực',
    description: 'Chúng tôi là đội ngũ chuyên gia với hơn 10 năm kinh nghiệm trong lĩnh vực...',
    image: '',
    stats: [
      { id: 1, value: '10+', label: 'Năm kinh nghiệm' },
      { id: 2, value: '5000+', label: 'Khách hàng tin dùng' }
    ],
    buttonText: 'Xem chi tiết',
    buttonLink: '/about'
  });

  const onSubmit = (e: React.FormEvent) => {
    handleSubmit(e, aboutConfig);
  };

  return (
    <ComponentFormWrapper
      type="About"
      title={title}
      setTitle={setTitle}
      active={active}
      setActive={setActive}
      onSubmit={onSubmit}
      isSubmitting={isSubmitting}
    >
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Cấu hình Về chúng tôi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tiêu đề nhỏ (Sub-heading)</Label>
              <Input 
                value={aboutConfig.subHeading} 
                onChange={(e) => setAboutConfig({...aboutConfig, subHeading: e.target.value})} 
                placeholder="Về chúng tôi" 
              />
            </div>
            <div className="space-y-2">
              <Label>Tiêu đề chính (Heading)</Label>
              <Input 
                value={aboutConfig.heading} 
                onChange={(e) => setAboutConfig({...aboutConfig, heading: e.target.value})} 
                placeholder="Mang đến giá trị thực" 
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Mô tả</Label>
            <textarea 
              value={aboutConfig.description} 
              onChange={(e) => setAboutConfig({...aboutConfig, description: e.target.value})} 
              placeholder="Mô tả về công ty..."
              className="w-full min-h-[100px] rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm" 
            />
          </div>
          <ImageFieldWithUpload
            label="Hình ảnh"
            value={aboutConfig.image}
            onChange={(url) => setAboutConfig({...aboutConfig, image: url})}
            folder="home-components"
            aspectRatio="video"
            quality={0.85}
            placeholder="https://example.com/about-image.jpg"
          />
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Text nút bấm</Label>
              <Input 
                value={aboutConfig.buttonText} 
                onChange={(e) => setAboutConfig({...aboutConfig, buttonText: e.target.value})} 
                placeholder="Xem thêm" 
              />
            </div>
            <div className="space-y-2">
              <Label>Liên kết</Label>
              <Input 
                value={aboutConfig.buttonLink} 
                onChange={(e) => setAboutConfig({...aboutConfig, buttonLink: e.target.value})} 
                placeholder="/about" 
              />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Số liệu nổi bật</Label>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={() => setAboutConfig({...aboutConfig, stats: [...aboutConfig.stats, { id: Date.now(), value: '', label: '' }]})} 
                className="gap-2"
              >
                <Plus size={14} /> Thêm
              </Button>
            </div>
            {aboutConfig.stats.map((stat) => (
              <div key={stat.id} className="flex gap-3 items-center">
                <Input 
                  placeholder="Số liệu" 
                  value={stat.value} 
                  onChange={(e) => setAboutConfig({...aboutConfig, stats: aboutConfig.stats.map(s => s.id === stat.id ? {...s, value: e.target.value} : s)})} 
                  className="flex-1" 
                />
                <Input 
                  placeholder="Nhãn" 
                  value={stat.label} 
                  onChange={(e) => setAboutConfig({...aboutConfig, stats: aboutConfig.stats.map(s => s.id === stat.id ? {...s, label: e.target.value} : s)})} 
                  className="flex-1" 
                />
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  className="text-red-500 h-8 w-8" 
                  onClick={() => aboutConfig.stats.length > 1 && setAboutConfig({...aboutConfig, stats: aboutConfig.stats.filter(s => s.id !== stat.id)})}
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <AboutPreview 
        config={aboutConfig} 
        brandColor={brandColor}
        selectedStyle={aboutConfig.style}
        onStyleChange={(style) => setAboutConfig({...aboutConfig, style})}
      />
    </ComponentFormWrapper>
  );
}
