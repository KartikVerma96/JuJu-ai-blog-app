import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ page, pages, onChange }) {
  const nums = [];
  for (let i = 1; i <= pages; i++) {
    if (i === 1 || i === pages || (i >= page - 1 && i <= page + 1)) {
      nums.push(i);
    } else if (nums[nums.length - 1] !== '…') {
      nums.push('…');
    }
  }

  return (
    <div className="mt-10 flex items-center justify-center gap-2">
      <button
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        className="btn-outline px-3 disabled:opacity-40"
      >
        <ChevronLeft size={16} />
      </button>
      {nums.map((n, i) =>
        n === '…' ? (
          <span key={`e${i}`} className="px-2 text-dark-600">…</span>
        ) : (
          <button
            key={n}
            onClick={() => onChange(n)}
            className={`h-10 w-10 rounded-lg text-sm font-semibold transition-colors ${
              n === page ? 'bg-green-500 text-dark-200' : 'border border-dark-500 bg-dark-400 text-light-200 hover:bg-dark-500/40'
            }`}
          >
            {n}
          </button>
        )
      )}
      <button
        disabled={page >= pages}
        onClick={() => onChange(page + 1)}
        className="btn-outline px-3 disabled:opacity-40"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
