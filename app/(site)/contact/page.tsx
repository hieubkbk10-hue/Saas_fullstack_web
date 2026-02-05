'use client';

import React, { useMemo } from 'react';
import { useQuery } from 'convex/react';
import { Facebook, Instagram, Linkedin, Mail, MapPin, MessageCircle, MessageSquare, Phone, Send, Twitter, Youtube } from 'lucide-react';
import { api } from '@/convex/_generated/api';
import { useBrandColor, useContactSettings, useSocialLinks } from '@/components/site/hooks';

type ContactLayoutStyle = 'form-only' | 'with-map' | 'with-info';

type LayoutConfig = {
  showMap: boolean;
  showContactInfo: boolean;
  showSocialLinks: boolean;
};

type ContactExperienceConfig = {
  layoutStyle: ContactLayoutStyle;
  layouts: {
    'form-only': LayoutConfig;
    'with-map': LayoutConfig;
    'with-info': LayoutConfig;
  };
};

const DEFAULT_CONFIG: ContactExperienceConfig = {
  layoutStyle: 'with-info',
  layouts: {
    'form-only': { showMap: false, showContactInfo: false, showSocialLinks: true },
    'with-map': { showMap: true, showContactInfo: false, showSocialLinks: true },
    'with-info': { showMap: false, showContactInfo: true, showSocialLinks: true },
  },
};

function ContactForm({ brandColor }: { brandColor: string }) {
  return (
    <form
      onSubmit={(event) => event.preventDefault()}
      className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm"
    >
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare size={20} style={{ color: brandColor }} />
        <h3 className="font-semibold text-slate-900">Gửi tin nhắn cho chúng tôi</h3>
      </div>
      <div className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input type="text" placeholder="Họ tên" className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm" />
          <input type="email" placeholder="Email" className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm" />
        </div>
        <input type="text" placeholder="Số điện thoại" className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm" />
        <input type="text" placeholder="Chủ đề" className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm" />
        <textarea placeholder="Nội dung tin nhắn..." className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm resize-none" rows={4} />
        <button
          type="submit"
          className="w-full py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2"
          style={{ backgroundColor: brandColor }}
        >
          <Send size={16} />
          Gửi tin nhắn
        </button>
      </div>
    </form>
  );
}

