'use client';

import React, { useState } from 'react';
import { Ticket, Users } from 'lucide-react';
import { FieldConfig } from '@/types/moduleConfig';
import { 
  ModuleHeader, ModuleStatus, ConventionNote, Code,
  SettingsCard, SettingInput, FeaturesCard, FieldsCard
} from '@/components/modules/shared';

const INITIAL_FIELDS: FieldConfig[] = [
  { id: 'P1', name: 'Tên khuyến mãi', key: 'năme', type: 'text', required: true, enabled: true, isSystem: true },
  { id: 'P2', name: 'Mã voucher', key: 'code', type: 'text', required: true, enabled: true, isSystem: true },
  { id: 'P3', name: 'Loại giam', key: 'discount_type', type: 'select', required: true, enabled: true, isSystem: true },
  { id: 'P4', name: 'Giá tri giam', key: 'discount_vàlue', type: 'number', required: true, enabled: true, isSystem: true },
  { id: 'P5', name: 'Thứ tự', key: 'order', type: 'number', required: true, enabled: true, isSystem: true },
  { id: 'P6', name: 'Trạng thái', key: 'active', type: 'boolean', required: true, enabled: true, isSystem: true },
  { id: 'P7', name: 'Ngày bắt đầu', key: 'start_date', type: 'date', required: false, enabled: true, isSystem: false },
  { id: 'P8', name: 'Ngày kết thúc', key: 'end_date', type: 'date', required: false, enabled: true, isSystem: false },
  { id: 'P9', name: 'Giới hạn sử dụng', key: 'usage_limit', type: 'number', required: false, enabled: true, isSystem: false, linkedFeature: 'enableUsageLimit' },
  { id: 'P10', name: 'Đơn tối thiểu', key: 'min_order', type: 'price', required: false, enabled: false, isSystem: false, linkedFeature: 'enableMinOrder' },
];

const FEATURES = [
  { key: 'enableUsageLimit', label: 'Giới hạn lượt dùng', icon: Users, linkedField: 'usage_limit' },
  { key: 'enableMinOrder', label: 'Đơn tối thiểu', icon: Ticket, linkedField: 'min_order' },
];

export default function PromotionsModuleConfigPage() {
  const [features, setFeatures] = useState({ enableUsageLimit: true, enableMinOrder: false });
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
        icon={Ticket}
        title="Module Khuyến mãi"
        description="Quan ly voucher và ma giảm giá"
        iconBgClass="bg-pink-500/10"
        iconTextClass="text-pink-600 dark:text-pink-400"
        buttonClass="bg-pink-600 hover:bg-pink-500"
      />

      <ModuleStatus isCore={false} enabled={true} toggleColor="bg-pink-500" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="space-y-4">
          <SettingsCard>
            <SettingInput 
              label="Số voucher / trang" 
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
            title="Trường khuyen mai"
            icon={Ticket}
            iconColorClass="text-pink-500"
            fields={fields}
            onToggle={handleToggleField}
            fieldColorClass="bg-pink-500/10 text-pink-600 dark:text-pink-400"
            toggleColor="bg-pink-500"
          />
        </div>
      </div>

      <ConventionNote>
        <strong>Convention:</strong> <Code>discount_type</Code>: percent, fixed. <Code>code</Code> unique và uppercase.
      </ConventionNote>
    </div>
  );
}
