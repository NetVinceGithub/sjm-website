/** @type {import('tailwindcss').Config} */
const flowbite = require("flowbite-react/tailwind");

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    flowbite.content(),

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
      colors: {
        'neutralSilver': '#F5F7FA',
        'neutralDGray': '#4D4D4D',
        'brandPrimary': '#4CAF4F',
        'neutralGray': '#717171',
        'gray900': '#18191F'
      },
      screens: {
        'laptop': '1440px',   // Your 15.6" laptop
        'desktop': '1920px',  // Your 23.8" desktop
      },
    },
  },
  plugins: [
    flowbite.plugin(),
  ],
};

