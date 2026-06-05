// Signature CarePulse-style stat card: gradient surface, corner glow,
// a large faded background icon and a bright accent chip.
export default function StatCard({ label, value, icon: Icon, accent = 'green', hint }) {
  const accents = {
    green: { bg: 'bg-stat-green', chip: 'bg-green-500/15 text-green-500', ghost: 'text-green-500/10' },
    blue: { bg: 'bg-stat-blue', chip: 'bg-blue-500/15 text-blue-500', ghost: 'text-blue-500/10' },
    red: { bg: 'bg-stat-red', chip: 'bg-red-500/15 text-red-500', ghost: 'text-red-500/10' },
    yellow: { bg: 'bg-stat-yellow', chip: 'bg-yellow-500/15 text-yellow-500', ghost: 'text-yellow-500/10' },
  };
  const a = accents[accent] || accents.green;

  // The tile follows the active theme: the gradient surfaces (bg-stat-*) have
  // both light and dark variants defined in globals.css, and the text uses
  // themed tokens so it stays readable in either mode.
  return (
    <div className={`stat-card ${a.bg}`}>
      {/* Oversized faded icon in the background */}
      {Icon && (
        <Icon
          size={120}
          className={`pointer-events-none absolute -right-4 -top-5 ${a.ghost}`}
          strokeWidth={1.5}
        />
      )}

      <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${a.chip}`}>
        {Icon && <Icon size={22} />}
      </div>

      <div className="relative">
        <p className="text-36-bold text-white">{value}</p>
        <p className="text-14-regular mt-1 text-dark-700">{label}</p>
        {hint && <p className="text-12-regular mt-2 text-dark-600">{hint}</p>}
      </div>
    </div>
  );
}
