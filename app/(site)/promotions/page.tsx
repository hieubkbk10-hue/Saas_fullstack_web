'use client';

import React, { useMemo, useState } from 'react';
import { useQuery } from 'convex/react';
import { Check, Copy, Ticket } from 'lucide-react';
import { api } from '@/convex/_generated/api';
import type { Doc } from '@/convex/_generated/dataModel';
import { useBrandColor } from '@/components/site/hooks';

type PromotionsLayoutStyle = 'grid' | 'list' | 'banner';

type PromotionsExperienceConfig = {
  layoutStyle: PromotionsLayoutStyle;
  showCountdown: boolean;
  showProgress: boolean;
  showConditions: boolean;
  groupByType: boolean;
};

const DEFAULT_CONFIG: PromotionsExperienceConfig = {
  layoutStyle: 'grid',
  showCountdown: true,
  showProgress: true,
  showConditions: true,
  groupByType: true,
};

const PROMOTION_TYPE_LABELS: Record<string, string> = {
  bundle: 'Combo',
  campaign: 'Campaign',
  coupon: 'Coupon',
  flash_sale: 'Flash sale',
  loyalty: 'Loyalty',
};

const DISCOUNT_TYPE_LABELS: Record<string, string> = {
  buy_a_get_b: 'Mua A tặng B',
  buy_x_get_y: 'Mua X tặng Y',
  fixed: 'Giảm cố định',
  free_shipping: 'Miễn phí vận chuyển',
  gift: 'Tặng quà',
  percent: 'Giảm %',
  tiered: 'Bậc thang',
};

function formatCurrency(value?: number) {
  if (value === undefined) {return undefined;}
  return `${value.toLocaleString('vi-VN')}đ`;
}

function formatCountdown(endDate?: number) {
  if (!endDate) {return undefined;}
  const diff = endDate - Date.now();
  if (diff <= 0) {return 'Đã kết thúc';}
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 24) {return `Còn ${hours} giờ`;}
  const days = Math.ceil(hours / 24);
  return `Còn ${days} ngày`;
}

function buildConditions(promo: { minOrderAmount?: number; maxDiscountAmount?: number; usagePerCustomer?: number }) {
  const items: string[] = [];
  if (promo.minOrderAmount) {
    items.push(`Đơn tối thiểu ${formatCurrency(promo.minOrderAmount)}`);
  }
  if (promo.maxDiscountAmount) {
    items.push(`Giảm tối đa ${formatCurrency(promo.maxDiscountAmount)}`);
  }
  if (promo.usagePerCustomer) {
    items.push(`Mỗi khách ${promo.usagePerCustomer} lượt`);
  }
  return items;
}

