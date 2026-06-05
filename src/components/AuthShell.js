import Logo from './Logo';
import ThemeToggle from './ThemeToggle';
import { Quote, PenLine, Users, TrendingUp } from 'lucide-react';

// Split-screen auth shell inspired by the JSM Patient Management System:
// a clean form panel on the left and a branded, textured visual on the right.
export default function AuthShell({ children }) {
  return (
    <div className="flex min-h-screen bg-dark-200">
      {/* Form panel (follows the active theme) */}
      <div className="dotted-bg flex w-full flex-col px-6 py-10 sm:px-12 lg:w-[46%] lg:px-20">
        <div className="flex items-center justify-between">
          <Logo />
          <ThemeToggle />
        </div>
        <div className="flex flex-1 items-center">
          <div className="w-full max-w-md animate-fade-up">{children}</div>
        </div>
        <p className="text-12-regular text-dark-600">
          © {new Date().getFullYear()} JuJu. All rights reserved.
        </p>
      </div>

      {/* Visual panel — always kept dark (the `dark` class forces the theme
          tokens to their dark values for everything inside this branded panel,
          regardless of the global light/dark setting). */}
      <div className="dark relative hidden overflow-hidden bg-auth-side lg:block lg:w-[54%]">
        <div className="dotted-bg absolute inset-0 opacity-60" />

        {/* Floating glow orbs for depth */}
        <div className="absolute -right-16 top-24 h-72 w-72 rounded-full bg-green-500/20 blur-3xl animate-float" />
        <div className="absolute bottom-10 left-1/4 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />

        {/* Floating stat chips */}
        <div className="absolute right-16 top-20 animate-float">
          <FloatChip icon={Users} label="12.4k readers" tone="green" />
        </div>
        <div className="absolute left-16 top-1/2 animate-float" style={{ animationDelay: '1.5s' }}>
          <FloatChip icon={TrendingUp} label="Trending weekly" tone="blue" />
        </div>

        <div className="relative flex h-full flex-col justify-end p-16">
          <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-500/15 text-green-500">
            <PenLine size={26} />
          </div>
          <Quote className="mb-4 text-green-500" size={40} />
          <p className="text-28-bold max-w-lg text-white">
            The scariest moment is always just before you start. After that, things can only get better.
          </p>
          <p className="text-14-medium mt-4 text-light-700">— Stephen King</p>
        </div>
      </div>
    </div>
  );
}

function FloatChip({ icon: Icon, label, tone }) {
  const tones = {
    green: 'bg-green-500/15 text-green-500',
    blue: 'bg-blue-500/15 text-blue-500',
  };
  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-dark-300/70 px-4 py-3 shadow-card backdrop-blur">
      <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${tones[tone]}`}>
        <Icon size={16} />
      </span>
      <span className="text-14-medium text-light-200">{label}</span>
    </div>
  );
}
