import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { selectUser, selectAuthStatus } from '@/store/slices/authSlice';

/**
 * Client-side guard. Redirects to /login (or a custom path) once auth state
 * is known and the user is missing or lacks the required role.
 * Returns { user, ready, allowed }.
 */
export function useRequireAuth({ role = null, redirectTo = '/login' } = {}) {
  const user = useSelector(selectUser);
  const status = useSelector(selectAuthStatus);
  const router = useRouter();
  const ready = status === 'ready';

  const allowed = !!user && (!role || user.role === role);

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      router.replace(`${redirectTo}?next=${encodeURIComponent(router.asPath)}`);
    } else if (role && user.role !== role) {
      router.replace('/');
    }
  }, [ready, user, role, redirectTo, router]);

  return { user, ready, allowed };
}
