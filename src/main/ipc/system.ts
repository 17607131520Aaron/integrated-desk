/**
 * 系统相关 IPC 处理器
 */

import { clipboard, ipcMain, Notification, shell } from 'electron';
import os from 'node:os';

import type { NotificationOptions, SystemInfo } from '../../types/electron';

/**
 * 注册系统相关处理器
 */
export function registerSystemHandlers(): void {
  // 获取系统信息
  ipcMain.handle('system:getInfo', (): SystemInfo => {
    return {
      platform: os.platform(),
      arch: os.arch(),
      version: os.release(),
      hostname: os.hostname(),
      homedir: os.homedir(),
      tmpdir: os.tmpdir(),
      cpus: os.cpus().length,
      memory: {
        total: os.totalmem(),
        free: os.freemem(),
      },
    };
  });

  // 剪贴板写入
  ipcMain.on('clipboard:write', (_event, text: string) => {
    clipboard.writeText(text);
  });

  // 剪贴板读取
  ipcMain.handle('clipboard:read', () => {
    return clipboard.readText();
  });

  // 打开外部链接
  ipcMain.handle('shell:openExternal', async (_event, url: string) => {
    await shell.openExternal(url);
  });

  // 显示系统通知
  ipcMain.on('notification:show', (_event, options: NotificationOptions) => {
    const notification = new Notification({
      title: options.title,
      body: options.body,
      icon: options.icon,
    });
    notification.show();
  });
}
