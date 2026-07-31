/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        court: {
          DEFAULT: '#FF6B00',
          dark: '#E55F00',
          soft: '#FFF4EB',
        },
        ink: {
          DEFAULT: '#1A1410',
          muted: '#3D342E',
        },
        wash: {
          DEFAULT: '#FFFAF6',
          deep: '#FFF1E6',
        },
      },
      fontFamily: {
        display: ['"Outfit Variable"', 'Outfit', 'system-ui', 'sans-serif'],
        body: ['"DM Sans Variable"', 'DM Sans', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        content: '1140px',
      },
      borderRadius: {
        pill: '999px',
      },
      boxShadow: {
        soft: '0 24px 60px rgba(26, 20, 16, 0.08)',
        phone: '0 40px 80px rgba(255, 107, 0, 0.18)',
        header: '0 10px 30px rgba(26, 20, 16, 0.05)',
        cta: '0 12px 28px rgba(255, 107, 0, 0.28)',
        neu: '8px 8px 20px rgba(26, 20, 16, 0.08), -6px -6px 16px rgba(255, 255, 255, 0.95)',
        'neu-in':
          'inset 5px 5px 12px rgba(26, 20, 16, 0.08), inset -4px -4px 10px rgba(255, 255, 255, 0.95)',
      },
      backgroundImage: {},
    },
  },
  plugins: [],
}
