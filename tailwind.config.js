/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,jsx}',
    './src/components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Colors resolve to CSS variables (defined in globals.css) so the whole
        // palette flips between light and dark themes. The mid-tone accents
        // (green/blue/red/yellow `500`) stay constant; only surfaces, text and
        // the tint `600` shades change per theme.
        green: {
          500: '#24AE7C',
          600: 'rgb(var(--green-600) / <alpha-value>)',
        },
        blue: {
          500: '#79B5EC',
          600: 'rgb(var(--blue-600) / <alpha-value>)',
        },
        red: {
          500: '#F37877',
          600: 'rgb(var(--red-600) / <alpha-value>)',
          700: '#F24E43',
        },
        yellow: {
          500: '#FCC74D',
          600: 'rgb(var(--yellow-600) / <alpha-value>)',
        },
        light: {
          200: 'rgb(var(--light-200) / <alpha-value>)',
          700: 'rgb(var(--light-700) / <alpha-value>)',
        },
        dark: {
          200: 'rgb(var(--dark-200) / <alpha-value>)',
          300: 'rgb(var(--dark-300) / <alpha-value>)',
          400: 'rgb(var(--dark-400) / <alpha-value>)',
          500: 'rgb(var(--dark-500) / <alpha-value>)',
          600: 'rgb(var(--dark-600) / <alpha-value>)',
          700: 'rgb(var(--dark-700) / <alpha-value>)',
        },
        // `text-white` now means "strong heading text" and flips with the theme.
        white: 'rgb(var(--white) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        // Card/soft shadows are themed (softer in light mode) via variables.
        card: 'var(--shadow-card)',
        soft: 'var(--shadow-soft)',
        'green-glow': '0 0 0 1px rgba(36,174,124,0.25), 0 12px 40px -12px rgba(36,174,124,0.45)',
      },
      backgroundImage: {
        // Stat-card surfaces (bg-stat-*) are defined in globals.css instead,
        // so they can have separate light- and dark-theme gradients.
        'auth-side':
          'radial-gradient(60% 50% at 80% 10%, rgba(36,174,124,0.25) 0%, transparent 60%), radial-gradient(50% 40% at 10% 90%, rgba(121,181,236,0.18) 0%, transparent 55%), linear-gradient(160deg, #131619 0%, #0D0F10 100%)',
        'hero-glow':
          'radial-gradient(50% 60% at 50% 0%, rgba(36,174,124,0.12) 0%, transparent 60%)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.4s ease-out',
        'fade-up': 'fade-up 0.6s ease-out both',
        float: 'float 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
