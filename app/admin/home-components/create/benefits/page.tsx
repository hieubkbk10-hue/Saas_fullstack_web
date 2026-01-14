'use client';

import React, { useState } from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from '../../../components/ui';
import { ComponentFormWrapper, useComponentForm, useBrandColor } from '../shared';
import { BenefitsPreview, type BenefitsStyle, type BenefitsConfig } from '../../previews';

const MIN_ITEMS = 1;
const MAX_ITEMS = 8;

export default function BenefitsCreatePage() {
  const { title, setTitle, active, setActive, handleSubmit, isSubmitting } = useComponentForm('Lợi ích', 'Benefits');
  const brandColor = useBrandColor();
  
  const [benefitsItems, setBenefitsItems] = useState([
    { id: 1, icon: 'Check', title: 'Chất lượng đảm bảo', description: 'Sản phẩm chính hãng 100%, nguồn gốc xuất xứ rõ ràng.' },
    { id: 2, icon: 'Clock', title: 'Tiết kiệm thời gian', description: 'Giao hàng hỏa tốc trong 24h, quy trình xử lý đơn hàng tối ưu.' },
    { id: 3, icon: 'Shield', title: 'An toàn bảo mật', description: 'Thanh toán được mã hóa SSL, bảo vệ tuyệt đối thông tin cá nhân.' },
    { id: 4, icon: 'Star', title: 'Hỗ trợ tận tâm', description: 'Đội ngũ CSKH hoạt động 24/7, giải quyết khiếu nại trong 1h.' }
  ]);
  const [style, setStyle] = useState<BenefitsStyle>('cards');
  const [config, setConfig] = useState<BenefitsConfig>({
    subHeading: 'Vì sao chọn chúng tôi?',
    heading: 'Giá trị cốt lõi',
    buttonText: '',
    buttonLink: ''
  });

  // Drag & Drop state
  const [draggedId, setDraggedId] = useState<number | null>(null);
  const [dragOverId, setDragOverId] = useState<number | null>(null);

  const handleDragStart = (id: number) => setDraggedId(id);
  const handleDragEnd = () => { setDraggedId(null); setDragOverId(null); };
  const handleDragOver = (e: React.DragEvent, id: number) => {
    e.preventDefault();
    if (draggedId !== id) setDragOverId(id);
  };
  const handleDrop = (e: React.DragEvent, targetId: number) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) return;
    const newItems = [...benefitsItems];
    const draggedIndex = newItems.findIndex(i => i.id === draggedId);
    const targetIndex = newItems.findIndex(i => i.id === targetId);
    const [moved] = newItems.splice(draggedIndex, 1);
    newItems.splice(targetIndex, 0, moved);
    setBenefitsItems(newItems);
    setDraggedId(null);
    setDragOverId(null);
  };

  const addItem = () => {
    if (benefitsItems.length >= MAX_ITEMS) return;
    setBenefitsItems([...benefitsItems, { id: Date.now(), icon: 'Star', title: '', description: '' }]);
  };

  const removeItem = (id: number) => {
    if (benefitsItems.length <= MIN_ITEMS) return;
    setBenefitsItems(benefitsItems.filter(b => b.id !== id));
  };

  const updateItem = (id: number, field: string, value: string) => {
    setBenefitsItems(benefitsItems.map(b => b.id === id ? { ...b, [field]: value } : b));
  };

  const onSubmit = (e: React.FormEvent) => {
    handleSubmit(e, { 
      items: benefitsItems.map(b => ({ icon: b.icon, title: b.title, description: b.description })), 
      style,
      subHeading: config.subHeading,
      heading: config.heading,
      buttonText: config.buttonText,
      buttonLink: config.buttonLink
    });
  };

  return (
    <ComponentFormWrapper
      type="Benefits"
      title={title}
      setTitle={setTitle}
      active={active}
      setActive={setActive}
      onSubmit={onSubmit}
      isSubmitting={isSubmitting}
    >
      {/* Config Card - Header Text */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Cấu hình hiển thị</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Badge text</Label>
              <Input 
                placeholder="Vì sao chọn chúng tôi?" 
                value={config.subHeading || ''} 
                onChange={(e) => setConfig({ ...config, subHeading: e.target.value })} 
              />
            </div>
            <div>
              <Label>Tiêu đề chính</Label>
              <Input 
                placeholder="Giá trị cốt lõi" 
                value={config.heading || ''} 
                onChange={(e) => setConfig({ ...config, heading: e.target.value })} 
              />
            </div>
          </div>
          {/* Timeline style config */}
          {style === 'timeline' && (
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <Label>Nút CTA (tùy chọn)</Label>
                <Input 
                  placeholder="Tìm hiểu thêm" 
                  value={config.buttonText || ''} 
                  onChange={(e) => setConfig({ ...config, buttonText: e.target.value })} 
                />
              </div>
              <div>
                <Label>Link nút CTA</Label>
                <Input 
                  placeholder="/lien-he" 
                  value={config.buttonLink || ''} 
                  onChange={(e) => setConfig({ ...config, buttonLink: e.target.value })} 
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Benefits Items Card */}
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">
            Lợi ích ({benefitsItems.length}/{MAX_ITEMS})
          </CardTitle>
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={addItem} 
            disabled={benefitsItems.length >= MAX_ITEMS}
            className="gap-2"
          >
            <Plus size={14} /> Thêm
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {benefitsItems.map((item, idx) => (
            <div 
              key={item.id} 
              draggable
              onDragStart={() => handleDragStart(item.id)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => handleDragOver(e, item.id)}
              onDrop={(e) => handleDrop(e, item.id)}
              className={`p-4 bg-slate-50 dark:bg-slate-800 rounded-lg space-y-3 transition-all cursor-grab active:cursor-grabbing ${
                draggedId === item.id ? 'opacity-50 scale-[0.98]' : ''
              } ${dragOverId === item.id ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GripVertical size={16} className="text-slate-400" />
                  <Label className="font-medium">Lợi ích {idx + 1}</Label>
                </div>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  className="text-red-500 h-8 w-8" 
                  onClick={() => removeItem(item.id)}
                  disabled={benefitsItems.length <= MIN_ITEMS}
                >
                  <Trash2 size={14} />
                </Button>
              </div>
              <Input 
                placeholder="Tiêu đề lợi ích" 
                value={item.title} 
                onChange={(e) => updateItem(item.id, 'title', e.target.value)} 
              />
              <Input 
                placeholder="Mô tả ngắn (max 100 ký tự)" 
                value={item.description} 
                maxLength={150}
                onChange={(e) => updateItem(item.id, 'description', e.target.value)} 
              />
              <p className="text-xs text-slate-400 text-right">{item.description.length}/150</p>
            </div>
          ))}
          {benefitsItems.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              <p>Chưa có lợi ích nào. Nhấn "Thêm" để bắt đầu.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <BenefitsPreview 
        items={benefitsItems} 
        brandColor={brandColor} 
        selectedStyle={style} 
        onStyleChange={setStyle}
        config={config}
      />
    </ComponentFormWrapper>
  );
}
