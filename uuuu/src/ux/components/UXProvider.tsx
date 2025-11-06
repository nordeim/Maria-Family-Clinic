// UX Provider Component for My Family Clinic Healthcare Platform
// Main provider that wraps the entire application with UX context and utilities

'use client';

import React from 'react';
import { UXContextProvider } from '../contexts/UXContext';
import { PersonalizationEngine } from '../components/PersonalizationAI';
import { OfflineManager } from '../components/MobileOptimizations';
import { VoiceNavigation } from '../components/MobileOptimizations';
import { useUXContext } from '../contexts/UXContext';
import { PersonalizationData, VoiceNavigationConfig, MobileOptimizationConfig } from '../types';
import { UXUtils } from '../utils';

interface UXProviderProps {
  children: React.ReactNode;
  userId?: string;
  initialPersonalization?: Partial<PersonalizationData>;
  enablePersonalization?: boolean;
  enableOfflineMode?: boolean;
  enableVoiceNavigation?: boolean;
  enableAnalytics?: boolean;
  medicalContext?: string;
}

// Main UX Provider component
export const UXProvider: React.FC<UXProviderProps> = ({
  children,
  userId,
  initialPersonalization = {},
  enablePersonalization = true,
  enableOfflineMode = true,
  enableVoiceNavigation = true,
  enableAnalytics = true,
  medicalContext = 'general',
}) => {
  // Default personalization data
  const defaultPersonalization: Partial<PersonalizationData> = {
    userType: 'patient',
    preferredLanguage: 'en',
    deviceType: 'desktop',
    healthGoals: [],
    appointmentHistory: [],
    ...initialPersonalization,
  };

  // Voice navigation configuration
  const voiceConfig: VoiceNavigationConfig = {
    enabled: enableVoiceNavigation,
    commands: [
      'book appointment',
      'find clinic',
      'call emergency',
      'search doctor',
      'view results',
      'go back',
      'next step',
      'previous step',
      'confirm booking',
      'cancel appointment',
    ],
    medicalTerms: true,
    language: defaultPersonalization.preferredLanguage === 'zh' ? 'zh' : 
             defaultPersonalization.preferredLanguage === 'ms' ? 'ms' :
             defaultPersonalization.preferredLanguage === 'ta' ? 'ta' : 'en',
    accessibilityMode: true,
  };

  // Mobile optimization configuration
  const mobileConfig: MobileOptimizationConfig = UXUtils.mobile;

  // Handle voice commands
  const handleVoiceCommand = (command: string, confidence: number) => {
    const commandMap: Record<string, () => void> = {
      'book appointment': () => navigateTo('/appointments/book'),
      'find clinic': () => navigateTo('/clinics/search'),
      'call emergency': () => makeEmergencyCall(),
      'search doctor': () => navigateTo('/doctors/search'),
      'view results': () => navigateTo('/results'),
      'go back': () => window.history.back(),
      'next step': () => focusNextInteractiveElement(),
      'previous step': () => focusPreviousInteractiveElement(),
      'confirm booking': () => triggerConfirmAction(),
      'cancel appointment': () => triggerCancelAction(),
    };

    const matchedCommand = Object.keys(commandMap).find(cmd => 
      command.toLowerCase().includes(cmd.toLowerCase())
    );

    if (matchedCommand && confidence > 0.7) {
      commandMap[matchedCommand]();
    }
  };

  // Handle offline actions
  const handleOfflineAction = (action: string, data: any) => {
    // Handle offline booking queue
    if (action === 'book-appointment') {
      // Queue appointment for sync when online
      UXUtils.storage.setSecureItem(`offline_booking_${Date.now()}`, data);
    }
    
    // Handle offline contact submissions
    if (action === 'submit-contact') {
      // Queue contact form for sync
      UXUtils.storage.setSecureItem(`offline_contact_${Date.now()}`, data);
    }

    // Log offline action for analytics
    if (enableAnalytics) {
      console.log('Offline action queued:', action, data);
    }
  };

  // Handle sync completion
  const handleSyncComplete = (success: boolean, errors?: string[]) => {
    if (enableAnalytics) {
      if (success) {
        console.log('Offline data synced successfully');
      } else {
        console.error('Sync failed with errors:', errors);
      }
    }
  };

  // Handle voice navigation state changes
  const handleVoiceStateChange = (isListening: boolean, error?: string) => {
    if (enableAnalytics) {
      if (error) {
        console.error('Voice navigation error:', error);
      } else {
        console.log(isListening ? 'Voice navigation started' : 'Voice navigation stopped');
      }
    }
  };

  // Handle recommendation updates
  const handleRecommendationUpdate = (recommendations: any[]) => {
    if (enableAnalytics) {
      console.log('AI recommendations updated:', recommendations.length);
    }
  };

  // Handle personalization updates
  const handlePersonalizationUpdate = (data: Partial<PersonalizationData>) => {
    if (enableAnalytics) {
      console.log('Personalization updated:', data);
    }
  };

  return (
    <UXContextProvider initialPersonalization={defaultPersonalization}>
      <EnhancedUXProvider
        userId={userId}
        enablePersonalization={enablePersonalization}
        enableOfflineMode={enableOfflineMode}
        enableVoiceNavigation={enableVoiceNavigation}
        enableAnalytics={enableAnalytics}
        voiceConfig={voiceConfig}
        mobileConfig={mobileConfig}
        medicalContext={medicalContext}
        onVoiceCommand={handleVoiceCommand}
        onVoiceStateChange={handleVoiceStateChange}
        onOfflineAction={handleOfflineAction}
        onSyncComplete={handleSyncComplete}
        onRecommendationUpdate={handleRecommendationUpdate}
        onPersonalizationUpdate={handlePersonalizationUpdate}
      >
        {children}
      </EnhancedUXProvider>
    </UXContextProvider>
  );
};

