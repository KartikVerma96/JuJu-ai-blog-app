import prisma from '@/lib/prisma';
import { getTokenPayload } from '@/lib/auth';

export default async function handler(req, res) {
  const payload = getTokenPayload(req);
  if (!payload) {
    return res.status(200).json({ user: null });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { id: true, name: true, email: true, role: true, avatar: true, bio: true },
    });
    return res.status(200).json({ user: user || null });
  } catch (err) {
    console.error('me error', err);
    return res.status(200).json({ user: null });
  }
}
