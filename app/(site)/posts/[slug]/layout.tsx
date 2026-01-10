import { Metadata } from 'next';
import { getConvexClient } from '@/lib/convex';
import { api } from '@/convex/_generated/api';
import { getSiteSettings, getSEOSettings } from '@/lib/getSettings';
import { JsonLd, generateArticleSchema, generateBreadcrumbSchema } from '@/components/seo/JsonLd';

interface Props {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const client = getConvexClient();
  
  const [post, site, seo] = await Promise.all([
    client.query(api.posts.getBySlug, { slug }),
    getSiteSettings(),
    getSEOSettings(),
  ]);

  if (!post) {
    return {
      title: 'Không tìm thấy bài viết',
      description: 'Bài viết này không tồn tại hoặc đã bị xóa.',
    };
  }

  const baseUrl = site.site_url || process.env.NEXT_PUBLIC_SITE_URL || '';
  const title = post.metaTitle || post.title;
  const description = post.metaDescription || post.excerpt || seo.seo_description;
  const image = post.thumbnail || seo.seo_og_image;
  const keywords = seo.seo_keywords ? seo.seo_keywords.split(',').map(k => k.trim()) : [];

  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      type: 'article',
      url: `${baseUrl}/posts/${post.slug}`,
      images: image ? [{ url: image, alt: title }] : undefined,
      siteName: site.site_name,
      locale: site.site_language === 'vi' ? 'vi_VN' : 'en_US',
      publishedTime: post.publishedAt ? new Date(post.publishedAt).toISOString() : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image ? [image] : undefined,
    },
    alternates: {
      canonical: `${baseUrl}/posts/${post.slug}`,
    },
  };
}

export default async function PostLayout({ params, children }: Props) {
  const { slug } = await params;
  const client = getConvexClient();
  
  const [post, site, seo] = await Promise.all([
    client.query(api.posts.getBySlug, { slug }),
    getSiteSettings(),
    getSEOSettings(),
  ]);

  if (!post) return children;

  const baseUrl = site.site_url || process.env.NEXT_PUBLIC_SITE_URL || '';
  const postUrl = `${baseUrl}/posts/${post.slug}`;
  const image = post.thumbnail || seo.seo_og_image;

  const articleSchema = generateArticleSchema({
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt || seo.seo_description,
    url: postUrl,
    image,
    publishedAt: post.publishedAt,
    siteName: site.site_name,
  });

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Trang chủ', url: baseUrl },
    { name: 'Bài viết', url: `${baseUrl}/posts` },
    { name: post.title, url: postUrl },
  ]);

  return (
    <>
      <JsonLd data={articleSchema} />
      <JsonLd data={breadcrumbSchema} />
      {children}
    </>
  );
}
