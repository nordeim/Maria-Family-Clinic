import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Plus, Target, CheckCircle, AlertCircle, Lightbulb, TrendingUp } from 'lucide-react'
import { trpc } from '@/lib/trpc/client'
import { toast } from '@/hooks/use-toast'
import type { HealthGoalsStep, HealthGoal, CustomGoal } from '../../types/registration'

export interface RegistrationStepGoalsProps {
  data: HealthGoalsStep | null
  onUpdate: (data: HealthGoalsStep) => void
  onNext: () => void
  eligibilityAssessmentId: string
  className?: string
}

const PREDEFINED_GOALS: HealthGoal[] = [
  // Weight Management
  {
    id: 'weight_loss_5kg',
    category: 'weight_management',
    title: 'Lose 5kg in 6 months',
    description: 'Achieve healthy weight through balanced diet and exercise',
    measurable: true,
    target: 'Lose 5kg (11 lbs) weight',
    timeline: '6 months',
  },
  {
    id: 'weight_maintenance',
    category: 'weight_management',
    title: 'Maintain healthy weight',
    description: 'Keep weight within healthy BMI range',
    measurable: true,
    target: 'BMI 18.5-24.9',
    timeline: 'Ongoing',
  },
  
  // Blood Pressure
  {
    id: 'blood_pressure_control',
    category: 'blood_pressure',
    title: 'Control blood pressure',
    description: 'Achieve and maintain healthy blood pressure levels',
    measurable: true,
    target: 'Below 140/90 mmHg',
    timeline: '3 months',
  },
  
  // Diabetes Management
  {
    id: 'blood_sugar_control',
    category: 'diabetes',
    title: 'Control blood sugar levels',
    description: 'Maintain healthy HbA1c and fasting glucose levels',
    measurable: true,
    target: 'HbA1c < 7%',
    timeline: '3 months',
  },
  
  // Cholesterol
  {
    id: 'cholesterol_reduction',
    category: 'cholesterol',
    title: 'Reduce cholesterol levels',
    description: 'Lower LDL and increase HDL cholesterol',
    measurable: true,
    target: 'LDL < 100 mg/dL',
    timeline: '6 months',
  },
  
  // Exercise
  {
    id: 'exercise_150_minutes',
    category: 'exercise',
    title: 'Exercise 150 minutes weekly',
    description: 'Moderate-intensity aerobic activity',
    measurable: true,
    target: '150 minutes/week',
    timeline: 'Ongoing',
  },
  {
    id: 'strength_training',
    category: 'exercise',
    title: 'Strength training 2x per week',
    description: 'Build muscle strength and bone density',
    measurable: true,
    target: '2 sessions/week',
    timeline: 'Ongoing',
  },
  
  // Nutrition
  {
    id: 'balanced_diet',
    category: 'nutrition',
    title: 'Eat balanced diet',
    description: 'Include fruits, vegetables, whole grains daily',
    measurable: true,
    target: '5 servings fruits/veg daily',
    timeline: 'Ongoing',
  },
  {
    id: 'reduce_processed_food',
    category: 'nutrition',
    title: 'Reduce processed foods',
    description: 'Limit ultra-processed and high-sugar foods',
    measurable: true,
    target: '< 10% calories from added sugars',
    timeline: 'Ongoing',
  },
  
  // Mental Health
  {
    id: 'stress_management',
    category: 'mental_health',
    title: 'Better stress management',
    description: 'Learn and practice stress reduction techniques',
    measurable: false,
    target: 'Practice mindfulness daily',
    timeline: 'Ongoing',
  },
  {
    id: 'improve_sleep',
    category: 'mental_health',
    title: 'Improve sleep quality',
    description: 'Achieve 7-8 hours of quality sleep',
    measurable: true,
    target: '7-8 hours sleep nightly',
    timeline: '2 months',
  },
  
  // Smoking Cessation
  {
    id: 'quit_smoking',
    category: 'smoking',
    title: 'Quit smoking completely',
    description: 'Stop smoking and use of tobacco products',
    measurable: true,
    target: '0 cigarettes/day',
    timeline: '6 months',
  },
  
  // Sleep
  {
    id: 'sleep_hygiene',
    category: 'sleep',
    title: 'Improve sleep hygiene',
    description: 'Establish healthy sleep routines',
    measurable: true,
    target: 'Consistent bedtime and wake time',
    timeline: '1 month',
  },
]

