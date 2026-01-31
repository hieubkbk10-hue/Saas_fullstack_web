'use client';

import React, { useState } from 'react';
import { GripVertical, Plus, Trash2 } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label, cn } from '../../../components/ui';
import { ComponentFormWrapper, useBrandColor, useComponentForm } from '../shared';
import type { AboutStyle } from '../../previews';
import { AboutPreview } from '../../previews';
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
    imageCaption: '', // Caption for bento style image overlay
    stats: [
      { id: 1, label: 'Năm kinh nghiệm', value: '10+' },
      { id: 2, label: 'Khách hàng tin dùng', value: '5000+' }
    ],
    buttonText: 'Xem chi tiết',
    buttonLink: '/about'
  });

  // Drag & Drop state for stats
  const [draggedId, setDraggedId] = useState<number | null>(null);
  const [dragOverId, setDragOverId] = useState<number | null>(null);

  const handleStatDragStart = (id: number) =>{  setDraggedId(id); };
  const handleStatDragEnd = () => { setDraggedId(null); setDragOverId(null); };
  const handleStatDragOver = (e: React.DragEvent, id: number) => {
    e.preventDefault();
    if (draggedId !== id) {setDragOverId(id);}
  };
  const handleStatDrop = (e: React.DragEvent, targetId: number) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) {return;}
    const newStats = [...aboutConfig.stats];
    const draggedIdx = newStats.findIndex(s => s.id === draggedId);
    const targetIdx = newStats.findIndex(s => s.id === targetId);
    const [moved] = newStats.splice(draggedIdx, 1);
    newStats.splice(targetIdx, 0, moved);
    setAboutConfig({...aboutConfig, stats: newStats});
    setDraggedId(null);
    setDragOverId(null);
  };

  const onSubmit = (e: React.FormEvent) => {
    void handleSubmit(e, aboutConfig);
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
                onChange={(e) =>{  setAboutConfig({...aboutConfig, subHeading: e.target.value}); }} 
                placeholder="Về chúng tôi" 
              />
            </div>
            <div className="space-y-2">
              <Label>Tiêu đề chính (Heading)</Label>
              <Input 
                value={aboutConfig.heading} 
                onChange={(e) =>{  setAboutConfig({...aboutConfig, heading: e.target.value}); }} 
                placeholder="Mang đến giá trị thực" 
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Mô tả</Label>
            <textarea 
              value={aboutConfig.description} 
              onChange={(e) =>{  setAboutConfig({...aboutConfig, description: e.target.value}); }} 
              placeholder="Mô tả về công ty..."
              className="w-full min-h-[100px] rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm" 
            />
          </div>
          <ImageFieldWithUpload
            label="Hình ảnh"
            value={aboutConfig.image}
            onChange={(url) =>{  setAboutConfig({...aboutConfig, image: url}); }}
            folder="home-components"
            aspectRatio="video"
            quality={0.85}
            placeholder="https://example.com/about-image.jpg"
          />
          {/* Image Caption - hiển thị khi style = bento */}
          {aboutConfig.style === 'bento' && (
            <div className="space-y-2">
              <Label>Caption ảnh (Bento style)</Label>
              <Input 
                value={aboutConfig.imageCaption} 
                onChange={(e) =>{  setAboutConfig({...aboutConfig, imageCaption: e.target.value}); }} 
                placeholder="Kiến tạo không gian làm việc hiện đại & bền vững." 
              />
              <p className="text-xs text-slate-500">Text hiển thị overlay trên ảnh trong style Bento Grid</p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Text nút bấm</Label>
              <Input 
                value={aboutConfig.buttonText} 
                onChange={(e) =>{  setAboutConfig({...aboutConfig, buttonText: e.target.value}); }} 
                placeholder="Xem thêm" 
              />
            </div>
            <div className="space-y-2">
              <Label>Liên kết</Label>
              <Input 
                value={aboutConfig.buttonLink} 
                onChange={(e) =>{  setAboutConfig({...aboutConfig, buttonLink: e.target.value}); }} 
                placeholder="/about" 
              />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Số liệu nổi bật (kéo thả để sắp xếp)</Label>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={() =>{  setAboutConfig({...aboutConfig, stats: [...aboutConfig.stats, { id: Date.now(), label: '', value: '' }]}); }} 
                className="gap-2"
              >
                <Plus size={14} /> Thêm
              </Button>
            </div>
            {aboutConfig.stats.map((stat) => (
              <div 
                key={stat.id} 
                className={cn(
                  "flex gap-3 items-center p-2 rounded-lg border bg-white dark:bg-slate-800 cursor-grab transition-all",
                  draggedId === stat.id && "opacity-50",
                  dragOverId === stat.id && "ring-2 ring-blue-500"
                )}
                draggable
                onDragStart={() =>{  handleStatDragStart(stat.id); }}
                onDragEnd={handleStatDragEnd}
                onDragOver={(e) =>{  handleStatDragOver(e, stat.id); }}
                onDrop={(e) =>{  handleStatDrop(e, stat.id); }}
              >
                <GripVertical size={16} className="text-slate-400 flex-shrink-0 cursor-grab" />
                <Input 
                  placeholder="Số liệu" 
                  value={stat.value} 
                  onChange={(e) =>{  setAboutConfig({...aboutConfig, stats: aboutConfig.stats.map(s => s.id === stat.id ? {...s, value: e.target.value} : s)}); }} 
                  className="flex-1" 
                />
                <Input 
                  placeholder="Nhãn" 
                  value={stat.label} 
                  onChange={(e) =>{  setAboutConfig({...aboutConfig, stats: aboutConfig.stats.map(s => s.id === stat.id ? {...s, label: e.target.value} : s)}); }} 
                  className="flex-1" 
                />
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  className="text-red-500 h-8 w-8 flex-shrink-0" 
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
        onStyleChange={(style) =>{  setAboutConfig({...aboutConfig, style}); }}
      />
    </ComponentFormWrapper>
  );
}
