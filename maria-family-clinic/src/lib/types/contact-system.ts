// ========================================
// CONTACT & ENQUIRY MANAGEMENT SYSTEM TYPES
// Sub-Phase 9.1: TypeScript Type Definitions
// Healthcare Platform Contact System
// ========================================

// Re-export existing healthcare types
export type { User, Clinic, Doctor, Service, UserProfile, UserPreferences } from './database';

// Contact System Enums
export enum ContactCategoryPriority {
  LOW = 'LOW',
  STANDARD = 'STANDARD',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
  CRITICAL = 'CRITICAL'
}

export enum ContactDepartment {
  GENERAL = 'GENERAL',
  APPOINTMENTS = 'APPOINTMENTS',
  HEALTHIER_SG = 'HEALTHIER_SG',
  TECHNICAL_SUPPORT = 'TECHNICAL_SUPPORT',
  MEDICAL_INQUIRIES = 'MEDICAL_INQUIRIES',
  BILLING = 'BILLING',
  COMPLIANCE = 'COMPLIANCE',
  QUALITY_ASSURANCE = 'QUALITY_ASSURANCE',
  EMERGENCY = 'EMERGENCY'
}

export enum ContactStatus {
  SUBMITTED = 'SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  WAITING_CUSTOMER = 'WAITING_CUSTOMER',
  PENDING_RESOLUTION = 'PENDING_RESOLUTION',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
  CANCELLED = 'CANCELLED',
  ESCALATED = 'ESCALATED'
}

export enum ContactPriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
  CRITICAL = 'CRITICAL',
  EMERGENCY = 'EMERGENCY'
}

export enum ContactSource {
  WEB_FORM = 'WEB_FORM',
  EMAIL = 'EMAIL',
  PHONE = 'PHONE',
  CHAT = 'CHAT',
  MOBILE_APP = 'MOBILE_APP',
  SOCIAL_MEDIA = 'SOCIAL_MEDIA',
  WALK_IN = 'WALK_IN',
  REFERRAL = 'REFERRAL',
  API = 'API',
  SMS = 'SMS'
}

export enum ContactMethod {
  EMAIL = 'EMAIL',
  PHONE = 'PHONE',
  SMS = 'SMS',
  CHAT = 'CHAT',
  MAIL = 'MAIL',
  IN_PERSON = 'IN_PERSON'
}

export enum SpamCheckResult {
  PENDING = 'PENDING',
  CLEAN = 'CLEAN',
  SUSPICIOUS = 'SUSPICIOUS',
  SPAM = 'SPAM',
  MALICIOUS = 'MALICIOUS'
}

export enum EnquiryStatus {
  NEW = 'NEW',
  UNDER_REVIEW = 'UNDER_REVIEW',
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  WAITING_CUSTOMER = 'WAITING_CUSTOMER',
  WAITING_INTERNAL = 'WAITING_INTERNAL',
  PENDING_RESOLUTION = 'PENDING_RESOLUTION',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
  CANCELLED = 'CANCELLED',
  ESCALATED = 'ESCALATED'
}

export enum EnquiryType {
  INFORMATIONAL = 'INFORMATIONAL',
  COMPLAINT = 'COMPLAINT',
  COMPLIMENT = 'COMPLIMENT',
  SUGGESTION = 'SUGGESTION',
  SUPPORT_REQUEST = 'SUPPORT_REQUEST',
  TECHNICAL_ISSUE = 'TECHNICAL_ISSUE',
  BILLING_INQUIRY = 'BILLING_INQUIRY',
  APPOINTMENT_RELATED = 'APPOINTMENT_RELATED',
  MEDICAL_INQUIRY = 'MEDICAL_INQUIRY',
  COMPLIANCE_ISSUE = 'COMPLIANCE_ISSUE'
}

export enum EnquiryPriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
  CRITICAL = 'CRITICAL',
  EMERGENCY = 'EMERGENCY'
}

export enum ResolutionStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  PENDING_CUSTOMER = 'PENDING_CUSTOMER',
  PENDING_INTERNAL = 'PENDING_INTERNAL',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
  CANCELLED = 'CANCELLED'
}

export enum BusinessImpact {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
  REPUTATIONAL = 'REPUTATIONAL',
  LEGAL = 'LEGAL',
  FINANCIAL = 'FINANCIAL'
}

export enum ContactTeam {
  GENERAL_SUPPORT = 'GENERAL_SUPPORT',
  APPOINTMENT_TEAM = 'APPOINTMENT_TEAM',
  HEALTHIER_SG_SPECIALISTS = 'HEALTHIER_SG_SPECIALISTS',
  TECHNICAL_SUPPORT = 'TECHNICAL_SUPPORT',
  MEDICAL_CONSULTANTS = 'MEDICAL_CONSULTANTS',
  BILLING_SUPPORT = 'BILLING_SUPPORT',
  COMPLIANCE_TEAM = 'COMPLIANCE_TEAM',
  ESCALATION_TEAM = 'ESCALATION_TEAM',
  EMERGENCY_RESPONSE = 'EMERGENCY_RESPONSE'
}

