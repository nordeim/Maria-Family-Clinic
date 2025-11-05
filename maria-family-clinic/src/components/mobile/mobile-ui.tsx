"use client"

import * as React from "react"
import { Settings, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useHighContrast } from "@/components/accessibility/screen-reader"

interface AccessibilityControlsProps {
  className?: string
  showControls?: boolean
}

export function AccessibilityControls({ 
  className,
  showControls = true 
}: AccessibilityControlsProps) {
  const { isHighContrast, toggleHighContrast } = useHighContrast()
  const [showPanel, setShowPanel] = React.useState(false)

  if (!showControls) {
    return null
  }

  return (
    <div className={cn("relative", className)}>
      {/* Toggle Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowPanel(!showPanel)}
        className="min-w-[44px] min-h-[44px] touch-manipulation"
        aria-label="Accessibility settings"
        aria-expanded={showPanel}
        aria-controls="accessibility-panel"
      >
        <Settings className="h-4 w-4" />
      </Button>

      {/* Controls Panel */}
      {showPanel && (
        <div
          id="accessibility-panel"
          className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50"
          role="dialog"
          aria-labelledby="accessibility-title"
          aria-describedby="accessibility-description"
        >
          <h3 id="accessibility-title" className="font-semibold text-gray-900 mb-3">
            Accessibility Settings
          </h3>
          
          <p id="accessibility-description" className="sr-only">
            Adjust accessibility preferences for better user experience
          </p>

          <div className="space-y-4">
            {/* High Contrast Toggle */}
            <div className="flex items-center justify-between">
              <label htmlFor="high-contrast" className="text-sm font-medium text-gray-700">
                High Contrast Mode
              </label>
              <Button
                variant={isHighContrast ? "default" : "outline"}
                size="sm"
                onClick={toggleHighContrast}
                id="high-contrast"
                aria-pressed={isHighContrast}
                className="min-w-[44px] min-h-[44px] touch-manipulation"
                aria-label={`${isHighContrast ? 'Disable' : 'Enable'} high contrast mode`}
              >
                {isHighContrast ? (
                  <Eye className="h-4 w-4" />
                ) : (
                  <EyeOff className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* Keyboard Navigation Indicator */}
            <div className="text-xs text-gray-500">
              <p>Keyboard navigation is always enabled</p>
              <p className="mt-1">Press <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Tab</kbd> to navigate</p>
            </div>

            {/* Voice Search Status */}
            <div className="text-xs text-gray-500">
              <p>Voice search available in supported browsers</p>
            </div>
          </div>

          {/* Close Button */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPanel(false)}
              className="w-full min-h-[44px] touch-manipulation"
              aria-label="Close accessibility settings"
            >
              Close
            </Button>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {showPanel && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowPanel(false)}
          aria-hidden="true"
        />
      )}
    </div>
  )
}

interface MobileNavigationProps {
  children: React.ReactNode
  className?: string
}

export function MobileNavigation({ children, className }: MobileNavigationProps) {
  return (
    <nav
      className={cn(
        "bg-white border-t border-gray-200 px-4 py-2 sm:hidden",
        className
      )}
      role="navigation"
      aria-label="Mobile navigation"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {children}
      </div>
    </nav>
  )
}

interface NavigationButtonProps {
  href?: string
  onClick?: () => void
  icon: React.ReactNode
  label: string
  active?: boolean
  badge?: number
}

export function NavigationButton({
  href,
  onClick,
  icon,
  label,
  active = false,
  badge,
}: NavigationButtonProps) {
  const Component = href ? "a" : "button"
  const props = href
    ? { href, "aria-current": (active ? "page" as const : undefined) }
    : { onClick, "aria-pressed": active }

  return (
    <Component
      {...props}
      className={cn(
        "flex flex-col items-center gap-1 p-2 rounded-lg transition-colors min-w-[44px] min-h-[44px] touch-manipulation",
        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
        active 
          ? "text-blue-600 bg-blue-50" 
          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
      )}
      aria-label={label}
    >
      <div className="relative">
        {icon}
        {badge && badge > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center min-w-[20px]">
            {badge > 99 ? "99+" : badge}
          </span>
        )}
      </div>
      <span className="text-xs font-medium">{label}</span>
    </Component>
  )
}

// Safe Area Layout Helper
export function SafeArea({
  children,
  className,
  padding = true,
}: {
  children: React.ReactNode
  className?: string
  padding?: boolean
}) {
  return (
    <div
      className={cn(
        "safe-area-inset-top safe-area-inset-bottom",
        padding && "pt-safe-top pb-safe-bottom",
        className
      )}
    >
      {children}
    </div>
  )
}

// Responsive Grid for Mobile
export function ResponsiveGrid({
  children,
  className,
  cols = {
    mobile: 1,
    sm: 2,
    md: 3,
    lg: 4,
  },
}: {
  children: React.ReactNode
  className?: string
  cols?: {
    mobile: number
    sm: number
    md: number
    lg: number
  }
}) {
  return (
    <div
      className={cn(
        `grid gap-4`,
        `grid-cols-${cols.mobile}`,
        `sm:grid-cols-${cols.sm}`,
        `md:grid-cols-${cols.md}`,
        `lg:grid-cols-${cols.lg}`,
        className
      )}
    >
      {children}
    </div>
  )
}

// Loading Skeleton for Mobile
export function MobileSkeleton({
  className,
}: {
  className?: string
}) {
  return (
    <div
      className={cn(
        "animate-pulse bg-gray-200 rounded-lg",
        className
      )}
    />
  )
}

export function ClinicCardSkeleton() {
  return (
    <div className="bg-white rounded-lg border p-4 space-y-4">
      <div className="flex justify-between items-start">
        <div className="flex-1 space-y-2">
          <MobileSkeleton className="h-6 w-3/4" />
          <div className="flex gap-2">
            <MobileSkeleton className="h-5 w-16" />
            <MobileSkeleton className="h-5 w-20" />
          </div>
          <MobileSkeleton className="h-4 w-full" />
        </div>
        <MobileSkeleton className="h-16 w-16 rounded-full" />
      </div>
      
      <div className="space-y-2">
        <MobileSkeleton className="h-4 w-2/3" />
        <MobileSkeleton className="h-4 w-1/2" />
      </div>
      
      <div className="flex gap-2">
        <MobileSkeleton className="h-10 w-24" />
        <MobileSkeleton className="h-10 w-24" />
      </div>
    </div>
  )
}

// Touch Target Helpers
export function TouchTarget({
  children,
  size = "default",
  className,
  onClick,
  ...props
}: {
  children: React.ReactNode
  size?: "default" | "sm" | "lg"
  className?: string
  onClick?: () => void
} & React.ComponentPropsWithoutRef<'button'>) {
  const sizeClasses = {
    sm: "min-w-[32px] min-h-[32px] p-1",
    default: "min-w-[44px] min-h-[44px] p-2",
    lg: "min-w-[56px] min-h-[56px] p-3",
  }

  const Component = onClick ? 'button' : 'div'

  return (
    <Component
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "touch-manipulation flex items-center justify-center",
        sizeClasses[size],
        onClick && "cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500",
        className
      )}
      {...(props as any)}
    >
      {children}
    </Component>
  )
}