'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { toast } from 'sonner';
import { Shield, FileText, Palette, GitBranch, Loader2, Database, Trash2, RefreshCw, Settings, Users, Crown, Lock } from 'lucide-react';
import { FieldConfig } from '@/types/moduleConfig';
import { 
  ModuleHeader, ModuleStatus, ConventionNote, Code,
  SettingsCard, SettingInput,
  FeaturesCard, FieldsCard
} from '@/components/modules/shared';
import { Card, Badge, Button, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/app/admin/components/ui';

const MODULE_KEY = 'roles';

const FEATURES_CONFIG = [
  { key: 'enableDescription', label: 'Mô tả vai trò', icon: FileText, linkedField: 'description' },
  { key: 'enableColor', label: 'Màu sắc', icon: Palette, linkedField: 'color' },
  { key: 'enableHierarchy', label: 'Phân cấp', icon: GitBranch },
];

type FeaturesState = Record<string, boolean>;
type SettingsState = { maxRolesPerUser: number; rolesPerPage: number };
type TabType = 'config' | 'data';

export default function RolesModuleConfigPage() {
  const [activeTab, setActiveTab] = useState<TabType>('config');
  
  const moduleData = useQuery(api.admin.modules.getModuleByKey, { key: MODULE_KEY });
  const featuresData = useQuery(api.admin.modules.listModuleFeatures, { moduleKey: MODULE_KEY });
  const fieldsData = useQuery(api.admin.modules.listModuleFields, { moduleKey: MODULE_KEY });
  const settingsData = useQuery(api.admin.modules.listModuleSettings, { moduleKey: MODULE_KEY });

  // Data tab queries
  const rolesData = useQuery(api.roles.listAll);
  const statsData = useQuery(api.roles.getStats);
  const userCountByRole = useQuery(api.roles.getUserCountByRole);

  const toggleFeature = useMutation(api.admin.modules.toggleModuleFeature);
  const updateField = useMutation(api.admin.modules.updateModuleField);
  const setSetting = useMutation(api.admin.modules.setModuleSetting);
  const seedRolesModule = useMutation(api.seed.seedRolesModule);
  const clearRolesData = useMutation(api.seed.clearRolesData);

  const [localFeatures, setLocalFeatures] = useState<FeaturesState>({});
  const [localFields, setLocalFields] = useState<FieldConfig[]>([]);
  const [localSettings, setLocalSettings] = useState<SettingsState>({ maxRolesPerUser: 1, rolesPerPage: 10 });
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
      const maxRolesPerUser = settingsData.find(s => s.settingKey === 'maxRolesPerUser')?.value as number ?? 1;
      const rolesPerPage = settingsData.find(s => s.settingKey === 'rolesPerPage')?.value as number ?? 10;
      setLocalSettings({ maxRolesPerUser, rolesPerPage });
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
    const maxRolesPerUser = settingsData?.find(s => s.settingKey === 'maxRolesPerUser')?.value as number ?? 1;
    const rolesPerPage = settingsData?.find(s => s.settingKey === 'rolesPerPage')?.value as number ?? 10;
    return { maxRolesPerUser, rolesPerPage };
  }, [settingsData]);

  // Check for changes
  const hasChanges = useMemo(() => {
    const featuresChanged = Object.keys(localFeatures).some(key => localFeatures[key] !== serverFeatures[key]);
    const fieldsChanged = localFields.some(f => {
      const server = serverFields.find(s => s.id === f.id);
      return server && f.enabled !== server.enabled;
    });
    const settingsChanged = localSettings.maxRolesPerUser !== serverSettings.maxRolesPerUser ||
                            localSettings.rolesPerPage !== serverSettings.rolesPerPage;
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
      if (localSettings.maxRolesPerUser !== serverSettings.maxRolesPerUser) {
        await setSetting({ moduleKey: MODULE_KEY, settingKey: 'maxRolesPerUser', value: localSettings.maxRolesPerUser });
      }
      if (localSettings.rolesPerPage !== serverSettings.rolesPerPage) {
        await setSetting({ moduleKey: MODULE_KEY, settingKey: 'rolesPerPage', value: localSettings.rolesPerPage });
      }
      toast.success('Đã lưu cấu hình thành công!');
    } catch {
      toast.error('Có lỗi xảy ra khi lưu cấu hình');
    } finally {
      setIsSaving(false);
    }
  };

  // Data tab handlers
  const handleSeedAll = async () => {
    toast.loading('Đang tạo dữ liệu mẫu...');
    await seedRolesModule();
    toast.dismiss();
    toast.success('Đã tạo dữ liệu mẫu thành công!');
  };

  const handleClearData = async () => {
    if (!confirm('Xóa các vai trò custom (giữ lại vai trò hệ thống)?')) return;
    toast.loading('Đang xóa dữ liệu...');
    await clearRolesData();
    toast.dismiss();
    toast.success('Đã xóa vai trò custom!');
  };

  const handleResetAll = async () => {
    if (!confirm('Reset dữ liệu về mặc định?')) return;
    toast.loading('Đang reset dữ liệu...');
    await clearRolesData();
    await seedRolesModule();
    toast.dismiss();
    toast.success('Đã reset dữ liệu thành công!');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-purple-500" />
      </div>
    );
  }

  // Map roleId to userCount
  const userCountMap: Record<string, number> = {};
  userCountByRole?.forEach(r => { userCountMap[r.roleId] = r.userCount; });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <ModuleHeader
        icon={Shield}
        title="Module Vai trò & Quyền"
        description="Phân quyền RBAC cho hệ thống"
        iconBgClass="bg-purple-500/10"
        iconTextClass="text-purple-600 dark:text-purple-400"
        buttonClass="bg-purple-600 hover:bg-purple-500"
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
              ? 'border-purple-500 text-purple-600 dark:text-purple-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Settings size={16} /> Cấu hình
        </button>
        <button
          onClick={() => setActiveTab('data')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'data'
              ? 'border-purple-500 text-purple-600 dark:text-purple-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Database size={16} /> Dữ liệu
        </button>
      </div>

      {activeTab === 'config' && (
        <>
          <ModuleStatus isCore={moduleData?.isCore ?? true} enabled={moduleData?.enabled ?? true} toggleColor="bg-purple-500" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="space-y-4">
              <SettingsCard>
                <SettingInput 
                  label="Max roles / user" 
                  value={localSettings.maxRolesPerUser} 
                  onChange={(v) => setLocalSettings({...localSettings, maxRolesPerUser: v})}
                  focusColor="focus:border-purple-500"
                />
                <SettingInput 
                  label="Số vai trò / trang" 
                  value={localSettings.rolesPerPage} 
                  onChange={(v) => setLocalSettings({...localSettings, rolesPerPage: v})}
                  focusColor="focus:border-purple-500"
                />
              </SettingsCard>

              <FeaturesCard
                features={FEATURES_CONFIG.map(f => ({ config: f, enabled: localFeatures[f.key] ?? false }))}
                onToggle={handleToggleFeature}
                toggleColor="bg-purple-500"
              />
            </div>

            <FieldsCard
              title="Trường vai trò"
              icon={Shield}
              iconColorClass="text-purple-500"
              fields={localFields}
              onToggle={handleToggleField}
              fieldColorClass="bg-purple-500/10 text-purple-600 dark:text-purple-400"
              toggleColor="bg-purple-500"
            />

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3">Quyền cơ bản</h3>
              <div className="grid grid-cols-2 gap-2">
                {['view', 'create', 'edit', 'delete'].map((perm) => (
                  <div key={perm} className="p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center">
                    <code className="text-xs text-purple-600 dark:text-purple-400">{perm}</code>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-slate-500 mt-3">
                * Permissions lưu dạng JSON:<br/>
                <code className="text-purple-500">{`{"posts": ["view", "create"]}`}</code>
              </p>
            </div>
          </div>

          <ConventionNote>
            <strong>Convention:</strong> Trường <Code>permissions</Code> lưu JSON định nghĩa quyền cho từng module. Vai trò <Code>isSystem</Code> không thể xóa.
          </ConventionNote>
        </>
      )}

      {activeTab === 'data' && (
        <div className="space-y-6">
          {/* Action buttons */}
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">Quản lý dữ liệu mẫu</h3>
                <p className="text-sm text-slate-500 mt-1">Seed, clear hoặc reset dữ liệu vai trò</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleSeedAll} className="gap-2">
                  <Database size={16} /> Seed Data
                </Button>
                <Button variant="outline" onClick={handleClearData} className="gap-2 text-red-500 hover:text-red-600">
                  <Trash2 size={16} /> Clear Custom
                </Button>
                <Button onClick={handleResetAll} className="gap-2 bg-purple-600 hover:bg-purple-500">
                  <RefreshCw size={16} /> Reset
                </Button>
              </div>
            </div>
          </Card>

          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <Shield className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{statsData?.totalCount ?? 0}</p>
                  <p className="text-sm text-slate-500">Tổng vai trò</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Lock className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{statsData?.systemCount ?? 0}</p>
                  <p className="text-sm text-slate-500">Hệ thống</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 rounded-lg">
                  <Users className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{statsData?.customCount ?? 0}</p>
                  <p className="text-sm text-slate-500">Custom</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 rounded-lg">
                  <Crown className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{statsData?.superAdminCount ?? 0}</p>
                  <p className="text-sm text-slate-500">Super Admin</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Roles Table */}
          <Card>
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-500" />
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">Vai trò ({rolesData?.length ?? 0})</h3>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên vai trò</TableHead>
                  <TableHead>Mô tả</TableHead>
                  <TableHead>Loại</TableHead>
                  <TableHead className="text-center">Số quyền</TableHead>
                  <TableHead className="text-right">Số user</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rolesData?.map(role => {
                  const permissionCount = Object.values(role.permissions).flat().length;
                  return (
                    <TableRow key={role._id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {role.color && (
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: role.color }}
                            />
                          )}
                          <span className="font-medium">{role.name}</span>
                          {role.isSuperAdmin && (
                            <Crown size={14} className="text-amber-500" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-500 max-w-xs truncate">{role.description}</TableCell>
                      <TableCell>
                        <Badge variant={role.isSystem ? 'default' : 'secondary'}>
                          {role.isSystem ? 'Hệ thống' : 'Custom'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {role.isSuperAdmin ? (
                          <Badge variant="outline">Toàn quyền</Badge>
                        ) : (
                          permissionCount
                        )}
                      </TableCell>
                      <TableCell className="text-right">{userCountMap[role._id] ?? 0}</TableCell>
                    </TableRow>
                  );
                })}
                {(!rolesData || rolesData.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                      Chưa có vai trò nào. Nhấn &quot;Seed Data&quot; để tạo dữ liệu mẫu.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </div>
      )}
    </div>
  );
}
