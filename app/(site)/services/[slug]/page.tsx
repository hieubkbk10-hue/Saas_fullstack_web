'use client';

import React, { use, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useBrandColor } from '@/components/site/hooks';
import { ClassicStyle, MinimalStyle, ModernStyle } from '@/components/site/services/detail/ServiceDetailStyles';
import { ArrowLeft, Briefcase } from 'lucide-react';

type ServiceDetailStyle = 'classic' | 'modern' | 'minimal';

function useServiceDetailStyle(): ServiceDetailStyle {
  const setting = useQuery(api.settings.getByKey, { key: 'services_detail_style' });
  return (setting?.value as ServiceDetailStyle) || 'classic';
}

function useEnabledServiceFields(): Set<string> {
  const fields = useQuery(api.admin.modules.listEnabledModuleFields, { moduleKey: 'services' });
  return useMemo(() => {
    if (!fields) {return new Set<string>();}
    return new Set(fields.map(f => f.fieldKey));
  }, [fields]);
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function ServiceDetailPage({ params }: PageProps) {
  const { slug } = use(params);
  const brandColor = useBrandColor();
  const style = useServiceDetailStyle();
  const enabledFields = useEnabledServiceFields();
  
  const service = useQuery(api.services.getBySlug, { slug });
  const category = useQuery(
    api.serviceCategories.getById,
    service?.categoryId ? { id: service.categoryId } : 'skip'
  );
  const incrementViews = useMutation(api.services.incrementViews);
  
  const relatedServices = useQuery(
    api.services.searchPublished,
    service?.categoryId ? { categoryId: service.categoryId, limit: 4 } : 'skip'
  );

  useEffect(() => {
    if (service?._id) {
      void incrementViews({ id: service._id });
    }
  }, [service?._id, incrementViews]);

  if (service === undefined) {
    return <ServiceDetailSkeleton />;
  }

  if (service === null) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-slate-100 flex items-center justify-center">
            <Briefcase size={32} className="text-slate-400" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Không tìm thấy dịch vụ</h1>
          <p className="text-slate-500 mb-8 max-w-sm mx-auto">Dịch vụ này không tồn tại hoặc đã bị xóa khỏi hệ thống.</p>
          <Link
            href="/services"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-white font-medium transition-all hover:shadow-lg hover:scale-105"
            style={{ backgroundColor: brandColor }}
          >
            <ArrowLeft size={18} />
            Xem tất cả dịch vụ
          </Link>
        </div>
      </div>
    );
  }

  const filteredRelated = relatedServices?.filter(s => s._id !== service._id).slice(0, 3) ?? [];
  const serviceData = { ...service, categoryName: category?.name ?? 'Dịch vụ' };

  return (
    <>
      {style === 'classic' && <ClassicStyle service={serviceData} brandColor={brandColor} relatedServices={filteredRelated} enabledFields={enabledFields} />}
      {style === 'modern' && <ModernStyle service={serviceData} brandColor={brandColor} relatedServices={filteredRelated} enabledFields={enabledFields} />}
      {style === 'minimal' && <MinimalStyle service={serviceData} brandColor={brandColor} relatedServices={filteredRelated} enabledFields={enabledFields} />}
    </>
  );
}

function ServiceDetailSkeleton() {
  return (
    <div className="min-h-screen bg-white animate-pulse">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="h-4 w-24 bg-slate-200 rounded mb-12" />
        <div className="space-y-4 mb-8">
          <div className="h-3 w-20 bg-slate-200 rounded" />
          <div className="h-12 w-full bg-slate-200 rounded" />
          <div className="h-12 w-3/4 bg-slate-200 rounded" />
        </div>
        <div className="h-6 w-32 bg-slate-200 rounded mb-12" />
        <div className="aspect-[2/1] bg-slate-200 rounded-xl mb-12" />
        <div className="space-y-4">
          <div className="h-4 bg-slate-200 rounded w-full" />
          <div className="h-4 bg-slate-200 rounded w-5/6" />
          <div className="h-4 bg-slate-200 rounded w-full" />
          <div className="h-4 bg-slate-200 rounded w-4/6" />
        </div>
      </div>
    </div>
  );
}
