'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Plus, Trash2, Upload, ChevronDown, ChevronUp, GripVertical, Loader2, Users } from 'lucide-react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { toast } from 'sonner';
import { cn, Button, Card, CardContent, CardHeader, CardTitle, Input } from '../../../components/ui';
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

// Drag & Drop reorder hook
function useDragReorder<T extends { id: number }>(items: T[], setItems: (items: T[]) => void) {
  const [draggedId, setDraggedId] = useState<number | null>(null);
  const [dragOverId, setDragOverId] = useState<number | null>(null);

  const dragProps = (id: number) => ({
    draggable: true,
    onDragStart: () => setDraggedId(id),
    onDragEnd: () => { setDraggedId(null); setDragOverId(null); },
    onDragOver: (e: React.DragEvent) => { e.preventDefault(); if (draggedId !== id) setDragOverId(id); },
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      if (!draggedId || draggedId === id) return;
      const newItems = [...items];
      const draggedIdx = items.findIndex(i => i.id === draggedId);
      const dropIdx = items.findIndex(i => i.id === id);
      const [moved] = newItems.splice(draggedIdx, 1);
      newItems.splice(dropIdx, 0, moved);
      setItems(newItems);
      setDraggedId(null); 
      setDragOverId(null);
    }
  });

  return { draggedId, dragOverId, dragProps };
}

// Compact Avatar Upload Component
function AvatarUpload({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);
  const saveImage = useMutation(api.storage.saveImage);

  const slugifyFilename = (filename: string): string => {
    const name = filename.replace(/\.[^/.]+$/, '');
    const slugified = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[đĐ]/g, "d").replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();
    return `${slugified}-${Date.now()}.webp`;
  };

  const compressToWebP = async (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) { reject(new Error('Canvas error')); return; }
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('Compress failed')), 'image/webp', 0.85);
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  };

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/') || file.size > 10 * 1024 * 1024) {
      toast.error('File không hợp lệ (max 10MB)');
      return;
    }
    setIsUploading(true);
    try {
      const blob = await compressToWebP(file);
      const slugName = slugifyFilename(file.name);
      const webpFile = new File([blob], slugName, { type: 'image/webp' });
      const uploadUrl = await generateUploadUrl();
      const res = await fetch(uploadUrl, { method: 'POST', headers: { 'Content-Type': 'image/webp' }, body: webpFile });
      if (!res.ok) throw new Error('Upload failed');
      const { storageId } = await res.json();
      const img = new Image();
      const dims = await new Promise<{width: number; height: number}>((r) => { img.onload = () => r({width: img.width, height: img.height}); img.src = URL.createObjectURL(webpFile); });
      const result = await saveImage({ storageId: storageId as Id<"_storage">, filename: slugName, mimeType: 'image/webp', size: webpFile.size, width: dims.width, height: dims.height, folder: 'team-avatars' });
      onChange(result.url || '');
      toast.success('Tải ảnh thành công');
    } catch { toast.error('Lỗi tải ảnh'); } 
    finally { setIsUploading(false); }
  }, [generateUploadUrl, saveImage, onChange]);

  return (
    <div className="relative">
      <input ref={inputRef} type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} className="hidden" />
      <div
        onClick={() => !isUploading && inputRef.current?.click()}
        onDrop={(e) => { e.preventDefault(); setIsDragOver(false); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); }}
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        className={cn(
          "w-16 h-16 rounded-xl overflow-hidden cursor-pointer border-2 border-dashed transition-all flex-shrink-0",
          isDragOver ? "border-blue-400 bg-blue-50" : "border-slate-200 dark:border-slate-600 hover:border-slate-300",
          isUploading && "pointer-events-none"
        )}
      >
        {isUploading ? (
          <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-700">
            <Loader2 size={20} className="animate-spin text-blue-500" />
          </div>
        ) : value ? (
          <img src={value} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800">
            <Upload size={16} className="text-slate-400" />
          </div>
        )}
      </div>
      {value && (
        <button type="button" onClick={(e) => { e.stopPropagation(); onChange(''); }} className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600">×</button>
      )}
    </div>
  );
}

// Social Icon Button
const SocialIconBtn = ({ type, value, onChange }: { type: 'facebook' | 'linkedin' | 'twitter' | 'email'; value: string; onChange: (v: string) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const icons = {
    facebook: <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>,
    linkedin: <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>,
    twitter: <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
    email: <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
  };
  const placeholders = { facebook: 'facebook.com/...', linkedin: 'linkedin.com/in/...', twitter: 'x.com/...', email: 'email@...' };
  
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-7 h-7 rounded-md flex items-center justify-center transition-all",
          value ? "bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400" : "bg-slate-100 text-slate-400 dark:bg-slate-700 hover:bg-slate-200"
        )}
        title={type}
      >
        {icons[type]}
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 z-10 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg p-2 w-56">
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholders[type]}
            className="text-xs h-8"
            autoFocus
            onBlur={() => setTimeout(() => setIsOpen(false), 150)}
          />
        </div>
      )}
    </div>
  );
};

