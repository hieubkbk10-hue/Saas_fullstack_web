'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useBrandColor, useSiteSettings, useSocialLinks } from './hooks';
import { Facebook, Instagram, Youtube, Twitter, Linkedin, Github, Globe } from 'lucide-react';

type SocialLinkItem = { id: number; platform: string; url: string; icon: string };
type FooterConfig = {
  logo?: string;
  description?: string;
  columns?: Array<{ id: number; title: string; links: Array<{ label: string; url: string }> }>;
  socialLinks?: SocialLinkItem[];
  copyright?: string;
  showSocialLinks?: boolean;
  style?: 'classic' | 'modern' | 'corporate' | 'minimal';
};

// Custom TikTok icon (Lucide không có)
const TikTokIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

// Custom Zalo icon (Simple Icons - monochrome)
const ZaloIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.49 10.2722v-.4496h1.3467v6.3218h-.7704a.576.576 0 01-.5763-.5729l-.0006.0005a3.273 3.273 0 01-1.9372.6321c-1.8138 0-3.2844-1.4697-3.2844-3.2823 0-1.8125 1.4706-3.2822 3.2844-3.2822a3.273 3.273 0 011.9372.6321l.0006.0005zM6.9188 7.7896v.205c0 .3823-.051.6944-.2995 1.0605l-.03.0343c-.0542.0615-.1815.206-.2421.2843L2.024 14.8h4.8948v.7682a.5764.5764 0 01-.5767.5761H0v-.3622c0-.4436.1102-.6414.2495-.8476L4.8582 9.23H.1922V7.7896h6.7266zm8.5513 8.3548a.4805.4805 0 01-.4803-.4798v-7.875h1.4416v8.3548H15.47zM20.6934 9.6C22.52 9.6 24 11.0807 24 12.9044c0 1.8252-1.4801 3.306-3.3066 3.306-1.8264 0-3.3066-1.4808-3.3066-3.306 0-1.8237 1.4802-3.3044 3.3066-3.3044zm-10.1412 5.253c1.0675 0 1.9324-.8645 1.9324-1.9312 0-1.065-.865-1.9295-1.9324-1.9295s-1.9324.8644-1.9324 1.9295c0 1.0667.865 1.9312 1.9324 1.9312zm10.1412-.0033c1.0737 0 1.945-.8707 1.945-1.9453 0-1.073-.8713-1.9436-1.945-1.9436-1.0753 0-1.945.8706-1.945 1.9436 0 1.0746.8697 1.9453 1.945 1.9453z"/>
  </svg>
);

// Social icons based on platform
const SocialIcon = ({ platform, size = 18 }: { platform: string; size?: number }) => {
  switch (platform) {
    case 'facebook': return <Facebook size={size} />;
    case 'instagram': return <Instagram size={size} />;
    case 'youtube': return <Youtube size={size} />;
    case 'tiktok': return <TikTokIcon size={size} />;
    case 'zalo': return <ZaloIcon size={size} />;
    case 'twitter': return <Twitter size={size} />;
    case 'linkedin': return <Linkedin size={size} />;
    case 'github': return <Github size={size} />;
    default: return <Globe size={size} />;
  }
};

// Utility: Darken a hex color
const darkenColor = (hex: string, percent: number): string => {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.max((num >> 16) - amt, 0);
  const G = Math.max((num >> 8 & 0x00FF) - amt, 0);
  const B = Math.max((num & 0x0000FF) - amt, 0);
  return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
};

