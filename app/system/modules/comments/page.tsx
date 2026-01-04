'use client';

import React, { useState } from 'react';
import { MessageSquare, ThumbsUp } from 'lucide-react';
import { FieldConfig } from '@/types/moduleConfig';
import { 
  ModuleHeader, ModuleStatus, ConventionNote, Code,
  SettingsCard, SettingInput, FeaturesCard, FieldsCard
} from '@/components/modules/shared';

const INITIAL_FIELDS: FieldConfig[] = [
  { id: 'CM1', name: 'Nội dung', key: 'content', type: 'textarea', required: true, enabled: true, isSystem: true },
  { id: 'CM2', name: 'Tác giả', key: 'author_id', type: 'select', required: true, enabled: true, isSystem: true },
  { id: 'CM3', name: 'Đối tượng', key: 'target_id', type: 'select', required: true, enabled: true, isSystem: true },
  { id: 'CM4', name: 'Loại', key: 'target_type', type: 'select', required: true, enabled: true, isSystem: true },
  { id: 'CM5', name: 'Trạng thái', key: 'status', type: 'select', required: true, enabled: true, isSystem: true },
  { id: 'CM6', name: 'Thứ tự', key: 'order', type: 'number', required: true, enabled: true, isSystem: true },
  { id: 'CM7', name: 'Active', key: 'active', type: 'boolean', required: true, enabled: true, isSystem: true },
  { id: 'CM8', name: 'Likes', key: 'likes_count', type: 'number', required: false, enabled: false, isSystem: false, linkedFeature: 'enableLikes' },
];

const FEATURES = [
  { key: 'enableLikes', label: 'Lượt thích', icon: ThumbsUp, linkedField: 'likes_count' },
];

export default function CommentsModuleConfigPage() {
  const [features, setFeatures] = useState({ enableLikes: false });
  const [fields, setFields] = useState(INITIAL_FIELDS);
  const [settings, setSettings] = useState({ commentsPerPage: 20 });

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
        icon={MessageSquare}
        title="Module Bình luận"
        description="Quan ly binh luan bai viet và san pham"
        iconBgClass="bg-cyan-500/10"
        iconTextClass="text-cyan-600 dark:text-cyan-400"
        buttonClass="bg-cyan-600 hover:bg-cyan-500"
      />

      <ModuleStatus isCore={false} enabled={true} toggleColor="bg-cyan-500" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="space-y-4">
          <SettingsCard>
            <SettingInput 
              label="Số bình luận / trang" 
              value={settings.commentsPerPage} 
              onChange={(v) => setSettings({...settings, commentsPerPage: v})}
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
            title="Trường binh luan"
            icon={MessageSquare}
            iconColorClass="text-cyan-500"
            fields={fields}
            onToggle={handleToggleField}
            fieldColorClass="bg-cyan-500/10 text-cyan-600 dark:text-cyan-400"
            toggleColor="bg-cyan-500"
          />
        </div>
      </div>

      <ConventionNote>
        <strong>Convention:</strong> Trường <Code>target_type</Code> xác định loại (post/product). <Code>status</Code>: pending, approved, spam.
      </ConventionNote>
    </div>
  );
}