export enum AppointmentUrgency {
  STANDARD = 'STANDARD',
  PRIORITY = 'PRIORITY',
  URGENT = 'URGENT',
  EMERGENCY = 'EMERGENCY',
  WALK_IN = 'WALK_IN',
  SAME_DAY = 'SAME_DAY'
}

export enum AssigneeType {
  AGENT = 'AGENT',
  TEAM = 'TEAM',
  DEPARTMENT = 'DEPARTMENT',
  SPECIALIST = 'SPECIALIST',
  SUPERVISOR = 'SUPERVISOR'
}

export enum AssignmentMethod {
  MANUAL = 'MANUAL',
  AUTO_ROUND_ROBIN = 'AUTO_ROUND_ROBIN',
  AUTO_SKILL_BASED = 'AUTO_SKILL_BASED',
  AUTO_LOAD_BALANCED = 'AUTO_LOAD_BALANCED',
  AUTO_SPECIALIST = 'AUTO_SPECIALIST',
  AUTO_ESCALATION = 'AUTO_ESCALATION'
}

export enum AssignmentStatus {
  ACTIVE = 'ACTIVE',
  ACCEPTED = 'ACCEPTED',
  DECLINED = 'DECLINED',
  COMPLETED = 'COMPLETED',
  TRANSFERRED = 'TRANSFERRED',
  ESCALATED = 'ESCALATED'
}

export enum ContactActionType {
  CREATED = 'CREATED',
  ASSIGNED = 'ASSIGNED',
  STATUS_CHANGED = 'STATUS_CHANGED',
  RESPONDED = 'RESPONDED',
  ESCALATED = 'ESCALATED',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
  REOPENED = 'REOPENED',
  MERGED = 'MERGED',
  SPLIT = 'SPLIT',
  UPDATED = 'UPDATED',
  NOTE_ADDED = 'NOTE_ADDED',
  FILE_ATTACHED = 'FILE_ATTACHED',
  TEMPLATE_APPLIED = 'TEMPLATE_APPLIED',
  AUTOMATION_TRIGGERED = 'AUTOMATION_TRIGGERED'
}

export enum ActorType {
  USER = 'USER',
  AGENT = 'AGENT',
  SUPERVISOR = 'SUPERVISOR',
  SYSTEM = 'SYSTEM',
  AUTOMATION = 'AUTOMATION',
  ADMIN = 'ADMIN',
  API = 'API',
  INTEGRATION = 'INTEGRATION'
}

export enum CommunicationType {
  EMAIL = 'EMAIL',
  PHONE_CALL = 'PHONE_CALL',
  SMS = 'SMS',
  CHAT_MESSAGE = 'CHAT_MESSAGE',
  LETTER = 'LETTER',
  IN_PERSON = 'IN_PERSON',
  SYSTEM_NOTIFICATION = 'SYSTEM_NOTIFICATION',
  AUTOMATED_RESPONSE = 'AUTOMATED_RESPONSE',
  TICKET_UPDATE = 'TICKET_UPDATE',
  STATUS_CHANGE = 'STATUS_CHANGE'
}

export enum MessageDirection {
  INBOUND = 'INBOUND',
  OUTBOUND = 'OUTBOUND',
  INTERNAL = 'INTERNAL'
}

export enum DeliveryStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  READ = 'READ',
  FAILED = 'FAILED',
  BOUNCED = 'BOUNCED',
  REPLIED = 'REPLIED'
}

export enum ResponseType {
  INITIAL_RESPONSE = 'INITIAL_RESPONSE',
  FOLLOW_UP = 'FOLLOW_UP',
  RESOLUTION = 'RESOLUTION',
  CLOSURE = 'CLOSURE',
  ESCALATION_NOTE = 'ESCALATION_NOTE',
  INTERNAL_NOTE = 'INTERNAL_NOTE',
  CUSTOMER_UPDATE = 'CUSTOMER_UPDATE',
  SYSTEM_AUTOMATION = 'SYSTEM_AUTOMATION',
  TEMPLATE_RESPONSE = 'TEMPLATE_RESPONSE'
}

export enum SenderType {
  AGENT = 'AGENT',
  SUPERVISOR = 'SUPERVISOR',
  SYSTEM = 'SYSTEM',
  AUTOMATION = 'AUTOMATION',
  TEMPLATE = 'TEMPLATE',
  SPECIALIST = 'SPECIALIST'
}

