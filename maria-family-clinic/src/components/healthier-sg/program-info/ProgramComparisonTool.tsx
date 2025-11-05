// Healthier SG Program Comparison Tool
// Interactive comparison of Healthier SG vs other programs with decision aids

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { 
  CheckCircle2, 
  X, 
  Star,
  DollarSign,
  Shield,
  Users,
  Clock,
  Heart,
  AlertCircle,
  TrendingUp,
  Info,
  ArrowRight,
  FileText,
  Zap
} from 'lucide-react'
import { ProgramInfoComponentProps } from './types'

// Program comparison data
const programComparisons = [
  {
    id: 'healthier-sg',
    name: 'Healthier SG',
    type: 'government',
    description: 'Singapore\'s national health programme for preventive care',
    icon: <Shield className="h-6 w-6" />,
    color: 'blue',
    overallScore: 95,
    advantages: [
      'Comprehensive preventive care',
      'Government subsidies up to 90%',
      'Personalized health plans',
      'Free health screenings',
      'Chronic disease management',
      'No age limits for enrollment'
    ],
    considerations: [
      'Must work with family doctor',
      'Requires commitment to health plan'
    ],
    costs: {
      enrollment: 'Free',
      annualFees: 'None',
      consultations: 'Up to 90% subsidy',
      medications: 'Medisave integration',
      screenings: 'Free for eligible participants'
    },
    benefits: {
      healthScreenings: { included: true, description: 'Comprehensive health screening' },
      chronicDiseaseManagement: { included: true, description: 'Chronic condition monitoring' },
      vaccinations: { included: true, description: 'Recommended vaccinations covered' },
      mentalHealthSupport: { included: true, description: 'Mental wellness programmes' },
      specialistReferrals: { included: true, description: 'Coordinated specialist care' },
      medicationSubsidies: { included: true, description: 'Medisave and subsidies' },
      healthCoaching: { included: true, description: 'Lifestyle coaching and support' }
    },
    eligibility: [
      'Singapore Citizens & PRs',
      '18 years and above',
      'Willing to commit to health plan'
    ],
    commitment: {
      minVisits: '4 per year',
      healthPlan: 'Required',
      screenings: 'Annual/bi-annual',
      followUp: 'Ongoing monitoring'
    }
  },
  {
    id: 'private-health-insurance',
    name: 'Private Health Insurance',
    type: 'private',
    description: 'Commercial health insurance plans from private insurers',
    icon: <Star className="h-6 w-6" />,
    color: 'gold',
    overallScore: 78,
    advantages: [
      'Choice of private hospitals',
      'Faster access to specialists',
      'More treatment options',
      'Private room accommodations'
    ],
    considerations: [
      'Higher monthly premiums',
      'Pre-existing conditions exclusions',
      'Annual coverage limits',
      'Complex claim procedures'
    ],
    costs: {
      enrollment: 'Varies by age',
      annualFees: '$500-$3000+',
      consultations: '$50-$200+',
      medications: 'Co-pay 10-30%',
      screenings: 'Subject to limits'
    },
    benefits: {
      healthScreenings: { included: true, description: 'Annual health screening' },
      chronicDiseaseManagement: { included: true, description: 'Treatment coverage' },
      vaccinations: { included: true, description: 'Basic vaccinations' },
      mentalHealthSupport: { included: true, description: 'Limited mental health' },
      specialistReferrals: { included: true, description: 'Direct specialist access' },
      medicationSubsidies: { included: true, description: 'Medication coverage' },
      healthCoaching: { included: false, description: 'Not typically included' }
    },
    eligibility: [
      'Medical underwriting required',
      'Age restrictions apply',
      'Pre-existing condition exclusions'
    ],
    commitment: {
      minVisits: 'As needed',
      healthPlan: 'Optional',
      screenings: 'Annual',
      followUp: 'Self-managed'
    }
  },
  {
    id: 'employer-health-benefits',
    name: 'Employer Health Benefits',
    type: 'employer',
    description: 'Company-provided health insurance and wellness programs',
    icon: <Users className="h-6 w-6" />,
    color: 'green',
    overallScore: 72,
    advantages: [
      'Employer pays premiums',
      'Group coverage benefits',
      'Wellness programs included',
      'Tax benefits'
    ],
    considerations: [
      'Coverage ends if you leave job',
      'Limited provider network',
      'Basic coverage only',
      'Dependent coverage extra cost'
    ],
    costs: {
      enrollment: 'Free',
      annualFees: 'Employer paid',
      consultations: '$20-$50 copay',
      medications: 'Generic medications',
      screenings: 'Basic screening only'
    },
    benefits: {
      healthScreenings: { included: true, description: 'Basic health screening' },
      chronicDiseaseManagement: { included: true, description: 'Basic treatment' },
      vaccinations: { included: true, description: 'Standard vaccinations' },
      mentalHealthSupport: { included: true, description: 'Employee assistance program' },
      specialistReferrals: { included: true, description: 'Network referrals only' },
      medicationSubsidies: { included: true, description: 'Generic medications' },
      healthCoaching: { included: true, description: 'Workplace wellness programs' }
    },
    eligibility: [
      'Full-time employment required',
      'Company must offer coverage',
      'Minimum employment period'
    ],
    commitment: {
      minVisits: 'As needed',
      healthPlan: 'Optional',
      screenings: 'Annual',
      followUp: 'Self-managed'
    }
  },
  {
    id: 'pay-as-you-go',
    name: 'Pay-As-You-Go Healthcare',
    type: 'out-of-pocket',
    description: 'Paying directly for healthcare services as needed',
    icon: <DollarSign className="h-6 w-6" />,
    color: 'gray',
    overallScore: 45,
    advantages: [
      'Complete flexibility',
      'No enrollment required',
      'Choose any provider',
      'No commitments'
    ],
    considerations: [
      'High out-of-pocket costs',
      'No preventive care focus',
      'No chronic disease management',
      'Financial risk for serious illness'
    ],
    costs: {
      enrollment: 'N/A',
      annualFees: 'N/A',
      consultations: '$30-$200+',
      medications: 'Full cost',
      screenings: 'Full cost unless preventive'
    },
    benefits: {
      healthScreenings: { included: false, description: 'Pay full cost' },
      chronicDiseaseManagement: { included: false, description: 'Self-pay required' },
      vaccinations: { included: false, description: 'Self-pay required' },
      mentalHealthSupport: { included: false, description: 'Not covered' },
      specialistReferrals: { included: false, description: 'No coordination' },
      medicationSubsidies: { included: false, description: 'No subsidies' },
      healthCoaching: { included: false, description: 'Not available' }
    },
    eligibility: [
      'Anyone can use this approach',
      'No restrictions'
    ],
    commitment: {
      minVisits: 'None',
      healthPlan: 'None',
      screenings: 'Self-initiated',
      followUp: 'Self-managed'
    }
  }
]

