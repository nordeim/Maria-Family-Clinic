/**
 * Performance Cache Service
 * Sub-Phase 10.2: Core Web Vitals & Performance Optimization
 * Intelligent caching strategies for healthcare data
 */

'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'

export interface CacheEntry<T> {
  data: T
  timestamp: number
  expiresAt: number
  accessCount: number
  lastAccessed: number
  metadata?: {
    size: number
    type: string
    source?: string
  }
}

export interface CacheStats {
  hits: number
  misses: number
  hitRate: number
  size: number
  entryCount: number
  totalSize: number
}

export class PerformanceCacheService {
  private cache = new Map<string, CacheEntry<any>>()
  private maxSize = 50 * 1024 * 1024 // 50MB
  private maxEntries = 1000
  private defaultTTL = 5 * 60 * 1000 // 5 minutes

  constructor(options?: {
    maxSize?: number
    maxEntries?: number
    defaultTTL?: number
  }) {
    if (options?.maxSize) this.maxSize = options.maxSize
    if (options?.maxEntries) this.maxEntries = options.maxEntries
    if (options?.defaultTTL) this.defaultTTL = options.defaultTTL
  }

  set<T>(key: string, data: T, ttl?: number, metadata?: any): void {
    const now = Date.now()
    const expiresAt = now + (ttl || this.defaultTTL)
    
    // Estimate size
    const size = this.estimateSize(data)
    
    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      expiresAt,
      accessCount: 1,
      lastAccessed: now,
      metadata: {
        size,
        type: typeof data,
        ...metadata,
      },
    }

    // Check cache limits
    if (this.cache.size >= this.maxEntries && !this.cache.has(key)) {
      this.evictLRU()
    }

    // Check size limit
    if (this.getTotalSize() + size > this.maxSize) {
      this.evictBySize(size)
    }

    this.cache.set(key, entry)
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) return null
    
    // Check expiration
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      return null
    }

    // Update access stats
    entry.accessCount++
    entry.lastAccessed = Date.now()
    
    return entry.data
  }

  has(key: string): boolean {
    const entry = this.cache.get(key)
    if (!entry) return false
    
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      return false
    }
    
    return true
  }

  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  getStats(): CacheStats {
    const hits = Array.from(this.cache.values())
      .reduce((sum, entry) => sum + entry.accessCount, 0)
    
    // In a real implementation, misses would be tracked separately
    const misses = 0
    const hitRate = hits / (hits + misses) * 100

    return {
      hits,
      misses,
      hitRate,
      size: this.cache.size,
      entryCount: this.cache.size,
      totalSize: this.getTotalSize(),
    }
  }

  private getTotalSize(): number {
    return Array.from(this.cache.values())
      .reduce((sum, entry) => sum + (entry.metadata?.size || 0), 0)
  }

  private estimateSize(data: any): number {
    try {
      return new Blob([JSON.stringify(data)]).size
    } catch {
      return 1000 // Rough estimate
    }
  }

  private evictLRU(): void {
    let oldestKey = ''
    let oldestTime = Date.now()

    for (const [key, entry] of this.cache) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed
        oldestKey = key
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey)
    }
  }

  private evictBySize(requiredSpace: number): void {
    const entries = Array.from(this.cache.entries())
      .sort(([, a], [, b]) => a.lastAccessed - b.lastAccessed)

    let freedSpace = 0
    for (const [key, entry] of entries) {
      this.cache.delete(key)
      freedSpace += entry.metadata?.size || 0
      
      if (freedSpace >= requiredSpace) break
    }
  }

  // Healthcare-specific cache strategies
  setClinicData(clinicId: string, data: any): void {
    this.set(`clinic:${clinicId}`, data, 10 * 60 * 1000, {
      category: 'clinic',
      priority: 'high',
    })
  }

  getClinicData(clinicId: string): any {
    return this.get(`clinic:${clinicId}`)
  }

  setDoctorData(doctorId: string, data: any): void {
    this.set(`doctor:${doctorId}`, data, 15 * 60 * 1000, {
      category: 'doctor',
      priority: 'high',
    })
  }

  getDoctorData(doctorId: string): any {
    return this.get(`doctor:${doctorId}`)
  }

  setSearchResults(query: string, filters: any, data: any): void {
    const key = `search:${this.hashKey(JSON.stringify({ query, filters }))}`
    this.set(key, data, 2 * 60 * 1000, {
      category: 'search',
      priority: 'medium',
    })
  }

  getSearchResults(query: string, filters: any): any {
    const key = `search:${this.hashKey(JSON.stringify({ query, filters }))}`
    return this.get(key)
  }

  setStaticContent(path: string, data: any): void {
    this.set(`static:${path}`, data, 30 * 60 * 1000, {
      category: 'static',
      priority: 'low',
    })
  }

  getStaticContent(path: string): any {
    return this.get(`static:${path}`)
  }

  private hashKey(key: string): string {
    let hash = 0
    for (let i = 0; i < key.length; i++) {
      const char = key.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36)
  }

  // Cleanup expired entries
  cleanup(): number {
    const now = Date.now()
    let cleaned = 0

    for (const [key, entry] of this.cache) {
      if (now > entry.expiresAt) {
        this.cache.delete(key)
        cleaned++
      }
    }

    return cleaned
  }

  // Preload critical data
  preload(data: Array<{ key: string; data: any; ttl?: number; category: string }>): void {
    data.forEach(({ key, data, ttl, category }) => {
      this.set(key, data, ttl, { category, preloaded: true })
    })
  }
}

