'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, FileText, ShoppingCart, Image as ImageIcon, 
  Users, Globe, Settings, ChevronRight, X, LogOut,
  ChevronsLeft, ChevronsRight
} from 'lucide-react';
import { cn, Button } from './ui';

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  href: string;
  active: boolean;
  subItems?: { label: string, href: string }[];
  isCollapsed: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  pathname: string;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ 
  icon: Icon, 
  label, 
  href, 
  active, 
  subItems, 
  isCollapsed, 
  isExpanded, 
  onToggle,
  pathname
}) => {
  const hasSub = subItems && subItems.length > 0;

  const handleClick = (e: React.MouseEvent) => {
    if (hasSub) {
      e.preventDefault();
      onToggle();
    }
  };

  return (
    <div className="mb-1 group relative">
      {hasSub ? (
        <button 
          onClick={handleClick}
          className={cn(
            "w-full flex items-center transition-all duration-200 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
            isCollapsed ? "justify-center p-3" : "justify-between px-3 py-2.5",
            active ? "bg-blue-500/10 text-blue-600 dark:text-blue-400" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200"
          )}
          title={isCollapsed ? label : undefined}
        >
          <div className={cn("flex items-center", isCollapsed ? "gap-0" : "gap-3")}>
            <Icon size={isCollapsed ? 22 : 20} className="shrink-0 transition-transform duration-200 group-hover:scale-105" />
            <span className={cn("text-sm font-medium whitespace-nowrap transition-all duration-300 origin-left", isCollapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100")}>
              {label}
            </span>
          </div>
          {!isCollapsed && (
            <ChevronRight size={16} className={cn("transition-transform duration-200 opacity-70", isExpanded && "rotate-90")} />
          )}
        </button>
      ) : (
        <Link 
          href={href} 
          className={cn(
            "flex items-center transition-all duration-200 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
            isCollapsed ? "justify-center p-3" : "gap-3 px-3 py-2.5",
            active ? "bg-blue-500/10 text-blue-600 dark:text-blue-400" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200"
          )}
          title={isCollapsed ? label : undefined}
        >
          <Icon size={isCollapsed ? 22 : 20} className="shrink-0 transition-transform duration-200 group-hover:scale-105" />
          <span className={cn("text-sm font-medium whitespace-nowrap transition-all duration-300 origin-left", isCollapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100")}>
            {label}
          </span>
        </Link>
      )}
      
      {hasSub && (
        <div className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out",
          isExpanded && !isCollapsed ? "max-h-[500px] opacity-100 mt-1" : "max-h-0 opacity-0"
        )}>
          <div className="ml-4 border-l-2 border-slate-100 dark:border-slate-800 pl-3 space-y-1 my-1">
            {subItems.map((sub) => (
              <Link 
                key={sub.href} 
                href={sub.href}
                className={cn(
                  "block px-3 py-2 rounded-md text-sm transition-colors truncate relative",
                  pathname === sub.href || pathname.startsWith(sub.href + '/')
                    ? "text-blue-600 bg-blue-500/5 font-medium dark:text-blue-400" 
                    : "text-slate-500 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                )}
              >
                {sub.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

interface SidebarProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileMenuOpen, setMobileMenuOpen }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
  const pathname = usePathname();

  const isActive = (route: string) => pathname.startsWith(route);

  useEffect(() => {
    if (isActive('/admin/posts') || isActive('/admin/post-categories') || isActive('/admin/comments')) {
      setExpandedMenu('Quản lý bài viết');
    } else if (isActive('/admin/products') || isActive('/admin/categories') || isActive('/admin/customers')) {
      setExpandedMenu('E-Commerce');
    } else if (isActive('/admin/users') || isActive('/admin/roles')) {
      setExpandedMenu('Người dùng');
    } else if (isActive('/admin/menus') || isActive('/admin/home-components')) {
      setExpandedMenu('Website');
    }
  }, [pathname]);

  const handleMenuToggle = (label: string) => {
    if (isSidebarCollapsed) {
      setIsSidebarCollapsed(false);
      setExpandedMenu(label);
    } else {
      setExpandedMenu(expandedMenu === label ? null : label);
    }
  };

  return (
    <>
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <aside className={cn(
        "fixed lg:sticky top-0 left-0 h-screen bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-50 transition-all duration-300 ease-in-out flex flex-col shadow-lg lg:shadow-none",
        isSidebarCollapsed ? "lg:w-[80px]" : "lg:w-[280px]",
        mobileMenuOpen ? "translate-x-0 w-[280px]" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className={cn("h-16 flex items-center border-b border-slate-100 dark:border-slate-800 transition-all duration-300", isSidebarCollapsed ? "justify-center px-0" : "px-6 justify-between")}>
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-500 rounded-xl flex items-center justify-center text-white shadow-md shrink-0">
              <span className="font-bold text-lg">V</span>
            </div>
            <span className={cn("font-bold text-xl text-slate-800 dark:text-slate-100 whitespace-nowrap transition-opacity duration-300", isSidebarCollapsed ? "opacity-0 w-0 hidden" : "opacity-100 w-auto")}>
              VietAdmin
            </span>
          </div>
          <button className="lg:hidden" onClick={() => setMobileMenuOpen(false)}>
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        <div className="flex-1 py-6 px-3 space-y-6 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
          
          <div className="space-y-1">
            {!isSidebarCollapsed && <div className="px-3 mb-2 text-xs font-bold text-slate-400 uppercase tracking-wider">Tổng quan</div>}
            <SidebarItem 
              icon={LayoutDashboard} 
              label="Dashboard" 
              href="/admin/dashboard" 
              active={pathname === '/admin/dashboard' || pathname === '/admin'} 
              isCollapsed={isSidebarCollapsed}
              isExpanded={false}
              onToggle={() => {}}
              pathname={pathname}
            />
          </div>

          <div className="space-y-1">
            {!isSidebarCollapsed && <div className="px-3 mb-2 text-xs font-bold text-slate-400 uppercase tracking-wider">Nội dung</div>}
            <SidebarItem 
              icon={FileText} 
              label="Quản lý bài viết" 
              href="/admin/posts" 
              active={isActive('/admin/posts') || isActive('/admin/post-categories') || isActive('/admin/comments')}
              isCollapsed={isSidebarCollapsed}
              isExpanded={expandedMenu === 'Quản lý bài viết'}
              onToggle={() => handleMenuToggle('Quản lý bài viết')}
              pathname={pathname}
              subItems={[
                { label: 'Tất cả bài viết', href: '/admin/posts' },
                { label: 'Danh mục bài viết', href: '/admin/post-categories' },
                { label: 'Bình luận', href: '/admin/comments' },
              ]}
            />
          </div>

          <div className="space-y-1">
            {!isSidebarCollapsed && <div className="px-3 mb-2 text-xs font-bold text-slate-400 uppercase tracking-wider">Bán hàng</div>}
            <SidebarItem 
              icon={ShoppingCart} 
              label="E-Commerce" 
              href="/admin/products"
              active={isActive('/admin/products') || isActive('/admin/categories') || isActive('/admin/customers')}
              isCollapsed={isSidebarCollapsed}
              isExpanded={expandedMenu === 'E-Commerce'}
              onToggle={() => handleMenuToggle('E-Commerce')}
              pathname={pathname}
              subItems={[
                { label: 'Sản phẩm', href: '/admin/products' },
                { label: 'Danh mục sản phẩm', href: '/admin/categories' },
                { label: 'Khách hàng', href: '/admin/customers' },
              ]}
            />
          </div>

          <div className="space-y-1">
            {!isSidebarCollapsed && <div className="px-3 mb-2 text-xs font-bold text-slate-400 uppercase tracking-wider">Media</div>}
            <SidebarItem 
              icon={ImageIcon} 
              label="Thư viện ảnh" 
              href="/admin/images" 
              active={isActive('/admin/images')} 
              isCollapsed={isSidebarCollapsed}
              isExpanded={false}
              onToggle={() => {}}
              pathname={pathname}
            />
          </div>

          <div className="space-y-1">
            {!isSidebarCollapsed && <div className="px-3 mb-2 text-xs font-bold text-slate-400 uppercase tracking-wider">Hệ thống</div>}
            <SidebarItem 
              icon={Users} 
              label="Người dùng" 
              href="/admin/users"
              active={isActive('/admin/users') || isActive('/admin/roles')}
              isCollapsed={isSidebarCollapsed}
              isExpanded={expandedMenu === 'Người dùng'}
              onToggle={() => handleMenuToggle('Người dùng')}
              pathname={pathname}
              subItems={[
                { label: 'Danh sách User', href: '/admin/users' },
                { label: 'Phân quyền', href: '/admin/roles' },
              ]}
            />
            <SidebarItem 
              icon={Globe} 
              label="Website" 
              href="/admin/menus"
              active={isActive('/admin/menus') || isActive('/admin/home-components')}
              isCollapsed={isSidebarCollapsed}
              isExpanded={expandedMenu === 'Website'}
              onToggle={() => handleMenuToggle('Website')}
              pathname={pathname}
              subItems={[
                { label: 'Menu', href: '/admin/menus' },
                { label: 'Giao diện trang chủ', href: '/admin/home-components' },
              ]}
            />
            <SidebarItem 
              icon={Settings} 
              label="Cài đặt" 
              href="/admin/settings" 
              active={isActive('/admin/settings')} 
              isCollapsed={isSidebarCollapsed}
              isExpanded={false}
              onToggle={() => {}}
              pathname={pathname}
            />
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="hidden lg:flex items-center justify-center w-full h-9 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-blue-600 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            title={isSidebarCollapsed ? "Mở rộng" : "Thu gọn"}
          >
            {isSidebarCollapsed ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />}
          </button>

          <div className={cn("flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer", isSidebarCollapsed ? "justify-center" : "")}>
            <div className="relative">
              <img src="https://picsum.photos/100/100?random=999" alt="User" className="w-9 h-9 rounded-full ring-2 ring-white dark:ring-slate-700" />
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-slate-800"></div>
            </div>
            
            {!isSidebarCollapsed && (
              <div className="flex-1 overflow-hidden">
                <div className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">Admin User</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 truncate">admin@vietadmin.com</div>
              </div>
            )}
            {!isSidebarCollapsed && <LogOut size={16} className="text-slate-400 hover:text-red-500" />}
          </div>
        </div>
      </aside>
    </>
  );
};
