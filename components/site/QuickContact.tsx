'use client';

import React from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { MessageCircle, Phone } from 'lucide-react';

interface QuickContactButtonsProps {
  serviceName?: string;
  brandColor: string;
  variant?: 'horizontal' | 'vertical';
  className?: string;
}

export function QuickContactButtons({ 
  serviceName, 
  brandColor,
  variant = 'horizontal',
  className = ''
}: QuickContactButtonsProps) {
  const contactSettings = useQuery(api.settings.getMultiple, {
    keys: ['contact_phone', 'contact_zalo', 'contact_messenger']
  });

  if (!contactSettings) {
    return null;
  }

  const phone = contactSettings.contact_phone as string || '';
  const zalo = contactSettings.contact_zalo as string || '';
  const messenger = contactSettings.contact_messenger as string || '';

  const handleCall = () => {
    if (phone) {
      window.location.href = `tel:${phone}`;
    }
  };

  const handleChat = () => {
    // Priority: Zalo > Messenger
    if (zalo) {
      // Pre-fill message with service name
      const message = serviceName 
        ? `Xin chào, tôi muốn tư vấn về dịch vụ: ${serviceName}`
        : 'Xin chào, tôi cần tư vấn';
      const encodedMessage = encodeURIComponent(message);
      window.open(`https://zalo.me/${zalo}?text=${encodedMessage}`, '_blank');
    } else if (messenger) {
      window.open(messenger, '_blank');
    } else if (phone) {
      // Fallback to phone if no chat available
      handleCall();
    }
  };

  const hasPhone = Boolean(phone);
  const hasChat = Boolean(zalo || messenger);

  if (!hasPhone && !hasChat) {
    return null;
  }

  const containerClass = variant === 'vertical' 
    ? 'flex flex-col gap-3 w-full' 
    : 'flex flex-wrap gap-3';

  return (
    <div className={`${containerClass} ${className}`}>
      {hasPhone && (
        <button
          onClick={handleCall}
          className="flex-1 min-h-11 px-6 rounded-xl text-white font-semibold transition-all hover:shadow-lg hover:scale-[1.02] flex items-center justify-center gap-2"
          style={{ backgroundColor: brandColor }}
        >
          <Phone size={18} />
          Liên hệ tư vấn
        </button>
      )}
      {hasChat && (
        <button
          onClick={handleChat}
          className="flex-1 min-h-11 px-6 rounded-xl font-medium border transition-colors hover:bg-slate-50 flex items-center justify-center gap-2"
          style={{ borderColor: `${brandColor}80`, color: brandColor }}
        >
          <MessageCircle size={18} />
          Chat ngay
        </button>
      )}
    </div>
  );
}

// Compact version for cards/small spaces
interface QuickContactCompactProps {
  serviceName?: string;
  brandColor: string;
  className?: string;
}

export function QuickContactCompact({ 
  serviceName, 
  brandColor,
  className = ''
}: QuickContactCompactProps) {
  const contactSettings = useQuery(api.settings.getMultiple, {
    keys: ['contact_phone', 'contact_zalo', 'contact_messenger']
  });

  if (!contactSettings) {
    return null;
  }

  const phone = contactSettings.contact_phone as string || '';
  const zalo = contactSettings.contact_zalo as string || '';
  const messenger = contactSettings.contact_messenger as string || '';

  const handleContact = () => {
    // Priority: Zalo > Messenger > Phone
    if (zalo) {
      const message = serviceName 
        ? `Xin chào, tôi muốn tư vấn về dịch vụ: ${serviceName}`
        : 'Xin chào, tôi cần tư vấn';
      const encodedMessage = encodeURIComponent(message);
      window.open(`https://zalo.me/${zalo}?text=${encodedMessage}`, '_blank');
    } else if (messenger) {
      window.open(messenger, '_blank');
    } else if (phone) {
      window.location.href = `tel:${phone}`;
    }
  };

  const hasContact = Boolean(phone || zalo || messenger);

  if (!hasContact) {
    return null;
  }

  return (
    <button
      onClick={handleContact}
      className={`w-full py-2 text-white text-xs font-medium rounded-lg transition-all hover:opacity-90 ${className}`}
      style={{ backgroundColor: brandColor }}
    >
      Liên hệ tư vấn
    </button>
  );
}
