'use client';

import React, { useCallback, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { useBrandColor, useSiteSettings } from './hooks';
import { ChevronDown, ChevronRight, Heart, Mail, Phone, Search, User } from 'lucide-react';
import { CartIcon } from './CartIcon';

interface MenuItem {
  _id: Id<"menuItems">;
  label: string;
  url: string;
  order: number;
  depth: number;
  active: boolean;
  icon?: string;
  openInNewTab?: boolean;
}

interface MenuItemWithChildren extends MenuItem {
  children: MenuItemWithChildren[];
}

type HeaderStyle = 'classic' | 'topbar' | 'transparent';

interface TopbarConfig {
  show?: boolean;
  hotline?: string;
  email?: string;
  showTrackOrder?: boolean;
  showStoreSystem?: boolean;
  useSettingsData?: boolean;
}

interface SearchConfig {
  show?: boolean;
  placeholder?: string;
  searchProducts?: boolean;
  searchPosts?: boolean;
}

interface HeaderConfig {
  brandName?: string;
  headerBackground?: 'white' | 'dots' | 'stripes';
  headerSeparator?: 'none' | 'shadow' | 'border' | 'gradient';
  headerSticky?: boolean;
  showBrandAccent?: boolean;
  transparentOverlay?: 'dark' | 'light';
  cta?: { show?: boolean; text?: string };
  topbar?: TopbarConfig;
  search?: SearchConfig;
  cart?: { show?: boolean };
  wishlist?: { show?: boolean };
  login?: { show?: boolean; text?: string };
}

const DEFAULT_CONFIG: HeaderConfig = {
  brandName: 'YourBrand',
  headerBackground: 'white',
  headerSeparator: 'none',
  headerSticky: true,
  showBrandAccent: false,
  transparentOverlay: 'dark',
  cart: { show: true },
  cta: { show: true, text: 'Liên hệ' },
  login: { show: true, text: 'Đăng nhập' },
  search: { placeholder: 'Tìm kiếm...', searchPosts: true, searchProducts: true, show: true },
  topbar: {
    email: 'contact@example.com',
    hotline: '1900 1234',
    show: true,
    showStoreSystem: true,
    showTrackOrder: true,
    useSettingsData: false,
  },
  wishlist: { show: true },
};

const DEFAULT_LINKS = {
  cart: '/cart',
  wishlist: '/wishlist',
  login: '/login',
  cta: '/contact',
  trackOrder: '/orders/tracking',
  storeSystem: '/stores',
};

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

export function Header() {
  const brandColor = useBrandColor();
  const { siteName, logo } = useSiteSettings();
  const menuData = useQuery(api.menus.getFullMenu, { location: 'header' });
  const headerStyleSetting = useQuery(api.settings.getByKey, { key: 'header_style' });
  const headerConfigSetting = useQuery(api.settings.getByKey, { key: 'header_config' });
  const contactSettings = useQuery(api.settings.listByGroup, { group: 'contact' });
  const customersModule = useQuery(api.admin.modules.getModuleByKey, { key: 'customers' });
  const ordersModule = useQuery(api.admin.modules.getModuleByKey, { key: 'orders' });
  const customerLoginFeature = useQuery(api.admin.modules.getModuleFeature, { moduleKey: 'customers', featureKey: 'enableLogin' });
  
  const headerStyle: HeaderStyle = (headerStyleSetting?.value as HeaderStyle) || 'classic';
  const savedConfig = (headerConfigSetting?.value as HeaderConfig) || {};
  const config: HeaderConfig = {
    ...DEFAULT_CONFIG,
    ...savedConfig,
    topbar: { ...DEFAULT_CONFIG.topbar, ...savedConfig.topbar },
    search: { ...DEFAULT_CONFIG.search, ...savedConfig.search },
    cta: { ...DEFAULT_CONFIG.cta, ...savedConfig.cta },
    cart: { ...DEFAULT_CONFIG.cart, ...savedConfig.cart },
    wishlist: { ...DEFAULT_CONFIG.wishlist, ...savedConfig.wishlist },
    login: { ...DEFAULT_CONFIG.login, ...savedConfig.login },
  };
  
  // Get contact settings when useSettingsData is enabled
  const settingsPhone = contactSettings?.find(s => s.key === 'contact_phone')?.value as string | undefined;
  const settingsEmail = contactSettings?.find(s => s.key === 'contact_email')?.value as string | undefined;
  
  // Merge topbar data with settings if useSettingsData is enabled
  const topbarConfig = useMemo(() => {
    const base = config.topbar ?? {};
    if (base.useSettingsData) {
      return {
        ...base,
        hotline: settingsPhone ?? base.hotline,
        email: settingsEmail ?? base.email,
      };
    }
    return base;
  }, [config.topbar, settingsPhone, settingsEmail]);

  const canLogin = (customersModule?.enabled ?? false) && (customerLoginFeature?.enabled ?? false);
  const showLogin = Boolean(config.login?.show && canLogin);
  const canTrackOrder = ordersModule?.enabled ?? false;
  const showTrackOrder = Boolean(topbarConfig.showTrackOrder && canTrackOrder);
  
  const displayName = (config.brandName ?? siteName) ?? 'YourBrand';
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [expandedMobileItems, setExpandedMobileItems] = useState<string[]>([]);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMenuEnter = useCallback((itemId: string) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setHoveredItem(itemId);
  }, []);

  const handleMenuLeave = useCallback(() => {
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredItem(null);
    }, 150);
  }, []);

  const menuItems = menuData?.items;
  const brandRgba = (alpha: number) => {
    if (!brandColor.startsWith('#')) {
      return brandColor;
    }

    const hex = brandColor.replace('#', '');
    const normalized = hex.length === 3
      ? hex.split('').map((char) => `${char}${char}`).join('')
      : hex.slice(0, 6);
    const value = Number.parseInt(normalized, 16);
    if (Number.isNaN(value) || normalized.length !== 6) {
      return brandColor;
    }
    const r = (value >> 16) & 255;
    const g = (value >> 8) & 255;
    const b = value & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const classicBackgroundStyle: React.CSSProperties = (() => {
    if (config.headerBackground === 'dots') {
      return {
        backgroundColor: '#ffffff',
        backgroundImage: `radial-gradient(circle, ${brandRgba(0.16)} 1px, transparent 1px)`,
        backgroundSize: '18px 18px',
      };
    }
    if (config.headerBackground === 'stripes') {
      return {
        backgroundColor: '#ffffff',
        backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, ${brandRgba(0.12)} 10px, ${brandRgba(0.12)} 20px)`,
      };
    }
    return { backgroundColor: '#ffffff' };
  })();

  const classicSeparatorClass = config.headerSeparator === 'shadow'
    ? 'shadow-[0_10px_18px_-12px_rgba(15,23,42,0.35)] dark:shadow-[0_10px_18px_-12px_rgba(0,0,0,0.7)]'
    : config.headerSeparator === 'border'
      ? 'border-b border-slate-200 dark:border-slate-700'
      : '';

  const classicSeparatorElement = config.headerSeparator === 'gradient'
    ? (
      <div className="h-3 bg-gradient-to-b from-slate-200/80 to-transparent dark:from-slate-800/80" />
    )
    : null;

  const classicPositionClass = (config.headerSticky ?? true) ? 'sticky top-0 z-50' : 'relative z-50';
  const menuTree = useMemo((): MenuItemWithChildren[] => {
    if (!menuItems) {return [];}
    
    const items = [...menuItems].sort((a, b) => a.order - b.order);
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
  }, [menuItems]);

  const toggleMobileItem = (id: string) => {
    setExpandedMobileItems(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleMobileMenuToggle = useCallback(() => {
    setMobileMenuOpen(prev => !prev);
  }, []);

  if (menuData === undefined) {
    return (
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="h-8 w-32 bg-slate-200 animate-pulse rounded"></div>
        </div>
      </header>
    );
  }

  // Inline mobile menu button renderer
  const renderMobileMenuButton = (isTransparent = false) => (
    <button
      onClick={handleMobileMenuToggle}
      className={cn("p-2 rounded-lg lg:hidden")}
    >
      <div className="w-5 h-4 flex flex-col justify-between">
        <span className={cn("w-full h-0.5 rounded transition-all", mobileMenuOpen && "rotate-45 translate-y-1.5", isTransparent ? "bg-white" : "bg-slate-600")}></span>
        <span className={cn("w-full h-0.5 rounded transition-all", mobileMenuOpen && "opacity-0", isTransparent ? "bg-white" : "bg-slate-600")}></span>
        <span className={cn("w-full h-0.5 rounded transition-all", mobileMenuOpen && "-rotate-45 -translate-y-1.5", isTransparent ? "bg-white" : "bg-slate-600")}></span>
      </div>
    </button>
  );

  // Classic Style
  if (headerStyle === 'classic') {
    return (
      <header className={cn("dark:bg-slate-900", classicSeparatorClass, classicPositionClass)} style={classicBackgroundStyle}>
        {topbarConfig.show !== false && (
          <div className="px-4 py-2 text-xs" style={{ backgroundColor: brandColor }}>
            <div className="max-w-7xl mx-auto flex items-center justify-between text-white">
              <div className="flex items-center gap-4">
                {topbarConfig.hotline && (
                  <a href={`tel:${topbarConfig.hotline}`} className="flex items-center gap-1 hover:opacity-80">
                    <Phone size={12} />
                    <span>{topbarConfig.hotline}</span>
                  </a>
                )}
                {topbarConfig.email && (
                  <a href={`mailto:${topbarConfig.email}`} className="hidden sm:flex items-center gap-1 hover:opacity-80">
                    <Mail size={12} />
                    <span>{topbarConfig.email}</span>
                  </a>
                )}
              </div>
              <div className="flex items-center gap-3">
                {showTrackOrder && (
                  <>
                    <Link href={DEFAULT_LINKS.trackOrder} className="hover:underline hidden sm:inline">Theo dõi đơn hàng</Link>
                    {topbarConfig.showStoreSystem && <span className="hidden sm:inline">|</span>}
                  </>
                )}
                {topbarConfig.showStoreSystem && (
                  <>
                    <Link href={DEFAULT_LINKS.storeSystem} className="hover:underline hidden sm:inline">Hệ thống cửa hàng</Link>
                    {showLogin && <span className="hidden sm:inline">|</span>}
                  </>
                )}
                {showLogin && (
                  <Link href={DEFAULT_LINKS.login} className="hover:underline flex items-center gap-1">
                    <User size={12} />
                    {config.login?.text ?? 'Đăng nhập'}
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
        {config.showBrandAccent && (
          <div className="h-0.5" style={{ backgroundColor: brandColor }} />
        )}
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            {logo ? (
              <Image src={logo} alt={displayName} width={32} height={32} className="h-8 w-auto" />
            ) : (
              <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: brandColor }}></div>
            )}
            <span className="font-semibold text-slate-900 dark:text-white">{displayName}</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {menuTree.map((item) => (
              <div
                key={item._id}
                className="relative"
                onMouseEnter={() =>{  handleMenuEnter(item._id); }}
                onMouseLeave={handleMenuLeave}
              >
                <Link
                  href={item.url}
                  target={item.openInNewTab ? '_blank' : undefined}
                  className={cn(
                    "px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-1",
                    hoveredItem === item._id
                      ? "text-white"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  )}
                  style={hoveredItem === item._id ? { backgroundColor: brandColor } : {}}
                >
                  {item.label}
                  {item.children.length > 0 && (
                    <ChevronDown size={14} className={cn("transition-transform", hoveredItem === item._id && "rotate-180")} />
                  )}
                </Link>

                {item.children.length > 0 && hoveredItem === item._id && (
                  <div className="absolute top-full left-0 pt-2 z-50">
                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 py-2 min-w-[200px]">
                      {item.children.map((child) => (
                        <div key={child._id} className="relative group/child">
                          <Link
                            href={child.url}
                            target={child.openInNewTab ? '_blank' : undefined}
                            className="flex items-center justify-between px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                          >
                            {child.label}
                            {child.children?.length > 0 && <ChevronRight size={14} />}
                          </Link>
                          {child.children?.length > 0 && (
                            <div className="absolute left-full top-0 pl-1 hidden group-hover/child:block">
                              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 py-2 min-w-[180px]">
                                {child.children.map((sub) => (
                                  <Link
                                    key={sub._id}
                                    href={sub.url}
                                    target={sub.openInNewTab ? '_blank' : undefined}
                                    className="block px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                                  >
                                    {sub.label}
                                  </Link>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {config.search?.show && (
              <div className="hidden lg:block relative">
                <input
                  type="text"
                  placeholder={config.search.placeholder ?? 'Tìm kiếm...'}
                  className="w-48 pl-4 pr-10 py-2 rounded-full border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none text-slate-700 dark:text-slate-300"
                />
                <button className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-white" style={{ backgroundColor: brandColor }}>
                  <Search size={14} />
                </button>
              </div>
            )}
            {config.cart?.show && (
              <CartIcon variant="mobile" className="hidden lg:flex" />
            )}
            {config.cta?.show && (
              <Link
                href={DEFAULT_LINKS.cta}
                className="hidden lg:inline-flex px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors hover:opacity-90"
                style={{ backgroundColor: brandColor }}
              >
                {config.cta.text ?? 'Liên hệ'}
              </Link>
            )}
            <div className="flex items-center gap-1 lg:hidden">
              {config.search?.show && (
                <button className="p-2 text-slate-600 dark:text-slate-400">
                  <Search size={20} />
                </button>
              )}
              {config.cart?.show && (
                <CartIcon variant="mobile" />
              )}
              {renderMobileMenuButton(false)}
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
            {menuTree.map((item) => (
              <div key={item._id}>
                <button
                  onClick={() => item.children.length > 0 && toggleMobileItem(item._id)}
                  className="w-full px-6 py-3 text-left flex items-center justify-between text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition-colors"
                >
                  {item.label}
                  {item.children.length > 0 && (
                    <ChevronDown size={16} className={cn("transition-transform", expandedMobileItems.includes(item._id) && "rotate-180")} />
                  )}
                </button>
                {item.children.length > 0 && expandedMobileItems.includes(item._id) && (
                  <div className="bg-white dark:bg-slate-800">
                    {item.children.map((child) => (
                      <Link 
                        key={child._id} 
                        href={child.url}
                        target={child.openInNewTab ? '_blank' : undefined}
                        onClick={() =>{  setMobileMenuOpen(false); }}
                        className="block px-8 py-2.5 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border-l-2 border-slate-200 dark:border-slate-600 ml-6"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {config.cta?.show && (
              <div className="p-4">
              <Link 
                  href={DEFAULT_LINKS.cta} 
                  onClick={() =>{  setMobileMenuOpen(false); }}
                  className="block w-full py-2.5 text-sm font-medium text-white rounded-lg text-center" 
                  style={{ backgroundColor: brandColor }}
                >
                  {config.cta.text ?? 'Liên hệ'}
                </Link>
              </div>
            )}
          </div>
        )}
        {classicSeparatorElement}
      </header>
    );
  }

  // Topbar Style
  if (headerStyle === 'topbar') {
    return (
      <header className={cn('bg-white dark:bg-slate-900', classicPositionClass)}>
        {/* Topbar */}
        {topbarConfig.show !== false && (
          <div className="px-4 py-2 text-xs" style={{ backgroundColor: brandColor }}>
            <div className="max-w-7xl mx-auto flex items-center justify-between text-white">
              <div className="flex items-center gap-4">
                {topbarConfig.hotline && (
                  <a href={`tel:${topbarConfig.hotline}`} className="flex items-center gap-1 hover:opacity-80">
                    <Phone size={12} />
                    <span>{topbarConfig.hotline}</span>
                  </a>
                )}
                {topbarConfig.email && (
                  <a href={`mailto:${topbarConfig.email}`} className="hidden sm:flex items-center gap-1 hover:opacity-80">
                    <Mail size={12} />
                    <span>{topbarConfig.email}</span>
                  </a>
                )}
              </div>
              <div className="flex items-center gap-3">
                {showTrackOrder && (
                  <>
                    <Link href={DEFAULT_LINKS.trackOrder} className="hover:underline hidden sm:inline">Theo dõi đơn hàng</Link>
                    {topbarConfig.showStoreSystem && <span className="hidden sm:inline">|</span>}
                  </>
                )}
                {topbarConfig.showStoreSystem && (
                  <>
                    <Link href={DEFAULT_LINKS.storeSystem} className="hover:underline hidden sm:inline">Hệ thống cửa hàng</Link>
                    {showLogin && <span className="hidden sm:inline">|</span>}
                  </>
                )}
                {showLogin && (
                  <Link href={DEFAULT_LINKS.login} className="hover:underline flex items-center gap-1">
                    <User size={12} />
                    {config.login?.text ?? 'Đăng nhập'}
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Main Header */}
        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 flex-shrink-0">
              {logo ? (
                <Image src={logo} alt={displayName} width={36} height={36} className="h-9 w-auto" />
              ) : (
                <div 
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold" 
                  style={{ backgroundColor: brandColor }}
                >
                  {displayName.charAt(0)}
                </div>
              )}
              <span className="font-bold text-lg text-slate-900 dark:text-white">{displayName}</span>
            </Link>

            {/* Search Bar */}
            {config.search?.show && (
              <div className="hidden md:block flex-1 max-w-md">
                <div className="relative">
                  <input
                    type="text"
                    placeholder={config.search.placeholder ?? 'Tìm kiếm...'}
                    className="w-full pl-4 pr-10 py-2 rounded-full border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none text-slate-700 dark:text-slate-300"
                  />
                  <button 
                    className="absolute right-1 top-1/2 -translate-y-1/2 p-2 rounded-full text-white" 
                    style={{ backgroundColor: brandColor }}
                  >
                    <Search size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Mobile: Search + Cart */}
              <div className="flex lg:hidden items-center gap-1">
                {config.search?.show && (
                  <button className="p-2 text-slate-600 dark:text-slate-400">
                    <Search size={20} />
                  </button>
                )}
                {config.cart?.show && (
                  <CartIcon variant="mobile" />
                )}
                {renderMobileMenuButton(false)}
              </div>

              {/* Desktop: Wishlist + Cart */}
              <div className="hidden lg:flex items-center gap-2">
                {config.wishlist?.show && (
                  <Link href={DEFAULT_LINKS.wishlist} className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors flex flex-col items-center text-xs gap-0.5">
                    <Heart size={20} />
                    <span>Yêu thích</span>
                  </Link>
                )}
                {config.cart?.show && (
                  <CartIcon />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Bar */}
        <div className="hidden lg:block px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
          <nav className="max-w-7xl mx-auto flex items-center gap-1">
            {menuTree.map((item) => (
              <div
                key={item._id}
                className="relative"
                onMouseEnter={() =>{  handleMenuEnter(item._id); }}
                onMouseLeave={handleMenuLeave}
              >
                <Link
                  href={item.url}
                  target={item.openInNewTab ? '_blank' : undefined}
                  className={cn(
                    "px-3 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-1",
                    hoveredItem === item._id
                      ? "text-white"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                  )}
                  style={hoveredItem === item._id ? { backgroundColor: brandColor } : {}}
                >
                  {item.label}
                  {item.children.length > 0 && <ChevronDown size={14} />}
                </Link>

                {item.children.length > 0 && hoveredItem === item._id && (
                  <div className="absolute top-full left-0 pt-2 z-50">
                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 py-2 min-w-[200px]">
                      {item.children.map((child) => (
                        <Link 
                          key={child._id} 
                          href={child.url}
                          target={child.openInNewTab ? '_blank' : undefined}
                          className="block px-4 py-2.5 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
            {menuTree.map((item) => (
              <div key={item._id} className="border-b border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => item.children.length > 0 && toggleMobileItem(item._id)}
                  className="w-full px-4 py-3 text-left flex items-center justify-between text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  {item.label}
                  {item.children.length > 0 && (
                    <ChevronDown size={16} className={cn("transition-transform", expandedMobileItems.includes(item._id) && "rotate-180")} />
                  )}
                </button>
                {item.children.length > 0 && expandedMobileItems.includes(item._id) && (
                  <div className="bg-slate-50 dark:bg-slate-800/50 pb-2">
                    {item.children.map((child) => (
                      <Link 
                        key={child._id} 
                        href={child.url}
                        target={child.openInNewTab ? '_blank' : undefined}
                        onClick={() =>{  setMobileMenuOpen(false); }}
                        className="block px-6 py-2 text-sm text-slate-600 dark:text-slate-400"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </header>
    );
  }

  // Transparent Style - header với nền mờ, không có hero (hero do HomeComponents render)
  return (
    <header className="absolute top-0 left-0 right-0 z-50">
      {topbarConfig.show !== false && (
        <div className="px-4 py-2 text-xs" style={{ backgroundColor: brandColor }}>
          <div className="max-w-7xl mx-auto flex items-center justify-between text-white">
            <div className="flex items-center gap-4">
              {topbarConfig.hotline && (
                <a href={`tel:${topbarConfig.hotline}`} className="flex items-center gap-1 hover:opacity-80">
                  <Phone size={12} />
                  <span>{topbarConfig.hotline}</span>
                </a>
              )}
              {topbarConfig.email && (
                <a href={`mailto:${topbarConfig.email}`} className="hidden sm:flex items-center gap-1 hover:opacity-80">
                  <Mail size={12} />
                  <span>{topbarConfig.email}</span>
                </a>
              )}
            </div>
            <div className="flex items-center gap-3">
              {showTrackOrder && (
                <>
                  <Link href={DEFAULT_LINKS.trackOrder} className="hover:underline hidden sm:inline">Theo dõi đơn hàng</Link>
                  {topbarConfig.showStoreSystem && <span className="hidden sm:inline">|</span>}
                </>
              )}
              {topbarConfig.showStoreSystem && (
                <>
                  <Link href={DEFAULT_LINKS.storeSystem} className="hover:underline hidden sm:inline">Hệ thống cửa hàng</Link>
                  {showLogin && <span className="hidden sm:inline">|</span>}
                </>
              )}
              {showLogin && (
                <Link href={DEFAULT_LINKS.login} className="hover:underline flex items-center gap-1">
                  <User size={12} />
                  {config.login?.text ?? 'Đăng nhập'}
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Header bar với lớp phủ nền mờ */}
      <div className={cn('backdrop-blur-md', config.transparentOverlay === 'light' ? 'bg-white/40' : 'bg-black/40')}>
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            {logo ? (
              <Image src={logo} alt={displayName} width={36} height={36} className="h-9 w-auto" />
            ) : (
              <div 
                className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold shadow-lg" 
                style={{ backgroundColor: brandColor }}
              >
                {displayName.charAt(0)}
              </div>
            )}
            <span className={cn('font-bold text-lg', config.transparentOverlay === 'light' ? 'text-slate-900' : 'text-white')}>{displayName}</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {menuTree.map((item) => (
              <div
                key={item._id}
                className="relative"
                onMouseEnter={() =>{  handleMenuEnter(item._id); }}
                onMouseLeave={handleMenuLeave}
              >
                <Link
                  href={item.url}
                  target={item.openInNewTab ? '_blank' : undefined}
                  className={cn(
                    "px-4 py-2 text-sm font-medium transition-all flex items-center gap-1 rounded-lg",
                    hoveredItem === item._id 
                      ? (config.transparentOverlay === 'light' ? 'text-slate-900 bg-black/10' : 'text-white bg-white/20')
                      : (config.transparentOverlay === 'light' ? 'text-slate-800/90 hover:text-slate-900 hover:bg-black/5' : 'text-white/90 hover:text-white hover:bg-white/10')
                  )}
                >
                  {item.label}
                  {item.children.length > 0 && (
                    <ChevronDown size={14} className={cn("transition-transform", hoveredItem === item._id && "rotate-180")} />
                  )}
                </Link>

                {item.children.length > 0 && hoveredItem === item._id && (
                  <div className="absolute top-full left-0 pt-2 z-50">
                    <div className={cn('backdrop-blur-xl rounded-xl shadow-2xl py-2 min-w-[200px]', config.transparentOverlay === 'light' ? 'bg-white/90 border border-slate-200' : 'bg-black/80 border border-white/10')}>
                      {item.children.map((child) => (
                        <Link
                          key={child._id}
                          href={child.url}
                          target={child.openInNewTab ? '_blank' : undefined}
                          className={cn('block px-4 py-2.5 text-sm transition-colors', config.transparentOverlay === 'light' ? 'text-slate-700 hover:bg-slate-100 hover:text-slate-900' : 'text-white/90 hover:bg-white/10 hover:text-white')}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* CTA + Mobile Button */}
          <div className="flex items-center gap-2">
            {config.search?.show && (
              <div className="hidden lg:block relative">
                <input
                  type="text"
                  placeholder={config.search.placeholder ?? 'Tìm kiếm...'}
                  className={cn(
                    'w-40 pl-4 pr-10 py-2 rounded-full border text-sm focus:outline-none',
                    config.transparentOverlay === 'light'
                      ? 'border-slate-200 bg-white/70 text-slate-700'
                      : 'border-white/20 bg-white/10 text-white placeholder:text-white/70'
                  )}
                />
                <button className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-white" style={{ backgroundColor: brandColor }}>
                  <Search size={14} />
                </button>
              </div>
            )}
            {config.wishlist?.show && (
              <Link
                href={DEFAULT_LINKS.wishlist}
                className={cn('hidden lg:inline-flex p-2 rounded-full transition-colors', config.transparentOverlay === 'light' ? 'text-slate-700 hover:text-slate-900' : 'text-white/80 hover:text-white')}
              >
                <Heart size={18} />
              </Link>
            )}
            {config.cart?.show && (
              <CartIcon className={cn('hidden lg:flex', config.transparentOverlay === 'light' ? 'text-slate-700 hover:text-slate-900' : 'text-white/80 hover:text-white')} />
            )}
            {config.cta?.show && (
              <Link
                href={DEFAULT_LINKS.cta}
                className="hidden lg:inline-flex px-5 py-2 text-sm font-medium text-white rounded-full transition-all hover:scale-105 shadow-lg"
                style={{ backgroundColor: brandColor }}
              >
                {config.cta.text ?? 'Liên hệ'}
              </Link>
            )}
            <div className="flex items-center gap-1 lg:hidden">
              {config.search?.show && (
                <button className={cn('p-2', config.transparentOverlay === 'light' ? 'text-slate-700' : 'text-white/80')}>
                  <Search size={20} />
                </button>
              )}
              {config.cart?.show && (
                <CartIcon variant="mobile" className={cn(config.transparentOverlay === 'light' ? 'text-slate-700' : 'text-white/80')} />
              )}
              {renderMobileMenuButton(true)}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className={cn('lg:hidden backdrop-blur-xl border-t', config.transparentOverlay === 'light' ? 'bg-white/90 border-slate-200' : 'bg-black/80 border-white/10')}>
          {menuTree.map((item) => (
            <div key={item._id}>
              <button
                onClick={() => item.children.length > 0 && toggleMobileItem(item._id)}
                className={cn('w-full px-6 py-4 text-left flex items-center justify-between text-sm font-medium transition-colors', config.transparentOverlay === 'light' ? 'text-slate-700 hover:text-slate-900 hover:bg-slate-100' : 'text-white/90 hover:text-white hover:bg-white/10')}
              >
                {item.label}
                {item.children.length > 0 && (
                  <ChevronDown size={16} className={cn("transition-transform", expandedMobileItems.includes(item._id) && "rotate-180")} />
                )}
              </button>
              {item.children.length > 0 && expandedMobileItems.includes(item._id) && (
                <div className={cn(config.transparentOverlay === 'light' ? 'bg-slate-50' : 'bg-white/5')}>
                  {item.children.map((child) => (
                    <Link 
                      key={child._id} 
                      href={child.url}
                      target={child.openInNewTab ? '_blank' : undefined}
                      onClick={() =>{  setMobileMenuOpen(false); }}
                      className={cn('block px-8 py-3 text-sm border-l-2 ml-6', config.transparentOverlay === 'light' ? 'text-slate-600 hover:text-slate-900 border-slate-200' : 'text-white/70 hover:text-white border-white/20')}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
          {config.cta?.show && (
            <div className="p-4">
              <Link 
                href={DEFAULT_LINKS.cta} 
                onClick={() =>{  setMobileMenuOpen(false); }}
                className="block w-full py-3 text-sm font-medium text-white rounded-full text-center" 
                style={{ backgroundColor: brandColor }}
              >
                {config.cta.text ?? 'Liên hệ'}
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
