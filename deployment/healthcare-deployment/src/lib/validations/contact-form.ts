import { z } from 'zod';
import { ContactMethod } from '../types/contact-system';

// Base contact information schema
export const baseContactSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name is too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name is too long'),
  email: z.string().email('Please enter a valid email address').max(100),
  phone: z.string()
    .min(8, 'Please enter a valid phone number')
    .regex(/^[+\d\s\-\(\)]+$/, 'Please enter a valid phone number')
    .max(20, 'Phone number is too long')
    .optional(),
  preferredContactMethod: z.nativeEnum(ContactMethod).default('email'),
  preferredLanguage: z.enum(['en', 'zh', 'ms', 'ta']).default('en'),
  isNewPatient: z.boolean().default(true),
});

// Contact form submission schema (matches API input)
export const contactFormSubmissionSchema = z.object({
  categoryId: z.string().uuid('Please select a valid contact category'),
  contactInfo: baseContactSchema,
  formData: z.record(z.any()).default({}),
  attachments: z.array(
    z.object({
      fileName: z.string().min(1, 'File name is required'),
      fileType: z.string().min(1, 'File type is required'),
      fileSize: z.number().positive('File size must be positive'),
      fileUrl: z.string().url('Invalid file URL'),
      isMedicalDocument: z.boolean().default(false),
      documentType: z.enum([
        'medical_report',
        'lab_results', 
        'x_ray',
        'prescription',
        'insurance_card',
        'identification',
        'other'
      ]).optional(),
      description: z.string().optional(),
    })
  ).max(5, 'Maximum 5 files allowed'),
  consent: z.object({
    dataProcessingConsent: z.boolean().refine(val => val === true, 'Data processing consent is required'),
    marketingConsent: z.boolean().default(false),
    hipaaConsent: z.boolean().optional(),
    termsAccepted: z.boolean().refine(val => val === true, 'Terms and conditions must be accepted'),
  }),
  metadata: z.object({
    userAgent: z.string().optional(),
    ipAddress: z.string().optional(),
    referrer: z.string().optional(),
    utmSource: z.string().optional(),
    utmMedium: z.string().optional(),
    utmCampaign: z.string().optional(),
  }).optional(),
  clinicId: z.string().uuid().optional(),
  doctorId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
});

// Contact form tracking schema
export const contactFormTrackingSchema = z.object({
  referenceNumber: z.string().regex(/^CF\d{8}\d{4}$/, 'Invalid reference number format'),
  email: z.string().email('Please enter a valid email address').optional(),
});

// Enhanced contact type specific schemas
export const appointmentRequestSchema = z.object({
  urgency: z.enum(['routine', 'urgent', 'emergency']),
  preferredDate: z.string().optional(),
  preferredTime: z.enum(['morning', 'afternoon', 'evening', 'any']).optional(),
  appointmentType: z.enum(['consultation', 'follow-up', 'emergency', 'health-screening']),
  symptoms: z.string().min(10, 'Please provide more detail about your symptoms').max(1000),
  hasInsurance: z.boolean().default(false),
  insuranceProvider: z.string().optional(),
  previousVisits: z.boolean().default(false),
});

export const generalInquirySchema = z.object({
  subject: z.string().min(5, 'Please provide a subject').max(100),
  message: z.string().min(20, 'Please provide more detail').max(2000),
  inquiryCategory: z.enum(['service-info', 'billing', 'appointment-changes', 'feedback', 'other']),
  isUrgent: z.boolean().default(false),
});

export const medicalQuestionSchema = z.object({
  subject: z.string().min(5, 'Please provide a subject').max(100),
  message: z.string().min(20, 'Please provide your medical question').max(2000),
  questionCategory: z.enum(['medication', 'treatment', 'diagnosis', 'prevention', 'other']),
  doctorName: z.string().optional(),
  hasSymptoms: z.boolean().default(false),
  symptomDetails: z.string().optional(),
  durationOfSymptoms: z.string().optional(),
  currentMedications: z.string().optional(),
  allergies: z.string().optional(),
});

export const billingInquirySchema = z.object({
  subject: z.string().min(5, 'Please provide a subject').max(100),
  message: z.string().min(10, 'Please describe your billing inquiry').max(2000),
  invoiceNumber: z.string().optional(),
  serviceDate: z.string().optional(),
  amount: z.number().positive().optional(),
  paymentMethod: z.enum(['cash', 'card', 'insurance', 'medi-save', 'medisave', 'cdg']).optional(),
  hasInsurance: z.boolean().default(false),
});

export const feedbackSchema = z.object({
  subject: z.string().min(5, 'Please provide a subject').max(100),
  message: z.string().min(20, 'Please provide your feedback').max(2000),
  feedbackType: z.enum(['complaint', 'compliment', 'suggestion', 'technical-issue']),
  serviceRating: z.number().min(1).max(5).optional(),
  wouldRecommend: z.boolean().optional(),
  clinicName: z.string().optional(),
  doctorName: z.string().optional(),
});

// File upload schema (legacy support)
export const fileUploadSchema = z.object({
  fileName: z.string(),
  fileType: z.string(),
  fileSize: z.number(),
  fileContent: z.string(), // base64 encoded
  isMedicalDocument: z.boolean().default(false),
  documentType: z.enum(['medical-report', 'lab-results', 'x-ray', 'prescription', 'insurance-card', 'identification', 'other']).optional(),
  description: z.string().optional(),
});

