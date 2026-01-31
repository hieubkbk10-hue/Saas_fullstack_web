import type { MetadataRoute } from 'next';
import { getConvexClient } from '@/lib/convex';
import { api } from '@/convex/_generated/api';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const client = getConvexClient();
  
  // Get site URL from settings
  const siteUrlSetting = await client.query(api.settings.getByKey, { key: 'site_url' });
  const baseUrl = ((siteUrlSetting?.value as string) || process.env.NEXT_PUBLIC_SITE_URL) ?? 'https://example.com';

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      changeFrequency: 'daily',
      lastModified: new Date(),
      priority: 1,
      url: baseUrl,
    },
    {
      changeFrequency: 'daily',
      lastModified: new Date(),
      priority: 0.8,
      url: `${baseUrl}/posts`,
    },
    {
      changeFrequency: 'daily',
      lastModified: new Date(),
      priority: 0.8,
      url: `${baseUrl}/products`,
    },
    {
      changeFrequency: 'weekly',
      lastModified: new Date(),
      priority: 0.8,
      url: `${baseUrl}/services`,
    },
  ];

  // Fetch all published content in parallel
  const [posts, products, services] = await Promise.all([
    client.query(api.posts.listPublished, { paginationOpts: { cursor: null, numItems: 1000 } }),
    client.query(api.products.searchPublished, { limit: 1000 }),
    client.query(api.services.searchPublished, { limit: 1000 }),
  ]);

  // Generate post URLs
  const postUrls: MetadataRoute.Sitemap = posts.page.map((post) => ({
    changeFrequency: 'weekly' as const,
    lastModified: post.publishedAt ? new Date(post.publishedAt) : new Date(),
    priority: 0.6,
    url: `${baseUrl}/posts/${post.slug}`,
  }));

  // Generate product URLs
  const productUrls: MetadataRoute.Sitemap = products.map((product) => ({
    changeFrequency: 'weekly' as const,
    lastModified: new Date(),
    priority: 0.7,
    url: `${baseUrl}/products/${product.slug}`,
  }));

  // Generate service URLs
  const serviceUrls: MetadataRoute.Sitemap = services.map((service) => ({
    changeFrequency: 'monthly' as const,
    lastModified: service.publishedAt ? new Date(service.publishedAt) : new Date(),
    priority: 0.7,
    url: `${baseUrl}/services/${service.slug}`,
  }));

  return [...staticPages, ...postUrls, ...productUrls, ...serviceUrls];
}
