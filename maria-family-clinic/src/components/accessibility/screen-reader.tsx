"use client"

import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"

interface SkipLinkProps {
  href: string
  children: React.ReactNode
  className?: string
}

export function SkipLink({ href, children, className = "" }: SkipLinkProps) {
  const [isVisible, setIsVisible] = useState(false)

  const handleClick = () => {
    setIsVisible(false)
  }

  return (
    <a
      href={href}
      onClick={handleClick}
      className={`
        sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 
        focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-md 
        focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 
        focus:ring-blue-500 ${className}
      `}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
    </a>
  )
}

// Screen Reader Announcements
export function useScreenReader() {
  const [announcements, setAnnouncements] = useState<string[]>([])
  const [currentAnnouncement, setCurrentAnnouncement] = useState<string>("")

  const announce = (message: string, priority: "polite" | "assertive" = "polite") => {
    setCurrentAnnouncement(message)
    setAnnouncements(prev => [...prev, message])
    
    // Clear after 5 seconds to allow for repeated messages
    setTimeout(() => {
      setCurrentAnnouncement("")
    }, 5000)
  }

  const clearAnnouncements = () => {
    setAnnouncements([])
    setCurrentAnnouncement("")
  }

  return {
    announce,
    clearAnnouncements,
    announcements,
    currentAnnouncement,
  }
}

interface ScreenReaderAnnouncementsProps {
  announcements: string[]
  currentAnnouncement: string
}

export function ScreenReaderAnnouncements({ announcements, currentAnnouncement }: ScreenReaderAnnouncementsProps) {
  const politeRef = useRef<HTMLDivElement>(null)
  const assertiveRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (currentAnnouncement && politeRef.current) {
      politeRef.current.textContent = currentAnnouncement
    }
  }, [currentAnnouncement])

  return createPortal(
    <div aria-live="polite" aria-atomic="true" className="sr-only">
      <div ref={politeRef} />
    </div>,
    document.body
  )
}

// Screen Reader Component
export function ScreenReaderText({ 
  children, 
  as: Component = "span", 
  className = "", 
  ...props 
}: {
  children: React.ReactNode
  as?: React.ElementType
  className?: string
  [key: string]: any
}) {
  return (
    <Component 
      className={`sr-only ${className}`}
      {...props}
    >
      {children}
    </Component>
  )
}

// High Contrast Toggle
export function useHighContrast() {
  const [isHighContrast, setIsHighContrast] = useState(false)

  useEffect(() => {
    // Check system preference
    const mediaQuery = window.matchMedia("(prefers-contrast: high)")
    setIsHighContrast(mediaQuery.matches)

    // Listen for changes
    const handler = (e: MediaQueryListEvent) => {
      setIsHighContrast(e.matches)
    }

    mediaQuery.addEventListener("change", handler)
    return () => mediaQuery.removeEventListener("change", handler)
  }, [])

  useEffect(() => {
    // Apply CSS classes to document
    if (isHighContrast) {
      document.documentElement.classList.add("high-contrast")
    } else {
      document.documentElement.classList.remove("high-contrast")
    }
  }, [isHighContrast])

  const toggleHighContrast = () => {
    setIsHighContrast(prev => !prev)
  }

  return {
    isHighContrast,
    toggleHighContrast,
  }
}

interface FocusVisibleProps {
  children: React.ReactNode
  visible?: boolean
  className?: string
}

export function FocusVisible({ 
  children, 
  visible = true, 
  className = "" 
}: FocusVisibleProps) {
  return (
    <div className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${className}`}>
      {children}
    </div>
  )
}

// Keyboard Navigation Helper
export function useKeyboardNavigation() {
  const [keyboardUser, setKeyboardUser] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        setKeyboardUser(true)
        // Remove highlight after 2 seconds of no Tab key
        setTimeout(() => {
          setKeyboardUser(false)
        }, 2000)
      }
    }

    const handleMouseDown = () => {
      setKeyboardUser(false)
    }

    document.addEventListener("keydown", handleKeyDown)
    document.addEventListener("mousedown", handleMouseDown)

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.removeEventListener("mousedown", handleMouseDown)
    }
  }, [])

  return keyboardUser
}