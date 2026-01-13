'use client';

import React, { useState, useCallback } from 'react';
import { Plus, Upload, Loader2, Link as LinkIcon, ImageIcon } from 'lucide-react';
import { cn, Button, Card, CardContent, CardHeader, CardTitle, Input } from '../../../components/ui';
import { ComponentFormWrapper, useComponentForm, useBrandColor } from '../shared';
import { ClientsPreview, type ClientsStyle } from '../../previews';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';

interface ClientItem {
  id: string;
  url: string;
  link: string;
  name: string;
  inputMode: 'upload' | 'url';
}

export default function ClientsCreatePage() {
  const { title, setTitle, active, setActive, handleSubmit, isSubmitting } = useComponentForm('Khách hàng của chúng tôi', 'Clients');
  const brandColor = useBrandColor();
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);
  
  const [clientItems, setClientItems] = useState<ClientItem[]>([
    { id: 'item-1', url: '', link: '', name: '', inputMode: 'upload' },
    { id: 'item-2', url: '', link: '', name: '', inputMode: 'upload' },
    { id: 'item-3', url: '', link: '', name: '', inputMode: 'upload' },
  ]);
  const [style, setStyle] = useState<ClientsStyle>('marquee');
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  const handleImageUpload = useCallback(async (itemId: string, file: File) => {
    setUploadingId(itemId);
    try {
      const uploadUrl = await generateUploadUrl();
      const result = await fetch(uploadUrl, { method: 'POST', headers: { 'Content-Type': file.type }, body: file });
      const { storageId } = await result.json();
      const imageUrl = `${process.env.NEXT_PUBLIC_CONVEX_URL}/api/storage/${storageId}`;
      setClientItems(items => items.map(item => item.id === itemId ? { ...item, url: imageUrl } : item));
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploadingId(null);
    }
  }, [generateUploadUrl]);

  const toggleInputMode = (id: string) => {
    setClientItems(items => items.map(item => 
      item.id === id ? { ...item, inputMode: item.inputMode === 'upload' ? 'url' : 'upload', url: '' } : item
    ));
  };

  const addItem = () => {
    if (clientItems.length >= 20) return;
    setClientItems([...clientItems, { id: `item-${Date.now()}`, url: '', link: '', name: '', inputMode: 'upload' }]);
  };

  const removeItem = (id: string) => {
    if (clientItems.length <= 3) return;
    setClientItems(clientItems.filter(item => item.id !== id));
  };

  const updateItem = (id: string, field: keyof ClientItem, value: string) => {
    setClientItems(items => items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const moveItem = (idx: number, direction: -1 | 1) => {
    const newIdx = idx + direction;
    if (newIdx < 0 || newIdx >= clientItems.length) return;
    const newItems = [...clientItems];
    [newItems[idx], newItems[newIdx]] = [newItems[newIdx], newItems[idx]];
    setClientItems(newItems);
  };

  const onSubmit = (e: React.FormEvent) => {
    handleSubmit(e, { 
      items: clientItems.map(c => ({ url: c.url, link: c.link, name: c.name })), 
      style 
    });
  };

  return (
    <ComponentFormWrapper
      type="Clients"
      title={title}
      setTitle={setTitle}
      active={active}
      setActive={setActive}
      onSubmit={onSubmit}
      isSubmitting={isSubmitting}
    >
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between py-3">
          <CardTitle className="text-sm font-medium">
            Logo khách hàng ({clientItems.length}/20)
          </CardTitle>
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={addItem}
            disabled={clientItems.length >= 20}
            className="h-7 text-xs gap-1"
          >
            <Plus size={12} /> Thêm
          </Button>
        </CardHeader>
        <CardContent className="pt-0">
          {/* Compact Grid - 2 columns on mobile, 3 on tablet, 4 on desktop */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {clientItems.map((item, idx) => (
              <div 
                key={item.id} 
                className="group relative bg-slate-50 dark:bg-slate-800/50 rounded-lg p-2 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
              >
                {/* Drag handle + Delete */}
                <div className="absolute -top-1 -right-1 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  {idx > 0 && (
                    <button 
                      type="button"
                      onClick={() => moveItem(idx, -1)}
                      className="w-5 h-5 bg-slate-600 text-white rounded text-[10px] hover:bg-slate-700"
                    >
                      ←
                    </button>
                  )}
                  {idx < clientItems.length - 1 && (
                    <button 
                      type="button"
                      onClick={() => moveItem(idx, 1)}
                      className="w-5 h-5 bg-slate-600 text-white rounded text-[10px] hover:bg-slate-700"
                    >
                      →
                    </button>
                  )}
                  <button 
                    type="button"
                    onClick={() => removeItem(item.id)}
                    disabled={clientItems.length <= 3}
                    className="w-5 h-5 bg-red-500 text-white rounded text-[10px] hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ×
                  </button>
                </div>

                {/* Image - Upload or URL */}
                <div className="mb-2">
                  {/* Toggle Upload/URL */}
                  <div className="flex mb-1">
                    <button
                      type="button"
                      onClick={() => toggleInputMode(item.id)}
                      className={cn(
                        "flex-1 text-[9px] py-0.5 rounded-l border transition-colors",
                        item.inputMode === 'upload' 
                          ? "bg-slate-600 text-white border-slate-600" 
                          : "bg-white dark:bg-slate-800 text-slate-500 border-slate-300 dark:border-slate-600"
                      )}
                    >
                      Upload
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleInputMode(item.id)}
                      className={cn(
                        "flex-1 text-[9px] py-0.5 rounded-r border-t border-b border-r transition-colors",
                        item.inputMode === 'url' 
                          ? "bg-slate-600 text-white border-slate-600" 
                          : "bg-white dark:bg-slate-800 text-slate-500 border-slate-300 dark:border-slate-600"
                      )}
                    >
                      URL
                    </button>
                  </div>

                  {item.inputMode === 'upload' ? (
                    <label className="block cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(item.id, file);
                        }}
                      />
                      <div className={cn(
                        "aspect-[3/2] rounded-md overflow-hidden border-2 border-dashed flex items-center justify-center transition-colors",
                        item.url ? "border-transparent" : "border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500"
                      )}>
                        {uploadingId === item.id ? (
                          <Loader2 size={20} className="animate-spin text-slate-400" />
                        ) : item.url ? (
                          <img src={item.url} alt="" className="w-full h-full object-contain bg-white dark:bg-slate-900" />
                        ) : (
                          <div className="text-center p-1">
                            <Upload size={16} className="mx-auto text-slate-400 mb-0.5" />
                            <span className="text-[10px] text-slate-400">Click để upload</span>
                          </div>
                        )}
                      </div>
                    </label>
                  ) : (
                    <div className="space-y-1">
                      <div className="relative">
                        <ImageIcon size={10} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
                        <Input
                          placeholder="https://example.com/logo.png"
                          value={item.url}
                          onChange={(e) => updateItem(item.id, 'url', e.target.value)}
                          className="h-6 text-xs pl-6 pr-2"
                        />
                      </div>
                      {item.url && (
                        <div className="aspect-[3/2] rounded-md overflow-hidden border bg-white dark:bg-slate-900 flex items-center justify-center">
                          <img src={item.url} alt="" className="w-full h-full object-contain" onError={(e) => (e.target as HTMLImageElement).style.display = 'none'} />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Compact inputs */}
                <div className="space-y-1">
                  <Input
                    placeholder="Tên"
                    value={item.name}
                    onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                    className="h-6 text-xs px-2"
                  />
                  <div className="relative">
                    <LinkIcon size={10} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
                    <Input
                      placeholder="Link"
                      value={item.link}
                      onChange={(e) => updateItem(item.id, 'link', e.target.value)}
                      className="h-6 text-xs pl-6 pr-2"
                    />
                  </div>
                </div>

                {/* Index badge */}
                <div className="absolute bottom-1 left-1 w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                  <span className="text-[9px] font-medium text-slate-500 dark:text-slate-400">{idx + 1}</span>
                </div>
              </div>
            ))}
          </div>

          {clientItems.length < 3 && (
            <p className="text-xs text-amber-600 mt-2">⚠ Cần ít nhất 3 logo để hiệu ứng marquee hoạt động tốt</p>
          )}
        </CardContent>
      </Card>

      <ClientsPreview 
        items={clientItems.map((item, idx) => ({ id: idx + 1, url: item.url, link: item.link, name: item.name }))} 
        brandColor={brandColor}
        selectedStyle={style}
        onStyleChange={setStyle}
      />
    </ComponentFormWrapper>
  );
}
