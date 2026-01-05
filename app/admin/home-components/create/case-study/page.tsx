'use client';

import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from '../../../components/ui';
import { ComponentFormWrapper, useComponentForm, BRAND_COLOR } from '../shared';
import { CaseStudyPreview } from '../../previews';

export default function CaseStudyCreatePage() {
  const { title, setTitle, active, setActive, handleSubmit } = useComponentForm('Dự án thực tế');
  
  const [projects, setProjects] = useState([
    { id: 1, title: 'Dự án Website ABC Corp', category: 'Website', image: '', description: 'Thiết kế và phát triển website doanh nghiệp', link: '' },
    { id: 2, title: 'Ứng dụng Mobile XYZ', category: 'Mobile App', image: '', description: 'Ứng dụng đặt hàng cho chuỗi F&B', link: '' }
  ]);

  return (
    <ComponentFormWrapper
      type="CaseStudy"
      title={title}
      setTitle={setTitle}
      active={active}
      setActive={setActive}
      onSubmit={handleSubmit}
    >
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Dự án tiêu biểu</CardTitle>
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={() => setProjects([...projects, { id: Date.now(), title: '', category: '', image: '', description: '', link: '' }])} 
            className="gap-2"
          >
            <Plus size={14} /> Thêm dự án
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {projects.map((project, idx) => (
            <div key={project.id} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <Label>Dự án {idx + 1}</Label>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  className="text-red-500 h-8 w-8" 
                  onClick={() => projects.length > 1 && setProjects(projects.filter(p => p.id !== project.id))}
                >
                  <Trash2 size={14} />
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input 
                  placeholder="Tên dự án" 
                  value={project.title} 
                  onChange={(e) => setProjects(projects.map(p => p.id === project.id ? {...p, title: e.target.value} : p))} 
                />
                <Input 
                  placeholder="Danh mục (Website, Mobile...)" 
                  value={project.category} 
                  onChange={(e) => setProjects(projects.map(p => p.id === project.id ? {...p, category: e.target.value} : p))} 
                />
              </div>
              <Input 
                placeholder="URL hình ảnh" 
                value={project.image} 
                onChange={(e) => setProjects(projects.map(p => p.id === project.id ? {...p, image: e.target.value} : p))} 
              />
              <Input 
                placeholder="Mô tả ngắn" 
                value={project.description} 
                onChange={(e) => setProjects(projects.map(p => p.id === project.id ? {...p, description: e.target.value} : p))} 
              />
              <Input 
                placeholder="Link chi tiết" 
                value={project.link} 
                onChange={(e) => setProjects(projects.map(p => p.id === project.id ? {...p, link: e.target.value} : p))} 
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <CaseStudyPreview projects={projects} brandColor={BRAND_COLOR} />
    </ComponentFormWrapper>
  );
}
