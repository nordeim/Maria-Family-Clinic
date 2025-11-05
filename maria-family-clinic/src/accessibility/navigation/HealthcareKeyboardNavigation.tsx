/**
 * Comprehensive Keyboard Navigation System
 * Focus management and logical tab order for all My Family Clinic workflows
 */

"use client"

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'

export interface KeyboardShortcut {
  key: string
  ctrlKey?: boolean
  altKey?: boolean
  shiftKey?: boolean
  metaKey?: boolean
  action: () => void
  description: string
  category: 'navigation' | 'search' | 'booking' | 'utilities' | 'accessibility'
  scope?: string // Restrict to specific page/component
}

export interface FocusManager {
  // Focus trapping
  trapFocus: (container: HTMLElement) => void
  releaseFocus: () => void
  
  // Focus navigation
  focusNext: () => void
  focusPrevious: () => void
  focusFirst: () => void
  focusLast: () => void
  
  // Focus restoration
  saveFocus: (key?: string) => void
  restoreFocus: (key?: string) => void
  
  // Focus helpers
  setFocusToFirstError: () => void
  skipToMainContent: () => void
  skipToNavigation: () => void
}

export interface KeyboardNavigationConfig {
  shortcutsEnabled: boolean
  focusIndicatorsVisible: boolean
  skipLinksEnabled: boolean
  focusManagementEnabled: boolean
  logicalTabOrder: boolean
  showShortcutsHelp: boolean
  announcementsEnabled: boolean
}

export class HealthcareKeyboardNavigationManager {
  private static instance: HealthcareKeyboardNavigationManager
  private shortcuts: Map<string, KeyboardShortcut> = new Map()
  private focusTraps: HTMLElement[] = []
  private focusHistory: Map<string, HTMLElement> = new Map()
  private config: KeyboardNavigationConfig
  private shortcutsPanel: HTMLElement | null = null
  private isInitialized = false

  constructor() {
    this.config = this.getDefaultConfig()
    this.initializeDefaultShortcuts()
  }

  public static getInstance(): HealthcareKeyboardNavigationManager {
    if (!HealthcareKeyboardNavigationManager.instance) {
      HealthcareKeyboardNavigationManager.instance = new HealthcareKeyboardNavigationManager()
    }
    return HealthcareKeyboardNavigationManager.instance
  }

  private getDefaultConfig(): KeyboardNavigationConfig {
    return {
      shortcutsEnabled: true,
      focusIndicatorsVisible: true,
      skipLinksEnabled: true,
      focusManagementEnabled: true,
      logicalTabOrder: true,
      showShortcutsHelp: true,
      announcementsEnabled: true
    }
  }

