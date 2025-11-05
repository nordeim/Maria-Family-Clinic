// Health Profile System Type Definitions
// Comprehensive TypeScript interfaces for Healthier SG health profile system

// ====================
// USER & PROFILE TYPES
// ====================

export interface UserHealthProfile {
  id: string;
  userId: string;
  personalInfo: PersonalInfo;
  medicalHistory: MedicalHistory;
  currentHealth: CurrentHealth;
  lifestyleAssessment: LifestyleAssessment;
  familyHistory: FamilyHistory;
  medications: Medication[];
  allergies: Allergy[];
  screeningHistory: ScreeningHistory;
  createdAt: string;
  updatedAt: string;
  lastAssessmentDate?: string;
  isComplete: boolean;
  completionPercentage: number;
}

export interface PersonalInfo {
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  nationality: string;
  occupation: string;
  maritalStatus: 'single' | 'married' | 'divorced' | 'widowed' | 'separated';
  emergencyContact: EmergencyContact;
  preferredLanguage: 'english' | 'chinese' | 'malay' | 'tamil';
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

// ====================
// MEDICAL HISTORY TYPES
// ====================

export interface MedicalHistory {
  chronicConditions: ChronicCondition[];
  previousSurgeries: Surgery[];
  hospitalizations: Hospitalization[];
  mentalHealthConditions: MentalHealthCondition[];
  immunizations: Immunization[];
  notes: string;
}

export interface ChronicCondition {
  id: string;
  name: string;
  diagnosedDate: string;
  severity: 'mild' | 'moderate' | 'severe';
  isActive: boolean;
  medication?: string;
  notes?: string;
  icd10Code?: string;
}

export interface Surgery {
  id: string;
  procedure: string;
  date: string;
  hospital: string;
  surgeon: string;
  complications?: string;
  notes?: string;
}

export interface Hospitalization {
  id: string;
  reason: string;
  startDate: string;
  endDate: string;
  hospital: string;
  outcome: string;
  notes?: string;
}

export interface MentalHealthCondition {
  id: string;
  condition: string;
  diagnosedDate: string;
  severity: 'mild' | 'moderate' | 'severe';
  isActive: boolean;
  treatment?: string;
  therapist?: string;
  notes?: string;
}

export interface Immunization {
  id: string;
  vaccine: string;
  date: string;
  nextDue?: string;
  provider: string;
  notes?: string;
}

// ====================
// CURRENT HEALTH TYPES
// ====================

export interface CurrentHealth {
  vitalSigns: VitalSigns;
  measurements: Measurements;
  generalHealth: GeneralHealth;
  painAssessment: PainAssessment;
  functionalStatus: FunctionalStatus;
}

export interface VitalSigns {
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  heartRate?: number;
  temperature?: number;
  respiratoryRate?: number;
  oxygenSaturation?: number;
  lastUpdated: string;
  recordedBy?: string;
}

export interface Measurements {
  height?: number; // in cm
  weight?: number; // in kg
  waistCircumference?: number; // in cm
  bmi?: number;
  bodyFatPercentage?: number;
  lastUpdated: string;
}

export interface GeneralHealth {
  selfRating: 1 | 2 | 3 | 4 | 5; // 1=Poor, 5=Excellent
  energyLevel: 1 | 2 | 3 | 4 | 5;
  sleepQuality: 1 | 2 | 3 | 4 | 5;
  appetite: 'poor' | 'fair' | 'good' | 'excellent';
  bowelRegularity: 'constipated' | 'irregular' | 'regular' | 'frequent';
  urination: 'normal' | 'frequent' | 'painful' | 'incontinent';
}

export interface PainAssessment {
  hasPain: boolean;
  location?: string;
  intensity: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
  type: 'aching' | 'sharp' | 'burning' | 'throbbing' | 'stabbing' | 'dull';
  triggers?: string[];
  reliefFactors?: string[];
  impact: 'none' | 'mild' | 'moderate' | 'severe' | 'disabling';
}

export interface FunctionalStatus {
  mobility: 'independent' | 'needs_assistance' | 'dependent';
  activitiesOfDailyLiving: 'independent' | 'needs_assistance' | 'dependent';
  cognitiveFunction: 'normal' | 'mild_impairment' | 'moderate_impairment' | 'severe_impairment';
  communication: 'normal' | 'mild_difficulty' | 'moderate_difficulty' | 'severe_difficulty';
  balance: 'good' | 'fair' | 'poor' | 'requires_assistance';
}

// ====================
// LIFESTYLE ASSESSMENT TYPES
// ====================

export interface LifestyleAssessment {
  physicalActivity: PhysicalActivity;
  nutrition: NutritionAssessment;
  sleep: SleepAssessment;
  substanceUse: SubstanceUse;
  stressManagement: StressManagement;
  socialSupport: SocialSupport;
}

export interface PhysicalActivity {
  frequency: 'never' | 'rarely' | 'sometimes' | 'often' | 'daily';
  duration: string; // e.g., "30 minutes"
  intensity: 'light' | 'moderate' | 'vigorous';
  types: string[]; // e.g., ["walking", "swimming", "cycling"]
  barriers: string[];
  motivation: 1 | 2 | 3 | 4 | 5;
}

export interface NutritionAssessment {
  mealsPerDay: number;
  skippedMeals: string[];
  dietType: 'regular' | 'vegetarian' | 'vegan' | 'halal' | 'kosher' | 'other';
  restrictions: string[];
  alcoholConsumption: 'none' | 'occasional' | 'moderate' | 'heavy';
  caffeineIntake: string; // cups per day
  waterIntake: string; // glasses per day
  nutritionKnowledge: 1 | 2 | 3 | 4 | 5;
}

export interface SleepAssessment {
  hoursPerNight: number;
  sleepQuality: 1 | 2 | 3 | 4 | 5;
  bedtime: string;
  wakeTime: string;
  sleepDisorders: string[];
  sleepEnvironment: 'excellent' | 'good' | 'fair' | 'poor';
  sleepAids: string[];
  napping: 'never' | 'sometimes' | 'often';
}

export interface SubstanceUse {
  smoking: {
    current: boolean;
    former: boolean;
    never: boolean;
    packsPerDay?: number;
    yearsSmoked?: number;
    quitDate?: string;
  };
  alcohol: {
    never: 'rarely' | 'sometimes' | 'often' | 'daily';
    drinksPerWeek?: number;
    bingeDrinking: boolean;
    concerns: boolean;
  };
  recreationalDrugs: {
    never: 'sometimes' | 'often';
    substances?: string[];
    concerns: boolean;
  };
}

export interface StressManagement {
  stressLevel: 1 | 2 | 3 | 4 | 5;
  stressFactors: string[];
  copingStrategies: string[];
  relaxationTechniques: string[];
  counseling: boolean;
  supportGroups: boolean;
}

export interface SocialSupport {
  livingArrangement: 'alone' | 'with_family' | 'with_friends' | 'assisted_living';
  relationshipStatus: 'single' | 'married' | 'divorced' | 'widowed';
  socialConnections: 'excellent' | 'good' | 'fair' | 'poor' | 'isolated';
  communityInvolvement: 'very_active' | 'active' | 'moderate' | 'minimal' | 'none';
  caregiverSupport: boolean;
  caregiverName?: string;
}

// ====================
// FAMILY HISTORY TYPES
// ====================

export interface FamilyHistory {
  conditions: FamilyCondition[];
  geneticTesting?: GeneticTesting;
  riskFactors: RiskFactor[];
}

export interface FamilyCondition {
  id: string;
  condition: string;
  relationship: 'father' | 'mother' | 'brother' | 'sister' | 'grandfather' | 'grandmother' | 'aunt' | 'uncle' | 'cousin';
  diagnosedAge?: number;
  isDeceased: boolean;
  causeOfDeath?: string;
  notes?: string;
}

export interface GeneticTesting {
  hasTesting: boolean;
  results?: string;
  recommendations?: string;
  date?: string;
  provider?: string;
}

export interface RiskFactor {
  type: 'genetic' | 'environmental' | 'behavioral' | 'social';
  description: string;
  level: 'low' | 'moderate' | 'high';
  recommendations: string[];
}

// ====================
// MEDICATION & ALLERGY TYPES
// ====================

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  prescribedBy: string;
  indication: string;
  sideEffects?: string[];
  isActive: boolean;
  adherence: 'excellent' | 'good' | 'fair' | 'poor';
  notes?: string;
  rxNormCode?: string;
}

