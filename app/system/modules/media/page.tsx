'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { toast } from 'sonner';
import { Image, FolderTree, Type, Ruler, Loader2, Database, Trash2, RefreshCw, Settings, FileVideo, FileText, HardDrive } from 'lucide-react';
import { FieldConfig } from '@/types/moduleConfig';
import { 
  ModuleHeader, ModuleStatus, ConventionNote, Code,
  SettingsCard, SettingInput,
  FeaturesCard, FieldsCard
} from '@/components/modules/shared';
import { Card, Badge, Button, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/app/admin/components/ui';

const MODULE_KEY = 'media';

const FEATURES_CONFIG = [
  { key: 'enableFolders', label: 'Thư mục', icon: FolderTree, linkedField: 'folder' },
  { key: 'enableAltText', label: 'Alt Text', icon: Type, linkedField: 'alt' },
  { key: 'enableDimensions', label: 'Kích thước ảnh', icon: Ruler, linkedField: 'dimensions' },
];

type FeaturesState = Record<string, boolean>;
type SettingsState = { itemsPerPage: number; maxFileSize: number };
type TabType = 'config' | 'data';

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default function MediaModuleConfigPage() {
  const [activeTab, setActiveTab] = useState<TabType>('config');
  
  const moduleData = useQuery(api.admin.modules.getModuleByKey, { key: MODULE_KEY });
  const featuresData = useQuery(api.admin.modules.listModuleFeatures, { moduleKey: MODULE_KEY });
  const fieldsData = useQuery(api.admin.modules.listModuleFields, { moduleKey: MODULE_KEY });
  const settingsData = useQuery(api.admin.modules.listModuleSettings, { moduleKey: MODULE_KEY });

  // Data tab queries
  const mediaData = useQuery(api.media.listAll);
  const statsData = useQuery(api.media.getStats);
  const foldersData = useQuery(api.media.getFolders);

  const toggleFeature = useMutation(api.admin.modules.toggleModuleFeature);
  const updateField = useMutation(api.admin.modules.updateModuleField);
  const setSetting = useMutation(api.admin.modules.setModuleSetting);
  const seedMediaModule = useMutation(api.seed.seedMediaModule);
  const clearMediaData = useMutation(api.seed.clearMediaData);
  const syncMediaCounters = useMutation(api.seed.syncMediaCounters);

  const [localFeatures, setLocalFeatures] = useState<FeaturesState>({});
  const [localFields, setLocalFields] = useState<FieldConfig[]>([]);
  const [localSettings, setLocalSettings] = useState<SettingsState>({ itemsPerPage: 24, maxFileSize: 5 });
  const [isSaving, setIsSaving] = useState(false);

  const isLoading = moduleData === undefined || featuresData === undefined || 
                    fieldsData === undefined || settingsData === undefined;

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
      })));
    }
  }, [fieldsData]);

  // Sync settings
  useEffect(() => {
    if (settingsData) {
      const itemsPerPage = settingsData.find(s => s.settingKey === 'itemsPerPage')?.value as number ?? 24;
      const maxFileSize = settingsData.find(s => s.settingKey === 'maxFileSize')?.value as number ?? 5;
      setLocalSettings({ itemsPerPage, maxFileSize });
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

  const serverSettings = useMemo(() => {
    const itemsPerPage = settingsData?.find(s => s.settingKey === 'itemsPerPage')?.value as number ?? 24;
    const maxFileSize = settingsData?.find(s => s.settingKey === 'maxFileSize')?.value as number ?? 5;
    return { itemsPerPage, maxFileSize };
  }, [settingsData]);

  // Check for changes
  const hasChanges = useMemo(() => {
    const featuresChanged = Object.keys(localFeatures).some(key => localFeatures[key] !== serverFeatures[key]);
    const fieldsChanged = localFields.some(f => {
      const server = serverFields.find(s => s.id === f.id);
      return server && f.enabled !== server.enabled;
    });
    const settingsChanged = localSettings.itemsPerPage !== serverSettings.itemsPerPage ||
                           localSettings.maxFileSize !== serverSettings.maxFileSize;
    return featuresChanged || fieldsChanged || settingsChanged;
  }, [localFeatures, serverFeatures, localFields, serverFields, localSettings, serverSettings]);

  const handleToggleFeature = (key: string) => {
    setLocalFeatures(prev => ({ ...prev, [key]: !prev[key] }));
    setLocalFields(prev => prev.map(f => 
      f.linkedFeature === key ? { ...f, enabled: !localFeatures[key] } : f
    ));
  };

  const handleToggleField = (id: string) => {
    const field = localFields.find(f => f.id === id);
    if (field?.linkedFeature) {
      handleToggleFeature(field.linkedFeature);
    } else {
      setLocalFields(prev => prev.map(f => f.id === id ? { ...f, enabled: !f.enabled } : f));
    }
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
      // Save settings
      if (localSettings.itemsPerPage !== serverSettings.itemsPerPage) {
        await setSetting({ moduleKey: MODULE_KEY, settingKey: 'itemsPerPage', value: localSettings.itemsPerPage });
      }
      if (localSettings.maxFileSize !== serverSettings.maxFileSize) {
        await setSetting({ moduleKey: MODULE_KEY, settingKey: 'maxFileSize', value: localSettings.maxFileSize });
      }
      toast.success('Đã lưu cấu hình thành công!');
    } catch {
      toast.error('Có lỗi xảy ra khi lưu cấu hình');
    } finally {
      setIsSaving(false);
    }
  };

  // Data tab handlers
  const handleSeedConfig = async () => {
    try {
      toast.loading('Đang tạo cấu hình...');
      await seedMediaModule();
      toast.dismiss();
      toast.success('Đã tạo cấu hình thành công!');
    } catch {
      toast.dismiss();
      toast.error('Có lỗi xảy ra khi tạo cấu hình');
    }
  };

  const handleClearData = async () => {
    if (!confirm('Xóa toàn bộ media? Thao tác này không thể hoàn tác.')) return;
    try {
      toast.loading('Đang xóa dữ liệu...');
      await clearMediaData();
      toast.dismiss();
      toast.success('Đã xóa toàn bộ media!');
    } catch {
      toast.dismiss();
      toast.error('Có lỗi xảy ra khi xóa dữ liệu');
    }
  };

  const handleResetAll = async () => {
    if (!confirm('Reset cấu hình về mặc định?')) return;
    try {
      toast.loading('Đang reset...');
      await seedMediaModule();
      toast.dismiss();
      toast.success('Đã reset cấu hình thành công!');
    } catch {
      toast.dismiss();
      toast.error('Có lỗi xảy ra khi reset cấu hình');
    }
  };

  const handleSyncCounters = async () => {
    try {
      toast.loading('Đang sync counters...');
      const result = await syncMediaCounters();
      toast.dismiss();
      toast.success(`Đã sync: ${result.stats.total?.count ?? 0} files, ${Object.keys(result.folders).length} folders`);
    } catch {
      toast.dismiss();
      toast.error('Có lỗi xảy ra khi sync counters');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-cyan-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <ModuleHeader
        icon={Image}
        title="Module Thư viện Media"
        description="Quản lý hình ảnh, video, tài liệu"
        iconBgClass="bg-cyan-500/10"
        iconTextClass="text-cyan-600 dark:text-cyan-400"
        buttonClass="bg-cyan-600 hover:bg-cyan-500"
        onSave={activeTab === 'config' ? handleSave : undefined}
        hasChanges={activeTab === 'config' ? hasChanges : false}
        isSaving={isSaving}
      />

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700">
        <button
          onClick={() => setActiveTab('config')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'config'
              ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Settings size={16} /> Cấu hình
        </button>
        <button
          onClick={() => setActiveTab('data')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'data'
              ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Database size={16} /> Dữ liệu
        </button>
      </div>

      {activeTab === 'config' && (
        <>
          <ModuleStatus isCore={moduleData?.isCore ?? false} enabled={moduleData?.enabled ?? true} toggleColor="bg-cyan-500" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="space-y-4">
              <SettingsCard>
                <SettingInput 
                  label="Số file / trang" 
                  value={localSettings.itemsPerPage} 
                  onChange={(v) => setLocalSettings({...localSettings, itemsPerPage: v})}
                  focusColor="focus:border-cyan-500"
                />
                <SettingInput 
                  label="Max file size (MB)" 
                  value={localSettings.maxFileSize} 
                  onChange={(v) => setLocalSettings({...localSettings, maxFileSize: v})}
                  focusColor="focus:border-cyan-500"
                />
              </SettingsCard>

              <FeaturesCard
                features={FEATURES_CONFIG.map(f => ({ config: f, enabled: localFeatures[f.key] ?? false }))}
                onToggle={handleToggleFeature}
                toggleColor="bg-cyan-500"
              />
            </div>

            <div className="lg:col-span-2">
              <FieldsCard
                title="Trường media"
                icon={Image}
                iconColorClass="text-cyan-500"
                fields={localFields}
                onToggle={handleToggleField}
                fieldColorClass="bg-cyan-500/10 text-cyan-600 dark:text-cyan-400"
                toggleColor="bg-cyan-500"
              />
            </div>
          </div>

          <ConventionNote>
            <strong>Convention:</strong> File lưu trên Convex Storage. <Code>size</Code> tính bằng bytes. Hỗ trợ image, video, pdf.
          </ConventionNote>
        </>
      )}

      {activeTab === 'data' && (
        <div className="space-y-6">
          {/* Action buttons */}
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">Quản lý dữ liệu</h3>
                <p className="text-sm text-slate-500 mt-1">Seed cấu hình, clear hoặc reset module media</p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button variant="outline" onClick={handleSeedConfig} className="gap-2">
                  <Database size={16} /> Seed Config
                </Button>
                <Button variant="outline" onClick={handleSyncCounters} className="gap-2">
                  <RefreshCw size={16} /> Sync Counters
                </Button>
                <Button variant="outline" onClick={handleClearData} className="gap-2 text-red-500 hover:text-red-600">
                  <Trash2 size={16} /> Clear Media
                </Button>
                <Button onClick={handleResetAll} className="gap-2 bg-cyan-600 hover:bg-cyan-500">
                  <RefreshCw size={16} /> Reset Config
                </Button>
              </div>
            </div>
          </Card>

          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-cyan-500/10 rounded-lg">
                  <Image className="w-5 h-5 text-cyan-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{statsData?.imageCount ?? 0}</p>
                  <p className="text-sm text-slate-500">Hình ảnh</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <FileVideo className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{statsData?.videoCount ?? 0}</p>
                  <p className="text-sm text-slate-500">Video</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 rounded-lg">
                  <FileText className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{statsData?.documentCount ?? 0}</p>
                  <p className="text-sm text-slate-500">Tài liệu</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 rounded-lg">
                  <HardDrive className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{formatBytes(statsData?.totalSize ?? 0)}</p>
                  <p className="text-sm text-slate-500">Tổng dung lượng</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Folders */}
          {foldersData && foldersData.length > 0 && (
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <FolderTree className="w-5 h-5 text-cyan-500" />
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">Thư mục ({foldersData.length})</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {foldersData.map(folder => (
                  <Badge key={folder} variant="secondary">{folder}</Badge>
                ))}
              </div>
            </Card>
          )}

          {/* Media Table */}
          <Card>
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <Image className="w-5 h-5 text-cyan-500" />
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">Media ({mediaData?.length ?? 0})</h3>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên file</TableHead>
                  <TableHead>Loại</TableHead>
                  <TableHead>Thư mục</TableHead>
                  <TableHead className="text-right">Kích thước</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mediaData?.slice(0, 10).map(media => (
                  <TableRow key={media._id}>
                    <TableCell className="font-medium max-w-xs truncate">{media.filename}</TableCell>
                    <TableCell>
                      <Badge variant={media.mimeType.startsWith('image/') ? 'default' : media.mimeType.startsWith('video/') ? 'secondary' : 'outline'}>
                        {media.mimeType.split('/')[1]?.toUpperCase() || media.mimeType}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-500">{media.folder || '-'}</TableCell>
                    <TableCell className="text-right">{formatBytes(media.size)}</TableCell>
                  </TableRow>
                ))}
                {(!mediaData || mediaData.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-slate-500">
                      Chưa có media nào. Upload media từ trang Admin.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            {mediaData && mediaData.length > 10 && (
              <div className="p-3 border-t border-slate-100 dark:border-slate-800 text-sm text-slate-500 text-center">
                Hiển thị 10 / {mediaData.length} files
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
