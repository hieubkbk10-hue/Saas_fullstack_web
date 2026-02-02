 'use client';
 
import React, { useCallback, useMemo, useState, useEffect } from 'react';
 import Image from 'next/image';
 import { useQuery } from 'convex/react';
 import { api } from '@/convex/_generated/api';
 import { AlertTriangle, BarChart3, Loader2, Package, RefreshCw, TrendingUp, Users } from 'lucide-react';
 import { Badge, Button, Card } from '@/app/admin/components/ui';
 import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
 
 interface AnalyticsDataTabProps {
   colorClasses: { button: string };
 }
 
const MODULE_KEY = 'analytics';

 function formatCurrency(value: number): string {
   if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`;
   if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
   if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
   return value.toLocaleString('vi-VN');
 }
 
export function AnalyticsDataTab({ colorClasses: _colorClasses }: AnalyticsDataTabProps) {
  // Query features and settings from Convex
  const featuresData = useQuery(api.admin.modules.listModuleFeatures, { moduleKey: MODULE_KEY });
  const settingsData = useQuery(api.admin.modules.listModuleSettings, { moduleKey: MODULE_KEY });

  // Derive featuresEnabled from query
  const featuresEnabled = useMemo(() => {
    const result: Record<string, boolean> = {};
    featuresData?.forEach(f => { result[f.featureKey] = f.enabled; });
    return result;
  }, [featuresData]);

  // Derive settings from query
  const settings = useMemo(() => {
    const defaultPeriod = settingsData?.find(s => s.settingKey === 'defaultPeriod')?.value as string ?? '30d';
    const autoRefresh = settingsData?.find(s => s.settingKey === 'autoRefresh')?.value as boolean ?? true;
    const refreshInterval = settingsData?.find(s => s.settingKey === 'refreshInterval')?.value as number ?? 300;
    return { autoRefresh, defaultPeriod, refreshInterval };
  }, [settingsData]);

  const [selectedPeriod, setSelectedPeriod] = useState('30d');
   const [lastRefresh, setLastRefresh] = useState(() => Date.now());
 
  // Update selectedPeriod when settings load
  useEffect(() => {
    if (settings.defaultPeriod) {
      setSelectedPeriod(settings.defaultPeriod);
    }
  }, [settings.defaultPeriod]);

   const summaryStats = useQuery(api.analytics.getSummaryStats, { period: selectedPeriod });
   const chartData = useQuery(api.analytics.getRevenueChartData, { period: selectedPeriod });
   const topProducts = useQuery(api.analytics.getTopProducts, { limit: 5 });
   const lowStockProducts = useQuery(api.analytics.getLowStockProducts, { limit: 5, threshold: 10 });
 
  const isLoading = summaryStats === undefined || featuresData === undefined;
 
   const handleManualRefresh = useCallback(() => setLastRefresh(Date.now()), []);
 
   useEffect(() => {
     if (!settings.autoRefresh || settings.refreshInterval <= 0) return;
     const interval = setInterval(() => setLastRefresh(Date.now()), settings.refreshInterval * 1000);
     return () => clearInterval(interval);
   }, [settings.autoRefresh, settings.refreshInterval]);
 
   const statsCards = useMemo(() => {
     const cards = [];
     if (featuresEnabled.enableSales) {
       cards.push({ icon: TrendingUp, label: 'Doanh thu', value: summaryStats ? formatCurrency(summaryStats.revenue.value) : '...', change: summaryStats?.revenue.change ?? 0 });
       cards.push({ icon: Package, label: 'Đơn hàng', value: summaryStats?.orders.value.toLocaleString('vi-VN') ?? '...', change: summaryStats?.orders.change ?? 0 });
     }
     if (featuresEnabled.enableCustomers) {
       cards.push({ icon: Users, label: 'Khách mới', value: summaryStats?.customers.value.toLocaleString('vi-VN') ?? '...', change: summaryStats?.customers.change ?? 0 });
     }
     if (featuresEnabled.enableProducts) {
       cards.push({ icon: Package, label: 'Sản phẩm', value: summaryStats?.products.value.toLocaleString('vi-VN') ?? '...', change: 0, extra: summaryStats?.products.lowStock ? `${summaryStats.products.lowStock} sắp hết` : undefined });
     }
     return cards;
   }, [featuresEnabled, summaryStats]);
 
   if (isLoading) {
     return <div className="flex items-center justify-center h-64"><Loader2 size={32} className="animate-spin text-rose-500" /></div>;
   }
 
   return (
     <div className="space-y-6">
       <div className="flex items-center justify-between">
         <div className="flex items-center gap-2">
           <select value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value)} className="text-sm border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-1.5 bg-white dark:bg-slate-800">
             <option value="7d">7 ngày</option>
             <option value="30d">30 ngày</option>
             <option value="90d">90 ngày</option>
             <option value="1y">1 năm</option>
           </select>
           {settings.autoRefresh && <span className="text-xs text-slate-500">Auto-refresh: {settings.refreshInterval}s</span>}
         </div>
         <Button variant="outline" size="sm" onClick={handleManualRefresh}><RefreshCw size={14} className="mr-1" /> Refresh</Button>
       </div>
 
       {statsCards.length > 0 ? (
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           {statsCards.map((stat, i) => (
             <Card key={i} className="p-4">
               <div className="flex items-center gap-3">
                 <div className="p-2 bg-rose-500/10 rounded-lg"><stat.icon size={20} className="text-rose-600 dark:text-rose-400" /></div>
                 <div className="flex-1 min-w-0">
                   <p className="text-xs text-slate-500 truncate">{stat.label}</p>
                   <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{stat.value}</p>
                   <div className="flex items-center gap-1">
                     {stat.change !== 0 && <Badge variant={stat.change > 0 ? "success" : "destructive"} className="text-xs">{stat.change > 0 ? '+' : ''}{stat.change}%</Badge>}
                     {stat.extra && <span className="text-xs text-amber-600 flex items-center gap-0.5"><AlertTriangle size={10} /> {stat.extra}</span>}
                   </div>
                 </div>
               </div>
             </Card>
           ))}
         </div>
       ) : (
         <Card className="p-8 text-center"><BarChart3 size={48} className="mx-auto text-slate-300 mb-4" /><p className="text-slate-500">Không có thống kê nào được bật.</p></Card>
       )}
 
       {featuresEnabled.enableSales && chartData && chartData.length > 0 && (
         <Card className="p-6">
           <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Biểu đồ doanh thu</h3>
           <div className="h-64">
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={chartData}>
                 <defs><linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ec4899" stopOpacity={0.3}/><stop offset="95%" stopColor="#ec4899" stopOpacity={0}/></linearGradient></defs>
                 <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                 <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                 <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" tickFormatter={(value) => formatCurrency(value)} />
                 <Tooltip formatter={(value) => [formatCurrency(value as number) + ' VNĐ', 'Doanh thu']} contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f1f5f9' }} />
                 <Area type="monotone" dataKey="revenue" stroke="#ec4899" strokeWidth={2} fill="url(#colorRevenue)" />
               </AreaChart>
             </ResponsiveContainer>
           </div>
         </Card>
       )}
 
       {featuresEnabled.enableSales && chartData && chartData.length > 0 && (
         <Card className="p-6">
           <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Số đơn hàng</h3>
           <div className="h-48">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={chartData}>
                 <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                 <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                 <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                 <Tooltip formatter={(value) => [value + ' đơn', 'Đơn hàng']} contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f1f5f9' }} />
                 <Bar dataKey="orders" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
               </BarChart>
             </ResponsiveContainer>
           </div>
         </Card>
       )}
 
       {featuresEnabled.enableProducts && topProducts && topProducts.length > 0 && (
         <Card className="p-6">
           <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Sản phẩm bán chạy</h3>
           <div className="space-y-3">
             {topProducts.map((product, i) => (
               <div key={product.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                 <div className="flex items-center gap-3">
                   <span className="text-sm font-medium text-rose-600 w-6">#{i + 1}</span>
                   {product.image && <Image src={product.image} alt={product.name} width={40} height={40} className="w-10 h-10 rounded object-cover" />}
                   <span className="text-sm text-slate-700 dark:text-slate-300">{product.name}</span>
                 </div>
                 <div className="text-right">
                   <Badge variant="default">{product.sales} đã bán</Badge>
                   <p className="text-xs text-slate-500 mt-1">{formatCurrency(product.revenue)} VNĐ</p>
                 </div>
               </div>
             ))}
           </div>
         </Card>
       )}
 
       {featuresEnabled.enableProducts && lowStockProducts && lowStockProducts.length > 0 && (
         <Card className="p-6 border-amber-200 dark:border-amber-800">
           <h3 className="text-lg font-semibold text-amber-600 dark:text-amber-400 mb-4 flex items-center gap-2"><AlertTriangle size={20} /> Sản phẩm sắp hết hàng</h3>
           <div className="space-y-2">
             {lowStockProducts.map((product) => (
               <div key={product.id} className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                 <div><span className="text-sm text-slate-700 dark:text-slate-300">{product.name}</span><p className="text-xs text-slate-500">SKU: {product.sku}</p></div>
                 <Badge variant="warning" className="text-xs">Còn {product.stock}</Badge>
               </div>
             ))}
           </div>
         </Card>
       )}
 
      <p className="text-xs text-slate-500 text-center">Last refresh: {new Date(lastRefresh).toLocaleTimeString('vi-VN')}</p>
     </div>
   );
 }
