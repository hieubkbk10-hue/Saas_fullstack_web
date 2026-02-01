import React, { useState } from 'react';
import { Card } from '@/app/admin/components/ui';
import { Monitor, Smartphone, Tablet } from 'lucide-react';

type DeviceType = 'desktop' | 'tablet' | 'mobile';

type LivePreviewProps = {
  url: string;
  title: string;
  defaultDevice?: DeviceType;
};

const DEVICE_DIMENSIONS = {
  desktop: { width: '100%', height: '800px' },
  tablet: { width: '768px', height: '1024px' },
  mobile: { width: '375px', height: '667px' },
};

export function LivePreview({ url, title, defaultDevice = 'desktop' }: LivePreviewProps) {
  const [device, setDevice] = useState<DeviceType>(defaultDevice);
  const [isLoading, setIsLoading] = useState(true);

  const dimensions = DEVICE_DIMENSIONS[device];

  return (
    <Card className="p-4">
      <div className="mb-3 pb-2 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
          Preview: {title}
        </h3>
        <div className="flex gap-1">
          <button
            onClick={() => setDevice('desktop')}
            className={`p-2 rounded transition-colors ${
              device === 'desktop' 
                ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100' 
                : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title="Desktop"
          >
            <Monitor size={16} />
          </button>
          <button
            onClick={() => setDevice('tablet')}
            className={`p-2 rounded transition-colors ${
              device === 'tablet' 
                ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100' 
                : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title="Tablet"
          >
            <Tablet size={16} />
          </button>
          <button
            onClick={() => setDevice('mobile')}
            className={`p-2 rounded transition-colors ${
              device === 'mobile' 
                ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100' 
                : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title="Mobile"
          >
            <Smartphone size={16} />
          </button>
        </div>
      </div>
      
      <div className="bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden flex justify-center">
        <div 
          className="relative bg-white transition-all duration-300"
          style={{ 
            width: dimensions.width,
            height: dimensions.height,
            maxWidth: '100%'
          }}
        >
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-100 dark:bg-slate-800">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 dark:border-slate-100" />
            </div>
          )}
          <iframe
            src={url}
            className="w-full h-full border-0"
            title={title}
            onLoad={() => setIsLoading(false)}
            sandbox="allow-same-origin allow-scripts allow-forms"
          />
        </div>
      </div>
      
      <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        Preview đang load từ: <span className="font-mono">{url}</span>
      </div>
    </Card>
  );
}
