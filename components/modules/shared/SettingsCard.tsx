'use client';

import React from 'react';
import { Settings } from 'lucide-react';

interface SettingsCardProps {
  children: React.ReactNode;
  title?: string;
}

export const SettingsCard: React.FC<SettingsCardProps> = ({ 
  children, 
  title = 'Cài đặt' 
}) => (
  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
    <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
      <Settings size={14} className="text-slate-500" /> {title}
    </h3>
    <div className="space-y-3">
      {children}
    </div>
  </div>
);

type BaseSettingInputProps = {
  label: string;
  focusColor?: string;
  min?: number;
  max?: number;
};

type NumberSettingInputProps = BaseSettingInputProps & {
  type?: 'number';
  value: number;
  onChange: (value: number) => void;
};

type TextSettingInputProps = BaseSettingInputProps & {
  type: 'text';
  value: string;
  onChange: (value: string) => void;
};

type SettingInputProps = NumberSettingInputProps | TextSettingInputProps;

export const SettingInput: React.FC<SettingInputProps> = (props) => {
  const {
    label,
    value,
    focusColor = 'focus:border-cyan-500',
    min = 1,
    max = 100,
  } = props;
  const type = props.type ?? 'number';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (props.type === 'text') {
      props.onChange(e.target.value);
      return;
    }

    const val = e.target.value;
    if (val === '') {
      props.onChange(min);
      return;
    }
    const num = parseInt(val);
    if (isNaN(num)) {
      props.onChange(min);
    } else {
      props.onChange(Math.max(min, Math.min(max, num)));
    }
  };

  return (
    <div>
      <label className="text-xs text-slate-500 mb-1 block">{label}</label>
      <input 
        type={type}
        value={value}
        onChange={handleChange}
        min={type === 'number' ? min : undefined}
        max={type === 'number' ? max : undefined}
        className={`w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none ${focusColor}`}
      />
    </div>
  );
};

interface SettingSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  focusColor?: string;
}

export const SettingSelect: React.FC<SettingSelectProps> = ({
  label,
  value,
  onChange,
  options,
  focusColor = 'focus:border-cyan-500'
}) => (
  <div>
    <label className="text-xs text-slate-500 mb-1 block">{label}</label>
    <select 
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none ${focusColor}`}
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
);