export enum RecipientType {
  CUSTOMER = 'CUSTOMER',
  AGENT = 'AGENT',
  SUPERVISOR = 'SUPERVISOR',
  DEPARTMENT = 'DEPARTMENT',
  TEAM = 'TEAM',
  SPECIALIST = 'SPECIALIST',
  SYSTEM = 'SYSTEM'
}

export enum CommunicationChannel {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  PHONE = 'PHONE',
  CHAT = 'CHAT',
  TICKET_SYSTEM = 'TICKET_SYSTEM',
  PORTAL = 'PORTAL',
  MAIL = 'MAIL',
  IN_PERSON = 'IN_PERSON',
  SYSTEM = 'SYSTEM',
  API = 'API'
}

export enum ResponseStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  READ = 'READ',
  REPLIED = 'REPLIED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}

export enum DeviceType {
  DESKTOP = 'DESKTOP',
  MOBILE = 'MOBILE',
  TABLET = 'TABLET',
  UNKNOWN = 'UNKNOWN'
}

export enum SentimentScore {
  VERY_NEGATIVE = 'VERY_NEGATIVE',
  NEGATIVE = 'NEGATIVE',
  NEUTRAL = 'NEUTRAL',
  POSITIVE = 'POSITIVE',
  VERY_POSITIVE = 'VERY_POSITIVE',
  MIXED = 'MIXED'
}

export enum RoutingTargetType {
  AGENT = 'AGENT',
  TEAM = 'TEAM',
  DEPARTMENT = 'DEPARTMENT',
  SPECIALIST = 'SPECIALIST',
  QUEUE = 'QUEUE',
  POOL = 'POOL'
}

export enum RoutingMethod {
  DIRECT = 'DIRECT',
  ROUND_ROBIN = 'ROUND_ROBIN',
  SKILL_BASED = 'SKILL_BASED',
  LOAD_BALANCED = 'LOAD_BALANCED',
  PRIORITY_BASED = 'PRIORITY_BASED',
  SPECIALIST = 'SPECIALIST',
  GEOGRAPHIC = 'GEOGRAPHIC',
  LANGUAGE_BASED = 'LANGUAGE_BASED',
  AVAILABILITY = 'AVAILABILITY'
}

export enum EscalationType {
  SLA_BREACH = 'SLA_BREACH',
  CUSTOMER_REQUEST = 'CUSTOMER_REQUEST',
  COMPLEXITY = 'COMPLEXITY',
  SUPERVISOR_REQUEST = 'SUPERVISOR_REQUEST',
  SPECIALIST_REQUIRED = 'SPECIALIST_REQUIRED',
  COMPLIANCE_ISSUE = 'COMPLIANCE_ISSUE',
  EMERGENCY = 'EMERGENCY',
  TECHNICAL = 'TECHNICAL',
  COMPLAINT = 'COMPLAINT',
  QUALITY_ISSUE = 'QUALITY_ISSUE'
}

export enum EscalationLevel {
  L1_AGENT = 'L1_AGENT',
  L2_SUPERVISOR = 'L2_SUPERVISOR',
  L3_SPECIALIST = 'L3_SPECIALIST',
  L4_MANAGER = 'L4_MANAGER',
  L5_DIRECTOR = 'L5_DIRECTOR',
  L6_EXECUTIVE = 'L6_EXECUTIVE',
  EMERGENCY = 'EMERGENCY',
  COMPLIANCE = 'COMPLIANCE',
  TECHNICAL = 'TECHNICAL',
  MEDICAL = 'MEDICAL'
}

export enum EscalationStatus {
  ACTIVE = 'ACTIVE',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CANCELLED = 'CANCELLED',
  ESCALATED_FURTHER = 'ESCALATED_FURTHER'
}

export enum ContactTemplateCategory {
  AUTO_RESPONSE = 'AUTO_RESPONSE',
  ACKNOWLEDGMENT = 'ACKNOWLEDGMENT',
  RESOLUTION = 'RESOLUTION',
  ESCALATION = 'ESCALATION',
  CLOSURE = 'CLOSURE',
  FOLLOW_UP = 'FOLLOW_UP',
  ERROR_MESSAGE = 'ERROR_MESSAGE',
  INFORMATION_REQUEST = 'INFORMATION_REQUEST',
  COMPLAINT_RESPONSE = 'COMPLAINT_RESPONSE',
  COMPLIMENT_ACKNOWLEDGMENT = 'COMPLIMENT_ACKNOWLEDGMENT'
}

