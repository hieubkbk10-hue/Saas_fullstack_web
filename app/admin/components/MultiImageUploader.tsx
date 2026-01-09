'use client';

import React, { useState, useRef, useCallback, DragEvent } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Upload, Trash2, Loader2, Link, Image as ImageIcon, ArrowUp, ArrowDown, Plus, GripVertical } from 'lucide-react';
import { toast } from 'sonner';
import { Button, Input, cn } from './ui';

const WEBP_QUALITY = 0.85;

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim() || 'image';
}

function generateFilename(originalName: string): string {
  const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
  const slugified = slugify(nameWithoutExt);
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 6);
  return `${slugified}-${timestamp}-${random}.webp`;
}

async function convertToWebP(file: File, quality: number = WEBP_QUALITY): Promise<Blob> {
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
        (blob) => blob ? resolve(blob) : resolve(file),
        'image/webp',
        quality
      );
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

export interface ImageItem {
  id: string | number;
  url: string;
  storageId?: string;
  [key: string]: unknown; // Allow extra fields like link, title, etc.
}

interface MultiImageUploaderProps<T extends ImageItem> {
  items: T[];
  onChange: (items: T[]) => void;
  folder?: string;
  className?: string;
  imageKey?: keyof T; // Which field contains the image URL (default: 'url')
  extraFields?: {
    key: keyof T;
    placeholder: string;
    type?: 'text' | 'url';
  }[];
  maxItems?: number;
  minItems?: number;
  aspectRatio?: 'square' | 'video' | 'banner' | 'auto';
  columns?: 1 | 2 | 3 | 4;
  showReorder?: boolean;
  addButtonText?: string;
  emptyText?: string;
}

