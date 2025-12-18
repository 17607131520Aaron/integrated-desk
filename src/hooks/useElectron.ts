/**
 * Electron API Hook
 * 提供类型安全的 Electron API 访问
 */

import { useCallback, useEffect, useState } from 'react';
import type { 
  SystemInfo, 
  OpenDialogOptions, 
  SaveDialogOptions, 
  NotificationOptions 
} from '@/types/electron';

/**
 * 检查是否在 Electron 环境中运行
 */
export function isElectron(): boolean {
  return typeof window !== 'undefined' && !!window.electronAPI;
}

/**
 * 获取 Electron API
 */
export function getElectronAPI() {
  if (!isElectron()) {
    console.warn('Not running in Electron environment');
    return null;
  }
  return window.electronAPI;
}

/**
 * 系统信息 Hook
 */
export function useSystemInfo() {
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const api = getElectronAPI();
    if (!api) {
      setLoading(false);
      return;
    }

    api.getSystemInfo()
      .then(setSystemInfo)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { systemInfo, loading, error };
}

/**
 * 窗口状态 Hook
 */
export function useWindowState() {
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    const api = getElectronAPI();
    if (!api) return;

    // 获取初始状态
    api.isMaximized().then(setIsMaximized);

    // 监听窗口状态变化
    const unsubMax = api.onWindowMaximized(() => setIsMaximized(true));
    const unsubUnmax = api.onWindowUnmaximized(() => setIsMaximized(false));

    return () => {
      unsubMax();
      unsubUnmax();
    };
  }, []);

  const minimize = useCallback(() => {
    getElectronAPI()?.windowControl('minimize');
  }, []);

  const maximize = useCallback(() => {
    getElectronAPI()?.windowControl('maximize');
  }, []);

  const close = useCallback(() => {
    getElectronAPI()?.windowControl('close');
  }, []);

  return { isMaximized, minimize, maximize, close };
}

/**
 * 文件操作 Hook
 */
export function useFileOperations() {
  const openFile = useCallback(async (options?: OpenDialogOptions) => {
    return getElectronAPI()?.openFile(options) ?? null;
  }, []);

  const saveFile = useCallback(async (options?: SaveDialogOptions) => {
    return getElectronAPI()?.saveFile(options) ?? null;
  }, []);

  const readFile = useCallback(async (filePath: string) => {
    return getElectronAPI()?.readFile(filePath) ?? { success: false, error: 'Not in Electron' };
  }, []);

  const writeFile = useCallback(async (filePath: string, content: string) => {
    return getElectronAPI()?.writeFile(filePath, content) ?? { success: false, error: 'Not in Electron' };
  }, []);

  return { openFile, saveFile, readFile, writeFile };
}

/**
 * 剪贴板 Hook
 */
export function useClipboard() {
  const copy = useCallback((text: string) => {
    const api = getElectronAPI();
    if (api) {
      api.copyToClipboard(text);
    } else {
      // 降级到浏览器 API
      navigator.clipboard.writeText(text);
    }
  }, []);

  const paste = useCallback(async () => {
    const api = getElectronAPI();
    if (api) {
      return api.readFromClipboard();
    }
    // 降级到浏览器 API
    return navigator.clipboard.readText();
  }, []);

  return { copy, paste };
}

/**
 * 通知 Hook
 */
export function useNotification() {
  const show = useCallback((options: NotificationOptions) => {
    const api = getElectronAPI();
    if (api) {
      api.showNotification(options);
    } else {
      // 降级到浏览器通知
      new Notification(options.title, { body: options.body });
    }
  }, []);

  return { show };
}

/**
 * 外部链接 Hook
 */
export function useExternalLink() {
  const open = useCallback(async (url: string) => {
    const api = getElectronAPI();
    if (api) {
      await api.openExternal(url);
    } else {
      window.open(url, '_blank');
    }
  }, []);

  return { open };
}
