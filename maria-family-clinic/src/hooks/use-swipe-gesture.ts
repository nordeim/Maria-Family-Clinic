import { useEffect, useRef, useState, type TouchEvent } from "react"

export interface SwipeHandlers {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
}

export function useSwipeGesture(handlers: SwipeHandlers, minDistance = 50) {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null)
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const onTouchStart = (e: TouchEvent<HTMLElement>) => {
    setTouchEnd(null)
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    })
    setIsDragging(true)
  }

  const onTouchMove = (e: TouchEvent<HTMLElement>) => {
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    })
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd || !isDragging) return

    const deltaX = touchStart.x - touchEnd.x
    const deltaY = touchStart.y - touchEnd.y
    const absX = Math.abs(deltaX)
    const absY = Math.abs(deltaY)

    // Determine if the swipe is horizontal or vertical
    if (Math.max(absX, absY) < minDistance) return

    if (absX > absY) {
      // Horizontal swipe
      if (deltaX > 0) {
        handlers.onSwipeLeft?.()
      } else {
        handlers.onSwipeRight?.()
      }
    } else {
      // Vertical swipe
      if (deltaY > 0) {
        handlers.onSwipeUp?.()
      } else {
        handlers.onSwipeDown?.()
      }
    }

    setIsDragging(false)
  }

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    isDragging,
  }
}

export default useSwipeGesture