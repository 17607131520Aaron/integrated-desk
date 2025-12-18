/**
 * IPC 处理器注册中心
 */

import { registerSystemHandlers } from './system';
import { registerFileHandlers } from './file';
import { registerWindowHandlers } from './window';
import { registerAppHandlers } from './app';

/**
 * 注册所有 IPC 处理器
 */
export function registerIpcHandlers(): void {
  registerSystemHandlers();
  registerFileHandlers();
  registerWindowHandlers();
  registerAppHandlers();
}
