'use client';

import React, { useState, useCallback } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { toast } from 'sonner';
import { 
  Database, Trash2, RefreshCw, Play, AlertTriangle, Check, 
  Loader2, ChevronDown, Package, Users, FileText, Settings,
  ShoppingCart, Image, Globe, BarChart3, Shield
} from 'lucide-react';

type TableStat = {
  table: string;
  count: number;
  category: string;
  isApproximate: boolean;
};

const categoryIcons: Record<string, React.ElementType> = {
  system: Settings,
  user: Users,
  commerce: ShoppingCart,
  content: FileText,
  media: Image,
  website: Globe,
  config: Settings,
  logs: BarChart3,
};

const categoryColors: Record<string, string> = {
  system: 'text-orange-500 bg-orange-500/10',
  user: 'text-purple-500 bg-purple-500/10',
  commerce: 'text-emerald-500 bg-emerald-500/10',
  content: 'text-blue-500 bg-blue-500/10',
  media: 'text-pink-500 bg-pink-500/10',
  website: 'text-cyan-500 bg-cyan-500/10',
  config: 'text-amber-500 bg-amber-500/10',
  logs: 'text-slate-500 bg-slate-500/10',
};

const categoryLabels: Record<string, string> = {
  system: 'Hệ thống',
  user: 'Người dùng',
  commerce: 'Bán hàng',
  content: 'Nội dung',
  media: 'Media',
  website: 'Website',
  config: 'Cấu hình',
  logs: 'Logs',
};

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 animate-pulse">
          <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
          <div className="h-8 w-12 bg-slate-200 dark:bg-slate-700 rounded" />
        </div>
      ))}
    </div>
  );
}

