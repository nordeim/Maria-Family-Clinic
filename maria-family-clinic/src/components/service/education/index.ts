// Service Education Components Export Index
// This file exports all service education and patient guidance components

export { ServiceEducationManager } from './ServiceEducationManager';
export { InteractivePreparationGuide } from './InteractivePreparationGuide';
export { FAQSystem } from './FAQSystem';
export { VideoEducationCenter } from './VideoEducationCenter';
export { MultilingualContentSystem } from './MultilingualContentSystem';
export { NotificationSystem } from './NotificationSystem';

// Type definitions for the education system
export interface EducationalProgress {
  totalSteps: number;
  completedSteps: number;
  currentStep: string;
  overallProgress: number;
  sectionProgress: {
    overview: number;
    preparation: number;
    procedure: number;
    recovery: number;
    aftercare: number;
  };
  timeSpent: number;
  lastAccessed: Date;
  isComplete: boolean;
}

export interface PreparationStep {
  id: string;
  title: string;
  description: string;
  category: 'timing' | 'diet' | 'medication' | 'lifestyle' | 'documents' | 'logistics';
  priority: 'critical' | 'important' | 'recommended';
  estimatedTime: number;
  duration: number;
  completed: boolean;
  required: boolean;
  dependencies?: string[];
  warnings?: string[];
  tips?: string[];
}

export interface FAQItem {
  id: string;
  category: 'general' | 'procedure' | 'preparation' | 'recovery' | 'cost' | 'insurance' | 'aftercare';
  question: string;
  answer: string;
  priority: 'common' | 'important' | 'detailed';
  medicalVerified: boolean;
  verifiedBy?: string;
  helpful: number;
  notHelpful: number;
  difficulty: 'basic' | 'intermediate' | 'advanced';
}

export interface VideoContent {
  id: string;
  title: string;
  description: string;
  type: 'procedure-animation' | 'virtual-walkthrough' | 'patient-testimonial' | 'expert-explanation' | 'step-by-step';
  duration: number;
  languages: ('en' | 'zh' | 'ms' | 'ta')[];
  quality: '720p' | '1080p' | '4k';
  medicalVerified: boolean;
  verifiedBy?: string;
  viewCount: number;
  averageRating: number;
}

export interface MultilingualContent {
  id: string;
  title: {
    en: string;
    zh: string;
    ms: string;
    ta: string;
  };
  description: {
    en: string;
    zh: string;
    ms: string;
    ta: string;
  };
  content: {
    en: string;
    zh: string;
    ms: string;
    ta: string;
  };
  medicalVerified: boolean;
  verifiedBy?: string;
  category: 'preparation' | 'procedure' | 'recovery' | 'aftercare' | 'general' | 'emergency';
  targetAudience: 'patients' | 'families' | 'caregivers' | 'all';
}

export interface NotificationTemplate {
  id: string;
  type: 'reminder' | 'instruction' | 'warning' | 'support' | 'appointment';
  title: {
    en: string;
    zh: string;
    ms: string;
    ta: string;
  };
  message: {
    en: string;
    zh: string;
    ms: string;
    ta: string;
  };
  priority: 'low' | 'medium' | 'high' | 'urgent';
  trigger: {
    type: 'time' | 'event' | 'manual';
    value: string | number;
  };
  medicalVerified: boolean;
  channels: ('email' | 'sms' | 'push' | 'in-app')[];
}