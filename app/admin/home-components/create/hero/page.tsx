'use client';

import React, { useState } from 'react';
import { Plus, Trash2, ArrowUp, ArrowDown, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from '../../../components/ui';
import { ComponentFormWrapper, useComponentForm, BRAND_COLOR } from '../shared';
import { HeroBannerPreview } from '../../previews';

export default function HeroCreatePage() {
  const { title, setTitle, active, setActive, handleSubmit } = useComponentForm('Hero Banner');
  
  const [heroSlides, setHeroSlides] = useState([{ id: Date.now(), image: '', link: '' }]);

  const handleAddSlide = () => setHeroSlides([...heroSlides, { id: Date.now(), image: '', link: '' }]);
  
  const handleRemoveSlide = (id: number) => {
    if (heroSlides.length > 1) {
      setHeroSlides(heroSlides.filter(s => s.id !== id));
    } else {
      toast.error('Cần tối thiểu 1 banner');
    }
  };
  
  const handleMoveSlide = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === heroSlides.length - 1)) return;
    const newSlides = [...heroSlides];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    [newSlides[index], newSlides[swapIndex]] = [newSlides[swapIndex], newSlides[index]];
    setHeroSlides(newSlides);
  };

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
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Danh sách Banner (Slider)</CardTitle>
          <Button type="button" variant="outline" size="sm" onClick={handleAddSlide} className="gap-2">
            <Plus size={14} /> Thêm Banner
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {heroSlides.map((slide, index) => (
            <div key={slide.id} className="flex gap-4 items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div className="w-32 h-16 bg-slate-200 dark:bg-slate-700 rounded overflow-hidden flex-shrink-0 flex items-center justify-center">
                {slide.image ? (
                  <img src={slide.image} alt="" className="w-full h-full object-cover" />
                ) : (
                  <Upload size={20} className="text-slate-400" />
                )}
              </div>
              <div className="flex-1 space-y-2">
                <Input 
                  placeholder="URL ảnh banner" 
                  value={slide.image} 
                  onChange={(e) => setHeroSlides(heroSlides.map(s => s.id === slide.id ? {...s, image: e.target.value} : s))} 
                  className="h-8" 
                />
                <Input 
                  placeholder="URL liên kết" 
                  value={slide.link} 
                  onChange={(e) => setHeroSlides(heroSlides.map(s => s.id === slide.id ? {...s, link: e.target.value} : s))} 
                  className="h-8" 
                />
              </div>
              <div className="flex gap-1">
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8" disabled={index === 0} onClick={() => handleMoveSlide(index, 'up')}>
                  <ArrowUp size={14} />
                </Button>
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8" disabled={index === heroSlides.length - 1} onClick={() => handleMoveSlide(index, 'down')}>
                  <ArrowDown size={14} />
                </Button>
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleRemoveSlide(slide.id)}>
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <HeroBannerPreview slides={heroSlides} brandColor={BRAND_COLOR} />
    </ComponentFormWrapper>
  );
}
