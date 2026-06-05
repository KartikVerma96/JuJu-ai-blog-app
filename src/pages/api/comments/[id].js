import prisma from '@/lib/prisma';
import { getTokenPayload } from '@/lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    res.setHeader('Allow', ['DELETE']);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const payload = getTokenPayload(req);
  if (!payload) return res.status(401).json({ message: 'Not authenticated' });

  const id = parseInt(req.query.id, 10);
  if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid id' });

  try {
    const comment = await prisma.comment.findUnique({ where: { id } });
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    // A comment may be removed by its author or by any admin.
    if (comment.authorId !== payload.id && payload.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await prisma.comment.delete({ where: { id } });
    return res.status(200).json({ message: 'Comment deleted' });
  } catch (err) {
    console.error('deleteComment error', err);
    return res.status(500).json({ message: 'Failed to delete comment' });
  }
}
