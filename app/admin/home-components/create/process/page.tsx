'use client';

import React, { useState } from 'react';
import { Plus, Trash2, GripVertical, Layers } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label, cn } from '../../../components/ui';
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

  // Drag & Drop state
  const [draggedId, setDraggedId] = useState<number | null>(null);
  const [dragOverId, setDragOverId] = useState<number | null>(null);

  const dragProps = (id: number) => ({
    draggable: true,
    onDragStart: () => setDraggedId(id),
    onDragEnd: () => { setDraggedId(null); setDragOverId(null); },
    onDragOver: (e: React.DragEvent) => { e.preventDefault(); if (draggedId !== id) setDragOverId(id); },
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      if (!draggedId || draggedId === id) return;
      const newSteps = [...steps];
      const draggedIdx = steps.findIndex(s => s.id === draggedId);
      const targetIdx = steps.findIndex(s => s.id === id);
      const [moved] = newSteps.splice(draggedIdx, 1);
      newSteps.splice(targetIdx, 0, moved);
      setSteps(newSteps);
      setDraggedId(null); 
      setDragOverId(null);
    }
  });

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
          {steps.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: `${brandColor}10` }}>
                <Layers size={28} style={{ color: brandColor }} />
              </div>
              <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-1">Chưa có bước nào</h3>
              <p className="text-sm text-slate-500">Nhấn &quot;Thêm bước&quot; để bắt đầu</p>
            </div>
          ) : (
            steps.map((step, idx) => (
              <div 
                key={step.id} 
                {...dragProps(step.id)}
                className={cn(
                  "p-4 bg-slate-50 dark:bg-slate-800 rounded-lg space-y-3 cursor-grab active:cursor-grabbing transition-all",
                  draggedId === step.id && "opacity-50",
                  dragOverId === step.id && "ring-2 ring-blue-500"
                )}
              >
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <GripVertical size={16} className="text-slate-400 cursor-grab" />
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
            ))
          )}
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
