import type { Config } from 'tailwindcss'

export default {
  darkMode: 'class',
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      screens: {
        'xs': '375px',
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: '#FF6B35',
        'primary-dark': '#E55A2B',
        gold: '#D4AF37',
        'gold-light': '#F5E6A3',
        'gold-dark': '#B8860B',
        champagne: '#F7E7CE',
        dark: '#0a0a0a',
        'dark-card': '#111111',
        'dark-surface': '#1a1a1a',
        'dark-border': '#2a2a2a',
        'light-bg': '#ffffff',
        'light-card': '#f8f8f8',
        'light-surface': '#f0f0f0',
        'light-border': '#e0e0e0',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-in-from-left': {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'slide-in-from-right': {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'slide-in-from-top': {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'bounce-slow': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'scale-up': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'float-gentle': {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-15px) rotate(2deg)' },
        },
        'gradient-shift': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(212, 175, 55, 0.1)' },
          '50%': { boxShadow: '0 0 40px rgba(212, 175, 55, 0.3)' },
        },
        'reveal-up': {
          '0%': { transform: 'translateY(40px)', opacity: '0', filter: 'blur(10px)' },
          '100%': { transform: 'translateY(0)', opacity: '1', filter: 'blur(0)' },
        },
        'spin-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-out',
        'slide-in-left': 'slide-in-from-left 0.6s ease-out',
        'slide-in-right': 'slide-in-from-right 0.6s ease-out',
        'slide-in-top': 'slide-in-from-top 0.6s ease-out',
        'bounce-slow': 'bounce-slow 3s infinite',
        'pulse-glow': 'pulse-glow 3s infinite',
        shimmer: 'shimmer 3s ease-in-out infinite',
        'scale-up': 'scale-up 0.4s ease-out',
        'float-gentle': 'float-gentle 6s ease-in-out infinite',
        'gradient-shift': 'gradient-shift 6s ease infinite',
        'glow-pulse': 'glow-pulse 3s infinite',
        'reveal-up': 'reveal-up 0.8s ease-out',
        'spin-slow': 'spin-slow 8s linear infinite',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-luxury': 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)',
      },
    },
  },
  plugins: [],
} satisfies Config