function ContactInfoCard({
  brandColor,
  address,
  email,
  phone,
  hotline,
  showSocialLinks,
  socialLinks,
}: {
  brandColor: string;
  address: string;
  email: string;
  phone: string;
  hotline: string;
  showSocialLinks: boolean;
  socialLinks: { label: string; href: string; color: string; icon: React.ElementType }[];
}) {
  const infoItems = [
    { label: 'Điện thoại', value: phone, icon: Phone },
    { label: 'Hotline', value: hotline, icon: Phone },
    { label: 'Email', value: email, icon: Mail },
    { label: 'Địa chỉ', value: address, icon: MapPin },
  ].filter((item) => item.value);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      <h3 className="font-semibold text-slate-900 mb-4">Thông tin liên hệ</h3>
      <div className="space-y-4">
        {infoItems.length === 0 ? (
          <div className="text-sm text-slate-500">Chưa có dữ liệu liên hệ.</div>
        ) : (
          infoItems.map((item) => (
            <div key={item.label} className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${brandColor}15` }}>
                <item.icon size={18} style={{ color: brandColor }} />
              </div>
              <div>
                <div className="font-medium text-slate-900">{item.label}</div>
                <div className="text-sm text-slate-500 break-words">{item.value}</div>
              </div>
            </div>
          ))
        )}
      </div>
      {showSocialLinks && socialLinks.length > 0 && (
        <div className="pt-4 mt-4 border-t border-slate-200">
          <div className="text-sm font-medium text-slate-700 mb-2">Theo dõi chúng tôi</div>
          <div className="flex flex-wrap gap-2">
            {socialLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg flex items-center justify-center text-white"
                style={{ backgroundColor: item.color }}
                aria-label={item.label}
              >
                <item.icon size={18} />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MapPreview({ address }: { address: string }) {
  return (
    <div className="bg-slate-100 rounded-xl h-48 flex items-center justify-center text-slate-400 border border-slate-200">
      <div className="text-center">
        <MapPin size={32} className="mx-auto mb-2" />
        <span className="text-sm">{address ? `Bản đồ: ${address}` : 'Bản đồ đang cập nhật'}</span>
      </div>
    </div>
  );
}

export default function ContactPage() {
  const brandColor = useBrandColor();
  const contact = useContactSettings();
  const social = useSocialLinks();
  const experienceSetting = useQuery(api.settings.getByKey, { key: 'contact_ui' });

  const config = useMemo(() => {
    const raw = experienceSetting?.value as Partial<ContactExperienceConfig> | undefined;
    return {
      layoutStyle: raw?.layoutStyle ?? DEFAULT_CONFIG.layoutStyle,
      layouts: {
        'form-only': { ...DEFAULT_CONFIG.layouts['form-only'], ...raw?.layouts?.['form-only'] },
        'with-map': { ...DEFAULT_CONFIG.layouts['with-map'], ...raw?.layouts?.['with-map'] },
        'with-info': { ...DEFAULT_CONFIG.layouts['with-info'], ...raw?.layouts?.['with-info'] },
      },
    } as ContactExperienceConfig;
  }, [experienceSetting?.value]);

  if (experienceSetting === undefined || contact.isLoading || social.isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="h-8 w-48 bg-slate-200 rounded-lg animate-pulse" />
        <div className="h-4 w-64 bg-slate-200 rounded-lg animate-pulse mt-3" />
      </div>
    );
  }

  const contactData: { address: string; email: string; phone: string; hotline: string } = 'address' in contact
    ? {
      address: contact.address ?? '',
      email: contact.email ?? '',
      phone: contact.phone ?? '',
      hotline: contact.hotline ?? '',
    }
    : { address: '', email: '', phone: '', hotline: '' };
  const socialData: {
    facebook: string;
    instagram: string;
    linkedin: string;
    tiktok: string;
    twitter: string;
    youtube: string;
    zalo: string;
  } = 'facebook' in social
    ? {
      facebook: social.facebook ?? '',
      instagram: social.instagram ?? '',
      linkedin: social.linkedin ?? '',
      tiktok: social.tiktok ?? '',
      twitter: social.twitter ?? '',
      youtube: social.youtube ?? '',
      zalo: social.zalo ?? '',
    }
    : {
      facebook: '',
      instagram: '',
      linkedin: '',
      tiktok: '',
      twitter: '',
      youtube: '',
      zalo: '',
    };
  const layoutConfig = config.layouts[config.layoutStyle];
  const socialLinks = [
    { label: 'Facebook', href: socialData.facebook, color: '#1877f2', icon: Facebook },
    { label: 'Twitter', href: socialData.twitter, color: '#1da1f2', icon: Twitter },
    { label: 'Instagram', href: socialData.instagram, color: '#e1306c', icon: Instagram },
    { label: 'LinkedIn', href: socialData.linkedin, color: '#0a66c2', icon: Linkedin },
    { label: 'YouTube', href: socialData.youtube, color: '#ff0000', icon: Youtube },
    { label: 'Zalo', href: socialData.zalo, color: '#0a68ff', icon: MessageCircle },
  ].filter((item) => item.href) as { label: string; href: string; color: string; icon: React.ElementType }[];

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Liên hệ với chúng tôi</h1>
        <p className="text-slate-500 mt-2">Chúng tôi luôn sẵn sàng hỗ trợ bạn.</p>
      </div>

      {config.layoutStyle === 'form-only' && (
        <div className="max-w-xl mx-auto">
          <ContactForm brandColor={brandColor} />
        </div>
      )}

      {config.layoutStyle === 'with-map' && (
        <div className="space-y-6">
          {layoutConfig.showMap && <MapPreview address={contactData.address} />}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ContactForm brandColor={brandColor} />
            {layoutConfig.showContactInfo && (
              <ContactInfoCard
                brandColor={brandColor}
                address={contactData.address}
                email={contactData.email}
                phone={contactData.phone}
                hotline={contactData.hotline}
                showSocialLinks={layoutConfig.showSocialLinks}
                socialLinks={socialLinks}
              />
            )}
          </div>
        </div>
      )}

      {config.layoutStyle === 'with-info' && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            <ContactForm brandColor={brandColor} />
          </div>
          <div className="lg:col-span-2 space-y-6">
            {layoutConfig.showContactInfo && (
              <ContactInfoCard
                brandColor={brandColor}
                address={contactData.address}
                email={contactData.email}
                phone={contactData.phone}
                hotline={contactData.hotline}
                showSocialLinks={layoutConfig.showSocialLinks}
                socialLinks={socialLinks}
              />
            )}
            {layoutConfig.showMap && <MapPreview address={contactData.address} />}
          </div>
        </div>
      )}
    </div>
  );
}
