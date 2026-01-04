'use client';

import React from 'react';
import { Save, BarChart3, ExternalLink } from 'lucide-react';

const IntegrationItem = ({ title, desc, placeholder, connected, iconColor }: any) => (
  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 hover:border-slate-300 dark:hover:border-slate-700 transition-all">
    <div className="flex justify-between items-start gap-4">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
           <div className={`w-8 h-8 rounded bg-slate-200 dark:bg-slate-800 flex items-center justify-center ${iconColor}`}>
             <BarChart3 size={18} />
           </div>
           <div>
             <h3 className="text-slate-700 dark:text-slate-200 font-semibold text-sm">{title}</h3>
             <span className={`text-[10px] px-1.5 py-0.5 rounded border ml-2 ${connected ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-300 dark:border-slate-700'}`}>
               {connected ? 'CONNECTED' : 'NOT CONNECTED'}
             </span>
           </div>
        </div>
        <p className="text-xs text-slate-500 mb-4 h-8">{desc}</p>
        
        <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Measurement ID / Pixel ID</label>
            <div className="flex gap-2">
                <input 
                    type="text" 
                    placeholder={placeholder} 
                    className="flex-1 bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded px-3 py-2 text-sm text-slate-700 dark:text-slate-200 font-mono outline-none focus:border-cyan-500/50"
                    defaultValue={connected ? "G-12345678" : ""} 
                />
            </div>
        </div>
      </div>
      <div className="flex flex-col gap-2">
         <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" defaultChecked={connected} />
            <div className="w-9 h-5 bg-slate-300 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-600"></div>
         </label>
      </div>
    </div>
    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800/50 flex justify-end gap-3">
        <button className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white flex items-center gap-1">Docs <ExternalLink size={10}/></button>
        <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs rounded border border-slate-300 dark:border-slate-700 transition-colors">
            <Save size={12} /> Save Config
        </button>
    </div>
  </div>
);

export default function IntegrationsPage() {
    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Analytics Integrations</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Configure third-party tracking scripts and analytics tools.</p>
            </div>

            <div className="grid gap-4">
                <IntegrationItem 
                    title="Google Analytics 4" 
                    desc="Track website traffic and user behavior with the latest GA4 property."
                    placeholder="G-XXXXXXXXXX"
                    connected={true}
                    iconColor="text-orange-400"
                />
                
                <IntegrationItem 
                    title="Facebook Pixel" 
                    desc="Track conversions from Facebook ads and build targeted audiences."
                    placeholder="123456789012345"
                    connected={false}
                    iconColor="text-blue-400"
                />

                <IntegrationItem 
                    title="Google Tag Manager" 
                    desc="Manage all your website tags without editing code."
                    placeholder="GTM-XXXXXX"
                    connected={false}
                    iconColor="text-blue-300"
                />
            </div>
        </div>
    );
}
