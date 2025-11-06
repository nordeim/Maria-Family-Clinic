// Healthier SG Program Guide Component
// Step-by-step walkthroughs and interactive guides

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  BookOpen, 
  Play,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Clock,
  Star,
  FileText,
  Download,
  Users,
  Heart,
  Shield,
  HelpCircle,
  AlertCircle,
  Info,
  Zap,
  TrendingUp,
  Calendar,
  MapPin,
  Phone,
  Mail,
  ExternalLink,
  Lightbulb,
  Target,
  Award,
  MessageCircle
} from 'lucide-react'
import { ProgramGuide, GuideStep, ProgramInfoComponentProps } from './types'

// Mock guide data
const mockProgramGuides: ProgramGuide[] = [
  {
    id: 'enrollment-guide',
    title: 'Healthier SG Enrollment Guide',
    description: 'Complete step-by-step guide to enrolling in Healthier SG program from start to finish',
    category: 'ENROLLMENT',
    difficulty: 'BEGINNER',
    estimatedDuration: '30-45 minutes',
    steps: [
      {
        id: 'step-1',
        title: 'Check Your Eligibility',
        description: 'Verify that you meet the basic requirements for Healthier SG',
        estimatedTime: '5 minutes',
        type: 'DECISION',
        content: {
          instructions: [
            'Ensure you are 18 years or older',
            'Confirm you are a Singapore Citizen or Permanent Resident',
            'Verify you are willing to work with a family doctor',
            'Check that you can commit to the health plan requirements'
          ],
          prerequisites: [],
          tips: [
            'You can check eligibility anonymously first',
            'No income restrictions apply to Healthier SG',
            'Pre-existing conditions do not disqualify you'
          ],
          warnings: [
            'You must be willing to follow a personalized health plan',
            'Regular check-ups are required for program benefits'
          ],
          resources: [
            {
              title: 'Eligibility Requirements',
              type: 'LINK',
              url: '/healthier-sg/eligibility',
              description: 'Detailed eligibility criteria and requirements'
            }
          ]
        },
        interactive: {
          hasForm: true,
          hasQuiz: true,
          hasCalculators: false,
          hasChecklist: true,
          formFields: [
            {
              type: 'TEXT',
              label: 'Full Name (as per NRIC)',
              required: true
            },
            {
              type: 'DATE',
              label: 'Date of Birth',
              required: true
            },
            {
              type: 'SELECT',
              label: 'Citizenship Status',
              required: true,
              options: ['Singapore Citizen', 'Permanent Resident']
            }
          ]
        },
        progress: {
          completed: false,
          nextStep: 'step-2'
        }
      },
      {
        id: 'step-2',
        title: 'Gather Required Documents',
        description: 'Collect all necessary documents for enrollment',
        estimatedTime: '10 minutes',
        type: 'ACTION',
        content: {
          instructions: [
            'Prepare your NRIC or FIN card',
            'Gather proof of address (utility bill or bank statement)',
            'Collect any existing health records',
            'Prepare a list of current medications'
          ],
          prerequisites: ['Eligibility check completed'],
          tips: [
            'Digital copies are acceptable for most documents',
            'Documents should be dated within the last 3 months',
            'Keep both digital and physical copies for reference'
          ],
          warnings: [
            'All documents must be current and legible',
            'Incomplete applications will be delayed'
          ],
          resources: [
            {
              title: 'Document Checklist',
              type: 'DOWNLOAD',
              url: '/downloads/enrollment-documents-checklist.pdf',
              description: 'Complete list of required documents'
            }
          ]
        },
        interactive: {
          hasForm: false,
          hasQuiz: false,
          hasCalculators: false,
          hasChecklist: true,
          formFields: []
        },
        progress: {
          completed: false,
          nextStep: 'step-3'
        }
      },
      {
        id: 'step-3',
        title: 'Choose Your Family Doctor',
        description: 'Find and select a participating Healthier SG clinic and doctor',
        estimatedTime: '15 minutes',
        type: 'DECISION',
        content: {
          instructions: [
            'Use the clinic finder to locate participating clinics near you',
            'Read doctor profiles and reviews',
            'Consider clinic hours and location convenience',
            'Check language preferences and specializations'
          ],
          prerequisites: ['Required documents gathered'],
          tips: [
            'You can change your family doctor later if needed',
            'Consider proximity to your home or workplace',
            'Check if the clinic offers extended hours',
            'Verify the doctor speaks your preferred language'
          ],
          warnings: [
            'Popular doctors may have longer wait times',
            'Some clinics may have limited appointment slots'
          ],
          resources: [
            {
              title: 'Clinic Finder',
              type: 'INTERACTIVE',
              url: '/clinics',
              description: 'Find participating clinics near you'
            }
          ]
        },
        interactive: {
          hasForm: false,
          hasQuiz: false,
          hasCalculators: false,
          hasChecklist: false,
          formFields: []
        },
        progress: {
          completed: false,
          nextStep: 'step-4'
        }
      },
      {
        id: 'step-4',
        title: 'Complete Online Application',
        description: 'Fill out and submit your Healthier SG enrollment application',
        estimatedTime: '10 minutes',
        type: 'ACTION',
        content: {
          instructions: [
            'Access the enrollment portal',
            'Fill in personal and contact information',
            'Upload required documents',
            'Review all information for accuracy',
            'Submit your application'
          ],
          prerequisites: ['Family doctor selected', 'Documents prepared'],
          tips: [
            'Save your progress frequently during the form',
            'Double-check all information before submission',
            'Take screenshots of confirmation pages',
            'Keep your reference number for tracking'
          ],
          warnings: [
            'Incorrect information may delay processing',
            'Applications cannot be modified after submission'
          ],
          resources: [
            {
              title: 'Enrollment Portal',
              type: 'LINK',
              url: '/healthier-sg/enrollment/apply',
              description: 'Start your enrollment application'
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
              label: 'NRIC/FIN Number',
              required: true
            },
            {
              type: 'TEXT',
              label: 'Email Address',
              required: true
            },
            {
              type: 'TEXT',
              label: 'Mobile Number',
              required: true
            },
            {
              type: 'SELECT',
              label: 'Preferred Clinic',
              required: true,
              options: ['Clinic options will be populated based on selection']
            }
          ]
        },
        progress: {
          completed: false,
          nextStep: 'step-5'
        }
      },
      {
        id: 'step-5',
        title: 'Schedule Health Screening',
        description: 'Book your comprehensive health screening appointment',
        estimatedTime: '5 minutes',
        type: 'ACTION',
        content: {
          instructions: [
            'Receive enrollment confirmation',
            'Schedule your health screening appointment',
            'Prepare for the screening appointment',
            'Attend your screening appointment'
          ],
          prerequisites: ['Application submitted and approved'],
          tips: [
            'Schedule screening within 6 months of enrollment',
            'Fast for 8-12 hours before blood tests',
            'Bring identification to appointment',
            'Allow 2-3 hours for comprehensive screening'
          ],
          warnings: [
            'Missing screening may affect program benefits',
            'Some tests require specific preparation'
          ],
          resources: [
            {
              title: 'Screening Preparation Guide',
              type: 'DOWNLOAD',
              url: '/downloads/screening-preparation.pdf',
              description: 'Complete preparation checklist for screening'
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
              label: 'Preferred Screening Date',
              required: true,
              options: ['Available dates will be shown']
            }
          ]
        },
        progress: {
          completed: false,
          nextStep: 'step-6'
        }
      },
      {
        id: 'step-6',
        title: 'Review Health Plan',
        description: 'Meet with your family doctor to review results and create your health plan',
        estimatedTime: '30 minutes',
        type: 'DECISION',
        content: {
          instructions: [
            'Attend health screening results consultation',
            'Discuss health risks and goals with doctor',
            'Review and agree to health plan recommendations',
            'Schedule follow-up appointments'
          ],
          prerequisites: ['Health screening completed'],
          tips: [
            'Be honest about your health concerns and lifestyle',
            'Ask questions about anything you don\'t understand',
            'Discuss realistic goals and timelines',
            'Ask about resources and support available'
          ],
          warnings: [
            'Health plan is a commitment - consider carefully',
            'Regular follow-ups are important for success'
          ],
          resources: [
            {
              title: 'Health Plan Template',
              type: 'DOWNLOAD',
              url: '/downloads/health-plan-template.pdf',
              description: 'Understanding your personalized health plan'
            }
          ]
        },
        interactive: {
          hasForm: false,
          hasQuiz: true,
          hasCalculators: false,
          hasChecklist: true,
          formFields: []
        },
        progress: {
          completed: false,
          nextStep: null
        }
      }
    ],
    prerequisites: [],
    outcomes: [
      {
        description: 'Successfully enrolled in Healthier SG program',
        measurable: true,
        unit: 'completion status'
      },
      {
        description: 'Health screening completed and results reviewed',
        measurable: true,
        unit: 'screening status'
      },
      {
        description: 'Personalized health plan created and agreed upon',
        measurable: true,
        unit: 'plan status'
      }
    ],
    resources: [
      {
        title: 'Enrollment FAQ',
        type: 'FAQ',
        url: '/healthier-sg/faq#enrollment',
        content: 'Common questions about enrollment process'
      },
      {
        title: 'Contact Support',
        type: 'CONTACT',
        url: '/contact',
        content: 'Get help from our support team'
      }
    ],
    accessibility: {
      textToSpeech: true,
      highContrast: true,
      keyboardNavigation: true,
      alternativeFormats: ['PDF', 'Audio']
    },
    analytics: {
      views: 12543,
      completions: 8932,
      averageTimeSpent: 32,
      completionRate: 71
    }
  },
  {
    id: 'health-management-guide',
    title: 'Health Management and Lifestyle Changes',
    description: 'Comprehensive guide to managing your health and making lifestyle improvements',
    category: 'HEALTH_MANAGEMENT',
    difficulty: 'INTERMEDIATE',
    estimatedDuration: '60-90 minutes',
    steps: [
      {
        id: 'hm-step-1',
        title: 'Understanding Your Health Risks',
        description: 'Learn about your personal health risks and how to address them',
        estimatedTime: '15 minutes',
        type: 'INFORMATION',
        content: {
          instructions: [
            'Review your health screening results',
            'Understand your risk factors',
            'Learn about preventive measures',
            'Identify areas for improvement'
          ],
          tips: [
            'Focus on modifiable risk factors first',
            'Consider family history in your planning',
            'Don\'t be overwhelmed - start with small changes'
          ],
          warnings: [
            'Health risks can change over time',
            'Regular monitoring is important'
          ]
        },
        interactive: {
          hasForm: true,
          hasQuiz: true,
          hasCalculators: true,
          hasChecklist: false,
          formFields: []
        },
        progress: {
          completed: false,
          nextStep: 'hm-step-2'
        }
      }
    ],
    prerequisites: ['Healthier SG enrollment completed'],
    outcomes: [
      {
        description: 'Personalized health risk profile created',
        measurable: true,
        unit: 'profile completion'
      }
    ],
    resources: [],
    accessibility: {
      textToSpeech: true,
      highContrast: true,
      keyboardNavigation: true,
      alternativeFormats: ['PDF']
    },
    analytics: {
      views: 8732,
      completions: 5432,
      averageTimeSpent: 45,
      completionRate: 62
    }
  }
]