function TablesSkeleton() {
  return (
    <div className="divide-y divide-slate-100 dark:divide-slate-800">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="px-4 py-3 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-lg" />
            <div className="flex-1">
              <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded mb-1" />
              <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function DataManagerPage() {
  const tableStats = useQuery(api.dataManager.getTableStats);
  const seedAll = useMutation(api.dataManager.seedAll);
  const clearTable = useMutation(api.dataManager.clearTable);
  const clearAllData = useMutation(api.dataManager.clearAllData);

  const [isSeeding, setIsSeeding] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [clearingTable, setClearingTable] = useState<string | null>(null);
  const [seedResult, setSeedResult] = useState<{ seeded: string[]; message: string } | null>(null);
  const [clearResult, setClearResult] = useState<{ totalDeleted: number } | null>(null);
  const [showConfirmClearAll, setShowConfirmClearAll] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['system', 'user', 'content', 'commerce']);

  const isLoading = tableStats === undefined;

  const handleSeedAll = useCallback(async (force: boolean) => {
    setIsSeeding(true);
    setSeedResult(null);
    try {
      const result = await seedAll({ force });
      setSeedResult(result);
      if (result.seeded.length > 0) {
        toast.success(result.message, {
          description: `Đã seed: ${result.seeded.join(', ')}`,
        });
      } else {
        toast.info(result.message);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Lỗi không xác định';
      toast.error('Lỗi khi seed dữ liệu', { description: message });
    } finally {
      setIsSeeding(false);
    }
  }, [seedAll]);

  const handleClearTable = useCallback(async (table: string) => {
    if (!confirm(`Xóa tất cả dữ liệu trong bảng "${table}"?`)) return;
    setClearingTable(table);
    try {
      const result = await clearTable({ table });
      if (result.hasMore) {
        toast.warning(`Đã xóa ${result.deleted} records từ "${table}"`, {
          description: 'Còn dữ liệu chưa xóa hết. Vui lòng xóa lại.',
          action: {
            label: 'Xóa tiếp',
            onClick: () => handleClearTable(table),
          },
        });
      } else {
        toast.success(`Đã xóa ${result.deleted} records từ "${table}"`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Lỗi không xác định';
      toast.error(`Lỗi khi xóa "${table}"`, { description: message });
    } finally {
      setClearingTable(null);
    }
  }, [clearTable]);

  const handleClearAll = useCallback(async (excludeSystem: boolean) => {
    setIsClearing(true);
    setClearResult(null);
    try {
      const result = await clearAllData({ excludeSystem });
      setClearResult(result);
      
      if (result.hasMore) {
        toast.warning(`Đã xóa ${result.totalDeleted} records`, {
          description: 'Còn dữ liệu chưa xóa hết. Vui lòng xóa lại.',
          action: {
            label: 'Xóa tiếp',
            onClick: () => handleClearAll(excludeSystem),
          },
        });
      } else {
        toast.success(`Đã xóa ${result.totalDeleted} records`, {
          description: result.tables.map(t => `${t.table}: ${t.deleted}`).join(', '),
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Lỗi không xác định';
      toast.error('Lỗi khi xóa dữ liệu', { description: message });
    } finally {
      setIsClearing(false);
      setShowConfirmClearAll(false);
    }
  }, [clearAllData]);

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => 
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
  };

  const groupedStats = tableStats?.reduce((acc, stat) => {
    if (!acc[stat.category]) acc[stat.category] = [];
    acc[stat.category].push(stat);
    return acc;
  }, {} as Record<string, TableStat[]>) || {};

  const totalRecords = tableStats?.reduce((sum, s) => sum + s.count, 0) || 0;
  const hasApproximate = tableStats?.some(t => t.isApproximate) || false;
  const totalTables = tableStats?.length || 0;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Database size={24} className="text-cyan-500" />
            Quản lý dữ liệu
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Seed dữ liệu mẫu và reset database cho môi trường phát triển
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      {isLoading ? (
        <StatsSkeleton />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
            <p className="text-xs text-slate-500 uppercase font-medium">Tổng bảng</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{totalTables}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
            <p className="text-xs text-slate-500 uppercase font-medium">Tổng records</p>
            <p className="text-2xl font-bold text-cyan-600">
              {hasApproximate && '~'}{totalRecords.toLocaleString()}
              {hasApproximate && <span className="text-xs text-slate-400 ml-1">+</span>}
            </p>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
            <p className="text-xs text-slate-500 uppercase font-medium">Categories</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{Object.keys(groupedStats).length}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
            <p className="text-xs text-slate-500 uppercase font-medium">Bảng trống</p>
            <p className="text-2xl font-bold text-amber-600">{tableStats?.filter(t => t.count === 0).length || 0}</p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">Thao tác nhanh</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Seed Section */}
          <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Play size={18} className="text-emerald-500" />
              <h4 className="font-medium text-slate-800 dark:text-slate-200">Seed dữ liệu</h4>
            </div>
            <p className="text-sm text-slate-500 mb-4">
              Tạo dữ liệu mẫu cho các bảng trống hoặc ghi đè dữ liệu hiện có.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => handleSeedAll(false)}
                disabled={isSeeding}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {isSeeding ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
                Seed (bỏ qua có sẵn)
              </button>
              <button
                onClick={() => handleSeedAll(true)}
                disabled={isSeeding}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {isSeeding ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                Force Seed (ghi đè)
              </button>
            </div>
            {seedResult && (
              <div className="mt-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                  <Check size={16} />
                  <span className="text-sm font-medium">{seedResult.message}</span>
                </div>
                {seedResult.seeded.length > 0 && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-500 mt-1">
                    Đã seed: {seedResult.seeded.join(', ')}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Clear Section */}
          <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Trash2 size={18} className="text-red-500" />
              <h4 className="font-medium text-slate-800 dark:text-slate-200">Xóa dữ liệu</h4>
            </div>
            <p className="text-sm text-slate-500 mb-4">
              Xóa toàn bộ dữ liệu. Có thể giữ lại cấu hình hệ thống.
            </p>
            {!showConfirmClearAll ? (
              <button
                onClick={() => setShowConfirmClearAll(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <Trash2 size={16} />
                Xóa tất cả dữ liệu
              </button>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <AlertTriangle size={16} className="text-red-500" />
                  <span className="text-sm text-red-700 dark:text-red-400">Thao tác này không thể hoàn tác!</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleClearAll(true)}
                    disabled={isClearing}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                  >
                    {isClearing ? <Loader2 size={14} className="animate-spin" /> : <Shield size={14} />}
                    Giữ System
                  </button>
                  <button
                    onClick={() => handleClearAll(false)}
                    disabled={isClearing}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                  >
                    {isClearing ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                    Xóa hết
                  </button>
                  <button
                    onClick={() => setShowConfirmClearAll(false)}
                    className="px-3 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            )}
            {clearResult && (
              <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  Đã xóa <span className="font-bold text-red-600">{clearResult.totalDeleted.toLocaleString()}</span> records
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tables List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Chi tiết các bảng</h3>
        </div>
        
        {isLoading ? (
          <TablesSkeleton />
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {Object.entries(groupedStats).map(([category, tables]) => {
              const Icon = categoryIcons[category] || Package;
              const colorClass = categoryColors[category] || 'text-slate-500 bg-slate-500/10';
              const isExpanded = expandedCategories.includes(category);
              const categoryTotal = tables.reduce((sum, t) => sum + t.count, 0);
              const hasApprox = tables.some(t => t.isApproximate);
              
              return (
                <div key={category}>
                  <button
                    onClick={() => toggleCategory(category)}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorClass}`}>
                        <Icon size={16} />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-slate-800 dark:text-slate-200">
                          {categoryLabels[category] || category}
                        </p>
                        <p className="text-xs text-slate-500">
                          {tables.length} bảng · {hasApprox && '~'}{categoryTotal.toLocaleString()} records
                        </p>
                      </div>
                    </div>
                    <ChevronDown 
                      size={18} 
                      className={`text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                    />
                  </button>
                  
                  {isExpanded && (
                    <div className="px-4 pb-3">
                      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg overflow-hidden">
                        <table className="w-full">
                          <thead>
                            <tr className="text-xs text-slate-500 uppercase">
                              <th className="text-left px-4 py-2 font-medium">Tên bảng</th>
                              <th className="text-right px-4 py-2 font-medium">Số records</th>
                              <th className="text-right px-4 py-2 font-medium w-24">Thao tác</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {tables.map(table => (
                              <tr key={table.table} className="text-sm">
                                <td className="px-4 py-2">
                                  <code className="text-slate-700 dark:text-slate-300 font-mono text-xs">
                                    {table.table}
                                  </code>
                                </td>
                                <td className="px-4 py-2 text-right">
                                  <span className={`font-medium ${table.count === 0 ? 'text-slate-400' : 'text-slate-700 dark:text-slate-300'}`}>
                                    {table.isApproximate && '~'}{table.count.toLocaleString()}
                                    {table.isApproximate && <span className="text-xs text-amber-500 ml-1" title="Số lượng ước tính (>1000)">+</span>}
                                  </span>
                                </td>
                                <td className="px-4 py-2 text-right">
                                  <button
                                    onClick={() => handleClearTable(table.table)}
                                    disabled={clearingTable === table.table || table.count === 0}
                                    className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                    title={table.count === 0 ? 'Bảng trống' : `Xóa ${table.count} records`}
                                  >
                                    {clearingTable === table.table ? (
                                      <Loader2 size={14} className="animate-spin" />
                                    ) : (
                                      <Trash2 size={14} />
                                    )}
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-2">
          <AlertTriangle size={16} />
          Lưu ý quan trọng
        </h4>
        <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1 list-disc list-inside">
          <li>Chỉ sử dụng tính năng này trong môi trường <strong>development</strong></li>
          <li>Seed dữ liệu sẽ bỏ qua các bảng đã có dữ liệu (trừ khi chọn Force)</li>
          <li>Xóa &quot;Giữ System&quot; sẽ giữ lại các bảng cấu hình hệ thống (modules, presets,...)</li>
          <li>Dữ liệu đã xóa <strong>không thể khôi phục</strong></li>
          <li>Số lượng records hiển thị &quot;~&quot; là ước tính (giới hạn đếm 1000 records)</li>
        </ul>
      </div>
    </div>
  );
}
