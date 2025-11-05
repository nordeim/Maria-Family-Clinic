// Real-time availability WebSocket integration
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface WebSocketConfig {
  url?: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  heartbeatInterval?: number;
}

interface AvailabilityUpdate {
  type: 'availability_update' | 'booking_conflict' | 'waitlist_update' | 'capacity_change';
  serviceId?: string;
  clinicId?: string;
  doctorId?: string;
  data: any;
  timestamp: string;
}

export function useRealTimeAvailability(config: WebSocketConfig = {}) {
  const {
    url = 'ws://localhost:3000/api/availability/ws',
    reconnectInterval = 3000,
    maxReconnectAttempts = 5,
    heartbeatInterval = 30000
  } = config;

  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const [lastMessage, setLastMessage] = useState<AvailabilityUpdate | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const queryClient = useQueryClient();

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    setConnectionStatus('connecting');

    try {
      // For demo purposes, we'll simulate WebSocket with polling
      // In production, you'd connect to actual WebSocket server
      wsRef.current = createMockWebSocket();

      wsRef.current.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setConnectionStatus('connected');
        setReconnectAttempts(0);
        setLastMessage(null);

        // Start heartbeat
        startHeartbeat();
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data: AvailabilityUpdate = JSON.parse(event.data);
          setLastMessage(data);
          
          // Update query cache based on message type
          handleAvailabilityUpdate(data);
          
          // Reset heartbeat on new message
          resetHeartbeat();
        } catch (error) {
          console.error('WebSocket message parsing error:', error);
        }
      };

      wsRef.current.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        setConnectionStatus('disconnected');
        cleanupHeartbeat();
        
        // Attempt reconnection
        if (reconnectAttempts < maxReconnectAttempts) {
          scheduleReconnect();
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionStatus('error');
      };

    } catch (error) {
      console.error('WebSocket connection failed:', error);
      setConnectionStatus('error');
      scheduleReconnect();
    }
  }, [reconnectAttempts, maxReconnectAttempts]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    cleanupHeartbeat();
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    setIsConnected(false);
    setConnectionStatus('disconnected');
  }, []);

  const scheduleReconnect = useCallback(() => {
    if (reconnectAttempts >= maxReconnectAttempts) {
      console.log('Max reconnection attempts reached');
      return;
    }

    reconnectTimeoutRef.current = setTimeout(() => {
      setReconnectAttempts(prev => prev + 1);
      connect();
    }, reconnectInterval);
  }, [connect, reconnectInterval, reconnectAttempts, maxReconnectAttempts]);

  const startHeartbeat = useCallback(() => {
    heartbeatTimeoutRef.current = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
      }
    }, heartbeatInterval);
  }, [heartbeatInterval]);

  const cleanupHeartbeat = useCallback(() => {
    if (heartbeatTimeoutRef.current) {
      clearInterval(heartbeatTimeoutRef.current);
      heartbeatTimeoutRef.current = null;
    }
  }, []);

  const resetHeartbeat = useCallback(() => {
    cleanupHeartbeat();
    startHeartbeat();
  }, [cleanupHeartbeat, startHeartbeat]);

  const handleAvailabilityUpdate = useCallback((update: AvailabilityUpdate) => {
    // Update React Query cache for different data types
    switch (update.type) {
      case 'availability_update':
        // Invalidate availability queries to trigger refresh
        queryClient.invalidateQueries({ queryKey: ['availability'] });
        break;
      case 'capacity_change':
        // Update capacity-specific queries
        queryClient.invalidateQueries({ queryKey: ['capacity', update.serviceId, update.clinicId] });
        break;
      case 'booking_conflict':
        // Handle conflict notifications
        queryClient.setQueryData(['conflicts'], (old: any) => [...(old || []), update]);
        break;
      case 'waitlist_update':
        // Update waitlist data
        queryClient.invalidateQueries({ queryKey: ['waitlist', update.serviceId, update.clinicId] });
        break;
    }
  }, [queryClient]);

  const subscribeToUpdates = useCallback((filters: {
    serviceId?: string;
    clinicId?: string;
    doctorId?: string;
  }) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'subscribe',
        ...filters
      }));
    }
  }, []);

  const unsubscribe = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'unsubscribe' }));
    }
  }, []);

  // Mock WebSocket implementation for demo
  const createMockWebSocket = () => {
    const mockWs = {
      readyState: WebSocket.CONNECTING,
      send: (data: string) => {
        console.log('Mock WebSocket send:', data);
        // Simulate server responses
        setTimeout(() => {
          const message = JSON.parse(data);
          if (message.type === 'subscribe') {
            // Simulate capacity update after subscription
            setTimeout(() => {
              const mockUpdate: AvailabilityUpdate = {
                type: 'capacity_change',
                serviceId: message.serviceId,
                clinicId: message.clinicId,
                data: {
                  utilizationRate: Math.random() * 100,
                  availableSlots: Math.floor(Math.random() * 20),
                  status: 'available'
                },
                timestamp: new Date().toISOString()
              };
              
              // Simulate onmessage
              mockWs.onmessage?.({ data: JSON.stringify(mockUpdate) });
            }, 1000);
          }
        }, 100);
      },
      close: () => {
        mockWs.readyState = WebSocket.CLOSED;
        mockWs.onclose?.({} as CloseEvent);
      },
      addEventListener: (event: string, handler: Function) => {
        (mockWs as any)[`on${event}`] = handler;
        if (event === 'open') {
          setTimeout(() => {
            mockWs.readyState = WebSocket.OPEN;
            handler({} as Event);
          }, 500);
        }
      },
      onopen: null as Function | null,
      onmessage: null as Function | null,
      onclose: null as Function | null,
      onerror: null as Function | null
    } as WebSocket;

    return mockWs;
  };

  // Auto-connect on mount
  useEffect(() => {
    connect();

    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  // Handle visibility changes for connection management
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Pause connection when tab is hidden
        disconnect();
      } else {
        // Resume connection when tab becomes visible
        connect();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [connect, disconnect]);

  return {
    isConnected,
    connectionStatus,
    lastMessage,
    reconnectAttempts,
    connect,
    disconnect,
    subscribeToUpdates,
    unsubscribe
  };
}

