'use client';

import React, { useState, useEffect } from 'react';
import { Save, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { cn, Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from '../components/ui';

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

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [brandColor, setBrandColor] = useState('#3b82f6');

  useEffect(() => {
    const saved = localStorage.getItem('brandColor');
    if (saved) setBrandColor(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem('brandColor', brandColor);
  }, [brandColor]);

  const tabs = [
    { id: 'general', label: 'Chung' },
    { id: 'contact', label: 'Liên hệ' },
    { id: 'seo', label: 'SEO' },
  ];

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
                    <Input defaultValue="VietAdmin Shop" />
                  </div>
                  <div className="space-y-2">
                    <Label>Mô tả ngắn</Label>
                    <Input defaultValue="Hệ thống bán hàng trực tuyến hàng đầu" />
                  </div>
                  <div className="space-y-2">
                    <Label>Múi giờ</Label>
                    <select className="w-full h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm">
                      <option>GMT+07:00 Bangkok, Hanoi, Jakarta</option>
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
                      value={brandColor}
                      onChange={(e) => setBrandColor(e.target.value)}
                      className="w-10 h-10 rounded-lg cursor-pointer border border-slate-200 dark:border-slate-700"
                    />
                    <Input 
                      value={brandColor.toUpperCase()} 
                      onChange={(e) => {
                        const val = e.target.value;
                        if (/^#[0-9A-Fa-f]{6}$/.test(val)) setBrandColor(val);
                      }}
                      className="w-24 font-mono text-sm uppercase"
                      maxLength={7}
                    />
                    <span className="text-xs text-slate-500 dark:text-slate-400">Màu chủ đạo</span>
                  </div>
                  <div className="flex rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                    {generateTintsShades(brandColor).map((shade, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setBrandColor(shade)}
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
                  <Input defaultValue="contact@vietadmin.com" />
                </div>
                <div className="space-y-2">
                  <Label>Hotline</Label>
                  <Input defaultValue="1900 1234" />
                </div>
                <div className="space-y-2">
                  <Label>Địa chỉ</Label>
                  <Input defaultValue="123 Nguyễn Huệ, Quận 1, TP.HCM" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Facebook</Label>
                    <Input defaultValue="https://facebook.com/vietadmin" placeholder="URL Facebook" />
                  </div>
                  <div className="space-y-2">
                    <Label>Zalo</Label>
                    <Input defaultValue="0901234567" placeholder="Số Zalo" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Google Maps Embed</Label>
                  <Input defaultValue="https://maps.google.com/..." placeholder="URL nhúng Google Maps" />
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
                  <Input defaultValue="VietAdmin - Hệ thống bán hàng trực tuyến" />
                  <p className="text-xs text-slate-500">Tối đa 60 ký tự</p>
                </div>
                <div className="space-y-2">
                  <Label>Meta Description mặc định</Label>
                  <textarea className="w-full min-h-[80px] rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm" defaultValue="VietAdmin cung cấp giải pháp bán hàng online chuyên nghiệp với hàng ngàn sản phẩm chất lượng cao." />
                  <p className="text-xs text-slate-500">Tối đa 160 ký tự</p>
                </div>
                <div className="space-y-2">
                  <Label>Meta Keywords</Label>
                  <Input defaultValue="bán hàng online, shop online, vietadmin" placeholder="từ khóa 1, từ khóa 2, ..." />
                </div>
                <div className="space-y-2">
                  <Label>Hình ảnh OG mặc định</Label>
                  <div className="flex gap-2">
                    <Input defaultValue="/og-image.jpg" placeholder="URL hình ảnh" className="flex-1" />
                    <Button variant="outline" type="button"><Upload size={14} /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end">
            <Button variant="accent" onClick={() => toast.success("Đã lưu cài đặt")}>
              <Save size={16} className="mr-2"/> Lưu thay đổi
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
