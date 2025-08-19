/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dark-bg': '#0a0a0a',
        'dark-card': '#1a1a1a',
        'dark-border': '#2a2a2a',
        'green-safe': '#10b981',
        'red-risk': '#ef4444',
        'yellow-warning': '#f59e0b',
      }
    },
  },
  plugins: [],
}