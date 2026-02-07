'use client';

import { useMemo } from 'react';
import { useQuery } from 'convex/react';
import { Facebook, Instagram, Linkedin, MessageCircle, Twitter, Youtube } from 'lucide-react';
import { api } from '@/convex/_generated/api';
import {
  CONTACT_EXPERIENCE_KEY,
  parseContactExperienceConfig,
  type ContactExperienceConfig,
} from '@/lib/experiences/contact/config';

type SocialLinkItem = {
  label: string;
  href: string;
  color: string;
  icon: React.ElementType;
};

type ContactData = {
  address: string;
  email: string;
  phone: string;
  hotline: string;
};

const DEFAULT_BRAND_COLOR = '#3b82f6';

export function useContactPageData(): {
  isLoading: boolean;
  brandColor: string;
  config: ContactExperienceConfig;
  contactData: ContactData;
  socialLinks: SocialLinkItem[];
} {
  const brandColorSetting = useQuery(api.settings.getByKey, { key: 'site_brand_color' });
  const experienceSetting = useQuery(api.settings.getByKey, { key: CONTACT_EXPERIENCE_KEY });
  const contactSettings = useQuery(api.settings.listByGroup, { group: 'contact' });
  const socialSettings = useQuery(api.settings.listByGroup, { group: 'social' });

  const isLoading = brandColorSetting === undefined
    || experienceSetting === undefined
    || contactSettings === undefined
    || socialSettings === undefined;

  const brandColor = typeof brandColorSetting?.value === 'string' ? brandColorSetting.value : DEFAULT_BRAND_COLOR;

  const config = useMemo(
    () => parseContactExperienceConfig(experienceSetting?.value),
    [experienceSetting?.value]
  );

  const contactData = useMemo<ContactData>(() => {
    const settingsMap: Record<string, string> = {};
    contactSettings?.forEach(setting => {
      settingsMap[setting.key] = typeof setting.value === 'string' ? setting.value : '';
    });

    return {
      address: settingsMap.contact_address || '',
      email: settingsMap.contact_email || '',
      hotline: settingsMap.contact_hotline || '',
      phone: settingsMap.contact_phone || '',
    };
  }, [contactSettings]);

  const socialLinks = useMemo<SocialLinkItem[]>(() => {
    const settingsMap: Record<string, string> = {};
    socialSettings?.forEach(setting => {
      settingsMap[setting.key] = typeof setting.value === 'string' ? setting.value : '';
    });

    return [
      { label: 'Facebook', href: settingsMap.social_facebook || '', color: '#1877f2', icon: Facebook },
      { label: 'Twitter', href: settingsMap.social_twitter || '', color: '#1da1f2', icon: Twitter },
      { label: 'Instagram', href: settingsMap.social_instagram || '', color: '#e1306c', icon: Instagram },
      { label: 'LinkedIn', href: settingsMap.social_linkedin || '', color: '#0a66c2', icon: Linkedin },
      { label: 'YouTube', href: settingsMap.social_youtube || '', color: '#ff0000', icon: Youtube },
      { label: 'Zalo', href: settingsMap.social_zalo || '', color: '#0a68ff', icon: MessageCircle },
    ].filter((item) => item.href);
  }, [socialSettings]);

  return {
    brandColor,
    config,
    contactData,
    isLoading,
    socialLinks,
  };
}
