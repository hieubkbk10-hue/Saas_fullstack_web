'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { toast } from 'sonner';
import Image from 'next/image';
import { Clock, Database, Image as ImageIcon, Loader2, Phone, RefreshCw, Settings, Shield, Trash2, UserCog } from 'lucide-react';
import type { FieldConfig } from '@/types/module-config';
import { 
  Code, ConventionNote, FeaturesCard, FieldsCard,
  ModuleHeader, ModuleStatus,
  SettingInput, SettingsCard
} from '@/components/modules/shared';
import { Badge, Button, Card, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/admin/components/ui';

const MODULE_KEY = 'users';

const FEATURES_CONFIG = [
  { icon: ImageIcon, key: 'enableAvatar', label: 'Ảnh đại diện', linkedField: 'avatar' },
  { icon: Phone, key: 'enablePhone', label: 'Số điện thoại', linkedField: 'phone' },
  { icon: Clock, key: 'enableLastLogin', label: 'Đăng nhập cuối', linkedField: 'lastLogin' },
];

type FeaturesState = Record<string, boolean>;
interface SettingsState { usersPerPage: number; sessionTimeout: number; maxLoginAttempts: number }
type TabType = 'config' | 'data';

export default function UsersModuleConfigPage() {
  const [activeTab, setActiveTab] = useState<TabType>('config');
  const moduleData = useQuery(api.admin.modules.getModuleByKey, { key: MODULE_KEY });
  const featuresData = useQuery(api.admin.modules.listModuleFeatures, { moduleKey: MODULE_KEY });
  const fieldsData = useQuery(api.admin.modules.listModuleFields, { moduleKey: MODULE_KEY });
  const settingsData = useQuery(api.admin.modules.listModuleSettings, { moduleKey: MODULE_KEY });

  // Data tab queries
  const usersData = useQuery(api.users.listAll);
  const rolesData = useQuery(api.roles.listAll);

  const toggleFeature = useMutation(api.admin.modules.toggleModuleFeature);
  const updateField = useMutation(api.admin.modules.updateModuleField);
  const setSetting = useMutation(api.admin.modules.setModuleSetting);
  const seedUsersModule = useMutation(api.seed.seedUsersModule);
  const clearUsersData = useMutation(api.seed.clearUsersData);

  const [localFeatures, setLocalFeatures] = useState<FeaturesState>({});
  const [localFields, setLocalFields] = useState<FieldConfig[]>([]);
  const [localSettings, setLocalSettings] = useState<SettingsState>({ maxLoginAttempts: 5, sessionTimeout: 30, usersPerPage: 20 });
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
        enabled: f.enabled,
        id: f._id,
        isSystem: f.isSystem,
        key: f.fieldKey,
        linkedFeature: f.linkedFeature,
        name: f.name,
        required: f.required,
        type: f.type,
      })));
    }
  }, [fieldsData]);

  // Sync settings
  useEffect(() => {
    if (settingsData) {
      const usersPerPage = settingsData.find(s => s.settingKey === 'usersPerPage')?.value as number ?? 20;
      const sessionTimeout = settingsData.find(s => s.settingKey === 'sessionTimeout')?.value as number ?? 30;
      const maxLoginAttempts = settingsData.find(s => s.settingKey === 'maxLoginAttempts')?.value as number ?? 5;
      setLocalSettings({ maxLoginAttempts, sessionTimeout, usersPerPage });
    }
  }, [settingsData]);

  // Server state for comparison
  const serverFeatures = useMemo(() => {
    const result: FeaturesState = {};
    featuresData?.forEach(f => { result[f.featureKey] = f.enabled; });
    return result;
  }, [featuresData]);

  const serverFields = useMemo(() => fieldsData?.map(f => ({ enabled: f.enabled, id: f._id })) ?? [], [fieldsData]);

  const serverSettings = useMemo(() => {
    const usersPerPage = settingsData?.find(s => s.settingKey === 'usersPerPage')?.value as number ?? 20;
    const sessionTimeout = settingsData?.find(s => s.settingKey === 'sessionTimeout')?.value as number ?? 30;
    const maxLoginAttempts = settingsData?.find(s => s.settingKey === 'maxLoginAttempts')?.value as number ?? 5;
    return { maxLoginAttempts, sessionTimeout, usersPerPage };
  }, [settingsData]);

  // Check for changes
  const hasChanges = useMemo(() => {
    const featuresChanged = Object.keys(localFeatures).some(key => localFeatures[key] !== serverFeatures[key]);
    const fieldsChanged = localFields.some(f => {
      const server = serverFields.find(s => s.id === f.id);
      return server && f.enabled !== server.enabled;
    });
    const settingsChanged = 
      localSettings.usersPerPage !== serverSettings.usersPerPage ||
      localSettings.sessionTimeout !== serverSettings.sessionTimeout ||
      localSettings.maxLoginAttempts !== serverSettings.maxLoginAttempts;
    return featuresChanged || fieldsChanged || settingsChanged;
  }, [localFeatures, serverFeatures, localFields, serverFields, localSettings, serverSettings]);

  const handleToggleFeature = (key: string) => {
    const newFeatureState = !localFeatures[key];
    setLocalFeatures(prev => ({ ...prev, [key]: newFeatureState }));
    setLocalFields(prev => prev.map(f => 
      f.linkedFeature === key ? { ...f, enabled: newFeatureState } : f
    ));
  };

  const handleToggleField = (id: string) => {
    const field = localFields.find(f => f.id === id);
    if (!field) {return;}
    
    const newFieldState = !field.enabled;
    setLocalFields(prev => {
      const updated = prev.map(f => f.id === id ? { ...f, enabled: newFieldState } : f);
      
      if (field.linkedFeature) {
        const linkedFields = updated.filter(f => f.linkedFeature === field.linkedFeature);
        const allDisabled = linkedFields.every(f => !f.enabled);
        const anyEnabled = linkedFields.some(f => f.enabled);
        
        if (allDisabled) {
          setLocalFeatures(prevFeatures => ({ ...prevFeatures, [field.linkedFeature!]: false }));
        } else if (anyEnabled) {
          setLocalFeatures(prevFeatures => ({ ...prevFeatures, [field.linkedFeature!]: true }));
        }
      }
      return updated;
    });
  };

  // USR-006 FIX: Batch save với Promise.all thay vì sequential
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const promises: Promise<unknown>[] = [];
      
      // Collect feature updates
      for (const key of Object.keys(localFeatures)) {
        if (localFeatures[key] !== serverFeatures[key]) {
          promises.push(toggleFeature({ enabled: localFeatures[key], featureKey: key, moduleKey: MODULE_KEY }));
        }
      }
      
      // Collect field updates
      for (const field of localFields) {
        const server = serverFields.find(s => s.id === field.id);
        if (server && field.enabled !== server.enabled) {
          promises.push(updateField({ enabled: field.enabled, id: field.id as Id<'moduleFields'> }));
        }
      }
      
      // Collect settings updates
      if (localSettings.usersPerPage !== serverSettings.usersPerPage) {
        promises.push(setSetting({ moduleKey: MODULE_KEY, settingKey: 'usersPerPage', value: localSettings.usersPerPage }));
      }
      if (localSettings.sessionTimeout !== serverSettings.sessionTimeout) {
        promises.push(setSetting({ moduleKey: MODULE_KEY, settingKey: 'sessionTimeout', value: localSettings.sessionTimeout }));
      }
      if (localSettings.maxLoginAttempts !== serverSettings.maxLoginAttempts) {
        promises.push(setSetting({ moduleKey: MODULE_KEY, settingKey: 'maxLoginAttempts', value: localSettings.maxLoginAttempts }));
      }
      
      // Execute all updates in parallel
      await Promise.all(promises);
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
    await seedUsersModule();
    toast.dismiss();
    toast.success('Đã tạo dữ liệu mẫu thành công!');
  };

  const handleClearAll = async () => {
    if (!confirm('Xóa toàn bộ users và roles?')) {return;}
    toast.loading('Đang xóa dữ liệu...');
    await clearUsersData();
    toast.dismiss();
    toast.success('Đã xóa toàn bộ dữ liệu!');
  };

  const handleResetAll = async () => {
    if (!confirm('Reset toàn bộ dữ liệu về mặc định?')) {return;}
    toast.loading('Đang reset dữ liệu...');
    await clearUsersData();
    await seedUsersModule();
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

  // Map role id to name
  const roleMap: Record<string, { name: string; color?: string }> = {};
  rolesData?.forEach(role => { roleMap[role._id] = { color: role.color, name: role.name }; });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <ModuleHeader
        icon={UserCog}
        title="Module Người dùng Admin"
        description="Quản lý tài khoản admin và phân quyền"
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
          onClick={() =>{  setActiveTab('config'); }}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'config'
              ? 'border-purple-500 text-purple-600 dark:text-purple-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Settings size={16} /> Cấu hình
        </button>
        <button
          onClick={() =>{  setActiveTab('data'); }}
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
              <SettingsCard title="Cài đặt bảo mật">
                <SettingInput 
                  label="Session timeout (phút)" 
                  value={localSettings.sessionTimeout} 
                  onChange={(v) =>{  setLocalSettings({...localSettings, sessionTimeout: v}); }}
                  focusColor="focus:border-purple-500"
                />
                <SettingInput 
                  label="Max đăng nhập sai" 
                  value={localSettings.maxLoginAttempts} 
                  onChange={(v) =>{  setLocalSettings({...localSettings, maxLoginAttempts: v}); }}
                  focusColor="focus:border-purple-500"
                />
                <SettingInput 
                  label="Số users / trang" 
                  value={localSettings.usersPerPage} 
                  onChange={(v) =>{  setLocalSettings({...localSettings, usersPerPage: v}); }}
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
              title="Trường người dùng"
              icon={UserCog}
              iconColorClass="text-purple-500"
              fields={localFields}
              onToggle={handleToggleField}
              fieldColorClass="bg-purple-500/10 text-purple-600 dark:text-purple-400"
              toggleColor="bg-purple-500"
            />

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                <Shield size={14} className="text-purple-500" /> Module liên quan
              </h3>
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Shield size={14} className="text-purple-500" />
                  <span className="text-sm text-slate-700 dark:text-slate-200">Vai trò & Quyền</span>
                </div>
                <a href="/system/modules/roles" className="text-[11px] text-purple-600 dark:text-purple-400 hover:underline">Cấu hình &rarr;</a>
              </div>
            </div>
          </div>

          <ConventionNote>
            <strong>Convention:</strong> Mật khẩu hash bằng bcrypt. Email unique và lowercase. Trường <Code>roleId</Code> liên kết module Roles.
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
                <p className="text-sm text-slate-500 mt-1">Seed, clear hoặc reset dữ liệu users và roles</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleSeedAll} className="gap-2">
                  <Database size={16} /> Seed Data
                </Button>
                <Button variant="outline" onClick={handleClearAll} className="gap-2 text-red-500 hover:text-red-600">
                  <Trash2 size={16} /> Clear All
                </Button>
                <Button onClick={handleResetAll} className="gap-2 bg-purple-600 hover:bg-purple-500">
                  <RefreshCw size={16} /> Reset
                </Button>
              </div>
            </div>
          </Card>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <UserCog className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{usersData?.length ?? 0}</p>
                  <p className="text-sm text-slate-500">Người dùng</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 rounded-lg">
                  <Shield className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{rolesData?.length ?? 0}</p>
                  <p className="text-sm text-slate-500">Vai trò</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Users Table */}
          <Card>
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <UserCog className="w-5 h-5 text-purple-500" />
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">Người dùng ({usersData?.length ?? 0})</h3>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Vai trò</TableHead>
                  <TableHead>Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usersData?.slice(0, 10).map(user => (
                  <TableRow key={user._id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {user.avatar ? (
                          <Image src={user.avatar} width={24} height={24} className="w-6 h-6 rounded-full" alt={user.name} />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs">
                            {user.name.charAt(0)}
                          </div>
                        )}
                        {user.name}
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-500">{user.email}</TableCell>
                    <TableCell>
                      {roleMap[user.roleId]?.color ? (
                        <span 
                          className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold"
                          style={{ backgroundColor: roleMap[user.roleId].color, borderColor: roleMap[user.roleId].color, color: '#fff' }}
                        >
                          {roleMap[user.roleId]?.name || 'N/A'}
                        </span>
                      ) : (
                        <Badge variant="secondary">{roleMap[user.roleId]?.name || 'N/A'}</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.status === 'Active' ? 'default' : (user.status === 'Inactive' ? 'secondary' : 'destructive')}>
                        {user.status === 'Active' ? 'Hoạt động' : (user.status === 'Inactive' ? 'Không HĐ' : 'Bị cấm')}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {(!usersData || usersData.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-slate-500">
                      Chưa có người dùng nào. Nhấn &quot;Seed Data&quot; để tạo dữ liệu mẫu.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            {usersData && usersData.length > 10 && (
              <div className="p-3 border-t border-slate-100 dark:border-slate-800 text-sm text-slate-500 text-center">
                Hiển thị 10 / {usersData.length} người dùng
              </div>
            )}
          </Card>

          {/* Roles Table */}
          <Card>
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <Shield className="w-5 h-5 text-amber-500" />
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">Vai trò ({rolesData?.length ?? 0})</h3>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên vai trò</TableHead>
                  <TableHead>Mô tả</TableHead>
                  <TableHead>Loại</TableHead>
                  <TableHead className="text-right">Số users</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rolesData?.map(role => {
                  const userCount = usersData?.filter(u => u.roleId === role._id).length ?? 0;
                  return (
                    <TableRow key={role._id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: role.color ?? '#94a3b8' }}
                          />
                          <span className="font-medium">{role.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-500">{role.description}</TableCell>
                      <TableCell>
                        {role.isSuperAdmin ? (
                          <Badge variant="destructive">Super Admin</Badge>
                        ) : (role.isSystem ? (
                          <Badge variant="default">Hệ thống</Badge>
                        ) : (
                          <Badge variant="secondary">Tùy chỉnh</Badge>
                        ))}
                      </TableCell>
                      <TableCell className="text-right">{userCount}</TableCell>
                    </TableRow>
                  );
                })}
                {(!rolesData || rolesData.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-slate-500">
                      Chưa có vai trò nào.
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
