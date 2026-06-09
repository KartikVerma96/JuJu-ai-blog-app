import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSelector, useDispatch } from 'react-redux';
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  Users,
  Tag,
  Globe,
  LogOut,
  X,
} from 'lucide-react';
import Logo from '../Logo';
import { selectSidebarOpen, setSidebar } from '@/store/slices/uiSlice';
import { clearUser } from '@/store/slices/authSlice';
import { logoutRequest } from '@/lib/authApi';

const links = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/posts', label: 'Posts', icon: FileText },
  { href: '/admin/posts/new', label: 'New Post', icon: PlusCircle },
  { href: '/admin/categories', label: 'Categories', icon: Tag },
  { href: '/admin/users', label: 'Users', icon: Users },
];

export default function AdminSidebar() {
  const router = useRouter();
  const dispatch = useDispatch();
  const open = useSelector(selectSidebarOpen);

  const handleLogout = async () => {
    await logoutRequest();   // clear the login cookie on the server
    dispatch(clearUser());   // forget the user in Redux
    router.push('/');
  };

  // Decide which single nav item is "active".
  //
  // The naive `pathname.startsWith(href)` is buggy: on /admin/posts/new, the
  // href "/admin/posts" is a PREFIX of the URL, so BOTH "Posts" and "New Post"
  // would match. Fix: find every link that matches, then keep only the MOST
  // SPECIFIC one (the longest href). That way the deepest route wins and a
  // parent never lights up alongside its child.
  const activeHref = links
    .filter((link) =>
      link.exact
        ? router.pathname === link.href
        : router.pathname === link.href || router.pathname.startsWith(link.href + '/')
    )
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;

  const isActive = (link) => link.href === activeHref;

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          onClick={() => dispatch(setSidebar(false))}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-dark-500 bg-dark-300 transition-transform lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-dark-500 px-5">
          <Logo href="/admin" />
          <button className="lg:hidden" onClick={() => dispatch(setSidebar(false))}>
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {links.map((link) => {
            const Icon = link.icon;
            const active = isActive(link);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => dispatch(setSidebar(false))}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-green-500 text-dark-200'
                    : 'text-dark-700 hover:bg-dark-400 hover:text-light-200'
                }`}
              >
                <Icon size={18} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="space-y-1 border-t border-dark-500 p-4">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-dark-700 hover:bg-dark-400 hover:text-light-200"
          >
            <Globe size={18} /> View site
          </Link>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-500 hover:bg-dark-400"
          >
            <LogOut size={18} /> Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
