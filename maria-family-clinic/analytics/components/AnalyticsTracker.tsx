// Analytics Event Tracking Components
// Sub-Phase 10.1: Advanced Analytics & Tracking System Architecture

'use client';

import React, { useEffect, useCallback, useRef } from 'react';
import { analyticsApi } from '../api/analytics-client';

// User Journey Tracking Component
export function UserJourneyTracker({ 
  children, 
  clinicId, 
  trackPageViews = true,
  trackClicks = true,
  trackFormSubmissions = true 
}: {
  children: React.ReactNode;
  clinicId?: string;
  trackPageViews?: boolean;
  trackClicks?: boolean;
  trackFormSubmissions?: boolean;
}) {
  const sessionId = useRef<string>(`session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const userId = useRef<string | undefined>(undefined);
  const visitedPages = useRef<Set<string>>(new Set());

  const trackEvent = useCallback(async (
    eventType: string,
    properties: Record<string, any> = {}
  ) => {
    try {
      await analyticsApi.trackEvent.mutate({
        eventType,
        userId: userId.current,
        sessionId: sessionId.current,
        clinicId,
        properties: {
          ...properties,
          sessionDuration: Date.now() - parseInt(sessionId.current.split('_')[1]),
          timestamp: new Date(),
        },
        metadata: {
          pageUrl: window.location.href,
          referrer: document.referrer,
          screenResolution: `${window.screen.width}x${window.screen.height}`,
          viewportSize: `${window.innerWidth}x${window.innerHeight}`,
        },
      });
    } catch (error) {
      console.warn('Analytics tracking failed:', error);
    }
  }, [clinicId]);

  const trackPageView = useCallback(() => {
    const pagePath = window.location.pathname + window.location.search;
    if (!visitedPages.current.has(pagePath)) {
      visitedPages.current.add(pagePath);
      trackEvent('page_view', {
        page: pagePath,
        pageTitle: document.title,
        timeOnPage: 0,
      });
    }
  }, [trackEvent]);

  const trackClick = useCallback((event: MouseEvent) => {
    const target = event.target as HTMLElement;
    const clickableElement = target.closest('a, button, [data-analytics-click]');
    
    if (clickableElement) {
      const element = clickableElement as HTMLElement;
      trackEvent('click', {
        elementType: element.tagName.toLowerCase(),
        elementText: element.textContent?.trim() || '',
        elementId: element.id || '',
        elementClass: element.className || '',
        pageX: event.pageX,
        pageY: event.pageY,
      });
    }
  }, [trackEvent]);

  const trackFormSubmission = useCallback((event: Event) => {
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    const formFields: Record<string, string> = {};
    
    // Only track field names, not values (privacy compliance)
    Array.from(formData.keys()).forEach(key => {
      formFields[key] = 'filled';
    });

    trackEvent('form_submission', {
      formId: form.id || 'unknown',
      formAction: form.action || '',
      formMethod: form.method || 'get',
      fields: formFields,
      timeToSubmit: Date.now() - parseInt(sessionId.current.split('_')[1]),
    });
  }, [trackEvent]);

  useEffect(() => {
    // Track initial page view
    if (trackPageViews) {
      trackPageView();
    }

    // Set up click tracking
    if (trackClicks) {
      document.addEventListener('click', trackClick);
    }

    // Set up form submission tracking
    if (trackFormSubmissions) {
      document.addEventListener('submit', trackFormSubmission);
    }

    // Track page unload for session duration
    const handleBeforeUnload = () => {
      trackEvent('page_unload', {
        timeOnPage: Date.now() - parseInt(sessionId.current.split('_')[1]),
      });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      if (trackClicks) {
        document.removeEventListener('click', trackClick);
      }
      if (trackFormSubmissions) {
        document.removeEventListener('submit', trackFormSubmission);
      }
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [trackPageView, trackClick, trackFormSubmission, trackEvent, trackPageViews, trackClicks, trackFormSubmissions]);

  return <>{children}</>;
}

// Healthcare-Specific Event Tracking Component
export function HealthcareEventTracker({ 
  children, 
  clinicId,
  trackDoctorViews = true,
  trackServiceViews = true,
  trackAppointmentBookings = true,
  trackHealthierSG = true,
}: {
  children: React.ReactNode;
  clinicId?: string;
  trackDoctorViews?: boolean;
  trackServiceViews?: boolean;
  trackAppointmentBookings?: boolean;
  trackHealthierSG?: boolean;
}) {
  const trackEvent = useCallback(async (
    eventType: string,
    properties: Record<string, any> = {}
  ) => {
    try {
      await analyticsApi.trackEvent.mutate({
        eventType,
        properties: {
          ...properties,
          timestamp: new Date(),
          context: 'healthcare',
        },
        clinicId,
      });
    } catch (error) {
      console.warn('Healthcare analytics tracking failed:', error);
    }
  }, [clinicId]);

  const trackDoctorView = useCallback((doctorId: string, doctorName: string) => {
    if (trackDoctorViews) {
      trackEvent('doctor_profile_view', {
        doctorId,
        doctorName,
        pageUrl: window.location.href,
      });
    }
  }, [trackEvent, trackDoctorViews]);

  const trackServiceView = useCallback((serviceId: string, serviceName: string) => {
    if (trackServiceViews) {
      trackEvent('service_view', {
        serviceId,
        serviceName,
        pageUrl: window.location.href,
      });
    }
  }, [trackEvent, trackServiceViews]);

  const trackAppointmentBooking = useCallback((appointmentDetails: {
    doctorId: string;
    serviceId: string;
    appointmentDate: Date;
    bookingMethod: 'online' | 'phone' | 'walk-in';
  }) => {
    if (trackAppointmentBookings) {
      trackEvent('appointment_booking', {
        ...appointmentDetails,
        timestamp: new Date(),
      });
    }
  }, [trackEvent, trackAppointmentBookings]);

  const trackHealthierSGInteraction = useCallback((action: string, details: Record<string, any> = {}) => {
    if (trackHealthierSG) {
      trackEvent('healthier_sg_interaction', {
        action,
        ...details,
        timestamp: new Date(),
      });
    }
  }, [trackEvent, trackHealthierSG]);

  // Provide tracking functions through React context
  const contextValue = {
    trackDoctorView,
    trackServiceView,
    trackAppointmentBooking,
    trackHealthierSGInteraction,
  };

  return (
    <HealthcareAnalyticsContext.Provider value={contextValue}>
      {children}
    </HealthcareAnalyticsContext.Provider>
  );
}

// React Context for Healthcare Analytics
const HealthcareAnalyticsContext = React.createContext<{
  trackDoctorView: (doctorId: string, doctorName: string) => void;
  trackServiceView: (serviceId: string, serviceName: string) => void;
  trackAppointmentBooking: (appointmentDetails: {
    doctorId: string;
    serviceId: string;
    appointmentDate: Date;
    bookingMethod: 'online' | 'phone' | 'walk-in';
  }) => void;
  trackHealthierSGInteraction: (action: string, details?: Record<string, any>) => void;
} | null>(null);

// Hook to use healthcare analytics tracking
export function useHealthcareAnalytics() {
  const context = React.useContext(HealthcareAnalyticsContext);
  if (!context) {
    throw new Error('useHealthcareAnalytics must be used within HealthcareEventTracker');
  }
  return context;
}

// Marketing Event Tracking Component
export function MarketingEventTracker({ 
  children, 
  trackCampaigns = true,
  trackConversions = true,
  trackUserAcquisition = true,
}: {
  children: React.ReactNode;
  trackCampaigns?: boolean;
  trackConversions?: boolean;
  trackUserAcquisition?: boolean;
}) {
  const trackEvent = useCallback(async (
    eventType: string,
    properties: Record<string, any> = {}
  ) => {
    try {
      await analyticsApi.trackEvent.mutate({
        eventType,
        properties: {
          ...properties,
          timestamp: new Date(),
          context: 'marketing',
        },
      });
    } catch (error) {
      console.warn('Marketing analytics tracking failed:', error);
    }
  }, []);

  const trackCampaignView = useCallback((campaignId: string, campaignName: string) => {
    if (trackCampaigns) {
      trackEvent('campaign_view', {
        campaignId,
        campaignName,
        source: new URLSearchParams(window.location.search).get('utm_source') || 'direct',
        medium: new URLSearchParams(window.location.search).get('utm_medium') || 'none',
        campaign: new URLSearchParams(window.location.search).get('utm_campaign') || 'none',
      });
    }
  }, [trackEvent, trackCampaigns]);

  const trackConversion = useCallback((conversionType: string, value: number, currency: string = 'SGD') => {
    if (trackConversions) {
      trackEvent('conversion', {
        conversionType,
        value,
        currency,
        timestamp: new Date(),
      });
    }
  }, [trackEvent, trackConversions]);

  const trackUserAcquisition = useCallback((source: string, medium: string, campaign?: string) => {
    if (trackUserAcquisition) {
      trackEvent('user_acquisition', {
        source,
        medium,
        campaign,
        timestamp: new Date(),
      });
    }
  }, [trackEvent, trackUserAcquisition]);

  return (
    <MarketingAnalyticsContext.Provider value={{
      trackCampaignView,
      trackConversion,
      trackUserAcquisition,
    }}>
      {children}
    </MarketingAnalyticsContext.Provider>
  );
}

const MarketingAnalyticsContext = React.createContext<{
  trackCampaignView: (campaignId: string, campaignName: string) => void;
  trackConversion: (conversionType: string, value: number, currency?: string) => void;
  trackUserAcquisition: (source: string, medium: string, campaign?: string) => void;
} | null>(null);

export function useMarketingAnalytics() {
  const context = React.useContext(MarketingAnalyticsContext);
  if (!context) {
    throw new Error('useMarketingAnalytics must be used within MarketingEventTracker');
  }
  return context;
}

// Performance Monitoring Component
export function PerformanceMonitor({ 
  children, 
  trackCoreWebVitals = true,
  trackApiPerformance = true,
  trackErrorTracking = true,
}: {
  children: React.ReactNode;
  trackCoreWebVitals?: boolean;
  trackApiPerformance?: boolean;
  trackErrorTracking?: boolean;
}) {
  const trackEvent = useCallback(async (
    eventType: string,
    properties: Record<string, any> = {}
  ) => {
    try {
      await analyticsApi.trackEvent.mutate({
        eventType,
        properties: {
          ...properties,
          timestamp: new Date(),
          context: 'performance',
        },
      });
    } catch (error) {
      console.warn('Performance analytics tracking failed:', error);
    }
  }, []);

  // Track Core Web Vitals
  useEffect(() => {
    if (!trackCoreWebVitals) return;

    const trackWebVital = (metric: any) => {
      trackEvent('web_vital', {
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
        url: window.location.href,
        userAgent: navigator.userAgent,
      });
    };

    // Load and track Core Web Vitals
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(trackWebVital);
      getFID(trackWebVital);
      getFCP(trackWebVital);
      getLCP(trackWebVital);
      getTTFB(trackWebVital);
    });
  }, [trackEvent, trackCoreWebVitals]);

  // Track API performance
  useEffect(() => {
    if (!trackApiPerformance) return;

    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const start = performance.now();
      try {
        const response = await originalFetch(...args);
        const duration = performance.now() - start;
        
        trackEvent('api_request', {
          url: args[0] instanceof Request ? args[0].url : args[0].toString(),
          method: args[0] instanceof Request ? args[0].method : 'GET',
          duration,
          status: response.status,
          ok: response.ok,
        });

        return response;
      } catch (error) {
        const duration = performance.now() - start;
        trackEvent('api_error', {
          url: args[0] instanceof Request ? args[0].url : args[0].toString(),
          method: args[0] instanceof Request ? args[0].method : 'GET',
          duration,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        throw error;
      }
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, [trackEvent, trackApiPerformance]);

  // Track JavaScript errors
  useEffect(() => {
    if (!trackErrorTracking) return;

    const handleError = (event: ErrorEvent) => {
      trackEvent('javascript_error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
        url: window.location.href,
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      trackEvent('unhandled_promise_rejection', {
        reason: event.reason?.toString() || 'Unknown',
        url: window.location.href,
      });
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [trackEvent, trackErrorTracking]);

  return <>{children}</>;
}

// Privacy-Compliant Analytics Component (for PDPA compliance)
export function PrivacyCompliantAnalytics({ 
  children,
  anonymizeIP = true,
  respectDoNotTrack = true,
}: {
  children: React.ReactNode;
  anonymizeIP?: boolean;
  respectDoNotTrack?: boolean;
}) {
  const trackAnonymizedEvent = useCallback(async (
    eventType: string,
    properties: Record<string, any> = {}
  ) => {
    // Respect Do Not Track
    if (respectDoNotTrack && navigator.doNotTrack === '1') {
      return;
    }

    try {
      // Create hashed user ID for privacy
      const hashedUserId = anonymizeIP ? 
        btoa(`${navigator.userAgent}_${new Date().getDate()}`).slice(0, 16) : 
        undefined;

      await analyticsApi.trackAnonymizedEvent.mutate({
        eventType,
        hashedUserId,
        properties: {
          ...properties,
          // Remove any potentially identifying information
          url: properties.url ? properties.url.replace(/\?.*$/, '') : undefined,
          anonymized: true,
        },
        timestamp: new Date(),
      });
    } catch (error) {
      console.warn('Privacy-compliant analytics tracking failed:', error);
    }
  }, [anonymizeIP, respectDoNotTrack]);

  return (
    <PrivacyAnalyticsContext.Provider value={{ trackAnonymizedEvent }}>
      {children}
    </PrivacyAnalyticsContext.Provider>
  );
}

const PrivacyAnalyticsContext = React.createContext<{
  trackAnonymizedEvent: (eventType: string, properties?: Record<string, any>) => void;
} | null>(null);

export function usePrivacyAnalytics() {
  const context = React.useContext(PrivacyAnalyticsContext);
  if (!context) {
    throw new Error('usePrivacyAnalytics must be used within PrivacyCompliantAnalytics');
  }
  return context;
}