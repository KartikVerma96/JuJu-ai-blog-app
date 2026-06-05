import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { serialize, parse } from 'cookie';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
export const AUTH_COOKIE = 'blog_token';

if (!JWT_SECRET) {
  // Surfaces a clear error during dev if env is missing.
  console.warn('[auth] JWT_SECRET is not set — check your .env file.');
}

export async function hashPassword(plain) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plain, salt);
}

export async function verifyPassword(plain, hashed) {
  return bcrypt.compare(plain, hashed);
}

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

// Build a Set-Cookie header value for the httpOnly auth cookie.
export function authCookie(token) {
  return serialize(AUTH_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export function clearAuthCookie() {
  return serialize(AUTH_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}

// Read + verify the auth token from an API request's cookies.
export function getTokenPayload(req) {
  const cookies = parse(req.headers.cookie || '');
  const token = cookies[AUTH_COOKIE];
  if (!token) return null;
  return verifyToken(token);
}

/**
 * Wrap an API handler to require a valid logged-in user.
 * Optionally restrict to specific roles, e.g. requireAuth(handler, ['ADMIN']).
 * The verified payload is attached as req.user.
 */
export function requireAuth(handler, roles = null) {
  return async (req, res) => {
    const payload = getTokenPayload(req);
    if (!payload) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    if (roles && !roles.includes(payload.role)) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    req.user = payload;
    return handler(req, res);
  };
}

export function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);
}
