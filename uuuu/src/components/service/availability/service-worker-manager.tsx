// Service Worker registration for availability caching
'use client';

import { useEffect } from 'react';

interface ServiceWorkerConfig {
  enableOffline?: boolean;
  enablePushNotifications?: boolean;
  cacheTimeout?: number;
}

export function useServiceWorker(config: ServiceWorkerConfig = {}) {
  const {
    enableOffline = true,
    enablePushNotifications = false,
    cacheTimeout = 300000 // 5 minutes
  } = config;

  useEffect(() => {
    if ('serviceWorker' in navigator && enableOffline) {
      const registerServiceWorker = async () => {
        try {
          // Register the availability service worker
          const registration = await navigator.serviceWorker.register('/sw-availability.js', {
            scope: '/'
          });

          console.log('Service Worker registered successfully:', registration);

          // Handle updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New version available
                  console.log('New version available');
                  // Optionally show update prompt to user
                }
              });
            }
          });

          // Configure push notifications if enabled
          if (enablePushNotifications && 'Notification' in window) {
            // Request notification permission
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
              console.log('Notification permission granted');
              // Subscribe to push notifications
              // This would typically involve VAPID keys and a push service
            }
          }

          // Periodic cache cleanup
          const cleanupInterval = setInterval(async () => {
            const caches = await caches.keys();
            const availabilityCache = caches.find(name => name.includes('availability'));
            if (availabilityCache) {
              const cache = await caches.open(availabilityCache);
              const keys = await cache.keys();
              
              // Remove stale entries
              const now = Date.now();
              for (const request of keys) {
                const response = await cache.match(request);
                if (response) {
                  const dateHeader = response.headers.get('date');
                  if (dateHeader) {
                    const responseTime = new Date(dateHeader).getTime();
                    if (now - responseTime > cacheTimeout) {
                      await cache.delete(request);
                    }
                  }
                }
              }
            }
          }, cacheTimeout);

          return () => clearInterval(cleanupInterval);

        } catch (error) {
          console.error('Service Worker registration failed:', error);
        }
      };

      registerServiceWorker();
    }
  }, [enableOffline, enablePushNotifications, cacheTimeout]);

  // Function to manually trigger service worker sync
  const triggerBackgroundSync = async () => {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await registration.sync.register('availability-sync');
        console.log('Background sync registered');
      } catch (error) {
        console.error('Background sync failed:', error);
      }
    }
  };

  // Function to send message to service worker
  const sendMessageToSW = (message: any) => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage(message);
    }
  };

  return {
    triggerBackgroundSync,
    sendMessageToSW,
    isSupported: 'serviceWorker' in navigator
  };
}

// Component to manage service worker registration
export default function ServiceWorkerManager({ config }: { config: ServiceWorkerConfig }) {
  useServiceWorker(config);
  return null; // This is a management component with no UI
}