import type { Config } from 'tailwindcss';

export default {
  content: [
    './src/**/*.{html,ts,scss}',
  ],
  theme: {
    extend: {
      colors: {
        // Forest Enterprise Design System
        primary: {
          50: '#e8f5f3',
          100: '#c3ecd7',
          200: '#9de3ba',
          300: '#77da9d',
          400: '#51d180',
          500: '#2bc963',
          600: '#1fb54f',
          700: '#15a13b',
          800: '#0b8d27',
          900: '#003527', // primary
          DEFAULT: '#003527',
        },
        secondary: {
          50: '#eef3f2',
          100: '#d3dfd9',
          200: '#b8cbc1',
          300: '#9db7a8',
          400: '#82a390',
          600: '#5a8566',
          700: '#4a7556',
          DEFAULT: '#416656', // soft sage
        },
        tertiary: {
          50: '#f5f0ff',
          100: '#e8d4f9',
          200: '#dbb8f2',
          300: '#cd9ceb',
          400: '#c080e4',
          DEFAULT: '#b36fe0',
        },
        error: {
          50: '#fdeaea',
          100: '#f9c6c6',
          200: '#f5a3a3',
          300: '#f17f7f',
          400: '#ed5b5b',
          DEFAULT: '#ba1a1a',
        },
        warning: {
          50: '#fffbea',
          100: '#fff3c1',
          200: '#ffeb99',
          300: '#ffe370',
          400: '#ffd748',
          DEFAULT: '#ffc107',
        },
        success: {
          50: '#e8f5e9',
          100: '#c8e6c9',
          200: '#a5d6a7',
          300: '#81c784',
          400: '#66bb6a',
          DEFAULT: '#4caf50',
        },
        // Surface colors - cool near-white palette
        surface: {
          50: '#fafbfd',
          100: '#f8f9ff', // near-white background
          200: '#f0f2f8',
          300: '#e8ebf0',
          400: '#e0e3e8',
          500: '#d8dce1',
          600: '#c8ccd4',
          700: '#b8bcc4',
          800: '#a8acb4',
          900: '#2d2d2d',
          DEFAULT: '#f8f9ff',
        },
        'surface-dim': '#d8dce1',
        'surface-bright': '#fafbfd',
        'surface-container-lowest': '#ffffff',
        'surface-container-low': '#f8f9ff',
        'surface-container': '#f0f2f8',
        'surface-container-high': '#e8ebf0',
        'surface-container-highest': '#e0e3e8',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      fontSize: {
        'label-caps': ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.5px', textTransform: 'uppercase' }],
      },
      borderRadius: {
        xs: '4px',
        DEFAULT: '4px',
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
      },
      spacing: {
        'sidebar': '280px',
      },
      gridAutoColumns: {
        '12': 'repeat(12, minmax(0, 1fr))',
      },
      maxWidth: {
        container: '1440px',
      },
      boxShadow: {
        'xs': '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        'sm': '0 2px 8px 0 rgba(0, 0, 0, 0.08)',
        'md': '0 4px 12px 0 rgba(0, 0, 0, 0.1)',
        'lg': '0 8px 24px 0 rgba(0, 0, 0, 0.12)',
        'dialog': '0 20px 56px 0 rgba(0, 0, 0, 0.3)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.3s ease-in-out',
        slideDown: 'slideDown 0.3s ease-in-out',
      },
    },
  },
  plugins: [],
} satisfies Config;
