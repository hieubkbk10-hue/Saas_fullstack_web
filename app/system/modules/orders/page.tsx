'use client';

import React, { useState } from 'react';
import { ShoppingBag, Truck, MapPin, CreditCard } from 'lucide-react';
import { FieldConfig } from '@/types/moduleConfig';
import { 
  ModuleHeader, ModuleStatus, ConventionNote, Code,
  SettingsCard, SettingInput, FeaturesCard, FieldsCard
} from '@/components/modules/shared';

const INITIAL_FIELDS: FieldConfig[] = [
  { id: 'O1', name: 'Mã đơn hàng', key: 'order_number', type: 'text', required: true, enabled: true, isSystem: true },
  { id: 'O2', name: 'Khách hàng', key: 'customer_id', type: 'select', required: true, enabled: true, isSystem: true },
  { id: 'O3', name: 'Trạng thái don', key: 'status', type: 'select', required: true, enabled: true, isSystem: true },
  { id: 'O4', name: 'Tổng tiền', key: 'total', type: 'price', required: true, enabled: true, isSystem: true },
  { id: 'O5', name: 'Active', key: 'active', type: 'boolean', required: true, enabled: true, isSystem: true },
  { id: 'O6', name: 'Ghi chú', key: 'note', type: 'textarea', required: false, enabled: true, isSystem: false },
  { id: 'O7', name: 'Phương thức TT', key: 'payment_method', type: 'select', required: false, enabled: true, isSystem: false, linkedFeature: 'enablePayment' },
  { id: 'O8', name: 'Trạng thái TT', key: 'payment_status', type: 'select', required: false, enabled: true, isSystem: false, linkedFeature: 'enablePayment' },
  { id: 'O9', name: 'Tạm tính', key: 'subtotal', type: 'price', required: false, enabled: true, isSystem: false, linkedFeature: 'enableShipping' },
  { id: 'O10', name: 'Phi vàn chuyen', key: 'shipping_fee', type: 'price', required: false, enabled: true, isSystem: false, linkedFeature: 'enableShipping' },
  { id: 'O11', name: 'Địa chỉ giao', key: 'shipping_address', type: 'textarea', required: false, enabled: true, isSystem: false, linkedFeature: 'enableShipping' },
  { id: 'O12', name: 'Ma vàn don', key: 'tracking_number', type: 'text', required: false, enabled: true, isSystem: false, linkedFeature: 'enableTracking' },
];

const FEATURES = [
  { key: 'enablePayment', label: 'Thanh toán', icon: CreditCard, description: 'Phuong thuc & trạng thái TT' },
  { key: 'enableShipping', label: 'Vận chuyển', icon: Truck, description: 'Phí ship, địa chỉ giao' },
  { key: 'enableTracking', label: 'Theo doi vàn don', icon: MapPin, linkedField: 'tracking_number' },
];

export default function OrdersModuleConfigPage() {
  const [features, setFeatures] = useState({ enablePayment: true, enableShipping: true, enableTracking: true });
  const [fields, setFields] = useState(INITIAL_FIELDS);
  const [settings, setSettings] = useState({ ordersPerPage: 20 });

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
        icon={ShoppingBag}
        title="Module Đơn hàng"
        description="Quan ly don hang, vàn chuyen"
        iconBgClass="bg-emerald-500/10"
        iconTextClass="text-emerald-600 dark:text-emerald-400"
        buttonClass="bg-emerald-600 hover:bg-emerald-500"
      />

      <ModuleStatus isCore={false} enabled={true} toggleColor="bg-emerald-500" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="space-y-4">
          <SettingsCard>
            <SettingInput 
              label="Số đơn / trang" 
              value={settings.ordersPerPage} 
              onChange={(v) => setSettings({...settings, ordersPerPage: v})}
              focusColor="focus:border-emerald-500"
            />
          </SettingsCard>

          <FeaturesCard
            features={FEATURES.map(f => ({ config: f, enabled: (features as any)[f.key] }))}
            onToggle={handleToggleFeature}
            toggleColor="bg-emerald-500"
          />
        </div>

        <div className="lg:col-span-2">
          <FieldsCard
            title="Trường don hang"
            icon={ShoppingBag}
            iconColorClass="text-emerald-500"
            fields={fields}
            onToggle={handleToggleField}
            fieldColorClass="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            toggleColor="bg-emerald-500"
          />
        </div>
      </div>

      <ConventionNote>
        <strong>Convention:</strong> <Code>order_number</Code> tự sinh unique. Status: pending, processing, shipped, completed, cancelled.
      </ConventionNote>
    </div>
  );
}
