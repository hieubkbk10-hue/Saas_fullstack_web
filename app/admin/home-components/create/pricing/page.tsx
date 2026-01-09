'use client';

import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from '../../../components/ui';
import { ComponentFormWrapper, useComponentForm, BRAND_COLOR } from '../shared';
import { PricingPreview } from '../../previews';

export default function PricingCreatePage() {
  const { title, setTitle, active, setActive, handleSubmit, isSubmitting } = useComponentForm('Bảng giá', 'Pricing');
  
  const [pricingPlans, setPricingPlans] = useState([
    { id: 1, name: 'Cơ bản', price: '0', period: '/tháng', features: ['Tính năng A', 'Tính năng B'], isPopular: false, buttonText: 'Bắt đầu', buttonLink: '/register' },
    { id: 2, name: 'Chuyên nghiệp', price: '299.000', period: '/tháng', features: ['Tất cả Cơ bản', 'Tính năng C'], isPopular: true, buttonText: 'Mua ngay', buttonLink: '/checkout' },
    { id: 3, name: 'Doanh nghiệp', price: 'Liên hệ', period: '', features: ['Tất cả Pro', 'Hỗ trợ 24/7'], isPopular: false, buttonText: 'Liên hệ', buttonLink: '/contact' }
  ]);

  const onSubmit = (e: React.FormEvent) => {
    handleSubmit(e, { plans: pricingPlans.map(p => ({ name: p.name, price: p.price, period: p.period, features: p.features, isPopular: p.isPopular, buttonText: p.buttonText, buttonLink: p.buttonLink })) });
  };

  return (
    <ComponentFormWrapper
      type="Pricing"
      title={title}
      setTitle={setTitle}
      active={active}
      setActive={setActive}
      onSubmit={onSubmit}
      isSubmitting={isSubmitting}
    >
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Các gói dịch vụ</CardTitle>
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={() => setPricingPlans([...pricingPlans, { id: Date.now(), name: '', price: '', period: '/tháng', features: [], isPopular: false, buttonText: 'Chọn gói', buttonLink: '' }])} 
            className="gap-2"
          >
            <Plus size={14} /> Thêm gói
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {pricingPlans.map((plan, idx) => (
            <div key={plan.id} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <Label>Gói {idx + 1}</Label>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input 
                      type="checkbox" 
                      checked={plan.isPopular} 
                      onChange={(e) => setPricingPlans(pricingPlans.map(p => p.id === plan.id ? {...p, isPopular: e.target.checked} : p))} 
                      className="w-4 h-4 rounded" 
                    />
                    Nổi bật
                  </label>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    className="text-red-500 h-8 w-8" 
                    onClick={() => pricingPlans.length > 1 && setPricingPlans(pricingPlans.filter(p => p.id !== plan.id))}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input 
                  placeholder="Tên gói" 
                  value={plan.name} 
                  onChange={(e) => setPricingPlans(pricingPlans.map(p => p.id === plan.id ? {...p, name: e.target.value} : p))} 
                />
                <Input 
                  placeholder="Giá (VD: 299.000)" 
                  value={plan.price} 
                  onChange={(e) => setPricingPlans(pricingPlans.map(p => p.id === plan.id ? {...p, price: e.target.value} : p))} 
                />
              </div>
              <Input 
                placeholder="Tính năng (phân cách bởi dấu phẩy)" 
                value={plan.features.join(', ')} 
                onChange={(e) => setPricingPlans(pricingPlans.map(p => p.id === plan.id ? {...p, features: e.target.value.split(', ').filter(Boolean)} : p))} 
              />
              <div className="grid grid-cols-2 gap-3">
                <Input 
                  placeholder="Text nút bấm" 
                  value={plan.buttonText} 
                  onChange={(e) => setPricingPlans(pricingPlans.map(p => p.id === plan.id ? {...p, buttonText: e.target.value} : p))} 
                />
                <Input 
                  placeholder="Liên kết" 
                  value={plan.buttonLink} 
                  onChange={(e) => setPricingPlans(pricingPlans.map(p => p.id === plan.id ? {...p, buttonLink: e.target.value} : p))} 
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <PricingPreview plans={pricingPlans} brandColor={BRAND_COLOR} />
    </ComponentFormWrapper>
  );
}
