// UX Context Provider for My Family Clinic
// Healthcare-specific UX state management with accessibility and personalization

'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { UXContextState, PersonalizationData, UXAnalyticsEvent } from '../types';

interface UXContextProviderProps {
  children: React.ReactNode;
  initialPersonalization?: Partial<PersonalizationData>;
}

interface UXAction {
  type: 
    | 'SET_PERSONALIZATION'
    | 'UPDATE_ACCESSIBILITY'
    | 'SET_PERFORMANCE_STATE'
    | 'SET_MEDICAL_CONTEXT'
    | 'TRACK_EVENT'
    | 'SET_LOADING_STATE'
    | 'SET_ERROR_STATE'
    | 'SET_SUCCESS_STATE';
  payload: any;
}

const initialState: UXContextState = {
  personalization: {
    userType: 'patient',
    preferredLanguage: 'en',
    deviceType: 'desktop',
    healthGoals: [],
    appointmentHistory: [],
  },
  accessibility: {
    fontSize: 16,
    highContrast: false,
    reducedMotion: false,
    screenReader: false,
    voiceNavigation: false,
  },
  performance: {
    isSlowConnection: false,
    isLowPowerMode: false,
    cacheStatus: 'fresh',
  },
  medicalContext: {
    currentVisitType: 'routine',
    sensitiveInformation: false,
    requiresPrivacy: false,
  },
};

const uxReducer = (state: UXContextState, action: UXAction): UXContextState => {
  switch (action.type) {
    case 'SET_PERSONALIZATION':
      return {
        ...state,
        personalization: { ...state.personalization, ...action.payload },
      };
    case 'UPDATE_ACCESSIBILITY':
      return {
        ...state,
        accessibility: { ...state.accessibility, ...action.payload },
      };
    case 'SET_PERFORMANCE_STATE':
      return {
        ...state,
        performance: { ...state.performance, ...action.payload },
      };
    case 'SET_MEDICAL_CONTEXT':
      return {
        ...state,
        medicalContext: { ...state.medicalContext, ...action.payload },
      };
    case 'SET_LOADING_STATE':
      return {
        ...state,
        performance: {
          ...state.performance,
          isLoading: action.payload.isLoading,
          loadingMessage: action.payload.message,
          loadingProgress: action.payload.progress,
        },
      };
    case 'SET_ERROR_STATE':
      return {
        ...state,
        error: {
          hasError: true,
          message: action.payload.message,
          context: action.payload.context,
        },
      };
    case 'SET_SUCCESS_STATE':
      return {
        ...state,
        success: {
          showSuccess: true,
          message: action.payload.message,
          context: action.payload.context,
        },
      };
    default:
      return state;
  }
};

const UXContext = createContext<{
  state: UXContextState;
  dispatch: React.Dispatch<UXAction>;
  trackEvent: (event: UXAnalyticsEvent) => void;
  updatePersonalization: (data: Partial<PersonalizationData>) => void;
  setAccessibility: (settings: Partial<UXContextState['accessibility']>) => void;
  setMedicalContext: (context: Partial<UXContextState['medicalContext']>) => void;
  showLoading: (message: string, progress?: number) => void;
  hideLoading: () => void;
  showError: (message: string, context: string) => void;
  showSuccess: (message: string, context: string) => void;
} | null>(null);

