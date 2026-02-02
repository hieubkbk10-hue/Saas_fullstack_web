 'use client';
 
 import React, { useEffect, useMemo, useState } from 'react';
 import { useMutation, useQuery } from 'convex/react';
 import { api } from '@/convex/_generated/api';
 import { Loader2, Save } from 'lucide-react';
 import { toast } from 'sonner';
 import { Badge, Button, Card, Input, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/admin/components/ui';
 
 interface SettingsDataTabProps {
   colorClasses: { button: string };
 }
 
export function SettingsDataTab({ colorClasses: _colorClasses }: SettingsDataTabProps) {
   const settingsData = useQuery(api.settings.listAll);
   const settingsGroups = useQuery(api.settings.listGroups);
   const setSetting = useMutation(api.settings.set);
 
   const [editingSettings, setEditingSettings] = useState<Record<string, string>>({});
   const [originalSettings, setOriginalSettings] = useState<Record<string, string>>({});
   const [isSavingData, setIsSavingData] = useState(false);
 
   useEffect(() => {
     if (settingsData) {
       const values: Record<string, string> = {};
       settingsData.forEach(s => { 
         values[s.key] = typeof s.value === 'string' ? s.value : JSON.stringify(s.value); 
       });
       setEditingSettings(values);
       setOriginalSettings(values);
     }
   }, [settingsData]);
 
   const dirtySettings = useMemo(() => {
     const dirty = new Set<string>();
     Object.keys(editingSettings).forEach(key => {
       if (editingSettings[key] !== originalSettings[key]) dirty.add(key);
     });
     return dirty;
   }, [editingSettings, originalSettings]);
 
   const hasDataChanges = dirtySettings.size > 0;
 
   const settingsByGroup = useMemo(() => {
     const groups: Record<string, typeof settingsData> = {};
     settingsData?.forEach(s => {
       groups[s.group] ??= [];
       groups[s.group]!.push(s);
     });
     return groups;
   }, [settingsData]);
 
   const stats = useMemo(() => ({
     total: settingsData?.length ?? 0,
     groups: settingsGroups?.length ?? 0,
     filled: settingsData?.filter(s => s.value && s.value !== '').length ?? 0,
   }), [settingsData, settingsGroups]);
 
   const handleSaveSetting = async (key: string, group: string) => {
     const value = editingSettings[key];
     await setSetting({ group, key, value });
     setOriginalSettings(prev => ({ ...prev, [key]: value }));
     toast.success(`Đã lưu ${key}`);
   };
 
   const handleSaveAllDirty = async () => {
     if (dirtySettings.size === 0) return;
     setIsSavingData(true);
     try {
       for (const key of dirtySettings) {
         const setting = settingsData?.find(s => s.key === key);
         if (setting) await setSetting({ group: setting.group, key, value: editingSettings[key] });
       }
       setOriginalSettings({ ...editingSettings });
       toast.success(`Đã lưu ${dirtySettings.size} settings`);
     } catch {
       toast.error('Có lỗi khi lưu settings');
     } finally {
       setIsSavingData(false);
     }
   };
 
   return (
     <div className="space-y-6">
       <div className="grid grid-cols-4 gap-4">
         <Card className="p-4"><p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.total}</p><p className="text-sm text-slate-500">Tổng settings</p></Card>
         <Card className="p-4"><p className="text-2xl font-bold text-orange-600">{stats.groups}</p><p className="text-sm text-slate-500">Nhóm</p></Card>
         <Card className="p-4"><p className="text-2xl font-bold text-emerald-600">{stats.filled}</p><p className="text-sm text-slate-500">Đã điền</p></Card>
         <Card className="p-4"><p className="text-2xl font-bold text-amber-600">{dirtySettings.size}</p><p className="text-sm text-slate-500">Chưa lưu</p></Card>
       </div>
 
       {hasDataChanges && (
         <Card className="p-4 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20">
           <div className="flex items-center justify-between">
             <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
               <span className="text-sm text-amber-700 dark:text-amber-400">Có {dirtySettings.size} thay đổi chưa lưu</span>
             </div>
             <Button onClick={handleSaveAllDirty} disabled={isSavingData} className="gap-2 bg-amber-600 hover:bg-amber-500">
               {isSavingData ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
               Lưu tất cả ({dirtySettings.size})
             </Button>
           </div>
         </Card>
       )}
 
       {settingsGroups?.map(group => (
         <Card key={group}>
           <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
             <Badge variant="secondary" className="capitalize">{group}</Badge>
             <span className="text-sm text-slate-500">({settingsByGroup[group]?.length ?? 0} settings)</span>
           </div>
           <Table>
             <TableHeader>
               <TableRow>
                 <TableHead className="w-[200px]">Key</TableHead>
                 <TableHead>Value</TableHead>
                 <TableHead className="w-[100px]">Action</TableHead>
               </TableRow>
             </TableHeader>
             <TableBody>
               {settingsByGroup[group]?.map(setting => {
                 const isDirty = dirtySettings.has(setting.key);
                 return (
                   <TableRow key={setting._id} className={isDirty ? 'bg-amber-50 dark:bg-amber-950/20' : ''}>
                     <TableCell className="font-mono text-sm">
                       {setting.key}
                       {isDirty && <span className="ml-2 text-amber-500">*</span>}
                     </TableCell>
                     <TableCell>
                       <Input
                         value={editingSettings[setting.key] ?? ''}
                         onChange={(e) => setEditingSettings(prev => ({ ...prev, [setting.key]: e.target.value }))}
                         className={`h-8 ${isDirty ? 'border-amber-400 dark:border-amber-600' : ''}`}
                       />
                     </TableCell>
                     <TableCell>
                       <Button 
                         size="sm" 
                         variant={isDirty ? 'default' : 'outline'}
                         onClick={async () => handleSaveSetting(setting.key, setting.group)}
                         disabled={!isDirty}
                         className={isDirty ? 'bg-amber-600 hover:bg-amber-500' : ''}
                       >Lưu</Button>
                     </TableCell>
                   </TableRow>
                 );
               })}
             </TableBody>
           </Table>
         </Card>
       ))}
 
       {(!settingsData || settingsData.length === 0) && (
         <Card className="p-8 text-center text-slate-500">Chưa có settings nào.</Card>
       )}
     </div>
   );
 }
