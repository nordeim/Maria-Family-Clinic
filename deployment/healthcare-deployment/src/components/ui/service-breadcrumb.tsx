"use client"

import React from "react"
import { ChevronRight, Home, ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface BreadcrumbItem {
  id: string
  label: string
  href?: string
  icon?: string
  isActive?: boolean
}

interface ServiceBreadcrumbProps {
  items: BreadcrumbItem[]
  onNavigate?: (item: BreadcrumbItem) => void
  showBackButton?: boolean
  className?: string
  variant?: "default" | "minimal" | "with-icons"
}

export function ServiceBreadcrumb({
  items,
  onNavigate,
  showBackButton = false,
  className,
  variant = "default"
}: ServiceBreadcrumbProps) {
  const handleItemClick = (item: BreadcrumbItem, index: number) => {
    if (item.isActive || index === items.length - 1) return
    if (onNavigate) {
      onNavigate(item)
    }
  }

  const renderDefaultBreadcrumb = () => (
    <nav aria-label="Breadcrumb" className={cn("flex items-center", className)}>
      <ol className="flex items-center space-x-2">
        {items.map((item, index) => (
          <li key={item.id} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="mx-2 h-4 w-4 text-muted-foreground" />
            )}
            <Button
              variant={item.isActive ? "default" : "ghost"}
              size="sm"
              className={cn(
                "h-auto p-1 font-normal",
                !item.isActive && index < items.length - 1 && 
                "text-muted-foreground hover:text-foreground"
              )}
              onClick={() => handleItemClick(item, index)}
              disabled={item.isActive}
            >
              {item.icon && (
                <span className="mr-1 text-sm" role="img" aria-label={item.label}>
                  {item.icon}
                </span>
              )}
              {item.label}
            </Button>
          </li>
        ))}
      </ol>
    </nav>
  )

  const renderMinimalBreadcrumb = () => (
    <nav aria-label="Breadcrumb" className={cn("flex items-center", className)}>
      <div className="flex items-center text-sm text-muted-foreground">
        {items.map((item, index) => (
          <React.Fragment key={item.id}>
            {index > 0 && <span className="mx-2">/</span>}
            <span className={cn(
              item.isActive ? "text-foreground font-medium" : "hover:text-foreground cursor-pointer"
            )} onClick={() => handleItemClick(item, index)}>
              {item.label}
            </span>
          </React.Fragment>
        ))}
      </div>
    </nav>
  )

  const renderIconBreadcrumb = () => (
    <nav aria-label="Breadcrumb" className={cn("flex items-center", className)}>
      {showBackButton && items.length > 1 && (
        <Button
          variant="ghost"
          size="sm"
          className="mr-2"
          onClick={() => handleItemClick(items[items.length - 2], items.length - 2)}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
      )}
      <ol className="flex items-center space-x-2">
        <li>
          <Button
            variant="ghost"
            size="sm"
            className="h-auto p-1"
            onClick={() => handleItemClick(items[0], 0)}
          >
            <Home className="h-4 w-4" />
          </Button>
        </li>
        {items.slice(1).map((item, index) => (
          <li key={item.id} className="flex items-center">
            <ChevronRight className="mx-1 h-3 w-3 text-muted-foreground" />
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-auto p-1 text-xs",
                item.isActive && "text-foreground font-medium"
              )}
              onClick={() => handleItemClick(item, index + 1)}
            >
              {item.icon && (
                <span className="mr-1" role="img" aria-label={item.label}>
                  {item.icon}
                </span>
              )}
              <span className="truncate max-w-20">{item.label}</span>
            </Button>
          </li>
        ))}
      </ol>
    </nav>
  )

  switch (variant) {
    case "minimal":
      return renderMinimalBreadcrumb()
    case "with-icons":
      return renderIconBreadcrumb()
    default:
      return renderDefaultBreadcrumb()
  }
}

// Hook for managing breadcrumb state
export function useBreadcrumb(initialItems: BreadcrumbItem[] = []) {
  const [items, setItems] = React.useState<BreadcrumbItem[]>(initialItems)

  const addItem = React.useCallback((item: Omit<BreadcrumbItem, 'id'>) => {
    const newItem: BreadcrumbItem = {
      ...item,
      id: `breadcrumb-${Date.now()}-${Math.random()}`
    }
    setItems(prev => [...prev, newItem])
  }, [])

  const updateActiveItem = React.useCallback((id: string) => {
    setItems(prev => prev.map(item => ({
      ...item,
      isActive: item.id === id
    })))
  }, [])

  const resetBreadcrumb = React.useCallback((newItems: BreadcrumbItem[]) => {
    setItems(newItems)
  }, [])

  const goBack = React.useCallback((levels: number = 1) => {
    setItems(prev => {
      if (prev.length <= levels) return prev
      const newItems = prev.slice(0, -levels)
      if (newItems.length > 0) {
        newItems[newItems.length - 1].isActive = true
      }
      return newItems
    })
  }, [])

  return {
    items,
    addItem,
    updateActiveItem,
    resetBreadcrumb,
    goBack
  }
}