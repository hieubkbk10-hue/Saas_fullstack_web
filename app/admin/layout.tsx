'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Toaster } from 'sonner';
import { AdminModulesProvider } from './context/AdminModulesContext';
import { AdminAuthProvider } from './auth/context';
import { AdminAuthGuard } from './auth/AdminAuthGuard';

function AdminLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('theme') === 'dark' ||
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 flex font-sans">
      <Toaster position="top-right" richColors theme={isDarkMode ? 'dark' : 'light'} />
      
      <Sidebar mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />

      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        <Header 
          isDarkMode={isDarkMode} 
          toggleTheme={toggleTheme} 
          setMobileMenuOpen={setMobileMenuOpen} 
        />

        <main className="flex-1 p-4 lg:p-8 overflow-x-hidden w-full max-w-[1600px] mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

function AdminLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Login page doesn't need full layout
  if (pathname === '/admin/auth/login') {
    return <>{children}</>;
  }
  
  return (
    <AdminAuthGuard>
      <AdminModulesProvider>
        <AdminLayoutContent>{children}</AdminLayoutContent>
      </AdminModulesProvider>
    </AdminAuthGuard>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminAuthProvider>
      <AdminLayoutWrapper>{children}</AdminLayoutWrapper>
    </AdminAuthProvider>
  );
}
