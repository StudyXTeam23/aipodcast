/** @type {import('tailwindcss').Config} */
export default {
  content: {
    files: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    // 提取更多的类名模式
    extract: {
      jsx: (content) => {
        return content.match(/[^<>"'`\s]*[^<>"'`\s:]/g) || [];
      },
    },
  },
  darkMode: 'class',
  // 优化：禁用未使用的变体和插件
  corePlugins: {
    preflight: true,
    // 禁用未使用的功能
    container: false,
  },
  theme: {
    extend: {
      colors: {
        primary: '#607AFB',
        'accent-pink': '#F72585',
        'accent-purple': '#7209B7',
        'accent-lime': '#A0FF0A',
        'background-light': '#f5f6f8',
        'background-dark': '#0f1323',
        'text-light': '#333333',
        'text-dark': '#F5F5F7',
        'border-light': '#E0E0E0',
        'border-dark': '#333333',
      },
      keyframes: {
        waveform: {
          '0%': { transform: 'scaleY(0.2)' },
          '25%': { transform: 'scaleY(1)' },
          '50%': { transform: 'scaleY(0.4)' },
          '75%': { transform: 'scaleY(0.8)' },
          '100%': { transform: 'scaleY(0.2)' },
        },
      },
      animation: {
        waveform: 'waveform 1.5s ease-in-out infinite',
      },
      fontFamily: {
        display: ['Epilogue', 'sans-serif'],
      },
    },
  },
  plugins: [],
  // 生产环境优化
  future: {
    hoverOnlyWhenSupported: true,
  },
}

