'use client';

import React, { useState } from 'react';
import { GripVertical, Plus, Trash2 } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label, cn } from '../../../components/ui';
import { ComponentFormWrapper, useBrandColor, useComponentForm } from '../shared';
import { FeaturesPreview, type FeaturesStyle } from '../../previews';

export default function FeaturesCreatePage() {
  const { title, setTitle, active, setActive, handleSubmit, isSubmitting } = useComponentForm('Tính năng nổi bật', 'Features');
  const brandColor = useBrandColor();
  
  const [featuresItems, setFeaturesItems] = useState([
    { description: 'Hiệu suất tối ưu với thời gian phản hồi dưới 100ms.', icon: 'Zap', id: 1, title: 'Tốc độ nhanh' },
    { description: 'Mã hóa end-to-end, bảo vệ dữ liệu người dùng.', icon: 'Shield', id: 2, title: 'Bảo mật cao' },
    { description: 'Tích hợp trí tuệ nhân tạo, tự động hóa quy trình.', icon: 'Cpu', id: 3, title: 'AI thông minh' },
    { description: 'Hoạt động trên mọi thiết bị: Web, iOS, Android.', icon: 'Globe', id: 4, title: 'Đa nền tảng' },
    { description: 'Cài đặt nhanh chóng, hướng dẫn chi tiết.', icon: 'Rocket', id: 5, title: 'Dễ triển khai' },
    { description: 'Dashboard trực quan, theo dõi KPIs real-time.', icon: 'Target', id: 6, title: 'Phân tích sâu' }
  ]);
  const [style, setStyle] = useState<FeaturesStyle>('iconGrid');
  
  // Drag & Drop states
  const [draggedId, setDraggedId] = useState<number | null>(null);
  const [dragOverId, setDragOverId] = useState<number | null>(null);

  const dragProps = (id: number) => ({
    draggable: true,
    onDragEnd: () => { setDraggedId(null); setDragOverId(null); },
    onDragOver: (e: React.DragEvent) => { e.preventDefault(); if (draggedId !== id) {setDragOverId(id);} },
    onDragStart: () =>{  setDraggedId(id); },
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      if (!draggedId || draggedId === id) {return;}
      const newItems = [...featuresItems];
      const draggedIdx = newItems.findIndex(i => i.id === draggedId);
      const targetIdx = newItems.findIndex(i => i.id === id);
      const [moved] = newItems.splice(draggedIdx, 1);
      newItems.splice(targetIdx, 0, moved);
      setFeaturesItems(newItems);
      setDraggedId(null); setDragOverId(null);
    }
  });

  const onSubmit = (e: React.FormEvent) => {
    void handleSubmit(e, { items: featuresItems.map(f => ({ description: f.description, icon: f.icon, title: f.title })), style });
  };

  return (
    <ComponentFormWrapper
      type="Features"
      title={title}
      setTitle={setTitle}
      active={active}
      setActive={setActive}
      onSubmit={onSubmit}
      isSubmitting={isSubmitting}
    >
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Danh sách tính năng</CardTitle>
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={() =>{  setFeaturesItems([...featuresItems, { description: '', icon: 'Zap', id: Date.now(), title: '' }]); }} 
            className="gap-2"
          >
            <Plus size={14} /> Thêm
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {featuresItems.map((item, idx) => (
            <div 
              key={item.id} 
              {...dragProps(item.id)}
              className={cn(
                "p-4 bg-slate-50 dark:bg-slate-800 rounded-lg space-y-3 cursor-grab active:cursor-grabbing transition-all",
                draggedId === item.id && "opacity-50",
                dragOverId === item.id && "ring-2 ring-blue-500"
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GripVertical size={16} className="text-slate-400" />
                  <Label>Tính năng {idx + 1}</Label>
                </div>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  className="text-red-500 h-8 w-8" 
                  onClick={() => featuresItems.length > 1 && setFeaturesItems(featuresItems.filter(f => f.id !== item.id))}
                >
                  <Trash2 size={14} />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <select 
                  value={item.icon} 
                  onChange={(e) =>{  setFeaturesItems(featuresItems.map(f => f.id === item.id ? {...f, icon: e.target.value} : f)); }}
                  className="h-9 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm"
                >
                  <option value="Zap">Zap - Nhanh</option>
                  <option value="Shield">Shield - Bảo mật</option>
                  <option value="Target">Target - Mục tiêu</option>
                  <option value="Layers">Layers - Tầng lớp</option>
                  <option value="Cpu">Cpu - Công nghệ</option>
                  <option value="Globe">Globe - Toàn cầu</option>
                  <option value="Rocket">Rocket - Khởi động</option>
                  <option value="Settings">Settings - Cài đặt</option>
                  <option value="Check">Check - Đúng</option>
                  <option value="Star">Star - Nổi bật</option>
                </select>
                <Input 
                  placeholder="Tiêu đề" 
                  value={item.title} 
                  onChange={(e) =>{  setFeaturesItems(featuresItems.map(f => f.id === item.id ? {...f, title: e.target.value} : f)); }} 
                  className="md:col-span-2"
                />
              </div>
              <Input 
                placeholder="Mô tả ngắn" 
                value={item.description} 
                onChange={(e) =>{  setFeaturesItems(featuresItems.map(f => f.id === item.id ? {...f, description: e.target.value} : f)); }} 
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <FeaturesPreview items={featuresItems} brandColor={brandColor} selectedStyle={style} onStyleChange={setStyle} />
    </ComponentFormWrapper>
  );
}
