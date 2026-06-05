import prisma from '@/lib/prisma';
import { getTokenPayload, slugify } from '@/lib/auth';

export default async function handler(req, res) {
  if (req.method === 'GET') return listPosts(req, res);
  if (req.method === 'POST') return createPost(req, res);
  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ message: 'Method not allowed' });
}

// GET /api/posts — SERVER-SIDE listing.
// All the heavy lifting (filtering, sorting, paginating) happens here in the
// database, NOT in the browser. The client only sends small query params and
// receives one page of rows back. This is what "server-side table" means.
async function listPosts(req, res) {
  // 1) Read query-string params the client put on the URL, e.g.
  //    /api/posts?page=2&limit=10&q=redux&sortBy=views&order=desc
  const {
    q,
    category,
    status,
    page = '1',
    limit = '9',
    all,
    sortBy = 'createdAt',
    order = 'desc',
  } = req.query;

  const payload = getTokenPayload(req);
  const isAdmin = payload?.role === 'ADMIN';

  // 2) PAGINATION maths. Prisma uses `take` (how many rows) and `skip`
  //    (how many to jump over). Page 1 skips 0, page 2 skips `limit`, etc.
  //    We clamp `limit` so a client can't ask for 1,000,000 rows at once.
  const take = Math.min(parseInt(limit, 10) || 9, 50);
  const skip = (Math.max(parseInt(page, 10) || 1, 1) - 1) * take;

  // 3) FILTERING. `where` becomes the SQL WHERE clause. We build it up
  //    conditionally based on which params were sent.
  const where = {};

  // Public callers only ever see published posts. Admin can request any status.
  if (isAdmin && all === 'true') {
    if (status) where.status = status;
  } else {
    where.status = 'PUBLISHED';
  }

  // Text search across title + excerpt (SQL: title LIKE %q% OR excerpt LIKE %q%)
  if (q) {
    where.OR = [
      { title: { contains: q } },
      { excerpt: { contains: q } },
    ];
  }
  if (category) {
    where.category = { slug: category };
  }

  // 4) SORTING. NEVER pass a raw client string straight into the query — a
  //    user could send sortBy=password. We whitelist the columns we allow,
  //    then fall back to a safe default. This prevents broken/abusive queries.
  const sortableFields = ['createdAt', 'title', 'views', 'status'];
  const orderByField = sortableFields.includes(sortBy) ? sortBy : 'createdAt';
  const orderDirection = order === 'asc' ? 'asc' : 'desc';
  const orderBy = { [orderByField]: orderDirection };

  try {
    // 5) Run TWO queries together with Promise.all (they don't depend on each
    //    other, so running them in parallel is faster than one after another):
    //    - findMany: the one page of rows the table will display
    //    - count: the TOTAL number of matching rows, so the UI can show
    //      "Page 2 of 7". The count respects the SAME `where` filter.
    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        include: {
          // `include` joins related tables (author, category) and counts comments.
          author: { select: { id: true, name: true, avatar: true } },
          category: { select: { id: true, name: true, slug: true } },
          _count: { select: { comments: true } },
        },
        orderBy,
        take,
        skip,
      }),
      prisma.post.count({ where }),
    ]);

    // 6) Send back the rows PLUS pagination metadata the table needs.
    return res.status(200).json({
      posts,
      pagination: {
        total, // total matching rows in the DB
        page: parseInt(page, 10), // current page number
        limit: take, // rows per page
        pages: Math.ceil(total / take), // how many pages in total
      },
    });
  } catch (err) {
    console.error('listPosts error', err);
    return res.status(500).json({ message: 'Failed to load posts' });
  }
}

async function createPost(req, res) {
  const payload = getTokenPayload(req);
  if (!payload) return res.status(401).json({ message: 'Not authenticated' });
  if (payload.role !== 'ADMIN') return res.status(403).json({ message: 'Not authorized' });

  const { title, excerpt, content, coverImage, status, categoryId } = req.body || {};
  if (!title || !excerpt || !content) {
    return res.status(400).json({ message: 'Title, excerpt and content are required' });
  }

  try {
    // Ensure a unique slug.
    let base = slugify(title);
    if (!base) base = 'post';
    let slug = base;
    let n = 1;
    while (await prisma.post.findUnique({ where: { slug } })) {
      slug = `${base}-${n++}`;
    }

    const post = await prisma.post.create({
      data: {
        title,
        slug,
        excerpt,
        content,
        coverImage: coverImage || null,
        status: status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT',
        authorId: payload.id,
        categoryId: categoryId ? parseInt(categoryId, 10) : null,
      },
    });

    return res.status(201).json({ post });
  } catch (err) {
    console.error('createPost error', err);
    return res.status(500).json({ message: 'Failed to create post' });
  }
}
