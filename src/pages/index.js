import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Search, Sparkles, TrendingUp } from 'lucide-react';
import prisma from '@/lib/prisma';
import Seo from '@/components/Seo';
import { withPublicLayout } from '@/components/PublicLayout';
import PostCard from '@/components/PostCard';
import Spinner from '@/components/Spinner';
import Pagination from '@/components/Pagination';
import { websiteJsonLd, organizationJsonLd } from '@/lib/seo';
import { useGetPostsQuery, useGetCategoriesQuery } from '@/store/services/api';

const PAGE_SIZE = 9;

/**
 * SSR: fetch the first page of published posts (respecting any ?category / ?q
 * in the URL) straight from the database, so the HTML sent to crawlers already
 * contains real article titles, links and summaries. Search/category URLs are
 * rendered server-side too, so each is independently indexable.
 */
export async function getServerSideProps({ query }) {
  const q = query.q ? String(query.q) : '';
  const category = query.category ? String(query.category) : '';

  const where = { status: 'PUBLISHED' };
  if (q) where.OR = [{ title: { contains: q } }, { excerpt: { contains: q } }];
  if (category) where.category = { slug: category };

  const [posts, total, categories] = await Promise.all([
    prisma.post.findMany({
      where,
      include: {
        author: { select: { id: true, name: true, avatar: true } },
        category: { select: { id: true, name: true, slug: true } },
        _count: { select: { comments: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: PAGE_SIZE,
    }),
    prisma.post.count({ where }),
    prisma.category.findMany({ orderBy: { name: 'asc' }, include: { _count: { select: { posts: true } } } }),
  ]);

  return {
    props: {
      initialPosts: JSON.parse(JSON.stringify(posts)),
      initialPagination: { total, page: 1, limit: PAGE_SIZE, pages: Math.ceil(total / PAGE_SIZE) },
      initialCategories: JSON.parse(JSON.stringify(categories)),
      initialQ: q,
      initialCategory: category,
    },
  };
}

function HomePage({ initialPosts, initialPagination, initialCategories, initialQ, initialCategory }) {
  const router = useRouter();
  const [search, setSearch] = useState(initialQ);
  const [debounced, setDebounced] = useState(initialQ);
  const [category, setCategoryState] = useState(initialCategory);
  const [page, setPage] = useState(1);

  // Debounce typing so we don't query on every keystroke.
  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debounced, category]);

  // While the visible filters still match what the server rendered, we keep
  // showing the SSR data (no flash, no extra request). As soon as the user
  // searches / changes category / pages, we switch to live client data.
  const matchesInitial = page === 1 && debounced === initialQ && category === initialCategory;

  const { data, isFetching } = useGetPostsQuery(
    { q: debounced || undefined, category: category || undefined, page, limit: PAGE_SIZE },
    { skip: matchesInitial }
  );
  const { data: catData } = useGetCategoriesQuery();

  const posts = matchesInitial ? initialPosts : data?.posts || [];
  const pagination = matchesInitial ? initialPagination : data?.pagination;
  const categories = catData?.categories || initialCategories;
  const loading = !matchesInitial && isFetching;

  const setCategory = (slug) => {
    setCategoryState(slug);
    const nextQuery = { ...router.query };
    if (slug) nextQuery.category = slug;
    else delete nextQuery.category;
    router.push({ pathname: '/', query: nextQuery }, undefined, { shallow: true });
  };

  const activeCategory = categories.find((c) => c.slug === category);

  return (
    <>
      <Seo
        title={activeCategory ? `${activeCategory.name} articles` : undefined}
        path={category ? `/?category=${category}` : '/'}
        jsonLd={[websiteJsonLd(), organizationJsonLd()]}
      />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-dark-500/60 bg-hero-glow">
        <div className="dotted-bg absolute inset-0 opacity-70" />
        <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-green-500/10 blur-3xl" />

        <div className="container-app relative py-20 text-center sm:py-28">
          <span className="badge-green mx-auto mb-6 w-fit animate-fade-up">
            <Sparkles size={14} /> Fresh writing, every week
          </span>
          <h1 className="text-48-bold mx-auto max-w-3xl text-white animate-fade-up" style={{ animationDelay: '0.05s' }}>
            Where <span className="text-green-500 text-glow">great ideas</span> find their words.
          </h1>
          <p className="text-14-regular mx-auto mt-5 max-w-xl text-dark-700 sm:text-base animate-fade-up" style={{ animationDelay: '0.1s' }}>
            Long-form articles, tutorials and stories from a community of writers.
            Read freely — join in to comment and follow along.
          </p>

          <div className="mx-auto mt-9 flex max-w-lg items-center gap-2 rounded-xl border border-dark-500 bg-dark-400/80 px-4 py-1.5 shadow-card backdrop-blur transition-colors focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-500/20 animate-fade-up" style={{ animationDelay: '0.15s' }}>
            <Search size={18} className="text-dark-600" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search articles..."
              aria-label="Search articles"
              className="w-full bg-transparent py-2.5 text-sm outline-none placeholder:text-dark-600"
            />
          </div>
        </div>
      </section>

      <section id="articles" className="container-app scroll-mt-24 py-12">
        <div className="mb-8 flex flex-wrap items-center gap-2">
          <button
            onClick={() => setCategory('')}
            className={`badge ${!category ? 'bg-green-500 text-dark-200' : 'bg-dark-400 text-dark-700 hover:text-light-200'}`}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategory(c.slug)}
              className={`badge ${category === c.slug ? 'bg-green-500 text-dark-200' : 'bg-dark-400 text-dark-700 hover:text-light-200'}`}
            >
              {c.name}
            </button>
          ))}
        </div>

        <div className="mb-6 flex items-center gap-2 text-sm text-dark-600">
          <TrendingUp size={16} className="text-green-500" />
          {debounced ? <span>Results for “{debounced}”</span> : <span>Latest articles</span>}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Spinner size={32} />
          </div>
        ) : posts.length === 0 ? (
          <div className="card flex flex-col items-center justify-center py-20 text-center">
            <p className="text-lg font-semibold text-white">No articles found</p>
            <p className="mt-1 text-sm text-dark-600">Try a different search or category.</p>
          </div>
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {posts.map((post, i) => (
                <PostCard
                  key={post.id}
                  post={post}
                  featured={i === 0 && page === 1 && !debounced && !category}
                />
              ))}
            </div>
            {pagination && pagination.pages > 1 && (
              <Pagination
                page={pagination.page}
                pages={pagination.pages}
                onChange={(p) => {
                  setPage(p);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            )}
          </>
        )}
      </section>
    </>
  );
}

HomePage.getLayout = withPublicLayout;
export default HomePage;
