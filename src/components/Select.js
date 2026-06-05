import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

/**
 * A themed, custom dropdown that replaces the native <select> (which can't be
 * styled to match the app). Fully controlled:
 *   <Select value={x} onChange={setX} options={[{value, label}, ...]} />
 *
 * REACT CONCEPTS shown here:
 *  - useState for open/closed
 *  - useRef + a document listener (useEffect) to close on outside click
 *  - controlled component: parent owns `value`, we call onChange(newValue)
 */
export default function Select({
  value,
  onChange,
  options = [],
  placeholder = 'Select...',
  className = '',
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close the menu when clicking anywhere outside it, or pressing Escape.
  useEffect(() => {
    function onDocClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    function onKey(e) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  const selected = options.find((o) => String(o.value) === String(value));

  return (
    <div ref={ref} className={`relative ${className}`}>
      {/* Trigger — styled like our .input field */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 rounded-lg border border-dark-500 bg-dark-400 px-4 py-3 text-sm outline-none transition-all duration-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
      >
        <span className={selected ? 'text-light-200' : 'text-dark-600'}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          size={16}
          className={`shrink-0 text-dark-600 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Popup list */}
      {open && (
        <ul
          role="listbox"
          className="absolute z-50 mt-2 max-h-64 w-full min-w-full overflow-auto rounded-xl border border-dark-500 bg-dark-400 p-1.5 shadow-card animate-fade-in"
        >
          {options.map((o) => {
            const isSelected = String(o.value) === String(value);
            return (
              <li key={o.value}>
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(o.value);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                    isSelected
                      ? 'bg-green-500/15 font-medium text-green-500'
                      : 'text-light-200 hover:bg-dark-500/40'
                  }`}
                >
                  <span className="truncate">{o.label}</span>
                  {isSelected && <Check size={15} className="shrink-0" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
