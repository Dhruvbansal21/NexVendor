/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'Cambria', 'Times New Roman', 'serif'],
      },
      colors: {
        // Warm clay / terracotta — the house accent
        brand: {
          50: '#fdf6f1',
          100: '#fae9dd',
          200: '#f3cfb6',
          300: '#e9ad88',
          400: '#dd8557',
          500: '#d06a3d',
          600: '#bb5130',
          700: '#9b3f29',
          800: '#7d3526',
          900: '#662e22',
          950: '#371510',
        },
        // Warm paper neutrals used for surfaces and page ground
        sand: {
          50: '#fbf8f4',
          100: '#f5efe7',
          200: '#ebe2d6',
          300: '#dccfbe',
          400: '#bfae99',
          500: '#9c8974',
        },
      },
      boxShadow: {
        soft: '0 1px 2px rgba(60, 42, 32, 0.04), 0 4px 12px -4px rgba(60, 42, 32, 0.06)',
        lift: '0 2px 4px rgba(60, 42, 32, 0.05), 0 12px 28px -12px rgba(60, 42, 32, 0.14)',
      },
    },
  },
  plugins: [],
}
