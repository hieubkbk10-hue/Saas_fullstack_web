'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { AlertCircle, Eye, LayoutTemplate, Loader2, Mail, Save } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/app/admin/components/ui';
import {
  ContactPreview,
  ExampleLinks,
  ExperienceHintCard,
  ExperienceModuleLink,
} from '@/components/experiences';
import {
  BrowserFrame,
  ControlCard,
  DeviceToggle,
  deviceWidths,
  LayoutTabs,
  ToggleRow,
  type DeviceType,
  type LayoutOption,
} from '@/components/experiences/editor';
import {
  CONTACT_EXPERIENCE_KEY,
  DEFAULT_CONTACT_CONFIG,
  parseContactExperienceConfig,
  useExperienceConfig,
  useExperienceSave,
  EXPERIENCE_NAMES,
  MESSAGES,
  type ContactExperienceConfig,
  type ContactLayoutStyle,
  type LayoutConfig,
} from '@/lib/experiences';

const LAYOUT_STYLES: LayoutOption<ContactLayoutStyle>[] = [
  { description: 'Chỉ có form liên hệ', id: 'form-only', label: 'Form Only' },
  { description: 'Form + Map', id: 'with-map', label: 'With Map' },
  { description: 'Form + Contact Info sidebar', id: 'with-info', label: 'With Info' },
];

const HINTS = [
  'Preview mock giúp xem thay đổi ngay, không cần lưu mới thấy.',
  'Thông tin liên hệ và social phụ thuộc module Settings.',
  'Nếu feature Settings bị tắt, block tương ứng sẽ không hiển thị ở preview.',
  'Mỗi layout có config riêng - chuyển tab để chỉnh.',
];

function ModuleFeatureStatus({
  label,
  enabled,
  href,
  moduleName,
}: {
  label: string;
  enabled: boolean;
  href: string;
  moduleName: string;
}) {
  return (
    <div className="mt-2 flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
      <div className="flex items-start gap-2">
        <span className={`mt-1 inline-flex h-2 w-2 rounded-full ${enabled ? 'bg-emerald-500' : 'bg-slate-400'}`} />
        <div>
          <p className="text-sm font-medium text-slate-700">{label}</p>
          <p className="text-xs text-slate-500">
            {enabled ? 'Đang bật' : 'Chưa bật'} · Nếu muốn {enabled ? 'tắt' : 'bật'} hãy vào {moduleName}
          </p>
        </div>
      </div>
      <Link href={href} className="text-xs font-medium text-cyan-600 hover:underline">
        Đi đến →
      </Link>
    </div>
  );
}

export default function ContactExperiencePage() {
  const experienceSetting = useQuery(api.settings.getByKey, { key: CONTACT_EXPERIENCE_KEY });
  const settingsModule = useQuery(api.admin.modules.getModuleByKey, { key: 'settings' });
  const contactFeature = useQuery(api.admin.modules.getModuleFeature, { moduleKey: 'settings', featureKey: 'enableContact' });
  const socialFeature = useQuery(api.admin.modules.getModuleFeature, { moduleKey: 'settings', featureKey: 'enableSocial' });
  const mailFeature = useQuery(api.admin.modules.getModuleFeature, { moduleKey: 'settings', featureKey: 'enableMail' });
  const [previewDevice, setPreviewDevice] = useState<DeviceType>('desktop');

  const serverConfig = useMemo<ContactExperienceConfig>(
    () => parseContactExperienceConfig(experienceSetting?.value),
    [experienceSetting?.value]
  );

  const isLoading = experienceSetting === undefined
    || settingsModule === undefined
    || contactFeature === undefined
    || socialFeature === undefined
    || mailFeature === undefined;

  const { config, setConfig, hasChanges } = useExperienceConfig(serverConfig, DEFAULT_CONTACT_CONFIG, isLoading);
  const { handleSave, isSaving } = useExperienceSave(
    CONTACT_EXPERIENCE_KEY,
    config,
    MESSAGES.saveSuccess(EXPERIENCE_NAMES[CONTACT_EXPERIENCE_KEY])
  );

  const currentLayoutConfig = config.layouts[config.layoutStyle];
  const settingsEnabled = settingsModule?.enabled ?? false;
  const contactEnabled = settingsEnabled && (contactFeature?.enabled ?? false);
  const socialEnabled = settingsEnabled && (socialFeature?.enabled ?? false);
  const mailEnabled = settingsEnabled && (mailFeature?.enabled ?? false);

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
            <ToggleRow
              label="Bản đồ (Map)"
              checked={currentLayoutConfig.showMap}
              onChange={(v) => updateLayoutConfig('showMap', v)}
              accentColor="#6366f1"
              disabled={!contactEnabled}
            />
            <ToggleRow
              label="Thông tin liên hệ"
              checked={currentLayoutConfig.showContactInfo}
              onChange={(v) => updateLayoutConfig('showContactInfo', v)}
              accentColor="#6366f1"
              disabled={!contactEnabled}
            />
            <ToggleRow
              label="Social media"
              checked={currentLayoutConfig.showSocialLinks}
              onChange={(v) => updateLayoutConfig('showSocialLinks', v)}
              accentColor="#6366f1"
              disabled={!socialEnabled}
            />
            {!settingsEnabled && (
              <div className="flex items-start gap-2 p-2 bg-amber-50 dark:bg-amber-500/10 rounded-lg text-xs text-amber-700 dark:text-amber-300 mt-2">
                <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                <span>Module Settings đang tắt nên khối hiển thị bị khoá.</span>
              </div>
            )}
          </ControlCard>

          <ControlCard title="Module liên quan">
            <ExperienceModuleLink
              enabled={settingsEnabled}
              href="/system/modules/settings"
              icon={Mail}
              title="System Settings"
              colorScheme="cyan"
            />
            <ModuleFeatureStatus
              label="Thông tin liên hệ"
              enabled={contactEnabled}
              href="/system/modules/settings"
              moduleName="Module Settings"
            />
            <ModuleFeatureStatus
              label="Mạng xã hội"
              enabled={socialEnabled}
              href="/system/modules/settings"
              moduleName="Module Settings"
            />
            <ModuleFeatureStatus
              label="Cấu hình Email"
              enabled={mailEnabled}
              href="/system/modules/settings"
              moduleName="Module Settings"
            />
          </ControlCard>

          <Card className="p-3 space-y-3">
            <ExampleLinks
              compact
              links={[{ label: 'Xem trang Contact thực tế', url: '/contact', description: 'Mở route thật để đối chiếu runtime' }]}
              color="#6366f1"
            />
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
                showMap={currentLayoutConfig.showMap && contactEnabled}
                showContactInfo={currentLayoutConfig.showContactInfo && contactEnabled}
                showSocialLinks={currentLayoutConfig.showSocialLinks && socialEnabled}
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
