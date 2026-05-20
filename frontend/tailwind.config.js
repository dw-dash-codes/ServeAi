/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        bg: '#1E1E1E',
        surface: '#2A2A2A',
        'text-primary': '#F5F5F5',
        'text-secondary': '#A0A0A0',
        accent: '#8A9A5B',
        'accent-light': '#A8B87A',
        'slate-blue': '#6B7DB3',
        'slate-blue-light': '#8B9DD3',
        success: '#4CAF50',
        warning: '#FF9800',
        error: '#F44336',
        'glass-bg': 'rgba(255, 255, 255, 0.05)',
        'glass-border': 'rgba(255, 255, 255, 0.1)',
      },
      fontFamily: {
        sans: ['System', 'Roboto', 'sans-serif'],
        mono: ['System', 'monospace'],
      },
      borderRadius: {
        xl: '16px',
        '2xl': '24px',
      },
    },
  },
  plugins: [],
};
