/**
 * 窗口控制 IPC 处理器
 */

import { ipcMain } from 'electron';

import { getMainWindow } from '../window';

import type { WindowAction } from '../../types/electron';

/**
 * 注册窗口控制处理器
 */
export function registerWindowHandlers(): void {
  // 窗口控制
  ipcMain.on('window:control', (_event, action: WindowAction) => {
    const mainWindow = getMainWindow();
    if (!mainWindow) {
      return;
    }

    switch (action) {
      case 'minimize':
        mainWindow.minimize();
        break;
      case 'maximize':
        if (mainWindow.isMaximized()) {
          mainWindow.unmaximize();
        } else {
          mainWindow.maximize();
        }
        break;
      case 'restore':
        mainWindow.restore();
        break;
      case 'close':
        mainWindow.close();
        break;
    }
  });

  // 检查窗口是否最大化
  ipcMain.handle('window:isMaximized', () => {
    const mainWindow = getMainWindow();
    return mainWindow?.isMaximized() ?? false;
  });
}
