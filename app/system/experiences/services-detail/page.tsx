'use client';

import React, { useMemo } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Briefcase, LayoutTemplate, MessageSquare } from 'lucide-react';
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
  showAuthor: boolean;
  showRelated: boolean;
  showShare: boolean;
  showComments: boolean;
  quickContactEnabled: boolean;
  quickContactTitle: string;
  quickContactDescription: string;
  quickContactShowPrice: boolean;
};

const EXPERIENCE_KEY = 'services_detail_ui';

const LAYOUT_STYLES: { id: DetailLayoutStyle; label: string; description: string }[] = [
  { description: 'Layout truyền thống với sidebar', id: 'classic', label: 'Classic' },
  { description: 'Hero image, full-width', id: 'modern', label: 'Modern' },
  { description: 'Tối giản, tập trung nội dung', id: 'minimal', label: 'Minimal' },
];

const DEFAULT_CONFIG: ServiceDetailExperienceConfig = {
  layoutStyle: 'classic',
  showAuthor: true,
  showRelated: true,
  showShare: true,
  showComments: true,
  quickContactEnabled: true,
  quickContactTitle: 'Liên hệ nhanh',
  quickContactDescription: 'Tư vấn miễn phí, báo giá trong 24h.',
  quickContactShowPrice: true,
};

const HINTS = [
  'Classic layout phù hợp cho service pages.',
  'Modern layout tốt cho dịch vụ cao cấp.',
  'Related services giúp upsell.',
];

export default function ServiceDetailExperiencePage() {
  const experienceSetting = useQuery(api.settings.getByKey, { key: EXPERIENCE_KEY });
  const servicesModule = useQuery(api.admin.modules.getModuleByKey, { key: 'services' });
  const commentsModule = useQuery(api.admin.modules.getModuleByKey, { key: 'comments' });
  const exampleServiceSlug = useExampleServiceSlug();

  const serverConfig = useMemo<ServiceDetailExperienceConfig>(() => {
    const raw = experienceSetting?.value as Partial<ServiceDetailExperienceConfig> | undefined;
    return {
      layoutStyle: raw?.layoutStyle ?? 'classic',
      showAuthor: raw?.showAuthor ?? true,
      showRelated: raw?.showRelated ?? true,
      showShare: raw?.showShare ?? true,
      showComments: raw?.showComments ?? true,
      quickContactEnabled: raw?.quickContactEnabled ?? true,
      quickContactTitle: raw?.quickContactTitle ?? 'Liên hệ nhanh',
      quickContactDescription: raw?.quickContactDescription ?? 'Tư vấn miễn phí, báo giá trong 24h.',
      quickContactShowPrice: raw?.quickContactShowPrice ?? true,
    };
  }, [experienceSetting?.value]);

  const isLoading = experienceSetting === undefined || servicesModule === undefined;

  const { config, setConfig, hasChanges } = useExperienceConfig(serverConfig, DEFAULT_CONFIG, isLoading);
  const { handleSave, isSaving } = useExperienceSave(EXPERIENCE_KEY, config, MESSAGES.saveSuccess(EXPERIENCE_NAMES[EXPERIENCE_KEY]));

  const summaryItems: SummaryItem[] = [
    { label: 'Layout', value: config.layoutStyle, format: 'capitalize' },
    { label: 'Author Info', value: config.showAuthor },
    { label: 'Comments', value: config.showComments },
    { label: 'Related Services', value: config.showRelated },
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
        description="Cấu hình layout, author info, comments và related services."
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
          showAuthor={config.showAuthor}
          showRelated={config.showRelated}
          showShare={config.showShare}
          showComments={config.showComments}
          quickContactEnabled={config.quickContactEnabled}
          quickContactTitle={config.quickContactTitle}
          quickContactDescription={config.quickContactDescription}
          quickContactShowPrice={config.quickContactShowPrice}
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
            <SettingsCard title="Liên hệ nhanh (Classic)">
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
            </SettingsCard>
          )}

          <Card className="p-4">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">Khối hiển thị</h3>
            <div className="space-y-3">
              <ExperienceBlockToggle
                label="Thông tin tác giả"
                description="Hiển thị author và ngày đăng"
                enabled={config.showAuthor}
                onChange={() => setConfig(prev => ({ ...prev, showAuthor: !prev.showAuthor }))}
                color="bg-violet-500"
                disabled={!servicesModule?.enabled}
              />

              <ExperienceBlockToggle
                label="Chia sẻ mạng xã hội"
                description="Nút share Facebook, Twitter..."
                enabled={config.showShare}
                onChange={() => setConfig(prev => ({ ...prev, showShare: !prev.showShare }))}
                color="bg-violet-500"
                disabled={!servicesModule?.enabled}
              />

              <ExperienceBlockToggle
                label="Bình luận & đánh giá"
                description="Nguồn: Module Comments"
                enabled={config.showComments}
                onChange={() => setConfig(prev => ({ ...prev, showComments: !prev.showComments }))}
                color="bg-violet-500"
                disabled={!commentsModule?.enabled}
              />

              <ExperienceBlockToggle
                label="Dịch vụ liên quan"
                description="Hiển thị related services"
                enabled={config.showRelated}
                onChange={() => setConfig(prev => ({ ...prev, showRelated: !prev.showRelated }))}
                color="bg-violet-500"
                disabled={!servicesModule?.enabled}
              />
            </div>
          </Card>

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
              <ExperienceModuleLink
                enabled={commentsModule?.enabled ?? false}
                href="/system/modules/comments"
                icon={MessageSquare}
                title="Comments"
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
