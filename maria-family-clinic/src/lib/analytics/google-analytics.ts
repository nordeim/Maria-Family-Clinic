// Google Analytics 4 Integration for Contact System
// Sub-Phase 9.8: Comprehensive tracking with custom event tracking

'use client';

import { useEffect, useRef } from 'react';
import { 
  ContactEventType, 
  GoogleAnalyticsConfig, 
  GoogleAnalyticsEvent,
  ContactAnalyticsEvent 
} from '@/types/analytics';

// Global gtag function declaration
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

// Google Analytics Configuration
const GA_CONFIG: GoogleAnalyticsConfig = {
  trackingId: process.env.NEXT_PUBLIC_GA_TRACKING_ID || '',
  measurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '',
  apiSecret: process.env.NEXT_PUBLIC_GA_API_SECRET || '',
  enhancedEcommerce: true,
  crossDomainTracking: false,
  customDimensions: [
    { index: 1, name: 'clinic_id', scope: 'session' },
    { index: 2, name: 'form_type', scope: 'event' },
    { index: 3, name: 'enquiry_category', scope: 'event' },
    { index: 4, name: 'device_type', scope: 'session' },
    { index: 5, name: 'user_segment', scope: 'session' },
  ],
  customMetrics: [
    { index: 1, name: 'form_completion_time', type: 'time' },
    { index: 2, name: 'page_load_time', type: 'time' },
    { index: 3, name: 'form_interactions_count', type: 'integer' },
  ],
  events: [
    {
      eventName: 'form_interaction',
      eventCategory: 'Contact Form',
      eventAction: 'interaction',
      eventLabel: 'Contact Form Event',
      customParameters: { form_step: 'engagement' },
      conditions: [
        { trigger: 'onClick', eventType: ContactEventType.FORM_START, operator: 'equals', value: 'start' },
        { trigger: 'onBlur', eventType: ContactEventType.FORM_FIELD_FOCUS, operator: 'equals', value: 'focus' },
        { trigger: 'onSubmit', eventType: ContactEventType.FORM_SUBMIT, operator: 'equals', value: 'submit' },
        { trigger: 'onComplete', eventType: ContactEventType.FORM_COMPLETE, operator: 'equals', value: 'complete' },
      ],
    },
    {
      eventName: 'enquiry_lifecycle',
      eventCategory: 'Enquiry Management',
      eventAction: 'lifecycle',
      customParameters: { enquiry_status: 'processing' },
      conditions: [
        { trigger: 'onView', eventType: ContactEventType.ENQUIRY_VIEW, operator: 'equals', value: 'view' },
        { trigger: 'onResponse', eventType: ContactEventType.ENQUIRY_RESPONSE_VIEW, operator: 'equals', value: 'response_view' },
        { trigger: 'onRating', eventType: ContactEventType.ENQUIRY_RATING, operator: 'equals', value: 'rating' },
      ],
    },
    {
      eventName: 'performance_metric',
      eventCategory: 'Performance',
      eventAction: 'load',
      customParameters: { performance_type: 'page_load' },
      conditions: [
        { trigger: 'onLoad', eventType: ContactEventType.SLOW_LOAD, operator: 'equals', value: 'slow_load' },
        { trigger: 'onError', eventType: ContactEventType.JS_ERROR, operator: 'equals', value: 'js_error' },
        { trigger: 'onNetworkError', eventType: ContactEventType.NETWORK_ERROR, operator: 'equals', value: 'network_error' },
      ],
    },
  ],
};

// Google Analytics Manager Class
export class GoogleAnalyticsManager {
  private static instance: GoogleAnalyticsManager;
  private initialized = false;
  private queue: any[] = [];

  static getInstance(): GoogleAnalyticsManager {
    if (!GoogleAnalyticsManager.instance) {
      GoogleAnalyticsManager.instance = new GoogleAnalyticsManager();
    }
    return GoogleAnalyticsManager.instance;
  }

  // Initialize Google Analytics
  async initialize(config?: Partial<GoogleAnalyticsConfig>): Promise<void> {
    if (this.initialized) return;

    try {
      const gaConfig = { ...GA_CONFIG, ...config };
      
      // Load Google Analytics script
      await this.loadGoogleAnalyticsScript();
      
      // Initialize gtag
      window.gtag = window.gtag || function() {
        (window.gtag as any).queue = (window.gtag as any).queue || [];
        (window.gtag as any).queue.push(arguments);
      };
      window.gtag('js', new Date());
      window.gtag('config', gaConfig.measurementId, {
        page_title: document.title,
        page_location: window.location.href,
        custom_map: this.buildCustomMap(gaConfig),
      });

      // Set up enhanced ecommerce
      if (gaConfig.enhancedEcommerce) {
        this.setupEnhancedEcommerce(gaConfig.measurementId);
      }

      this.initialized = true;
      
      // Process queued events
      this.processQueue();
    } catch (error) {
      console.error('Failed to initialize Google Analytics:', error);
    }
  }

