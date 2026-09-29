/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bubblegum: {
          50: '#fff1f8',
          100: '#ffe4f3',
          200: '#fecddc',
          300: '#fda4c1',
          400: '#fb6f99',
          500: '#f43f77',
          600: '#e11d56',
        },
        sunny: {
          100: '#fef9c3',
          300: '#fde047',
          400: '#facc15',
          500: '#eab308',
        },
        mint: {
          100: '#dcfce7',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
        },
        sky: {
          100: '#e0f2fe',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#06b6d4',
        },
        popPurple: {
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
        }
      },
      fontFamily: {
        cartoon: ['Fredoka', 'Comic Sans MS', 'Fredoka One', 'cursive', 'sans-serif'],
      },
      keyframes: {
        bounceSlow: {
          '0%, 100%': { transform: 'translateY(-6%)' },
          '50%': { transform: 'translateY(0)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-4deg)' },
          '50%': { transform: 'rotate(4deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-12px) rotate(3deg)' },
        },
        popIn: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '70%': { transform: 'scale(1.08)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        pulseGlow: {
          '0%, 100%': { filter: 'drop-shadow(0 0 15px rgba(251, 111, 153, 0.6))' },
          '50%': { filter: 'drop-shadow(0 0 25px rgba(250, 204, 21, 0.9))' },
        }
      },
      animation: {
        'bounce-slow': 'bounceSlow 3s ease-in-out infinite',
        'wiggle': 'wiggle 0.6s ease-in-out infinite',
        'float': 'float 4s ease-in-out infinite',
        'float-delayed': 'float 4.5s ease-in-out infinite 1.5s',
        'pop-in': 'popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
        'pulse-glow': 'pulseGlow 2.5s ease-in-out infinite',
      },
      boxShadow: {
        'cartoon': '4px 4px 0px 0px rgba(0, 0, 0, 0.9)',
        'cartoon-lg': '6px 6px 0px 0px rgba(0, 0, 0, 0.9)',
        'cartoon-xl': '8px 8px 0px 0px rgba(0, 0, 0, 0.9)',
        'cartoon-pink': '4px 4px 0px 0px #e11d56',
        'cartoon-yellow': '4px 4px 0px 0px #eab308',
        'cartoon-green': '4px 4px 0px 0px #16a34a',
      }
    },
  },
  plugins: [],
}
