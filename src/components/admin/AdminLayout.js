import Head from 'next/head';
import { useDispatch } from 'react-redux';
import { Menu } from 'lucide-react';
import AdminSidebar from './AdminSidebar';
import { toggleSidebar } from '@/store/slices/uiSlice';
import { useRequireAuth } from '../useRequireAuth';
import { FullPageSpinner } from '../Spinner';
import Avatar from '../Avatar';
import ThemeToggle from '../ThemeToggle';

export default function AdminLayout({ children, title = 'Admin' }) {
  const dispatch = useDispatch();
  const { user, ready, allowed } = useRequireAuth({ role: 'ADMIN' });

  // While auth is resolving or a redirect is in flight, show a spinner so we
  // never flash protected content to the wrong user.
  if (!ready || !allowed) {
    return (
      <div className="min-h-screen bg-dark-200">
        <FullPageSpinner />
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{title} · Admin · JuJu</title>
        {/* The admin panel must never be indexed by search engines. */}
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <div className="min-h-screen bg-dark-200">
        <AdminSidebar />
        <div className="lg:pl-64">
          <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-dark-500 bg-dark-200/80 px-5 backdrop-blur lg:px-8">
            <button
              className="lg:hidden"
              onClick={() => dispatch(toggleSidebar())}
              aria-label="Toggle menu"
            >
              <Menu size={22} />
            </button>
            <h1 className="text-lg font-semibold text-white">{title}</h1>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium text-white">{user.name}</p>
                <p className="text-xs text-green-500">Administrator</p>
              </div>
              <Avatar name={user.name} src={user.avatar} size={36} />
            </div>
          </header>

          <div className="p-5 lg:p-8">{children}</div>
        </div>
      </div>
    </>
  );
}

export const withAdminLayout = (title) => (page) => (
  <AdminLayout title={title}>{page}</AdminLayout>
);
