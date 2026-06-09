import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useSelector, useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { Mail, Lock, User as UserIcon, UserPlus } from 'lucide-react';
import Seo from '@/components/Seo';
import AuthShell from '@/components/AuthShell';
import Spinner from '@/components/Spinner';
import { registerRequest } from '@/lib/authApi';
import { selectUser, setUser } from '@/store/slices/authSlice';

export default function RegisterPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  useEffect(() => {
    if (user) router.replace('/');
  }, [user, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setSubmitting(true);
    try {
      const data = await registerRequest(form);   // 1. create the account
      dispatch(setUser(data.user));                // 2. save the user in Redux
      toast.success(`Welcome to JuJu, ${data.user.name.split(' ')[0]}!`);
      router.replace('/');
    } catch (err) {
      toast.error(err?.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Seo title="Create account" path="/register" noindex />
      <h1 className="text-3xl font-bold text-white">Create your account</h1>
      <p className="mt-2 text-sm text-dark-600">Join the community to comment and follow your favourite writers.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <label className="label">Full name</label>
          <div className="relative">
            <UserIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-600" />
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ada Lovelace"
              className="input pl-10"
            />
          </div>
        </div>

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
              placeholder="At least 6 characters"
              className="input pl-10"
            />
          </div>
        </div>

        <button type="submit" disabled={submitting} className="btn-primary w-full">
          {submitting ? <Spinner size={18} className="text-dark-200" /> : <UserPlus size={18} />}
          Create account
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-dark-600">
        Already have an account?{' '}
        <Link href="/login" className="font-semibold text-green-500 hover:underline">Sign in</Link>
      </p>
    </>
  );
}

RegisterPage.getLayout = (page) => <AuthShell>{page}</AuthShell>;
