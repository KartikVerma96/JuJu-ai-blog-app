import prisma from '@/lib/prisma';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { slug } = req.query;

  try {
    const post = await prisma.post.findUnique({
      where: { slug },
      include: {
        author: { select: { id: true, name: true, avatar: true, bio: true } },
        category: { select: { id: true, name: true, slug: true } },
        comments: {
          orderBy: { createdAt: 'desc' },
          include: { author: { select: { id: true, name: true, avatar: true } } },
        },
      },
    });

    if (!post || post.status !== 'PUBLISHED') {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Fire-and-forget view increment.
    prisma.post.update({ where: { id: post.id }, data: { views: { increment: 1 } } }).catch(() => {});

    return res.status(200).json({ post });
  } catch (err) {
    console.error('getPostBySlug error', err);
    return res.status(500).json({ message: 'Failed to load post' });
  }
}
