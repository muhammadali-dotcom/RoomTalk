/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}', './src/app/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#0f1724',
        accent: '#10b981',
        panel: '#0b1220',
        muted: '#6b7280'
      }
    }
  },
  plugins: []
};
