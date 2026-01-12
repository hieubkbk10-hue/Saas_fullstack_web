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

// Custom Zalo icon (official logo)
const ZaloIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 50 50" fill="currentColor">
    <path fillRule="evenodd" clipRule="evenodd" d="M22.782 0.166H27.199C33.265 0.166 36.81 1.057 39.957 2.744C43.104 4.431 45.588 6.896 47.256 10.043C48.943 13.19 49.834 16.735 49.834 22.801V27.199C49.834 33.265 48.943 36.81 47.256 39.957C45.569 43.104 43.104 45.588 39.957 47.256C36.81 48.943 33.265 49.834 27.199 49.834H22.801C16.735 49.834 13.19 48.943 10.043 47.256C6.896 45.569 4.412 43.104 2.744 39.957C1.057 36.81 0.166 33.265 0.166 27.199V22.801C0.166 16.735 1.057 13.19 2.744 10.043C4.431 6.896 6.896 4.412 10.043 2.744C13.171 1.057 16.735 0.166 22.782 0.166Z"/>
    <path fill="white" d="M20.563 17H10.838V19.085H17.587L10.933 27.332C10.724 27.635 10.573 27.919 10.573 28.564V29.095H19.748C20.203 29.095 20.582 28.716 20.582 28.261V27.142H13.492L19.748 19.294C19.843 19.18 20.013 18.972 20.089 18.877L20.127 18.82C20.487 18.289 20.563 17.834 20.563 17.284V17Z"/>
    <path fill="white" d="M32.942 29.095H34.326V17H32.24V28.393C32.24 28.773 32.544 29.095 32.942 29.095Z"/>
    <path fill="white" d="M25.814 19.692C23.198 19.692 21.075 21.816 21.075 24.432C21.075 27.048 23.198 29.171 25.814 29.171C28.43 29.171 30.553 27.048 30.553 24.432C30.572 21.816 28.449 19.692 25.814 19.692ZM25.814 27.218C24.279 27.218 23.027 25.967 23.027 24.432C23.027 22.896 24.279 21.645 25.814 21.645C27.35 21.645 28.601 22.896 28.601 24.432C28.601 25.967 27.369 27.218 25.814 27.218Z"/>
    <path fill="white" d="M40.487 19.616C37.852 19.616 35.71 21.758 35.71 24.393C35.71 27.029 37.852 29.171 40.487 29.171C43.122 29.171 45.264 27.029 45.264 24.393C45.264 21.758 43.122 19.616 40.487 19.616ZM40.487 27.218C38.932 27.218 37.681 25.967 37.681 24.412C37.681 22.858 38.932 21.607 40.487 21.607C42.041 21.607 43.292 22.858 43.292 24.412C43.292 25.967 42.041 27.218 40.487 27.218Z"/>
    <path fill="white" d="M29.456 29.094H30.575V19.957H28.622V28.279C28.622 28.715 29.001 29.094 29.456 29.094Z"/>
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
  if (!footerComponent) {
    return (
      <footer className="bg-slate-900 text-white">
        <div className="py-6 px-4">
          <p className="text-center text-sm text-slate-400">
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

  // Style 1: Classic Dark - Standard layout với brand column và menu columns
  if (style === 'classic') {
    return (
      <footer className="w-full bg-slate-950 text-slate-200 py-12 md:py-16 border-t border-slate-800">
        <div className="container max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-8">
            
            {/* Brand Column */}
            <div className="lg:col-span-5 space-y-6">
              <Link href="/" className="flex items-center gap-3">
                <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                  {logo ? (
                    <img src={logo} alt={siteName} className="h-8 w-8 object-contain brightness-110" />
                  ) : (
                    <div className="h-8 w-8 rounded flex items-center justify-center text-white font-bold" style={{ backgroundColor: brandColor }}>
                      {(siteName || 'V').charAt(0)}
                    </div>
                  )}
                </div>
                <span className="text-xl font-bold tracking-tight text-white">{siteName || 'VietAdmin'}</span>
              </Link>
              <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
                {config.description || 'Đối tác tin cậy của bạn trong mọi giải pháp công nghệ và sáng tạo kỹ thuật số.'}
              </p>
              {config.showSocialLinks !== false && (
                <div className="flex gap-3">
                  {socials.map((s, idx) => (
                    <a 
                      key={s.id || `social-${idx}`} 
                      href={s.url || '#'} 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-900 text-slate-400 hover:text-white transition-all duration-300 border border-slate-800 hover:border-slate-600"
                    >
                      <SocialIcon platform={s.platform} size={18} />
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Dynamic Columns */}
            <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-8">
              {columns.slice(0, 2).map((col) => (
                <div key={col.id}>
                  <h3 className="font-semibold text-white tracking-wide mb-6">{col.title}</h3>
                  <ul className="space-y-4">
                    {col.links.map((link, lIdx) => (
                      <li key={lIdx}>
                        <Link 
                          href={link.url || '#'} 
                          className="text-sm text-slate-400 hover:text-white transition-colors block"
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

          <div className="mt-16 pt-8 border-t border-slate-800/50">
            <p className="text-xs text-slate-500">{config.copyright || `© ${currentYear} ${siteName || 'VietAdmin'}. All rights reserved.`}</p>
          </div>
        </div>
      </footer>
    );
  }

  // Style 2: Modern Centered - Elegant centered layout
  if (style === 'modern') {
    return (
      <footer className="w-full bg-slate-900 text-slate-200 py-16 md:py-20">
        <div className="container max-w-5xl mx-auto px-4 md:px-6 flex flex-col items-center text-center space-y-8 md:space-y-10">
          
          {/* Brand */}
          <div className="flex flex-col items-center gap-4">
            <div className="h-16 w-16 bg-gradient-to-tr from-slate-800 to-slate-700 rounded-2xl flex items-center justify-center shadow-2xl shadow-black/20 mb-2">
              {logo ? (
                <img src={logo} alt={siteName} className="h-10 w-10 object-contain drop-shadow-md" />
              ) : (
                <div className="h-10 w-10 rounded-xl flex items-center justify-center text-white font-bold text-xl" style={{ backgroundColor: brandColor }}>
                  {(siteName || 'V').charAt(0)}
                </div>
              )}
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">{siteName || 'VietAdmin'}</h2>
            <p className="text-slate-400 max-w-md text-sm leading-relaxed opacity-80">
              {config.description || 'Đối tác tin cậy của bạn trong mọi giải pháp công nghệ và sáng tạo kỹ thuật số.'}
            </p>
          </div>

          {/* Navigation (Flat) */}
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 md:gap-x-8">
            {columns.flatMap(col => col.links).slice(0, 8).map((link, i) => (
              <Link 
                key={i} 
                href={link.url || '#'} 
                className="text-sm font-medium text-slate-300 hover:text-white hover:underline underline-offset-4 transition-all"
                style={{ textDecorationColor: brandColor }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="w-24 h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent"></div>

          {/* Socials */}
          {config.showSocialLinks !== false && (
            <div className="flex gap-6">
              {socials.map((s, idx) => (
                <a 
                  key={s.id || `social-${idx}`} 
                  href={s.url || '#'} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-white hover:scale-110 transition-transform"
                >
                  <SocialIcon platform={s.platform} size={24} />
                </a>
              ))}
            </div>
          )}

          {/* Copyright */}
          <div className="text-xs text-slate-600 font-medium">
            {config.copyright || `© ${currentYear} ${siteName || 'VietAdmin'}. All rights reserved.`}
          </div>
        </div>
      </footer>
    );
  }

  // Style 3: Corporate Grid - Structured professional layout
  if (style === 'corporate') {
    return (
      <footer className="w-full bg-[#0B0F19] text-gray-300 py-12 md:py-16 border-t border-slate-900">
        <div className="container max-w-7xl mx-auto px-4 md:px-6">
          
          {/* Top Row: Logo & Socials */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 pb-12 border-b border-slate-900">
            <Link href="/" className="flex items-center gap-3">
              {logo ? (
                <img src={logo} alt={siteName} className="h-8 w-8 object-contain" />
              ) : (
                <div className="h-8 w-8 rounded flex items-center justify-center text-white font-bold" style={{ backgroundColor: brandColor }}>
                  {(siteName || 'V').charAt(0)}
                </div>
              )}
              <span className="text-lg font-bold text-white">{siteName || 'VietAdmin'}</span>
            </Link>
            {config.showSocialLinks !== false && (
              <div className="flex gap-4">
                {socials.map((s, idx) => (
                  <a 
                    key={s.id || `social-${idx}`} 
                    href={s.url || '#'} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-500 hover:text-white transition-colors"
                  >
                    <SocialIcon platform={s.platform} size={20} />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Middle Row: Columns */}
          <div className="py-12 grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-10">
            <div className="md:col-span-2 md:pr-10">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Về Công Ty</h4>
              <p className="text-sm text-gray-500 leading-7">
                {config.description || 'Đối tác tin cậy của bạn trong mọi giải pháp công nghệ và sáng tạo kỹ thuật số.'}
              </p>
            </div>
            
            {columns.slice(0, 2).map((col) => (
              <div key={col.id}>
                <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">{col.title}</h4>
                <ul className="space-y-3">
                  {col.links.map((link, lIdx) => (
                    <li key={lIdx}>
                      <Link href={link.url || '#'} className="text-sm text-gray-500 hover:text-white transition-colors">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom Row */}
          <div className="pt-8 text-sm text-gray-600 text-center md:text-left">
            {config.copyright || `© ${currentYear} ${siteName || 'VietAdmin'}. All rights reserved.`}
          </div>
        </div>
      </footer>
    );
  }

  // Style 4: Minimal - Compact single row
  return (
    <footer className="w-full bg-black text-white py-6 md:py-8 border-t border-white/10">
      <div className="container max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6">
          
          {/* Left: Logo & Copy */}
          <div className="flex flex-col md:flex-row items-center gap-3 md:gap-4">
            {logo ? (
              <img src={logo} alt={siteName} className="h-6 w-6 opacity-80" />
            ) : (
              <div className="h-6 w-6 rounded flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: brandColor }}>
                {(siteName || 'V').charAt(0)}
              </div>
            )}
            <span className="text-sm text-neutral-400 font-medium">
              {config.copyright || `© ${currentYear} ${siteName || 'VietAdmin'}. All rights reserved.`}
            </span>
          </div>

          {/* Right: Socials only */}
          {config.showSocialLinks !== false && (
            <div className="flex gap-5">
              {socials.map((s, idx) => (
                <a 
                  key={s.id || `social-${idx}`} 
                  href={s.url || '#'} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neutral-500 hover:text-white transition-colors"
                >
                  <SocialIcon platform={s.platform} size={18} />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
