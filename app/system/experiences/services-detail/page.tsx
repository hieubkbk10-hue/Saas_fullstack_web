'use client';

import React, { useMemo } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Briefcase, LayoutTemplate } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/admin/components/ui';
import { ModuleHeader, SettingsCard, SettingInput, SettingSelect } from '@/components/modules/shared';
import { 
  ExperienceModuleLink, 
  ExperienceSummaryGrid, 
  ExperienceBlockToggle,
  ExperienceHintCard,
  ExperiencePreview,
  ServiceDetailPreview,
  ExampleLinks,
  type SummaryItem 
} from '@/components/experiences';
import { useExperienceConfig, useExperienceSave, useExampleServiceSlug, EXPERIENCE_NAMES, MESSAGES } from '@/lib/experiences';

type DetailLayoutStyle = 'classic' | 'modern' | 'minimal';

type ServiceDetailExperienceConfig = {
  layoutStyle: DetailLayoutStyle;
  showRelated: boolean;
  showShare: boolean;
  // Classic config
  quickContactEnabled: boolean;
  quickContactTitle: string;
  quickContactDescription: string;
  quickContactShowPrice: boolean;
  quickContactButtonText: string;
  quickContactButtonLink: string;
  // Modern config
  modernHeroCtaText: string;
  modernHeroCtaLink: string;
  modernCtaSectionTitle: string;
  modernCtaSectionDescription: string;
  modernCtaButtonText: string;
  modernCtaButtonLink: string;
  // Minimal config
  minimalCtaText: string;
  minimalCtaButtonText: string;
  minimalCtaButtonLink: string;
};

const EXPERIENCE_KEY = 'services_detail_ui';

const LAYOUT_STYLES: { id: DetailLayoutStyle; label: string; description: string }[] = [
  { description: 'Layout truyền thống với sidebar', id: 'classic', label: 'Classic' },
  { description: 'Hero image, full-width', id: 'modern', label: 'Modern' },
  { description: 'Tối giản, tập trung nội dung', id: 'minimal', label: 'Minimal' },
];

