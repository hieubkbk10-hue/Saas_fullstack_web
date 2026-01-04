'use client';

import React, { useState } from 'react';
import { Bell, Mail, Clock } from 'lucide-react';
import { FieldConfig } from '@/types/moduleConfig';
import { 
  ModuleHeader, ModuleStatus, ConventionNote, Code,
  SettingsCard, SettingInput, FeaturesCard, FieldsCard
} from '@/components/modules/shared';

const INITIAL_FIELDS: FieldConfig[] = [
  { id: 'N1', name: 'Tiêu đề', key: 'title', type: 'text', required: true, enabled: true, isSystem: true },
  { id: 'N2', name: 'Nội dung', key: 'content', type: 'textarea', required: true, enabled: true, isSystem: true },
  { id: 'N3', name: 'Loại', key: 'type', type: 'select', required: true, enabled: true, isSystem: true },
  { id: 'N4', name: 'Thứ tự', key: 'order', type: 'number', required: true, enabled: true, isSystem: true },
  { id: 'N5', name: 'Trạng thái', key: 'active', type: 'boolean', required: true, enabled: true, isSystem: true },
  { id: 'N6', name: 'Ngày gửi', key: 'scheduled_at', type: 'date', required: false, enabled: false, isSystem: false, linkedFeature: 'enableScheduling' },
];

const FEATURES = [
  { key: 'enableEmail', label: 'Gửi Email', icon: Mail, description: 'Gửi thông báo qua email' },
  { key: 'enableScheduling', label: 'Hẹn giờ gửi', icon: Clock, linkedField: 'scheduled_at' },
];

export default function NotificationsModuleConfigPage() {
  const [features, setFeatures] = useState({ enableEmail: true, enableScheduling: false });
  const [fields, setFields] = useState(INITIAL_FIELDS);
  const [settings, setSettings] = useState({ itemsPerPage: 20 });

  const handleToggleFeature = (key: string) => {
    setFeatures(prev => {
      const newValue = !(prev as any)[key];
      setFields(f => f.map(field => field.linkedFeature === key ? { ...field, enabled: newValue } : field));
      return { ...prev, [key]: newValue };
    });
  };

  const handleToggleField = (id: string) => {
    const field = fields.find(f => f.id === id);
    if (field?.linkedFeature) {
      handleToggleFeature(field.linkedFeature);
    } else {
      setFields(prev => prev.map(f => f.id === id ? { ...f, enabled: !f.enabled } : f));
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <ModuleHeader
        icon={Bell}
        title="Module Thông báo"
        description="Quản lý thông báo hệ thống"
        iconBgClass="bg-pink-500/10"
        iconTextClass="text-pink-600 dark:text-pink-400"
        buttonClass="bg-pink-600 hover:bg-pink-500"
      />

      <ModuleStatus isCore={false} enabled={true} toggleColor="bg-pink-500" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="space-y-4">
          <SettingsCard>
            <SettingInput 
              label="Số thông báo / trang" 
              value={settings.itemsPerPage} 
              onChange={(v) => setSettings({...settings, itemsPerPage: v})}
              focusColor="focus:border-pink-500"
            />
          </SettingsCard>

          <FeaturesCard
            features={FEATURES.map(f => ({ config: f, enabled: (features as any)[f.key] }))}
            onToggle={handleToggleFeature}
            toggleColor="bg-pink-500"
          />
        </div>

        <div className="lg:col-span-2">
          <FieldsCard
            title="Trường thong bao"
            icon={Bell}
            iconColorClass="text-pink-500"
            fields={fields}
            onToggle={handleToggleField}
            fieldColorClass="bg-pink-500/10 text-pink-600 dark:text-pink-400"
            toggleColor="bg-pink-500"
          />
        </div>
      </div>

      <ConventionNote>
        <strong>Convention:</strong> <Code>type</Code>: info, success, warning, error. Thong bao có thể gửi cho all hoặc specific users.
      </ConventionNote>
    </div>
  );
}
