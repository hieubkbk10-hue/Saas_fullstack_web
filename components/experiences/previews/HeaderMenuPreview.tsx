'use client';

import React, { useMemo, useState } from 'react';
import type { Id } from '@/convex/_generated/dataModel';
import { ChevronDown, ChevronRight, Eye, Heart, Mail, Phone, Search, ShoppingCart, User } from 'lucide-react';
import { Card, CardContent, cn } from '@/app/admin/components/ui';

export type HeaderLayoutStyle = 'classic' | 'topbar' | 'transparent';

export type HeaderMenuConfig = {
  brandName: string;
  headerBackground: 'white' | 'dots' | 'stripes';
  headerSeparator: 'none' | 'shadow' | 'border' | 'gradient';
  headerSticky: boolean;
  showBrandAccent: boolean;
  cart: { show: boolean };
  cta: { show: boolean; text: string };
  login: { show: boolean; text: string };
  search: { show: boolean; placeholder: string; searchProducts: boolean; searchPosts: boolean };
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
};

export function HeaderMenuPreview({
  brandColor,
  config,
  device,
  layoutStyle,
  menuItems,
  settingsEmail,
  settingsPhone,
}: HeaderMenuPreviewProps) {
  const defaultLinks = useMemo(() => ({
    cart: '/cart',
    wishlist: '/wishlist',
    login: '/login',
    cta: '/contact',
    trackOrder: '/orders/tracking',
    storeSystem: '/stores',
  }), []);

  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedMobileItems, setExpandedMobileItems] = useState<string[]>([]);

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
                  {displayTopbar.showTrackOrder && <a href={defaultLinks.trackOrder} className="hover:underline">Theo dõi đơn hàng</a>}
                  {displayTopbar.showTrackOrder && displayTopbar.showStoreSystem && <span>|</span>}
                  {displayTopbar.showStoreSystem && <a href={defaultLinks.storeSystem} className="hover:underline">Hệ thống cửa hàng</a>}
                  {(displayTopbar.showTrackOrder || displayTopbar.showStoreSystem) && config.login.show && <span>|</span>}
                </>
              )}
              {config.login.show && (
                <a href={defaultLinks.login} className="hover:underline flex items-center gap-1"><User size={12} />{config.login.text}</a>
              )}
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
        ) : (
          renderMobileMenuButton(false)
        )}

        {device !== 'mobile' && config.cta.show && (
          <a href={defaultLinks.cta} className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors hover:opacity-90" style={{ backgroundColor: brandColor }}>
            {config.cta.text}
          </a>
        )}
      </div>

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
                  {displayTopbar.showTrackOrder && <a href={defaultLinks.trackOrder} className="hover:underline">Theo dõi đơn hàng</a>}
                  {displayTopbar.showTrackOrder && displayTopbar.showStoreSystem && <span>|</span>}
                  {displayTopbar.showStoreSystem && <a href={defaultLinks.storeSystem} className="hover:underline">Hệ thống cửa hàng</a>}
                  {(displayTopbar.showTrackOrder || displayTopbar.showStoreSystem) && config.login.show && <span>|</span>}
                </>
              )}
              {config.login.show && (
                <a href={defaultLinks.login} className="hover:underline flex items-center gap-1"><User size={12} />{config.login.text}</a>
              )}
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
                {config.search.show && (<button className="p-2 text-slate-600 dark:text-slate-400"><Search size={20} /></button>)}
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
        </div>
      )}
    </div>
  );

  const renderTransparentStyle = () => (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, ${brandColor}25 0%, transparent 50%), linear-gradient(225deg, ${brandColor}30 0%, transparent 50%), linear-gradient(180deg, #0f172a 0%, #1e293b 100%)`
          }}
        />
        <div className="absolute top-10 left-10 w-72 h-72 rounded-full blur-3xl opacity-30" style={{ backgroundColor: brandColor }} />
        <div className="absolute bottom-10 right-10 w-56 h-56 rounded-full blur-3xl opacity-25" style={{ backgroundColor: brandColor }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl opacity-10" style={{ backgroundColor: brandColor }} />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      <div className="relative z-10 px-6 py-4 flex items-center justify-between bg-black/40 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold shadow-lg" style={{ backgroundColor: brandColor }}>{config.brandName.charAt(0)}</div>
          <span className="font-bold text-lg text-white">{config.brandName}</span>
        </div>

        {device !== 'mobile' ? (
          <>
            <nav className="flex items-center gap-1">
              {menuTree.map((item) => (
                <div key={item._id} className="relative" onMouseEnter={() => setHoveredItem(item._id)} onMouseLeave={() => setHoveredItem(null)}>
                  <a
                    href={item.url}
                    className={cn(
                      'px-4 py-2 text-sm font-medium transition-all flex items-center gap-1 rounded-lg',
                      hoveredItem === item._id
                        ? 'text-white bg-white/20'
                        : 'text-white/90 hover:text-white hover:bg-white/10'
                    )}
                  >
                    {item.label}
                    {item.children.length > 0 && (<ChevronDown size={14} className={cn('transition-transform', hoveredItem === item._id && 'rotate-180')} />)}
                  </a>
                  {item.children.length > 0 && hoveredItem === item._id && (
                    <div className="absolute top-full left-0 mt-2 backdrop-blur-xl bg-black/80 rounded-xl shadow-2xl border border-white/10 py-2 min-w-[200px] z-50">
                      {item.children.map((child) => (<a key={child._id} href={child.url} className="block px-4 py-2.5 text-sm text-white/90 hover:bg-white/10 hover:text-white transition-colors">{child.label}</a>))}
                    </div>
                  )}
                </div>
              ))}
            </nav>
            {config.cta.show && (
              <a href={defaultLinks.cta} className="px-5 py-2 text-sm font-medium text-white rounded-full transition-all hover:scale-105 shadow-lg" style={{ backgroundColor: brandColor }}>{config.cta.text}</a>
            )}
          </>
        ) : (
          renderMobileMenuButton(true)
        )}
      </div>

      {device === 'mobile' && mobileMenuOpen && (
        <div className="relative z-10 backdrop-blur-xl bg-slate-900/95 border-t border-white/10">
          {menuTree.map((item) => (
            <div key={item._id}>
              <button onClick={() => item.children.length > 0 && toggleMobileItem(item._id)} className="w-full px-6 py-4 text-left flex items-center justify-between text-sm font-medium text-white/90 hover:text-white hover:bg-white/5 transition-colors">
                {item.label}
                {item.children.length > 0 && (<ChevronDown size={16} className={cn('transition-transform', expandedMobileItems.includes(item._id) && 'rotate-180')} />)}
              </button>
              {item.children.length > 0 && expandedMobileItems.includes(item._id) && (
                <div className="bg-white/5">
                  {item.children.map((child) => (<a key={child._id} href={child.url} className="block px-8 py-3 text-sm text-white/70 hover:text-white border-l-2 border-white/20 ml-6">{child.label}</a>))}
                </div>
              )}
            </div>
          ))}
          {config.cta.show && (
            <div className="p-4">
              <a href={defaultLinks.cta} className="block w-full py-3 text-sm font-medium text-white rounded-full text-center shadow-lg" style={{ backgroundColor: brandColor }}>{config.cta.text}</a>
            </div>
          )}
        </div>
      )}

      {!mobileMenuOpen && (
        <div className="relative z-10 px-6 py-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium text-white/80 bg-white/10 backdrop-blur-sm mb-6">
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: brandColor }} />
            Hero Section Preview
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
            Welcome to <span style={{ color: brandColor }}>{config.brandName}</span>
          </h2>
          <p className="text-white/60 text-sm max-w-md mx-auto mb-6">
            Header trong suốt overlay trên nội dung. Phù hợp với hero banner, slider hoặc video background.
          </p>
          <div className="flex items-center justify-center gap-3">
            <div className="px-6 py-2.5 rounded-full text-sm font-medium text-white" style={{ backgroundColor: brandColor }}>
              Primary CTA
            </div>
            <div className="px-6 py-2.5 rounded-full text-sm font-medium text-white border border-white/30 hover:bg-white/10 transition-colors cursor-pointer">
              Secondary
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden shadow-sm">
      {layoutStyle === 'classic' && renderClassicStyle()}
      {layoutStyle === 'topbar' && renderTopbarStyle()}
      {layoutStyle === 'transparent' && renderTransparentStyle()}

      {layoutStyle !== 'transparent' && (
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
      )}
    </div>
  );
}
