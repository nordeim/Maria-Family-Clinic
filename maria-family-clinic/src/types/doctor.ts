/**
 * Doctor Management TypeScript Types
 * Generated from Prisma Schema - Sub-Phase 7.1: Doctor Database Architecture & Schema Extension
 * 
 * This file contains TypeScript interfaces and types for the comprehensive doctor management system
 * including doctor profiles, clinic relationships, availability tracking, and search optimization.
 */

// =============================================================================
// CORE DOCTOR TYPES
// =============================================================================

export interface Doctor {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  medicalLicense: string;
  nric?: string; // Singapore NRIC (encrypted)
  
  // Professional information
  specialties: string[];
  languages: string[];
  qualifications: string[];
  experienceYears?: number;
  bio?: string;
  
  // Enhanced professional details
  medicalSchool?: string; // Medical school attended
  graduationYear?: number; // Year of graduation
  specializations: string[]; // Specific sub-specializations
  boardCertifications: string[]; // Board certifications
  professionalMemberships: string[]; // Professional societies
  
  // Professional achievements and awards
  achievements: string[]; // Notable achievements
  awards: string[]; // Awards and recognition
  publications: string[]; // Research publications
  researchInterests: string[]; // Areas of research
  
  // Career history
  careerHighlights: CareerHighlight[]; // Career progression details
  previousPositions: PreviousPosition[]; // Previous roles and positions
  
  // Profile and consultation info
  profileImage?: string;
  consultationFee?: number;
  currency: string;
  
  // Professional status
  isActive: boolean;
  isVerified: boolean;
  verificationDate?: Date;
  verificationNotes?: string;
  
  // Enhanced rating and reviews
  rating?: number;
  reviewCount: number;
  patientSatisfaction?: number; // Average patient satisfaction (1-5)
  appointmentCompletionRate?: number; // Completion rate percentage
  
  // Analytics and metrics
  totalAppointments: number; // Total appointments handled
  specializationPopularity?: number; // Popularity score
  languagePreference: Record<string, number>; // Language preference analytics
  
  // Privacy and compliance
  privacySettings: PrivacySettings;
  gdprConsent: boolean;
  pdpaConsent: boolean;
  lastPrivacyReview?: Date;
  
  // Professional confidentiality
  confidentialityLevel: ConfidentialityLevel;
  dataRetentionPeriod?: number; // Days to retain data
  
  // Contact preferences
  preferredContactMethod?: 'email' | 'phone' | 'sms';
  communicationPreferences: CommunicationPreferences;
  
  // Emergency contact
  emergencyContact?: string;
  emergencyPhone?: string;
  
  // Professional development
  cmePoints: number; // Continuing medical education points
  lastCMEUpdate?: Date;
  professionalDevelopment: ProfessionalDevelopment[]; // Ongoing education
  
  // Availability preferences
  emergencyAvailability: boolean;
  onCallSchedule?: OnCallSchedule;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  
  // Relationships
  clinics: DoctorClinic[];
  specialtiesRel: DoctorSpecialty[];
  availabilities: DoctorAvailability[];
  educationHistory: DoctorEducation[];
  certifications: DoctorCertification[];
  memberships: DoctorMembership[];
  awardsRel: DoctorAward[];
  schedules: DoctorSchedule[];
  leaves: DoctorLeave[];
  appointments: DoctorAppointment[];
  searchIndex: DoctorSearchIndex[];
  auditLogs: DoctorAuditLog[];
}

// =============================================================================
// DOCTOR-CLINIC RELATIONSHIP TYPES
// =============================================================================

export interface DoctorClinic {
  id: string;
  doctorId: string;
  clinicId: string;
  
  // Assignment details
  role: DoctorRole;
  capacity: DoctorCapacity;
  isPrimary: boolean; // Primary clinic for this doctor
  
  // Schedule information
  workingDays: string[]; // Days of week
  startTime?: string; // Format: "HH:mm"
  endTime?: string; // Format: "HH:mm"
  
  // Clinic-specific specialization
  clinicSpecializations: string[]; // Specializations at this clinic
  primaryServices: string[]; // Primary services offered here
  
  // Consultation details
  consultationFee?: number;
  consultationDuration?: number; // Standard consultation duration in minutes
  emergencyConsultationFee?: number; // Emergency consultation fee
  
