import type { Metadata } from 'next';
import { getSiteSettings } from '@/lib/get-settings';

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteSettings();
  const baseUrl = (site.site_url || process.env.NEXT_PUBLIC_SITE_URL) ?? '';

  return {
    title: 'Thanh toán',
    description: `Hoàn tất đơn hàng tại ${site.site_name}`,
    robots: {
      index: false,
      follow: false,
    },
    alternates: {
      canonical: `${baseUrl}/checkout`,
    },
  };
}

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
