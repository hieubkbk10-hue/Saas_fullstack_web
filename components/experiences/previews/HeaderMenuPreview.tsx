'use client';

import React, { useMemo, useState } from 'react';
import type { Id } from '@/convex/_generated/dataModel';
import { ChevronDown, ChevronRight, Eye, Heart, LogOut, Mail, Package, Phone, Search, ShoppingCart, User } from 'lucide-react';
import { Card, CardContent, cn } from '@/app/admin/components/ui';

export type HeaderLayoutStyle = 'classic' | 'topbar' | 'allbirds';

export type HeaderMenuConfig = {
  brandName: string;
  headerBackground: 'white' | 'dots' | 'stripes';
  headerSeparator: 'none' | 'shadow' | 'border' | 'gradient';
  headerSticky: boolean;
  showBrandAccent: boolean;
  cart: { show: boolean };
  cta: { show: boolean; text: string };
  login: { show: boolean; text: string };
  search: { show: boolean; placeholder: string; searchProducts: boolean; searchPosts: boolean; searchServices: boolean };
  topbar: {
    email: string;
    hotline: string;
    show: boolean;
    showStoreSystem: boolean;
    showTrackOrder: boolean;
    useSettingsData: boolean;
  };
  wishlist: { show: boolean };
};

type MenuItem = {
  _id: Id<'menuItems'>;
  label: string;
  url: string;
  order: number;
  depth: number;
  active: boolean;
  icon?: string;
  openInNewTab?: boolean;
};

type MenuItemWithChildren = MenuItem & { children: MenuItemWithChildren[] };

export type HeaderMenuPreviewProps = {
  brandColor: string;
  config: HeaderMenuConfig;
  device: 'desktop' | 'tablet' | 'mobile';
  layoutStyle: HeaderLayoutStyle;
  menuItems: MenuItem[];
  settingsEmail?: string;
  settingsPhone?: string;
  customersEnabled: boolean;
  loginFeatureEnabled: boolean;
  ordersEnabled: boolean;
};

