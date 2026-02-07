import React from 'react';
import { Facebook, Instagram, Mail, MapPin, MessageSquare, Phone, Send, Youtube } from 'lucide-react';
import { ZaloIcon } from '@/components/site/SocialIcons';

type ContactLayoutStyle = 'form-only' | 'with-map' | 'with-info';

type ContactPreviewProps = {
  layoutStyle: ContactLayoutStyle;
  showMap: boolean;
  showContactInfo: boolean;
  showSocialLinks: boolean;
  device?: 'desktop' | 'tablet' | 'mobile';
  brandColor?: string;
};

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

function CorporateForm({ brandColor = '#6366f1' }: { brandColor?: string }) {
  return (
    <div>
      <h3 className="text-xl font-semibold text-slate-800 mb-5 border-b border-slate-100 pb-3">Gửi tin nhắn</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Họ tên</label>
          <input
            type="text"
            placeholder="Nguyễn Văn A"
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-800"
            disabled
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Email</label>
          <input
            type="email"
            placeholder="example@company.com"
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-800"
            disabled
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Số điện thoại</label>
          <input
            type="text"
            placeholder="09xx xxx xxx"
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-800"
            disabled
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Chủ đề</label>
          <input
            type="text"
            placeholder="Hợp tác kinh doanh..."
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-800"
            disabled
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium text-slate-700">Nội dung tin nhắn</label>
          <textarea
            placeholder="Nhập nội dung cần hỗ trợ..."
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-800 resize-none"
            rows={4}
            disabled
          />
        </div>
        <div className="md:col-span-2">
          <button
            className="w-full md:w-auto px-8 py-2.5 rounded-lg text-white font-semibold flex items-center justify-center gap-2"
            style={{ backgroundColor: brandColor }}
          >
            <Send size={16} />
            Gửi tin nhắn
          </button>
        </div>
      </div>
    </div>
  );
}

function ContactForm({ brandColor = '#6366f1' }: { brandColor?: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare size={20} style={{ color: brandColor }} />
        <h3 className="font-semibold text-slate-900">Gửi tin nhắn cho chúng tôi</h3>
      </div>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <input type="text" placeholder="Họ tên" className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm" disabled />
          <input type="email" placeholder="Email" className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm" disabled />
        </div>
        <input type="text" placeholder="Số điện thoại" className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm" disabled />
        <input type="text" placeholder="Chủ đề" className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm" disabled />
        <textarea placeholder="Nội dung tin nhắn..." className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm resize-none" rows={4} disabled />
        <button className="w-full py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2" style={{ backgroundColor: brandColor }}>
          <Send size={16} />
          Gửi tin nhắn
        </button>
      </div>
    </div>
  );
}

