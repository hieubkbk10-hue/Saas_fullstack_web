'use client';

import React, { useEffect, useMemo, useState } from 'react';
import type { Id } from '@/convex/_generated/dataModel';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { toast } from 'sonner';
import { 
  Button, Card, CardContent, CardHeader, CardTitle, Input, Label, cn
} from '../components/ui';
import { 
  Check, ChevronDown as ChevronDownIcon, ChevronRight, Database, Eye, Heart, HelpCircle, Link as LinkIcon, 
  Mail, Monitor, Phone, Save, Search, Settings,
  ShoppingCart, Smartphone, Tablet, User
} from 'lucide-react';

const DEFAULT_BRAND_COLOR = '#f97316';

type MenuPreviewDevice = 'desktop' | 'tablet' | 'mobile';
type MenuPreviewStyle = 'classic' | 'topbar' | 'transparent';

interface MenuItem {
  _id: Id<"menuItems">;
  label: string;
  url: string;
  order: number;
  depth: number;
  active: boolean;
}

interface MenuItemWithChildren extends MenuItem {
  children: MenuItemWithChildren[];
}

interface MenuPreviewProps {
  items: MenuItem[];
}

interface TopbarConfig {
  show: boolean;
  hotline: string;
  email: string;
  showTrackOrder: boolean;
  trackOrderUrl: string;
  showStoreSystem: boolean;
  storeSystemUrl: string;
  useSettingsData: boolean;
}

interface SearchConfig {
  show: boolean;
  placeholder: string;
  searchProducts: boolean;
  searchPosts: boolean;
}

interface HeaderConfig {
  brandName: string;
  cta: { show: boolean; text: string; url: string };
  topbar: TopbarConfig;
  search: SearchConfig;
  cart: { show: boolean; url: string };
  wishlist: { show: boolean; url: string };
  login: { show: boolean; url: string; text: string };
}

const DEFAULT_CONFIG: HeaderConfig = {
  brandName: 'YourBrand',
  cart: { show: true, url: '/cart' },
  cta: { show: true, text: 'Liên hệ', url: '/contact' },
  login: { show: true, text: 'Đăng nhập', url: '/login' },
  search: { 
    placeholder: 'Tìm kiếm...', 
    searchPosts: true, 
    searchProducts: true,
    show: true,
  },
  topbar: {
    email: 'contact@example.com',
    hotline: '1900 1234',
    show: true,
    showStoreSystem: true,
    showTrackOrder: true,
    storeSystemUrl: '/stores',
    trackOrderUrl: '/orders/tracking',
    useSettingsData: false,
  },
  wishlist: { show: true, url: '/wishlist' },
};

