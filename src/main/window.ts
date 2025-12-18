/**
 * 窗口管理模块
 */

import { BrowserWindow, shell } from 'electron';
import path from 'node:path';

// 声明 Vite 注入的全局变量
declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string | undefined;
declare const MAIN_WINDOW_VITE_NAME: string;

let mainWindow: BrowserWindow | null = null;

/**
 * 创建主窗口
 */
export function createMainWindow(): BrowserWindow {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    show: false, // 先隐藏，等待 ready-to-show
    frame: true, // 使用系统边框，如需自定义设为 false
    titleBarStyle: 'default',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
    },
  });

  // 窗口准备好后显示，避免白屏
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  // 加载页面
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
    );
  }

  // 开发环境打开 DevTools
  if (process.env.NODE_ENV === 'development' || MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.webContents.openDevTools();
  }

  // 窗口最大化/还原事件
  mainWindow.on('maximize', () => {
    mainWindow?.webContents.send('window:maximized');
  });

  mainWindow.on('unmaximize', () => {
    mainWindow?.webContents.send('window:unmaximized');
  });

  // 拦截新窗口打开，使用系统浏览器
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // 窗口关闭时清理引用
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  return mainWindow;
}

/**
 * 获取主窗口实例
 */
export function getMainWindow(): BrowserWindow | null {
  return mainWindow;
}
