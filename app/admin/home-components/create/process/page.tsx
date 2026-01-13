'use client';

import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from '../../../components/ui';
import { ComponentFormWrapper, useComponentForm, useBrandColor } from '../shared';
import { ProcessPreview, type ProcessStyle } from '../../previews';

interface ProcessStep {
  id: number;
  title: string;
  description: string;
  icon: string;
}

export default function ProcessCreatePage() {
  const { title, setTitle, active, setActive, handleSubmit, isSubmitting } = useComponentForm('Quy trình làm việc', 'Process');
  const brandColor = useBrandColor();
  
  const [steps, setSteps] = useState<ProcessStep[]>([
    { id: 1, icon: '1', title: 'Tiếp nhận yêu cầu', description: 'Lắng nghe và tìm hiểu nhu cầu của khách hàng một cách chi tiết.' },
    { id: 2, icon: '2', title: 'Phân tích & Tư vấn', description: 'Đưa ra giải pháp phù hợp nhất với ngân sách và mục tiêu.' },
    { id: 3, icon: '3', title: 'Triển khai', description: 'Thực hiện dự án theo đúng tiến độ và chất lượng cam kết.' },
    { id: 4, icon: '4', title: 'Bàn giao & Hỗ trợ', description: 'Bàn giao sản phẩm và hỗ trợ sau bán hàng tận tâm.' }
  ]);
  const [style, setStyle] = useState<ProcessStyle>('timeline');

  const onSubmit = (e: React.FormEvent) => {
    handleSubmit(e, { 
      steps: steps.map(s => ({ icon: s.icon, title: s.title, description: s.description })), 
      style 
    });
  };

  return (
    <ComponentFormWrapper
      type="Process"
      title={title}
      setTitle={setTitle}
      active={active}
      setActive={setActive}
      onSubmit={onSubmit}
      isSubmitting={isSubmitting}
    >
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Các bước quy trình</CardTitle>
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={() => setSteps([...steps, { id: Date.now(), icon: String(steps.length + 1), title: '', description: '' }])} 
            className="gap-2"
          >
            <Plus size={14} /> Thêm bước
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {steps.map((step, idx) => (
            <div key={step.id} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold">{idx + 1}</span>
                  Bước {idx + 1}
                </Label>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  className="text-red-500 h-8 w-8" 
                  onClick={() => steps.length > 1 && setSteps(steps.filter(s => s.id !== step.id))}
                >
                  <Trash2 size={14} />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <Input 
                  placeholder="Icon/Số (VD: 1, 01, ✓)" 
                  value={step.icon} 
                  onChange={(e) => setSteps(steps.map(s => s.id === step.id ? {...s, icon: e.target.value} : s))}
                  className="md:col-span-1"
                />
                <Input 
                  placeholder="Tiêu đề bước" 
                  value={step.title} 
                  onChange={(e) => setSteps(steps.map(s => s.id === step.id ? {...s, title: e.target.value} : s))} 
                  className="md:col-span-3"
                />
              </div>
              <Input 
                placeholder="Mô tả chi tiết bước này..." 
                value={step.description} 
                onChange={(e) => setSteps(steps.map(s => s.id === step.id ? {...s, description: e.target.value} : s))} 
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <ProcessPreview 
        steps={steps} 
        brandColor={brandColor} 
        selectedStyle={style} 
        onStyleChange={setStyle} 
      />
    </ComponentFormWrapper>
  );
}
