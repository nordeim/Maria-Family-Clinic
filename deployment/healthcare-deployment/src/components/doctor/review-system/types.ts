// Enhanced Review System Types
export interface Doctor {
  id: string
  firstName: string
  lastName: string
  specialties: string[]
  rating?: {
    average: number
    count: number
    dimensions: RatingDimensions
    credibilityScore: number
  }
}

export interface RatingDimensions {
  overall: number
  bedsideManner: number
  waitTime: number
  communication: number
  treatmentEffectiveness: number
  facilityEnvironment: number
  painManagement: number
  followUpCare: number
}

export interface ReviewDimensions {
  overallRating: number
  bedsideManner: number
  waitTime: number
  communication: number
  treatmentEffectiveness: number
  facilityEnvironment: number
  painManagement: number
  followUpCare: number
}

export interface Review {
  id: string
  patientId?: string
  patientName: string
  patientInitial: string
  isAnonymous: boolean
  dimensions: ReviewDimensions
  overallRating: number
  comment: string
  date: Date
  service: string
  clinic: string
  appointmentId?: string
  isVerified: boolean
  verificationMethod: 'appointment' | 'verified_patient' | 'identity_verified' | 'manual'
  helpful: number
  notHelpful: number
  isFlagged: boolean
  flagReasons?: FlagReason[]
  response?: DoctorResponse
  attachments?: ReviewAttachment[]
  status: 'active' | 'pending_moderation' | 'rejected' | 'flagged'
  moderationNotes?: string
  editHistory?: ReviewEdit[]
  communityVotes: CommunityVote[]
  credibilityScore: number
  tags?: string[]
  outcome?: TreatmentOutcome
  privateFeedback?: PrivateFeedback
}

export interface DoctorResponse {
  id: string
  text: string
  date: Date
  doctorId: string
  isPublic: boolean
  status: 'active' | 'pending' | 'edited'
  editHistory?: ResponseEdit[]
}

export interface ReviewAttachment {
  id: string
  type: 'photo' | 'document' | 'prescription' | 'report'
  fileName: string
  fileUrl: string
  fileSize: number
  mimeType: string
  isPHIRedacted: boolean
  uploadDate: Date
  moderationStatus: 'approved' | 'pending' | 'rejected'
  redactedUrl?: string
}

export interface FlagReason {
  type: 'spam' | 'inappropriate' | 'fake' | 'violation' | 'harassment' | 'medical_advice' | 'privacy'
  reason: string
  reportedBy: string
  reportedDate: Date
  severity: 'low' | 'medium' | 'high' | 'critical'
}

export interface ReviewEdit {
  id: string
  previousComment: string
  editedBy: string
  editDate: Date
  reason: string
  moderationStatus: 'pending' | 'approved' | 'rejected'
}

export interface ResponseEdit {
  id: string
  previousText: string
  editedBy: string
  editDate: Date
  reason: string
}

export interface CommunityVote {
  userId: string
  type: 'helpful' | 'not_helpful' | 'spam_report' | 'inappropriate_report'
  date: Date
  isAnonymous: boolean
}

export interface TreatmentOutcome {
  effectiveness: 'very_effective' | 'effective' | 'somewhat_effective' | 'not_effective' | 'worse'
  improvementTimeframe: string
  sideEffects: string[]
  wouldRecommend: boolean
  wouldReturn: boolean
}

export interface PrivateFeedback {
  concernType: 'billing' | 'staff' | 'communication' | 'scheduling' | 'other'
  description: string
  isConfidential: boolean
  followUpRequired: boolean
  assignedTo?: string
  resolutionStatus?: 'open' | 'investigating' | 'resolved' | 'closed'
}

export interface ReviewAnalytics {
  doctorId: string
  totalReviews: number
  verifiedReviews: number
  averageRatings: RatingDimensions
  ratingTrends: RatingTrend[]
  sentimentAnalysis: SentimentAnalysis
  commonThemes: ThemeAnalysis[]
  recentChanges: ReviewChange[]
  comparisonData?: DoctorComparison
  credibilityMetrics: CredibilityMetrics
}

export interface RatingTrend {
  period: string
  date: Date
  overallRating: number
  dimensions: RatingDimensions
  reviewCount: number
  confidence: number
}

export interface SentimentAnalysis {
  positive: number
  neutral: number
  negative: number
  keywords: { word: string; frequency: number; sentiment: 'positive' | 'negative' | 'neutral' }[]
}

export interface ThemeAnalysis {
  theme: string
  frequency: number
  sentiment: 'positive' | 'negative' | 'neutral'
  examples: string[]
  impact: number
}

export interface ReviewChange {
  type: 'new_review' | 'flag_removed' | 'review_edited' | 'response_added'
  date: Date
  description: string
  impact: 'positive' | 'negative' | 'neutral'
}

export interface DoctorComparison {
  specialtyAverage: RatingDimensions
  clinicAverage: RatingDimensions
  nationalAverage: RatingDimensions
  rankPercentile: number
}

export interface CredibilityMetrics {
  authenticity: number
  recency: number
  verification: number
  consistency: number
  communityValidation: number
  overall: number
}

export interface ModerationQueue {
  id: string
  type: 'new_review' | 'flagged_review' | 'edit_request' | 'doctor_response' | 'photo_upload'
  reviewId?: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assignedTo?: string
  status: 'pending' | 'in_review' | 'approved' | 'rejected' | 'needs_revision'
  createdDate: Date
  deadline?: Date
  reviewerNotes?: string
  action?: ModerationAction
}

export interface ModerationAction {
  type: 'approve' | 'reject' | 'edit' | 'flag' | 'contact_user' | 'escalate'
  reason: string
  notes: string
  performedBy: string
  performedDate: Date
  userNotification?: boolean
}

export interface ReviewSubmission {
  doctorId: string
  appointmentId?: string
  dimensions: ReviewDimensions
  comment: string
  isAnonymous: boolean
  allowPublicDisplay: boolean
  attachments?: File[]
  outcome?: TreatmentOutcome
  privateFeedback?: PrivateFeedback
  agreeToTerms: boolean
  consentGiven: boolean
}

export interface ReviewModerationConfig {
  autoModerationEnabled: boolean
  spamDetectionSensitivity: 'low' | 'medium' | 'high'
  requireIdentityVerification: boolean
  allowAnonymousReviews: boolean
  enablePhotoUploads: boolean
  requireAppointmentVerification: boolean
  moderationQueueRetentionDays: number
  reviewEditTimeLimitDays: number
  doctorResponseTimeLimitDays: number
}