import path from 'path';

import { defineConfig } from 'vite';

// https://vitejs.dev/config
export default defineConfig({
  // 路径别名配置
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/utils': path.resolve(__dirname, './src/utils'),
      '@/types': path.resolve(__dirname, './src/types'),
      '@/store': path.resolve(__dirname, './src/store'),
    },
    extensions: ['.mjs', '.js', '.mts', '.ts', '.json'],
  },

  // 环境变量前缀
  envPrefix: ['VITE_', 'ELECTRON_'],

  // 定义全局常量
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
    __PROD__: JSON.stringify(process.env.NODE_ENV === 'production'),
  },

  // 主进程构建配置
  build: {
    // 主进程使用 Node.js 环境
    target: 'node18',
    // 不压缩主进程代码，便于调试
    minify: process.env.NODE_ENV === 'production',
    sourcemap: true,
    rollupOptions: {
      // 外部化 Node.js 内置模块和 electron
      external: ['electron', 'path', 'fs', 'os', 'crypto', 'child_process', 'net', 'http', 'https'],
    },
  },
});
