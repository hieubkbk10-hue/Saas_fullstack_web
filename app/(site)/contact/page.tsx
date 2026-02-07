'use client';

import React from 'react';
import { Mail, MapPin, MessageSquare, Phone, Send } from 'lucide-react';
import { useContactPageData } from '@/components/site/useContactPageData';

type SocialLinkItem = { label: string; href: string; color: string; icon: React.ElementType };

const toHex = (value: string) => (value.startsWith('#') ? value.slice(1) : value);

const hexToRgb = (hex: string) => {
  const normalized = toHex(hex);
  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) {
    return null;
  }
  const r = Number.parseInt(normalized.slice(0, 2), 16);
  const g = Number.parseInt(normalized.slice(2, 4), 16);
  const b = Number.parseInt(normalized.slice(4, 6), 16);
  return { r, g, b };
};

const darkenColor = (hex: string, amount: number) => {
  const rgb = hexToRgb(hex);
  if (!rgb) {
    return hex;
  }
  const clamp = (value: number) => Math.max(0, Math.min(255, Math.round(value)));
  return `#${clamp(rgb.r * (1 - amount)).toString(16).padStart(2, '0')}${clamp(rgb.g * (1 - amount)).toString(16).padStart(2, '0')}${clamp(rgb.b * (1 - amount)).toString(16).padStart(2, '0')}`;
};

const withAlpha = (hex: string, alpha: number) => {
  const rgb = hexToRgb(hex);
  if (!rgb) {
    return hex;
  }
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
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

function CorporateContactForm({ brandColor }: { brandColor: string }) {
  return (
    <form
      onSubmit={(event) => event.preventDefault()}
      className="space-y-4"
    >
      <h3 className="text-xl font-semibold text-slate-800 border-b border-slate-100 pb-3">Gửi tin nhắn</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Họ tên</label>
          <input
            type="text"
            placeholder="Nguyễn Văn A"
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-800"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Email</label>
          <input
            type="email"
            placeholder="example@company.com"
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-800"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Số điện thoại</label>
          <input
            type="text"
            placeholder="09xx xxx xxx"
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-800"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Chủ đề</label>
          <input
            type="text"
            placeholder="Hợp tác kinh doanh..."
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-800"
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium text-slate-700">Nội dung tin nhắn</label>
          <textarea
            placeholder="Nhập nội dung cần hỗ trợ..."
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-800 resize-none"
            rows={4}
          />
        </div>
        <div className="md:col-span-2">
          <button
            type="submit"
            className="w-full md:w-auto px-8 py-2.5 rounded-lg text-white font-semibold flex items-center justify-center gap-2"
            style={{ backgroundColor: brandColor }}
          >
            <Send size={16} />
            Gửi tin nhắn
          </button>
        </div>
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
  socialLinks: SocialLinkItem[];
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

function CorporateSidebar({
  address,
  email,
  phone,
  hotline,
  showSocialLinks,
  socialLinks,
  brandColor,
}: {
  address: string;
  email: string;
  phone: string;
  hotline: string;
  showSocialLinks: boolean;
  socialLinks: SocialLinkItem[];
  brandColor: string;
}) {
  const sidebarColor = darkenColor(brandColor, 0.35);
  const glowColor = withAlpha(brandColor, 0.18);
  const infoItems = [
    { label: 'Điện thoại', value: phone, note: 'Thứ 2 - Thứ 7, 8:00 - 17:00', icon: Phone },
    { label: 'Hotline', value: hotline, note: '', icon: Phone },
    { label: 'Email', value: email, note: 'Phản hồi trong vòng 24 giờ', icon: Mail },
    { label: 'Văn phòng', value: address, note: '', icon: MapPin },
  ].filter((item) => item.value);

  return (
    <div
      className="relative lg:w-5/12 text-white p-6 lg:p-8 flex flex-col justify-between overflow-hidden"
      style={{ backgroundColor: sidebarColor }}
    >
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full blur-3xl" style={{ backgroundColor: glowColor }} />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 rounded-full blur-3xl" style={{ backgroundColor: glowColor }} />
      <div className="relative z-10">
        <h2 className="text-2xl font-bold tracking-tight mb-2">Liên hệ với chúng tôi</h2>
        <p className="text-slate-400 text-sm mb-8">
          Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ giải pháp tốt nhất cho doanh nghiệp của bạn.
        </p>
        <div className="space-y-6">
          {infoItems.length === 0 ? (
            <div className="text-sm text-slate-400">Chưa có dữ liệu liên hệ.</div>
          ) : (
            infoItems.map((item) => (
              <div key={item.label} className="flex items-start gap-4">
                <div className="bg-white/10 p-3 rounded-lg">
                  <item.icon size={20} style={{ color: brandColor }} />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-300">{item.label}</h3>
                  <p className="text-base font-semibold mt-1 break-words">{item.value}</p>
                  {item.note && <p className="text-xs text-slate-500 mt-1">{item.note}</p>}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      {showSocialLinks && socialLinks.length > 0 && (
        <div className="relative z-10 mt-8">
          <h3 className="text-sm font-medium text-slate-300 mb-3">Theo dõi chúng tôi</h3>
          <div className="flex gap-3">
            {socialLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full flex items-center justify-center text-white"
                style={{ backgroundColor: item.color }}
                aria-label={item.label}
              >
                <item.icon size={16} />
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
  const { isLoading, brandColor, config, contactData, socialLinks } = useContactPageData();

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="h-8 w-48 bg-slate-200 rounded-lg animate-pulse" />
        <div className="h-4 w-64 bg-slate-200 rounded-lg animate-pulse mt-3" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {config.layoutStyle !== 'form-only' && (
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Liên hệ với chúng tôi</h1>
          <p className="text-slate-500 mt-2">Chúng tôi luôn sẵn sàng hỗ trợ bạn.</p>
        </div>
      )}

      {config.layoutStyle === 'form-only' && (
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100 flex flex-col lg:flex-row">
          {config.showContactInfo && (
            <CorporateSidebar
              address={contactData.address}
              email={contactData.email}
              phone={contactData.phone}
              hotline={contactData.hotline}
              showSocialLinks={config.showSocialLinks}
              socialLinks={socialLinks}
              brandColor={brandColor}
            />
          )}
          <div className={`${config.showContactInfo ? 'lg:w-7/12' : 'w-full'} bg-white p-6 lg:p-8 space-y-6`}>
            <CorporateContactForm brandColor={brandColor} />
            {config.showMap && <MapPreview address={contactData.address} />}
          </div>
        </div>
      )}

      {config.layoutStyle === 'with-info' && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            <ContactForm brandColor={brandColor} />
          </div>
          <div className="lg:col-span-2 space-y-6">
            {config.showContactInfo && (
              <ContactInfoCard
                brandColor={brandColor}
                address={contactData.address}
                email={contactData.email}
                phone={contactData.phone}
                hotline={contactData.hotline}
                showSocialLinks={config.showSocialLinks}
                socialLinks={socialLinks}
              />
            )}
            {config.showMap && <MapPreview address={contactData.address} />}
          </div>
        </div>
      )}
    </div>
  );
}
