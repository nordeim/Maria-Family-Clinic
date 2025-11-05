"use client"

import React, { useRef, useEffect, useMemo, useCallback } from 'react'
import { cn } from '@/lib/utils'

interface VirtualizedListProps<T> {
  items: T[]
  renderItem: (item: T, index: number) => React.ReactNode
  itemHeight: number
  overscan?: number
  onScroll?: (scrollIndex: number, visibleItems: number, totalItems: number) => void
  className?: string
  containerHeight?: number
}

export function VirtualizedList<T>({
  items,
  renderItem,
  itemHeight,
  overscan = 3,
  onScroll,
  className,
  containerHeight
}: VirtualizedListProps<T>) {
  const scrollElementRef = useRef<HTMLDivElement>(null)
  const [scrollTop, setScrollTop] = React.useState(0)
  
  // Calculate visible range
  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
    const endIndex = Math.min(
      items.length - 1,
      Math.floor((scrollTop + (containerHeight || window.innerHeight)) / itemHeight) + overscan
    )
    
    return { startIndex, endIndex }
  }, [scrollTop, itemHeight, overscan, items.length, containerHeight])

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex + 1)
  }, [items, visibleRange])

  const totalHeight = items.length * itemHeight
  const offsetY = visibleRange.startIndex * itemHeight

  // Handle scroll
  const handleScroll = useCallback(() => {
    if (scrollElementRef.current) {
      const newScrollTop = scrollElementRef.current.scrollTop
      setScrollTop(newScrollTop)
      
      const scrollIndex = Math.floor(newScrollTop / itemHeight)
      const visibleCount = Math.ceil((containerHeight || window.innerHeight) / itemHeight)
      
      onScroll?.(scrollIndex, visibleCount, items.length)
    }
  }, [itemHeight, containerHeight, items.length, onScroll])

  // Attach scroll listener
  useEffect(() => {
    const element = scrollElementRef.current
    if (element) {
      element.addEventListener('scroll', handleScroll, { passive: true })
      return () => element.removeEventListener('scroll', handleScroll)
    }
  }, [handleScroll])

  // Ensure container height if not provided
  const actualContainerHeight = containerHeight || '100vh'

  return (
    <div
      ref={scrollElementRef}
      className={cn('overflow-auto relative', className)}
      style={{ height: actualContainerHeight }}
      onScroll={handleScroll}
    >
      {/* Spacer for total height */}
      <div style={{ height: totalHeight, position: 'relative' }}>
        {/* Visible items container */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            transform: `translateY(${offsetY}px)`,
          }}
        >
          {visibleItems.map((item, relativeIndex) => {
            const actualIndex = visibleRange.startIndex + relativeIndex
            return (
              <div key={actualIndex} style={{ height: itemHeight }}>
                {renderItem(item, actualIndex)}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}