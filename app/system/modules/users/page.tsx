'use client';

import React, { useState } from 'react';
import { UserCog, Shield, Image } from 'lucide-react';
import { FieldConfig } from '@/types/moduleConfig';
import { 
  ModuleHeader, ModuleStatus, ConventionNote, Code,
  SettingsCard, SettingInput, FeaturesCard, FieldsCard
} from '@/components/modules/shared';

const INITIAL_FIELDS: FieldConfig[] = [
  { id: 'U1', name: 'Email', key: 'email', type: 'email', required: true, enabled: true, isSystem: true },
  { id: 'U2', name: 'Mật khẩu', key: 'password', type: 'password', required: true, enabled: true, isSystem: true },
  { id: 'U3', name: 'Vai trò', key: 'role_id', type: 'select', required: true, enabled: true, isSystem: true },
  { id: 'U4', name: 'Trạng thái', key: 'active', type: 'boolean', required: true, enabled: true, isSystem: true },
  { id: 'U5', name: 'Ho và ten', key: 'full_năme', type: 'text', required: false, enabled: true, isSystem: false },
  { id: 'U6', name: 'Ảnh đại diện', key: 'avàtar', type: 'image', required: false, enabled: false, isSystem: false, linkedFeature: 'enableAvàtar' },
];

const FEATURES = [
  { key: 'enableAvàtar', label: 'Ảnh đại diện', icon: Image, linkedField: 'avàtar' },
];

export default function UsersModuleConfigPage() {
  const [features, setFeatures] = useState({ enableAvàtar: false });
  const [fields, setFields] = useState(INITIAL_FIELDS);
  const [settings, setSettings] = useState({ sessionTimeout: 30, maxLoginAttempts: 5 });

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
        icon={UserCog}
        title="Module Người dùng Admin"
        description="Quản lý tài khoản admin"
        iconBgClass="bg-purple-500/10"
        iconTextClass="text-purple-600 dark:text-purple-400"
        buttonClass="bg-purple-600 hover:bg-purple-500"
      />

      <ModuleStatus isCore={true} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="space-y-4">
          <SettingsCard title="Cài đặt bảo mật">
            <SettingInput 
              label="Session timeout (phút)" 
              value={settings.sessionTimeout} 
              onChange={(v) => setSettings({...settings, sessionTimeout: v})}
              focusColor="focus:border-purple-500"
            />
            <SettingInput 
              label="Max đăng nhập sai" 
              value={settings.maxLoginAttempts} 
              onChange={(v) => setSettings({...settings, maxLoginAttempts: v})}
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
          title="Trường nguoi dung"
          icon={UserCog}
          iconColorClass="text-purple-500"
          fields={fields}
          onToggle={handleToggleField}
          fieldColorClass="bg-purple-500/10 text-purple-600 dark:text-purple-400"
          toggleColor="bg-purple-500"
        />

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
            <Shield size={14} className="text-purple-500" /> Module liên quan
          </h3>
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Shield size={14} className="text-purple-500" />
              <span className="text-sm text-slate-700 dark:text-slate-200">Vai trò & Quyen</span>
            </div>
            <a href="/system/modules/roles" className="text-[11px] text-purple-600 dark:text-purple-400 hover:underline">Cấu hình &rarr;</a>
          </div>
        </div>
      </div>

      <ConventionNote>
        <strong>Convention:</strong> Mật khẩu hash bằng bcrypt. Email unique và lowercase. Trường <Code>role_id</Code> liên kết module Roles.
      </ConventionNote>
    </div>
  );
}
