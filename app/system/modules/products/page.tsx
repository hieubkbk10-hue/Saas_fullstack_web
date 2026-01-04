'use client';

import React, { useState, useEffect } from 'react';
import { Package, FolderTree, Boxes, Percent, Palette } from 'lucide-react';
import { FieldConfig } from '@/types/moduleConfig';
import { 
  ModuleHeader, ModuleStatus, ConventionNote, Code,
  SettingsCard, SettingInput, SettingSelect,
  FeaturesCard, FieldsCard, ToggleSwitch
} from '@/components/modules/shared';

const INITIAL_PRODUCT_FIELDS: FieldConfig[] = [
  { id: 'P1', name: 'Tên sản phẩm', key: 'năme', type: 'text', required: true, enabled: true, isSystem: true },
  { id: 'P2', name: 'Giá bán', key: 'price', type: 'price', required: true, enabled: true, isSystem: true },
  { id: 'P3', name: 'Mô tả', key: 'description', type: 'richtext', required: true, enabled: true, isSystem: true },
  { id: 'P4', name: 'Thứ tự', key: 'order', type: 'number', required: true, enabled: true, isSystem: true },
  { id: 'P5', name: 'Trạng thái', key: 'active', type: 'boolean', required: true, enabled: true, isSystem: true },
  { id: 'P6', name: 'Mô tả ngan', key: 'excerpt', type: 'textarea', required: false, enabled: true, isSystem: false },
  { id: 'P7', name: 'Ảnh đại diện', key: 'thumbnail', type: 'image', required: false, enabled: true, isSystem: false },
  { id: 'P8', name: 'Thư viện ảnh', key: 'gallery', type: 'gallery', required: false, enabled: true, isSystem: false },
  { id: 'P9', name: 'Danh mục', key: 'category_id', type: 'select', required: false, enabled: true, isSystem: false },
  { id: 'P10', name: 'Ma SKU', key: 'sku', type: 'text', required: false, enabled: true, isSystem: false },
  { id: 'P11', name: 'Số lượng tồn', key: 'stock', type: 'number', required: false, enabled: true, isSystem: false, linkedFeature: 'enableInventory' },
  { id: 'P12', name: 'Giá gốc', key: 'compare_price', type: 'price', required: false, enabled: true, isSystem: false, linkedFeature: 'enableSale' },
  { id: 'P13', name: 'Biến thể', key: 'vàriants', type: 'select', required: false, enabled: true, isSystem: false, linkedFeature: 'enableVariants' },
];

const INITIAL_CATEGORY_FIELDS: FieldConfig[] = [
  { id: 'C1', name: 'Ten', key: 'năme', type: 'text', required: true, enabled: true, isSystem: true },
  { id: 'C2', name: 'Thứ tự', key: 'order', type: 'number', required: true, enabled: true, isSystem: true },
  { id: 'C3', name: 'Trạng thái', key: 'active', type: 'boolean', required: true, enabled: true, isSystem: true },
  { id: 'C4', name: 'Mô tả', key: 'description', type: 'textarea', required: false, enabled: true, isSystem: false },
  { id: 'C5', name: 'Ảnh đại diện', key: 'thumbnail', type: 'image', required: false, enabled: false, isSystem: false },
  { id: 'C6', name: 'Danh mục cha', key: 'parent_id', type: 'select', required: false, enabled: true, isSystem: false },
];

const FEATURES = [
  { key: 'enableVariants', label: 'Biến thể SP', icon: Palette, description: 'Size, màu sắc...', linkedField: 'vàriants' },
  { key: 'enableInventory', label: 'Quản lý tồn kho', icon: Boxes, description: 'SKU, số lượng', linkedField: 'stock' },
  { key: 'enableSale', label: 'Giá khuyến mãi', icon: Percent, description: 'Giá gốc, giảm giá', linkedField: 'compare_price' },
];

export default function ProductsModuleConfigPage() {
  const [features, setFeatures] = useState({ enableVariants: true, enableInventory: true, enableSale: true });
  const [productFields, setProductFields] = useState(INITIAL_PRODUCT_FIELDS);
  const [categoryFields, setCategoryFields] = useState(INITIAL_CATEGORY_FIELDS);
  const [settings, setSettings] = useState({ productsPerPage: 12, defaultStatus: 'draft', enableOutOfStock: true });

  useEffect(() => {
    setProductFields(prev => prev.map(field => 
      field.linkedFeature ? { ...field, enabled: (features as any)[field.linkedFeature] } : field
    ));
  }, [features]);

  const handleToggleFeature = (key: string) => {
    setFeatures(prev => ({ ...prev, [key]: !(prev as any)[key] }));
  };

  const handleToggleProductField = (id: string) => {
    const field = productFields.find(f => f.id === id);
    if (field?.linkedFeature) {
      handleToggleFeature(field.linkedFeature);
    } else {
      setProductFields(prev => prev.map(f => f.id === id ? { ...f, enabled: !f.enabled } : f));
    }
  };

  const handleToggleCategoryField = (id: string) => {
    setCategoryFields(prev => prev.map(f => f.id === id ? { ...f, enabled: !f.enabled } : f));
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <ModuleHeader
        icon={Package}
        title="Module Sản phẩm"
        description="Cấu hình sản phẩm và danh mục"
        iconBgClass="bg-emerald-500/10"
        iconTextClass="text-emerald-600 dark:text-emerald-400"
        buttonClass="bg-emerald-600 hover:bg-emerald-500"
      />

      <ModuleStatus isCore={false} enabled={true} toggleColor="bg-emerald-500" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="space-y-4">
          <SettingsCard>
            <SettingInput 
              label="Số SP / trang" 
              value={settings.productsPerPage} 
              onChange={(v) => setSettings({...settings, productsPerPage: v})}
              focusColor="focus:border-emerald-500"
            />
            <SettingSelect
              label="Trạng thái mac dinh"
              value={settings.defaultStatus}
              onChange={(v) => setSettings({...settings, defaultStatus: v})}
              options={[{ value: 'draft', label: 'Bản nháp' }, { value: 'published', label: 'Xuất bản' }]}
              focusColor="focus:border-emerald-500"
            />
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-950">
              <span className="text-xs text-slate-700 dark:text-slate-200">Hiện SP hết hàng</span>
              <ToggleSwitch 
                enabled={settings.enableOutOfStock} 
                onChange={() => setSettings({...settings, enableOutOfStock: !settings.enableOutOfStock})}
                color="bg-emerald-500"
              />
            </div>
          </SettingsCard>

          <FeaturesCard
            features={FEATURES.map(f => ({ config: f, enabled: (features as any)[f.key] }))}
            onToggle={handleToggleFeature}
            toggleColor="bg-emerald-500"
          />
        </div>

        <FieldsCard
          title="Trường sản phẩm"
          icon={Package}
          iconColorClass="text-emerald-500"
          fields={productFields}
          onToggle={handleToggleProductField}
          fieldColorClass="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          toggleColor="bg-emerald-500"
        />

        <FieldsCard
          title="Trường danh mục"
          icon={FolderTree}
          iconColorClass="text-amber-500"
          fields={categoryFields}
          onToggle={handleToggleCategoryField}
          fieldColorClass="bg-amber-500/10 text-amber-600 dark:text-amber-400"
          toggleColor="bg-amber-500"
        />
      </div>

      <ConventionNote>
        <strong>Convention:</strong> Slug tự động từ tên SP. Trường <Code>order</Code> và <Code>active</Code> bắt buộc. Giá lưu dạng integer (VND).
      </ConventionNote>
    </div>
  );
}
