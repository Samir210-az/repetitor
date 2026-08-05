/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: '#12172B',
        inkdeep: '#0B0F1E',
        paper: '#F2F4F8',
        gold: '#E8B04B',
        emerald: '#2FAE7D',
        coral: '#E85D4E',
        slateink: '#1B2340',
        lilac: '#8C7AE6',
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      backgroundImage: {
        'grain': "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.06) 1px, transparent 0)",
      },
      keyframes: {
        floaty: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-14px) rotate(2deg)' },
        },
        pulseDot: {
          '0%, 100%': { opacity: 1, transform: 'scale(1)' },
          '50%': { opacity: 0.5, transform: 'scale(1.3)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        risein: {
          '0%': { opacity: 0, transform: 'translateY(24px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        }
      },
      animation: {
        floaty: 'floaty 6s ease-in-out infinite',
        floaty2: 'floaty 8s ease-in-out infinite 1s',
        pulseDot: 'pulseDot 1.8s ease-in-out infinite',
        shimmer: 'shimmer 3s linear infinite',
        risein: 'risein 0.7s cubic-bezier(0.16,1,0.3,1) both',
      }
    },
  },
  plugins: [],
}
