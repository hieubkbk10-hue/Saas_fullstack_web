'use client';

import React, { useState } from 'react';
import { GripVertical, Plus, Trash2 } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label, cn } from '../../../components/ui';
import { ComponentFormWrapper, useBrandColor, useComponentForm } from '../shared';
import { SpeedDialPreview, type SpeedDialStyle } from '../../previews';

interface SpeedDialAction {
  id: number;
  icon: string;
  label: string;
  url: string;
  bgColor: string;
}

const ICON_OPTIONS = [
  { label: 'Điện thoại', value: 'phone' },
  { label: 'Email', value: 'mail' },
  { label: 'Chat', value: 'message-circle' },
  { label: 'Địa chỉ', value: 'map-pin' },
  { label: 'Facebook', value: 'facebook' },
  { label: 'Instagram', value: 'instagram' },
  { label: 'Youtube', value: 'youtube' },
  { label: 'Zalo', value: 'zalo' },
  { label: 'Đặt lịch', value: 'calendar' },
  { label: 'Giỏ hàng', value: 'shopping-cart' },
  { label: 'Hỗ trợ', value: 'headphones' },
  { label: 'FAQ', value: 'help-circle' },
];

export default function SpeedDialCreatePage() {
  const { title, setTitle, active, setActive, handleSubmit, isSubmitting } = useComponentForm('Speed Dial', 'SpeedDial');
  const brandColor = useBrandColor();
  
  const [actions, setActions] = useState<SpeedDialAction[]>([
    { bgColor: '#22c55e', icon: 'phone', id: 1, label: 'Gọi ngay', url: 'tel:0123456789' },
    { bgColor: '#0068ff', icon: 'message-circle', id: 2, label: 'Chat Zalo', url: 'https://zalo.me/yourpage' },
    { bgColor: '#ef4444', icon: 'mail', id: 3, label: 'Email', url: 'mailto:contact@example.com' },
  ]);
  const [style, setStyle] = useState<SpeedDialStyle>('fab');
  const [position, setPosition] = useState<'bottom-right' | 'bottom-left'>('bottom-right');

  // Drag & Drop state
  const [draggedId, setDraggedId] = useState<number | null>(null);
  const [dragOverId, setDragOverId] = useState<number | null>(null);

  const addAction = () => {
    const newId = Math.max(0, ...actions.map(a => a.id)) + 1;
    setActions([...actions, { bgColor: brandColor, icon: 'phone', id: newId, label: '', url: '' }]);
  };

  const removeAction = (id: number) => {
    if (actions.length > 1) {
      setActions(actions.filter(a => a.id !== id));
    }
  };

  const updateAction = (id: number, field: keyof SpeedDialAction, value: string) => {
    setActions(actions.map(a => a.id === id ? { ...a, [field]: value } : a));
  };

  // Drag & Drop handlers
  const handleDragStart = (id: number) =>{  setDraggedId(id); };
  const handleDragEnd = () => { setDraggedId(null); setDragOverId(null); };
  const handleDragOver = (e: React.DragEvent, id: number) => {
    e.preventDefault();
    if (draggedId !== id) {setDragOverId(id);}
  };
  const handleDrop = (e: React.DragEvent, id: number) => {
    e.preventDefault();
    if (!draggedId || draggedId === id) {return;}
    const newActions = [...actions];
    const draggedIndex = newActions.findIndex(a => a.id === draggedId);
    const dropIndex = newActions.findIndex(a => a.id === id);
    const [moved] = newActions.splice(draggedIndex, 1);
    newActions.splice(dropIndex, 0, moved);
    setActions(newActions);
    setDraggedId(null);
    setDragOverId(null);
  };

  const onSubmit = (e: React.FormEvent) => {
    void handleSubmit(e, {
      actions: actions.map(a => ({ bgColor: a.bgColor, icon: a.icon, label: a.label, url: a.url })),
      position,
      style,
    });
  };

  return (
    <ComponentFormWrapper
      type="SpeedDial"
      title={title}
      setTitle={setTitle}
      active={active}
      setActive={setActive}
      onSubmit={onSubmit}
      isSubmitting={isSubmitting}
    >
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Cấu hình chung</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Vị trí hiển thị</Label>
            <select
              value={position}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>{  setPosition(e.target.value as 'bottom-right' | 'bottom-left'); }}
              className="w-full h-9 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm"
            >
              <option value="bottom-right">Góc phải</option>
              <option value="bottom-left">Góc trái</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Danh sách hành động ({actions.length})</CardTitle>
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={addAction}
            disabled={actions.length >= 6}
            className="gap-2"
          >
            <Plus size={14} /> Thêm
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {actions.map((action, idx) => (
            <div 
              key={action.id} 
              className={cn(
                "p-4 bg-slate-50 dark:bg-slate-800 rounded-lg space-y-3 transition-all",
                draggedId === action.id && "opacity-50 scale-[0.98]",
                dragOverId === action.id && "ring-2 ring-blue-500 ring-offset-2"
              )}
              draggable
              onDragStart={() =>{  handleDragStart(action.id); }}
              onDragEnd={handleDragEnd}
              onDragOver={(e) =>{  handleDragOver(e, action.id); }}
              onDrop={(e) =>{  handleDrop(e, action.id); }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GripVertical size={16} className="text-slate-400 cursor-grab active:cursor-grabbing" />
                  <Label>Hành động {idx + 1}</Label>
                </div>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  className="text-red-500 h-8 w-8" 
                  onClick={() =>{  removeAction(action.id); }}
                  disabled={actions.length <= 1}
                >
                  <Trash2 size={14} />
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs text-slate-500">Icon</Label>
                  <select
                    value={action.icon}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>{  updateAction(action.id, 'icon', e.target.value); }}
                    className="w-full h-9 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm"
                  >
                    {ICON_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-slate-500">Màu nền</Label>
                  <div className="flex gap-2">
                    <Input 
                      type="color" 
                      value={action.bgColor} 
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>{  updateAction(action.id, 'bgColor', e.target.value); }}
                      className="w-12 h-9 p-1 cursor-pointer"
                    />
                    <Input 
                      value={action.bgColor} 
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>{  updateAction(action.id, 'bgColor', e.target.value); }}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs text-slate-500">Nhãn</Label>
                  <Input 
                    value={action.label} 
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>{  updateAction(action.id, 'label', e.target.value); }}
                    placeholder="VD: Gọi ngay"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-slate-500">URL / Liên kết</Label>
                  <Input 
                    value={action.url} 
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>{  updateAction(action.id, 'url', e.target.value); }}
                    placeholder="tel:0123456789"
                  />
                </div>
              </div>
            </div>
          ))}
          
          <p className="text-xs text-slate-500">
            Gợi ý URL: tel:0123456789 (gọi điện), mailto:email@example.com (email), https://zalo.me/... (Zalo)
          </p>
        </CardContent>
      </Card>

      <SpeedDialPreview 
        config={{
          actions,
          mainButtonColor: brandColor,
          position,
          style,
        }}
        brandColor={brandColor}
        selectedStyle={style}
        onStyleChange={setStyle}
      />
    </ComponentFormWrapper>
  );
}
