'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Eye, LayoutTemplate, Save, Ticket } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/app/admin/components/ui';
import {
  ExperienceHintCard,
  ExperienceModuleLink,
  ExampleLinks,
  PromotionsListPreview,
} from '@/components/experiences';
import {
  BrowserFrame,
  ControlCard,
  DeviceToggle,
  LayoutTabs,
  ToggleRow,
  deviceWidths,
  type DeviceType,
  type LayoutOption,
} from '@/components/experiences/editor';
import { EXPERIENCE_NAMES, MESSAGES, useExperienceConfig, useExperienceSave } from '@/lib/experiences';

type PromotionsLayoutStyle = 'grid' | 'list' | 'banner';

type PromotionsExperienceConfig = {
  layoutStyle: PromotionsLayoutStyle;
  showCountdown: boolean;
  showProgress: boolean;
  showConditions: boolean;
  groupByType: boolean;
};

const EXPERIENCE_KEY = 'promotions_list_ui';

const LAYOUT_STYLES: LayoutOption<PromotionsLayoutStyle>[] = [
  { description: 'Hiển thị dạng lưới thẻ', id: 'grid', label: 'Grid' },
  { description: 'Hiển thị dạng danh sách', id: 'list', label: 'List' },
  { description: 'Banner + danh sách', id: 'banner', label: 'Banner' },
];

const DEFAULT_CONFIG: PromotionsExperienceConfig = {
  layoutStyle: 'grid',
  showCountdown: true,
  showProgress: true,
  showConditions: true,
  groupByType: true,
};

const HINTS = [
  'Trang khuyến mãi nên có countdown để tạo urgency.',
  'Ưu tiên hiển thị điều kiện rõ ràng để tránh nhầm lẫn.',
  'Group theo loại giúp khách dễ chọn ưu đãi phù hợp.',
  'Banner nổi bật nên dùng cho flash sale hoặc campaign lớn.',
];

function ModuleFeatureStatus({ label, enabled, href, moduleName }: { label: string; enabled: boolean; href: string; moduleName: string }) {
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
      <Link href={href} className="text-xs font-medium text-rose-600 hover:underline">
        Đi đến →
      </Link>
    </div>
  );
}

export default function PromotionsListExperiencePage() {
  const experienceSetting = useQuery(api.settings.getByKey, { key: EXPERIENCE_KEY });
  const promotionsModule = useQuery(api.admin.modules.getModuleByKey, { key: 'promotions' });
  const brandColorSetting = useQuery(api.settings.getByKey, { key: 'site_brand_color' });
  const [previewDevice, setPreviewDevice] = useState<DeviceType>('desktop');

  const serverConfig = useMemo<PromotionsExperienceConfig>(() => {
    const raw = experienceSetting?.value as Partial<PromotionsExperienceConfig> | undefined;
    return {
      layoutStyle: raw?.layoutStyle ?? 'grid',
      showCountdown: raw?.showCountdown ?? true,
      showProgress: raw?.showProgress ?? true,
      showConditions: raw?.showConditions ?? true,
      groupByType: raw?.groupByType ?? true,
    };
  }, [experienceSetting?.value]);

  const isLoading = experienceSetting === undefined || promotionsModule === undefined;
  const brandColor = (brandColorSetting?.value as string) || '#f43f5e';

  const { config, setConfig, hasChanges } = useExperienceConfig(serverConfig, DEFAULT_CONFIG, isLoading);
  const { handleSave, isSaving } = useExperienceSave(
    EXPERIENCE_KEY,
    config,
    MESSAGES.saveSuccess(EXPERIENCE_NAMES[EXPERIENCE_KEY])
  );

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
            <LayoutTemplate className="w-5 h-5 text-rose-600" />
            <h1 className="text-2xl font-bold">Khuyến mãi</h1>
          </div>
          <Link href="/system/experiences" className="text-sm text-blue-600 hover:underline">
            Quay lại danh sách
          </Link>
        </div>
        <Button
          size="sm"
          onClick={handleSave}
          disabled={!hasChanges || isSaving}
          className="bg-rose-600 hover:bg-rose-500 gap-1.5"
        >
          {isSaving ? <Save size={14} className="animate-pulse" /> : <Save size={14} />}
          <span>{hasChanges ? 'Lưu' : 'Đã lưu'}</span>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Thiết lập hiển thị</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <ControlCard title="Bố cục">
            <ToggleRow
              label="Hiện countdown"
              checked={config.showCountdown}
              onChange={(v) => setConfig(prev => ({ ...prev, showCountdown: v }))}
              accentColor="#f43f5e"
              disabled={!promotionsModule?.enabled}
            />
            <ToggleRow
              label="Hiện tiến trình"
              checked={config.showProgress}
              onChange={(v) => setConfig(prev => ({ ...prev, showProgress: v }))}
              accentColor="#f43f5e"
              disabled={!promotionsModule?.enabled}
            />
            <ToggleRow
              label="Hiện điều kiện"
              checked={config.showConditions}
              onChange={(v) => setConfig(prev => ({ ...prev, showConditions: v }))}
              accentColor="#f43f5e"
              disabled={!promotionsModule?.enabled}
            />
            <ToggleRow
              label="Nhóm theo loại"
              checked={config.groupByType}
              onChange={(v) => setConfig(prev => ({ ...prev, groupByType: v }))}
              accentColor="#f43f5e"
              disabled={!promotionsModule?.enabled}
            />
          </ControlCard>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Module & liên kết</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <ControlCard title="Module liên quan">
            <ExperienceModuleLink
              enabled={promotionsModule?.enabled ?? false}
              href="/system/modules/promotions"
              icon={Ticket}
              title="Khuyến mãi"
              colorScheme="pink"
            />
            <ModuleFeatureStatus
              label="Khuyến mãi"
              enabled={promotionsModule?.enabled ?? false}
              href="/system/modules/promotions"
              moduleName="module Khuyến mãi"
            />
          </ControlCard>

          <Card className="p-2">
            <div className="mb-2">
              <ExampleLinks
                links={[{ label: 'Trang khuyến mãi', url: '/promotions' }]}
                color="#f43f5e"
                compact
              />
            </div>
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
                accentColor="#f43f5e"
              />
              <DeviceToggle value={previewDevice} onChange={setPreviewDevice} size="sm" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className={`mx-auto transition-all duration-300 ${deviceWidths[previewDevice]}`}>
            <BrowserFrame url="yoursite.com/promotions">
              <PromotionsListPreview
                layoutStyle={config.layoutStyle}
                showCountdown={config.showCountdown}
                showProgress={config.showProgress}
                showConditions={config.showConditions}
                groupByType={config.groupByType}
                brandColor={brandColor}
                device={previewDevice}
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
