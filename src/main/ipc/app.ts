/**
 * 应用信息 IPC 处理器
 */

import { app, ipcMain } from 'electron';

/**
 * 注册应用信息处理器
 */
export function registerAppHandlers(): void {
  // 获取应用版本
  ipcMain.handle('app:getVersion', () => {
    return app.getVersion();
  });

  // 获取应用路径
  ipcMain.handle('app:getPath', () => {
    return app.getAppPath();
  });
}
