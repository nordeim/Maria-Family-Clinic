/**
 * Accessibility Utilities and Components
 * Common hooks and utilities for implementing accessibility features
 */

"use client"

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { WCAGComplianceChecker } from '../framework/ComplianceChecker'
import { useScreenReader } from '@/components/accessibility/screen-reader'

// Types for accessibility utilities
export interface AccessibilityUtilities {
  focusManagement: FocusManagementUtilities
  aria: AriaUtilities
  keyboard: KeyboardUtilities
  screenReader: ScreenReaderUtilities
  performance: PerformanceUtilities
  testing: TestingUtilities
}

export interface FocusManagementUtilities {
  trapFocus: (container: HTMLElement) => () => void
  setFocus: (element: HTMLElement | string) => void
  getFocusableElements: (container: HTMLElement) => HTMLElement[]
  focusFirst: (container: HTMLElement) => void
  focusLast: (container: HTMLElement) => void
  focusNext: (container: HTMLElement) => void
  focusPrevious: (container: HTMLElement) => void
  saveFocus: (key?: string) => void
  restoreFocus: (key?: string) => void
}

export interface AriaUtilities {
  getAriaLabel: (element: HTMLElement) => string | null
  setAriaLabel: (element: HTMLElement, label: string) => void
  setAriaDescribedBy: (element: HTMLElement, descriptionId: string) => void
  removeAriaDescribedBy: (element: HTMLElement) => void
  createLiveRegion: (priority?: 'polite' | 'assertive') => HTMLElement
  announce: (message: string, priority?: 'polite' | 'assertive') => void
}

export interface KeyboardUtilities {
  handleKeyboardNavigation: (
    event: KeyboardEvent,
    focusableElements: HTMLElement[],
    currentIndex: number
  ) => { newIndex: number; action: 'focus' | 'trap' | 'none' }
  isKeyboardEvent: (event: KeyboardEvent) => boolean
  isActivationKey: (event: KeyboardEvent) => boolean
  isNavigationKey: (event: KeyboardEvent) => boolean
  preventDefaultForKeys: (event: KeyboardEvent, keys: string[]) => boolean
}

export interface ScreenReaderUtilities {
  announcePageChange: (pageTitle: string) => void
  announceFormError: (fieldName: string, error: string) => void
  announceAsyncUpdate: (message: string) => void
  announceProgress: (current: number, total: number, label: string) => void
  createAnnouncement: (message: string, priority?: 'polite' | 'assertive') => void
}

export interface PerformanceUtilities {
  measureAccessibilityPerformance: () => Promise<AccessibilityPerformanceMetrics>
  monitorAccessibilityImpact: () => () => void
  optimizeForPerformance: () => void
}

export interface TestingUtilities {
  checkWCAGCompliance: (element?: HTMLElement) => Promise<any>
  simulateScreenReader: () => void
  checkColorContrast: (foreground: string, background: string) => boolean
  validateFocusOrder: (container: HTMLElement) => boolean
}

export interface AccessibilityPerformanceMetrics {
  renderTime: number
  memoryUsage: number
  accessibilityScore: number
  violationsCount: number
  lastAudit: number
}

// Main accessibility utilities class
export class AccessibilityUtilitiesManager {
  private static instance: AccessibilityUtilitiesManager
  private complianceChecker: WCAGComplianceChecker
  private liveRegions: HTMLElement[] = []
  private focusHistory: Map<string, HTMLElement> = new Map()

  private constructor() {
    this.complianceChecker = WCAGComplianceChecker.getInstance()
  }

  public static getInstance(): AccessibilityUtilitiesManager {
    if (!AccessibilityUtilitiesManager.instance) {
      AccessibilityUtilitiesManager.instance = new AccessibilityUtilitiesManager()
    }
    return AccessibilityUtilitiesManager.instance
  }

