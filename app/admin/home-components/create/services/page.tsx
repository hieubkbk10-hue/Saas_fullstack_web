'use client';

import React, { useState } from 'react';
import { Plus, Trash2, GripVertical, Briefcase, Shield, Star, Users, Phone, Target, Zap, Globe, Rocket, Settings, Layers, Cpu, Clock, MapPin, Mail, Building2, Check, Package } from 'lucide-react';
import { cn, Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from '../../../components/ui';
import { ComponentFormWrapper, useComponentForm, useBrandColor } from '../shared';
import { ServicesPreview, type ServicesStyle } from '../../previews';

// Available icons for services
const AVAILABLE_ICONS = ['Briefcase', 'Shield', 'Star', 'Users', 'Phone', 'Target', 'Zap', 'Globe', 'Rocket', 'Settings', 'Layers', 'Cpu', 'Clock', 'MapPin', 'Mail', 'Building2', 'Check', 'Package'];

export default function ServicesCreatePage() {
  const { title, setTitle, active, setActive, handleSubmit, isSubmitting } = useComponentForm('Dịch vụ chi tiết', 'Services');
  const brandColor = useBrandColor();
  
  const [servicesItems, setServicesItems] = useState([
    { id: 1, icon: 'Briefcase', title: 'Tư vấn chiến lược', description: 'Đội ngũ chuyên gia giàu kinh nghiệm' },
    { id: 2, icon: 'Shield', title: 'Bảo hành trọn đời', description: 'Cam kết chất lượng sản phẩm' },
    { id: 3, icon: 'Package', title: 'Giao hàng nhanh', description: 'Miễn phí vận chuyển toàn quốc' }
  ]);
  const [style, setStyle] = useState<ServicesStyle>('elegantGrid');

  // Drag & Drop state
  const [draggedId, setDraggedId] = useState<number | null>(null);
  const [dragOverId, setDragOverId] = useState<number | null>(null);

  const handleAddService = () => setServicesItems([...servicesItems, { id: Date.now(), icon: 'Star', title: '', description: '' }]);
  const handleRemoveService = (id: number) => servicesItems.length > 1 && setServicesItems(servicesItems.filter(s => s.id !== id));
  const handleUpdateService = (id: number, field: string, value: string) => {
    setServicesItems(servicesItems.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  // Drag handlers
  const handleDragStart = (id: number) => setDraggedId(id);
  const handleDragEnd = () => { setDraggedId(null); setDragOverId(null); };
  const handleDragOver = (e: React.DragEvent, id: number) => {
    e.preventDefault();
    if (draggedId !== id) setDragOverId(id);
  };
  const handleDrop = (e: React.DragEvent, targetId: number) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) return;
    const newItems = [...servicesItems];
    const draggedIdx = newItems.findIndex(i => i.id === draggedId);
    const targetIdx = newItems.findIndex(i => i.id === targetId);
    const [moved] = newItems.splice(draggedIdx, 1);
    newItems.splice(targetIdx, 0, moved);
    setServicesItems(newItems);
    setDraggedId(null);
    setDragOverId(null);
  };

  const onSubmit = (e: React.FormEvent) => {
    void handleSubmit(e, { items: servicesItems.map(s => ({ icon: s.icon, title: s.title, description: s.description })), style });
  };

  // Get icon component
  const getIconComponent = (iconName: string) => {
    const icons: Record<string, React.ComponentType<{ size?: number; style?: React.CSSProperties }>> = { Briefcase, Shield, Star, Users, Phone, Target, Zap, Globe, Rocket, Settings, Layers, Cpu, Clock, MapPin, Mail, Building2, Check, Package };
    return icons[iconName] || Star;
  };

  return (
    <ComponentFormWrapper
      type="Services"
      title={title}
      setTitle={setTitle}
      active={active}
      setActive={setActive}
      onSubmit={onSubmit}
      isSubmitting={isSubmitting}
    >
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Dịch vụ ({servicesItems.length})</CardTitle>
          <Button type="button" variant="outline" size="sm" onClick={handleAddService} className="gap-2">
            <Plus size={14} /> Thêm
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {servicesItems.map((item, idx) => {
            const IconComponent = getIconComponent(item.icon);
            return (
              <div 
                key={item.id} 
                draggable
                onDragStart={() => handleDragStart(item.id)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => handleDragOver(e, item.id)}
                onDrop={(e) => handleDrop(e, item.id)}
                className={cn(
                  "p-4 bg-slate-50 dark:bg-slate-800 rounded-lg space-y-3 border-2 transition-all cursor-grab active:cursor-grabbing",
                  draggedId === item.id && "opacity-50",
                  dragOverId === item.id && "border-blue-500",
                  !draggedId && !dragOverId && "border-transparent"
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <GripVertical size={16} className="text-slate-400 flex-shrink-0" />
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${brandColor}15` }}>
                      <IconComponent size={16} style={{ color: brandColor }} />
                    </div>
                    <Label className="font-medium">Dịch vụ {idx + 1}</Label>
                  </div>
                  <Button type="button" variant="ghost" size="icon" className="text-red-500 h-8 w-8 flex-shrink-0" onClick={() => handleRemoveService(item.id)}>
                    <Trash2 size={14} />
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <select 
                    value={item.icon} 
                    onChange={(e) => handleUpdateService(item.id, 'icon', e.target.value)}
                    className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                  >
                    {AVAILABLE_ICONS.map((icon) => (
                      <option key={icon} value={icon}>{icon}</option>
                    ))}
                  </select>
                  <Input 
                    placeholder="Tiêu đề" 
                    value={item.title} 
                    onChange={(e) => handleUpdateService(item.id, 'title', e.target.value)}
                    className="md:col-span-1"
                  />
                  <Input 
                    placeholder="Mô tả ngắn" 
                    value={item.description} 
                    onChange={(e) => handleUpdateService(item.id, 'description', e.target.value)}
                    className="md:col-span-2"
                  />
                </div>
              </div>
            );
          })}
          {servicesItems.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              <Briefcase size={32} className="mx-auto mb-2 opacity-50" />
              <p>Chưa có dịch vụ nào. Nhấn “Thêm” để bắt đầu.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <ServicesPreview items={servicesItems} brandColor={brandColor} componentType="Services" selectedStyle={style} onStyleChange={setStyle} />
    </ComponentFormWrapper>
  );
}
