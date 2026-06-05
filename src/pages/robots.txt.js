import { siteConfig } from '@/lib/seo';

// robots.txt tells crawlers what they may visit and where the sitemap lives.
// Generated dynamically so the sitemap URL always matches the current domain.
export async function getServerSideProps({ res }) {
  const body = [
    'User-agent: *',
    'Allow: /',
    'Disallow: /admin',
    'Disallow: /api',
    '',
    `Sitemap: ${siteConfig.url}/sitemap.xml`,
  ].join('\n');

  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Cache-Control', 'public, s-maxage=86400');
  res.write(body);
  res.end();

  return { props: {} };
}

export default function Robots() {
  return null;
}
