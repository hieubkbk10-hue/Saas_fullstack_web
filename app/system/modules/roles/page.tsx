'use client';

import React, { useState } from 'react';
import { Shield, FileText } from 'lucide-react';
import { FieldConfig } from '@/types/moduleConfig';
import { 
  ModuleHeader, ModuleStatus, ConventionNote, Code,
  SettingsCard, SettingInput, FeaturesCard, FieldsCard
} from '@/components/modules/shared';

const INITIAL_FIELDS: FieldConfig[] = [
  { id: 'R1', name: 'Ten vài tro', key: 'năme', type: 'text', required: true, enabled: true, isSystem: true },
  { id: 'R2', name: 'Permissions', key: 'permissions', type: 'text', required: true, enabled: true, isSystem: true },
  { id: 'R3', name: 'Thứ tự', key: 'order', type: 'number', required: true, enabled: true, isSystem: true },
  { id: 'R4', name: 'Trạng thái', key: 'active', type: 'boolean', required: true, enabled: true, isSystem: true },
  { id: 'R5', name: 'Mô tả', key: 'description', type: 'textarea', required: false, enabled: true, isSystem: false, linkedFeature: 'enableDescription' },
];

const FEATURES = [
  { key: 'enableDescription', label: 'Mô tả vài tro', icon: FileText, linkedField: 'description' },
];

export default function RolesModuleConfigPage() {
  const [features, setFeatures] = useState({ enableDescription: true });
  const [fields, setFields] = useState(INITIAL_FIELDS);
  const [settings, setSettings] = useState({ maxRolesPerUser: 1 });

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
        icon={Shield}
        title="Module Vai trò & Quyen"
        description="Phân quyền RBAC cho hệ thống"
        iconBgClass="bg-purple-500/10"
        iconTextClass="text-purple-600 dark:text-purple-400"
        buttonClass="bg-purple-600 hover:bg-purple-500"
      />

      <ModuleStatus isCore={true} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="space-y-4">
          <SettingsCard>
            <SettingInput 
              label="Max roles / user" 
              value={settings.maxRolesPerUser} 
              onChange={(v) => setSettings({...settings, maxRolesPerUser: v})}
              focusColor="focus:border-purple-500"
            />
          </SettingsCard>

          <FeaturesCard
            features={FEATURES.map(f => ({ config: f, enabled: (features as any)[f.key] }))}
            onToggle={handleToggleFeature}
            toggleColor="bg-purple-500"
          />
        </div>

        <FieldsCard
          title="Trường vài tro"
          icon={Shield}
          iconColorClass="text-purple-500"
          fields={fields}
          onToggle={handleToggleField}
          fieldColorClass="bg-purple-500/10 text-purple-600 dark:text-purple-400"
          toggleColor="bg-purple-500"
        />

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3">Quyền cơ bản</h3>
          <div className="grid grid-cols-2 gap-2">
            {['view', 'create', 'edit', 'delete'].map((perm) => (
              <div key={perm} className="p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center">
                <code className="text-xs text-purple-600 dark:text-purple-400">{perm}</code>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-slate-500 mt-3">
            * Permissions lưu dạng JSON:<br/>
            <code className="text-purple-500">{`{"posts": ["view", "create"]}`}</code>
          </p>
        </div>
      </div>

      <ConventionNote>
        <strong>Convention:</strong> Trường <Code>permissions</Code> luu JSON định nghĩa quyền cho từng module.
      </ConventionNote>
    </div>
  );
}
