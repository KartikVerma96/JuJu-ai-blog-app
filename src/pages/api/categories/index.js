import prisma from '@/lib/prisma';
import { getTokenPayload, slugify } from '@/lib/auth';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const categories = await prisma.category.findMany({
        orderBy: { name: 'asc' },
        include: { _count: { select: { posts: true } } },
      });
      return res.status(200).json({ categories });
    } catch (err) {
      console.error('listCategories error', err);
      return res.status(500).json({ message: 'Failed to load categories' });
    }
  }

  if (req.method === 'POST') {
    const payload = getTokenPayload(req);
    if (payload?.role !== 'ADMIN') return res.status(403).json({ message: 'Not authorized' });

    const { name } = req.body || {};
    if (!name) return res.status(400).json({ message: 'Name is required' });

    try {
      const slug = slugify(name);
      const existing = await prisma.category.findFirst({ where: { OR: [{ name }, { slug }] } });
      if (existing) return res.status(409).json({ message: 'Category already exists' });

      const category = await prisma.category.create({ data: { name, slug } });
      return res.status(201).json({ category });
    } catch (err) {
      console.error('createCategory error', err);
      return res.status(500).json({ message: 'Failed to create category' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ message: 'Method not allowed' });
}
