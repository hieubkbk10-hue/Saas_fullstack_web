'use client';

import { Globe, Loader2, RefreshCw, Save } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { toast } from 'sonner';

export default function SEOConfigPage(): React.ReactElement {
  const siteUrlSetting = useQuery(api.settings.getByKey, { key: 'site_url' });
  const robotsSetting = useQuery(api.settings.getByKey, { key: 'seo_robots' });
  const setSetting = useMutation(api.settings.set);
  const [robotsText, setRobotsText] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const baseUrl = (siteUrlSetting?.value as string) || process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';
  const sitemapUrl = `${baseUrl.replace(/\/$/, '')}/sitemap.xml`;

  useEffect(() => {
    if (robotsSetting) {
      setRobotsText(String(robotsSetting.value ?? ''));
    }
  }, [robotsSetting]);

  const canSave = useMemo(() => robotsSetting !== undefined, [robotsSetting]);

  const handleSave = async () => {
    if (!canSave) {return;}
    setIsSaving(true);
    try {
      await setSetting({ group: 'seo', key: 'seo_robots', value: robotsText });
      toast.success('Đã lưu robots.txt');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể lưu robots.txt');
    } finally {
      setIsSaving(false);
    }
  };

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
             <code className="text-xs text-slate-600 dark:text-slate-400 flex-1">{sitemapUrl}</code>
             <button
               type="button"
               className="text-xs text-slate-400 font-medium flex items-center gap-1 cursor-not-allowed"
               title="Sitemap tự động cập nhật"
             >
               <RefreshCw size={12} /> Auto
             </button>
           </div>
           <p className="text-xs text-slate-500">Sitemap được cập nhật tự động khi nội dung thay đổi.</p>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-800 pt-6">
          <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Robots.txt</h3>
          <p className="text-xs text-slate-500 mb-3">Chỉnh sửa nội dung robots.txt trực tiếp.</p>
          {robotsSetting === undefined ? (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Loader2 size={14} className="animate-spin" /> Đang tải dữ liệu...
            </div>
          ) : (
            <textarea
              className="w-full h-48 bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded p-3 text-xs font-mono text-slate-700 dark:text-slate-300 outline-none focus:border-cyan-500/50"
              value={robotsText}
              onChange={(event) => { setRobotsText(event.target.value); }}
            />
          )}
          <div className="flex justify-end mt-3">
             <button
               type="button"
               onClick={() => { void handleSave(); }}
               disabled={isSaving || robotsSetting === undefined}
               className="flex items-center gap-2 px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm rounded border border-slate-300 dark:border-slate-700 disabled:opacity-60 disabled:cursor-not-allowed"
             >
               {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
               Lưu thay đổi
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
