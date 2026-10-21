/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
      },
      colors: {
        // Enforce strict monochrome / black & white mapping
        sky: require('tailwindcss/colors').zinc,
        violet: require('tailwindcss/colors').zinc,
        emerald: require('tailwindcss/colors').zinc,
        rose: require('tailwindcss/colors').zinc,
        amber: require('tailwindcss/colors').zinc,
        indigo: require('tailwindcss/colors').zinc,
        purple: require('tailwindcss/colors').zinc,
        blue: require('tailwindcss/colors').zinc,
        slate: require('tailwindcss/colors').zinc, // Convert slate to zinc for deeper blacks
        primary: {
          50: '#fafafa',
          500: '#71717a',
          600: '#52525b',
          700: '#3f3f46',
        },
      },
      boxShadow: {
        soft: '0 8px 32px rgba(0, 0, 0, 0.4)',
        glow: '0 0 20px rgba(255, 255, 255, 0.05)',
      },
    },
  },
  plugins: [],
};
