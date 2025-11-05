// UX Utilities for Healthcare Micro-Interactions and Animation Systems
// Helper functions, animation configurations, and performance utilities

import { AnimationConfig, MobileOptimizationConfig, EmergencyUXConfig, InsuranceUXConfig } from '../types';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility function for combining class names
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Animation configuration constants
export const ANIMATION_CONFIG: AnimationConfig = {
  duration: {
    quick: 150,
    standard: 300,
    slow: 500,
    loading: 1000,
  },
  easing: {
    easeOut: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0.0, 1, 1)',
    easeInOut: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  },
  healthcareContexts: {
    appointment: {
      success: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)', // Bounce for positive confirmation
      loading: 'cubic-bezier(0.4, 0.0, 0.2, 1)', // Standard ease
      error: 'cubic-bezier(0.4, 0.0, 1, 1)', // Ease in for attention
    },
    medical: {
      information: 'cubic-bezier(0.4, 0.0, 0.2, 1)', // Professional standard
      urgent: 'cubic-bezier(0.0, 0.0, 0.2, 1)', // Quick attention
      emergency: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)', // High visibility bounce
    },
  },
};

// Mobile optimization configuration
export const MOBILE_OPTIMIZATION_CONFIG: MobileOptimizationConfig = {
  touchTargetSize: 44, // Minimum 44px for healthcare accessibility
  swipeGestures: {
    enabled: true,
    patterns: ['left', 'right', 'up', 'down'],
  },
  hapticFeedback: {
    enabled: true,
    intensity: 'medium',
    medicalContexts: [
      'appointment-booking',
      'emergency-contact',
      'medical-alert',
      'prescription-reminder',
      'vaccination-schedule',
    ],
  },
  offlineMode: {
    enabled: true,
    cachedFeatures: [
      'clinic-locations',
      'emergency-contacts',
      'appointment-history',
      'medical-records',
      'insurance-information',
    ],
    syncQueue: true,
  },
};

// Emergency UX configuration
export const EMERGENCY_UX_CONFIG: EmergencyUXConfig = {
  immediateCareThreshold: 15, // 15 minutes for immediate care
  urgentCareThreshold: 60, // 1 hour for urgent care
  emergencyContacts: [
    {
      type: 'ambulance',
      number: '995',
      description: 'Singapore Emergency Ambulance Service',
    },
    {
      type: 'police',
      number: '999',
      description: 'Singapore Police Force',
    },
    {
      type: 'fire',
      number: '995',
      description: 'Singapore Fire Service',
    },
    {
      type: 'hospital',
      number: '1777',
      description: 'Nearest Hospital Emergency',
    },
  ],
  gpsIntegration: true,
  autoCall: false,
  accessibilityEmergencyMode: true,
};

// Insurance UX configuration
export const INSURANCE_UX_CONFIG: InsuranceUXConfig = {
  realTimeVerification: true,
  coverageIndicators: true,
  transparentPricing: true,
  paymentOptimization: true,
  supportedProviders: [
    'AIA',
    'Prudential',
    'NTUC Income',
    'Great Eastern',
    'AXA',
    'Manulife',
    'Raffles Health Insurance',
  ],
  medisaveIntegration: true,
  medishieldIntegration: true,
};

