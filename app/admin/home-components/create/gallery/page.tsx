'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Plus, Trash2, Upload } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from '../../../components/ui';
import { ComponentFormWrapper, useComponentForm, BRAND_COLOR } from '../shared';
import { GalleryPreview } from '../../previews';

function GalleryCreateContent() {
  const searchParams = useSearchParams();
  const type = (searchParams.get('type') as 'Partners' | 'Gallery' | 'TrustBadges') || 'Gallery';
  
  const titles: Record<string, string> = {
    Partners: 'Đối tác / Logos',
    Gallery: 'Thư viện ảnh',
    TrustBadges: 'Chứng nhận'
  };
  
  const { title, setTitle, active, setActive, handleSubmit } = useComponentForm(titles[type]);
  
  const [galleryItems, setGalleryItems] = useState([
    { id: 1, url: '', link: '' },
    { id: 2, url: '', link: '' }
  ]);

  const handleAddGallery = () => setGalleryItems([...galleryItems, { id: Date.now(), url: '', link: '' }]);
  const handleRemoveGallery = (id: number) => galleryItems.length > 1 && setGalleryItems(galleryItems.filter(g => g.id !== id));

  return (
    <ComponentFormWrapper
      type={type}
      title={title}
      setTitle={setTitle}
      active={active}
      setActive={setActive}
      onSubmit={handleSubmit}
    >
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">
            {type === 'Partners' ? 'Logo đối tác' : type === 'TrustBadges' ? 'Chứng nhận' : 'Thư viện ảnh'}
          </CardTitle>
          <Button type="button" variant="outline" size="sm" onClick={handleAddGallery} className="gap-2">
            <Plus size={14} /> Thêm
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {galleryItems.map((item) => (
              <div key={item.id} className="relative group">
                <div className="aspect-[3/2] bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center overflow-hidden">
                  {item.url ? (
                    <img src={item.url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Upload size={24} className="text-slate-400" />
                  )}
                </div>
                <Input 
                  placeholder="URL ảnh" 
                  value={item.url} 
                  onChange={(e) => setGalleryItems(galleryItems.map(g => g.id === item.id ? {...g, url: e.target.value} : g))} 
                  className="mt-2 h-8" 
                />
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  className="absolute top-1 right-1 h-6 w-6 bg-red-500 text-white opacity-0 group-hover:opacity-100" 
                  onClick={() => handleRemoveGallery(item.id)}
                >
                  <Trash2 size={12} />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <GalleryPreview items={galleryItems} brandColor={BRAND_COLOR} componentType={type} />
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
