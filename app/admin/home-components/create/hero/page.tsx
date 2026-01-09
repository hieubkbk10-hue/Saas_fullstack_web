'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui';
import { ComponentFormWrapper, useComponentForm, BRAND_COLOR } from '../shared';
import { HeroBannerPreview } from '../../previews';
import { MultiImageUploader, ImageItem } from '../../../components/MultiImageUploader';

interface HeroSlide extends ImageItem {
  id: string | number;
  url: string;
  image: string;
  link: string;
}

export default function HeroCreatePage() {
  const { title, setTitle, active, setActive, handleSubmit, isSubmitting } = useComponentForm('Hero Banner', 'Hero');
  
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([
    { id: 'slide-1', url: '', image: '', link: '' }
  ]);

  const handleSlidesChange = (slides: HeroSlide[]) => {
    setHeroSlides(slides.map(s => ({ ...s, image: s.url })));
  };

  const previewSlides = heroSlides.map((s, idx) => ({ 
    id: idx + 1, 
    image: s.url || s.image,
    link: s.link 
  }));

  const onSubmit = (e: React.FormEvent) => {
    handleSubmit(e, { slides: heroSlides.map(s => ({ image: s.url || s.image, link: s.link })) });
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

      <HeroBannerPreview slides={previewSlides} brandColor={BRAND_COLOR} />
    </ComponentFormWrapper>
  );
}