  /**
   * Initialize keyboard navigation
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return

    // Detect keyboard user
    this.detectKeyboardUser()
    
    // Set up global keyboard event listeners
    this.setupGlobalListeners()
    
    // Create shortcuts panel
    this.createShortcutsPanel()
    
    this.isInitialized = true
  }

  /**
   * Detect if user is primarily using keyboard
   */
  private detectKeyboardUser(): void {
    let keyboardUser = false
    let lastTabTime = 0

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        lastTabTime = Date.now()
        keyboardUser = true
        
        // Add keyboard user class to body
        document.body.classList.add('keyboard-user')
        
        // Remove mouse user class
        document.body.classList.remove('mouse-user')
      }
    }

    const handleMouseDown = () => {
      keyboardUser = false
      document.body.classList.remove('keyboard-user')
      document.body.classList.add('mouse-user')
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleMouseDown)

    // Remove listeners after 10 seconds if no keyboard interaction
    setTimeout(() => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleMouseDown)
    }, 10000)
  }

  /**
   * Set up global keyboard event listeners
   */
  private setupGlobalListeners(): void {
    document.addEventListener('keydown', this.handleGlobalKeyDown.bind(this))
  }

  /**
   * Handle global keyboard events
   */
  private handleGlobalKeyDown(e: KeyboardEvent): void {
    if (!this.config.shortcutsEnabled) return

    // Don't handle shortcuts when typing in inputs
    const target = e.target as HTMLElement
    const isTyping = target.tagName === 'INPUT' || 
                    target.tagName === 'TEXTAREA' || 
                    target.contentEditable === 'true'

    if (isTyping) return

    // Find matching shortcut
    const shortcut = this.findMatchingShortcut(e)
    if (shortcut) {
      e.preventDefault()
      shortcut.action()
      
      if (this.config.announcementsEnabled) {
        this.announceShortcut(shortcut)
      }
    }

    // Handle special navigation keys
    this.handleSpecialKeys(e)
  }

  /**
   * Handle special navigation keys (Escape, Arrow keys, etc.)
   */
  private handleSpecialKeys(e: KeyboardEvent): void {
    switch (e.key) {
      case 'Escape':
        this.handleEscape()
        break
      case 'ArrowUp':
        if (e.altKey) {
          e.preventDefault()
          this.navigateToPreviousSection()
        }
        break
      case 'ArrowDown':
        if (e.altKey) {
          e.preventDefault()
          this.navigateToNextSection()
        }
        break
      case 'Home':
        if (e.ctrlKey) {
          e.preventDefault()
          this.focusFirst()
        }
        break
      case 'End':
        if (e.ctrlKey) {
          e.preventDefault()
          this.focusLast()
        }
        break
    }
  }

  /**
   * Find matching keyboard shortcut
   */
  private findMatchingShortcut(e: KeyboardEvent): KeyboardShortcut | null {
    for (const shortcut of this.shortcuts.values()) {
      if (this.matchesShortcut(shortcut, e)) {
        // Check scope restrictions
        if (shortcut.scope && !this.isInScope(shortcut.scope)) {
          continue
        }
        return shortcut
      }
    }
    return null
  }

  /**
   * Check if shortcut matches current key event
   */
  private matchesShortcut(shortcut: KeyboardShortcut, e: KeyboardEvent): boolean {
    return shortcut.key.toLowerCase() === e.key.toLowerCase() &&
           !!shortcut.ctrlKey === e.ctrlKey &&
           !!shortcut.altKey === e.altKey &&
           !!shortcut.shiftKey === e.shiftKey &&
           !!shortcut.metaKey === e.metaKey
  }

  /**
   * Check if current context is within shortcut scope
   */
  private isInScope(scope: string): boolean {
    const currentPath = window.location.pathname
    return currentPath.includes(scope) || document.body.classList.contains(scope)
  }

  /**
   * Announce shortcut action to screen reader
   */
  private announceShortcut(shortcut: KeyboardShortcut): void {
    const announcement = `Executed ${shortcut.category} action: ${shortcut.description}`
    
    // Create temporary live region for announcement
    const liveRegion = document.createElement('div')
    liveRegion.setAttribute('aria-live', 'polite')
    liveRegion.setAttribute('aria-atomic', 'true')
    liveRegion.className = 'sr-only'
    liveRegion.textContent = announcement
    
    document.body.appendChild(liveRegion)
    
    setTimeout(() => {
      document.body.removeChild(liveRegion)
    }, 1000)
  }

  /**
   * Register keyboard shortcut
   */
  registerShortcut(shortcut: KeyboardShortcut): void {
    this.shortcuts.set(this.generateShortcutId(shortcut), shortcut)
  }

  /**
   * Unregister keyboard shortcut
   */
  unregisterShortcut(shortcutId: string): void {
    this.shortcuts.delete(shortcutId)
  }

  /**
   * Generate unique ID for shortcut
   */
  private generateShortcutId(shortcut: KeyboardShortcut): string {
    const keyModifiers = [
      shortcut.ctrlKey ? 'ctrl+' : '',
      shortcut.altKey ? 'alt+' : '',
      shortcut.shiftKey ? 'shift+' : '',
      shortcut.metaKey ? 'meta+' : ''
    ].join('')
    
    return `${keyModifiers}${shortcut.key.toLowerCase()}-${shortcut.category}`
  }

  /**
   * Initialize default keyboard shortcuts
   */
  private initializeDefaultShortcuts(): void {
    // Navigation shortcuts
    this.registerShortcut({
      key: 'h',
      altKey: true,
      action: () => this.skipToMainContent(),
      description: 'Skip to main content',
      category: 'navigation'
    })

    this.registerShortcut({
      key: 'n',
      altKey: true,
      action: () => this.skipToNavigation(),
      description: 'Skip to navigation',
      category: 'navigation'
    })

    this.registerShortcut({
      key: '/',
      shiftKey: true,
      action: () => this.focusSearchField(),
      description: 'Focus search field',
      category: 'search'
    })

    this.registerShortcut({
      key: 'Escape',
      action: () => this.closeModals(),
      description: 'Close modals and dialogs',
      category: 'utilities'
    })

    // Search shortcuts
    this.registerShortcut({
      key: 'd',
      ctrlKey: true,
      action: () => this.searchDoctors(),
      description: 'Search doctors',
      category: 'search'
    })

    this.registerShortcut({
      key: 'c',
      ctrlKey: true,
      action: () => this.searchClinics(),
      description: 'Search clinics',
      category: 'search'
    })

    this.registerShortcut({
      key: 's',
      ctrlKey: true,
      action: () => this.searchServices(),
      description: 'Search services',
      category: 'search'
    })

    // Booking shortcuts
    this.registerShortcut({
      key: 'b',
      altKey: true,
      action: () => this.startBooking(),
      description: 'Start new appointment booking',
      category: 'booking'
    })

    this.registerShortcut({
      key: 'a',
      altKey: true,
      action: () => this.showAppointments(),
      description: 'Show my appointments',
      category: 'booking'
    })

    // Accessibility shortcuts
    this.registerShortcut({
      key: 'F1',
      action: () => this.showShortcutsHelp(),
      description: 'Show keyboard shortcuts help',
      category: 'accessibility'
    })

    this.registerShortcut({
      key: 'H',
      altKey: true,
      action: () => this.toggleHighContrast(),
      description: 'Toggle high contrast mode',
      category: 'accessibility'
    })

    this.registerShortcut({
      key: 'F',
      altKey: true,
      action: () => this.cycleFontSize(),
      description: 'Cycle font size',
      category: 'accessibility'
    })

    this.registerShortcut({
      key: 'V',
      altKey: true,
      action: () => this.toggleVoiceNavigation(),
      description: 'Toggle voice navigation',
      category: 'accessibility'
    })
  }

  /**
   * Create shortcuts help panel
   */
  private createShortcutsPanel(): void {
    if (!this.config.showShortcutsHelp) return

    const panel = document.createElement('div')
    panel.id = 'keyboard-shortcuts-panel'
    panel.className = 'sr-only'
    panel.setAttribute('role', 'dialog')
    panel.setAttribute('aria-modal', 'true')
    panel.setAttribute('aria-labelledby', 'shortcuts-title')
    
    panel.innerHTML = `
      <h2 id="shortcuts-title">Keyboard Shortcuts</h2>
      <div class="shortcuts-content">
        <h3>Navigation</h3>
        <ul>
          <li><kbd>Alt+H</kbd> Skip to main content</li>
          <li><kbd>Alt+N</kbd> Skip to navigation</li>
          <li><kbd>Alt+↑</kbd> Previous section</li>
          <li><kbd>Alt+↓</kbd> Next section</li>
        </ul>
        
        <h3>Search</h3>
        <ul>
          <li><kbd>Ctrl+D</kbd> Search doctors</li>
          <li><kbd>Ctrl+C</kbd> Search clinics</li>
          <li><kbd>Ctrl+S</kbd> Search services</li>
          <li><kbd>Shift+/</kbd> Focus search field</li>
        </ul>
        
        <h3>Booking</h3>
        <ul>
          <li><kbd>Alt+B</kbd> Start appointment booking</li>
          <li><kbd>Alt+A</kbd> Show appointments</li>
        </ul>
        
        <h3>Accessibility</h3>
        <ul>
          <li><kbd>F1</kbd> Show this help</li>
          <li><kbd>Alt+H</kbd> Toggle high contrast</li>
          <li><kbd>Alt+F</kbd> Cycle font size</li>
          <li><kbd>Alt+V</kbd> Toggle voice navigation</li>
          <li><kbd>Esc</kbd> Close modals and dialogs</li>
        </ul>
      </div>
      <button id="close-shortcuts-panel">Close</button>
    `
    
    document.body.appendChild(panel)
    this.shortcutsPanel = panel

    // Add close button handler
    const closeButton = panel.querySelector('#close-shortcuts-panel')
    if (closeButton) {
      closeButton.addEventListener('click', () => this.hideShortcutsHelp())
    }
  }

  // Navigation actions
  private skipToMainContent(): void {
    const mainContent = document.querySelector('main, [role="main"]')
    if (mainContent) {
      this.setFocus(mainContent as HTMLElement)
      this.announce('Skipped to main content')
    }
  }

  private skipToNavigation(): void {
    const navigation = document.querySelector('nav, [role="navigation"]')
    if (navigation) {
      this.setFocus(navigation as HTMLElement)
      this.announce('Skipped to navigation')
    }
  }

  private navigateToPreviousSection(): void {
    const sections = Array.from(document.querySelectorAll('section, [role="region"]'))
    const currentFocus = document.activeElement
    const currentIndex = sections.indexOf(currentFocus?.closest('section') || currentFocus as Element)
    
    if (currentIndex > 0) {
      this.setFocus(sections[currentIndex - 1] as HTMLElement)
    }
  }

  private navigateToNextSection(): void {
    const sections = Array.from(document.querySelectorAll('section, [role="region"]'))
    const currentFocus = document.activeElement
    const currentIndex = sections.indexOf(currentFocus?.closest('section') || currentFocus as Element)
    
    if (currentIndex < sections.length - 1) {
      this.setFocus(sections[currentIndex + 1] as HTMLElement)
    }
  }

  // Search actions
  private focusSearchField(): void {
    const searchField = document.querySelector('input[type="search"], [role="search"] input')
    if (searchField) {
      this.setFocus(searchField as HTMLElement)
      this.announce('Focused search field')
    }
  }

  private searchDoctors(): void {
    const doctorSearch = document.querySelector('[data-search-type="doctors"] input')
    if (doctorSearch) {
      this.setFocus(doctorSearch as HTMLElement)
      this.announce('Doctor search activated')
    }
  }

  private searchClinics(): void {
    const clinicSearch = document.querySelector('[data-search-type="clinics"] input')
    if (clinicSearch) {
      this.setFocus(clinicSearch as HTMLElement)
      this.announce('Clinic search activated')
    }
  }

  private searchServices(): void {
    const serviceSearch = document.querySelector('[data-search-type="services"] input')
    if (serviceSearch) {
      this.setFocus(serviceSearch as HTMLElement)
      this.announce('Service search activated')
    }
  }

  // Booking actions
  private startBooking(): void {
    const bookingButton = document.querySelector('[data-action="start-booking"]')
    if (bookingButton) {
      bookingButton.click()
      this.announce('Starting appointment booking')
    }
  }

  private showAppointments(): void {
    const appointmentsLink = document.querySelector('[data-page="appointments"]')
    if (appointmentsLink) {
      appointmentsLink.click()
      this.announce('Navigating to appointments page')
    }
  }

  // Accessibility actions
  private showShortcutsHelp(): void {
    if (!this.shortcutsPanel) return
    
    this.shortcutsPanel.classList.remove('sr-only')
    this.trapFocus(this.shortcutsPanel)
    
    // Focus first button in panel
    const firstButton = this.shortcutsPanel.querySelector('button')
    if (firstButton) {
      this.setFocus(firstButton as HTMLElement)
    }
    
    this.announce('Keyboard shortcuts help opened')
  }

  private hideShortcutsHelp(): void {
    if (!this.shortcutsPanel) return
    
    this.shortcutsPanel.classList.add('sr-only')
    this.releaseFocus()
    this.announce('Keyboard shortcuts help closed')
  }

  private toggleHighContrast(): void {
    const highContrastToggle = document.querySelector('[data-accessibility="high-contrast"]')
    if (highContrastToggle) {
      highContrastToggle.click()
      this.announce('High contrast mode toggled')
    }
  }

  private cycleFontSize(): void {
    const fontSizeAdjuster = document.querySelector('[data-accessibility="font-size"]')
    if (fontSizeAdjuster) {
      fontSizeAdjuster.click()
      this.announce('Font size adjusted')
    }
  }

  private toggleVoiceNavigation(): void {
    const voiceToggle = document.querySelector('[data-accessibility="voice-navigation"]')
    if (voiceToggle) {
      voiceToggle.click()
      this.announce('Voice navigation toggled')
    }
  }

  // Utility actions
  private closeModals(): void {
    const modals = document.querySelectorAll('[role="dialog"][aria-modal="true"]')
    modals.forEach(modal => {
      const closeButton = modal.querySelector('[data-dismiss="modal"], [aria-label="Close"]')
      if (closeButton) {
        closeButton.click()
      }
    })
    this.announce('All modals closed')
  }

  private handleEscape(): void {
    // Close any open modals
    this.closeModals()
    
    // Hide shortcuts panel
    if (this.shortcutsPanel && !this.shortcutsPanel.classList.contains('sr-only')) {
      this.hideShortcutsHelp()
    }
    
    // Restore focus to previous element
    this.restoreFocus('escape')
  }

  // Focus management
  public trapFocus(container: HTMLElement): void {
    // Store current focus
    const currentFocus = document.activeElement as HTMLElement
    this.focusTraps.push(container)

    // Find focusable elements
    const focusableElements = this.getFocusableElements(container)
    
    if (focusableElements.length === 0) return

    // Focus first element
    this.setFocus(focusableElements[0])

    // Set up keydown listener for tab trapping
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault()
          this.setFocus(lastElement)
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault()
          this.setFocus(firstElement)
        }
      }
    }

    container.addEventListener('keydown', handleKeyDown)

    // Store cleanup function
    ;(container as any)._focusTrapCleanup = () => {
      container.removeEventListener('keydown', handleKeyDown)
    }
  }

  public releaseFocus(): void {
    const container = this.focusTraps.pop()
    if (container && (container as any)._focusTrapCleanup) {
      (container as any)._focusTrapCleanup()
    }
  }

  public setFocus(element: HTMLElement): void {
    if (element && typeof element.focus === 'function') {
      element.focus()
    }
  }

  public focusNext(): void {
    const focusableElements = this.getFocusableElements(document.body)
    const currentIndex = focusableElements.indexOf(document.activeElement as HTMLElement)
    
    if (currentIndex < focusableElements.length - 1) {
      this.setFocus(focusableElements[currentIndex + 1])
    }
  }

  public focusPrevious(): void {
    const focusableElements = this.getFocusableElements(document.body)
    const currentIndex = focusableElements.indexOf(document.activeElement as HTMLElement)
    
    if (currentIndex > 0) {
      this.setFocus(focusableElements[currentIndex - 1])
    }
  }

  public focusFirst(): void {
    const focusableElements = this.getFocusableElements(document.body)
    if (focusableElements.length > 0) {
      this.setFocus(focusableElements[0])
    }
  }

  public focusLast(): void {
    const focusableElements = this.getFocusableElements(document.body)
    if (focusableElements.length > 0) {
      this.setFocus(focusableElements[focusableElements.length - 1])
    }
  }

  public saveFocus(key: string = 'default'): void {
    const currentFocus = document.activeElement as HTMLElement
    if (currentFocus) {
      this.focusHistory.set(key, currentFocus)
    }
  }

  public restoreFocus(key: string = 'default'): void {
    const savedFocus = this.focusHistory.get(key)
    if (savedFocus && document.body.contains(savedFocus)) {
      this.setFocus(savedFocus)
    }
  }

  public setFocusToFirstError(): void {
    const errorElements = document.querySelectorAll('.error, [aria-invalid="true"], [data-error="true"]')
    if (errorElements.length > 0) {
      this.setFocus(errorElements[0] as HTMLElement)
      this.announce('Focused first error field')
    }
  }

  /**
   * Get all focusable elements within a container
   */
  private getFocusableElements(container: HTMLElement): HTMLElement[] {
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ].join(', ')

    return Array.from(container.querySelectorAll(focusableSelectors))
      .filter((el): el is HTMLElement => 
        el instanceof HTMLElement && 
        !el.hasAttribute('disabled') &&
        !el.getAttribute('aria-hidden') &&
        el.offsetParent !== null // Visible elements only
      )
  }

  /**
   * Announce message to screen reader
   */
  private announce(message: string): void {
    if (!this.config.announcementsEnabled) return

    const liveRegion = document.createElement('div')
    liveRegion.setAttribute('aria-live', 'polite')
    liveRegion.setAttribute('aria-atomic', 'true')
    liveRegion.className = 'sr-only'
    liveRegion.textContent = message

    document.body.appendChild(liveRegion)

    setTimeout(() => {
      document.body.removeChild(liveRegion)
    }, 1000)
  }

  /**
   * Get current configuration
   */
  getConfig(): KeyboardNavigationConfig {
    return { ...this.config }
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<KeyboardNavigationConfig>): void {
    this.config = { ...this.config, ...updates }
    
    // Update shortcuts panel visibility
    if (this.shortcutsPanel) {
      if (this.config.showShortcutsHelp) {
        this.shortcutsPanel.classList.remove('sr-only')
      } else {
        this.shortcutsPanel.classList.add('sr-only')
      }
    }
  }

  /**
   * Get all registered shortcuts
   */
  getAllShortcuts(): KeyboardShortcut[] {
    return Array.from(this.shortcuts.values())
  }

  /**
   * Get shortcuts by category
   */
  getShortcutsByCategory(category: KeyboardShortcut['category']): KeyboardShortcut[] {
    return Array.from(this.shortcuts.values()).filter(shortcut => 
      shortcut.category === category
    )
  }
}

