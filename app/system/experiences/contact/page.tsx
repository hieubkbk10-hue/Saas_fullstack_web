'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Eye, LayoutTemplate, Loader2, Mail, Save } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/app/admin/components/ui';
import {
  ExampleLinks,
  ExperienceHintCard,
  ExperienceModuleLink,
  LivePreview,
} from '@/components/experiences';
import {
  ControlCard,
  LayoutTabs,
  ToggleRow,
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
  'Preview dùng route thật /contact để tránh lệch UI runtime.',
  'Map giúp khách hàng tìm địa chỉ dễ dàng.',
  'Social links tăng kết nối với khách hàng.',
  'Mỗi layout có config riêng - chuyển tab để chỉnh.',
];

export default function ContactExperiencePage() {
  const experienceSetting = useQuery(api.settings.getByKey, { key: CONTACT_EXPERIENCE_KEY });
  const [previewRefreshKey, setPreviewRefreshKey] = useState(0);

  const serverConfig = useMemo<ContactExperienceConfig>(
    () => parseContactExperienceConfig(experienceSetting?.value),
    [experienceSetting?.value]
  );

  const isLoading = experienceSetting === undefined;

  const { config, setConfig, hasChanges } = useExperienceConfig(serverConfig, DEFAULT_CONTACT_CONFIG, isLoading);
  const { handleSave, isSaving } = useExperienceSave(
    CONTACT_EXPERIENCE_KEY,
    config,
    MESSAGES.saveSuccess(EXPERIENCE_NAMES[CONTACT_EXPERIENCE_KEY])
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

  const handleSaveAndRefreshPreview = async () => {
    await handleSave();
    setPreviewRefreshKey(prev => prev + 1);
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
          onClick={handleSaveAndRefreshPreview}
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
              enabled
              href="/system/modules/settings"
              icon={Mail}
              title="System Settings"
              colorScheme="cyan"
            />
          </ControlCard>

          <Card className="p-3 space-y-3">
            <ExampleLinks
              compact
              links={[{ label: 'Xem trang Contact thực tế', url: '/contact', description: 'Mở route thật để kiểm tra runtime' }]}
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
            <LayoutTabs
              layouts={LAYOUT_STYLES}
              activeLayout={config.layoutStyle}
              onChange={(layout) => setConfig(prev => ({ ...prev, layoutStyle: layout }))}
              accentColor="#6366f1"
            />
          </div>
        </CardHeader>
        <CardContent>
          <LivePreview
            url="/contact"
            title={`Contact - ${LAYOUT_STYLES.find(s => s.id === config.layoutStyle)?.label ?? 'With Info'}`}
            defaultDevice="desktop"
            refreshKey={previewRefreshKey}
          />
          <div className="mt-3 text-xs text-slate-500">
            Layout đang chỉnh: <strong className="text-slate-700 dark:text-slate-300">{LAYOUT_STYLES.find(s => s.id === config.layoutStyle)?.label}</strong>
            {' • '}Preview runtime sẽ đồng bộ sau khi bấm Lưu.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
