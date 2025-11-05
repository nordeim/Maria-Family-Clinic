/**
 * Contact Integration Hook
 * Sub-Phase 9.9: Integration with Existing Features Retry
 * 
 * Centralized contact integration state management for seamless user experience
 * across all platform features.
 */

import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@/lib/hooks/use-user';
import { api } from '@/lib/api';
import type { ContactIntegrationContext, ContactAction } from '@/components/integrations/contact-integration-manager';

interface ContactIntegrationState {
  // User contact preferences
  contactPreferences: ContactUserPreferences | null;
  contactHistory: ContactHistoryEntry[];
  
  // Active contact sessions
  activeContacts: ContactSession[];
  
  // Contact settings
  contactSettings: ContactSettings;
  
  // Integration status
  isLoading: boolean;
  error: string | null;
}

interface ContactUserPreferences {
  preferredContactMethod: 'email' | 'phone' | 'sms' | 'whatsapp' | 'portal';
  secondaryContactMethod?: 'email' | 'phone' | 'sms' | 'whatsapp' | 'portal';
  emergencyContactMethod: 'phone' | 'sms' | 'whatsapp';
  
  // Communication preferences
  allowDirectContact: boolean;
  allowEmailMarketing: boolean;
  allowSmsUpdates: boolean;
  allowPhoneCalls: boolean;
  allowWhatsAppUpdates: boolean;
  
  // Timing preferences
  contactAllowedFrom?: string; // "09:00"
  contactAllowedTo?: string;   // "17:00"
  timezone: string;
  doNotDisturb: boolean;
  
  // Healthcare-specific preferences
  medicalUpdatesViaEmail: boolean;
  appointmentReminders: boolean;
  healthGoalReminders: boolean;
  programEnrollmentUpdates: boolean;
  emergencyNotifications: boolean;
  
  // Follow-up preferences
  preferredFollowUpTime?: number; // days
  contactHistoryAccess: boolean;
  shareContactWithPartners: boolean;
  
  // Privacy and compliance
  dataRetentionPeriod: number; // days
  contactDataEncrypted: boolean;
  thirdPartySharing: boolean;
  marketingTracking: boolean;
}

interface ContactHistoryEntry {
  id: string;
  type: 'contact_form' | 'phone_call' | 'email' | 'whatsapp' | 'appointment' | 'urgent';
  category: string;
  subject?: string;
  summary: string;
  status: 'pending' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'normal' | 'high' | 'urgent' | 'emergency';
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  
  // Context
  contextType: 'clinic' | 'doctor' | 'service' | 'appointment' | 'healthier_sg' | 'general';
  contextId?: string;
  contextName?: string;
  
  // Response tracking
  responseTime?: number; // minutes
  resolutionTime?: number; // minutes
  satisfaction?: number; // 1-5 rating
  
  // Follow-up
  followUpRequired: boolean;
  followUpDate?: Date;
  followUpCompleted: boolean;
}

interface ContactSession {
  id: string;
  type: 'form' | 'phone' | 'chat' | 'email' | 'whatsapp';
  context: ContactIntegrationContext;
  status: 'active' | 'waiting' | 'completed' | 'failed';
  startedAt: Date;
  lastActivityAt: Date;
  agentId?: string;
  estimatedWaitTime?: number; // minutes
  messageCount: number;
  priority: 'low' | 'normal' | 'high' | 'urgent' | 'emergency';
}

interface ContactSettings {
  // Global contact settings
  notificationsEnabled: boolean;
  pushNotifications: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  
  // Privacy settings
  shareContactHistory: boolean;
  allowContactSuggestions: boolean;
  allowContactRecommendations: boolean;
  
  // Integration settings
  enableClinicIntegration: boolean;
  enableDoctorIntegration: boolean;
  enableServiceIntegration: boolean;
  enableAppointmentIntegration: boolean;
  enableHealthierSgIntegration: boolean;
  
  // Dashboard preferences
  showContactNotifications: boolean;
  showEnquiryUpdates: boolean;
  showAppointmentContacts: boolean;
  showProgramContacts: boolean;
}

