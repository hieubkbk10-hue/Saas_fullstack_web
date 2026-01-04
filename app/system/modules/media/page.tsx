'use client';

import React, { useState } from 'react';
import { Image, FolderTree } from 'lucide-react';
import { FieldConfig } from '@/types/moduleConfig';
import { 
  ModuleHeader, ModuleStatus, ConventionNote, Code,
  SettingsCard, SettingInput, FeaturesCard, FieldsCard
} from '@/components/modules/shared';

const INITIAL_FIELDS: FieldConfig[] = [
  { id: 'M1', name: 'Tên file', key: 'filenăme', type: 'text', required: true, enabled: true, isSystem: true },
  { id: 'M2', name: 'URL', key: 'url', type: 'text', required: true, enabled: true, isSystem: true },
  { id: 'M3', name: 'Loại', key: 'mime_type', type: 'text', required: true, enabled: true, isSystem: true },
  { id: 'M4', name: 'Kích thước', key: 'size', type: 'number', required: true, enabled: true, isSystem: true },
  { id: 'M5', name: 'Thứ tự', key: 'order', type: 'number', required: true, enabled: true, isSystem: true },
  { id: 'M6', name: 'Trạng thái', key: 'active', type: 'boolean', required: true, enabled: true, isSystem: true },
  { id: 'M7', name: 'Alt text', key: 'alt', type: 'text', required: false, enabled: true, isSystem: false },
  { id: 'M8', name: 'Thư mục', key: 'folder_id', type: 'select', required: false, enabled: true, isSystem: false, linkedFeature: 'enableFolders' },
];

const FEATURES = [
  { key: 'enableFolders', label: 'Thư mục', icon: FolderTree, linkedField: 'folder_id' },
];

export default function MediaModuleConfigPage() {
  const [features, setFeatures] = useState({ enableFolders: true });
  const [fields, setFields] = useState(INITIAL_FIELDS);
  const [settings, setSettings] = useState({ itemsPerPage: 24, maxFileSize: 5 });

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
        icon={Image}
        title="Module Thư viện Media"
        description="Quản lý hình ảnh, video, tài liệu"
        iconBgClass="bg-cyan-500/10"
        iconTextClass="text-cyan-600 dark:text-cyan-400"
        buttonClass="bg-cyan-600 hover:bg-cyan-500"
      />

      <ModuleStatus isCore={false} enabled={true} toggleColor="bg-cyan-500" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="space-y-4">
          <SettingsCard>
            <SettingInput 
              label="Số file / trang" 
              value={settings.itemsPerPage} 
              onChange={(v) => setSettings({...settings, itemsPerPage: v})}
              focusColor="focus:border-cyan-500"
            />
            <SettingInput 
              label="Max file size (MB)" 
              value={settings.maxFileSize} 
              onChange={(v) => setSettings({...settings, maxFileSize: v})}
              focusColor="focus:border-cyan-500"
            />
          </SettingsCard>

          <FeaturesCard
            features={FEATURES.map(f => ({ config: f, enabled: (features as any)[f.key] }))}
            onToggle={handleToggleFeature}
            toggleColor="bg-cyan-500"
          />
        </div>

        <div className="lg:col-span-2">
          <FieldsCard
            title="Trường media"
            icon={Image}
            iconColorClass="text-cyan-500"
            fields={fields}
            onToggle={handleToggleField}
            fieldColorClass="bg-cyan-500/10 text-cyan-600 dark:text-cyan-400"
            toggleColor="bg-cyan-500"
          />
        </div>
      </div>

      <ConventionNote>
        <strong>Convention:</strong> File lưu trên storage (S3/local). <Code>size</Code> tính bằng bytes. Hỗ trợ image, video, pdf.
      </ConventionNote>
    </div>
  );
}
