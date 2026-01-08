'use client';

import React, { useState } from 'react';
import { ArrowUpDown, SlidersHorizontal, ChevronDown, Trash2, Loader2 } from 'lucide-react';
import { cn, Button, TableHead } from './ui';

export const ColumnToggle = ({ columns, visibleColumns, onToggle }: {
  columns: { key: string; label: string; required?: boolean }[];
  visibleColumns: string[];
  onToggle: (key: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  
  return (
    <div className="relative">
      <Button variant="outline" size="sm" className="gap-2 h-9" onClick={() => setOpen(!open)}>
        <SlidersHorizontal size={14} />
        Cột hiển thị
        <ChevronDown size={14} />
      </Button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-50 py-2">
            <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Chọn cột hiển thị</div>
            {columns.map(col => (
              <label key={col.key} className={cn(
                "flex items-center gap-3 px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer",
                col.required && "opacity-50 cursor-not-allowed"
              )}>
                <input
                  type="checkbox"
                  checked={visibleColumns.includes(col.key)}
                  onChange={() => !col.required && onToggle(col.key)}
                  disabled={col.required}
                  className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">{col.label}</span>
                {col.required && <span className="text-xs text-slate-400 ml-auto">Bắt buộc</span>}
              </label>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export const SortableHeader = ({ label, sortKey, sortConfig, onSort, className }: {
  label: string;
  sortKey: string;
  sortConfig: { key: string | null; direction: 'asc' | 'desc' };
  onSort: (key: string) => void;
  className?: string;
}) => (
  <TableHead
    className={cn("cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors select-none", className)}
    onClick={() => onSort(sortKey)}
  >
    <div className="flex items-center">
      {label}
      <ArrowUpDown size={14} className={cn("ml-2", sortConfig.key === sortKey ? "text-slate-900 dark:text-slate-100" : "text-slate-300 dark:text-slate-600")} />
    </div>
  </TableHead>
);

export function useSortableData<T>(items: T[], config: { key: string | null; direction: 'asc' | 'desc' }) {
  return React.useMemo(() => {
    const sortableItems = [...items];
    if (config.key) {
      sortableItems.sort((a: any, b: any) => {
        const aVal = a[config.key!];
        const bVal = b[config.key!];
        if (aVal < bVal) return config.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return config.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [items, config]);
}

// FIX #10: Add loading state support
export const BulkActionBar = ({ selectedCount, onDelete, onClearSelection, isLoading }: {
  selectedCount: number;
  onDelete: () => void;
  onClearSelection: () => void;
  isLoading?: boolean;
}) => {
  if (selectedCount === 0) return null;
  
  return (
    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Đã chọn {selectedCount} mục</span>
        <button onClick={onClearSelection} className="text-xs text-slate-500 hover:text-slate-700 underline" disabled={isLoading}>
          Bỏ chọn
        </button>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="destructive" size="sm" className="gap-2 h-8" onClick={onDelete} disabled={isLoading}>
          {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
          {isLoading ? 'Đang xóa...' : `Xóa (${selectedCount})`}
        </Button>
      </div>
    </div>
  );
};

export const SelectCheckbox = ({ checked, onChange, indeterminate }: { 
  checked: boolean; 
  onChange: () => void;
  indeterminate?: boolean;
}) => {
  const ref = React.useRef<HTMLInputElement>(null);
  
  React.useEffect(() => {
    if (ref.current) {
      ref.current.indeterminate = indeterminate || false;
    }
  }, [indeterminate]);

  return (
    <input
      ref={ref}
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
    />
  );
};
