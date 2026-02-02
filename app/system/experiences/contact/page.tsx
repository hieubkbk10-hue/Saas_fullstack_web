'use client';

import React, { useMemo, useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { LayoutTemplate, Loader2, Mail, Save } from 'lucide-react';
import { Button, Card } from '@/app/admin/components/ui';
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
  ConfigPanel,
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
  const [isPanelExpanded, setIsPanelExpanded] = useState(true);

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
    <div className="h-[calc(100vh-64px)] flex flex-col">
      {/* Header */}
      <header className="flex-shrink-0 px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-white dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 rounded-lg">
            <LayoutTemplate className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">Trải nghiệm: Trang liên hệ</h1>
            <p className="text-xs text-slate-500">/contact • Layout-specific config</p>
          </div>
        </div>
        <Button
          onClick={handleSave}
          disabled={!hasChanges || isSaving}
          className="bg-indigo-600 hover:bg-indigo-500 gap-2"
        >
          {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {hasChanges ? 'Lưu thay đổi' : 'Đã lưu'}
        </Button>
      </header>

      {/* Preview Area */}
      <main className="flex-1 overflow-auto p-6 bg-slate-50 dark:bg-slate-950">
        <div className="flex justify-center mb-4">
          <DeviceToggle value={previewDevice} onChange={setPreviewDevice} />
        </div>
        <div className={`mx-auto transition-all duration-300 ${deviceWidths[previewDevice]}`}>
          <BrowserFrame url="yoursite.com/contact" maxHeight="calc(100vh - 380px)">
            <ContactPreview
              layoutStyle={config.layoutStyle}
              showMap={currentLayoutConfig.showMap}
              showContactInfo={currentLayoutConfig.showContactInfo}
              showSocialLinks={currentLayoutConfig.showSocialLinks}
            />
          </BrowserFrame>
        </div>
        <div className="mt-3 text-xs text-slate-500 text-center">
          Layout: <strong>{LAYOUT_STYLES.find(s => s.id === config.layoutStyle)?.label}</strong>
          {' • '}{previewDevice === 'desktop' ? '1920px' : (previewDevice === 'tablet' ? '768px' : '375px')}
        </div>
      </main>

      {/* Bottom Panel */}
      <ConfigPanel
        isExpanded={isPanelExpanded}
        onToggle={() => setIsPanelExpanded(!isPanelExpanded)}
        expandedHeight="280px"
        leftContent={
          <LayoutTabs
            layouts={LAYOUT_STYLES}
            activeLayout={config.layoutStyle}
            onChange={(layout) => setConfig(prev => ({ ...prev, layoutStyle: layout }))}
            accentColor="#6366f1"
          />
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <ControlCard title="Khối hiển thị">
            <ToggleRow label="Bản đồ (Map)" description="Google Maps hoặc map service" checked={currentLayoutConfig.showMap} onChange={(v) => updateLayoutConfig('showMap', v)} accentColor="#6366f1" />
            <ToggleRow label="Thông tin liên hệ" description="Địa chỉ, phone, email" checked={currentLayoutConfig.showContactInfo} onChange={(v) => updateLayoutConfig('showContactInfo', v)} accentColor="#6366f1" />
            <ToggleRow label="Social media" description="FB, Twitter, Instagram..." checked={currentLayoutConfig.showSocialLinks} onChange={(v) => updateLayoutConfig('showSocialLinks', v)} accentColor="#6366f1" />
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

          <Card className="p-3 lg:col-span-2">
            <ExperienceHintCard hints={HINTS} />
          </Card>
        </div>
      </ConfigPanel>
    </div>
  );
}
