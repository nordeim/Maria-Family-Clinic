/**
 * Privacy & Compliance Hook
 * Sub-Phase 9.5: PDPA-Compliant Health Data Protection
 * React hook for privacy and compliance functionality
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { trpc } from '@/lib/trpc/client';

interface PrivacyMetrics {
  totalHealthEnquiries: number;
  encryptedHealthEnquiries: number;
  encryptionRate: number;
  phiEnquiries: number;
  pendingHealthRequests: number;
  healthIncidents: number;
  healthAuditEvents: number;
  healthComplianceScore: number;
  lastAssessment: Date;
  phiProtectionLevel: string;
  professionalConfidentiality: string;
  activeConsents: number;
  consentRate: number;
  pendingRequests: number;
  openIncidents: number;
  recentAuditEvents: number;
  totalConsents: number;
}

interface ComplianceData {
  complianceScore: number;
  pdpaCompliance: string;
  smcCompliance: string;
  dataEncryption: string;
  accessControl: string;
  auditLogging: string;
  lastAuditDate: Date;
  nextAuditDate: Date;
  totalHealthEnquiries: number;
  compliantEnquiries: number;
  findings: any[];
}

interface PrivacyIncident {
  id: string;
  title: string;
  severity: string;
  status: string;
  type: string;
  createdAt: string;
  description: string;
  dataInvolved: boolean;
  phiInvolved: boolean;
}

interface ConsentRecord {
  id: string;
  consentType: string;
  dataSubjectName: string;
  consentStatus: string;
  consentDate: string;
  expiryDate?: string;
  medicalConsent?: boolean;
  version: string;
}

interface AuditLogEntry {
  id: string;
  eventType: string;
  actorId: string;
  actorName: string;
  actionPerformed: string;
  dataSensitivity: string;
  eventTimestamp: string;
  complianceFrameworks: string[];
  containsPHI: boolean;
  hashChainCurrent: string;
}

export const usePrivacyCompliance = () => {
  const [healthMetrics, setHealthMetrics] = useState<PrivacyMetrics | null>(null);
  const [complianceData, setComplianceData] = useState<ComplianceData | null>(null);
  const [incidents, setIncidents] = useState<PrivacyIncident[]>([]);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // tRPC queries
  const { data: healthComplianceData, refetch: refetchHealthCompliance } = 
    trpc.privacyComplianceRouter.getHealthComplianceDashboard.useQuery(undefined, {
      enabled: false // Manually triggered
    });

  const { data: complianceStatus, refetch: refetchComplianceStatus } = 
    trpc.privacyComplianceRouter.compliance.getComplianceStatus.useQuery(
      { doctorId: undefined },
      { enabled: false }
    );

  const { data: privacyMetrics, refetch: refetchPrivacyMetrics } = 
    trpc.privacyComplianceRouter.compliance.getPrivacyMetrics.useQuery(
      undefined,
      { enabled: false }
    );

  const { data: healthIncidents, refetch: refetchIncidents } = 
    trpc.privacyComplianceRouter.incident.getSecurityIncidents.useQuery(
      { status: undefined, severity: undefined, type: undefined, limit: 50, offset: 0 },
      { enabled: false }
    );

  const { data: consentRecords, refetch: refetchConsents } = 
    trpc.privacyComplianceRouter.consent.getConsentRecords.useQuery(
      { doctorId: undefined, consentType: undefined, status: undefined, limit: 50, offset: 0 },
      { enabled: false }
    );

  const { data: privacyAuditLogs, refetch: refetchAuditLogs } = 
    trpc.privacyComplianceRouter.audit.getAuditLogs.useQuery(
      { 
        userId: undefined, 
        action: undefined, 
        resource: undefined, 
        dataSensitivity: undefined, 
        dateRange: undefined, 
        limit: 100, 
        offset: 0 
      },
      { enabled: false }
    );

  // tRPC mutations
  const createConsentMutation = trpc.privacyComplianceRouter.createHealthConsent.useMutation();
  const classifyEnquiryMutation = trpc.privacyComplianceRouter.classifyHealthEnquiry.useMutation();
  const submitDataSubjectRequestMutation = trpc.privacyComplianceRouter.submitHealthDataSubjectRequest.useMutation();
  const reportIncidentMutation = trpc.privacyComplianceRouter.reportHealthPrivacyIncident.useMutation();
  const generateReportMutation = trpc.privacyComplianceRouter.generateHealthComplianceReport.useMutation();

  // Load data
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      await Promise.all([
        refetchHealthCompliance(),
        refetchComplianceStatus(),
        refetchPrivacyMetrics(),
        refetchIncidents(),
        refetchConsents(),
        refetchAuditLogs()
      ]);

      // Update state with fetched data
      if (healthComplianceData) {
        setHealthMetrics(healthComplianceData);
      }

      if (complianceStatus) {
        setComplianceData({
          complianceScore: healthComplianceData?.healthComplianceScore || 85,
          pdpaCompliance: complianceStatus.pdpaCompliance,
          smcCompliance: complianceStatus.smcCompliance,
          dataEncryption: complianceStatus.dataEncryption,
          accessControl: complianceStatus.accessControl,
          auditLogging: complianceStatus.auditLogging,
          lastAuditDate: complianceStatus.lastAuditDate,
          nextAuditDate: complianceStatus.nextAuditDate,
          totalHealthEnquiries: healthComplianceData?.totalHealthEnquiries || 0,
          compliantEnquiries: Math.round((healthComplianceData?.totalHealthEnquiries || 0) * 
            (healthComplianceData?.healthComplianceScore || 85) / 100),
          findings: []
        });
      }

      if (privacyMetrics) {
        setHealthMetrics(prev => prev ? {
          ...prev,
          activeConsents: privacyMetrics.consentGranted,
          consentRate: privacyMetrics.consentGranted > 0 ? 
            (privacyMetrics.consentGranted / privacyMetrics.totalDoctors) * 100 : 0,
          pendingRequests: privacyMetrics.consentPending,
          openIncidents: privacyMetrics.openIncidents,
          recentAuditEvents: privacyMetrics.recentAuditEvents,
          totalConsents: privacyMetrics.consentGranted + privacyMetrics.consentPending + privacyMetrics.consentWithdrawn
        } : null);
      }

      if (healthIncidents) {
        setIncidents(healthIncidents.incidents || []);
      }

      if (consentRecords) {
        setConsents(consentRecords.records || []);
      }

      if (privacyAuditLogs) {
        setAuditLogs(privacyAuditLogs.logs || []);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load privacy data');
    } finally {
      setIsLoading(false);
    }
  }, [
    refetchHealthCompliance,
    refetchComplianceStatus,
    refetchPrivacyMetrics,
    refetchIncidents,
    refetchConsents,
    refetchAuditLogs,
    healthComplianceData,
    complianceStatus,
    privacyMetrics,
    healthIncidents,
    consentRecords,
    privacyAuditLogs
  ]);

  // Action methods
  const createConsent = useCallback(async (consentData: any) => {
    try {
      const result = await createConsentMutation.mutateAsync(consentData);
      await loadData(); // Refresh data
      return result;
    } catch (error) {
      throw error;
    }
  }, [createConsentMutation, loadData]);

  const classifyEnquiry = useCallback(async (enquiryData: any) => {
    try {
      return await classifyEnquiryMutation.mutateAsync(enquiryData);
    } catch (error) {
      throw error;
    }
  }, [classifyEnquiryMutation]);

  const submitDataSubjectRequest = useCallback(async (requestData: any) => {
    try {
      const result = await submitDataSubjectRequestMutation.mutateAsync(requestData);
      await loadData(); // Refresh data
      return result;
    } catch (error) {
      throw error;
    }
  }, [submitDataSubjectRequestMutation, loadData]);

  const reportPrivacyIncident = useCallback(async (incidentData: any) => {
    try {
      const result = await reportIncidentMutation.mutateAsync(incidentData);
      await loadData(); // Refresh data
      return result;
    } catch (error) {
      throw error;
    }
  }, [reportIncidentMutation, loadData]);

  const generateComplianceReport = useCallback(async (reportConfig: any) => {
    try {
      return await generateReportMutation.mutateAsync(reportConfig);
    } catch (error) {
      throw error;
    }
  }, [generateReportMutation]);

  // Initialize data on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Manual refresh
  const refreshData = useCallback(() => {
    loadData();
  }, [loadData]);

  // Get compliance status for a specific level
  const getComplianceStatus = useCallback((level: string) => {
    if (!complianceData) return 'unknown';
    
    const status = complianceData[level as keyof ComplianceData] as string;
    return status || 'unknown';
  }, [complianceData]);

  // Get incident severity count
  const getIncidentCountBySeverity = useCallback((severity: string) => {
    return incidents.filter(incident => incident.severity === severity).length;
  }, [incidents]);

  // Get consent status count
  const getConsentCountByStatus = useCallback((status: string) => {
    return consents.filter(consent => consent.consentStatus === status).length;
  }, [consents]);

  // Get audit events by type
  const getAuditEventsByType = useCallback((eventType: string) => {
    return auditLogs.filter(log => log.eventType === eventType);
  }, [auditLogs]);

  // Check if data is overdue for processing
  const isDataOverdue = useCallback((deadline: string, status: string) => {
    return new Date(deadline) < new Date() && !['COMPLETED', 'REJECTED', 'CLOSED'].includes(status);
  }, []);

  // Get days remaining for deadline
  const getDaysRemaining = useCallback((deadline: string) => {
    const now = new Date();
    const due = new Date(deadline);
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }, []);

  return {
    // Data
    healthMetrics,
    complianceData,
    incidents,
    consents,
    auditLogs,
    isLoading,
    error,

    // Actions
    refreshData,
    createConsent,
    classifyEnquiry,
    submitDataSubjectRequest,
    reportPrivacyIncident,
    generateComplianceReport,

    // Utility methods
    getComplianceStatus,
    getIncidentCountBySeverity,
    getConsentCountByStatus,
    getAuditEventsByType,
    isDataOverdue,
    getDaysRemaining,

    // Query states for mutations
    isCreatingConsent: createConsentMutation.isLoading,
    isClassifying: classifyEnquiryMutation.isLoading,
    isSubmittingRequest: submitDataSubjectRequestMutation.isLoading,
    isReportingIncident: reportIncidentMutation.isLoading,
    isGeneratingReport: generateReportMutation.isLoading
  };
};