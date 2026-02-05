'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Eye, LayoutTemplate, Loader2, Mail, Save } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/app/admin/components/ui';
import { 
  ExperienceModuleLink, 
  ExperienceHintCard,
  ContactPreview,
} from '@/components/experiences';
import {
  BrowserFrame,
  DeviceToggle,
  deviceWidths,
  LayoutTabs,
  ControlCard,
  ToggleRow,
  type DeviceType,
  type LayoutOption,
} from '@/components/experiences/editor';
import { useExperienceConfig, useExperienceSave, EXPERIENCE_NAMES, MESSAGES } from '@/lib/experiences';

type ContactLayoutStyle = 'form-only' | 'with-map' | 'with-info';

type ContactExperienceConfig = {
  layoutStyle: ContactLayoutStyle;
  layouts: {
    'form-only': LayoutConfig;
    'with-map': LayoutConfig;
    'with-info': LayoutConfig;
  };
};

type LayoutConfig = {
  showMap: boolean;
  showContactInfo: boolean;
  showSocialLinks: boolean;
};

const EXPERIENCE_KEY = 'contact_ui';

const LAYOUT_STYLES: LayoutOption<ContactLayoutStyle>[] = [
  { description: 'Chỉ có form liên hệ', id: 'form-only', label: 'Form Only' },
  { description: 'Form + Map', id: 'with-map', label: 'With Map' },
  { description: 'Form + Contact Info sidebar', id: 'with-info', label: 'With Info' },
];

const DEFAULT_LAYOUT_CONFIG: LayoutConfig = {
  showMap: true,
  showContactInfo: true,
  showSocialLinks: true,
};

const DEFAULT_CONFIG: ContactExperienceConfig = {
  layoutStyle: 'with-info',
  layouts: {
    'form-only': { ...DEFAULT_LAYOUT_CONFIG, showMap: false, showContactInfo: false },
    'with-map': { ...DEFAULT_LAYOUT_CONFIG, showContactInfo: false },
    'with-info': { ...DEFAULT_LAYOUT_CONFIG, showMap: false },
  },
};

const HINTS = [
  'With-info layout tốt cho business contact page.',
  'Map giúp khách hàng tìm địa chỉ dễ dàng.',
  'Social links tăng kết nối với khách hàng.',
  'Mỗi layout có config riêng - chuyển tab để chỉnh.',
];

export default function ContactExperiencePage() {
  const experienceSetting = useQuery(api.settings.getByKey, { key: EXPERIENCE_KEY });
  const [previewDevice, setPreviewDevice] = useState<DeviceType>('desktop');

  const serverConfig = useMemo<ContactExperienceConfig>(() => {
    const raw = experienceSetting?.value as Partial<ContactExperienceConfig> | undefined;
    return {
      layoutStyle: raw?.layoutStyle ?? 'with-info',
      layouts: {
        'form-only': { ...DEFAULT_CONFIG.layouts['form-only'], ...raw?.layouts?.['form-only'] },
        'with-map': { ...DEFAULT_CONFIG.layouts['with-map'], ...raw?.layouts?.['with-map'] },
        'with-info': { ...DEFAULT_CONFIG.layouts['with-info'], ...raw?.layouts?.['with-info'] },
      },
    };
  }, [experienceSetting?.value]);

  const isLoading = experienceSetting === undefined;

  const { config, setConfig, hasChanges } = useExperienceConfig(serverConfig, DEFAULT_CONFIG, isLoading);
  const { handleSave, isSaving } = useExperienceSave(
    EXPERIENCE_KEY,
    config,
    MESSAGES.saveSuccess(EXPERIENCE_NAMES[EXPERIENCE_KEY])
  );

  const currentLayoutConfig = config.layouts[config.layoutStyle];

  const updateLayoutConfig = <K extends keyof LayoutConfig>(
    key: K,
    value: LayoutConfig[K]
  ) => {
    setConfig(prev => ({
      ...prev,
      layouts: {
        ...prev.layouts,
        [prev.layoutStyle]: {
          ...prev.layouts[prev.layoutStyle],
          [key]: value,
        },
      },
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500">{MESSAGES.loading}</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2">
            <LayoutTemplate className="w-5 h-5 text-indigo-600" />
            <h1 className="text-2xl font-bold">Trang liên hệ</h1>
          </div>
          <Link href="/system/experiences" className="text-sm text-blue-600 hover:underline">
            Quay lại danh sách
          </Link>
        </div>
        <Button
          size="sm"
          onClick={handleSave}
          disabled={!hasChanges || isSaving}
          className="bg-indigo-600 hover:bg-indigo-500 gap-1.5"
        >
          {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          <span>{hasChanges ? 'Lưu' : 'Đã lưu'}</span>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Thiết lập hiển thị</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <ControlCard title="Khối hiển thị">
            <ToggleRow label="Bản đồ (Map)" checked={currentLayoutConfig.showMap} onChange={(v) => updateLayoutConfig('showMap', v)} accentColor="#6366f1" />
            <ToggleRow label="Thông tin liên hệ" checked={currentLayoutConfig.showContactInfo} onChange={(v) => updateLayoutConfig('showContactInfo', v)} accentColor="#6366f1" />
            <ToggleRow label="Social media" checked={currentLayoutConfig.showSocialLinks} onChange={(v) => updateLayoutConfig('showSocialLinks', v)} accentColor="#6366f1" />
          </ControlCard>

          <ControlCard title="Module liên quan">
            <ExperienceModuleLink
              enabled={true}
              href="/system/settings"
              icon={Mail}
              title="System Settings"
              colorScheme="cyan"
            />
          </ControlCard>

          <Card className="p-2">
            <ExperienceHintCard hints={HINTS} />
          </Card>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Eye size={18} /> Preview
            </CardTitle>
            <div className="flex items-center gap-3">
              <LayoutTabs
                layouts={LAYOUT_STYLES}
                activeLayout={config.layoutStyle}
                onChange={(layout) => setConfig(prev => ({ ...prev, layoutStyle: layout }))}
                accentColor="#6366f1"
              />
              <DeviceToggle value={previewDevice} onChange={setPreviewDevice} size="sm" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className={`mx-auto transition-all duration-300 ${deviceWidths[previewDevice]}`}>
            <BrowserFrame url="yoursite.com/contact">
              <ContactPreview
                layoutStyle={config.layoutStyle}
                showMap={currentLayoutConfig.showMap}
                showContactInfo={currentLayoutConfig.showContactInfo}
                showSocialLinks={currentLayoutConfig.showSocialLinks}
                device={previewDevice}
                brandColor="#6366f1"
              />
            </BrowserFrame>
          </div>
          <div className="mt-3 text-xs text-slate-500">
            Style: <strong className="text-slate-700 dark:text-slate-300">{LAYOUT_STYLES.find(s => s.id === config.layoutStyle)?.label}</strong>
            {' • '}{previewDevice === 'desktop' && 'Desktop (1920px)'}{previewDevice === 'tablet' && 'Tablet (768px)'}{previewDevice === 'mobile' && 'Mobile (375px)'}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
