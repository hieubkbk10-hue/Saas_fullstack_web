'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useSystemAuth } from './context';

export function SystemAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useSystemAuth();

  // Redirect to login if not authenticated (useEffect to avoid setState during render)
  useEffect(() => {
    if (!isLoading && !isAuthenticated && pathname !== '/system/auth/login') {
      router.push('/system/auth/login');
    }
  }, [isLoading, isAuthenticated, pathname, router]);

  // Skip guard for login page
  if (pathname === '/system/auth/login') {
    return <>{children}</>;
  }

  // Show loading while checking auth or redirecting
  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
