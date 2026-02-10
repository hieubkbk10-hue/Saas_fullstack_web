'use client';

import React from 'react';
import { Badge, Checkbox } from '@/app/admin/components/ui';
import { EXTRA_FEATURE_OPTIONS } from '../wizard-presets';

type ExtraFeaturesStepProps = {
  enabledFeatures: Set<string>;
  hasPosts: boolean;
  hasProducts: boolean;
  hasServices: boolean;
  onToggle: (key: string, enabled: boolean) => void;
};

export function ExtraFeaturesStep({
  enabledFeatures,
  hasPosts,
  hasProducts,
  hasServices,
  onToggle,
}: ExtraFeaturesStepProps) {
  const options = EXTRA_FEATURE_OPTIONS.filter((option) => {
    if (option.key === 'posts') {
      return !hasPosts;
    }
    if (option.key === 'services') {
      return !hasServices;
    }
    if (option.requiredProducts && !hasProducts) {
      return false;
    }
    if (option.key === 'comments') {
      return hasProducts || hasPosts;
    }
    return true;
  });

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Ngoài ra muốn bật thêm gì?</h3>
        <p className="text-xs text-slate-500">Tick các tính năng phụ trợ cần seed.</p>
      </div>

      <div className="space-y-3">
        {options.map((option) => {
          const checked = enabledFeatures.has(option.key);
          return (
            <label
              key={option.key}
              className="flex items-start gap-3 rounded-lg border border-slate-200 dark:border-slate-800 p-3 cursor-pointer"
            >
              <Checkbox
                checked={checked}
                onCheckedChange={(value) => onToggle(option.key, value)}
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{option.label}</span>
                  <Badge variant="secondary" className="text-[10px]">
                    {option.modules.join(', ')}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 mt-1">{option.description}</p>
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}
