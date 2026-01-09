'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

const DEFAULT_BRAND_COLOR = '#3b82f6';

// Hook lấy brandColor từ settings
export function useBrandColor() {
  const setting = useQuery(api.settings.getByKey, { key: 'site_brand_color' });
  if (setting === undefined || setting === null) {
    return DEFAULT_BRAND_COLOR;
  }
  return (setting.value as string) || DEFAULT_BRAND_COLOR;
}

// Hook lấy site settings
export function useSiteSettings() {
  const settings = useQuery(api.settings.listByGroup, { group: 'site' });
  
  if (settings === undefined) {
    return { isLoading: true, settings: {} };
  }
  
  const settingsMap: Record<string, string> = {};
  settings.forEach(s => {
    settingsMap[s.key] = s.value as string;
  });
  
  return {
    isLoading: false,
    settings: settingsMap,
    siteName: settingsMap.site_name || 'VietAdmin',
    siteDescription: settingsMap.site_description || '',
    brandColor: settingsMap.site_brand_color || DEFAULT_BRAND_COLOR,
    logo: settingsMap.site_logo || '',
    favicon: settingsMap.site_favicon || '',
  };
}

// Hook lấy contact settings
export function useContactSettings() {
  const settings = useQuery(api.settings.listByGroup, { group: 'contact' });
  
  if (settings === undefined) {
    return { isLoading: true };
  }
  
  const settingsMap: Record<string, string> = {};
  settings.forEach(s => {
    settingsMap[s.key] = s.value as string;
  });
  
  return {
    isLoading: false,
    email: settingsMap.contact_email || '',
    phone: settingsMap.contact_phone || '',
    address: settingsMap.contact_address || '',
    hotline: settingsMap.contact_hotline || '',
  };
}
