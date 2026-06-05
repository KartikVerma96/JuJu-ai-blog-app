import prisma from '@/lib/prisma';
import { getTokenPayload } from '@/lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const payload = getTokenPayload(req);
  if (!payload) return res.status(401).json({ message: 'You must be logged in to comment' });

  const { postId, content } = req.body || {};
  if (!postId || !content || !content.trim()) {
    return res.status(400).json({ message: 'Comment cannot be empty' });
  }

  try {
    const post = await prisma.post.findUnique({ where: { id: parseInt(postId, 10) } });
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        postId: post.id,
        authorId: payload.id,
      },
      include: { author: { select: { id: true, name: true, avatar: true } } },
    });

    return res.status(201).json({ comment });
  } catch (err) {
    console.error('createComment error', err);
    return res.status(500).json({ message: 'Failed to post comment' });
  }
}
