import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { ArrowLeft, Clock, Eye, MessageSquare, Send, Trash2 } from 'lucide-react';
import prisma from '@/lib/prisma';
import Seo from '@/components/Seo';
import { withPublicLayout } from '@/components/PublicLayout';
import Avatar from '@/components/Avatar';
import Spinner from '@/components/Spinner';
import { formatDate, readingTime, timeAgo } from '@/lib/format';
import { articleJsonLd, breadcrumbJsonLd } from '@/lib/seo';
import { selectUser } from '@/store/slices/authSlice';
import { useAddCommentMutation, useDeleteCommentMutation } from '@/store/services/api';

/**
 * NEXT.JS CONCEPT — getServerSideProps (SSR):
 * This runs ON THE SERVER for every request, BEFORE the page is sent. We fetch
 * the post straight from the database here, so the HTML Google receives already
 * contains the full article + meta tags. That is the #1 thing for SEO — the
 * crawler doesn't have to run JavaScript to see your content.
 */
export async function getServerSideProps({ params }) {
  const post = await prisma.post.findUnique({
    where: { slug: params.slug },
    include: {
      author: { select: { id: true, name: true, avatar: true, bio: true } },
      category: { select: { id: true, name: true, slug: true } },
      comments: {
        orderBy: { createdAt: 'desc' },
        include: { author: { select: { id: true, name: true, avatar: true } } },
      },
    },
  });

  // Unpublished or missing → return a real 404 (good for SEO: no thin pages).
  if (!post || post.status !== 'PUBLISHED') {
    return { notFound: true };
  }

  // Count the view server-side.
  await prisma.post.update({ where: { id: post.id }, data: { views: { increment: 1 } } });

  // Prisma returns Date objects; JSON can't carry them, so stringify → parse
  // turns them into ISO strings the page can render.
  return { props: { post: JSON.parse(JSON.stringify({ ...post, views: post.views + 1 })) } };
}

function PostPage({ post }) {
  const router = useRouter();
  const user = useSelector(selectUser);
  const [addComment, { isLoading: posting }] = useAddCommentMutation();
  const [deleteComment] = useDeleteCommentMutation();
  const [comment, setComment] = useState('');

  const cover = post.coverImage || `https://picsum.photos/seed/${post.slug}/1200/630`;

  // After a comment changes, re-run getServerSideProps to pull fresh comments.
  const refresh = () => router.replace(router.asPath, undefined, { scroll: false });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please sign in to comment');
      router.push(`/login?next=/posts/${post.slug}`);
      return;
    }
    if (!comment.trim()) return;
    try {
      await addComment({ postId: post.id, content: comment, slug: post.slug }).unwrap();
      setComment('');
      toast.success('Comment posted');
      refresh();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to post comment');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteComment({ id, slug: post.slug }).unwrap();
      toast.success('Comment deleted');
      refresh();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to delete comment');
    }
  };

  // Structured data: the article itself + a breadcrumb trail.
  const jsonLd = [
    articleJsonLd(post),
    breadcrumbJsonLd([
      { name: 'Home', path: '/' },
      ...(post.category ? [{ name: post.category.name, path: `/?category=${post.category.slug}` }] : []),
      { name: post.title, path: `/posts/${post.slug}` },
    ]),
  ];

  return (
    <>
      <Seo
        title={post.title}
        description={post.excerpt}
        path={`/posts/${post.slug}`}
        image={cover}
        type="article"
        publishedTime={post.createdAt}
        modifiedTime={post.updatedAt}
        authorName={post.author?.name}
        jsonLd={jsonLd}
      />

      <article className="container-app max-w-3xl py-10">
        <Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm text-dark-600 hover:text-green-500">
          <ArrowLeft size={16} /> Back to articles
        </Link>

        {post.category && (
          <Link href={`/?category=${post.category.slug}`} className="badge-green mb-4 w-fit">
            {post.category.name}
          </Link>
        )}

        <h1 className="text-3xl font-bold leading-tight text-white sm:text-5xl">{post.title}</h1>

        <div className="mt-6 flex flex-wrap items-center gap-4 border-b border-dark-500/60 pb-6">
          <div className="flex items-center gap-3">
            <Avatar name={post.author?.name} src={post.author?.avatar} size={44} />
            <div>
              <p className="font-semibold text-white">{post.author?.name}</p>
              <p className="text-xs text-dark-600">Author</p>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-4 text-sm text-dark-600">
            <span className="flex items-center gap-1.5">
              <Clock size={15} />
              <time dateTime={post.createdAt}>{formatDate(post.createdAt)}</time>
            </span>
            <span className="flex items-center gap-1.5">{readingTime(post.content)} min read</span>
            <span className="flex items-center gap-1.5"><Eye size={15} /> {post.views}</span>
          </div>
        </div>

        {/* next/image optimizes + lazy-loads; `priority` makes the cover the
            LCP element load fast (Core Web Vitals = a ranking signal). */}
        <div className="relative my-8 aspect-[16/9] w-full overflow-hidden rounded-2xl">
          <Image
            src={cover}
            alt={post.title}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover"
          />
        </div>

        <div className="prose-content" dangerouslySetInnerHTML={{ __html: renderContent(post.content) }} />

        {/* Comments */}
        <section className="mt-14 border-t border-dark-500/60 pt-10">
          <h2 className="flex items-center gap-2 text-xl font-bold text-white">
            <MessageSquare size={20} className="text-green-500" />
            Comments ({post.comments?.length || 0})
          </h2>

          <form onSubmit={handleSubmit} className="mt-6">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              placeholder={user ? 'Share your thoughts...' : 'Sign in to join the conversation'}
              className="input resize-none"
            />
            <div className="mt-3 flex justify-end">
              <button type="submit" disabled={posting} className="btn-primary">
                {posting ? <Spinner size={16} className="text-dark-200" /> : <Send size={16} />}
                Post comment
              </button>
            </div>
          </form>

          <div className="mt-8 space-y-5">
            {post.comments?.length === 0 && (
              <p className="text-sm text-dark-600">Be the first to comment.</p>
            )}
            {post.comments?.map((c) => (
              <div key={c.id} className="flex gap-3">
                <Avatar name={c.author?.name} src={c.author?.avatar} size={38} />
                <div className="flex-1 rounded-xl border border-dark-500 bg-dark-400 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">{c.author?.name}</span>
                      <span className="text-xs text-dark-600">{timeAgo(c.createdAt)}</span>
                    </div>
                    {(user?.id === c.author?.id || user?.role === 'ADMIN') && (
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="text-dark-600 hover:text-red-500"
                        aria-label="Delete comment"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                  <p className="mt-1.5 text-sm text-light-700">{c.content}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </article>
    </>
  );
}

// Minimal, safe renderer: supports double-newline paragraphs and basic
// markdown-ish headings. Content is admin-authored, so we keep it simple.
function renderContent(content = '') {
  const escape = (s) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  return content
    .split(/\n{2,}/)
    .map((block) => {
      const trimmed = block.trim();
      if (trimmed.startsWith('## ')) return `<h2>${escape(trimmed.slice(3))}</h2>`;
      if (trimmed.startsWith('### ')) return `<h3>${escape(trimmed.slice(4))}</h3>`;
      if (trimmed.startsWith('> ')) return `<blockquote>${escape(trimmed.slice(2))}</blockquote>`;
      return `<p>${escape(trimmed).replace(/\n/g, '<br/>')}</p>`;
    })
    .join('\n');
}

PostPage.getLayout = withPublicLayout;
export default PostPage;
