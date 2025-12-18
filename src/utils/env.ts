/**
 * 环境变量工具函数
 */

/**
 * 获取环境变量
 */
export function getEnv(key: keyof ImportMetaEnv): string {
  return import.meta.env[key] ?? '';
}

/**
 * 是否为开发环境
 */
export function isDev(): boolean {
  return import.meta.env.DEV;
}

/**
 * 是否为生产环境
 */
export function isProd(): boolean {
  return import.meta.env.PROD;
}

/**
 * 获取 API 基础 URL
 */
export function getApiBaseUrl(): string {
  return getEnv('VITE_API_BASE_URL');
}

/**
 * 获取 API 超时时间
 */
export function getApiTimeout(): number {
  return parseInt(getEnv('VITE_API_TIMEOUT'), 10) || 30000;
}

/**
 * 获取 WebSocket URL
 */
export function getWsUrl(): string {
  return getEnv('VITE_WS_URL');
}

/**
 * 是否启用开发工具
 */
export function isDevToolsEnabled(): boolean {
  return getEnv('VITE_DEV_TOOLS') === 'true';
}

/**
 * 获取应用名称
 */
export function getAppName(): string {
  return getEnv('VITE_APP_NAME') || '个人桌面端工具箱';
}

/**
 * 获取应用版本
 */
export function getAppVersion(): string {
  return getEnv('VITE_APP_VERSION') || '1.0.0';
}
