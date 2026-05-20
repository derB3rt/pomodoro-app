/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"DM Sans"', 'sans-serif'],
        mono: ['"DM Mono"', 'monospace'],
      },
      colors: {
        tomato: {
          50:  '#FFF1EE',
          100: '#FFD9CF',
          200: '#FFB3A0',
          400: '#E8623A',
          500: '#D85A30',
          600: '#B84520',
          700: '#8C3118',
          900: '#3D1208',
        },
        sage: {
          50:  '#F2F5F0',
          100: '#DDE5D8',
          200: '#B9CAB1',
          500: '#6B8F5E',
          700: '#3D5735',
          900: '#1A2616',
        },
      },
    },
  },
  plugins: [],
}
