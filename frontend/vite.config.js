import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3003,
    strictPort: true,
    allowedHosts: [
      'echocast.genstudy.ai',
      'mindmap.genstudy.ai',
      'localhost',
      '127.0.0.1',
      '13.52.175.51',
    ],
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 3003,
      clientPort: 3003,
    },
    watch: {
      usePolling: false,
    },
  },
  // 环境变量定义
  define: {
    __DEV__: mode === 'development',
  },
  build: {
    // 目标浏览器
    target: 'es2015',
    // 生产环境优化
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // 移除 console.log
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn'],
        passes: 2, // 多次压缩以获得更好的结果
      },
      mangle: {
        safari10: true, // 兼容 Safari 10
      },
      format: {
        comments: false, // 移除注释
      },
    },
    // 代码分割优化
    rollupOptions: {
      output: {
        // 自动代码分割策略
        manualChunks(id) {
          // React 核心库
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
            return 'react-core';
          }
          // React Router
          if (id.includes('node_modules/react-router') || id.includes('node_modules/@remix-run/router')) {
            return 'react-router';
          }
          // Axios
          if (id.includes('node_modules/axios')) {
            return 'axios';
          }
          // 其他 node_modules
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
        // 优化输出文件名
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
    // 启用 CSS 代码分割
    cssCodeSplit: true,
    // 设置 chunk 大小警告限制
    chunkSizeWarningLimit: 1000,
    // 启用 sourcemap（可选，调试用）
    sourcemap: false,
  },
  // 预构建依赖优化
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'axios'],
  },
}))