  // Track custom event
  trackEvent(
    eventName: string,
    eventCategory: string,
    eventAction: string,
    eventLabel?: string,
    customParameters: Record<string, any> = {}
  ): void {
    const event = {
      event_name: eventName,
      event_category: eventCategory,
      event_action: eventAction,
      event_label: eventLabel,
      custom_parameters: customParameters,
    };

    if (this.initialized && window.gtag) {
      window.gtag('event', eventName, {
        event_category: eventCategory,
        event_action: eventAction,
        event_label: eventLabel,
        ...customParameters,
      });
    } else {
      this.queue.push(event);
    }
  }

  // Track contact form events
  trackFormEvent(
    eventType: ContactEventType,
    formId: string,
    formName: string,
    additionalData: Record<string, any> = {}
  ): void {
    const formEventMap = {
      [ContactEventType.FORM_VIEW]: { action: 'view', label: 'Form Viewed' },
      [ContactEventType.FORM_START]: { action: 'start', label: 'Form Started' },
      [ContactEventType.FORM_FIELD_FOCUS]: { action: 'focus', label: 'Field Focused' },
      [ContactEventType.FORM_SUBMIT]: { action: 'submit', label: 'Form Submitted' },
      [ContactEventType.FORM_COMPLETE]: { action: 'complete', label: 'Form Completed' },
      [ContactEventType.FORM_ABANDON]: { action: 'abandon', label: 'Form Abandoned' },
    };

    const mapping = formEventMap[eventType];
    if (!mapping) return;

    this.trackEvent(
      'form_interaction',
      'Contact Form',
      mapping.action,
      mapping.label,
      {
        form_id: formId,
        form_name: formName,
        form_event: eventType,
        ...additionalData,
      }
    );
  }

  // Track enquiry events
  trackEnquiryEvent(
    eventType: ContactEventType,
    enquiryId: string,
    enquiryCategory: string,
    additionalData: Record<string, any> = {}
  ): void {
    this.trackEvent(
      'enquiry_lifecycle',
      'Enquiry Management',
      'lifecycle',
      `Enquiry ${eventType}`,
      {
        enquiry_id: enquiryId,
        enquiry_category: enquiryCategory,
        enquiry_event: eventType,
        ...additionalData,
      }
    );
  }

  // Track performance events
  trackPerformanceEvent(
    eventType: ContactEventType,
    metricName: string,
    value: number,
    unit: string,
    additionalData: Record<string, any> = {}
  ): void {
    this.trackEvent(
      'performance_metric',
      'Performance',
      metricName,
      `${metricName} ${value}${unit}`,
      {
        metric_name: metricName,
        metric_value: value,
        metric_unit: unit,
        performance_event: eventType,
        ...additionalData,
      }
    );
  }

  // Track customer satisfaction
  trackSatisfaction(
    npsScore: number,
    csatScore: number,
    enquiryId: string,
    additionalData: Record<string, any> = {}
  ): void {
    this.trackEvent(
      'satisfaction_survey',
      'Customer Feedback',
      'completed',
      `NPS: ${npsScore}, CSAT: ${csatScore}`,
      {
        nps_score: npsScore,
        csat_score: csatScore,
        enquiry_id: enquiryId,
        ...additionalData,
      }
    );
  }

  // Track A/B test events
  trackABTestEvent(
    testId: string,
    variantId: string,
    eventName: string,
    additionalData: Record<string, any> = {}
  ): void {
    this.trackEvent(
      'ab_test_event',
      'Experimentation',
      eventName,
      `${testId}_${variantId}`,
      {
        test_id: testId,
        variant_id: variantId,
        ...additionalData,
      }
    );
  }

  // Set user properties
  setUserProperties(properties: Record<string, any>): void {
    if (this.initialized && window.gtag) {
      window.gtag('config', GA_CONFIG.measurementId, {
        custom_map: properties,
      });
    }
  }

  // Track e-commerce events for appointment bookings
  trackPurchase(
    transactionId: string,
    items: Array<{
      item_id: string;
      item_name: string;
      category: string;
      quantity: number;
      price: number;
    }>,
    value: number,
    currency: string = 'SGD'
  ): void {
    if (this.initialized && window.gtag) {
      window.gtag('event', 'purchase', {
        transaction_id: transactionId,
        value: value,
        currency: currency,
        items: items,
      });
    }
  }

