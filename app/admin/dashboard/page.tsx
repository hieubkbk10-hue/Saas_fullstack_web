'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const dataVisitors = [
  { name: '01/10', visits: 120 },
  { name: '02/10', visits: 180 },
  { name: '03/10', visits: 150 },
  { name: '04/10', visits: 250 },
  { name: '05/10', visits: 390 },
  { name: '06/10', visits: 320 },
  { name: '07/10', visits: 450 },
  { name: '08/10', visits: 410 },
  { name: '09/10', visits: 520 },
  { name: '10/10', visits: 480 },
];

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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Tổng quan</h1>
        <p className="text-slate-500 dark:text-slate-400">Chào mừng trở lại, Admin User!</p>
      </div>

      <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-slate-900 dark:text-slate-100">Thống kê truy cập</CardTitle>
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg self-start sm:self-auto">
              {['Hôm nay', '7 ngày', '30 ngày', '3 tháng', '1 năm', 'Tất cả'].map((tab, i) => (
                <button 
                  key={tab}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${i === 2 ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-slate-100' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium uppercase mb-1">NGƯỜI TRUY CẬP</p>
              <h3 className="text-4xl font-bold text-slate-900 dark:text-slate-100">106</h3>
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium uppercase mb-1">LƯỢT XEM TRANG</p>
              <h3 className="text-4xl font-bold text-slate-900 dark:text-slate-100">791</h3>
            </div>
          </div>

          <div className="h-[300px] w-full mb-8">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dataVisitors}>
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
                />
                <Area type="monotone" dataKey="visits" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorVisits)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8">
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide mb-4">Trang được xem</h4>
              <div className="space-y-4">
                <ProgressBar label="/" value={291} />
                <ProgressBar label="/chat" value={73} />
                <ProgressBar label="/library" value={72} />
                <ProgressBar label="/profile" value={62} />
                <ProgressBar label="/chat/jd72e..." value={28} />
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
                <ProgressBar label="Trực tiếp" value={453} color="bg-emerald-500" />
                <ProgressBar label="google.com" value={166} color="bg-emerald-500" />
                <ProgressBar label="facebook.com" value={80} color="bg-emerald-500" />
                <ProgressBar label="m.facebook.com" value={40} color="bg-emerald-500" />
                <ProgressBar label="localhost" value={24} color="bg-emerald-500" />
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
    </div>
  );
}
