'use client';

import React from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { ComponentRenderer } from '@/components/site/ComponentRenderer';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  const components = useQuery(api.homeComponents.listActive);

  if (components === undefined) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (components.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Chào mừng!</h1>
          <p className="text-slate-500">
            Chưa có nội dung trang chủ. Vui lòng thêm components trong{' '}
            <a href="/admin/home-components" className="text-blue-600 hover:underline">
              Admin Panel
            </a>
          </p>
        </div>
      </div>
    );
  }

  // Sort theo order, filter bỏ Footer (Footer được render từ layout)
  const sortedComponents = [...components]
    .filter((c) => c.type !== 'Footer')
    .sort((a, b) => a.order - b.order);

  return (
    <>
      {sortedComponents.map((component) => (
        <ComponentRenderer 
          key={component._id} 
          component={{
            _id: component._id,
            type: component.type,
            title: component.title,
            active: component.active,
            order: component.order,
            config: component.config as Record<string, unknown>,
          }} 
        />
      ))}
    </>
  );
}
