import { Metadata } from "next";
import { Header } from '@/components/site/Header';
import { Footer } from '@/components/site/Footer';
import { getSiteSettings, getSEOSettings } from '@/lib/getSettings';

export async function generateMetadata(): Promise<Metadata> {
  const [site, seo] = await Promise.all([
    getSiteSettings(),
    getSEOSettings(),
  ]);

  const title = seo.seo_title || site.site_name || "VietAdmin";
  const description = seo.seo_description || site.site_tagline || "";
  const keywords = seo.seo_keywords ? seo.seo_keywords.split(",").map(k => k.trim()) : [];

  return {
    title: {
      default: title,
      template: `%s | ${site.site_name || "VietAdmin"}`,
    },
    description,
    keywords,
    icons: { icon: '/api/favicon' },
    openGraph: {
      title,
      description,
      siteName: site.site_name || "VietAdmin",
      images: seo.seo_og_image ? [{ url: seo.seo_og_image }] : undefined,
      locale: site.site_language === "vi" ? "vi_VN" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: seo.seo_og_image ? [seo.seo_og_image] : undefined,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
