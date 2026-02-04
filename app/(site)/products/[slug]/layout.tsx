import { getConvexClient } from '@/lib/convex';
import { api } from '@/convex/_generated/api';
import { getSEOSettings, getSiteSettings } from '@/lib/get-settings';
import { JsonLd, generateBreadcrumbSchema, generateProductSchema } from '@/components/seo/JsonLd';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const client = getConvexClient();
  try {
    const [product, site, seo] = await Promise.all([
      client.query(api.products.getBySlug, { slug }),
      getSiteSettings(),
      getSEOSettings(),
    ]);

    if (!product) {
      return {
        description: 'Sản phẩm này không tồn tại hoặc đã bị xóa.',
        title: 'Không tìm thấy sản phẩm',
      };
    }

    const baseUrl = (site.site_url || process.env.NEXT_PUBLIC_SITE_URL) ?? '';
    const title = product.metaTitle ?? product.name;
    const description = product.metaDescription ?? (product.description ? product.description.replaceAll(/<[^>]*>/g, '').slice(0, 160) : seo.seo_description);
    const image = (product.image ?? (product.images && product.images[0])) ?? seo.seo_og_image;
    const keywords = seo.seo_keywords ? seo.seo_keywords.split(',').map(k => k.trim()) : [];
    
    const price = product.salePrice ?? product.price;
    const formattedPrice = new Intl.NumberFormat('vi-VN', { currency: 'VND', style: 'currency' }).format(price);

    return {
      alternates: {
        canonical: `${baseUrl}/products/${product.slug}`,
      },
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
      title,
      twitter: {
        card: 'summary_large_image',
        title: `${title} - ${formattedPrice}`,
        description,
        images: image ? [image] : undefined,
      },
    };
  } catch {
    return {
      description: 'Thông tin sản phẩm đang được cập nhật.',
      title: 'Sản phẩm',
    };
  }
}

export default async function ProductLayout({ params, children }: Props) {
  const { slug } = await params;
  const client = getConvexClient();
  try {
    const [product, site, seo] = await Promise.all([
      client.query(api.products.getBySlug, { slug }),
      getSiteSettings(),
      getSEOSettings(),
    ]);

    if (!product) {return children;}

    const baseUrl = (site.site_url || process.env.NEXT_PUBLIC_SITE_URL) ?? '';
    const productUrl = `${baseUrl}/products/${product.slug}`;
    const image = (product.image ?? (product.images && product.images[0])) ?? seo.seo_og_image;

    const productSchema = generateProductSchema({
      brand: site.site_name,
      description: (product.metaDescription ?? product.description?.replace(/<[^>]*>/g, '').slice(0, 160)) ?? seo.seo_description,
      image,
      inStock: product.stock > 0,
      name: product.metaTitle ?? product.name,
      price: product.price,
      salePrice: product.salePrice,
      sku: product.sku,
      url: productUrl,
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
  } catch {
    return children;
  }
}
