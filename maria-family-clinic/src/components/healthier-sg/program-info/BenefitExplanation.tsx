// Healthier SG Benefits Explanation Component
// Interactive benefit explanation with visual guides and calculation tools

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Calculator, 
  DollarSign, 
  Heart, 
  Shield, 
  Users, 
  Clock,
  CheckCircle2,
  Info,
  TrendingUp,
  FileText,
  Play,
  X,
  ExternalLink
} from 'lucide-react'
import { BenefitExplanation, ProgramInfoComponentProps } from './types'

// Mock benefit explanations data
const mockBenefitExplanations: BenefitExplanation[] = [
  {
    id: 'health-screening',
    title: 'Comprehensive Health Screening',
    category: 'PREVENTIVE',
    description: 'Free health screening for early detection of chronic diseases and health risk assessment. Includes blood tests, BMI assessment, and lifestyle evaluation.',
    visualGuide: {
      type: 'INFOGRAPHIC',
      url: '/images/healthier-sg/screening-guide.png',
      altText: 'Health screening process flowchart showing steps from registration to results',
      interactiveElements: [
        {
          id: 'step1',
          type: 'POPUP',
          title: 'Registration',
          content: 'Register through MyInfo or at participating clinics. Simple 5-minute process.',
          position: { x: 15, y: 20, width: 25, height: 15 }
        },
        {
          id: 'step2',
          type: 'POPUP',
          title: 'Health Assessment',
          content: 'Complete comprehensive health questionnaire covering medical history, lifestyle, and risk factors.',
          position: { x: 45, y: 20, width: 25, height: 15 }
        },
        {
          id: 'step3',
          type: 'POPUP',
          title: 'Clinical Tests',
          content: 'Blood pressure, cholesterol, blood sugar tests and other relevant screening based on age and risk factors.',
          position: { x: 75, y: 20, width: 25, height: 15 }
        }
      ]
    },
    calculationTools: [
      {
        type: 'SAVINGS_CALCULATOR',
        title: 'Health Screening Savings Calculator',
        description: 'Calculate your potential savings on health screening costs',
        inputs: [
          {
            label: 'Your Age Group',
            type: 'SELECT',
            options: [
              { value: '18-39', label: '18-39 years' },
              { value: '40-59', label: '40-59 years' },
              { value: '60+', label: '60+ years' }
            ],
            defaultValue: '40-59',
            required: true
          },
          {
            label: 'Risk Level',
            type: 'SELECT',
            options: [
              { value: 'low', label: 'Low Risk' },
              { value: 'moderate', label: 'Moderate Risk' },
              { value: 'high', label: 'High Risk' }
            ],
            defaultValue: 'moderate',
            required: true
          }
        ],
        calculationLogic: {
          formula: 'screening_cost - subsidy_amount',
          variables: {
            '18-39': { screening_cost: 150, subsidy_amount: 120 },
            '40-59': { screening_cost: 250, subsidy_amount: 200 },
            '60+': { screening_cost: 350, subsidy_amount: 300 }
          }
        }
      }
    ],
    eligibilityCriteria: [
      {
        criterion: 'Age Requirement',
        description: '18 years and above',
        required: true
      },
      {
        criterion: 'Residency Status',
        description: 'Singapore Citizen or Permanent Resident',
        required: true
      },
      {
        criterion: 'Registration Period',
        description: 'Must register within designated enrollment periods',
        required: false
      }
    ],
    relatedPrograms: ['chronic-disease-management', 'vaccination-program'],
    frequentlyAsked: [
      {
        question: 'How often can I get free health screening?',
        answer: 'You can receive free comprehensive health screening once per enrollment cycle, typically every 2-3 years depending on your age and risk factors.',
        category: 'screening-frequency'
      },
      {
        question: 'What if abnormal results are found?',
        answer: 'If screening results indicate potential health issues, your family doctor will discuss follow-up care options and any additional tests needed.',
        category: 'follow-up-care'
      }
    ]
  },
  {
    id: 'chronic-disease-management',
    title: 'Chronic Disease Management',
    category: 'HEALTH',
    description: 'Comprehensive management of chronic conditions like diabetes, hypertension, and heart disease with ongoing monitoring and support.',
    visualGuide: {
      type: 'INTERACTIVE',
      url: '/images/healthier-sg/chronic-care.png',
      altText: 'Chronic disease management care pathway',
      interactiveElements: []
    },
    calculationTools: [
      {
        type: 'BENEFIT_ESTIMATOR',
        title: 'Chronic Disease Management Savings',
        description: 'Estimate your savings on chronic disease care',
        inputs: [
          {
            label: 'Number of Chronic Conditions',
            type: 'SELECT',
            options: [
              { value: '1', label: '1 condition' },
              { value: '2', label: '2 conditions' },
              { value: '3+', label: '3 or more conditions' }
            ],
            defaultValue: '1',
            required: true
          },
          {
            label: 'Current Monthly Medication Cost',
            type: 'NUMBER',
            defaultValue: 50,
            required: true
          },
          {
            label: 'Annual Doctor Visits',
            type: 'SELECT',
            options: [
              { value: '4', label: 'Quarterly (4 visits)' },
              { value: '6', label: 'Bi-monthly (6 visits)' },
              { value: '12', label: 'Monthly (12 visits)' }
            ],
            defaultValue: '4',
            required: true
          }
        ],
        calculationLogic: {
          formula: 'medication_savings + consultation_savings + procedure_savings',
          variables: {
            medication_savings: 'monthly_cost * 12 * 0.7', // 70% subsidy
            consultation_savings: 'doctor_visits * 35', // 90% subsidy on consultations
            procedure_savings: 'conditions * 200' // Additional procedure subsidies
          }
        }
      }
    ],
    eligibilityCriteria: [
      {
        criterion: 'Chronic Condition',
        description: 'Diagnosed with eligible chronic conditions (diabetes, hypertension, etc.)',
        required: true
      },
      {
        criterion: 'Care Plan Agreement',
        description: 'Must follow agreed care plan with family doctor',
        required: true
      }
    ],
    relatedPrograms: ['health-screening', 'medication-subsidies'],
    frequentlyAsked: [
      {
        question: 'Which chronic conditions are covered?',
        answer: 'Covered conditions include diabetes, hypertension, high cholesterol, heart disease, asthma, and kidney disease.',
        category: 'coverage'
      }
    ]
  }
]

