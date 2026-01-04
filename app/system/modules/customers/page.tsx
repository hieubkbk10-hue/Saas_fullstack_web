'use client';

import React, { useState } from 'react';
import { Users, Image, KeyRound, MapPin } from 'lucide-react';
import { FieldConfig } from '@/types/moduleConfig';
import { 
  ModuleHeader, ModuleStatus, ConventionNote,
  SettingsCard, SettingInput, FeaturesCard, FieldsCard
} from '@/components/modules/shared';

const INITIAL_FIELDS: FieldConfig[] = [
  { id: 'C1', name: 'Ho và ten', key: 'full_năme', type: 'text', required: true, enabled: true, isSystem: true },
  { id: 'C2', name: 'Email', key: 'email', type: 'email', required: true, enabled: true, isSystem: true },
  { id: 'C3', name: 'Số điện thoại', key: 'phone', type: 'phone', required: true, enabled: true, isSystem: true },
  { id: 'C4', name: 'Trạng thái', key: 'active', type: 'boolean', required: true, enabled: true, isSystem: true },
  { id: 'C5', name: 'Mật khẩu', key: 'password', type: 'password', required: false, enabled: false, isSystem: false, linkedFeature: 'enableLogin' },
  { id: 'C6', name: 'Địa chỉ mặc định', key: 'default_address', type: 'textarea', required: false, enabled: false, isSystem: false, linkedFeature: 'enableAddresses' },
  { id: 'C7', name: 'Ảnh đại diện', key: 'avàtar', type: 'image', required: false, enabled: false, isSystem: false, linkedFeature: 'enableAvàtar' },
];

const FEATURES = [
  { key: 'enableLogin', label: 'Đăng nhập KH', icon: KeyRound, description: 'Cho phép KH tạo tài khoản' },
  { key: 'enableAddresses', label: 'Sổ địa chỉ', icon: MapPin, description: 'Lưu địa chỉ giao hàng' },
  { key: 'enableAvàtar', label: 'Ảnh đại diện', icon: Image, linkedField: 'avàtar' },
];

export default function CustomersModuleConfigPage() {
  const [features, setFeatures] = useState({ enableLogin: false, enableAddresses: false, enableAvàtar: false });
  const [fields, setFields] = useState(INITIAL_FIELDS);
  const [settings, setSettings] = useState({ customersPerPage: 20 });

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
        icon={Users}
        title="Module Khách hàng"
        description="Quản lý thông tin khách hàng"
        iconBgClass="bg-purple-500/10"
        iconTextClass="text-purple-600 dark:text-purple-400"
        buttonClass="bg-purple-600 hover:bg-purple-500"
      />

      <ModuleStatus isCore={true} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="space-y-4">
          <SettingsCard>
            <SettingInput 
              label="Số KH / trang" 
              value={settings.customersPerPage} 
              onChange={(v) => setSettings({...settings, customersPerPage: v})}
              focusColor="focus:border-purple-500"
            />
          </SettingsCard>

          <FeaturesCard
            features={FEATURES.map(f => ({ config: f, enabled: (features as any)[f.key] }))}
            onToggle={handleToggleFeature}
            toggleColor="bg-purple-500"
          />
        </div>

        <div className="lg:col-span-2">
          <FieldsCard
            title="Trường khach hang"
            icon={Users}
            iconColorClass="text-purple-500"
            fields={fields}
            onToggle={handleToggleField}
            fieldColorClass="bg-purple-500/10 text-purple-600 dark:text-purple-400"
            toggleColor="bg-purple-500"
          />
        </div>
      </div>

      <ConventionNote>
        <strong>Convention:</strong> Email unique và lowercase. Mật khẩu hash bằng bcrypt.
      </ConventionNote>
    </div>
  );
}