// Contact category management schemas
export const createContactCategorySchema = z.object({
  name: z.string().min(1).max(50, 'Category name must be between 1-50 characters'),
  displayName: z.string().min(1).max(100, 'Display name must be between 1-100 characters'),
  description: z.string().min(1).max(500, 'Description must be between 1-500 characters'),
  department: z.string().min(1, 'Department is required'),
  priority: z.enum(['LOW', 'STANDARD', 'HIGH', 'URGENT', 'CRITICAL']),
  responseSLAHours: z.number().min(1).max(168, 'SLA must be between 1-168 hours'),
  resolutionSLADays: z.number().min(1).max(30, 'Resolution SLA must be between 1-30 days'),
  requiresAuth: z.boolean().default(false),
  requiresVerification: z.boolean().default(false),
  medicalFields: z.boolean().default(false),
  hipaaCompliant: z.boolean().default(false),
  formFields: z.array(z.string()).default([]),
  autoAssignment: z.boolean().default(true),
  routingRules: z.array(z.string()).default([]),
  escalationRules: z.array(z.string()).default([]),
  displayOrder: z.number().default(0),
});

// Enquiry management schemas
export const createEnquiryFromFormSchema = z.object({
  contactFormId: z.string().uuid('Invalid contact form ID'),
  initialMessage: z.string().min(1).max(2000, 'Initial message must be between 1-2000 characters'),
  estimatedResolution: z.date().optional(),
  notes: z.string().optional(),
});

export const updateEnquiryStatusSchema = z.object({
  id: z.string().uuid('Invalid enquiry ID'),
  status: z.enum([
    'SUBMITTED',
    'UNDER_REVIEW', 
    'ASSIGNED',
    'IN_PROGRESS',
    'WAITING_CUSTOMER',
    'PENDING_RESOLUTION',
    'RESOLVED',
    'CLOSED',
    'CANCELLED',
    'ESCALATED'
  ]),
  response: z.string().optional(),
  responseMethod: z.enum(['email', 'phone', 'sms', 'in-person', 'chat']).optional(),
  resolutionNotes: z.string().optional(),
  estimatedResolution: z.date().optional(),
});

export const assignEnquirySchema = z.object({
  id: z.string().uuid('Invalid enquiry ID'),
  assignedToId: z.string().uuid('Invalid user ID for assignment'),
  assignmentNotes: z.string().optional(),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT', 'CRITICAL']).optional(),
});

// Contact form filtering schema
export const contactFormFilterSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(50).default(10),
  status: z.enum([
    'SUBMITTED',
    'UNDER_REVIEW',
    'ASSIGNED', 
    'IN_PROGRESS',
    'WAITING_CUSTOMER',
    'PENDING_RESOLUTION',
    'RESOLVED',
    'CLOSED',
    'CANCELLED',
    'ESCALATED'
  ]).optional(),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT', 'CRITICAL']).optional(),
  categoryId: z.string().uuid().optional(),
  clinicId: z.string().uuid().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  search: z.string().optional(),
  orderBy: z.enum(['submittedAt', 'priority', 'status', 'referenceNumber']).default('submittedAt'),
  orderDirection: z.enum(['asc', 'desc']).default('desc'),
});

// Analytics schemas
export const contactAnalyticsFilterSchema = z.object({
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  clinicId: z.string().uuid().optional(),
});

// Auto-save schema (subset of form data)
export const autoSaveSchema = z.object({
  formType: z.string(),
  currentStep: z.number(),
  formData: z.any(),
  lastSaved: z.date(),
  sessionId: z.string(),
});

// Type exports
export type ContactFormSubmissionData = z.infer<typeof contactFormSubmissionSchema>;
export type ContactFormTrackingData = z.infer<typeof contactFormTrackingSchema>;
export type AppointmentRequestData = z.infer<typeof appointmentRequestSchema>;
export type GeneralInquiryData = z.infer<typeof generalInquirySchema>;
export type MedicalQuestionData = z.infer<typeof medicalQuestionSchema>;
export type BillingInquiryData = z.infer<typeof billingInquirySchema>;
export type FeedbackData = z.infer<typeof feedbackSchema>;
export type FileUploadData = z.infer<typeof fileUploadSchema>;
export type AutoSaveData = z.infer<typeof autoSaveSchema>;
export type CreateContactCategoryData = z.infer<typeof createContactCategorySchema>;
export type CreateEnquiryFromFormData = z.infer<typeof createEnquiryFromFormSchema>;
export type UpdateEnquiryStatusData = z.infer<typeof updateEnquiryStatusSchema>;
export type AssignEnquiryData = z.infer<typeof assignEnquirySchema>;
export type ContactFormFilterData = z.infer<typeof contactFormFilterSchema>;
export type ContactAnalyticsFilterData = z.infer<typeof contactAnalyticsFilterSchema>;

// Form configuration
export const CONTACT_TYPES = {
  appointment: {
    label: 'Request Appointment',
    description: 'Schedule a consultation or follow-up visit',
    schema: appointmentRequestSchema,
    maxSteps: 4,
  },
  general: {
    label: 'General Inquiry',
    description: 'Ask questions about our services',
    schema: generalInquirySchema,
    maxSteps: 3,
  },
  medical: {
    label: 'Medical Question',
    description: 'Ask about medical conditions or treatments',
    schema: medicalQuestionSchema,
    maxSteps: 4,
  },
  billing: {
    label: 'Billing Inquiry',
    description: 'Questions about bills, insurance, or payments',
    schema: billingInquirySchema,
    maxSteps: 3,
  },
  feedback: {
    label: 'Feedback',
    description: 'Share your experience or suggestions',
    schema: feedbackSchema,
    maxSteps: 3,
  },
} as const;

export type ContactType = keyof typeof CONTACT_TYPES;