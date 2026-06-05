import prisma from '@/lib/prisma';
import { siteConfig } from '@/lib/seo';

// An RSS 2.0 feed so readers and aggregators (Feedly, etc.) can subscribe —
// another channel for your content to reach people.

function escapeXml(s = '') {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function getServerSideProps({ res }) {
  const posts = await prisma.post.findMany({
    where: { status: 'PUBLISHED' },
    include: { author: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
    take: 30,
  });

  const items = posts
    .map((p) => {
      const url = `${siteConfig.url}/posts/${p.slug}`;
      return `    <item>
      <title>${escapeXml(p.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <dc:creator>${escapeXml(p.author?.name || siteConfig.name)}</dc:creator>
      <pubDate>${new Date(p.createdAt).toUTCString()}</pubDate>
      <description>${escapeXml(p.excerpt)}</description>
    </item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(siteConfig.name)} — ${escapeXml(siteConfig.tagline)}</title>
    <link>${siteConfig.url}</link>
    <description>${escapeXml(siteConfig.description)}</description>
    <language>en</language>
    <atom:link href="${siteConfig.url}/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  res.setHeader('Content-Type', 'application/rss+xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate');
  res.write(xml);
  res.end();

  return { props: {} };
}

export default function Feed() {
  return null;
}
