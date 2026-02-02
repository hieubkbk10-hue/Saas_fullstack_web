 import React from 'react';
 import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/app/admin/components/ui';
 
 type ConfigPanelProps = {
   isExpanded: boolean;
   onToggle: () => void;
   children: React.ReactNode;
   leftContent?: React.ReactNode;
   expandedHeight?: string;
 };
 
 export function ConfigPanel({ 
   isExpanded, 
   onToggle, 
   children,
   leftContent,
   expandedHeight = '280px'
 }: ConfigPanelProps) {
   return (
     <div 
       className={cn(
         "flex-shrink-0 border-t bg-white dark:bg-slate-900 transition-all duration-200",
       )}
       style={{ height: isExpanded ? expandedHeight : '52px' }}
     >
       <div className="flex items-center justify-between px-4 h-[52px] border-b border-slate-200 dark:border-slate-700">
         <div className="flex-1">
           {leftContent}
         </div>
         <button 
           onClick={onToggle}
           className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
           title={isExpanded ? 'Thu gọn' : 'Mở rộng'}
         >
           {isExpanded ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
         </button>
       </div>
       
       {isExpanded && (
         <div 
           className="p-4 overflow-auto"
           style={{ height: `calc(${expandedHeight} - 52px)` }}
         >
           {children}
         </div>
       )}
     </div>
   );
 }