export interface Allergy {
  id: string;
  allergen: string;
  reaction: string;
  severity: 'mild' | 'moderate' | 'severe' | 'life_threatening';
  onsetDate?: string;
  notes?: string;
  allergyCode?: string;
}

// ====================
// SCREENING HISTORY TYPES
// ====================

export interface ScreeningHistory {
  screenings: HealthScreening[];
  recommendedScreenings: RecommendedScreening[];
  lastCheckup: {
    date: string;
    provider: string;
    findings: string;
    recommendations: string[];
  };
}

export interface HealthScreening {
  id: string;
  type: ScreeningType;
  date: string;
  result: string;
  provider: string;
  facility: string;
  nextDue?: string;
  abnormalFindings?: boolean;
  followUpRequired: boolean;
  followUpDate?: string;
  notes?: string;
}

export type ScreeningType = 
  | 'blood_pressure'
  | 'cholesterol'
  | 'diabetes'
  | 'mammogram'
  | 'pap_smear'
  | 'colonoscopy'
  | 'bone_density'
  | 'prostate_screening'
  | 'skin_cancer'
  | 'eye_exam'
  | 'dental_exam'
  | 'hearing_test'
  | 'other';

export interface RecommendedScreening {
  type: ScreeningType;
  description: string;
  frequency: string;
  ageStart: number;
  ageEnd?: number;
  riskFactors?: string[];
  nextDue: string;
  isOverdue: boolean;
}

