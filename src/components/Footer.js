import Link from 'next/link';
import { Twitter, Github, Linkedin, Rss } from 'lucide-react';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';

const COLUMNS = [
  {
    title: 'Product',
    links: [
      { label: 'Home', href: '/' },
      { label: 'Explore', href: '/#articles' },
      { label: 'About', href: '/about' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'RSS Feed', href: '/feed.xml' },
      { label: 'Sitemap', href: '/sitemap.xml' },
    ],
  },
  {
    title: 'Account',
    links: [
      { label: 'Sign in', href: '/login' },
      { label: 'Get started', href: '/register' },
      { label: 'Admin', href: '/admin' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy', href: '#' },
      { label: 'Terms', href: '#' },
    ],
  },
];

const SOCIALS = [
  { icon: Twitter, href: '#', label: 'X / Twitter' },
  { icon: Github, href: '#', label: 'GitHub' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
  { icon: Rss, href: '/feed.xml', label: 'RSS' },
];

export default function Footer() {
  const appName = process.env.NEXT_PUBLIC_APP_NAME || 'JuJu';

  return (
    <footer className="mt-24 border-t border-dark-500/60 bg-dark-300">
      <div className="container-app py-16">
        {/* Top: brand + link columns */}
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-dark-600">
              A modern publishing platform for long-form articles, tutorials and stories — read freely, comment and follow along.
            </p>
            <div className="mt-6 flex items-center gap-2">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-dark-500 bg-dark-400 text-dark-700 transition-colors hover:border-green-500/40 hover:text-green-500"
                >
                  <s.icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title} className="lg:col-span-2">
              <h4 className="text-sm font-semibold text-light-200">{col.title}</h4>
              <ul className="mt-4 space-y-3">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-sm text-dark-600 transition-colors hover:text-green-500">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Clean bottom row — copyright + theme toggle. */}
        <div className="mt-14 flex flex-col items-center justify-between gap-3 border-t border-dark-500/60 pt-8 sm:flex-row">
          <p className="text-xs text-dark-600">© {new Date().getFullYear()} {appName}. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-dark-600">Built with Next.js, Prisma &amp; Redux</span>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </footer>
  );
}
