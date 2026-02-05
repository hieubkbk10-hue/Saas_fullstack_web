'use client';

import React, { use, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { Edit, GripVertical, Layers, Loader2, Plus, Search, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Badge, Button, Card, Input, Label, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, cn } from '../../../components/ui';
import { BulkActionBar, ColumnToggle, SelectCheckbox, SortableHeader, useSortableData } from '../../../components/TableUtilities';
import { ModuleGuard } from '../../../components/ModuleGuard';
import type { DragEndEvent } from '@dnd-kit/core';
import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const MODULE_KEY = 'products';

interface SortableRowProps {
  editHref: string;
  isDraggingDisabled: boolean;
  isSelected: boolean;
  onDelete: () => void;
  onToggleSelect: () => void;
  optionSummary: string;
  priceDisplay: React.ReactNode;
  sku: string;
  status: 'Active' | 'Inactive';
  stockDisplay: React.ReactNode;
  variantId: Id<'productVariants'>;
  visibleColumns: string[];
}

function SortableRow({
  editHref,
  isDraggingDisabled,
  isSelected,
  onDelete,
  onToggleSelect,
  optionSummary,
  priceDisplay,
  sku,
  status,
  stockDisplay,
  variantId,
  visibleColumns,
}: SortableRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: variantId, disabled: isDraggingDisabled });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <TableRow ref={setNodeRef} style={style} className={cn(isDragging && 'opacity-60')}>
      {visibleColumns.includes('select') && (
        <TableCell><SelectCheckbox checked={isSelected} onChange={onToggleSelect} /></TableCell>
      )}
      {visibleColumns.includes('drag') && (
        <TableCell className="w-8">
          <button
            {...attributes}
            {...listeners}
            disabled={isDraggingDisabled}
            className={cn('p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800', isDraggingDisabled && 'cursor-not-allowed opacity-40')}
          >
            <GripVertical size={16} />
          </button>
        </TableCell>
      )}
      {visibleColumns.includes('sku') && <TableCell className="font-mono text-sm">{sku}</TableCell>}
      {visibleColumns.includes('options') && <TableCell className="text-sm text-slate-600">{optionSummary}</TableCell>}
      {visibleColumns.includes('price') && <TableCell>{priceDisplay}</TableCell>}
      {visibleColumns.includes('stock') && <TableCell>{stockDisplay}</TableCell>}
      {visibleColumns.includes('status') && (
        <TableCell>
          <Badge variant={status === 'Active' ? 'default' : 'secondary'}>{status === 'Active' ? 'Hoạt động' : 'Ẩn'}</Badge>
        </TableCell>
      )}
      {visibleColumns.includes('actions') && (
        <TableCell className="text-right space-x-2">
          <Link href={editHref}>
            <Button variant="ghost" size="icon"><Edit size={16} /></Button>
          </Link>
          <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={onDelete}>
            <Trash2 size={16} />
          </Button>
        </TableCell>
      )}
    </TableRow>
  );
}

export default function ProductVariantsPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <ModuleGuard moduleKey="products">
      <ProductVariantsContent params={params} />
    </ModuleGuard>
  );
}

function ProductVariantsContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const productId = id as Id<'products'>;

  const productData = useQuery(api.products.getById, { id: productId });
  const settingsData = useQuery(api.admin.modules.listModuleSettings, { moduleKey: MODULE_KEY });
  const optionsData = useQuery(api.productOptions.listActive);
  const valuesData = useQuery(api.productOptionValues.listAll, { limit: 500 });
  const variantsData = useQuery(api.productVariants.listByProduct, { productId });

  const removeVariant = useMutation(api.productVariants.remove);
  const reorderVariants = useMutation(api.productVariants.reorder);
  const createVariant = useMutation(api.productVariants.create);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'Active' | 'Inactive'>('all');
  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'asc' | 'desc' }>({ direction: 'asc', key: null });
  const [visibleColumns, setVisibleColumns] = useState<string[]>(() => {
    if (typeof window === 'undefined') {
      return [];
    }
    try {
      const stored = window.localStorage.getItem(`admin_product_variants_visible_columns_${productId}`);
      if (stored) {
        const parsed = JSON.parse(stored) as string[];
        return parsed.length > 0 ? parsed : [];
      }
    } catch {
      return [];
    }
    return [];
  });
  const [selectedIds, setSelectedIds] = useState<Id<'productVariants'>[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [skuPrefix, setSkuPrefix] = useState('');
  const [defaultPrice, setDefaultPrice] = useState('');
  const [defaultSalePrice, setDefaultSalePrice] = useState('');
  const [defaultStock, setDefaultStock] = useState('');
  const [defaultStatus, setDefaultStatus] = useState<'Active' | 'Inactive'>('Active');
  const [defaultAllowBackorder, setDefaultAllowBackorder] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (productData?.sku && !skuPrefix) {
      setSkuPrefix(productData.sku);
    }
  }, [productData?.sku, skuPrefix]);

  useEffect(() => {
    if (visibleColumns.length > 0) {
      window.localStorage.setItem(`admin_product_variants_visible_columns_${productId}`, JSON.stringify(visibleColumns));
    }
  }, [visibleColumns, productId]);

  const variantEnabled = useMemo(() => {
    const setting = settingsData?.find(s => s.settingKey === 'variantEnabled');
    return Boolean(setting?.value);
  }, [settingsData]);

  const variantSettings = useMemo(() => {
    const getSetting = (key: string, fallback: string) => {
      const setting = settingsData?.find(s => s.settingKey === key);
      return (setting?.value as string) || fallback;
    };
    return {
      variantImages: getSetting('variantImages', 'inherit'),
      variantPricing: getSetting('variantPricing', 'variant'),
      variantStock: getSetting('variantStock', 'variant'),
    };
  }, [settingsData]);

  const optionsMap = useMemo(() => {
    const map: Record<string, { name: string; order: number }> = {};
    optionsData?.forEach(option => {
      map[option._id] = { name: option.name, order: option.order };
    });
    return map;
  }, [optionsData]);

  const valuesMap = useMemo(() => {
    const map: Record<string, { label: string; optionId: Id<'productOptions'> }> = {};
    valuesData?.forEach(value => {
      map[value._id] = { label: value.label ?? value.value, optionId: value.optionId };
    });
    return map;
  }, [valuesData]);

  const productOptions = useMemo(() => {
    if (!productData?.optionIds || !optionsData) {return [];}
    const optionIdSet = new Set(productData.optionIds);
    return optionsData
      .filter(option => optionIdSet.has(option._id))
      .sort((a, b) => a.order - b.order);
  }, [productData?.optionIds, optionsData]);

  const filteredVariants = useMemo(() => {
    let data = variantsData ? [...variantsData] : [];
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      data = data.filter(variant => variant.sku.toLowerCase().includes(searchLower));
    }
    if (filterStatus !== 'all') {
      data = data.filter(variant => variant.status === filterStatus);
    }
    return data.sort((a, b) => a.order - b.order);
  }, [variantsData, searchTerm, filterStatus]);

  const columns = [
    { key: 'select', label: 'Chọn' },
    { key: 'drag', label: '' },
    { key: 'sku', label: 'SKU', required: true },
    { key: 'options', label: 'Tùy chọn' },
    { key: 'price', label: 'Giá bán' },
    { key: 'stock', label: 'Tồn kho' },
    { key: 'status', label: 'Trạng thái' },
    { key: 'actions', label: 'Hành động', required: true },
  ];

  useEffect(() => {
    if (columns.length > 0 && visibleColumns.length === 0) {
      setVisibleColumns(columns.map(c => c.key));
    }
  }, [columns, visibleColumns.length]);

  const sortedData = useSortableData(filteredVariants, sortConfig);
  const isReorderEnabled = !searchTerm.trim() && filterStatus === 'all' && (sortConfig.key === 'order' || sortConfig.key === null);

  const toggleColumn = (key: string) => {
    setVisibleColumns(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  const toggleSelectAll = () => {
    setSelectedIds(selectedIds.length === sortedData.length ? [] : sortedData.map(item => item._id));
  };

  const toggleSelectItem = (variantId: Id<'productVariants'>) => {
    setSelectedIds(prev => prev.includes(variantId) ? prev.filter(id => id !== variantId) : [...prev, variantId]);
  };

  const handleDelete = async (variantId: Id<'productVariants'>) => {
    if (!confirm('Xóa phiên bản này?')) {return;}
    try {
      await removeVariant({ id: variantId });
      setSelectedIds(prev => prev.filter(id => id !== variantId));
      toast.success('Đã xóa phiên bản');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể xóa phiên bản');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {return;}
    if (!confirm(`Xóa ${selectedIds.length} phiên bản đã chọn?`)) {return;}
    setIsDeleting(true);
    try {
      for (const variantId of selectedIds) {
        await removeVariant({ id: variantId });
      }
      setSelectedIds([]);
      toast.success(`Đã xóa ${selectedIds.length} phiên bản`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể xóa phiên bản');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    if (!isReorderEnabled) {return;}
    const { active, over } = event;
    if (!over || active.id === over.id) {return;}

    const oldIndex = sortedData.findIndex(item => item._id === active.id);
    const newIndex = sortedData.findIndex(item => item._id === over.id);
    if (oldIndex < 0 || newIndex < 0) {return;}

    const reordered = arrayMove(sortedData, oldIndex, newIndex);
    try {
      await reorderVariants({ items: reordered.map((item, index) => ({ id: item._id, order: index })) });
      toast.success('Đã cập nhật thứ tự');
    } catch {
      toast.error('Không thể cập nhật thứ tự');
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const formatPrice = (value: number) => new Intl.NumberFormat('vi-VN', { currency: 'VND', style: 'currency' }).format(value);

  const buildOptionSummary = (variant: typeof sortedData[number]) => {
    const summary = variant.optionValues
      .slice()
      .sort((a, b) => (optionsMap[a.optionId]?.order ?? 0) - (optionsMap[b.optionId]?.order ?? 0))
      .map((item) => {
        const optionName = optionsMap[item.optionId]?.name;
        const valueLabel = item.customValue?.trim() || valuesMap[item.valueId]?.label || 'N/A';
        return optionName ? `${optionName}: ${valueLabel}` : valueLabel;
      })
      .join(' / ');
    return summary || '—';
  };

  type OptionValue = NonNullable<typeof valuesData>[number];
  const optionValuesByOption = useMemo(() => {
    const map = new Map<string, OptionValue[]>();
    valuesData?.forEach((value) => {
      if (!value.active) {return;}
      const list = map.get(value.optionId) ?? [];
      list.push(value);
      map.set(value.optionId, list);
    });
    return map;
  }, [valuesData]);

  const combinationCount = useMemo(() => {
    if (productOptions.length === 0) {return 0;}
    return productOptions.reduce((acc, option) => acc * (optionValuesByOption.get(option._id)?.length ?? 0), 1);
  }, [productOptions, optionValuesByOption]);

  const buildCombinations = () => {
    const combos: { optionId: Id<'productOptions'>; valueId: Id<'productOptionValues'> }[][] = [[]];
    for (const option of productOptions) {
      const values = optionValuesByOption.get(option._id) ?? [];
      if (values.length === 0) {
        return [];
      }
      const next: typeof combos = [];
      combos.forEach((combo) => {
        values.forEach((value) => {
          next.push([...combo, { optionId: option._id, valueId: value._id }]);
        });
      });
      combos.splice(0, combos.length, ...next);
    }
    return combos;
  };

  const handleGenerate = async () => {
    if (!skuPrefix.trim()) {
      toast.error('Vui lòng nhập SKU prefix');
      return;
    }
    if (productOptions.length === 0) {
      toast.error('Sản phẩm chưa có tùy chọn nào');
      return;
    }
    const combinations = buildCombinations();
    if (combinations.length === 0) {
      toast.error('Vui lòng đảm bảo các tùy chọn có giá trị hoạt động');
      return;
    }

    const existingKeys = new Set(
      (variantsData ?? []).map((variant) => variant.optionValues
        .slice()
        .sort((a, b) => a.optionId.localeCompare(b.optionId))
        .map((item) => `${item.optionId}:${item.valueId}:${item.customValue ?? ''}`)
        .join('|'))
    );

    const toCreate = combinations.filter((combo) => {
      const key = combo
        .slice()
        .sort((a, b) => a.optionId.localeCompare(b.optionId))
        .map((item) => `${item.optionId}:${item.valueId}:`)
        .join('|');
      return !existingKeys.has(key);
    });

    if (toCreate.length === 0) {
      toast.info('Tất cả combinations đã tồn tại');
      return;
    }

    setIsGenerating(true);
    try {
      const existingSkus = new Set((variantsData ?? []).map(variant => variant.sku));
      let counter = 1;
      const getNextSku = () => {
        let candidate = `${skuPrefix.trim()}-${counter}`;
        while (existingSkus.has(candidate)) {
          counter += 1;
          candidate = `${skuPrefix.trim()}-${counter}`;
        }
        existingSkus.add(candidate);
        counter += 1;
        return candidate;
      };

      for (const combo of toCreate) {
        await createVariant({
          allowBackorder: variantSettings.variantStock === 'variant' ? defaultAllowBackorder : undefined,
          optionValues: combo,
          price: variantSettings.variantPricing === 'variant' && defaultPrice.trim() !== '' ? Number.parseInt(defaultPrice) : undefined,
          productId,
          salePrice: variantSettings.variantPricing === 'variant' && defaultSalePrice.trim() !== '' ? Number.parseInt(defaultSalePrice) : undefined,
          sku: getNextSku(),
          status: defaultStatus,
          stock: variantSettings.variantStock === 'variant' && defaultStock.trim() !== '' ? Number.parseInt(defaultStock) : undefined,
        });
      }
      toast.success(`Đã tạo ${toCreate.length} phiên bản`);
      setIsGeneratorOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể tạo phiên bản');
    } finally {
      setIsGenerating(false);
    }
  };

  if (productData === undefined || settingsData === undefined || optionsData === undefined || valuesData === undefined || variantsData === undefined) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!productData) {
    return <div className="text-center py-8 text-slate-500">Không tìm thấy sản phẩm</div>;
  }

  if (!variantEnabled) {
    return (
      <div className="text-center py-10 text-slate-500 space-y-2">
        <p>Tính năng phiên bản đang tắt.</p>
        <Link href="/system/modules/products" className="text-orange-600 hover:underline">Bật trong hệ thống</Link>
      </div>
    );
  }

  if (!productData.hasVariants || productData.optionIds?.length === 0) {
    return (
      <div className="text-center py-10 text-slate-500 space-y-2">
        <p>Sản phẩm chưa bật phiên bản hoặc chưa chọn tùy chọn.</p>
        <Link href={`/admin/products/${productId}/edit`} className="text-orange-600 hover:underline">Cập nhật sản phẩm</Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-500/10 rounded-lg">
            <Layers className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Phiên bản sản phẩm</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">{productData.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() =>{  setIsGeneratorOpen(true); }}>Tạo nhanh</Button>
          <Link href={`/admin/products/${productId}/variants/create`}>
            <Button className="gap-2" variant="accent"><Plus size={16} /> Thêm phiên bản</Button>
          </Link>
        </div>
      </div>

      <BulkActionBar selectedCount={selectedIds.length} onDelete={handleBulkDelete} onClearSelection={() =>{  setSelectedIds([]); }} isLoading={isDeleting} />

      <Card>
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col lg:flex-row gap-4 justify-between">
          <div className="flex flex-wrap gap-4 flex-1">
            <div className="relative max-w-xs flex-1 min-w-[220px]">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input placeholder="Tìm theo SKU..." className="pl-9" value={searchTerm} onChange={(e) =>{  setSearchTerm(e.target.value); }} />
            </div>
            <select
              value={filterStatus}
              onChange={(e) =>{  setFilterStatus(e.target.value as 'all' | 'Active' | 'Inactive'); }}
              className="h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="Active">Hoạt động</option>
              <option value="Inactive">Ẩn</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <ColumnToggle columns={columns} visibleColumns={visibleColumns} onToggle={toggleColumn} />
          </div>
        </div>

        <div className="overflow-x-auto">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <Table>
              <TableHeader>
                <TableRow>
                  {visibleColumns.includes('select') && (
                    <TableHead className="w-[40px]"><SelectCheckbox checked={selectedIds.length === sortedData.length && sortedData.length > 0} onChange={toggleSelectAll} indeterminate={selectedIds.length > 0 && selectedIds.length < sortedData.length} /></TableHead>
                  )}
                  {visibleColumns.includes('drag') && <TableHead className="w-[40px]" />}
                  {visibleColumns.includes('sku') && <SortableHeader label="SKU" sortKey="sku" sortConfig={sortConfig} onSort={(key) =>{  setSortConfig(prev => ({ direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc', key })); }} />}
                  {visibleColumns.includes('options') && <TableHead>Tùy chọn</TableHead>}
                  {visibleColumns.includes('price') && <SortableHeader label="Giá bán" sortKey="price" sortConfig={sortConfig} onSort={(key) =>{  setSortConfig(prev => ({ direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc', key })); }} />}
                  {visibleColumns.includes('stock') && <SortableHeader label="Tồn kho" sortKey="stock" sortConfig={sortConfig} onSort={(key) =>{  setSortConfig(prev => ({ direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc', key })); }} />}
                  {visibleColumns.includes('status') && <SortableHeader label="Trạng thái" sortKey="status" sortConfig={sortConfig} onSort={(key) =>{  setSortConfig(prev => ({ direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc', key })); }} />}
                  {visibleColumns.includes('actions') && <TableHead className="text-right">Hành động</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                <SortableContext items={sortedData.map(item => item._id)} strategy={verticalListSortingStrategy}>
                  {sortedData.map(variant => (
                    <SortableRow
                      key={variant._id}
                      editHref={`/admin/products/${productId}/variants/${variant._id}/edit`}
                      isDraggingDisabled={!isReorderEnabled}
                      isSelected={selectedIds.includes(variant._id)}
                      onDelete={() =>{  void handleDelete(variant._id); }}
                      onToggleSelect={() =>{  toggleSelectItem(variant._id); }}
                      optionSummary={buildOptionSummary(variant)}
                      priceDisplay={
                        variantSettings.variantPricing === 'product'
                          ? formatPrice(productData.salePrice ?? productData.price)
                          : (
                            variant.salePrice
                              ? (
                                <div>
                                  <span className="text-red-500 font-medium">{formatPrice(variant.salePrice)}</span>
                                  <span className="text-slate-400 line-through text-xs ml-1">{formatPrice(variant.price ?? 0)}</span>
                                </div>
                              )
                              : formatPrice(variant.price ?? 0)
                          )
                      }
                      sku={variant.sku}
                      status={variant.status}
                      stockDisplay={variantSettings.variantStock === 'product' ? productData.stock : (variant.stock ?? 0)}
                      variantId={variant._id}
                      visibleColumns={visibleColumns}
                    />
                  ))}
                </SortableContext>
              </TableBody>
            </Table>
          </DndContext>
        </div>

        {sortedData.length === 0 && (
          <div className="text-center py-10 text-slate-500">Chưa có phiên bản nào</div>
        )}
      </Card>

      {isGeneratorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() =>{  if (!isGenerating) {setIsGeneratorOpen(false);} }} />
          <div className="relative bg-white dark:bg-slate-900 rounded-lg shadow-xl w-full max-w-xl mx-4 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Tạo nhanh phiên bản</h3>
              <Button variant="ghost" size="icon" onClick={() =>{  if (!isGenerating) {setIsGeneratorOpen(false);} }}>×</Button>
            </div>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>SKU prefix <span className="text-red-500">*</span></Label>
                <Input value={skuPrefix} onChange={(e) =>{  setSkuPrefix(e.target.value); }} placeholder="VD: PROD-RED" />
              </div>
              {variantSettings.variantPricing === 'variant' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Giá mặc định</Label>
                    <Input type="number" value={defaultPrice} onChange={(e) =>{  setDefaultPrice(e.target.value); }} placeholder="0" min="0" />
                  </div>
                  <div className="space-y-2">
                    <Label>Giá khuyến mãi</Label>
                    <Input type="number" value={defaultSalePrice} onChange={(e) =>{  setDefaultSalePrice(e.target.value); }} placeholder="0" min="0" />
                  </div>
                </div>
              )}
              {variantSettings.variantStock === 'variant' && (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label>Tồn kho mặc định</Label>
                    <Input type="number" value={defaultStock} onChange={(e) =>{  setDefaultStock(e.target.value); }} placeholder="0" min="0" />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="bulk-allow-backorder"
                      checked={defaultAllowBackorder}
                      onChange={(e) =>{  setDefaultAllowBackorder(e.target.checked); }}
                      className="w-4 h-4 rounded border-slate-300"
                    />
                    <Label htmlFor="bulk-allow-backorder" className="cursor-pointer">Cho phép đặt hàng khi hết</Label>
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <Label>Trạng thái mặc định</Label>
                <select
                  value={defaultStatus}
                  onChange={(e) =>{  setDefaultStatus(e.target.value as 'Active' | 'Inactive'); }}
                  className="w-full h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                >
                  <option value="Active">Hoạt động</option>
                  <option value="Inactive">Ẩn</option>
                </select>
              </div>
              <p className="text-xs text-slate-500">Tổng combinations dự kiến: {combinationCount}</p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() =>{  if (!isGenerating) {setIsGeneratorOpen(false);} }}>Hủy</Button>
              <Button variant="accent" onClick={handleGenerate} disabled={isGenerating}>
                {isGenerating && <Loader2 size={16} className="animate-spin mr-2" />}
                Tạo phiên bản
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
