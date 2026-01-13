'use client';

import React, { useState } from 'react';
import { cn, Card, CardContent, CardHeader, CardTitle, Input, Label, Button } from '../../../components/ui';
import { ComponentFormWrapper, useComponentForm, useBrandColor } from '../shared';
import { VideoPreview, type VideoStyle } from '../../previews';
import { ImageFieldWithUpload } from '../../../components/ImageFieldWithUpload';
import { Play, Video as VideoIcon } from 'lucide-react';

export default function VideoCreatePage() {
  const { title, setTitle, active, setActive, handleSubmit, isSubmitting } = useComponentForm('Video Giới thiệu', 'Video');
  const brandColor = useBrandColor();
  
  // Config states
  const [videoUrl, setVideoUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [heading, setHeading] = useState('Khám phá sản phẩm của chúng tôi');
  const [description, setDescription] = useState('Xem video để hiểu rõ hơn về những gì chúng tôi mang lại');
  const [style, setStyle] = useState<VideoStyle>('centered');
  const [autoplay, setAutoplay] = useState(false);
  const [loop, setLoop] = useState(false);
  const [muted, setMuted] = useState(true);

  const onSubmit = (e: React.FormEvent) => {
    handleSubmit(e, { 
      videoUrl,
      thumbnailUrl,
      heading,
      description,
      style,
      autoplay,
      loop,
      muted,
    });
  };

  // Helper: Extract video type from URL
  const getVideoType = (url: string): 'youtube' | 'vimeo' | 'direct' | null => {
    if (!url) return null;
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
    if (url.includes('vimeo.com')) return 'vimeo';
    return 'direct';
  };

  const videoType = getVideoType(videoUrl);

  return (
    <ComponentFormWrapper
      type="Video"
      title={title}
      setTitle={setTitle}
      active={active}
      setActive={setActive}
      onSubmit={onSubmit}
      isSubmitting={isSubmitting}
    >
      {/* Video URL */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <VideoIcon size={18} />
            Video
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>URL Video <span className="text-red-500">*</span></Label>
            <Input 
              type="url"
              value={videoUrl} 
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVideoUrl(e.target.value)} 
              placeholder="https://www.youtube.com/watch?v=... hoặc link video trực tiếp"
              required
            />
            {videoType && (
              <p className="text-xs text-slate-500">
                Loại video: <span className="font-medium capitalize" style={{ color: brandColor }}>{videoType}</span>
                {videoType === 'youtube' && ' - Hỗ trợ embed tự động'}
                {videoType === 'vimeo' && ' - Hỗ trợ embed tự động'}
                {videoType === 'direct' && ' - Sẽ sử dụng thẻ video HTML5'}
              </p>
            )}
          </div>

          <ImageFieldWithUpload
            label="Thumbnail (ảnh bìa)"
            value={thumbnailUrl}
            onChange={setThumbnailUrl}
            folder="video-thumbnails"
            aspectRatio="video"
            quality={0.85}
            placeholder="Để trống sẽ tự động lấy thumbnail từ YouTube/Vimeo"
          />
        </CardContent>
      </Card>

      {/* Content */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Nội dung</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Tiêu đề</Label>
            <Input 
              value={heading} 
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setHeading(e.target.value)} 
              placeholder="Tiêu đề video section"
            />
          </div>
          <div className="space-y-2">
            <Label>Mô tả ngắn</Label>
            <textarea 
              value={description} 
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)} 
              placeholder="Mô tả cho video section..."
              className="w-full min-h-[80px] rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Video Options */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Tùy chọn Video</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={autoplay} 
                onChange={(e) => setAutoplay(e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm">Tự động phát</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={loop} 
                onChange={(e) => setLoop(e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm">Lặp video</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={muted} 
                onChange={(e) => setMuted(e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm">Tắt tiếng</span>
            </label>
          </div>
          <p className="text-xs text-slate-500">
            Lưu ý: Để autoplay hoạt động trên hầu hết trình duyệt, video cần được đặt muted (tắt tiếng).
          </p>
        </CardContent>
      </Card>

      {/* Preview */}
      <VideoPreview 
        config={{
          videoUrl,
          thumbnailUrl,
          heading,
          description,
          autoplay,
          loop,
          muted,
        }}
        brandColor={brandColor}
        selectedStyle={style}
        onStyleChange={setStyle}
      />
    </ComponentFormWrapper>
  );
}
