'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useMutation, usePaginatedQuery, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { toast } from 'sonner';
import { ArrowLeft, Clock, Database, Eye, FileText, FolderTree, Loader2, MessageSquare, Monitor, Palette, RefreshCw, Settings, Smartphone, Star, Tablet, Tag, Trash2 } from 'lucide-react';
import type { FieldConfig } from '@/types/module-config';
import { 
  Code, ConventionNote, FeaturesCard, FieldsCard,
  ModuleHeader, ModuleStatus, SettingInput,
  SettingSelect, SettingsCard
} from '@/components/modules/shared';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, cn } from '@/app/admin/components/ui';

const MODULE_KEY = 'posts';
const CATEGORY_MODULE_KEY = 'postCategories';

const FEATURES_CONFIG = [
  { icon: Tag, key: 'enableTags', label: 'Tags', linkedField: 'tags' },
  { icon: Star, key: 'enableFeatured', label: 'Nổi bật', linkedField: 'featured' },
  { icon: Clock, key: 'enableScheduling', label: 'Hẹn giờ', linkedField: 'publish_date' },
];

type FeaturesState = Record<string, boolean>;
interface SettingsState { postsPerPage: number; defaultStatus: string }
type TabType = 'config' | 'data' | 'appearance';
type PostsListStyle = 'fullwidth' | 'sidebar' | 'magazine';
type PostsDetailStyle = 'classic' | 'modern' | 'minimal';
type PreviewDevice = 'desktop' | 'tablet' | 'mobile';

const LIST_STYLES: { id: PostsListStyle; label: string; description: string }[] = [
  { description: 'Horizontal filter bar + grid/list toggle, tối ưu mobile', id: 'fullwidth', label: 'Full Width' },
  { description: 'Classic blog với sidebar filters, categories, recent posts', id: 'sidebar', label: 'Sidebar' },
  { description: 'Hero slider + category tabs, phong cách editorial', id: 'magazine', label: 'Magazine' },
];

const DETAIL_STYLES: { id: PostsDetailStyle; label: string; description: string }[] = [
  { description: 'Truyền thống với sidebar bài liên quan', id: 'classic', label: 'Classic' },
  { description: 'Hero lớn, full-width, hiện đại', id: 'modern', label: 'Modern' },
  { description: 'Tối giản, tập trung vào nội dung', id: 'minimal', label: 'Minimal' },
];

const deviceWidths = {
  desktop: 'w-full',
  mobile: 'w-[375px] max-w-full',
  tablet: 'w-[768px] max-w-full'
};

