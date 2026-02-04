'use client';

import React, { useCallback } from 'react';
import { ShoppingCart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/cart';
import { useCartConfig } from '@/lib/experiences';
import { useBrandColor } from './hooks';

type CartIconProps = {
  variant?: 'mobile' | 'desktop';
  className?: string;
};

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

export function CartIcon({ variant = 'desktop', className }: CartIconProps) {
  const router = useRouter();
  const brandColor = useBrandColor();
  const { itemsCount, openDrawer } = useCart();
  const { layoutStyle } = useCartConfig();

  const handleClick = useCallback(() => {
    if (layoutStyle === 'drawer') {
      openDrawer();
      return;
    }
    router.push('/cart');
  }, [layoutStyle, openDrawer, router]);

  if (variant === 'mobile') {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={cn('p-2 text-slate-600 dark:text-slate-400 relative', className)}
      >
        <ShoppingCart size={20} />
        <span
          className="absolute -top-1 -right-1 w-5 h-5 text-[10px] font-bold text-white rounded-full flex items-center justify-center"
          style={{ backgroundColor: brandColor }}
        >
          {itemsCount}
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn('p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors flex flex-col items-center text-xs gap-0.5 relative', className)}
    >
      <ShoppingCart size={20} />
      <span>Giỏ hàng</span>
      <span
        className="absolute top-0 right-0 w-5 h-5 text-[10px] font-bold text-white rounded-full flex items-center justify-center"
        style={{ backgroundColor: brandColor }}
      >
        {itemsCount}
      </span>
    </button>
  );
}