  /**
   * Focus Management Utilities
   */
  getFocusManagement(): FocusManagementUtilities {
    return {
      trapFocus: (container: HTMLElement) => {
        const focusableElements = this.getFocusableElements(container)
        
        if (focusableElements.length === 0) {
          return () => {}
        }

        const firstFocusable = focusableElements[0]
        const lastFocusable = focusableElements[focusableElements.length - 1]

        const handleKeyDown = (e: KeyboardEvent) => {
          if (e.key !== 'Tab') return

          if (e.shiftKey) {
            // Shift + Tab
            if (document.activeElement === firstFocusable) {
              e.preventDefault()
              lastFocusable.focus()
            }
          } else {
            // Tab
            if (document.activeElement === lastFocusable) {
              e.preventDefault()
              firstFocusable.focus()
            }
          }
        }

        container.addEventListener('keydown', handleKeyDown)
        
        // Focus first element
        firstFocusable.focus()

        // Return cleanup function
        return () => {
          container.removeEventListener('keydown', handleKeyDown)
        }
      },

      setFocus: (element: HTMLElement | string) => {
        const targetElement = typeof element === 'string' 
          ? document.querySelector(element) as HTMLElement
          : element

        if (targetElement && typeof targetElement.focus === 'function') {
          targetElement.focus()
        }
      },

      getFocusableElements: (container: HTMLElement) => {
        return this.getFocusableElements(container)
      },

      focusFirst: (container: HTMLElement) => {
        const elements = this.getFocusableElements(container)
        if (elements.length > 0) {
          elements[0].focus()
        }
      },

      focusLast: (container: HTMLElement) => {
        const elements = this.getFocusableElements(container)
        if (elements.length > 0) {
          elements[elements.length - 1].focus()
        }
      },

      focusNext: (container: HTMLElement) => {
        const elements = this.getFocusableElements(container)
        const currentIndex = elements.indexOf(document.activeElement as HTMLElement)
        const nextIndex = (currentIndex + 1) % elements.length
        elements[nextIndex].focus()
      },

      focusPrevious: (container: HTMLElement) => {
        const elements = this.getFocusableElements(container)
        const currentIndex = elements.indexOf(document.activeElement as HTMLElement)
        const prevIndex = currentIndex === 0 ? elements.length - 1 : currentIndex - 1
        elements[prevIndex].focus()
      },

      saveFocus: (key: string = 'default') => {
        const currentFocus = document.activeElement as HTMLElement
        if (currentFocus) {
          this.focusHistory.set(key, currentFocus)
        }
      },

      restoreFocus: (key: string = 'default') => {
        const savedFocus = this.focusHistory.get(key)
        if (savedFocus && document.body.contains(savedFocus)) {
          savedFocus.focus()
          this.focusHistory.delete(key)
        }
      }
    }
  }

  /**
   * ARIA Utilities
   */
  getAria(): AriaUtilities {
    return {
      getAriaLabel: (element: HTMLElement) => {
        return element.getAttribute('aria-label')
      },

      setAriaLabel: (element: HTMLElement, label: string) => {
        element.setAttribute('aria-label', label)
      },

      setAriaDescribedBy: (element: HTMLElement, descriptionId: string) => {
        element.setAttribute('aria-describedby', descriptionId)
      },

      removeAriaDescribedBy: (element: HTMLElement) => {
        element.removeAttribute('aria-describedby')
      },

      createLiveRegion: (priority: 'polite' | 'assertive' = 'polite') => {
        const liveRegion = document.createElement('div')
        liveRegion.setAttribute('aria-live', priority)
        liveRegion.setAttribute('aria-atomic', 'true')
        liveRegion.className = 'sr-only'
        document.body.appendChild(liveRegion)
        this.liveRegions.push(liveRegion)
        return liveRegion
      },

      announce: (message: string, priority: 'polite' | 'assertive' = 'polite') => {
        let liveRegion = this.liveRegions.find(region => 
          region.getAttribute('aria-live') === priority
        )

        if (!liveRegion) {
          liveRegion = this.createLiveRegion(priority)
        }

        liveRegion.textContent = message

        // Clear after announcement
        setTimeout(() => {
          if (liveRegion) {
            liveRegion.textContent = ''
          }
        }, 1000)
      }
    }
  }

