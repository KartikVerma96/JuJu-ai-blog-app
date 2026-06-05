import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

// GET /api/users — SERVER-SIDE, admin-only list of users.
// Same pattern as posts: the database filters, sorts and paginates; the
// browser just asks for one page.
async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { q, role, page = '1', limit = '10', sortBy = 'createdAt', order = 'desc' } = req.query;

  // Pagination maths (see posts route for the full explanation).
  const take = Math.min(parseInt(limit, 10) || 10, 50);
  const skip = (Math.max(parseInt(page, 10) || 1, 1) - 1) * take;

  // Build the WHERE filter conditionally.
  const where = {};
  if (q) {
    // Search by name OR email.
    where.OR = [{ name: { contains: q } }, { email: { contains: q } }];
  }
  if (role === 'ADMIN' || role === 'USER') {
    where.role = role;
  }

  // Whitelist sortable columns to keep the query safe.
  const sortableFields = ['createdAt', 'name', 'email', 'role'];
  const orderByField = sortableFields.includes(sortBy) ? sortBy : 'createdAt';
  const orderBy = { [orderByField]: order === 'asc' ? 'asc' : 'desc' };

  try {
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy,
        take,
        skip,
        // `select` returns ONLY these fields — note we never send `password`.
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          avatar: true,
          createdAt: true,
          _count: { select: { posts: true, comments: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return res.status(200).json({
      users,
      pagination: {
        total,
        page: parseInt(page, 10),
        limit: take,
        pages: Math.ceil(total / take),
      },
    });
  } catch (err) {
    console.error('listUsers error', err);
    return res.status(500).json({ message: 'Failed to load users' });
  }
}

// requireAuth wraps the handler so it ONLY runs for logged-in admins.
// The role check happens on the SERVER, so it can't be bypassed from the browser.
export default requireAuth(handler, ['ADMIN']);
