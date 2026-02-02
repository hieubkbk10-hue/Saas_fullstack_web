 'use client';
 
 import React, { useState } from 'react';
 import { useMutation } from 'convex/react';
 import { api } from '@/convex/_generated/api';
 import { toast } from 'sonner';
 import { Database, Settings, Palette, Trash2, RefreshCw, Loader2, FolderTree } from 'lucide-react';
 import type { ModuleDefinition } from '@/lib/modules/define-module';
import type { FieldConfig } from '@/types/module-config';
 import { useModuleConfig } from '@/lib/modules/hooks/useModuleConfig';
 import { 
   ModuleHeader, 
   ModuleStatus, 
   ConventionNote,
   SettingsCard, 
   SettingInput, 
   SettingSelect,
   FeaturesCard,
   FieldsCard,
 } from '@/components/modules/shared';
 import { Card, Button, cn } from '@/app/admin/components/ui';
 
 type TabType = 'config' | 'data' | 'appearance';
 
export interface ModuleConfigPageRenderProps {
  config: ModuleDefinition;
  colorClasses: ReturnType<typeof getColorClasses>;
  isSaving: boolean;
  setIsSaving: (v: boolean) => void;
}

 interface ModuleConfigPageProps {
   config: ModuleDefinition;
  renderDataTab?: (props: ModuleConfigPageRenderProps) => React.ReactNode;
  renderAppearanceTab?: (props: ModuleConfigPageRenderProps) => React.ReactNode;
  onAppearanceSave?: () => Promise<void>;
  appearanceHasChanges?: boolean;
 }
 
