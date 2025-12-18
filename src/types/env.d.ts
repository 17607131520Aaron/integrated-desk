/// <reference types="vite/client" />

/**
 * 环境变量类型定义
 */
interface ImportMetaEnv {
  // 应用配置
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_VERSION: string;

  // API 配置
  readonly VITE_API_BASE_URL: string;
  readonly VITE_API_TIMEOUT: string;

  // WebSocket 配置
  readonly VITE_WS_URL: string;

  // 开发配置
  readonly VITE_DEV_TOOLS: string;
  readonly VITE_LOG_LEVEL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// 全局常量
declare const __DEV__: boolean;
declare const __PROD__: boolean;

// Electron Forge Vite 插件注入的全局变量
declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string | undefined;
declare const MAIN_WINDOW_VITE_NAME: string;
