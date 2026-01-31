'use client';

import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from '../../../components/ui';
import { ComponentFormWrapper, useBrandColor, useComponentForm } from '../shared';
import type { CareerStyle } from '../../previews';
import { CareerPreview } from '../../previews';

export default function CareerCreatePage() {
  const { title, setTitle, active, setActive, handleSubmit, isSubmitting } = useComponentForm('Tuyển dụng', 'Career');
  const brandColor = useBrandColor();
  
  const [careerStyle, setCareerStyle] = useState<CareerStyle>('cards');
  const [jobPositions, setJobPositions] = useState([
    { department: 'Engineering', description: '', id: 1, location: 'Hà Nội', salary: '15-25 triệu', title: 'Frontend Developer', type: 'Full-time' },
    { department: 'Design', description: '', id: 2, location: 'Remote', salary: '12-20 triệu', title: 'UI/UX Designer', type: 'Full-time' }
  ]);

  const onSubmit = (e: React.FormEvent) => {
    void handleSubmit(e, { jobs: jobPositions.map(j => ({ department: j.department, description: j.description, location: j.location, salary: j.salary, title: j.title, type: j.type })), style: careerStyle });
  };

  return (
    <ComponentFormWrapper
      type="Career"
      title={title}
      setTitle={setTitle}
      active={active}
      setActive={setActive}
      onSubmit={onSubmit}
      isSubmitting={isSubmitting}
    >
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Vị trí tuyển dụng</CardTitle>
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={() =>{  setJobPositions([...jobPositions, { department: '', description: '', id: Date.now(), location: '', salary: '', title: '', type: 'Full-time' }]); }} 
            className="gap-2"
          >
            <Plus size={14} /> Thêm vị trí
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {jobPositions.map((job, idx) => (
            <div key={job.id} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <Label>Vị trí {idx + 1}</Label>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  className="text-red-500 h-8 w-8" 
                  onClick={() => jobPositions.length > 1 && setJobPositions(jobPositions.filter(j => j.id !== job.id))}
                >
                  <Trash2 size={14} />
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input 
                  placeholder="Vị trí tuyển dụng" 
                  value={job.title} 
                  onChange={(e) =>{  setJobPositions(jobPositions.map(j => j.id === job.id ? {...j, title: e.target.value} : j)); }} 
                />
                <Input 
                  placeholder="Phòng ban" 
                  value={job.department} 
                  onChange={(e) =>{  setJobPositions(jobPositions.map(j => j.id === job.id ? {...j, department: e.target.value} : j)); }} 
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <Input 
                  placeholder="Địa điểm" 
                  value={job.location} 
                  onChange={(e) =>{  setJobPositions(jobPositions.map(j => j.id === job.id ? {...j, location: e.target.value} : j)); }} 
                />
                <select 
                  className="h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm" 
                  value={job.type} 
                  onChange={(e) =>{  setJobPositions(jobPositions.map(j => j.id === job.id ? {...j, type: e.target.value} : j)); }}
                >
                  <option>Full-time</option>
                  <option>Part-time</option>
                  <option>Contract</option>
                  <option>Internship</option>
                </select>
                <Input 
                  placeholder="Mức lương" 
                  value={job.salary} 
                  onChange={(e) =>{  setJobPositions(jobPositions.map(j => j.id === job.id ? {...j, salary: e.target.value} : j)); }} 
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <CareerPreview 
        jobs={jobPositions} 
        brandColor={brandColor}
        selectedStyle={careerStyle}
        onStyleChange={setCareerStyle}
      />
    </ComponentFormWrapper>
  );
}
