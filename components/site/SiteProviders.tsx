'use client';

import React from 'react';
import { CustomerAuthProvider } from '@/app/(site)/auth/context';

export function SiteProviders({ children }: { children: React.ReactNode }) {
  return (
    <CustomerAuthProvider>
      {children}
    </CustomerAuthProvider>
  );
}
