/**
 * Preload 脚本 - 安全地暴露 Electron API 给渲染进程
 * @see https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
 */

import { contextBridge, ipcRenderer } from 'electron';
import type { 
  ElectronAPI, 
  OpenDialogOptions, 
  SaveDialogOptions, 
  NotificationOptions,
  WindowAction 
} from './types/electron';

const electronAPI: ElectronAPI = {
  // 系统信息
  getSystemInfo: () => ipcRenderer.invoke('system:getInfo'),

  // 文件操作
  openFile: (options?: OpenDialogOptions) => ipcRenderer.invoke('dialog:openFile', options),
  saveFile: (options?: SaveDialogOptions) => ipcRenderer.invoke('dialog:saveFile', options),
  readFile: (filePath: string) => ipcRenderer.invoke('file:read', filePath),
  writeFile: (filePath: string, content: string) => ipcRenderer.invoke('file:write', filePath, content),

  // 窗口控制
  windowControl: (action: WindowAction) => ipcRenderer.send('window:control', action),
  isMaximized: () => ipcRenderer.invoke('window:isMaximized'),

  // 系统通知
  showNotification: (options: NotificationOptions) => ipcRenderer.send('notification:show', options),

  // 剪贴板
  copyToClipboard: (text: string) => ipcRenderer.send('clipboard:write', text),
  readFromClipboard: () => ipcRenderer.invoke('clipboard:read'),

  // 外部链接
  openExternal: (url: string) => ipcRenderer.invoke('shell:openExternal', url),

  // 应用信息
  getAppVersion: () => ipcRenderer.invoke('app:getVersion'),
  getAppPath: () => ipcRenderer.invoke('app:getPath'),

  // 事件监听
  onWindowMaximized: (callback: () => void) => {
    const handler = () => callback();
    ipcRenderer.on('window:maximized', handler);
    return () => ipcRenderer.removeListener('window:maximized', handler);
  },
  onWindowUnmaximized: (callback: () => void) => {
    const handler = () => callback();
    ipcRenderer.on('window:unmaximized', handler);
    return () => ipcRenderer.removeListener('window:unmaximized', handler);
  },
};

// 安全地暴露 API 到渲染进程
contextBridge.exposeInMainWorld('electronAPI', electronAPI);
