/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        maroon: {
          50: '#fdf2f4',
          100: '#fbe6e9',
          200: '#f8cfd6',
          300: '#f1a9b5',
          400: '#e7768b',
          500: '#d74864',
          600: '#b82946',
          700: '#9b1b36',
          800: '#821930',
          900: '#6f192d',
          950: '#400914',
        },
        primary: {
          DEFAULT: '#821930', // MIT ACSC Maroon
          foreground: '#ffffff',
          50: '#fdf2f4',
          100: '#fbe6e9',
          500: '#9b1b36',
          600: '#821930',
          700: '#6f192d',
        },
        secondary: {
          DEFAULT: '#f1f5f9',
          foreground: '#1e293b',
        },
        destructive: {
          DEFAULT: '#dc2626',
          foreground: '#ffffff',
        },
        muted: {
          DEFAULT: '#f8fafc',
          foreground: '#64748b',
        },
        accent: {
          DEFAULT: '#fdf2f4',
          foreground: '#821930',
        },
        card: {
          DEFAULT: '#ffffff',
          foreground: '#0f172a',
        },
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.25rem',
      },
    },
  },
  plugins: [],
}
