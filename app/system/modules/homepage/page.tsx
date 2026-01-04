'use client';

import React, { useState } from 'react';
import { Home, LayoutGrid, Image, FileText } from 'lucide-react';
import { FieldConfig } from '@/types/moduleConfig';
import { 
  ModuleHeader, ModuleStatus, ConventionNote, Code,
  FeaturesCard, FieldsCard
} from '@/components/modules/shared';

const SECTION_FIELDS: FieldConfig[] = [
  { id: 'H1', name: 'Tên section', key: 'năme', type: 'text', required: true, enabled: true, isSystem: true },
  { id: 'H2', name: 'Loại', key: 'type', type: 'select', required: true, enabled: true, isSystem: true },
  { id: 'H3', name: 'Nội dung', key: 'content', type: 'richtext', required: true, enabled: true, isSystem: true },
  { id: 'H4', name: 'Thứ tự', key: 'order', type: 'number', required: true, enabled: true, isSystem: true },
  { id: 'H5', name: 'Trạng thái', key: 'active', type: 'boolean', required: true, enabled: true, isSystem: true },
  { id: 'H6', name: 'Ảnh nền', key: 'background', type: 'image', required: false, enabled: true, isSystem: false },
  { id: 'H7', name: 'Config', key: 'config', type: 'text', required: false, enabled: true, isSystem: false },
];

const FEATURES = [
  { key: 'enableHero', label: 'Hero Banner', icon: Image, description: 'Banner chính đầu trang' },
  { key: 'enableAbout', label: 'Giới thiệu', icon: FileText, description: 'Section giới thiệu' },
  { key: 'enableProducts', label: 'Sản phẩm noi bat', icon: LayoutGrid, description: 'Hiện SP featured' },
  { key: 'enablePosts', label: 'Bài viết mới', icon: FileText, description: 'Hiện bài viết gần đây' },
];

export default function HomepageModuleConfigPage() {
  const [features, setFeatures] = useState({ 
    enableHero: true, 
    enableAbout: true, 
    enableProducts: true, 
    enablePosts: true 
  });
  const [fields, setFields] = useState(SECTION_FIELDS);

  const handleToggleFeature = (key: string) => {
    setFeatures(prev => ({ ...prev, [key]: !(prev as any)[key] }));
  };

  const handleToggleField = (id: string) => {
    setFields(prev => prev.map(f => f.id === id ? { ...f, enabled: !f.enabled } : f));
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <ModuleHeader
        icon={Home}
        title="Module Trang chủ"
        description="Cấu hình cac section trang chu"
        iconBgClass="bg-orange-500/10"
        iconTextClass="text-orange-600 dark:text-orange-400"
        buttonClass="bg-orange-600 hover:bg-orange-500"
      />

      <ModuleStatus isCore={false} enabled={true} toggleColor="bg-orange-500" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <FeaturesCard
          features={FEATURES.map(f => ({ config: f, enabled: (features as any)[f.key] }))}
          onToggle={handleToggleFeature}
          toggleColor="bg-orange-500"
        />

        <div className="lg:col-span-2">
          <FieldsCard
            title="Trường section"
            icon={LayoutGrid}
            iconColorClass="text-orange-500"
            fields={fields}
            onToggle={handleToggleField}
            fieldColorClass="bg-orange-500/10 text-orange-600 dark:text-orange-400"
            toggleColor="bg-orange-500"
          />
        </div>
      </div>

      <ConventionNote>
        <strong>Convention:</strong> <Code>type</Code>: hero, about, products, posts, partners. <Code>config</Code> luu JSON tùy chỉnh section.
      </ConventionNote>
    </div>
  );
}
