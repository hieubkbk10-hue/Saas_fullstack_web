'use client';

import React, { useState } from 'react';
import { Settings, Globe, Mail, MapPin } from 'lucide-react';
import { FieldConfig } from '@/types/moduleConfig';
import { 
  ModuleHeader, ModuleStatus, ConventionNote,
  FeaturesCard, FieldsCard
} from '@/components/modules/shared';

const SITE_FIELDS: FieldConfig[] = [
  { id: 'S1', name: 'Tên website', key: 'site_năme', type: 'text', required: true, enabled: true, isSystem: true },
  { id: 'S2', name: 'Logo', key: 'logo', type: 'image', required: true, enabled: true, isSystem: true },
  { id: 'S3', name: 'Favicon', key: 'favicon', type: 'image', required: true, enabled: true, isSystem: true },
  { id: 'S4', name: 'Mô tả ngan', key: 'tagline', type: 'text', required: false, enabled: true, isSystem: false },
];

const CONTACT_FIELDS: FieldConfig[] = [
  { id: 'C1', name: 'Email', key: 'email', type: 'email', required: false, enabled: true, isSystem: false },
  { id: 'C2', name: 'Số điện thoại', key: 'phone', type: 'phone', required: false, enabled: true, isSystem: false },
  { id: 'C3', name: 'Dia chi', key: 'address', type: 'textarea', required: false, enabled: true, isSystem: false },
];

const SEO_FIELDS: FieldConfig[] = [
  { id: 'SE1', name: 'Meta Title', key: 'meta_title', type: 'text', required: false, enabled: true, isSystem: false },
  { id: 'SE2', name: 'Meta Description', key: 'meta_description', type: 'textarea', required: false, enabled: true, isSystem: false },
];

const FEATURES = [
  { key: 'enableContact', label: 'Thông tin liên hệ', icon: Mail },
  { key: 'enableSEO', label: 'SEO cơ bản', icon: Globe },
];

export default function SettingsModuleConfigPage() {
  const [features, setFeatures] = useState({ enableContact: true, enableSEO: true });
  const [siteFields, setSiteFields] = useState(SITE_FIELDS);
  const [contactFields, setContactFields] = useState(CONTACT_FIELDS);
  const [seoFields, setSeoFields] = useState(SEO_FIELDS);

  const handleToggleFeature = (key: string) => {
    setFeatures(prev => ({ ...prev, [key]: !(prev as any)[key] }));
  };

  const handleToggleSiteField = (id: string) => {
    setSiteFields(prev => prev.map(f => f.id === id ? { ...f, enabled: !f.enabled } : f));
  };

  const handleToggleContactField = (id: string) => {
    setContactFields(prev => prev.map(f => f.id === id ? { ...f, enabled: !f.enabled } : f));
  };

  const handleToggleSeoField = (id: string) => {
    setSeoFields(prev => prev.map(f => f.id === id ? { ...f, enabled: !f.enabled } : f));
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <ModuleHeader
        icon={Settings}
        title="Module Cài đặt hệ thống"
        description="Cấu hình thong tin website"
        iconBgClass="bg-orange-500/10"
        iconTextClass="text-orange-600 dark:text-orange-400"
        buttonClass="bg-orange-600 hover:bg-orange-500"
      />

      <ModuleStatus isCore={true} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <FeaturesCard
          features={FEATURES.map(f => ({ config: f, enabled: (features as any)[f.key] }))}
          onToggle={handleToggleFeature}
          toggleColor="bg-orange-500"
        />

        <FieldsCard
          title="Thông tin website"
          icon={Globe}
          iconColorClass="text-orange-500"
          fields={siteFields}
          onToggle={handleToggleSiteField}
          fieldColorClass="bg-orange-500/10 text-orange-600 dark:text-orange-400"
          toggleColor="bg-orange-500"
        />

        <div className="space-y-4">
          {features.enableContact && (
            <FieldsCard
              title="Liên hệ"
              icon={MapPin}
              iconColorClass="text-cyan-500"
              fields={contactFields}
              onToggle={handleToggleContactField}
              fieldColorClass="bg-cyan-500/10 text-cyan-600 dark:text-cyan-400"
              toggleColor="bg-cyan-500"
            />
          )}

          {features.enableSEO && (
            <FieldsCard
              title="SEO"
              icon={Globe}
              iconColorClass="text-emerald-500"
              fields={seoFields}
              onToggle={handleToggleSeoField}
              fieldColorClass="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              toggleColor="bg-emerald-500"
            />
          )}
        </div>
      </div>

      <ConventionNote>
        <strong>Convention:</strong> Settings lưu dạng key-vàlue. Logo/Favicon khuyến nghị dùng SVG hoac PNG.
      </ConventionNote>
    </div>
  );
}
