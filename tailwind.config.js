/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Athiti', 'sans-serif'],
      },
      colors: {
        eshria: {
          dark: '#0f392b', // Sidebar bg
          light: '#2c6e58', // Sidebar active
          primary: '#34d399', // Main buttons
          accent: '#10b981',
        },
        primary: '#0f766e',
        secondary: '#0e7490',
        risk: {
          low: '#22c55e',
          medium: '#eab308',
          high: '#f97316',
          extreme: '#ef4444',
        }
      }
    },
  },
  plugins: [],
}