const comparisonCategories = [
  {
    id: 'costs',
    name: 'Cost & Financial Impact',
    icon: <DollarSign className="h-5 w-5" />,
    weight: 30
  },
  {
    id: 'benefits',
    name: 'Health Benefits Coverage',
    icon: <Heart className="h-5 w-5" />,
    weight: 40
  },
  {
    id: 'convenience',
    name: 'Convenience & Access',
    icon: <Clock className="h-5 w-5" />,
    weight: 20
  },
  {
    id: 'commitment',
    name: 'Long-term Commitment',
    icon: <FileText className="h-5 w-5" />,
    weight: 10
  }
]

interface ProgramComparisonToolProps extends ProgramInfoComponentProps {
  userHealthProfile?: {
    hasChronicConditions: boolean
    age: number
    income: 'low' | 'medium' | 'high'
    riskFactors: string[]
    healthGoals: string[]
  }
}

export type { ProgramComparisonToolProps }

export const ProgramComparisonTool: React.FC<ProgramComparisonToolProps> = ({
  className = '',
  language = 'en',
  userType = 'citizen',
  isMobile = false,
  showGovernmentDisclaimer = true,
  enableAnalytics = true,
  userHealthProfile = {
    hasChronicConditions: false,
    age: 40,
    income: 'medium',
    riskFactors: [],
    healthGoals: ['preventive-care', 'chronic-management']
  }
}) => {
  const [selectedPrograms, setSelectedPrograms] = useState<string[]>(['healthier-sg', 'private-health-insurance'])
  const [activeCategory, setActiveCategory] = useState('costs')
  const [comparisonResults, setComparisonResults] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Calculate personalized recommendations
    calculatePersonalizedScores()
  }, [selectedPrograms, userHealthProfile])

  const calculatePersonalizedScores = () => {
    setLoading(true)
    
    const results = programComparisons
      .filter(program => selectedPrograms.includes(program.id))
      .map(program => {
        let score = program.overallScore
        
        // Adjust scores based on user profile
        if (userHealthProfile.hasChronicConditions && program.benefits.chronicDiseaseManagement.included) {
          score += 10
        }
        
        if (userHealthProfile.age >= 40 && program.benefits.healthScreenings.included) {
          score += 8
        }
        
        if (userHealthProfile.income === 'low' && program.costs.annualFees === 'None') {
          score += 15
        } else if (userHealthProfile.income === 'high' && program.costs.annualFees === 'N/A') {
          score += 5
        }
        
        if (userHealthProfile.healthGoals.includes('preventive-care') && program.benefits.healthCoaching.included) {
          score += 10
        }
        
        return {
          ...program,
          personalizedScore: Math.min(score, 100),
          recommendation: score >= 85 ? 'Highly Recommended' : 
                        score >= 70 ? 'Recommended' : 
                        score >= 55 ? 'Consider' : 'Not Recommended'
        }
      })
      .sort((a, b) => b.personalizedScore - a.personalizedScore)
    
    setComparisonResults({ recommendations: results })
    setLoading(false)
  }

  const toggleProgram = (programId: string) => {
    const newSelection = selectedPrograms.includes(programId)
      ? selectedPrograms.filter(id => id !== programId)
      : [...selectedPrograms, programId]
    
    setSelectedPrograms(newSelection)
  }

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: 'border-blue-200 bg-blue-50',
      gold: 'border-yellow-200 bg-yellow-50',
      green: 'border-green-200 bg-green-50',
      gray: 'border-gray-200 bg-gray-50'
    }
    return colorMap[color as keyof typeof colorMap] || colorMap.blue
  }

  const getRecommendationBadge = (score: number) => {
    if (score >= 85) return <Badge className="bg-green-600">Highly Recommended</Badge>
    if (score >= 70) return <Badge className="bg-blue-600">Recommended</Badge>
    if (score >= 55) return <Badge className="bg-yellow-600">Consider</Badge>
    return <Badge className="bg-red-600">Not Recommended</Badge>
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Healthcare Programme Comparison</h1>
          <p className="text-lg text-gray-600">
            Compare Healthier SG with other healthcare options to make an informed decision
          </p>
        </div>

        {/* Program Selection */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle2 className="h-5 w-5 mr-2" />
              Select Programmes to Compare (Select at least 2)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {programComparisons.map((program) => (
                <Card 
                  key={program.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedPrograms.includes(program.id) 
                      ? 'ring-2 ring-blue-500 bg-blue-50' 
                      : 'hover:border-gray-300'
                  }`}
                  onClick={() => toggleProgram(program.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <Checkbox 
                          checked={selectedPrograms.includes(program.id)}
                          className="mr-3"
                        />
                        <div className={`p-2 rounded-lg ${getColorClasses(program.color)}`}>
                          {program.icon}
                        </div>
                      </div>
                      <Badge variant="outline">{program.type}</Badge>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{program.name}</h3>
                    <p className="text-sm text-gray-600">{program.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Comparison Categories */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {comparisonCategories.map((category) => (
              <Button
                key={category.id}
                variant={activeCategory === category.id ? 'default' : 'outline'}
                onClick={() => setActiveCategory(category.id)}
                className="flex items-center"
              >
                {category.icon}
                <span className="ml-2">{category.name}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Comparison Results */}
        {selectedPrograms.length >= 2 && (
          <div className="space-y-8">
            {/* Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Personalized Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {comparisonResults.recommendations?.map((program: any, index: number) => (
                      <div key={program.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center">
                          <div className={`p-2 rounded-lg mr-4 ${getColorClasses(program.color)}`}>
                            {program.icon}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h3 className="font-semibold">{program.name}</h3>
                              {getRecommendationBadge(program.personalizedScore)}
                            </div>
                            <p className="text-sm text-gray-600">{program.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900">
                            {program.personalizedScore}
                          </div>
                          <div className="text-sm text-gray-500">Personal Score</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Detailed Comparison */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Info className="h-5 w-5 mr-2" />
                  Detailed Comparison
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={activeCategory} className="w-full">
                  <TabsContent value="costs" className="mt-6">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3">Cost Category</th>
                            {selectedPrograms.map(programId => {
                              const program = programComparisons.find(p => p.id === programId)!
                              return <th key={programId} className="text-center py-3">{program.name}</th>
                            })}
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b">
                            <td className="py-3 font-medium">Enrollment Cost</td>
                            {selectedPrograms.map(programId => {
                              const program = programComparisons.find(p => p.id === programId)!
                              return <td key={programId} className="text-center py-3">{program.costs.enrollment}</td>
                            })}
                          </tr>
                          <tr className="border-b">
                            <td className="py-3 font-medium">Annual Fees</td>
                            {selectedPrograms.map(programId => {
                              const program = programComparisons.find(p => p.id === programId)!
                              return <td key={programId} className="text-center py-3">{program.costs.annualFees}</td>
                            })}
                          </tr>
                          <tr className="border-b">
                            <td className="py-3 font-medium">Consultations</td>
                            {selectedPrograms.map(programId => {
                              const program = programComparisons.find(p => p.id === programId)!
                              return <td key={programId} className="text-center py-3">{program.costs.consultations}</td>
                            })}
                          </tr>
                          <tr>
                            <td className="py-3 font-medium">Medications</td>
                            {selectedPrograms.map(programId => {
                              const program = programComparisons.find(p => p.id === programId)!
                              return <td key={programId} className="text-center py-3">{program.costs.medications}</td>
                            })}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </TabsContent>

                  <TabsContent value="benefits" className="mt-6">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3">Benefit</th>
                            {selectedPrograms.map(programId => {
                              const program = programComparisons.find(p => p.id === programId)!
                              return <th key={programId} className="text-center py-3">{program.name}</th>
                            })}
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b">
                            <td className="py-3 font-medium">Health Screenings</td>
                            {selectedPrograms.map(programId => {
                              const program = programComparisons.find(p => p.id === programId)!
                              const benefit = program.benefits.healthScreenings
                              return (
                                <td key={programId} className="text-center py-3">
                                  {benefit.included ? (
                                    <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
                                  ) : (
                                    <X className="h-5 w-5 text-red-500 mx-auto" />
                                  )}
                                </td>
                              )
                            })}
                          </tr>
                          <tr className="border-b">
                            <td className="py-3 font-medium">Chronic Disease Management</td>
                            {selectedPrograms.map(programId => {
                              const program = programComparisons.find(p => p.id === programId)!
                              const benefit = program.benefits.chronicDiseaseManagement
                              return (
                                <td key={programId} className="text-center py-3">
                                  {benefit.included ? (
                                    <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
                                  ) : (
                                    <X className="h-5 w-5 text-red-500 mx-auto" />
                                  )}
                                </td>
                              )
                            })}
                          </tr>
                          <tr className="border-b">
                            <td className="py-3 font-medium">Vaccinations</td>
                            {selectedPrograms.map(programId => {
                              const program = programComparisons.find(p => p.id === programId)!
                              const benefit = program.benefits.vaccinations
                              return (
                                <td key={programId} className="text-center py-3">
                                  {benefit.included ? (
                                    <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
                                  ) : (
                                    <X className="h-5 w-5 text-red-500 mx-auto" />
                                  )}
                                </td>
                              )
                            })}
                          </tr>
                          <tr>
                            <td className="py-3 font-medium">Health Coaching</td>
                            {selectedPrograms.map(programId => {
                              const program = programComparisons.find(p => p.id === programId)!
                              const benefit = program.benefits.healthCoaching
                              return (
                                <td key={programId} className="text-center py-3">
                                  {benefit.included ? (
                                    <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
                                  ) : (
                                    <X className="h-5 w-5 text-red-500 mx-auto" />
                                  )}
                                </td>
                              )
                            })}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </TabsContent>

                  <TabsContent value="convenience" className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {selectedPrograms.map(programId => {
                        const program = programComparisons.find(p => p.id === programId)!
                        return (
                          <Card key={programId} className="p-6">
                            <div className="flex items-center mb-4">
                              <div className={`p-2 rounded-lg mr-4 ${getColorClasses(program.color)}`}>
                                {program.icon}
                              </div>
                              <h3 className="text-lg font-semibold">{program.name}</h3>
                            </div>
                            <div className="space-y-3">
                              <div>
                                <div className="font-medium text-sm">Eligibility</div>
                                <div className="text-sm text-gray-600">
                                  {program.eligibility.join(', ')}
                                </div>
                              </div>
                              <div>
                                <div className="font-medium text-sm">Provider Access</div>
                                <div className="text-sm text-gray-600">
                                  {program.id === 'healthier-sg' && 'Network of participating family clinics'}
                                  {program.id === 'private-health-insurance' && 'Private hospitals & clinics'}
                                  {program.id === 'employer-health-benefits' && 'Employer network providers'}
                                  {program.id === 'pay-as-you-go' && 'Any healthcare provider'}
                                </div>
                              </div>
                            </div>
                          </Card>
                        )
                      })}
                    </div>
                  </TabsContent>

                  <TabsContent value="commitment" className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {selectedPrograms.map(programId => {
                        const program = programComparisons.find(p => p.id === programId)!
                        return (
                          <Card key={programId} className="p-6">
                            <div className="flex items-center mb-4">
                              <div className={`p-2 rounded-lg mr-4 ${getColorClasses(program.color)}`}>
                                {program.icon}
                              </div>
                              <h3 className="text-lg font-semibold">{program.name}</h3>
                            </div>
                            <div className="space-y-3">
                              <div>
                                <div className="font-medium text-sm">Minimum Visits Required</div>
                                <div className="text-sm text-gray-600">{program.commitment.minVisits}</div>
                              </div>
                              <div>
                                <div className="font-medium text-sm">Health Plan Requirement</div>
                                <div className="text-sm text-gray-600">{program.commitment.healthPlan}</div>
                              </div>
                              <div>
                                <div className="font-medium text-sm">Follow-up Schedule</div>
                                <div className="text-sm text-gray-600">{program.commitment.followUp}</div>
                              </div>
                            </div>
                          </Card>
                        )
                      })}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Decision Aid */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="h-5 w-5 mr-2" />
                  Decision Aid
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="font-semibold text-blue-900 mb-4">
                    Based on your profile, here's what we recommend:
                  </h3>
                  
                  {comparisonResults.recommendations && comparisonResults.recommendations.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                        <div>
                          <div className="font-medium">Primary Recommendation: {comparisonResults.recommendations[0].name}</div>
                          <div className="text-sm text-blue-700">
                            Best fit for your age ({userHealthProfile.age}), health goals, and financial situation.
                          </div>
                        </div>
                      </div>
                      
                      {comparisonResults.recommendations.length > 1 && (
                        <div className="flex items-start">
                          <Info className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                          <div>
                            <div className="font-medium">Alternative Option: {comparisonResults.recommendations[1].name}</div>
                            <div className="text-sm text-blue-700">
                              Consider as a secondary option or if your circumstances change.
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mt-6 flex flex-col sm:flex-row gap-3">
                    <Button asChild>
                      <a href="/healthier-sg/eligibility">
                        Check Healthier SG Eligibility
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                    <Button variant="outline" asChild>
                      <a href="/clinics">
                        Find Participating Clinics
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {selectedPrograms.length < 2 && (
          <Card>
            <CardContent className="p-8 text-center">
              <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Select at least 2 programmes</h3>
              <p className="text-gray-600">
                Choose multiple healthcare programmes to see a detailed comparison and receive personalized recommendations.
              </p>
            </CardContent>
          </Card>
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
                This comparison tool is for informational purposes. Program details are accurate as of November 2025. 
                For official information and current terms, please visit{' '}
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