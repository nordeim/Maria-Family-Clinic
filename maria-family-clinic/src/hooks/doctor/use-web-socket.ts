/**
 * WebSocket Hook for Real-time Scheduling Updates
 * Sub-Phase 7.5: Doctor Availability & Scheduling Integration
 * 
 * Provides WebSocket connection management for real-time doctor scheduling updates
 */

import { useState, useEffect, useCallback, useRef } from 'react';

interface WebSocketState {
  isConnected: boolean;
  error: string | null;
  reconnectAttempts: number;
  lastMessage: any;
}

interface UseWebSocketOptions {
  url: string;
  autoReconnect?: boolean;
  maxReconnectAttempts?: number;
  reconnectInterval?: number;
  heartbeatInterval?: number;
  onMessage?: (data: any) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
}

export const useWebSocket = (
  endpoint: string,
  options: Partial<UseWebSocketOptions> = {}
) => {
  const {
    autoReconnect = true,
    maxReconnectAttempts = 5,
    reconnectInterval = 3000,
    heartbeatInterval = 30000,
    onMessage,
    onConnect,
    onDisconnect,
    onError,
  } = options;

  const [wsState, setWsState] = useState<WebSocketState>({
    isConnected: false,
    error: null,
    reconnectAttempts: 0,
    lastMessage: null,
  });

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);

  const connect = useCallback(() => {
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}${endpoint}`;
      
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        setWsState(prev => ({
          ...prev,
          isConnected: true,
          error: null,
          reconnectAttempts: 0,
        }));
        reconnectAttemptsRef.current = 0;
        onConnect?.();

        // Start heartbeat
        if (heartbeatInterval > 0) {
          heartbeatIntervalRef.current = setInterval(() => {
            if (wsRef.current?.readyState === WebSocket.OPEN) {
              wsRef.current.send(JSON.stringify({ type: 'HEARTBEAT' }));
            }
          }, heartbeatInterval);
        }
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setWsState(prev => ({ ...prev, lastMessage: data }));
          onMessage?.(data);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      wsRef.current.onclose = () => {
        setWsState(prev => ({
          ...prev,
          isConnected: false,
        }));
        onDisconnect?.();

        // Clear heartbeat
        if (heartbeatIntervalRef.current) {
          clearInterval(heartbeatIntervalRef.current);
        }

        // Attempt reconnection
        if (autoReconnect && reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current += 1;
          setWsState(prev => ({
            ...prev,
            reconnectAttempts: reconnectAttemptsRef.current,
          }));

          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectInterval * Math.pow(1.5, reconnectAttemptsRef.current)); // Exponential backoff
        }
      };

      wsRef.current.onerror = (error) => {
        setWsState(prev => ({
          ...prev,
          error: 'WebSocket connection error',
        }));
        onError?.(error);
      };

    } catch (error) {
      setWsState(prev => ({
        ...prev,
        error: 'Failed to create WebSocket connection',
      }));
    }
  }, [endpoint, autoReconnect, maxReconnectAttempts, reconnectInterval, heartbeatInterval, onConnect, onDisconnect, onError, onMessage]);

  const disconnect = useCallback(() => {
    autoReconnect = false; // Disable auto-reconnect
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setWsState(prev => ({
      ...prev,
      isConnected: false,
      error: null,
    }));
  }, []);

  const sendMessage = useCallback((data: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
      return true;
    }
    return false;
  }, []);

  const reconnect = useCallback(() => {
    disconnect();
    reconnectAttemptsRef.current = 0;
    setTimeout(() => connect(), 100);
  }, [disconnect, connect]);

  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    ...wsState,
    sendMessage,
    reconnect,
    disconnect,
  };
};

export default useWebSocket;