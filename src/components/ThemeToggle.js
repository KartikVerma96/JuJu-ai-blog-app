import { useSelector, useDispatch } from 'react-redux';
import { Sun, Moon } from 'lucide-react';
import { selectTheme, toggleTheme } from '@/store/slices/uiSlice';

// A button that flips the theme. It reads `theme` from Redux (useSelector) and
// dispatches an action to change it (useDispatch). The actual DOM/localStorage
// work happens in ThemeManager (_app.js) — this button only changes state.
export default function ThemeToggle({ className = '' }) {
  const theme = useSelector(selectTheme);
  const dispatch = useDispatch();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={() => dispatch(toggleTheme())}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
      className={`flex h-9 w-9 items-center justify-center rounded-lg border border-dark-500 bg-dark-400 text-dark-700 transition-colors hover:text-green-500 ${className}`}
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