export function MultiImageUploader<T extends ImageItem>({
  items,
  onChange,
  folder = 'home-components',
  className,
  imageKey = 'url' as keyof T,
  extraFields = [],
  maxItems = 20,
  minItems = 1,
  aspectRatio = 'video',
  columns = 1,
  showReorder = true,
  addButtonText = 'Thêm ảnh',
  emptyText = 'Chưa có ảnh nào',
}: MultiImageUploaderProps<T>) {
  const [uploadingIds, setUploadingIds] = useState<Set<string | number>>(new Set());
  const [urlModeIds, setUrlModeIds] = useState<Set<string | number>>(new Set());
  const [isDragging, setIsDragging] = useState(false);
  const [dragOverItemId, setDragOverItemId] = useState<string | number | null>(null);
  const inputRefs = useRef<Map<string | number, HTMLInputElement>>(new Map());
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);
  const saveImage = useMutation(api.storage.saveImage);
  const deleteImage = useMutation(api.storage.deleteImage);

  const aspectClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    banner: 'aspect-[3/1]',
    auto: 'min-h-[100px]',
  };

  const columnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
  };

  const handleFileUpload = useCallback(async (itemId: string | number, file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file hình ảnh');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Kích thước file tối đa 5MB');
      return;
    }

    setUploadingIds(prev => new Set(prev).add(itemId));

    try {
      const webpBlob = await convertToWebP(file, WEBP_QUALITY);
      const filename = generateFilename(file.name);
      const webpFile = new File([webpBlob], filename, { type: 'image/webp' });

      const uploadUrl = await generateUploadUrl();

      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: { 'Content-Type': webpFile.type },
        body: webpFile,
      });

      if (!response.ok) throw new Error('Upload failed');

      const { storageId } = await response.json();

      const img = new Image();
      const dimensions = await new Promise<{ width: number; height: number }>((resolve) => {
        img.onload = () => resolve({ width: img.width, height: img.height });
        img.src = URL.createObjectURL(webpFile);
      });

      const result = await saveImage({
        storageId: storageId as Id<"_storage">,
        filename,
        mimeType: 'image/webp',
        size: webpFile.size,
        width: dimensions.width,
        height: dimensions.height,
        folder,
      });

      onChange(items.map(item => 
        item.id === itemId 
          ? { ...item, [imageKey]: result.url || '', storageId } as T
          : item
      ));

      toast.success('Tải ảnh lên thành công');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Không thể tải ảnh lên');
    } finally {
      setUploadingIds(prev => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }
  }, [generateUploadUrl, saveImage, folder, imageKey, items, onChange]);

  const handleMultipleFiles = useCallback(async (files: FileList) => {
    const filesToUpload = Array.from(files);
    
    // If there's exactly 1 item with no image, upload first file to it
    const firstEmptyItem = items.find(item => !item[imageKey]);
    if (firstEmptyItem && filesToUpload.length > 0) {
      await handleFileUpload(firstEmptyItem.id, filesToUpload[0]);
      // Upload remaining files as new items
      const remainingFiles = filesToUpload.slice(1);
      if (remainingFiles.length > 0) {
        const remainingSlots = maxItems - items.length;
        const filesToAdd = remainingFiles.slice(0, remainingSlots);
        
        if (filesToAdd.length > 0) {
          const newItems: T[] = filesToAdd.map((_, index) => ({
            id: `new-${Date.now()}-${index}`,
            [imageKey]: '',
          } as unknown as T));

          const updatedItems = [...items, ...newItems];
          onChange(updatedItems);

          for (let i = 0; i < filesToAdd.length; i++) {
            await handleFileUpload(newItems[i].id, filesToAdd[i]);
          }
        }
      }
      return;
    }

    // Normal flow: create new items for all files
    const remainingSlots = maxItems - items.length;
    const filesToAdd = filesToUpload.slice(0, remainingSlots);

    if (filesToAdd.length < filesToUpload.length) {
      toast.warning(`Chỉ có thể thêm ${remainingSlots} ảnh nữa`);
    }

    if (filesToAdd.length === 0) {
      toast.error(`Đã đạt giới hạn ${maxItems} ảnh`);
      return;
    }

    const newItems: T[] = filesToAdd.map((_, index) => ({
      id: `new-${Date.now()}-${index}`,
      [imageKey]: '',
    } as unknown as T));

    const updatedItems = [...items, ...newItems];
    onChange(updatedItems);

    for (let i = 0; i < filesToAdd.length; i++) {
      await handleFileUpload(newItems[i].id, filesToAdd[i]);
    }
  }, [items, maxItems, imageKey, onChange, handleFileUpload]);

  const handleDragEnter = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set isDragging to false if leaving the container entirely
    if (dropZoneRef.current && !dropZoneRef.current.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
    setDragOverItemId(null);
  }, []);

  const handleDragOver = useCallback((e: DragEvent, itemId?: string | number) => {
    e.preventDefault();
    e.stopPropagation();
    if (itemId !== undefined) {
      setDragOverItemId(itemId);
    }
  }, []);

  const handleDrop = useCallback((e: DragEvent, itemId?: string | number) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setDragOverItemId(null);
    
    const files = e.dataTransfer.files;
    if (!files.length) return;
    
    if (itemId !== undefined) {
      // Drop on specific item
      if (files[0]) handleFileUpload(itemId, files[0]);
    } else {
      // Drop on container - add new items
      handleMultipleFiles(files);
    }
  }, [handleFileUpload, handleMultipleFiles]);

  const handleUrlChange = useCallback((itemId: string | number, url: string) => {
    onChange(items.map(item => 
      item.id === itemId ? { ...item, [imageKey]: url, storageId: undefined } as T : item
    ));
  }, [items, imageKey, onChange]);

  const handleExtraFieldChange = useCallback((itemId: string | number, fieldKey: keyof T, value: string) => {
    onChange(items.map(item => 
      item.id === itemId ? { ...item, [fieldKey]: value } as T : item
    ));
  }, [items, onChange]);

  const handleRemove = useCallback(async (itemId: string | number) => {
    if (items.length <= minItems) {
      toast.error(`Cần tối thiểu ${minItems} mục`);
      return;
    }

    const item = items.find(i => i.id === itemId);
    if (item?.storageId) {
      try {
        await deleteImage({ storageId: item.storageId as Id<"_storage"> });
      } catch (error) {
        console.error('Delete error:', error);
      }
    }

    onChange(items.filter(i => i.id !== itemId));
  }, [items, minItems, deleteImage, onChange]);

  const handleMove = useCallback((index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === items.length - 1)) return;
    const newItems = [...items];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    [newItems[index], newItems[swapIndex]] = [newItems[swapIndex], newItems[index]];
    onChange(newItems);
  }, [items, onChange]);

  const handleAdd = useCallback(() => {
    if (items.length >= maxItems) {
      toast.error(`Tối đa ${maxItems} mục`);
      return;
    }
    const newItem = {
      id: `new-${Date.now()}`,
      [imageKey]: '',
      ...extraFields.reduce((acc, field) => ({ ...acc, [field.key]: '' }), {}),
    } as unknown as T;
    onChange([...items, newItem]);
  }, [items, maxItems, imageKey, extraFields, onChange]);

  const toggleUrlMode = useCallback((itemId: string | number) => {
    setUrlModeIds(prev => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  }, []);

  const inputId = `multi-image-input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div 
      ref={dropZoneRef}
      className={cn('space-y-4', className)}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={(e) => handleDragOver(e)}
      onDrop={(e) => handleDrop(e)}
    >
      {/* Drop zone for adding new images */}
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 cursor-pointer",
          isDragging 
            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-[1.02]" 
            : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
        )}
        onClick={() => document.getElementById(inputId)?.click()}
      >
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => e.target.files && handleMultipleFiles(e.target.files)}
          className="hidden"
          id={inputId}
        />
        <Upload size={32} className={cn("mx-auto mb-3 transition-colors", isDragging ? "text-blue-500" : "text-slate-400")} />
        <p className={cn("text-sm font-medium", isDragging ? "text-blue-600" : "text-slate-600 dark:text-slate-300")}>
          {isDragging ? 'Thả ảnh vào đây!' : 'Kéo thả ảnh hoặc click để chọn'}
        </p>
        <p className="text-xs text-slate-400 mt-1">PNG, JPG, GIF - Tự động chuyển WebP</p>
      </div>

      {/* Items grid */}
      {items.length > 0 ? (
        <div className={cn('grid gap-4', columnClasses[columns])}>
          {items.map((item, index) => {
            const imageUrl = item[imageKey] as string;
            const isUploading = uploadingIds.has(item.id);
            const isUrlMode = urlModeIds.has(item.id);

            return (
              <div
                key={item.id}
                className={cn(
                  "bg-slate-50 dark:bg-slate-800 rounded-lg p-3 space-y-3 transition-all duration-200",
                  dragOverItemId === item.id && "ring-2 ring-blue-500 ring-offset-2 scale-[1.02]"
                )}
                onDrop={(e) => handleDrop(e, item.id)}
                onDragOver={(e) => handleDragOver(e, item.id)}
                onDragLeave={() => setDragOverItemId(null)}
              >
                {/* Image preview / upload area */}
                <div className="flex gap-3">
                  {showReorder && (
                    <div className="flex flex-col justify-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        disabled={index === 0}
                        onClick={() => handleMove(index, 'up')}
                      >
                        <ArrowUp size={12} />
                      </Button>
                      <GripVertical size={14} className="mx-auto text-slate-400" />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        disabled={index === items.length - 1}
                        onClick={() => handleMove(index, 'down')}
                      >
                        <ArrowDown size={12} />
                      </Button>
                    </div>
                  )}

                  <div
                    className={cn(
                      'relative flex-shrink-0 w-32 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 cursor-pointer',
                      aspectClasses[aspectRatio]
                    )}
                    onClick={() => !isUploading && inputRefs.current.get(item.id)?.click()}
                  >
                    {imageUrl ? (
                      <img src={imageUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-700">
                        <ImageIcon size={24} className="text-slate-400" />
                      </div>
                    )}
                    {isUploading && (
                      <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 flex items-center justify-center">
                        <Loader2 size={20} className="animate-spin text-blue-500" />
                      </div>
                    )}
                    <input
                      ref={(el) => { if (el) inputRefs.current.set(item.id, el); }}
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files?.[0] && handleFileUpload(item.id, e.target.files[0])}
                      className="hidden"
                    />
                  </div>

                  <div className="flex-1 space-y-2">
                    {/* Toggle URL mode */}
                    <div className="flex gap-2 mb-2">
                      <button
                        type="button"
                        onClick={() => !isUrlMode && toggleUrlMode(item.id)}
                        className={cn(
                          'flex items-center gap-1 px-2 py-1 text-xs rounded',
                          !isUrlMode ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30' : 'bg-slate-100 text-slate-500 dark:bg-slate-700'
                        )}
                      >
                        <Upload size={12} /> Upload
                      </button>
                      <button
                        type="button"
                        onClick={() => isUrlMode || toggleUrlMode(item.id)}
                        className={cn(
                          'flex items-center gap-1 px-2 py-1 text-xs rounded',
                          isUrlMode ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30' : 'bg-slate-100 text-slate-500 dark:bg-slate-700'
                        )}
                      >
                        <Link size={12} /> URL
                      </button>
                    </div>

                    {isUrlMode && (
                      <Input
                        value={imageUrl}
                        onChange={(e) => handleUrlChange(item.id, e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        className="h-8 text-sm"
                      />
                    )}

                    {/* Extra fields */}
                    {extraFields.map((field) => (
                      <Input
                        key={String(field.key)}
                        value={String(item[field.key] || '')}
                        onChange={(e) => handleExtraFieldChange(item.id, field.key, e.target.value)}
                        placeholder={field.placeholder}
                        className="h-8 text-sm"
                      />
                    ))}
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500 hover:text-red-600 flex-shrink-0"
                    onClick={() => handleRemove(item.id)}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 text-slate-500">{emptyText}</div>
      )}

      {/* Add button */}
      {items.length < maxItems && (
        <Button type="button" variant="outline" size="sm" onClick={handleAdd} className="w-full gap-2">
          <Plus size={14} /> {addButtonText}
        </Button>
      )}
    </div>
  );
}
