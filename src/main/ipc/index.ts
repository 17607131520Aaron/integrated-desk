/**
 * IPC 处理器注册中心
 */

import { registerAppHandlers } from './app';
import { registerFileHandlers } from './file';
import { registerSystemHandlers } from './system';
import { registerWindowHandlers } from './window';

/**
 * 注册所有 IPC 处理器
 */
export function registerIpcHandlers(): void {
  registerSystemHandlers();
  registerFileHandlers();
  registerWindowHandlers();
  registerAppHandlers();
}
