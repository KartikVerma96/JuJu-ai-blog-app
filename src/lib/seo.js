// Central SEO configuration + helpers.
// Everything that needs the site name, URL or default description reads from
// here, so there is a single source of truth.

export const siteConfig = {
  name: process.env.NEXT_PUBLIC_APP_NAME || 'JuJu',
  tagline: 'Stories, ideas & deep dives',
  url: (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, ''),
  description:
    'JuJu is a modern publishing platform for long-form articles, tutorials and stories from a community of writers. Read freely, comment and follow along.',
  defaultOgImage: '/og-default.svg',
  twitter: '@juju',
  locale: 'en_US',
};

// Turn a path ("/posts/x") into an absolute URL ("https://site.com/posts/x").
// Search engines need ABSOLUTE urls in canonical/Open Graph tags.
export function absoluteUrl(path = '') {
  if (!path) return siteConfig.url;
  if (path.startsWith('http')) return path;
  return `${siteConfig.url}${path.startsWith('/') ? '' : '/'}${path}`;
}

// ---------------------------------------------------------------------------
// JSON-LD structured data builders.
// JSON-LD is a small block of JSON that describes the page to Google. It is
// what powers "rich results" (the article cards, author, dates, search box).
// ---------------------------------------------------------------------------

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteConfig.name,
    url: siteConfig.url,
    logo: absoluteUrl('/favicon.svg'),
  };
}

// Describes the whole site + enables the Google "sitelinks search box".
export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteConfig.url}/?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

// Describes a single blog post as a BlogPosting (rich article result).
export function articleJsonLd(post) {
  const url = absoluteUrl(`/posts/${post.slug}`);
  const image = post.coverImage
    ? absoluteUrl(post.coverImage)
    : `https://picsum.photos/seed/${post.slug}/1200/630`;
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    headline: post.title,
    description: post.excerpt,
    image,
    url,
    datePublished: post.createdAt,
    dateModified: post.updatedAt || post.createdAt,
    author: {
      '@type': 'Person',
      name: post.author?.name || siteConfig.name,
    },
    publisher: organizationJsonLd(),
    ...(post.category && { articleSection: post.category.name }),
  };
}

// Breadcrumb trail (Home › Category › Post) shown under the Google result.
export function breadcrumbJsonLd(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
