'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button, Card, CardHeader, CardTitle, CardContent, Input, Label } from '../../components/ui';

const MODULE_KEY = 'promotions';

export default function PromotionCreatePage() {
  const router = useRouter();
  const createPromotion = useMutation(api.promotions.create);
  const featuresData = useQuery(api.admin.modules.listModuleFeatures, { moduleKey: MODULE_KEY });
  const settingsData = useQuery(api.admin.modules.listModuleSettings, { moduleKey: MODULE_KEY });

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
  const [status, setStatus] = useState<'Active' | 'Inactive' | 'Scheduled'>('Active');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get enabled features from system config
  const enabledFeatures = useMemo(() => {
    const features: Record<string, boolean> = {};
    featuresData?.forEach(f => { features[f.featureKey] = f.enabled; });
    return features;
  }, [featuresData]);

  // Sync default discount type from settings
  useEffect(() => {
    if (settingsData) {
      const defaultType = settingsData.find(s => s.settingKey === 'defaultDiscountType')?.value as string;
      if (defaultType === 'fixed' || defaultType === 'percent') {
        setDiscountType(defaultType);
      }
    }
  }, [settingsData]);

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const codeLength = (settingsData?.find(s => s.settingKey === 'codeLength')?.value as number) || 8;
    let result = '';
    for (let i = 0; i < codeLength; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCode(result);
  };

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
      await createPromotion({
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
      toast.success('Tạo khuyến mãi thành công');
      router.push('/admin/promotions');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể tạo khuyến mãi');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Thêm khuyến mãi mới</h1>
          <p className="text-sm text-slate-500 mt-1">Tạo voucher hoặc mã giảm giá mới</p>
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
                  placeholder="VD: Giảm 10% đơn hàng" 
                />
              </div>
              
              <div className="space-y-2">
                <Label>Mã voucher <span className="text-red-500">*</span></Label>
                <div className="flex gap-2">
                  <Input 
                    value={code} 
                    onChange={handleCodeChange} 
                    required 
                    placeholder="VD: SALE10" 
                    className="font-mono uppercase flex-1"
                  />
                  <Button type="button" variant="outline" onClick={generateCode}>
                    Tạo mã
                  </Button>
                </div>
                <p className="text-xs text-slate-500">Mã sẽ tự động chuyển thành chữ in hoa</p>
              </div>

              <div className="space-y-2">
                <Label>Mô tả</Label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full min-h-[80px] rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                  placeholder="Mô tả chi tiết về khuyến mãi..."
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
                  placeholder={discountType === 'percent' ? 'VD: 10' : 'VD: 50000'}
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
                    placeholder="VD: 500000"
                  />
                  <p className="text-xs text-slate-500">Để trống nếu không yêu cầu</p>
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
                    placeholder="VD: 500000"
                  />
                  <p className="text-xs text-slate-500">Giới hạn số tiền giảm tối đa cho giảm theo %</p>
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
                <p className="text-xs text-slate-500">Để trống nếu không giới hạn thời gian</p>
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
                  onChange={(e) => setStatus(e.target.value as 'Active' | 'Inactive' | 'Scheduled')}
                  className="w-full h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                >
                  <option value="Active">Hoạt động</option>
                  <option value="Inactive">Tạm dừng</option>
                  <option value="Scheduled">Chờ kích hoạt</option>
                </select>
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
                    placeholder="VD: 100"
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
            Tạo khuyến mãi
          </Button>
        </div>
      </div>
    </form>
  );
}
