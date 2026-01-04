'use client';

import React from 'react';
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
  ArrowRight
} from 'lucide-react';

const mockChartData = [
  { time: '00:00', value: 4.2 },
  { time: '04:00', value: 3.8 },
  { time: '08:00', value: 5.5 },
  { time: '12:00', value: 8.2 },
  { time: '16:00', value: 7.1 },
  { time: '20:00', value: 6.5 },
  { time: '23:59', value: 5.0 },
];

const UsageCard = ({ title, used, total, unit, percent, color, icon: Icon }: any) => {
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
        
        <button className={`text-xs flex items-center gap-1 hover:underline ${theme.text}`}>
          View Details <ArrowRight size={10} />
        </button>
      </div>
    </div>
  );
};

export default function OverviewPage() {
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
        />
        <UsageCard 
          title="File Storage (S3)" 
          icon={FileText}
          used="8.7" 
          total="50" 
          unit="GB" 
          percent={17} 
          color="emerald" 
        />
         <UsageCard 
          title="Database Bandwidth" 
          icon={Database}
          used="125" 
          total="1000" 
          unit="GB" 
          percent={12} 
          color="amber" 
        />
        <UsageCard 
          title="File Bandwidth" 
          icon={FileText}
          used="342" 
          total="1000" 
          unit="GB" 
          percent={34} 
          color="rose" 
        />
      </div>

      {/* Main Bandwidth Chart */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-slate-700 dark:text-slate-200 font-semibold flex items-center gap-2">
              Daily Traffic Trend
            </h3>
            <p className="text-xs text-slate-500 mt-1">Bandwidth usage in GB (Last 24h)</p>
          </div>
          <div className="flex gap-2">
            {['7 Days', '24 Hours', '1 Hour'].map((t) => (
              <button key={t} className={`text-xs px-2 py-1 rounded border ${t === '24 Hours' ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-600 dark:text-cyan-400' : 'border-slate-300 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>
                {t}
              </button>
            ))}
          </div>
        </div>
        
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mockChartData}>
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
