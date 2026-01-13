'use client';

import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { cn, Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from '../../../components/ui';
import { ComponentFormWrapper, useComponentForm, useBrandColor } from '../shared';
import { TeamPreview, type TeamStyle } from '../../previews';

interface TeamMember {
  id: number;
  name: string;
  role: string;
  avatar: string;
  bio: string;
  facebook: string;
  linkedin: string;
  twitter: string;
  email: string;
}

export default function TeamCreatePage() {
  const { title, setTitle, active, setActive, handleSubmit, isSubmitting } = useComponentForm('Đội ngũ của chúng tôi', 'Team');
  const brandColor = useBrandColor();
  
  const [members, setMembers] = useState<TeamMember[]>([
    { id: 1, name: 'Nguyễn Văn A', role: 'CEO & Founder', avatar: '', bio: 'Người sáng lập với 15+ năm kinh nghiệm.', facebook: '', linkedin: '', twitter: '', email: '' },
    { id: 2, name: 'Trần Thị B', role: 'CTO', avatar: '', bio: 'Chuyên gia công nghệ và đổi mới sáng tạo.', facebook: '', linkedin: '', twitter: '', email: '' },
    { id: 3, name: 'Lê Văn C', role: 'Design Lead', avatar: '', bio: 'Đam mê thiết kế trải nghiệm người dùng.', facebook: '', linkedin: '', twitter: '', email: '' },
  ]);

  const [style, setStyle] = useState<TeamStyle>('grid');

  const handleAddMember = () => {
    setMembers([...members, { 
      id: Date.now(), 
      name: '', 
      role: '', 
      avatar: '', 
      bio: '',
      facebook: '',
      linkedin: '',
      twitter: '',
      email: ''
    }]);
  };

  const handleRemoveMember = (id: number) => {
    if (members.length > 1) {
      setMembers(members.filter(m => m.id !== id));
    }
  };

  const updateMember = (id: number, field: keyof TeamMember, value: string) => {
    setMembers(members.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const onSubmit = (e: React.FormEvent) => {
    handleSubmit(e, { 
      members: members.map(m => ({ 
        name: m.name, 
        role: m.role, 
        avatar: m.avatar, 
        bio: m.bio,
        facebook: m.facebook,
        linkedin: m.linkedin,
        twitter: m.twitter,
        email: m.email
      })), 
      style 
    });
  };

  return (
    <ComponentFormWrapper
      type="Team"
      title={title}
      setTitle={setTitle}
      active={active}
      setActive={setActive}
      onSubmit={onSubmit}
      isSubmitting={isSubmitting}
    >
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Thành viên đội ngũ</CardTitle>
          <Button type="button" variant="outline" size="sm" onClick={handleAddMember} className="gap-2">
            <Plus size={14} /> Thêm
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {members.map((member, idx) => (
            <div key={member.id} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <Label className="font-medium">Thành viên {idx + 1}</Label>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  className="text-red-500 h-8 w-8" 
                  onClick={() => handleRemoveMember(member.id)}
                >
                  <Trash2 size={14} />
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <Input 
                  placeholder="Họ và tên" 
                  value={member.name} 
                  onChange={(e) => updateMember(member.id, 'name', e.target.value)} 
                />
                <Input 
                  placeholder="Chức vụ" 
                  value={member.role} 
                  onChange={(e) => updateMember(member.id, 'role', e.target.value)} 
                />
              </div>

              <Input 
                placeholder="URL ảnh đại diện" 
                value={member.avatar} 
                onChange={(e) => updateMember(member.id, 'avatar', e.target.value)} 
              />

              <textarea 
                placeholder="Giới thiệu ngắn..." 
                value={member.bio} 
                onChange={(e) => updateMember(member.id, 'bio', e.target.value)}
                className="w-full min-h-[60px] rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm" 
              />

              <div className="space-y-2">
                <Label className="text-xs text-slate-500">Social Links</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input 
                    placeholder="Facebook URL" 
                    value={member.facebook} 
                    onChange={(e) => updateMember(member.id, 'facebook', e.target.value)} 
                    className="text-xs"
                  />
                  <Input 
                    placeholder="LinkedIn URL" 
                    value={member.linkedin} 
                    onChange={(e) => updateMember(member.id, 'linkedin', e.target.value)} 
                    className="text-xs"
                  />
                  <Input 
                    placeholder="Twitter URL" 
                    value={member.twitter} 
                    onChange={(e) => updateMember(member.id, 'twitter', e.target.value)} 
                    className="text-xs"
                  />
                  <Input 
                    placeholder="Email" 
                    value={member.email} 
                    onChange={(e) => updateMember(member.id, 'email', e.target.value)} 
                    className="text-xs"
                  />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <TeamPreview members={members} brandColor={brandColor} selectedStyle={style} onStyleChange={setStyle} />
    </ComponentFormWrapper>
  );
}