export enum TemplateUsage {
  AUTOMATIC = 'AUTOMATIC',
  MANUAL = 'MANUAL',
  TRIGGERED = 'TRIGGERED',
  SCHEDULED = 'SCHEDULED',
  CONDITIONAL = 'CONDITIONAL',
  ON_DEMAND = 'ON_DEMAND'
}

export enum KBStatus {
  DRAFT = 'DRAFT',
  UNDER_REVIEW = 'UNDER_REVIEW',
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED',
  DEPRECATED = 'DEPRECATED',
  UNDER_REVISION = 'UNDER_REVISION',
  VERIFIED = 'VERIFIED'
}

// Base interface for form field
export interface FormField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'email' | 'phone' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'date' | 'file';
  required: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  validation?: {
    pattern?: string;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
  };
  conditional?: {
    field: string;
    operator: 'equals' | 'not_equals' | 'contains' | 'not_contains';
    value: string;
  };
}

// Contact Category Interface
export interface ContactCategory {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  requiresAuth: boolean;
  requiresVerification: boolean;
  priority: ContactCategoryPriority;
  department: ContactDepartment;
  formFields: FormField[];
  validationRules: Record<string, any>;
  autoResponse: boolean;
  responseTemplate?: string;
  defaultAssignee?: string;
  routingRules: any[];
  escalationRules: any[];
  responseSLAHours: number;
  resolutionSLADays: number;
  isActive: boolean;
  sortOrder: number;
  icon?: string;
  color?: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  enquiries?: Enquiry[];
  templates?: ContactFormTemplate[];
}

// Contact Form Template Interface
export interface ContactFormTemplate {
  id: string;
  categoryId: string;
  name: string;
  displayName: string;
  formConfig: Record<string, any>;
  fieldDefinitions: FormField[];
  conditionalLogic: Record<string, any>;
  layout: Record<string, any>;
  medicalFields: boolean;
  requiresNric: boolean;
  requiresConsent: boolean;
  hipaaCompliant: boolean;
  translations: Record<string, string>;
  supportedLanguages: string[];
  version: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  category: ContactCategory;
}

// Contact Form Interface
export interface ContactForm {
  id: string;
  referenceNumber: string;
  categoryId: string;
  templateId?: string;
  subject: string;
  message: string;
  formData: Record<string, any>;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  preferredContactMethod: ContactMethod;
  userId?: string;
  patientId?: string;
  clinicId?: string;
  doctorId?: string;
  serviceId?: string;
  medicalInformation?: string;
  urgencyLevel: UrgencyLevel;
  appointmentUrgency: AppointmentUrgency;
  submissionSource: ContactSource;
  userAgent?: string;
  ipAddress?: string;
  referrerUrl?: string;
  sessionId?: string;
  privacyConsent: boolean;
  marketingConsent: boolean;
  dataRetentionConsent: boolean;
  consentVersion?: string;
  gdprConsent: boolean;
  pdpaConsent: boolean;
  status: ContactStatus;
  processingNotes?: string;
  autoProcessed: boolean;
  spamCheckResult: SpamCheckResult;
  duplicateCheck: boolean;
  duplicateOfId?: string;
  responseRequired: boolean;
  autoResponseSent: boolean;
  responseDue?: Date;
  responseSent?: Date;
  firstResponseTime?: number;
  priority: ContactPriority;
  assignedAgentId?: string;
  assignedDepartment: ContactDepartment;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  category: ContactCategory;
  template?: ContactFormTemplate;
  user?: User;
  clinic?: Clinic;
  doctor?: Doctor;
  service?: Service;
  enquiry?: Enquiry;
  assignments?: ContactAssignment[];
  histories?: ContactHistory[];
  responses?: ContactResponse[];
  analytics?: ContactFormAnalytics;
}

// Enquiry Interface
export interface Enquiry {
  id: string;
  contactFormId?: string;
  enquiryNumber: string;
  title: string;
  categoryId: string;
  enquiryType: EnquiryType;
  status: EnquiryStatus;
  subStatus?: string;
  resolutionStatus: ResolutionStatus;
  priority: EnquiryPriority;
  urgencyLevel: UrgencyLevel;
  businessImpact: BusinessImpact;
  assignedAgentId?: string;
  assignedTeam?: ContactTeam;
  supervisorId?: string;
  originalAssignee?: string;
  department: ContactDepartment;
  specializedTeam?: string;
  medicalReview: boolean;
  complianceReview: boolean;
  userId?: string;
  patientId?: string;
  clinicId?: string;
  doctorId?: string;
  serviceId?: string;
  appointmentId?: string;
  description: string;
  initialInquiry: string;
  customerExpectations?: string;
  requiredAction?: string;
  resolutionSummary?: string;
  resolutionNotes?: string;
  closureReason?: string;
  customerSatisfaction?: number;
  slaBreached: boolean;
  slaBreachReason?: string;
  escalationCount: number;
  lastEscalationAt?: Date;
  requiresFollowUp: boolean;
  followUpRequired: boolean;
  followUpDate?: Date;
  followUpNotes?: string;
  followUpCompleted: boolean;
  externalReference?: string;
  integrationStatus: IntegrationSyncStatus;
  syncData: Record<string, any>;
  workflowStage: string;
  workflowData: Record<string, any>;
  sourceChannel: ContactSource;
  tags: string[];
  customFields: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  assignedAt?: Date;
  resolvedAt?: Date;
  closedAt?: Date;
  
