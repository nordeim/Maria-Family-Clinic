'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ChevronLeft, 
  ChevronRight, 
  Save, 
  FileText, 
  User, 
  Heart, 
  Activity, 
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Phone,
  Home,
  UserCheck,
  Shield
} from 'lucide-react';
import { HealthProfile } from './HealthProfileDashboard';

export interface HealthAssessment {
  id: string;
  profileId: string;
  type: 'INITIAL' | 'PERIODIC' | 'SPECIALIZED';
  sections: AssessmentSection[];
  status: 'IN_PROGRESS' | 'COMPLETED' | 'REVIEWED';
  startedAt: Date;
  completedAt?: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  notes?: string;
}

export interface AssessmentSection {
  id: string;
  title: string;
  description: string;
  questions: AssessmentQuestion[];
  completed: boolean;
  required: boolean;
}

export interface AssessmentQuestion {
  id: string;
  type: 'TEXT' | 'NUMBER' | 'DATE' | 'SELECT' | 'MULTISELECT' | 'BOOLEAN' | 'TEXTAREA';
  question: string;
  description?: string;
  required: boolean;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
  answer?: any;
}

interface HealthAssessmentFormProps {
  healthProfile: HealthProfile;
  assessmentType?: 'INITIAL' | 'PERIODIC' | 'SPECIALIZED';
  onComplete: (assessment: HealthAssessment) => void;
  onSave: (assessment: HealthAssessment) => void;
  onCancel: () => void;
  initialAssessment?: HealthAssessment;
  className?: string;
}

