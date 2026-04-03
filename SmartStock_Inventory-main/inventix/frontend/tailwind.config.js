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
        primary: {
          50: '#f6fafd',
          100: '#dcebf7',
          500: '#1a3d63',
          600: '#0a1931',
          900: '#081225',
        },
        dark: {
          bg: '#0a1931',
          card: '#10233f',
          border: '#1a3d63',
          text: '#f6fafd',
          muted: '#4a7fa7'
        },
        status: {
          optimal: '#4a7fa7',
          low: '#4a7fa7',
          critical: '#0a1931',
          overstock: '#1a3d63',
        }
      },
      fontFamily: {
        sans: ['"Space Grotesk"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
