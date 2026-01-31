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
    brandColor: settingsMap.site_brand_color || DEFAULT_BRAND_COLOR,
    favicon: settingsMap.site_favicon || '',
    isLoading: false,
    logo: settingsMap.site_logo || '',
    settings: settingsMap,
    siteDescription: settingsMap.site_description || '',
    siteName: settingsMap.site_name || 'VietAdmin',
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
    address: settingsMap.contact_address || '',
    email: settingsMap.contact_email || '',
    hotline: settingsMap.contact_hotline || '',
    isLoading: false,
    phone: settingsMap.contact_phone || '',
  };
}

// Hook lấy social links settings
export function useSocialLinks() {
  const settings = useQuery(api.settings.listByGroup, { group: 'social' });
  
  if (settings === undefined) {
    return { isLoading: true };
  }
  
  const settingsMap: Record<string, string> = {};
  settings.forEach(s => {
    settingsMap[s.key] = s.value as string;
  });
  
  return {
    facebook: settingsMap.social_facebook || '',
    instagram: settingsMap.social_instagram || '',
    isLoading: false,
    linkedin: settingsMap.social_linkedin || '',
    tiktok: settingsMap.social_tiktok || '',
    twitter: settingsMap.social_twitter || '',
    youtube: settingsMap.social_youtube || '',
    zalo: settingsMap.social_zalo || '',
  };
}
