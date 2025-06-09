/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './view/**/*.html',
    './view/pages/**/*.html',
    './view/services/**/*.js', // If you use JS to dynamically add classes
  ],
  theme: {
    extend: {
      colors: {
        'green-800': '#096b28',
        'green-700': '#23A84A',
        'green-200': '#4cd964',
        'green-100': '#e6f7ef'
      }
    },
  },
  plugins: [],
} 