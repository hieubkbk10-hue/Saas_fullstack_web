'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { 
  Button, Card, CardHeader, CardTitle, CardContent, Input, Label, cn 
} from '../components/ui';
import { ModuleGuard } from '../components/ModuleGuard';
import { mockMenuItems } from '../mockData';
import { MenuItem } from '../types';

export default function MenuBuilderPageWrapper() {
  return (
    <ModuleGuard moduleKey="menus">
      <MenuBuilderPage />
    </ModuleGuard>
  );
}
import { 
  Plus, Trash2, Save, ArrowUp, ArrowDown, GripVertical, ChevronRight, Eye,
  Phone, Mail, User, Heart, ShoppingCart, Search, Settings, Monitor, Tablet, Smartphone,
  HelpCircle, ChevronDown as ChevronDownIcon
} from 'lucide-react';

type MenuPreviewDevice = 'desktop' | 'tablet' | 'mobile';
type MenuPreviewStyle = 'classic' | 'topbar' | 'transparent';

interface MenuItemWithChildren extends MenuItem {
  children: MenuItemWithChildren[];
}

const MenuPreview = ({ 
  items, 
  brandColor = '#6366f1'
}: { 
  items: MenuItem[]; 
  brandColor?: string;
}) => {
  const [device, setDevice] = useState<MenuPreviewDevice>('desktop');
  const [previewStyle, setPreviewStyle] = useState<MenuPreviewStyle>('classic');
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedMobileItems, setExpandedMobileItems] = useState<string[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  
  const [config, setConfig] = useState({
    brandName: 'YourBrand',
    cta: { show: true, text: 'Liên hệ', url: '/contact' },
    topbar: {
      show: true,
      hotline: '1900 1234',
      email: 'contact@example.com',
      showTrackOrder: true,
      showStoreSystem: true,
    },
    search: { show: true, placeholder: 'Tìm kiếm...' },
    cart: { show: true },
    wishlist: { show: true },
    hero: {
      title: 'Chào mừng đến với',
      subtitle: 'Khám phá sản phẩm tuyệt vời',
      buttonText: 'Khám phá ngay',
      buttonUrl: '#',
    }
  });

  const devices = [
    { id: 'desktop' as const, icon: Monitor, label: 'Desktop' },
    { id: 'tablet' as const, icon: Tablet, label: 'Tablet' },
    { id: 'mobile' as const, icon: Smartphone, label: 'Mobile' }
  ];

  const styles = [
    { id: 'classic' as const, label: 'Classic' },
    { id: 'topbar' as const, label: 'With Topbar' },
    { id: 'transparent' as const, label: 'Transparent' }
  ];

  const deviceWidths = {
    desktop: 'w-full',
    tablet: 'w-[768px] max-w-full',
    mobile: 'w-[375px] max-w-full'
  };

  const buildMenuTree = (): MenuItemWithChildren[] => {
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
          const subRange = nextChildIndex === -1 ? childrenRange.slice(childrenRange.indexOf(child) + 1) : childrenRange.slice(childrenRange.indexOf(child) + 1, nextChildIndex);
          return {
            ...child,
            children: subRange.filter(s => s.depth === 2).map(s => ({ ...s, children: [] }))
          };
        })
      };
    });
  };

  const menuTree = buildMenuTree();

  const toggleMobileItem = (id: string) => {
    setExpandedMobileItems(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

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
                key={item.id} 
                className="relative"
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <button 
                  className={cn(
                    "px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-1",
                    hoveredItem === item.id 
                      ? "text-white" 
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  )}
                  style={hoveredItem === item.id ? { backgroundColor: brandColor } : {}}
                >
                  {item.label}
                  {item.children.length > 0 && (
                    <ChevronDownIcon size={14} className={cn("transition-transform", hoveredItem === item.id && "rotate-180")} />
                  )}
                </button>

                {item.children.length > 0 && hoveredItem === item.id && (
                  <div className="absolute top-full left-0 mt-1 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 py-2 min-w-[200px] z-50">
                    {item.children.map((child) => (
                      <div key={child.id} className="relative group">
                        <a 
                          href={child.url}
                          className="flex items-center justify-between px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                        >
                          {child.label}
                          {child.children?.length > 0 && <ChevronRight size={14} />}
                        </a>
                        {child.children?.length > 0 && (
                          <div className="absolute left-full top-0 ml-1 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 py-2 min-w-[180px] hidden group-hover:block">
                            {child.children.map((sub) => (
                              <a 
                                key={sub.id}
                                href={sub.url}
                                className="block px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                              >
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
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <div className="w-5 h-4 flex flex-col justify-between">
              <span className={cn("w-full h-0.5 bg-slate-600 rounded transition-all", mobileMenuOpen && "rotate-45 translate-y-1.5")}></span>
              <span className={cn("w-full h-0.5 bg-slate-600 rounded transition-all", mobileMenuOpen && "opacity-0")}></span>
              <span className={cn("w-full h-0.5 bg-slate-600 rounded transition-all", mobileMenuOpen && "-rotate-45 -translate-y-1.5")}></span>
            </div>
          </button>
        )}

        {device !== 'mobile' && config.cta.show && (
          <a 
            href={config.cta.url}
            className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors hover:opacity-90"
            style={{ backgroundColor: brandColor }}
          >
            {config.cta.text}
          </a>
        )}
      </div>

      {device === 'mobile' && mobileMenuOpen && (
        <div className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          {menuTree.map((item) => (
            <div key={item.id}>
              <button 
                onClick={() => item.children.length > 0 && toggleMobileItem(item.id)}
                className="w-full px-6 py-3 text-left flex items-center justify-between text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition-colors"
              >
                {item.label}
                {item.children.length > 0 && (
                  <ChevronDownIcon size={16} className={cn("transition-transform", expandedMobileItems.includes(item.id) && "rotate-180")} />
                )}
              </button>
              {item.children.length > 0 && expandedMobileItems.includes(item.id) && (
                <div className="bg-white dark:bg-slate-800">
                  {item.children.map((child) => (
                    <a key={child.id} href={child.url} className="block px-8 py-2.5 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border-l-2 border-slate-200 dark:border-slate-600 ml-6">
                      {child.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
          {config.cta.show && (
            <div className="p-4">
              <a href={config.cta.url} className="block w-full py-2.5 text-sm font-medium text-white rounded-lg text-center" style={{ backgroundColor: brandColor }}>
                {config.cta.text}
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderTopbarStyle = () => (
    <div className="bg-white dark:bg-slate-900">
      {config.topbar.show && (
        <div className="px-4 py-2 text-xs border-b border-slate-100 dark:border-slate-800" style={{ backgroundColor: brandColor }}>
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Phone size={12} />
                <span>{config.topbar.hotline}</span>
              </span>
              {device !== 'mobile' && (
                <span className="flex items-center gap-1">
                  <Mail size={12} />
                  <span>{config.topbar.email}</span>
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              {device !== 'mobile' && (
                <>
                  {config.topbar.showTrackOrder && <a href="#" className="hover:underline">Theo dõi đơn hàng</a>}
                  {config.topbar.showTrackOrder && config.topbar.showStoreSystem && <span>|</span>}
                  {config.topbar.showStoreSystem && <a href="#" className="hover:underline">Hệ thống cửa hàng</a>}
                  {(config.topbar.showTrackOrder || config.topbar.showStoreSystem) && <span>|</span>}
                </>
              )}
              <a href="#" className="hover:underline flex items-center gap-1">
                <User size={12} />
                Đăng nhập
              </a>
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
                <input 
                  type="text" 
                  placeholder={config.search.placeholder}
                  className="w-full pl-4 pr-10 py-2 rounded-full border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 text-slate-700 dark:text-slate-300"
                />
                <button className="absolute right-1 top-1/2 -translate-y-1/2 p-2 rounded-full text-white" style={{ backgroundColor: brandColor }}>
                  <Search size={14} />
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            {device === 'mobile' ? (
              <>
                {config.search.show && (
                  <button className="p-2 text-slate-600 dark:text-slate-400">
                    <Search size={20} />
                  </button>
                )}
                {config.cart.show && (
                  <button className="p-2 text-slate-600 dark:text-slate-400 relative">
                    <ShoppingCart size={20} />
                    <span className="absolute -top-1 -right-1 w-5 h-5 text-[10px] font-bold text-white rounded-full flex items-center justify-center" style={{ backgroundColor: brandColor }}>0</span>
                  </button>
                )}
                <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2">
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
                  <button className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors flex flex-col items-center text-xs gap-0.5">
                    <Heart size={20} />
                    <span>Yeu thich</span>
                  </button>
                )}
                {config.cart.show && (
                  <button className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors flex flex-col items-center text-xs gap-0.5 relative">
                    <ShoppingCart size={20} />
                    <span>Gio hang</span>
                    <span className="absolute top-0 right-0 w-5 h-5 text-[10px] font-bold text-white rounded-full flex items-center justify-center" style={{ backgroundColor: brandColor }}>0</span>
                  </button>
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
              <div 
                key={item.id} 
                className="relative"
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <a 
                  href={item.url}
                  className={cn(
                    "px-3 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-1",
                    hoveredItem === item.id 
                      ? "text-white" 
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                  )}
                  style={hoveredItem === item.id ? { backgroundColor: brandColor } : {}}
                >
                  {item.label}
                  {item.children.length > 0 && <ChevronDownIcon size={14} />}
                </a>
                
                {item.children.length > 0 && hoveredItem === item.id && (
                  <div className="absolute top-full left-0 mt-1 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 py-2 min-w-[200px] z-50">
                    {item.children.map((child) => (
                      <a key={child.id} href={child.url} className="block px-4 py-2.5 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors">
                        {child.label}
                      </a>
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
            <div key={item.id} className="border-b border-slate-100 dark:border-slate-800">
              <button 
                onClick={() => item.children.length > 0 && toggleMobileItem(item.id)}
                className="w-full px-4 py-3 text-left flex items-center justify-between text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                {item.label}
                {item.children.length > 0 && <ChevronDownIcon size={16} className={cn("transition-transform", expandedMobileItems.includes(item.id) && "rotate-180")} />}
              </button>
              {item.children.length > 0 && expandedMobileItems.includes(item.id) && (
                <div className="bg-slate-50 dark:bg-slate-800/50 pb-2">
                  {item.children.map((child) => (
                    <a key={child.id} href={child.url} className="block px-6 py-2 text-sm text-slate-600 dark:text-slate-400">
                      {child.label}
                    </a>
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
    <div className="bg-white dark:bg-slate-900">
      <div className="relative">
        <div 
          className={cn(
            "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900",
            device === 'mobile' ? 'h-[300px]' : 'h-[350px]'
          )}
        >
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
        </div>

        <div className="absolute top-0 left-0 right-0 z-10">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold" style={{ backgroundColor: brandColor }}>{config.brandName.charAt(0)}</div>
              <span className="font-bold text-lg text-white">{config.brandName}</span>
            </div>

            {device !== 'mobile' ? (
              <>
                <nav className="flex items-center gap-1">
                  {menuTree.map((item) => (
                    <div 
                      key={item.id} 
                      className="relative"
                      onMouseEnter={() => setHoveredItem(item.id)}
                      onMouseLeave={() => setHoveredItem(null)}
                    >
                      <a 
                        href={item.url}
                        className="px-4 py-2 text-sm font-medium text-white/80 hover:text-white transition-colors flex items-center gap-1"
                      >
                        {item.label}
                        {item.children.length > 0 && <ChevronDownIcon size={14} className={cn("transition-transform", hoveredItem === item.id && "rotate-180")} />}
                      </a>
                      
                      {item.children.length > 0 && hoveredItem === item.id && (
                        <div className="absolute top-full left-0 mt-2 backdrop-blur-xl bg-white/95 dark:bg-slate-800/95 rounded-xl shadow-2xl border border-white/20 py-2 min-w-[200px] z-50">
                          {item.children.map((child) => (
                            <a key={child.id} href={child.url} className="block px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-700/80 transition-colors">
                              {child.label}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </nav>
                
                {config.cta.show && (
                  <a 
                    href={config.cta.url}
                    className="px-5 py-2 text-sm font-medium text-white rounded-full transition-all hover:scale-105 hover:shadow-lg"
                    style={{ backgroundColor: brandColor }}
                  >
                    {config.cta.text}
                  </a>
                )}
              </>
            ) : (
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-white"
              >
                <div className="w-5 h-4 flex flex-col justify-between">
                  <span className={cn("w-full h-0.5 bg-white rounded transition-all", mobileMenuOpen && "rotate-45 translate-y-1.5")}></span>
                  <span className={cn("w-full h-0.5 bg-white rounded transition-all", mobileMenuOpen && "opacity-0")}></span>
                  <span className={cn("w-full h-0.5 bg-white rounded transition-all", mobileMenuOpen && "-rotate-45 -translate-y-1.5")}></span>
                </div>
              </button>
            )}
          </div>

          {device === 'mobile' && mobileMenuOpen && (
            <div className="absolute top-full left-0 right-0 backdrop-blur-xl bg-slate-900/95 border-t border-white/10">
              {menuTree.map((item) => (
                <div key={item.id}>
                  <button 
                    onClick={() => item.children.length > 0 && toggleMobileItem(item.id)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between text-sm font-medium text-white/90 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    {item.label}
                    {item.children.length > 0 && <ChevronDownIcon size={16} className={cn("transition-transform", expandedMobileItems.includes(item.id) && "rotate-180")} />}
                  </button>
                  {item.children.length > 0 && expandedMobileItems.includes(item.id) && (
                    <div className="bg-white/5">
                      {item.children.map((child) => (
                        <a key={child.id} href={child.url} className="block px-8 py-3 text-sm text-white/70 hover:text-white border-l-2 border-white/20 ml-6">
                          {child.label}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {config.cta.show && (
                <div className="p-4">
                  <a href={config.cta.url} className="block w-full py-3 text-sm font-medium text-white rounded-full text-center" style={{ backgroundColor: brandColor }}>
                    {config.cta.text}
                  </a>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="absolute inset-0 flex items-center justify-center text-center px-6 pt-16">
          <div>
            <h1 className={cn("font-bold text-white mb-4", device === 'mobile' ? 'text-2xl' : 'text-4xl')}>
              {config.hero.title} <span style={{ color: brandColor }}>{config.brandName}</span>
            </h1>
            <p className={cn("text-white/70 mb-6 max-w-lg mx-auto", device === 'mobile' ? 'text-sm' : 'text-base')}>
              {config.hero.subtitle}
            </p>
            <a 
              href={config.hero.buttonUrl}
              className="inline-block px-6 py-3 text-sm font-medium text-white rounded-full hover:opacity-90 transition-opacity"
              style={{ backgroundColor: brandColor }}
            >
              {config.hero.buttonText}
            </a>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Card className="mt-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Eye size={18} />
            Preview Menu
          </CardTitle>
          <div className="flex gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setShowSettings(!showSettings)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all",
                showSettings
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900"
              )}
            >
              <Settings size={14} />
              Cau hinh
            </button>
            <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
              {styles.map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    setPreviewStyle(id);
                    setMobileMenuOpen(false);
                    setExpandedMobileItems([]);
                    setHoveredItem(null);
                  }}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                    previewStyle === id
                      ? "bg-white dark:bg-slate-900 shadow-sm text-slate-900 dark:text-slate-100"
                      : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
              {devices.map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    setDevice(id);
                    setMobileMenuOpen(false);
                  }}
                  className={cn(
                    "px-2 py-1.5 rounded-md text-xs font-medium flex items-center gap-1 transition-all",
                    device === id
                      ? "bg-white dark:bg-slate-900 shadow-sm text-slate-900 dark:text-slate-100"
                      : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  )}
                  title={label}
                >
                  <Icon size={14} />
                </button>
              ))}
            </div>
          </div>
        </div>

        {showSettings && (
          <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Ten thuong hieu</label>
                <Input
                  value={config.brandName}
                  onChange={(e) => setConfig({ ...config, brandName: e.target.value })}
                  placeholder="YourBrand"
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={config.cta.show}
                    onChange={(e) => setConfig({ ...config, cta: { ...config.cta, show: e.target.checked } })}
                    className="w-3.5 h-3.5 rounded"
                  />
                  Nut CTA
                </label>
                {config.cta.show && (
                  <Input
                    value={config.cta.text}
                    onChange={(e) => setConfig({ ...config, cta: { ...config.cta, text: e.target.value } })}
                    placeholder="Lien he"
                    className="h-8 text-sm"
                  />
                )}
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">URL CTA</label>
                <Input
                  value={config.cta.url}
                  onChange={(e) => setConfig({ ...config, cta: { ...config.cta, url: e.target.value } })}
                  placeholder="/contact"
                  className="h-8 text-sm"
                  disabled={!config.cta.show}
                />
              </div>
            </div>

            <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
              <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                <span className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-[10px]">With Topbar</span>
                Utility Bar
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <label className="flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={config.topbar.show}
                    onChange={(e) => setConfig({ ...config, topbar: { ...config.topbar, show: e.target.checked } })}
                    className="w-3.5 h-3.5 rounded"
                  />
                  Hiển thị Topbar
                </label>
                <label className="flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={config.topbar.showTrackOrder}
                    onChange={(e) => setConfig({ ...config, topbar: { ...config.topbar, showTrackOrder: e.target.checked } })}
                    className="w-3.5 h-3.5 rounded"
                  />
                  Theo dõi đơn
                </label>
                <label className="flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={config.topbar.showStoreSystem}
                    onChange={(e) => setConfig({ ...config, topbar: { ...config.topbar, showStoreSystem: e.target.checked } })}
                    className="w-3.5 h-3.5 rounded"
                  />
                  Hệ thống cửa hàng
                </label>
                <label className="flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={config.search.show}
                    onChange={(e) => setConfig({ ...config, search: { ...config.search, show: e.target.checked } })}
                    className="w-3.5 h-3.5 rounded"
                  />
                  Tim kiem
                </label>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                <Input
                  value={config.topbar.hotline}
                  onChange={(e) => setConfig({ ...config, topbar: { ...config.topbar, hotline: e.target.value } })}
                  placeholder="1900 1234"
                  className="h-8 text-sm"
                />
                <Input
                  value={config.topbar.email}
                  onChange={(e) => setConfig({ ...config, topbar: { ...config.topbar, email: e.target.value } })}
                  placeholder="contact@example.com"
                  className="h-8 text-sm"
                />
                <label className="flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={config.wishlist.show}
                    onChange={(e) => setConfig({ ...config, wishlist: { ...config.wishlist, show: e.target.checked } })}
                    className="w-3.5 h-3.5 rounded"
                  />
                  Yeu thich
                </label>
                <label className="flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={config.cart.show}
                    onChange={(e) => setConfig({ ...config, cart: { ...config.cart, show: e.target.checked } })}
                    className="w-3.5 h-3.5 rounded"
                  />
                  Gio hang
                </label>
              </div>
            </div>

            <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
              <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                <span className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-[10px]">Transparent</span>
                Hero Section
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input
                  value={config.hero.title}
                  onChange={(e) => setConfig({ ...config, hero: { ...config.hero, title: e.target.value } })}
                  placeholder="Chao mung den voi"
                  className="h-8 text-sm"
                />
                <Input
                  value={config.hero.subtitle}
                  onChange={(e) => setConfig({ ...config, hero: { ...config.hero, subtitle: e.target.value } })}
                  placeholder="Kham pha san pham tuyet voi"
                  className="h-8 text-sm"
                />
                <Input
                  value={config.hero.buttonText}
                  onChange={(e) => setConfig({ ...config, hero: { ...config.hero, buttonText: e.target.value } })}
                  placeholder="Kham pha ngay"
                  className="h-8 text-sm"
                />
                <Input
                  value={config.hero.buttonUrl}
                  onChange={(e) => setConfig({ ...config, hero: { ...config.hero, buttonUrl: e.target.value } })}
                  placeholder="#"
                  className="h-8 text-sm"
                />
              </div>
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4 flex justify-center overflow-hidden">
          <div className={cn(
            "bg-white dark:bg-slate-900 rounded-lg shadow-lg overflow-hidden transition-all duration-300",
            deviceWidths[device]
          )}>
            <div className="bg-slate-200 dark:bg-slate-700 px-3 py-2 flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
              </div>
              <div className="flex-1 mx-2">
                <div className="bg-white dark:bg-slate-800 rounded-md px-3 py-1 text-xs text-slate-400 truncate">
                  https://yoursite.com
                </div>
              </div>
            </div>

            {previewStyle === 'classic' && renderClassicStyle()}
            {previewStyle === 'topbar' && renderTopbarStyle()}
            {previewStyle === 'transparent' && renderTransparentStyle()}

            {previewStyle !== 'transparent' && (
              <div className="p-4 space-y-3 bg-slate-50 dark:bg-slate-800/50">
                <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                  <span className="text-slate-400 text-sm">Hero Section</span>
                </div>
                <div className={cn("grid gap-3", device === 'mobile' ? 'grid-cols-2' : 'grid-cols-4')}>
                  {[1,2,3,4].map(i => (
                    <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800 rounded-lg"></div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
          <span>
            Style: <strong className="text-slate-700 dark:text-slate-300">{styles.find(s => s.id === previewStyle)?.label}</strong>
            {' - '}
            {device === 'desktop' && '1920px'}
            {device === 'tablet' && '768px'}
            {device === 'mobile' && '375px'}
          </span>
          <span>{items.filter(i => i.depth === 0).length} mục gốc - {items.length} tổng</span>
        </div>

        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
          <h4 className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-2 flex items-center gap-1.5">
            <HelpCircle size={14} /> Best Practices
          </h4>
          <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
            {previewStyle === 'classic' && (
              <>
                <li>- Layout phổ biến nhất - Logo trái, menu phải, CTA button</li>
                <li>- Giữ tối đa 5-7 mục menu để dễ đọc</li>
                <li>- Hamburger menu cho mobile với animation mượt</li>
              </>
            )}
            {previewStyle === 'topbar' && (
              <>
                <li>- Utility bar tăng conversion (hotline, tracking, login)</li>
                <li>- Search bar nổi bật giúp user tìm kiếm nhanh</li>
                <li>- Phù hợp cho e-commerce, corporate websites</li>
              </>
            )}
            {previewStyle === 'transparent' && (
              <>
                <li>- Overlay trên hero section - tạo cảm giác hiện đại</li>
                <li>- Chuyển từ transparent sang solid khi scroll (sticky)</li>
                <li>- Dropdown với hiệu ứng glass/blur tăng tính thẩm mỹ</li>
              </>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

function MenuBuilderPage() {
  const MENU_ID = 'M1'; 
  
  const [items, setItems] = useState<MenuItem[]>(mockMenuItems.filter(mi => mi.menuId === MENU_ID).sort((a,b) => a.order - b.order));
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) return;

    const newItems = [...items];
    const draggedItem = newItems[draggedIndex];

    newItems.splice(draggedIndex, 1);
    newItems.splice(dropIndex, 0, draggedItem);

    const updatedItems = newItems.map((item, idx) => ({ ...item, order: idx + 1 }));
    
    setItems(updatedItems);
    setDraggedIndex(null);
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === items.length - 1)) return;
    
    const newItems = [...items];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    
    const tempOrder = newItems[index].order;
    newItems[index].order = newItems[swapIndex].order;
    newItems[swapIndex].order = tempOrder;

    [newItems[index], newItems[swapIndex]] = [newItems[swapIndex], newItems[index]];
    setItems(newItems);
  };

  const handleIndent = (index: number, direction: 'in' | 'out') => {
    const newItems = [...items];
    const item = newItems[index];
    if (direction === 'in') {
      if (item.depth < 2) item.depth += 1;
    } else {
      if (item.depth > 0) item.depth -= 1;
    }
    setItems(newItems);
  };

  const handleDelete = (index: number) => {
    if(confirm('Xóa liên kết này?')) {
      const newItems = items.filter((_, i) => i !== index);
      setItems(newItems);
    }
  };

  const handleAdd = () => {
    const newItem: MenuItem = {
      id: `NEW-${Date.now()}`,
      menuId: MENU_ID,
      label: 'Liên kết mới',
      url: '/',
      order: items.length + 1,
      depth: 0
    };
    setItems([...items, newItem]);
  };

  const updateItem = (index: number, field: keyof MenuItem, value: string) => {
    const newItems = [...items];
    if (field === 'label') {
      newItems[index] = { ...newItems[index], label: value };
    } else if (field === 'url') {
      newItems[index] = { ...newItems[index], url: value };
    }
    setItems(newItems);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Header Menu</h1>
           <p className="text-sm text-slate-500 dark:text-slate-400">Quản lý các liên kết hiển thị trên thanh điều hướng chính (Header)</p>
        </div>
        <Button className="gap-2 bg-blue-600 hover:bg-blue-700" onClick={() => toast.success("Đã lưu menu thành công")}>
            <Save size={16}/> Lưu thay đổi
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item, index) => (
            <div 
              key={item.id} 
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e)}
              onDrop={(e) => handleDrop(e, index)}
              className={cn(
                "flex items-center gap-3 p-3 bg-white dark:bg-slate-900 border rounded-lg shadow-sm group transition-all cursor-default",
                item.depth === 1 ? "ml-8 border-l-4 border-l-blue-500/20" : "",
                item.depth === 2 ? "ml-16 border-l-4 border-l-blue-500/40" : "border-slate-200",
                draggedIndex === index ? "opacity-50 border-dashed border-slate-400" : ""
              )}
            >
              <div className="flex flex-col gap-1 text-slate-300 cursor-move" title="Kéo để sắp xếp">
                <button type="button" onClick={() => handleMove(index, 'up')} className="hover:text-blue-600 disabled:opacity-30" disabled={index === 0}><ArrowUp size={14}/></button>
                <GripVertical size={14} />
                <button type="button" onClick={() => handleMove(index, 'down')} className="hover:text-blue-600 disabled:opacity-30" disabled={index === items.length - 1}><ArrowDown size={14}/></button>
              </div>
              
              <div className="flex-1 grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs text-slate-500">Nhãn hiển thị</Label>
                  <Input value={item.label} onChange={(e) => updateItem(index, 'label', e.target.value)} className="h-8 text-sm" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-slate-500">Đường dẫn (URL)</Label>
                  <Input value={item.url} onChange={(e) => updateItem(index, 'url', e.target.value)} className="h-8 text-sm font-mono text-xs" />
                </div>
              </div>

              <div className="flex items-center gap-1 border-l border-slate-100 pl-3">
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleIndent(index, 'out')} disabled={item.depth === 0} title="Thụt lề trái"><ChevronRight size={14} className="rotate-180"/></Button>
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleIndent(index, 'in')} disabled={item.depth >= 2} title="Thụt lề phải"><ChevronRight size={14}/></Button>
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:bg-red-50" onClick={() => handleDelete(index)}><Trash2 size={14}/></Button>
              </div>
            </div>
          ))}

          <Button variant="outline" className="w-full border-dashed" onClick={handleAdd}>
            <Plus size={16} className="mr-2"/> Thêm liên kết mới
          </Button>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Hướng dẫn cấu trúc</CardTitle></CardHeader>
            <CardContent className="text-sm text-slate-500 space-y-4">
              <div className="p-3 bg-slate-50 rounded border border-slate-100">
                 <p className="font-medium text-slate-900 mb-1">Cấp 1 (Root)</p>
                 <p>Hiển thị trực tiếp trên thanh menu ngang.</p>
              </div>
              <div className="p-3 bg-slate-50 rounded border border-slate-100 ml-4">
                 <p className="font-medium text-slate-900 mb-1">Cấp 2 (Dropdown)</p>
                 <p>Hiển thị khi di chuột vào mục cấp 1.</p>
              </div>
              <div className="p-3 bg-slate-50 rounded border border-slate-100 ml-8">
                 <p className="font-medium text-slate-900 mb-1">Cấp 3 (Sub-menu)</p>
                 <p>Hiển thị khi di chuột vào mục cấp 2.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <MenuPreview items={items} />
    </div>
  );
}
