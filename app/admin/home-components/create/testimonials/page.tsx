'use client';

import React, { useState } from 'react';
import { Plus, Trash2, Star } from 'lucide-react';
import { cn, Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from '../../../components/ui';
import { ComponentFormWrapper, useComponentForm, BRAND_COLOR } from '../shared';
import { TestimonialsPreview } from '../../previews';

export default function TestimonialsCreatePage() {
  const { title, setTitle, active, setActive, handleSubmit } = useComponentForm('Đánh giá / Review');
  
  const [testimonials, setTestimonials] = useState([
    { id: 1, name: 'Nguyễn Văn A', role: 'CEO, ABC Corp', content: 'Dịch vụ tuyệt vời!', avatar: '', rating: 5 },
    { id: 2, name: 'Trần Thị B', role: 'Manager, XYZ Ltd', content: 'Chất lượng vượt mong đợi.', avatar: '', rating: 5 }
  ]);

  const handleAddTestimonial = () => setTestimonials([...testimonials, { id: Date.now(), name: '', role: '', content: '', avatar: '', rating: 5 }]);
  const handleRemoveTestimonial = (id: number) => testimonials.length > 1 && setTestimonials(testimonials.filter(t => t.id !== id));

  return (
    <ComponentFormWrapper
      type="Testimonials"
      title={title}
      setTitle={setTitle}
      active={active}
      setActive={setActive}
      onSubmit={handleSubmit}
    >
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Đánh giá khách hàng</CardTitle>
          <Button type="button" variant="outline" size="sm" onClick={handleAddTestimonial} className="gap-2">
            <Plus size={14} /> Thêm
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {testimonials.map((item, idx) => (
            <div key={item.id} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <Label>Đánh giá {idx + 1}</Label>
                <Button type="button" variant="ghost" size="icon" className="text-red-500 h-8 w-8" onClick={() => handleRemoveTestimonial(item.id)}>
                  <Trash2 size={14} />
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input 
                  placeholder="Tên khách hàng" 
                  value={item.name} 
                  onChange={(e) => setTestimonials(testimonials.map(t => t.id === item.id ? {...t, name: e.target.value} : t))} 
                />
                <Input 
                  placeholder="Chức vụ / Công ty" 
                  value={item.role} 
                  onChange={(e) => setTestimonials(testimonials.map(t => t.id === item.id ? {...t, role: e.target.value} : t))} 
                />
              </div>
              <textarea 
                placeholder="Nội dung đánh giá..." 
                value={item.content} 
                onChange={(e) => setTestimonials(testimonials.map(t => t.id === item.id ? {...t, content: e.target.value} : t))}
                className="w-full min-h-[60px] rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm" 
              />
              <div className="flex items-center gap-2">
                <Label className="text-sm">Đánh giá:</Label>
                {[1,2,3,4,5].map(star => (
                  <Star 
                    key={star} 
                    size={20} 
                    className={cn("cursor-pointer", star <= item.rating ? "text-yellow-400 fill-yellow-400" : "text-slate-300")}
                    onClick={() => setTestimonials(testimonials.map(t => t.id === item.id ? {...t, rating: star} : t))} 
                  />
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <TestimonialsPreview items={testimonials} brandColor={BRAND_COLOR} />
    </ComponentFormWrapper>
  );
}