  // Relations
  contactForm?: ContactForm;
  category: ContactCategory;
  user?: User;
  clinic?: Clinic;
  doctor?: Doctor;
  service?: Service;
  assignments?: ContactAssignment[];
  histories?: ContactHistory[];
  responses?: ContactResponse[];
  analytics?: ContactEnquiryAnalytics;
  escalations?: ContactEscalation[];
}

// Contact Assignment Interface
export interface ContactAssignment {
  id: string;
  enquiryId: string;
  contactFormId?: string;
  assigneeType: AssigneeType;
  assigneeId?: string;
  assigneeName: string;
  assignmentReason?: string;
  assignedBy: string;
  assignmentMethod: AssignmentMethod;
  skillMatch: Record<string, any>;
  status: AssignmentStatus;
  acceptedAt?: Date;
  declinedAt?: Date;
  declineReason?: string;
  isReassignment: boolean;
  previousAssignee?: string;
  reassignmentReason?: string;
  currentWorkload: number;
  workloadLimit?: number;
  assignmentScore?: number;
  responseTime?: number;
  resolutionTime?: number;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  enquiry: Enquiry;
  contactForm?: ContactForm;
}

// Contact History Interface
export interface ContactHistory {
  id: string;
  enquiryId: string;
  contactFormId?: string;
  actionType: ContactActionType;
  actionDescription: string;
  actorType: ActorType;
  actorId?: string;
  actorName: string;
  actorEmail?: string;
  fieldChanged?: string;
  oldValue?: string;
  newValue?: string;
  changeReason?: string;
  communicationType: CommunicationType;
  messageContent?: string;
  messageSubject?: string;
  messageDirection: MessageDirection;
  externalSystem?: string;
  externalReference?: string;
  deliveryStatus?: DeliveryStatus;
  timeSpent?: number;
  responseTime?: number;
  medicalRecord: boolean;
  containsPHI: boolean;
  hipaaCompliant: boolean;
  auditTrail: boolean;
  metadata: Record<string, any>;
  tags: string[];
  createdAt: Date;
  
  // Relations
  enquiry: Enquiry;
  contactForm?: ContactForm;
}

// Contact Response Interface
export interface ContactResponse {
  id: string;
  enquiryId: string;
  contactFormId?: string;
  responseType: ResponseType;
  subject?: string;
  content: string;
  senderType: SenderType;
  senderId?: string;
  senderName: string;
  senderEmail?: string;
  senderSignature?: string;
  recipientType: RecipientType;
  recipientId?: string;
  recipientName: string;
  recipientEmail: string;
  channel: CommunicationChannel;
  channelReference?: string;
  status: ResponseStatus;
  sentAt?: Date;
  deliveredAt?: Date;
  readAt?: Date;
  repliedAt?: Date;
  satisfactionRating?: number;
  qualityScore?: number;
  responseTime?: number;
  templateUsed?: string;
  autoGenerated: boolean;
  automationRules: any[];
  medicalAdvice: boolean;
  disclaimerRequired: boolean;
  complianceChecked: boolean;
  privacyReviewed: boolean;
  attachments: any[];
  attachmentCount: number;
  requiresFollowUp: boolean;
  followUpDate?: Date;
  followUpNotes?: string;
  followUpCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  enquiry: Enquiry;
  contactForm?: ContactForm;
}

// Contact Routing Interface
export interface ContactRouting {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  isActive: boolean;
  priority: number;
  categoryId?: string;
  criteria: Record<string, any>;
  weight: number;
  targetType: RoutingTargetType;
  targetId?: string;
  targetName: string;
  routingMethod: RoutingMethod;
  roundRobinGroup?: string;
  skillRequirements: any[];
  checkAvailability: boolean;
  maxWorkload?: number;
  businessHoursOnly: boolean;
  timezone?: string;
  fallbackEnabled: boolean;
  fallbackTarget?: string;
  fallbackDelay?: number;
  usageCount: number;
  successRate?: number;
  avgResponseTime?: number;
  createdAt: Date;
  updatedAt: Date;
}

