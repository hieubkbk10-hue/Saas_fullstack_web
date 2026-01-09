'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
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
  const { title, setTitle, active, setActive, handleSubmit } = useComponentForm('Hero Banner');
  
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([
    { id: 'slide-1', url: '', image: '', link: '' }
  ]);

  // Sync url and image fields
  const handleSlidesChange = (slides: HeroSlide[]) => {
    setHeroSlides(slides.map(s => ({ ...s, image: s.url })));
  };

  // Transform for preview (uses 'image' field, id as number)
  const previewSlides = heroSlides.map((s, idx) => ({ 
    id: idx + 1, 
    image: s.url || s.image,
    link: s.link 
  }));

  return (
    <ComponentFormWrapper
      type="Hero"
      title={title}
      setTitle={setTitle}
      active={active}
      setActive={setActive}
      onSubmit={handleSubmit}
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
