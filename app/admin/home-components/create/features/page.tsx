'use client';

import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from '../../../components/ui';
import { ComponentFormWrapper, useComponentForm, useBrandColor } from '../shared';
import { FeaturesPreview, type FeaturesStyle } from '../../previews';

export default function FeaturesCreatePage() {
  const { title, setTitle, active, setActive, handleSubmit, isSubmitting } = useComponentForm('Tính năng nổi bật', 'Features');
  const brandColor = useBrandColor();
  
  const [featuresItems, setFeaturesItems] = useState([
    { id: 1, icon: 'Zap', title: 'Tốc độ nhanh', description: 'Hiệu suất tối ưu với thời gian phản hồi dưới 100ms.' },
    { id: 2, icon: 'Shield', title: 'Bảo mật cao', description: 'Mã hóa end-to-end, bảo vệ dữ liệu người dùng.' },
    { id: 3, icon: 'Cpu', title: 'AI thông minh', description: 'Tích hợp trí tuệ nhân tạo, tự động hóa quy trình.' },
    { id: 4, icon: 'Globe', title: 'Đa nền tảng', description: 'Hoạt động trên mọi thiết bị: Web, iOS, Android.' },
    { id: 5, icon: 'Rocket', title: 'Dễ triển khai', description: 'Cài đặt nhanh chóng, hướng dẫn chi tiết.' },
    { id: 6, icon: 'Target', title: 'Phân tích sâu', description: 'Dashboard trực quan, theo dõi KPIs real-time.' }
  ]);
  const [style, setStyle] = useState<FeaturesStyle>('iconGrid');

  const onSubmit = (e: React.FormEvent) => {
    handleSubmit(e, { items: featuresItems.map(f => ({ icon: f.icon, title: f.title, description: f.description })), style });
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
            onClick={() => setFeaturesItems([...featuresItems, { id: Date.now(), icon: 'Zap', title: '', description: '' }])} 
            className="gap-2"
          >
            <Plus size={14} /> Thêm
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {featuresItems.map((item, idx) => (
            <div key={item.id} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <Label>Tính năng {idx + 1}</Label>
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
                  onChange={(e) => setFeaturesItems(featuresItems.map(f => f.id === item.id ? {...f, icon: e.target.value} : f))}
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
                  onChange={(e) => setFeaturesItems(featuresItems.map(f => f.id === item.id ? {...f, title: e.target.value} : f))} 
                  className="md:col-span-2"
                />
              </div>
              <Input 
                placeholder="Mô tả ngắn" 
                value={item.description} 
                onChange={(e) => setFeaturesItems(featuresItems.map(f => f.id === item.id ? {...f, description: e.target.value} : f))} 
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <FeaturesPreview items={featuresItems} brandColor={brandColor} selectedStyle={style} onStyleChange={setStyle} />
    </ComponentFormWrapper>
  );
}