// Animation variants for healthcare-specific components
export const HEALTHCARE_ANIMATION_VARIANTS = {
  // Loading states
  loading: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
    transition: { duration: ANIMATION_CONFIG.duration.standard / 1000 },
  },

  // Success states
  success: {
    initial: { scale: 0, opacity: 0 },
    animate: { 
      scale: [0, 1.2, 1], 
      opacity: [0, 1, 1],
      transition: { 
        duration: ANIMATION_CONFIG.duration.slow / 1000,
        times: [0, 0.6, 1],
        type: 'spring',
        stiffness: 500,
        damping: 30,
      },
    },
    exit: { scale: 0, opacity: 0 },
  },

  // Error states
  error: {
    initial: { x: -20, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: 20, opacity: 0 },
    transition: { 
      duration: ANIMATION_CONFIG.duration.standard / 1000,
      type: 'spring',
      stiffness: 400,
      damping: 25,
    },
  },

  // Hover states for healthcare cards
  cardHover: {
    initial: { y: 0, scale: 1 },
    whileHover: { 
      y: -4, 
      scale: 1.02,
      transition: { 
        duration: ANIMATION_CONFIG.duration.quick / 1000,
        type: 'spring',
        stiffness: 400,
        damping: 17,
      },
    },
    whileTap: { 
      scale: 0.98,
      transition: { duration: 0.1 },
    },
  },

  // Progress animations
  progress: {
    initial: { width: 0 },
    animate: (progress: number) => ({
      width: `${progress}%`,
      transition: { 
        duration: ANIMATION_CONFIG.duration.standard / 1000,
        type: 'spring',
        stiffness: 300,
        damping: 30,
      },
    }),
  },

  // Stagger animations for lists
  stagger: {
    animate: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  },

  item: {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: ANIMATION_CONFIG.duration.standard / 1000,
        type: 'spring',
        stiffness: 300,
        damping: 30,
      },
    },
    exit: { opacity: 0, y: -20 },
  },

  // Emergency animations (high visibility)
  emergency: {
    initial: { scale: 1, opacity: 1 },
    animate: { 
      scale: [1, 1.05, 1], 
      opacity: [1, 0.8, 1],
      transition: { 
        duration: 0.6,
        repeat: Infinity,
        repeatType: 'reverse' as const,
        ease: 'easeInOut',
      },
    },
  },

  // Pulse for important healthcare elements
  pulse: {
    animate: {
      scale: [1, 1.05, 1],
      opacity: [1, 0.9, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  },
};

// Accessibility utilities
export const ACCESSIBILITY_UTILS = {
  // Generate ARIA labels for healthcare contexts
  generateAriaLabel: (context: string, action: string, data?: any): string => {
    const contextLabels = {
      appointment: 'Appointment booking',
      doctor: 'Doctor information',
      clinic: 'Clinic details',
      emergency: 'Emergency contact',
      insurance: 'Insurance information',
      medical: 'Medical information',
    };

    const actionLabels = {
      book: 'Book appointment',
      call: 'Make phone call',
      view: 'View details',
      edit: 'Edit information',
      delete: 'Delete item',
      save: 'Save changes',
      cancel: 'Cancel action',
    };

    const contextLabel = contextLabels[context as keyof typeof contextLabels] || context;
    const actionLabel = actionLabels[action as keyof typeof actionLabels] || action;

    return `${contextLabel}: ${actionLabel}${data ? ` for ${data}` : ''}`;
  },

  // Generate screen reader announcements
  generateAnnouncement: (type: string, message: string, priority: 'polite' | 'assertive' = 'polite'): void => {
    if (typeof document === 'undefined') return;

    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;

    document.body.appendChild(announcement);

    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  },

  // Focus management for healthcare workflows
  trapFocus: (container: HTMLElement) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    firstElement?.focus();

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  },

  // High contrast mode detection
  isHighContrastMode: (): boolean => {
    if (typeof window === 'undefined') return false;
    
    return window.matchMedia('(prefers-contrast: high)').matches;
  },

  // Reduced motion detection
  isReducedMotion: (): boolean => {
    if (typeof window === 'undefined') return false;
    
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },

  // Screen reader detection
  isScreenReader: (): boolean => {
    if (typeof navigator === 'undefined') return false;
    
    return navigator.userAgent.includes('NVDA') || 
           navigator.userAgent.includes('JAWS') || 
           navigator.userAgent.includes('VoiceOver');
  },
};

