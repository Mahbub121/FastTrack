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
        background: '#090d16', // Sleek ultra-dark background
        surface: {
          DEFAULT: '#131926',
          glass: 'rgba(19, 25, 38, 0.6)',
          light: '#1d273a',
        },
        border: {
          DEFAULT: 'rgba(255, 255, 255, 0.06)',
          active: 'rgba(16, 185, 129, 0.3)',
        },
        accent: {
          primary: '#10b981', // Emerald 500 - Keto/Water
          fast: '#f59e0b',    // Amber 500 - Fasting
          weight: '#06b6d4',  // Cyan 500 - Weight
          ketone: '#8b5cf6',  // Violet 500 - Ketones
          danger: '#ef4444',  // Red 500 - Net Carb alert
        }
      },
      fontFamily: {
        bengali: ['"Hind Siliguri"', 'sans-serif'],
        sans: ['"Inter"', 'sans-serif'],
      },
      boxShadow: {
        'glow-primary': '0 0 15px rgba(16, 185, 129, 0.15)',
        'glow-fast': '0 0 15px rgba(245, 158, 11, 0.15)',
      }
    },
  },
  plugins: [],
}
