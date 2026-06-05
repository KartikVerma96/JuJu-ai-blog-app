import '@/styles/globals.css';
import { useEffect } from 'react';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { store } from '@/store/store';
import { useMeQuery } from '@/store/services/api';
import { selectTheme, setTheme } from '@/store/slices/uiSlice';

// Self-hosted Plus Jakarta Sans, exposed through the --font-sans CSS variable
// that Tailwind (fontFamily.sans) and globals.css already consume.
const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans',
  display: 'swap',
});

// Fires the /auth/me query once on mount so the auth slice is hydrated
// for the whole app (handled by extraReducers matchers in authSlice).
function AuthBootstrap() {
  useMeQuery();
  return null;
}

// Keeps the Redux `theme` in sync with <html class="dark"> and localStorage.
// REACT/REDUX CONCEPT: state lives in Redux; this component runs the SIDE
// EFFECTS (touching the DOM + localStorage) whenever that state changes.
function ThemeManager() {
  const theme = useSelector(selectTheme);
  const dispatch = useDispatch();

  // On first mount, read the saved choice and push it into the store.
  useEffect(() => {
    const stored = localStorage.getItem('theme');
    if (stored === 'light' || stored === 'dark') {
      dispatch(setTheme(stored));
    }
  }, [dispatch]);

  // Whenever the theme changes, reflect it on <html> and remember it.
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  return null;
}

export default function App({ Component, pageProps }) {
  // Pages can opt into a custom layout via Component.getLayout.
  const getLayout = Component.getLayout || ((page) => page);

  return (
    <Provider store={store}>
      {/* Make the font the default everywhere, including portaled toasts. */}
      <style jsx global>{`
        :root {
          --font-sans: ${jakarta.style.fontFamily};
        }
      `}</style>
      <AuthBootstrap />
      <ThemeManager />
      <div className={`${jakarta.variable} font-sans`}>
        {getLayout(<Component {...pageProps} />)}
      </div>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#1A1D21',
            color: '#E8E9E9',
            border: '1px solid #363A3D',
            fontSize: '14px',
            fontFamily: 'var(--font-sans)',
          },
          success: { iconTheme: { primary: '#24AE7C', secondary: '#1A1D21' } },
          error: { iconTheme: { primary: '#F24E43', secondary: '#1A1D21' } },
        }}
      />
    </Provider>
  );
}
