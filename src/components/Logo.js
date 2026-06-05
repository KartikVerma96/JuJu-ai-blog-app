import Link from 'next/link';

export default function Logo({ href = '/' }) {
  return (
    <Link href={href} className="flex items-center gap-2">
      {/* Same mark as the favicon, so the brand is consistent everywhere. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/favicon.svg" alt="" width={36} height={36} className="h-9 w-9" />
      <span className="text-lg font-bold tracking-tight text-white">
        {process.env.NEXT_PUBLIC_APP_NAME || 'JuJu'}
      </span>
    </Link>
  );
}
