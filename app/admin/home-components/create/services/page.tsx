'use client';

import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from '../../../components/ui';
import { ComponentFormWrapper, useComponentForm, useBrandColor } from '../shared';
import { ServicesPreview, type ServicesStyle } from '../../previews';

export default function ServicesCreatePage() {
  const { title, setTitle, active, setActive, handleSubmit, isSubmitting } = useComponentForm('Dịch vụ chi tiết', 'Services');
  const brandColor = useBrandColor();
  
  const [servicesItems, setServicesItems] = useState([
    { id: 1, icon: 'Briefcase', title: 'Tư vấn chiến lược', description: 'Đội ngũ chuyên gia giàu kinh nghiệm' },
    { id: 2, icon: 'Shield', title: 'Bảo hành trọn đời', description: 'Cam kết chất lượng sản phẩm' },
    { id: 3, icon: 'Truck', title: 'Giao hàng nhanh', description: 'Miễn phí vận chuyển toàn quốc' }
  ]);
  const [style, setStyle] = useState<ServicesStyle>('elegantGrid');

  const handleAddService = () => setServicesItems([...servicesItems, { id: Date.now(), icon: 'Star', title: '', description: '' }]);
  const handleRemoveService = (id: number) => servicesItems.length > 1 && setServicesItems(servicesItems.filter(s => s.id !== id));

  const onSubmit = (e: React.FormEvent) => {
    handleSubmit(e, { items: servicesItems.map(s => ({ icon: s.icon, title: s.title, description: s.description })), style });
  };

  return (
    <ComponentFormWrapper
      type="Services"
      title={title}
      setTitle={setTitle}
      active={active}
      setActive={setActive}
      onSubmit={onSubmit}
      isSubmitting={isSubmitting}
    >
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Dịch vụ</CardTitle>
          <Button type="button" variant="outline" size="sm" onClick={handleAddService} className="gap-2">
            <Plus size={14} /> Thêm
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {servicesItems.map((item, idx) => (
            <div key={item.id} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <Label>Dịch vụ {idx + 1}</Label>
                <Button type="button" variant="ghost" size="icon" className="text-red-500 h-8 w-8" onClick={() => handleRemoveService(item.id)}>
                  <Trash2 size={14} />
                </Button>
              </div>
              <Input 
                placeholder="Tiêu đề" 
                value={item.title} 
                onChange={(e) => setServicesItems(servicesItems.map(s => s.id === item.id ? {...s, title: e.target.value} : s))} 
              />
              <Input 
                placeholder="Mô tả ngắn" 
                value={item.description} 
                onChange={(e) => setServicesItems(servicesItems.map(s => s.id === item.id ? {...s, description: e.target.value} : s))} 
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <ServicesPreview items={servicesItems} brandColor={brandColor} componentType="Services" selectedStyle={style} onStyleChange={setStyle} />
    </ComponentFormWrapper>
  );
}
