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
  layouts: {
    classic: ClassicLayoutConfig;
    modern: ModernLayoutConfig;
    minimal: MinimalLayoutConfig;
  };
};

type ClassicLayoutConfig = {
  showRelated: boolean;
  showShare: boolean;
  quickContactEnabled: boolean;
  quickContactTitle: string;
  quickContactDescription: string;
  quickContactShowPrice: boolean;
  quickContactButtonText: string;
  quickContactButtonLink: string;
};

type ModernLayoutConfig = {
  showRelated: boolean;
  modernContactEnabled: boolean;
  modernContactShowPrice: boolean;
  modernHeroCtaText: string;
  modernHeroCtaLink: string;
};

type MinimalLayoutConfig = {
  showRelated: boolean;
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
  layouts: {
    classic: {
      showRelated: true,
      showShare: true,
      quickContactEnabled: true,
      quickContactTitle: 'Liên hệ nhanh',
      quickContactDescription: 'Tư vấn miễn phí, báo giá trong 24h.',
      quickContactShowPrice: true,
      quickContactButtonText: 'Liên hệ tư vấn',
      quickContactButtonLink: '',
    },
    modern: {
      showRelated: true,
      modernContactEnabled: true,
      modernContactShowPrice: true,
      modernHeroCtaText: 'Liên hệ tư vấn',
      modernHeroCtaLink: '',
    },
    minimal: {
      showRelated: true,
      minimalCtaText: 'Quan tâm đến dịch vụ này?',
      minimalCtaButtonText: 'Liên hệ tư vấn',
      minimalCtaButtonLink: '',
    },
  },
};

