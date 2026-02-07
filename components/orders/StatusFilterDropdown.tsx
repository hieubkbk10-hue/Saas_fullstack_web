'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';

type StatusFilterOption = {
  key: string;
  label: string;
};

type StatusFilterDropdownProps = {
  label?: string;
  options: StatusFilterOption[];
  activeKeys: string[];
  isAllActive: boolean;
  onToggleKey: (key: string) => void;
  onToggleAll: () => void;
  brandColor?: string;
};

export function StatusFilterDropdown({
  label = 'Trạng thái',
  options,
  activeKeys,
  isAllActive,
  onToggleKey,
  onToggleAll,
  brandColor,
}: StatusFilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonLabel = useMemo(() => {
    if (isAllActive) return 'Tất cả';
    if (activeKeys.length > 0) return `${label} (${activeKeys.length})`;
    return label;
  }, [activeKeys.length, isAllActive, label]);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${isAllActive ? 'bg-white shadow-sm' : 'text-slate-500'}`}
        style={isAllActive && brandColor ? { borderColor: brandColor, color: brandColor } : { borderColor: '#e2e8f0' }}
      >
        {buttonLabel}
      </button>
      {open && (
        <div className="absolute left-0 mt-2 w-56 rounded-lg border border-slate-200 bg-white shadow-lg p-3 z-10">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs text-slate-700">
              <input type="checkbox" checked={isAllActive} onChange={onToggleAll} />
              <span>Tất cả</span>
            </label>
            <div className="h-px bg-slate-200" />
            <div className="max-h-52 overflow-auto space-y-2">
              {options.map((option) => (
                <label key={option.key} className="flex items-center gap-2 text-xs text-slate-600">
                  <input
                    type="checkbox"
                    checked={activeKeys.includes(option.key)}
                    onChange={() => onToggleKey(option.key)}
                  />
                  <span className="truncate">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
