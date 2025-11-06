// Healthier SG Interactive Guide Component
// Step-by-step program walkthrough with progressive disclosure

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Play,
  Pause,
  RotateCcw,
  Download,
  ExternalLink,
  Clock,
  Star,
  AlertCircle,
  Lightbulb,
  BookOpen,
  FileText,
  Video,
  Users,
  Target,
  Heart,
  Shield,
  Calculator,
  MapPin,
  Calendar,
  Phone
} from 'lucide-react'
import { ProgramGuide, GuideStep, ProgramInfoComponentProps } from './types'
import { createAnalyticsEngine } from './content-management/analytics'

// Mock interactive guide data
const mockGuides: ProgramGuide[] = [
  {
    id: 'enrollment-guide',
    title: 'Healthier SG Enrollment Guide',
    description: 'Complete walkthrough for enrolling in the Healthier SG program',
    category: 'ENROLLMENT',
    difficulty: 'BEGINNER',
    estimatedDuration: '15 minutes',
    steps: [
      {
        id: 'step-1',
        title: 'Check Your Eligibility',
        description: 'Verify that you meet the basic requirements to join Healthier SG',
        estimatedTime: '2 minutes',
        type: 'INFORMATION',
        content: {
          instructions: [
            'You must be a Singapore citizen or permanent resident',
            'You must be 18 years or older',
            'No income restrictions apply',
            'You can be enrolled in other health programs'
          ],
          prerequisites: [],
          tips: [
            'Have your NRIC or FIN card ready',
            'Check if you have chronic conditions (optional)',
            'Consider your preferred family doctor/clinic'
          ],
          warnings: [
            'You can only enroll once per person',
            'Enrollment is free but some services may have small fees'
          ],
          resources: [
            {
              title: 'Eligibility Checker',
              type: 'LINK',
              url: '/healthier-sg/eligibility',
              description: 'Quick eligibility assessment tool'
            },
            {
              title: 'MOH Official Guidelines',
              type: 'DOCUMENT',
              url: '/documents/moh-eligibility.pdf',
              description: 'Official MOH eligibility requirements'
            }
          ]
        },
        interactive: {
          hasForm: true,
          hasQuiz: false,
          hasCalculators: false,
          hasChecklist: true,
          formFields: [
            {
              type: 'SELECT',
              label: 'Are you a Singapore citizen or permanent resident?',
              required: true,
              options: ['Yes', 'No']
            },
            {
              type: 'NUMBER',
              label: 'What is your age?',
              required: true
            }
          ]
        },
        progress: {
          completed: false
        }
      },
      {
        id: 'step-2',
        title: 'Choose Your Family Doctor',
        description: 'Select a participating family doctor or clinic for your health journey',
        estimatedTime: '5 minutes',
        type: 'ACTION',
        content: {
          instructions: [
            'Find a participating family doctor near you',
            'Consider clinic location and operating hours',
            'Check if your preferred doctor is in the program',
            'Verify clinic acceptance of Healthier SG'
          ],
          prerequisites: [
            'Completed eligibility check',
            'Have list of preferred clinics'
          ],
          tips: [
            'Location and accessibility matter for regular visits',
            'Some clinics may have shorter wait times',
            'Consider language preferences'
          ],
          warnings: [
            'You can only change doctors once per year',
            'Some clinics may have capacity limits'
          ],
          resources: [
            {
              title: 'Clinic Finder',
              type: 'LINK',
              url: '/clinics',
              description: 'Search for participating clinics by location'
            },
            {
              title: 'Doctor Ratings',
              type: 'LINK',
              url: '/ratings',
              description: 'View patient ratings and reviews'
            }
          ]
        },
        interactive: {
          hasForm: true,
          hasQuiz: false,
          hasCalculators: false,
          hasChecklist: true,
          formFields: [
            {
              type: 'TEXT',
              label: 'Preferred location (postal code)',
              required: true
            },
            {
              type: 'SELECT',
              label: 'Preferred clinic type',
              required: false,
              options: ['Family Clinic', 'Polyclinic', 'Private Clinic', 'No preference']
            }
          ]
        },
        progress: {
          completed: false
        }
      },
      {
        id: 'step-3',
        title: 'Prepare Required Documents',
        description: 'Gather all necessary documents for enrollment',
        estimatedTime: '3 minutes',
        type: 'RESOURCE',
        content: {
          instructions: [
            'Prepare your NRIC or FIN card',
            'Have your address proof ready',
            'Gather any existing health records',
            'Prepare emergency contact information'
          ],
          prerequisites: [],
          tips: [
            'Digital copies are acceptable',
            'Keep documents easily accessible',
            'Consider making copies for your records'
          ],
          warnings: [
            'Documents must be current and valid',
            'Incomplete applications will be rejected'
          ],
          resources: [
            {
              title: 'Document Checklist',
              type: 'DOCUMENT',
              url: '/documents/enrollment-checklist.pdf',
              description: 'Printable checklist of required documents'
            }
          ]
        },
        interactive: {
          hasForm: false,
          hasQuiz: false,
          hasCalculators: false,
          hasChecklist: true
        },
        progress: {
          completed: false
        }
      },
      {
        id: 'step-4',
        title: 'Complete Health Assessment',
        description: 'Schedule and complete your initial health screening',
        estimatedTime: '10 minutes',
        type: 'ACTION',
        content: {
          instructions: [
            'Contact your chosen clinic to schedule assessment',
            'Complete initial health questionnaire',
            'Attend scheduled health screening',
            'Discuss results with your family doctor'
          ],
          prerequisites: [
            'Chosen family doctor',
            'Prepared documents'
          ],
          tips: [
            'Be honest about your health history',
            'Ask questions about any concerns',
            'Keep copies of all test results'
          ],
          warnings: [
            'Some screenings require fasting',
            'Results may take 1-2 weeks'
          ],
          resources: [
            {
              title: 'Health Assessment Form',
              type: 'FORM',
              url: '/forms/health-assessment',
              description: 'Online health questionnaire'
            },
            {
              title: 'Screening Preparation Guide',
              type: 'DOCUMENT',
              url: '/documents/screening-guide.pdf',
              description: 'How to prepare for your health screening'
            }
          ]
        },
        interactive: {
          hasForm: true,
          hasQuiz: false,
          hasCalculators: true,
          hasChecklist: true,
          formFields: [
            {
              type: 'CHECKBOX',
              label: 'Which health conditions apply to you? (optional)',
              required: false,
              options: [
                'Diabetes',
                'High blood pressure',
                'High cholesterol',
                'Heart disease',
                'None of the above'
              ]
            },
            {
              type: 'TEXT',
              label: 'Current medications (if any)',
              required: false
            }
          ]
        },
        progress: {
          completed: false
        }
      },
      {
        id: 'step-5',
        title: 'Review and Sign Consent Forms',
        description: 'Review program terms and sign required consent forms',
        estimatedTime: '5 minutes',
        type: 'ACTION',
        content: {
          instructions: [
            'Read all program terms and conditions',
            'Review privacy and data sharing policies',
            'Sign consent forms electronically',
            'Keep copies of signed documents'
          ],
          prerequisites: [
            'Completed health assessment',
            'Reviewed program information'
          ],
          tips: [
            'Ask questions if you don\'t understand anything',
            'You can withdraw consent later',
            'Keep digital copies of all documents'
          ],
          warnings: [
            'Some consent forms cannot be changed',
            'Data sharing is essential for program benefits'
          ],
          resources: [
            {
              title: 'Program Terms and Conditions',
              type: 'DOCUMENT',
              url: '/documents/terms.pdf',
              description: 'Complete terms and conditions'
            },
            {
              title: 'Privacy Policy',
              type: 'DOCUMENT',
              url: '/documents/privacy.pdf',
              description: 'Data privacy and security information'
            }
          ]
        },
        interactive: {
          hasForm: true,
          hasQuiz: false,
          hasCalculators: false,
          hasChecklist: true,
          formFields: [
            {
              type: 'CHECKBOX',
              label: 'I have read and agree to the terms and conditions',
              required: true
            },
            {
              type: 'CHECKBOX',
              label: 'I consent to sharing my health data for program purposes',
              required: true
            }
          ]
        },
        progress: {
          completed: false
        }
      }
    ],
    prerequisites: [
      'Basic computer/internet literacy',
      'Access to email for confirmations'
    ],
    outcomes: [
      {
        description: 'Successfully enrolled in Healthier SG program',
        measurable: true,
        unit: 'enrollment confirmation'
      },
      {
        description: 'Personalized health plan created',
        measurable: true,
        unit: 'health plan document'
      }
    ],
    resources: [
      {
        title: 'Program FAQ',
        type: 'FAQ',
        url: '/faq',
        content: 'Common questions and answers'
      },
      {
        title: 'Support Contact',
        type: 'CONTACT',
        url: 'tel:1800-223-1422',
        content: '24/7 helpline for assistance'
      }
    ],
    accessibility: {
      textToSpeech: true,
      highContrast: true,
      keyboardNavigation: true,
      alternativeFormats: ['PDF', 'Large Print']
    },
    analytics: {
      views: 1250,
      completions: 890,
      averageTimeSpent: 12.5,
      completionRate: 0.71
    }
  }
]

