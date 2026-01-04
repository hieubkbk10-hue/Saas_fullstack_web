'use client';

import React, { useState } from 'react';
import { Menu, ExternalLink, FolderTree } from 'lucide-react';
import { FieldConfig } from '@/types/moduleConfig';
import { 
  ModuleHeader, ModuleStatus, ConventionNote, Code,
  SettingsCard, SettingInput, FeaturesCard, FieldsCard
} from '@/components/modules/shared';

const INITIAL_FIELDS: FieldConfig[] = [
  { id: 'M1', name: 'Tiêu đề', key: 'title', type: 'text', required: true, enabled: true, isSystem: true },
  { id: 'M2', name: 'URL', key: 'url', type: 'text', required: true, enabled: true, isSystem: true },
  { id: 'M3', name: 'Vị trí menu', key: 'location', type: 'select', required: true, enabled: true, isSystem: true },
  { id: 'M4', name: 'Thứ tự', key: 'order', type: 'number', required: true, enabled: true, isSystem: true },
  { id: 'M5', name: 'Trạng thái', key: 'active', type: 'boolean', required: true, enabled: true, isSystem: true },
  { id: 'M6', name: 'Menu cha', key: 'parent_id', type: 'select', required: false, enabled: true, isSystem: false, linkedFeature: 'enableNested' },
  { id: 'M7', name: 'Mô tảb moi', key: 'target_blank', type: 'boolean', required: false, enabled: false, isSystem: false, linkedFeature: 'enableNewTab' },
  { id: 'M8', name: 'Icon', key: 'icon', type: 'text', required: false, enabled: false, isSystem: false },
];

const FEATURES = [
  { key: 'enableNested', label: 'Menu lồng nhau', icon: FolderTree, linkedField: 'parent_id' },
  { key: 'enableNewTab', label: 'Mô tảb moi', icon: ExternalLink, linkedField: 'target_blank' },
];

export default function MenusModuleConfigPage() {
  const [features, setFeatures] = useState({ enableNested: true, enableNewTab: false });
  const [fields, setFields] = useState(INITIAL_FIELDS);
  const [settings, setSettings] = useState({ maxDepth: 3 });

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
        icon={Menu}
        title="Module Menu điều hướng"
        description="Quản lý menu header, footer, sidebar"
        iconBgClass="bg-orange-500/10"
        iconTextClass="text-orange-600 dark:text-orange-400"
        buttonClass="bg-orange-600 hover:bg-orange-500"
      />

      <ModuleStatus isCore={false} enabled={true} toggleColor="bg-orange-500" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="space-y-4">
          <SettingsCard>
            <SettingInput 
              label="Độ sâu tối đa" 
              value={settings.maxDepth} 
              onChange={(v) => setSettings({...settings, maxDepth: v})}
              focusColor="focus:border-orange-500"
            />
          </SettingsCard>

          <FeaturesCard
            features={FEATURES.map(f => ({ config: f, enabled: (features as any)[f.key] }))}
            onToggle={handleToggleFeature}
            toggleColor="bg-orange-500"
          />
        </div>

        <div className="lg:col-span-2">
          <FieldsCard
            title="Trường menu"
            icon={Menu}
            iconColorClass="text-orange-500"
            fields={fields}
            onToggle={handleToggleField}
            fieldColorClass="bg-orange-500/10 text-orange-600 dark:text-orange-400"
            toggleColor="bg-orange-500"
          />
        </div>
      </div>

      <ConventionNote>
        <strong>Convention:</strong> <Code>location</Code>: header, footer, sidebar. Menu sắp xếp theo <Code>order</Code>.
      </ConventionNote>
    </div>
  );
}
