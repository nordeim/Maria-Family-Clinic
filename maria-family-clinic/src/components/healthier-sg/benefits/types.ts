"use client"

// Benefits System Types

export interface BenefitsEligibility {
  id: string
  userId: string
  tier: BenefitsTier
  calculationDate: Date
  benefitsAmount: number
  expirationDate?: Date
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface IncentiveTracking {
  id: string
  userId: string
  milestoneId: string
  milestoneName: string
  category: IncentiveCategory
  target: number
  current: number
  unit: string
  rewardAmount: number
  status: IncentiveStatus
  earnedDate?: Date
  claimedDate?: Date
  expiresAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface ScreeningSchedule {
  id: string
  userId: string
  screeningType: ScreeningType
  scheduledDate: Date
  clinicName: string
  clinicAddress: string
  doctorName: string
  status: ScreeningStatus
  reminderSent: boolean
  preparation?: string[]
  resultReceived: boolean
  resultDate?: Date
  resultSummary?: string
  cost: number
  paymentMethod?: PaymentMethod
  createdAt: Date
  updatedAt: Date
}

export interface PaymentTransaction {
  id: string
  userId: string
  type: TransactionType
  description: string
  amount: number
  paymentMethod: PaymentMethod
  status: TransactionStatus
  date: Date
  referenceNumber: string
  category: string
  clinicName?: string
  doctorName?: string
  receiptUrl?: string
  reimbursementFor?: string
  benefitType?: string
  incentiveDescription?: string
  benefitsId?: string
  screeningId?: string
  createdAt: Date
  updatedAt: Date
}

export interface BenefitsHistory {
  id: string
  userId: string
  benefitsId: string
  changeType: ChangeType
  previousValue?: any
  newValue?: any
  changeReason: string
  changedBy: string
  changeDate: Date
  metadata?: Record<string, any>
  createdAt: Date
}

// Enums

export enum BenefitsTier {
  BASIC = 'BASIC',
  ENHANCED = 'ENHANCED',
  PREMIUM = 'PREMIUM'
}

export enum IncentiveCategory {
  HEALTH_SCREENING = 'health_screening',
  ACTIVITY = 'activity',
  NUTRITION = 'nutrition',
  EDUCATION = 'education',
  COMMUNITY = 'community',
  CONSISTENCY = 'consistency',
  MILESTONE = 'milestone'
}

export enum IncentiveStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  EXPIRED = 'expired',
  CLAIMED = 'claimed'
}

export enum ScreeningType {
  GENERAL = 'general',
  DIABETES = 'diabetes',
  CARDIOVASCULAR = 'cardiovascular',
  CANCER = 'cancer',
  VISION = 'vision',
  HEARING = 'hearing',
  BONE = 'bone',
  MENTAL_HEALTH = 'mental_health'
}

export enum ScreeningStatus {
  SCHEDULED = 'scheduled',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  RESCHEDULED = 'rescheduled',
  NO_SHOW = 'no_show'
}

export enum PaymentMethod {
  MEDISAVE = 'medisave',
  CASH = 'cash',
  CHC = 'chc',
  NETS = 'nets',
  CREDIT_CARD = 'credit_card',
  BANK_TRANSFER = 'bank_transfer'
}

export enum TransactionType {
  BENEFIT = 'benefit',
  SCREENING = 'screening',
  CONSULTATION = 'consultation',
  MEDICATION = 'medication',
  REIMBURSEMENT = 'reimbursement',
  INCENTIVE = 'incentive'
}

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  CANCELLED = 'cancelled'
}

export enum ChangeType {
  CREATED = 'created',
  UPDATED = 'updated',
  DELETED = 'deleted',
  EXPIRED = 'expired',
  RENEWED = 'renewed',
  TRANSFERRED = 'transferred'
}

// Calculator Types

export interface CalculatorInputs {
  participationTier: 'BASIC' | 'ENHANCED' | 'PREMIUM'
  healthGoals: string[]
  screeningFrequency: number
  familySize: number
  chronicConditions: number
  activityLevel: 'LOW' | 'MODERATE' | 'HIGH'
  communityParticipation: boolean
  healthEducation: boolean
}

export interface BenefitsEstimate {
  tierBenefits: number
  healthGoalIncentives: number
  screeningRewards: number
  communityBonus: number
  educationBonus: number
  familySharingDiscount: number
  totalAnnualBenefits: number
  monthlyBenefit: number
  potentialSavings: number
  riskReduction: number
}

// Incentive Tracker Types

export interface MilestoneProgress {
  id: string
  title: string
  description: string
  category: IncentiveCategory
  target: number
  current: number
  unit: string
  reward: number
  deadline?: string
  status: IncentiveStatus
  icon: React.ReactNode
  color: string
}

export interface Achievement {
  id: string
  title: string
  description: string
  earnedDate: string
  reward: number
  category: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  icon: React.ReactNode
}

// Screening Reminder Types

export interface ScreeningAppointment {
  id: string
  type: ScreeningType
  title: string
  description: string
  scheduledDate: Date
  time: string
  clinicName: string
  clinicAddress: string
  clinicPhone: string
  doctorName: string
  status: ScreeningStatus
  preparation?: string[]
  reminderSent: boolean
  estimatedDuration: number
}

