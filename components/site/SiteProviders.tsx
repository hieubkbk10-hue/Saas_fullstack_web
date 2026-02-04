'use client';

import React from 'react';
import { Toaster } from 'sonner';
import { CustomerAuthProvider } from '@/app/(site)/auth/context';
import { CartProvider } from '@/lib/cart';
import { ConvexClientProvider } from '@/components/providers/convex-provider';

export function SiteProviders({ children }: { children: React.ReactNode }) {
  return (
    <ConvexClientProvider>
      <CustomerAuthProvider>
        <CartProvider>
          {children}
          <Toaster richColors position="top-right" />
        </CartProvider>
      </CustomerAuthProvider>
    </ConvexClientProvider>
  );
}
