/**
 * 文件操作 IPC 处理器
 */

import { dialog, ipcMain } from 'electron';
import fs from 'node:fs/promises';

import { getMainWindow } from '../window';

import type { FileResult, OpenDialogOptions, SaveDialogOptions } from '../../types/electron';

/**
 * 注册文件操作处理器
 */
export function registerFileHandlers(): void {
  // 打开文件对话框
  ipcMain.handle('dialog:openFile', async (_event, options?: OpenDialogOptions) => {
    const mainWindow = getMainWindow();
    if (!mainWindow) {
      return null;
    }

    const result = await dialog.showOpenDialog(mainWindow, {
      title: options?.title ?? '选择文件',
      defaultPath: options?.defaultPath,
      filters: options?.filters ?? [{ name: '所有文件', extensions: ['*'] }],
      properties: options?.properties ?? ['openFile'],
    });

    return result.canceled ? null : result.filePaths;
  });

  // 保存文件对话框
  ipcMain.handle('dialog:saveFile', async (_event, options?: SaveDialogOptions) => {
    const mainWindow = getMainWindow();
    if (!mainWindow) {
      return null;
    }

    const result = await dialog.showSaveDialog(mainWindow, {
      title: options?.title ?? '保存文件',
      defaultPath: options?.defaultPath,
      filters: options?.filters ?? [{ name: '所有文件', extensions: ['*'] }],
    });

    return result.canceled ? null : result.filePath;
  });

  // 读取文件
  ipcMain.handle('file:read', async (_event, filePath: string): Promise<FileResult> => {
    try {
      const data = await fs.readFile(filePath, 'utf-8');
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '读取文件失败',
      };
    }
  });

  // 写入文件
  ipcMain.handle(
    'file:write',
    async (_event, filePath: string, content: string): Promise<FileResult> => {
      try {
        await fs.writeFile(filePath, content, 'utf-8');
        return { success: true };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : '写入文件失败',
        };
      }
    },
  );
}
