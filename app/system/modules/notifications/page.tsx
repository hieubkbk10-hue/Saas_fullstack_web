'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { toast } from 'sonner';
import { Bell, Mail, Clock, Users, Loader2, Database, Trash2, RefreshCw, Settings, CheckCircle, AlertTriangle, XCircle, Info, Send } from 'lucide-react';
import { FieldConfig } from '@/types/moduleConfig';
import { 
  ModuleHeader, ModuleStatus, ConventionNote, Code,
  SettingsCard, SettingInput, FeaturesCard, FieldsCard
} from '@/components/modules/shared';
import { Card, Badge, Button, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/app/admin/components/ui';

const MODULE_KEY = 'notifications';

const FEATURES_CONFIG = [
  { key: 'enableEmail', label: 'Gửi Email', icon: Mail, description: 'Gửi thông báo qua email', linkedField: 'sendEmail' },
  { key: 'enableScheduling', label: 'Hẹn giờ gửi', icon: Clock, description: 'Lên lịch gửi thông báo', linkedField: 'scheduledAt' },
  { key: 'enableTargeting', label: 'Nhắm đối tượng', icon: Users, description: 'Gửi thông báo cho nhóm cụ thể', linkedField: 'targetType' },
];

const TYPE_CONFIG = {
  info: { icon: Info, color: 'text-blue-500', bg: 'bg-blue-500/10', label: 'Thông tin' },
  success: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10', label: 'Thành công' },
  warning: { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-500/10', label: 'Cảnh báo' },
  error: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10', label: 'Lỗi' },
};

const STATUS_CONFIG = {
  Draft: { variant: 'secondary' as const, label: 'Bản nháp' },
  Scheduled: { variant: 'warning' as const, label: 'Đã hẹn' },
  Sent: { variant: 'success' as const, label: 'Đã gửi' },
  Cancelled: { variant: 'destructive' as const, label: 'Đã hủy' },
};

type FeaturesState = Record<string, boolean>;
type SettingsState = { itemsPerPage: number; defaultType: string };
type TabType = 'config' | 'data';

export default function NotificationsModuleConfigPage() {
  const [activeTab, setActiveTab] = useState<TabType>('config');

  // Queries
  const moduleData = useQuery(api.admin.modules.getModuleByKey, { key: MODULE_KEY });
  const featuresData = useQuery(api.admin.modules.listModuleFeatures, { moduleKey: MODULE_KEY });
  const fieldsData = useQuery(api.admin.modules.listModuleFields, { moduleKey: MODULE_KEY });
  const settingsData = useQuery(api.admin.modules.listModuleSettings, { moduleKey: MODULE_KEY });

  // Data tab queries
  const notificationsData = useQuery(api.notifications.listAll);

  // Mutations
  const toggleFeature = useMutation(api.admin.modules.toggleModuleFeature);
  const updateField = useMutation(api.admin.modules.updateModuleField);
  const setSetting = useMutation(api.admin.modules.setModuleSetting);
  const seedNotificationsModule = useMutation(api.seed.seedNotificationsModule);
  const clearNotificationsData = useMutation(api.seed.clearNotificationsData);

  // Local state
  const [localFeatures, setLocalFeatures] = useState<FeaturesState>({});
  const [localFields, setLocalFields] = useState<FieldConfig[]>([]);
  const [localSettings, setLocalSettings] = useState<SettingsState>({ itemsPerPage: 20, defaultType: 'info' });
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
      const itemsPerPage = settingsData.find(s => s.settingKey === 'itemsPerPage')?.value as number ?? 20;
      const defaultType = settingsData.find(s => s.settingKey === 'defaultType')?.value as string ?? 'info';
      setLocalSettings({ itemsPerPage, defaultType });
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
    const itemsPerPage = settingsData?.find(s => s.settingKey === 'itemsPerPage')?.value as number ?? 20;
    const defaultType = settingsData?.find(s => s.settingKey === 'defaultType')?.value as string ?? 'info';
    return { itemsPerPage, defaultType };
  }, [settingsData]);

  // Check for changes
  const hasChanges = useMemo(() => {
    const featuresChanged = Object.keys(localFeatures).some(key => localFeatures[key] !== serverFeatures[key]);
    const fieldsChanged = localFields.some(f => {
      const server = serverFields.find(s => s.id === f.id);
      return server && f.enabled !== server.enabled;
    });
    const settingsChanged = localSettings.itemsPerPage !== serverSettings.itemsPerPage ||
                           localSettings.defaultType !== serverSettings.defaultType;
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
      for (const key of Object.keys(localFeatures)) {
        if (localFeatures[key] !== serverFeatures[key]) {
          await toggleFeature({ moduleKey: MODULE_KEY, featureKey: key, enabled: localFeatures[key] });
        }
      }
      for (const field of localFields) {
        const server = serverFields.find(s => s.id === field.id);
        if (server && field.enabled !== server.enabled) {
          await updateField({ id: field.id as any, enabled: field.enabled });
        }
      }
      if (localSettings.itemsPerPage !== serverSettings.itemsPerPage) {
        await setSetting({ moduleKey: MODULE_KEY, settingKey: 'itemsPerPage', value: localSettings.itemsPerPage });
      }
      if (localSettings.defaultType !== serverSettings.defaultType) {
        await setSetting({ moduleKey: MODULE_KEY, settingKey: 'defaultType', value: localSettings.defaultType });
      }
      toast.success('Đã lưu cấu hình thành công!');
    } catch {
      toast.error('Có lỗi xảy ra khi lưu cấu hình');
    } finally {
      setIsSaving(false);
    }
  };

  // Data tab handlers
  const handleSeedData = async () => {
    toast.loading('Đang tạo dữ liệu mẫu...');
    await seedNotificationsModule();
    toast.dismiss();
    toast.success('Đã tạo dữ liệu mẫu thành công!');
  };

  const handleClearData = async () => {
    if (!confirm('Xóa toàn bộ dữ liệu thông báo?')) return;
    toast.loading('Đang xóa dữ liệu...');
    await clearNotificationsData();
    toast.dismiss();
    toast.success('Đã xóa toàn bộ dữ liệu!');
  };

  const handleResetData = async () => {
    if (!confirm('Reset toàn bộ dữ liệu về mặc định?')) return;
    toast.loading('Đang reset dữ liệu...');
    await clearNotificationsData();
    await seedNotificationsModule();
    toast.dismiss();
    toast.success('Đã reset dữ liệu thành công!');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-pink-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <ModuleHeader
        icon={Bell}
        title="Module Thông báo"
        description="Quản lý thông báo hệ thống"
        iconBgClass="bg-pink-500/10"
        iconTextClass="text-pink-600 dark:text-pink-400"
        buttonClass="bg-pink-600 hover:bg-pink-500"
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
              ? 'border-pink-500 text-pink-600 dark:text-pink-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Settings size={16} /> Cấu hình
        </button>
        <button
          onClick={() => setActiveTab('data')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'data'
              ? 'border-pink-500 text-pink-600 dark:text-pink-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Database size={16} /> Dữ liệu
        </button>
      </div>

      {activeTab === 'config' && (
        <>
          <ModuleStatus isCore={moduleData?.isCore ?? false} enabled={moduleData?.enabled ?? true} toggleColor="bg-pink-500" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="space-y-4">
              <SettingsCard>
                <SettingInput 
                  label="Số thông báo / trang" 
                  value={localSettings.itemsPerPage} 
                  onChange={(v) => setLocalSettings({...localSettings, itemsPerPage: v})}
                  focusColor="focus:border-pink-500"
                />
              </SettingsCard>

              <FeaturesCard
                features={FEATURES_CONFIG.map(f => ({ config: f, enabled: localFeatures[f.key] ?? false }))}
                onToggle={handleToggleFeature}
                toggleColor="bg-pink-500"
              />
            </div>

            <div className="lg:col-span-2">
              <FieldsCard
                title="Trường thông báo"
                icon={Bell}
                iconColorClass="text-pink-500"
                fields={localFields}
                onToggle={handleToggleField}
                fieldColorClass="bg-pink-500/10 text-pink-600 dark:text-pink-400"
                toggleColor="bg-pink-500"
              />
            </div>
          </div>

          <ConventionNote>
            <strong>Convention:</strong> <Code>type</Code>: info, success, warning, error. <Code>targetType</Code>: all, customers, users, specific. <Code>status</Code>: Draft, Scheduled, Sent, Cancelled.
          </ConventionNote>
        </>
      )}

      {activeTab === 'data' && (
        <NotificationsDataTab 
          notificationsData={notificationsData || []}
          onSeedData={handleSeedData}
          onClearData={handleClearData}
          onResetData={handleResetData}
        />
      )}
    </div>
  );
}

function NotificationsDataTab({ 
  notificationsData, 
  onSeedData, 
  onClearData, 
  onResetData 
}: { 
  notificationsData: any[];
  onSeedData: () => Promise<void>;
  onClearData: () => Promise<void>;
  onResetData: () => Promise<void>;
}) {
  const stats = useMemo(() => {
    const sent = notificationsData.filter(n => n.status === 'Sent');
    const scheduled = notificationsData.filter(n => n.status === 'Scheduled');
    const drafts = notificationsData.filter(n => n.status === 'Draft');
    const totalReads = notificationsData.reduce((sum, n) => sum + (n.readCount || 0), 0);
    return { total: notificationsData.length, sent: sent.length, scheduled: scheduled.length, drafts: drafts.length, totalReads };
  }, [notificationsData]);

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return '-';
    return new Date(timestamp).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' });
  };

  return (
    <div className="space-y-6">
      {/* Action buttons */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">Quản lý dữ liệu mẫu</h3>
            <p className="text-sm text-slate-500 mt-1">Seed, clear hoặc reset dữ liệu cho module thông báo</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onSeedData} className="gap-2">
              <Database size={16} /> Seed Data
            </Button>
            <Button variant="outline" onClick={onClearData} className="gap-2 text-red-500 hover:text-red-600">
              <Trash2 size={16} /> Clear All
            </Button>
            <Button onClick={onResetData} className="gap-2 bg-pink-600 hover:bg-pink-500">
              <RefreshCw size={16} /> Reset
            </Button>
          </div>
        </div>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-pink-500/10 rounded-lg">
              <Bell className="w-5 h-5 text-pink-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.total}</p>
              <p className="text-sm text-slate-500">Tổng</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <Send className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.sent}</p>
              <p className="text-sm text-slate-500">Đã gửi</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.scheduled}</p>
              <p className="text-sm text-slate-500">Đã hẹn</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-500/10 rounded-lg">
              <Bell className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.drafts}</p>
              <p className="text-sm text-slate-500">Bản nháp</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <CheckCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.totalReads.toLocaleString()}</p>
              <p className="text-sm text-slate-500">Lượt đọc</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Notifications Table */}
      <Card>
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
          <Bell className="w-5 h-5 text-pink-500" />
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">Danh sách thông báo ({notificationsData.length})</h3>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">Loại</TableHead>
              <TableHead>Tiêu đề</TableHead>
              <TableHead>Đối tượng</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Đã đọc</TableHead>
              <TableHead>Thời gian</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {notificationsData.slice(0, 10).map(notif => {
              const typeConfig = TYPE_CONFIG[notif.type as keyof typeof TYPE_CONFIG];
              const statusConfig = STATUS_CONFIG[notif.status as keyof typeof STATUS_CONFIG];
              const TypeIcon = typeConfig?.icon || Bell;
              return (
                <TableRow key={notif._id}>
                  <TableCell>
                    <div className={`w-8 h-8 rounded-lg ${typeConfig?.bg} flex items-center justify-center`}>
                      <TypeIcon size={16} className={typeConfig?.color} />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium max-w-[250px] truncate">{notif.title}</div>
                    <div className="text-xs text-slate-500 max-w-[250px] truncate">{notif.content}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{notif.targetType}</Badge>
                    {notif.sendEmail && <span className="ml-1 text-xs text-pink-500">📧</span>}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusConfig?.variant}>{statusConfig?.label}</Badge>
                  </TableCell>
                  <TableCell className="text-right text-slate-500">{notif.readCount?.toLocaleString() || 0}</TableCell>
                  <TableCell className="text-slate-500 text-sm">
                    {notif.status === 'Sent' ? formatDate(notif.sentAt) : notif.status === 'Scheduled' ? formatDate(notif.scheduledAt) : '-'}
                  </TableCell>
                </TableRow>
              );
            })}
            {notificationsData.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                  Chưa có thông báo nào. Nhấn &quot;Seed Data&quot; để tạo dữ liệu mẫu.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {notificationsData.length > 10 && (
          <div className="p-3 border-t border-slate-100 dark:border-slate-800 text-sm text-slate-500 text-center">
            Hiển thị 10 / {notificationsData.length} thông báo
          </div>
        )}
      </Card>
    </div>
  );
}
