import React from 'react';
import { Mail, MapPin, MessageSquare, Phone } from 'lucide-react';

type ContactLayoutStyle = 'form-only' | 'with-map' | 'with-info';

type ContactPreviewProps = {
  layoutStyle: ContactLayoutStyle;
  showMap: boolean;
  showContactInfo: boolean;
  showSocialLinks: boolean;
};

export function ContactPreview({
  layoutStyle,
  showMap,
  showContactInfo,
  showSocialLinks,
}: ContactPreviewProps) {
  const ContactForm = () => (
    <div className="border border-slate-200 dark:border-slate-700 rounded p-2 space-y-1">
      <div className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
        <MessageSquare size={10} />
        <span>Liên hệ với chúng tôi</span>
      </div>
      <input 
        type="text" 
        placeholder="Tên của bạn" 
        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded px-1 py-0.5 text-xs"
        disabled
      />
      <input 
        type="email" 
        placeholder="Email" 
        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded px-1 py-0.5 text-xs"
        disabled
      />
      <textarea 
        placeholder="Nội dung..." 
        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded px-1 py-0.5 text-xs resize-none"
        rows={3}
        disabled
      />
      <button className="w-full bg-indigo-500 text-white rounded py-1 text-xs">
        Gửi tin nhắn
      </button>
    </div>
  );

  const ContactInfo = () => (
    <div className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded p-2 space-y-1">
      <div className="font-medium text-slate-700 dark:text-slate-300">Thông tin liên hệ</div>
      <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
        <Phone size={8} />
        <span>0123 456 789</span>
      </div>
      <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
        <Mail size={8} />
        <span>info@example.com</span>
      </div>
      <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
        <MapPin size={8} />
        <span>TP. HCM, VN</span>
      </div>
      {showSocialLinks && (
        <div className="pt-1 border-t border-slate-300 dark:border-slate-600">
          <div className="flex gap-1">
            {['FB', 'TW', 'IG'].map(social => (
              <div key={social} className="w-5 h-5 bg-indigo-500 text-white rounded flex items-center justify-center text-xs">
                {social}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const MapPreview = () => (
    <div className="bg-slate-200 dark:bg-slate-700 rounded h-20 flex items-center justify-center text-slate-500">
      <MapPin size={16} />
      <span className="ml-1">Map</span>
    </div>
  );

  return (
    <div className="space-y-3 text-xs">
      <div className="bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 rounded p-2">
        <span className="font-medium text-indigo-700 dark:text-indigo-400">Layout: {layoutStyle}</span>
      </div>

      {layoutStyle === 'form-only' && (
        <ContactForm />
      )}

      {layoutStyle === 'with-map' && (
        <div className="space-y-2">
          {showMap && <MapPreview />}
          <ContactForm />
          {showContactInfo && <ContactInfo />}
        </div>
      )}

      {layoutStyle === 'with-info' && (
        <div className="grid grid-cols-2 gap-2">
          <ContactForm />
          <div className="space-y-2">
            {showContactInfo && <ContactInfo />}
            {showMap && <MapPreview />}
          </div>
        </div>
      )}
    </div>
  );
}