// Performance utilities
export const PERFORMANCE_UTILS = {
  // Debounce function for search and input optimization
  debounce: <T extends (...args: any[]) => any>(
    func: T,
    wait: number,
    immediate?: boolean
  ): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      const later = () => {
        timeout = null;
        if (!immediate) func(...args);
      };
      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func(...args);
    };
  },

  // Throttle function for scroll and resize events
  throttle: <T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): ((...args: Parameters<T>) => void) => {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  },

  // Measure Core Web Vitals
  measureCoreWebVitals: () => {
    if (typeof window === 'undefined') return;

    // First Contentful Paint
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.name === 'first-contentful-paint') {
          console.log('FCP:', entry.startTime);
        }
      });
    });
    
    observer.observe({ entryTypes: ['paint'] });

    // Largest Contentful Paint
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      console.log('LCP:', lastEntry.startTime);
    });
    
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

    // First Input Delay
    const fidObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry: any) => {
        console.log('FID:', entry.processingStart - entry.startTime);
      });
    });
    
    fidObserver.observe({ entryTypes: ['first-input'] });
  },

  // Optimize images for different screen densities
  getOptimizedImageSrc: (baseSrc: string, devicePixelRatio: number = 1): string => {
    if (devicePixelRatio <= 1) return baseSrc;
    
    const extension = baseSrc.split('.').pop();
    const name = baseSrc.replace(`.${extension}`, '');
    
    return `${name}@${devicePixelRatio}x.${extension}`;
  },

  // Lazy loading with intersection observer
  createIntersectionObserver: (
    callback: IntersectionObserverCallback,
    options?: IntersectionObserverInit
  ): IntersectionObserver => {
    return new IntersectionObserver(callback, {
      rootMargin: '50px',
      threshold: 0.1,
      ...options,
    });
  },
};

// Healthcare-specific utilities
export const HEALTHCARE_UTILS = {
  // Validate Singapore phone numbers
  validateSingaporePhone: (phone: string): boolean => {
    const singaporePhoneRegex = /^(\+65)?[689]\d{7}$/;
    return singaporePhoneRegex.test(phone.replace(/\s/g, ''));
  },

  // Validate Singapore IC numbers
  validateSingaporeIC: (ic: string): boolean => {
    const singaporeICRegex = /^[STFG]\d{7}[A-Z]$/;
    return singaporeICRegex.test(ic.toUpperCase());
  },

  // Format Singapore phone numbers
  formatSingaporePhone: (phone: string): string => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 8) {
      return `+65 ${cleaned}`;
    }
    return phone;
  },

  // Get medical urgency color
  getMedicalUrgencyColor: (urgency: 'routine' | 'urgent' | 'emergency'): string => {
    const colors = {
      routine: 'text-green-600 bg-green-100',
      urgent: 'text-orange-600 bg-orange-100',
      emergency: 'text-red-600 bg-red-100',
    };
    return colors[urgency];
  },

  // Calculate age from date of birth
  calculateAge: (dateOfBirth: string): number => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  },

  // Generate MOH verification URL
  generateMOHVerificationUrl: (clinicId: string): string => {
    return `https://www.moh.gov.sg/verified-clinics?clinic=${clinicId}`;
  },

  // Get insurance coverage info
  getInsuranceCoverage: (provider: string, service: string): {
    coverage: number;
    copay?: number;
    restrictions?: string[];
  } => {
    // Mock insurance coverage data
    const coverageMap: Record<string, any> = {
      'AIA': { coverage: 80, copay: 20 },
      'Prudential': { coverage: 75, copay: 25 },
      'NTUC Income': { coverage: 85, copay: 15 },
      'Great Eastern': { coverage: 90, copay: 10 },
    };

    return coverageMap[provider] || { coverage: 70, copay: 30 };
  },

  // Calculate appointment wait time
  calculateWaitTime: (queuePosition: number, avgConsultationTime: number = 15): number => {
    return queuePosition * avgConsultationTime;
  },

  // Generate medical emergency protocol
  generateEmergencyProtocol: (symptoms: string[]): {
    severity: 'low' | 'medium' | 'high' | 'critical';
    recommendedAction: string;
    urgencyLevel: number;
  } => {
    const criticalSymptoms = ['chest pain', 'difficulty breathing', 'severe bleeding', 'loss of consciousness'];
    const urgentSymptoms = ['high fever', 'severe pain', 'persistent vomiting', 'severe headache'];
    
    const hasCritical = symptoms.some(s => criticalSymptoms.includes(s.toLowerCase()));
    const hasUrgent = symptoms.some(s => urgentSymptoms.includes(s.toLowerCase()));
    
    if (hasCritical) {
      return {
        severity: 'critical',
        recommendedAction: 'Call 995 immediately',
        urgencyLevel: 4,
      };
    }
    
    if (hasUrgent) {
      return {
        severity: 'high',
        recommendedAction: 'Go to nearest emergency department',
        urgencyLevel: 3,
      };
    }
    
    return {
      severity: 'medium',
      recommendedAction: 'Schedule appointment within 24 hours',
      urgencyLevel: 2,
    };
  },
};

