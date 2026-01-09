'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { useBrandColor, useSiteSettings } from './hooks';
import { Menu, X, ChevronDown, Phone, Mail, ShoppingCart, Heart, Search, User } from 'lucide-react';

type MenuItem = {
  _id: Id<"menuItems">;
  label: string;
  url: string;
  order: number;
  depth: number;
  active: boolean;
  icon?: string;
  openInNewTab?: boolean;
};

interface MenuItemWithChildren extends MenuItem {
  children: MenuItemWithChildren[];
}

type HeaderStyle = 'classic' | 'topbar' | 'transparent';

export function Header() {
  const brandColor = useBrandColor();
  const { siteName, logo } = useSiteSettings();
  const menuData = useQuery(api.menus.getFullMenu, { location: 'header' });
  const headerStyleSetting = useQuery(api.settings.getByKey, { key: 'header_style' });
  const headerConfigSetting = useQuery(api.settings.getByKey, { key: 'header_config' });
  
  const headerStyle: HeaderStyle = (headerStyleSetting?.value as HeaderStyle) || 'classic';
  const headerConfig = (headerConfigSetting?.value as Record<string, unknown>) || {};
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [expandedMobileItems, setExpandedMobileItems] = useState<string[]>([]);

  // Build menu tree từ flat items
  const menuTree = useMemo((): MenuItemWithChildren[] => {
    if (!menuData?.items) return [];
    
    const items = [...menuData.items].sort((a, b) => a.order - b.order);
    const rootItems = items.filter(item => item.depth === 0);
    
    return rootItems.map(root => {
      const rootIndex = items.indexOf(root);
      const nextRootIndex = items.findIndex((item, idx) => idx > rootIndex && item.depth === 0);
      const childrenRange = nextRootIndex === -1 ? items.slice(rootIndex + 1) : items.slice(rootIndex + 1, nextRootIndex);

      return {
        ...root,
        children: childrenRange.filter(c => c.depth === 1).map(child => {
          const childIndex = items.indexOf(child);
          const nextChildIndex = childrenRange.findIndex((item) => items.indexOf(item) > childIndex && item.depth <= 1);
          const subRange = nextChildIndex === -1 
            ? childrenRange.slice(childrenRange.indexOf(child) + 1) 
            : childrenRange.slice(childrenRange.indexOf(child) + 1, nextChildIndex);
          return {
            ...child,
            children: subRange.filter(s => s.depth === 2).map(s => ({ ...s, children: [] }))
          };
        })
      };
    });
  }, [menuData?.items]);

  const toggleMobileItem = (id: string) => {
    setExpandedMobileItems(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  if (menuData === undefined) {
    return (
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="h-8 w-32 bg-slate-200 animate-pulse rounded"></div>
        </div>
      </header>
    );
  }

  // Get config values with defaults
  const topbarConfig = (headerConfig.topbar || {}) as { hotline?: string; email?: string; showTrackOrder?: boolean; show?: boolean };
  const ctaConfig = (headerConfig.cta || { show: true, text: 'Liên hệ', url: '/contact' }) as { show?: boolean; text?: string; url?: string };
  const showTopbar = headerStyle === 'topbar' && topbarConfig.show !== false;

  return (
    <header className={`sticky top-0 z-50 ${headerStyle === 'transparent' ? 'absolute w-full bg-transparent' : 'bg-white shadow-sm'}`}>
      {/* Topbar - chỉ hiện khi style = topbar */}
      {showTopbar && (
        <div className="text-xs text-white py-2" style={{ backgroundColor: brandColor }}>
          <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {topbarConfig.hotline && (
                <a href={`tel:${String(topbarConfig.hotline)}`} className="flex items-center gap-1 hover:opacity-80">
                  <Phone size={12} />
                  <span>{String(topbarConfig.hotline)}</span>
                </a>
              )}
              {topbarConfig.email && (
                <a href={`mailto:${String(topbarConfig.email)}`} className="hidden sm:flex items-center gap-1 hover:opacity-80">
                  <Mail size={12} />
                  <span>{String(topbarConfig.email)}</span>
                </a>
              )}
            </div>
            <div className="flex items-center gap-3">
              {topbarConfig.showTrackOrder && <a href="/orders" className="hover:underline hidden sm:inline">Theo dõi đơn hàng</a>}
              <a href="/login" className="hover:underline flex items-center gap-1">
                <User size={12} />
                Đăng nhập
              </a>
            </div>
          </div>
        </div>
      )}
      
      {/* Main Header */}
      <div className={`max-w-7xl mx-auto px-4 ${headerStyle === 'transparent' ? 'text-white' : ''}`}>
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            {logo ? (
              <img src={logo} alt={siteName} className="h-8 w-auto" />
            ) : (
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: brandColor }}
              >
                {(siteName || 'V').charAt(0)}
              </div>
            )}
            <span className={`font-bold text-lg ${headerStyle === 'transparent' ? 'text-white' : 'text-slate-900'}`}>{siteName}</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {menuTree.map((item) => (
              <div
                key={item._id}
                className="relative"
                onMouseEnter={() => setHoveredItem(item._id)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <Link
                  href={item.url}
                  target={item.openInNewTab ? '_blank' : undefined}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-1 ${headerStyle === 'transparent' ? 'text-white/80 hover:text-white' : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'}`}
                  style={hoveredItem === item._id ? { color: brandColor } : {}}
                >
                  {item.label}
                  {item.children.length > 0 && (
                    <ChevronDown 
                      size={14} 
                      className={`transition-transform ${hoveredItem === item._id ? 'rotate-180' : ''}`} 
                    />
                  )}
                </Link>

                {/* Dropdown */}
                {item.children.length > 0 && hoveredItem === item._id && (
                  <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-xl border border-slate-200 py-2 min-w-[200px] z-50">
                    {item.children.map((child) => (
                      <div key={child._id} className="relative group">
                        <Link
                          href={child.url}
                          target={child.openInNewTab ? '_blank' : undefined}
                          className="flex items-center justify-between px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                        >
                          {child.label}
                          {child.children?.length > 0 && <ChevronDown size={14} className="-rotate-90" />}
                        </Link>
                        {/* Sub-dropdown */}
                        {child.children?.length > 0 && (
                          <div className="absolute left-full top-0 ml-1 bg-white rounded-lg shadow-xl border border-slate-200 py-2 min-w-[180px] hidden group-hover:block">
                            {child.children.map((sub) => (
                              <Link
                                key={sub._id}
                                href={sub.url}
                                target={sub.openInNewTab ? '_blank' : undefined}
                                className="block px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                              >
                                {sub.label}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button className="hidden md:flex p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
              <Search size={20} />
            </button>
            <Link 
              href="/contact"
              className="hidden md:inline-flex px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors hover:opacity-90"
              style={{ backgroundColor: brandColor }}
            >
              Liên hệ
            </Link>
            
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white">
          <nav className="max-w-7xl mx-auto px-4 py-4 space-y-1">
            {menuTree.map((item) => (
              <div key={item._id}>
                <div className="flex items-center justify-between">
                  <Link
                    href={item.url}
                    target={item.openInNewTab ? '_blank' : undefined}
                    onClick={() => item.children.length === 0 && setMobileMenuOpen(false)}
                    className="flex-1 px-3 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-lg"
                  >
                    {item.label}
                  </Link>
                  {item.children.length > 0 && (
                    <button
                      onClick={() => toggleMobileItem(item._id)}
                      className="p-2 text-slate-500 hover:text-slate-700"
                    >
                      <ChevronDown 
                        size={16} 
                        className={`transition-transform ${expandedMobileItems.includes(item._id) ? 'rotate-180' : ''}`} 
                      />
                    </button>
                  )}
                </div>
                
                {/* Mobile submenu */}
                {item.children.length > 0 && expandedMobileItems.includes(item._id) && (
                  <div className="ml-4 mt-1 space-y-1 border-l-2 border-slate-200 pl-4">
                    {item.children.map((child) => (
                      <Link
                        key={child._id}
                        href={child.url}
                        target={child.openInNewTab ? '_blank' : undefined}
                        onClick={() => setMobileMenuOpen(false)}
                        className="block px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            
            {/* Mobile CTA */}
            <div className="pt-4 border-t border-slate-200 mt-4">
              <Link
                href="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center px-4 py-2 text-sm font-medium text-white rounded-lg"
                style={{ backgroundColor: brandColor }}
              >
                Liên hệ
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