const HINTS = [
  'Classic layout phù hợp cho service pages.',
  'Modern layout tốt cho dịch vụ cao cấp.',
  'Related services giúp upsell.',
  'Mỗi layout có config riêng - chuyển tab để chỉnh.',
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
    return {
      layoutStyle: raw?.layoutStyle ?? 'classic',
      layouts: {
        classic: { ...DEFAULT_CONFIG.layouts.classic, ...raw?.layouts?.classic },
        modern: { ...DEFAULT_CONFIG.layouts.modern, ...raw?.layouts?.modern },
        minimal: { ...DEFAULT_CONFIG.layouts.minimal, ...raw?.layouts?.minimal },
      },
    };
  }, [experienceSetting?.value]);

  const isLoading = experienceSetting === undefined || servicesModule === undefined;
  const brandColor = (brandColorSetting?.value as string) || '#8b5cf6';

  const { config, setConfig, hasChanges } = useExperienceConfig(serverConfig, DEFAULT_CONFIG, isLoading);
  const { handleSave, isSaving } = useExperienceSave(
    EXPERIENCE_KEY,
    config,
    MESSAGES.saveSuccess(EXPERIENCE_NAMES[EXPERIENCE_KEY])
  );

  const currentLayoutConfig = config.layouts[config.layoutStyle];

  const updateLayoutConfig = <K extends keyof typeof currentLayoutConfig>(
    key: K,
    value: (typeof currentLayoutConfig)[K]
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

  const getPreviewProps = () => {
    const layoutConfig = currentLayoutConfig;
    if (config.layoutStyle === 'classic') {
      const c = layoutConfig as ClassicLayoutConfig;
      return {
        layoutStyle: config.layoutStyle,
        showRelated: c.showRelated,
        showShare: c.showShare,
        quickContactEnabled: c.quickContactEnabled,
        quickContactTitle: c.quickContactTitle,
        quickContactDescription: c.quickContactDescription,
        quickContactShowPrice: c.quickContactShowPrice,
        quickContactButtonText: c.quickContactButtonText,
        quickContactButtonLink: c.quickContactButtonLink,
        brandColor,
        device: previewDevice,
      };
    }
    if (config.layoutStyle === 'modern') {
      const c = layoutConfig as ModernLayoutConfig;
      return {
        layoutStyle: config.layoutStyle,
        showRelated: c.showRelated,
        showShare: false,
        modernContactEnabled: c.modernContactEnabled,
        modernContactShowPrice: c.modernContactShowPrice,
        modernHeroCtaText: c.modernHeroCtaText,
        modernHeroCtaLink: c.modernHeroCtaLink,
        brandColor,
        device: previewDevice,
      };
    }
    const c = layoutConfig as MinimalLayoutConfig;
    return {
      layoutStyle: config.layoutStyle,
      showRelated: c.showRelated,
      showShare: false,
      minimalCtaText: c.minimalCtaText,
      minimalCtaButtonText: c.minimalCtaButtonText,
      minimalCtaButtonLink: c.minimalCtaButtonLink,
      brandColor,
      device: previewDevice,
    };
  };

  const renderLayoutSpecificControls = () => {
    if (config.layoutStyle === 'classic') {
      const c = currentLayoutConfig as ClassicLayoutConfig;
      return (
        <>
          <ToggleRow
            label="Khối liên hệ nhanh"
            description="Hiện/ẩn sidebar liên hệ"
            checked={c.quickContactEnabled}
            onChange={(v) => updateLayoutConfig('quickContactEnabled' as keyof typeof currentLayoutConfig, v as never)}
            accentColor="#8b5cf6"
          />
          <ToggleRow
            label="Hiện giá dịch vụ"
            description="Hiển thị giá trong khối"
            checked={c.quickContactShowPrice}
            onChange={(v) => updateLayoutConfig('quickContactShowPrice' as keyof typeof currentLayoutConfig, v as never)}
            accentColor="#8b5cf6"
          />
          <ToggleRow
            label="Nút chia sẻ"
            description="Copy link dịch vụ"
            checked={c.showShare}
            onChange={(v) => updateLayoutConfig('showShare' as keyof typeof currentLayoutConfig, v as never)}
            accentColor="#8b5cf6"
          />
          <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-2">
            <SettingInput
              type="text"
              label="Tiêu đề khối liên hệ"
              value={c.quickContactTitle}
              onChange={(v) => updateLayoutConfig('quickContactTitle' as keyof typeof currentLayoutConfig, v as never)}
              focusColor="focus:border-violet-500"
            />
            <SettingInput
              type="text"
              label="Text nút liên hệ"
              value={c.quickContactButtonText}
              onChange={(v) => updateLayoutConfig('quickContactButtonText' as keyof typeof currentLayoutConfig, v as never)}
              focusColor="focus:border-violet-500"
            />
          </div>
        </>
      );
    }
    if (config.layoutStyle === 'modern') {
      const c = currentLayoutConfig as ModernLayoutConfig;
      return (
        <>
          <ToggleRow
            label="Cụm liên hệ Hero"
            description="Giá và nút trong Hero"
            checked={c.modernContactEnabled}
            onChange={(v) => updateLayoutConfig('modernContactEnabled' as keyof typeof currentLayoutConfig, v as never)}
            accentColor="#8b5cf6"
          />
          <ToggleRow
            label="Hiện giá trong Hero"
            description="Hiển thị giá dịch vụ"
            checked={c.modernContactShowPrice}
            onChange={(v) => updateLayoutConfig('modernContactShowPrice' as keyof typeof currentLayoutConfig, v as never)}
            accentColor="#8b5cf6"
          />
          <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
            <SettingInput
              type="text"
              label="Text nút Hero"
              value={c.modernHeroCtaText}
              onChange={(v) => updateLayoutConfig('modernHeroCtaText' as keyof typeof currentLayoutConfig, v as never)}
              focusColor="focus:border-violet-500"
            />
          </div>
        </>
      );
    }
    const c = currentLayoutConfig as MinimalLayoutConfig;
    return (
      <>
        <div className="space-y-2">
          <SettingInput
            type="text"
            label="Text CTA Section"
            value={c.minimalCtaText}
            onChange={(v) => updateLayoutConfig('minimalCtaText' as keyof typeof currentLayoutConfig, v as never)}
            focusColor="focus:border-violet-500"
          />
          <SettingInput
            type="text"
            label="Text nút CTA"
            value={c.minimalCtaButtonText}
            onChange={(v) => updateLayoutConfig('minimalCtaButtonText' as keyof typeof currentLayoutConfig, v as never)}
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
      {/* Compact Header - 48px */}
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

      {/* Preview Area */}
      <main className="flex-1 overflow-auto p-4 bg-slate-50 dark:bg-slate-950">
        <div className={`mx-auto transition-all duration-300 ${deviceWidths[previewDevice]}`}>
          <BrowserFrame url={`yoursite.com/services/${exampleServiceSlug || 'example-service'}`} maxHeight="calc(100vh - 320px)">
            <ServiceDetailPreview {...getPreviewProps()} />
          </BrowserFrame>
        </div>
      </main>

      {/* Bottom Panel */}
      <ConfigPanel
        isExpanded={isPanelExpanded}
        onToggle={() => setIsPanelExpanded(!isPanelExpanded)}
        expandedHeight="220px"
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
              checked={currentLayoutConfig.showRelated}
              onChange={(v) => updateLayoutConfig('showRelated', v)}
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
