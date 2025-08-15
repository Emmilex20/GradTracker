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
      // === New Animations & Keyframes ===
      animation: {
        'fade-in': 'fadeIn 1s ease-out',
        'fade-in-up': 'fadeInUp 0.7s ease-out',
        'slide-in-up': 'slideInUp 1s ease-out',
        'list-item-enter': 'listItemEnter 0.5s ease-out',
        'ping-once': 'ping 1s cubic-bezier(0, 0, 0.2, 1) 1',
        'blob': 'blob 7s infinite',
        'bounce-horizontal': 'bounceHorizontal 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInUp: {
          '0%': { opacity: '0', transform: 'translateY(100%)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        listItemEnter: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
        bounceHorizontal: {
          '0%, 100%': { transform: 'translateX(0)' },
          '50%': { transform: 'translateX(4px)' },
        },
      },
      // === End of New Animations & Keyframes ===
    },
  },
  plugins: [
    require('flowbite/plugin'),
  ],
}