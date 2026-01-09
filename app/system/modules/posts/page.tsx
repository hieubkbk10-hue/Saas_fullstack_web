'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, usePaginatedQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { toast } from 'sonner';
import { FileText, FolderTree, Tag, Star, Clock, Loader2, Database, Trash2, RefreshCw, MessageSquare, Settings } from 'lucide-react';
import { FieldConfig } from '@/types/moduleConfig';
import { 
  ModuleHeader, ModuleStatus, ConventionNote, Code,
  SettingsCard, SettingInput, SettingSelect,
  FeaturesCard, FieldsCard
} from '@/components/modules/shared';
import { Card, Badge, Button, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/app/admin/components/ui';

const MODULE_KEY = 'posts';
const CATEGORY_MODULE_KEY = 'postCategories';

const FEATURES_CONFIG = [
  { key: 'enableTags', label: 'Tags', icon: Tag, linkedField: 'tags' },
  { key: 'enableFeatured', label: 'Nổi bật', icon: Star, linkedField: 'featured' },
  { key: 'enableScheduling', label: 'Hẹn giờ', icon: Clock, linkedField: 'publish_date' },
];

type FeaturesState = Record<string, boolean>;
type SettingsState = { postsPerPage: number; defaultStatus: string };
type TabType = 'config' | 'data';

export default function PostsModuleConfigPage() {
  const [activeTab, setActiveTab] = useState<TabType>('config');
  const moduleData = useQuery(api.admin.modules.getModuleByKey, { key: MODULE_KEY });
  const featuresData = useQuery(api.admin.modules.listModuleFeatures, { moduleKey: MODULE_KEY });
  const fieldsData = useQuery(api.admin.modules.listModuleFields, { moduleKey: MODULE_KEY });
  const categoryFieldsData = useQuery(api.admin.modules.listModuleFields, { moduleKey: CATEGORY_MODULE_KEY });
  const settingsData = useQuery(api.admin.modules.listModuleSettings, { moduleKey: MODULE_KEY });

  // QA-HIGH-001 FIX: Data tab queries với pagination thay vì listAll
  const { results: postsData, status: postsStatus, loadMore: loadMorePosts } = usePaginatedQuery(
    api.posts.list,
    {},
    { initialNumItems: 10 }
  );
  const categoriesData = useQuery(api.postCategories.listAll, { limit: 50 });
  const { results: commentsData, status: commentsStatus, loadMore: loadMoreComments } = usePaginatedQuery(
    api.comments.listByTargetTypePaginated,
    { targetType: "post" },
    { initialNumItems: 10 }
  );

  const toggleFeature = useMutation(api.admin.modules.toggleModuleFeature);
  const updateField = useMutation(api.admin.modules.updateModuleField);
  const setSetting = useMutation(api.admin.modules.setModuleSetting);
  const seedPostsModule = useMutation(api.seed.seedPostsModule);
  const clearPostsData = useMutation(api.seed.clearPostsData);
  const seedComments = useMutation(api.seed.seedComments);
  const clearComments = useMutation(api.seed.clearComments);

  const [localFeatures, setLocalFeatures] = useState<FeaturesState>({});
  const [localPostFields, setLocalPostFields] = useState<FieldConfig[]>([]);
  const [localCategoryFields, setLocalCategoryFields] = useState<FieldConfig[]>([]);
  const [localSettings, setLocalSettings] = useState<SettingsState>({ postsPerPage: 10, defaultStatus: 'draft' });
  const [isSaving, setIsSaving] = useState(false);

  const isLoading = moduleData === undefined || featuresData === undefined || 
                    fieldsData === undefined || categoryFieldsData === undefined || settingsData === undefined;

  // Sync features
  useEffect(() => {
    if (featuresData) {
      const features: FeaturesState = {};
      featuresData.forEach(f => { features[f.featureKey] = f.enabled; });
      setLocalFeatures(features);
    }
  }, [featuresData]);

  // Sync post fields
  useEffect(() => {
    if (fieldsData) {
      setLocalPostFields(fieldsData.map(f => ({
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

  // Sync category fields
  useEffect(() => {
    if (categoryFieldsData) {
      setLocalCategoryFields(categoryFieldsData.map(f => ({
        id: f._id,
        key: f.fieldKey,
        name: f.name,
        type: f.type,
        required: f.required,
        enabled: f.enabled,
        isSystem: f.isSystem,
      })));
    }
  }, [categoryFieldsData]);

  // Sync settings
  useEffect(() => {
    if (settingsData) {
      const postsPerPage = settingsData.find(s => s.settingKey === 'postsPerPage')?.value as number ?? 10;
      const defaultStatus = settingsData.find(s => s.settingKey === 'defaultStatus')?.value as string ?? 'draft';
      setLocalSettings({ postsPerPage, defaultStatus });
    }
  }, [settingsData]);

  // Server state for comparison
  const serverFeatures = useMemo(() => {
    const result: FeaturesState = {};
    featuresData?.forEach(f => { result[f.featureKey] = f.enabled; });
    return result;
  }, [featuresData]);

  const serverPostFields = useMemo(() => {
    return fieldsData?.map(f => ({ id: f._id, enabled: f.enabled })) || [];
  }, [fieldsData]);

  const serverCategoryFields = useMemo(() => {
    return categoryFieldsData?.map(f => ({ id: f._id, enabled: f.enabled })) || [];
  }, [categoryFieldsData]);

  const serverSettings = useMemo(() => {
    const postsPerPage = settingsData?.find(s => s.settingKey === 'postsPerPage')?.value as number ?? 10;
    const defaultStatus = settingsData?.find(s => s.settingKey === 'defaultStatus')?.value as string ?? 'draft';
    return { postsPerPage, defaultStatus };
  }, [settingsData]);

  // Check for changes
  const hasChanges = useMemo(() => {
    const featuresChanged = Object.keys(localFeatures).some(key => localFeatures[key] !== serverFeatures[key]);
    const postFieldsChanged = localPostFields.some(f => {
      const server = serverPostFields.find(s => s.id === f.id);
      return server && f.enabled !== server.enabled;
    });
    const categoryFieldsChanged = localCategoryFields.some(f => {
      const server = serverCategoryFields.find(s => s.id === f.id);
      return server && f.enabled !== server.enabled;
    });
    const settingsChanged = localSettings.postsPerPage !== serverSettings.postsPerPage ||
                           localSettings.defaultStatus !== serverSettings.defaultStatus;
    return featuresChanged || postFieldsChanged || categoryFieldsChanged || settingsChanged;
  }, [localFeatures, serverFeatures, localPostFields, serverPostFields, localCategoryFields, serverCategoryFields, localSettings, serverSettings]);

  const handleToggleFeature = (key: string) => {
    const newFeatureState = !localFeatures[key];
    setLocalFeatures(prev => ({ ...prev, [key]: newFeatureState }));
    // Also update linked fields
    setLocalPostFields(prev => prev.map(f => 
      f.linkedFeature === key ? { ...f, enabled: newFeatureState } : f
    ));
  };

  const handleTogglePostField = (id: string) => {
    const field = localPostFields.find(f => f.id === id);
    if (!field) return;
    
    const newFieldState = !field.enabled;
    setLocalPostFields(prev => {
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

  const handleToggleCategoryField = (id: string) => {
    setLocalCategoryFields(prev => prev.map(f => f.id === id ? { ...f, enabled: !f.enabled } : f));
  };

  // QA-CRIT-001 FIX: Batch save với Promise.all thay vì sequential
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const promises: Promise<unknown>[] = [];
      
      // Collect feature updates
      for (const key of Object.keys(localFeatures)) {
        if (localFeatures[key] !== serverFeatures[key]) {
          promises.push(toggleFeature({ moduleKey: MODULE_KEY, featureKey: key, enabled: localFeatures[key] }));
        }
      }
      
      // Collect post field updates
      for (const field of localPostFields) {
        const server = serverPostFields.find(s => s.id === field.id);
        if (server && field.enabled !== server.enabled) {
          promises.push(updateField({ id: field.id as Id<"moduleFields">, enabled: field.enabled }));
        }
      }
      
      // Collect category field updates
      for (const field of localCategoryFields) {
        const server = serverCategoryFields.find(s => s.id === field.id);
        if (server && field.enabled !== server.enabled) {
          promises.push(updateField({ id: field.id as Id<"moduleFields">, enabled: field.enabled }));
        }
      }
      
      // Collect settings updates
      if (localSettings.postsPerPage !== serverSettings.postsPerPage) {
        promises.push(setSetting({ moduleKey: MODULE_KEY, settingKey: 'postsPerPage', value: localSettings.postsPerPage }));
      }
      if (localSettings.defaultStatus !== serverSettings.defaultStatus) {
        promises.push(setSetting({ moduleKey: MODULE_KEY, settingKey: 'defaultStatus', value: localSettings.defaultStatus }));
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
    await seedPostsModule();
    await seedComments();
    toast.dismiss();
    toast.success('Đã tạo dữ liệu mẫu thành công!');
  };

  const handleClearAll = async () => {
    if (!confirm('Xóa toàn bộ dữ liệu bài viết, danh mục và bình luận?')) return;
    toast.loading('Đang xóa dữ liệu...');
    await clearComments();
    await clearPostsData();
    toast.dismiss();
    toast.success('Đã xóa toàn bộ dữ liệu!');
  };

  const handleResetAll = async () => {
    if (!confirm('Reset toàn bộ dữ liệu về mặc định?')) return;
    toast.loading('Đang reset dữ liệu...');
    await clearComments();
    await clearPostsData();
    await seedPostsModule();
    await seedComments();
    toast.dismiss();
    toast.success('Đã reset dữ liệu thành công!');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-cyan-500" />
      </div>
    );
  }

  // Map category id to name
  const categoryMap: Record<string, string> = {};
  categoriesData?.forEach(cat => { categoryMap[cat._id] = cat.name; });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <ModuleHeader
        icon={FileText}
        title="Module Bài viết"
        description="Cấu hình bài viết và danh mục"
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
                  label="Số bài / trang" 
                  value={localSettings.postsPerPage} 
                  onChange={(v) => setLocalSettings({...localSettings, postsPerPage: v})}
                  focusColor="focus:border-cyan-500"
                />
                <SettingSelect
                  label="Trạng thái mặc định"
                  value={localSettings.defaultStatus}
                  onChange={(v) => setLocalSettings({...localSettings, defaultStatus: v})}
                  options={[{ value: 'draft', label: 'Bản nháp' }, { value: 'published', label: 'Xuất bản' }]}
                  focusColor="focus:border-cyan-500"
                />
              </SettingsCard>

              <FeaturesCard
                features={FEATURES_CONFIG.map(f => ({ config: f, enabled: localFeatures[f.key] ?? false }))}
                onToggle={handleToggleFeature}
                toggleColor="bg-cyan-500"
              />
            </div>

            <FieldsCard
              title="Trường bài viết"
              icon={FileText}
              iconColorClass="text-cyan-500"
              fields={localPostFields}
              onToggle={handleTogglePostField}
              fieldColorClass="bg-cyan-500/10 text-cyan-600 dark:text-cyan-400"
              toggleColor="bg-cyan-500"
            />

            <FieldsCard
              title="Trường danh mục"
              icon={FolderTree}
              iconColorClass="text-emerald-500"
              fields={localCategoryFields}
              onToggle={handleToggleCategoryField}
              fieldColorClass="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              toggleColor="bg-emerald-500"
            />
          </div>

          <ConventionNote>
            <strong>Convention:</strong> Slug tự động từ tiêu đề. Trường <Code>order</Code> và <Code>active</Code> bắt buộc theo Rails convention.
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
                <p className="text-sm text-slate-500 mt-1">Seed, clear hoặc reset dữ liệu cho module bài viết</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleSeedAll} className="gap-2">
                  <Database size={16} /> Seed Data
                </Button>
                <Button variant="outline" onClick={handleClearAll} className="gap-2 text-red-500 hover:text-red-600">
                  <Trash2 size={16} /> Clear All
                </Button>
                <Button onClick={handleResetAll} className="gap-2 bg-cyan-600 hover:bg-cyan-500">
                  <RefreshCw size={16} /> Reset
                </Button>
              </div>
            </div>
          </Card>

          {/* Statistics - Using paginated data counts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-cyan-500/10 rounded-lg">
                  <FileText className="w-5 h-5 text-cyan-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{postsData?.length ?? 0}{postsStatus === 'CanLoadMore' ? '+' : ''}</p>
                  <p className="text-sm text-slate-500">Bài viết</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 rounded-lg">
                  <FolderTree className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{categoriesData?.length ?? 0}</p>
                  <p className="text-sm text-slate-500">Danh mục</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 rounded-lg">
                  <MessageSquare className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{commentsData?.length ?? 0}{commentsStatus === 'CanLoadMore' ? '+' : ''}</p>
                  <p className="text-sm text-slate-500">Bình luận</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Posts Table - With pagination */}
          <Card>
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <FileText className="w-5 h-5 text-cyan-500" />
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">Bài viết ({postsData?.length ?? 0}{postsStatus === 'CanLoadMore' ? '+' : ''})</h3>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tiêu đề</TableHead>
                  <TableHead>Danh mục</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Lượt xem</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {postsData?.map(post => (
                  <TableRow key={post._id}>
                    <TableCell className="font-medium">{post.title}</TableCell>
                    <TableCell><Badge variant="secondary">{categoryMap[post.categoryId] || 'N/A'}</Badge></TableCell>
                    <TableCell>
                      <Badge variant={post.status === 'Published' ? 'default' : post.status === 'Draft' ? 'secondary' : 'outline'}>
                        {post.status === 'Published' ? 'Xuất bản' : post.status === 'Draft' ? 'Nháp' : 'Lưu trữ'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{post.views?.toLocaleString() ?? 0}</TableCell>
                  </TableRow>
                ))}
                {(!postsData || postsData.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-slate-500">
                      Chưa có bài viết nào. Nhấn &quot;Seed Data&quot; để tạo dữ liệu mẫu.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            {postsStatus === 'CanLoadMore' && (
              <div className="p-3 border-t border-slate-100 dark:border-slate-800 text-center">
                <Button variant="ghost" size="sm" onClick={() => loadMorePosts(10)}>
                  Tải thêm bài viết
                </Button>
              </div>
            )}
          </Card>

          {/* Categories Table */}
          <Card>
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <FolderTree className="w-5 h-5 text-emerald-500" />
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">Danh mục ({categoriesData?.length ?? 0})</h3>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên danh mục</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Số bài viết</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categoriesData?.map(cat => {
                  const postCount = postsData?.filter(p => p.categoryId === cat._id).length ?? 0;
                  return (
                    <TableRow key={cat._id}>
                      <TableCell className="font-medium">{cat.name}</TableCell>
                      <TableCell className="text-slate-500 font-mono text-sm">{cat.slug}</TableCell>
                      <TableCell>
                        <Badge variant={cat.active ? 'default' : 'secondary'}>{cat.active ? 'Hoạt động' : 'Ẩn'}</Badge>
                      </TableCell>
                      <TableCell className="text-right">{postCount}</TableCell>
                    </TableRow>
                  );
                })}
                {(!categoriesData || categoriesData.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-slate-500">
                      Chưa có danh mục nào.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>

          {/* Comments Table - With pagination */}
          <Card>
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-amber-500" />
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">Bình luận ({commentsData?.length ?? 0}{commentsStatus === 'CanLoadMore' ? '+' : ''})</h3>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Người bình luận</TableHead>
                  <TableHead>Nội dung</TableHead>
                  <TableHead>Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {commentsData?.map(comment => (
                  <TableRow key={comment._id}>
                    <TableCell className="font-medium">{comment.authorName}</TableCell>
                    <TableCell className="text-slate-600 dark:text-slate-400 max-w-xs truncate">{comment.content}</TableCell>
                    <TableCell>
                      <Badge variant={comment.status === 'Approved' ? 'default' : comment.status === 'Pending' ? 'secondary' : 'destructive'}>
                        {comment.status === 'Approved' ? 'Đã duyệt' : comment.status === 'Pending' ? 'Chờ duyệt' : 'Spam'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {(!commentsData || commentsData.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8 text-slate-500">
                      Chưa có bình luận nào.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            {commentsStatus === 'CanLoadMore' && (
              <div className="p-3 border-t border-slate-100 dark:border-slate-800 text-center">
                <Button variant="ghost" size="sm" onClick={() => loadMoreComments(10)}>
                  Tải thêm bình luận
                </Button>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
