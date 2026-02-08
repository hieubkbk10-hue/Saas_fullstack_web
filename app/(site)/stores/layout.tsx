import type { Metadata } from 'next';
import { JsonLd, generateBreadcrumbSchema } from '@/components/seo/JsonLd';
import { getSEOSettings, getSiteSettings } from '@/lib/get-settings';
import { parseHreflang } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  const [site, seo] = await Promise.all([
    getSiteSettings(),
    getSEOSettings(),
  ]);

  const baseUrl = (site.site_url || process.env.NEXT_PUBLIC_SITE_URL) ?? '';
  const title = 'Hệ thống cửa hàng';
  const description = `Danh sách cửa hàng ${site.site_name} - Tìm cửa hàng gần bạn nhất`;
  const image = seo.seo_og_image;
  const languages = parseHreflang(seo.seo_hreflang);

  return {
    alternates: {
      canonical: `${baseUrl}/stores`,
      ...(Object.keys(languages).length > 0 && { languages }),
    },
    description,
    openGraph: {
      title: `${title} | ${site.site_name}`,
      description,
      type: 'website',
      url: `${baseUrl}/stores`,
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

export default async function StoresLayout({ children }: { children: React.ReactNode }) {
  const site = await getSiteSettings();
  const baseUrl = (site.site_url || process.env.NEXT_PUBLIC_SITE_URL) ?? '';

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Trang chủ', url: baseUrl },
    { name: 'Hệ thống cửa hàng', url: `${baseUrl}/stores` },
  ]);

  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      {children}
    </>
  );
}
