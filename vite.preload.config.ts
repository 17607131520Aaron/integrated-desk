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

  // preload 脚本构建配置
  build: {
    target: 'node18',
    minify: process.env.NODE_ENV === 'production',
    sourcemap: true,
    rollupOptions: {
      external: ['electron'],
    },
  },
});
