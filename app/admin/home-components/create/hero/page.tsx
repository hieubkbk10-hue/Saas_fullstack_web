'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Input, Label } from '../../../components/ui';
import { ComponentFormWrapper, useComponentForm, useBrandColor } from '../shared';
import { HeroBannerPreview, HeroStyle, HeroContent } from '../../previews';
import { MultiImageUploader, ImageItem } from '../../../components/MultiImageUploader';

interface HeroSlide extends ImageItem {
  id: string | number;
  url: string;
  image: string;
  link: string;
}

const needsContentForm = (style: HeroStyle) => ['fullscreen', 'split', 'parallax'].includes(style);

export default function HeroCreatePage() {
  const { title, setTitle, active, setActive, handleSubmit, isSubmitting } = useComponentForm('Hero Banner', 'Hero');
  const brandColor = useBrandColor();
  
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([
    { id: 'slide-1', url: '', image: '', link: '' }
  ]);
  const [heroStyle, setHeroStyle] = useState<HeroStyle>('slider');
  const [heroContent, setHeroContent] = useState<HeroContent>({
    badge: 'Nổi bật',
    heading: 'Khám phá bộ sưu tập mới nhất',
    description: 'Sản phẩm chất lượng cao với giá thành hợp lý',
    primaryButtonText: 'Khám phá ngay',
    secondaryButtonText: 'Tìm hiểu thêm',
    countdownText: 'Còn 3 ngày',
  });

  const handleSlidesChange = (slides: HeroSlide[]) => {
    setHeroSlides(slides.map(s => ({ ...s, image: s.url })));
  };

  const previewSlides = heroSlides.map((s, idx) => ({ 
    id: idx + 1, 
    image: s.url || s.image,
    link: s.link 
  }));

  const onSubmit = (e: React.FormEvent) => {
    void handleSubmit(e, { 
      slides: heroSlides.map(s => ({ image: s.url || s.image, link: s.link })), 
      style: heroStyle,
      content: needsContentForm(heroStyle) ? heroContent : undefined,
    });
  };

  return (
    <ComponentFormWrapper
      type="Hero"
      title={title}
      setTitle={setTitle}
      active={active}
      setActive={setActive}
      onSubmit={onSubmit}
      isSubmitting={isSubmitting}
    >
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Danh sách Banner (Slider)</CardTitle>
        </CardHeader>
        <CardContent>
          <MultiImageUploader<HeroSlide>
            items={heroSlides}
            onChange={handleSlidesChange}
            folder="hero-banners"
            imageKey="url"
            extraFields={[
              { key: 'link', placeholder: 'URL liên kết (khi click vào banner)', type: 'url' }
            ]}
            minItems={1}
            maxItems={10}
            aspectRatio="banner"
            columns={1}
            showReorder={true}
            addButtonText="Thêm Banner"
            emptyText="Chưa có banner nào"
          />
        </CardContent>
      </Card>

      {/* Form nội dung cho styles: fullscreen, split, parallax */}
      {needsContentForm(heroStyle) && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">Nội dung Hero ({heroStyle})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Badge / Nhãn</Label>
                <Input 
                  value={heroContent.badge} 
                  onChange={(e) => setHeroContent({...heroContent, badge: e.target.value})}
                  placeholder="VD: Nổi bật, Hot, Mới..."
                />
              </div>
              <div className="space-y-2">
                <Label>Tiêu đề chính</Label>
                <Input 
                  value={heroContent.heading} 
                  onChange={(e) => setHeroContent({...heroContent, heading: e.target.value})}
                  placeholder="Tiêu đề lớn hiển thị trên hero"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Mô tả</Label>
              <textarea 
                value={heroContent.description} 
                onChange={(e) => setHeroContent({...heroContent, description: e.target.value})}
                placeholder="Mô tả ngắn gọn..."
                className="w-full min-h-[60px] rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nút chính</Label>
                <Input 
                  value={heroContent.primaryButtonText} 
                  onChange={(e) => setHeroContent({...heroContent, primaryButtonText: e.target.value})}
                  placeholder="VD: Khám phá ngay, Mua ngay..."
                />
              </div>
              {heroStyle === 'fullscreen' && (
                <div className="space-y-2">
                  <Label>Nút phụ</Label>
                  <Input 
                    value={heroContent.secondaryButtonText} 
                    onChange={(e) => setHeroContent({...heroContent, secondaryButtonText: e.target.value})}
                    placeholder="VD: Tìm hiểu thêm..."
                  />
                </div>
              )}
              {heroStyle === 'parallax' && (
                <div className="space-y-2">
                  <Label>Text đếm ngược / Phụ</Label>
                  <Input 
                    value={heroContent.countdownText} 
                    onChange={(e) => setHeroContent({...heroContent, countdownText: e.target.value})}
                    placeholder="VD: Còn 3 ngày, Chỉ hôm nay..."
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <HeroBannerPreview 
        slides={previewSlides} 
        brandColor={brandColor}
        selectedStyle={heroStyle}
        onStyleChange={setHeroStyle}
        content={heroContent}
      />
    </ComponentFormWrapper>
  );
}
