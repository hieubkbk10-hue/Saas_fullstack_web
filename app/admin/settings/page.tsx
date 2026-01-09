'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Save, Loader2, Palette, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { cn, Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from '../components/ui';
import { ModuleGuard } from '../components/ModuleGuard';
import { SettingsImageUploader } from '../components/SettingsImageUploader';
import { useSettingsCleanup } from '../components/useSettingsCleanup';

const MODULE_KEY = 'settings';

// Color utilities
const hexToHSL = (hex: string): { h: number; s: number; l: number } => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return { h: 0, s: 0, l: 0 };
  const r = parseInt(result[1], 16) / 255;
  const g = parseInt(result[2], 16) / 255;
  const b = parseInt(result[3], 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
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

const isValidHexColor = (color: string): boolean => /^#[0-9A-Fa-f]{6}$/.test(color);

// Tab config với feature mapping
const TAB_CONFIG = [
  { id: 'site', label: 'Chung', feature: null }, // Luôn hiển thị
  { id: 'contact', label: 'Liên hệ', feature: 'enableContact' },
  { id: 'seo', label: 'SEO', feature: 'enableSEO' },
  { id: 'social', label: 'Mạng xã hội', feature: 'enableSocial' },
  { id: 'mail', label: 'Email', feature: 'enableMail' },
];

// Group labels for display
const GROUP_LABELS: Record<string, string> = {
  site: 'Thông tin chung',
  contact: 'Thông tin liên hệ',
  seo: 'Cài đặt SEO',
  social: 'Mạng xã hội',
  mail: 'Cấu hình Email',
};

export default function SettingsPage() {
  return (
    <ModuleGuard moduleKey={MODULE_KEY}>
      <SettingsContent />
    </ModuleGuard>
  );
}

function SettingsContent() {
  const [activeTab, setActiveTab] = useState('site');
  const [form, setForm] = useState<Record<string, string>>({});
  const [initialForm, setInitialForm] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);

  // Hooks
  const { cleanupUnusedImages } = useSettingsCleanup();

  // Queries
  const settingsData = useQuery(api.settings.listAll);
  const featuresData = useQuery(api.admin.modules.listModuleFeatures, { moduleKey: MODULE_KEY });
  const fieldsData = useQuery(api.admin.modules.listModuleFields, { moduleKey: MODULE_KEY });

  // Mutations
  const setMultiple = useMutation(api.settings.setMultiple);

  const isLoading = settingsData === undefined || featuresData === undefined || fieldsData === undefined;

  // Parse enabled features
  const enabledFeatures = useMemo(() => {
    const features: Record<string, boolean> = {};
    featuresData?.forEach(f => { features[f.featureKey] = f.enabled; });
    return features;
  }, [featuresData]);

  // Filter tabs based on enabled features
  const visibleTabs = useMemo(() => {
    return TAB_CONFIG.filter(tab => 
      tab.feature === null || enabledFeatures[tab.feature] !== false
    );
  }, [enabledFeatures]);

  // Filter and group fields based on enabled status and feature
  const fieldsByGroup = useMemo(() => {
    const groups: Record<string, typeof fieldsData> = {};
    
    fieldsData?.forEach(field => {
      // Skip disabled fields
      if (!field.enabled) return;
      
      // Skip fields whose linked feature is disabled
      if (field.linkedFeature && enabledFeatures[field.linkedFeature] === false) return;
      
      const group = field.group || 'site';
      if (!groups[group]) groups[group] = [];
      groups[group]!.push(field);
    });

    // Sort fields by order within each group
    Object.keys(groups).forEach(key => {
      groups[key]!.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    });

    return groups;
  }, [fieldsData, enabledFeatures]);

  // Sync form with settings data
  useEffect(() => {
    if (settingsData) {
      const values: Record<string, string> = {};
      settingsData.forEach(s => {
        values[s.key] = typeof s.value === 'string' ? s.value : String(s.value ?? '');
      });
      setForm(values);
      setInitialForm(values);
    }
  }, [settingsData]);

  // Reset active tab if current tab becomes hidden
  useEffect(() => {
    if (!visibleTabs.find(t => t.id === activeTab)) {
      setActiveTab(visibleTabs[0]?.id || 'site');
    }
  }, [visibleTabs, activeTab]);

  // Detect changes
  const hasChanges = useMemo(() => {
    return Object.keys(form).some(key => form[key] !== initialForm[key]);
  }, [form, initialForm]);

  const updateField = (key: string, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  // Validate before save
  const validateForm = (): boolean => {
    // Validate color fields
    const colorFields = fieldsData?.filter(f => f.type === 'color') || [];
    for (const field of colorFields) {
      const value = form[field.fieldKey];
      if (value && !isValidHexColor(value)) {
        toast.error(`${field.name}: Mã màu không hợp lệ (cần format #RRGGBB)`);
        return false;
      }
    }

    // Validate required fields
    const requiredFields = fieldsData?.filter(f => f.required && f.enabled) || [];
    for (const field of requiredFields) {
      if (!form[field.fieldKey]?.trim()) {
        toast.error(`${field.name} là bắt buộc`);
        return false;
      }
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      // Get all enabled fields and their groups
      const settingsToSave = fieldsData
        ?.filter(f => f.enabled && (!f.linkedFeature || enabledFeatures[f.linkedFeature] !== false))
        .map(field => ({
          key: field.fieldKey,
          value: form[field.fieldKey] ?? '',
          group: field.group || 'site',
        })) || [];

      await setMultiple({ settings: settingsToSave });
      setInitialForm({ ...form });
      toast.success('Đã lưu cài đặt thành công!');
    } catch (error) {
      console.error('Save settings error:', error);
      toast.error(`Lỗi khi lưu: ${error instanceof Error ? error.message : 'Không xác định'}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Cleanup unused images
  const handleCleanup = useCallback(async () => {
    setIsCleaning(true);
    try {
      // Get all image field values that are being used
      const imageFields = fieldsData?.filter(f => f.type === 'image' && f.enabled) || [];
      const usedUrls = imageFields
        .map(f => form[f.fieldKey])
        .filter((url): url is string => !!url);

      await cleanupUnusedImages(usedUrls);
    } finally {
      setIsCleaning(false);
    }
  }, [fieldsData, form, cleanupUnusedImages]);

  // Render field based on type
  const renderField = (field: NonNullable<typeof fieldsData>[number]) => {
    const value = form[field.fieldKey] ?? '';
    const key = field.fieldKey;

    switch (field.type) {
      case 'color':
        return (
          <div className="space-y-2" key={key}>
            <Label>{field.name}</Label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={isValidHexColor(value) ? value : '#3b82f6'}
                onChange={(e) => updateField(key, e.target.value)}
                className="w-10 h-10 rounded-lg cursor-pointer border border-slate-200 dark:border-slate-700"
              />
              <Input
                value={value.toUpperCase()}
                onChange={(e) => {
                  const val = e.target.value;
                  updateField(key, val);
                }}
                className="w-28 font-mono text-sm uppercase"
                maxLength={7}
                placeholder="#000000"
              />
              <Palette size={16} className="text-slate-400" />
            </div>
            {value && isValidHexColor(value) && (
              <div className="flex rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                {generateTintsShades(value).map((shade, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => updateField(key, shade)}
                    className="flex-1 h-8 transition-all hover:scale-y-125 hover:z-10 relative group"
                    style={{ backgroundColor: shade }}
                    title={shade.toUpperCase()}
                  >
                    <span
                      className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 text-[8px] font-mono font-bold"
                      style={{ color: idx < 5 ? '#000' : '#fff' }}
                    >
                      {shade.toUpperCase().slice(1)}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        );

      case 'textarea':
        return (
          <div className="space-y-2" key={key}>
            <Label>{field.name} {field.required && <span className="text-red-500">*</span>}</Label>
            <textarea
              value={value}
              onChange={(e) => updateField(key, e.target.value)}
              className="w-full min-h-[80px] rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
              placeholder={`Nhập ${field.name.toLowerCase()}...`}
            />
          </div>
        );

      case 'select':
        // Handle specific select fields
        if (key === 'site_timezone') {
          return (
            <div className="space-y-2" key={key}>
              <Label>{field.name}</Label>
              <select
                value={value}
                onChange={(e) => updateField(key, e.target.value)}
                className="w-full h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
              >
                <option value="Asia/Ho_Chi_Minh">GMT+07:00 Bangkok, Hanoi, Jakarta</option>
                <option value="Asia/Singapore">GMT+08:00 Singapore, Hong Kong</option>
                <option value="Asia/Tokyo">GMT+09:00 Tokyo, Seoul</option>
                <option value="Europe/London">GMT+00:00 London, Dublin</option>
              </select>
            </div>
          );
        }
        if (key === 'site_language') {
          return (
            <div className="space-y-2" key={key}>
              <Label>{field.name}</Label>
              <select
                value={value}
                onChange={(e) => updateField(key, e.target.value)}
                className="w-full h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
              >
                <option value="vi">Tiếng Việt</option>
                <option value="en">English</option>
              </select>
            </div>
          );
        }
        if (key === 'mail_driver') {
          return (
            <div className="space-y-2" key={key}>
              <Label>{field.name}</Label>
              <select
                value={value}
                onChange={(e) => updateField(key, e.target.value)}
                className="w-full h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
              >
                <option value="smtp">SMTP</option>
                <option value="sendmail">Sendmail</option>
                <option value="mailgun">Mailgun</option>
              </select>
            </div>
          );
        }
        if (key === 'mail_encryption') {
          return (
            <div className="space-y-2" key={key}>
              <Label>{field.name}</Label>
              <select
                value={value}
                onChange={(e) => updateField(key, e.target.value)}
                className="w-full h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
              >
                <option value="tls">TLS</option>
                <option value="ssl">SSL</option>
                <option value="">None</option>
              </select>
            </div>
          );
        }
        // Default select - render as text input
        return (
          <div className="space-y-2" key={key}>
            <Label>{field.name} {field.required && <span className="text-red-500">*</span>}</Label>
            <Input
              value={value}
              onChange={(e) => updateField(key, e.target.value)}
              placeholder={`Nhập ${field.name.toLowerCase()}...`}
            />
          </div>
        );

      case 'number':
        return (
          <div className="space-y-2" key={key}>
            <Label>{field.name} {field.required && <span className="text-red-500">*</span>}</Label>
            <Input
              type="number"
              value={value}
              onChange={(e) => updateField(key, e.target.value)}
              placeholder={`Nhập ${field.name.toLowerCase()}...`}
            />
          </div>
        );

      case 'image':
        return (
          <div className="space-y-2" key={key}>
            <SettingsImageUploader
              label={field.name}
              value={value}
              onChange={(url) => updateField(key, url || '')}
              folder="settings"
              previewSize={key.includes('favicon') ? 'sm' : 'md'}
            />
          </div>
        );

      case 'email':
        return (
          <div className="space-y-2" key={key}>
            <Label>{field.name} {field.required && <span className="text-red-500">*</span>}</Label>
            <Input
              type="email"
              value={value}
              onChange={(e) => updateField(key, e.target.value)}
              placeholder="example@domain.com"
            />
          </div>
        );

      case 'phone':
        return (
          <div className="space-y-2" key={key}>
            <Label>{field.name} {field.required && <span className="text-red-500">*</span>}</Label>
            <Input
              type="tel"
              value={value}
              onChange={(e) => updateField(key, e.target.value)}
              placeholder="0901234567"
            />
          </div>
        );

      case 'tags':
        return (
          <div className="space-y-2" key={key}>
            <Label>{field.name}</Label>
            <Input
              value={value}
              onChange={(e) => updateField(key, e.target.value)}
              placeholder="từ khóa 1, từ khóa 2, ..."
            />
            <p className="text-xs text-slate-500">Phân cách bằng dấu phẩy</p>
          </div>
        );

      default: // text
        return (
          <div className="space-y-2" key={key}>
            <Label>{field.name} {field.required && <span className="text-red-500">*</span>}</Label>
            <Input
              value={value}
              onChange={(e) => updateField(key, e.target.value)}
              placeholder={`Nhập ${field.name.toLowerCase()}...`}
            />
          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  const currentFields = fieldsByGroup[activeTab] || [];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Cài đặt hệ thống</h1>
        <p className="text-slate-500">Quản lý các cấu hình chung cho website của bạn.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Tabs sidebar */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="flex flex-col space-y-1">
            {visibleTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "text-left px-4 py-2 rounded-md text-sm font-medium transition-colors",
                  activeTab === tab.id
                    ? "bg-white dark:bg-slate-800 shadow-sm text-blue-600"
                    : "text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-800/50"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-6">
          {currentFields.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>{GROUP_LABELS[activeTab] || activeTab}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentFields.map(field => renderField(field))}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-slate-500">
                Không có trường nào được bật cho nhóm này.
                <br />
                <span className="text-sm">Kiểm tra cấu hình tại System → Modules → Settings</span>
              </CardContent>
            </Card>
          )}

          {/* Save button */}
          <div className="flex justify-between items-center gap-3">
            <Button
              variant="ghost"
              onClick={handleCleanup}
              disabled={isCleaning}
              className="text-slate-500 hover:text-red-500"
              title="Xóa ảnh không sử dụng trong thư mục settings"
            >
              {isCleaning ? (
                <Loader2 size={16} className="mr-2 animate-spin" />
              ) : (
                <Trash2 size={16} className="mr-2" />
              )}
              Dọn dẹp ảnh
            </Button>
            <div className="flex items-center gap-3">
              {hasChanges && (
                <span className="text-sm text-amber-600 dark:text-amber-400">
                  Có thay đổi chưa lưu
                </span>
              )}
              <Button
                variant="accent"
                onClick={handleSave}
                disabled={isSaving || !hasChanges}
              >
                {isSaving ? (
                  <Loader2 size={16} className="mr-2 animate-spin" />
                ) : (
                  <Save size={16} className="mr-2" />
                )}
                Lưu thay đổi
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