export const UXContextProvider: React.FC<UXContextProviderProps> = ({
  children,
  initialPersonalization = {},
}) => {
  const [state, dispatch] = useReducer(uxReducer, {
    ...initialState,
    personalization: { ...initialState.personalization, ...initialPersonalization },
  });

  // Initialize device detection and accessibility preferences
  useEffect(() => {
    const detectDeviceType = () => {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
      const isTablet = /iPad|Android(?!.*Mobile)/i.test(navigator.userAgent);
      
      let deviceType: 'mobile' | 'tablet' | 'desktop' = 'desktop';
      if (isMobile) deviceType = 'mobile';
      else if (isTablet) deviceType = 'tablet';

      dispatch({
        type: 'SET_PERSONALIZATION',
        payload: { deviceType },
      });
    };

    const detectPerformance = () => {
      const connection = (navigator as any).connection;
      const isSlowConnection = connection?.effectiveType === 'slow-2g' || connection?.effectiveType === '2g';
      const isLowPowerMode = (window as any).matchMedia('(prefers-reduced-motion: reduce)').matches;
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      dispatch({
        type: 'SET_PERFORMANCE_STATE',
        payload: {
          isSlowConnection,
          isLowPowerMode,
        },
      });

      dispatch({
        type: 'UPDATE_ACCESSIBILITY',
        payload: { reducedMotion: prefersReducedMotion },
      });
    };

    const detectAccessibility = () => {
      const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
      const prefersColorScheme = window.matchMedia('(prefers-color-scheme: dark)').matches;

      dispatch({
        type: 'UPDATE_ACCESSIBILITY',
        payload: { highContrast: prefersHighContrast },
      });
    };

    detectDeviceType();
    detectPerformance();
    detectAccessibility();

    // Listen for performance changes
    if ((navigator as any).connection) {
      (navigator as any).connection.addEventListener('change', detectPerformance);
    }

    // Listen for accessibility preference changes
    const mediaQueries = [
      '(prefers-reduced-motion: reduce)',
      '(prefers-contrast: high)',
      '(prefers-color-scheme: dark)',
    ];

    mediaQueries.forEach(query => {
      const mq = window.matchMedia(query);
      mq.addEventListener('change', () => {
        detectPerformance();
        detectAccessibility();
      });
    });

    return () => {
      if ((navigator as any).connection) {
        (navigator as any).connection.removeEventListener('change', detectPerformance);
      }
    };
  }, []);

  // Track UX events for analytics
  const trackEvent = useCallback((event: UXAnalyticsEvent) => {
    // In a real implementation, this would send to analytics service
    console.log('UX Event Tracked:', event);
    
    // Also dispatch to state for local tracking
    dispatch({
      type: 'TRACK_EVENT',
      payload: event,
    });
  }, []);

  // Update personalization data
  const updatePersonalization = useCallback((data: Partial<PersonalizationData>) => {
    dispatch({
      type: 'SET_PERSONALIZATION',
      payload: data,
    });

    trackEvent({
      eventType: 'interaction',
      component: 'UXContext',
      action: 'updatePersonalization',
      context: 'personalization',
      metadata: data,
      timestamp: Date.now(),
      sessionId: generateSessionId(),
      deviceType: state.personalization.deviceType,
    });
  }, [state.personalization.deviceType]);

  // Set accessibility preferences
  const setAccessibility = useCallback((settings: Partial<UXContextState['accessibility']>) => {
    dispatch({
      type: 'UPDATE_ACCESSIBILITY',
      payload: settings,
    });

    trackEvent({
      eventType: 'interaction',
      component: 'UXContext',
      action: 'updateAccessibility',
      context: 'accessibility',
      metadata: settings,
      timestamp: Date.now(),
      sessionId: generateSessionId(),
      deviceType: state.personalization.deviceType,
    });
  }, [state.personalization.deviceType]);

  // Set medical context
  const setMedicalContext = useCallback((context: Partial<UXContextState['medicalContext']>) => {
    dispatch({
      type: 'SET_MEDICAL_CONTEXT',
      payload: context,
    });

    trackEvent({
      eventType: 'interaction',
      component: 'UXContext',
      action: 'updateMedicalContext',
      context: 'medical',
      metadata: context,
      timestamp: Date.now(),
      sessionId: generateSessionId(),
      deviceType: state.personalization.deviceType,
      healthcareContext: context.currentVisitType,
    });
  }, [state.personalization.deviceType]);

  // Loading state management
  const showLoading = useCallback((message: string, progress?: number) => {
    dispatch({
      type: 'SET_LOADING_STATE',
      payload: { isLoading: true, message, progress },
    });
  }, []);

  const hideLoading = useCallback(() => {
    dispatch({
      type: 'SET_LOADING_STATE',
      payload: { isLoading: false, message: undefined, progress: undefined },
    });
  }, []);

  // Error state management
  const showError = useCallback((message: string, context: string) => {
    dispatch({
      type: 'SET_ERROR_STATE',
      payload: { message, context },
    });

    trackEvent({
      eventType: 'error',
      component: 'UXContext',
      action: 'showError',
      context,
      metadata: { message },
      timestamp: Date.now(),
      sessionId: generateSessionId(),
      deviceType: state.personalization.deviceType,
      healthcareContext: state.medicalContext.currentVisitType,
    });
  }, [state.personalization.deviceType, state.medicalContext.currentVisitType]);

  // Success state management
  const showSuccess = useCallback((message: string, context: string) => {
    dispatch({
      type: 'SET_SUCCESS_STATE',
      payload: { message, context },
    });

    trackEvent({
      eventType: 'interaction',
      component: 'UXContext',
      action: 'showSuccess',
      context,
      metadata: { message },
      timestamp: Date.now(),
      sessionId: generateSessionId(),
      deviceType: state.personalization.deviceType,
      healthcareContext: state.medicalContext.currentVisitType,
    });
  }, [state.personalization.deviceType, state.medicalContext.currentVisitType]);

  return (
    <UXContext.Provider
      value={{
        state,
        dispatch,
        trackEvent,
        updatePersonalization,
        setAccessibility,
        setMedicalContext,
        showLoading,
        hideLoading,
        showError,
        showSuccess,
      }}
    >
      {children}
    </UXContext.Provider>
  );
};

export const useUXContext = () => {
  const context = useContext(UXContext);
  if (!context) {
    throw new Error('useUXContext must be used within a UXContextProvider');
  }
  return context;
};

// Utility function to generate session ID
const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};