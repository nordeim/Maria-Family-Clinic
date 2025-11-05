// Service Worker for Offline Availability Caching
// /public/sw-availability.js

const CACHE_NAME = 'availability-cache-v1';
const API_CACHE_PREFIX = 'availability:';

// Cache configuration
const CONFIG = {
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
  maxEntries: 100,
  backgroundSync: true,
  enableCompression: true,
};

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker installing for availability caching');
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/offline-availability.html',
        '/api/notifications/subscribe',
      ]);
    })
  );
  
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating for availability caching');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName.startsWith(API_CACHE_PREFIX)) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Take control of all clients
      self.clients.claim()
    ])
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Only handle availability-related requests
  if (url.pathname.startsWith('/api/availability') || 
      url.pathname.startsWith('/api/wait-time-estimate') ||
      url.pathname.startsWith('/api/cache/availability')) {
    
    event.respondWith(handleAvailabilityRequest(request));
  }
});

// Handle availability requests with caching strategy
async function handleAvailabilityRequest(request) {
  const url = new URL(request.url);
  const cacheKey = generateCacheKey(request);
  
  try {
    // Try cache first (cache-first strategy)
    const cachedResponse = await getCachedResponse(cacheKey);
    
    if (cachedResponse && !isDataStale(cachedResponse)) {
      // Update cache in background if needed
      if (shouldRefreshInBackground(cachedResponse)) {
        backgroundUpdateCache(request, cacheKey);
      }
      
      return cachedResponse;
    }
    
    // Cache miss or stale, fetch from network
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache the successful response
      await cacheResponse(cacheKey, networkResponse.clone());
    }
    
    return networkResponse;
    
  } catch (error) {
    console.error('Availability request failed:', error);
    
    // Network failed, try to return stale cache as fallback
    const staleCache = await getStaleCachedResponse(cacheKey);
    if (staleCache) {
      return staleCache;
    }
    
    // Return offline page or error response
    return new Response(
      JSON.stringify({ 
        error: 'Offline', 
        message: 'Availability data unavailable offline',
        fallback: true 
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Generate cache key from request
function generateCacheKey(request) {
  const url = new URL(request.url);
  const params = new URLSearchParams(url.search);
  
  const parts = ['availability'];
  
  if (params.get('serviceId')) parts.push(params.get('serviceId'));
  if (params.get('clinicId')) parts.push(params.get('clinicId'));
  if (params.get('doctorId')) parts.push(params.get('doctorId'));
  
  return parts.join(':');
}

// Get cached response
async function getCachedResponse(cacheKey) {
  const cache = await caches.open(CACHE_NAME);
  const response = await cache.match(`${API_CACHE_PREFIX}${cacheKey}`);
  
  if (response) {
    const cachedData = await response.json();
    const now = new Date();
    const expiresAt = new Date(cachedData.expiresAt);
    
    if (expiresAt > now) {
      return response;
    }
  }
  
  return null;
}

// Get stale cached response (for offline fallback)
async function getStaleCachedResponse(cacheKey) {
  const cache = await caches.open(CACHE_NAME);
  const response = await cache.match(`${API_CACHE_PREFIX}${cacheKey}`);
  
  if (response) {
    return response;
  }
  
  return null;
}

// Cache response
async function cacheResponse(cacheKey, response) {
  try {
    const cache = await caches.open(CACHE_NAME);
    
    // Clone response for caching
    const responseClone = response.clone();
    
    // Get response data for metadata
    const responseData = await response.json();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + CONFIG.maxAge);
    
    const cachedData = {
      data: responseData,
      cachedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      metadata: {
        url: response.url,
        status: response.status,
        size: response.headers.get('content-length') || 'unknown',
      }
    };
    
    // Create response for cache
    const cacheResponse = new Response(JSON.stringify(cachedData), {
      headers: {
        'Content-Type': 'application/json',
        'X-Cache-Key': cacheKey,
        'X-Cached-At': now.toISOString(),
        'X-Expires-At': expiresAt.toISOString(),
      }
    });
    
    await cache.put(`${API_CACHE_PREFIX}${cacheKey}`, cacheResponse);
    
    // Clean up old entries if cache is getting full
    await cleanupOldEntries();
    
  } catch (error) {
    console.error('Failed to cache response:', error);
  }
}

// Check if data is stale
function isDataStale(cachedResponse) {
  // This function would parse the cached response and check the expiry
  // Implementation depends on how you structure your cached data
  return false;
}

// Check if background refresh is needed
function shouldRefreshInBackground(cachedResponse) {
  // Refresh if data is close to expiry (within last 25% of cache life)
  // This is a simplified check - you'd implement the actual logic
  return Math.random() < 0.1; // 10% chance
}

// Background update cache
async function backgroundUpdateCache(request, cacheKey) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      await cacheResponse(cacheKey, networkResponse.clone());
      
      // Notify clients of cache update
      const clients = await self.clients.matchAll();
      clients.forEach(client => {
        client.postMessage({
          type: 'CACHE_UPDATE',
          payload: {
            cacheKey,
            data: await networkResponse.json(),
          }
        });
      });
    }
  } catch (error) {
    console.error('Background cache update failed:', error);
  }
}