// ====================
// HEALTH GOALS TYPES
// ====================

export interface HealthGoal {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: HealthGoalCategory;
  type: 'outcome' | 'process' | 'behavioral';
  priority: PriorityLevel;
  status: GoalStatus;
  progress: number; // 0-100
  smartCriteria: SmartCriteria;
  targetValue?: number;
  currentValue?: number;
  unit?: string;
  startDate: string;
  targetDate: string;
  milestones: Milestone[];
  createdAt: string;
  updatedAt: string;
  tags: string[];
  notes?: string;
  reminders: GoalReminders;
  parentGoalId?: string;
  subGoals: string[];
  achievements: Achievement[];
  relatedMetrics: string[];
  isArchived: boolean;
  archivedAt?: string;
}

export type HealthGoalCategory = 
  | 'weight'
  | 'fitness'
  | 'nutrition'
  | 'chronic_disease'
  | 'mental_health'
  | 'preventive_care'
  | 'medication_adherence'
  | 'lifestyle'
  | 'screening'
  | 'general_wellness';

export type PriorityLevel = 'low' | 'medium' | 'high' | 'urgent';

export type GoalStatus = 'active' | 'paused' | 'completed' | 'cancelled' | 'on_hold';

export interface SmartCriteria {
  specific: string;
  measurable: string;
  achievable: string;
  relevant: string;
  timebound: string;
}

