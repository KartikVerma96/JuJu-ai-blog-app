import Link from 'next/link';
import Image from 'next/image';
import { MessageSquare, Eye, Clock } from 'lucide-react';
import Avatar from './Avatar';
import { formatDate } from '@/lib/format';

export default function PostCard({ post, featured = false }) {
  const cover =
    post.coverImage ||
    `https://picsum.photos/seed/${post.slug}/800/500`;

  return (
    <Link
      href={`/posts/${post.slug}`}
      className={`card card-hover group flex flex-col overflow-hidden ${
        featured ? 'md:col-span-2 md:flex-row' : ''
      }`}
    >
      <div className={`relative overflow-hidden ${featured ? 'h-56 md:h-auto md:w-1/2' : 'h-48'}`}>
        {/* next/image serves resized, lazy-loaded images for faster pages. */}
        <Image
          src={cover}
          alt={post.title}
          fill
          sizes={featured ? '(max-width: 768px) 100vw, 50vw' : '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'}
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-400/80 via-transparent to-transparent" />
        {post.category && (
          <span className="badge-green absolute left-3 top-3 border border-green-500/20 backdrop-blur">
            {post.category.name}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className={`font-bold text-white transition-colors group-hover:text-green-500 ${featured ? 'text-2xl' : 'text-lg'}`}>
          {post.title}
        </h3>
        <p className="mt-2 line-clamp-2 flex-1 text-sm text-dark-700">{post.excerpt}</p>

        <div className="mt-4 flex items-center justify-between border-t border-dark-500/60 pt-4">
          <div className="flex items-center gap-2">
            <Avatar name={post.author?.name} src={post.author?.avatar} size={28} />
            <span className="text-xs font-medium text-light-700">{post.author?.name}</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-dark-600">
            <span className="flex items-center gap-1"><Clock size={13} /> {formatDate(post.createdAt)}</span>
            <span className="flex items-center gap-1"><Eye size={13} /> {post.views ?? 0}</span>
            <span className="flex items-center gap-1"><MessageSquare size={13} /> {post._count?.comments ?? 0}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
