'use client';

import React from 'react';
import { Save, Globe, RefreshCw } from 'lucide-react';

export default function SEOConfigPage() {
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
         <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
           <Globe size={20} className="text-cyan-600 dark:text-cyan-400" /> SEO Configuration
         </h2>
         <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage sitemap generation and robot access rules.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 space-y-6">
        <div>
           <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Sitemap XML</h3>
           <div className="flex items-center gap-4 bg-slate-100 dark:bg-slate-950 p-3 rounded border border-slate-300 dark:border-slate-800 mb-2">
             <code className="text-xs text-slate-600 dark:text-slate-400 flex-1">https://yoursite.com/sitemap.xml</code>
             <button className="text-xs text-cyan-600 dark:text-cyan-400 font-medium hover:text-cyan-500 dark:hover:text-cyan-300 flex items-center gap-1">
               <RefreshCw size={12} /> Regenerate Now
             </button>
           </div>
           <p className="text-xs text-slate-500">Auto-update: Daily at 02:00 AM</p>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-800 pt-6">
          <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Robots.txt</h3>
          <p className="text-xs text-slate-500 mb-3">Edit the robots.txt content directly.</p>
          <textarea className="w-full h-48 bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded p-3 text-xs font-mono text-slate-700 dark:text-slate-300 outline-none focus:border-cyan-500/50" defaultValue={`User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /private/

Sitemap: https://yoursite.com/sitemap.xml`}></textarea>
          <div className="flex justify-end mt-3">
             <button className="flex items-center gap-2 px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm rounded border border-slate-300 dark:border-slate-700">
               <Save size={14} /> Save Changes
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
