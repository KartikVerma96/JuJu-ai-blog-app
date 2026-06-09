import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSelector, useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { LayoutDashboard, LogOut, ChevronDown, Menu, X } from 'lucide-react';
import Logo from './Logo';
import Avatar from './Avatar';
import ThemeToggle from './ThemeToggle';
import { selectUser, selectAuthStatus, clearUser } from '@/store/slices/authSlice';
import { logoutRequest } from '@/lib/authApi';

const NAV_LINKS = [
  { href: '/', label: 'Home', match: (r) => r.pathname === '/' },
  { href: '/#articles', label: 'Explore', match: () => false },
  { href: '/about', label: 'About', match: (r) => r.pathname === '/about' },
];

// Raycast-style: a floating, centered, pill-shaped navbar with a glassy
// blurred background that sits a little below the top of the screen.
export default function Navbar() {
  const user = useSelector(selectUser);
  const status = useSelector(selectAuthStatus);
  const dispatch = useDispatch();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logoutRequest();   // tell the server to clear the login cookie
    dispatch(clearUser());   // forget the user in Redux
    toast.success('Signed out');
    setMenuOpen(false);
    setMobileOpen(false);
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="flex justify-center px-4 pt-4">
        <nav className="relative flex w-full max-w-4xl items-center justify-between gap-2 rounded-full border border-dark-500/80 bg-dark-400/70 py-2 pl-3 pr-2 shadow-card backdrop-blur-xl">
          {/* Left: brand */}
          <Logo />

          {/* Center: links (desktop) */}
          <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => {
              const active = link.match(router);
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                    active ? 'bg-dark-500/50 text-light-200' : 'text-dark-700 hover:bg-dark-500/30 hover:text-light-200'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Right: theme + auth (desktop) */}
          <div className="hidden items-center gap-2 md:flex">
            <ThemeToggle />
            {status === 'loading' ? (
              <div className="h-9 w-24 animate-pulse rounded-full bg-dark-500/40" />
            ) : user ? (
              <UserMenu user={user} open={menuOpen} setOpen={setMenuOpen} onLogout={handleLogout} />
            ) : (
              <>
                <Link href="/login" className="rounded-full px-4 py-2 text-sm font-medium text-dark-700 transition-colors hover:text-light-200">
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="rounded-full bg-green-500 px-4 py-2 text-sm font-semibold text-white shadow-soft transition-all hover:brightness-110"
                >
                  Get started
                </Link>
              </>
            )}
          </div>

          {/* Mobile controls */}
          <div className="flex items-center gap-1 md:hidden">
            <ThemeToggle />
            <button
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
              className="flex h-9 w-9 items-center justify-center rounded-full text-dark-700 hover:bg-dark-500/40 hover:text-light-200"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {/* Mobile dropdown */}
          {mobileOpen && (
            <div className="absolute left-0 right-0 top-full mt-2 rounded-2xl border border-dark-500 bg-dark-400/95 p-2 shadow-card backdrop-blur-xl md:hidden">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-xl px-4 py-2.5 text-sm font-medium text-dark-700 hover:bg-dark-500/40 hover:text-light-200"
                >
                  {link.label}
                </Link>
              ))}
              <div className="my-2 h-px bg-dark-500/60" />
              {user ? (
                <>
                  {user.role === 'ADMIN' && (
                    <Link href="/admin" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm text-green-500">
                      <LayoutDashboard size={16} /> Admin Panel
                    </Link>
                  )}
                  <button onClick={handleLogout} className="flex w-full items-center gap-2 rounded-xl px-4 py-2.5 text-left text-sm text-red-500">
                    <LogOut size={16} /> Sign out
                  </button>
                </>
              ) : (
                <div className="flex gap-2 p-2">
                  <Link href="/login" onClick={() => setMobileOpen(false)} className="btn-outline flex-1 rounded-full">Sign in</Link>
                  <Link href="/register" onClick={() => setMobileOpen(false)} className="btn-primary flex-1 rounded-full">Get started</Link>
                </div>
              )}
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}

function UserMenu({ user, open, setOpen, onLogout }) {
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-dark-500/80 bg-dark-400/60 py-1 pl-1 pr-2.5 text-sm hover:bg-dark-500/40"
      >
        <Avatar name={user.name} src={user.avatar} size={28} />
        <span className="max-w-[110px] truncate font-medium">{user.name.split(' ')[0]}</span>
        <ChevronDown size={15} className="text-dark-600" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-2xl border border-dark-500 bg-dark-400 py-1 shadow-card">
            <div className="border-b border-dark-500 px-4 py-3">
              <p className="truncate text-sm font-semibold text-white">{user.name}</p>
              <p className="truncate text-xs text-dark-600">{user.email}</p>
            </div>
            {user.role === 'ADMIN' && (
              <Link href="/admin" onClick={() => setOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-dark-500/40">
                <LayoutDashboard size={16} className="text-green-500" /> Admin Panel
              </Link>
            )}
            <button onClick={onLogout} className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-red-500 hover:bg-dark-500/40">
              <LogOut size={16} /> Sign out
            </button>
          </div>
        </>
      )}
    </div>
  );
}