export function HeaderMenuPreview({
  brandColor,
  config,
  device,
  layoutStyle,
  menuItems,
  settingsEmail,
  settingsPhone,
  customersEnabled,
  loginFeatureEnabled,
  ordersEnabled,
}: HeaderMenuPreviewProps) {
  const defaultLinks = useMemo(() => ({
    cart: '/cart',
    wishlist: '/wishlist',
    login: '/account/login',
    cta: '/contact',
    trackOrder: '/account/orders',
    storeSystem: '/stores',
    accountProfile: '/account/profile',
    accountOrders: '/account/orders',
  }), []);

  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedMobileItems, setExpandedMobileItems] = useState<string[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const activeItems = useMemo(() => menuItems.filter(item => item.active), [menuItems]);

  const menuTree = useMemo((): MenuItemWithChildren[] => {
    const rootItems = activeItems.filter(item => item.depth === 0);
    return rootItems.map(root => {
      const rootIndex = activeItems.indexOf(root);
      const nextRootIndex = activeItems.findIndex((item, idx) => idx > rootIndex && item.depth === 0);
      const childrenRange = nextRootIndex === -1 ? activeItems.slice(rootIndex + 1) : activeItems.slice(rootIndex + 1, nextRootIndex);

      return {
        ...root,
        children: childrenRange.filter(c => c.depth === 1).map(child => {
          const childIndex = activeItems.indexOf(child);
          const nextChildIndex = childrenRange.findIndex((item) => activeItems.indexOf(item) > childIndex && item.depth <= 1);
          const subRange = nextChildIndex === -1 ? childrenRange.slice(childrenRange.indexOf(child) + 1) : childrenRange.slice(childrenRange.indexOf(child) + 1, nextChildIndex);
          return {
            ...child,
            children: subRange.filter(s => s.depth === 2).map(s => ({ ...s, children: [] }))
          };
        })
      };
    });
  }, [activeItems]);

  const displayTopbar = useMemo(() => {
    if (config.topbar.useSettingsData) {
      return {
        ...config.topbar,
        hotline: settingsPhone || config.topbar.hotline,
        email: settingsEmail || config.topbar.email,
      };
    }
    return config.topbar;
  }, [config.topbar, settingsEmail, settingsPhone]);

  const canLogin = customersEnabled && loginFeatureEnabled;
  const showLogin = config.login.show && canLogin;
  const canTrackOrder = ordersEnabled;
  const showTrackOrder = displayTopbar.showTrackOrder && canTrackOrder;

  const renderUserMenu = (variant: 'text' | 'icon') => (
    <div className="relative">
      <button
        onClick={() => { setUserMenuOpen(prev => !prev); }}
        className={variant === 'text'
          ? 'hover:underline flex items-center gap-1'
          : 'p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}
      >
        <User size={variant === 'text' ? 12 : 18} />
        {variant === 'text' && <span>{config.login.text}</span>}
      </button>
      {userMenuOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white shadow-lg z-50">
          <div className="px-4 py-3 border-b border-slate-100">
            <p className="text-sm font-semibold text-slate-900">Xin chào, Nguyễn Văn A</p>
            <p className="text-xs text-slate-500 mt-1">customer@email.com</p>
          </div>
          <div className="py-2">
            <a
              href={defaultLinks.accountProfile}
              className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              <User size={16} />
              Thông tin tài khoản
            </a>
            <a
              href={defaultLinks.accountOrders}
              className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              <Package size={16} />
              Đơn hàng của tôi
            </a>
            <a
              href={defaultLinks.wishlist}
              className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              <Heart size={16} />
              Danh sách yêu thích
            </a>
          </div>
          <div className="border-t border-slate-100">
            <button
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50"
            >
              <LogOut size={16} />
              Đăng xuất
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const announcementText = useMemo(() => {
    const items = [displayTopbar.hotline, displayTopbar.email].filter(Boolean);
    return items.length > 0 ? items.join(' · ') : 'Shop New Arrivals';
  }, [displayTopbar.email, displayTopbar.hotline]);

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

  const classicPositionClass = config.headerSticky ? 'sticky top-0 z-40' : 'relative z-40';

  const toggleMobileItem = (id: string) => {
    setExpandedMobileItems(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  const renderLink = (item: MenuItem, className: string, children: React.ReactNode) => (
    <a
      href={item.url}
      target={item.openInNewTab ? '_blank' : undefined}
      rel={item.openInNewTab ? 'noreferrer' : undefined}
      className={className}
    >
      {children}
    </a>
  );

  const renderMobileMenuButton = (isTransparent = false) => (
    <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className={cn('p-2 rounded-lg', isTransparent ? 'text-white' : 'text-slate-600')}>
      <div className="w-5 h-4 flex flex-col justify-between">
        <span className={cn('w-full h-0.5 rounded transition-all', mobileMenuOpen && 'rotate-45 translate-y-1.5', isTransparent ? 'bg-white' : 'bg-slate-600')}></span>
        <span className={cn('w-full h-0.5 rounded transition-all', mobileMenuOpen && 'opacity-0', isTransparent ? 'bg-white' : 'bg-slate-600')}></span>
        <span className={cn('w-full h-0.5 rounded transition-all', mobileMenuOpen && '-rotate-45 -translate-y-1.5', isTransparent ? 'bg-white' : 'bg-slate-600')}></span>
      </div>
    </button>
  );

  if (activeItems.length === 0) {
    return (
      <Card className="mt-6">
        <CardContent className="p-8 text-center">
          <Eye className="w-12 h-12 mx-auto mb-4 text-slate-300" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">Chưa có menu items</h3>
          <p className="text-slate-500">Thêm menu items để xem preview</p>
        </CardContent>
      </Card>
    );
  }

  const renderClassicStyle = () => (
    <div className={cn('dark:bg-slate-900', classicSeparatorClass, classicPositionClass)} style={classicBackgroundStyle}>
      {config.topbar.show && (
        <div className="px-4 py-2 text-xs" style={{ backgroundColor: brandColor }}>
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-4">
              {displayTopbar.hotline && (
                <span className="flex items-center gap-1"><Phone size={12} /><span>{displayTopbar.hotline}</span></span>
              )}
              {device !== 'mobile' && displayTopbar.email && (
                <span className="flex items-center gap-1"><Mail size={12} /><span>{displayTopbar.email}</span></span>
              )}
            </div>
            <div className="flex items-center gap-3">
              {device !== 'mobile' && (
                <>
                  {showTrackOrder && <a href={defaultLinks.trackOrder} className="hover:underline">Theo dõi đơn hàng</a>}
                  {showTrackOrder && displayTopbar.showStoreSystem && <span>|</span>}
                  {displayTopbar.showStoreSystem && <a href={defaultLinks.storeSystem} className="hover:underline">Hệ thống cửa hàng</a>}
                  {(showTrackOrder || displayTopbar.showStoreSystem) && showLogin && <span>|</span>}
                </>
              )}
              {showLogin && renderUserMenu('text')}
            </div>
          </div>
        </div>
      )}
      {config.showBrandAccent && (
        <div className="h-0.5" style={{ backgroundColor: brandColor }} />
      )}
      <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: brandColor }}></div>
          <span className="font-semibold text-slate-900 dark:text-white">{config.brandName}</span>
        </div>

        {device !== 'mobile' ? (
          <>
            <nav className="flex items-center gap-1">
              {menuTree.map((item) => (
                <div
                  key={item._id}
                  className="relative"
                  onMouseEnter={() => setHoveredItem(item._id)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <button
                    className={cn(
                      'px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-1',
                      hoveredItem === item._id
                        ? 'text-white'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    )}
                    style={hoveredItem === item._id ? { backgroundColor: brandColor } : {}}
                  >
                    {item.label}
                    {item.children.length > 0 && (
                      <ChevronDown size={14} className={cn('transition-transform', hoveredItem === item._id && 'rotate-180')} />
                    )}
                  </button>

                  {item.children.length > 0 && hoveredItem === item._id && (
                    <div className="absolute top-full left-0 mt-1 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 py-2 min-w-[200px] z-50">
                      {item.children.map((child) => (
                        <div key={child._id} className="relative group">
                          {renderLink(child, 'flex items-center justify-between px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors', (
                            <>
                              {child.label}
                              {child.children?.length > 0 && <ChevronRight size={14} />}
                            </>
                          ))}
                          {child.children?.length > 0 && (
                            <div className="absolute left-full top-0 ml-1 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 py-2 min-w-[180px] hidden group-hover:block">
                              {child.children.map((sub) => (
                                <a key={sub._id} href={sub.url} className="block px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                                  {sub.label}
                                </a>
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
            <div className="flex items-center gap-3">
              {config.search.show && (
                <div className="relative">
                  <input
                    type="text"
                    placeholder={config.search.placeholder}
                    className="w-48 pl-4 pr-10 py-2 rounded-full border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none text-slate-700 dark:text-slate-300"
                  />
                  <button className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-white" style={{ backgroundColor: brandColor }}>
                    <Search size={14} />
                  </button>
                </div>
              )}
              {config.cart.show && (
                <a href={defaultLinks.cart} className="p-2 text-slate-600 dark:text-slate-400 relative">
                  <ShoppingCart size={20} />
                  <span className="absolute -top-1 -right-1 w-5 h-5 text-[10px] font-bold text-white rounded-full flex items-center justify-center" style={{ backgroundColor: brandColor }}>0</span>
                </a>
              )}
              {config.cta.show && (
                <a href={defaultLinks.cta} className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors hover:opacity-90" style={{ backgroundColor: brandColor }}>
                  {config.cta.text}
                </a>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2">
            {config.search.show && (
              <button onClick={() => setSearchOpen((prev) => !prev)} className="p-2 text-slate-600 dark:text-slate-400">
                <Search size={20} />
              </button>
            )}
            {config.cart.show && (
              <a href={defaultLinks.cart} className="p-2 text-slate-600 dark:text-slate-400 relative">
                <ShoppingCart size={20} />
                <span className="absolute -top-1 -right-1 w-5 h-5 text-[10px] font-bold text-white rounded-full flex items-center justify-center" style={{ backgroundColor: brandColor }}>0</span>
              </a>
            )}
            {renderMobileMenuButton(false)}
          </div>
        )}
      </div>

      {device === 'mobile' && config.search.show && searchOpen && (
        <div className="px-6 pb-4 border-b border-slate-100 dark:border-slate-800">
          <input
            type="text"
            placeholder={config.search.placeholder ?? 'Tìm kiếm...'}
            className="w-full px-3 py-2 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-300 focus:outline-none"
          />
        </div>
      )}

      {device === 'mobile' && mobileMenuOpen && (
        <div className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          {menuTree.map((item) => (
            <div key={item._id}>
              <button onClick={() => item.children.length > 0 && toggleMobileItem(item._id)} className="w-full px-6 py-3 text-left flex items-center justify-between text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition-colors">
                {item.label}
                {item.children.length > 0 && (<ChevronDown size={16} className={cn('transition-transform', expandedMobileItems.includes(item._id) && 'rotate-180')} />)}
              </button>
              {item.children.length > 0 && expandedMobileItems.includes(item._id) && (
                <div className="bg-white dark:bg-slate-800">
                  {item.children.map((child) => (
                    <a key={child._id} href={child.url} className="block px-8 py-2.5 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border-l-2 border-slate-200 dark:border-slate-600 ml-6">
                      {child.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
          {config.cta.show && (
            <div className="p-4">
              <a href={defaultLinks.cta} className="block w-full py-2.5 text-sm font-medium text-white rounded-lg text-center" style={{ backgroundColor: brandColor }}>{config.cta.text}</a>
            </div>
          )}
        </div>
      )}
      {classicSeparatorElement}
    </div>
  );

  const renderTopbarStyle = () => (
    <div className={cn('bg-white dark:bg-slate-900', classicPositionClass)}>
      {displayTopbar.show && (
        <div className="px-4 py-2 text-xs" style={{ backgroundColor: brandColor }}>
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-4">
              {displayTopbar.hotline && (
                <span className="flex items-center gap-1"><Phone size={12} /><span>{displayTopbar.hotline}</span></span>
              )}
              {device !== 'mobile' && displayTopbar.email && (
                <span className="flex items-center gap-1"><Mail size={12} /><span>{displayTopbar.email}</span></span>
              )}
            </div>
            <div className="flex items-center gap-3">
              {device !== 'mobile' && (
                <>
                  {showTrackOrder && <a href={defaultLinks.trackOrder} className="hover:underline">Theo dõi đơn hàng</a>}
                  {showTrackOrder && displayTopbar.showStoreSystem && <span>|</span>}
                  {displayTopbar.showStoreSystem && <a href={defaultLinks.storeSystem} className="hover:underline">Hệ thống cửa hàng</a>}
                  {(showTrackOrder || displayTopbar.showStoreSystem) && showLogin && <span>|</span>}
                </>
              )}
              {showLogin && renderUserMenu('text')}
            </div>
          </div>
        </div>
      )}

      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold" style={{ backgroundColor: brandColor }}>{config.brandName.charAt(0)}</div>
            <span className="font-bold text-lg text-slate-900 dark:text-white">{config.brandName}</span>
          </div>

          {device !== 'mobile' && config.search.show && (
            <div className="flex-1 max-w-md">
              <div className="relative">
                <input type="text" placeholder={config.search.placeholder} className="w-full pl-4 pr-10 py-2 rounded-full border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none text-slate-700 dark:text-slate-300" />
                <button className="absolute right-1 top-1/2 -translate-y-1/2 p-2 rounded-full text-white" style={{ backgroundColor: brandColor }}><Search size={14} /></button>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            {device === 'mobile' ? (
              <>
                {config.search.show && (
                  <button onClick={() => setSearchOpen((prev) => !prev)} className="p-2 text-slate-600 dark:text-slate-400">
                    <Search size={20} />
                  </button>
                )}
                {config.cart.show && (
                  <a href={defaultLinks.cart} className="p-2 text-slate-600 dark:text-slate-400 relative">
                    <ShoppingCart size={20} />
                    <span className="absolute -top-1 -right-1 w-5 h-5 text-[10px] font-bold text-white rounded-full flex items-center justify-center" style={{ backgroundColor: brandColor }}>0</span>
                  </a>
                )}
                {renderMobileMenuButton(false)}
              </>
            ) : (
              <>
                {config.wishlist.show && (
                  <a href={defaultLinks.wishlist} className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors flex flex-col items-center text-xs gap-0.5">
                    <Heart size={20} /><span>Yêu thích</span>
                  </a>
                )}
                {config.cart.show && (
                  <a href={defaultLinks.cart} className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors flex flex-col items-center text-xs gap-0.5 relative">
                    <ShoppingCart size={20} /><span>Giỏ hàng</span>
                    <span className="absolute top-0 right-0 w-5 h-5 text-[10px] font-bold text-white rounded-full flex items-center justify-center" style={{ backgroundColor: brandColor }}>0</span>
                  </a>
                )}
                {config.cta.show && (
                  <a href={defaultLinks.cta} className="px-4 py-2 text-sm font-medium text-white rounded-full transition-colors hover:opacity-90" style={{ backgroundColor: brandColor }}>
                    {config.cta.text}
                  </a>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {device !== 'mobile' && (
        <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
          <nav className="flex items-center gap-1">
            {menuTree.map((item) => (
              <div key={item._id} className="relative" onMouseEnter={() => setHoveredItem(item._id)} onMouseLeave={() => setHoveredItem(null)}>
                <a href={item.url} className={cn('px-3 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-1', hoveredItem === item._id ? 'text-white' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700')} style={hoveredItem === item._id ? { backgroundColor: brandColor } : {}}>
                  {item.label}
                  {item.children.length > 0 && <ChevronDown size={14} />}
                </a>
                {item.children.length > 0 && hoveredItem === item._id && (
                  <div className="absolute top-full left-0 mt-1 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 py-2 min-w-[200px] z-50">
                    {item.children.map((child) => (
                      <a key={child._id} href={child.url} className="block px-4 py-2.5 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors">{child.label}</a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>
      )}

      {device === 'mobile' && config.search.show && searchOpen && (
        <div className="px-4 pb-4 border-b border-slate-200 dark:border-slate-700">
          <input
            type="text"
            placeholder={config.search.placeholder ?? 'Tìm kiếm...'}
            className="w-full px-3 py-2 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-300 focus:outline-none"
          />
        </div>
      )}

      {device === 'mobile' && mobileMenuOpen && (
        <div className="border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
          {menuTree.map((item) => (
            <div key={item._id} className="border-b border-slate-100 dark:border-slate-800">
              <button onClick={() => item.children.length > 0 && toggleMobileItem(item._id)} className="w-full px-4 py-3 text-left flex items-center justify-between text-sm font-medium text-slate-700 dark:text-slate-300">
                {item.label}
                {item.children.length > 0 && (<ChevronDown size={16} className={cn('transition-transform', expandedMobileItems.includes(item._id) && 'rotate-180')} />)}
              </button>
              {item.children.length > 0 && expandedMobileItems.includes(item._id) && (
                <div className="bg-slate-50 dark:bg-slate-800/50 pb-2">
                  {item.children.map((child) => (
                    <a key={child._id} href={child.url} className="block px-6 py-2 text-sm text-slate-600 dark:text-slate-400">{child.label}</a>
                  ))}
                </div>
              )}
            </div>
          ))}
          {config.cta.show && (
            <div className="p-4">
              <a href={defaultLinks.cta} className="block w-full py-2.5 text-sm font-medium text-white rounded-lg text-center" style={{ backgroundColor: brandColor }}>
                {config.cta.text}
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderAllbirdsStyle = () => (
    <div className={cn('bg-white dark:bg-slate-900', classicSeparatorClass, classicPositionClass)}>
      {displayTopbar.show && (
        <div className="px-4 py-2 text-[11px] uppercase tracking-[0.3em]" style={{ backgroundColor: brandColor }}>
          <div className="flex items-center justify-center gap-4 text-white">
            <span className="font-medium">{announcementText}</span>
            {device !== 'mobile' && (showTrackOrder || displayTopbar.showStoreSystem) && (
              <span className="flex items-center gap-2 text-[10px] tracking-[0.2em]">
                {showTrackOrder && <a href={defaultLinks.trackOrder} className="hover:underline">Theo dõi đơn</a>}
                {showTrackOrder && displayTopbar.showStoreSystem && <span>|</span>}
                {displayTopbar.showStoreSystem && <a href={defaultLinks.storeSystem} className="hover:underline">Cửa hàng</a>}
              </span>
            )}
          </div>
        </div>
      )}
      {config.showBrandAccent && (
        <div className="h-0.5" style={{ backgroundColor: brandColor }} />
      )}
      <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
        {device !== 'mobile' ? (
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: brandColor }}></div>
              <span className="text-base font-semibold text-slate-900 dark:text-white">{config.brandName}</span>
            </div>
            <nav className="flex items-center gap-6">
              {menuTree.map((item) => {
                const hasSubItems = item.children.some((child) => child.children.length > 0);
                const totalSubItems = item.children.reduce((acc, child) => acc + child.children.length, 0);
                const isMega = item.children.length >= 3 || totalSubItems > 6;
                const isMedium = !isMega && (item.children.length > 1 || hasSubItems);
                const dropdownWidth = isMega ? 'w-[720px]' : isMedium ? 'w-[420px]' : 'w-[240px]';
                const gridCols = isMega
                  ? 'grid-cols-3'
                  : item.children.length > 1
                    ? 'grid-cols-2'
                    : 'grid-cols-1';

                return (
                  <div
                    key={item._id}
                    className="relative"
                    onMouseEnter={() => setHoveredItem(item._id)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    <a
                      href={item.url}
                      className={cn(
                        'text-sm font-medium transition-colors',
                        hoveredItem === item._id ? 'text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                      )}
                    >
                      {item.label}
                    </a>
                    {item.children.length > 0 && hoveredItem === item._id && (
                      <div className={cn('absolute left-1/2 top-full mt-6 -translate-x-1/2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-xl z-50', dropdownWidth)}>
                        <div className={cn('grid gap-6', gridCols)}>
                          {item.children.map((child) => (
                            <div key={child._id} className="space-y-3">
                              <a href={child.url} className="text-sm font-semibold text-slate-900 dark:text-white">
                                {child.label}
                              </a>
                              <div className="space-y-2">
                                {child.children.length > 0 ? (
                                  child.children.map((sub) => (
                                    <a key={sub._id} href={sub.url} className="block text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                                      {sub.label}
                                    </a>
                                  ))
                                ) : (
                                  <a href={child.url} className="text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                                    Xem thêm
                                  </a>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
            <div className="flex items-center gap-3">
              {config.cta.show && (
                <a href={defaultLinks.cta} className="text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                  {config.cta.text}
                </a>
              )}
              {config.search.show && (
                <div className="flex items-center gap-2">
                  <div className={cn('overflow-hidden transition-all duration-200', searchOpen ? 'w-40' : 'w-0')}>
                    <input
                      type="text"
                      placeholder={config.search.placeholder ?? 'Tìm kiếm...'}
                      className={cn(
                        'w-40 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-300 focus:outline-none transition-opacity',
                        searchOpen ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                  </div>
                  <button
                    onClick={() => setSearchOpen((prev) => !prev)}
                    className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  >
                    <Search size={18} />
                  </button>
                </div>
              )}
              {showLogin && renderUserMenu('icon')}
              {config.cart.show && (
                <a href={defaultLinks.cart} className="p-2 text-slate-600 dark:text-slate-400 relative hover:text-slate-900 dark:hover:text-white">
                  <ShoppingCart size={18} />
                  <span className="absolute -top-1 -right-1 w-4 h-4 text-[9px] font-bold text-white rounded-full flex items-center justify-center" style={{ backgroundColor: brandColor }}>0</span>
                </a>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: brandColor }}></div>
              <span className="text-base font-semibold text-slate-900 dark:text-white">{config.brandName}</span>
            </div>
            <div className="flex items-center gap-2">
              {config.search.show && (
                <button onClick={() => setSearchOpen((prev) => !prev)} className="p-2 text-slate-600 dark:text-slate-400">
                  <Search size={18} />
                </button>
              )}
              {config.cart.show && (
                <a href={defaultLinks.cart} className="p-2 text-slate-600 dark:text-slate-400 relative">
                  <ShoppingCart size={18} />
                  <span className="absolute -top-1 -right-1 w-5 h-5 text-[10px] font-bold text-white rounded-full flex items-center justify-center" style={{ backgroundColor: brandColor }}>0</span>
                </a>
              )}
              {renderMobileMenuButton(false)}
            </div>
          </div>
        )}
      </div>

      {device === 'mobile' && config.search.show && searchOpen && (
        <div className="px-6 pb-4">
          <input
            type="text"
            placeholder={config.search.placeholder ?? 'Tìm kiếm...'}
            className="w-full px-3 py-2 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-300 focus:outline-none"
          />
        </div>
      )}

      {device === 'mobile' && mobileMenuOpen && (
        <div className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          {menuTree.map((item) => (
            <div key={item._id}>
              <button onClick={() => item.children.length > 0 && toggleMobileItem(item._id)} className="w-full px-6 py-3 text-left flex items-center justify-between text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition-colors">
                {item.label}
                {item.children.length > 0 && (<ChevronDown size={16} className={cn('transition-transform', expandedMobileItems.includes(item._id) && 'rotate-180')} />)}
              </button>
              {item.children.length > 0 && expandedMobileItems.includes(item._id) && (
                <div className="bg-white dark:bg-slate-800">
                  {item.children.map((child) => (
                    <a key={child._id} href={child.url} className="block px-8 py-2.5 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border-l-2 border-slate-200 dark:border-slate-600 ml-6">
                      {child.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
          {config.cta.show && (
            <div className="p-4">
              <a href={defaultLinks.cta} className="block w-full py-2.5 text-sm font-medium text-white rounded-lg text-center" style={{ backgroundColor: brandColor }}>{config.cta.text}</a>
            </div>
          )}
        </div>
      )}
      {classicSeparatorElement}
    </div>
  );

  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden shadow-sm">
      {layoutStyle === 'classic' && renderClassicStyle()}
      {layoutStyle === 'topbar' && renderTopbarStyle()}
      {layoutStyle === 'allbirds' && renderAllbirdsStyle()}

      <div className="p-4 space-y-3 bg-slate-50 dark:bg-slate-800/50">
        <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center">
          <span className="text-slate-400 text-sm">Content Area</span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="h-20 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
          <div className="h-20 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
          <div className="h-20 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
        </div>
      </div>
    </div>
  );
}