export interface Milestone {
  id: string;
  title: string;
  description?: string;
  targetDate: string;
  completed: boolean;
  completedAt?: string;
  order: number;
  isRequired: boolean;
  reward?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string;
  points: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface GoalReminders {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'custom';
  time?: string;
  days?: number[]; // 0-6 for custom frequency
  method: 'push' | 'email' | 'sms';
  message?: string;
}

// ====================
// HEALTH METRICS TYPES
// ====================

export interface HealthMetric {
  id: string;
  userId: string;
  metricType: MetricType;
  value: number;
  unit: string;
  recordedAt: string;
  recordedBy: 'user' | 'device' | 'provider';
  deviceId?: string;
  isAbnormal: boolean;
  normalRange: {
    min?: number;
    max?: number;
    optimal?: number;
  };
  trend: TrendDirection;
  notes?: string;
  tags: string[];
  source: string;
}

export type MetricType = 
  | 'weight'
  | 'blood_pressure_systolic'
  | 'blood_pressure_diastolic'
  | 'heart_rate'
  | 'body_temperature'
  | 'blood_glucose'
  | 'cholesterol_total'
  | 'cholesterol_ldl'
  | 'cholesterol_hdl'
  | 'triglycerides'
  | 'hemoglobin_a1c'
  | 'steps'
  | 'sleep_hours'
  | 'exercise_minutes'
  | 'water_intake'
  | 'medication_adherence'
  | 'pain_level'
  | 'mood_score'
  | 'stress_level';

export type TrendDirection = 'up' | 'down' | 'stable' | 'variable';

// ====================
// HEALTH RECOMMENDATIONS TYPES
// ====================

export interface HealthRecommendation {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: RecommendationCategory;
  priority: PriorityLevel;
  estimatedImpact: 'low' | 'medium' | 'high';
  timeframe: string;
  status: RecommendationStatus;
  generatedAt: string;
  actionableSteps: ActionStep[];
  resources: RecommendationResource[];
  healthMetrics: RelatedHealthMetric[];
  tags: string[];
  isPersonalized: boolean;
  evidenceLevel: 'strong' | 'moderate' | 'limited';
  source: string;
  expirationDate?: string;
  completedAt?: string;
  dismissalReason?: string;
  feedback?: RecommendationFeedback;
}

export type RecommendationCategory = 
  | 'fitness'
  | 'nutrition'
  | 'wellness'
  | 'medical'
  | 'prevention'
  | 'mental_health'
  | 'lifestyle'
  | 'medication'
  | 'screening';

export type RecommendationStatus = 'active' | 'completed' | 'dismissed' | 'expired';

export interface ActionStep {
  id: string;
  title: string;
  description: string;
  priority: PriorityLevel;
  estimatedTime: string;
  isCompleted: boolean;
  completedAt?: string;
  order: number;
  dependencies?: string[];
  resources?: string[];
}

export interface RecommendationResource {
  id: string;
  type: 'article' | 'video' | 'tool' | 'appointment' | 'program' | 'app';
  title: string;
  description: string;
  url: string;
  isExternal: boolean;
  rating?: number;
  duration?: string;
  cost?: 'free' | 'paid' | 'subscription';
}

export interface RelatedHealthMetric {
  metricName: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  trend: TrendDirection;
  status: 'normal' | 'borderline' | 'abnormal';
  relevanceScore: number; // 0-100
}

export interface RecommendationFeedback {
  helpful: boolean;
  implemented: boolean;
  rating: 1 | 2 | 3 | 4 | 5;
  comments?: string;
  submittedAt: string;
}

// ====================
// HEALTH ALERTS TYPES
// ====================

export interface HealthAlert {
  id: string;
  userId: string;
  type: AlertType;
  category: AlertCategory;
  title: string;
  message: string;
  severity: AlertSeverity;
  status: AlertStatus;
  source: AlertSource;
  triggeredAt: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  expiresAt?: string;
  actionItems: AlertActionItem[];
  relatedMetrics: AlertRelatedMetric[];
  recommendations: string[];
  contactInfo?: AlertContactInfo;
  tags: string[];
  isEscalated: boolean;
  escalationLevel: number;
  metadata: AlertMetadata;
}

export type AlertType = 'critical' | 'warning' | 'info' | 'success';

export type AlertCategory = 
  | 'vitals'
  | 'medication'
  | 'appointment'
  | 'screening'
  | 'trends'
  | 'goals'
  | 'emergency'
  | 'system';

export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';

export type AlertStatus = 'active' | 'acknowledged' | 'resolved' | 'dismissed';

export type AlertSource = 'manual' | 'automatic' | 'device' | 'appointment' | 'screening' | 'user_input';

export interface AlertActionItem {
  id: string;
  title: string;
  description: string;
  priority: PriorityLevel;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  completedAt?: string;
  actionUrl?: string;
  assignedTo?: string;
  estimatedTime?: string;
}

export interface AlertRelatedMetric {
  metricName: string;
  currentValue: number;
  targetValue?: number;
  unit: string;
  trend: TrendDirection;
  status: 'normal' | 'borderline' | 'abnormal';
  threshold?: number;
  historicalValues: number[];
}

export interface AlertContactInfo {
  type: 'doctor' | 'clinic' | 'emergency' | 'pharmacy' | 'support';
  name: string;
  phone: string;
  email?: string;
  address?: string;
  isAvailable: boolean;
  hours?: string;
  website?: string;
}

export interface AlertMetadata {
  ruleId?: string;
  condition: string;
  algorithm: string;
  confidence: number; // 0-100
  version: string;
  testMode: boolean;
  relatedAlerts: string[];
}

// ====================
// HEALTH ASSESSMENT TYPES
// ====================

export interface HealthAssessment {
  id: string;
  userId: string;
  assessmentType: AssessmentType;
  status: 'in_progress' | 'completed' | 'abandoned';
  startedAt: string;
  completedAt?: string;
  responses: AssessmentResponse[];
  score?: number;
  riskLevel?: RiskLevel;
  recommendations: string[];
  followUpRequired: boolean;
  provider?: string;
  notes?: string;
}

export type AssessmentType = 
  | 'initial'
  | 'annual'
  | 'chronic_disease'
  | 'medication_review'
  | 'lifestyle'
  | 'mental_health'
  | 'functional_status'
  | 'fall_risk'
  | 'nutrition'
  | 'sleep';

export interface AssessmentResponse {
  questionId: string;
  question: string;
  category: string;
  answer: any;
  score?: number;
  isRequired: boolean;
  dependencies?: string[];
}

export type RiskLevel = 'low' | 'moderate' | 'high' | 'very_high';

// ====================
// DEVICE INTEGRATION TYPES
// ====================

export interface DeviceIntegration {
  id: string;
  userId: string;
  deviceId: string;
  deviceType: DeviceType;
  manufacturer: string;
  model: string;
  isActive: boolean;
  lastSyncAt: string;
  permissions: DevicePermission[];
  dataTypes: string[];
  syncFrequency: string;
  connectionStatus: 'connected' | 'disconnected' | 'error' | 'syncing';
  batteryLevel?: number;
  firmwareVersion?: string;
  setupDate: string;
  setupInstructions: string[];
}

export type DeviceType = 
  | 'fitness_tracker'
  | 'smartwatch'
  | 'blood_pressure_monitor'
  | 'glucose_meter'
  | 'scale'
  | 'thermometer'
  | 'pulse_oximeter'
  | 'ecg_monitor'
  | 'sleep_tracker'
  | 'activity_monitor'
  | 'smart_scale'
  | 'other';

export interface DevicePermission {
  type: 'read' | 'write' | 'notify';
  granted: boolean;
  grantedAt?: string;
  revokedAt?: string;
  scope: string;
}

// ====================
// API & FORM TYPES
// ====================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ApiMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
  requestId?: string;
}

