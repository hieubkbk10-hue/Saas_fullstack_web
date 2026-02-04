'use client';

import React from 'react';
import { CustomerAuthProvider } from '@/app/(site)/auth/context';
import { CartProvider } from '@/lib/cart';

export function SiteProviders({ children }: { children: React.ReactNode }) {
  return (
    <CustomerAuthProvider>
      <CartProvider>
        {children}
      </CartProvider>
    </CustomerAuthProvider>
  );
}