const ASSESSMENT_SECTIONS = [
  {
    id: 'personal-info',
    title: 'Personal Information',
    description: 'Basic demographic and contact information',
    required: true,
    icon: User,
    questions: [
      {
        id: 'preferred-language',
        type: 'SELECT' as const,
        question: 'Preferred Language for Health Communications',
        description: 'Select your preferred language for receiving health information',
        required: true,
        options: ['English', '中文', 'Melayu', 'தமிழ்']
      },
      {
        id: 'emergency-contact-name',
        type: 'TEXT' as const,
        question: 'Emergency Contact Name',
        description: 'Full name of your emergency contact',
        required: true
      },
      {
        id: 'emergency-contact-relationship',
        type: 'TEXT' as const,
        question: 'Relationship to Emergency Contact',
        description: 'Your relationship to the emergency contact',
        required: true,
        options: ['Spouse', 'Parent', 'Child', 'Sibling', 'Friend', 'Other']
      },
      {
        id: 'emergency-contact-phone',
        type: 'TEXT' as const,
        question: 'Emergency Contact Phone',
        description: 'Phone number of your emergency contact',
        required: true
      }
    ]
  },
  {
    id: 'medical-history',
    title: 'Medical History',
    description: 'Your past and current medical conditions',
    required: true,
    icon: FileText,
    questions: [
      {
        id: 'chronic-conditions',
        type: 'MULTISELECT' as const,
        question: 'Chronic Medical Conditions',
        description: 'Select any chronic conditions you have been diagnosed with',
        required: true,
        options: [
          'Diabetes (Type 1)', 
          'Diabetes (Type 2)', 
          'Hypertension (High Blood Pressure)',
          'Heart Disease',
          'Stroke',
          'Kidney Disease',
          'Liver Disease',
          'Asthma',
          'COPD',
          'Arthritis',
          'Osteoporosis',
          'Cancer',
          'Mental Health Conditions',
          'Thyroid Disorders',
          'High Cholesterol',
          'Sleep Apnea',
          'Other'
        ]
      },
      {
        id: 'other-conditions',
        type: 'TEXTAREA' as const,
        question: 'Other Medical Conditions',
        description: 'Please describe any other medical conditions not listed above',
        required: false
      },
      {
        id: 'current-medications',
        type: 'TEXTAREA' as const,
        question: 'Current Medications',
        description: 'List all medications you are currently taking, including dosages',
        required: true
      },
      {
        id: 'medication-allergies',
        type: 'TEXTAREA' as const,
        question: 'Medication Allergies',
        description: 'List any medications you are allergic to and type of reaction',
        required: true
      },
      {
        id: 'previous-surgeries',
        type: 'TEXTAREA' as const,
        question: 'Previous Surgeries',
        description: 'List any surgeries you have had and approximate dates',
        required: false
      },
      {
        id: 'hospitalizations',
        type: 'TEXTAREA' as const,
        question: 'Previous Hospitalizations',
        description: 'List any significant hospitalizations and reasons',
        required: false
      }
    ]
  },
  {
    id: 'family-history',
    title: 'Family Medical History',
    description: 'Medical conditions in your immediate family',
    required: true,
    icon: UserCheck,
    questions: [
      {
        id: 'family-heart-disease',
        type: 'MULTISELECT' as const,
        question: 'Family History of Heart Disease',
        description: 'Select family members who have had heart disease',
        required: true,
        options: ['Mother', 'Father', 'Siblings', 'Grandparents', 'Aunts/Uncles']
      },
      {
        id: 'family-diabetes',
        type: 'MULTISELECT' as const,
        question: 'Family History of Diabetes',
        description: 'Select family members who have had diabetes',
        required: true,
        options: ['Mother', 'Father', 'Siblings', 'Grandparents', 'Aunts/Uncles']
      },
      {
        id: 'family-cancer',
        type: 'TEXTAREA' as const,
        question: 'Family History of Cancer',
        description: 'Describe any family history of cancer (type and affected family members)',
        required: true
      },
      {
        id: 'family-other-conditions',
        type: 'TEXTAREA' as const,
        question: 'Other Family Medical History',
        description: 'Any other significant family medical history',
        required: false
      }
    ]
  },
  {
    id: 'current-health',
    title: 'Current Health Status',
    description: 'Your current health measurements and symptoms',
    required: true,
    icon: Heart,
    questions: [
      {
        id: 'current-height',
        type: 'NUMBER' as const,
        question: 'Current Height (cm)',
        description: 'Your current height in centimeters',
        required: true,
        validation: { min: 100, max: 250 }
      },
      {
        id: 'current-weight',
        type: 'NUMBER' as const,
        question: 'Current Weight (kg)',
        description: 'Your current weight in kilograms',
        required: true,
        validation: { min: 30, max: 300 }
      },
      {
        id: 'blood-pressure',
        type: 'TEXT' as const,
        question: 'Last Blood Pressure Reading',
        description: 'Format: Systolic/Diastolic (e.g., 120/80)',
        required: true
      },
      {
        id: 'heart-rate',
        type: 'NUMBER' as const,
        question: 'Resting Heart Rate (bpm)',
        description: 'Your typical resting heart rate',
        required: false,
        validation: { min: 40, max: 120 }
      },
      {
        id: 'current-symptoms',
        type: 'TEXTAREA' as const,
        question: 'Current Symptoms or Concerns',
        description: 'Describe any symptoms you are currently experiencing',
        required: false
      },
      {
        id: 'pain-level',
        type: 'SELECT' as const,
        question: 'Current Pain Level',
        description: 'Rate your current level of pain or discomfort',
        required: true,
        options: ['None (0)', 'Mild (1-3)', 'Moderate (4-6)', 'Severe (7-10)']
      }
    ]
  },
  {
    id: 'lifestyle',
    title: 'Lifestyle Assessment',
    description: 'Your daily habits and lifestyle factors',
    required: true,
    icon: Activity,
    questions: [
      {
        id: 'smoking-status',
        type: 'SELECT' as const,
        question: 'Smoking Status',
        description: 'Your current smoking habits',
        required: true,
        options: [
          'Never smoked',
          'Former smoker (quit more than 1 year ago)',
          'Former smoker (quit within last year)',
          'Current smoker (less than 10 cigarettes/day)',
          'Current smoker (10-20 cigarettes/day)',
          'Current smoker (more than 20 cigarettes/day)'
        ]
      },
      {
        id: 'alcohol-consumption',
        type: 'SELECT' as const,
        question: 'Alcohol Consumption',
        description: 'How often do you consume alcohol?',
        required: true,
        options: [
          'Never',
          'Rarely (few times per year)',
          'Occasionally (few times per month)',
          'Regularly (few times per week)',
          'Daily'
        ]
      },
      {
        id: 'exercise-frequency',
        type: 'SELECT' as const,
        question: 'Exercise Frequency',
        description: 'How often do you engage in physical exercise?',
        required: true,
        options: [
          'Never',
          'Rarely (less than once per week)',
          '1-2 times per week',
          '3-4 times per week',
          '5-6 times per week',
          'Daily'
        ]
      },
      {
        id: 'exercise-types',
        type: 'MULTISELECT' as const,
        question: 'Types of Exercise',
        description: 'What types of exercise do you regularly do?',
        required: false,
        options: [
          'Walking',
          'Running',
          'Swimming',
          'Cycling',
          'Gym workout',
          'Yoga',
          'Pilates',
          'Team sports',
          'Dancing',
          'Hiking',
          'Other'
        ]
      },
      {
        id: 'sleep-hours',
        type: 'NUMBER' as const,
        question: 'Average Sleep Hours per Night',
        description: 'How many hours do you typically sleep per night?',
        required: true,
        validation: { min: 3, max: 12 }
      },
      {
        id: 'sleep-quality',
        type: 'SELECT' as const,
        question: 'Sleep Quality',
        description: 'How would you rate your sleep quality?',
        required: true,
        options: ['Excellent', 'Good', 'Fair', 'Poor']
      },
      {
        id: 'stress-level',
        type: 'SELECT' as const,
        question: 'Stress Level',
        description: 'How would you rate your current stress level?',
        required: true,
        options: ['Very Low', 'Low', 'Moderate', 'High', 'Very High']
      },
      {
        id: 'stress-management',
        type: 'TEXTAREA' as const,
        question: 'Stress Management Methods',
        description: 'How do you typically manage stress?',
        required: false
      },
      {
        id: 'dietary-restrictions',
        type: 'MULTISELECT' as const,
        question: 'Dietary Restrictions or Preferences',
        description: 'Any dietary restrictions, allergies, or special preferences',
        required: false,
        options: [
          'Vegetarian',
          'Vegan',
          'Gluten-free',
          'Dairy-free',
          'Nut allergies',
          'Shellfish allergies',
          'Kosher',
          'Halal',
          'Diabetic diet',
          'Low sodium',
          'Other'
        ]
      }
    ]
  },
  {
    id: 'preventive-care',
    title: 'Preventive Care & Screenings',
    description: 'Your preventive healthcare history and needs',
    required: true,
    icon: Shield,
    questions: [
      {
        id: 'last-checkup',
        type: 'DATE' as const,
        question: 'Date of Last Comprehensive Checkup',
        description: 'When was your last full medical examination?',
        required: true
      },
      {
        id: 'last-dental-checkup',
        type: 'DATE' as const,
        question: 'Date of Last Dental Checkup',
        description: 'When was your last dental examination?',
        required: false
      },
      {
        id: 'last-eye-exam',
        type: 'DATE' as const,
        question: 'Date of Last Eye Examination',
        description: 'When was your last comprehensive eye exam?',
        required: false
      },
      {
        id: 'mammogram',
        type: 'DATE' as const,
        question: 'Date of Last Mammogram',
        description: 'For women: Date of last mammogram',
        required: false
      },
      {
        id: 'pap-smear',
        type: 'DATE' as const,
        question: 'Date of Last Pap Smear',
        description: 'For women: Date of last Pap smear',
        required: false
      },
      {
        id: 'colonoscopy',
        type: 'DATE' as const,
        question: 'Date of Last Colonoscopy',
        description: 'Date of last colonoscopy (if applicable)',
        required: false
      },
      {
        id: 'vaccinations-up-to-date',
        type: 'BOOLEAN' as const,
        question: 'Are your vaccinations up to date?',
        description: 'Including flu shot, COVID-19, and other recommended vaccines',
        required: true
      },
      {
        id: 'vaccination-concerns',
        type: 'TEXTAREA' as const,
        question: 'Vaccination Concerns or Hesitancy',
        description: 'Any concerns about vaccines or vaccine hesitancy',
        required: false
      }
    ]
  }
];