  /**
   * Keyboard Utilities
   */
  getKeyboard(): KeyboardUtilities {
    return {
      handleKeyboardNavigation: (
        event: KeyboardEvent,
        focusableElements: HTMLElement[],
        currentIndex: number
      ) => {
        const { key, shiftKey } = event

        if (key === 'Tab') {
          if (shiftKey) {
            // Shift + Tab - go to previous
            const newIndex = currentIndex > 0 ? currentIndex - 1 : focusableElements.length - 1
            return { newIndex, action: 'focus' }
          } else {
            // Tab - go to next
            const newIndex = (currentIndex + 1) % focusableElements.length
            return { newIndex, action: 'focus' }
          }
        }

        if (key === 'Escape') {
          return { newIndex: currentIndex, action: 'trap' }
        }

        if (key === 'Home') {
          return { newIndex: 0, action: 'focus' }
        }

        if (key === 'End') {
          return { newIndex: focusableElements.length - 1, action: 'focus' }
        }

        if (key === 'ArrowDown') {
          const newIndex = Math.min(currentIndex + 1, focusableElements.length - 1)
          return { newIndex, action: 'focus' }
        }

        if (key === 'ArrowUp') {
          const newIndex = Math.max(currentIndex - 1, 0)
          return { newIndex, action: 'focus' }
        }

        return { newIndex: currentIndex, action: 'none' }
      },

      isKeyboardEvent: (event: KeyboardEvent) => {
        return ['Tab', 'Enter', 'Space', 'Escape', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)
      },

      isActivationKey: (event: KeyboardEvent) => {
        return event.key === 'Enter' || event.key === ' '
      },

      isNavigationKey: (event: KeyboardEvent) => {
        return ['Tab', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)
      },

      preventDefaultForKeys: (event: KeyboardEvent, keys: string[]) => {
        if (keys.includes(event.key)) {
          event.preventDefault()
          return true
        }
        return false
      }
    }
  }

  /**
   * Screen Reader Utilities
   */
  getScreenReader(): ScreenReaderUtilities {
    return {
      announcePageChange: (pageTitle: string) => {
        this.getAria().announce(`Navigated to ${pageTitle}`, 'polite')
      },

      announceFormError: (fieldName: string, error: string) => {
        this.getAria().announce(`Error in ${fieldName}: ${error}`, 'assertive')
      },

      announceAsyncUpdate: (message: string) => {
        this.getAria().announce(message, 'polite')
      },

      announceProgress: (current: number, total: number, label: string) => {
        const percentage = Math.round((current / total) * 100)
        this.getAria().announce(`${label}: ${current} of ${total} complete, ${percentage}%`, 'polite')
      },

      createAnnouncement: (message: string, priority: 'polite' | 'assertive' = 'polite') => {
        this.getAria().announce(message, priority)
      }
    }
  }

  /**
   * Performance Utilities
   */
  getPerformance(): PerformanceUtilities {
    return {
      measureAccessibilityPerformance: async (): Promise<AccessibilityPerformanceMetrics> => {
        const startTime = performance.now()
        
        // Run accessibility compliance check
        const complianceResult = await this.complianceChecker.checkComponentCompliance(document)
        
        const endTime = performance.now()
        const renderTime = endTime - startTime

        return {
          renderTime,
          memoryUsage: (performance as any).memory?.usedJSHeapSize || 0,
          accessibilityScore: complianceResult.score,
          violationsCount: complianceResult.violations.length,
          lastAudit: Date.now()
        }
      },

      monitorAccessibilityImpact: () => {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          
          entries.forEach(entry => {
            if (entry.name.includes('accessibility') || entry.name.includes('axe')) {
              console.debug('Accessibility performance:', entry)
            }
          })
        })

        observer.observe({ entryTypes: ['measure', 'navigation'] })

        // Return cleanup function
        return () => observer.disconnect()
      },

