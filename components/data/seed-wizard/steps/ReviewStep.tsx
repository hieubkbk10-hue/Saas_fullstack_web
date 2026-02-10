'use client';

import React from 'react';
import { Badge, Checkbox } from '@/app/admin/components/ui';
import { cn } from '@/app/admin/components/ui';
import type { DataScale, WizardState } from '../types';

type ReviewStepProps = {
  clearBeforeSeed: boolean;
  dataScale: DataScale;
  modules: string[];
  summary: { label: string; value: string }[];
  onClearChange: (value: boolean) => void;
  onScaleChange: (value: DataScale) => void;
  state: WizardState;
};

const SCALE_OPTIONS: Array<{ description: string; key: DataScale; label: string }> = [
  { key: 'low', label: 'Ít (test nhanh)', description: '~5 SP, ~5 bài, ~5 đơn' },
  { key: 'medium', label: 'Vừa (dev)', description: '~20 SP, ~15 bài, ~20 đơn' },
  { key: 'high', label: 'Nhiều (demo)', description: '~50 SP, ~30 bài, ~50 đơn' },
];

export function ReviewStep({
  clearBeforeSeed,
  dataScale,
  modules,
  summary,
  onClearChange,
  onScaleChange,
}: ReviewStepProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Xác nhận trước khi seed</h3>
        <p className="text-xs text-slate-500">Kiểm tra lại toàn bộ lựa chọn.</p>
      </div>

      <div className="space-y-3">
        <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">Muốn seed bao nhiêu dữ liệu mẫu?</div>
        <div className="grid gap-3 md:grid-cols-3">
          {SCALE_OPTIONS.map((option) => (
            <button
              key={option.key}
              onClick={() => onScaleChange(option.key)}
              className={cn(
                'rounded-lg border p-3 text-left transition-all',
                dataScale === option.key
                  ? 'border-cyan-400 bg-cyan-50 dark:bg-cyan-950/20'
                  : 'border-slate-200 dark:border-slate-800 hover:border-cyan-300'
              )}
            >
              <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{option.label}</div>
              <div className="text-xs text-slate-500 mt-1">{option.description}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {summary.map((item) => (
          <div key={item.label} className="rounded-lg border border-slate-200 dark:border-slate-800 p-3">
            <div className="text-xs text-slate-500">{item.label}</div>
            <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{item.value}</div>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3">
        <div className="text-xs text-slate-500">Modules sẽ seed</div>
        <div className="flex flex-wrap gap-2 mt-2">
          {modules.map((moduleKey) => (
            <Badge key={moduleKey} variant="secondary">
              {moduleKey}
            </Badge>
          ))}
        </div>
      </div>

      <label className="flex items-center gap-3 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20 p-3 cursor-pointer">
        <Checkbox checked={clearBeforeSeed} onCheckedChange={(value) => onClearChange(value)} />
        <div>
          <div className="text-sm font-semibold text-amber-900 dark:text-amber-100">Clear dữ liệu cũ trước khi seed</div>
          <div className="text-xs text-amber-700 dark:text-amber-300">Xóa sạch data cũ, sau đó seed lại theo wizard.</div>
        </div>
      </label>
    </div>
  );
}
