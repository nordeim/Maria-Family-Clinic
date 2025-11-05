"use client";

import { useState, useEffect, useCallback, useRef } from 'react';

export interface OfflineAvailabilityData {
  serviceId: string;
  clinicId?: string;
  doctorId?: string;
  cachedAt: string;
  expiresAt: string;
  data: any;
  metadata: {
    version: string;
    lastUpdated: string;
    cacheSize: number;
    source: 'cache' | 'network' | 'fallback';
  };
}

export interface CacheConfiguration {
  maxAge: number; // milliseconds
  maxEntries: number;
  excludePatterns: string[];
  includePatterns: string[];
  backgroundSync: boolean;
  compressionEnabled: boolean;
}

export interface CacheStats {
  totalEntries: number;
  totalSize: number;
  hitRate: number;
  lastSync: string;
  networkStatus: 'online' | 'offline' | 'slow';
  pendingUpdates: number;
}

interface UseOfflineAvailabilityCacheOptions {
  serviceId: string;
  clinicId?: string;
  doctorId?: string;
  config?: Partial<CacheConfiguration>;
  onCacheUpdate?: (stats: CacheStats) => void;
  onNetworkStatusChange?: (status: 'online' | 'offline') => void;
}

export function useOfflineAvailabilityCache(options: UseOfflineAvailabilityCacheOptions) {
  const {
    serviceId,
    clinicId,
    doctorId,
    config = {},
    onCacheUpdate,
    onNetworkStatusChange,
  } = options;

  const [cacheData, setCacheData] = useState<OfflineAvailabilityData | null>(null);
  const [isCacheAvailable, setIsCacheAvailable] = useState(false);
  const [networkStatus, setNetworkStatus] = useState<'online' | 'offline' | 'slow'>('online');
  const [isLoading, setIsLoading] = useState(false);
  const [cacheStats, setCacheStats] = useState<CacheStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  const serviceWorkerRef = useRef<ServiceWorker | null>(null);
  const registrationRef = useRef<ServiceWorkerRegistration | null>(null);

  // Default configuration
  const defaultConfig: CacheConfiguration = {
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    maxEntries: 100,
    excludePatterns: [],
    includePatterns: [],
    backgroundSync: true,
    compressionEnabled: true,
  };

  const finalConfig = { ...defaultConfig, ...config };

  // Generate cache key
  const generateCacheKey = useCallback(() => {
    const parts = ['availability', serviceId];
    if (clinicId) parts.push(clinicId);
    if (doctorId) parts.push(doctorId);
    return parts.join(':');
  }, [serviceId, clinicId, doctorId]);

  // Register service worker for caching
  const registerServiceWorker = useCallback(async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw-availability.js');
        registrationRef.current = registration;

        // Listen for messages from service worker
        navigator.serviceWorker.addEventListener('message', (event) => {
          if (event.data.type === 'CACHE_UPDATE') {
            handleCacheUpdate(event.data.payload);
          } else if (event.data.type === 'NETWORK_STATUS') {
            setNetworkStatus(event.data.status);
            onNetworkStatusChange?.(event.data.status);
          }
        });

        serviceWorkerRef.current = registration.active;

        return registration;
      } catch (error) {
        console.error('Service worker registration failed:', error);
        setError('Failed to register service worker');
      }
    } else {
      setError('Service workers not supported');
    }
  }, [onNetworkStatusChange]);

  // Load data from cache
  const loadFromCache = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const cacheKey = generateCacheKey();
      
      // Try to get data from service worker cache first
      if (registrationRef.current) {
        const response = await fetch(`/api/cache/availability/${cacheKey}`, {
          method: 'GET',
          headers: { 'X-Requested-With': 'offline-cache' },
        });

        if (response.ok) {
          const data = await response.json();
          
          // Check if data is still valid
          const now = new Date();
          const expiresAt = new Date(data.expiresAt);
          
          if (expiresAt > now) {
            setCacheData(data);
            setIsCacheAvailable(true);
            updateCacheStats('hit');
          } else {
            setIsCacheAvailable(false);
            updateCacheStats('expired');
          }
        } else {
          setIsCacheAvailable(false);
          updateCacheStats('miss');
        }
      } else {
        // Fallback to localStorage if service worker not available
        const cached = localStorage.getItem(`cache:${cacheKey}`);
        if (cached) {
          const data = JSON.parse(cached) as OfflineAvailabilityData;
          const now = new Date();
          const expiresAt = new Date(data.expiresAt);
          
          if (expiresAt > now) {
            setCacheData(data);
            setIsCacheAvailable(true);
            updateCacheStats('hit');
          } else {
            setIsCacheAvailable(false);
            updateCacheStats('expired');
          }
        } else {
          setIsCacheAvailable(false);
          updateCacheStats('miss');
        }
      }
    } catch (error) {
      console.error('Failed to load from cache:', error);
      setError('Failed to load cached data');
      setIsCacheAvailable(false);
      updateCacheStats('error');
    } finally {
      setIsLoading(false);
    }
  }, [generateCacheKey]);

  // Save data to cache
  const saveToCache = useCallback(async (data: any, source: 'network' | 'manual' = 'network') => {
    try {
      const cacheKey = generateCacheKey();
      const now = new Date();
      const expiresAt = new Date(now.getTime() + finalConfig.maxAge);

      const offlineData: OfflineAvailabilityData = {
        serviceId,
        clinicId,
        doctorId,
        cachedAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
        data,
        metadata: {
          version: '1.0.0',
          lastUpdated: now.toISOString(),
          cacheSize: JSON.stringify(data).length,
          source,
        },
      };

      // Save to service worker cache
      if (registrationRef.current) {
        await fetch(`/api/cache/availability/${cacheKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(offlineData),
        });
      } else {
        // Fallback to localStorage
        localStorage.setItem(`cache:${cacheKey}`, JSON.stringify(offlineData));
        
        // Clean up old entries if necessary
        await cleanupOldCacheEntries();
      }

      setCacheData(offlineData);
      setIsCacheAvailable(true);
      updateCacheStats('updated');
      
    } catch (error) {
      console.error('Failed to save to cache:', error);
      setError('Failed to cache data');
    }
  }, [serviceId, clinicId, doctorId, generateCacheKey, finalConfig.maxAge]);

  // Clear cache
  const clearCache = useCallback(async () => {
    try {
      const cacheKey = generateCacheKey();
      
      // Clear from service worker cache
      if (registrationRef.current) {
        await fetch(`/api/cache/availability/${cacheKey}`, {
          method: 'DELETE',
        });
      } else {
        // Clear from localStorage
        localStorage.removeItem(`cache:${cacheKey}`);
      }

      setCacheData(null);
      setIsCacheAvailable(false);
      updateCacheStats('cleared');
    } catch (error) {
      console.error('Failed to clear cache:', error);
      setError('Failed to clear cache');
    }
  }, [generateCacheKey]);

  // Handle cache updates from service worker
  const handleCacheUpdate = useCallback((payload: any) => {
    if (payload.cacheKey === generateCacheKey()) {
      setCacheData(payload.data);
      setIsCacheAvailable(true);
    }
  }, [generateCacheKey]);

  // Update cache statistics
  const updateCacheStats = useCallback(async (action: CacheStats['hitRate'] extends number ? 'hit' | 'miss' | 'updated' | 'expired' | 'error' | 'cleared' : any) => {
    try {
      const stats = await getCacheStats();
      setCacheStats(stats);
      onCacheUpdate?.(stats);
    } catch (error) {
      console.error('Failed to update cache stats:', error);
    }
  }, [onCacheUpdate]);

  // Get cache statistics
  const getCacheStats = useCallback(async (): Promise<CacheStats> => {
    try {
      // Get stats from service worker or localStorage
      let totalEntries = 0;
      let totalSize = 0;
      let hitRate = 0;
      let lastSync = '';
      let pendingUpdates = 0;

      if (registrationRef.current) {
        const response = await fetch('/api/cache/stats');
        if (response.ok) {
          const stats = await response.json();
          return stats;
        }
      }

      // Fallback: calculate from localStorage
      const cacheKeys = Object.keys(localStorage).filter(key => key.startsWith('cache:'));
      totalEntries = cacheKeys.length;
      
      for (const key of cacheKeys) {
        const item = localStorage.getItem(key);
        if (item) {
          totalSize += item.length;
        }
      }

      // Mock values for fallback
      hitRate = 0.75;
      lastSync = new Date().toISOString();
      pendingUpdates = 0;

      return {
        totalEntries,
        totalSize,
        hitRate: hitRate * 100,
        lastSync,
        networkStatus,
        pendingUpdates,
      };
    } catch (error) {
      console.error('Failed to get cache stats:', error);
      return {
        totalEntries: 0,
        totalSize: 0,
        hitRate: 0,
        lastSync: new Date().toISOString(),
        networkStatus,
        pendingUpdates: 0,
      };
    }
  }, [networkStatus]);

  // Clean up old cache entries
  const cleanupOldCacheEntries = useCallback(async () => {
    try {
      const now = new Date();
      const cacheKeys = Object.keys(localStorage).filter(key => key.startsWith('cache:'));
      let cleaned = 0;

      for (const key of cacheKeys) {
        const item = localStorage.getItem(key);
        if (item) {
          const data = JSON.parse(item) as OfflineAvailabilityData;
          const expiresAt = new Date(data.expiresAt);
          
          if (expiresAt < now) {
            localStorage.removeItem(key);
            cleaned++;
          }
        }
      }

      // Also limit total entries if exceeding max
      const remainingKeys = Object.keys(localStorage).filter(key => key.startsWith('cache:'));
      if (remainingKeys.length > finalConfig.maxEntries) {
        // Remove oldest entries
        remainingKeys.sort((a, b) => {
          const dataA = JSON.parse(localStorage.getItem(a) || '{}') as OfflineAvailabilityData;
          const dataB = JSON.parse(localStorage.getItem(b) || '{}') as OfflineAvailabilityData;
          return new Date(dataA.cachedAt).getTime() - new Date(dataB.cachedAt).getTime();
        });

        const toRemove = remainingKeys.length - finalConfig.maxEntries;
        for (let i = 0; i < toRemove; i++) {
          localStorage.removeItem(remainingKeys[i]);
        }
      }

      console.log(`Cleaned up ${cleaned} expired cache entries`);
    } catch (error) {
      console.error('Failed to cleanup cache entries:', error);
    }
  }, [finalConfig.maxEntries]);

  // Network status monitoring
  const monitorNetworkStatus = useCallback(() => {
    const updateStatus = () => {
      const status = navigator.onLine ? 'online' : 'offline';
      setNetworkStatus(status);
      onNetworkStatusChange?.(status);
    };

    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);

    // Initial status
    updateStatus();

    return () => {
      window.removeEventListener('online', updateStatus);
      window.removeEventListener('offline', updateStatus);
    };
  }, [onNetworkStatusChange]);

  // Initialize cache system
  useEffect(() => {
    const init = async () => {
      await registerServiceWorker();
      await loadFromCache();
      const cleanup = monitorNetworkStatus();
      
      // Set up periodic cache cleanup
      const cleanupInterval = setInterval(cleanupOldCacheEntries, 60 * 60 * 1000); // Every hour

      return () => {
        cleanup();
        clearInterval(cleanupInterval);
      };
    };

    init();
  }, [registerServiceWorker, loadFromCache, monitorNetworkStatus, cleanupOldCacheEntries]);

  // Check if data is stale
  const isDataStale = useCallback(() => {
    if (!cacheData) return true;
    
    const now = new Date();
    const lastUpdated = new Date(cacheData.metadata.lastUpdated);
    const maxAge = finalConfig.maxAge;
    
    return (now.getTime() - lastUpdated.getTime()) > maxAge;
  }, [cacheData, finalConfig.maxAge]);

  // Force refresh from network
  const forceRefresh = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch fresh data and update cache
      const response = await fetch(`/api/availability?serviceId=${serviceId}&${clinicId ? `clinicId=${clinicId}&` : ''}${doctorId ? `doctorId=${doctorId}` : ''}`);
      
      if (response.ok) {
        const data = await response.json();
        await saveToCache(data, 'manual');
      } else {
        throw new Error('Failed to fetch fresh data');
      }
    } catch (error) {
      console.error('Force refresh failed:', error);
      setError('Failed to refresh data');
    } finally {
      setIsLoading(false);
    }
  }, [serviceId, clinicId, doctorId, saveToCache]);

  return {
    // Data
    cacheData,
    isCacheAvailable,
    networkStatus,
    isLoading,
    cacheStats,
    error,

    // Actions
    saveToCache,
    clearCache,
    forceRefresh,
    loadFromCache,
    getCacheStats,

    // Utilities
    isDataStale,
    canUseOffline: isCacheAvailable && (networkStatus === 'offline' || networkStatus === 'slow'),
    isStale: isDataStale(),
  };
}