interface InteractiveGuideProps extends ProgramInfoComponentProps {
  guideId?: string
  showProgress?: boolean
  allowResume?: boolean
  onStepComplete?: (stepId: string) => void
  onGuideComplete?: (guideId: string) => void
}

export type InteractiveGuideProps = InteractiveGuideProps

export const InteractiveGuide: React.FC<InteractiveGuideProps> = ({
  className = '',
  language = 'en',
  userType = 'citizen',
  isMobile = false,
  showGovernmentDisclaimer = true,
  enableAnalytics = true,
  guideId = 'enrollment-guide',
  showProgress = true,
  allowResume = true,
  onStepComplete,
  onGuideComplete
}) => {
  const [currentGuide, setCurrentGuide] = useState<ProgramGuide | null>(null)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set())
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [analytics] = useState(() => createAnalyticsEngine())

  useEffect(() => {
    const loadGuide = async () => {
      setLoading(true)
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const guide = mockGuides.find(g => g.id === guideId) || mockGuides[0]
      setCurrentGuide(guide)
      
      // Load saved progress if allowResume
      if (allowResume) {
        const savedProgress = localStorage.getItem(`guide-progress-${guideId}`)
        if (savedProgress) {
          const progress = JSON.parse(savedProgress)
          setCompletedSteps(new Set(progress.completedSteps || []))
          setCurrentStepIndex(progress.currentStepIndex || 0)
        }
      }
      
      setLoading(false)
    }
    loadGuide()
  }, [guideId, allowResume])

  // Save progress
  useEffect(() => {
    if (currentGuide && allowResume) {
      const progress = {
        completedSteps: Array.from(completedSteps),
        currentStepIndex,
        lastUpdated: new Date().toISOString()
      }
      localStorage.setItem(`guide-progress-${currentGuide.id}`, JSON.stringify(progress))
    }
  }, [completedSteps, currentStepIndex, currentGuide, allowResume])

  const currentStep = currentGuide?.steps[currentStepIndex]
  const isFirstStep = currentStepIndex === 0
  const isLastStep = currentGuide ? currentStepIndex === currentGuide.steps.length - 1 : false
  const progressPercent = currentGuide ? ((currentStepIndex + 1) / currentGuide.steps.length) * 100 : 0

  const goToNextStep = () => {
    if (!currentGuide || isLastStep) return
    
    const nextIndex = currentStepIndex + 1
    setCurrentStepIndex(nextIndex)
    
    // Track analytics
    if (enableAnalytics && currentStep) {
      analytics.trackEngagement({
        sessionId: `guide-${currentGuide.id}`,
        contentId: currentGuide.id,
        contentType: 'GUIDE',
        action: 'complete_step',
        metadata: {
          stepId: currentStep.id,
          stepNumber: currentStepIndex + 1,
          language: language,
          device: isMobile ? 'mobile' : 'desktop'
        }
      })
    }
    
    // Complete current step
    if (currentStep) {
      setCompletedSteps(prev => new Set([...prev, currentStep.id]))
      onStepComplete?.(currentStep.id)
    }
    
    // Check if guide is complete
    if (nextIndex === currentGuide.steps.length) {
      onGuideComplete?.(currentGuide.id)
      
      // Track guide completion
      if (enableAnalytics) {
        analytics.trackEngagement({
          sessionId: `guide-${currentGuide.id}`,
          contentId: currentGuide.id,
          contentType: 'GUIDE',
          action: 'complete_guide',
          metadata: {
            totalTime: Date.now(),
            language: language,
            device: isMobile ? 'mobile' : 'desktop'
          }
        })
      }
    }
  }

  const goToPreviousStep = () => {
    if (isFirstStep) return
    setCurrentStepIndex(currentStepIndex - 1)
  }

  const resetGuide = () => {
    setCurrentStepIndex(0)
    setCompletedSteps(new Set())
    setFormData({})
    if (allowResume) {
      localStorage.removeItem(`guide-progress-${currentGuide?.id}`)
    }
  }

  const handleFormSubmit = (data: Record<string, any>) => {
    setFormData(data)
    setShowForm(false)
    
    // Mark step as completed if it's form-only step
    if (currentStep?.interactive.hasForm && !currentStep.interactive.hasQuiz) {
      setCompletedSteps(prev => new Set([...prev, currentStep.id]))
      onStepComplete?.(currentStep.id)
    }
  }

  const renderStepIcon = (step: GuideStep, index: number) => {
    const isCompleted = completedSteps.has(step.id)
    const isCurrent = index === currentStepIndex
    
    if (isCompleted) {
      return <CheckCircle2 className="h-6 w-6 text-green-600" />
    }
    
    if (isCurrent) {
      switch (step.type) {
        case 'INFORMATION': return <BookOpen className="h-6 w-6 text-blue-600" />
        case 'ACTION': return <Target className="h-6 w-6 text-orange-600" />
        case 'DECISION': return <Star className="h-6 w-6 text-purple-600" />
        case 'RESOURCE': return <FileText className="h-6 w-6 text-green-600" />
        default: return <Play className="h-6 w-6 text-gray-600" />
      }
    }
    
    return <div className="h-6 w-6 rounded-full border-2 border-gray-300 flex items-center justify-center text-sm font-medium text-gray-500">{index + 1}</div>
  }

  const renderStepTypeBadge = (type: GuideStep['type']) => {
    const badges = {
      'INFORMATION': { label: 'Information', color: 'bg-blue-100 text-blue-800' },
      'ACTION': { label: 'Action Required', color: 'bg-orange-100 text-orange-800' },
      'DECISION': { label: 'Decision Point', color: 'bg-purple-100 text-purple-800' },
      'RESOURCE': { label: 'Resources', color: 'bg-green-100 text-green-800' }
    }
    
    const badge = badges[type]
    return <Badge className={badge.color}>{badge.label}</Badge>
  }

  if (loading) {
    return (
      <div className={`container mx-auto p-6 ${className}`}>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!currentGuide) {
    return (
      <div className={`container mx-auto p-6 ${className}`}>
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Guide Not Found</h3>
            <p className="text-gray-600">The requested guide could not be loaded.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{currentGuide.title}</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-4">
            {currentGuide.description}
          </p>
          
          <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              {currentGuide.estimatedDuration}
            </div>
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-1" />
              {currentGuide.difficulty} Level
            </div>
            <div className="flex items-center">
              <FileText className="h-4 w-4 mr-1" />
              {currentGuide.steps.length} Steps
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        {showProgress && (
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Progress</span>
                <span className="text-sm text-gray-600">{currentStepIndex + 1} of {currentGuide.steps.length}</span>
              </div>
              <Progress value={progressPercent} className="w-full" />
              <div className="mt-2 text-sm text-gray-600">
                {completedSteps.size} of {currentGuide.steps.length} steps completed
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step Navigation */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Steps Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Guide Steps</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3">
                  {currentGuide.steps.map((step, index) => (
                    <div
                      key={step.id}
                      className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                        index === currentStepIndex 
                          ? 'bg-blue-50 border border-blue-200' 
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setCurrentStepIndex(index)}
                    >
                      {renderStepIcon(step, index)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {step.title}
                        </p>
                        <p className="text-xs text-gray-600">{step.estimatedTime}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* Guide Controls */}
            <Card className="mt-4">
              <CardContent className="p-4">
                <div className="space-y-2">
                  <Button
                    onClick={resetGuide}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset Guide
                  </Button>
                  
                  {currentGuide.accessibility.textToSpeech && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Read Aloud
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {currentStep && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">{currentStep.title}</CardTitle>
                      <p className="text-gray-600 mt-1">{currentStep.description}</p>
                    </div>
                    {renderStepTypeBadge(currentStep.type)}
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mt-2">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {currentStep.estimatedTime}
                    </div>
                    {currentStep.interactive.hasForm && (
                      <Badge variant="secondary">Interactive</Badge>
                    )}
                    {currentStep.interactive.hasQuiz && (
                      <Badge variant="secondary">Quiz</Badge>
                    )}
                    {currentStep.interactive.hasCalculators && (
                      <Badge variant="secondary">Calculator</Badge>
                    )}
                    {currentStep.interactive.hasChecklist && (
                      <Badge variant="secondary">Checklist</Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="p-6">
                  <div className="space-y-6">
                    {/* Instructions */}
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center">
                        <CheckCircle2 className="h-5 w-5 mr-2 text-green-600" />
                        Instructions
                      </h3>
                      <ul className="space-y-2">
                        {currentStep.content.instructions.map((instruction, index) => (
                          <li key={index} className="flex items-start">
                            <span className="inline-block w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                            <span className="text-gray-700">{instruction}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Prerequisites */}
                    {currentStep.content.prerequisites && currentStep.content.prerequisites.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-3 flex items-center">
                          <AlertCircle className="h-5 w-5 mr-2 text-orange-600" />
                          Prerequisites
                        </h3>
                        <ul className="space-y-2">
                          {currentStep.content.prerequisites.map((prereq, index) => (
                            <li key={index} className="flex items-start">
                              <span className="inline-block w-2 h-2 bg-orange-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                              <span className="text-gray-700">{prereq}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Tips */}
                    {currentStep.content.tips && currentStep.content.tips.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-3 flex items-center">
                          <Lightbulb className="h-5 w-5 mr-2 text-yellow-600" />
                          Tips
                        </h3>
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <ul className="space-y-1">
                            {currentStep.content.tips.map((tip, index) => (
                              <li key={index} className="text-gray-700 text-sm">• {tip}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}

                    {/* Warnings */}
                    {currentStep.content.warnings && currentStep.content.warnings.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-3 flex items-center">
                          <AlertCircle className="h-5 w-5 mr-2 text-red-600" />
                          Important Notes
                        </h3>
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                          <ul className="space-y-1">
                            {currentStep.content.warnings.map((warning, index) => (
                              <li key={index} className="text-gray-700 text-sm">• {warning}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}

                    {/* Resources */}
                    {currentStep.content.resources && currentStep.content.resources.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-3 flex items-center">
                          <ExternalLink className="h-5 w-5 mr-2 text-blue-600" />
                          Resources
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {currentStep.content.resources.map((resource, index) => (
                            <a
                              key={index}
                              href={resource.url}
                              target={resource.type === 'LINK' ? '_blank' : '_self'}
                              rel={resource.type === 'LINK' ? 'noopener noreferrer' : ''}
                              className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              {resource.type === 'LINK' && <ExternalLink className="h-4 w-4 mr-2 text-blue-600" />}
                              {resource.type === 'DOCUMENT' && <FileText className="h-4 w-4 mr-2 text-green-600" />}
                              {resource.type === 'VIDEO' && <Video className="h-4 w-4 mr-2 text-purple-600" />}
                              {resource.type === 'CONTACT' && <Phone className="h-4 w-4 mr-2 text-orange-600" />}
                              {resource.type === 'FORM' && <FileText className="h-4 w-4 mr-2 text-blue-600" />}
                              <div className="flex-1">
                                <p className="font-medium text-sm">{resource.title}</p>
                                <p className="text-xs text-gray-600">{resource.description}</p>
                              </div>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Interactive Elements */}
                    {currentStep.interactive.hasForm && (
                      <div>
                        <h3 className="font-semibold mb-3">Interactive Form</h3>
                        <Button
                          onClick={() => setShowForm(true)}
                          className="mb-4"
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Start Interactive Form
                        </Button>
                      </div>
                    )}

                    {currentStep.interactive.hasCalculators && (
                      <div>
                        <h3 className="font-semibold mb-3 flex items-center">
                          <Calculator className="h-5 w-5 mr-2 text-green-600" />
                          Calculate Your Benefits
                        </h3>
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <p className="text-sm text-gray-700 mb-3">
                            Use our calculator to estimate your potential savings and benefits from Healthier SG.
                          </p>
                          <Button variant="outline">
                            <Calculator className="h-4 w-4 mr-2" />
                            Open Calculator
                          </Button>
                        </div>
                      </div>
                    )}

                    {currentStep.interactive.hasChecklist && (
                      <div>
                        <h3 className="font-semibold mb-3">Checklist</h3>
                        <div className="space-y-2">
                          {currentStep.content.instructions.map((instruction, index) => (
                            <label key={index} className="flex items-center space-x-3">
                              <input type="checkbox" className="rounded" />
                              <span className="text-gray-700">{instruction}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>

                {/* Navigation */}
                <div className="border-t px-6 py-4">
                  <div className="flex items-center justify-between">
                    <Button
                      onClick={goToPreviousStep}
                      disabled={isFirstStep}
                      variant="outline"
                    >
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      Previous
                    </Button>

                    <div className="text-sm text-gray-600">
                      {isLastStep ? 'Guide Complete!' : 'Continue to next step'}
                    </div>

                    <Button
                      onClick={goToNextStep}
                      disabled={isLastStep}
                    >
                      {isLastStep ? 'Complete Guide' : 'Next'}
                      {!isLastStep && <ChevronRight className="h-4 w-4 ml-2" />}
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Government Disclaimer */}
        {showGovernmentDisclaimer && (
          <Card className="mt-8">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-gray-700">
                  <p className="font-medium mb-1">Official Government Information</p>
                  <p>
                    This guide provides information about Healthier SG, a program by the Ministry of Health Singapore. 
                    For the most current information and specific questions, please refer to official MOH sources or contact the Healthier SG helpline.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Form Modal */}
      {showForm && currentStep?.interactive.hasForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>{currentStep.title} - Form</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowForm(false)}
                className="absolute right-4 top-4"
              >
                ×
              </Button>
            </CardHeader>
            <CardContent className="p-6">
              <form className="space-y-4">
                {currentStep.interactive.formFields?.map((field, index) => (
                  <div key={index}>
                    <label className="block text-sm font-medium mb-1">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    {field.type === 'TEXT' && (
                      <input
                        type="text"
                        className="w-full p-2 border border-gray-300 rounded"
                        required={field.required}
                      />
                    )}
                    {field.type === 'NUMBER' && (
                      <input
                        type="number"
                        className="w-full p-2 border border-gray-300 rounded"
                        required={field.required}
                      />
                    )}
                    {field.type === 'SELECT' && (
                      <select className="w-full p-2 border border-gray-300 rounded" required={field.required}>
                        <option value="">Select...</option>
                        {field.options?.map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    )}
                    {field.type === 'CHECKBOX' && (
                      <div className="space-y-2">
                        {field.options?.map((option) => (
                          <label key={option} className="flex items-center space-x-2">
                            <input type="checkbox" />
                            <span>{option}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" onClick={() => setShowForm(false)}>
                    Submit Form
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}