// Clean up old cache entries
async function cleanupOldEntries() {
  try {
    const cache = await caches.open(CACHE_NAME);
    const keys = await cache.keys();
    
    if (keys.length > CONFIG.maxEntries) {
      // Sort by creation time (would need to store this in metadata)
      // For now, just delete oldest entries
      const keysToDelete = keys.slice(0, keys.length - CONFIG.maxEntries);
      
      await Promise.all(
        keysToDelete.map(key => cache.delete(key))
      );
      
      console.log(`Cleaned up ${keysToDelete.length} old cache entries`);
    }
  } catch (error) {
    console.error('Cache cleanup failed:', error);
  }
}

// Handle messages from main thread
self.addEventListener('message', (event) => {
  const { type, payload } = event.data;
  
  switch (type) {
    case 'CACHE_AVAILABILITY_DATA':
      handleCacheDataMessage(payload);
      break;
      
    case 'GET_CACHE_STATS':
      getCacheStats().then(stats => {
        event.ports[0].postMessage({ type: 'CACHE_STATS', stats });
      });
      break;
      
    case 'CLEAR_CACHE':
      clearCache().then(() => {
        event.ports[0].postMessage({ type: 'CACHE_CLEARED' });
      });
      break;
      
    default:
      console.log('Unknown message type:', type);
  }
});

// Handle caching availability data
async function handleCacheDataMessage(data) {
  const { cacheKey, data: availabilityData, expiresIn } = data;
  
  try {
    const cache = await caches.open(CACHE_NAME);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + (expiresIn || CONFIG.maxAge));
    
    const cachedData = {
      ...availabilityData,
      cachedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      source: 'manual',
    };
    
    const response = new Response(JSON.stringify(cachedData), {
      headers: {
        'Content-Type': 'application/json',
        'X-Cache-Key': cacheKey,
        'X-Cached-At': now.toISOString(),
        'X-Expires-At': expiresAt.toISOString(),
      }
    });
    
    await cache.put(`${API_CACHE_PREFIX}${cacheKey}`, response);
    
    // Notify all clients
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'CACHE_UPDATED',
        payload: { cacheKey, data: cachedData }
      });
    });
    
  } catch (error) {
    console.error('Failed to cache availability data:', error);
  }
}

// Get cache statistics
async function getCacheStats() {
  try {
    const cache = await caches.open(CACHE_NAME);
    const keys = await cache.keys();
    
    let totalSize = 0;
    let validEntries = 0;
    const now = new Date();
    
    for (const key of keys) {
      const response = await cache.match(key);
      if (response) {
        const data = await response.json();
        const expiresAt = new Date(data.expiresAt);
        
        if (expiresAt > now) {
          validEntries++;
        }
        
        totalSize += JSON.stringify(data).length;
      }
    }
    
    return {
      totalEntries: keys.length,
      validEntries,
      totalSize,
      hitRate: 0.75, // Would be calculated from actual usage
      lastSync: new Date().toISOString(),
    };
    
  } catch (error) {
    console.error('Failed to get cache stats:', error);
    return {
      totalEntries: 0,
      validEntries: 0,
      totalSize: 0,
      hitRate: 0,
      lastSync: new Date().toISOString(),
    };
  }
}

// Clear all cache
async function clearCache() {
  try {
    const cache = await caches.open(CACHE_NAME);
    const keys = await cache.keys();
    
    await Promise.all(
      keys.map(key => cache.delete(key))
    );
    
    console.log('Cache cleared successfully');
    
  } catch (error) {
    console.error('Failed to clear cache:', error);
  }
}

// Background sync for pending cache updates
self.addEventListener('sync', (event) => {
  if (event.tag === 'availability-cache-sync') {
    event.waitUntil(syncPendingUpdates());
  }
});

// Sync pending updates when back online
async function syncPendingUpdates() {
  try {
    // Get pending updates from IndexedDB or localStorage
    // This would contain requests that failed while offline
    const pendingUpdates = await getPendingUpdates();
    
    for (const update of pendingUpdates) {
      try {
        const response = await fetch(update.request);
        if (response.ok) {
          // Remove from pending list
          await removePendingUpdate(update.id);
        }
      } catch (error) {
        console.error('Failed to sync update:', error);
      }
    }
    
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Get pending updates (would be implemented with IndexedDB)
async function getPendingUpdates() {
  // Implementation would fetch from IndexedDB
  return [];
}

// Remove pending update (would be implemented with IndexedDB)
async function removePendingUpdate(id) {
  // Implementation would remove from IndexedDB
}