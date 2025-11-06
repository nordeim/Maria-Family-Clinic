"use client"

import React from 'react'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

interface LoadingSkeletonProps {
  className?: string
  type?: 'card' | 'list' | 'map' | 'details' | 'search'
  count?: number
}

// Enhanced skeleton components for loading states
export function LoadingSkeleton({ className, type = 'card', count = 1 }: LoadingSkeletonProps) {
  const skeletons = {
    card: () => (
      <div className="space-y-4 p-6">
        {/* Header with avatar and title */}
        <div className="flex items-start gap-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-3/4" />
            <div className="flex gap-2">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-20" />
            </div>
          </div>
        </div>
        
        {/* Address */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        
        {/* Contact info */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        
        {/* Rating and distance */}
        <div className="flex gap-3">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
        </div>
        
        {/* Action buttons */}
        <div className="flex gap-2">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 flex-1" />
        </div>
      </div>
    ),
    
    list: () => (
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      </div>
    ),
    
    map: () => (
      <div className="relative">
        <Skeleton className="h-full w-full rounded-lg" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Skeleton className="h-8 w-32" />
        </div>
      </div>
    ),
    
    details: () => (
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <Skeleton className="h-8 w-2/3" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-20" />
          </div>
        </div>
        
        {/* Section 1 */}
        <div className="space-y-3">
          <Skeleton className="h-6 w-1/4" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
        
        {/* Section 2 */}
        <div className="space-y-3">
          <Skeleton className="h-6 w-1/3" />
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        </div>
        
        {/* Section 3 */}
        <div className="space-y-3">
          <Skeleton className="h-6 w-1/4" />
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        </div>
      </div>
    ),
    
    search: () => (
      <div className="space-y-4">
        {/* Search bar */}
        <Skeleton className="h-10 w-full" />
        
        {/* Filter tags */}
        <div className="flex gap-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-24" />
        </div>
        
        {/* Results */}
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="h-6 w-16" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index}>
          {skeletonComponents[type]()}
        </div>
      ))}
    </div>
  )
}

// Quick inline skeleton for small components
export function InlineSkeleton({ className }: { className?: string }) {
  return (
    <Skeleton 
      className={cn("inline-block", className)} 
    />
  )
}

// List skeleton for grid layouts
export function GridSkeleton({ 
  columns = 2, 
  count = 6, 
  className 
}: { 
  columns?: number
  count?: number
  className?: string 
}) {
  return (
    <div className={cn("grid gap-4", {
      'grid-cols-1': columns === 1,
      'grid-cols-2': columns === 2,
      'grid-cols-3': columns === 3,
      'grid-cols-4': columns === 4,
    }, className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i}>
          <LoadingSkeleton type="card" />
        </div>
      ))}
    </div>
  )
}

// Text skeleton for paragraphs
export function TextSkeleton({ 
  lines = 3, 
  className,
  showIcon = false 
}: { 
  lines?: number
  className?: string
  showIcon?: boolean
}) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="flex items-center gap-2">
          {showIcon && i === 0 && <Skeleton className="h-4 w-4" />}
          <Skeleton 
            className={cn(
              "h-4",
              i === lines - 1 ? "w-2/3" : "w-full"
            )} 
          />
        </div>
      ))}
    </div>
  )
}

// Progressive skeleton that reveals content in stages
export function ProgressiveSkeleton({ 
  isLoading, 
  children,
  fallback 
}: { 
  isLoading: boolean
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  if (!isLoading) return children
  
  return (
    <div className="animate-pulse">
      {fallback || children}
    </div>
  )
}

// Mobile-optimized skeleton for small screens
export function MobileSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-4 p-4", className)}>
      {/* Mobile header */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      
      {/* Mobile content */}
      <div className="space-y-3">
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      
      {/* Mobile actions */}
      <div className="flex gap-2">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  )
}

const skeletonComponents = {
  card: () => <LoadingSkeleton type="card" />,
  list: () => <LoadingSkeleton type="list" />,
  map: () => <LoadingSkeleton type="map" />,
  details: () => <LoadingSkeleton type="details" />,
  search: () => <LoadingSkeleton type="search" />
}