import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        abyss: '#04101C',
        depth: '#0A1E30',
        panel: '#0C2438',
        teal: {
          DEFAULT: '#35E0CE',
          dim: '#0E7C74',
          glow: '#7FF7EA',
        },
        gold: {
          DEFAULT: '#D9A441',
          dim: '#8A6A2C',
        },
        mist: '#C7DAE2',
        bone: '#F0F7F8',
      },
      fontFamily: {
        display: ['Cinzel', 'Trajan Pro', 'Georgia', 'serif'],
        body: ['Outfit', 'Avenir', 'Helvetica Neue', 'sans-serif'],
        hud: ['Space Grotesk', 'SF Mono', 'Menlo', 'monospace'],
      },
      boxShadow: {
        holo: '0 0 0 1px rgba(53,224,206,0.25), 0 0 24px rgba(53,224,206,0.12), inset 0 0 24px rgba(53,224,206,0.05)',
        'holo-gold': '0 0 0 1px rgba(217,164,65,0.35), 0 0 24px rgba(217,164,65,0.15)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        scanline: 'scanline 1.4s ease-in-out',
        shimmer: 'shimmer 8s linear infinite',
      },
      keyframes: {
        scanline: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '15%': { opacity: '1' },
          '85%': { opacity: '1' },
          '100%': { transform: 'translateY(100%)', opacity: '0' },
        },
        shimmer: {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '200% 50%' },
        },
      },
    },
  },
  plugins: [],
};
export default config;
