'use client';

import React, { useState, useMemo } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui';
import { ModuleGuard } from '../components/ModuleGuard';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Loader2 } from 'lucide-react';

type TimeRange = 'today' | '7d' | '30d' | '3m' | '1y' | 'all';

const TIME_TABS: { key: TimeRange; label: string }[] = [
  { key: 'today', label: 'Hôm nay' },
  { key: '7d', label: '7 ngày' },
  { key: '30d', label: '30 ngày' },
  { key: '3m', label: '3 tháng' },
  { key: '1y', label: '1 năm' },
  { key: 'all', label: 'Tất cả' },
];

const MOCK_DATA: Record<TimeRange, { 
  chart: { name: string; visits: number }[];
  visitors: number;
  pageviews: number;
  pages: { label: string; value: number }[];
  sources: { label: string; value: number }[];
}> = {
  today: {
    chart: [
      { name: '00:00', visits: 5 }, { name: '04:00', visits: 2 }, { name: '08:00', visits: 15 },
      { name: '12:00', visits: 25 }, { name: '16:00', visits: 18 }, { name: '20:00', visits: 12 },
    ],
    visitors: 12, pageviews: 45,
    pages: [{ label: '/', value: 20 }, { label: '/products', value: 12 }, { label: '/cart', value: 8 }],
    sources: [{ label: 'Trực tiếp', value: 25 }, { label: 'google.com', value: 15 }],
  },
  '7d': {
    chart: [
      { name: 'T2', visits: 45 }, { name: 'T3', visits: 62 }, { name: 'T4', visits: 58 },
      { name: 'T5', visits: 71 }, { name: 'T6', visits: 89 }, { name: 'T7', visits: 120 }, { name: 'CN', visits: 95 },
    ],
    visitors: 106, pageviews: 540,
    pages: [{ label: '/', value: 180 }, { label: '/products', value: 120 }, { label: '/cart', value: 85 }, { label: '/checkout', value: 60 }],
    sources: [{ label: 'Trực tiếp', value: 220 }, { label: 'google.com', value: 180 }, { label: 'facebook.com', value: 90 }],
  },
  '30d': {
    chart: [
      { name: '01/10', visits: 120 }, { name: '05/10', visits: 180 }, { name: '10/10', visits: 150 },
      { name: '15/10', visits: 250 }, { name: '20/10', visits: 390 }, { name: '25/10', visits: 320 }, { name: '30/10', visits: 480 },
    ],
    visitors: 1890, pageviews: 7910,
    pages: [{ label: '/', value: 2910 }, { label: '/products', value: 1730 }, { label: '/cart', value: 1200 }, { label: '/checkout', value: 820 }, { label: '/blog', value: 620 }],
    sources: [{ label: 'Trực tiếp', value: 4530 }, { label: 'google.com', value: 1660 }, { label: 'facebook.com', value: 800 }, { label: 'tiktok.com', value: 400 }],
  },
  '3m': {
    chart: [
      { name: 'T8', visits: 2100 }, { name: 'T9', visits: 2800 }, { name: 'T10', visits: 3200 },
    ],
    visitors: 8100, pageviews: 32500,
    pages: [{ label: '/', value: 12000 }, { label: '/products', value: 8500 }, { label: '/cart', value: 5200 }, { label: '/checkout', value: 3800 }],
    sources: [{ label: 'Trực tiếp', value: 15000 }, { label: 'google.com', value: 9500 }, { label: 'facebook.com', value: 5000 }],
  },
  '1y': {
    chart: [
      { name: 'T1', visits: 1800 }, { name: 'T3', visits: 2200 }, { name: 'T5', visits: 2800 },
      { name: 'T7', visits: 3500 }, { name: 'T9', visits: 4200 }, { name: 'T11', visits: 5100 },
    ],
    visitors: 45000, pageviews: 180000,
    pages: [{ label: '/', value: 65000 }, { label: '/products', value: 45000 }, { label: '/cart', value: 32000 }],
    sources: [{ label: 'Trực tiếp', value: 85000 }, { label: 'google.com', value: 52000 }, { label: 'facebook.com', value: 28000 }],
  },
  all: {
    chart: [
      { name: '2022', visits: 25000 }, { name: '2023', visits: 42000 }, { name: '2024', visits: 68000 },
    ],
    visitors: 135000, pageviews: 540000,
    pages: [{ label: '/', value: 195000 }, { label: '/products', value: 135000 }, { label: '/cart', value: 96000 }],
    sources: [{ label: 'Trực tiếp', value: 255000 }, { label: 'google.com', value: 156000 }, { label: 'facebook.com', value: 84000 }],
  },
};

