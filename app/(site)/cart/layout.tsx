import type { Metadata } from 'next';
import { getSiteSettings } from '@/lib/get-settings';

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteSettings();
  const baseUrl = (site.site_url || process.env.NEXT_PUBLIC_SITE_URL) ?? '';

  return {
    title: 'Giỏ hàng',
    description: `Giỏ hàng của bạn tại ${site.site_name}`,
    robots: {
      index: false,
      follow: false,
    },
    alternates: {
      canonical: `${baseUrl}/cart`,
    },
  };
}

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return children;
}
