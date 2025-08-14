import type { Config } from 'tailwindcss'

export default {
  darkMode: 'class',
  content: ['./index.html','./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['SF Pro Text','Inter','system-ui', 'sans-serif'],
        mono: ['JetBrains Mono','ui-monospace','SFMono-Regular','monospace']
      },
      colors: {
        bg: '#070A08',
        panel: 'rgba(15,23,20,0.32)',
        ink: {
          primary: '#D8FFEA',
          secondary: '#98E6C2',
          muted: '#6B7A72'
        },
        accent: {
          DEFAULT: '#39FF14',
          soft: '#00D977'
        },
        warn: '#FFC14D',
        danger: '#FF4D6D'
      },
      boxShadow: {
        glass: '0 8px 30px rgba(0,0,0,0.35), inset 0 0 0 1px rgba(207,255,241,0.18)',
        glow: '0 0 0 3px rgba(57,255,20,0.18), 0 0 24px rgba(57,255,20,0.25)'
      },
      backdropBlur: { xl: '18px' },
      borderRadius: { glass: '16px' }
    }
  },
  plugins: []
} satisfies Config
