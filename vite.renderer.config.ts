import path from "path";

import { defineConfig } from "vite";

// https://vitejs.dev/config
// 注意：Electron Forge 的 Vite 插件会自动处理 React，无需手动添加 @vitejs/plugin-react
export default defineConfig({
  plugins: [],

  // 路径别名配置
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@/app": path.resolve(__dirname, "./src/app"),
      "@/pages": path.resolve(__dirname, "./src/pages"),
      "@/components": path.resolve(__dirname, "./src/components"),
      "@/utils": path.resolve(__dirname, "./src/utils"),
      "@/store": path.resolve(__dirname, "./src/store"),
      "@/types": path.resolve(__dirname, "./src/types"),
      "@/router": path.resolve(__dirname, "./src/router"),
      "@/assets": path.resolve(__dirname, "./src/assets"),
    },
    // 扩展名解析优先级
    extensions: [
      ".mjs",
      ".js",
      ".mts",
      ".ts",
      ".jsx",
      ".tsx",
      ".json",
      ".scss",
      ".css",
    ],
  },

  // 开发服务器配置
  server: {
    port: 3000,
    host: true,
    open: false,
    cors: true,
    // 代理配置（如需要）
    proxy: {},
  },

  // 构建配置
  build: {
    target: "esnext",
    outDir: "dist/renderer",
    assetsDir: "assets",
    sourcemap: process.env.NODE_ENV === "development",
    minify: process.env.NODE_ENV === "production" ? "esbuild" : false,

    // 代码分割配置
    rollupOptions: {
      output: {
        // 手动分包策略
        manualChunks: {
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          "antd-vendor": ["antd", "@ant-design/icons"],
          "utils-vendor": ["axios", "zustand", "ahooks"],
        },
        // 文件命名
        chunkFileNames: "assets/js/[name]-[hash].js",
        entryFileNames: "assets/js/[name]-[hash].js",
        assetFileNames: (assetInfo) => {
          if (!assetInfo.name) {
            return `assets/[name]-[hash].[ext]`;
          }
          const info = assetInfo.name.split(".");
          const ext = info[info.length - 1] || "unknown";
          if (
            /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/i.test(assetInfo.name)
          ) {
            return `assets/media/[name]-[hash].${ext}`;
          }
          if (/\.(png|jpe?g|gif|svg|webp|avif)(\?.*)?$/i.test(assetInfo.name)) {
            return `assets/images/[name]-[hash].${ext}`;
          }
          if (/\.(woff2?|eot|ttf|otf)(\?.*)?$/i.test(assetInfo.name)) {
            return `assets/fonts/[name]-[hash].${ext}`;
          }
          return `assets/[name]-[hash].${ext}`;
        },
      },
    },

    // 构建优化
    chunkSizeWarningLimit: 1000,
    reportCompressedSize: false, // 禁用 gzip 压缩大小报告，提升构建速度
    cssCodeSplit: true, // CSS 代码分割
    cssMinify: "esbuild", // CSS 压缩
  },

  // CSS 配置
  css: {
    devSourcemap: true,
    preprocessorOptions: {
      scss: {
        // 使用新版 API 消除 legacy-js-api 警告
        api: 'modern-compiler',
        // 全局 SCSS 变量和混入（如需要）
        // additionalData: `@use "@/styles/variables" as *;`,
      },
    },
    modules: {
      // CSS Modules 配置
      localsConvention: "camelCase",
      generateScopedName:
        process.env.NODE_ENV === "production"
          ? "[hash:base64:8]"
          : "[name]__[local]___[hash:base64:5]",
    },
  },

  // 优化配置
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "antd",
      "@ant-design/icons",
      "axios",
      "zustand",
      "ahooks",
    ],
    exclude: ["electron"],
  },

  // 环境变量前缀
  envPrefix: ["VITE_", "ELECTRON_"],

  // 定义全局常量
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV === "development"),
    __PROD__: JSON.stringify(process.env.NODE_ENV === "production"),
  },

  // esbuild 配置
  esbuild: {
    // 生产环境移除 console 和 debugger
    drop: process.env.NODE_ENV === "production" ? ["console", "debugger"] : [],
    // 保留法律注释
    legalComments: "none",
  },

  // 预览服务器配置
  preview: {
    port: 4173,
    host: true,
    strictPort: true,
  },
});
