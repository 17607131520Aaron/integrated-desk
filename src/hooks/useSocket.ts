/**
 * useSocket Hook
 * 通用 Socket 连接管理，整合连接、事件监听、消息发送功能
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import type { ManagerOptions, SocketOptions as IOSocketOptions } from 'socket.io-client';

// ============ 类型定义 ============

/** 连接状态 */
export type ConnectionState = 'connecting' | 'connected' | 'disconnected' | 'error';

/** Socket 配置选项 */
export interface UseSocketOptions {
  /** 服务器 URL */
  url: string;
  /** Socket.io 路径 */
  path?: string;
  /** 是否自动连接，默认 true */
  autoConnect?: boolean;
  /** 是否启用重连，默认 true */
  reconnection?: boolean;
  /** 重连尝试次数，默认 3 */
  reconnectionAttempts?: number;
  /** 重连延迟（毫秒），默认 1000 */
  reconnectionDelay?: number;
  /** 最大重连延迟（毫秒），默认 5000 */
  reconnectionDelayMax?: number;
  /** 连接超时（毫秒），默认 20000 */
  timeout?: number;
  /** 认证信息 */
  auth?: Record<string, unknown>;
  /** 查询参数 */
  query?: Record<string, string>;
  /** 额外请求头 */
  extraHeaders?: Record<string, string>;
}

/** Emit 结果 */
export interface EmitResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/** useSocket 返回值 */
export interface UseSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: Error | null;
  connectionState: ConnectionState;
  connect: () => void;
  disconnect: () => void;
  on: <T = unknown>(event: string, callback: (data: T) => void) => () => void;
  off: (event: string, callback?: (...args: unknown[]) => void) => void;
  emit: (event: string, data?: unknown) => void;
  emitWithAck: <T = unknown>(event: string, data?: unknown, timeout?: number) => Promise<EmitResult<T>>;
}

// ============ Socket 管理器 ============

interface SocketInstance {
  socket: Socket;
  refCount: number;
  disconnectTimer: ReturnType<typeof setTimeout> | null;
}

const socketInstances = new Map<string, SocketInstance>();
const DISCONNECT_DELAY = 5000;
const DEFAULT_ACK_TIMEOUT = 5000;

function getOrCreateSocket(url: string, options?: Partial<ManagerOptions & IOSocketOptions>): Socket {
  const existing = socketInstances.get(url);
  if (existing) {
    if (existing.disconnectTimer) {
      clearTimeout(existing.disconnectTimer);
      existing.disconnectTimer = null;
    }
    existing.refCount++;
    return existing.socket;
  }

  const socket = io(url, { autoConnect: false, ...options });
  socketInstances.set(url, { socket, refCount: 1, disconnectTimer: null });
  return socket;
}

function releaseSocket(url: string): void {
  const instance = socketInstances.get(url);
  if (!instance) return;
  instance.refCount--;
  if (instance.refCount <= 0) {
    instance.disconnectTimer = setTimeout(() => {
      instance.socket.disconnect();
      socketInstances.delete(url);
    }, DISCONNECT_DELAY);
  }
}

// ============ Hook 实现 ============

export function useSocket(options: UseSocketOptions): UseSocketReturn {
  const { url, autoConnect = true, ...opts } = options;
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const [error, setError] = useState<Error | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const s = getOrCreateSocket(url, {
      path: opts.path,
      reconnection: opts.reconnection ?? true,
      reconnectionAttempts: opts.reconnectionAttempts ?? 3,
      reconnectionDelay: opts.reconnectionDelay ?? 1000,
      reconnectionDelayMax: opts.reconnectionDelayMax ?? 5000,
      timeout: opts.timeout ?? 20000,
      auth: opts.auth,
      query: opts.query,
      extraHeaders: opts.extraHeaders,
    });
    socketRef.current = s;
    setSocket(s);

    const onConnect = () => { setConnectionState('connected'); setError(null); };
    const onDisconnect = () => setConnectionState('disconnected');
    const onError = (e: Error) => { setConnectionState('error'); setError(e); };
    const onReconnect = () => setConnectionState('connecting');

    s.on('connect', onConnect);
    s.on('disconnect', onDisconnect);
    s.on('connect_error', onError);
    s.io.on('reconnect_attempt', onReconnect);

    if (s.connected) setConnectionState('connected');
    else if (autoConnect) { setConnectionState('connecting'); s.connect(); }

    return () => {
      s.off('connect', onConnect);
      s.off('disconnect', onDisconnect);
      s.off('connect_error', onError);
      s.io.off('reconnect_attempt', onReconnect);
      releaseSocket(url);
    };
  }, [url, autoConnect, opts.path, opts.reconnection, opts.reconnectionAttempts,
      opts.reconnectionDelay, opts.reconnectionDelayMax, opts.timeout,
      opts.auth, opts.query, opts.extraHeaders]);

  const connect = useCallback(() => {
    if (socketRef.current && !socketRef.current.connected) {
      setConnectionState('connecting');
      socketRef.current.connect();
    }
  }, []);

  const disconnect = useCallback(() => {
    socketRef.current?.connected && socketRef.current.disconnect();
  }, []);

  const on = useCallback(<T,>(event: string, cb: (data: T) => void) => {
    socketRef.current?.on(event, cb as (...args: unknown[]) => void);
    return () => { socketRef.current?.off(event, cb as (...args: unknown[]) => void); };
  }, []);

  const off = useCallback((event: string, cb?: (...args: unknown[]) => void) => {
    cb ? socketRef.current?.off(event, cb) : socketRef.current?.off(event);
  }, []);

  const emit = useCallback((event: string, data?: unknown) => {
    if (!socketRef.current?.connected) {
      console.warn(`[useSocket] Cannot emit "${event}": not connected`);
      return;
    }
    socketRef.current.emit(event, data);
  }, []);

  const emitWithAck = useCallback(<T,>(event: string, data?: unknown, timeout = DEFAULT_ACK_TIMEOUT): Promise<EmitResult<T>> => {
    return new Promise((resolve) => {
      if (!socketRef.current?.connected) {
        resolve({ success: false, error: 'Socket not connected' });
        return;
      }
      const tid = setTimeout(() => resolve({ success: false, error: `Timeout ${timeout}ms` }), timeout);
      socketRef.current.emit(event, data, (res: T) => { clearTimeout(tid); resolve({ success: true, data: res }); });
    });
  }, []);

  return { socket, isConnected: connectionState === 'connected', isConnecting: connectionState === 'connecting',
    error, connectionState, connect, disconnect, on, off, emit, emitWithAck };
}
