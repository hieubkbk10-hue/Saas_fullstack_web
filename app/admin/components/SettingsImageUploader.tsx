'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, Trash2, Loader2, Link, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Button, Input, cn } from './ui';

type InputMode = 'upload' | 'url';

interface SettingsImageUploaderProps {
  value?: string;
  onChange: (url: string | undefined) => void;
  folder?: string;
  className?: string;
  label?: string;
  aspectRatio?: 'square' | 'video' | 'auto';
  previewSize?: 'sm' | 'md' | 'lg';
}

export function SettingsImageUploader({
  value,
  onChange,
  folder = 'settings',
  className,
  label,
  aspectRatio = 'auto',
  previewSize = 'md',
}: SettingsImageUploaderProps) {
  const [mode, setMode] = useState<InputMode>('upload');
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [preview, setPreview] = useState<string | undefined>(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPreview(value);
    // If value is external URL, set to URL mode
    if (value && !value.startsWith('/uploads/')) {
      setMode('url');
      setUrlInput(value);
    }
  }, [value]);

  const handleFileUpload = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file hình ảnh');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Kích thước file tối đa 5MB');
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const result = await response.json();
      setPreview(result.url);
      onChange(result.url);
      toast.success('Tải ảnh lên thành công (WebP 85%)');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Không thể tải ảnh lên');
    } finally {
      setIsUploading(false);
    }
  }, [folder, onChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
  }, [handleFileUpload]);

  const handleUrlSubmit = useCallback(() => {
    if (!urlInput.trim()) return;
    
    // Basic URL validation
    try {
      new URL(urlInput);
    } catch {
      // Allow relative URLs
      if (!urlInput.startsWith('/')) {
        toast.error('URL không hợp lệ');
        return;
      }
    }

    setPreview(urlInput);
    onChange(urlInput);
    toast.success('Đã cập nhật URL');
  }, [urlInput, onChange]);

  const handleRemove = useCallback(() => {
    setPreview(undefined);
    setUrlInput('');
    onChange(undefined);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }, [onChange]);

  const previewSizes = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
  };

  const aspectClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    auto: 'min-h-[120px]',
  };

  return (
    <div className={cn('space-y-3', className)}>
      {label && (
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}

      {/* Mode Toggle */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setMode('upload')}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
            mode === 'upload'
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
          )}
        >
          <Upload size={14} />
          Upload
        </button>
        <button
          type="button"
          onClick={() => setMode('url')}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
            mode === 'url'
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
          )}
        >
          <Link size={14} />
          URL
        </button>
      </div>

      {/* Upload Mode */}
      {mode === 'upload' && (
        <>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleInputChange}
            className="hidden"
          />

          {preview ? (
            <div className="flex items-start gap-4">
              <div className={cn('relative rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700', previewSizes[previewSize])}>
                <img
                  src={preview}
                  alt=""
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="%23f1f5f9" width="100" height="100"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%2394a3b8" font-size="12">Error</text></svg>';
                  }}
                />
                {isUploading && (
                  <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 flex items-center justify-center">
                    <Loader2 size={20} className="animate-spin text-blue-500" />
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => inputRef.current?.click()}
                  disabled={isUploading}
                >
                  <Upload size={14} className="mr-1" />
                  Đổi ảnh
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemove}
                  className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                >
                  <Trash2 size={14} className="mr-1" />
                  Xóa
                </Button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => !isUploading && inputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={cn(
                'border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all',
                aspectClasses[aspectRatio],
                isDragging
                  ? 'border-blue-400 bg-blue-50 dark:bg-blue-950/30'
                  : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800',
                isUploading && 'pointer-events-none opacity-60'
              )}
            >
              {isUploading ? (
                <>
                  <Loader2 size={24} className="animate-spin text-blue-500 mb-2" />
                  <span className="text-sm text-slate-500">Đang xử lý...</span>
                </>
              ) : (
                <>
                  <ImageIcon size={24} className="text-slate-400 mb-2" />
                  <span className="text-sm text-slate-500">Kéo thả hoặc click để upload</span>
                  <span className="text-xs text-slate-400 mt-1">PNG, JPG, GIF → WebP 85%</span>
                </>
              )}
            </div>
          )}
        </>
      )}

      {/* URL Mode */}
      {mode === 'url' && (
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://example.com/image.png"
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleUrlSubmit();
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleUrlSubmit}
              disabled={!urlInput.trim()}
            >
              Áp dụng
            </Button>
          </div>

          {preview && (
            <div className="flex items-start gap-4">
              <div className={cn('relative rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700', previewSizes[previewSize])}>
                <img
                  src={preview}
                  alt=""
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="%23f1f5f9" width="100" height="100"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%2394a3b8" font-size="12">Error</text></svg>';
                  }}
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemove}
                className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
              >
                <Trash2 size={14} className="mr-1" />
                Xóa
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