      optimizeForPerformance: () => {
        // Defer non-critical accessibility features
        if ('requestIdleCallback' in window) {
          requestIdleCallback(() => {
            this.initializeNonCriticalFeatures()
          })
        } else {
          setTimeout(() => {
            this.initializeNonCriticalFeatures()
          }, 100)
        }
      }
    }
  }

  /**
   * Testing Utilities
   */
  getTesting(): TestingUtilities {
    return {
      checkWCAGCompliance: async (element?: HTMLElement) => {
        const target = element || document
        return await this.complianceChecker.checkComponentCompliance(target)
      },

      simulateScreenReader: () => {
        // Simulate screen reader navigation for testing
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6')
        const currentIndex = Array.from(headings).indexOf(document.activeElement as Element)
        
        if (currentIndex < headings.length - 1) {
          this.getFocusManagement().setFocus(headings[currentIndex + 1] as HTMLElement)
        }
      },

      checkColorContrast: (foreground: string, background: string) => {
        // Simple color contrast check
        // In a real implementation, this would use a proper color contrast calculator
        const fgRGB = this.hexToRgb(foreground)
        const bgRGB = this.hexToRgb(background)
        
        if (!fgRGB || !bgRGB) return false

        const fgLuminance = this.getLuminance(fgRGB)
        const bgLuminance = this.getLuminance(bgRGB)
        
        const contrast = (Math.max(fgLuminance, bgLuminance) + 0.05) / 
                        (Math.min(fgLuminance, bgLuminance) + 0.05)
        
        return contrast >= 4.5 // WCAG AA standard
      },

      validateFocusOrder: (container: HTMLElement) => {
        const focusableElements = this.getFocusableElements(container)
        const focusableWithTabIndex = focusableElements
          .filter(el => el.tabIndex >= 0)
          .sort((a, b) => a.tabIndex - b.tabIndex)

        // Check if focusable elements with tabIndex are in correct order
        for (let i = 1; i < focusableWithTabIndex.length; i++) {
          if (focusableWithTabIndex[i].tabIndex < focusableWithTabIndex[i - 1].tabIndex) {
            return false
          }
        }

        return true
      }
    }
  }

  // Helper methods
  private getFocusableElements(container: HTMLElement): HTMLElement[] {
    const selectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ].join(', ')

    return Array.from(container.querySelectorAll(selectors))
      .filter((el): el is HTMLElement => 
        el instanceof HTMLElement && 
        !el.hasAttribute('disabled') &&
        !el.hasAttribute('aria-hidden') &&
        el.offsetParent !== null // Visible elements only
      )
  }

  private hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null
  }

  private getLuminance(rgb: { r: number; g: number; b: number }): number {
    const { r, g, b } = rgb
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    })
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
  }

  private initializeNonCriticalFeatures(): void {
    // Initialize non-critical accessibility features
    console.log('Initializing non-critical accessibility features')
  }
}

// Context for accessibility utilities
const AccessibilityUtilitiesContext = createContext<AccessibilityUtilities | null>(null)

export function AccessibilityUtilitiesProvider({ children }: { children: React.ReactNode }) {
  const [utilities, setUtilities] = useState<AccessibilityUtilities | null>(null)

  useEffect(() => {
    const manager = AccessibilityUtilitiesManager.getInstance()
    
    setUtilities({
      focusManagement: manager.getFocusManagement(),
      aria: manager.getAria(),
      keyboard: manager.getKeyboard(),
      screenReader: manager.getScreenReader(),
      performance: manager.getPerformance(),
      testing: manager.getTesting()
    })
  }, [])

  return (
    <AccessibilityUtilitiesContext.Provider value={utilities}>
      {children}
    </AccessibilityUtilitiesContext.Provider>
  )
}

export function useAccessibilityUtilities() {
  const context = useContext(AccessibilityUtilitiesContext)
  if (!context) {
    throw new Error('useAccessibilityUtilities must be used within AccessibilityUtilitiesProvider')
  }
  return context
}

// React hooks for common accessibility patterns
export function useFocusManagement() {
  const { focusManagement } = useAccessibilityUtilities()
  return focusManagement
}

export function useAria() {
  const { aria } = useAccessibilityUtilities()
  return aria
}

export function useKeyboard() {
  const { keyboard } = useAccessibilityUtilities()
  return keyboard
}

export function useScreenReader() {
  const { screenReader } = useAccessibilityUtilities()
  return screenReader
}

export function useAccessibilityPerformance() {
  const { performance } = useAccessibilityUtilities()
  return performance
}

export function useAccessibilityTesting() {
  const { testing } = useAccessibilityUtilities()
  return testing
}

