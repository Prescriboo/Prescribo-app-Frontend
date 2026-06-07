import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1d4ed8',
          dark: '#1e3a8a',
          light: '#3b82f6',
          50: '#eff6ff',
          100: '#dbeafe',
        },
        teal: {
          DEFAULT: '#14b8a6',
          dark: '#0f766e',
          light: '#5eead4',
          50: '#f0fdfa',
          100: '#ccfbf1',
        },
        surface: '#ffffff',
        bg: '#f8fafc',
        border: '#e2e8f0',
        danger: '#ef4444',
        'danger-50': '#fef2f2',
        success: '#22c55e',
        'success-50': '#f0fdf4',
        warning: '#f59e0b',
        'warning-50': '#fffbeb',
      },
      fontFamily: {
        sans: ['Segoe UI', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

export default config
