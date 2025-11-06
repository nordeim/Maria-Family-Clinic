"use client"

import { useState, useEffect, useCallback } from 'react'

interface OfflineStorageOptions {
  enablePersistence?: boolean
  maxCacheSize?: number
  cacheExpiry?: number // in milliseconds
}

interface CachedData<T> {
  data: T
  timestamp: number
  expiresAt: number
}

export class OfflineStorageManager {
  private options: Required<OfflineStorageOptions>
  private memoryCache = new Map<string, CachedData<any>>()

  constructor(options: OfflineStorageOptions = {}) {
    this.options = {
      enablePersistence: true,
      maxCacheSize: 100, // Maximum number of items
      cacheExpiry: 30 * 60 * 1000, // 30 minutes
      ...options
    }
  }

  // Save data with offline support
  async save<T>(key: string, data: T, customExpiry?: number): Promise<void> {
    const now = Date.now()
    const expiresAt = now + (customExpiry || this.options.cacheExpiry)
    const cachedData: CachedData<T> = {
      data,
      timestamp: now,
      expiresAt
    }

    // Always store in memory cache
    this.memoryCache.set(key, cachedData)

    // Store in localStorage if persistence is enabled
    if (this.options.enablePersistence && typeof window !== 'undefined') {
      try {
        // Clean up old entries if cache is full
        if (this.memoryCache.size > this.options.maxCacheSize) {
          this.cleanupMemoryCache()
        }

        localStorage.setItem(`clinic_cache_${key}`, JSON.stringify(cachedData))
      } catch (e) {
        // localStorage might be full or disabled
        console.warn('Could not persist data to localStorage:', e)
      }
    }
  }

  // Load data with offline fallback
  async load<T>(key: string): Promise<T | null> {
    // Check memory cache first
    const memoryCached = this.memoryCache.get(key)
    if (memoryCached && !this.isExpired(memoryCached)) {
      return memoryCached.data
    }

    // Check localStorage if persistence is enabled
    if (this.options.enablePersistence && typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(`clinic_cache_${key}`)
        if (stored) {
          const cachedData: CachedData<T> = JSON.parse(stored)
          
          if (!this.isExpired(cachedData)) {
            // Restore to memory cache
            this.memoryCache.set(key, cachedData)
            return cachedData.data
          } else {
            // Remove expired data
            localStorage.removeItem(`clinic_cache_${key}`)
          }
        }
      } catch (e) {
        console.warn('Could not load data from localStorage:', e)
      }
    }

    return null
  }

  // Check if data is expired
  private isExpired(cachedData: CachedData<any>): boolean {
    return Date.now() > cachedData.expiresAt
  }

  // Clean up memory cache when it gets too large
  private cleanupMemoryCache() {
    const entries = Array.from(this.memoryCache.entries())
    
    // Sort by timestamp (oldest first)
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp)
    
    // Remove oldest entries until we're under the limit
    while (this.memoryCache.size > this.options.maxCacheSize * 0.8) { // Keep 80% of max
      const [oldestKey] = entries.shift()!
      this.memoryCache.delete(oldestKey)
    }
  }

  // Clear expired entries from localStorage
  cleanupExpired(): void {
    if (typeof window === 'undefined') return

    const keys = Object.keys(localStorage).filter(key => key.startsWith('clinic_cache_'))
    
    keys.forEach(key => {
      try {
        const stored = localStorage.getItem(key)
        if (stored) {
          const cachedData: CachedData<any> = JSON.parse(stored)
          if (this.isExpired(cachedData)) {
            localStorage.removeItem(key)
          }
        }
      } catch (e) {
        // Remove corrupted entries
        localStorage.removeItem(key)
      }
    })
  }

  // Clear all cached data
  clearAll(): void {
    this.memoryCache.clear()
    
    if (typeof window !== 'undefined') {
      const keys = Object.keys(localStorage).filter(key => key.startsWith('clinic_cache_'))
      keys.forEach(key => localStorage.removeItem(key))
    }
  }

  // Get cache statistics
  getStats(): { memorySize: number; persistenceSize: number; totalSize: number } {
    let persistenceSize = 0
    
    if (typeof window !== 'undefined') {
      const keys = Object.keys(localStorage).filter(key => key.startsWith('clinic_cache_'))
      persistenceSize = keys.length
    }

    return {
      memorySize: this.memoryCache.size,
      persistenceSize,
      totalSize: this.memoryCache.size + persistenceSize
    }
  }
}