// Context for keyboard navigation management
const KeyboardNavigationContext = createContext<HealthcareKeyboardNavigationManager | null>(null)

export function KeyboardNavigationProvider({ children }: { children: React.ReactNode }) {
  const [manager, setManager] = useState<HealthcareKeyboardNavigationManager | null>(null)

  useEffect(() => {
    const keyboardManager = HealthcareKeyboardNavigationManager.getInstance()
    keyboardManager.initialize().then(() => {
      setManager(keyboardManager)
    })

    return () => {
      setManager(null)
    }
  }, [])

  return (
    <KeyboardNavigationContext.Provider value={manager}>
      {children}
    </KeyboardNavigationContext.Provider>
  )
}

export function useKeyboardNavigation() {
  const context = useContext(KeyboardNavigationContext)
  if (!context) {
    throw new Error('useKeyboardNavigation must be used within KeyboardNavigationProvider')
  }
  return context
}

// React hooks for different keyboard navigation patterns
export function useFocusManagement() {
  const manager = useKeyboardNavigation()
  
  return {
    trapFocus: manager.trapFocus.bind(manager),
    releaseFocus: manager.releaseFocus.bind(manager),
    saveFocus: manager.saveFocus.bind(manager),
    restoreFocus: manager.restoreFocus.bind(manager),
    setFocusToFirstError: manager.setFocusToFirstError.bind(manager),
    focusNext: manager.focusNext.bind(manager),
    focusPrevious: manager.focusPrevious.bind(manager),
    focusFirst: manager.focusFirst.bind(manager),
    focusLast: manager.focusLast.bind(manager)
  }
}

export function useKeyboardShortcuts() {
  const manager = useKeyboardNavigation()
  
  return {
    registerShortcut: manager.registerShortcut.bind(manager),
    unregisterShortcut: manager.unregisterShortcut.bind(manager),
    getAllShortcuts: manager.getAllShortcuts.bind(manager),
    getShortcutsByCategory: manager.getShortcutsByCategory.bind(manager)
  }
}