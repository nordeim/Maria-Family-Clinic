import { useState, useCallback, useEffect } from "react"
import type React from "react"

export interface PullToRefreshOptions {
  threshold?: number
  maxDistance?: number
  onRefresh?: () => Promise<void> | void
  disabled?: boolean
  children?: React.ReactNode
}

export function usePullToRefresh(options: PullToRefreshOptions = {}) {
  const [isPulling, setIsPulling] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const [startY, setStartY] = useState(0)
  const [currentY, setCurrentY] = useState(0)

  const {
    threshold = 80,
    maxDistance = 120,
    onRefresh,
    disabled = false,
  } = options

  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLElement>) => {
    if (disabled || isRefreshing) return

    const scrollElement = e.currentTarget as HTMLElement
    const scrollTop = scrollElement.scrollTop

    // Only allow pull-to-refresh when at the top of the scroll
    if (scrollTop > 0) return

    setStartY(e.touches[0].clientY)
    setCurrentY(e.touches[0].clientY)
  }, [disabled, isRefreshing])

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLElement>) => {
    if (disabled || isRefreshing || startY === 0) return

    const deltaY = e.touches[0].clientY - startY
    
    if (deltaY > 0) {
      // Prevent default scrolling when pulling down
      e.preventDefault()
      setCurrentY(e.touches[0].clientY)
      
      const distance = Math.min(deltaY, maxDistance)
      setPullDistance(distance)
      
      if (distance > 0) {
        setIsPulling(true)
      }
    }
  }, [disabled, isRefreshing, startY, maxDistance])

  const handleTouchEnd = useCallback(async () => {
    if (disabled || isRefreshing || !isPulling) {
      setStartY(0)
      setCurrentY(0)
      setPullDistance(0)
      setIsPulling(false)
      return
    }

    const shouldRefresh = pullDistance >= threshold

    if (shouldRefresh && onRefresh) {
      setIsRefreshing(true)
      try {
        await onRefresh()
      } finally {
        setIsRefreshing(false)
      }
    }

    // Reset state
    setStartY(0)
    setCurrentY(0)
    setPullDistance(0)
    setIsPulling(false)
  }, [disabled, isRefreshing, isPulling, pullDistance, threshold, onRefresh])

  // Calculate pull progress (0 to 1)
  const progress = Math.min(pullDistance / threshold, 1)

  // Check if should show refresh indicator
  const shouldShowRefresh = pullDistance >= threshold

  return {
    isPulling,
    isRefreshing,
    pullDistance,
    progress,
    shouldShowRefresh,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
  }
}

export default usePullToRefresh