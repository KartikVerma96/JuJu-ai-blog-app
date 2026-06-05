import prisma from '@/lib/prisma';
import { getTokenPayload } from '@/lib/auth';

export default async function handler(req, res) {
  const payload = getTokenPayload(req);
  if (payload?.role !== 'ADMIN') return res.status(403).json({ message: 'Not authorized' });

  const id = parseInt(req.query.id, 10);
  if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid id' });

  if (req.method === 'DELETE') {
    try {
      await prisma.category.delete({ where: { id } });
      return res.status(200).json({ message: 'Category deleted' });
    } catch (err) {
      console.error('deleteCategory error', err);
      return res.status(500).json({ message: 'Failed to delete category' });
    }
  }

  res.setHeader('Allow', ['DELETE']);
  return res.status(405).json({ message: 'Method not allowed' });
}
