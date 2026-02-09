'use client';

import React, { useMemo, useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { 
  AlertTriangle, 
  BarChart3, 
  Bell, 
  Briefcase, 
  Check, 
  ChevronDown, 
  Download,
  ExternalLink,
  FileCode, 
  FileText, 
  Heart, 
  Image, 
  Layers, 
  LayoutGrid, 
  Loader2,
  Lock,
  Megaphone,
  Menu,
  MessageSquare,
  Package,
  Search,
  Settings,
  Shield,
  ShoppingBag,
  ShoppingCart,
  UserCog,
  Users,
  X
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useI18n } from '../i18n/context';
import type { TranslationKeys } from '../i18n/translations';

// SYS-004: Confirmation Dialog component
const CascadeConfirmDialog: React.FC<{
  isOpen: boolean;
  moduleKey: string;
  moduleName: string;
  dependentModules: { key: string; name: string }[];
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}> = ({ isOpen, moduleName, dependentModules, onConfirm, onCancel, isLoading }) => {
  if (!isOpen) {return null;}

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-md">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-amber-500" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
              Xác nhận tắt module
            </h3>
          </div>
          
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            Tắt module <strong className="text-slate-800 dark:text-slate-200">{moduleName}</strong> sẽ 
            <span className="text-amber-600 dark:text-amber-400 font-medium"> tự động tắt </span> 
            các module phụ thuộc sau:
          </p>
          
          <div className="bg-slate-50 dark:bg-slate-950 rounded-lg p-3 mb-4">
            <ul className="space-y-1">
              {dependentModules.map(dep => (
                <li key={dep.key} className="flex items-center gap-2 text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  <span className="text-slate-700 dark:text-slate-300">{dep.name}</span>
                  <span className="text-xs text-slate-400">({dep.key})</span>
                </li>
              ))}
            </ul>
          </div>
          
          <p className="text-xs text-slate-500 mb-6">
            Bạn có thể bật lại các module này sau khi đã bật lại module {moduleName}.
          </p>
          
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                'Xác nhận tắt'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  BarChart3, Bell, Briefcase, FileText, Heart, Image, LayoutGrid, 
  Megaphone, Menu, MessageSquare, Package, Settings, Shield, ShoppingBag, ShoppingCart, UserCog,
  Users
};

const categoryColors: Record<string, string> = {
  commerce: 'text-emerald-400',
  content: 'text-blue-400',
  marketing: 'text-pink-400',
  system: 'text-orange-400',
  user: 'text-purple-400',
};

const categoryLabelsEn: Record<string, string> = {
  commerce: 'Commerce',
  content: 'Content',
  marketing: 'Marketing',
  system: 'System',
  user: 'User',
};

const moduleConfigRoutes: Record<string, string> = {
  analytics: '/system/modules/analytics',
  cart: '/system/modules/cart',
  comments: '/system/modules/comments',
  customers: '/system/modules/customers',
  homepage: '/system/modules/homepage',
  media: '/system/modules/media',
  menus: '/system/modules/menus',
  notifications: '/system/modules/notifications',
  orders: '/system/modules/orders',
  posts: '/system/modules/posts',
  products: '/system/modules/products',
  promotions: '/system/modules/promotions',
  roles: '/system/modules/roles',
  services: '/system/modules/services',
  settings: '/system/modules/settings',
  users: '/system/modules/users',
  wishlist: '/system/modules/wishlist',
};

interface AdminModule {
  _id: Id<"adminModules">;
  key: string;
  name: string;
  description: string;
  icon: string;
  category: "content" | "commerce" | "user" | "system" | "marketing";
  enabled: boolean;
  isCore: boolean;
  dependencies?: string[];
  dependencyType?: "all" | "any";
  order: number;
}

interface SystemPreset {
  _id: Id<"systemPresets">;
  key: string;
  name: string;
  description: string;
  enabledModules: string[];
  isDefault?: boolean;
}

const generateConfigMarkdown = (modules: AdminModule[], preset?: SystemPreset): string => {
  const enabledModules = modules.filter(m => m.enabled);
  const disabledModules = modules.filter(m => !m.enabled);
  const now = new Date().toISOString().slice(0, 16).replace('T', ' ');

  return `# Admin Module Configuration

> Generated: ${now}
> Preset: ${preset?.name ?? 'Custom'}

## Summary

- Enabled: ${enabledModules.length}
- Disabled: ${disabledModules.length}

## Enabled Modules

| Module | Category | Core |
|--------|----------|------|
${enabledModules.map(m => 
  `| ${m.key} | ${categoryLabelsEn[m.category]} | ${m.isCore ? 'Yes' : 'No'} |`
).join('\n')}

## Disabled Modules

${disabledModules.length > 0 
  ? disabledModules.map(m => `- ${m.key} (${categoryLabelsEn[m.category]})`).join('\n')
  : '_None_'}

## JSON Config

\`\`\`json
{
  "preset": "${preset?.key ?? 'custom'}",
  "modules": {
${modules.map(m => `    "${m.key}": ${m.enabled}`).join(',\n')}
  }
}
\`\`\`
`;
};

const PresetDropdown: React.FC<{
  presets: SystemPreset[];
  selectedPreset: string;
  onSelect: (presetKey: string) => void;
  loading?: boolean;
}> = ({ presets, selectedPreset, onSelect, loading }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selected = presets.find(p => p.key === selectedPreset);

  return (
    <div className="relative">
      <button
        onClick={() =>{  setIsOpen(!isOpen); }}
        disabled={loading}
        className="flex items-center gap-2 px-3 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
      >
        {loading && <Loader2 size={14} className="animate-spin" />}
        <span>{selected?.name ?? 'Custom'}</span>
        <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() =>{  setIsOpen(false); }} />
          <div className="absolute top-full left-0 mt-1 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-20 overflow-hidden">
            <div className="p-2 border-b border-slate-100 dark:border-slate-800">
              <p className="text-[10px] text-slate-500 uppercase font-semibold px-2">Chọn preset</p>
            </div>
            <div className="max-h-72 overflow-y-auto">
              {presets.map(preset => (
                <button
                  key={preset.key}
                  onClick={() => { onSelect(preset.key); setIsOpen(false); }}
                  className={`w-full px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${
                    selectedPreset === preset.key ? 'bg-slate-50 dark:bg-slate-800' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{preset.name}</span>
                      <p className="text-xs text-slate-500">{preset.description}</p>
                    </div>
                    {selectedPreset === preset.key && (
                      <Check size={14} className="text-cyan-500 shrink-0" />
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">{preset.enabledModules.length} modules</p>
                </button>
              ))}
              <button
                onClick={() => { onSelect('custom'); setIsOpen(false); }}
                className={`w-full px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${
                  selectedPreset === 'custom' ? 'bg-slate-50 dark:bg-slate-800' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-slate-800 dark:text-slate-200">Custom</span>
                    <p className="text-xs text-slate-500">Cấu hình thủ công</p>
                  </div>
                  {selectedPreset === 'custom' && (
                    <Check size={14} className="text-cyan-500 shrink-0" />
                  )}
                </div>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const ConfigActions: React.FC<{
  modules: AdminModule[];
  preset?: SystemPreset;
}> = ({ modules, preset }) => {
  const [showMarkdown, setShowMarkdown] = useState(false);
  const markdown = useMemo(() => generateConfigMarkdown(modules, preset), [modules, preset]);

  const handleDownload = () => {
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `admin-config-${preset?.key ?? 'custom'}-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleOpenNewTab = () => {
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          onClick={() =>{  setShowMarkdown(true); }}
          className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
          title="Xem cấu hình dạng Markdown"
        >
          <FileCode size={16} />
          <span className="hidden sm:inline">Xem Config</span>
        </button>
        <button
          onClick={handleDownload}
          className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
          title="Tải về file .md"
        >
          <Download size={16} />
        </button>
        <button
          onClick={handleOpenNewTab}
          className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
          title="Mở trong tab mới"
        >
          <ExternalLink size={16} />
        </button>
      </div>

      {showMarkdown && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <FileCode size={20} /> Module Configuration
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <Download size={14} /> Tải về
                </button>
                <button
                  onClick={() =>{  setShowMarkdown(false); }}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <X size={20} className="text-slate-500" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <pre className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-mono bg-slate-50 dark:bg-slate-950 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                {markdown}
              </pre>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const ModuleCard: React.FC<{ 
  module: AdminModule; 
  onToggle: (key: string, enabled: boolean) => void;
  canToggle: boolean;
  allModules: AdminModule[];
  isToggling?: boolean;
  isAnyToggling?: boolean; // SYS-008: disable all khi có 1 đang toggle
  t: TranslationKeys;
}> = ({ module, onToggle, canToggle, allModules, isToggling, isAnyToggling, t }) => {
  const Icon = iconMap[module.icon] || Package;
  const categoryColor = categoryColors[module.category];
  const categoryLabel = t.modules.categories[module.category];
  const configRoute = moduleConfigRoutes[module.key];
  // SYS-008: Disable toggle khi có bất kỳ module nào đang toggle
  const isDisabled = module.isCore || !canToggle || (isToggling ?? isAnyToggling);
  const hasDependents = allModules.some(m => m.dependencies?.includes(module.key) && m.enabled);
  
  return (
    <div className={`bg-white dark:bg-slate-900 border rounded-lg p-4 transition-all ${
      module.enabled 
        ? 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700' 
        : 'border-slate-200 dark:border-slate-800 opacity-60'
    }`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            module.enabled 
              ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400' 
              : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
          }`}>
            <Icon size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-slate-800 dark:text-slate-200 font-medium text-sm truncate">{module.name}</h3>
              {module.isCore && (
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-medium">
                  CORE
                </span>
              )}
              {hasDependents && module.enabled && (
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-medium">
                  PARENT
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 line-clamp-2">{module.description}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className={`text-[10px] font-medium ${categoryColor}`}>{categoryLabel}</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-2">
          <button 
            onClick={() => !isDisabled && onToggle(module.key, !module.enabled)}
            disabled={isDisabled}
            title={!canToggle && !module.isCore ? t.modules.needParent : undefined}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              isDisabled 
                ? 'bg-slate-200 dark:bg-slate-700 cursor-not-allowed' 
                : (module.enabled 
                  ? 'bg-cyan-500 cursor-pointer' 
                  : 'bg-slate-300 dark:bg-slate-700 cursor-pointer')
            }`}
          >
            {isToggling ? (
              <Loader2 size={14} className="absolute top-1 left-1/2 -translate-x-1/2 animate-spin text-white" />
            ) : (
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${
                module.enabled ? 'left-6' : 'left-1'
              }`}></div>
            )}
          </button>
          {module.isCore && (
            <Lock size={12} className="text-slate-400" />
          )}
          {!canToggle && !module.isCore && (
            <span className="text-[9px] text-rose-500">{t.modules.needParent}</span>
          )}
        </div>
      </div>
      
      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        {module.dependencies && module.dependencies.length > 0 ? (
          <div className="flex items-center gap-1 text-[10px] text-slate-500">
            <Layers size={10} />
            <span>{t.modules.dependsOn}: {module.dependencies.map(d => allModules.find(m => m.key === d)?.name ?? d).join(', ')}</span>
          </div>
        ) : (
          <div></div>
        )}
        
        {configRoute && module.enabled && (
          <Link 
            href={configRoute}
            className="flex items-center gap-1 text-[11px] text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 font-medium"
          >
            <Settings size={12} /> {t.modules.configure}
          </Link>
        )}
      </div>
    </div>
  );
};

export default function ModuleManagementPage() {
  const { t } = useI18n();
  const modulesData = useQuery(api.admin.modules.listModules);
  const presetsData = useQuery(api.admin.presets.listPresets);
  const toggleModule = useMutation(api.admin.modules.toggleModule);
  const toggleModuleWithCascade = useMutation(api.admin.modules.toggleModuleWithCascade);
  const applyPreset = useMutation(api.admin.presets.applyPreset);
  const seedModule = useMutation(api.seedManager.seedModule);
  
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPreset, setSelectedPreset] = useState<string>('custom');
  const [togglingKey, setTogglingKey] = useState<string | null>(null);
  const [applyingPreset, setApplyingPreset] = useState(false);
  
  // SYS-004: State cho cascade confirmation dialog
  const [cascadeDialog, setCascadeDialog] = useState<{
    isOpen: boolean;
    moduleKey: string;
    moduleName: string;
    dependentModules: { key: string; name: string }[];
  }>({ dependentModules: [], isOpen: false, moduleKey: '', moduleName: '' });

  const modules = modulesData ?? [];
  const presets = presetsData ?? [];

  // Seed data if empty
  React.useEffect(() => {
    if (modulesData === undefined || presetsData === undefined) {
      return;
    }
    if (modulesData.length > 0 && presetsData.length > 0) {
      return;
    }
    void (async () => {
      try {
        if (modulesData.length === 0) {
          await seedModule({ module: 'adminModules', quantity: 0 });
        }
        if (presetsData.length === 0) {
          await seedModule({ module: 'systemPresets', quantity: 0 });
        }
      } catch (error) {
        console.error(error);
      }
    })();
  }, [modulesData, presetsData, seedModule]);

  const handlePresetSelect = async (presetKey: string) => {
    setSelectedPreset(presetKey);
    if (presetKey === 'custom') {return;}
    
    setApplyingPreset(true);
    try {
      await applyPreset({ key: presetKey });
    } finally {
      setApplyingPreset(false);
    }
  };
  
  // SYS-004: Tìm các modules phụ thuộc vào module này (enabled)
  const getDependentModules = (moduleKey: string) => modules.filter(m => 
      m.enabled && m.dependencies?.includes(moduleKey)
    ).map(m => ({ key: m.key, name: m.name }));

  const handleToggleModule = async (key: string, enabled: boolean) => {
    setSelectedPreset('custom');
    
    // Khi tắt module, kiểm tra xem có modules con không
    if (!enabled) {
      const dependents = getDependentModules(key);
      if (dependents.length > 0) {
        const targetModule = modules.find(m => m.key === key);
        setCascadeDialog({
          dependentModules: dependents,
          isOpen: true,
          moduleKey: key,
          moduleName: targetModule?.name ?? key,
        });
        return;
      }
    }
    
    setTogglingKey(key);
    try {
      await toggleModule({ enabled, key });
    } finally {
      setTogglingKey(null);
    }
  };

  // SYS-004: Handle cascade confirm
  const handleCascadeConfirm = async () => {
    const { moduleKey, dependentModules } = cascadeDialog;
    setTogglingKey(moduleKey);
    try {
      const result = await toggleModuleWithCascade({
        cascadeKeys: dependentModules.map(d => d.key),
        enabled: false,
        key: moduleKey,
      });
      
      if (result.disabledModules.length > 0) {
        toast.success(`Đã tắt ${moduleKey} và ${result.disabledModules.length} modules phụ thuộc`);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra');
    } finally {
      setTogglingKey(null);
      setCascadeDialog({ dependentModules: [], isOpen: false, moduleKey: '', moduleName: '' });
    }
  };

  const handleCascadeCancel = () => {
    setCascadeDialog({ dependentModules: [], isOpen: false, moduleKey: '', moduleName: '' });
  };
  
  const canToggleModule = (module: AdminModule): boolean => {
    if (module.isCore) {return false;}
    if (!module.dependencies || module.dependencies.length === 0) {return true;}
    
    if (module.dependencyType === 'any') {
      return module.dependencies.some(depKey => 
        modules.find(m => m.key === depKey)?.enabled
      );
    }
      return module.dependencies.every(depKey => 
        modules.find(m => m.key === depKey)?.enabled
      );
    
  };
  
  const filteredModules = modules.filter(m => {
    const matchCategory = filterCategory === 'all' || m.category === filterCategory;
    const matchSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                       m.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });
  
  const groupedModules = filteredModules.reduce< Record<string, AdminModule[]>>((acc, module) => {
    if (!acc[module.category]) {acc[module.category] = [];}
    acc[module.category].push(module);
    return acc;
  }, {});
  
  const enabledCount = modules.filter(m => m.enabled).length;
  const disabledCount = modules.filter(m => !m.enabled).length;
  const currentPreset = presets.find(p => p.key === selectedPreset);

  if (modulesData === undefined) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-cyan-500" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{t.modules.title}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {t.modules.subtitle}
            </p>
          </div>
          
          <div className="flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <Check size={12} /> {enabledCount} {t.modules.enabled}
            </span>
            <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700">
              <X size={12} /> {disabledCount} {t.modules.disabled}
            </span>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <PresetDropdown 
            presets={presets} 
            selectedPreset={selectedPreset} 
            onSelect={handlePresetSelect}
            loading={applyingPreset}
          />
          <span className="text-xs text-slate-500">
            Preset sẽ bật/tắt modules theo mẫu; bạn có thể chỉnh lại thủ công.
          </span>
          <ConfigActions modules={modules} preset={currentPreset} />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) =>{  setSearchQuery(e.target.value); }}
            placeholder={t.modules.searchModule}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg py-2 pl-9 pr-4 text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:border-cyan-500/50 outline-none"
          />
        </div>
        
        <div className="flex gap-2 flex-wrap">
          {['all', ...Object.keys(categoryColors)].map((cat) => (
            <button 
              key={cat}
              onClick={() =>{  setFilterCategory(cat); }}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                filterCategory === cat 
                  ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-600 dark:text-cyan-400' 
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              {cat === 'all' ? t.modules.all : t.modules.categories[cat as keyof typeof t.modules.categories]}
            </button>
          ))}
        </div>
      </div>
      
      <div className="space-y-6">
        {Object.entries(groupedModules).map(([category, mods]) => (
          <div key={category}>
            <h3 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${categoryColors[category]}`}>
              {t.modules.categories[category as keyof typeof t.modules.categories]}
              <span className="text-xs font-normal text-slate-500">({(mods).length})</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(mods).map(module => (
                <ModuleCard 
                  key={module._id} 
                  module={module} 
                  onToggle={handleToggleModule}
                  canToggle={canToggleModule(module)}
                  allModules={modules}
                  isToggling={togglingKey === module.key}
                  isAnyToggling={Boolean(togglingKey)} // SYS-008: Pass to disable all
                  t={t}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      
      {filteredModules.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          <Package size={48} className="mx-auto mb-3 opacity-50" />
          <p>{t.modules.noModuleFound}</p>
        </div>
      )}

      {/* SYS-004: Cascade Confirmation Dialog */}
      <CascadeConfirmDialog
        isOpen={cascadeDialog.isOpen}
        moduleKey={cascadeDialog.moduleKey}
        moduleName={cascadeDialog.moduleName}
        dependentModules={cascadeDialog.dependentModules}
        onConfirm={handleCascadeConfirm}
        onCancel={handleCascadeCancel}
        isLoading={Boolean(togglingKey)}
      />

    </div>
  );
}
