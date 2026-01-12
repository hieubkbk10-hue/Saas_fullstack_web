'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui';
import { ComponentFormWrapper, useComponentForm, useBrandColor } from '../shared';
import { GalleryPreview, TrustBadgesPreview, type GalleryStyle, type TrustBadgesStyle } from '../../previews';
import { MultiImageUploader, ImageItem } from '../../../components/MultiImageUploader';

interface GalleryItem extends ImageItem {
  id: string | number;
  url: string;
  link: string;
  name?: string;
}

function GalleryCreateContent() {
  const searchParams = useSearchParams();
  const type = (searchParams.get('type') as 'Partners' | 'Gallery' | 'TrustBadges') || 'Gallery';
  
  const titles: Record<string, string> = {
    Partners: 'Đối tác / Logos',
    Gallery: 'Thư viện ảnh',
    TrustBadges: 'Chứng nhận'
  };

  const folders: Record<string, string> = {
    Partners: 'partners',
    Gallery: 'gallery',
    TrustBadges: 'trust-badges'
  };
  
  const { title, setTitle, active, setActive, handleSubmit, isSubmitting } = useComponentForm(titles[type], type);
  const brandColor = useBrandColor();
  
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([
    { id: 'item-1', url: '', link: '', name: '' },
    { id: 'item-2', url: '', link: '', name: '' }
  ]);
  const [style, setStyle] = useState<GalleryStyle>('grid');
  const [trustBadgesStyle, setTrustBadgesStyle] = useState<TrustBadgesStyle>('cards');

  const onSubmit = (e: React.FormEvent) => {
    const finalStyle = type === 'TrustBadges' ? trustBadgesStyle : style;
    handleSubmit(e, { items: galleryItems.map(g => ({ url: g.url, link: g.link, name: g.name })), style: finalStyle });
  };

  return (
    <ComponentFormWrapper
      type={type}
      title={title}
      setTitle={setTitle}
      active={active}
      setActive={setActive}
      onSubmit={onSubmit}
      isSubmitting={isSubmitting}
    >
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">
            {type === 'Partners' ? 'Logo đối tác' : type === 'TrustBadges' ? 'Chứng nhận' : 'Thư viện ảnh'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <MultiImageUploader<GalleryItem>
            items={galleryItems}
            onChange={setGalleryItems}
            folder={folders[type]}
            imageKey="url"
            extraFields={
              type === 'Partners' 
                ? [{ key: 'link', placeholder: 'Link website đối tác (tùy chọn)', type: 'url' }]
                : type === 'TrustBadges'
                ? [{ key: 'name', placeholder: 'Tên chứng nhận/bằng cấp', type: 'text' }]
                : []
            }
            minItems={1}
            maxItems={20}
            aspectRatio={type === 'Partners' ? 'video' : 'square'}
            columns={type === 'TrustBadges' ? 3 : type === 'Gallery' ? 3 : 4}
            showReorder={true}
            addButtonText={type === 'Partners' ? 'Thêm logo' : type === 'TrustBadges' ? 'Thêm chứng nhận' : 'Thêm ảnh'}
            emptyText="Chưa có ảnh nào"
            layout={type === 'TrustBadges' ? 'vertical' : 'horizontal'}
          />
        </CardContent>
      </Card>

      {type === 'TrustBadges' ? (
        <TrustBadgesPreview 
          items={galleryItems.map((item, idx) => ({ id: idx + 1, url: item.url, link: item.link, name: item.name }))} 
          brandColor={brandColor}
          selectedStyle={trustBadgesStyle}
          onStyleChange={setTrustBadgesStyle}
        />
      ) : (
        <GalleryPreview 
          items={galleryItems.map((item, idx) => ({ id: idx + 1, url: item.url, link: item.link }))} 
          brandColor={brandColor} 
          componentType={type}
          selectedStyle={style}
          onStyleChange={setStyle}
        />
      )}
    </ComponentFormWrapper>
  );
}

export default function GalleryCreatePage() {
  return (
    <Suspense fallback={<div className="p-4">Loading...</div>}>
      <GalleryCreateContent />
    </Suspense>
  );
}