// React hooks for offline storage
export function useOfflineStorage(options?: OfflineStorageOptions) {
  const [storage] = useState(() => new OfflineStorageManager(options))
  const [isOnline, setIsOnline] = useState(true)

  // Monitor online status
  useEffect(() => {
    if (typeof window === 'undefined') return

    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine)
    }

    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)
    
    // Initial status
    updateOnlineStatus()

    return () => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
    }
  }, [])

  // Cleanup expired data on mount and periodically
  useEffect(() => {
    storage.cleanupExpired()
    
    const interval = setInterval(() => {
      storage.cleanupExpired()
    }, 5 * 60 * 1000) // Every 5 minutes

    return () => clearInterval(interval)
  }, [storage])

  const save = useCallback(async (key: string, data: any, customExpiry?: number) => {
    return await storage.save(key, data, customExpiry)
  }, [storage])

  const load = useCallback(async <T>(key: string): Promise<T | null> => {
    return await storage.load<T>(key)
  }, [storage])

  const clearAll = useCallback(() => {
    storage.clearAll()
  }, [storage])

  const getStats = useCallback(() => {
    return storage.getStats()
  }, [storage])

  return {
    isOnline,
    save,
    load,
    clearAll,
    getStats,
    storage
  }
}

// Specific hook for clinic favorites with offline support
export function useOfflineFavorites() {
  const { save, load, isOnline } = useOfflineStorage()
  const [favorites, setFavorites] = useState<string[]>([])

  // Load favorites on mount
  useEffect(() => {
    loadFavorites()
  }, [load])

  // Save favorites when they change
  useEffect(() => {
    saveFavorites()
  }, [favorites, save])

  const loadFavorites = useCallback(async () => {
    const stored = await load<string[]>('favorites')
    if (stored) {
      setFavorites(stored)
    }
  }, [load])

  const saveFavorites = useCallback(async () => {
    await save('favorites', favorites, 24 * 60 * 60 * 1000) // 24 hours for favorites
  }, [favorites, save])

  const addFavorite = useCallback((clinicId: string) => {
    setFavorites(prev => prev.includes(clinicId) ? prev : [...prev, clinicId])
  }, [])

  const removeFavorite = useCallback((clinicId: string) => {
    setFavorites(prev => prev.filter(id => id !== clinicId))
  }, [])

  const toggleFavorite = useCallback((clinicId: string) => {
    setFavorites(prev => {
      const isFavorite = prev.includes(clinicId)
      return isFavorite 
        ? prev.filter(id => id !== clinicId)
        : [...prev, clinicId]
    })
  }, [])

  const isFavorite = useCallback((clinicId: string) => {
    return favorites.includes(clinicId)
  }, [favorites])

  const getFavorites = useCallback(() => {
    return [...favorites]
  }, [favorites])

  return {
    favorites,
    isOnline,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    getFavorites
  }
}

// Hook for offline clinic data caching
export function useOfflineClinicData() {
  const { save, load } = useOfflineStorage()

  const cacheClinicList = useCallback(async (clinics: any[], filters: any) => {
    const key = `clinic_list_${JSON.stringify(filters)}`
    await save(key, clinics, 15 * 60 * 1000) // 15 minutes for clinic lists
  }, [save])

  const getCachedClinicList = useCallback(async (filters: any) => {
    const key = `clinic_list_${JSON.stringify(filters)}`
    return await load<any[]>(key)
  }, [load])

  const cacheClinicDetails = useCallback(async (clinicId: string, clinicData: any) => {
    await save(`clinic_details_${clinicId}`, clinicData, 60 * 60 * 1000) // 1 hour for details
  }, [save])

  const getCachedClinicDetails = useCallback(async (clinicId: string) => {
    return await load<any>(`clinic_details_${clinicId}`)
  }, [load])

  return {
    cacheClinicList,
    getCachedClinicList,
    cacheClinicDetails,
    getCachedClinicDetails
  }
}