const DEFAULT_CONFIG: ServiceDetailExperienceConfig = {
  layoutStyle: 'classic',
  showRelated: true,
  showShare: true,
  // Classic
  quickContactEnabled: true,
  quickContactTitle: 'Liên hệ nhanh',
  quickContactDescription: 'Tư vấn miễn phí, báo giá trong 24h.',
  quickContactShowPrice: true,
  quickContactButtonText: 'Liên hệ tư vấn',
  quickContactButtonLink: '',
  // Modern
  modernHeroCtaText: 'Liên hệ tư vấn',
  modernHeroCtaLink: '',
  modernCtaSectionTitle: 'Sẵn sàng bắt đầu?',
  modernCtaSectionDescription: 'Liên hệ ngay để được tư vấn miễn phí và nhận báo giá chi tiết cho dự án của bạn.',
  modernCtaButtonText: 'Liên hệ tư vấn',
  modernCtaButtonLink: '',
  // Minimal
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
  const exampleServiceSlug = useExampleServiceSlug();

  const serverConfig = useMemo<ServiceDetailExperienceConfig>(() => {
    const raw = experienceSetting?.value as Partial<ServiceDetailExperienceConfig> | undefined;
    return {
      layoutStyle: raw?.layoutStyle ?? 'classic',
      showRelated: raw?.showRelated ?? true,
      showShare: raw?.showShare ?? true,
      // Classic
      quickContactEnabled: raw?.quickContactEnabled ?? true,
      quickContactTitle: raw?.quickContactTitle ?? 'Liên hệ nhanh',
      quickContactDescription: raw?.quickContactDescription ?? 'Tư vấn miễn phí, báo giá trong 24h.',
      quickContactShowPrice: raw?.quickContactShowPrice ?? true,
      quickContactButtonText: raw?.quickContactButtonText ?? 'Liên hệ tư vấn',
      quickContactButtonLink: raw?.quickContactButtonLink ?? '',
      // Modern
      modernHeroCtaText: raw?.modernHeroCtaText ?? 'Liên hệ tư vấn',
      modernHeroCtaLink: raw?.modernHeroCtaLink ?? '',
      modernCtaSectionTitle: raw?.modernCtaSectionTitle ?? 'Sẵn sàng bắt đầu?',
      modernCtaSectionDescription: raw?.modernCtaSectionDescription ?? 'Liên hệ ngay để được tư vấn miễn phí và nhận báo giá chi tiết cho dự án của bạn.',
      modernCtaButtonText: raw?.modernCtaButtonText ?? 'Liên hệ tư vấn',
      modernCtaButtonLink: raw?.modernCtaButtonLink ?? '',
      // Minimal
      minimalCtaText: raw?.minimalCtaText ?? 'Quan tâm đến dịch vụ này?',
      minimalCtaButtonText: raw?.minimalCtaButtonText ?? 'Liên hệ tư vấn',
      minimalCtaButtonLink: raw?.minimalCtaButtonLink ?? '',
    };
  }, [experienceSetting?.value]);

  const isLoading = experienceSetting === undefined || servicesModule === undefined;

  const { config, setConfig, hasChanges } = useExperienceConfig(serverConfig, DEFAULT_CONFIG, isLoading);
  const { handleSave, isSaving } = useExperienceSave(EXPERIENCE_KEY, config, MESSAGES.saveSuccess(EXPERIENCE_NAMES[EXPERIENCE_KEY]));

  const summaryItems: SummaryItem[] = [
    { label: 'Layout', value: config.layoutStyle, format: 'capitalize' },
    { label: 'Related Services', value: config.showRelated },
    { label: 'Share Buttons', value: config.showShare },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500">{MESSAGES.loading}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <ModuleHeader
        icon={LayoutTemplate}
        title="Trải nghiệm: Chi tiết dịch vụ"
        description="Cấu hình layout và các khối hiển thị cho trang chi tiết dịch vụ."
        iconBgClass="bg-violet-500/10"
        iconTextClass="text-violet-600 dark:text-violet-400"
        buttonClass="bg-violet-600 hover:bg-violet-500"
        onSave={handleSave}
        hasChanges={hasChanges}
        isSaving={isSaving}
      />

      {/* Full-width Preview - Realtime */}
      <ExperiencePreview title="Chi tiết dịch vụ">
        <ServiceDetailPreview
          layoutStyle={config.layoutStyle}
          showRelated={config.showRelated}
          showShare={config.showShare}
          quickContactEnabled={config.quickContactEnabled}
          quickContactTitle={config.quickContactTitle}
          quickContactDescription={config.quickContactDescription}
          quickContactShowPrice={config.quickContactShowPrice}
          quickContactButtonText={config.quickContactButtonText}
          quickContactButtonLink={config.quickContactButtonLink}
          modernHeroCtaText={config.modernHeroCtaText}
          modernHeroCtaLink={config.modernHeroCtaLink}
          modernCtaSectionTitle={config.modernCtaSectionTitle}
          modernCtaSectionDescription={config.modernCtaSectionDescription}
          modernCtaButtonText={config.modernCtaButtonText}
          modernCtaButtonLink={config.modernCtaButtonLink}
          minimalCtaText={config.minimalCtaText}
          minimalCtaButtonText={config.minimalCtaButtonText}
          minimalCtaButtonLink={config.minimalCtaButtonLink}
        />
      </ExperiencePreview>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="space-y-4 lg:col-span-2">
          <SettingsCard>
            <SettingSelect
              label="Layout chi tiết"
              value={config.layoutStyle}
              onChange={(value) => setConfig(prev => ({ ...prev, layoutStyle: value as DetailLayoutStyle }))}
              options={LAYOUT_STYLES.map(style => ({ label: `${style.label} - ${style.description}`, value: style.id }))}
              focusColor="focus:border-violet-500"
            />
          </SettingsCard>

          {config.layoutStyle === 'classic' && (
            <SettingsCard title="Cấu hình thêm cho Classic">
              <ExperienceBlockToggle
                label="Hiển thị khối liên hệ nhanh"
                description="Hiện/ẩn cục liên hệ nhanh ở sidebar"
                enabled={config.quickContactEnabled}
                onChange={() => setConfig(prev => ({ ...prev, quickContactEnabled: !prev.quickContactEnabled }))}
                color="bg-violet-500"
              />

              <SettingInput
                type="text"
                label="Tiêu đề"
                value={config.quickContactTitle}
                onChange={(value) => setConfig(prev => ({ ...prev, quickContactTitle: value }))}
                focusColor="focus:border-violet-500"
              />

              <SettingInput
                type="text"
                label="Mô tả"
                value={config.quickContactDescription}
                onChange={(value) => setConfig(prev => ({ ...prev, quickContactDescription: value }))}
                focusColor="focus:border-violet-500"
              />

              <ExperienceBlockToggle
                label="Hiển thị giá trong khối"
                description="Ẩn/hiện giá ở phần liên hệ nhanh"
                enabled={config.quickContactShowPrice}
                onChange={() => setConfig(prev => ({ ...prev, quickContactShowPrice: !prev.quickContactShowPrice }))}
                color="bg-violet-500"
              />

              <SettingInput
                type="text"
                label="Text nút liên hệ"
                value={config.quickContactButtonText}
                onChange={(value) => setConfig(prev => ({ ...prev, quickContactButtonText: value }))}
                focusColor="focus:border-violet-500"
              />

              <div className="space-y-1">
                <SettingInput
                  type="text"
                  label="Link nút liên hệ"
                  value={config.quickContactButtonLink}
                  onChange={(value) => setConfig(prev => ({ ...prev, quickContactButtonLink: value }))}
                  focusColor="focus:border-violet-500"
                />
                <p className="text-xs text-slate-500">VD: https://zalo.me/ hoặc https://m.me/yourpage</p>
              </div>

              <ExperienceBlockToggle
                label="Chia sẻ mạng xã hội"
                description="Nút copy link dịch vụ"
                enabled={config.showShare}
                onChange={() => setConfig(prev => ({ ...prev, showShare: !prev.showShare }))}
                color="bg-violet-500"
              />

              <ExperienceBlockToggle
                label="Dịch vụ liên quan"
                description="Hiển thị related services"
                enabled={config.showRelated}
                onChange={() => setConfig(prev => ({ ...prev, showRelated: !prev.showRelated }))}
                color="bg-violet-500"
              />
            </SettingsCard>
          )}

          {config.layoutStyle === 'modern' && (
            <SettingsCard title="Cấu hình thêm cho Modern">
              <SettingInput
                type="text"
                label="Text nút liên hệ"
                value={config.modernHeroCtaText}
                onChange={(value) => setConfig(prev => ({ ...prev, modernHeroCtaText: value }))}
                focusColor="focus:border-violet-500"
              />

              <div className="space-y-1">
                <SettingInput
                  type="text"
                  label="Link nút liên hệ"
                  value={config.modernHeroCtaLink}
                  onChange={(value) => setConfig(prev => ({ ...prev, modernHeroCtaLink: value }))}
                  focusColor="focus:border-violet-500"
                />
                <p className="text-xs text-slate-500">VD: https://zalo.me/ hoặc https://m.me/yourpage</p>
              </div>

              <ExperienceBlockToggle
                label="Dịch vụ liên quan"
                description="Hiển thị related services"
                enabled={config.showRelated}
                onChange={() => setConfig(prev => ({ ...prev, showRelated: !prev.showRelated }))}
                color="bg-violet-500"
              />
            </SettingsCard>
          )}

          {config.layoutStyle === 'minimal' && (
            <SettingsCard title="Cấu hình thêm cho Minimal">
              <SettingInput
                type="text"
                label="Text CTA Section"
                value={config.minimalCtaText}
                onChange={(value) => setConfig(prev => ({ ...prev, minimalCtaText: value }))}
                focusColor="focus:border-violet-500"
              />

              <SettingInput
                type="text"
                label="Text nút CTA"
                value={config.minimalCtaButtonText}
                onChange={(value) => setConfig(prev => ({ ...prev, minimalCtaButtonText: value }))}
                focusColor="focus:border-violet-500"
              />

              <div className="space-y-1">
                <SettingInput
                  type="text"
                  label="Link nút CTA"
                  value={config.minimalCtaButtonLink}
                  onChange={(value) => setConfig(prev => ({ ...prev, minimalCtaButtonLink: value }))}
                  focusColor="focus:border-violet-500"
                />
                <p className="text-xs text-slate-500">VD: https://zalo.me/ hoặc https://m.me/yourpage</p>
              </div>

              <ExperienceBlockToggle
                label="Dịch vụ liên quan"
                description="Hiển thị related services"
                enabled={config.showRelated}
                onChange={() => setConfig(prev => ({ ...prev, showRelated: !prev.showRelated }))}
                color="bg-violet-500"
              />
            </SettingsCard>
          )}

          <ExperienceSummaryGrid items={summaryItems} />
        </div>

        <div className="space-y-4">
          {exampleServiceSlug && (
            <ExampleLinks
              links={[
                { label: 'Xem dịch vụ mẫu', url: `/services/${exampleServiceSlug}`, description: 'Open in new tab' },
              ]}
              color="#8b5cf6"
            />
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Module liên quan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <ExperienceModuleLink
                enabled={servicesModule?.enabled ?? false}
                href="/system/modules/services"
                icon={Briefcase}
                title="Dịch vụ"
                colorScheme="cyan"
              />
            </CardContent>
          </Card>

          <ExperienceHintCard hints={HINTS} />
        </div>
      </div>
    </div>
  );
}
