import { defineConfig } from "vite";
import path from "path";

// https://vitejs.dev/config
export default defineConfig({
  // 路径别名配置
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@/utils": path.resolve(__dirname, "./src/utils"),
      "@/types": path.resolve(__dirname, "./src/types"),
      "@/store": path.resolve(__dirname, "./src/store"),
    },
    extensions: [".mjs", ".js", ".mts", ".ts", ".json"],
  },

  // 构建配置
  build: {
    target: "node18", // Electron 主进程使用 Node.js 环境
    outDir: ".vite/build",
    lib: {
      entry: path.resolve(__dirname, "src/main.ts"),
      formats: ["cjs"],
      fileName: () => "main.js",
    },
    rollupOptions: {
      external: [
        // Electron 相关模块应该保持外部化
        "electron",
        "electron-squirrel-startup",
        // Node.js 内置模块
        "node:path",
        "node:fs",
        "node:url",
        "node:crypto",
        "node:os",
        "node:child_process",
        "node:util",
        "node:stream",
        "node:buffer",
        "node:events",
        "node:net",
        "node:http",
        "node:https",
        "node:zlib",
        "node:querystring",
        // 其他可能需要外部化的模块
        ...(process.env.NODE_ENV === "production"
          ? [
              // 生产环境外部化的依赖
            ]
          : []),
      ],
      output: {
        entryFileNames: "[name].js",
        chunkFileNames: "[name]-[hash].js",
        assetFileNames: "[name]-[hash].[ext]",
      },
    },
    sourcemap: process.env.NODE_ENV === "development",
    minify: process.env.NODE_ENV === "production" ? "esbuild" : false,
    emptyOutDir: true,
  },

  // 环境变量前缀
  envPrefix: ["VITE_", "ELECTRON_"],

  // 定义全局常量
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV === "development"),
    __PROD__: JSON.stringify(process.env.NODE_ENV === "production"),
  },
});
