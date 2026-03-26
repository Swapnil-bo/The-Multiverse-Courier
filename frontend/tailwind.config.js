/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        fontFamily: {
          serif: ['Georgia', 'Cambria', 'Times New Roman', 'serif'],
          sans: ['Inter', 'system-ui', 'sans-serif'],
        },
        colors: {
          newsprint: '#f5f0e8',
          ink: '#1a1a1a',
          accent: '#c41e3a',
        }
      },
    },
    plugins: [],
  }
