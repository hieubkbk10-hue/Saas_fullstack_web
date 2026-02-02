 import React from 'react';
 import { Monitor, Smartphone, Tablet } from 'lucide-react';
import { cn } from '@/app/admin/components/ui';
 
 export type DeviceType = 'desktop' | 'tablet' | 'mobile';
 
 type DeviceToggleProps = {
   value: DeviceType;
   onChange: (device: DeviceType) => void;
   className?: string;
 };
 
 const devices = [
   { id: 'desktop' as const, icon: Monitor, label: 'Desktop', width: '1920px' },
   { id: 'tablet' as const, icon: Tablet, label: 'Tablet', width: '768px' },
   { id: 'mobile' as const, icon: Smartphone, label: 'Mobile', width: '375px' },
 ];
 
 export const deviceWidths: Record<DeviceType, string> = {
   desktop: 'w-full',
   tablet: 'w-[768px] max-w-full',
   mobile: 'w-[375px] max-w-full',
 };
 
 export function DeviceToggle({ value, onChange, className }: DeviceToggleProps) {
   return (
     <div className={cn("flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1", className)}>
       {devices.map(device => (
         <button
           key={device.id}
           onClick={() => onChange(device.id)}
           title={`${device.label} (${device.width})`}
           className={cn(
             "p-2 rounded-md transition-all",
             value === device.id 
               ? "bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-slate-100" 
               : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
           )}
         >
           <device.icon size={16} />
         </button>
       ))}
     </div>
   );
 }
