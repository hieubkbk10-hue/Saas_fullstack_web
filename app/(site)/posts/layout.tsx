import type { Metadata } from 'next';
import { getSEOSettings, getSiteSettings } from '@/lib/get-settings';

export async function generateMetadata(): Promise<Metadata> {
  const [site, seo] = await Promise.all([
    getSiteSettings(),
    getSEOSettings(),
  ]);

  const baseUrl = (site.site_url || process.env.NEXT_PUBLIC_SITE_URL) ?? '';
  const title = 'Bài viết';
  const description = seo.seo_description || `Danh sách bài viết từ ${site.site_name}`;
  const keywords = seo.seo_keywords ? seo.seo_keywords.split(',').map(k => k.trim()) : [];
  const image = seo.seo_og_image;

  return {
    alternates: {
      canonical: `${baseUrl}/posts`,
    },
    description,
    keywords,
    openGraph: {
      title: `${title} | ${site.site_name}`,
      description,
      type: 'website',
      url: `${baseUrl}/posts`,
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

export default function PostsListLayout({ children }: { children: React.ReactNode }) {
  return children;
}
