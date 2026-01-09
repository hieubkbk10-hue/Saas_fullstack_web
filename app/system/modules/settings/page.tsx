'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { toast } from 'sonner';
import { Settings as SettingsIcon, Globe, Mail, MapPin, Share2, Loader2, Database, Trash2, RefreshCw, SettingsIcon as SettingsTab, Save } from 'lucide-react';
import { FieldConfig } from '@/types/moduleConfig';
import { 
  ModuleHeader, ModuleStatus, ConventionNote, Code,
  SettingsCard, SettingInput,
  FeaturesCard, FieldsCard
} from '@/components/modules/shared';
import { Card, Badge, Button, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Input } from '@/app/admin/components/ui';

const MODULE_KEY = 'settings';

const FEATURES_CONFIG = [
  { key: 'enableContact', label: 'Thông tin liên hệ', icon: MapPin },
  { key: 'enableSEO', label: 'SEO cơ bản', icon: Globe },
  { key: 'enableSocial', label: 'Mạng xã hội', icon: Share2 },
  { key: 'enableMail', label: 'Cấu hình Email', icon: Mail },
];

type FeaturesState = Record<string, boolean>;
type TabType = 'config' | 'data';

export default function SettingsModuleConfigPage() {
  const [activeTab, setActiveTab] = useState<TabType>('config');

  // Queries
  const moduleData = useQuery(api.admin.modules.getModuleByKey, { key: MODULE_KEY });
  const featuresData = useQuery(api.admin.modules.listModuleFeatures, { moduleKey: MODULE_KEY });
  const fieldsData = useQuery(api.admin.modules.listModuleFields, { moduleKey: MODULE_KEY });
  const moduleSettingsData = useQuery(api.admin.modules.listModuleSettings, { moduleKey: MODULE_KEY });

  // Data tab queries - settings key-value store
  const settingsData = useQuery(api.settings.listAll);
  const settingsGroups = useQuery(api.settings.listGroups);

  // Mutations
  const toggleFeature = useMutation(api.admin.modules.toggleModuleFeature);
  const updateField = useMutation(api.admin.modules.updateModuleField);
  const setModuleSetting = useMutation(api.admin.modules.setModuleSetting);
  const setSetting = useMutation(api.settings.set);
  const seedSettingsModule = useMutation(api.seed.seedSettingsModule);
  const clearSettingsData = useMutation(api.seed.clearSettingsData);
  const clearSettingsConfig = useMutation(api.seed.clearSettingsConfig);

  // Local state
  const [localFeatures, setLocalFeatures] = useState<FeaturesState>({});
  const [localFields, setLocalFields] = useState<FieldConfig[]>([]);
  const [localModuleSettings, setLocalModuleSettings] = useState({ cacheEnabled: true, cacheDuration: 3600 });
  const [isSaving, setIsSaving] = useState(false);

  // Editable settings values + dirty tracking
  const [editingSettings, setEditingSettings] = useState<Record<string, string>>({});
  const [originalSettings, setOriginalSettings] = useState<Record<string, string>>({});
  const [isSavingData, setIsSavingData] = useState(false);

  const isLoading = moduleData === undefined || featuresData === undefined || 
                    fieldsData === undefined || moduleSettingsData === undefined;

  // Sync features
  useEffect(() => {
    if (featuresData) {
      const features: FeaturesState = {};
      featuresData.forEach(f => { features[f.featureKey] = f.enabled; });
      setLocalFeatures(features);
    }
  }, [featuresData]);

  // Sync fields
  useEffect(() => {
    if (fieldsData) {
      setLocalFields(fieldsData.map(f => ({
        id: f._id,
        key: f.fieldKey,
        name: f.name,
        type: f.type,
        required: f.required,
        enabled: f.enabled,
        isSystem: f.isSystem,
        linkedFeature: f.linkedFeature,
        group: f.group,
      })));
    }
  }, [fieldsData]);

  // Sync module settings
  useEffect(() => {
    if (moduleSettingsData) {
      const cacheEnabled = moduleSettingsData.find(s => s.settingKey === 'cacheEnabled')?.value as boolean ?? true;
      const cacheDuration = moduleSettingsData.find(s => s.settingKey === 'cacheDuration')?.value as number ?? 3600;
      setLocalModuleSettings({ cacheEnabled, cacheDuration });
    }
  }, [moduleSettingsData]);

  // Sync editing settings
  useEffect(() => {
    if (settingsData) {
      const values: Record<string, string> = {};
      settingsData.forEach(s => { 
        values[s.key] = typeof s.value === 'string' ? s.value : JSON.stringify(s.value); 
      });
      setEditingSettings(values);
      setOriginalSettings(values);
    }
  }, [settingsData]);

  // Server state for comparison
  const serverFeatures = useMemo(() => {
    const result: FeaturesState = {};
    featuresData?.forEach(f => { result[f.featureKey] = f.enabled; });
    return result;
  }, [featuresData]);

  const serverFields = useMemo(() => {
    return fieldsData?.map(f => ({ id: f._id, enabled: f.enabled })) || [];
  }, [fieldsData]);

  const serverModuleSettings = useMemo(() => {
    const cacheEnabled = moduleSettingsData?.find(s => s.settingKey === 'cacheEnabled')?.value as boolean ?? true;
    const cacheDuration = moduleSettingsData?.find(s => s.settingKey === 'cacheDuration')?.value as number ?? 3600;
    return { cacheEnabled, cacheDuration };
  }, [moduleSettingsData]);

  // Check for changes
  const hasChanges = useMemo(() => {
    const featuresChanged = Object.keys(localFeatures).some(key => localFeatures[key] !== serverFeatures[key]);
    const fieldsChanged = localFields.some(f => {
      const server = serverFields.find(s => s.id === f.id);
      return server && f.enabled !== server.enabled;
    });
    const settingsChanged = localModuleSettings.cacheEnabled !== serverModuleSettings.cacheEnabled ||
                           localModuleSettings.cacheDuration !== serverModuleSettings.cacheDuration;
    return featuresChanged || fieldsChanged || settingsChanged;
  }, [localFeatures, serverFeatures, localFields, serverFields, localModuleSettings, serverModuleSettings]);

  const handleToggleFeature = (key: string) => {
    const newFeatureState = !localFeatures[key];
    setLocalFeatures(prev => ({ ...prev, [key]: newFeatureState }));
    // Khi toggle feature -> toggle tất cả fields liên quan
    setLocalFields(prev => prev.map(f => 
      f.linkedFeature === key ? { ...f, enabled: newFeatureState } : f
    ));
  };

  const handleToggleField = (id: string) => {
    const field = localFields.find(f => f.id === id);
    if (!field) return;
    
    const newFieldState = !field.enabled;
    
    // Toggle field riêng lẻ (không toggle feature)
    setLocalFields(prev => {
      const updated = prev.map(f => f.id === id ? { ...f, enabled: newFieldState } : f);
      
      // Nếu field có linkedFeature, kiểm tra xem tất cả fields của feature đó có tắt hết không
      if (field.linkedFeature) {
        const linkedFields = updated.filter(f => f.linkedFeature === field.linkedFeature);
        const allDisabled = linkedFields.every(f => !f.enabled);
        const anyEnabled = linkedFields.some(f => f.enabled);
        
        // Chỉ tắt feature khi TẤT CẢ fields đều tắt
        if (allDisabled) {
          setLocalFeatures(prevFeatures => ({ ...prevFeatures, [field.linkedFeature!]: false }));
        }
        // Bật feature khi có ít nhất 1 field được bật
        else if (anyEnabled) {
          setLocalFeatures(prevFeatures => ({ ...prevFeatures, [field.linkedFeature!]: true }));
        }
      }
      
      return updated;
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Save features
      for (const key of Object.keys(localFeatures)) {
        if (localFeatures[key] !== serverFeatures[key]) {
          await toggleFeature({ moduleKey: MODULE_KEY, featureKey: key, enabled: localFeatures[key] });
        }
      }
      // Save fields
      for (const field of localFields) {
        const server = serverFields.find(s => s.id === field.id);
        if (server && field.enabled !== server.enabled) {
          await updateField({ id: field.id as any, enabled: field.enabled });
        }
      }
      // Save module settings
      if (localModuleSettings.cacheEnabled !== serverModuleSettings.cacheEnabled) {
        await setModuleSetting({ moduleKey: MODULE_KEY, settingKey: 'cacheEnabled', value: localModuleSettings.cacheEnabled });
      }
      if (localModuleSettings.cacheDuration !== serverModuleSettings.cacheDuration) {
        await setModuleSetting({ moduleKey: MODULE_KEY, settingKey: 'cacheDuration', value: localModuleSettings.cacheDuration });
      }
      toast.success('Đã lưu cấu hình thành công!');
    } catch {
      toast.error('Có lỗi xảy ra khi lưu cấu hình');
    } finally {
      setIsSaving(false);
    }
  };

  // Track dirty settings
  const dirtySettings = useMemo(() => {
    const dirty = new Set<string>();
    Object.keys(editingSettings).forEach(key => {
      if (editingSettings[key] !== originalSettings[key]) {
        dirty.add(key);
      }
    });
    return dirty;
  }, [editingSettings, originalSettings]);

  const hasDataChanges = dirtySettings.size > 0;

  // Save single setting value
  const handleSaveSetting = async (key: string, group: string) => {
    const value = editingSettings[key];
    await setSetting({ key, value, group });
    setOriginalSettings(prev => ({ ...prev, [key]: value }));
    toast.success(`Đã lưu ${key}`);
  };

  // Save all dirty settings
  const handleSaveAllDirty = async () => {
    if (dirtySettings.size === 0) return;
    
    setIsSavingData(true);
    try {
      for (const key of dirtySettings) {
        const setting = settingsData?.find(s => s.key === key);
        if (setting) {
          await setSetting({ key, value: editingSettings[key], group: setting.group });
        }
      }
      setOriginalSettings({ ...editingSettings });
      toast.success(`Đã lưu ${dirtySettings.size} settings`);
    } catch (error) {
      console.error('Save all settings error:', error);
      toast.error('Có lỗi khi lưu settings');
    } finally {
      setIsSavingData(false);
    }
  };

  // Data tab handlers
  const handleSeedAll = async () => {
    toast.loading('Đang tạo dữ liệu...');
    await seedSettingsModule();
    toast.dismiss();
    toast.success('Đã tạo dữ liệu thành công!');
  };

  const handleClearData = async () => {
    if (!confirm('Xóa toàn bộ settings?')) return;
    toast.loading('Đang xóa dữ liệu...');
    await clearSettingsData();
    toast.dismiss();
    toast.success('Đã xóa toàn bộ settings!');
  };

  const handleResetAll = async () => {
    if (!confirm('Reset toàn bộ dữ liệu và cấu hình?')) return;
    toast.loading('Đang reset...');
    await clearSettingsData();
    await clearSettingsConfig();
    await seedSettingsModule();
    toast.dismiss();
    toast.success('Đã reset thành công!');
  };

  // Group fields by group
  const fieldsByGroup = useMemo(() => {
    const groups: Record<string, FieldConfig[]> = {
      site: [],
      contact: [],
      seo: [],
      social: [],
      mail: [],
    };
    localFields.forEach(f => {
      const group = f.group || 'site';
      if (groups[group]) {
        groups[group].push(f);
      }
    });
    return groups;
  }, [localFields]);

  // Settings by group
  const settingsByGroup = useMemo(() => {
    const groups: Record<string, typeof settingsData> = {};
    settingsData?.forEach(s => {
      if (!groups[s.group]) groups[s.group] = [];
      groups[s.group]!.push(s);
    });
    return groups;
  }, [settingsData]);

  // Statistics
  const stats = useMemo(() => {
    const total = settingsData?.length ?? 0;
    const groups = settingsGroups?.length ?? 0;
    const filled = settingsData?.filter(s => s.value && s.value !== '').length ?? 0;
    return { total, groups, filled };
  }, [settingsData, settingsGroups]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-orange-500" />
      </div>
    );
  }

  // Check if config is seeded
  const hasConfig = featuresData && featuresData.length > 0;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <ModuleHeader
        icon={SettingsIcon}
        title="Module Cài đặt hệ thống"
        description="Cấu hình thông tin website, liên hệ, SEO, mạng xã hội"
        iconBgClass="bg-orange-500/10"
        iconTextClass="text-orange-600 dark:text-orange-400"
        buttonClass="bg-orange-600 hover:bg-orange-500"
        onSave={activeTab === 'config' && hasConfig ? handleSave : undefined}
        hasChanges={activeTab === 'config' ? hasChanges : false}
        isSaving={isSaving}
      />

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700">
        <button
          onClick={() => setActiveTab('config')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'config'
              ? 'border-orange-500 text-orange-600 dark:text-orange-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <SettingsTab size={16} /> Cấu hình Module
        </button>
        <button
          onClick={() => setActiveTab('data')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'data'
              ? 'border-orange-500 text-orange-600 dark:text-orange-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Database size={16} /> Dữ liệu Settings
        </button>
      </div>

      {activeTab === 'config' && (
        <>
          {!hasConfig ? (
            <Card className="p-8 text-center">
              <SettingsIcon size={48} className="mx-auto text-slate-300 mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">Chưa có cấu hình module</h3>
              <p className="text-slate-500 mb-4">Nhấn nút bên dưới để khởi tạo cấu hình cho module Cài đặt</p>
              <Button onClick={handleSeedAll} className="bg-orange-600 hover:bg-orange-500">
                <Database size={16} className="mr-2" /> Khởi tạo cấu hình
              </Button>
            </Card>
          ) : (
            <>
              <ModuleStatus isCore={moduleData?.isCore ?? true} enabled={moduleData?.enabled ?? true} toggleColor="bg-orange-500" />

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                <div className="space-y-4">
                  <SettingsCard>
                    <SettingInput 
                      label="Cache duration (s)" 
                      value={localModuleSettings.cacheDuration} 
                      onChange={(v) => setLocalModuleSettings({...localModuleSettings, cacheDuration: v})}
                      focusColor="focus:border-orange-500"
                    />
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-slate-600 dark:text-slate-300">Bật cache</span>
                      <button
                        onClick={() => setLocalModuleSettings({...localModuleSettings, cacheEnabled: !localModuleSettings.cacheEnabled})}
                        className={`w-10 h-5 rounded-full transition-colors ${localModuleSettings.cacheEnabled ? 'bg-orange-500' : 'bg-slate-300'}`}
                      >
                        <span className={`block w-4 h-4 rounded-full bg-white transform transition-transform ${localModuleSettings.cacheEnabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
                      </button>
                    </div>
                  </SettingsCard>

                  <FeaturesCard
                    features={FEATURES_CONFIG.map(f => ({ config: f, enabled: localFeatures[f.key] ?? false }))}
                    onToggle={handleToggleFeature}
                    toggleColor="bg-orange-500"
                  />
                </div>

                <FieldsCard
                  title="Website"
                  icon={Globe}
                  iconColorClass="text-orange-500"
                  fields={fieldsByGroup.site}
                  onToggle={handleToggleField}
                  fieldColorClass="bg-orange-500/10 text-orange-600 dark:text-orange-400"
                  toggleColor="bg-orange-500"
                />

                <FieldsCard
                  title="Liên hệ & SEO"
                  icon={MapPin}
                  iconColorClass="text-cyan-500"
                  fields={[...fieldsByGroup.contact, ...fieldsByGroup.seo]}
                  onToggle={handleToggleField}
                  fieldColorClass="bg-cyan-500/10 text-cyan-600 dark:text-cyan-400"
                  toggleColor="bg-cyan-500"
                />

                <FieldsCard
                  title="Social & Mail"
                  icon={Share2}
                  iconColorClass="text-purple-500"
                  fields={[...fieldsByGroup.social, ...fieldsByGroup.mail]}
                  onToggle={handleToggleField}
                  fieldColorClass="bg-purple-500/10 text-purple-600 dark:text-purple-400"
                  toggleColor="bg-purple-500"
                />
              </div>

              <ConventionNote>
                <strong>Convention:</strong> Settings lưu dạng key-value với group. 
                Module này là <Code>isCore: true</Code> - không thể tắt.
              </ConventionNote>
            </>
          )}
        </>
      )}

      {activeTab === 'data' && (
        <div className="space-y-6">
          {/* Action buttons */}
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">Quản lý dữ liệu</h3>
                <p className="text-sm text-slate-500 mt-1">Seed, clear hoặc reset dữ liệu settings</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleSeedAll} className="gap-2">
                  <Database size={16} /> Seed All
                </Button>
                <Button variant="outline" onClick={handleClearData} className="gap-2 text-red-500 hover:text-red-600">
                  <Trash2 size={16} /> Clear
                </Button>
                <Button onClick={handleResetAll} className="gap-2 bg-orange-600 hover:bg-orange-500">
                  <RefreshCw size={16} /> Reset
                </Button>
              </div>
            </div>
          </Card>

          {/* Statistics */}
          <div className="grid grid-cols-4 gap-4">
            <Card className="p-4">
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.total}</p>
              <p className="text-sm text-slate-500">Tổng settings</p>
            </Card>
            <Card className="p-4">
              <p className="text-2xl font-bold text-orange-600">{stats.groups}</p>
              <p className="text-sm text-slate-500">Nhóm</p>
            </Card>
            <Card className="p-4">
              <p className="text-2xl font-bold text-emerald-600">{stats.filled}</p>
              <p className="text-sm text-slate-500">Đã điền</p>
            </Card>
            <Card className="p-4">
              <p className="text-2xl font-bold text-amber-600">{dirtySettings.size}</p>
              <p className="text-sm text-slate-500">Chưa lưu</p>
            </Card>
          </div>

          {/* Save All Button - show when has changes */}
          {hasDataChanges && (
            <Card className="p-4 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  <span className="text-sm text-amber-700 dark:text-amber-400">
                    Có {dirtySettings.size} thay đổi chưa lưu
                  </span>
                </div>
                <Button 
                  onClick={handleSaveAllDirty} 
                  disabled={isSavingData}
                  className="gap-2 bg-amber-600 hover:bg-amber-500"
                >
                  {isSavingData ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}
                  Lưu tất cả ({dirtySettings.size})
                </Button>
              </div>
            </Card>
          )}

          {/* Settings by Group */}
          {settingsGroups?.map(group => (
            <Card key={group}>
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                <Badge variant="secondary" className="capitalize">{group}</Badge>
                <span className="text-sm text-slate-500">({settingsByGroup[group]?.length ?? 0} settings)</span>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Key</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead className="w-[100px]">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {settingsByGroup[group]?.map(setting => {
                    const isDirty = dirtySettings.has(setting.key);
                    return (
                      <TableRow key={setting._id} className={isDirty ? 'bg-amber-50 dark:bg-amber-950/20' : ''}>
                        <TableCell className="font-mono text-sm">
                          {setting.key}
                          {isDirty && <span className="ml-2 text-amber-500">*</span>}
                        </TableCell>
                        <TableCell>
                          <Input
                            value={editingSettings[setting.key] ?? ''}
                            onChange={(e) => setEditingSettings(prev => ({ ...prev, [setting.key]: e.target.value }))}
                            className={`h-8 ${isDirty ? 'border-amber-400 dark:border-amber-600' : ''}`}
                          />
                        </TableCell>
                        <TableCell>
                          <Button 
                            size="sm" 
                            variant={isDirty ? 'default' : 'outline'}
                            onClick={() => handleSaveSetting(setting.key, setting.group)}
                            disabled={!isDirty}
                            className={isDirty ? 'bg-amber-600 hover:bg-amber-500' : ''}
                          >
                            Lưu
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Card>
          ))}

          {(!settingsData || settingsData.length === 0) && (
            <Card className="p-8 text-center text-slate-500">
              Chưa có settings nào. Nhấn &quot;Seed All&quot; để tạo dữ liệu mẫu.
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
