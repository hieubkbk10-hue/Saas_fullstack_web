'use client';

import React, { useState } from 'react';
import { ShoppingCart, Clock } from 'lucide-react';
import { FieldConfig } from '@/types/moduleConfig';
import { 
  ModuleHeader, ModuleStatus, ConventionNote, Code,
  SettingsCard, SettingInput, FeaturesCard, FieldsCard
} from '@/components/modules/shared';

const INITIAL_FIELDS: FieldConfig[] = [
  { id: 'CT1', name: 'Khách hàng', key: 'customer_id', type: 'select', required: true, enabled: true, isSystem: true },
  { id: 'CT2', name: 'Sản phẩm', key: 'product_id', type: 'select', required: true, enabled: true, isSystem: true },
  { id: 'CT3', name: 'Số lượng', key: 'quantity', type: 'number', required: true, enabled: true, isSystem: true },
  { id: 'CT4', name: 'Giá', key: 'price', type: 'price', required: true, enabled: true, isSystem: true },
  { id: 'CT5', name: 'Trạng thái', key: 'active', type: 'boolean', required: true, enabled: true, isSystem: true },
];

const FEATURES = [
  { key: 'enableExpiry', label: 'Hết hạn giỏ hàng', icon: Clock, description: 'Tự động xóa sau N ngày' },
];

export default function CartModuleConfigPage() {
  const [features, setFeatures] = useState({ enableExpiry: false });
  const [fields, setFields] = useState(INITIAL_FIELDS);
  const [settings, setSettings] = useState({ expiryDays: 7 });

  const handleToggleFeature = (key: string) => {
    setFeatures(prev => ({ ...prev, [key]: !(prev as any)[key] }));
  };

  const handleToggleField = (id: string) => {
    setFields(prev => prev.map(f => f.id === id ? { ...f, enabled: !f.enabled } : f));
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <ModuleHeader
        icon={ShoppingCart}
        title="Module Giỏ hàng"
        description="Chức năng giỏ hàng cho khách"
        iconBgClass="bg-emerald-500/10"
        iconTextClass="text-emerald-600 dark:text-emerald-400"
        buttonClass="bg-emerald-600 hover:bg-emerald-500"
      />

      <ModuleStatus isCore={false} enabled={true} toggleColor="bg-emerald-500" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="space-y-4">
          <SettingsCard>
            {features.enableExpiry && (
              <SettingInput 
                label="Hết hạn sau (ngày)" 
                value={settings.expiryDays} 
                onChange={(v) => setSettings({...settings, expiryDays: v})}
                focusColor="focus:border-emerald-500"
              />
            )}
          </SettingsCard>

          <FeaturesCard
            features={FEATURES.map(f => ({ config: f, enabled: (features as any)[f.key] }))}
            onToggle={handleToggleFeature}
            toggleColor="bg-emerald-500"
          />
        </div>

        <div className="lg:col-span-2">
          <FieldsCard
            title="Trường gio hang"
            icon={ShoppingCart}
            iconColorClass="text-emerald-500"
            fields={fields}
            onToggle={handleToggleField}
            fieldColorClass="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            toggleColor="bg-emerald-500"
          />
        </div>
      </div>

      <ConventionNote>
        <strong>Convention:</strong> Giỏ hàng phụ thuộc module <Code>Sản phẩm</Code>. Giá luu tai thoi diem them vào gio.
      </ConventionNote>
    </div>
  );
}