export function MenuPreview({ items }: MenuPreviewProps) {
  const setting = useQuery(api.settings.getByKey, { key: 'site_brand_color' });
  const headerStyleSetting = useQuery(api.settings.getByKey, { key: 'header_style' });
  const headerConfigSetting = useQuery(api.settings.getByKey, { key: 'header_config' });
  const setSetting = useMutation(api.settings.set);
  
  // Site settings for "useSettingsData" option
  const siteSettings = useQuery(api.settings.listByGroup, { group: 'contact' });
  
  // Check enabled modules
  const modulesData = useQuery(api.admin.modules.listModules);
  const enabledModules = useMemo(() => {
    const modules: Record<string, boolean> = {};
    modulesData?.forEach(m => { modules[m.key] = m.enabled; });
    return modules;
  }, [modulesData]);
  
  const brandColor = (setting === undefined || setting === null) 
    ? DEFAULT_BRAND_COLOR 
    : ((setting.value as string) || DEFAULT_BRAND_COLOR);
    
  const [device, setDevice] = useState<MenuPreviewDevice>('desktop');
  const [previewStyle, setPreviewStyle] = useState<MenuPreviewStyle>('classic');
  const [isSaving, setIsSaving] = useState(false);
  const [savedStyle, setSavedStyle] = useState<string | null>(null);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedMobileItems, setExpandedMobileItems] = useState<string[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [config, setConfig] = useState<HeaderConfig>(DEFAULT_CONFIG);
  
  // Load saved config from settings
  useEffect(() => {
    if (headerStyleSetting?.value) {
      setPreviewStyle(headerStyleSetting.value as MenuPreviewStyle);
      setSavedStyle(headerStyleSetting.value as string);
    }
    if (headerConfigSetting?.value) {
      const savedConfig = headerConfigSetting.value as Partial<HeaderConfig>;
      // Deep merge to preserve default values for nested objects
      setConfig(prev => ({
        ...prev,
        ...savedConfig,
        topbar: { ...prev.topbar, ...savedConfig.topbar },
        search: { ...prev.search, ...savedConfig.search },
        cta: { ...prev.cta, ...savedConfig.cta },
        cart: { ...prev.cart, ...savedConfig.cart },
        wishlist: { ...prev.wishlist, ...savedConfig.wishlist },
        login: { ...prev.login, ...savedConfig.login },
      }));
    }
  }, [headerStyleSetting, headerConfigSetting]);

  // Get settings data for topbar when useSettingsData is enabled
  const settingsPhone = siteSettings?.find(s => s.key === 'contact_phone')?.value as string;
  const settingsEmail = siteSettings?.find(s => s.key === 'contact_email')?.value as string;
  
  const displayTopbar = useMemo(() => {
    if (config.topbar.useSettingsData) {
      return {
        ...config.topbar,
        hotline: settingsPhone || config.topbar.hotline,
        email: settingsEmail || config.topbar.email,
      };
    }
    return config.topbar;
  }, [config.topbar, settingsPhone, settingsEmail]);

  const devices = [
    { icon: Monitor, id: 'desktop' as const, label: 'Desktop' },
    { icon: Tablet, id: 'tablet' as const, label: 'Tablet' },
    { icon: Smartphone, id: 'mobile' as const, label: 'Mobile' }
  ];

  const styles = [
    { id: 'classic' as const, label: 'Classic' },
    { id: 'topbar' as const, label: 'With Topbar' },
    { id: 'transparent' as const, label: 'Transparent' }
  ];

  const deviceWidths = {
    desktop: 'w-full',
    mobile: 'w-[375px] max-w-full',
    tablet: 'w-[768px] max-w-full'
  };

  const activeItems = useMemo(() => items.filter(i => i.active), [items]);

  const handleApplyToSite = async () => {
    setIsSaving(true);
    try {
      await setSetting({ group: 'site', key: 'header_style', value: previewStyle });
      await setSetting({ group: 'site', key: 'header_config', value: config });
      setSavedStyle(previewStyle);
      toast.success('Đã áp dụng style cho trang chủ');
    } catch {
      toast.error('Lỗi khi lưu cấu hình');
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges = previewStyle !== savedStyle;

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

  const toggleMobileItem = (id: string) => {
    setExpandedMobileItems(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  // ===================== RENDER STYLES =====================

  const renderClassicStyle = () => (
    <div className="bg-white dark:bg-slate-900">
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
                onMouseEnter={() =>{  setHoveredItem(item._id); }}
                onMouseLeave={() =>{  setHoveredItem(null); }}
              >
                <button
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
                    <ChevronDownIcon size={14} className={cn("transition-transform", hoveredItem === item._id && "rotate-180")} />
                  )}
                </button>

                {item.children.length > 0 && hoveredItem === item._id && (
                  <div className="absolute top-full left-0 mt-1 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 py-2 min-w-[200px] z-50">
                    {item.children.map((child) => (
                      <div key={child._id} className="relative group">
                        <a href={child.url} className="flex items-center justify-between px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                          {child.label}
                          {child.children?.length > 0 && <ChevronRight size={14} />}
                        </a>
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
          <button onClick={() =>{  setMobileMenuOpen(!mobileMenuOpen); }} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
            <div className="w-5 h-4 flex flex-col justify-between">
              <span className={cn("w-full h-0.5 bg-slate-600 rounded transition-all", mobileMenuOpen && "rotate-45 translate-y-1.5")}></span>
              <span className={cn("w-full h-0.5 bg-slate-600 rounded transition-all", mobileMenuOpen && "opacity-0")}></span>
              <span className={cn("w-full h-0.5 bg-slate-600 rounded transition-all", mobileMenuOpen && "-rotate-45 -translate-y-1.5")}></span>
            </div>
          </button>
        )}

        {device !== 'mobile' && config.cta.show && (
          <a href={config.cta.url} className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors hover:opacity-90" style={{ backgroundColor: brandColor }}>
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
                {item.children.length > 0 && (<ChevronDownIcon size={16} className={cn("transition-transform", expandedMobileItems.includes(item._id) && "rotate-180")} />)}
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
              <a href={config.cta.url} className="block w-full py-2.5 text-sm font-medium text-white rounded-lg text-center" style={{ backgroundColor: brandColor }}>{config.cta.text}</a>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderTopbarStyle = () => (
    <div className="bg-white dark:bg-slate-900">
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
                  {displayTopbar.showTrackOrder && <a href={displayTopbar.trackOrderUrl} className="hover:underline">Theo dõi đơn hàng</a>}
                  {displayTopbar.showTrackOrder && displayTopbar.showStoreSystem && <span>|</span>}
                  {displayTopbar.showStoreSystem && <a href={displayTopbar.storeSystemUrl} className="hover:underline">Hệ thống cửa hàng</a>}
                  {(displayTopbar.showTrackOrder || displayTopbar.showStoreSystem) && config.login.show && <span>|</span>}
                </>
              )}
              {config.login.show && (
                <a href={config.login.url} className="hover:underline flex items-center gap-1"><User size={12} />{config.login.text}</a>
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
                  <a href={config.cart.url} className="p-2 text-slate-600 dark:text-slate-400 relative">
                    <ShoppingCart size={20} />
                    <span className="absolute -top-1 -right-1 w-5 h-5 text-[10px] font-bold text-white rounded-full flex items-center justify-center" style={{ backgroundColor: brandColor }}>0</span>
                  </a>
                )}
                <button onClick={() =>{  setMobileMenuOpen(!mobileMenuOpen); }} className="p-2">
                  <div className="w-5 h-4 flex flex-col justify-between">
                    <span className={cn("w-full h-0.5 bg-slate-600 rounded transition-all", mobileMenuOpen && "rotate-45 translate-y-1.5")}></span>
                    <span className={cn("w-full h-0.5 bg-slate-600 rounded transition-all", mobileMenuOpen && "opacity-0")}></span>
                    <span className={cn("w-full h-0.5 bg-slate-600 rounded transition-all", mobileMenuOpen && "-rotate-45 -translate-y-1.5")}></span>
                  </div>
                </button>
              </>
            ) : (
              <>
                {config.wishlist.show && (
                  <a href={config.wishlist.url} className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors flex flex-col items-center text-xs gap-0.5">
                    <Heart size={20} /><span>Yêu thích</span>
                  </a>
                )}
                {config.cart.show && (
                  <a href={config.cart.url} className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors flex flex-col items-center text-xs gap-0.5 relative">
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
              <div key={item._id} className="relative" onMouseEnter={() =>{  setHoveredItem(item._id); }} onMouseLeave={() =>{  setHoveredItem(null); }}>
                <a href={item.url} className={cn("px-3 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-1", hoveredItem === item._id ? "text-white" : "text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700")} style={hoveredItem === item._id ? { backgroundColor: brandColor } : {}}>
                  {item.label}
                  {item.children.length > 0 && <ChevronDownIcon size={14} />}
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
                {item.children.length > 0 && (<ChevronDownIcon size={16} className={cn("transition-transform", expandedMobileItems.includes(item._id) && "rotate-180")} />)}
              </button>
              {item.children.length > 0 && expandedMobileItems.includes(item._id) && (
                <div className="bg-slate-50 dark:bg-slate-800/50 pb-2">
                  {item.children.map((child) => (<a key={child._id} href={child.url} className="block px-6 py-2 text-sm text-slate-600 dark:text-slate-400">{child.label}</a>))}
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
      {/* Hero Background - Modern gradient with mesh */}
      <div className="absolute inset-0">
        <div 
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, ${brandColor}25 0%, transparent 50%), linear-gradient(225deg, ${brandColor}30 0%, transparent 50%), linear-gradient(180deg, #0f172a 0%, #1e293b 100%)`
          }}
        />
        {/* Decorative blobs */}
        <div className="absolute top-10 left-10 w-72 h-72 rounded-full blur-3xl opacity-30" style={{ backgroundColor: brandColor }} />
        <div className="absolute bottom-10 right-10 w-56 h-56 rounded-full blur-3xl opacity-25" style={{ backgroundColor: brandColor }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl opacity-10" style={{ backgroundColor: brandColor }} />
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>
      
      {/* Header with semi-transparent overlay */}
      <div className="relative z-10 px-6 py-4 flex items-center justify-between bg-black/40 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold shadow-lg" style={{ backgroundColor: brandColor }}>{config.brandName.charAt(0)}</div>
          <span className="font-bold text-lg text-white">{config.brandName}</span>
        </div>

        {device !== 'mobile' ? (
          <>
            <nav className="flex items-center gap-1">
              {menuTree.map((item) => (
                <div key={item._id} className="relative" onMouseEnter={() =>{  setHoveredItem(item._id); }} onMouseLeave={() =>{  setHoveredItem(null); }}>
                  <a 
                    href={item.url} 
                    className={cn(
                      "px-4 py-2 text-sm font-medium transition-all flex items-center gap-1 rounded-lg",
                      hoveredItem === item._id 
                        ? "text-white bg-white/20" 
                        : "text-white/90 hover:text-white hover:bg-white/10"
                    )}
                  >
                    {item.label}
                    {item.children.length > 0 && (<ChevronDownIcon size={14} className={cn("transition-transform", hoveredItem === item._id && "rotate-180")} />)}
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
              <a href={config.cta.url} className="px-5 py-2 text-sm font-medium text-white rounded-full transition-all hover:scale-105 shadow-lg" style={{ backgroundColor: brandColor }}>{config.cta.text}</a>
            )}
          </>
        ) : (
          <button onClick={() =>{  setMobileMenuOpen(!mobileMenuOpen); }} className="p-2 text-white">
            <div className="w-5 h-4 flex flex-col justify-between">
              <span className={cn("w-full h-0.5 bg-white rounded transition-all", mobileMenuOpen && "rotate-45 translate-y-1.5")}></span>
              <span className={cn("w-full h-0.5 bg-white rounded transition-all", mobileMenuOpen && "opacity-0")}></span>
              <span className={cn("w-full h-0.5 bg-white rounded transition-all", mobileMenuOpen && "-rotate-45 -translate-y-1.5")}></span>
            </div>
          </button>
        )}
      </div>

      {/* Mobile Menu */}
      {device === 'mobile' && mobileMenuOpen && (
        <div className="relative z-10 backdrop-blur-xl bg-slate-900/95 border-t border-white/10">
          {menuTree.map((item) => (
            <div key={item._id}>
              <button onClick={() => item.children.length > 0 && toggleMobileItem(item._id)} className="w-full px-6 py-4 text-left flex items-center justify-between text-sm font-medium text-white/90 hover:text-white hover:bg-white/5 transition-colors">
                {item.label}
                {item.children.length > 0 && (<ChevronDownIcon size={16} className={cn("transition-transform", expandedMobileItems.includes(item._id) && "rotate-180")} />)}
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
              <a href={config.cta.url} className="block w-full py-3 text-sm font-medium text-white rounded-full text-center shadow-lg" style={{ backgroundColor: brandColor }}>{config.cta.text}</a>
            </div>
          )}
        </div>
      )}
      
      {/* Hero Content Preview */}
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

  // ===================== SETTINGS FORM =====================

  const renderSettingsForm = () => (
    <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 space-y-5">
      {/* Basic Settings */}
      <div>
        <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
          <Settings size={14} /> Cài đặt chung
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Tên thương hiệu</Label>
            <Input value={config.brandName} onChange={(e) =>{  setConfig({ ...config, brandName: e.target.value }); }} placeholder="YourBrand" className="h-8 text-sm" />
          </div>
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-xs font-medium">
              <input type="checkbox" checked={config.cta.show} onChange={(e) =>{  setConfig({ ...config, cta: { ...config.cta, show: e.target.checked } }); }} className="w-3.5 h-3.5 rounded" />
              Nút CTA
            </label>
            {config.cta.show && <Input value={config.cta.text} onChange={(e) =>{  setConfig({ ...config, cta: { ...config.cta, text: e.target.value } }); }} placeholder="Liên hệ" className="h-8 text-sm" />}
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">URL CTA</Label>
            <Input value={config.cta.url} onChange={(e) =>{  setConfig({ ...config, cta: { ...config.cta, url: e.target.value } }); }} placeholder="/contact" className="h-8 text-sm" disabled={!config.cta.show} />
          </div>
        </div>
      </div>

      {/* Topbar Settings - Only show when Topbar style */}
      {previewStyle === 'topbar' && (
        <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
          <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
            <span className="px-1.5 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded text-[10px]">With Topbar</span>
            Cấu hình Topbar
          </h4>
          
          {/* Use Settings Data Toggle */}
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800/50">
            <label className="flex items-center gap-2 text-xs font-medium text-blue-700 dark:text-blue-400">
              <input type="checkbox" checked={config.topbar.useSettingsData} onChange={(e) =>{  setConfig({ ...config, topbar: { ...config.topbar, useSettingsData: e.target.checked } }); }} className="w-3.5 h-3.5 rounded" />
              <Database size={14} />
              Dùng dữ liệu từ /admin/settings (SĐT, Email từ tab Liên hệ)
            </label>
            {config.topbar.useSettingsData && (
              <p className="mt-2 text-[10px] text-blue-600 dark:text-blue-400">
                SĐT: {settingsPhone || '(chưa cấu hình)'} • Email: {settingsEmail || '(chưa cấu hình)'}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-xs font-medium">
                <input type="checkbox" checked={config.topbar.show} onChange={(e) =>{  setConfig({ ...config, topbar: { ...config.topbar, show: e.target.checked } }); }} className="w-3.5 h-3.5 rounded" />
                Hiển thị Topbar
              </label>
              
              {!config.topbar.useSettingsData && (
                <>
                  <div className="space-y-1.5">
                    <Label className="text-xs flex items-center gap-1"><Phone size={12} /> Hotline</Label>
                    <Input value={config.topbar.hotline} onChange={(e) =>{  setConfig({ ...config, topbar: { ...config.topbar, hotline: e.target.value } }); }} placeholder="1900 1234" className="h-8 text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs flex items-center gap-1"><Mail size={12} /> Email</Label>
                    <Input value={config.topbar.email} onChange={(e) =>{  setConfig({ ...config, topbar: { ...config.topbar, email: e.target.value } }); }} placeholder="contact@example.com" className="h-8 text-sm" />
                  </div>
                </>
              )}
            </div>
            
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-xs font-medium">
                  <input type="checkbox" checked={config.topbar.showTrackOrder} onChange={(e) =>{  setConfig({ ...config, topbar: { ...config.topbar, showTrackOrder: e.target.checked } }); }} className="w-3.5 h-3.5 rounded" />
                  Theo dõi đơn hàng
                </label>
                {config.topbar.showTrackOrder && (
                  <Input value={config.topbar.trackOrderUrl} onChange={(e) =>{  setConfig({ ...config, topbar: { ...config.topbar, trackOrderUrl: e.target.value } }); }} placeholder="/orders/tracking" className="h-8 text-sm" />
                )}
              </div>
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-xs font-medium">
                  <input type="checkbox" checked={config.topbar.showStoreSystem} onChange={(e) =>{  setConfig({ ...config, topbar: { ...config.topbar, showStoreSystem: e.target.checked } }); }} className="w-3.5 h-3.5 rounded" />
                  Hệ thống cửa hàng
                </label>
                {config.topbar.showStoreSystem && (
                  <Input value={config.topbar.storeSystemUrl} onChange={(e) =>{  setConfig({ ...config, topbar: { ...config.topbar, storeSystemUrl: e.target.value } }); }} placeholder="/stores" className="h-8 text-sm" />
                )}
              </div>
            </div>
          </div>

          {/* Search Settings */}
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            <h5 className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-3 flex items-center gap-1">
              <Search size={12} /> Tìm kiếm
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-xs font-medium">
                  <input type="checkbox" checked={config.search.show} onChange={(e) =>{  setConfig({ ...config, search: { ...config.search, show: e.target.checked } }); }} className="w-3.5 h-3.5 rounded" />
                  Hiển thị thanh tìm kiếm
                </label>
                {config.search.show && (
                  <Input value={config.search.placeholder} onChange={(e) =>{  setConfig({ ...config, search: { ...config.search, placeholder: e.target.value } }); }} placeholder="Tìm kiếm..." className="h-8 text-sm" />
                )}
              </div>
              {config.search.show && (
                <div className="space-y-2">
                  <Label className="text-xs text-slate-500">Tìm kiếm trong:</Label>
                  <div className="flex flex-wrap gap-3">
                    <label className={cn("flex items-center gap-2 text-xs", !enabledModules.products && "opacity-50")}>
                      <input type="checkbox" checked={config.search.searchProducts} onChange={(e) =>{  setConfig({ ...config, search: { ...config.search, searchProducts: e.target.checked } }); }} className="w-3.5 h-3.5 rounded" disabled={!enabledModules.products} />
                      Sản phẩm {!enabledModules.products && <span className="text-[10px] text-slate-400">(tắt)</span>}
                    </label>
                    <label className={cn("flex items-center gap-2 text-xs", !enabledModules.posts && "opacity-50")}>
                      <input type="checkbox" checked={config.search.searchPosts} onChange={(e) =>{  setConfig({ ...config, search: { ...config.search, searchPosts: e.target.checked } }); }} className="w-3.5 h-3.5 rounded" disabled={!enabledModules.posts} />
                      Bài viết {!enabledModules.posts && <span className="text-[10px] text-slate-400">(tắt)</span>}
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Cart, Wishlist, Login */}
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            <h5 className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-3 flex items-center gap-1">
              <LinkIcon size={12} /> Liên kết
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className={cn("flex items-center gap-2 text-xs font-medium", !enabledModules.cart && "opacity-50")}>
                  <input type="checkbox" checked={config.cart.show} onChange={(e) =>{  setConfig({ ...config, cart: { ...config.cart, show: e.target.checked } }); }} className="w-3.5 h-3.5 rounded" disabled={!enabledModules.cart} />
                  <ShoppingCart size={12} /> Giỏ hàng {!enabledModules.cart && <span className="text-[10px] text-slate-400">(tắt)</span>}
                </label>
                {config.cart.show && enabledModules.cart && (
                  <Input value={config.cart.url} onChange={(e) =>{  setConfig({ ...config, cart: { ...config.cart, url: e.target.value } }); }} placeholder="/cart" className="h-8 text-sm" />
                )}
              </div>
              <div className="space-y-2">
                <label className={cn("flex items-center gap-2 text-xs font-medium", !enabledModules.wishlist && "opacity-50")}>
                  <input type="checkbox" checked={config.wishlist.show} onChange={(e) =>{  setConfig({ ...config, wishlist: { ...config.wishlist, show: e.target.checked } }); }} className="w-3.5 h-3.5 rounded" disabled={!enabledModules.wishlist} />
                  <Heart size={12} /> Yêu thích {!enabledModules.wishlist && <span className="text-[10px] text-slate-400">(tắt)</span>}
                </label>
                {config.wishlist.show && enabledModules.wishlist && (
                  <Input value={config.wishlist.url} onChange={(e) =>{  setConfig({ ...config, wishlist: { ...config.wishlist, url: e.target.value } }); }} placeholder="/wishlist" className="h-8 text-sm" />
                )}
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-medium">
                  <input type="checkbox" checked={config.login.show} onChange={(e) =>{  setConfig({ ...config, login: { ...config.login, show: e.target.checked } }); }} className="w-3.5 h-3.5 rounded" />
                  <User size={12} /> Đăng nhập
                </label>
                {config.login.show && (
                  <div className="flex gap-2">
                    <Input value={config.login.text} onChange={(e) =>{  setConfig({ ...config, login: { ...config.login, text: e.target.value } }); }} placeholder="Đăng nhập" className="h-8 text-sm flex-1" />
                    <Input value={config.login.url} onChange={(e) =>{  setConfig({ ...config, login: { ...config.login, url: e.target.value } }); }} placeholder="/login" className="h-8 text-sm flex-1" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // ===================== MAIN RENDER =====================

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

  return (
    <Card className="mt-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Eye size={18} />
            Preview Menu
          </CardTitle>
          <div className="flex gap-2 flex-wrap items-center">
            <Button type="button" variant={hasChanges ? "accent" : "outline"} size="sm" onClick={handleApplyToSite} disabled={isSaving} className="gap-1.5">
              {isSaving ? (<>Đang lưu...</>) : (savedStyle === previewStyle ? (<><Check size={14} />Đã áp dụng</>) : (<><Save size={14} />Áp dụng cho Site</>))}
            </Button>
            
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />
            
            <button type="button" onClick={() =>{  setShowSettings(!showSettings); }} className={cn("px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all", showSettings ? "bg-orange-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900")}>
              <Settings size={14} />Cấu hình
            </button>
            <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
              {styles.map(({ id, label }) => (
                <button key={id} type="button" onClick={() => { setPreviewStyle(id); setMobileMenuOpen(false); setExpandedMobileItems([]); setHoveredItem(null); }} className={cn("px-3 py-1.5 rounded-md text-xs font-medium transition-all relative", previewStyle === id ? "bg-white dark:bg-slate-900 shadow-sm text-slate-900 dark:text-slate-100" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300")}>
                  {label}
                  {savedStyle === id && (<span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full" title="Đang sử dụng" />)}
                </button>
              ))}
            </div>
            <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
              {devices.map(({ id, icon: Icon, label }) => (
                <button key={id} type="button" onClick={() => { setDevice(id); setMobileMenuOpen(false); }} className={cn("px-2 py-1.5 rounded-md text-xs font-medium flex items-center gap-1 transition-all", device === id ? "bg-white dark:bg-slate-900 shadow-sm text-slate-900 dark:text-slate-100" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300")} title={label}>
                  <Icon size={14} />
                </button>
              ))}
            </div>
          </div>
        </div>

        {showSettings && renderSettingsForm()}
      </CardHeader>

      <CardContent className="pt-0">
        <div className={cn("mx-auto border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden shadow-sm relative", deviceWidths[device])}>
          {previewStyle === 'classic' && renderClassicStyle()}
          {previewStyle === 'topbar' && renderTopbarStyle()}
          {previewStyle === 'transparent' && renderTransparentStyle()}

          {/* Content placeholder for non-transparent */}
          {previewStyle !== 'transparent' && (
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

        <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
          <span>
            Style: <strong className="text-slate-700 dark:text-slate-300">{styles.find(s => s.id === previewStyle)?.label}</strong>
            {' • '}
            {device === 'desktop' && '1920px'}
            {device === 'tablet' && '768px'}
            {device === 'mobile' && '375px'}
          </span>
          <span>{activeItems.length} menu items hiển thị</span>
        </div>

        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800/50">
          <h4 className="text-xs font-semibold text-blue-700 dark:text-blue-400 flex items-center gap-1 mb-2">
            <HelpCircle size={14} /> Best Practices
          </h4>
          <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
            {previewStyle === 'classic' && (
              <>
                <li>• Layout phổ biến nhất - Logo trái, menu phải, CTA button</li>
                <li>• Giữ tối đa 5-7 mục menu để dễ đọc</li>
                <li>• Hamburger menu cho mobile với animation mượt</li>
              </>
            )}
            {previewStyle === 'topbar' && (
              <>
                <li>• Utility bar tăng conversion (hotline, tracking, login)</li>
                <li>• Search bar nổi bật giúp user tìm kiếm nhanh</li>
                <li>• Phù hợp cho e-commerce, corporate websites</li>
              </>
            )}
            {previewStyle === 'transparent' && (
              <>
                <li>• Header trong suốt overlay trên content - tạo cảm giác hiện đại</li>
                <li>• Phù hợp khi trang có hero banner hoặc slider</li>
                <li>• Dropdown với hiệu ứng glass/blur tăng tính thẩm mỹ</li>
              </>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
