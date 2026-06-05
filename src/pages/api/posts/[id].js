import prisma from '@/lib/prisma';
import { getTokenPayload, slugify } from '@/lib/auth';

export default async function handler(req, res) {
  const id = parseInt(req.query.id, 10);
  if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid id' });

  if (req.method === 'GET') return getPost(id, req, res);
  if (req.method === 'PUT') return updatePost(id, req, res);
  if (req.method === 'DELETE') return deletePost(id, req, res);
  res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
  return res.status(405).json({ message: 'Method not allowed' });
}

async function getPost(id, req, res) {
  const payload = getTokenPayload(req);
  if (payload?.role !== 'ADMIN') return res.status(403).json({ message: 'Not authorized' });
  try {
    const post = await prisma.post.findUnique({
      where: { id },
      include: { category: true, author: { select: { id: true, name: true } } },
    });
    if (!post) return res.status(404).json({ message: 'Post not found' });
    return res.status(200).json({ post });
  } catch (err) {
    console.error('getPost error', err);
    return res.status(500).json({ message: 'Failed to load post' });
  }
}

async function updatePost(id, req, res) {
  const payload = getTokenPayload(req);
  if (payload?.role !== 'ADMIN') return res.status(403).json({ message: 'Not authorized' });

  const { title, excerpt, content, coverImage, status, categoryId } = req.body || {};

  try {
    const existing = await prisma.post.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ message: 'Post not found' });

    const data = {};
    if (title !== undefined) {
      data.title = title;
      // Regenerate slug only if the title actually changed.
      if (title !== existing.title) {
        let base = slugify(title) || 'post';
        let slug = base;
        let n = 1;
        while (true) {
          const clash = await prisma.post.findUnique({ where: { slug } });
          if (!clash || clash.id === id) break;
          slug = `${base}-${n++}`;
        }
        data.slug = slug;
      }
    }
    if (excerpt !== undefined) data.excerpt = excerpt;
    if (content !== undefined) data.content = content;
    if (coverImage !== undefined) data.coverImage = coverImage || null;
    if (status !== undefined) data.status = status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT';
    if (categoryId !== undefined) {
      data.categoryId = categoryId ? parseInt(categoryId, 10) : null;
    }

    const post = await prisma.post.update({ where: { id }, data });
    return res.status(200).json({ post });
  } catch (err) {
    console.error('updatePost error', err);
    return res.status(500).json({ message: 'Failed to update post' });
  }
}

async function deletePost(id, req, res) {
  const payload = getTokenPayload(req);
  if (payload?.role !== 'ADMIN') return res.status(403).json({ message: 'Not authorized' });
  try {
    await prisma.post.delete({ where: { id } });
    return res.status(200).json({ message: 'Post deleted' });
  } catch (err) {
    console.error('deletePost error', err);
    return res.status(500).json({ message: 'Failed to delete post' });
  }
}
