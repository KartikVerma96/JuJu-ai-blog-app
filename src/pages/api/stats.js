import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const [totalPosts, published, drafts, users, comments, views, recentPosts] = await Promise.all([
      prisma.post.count(),
      prisma.post.count({ where: { status: 'PUBLISHED' } }),
      prisma.post.count({ where: { status: 'DRAFT' } }),
      prisma.user.count(),
      prisma.comment.count(),
      prisma.post.aggregate({ _sum: { views: true } }),
      prisma.post.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          author: { select: { name: true } },
          category: { select: { name: true } },
          _count: { select: { comments: true } },
        },
      }),
    ]);

    return res.status(200).json({
      stats: {
        totalPosts,
        published,
        drafts,
        users,
        comments,
        views: views._sum.views || 0,
      },
      recentPosts,
    });
  } catch (err) {
    console.error('stats error', err);
    return res.status(500).json({ message: 'Failed to load stats' });
  }
}

export default requireAuth(handler, ['ADMIN']);