  // Private helper methods
  private async loadGoogleAnalyticsScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (document.querySelector('script[src*="googletagmanager.com/gtag/js"]')) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_CONFIG.measurementId}`;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google Analytics'));
      document.head.appendChild(script);
    });
  }

  private buildCustomMap(config: GoogleAnalyticsConfig): Record<string, string> {
    const customMap: Record<string, string> = {};
    
    config.customDimensions.forEach((dim) => {
      customMap[`custom_dim_${dim.index}`] = dim.name;
    });
    
    config.customMetrics.forEach((metric) => {
      customMap[`custom_metric_${metric.index}`] = metric.name;
    });
    
    return customMap;
  }

  private setupEnhancedEcommerce(measurementId: string): void {
    // Enhanced ecommerce setup for appointment bookings and service purchases
    if (window.gtag) {
      window.gtag('config', measurementId, {
        enhanced_ecommerce: 'true',
      });
    }
  }

  private processQueue(): void {
    while (this.queue.length > 0) {
      const event = this.queue.shift();
      this.trackEvent(
        event.event_name,
        event.event_category,
        event.event_action,
        event.event_label,
        event.custom_parameters
      );
    }
  }
}

// React Hook for Google Analytics
export function useGoogleAnalytics() {
  const gaManager = GoogleAnalyticsManager.getInstance();

  useEffect(() => {
    gaManager.initialize();
  }, []);

  return {
    trackEvent: gaManager.trackEvent.bind(gaManager),
    trackFormEvent: gaManager.trackFormEvent.bind(gaManager),
    trackEnquiryEvent: gaManager.trackEnquiryEvent.bind(gaManager),
    trackPerformanceEvent: gaManager.trackPerformanceEvent.bind(gaManager),
    trackSatisfaction: gaManager.trackSatisfaction.bind(gaManager),
    trackABTestEvent: gaManager.trackABTestEvent.bind(gaManager),
    setUserProperties: gaManager.setUserProperties.bind(gaManager),
    trackPurchase: gaManager.trackPurchase.bind(gaManager),
  };
}

// Custom Event Tracking Hook for Contact Forms
export function useContactFormAnalytics(formId: string, formName: string) {
  const { trackFormEvent, trackPerformanceEvent } = useGoogleAnalytics();
  const formStartTime = useRef<number>();

  const trackFormView = () => {
    trackFormEvent(ContactEventType.FORM_VIEW, formId, formName);
  };

  const trackFormStart = () => {
    formStartTime.current = Date.now();
    trackFormEvent(ContactEventType.FORM_START, formId, formName);
  };

  const trackFieldFocus = (fieldName: string) => {
    trackFormEvent(ContactEventType.FORM_FIELD_FOCUS, formId, formName, {
      field_name: fieldName,
    });
  };

  const trackFormSubmit = (formData: Record<string, any>) => {
    const submitTime = formStartTime.current ? Date.now() - formStartTime.current : 0;
    
    trackFormEvent(ContactEventType.FORM_SUBMIT, formId, formName, {
      form_data: formData,
      completion_time: submitTime,
    });
  };

  const trackFormComplete = (formData: Record<string, any>) => {
    const completeTime = formStartTime.current ? Date.now() - formStartTime.current : 0;
    
    trackFormEvent(ContactEventType.FORM_COMPLETE, formId, formName, {
      form_data: formData,
      completion_time: completeTime,
    });
  };

  const trackFormAbandon = (lastField?: string, formProgress?: number) => {
    const abandonTime = formStartTime.current ? Date.now() - formStartTime.current : 0;
    
    trackFormEvent(ContactEventType.FORM_ABANDON, formId, formName, {
      last_field: lastField,
      form_progress: formProgress,
      abandon_time: abandonTime,
    });
  };

  const trackPerformance = (loadTime: number, renderTime: number) => {
    trackPerformanceEvent(ContactEventType.FORM_START, 'load_time', loadTime, 'ms');
    trackPerformanceEvent(ContactEventType.FORM_START, 'render_time', renderTime, 'ms');
  };

  return {
    trackFormView,
    trackFormStart,
    trackFieldFocus,
    trackFormSubmit,
    trackFormComplete,
    trackFormAbandon,
    trackPerformance,
  };
}

// Google Tag Manager Integration
export function useGoogleTagManager() {
  const gtmManager = GoogleAnalyticsManager.getInstance();

  useEffect(() => {
    gtmManager.initialize();
  }, []);

  // Push data to GTM data layer
  const pushToDataLayer = (data: Record<string, any>) => {
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push(data);
    }
  };

  // Push contact form event to GTM
  const pushFormEvent = (eventType: string, data: Record<string, any>) => {
    pushToDataLayer({
      event: 'contact_form_event',
      form_event_type: eventType,
      ...data,
    });
  };

  // Push enquiry event to GTM
  const pushEnquiryEvent = (eventType: string, data: Record<string, any>) => {
    pushToDataLayer({
      event: 'enquiry_event',
      enquiry_event_type: eventType,
      ...data,
    });
  };

  return {
    pushToDataLayer,
    pushFormEvent,
    pushEnquiryEvent,
    ...gtmManager,
  };
}

// Analytics Event Collector Component
interface AnalyticsCollectorProps {
  children: React.ReactNode;
  enableGoogleAnalytics?: boolean;
  enableGoogleTagManager?: boolean;
  customTrackingId?: string;
}

export function AnalyticsCollector({ 
  children, 
  enableGoogleAnalytics = true,
  enableGoogleTagManager = true,
  customTrackingId 
}: AnalyticsCollectorProps) {
  const { trackEvent } = useGoogleAnalytics();
  const { pushToDataLayer } = useGoogleTagManager();

  useEffect(() => {
    if (enableGoogleAnalytics) {
      trackEvent('page_view', 'Navigation', 'page_view', document.title, {
        page_title: document.title,
        page_location: window.location.href,
        page_path: window.location.pathname,
        user_id: customTrackingId,
      });
    }

    if (enableGoogleTagManager) {
      pushToDataLayer({
        event: 'page_view',
        page_title: document.title,
        page_location: window.location.href,
        page_path: window.location.pathname,
      });
    }
  }, [enableGoogleAnalytics, enableGoogleTagManager, customTrackingId]);

  return <>{children}</>;
}

// Performance Monitoring Component
interface PerformanceMonitorProps {
  trackMetrics?: boolean;
  enableRealUserMonitoring?: boolean;
  apiEndpoint?: string;
}

export function PerformanceMonitor({ 
  trackMetrics = true,
  enableRealUserMonitoring = true,
  apiEndpoint = '/api/analytics/performance'
}: PerformanceMonitorProps) {
  const { trackPerformanceEvent } = useGoogleAnalytics();
  const { pushToDataLayer } = useGoogleTagManager();
  const performanceObserver = useRef<PerformanceObserver | null>(null);

  useEffect(() => {
    if (!enableRealUserMonitoring) return;

    // Monitor Core Web Vitals
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      // Monitor Largest Contentful Paint
      const observeLCP = () => {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as any;
          if (lastEntry) {
            const lcp = lastEntry.startTime;
            trackPerformanceEvent(ContactEventType.FORM_START, 'lcp', lcp, 'ms');
            pushToDataLayer({
              event: 'core_web_vitals',
              metric_name: 'lcp',
              metric_value: lcp,
            });
          }
        });
        observer.observe({ entryTypes: ['largest-contentful-paint'] });
        return observer;
      };

      // Monitor First Input Delay
      const observeFID = () => {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries() as any[]) {
            trackPerformanceEvent(ContactEventType.FORM_START, 'fid', entry.processingStart - entry.startTime, 'ms');
            pushToDataLayer({
              event: 'core_web_vitals',
              metric_name: 'fid',
              metric_value: entry.processingStart - entry.startTime,
            });
          }
        });
        observer.observe({ entryTypes: ['first-input'] });
        return observer;
      };

      // Monitor Cumulative Layout Shift
      const observeCLS = () => {
        const observer = new PerformanceObserver((list) => {
          let clsValue = 0;
          for (const entry of list.getEntries() as any[]) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          }
          trackPerformanceEvent(ContactEventType.FORM_START, 'cls', clsValue, 'score');
          pushToDataLayer({
            event: 'core_web_vitals',
            metric_name: 'cls',
            metric_value: clsValue,
          });
        });
        observer.observe({ entryTypes: ['layout-shift'] });
        return observer;
      };

      // Start monitoring
      performanceObserver.current = observeLCP();
      performanceObserver.current = observeFID();
      performanceObserver.current = observeCLS();
    }

    // Monitor resource loading
    if (trackMetrics) {
      const monitorResources = () => {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            const resource = entry as PerformanceResourceTiming;
            if (resource.duration > 1000) { // Slow resources (> 1s)
              trackPerformanceEvent(
                ContactEventType.SLOW_LOAD, 
                'resource_load', 
                resource.duration, 
                'ms',
                {
                  resource_name: resource.name,
                  resource_type: resource.initiatorType,
                }
              );
            }
          }
        });
        observer.observe({ entryTypes: ['resource'] });
        return observer;
      };

      performanceObserver.current = monitorResources();
    }

    return () => {
      if (performanceObserver.current) {
        performanceObserver.current.disconnect();
      }
    };
  }, [enableRealUserMonitoring, trackMetrics]);

  return null; // This component doesn't render anything
}

export default GoogleAnalyticsManager;