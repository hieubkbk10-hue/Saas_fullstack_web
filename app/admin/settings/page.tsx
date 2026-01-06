'use client';

import React, { useState, useEffect } from 'react';
import { Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { cn, Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from '../components/ui';
import { ModuleGuard } from '../components/ModuleGuard';

const hexToHSL = (hex: string): { h: number; s: number; l: number } => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return { h: 0, s: 0, l: 0 };
  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
};

const hslToHex = (h: number, s: number, l: number): string => {
  s /= 100; l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
};

const generateTintsShades = (hex: string): string[] => {
  const { h, s } = hexToHSL(hex);
  const lightnesses = [95, 85, 75, 65, 55, 45, 35, 25, 15, 5];
  return lightnesses.map(newL => hslToHex(h, s, newL));
};

type SettingsForm = {
  // General
  siteName: string;
  siteDescription: string;
  timezone: string;
  brandColor: string;
  // Contact
  email: string;
  hotline: string;
  address: string;
  facebook: string;
  zalo: string;
  googleMapsEmbed: string;
  // SEO
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  ogImage: string;
};

const defaultSettings: SettingsForm = {
  siteName: '',
  siteDescription: '',
  timezone: 'GMT+07:00',
  brandColor: '#3b82f6',
  email: '',
  hotline: '',
  address: '',
  facebook: '',
  zalo: '',
  googleMapsEmbed: '',
  metaTitle: '',
  metaDescription: '',
  metaKeywords: '',
  ogImage: '',
};

const settingsKeys = Object.keys(defaultSettings) as (keyof SettingsForm)[];

export default function SettingsPage() {
  return (
    <ModuleGuard moduleKey="settings">
      <SettingsContent />
    </ModuleGuard>
  );
}

function SettingsContent() {
  const [activeTab, setActiveTab] = useState('general');
  const [form, setForm] = useState<SettingsForm>(defaultSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const settingsData = useQuery(api.settings.getMultiple, { keys: settingsKeys });
  const setMultiple = useMutation(api.settings.setMultiple);

  const isLoading = settingsData === undefined;

  useEffect(() => {
    if (settingsData) {
      setForm(prev => {
        const newForm = { ...prev };
        for (const key of settingsKeys) {
          if (settingsData[key] !== null && settingsData[key] !== undefined) {
            newForm[key] = settingsData[key] as string;
          }
        }
        return newForm;
      });
      setHasChanges(false);
    }
  }, [settingsData]);

  const updateField = <K extends keyof SettingsForm>(key: K, value: SettingsForm[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const settingsToSave = settingsKeys.map(key => {
        let group = 'general';
        if (['email', 'hotline', 'address', 'facebook', 'zalo', 'googleMapsEmbed'].includes(key)) {
          group = 'contact';
        } else if (['metaTitle', 'metaDescription', 'metaKeywords', 'ogImage'].includes(key)) {
          group = 'seo';
        }
        return { key, value: form[key], group };
      });
      await setMultiple({ settings: settingsToSave });
      setHasChanges(false);
      toast.success('Đã lưu cài đặt thành công!');
    } catch {
      toast.error('Lỗi khi lưu cài đặt');
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: 'general', label: 'Chung' },
    { id: 'contact', label: 'Liên hệ' },
    { id: 'seo', label: 'SEO' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Cài đặt hệ thống</h1>
        <p className="text-slate-500">Quản lý các cấu hình chung cho website của bạn.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="flex flex-col space-y-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "text-left px-4 py-2 rounded-md text-sm font-medium transition-colors",
                  activeTab === tab.id ? "bg-white dark:bg-slate-800 shadow-sm text-blue-600" : "text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-800/50"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 space-y-6">
          {activeTab === 'general' && (
            <>
              <Card>
                <CardHeader><CardTitle>Thông tin chung</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Tên Website</Label>
                    <Input 
                      value={form.siteName} 
                      onChange={(e) => updateField('siteName', e.target.value)}
                      placeholder="VietAdmin Shop"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Mô tả ngắn</Label>
                    <Input 
                      value={form.siteDescription} 
                      onChange={(e) => updateField('siteDescription', e.target.value)}
                      placeholder="Hệ thống bán hàng trực tuyến hàng đầu"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Múi giờ</Label>
                    <select 
                      value={form.timezone}
                      onChange={(e) => updateField('timezone', e.target.value)}
                      className="w-full h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                    >
                      <option value="GMT+07:00">GMT+07:00 Bangkok, Hanoi, Jakarta</option>
                      <option value="GMT+08:00">GMT+08:00 Singapore, Hong Kong</option>
                      <option value="GMT+09:00">GMT+09:00 Tokyo, Seoul</option>
                      <option value="GMT+00:00">GMT+00:00 London, Dublin</option>
                    </select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Màu sắc thương hiệu</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3 mb-3">
                    <input
                      type="color"
                      value={form.brandColor}
                      onChange={(e) => updateField('brandColor', e.target.value)}
                      className="w-10 h-10 rounded-lg cursor-pointer border border-slate-200 dark:border-slate-700"
                    />
                    <Input 
                      value={form.brandColor.toUpperCase()} 
                      onChange={(e) => {
                        const val = e.target.value;
                        if (/^#[0-9A-Fa-f]{6}$/.test(val)) updateField('brandColor', val);
                      }}
                      className="w-24 font-mono text-sm uppercase"
                      maxLength={7}
                    />
                    <span className="text-xs text-slate-500 dark:text-slate-400">Màu chủ đạo</span>
                  </div>
                  <div className="flex rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                    {generateTintsShades(form.brandColor).map((shade, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => updateField('brandColor', shade)}
                        className="flex-1 h-9 transition-all hover:scale-y-125 hover:z-10 relative group"
                        style={{ backgroundColor: shade }}
                        title={shade.toUpperCase()}
                      >
                        <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 text-[9px] font-mono font-bold"
                          style={{ color: idx < 5 ? '#000' : '#fff' }}>
                          {shade.toUpperCase().slice(1)}
                        </span>
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-slate-400 mt-2">Click vào shade để chọn</p>
                </CardContent>
              </Card>
            </>
          )}
          
          {activeTab === 'contact' && (
            <Card>
              <CardHeader><CardTitle>Thông tin liên hệ</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Email liên hệ</Label>
                  <Input 
                    value={form.email} 
                    onChange={(e) => updateField('email', e.target.value)}
                    placeholder="contact@vietadmin.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Hotline</Label>
                  <Input 
                    value={form.hotline} 
                    onChange={(e) => updateField('hotline', e.target.value)}
                    placeholder="1900 1234"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Địa chỉ</Label>
                  <Input 
                    value={form.address} 
                    onChange={(e) => updateField('address', e.target.value)}
                    placeholder="123 Nguyễn Huệ, Quận 1, TP.HCM"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Facebook</Label>
                    <Input 
                      value={form.facebook} 
                      onChange={(e) => updateField('facebook', e.target.value)}
                      placeholder="https://facebook.com/vietadmin"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Zalo</Label>
                    <Input 
                      value={form.zalo} 
                      onChange={(e) => updateField('zalo', e.target.value)}
                      placeholder="0901234567"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Google Maps Embed</Label>
                  <Input 
                    value={form.googleMapsEmbed} 
                    onChange={(e) => updateField('googleMapsEmbed', e.target.value)}
                    placeholder="URL nhúng Google Maps"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'seo' && (
            <Card>
              <CardHeader><CardTitle>Cài đặt SEO</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Meta Title mặc định</Label>
                  <Input 
                    value={form.metaTitle} 
                    onChange={(e) => updateField('metaTitle', e.target.value)}
                    placeholder="VietAdmin - Hệ thống bán hàng trực tuyến"
                  />
                  <p className="text-xs text-slate-500">Tối đa 60 ký tự</p>
                </div>
                <div className="space-y-2">
                  <Label>Meta Description mặc định</Label>
                  <textarea 
                    value={form.metaDescription}
                    onChange={(e) => updateField('metaDescription', e.target.value)}
                    className="w-full min-h-[80px] rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm" 
                    placeholder="VietAdmin cung cấp giải pháp bán hàng online chuyên nghiệp..."
                  />
                  <p className="text-xs text-slate-500">Tối đa 160 ký tự</p>
                </div>
                <div className="space-y-2">
                  <Label>Meta Keywords</Label>
                  <Input 
                    value={form.metaKeywords} 
                    onChange={(e) => updateField('metaKeywords', e.target.value)}
                    placeholder="từ khóa 1, từ khóa 2, ..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Hình ảnh OG mặc định</Label>
                  <Input 
                    value={form.ogImage} 
                    onChange={(e) => updateField('ogImage', e.target.value)}
                    placeholder="/og-image.jpg"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end gap-3">
            {hasChanges && (
              <span className="text-sm text-amber-600 dark:text-amber-400 self-center">
                Có thay đổi chưa lưu
              </span>
            )}
            <Button 
              variant="accent" 
              onClick={handleSave}
              disabled={isSaving || !hasChanges}
            >
              {isSaving ? (
                <Loader2 size={16} className="mr-2 animate-spin"/>
              ) : (
                <Save size={16} className="mr-2"/>
              )}
              Lưu thay đổi
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
