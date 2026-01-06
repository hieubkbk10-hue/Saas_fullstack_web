'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ShieldOff, ArrowLeft, Loader2 } from 'lucide-react';
import { useAdminModules } from '../context/AdminModulesContext';
import { Button } from './ui';

interface ModuleGuardProps {
  moduleKey: string;
  children: React.ReactNode;
  fallbackUrl?: string;
}

export function ModuleGuard({ moduleKey, children, fallbackUrl = '/admin/dashboard' }: ModuleGuardProps) {
  const router = useRouter();
  const { isModuleEnabled, isLoading, modules } = useAdminModules();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-slate-400" />
      </div>
    );
  }

  const module = modules.find(m => m.key === moduleKey);
  const isEnabled = isModuleEnabled(moduleKey);

  if (!isEnabled) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4">
        <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-6">
          <ShieldOff size={40} className="text-slate-400" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">
          Module đã bị tắt
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md">
          Module <span className="font-semibold text-slate-700 dark:text-slate-300">{module?.name || moduleKey}</span> hiện đang bị tắt. 
          Vui lòng liên hệ System Admin để bật module này tại trang <span className="text-cyan-600">/system/modules</span>.
        </p>
        <Button onClick={() => router.push(fallbackUrl)} className="gap-2">
          <ArrowLeft size={16} />
          Quay lại Dashboard
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}

export function withModuleGuard<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  moduleKey: string,
  fallbackUrl?: string
) {
  return function GuardedComponent(props: P) {
    return (
      <ModuleGuard moduleKey={moduleKey} fallbackUrl={fallbackUrl}>
        <WrappedComponent {...props} />
      </ModuleGuard>
    );
  };
}
