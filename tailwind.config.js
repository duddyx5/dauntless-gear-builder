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
        dauntless: {
          bg: '#0d1117',
          card: '#161b22',
          cardHover: '#1f2937',
          border: '#30363d',
          accent: '#00d2ff',
          accentDark: '#0077b6',
          blaze: '#ff5722',
          frost: '#00e5ff',
          shock: '#ffd600',
          terra: '#76ff03',
          radiant: '#ffea00',
          umbral: '#b388ff',
          neutral: '#90a4ae',
          brutality: '#ef4444',
          finesse: '#3b82f6',
          fortitude: '#10b981',
          alacrity: '#f59e0b',
          insight: '#8b5cf6',
          prismatic: '#ec4899',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
