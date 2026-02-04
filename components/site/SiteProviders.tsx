'use client';

import React from 'react';
import { Toaster } from 'sonner';
import { CustomerAuthProvider } from '@/app/(site)/auth/context';
import { CartProvider } from '@/lib/cart';

export function SiteProviders({ children }: { children: React.ReactNode }) {
  return (
    <CustomerAuthProvider>
      <CartProvider>
        {children}
        <Toaster richColors position="top-right" />
      </CartProvider>
    </CustomerAuthProvider>
  );
}
