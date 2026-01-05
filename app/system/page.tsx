'use client';

import React, { useState, useMemo } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { 
  Database, 
  FileText, 
  ArrowRight,
  X,
  TrendingUp,
  TrendingDown,
  Calendar
} from 'lucide-react';

type TimeRange = '1h' | '12h' | '24h' | '7d' | '1m' | '3m' | '1y';

const timeRangeLabels: Record<TimeRange, string> = {
  '1h': '1 giờ',
  '12h': '12 giờ',
  '24h': '24 giờ',
  '7d': '7 ngày',
  '1m': '1 tháng',
  '3m': '3 tháng',
  '1y': '1 năm',
};

const generateMockData = (range: TimeRange) => {
  const now = new Date();
  const data: { time: string; value: number }[] = [];
  
  const configs: Record<TimeRange, { points: number; format: (d: Date) => string; subtractMs: number }> = {
    '1h': { 
      points: 12, 
      format: (d) => `${d.getHours()}:${d.getMinutes().toString().padStart(2, '0')}`,
      subtractMs: 5 * 60 * 1000 
    },
    '12h': { 
      points: 12, 
      format: (d) => `${d.getHours()}:00`,
      subtractMs: 60 * 60 * 1000 
    },
    '24h': { 
      points: 12, 
      format: (d) => `${d.getHours()}:00`,
      subtractMs: 2 * 60 * 60 * 1000 
    },
    '7d': { 
      points: 7, 
      format: (d) => `${d.getDate()}/${d.getMonth() + 1}`,
      subtractMs: 24 * 60 * 60 * 1000 
    },
    '1m': { 
      points: 10, 
      format: (d) => `${d.getDate()}/${d.getMonth() + 1}`,
      subtractMs: 3 * 24 * 60 * 60 * 1000 
    },
    '3m': { 
      points: 12, 
      format: (d) => `${d.getDate()}/${d.getMonth() + 1}`,
      subtractMs: 7 * 24 * 60 * 60 * 1000 
    },
    '1y': { 
      points: 12, 
      format: (d) => `T${d.getMonth() + 1}`,
      subtractMs: 30 * 24 * 60 * 60 * 1000 
    },
  };

  const config = configs[range];
  
  for (let i = config.points - 1; i >= 0; i--) {
    const date = new Date(now.getTime() - i * config.subtractMs);
    const baseValue = 3 + Math.random() * 5;
    const variation = Math.sin(i * 0.5) * 2;
    data.push({
      time: config.format(date),
      value: Math.round((baseValue + variation) * 10) / 10,
    });
  }
  
  return data;
};

type UsageType = 'db-storage' | 'file-storage' | 'db-bandwidth' | 'file-bandwidth';

interface UsageDetail {
  title: string;
  used: string;
  total: string;
  unit: string;
  percent: number;
  color: string;
  description: string;
  history: { date: string; value: number }[];
  breakdown: { label: string; value: string; percent: number }[];
  trend: number;
}