// Global cache instance
let globalCache: PerformanceCacheService | null = null

export function getGlobalCache(): PerformanceCacheService {
  if (!globalCache) {
    globalCache = new PerformanceCacheService({
      maxSize: 50 * 1024 * 1024, // 50MB
      maxEntries: 1000,
      defaultTTL: 5 * 60 * 1000, // 5 minutes
    })
  }
  return globalCache
}

// React hook for cache management
export function usePerformanceCache() {
  const [cache] = useState(() => getGlobalCache())
  const [stats, setStats] = useState<CacheStats>({
    hits: 0,
    misses: 0,
    hitRate: 0,
    size: 0,
    entryCount: 0,
    totalSize: 0,
  })

  useEffect(() => {
    const updateStats = () => {
      setStats(cache.getStats())
    }

    updateStats()
    const interval = setInterval(updateStats, 5000)

    // Cleanup expired entries every minute
    const cleanupInterval = setInterval(() => {
      cache.cleanup()
      updateStats()
    }, 60 * 1000)

    return () => {
      clearInterval(interval)
      clearInterval(cleanupInterval)
    }
  }, [cache])

  const set = useCallback((key: string, data: any, ttl?: number) => {
    cache.set(key, data, ttl)
    setStats(cache.getStats())
  }, [cache])

  const get = useCallback((key: string) => {
    const result = cache.get(key)
    setStats(cache.getStats())
    return result
  }, [cache])

  const preload = useCallback((data: Array<{ key: string; data: any; ttl?: number; category: string }>) => {
    cache.preload(data)
    setStats(cache.getStats())
  }, [cache])

  return {
    set,
    get,
    preload,
    stats,
    cache,
  }
}

// Healthcare-specific hooks
export function useClinicCache(clinicId: string) {
  const { set, get } = usePerformanceCache()
  
  const setClinicData = useCallback((data: any) => {
    set(`clinic:${clinicId}`, data, 10 * 60 * 1000) // 10 minutes
  }, [set, clinicId])

  const getClinicData = useCallback(() => {
    return get(`clinic:${clinicId}`)
  }, [get, clinicId])

  return {
    setClinicData,
    getClinicData,
  }
}

export function useSearchCache() {
  const { set, get } = usePerformanceCache()
  
  const setSearchResults = useCallback((query: string, filters: any, results: any) => {
    const key = `search:${JSON.stringify({ query, filters })}`
    set(key, results, 2 * 60 * 1000) // 2 minutes
  }, [set])

  const getSearchResults = useCallback((query: string, filters: any) => {
    const key = `search:${JSON.stringify({ query, filters })}`
    return get(key)
  }, [get])

  return {
    setSearchResults,
    getSearchResults,
  }
}

// Cache monitoring component
export function CacheMonitor() {
  const { stats } = usePerformanceCache()

  return (
    <div className="fixed bottom-4 left-4 bg-white border rounded-lg p-4 shadow-lg z-50 w-64">
      <h3 className="font-semibold text-sm mb-2">Cache Monitor</h3>
      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span>Hit Rate:</span>
          <span className="font-medium">{stats.hitRate.toFixed(1)}%</span>
        </div>
        <div className="flex justify-between">
          <span>Entries:</span>
          <span className="font-medium">{stats.entryCount}</span>
        </div>
        <div className="flex justify-between">
          <span>Size:</span>
          <span className="font-medium">{(stats.totalSize / 1024 / 1024).toFixed(1)}MB</span>
        </div>
        <div className="flex justify-between">
          <span>Hits:</span>
          <span className="font-medium text-green-600">{stats.hits}</span>
        </div>
      </div>
    </div>
  )
}
