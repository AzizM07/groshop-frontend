/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#FF4500',
        'primary-dark': '#CC3600',
      }
    }
  },
  plugins: [],
}