function ContactInfo({ showSocialLinks, brandColor = '#6366f1' }: { showSocialLinks: boolean; brandColor?: string }) {
  const socialLinks = [
    { label: 'Facebook', color: '#1877f2', icon: Facebook },
    { label: 'Instagram', color: '#e1306c', icon: Instagram },
    { label: 'YouTube', color: '#ff0000', icon: Youtube },
    { label: 'Zalo', color: '#0084ff', icon: ZaloIcon },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      <h3 className="font-semibold text-slate-900 mb-4">Thông tin liên hệ</h3>
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${brandColor}15` }}>
            <Phone size={18} style={{ color: brandColor }} />
          </div>
          <div>
            <div className="font-medium text-slate-900">Điện thoại</div>
            <div className="text-sm text-slate-500">0123 456 789</div>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${brandColor}15` }}>
            <Mail size={18} style={{ color: brandColor }} />
          </div>
          <div>
            <div className="font-medium text-slate-900">Email</div>
            <div className="text-sm text-slate-500">info@example.com</div>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${brandColor}15` }}>
            <MapPin size={18} style={{ color: brandColor }} />
          </div>
          <div>
            <div className="font-medium text-slate-900">Địa chỉ</div>
            <div className="text-sm text-slate-500">123 Nguyễn Huệ, Q.1, TP.HCM</div>
          </div>
        </div>
      </div>
      {showSocialLinks && (
        <div className="pt-4 mt-4 border-t border-slate-200">
          <div className="text-sm font-medium text-slate-700 mb-2">Theo dõi chúng tôi</div>
          <div className="flex gap-2">
            {socialLinks.map((item) => (
              <button
                key={item.label}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-white"
                style={{ backgroundColor: item.color }}
              >
                <item.icon size={18} />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MapPreview() {
  return (
    <div className="bg-slate-100 rounded-xl h-48 flex items-center justify-center text-slate-400 border border-slate-200">
      <div className="text-center">
        <MapPin size={32} className="mx-auto mb-2" />
        <span className="text-sm">Google Maps</span>
      </div>
    </div>
  );
}

export function ContactPreview({
  layoutStyle,
  showMap,
  showContactInfo,
  showSocialLinks,
  device = 'desktop',
  brandColor = '#6366f1',
}: ContactPreviewProps) {
  const isMobile = device === 'mobile';

  return (
    <div className="py-6 px-4 min-h-[300px]">
      <div className="max-w-5xl mx-auto">
        {layoutStyle !== 'form-only' && (
          <div className="text-center mb-6">
            <h1 className="text-xl md:text-2xl font-bold text-slate-900">Liên hệ với chúng tôi</h1>
            <p className="text-slate-500 mt-1 text-sm">Chúng tôi luôn sẵn sàng hỗ trợ bạn</p>
          </div>
        )}

        {layoutStyle === 'form-only' && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100 flex flex-col lg:flex-row">
            {showContactInfo && (
              <div
                className="relative lg:w-5/12 text-white p-6 lg:p-8 flex flex-col justify-between overflow-hidden"
                style={{ backgroundColor: darkenColor(brandColor, 0.5) }}
              >
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full blur-3xl" style={{ backgroundColor: withAlpha(brandColor, 0.18) }} />
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 rounded-full blur-3xl" style={{ backgroundColor: withAlpha(brandColor, 0.18) }} />
                <div className="relative z-10">
                  <h2 className="text-2xl font-bold tracking-tight mb-2">Liên hệ với chúng tôi</h2>
                  <p className="text-white/80 text-sm mb-8">
                    Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ giải pháp tốt nhất cho doanh nghiệp của bạn.
                  </p>
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="bg-white/10 p-3 rounded-lg">
                        <Phone size={20} style={{ color: brandColor }} />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-white">Điện thoại</h3>
                        <p className="text-base font-semibold mt-1 text-white">0123 456 789</p>
                        <p className="text-xs text-white/70 mt-1">Thứ 2 - Thứ 7, 8:00 - 17:00</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="bg-white/10 p-3 rounded-lg">
                        <Mail size={20} style={{ color: brandColor }} />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-white">Email</h3>
                        <p className="text-base font-semibold mt-1 break-all text-white">info@example.com</p>
                        <p className="text-xs text-white/70 mt-1">Phản hồi trong vòng 24 giờ</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="bg-white/10 p-3 rounded-lg">
                        <MapPin size={20} style={{ color: brandColor }} />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-white">Văn phòng</h3>
                        <p className="text-base font-semibold mt-1 text-white">Hà Nội, Việt Nam</p>
                      </div>
                    </div>
                  </div>
                </div>
                {showSocialLinks && (
                  <div className="relative z-10 mt-8">
                    <h3 className="text-sm font-semibold text-white mb-3">Theo dõi chúng tôi</h3>
                    <div className="flex gap-3">
                      {[
                        { label: 'Facebook', color: '#1877f2', icon: Facebook },
                        { label: 'Instagram', color: '#e1306c', icon: Instagram },
                        { label: 'YouTube', color: '#ff0000', icon: Youtube },
                        { label: 'Zalo', color: '#0084ff', icon: ZaloIcon },
                      ].map((item) => (
                        <button
                          key={item.label}
                          className="w-9 h-9 rounded-full flex items-center justify-center text-white"
                          style={{ backgroundColor: item.color }}
                        >
                          <item.icon size={16} />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            <div className={`${showContactInfo ? 'lg:w-7/12' : 'w-full'} bg-white p-6 lg:p-8 space-y-6`}>
              <CorporateForm brandColor={brandColor} />
              {showMap && <MapPreview />}
            </div>
          </div>
        )}

        {layoutStyle === 'with-map' && (
          <div className="space-y-4">
            {showMap && <MapPreview />}
            <div className={isMobile ? 'space-y-4' : 'grid grid-cols-2 gap-6'}>
              <ContactForm brandColor={brandColor} />
              {showContactInfo && <ContactInfo showSocialLinks={showSocialLinks} brandColor={brandColor} />}
            </div>
          </div>
        )}

        {layoutStyle === 'with-info' && (
          <div className={isMobile ? 'space-y-4' : 'grid grid-cols-5 gap-6'}>
            <div className={isMobile ? '' : 'col-span-3'}>
              <ContactForm brandColor={brandColor} />
            </div>
            <div className={`${isMobile ? '' : 'col-span-2'} space-y-4`}>
              {showContactInfo && <ContactInfo showSocialLinks={showSocialLinks} brandColor={brandColor} />}
              {showMap && <MapPreview />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}