export interface ScreeningRecommendation {
  id: string
  type: string
  title: string
  description: string
  recommendedAge: string
  frequency: string
  urgency: 'low' | 'medium' | 'high' | 'urgent'
  benefits: string[]
  icon: React.ReactNode
  color: string
}

// Payment History Types

export interface PaymentSummary {
  totalSpent: number
  totalReimbursed: number
  totalBenefits: number
  totalIncentives: number
  pendingAmount: number
  monthlyAverage: number
}

// Benefits Card Types

export interface BenefitsOverview {
  currentTier: BenefitsTier
  tierBenefits: number
  totalEarned: number
  totalAvailable: number
  nextPayout: string
  progressToNextTier: number
  nextTier: BenefitsTier | null
  activeIncentives: number
  expiringBenefits: number
  recentTransactions: Array<{
    type: 'earned' | 'spent' | 'pending'
    amount: number
    description: string
    date: string
  }>
}

// Rewards Gallery Types

export interface RewardLevel {
  level: number
  title: string
  icon: React.ReactNode
  color: string
  requiredPoints: number
  unlocked: boolean
  rewards: string[]
}

// FAQ Types

export interface FAQItem {
  id: string
  category: 'general' | 'benefits' | 'payments' | 'screening' | 'technical' | 'account'
  question: string
  answer: string
  tags: string[]
  lastUpdated: string
  popular?: boolean
  helpTopics?: string[]
}

export interface ContactMethod {
  type: 'phone' | 'email' | 'chat' | 'web'
  name: string
  description: string
  icon: React.ReactNode
  availability: string
  action: string
  contact?: string
}

// API Response Types

export interface BenefitsSummaryResponse {
  eligibility: BenefitsEligibility
  incentives: IncentiveTracking[]
  recentTransactions: PaymentTransaction[]
  upcomingScreenings: ScreeningSchedule[]
  totalBenefits: number
  availableBalance: number
  activeIncentives: number
  completedScreenings: number
}

export interface BenefitsCalculationResponse {
  estimatedBenefits: BenefitsEstimate
  breakdown: {
    baseTier: number
    healthGoals: number
    screenings: number
    community: number
    education: number
    familyDiscount: number
  }
  recommendations: string[]
  savingsProjection: {
    annual: number
    fiveYear: number
    lifetime: number
  }
}

// Component Props Types

export interface BenefitsCardProps {
  compact?: boolean
  showActions?: boolean
  onViewDetails?: () => void
}

export interface IncentiveTrackerProps {
  userId?: string
  showCategories?: string[]
  compactView?: boolean
}

export interface BenefitsCalculatorProps {
  initialInputs?: Partial<CalculatorInputs>
  onCalculationChange?: (estimate: BenefitsEstimate) => void
  showComparison?: boolean
}

export interface ScreeningReminderProps {
  userId?: string
  showRecommendations?: boolean
  compactView?: boolean
}

export interface PaymentHistoryProps {
  userId?: string
  showFilters?: boolean
  compactView?: boolean
  dateRange?: {
    start: Date
    end: Date
  }
}

export interface RewardsGalleryProps {
  userId?: string
  showLeaderboard?: boolean
  showCategories?: string[]
  compactView?: boolean
}

export interface BenefitsFAQProps {
  showSearch?: boolean
  showCategories?: boolean
  showContact?: boolean
  compactView?: boolean
  initialCategory?: string
  searchTerm?: string
}

// Utility Types

export type HealthGoal = {
  id: string
  name: string
  category: string
  targetValue: number
  currentValue: number
  unit: string
  deadline?: Date
  isActive: boolean
}

export type HealthProfile = {
  id: string
  userId: string
  age: number
  gender: 'MALE' | 'FEMALE' | 'OTHER'
  height: number
  weight: number
  bmi: number
  bloodPressureSystolic: number
  bloodPressureDiastolic: number
  cholesterolTotal: number
  cholesterolLDL: number
  cholesterolHDL: number
  bloodGlucose: number
  smokingStatus: 'NEVER' | 'FORMER' | 'CURRENT'
  alcoholConsumption: 'NONE' | 'LIGHT' | 'MODERATE' | 'HEAVY'
  exerciseFrequency: number
  chronicConditions: string[]
  familyHistory: string[]
  lastUpdated: Date
}

export type ClinicInfo = {
  id: string
  name: string
  address: string
  phone: string
  email?: string
  services: string[]
  isHealthierSGParticipating: boolean
  tier: BenefitsTier
  distance?: number
  rating?: number
  availability?: {
    [key: string]: string[]
  }
}

// Error Types

export interface BenefitsError {
  code: string
  message: string
  details?: Record<string, any>
  timestamp: Date
}

// Configuration Types

export interface BenefitsConfiguration {
  tierBenefits: {
    BASIC: number
    ENHANCED: number
    PREMIUM: number
  }
  screeningRewards: {
    [key in ScreeningType]: number
  }
  incentiveMultipliers: {
    [key in IncentiveCategory]: number
  }
  familyDiscountRules: {
    maxDiscount: number
    perMember: number
  }
  paymentProcessing: {
    minAmount: number
    maxAmount: number
    processingDays: number
  }
}