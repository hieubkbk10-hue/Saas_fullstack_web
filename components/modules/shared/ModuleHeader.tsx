'use client';

import React from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ModuleHeaderProps {
  icon: React.ComponentType<{ size?: number }>;
  title: string;
  description: string;
  iconBgClass: string;
  iconTextClass: string;
  buttonClass: string;
}

export const ModuleHeader: React.FC<ModuleHeaderProps> = ({
  icon: Icon,
  title,
  description,
  iconBgClass,
  iconTextClass,
  buttonClass,
}) => {
  const router = useRouter();
  
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => router.push('/system/modules')}
          className="p-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl ${iconBgClass} ${iconTextClass} flex items-center justify-center`}>
            <Icon size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">{title}</h1>
            <p className="text-sm text-slate-500">{description}</p>
          </div>
        </div>
      </div>
      
      <button className={`flex items-center gap-2 px-4 py-2 ${buttonClass} text-white text-sm font-medium rounded-lg transition-colors`}>
        <Save size={16} /> Lưu thay đổi
      </button>
    </div>
  );
};
