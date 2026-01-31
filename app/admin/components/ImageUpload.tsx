'use client';

import React, { useCallback, useState } from 'react';
import Image from 'next/image';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { Loader2, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button, cn } from './ui';

const COMPRESSION_QUALITY = 0.85;

function slugifyFilename(filename: string): string {
  const ext = filename.split('.').pop() ?? '';
  const name = filename.replace(/\.[^/.]+$/, '');
  const slugified = name
    .toLowerCase()
    .normalize("NFD")
    .replaceAll(/[\u0300-\u036F]/g, "")
    .replaceAll(/[đĐ]/g, "d")
    .replaceAll(/[^a-z0-9\s-]/g, '')
    .replaceAll(/\s+/g, '-')
    .replaceAll(/-+/g, '-')
    .trim();
  const timestamp = Date.now();
  return `${slugified}-${timestamp}.${ext}`;
}

async function compressImage(file: File, quality: number = COMPRESSION_QUALITY): Promise<Blob> {
  if (!file.type.startsWith('image/') || file.type === 'image/png' || file.type === 'image/gif') {
    return file;
  }

  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(file);
        return;
      }
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(
        (blob) => {
          if (blob && blob.size < file.size) {
            resolve(blob);
          } else {
            resolve(file);
          }
        },
        'image/jpeg',
        quality
      );
    };
    img.onerror = () =>{  resolve(file); };
    img.src = URL.createObjectURL(file);
  });
}

interface ImageUploadProps {
  value?: string;
  onChange: (url: string | undefined) => void;
  folder?: string;
  className?: string;
}

export function ImageUpload({ value, onChange, folder = 'products', className }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);
  const saveImage = useMutation(api.storage.saveImage);

  const handleUpload = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file hình ảnh');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Kích thước file không được vượt quá 5MB');
      return;
    }

    setIsUploading(true);
    try {
      const compressedBlob = await compressImage(file);
      const slugifiedName = slugifyFilename(file.name);
      const compressedFile = new File([compressedBlob], slugifiedName, { type: compressedBlob.type });

      const uploadUrl = await generateUploadUrl();

      const response = await fetch(uploadUrl, {
        body: compressedFile,
        headers: { 'Content-Type': compressedFile.type },
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const { storageId } = await response.json();

      const result = await saveImage({
        filename: slugifiedName,
        folder,
        mimeType: compressedFile.type,
        size: compressedFile.size,
        storageId: storageId as Id<"_storage">,
      });

      if (result.url) {
        onChange(result.url);
        toast.success('Tải ảnh lên thành công');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Không thể tải ảnh lên');
    } finally {
      setIsUploading(false);
    }
  }, [generateUploadUrl, saveImage, folder, onChange]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {void handleUpload(file);}
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {void handleUpload(file);}
  }, [handleUpload]);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleRemove = () => {
    onChange(undefined);
  };

  if (value) {
    return (
      <div className={cn("relative h-40 w-full", className)}>
        <Image
          src={value}
          alt="Uploaded"
          fill
          sizes="(max-width: 768px) 100vw, 400px"
          className="object-cover rounded-lg border border-slate-200 dark:border-slate-700"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-800 shadow-sm"
          onClick={handleRemove}
        >
          <X size={16} className="text-red-500" />
        </Button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg p-6",
        "flex flex-col items-center justify-center cursor-pointer",
        "hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors",
        isUploading && "pointer-events-none opacity-50",
        className
      )}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onClick={() => {
        const input = document.getElementById('image-upload-input') as HTMLInputElement | null;
        input?.click();
      }}
    >
      <input
        id="image-upload-input"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
        disabled={isUploading}
      />
      {isUploading ? (
        <>
          <Loader2 size={24} className="text-orange-500 animate-spin mb-2" />
          <span className="text-sm text-slate-500">Đang tải lên...</span>
        </>
      ) : (
        <>
          <Upload size={24} className="text-slate-400 mb-2" />
          <span className="text-sm text-slate-500">Kéo thả hoặc click để tải lên</span>
          <span className="text-xs text-slate-400 mt-1">Tối đa 5MB, nén 85%</span>
        </>
      )}
    </div>
  );
}