const usageDetails: Record<UsageType, UsageDetail> = {
  'db-storage': {
    title: 'Database Storage',
    used: '2.4',
    total: '10',
    unit: 'GB',
    percent: 24,
    color: 'cyan',
    description: 'Dung lượng database bao gồm tất cả tables, indexes, và metadata.',
    history: [
      { date: '01/01', value: 1.8 },
      { date: '05/01', value: 2.0 },
      { date: '10/01', value: 2.1 },
      { date: '15/01', value: 2.2 },
      { date: '20/01', value: 2.3 },
      { date: '25/01', value: 2.4 },
    ],
    breakdown: [
      { label: 'Users & Roles', value: '450 MB', percent: 18 },
      { label: 'Products', value: '820 MB', percent: 34 },
      { label: 'Posts & Comments', value: '680 MB', percent: 28 },
      { label: 'Orders', value: '350 MB', percent: 15 },
      { label: 'Others', value: '100 MB', percent: 5 },
    ],
    trend: 8.5,
  },
  'file-storage': {
    title: 'File Storage (S3)',
    used: '8.7',
    total: '50',
    unit: 'GB',
    percent: 17,
    color: 'emerald',
    description: 'Lưu trữ files bao gồm hình ảnh, videos, documents trên S3.',
    history: [
      { date: '01/01', value: 6.2 },
      { date: '05/01', value: 6.8 },
      { date: '10/01', value: 7.2 },
      { date: '15/01', value: 7.8 },
      { date: '20/01', value: 8.3 },
      { date: '25/01', value: 8.7 },
    ],
    breakdown: [
      { label: 'Images', value: '5.2 GB', percent: 60 },
      { label: 'Videos', value: '2.1 GB', percent: 24 },
      { label: 'Documents', value: '1.0 GB', percent: 12 },
      { label: 'Others', value: '0.4 GB', percent: 4 },
    ],
    trend: 12.3,
  },
  'db-bandwidth': {
    title: 'Database Bandwidth',
    used: '125',
    total: '1000',
    unit: 'GB',
    percent: 12,
    color: 'amber',
    description: 'Băng thông database cho queries, reads và writes.',
    history: [
      { date: '01/01', value: 85 },
      { date: '05/01', value: 92 },
      { date: '10/01', value: 98 },
      { date: '15/01', value: 108 },
      { date: '20/01', value: 118 },
      { date: '25/01', value: 125 },
    ],
    breakdown: [
      { label: 'Read Operations', value: '95 GB', percent: 76 },
      { label: 'Write Operations', value: '22 GB', percent: 18 },
      { label: 'Index Scans', value: '8 GB', percent: 6 },
    ],
    trend: -2.1,
  },
  'file-bandwidth': {
    title: 'File Bandwidth',
    used: '342',
    total: '1000',
    unit: 'GB',
    percent: 34,
    color: 'rose',
    description: 'Băng thông download/upload files từ S3 storage.',
    history: [
      { date: '01/01', value: 280 },
      { date: '05/01', value: 295 },
      { date: '10/01', value: 310 },
      { date: '15/01', value: 320 },
      { date: '20/01', value: 335 },
      { date: '25/01', value: 342 },
    ],
    breakdown: [
      { label: 'Image Downloads', value: '210 GB', percent: 61 },
      { label: 'Video Streaming', value: '95 GB', percent: 28 },
      { label: 'File Uploads', value: '25 GB', percent: 7 },
      { label: 'API Transfers', value: '12 GB', percent: 4 },
    ],
    trend: 5.8,
  },
};

