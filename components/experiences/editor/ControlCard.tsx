 import React from 'react';
import { cn } from '@/app/admin/components/ui';
 
 type ControlCardProps = {
   title: string;
   children: React.ReactNode;
   className?: string;
 };
 
 export function ControlCard({ title, children, className }: ControlCardProps) {
   return (
     <div className={cn("bg-slate-50 dark:bg-slate-800/50 rounded-lg p-2", className)}>
       <h4 className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
         {title}
       </h4>
       <div className="space-y-1">
         {children}
       </div>
     </div>
   );
 }
 
 type ToggleRowProps = {
   label: string;
   description?: string;
   checked: boolean;
   onChange: (checked: boolean) => void;
   disabled?: boolean;
   accentColor?: string;
 };
 
 export function ToggleRow({ 
   label, 
   description, 
   checked, 
   onChange, 
   disabled,
   accentColor = '#3b82f6'
 }: ToggleRowProps) {
   return (
     <label className={cn(
       "flex items-center justify-between gap-2 py-1",
       disabled && "opacity-50 cursor-not-allowed"
     )}>
       <div className="flex-1 min-w-0">
         <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{label}</span>
         {description && <span className="text-xs text-slate-400 ml-1">· {description}</span>}
       </div>
       <button
         type="button"
         role="switch"
         aria-checked={checked}
         disabled={disabled}
         onClick={() => !disabled && onChange(!checked)}
         className={cn(
           "relative inline-flex h-4 w-7 flex-shrink-0 items-center rounded-full transition-colors",
           checked ? "" : "bg-slate-200 dark:bg-slate-700"
         )}
         style={checked ? { backgroundColor: accentColor } : undefined}
       >
         <span
           className={cn(
             "inline-block h-3 w-3 transform rounded-full bg-white shadow-sm transition-transform",
             checked ? "translate-x-3.5" : "translate-x-0.5"
           )}
         />
       </button>
     </label>
   );
 }
 
 type SelectRowProps = {
   label: string;
   value: string;
   options: { value: string; label: string }[];
   onChange: (value: string) => void;
   disabled?: boolean;
 };
 
 export function SelectRow({ label, value, options, onChange, disabled }: SelectRowProps) {
   return (
     <div className={cn(
       "flex items-center justify-between gap-2 py-1",
       disabled && "opacity-50 cursor-not-allowed"
     )}>
       <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{label}</span>
       <select
         value={value}
         onChange={(e) => onChange(e.target.value)}
         disabled={disabled}
         className="text-xs bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded px-2 py-0.5"
       >
         {options.map(opt => (
           <option key={opt.value} value={opt.value}>{opt.label}</option>
         ))}
       </select>
     </div>
   );
 }