// Contact Escalation Interface
export interface ContactEscalation {
  id: string;
  enquiryId: string;
  escalationType: EscalationType;
  escalationReason: string;
  triggeredBy: string;
  fromLevel: EscalationLevel;
  toLevel: EscalationLevel;
  levelData: Record<string, any>;
  triggeredAt: Date;
  processedAt?: Date;
  resolvedAt?: Date;
  triggeredByUser?: string;
  escalatedToUser?: string;
  escalatedToTeam?: string;
  status: EscalationStatus;
  resolutionNotes?: string;
  customerNotified: boolean;
  slaImpact: Record<string, any>;
  resolutionTime?: number;
  autoTriggered: boolean;
  automationRule?: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  enquiry: Enquiry;
}

// Contact Form Analytics Interface
export interface ContactFormAnalytics {
  id: string;
  contactFormId: string;
  submissionTime: number;
  fieldCompletionTime: Record<string, number>;
  abandonRate?: number;
  completionRate?: number;
  userSatisfaction?: number;
  errorCount: number;
  correctionCount: number;
  deviceType?: DeviceType;
  browserType?: string;
  referralSource?: string;
  conversionFunnel: Record<string, any>;
  messageSentiment: SentimentScore;
  urgencyDetected: boolean;
  spamScore?: number;
  apiResponseTime?: number;
  databaseQueryTime?: number;
  processingTime?: number;
  testVariant?: string;
  testResults: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  contactForm: ContactForm;
}

// Contact Enquiry Analytics Interface
export interface ContactEnquiryAnalytics {
  id: string;
  enquiryId: string;
  totalResolutionTime?: number;
  firstResponseTime?: number;
  followUpCount: number;
  communicationCount: number;
  customerSatisfaction?: number;
  agentSatisfaction?: number;
  qualityScore?: number;
  resolutionEfficiency?: number;
  knowledgeBaseUsage?: number;
  escalationRate?: number;
  handlingCost?: number;
  agentTimeCost?: number;
  systemResourceCost?: number;
  resolved: boolean;
  customerRetained?: boolean;
  repeatContact: boolean;
  lessonsLearned?: string;
  improvementSuggestions?: string;
  processImprovements: any[];
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  enquiry: Enquiry;
}