const UsageCard = ({ title, used, total, unit, percent, color, icon: Icon, onViewDetails }: any) => {
  const colorMap: Record<string, { text: string; bg: string }> = {
    cyan: { text: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-500' },
    emerald: { text: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500' },
    amber: { text: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500' },
    rose: { text: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-500' },
  };
  
  const theme = colorMap[color] || colorMap.cyan;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
      <div>
        <div className="flex justify-between items-center mb-4">
          <div className={`flex items-center gap-2 font-medium ${theme.text}`}>
            <Icon size={18} />
            {title}
          </div>
          <span className="text-slate-500 text-xs font-mono">{percent}%</span>
        </div>
        
        <div className="text-3xl font-mono font-bold text-slate-800 dark:text-slate-100 mb-1">
          {used} <span className="text-sm text-slate-500 font-sans">/ {total} {unit}</span>
        </div>
      </div>

      <div className="space-y-3 mt-4">
        <div className="w-full bg-slate-200 dark:bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-300 dark:border-slate-800">
          <div 
            className={`h-full rounded-full ${theme.bg}`} 
            style={{ width: `${percent}%` }}
          ></div>
        </div>
        
        <button 
          onClick={onViewDetails}
          className={`text-xs flex items-center gap-1 hover:underline ${theme.text}`}
        >
          View Details <ArrowRight size={10} />
        </button>
      </div>
    </div>
  );
};

const DetailModal = ({ detail, onClose }: { detail: UsageDetail; onClose: () => void }) => {
  const colorMap: Record<string, { text: string; bg: string; border: string }> = {
    cyan: { text: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-500', border: 'border-cyan-500/30' },
    emerald: { text: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500', border: 'border-emerald-500/30' },
    amber: { text: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500', border: 'border-amber-500/30' },
    rose: { text: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-500', border: 'border-rose-500/30' },
  };
  
  const theme = colorMap[detail.color] || colorMap.cyan;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <h3 className={`text-lg font-semibold flex items-center gap-2 ${theme.text}`}>
            {detail.title}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X size={20} className="text-slate-500" />
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-auto p-4 space-y-6">
          {/* Summary */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">{detail.description}</p>
              <div className="text-3xl font-mono font-bold text-slate-800 dark:text-slate-100 mt-2">
                {detail.used} <span className="text-sm text-slate-500 font-sans">/ {detail.total} {detail.unit}</span>
              </div>
            </div>
            <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium ${
              detail.trend >= 0 
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
            }`}>
              {detail.trend >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {detail.trend >= 0 ? '+' : ''}{detail.trend}% so với tháng trước
            </div>
          </div>

          {/* Progress bar */}
          <div>
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>Đã sử dụng</span>
              <span>{detail.percent}%</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full ${theme.bg}`} 
                style={{ width: `${detail.percent}%` }}
              ></div>
            </div>
          </div>

          {/* History Chart */}
          <div>
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2">
              <Calendar size={14} /> Lịch sử sử dụng (30 ngày)
            </h4>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={detail.history}>
                  <defs>
                    <linearGradient id={`color-${detail.color}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={theme.bg.replace('bg-', '#').replace('-500', '')} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={theme.bg.replace('bg-', '#').replace('-500', '')} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} vertical={false} />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '6px', color: '#f8fafc', fontSize: '12px' }}
                    formatter={(value) => [`${value} ${detail.unit}`, 'Usage']}
                  />
                  <Area type="monotone" dataKey="value" stroke={theme.text.includes('cyan') ? '#22d3ee' : theme.text.includes('emerald') ? '#10b981' : theme.text.includes('amber') ? '#f59e0b' : '#f43f5e'} strokeWidth={2} fillOpacity={0.3} fill={theme.text.includes('cyan') ? '#22d3ee' : theme.text.includes('emerald') ? '#10b981' : theme.text.includes('amber') ? '#f59e0b' : '#f43f5e'} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Breakdown */}
          <div>
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">
              Chi tiết phân bổ
            </h4>
            <div className="space-y-3">
              {detail.breakdown.map((item, idx) => (
                <div key={idx}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600 dark:text-slate-300">{item.label}</span>
                    <span className="text-slate-500 font-mono">{item.value} ({item.percent}%)</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${theme.bg}`} 
                      style={{ width: `${item.percent}%`, opacity: 1 - idx * 0.15 }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function OverviewPage() {
  const [selectedRange, setSelectedRange] = useState<TimeRange>('24h');
  const [selectedDetail, setSelectedDetail] = useState<UsageType | null>(null);
  const chartData = useMemo(() => generateMockData(selectedRange), [selectedRange]);
  const timeRanges: TimeRange[] = ['1h', '12h', '24h', '7d', '1m', '3m', '1y'];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Introduction */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Storage & Bandwidth</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Real-time resource usage monitoring</p>
        </div>
      </div>

      {/* Storage Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <UsageCard 
          title="Database Storage" 
          icon={Database}
          used="2.4" 
          total="10" 
          unit="GB" 
          percent={24} 
          color="cyan"
          onViewDetails={() => setSelectedDetail('db-storage')}
        />
        <UsageCard 
          title="File Storage (S3)" 
          icon={FileText}
          used="8.7" 
          total="50" 
          unit="GB" 
          percent={17} 
          color="emerald"
          onViewDetails={() => setSelectedDetail('file-storage')}
        />
         <UsageCard 
          title="Database Bandwidth" 
          icon={Database}
          used="125" 
          total="1000" 
          unit="GB" 
          percent={12} 
          color="amber"
          onViewDetails={() => setSelectedDetail('db-bandwidth')}
        />
        <UsageCard 
          title="File Bandwidth" 
          icon={FileText}
          used="342" 
          total="1000" 
          unit="GB" 
          percent={34} 
          color="rose"
          onViewDetails={() => setSelectedDetail('file-bandwidth')}
        />
      </div>

      {/* Detail Modal */}
      {selectedDetail && (
        <DetailModal 
          detail={usageDetails[selectedDetail]} 
          onClose={() => setSelectedDetail(null)} 
        />
      )}

      {/* Main Bandwidth Chart */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h3 className="text-slate-700 dark:text-slate-200 font-semibold flex items-center gap-2">
              Traffic Trend
            </h3>
            <p className="text-xs text-slate-500 mt-1">Bandwidth usage in GB ({timeRangeLabels[selectedRange]})</p>
          </div>
          <div className="flex gap-1 flex-wrap">
            {timeRanges.map((range) => (
              <button 
                key={range} 
                onClick={() => setSelectedRange(range)}
                className={`text-xs px-2.5 py-1.5 rounded border transition-all ${
                  selectedRange === range 
                    ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-600 dark:text-cyan-400' 
                    : 'border-slate-300 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-400 dark:hover:border-slate-700'
                }`}
              >
                {timeRangeLabels[range]}
              </button>
            ))}
          </div>
        </div>
        
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} vertical={false} />
              <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(value) => `${value} GB`} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '6px', color: '#f8fafc' }}
                itemStyle={{ color: '#22d3ee' }}
                formatter={(value) => [`${value} GB`, 'Usage']}
              />
              <Area type="monotone" dataKey="value" stroke="#22d3ee" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