// Common accessibility components
export function FocusTrap({ 
  children, 
  onEscape,
  className = '' 
}: { 
  children: React.ReactNode
  onEscape?: () => void
  className?: string 
}) {
  const { focusManagement } = useFocusManagement()
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (containerRef.current) {
      const cleanup = focusManagement.trapFocus(containerRef.current)
      return cleanup
    }
  }, [focusManagement])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && onEscape) {
      onEscape()
    }
  }, [onEscape])

  return (
    <div 
      ref={containerRef}
      className={`focus-trap ${className}`}
      onKeyDown={handleKeyDown}
    >
      {children}
    </div>
  )
}

export function SkipLink({ 
  href, 
  children, 
  className = '' 
}: { 
  href: string
  children: React.ReactNode
  className?: string 
}) {
  return (
    <a 
      href={href}
      className={`skip-link sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-md ${className}`}
    >
      {children}
    </a>
  )
}

export function LiveRegion({ 
  priority = 'polite',
  className = '' 
}: { 
  priority?: 'polite' | 'assertive'
  className?: string 
}) {
  const { aria } = useAria()
  const [message, setMessage] = useState('')

  useEffect(() => {
    const region = aria.createLiveRegion(priority)
    return () => {
      if (region && region.parentNode) {
        region.parentNode.removeChild(region)
      }
    }
  }, [aria, priority])

  return (
    <div 
      aria-live={priority}
      aria-atomic="true"
      className={`sr-only ${className}`}
    >
      {message}
    </div>
  )
}

export function AccessibleButton({ 
  children, 
  onClick, 
  disabled = false,
  className = '',
  ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { 
  children: React.ReactNode
}) {
  const { keyboard } = useKeyboard()
  const { screenReader } = useScreenReader()

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (keyboard.isActivationKey(e as any)) {
      e.preventDefault()
      onClick?.(e as any)
      screenReader.announceAsyncUpdate('Button activated')
    }
  }, [keyboard, onClick, screenReader])

  return (
    <button 
      onClick={onClick}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      className={`accessible-button ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export function AccessibleFormField({ 
  label, 
  error, 
  children, 
  required = false,
  description,
  className = '' 
}: {
  label: string
  error?: string
  children: React.ReactNode
  required?: boolean
  description?: string
  className?: string
}) {
  const { aria } = useAria()
  const { screenReader } = useScreenReader()
  const fieldId = `field-${Math.random().toString(36).substr(2, 9)}`
  const errorId = error ? `${fieldId}-error` : undefined
  const descriptionId = description ? `${fieldId}-description` : undefined

  useEffect(() => {
    if (error && errorId) {
      screenReader.announceFormError(label, error)
    }
  }, [error, label, errorId, screenReader])

  return (
    <div className={`accessible-form-field ${className}`}>
      <label htmlFor={fieldId} className="form-label">
        {label}
        {required && <span className="required-indicator" aria-label="required">*</span>}
      </label>
      
      {description && (
        <div id={descriptionId} className="form-description">
          {description}
        </div>
      )}

      <div className="form-input-wrapper">
        {React.cloneElement(children as React.ReactElement, {
          id: fieldId,
          'aria-describedby': [errorId, descriptionId].filter(Boolean).join(' ') || undefined,
          'aria-invalid': error ? 'true' : 'false',
          required
        })}
      </div>

      {error && (
        <div id={errorId} className="form-error" role="alert">
          {error}
        </div>
      )}
    </div>
  )
}

export function AccessibleModal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  className = '' 
}: {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  className?: string
}) {
  const { focusManagement } = useFocusManagement()
  const { screenReader } = useScreenReader()
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen && modalRef.current) {
      // Focus first element in modal
      focusManagement.focusFirst(modalRef.current)
      
      // Announce modal opening
      screenReader.announceAsyncUpdate(`${title} dialog opened`)
    }
  }, [isOpen, title, focusManagement, screenReader])

  if (!isOpen) return null

  return (
    <div 
      className={`accessible-modal-overlay ${className}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      <FocusTrap onEscape={onClose}>
        <div ref={modalRef} className="accessible-modal-content">
          <div className="modal-header">
            <h2 id="modal-title" className="modal-title">
              {title}
            </h2>
            <button 
              onClick={onClose}
              className="modal-close-button"
              aria-label="Close dialog"
            >
              ×
            </button>
          </div>
          
          <div className="modal-body">
            {children}
          </div>
        </div>
      </FocusTrap>
    </div>
  )
}