export default function TeamCreatePage() {
  const { title, setTitle, active, setActive, handleSubmit, isSubmitting } = useComponentForm('Đội ngũ của chúng tôi', 'Team');
  const brandColor = useBrandColor();
  
  const [members, setMembers] = useState<TeamMember[]>([
    { id: 1, name: 'Nguyễn Văn A', role: 'CEO & Founder', avatar: '', bio: '', facebook: '', linkedin: '', twitter: '', email: '' },
    { id: 2, name: 'Trần Thị B', role: 'CTO', avatar: '', bio: '', facebook: '', linkedin: '', twitter: '', email: '' },
  ]);
  const [style, setStyle] = useState<TeamStyle>('grid');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // Drag & Drop
  const { draggedId, dragOverId, dragProps } = useDragReorder(members, setMembers);

  const updateMember = (id: number, field: keyof TeamMember, value: string) => {
    setMembers(members.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const onSubmit = (e: React.FormEvent) => {
    handleSubmit(e, { 
      members: members.map(m => ({ name: m.name, role: m.role, avatar: m.avatar, bio: m.bio, facebook: m.facebook, linkedin: m.linkedin, twitter: m.twitter, email: m.email })), 
      style 
    });
  };

  return (
    <ComponentFormWrapper type="Team" title={title} setTitle={setTitle} active={active} setActive={setActive} onSubmit={onSubmit} isSubmitting={isSubmitting}>
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between py-3">
          <CardTitle className="text-sm font-medium">Thành viên ({members.length})</CardTitle>
          <Button type="button" variant="outline" size="sm" onClick={() => setMembers([...members, { id: Date.now(), name: '', role: '', avatar: '', bio: '', facebook: '', linkedin: '', twitter: '', email: '' }])} className="h-7 text-xs gap-1">
            <Plus size={12} /> Thêm
          </Button>
        </CardHeader>
        <CardContent className="space-y-2 pt-0">
          {/* Empty State */}
          {members.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: `${brandColor}10` }}>
                <Users size={28} style={{ color: brandColor }} />
              </div>
              <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-1">Chưa có thành viên nào</h4>
              <p className="text-sm text-slate-500 mb-4">Thêm thành viên đầu tiên để bắt đầu</p>
              <Button type="button" variant="outline" size="sm" onClick={() => setMembers([{ id: Date.now(), name: '', role: '', avatar: '', bio: '', facebook: '', linkedin: '', twitter: '', email: '' }])} className="gap-1">
                <Plus size={14} /> Thêm thành viên
              </Button>
            </div>
          )}
          
          {members.map((member) => (
            <div 
              key={member.id} 
              {...dragProps(member.id)}
              className={cn(
                "border rounded-lg overflow-hidden transition-all cursor-grab active:cursor-grabbing",
                draggedId === member.id && "opacity-50 scale-[0.98]",
                dragOverId === member.id && "ring-2 ring-blue-500 ring-offset-1",
                "border-slate-200 dark:border-slate-700"
              )}
            >
              {/* Compact Row */}
              <div className="flex items-center gap-3 p-3 bg-white dark:bg-slate-900">
                {/* Drag Handle */}
                <div className="flex-shrink-0 text-slate-300 dark:text-slate-600 hover:text-slate-400 cursor-grab">
                  <GripVertical size={16} />
                </div>
                
                <AvatarUpload value={member.avatar} onChange={(url) => updateMember(member.id, 'avatar', url)} />
                
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Họ và tên" 
                      value={member.name} 
                      onChange={(e) => updateMember(member.id, 'name', e.target.value)} 
                      className="h-8 text-sm font-medium"
                    />
                    <Input 
                      placeholder="Chức vụ" 
                      value={member.role} 
                      onChange={(e) => updateMember(member.id, 'role', e.target.value)} 
                      className="h-8 text-sm text-slate-500 w-32"
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <SocialIconBtn type="facebook" value={member.facebook} onChange={(v) => updateMember(member.id, 'facebook', v)} />
                    <SocialIconBtn type="linkedin" value={member.linkedin} onChange={(v) => updateMember(member.id, 'linkedin', v)} />
                    <SocialIconBtn type="twitter" value={member.twitter} onChange={(v) => updateMember(member.id, 'twitter', v)} />
                    <SocialIconBtn type="email" value={member.email} onChange={(v) => updateMember(member.id, 'email', v)} />
                    <div className="flex-1" />
                    <button
                      type="button"
                      onClick={() => setExpandedId(expandedId === member.id ? null : member.id)}
                      className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1"
                    >
                      Bio {expandedId === member.id ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </button>
                  </div>
                </div>

                <Button type="button" variant="ghost" size="icon" className="text-slate-400 hover:text-red-500 h-8 w-8 flex-shrink-0" onClick={() => setMembers(members.filter(m => m.id !== member.id))}>
                  <Trash2 size={14} />
                </Button>
              </div>

              {/* Expanded Bio */}
              {expandedId === member.id && (
                <div className="px-3 pb-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800">
                  <textarea 
                    placeholder="Giới thiệu ngắn về thành viên..." 
                    value={member.bio} 
                    onChange={(e) => updateMember(member.id, 'bio', e.target.value)}
                    className="w-full min-h-[60px] rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm mt-2" 
                  />
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <TeamPreview members={members} brandColor={brandColor} selectedStyle={style} onStyleChange={setStyle} />
    </ComponentFormWrapper>
  );
}