export interface ApiMeta {
  timestamp: string;
  version: string;
  pagination?: PaginationMeta;
  filters?: FilterMeta[];
  sorting?: SortingMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface FilterMeta {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'like' | 'between';
  value: any;
  label?: string;
}

export interface SortingMeta {
  field: string;
  direction: 'asc' | 'desc';
  priority?: number;
}

// ====================
// UI COMPONENT PROPS TYPES
// ====================

export interface ComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface FormFieldProps extends ComponentProps {
  name: string;
  label?: string;
  description?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
  category?: string;
  metadata?: any;
}

export interface ProgressData {
  current: number;
  target: number;
  unit: string;
  percentage: number;
  trend: TrendDirection;
  lastUpdated: string;
}

// ====================
// ENUM TYPES
// ====================

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
  PREFER_NOT_TO_SAY = 'prefer_not_to_say'
}

export enum MaritalStatus {
  SINGLE = 'single',
  MARRIED = 'married',
  DIVORCED = 'divorced',
  WIDOWED = 'widowed',
  SEPARATED = 'separated'
}

export enum HealthGoalCategory {
  WEIGHT = 'weight',
  FITNESS = 'fitness',
  NUTRITION = 'nutrition',
  CHRONIC_DISEASE = 'chronic_disease',
  MENTAL_HEALTH = 'mental_health',
  PREVENTIVE_CARE = 'preventive_care',
  MEDICATION_ADHERENCE = 'medication_adherence',
  LIFESTYLE = 'lifestyle',
  SCREENING = 'screening',
  GENERAL_WELLNESS = 'general_wellness'
}

