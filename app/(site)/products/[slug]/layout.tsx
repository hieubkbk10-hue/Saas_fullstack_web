import { Metadata } from 'next';
import { getConvexClient } from '@/lib/convex';
import { api } from '@/convex/_generated/api';
import { getSiteSettings, getSEOSettings } from '@/lib/getSettings';
import { JsonLd, generateProductSchema, generateBreadcrumbSchema } from '@/components/seo/JsonLd';

interface Props {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const client = getConvexClient();
  
  const [product, site, seo] = await Promise.all([
    client.query(api.products.getBySlug, { slug }),
    getSiteSettings(),
    getSEOSettings(),
  ]);

  if (!product) {
    return {
      title: 'Không tìm thấy sản phẩm',
      description: 'Sản phẩm này không tồn tại hoặc đã bị xóa.',
    };
  }

  const baseUrl = site.site_url || process.env.NEXT_PUBLIC_SITE_URL || '';
  const title = product.metaTitle || product.name;
  const description = product.metaDescription || (product.description ? product.description.replace(/<[^>]*>/g, '').slice(0, 160) : seo.seo_description);
  const image = product.image || (product.images && product.images[0]) || seo.seo_og_image;
  const keywords = seo.seo_keywords ? seo.seo_keywords.split(',').map(k => k.trim()) : [];
  
  // Format price for display
  const price = product.salePrice || product.price;
  const formattedPrice = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      type: 'website',
      url: `${baseUrl}/products/${product.slug}`,
      images: image ? [{ url: image, alt: title }] : undefined,
      siteName: site.site_name,
      locale: site.site_language === 'vi' ? 'vi_VN' : 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} - ${formattedPrice}`,
      description,
      images: image ? [image] : undefined,
    },
    alternates: {
      canonical: `${baseUrl}/products/${product.slug}`,
    },
  };
}

export default async function ProductLayout({ params, children }: Props) {
  const { slug } = await params;
  const client = getConvexClient();
  
  const [product, site, seo] = await Promise.all([
    client.query(api.products.getBySlug, { slug }),
    getSiteSettings(),
    getSEOSettings(),
  ]);

  if (!product) return children;

  const baseUrl = site.site_url || process.env.NEXT_PUBLIC_SITE_URL || '';
  const productUrl = `${baseUrl}/products/${product.slug}`;
  const image = product.image || (product.images && product.images[0]) || seo.seo_og_image;

  const productSchema = generateProductSchema({
    name: product.metaTitle || product.name,
    description: product.metaDescription || product.description?.replace(/<[^>]*>/g, '').slice(0, 160) || seo.seo_description,
    url: productUrl,
    image,
    price: product.price,
    salePrice: product.salePrice,
    sku: product.sku,
    inStock: product.stock > 0,
    brand: site.site_name,
  });

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Trang chủ', url: baseUrl },
    { name: 'Sản phẩm', url: `${baseUrl}/products` },
    { name: product.name, url: productUrl },
  ]);

  return (
    <>
      <JsonLd data={productSchema} />
      <JsonLd data={breadcrumbSchema} />
      {children}
    </>
  );
}
