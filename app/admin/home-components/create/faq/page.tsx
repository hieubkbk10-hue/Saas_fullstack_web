'use client';

import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from '../../../components/ui';
import { ComponentFormWrapper, useComponentForm, useBrandColor } from '../shared';
import { FaqPreview, type FaqStyle } from '../../previews';

export default function FaqCreatePage() {
  const { title, setTitle, active, setActive, handleSubmit, isSubmitting } = useComponentForm('Câu hỏi thường gặp', 'FAQ');
  const brandColor = useBrandColor();
  
  const [faqItems, setFaqItems] = useState([
    { id: 1, question: 'Làm thế nào để đặt hàng?', answer: 'Bạn có thể đặt hàng trực tuyến qua website hoặc gọi hotline.' },
    { id: 2, question: 'Chính sách đổi trả ra sao?', answer: 'Chúng tôi hỗ trợ đổi trả trong vòng 30 ngày.' }
  ]);
  const [style, setStyle] = useState<FaqStyle>('accordion');

  const handleAddFaq = () => setFaqItems([...faqItems, { id: Date.now(), question: '', answer: '' }]);
  const handleRemoveFaq = (id: number) => faqItems.length > 1 && setFaqItems(faqItems.filter(f => f.id !== id));

  const onSubmit = (e: React.FormEvent) => {
    handleSubmit(e, { items: faqItems.map(f => ({ question: f.question, answer: f.answer })), style });
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
        <CardContent className="space-y-4">
          {faqItems.map((item, idx) => (
            <div key={item.id} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <Label>Câu hỏi {idx + 1}</Label>
                <Button type="button" variant="ghost" size="icon" className="text-red-500 h-8 w-8" onClick={() => handleRemoveFaq(item.id)}>
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
                className="w-full min-h-[80px] rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm" 
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <FaqPreview items={faqItems} brandColor={brandColor} selectedStyle={style} onStyleChange={setStyle} />
    </ComponentFormWrapper>
  );
}
