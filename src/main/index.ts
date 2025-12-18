/**
 * Electron 主进程入口
 */

import { app, BrowserWindow } from 'electron';
import started from 'electron-squirrel-startup';
import { registerIpcHandlers } from './ipc';
import { createMainWindow, getMainWindow } from './window';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

// 应用准备就绪
app.on('ready', () => {
  // 注册 IPC 处理器
  registerIpcHandlers();
  
  // 创建主窗口
  createMainWindow();
});

// 所有窗口关闭时退出应用（macOS 除外）
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// macOS: 点击 dock 图标时重新创建窗口
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});

// 导出主窗口获取函数供其他模块使用
export { getMainWindow };
