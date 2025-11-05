// UX Hooks for Healthcare Micro-Interactions and Personalization
// Custom React hooks for managing UX state, accessibility, and performance

import { useState, useEffect, useCallback, useRef, useContext } from 'react';
import { useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useUXContext } from '../contexts/UXContext';
import { MicroInteractionConfig, TrustIndicator, PersonalizationData } from '../types';

// Hook for managing micro-interactions
export const useMicroInteraction = (config: MicroInteractionConfig) => {
  const { trackEvent } = useUXContext();
  const [isAnimating, setIsAnimating] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [interactionCount, setInteractionCount] = useState(0);

  const handleHover = useCallback((hovered: boolean) => {
    setIsHovered(hovered);
    
    if (hovered && config.hapticFeedback) {
      triggerHapticFeedback('light');
    }

    trackEvent({
      eventType: 'interaction',
      component: 'useMicroInteraction',
      action: 'hover',
      context: config.healthcareContext || 'general',
      metadata: { hovered, config },
      timestamp: Date.now(),
      sessionId: generateSessionId(),
      deviceType: 'desktop', // Would be dynamic
    });
  }, [config, trackEvent]);

  const handlePress = useCallback((pressed: boolean) => {
    setIsPressed(pressed);
    
    if (pressed && config.hapticFeedback) {
      triggerHapticFeedback('medium');
    }

    if (!pressed) {
      // Trigger animation on release
      setIsAnimating(true);
      setInteractionCount(prev => prev + 1);
      
      setTimeout(() => {
        setIsAnimating(false);
      }, config.duration);
    }
  }, [config, config.duration]);

  const triggerHapticFeedback = useCallback((intensity: 'light' | 'medium' | 'strong') => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      const intensityMap = {
        light: 10,
        medium: 20,
        strong: 30,
      };
      navigator.vibrate(intensityMap[intensity]);
    }
  }, []);

  const resetInteraction = useCallback(() => {
    setIsAnimating(false);
    setIsHovered(false);
    setIsPressed(false);
  }, []);

  return {
    isAnimating,
    isHovered,
    isPressed,
    interactionCount,
    handleHover,
    handlePress,
    resetInteraction,
    triggerHapticFeedback,
  };
};

// Hook for accessibility management
export const useAccessibility = () => {
  const { state, setAccessibility, trackEvent } = useUXContext();
  
  const [fontSize, setFontSize] = useState(state.accessibility.fontSize);
  const [highContrast, setHighContrast] = useState(state.accessibility.highContrast);
  const [reducedMotion, setReducedMotion] = useState(state.accessibility.reducedMotion);
  const [screenReader, setScreenReader] = useState(state.accessibility.screenReader);
  const [voiceNavigation, setVoiceNavigation] = useState(state.accessibility.voiceNavigation);

  const updateAccessibility = useCallback((updates: Partial<typeof state.accessibility>) => {
    const newSettings = {
      fontSize,
      highContrast,
      reducedMotion,
      screenReader,
      voiceNavigation,
      ...updates,
    };

    // Validate font size
    const clampedFontSize = Math.max(12, Math.min(24, newSettings.fontSize));
    
    setAccessibility(newSettings);

    // Apply to document root for CSS variables
    if (typeof document !== 'undefined') {
      document.documentElement.style.setProperty('--base-font-size', `${clampedFontSize}px`);
      
      if (newSettings.highContrast) {
        document.documentElement.classList.add('high-contrast');
      } else {
        document.documentElement.classList.remove('high-contrast');
      }

      if (newSettings.reducedMotion) {
        document.documentElement.classList.add('reduced-motion');
      } else {
        document.documentElement.classList.remove('reduced-motion');
      }
    }

    trackEvent({
      eventType: 'interaction',
      component: 'useAccessibility',
      action: 'updateSettings',
      context: 'accessibility',
      metadata: newSettings,
      timestamp: Date.now(),
      sessionId: generateSessionId(),
      deviceType: 'desktop',
    });
  }, [fontSize, highContrast, reducedMotion, screenReader, voiceNavigation, setAccessibility, trackEvent]);

  const increaseFontSize = useCallback(() => {
    const newSize = Math.min(24, fontSize + 2);
    setFontSize(newSize);
    updateAccessibility({ fontSize: newSize });
  }, [fontSize, updateAccessibility]);

  const decreaseFontSize = useCallback(() => {
    const newSize = Math.max(12, fontSize - 2);
    setFontSize(newSize);
    updateAccessibility({ fontSize: newSize });
  }, [fontSize, updateAccessibility]);

  const toggleHighContrast = useCallback(() => {
    const newHighContrast = !highContrast;
    setHighContrast(newHighContrast);
    updateAccessibility({ highContrast: newHighContrast });
  }, [highContrast, updateAccessibility]);

  const toggleReducedMotion = useCallback(() => {
    const newReducedMotion = !reducedMotion;
    setReducedMotion(newReducedMotion);
    updateAccessibility({ reducedMotion: newReducedMotion });
  }, [reducedMotion, updateAccessibility]);

  const toggleScreenReader = useCallback(() => {
    const newScreenReader = !screenReader;
    setScreenReader(newScreenReader);
    updateAccessibility({ screenReader: newScreenReader });
  }, [screenReader, updateAccessibility]);

  const toggleVoiceNavigation = useCallback(() => {
    const newVoiceNavigation = !voiceNavigation;
    setVoiceNavigation(newVoiceNavigation);
    updateAccessibility({ voiceNavigation: newVoiceNavigation });
  }, [voiceNavigation, updateAccessibility]);

  // Detect system preferences
  useEffect(() => {
    const mediaQueries = [
      { query: '(prefers-contrast: high)', handler: setHighContrast },
      { query: '(prefers-reduced-motion: reduce)', handler: setReducedMotion },
    ];

    const unsubscribeFunctions = mediaQueries.map(({ query, handler }) => {
      const mq = window.matchMedia(query);
      const update = (e: MediaQueryListEvent) => {
        const value = e.matches;
        handler(value);
        updateAccessibility({ [query.includes('contrast') ? 'highContrast' : 'reducedMotion']: value });
      };
      
      mq.addEventListener('change', update);
      return () => mq.removeEventListener('change', update);
    });

    return () => {
      unsubscribeFunctions.forEach(unsubscribe => unsubscribe());
    };
  }, [updateAccessibility]);

  return {
    fontSize,
    highContrast,
    reducedMotion,
    screenReader,
    voiceNavigation,
    increaseFontSize,
    decreaseFontSize,
    toggleHighContrast,
    toggleReducedMotion,
    toggleScreenReader,
    toggleVoiceNavigation,
    updateAccessibility,
  };
};