  // Clinic performance metrics
  clinicRating?: number; // Rating specific to this clinic
  clinicReviewCount: number;
  clinicPatientCount: number;
  
  // Operating details
  appointmentTypes: AppointmentType[]; // Available appointment types
  walkInAllowed: boolean;
  advanceBookingDays: number; // How far in advance patients can book
  
  // Insurance and payment
  acceptedInsurance: string[]; // Insurance plans accepted
  medisaveAccepted: boolean;
  chasAccepted: boolean;
  
  // Status and verification
  verificationStatus: VerificationStatus;
  verificationDate?: Date;
  verificationNotes?: string;
  
  // Effective dates
  startDate: Date;
  endDate?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

// =============================================================================
// DOCTOR AVAILABILITY AND SCHEDULE TYPES
// =============================================================================

export interface DoctorAvailability {
  id: string;
  doctorId: string;
  clinicId?: string;
  
  // Date and time information
  date: Date;
  startTime: string; // Format: "HH:mm"
  endTime: string; // Format: "HH:mm"
  
  // Availability details
  isAvailable: boolean;
  availabilityType: AvailabilityType;
  appointmentType?: string; // Regular, emergency, consultation, etc.
  
  // Slot management
  maxAppointments?: number; // Maximum appointments for this slot
  bookedAppointments: number;
  availableSlots: number; // Number of concurrent slots
  
  // Location-specific availability
  location?: string; // Specific location within clinic
  roomNumber?: string; // Room number
  
  // Appointment slots
  slotDuration: number; // Duration per appointment in minutes
  breakDuration: number; // Break time between appointments
  bufferTime: number; // Buffer time before/after
  
  // Special availability flags
  isEmergency: boolean;
  isWalkIn: boolean;
  isTelehealth: boolean;
  
  // Conditions and restrictions
  ageRestrictions: AgeRestrictions; // Age-specific availability
  genderRestrictions: string[];
  conditionsJson: MedicalCondition[]; // Medical conditions
  
  // Status tracking
  status: AvailabilitySlotStatus;
  lastUpdated: Date;
  updatedBy?: string; // Staff member who updated
  
  // Notes
  notes?: string; // Special notes about availability
  
  createdAt: Date;
  updatedAt: Date;
}

export interface DoctorSchedule {
  id: string;
  doctorId: string;
  doctorClinicId: string;
  
  // Schedule information
  scheduleType: ScheduleType;
  dayOfWeek?: DayOfWeek; // For recurring schedules
  specificDate?: Date; // For one-time schedules
  
  // Time details
  startTime: string; // Format: "HH:mm"
  endTime: string; // Format: "HH:mm"
  breakStart?: string; // Format: "HH:mm"
  breakEnd?: string; // Format: "HH:mm"
  
  // Schedule scope
  isRecurring: boolean;
  recurrencePattern: RecurrencePattern; // Weekly/monthly pattern
  
  // Special schedule types
  isOnCall: boolean;
  isEmergency: boolean;
  isTraining: boolean; // Professional development
  
  // Effective dates
  effectiveFrom: Date;
  effectiveTo?: Date;
  
  // Status
  isActive: boolean;
  isOverride: boolean; // Overrides regular schedule
  
