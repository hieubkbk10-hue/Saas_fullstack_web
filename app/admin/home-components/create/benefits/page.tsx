'use client';

import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from '../../../components/ui';
import { ComponentFormWrapper, useComponentForm, BRAND_COLOR } from '../shared';
import { ServicesPreview } from '../../previews';

export default function BenefitsCreatePage() {
  const { title, setTitle, active, setActive, handleSubmit } = useComponentForm('Lợi ích');
  
  const [benefitsItems, setBenefitsItems] = useState([
    { id: 1, icon: 'Check', title: 'Chất lượng đảm bảo', description: 'Sản phẩm chính hãng 100%' },
    { id: 2, icon: 'Clock', title: 'Tiết kiệm thời gian', description: 'Giao hàng trong 24h' },
    { id: 3, icon: 'Shield', title: 'An toàn bảo mật', description: 'Thanh toán được mã hóa' }
  ]);

  return (
    <ComponentFormWrapper
      type="Benefits"
      title={title}
      setTitle={setTitle}
      active={active}
      setActive={setActive}
      onSubmit={handleSubmit}
    >
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Lợi ích / Tại sao chọn chúng tôi</CardTitle>
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={() => setBenefitsItems([...benefitsItems, { id: Date.now(), icon: 'Star', title: '', description: '' }])} 
            className="gap-2"
          >
            <Plus size={14} /> Thêm
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {benefitsItems.map((item, idx) => (
            <div key={item.id} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <Label>Lợi ích {idx + 1}</Label>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  className="text-red-500 h-8 w-8" 
                  onClick={() => benefitsItems.length > 1 && setBenefitsItems(benefitsItems.filter(b => b.id !== item.id))}
                >
                  <Trash2 size={14} />
                </Button>
              </div>
              <Input 
                placeholder="Tiêu đề" 
                value={item.title} 
                onChange={(e) => setBenefitsItems(benefitsItems.map(b => b.id === item.id ? {...b, title: e.target.value} : b))} 
              />
              <Input 
                placeholder="Mô tả ngắn" 
                value={item.description} 
                onChange={(e) => setBenefitsItems(benefitsItems.map(b => b.id === item.id ? {...b, description: e.target.value} : b))} 
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <ServicesPreview items={benefitsItems} brandColor={BRAND_COLOR} componentType="Benefits" />
    </ComponentFormWrapper>
  );
}
