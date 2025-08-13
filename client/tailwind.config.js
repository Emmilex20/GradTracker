/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "node_modules/flowbite-react/lib/esm/**/*.js",
    "node_modules/flowbite/**/*.js"
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#4F46E5',  // Indigo
        'secondary': '#1F2937',// Dark Gray
        'accent': '#F472B6',   // Pink
        'neutral-light': '#F9FAFB', // Light Gray
        'neutral-dark': '#6B7280',  // Medium Gray
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('flowbite/plugin'),
  ],
}