'use client';

import React, { useState } from 'react';
import { GripVertical, Package, Plus, Trash2 } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label, cn } from '../../../components/ui';
import { ComponentFormWrapper, useBrandColor, useComponentForm } from '../shared';
import type { PricingConfig, PricingStyle } from '../../previews';
import { PricingPreview } from '../../previews';

interface PricingPlan {
  id: number;
  name: string;
  price: string;
  yearlyPrice: string;
  period: string;
  features: string[];
  isPopular: boolean;
  buttonText: string;
  buttonLink: string;
}

export default function PricingCreatePage() {
  const { title, setTitle, active, setActive, handleSubmit, isSubmitting } = useComponentForm('Bảng giá', 'Pricing');
  const brandColor = useBrandColor();
  
  const [pricingStyle, setPricingStyle] = useState<PricingStyle>('cards');
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([
    { buttonLink: '/register', buttonText: 'Bắt đầu', features: ['Tính năng A', 'Tính năng B'], id: 1, isPopular: false, name: 'Cơ bản', period: '/tháng', price: '0', yearlyPrice: '0' },
    { buttonLink: '/checkout', buttonText: 'Mua ngay', features: ['Tất cả Cơ bản', 'Tính năng C', 'Hỗ trợ email'], id: 2, isPopular: true, name: 'Chuyên nghiệp', period: '/tháng', price: '299.000', yearlyPrice: '2.990.000' },
    { buttonLink: '/contact', buttonText: 'Liên hệ', features: ['Tất cả Pro', 'Hỗ trợ 24/7', 'API Access'], id: 3, isPopular: false, name: 'Doanh nghiệp', period: '', price: 'Liên hệ', yearlyPrice: 'Liên hệ' }
  ]);

  // Config cho các style đặc biệt (Dependent Fields)
  const [pricingConfig, setPricingConfig] = useState<PricingConfig>({
    monthlyLabel: 'Hàng tháng',
    showBillingToggle: true,
    subtitle: 'Chọn gói phù hợp với nhu cầu của bạn',
    yearlyLabel: 'Hàng năm',
    yearlySavingText: 'Tiết kiệm 17%'
  });

  // Drag & Drop state
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
      const newPlans = [...pricingPlans];
      const draggedIndex = newPlans.findIndex(p => p.id === draggedId);
      const dropIndex = newPlans.findIndex(p => p.id === id);
      const [moved] = newPlans.splice(draggedIndex, 1);
      newPlans.splice(dropIndex, 0, moved);
      setPricingPlans(newPlans);
      setDraggedId(null);
      setDragOverId(null);
    }
  });

  const addPlan = () => {
    setPricingPlans([...pricingPlans, { 
      buttonLink: '', 
      buttonText: 'Chọn gói', 
      features: [], 
      id: Date.now(),
      isPopular: false, 
      name: '', 
      period: '/tháng', 
      price: '', 
      yearlyPrice: '' 
    }]);
  };

  const updatePlan = (id: number, updates: Partial<PricingPlan>) => {
    setPricingPlans(pricingPlans.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const removePlan = (id: number) => {
    if (pricingPlans.length > 1) {
      setPricingPlans(pricingPlans.filter(p => p.id !== id));
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    void handleSubmit(e, { 
      plans: pricingPlans.map(p => ({ 
        buttonLink: p.buttonLink, 
        buttonText: p.buttonText, 
        features: p.features,
        isPopular: p.isPopular, 
        name: p.name, 
        period: p.period, 
        price: p.price, 
        yearlyPrice: p.yearlyPrice 
      })),
      style: pricingStyle,
      ...pricingConfig
    });
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
      {/* Cấu hình chung */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Cấu hình bảng giá</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Mô tả ngắn (subtitle)</Label>
            <Input 
              placeholder="Chọn gói phù hợp với nhu cầu của bạn"
              value={pricingConfig.subtitle ?? ''} 
              onChange={(e) =>{  setPricingConfig({ ...pricingConfig, subtitle: e.target.value }); }} 
            />
          </div>
          
          {/* Toggle cấu hình */}
          <div className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input 
                type="checkbox" 
                checked={pricingConfig.showBillingToggle} 
                onChange={(e) =>{  setPricingConfig({ ...pricingConfig, showBillingToggle: e.target.checked }); }} 
                className="w-4 h-4 rounded" 
              />
              <span>Hiển thị toggle Tháng/Năm</span>
            </label>
          </div>

          {/* Billing toggle labels */}
          {pricingConfig.showBillingToggle && (
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-xs">Label tháng</Label>
                <Input 
                  placeholder="Hàng tháng"
                  value={pricingConfig.monthlyLabel ?? ''} 
                  onChange={(e) =>{  setPricingConfig({ ...pricingConfig, monthlyLabel: e.target.value }); }} 
                />
              </div>
              <div>
                <Label className="text-xs">Label năm</Label>
                <Input 
                  placeholder="Hàng năm"
                  value={pricingConfig.yearlyLabel ?? ''} 
                  onChange={(e) =>{  setPricingConfig({ ...pricingConfig, yearlyLabel: e.target.value }); }} 
                />
              </div>
              <div>
                <Label className="text-xs">Badge tiết kiệm</Label>
                <Input 
                  placeholder="Tiết kiệm 17%"
                  value={pricingConfig.yearlySavingText ?? ''} 
                  onChange={(e) =>{  setPricingConfig({ ...pricingConfig, yearlySavingText: e.target.value }); }} 
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Danh sách gói */}
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Các gói dịch vụ ({pricingPlans.length})</CardTitle>
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={addPlan} 
            className="gap-2"
          >
            <Plus size={14} /> Thêm gói
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {pricingPlans.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-slate-100 dark:bg-slate-800">
                <Package size={32} className="text-slate-400" />
              </div>
              <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-1">Chưa có gói nào</h3>
              <p className="text-sm text-slate-500 mb-4">Thêm gói đầu tiên để bắt đầu</p>
              <Button type="button" variant="outline" size="sm" onClick={addPlan} className="gap-2">
                <Plus size={14} /> Thêm gói
              </Button>
            </div>
          ) : (
            pricingPlans.map((plan, idx) => (
              <div 
                key={plan.id} 
                {...dragProps(plan.id)}
                className={cn(
                  "p-4 bg-slate-50 dark:bg-slate-800 rounded-lg space-y-3 transition-all",
                  draggedId === plan.id && "opacity-50 scale-95",
                  dragOverId === plan.id && "ring-2 ring-blue-500"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GripVertical size={16} className="text-slate-400 cursor-grab" />
                    <Label>Gói {idx + 1}</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={plan.isPopular} 
                        onChange={(e) =>{  updatePlan(plan.id, { isPopular: e.target.checked }); }} 
                        className="w-4 h-4 rounded" 
                      />
                      Nổi bật
                    </label>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      className="text-red-500 h-8 w-8" 
                      onClick={() =>{  removePlan(plan.id); }}
                      disabled={pricingPlans.length <= 1}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <Input 
                    placeholder="Tên gói" 
                    value={plan.name} 
                    onChange={(e) =>{  updatePlan(plan.id, { name: e.target.value }); }} 
                  />
                  <Input 
                    placeholder="Giá tháng (VD: 299.000)" 
                    value={plan.price} 
                    onChange={(e) =>{  updatePlan(plan.id, { price: e.target.value }); }} 
                  />
                </div>

                {/* Yearly price - chỉ hiện khi bật toggle */}
                {pricingConfig.showBillingToggle && (
                  <Input 
                    placeholder="Giá năm (VD: 2.990.000)" 
                    value={plan.yearlyPrice} 
                    onChange={(e) =>{  updatePlan(plan.id, { yearlyPrice: e.target.value }); }} 
                  />
                )}
                
                <Input 
                  placeholder="Tính năng (phân cách bởi dấu phẩy)" 
                  value={plan.features.join(', ')} 
                  onChange={(e) =>{  updatePlan(plan.id, { features: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }); }} 
                />
                
                <div className="grid grid-cols-2 gap-3">
                  <Input 
                    placeholder="Text nút bấm" 
                    value={plan.buttonText} 
                    onChange={(e) =>{  updatePlan(plan.id, { buttonText: e.target.value }); }} 
                  />
                  <Input 
                    placeholder="Liên kết" 
                    value={plan.buttonLink} 
                    onChange={(e) =>{  updatePlan(plan.id, { buttonLink: e.target.value }); }} 
                  />
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <PricingPreview 
        plans={pricingPlans} 
        brandColor={brandColor}
        selectedStyle={pricingStyle}
        onStyleChange={setPricingStyle}
        config={pricingConfig}
      />
    </ComponentFormWrapper>
  );
}