export enum GoalStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  ON_HOLD = 'on_hold'
}

export enum AlertSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum RecommendationStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  DISMISSED = 'dismissed',
  EXPIRED = 'expired'
}

// ====================
// UTILITY TYPES
// ====================

export type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type CreateInput<T> = Omit<T, 'id' | 'createdAt' | 'updatedAt'>;

export type UpdateInput<T> = Partial<CreateInput<T>>;

export type FilterInput<T> = {
  [K in keyof T]?: T[K] | { [operator: string]: any };
};

export type SortInput<T> = {
  [K in keyof T]?: 'asc' | 'desc';
};

// ====================
// CONTEXT TYPES
// ====================

export interface HealthProfileContextType {
  userId: string;
  profile: UserHealthProfile | null;
  loading: boolean;
  error: string | null;
  updateProfile: (updates: Partial<UserHealthProfile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
  isComplete: boolean;
  completionPercentage: number;
}

export interface HealthGoalsContextType {
  goals: HealthGoal[];
  loading: boolean;
  error: string | null;
  createGoal: (goal: CreateInput<HealthGoal>) => Promise<HealthGoal>;
  updateGoal: (id: string, updates: UpdateInput<HealthGoal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  toggleMilestone: (goalId: string, milestoneId: string, completed: boolean) => Promise<void>;
}

export interface HealthMetricsContextType {
  metrics: HealthMetric[];
  loading: boolean;
  error: string | null;
  addMetric: (metric: CreateInput<HealthMetric>) => Promise<HealthMetric>;
  getMetricsByType: (type: MetricType, dateRange?: { start: string; end: string }) => HealthMetric[];
  getTrendingMetrics: () => HealthMetric[];
}

export interface HealthAlertsContextType {
  alerts: HealthAlert[];
  loading: boolean;
  error: string | null;
  acknowledgeAlert: (id: string) => Promise<void>;
  resolveAlert: (id: string) => Promise<void>;
  dismissAlert: (id: string, reason: string) => Promise<void>;
  getCriticalAlerts: () => HealthAlert[];
}

export interface HealthRecommendationsContextType {
  recommendations: HealthRecommendation[];
  loading: boolean;
  error: string | null;
  generateRecommendations: () => Promise<HealthRecommendation[]>;
  completeRecommendation: (id: string) => Promise<void>;
  dismissRecommendation: (id: string, reason: string) => Promise<void>;
  provideFeedback: (id: string, feedback: RecommendationFeedback) => Promise<void>;
}