// Storage utilities for offline functionality
export const STORAGE_UTILS = {
  // Secure local storage for healthcare data
  setSecureItem: (key: string, value: any): void => {
    if (typeof localStorage === 'undefined') return;
    
    try {
      const encrypted = btoa(JSON.stringify(value));
      localStorage.setItem(key, encrypted);
    } catch (error) {
      console.error('Failed to store item securely:', error);
    }
  },

  getSecureItem: <T>(key: string): T | null => {
    if (typeof localStorage === 'undefined') return null;
    
    try {
      const encrypted = localStorage.getItem(key);
      if (!encrypted) return null;
      
      return JSON.parse(atob(encrypted)) as T;
    } catch (error) {
      console.error('Failed to retrieve item securely:', error);
      return null;
    }
  },

  removeSecureItem: (key: string): void => {
    if (typeof localStorage === 'undefined') return;
    localStorage.removeItem(key);
  },

  // Cache management for offline functionality
  cacheHealthcareData: async (data: any, cacheName: string): Promise<void> => {
    if (typeof indexedDB === 'undefined') return;
    
    try {
      const request = indexedDB.open('HealthcareCache', 1);
      
      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(cacheName)) {
          db.createObjectStore(cacheName, { keyPath: 'id' });
        }
      };
      
      request.onsuccess = (event: any) => {
        const db = event.target.result;
        const transaction = db.transaction([cacheName], 'readwrite');
        const store = transaction.objectStore(cacheName);
        
        const dataWithId = {
          id: Date.now().toString(),
          timestamp: Date.now(),
          data: data,
        };
        
        store.add(dataWithId);
      };
    } catch (error) {
      console.error('Failed to cache healthcare data:', error);
    }
  },

  getCachedHealthcareData: async <T>(cacheName: string): Promise<T[]> => {
    if (typeof indexedDB === 'undefined') return [];
    
    return new Promise((resolve) => {
      const request = indexedDB.open('HealthcareCache', 1);
      
      request.onsuccess = (event: any) => {
        const db = event.target.result;
        const transaction = db.transaction([cacheName], 'readonly');
        const store = transaction.objectStore(cacheName);
        
        const getAllRequest = store.getAll();
        getAllRequest.onsuccess = () => {
          resolve(getAllRequest.result.map((item: any) => item.data));
        };
        getAllRequest.onerror = () => resolve([]);
      };
      
      request.onerror = () => resolve([]);
    });
  },
};

// Export all utilities
export const UXUtils = {
  animation: ANIMATION_CONFIG,
  mobile: MOBILE_OPTIMIZATION_CONFIG,
  emergency: EMERGENCY_UX_CONFIG,
  insurance: INSURANCE_UX_CONFIG,
  animations: HEALTHCARE_ANIMATION_VARIANTS,
  accessibility: ACCESSIBILITY_UTILS,
  performance: PERFORMANCE_UTILS,
  healthcare: HEALTHCARE_UTILS,
  storage: STORAGE_UTILS,
  cn,
};