'use client';

import React, { useMemo } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { LayoutTemplate, Mail } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/admin/components/ui';
import { ModuleHeader, SettingsCard, SettingSelect } from '@/components/modules/shared';
import { 
  ExperienceModuleLink, 
  ExperienceSummaryGrid, 
  ExperienceBlockToggle,
  ExperienceHintCard,
  ExperiencePreview,
  ContactPreview,
  type SummaryItem 
} from '@/components/experiences';
import { useExperienceConfig, useExperienceSave, EXPERIENCE_NAMES, MESSAGES } from '@/lib/experiences';

type ContactLayoutStyle = 'form-only' | 'with-map' | 'with-info';

type ContactExperienceConfig = {
  layoutStyle: ContactLayoutStyle;
  showMap: boolean;
  showContactInfo: boolean;
  showSocialLinks: boolean;
};

const EXPERIENCE_KEY = 'contact_ui';

const LAYOUT_STYLES: { id: ContactLayoutStyle; label: string; description: string }[] = [
  { description: 'Chỉ có form liên hệ', id: 'form-only', label: 'Form Only' },
  { description: 'Form + Map', id: 'with-map', label: 'With Map' },
  { description: 'Form + Contact Info sidebar', id: 'with-info', label: 'With Info' },
];

const DEFAULT_CONFIG: ContactExperienceConfig = {
  layoutStyle: 'with-info',
  showMap: true,
  showContactInfo: true,
  showSocialLinks: true,
};

const HINTS = [
  'With-info layout tốt cho business contact page.',
  'Map giúp khách hàng tìm địa chỉ dễ dàng.',
  'Social links tăng kết nối với khách hàng.',
];

export default function ContactExperiencePage() {
  const experienceSetting = useQuery(api.settings.getByKey, { key: EXPERIENCE_KEY });

  const serverConfig = useMemo<ContactExperienceConfig>(() => {
    const raw = experienceSetting?.value as Partial<ContactExperienceConfig> | undefined;
    return {
      layoutStyle: raw?.layoutStyle ?? 'with-info',
      showMap: raw?.showMap ?? true,
      showContactInfo: raw?.showContactInfo ?? true,
      showSocialLinks: raw?.showSocialLinks ?? true,
    };
  }, [experienceSetting?.value]);

  const isLoading = experienceSetting === undefined;

  const { config, setConfig, hasChanges } = useExperienceConfig(serverConfig, DEFAULT_CONFIG, isLoading);
  const { handleSave, isSaving } = useExperienceSave(EXPERIENCE_KEY, config, MESSAGES.saveSuccess(EXPERIENCE_NAMES[EXPERIENCE_KEY]));

  const summaryItems: SummaryItem[] = [
    { label: 'Layout', value: config.layoutStyle, format: 'capitalize' },
    { label: 'Map', value: config.showMap },
    { label: 'Contact Info', value: config.showContactInfo },
    { label: 'Social Links', value: config.showSocialLinks },
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
        title="Trải nghiệm: Trang liên hệ"
        description="Cấu hình layout, map, contact info và social links cho trang liên hệ."
        iconBgClass="bg-indigo-500/10"
        iconTextClass="text-indigo-600 dark:text-indigo-400"
        buttonClass="bg-indigo-600 hover:bg-indigo-500"
        onSave={handleSave}
        hasChanges={hasChanges}
        isSaving={isSaving}
      />

      {/* Full-width Preview */}
      <ExperiencePreview title="Trang liên hệ">
        <ContactPreview
          layoutStyle={config.layoutStyle}
          showMap={config.showMap}
          showContactInfo={config.showContactInfo}
          showSocialLinks={config.showSocialLinks}
        />
      </ExperiencePreview>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="space-y-4 lg:col-span-2">
          <SettingsCard>
            <SettingSelect
              label="Layout trang liên hệ"
              value={config.layoutStyle}
              onChange={(value) => setConfig(prev => ({ ...prev, layoutStyle: value as ContactLayoutStyle }))}
              options={LAYOUT_STYLES.map(style => ({ label: `${style.label} - ${style.description}`, value: style.id }))}
              focusColor="focus:border-indigo-500"
            />
          </SettingsCard>

          <Card className="p-4">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">Khối hiển thị</h3>
            <div className="space-y-3">
              <ExperienceBlockToggle
                label="Bản đồ (Map)"
                description="Google Maps hoặc map service"
                enabled={config.showMap}
                onChange={() => setConfig(prev => ({ ...prev, showMap: !prev.showMap }))}
                color="bg-indigo-500"
              />

              <ExperienceBlockToggle
                label="Thông tin liên hệ"
                description="Địa chỉ, phone, email"
                enabled={config.showContactInfo}
                onChange={() => setConfig(prev => ({ ...prev, showContactInfo: !prev.showContactInfo }))}
                color="bg-indigo-500"
              />

              <ExperienceBlockToggle
                label="Social media links"
                description="FB, Twitter, Instagram..."
                enabled={config.showSocialLinks}
                onChange={() => setConfig(prev => ({ ...prev, showSocialLinks: !prev.showSocialLinks }))}
                color="bg-indigo-500"
              />
            </div>
          </Card>

          <ExperienceSummaryGrid items={summaryItems} />
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Module liên quan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <ExperienceModuleLink
                enabled={true}
                href="/system/settings"
                icon={Mail}
                title="System Settings"
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