export function DynamicFooter() {
  const brandColor = useBrandColor();
  const { siteName, logo: siteLogo } = useSiteSettings();
  const socialLinks = useSocialLinks();
  const components = useQuery(api.homeComponents.listActive);
  
  const footerComponent = React.useMemo(() => {
    if (!components) return null;
    return components.find(c => c.type === 'Footer' && c.active);
  }, [components]);

  const currentYear = new Date().getFullYear();

  // Get socials from config or from settings
  const getSocials = (config: FooterConfig) => {
    if (config.socialLinks && config.socialLinks.length > 0) {
      return config.socialLinks;
    }
    // Fallback to settings socials
    const settingSocials: SocialLinkItem[] = [];
    if (socialLinks.facebook) settingSocials.push({ id: 1, platform: 'facebook', url: socialLinks.facebook, icon: 'facebook' });
    if (socialLinks.instagram) settingSocials.push({ id: 2, platform: 'instagram', url: socialLinks.instagram, icon: 'instagram' });
    if (socialLinks.youtube) settingSocials.push({ id: 3, platform: 'youtube', url: socialLinks.youtube, icon: 'youtube' });
    if (socialLinks.tiktok) settingSocials.push({ id: 4, platform: 'tiktok', url: socialLinks.tiktok, icon: 'tiktok' });
    if (socialLinks.zalo) settingSocials.push({ id: 5, platform: 'zalo', url: socialLinks.zalo, icon: 'zalo' });
    return settingSocials.length > 0 ? settingSocials : [
      { id: 1, platform: 'facebook', url: '#', icon: 'facebook' },
      { id: 2, platform: 'instagram', url: '#', icon: 'instagram' },
      { id: 3, platform: 'youtube', url: '#', icon: 'youtube' },
    ];
  };

  // Default columns
  const getColumns = (config: FooterConfig) => {
    if (config.columns && config.columns.length > 0) {
      return config.columns;
    }
    return [
      { id: 1, title: 'Về chúng tôi', links: [{ label: 'Giới thiệu', url: '/about' }, { label: 'Tuyển dụng', url: '/careers' }, { label: 'Đội ngũ', url: '/team' }, { label: 'Tin tức', url: '/blog' }] },
      { id: 2, title: 'Hỗ trợ', links: [{ label: 'FAQ', url: '/faq' }, { label: 'Liên hệ', url: '/contact' }, { label: 'Chính sách', url: '/policy' }, { label: 'Báo cáo', url: '/report' }] }
    ];
  };

  // Fallback footer nếu không có Footer component
  const fallbackBgDark = darkenColor(brandColor, 70);
  if (!footerComponent) {
    return (
      <footer className="text-white" style={{ backgroundColor: fallbackBgDark }}>
        <div className="py-6 px-4">
          <p className="text-center text-sm text-slate-500">
            © {currentYear} {siteName || 'VietAdmin'}. All rights reserved.
          </p>
        </div>
      </footer>
    );
  }

  const config = footerComponent.config as FooterConfig;
  const style = config.style || 'classic';
  const logo = config.logo || siteLogo;
  const socials = getSocials(config);
  const columns = getColumns(config);

  // Background colors from brandColor, text uses neutral colors
  const bgDark = darkenColor(brandColor, 70);      // Dark background
  const bgMedium = darkenColor(brandColor, 60);    // Medium dark for cards/sections
  const borderColor = darkenColor(brandColor, 45); // Border color (subtle)

  // Social media brand colors
  const socialColors: Record<string, string> = {
    facebook: '#1877F2',
    instagram: '#E4405F', 
    youtube: '#FF0000',
    tiktok: '#000000',
    zalo: '#0084FF',
    twitter: '#1DA1F2',
    linkedin: '#0A66C2',
    github: '#181717',
  };

  // Style 1: Classic Dark - Standard layout với brand column và menu columns
  if (style === 'classic') {
    return (
      <footer className="w-full text-white py-8 md:py-10" style={{ backgroundColor: bgDark, borderTop: `1px solid ${borderColor}` }}>
        <div className="container max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 lg:gap-6">
            
            {/* Brand Column */}
            <div className="lg:col-span-5 space-y-4">
              <Link href="/" className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg" style={{ backgroundColor: bgMedium, border: `1px solid ${borderColor}` }}>
                  {logo ? (
                    <img src={logo} alt={siteName} className="h-6 w-6 object-contain brightness-110" />
                  ) : (
                    <div className="h-6 w-6 rounded flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: brandColor }}>
                      {(siteName || 'V').charAt(0)}
                    </div>
                  )}
                </div>
                <span className="text-lg font-bold tracking-tight text-white">{siteName || 'VietAdmin'}</span>
              </Link>
              <p className="text-sm leading-relaxed max-w-sm text-white/80">
                {config.description || 'Đối tác tin cậy của bạn trong mọi giải pháp công nghệ và sáng tạo kỹ thuật số.'}
              </p>
              {config.showSocialLinks !== false && (
                <div className="flex gap-2">
                  {socials.map((s, idx) => (
                    <a 
                      key={s.id || `social-${idx}`} 
                      href={s.url || '#'} 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-6 w-6 flex items-center justify-center rounded-full hover:opacity-80 transition-all duration-300"
                      style={{ backgroundColor: '#ffffff', color: socialColors[s.platform] || '#94a3b8' }}
                    >
                      <SocialIcon platform={s.platform} size={12} />
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Dynamic Columns */}
            <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-6">
              {columns.slice(0, 2).map((col, colIdx) => (
                <div key={col.id || `col-${colIdx}`}>
                  <h3 className="font-semibold text-white text-sm tracking-wide mb-3">{col.title}</h3>
                  <ul className="space-y-2">
                    {col.links.map((link, lIdx) => (
                      <li key={lIdx}>
                        <Link 
                          href={link.url || '#'} 
                          className="text-sm hover:text-white transition-colors block text-white/70"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 pt-4" style={{ borderTop: `1px solid ${borderColor}50` }}>
            <p className="text-xs text-white/60">{config.copyright || `© ${currentYear} ${siteName || 'VietAdmin'}. All rights reserved.`}</p>
          </div>
        </div>
      </footer>
    );
  }

  // Style 2: Modern Centered - Elegant centered layout
  if (style === 'modern') {
    return (
      <footer className="w-full text-white py-8 md:py-10" style={{ backgroundColor: bgDark }}>
        <div className="container max-w-5xl mx-auto px-4 md:px-6 flex flex-col items-center text-center space-y-5 md:space-y-6">
          
          {/* Brand */}
          <div className="flex flex-col items-center gap-2">
            <div className="h-12 w-12 rounded-xl flex items-center justify-center shadow-lg shadow-black/20 mb-1" style={{ background: `linear-gradient(to top right, ${bgMedium}, ${borderColor})` }}>
              {logo ? (
                <img src={logo} alt={siteName} className="h-7 w-7 object-contain drop-shadow-md" />
              ) : (
                <div className="h-7 w-7 rounded-lg flex items-center justify-center text-white font-bold text-base" style={{ backgroundColor: brandColor }}>
                  {(siteName || 'V').charAt(0)}
                </div>
              )}
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">{siteName || 'VietAdmin'}</h2>
            <p className="max-w-md text-sm leading-relaxed text-white/80">
              {config.description || 'Đối tác tin cậy của bạn trong mọi giải pháp công nghệ và sáng tạo kỹ thuật số.'}
            </p>
          </div>

          {/* Navigation (Flat) */}
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 md:gap-x-6">
            {columns.flatMap(col => col.links).slice(0, 8).map((link, i) => (
              <Link 
                key={i} 
                href={link.url || '#'} 
                className="text-sm font-medium hover:text-white hover:underline underline-offset-4 transition-all text-white/70"
                style={{ textDecorationColor: brandColor }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="w-16 h-px" style={{ background: `linear-gradient(to right, transparent, ${borderColor}, transparent)` }}></div>

          {/* Socials */}
          {config.showSocialLinks !== false && (
            <div className="flex gap-4">
              {socials.map((s, idx) => (
                <a 
                  key={s.id || `social-${idx}`} 
                  href={s.url || '#'} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-6 w-6 flex items-center justify-center rounded-full hover:opacity-80 transition-all duration-300"
                  style={{ backgroundColor: '#ffffff', color: socialColors[s.platform] || '#94a3b8' }}
                >
                  <SocialIcon platform={s.platform} size={12} />
                </a>
              ))}
            </div>
          )}

          {/* Copyright */}
          <div className="text-xs font-medium text-white/60">
            {config.copyright || `© ${currentYear} ${siteName || 'VietAdmin'}. All rights reserved.`}
          </div>
        </div>
      </footer>
    );
  }

  // Style 3: Corporate Grid - Structured professional layout
  if (style === 'corporate') {
    return (
      <footer className="w-full text-white py-8 md:py-10" style={{ backgroundColor: bgDark, borderTop: `1px solid ${borderColor}` }}>
        <div className="container max-w-7xl mx-auto px-4 md:px-6">
          
          {/* Top Row: Logo & Socials */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 pb-6" style={{ borderBottom: `1px solid ${borderColor}` }}>
            <Link href="/" className="flex items-center gap-2">
              {logo ? (
                <img src={logo} alt={siteName} className="h-6 w-6 object-contain" />
              ) : (
                <div className="h-6 w-6 rounded flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: brandColor }}>
                  {(siteName || 'V').charAt(0)}
                </div>
              )}
              <span className="text-base font-bold text-white">{siteName || 'VietAdmin'}</span>
            </Link>
            {config.showSocialLinks !== false && (
              <div className="flex gap-3">
                {socials.map((s, idx) => (
                  <a 
                    key={s.id || `social-${idx}`} 
                    href={s.url || '#'} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-5 w-5 flex items-center justify-center rounded-full hover:opacity-80 transition-all duration-300"
                    style={{ backgroundColor: '#ffffff', color: socialColors[s.platform] || '#94a3b8' }}
                  >
                    <SocialIcon platform={s.platform} size={10} />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Middle Row: Columns */}
          <div className="py-6 grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-2 md:pr-6">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">Về Công Ty</h4>
              <p className="text-sm leading-relaxed text-white/80">
                {config.description || 'Đối tác tin cậy của bạn trong mọi giải pháp công nghệ và sáng tạo kỹ thuật số.'}
              </p>
            </div>
            
            {columns.slice(0, 2).map((col, colIdx) => (
              <div key={col.id || `col-${colIdx}`}>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">{col.title}</h4>
                <ul className="space-y-1.5">
                  {col.links.map((link, lIdx) => (
                    <li key={lIdx}>
                      <Link href={link.url || '#'} className="text-sm hover:text-white transition-colors text-white/70">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom Row */}
          <div className="pt-4 text-xs text-center md:text-left text-white/60">
            {config.copyright || `© ${currentYear} ${siteName || 'VietAdmin'}. All rights reserved.`}
          </div>
        </div>
      </footer>
    );
  }

  // Style 4: Minimal - Compact single row
  return (
    <footer className="w-full text-white py-4 md:py-5" style={{ backgroundColor: bgDark, borderTop: `1px solid ${borderColor}` }}>
      <div className="container max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          
          {/* Left: Logo & Copy */}
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-3">
            {logo ? (
              <img src={logo} alt={siteName} className="h-5 w-5 opacity-80" />
            ) : (
              <div className="h-5 w-5 rounded flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: brandColor }}>
                {(siteName || 'V').charAt(0)}
              </div>
            )}
            <span className="text-xs font-medium text-white/60">
              {config.copyright || `© ${currentYear} ${siteName || 'VietAdmin'}. All rights reserved.`}
            </span>
          </div>

          {/* Right: Socials only */}
          {config.showSocialLinks !== false && (
            <div className="flex gap-2">
              {socials.map((s, idx) => (
                <a 
                  key={s.id || `social-${idx}`} 
                  href={s.url || '#'} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-5 w-5 flex items-center justify-center rounded-full hover:opacity-80 transition-all duration-300"
                  style={{ backgroundColor: '#ffffff', color: socialColors[s.platform] || '#94a3b8' }}
                >
                  <SocialIcon platform={s.platform} size={10} />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