// Hook for handling offline availability data
export function useOfflineAvailability() {
  const [offlineData, setOfflineData] = useState<any[]>([]);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      // Sync offline data with server when coming back online
      syncOfflineData();
    };

    const handleOffline = () => {
      setIsOffline(true);
      // Load cached data when going offline
      loadCachedData();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial state
    setIsOffline(!navigator.onLine);
    if (!navigator.onLine) {
      loadCachedData();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadCachedData = useCallback(async () => {
    try {
      const cached = localStorage.getItem('availability_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        setOfflineData(parsed);
      }
    } catch (error) {
      console.error('Failed to load cached availability data:', error);
    }
  }, []);

  const syncOfflineData = useCallback(async () => {
    try {
      // Sync any pending offline actions
      const pendingActions = localStorage.getItem('pending_availability_actions');
      if (pendingActions) {
        const actions = JSON.parse(pendingActions);
        for (const action of actions) {
          try {
            await fetch('/api/availability', {
              method: action.method,
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(action.data)
            });
          } catch (error) {
            console.error('Failed to sync offline action:', error);
          }
        }
        // Clear pending actions after successful sync
        localStorage.removeItem('pending_availability_actions');
      }

      // Refresh online data
      const response = await fetch('/api/availability?serviceId=service-1&clinicId=clinic-1');
      const data = await response.json();
      setOfflineData(data);

    } catch (error) {
      console.error('Failed to sync offline data:', error);
    }
  }, []);

  return {
    offlineData,
    isOffline,
    loadCachedData,
    syncOfflineData
  };
}