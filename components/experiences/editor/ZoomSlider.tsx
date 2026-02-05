import React from 'react';
import { ZoomIn, ZoomOut } from 'lucide-react';
import { cn } from '@/app/admin/components/ui';

type ZoomSliderProps = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
};

export function ZoomSlider({
  value,
  onChange,
  min = 0.25,
  max = 1,
  step = 0.01,
  className
}: ZoomSliderProps) {
  const percentage = Math.round(value * 100);

  return (
    <div className={cn("flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-lg px-2 py-1", className)}>
      <ZoomOut size={14} className="text-slate-400" />
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-label="Zoom preview"
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-24 accent-blue-600"
      />
      <span className="text-[11px] text-slate-500 w-9 text-right">{percentage}%</span>
      <ZoomIn size={14} className="text-slate-400" />
    </div>
  );
}