  // Notes
  notes?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface DoctorLeave {
  id: string;
  doctorId: string;
  doctorClinicId?: string;
  
  // Leave details
  leaveType: LeaveType;
  startDate: Date;
  endDate: Date;
  
  // Leave information
  reason?: string;
  isApproved: boolean;
  approvedBy?: string; // Staff member who approved
  approvedAt?: Date;
  
  // Emergency coverage
  emergencyCoverage: boolean;
  coverageNotes?: string;
  
  // Leave management
  isPaid: boolean;
  isHalfDay: boolean;
  startTime?: string; // Format: "HH:mm" for half-day
  endTime?: string; // Format: "HH:mm" for half-day
  
  // Status
  status: LeaveStatus;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface DoctorAppointment {
  id: string;
  doctorId: string;
  doctorAvailabilityId?: string;
  
  // Appointment details
  appointmentDate: Date;
  startTime: string; // Format: "HH:mm"
  endTime: string; // Format: "HH:mm"
  
  // Patient information
  patientId?: string; // Patient user ID
  patientName?: string; // If not registered
  patientPhone?: string;
  patientEmail?: string;
  
  // Service details
  serviceId?: string;
  appointmentType?: string;
  urgencyLevel: UrgencyLevel;
  
  // Status tracking
  status: DoctorAppointmentStatus;
  wasCompleted: boolean;
  completionRate?: number; // For completed appointments
  
  // Cancellation and rescheduling
  isCancelled: boolean;
  cancelledAt?: Date;
  cancellationReason?: string;
  cancelledBy?: string; // Patient or staff
  
  // Rescheduling
  isRescheduled: boolean;
  originalDate?: Date;
  originalTime?: string;
  rescheduleReason?: string;
  
  // Notes and feedback
  doctorNotes?: string;
  patientFeedback?: string;
  patientRating?: number; // 1-5 rating
  
  // Reminders and notifications
  reminderSent: boolean;
  reminderSentAt?: Date;
  confirmationRequired: boolean;
  
  // Billing
  consultationFee?: number;
  isPaid: boolean;
  paymentMethod?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

// =============================================================================
// EDUCATION AND CERTIFICATION TYPES
// =============================================================================

export interface DoctorEducation {
  id: string;
  doctorId: string;
  
  // Education details
  educationType: EducationType;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  
  // Dates
  startDate: Date;
  endDate?: Date;
  graduationYear?: number;
  
  // Academic achievements
  gpa?: number; // Grade Point Average
  honors: string[]; // Academic honors
  thesisTitle?: string; // For research degrees
  
  // Verification
  isVerified: boolean;
  verifiedAt?: Date;
  verifiedBy?: string; // Verification staff member
  
  // Location
  country: string;
  city?: string;
  
  // Documentation
  certificateUrl?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface DoctorCertification {
  id: string;
  doctorId: string;
  
  // Certification details
  certificationName: string;
  certificationBody: string; // Issuing organization
  certificationNumber?: string;
  
  // Dates
  issueDate: Date;
  expiryDate?: Date;
  
  // Certification type
  certificationType: CertificationType;
  specialty?: string; // Related medical specialty
  
  // Status
  isActive: boolean;
  isVerified: boolean;
  verifiedAt?: Date;
  
  // Renewal tracking
  renewalRequired: boolean;
  renewalNoticeSent: boolean;
  nextRenewalDate?: Date;
  
  // Documentation
  certificateUrl?: string;
  verificationNotes?: string;
  
  // Level and scope
  certificationLevel?: string; // Basic, Advanced, Expert, etc.
  scopeOfPractice?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface DoctorMembership {
  id: string;
  doctorId: string;
  
  // Membership details
  organizationName: string;
  membershipType: MembershipType;
  membershipLevel?: string; // Member, Fellow, Senior, etc.
  
  // Dates
  joinDate: Date;
  expiryDate?: Date;
  
  // Status
  isActive: boolean;
  isVerified: boolean;
  
  // Membership details
  membershipNumber?: string;
  membershipStatus?: string;
  
  // Location
  country?: string;
  region?: string;
  
  // Documentation
  membershipCertificateUrl?: string;
  
  // Fees and dues
  annualFees?: number;
  lastPaymentDate?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface DoctorAward {
  id: string;
  doctorId: string;
  
  // Award details
  awardName: string;
  awardingBody: string;
  awardCategory?: string; // Clinical, Research, Teaching, etc.
  
  // Date and recognition
  awardDate: Date;
  recognitionLevel: AwardRecognitionLevel;
  
  // Award description
  description?: string;
  significance?: string;
  
  // Documentation
  certificateUrl?: string;
  pressReleaseUrl?: string;
  
  // Verification
  isVerified: boolean;
  verifiedAt?: Date;
  verifiedBy?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

// =============================================================================
// SPECIALIZATION AND SEARCH TYPES
// =============================================================================

export interface DoctorSpecialty {
  id: string;
  doctorId: string;
  specialty: string;
  
  // Specialty details
  subSpecialties: string[]; // Sub-specializations
  expertiseLevel: ExpertiseLevel;
  certificationDate?: Date;
  certificationBody?: string; // Certifying organization
  
  // Practice details
  yearsPracticing?: number; // Years practicing this specialty
  proceduresKnown: string[]; // Specific procedures
  conditionsTreated: string[]; // Conditions treated
  
  // MOH alignment
  mohSpecialtyCode?: string; // MOH specialty code
  mohCategory?: string; // MOH specialty category
  
  // Performance metrics
  successRate?: number; // Success rate for this specialty
  patientCount: number; // Patients treated in this specialty
  
  // Status
  isActive: boolean;
  isVerified: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface DoctorSearchIndex {
  id: string;
  doctorId: string;
  
  // Search optimization
  searchableName: string; // Optimized name for search
  searchableBio?: string; // Optimized biography
  searchKeywords: string[];
  
  // Medical terminology
  medicalTerms: string[];
  specialtyTerms: string[];
  conditionTerms: string[];
  procedureTerms: string[];
  
  // Multilingual support
  nameTranslations: Record<string, string>; // Translations for name
  bioTranslations: Record<string, string>; // Translations for bio
  searchTranslations: Record<string, Record<string, string>>; // Translations for search terms
  
  // Location and accessibility
  serviceAreas: string[]; // Areas served
  languageKeywords: string[]; // Search terms for languages
  
  // Search boost and ranking
  searchBoost: number;
  popularityScore: number;
  ratingBoost: number;
  experienceBoost: number;
  
  // Last index update
  lastIndexed: Date;
  
  createdAt: Date;
}

export interface DoctorAuditLog {
  id: string;
  doctorId: string;
  
  // Audit details
  action: string; // Create, Update, View, Delete, etc.
  fieldName?: string; // Specific field that was changed
  oldValue?: string; // Previous value
  newValue?: string; // New value
  
  // User information
  performedBy?: string; // User ID who performed the action
  userRole?: string; // Role of the user
  
  // Context
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  
  // Data classification
  dataSensitivity: DataSensitivity;
  accessReason?: string; // Reason for access
  
  // Compliance
  gdprRelevant: boolean;
  pdpaRelevant: boolean;
  consentVersion?: string; // Version of consent
  
  timestamp: Date;
}

// =============================================================================
// ENUM TYPES
// =============================================================================

export enum DoctorRole {
  ATTENDING = 'ATTENDING',
  VISITING = 'VISITING',
  CONSULTANT = 'CONSULTANT',
  SPECIALIST = 'SPECIALIST',
}

export enum DoctorCapacity {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  VISITING = 'VISITING',
  LOCUM = 'LOCUM',
  CONTRACT = 'CONTRACT',
}

export enum VerificationStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
}

export enum ConfidentialityLevel {
  STANDARD = 'STANDARD',
  HIGH = 'HIGH',
  RESTRICTED = 'RESTRICTED',
  CONFIDENTIAL = 'CONFIDENTIAL',
}

export enum AvailabilityType {
  REGULAR = 'REGULAR',
  EMERGENCY = 'EMERGENCY',
  WALK_IN = 'WALK_IN',
  TELEHEALTH = 'TELEHEALTH',
  ON_CALL = 'ON_CALL',
  CONSULTATION = 'CONSULTATION',
  FOLLOW_UP = 'FOLLOW_UP',
}

export enum AvailabilitySlotStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  BLOCKED = 'BLOCKED',
  MAINTENANCE = 'MAINTENANCE',
  FULL = 'FULL',
}

export enum ScheduleType {
  REGULAR = 'REGULAR',
  EMERGENCY = 'EMERGENCY',
  ON_CALL = 'ON_CALL',
  TRAINING = 'TRAINING',
  CONFERENCE = 'CONFERENCE',
  PERSONAL = 'PERSONAL',
}

export enum LeaveType {
  ANNUAL = 'ANNUAL',
  SICK = 'SICK',
  MATERNITY = 'MATERNITY',
  PATERNITY = 'PATERNITY',
  STUDY = 'STUDY',
  EMERGENCY = 'EMERGENCY',
  COMPASSIONATE = 'COMPASSIONATE',
  UNPAID = 'UNPAID',
}

export enum LeaveStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

export enum DoctorAppointmentStatus {
  SCHEDULED = 'SCHEDULED',
  CONFIRMED = 'CONFIRMED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW',
  RESCHEDULED = 'RESCHEDULED',
}

export enum EducationType {
  MEDICAL_SCHOOL = 'MEDICAL_SCHOOL',
  RESIDENCY = 'RESIDENCY',
  FELLOWSHIP = 'FELLOWSHIP',
  MASTERS = 'MASTERS',
  PHD = 'PHD',
  DIPLOMA = 'DIPLOMA',
  CERTIFICATION = 'CERTIFICATION',
  CONTINUING_EDUCATION = 'CONTINUING_EDUCATION',
}

export enum MembershipType {
  PROFESSIONAL = 'PROFESSIONAL',
  ACADEMIC = 'ACADEMIC',
  RESEARCH = 'RESEARCH',
  GOVERNMENT = 'GOVERNMENT',
  INTERNATIONAL = 'INTERNATIONAL',
  HONORARY = 'HONORARY',
}

export enum AwardRecognitionLevel {
  LOCAL = 'LOCAL',
  NATIONAL = 'NATIONAL',
  INTERNATIONAL = 'INTERNATIONAL',
  GLOBAL = 'GLOBAL',
}

export enum DataSensitivity {
  PUBLIC = 'PUBLIC',
  STANDARD = 'STANDARD',
  SENSITIVE = 'SENSITIVE',
  HIGHLY_SENSITIVE = 'HIGHLY_SENSITIVE',
  MEDICAL = 'MEDICAL',
  CONFIDENTIAL = 'CONFIDENTIAL',
  RESTRICTED = 'RESTRICTED',
}

// =============================================================================
// SUPPORTING INTERFACE TYPES
// =============================================================================

export interface CareerHighlight {
  title: string;
  organization: string;
  startDate: Date;
  endDate?: Date;
  description?: string;
  achievements?: string[];
}

export interface PreviousPosition {
  position: string;
  organization: string;
  duration: string;
  responsibilities?: string[];
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'clinic-only' | 'private';
  contactInfoVisible: 'public' | 'clinic-only' | 'private';
  scheduleVisible: 'public' | 'clinic-only' | 'private';
  availabilityVisible: boolean;
  reviewsVisible: boolean;
}

export interface CommunicationPreferences {
  emailNotifications: boolean;
  smsReminders: boolean;
  phoneCalls: boolean;
  emergencyOnly: boolean;
}

export interface ProfessionalDevelopment {
  type: string;
  title: string;
  provider: string;
  date: Date;
  duration: number; // in hours
  cmePoints: number;
  certificate?: string;
}

export interface OnCallSchedule {
  frequency: string;
  duration: string;
  coverage: string[];
  emergencyOnly: boolean;
}

export interface RecurrencePattern {
  frequency: 'daily' | 'weekly' | 'monthly';
  interval: number;
  daysOfWeek?: string[];
  dayOfMonth?: number;
  endDate?: Date;
}

export interface AgeRestrictions {
  minAge?: number;
  maxAge?: number;
  pediatricOnly: boolean;
  adultOnly: boolean;
  geriatricSpecialist: boolean;
}

export interface MedicalCondition {
  condition: string;
  severity?: 'mild' | 'moderate' | 'severe';
  requiresSpecialist: boolean;
  notes?: string;
}

export interface AppointmentType {
  type: string;
  duration: number; // in minutes
  description: string;
  isAvailable: boolean;
  advanceBookingRequired: boolean;
}

// Re-export existing enums from main schema
export enum DayOfWeek {
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY',
  SUNDAY = 'SUNDAY',
}

export enum ExpertiseLevel {
  BASIC = 'BASIC',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
  EXPERT = 'EXPERT',
  PIONEER = 'PIONEER',
}

export enum CertificationType {
  PROFESSIONAL = 'PROFESSIONAL',
  ACADEMIC = 'ACADEMIC',
  GOVERNMENT = 'GOVERNMENT',
  SPECIALTY = 'SPECIALTY',
  EQUIPMENT = 'EQUIPMENT',
  CONTINUING_EDUCATION = 'CONTINUING_EDUCATION',
}

export enum UrgencyLevel {
  ROUTINE = 'ROUTINE',
  URGENT = 'URGENT',
  EMERGENCY = 'EMERGENCY',
  SAME_DAY = 'SAME_DAY',
}

// =============================================================================
// API RESPONSE TYPES
// =============================================================================

export interface DoctorSearchParams {
  query?: string;
  specialties?: string[];
  languages?: string[];
  location?: string;
  availability?: Date;
  clinicId?: string;
  rating?: number;
  experience?: number;
  limit?: number;
  offset?: number;
  sortBy?: 'rating' | 'experience' | 'availability' | 'distance';
  sortOrder?: 'asc' | 'desc';
}

export interface DoctorSearchResult {
  doctors: Doctor[];
  total: number;
  facets: {
    specialties: FacetCount[];
    languages: FacetCount[];
    clinics: FacetCount[];
  };
}

export interface FacetCount {
  value: string;
  count: number;
}

export interface DoctorAnalytics {
  totalDoctors: number;
  activeDoctors: number;
  verifiedDoctors: number;
  specialtyDistribution: Record<string, number>;
  languageDistribution: Record<string, number>;
  averageRating: number;
  averageExperience: number;
  appointmentMetrics: {
    totalAppointments: number;
    completionRate: number;
    satisfactionRate: number;
  };
}

export interface DoctorAvailabilitySlot {
  doctorId: string;
  doctorName: string;
  clinicId: string;
  clinicName: string;
  date: Date;
  startTime: string;
  endTime: string;
  slotDuration: number;
  availableSlots: number;
  appointmentType: string;
  consultationFee?: number;
  isEmergency: boolean;
  isWalkIn: boolean;
}

export interface BulkDoctorUpdate {
  doctorIds: string[];
  updates: Partial<Doctor>;
  reason: string;
  auditRequired: boolean;
}

export interface DoctorImportResult {
  success: boolean;
  totalImported: number;
  totalErrors: number;
  errors: ImportError[];
  warnings: ImportWarning[];
}

export interface ImportError {
  row: number;
  field: string;
  message: string;
  value?: any;
}

export interface ImportWarning {
  row: number;
  field: string;
  message: string;
  value?: any;
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

export type CreateDoctorInput = Omit<Doctor, 'id' | 'createdAt' | 'updatedAt' | 'clinics' | 'specialtiesRel' | 'availabilities' | 'educationHistory' | 'certifications' | 'memberships' | 'awardsRel' | 'schedules' | 'leaves' | 'appointments' | 'searchIndex' | 'auditLogs'>;

export type UpdateDoctorInput = Partial<CreateDoctorInput>;

export type DoctorListItem = Pick<Doctor, 'id' | 'name' | 'specialties' | 'languages' | 'rating' | 'profileImage'>;

export type DoctorClinicListItem = Pick<DoctorClinic, 'id' | 'clinicId' | 'clinicName' | 'role' | 'isPrimary'> & {
  clinicName: string;
};

export type DoctorAvailabilitySummary = {
  doctorId: string;
  doctorName: string;
  clinicId?: string;
  clinicName?: string;
  nextAvailableDate?: Date;
  isAvailableNow: boolean;
  todaySlots: number;
  weekSlots: number;
};

// =============================================================================
// EXPORTS
// =============================================================================

export type {
  Doctor,
  DoctorClinic,
  DoctorAvailability,
  DoctorSchedule,
  DoctorLeave,
  DoctorAppointment,
  DoctorEducation,
  DoctorCertification,
  DoctorMembership,
  DoctorAward,
  DoctorSpecialty,
  DoctorSearchIndex,
  DoctorAuditLog,
  DoctorSearchParams,
  DoctorSearchResult,
  DoctorAnalytics,
  DoctorAvailabilitySlot,
  BulkDoctorUpdate,
  DoctorImportResult,
  CreateDoctorInput,
  UpdateDoctorInput,
  DoctorListItem,
  DoctorClinicListItem,
  DoctorAvailabilitySummary,
};

export {
  DoctorRole,
  DoctorCapacity,
  VerificationStatus,
  ConfidentialityLevel,
  AvailabilityType,
  AvailabilitySlotStatus,
  ScheduleType,
  LeaveType,
  LeaveStatus,
  DoctorAppointmentStatus,
  EducationType,
  MembershipType,
  AwardRecognitionLevel,
  DataSensitivity,
  DayOfWeek,
  ExpertiseLevel,
  CertificationType,
  UrgencyLevel,
};