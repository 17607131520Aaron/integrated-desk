import { defineConfig } from "vite";
import path from "path";

// 注意：如果 Electron Forge 的 Vite 插件未自动处理 React，
// 请安装 @vitejs/plugin-react 并取消下面的注释
// import react from '@vitejs/plugin-react';

// https://vitejs.dev/config
export default defineConfig({
  plugins: [
    // 如果 Electron Forge 未自动处理 React，取消下面的注释
    // react({
    //   // 启用 Fast Refresh
    //   fastRefresh: true,
    //   // 使用新的 JSX 运行时
    //   jsxRuntime: 'automatic',
    //   // 开发环境启用 babel
    //   babel: {
    //     plugins: [],
    //     // 生产环境移除 console 和 debugger
    //     compact: process.env.NODE_ENV === 'production',
    //   },
    // }),
  ],

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
        // 全局 SCSS 变量和混入（如需要）
        // additionalData: `@import "@/styles/variables.scss";`,
        charset: false,
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
});
