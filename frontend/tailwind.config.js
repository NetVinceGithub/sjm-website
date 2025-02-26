/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
      },
      colors: {
        'neutralSilver': '#F5F7FA',
        'neutralDGray': '#4d4d4d',
        'brandPrimary': '#4CAF4F',
        'neutralGray': '#717171'
      },
    },
  },
  plugins: [],
};

