'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { toast } from 'sonner';
import { MessageSquare, ThumbsUp, Reply, Shield, Loader2, Database, Trash2, RefreshCw, FileText, Package, Settings } from 'lucide-react';
import { FieldConfig } from '@/types/moduleConfig';
import { 
  ModuleHeader, ModuleStatus, ConventionNote, Code,
  SettingsCard, SettingInput, SettingSelect,
  FeaturesCard, FieldsCard
} from '@/components/modules/shared';
import { Card, Badge, Button, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/app/admin/components/ui';

const MODULE_KEY = 'comments';

const FEATURES_CONFIG = [
  { key: 'enableLikes', label: 'Lượt thích', icon: ThumbsUp, linkedField: 'likesCount' },
  { key: 'enableReplies', label: 'Trả lời', icon: Reply, linkedField: 'parentId' },
  { key: 'enableModeration', label: 'Kiểm duyệt', icon: Shield },
];

type FeaturesState = Record<string, boolean>;
type SettingsState = { commentsPerPage: number; defaultStatus: string; autoApprove: boolean };
type TabType = 'config' | 'data';

export default function CommentsModuleConfigPage() {
  const [activeTab, setActiveTab] = useState<TabType>('config');

  // Queries
  const moduleData = useQuery(api.admin.modules.getModuleByKey, { key: MODULE_KEY });
  const featuresData = useQuery(api.admin.modules.listModuleFeatures, { moduleKey: MODULE_KEY });
  const fieldsData = useQuery(api.admin.modules.listModuleFields, { moduleKey: MODULE_KEY });
  const settingsData = useQuery(api.admin.modules.listModuleSettings, { moduleKey: MODULE_KEY });

  // Data tab queries
  const commentsData = useQuery(api.comments.listAll);
  const postsData = useQuery(api.posts.listAll);
  const productsData = useQuery(api.products.listAll);

  // Mutations
  const toggleFeature = useMutation(api.admin.modules.toggleModuleFeature);
  const updateField = useMutation(api.admin.modules.updateModuleField);
  const setSetting = useMutation(api.admin.modules.setModuleSetting);
  const seedCommentsModule = useMutation(api.seed.seedCommentsModule);
  const seedComments = useMutation(api.seed.seedComments);
  const clearComments = useMutation(api.seed.clearComments);
  const clearCommentsConfig = useMutation(api.seed.clearCommentsConfig);
  const seedPostsModule = useMutation(api.seed.seedPostsModule);
  const seedProductsModule = useMutation(api.seed.seedProductsModule);

  // Local state
  const [localFeatures, setLocalFeatures] = useState<FeaturesState>({});
  const [localFields, setLocalFields] = useState<FieldConfig[]>([]);
  const [localSettings, setLocalSettings] = useState<SettingsState>({ commentsPerPage: 20, defaultStatus: 'Pending', autoApprove: false });
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
      const commentsPerPage = settingsData.find(s => s.settingKey === 'commentsPerPage')?.value as number ?? 20;
      const defaultStatus = settingsData.find(s => s.settingKey === 'defaultStatus')?.value as string ?? 'Pending';
      const autoApprove = settingsData.find(s => s.settingKey === 'autoApprove')?.value as boolean ?? false;
      setLocalSettings({ commentsPerPage, defaultStatus, autoApprove });
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
    const commentsPerPage = settingsData?.find(s => s.settingKey === 'commentsPerPage')?.value as number ?? 20;
    const defaultStatus = settingsData?.find(s => s.settingKey === 'defaultStatus')?.value as string ?? 'Pending';
    const autoApprove = settingsData?.find(s => s.settingKey === 'autoApprove')?.value as boolean ?? false;
    return { commentsPerPage, defaultStatus, autoApprove };
  }, [settingsData]);

  // Check for changes
  const hasChanges = useMemo(() => {
    const featuresChanged = Object.keys(localFeatures).some(key => localFeatures[key] !== serverFeatures[key]);
    const fieldsChanged = localFields.some(f => {
      const server = serverFields.find(s => s.id === f.id);
      return server && f.enabled !== server.enabled;
    });
    const settingsChanged = localSettings.commentsPerPage !== serverSettings.commentsPerPage ||
                           localSettings.defaultStatus !== serverSettings.defaultStatus ||
                           localSettings.autoApprove !== serverSettings.autoApprove;
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
      if (localSettings.commentsPerPage !== serverSettings.commentsPerPage) {
        await setSetting({ moduleKey: MODULE_KEY, settingKey: 'commentsPerPage', value: localSettings.commentsPerPage });
      }
      if (localSettings.defaultStatus !== serverSettings.defaultStatus) {
        await setSetting({ moduleKey: MODULE_KEY, settingKey: 'defaultStatus', value: localSettings.defaultStatus });
      }
      if (localSettings.autoApprove !== serverSettings.autoApprove) {
        await setSetting({ moduleKey: MODULE_KEY, settingKey: 'autoApprove', value: localSettings.autoApprove });
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
    toast.loading('Đang tạo cấu hình module...');
    await seedCommentsModule();
    toast.dismiss();
    toast.success('Đã tạo cấu hình module thành công!');
  };

  const handleSeedData = async () => {
    toast.loading('Đang tạo dữ liệu mẫu...');
    await seedPostsModule();
    await seedProductsModule();
    await seedComments();
    toast.dismiss();
    toast.success('Đã tạo dữ liệu mẫu thành công!');
  };

  const handleClearData = async () => {
    if (!confirm('Xóa toàn bộ bình luận?')) return;
    toast.loading('Đang xóa dữ liệu...');
    await clearComments();
    toast.dismiss();
    toast.success('Đã xóa toàn bộ bình luận!');
  };

  const handleResetAll = async () => {
    if (!confirm('Reset toàn bộ dữ liệu và cấu hình?')) return;
    toast.loading('Đang reset...');
    await clearComments();
    await clearCommentsConfig();
    await seedCommentsModule();
    await seedPostsModule();
    await seedProductsModule();
    await seedComments();
    toast.dismiss();
    toast.success('Đã reset thành công!');
  };

  // Maps for display
  const postMap = useMemo(() => {
    const map: Record<string, string> = {};
    postsData?.forEach(post => { map[post._id] = post.title; });
    return map;
  }, [postsData]);

  const productMap = useMemo(() => {
    const map: Record<string, string> = {};
    productsData?.forEach(product => { map[product._id] = product.name; });
    return map;
  }, [productsData]);

  // Statistics
  const stats = useMemo(() => {
    const total = commentsData?.length ?? 0;
    const postComments = commentsData?.filter(c => c.targetType === 'post').length ?? 0;
    const productComments = commentsData?.filter(c => c.targetType === 'product').length ?? 0;
    const pending = commentsData?.filter(c => c.status === 'Pending').length ?? 0;
    const approved = commentsData?.filter(c => c.status === 'Approved').length ?? 0;
    const spam = commentsData?.filter(c => c.status === 'Spam').length ?? 0;
    return { total, postComments, productComments, pending, approved, spam };
  }, [commentsData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-cyan-500" />
      </div>
    );
  }

  // Check if config is seeded
  const hasConfig = featuresData && featuresData.length > 0;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <ModuleHeader
        icon={MessageSquare}
        title="Module Bình luận"
        description="Cấu hình bình luận bài viết và đánh giá sản phẩm"
        iconBgClass="bg-cyan-500/10"
        iconTextClass="text-cyan-600 dark:text-cyan-400"
        buttonClass="bg-cyan-600 hover:bg-cyan-500"
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
          {!hasConfig ? (
            <Card className="p-8 text-center">
              <MessageSquare size={48} className="mx-auto text-slate-300 mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">Chưa có cấu hình module</h3>
              <p className="text-slate-500 mb-4">Nhấn nút bên dưới để khởi tạo cấu hình cho module Bình luận</p>
              <Button onClick={handleSeedConfig} className="bg-cyan-600 hover:bg-cyan-500">
                <Database size={16} className="mr-2" /> Khởi tạo cấu hình
              </Button>
            </Card>
          ) : (
            <>
              <ModuleStatus isCore={moduleData?.isCore ?? false} enabled={moduleData?.enabled ?? true} toggleColor="bg-cyan-500" />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="space-y-4">
                  <SettingsCard>
                    <SettingInput 
                      label="Số bình luận / trang" 
                      value={localSettings.commentsPerPage} 
                      onChange={(v) => setLocalSettings({...localSettings, commentsPerPage: v})}
                      focusColor="focus:border-cyan-500"
                    />
                    <SettingSelect
                      label="Trạng thái mặc định"
                      value={localSettings.defaultStatus}
                      onChange={(v) => setLocalSettings({...localSettings, defaultStatus: v})}
                      options={[
                        { value: 'Pending', label: 'Chờ duyệt' },
                        { value: 'Approved', label: 'Tự động duyệt' }
                      ]}
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
                    title="Trường bình luận"
                    icon={MessageSquare}
                    iconColorClass="text-cyan-500"
                    fields={localFields}
                    onToggle={handleToggleField}
                    fieldColorClass="bg-cyan-500/10 text-cyan-600 dark:text-cyan-400"
                    toggleColor="bg-cyan-500"
                  />
                </div>
              </div>

              <ConventionNote>
                <strong>Convention:</strong> Trường <Code>targetType</Code> xác định loại (post/product). 
                <Code>status</Code>: Pending, Approved, Spam. Bình luận hỗ trợ polymorphic relationship.
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
                <p className="text-sm text-slate-500 mt-1">Seed, clear hoặc reset dữ liệu bình luận</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleSeedConfig} className="gap-2">
                  <Settings size={16} /> Seed Config
                </Button>
                <Button variant="outline" onClick={handleSeedData} className="gap-2">
                  <Database size={16} /> Seed Data
                </Button>
                <Button variant="outline" onClick={handleClearData} className="gap-2 text-red-500 hover:text-red-600">
                  <Trash2 size={16} /> Clear
                </Button>
                <Button onClick={handleResetAll} className="gap-2 bg-cyan-600 hover:bg-cyan-500">
                  <RefreshCw size={16} /> Reset All
                </Button>
              </div>
            </div>
          </Card>

          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Card className="p-4">
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.total}</p>
              <p className="text-sm text-slate-500">Tổng</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-blue-500" />
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.postComments}</p>
              </div>
              <p className="text-sm text-slate-500">Bài viết</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2">
                <Package size={16} className="text-purple-500" />
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.productComments}</p>
              </div>
              <p className="text-sm text-slate-500">Sản phẩm</p>
            </Card>
            <Card className="p-4">
              <p className="text-2xl font-bold text-amber-500">{stats.pending}</p>
              <p className="text-sm text-slate-500">Chờ duyệt</p>
            </Card>
            <Card className="p-4">
              <p className="text-2xl font-bold text-green-500">{stats.approved}</p>
              <p className="text-sm text-slate-500">Đã duyệt</p>
            </Card>
            <Card className="p-4">
              <p className="text-2xl font-bold text-red-500">{stats.spam}</p>
              <p className="text-sm text-slate-500">Spam</p>
            </Card>
          </div>

          {/* Comments Table */}
          <Card>
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-cyan-500" />
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">Bình luận ({stats.total})</h3>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Người dùng</TableHead>
                  <TableHead>Nội dung</TableHead>
                  <TableHead>Loại</TableHead>
                  <TableHead>Đối tượng</TableHead>
                  <TableHead>Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {commentsData?.slice(0, 15).map(comment => (
                  <TableRow key={comment._id}>
                    <TableCell className="font-medium">{comment.authorName}</TableCell>
                    <TableCell className="text-slate-600 dark:text-slate-400 max-w-xs truncate">{comment.content}</TableCell>
                    <TableCell>
                      <Badge variant={comment.targetType === 'post' ? 'secondary' : 'outline'} className="gap-1">
                        {comment.targetType === 'post' ? <FileText size={12} /> : <Package size={12} />}
                        {comment.targetType === 'post' ? 'Bài viết' : 'Sản phẩm'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-slate-500 max-w-[150px] truncate">
                      {comment.targetType === 'post' 
                        ? (postMap[comment.targetId] || 'N/A') 
                        : (productMap[comment.targetId] || 'N/A')}
                    </TableCell>
                    <TableCell>
                      <Badge variant={comment.status === 'Approved' ? 'default' : comment.status === 'Pending' ? 'secondary' : 'destructive'}>
                        {comment.status === 'Approved' ? 'Đã duyệt' : comment.status === 'Pending' ? 'Chờ duyệt' : 'Spam'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {(!commentsData || commentsData.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                      Chưa có bình luận nào. Nhấn &quot;Seed Data&quot; để tạo dữ liệu mẫu.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            {commentsData && commentsData.length > 15 && (
              <div className="p-3 border-t border-slate-100 dark:border-slate-800 text-sm text-slate-500 text-center">
                Hiển thị 15 / {commentsData.length} bình luận
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
