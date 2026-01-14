'use client';

import React, { useState } from 'react';
import { Plus, Trash2, GripVertical, HelpCircle } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label, cn } from '../../../components/ui';
import { ComponentFormWrapper, useComponentForm, useBrandColor } from '../shared';
import { FaqPreview, type FaqStyle, type FaqConfig } from '../../previews';

export default function FaqCreatePage() {
  const { title, setTitle, active, setActive, handleSubmit, isSubmitting } = useComponentForm('Câu hỏi thường gặp', 'FAQ');
  const brandColor = useBrandColor();
  
  const [faqItems, setFaqItems] = useState([
    { id: 1, question: 'Làm thế nào để đặt hàng?', answer: 'Bạn có thể đặt hàng trực tuyến qua website hoặc gọi hotline.' },
    { id: 2, question: 'Chính sách đổi trả ra sao?', answer: 'Chúng tôi hỗ trợ đổi trả trong vòng 30 ngày.' }
  ]);
  const [style, setStyle] = useState<FaqStyle>('accordion');
  
  // Config for two-column style
  const [faqConfig, setFaqConfig] = useState<FaqConfig>({
    description: 'Tìm câu trả lời cho các thắc mắc phổ biến của bạn',
    buttonText: 'Liên hệ hỗ trợ',
    buttonLink: '/lien-he'
  });

  // Drag & Drop state
  const [draggedId, setDraggedId] = useState<number | null>(null);
  const [dragOverId, setDragOverId] = useState<number | null>(null);

  const handleAddFaq = () => setFaqItems([...faqItems, { id: Date.now(), question: '', answer: '' }]);
  const handleRemoveFaq = (id: number) => faqItems.length > 1 && setFaqItems(faqItems.filter(f => f.id !== id));

  // Drag handlers
  const dragProps = (id: number) => ({
    draggable: true,
    onDragStart: () => setDraggedId(id),
    onDragEnd: () => { setDraggedId(null); setDragOverId(null); },
    onDragOver: (e: React.DragEvent) => { e.preventDefault(); if (draggedId !== id) setDragOverId(id); },
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      if (!draggedId || draggedId === id) return;
      const newItems = [...faqItems];
      const draggedIdx = newItems.findIndex(i => i.id === draggedId);
      const targetIdx = newItems.findIndex(i => i.id === id);
      const [moved] = newItems.splice(draggedIdx, 1);
      newItems.splice(targetIdx, 0, moved);
      setFaqItems(newItems);
      setDraggedId(null); 
      setDragOverId(null);
    }
  });

  const onSubmit = (e: React.FormEvent) => {
    handleSubmit(e, { 
      items: faqItems.map(f => ({ question: f.question, answer: f.answer })), 
      style,
      ...faqConfig
    });
  };

  return (
    <ComponentFormWrapper
      type="FAQ"
      title={title}
      setTitle={setTitle}
      active={active}
      setActive={setActive}
      onSubmit={onSubmit}
      isSubmitting={isSubmitting}
    >
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Câu hỏi thường gặp</CardTitle>
          <Button type="button" variant="outline" size="sm" onClick={handleAddFaq} className="gap-2">
            <Plus size={14} /> Thêm
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {faqItems.length === 0 ? (
            // Empty state
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3" style={{ backgroundColor: `${brandColor}10` }}>
                <HelpCircle size={24} style={{ color: brandColor }} />
              </div>
              <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-1">Chưa có câu hỏi nào</h3>
              <p className="text-sm text-slate-500 mb-4">Thêm câu hỏi đầu tiên để bắt đầu</p>
              <Button type="button" variant="outline" size="sm" onClick={handleAddFaq} className="gap-2">
                <Plus size={14} /> Thêm câu hỏi
              </Button>
            </div>
          ) : (
            faqItems.map((item, idx) => (
              <div 
                key={item.id} 
                {...dragProps(item.id)}
                className={cn(
                  "p-4 bg-slate-50 dark:bg-slate-800 rounded-lg space-y-3 transition-all",
                  draggedId === item.id && "opacity-50",
                  dragOverId === item.id && "ring-2 ring-blue-500"
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <GripVertical size={16} className="cursor-grab text-slate-400 hover:text-slate-600 flex-shrink-0" />
                    <Label className="text-sm font-medium">Câu hỏi {idx + 1}</Label>
                  </div>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8 w-8" 
                    onClick={() => handleRemoveFaq(item.id)}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
                <Input 
                  placeholder="Nhập câu hỏi..." 
                  value={item.question} 
                  onChange={(e) => setFaqItems(faqItems.map(f => f.id === item.id ? {...f, question: e.target.value} : f))} 
                />
                <textarea 
                  placeholder="Nhập câu trả lời..." 
                  value={item.answer} 
                  onChange={(e) => setFaqItems(faqItems.map(f => f.id === item.id ? {...f, answer: e.target.value} : f))}
                  className="w-full min-h-[80px] rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                />
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Config cho style 2 Cột */}
      {style === 'two-column' && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">Cấu hình style 2 Cột</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm mb-1.5 block">Mô tả ngắn</Label>
              <Input 
                placeholder="Tìm câu trả lời cho các thắc mắc phổ biến của bạn" 
                value={faqConfig.description || ''} 
                onChange={(e) => setFaqConfig({...faqConfig, description: e.target.value})} 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm mb-1.5 block">Nút CTA - Text</Label>
                <Input 
                  placeholder="Liên hệ hỗ trợ" 
                  value={faqConfig.buttonText || ''} 
                  onChange={(e) => setFaqConfig({...faqConfig, buttonText: e.target.value})} 
                />
              </div>
              <div>
                <Label className="text-sm mb-1.5 block">Nút CTA - Link</Label>
                <Input 
                  placeholder="/lien-he" 
                  value={faqConfig.buttonLink || ''} 
                  onChange={(e) => setFaqConfig({...faqConfig, buttonLink: e.target.value})} 
                />
              </div>
            </div>
            <p className="text-xs text-slate-500">Để trống nút CTA nếu không muốn hiển thị</p>
          </CardContent>
        </Card>
      )}

      <FaqPreview items={faqItems} brandColor={brandColor} selectedStyle={style} onStyleChange={setStyle} config={faqConfig} />
    </ComponentFormWrapper>
  );
}