// Contact Template Interface
export interface ContactTemplate {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  category: ContactTemplateCategory;
  usage: TemplateUsage;
  language: string;
  subject?: string;
  content: string;
  variables: any[];
  medicalAdvice: boolean;
  disclaimerRequired: boolean;
  complianceNote?: string;
  personalizationEnabled: boolean;
  dynamicContent: boolean;
  version: string;
  isActive: boolean;
  usageCount: number;
  lastUsedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Contact Knowledge Base Interface
export interface ContactKnowledgeBase {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  relatedTopics: string[];
  medicalSpecialty?: string;
  applicableConditions: string[];
  ageGroup?: string;
  viewCount: number;
  helpfulCount: number;
  unhelpfulCount: number;
  keywords: string[];
  searchTerms: string[];
  status: KBStatus;
  verifiedBy?: string;
  verifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Contact System DTOs (Data Transfer Objects)
export interface CreateContactFormDto {
  categoryId: string;
  templateId?: string;
  subject: string;
  message: string;
  formData: Record<string, any>;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  preferredContactMethod?: ContactMethod;
  userId?: string;
  clinicId?: string;
  doctorId?: string;
  serviceId?: string;
  medicalInformation?: string;
  urgencyLevel?: UrgencyLevel;
  appointmentUrgency?: AppointmentUrgency;
  privacyConsent: boolean;
  marketingConsent?: boolean;
  dataRetentionConsent?: boolean;
  gdprConsent?: boolean;
  pdpaConsent?: boolean;
}

export interface UpdateContactFormDto {
  subject?: string;
  message?: string;
  formData?: Record<string, any>;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  preferredContactMethod?: ContactMethod;
  priority?: ContactPriority;
  assignedAgentId?: string;
  status?: ContactStatus;
  processingNotes?: string;
}

export interface CreateEnquiryDto {
  contactFormId?: string;
  title: string;
  categoryId: string;
  enquiryType: EnquiryType;
  priority?: EnquiryPriority;
  urgencyLevel?: UrgencyLevel;
  businessImpact?: BusinessImpact;
  department?: ContactDepartment;
  userId?: string;
  clinicId?: string;
  doctorId?: string;
  serviceId?: string;
  description: string;
  initialInquiry: string;
  tags?: string[];
  customFields?: Record<string, any>;
}

export interface UpdateEnquiryDto {
  title?: string;
  enquiryType?: EnquiryType;
  status?: EnquiryStatus;
  subStatus?: string;
  resolutionStatus?: ResolutionStatus;
  priority?: EnquiryPriority;
  urgencyLevel?: UrgencyLevel;
  businessImpact?: BusinessImpact;
  assignedAgentId?: string;
  assignedTeam?: ContactTeam;
  supervisorId?: string;
  department?: ContactDepartment;
  medicalReview?: boolean;
  complianceReview?: boolean;
  description?: string;
  customerExpectations?: string;
  requiredAction?: string;
  resolutionSummary?: string;
  resolutionNotes?: string;
  closureReason?: string;
  customerSatisfaction?: number;
  requiresFollowUp?: boolean;
  followUpRequired?: boolean;
  followUpDate?: Date;
  followUpNotes?: string;
  workflowStage?: string;
  workflowData?: Record<string, any>;
  tags?: string[];
  customFields?: Record<string, any>;
}

export interface CreateContactResponseDto {
  enquiryId: string;
  contactFormId?: string;
  responseType: ResponseType;
  subject?: string;
  content: string;
  senderId?: string;
  senderName: string;
  senderEmail?: string;
  recipientName: string;
  recipientEmail: string;
  channel: CommunicationChannel;
  templateUsed?: string;
  autoGenerated?: boolean;
  medicalAdvice?: boolean;
  disclaimerRequired?: boolean;
  complianceChecked?: boolean;
  privacyReviewed?: boolean;
  requiresFollowUp?: boolean;
  followUpDate?: Date;
  followUpNotes?: string;
}

export interface ContactAssignmentDto {
  enquiryId: string;
  contactFormId?: string;
  assigneeType: AssigneeType;
  assigneeId?: string;
  assigneeName: string;
  assignmentReason?: string;
  assignedBy: string;
  assignmentMethod: AssignmentMethod;
  skillMatch?: Record<string, any>;
  isReassignment?: boolean;
  previousAssignee?: string;
  reassignmentReason?: string;
}

export interface ContactRoutingDto {
  name: string;
  displayName: string;
  description?: string;
  isActive?: boolean;
  priority?: number;
  categoryId?: string;
  criteria: Record<string, any>;
  weight?: number;
  targetType: RoutingTargetType;
  targetId?: string;
  targetName: string;
  routingMethod?: RoutingMethod;
  roundRobinGroup?: string;
  skillRequirements?: any[];
  checkAvailability?: boolean;
  maxWorkload?: number;
  businessHoursOnly?: boolean;
  timezone?: string;
  fallbackEnabled?: boolean;
  fallbackTarget?: string;
  fallbackDelay?: number;
}

// Contact System Query Interfaces
export interface ContactFormQuery {
  categoryId?: string;
  status?: ContactStatus;
  priority?: ContactPriority;
  userId?: string;
  clinicId?: string;
  doctorId?: string;
  serviceId?: string;
  contactEmail?: string;
  contactPhone?: string;
  createdFrom?: Date;
  createdTo?: Date;
  responseDueFrom?: Date;
  responseDueTo?: Date;
  limit?: number;
  offset?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'priority' | 'responseDue';
  sortOrder?: 'asc' | 'desc';
}

export interface EnquiryQuery {
  categoryId?: string;
  status?: EnquiryStatus;
  priority?: EnquiryPriority;
  urgencyLevel?: UrgencyLevel;
  assignedAgentId?: string;
  assignedTeam?: ContactTeam;
  userId?: string;
  clinicId?: string;
  doctorId?: string;
  serviceId?: string;
  department?: ContactDepartment;
  medicalReview?: boolean;
  complianceReview?: boolean;
  slaBreached?: boolean;
  requiresFollowUp?: boolean;
  followUpCompleted?: boolean;
  createdFrom?: Date;
  createdTo?: Date;
  resolvedFrom?: Date;
  resolvedTo?: Date;
  followUpFrom?: Date;
  followUpTo?: Date;
  limit?: number;
  offset?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'priority' | 'urgencyLevel' | 'resolvedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface ContactAnalyticsQuery {
  categoryId?: string;
  status?: ContactStatus | EnquiryStatus;
  priority?: ContactPriority | EnquiryPriority;
  department?: ContactDepartment;
  assignedAgentId?: string;
  createdFrom?: Date;
  createdTo?: Date;
  resolvedFrom?: Date;
  resolvedTo?: Date;
  groupBy?: 'category' | 'status' | 'priority' | 'department' | 'agent' | 'day' | 'week' | 'month';
  metrics?: string[];
}

// Contact System Response Interfaces
export interface ContactFormStats {
  categoryName: string;
  categoryDisplayName: string;
  totalForms: number;
  submittedCount: number;
  resolvedCount: number;
  escalatedCount: number;
  avgSubmissionTime: number;
  avgUserSatisfaction: number;
}

export interface EnquiryResolutionMetrics {
  categoryName: string;
  totalEnquiries: number;
  newEnquiries: number;
  resolvedEnquiries: number;
  escalatedEnquiries: number;
  slaBreaches: number;
  avgResolutionTime: number;
  avgCustomerSatisfaction: number;
  avgFollowUpCount: number;
}

export interface ContactDashboardStats {
  totalContactForms: number;
  totalEnquiries: number;
  pendingForms: number;
  pendingEnquiries: number;
  escalatedCases: number;
  slaBreaches: number;
  avgResponseTime: number;
  avgResolutionTime: number;
  customerSatisfaction: number;
  formsByCategory: Record<string, number>;
  enquiriesByStatus: Record<string, number>;
  enquiriesByPriority: Record<string, number>;
  trends: {
    forms: { date: string; count: number }[];
    enquiries: { date: string; count: number }[];
    resolutions: { date: string; count: number }[];
  };
}

// ============================================================================
// CONTACT INTEGRATION TYPES
// Sub-Phase 9.9: Integration with Existing Features
// ============================================================================

export enum ContactType {
  GENERAL_INQUIRY = 'GENERAL_INQUIRY',
  APPOINTMENT_RELATED = 'APPOINTMENT_RELATED',
  SERVICE_INQUIRY = 'SERVICE_INQUIRY',
  DOCTOR_CONSULTATION = 'DOCTOR_CONSULTATION',
  CLINIC_SUPPORT = 'CLINIC_SUPPORT',
  HEALTHIER_SG_PROGRAM = 'HEALTHIER_SG_PROGRAM',
  BILLING_INQUIRY = 'BILLING_INQUIRY',
  MEDICAL_QUESTION = 'MEDICAL_QUESTION',
  PRESCRIPTION_INQUIRY = 'PRESCRIPTION_INQUIRY',
  TECHNICAL_SUPPORT = 'TECHNICAL_SUPPORT',
  FEEDBACK = 'FEEDBACK',
  COMPLAINT = 'COMPLAINT',
  EMERGENCY = 'EMERGENCY',
  FOLLOW_UP = 'FOLLOW_UP',
  REMINDER = 'REMINDER'
}

export enum ContactHistoryStatus {
  ACTIVE = 'ACTIVE',
  PENDING = 'PENDING',
  RESOLVED = 'RESOLVED',
  ARCHIVED = 'ARCHIVED',
  DELETED = 'DELETED',
  ESCALATED = 'ESCALATED'
}

export enum ContactAccessLevel {
  STANDARD = 'STANDARD',
  ENHANCED = 'ENHANCED',
  MEDICAL = 'MEDICAL',
  CONFIDENTIAL = 'CONFIDENTIAL',
  RESTRICTED = 'RESTRICTED'
}

export enum NotificationType {
  FORM_SUBMISSION = 'FORM_SUBMISSION',
  ENQUIRY_RESPONSE = 'ENQUIRY_RESPONSE',
  APPOINTMENT_REMINDER = 'APPOINTMENT_REMINDER',
  FOLLOW_UP_REQUIRED = 'FOLLOW_UP_REQUIRED',
  STATUS_UPDATE = 'STATUS_UPDATE',
  EMERGENCY_ALERT = 'EMERGENCY_ALERT',
  HEALTHIER_SG_UPDATE = 'HEALTHIER_SG_UPDATE',
  SYSTEM_MAINTENANCE = 'SYSTEM_MAINTENANCE',
  MARKETING_UPDATE = 'MARKETING_UPDATE',
  PRIVACY_UPDATE = 'PRIVACY_UPDATE'
}

export enum NotificationChannel {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  PUSH_NOTIFICATION = 'PUSH_NOTIFICATION',
  IN_APP = 'IN_APP',
  WHATSAPP = 'WHATSAPP',
  PHONE_CALL = 'PHONE_CALL'
}

export enum NotificationPriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
  CRITICAL = 'CRITICAL'
}

export enum IntegrationType {
  FORM_OPENING = 'FORM_OPENING',
  FORM_SUBMISSION = 'FORM_SUBMISSION',
  CONTEXT_SWITCH = 'CONTEXT_SWITCH',
  PREFERENCE_UPDATE = 'PREFERENCE_UPDATE',
  HISTORY_ACCESS = 'HISTORY_ACCESS',
  NOTIFICATION_SENT = 'NOTIFICATION_SENT',
  CROSS_SYSTEM_LINK = 'CROSS_SYSTEM_LINK',
  ANALYTICS_TRACK = 'ANALYTICS_TRACK'
}

// Re-export UrgencyLevel from existing types
export type { UrgencyLevel } from './database';
export type { IntegrationSyncStatus } from './database';
