'use client';

import React, { useState, useEffect } from 'react';
import { FileText, FolderTree, Tag, Star, Clock } from 'lucide-react';
import { FieldConfig } from '@/types/moduleConfig';
import { 
  ModuleHeader, ModuleStatus, ConventionNote, Code,
  SettingsCard, SettingInput, SettingSelect,
  FeaturesCard, FieldsCard
} from '@/components/modules/shared';

const INITIAL_POST_FIELDS: FieldConfig[] = [
  { id: 'P1', name: 'Tiêu đề', key: 'title', type: 'text', required: true, enabled: true, isSystem: true },
  { id: 'P2', name: 'Nội dung', key: 'content', type: 'richtext', required: true, enabled: true, isSystem: true },
  { id: 'P3', name: 'Thứ tự', key: 'order', type: 'number', required: true, enabled: true, isSystem: true },
  { id: 'P4', name: 'Trạng thái', key: 'active', type: 'boolean', required: true, enabled: true, isSystem: true },
  { id: 'P5', name: 'Mô tả ngắn', key: 'excerpt', type: 'textarea', required: false, enabled: true, isSystem: false },
  { id: 'P6', name: 'Ảnh đại diện', key: 'thumbnail', type: 'image', required: false, enabled: true, isSystem: false },
  { id: 'P7', name: 'Danh mục', key: 'category_id', type: 'select', required: false, enabled: true, isSystem: false },
  { id: 'P8', name: 'Tags', key: 'tags', type: 'tags', required: false, enabled: true, isSystem: false, linkedFeature: 'enableTags' },
  { id: 'P9', name: 'Nổi bật', key: 'featured', type: 'boolean', required: false, enabled: true, isSystem: false, linkedFeature: 'enableFeatured' },
  { id: 'P10', name: 'Ngày xuất bản', key: 'publish_date', type: 'date', required: false, enabled: true, isSystem: false, linkedFeature: 'enableScheduling' },
];

const INITIAL_CATEGORY_FIELDS: FieldConfig[] = [
  { id: 'C1', name: 'Tên', key: 'name', type: 'text', required: true, enabled: true, isSystem: true },
  { id: 'C2', name: 'Thứ tự', key: 'order', type: 'number', required: true, enabled: true, isSystem: true },
  { id: 'C3', name: 'Trạng thái', key: 'active', type: 'boolean', required: true, enabled: true, isSystem: true },
  { id: 'C4', name: 'Mô tả', key: 'description', type: 'textarea', required: false, enabled: true, isSystem: false },
  { id: 'C5', name: 'Ảnh đại diện', key: 'thumbnail', type: 'image', required: false, enabled: false, isSystem: false },
];

const FEATURES = [
  { key: 'enableTags', label: 'Tags', icon: Tag, linkedField: 'tags' },
  { key: 'enableFeatured', label: 'Nổi bật', icon: Star, linkedField: 'featured' },
  { key: 'enableScheduling', label: 'Hẹn giờ', icon: Clock, linkedField: 'publish_date' },
];

export default function PostsModuleConfigPage() {
  const [features, setFeatures] = useState({ enableTags: true, enableFeatured: true, enableScheduling: true });
  const [postFields, setPostFields] = useState(INITIAL_POST_FIELDS);
  const [categoryFields, setCategoryFields] = useState(INITIAL_CATEGORY_FIELDS);
  const [settings, setSettings] = useState({ postsPerPage: 10, defaultStatus: 'draft' });

  useEffect(() => {
    setPostFields(prev => prev.map(field => 
      field.linkedFeature ? { ...field, enabled: (features as any)[field.linkedFeature] } : field
    ));
  }, [features]);

  const handleToggleFeature = (key: string) => {
    setFeatures(prev => ({ ...prev, [key]: !(prev as any)[key] }));
  };

  const handleTogglePostField = (id: string) => {
    const field = postFields.find(f => f.id === id);
    if (field?.linkedFeature) {
      handleToggleFeature(field.linkedFeature);
    } else {
      setPostFields(prev => prev.map(f => f.id === id ? { ...f, enabled: !f.enabled } : f));
    }
  };

  const handleToggleCategoryField = (id: string) => {
    setCategoryFields(prev => prev.map(f => f.id === id ? { ...f, enabled: !f.enabled } : f));
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <ModuleHeader
        icon={FileText}
        title="Module Bài viết"
        description="Cấu hình bài viết và danh mục"
        iconBgClass="bg-cyan-500/10"
        iconTextClass="text-cyan-600 dark:text-cyan-400"
        buttonClass="bg-cyan-600 hover:bg-cyan-500"
      />

      <ModuleStatus isCore={false} enabled={true} toggleColor="bg-cyan-500" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="space-y-4">
          <SettingsCard>
            <SettingInput 
              label="Số bài / trang" 
              value={settings.postsPerPage} 
              onChange={(v) => setSettings({...settings, postsPerPage: v})}
              focusColor="focus:border-cyan-500"
            />
            <SettingSelect
              label="Trạng thái mặc định"
              value={settings.defaultStatus}
              onChange={(v) => setSettings({...settings, defaultStatus: v})}
              options={[{ value: 'draft', label: 'Bản nháp' }, { value: 'published', label: 'Xuất bản' }]}
              focusColor="focus:border-cyan-500"
            />
          </SettingsCard>

          <FeaturesCard
            features={FEATURES.map(f => ({ config: f, enabled: (features as any)[f.key] }))}
            onToggle={handleToggleFeature}
            toggleColor="bg-cyan-500"
          />
        </div>

        <FieldsCard
          title="Trường bài viết"
          icon={FileText}
          iconColorClass="text-cyan-500"
          fields={postFields}
          onToggle={handleTogglePostField}
          fieldColorClass="bg-cyan-500/10 text-cyan-600 dark:text-cyan-400"
          toggleColor="bg-cyan-500"
        />

        <FieldsCard
          title="Trường danh mục"
          icon={FolderTree}
          iconColorClass="text-emerald-500"
          fields={categoryFields}
          onToggle={handleToggleCategoryField}
          fieldColorClass="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          toggleColor="bg-emerald-500"
        />
      </div>

      <ConventionNote>
        <strong>Convention:</strong> Slug tự động từ tiêu đề. Trường <Code>order</Code> và <Code>active</Code> bắt buộc theo Rails convention.
      </ConventionNote>
    </div>
  );
}
