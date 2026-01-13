'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { 
  Upload, Trash2, Loader2, Image as ImageIcon, X, Check,
  // Common category icons
  ShoppingBag, Shirt, Smartphone, Laptop, Watch, Home, Car, Utensils,
  Flower2, Baby, Dumbbell, Book, Music, Camera, Gamepad2, Plane,
  Heart, Gift, Sparkles, Crown, Diamond, Star, Sun, Moon,
  Coffee, Pizza, Cake, Wine, Apple, Leaf, TreeDeciduous,
  Dog, Cat, Bird, Fish, Palette, Brush, Scissors, Hammer,
  Wrench, Zap, Wifi, Headphones, Tv, Speaker, Package, Box,
  Truck, Building2, Store, Briefcase, GraduationCap, Stethoscope
} from 'lucide-react';
import { toast } from 'sonner';
import { Button, Input, Label, cn } from './ui';

// Available icons for categories
const CATEGORY_ICONS = [
  { name: 'shopping-bag', icon: ShoppingBag, label: 'Túi mua sắm' },
  { name: 'shirt', icon: Shirt, label: 'Thời trang' },
  { name: 'smartphone', icon: Smartphone, label: 'Điện thoại' },
  { name: 'laptop', icon: Laptop, label: 'Laptop' },
  { name: 'watch', icon: Watch, label: 'Đồng hồ' },
  { name: 'home', icon: Home, label: 'Nhà cửa' },
  { name: 'car', icon: Car, label: 'Xe cộ' },
  { name: 'utensils', icon: Utensils, label: 'Ẩm thực' },
  { name: 'flower', icon: Flower2, label: 'Hoa' },
  { name: 'baby', icon: Baby, label: 'Mẹ & Bé' },
  { name: 'dumbbell', icon: Dumbbell, label: 'Thể thao' },
  { name: 'book', icon: Book, label: 'Sách' },
  { name: 'music', icon: Music, label: 'Âm nhạc' },
  { name: 'camera', icon: Camera, label: 'Máy ảnh' },
  { name: 'gamepad', icon: Gamepad2, label: 'Game' },
  { name: 'plane', icon: Plane, label: 'Du lịch' },
  { name: 'heart', icon: Heart, label: 'Yêu thích' },
  { name: 'gift', icon: Gift, label: 'Quà tặng' },
  { name: 'sparkles', icon: Sparkles, label: 'Làm đẹp' },
  { name: 'crown', icon: Crown, label: 'Cao cấp' },
  { name: 'diamond', icon: Diamond, label: 'Trang sức' },
  { name: 'star', icon: Star, label: 'Nổi bật' },
  { name: 'sun', icon: Sun, label: 'Mùa hè' },
  { name: 'moon', icon: Moon, label: 'Đêm' },
  { name: 'coffee', icon: Coffee, label: 'Cà phê' },
  { name: 'pizza', icon: Pizza, label: 'Đồ ăn' },
  { name: 'cake', icon: Cake, label: 'Bánh' },
  { name: 'wine', icon: Wine, label: 'Đồ uống' },
  { name: 'apple', icon: Apple, label: 'Trái cây' },
  { name: 'leaf', icon: Leaf, label: 'Thiên nhiên' },
  { name: 'tree', icon: TreeDeciduous, label: 'Cây cối' },
  { name: 'dog', icon: Dog, label: 'Thú cưng' },
  { name: 'cat', icon: Cat, label: 'Mèo' },
  { name: 'bird', icon: Bird, label: 'Chim' },
  { name: 'fish', icon: Fish, label: 'Cá' },
  { name: 'palette', icon: Palette, label: 'Nghệ thuật' },
  { name: 'brush', icon: Brush, label: 'Vẽ' },
  { name: 'scissors', icon: Scissors, label: 'Cắt may' },
  { name: 'hammer', icon: Hammer, label: 'Dụng cụ' },
  { name: 'wrench', icon: Wrench, label: 'Sửa chữa' },
  { name: 'zap', icon: Zap, label: 'Điện' },
  { name: 'wifi', icon: Wifi, label: 'Công nghệ' },
  { name: 'headphones', icon: Headphones, label: 'Tai nghe' },
  { name: 'tv', icon: Tv, label: 'TV' },
  { name: 'speaker', icon: Speaker, label: 'Loa' },
  { name: 'package', icon: Package, label: 'Sản phẩm' },
  { name: 'box', icon: Box, label: 'Hộp' },
  { name: 'truck', icon: Truck, label: 'Vận chuyển' },
  { name: 'building', icon: Building2, label: 'Văn phòng' },
  { name: 'store', icon: Store, label: 'Cửa hàng' },
  { name: 'briefcase', icon: Briefcase, label: 'Công việc' },
  { name: 'graduation', icon: GraduationCap, label: 'Giáo dục' },
  { name: 'medical', icon: Stethoscope, label: 'Y tế' },
];

