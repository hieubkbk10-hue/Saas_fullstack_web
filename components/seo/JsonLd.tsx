interface JsonLdProps {
  data: Record<string, unknown>;
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// Schema generators
export function generateOrganizationSchema(params: {
  name: string;
  url: string;
  logo?: string;
  description?: string;
  email?: string;
  phone?: string;
  address?: string;
}) {
  return {
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
  };
}

export function generateArticleSchema(params: {
  title: string;
  description?: string;
  url: string;
  image?: string;
  publishedAt?: number;
  authorName?: string;
  siteName: string;
}) {
  return {
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
  };
}

export function generateProductSchema(params: {
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
}) {
  return {
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
      price: params.salePrice || params.price,
      priceCurrency: params.currency || 'VND',
      availability: params.inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      url: params.url,
    },
  };
}

export function generateServiceSchema(params: {
  name: string;
  description?: string;
  url: string;
  image?: string;
  price?: number;
  currency?: string;
  providerName: string;
  providerUrl?: string;
}) {
  return {
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
        priceCurrency: params.currency || 'VND',
      },
    }),
  };
}

export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function generateWebsiteSchema(params: {
  name: string;
  url: string;
  description?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: params.name,
    url: params.url,
    ...(params.description && { description: params.description }),
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${params.url}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}