export default function PromotionsPage() {
  const experienceSetting = useQuery(api.settings.getByKey, { key: 'promotions_list_ui' });
  const promotions = useQuery(api.promotions.listPublicPromotions) as Doc<'promotions'>[] | undefined;
  const brandColor = useBrandColor();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const config = useMemo<PromotionsExperienceConfig>(() => {
    const raw = experienceSetting?.value as Partial<PromotionsExperienceConfig> | undefined;
    return {
      layoutStyle: raw?.layoutStyle ?? DEFAULT_CONFIG.layoutStyle,
      showCountdown: raw?.showCountdown ?? DEFAULT_CONFIG.showCountdown,
      showProgress: raw?.showProgress ?? DEFAULT_CONFIG.showProgress,
      showConditions: raw?.showConditions ?? DEFAULT_CONFIG.showConditions,
      groupByType: raw?.groupByType ?? DEFAULT_CONFIG.groupByType,
    };
  }, [experienceSetting?.value]);

  const groupedPromotions = useMemo(() => {
    if (!promotions) {return [];}
    if (!config.groupByType) {
      return [{ label: 'Tất cả', items: promotions }];
    }
    const map = new Map<string, typeof promotions>();
    promotions.forEach((promo) => {
      const promotionType = promo.promotionType ?? 'campaign';
      const label = PROMOTION_TYPE_LABELS[promotionType] ?? promotionType;
      const list = map.get(label) ?? [];
      list.push(promo);
      map.set(label, list);
    });
    return Array.from(map.entries()).map(([label, items]) => ({ label, items }));
  }, [config.groupByType, promotions]);

  const handleCopy = async (code: string) => {
    if (!navigator?.clipboard) {return;}
    await navigator.clipboard.writeText(code);
    setCopiedCode(code);
    window.setTimeout(() =>{  setCopiedCode(null); }, 2000);
  };

  if (promotions === undefined || experienceSetting === undefined) {
    return (
      <div className="py-16 text-center text-slate-500">Đang tải khuyến mãi...</div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto px-4 py-10 space-y-8">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 text-slate-500">
            <Ticket className="w-5 h-5" />
            <span className="text-sm uppercase tracking-wide">Khuyến mãi</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Ưu đãi đang áp dụng</h1>
          <p className="text-slate-500">Tổng hợp mã giảm giá và chương trình nổi bật hôm nay.</p>
        </div>

        {config.layoutStyle === 'banner' && (
          <div
            className="rounded-2xl p-6 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            style={{ background: `linear-gradient(135deg, ${brandColor} 0%, ${brandColor}99 100%)` }}
          >
            <div>
              <p className="text-xs uppercase tracking-wide">Ưu đãi nổi bật</p>
              <h2 className="text-2xl font-bold mt-2">Săn deal hôm nay</h2>
              <p className="text-sm mt-1">Chọn voucher phù hợp để tiết kiệm tối đa.</p>
            </div>
            <span className="px-4 py-2 text-sm bg-white/20 rounded-full">{promotions.length} khuyến mãi</span>
          </div>
        )}

        {config.groupByType && groupedPromotions.length > 1 && (
          <div className="flex flex-wrap gap-2 justify-center">
            {groupedPromotions.map((group) => (
              <span key={group.label} className="px-3 py-1 text-xs rounded-full bg-rose-500/10 text-rose-600">
                {group.label}
              </span>
            ))}
          </div>
        )}

        {promotions.length === 0 && (
          <div className="text-center text-slate-500">Chưa có khuyến mãi nào.</div>
        )}

        <div className="space-y-8">
          {groupedPromotions.map((group) => (
            <section key={group.label} className="space-y-4">
              {config.groupByType && (
                <h2 className="text-lg font-semibold text-slate-900">{group.label}</h2>
              )}
              <div
                className={`grid gap-4 ${
                  config.layoutStyle === 'list' ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                }`}
              >
                {group.items.map((promo) => {
                  const usageLimit = promo.usageLimit ?? 0;
                  const usageProgress = usageLimit > 0 ? Math.min(100, (promo.usedCount / usageLimit) * 100) : 0;
                  const budgetProgress = promo.budget && promo.budgetUsed !== undefined
                    ? Math.min(100, (promo.budgetUsed / promo.budget) * 100)
                    : 0;
                  const progress = usageProgress || budgetProgress;
                  const conditions = buildConditions(promo);
                  const countdown = config.showCountdown ? formatCountdown(promo.endDate) : undefined;
                  const discountLabel = promo.discountType === 'percent'
                    ? `${promo.discountValue ?? 0}%`
                    : promo.discountType === 'fixed'
                      ? formatCurrency(promo.discountValue) ?? ''
                      : DISCOUNT_TYPE_LABELS[promo.discountType] ?? promo.discountType;

                  return (
                    <div key={promo._id} className="border border-slate-200 rounded-xl p-4 bg-white">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-xs uppercase tracking-wide text-slate-500">
                            {PROMOTION_TYPE_LABELS[promo.promotionType ?? 'campaign'] ?? (promo.promotionType ?? 'campaign')}
                          </span>
                          <h3 className="mt-2 font-semibold text-slate-900">{promo.name}</h3>
                        </div>
                        <span className="text-xs font-medium text-slate-600">{discountLabel}</span>
                      </div>

                      {promo.code ? (
                        <div className="flex items-center gap-2 mt-3">
                          <span className="text-xs font-mono bg-rose-50 text-rose-600 px-2 py-0.5 rounded">
                            {promo.code}
                          </span>
                          <button
                            onClick={ async () =>{  await handleCopy(promo.code!); }}
                            className="p-1 rounded hover:bg-slate-100"
                            title="Copy mã"
                          >
                            {copiedCode === promo.code ? (
                              <Check size={14} className="text-emerald-500" />
                            ) : (
                              <Copy size={14} className="text-slate-400" />
                            )}
                          </button>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500 mt-2">Tự động áp dụng</p>
                      )}

                      {countdown && <p className="text-xs text-slate-500 mt-2">{countdown}</p>}

                      {config.showConditions && conditions.length > 0 && (
                        <p className="text-xs text-slate-500 mt-2">Điều kiện: {conditions.join(' · ')}</p>
                      )}

                      {config.showProgress && progress > 0 && (
                        <div className="mt-3">
                          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full" style={{ width: `${progress}%`, backgroundColor: brandColor }} />
                          </div>
                          {usageLimit > 0 && (
                            <p className="text-xs text-slate-500 mt-1">Đã dùng {promo.usedCount}/{usageLimit}</p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
