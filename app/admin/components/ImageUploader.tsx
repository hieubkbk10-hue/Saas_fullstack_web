'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Upload, Trash2, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button, cn } from './ui';

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
  return `${slugified}-${timestamp}.${ext}`;
}

// Compress image using canvas
async function compressImage(file: File, quality: number = 0.85): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }
      
      // Keep original dimensions
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw image
      ctx.drawImage(img, 0, 0);
      
      // Convert to blob with compression
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to compress image'));
          }
        },
        file.type === 'image/png' ? 'image/png' : 'image/jpeg',
        quality
      );
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

interface ImageUploaderProps {
  value?: string;
  onChange: (url: string | undefined, storageId?: string) => void;
  folder?: string;
  className?: string;
  aspectRatio?: 'square' | 'video' | 'auto';
  quality?: number;
}

export function ImageUploader({
  value,
  onChange,
  folder = 'general',
  className,
  aspectRatio = 'auto',
  quality = 0.85,
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | undefined>(value);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);
  const saveImage = useMutation(api.storage.saveImage);
  const deleteImage = useMutation(api.storage.deleteImage);
  
  const [currentStorageId, setCurrentStorageId] = useState<string | undefined>();

  // Sync preview with value prop when it changes
  useEffect(() => {
    setPreview(value);
  }, [value]);

  const handleFileSelect = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file hình ảnh');
      return;
    }
    
    // Max 5MB
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Kích thước file không được vượt quá 5MB');
      return;
    }
    
    setIsUploading(true);
    
    try {
      // Compress image
      const compressedBlob = await compressImage(file, quality);
      const slugifiedName = slugifyFilename(file.name);
      const compressedFile = new File([compressedBlob], slugifiedName, { type: compressedBlob.type });
      
      // Get upload URL
      const uploadUrl = await generateUploadUrl();
      
      // Upload to Convex storage
      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: { 'Content-Type': compressedFile.type },
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
      
      // Save to database
      const result = await saveImage({
        storageId: storageId as Id<"_storage">,
        filename: slugifiedName,
        mimeType: compressedFile.type,
        size: compressedFile.size,
        width: dimensions.width,
        height: dimensions.height,
        folder,
      });
      
      setPreview(result.url || undefined);
      setCurrentStorageId(storageId);
      onChange(result.url || undefined, storageId);
      toast.success('Tải ảnh lên thành công');
      
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Không thể tải ảnh lên');
    } finally {
      setIsUploading(false);
    }
  }, [generateUploadUrl, saveImage, folder, quality, onChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  const handleRemove = useCallback(async () => {
    if (currentStorageId) {
      try {
        await deleteImage({ storageId: currentStorageId as Id<"_storage"> });
      } catch (error) {
        console.error('Delete error:', error);
      }
    }
    setPreview(undefined);
    setCurrentStorageId(undefined);
    onChange(undefined);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }, [currentStorageId, deleteImage, onChange]);

  const aspectClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    auto: 'min-h-[160px]',
  };

  return (
    <div className={cn('relative', className)}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="hidden"
      />
      
      {preview ? (
        <div className={cn('relative rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700', aspectClasses[aspectRatio])}>
          <img 
            src={preview} 
            alt="" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
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
          {isUploading && (
            <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 flex items-center justify-center">
              <Loader2 size={24} className="animate-spin text-blue-500" />
            </div>
          )}
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className={cn(
            'border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors',
            aspectClasses[aspectRatio],
            isUploading && 'pointer-events-none'
          )}
        >
          {isUploading ? (
            <Loader2 size={24} className="animate-spin text-slate-400 mb-2" />
          ) : (
            <Upload size={24} className="text-slate-400 mb-2" />
          )}
          <span className="text-sm text-slate-500">
            {isUploading ? 'Đang tải lên...' : 'Kéo thả hoặc click để tải lên'}
          </span>
          <span className="text-xs text-slate-400 mt-1">PNG, JPG tối đa 5MB</span>
        </div>
      )}
    </div>
  );
}

// Simple version without database tracking (for Lexical editor)
export async function uploadImageToStorage(
  file: File,
  generateUploadUrl: () => Promise<string>,
  quality: number = 0.85
): Promise<{ storageId: string; url: string }> {
  // Compress
  const compressedBlob = await compressImage(file, quality);
  const slugifiedName = slugifyFilename(file.name);
  const compressedFile = new File([compressedBlob], slugifiedName, { type: compressedBlob.type });
  
  // Upload
  const uploadUrl = await generateUploadUrl();
  const response = await fetch(uploadUrl, {
    method: 'POST',
    headers: { 'Content-Type': compressedFile.type },
    body: compressedFile,
  });
  
  if (!response.ok) {
    throw new Error('Upload failed');
  }
  
  const { storageId } = await response.json();
  
  // Get URL from response - we need to fetch it separately
  // For now, return the storageId and the caller can get the URL
  return { storageId, url: '' };
}
