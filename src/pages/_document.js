import { Html, Head, Main, NextScript } from 'next/document';

// This runs BEFORE React hydrates. It reads the saved theme from localStorage
// and adds/removes the `dark` class on <html> synchronously, so the page never
// "flashes" the wrong theme on first paint. Default is dark.
const noFlashScript = `
(function () {
  try {
    var t = localStorage.getItem('theme');
    if (t === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  } catch (e) {
    document.documentElement.classList.add('dark');
  }
})();
`;

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Per-page <title>/description come from the <Seo> component. */}
        {/* Favicons & app icons — SVG for modern browsers, .ico fallback,
            Apple touch icon for iOS, and a manifest for installable PWA. */}
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#24AE7C" />
        {/* RSS feed for readers & aggregators */}
        <link rel="alternate" type="application/rss+xml" title="JuJu — Latest articles" href="/feed.xml" />
        <script dangerouslySetInnerHTML={{ __html: noFlashScript }} />
      </Head>
      <body className="bg-dark-200 text-light-200">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
