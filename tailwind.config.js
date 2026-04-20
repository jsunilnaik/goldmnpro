/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                gold: {
                    50: '#FFF9E6',
                    100: '#FFF0B3',
                    200: '#FFE680',
                    300: '#FFDB4D',
                    400: '#FFD11A',
                    500: '#E6B800',
                    600: '#B38F00',
                    700: '#806600',
                    800: '#4D3D00',
                    900: '#1A1400',
                },
                dark: {
                    50: '#0f172a',    // Darkest (for text in light mode)
                    100: '#1e293b',
                    200: '#334155',
                    300: '#475569',
                    400: '#64748b',
                    500: '#94a3b8',
                    600: '#cbd5e1',
                    700: '#e2e8f0',
                    800: '#f1f5f9',
                    900: '#f8fafc',
                    950: '#ffffff',    // Lightest (for background in light mode)
                },
                mining: {
                    active: '#10b981',
                    idle: '#f59e0b',
                    stopped: '#ef4444',
                }
            },
            fontFamily: {
                sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
                display: ['var(--font-poppins)', 'sans-serif'],
                mono: ['var(--font-mono)', 'monospace'],
            },
            animation: {
                'glow': 'glow 2s ease-in-out infinite alternate',
                'float': 'float 3s ease-in-out infinite',
                'pulse-gold': 'pulseGold 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'spin-slow': 'spin 3s linear infinite',
                'mining': 'mining 1.5s ease-in-out infinite',
                'slide-up': 'slideUp 0.3s ease-out',
                'slide-down': 'slideDown 0.3s ease-out',
                'fade-in': 'fadeIn 0.3s ease-out',
                'bounce-in': 'bounceIn 0.5s ease-out',
                'shimmer': 'shimmer 2s infinite linear',
                'count-up': 'countUp 1s ease-out',
            },
            keyframes: {
                glow: {
                    '0%': { boxShadow: '0 0 5px rgba(230, 184, 0, 0.2)' },
                    '100%': { boxShadow: '0 0 15px rgba(230, 184, 0, 0.4)' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                pulseGold: {
                    '0%, 100%': { opacity: 1 },
                    '50%': { opacity: 0.5 },
                },
                mining: {
                    '0%': { transform: 'rotate(0deg) translateX(0)' },
                    '25%': { transform: 'rotate(-15deg) translateX(-2px)' },
                    '75%': { transform: 'rotate(15deg) translateX(2px)' },
                    '100%': { transform: 'rotate(0deg) translateX(0)' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(100%)', opacity: 0 },
                    '100%': { transform: 'translateY(0)', opacity: 1 },
                },
                slideDown: {
                    '0%': { transform: 'translateY(-100%)', opacity: 0 },
                    '100%': { transform: 'translateY(0)', opacity: 1 },
                },
                fadeIn: {
                    '0%': { opacity: 0 },
                    '100%': { opacity: 1 },
                },
                bounceIn: {
                    '0%': { transform: 'scale(0.3)', opacity: 0 },
                    '50%': { transform: 'scale(1.05)' },
                    '70%': { transform: 'scale(0.9)' },
                    '100%': { transform: 'scale(1)', opacity: 1 },
                },
                shimmer: {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                },
            },
            backgroundImage: {
                'gold-gradient': 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF8C00 100%)',
                'dark-gradient': 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)',
                'card-gradient': 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                'shimmer-gradient': 'linear-gradient(90deg, transparent, rgba(230, 184, 0, 0.05), transparent)',
            },
            screens: {
                'xs': '375px',
                'pwa': { 'raw': '(display-mode: standalone)' },
            },
            spacing: {
                'safe-top': 'env(safe-area-inset-top)',
                'safe-bottom': 'env(safe-area-inset-bottom)',
                'safe-left': 'env(safe-area-inset-left)',
                'safe-right': 'env(safe-area-inset-right)',
            },
        },
    },
    plugins: [],
};