const LIFESTYLE_FACTORS = [
  {
    type: 'smoking' as const,
    currentOptions: ['Never smoked', 'Former smoker', 'Current smoker (light)', 'Current smoker (heavy)'],
  },
  {
    type: 'alcohol' as const,
    currentOptions: ['No alcohol', 'Occasional (1-2 drinks/week)', 'Moderate (3-7 drinks/week)', 'Heavy (>7 drinks/week)'],
  },
  {
    type: 'exercise' as const,
    currentOptions: ['No exercise', 'Light (1-2 times/week)', 'Moderate (3-4 times/week)', 'Regular (5+ times/week)'],
  },
  {
    type: 'diet' as const,
    currentOptions: ['Poor diet', 'Fair diet', 'Good diet', 'Excellent diet'],
  },
  {
    type: 'sleep' as const,
    currentOptions: ['<5 hours', '5-6 hours', '7-8 hours', '>8 hours'],
  },
  {
    type: 'stress' as const,
    currentOptions: ['Very high', 'High', 'Moderate', 'Low'],
  },
]

export const RegistrationStepGoals: React.FC<RegistrationStepGoalsProps> = ({
  data,
  onUpdate,
  onNext,
  eligibilityAssessmentId,
  className = '',
}) => {
  const [formData, setFormData] = useState<HealthGoalsStep>(
    data || {
      selectedGoals: [],
      customGoals: [],
      priorityLevel: 'medium',
      timeFrame: '6months',
      lifestyleFactors: [],
      riskFactors: [],
    }
  )

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showCustomGoalForm, setShowCustomGoalForm] = useState(false)
  const [customGoal, setCustomGoal] = useState<Partial<CustomGoal>>({
    title: '',
    description: '',
    target: '',
    timeline: '',
    priority: 'medium',
  })

  // Get user's health profile for context
  const { data: profile } = trpc.user.getProfile.useQuery()
  const { data: eligibility } = trpc.healthierSg.getEligibilitySummary.useQuery()

  // Get available goals based on eligibility
  const getRelevantGoals = () => {
    const relevantIds: string[] = []
    
    // Always include basic health goals
    relevantIds.push(
      'weight_maintenance',
      'exercise_150_minutes',
      'balanced_diet',
      'stress_management',
      'improve_sleep'
    )

    // Add condition-specific goals
    if (eligibility?.eligibilityReason?.includes('chronic')) {
      relevantIds.push(
        'blood_pressure_control',
        'blood_sugar_control',
        'cholesterol_reduction'
      )
    }

    return PREDEFINED_GOALS.filter(goal => relevantIds.includes(goal.id))
  }

  const handleGoalSelection = (goal: HealthGoal, selected: boolean) => {
    if (selected) {
      setFormData(prev => ({
        ...prev,
        selectedGoals: [...prev.selectedGoals, goal],
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        selectedGoals: prev.selectedGoals.filter(g => g.id !== goal.id),
      }))
    }
  }

  const handleCustomGoalAdd = () => {
    if (!customGoal.title?.trim() || !customGoal.target?.trim()) {
      toast({
        title: "Incomplete Goal",
        description: "Please provide both title and target for custom goal.",
        variant: "destructive",
      })
      return
    }

    const newCustomGoal: CustomGoal = {
      id: `custom-${Date.now()}`,
      title: customGoal.title,
      description: customGoal.description || '',
      target: customGoal.target,
      timeline: customGoal.timeline || '3 months',
      priority: customGoal.priority || 'medium',
    }

    setFormData(prev => ({
      ...prev,
      customGoals: [...prev.customGoals, newCustomGoal],
    }))

    setCustomGoal({
      title: '',
      description: '',
      target: '',
      timeline: '',
      priority: 'medium',
    })
    setShowCustomGoalForm(false)

    toast({
      title: "Custom Goal Added",
      description: "Your custom health goal has been added successfully.",
    })
  }

  const removeCustomGoal = (goalId: string) => {
    setFormData(prev => ({
      ...prev,
      customGoals: prev.customGoals.filter(g => g.id !== goalId),
    }))
  }

  const handleLifestyleFactorChange = (type: string, field: string, value: string) => {
    setFormData(prev => {
      const existingIndex = prev.lifestyleFactors.findIndex(f => f.type === type)
      const newFactor = {
        type: type as any,
        current: field === 'current' ? value : '',
        goal: field === 'goal' ? value : '',
        barriers: [],
        support: [],
      }

      if (existingIndex >= 0) {
        const updated = [...prev.lifestyleFactors]
        updated[existingIndex] = {
          ...updated[existingIndex],
          [field]: value,
        }
        return {
          ...prev,
          lifestyleFactors: updated,
        }
      } else {
        return {
          ...prev,
          lifestyleFactors: [...prev.lifestyleFactors, newFactor],
        }
      }
    })
  }

  const getCompletionScore = () => {
    let score = 0
    
    // Goals selection
    if (formData.selectedGoals.length >= 3) score += 25
    else if (formData.selectedGoals.length >= 1) score += 15
    
    // Custom goals
    if (formData.customGoals.length > 0) score += 15
    
    // Lifestyle factors
    if (formData.lifestyleFactors.length >= 3) score += 25
    else if (formData.lifestyleFactors.length >= 1) score += 15
    
    // Priority and time frame
    if (formData.priorityLevel && formData.timeFrame) score += 20
    
    // Risk factors (optional)
    if (formData.riskFactors.length > 0) score += 15
    
    return Math.min(score, 100)
  }

  const handleSubmit = async () => {
    try {
      // Save goals to backend
      await trpc.healthierSg.saveHealthGoals.mutateAsync({
        eligibilityAssessmentId,
        goalsData: formData,
      })

      onUpdate(formData)
      toast({
        title: "Health Goals Saved",
        description: "Your health goals have been saved successfully.",
      })

      onNext()
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save health goals. Please try again.",
        variant: "destructive",
      })
    }
  }

  const relevantGoals = getRelevantGoals()
  const completionScore = getCompletionScore()

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Step Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold">Health Goals & Lifestyle</h3>
        </div>
        <Badge variant={completionScore >= 70 ? 'default' : 'secondary'}>
          {completionScore}% Complete
        </Badge>
      </div>

      {/* Optional Notice */}
      <Alert>
        <Lightbulb className="h-4 w-4" />
        <AlertDescription>
          This step is optional but helps us personalize your Healthier SG experience. 
          You can set goals now or anytime during your program participation.
        </AlertDescription>
      </Alert>

      {/* Priority and Time Frame */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Program Commitment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Priority Level</Label>
              <Select
                value={formData.priorityLevel}
                onValueChange={(value: any) => 
                  setFormData(prev => ({ ...prev, priorityLevel: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low - General health interest</SelectItem>
                  <SelectItem value="medium">Medium - Committed to improvement</SelectItem>
                  <SelectItem value="high">High - Active health management</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Target Time Frame</Label>
              <Select
                value={formData.timeFrame}
                onValueChange={(value: any) => 
                  setFormData(prev => ({ ...prev, timeFrame: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3months">3 months</SelectItem>
                  <SelectItem value="6months">6 months</SelectItem>
                  <SelectItem value="1year">1 year</SelectItem>
                  <SelectItem value="longterm">Long-term</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Health Goals Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Select Health Goals</CardTitle>
          <p className="text-sm text-gray-600">
            Choose goals that are most relevant to your health journey (recommended: 3-5 goals)
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {relevantGoals.map((goal) => (
              <div key={goal.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id={goal.id}
                    checked={formData.selectedGoals.some(g => g.id === goal.id)}
                    onCheckedChange={(checked) => 
                      handleGoalSelection(goal, checked as boolean)
                    }
                  />
                  <div className="flex-1">
                    <Label htmlFor={goal.id} className="font-medium cursor-pointer">
                      {goal.title}
                    </Label>
                    <p className="text-sm text-gray-600 mt-1">{goal.description}</p>
                    {goal.measurable && goal.target && (
                      <Badge variant="outline" className="mt-2">
                        Target: {goal.target}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add Custom Goal */}
          <div className="mt-6">
            {!showCustomGoalForm ? (
              <Button
                variant="outline"
                onClick={() => setShowCustomGoalForm(true)}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Custom Goal
              </Button>
            ) : (
              <Card className="border-dashed">
                <CardHeader>
                  <CardTitle className="text-base">Create Custom Goal</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Goal Title *</Label>
                      <Input
                        value={customGoal.title || ''}
                        onChange={(e) => setCustomGoal(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="e.g., Improve flexibility"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Timeline</Label>
                      <Select
                        value={customGoal.timeline || ''}
                        onValueChange={(value) => setCustomGoal(prev => ({ ...prev, timeline: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select timeline" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1 month">1 month</SelectItem>
                          <SelectItem value="3 months">3 months</SelectItem>
                          <SelectItem value="6 months">6 months</SelectItem>
                          <SelectItem value="1 year">1 year</SelectItem>
                          <SelectItem value="Ongoing">Ongoing</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={customGoal.description || ''}
                      onChange={(e) => setCustomGoal(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe your goal in detail"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Specific Target *</Label>
                    <Input
                      value={customGoal.target || ''}
                      onChange={(e) => setCustomGoal(prev => ({ ...prev, target: e.target.value }))}
                      placeholder="e.g., Touch toes without bending knees"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select
                      value={customGoal.priority || 'medium'}
                      onValueChange={(value: any) => setCustomGoal(prev => ({ ...prev, priority: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleCustomGoalAdd} size="sm">
                      Add Goal
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowCustomGoalForm(false)
                        setCustomGoal({
                          title: '',
                          description: '',
                          target: '',
                          timeline: '',
                          priority: 'medium',
                        })
                      }}
                      size="sm"
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Custom Goals Display */}
          {formData.customGoals.length > 0 && (
            <div className="mt-6 space-y-3">
              <h4 className="font-medium">Custom Goals</h4>
              {formData.customGoals.map((goal) => (
                <div key={goal.id} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h5 className="font-medium">{goal.title}</h5>
                      <p className="text-sm text-gray-600 mt-1">{goal.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline">{goal.target}</Badge>
                        <Badge variant="outline">{goal.timeline}</Badge>
                        <Badge variant="outline">{goal.priority} priority</Badge>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCustomGoal(goal.id)}
                    >
                      ×
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lifestyle Factors */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Current Lifestyle Factors
          </CardTitle>
          <p className="text-sm text-gray-600">
            Understanding your current lifestyle helps us provide better support
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {LIFESTYLE_FACTORS.map((factor) => {
            const existing = formData.lifestyleFactors.find(f => f.type === factor.type)
            
            return (
              <div key={factor.type} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="capitalize">{factor.type}</Label>
                  <Select
                    value={existing?.current || ''}
                    onValueChange={(value) => 
                      handleLifestyleFactorChange(factor.type, 'current', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Current status" />
                    </SelectTrigger>
                    <SelectContent>
                      {factor.currentOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Continue Button */}
      <div className="flex items-center justify-between pt-6 border-t">
        <div className="flex items-center gap-2 text-blue-600">
          <CheckCircle className="h-4 w-4" />
          <span className="text-sm font-medium">
            {formData.selectedGoals.length + formData.customGoals.length} goals selected
          </span>
        </div>

        <Button 
          onClick={handleSubmit}
          className="min-w-32"
        >
          Continue
        </Button>
      </div>
    </div>
  )
}