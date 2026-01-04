'use client';

import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import { FieldConfig } from '@/types/moduleConfig';
import { 
  ModuleHeader, ModuleStatus, ConventionNote, Code,
  SettingsCard, SettingInput, FieldsCard
} from '@/components/modules/shared';

const INITIAL_FIELDS: FieldConfig[] = [
  { id: 'W1', name: 'Khách hàng', key: 'customer_id', type: 'select', required: true, enabled: true, isSystem: true },
  { id: 'W2', name: 'Sản phẩm', key: 'product_id', type: 'select', required: true, enabled: true, isSystem: true },
  { id: 'W3', name: 'Thứ tự', key: 'order', type: 'number', required: true, enabled: true, isSystem: true },
  { id: 'W4', name: 'Trạng thái', key: 'active', type: 'boolean', required: true, enabled: true, isSystem: true },
];

export default function WishlistModuleConfigPage() {
  const [fields, setFields] = useState(INITIAL_FIELDS);
  const [settings, setSettings] = useState({ maxItems: 50 });

  const handleToggleField = (id: string) => {
    setFields(prev => prev.map(f => f.id === id ? { ...f, enabled: !f.enabled } : f));
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <ModuleHeader
        icon={Heart}
        title="Module Sản phẩm yeu thich"
        description="Danh sách sản phẩm yêu thích của khách"
        iconBgClass="bg-emerald-500/10"
        iconTextClass="text-emerald-600 dark:text-emerald-400"
        buttonClass="bg-emerald-600 hover:bg-emerald-500"
      />

      <ModuleStatus isCore={false} enabled={false} toggleColor="bg-emerald-500" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SettingsCard>
          <SettingInput 
            label="Max SP / khách" 
            value={settings.maxItems} 
            onChange={(v) => setSettings({...settings, maxItems: v})}
            focusColor="focus:border-emerald-500"
          />
        </SettingsCard>

        <div className="lg:col-span-2">
          <FieldsCard
            title="Trường wishlist"
            icon={Heart}
            iconColorClass="text-emerald-500"
            fields={fields}
            onToggle={handleToggleField}
            fieldColorClass="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            toggleColor="bg-emerald-500"
          />
        </div>
      </div>

      <ConventionNote>
        <strong>Convention:</strong> Wishlist phụ thuộc module <Code>Sản phẩm</Code>. Mỗi cặp customer_id + product_id là unique.
      </ConventionNote>
    </div>
  );
}
