'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Input, Label } from '../../../components/ui';
import { ComponentFormWrapper, useComponentForm, useBrandColor } from '../shared';
import { VideoPreview, type VideoStyle } from '../../previews';
import { ImageFieldWithUpload } from '../../../components/ImageFieldWithUpload';
import { Video as VideoIcon } from 'lucide-react';

export default function VideoCreatePage() {
  const { title, setTitle, active, setActive, handleSubmit, isSubmitting } = useComponentForm('Video Giới thiệu', 'Video');
  const brandColor = useBrandColor();
  
  // Config states
  const [videoUrl, setVideoUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [heading, setHeading] = useState('Khám phá sản phẩm của chúng tôi');
  const [description, setDescription] = useState('Xem video để hiểu rõ hơn về những gì chúng tôi mang lại');
  const [badge, setBadge] = useState('');
  const [buttonText, setButtonText] = useState('');
  const [buttonLink, setButtonLink] = useState('');
  const [style, setStyle] = useState<VideoStyle>('centered');
  const [autoplay, setAutoplay] = useState(false);
  const [loop, setLoop] = useState(false);
  const [muted, setMuted] = useState(true);

  // Styles that support CTA/Badge
  const stylesWithCTA = ['split', 'fullwidth', 'cinema', 'minimal', 'parallax'];
  const showCTAConfig = stylesWithCTA.includes(style);

  const onSubmit = (e: React.FormEvent) => {
    void handleSubmit(e, { 
      videoUrl,
      thumbnailUrl,
      heading,
      description,
      badge,
      buttonText,
      buttonLink,
      style,
      autoplay,
      loop,
      muted,
    });
  };

  // Helper: Extract video type from URL
  const getVideoType = (url: string): 'youtube' | 'vimeo' | 'drive' | 'direct' | null => {
    if (!url) return null;
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
    if (url.includes('vimeo.com')) return 'vimeo';
    if (url.includes('drive.google.com')) return 'drive';
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
              placeholder="YouTube, YouTube Shorts, Google Drive hoặc link trực tiếp"
              required
            />
            {videoType && (
              <p className="text-xs text-slate-500">
                Loại video: <span className="font-medium capitalize" style={{ color: brandColor }}>{videoType}</span>
                {videoType === 'youtube' && ' - Hỗ trợ embed tự động (YouTube, Shorts)'}
                {videoType === 'vimeo' && ' - Hỗ trợ embed tự động'}
                {videoType === 'drive' && ' - Hỗ trợ Google Drive embed'}
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

      {/* CTA Config - chỉ hiển thị cho styles hỗ trợ */}
      {showCTAConfig && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">CTA & Badge</CardTitle>
            <p className="text-xs text-slate-500 mt-1">Cấu hình cho style {style}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Badge / Label</Label>
              <Input 
                value={badge} 
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBadge(e.target.value)} 
                placeholder="VD: Video mới, Giới thiệu, Featured..."
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nút CTA - Text</Label>
                <Input 
                  value={buttonText} 
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setButtonText(e.target.value)} 
                  placeholder="VD: Tìm hiểu thêm, Xem ngay..."
                />
              </div>
              <div className="space-y-2">
                <Label>Nút CTA - Link</Label>
                <Input 
                  value={buttonLink} 
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setButtonLink(e.target.value)} 
                  placeholder="/lien-he hoặc https://..."
                />
              </div>
            </div>
            <p className="text-xs text-slate-500">Để trống nếu không muốn hiển thị nút CTA</p>
          </CardContent>
        </Card>
      )}

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
          badge,
          buttonText,
          buttonLink,
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
