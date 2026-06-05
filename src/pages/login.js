import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { Mail, Lock, LogIn } from 'lucide-react';
import Seo from '@/components/Seo';
import AuthShell from '@/components/AuthShell';
import Spinner from '@/components/Spinner';
import { useLoginMutation } from '@/store/services/api';
import { selectUser } from '@/store/slices/authSlice';

export default function LoginPage() {
  const router = useRouter();
  const user = useSelector(selectUser);
  const [login, { isLoading }] = useLoginMutation();
  const [form, setForm] = useState({ email: '', password: '' });

  const next = router.query.next;

  // If already signed in, bounce away from the login screen.
  useEffect(() => {
    if (user) router.replace(typeof next === 'string' ? next : '/');
  }, [user, next, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await login(form).unwrap();
      toast.success(`Welcome back, ${res.user.name.split(' ')[0]}!`);
      router.replace(res.user.role === 'ADMIN' ? '/admin' : typeof next === 'string' ? next : '/');
    } catch (err) {
      toast.error(err?.data?.message || 'Login failed');
    }
  };

  return (
    <>
      <Seo title="Sign in" path="/login" noindex />
      <h1 className="text-3xl font-bold text-white">Welcome back 👋</h1>
      <p className="mt-2 text-sm text-dark-600">Sign in to continue reading and join the conversation.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <label className="label">Email address</label>
          <div className="relative">
            <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-600" />
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
              className="input pl-10"
            />
          </div>
        </div>

        <div>
          <label className="label">Password</label>
          <div className="relative">
            <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-600" />
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
              className="input pl-10"
            />
          </div>
        </div>

        <button type="submit" disabled={isLoading} className="btn-primary w-full">
          {isLoading ? <Spinner size={18} className="text-dark-200" /> : <LogIn size={18} />}
          Sign in
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-dark-600">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="font-semibold text-green-500 hover:underline">Create one</Link>
      </p>
    </>
  );
}

LoginPage.getLayout = (page) => <AuthShell>{page}</AuthShell>;
