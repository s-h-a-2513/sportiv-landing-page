/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Shared with Sportiv Owner App (CSS vars in index.css)
        court: {
          DEFAULT: 'var(--court)',
          dark: 'var(--court-dark)',
          soft: 'var(--court-soft)',
        },
        ink: {
          DEFAULT: 'var(--ink)',
          muted: 'var(--ink-muted)',
        },
        muted: 'var(--ink-muted)',
        bg: 'var(--neu-bg)',
        raised: 'var(--neu-bg)',
        inset: 'var(--neu-bg)',
        wash: {
          DEFAULT: 'var(--neu-bg)',
          deep: 'var(--neu-bg-soft)',
        },
      },
      fontFamily: {
        display: ['"Outfit Variable"', 'Outfit', 'system-ui', 'sans-serif'],
        body: ['"DM Sans Variable"', 'DM Sans', 'system-ui', 'sans-serif'],
        sans: ['"DM Sans Variable"', 'DM Sans', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        content: '1140px',
      },
      borderRadius: {
        pill: '999px',
      },
      boxShadow: {
        neu: 'var(--neu-shadow-out)',
        'neu-sm': 'var(--neu-shadow-out-sm)',
        'neu-in': 'var(--neu-shadow-in)',
        'neu-btn': 'var(--neu-shadow-btn)',
        soft: '0 24px 60px rgba(26, 20, 16, 0.08)',
        phone: '0 40px 80px rgba(255, 107, 0, 0.18)',
        header: '0 10px 30px rgba(26, 20, 16, 0.05)',
        cta: '0 12px 28px rgba(255, 107, 0, 0.28)',
      },
      backgroundImage: {},
    },
  },
  plugins: [],
}
