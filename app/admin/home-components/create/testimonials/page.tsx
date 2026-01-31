'use client';

import React, { useState } from 'react';
import { GripVertical, Plus, Star, Trash2, User } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label, cn } from '../../../components/ui';
import { ComponentFormWrapper, useBrandColor, useComponentForm } from '../shared';
import { TestimonialsPreview, type TestimonialsStyle } from '../../previews';

interface TestimonialItem { id: number; name: string; role: string; content: string; avatar: string; rating: number }

export default function TestimonialsCreatePage() {
  const { title, setTitle, active, setActive, handleSubmit, isSubmitting } = useComponentForm('Đánh giá / Review', 'Testimonials');
  const brandColor = useBrandColor();
  
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([
    { avatar: '', content: 'Dịch vụ tuyệt vời! Chúng tôi rất hài lòng với chất lượng sản phẩm và dịch vụ hỗ trợ.', id: 1, name: 'Nguyễn Văn A', rating: 5, role: 'CEO, ABC Corp' },
    { avatar: '', content: 'Chất lượng vượt mong đợi. Đội ngũ chuyên nghiệp và tận tâm.', id: 2, name: 'Trần Thị B', rating: 5, role: 'Manager, XYZ Ltd' }
  ]);

  const [style, setStyle] = useState<TestimonialsStyle>('cards');
  
  // Drag & Drop state
  const [draggedId, setDraggedId] = useState<number | null>(null);
  const [dragOverId, setDragOverId] = useState<number | null>(null);

  const handleAddTestimonial = () =>{  setTestimonials([...testimonials, { avatar: '', content: '', id: Date.now(), name: '', rating: 5, role: '' }]); };
  const handleRemoveTestimonial = (id: number) => testimonials.length > 1 && setTestimonials(testimonials.filter(t => t.id !== id));

  // Drag & Drop handlers
  const handleDragStart = (id: number) =>{  setDraggedId(id); };
  const handleDragEnd = () => { setDraggedId(null); setDragOverId(null); };
  const handleDragOver = (e: React.DragEvent, id: number) => {
    e.preventDefault();
    if (draggedId !== id) {setDragOverId(id);}
  };
  const handleDrop = (e: React.DragEvent, targetId: number) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) {return;}
    const newItems = [...testimonials];
    const draggedIndex = newItems.findIndex(i => i.id === draggedId);
    const targetIndex = newItems.findIndex(i => i.id === targetId);
    const [moved] = newItems.splice(draggedIndex, 1);
    newItems.splice(targetIndex, 0, moved);
    setTestimonials(newItems);
    setDraggedId(null);
    setDragOverId(null);
  };

  const onSubmit = (e: React.FormEvent) => {
    void handleSubmit(e, { items: testimonials.map(t => ({ avatar: t.avatar, content: t.content, name: t.name, rating: t.rating, role: t.role })), style });
  };

  return (
    <ComponentFormWrapper
      type="Testimonials"
      title={title}
      setTitle={setTitle}
      active={active}
      setActive={setActive}
      onSubmit={onSubmit}
      isSubmitting={isSubmitting}
    >
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Đánh giá khách hàng</CardTitle>
            <p className="text-xs text-slate-500 mt-1">Kéo thả để sắp xếp thứ tự hiển thị</p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={handleAddTestimonial} className="gap-2">
            <Plus size={14} /> Thêm
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {testimonials.map((item, idx) => (
            <div 
              key={item.id} 
              draggable
              onDragStart={() =>{  handleDragStart(item.id); }}
              onDragEnd={handleDragEnd}
              onDragOver={(e) =>{  handleDragOver(e, item.id); }}
              onDrop={(e) =>{  handleDrop(e, item.id); }}
              className={cn(
                "p-4 bg-slate-50 dark:bg-slate-800 rounded-lg space-y-3 transition-all",
                draggedId === item.id && "opacity-50 scale-[0.98]",
                dragOverId === item.id && "ring-2 ring-blue-500 ring-offset-2"
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GripVertical size={16} className="text-slate-400 cursor-grab active:cursor-grabbing" />
                  <Label>Đánh giá {idx + 1}</Label>
                </div>
                <Button type="button" variant="ghost" size="icon" className="text-red-500 h-8 w-8" onClick={() => handleRemoveTestimonial(item.id)}>
                  <Trash2 size={14} />
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Input 
                    placeholder="Tên khách hàng" 
                    value={item.name} 
                    onChange={(e) =>{  setTestimonials(testimonials.map(t => t.id === item.id ? {...t, name: e.target.value} : t)); }} 
                  />
                  <p className="text-[10px] text-slate-400 mt-1">VD: Nguyễn Văn A</p>
                </div>
                <div>
                  <Input 
                    placeholder="Chức vụ / Công ty" 
                    value={item.role} 
                    onChange={(e) =>{  setTestimonials(testimonials.map(t => t.id === item.id ? {...t, role: e.target.value} : t)); }} 
                  />
                  <p className="text-[10px] text-slate-400 mt-1">VD: CEO, ABC Corp</p>
                </div>
              </div>
              <div>
                <textarea 
                  placeholder="Nội dung đánh giá chi tiết từ khách hàng..." 
                  value={item.content} 
                  onChange={(e) =>{  setTestimonials(testimonials.map(t => t.id === item.id ? {...t, content: e.target.value} : t)); }}
                  className="w-full min-h-[80px] rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm resize-y" 
                />
                <p className="text-[10px] text-slate-400 mt-1">Nội dung chi tiết giúp tăng độ tin cậy (2-4 dòng)</p>
              </div>
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <Label className="text-sm">Đánh giá:</Label>
                  {[1,2,3,4,5].map(star => (
                    <Star 
                      key={star} 
                      size={22} 
                      className={cn("cursor-pointer transition-colors", star <= item.rating ? "text-yellow-400 fill-yellow-400" : "text-slate-300 hover:text-yellow-200")}
                      onClick={() =>{  setTestimonials(testimonials.map(t => t.id === item.id ? {...t, rating: star} : t)); }} 
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <User size={12} />
                  <span>Avatar: hiển thị chữ cái đầu tên</span>
                </div>
              </div>
            </div>
          ))}
          
          {testimonials.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
              <Star size={32} className="text-slate-300 mb-2" />
              <p className="text-sm text-slate-500 mb-3">Chưa có đánh giá nào</p>
              <Button type="button" variant="outline" size="sm" onClick={handleAddTestimonial} className="gap-2">
                <Plus size={14} /> Thêm đánh giá đầu tiên
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <TestimonialsPreview items={testimonials} brandColor={brandColor} selectedStyle={style} onStyleChange={setStyle} />
    </ComponentFormWrapper>
  );
}