// Enhanced UX Provider with all features
interface EnhancedUXProviderProps {
  children: React.ReactNode;
  userId?: string;
  enablePersonalization?: boolean;
  enableOfflineMode?: boolean;
  enableVoiceNavigation?: boolean;
  enableAnalytics?: boolean;
  voiceConfig: VoiceNavigationConfig;
  mobileConfig: MobileOptimizationConfig;
  medicalContext?: string;
  onVoiceCommand: (command: string, confidence: number) => void;
  onVoiceStateChange: (isListening: boolean, error?: string) => void;
  onOfflineAction: (action: string, data: any) => void;
  onSyncComplete: (success: boolean, errors?: string[]) => void;
  onRecommendationUpdate: (recommendations: any[]) => void;
  onPersonalizationUpdate: (data: Partial<PersonalizationData>) => void;
}

const EnhancedUXProvider: React.FC<EnhancedUXProviderProps> = ({
  children,
  userId,
  enablePersonalization,
  enableOfflineMode,
  enableVoiceNavigation,
  enableAnalytics,
  voiceConfig,
  mobileConfig,
  medicalContext,
  onVoiceCommand,
  onVoiceStateChange,
  onOfflineAction,
  onSyncComplete,
  onRecommendationUpdate,
  onPersonalizationUpdate,
}) => {
  const { state } = useUXContext();

  return (
    <div className="ux-provider" data-medical-context={medicalContext}>
      {/* Personalization Engine */}
      {enablePersonalization && userId && (
        <PersonalizationEngine
          userId={userId}
          onRecommendationUpdate={onRecommendationUpdate}
          onPersonalizationUpdate={onPersonalizationUpdate}
        >
          <div className="personalization-enabled">
            {children}
          </div>
        </PersonalizationEngine>
      )}

      {/* Offline Manager */}
      {enableOfflineMode && (
        <OfflineManager
          enabled={mobileConfig.offlineMode.enabled}
          cachedFeatures={mobileConfig.offlineMode.cachedFeatures}
          onOfflineAction={onOfflineAction}
          onSyncComplete={onSyncComplete}
        >
          {enablePersonalization && !userId ? (
            <div className="personalization-disabled">
              {children}
            </div>
          ) : (
            children
          )}
        </OfflineManager>
      )}

      {/* Voice Navigation */}
      {enableVoiceNavigation && voiceConfig.enabled && (
        <div className="voice-navigation-enabled">
          <VoiceNavigation
            config={voiceConfig}
            onVoiceCommand={onVoiceCommand}
            onStateChange={onVoiceStateChange}
            medicalCommands={voiceConfig.commands}
          />
        </div>
      )}

      {/* Apply accessibility classes based on user preferences */}
      <AccessibilityClassManager />

      {/* Performance monitoring */}
      {enableAnalytics && <PerformanceMonitor />}

      {/* Default rendering when features are disabled */}
      {!enablePersonalization && !enableOfflineMode && !enableVoiceNavigation && (
        <div className="ux-fallback">
          {children}
        </div>
      )}
    </div>
  );
};