interface ProgramGuideProps extends ProgramInfoComponentProps {
  guideId?: string
  showProgress?: boolean
  allowSkipping?: boolean
  maxStepTime?: number
}

export type { ProgramGuideProps }

export const ProgramGuide: React.FC<ProgramGuideProps> = ({
  className = '',
  language = 'en',
  userType = 'citizen',
  isMobile = false,
  showGovernmentDisclaimer = true,
  enableAnalytics = true,
  guideId,
  showProgress = true,
  allowSkipping = false,
  maxStepTime = 60
}) => {
  const [guides, setGuides] = useState<ProgramGuide[]>([])
  const [selectedGuide, setSelectedGuide] = useState<ProgramGuide | null>(null)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set())
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [activeTab, setActiveTab] = useState('guide')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadGuides = async () => {
      setLoading(true)
      await new Promise(resolve => setTimeout(resolve, 600))
      setGuides(mockProgramGuides)
      
      if (guideId) {
        const guide = mockProgramGuides.find(g => g.id === guideId)
        if (guide) {
          setSelectedGuide(guide)
        }
      } else {
        setSelectedGuide(mockProgramGuides[0])
      }
      
      setLoading(false)
    }
    loadGuides()
  }, [guideId])

  const currentStep = selectedGuide?.steps[currentStepIndex]
  const totalSteps = selectedGuide?.steps.length || 0
  const progressPercentage = totalSteps > 0 ? (completedSteps.size / totalSteps) * 100 : 0

  const handleStepComplete = (stepId: string) => {
    setCompletedSteps(prev => new Set([...prev, stepId]))
    
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex(prev => prev + 1)
    } else {
      // Guide completed
      if (enableAnalytics) {
        console.log('Guide completed:', {
          guideId: selectedGuide?.id,
          completionTime: new Date().toISOString()
        })
      }
    }
    
    // Track analytics
    if (enableAnalytics) {
      console.log('Step completed:', {
        guideId: selectedGuide?.id,
        stepId,
        timestamp: new Date().toISOString()
      })
    }
  }

  const handlePreviousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1)
    }
  }

  const handleNextStep = () => {
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex(prev => prev + 1)
    }
  }

  const handleFormChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleFormSubmit = async () => {
    setIsSubmitting(true)
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsSubmitting(false)
    
    if (currentStep?.interactive.hasChecklist) {
      // Auto-complete step if form validation passes
      handleStepComplete(currentStep.id)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'BEGINNER': return 'bg-green-100 text-green-800'
      case 'INTERMEDIATE': return 'bg-yellow-100 text-yellow-800'
      case 'ADVANCED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStepTypeIcon = (type: string) => {
    switch (type) {
      case 'INFORMATION': return <Info className="h-5 w-5" />
      case 'ACTION': return <Target className="h-5 w-5" />
      case 'DECISION': return <HelpCircle className="h-5 w-5" />
      case 'RESOURCE': return <FileText className="h-5 w-5" />
      default: return <BookOpen className="h-5 w-5" />
    }
  }

  if (loading) {
    return (
      <div className={`container mx-auto p-6 ${className}`}>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Healthier SG Program Guides</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Step-by-step guides to help you navigate Healthier SG and achieve your health goals. 
            Interactive walkthroughs with helpful tips and resources.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
            <TabsTrigger value="guide">Interactive Guide</TabsTrigger>
            <TabsTrigger value="all-guides">All Guides</TabsTrigger>
          </TabsList>

          <TabsContent value="all-guides" className="mt-8">
            {/* Guide Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {guides.map((guide) => (
                <Card 
                  key={guide.id} 
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    selectedGuide?.id === guide.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => setSelectedGuide(guide)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Badge className={getDifficultyColor(guide.difficulty)}>
                        {guide.difficulty}
                      </Badge>
                      <Badge variant="outline">
                        {guide.category.replace('_', ' ')}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{guide.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">{guide.description}</p>
                    
                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="h-4 w-4 mr-2" />
                        {guide.estimatedDuration}
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-500">
                        <BookOpen className="h-4 w-4 mr-2" />
                        {guide.steps.length} steps
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-500">
                        <Award className="h-4 w-4 mr-2" />
                        {guide.analytics.completionRate}% completion rate
                      </div>

                      <div className="mt-4">
                        <div className="text-sm text-gray-600 mb-1">Progress</div>
                        <Progress value={guide.analytics.completionRate} className="h-2" />
                      </div>
                    </div>
                    
                    <Button className="w-full mt-4" onClick={() => setActiveTab('guide')}>
                      Start Guide
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="guide" className="mt-8">
            {selectedGuide && (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Step Navigation Sidebar */}
                <div className="lg:col-span-1">
                  <Card className="sticky top-6">
                    <CardHeader>
                      <CardTitle className="text-lg">{selectedGuide.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Progress */}
                      {showProgress && (
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span>Progress</span>
                            <span>{Math.round(progressPercentage)}%</span>
                          </div>
                          <Progress value={progressPercentage} />
                          <div className="text-xs text-gray-500 mt-1">
                            {completedSteps.size} of {totalSteps} steps completed
                          </div>
                        </div>
                      )}

                      {/* Step List */}
                      <div className="space-y-2">
                        {selectedGuide.steps.map((step, index) => (
                          <button
                            key={step.id}
                            className={`w-full text-left p-3 rounded-lg transition-colors ${
                              index === currentStepIndex 
                                ? 'bg-blue-100 border border-blue-300' 
                                : completedSteps.has(step.id)
                                ? 'bg-green-50 border border-green-200'
                                : 'hover:bg-gray-50 border border-gray-200'
                            }`}
                            onClick={() => setCurrentStepIndex(index)}
                          >
                            <div className="flex items-center space-x-3">
                              <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                                completedSteps.has(step.id)
                                  ? 'bg-green-500 text-white'
                                  : index === currentStepIndex
                                  ? 'bg-blue-500 text-white'
                                  : 'bg-gray-300 text-gray-600'
                              }`}>
                                {completedSteps.has(step.id) ? (
                                  <CheckCircle2 className="h-4 w-4" />
                                ) : (
                                  index + 1
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium truncate">
                                  {step.title}
                                </div>
                                <div className="text-xs text-gray-500 flex items-center">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {step.estimatedTime}
                                </div>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-3">
                  {currentStep ? (
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              {getStepTypeIcon(currentStep.type)}
                            </div>
                            <div>
                              <CardTitle className="text-xl">
                                Step {currentStepIndex + 1}: {currentStep.title}
                              </CardTitle>
                              <div className="flex items-center space-x-4 mt-1">
                                <Badge variant="outline">
                                  {currentStep.type.replace('_', ' ')}
                                </Badge>
                                <span className="text-sm text-gray-500 flex items-center">
                                  <Clock className="h-4 w-4 mr-1" />
                                  {currentStep.estimatedTime}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          {completedSteps.has(currentStep.id) && (
                            <Badge className="bg-green-100 text-green-800">
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Completed
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-6">
                        <p className="text-gray-700 text-lg">{currentStep.description}</p>

                        {/* Instructions */}
                        <div>
                          <h3 className="font-semibold mb-3 flex items-center">
                            <Target className="h-5 w-5 mr-2" />
                            Instructions
                          </h3>
                          <ul className="space-y-2">
                            {currentStep.content.instructions.map((instruction, index) => (
                              <li key={index} className="flex items-start">
                                <ArrowRight className="h-4 w-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-700">{instruction}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Prerequisites */}
                        {currentStep.content.prerequisites.length > 0 && (
                          <div>
                            <h3 className="font-semibold mb-3 flex items-center">
                              <Info className="h-5 w-5 mr-2" />
                              Prerequisites
                            </h3>
                            <ul className="space-y-2">
                              {currentStep.content.prerequisites.map((prereq, index) => (
                                <li key={index} className="flex items-start">
                                  <CheckCircle2 className="h-4 w-4 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                                  <span className="text-gray-700">{prereq}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Tips */}
                        {currentStep.content.tips.length > 0 && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h3 className="font-semibold mb-3 flex items-center text-blue-900">
                              <Lightbulb className="h-5 w-5 mr-2" />
                              Helpful Tips
                            </h3>
                            <ul className="space-y-2">
                              {currentStep.content.tips.map((tip, index) => (
                                <li key={index} className="flex items-start">
                                  <Star className="h-4 w-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                                  <span className="text-blue-800">{tip}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Warnings */}
                        {currentStep.content.warnings.length > 0 && (
                          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <h3 className="font-semibold mb-3 flex items-center text-red-900">
                              <AlertCircle className="h-5 w-5 mr-2" />
                              Important Warnings
                            </h3>
                            <ul className="space-y-2">
                              {currentStep.content.warnings.map((warning, index) => (
                                <li key={index} className="flex items-start">
                                  <AlertCircle className="h-4 w-4 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
                                  <span className="text-red-800">{warning}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Resources */}
                        {currentStep.content.resources.length > 0 && (
                          <div>
                            <h3 className="font-semibold mb-3 flex items-center">
                              <ExternalLink className="h-5 w-5 mr-2" />
                              Resources
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {currentStep.content.resources.map((resource, index) => (
                                <Card key={index} className="p-4 hover:bg-gray-50 transition-colors">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <h4 className="font-medium text-sm">{resource.title}</h4>
                                      <p className="text-xs text-gray-600 mt-1">{resource.description}</p>
                                    </div>
                                    <div className="ml-2">
                                      {resource.type === 'LINK' && <ExternalLink className="h-4 w-4 text-blue-600" />}
                                      {resource.type === 'DOWNLOAD' && <Download className="h-4 w-4 text-green-600" />}
                                      {resource.type === 'INTERACTIVE' && <Play className="h-4 w-4 text-purple-600" />}
                                    </div>
                                  </div>
                                </Card>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Interactive Elements */}
                        <div className="space-y-4">
                          {/* Form */}
                          {currentStep.interactive.hasForm && currentStep.interactive.formFields.length > 0 && (
                            <div className="border rounded-lg p-6 bg-gray-50">
                              <h3 className="font-semibold mb-4">Complete This Step</h3>
                              <div className="space-y-4">
                                {currentStep.interactive.formFields.map((field, index) => (
                                  <div key={index}>
                                    <Label htmlFor={field.label} className="text-sm font-medium">
                                      {field.label}
                                      {field.required && <span className="text-red-500 ml-1">*</span>}
                                    </Label>
                                    {field.type === 'TEXT' && (
                                      <Input
                                        id={field.label}
                                        type="text"
                                        value={formData[field.label] || ''}
                                        onChange={(e) => handleFormChange(field.label, e.target.value)}
                                        className="mt-1"
                                      />
                                    )}
                                    {field.type === 'DATE' && (
                                      <Input
                                        id={field.label}
                                        type="date"
                                        value={formData[field.label] || ''}
                                        onChange={(e) => handleFormChange(field.label, e.target.value)}
                                        className="mt-1"
                                      />
                                    )}
                                    {field.type === 'SELECT' && (
                                      <Select 
                                        value={formData[field.label] || ''}
                                        onValueChange={(value) => handleFormChange(field.label, value)}
                                      >
                                        <SelectTrigger className="mt-1">
                                          <SelectValue placeholder="Select..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {field.options?.map((option) => (
                                            <SelectItem key={option} value={option}>
                                              {option}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    )}
                                  </div>
                                ))}
                                <Button 
                                  onClick={handleFormSubmit}
                                  disabled={isSubmitting}
                                  className="w-full"
                                >
                                  {isSubmitting ? (
                                    <>
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                      Submitting...
                                    </>
                                  ) : (
                                    'Submit Information'
                                  )}
                                </Button>
                              </div>
                            </div>
                          )}

                          {/* Quiz */}
                          {currentStep.interactive.hasQuiz && (
                            <div className="border rounded-lg p-6 bg-yellow-50">
                              <h3 className="font-semibold mb-4">Quick Knowledge Check</h3>
                              <p className="text-sm text-gray-600 mb-4">
                                Answer this quick question to ensure you understand the key concepts.
                              </p>
                              <div className="space-y-3">
                                <div className="text-sm font-medium">
                                  What is the most important aspect to remember from this step?
                                </div>
                                <div className="space-y-2">
                                  {['Read all instructions carefully', 'Ask questions if unclear', 'Follow up with resources'].map((option, index) => (
                                    <label key={index} className="flex items-center">
                                      <Checkbox className="mr-2" />
                                      <span className="text-sm">{option}</span>
                                    </label>
                                  ))}
                                </div>
                                <Button size="sm">Submit Answer</Button>
                              </div>
                            </div>
                          )}

                          {/* Calculator */}
                          {currentStep.interactive.hasCalculators && (
                            <div className="border rounded-lg p-6 bg-green-50">
                              <h3 className="font-semibold mb-4">Health Calculator</h3>
                              <p className="text-sm text-gray-600 mb-4">
                                Use this calculator to estimate your potential health improvements.
                              </p>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>Current Health Score</Label>
                                  <Input type="number" placeholder="Enter 0-100" className="mt-1" />
                                </div>
                                <div>
                                  <Label>Target Health Score</Label>
                                  <Input type="number" placeholder="Enter 0-100" className="mt-1" />
                                </div>
                              </div>
                              <Button size="sm" className="mt-4">Calculate Improvement</Button>
                            </div>
                          )}

                          {/* Checklist */}
                          {currentStep.interactive.hasChecklist && (
                            <div className="border rounded-lg p-6 bg-blue-50">
                              <h3 className="font-semibold mb-4">Action Checklist</h3>
                              <div className="space-y-3">
                                {currentStep.content.instructions.map((instruction, index) => (
                                  <label key={index} className="flex items-start">
                                    <Checkbox className="mr-3 mt-0.5" />
                                    <span className="text-sm">{instruction}</span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Navigation */}
                        <div className="flex items-center justify-between pt-6 border-t">
                          <Button
                            variant="outline"
                            onClick={handlePreviousStep}
                            disabled={currentStepIndex === 0}
                          >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Previous
                          </Button>
                          
                          <div className="text-sm text-gray-500">
                            Step {currentStepIndex + 1} of {totalSteps}
                          </div>
                          
                          {currentStepIndex < totalSteps - 1 ? (
                            <Button
                              onClick={handleNextStep}
                              disabled={!completedSteps.has(currentStep.id) && !allowSkipping}
                            >
                              Next
                              <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                          ) : (
                            <Button
                              onClick={() => handleStepComplete(currentStep.id)}
                              disabled={!completedSteps.has(currentStep.id) && !allowSkipping}
                            >
                              Complete Guide
                              <CheckCircle2 className="h-4 w-4 ml-2" />
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card>
                      <CardContent className="p-12 text-center">
                        <Award className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Guide Completed!</h3>
                        <p className="text-gray-600 mb-6">
                          Congratulations! You've successfully completed the {selectedGuide.title}.
                        </p>
                        <div className="space-y-4">
                          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <h4 className="font-semibold text-green-900 mb-2">What You've Accomplished:</h4>
                            <ul className="text-sm text-green-800 space-y-1">
                              {selectedGuide.outcomes.map((outcome, index) => (
                                <li key={index} className="flex items-center">
                                  <CheckCircle2 className="h-4 w-4 mr-2" />
                                  {outcome.description}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Button asChild>
                              <a href="/healthier-sg/progress">
                                <TrendingUp className="h-4 w-4 mr-2" />
                                View Progress
                              </a>
                            </Button>
                            <Button variant="outline" asChild>
                              <a href="/healthier-sg/next-steps">
                                <ArrowRight className="h-4 w-4 mr-2" />
                                Next Steps
                              </a>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Help Section */}
        <Card className="mt-12 bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Need Help with Your Guide?
              </h3>
              <p className="text-gray-600 mb-6">
                Our support team is here to help you navigate through any challenges
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild>
                  <a href="/contact">
                    <Users className="h-4 w-4 mr-2" />
                    Contact Support
                  </a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="/healthier-sg/faq">
                    <HelpCircle className="h-4 w-4 mr-2" />
                    Browse FAQ
                  </a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="tel:18008508000">
                    <Phone className="h-4 w-4 mr-2" />
                    Call 1800-850-8000
                  </a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Government Disclaimer */}
      {showGovernmentDisclaimer && (
        <div className="mt-16 bg-gray-100 border-t">
          <div className="container mx-auto px-6 py-6">
            <div className="max-w-4xl mx-auto text-center">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <Shield className="h-5 w-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Official Government Guide</span>
              </div>
              <p className="text-sm text-gray-600">
                This guide is provided by the Ministry of Health (MOH), Singapore. 
                Information is accurate as of November 2025. For current guidance, visit{' '}
                <a href="https://www.moh.gov.sg" className="text-blue-600 hover:underline">
                  moh.gov.sg
                </a>.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}