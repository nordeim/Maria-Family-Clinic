// Hook for fetching comprehensive service data
import { useState, useEffect } from 'react';

export interface ServiceData {
  // Basic Information
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  slug: string;
  description: string;
  patientFriendlyDescription?: string;
  detailedDescription?: string;
  tags: string[];
  
  // Medical Information
  specialty: string;
  bodyLocation?: string;
  complexityLevel: 'BASIC' | 'MODERATE' | 'COMPLEX' | 'SPECIALIZED';
  isSpecialized: boolean;
  typicalDurationMinutes?: number;
  patientSatisfactionRate?: number;
  isHealthierSGCovered?: boolean;
  
  // Medical Content
  medicalTerms?: MedicalTerm[];
  riskFactors?: RiskFactor[];
  treatmentOptions?: TreatmentOption[];
  processSteps?: ProcessStep[];
  checklistItems?: ChecklistItem[];
  
  // Outcomes and Metrics
  outcomeMetrics?: OutcomeMetric[];
  keyBenefits?: string[];
  successRates?: Record<string, string>;
  patientReviews?: PatientReview[];
  
  // Requirements and Preparation
  requiresSpecialPreparation?: boolean;
  hasRiskFactors?: boolean;
  requiresAnticoagulantAdjustment?: boolean;
  requiresAlcoholAvoidance?: boolean;
  requiresSmokingCessation?: boolean;
  requiresSedation?: boolean;
  requiresFasting?: boolean;
  requiresNailPolishRemoval?: boolean;
  
  // Pricing and Coverage
  basePrice?: number;
  insuranceCoverage?: InsuranceCoverage[];
  pricingOptions?: PricingOption[];
  
  // Availability
  availableClinics?: ClinicSlot[];
  preparationInstructions?: string;
  followUpInstructions?: string;
  
  // Multimedia and Assets
  images?: ServiceImage[];
  videos?: ServiceVideo[];
  documents?: ServiceDocument[];
  
  // Localization
  translations?: Record<string, TranslationData>;
  
  // Metadata
  lastReviewed?: string;
  reviewedBy?: string;
  medicalAccuracyVerified?: boolean;
  emergencyContact?: string;
  afterHoursSupport?: boolean;
}

export interface MedicalTerm {
  term: string;
  definition: string;
  patientFriendlyExplanation: string;
  relatedTerms?: string[];
  category?: string;
}

export interface RiskFactor {
  factor: string;
  severity: 'low' | 'moderate' | 'high';
  description: string;
  mitigation?: string;
  frequency?: string;
  managementStrategy?: string;
}

export interface TreatmentOption {
  name: string;
  description: string;
  suitability: string;
  effectiveness: string;
  pros?: string[];
  cons?: string[];
  recoveryTime?: string;
}

export interface ProcessStep {
  id: string;
  title: string;
  description: string;
  duration?: string;
  isRequired?: boolean;
  isOptional?: boolean;
  tips?: string[];
  warnings?: string[];
  prerequisites?: string[];
  whatToExpect?: string;
  preparationNeeded?: string;
  postCareInstructions?: string;
  estimatedCost?: string;
  icon?: string;
}

export interface ChecklistItem {
  id: string;
  category: string;
  item: string;
  description?: string;
  isRequired: boolean;
  timeline?: string;
  priority: 'high' | 'medium' | 'low';
}

export interface OutcomeMetric {
  metric: string;
  value: string;
  description: string;
  source?: string;
  benchmark?: string;
}

export interface PatientReview {
  id: string;
  patientId?: string;
  rating: number;
  title: string;
  content: string;
  date: string;
  clinicName: string;
  doctorName?: string;
  verified?: boolean;
  helpful?: number;
  response?: ReviewResponse;
}

export interface ReviewResponse {
  author: string;
  role: string;
  content: string;
  date: string;
}

export interface InsuranceCoverage {
  provider: string;
  coverageType: 'full' | 'partial' | 'none';
  copay?: number;
  deductible?: number;
  priorAuthRequired?: boolean;
  notes?: string;
}

export interface PricingOption {
  name: string;
  price: number;
  currency: string;
  includes: string[];
  duration?: string;
  guarantee?: string;
  popular?: boolean;
}

export interface ClinicSlot {
  clinicId: string;
  clinicName: string;
  location: string;
  doctorName: string;
  nextAvailable: string;
  duration: number;
  price: number;
  isAvailable: boolean;
  requirements?: string[];
  language?: string;
}

export interface ServiceImage {
  url: string;
  alt: string;
  caption?: string;
  type: 'overview' | 'procedure' | 'anatomy' | 'preparation';
  medical?: boolean;
}

export interface ServiceVideo {
  url: string;
  title: string;
  description: string;
  duration?: number;
  thumbnail?: string;
  transcript?: string;
  medical?: boolean;
}

export interface ServiceDocument {
  title: string;
  description: string;
  url: string;
  type: 'preparation-guide' | 'consent-form' | 'educational' | 'post-care';
  language: string;
  downloadable: boolean;
}

