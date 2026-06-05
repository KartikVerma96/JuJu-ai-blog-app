import prisma from '@/lib/prisma';
import { siteConfig } from '@/lib/seo';

// A sitemap lists every public URL so search engines can discover and crawl
// them efficiently. This page renders XML (not HTML) directly to the response.
// It is generated on each request, so new posts appear automatically.

function escapeXml(s = '') {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export async function getServerSideProps({ res }) {
  const posts = await prisma.post.findMany({
    where: { status: 'PUBLISHED' },
    select: { slug: true, updatedAt: true },
    orderBy: { updatedAt: 'desc' },
  });

  const staticPages = [
    { path: '/', priority: '1.0', changefreq: 'daily' },
    { path: '/about', priority: '0.5', changefreq: 'monthly' },
  ];

  const urls = [
    ...staticPages.map(
      (p) => `<url><loc>${siteConfig.url}${p.path}</loc><changefreq>${p.changefreq}</changefreq><priority>${p.priority}</priority></url>`
    ),
    ...posts.map(
      (p) =>
        `<url><loc>${siteConfig.url}/posts/${escapeXml(p.slug)}</loc><lastmod>${new Date(p.updatedAt).toISOString()}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>`
    ),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>`;

  res.setHeader('Content-Type', 'application/xml');
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate');
  res.write(xml);
  res.end();

  return { props: {} };
}

export default function SiteMap() {
  return null;
}