export function getCategoryIcon(name: string) {
  return CATEGORY_ICONS.find(i => i.name === name);
}

export function renderCategoryIcon(name: string, size: number = 24, className?: string) {
  const iconData = getCategoryIcon(name);
  if (!iconData) return null;
  const IconComponent = iconData.icon;
  return <IconComponent size={size} className={className} />;
}

// Slugify filename
function slugifyFilename(filename: string): string {
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

// Compress image to WebP
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
        (blob) => blob ? resolve(blob) : reject(new Error('Failed to compress')),
        'image/webp',
        quality
      );
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

type ImageMode = 'default' | 'icon' | 'upload' | 'url';

interface CategoryImageSelectorProps {
  value: string;
  onChange: (value: string, mode: ImageMode) => void;
  categoryImage?: string;
  brandColor?: string;
  className?: string;
}

export function CategoryImageSelector({
  value,
  onChange,
  categoryImage,
  brandColor = '#3b82f6',
  className,
}: CategoryImageSelectorProps) {
  // Determine current mode from value
  const getInitialMode = (): ImageMode => {
    if (!value) return 'default';
    if (value.startsWith('icon:')) return 'icon';
    if (value.startsWith('http') || value.startsWith('/')) return 'url';
    if (value.startsWith('data:') || value.includes('convex')) return 'upload';
    return 'default';
  };

  const [mode, setMode] = useState<ImageMode>(getInitialMode);
  const [selectedIcon, setSelectedIcon] = useState<string>(value.startsWith('icon:') ? value.replace('icon:', '') : '');
  const [urlInput, setUrlInput] = useState<string>(getInitialMode() === 'url' ? value : '');
  const [uploadedUrl, setUploadedUrl] = useState<string>(getInitialMode() === 'upload' ? value : '');
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);
  const saveImage = useMutation(api.storage.saveImage);

  // Sync with value prop
  useEffect(() => {
    const newMode = getInitialMode();
    setMode(newMode);
    if (newMode === 'icon') {
      setSelectedIcon(value.replace('icon:', ''));
    } else if (newMode === 'url') {
      setUrlInput(value);
    } else if (newMode === 'upload') {
      setUploadedUrl(value);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const handleModeChange = (newMode: ImageMode) => {
    setMode(newMode);
    setShowIconPicker(false);
    if (newMode === 'default') {
      onChange('', 'default');
    } else if (newMode === 'icon' && selectedIcon) {
      onChange(`icon:${selectedIcon}`, 'icon');
    } else if (newMode === 'url' && urlInput) {
      onChange(urlInput, 'url');
    } else if (newMode === 'upload' && uploadedUrl) {
      onChange(uploadedUrl, 'upload');
    }
  };

  const handleIconSelect = (iconName: string) => {
    setSelectedIcon(iconName);
    onChange(`icon:${iconName}`, 'icon');
    setShowIconPicker(false);
  };

  const handleUrlApply = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim(), 'url');
    }
  };

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
      const compressedBlob = await compressToWebP(file, 0.85);
      const slugifiedName = slugifyFilename(file.name);
      const compressedFile = new File([compressedBlob], slugifiedName, { type: 'image/webp' });

      const uploadUrl = await generateUploadUrl();
      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'image/webp' },
        body: compressedFile,
      });

      if (!response.ok) throw new Error('Upload failed');

      const { storageId } = await response.json();

      const img = new Image();
      const dimensions = await new Promise<{ width: number; height: number }>((resolve) => {
        img.onload = () => resolve({ width: img.width, height: img.height });
        img.src = URL.createObjectURL(compressedFile);
      });

      const result = await saveImage({
        storageId: storageId as Id<"_storage">,
        filename: slugifiedName,
        mimeType: 'image/webp',
        size: compressedFile.size,
        width: dimensions.width,
        height: dimensions.height,
        folder: 'category-images',
      });

      const imageUrl = result.url || '';
      setUploadedUrl(imageUrl);
      onChange(imageUrl, 'upload');
      toast.success('Tải ảnh lên thành công');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Không thể tải ảnh lên');
    } finally {
      setIsUploading(false);
    }
  }, [generateUploadUrl, saveImage, onChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      setMode('upload');
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleRemoveUpload = () => {
    setUploadedUrl('');
    onChange('', 'default');
    setMode('default');
  };

  const currentIconData = getCategoryIcon(selectedIcon);

  return (
    <div className={cn('space-y-3', className)}>
      {/* Mode tabs */}
      <div className="flex flex-wrap gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
        <button
          type="button"
          onClick={() => handleModeChange('default')}
          className={cn(
            "flex-1 min-w-[70px] px-2 py-1.5 text-xs font-medium rounded-md transition-all",
            mode === 'default' 
              ? "bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-slate-100" 
              : "text-slate-500 hover:text-slate-700"
          )}
        >
          Mặc định
        </button>
        <button
          type="button"
          onClick={() => { setMode('icon'); setShowIconPicker(true); }}
          className={cn(
            "flex-1 min-w-[70px] px-2 py-1.5 text-xs font-medium rounded-md transition-all",
            mode === 'icon' 
              ? "bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-slate-100" 
              : "text-slate-500 hover:text-slate-700"
          )}
        >
          Icon
        </button>
        <button
          type="button"
          onClick={() => handleModeChange('upload')}
          className={cn(
            "flex-1 min-w-[70px] px-2 py-1.5 text-xs font-medium rounded-md transition-all",
            mode === 'upload' 
              ? "bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-slate-100" 
              : "text-slate-500 hover:text-slate-700"
          )}
        >
          Upload
        </button>
        <button
          type="button"
          onClick={() => handleModeChange('url')}
          className={cn(
            "flex-1 min-w-[70px] px-2 py-1.5 text-xs font-medium rounded-md transition-all",
            mode === 'url' 
              ? "bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-slate-100" 
              : "text-slate-500 hover:text-slate-700"
          )}
        >
          URL
        </button>
      </div>

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileSelect(file);
        }}
        className="hidden"
      />

      {/* Mode: Default - show category image preview */}
      {mode === 'default' && (
        <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
          <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
            {categoryImage ? (
              <img src={categoryImage} alt="" className="w-full h-full object-cover" />
            ) : (
              <ImageIcon size={20} className="text-slate-400" />
            )}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Sử dụng ảnh danh mục</p>
            <p className="text-xs text-slate-500">Lấy từ cài đặt danh mục gốc</p>
          </div>
        </div>
      )}

      {/* Mode: Icon picker */}
      {mode === 'icon' && (
        <div className="space-y-3">
          {/* Selected icon preview */}
          {selectedIcon && currentIconData && (
            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center text-white"
                style={{ backgroundColor: brandColor }}
              >
                {React.createElement(currentIconData.icon, { size: 24 })}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{currentIconData.label}</p>
                <p className="text-xs text-slate-500">Icon: {selectedIcon}</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowIconPicker(!showIconPicker)}
              >
                Đổi
              </Button>
            </div>
          )}

          {/* Icon grid picker */}
          {(showIconPicker || !selectedIcon) && (
            <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-3 max-h-[240px] overflow-y-auto">
              <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
                {CATEGORY_ICONS.map((iconData) => (
                  <button
                    key={iconData.name}
                    type="button"
                    onClick={() => handleIconSelect(iconData.name)}
                    title={iconData.label}
                    className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center transition-all",
                      selectedIcon === iconData.name
                        ? "ring-2 ring-offset-2 text-white"
                        : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                    )}
                    style={selectedIcon === iconData.name ? { backgroundColor: brandColor, '--tw-ring-color': brandColor } as React.CSSProperties : {}}
                  >
                    {React.createElement(iconData.icon, { size: 20 })}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mode: Upload */}
      {mode === 'upload' && (
        <div>
          {uploadedUrl ? (
            <div className="relative rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 aspect-square w-24">
              <img src={uploadedUrl} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
                <div className="flex gap-1">
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    onClick={() => inputRef.current?.click()}
                    className="h-8 w-8"
                  >
                    <Upload size={14} />
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={handleRemoveUpload}
                    className="h-8 w-8"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
              {isUploading && (
                <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 flex items-center justify-center">
                  <Loader2 size={20} className="animate-spin text-blue-500" />
                </div>
              )}
            </div>
          ) : (
            <div
              onClick={() => inputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={(e) => { e.preventDefault(); setIsDragOver(false); }}
              className={cn(
                'border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all h-24',
                isDragOver 
                  ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20' 
                  : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800',
                isUploading && 'pointer-events-none'
              )}
            >
              {isUploading ? (
                <Loader2 size={24} className="animate-spin text-blue-500" />
              ) : (
                <>
                  <Upload size={24} className={cn(isDragOver ? "text-blue-500" : "text-slate-400")} />
                  <span className="text-xs text-slate-500 mt-1">Kéo thả hoặc click</span>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Mode: URL */}
      {mode === 'url' && (
        <div className="flex gap-2">
          <Input 
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://example.com/image.jpg"
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
    </div>
  );
}

export { CATEGORY_ICONS };