const devices = [
  { icon: Monitor, id: 'desktop' as const, label: 'Desktop' },
  { icon: Tablet, id: 'tablet' as const, label: 'Tablet' },
  { icon: Smartphone, id: 'mobile' as const, label: 'Mobile' }
];

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
  const setMultipleSettings = useMutation(api.settings.setMultiple);

  // Appearance tab queries
  const listStyleSetting = useQuery(api.settings.getByKey, { key: 'posts_list_style' });
  const detailStyleSetting = useQuery(api.settings.getByKey, { key: 'posts_detail_style' });
  const brandColorSetting = useQuery(api.settings.getByKey, { key: 'site_brand_color' });

  const [localFeatures, setLocalFeatures] = useState<FeaturesState>({});
  const [localPostFields, setLocalPostFields] = useState<FieldConfig[]>([]);
  const [localCategoryFields, setLocalCategoryFields] = useState<FieldConfig[]>([]);
  const [localSettings, setLocalSettings] = useState<SettingsState>({ defaultStatus: 'draft', postsPerPage: 10 });
  const [isSaving, setIsSaving] = useState(false);

  // Appearance tab states
  const [listStyle, setListStyle] = useState<PostsListStyle>('fullwidth');
  const [detailStyle, setDetailStyle] = useState<PostsDetailStyle>('classic');
  const [previewDevice, setPreviewDevice] = useState<PreviewDevice>('desktop');
  const [activePreview, setActivePreview] = useState<'list' | 'detail'>('list');
  const [appearanceHasChanges, setAppearanceHasChanges] = useState(false);

  const brandColor = (brandColorSetting?.value as string) || '#3b82f6';

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

  // Sync category fields
  useEffect(() => {
    if (categoryFieldsData) {
      setLocalCategoryFields(categoryFieldsData.map(f => ({
        enabled: f.enabled,
        id: f._id,
        isSystem: f.isSystem,
        key: f.fieldKey,
        name: f.name,
        required: f.required,
        type: f.type,
      })));
    }
  }, [categoryFieldsData]);

  // Sync settings
  useEffect(() => {
    if (settingsData) {
      const postsPerPage = settingsData.find(s => s.settingKey === 'postsPerPage')?.value as number ?? 10;
      const defaultStatus = settingsData.find(s => s.settingKey === 'defaultStatus')?.value as string ?? 'draft';
      setLocalSettings({ defaultStatus, postsPerPage });
    }
  }, [settingsData]);

  // Sync appearance settings
  useEffect(() => {
    if (listStyleSetting?.value) {
      setListStyle(listStyleSetting.value as PostsListStyle);
    }
    if (detailStyleSetting?.value) {
      setDetailStyle(detailStyleSetting.value as PostsDetailStyle);
    }
  }, [listStyleSetting, detailStyleSetting]);

  // Server state for comparison
  const serverFeatures = useMemo(() => {
    const result: FeaturesState = {};
    featuresData?.forEach(f => { result[f.featureKey] = f.enabled; });
    return result;
  }, [featuresData]);

  const serverPostFields = useMemo(() => fieldsData?.map(f => ({ enabled: f.enabled, id: f._id })) ?? [], [fieldsData]);

  const serverCategoryFields = useMemo(() => categoryFieldsData?.map(f => ({ enabled: f.enabled, id: f._id })) ?? [], [categoryFieldsData]);

  const serverSettings = useMemo(() => {
    const postsPerPage = settingsData?.find(s => s.settingKey === 'postsPerPage')?.value as number ?? 10;
    const defaultStatus = settingsData?.find(s => s.settingKey === 'defaultStatus')?.value as string ?? 'draft';
    return { defaultStatus, postsPerPage };
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
    if (!field) {return;}
    
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
          promises.push(toggleFeature({ enabled: localFeatures[key], featureKey: key, moduleKey: MODULE_KEY }));
        }
      }
      
      // Collect post field updates
      for (const field of localPostFields) {
        const server = serverPostFields.find(s => s.id === field.id);
        if (server && field.enabled !== server.enabled) {
          promises.push(updateField({ enabled: field.enabled, id: field.id as Id<"moduleFields"> }));
        }
      }
      
      // Collect category field updates
      for (const field of localCategoryFields) {
        const server = serverCategoryFields.find(s => s.id === field.id);
        if (server && field.enabled !== server.enabled) {
          promises.push(updateField({ enabled: field.enabled, id: field.id as Id<"moduleFields"> }));
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
    if (!confirm('Xóa toàn bộ dữ liệu bài viết, danh mục và bình luận?')) {return;}
    toast.loading('Đang xóa dữ liệu...');
    await clearComments();
    await clearPostsData();
    toast.dismiss();
    toast.success('Đã xóa toàn bộ dữ liệu!');
  };

  const handleResetAll = async () => {
    if (!confirm('Reset toàn bộ dữ liệu về mặc định?')) {return;}
    toast.loading('Đang reset dữ liệu...');
    await clearComments();
    await clearPostsData();
    await seedPostsModule();
    await seedComments();
    toast.dismiss();
    toast.success('Đã reset dữ liệu thành công!');
  };

  // Appearance tab handlers
  const handleListStyleChange = (style: PostsListStyle) => {
    setListStyle(style);
    setAppearanceHasChanges(true);
  };

  const handleDetailStyleChange = (style: PostsDetailStyle) => {
    setDetailStyle(style);
    setAppearanceHasChanges(true);
  };

  const handleSaveAppearance = async () => {
    setIsSaving(true);
    try {
      await setMultipleSettings({
        settings: [
          { group: 'posts', key: 'posts_list_style', value: listStyle },
          { group: 'posts', key: 'posts_detail_style', value: detailStyle },
        ]
      });
      setAppearanceHasChanges(false);
      toast.success('Đã lưu cài đặt giao diện!');
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Có lỗi khi lưu cài đặt');
    } finally {
      setIsSaving(false);
    }
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
        onSave={activeTab === 'config' ? handleSave : (activeTab === 'appearance' ? handleSaveAppearance : undefined)}
        hasChanges={activeTab === 'config' ? hasChanges : (activeTab === 'appearance' ? appearanceHasChanges : false)}
        isSaving={isSaving}
      />

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700">
        <button
          onClick={() =>{  setActiveTab('config'); }}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'config'
              ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Settings size={16} /> Cấu hình
        </button>
        <button
          onClick={() =>{  setActiveTab('data'); }}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'data'
              ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Database size={16} /> Dữ liệu
        </button>
        <button
          onClick={() =>{  setActiveTab('appearance'); }}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'appearance'
              ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Palette size={16} /> Giao diện
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
                  onChange={(v) =>{  setLocalSettings({...localSettings, postsPerPage: v}); }}
                  focusColor="focus:border-cyan-500"
                />
                <SettingSelect
                  label="Trạng thái mặc định"
                  value={localSettings.defaultStatus}
                  onChange={(v) =>{  setLocalSettings({...localSettings, defaultStatus: v}); }}
                  options={[{ label: 'Bản nháp', value: 'draft' }, { label: 'Xuất bản', value: 'published' }]}
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
                      <Badge variant={post.status === 'Published' ? 'default' : (post.status === 'Draft' ? 'secondary' : 'outline')}>
                        {post.status === 'Published' ? 'Xuất bản' : (post.status === 'Draft' ? 'Nháp' : 'Lưu trữ')}
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
                <Button variant="ghost" size="sm" onClick={() =>{  loadMorePosts(10); }}>
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
                      <Badge variant={comment.status === 'Approved' ? 'default' : (comment.status === 'Pending' ? 'secondary' : 'destructive')}>
                        {comment.status === 'Approved' ? 'Đã duyệt' : (comment.status === 'Pending' ? 'Chờ duyệt' : 'Spam')}
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
                <Button variant="ghost" size="sm" onClick={() =>{  loadMoreComments(10); }}>
                  Tải thêm bình luận
                </Button>
              </div>
            )}
          </Card>
        </div>
      )}

      {activeTab === 'appearance' && (
        <div className="space-y-6">
          {/* Compact Style Selectors */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* List Style Selector */}
            <Card className="p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-shrink-0">
                  <h3 className="font-medium text-sm text-slate-900 dark:text-slate-100">Trang danh sách</h3>
                  <p className="text-xs text-slate-500">/posts</p>
                </div>
                <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                  {LIST_STYLES.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => {
                        handleListStyleChange(style.id);
                        setActivePreview('list');
                      }}
                      title={style.description}
                      className={cn(
                        "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                        listStyle === style.id 
                          ? "bg-cyan-500 text-white shadow-sm" 
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                      )}
                    >
                      {style.label}
                    </button>
                  ))}
                </div>
              </div>
            </Card>

            {/* Detail Style Selector */}
            <Card className="p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-shrink-0">
                  <h3 className="font-medium text-sm text-slate-900 dark:text-slate-100">Trang chi tiết</h3>
                  <p className="text-xs text-slate-500">/posts/[slug]</p>
                </div>
                <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                  {DETAIL_STYLES.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => {
                        handleDetailStyleChange(style.id);
                        setActivePreview('detail');
                      }}
                      title={style.description}
                      className={cn(
                        "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                        detailStyle === style.id 
                          ? "bg-cyan-500 text-white shadow-sm" 
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                      )}
                    >
                      {style.label}
                    </button>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Full Width Preview */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Eye size={18} /> Preview
                </CardTitle>
                <div className="flex items-center gap-4">
                  {/* Page toggle */}
                  <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                    <button
                      onClick={() =>{  setActivePreview('list'); }}
                      className={cn(
                        "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                        activePreview === 'list' ? "bg-white dark:bg-slate-700 shadow-sm" : "text-slate-500"
                      )}
                    >
                      Danh sách
                    </button>
                    <button
                      onClick={() =>{  setActivePreview('detail'); }}
                      className={cn(
                        "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                        activePreview === 'detail' ? "bg-white dark:bg-slate-700 shadow-sm" : "text-slate-500"
                      )}
                    >
                      Chi tiết
                    </button>
                  </div>
                  {/* Device selector */}
                  <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                    {devices.map((d) => (
                      <button
                        key={d.id}
                        onClick={() =>{  setPreviewDevice(d.id); }}
                        title={d.label}
                        className={cn(
                          "p-1.5 rounded-md transition-all",
                          previewDevice === d.id ? "bg-white dark:bg-slate-700 shadow-sm" : "text-slate-400 hover:text-slate-600"
                        )}
                      >
                        <d.icon size={16} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className={cn("mx-auto transition-all duration-300", deviceWidths[previewDevice])}>
                <BrowserFrame>
                  {activePreview === 'list' 
                    ? <ListPreview style={listStyle} brandColor={brandColor} device={previewDevice} />
                    : <DetailPreview style={detailStyle} brandColor={brandColor} device={previewDevice} />
                  }
                </BrowserFrame>
              </div>
              <div className="mt-3 text-xs text-slate-500 text-center">
                {activePreview === 'list' ? 'Trang /posts' : 'Trang /posts/[slug]'}
                {' • '}Style: <strong>{activePreview === 'list' ? LIST_STYLES.find(s => s.id === listStyle)?.label : DETAIL_STYLES.find(s => s.id === detailStyle)?.label}</strong>
                {' • '}{previewDevice === 'desktop' ? '1920px' : (previewDevice === 'tablet' ? '768px' : '375px')}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

// Browser Frame Component
function BrowserFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="border rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-lg">
      <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2 flex items-center gap-2 border-b">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
          <div className="w-3 h-3 rounded-full bg-green-400"></div>
        </div>
        <div className="flex-1 ml-4">
          <div className="bg-white dark:bg-slate-700 rounded-md px-3 py-1 text-xs text-slate-400 max-w-xs">yoursite.com/posts</div>
        </div>
      </div>
      <div className="max-h-[500px] overflow-y-auto">
        {children}
      </div>
    </div>
  );
}

// List Preview Component
function ListPreview({ style, brandColor, device }: { style: PostsListStyle; brandColor: string; device: PreviewDevice }) {
  const mockPosts = [
    { category: 'Tin tức', date: '10/01/2026', id: 1, title: 'Bài viết nổi bật số 1', views: 1234 },
    { category: 'Hướng dẫn', date: '09/01/2026', id: 2, title: 'Hướng dẫn sử dụng sản phẩm', views: 567 },
    { category: 'Tin tức', date: '08/01/2026', id: 3, title: 'Cập nhật tính năng mới', views: 890 },
    { category: 'Tips', date: '07/01/2026', id: 4, title: 'Tips và tricks hữu ích', views: 432 },
  ];
  const categories = ['Tất cả', 'Tin tức', 'Hướng dẫn', 'Tips'];

  // Full Width Layout - Horizontal filter bar + grid
  if (style === 'fullwidth') {
    return (
      <div className={cn("p-4", device === 'mobile' ? 'p-3' : '')}>
        <h2 className={cn("font-bold text-center mb-4", device === 'mobile' ? 'text-lg' : 'text-xl')}>Tin tức & Bài viết</h2>
        {/* Filter Bar */}
        <div className="bg-white border rounded-lg p-3 mb-4">
          <div className={cn("flex gap-2 items-center", device === 'mobile' ? 'flex-col' : '')}>
            <div className="flex-1 relative">
              <input 
                type="text" 
                placeholder="Tìm kiếm..." 
                className="w-full px-3 py-1.5 border rounded-lg text-xs bg-slate-50"
              />
            </div>
            <div className="flex gap-1 flex-wrap">
              {categories.slice(0, device === 'mobile' ? 3 : 4).map((cat, i) => (
                <span 
                  key={cat} 
                  className={cn("px-2 py-1 rounded-full text-xs cursor-pointer", i === 0 ? "text-white" : "bg-slate-100")}
                  style={i === 0 ? { backgroundColor: brandColor } : undefined}
                >
                  {cat}
                </span>
              ))}
            </div>
          </div>
        </div>
        {/* Results */}
        <div className="text-xs text-slate-500 mb-3">4 bài viết</div>
        {/* Grid */}
        <div className={cn("grid gap-3", device === 'mobile' ? 'grid-cols-1' : 'grid-cols-2')}>
          {mockPosts.slice(0, device === 'mobile' ? 2 : 4).map((post) => (
            <div key={post.id} className="bg-white border rounded-lg overflow-hidden">
              <div className="aspect-video bg-slate-100 flex items-center justify-center">
                <FileText size={24} className="text-slate-300" />
              </div>
              <div className="p-3">
                <span className="text-xs font-medium" style={{ color: brandColor }}>{post.category}</span>
                <h3 className="font-medium text-sm mt-1 line-clamp-2">{post.title}</h3>
                <div className="flex items-center justify-between mt-2 text-xs text-slate-400">
                  <span>{post.date}</span>
                  <span>{post.views} views</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Sidebar Layout - Classic blog
  if (style === 'sidebar') {
    return (
      <div className={cn("p-4 flex gap-4", device === 'mobile' ? 'p-3 flex-col' : '')}>
        {/* Sidebar */}
        <div className={cn("space-y-3", device === 'mobile' ? 'order-2' : 'w-1/3')}>
          {/* Search */}
          <div className="bg-slate-50 rounded-lg p-3">
            <h4 className="font-medium text-xs mb-2">Tìm kiếm</h4>
            <input type="text" placeholder="Nhập từ khóa..." className="w-full px-2 py-1.5 border rounded text-xs" />
          </div>
          {/* Categories */}
          <div className="bg-slate-50 rounded-lg p-3">
            <h4 className="font-medium text-xs mb-2">Danh mục</h4>
            <div className="space-y-1">
              {categories.map((cat, i) => (
                <div 
                  key={cat} 
                  className={cn("px-2 py-1 rounded text-xs cursor-pointer", i === 0 ? "" : "text-slate-600")}
                  style={i === 0 ? { backgroundColor: `${brandColor}15`, color: brandColor } : undefined}
                >
                  {cat}
                </div>
              ))}
            </div>
          </div>
          {/* Recent Posts */}
          <div className="bg-slate-50 rounded-lg p-3">
            <h4 className="font-medium text-xs mb-2">Bài mới nhất</h4>
            <div className="space-y-2">
              {mockPosts.slice(0, 2).map((post) => (
                <div key={post.id} className="flex gap-2">
                  <div className="w-10 h-8 bg-slate-200 rounded flex-shrink-0"></div>
                  <div className="text-xs line-clamp-2">{post.title}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Main Content */}
        <div className={cn("flex-1 space-y-3", device === 'mobile' ? 'order-1' : '')}>
          {mockPosts.slice(0, 3).map((post) => (
            <div key={post.id} className="bg-white border rounded-lg overflow-hidden flex">
              <div className="w-24 h-16 bg-slate-100 flex items-center justify-center flex-shrink-0">
                <FileText size={16} className="text-slate-300" />
              </div>
              <div className="p-2 flex-1">
                <span className="text-xs font-medium px-1.5 py-0.5 rounded" style={{ backgroundColor: `${brandColor}15`, color: brandColor }}>{post.category}</span>
                <h3 className="font-medium text-xs mt-1 line-clamp-1">{post.title}</h3>
                <span className="text-xs text-slate-400">{post.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Magazine Layout - Featured Stories Widget + Trending + Clean Grid
  return (
    <div className={cn("p-4 space-y-4", device === 'mobile' ? 'p-3' : '')}>
      {/* Featured Section - 2 column layout */}
      <div className={cn("grid gap-3", device === 'mobile' ? 'grid-cols-1' : 'grid-cols-3')}>
        {/* Main Featured */}
        <div className={cn("relative rounded-xl overflow-hidden bg-slate-900", device === 'mobile' ? '' : 'col-span-2 row-span-2')}>
          <div className={cn("bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center", device === 'mobile' ? 'aspect-video' : 'h-full min-h-[180px]')}>
            <FileText size={32} className="text-slate-600" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded text-xs font-medium text-white" style={{ backgroundColor: brandColor }}>Nổi bật</span>
              <span className="text-xs text-white/60">5 phút đọc</span>
            </div>
            <h3 className="font-bold text-sm text-white">{mockPosts[0].title}</h3>
          </div>
        </div>
        {/* Secondary Featured */}
        {device !== 'mobile' && mockPosts.slice(1, 3).map((post) => (
          <div key={post.id} className="relative rounded-lg overflow-hidden bg-slate-800">
            <div className="aspect-[16/10] bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center">
              <FileText size={16} className="text-slate-500" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-2">
              <span className="text-xs text-white/80 font-medium">{post.category}</span>
              <h4 className="font-semibold text-xs text-white line-clamp-2">{post.title}</h4>
            </div>
          </div>
        ))}
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 border-b border-slate-200">
        {categories.map((cat, i) => (
          <span 
            key={cat} 
            className={cn("px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap", i === 0 ? "text-white" : "text-slate-600 hover:bg-slate-100")}
            style={i === 0 ? { backgroundColor: brandColor } : undefined}
          >
            {cat}
          </span>
        ))}
      </div>

      {/* Trending Section */}
      {device !== 'mobile' && (
        <div className="bg-slate-50 rounded-lg p-3">
          <div className="text-xs font-semibold text-slate-700 mb-2">Đang thịnh hành</div>
          <div className="grid grid-cols-2 gap-3">
            {mockPosts.slice(0, 2).map((post, i) => (
              <div key={post.id} className="flex gap-2">
                <span className="text-lg font-bold opacity-20" style={{ color: brandColor }}>{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <div className="text-xs font-medium line-clamp-2">{post.title}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{post.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Clean Grid */}
      <div>
        <div className="text-xs font-semibold text-slate-700 mb-2">Bài viết mới nhất</div>
        <div className={cn("grid gap-3", device === 'mobile' ? 'grid-cols-1' : 'grid-cols-2')}>
          {mockPosts.slice(0, device === 'mobile' ? 2 : 2).map((post) => (
            <div key={post.id} className="flex gap-3">
              <div className="w-16 h-12 rounded bg-slate-100 flex items-center justify-center flex-shrink-0">
                <FileText size={14} className="text-slate-300" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: brandColor }}>{post.category}</span>
                <h4 className="font-medium text-xs line-clamp-2 mt-0.5">{post.title}</h4>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Detail Preview Component
function DetailPreview({ style, brandColor, device }: { style: PostsDetailStyle; brandColor: string; device: PreviewDevice }) {
  if (style === 'classic') {
    return (
      <div className={cn("p-4", device === 'mobile' ? 'p-3' : '')}>
        {/* Breadcrumb */}
        <div className="text-xs text-slate-400 mb-3">Trang chủ › Bài viết › Chi tiết</div>
        <div className={cn("flex gap-4", device === 'mobile' ? 'flex-col' : '')}>
          {/* Content */}
          <div className="flex-1">
            <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: `${brandColor}15`, color: brandColor }}>Tin tức</span>
            <h1 className="font-bold text-lg mt-2 mb-3">Tiêu đề bài viết mẫu</h1>
            <div className="aspect-video bg-slate-100 rounded-lg mb-3 flex items-center justify-center">
              <FileText size={32} className="text-slate-300" />
            </div>
            <div className="space-y-2">
              <div className="h-3 bg-slate-100 rounded w-full"></div>
              <div className="h-3 bg-slate-100 rounded w-5/6"></div>
              <div className="h-3 bg-slate-100 rounded w-4/6"></div>
            </div>
          </div>
          {/* Sidebar */}
          {device !== 'mobile' && (
            <div className="w-1/3">
              <div className="bg-slate-50 rounded-lg p-3">
                <h4 className="font-medium text-sm mb-2">Bài liên quan</h4>
                <div className="space-y-2">
                  {[1, 2].map((i) => (
                    <div key={i} className="flex gap-2">
                      <div className="w-12 h-10 bg-slate-200 rounded"></div>
                      <div className="flex-1">
                        <div className="h-2 bg-slate-200 rounded w-full mb-1"></div>
                        <div className="h-2 bg-slate-200 rounded w-3/4"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (style === 'modern') {
    // Modern - Medium/Substack inspired - Clean typography focused
    return (
      <div className="bg-white">
        {/* Clean Header */}
        <div className={cn("border-b border-slate-100", device === 'mobile' ? 'p-3' : 'p-4')}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <ArrowLeft size={10} />
              <span>Tất cả bài viết</span>
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: brandColor }}>Tin tức</span>
          </div>
          <h1 className={cn("font-bold text-slate-900 leading-tight", device === 'mobile' ? 'text-base' : 'text-lg')}>
            Tiêu đề bài viết mẫu với typography tối ưu
          </h1>
          <p className="text-xs text-slate-500 mt-2 italic">
            Đoạn mô tả ngắn về nội dung bài viết...
          </p>
          <div className="flex items-center gap-3 text-xs text-slate-400 mt-3">
            <span>10/01/2026</span>
            <span className="w-1 h-1 rounded-full bg-slate-300" />
            <span>5 phút đọc</span>
            <span className="w-1 h-1 rounded-full bg-slate-300" />
            <span>1,234 views</span>
          </div>
        </div>
        {/* Featured Image */}
        <div className="p-4">
          <div className="aspect-[16/9] bg-slate-100 rounded-lg flex items-center justify-center">
            <FileText size={24} className="text-slate-300" />
          </div>
        </div>
        {/* Content - Typography optimized */}
        <div className={cn("space-y-3", device === 'mobile' ? 'px-3 pb-3' : 'px-4 pb-4')}>
          <div className="h-3 bg-slate-100 rounded w-full"></div>
          <div className="h-3 bg-slate-100 rounded w-5/6"></div>
          <div className="h-3 bg-slate-100 rounded w-full"></div>
          <div className="h-3 bg-slate-100 rounded w-4/6"></div>
        </div>
        {/* Bottom CTA */}
        <div className="border-t border-slate-100 p-3 text-center">
          <div className="text-xs text-slate-500 mb-2">Bạn thấy bài viết hữu ích?</div>
          <span className="inline-flex items-center gap-1 text-xs font-medium text-white px-3 py-1.5 rounded-full" style={{ backgroundColor: brandColor }}>
            Khám phá thêm
          </span>
        </div>
      </div>
    );
  }

  // Minimal
  return (
    <div className={cn("p-6", device === 'mobile' ? 'p-4' : '')}>
      <div className="flex items-center gap-1 text-xs text-slate-400 mb-4">
        <ArrowLeft size={12} />
        Tất cả bài viết
      </div>
      <div className="text-center mb-4">
        <span className="text-xs font-medium uppercase tracking-wider" style={{ color: brandColor }}>Tin tức</span>
        <h1 className="font-bold text-lg mt-2">Tiêu đề bài viết mẫu</h1>
        <div className="text-xs text-slate-400 mt-1">10/01/2026 · 5 phút đọc</div>
      </div>
      <div className="aspect-[2/1] bg-slate-100 rounded-lg mb-4 flex items-center justify-center">
        <FileText size={32} className="text-slate-300" />
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-slate-100 rounded w-full"></div>
        <div className="h-3 bg-slate-100 rounded w-5/6"></div>
        <div className="h-3 bg-slate-100 rounded w-4/6"></div>
      </div>
    </div>
  );
}
