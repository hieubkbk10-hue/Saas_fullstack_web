import React from 'react';
import { Facebook, Instagram, Mail, MapPin, MessageSquare, Phone, Send, Twitter } from 'lucide-react';

type ContactLayoutStyle = 'form-only' | 'with-map' | 'with-info';

type ContactPreviewProps = {
  layoutStyle: ContactLayoutStyle;
  showMap: boolean;
  showContactInfo: boolean;
  showSocialLinks: boolean;
  device?: 'desktop' | 'tablet' | 'mobile';
  brandColor?: string;
};

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
            <button className="w-9 h-9 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: '#1877f2' }}>
              <Facebook size={18} />
            </button>
            <button className="w-9 h-9 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: '#1da1f2' }}>
              <Twitter size={18} />
            </button>
            <button className="w-9 h-9 rounded-lg flex items-center justify-center text-white" style={{ background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)' }}>
              <Instagram size={18} />
            </button>
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
        <div className="text-center mb-6">
          <h1 className="text-xl md:text-2xl font-bold text-slate-900">Liên hệ với chúng tôi</h1>
          <p className="text-slate-500 mt-1 text-sm">Chúng tôi luôn sẵn sàng hỗ trợ bạn</p>
        </div>

        {layoutStyle === 'form-only' && (
          <div className="max-w-xl mx-auto">
            <ContactForm brandColor={brandColor} />
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