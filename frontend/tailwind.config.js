/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Redefined MITS Brand Palette for Dark Theme
        mits: {
          blue: '#3b82f6',        // Keeping blue as secondary accent
          'blue-light': '#60a5fa',
          'blue-dark': '#2563eb',
          orange: '#f97316',      // Main accent (Orange-500)
          'orange-light': '#fb923c',
          'orange-dark': '#ea580c',
          green: '#22c55e',
          'green-light': '#4ade80',
          'green-dark': '#16a34a',
        },
        brand: {
          dark: '#121212',        // Main background
          card: '#1e1e1e',        // Card background
          border: '#2d2d2d',      // Border color
          surface: '#252525',     // Elevated surface
          orange: '#f97316',      // Primary Brand Color
          'orange-hover': '#ea580c',
          text: {
            primary: '#ffffff',
            secondary: '#a1a1aa',
            muted: '#71717a',
          }
        },
        // Legacy support (mapping to new system)
        background: {
          light: '#F8FAFC',
          dark: '#121212',
        },
        surface: {
          light: '#FFFFFF',
          dark: '#1e1e1e',
        },
        text: {
          primary: '#0F172A',
          secondary: '#64748B',
          dark: '#FFFFFF',
          'dark-secondary': '#a1a1aa',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-glow': 'radial-gradient(circle at 50% 50%, rgba(249, 115, 22, 0.15), transparent 70%)',
        'card-gradient': 'linear-gradient(135deg, rgba(30, 30, 30, 0.8) 0%, rgba(18, 18, 18, 0.9) 100%)',
      },
      boxShadow: {
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.15)',
        'card-hover': '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
        'glow': '0 0 20px rgba(249, 115, 22, 0.3)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      },
    },
  },
  plugins: [],
}
