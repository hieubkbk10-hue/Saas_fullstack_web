import { Metadata } from 'next';
import { getConvexClient } from '@/lib/convex';
import { api } from '@/convex/_generated/api';
import { getSiteSettings, getSEOSettings } from '@/lib/getSettings';
import { JsonLd, generateServiceSchema, generateBreadcrumbSchema } from '@/components/seo/JsonLd';

interface Props {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const client = getConvexClient();
  
  const [service, site, seo] = await Promise.all([
    client.query(api.services.getBySlug, { slug }),
    getSiteSettings(),
    getSEOSettings(),
  ]);

  if (!service) {
    return {
      title: 'Không tìm thấy dịch vụ',
      description: 'Dịch vụ này không tồn tại hoặc đã bị xóa.',
    };
  }

  const baseUrl = site.site_url || process.env.NEXT_PUBLIC_SITE_URL || '';
  const title = service.metaTitle || service.title;
  const description = service.metaDescription || service.excerpt || seo.seo_description;
  const image = service.thumbnail || seo.seo_og_image;
  const keywords = seo.seo_keywords ? seo.seo_keywords.split(',').map(k => k.trim()) : [];

  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      type: 'website',
      url: `${baseUrl}/services/${service.slug}`,
      images: image ? [{ url: image, alt: title }] : undefined,
      siteName: site.site_name,
      locale: site.site_language === 'vi' ? 'vi_VN' : 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image ? [image] : undefined,
    },
    alternates: {
      canonical: `${baseUrl}/services/${service.slug}`,
    },
  };
}

export default async function ServiceLayout({ params, children }: Props) {
  const { slug } = await params;
  const client = getConvexClient();
  
  const [service, site, seo] = await Promise.all([
    client.query(api.services.getBySlug, { slug }),
    getSiteSettings(),
    getSEOSettings(),
  ]);

  if (!service) return children;

  const baseUrl = site.site_url || process.env.NEXT_PUBLIC_SITE_URL || '';
  const serviceUrl = `${baseUrl}/services/${service.slug}`;
  const image = service.thumbnail || seo.seo_og_image;

  const serviceSchema = generateServiceSchema({
    name: service.metaTitle || service.title,
    description: service.metaDescription || service.excerpt || seo.seo_description,
    url: serviceUrl,
    image,
    price: service.price,
    providerName: site.site_name,
    providerUrl: baseUrl,
  });

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Trang chủ', url: baseUrl },
    { name: 'Dịch vụ', url: `${baseUrl}/services` },
    { name: service.title, url: serviceUrl },
  ]);

  return (
    <>
      <JsonLd data={serviceSchema} />
      <JsonLd data={breadcrumbSchema} />
      {children}
    </>
  );
}
