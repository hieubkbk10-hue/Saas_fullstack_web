import { Metadata } from "next";
import { Header } from '@/components/site/Header';
import { DynamicFooter } from '@/components/site/DynamicFooter';
import { getSiteSettings, getSEOSettings, getContactSettings } from '@/lib/getSettings';
import { JsonLd, generateOrganizationSchema, generateWebsiteSchema } from '@/components/seo/JsonLd';

export async function generateMetadata(): Promise<Metadata> {
  const [site, seo] = await Promise.all([
    getSiteSettings(),
    getSEOSettings(),
  ]);

  const baseUrl = site.site_url || process.env.NEXT_PUBLIC_SITE_URL || '';

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
    metadataBase: baseUrl ? new URL(baseUrl) : undefined,
    alternates: {
      canonical: baseUrl || undefined,
    },
  };
}

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [site, seo, contact] = await Promise.all([
    getSiteSettings(),
    getSEOSettings(),
    getContactSettings(),
  ]);

  const baseUrl = site.site_url || process.env.NEXT_PUBLIC_SITE_URL || '';

  const organizationSchema = generateOrganizationSchema({
    name: site.site_name,
    url: baseUrl,
    logo: site.site_logo,
    description: seo.seo_description,
    email: contact.contact_email,
    phone: contact.contact_phone,
    address: contact.contact_address,
  });

  const websiteSchema = generateWebsiteSchema({
    name: site.site_name,
    url: baseUrl,
    description: seo.seo_description,
  });

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      <JsonLd data={organizationSchema} />
      <JsonLd data={websiteSchema} />
      <Header />
      <main className="flex-1 overflow-x-hidden">
        {children}
      </main>
      <DynamicFooter />
    </div>
  );
}
