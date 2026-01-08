'use client';

import React, { useState, use, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button, Card, CardHeader, CardTitle, CardContent, Input, Label } from '../../../components/ui';

const MODULE_KEY = 'promotions';

export default function PromotionEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const promotionData = useQuery(api.promotions.getById, { id: id as Id<"promotions"> });
  const updatePromotion = useMutation(api.promotions.update);
  const featuresData = useQuery(api.admin.modules.listModuleFeatures, { moduleKey: MODULE_KEY });

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState<'percent' | 'fixed'>('percent');
  const [discountValue, setDiscountValue] = useState<number>(10);
  const [minOrderAmount, setMinOrderAmount] = useState<number | undefined>();
  const [maxDiscountAmount, setMaxDiscountAmount] = useState<number | undefined>();
  const [usageLimit, setUsageLimit] = useState<number | undefined>();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState<'Active' | 'Inactive' | 'Scheduled' | 'Expired'>('Active');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get enabled features from system config
  const enabledFeatures = useMemo(() => {
    const features: Record<string, boolean> = {};
    featuresData?.forEach(f => { features[f.featureKey] = f.enabled; });
    return features;
  }, [featuresData]);

  // Load existing data
  useEffect(() => {
    if (promotionData) {
      setName(promotionData.name);
      setCode(promotionData.code);
      setDescription(promotionData.description || '');
      setDiscountType(promotionData.discountType);
      setDiscountValue(promotionData.discountValue);
      setMinOrderAmount(promotionData.minOrderAmount);
      setMaxDiscountAmount(promotionData.maxDiscountAmount);
      setUsageLimit(promotionData.usageLimit);
      setStatus(promotionData.status);
      
      if (promotionData.startDate) {
        setStartDate(new Date(promotionData.startDate).toISOString().slice(0, 16));
      }
      if (promotionData.endDate) {
        setEndDate(new Date(promotionData.endDate).toISOString().slice(0, 16));
      }
    }
  }, [promotionData]);

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCode(e.target.value.toUpperCase());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim() || discountValue <= 0) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    setIsSubmitting(true);
    try {
      await updatePromotion({
        id: id as Id<"promotions">,
        name: name.trim(),
        code: code.trim().toUpperCase(),
        description: description.trim() || undefined,
        discountType,
        discountValue,
        minOrderAmount: enabledFeatures.enableMinOrder ? minOrderAmount : undefined,
        maxDiscountAmount: enabledFeatures.enableMaxDiscount && discountType === 'percent' ? maxDiscountAmount : undefined,
        usageLimit: enabledFeatures.enableUsageLimit ? usageLimit : undefined,
        startDate: enabledFeatures.enableSchedule && startDate ? new Date(startDate).getTime() : undefined,
        endDate: enabledFeatures.enableSchedule && endDate ? new Date(endDate).getTime() : undefined,
        status,
      });
      toast.success('Cập nhật khuyến mãi thành công');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể cập nhật khuyến mãi');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (promotionData === undefined) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-pink-500" />
      </div>
    );
  }

  if (promotionData === null) {
    return <div className="text-center py-8 text-slate-500">Không tìm thấy khuyến mãi</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Chỉnh sửa khuyến mãi</h1>
          <p className="text-sm text-slate-500 mt-1">Cập nhật thông tin voucher: {promotionData.code}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Thông tin cơ bản</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Tên khuyến mãi <span className="text-red-500">*</span></Label>
                <Input 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required 
                />
              </div>
              
              <div className="space-y-2">
                <Label>Mã voucher <span className="text-red-500">*</span></Label>
                <Input 
                  value={code} 
                  onChange={handleCodeChange} 
                  required 
                  className="font-mono uppercase"
                />
                <p className="text-xs text-slate-500">Mã sẽ tự động chuyển thành chữ in hoa</p>
              </div>

              <div className="space-y-2">
                <Label>Mô tả</Label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full min-h-[80px] rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Giá trị giảm giá</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Loại giảm giá <span className="text-red-500">*</span></Label>
                <select 
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value as 'percent' | 'fixed')}
                  className="w-full h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                >
                  <option value="percent">Giảm theo phần trăm (%)</option>
                  <option value="fixed">Giảm số tiền cố định (VND)</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label>
                  Giá trị giảm <span className="text-red-500">*</span>
                  {discountType === 'percent' && <span className="text-slate-500 ml-1">(%)</span>}
                  {discountType === 'fixed' && <span className="text-slate-500 ml-1">(VND)</span>}
                </Label>
                <Input 
                  type="number"
                  value={discountValue} 
                  onChange={(e) => setDiscountValue(Number(e.target.value))}
                  required
                  min={1}
                  max={discountType === 'percent' ? 100 : undefined}
                />
              </div>

              {enabledFeatures.enableMinOrder && (
                <div className="space-y-2">
                  <Label>Đơn hàng tối thiểu (VND)</Label>
                  <Input 
                    type="number"
                    value={minOrderAmount || ''} 
                    onChange={(e) => setMinOrderAmount(e.target.value ? Number(e.target.value) : undefined)}
                    min={0}
                  />
                </div>
              )}

              {enabledFeatures.enableMaxDiscount && discountType === 'percent' && (
                <div className="space-y-2">
                  <Label>Giảm tối đa (VND)</Label>
                  <Input 
                    type="number"
                    value={maxDiscountAmount || ''} 
                    onChange={(e) => setMaxDiscountAmount(e.target.value ? Number(e.target.value) : undefined)}
                    min={0}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {enabledFeatures.enableSchedule && (
            <Card>
              <CardHeader><CardTitle className="text-base">Thời gian áp dụng</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Ngày bắt đầu</Label>
                    <Input 
                      type="datetime-local"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Ngày kết thúc</Label>
                    <Input 
                      type="datetime-local"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Xuất bản</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Trạng thái</Label>
                <select 
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'Active' | 'Inactive' | 'Scheduled' | 'Expired')}
                  className="w-full h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                >
                  <option value="Active">Hoạt động</option>
                  <option value="Inactive">Tạm dừng</option>
                  <option value="Scheduled">Chờ kích hoạt</option>
                  <option value="Expired">Hết hạn</option>
                </select>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  <strong>Đã sử dụng:</strong> {promotionData.usedCount} lượt
                </p>
              </div>
            </CardContent>
          </Card>

          {enabledFeatures.enableUsageLimit && (
            <Card>
              <CardHeader><CardTitle className="text-base">Giới hạn sử dụng</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Số lượt sử dụng tối đa</Label>
                  <Input 
                    type="number"
                    value={usageLimit || ''} 
                    onChange={(e) => setUsageLimit(e.target.value ? Number(e.target.value) : undefined)}
                    min={1}
                  />
                  <p className="text-xs text-slate-500">Để trống nếu không giới hạn</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 lg:left-[280px] right-0 p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center z-10">
        <Button type="button" variant="ghost" onClick={() => router.push('/admin/promotions')}>Hủy bỏ</Button>
        <div className="flex gap-2">
          <Button type="button" variant="secondary" onClick={() => setStatus('Inactive')}>Lưu nháp</Button>
          <Button type="submit" className="bg-pink-600 hover:bg-pink-500" disabled={isSubmitting}>
            {isSubmitting && <Loader2 size={16} className="animate-spin mr-2" />}
            Cập nhật
          </Button>
        </div>
      </div>
    </form>
  );
}
