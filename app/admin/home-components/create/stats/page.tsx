'use client';

import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from '../../../components/ui';
import { ComponentFormWrapper, useComponentForm, BRAND_COLOR } from '../shared';
import { StatsPreview } from '../../previews';

export default function StatsCreatePage() {
  const { title, setTitle, active, setActive, handleSubmit } = useComponentForm('Thống kê');
  
  const [statsItems, setStatsItems] = useState([
    { id: 1, value: '1000+', label: 'Khách hàng' },
    { id: 2, value: '50+', label: 'Đối tác' },
    { id: 3, value: '99%', label: 'Hài lòng' },
    { id: 4, value: '24/7', label: 'Hỗ trợ' }
  ]);

  return (
    <ComponentFormWrapper
      type="Stats"
      title={title}
      setTitle={setTitle}
      active={active}
      setActive={setActive}
      onSubmit={handleSubmit}
    >
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Số liệu thống kê</CardTitle>
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={() => setStatsItems([...statsItems, { id: Date.now(), value: '', label: '' }])} 
            className="gap-2"
          >
            <Plus size={14} /> Thêm
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {statsItems.map((item, idx) => (
            <div key={item.id} className="flex gap-3 items-center">
              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-sm font-medium text-slate-500">
                {idx + 1}
              </div>
              <Input 
                placeholder="Số liệu (VD: 1000+)" 
                value={item.value} 
                onChange={(e) => setStatsItems(statsItems.map(s => s.id === item.id ? {...s, value: e.target.value} : s))} 
                className="flex-1" 
              />
              <Input 
                placeholder="Nhãn (VD: Khách hàng)" 
                value={item.label} 
                onChange={(e) => setStatsItems(statsItems.map(s => s.id === item.id ? {...s, label: e.target.value} : s))} 
                className="flex-1" 
              />
              <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                className="text-red-500 h-8 w-8" 
                onClick={() => statsItems.length > 1 && setStatsItems(statsItems.filter(s => s.id !== item.id))}
              >
                <Trash2 size={14} />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <StatsPreview items={statsItems} brandColor={BRAND_COLOR} />
    </ComponentFormWrapper>
  );
}