export const BenefitExplanation: React.FC<ProgramInfoComponentProps> = ({
  className = '',
  language = 'en',
  userType = 'citizen',
  isMobile = false,
  showGovernmentDisclaimer = true,
  enableAnalytics = true
}) => {
  const [selectedBenefit, setSelectedBenefit] = useState<BenefitExplanation | null>(null)
  const [calculatorInputs, setCalculatorInputs] = useState<Record<string, any>>({})
  const [calculationResult, setCalculationResult] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading benefits data
    const loadBenefits = async () => {
      setLoading(true)
      await new Promise(resolve => setTimeout(resolve, 500))
      setSelectedBenefit(mockBenefitExplanations[0])
      setLoading(false)
    }
    loadBenefits()
  }, [])

  const handleCalculatorChange = (field: string, value: any) => {
    const newInputs = { ...calculatorInputs, [field]: value }
    setCalculatorInputs(newInputs)
    
    // Auto-calculate if we have a calculator tool and required inputs
    if (selectedBenefit?.calculationTools && selectedBenefit.calculationTools.length > 0) {
      calculateSavings(newInputs)
    }
  }

  const calculateSavings = (inputs: Record<string, any>) => {
    if (!selectedBenefit || !selectedBenefit.calculationTools.length) return

    const calculator = selectedBenefit.calculationTools[0] // Use first calculator
    let result = 0

    if (calculator.type === 'SAVINGS_CALCULATOR') {
      const ageGroup = inputs['Your Age Group'] || '40-59'
      const riskLevel = inputs['Risk Level'] || 'moderate'
      
      // Base calculation
      const baseCost = calculator.calculationLogic.variables[ageGroup].screening_cost
      const subsidy = calculator.calculationLogic.variables[ageGroup].subsidy_amount
      result = baseCost - subsidy

      // Risk level adjustment
      if (riskLevel === 'low') result *= 0.8
      else if (riskLevel === 'high') result *= 1.2
    } else if (calculator.type === 'BENEFIT_ESTIMATOR') {
      const conditions = parseInt(inputs['Number of Chronic Conditions'] || '1')
      const monthlyCost = inputs['Current Monthly Medication Cost'] || 50
      const visits = parseInt(inputs['Annual Doctor Visits'] || '4')
      
      const medicationSavings = monthlyCost * 12 * 0.7
      const consultationSavings = visits * 35
      const procedureSavings = conditions * 200
      
      result = medicationSavings + consultationSavings + procedureSavings
    }

    setCalculationResult(Math.round(result))
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'FINANCIAL': return <DollarSign className="h-5 w-5" />
      case 'HEALTH': return <Heart className="h-5 w-5" />
      case 'PREVENTIVE': return <Shield className="h-5 w-5" />
      case 'ACCESS': return <Users className="h-5 w-5" />
      case 'QUALITY': return <CheckCircle2 className="h-5 w-5" />
      case 'CONVENIENCE': return <Clock className="h-5 w-5" />
      default: return <Info className="h-5 w-5" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'FINANCIAL': return 'bg-green-100 text-green-800'
      case 'HEALTH': return 'bg-red-100 text-red-800'
      case 'PREVENTIVE': return 'bg-blue-100 text-blue-800'
      case 'ACCESS': return 'bg-purple-100 text-purple-800'
      case 'QUALITY': return 'bg-orange-100 text-orange-800'
      case 'CONVENIENCE': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className={`container mx-auto p-6 ${className}`}>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Healthier SG Benefits</h1>
          <p className="text-lg text-gray-600">
            Understand your benefits with interactive guides and calculation tools
          </p>
        </div>

        {/* Benefit Selector */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Select a Benefit to Explore
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mockBenefitExplanations.map((benefit) => (
                  <Card 
                    key={benefit.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedBenefit?.id === benefit.id ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => setSelectedBenefit(benefit)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center">
                          {getCategoryIcon(benefit.category)}
                          <Badge 
                            variant="secondary" 
                            className={`ml-2 ${getCategoryColor(benefit.category)}`}
                          >
                            {benefit.category}
                          </Badge>
                        </div>
                        <TrendingUp className="h-4 w-4 text-gray-400" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                      <p className="text-sm text-gray-600">{benefit.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Selected Benefit Details */}
        {selectedBenefit && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="guide">Visual Guide</TabsTrigger>
                  <TabsTrigger value="faq">FAQ</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        {getCategoryIcon(selectedBenefit.category)}
                        <span className="ml-2">{selectedBenefit.title}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <p className="text-gray-700">{selectedBenefit.description}</p>

                      {/* Eligibility Criteria */}
                      <div>
                        <h3 className="text-lg font-semibold mb-3">Eligibility Requirements</h3>
                        <div className="space-y-3">
                          {selectedBenefit.eligibilityCriteria.map((criteria, index) => (
                            <div key={index} className="flex items-start">
                              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                              <div>
                                <div className="font-medium">
                                  {criteria.criterion}
                                  {criteria.required && <span className="text-red-500 ml-1">*</span>}
                                </div>
                                <div className="text-sm text-gray-600">{criteria.description}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Related Programs */}
                      <div>
                        <h3 className="text-lg font-semibold mb-3">Related Programs</h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedBenefit.relatedPrograms.map((program, index) => (
                            <Badge key={index} variant="outline">
                              {program.replace('-', ' ')}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="guide" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Play className="h-5 w-5 mr-2" />
                        Interactive Visual Guide
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="relative bg-gray-100 rounded-lg p-6">
                        {/* Visual Guide Placeholder */}
                        <div className="aspect-video bg-gradient-to-br from-blue-100 to-green-100 rounded-lg flex items-center justify-center">
                          <div className="text-center">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                              <Play className="h-8 w-8 text-blue-600" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">
                              {selectedBenefit.visualGuide.type} Guide
                            </h3>
                            <p className="text-gray-600">
                              Interactive guide showing how {selectedBenefit.title.toLowerCase()} works
                            </p>
                            <Button className="mt-4" size="sm">
                              Start Interactive Guide
                            </Button>
                          </div>
                        </div>

                        {/* Interactive Elements */}
                        {selectedBenefit.visualGuide.interactiveElements && (
                          <div className="mt-6">
                            <h4 className="font-semibold mb-3">Click on the hotspots below to learn more:</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {selectedBenefit.visualGuide.interactiveElements.map((element) => (
                                <Card key={element.id} className="p-4">
                                  <h5 className="font-medium mb-2">{element.title}</h5>
                                  <p className="text-sm text-gray-600">{element.content}</p>
                                </Card>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="faq" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Frequently Asked Questions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {selectedBenefit.frequentlyAsked.map((faq, index) => (
                          <div key={index} className="border-b pb-4 last:border-b-0">
                            <h4 className="font-semibold mb-2">{faq.question}</h4>
                            <p className="text-gray-700">{faq.answer}</p>
                            {faq.category && (
                              <Badge variant="secondary" className="mt-2 text-xs">
                                {faq.category.replace('-', ' ')}
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Calculator Sidebar */}
            <div className="lg:col-span-1">
              <Card className="sticky top-6">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calculator className="h-5 w-5 mr-2" />
                    Calculator
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedBenefit.calculationTools && selectedBenefit.calculationTools.length > 0 ? (
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">
                          {selectedBenefit.calculationTools[0].title}
                        </h4>
                        <p className="text-sm text-gray-600 mb-4">
                          {selectedBenefit.calculationTools[0].description}
                        </p>
                      </div>

                      {/* Calculator Inputs */}
                      <div className="space-y-4">
                        {selectedBenefit.calculationTools[0].inputs.map((input) => (
                          <div key={input.label}>
                            <Label htmlFor={input.label} className="text-sm font-medium">
                              {input.label}
                              {input.required && <span className="text-red-500 ml-1">*</span>}
                            </Label>
                            {input.type === 'SELECT' ? (
                              <Select 
                                value={calculatorInputs[input.label] || input.defaultValue?.toString()}
                                onValueChange={(value) => handleCalculatorChange(input.label, value)}
                              >
                                <SelectTrigger className="mt-1">
                                  <SelectValue placeholder="Select..." />
                                </SelectTrigger>
                                <SelectContent>
                                  {input.options?.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <Input
                                id={input.label}
                                type={input.type === 'NUMBER' ? 'number' : 'text'}
                                value={calculatorInputs[input.label] || input.defaultValue || ''}
                                onChange={(e) => handleCalculatorChange(input.label, e.target.value)}
                                className="mt-1"
                                placeholder={`Enter ${input.label.toLowerCase()}`}
                              />
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Results */}
                      {calculationResult !== null && (
                        <div className="mt-6 p-4 bg-green-50 rounded-lg">
                          <h4 className="font-semibold text-green-800 mb-2">Estimated Savings</h4>
                          <div className="text-2xl font-bold text-green-600">
                            ${calculationResult.toLocaleString()}
                          </div>
                          <p className="text-sm text-green-700 mt-1">
                            Annual savings through Healthier SG benefits
                          </p>
                        </div>
                      )}

                      <Button 
                        className="w-full" 
                        onClick={() => calculateSavings(calculatorInputs)}
                      >
                        Calculate Savings
                      </Button>

                      {/* Disclaimer */}
                      <div className="mt-4 text-xs text-gray-500 p-3 bg-gray-50 rounded">
                        <p>
                          * Estimates are for illustration purposes only. Actual benefits may vary based on 
                          individual circumstances and current government policies.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Calculator className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Calculator not available for this benefit</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>

      {/* Government Disclaimer */}
      {showGovernmentDisclaimer && (
        <div className="mt-16 bg-gray-100 border-t">
          <div className="container mx-auto px-6 py-6">
            <div className="max-w-4xl mx-auto text-center">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <Shield className="h-5 w-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Official Government Information</span>
              </div>
              <p className="text-sm text-gray-600">
                This information is provided by the Ministry of Health (MOH), Singapore. 
                For current benefit amounts and eligibility criteria, please visit{' '}
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