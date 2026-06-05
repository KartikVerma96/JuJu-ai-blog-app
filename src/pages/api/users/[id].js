import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

async function handler(req, res) {
  const id = parseInt(req.query.id, 10);
  if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid id' });

  if (req.method === 'PUT') {
    const { role } = req.body || {};
    if (!['USER', 'ADMIN'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    if (id === req.user.id) {
      return res.status(400).json({ message: 'You cannot change your own role' });
    }
    try {
      const user = await prisma.user.update({
        where: { id },
        data: { role },
        select: { id: true, name: true, email: true, role: true },
      });
      return res.status(200).json({ user });
    } catch (err) {
      console.error('updateUser error', err);
      return res.status(500).json({ message: 'Failed to update user' });
    }
  }

  if (req.method === 'DELETE') {
    if (id === req.user.id) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }
    try {
      await prisma.user.delete({ where: { id } });
      return res.status(200).json({ message: 'User deleted' });
    } catch (err) {
      console.error('deleteUser error', err);
      return res.status(500).json({ message: 'Failed to delete user' });
    }
  }

  res.setHeader('Allow', ['PUT', 'DELETE']);
  return res.status(405).json({ message: 'Method not allowed' });
}

export default requireAuth(handler, ['ADMIN']);
