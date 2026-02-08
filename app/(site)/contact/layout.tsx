import type { Metadata } from 'next';
import { JsonLd, generateBreadcrumbSchema } from '@/components/seo/JsonLd';
import { getContactSettings, getSEOSettings, getSiteSettings } from '@/lib/get-settings';
import { parseHreflang } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  const [site, seo] = await Promise.all([
    getSiteSettings(),
    getSEOSettings(),
  ]);

  const baseUrl = (site.site_url || process.env.NEXT_PUBLIC_SITE_URL) ?? '';
  const title = 'Liên hệ';
  const description = `Liên hệ với ${site.site_name} - Chúng tôi luôn sẵn sàng hỗ trợ bạn`;
  const image = seo.seo_og_image;
  const languages = parseHreflang(seo.seo_hreflang);

  return {
    alternates: {
      canonical: `${baseUrl}/contact`,
      ...(Object.keys(languages).length > 0 && { languages }),
    },
    description,
    openGraph: {
      title: `${title} | ${site.site_name}`,
      description,
      type: 'website',
      url: `${baseUrl}/contact`,
      images: image ? [{ url: image }] : undefined,
      siteName: site.site_name,
      locale: site.site_language === 'vi' ? 'vi_VN' : 'en_US',
    },
    title,
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ${site.site_name}`,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function ContactLayout({ children }: { children: React.ReactNode }) {
  const [site, contact] = await Promise.all([
    getSiteSettings(),
    getContactSettings(),
  ]);
  const baseUrl = (site.site_url || process.env.NEXT_PUBLIC_SITE_URL) ?? '';

  const contactPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: `Liên hệ ${site.site_name}`,
    url: `${baseUrl}/contact`,
    mainEntity: {
      '@type': 'Organization',
      name: site.site_name,
      url: baseUrl,
      ...(contact.contact_email && { email: contact.contact_email }),
      ...(contact.contact_phone && { telephone: contact.contact_phone }),
      ...(contact.contact_address && {
        address: {
          '@type': 'PostalAddress',
          streetAddress: contact.contact_address,
        },
      }),
    },
  };

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Trang chủ', url: baseUrl },
    { name: 'Liên hệ', url: `${baseUrl}/contact` },
  ]);

  return (
    <>
      <JsonLd data={contactPageSchema} />
      <JsonLd data={breadcrumbSchema} />
      {children}
    </>
  );
}
