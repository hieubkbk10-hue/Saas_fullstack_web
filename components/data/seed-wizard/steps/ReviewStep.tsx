'use client';

import React from 'react';
import { Badge, Checkbox } from '@/app/admin/components/ui';

type ReviewStepProps = {
  clearBeforeSeed: boolean;
  dataScaleLabel: string;
  experienceSummary: string;
  moduleConfigs: { label: string; value: string }[];
  modules: string[];
  summary: { label: string; value: string }[];
  onClearChange: (value: boolean) => void;
};

export function ReviewStep({
  clearBeforeSeed,
  dataScaleLabel,
  experienceSummary,
  moduleConfigs,
  modules,
  summary,
  onClearChange,
}: ReviewStepProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Xác nhận trước khi seed</h3>
        <p className="text-xs text-slate-500">Kiểm tra lại toàn bộ lựa chọn.</p>
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
        <div className="text-xs text-slate-500">Experience preset</div>
        <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{experienceSummary}</div>
        <div className="text-xs text-slate-500 mt-1">Có thể chỉnh chi tiết tại /system/experiences.</div>
      </div>

      {moduleConfigs.length > 0 && (
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3">
          <div className="text-xs text-slate-500">Cấu hình modules</div>
          <div className="mt-2 grid gap-2 md:grid-cols-2">
            {moduleConfigs.map((item) => (
              <div key={item.label} className="rounded-md bg-slate-50 dark:bg-slate-900/40 px-3 py-2">
                <div className="text-[11px] text-slate-500">{item.label}</div>
                <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      )}

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

      <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3">
        <div className="text-xs text-slate-500">Quy mô dữ liệu</div>
        <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{dataScaleLabel}</div>
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