export function ModuleConfigPage({ 
  config, 
  renderDataTab, 
  renderAppearanceTab,
  onAppearanceSave,
  appearanceHasChanges = false,
}: ModuleConfigPageProps) {
   const [activeTab, setActiveTab] = useState<TabType>('config');
  const [isSaving, setIsSaving] = useState(false);
   
   const {
     moduleData,
     localFeatures,
     localFields,
     localCategoryFields,
     localSettings,
     isLoading,
    isSaving: isConfigSaving,
     hasChanges,
     handleToggleFeature,
     handleToggleField,
     handleToggleCategoryField,
     handleSettingChange,
     handleSave,
   } = useModuleConfig(config);
   
   const colorClasses = getColorClasses(config.color);
   const tabs = config.tabs ?? ['config', 'data'];
  
  const renderProps: ModuleConfigPageRenderProps = {
    config,
    colorClasses,
    isSaving,
    setIsSaving,
  };
  
  const handleAppearanceSave = async () => {
    if (!onAppearanceSave) return;
    setIsSaving(true);
    try {
      await onAppearanceSave();
    } finally {
      setIsSaving(false);
    }
  };
   
   if (isLoading) {
     return (
       <div className="flex items-center justify-center h-64">
         <Loader2 size={32} className="animate-spin text-slate-400" />
       </div>
     );
   }
   
   return (
     <div className="space-y-6 max-w-5xl mx-auto">
       <ModuleHeader
         icon={config.icon}
         title={`Module ${config.name}`}
         description={config.description}
         iconBgClass={colorClasses.iconBg}
         iconTextClass={colorClasses.iconText}
         buttonClass={colorClasses.button}
        onSave={activeTab === 'config' ? handleSave : (activeTab === 'appearance' && onAppearanceSave ? handleAppearanceSave : undefined)}
        hasChanges={activeTab === 'config' ? hasChanges : (activeTab === 'appearance' ? appearanceHasChanges : false)}
        isSaving={isConfigSaving || isSaving}
       />
       
       {tabs.length > 1 && (
         <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700">
           {tabs.includes('config') && (
             <TabButton
               active={activeTab === 'config'}
               onClick={() => setActiveTab('config')}
               icon={Settings}
               label="Cấu hình"
               colorClass={colorClasses.tab}
             />
           )}
           {tabs.includes('data') && (
             <TabButton
               active={activeTab === 'data'}
               onClick={() => setActiveTab('data')}
               icon={Database}
               label="Dữ liệu"
               colorClass={colorClasses.tab}
             />
           )}
           {tabs.includes('appearance') && (
             <TabButton
               active={activeTab === 'appearance'}
               onClick={() => setActiveTab('appearance')}
               icon={Palette}
               label="Giao diện"
               colorClass={colorClasses.tab}
             />
           )}
         </div>
       )}
       
       {activeTab === 'config' && (
         <ConfigTab
           config={config}
           moduleData={moduleData}
           localFeatures={localFeatures}
           localFields={localFields}
           localCategoryFields={localCategoryFields}
           localSettings={localSettings}
           colorClasses={colorClasses}
           onToggleFeature={handleToggleFeature}
           onToggleField={handleToggleField}
           onToggleCategoryField={handleToggleCategoryField}
           onSettingChange={handleSettingChange}
         />
       )}
       
       {activeTab === 'data' && (
        renderDataTab ? renderDataTab(renderProps) : <DataTab config={config} colorClasses={colorClasses} />
       )}
       
       {activeTab === 'appearance' && (
        renderAppearanceTab ? renderAppearanceTab(renderProps) : <AppearanceTab />
       )}
     </div>
   );
 }
 
 function TabButton({ active, onClick, icon: Icon, label, colorClass }: {
   active: boolean;
   onClick: () => void;
   icon: React.ComponentType<{ size?: number }>;
   label: string;
   colorClass: string;
 }) {
   return (
     <button
       type="button"
       onClick={onClick}
       className={cn(
         "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-[2px] transition-colors",
         active
           ? `${colorClass} text-slate-900 dark:text-slate-100`
           : "border-transparent text-slate-500 hover:text-slate-700"
       )}
     >
       <Icon size={16} />
       {label}
     </button>
   );
 }
 
 function ConfigTab({ config, moduleData, localFeatures, localFields, localCategoryFields, localSettings, colorClasses, onToggleFeature, onToggleField, onToggleCategoryField, onSettingChange }: {
   config: ModuleDefinition;
   moduleData: { isCore?: boolean; enabled?: boolean } | null | undefined;
   localFeatures: Record<string, boolean>;
  localFields: FieldConfig[];
  localCategoryFields: FieldConfig[];
   localSettings: Record<string, string | number | boolean>;
   colorClasses: ReturnType<typeof getColorClasses>;
   onToggleFeature: (key: string) => void;
   onToggleField: (key: string) => void;
   onToggleCategoryField: (key: string) => void;
   onSettingChange: (key: string, value: string | number | boolean) => void;
 }) {
   return (
     <>
       <ModuleStatus 
         isCore={moduleData?.isCore ?? false} 
         enabled={moduleData?.enabled ?? true} 
         toggleColor={colorClasses.toggle}
       />
       
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
         <div className="space-y-4">
           {config.settings && config.settings.length > 0 && (
             <SettingsCard>
               {config.settings.map(setting => (
                 setting.type === 'select' ? (
                   <SettingSelect
                     key={setting.key}
                     label={setting.label}
                     value={String(localSettings[setting.key] ?? '')}
                     onChange={(v) => onSettingChange(setting.key, v)}
                     options={setting.options ?? []}
                   />
                 ) : (
                   <SettingInput
                     key={setting.key}
                     label={setting.label}
                     value={Number(localSettings[setting.key] ?? 0)}
                     onChange={(v) => onSettingChange(setting.key, v)}
                   />
                 )
               ))}
             </SettingsCard>
           )}
           
           {config.features && config.features.length > 0 && (
             <FeaturesCard
               features={config.features.map(f => ({
                 config: { 
                   key: f.key, 
                   label: f.label, 
                   icon: f.icon ?? Settings,
                   linkedField: f.linkedField,
                   description: f.description,
                 },
                 enabled: localFeatures[f.key] ?? false,
               }))}
               onToggle={onToggleFeature}
               toggleColor={colorClasses.toggle}
             />
           )}
         </div>
         
         <FieldsCard
           title={`Trường ${config.name}`}
           icon={config.icon}
           iconColorClass={colorClasses.iconText}
           fields={localFields}
           onToggle={onToggleField}
           fieldColorClass={colorClasses.fieldColor}
           toggleColor={colorClasses.toggle}
         />
         
         {config.categoryModuleKey && localCategoryFields.length > 0 && (
           <FieldsCard
             title="Trường danh mục"
             icon={FolderTree}
             iconColorClass="text-slate-500"
             fields={localCategoryFields}
             onToggle={onToggleCategoryField}
             fieldColorClass={colorClasses.fieldColor}
             toggleColor={colorClasses.toggle}
           />
         )}
       </div>
       
       {config.conventionNote && (
         <ConventionNote>
           <strong>Convention:</strong> {config.conventionNote}
         </ConventionNote>
       )}
     </>
   );
 }
 
 function DataTab({ config, colorClasses }: {
   config: ModuleDefinition;
   colorClasses: ReturnType<typeof getColorClasses>;
 }) {
   const [isSeeding, setIsSeeding] = useState(false);
   const [isClearing, setIsClearing] = useState(false);
   
   const moduleKey = config.key;
   const capitalizedKey = moduleKey.charAt(0).toUpperCase() + moduleKey.slice(1);
   
   const seedMutationKey = `seed${capitalizedKey}Module` as keyof typeof api.seed;
   const clearMutationKey = `clear${capitalizedKey}Data` as keyof typeof api.seed;
   
   const hasSeedMutation = seedMutationKey in api.seed;
   const hasClearMutation = clearMutationKey in api.seed;
   
   const seedModule = useMutation(
     hasSeedMutation 
       ? api.seed[seedMutationKey] as typeof api.seed.seedPostsModule
       : api.seed.seedPostsModule
   );
   const clearData = useMutation(
     hasClearMutation
       ? api.seed[clearMutationKey] as typeof api.seed.clearPostsData
       : api.seed.clearPostsData
   );
   
   const handleSeed = async () => {
     if (!hasSeedMutation) {
       toast.error(`Chưa có mutation seed${capitalizedKey}Module`);
       return;
     }
     setIsSeeding(true);
     try {
       await seedModule({});
       toast.success('Đã tạo dữ liệu mẫu!');
     } catch (error) {
       toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra');
     } finally {
       setIsSeeding(false);
     }
   };
   
   const handleClear = async () => {
     if (!hasClearMutation) {
       toast.error(`Chưa có mutation clear${capitalizedKey}Data`);
       return;
     }
     if (!confirm('Bạn có chắc muốn xóa toàn bộ dữ liệu?')) return;
     setIsClearing(true);
     try {
       await clearData({});
       toast.success('Đã xóa dữ liệu!');
     } catch (error) {
       toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra');
     } finally {
       setIsClearing(false);
     }
   };
   
   const handleReset = async () => {
     if (!hasSeedMutation || !hasClearMutation) {
       toast.error('Chưa có đầy đủ mutations');
       return;
     }
     if (!confirm('Bạn có chắc muốn reset dữ liệu về mặc định?')) return;
     setIsClearing(true);
     try {
       await clearData({});
       await seedModule({});
       toast.success('Đã reset dữ liệu!');
     } catch (error) {
       toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra');
     } finally {
       setIsClearing(false);
     }
   };
   
   return (
     <div className="space-y-6">
       <Card className="p-4">
         <div className="flex items-center justify-between">
           <div>
             <h3 className="font-semibold text-slate-900 dark:text-slate-100">
               Quản lý dữ liệu mẫu
             </h3>
             <p className="text-sm text-slate-500 mt-1">
               Seed, clear hoặc reset dữ liệu module
             </p>
           </div>
           <div className="flex gap-2">
             <Button 
               variant="outline" 
               onClick={handleSeed}
               disabled={isSeeding || !hasSeedMutation}
               className="gap-2"
             >
               {isSeeding ? <Loader2 size={16} className="animate-spin" /> : <Database size={16} />}
               Seed Data
             </Button>
             <Button 
               variant="outline" 
               onClick={handleClear}
               disabled={isClearing || !hasClearMutation}
               className="gap-2 text-red-500 hover:text-red-600"
             >
               {isClearing ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
               Clear All
             </Button>
             <Button 
               onClick={handleReset}
               disabled={isClearing || isSeeding || !hasSeedMutation || !hasClearMutation}
               className={cn("gap-2", colorClasses.button, "text-white")}
             >
               <RefreshCw size={16} />
               Reset
             </Button>
           </div>
         </div>
       </Card>
       
       <Card className="p-8 text-center text-slate-500">
         <Database size={48} className="mx-auto mb-4 opacity-50" />
         <p>Thống kê và preview dữ liệu sẽ hiển thị ở đây</p>
       </Card>
     </div>
   );
 }
 
 function AppearanceTab() {
   return (
     <Card className="p-8 text-center text-slate-500">
       <Palette size={48} className="mx-auto mb-4 opacity-50" />
       <p>Cấu hình giao diện sẽ hiển thị ở đây</p>
     </Card>
   );
 }
 
 function getColorClasses(color: string) {
   const colorMap: Record<string, {
     iconBg: string;
     iconText: string;
     button: string;
     toggle: string;
     tab: string;
     fieldColor: string;
   }> = {
     cyan: {
       iconBg: 'bg-cyan-500/10',
       iconText: 'text-cyan-600 dark:text-cyan-400',
       button: 'bg-cyan-600 hover:bg-cyan-500',
       toggle: 'bg-cyan-500',
       tab: 'border-cyan-500',
       fieldColor: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
     },
     orange: {
       iconBg: 'bg-orange-500/10',
       iconText: 'text-orange-600 dark:text-orange-400',
       button: 'bg-orange-600 hover:bg-orange-500',
       toggle: 'bg-orange-500',
       tab: 'border-orange-500',
       fieldColor: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
     },
     violet: {
       iconBg: 'bg-violet-500/10',
       iconText: 'text-violet-600 dark:text-violet-400',
       button: 'bg-violet-600 hover:bg-violet-500',
       toggle: 'bg-violet-500',
       tab: 'border-violet-500',
       fieldColor: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
     },
     emerald: {
       iconBg: 'bg-emerald-500/10',
       iconText: 'text-emerald-600 dark:text-emerald-400',
       button: 'bg-emerald-600 hover:bg-emerald-500',
       toggle: 'bg-emerald-500',
       tab: 'border-emerald-500',
       fieldColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
     },
     rose: {
       iconBg: 'bg-rose-500/10',
       iconText: 'text-rose-600 dark:text-rose-400',
       button: 'bg-rose-600 hover:bg-rose-500',
       toggle: 'bg-rose-500',
       tab: 'border-rose-500',
       fieldColor: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
     },
     blue: {
       iconBg: 'bg-blue-500/10',
       iconText: 'text-blue-600 dark:text-blue-400',
       button: 'bg-blue-600 hover:bg-blue-500',
       toggle: 'bg-blue-500',
       tab: 'border-blue-500',
       fieldColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
     },
     amber: {
       iconBg: 'bg-amber-500/10',
       iconText: 'text-amber-600 dark:text-amber-400',
       button: 'bg-amber-600 hover:bg-amber-500',
       toggle: 'bg-amber-500',
       tab: 'border-amber-500',
       fieldColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
     },
     indigo: {
       iconBg: 'bg-indigo-500/10',
       iconText: 'text-indigo-600 dark:text-indigo-400',
       button: 'bg-indigo-600 hover:bg-indigo-500',
       toggle: 'bg-indigo-500',
       tab: 'border-indigo-500',
       fieldColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
     },
   };
   
   return colorMap[color] ?? colorMap.blue;
 }
