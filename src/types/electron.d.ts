/**
 * Electron IPC 通信类型定义
 */

// 系统信息
export interface SystemInfo {
  platform: NodeJS.Platform;
  arch: string;
  version: string;
  hostname: string;
  homedir: string;
  tmpdir: string;
  cpus: number;
  memory: {
    total: number;
    free: number;
  };
}

// 文件对话框选项
export interface OpenDialogOptions {
  title?: string;
  defaultPath?: string;
  filters?: Array<{ name: string; extensions: string[] }>;
  properties?: Array<
    | 'openFile'
    | 'openDirectory'
    | 'multiSelections'
    | 'showHiddenFiles'
    | 'createDirectory'
  >;
}

export interface SaveDialogOptions {
  title?: string;
  defaultPath?: string;
  filters?: Array<{ name: string; extensions: string[] }>;
}

// 文件操作结果
export interface FileResult {
  success: boolean;
  data?: string;
  error?: string;
}

// 通知选项
export interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
}

// 窗口操作
export type WindowAction = 'minimize' | 'maximize' | 'close' | 'restore';

// 暴露给渲染进程的 API
export interface ElectronAPI {
  // 系统信息
  getSystemInfo: () => Promise<SystemInfo>;
  
  // 文件操作
  openFile: (options?: OpenDialogOptions) => Promise<string[] | null>;
  saveFile: (options?: SaveDialogOptions) => Promise<string | null>;
  readFile: (filePath: string) => Promise<FileResult>;
  writeFile: (filePath: string, content: string) => Promise<FileResult>;
  
  // 窗口控制
  windowControl: (action: WindowAction) => void;
  isMaximized: () => Promise<boolean>;
  
  // 系统通知
  showNotification: (options: NotificationOptions) => void;
  
  // 剪贴板
  copyToClipboard: (text: string) => void;
  readFromClipboard: () => Promise<string>;
  
  // 外部链接
  openExternal: (url: string) => Promise<void>;
  
  // 应用信息
  getAppVersion: () => Promise<string>;
  getAppPath: () => Promise<string>;
  
  // 事件监听
  onWindowMaximized: (callback: () => void) => () => void;
  onWindowUnmaximized: (callback: () => void) => () => void;
}

// 扩展 Window 接口
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};
