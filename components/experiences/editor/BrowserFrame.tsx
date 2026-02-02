 import React from 'react';
 
 type BrowserFrameProps = {
   children: React.ReactNode;
   url?: string;
   maxHeight?: string;
 };
 
 export function BrowserFrame({ 
   children, 
   url = 'yoursite.com/page',
   maxHeight = '520px'
 }: BrowserFrameProps) {
   return (
     <div className="border rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-lg">
       <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2 flex items-center gap-2 border-b">
         <div className="flex gap-1.5">
           <div className="w-3 h-3 rounded-full bg-red-400" />
           <div className="w-3 h-3 rounded-full bg-yellow-400" />
           <div className="w-3 h-3 rounded-full bg-green-400" />
         </div>
         <div className="flex-1 ml-4">
           <div className="bg-white dark:bg-slate-700 rounded-md px-3 py-1 text-xs text-slate-400 max-w-xs">
             {url}
           </div>
         </div>
       </div>
       <div className="overflow-y-auto" style={{ maxHeight }}>
         {children}
       </div>
     </div>
   );
 }
