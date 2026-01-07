'use client';

import React from 'react';
import { 
  Hash, FileText, Edit3, Image, Clock, Tag, ToggleLeft, 
  Mail, Phone, Key, DollarSign, Layers, FolderTree, Calendar, Code, Palette
} from 'lucide-react';
import { FieldConfig, FieldType } from '@/types/moduleConfig';
import { ToggleSwitch } from './ToggleSwitch';

const fieldTypeIcons: Record<FieldType, React.ComponentType<{ size?: number }>> = {
  text: Hash,
  textarea: FileText,
  richtext: Edit3,
  email: Mail,
  phone: Phone,
  password: Key,
  number: Hash,
  price: DollarSign,
  image: Image,
  gallery: Layers,
  select: FolderTree,
  tags: Tag,
  date: Clock,
  daterange: Calendar,
  json: Code,
  boolean: ToggleLeft,
  color: Palette,
};

interface FieldRowProps {
  field: FieldConfig;
  onToggle: (id: string) => void;
  colorClass?: string;
  toggleColor?: string;
}

export const FieldRow: React.FC<FieldRowProps> = ({ 
  field, 
  onToggle, 
  colorClass = 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
  toggleColor = 'bg-cyan-500'
}) => {
  const TypeIcon = fieldTypeIcons[field.type] || FileText;
  
  return (
    <div className={`flex items-center justify-between p-2.5 rounded-lg border transition-all ${
      field.enabled 
        ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800' 
        : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 opacity-50'
    }`}>
      <div className="flex items-center gap-2.5">
        <div className={`w-7 h-7 rounded flex items-center justify-center ${
          field.enabled ? colorClass : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
        }`}>
          <TypeIcon size={14} />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{field.name}</span>
            {field.required && (
              <span className="text-[8px] px-1 py-0.5 rounded bg-rose-500/10 text-rose-500">BẮT BUỘC</span>
            )}
            {field.linkedFeature && (
              <span className="text-[8px] px-1 py-0.5 rounded bg-blue-500/10 text-blue-500">LINKED</span>
            )}
          </div>
          <code className="text-[10px] text-slate-400 font-mono">{field.key}</code>
        </div>
      </div>
      
      <ToggleSwitch 
        enabled={field.enabled} 
        onChange={() => onToggle(field.id)}
        disabled={field.isSystem && field.required}
        color={toggleColor}
      />
    </div>
  );
};
