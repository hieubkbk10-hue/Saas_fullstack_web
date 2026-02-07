'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useQuery } from 'convex/react';
import { FileText, LayoutTemplate, Loader2, Save, User } from 'lucide-react';
import { api } from '@/convex/_generated/api';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/app/admin/components/ui';
import {
  AccountProfilePreview,
  ExperienceHintCard,
  ExperienceModuleLink,
} from '@/components/experiences';
import {
  BrowserFrame,
  ControlCard,
  DeviceToggle,
  ToggleRow,
  deviceWidths,
  type DeviceType,
} from '@/components/experiences/editor';
import { EXPERIENCE_NAMES, MESSAGES, useExperienceConfig, useExperienceSave } from '@/lib/experiences';

type AccountProfileExperienceConfig = {
  showQuickActions: boolean;
  showContactInfo: boolean;
  showLoyaltyBadge: boolean;
};

const EXPERIENCE_KEY = 'account_profile_ui';

const DEFAULT_CONFIG: AccountProfileExperienceConfig = {
  showQuickActions: true,
  showContactInfo: true,
  showLoyaltyBadge: true,
};

const HINTS = [
  'Trang profile dành cho khách đã đăng nhập.',
  'Quick actions giúp điều hướng nhanh tới Orders/Wishlist.',
  'Thông tin liên hệ lấy từ hồ sơ khách hàng.',
];

export default function AccountProfileExperiencePage() {
  const experienceSetting = useQuery(api.settings.getByKey, { key: EXPERIENCE_KEY });
  const customersModule = useQuery(api.admin.modules.getModuleByKey, { key: 'customers' });
  const [previewDevice, setPreviewDevice] = useState<DeviceType>('desktop');

  const serverConfig = useMemo<AccountProfileExperienceConfig>(() => {
    const raw = experienceSetting?.value as Partial<AccountProfileExperienceConfig> | undefined;
    return {
      showQuickActions: raw?.showQuickActions ?? true,
      showContactInfo: raw?.showContactInfo ?? true,
      showLoyaltyBadge: raw?.showLoyaltyBadge ?? true,
    };
  }, [experienceSetting?.value]);

  const isLoading = experienceSetting === undefined || customersModule === undefined;

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
            <LayoutTemplate className="w-5 h-5 text-teal-600" />
            <h1 className="text-2xl font-bold">Profile (Account)</h1>
          </div>
          <Link href="/system/experiences" className="text-sm text-blue-600 hover:underline">
            Quay lại danh sách
          </Link>
        </div>
        <Button
          size="sm"
          onClick={handleSave}
          disabled={!hasChanges || isSaving}
          className="bg-teal-600 hover:bg-teal-500 gap-1.5"
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
              label="Quick actions"
              checked={config.showQuickActions}
              onChange={(v) => setConfig(prev => ({ ...prev, showQuickActions: v }))}
              accentColor="#14b8a6"
            />
            <ToggleRow
              label="Thông tin liên hệ"
              checked={config.showContactInfo}
              onChange={(v) => setConfig(prev => ({ ...prev, showContactInfo: v }))}
              accentColor="#14b8a6"
            />
            <ToggleRow
              label="Loyalty badge"
              checked={config.showLoyaltyBadge}
              onChange={(v) => setConfig(prev => ({ ...prev, showLoyaltyBadge: v }))}
              accentColor="#14b8a6"
            />
          </ControlCard>

          <ControlCard title="Module liên quan">
            <ExperienceModuleLink
              enabled={customersModule?.enabled ?? false}
              href="/system/modules/customers"
              icon={User}
              title="Khách hàng"
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
              <FileText size={18} /> Preview
            </CardTitle>
            <DeviceToggle value={previewDevice} onChange={setPreviewDevice} size="sm" />
          </div>
        </CardHeader>
        <CardContent>
          <div className={`mx-auto transition-all duration-300 ${deviceWidths[previewDevice]}`}>
            <BrowserFrame url="yoursite.com/account/profile">
              <AccountProfilePreview
                showQuickActions={config.showQuickActions}
                showContactInfo={config.showContactInfo}
                showLoyaltyBadge={config.showLoyaltyBadge}
                brandColor="#14b8a6"
              />
            </BrowserFrame>
          </div>
          <div className="mt-3 text-xs text-slate-500">
            Device: {previewDevice === 'desktop' && 'Desktop'}{previewDevice === 'tablet' && 'Tablet'}{previewDevice === 'mobile' && 'Mobile'}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
