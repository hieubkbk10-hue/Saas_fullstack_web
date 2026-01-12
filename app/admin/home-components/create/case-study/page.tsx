'use client';

import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from '../../../components/ui';
import { ComponentFormWrapper, useComponentForm, useBrandColor } from '../shared';
import { CaseStudyPreview, CaseStudyStyle } from '../../previews';
import { SettingsImageUploader } from '../../../components/SettingsImageUploader';

interface Project {
  id: string | number;
  title: string;
  category: string;
  image: string;
  description: string;
  link: string;
}

export default function CaseStudyCreatePage() {
  const { title, setTitle, active, setActive, handleSubmit, isSubmitting } = useComponentForm('Dự án thực tế', 'CaseStudy');
  const brandColor = useBrandColor();
  const [caseStudyStyle, setCaseStudyStyle] = useState<CaseStudyStyle>('grid');
  
  const [projects, setProjects] = useState<Project[]>([
    { id: 'project-1', title: 'Dự án Website ABC Corp', category: 'Website', image: '', description: 'Thiết kế và phát triển website doanh nghiệp', link: '' },
    { id: 'project-2', title: 'Ứng dụng Mobile XYZ', category: 'Mobile App', image: '', description: 'Ứng dụng đặt hàng cho chuỗi F&B', link: '' }
  ]);

  const handleAddProject = () => {
    setProjects([...projects, { 
      id: `project-${Date.now()}`, 
      title: '', 
      category: '', 
      image: '', 
      description: '', 
      link: '' 
    }]);
  };

  const handleRemoveProject = (id: string | number) => {
    if (projects.length > 1) {
      setProjects(projects.filter(p => p.id !== id));
    }
  };

  const updateProject = (id: string | number, field: keyof Project, value: string) => {
    setProjects(projects.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const onSubmit = (e: React.FormEvent) => {
    handleSubmit(e, { 
      projects: projects.map(p => ({ title: p.title, category: p.category, image: p.image, description: p.description, link: p.link })),
      style: caseStudyStyle
    });
  };

  return (
    <ComponentFormWrapper
      type="CaseStudy"
      title={title}
      setTitle={setTitle}
      active={active}
      setActive={setActive}
      onSubmit={onSubmit}
      isSubmitting={isSubmitting}
    >
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Dự án tiêu biểu</CardTitle>
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={handleAddProject} 
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
                  onClick={() => handleRemoveProject(project.id)}
                  disabled={projects.length <= 1}
                >
                  <Trash2 size={14} />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left: Image upload */}
                <div>
                  <Label className="text-sm mb-2 block">Hình ảnh dự án</Label>
                  <SettingsImageUploader
                    value={project.image}
                    onChange={(url) => updateProject(project.id, 'image', url || '')}
                    folder="case-studies"
                    previewSize="lg"
                  />
                </div>
                
                {/* Right: Info fields */}
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-slate-500">Tên dự án</Label>
                      <Input 
                        placeholder="VD: Website ABC Corp" 
                        value={project.title} 
                        onChange={(e) => updateProject(project.id, 'title', e.target.value)} 
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-slate-500">Danh mục</Label>
                      <Input 
                        placeholder="VD: Website, Mobile..." 
                        value={project.category} 
                        onChange={(e) => updateProject(project.id, 'category', e.target.value)} 
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-slate-500">Mô tả ngắn</Label>
                    <Input 
                      placeholder="Mô tả ngắn về dự án" 
                      value={project.description} 
                      onChange={(e) => updateProject(project.id, 'description', e.target.value)} 
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-slate-500">Link chi tiết</Label>
                    <Input 
                      placeholder="https://example.com/project" 
                      value={project.link} 
                      onChange={(e) => updateProject(project.id, 'link', e.target.value)} 
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <CaseStudyPreview 
        projects={projects.map((p, idx) => ({ 
          id: idx + 1, 
          title: p.title, 
          category: p.category, 
          image: p.image, 
          description: p.description, 
          link: p.link 
        }))} 
        brandColor={brandColor}
        selectedStyle={caseStudyStyle}
        onStyleChange={setCaseStudyStyle}
      />
    </ComponentFormWrapper>
  );
}