// Hook for performance monitoring
export const usePerformanceMonitoring = () => {
  const [performanceMetrics, setPerformanceMetrics] = useState({
    fcp: 0, // First Contentful Paint
    lcp: 0, // Largest Contentful Paint
    fid: 0, // First Input Delay
    cls: 0, // Cumulative Layout Shift
    ttfb: 0, // Time to First Byte
  });
  
  const [isSlowConnection, setIsSlowConnection] = useState(false);
  const [networkQuality, setNetworkQuality] = useState<'good' | 'slow' | 'poor'>('good');

  useEffect(() => {
    // Monitor Core Web Vitals
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'paint' && entry.name === 'first-contentful-paint') {
          setPerformanceMetrics(prev => ({ ...prev, fcp: entry.startTime }));
        }
        
        if (entry.entryType === 'largest-contentful-paint') {
          setPerformanceMetrics(prev => ({ ...prev, lcp: entry.startTime }));
        }
        
        if (entry.entryType === 'first-input') {
          setPerformanceMetrics(prev => ({ ...prev, fid: entry.processingStart - entry.startTime }));
        }
        
        if (entry.entryType === 'layout-shift' && !entry.hadRecentInput) {
          setPerformanceMetrics(prev => ({ ...prev, cls: prev.cls + entry.value }));
        }
      });
    });

    observer.observe({ entryTypes: ['paint', 'largest-contentful-paint', 'first-input', 'layout-shift'] });

    // Monitor network quality
    const connection = (navigator as any).connection;
    if (connection) {
      const updateNetworkQuality = () => {
        const effectiveType = connection.effectiveType;
        const downlink = connection.downlink;
        
        let quality: typeof networkQuality = 'good';
        if (effectiveType === 'slow-2g' || effectiveType === '2g' || downlink < 1) {
          quality = 'poor';
        } else if (effectiveType === '3g' || downlink < 2) {
          quality = 'slow';
        }
        
        setNetworkQuality(quality);
        setIsSlowConnection(quality !== 'good');
      };

      updateNetworkQuality();
      connection.addEventListener('change', updateNetworkQuality);
      
      return () => {
        observer.disconnect();
        connection.removeEventListener('change', updateNetworkQuality);
      };
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  const getPerformanceScore = useCallback(() => {
    // Calculate a performance score based on Core Web Vitals
    const { fcp, lcp, fid, cls } = performanceMetrics;
    
    let score = 100;
    
    if (fcp > 1800) score -= 10;
    if (lcp > 2500) score -= 20;
    if (fid > 100) score -= 10;
    if (cls > 0.1) score -= 15;
    
    return Math.max(0, score);
  }, [performanceMetrics]);

  return {
    performanceMetrics,
    isSlowConnection,
    networkQuality,
    getPerformanceScore,
  };
};

