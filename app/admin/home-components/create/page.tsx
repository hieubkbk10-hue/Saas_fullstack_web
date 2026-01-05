'use client';

import React from 'react';
import Link from 'next/link';
import { cn, Card, CardContent, CardHeader, CardTitle } from '../../components/ui';
import { COMPONENT_TYPES } from './shared';

export default function HomeComponentCreatePage() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Thêm Component mới</h1>
        <Link href="/admin/home-components" className="text-sm text-blue-600 hover:underline">
          ← Quay lại danh sách
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Chọn loại Component</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {COMPONENT_TYPES.map((type) => {
              const Icon = type.icon;
              return (
                <Link 
                  key={type.value} 
                  href={`/admin/home-components/create/${type.route}`}
                  className={cn(
                    "cursor-pointer border-2 rounded-xl p-4 transition-all",
                    "hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10",
                    "border-slate-200 dark:border-slate-700"
                  )}
                >
                  <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
                    <Icon size={24} className="text-slate-600 dark:text-slate-400" />
                  </div>
                  <h3 className="font-medium text-slate-900 dark:text-slate-100">{type.label}</h3>
                  <p className="text-xs text-slate-500 mt-1">{type.description}</p>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
