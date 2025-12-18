/**
 * This file will automatically be loaded by vite and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/tutorial/process-model
 *
 * By default, Node.js integration in this file is disabled. When enabling Node.js integration
 * in a renderer process, please be aware of potential security implications. You can read
 * more about security risks here:
 *
 * https://electronjs.org/docs/tutorial/security
 *
 * To enable Node.js integration in this file, open up `main.ts` and enable the `nodeIntegration`
 * flag:
 *
 * ```
 *  // Create the browser window.
 *  mainWindow = new BrowserWindow({
 *    width: 800,
 *    height: 600,
 *    webPreferences: {
 *      nodeIntegration: true
 *    }
 *  });
 * ```
 */

import { Suspense } from 'react';

import { createRoot } from 'react-dom/client';

import { ConfigProvider } from 'antd';
import ZhCN from 'antd/locale/zh_CN';
import { RouterProvider } from 'react-router-dom';

import routers from './router';
import './renderer.scss';

const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);

root.render(
  <ConfigProvider locale={ZhCN}>
    <Suspense fallback={<div>...加载中</div>}>
      <RouterProvider router={routers} />
    </Suspense>
  </ConfigProvider>,
);
