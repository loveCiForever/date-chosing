/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      'sm': '576px',
      'md': '768px',
      'lg': '1150px',
      'xl': '1240px',
      '2xl': '1240px',
    },
    extend: {},
  },
  plugins: [],
}

