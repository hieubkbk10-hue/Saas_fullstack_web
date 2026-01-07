'use client';

import React, { useState, useMemo } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { toast } from 'sonner';
import { 
  Button, Card, CardHeader, CardTitle, CardContent, Input, Label, cn, Badge
} from '../components/ui';
import { ModuleGuard } from '../components/ModuleGuard';
import { 
  Plus, Trash2, Save, ArrowUp, ArrowDown, GripVertical, ChevronRight, 
  Menu, Loader2, RefreshCw, ExternalLink, Eye, EyeOff, ChevronLeft
} from 'lucide-react';

const MODULE_KEY = 'menus';

type MenuItem = {
  _id: Id<"menuItems">;
  _creationTime: number;
  menuId: Id<"menus">;
  label: string;
  url: string;
  order: number;
  depth: number;
  parentId?: Id<"menuItems">;
  icon?: string;
  openInNewTab?: boolean;
  active: boolean;
};

export default function MenuBuilderPageWrapper() {
  return (
    <ModuleGuard moduleKey="menus">
      <MenuBuilderPage />
    </ModuleGuard>
  );
}

function MenuBuilderPage() {
  const menusData = useQuery(api.menus.listMenus);
  const seedMenusModule = useMutation(api.seed.seedMenusModule);
  const clearMenusData = useMutation(api.seed.clearMenusData);

  const [selectedMenuId, setSelectedMenuId] = useState<Id<"menus"> | null>(null);

  const isLoading = menusData === undefined;

  // Auto-select first menu when data loads
  React.useEffect(() => {
    if (menusData && menusData.length > 0 && !selectedMenuId) {
      setSelectedMenuId(menusData[0]._id);
    }
  }, [menusData, selectedMenuId]);

  const handleReset = async () => {
    if (confirm('Xóa tất cả và seed lại dữ liệu mẫu?')) {
      try {
        await clearMenusData();
        await seedMenusModule();
        setSelectedMenuId(null);
        toast.success('Đã reset dữ liệu menu');
      } catch {
        toast.error('Có lỗi khi reset dữ liệu');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Menu Builder</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Quản lý menu điều hướng cho website</p>
        </div>
        <Button variant="outline" className="gap-2" onClick={handleReset}>
          <RefreshCw size={16}/> Reset
        </Button>
      </div>

      {/* Menu Tabs */}
      {menusData && menusData.length > 0 ? (
        <>
          <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700">
            {menusData.map(menu => (
              <button
                key={menu._id}
                onClick={() => setSelectedMenuId(menu._id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                  selectedMenuId === menu._id
                    ? "border-orange-500 text-orange-600 dark:text-orange-400"
                    : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                )}
              >
                <Menu size={16} />
                {menu.name}
                <Badge variant="secondary" className="text-xs">{menu.location}</Badge>
              </button>
            ))}
          </div>

          {selectedMenuId && (
            <MenuItemsEditor menuId={selectedMenuId} />
          )}
        </>
      ) : (
        <Card className="p-8 text-center">
          <Menu className="w-12 h-12 mx-auto mb-4 text-slate-400" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">Chưa có menu nào</h3>
          <p className="text-slate-500 mb-4">Nhấn Reset để tạo dữ liệu mẫu</p>
          <Button onClick={handleReset} className="gap-2 bg-orange-600 hover:bg-orange-500">
            <RefreshCw size={16}/> Tạo dữ liệu mẫu
          </Button>
        </Card>
      )}
    </div>
  );
}

function MenuItemsEditor({ menuId }: { menuId: Id<"menus"> }) {
  const menuItemsData = useQuery(api.menus.listMenuItems, { menuId });
  const settingsData = useQuery(api.admin.modules.listModuleSettings, { moduleKey: MODULE_KEY });
  const featuresData = useQuery(api.admin.modules.listModuleFeatures, { moduleKey: MODULE_KEY });
  const createMenuItem = useMutation(api.menus.createMenuItem);
  const updateMenuItem = useMutation(api.menus.updateMenuItem);
  const removeMenuItem = useMutation(api.menus.removeMenuItem);
  const reorderMenuItems = useMutation(api.menus.reorderMenuItems);

  const [editingItems, setEditingItems] = useState<Map<string, { label: string; url: string }>>(new Map());
  const [isSaving, setIsSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Settings from System Config
  const menusPerPage = useMemo(() => {
    const setting = settingsData?.find(s => s.settingKey === 'menusPerPage');
    return (setting?.value as number) || 10;
  }, [settingsData]);

  const maxDepth = useMemo(() => {
    const setting = settingsData?.find(s => s.settingKey === 'maxDepth');
    return (setting?.value as number) || 3;
  }, [settingsData]);

  // Feature toggles from System Config
  const enabledFeatures = useMemo(() => {
    const features: Record<string, boolean> = {};
    featuresData?.forEach(f => { features[f.featureKey] = f.enabled; });
    return features;
  }, [featuresData]);

  const showNested = enabledFeatures.enableNested ?? true;
  const showNewTab = enabledFeatures.enableNewTab ?? true;

  const items = useMemo(() => {
    return menuItemsData?.sort((a, b) => a.order - b.order) || [];
  }, [menuItemsData]);

  // Pagination
  const totalPages = Math.ceil(items.length / menusPerPage);
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * menusPerPage;
    return items.slice(start, start + menusPerPage);
  }, [items, currentPage, menusPerPage]);

  const isLoading = menuItemsData === undefined;

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === items.length - 1)) return;
    
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    const newItems = [...items];
    
    const updates = [
      { id: newItems[index]._id, order: newItems[swapIndex].order },
      { id: newItems[swapIndex]._id, order: newItems[index].order },
    ];
    
    try {
      await reorderMenuItems({ items: updates });
    } catch {
      toast.error('Có lỗi khi sắp xếp');
    }
  };

  const handleIndent = async (item: MenuItem, direction: 'in' | 'out') => {
    const newDepth = direction === 'in' 
      ? Math.min(item.depth + 1, maxDepth - 1) 
      : Math.max(item.depth - 1, 0);
    
    if (newDepth === item.depth) return;
    
    try {
      await updateMenuItem({ id: item._id, depth: newDepth });
    } catch {
      toast.error('Có lỗi khi cập nhật');
    }
  };

  const handleToggleActive = async (item: MenuItem) => {
    try {
      await updateMenuItem({ id: item._id, active: !item.active });
      toast.success(item.active ? 'Đã ẩn menu item' : 'Đã hiện menu item');
    } catch {
      toast.error('Có lỗi khi cập nhật');
    }
  };

  const handleDelete = async (id: Id<"menuItems">) => {
    if (confirm('Xóa liên kết này?')) {
      try {
        await removeMenuItem({ id });
        toast.success('Đã xóa');
      } catch {
        toast.error('Có lỗi khi xóa');
      }
    }
  };

  const handleAdd = async () => {
    try {
      await createMenuItem({
        menuId,
        label: 'Liên kết mới',
        url: '/',
        depth: 0,
        active: true,
      });
      toast.success('Đã thêm liên kết mới');
    } catch {
      toast.error('Có lỗi khi thêm');
    }
  };

  const startEditing = (item: MenuItem) => {
    setEditingItems(prev => new Map(prev).set(item._id, { label: item.label, url: item.url }));
  };

  const updateEditingItem = (id: string, field: 'label' | 'url', value: string) => {
    setEditingItems(prev => {
      const newMap = new Map(prev);
      const current = newMap.get(id);
      if (current) {
        newMap.set(id, { ...current, [field]: value });
      }
      return newMap;
    });
  };

  const handleSaveItem = async (item: MenuItem) => {
    const edited = editingItems.get(item._id);
    if (!edited) return;
    
    if (edited.label === item.label && edited.url === item.url) {
      setEditingItems(prev => {
        const newMap = new Map(prev);
        newMap.delete(item._id);
        return newMap;
      });
      return;
    }
    
    setIsSaving(true);
    try {
      await updateMenuItem({ id: item._id, label: edited.label, url: edited.url });
      setEditingItems(prev => {
        const newMap = new Map(prev);
        newMap.delete(item._id);
        return newMap;
      });
      toast.success('Đã lưu');
    } catch {
      toast.error('Có lỗi khi lưu');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 size={24} className="animate-spin text-orange-500" />
      </div>
    );
  }

  // Get actual index in full items array for move operations
  const getActualIndex = (item: MenuItem) => items.findIndex(i => i._id === item._id);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-3">
        {paginatedItems.map((item) => {
          const isEditing = editingItems.has(item._id);
          const editedValues = editingItems.get(item._id);
          const actualIndex = getActualIndex(item);
          
          return (
            <div 
              key={item._id}
              className={cn(
                "flex items-center gap-3 p-3 bg-white dark:bg-slate-900 border rounded-lg shadow-sm transition-all",
                showNested && item.depth === 1 ? "ml-8 border-l-4 border-l-orange-500/30" : "",
                showNested && item.depth === 2 ? "ml-16 border-l-4 border-l-orange-500/50" : "border-slate-200 dark:border-slate-700",
                !item.active && "opacity-50"
              )}
            >
              <div className="flex flex-col gap-1 text-slate-300">
                <button type="button" onClick={() => handleMove(actualIndex, 'up')} className="hover:text-orange-600 disabled:opacity-30" disabled={actualIndex === 0}><ArrowUp size={14}/></button>
                <GripVertical size={14} />
                <button type="button" onClick={() => handleMove(actualIndex, 'down')} className="hover:text-orange-600 disabled:opacity-30" disabled={actualIndex === items.length - 1}><ArrowDown size={14}/></button>
              </div>
              
              <div className="flex-1 grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs text-slate-500">Nhãn hiển thị</Label>
                  {isEditing ? (
                    <Input 
                      value={editedValues?.label || ''} 
                      onChange={(e) => updateEditingItem(item._id, 'label', e.target.value)} 
                      className="h-8 text-sm" 
                    />
                  ) : (
                    <div 
                      className="h-8 px-3 py-1.5 text-sm rounded-md bg-slate-50 dark:bg-slate-800 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700"
                      onClick={() => startEditing(item)}
                    >
                      {item.label}
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-slate-500">URL</Label>
                  {isEditing ? (
                    <Input 
                      value={editedValues?.url || ''} 
                      onChange={(e) => updateEditingItem(item._id, 'url', e.target.value)} 
                      className="h-8 text-sm font-mono text-xs" 
                    />
                  ) : (
                    <div 
                      className="h-8 px-3 py-1.5 text-sm font-mono text-xs rounded-md bg-slate-50 dark:bg-slate-800 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 truncate"
                      onClick={() => startEditing(item)}
                    >
                      {item.url}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1 border-l border-slate-100 dark:border-slate-700 pl-3">
                {isEditing ? (
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-green-600 hover:bg-green-50" 
                    onClick={() => handleSaveItem(item)}
                    disabled={isSaving}
                  >
                    <Save size={14}/>
                  </Button>
                ) : (
                  <>
                    {showNested && (
                      <>
                        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleIndent(item, 'out')} disabled={item.depth === 0} title="Thụt lề trái">
                          <ChevronRight size={14} className="rotate-180"/>
                        </Button>
                        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleIndent(item, 'in')} disabled={item.depth >= maxDepth - 1} title="Thụt lề phải">
                          <ChevronRight size={14}/>
                        </Button>
                      </>
                    )}
                    {showNewTab && item.openInNewTab && (
                      <span title="Mở tab mới"><ExternalLink size={14} className="text-slate-400" /></span>
                    )}
                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleToggleActive(item)} title={item.active ? 'Ẩn' : 'Hiện'}>
                      {item.active ? <Eye size={14}/> : <EyeOff size={14} className="text-slate-400"/>}
                    </Button>
                  </>
                )}
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:bg-red-50" onClick={() => handleDelete(item._id)}>
                  <Trash2 size={14}/>
                </Button>
              </div>
            </div>
          );
        })}

        <Button variant="outline" className="w-full border-dashed" onClick={handleAdd}>
          <Plus size={16} className="mr-2"/> Thêm liên kết mới
        </Button>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
            <div className="text-sm text-slate-500">
              Hiển thị {(currentPage - 1) * menusPerPage + 1}-{Math.min(currentPage * menusPerPage, items.length)} / {items.length}
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={14} />
              </Button>
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Trang {currentPage} / {totalPages}
              </span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight size={14} />
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Thống kê</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Tổng menu items:</span>
              <span className="font-medium">{items.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Đang hiện:</span>
              <span className="font-medium text-green-600">{items.filter(i => i.active).length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Đang ẩn:</span>
              <span className="font-medium text-slate-400">{items.filter(i => !i.active).length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Cấp 1 (Root):</span>
              <span className="font-medium">{items.filter(i => i.depth === 0).length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Cấp 2 (Dropdown):</span>
              <span className="font-medium">{items.filter(i => i.depth === 1).length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Cấp 3 (Sub-menu):</span>
              <span className="font-medium">{items.filter(i => i.depth === 2).length}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Hướng dẫn</CardTitle></CardHeader>
          <CardContent className="text-sm text-slate-500 space-y-4">
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700">
              <p className="font-medium text-slate-900 dark:text-slate-100 mb-1">Cấp 1 (Root)</p>
              <p>Hiển thị trực tiếp trên thanh menu ngang.</p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700 ml-4 border-l-4 border-l-orange-500/30">
              <p className="font-medium text-slate-900 dark:text-slate-100 mb-1">Cấp 2 (Dropdown)</p>
              <p>Hiển thị khi hover vào mục cấp 1.</p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700 ml-8 border-l-4 border-l-orange-500/50">
              <p className="font-medium text-slate-900 dark:text-slate-100 mb-1">Cấp 3 (Sub-menu)</p>
              <p>Hiển thị khi hover vào mục cấp 2.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
