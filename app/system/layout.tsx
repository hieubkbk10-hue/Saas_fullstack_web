'use client';

import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Blocks, 
  Menu, 
  Search, 
  Sun,
  Moon, 
  User, 
  ChevronRight,
  Terminal,
  Globe,
  BarChart3
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const SidebarItem = ({ href, icon: Icon, label, collapsed }: { href: string, icon: any, label: string, collapsed: boolean }) => {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== '/system' && pathname.startsWith(href));
  
  return (
    <Link
      href={href}
      className={`
        flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 group mb-0.5
        ${isActive 
          ? 'bg-slate-200 dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 border-l-2 border-cyan-500 dark:border-cyan-400' 
          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 border-l-2 border-transparent'}
      `}
    >
      <Icon size={18} className="shrink-0" />
      {!collapsed && <span className="text-sm font-medium whitespace-nowrap">{label}</span>}
    </Link>
  );
};

const SidebarGroup = ({ label, collapsed }: { label: string, collapsed: boolean }) => (
  <div className={`text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-wider mb-2 mt-6 px-3 ${collapsed ? 'hidden' : 'block'}`}>
    {label}
  </div>
);

export default function SystemLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    const saved = localStorage.getItem('darkMode');
    if (saved !== null) {
      setDarkMode(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const getPageName = () => {
    if (pathname === '/system') return 'Dashboard';
    if (pathname.includes('modules')) return 'Quản lý Module';
    if (pathname.includes('integrations')) return 'Analytics Integrations';
    if (pathname.includes('seo')) return 'SEO Configuration';
    return 'System';
  };

  return (
    <div className="flex h-screen bg-slate-100 dark:bg-slate-950 overflow-hidden text-slate-800 dark:text-slate-200 font-sans selection:bg-cyan-500/30 transition-colors duration-300">
      
      {/* Sidebar */}
      <aside 
        className={`
          fixed inset-y-0 left-0 z-50 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 flex flex-col
          ${collapsed ? 'w-16' : 'w-64'}
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <div className="h-16 flex items-center px-4 border-b border-slate-200 dark:border-slate-800">
          <Terminal className="text-cyan-600 dark:text-cyan-400 shrink-0" size={24} />
          {!collapsed && (
            <div className="ml-3">
              <h1 className="font-bold text-slate-800 dark:text-slate-100 tracking-tight">SYSTEM</h1>
              <span className="text-[10px] uppercase text-slate-400 dark:text-slate-500 font-mono tracking-wider">Console v2.5</span>
            </div>
          )}
        </div>

        <nav className="flex-1 p-3 overflow-y-auto custom-scrollbar">
          <SidebarGroup label="Platform" collapsed={collapsed} />
          <SidebarItem href="/system" icon={LayoutDashboard} label="Overview" collapsed={collapsed} />
          
          <SidebarGroup label="Control" collapsed={collapsed} />
          <SidebarItem href="/system/modules" icon={Blocks} label="Quản lý Module" collapsed={collapsed} />
          <SidebarItem href="/system/integrations" icon={BarChart3} label="Analytics" collapsed={collapsed} />
          <SidebarItem href="/system/seo" icon={Globe} label="SEO & Discovery" collapsed={collapsed} />
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800">
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex justify-center items-center p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition-colors hidden md:flex"
          >
            {collapsed ? <ChevronRight size={16} /> : <span className="text-xs">Collapse</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col h-full transition-all duration-300 ${collapsed ? 'md:ml-16' : 'md:ml-64'}`}>
        
        {/* Header */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button 
              className="md:hidden text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu size={24} />
            </button>
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <span className="hidden sm:inline">System</span>
              <span className="hidden sm:inline">/</span>
              <span className="text-slate-800 dark:text-slate-100 font-medium">{getPageName()}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <div className="hidden sm:flex items-center bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-md px-3 py-1.5 focus-within:border-cyan-500/50 transition-colors">
              <Search size={14} className="text-slate-400 dark:text-slate-500 mr-2" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="bg-transparent border-none outline-none text-xs text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 w-48"
              />
              <span className="text-[10px] text-slate-500 dark:text-slate-600 bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border border-slate-300 dark:border-slate-800 ml-2">Ctrl+K</span>
            </div>

            <div className="h-4 w-px bg-slate-300 dark:bg-slate-800 mx-1 hidden sm:block"></div>

            <div className="flex items-center gap-1">
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 text-[10px] font-mono font-medium tracking-wide">
                PROD
              </span>
            </div>

            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="relative p-2 text-slate-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            
            <button className="flex items-center gap-2 pl-2">
              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300">
                <User size={16} />
              </div>
            </button>
          </div>
        </header>

        {/* Page Content Scrollable Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar bg-slate-100 dark:bg-slate-950">
          {children}
        </main>

        {/* System Status Bar */}
        <footer className="h-8 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center px-4 text-[10px] font-mono text-slate-400 dark:text-slate-500 justify-between shrink-0 select-none">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-slate-600 dark:text-slate-300">System: Healthy</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <span>v2.5.0</span>
          </div>
        </footer>
      </div>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/30 dark:bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
