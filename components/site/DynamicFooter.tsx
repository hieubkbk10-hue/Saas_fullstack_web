'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useBrandColor, useSiteSettings } from './hooks';
import { Facebook, Instagram, Twitter } from 'lucide-react';

type FooterConfig = {
  logo?: string;
  description?: string;
  columns?: Array<{ id: number; title: string; links: Array<{ label: string; url: string }> }>;
  copyright?: string;
  showSocialLinks?: boolean;
  style?: 'columns' | 'centered' | 'minimal';
};

export function DynamicFooter() {
  const brandColor = useBrandColor();
  const { siteName } = useSiteSettings();
  const components = useQuery(api.homeComponents.listActive);
  
  const footerComponent = React.useMemo(() => {
    if (!components) return null;
    return components.find(c => c.type === 'Footer' && c.active);
  }, [components]);

  const currentYear = new Date().getFullYear();

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
  const style = config.style || 'columns';

  // Style: Columns (default)
  if (style === 'columns') {
    return (
      <footer className="bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="lg:col-span-1">
              <Link href="/" className="flex items-center gap-2 mb-4">
                {config.logo ? (
                  <img src={config.logo} alt={siteName} className="h-8 w-auto" />
                ) : (
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: brandColor }}
                  >
                    {(siteName || 'V').charAt(0)}
                  </div>
                )}
                <span className="font-bold text-lg">{siteName}</span>
              </Link>
              <p className="text-slate-400 text-sm mb-4">
                {config.description || ''}
              </p>
              {config.showSocialLinks && (
                <div className="flex gap-2">
                  <SocialIcon icon={Facebook} brandColor={brandColor} />
                  <SocialIcon icon={Instagram} brandColor={brandColor} />
                  <SocialIcon icon={Twitter} brandColor={brandColor} />
                </div>
              )}
            </div>

            {/* Columns */}
            {config.columns?.slice(0, 3).map((column) => (
              <div key={column.id}>
                <h4 className="font-semibold mb-4">{column.title}</h4>
                <ul className="space-y-2">
                  {column.links.map((link, idx) => (
                    <li key={idx}>
                      <Link 
                        href={link.url || '#'}
                        className="text-sm text-slate-400 hover:text-white transition-colors"
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
        
        {/* Copyright */}
        <div className="border-t border-slate-800">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <p className="text-center text-sm text-slate-500">
              {config.copyright || `© ${currentYear} ${siteName}. All rights reserved.`}
            </p>
          </div>
        </div>
      </footer>
    );
  }

  // Style: Centered
  if (style === 'centered') {
    return (
      <footer className="bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <div className="mb-6">
            {config.logo ? (
              <img src={config.logo} alt={siteName} className="h-10 w-auto mx-auto" />
            ) : (
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-xl mx-auto"
                style={{ backgroundColor: brandColor }}
              >
                {(siteName || 'V').charAt(0)}
              </div>
            )}
          </div>
          <p className="text-slate-400 text-sm mb-6 max-w-md mx-auto">
            {config.description || ''}
          </p>
          
          {/* All links in one row */}
          <div className="flex flex-wrap justify-center gap-6 mb-6">
            {config.columns?.flatMap(col => col.links).slice(0, 6).map((link, idx) => (
              <Link 
                key={idx}
                href={link.url || '#'}
                className="text-sm text-slate-400 hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
          
          {config.showSocialLinks && (
            <div className="flex justify-center gap-3 mb-6">
              <SocialIcon icon={Facebook} brandColor={brandColor} />
              <SocialIcon icon={Instagram} brandColor={brandColor} />
              <SocialIcon icon={Twitter} brandColor={brandColor} />
            </div>
          )}
          
          <p className="text-sm text-slate-500">
            {config.copyright || `© ${currentYear} ${siteName}. All rights reserved.`}
          </p>
        </div>
      </footer>
    );
  }

  // Style: Minimal
  return (
    <footer className="bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            {config.logo ? (
              <img src={config.logo} alt={siteName} className="h-8 w-auto" />
            ) : (
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: brandColor }}
              >
                {(siteName || 'V').charAt(0)}
              </div>
            )}
            <span className="font-semibold">{siteName}</span>
          </Link>
          
          <div className="flex flex-wrap justify-center gap-6">
            {config.columns?.flatMap(col => col.links).slice(0, 4).map((link, idx) => (
              <Link 
                key={idx}
                href={link.url || '#'}
                className="text-sm text-slate-400 hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
          
          <p className="text-sm text-slate-500">
            {config.copyright || `© ${currentYear}`}
          </p>
        </div>
      </div>
    </footer>
  );
}

function SocialIcon({ icon: Icon, brandColor }: { icon: React.ElementType; brandColor: string }) {
  return (
    <a 
      href="#" 
      className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center hover:opacity-80 transition-opacity"
      style={{ backgroundColor: `${brandColor}30` }}
    >
      <Icon size={16} className="text-slate-300" />
    </a>
  );
}
