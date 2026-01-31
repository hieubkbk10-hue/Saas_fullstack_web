interface JsonLdProps {
  data: Record<string, unknown>;
}

export const JsonLd = ({ data }: JsonLdProps): React.ReactElement => (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );

// Schema generators
export const generateOrganizationSchema = (params: {
  name: string;
  url: string;
  logo?: string;
  description?: string;
  email?: string;
  phone?: string;
  address?: string;
}): Record<string, unknown> => ({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: params.name,
    url: params.url,
    ...(params.logo && { logo: params.logo }),
    ...(params.description && { description: params.description }),
    ...(params.email && { email: params.email }),
    ...(params.phone && { telephone: params.phone }),
    ...(params.address && {
      address: {
        '@type': 'PostalAddress',
        streetAddress: params.address,
      },
    }),
})

export const generateArticleSchema = (params: {
  title: string;
  description?: string;
  url: string;
  image?: string;
  publishedAt?: number;
  authorName?: string;
  siteName: string;
}): Record<string, unknown> => ({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: params.title,
    ...(params.description && { description: params.description }),
    url: params.url,
    ...(params.image && { image: params.image }),
    ...(params.publishedAt && { datePublished: new Date(params.publishedAt).toISOString() }),
    ...(params.authorName && {
      author: {
        '@type': 'Person',
        name: params.authorName,
      },
    }),
    publisher: {
      '@type': 'Organization',
      name: params.siteName,
    },
})

export const generateProductSchema = (params: {
  name: string;
  description?: string;
  url: string;
  image?: string;
  price: number;
  salePrice?: number;
  currency?: string;
  sku: string;
  inStock: boolean;
  brand?: string;
}): Record<string, unknown> => ({
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: params.name,
    ...(params.description && { description: params.description }),
    url: params.url,
    ...(params.image && { image: params.image }),
    sku: params.sku,
    ...(params.brand && {
      brand: {
        '@type': 'Brand',
        name: params.brand,
      },
    }),
    offers: {
      '@type': 'Offer',
      availability: params.inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      price: params.salePrice ?? params.price,
      priceCurrency: params.currency ?? 'VND',
      url: params.url,
    },
})

export const generateServiceSchema = (params: {
  name: string;
  description?: string;
  url: string;
  image?: string;
  price?: number;
  currency?: string;
  providerName: string;
  providerUrl?: string;
}): Record<string, unknown> => ({
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: params.name,
    ...(params.description && { description: params.description }),
    url: params.url,
    ...(params.image && { image: params.image }),
    provider: {
      '@type': 'Organization',
      name: params.providerName,
      ...(params.providerUrl && { url: params.providerUrl }),
    },
    ...(params.price && {
      offers: {
        '@type': 'Offer',
        price: params.price,
        priceCurrency: params.currency ?? 'VND',
      },
    }),
})

export const generateBreadcrumbSchema = (items: { name: string; url: string }[]): Record<string, unknown> => ({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      item: item.url,
      name: item.name,
      position: index + 1,
    })),
})

export const generateWebsiteSchema = (params: {
  name: string;
  url: string;
  description?: string;
}): Record<string, unknown> => ({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: params.name,
    url: params.url,
    ...(params.description && { description: params.description }),
    potentialAction: {
      '@type': 'SearchAction',
      'query-input': 'required name=search_term_string',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${params.url}/search?q={search_term_string}`,
      },
    },
})
