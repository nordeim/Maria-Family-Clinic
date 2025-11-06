/**
 * Screen Reader Announcer Component
 * Provides dynamic content announcements for screen readers
 */

"use client"

import React, { useEffect, useState, useRef } from 'react'
import { useI18n } from '@/lib/i18n/hook'
import { useAccessibility } from './provider'
import { useScreenReader } from './screen-reader'

interface ScreenReaderAnnouncerProps {
  // Content to announce
  content?: string
  priority?: 'polite' | 'assertive'
  
  // Announce on specific events
  announceOnChange?: {
    data: any
    changeDescription: string
  }[]
  
  // Auto-announce for specific content changes
  autoAnnounce?: {
    selector: string
    event: 'load' | 'change' | 'update' | 'focus'
    description: string
  }[]
  
  // Region management
  regions?: {
    id: string
    label: string
    priority: 'polite' | 'assertive'
    content?: string
  }[]
  
  className?: string
}

export function ScreenReaderAnnouncer({
  content = '',
  priority = 'polite',
  announceOnChange = [],
  autoAnnounce = [],
  regions = [],
  className = ''
}: ScreenReaderAnnouncerProps) {
  const { announce: globalAnnounce } = useAccessibility()
  const { announce: screenReaderAnnounce } = useScreenReader()
  const { t } = useI18n()
  
  const [currentAnnouncements, setCurrentAnnouncements] = useState<Array<{
    id: string
    content: string
    priority: 'polite' | 'assertive'
    timestamp: number
  }>>>([])
  
  const regionRefs = useRef<Record<string, HTMLDivElement | null>>({})
  
  // Custom announcement function
  const announce = (message: string, messagePriority: 'polite' | 'assertive' = 'polite') => {
    const announcement = {
      id: `announcement-${Date.now()}-${Math.random()}`,
      content: message,
      priority: messagePriority,
      timestamp: Date.now()
    }
    
    setCurrentAnnouncements(prev => [...prev, announcement])
    
    // Auto-remove after 10 seconds
    setTimeout(() => {
      setCurrentAnnouncements(prev => prev.filter(a => a.id !== announcement.id))
    }, 10000)
    
    // Use both accessibility systems
    globalAnnounce(message, messagePriority)
    screenReaderAnnounce(message, messagePriority)
  }
  
  // Announce content changes
  useEffect(() => {
    announceOnChange.forEach(({ data, changeDescription }) => {
      const message = typeof changeDescription === 'function' 
        ? changeDescription(data) 
        : changeDescription
      if (message) {
        announce(message, 'polite')
      }
    })
  }, [announceOnChange])
  
  // Auto-announce for DOM changes
  useEffect(() => {
    const observers: MutationObserver[] = []
    
    autoAnnounce.forEach(({ selector, event, description }) => {
      if (event === 'load') {
        // Announce on component load
        setTimeout(() => {
          announce(description, 'polite')
        }, 100)
      } else if (event === 'change' || event === 'update') {
        // Use MutationObserver for DOM changes
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
              announce(description, 'polite')
            }
          })
        })
        
        const element = document.querySelector(selector)
        if (element) {
          observer.observe(element, { childList: true, subtree: true })
          observers.push(observer)
        }
      }
    })
    
    return () => {
      observers.forEach(observer => observer.disconnect())
    }
  }, [autoAnnounce])
  
  // Manage live regions
  useEffect(() => {
    regions.forEach(({ id, label, priority, content }) => {
      if (content && regionRefs.current[id]) {
        // Update region content
        regionRefs.current[id]?.setAttribute('aria-label', label)
        regionRefs.current[id]!.textContent = content
      } else if (label) {
        // Create or update region label
        if (!regionRefs.current[id]) {
          const region = document.createElement('div')
          region.id = id
          region.setAttribute('aria-label', label)
          region.setAttribute('aria-live', priority)
          region.setAttribute('aria-atomic', 'true')
          region.className = 'sr-only'
          document.body.appendChild(region)
          regionRefs.current[id] = region
        } else {
          regionRefs.current[id]?.setAttribute('aria-label', label)
          regionRefs.current[id]?.setAttribute('aria-live', priority)
        }
      }
    })
    
    // Cleanup removed regions
    Object.keys(regionRefs.current).forEach(regionId => {
      if (!regions.find(r => r.id === regionId)) {
        const element = regionRefs.current[regionId]
        if (element) {
          element.remove()
          delete regionRefs.current[regionId]
        }
      }
    })
  }, [regions])
  
  // Announce current content
  useEffect(() => {
    if (content) {
      announce(content, priority)
    }
  }, [content, priority])
  
  return (
    <>
      {/* Live regions for specific content types */}
      <div
        id="sr-announcements-polite"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        ref={(el) => {
          if (el) regionRefs.current['announcements-polite'] = el
        }}
      />
      
      <div
        id="sr-announcements-assertive"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
        ref={(el) => {
          if (el) regionRefs.current['announcements-assertive'] = el
        }}
      />
      
      {/* Region for page navigation */}
      <div
        id="sr-navigation"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        ref={(el) => {
          if (el) regionRefs.current['navigation'] = el
        }}
      />
      
      {/* Region for form validation */}
      <div
        id="sr-form-validation"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
        ref={(el) => {
          if (el) regionRefs.current['form-validation'] = el
        }}
      />
      
      {/* Region for search results */}
      <div
        id="sr-search-results"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        ref={(el) => {
          if (el) regionRefs.current['search-results'] = el
        }}
      />
      
      {/* Region for dynamic content updates */}
      <div
        id="sr-content-updates"
        aria-live="polite"
        aria-atomic="false"
        className="sr-only"
        ref={(el) => {
          if (el) regionRefs.current['content-updates'] = el
        }}
      />
      
      {/* Custom announcements display (for debugging) */}
      {process.env.NODE_ENV === 'development' && (
        <div className={`fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg text-sm max-w-sm z-50 ${className}`}>
          <h3 className="font-bold mb-2">Screen Reader Announcements</h3>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {currentAnnouncements.map((announcement) => (
              <div key={announcement.id} className="border-l-2 border-blue-400 pl-2">
                <div className="text-xs text-gray-300">
                  {announcement.priority} • {new Date(announcement.timestamp).toLocaleTimeString()}
                </div>
                <div className="text-white">{announcement.content}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}

// Specialized announcement components
interface StatusAnnouncementProps {
  status: 'success' | 'error' | 'warning' | 'info'
  message: string
  className?: string
}

export function StatusAnnouncement({ status, message, className = '' }: StatusAnnouncementProps) {
  const priorityMap = {
    success: 'polite' as const,
    error: 'assertive' as const,
    warning: 'assertive' as const,
    info: 'polite' as const
  }
  
  return (
    <div
      className={`sr-only ${className}`}
      aria-live={priorityMap[status]}
      aria-atomic="true"
    >
      {message}
    </div>
  )
}

interface NavigationAnnouncementProps {
  pageName: string
  breadcrumb?: string[]
  className?: string
}

export function NavigationAnnouncement({ pageName, breadcrumb, className = '' }: NavigationAnnouncementProps) {
  const breadcrumbText = breadcrumb ? `, breadcrumb: ${breadcrumb.join(' > ')}` : ''
  const message = `Navigated to ${pageName}${breadcrumbText}`
  
  return (
    <ScreenReaderAnnouncer
      content={message}
      priority="polite"
      className={className}
    />
  )
}

interface FormAnnouncementProps {
  fieldName: string
  status: 'required' | 'invalid' | 'valid' | 'cleared'
  message?: string
  className?: string
}

export function FormAnnouncement({ fieldName, status, message, className = '' }: FormAnnouncementProps) {
  const statusMessages = {
    required: `${fieldName} is required`,
    invalid: `${fieldName} is invalid. ${message || 'Please check the value.'}`,
    valid: `${fieldName} is valid`,
    cleared: `${fieldName} has been cleared`
  }
  
  const priority = status === 'invalid' ? 'assertive' : 'polite'
  
  return (
    <ScreenReaderAnnouncer
      content={statusMessages[status]}
      priority={priority}
      className={className}
    />
  )
}

interface SearchAnnouncementProps {
  query: string
  resultCount: number
  suggestions?: string[]
  className?: string
}

export function SearchAnnouncement({ query, resultCount, suggestions, className = '' }: SearchAnnouncementProps) {
  const { t } = useI18n()
  
  const getResultsMessage = () => {
    if (resultCount === 0) {
      return t('accessibility.searchNoResults', { query }, { section: 'common', domain: 'accessibility', priority: 'medium', lastUpdated: '2025-01-01' })
    } else if (resultCount === 1) {
      return t('accessibility.searchOneResult', { query }, { section: 'common', domain: 'accessibility', priority: 'medium', lastUpdated: '2025-01-01' })
    } else {
      return t('accessibility.searchMultipleResults', { query, count: resultCount }, { section: 'common', domain: 'accessibility', priority: 'medium', lastUpdated: '2025-01-01' })
    }
  }
  
  const message = suggestions && suggestions.length > 0
    ? `${getResultsMessage()}. Suggestions: ${suggestions.join(', ')}`
    : getResultsMessage()
  
  return (
    <ScreenReaderAnnouncer
      content={message}
      priority="polite"
      className={className}
    />
  )
}

interface LoadingAnnouncementProps {
  message: string
  progress?: number
  className?: string
}

export function LoadingAnnouncement({ message, progress, className = '' }: LoadingAnnouncementProps) {
  const progressMessage = progress !== undefined 
    ? `${message}. Progress: ${Math.round(progress)} percent complete`
    : message
  
  return (
    <ScreenReaderAnnouncer
      content={progressMessage}
      priority="polite"
      autoAnnounce={[
        {
          selector: '[data-loading]',
          event: 'change' as const,
          description: progressMessage
        }
      ]}
      className={className}
    />
  )
}

// Global announcement hook for easy use across components
export function useAnnounce() {
  const { announce: globalAnnounce } = useAccessibility()
  const { announce: screenReaderAnnounce } = useScreenReader()
  
  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    // Use both systems for maximum compatibility
    globalAnnounce(message, priority)
    screenReaderAnnounce(message, priority)
    
    // Also update the live regions
    const region = document.getElementById(
      priority === 'assertive' ? 'sr-announcements-assertive' : 'sr-announcements-polite'
    )
    if (region) {
      region.textContent = message
    }
  }
  
  return { announce }
}