export function useContactIntegration() {
  const { user } = useUser();
  const [state, setState] = useState<ContactIntegrationState>({
    contactPreferences: null,
    contactHistory: [],
    activeContacts: [],
    contactSettings: {
      notificationsEnabled: true,
      pushNotifications: true,
      emailNotifications: true,
      smsNotifications: false,
      shareContactHistory: false,
      allowContactSuggestions: true,
      allowContactRecommendations: false,
      enableClinicIntegration: true,
      enableDoctorIntegration: true,
      enableServiceIntegration: true,
      enableAppointmentIntegration: true,
      enableHealthierSgIntegration: true,
      showContactNotifications: true,
      showEnquiryUpdates: true,
      showAppointmentContacts: true,
      showProgramContacts: false,
    },
    isLoading: false,
    error: null,
  });

  // Load user contact preferences and history
  useEffect(() => {
    if (user) {
      loadContactData();
    }
  }, [user]);

  const loadContactData = async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // In a real implementation, these would be API calls
      const [preferences, history, settings] = await Promise.all([
        fetchContactPreferences(),
        fetchContactHistory(),
        fetchContactSettings(),
      ]);

      setState(prev => ({
        ...prev,
        contactPreferences: preferences,
        contactHistory: history,
        contactSettings: { ...prev.contactSettings, ...settings },
        isLoading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load contact data',
      }));
    }
  };

  // Update contact preferences
  const updateContactPreferences = async (preferences: Partial<ContactUserPreferences>) => {
    if (!state.contactPreferences) return;

    setState(prev => ({
      ...prev,
      contactPreferences: { ...prev.contactPreferences, ...preferences },
    }));

    try {
      await saveContactPreferences({ ...state.contactPreferences, ...preferences });
    } catch (error) {
      console.error('Failed to update contact preferences:', error);
      // Revert on error
      setState(prev => ({
        ...prev,
        contactPreferences: state.contactPreferences,
        error: 'Failed to update preferences',
      }));
    }
  };

  // Add contact history entry
  const addContactHistory = (entry: Omit<ContactHistoryEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newEntry: ContactHistoryEntry = {
      ...entry,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setState(prev => ({
      ...prev,
      contactHistory: [newEntry, ...prev.contactHistory].slice(0, 100), // Keep last 100 entries
    }));
  };

  // Update contact history entry
  const updateContactHistory = (id: string, updates: Partial<ContactHistoryEntry>) => {
    setState(prev => ({
      ...prev,
      contactHistory: prev.contactHistory.map(entry =>
        entry.id === id ? { ...entry, ...updates, updatedAt: new Date() } : entry
      ),
    }));
  };

  // Start a new contact session
  const startContactSession = (context: ContactIntegrationContext) => {
    const session: ContactSession = {
      id: generateId(),
      type: getContactTypeFromContext(context),
      context,
      status: 'active',
      startedAt: new Date(),
      lastActivityAt: new Date(),
      messageCount: 0,
      priority: getPriorityFromContext(context),
    };

    setState(prev => ({
      ...prev,
      activeContacts: [...prev.activeContacts, session],
    }));

    return session.id;
  };

  // End contact session
  const endContactSession = (sessionId: string, status: ContactSession['status'] = 'completed') => {
    setState(prev => ({
      ...prev,
      activeContacts: prev.activeContacts.map(session =>
        session.id === sessionId ? { ...session, status } : session
      ),
    }));
  };

  // Get contact actions for context
  const getContactActions = (context: ContactIntegrationContext): ContactAction[] => {
    // This would generate context-specific contact actions
    return [];
  };

  // Check if user is available for contact during certain hours
  const isUserAvailableForContact = useCallback((): boolean => {
    if (!state.contactPreferences) return true;
    if (state.contactPreferences.doNotDisturb) return false;

    const { contactAllowedFrom, contactAllowedTo, timezone } = state.contactPreferences;
    if (!contactAllowedFrom || !contactAllowedTo) return true;

    const now = new Date();
    const currentTime = now.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit',
      timeZone: timezone || 'Asia/Singapore'
    });

    return currentTime >= contactAllowedFrom && currentTime <= contactAllowedTo;
  }, [state.contactPreferences]);

  // Get contact statistics
  const getContactStats = () => {
    const history = state.contactHistory;
    const now = new Date();
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    return {
      totalContacts: history.length,
      contactsLast30Days: history.filter(entry => entry.createdAt >= last30Days).length,
      averageResponseTime: history
        .filter(entry => entry.responseTime)
        .reduce((acc, entry) => acc + (entry.responseTime || 0), 0) / 
        history.filter(entry => entry.responseTime).length || 0,
      averageResolutionTime: history
        .filter(entry => entry.resolutionTime)
        .reduce((acc, entry) => acc + (entry.resolutionTime || 0), 0) / 
        history.filter(entry => entry.resolutionTime).length || 0,
      satisfactionScore: history
        .filter(entry => entry.satisfaction)
        .reduce((acc, entry) => acc + (entry.satisfaction || 0), 0) / 
        history.filter(entry => entry.satisfaction).length || 0,
      emergencyContacts: history.filter(entry => entry.priority === 'emergency').length,
      activeSessions: state.activeContacts.filter(session => session.status === 'active').length,
    };
  };

  // Helper functions
  const generateId = () => Math.random().toString(36).substr(2, 9);

  const getContactTypeFromContext = (context: ContactIntegrationContext): ContactSession['type'] => {
    switch (context.integrationType) {
      case 'doctor': return 'form';
      case 'service': return 'form';
      case 'appointment': return 'chat';
      case 'healthier_sg': return 'form';
      default: return 'form';
    }
  };

  const getPriorityFromContext = (context: ContactIntegrationContext): ContactSession['priority'] => {
    if (context.contextData?.urgency === 'emergency') return 'emergency';
    if (context.contextData?.urgency === 'urgent') return 'urgent';
    if (context.contextData?.urgency === 'high') return 'high';
    return 'normal';
  };

  // Mock API functions (in real implementation, these would make actual API calls)
  const fetchContactPreferences = async (): Promise<ContactUserPreferences> => {
    // Mock data - in real implementation, this would fetch from API
    return {
      preferredContactMethod: 'email',
      emergencyContactMethod: 'phone',
      allowDirectContact: true,
      allowEmailMarketing: false,
      allowSmsUpdates: true,
      allowPhoneCalls: false,
      allowWhatsAppUpdates: false,
      timezone: 'Asia/Singapore',
      doNotDisturb: false,
      medicalUpdatesViaEmail: true,
      appointmentReminders: true,
      healthGoalReminders: true,
      programEnrollmentUpdates: true,
      emergencyNotifications: true,
      contactHistoryAccess: true,
      shareContactWithPartners: false,
      dataRetentionPeriod: 365,
      contactDataEncrypted: true,
      thirdPartySharing: false,
      marketingTracking: false,
    };
  };

  // API Integration Methods
  const fetchContactHistory = useCallback(async (filters?: {
    page?: number;
    limit?: number;
    contactType?: string;
    status?: string;
  }): Promise<ContactHistoryEntry[]> => {
    try {
      if (!user?.id) return [];
      
      const response = await api.contactHistory.getUserHistory.query(filters || {
        page: 1,
        limit: 20,
        orderDirection: 'desc',
      });
      
      return response.data.map(entry => ({
        id: entry.id,
        type: entry.contactType,
        category: entry.contactCategory,
        purpose: entry.purpose,
        method: entry.method,
        subject: entry.subject,
        summary: entry.summary,
        outcome: entry.outcome,
        status: entry.status,
        resolved: entry.resolved,
        satisfaction: entry.satisfaction,
        responseTime: entry.responseTime,
        createdAt: entry.createdAt,
        updatedAt: entry.updatedAt,
      }));
    } catch (error) {
      console.error('Failed to fetch contact history:', error);
      return [];
    }
  }, [user?.id]);

  const fetchContactSettings = useCallback(async (): Promise<Partial<ContactSettings>> => {
    try {
      if (!user?.id) return {};
      
      const preferences = await api.contactPreferences.getPreferences.query();
      
      return {
        contactPoints: [],
        notifications: {
          emailEnabled: preferences?.allowEmailMarketing || false,
          smsEnabled: preferences?.allowSmsUpdates || false,
          whatsappEnabled: preferences?.allowWhatsAppUpdates || false,
          phoneEnabled: preferences?.allowPhoneCalls || false,
          doNotDisturb: preferences?.doNotDisturb || false,
          allowedHours: {
            from: preferences?.contactAllowedFrom || '09:00',
            to: preferences?.contactAllowedTo || '17:00',
          },
          timezone: preferences?.timezone || 'Asia/Singapore',
        },
        privacy: {
          shareData: preferences?.shareContactWithPartners || false,
          allowTracking: preferences?.marketingTracking || false,
          dataRetentionDays: preferences?.dataRetentionPeriod || 365,
        },
      };
    } catch (error) {
      console.error('Failed to fetch contact settings:', error);
      return {};
    }
  }, [user?.id]);

  const saveContactPreferences = useCallback(async (preferences: ContactUserPreferences): Promise<void> => {
    try {
      if (!user?.id) throw new Error('User not authenticated');
      
      await api.contactPreferences.updatePreferences.mutate({
        preferredContactMethod: preferences.preferredContactMethod.toUpperCase() as any,
        secondaryContactMethod: preferences.secondaryContactMethod?.toUpperCase() as any,
        emergencyContactMethod: preferences.emergencyContactMethod.toUpperCase() as any,
        allowDirectContact: preferences.allowDirectContact,
        allowEmailMarketing: preferences.allowEmailMarketing,
        allowSmsUpdates: preferences.allowSmsUpdates,
        allowPhoneCalls: preferences.allowPhoneCalls,
        allowWhatsAppUpdates: preferences.allowWhatsAppUpdates,
        contactAllowedFrom: preferences.contactAllowedFrom,
        contactAllowedTo: preferences.contactAllowedTo,
        timezone: preferences.timezone,
        doNotDisturb: preferences.doNotDisturb,
        medicalUpdatesViaEmail: preferences.medicalUpdatesViaEmail,
        appointmentReminders: preferences.appointmentReminders,
        healthGoalReminders: preferences.healthGoalReminders,
        programEnrollmentUpdates: preferences.programEnrollmentUpdates,
        emergencyNotifications: preferences.emergencyNotifications,
        contactHistoryAccess: preferences.contactHistoryAccess,
        shareContactWithPartners: preferences.shareContactWithPartners,
        dataRetentionPeriod: preferences.dataRetentionPeriod,
        contactDataEncrypted: preferences.contactDataEncrypted,
        thirdPartySharing: preferences.thirdPartySharing,
        marketingTracking: preferences.marketingTracking,
      });
    } catch (error) {
      console.error('Failed to save contact preferences:', error);
      throw error;
    }
  }, [user?.id]);

  // Contact Form Integration
  const openContactForm = useCallback(async (context: {
    clinicId?: string;
    doctorId?: string;
    serviceId?: string;
    appointmentId?: string;
    healthierSgEnrollmentId?: string;
  }, options: {
    contactType?: string;
    subject?: string;
    message?: string;
    priority?: 'low' | 'normal' | 'high';
  } = {}) => {
    try {
      if (!user?.id) throw new Error('User not authenticated');
      
      const result = await api.contactIntegration.openContactForm.mutate({
        context,
        contactType: (options.contactType || 'general_inquiry').toUpperCase() as any,
        subject: options.subject,
        message: options.message,
        priority: options.priority || 'normal',
      });
      
      return result;
    } catch (error) {
      console.error('Failed to open contact form:', error);
      throw error;
    }
  }, [user?.id]);

  const trackContactActivity = useCallback(async (
    activityType: string,
    context: Record<string, any> = {},
    metadata: Record<string, any> = {}
  ) => {
    try {
      if (!user?.id) return;
      
      await api.contactIntegration.trackActivity.mutate({
        activityType: activityType.toUpperCase() as any,
        context,
        metadata,
      });
    } catch (error) {
      console.error('Failed to track contact activity:', error);
    }
  }, [user?.id]);

  // Contact Notifications
  const getContactNotifications = useCallback(async (filters?: {
    page?: number;
    limit?: number;
    unreadOnly?: boolean;
  }) => {
    try {
      if (!user?.id) return { data: [], unreadCount: 0, pagination: null };
      
      return await api.contactNotifications.getNotifications.query(filters || {
        page: 1,
        limit: 10,
        unreadOnly: false,
      });
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      return { data: [], unreadCount: 0, pagination: null };
    }
  }, [user?.id]);

  const markNotificationAsRead = useCallback(async (notificationId: string) => {
    try {
      await api.contactNotifications.markAsRead.mutate({ id: notificationId });
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }, []);

  // Cross-system Integration
  const getLinkedContacts = useCallback(async (entityFilters: {
    clinicId?: string;
    doctorId?: string;
    serviceId?: string;
    appointmentId?: string;
    healthierSgEnrollmentId?: string;
    userId?: string;
  }) => {
    try {
      return await api.crossSystemIntegration.getLinkedContacts.query({
        ...entityFilters,
        includeResolved: false,
        limit: 10,
      });
    } catch (error) {
      console.error('Failed to fetch linked contacts:', error);
      return [];
    }
  }, []);

  const getIntegrationAnalytics = useCallback(async (filters?: {
    startDate?: Date;
    endDate?: Date;
    clinicId?: string;
    doctorId?: string;
  }) => {
    try {
      return await api.crossSystemIntegration.getIntegrationAnalytics.query(filters || {});
    } catch (error) {
      console.error('Failed to fetch integration analytics:', error);
      return null;
    }
  }, []);

  return {
    // State
    ...state,
    
    // Core Actions
    updateContactPreferences,
    addContactHistory,
    updateContactHistory,
    startContactSession,
    endContactSession,
    getContactActions,
    
    // API Integration Actions
    openContactForm,
    trackContactActivity,
    getContactNotifications,
    markNotificationAsRead,
    getLinkedContacts,
    getIntegrationAnalytics,
    
    // Data Fetching
    fetchContactHistory,
    fetchContactSettings,
    saveContactPreferences,
    
    // Utilities
    isUserAvailableForContact,
    getContactStats,
    
    // Refresh
    refreshContactData: loadContactData,
  };
}

export type { 
  ContactIntegrationState,
  ContactUserPreferences, 
  ContactHistoryEntry, 
  ContactSession, 
  ContactSettings 
};