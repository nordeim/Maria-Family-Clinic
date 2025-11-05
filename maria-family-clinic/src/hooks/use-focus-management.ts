import { useState, useCallback, useRef, useEffect } from "react"

export interface FocusOptions {
  trapFocus?: boolean
  autoFocus?: boolean
  onEscape?: () => void
  allowEscape?: boolean
}

export function useFocusManagement(options: FocusOptions = {}) {
  const [isFocused, setIsFocused] = useState(false)
  const [focusedElement, setFocusedElement] = useState<HTMLElement | null>(null)
  const containerRef = useRef<HTMLElement>(null)

  const {
    trapFocus = false,
    autoFocus = false,
    onEscape,
    allowEscape = true,
  } = options

  const focusContainer = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.focus()
      setIsFocused(true)
      setFocusedElement(containerRef.current)
    }
  }, [])

  const focusElement = useCallback((element: HTMLElement) => {
    element.focus()
    setIsFocused(true)
    setFocusedElement(element)
  }, [])

  const blurContainer = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.blur()
      setIsFocused(false)
      setFocusedElement(null)
    }
  }, [])

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!allowEscape || !trapFocus) return

    if (e.key === "Escape" && isFocused) {
      e.preventDefault()
      onEscape?.()
    }

    // Trap focus within container
    if (trapFocus && isFocused && e.key === "Tab") {
      const focusableElements = containerRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )

      if (!focusableElements || focusableElements.length === 0) return

      const firstElement = focusableElements[0] as HTMLElement
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

      if (e.shiftKey) {
        // Shift + Tab (backward)
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement.focus()
        }
      } else {
        // Tab (forward)
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement.focus()
        }
      }
    }
  }, [trapFocus, isFocused, allowEscape, onEscape])

  useEffect(() => {
    if (autoFocus) {
      focusContainer()
    }
  }, [autoFocus, focusContainer])

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [handleKeyDown])

  return {
    containerRef,
    isFocused,
    focusedElement,
    focusContainer,
    focusElement,
    blurContainer,
    setIsFocused,
    handleKeyDown,
  }
}

export default useFocusManagement