export function HealthAssessmentForm({
  healthProfile,
  assessmentType = 'INITIAL',
  onComplete,
  onSave,
  onCancel,
  initialAssessment,
  className = ''
}: HealthAssessmentFormProps) {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isValidating, setIsValidating] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const sections = ASSESSMENT_SECTIONS;
  const currentSection = sections[currentSectionIndex];
  const totalSections = sections.length;
  const progress = ((currentSectionIndex + 1) / totalSections) * 100;

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
    
    // Clear validation error when user starts answering
    if (validationErrors[questionId]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[questionId];
        return newErrors;
      });
    }
  };

  const validateCurrentSection = () => {
    setIsValidating(true);
    const errors: Record<string, string> = {};
    
    currentSection.questions.forEach(question => {
      const answer = answers[question.id];
      
      // Check if required question is answered
      if (question.required && (answer === undefined || answer === '' || answer === null)) {
        errors[question.id] = 'This question is required';
        return;
      }
      
      // Additional validation based on question type
      if (answer !== undefined && answer !== '') {
        switch (question.type) {
          case 'NUMBER':
            const numValue = parseFloat(answer);
            if (isNaN(numValue)) {
              errors[question.id] = 'Please enter a valid number';
            } else if (question.validation) {
              if (question.validation.min !== undefined && numValue < question.validation.min) {
                errors[question.id] = `Value must be at least ${question.validation.min}`;
              }
              if (question.validation.max !== undefined && numValue > question.validation.max) {
                errors[question.id] = `Value must be no more than ${question.validation.max}`;
              }
            }
            break;
          case 'TEXT':
            if (question.validation?.pattern) {
              const regex = new RegExp(question.validation.pattern);
              if (!regex.test(answer)) {
                errors[question.id] = 'Please enter a valid format';
              }
            }
            break;
        }
      }
    });
    
    setValidationErrors(errors);
    setIsValidating(false);
    
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateCurrentSection()) {
      if (currentSectionIndex < totalSections - 1) {
        setCurrentSectionIndex(prev => prev + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(prev => prev - 1);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    const assessment: HealthAssessment = {
      id: initialAssessment?.id || `assessment-${Date.now()}`,
      profileId: healthProfile.id,
      type: assessmentType,
      sections: sections.map(section => ({
        ...section,
        completed: section.questions.every(q => answers[q.id] !== undefined && answers[q.id] !== '')
      })),
      status: 'IN_PROGRESS',
      startedAt: initialAssessment?.startedAt || new Date(),
      notes: initialAssessment?.notes
    };
    
    onSave(assessment);
    setIsSaving(false);
  };

  const handleComplete = () => {
    if (validateCurrentSection()) {
      // Validate all sections
      const allErrors: Record<string, string> = {};
      sections.forEach(section => {
        section.questions.forEach(question => {
          if (question.required && (answers[question.id] === undefined || answers[question.id] === '')) {
            allErrors[question.id] = 'This question is required';
          }
        });
      });
      
      if (Object.keys(allErrors).length === 0) {
        const assessment: HealthAssessment = {
          id: initialAssessment?.id || `assessment-${Date.now()}`,
          profileId: healthProfile.id,
          type: assessmentType,
          sections: sections.map(section => ({
            ...section,
            completed: true
          })),
          status: 'COMPLETED',
          startedAt: initialAssessment?.startedAt || new Date(),
          completedAt: new Date()
        };
        
        onComplete(assessment);
      } else {
        setValidationErrors(allErrors);
        // Scroll to first error
        const firstErrorId = Object.keys(allErrors)[0];
        const errorElement = document.querySelector(`[data-question-id="${firstErrorId}"]`);
        errorElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  const renderQuestionInput = (question: AssessmentQuestion) => {
    const value = answers[question.id] || '';
    const hasError = !!validationErrors[question.id];
    
    const baseProps = {
      id: question.id,
      'data-question-id': question.id,
      className: hasError ? 'border-red-500' : ''
    };

    switch (question.type) {
      case 'TEXT':
        return (
          <div key={question.id} className="space-y-2">
            <Label htmlFor={question.id} className="text-sm font-medium">
              {question.question}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            {question.description && (
              <p className="text-xs text-gray-600">{question.description}</p>
            )}
            <Input
              {...baseProps}
              type="text"
              value={value}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              placeholder="Enter your answer"
            />
            {hasError && (
              <p className="text-xs text-red-600">{validationErrors[question.id]}</p>
            )}
          </div>
        );

      case 'NUMBER':
        return (
          <div key={question.id} className="space-y-2">
            <Label htmlFor={question.id} className="text-sm font-medium">
              {question.question}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            {question.description && (
              <p className="text-xs text-gray-600">{question.description}</p>
            )}
            <Input
              {...baseProps}
              type="number"
              value={value}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              placeholder="Enter number"
              min={question.validation?.min}
              max={question.validation?.max}
            />
            {hasError && (
              <p className="text-xs text-red-600">{validationErrors[question.id]}</p>
            )}
          </div>
        );

      case 'DATE':
        return (
          <div key={question.id} className="space-y-2">
            <Label htmlFor={question.id} className="text-sm font-medium">
              {question.question}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            {question.description && (
              <p className="text-xs text-gray-600">{question.description}</p>
            )}
            <Input
              {...baseProps}
              type="date"
              value={value}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            />
            {hasError && (
              <p className="text-xs text-red-600">{validationErrors[question.id]}</p>
            )}
          </div>
        );

      case 'TEXTAREA':
        return (
          <div key={question.id} className="space-y-2">
            <Label htmlFor={question.id} className="text-sm font-medium">
              {question.question}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            {question.description && (
              <p className="text-xs text-gray-600">{question.description}</p>
            )}
            <Textarea
              {...baseProps}
              value={value}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              placeholder="Enter your answer"
              rows={4}
            />
            {hasError && (
              <p className="text-xs text-red-600">{validationErrors[question.id]}</p>
            )}
          </div>
        );

      case 'SELECT':
        return (
          <div key={question.id} className="space-y-2">
            <Label className="text-sm font-medium">
              {question.question}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            {question.description && (
              <p className="text-xs text-gray-600">{question.description}</p>
            )}
            <Select value={value} onValueChange={(val) => handleAnswerChange(question.id, val)}>
              <SelectTrigger className={hasError ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                {question.options?.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {hasError && (
              <p className="text-xs text-red-600">{validationErrors[question.id]}</p>
            )}
          </div>
        );

      case 'MULTISELECT':
        const selectedValues = Array.isArray(value) ? value : [];
        return (
          <div key={question.id} className="space-y-2">
            <Label className="text-sm font-medium">
              {question.question}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            {question.description && (
              <p className="text-xs text-gray-600">{question.description}</p>
            )}
            <div className="space-y-2">
              {question.options?.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${question.id}-${option}`}
                    checked={selectedValues.includes(option)}
                    onCheckedChange={(checked) => {
                      const currentValues = Array.isArray(value) ? value : [];
                      if (checked) {
                        handleAnswerChange(question.id, [...currentValues, option]);
                      } else {
                        handleAnswerChange(question.id, currentValues.filter(v => v !== option));
                      }
                    }}
                  />
                  <Label htmlFor={`${question.id}-${option}`} className="text-sm">
                    {option}
                  </Label>
                </div>
              ))}
            </div>
            {hasError && (
              <p className="text-xs text-red-600">{validationErrors[question.id]}</p>
            )}
          </div>
        );

      case 'BOOLEAN':
        return (
          <div key={question.id} className="space-y-2">
            <Label className="text-sm font-medium">
              {question.question}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            {question.description && (
              <p className="text-xs text-gray-600">{question.description}</p>
            )}
            <RadioGroup
              value={value?.toString() || ''}
              onValueChange={(val) => handleAnswerChange(question.id, val === 'true')}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="true" id={`${question.id}-yes`} />
                <Label htmlFor={`${question.id}-yes`}>Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="false" id={`${question.id}-no`} />
                <Label htmlFor={`${question.id}-no`}>No</Label>
              </div>
            </RadioGroup>
            {hasError && (
              <p className="text-xs text-red-600">{validationErrors[question.id]}</p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const completedSections = sections.filter(section =>
    section.questions.every(q => answers[q.id] !== undefined && answers[q.id] !== '')
  ).length;

  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Health Assessment</h1>
            <p className="text-blue-100">
              {assessmentType === 'INITIAL' ? 'Initial Health Assessment' : 
               assessmentType === 'PERIODIC' ? 'Periodic Health Review' : 
               'Specialized Health Assessment'}
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-blue-100">Progress</div>
            <div className="text-2xl font-bold">{Math.round(progress)}%</div>
          </div>
        </div>
        <div className="mt-4">
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Navigation breadcrumbs */}
      <div className="flex items-center space-x-2 mb-6 text-sm text-gray-600">
        {sections.map((section, index) => (
          <React.Fragment key={section.id}>
            <div
              className={`flex items-center space-x-1 px-2 py-1 rounded cursor-pointer transition-colors ${
                index === currentSectionIndex
                  ? 'bg-blue-100 text-blue-700'
                  : index < currentSectionIndex
                  ? 'bg-green-100 text-green-700'
                  : 'hover:bg-gray-100'
              }`}
              onClick={() => setCurrentSectionIndex(index)}
            >
              {index < currentSectionIndex ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <span className="w-4 h-4 rounded-full bg-gray-300 flex items-center justify-center text-xs font-medium">
                  {index + 1}
                </span>
              )}
              <span className="hidden md:inline">{section.title}</span>
            </div>
            {index < sections.length - 1 && <ChevronRight className="w-4 h-4" />}
          </React.Fragment>
        ))}
      </div>

      {/* Current Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <currentSection.icon className="w-5 h-5 mr-2" />
            {currentSection.title}
          </CardTitle>
          <CardDescription>{currentSection.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {currentSection.questions.map(renderQuestionInput)}
        </CardContent>
      </Card>

      {/* Navigation Footer */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-4">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentSectionIndex === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          <Button
            variant="outline"
            onClick={handleSave}
            disabled={isSaving}
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Draft'}
          </Button>
        </div>
        
        <div className="flex space-x-4">
          {currentSectionIndex < totalSections - 1 ? (
            <Button onClick={handleNext} disabled={isValidating}>
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleComplete} disabled={isValidating} className="bg-green-600 hover:bg-green-700">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Complete Assessment
            </Button>
          )}
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>

      {/* Progress Summary */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex justify-between items-center text-sm text-gray-600">
          <span>Completed Sections: {completedSections} of {totalSections}</span>
          <span>Current: {currentSection.title}</span>
        </div>
      </div>
    </div>
  );
}