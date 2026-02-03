'use client';

import React, { useMemo, useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Briefcase, LayoutTemplate, Loader2, Save } from 'lucide-react';
import { Button, Card } from '@/app/admin/components/ui';
import { SettingInput } from '@/components/modules/shared';
import { 
  ExperienceModuleLink, 
  ExperienceHintCard,
  ServiceDetailPreview,
  ExampleLinks,
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
import { useExperienceConfig, useExperienceSave, useExampleServiceSlug, EXPERIENCE_NAMES, MESSAGES } from '@/lib/experiences';

type DetailLayoutStyle = 'classic' | 'modern' | 'minimal';

type ServiceDetailExperienceConfig = {
  layoutStyle: DetailLayoutStyle;
  showRelated: boolean;
  showShare: boolean;
  quickContactEnabled: boolean;
  quickContactTitle: string;
  quickContactDescription: string;
  quickContactShowPrice: boolean;
  quickContactButtonText: string;
  quickContactButtonLink: string;
  modernContactEnabled: boolean;
  modernContactShowPrice: boolean;
  modernHeroCtaText: string;
  modernHeroCtaLink: string;
  minimalCtaEnabled: boolean;
  minimalShowPrice: boolean;
  minimalCtaText: string;
  minimalCtaButtonText: string;
  minimalCtaButtonLink: string;
};

const EXPERIENCE_KEY = 'services_detail_ui';

const LAYOUT_STYLES: LayoutOption<DetailLayoutStyle>[] = [
  { description: 'Layout truyền thống với sidebar', id: 'classic', label: 'Classic' },
  { description: 'Hero image, full-width', id: 'modern', label: 'Modern' },
  { description: 'Tối giản, tập trung nội dung', id: 'minimal', label: 'Minimal' },
];

const DEFAULT_CONFIG: ServiceDetailExperienceConfig = {
  layoutStyle: 'classic',
  showRelated: true,
  showShare: true,
  quickContactEnabled: true,
  quickContactTitle: 'Liên hệ nhanh',
  quickContactDescription: 'Tư vấn miễn phí, báo giá trong 24h.',
  quickContactShowPrice: true,
  quickContactButtonText: 'Liên hệ tư vấn',
  quickContactButtonLink: '',
  modernContactEnabled: true,
  modernContactShowPrice: true,
  modernHeroCtaText: 'Liên hệ tư vấn',
  modernHeroCtaLink: '',
  minimalCtaEnabled: true,
  minimalShowPrice: true,
  minimalCtaText: 'Quan tâm đến dịch vụ này?',
  minimalCtaButtonText: 'Liên hệ tư vấn',
  minimalCtaButtonLink: '',
};

const HINTS = [
  'Classic layout phù hợp cho service pages.',
  'Modern layout tốt cho dịch vụ cao cấp.',
  'Related services giúp upsell.',
];

export default function ServiceDetailExperiencePage() {
  const experienceSetting = useQuery(api.settings.getByKey, { key: EXPERIENCE_KEY });
  const servicesModule = useQuery(api.admin.modules.getModuleByKey, { key: 'services' });
  const brandColorSetting = useQuery(api.settings.getByKey, { key: 'site_brand_color' });
  const exampleServiceSlug = useExampleServiceSlug();
  const [previewDevice, setPreviewDevice] = useState<DeviceType>('desktop');
  const [isPanelExpanded, setIsPanelExpanded] = useState(true);

  const serverConfig = useMemo<ServiceDetailExperienceConfig>(() => {
    const raw = experienceSetting?.value as Partial<ServiceDetailExperienceConfig> | undefined;
    return { ...DEFAULT_CONFIG, ...raw };
  }, [experienceSetting?.value]);

  const isLoading = experienceSetting === undefined || servicesModule === undefined;
  const brandColor = (brandColorSetting?.value as string) || '#8b5cf6';

  const { config, setConfig, hasChanges } = useExperienceConfig(serverConfig, DEFAULT_CONFIG, isLoading);
  const { handleSave, isSaving } = useExperienceSave(
    EXPERIENCE_KEY,
    config,
    MESSAGES.saveSuccess(EXPERIENCE_NAMES[EXPERIENCE_KEY])
  );

  const updateConfig = <K extends keyof ServiceDetailExperienceConfig>(
    key: K,
    value: ServiceDetailExperienceConfig[K]
  ) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const getPreviewProps = () => {
    const base = {
      layoutStyle: config.layoutStyle,
      showRelated: config.showRelated,
      brandColor,
      device: previewDevice,
    };
    if (config.layoutStyle === 'classic') {
      return {
        ...base,
        showShare: config.showShare,
        quickContactEnabled: config.quickContactEnabled,
        quickContactTitle: config.quickContactTitle,
        quickContactDescription: config.quickContactDescription,
        quickContactShowPrice: config.quickContactShowPrice,
        quickContactButtonText: config.quickContactButtonText,
        quickContactButtonLink: config.quickContactButtonLink,
      };
    }
    if (config.layoutStyle === 'modern') {
      return {
        ...base,
        showShare: false,
        modernContactEnabled: config.modernContactEnabled,
        modernContactShowPrice: config.modernContactShowPrice,
        modernHeroCtaText: config.modernHeroCtaText,
        modernHeroCtaLink: config.modernHeroCtaLink,
      };
    }
    return {
      ...base,
      showShare: false,
      minimalCtaEnabled: config.minimalCtaEnabled,
      minimalShowPrice: config.minimalShowPrice,
      minimalCtaText: config.minimalCtaText,
      minimalCtaButtonText: config.minimalCtaButtonText,
      minimalCtaButtonLink: config.minimalCtaButtonLink,
    };
  };

  const renderLayoutSpecificControls = () => {
    if (config.layoutStyle === 'classic') {
      return (
        <>
          <ToggleRow
            label="Khối liên hệ nhanh"
            description="Hiện/ẩn sidebar liên hệ"
            checked={config.quickContactEnabled}
            onChange={(v) => updateConfig('quickContactEnabled', v)}
            accentColor="#8b5cf6"
          />
          <ToggleRow
            label="Nút chia sẻ"
            description="Copy link dịch vụ"
            checked={config.showShare}
            onChange={(v) => updateConfig('showShare', v)}
            accentColor="#8b5cf6"
          />
          <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-2">
            <SettingInput
              type="text"
              label="Tiêu đề khối liên hệ"
              value={config.quickContactTitle}
              onChange={(v) => updateConfig('quickContactTitle', v)}
              focusColor="focus:border-violet-500"
            />
            <SettingInput
              type="text"
              label="Mô tả khối liên hệ"
              value={config.quickContactDescription}
              onChange={(v) => updateConfig('quickContactDescription', v)}
              focusColor="focus:border-violet-500"
            />
            <SettingInput
              type="text"
              label="Text nút liên hệ"
              value={config.quickContactButtonText}
              onChange={(v) => updateConfig('quickContactButtonText', v)}
              focusColor="focus:border-violet-500"
            />
            <SettingInput
              type="text"
              label="Link nút (để trống = mặc định)"
              value={config.quickContactButtonLink}
              onChange={(v) => updateConfig('quickContactButtonLink', v)}
              focusColor="focus:border-violet-500"
            />
          </div>
        </>
      );
    }
    if (config.layoutStyle === 'modern') {
      return (
        <>
          <ToggleRow
            label="Cụm liên hệ Hero"
            description="Hiện giá và nút trong Hero"
            checked={config.modernContactEnabled}
            onChange={(v) => updateConfig('modernContactEnabled', v)}
            accentColor="#8b5cf6"
          />
          <ToggleRow
            label="Hiện giá trong Hero"
            description="Hiển thị giá dịch vụ"
            checked={config.modernContactShowPrice}
            onChange={(v) => updateConfig('modernContactShowPrice', v)}
            accentColor="#8b5cf6"
          />
          <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-2">
            <SettingInput
              type="text"
              label="Text nút Hero"
              value={config.modernHeroCtaText}
              onChange={(v) => updateConfig('modernHeroCtaText', v)}
              focusColor="focus:border-violet-500"
            />
            <SettingInput
              type="text"
              label="Link nút (để trống = mặc định)"
              value={config.modernHeroCtaLink}
              onChange={(v) => updateConfig('modernHeroCtaLink', v)}
              focusColor="focus:border-violet-500"
            />
          </div>
        </>
      );
    }
    return (
      <>
        <ToggleRow
          label="Khối liên hệ tư vấn"
          description="Hiện/ẩn CTA section"
          checked={config.minimalCtaEnabled}
          onChange={(v) => updateConfig('minimalCtaEnabled', v)}
          accentColor="#8b5cf6"
        />
        <ToggleRow
          label="Hiện giá dịch vụ"
          description="Hiển thị giá trong header"
          checked={config.minimalShowPrice}
          onChange={(v) => updateConfig('minimalShowPrice', v)}
          accentColor="#8b5cf6"
        />
        <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-2">
          <SettingInput
            type="text"
            label="Text CTA Section"
            value={config.minimalCtaText}
            onChange={(v) => updateConfig('minimalCtaText', v)}
            focusColor="focus:border-violet-500"
          />
          <SettingInput
            type="text"
            label="Text nút CTA"
            value={config.minimalCtaButtonText}
            onChange={(v) => updateConfig('minimalCtaButtonText', v)}
            focusColor="focus:border-violet-500"
          />
          <SettingInput
            type="text"
            label="Link nút (để trống = mặc định)"
            value={config.minimalCtaButtonLink}
            onChange={(v) => updateConfig('minimalCtaButtonLink', v)}
            focusColor="focus:border-violet-500"
          />
        </div>
      </>
    );
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
      <header className="h-12 px-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
        <div className="flex items-center gap-2">
          <LayoutTemplate className="w-4 h-4 text-violet-600 dark:text-violet-400" />
          <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">Chi tiết dịch vụ</span>
        </div>
        <div className="flex items-center gap-3">
          <DeviceToggle value={previewDevice} onChange={setPreviewDevice} size="sm" />
          <Button
            size="sm"
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            className="bg-violet-600 hover:bg-violet-500 gap-1.5"
          >
            {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            <span>{hasChanges ? 'Lưu' : 'Đã lưu'}</span>
          </Button>
        </div>
      </header>

      <main className="flex-1 overflow-auto p-4 bg-slate-50 dark:bg-slate-950">
        <div className={`mx-auto transition-all duration-300 ${deviceWidths[previewDevice]}`}>
          <BrowserFrame url={`yoursite.com/services/${exampleServiceSlug || 'example-service'}`} maxHeight="calc(100vh - 320px)">
            <ServiceDetailPreview {...getPreviewProps()} />
          </BrowserFrame>
        </div>
      </main>

      <ConfigPanel
        isExpanded={isPanelExpanded}
        onToggle={() => setIsPanelExpanded(!isPanelExpanded)}
        expandedHeight="260px"
        leftContent={
          <LayoutTabs
            layouts={LAYOUT_STYLES}
            activeLayout={config.layoutStyle}
            onChange={(layout) => setConfig(prev => ({ ...prev, layoutStyle: layout }))}
            accentColor="#8b5cf6"
          />
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <ControlCard title="Khối hiển thị">
            <ToggleRow
              label="Dịch vụ liên quan"
              checked={config.showRelated}
              onChange={(v) => updateConfig('showRelated', v)}
              accentColor="#8b5cf6"
            />
          </ControlCard>

          <ControlCard title={`Cấu hình ${config.layoutStyle}`}>
            {renderLayoutSpecificControls()}
          </ControlCard>

          <ControlCard title="Module liên quan">
            <ExperienceModuleLink
              enabled={servicesModule?.enabled ?? false}
              href="/system/modules/services"
              icon={Briefcase}
              title="Dịch vụ"
              colorScheme="cyan"
            />
          </ControlCard>

          <Card className="p-2">
            {exampleServiceSlug && (
              <div className="mb-2">
                <ExampleLinks
                  links={[{ label: 'Xem dịch vụ mẫu', url: `/services/${exampleServiceSlug}` }]}
                  color="#8b5cf6"
                  compact
                />
              </div>
            )}
            <ExperienceHintCard hints={HINTS} />
          </Card>
        </div>
      </ConfigPanel>
    </div>
  );
}
