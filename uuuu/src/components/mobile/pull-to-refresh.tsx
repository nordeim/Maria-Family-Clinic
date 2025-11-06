"use client"

import { useRef, useEffect, useState, useCallback } from "react"
import { cn } from "@/lib/utils"
import { usePullToRefresh } from "@/hooks/use-pull-to-refresh"
import { RefreshCw } from "lucide-react"

interface PullToRefreshListProps {
  children: React.ReactNode
  onRefresh?: () => Promise<void> | void
  className?: string
  disabled?: boolean
  threshold?: number
}

export function PullToRefreshList({
  children,
  onRefresh,
  className,
  disabled = false,
  threshold = 80,
}: PullToRefreshListProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scrollHeight, setScrollHeight] = useState(0)
  const [scrollTop, setScrollTop] = useState(0)

  const {
    isPulling,
    isRefreshing,
    pullDistance,
    progress,
    shouldShowRefresh,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  } = usePullToRefresh({
    threshold,
    onRefresh,
    disabled,
  })

  // Track scroll position
  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      setScrollTop(containerRef.current.scrollTop)
    }
  }, [])

  useEffect(() => {
    const container = containerRef.current
    if (container) {
      container.addEventListener("scroll", handleScroll, { passive: true })
      return () => container.removeEventListener("scroll", handleScroll)
    }
    return undefined
  }, [handleScroll])

  useEffect(() => {
    if (containerRef.current) {
      setScrollHeight(containerRef.current.scrollHeight)
    }
  }, [children])

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative overflow-y-auto overflow-x-hidden",
        className
      )}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      role="main"
      aria-label="Clinic list"
    >
      {/* Pull to refresh indicator */}
      <div
        className={cn(
          "absolute top-0 left-0 right-0 z-10 flex items-center justify-center transition-transform duration-200",
          isPulling || isRefreshing ? "translate-y-0" : "-translate-y-full"
        )}
        style={{
          height: `${Math.max(pullDistance, 0)}px`,
        }}
        aria-hidden={!isPulling && !isRefreshing}
      >
        <div
          className={cn(
            "flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-lg border transition-all",
            shouldShowRefresh && "bg-blue-50 border-blue-200"
          )}
        >
          <RefreshCw
            className={cn(
              "h-5 w-5 text-gray-600 transition-transform duration-200",
              isRefreshing && "animate-spin",
              isPulling && !isRefreshing && progress > 1 && "rotate-180"
            )}
          />
          <span className="text-sm font-medium text-gray-700">
            {isRefreshing ? "Refreshing..." : pullDistance >= threshold ? "Release to refresh" : "Pull to refresh"}
          </span>
        </div>
      </div>

      {/* Content with top padding when pulling */}
      <div
        style={{
          paddingTop: `${Math.max(pullDistance, 0)}px`,
          minHeight: "100%",
        }}
        className="transition-all duration-200"
      >
        {children}
      </div>

      {/* Accessibility announcements */}
      <div className="sr-only" aria-live="polite">
        {isRefreshing && "Refreshing clinic list"}
        {shouldShowRefresh && "Release to refresh clinic list"}
      </div>
    </div>
  )
}

interface PullToRefreshContainerProps {
  children: React.ReactNode
  onRefresh?: () => Promise<void> | void
  className?: string
  isLoading?: boolean
  emptyState?: React.ReactNode
  error?: string | null
  threshold?: number
}

export function PullToRefreshContainer({
  children,
  onRefresh,
  className,
  isLoading = false,
  emptyState,
  error,
  threshold = 80,
}: PullToRefreshContainerProps) {
  const [key, setKey] = useState(0)

  const handleRefresh = async () => {
    if (onRefresh) {
      await onRefresh()
      setKey(prev => prev + 1) // Force re-render to show latest data
    }
  }

  if (error) {
    return (
      <div className={cn("p-4", className)} role="alert">
        <div className="text-center text-red-600">
          <p className="font-medium">Failed to load clinics</p>
          <p className="text-sm mt-1">{error}</p>
          <button
            onClick={handleRefresh}
            className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors min-h-[44px] touch-manipulation"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  if (isLoading && !onRefresh) {
    return (
      <div className={cn("p-4", className)}>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 rounded-lg h-32"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div key={key} className={cn("relative", className)}>
      {emptyState && !isLoading ? (
        <PullToRefreshList onRefresh={onRefresh} threshold={threshold}>
          <div className="p-4">
            {emptyState}
          </div>
        </PullToRefreshList>
      ) : (
        <PullToRefreshList onRefresh={onRefresh} threshold={threshold}>
          {children}
        </PullToRefreshList>
      )}
    </div>
  )
}