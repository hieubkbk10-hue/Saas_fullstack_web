'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Upload, Trash2, Loader2, Link2, ImageIcon, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button, Input, Label, cn } from './ui';

// Slugify filename
function slugifyFilename(filename: string): string {
  const ext = filename.split('.').pop() || '';
  const name = filename.replace(/\.[^/.]+$/, '');
  
  const slugified = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
  
  const timestamp = Date.now();
  return `${slugified}-${timestamp}.webp`;
}

// Compress image to WebP using canvas (85% quality)
async function compressToWebP(file: File, quality: number = 0.85): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }
      
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to compress image'));
          }
        },
        'image/webp',
        quality
      );
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

type InputMode = 'upload' | 'url';

interface ImageFieldWithUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onStorageIdChange?: (storageId: string | undefined) => void;
  folder?: string;
  label?: string;
  className?: string;
  aspectRatio?: 'square' | 'video' | 'banner' | 'auto';
  quality?: number;
  placeholder?: string;
}

export function ImageFieldWithUpload({
  value,
  onChange,
  onStorageIdChange,
  folder = 'home-components',
  label = 'Hình ảnh',
  className,
  aspectRatio = 'video',
  quality = 0.85,
  placeholder = 'https://example.com/image.jpg',
}: ImageFieldWithUploadProps) {
  const [mode, setMode] = useState<InputMode>(value?.startsWith('http') && !value?.includes('convex') ? 'url' : 'upload');
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [urlInput, setUrlInput] = useState(value || '');
  const [preview, setPreview] = useState<string | undefined>(value);
  const [currentStorageId, setCurrentStorageId] = useState<string | undefined>();
  const inputRef = useRef<HTMLInputElement>(null);
  
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);
  const saveImage = useMutation(api.storage.saveImage);
  const deleteImage = useMutation(api.storage.deleteImage);

  // Sync preview with value prop
  useEffect(() => {
    setPreview(value);
    if (value && !value.includes('convex')) {
      setUrlInput(value);
    }
  }, [value]);

  const handleFileSelect = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file hình ảnh');
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Kích thước file không được vượt quá 10MB');
      return;
    }
    
    setIsUploading(true);
    
    try {
      // Compress to WebP 85%
      const compressedBlob = await compressToWebP(file, quality);
      const slugifiedName = slugifyFilename(file.name);
      const compressedFile = new File([compressedBlob], slugifiedName, { type: 'image/webp' });
      
      // Get upload URL
      const uploadUrl = await generateUploadUrl();
      
      // Upload to Convex storage
      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'image/webp' },
        body: compressedFile,
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      const { storageId } = await response.json();
      
      // Get image dimensions
      const img = new Image();
      const dimensions = await new Promise<{ width: number; height: number }>((resolve) => {
        img.onload = () => resolve({ width: img.width, height: img.height });
        img.src = URL.createObjectURL(compressedFile);
      });
      
      // Save to database with folder for cleanup tracking
      const result = await saveImage({
        storageId: storageId as Id<"_storage">,
        filename: slugifiedName,
        mimeType: 'image/webp',
        size: compressedFile.size,
        width: dimensions.width,
        height: dimensions.height,
        folder,
      });
      
      const imageUrl = result.url || '';
      setPreview(imageUrl);
      setCurrentStorageId(storageId);
      onChange(imageUrl);
      onStorageIdChange?.(storageId);
      
      const savedKB = Math.round((file.size - compressedFile.size) / 1024);
      toast.success(`Tải ảnh lên thành công (tiết kiệm ${savedKB}KB)`);
      
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Không thể tải ảnh lên');
    } finally {
      setIsUploading(false);
    }
  }, [generateUploadUrl, saveImage, folder, quality, onChange, onStorageIdChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      setMode('upload');
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  const handleUrlChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setUrlInput(url);
  }, []);

  const handleUrlApply = useCallback(() => {
    if (urlInput.trim()) {
      setPreview(urlInput.trim());
      onChange(urlInput.trim());
      setCurrentStorageId(undefined);
      onStorageIdChange?.(undefined);
    }
  }, [urlInput, onChange, onStorageIdChange]);

  const handleRemove = useCallback(async () => {
    // Only delete from storage if it's an uploaded image
    if (currentStorageId) {
      try {
        await deleteImage({ storageId: currentStorageId as Id<"_storage"> });
        toast.success('Đã xóa ảnh');
      } catch (error) {
        console.error('Delete error:', error);
      }
    }
    setPreview(undefined);
    setUrlInput('');
    setCurrentStorageId(undefined);
    onChange('');
    onStorageIdChange?.(undefined);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }, [currentStorageId, deleteImage, onChange, onStorageIdChange]);

  const aspectClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    banner: 'aspect-[21/9]',
    auto: 'min-h-[180px]',
  };

  return (
    <div className={cn('space-y-3', className)}>
      {/* Label + Mode Toggle */}
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={cn(
              "px-3 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1.5",
              mode === 'upload' 
                ? "bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-slate-100" 
                : "text-slate-500 hover:text-slate-700"
            )}
          >
            <Upload size={12} /> Upload
          </button>
          <button
            type="button"
            onClick={() => setMode('url')}
            className={cn(
              "px-3 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1.5",
              mode === 'url' 
                ? "bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-slate-100" 
                : "text-slate-500 hover:text-slate-700"
            )}
          >
            <Link2 size={12} /> URL
          </button>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="hidden"
      />

      {/* URL Mode */}
      {mode === 'url' && (
        <div className="flex gap-2">
          <Input 
            value={urlInput}
            onChange={handleUrlChange}
            placeholder={placeholder}
            className="flex-1"
          />
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleUrlApply}
            disabled={!urlInput.trim()}
          >
            Áp dụng
          </Button>
        </div>
      )}

      {/* Upload Mode / Preview */}
      {preview ? (
        <div className={cn('relative rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700', aspectClasses[aspectRatio])}>
          <img 
            src={preview} 
            alt="Preview" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
            <div className="flex gap-2">
              {mode === 'upload' && (
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  onClick={() => inputRef.current?.click()}
                  className="h-10 w-10"
                >
                  <Upload size={18} />
                </Button>
              )}
              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={handleRemove}
                className="h-10 w-10"
              >
                <Trash2 size={18} />
              </Button>
            </div>
          </div>
          {isUploading && (
            <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 flex flex-col items-center justify-center">
              <Loader2 size={24} className="animate-spin text-blue-500 mb-2" />
              <span className="text-sm text-slate-600">Đang nén và tải lên...</span>
            </div>
          )}
          
        </div>
      ) : mode === 'upload' ? (
        <div
          onClick={() => inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            'border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all',
            aspectClasses[aspectRatio],
            isDragOver 
              ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20' 
              : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800',
            isUploading && 'pointer-events-none'
          )}
        >
          {isUploading ? (
            <>
              <Loader2 size={32} className="animate-spin text-blue-500 mb-2" />
              <span className="text-sm text-slate-600">Đang nén WebP 85%...</span>
            </>
          ) : (
            <>
              <Upload size={32} className={cn("mb-2", isDragOver ? "text-blue-500" : "text-slate-400")} />
              <span className="text-sm text-slate-600 font-medium">
                {isDragOver ? 'Thả ảnh vào đây' : 'Kéo thả hoặc click để tải lên'}
              </span>
              <span className="text-xs text-slate-400 mt-1">
                PNG, JPG, WebP tối đa 10MB • Tự động nén WebP 85%
              </span>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