// Hook for trust indicator management
export const useTrustIndicators = (initialIndicators: TrustIndicator[]) => {
  const [indicators, setIndicators] = useState<TrustIndicator[]>(initialIndicators);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'verifying' | 'verified' | 'failed'>('idle');

  const verifyIndicator = useCallback(async (indicatorId: string) => {
    setVerificationStatus('verifying');
    
    try {
      // Simulate API verification call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setIndicators(prev => prev.map(indicator => 
        indicator.id === indicatorId 
          ? { 
              ...indicator, 
              verified: true, 
              dateVerified: new Date().toISOString(),
            }
          : indicator
      ));
      
      setVerificationStatus('verified');
    } catch (error) {
      setVerificationStatus('failed');
    }
  }, []);

  const verifyAll = useCallback(async () => {
    const unverifiedIndicators = indicators.filter(i => !i.verified);
    
    for (const indicator of unverifiedIndicators) {
      await verifyIndicator(indicator.id);
      // Add delay between verifications to avoid overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }, [indicators, verifyIndicator]);

  const getTrustScore = useCallback(() => {
    const verifiedCount = indicators.filter(i => i.verified).length;
    return indicators.length > 0 ? (verifiedCount / indicators.length) * 100 : 0;
  }, [indicators]);

  const addIndicator = useCallback((indicator: Omit<TrustIndicator, 'id'>) => {
    const newIndicator: TrustIndicator = {
      ...indicator,
      id: `indicator_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
    
    setIndicators(prev => [...prev, newIndicator]);
  }, []);

  const removeIndicator = useCallback((indicatorId: string) => {
    setIndicators(prev => prev.filter(i => i.id !== indicatorId));
  }, []);

  return {
    indicators,
    verificationStatus,
    trustScore: getTrustScore(),
    verifyIndicator,
    verifyAll,
    addIndicator,
    removeIndicator,
  };
};

// Hook for personalization management
export const usePersonalization = () => {
  const { state, updatePersonalization, trackEvent } = useUXContext();
  
  const [personalizationLevel, setPersonalizationLevel] = useState(0);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [userJourney, setUserJourney] = useState<string[]>([]);

  const updatePersonalizationData = useCallback((updates: Partial<PersonalizationData>) => {
    updatePersonalization(updates);
    
    // Update personalization level based on data completeness
    const requiredFields = ['userType', 'preferredLanguage', 'deviceType'];
    const completedFields = requiredFields.filter(field => updates[field as keyof PersonalizationData]);
    const completionRate = (completedFields.length / requiredFields.length) * 100;
    
    setPersonalizationLevel(completionRate);

    trackEvent({
      eventType: 'interaction',
      component: 'usePersonalization',
      action: 'updateData',
      context: 'personalization',
      metadata: { updates, completionRate },
      timestamp: Date.now(),
      sessionId: generateSessionId(),
      deviceType: state.personalization.deviceType,
    });
  }, [updatePersonalization, trackEvent, state.personalization.deviceType]);

  const addToJourney = useCallback((step: string) => {
    setUserJourney(prev => [...prev, step]);
    
    trackEvent({
      eventType: 'interaction',
      component: 'usePersonalization',
      action: 'journeyStep',
      context: 'user-journey',
      metadata: { step, fullJourney: [...userJourney, step] },
      timestamp: Date.now(),
      sessionId: generateSessionId(),
      deviceType: state.personalization.deviceType,
    });
  }, [userJourney, trackEvent, state.personalization.deviceType]);

  const getPersonalizationSuggestions = useCallback(() => {
    const suggestions = [];
    
    if (personalizationLevel < 50) {
      suggestions.push({
        type: 'profile-completion',
        message: 'Complete your profile for better recommendations',
        action: 'complete-profile',
      });
    }
    
    if (state.personalization.healthGoals?.length === 0) {
      suggestions.push({
        type: 'health-goals',
        message: 'Set health goals to receive personalized care suggestions',
        action: 'set-goals',
      });
    }
    
    if (!state.personalization.insuranceProvider) {
      suggestions.push({
        type: 'insurance',
        message: 'Add your insurance information for coverage verification',
        action: 'add-insurance',
      });
    }
    
    return suggestions;
  }, [personalizationLevel, state.personalization]);

  return {
    personalizationLevel,
    recommendations,
    userJourney,
    updatePersonalizationData,
    addToJourney,
    getPersonalizationSuggestions,
    currentPersonalization: state.personalization,
  };
};

// Hook for voice navigation
export const useVoiceNavigation = (enabled: boolean = true) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [commands, setCommands] = useState<string[]>([]);
  const { trackEvent } = useUXContext();

  useEffect(() => {
    // Check for Web Speech API support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    setIsSupported(true);
  }, []);

  const startListening = useCallback(() => {
    if (!isSupported || isListening) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-SG';

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript('');
      setConfidence(0);
    };

    recognition.onresult = (event) => {
      const results = Array.from(event.results);
      const lastResult = results[results.length - 1];
      
      if (lastResult.isFinal) {
        const newTranscript = lastResult[0].transcript;
        const newConfidence = lastResult[0].confidence || 0;
        
        setTranscript(newTranscript);
        setConfidence(newConfidence);
        setCommands(prev => [...prev, newTranscript]);
        
        trackEvent({
          eventType: 'interaction',
          component: 'useVoiceNavigation',
          action: 'voiceCommand',
          context: 'voice-navigation',
          metadata: { transcript: newTranscript, confidence: newConfidence },
          timestamp: Date.now(),
          sessionId: generateSessionId(),
          deviceType: 'desktop',
        });
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  }, [isSupported, isListening, trackEvent]);

  const stopListening = useCallback(() => {
    if (!isSupported || !isListening) return;
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    // Note: In a real implementation, you'd need to store the recognition instance
    // This is simplified for the example
    setIsListening(false);
  }, [isSupported, isListening]);

  const clearTranscript = useCallback(() => {
    setTranscript('');
    setConfidence(0);
    setCommands([]);
  }, []);

  return {
    isSupported,
    isListening,
    transcript,
    confidence,
    commands,
    startListening,
    stopListening,
    clearTranscript,
  };
};

// Hook for offline management
export const useOfflineManager = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineQueue, setOfflineQueue] = useState<any[]>([]);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const { trackEvent } = useUXContext();

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncOfflineQueue();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const addToOfflineQueue = useCallback((action: string, data: any) => {
    if (isOnline) {
      // Execute immediately if online
      executeAction(action, data);
    } else {
      // Add to queue for later execution
      setOfflineQueue(prev => [...prev, { action, data, timestamp: Date.now() }]);
      
      trackEvent({
        eventType: 'interaction',
        component: 'useOfflineManager',
        action: 'queueOffline',
        context: 'offline-management',
        metadata: { action, data },
        timestamp: Date.now(),
        sessionId: generateSessionId(),
        deviceType: 'desktop',
      });
    }
  }, [isOnline, trackEvent]);

  const syncOfflineQueue = useCallback(async () => {
    if (offlineQueue.length === 0 || syncStatus === 'syncing') return;

    setSyncStatus('syncing');
    const errors: string[] = [];

    for (const item of offlineQueue) {
      try {
        await executeAction(item.action, item.data);
      } catch (error) {
        errors.push(`Failed to sync ${item.action}: ${error}`);
      }
    }

    setOfflineQueue([]);
    setSyncStatus(errors.length === 0 ? 'success' : 'error');
    
    trackEvent({
      eventType: 'interaction',
      component: 'useOfflineManager',
      action: 'syncComplete',
      context: 'offline-management',
      metadata: { errors, syncedItems: offlineQueue.length },
      timestamp: Date.now(),
      sessionId: generateSessionId(),
      deviceType: 'desktop',
    });
  }, [offlineQueue, syncStatus, trackEvent]);

  const executeAction = useCallback(async (action: string, data: any) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 100));
    
    trackEvent({
      eventType: 'interaction',
      component: 'useOfflineManager',
      action: 'executeAction',
      context: 'offline-management',
      metadata: { action, data },
      timestamp: Date.now(),
      sessionId: generateSessionId(),
      deviceType: 'desktop',
    });
  }, [trackEvent]);

  return {
    isOnline,
    offlineQueue,
    syncStatus,
    addToOfflineQueue,
    syncOfflineQueue,
  };
};

// Utility function
const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};