import {
  JsonLd,
  generateLocalBusinessSchema,
  generateNavigationSchema,
  generateOrganizationSchema,
  generateWebsiteSchema,
} from '@/components/seo/JsonLd';
import { DynamicFooter } from '@/components/site/DynamicFooter';
import { Header } from '@/components/site/Header';
import { CartDrawer } from '@/components/site/CartDrawer';
import { SiteProviders } from '@/components/site/SiteProviders';
import { api } from '@/convex/_generated/api';
import { getConvexClient } from '@/lib/convex';
import { getContactSettings, getSEOSettings, getSiteSettings } from '@/lib/get-settings';
import { parseHreflang } from '@/lib/seo';
import type { Metadata } from 'next';

const buildKeywords = (seoKeywords: string): string[] => {
  if (!seoKeywords) {
    return [];
  }
  return seoKeywords.split(',').map((keyword) => keyword.trim());
};

const buildLocale = (language: string): string => {
  if (language === 'vi') {
    return 'vi_VN';
  }
  return 'en_US';
};

const buildImageEntries = (imageUrl: string): { url: string }[] => {
  if (!imageUrl) {
    return [];
  }
  return [{ url: imageUrl }];
};

const buildTwitterImages = (imageUrl: string): string[] => {
  if (!imageUrl) {
    return [];
  }
  return [imageUrl];
};

const buildMetadataBase = (baseUrl: string): URL | undefined => {
  if (!baseUrl) {
    return undefined;
  }
  return new URL(baseUrl);
};

const resolveCanonical = (baseUrl: string): string | undefined => {
  if (!baseUrl) {
    return undefined;
  }
  return baseUrl;
};

const resolveUrl = (url: string, baseUrl: string): string => {
  if (!url) {
    return baseUrl;
  }
  if (url.startsWith('http')) {
    return url;
  }
  return `${baseUrl.replace(/\/$/, '')}/${url.replace(/^\//, '')}`;
};

export const generateMetadata = (): Promise<Metadata> => {
  return Promise.all([
    getSiteSettings(),
    getSEOSettings(),
  ]).then(([site, seo]) => {
    const baseUrl = (site.site_url || process.env.NEXT_PUBLIC_SITE_URL) ?? '';
    const title = seo.seo_title || site.site_name || 'VietAdmin';
    const description = seo.seo_description || site.site_tagline || '';
    const languages = parseHreflang(seo.seo_hreflang);

    return {
      alternates: {
        canonical: resolveCanonical(baseUrl),
        ...(Object.keys(languages).length > 0 && { languages }),
      },
      description,
      icons: { icon: '/api/favicon' },
      keywords: buildKeywords(seo.seo_keywords || ''),
      metadataBase: buildMetadataBase(baseUrl),
      openGraph: {
        description,
        images: buildImageEntries(seo.seo_og_image || ''),
        locale: buildLocale(site.site_language || 'vi'),
        siteName: site.site_name || 'VietAdmin',
        title,
        type: 'website',
      },
      robots: {
        follow: true,
        index: true,
      },
      title: {
        default: title,
        template: `%s | ${site.site_name || 'VietAdmin'}`,
      },
      twitter: {
        card: 'summary_large_image',
        description,
        images: buildTwitterImages(seo.seo_og_image || ''),
        title,
      },
    };
  });
};

const SiteLayout = ({
  children,
}: {
  children: React.ReactNode;
}): Promise<React.ReactElement> => {
  return Promise.all([
    getSiteSettings(),
    getSEOSettings(),
    getContactSettings(),
  ]).then(async ([site, seo, contact]) => {
    const baseUrl = (site.site_url || process.env.NEXT_PUBLIC_SITE_URL) ?? '';
    const client = getConvexClient();
    const headerMenu = await client.query(api.menus.getMenuByLocation, { location: 'header' });
    const headerItems = headerMenu
      ? await client.query(api.menus.listActiveMenuItems, { menuId: headerMenu._id })
      : [];

    const organizationSchema = generateOrganizationSchema({
      address: contact.contact_address,
      description: seo.seo_description,
      email: contact.contact_email,
      logo: site.site_logo,
      name: site.site_name,
      phone: contact.contact_phone,
      url: baseUrl,
    });

    const localBusinessSchema = generateLocalBusinessSchema({
      address: contact.contact_address,
      description: seo.seo_description,
      email: contact.contact_email,
      geo: {
        lat: seo.seo_geo_lat,
        lng: seo.seo_geo_lng,
      },
      logo: site.site_logo,
      name: site.site_name,
      openingHours: seo.seo_opening_hours,
      phone: contact.contact_phone,
      priceRange: seo.seo_price_range,
      type: seo.seo_business_type,
      url: baseUrl,
    });

    const navigationSchema = generateNavigationSchema({
      items: headerItems.map((item) => ({
        name: item.label,
        url: resolveUrl(item.url, baseUrl),
      })),
      name: `${site.site_name} Navigation`,
      url: baseUrl,
    });

    const websiteSchema = generateWebsiteSchema({
      description: seo.seo_description,
      name: site.site_name,
      url: baseUrl,
    });

    return (
      <SiteProviders>
        <div className="min-h-screen flex flex-col">
          <JsonLd data={organizationSchema} />
          <JsonLd data={localBusinessSchema} />
          <JsonLd data={websiteSchema} />
          {headerItems.length > 0 && <JsonLd data={navigationSchema} />}
          <Header />
          <CartDrawer />
          <main className="flex-1 overflow-x-hidden">
            {children}
          </main>
          <DynamicFooter />
        </div>
      </SiteProviders>
    );
  });
};

export default SiteLayout;
