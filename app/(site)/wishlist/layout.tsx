import type { Metadata } from 'next';
import { getSiteSettings } from '@/lib/get-settings';

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteSettings();
  const baseUrl = (site.site_url || process.env.NEXT_PUBLIC_SITE_URL) ?? '';

  return {
    title: 'Yêu thích',
    description: `Danh sách sản phẩm yêu thích của bạn tại ${site.site_name}`,
    robots: {
      index: false,
      follow: false,
    },
    alternates: {
      canonical: `${baseUrl}/wishlist`,
    },
  };
}

export default function WishlistLayout({ children }: { children: React.ReactNode }) {
  return children;
}
