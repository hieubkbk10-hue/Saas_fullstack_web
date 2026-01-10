'use client';

import { useEffect } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

const DEFAULT_BRAND_COLOR = '#3b82f6';

export function BrandColorProvider() {
  const setting = useQuery(api.settings.getByKey, { key: 'site_brand_color' });
  
  useEffect(() => {
    const brandColor = setting?.value as string || DEFAULT_BRAND_COLOR;
    document.documentElement.style.setProperty('--scrollbar-color', brandColor);
  }, [setting]);

  return null;
}
