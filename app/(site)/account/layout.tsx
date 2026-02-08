import type { Metadata } from 'next';
import { getSiteSettings } from '@/lib/get-settings';

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteSettings();
  const baseUrl = (site.site_url || process.env.NEXT_PUBLIC_SITE_URL) ?? '';

  return {
    title: {
      default: 'Tài khoản',
      template: `%s | Tài khoản | ${site.site_name}`,
    },
    description: `Quản lý tài khoản của bạn tại ${site.site_name}`,
    robots: {
      index: false,
      follow: false,
    },
    alternates: {
      canonical: `${baseUrl}/account`,
    },
  };
}

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return children;
}