const ProgressBar = ({ label, value, color = "bg-blue-500" }: { label: string, value: number, color?: string }) => (
  <div className="mb-4">
    <div className="flex justify-between mb-1.5">
      <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate max-w-[200px]">{label}</span>
      <span className="text-sm text-slate-500 dark:text-slate-400">{value}</span>
    </div>
    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
      <div className={`h-2 rounded-full ${color}`} style={{ width: `${Math.min(value / 5, 100)}%` }}></div>
    </div>
  </div>
);

export default function DashboardPage() {
  return (
    <ModuleGuard moduleKey="analytics">
      <DashboardContent />
    </ModuleGuard>
  );
}

const formatNumber = (num: number): string => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
};

function DashboardContent() {
  const featuresData = useQuery(api.admin.modules.listModuleFeatures, { moduleKey: 'analytics' });
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  
  const isLoading = featuresData === undefined;
  
  const isFeatureEnabled = (featureKey: string): boolean => {
    const feature = featuresData?.find(f => f.featureKey === featureKey);
    return feature?.enabled ?? true;
  };

  const currentData = useMemo(() => MOCK_DATA[timeRange], [timeRange]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-slate-400" />
      </div>
    );
  }

  const showSales = isFeatureEnabled('enableSales');
  const showCustomers = isFeatureEnabled('enableCustomers');
  const showProducts = isFeatureEnabled('enableProducts');
  const showTraffic = isFeatureEnabled('enableTraffic');

  const hasAnyFeature = showSales || showCustomers || showProducts || showTraffic;

  if (!hasAnyFeature) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Tổng quan</h1>
          <p className="text-slate-500 dark:text-slate-400">Chào mừng trở lại, Admin User!</p>
        </div>
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardContent className="p-12 text-center">
            <p className="text-slate-500 dark:text-slate-400">
              Chưa có báo cáo nào được bật. Vui lòng cấu hình tại{' '}
              <a href="/system/modules/analytics" className="text-cyan-600 hover:underline">/system/modules/analytics</a>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Tổng quan</h1>
        <p className="text-slate-500 dark:text-slate-400">Chào mừng trở lại, Admin User!</p>
      </div>

      {/* Sales Report */}
      {showSales && (
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <CardTitle className="text-slate-900 dark:text-slate-100">Báo cáo doanh thu</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg">
                <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium mb-1">Tổng doanh thu</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">125.5M</h3>
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-500/10 rounded-lg">
                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-1">Đơn hàng</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">156</h3>
              </div>
              <div className="p-4 bg-purple-50 dark:bg-purple-500/10 rounded-lg">
                <p className="text-sm text-purple-600 dark:text-purple-400 font-medium mb-1">Giá trị TB/đơn</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">805K</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Customers Report */}
      {showCustomers && (
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <CardTitle className="text-slate-900 dark:text-slate-100">Báo cáo khách hàng</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 bg-cyan-50 dark:bg-cyan-500/10 rounded-lg">
                <p className="text-sm text-cyan-600 dark:text-cyan-400 font-medium mb-1">Khách mới</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">48</h3>
              </div>
              <div className="p-4 bg-amber-50 dark:bg-amber-500/10 rounded-lg">
                <p className="text-sm text-amber-600 dark:text-amber-400 font-medium mb-1">Khách quay lại</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">72</h3>
              </div>
              <div className="p-4 bg-rose-50 dark:bg-rose-500/10 rounded-lg">
                <p className="text-sm text-rose-600 dark:text-rose-400 font-medium mb-1">Tỷ lệ quay lại</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">60%</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Products Report */}
      {showProducts && (
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <CardTitle className="text-slate-900 dark:text-slate-100">Báo cáo sản phẩm</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide mb-4">Sản phẩm bán chạy</h4>
                <div className="space-y-3">
                  <ProgressBar label="iPhone 15 Pro Max" value={45} color="bg-blue-500" />
                  <ProgressBar label="MacBook Air M3" value={32} color="bg-blue-500" />
                  <ProgressBar label="AirPods Pro 2" value={28} color="bg-blue-500" />
                </div>
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide mb-4">Tồn kho thấp</h4>
                <div className="space-y-3">
                  <ProgressBar label="iPad Mini 6" value={5} color="bg-rose-500" />
                  <ProgressBar label="Apple Watch Ultra" value={8} color="bg-amber-500" />
                  <ProgressBar label="Magic Keyboard" value={12} color="bg-amber-500" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Traffic Report */}
      {showTraffic && (
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <CardTitle className="text-slate-900 dark:text-slate-100">Báo cáo lượt truy cập</CardTitle>
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg self-start sm:self-auto">
                {TIME_TABS.map((tab) => (
                  <button 
                    key={tab.key}
                    onClick={() => setTimeRange(tab.key)}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                      timeRange === tab.key 
                        ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-slate-100' 
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium uppercase mb-1">NGƯỜI TRUY CẬP</p>
                <h3 className="text-4xl font-bold text-slate-900 dark:text-slate-100">{formatNumber(currentData.visitors)}</h3>
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium uppercase mb-1">LƯỢT XEM TRANG</p>
                <h3 className="text-4xl font-bold text-slate-900 dark:text-slate-100">{formatNumber(currentData.pageviews)}</h3>
              </div>
            </div>

            <div className="h-[300px] w-full mb-8">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={currentData.chart}>
                  <defs>
                    <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                    itemStyle={{color: '#334155'}}
                    formatter={(value) => [formatNumber(value as number), 'Lượt truy cập']}
                  />
                  <Area type="monotone" dataKey="visits" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorVisits)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide mb-4">Trang được xem</h4>
                <div className="space-y-4">
                  {currentData.pages.map((page) => (
                    <ProgressBar key={page.label} label={page.label} value={page.value} />
                  ))}
                </div>

                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide mt-8 mb-4">Quốc gia</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm text-slate-700 dark:text-slate-300">
                    <span className="flex items-center gap-2"><span className="text-lg">🇻🇳</span> Việt Nam</span>
                    <span className="font-medium">80%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-slate-700 dark:text-slate-300">
                    <span className="flex items-center gap-2"><span className="text-lg">🇯🇵</span> Nhật Bản</span>
                    <span className="font-medium">8%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-slate-700 dark:text-slate-300">
                    <span className="flex items-center gap-2"><span className="text-lg">🌐</span> Không xác định</span>
                    <span className="font-medium">6%</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide mb-4">Nguồn truy cập</h4>
                <div className="space-y-4">
                  {currentData.sources.map((source) => (
                    <ProgressBar key={source.label} label={source.label} value={source.value} color="bg-emerald-500" />
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-6 mt-8">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide mb-3">Thiết bị</h4>
                    <div className="flex items-center justify-between text-sm py-1 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-600 dark:text-slate-400">Di động</span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">59%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm py-1">
                      <span className="text-slate-600 dark:text-slate-400">Máy tính</span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">41%</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide mb-3">Hệ điều hành</h4>
                    <div className="flex items-center justify-between text-sm py-1 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-600 dark:text-slate-400">Windows</span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">39%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm py-1 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-600 dark:text-slate-400">iOS</span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">34%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm py-1">
                      <span className="text-slate-600 dark:text-slate-400">Android</span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">25%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