export interface TranslationData {
  name: string;
  description: string;
  patientFriendlyDescription?: string;
  medicalTerms?: Array<{
    term: string;
    definition: string;
  }>;
  preparationInstructions?: string;
  culturalNotes?: string;
}

export function useServiceData(
  category: string, 
  serviceSlug: string, 
  locale: string = 'en',
  options: {
    refreshInterval?: number;
    retries?: number;
    retryDelay?: number;
  } = {}
) {
  const [data, setData] = useState<ServiceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  const { refreshInterval = 300000, retries = 3, retryDelay = 1000 } = options;

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // In a real implementation, this would be an API call
      // const response = await fetch(`/api/services/${category}/${serviceSlug}?locale=${locale}`);
      // if (!response.ok) throw new Error('Failed to fetch service data');
      // const serviceData = await response.json();

      // Mock data for demonstration
      const mockData = generateMockServiceData(category, serviceSlug, locale);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setData(mockData);
      setLastFetched(new Date());
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      
      // Retry logic
      if (retries > 0) {
        setTimeout(() => {
          fetchData();
        }, retryDelay);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const refresh = () => {
    fetchData();
  };

  const refetch = () => {
    fetchData();
  };

  useEffect(() => {
    fetchData();

    // Set up refresh interval if specified
    let interval: NodeJS.Timeout;
    if (refreshInterval > 0) {
      interval = setInterval(fetchData, refreshInterval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [category, serviceSlug, locale, refreshInterval]);

  return {
    data,
    isLoading,
    error,
    lastFetched,
    refresh,
    refetch,
    // Computed properties
    isStale: lastFetched ? Date.now() - lastFetched.getTime() > refreshInterval : true,
    hasData: !!data,
  };
}

// Mock data generator for demonstration purposes
function generateMockServiceData(category: string, serviceSlug: string, locale: string): ServiceData {
  return {
    id: `${category}-${serviceSlug}`,
    name: serviceSlug.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    category: category,
    subcategory: 'General Care',
    slug: serviceSlug,
    description: `Professional ${serviceSlug} service provided by experienced healthcare professionals at My Family Clinic.`,
    patientFriendlyDescription: `Our ${serviceSlug} service is designed to provide you with the best possible care in a comfortable and welcoming environment.`,
    detailedDescription: `This comprehensive ${serviceSlug} service includes thorough assessment, personalized treatment planning, and ongoing support to ensure optimal health outcomes.`,
    tags: ['Healthcare', 'Professional Care', 'Singapore', 'Medical Service'],
    
    specialty: 'Family Medicine',
    bodyLocation: 'Varies',
    complexityLevel: 'MODERATE',
    isSpecialized: false,
    typicalDurationMinutes: 45,
    patientSatisfactionRate: 94,
    isHealthierSGCovered: true,
    
    // Sample medical terms
    medicalTerms: [
      {
        term: 'Consultation',
        definition: 'A meeting between patient and healthcare provider to discuss health concerns.',
        patientFriendlyExplanation: 'A conversation with your doctor about your health and any concerns you have.',
        relatedTerms: ['Assessment', 'Examination', 'Discussion']
      },
      {
        term: 'Treatment Plan',
        definition: 'A structured approach to managing a patient\'s health condition.',
        patientFriendlyExplanation: 'A customized plan created specifically for your health needs and goals.',
      }
    ],
    
    // Sample risk factors
    riskFactors: [
      {
        factor: 'Minor Discomfort',
        severity: 'low',
        description: 'Some patients may experience minor discomfort during the procedure.',
        mitigation: 'Healthcare providers use techniques to minimize any discomfort.'
      }
    ],
    
    // Sample treatment options
    treatmentOptions: [
      {
        name: 'Standard Care',
        description: 'Traditional approach following established medical protocols.',
        suitability: 'Appropriate for most patients with standard healthcare needs.',
        effectiveness: '95% patient satisfaction rate'
      }
    ],
    
    outcomeMetrics: [
      {
        metric: 'Success Rate',
        value: '95%',
        description: 'Patients achieve desired health outcomes',
        source: 'Clinical outcomes data 2024'
      },
      {
        metric: 'Patient Satisfaction',
        value: '4.8/5',
        description: 'Average patient rating',
        source: 'Patient feedback survey'
      }
    ],
    
    keyBenefits: [
      'Professional healthcare team',
      'Personalized care approach',
      'Modern medical facilities',
      'Comprehensive follow-up support'
    ],
    
    // Sample pricing
    basePrice: 120,
    insuranceCoverage: [
      {
        provider: 'Medisave',
        coverageType: 'partial',
        copay: 20,
        deductible: 0,
        notes: 'Subject to annual withdrawal limits'
      }
    ],
    
    // Sample availability
    availableClinics: [
      {
        clinicId: 'clinic-1',
        clinicName: 'My Family Clinic - Orchard',
        location: 'Orchard Road, Singapore',
        doctorName: 'Dr. Sarah Johnson',
        nextAvailable: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        duration: 45,
        price: 120,
        isAvailable: true
      }
    ],
    
    lastReviewed: new Date().toISOString(),
    reviewedBy: 'Dr. Medical Review Team',
    medicalAccuracyVerified: true,
    emergencyContact: '(65) 6789 1234'
  };
}