// Component to manage accessibility classes
const AccessibilityClassManager: React.FC = () => {
  const { state } = useUXContext();

  React.useEffect(() => {
    const root = document.documentElement;

    // Apply font size
    root.style.setProperty('--base-font-size', `${state.accessibility.fontSize}px`);

    // Apply high contrast
    if (state.accessibility.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Apply reduced motion
    if (state.accessibility.reducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }

    // Apply accessibility preferences
    if (state.accessibility.screenReader) {
      root.classList.add('screen-reader-enabled');
    } else {
      root.classList.remove('screen-reader-enabled');
    }

    if (state.accessibility.voiceNavigation) {
      root.classList.add('voice-navigation-enabled');
    } else {
      root.classList.remove('voice-navigation-enabled');
    }

    // Apply device-specific optimizations
    if (state.personalization.deviceType === 'mobile') {
      root.classList.add('mobile-device');
    } else if (state.personalization.deviceType === 'tablet') {
      root.classList.add('tablet-device');
    } else {
      root.classList.add('desktop-device');
    }

    // Apply medical context
    if (state.medicalContext.currentVisitType) {
      root.classList.add(`visit-type-${state.medicalContext.currentVisitType}`);
    }

    if (state.medicalContext.sensitiveInformation) {
      root.classList.add('sensitive-information-mode');
    }

    if (state.medicalContext.requiresPrivacy) {
      root.classList.add('privacy-mode');
    }

  }, [state.accessibility, state.personalization.deviceType, state.medicalContext]);

  return null;
};

// Component for performance monitoring
const PerformanceMonitor: React.FC = () => {
  const { trackEvent } = useUXContext();

  React.useEffect(() => {
    // Monitor Core Web Vitals
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'largest-contentful-paint') {
            trackEvent({
              eventType: 'performance',
              component: 'PerformanceMonitor',
              action: 'lcp',
              context: 'performance',
              metadata: { lcp: entry.startTime },
              timestamp: Date.now(),
              sessionId: generateSessionId(),
              deviceType: 'desktop', // Would be dynamic
            });
          }
          
          if (entry.entryType === 'first-input') {
            trackEvent({
              eventType: 'performance',
              component: 'PerformanceMonitor',
              action: 'fid',
              context: 'performance',
              metadata: { fid: (entry as any).processingStart - entry.startTime },
              timestamp: Date.now(),
              sessionId: generateSessionId(),
              deviceType: 'desktop',
            });
          }
        });
      });

      observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input'] });

      // Monitor long tasks
      const longTaskObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          trackEvent({
            eventType: 'performance',
            component: 'PerformanceMonitor',
            action: 'longTask',
            context: 'performance',
            metadata: { duration: entry.duration, startTime: entry.startTime },
            timestamp: Date.now(),
            sessionId: generateSessionId(),
            deviceType: 'desktop',
          });
        });
      });

      longTaskObserver.observe({ entryTypes: ['longtask'] });

      return () => {
        observer.disconnect();
        longTaskObserver.disconnect();
      };
    }
  }, [trackEvent]);

  return null;
};

// Utility functions for voice navigation
const navigateTo = (path: string) => {
  if (typeof window !== 'undefined') {
    window.location.href = path;
  }
};

const makeEmergencyCall = () => {
  if (typeof window !== 'undefined' && 'tel' in window) {
    window.location.href = 'tel:995'; // Singapore emergency number
  }
};

const focusNextInteractiveElement = () => {
  if (typeof document !== 'undefined') {
    const focusableElements = document.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const currentIndex = Array.from(focusableElements).indexOf(document.activeElement as Element);
    const nextIndex = (currentIndex + 1) % focusableElements.length;
    (focusableElements[nextIndex] as HTMLElement)?.focus();
  }
};

const focusPreviousInteractiveElement = () => {
  if (typeof document !== 'undefined') {
    const focusableElements = document.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const currentIndex = Array.from(focusableElements).indexOf(document.activeElement as Element);
    const prevIndex = currentIndex === 0 ? focusableElements.length - 1 : currentIndex - 1;
    (focusableElements[prevIndex] as HTMLElement)?.focus();
  }
};

const triggerConfirmAction = () => {
  const confirmButton = document.querySelector('[data-action="confirm"], .confirm-button, button[type="submit"]') as HTMLElement;
  confirmButton?.click();
};

const triggerCancelAction = () => {
  const cancelButton = document.querySelector('[data-action="cancel"], .cancel-button, [aria-label*="Cancel"]') as HTMLElement;
  cancelButton?.click();
};

const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export default UXProvider;