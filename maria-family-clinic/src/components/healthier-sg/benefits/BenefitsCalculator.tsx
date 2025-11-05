"use client"

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { trpc } from '@/trpc/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Info, Calculator, TrendingUp, DollarSign, Users, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CalculatorInputs {
  participationTier: 'BASIC' | 'ENHANCED' | 'PREMIUM'
  healthGoals: string[]
  screeningFrequency: number
  familySize: number
  chronicConditions: number
  activityLevel: 'LOW' | 'MODERATE' | 'HIGH'
  communityParticipation: boolean
  healthEducation: boolean
}

interface BenefitsEstimate {
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

export default function BenefitsCalculator() {
  const { data: session } = useSession()
  const [calculatorInputs, setCalculatorInputs] = useState<CalculatorInputs>({
    participationTier: 'BASIC',
    healthGoals: [],
    screeningFrequency: 1,
    familySize: 1,
    chronicConditions: 0,
    activityLevel: 'MODERATE',
    communityParticipation: false,
    healthEducation: false
  })

  const [benefitsEstimate, setBenefitsEstimate] = useState<BenefitsEstimate>({
    tierBenefits: 0,
    healthGoalIncentives: 0,
    screeningRewards: 0,
    communityBonus: 0,
    educationBonus: 0,
    familySharingDiscount: 0,
    totalAnnualBenefits: 0,
    monthlyBenefit: 0,
    potentialSavings: 0,
    riskReduction: 0
  })

  // Health goal options
  const healthGoalOptions = [
    { id: 'weight_management', label: 'Weight Management', value: 150 },
    { id: 'blood_pressure', label: 'Blood Pressure Control', value: 200 },
    { id: 'diabetes', label: 'Diabetes Management', value: 250 },
    { id: 'cholesterol', label: 'Cholesterol Control', value: 175 },
    { id: 'physical_activity', label: 'Increase Physical Activity', value: 125 },
    { id: 'smoking_cessation', label: 'Smoking Cessation', value: 300 },
    { id: 'mental_health', label: 'Mental Health & Stress', value: 100 },
    { id: 'sleep_quality', label: 'Improve Sleep Quality', value: 75 }
  ]

  // Calculate benefits estimate based on inputs
  const calculateBenefits = () => {
    let tierBenefits = 0
    let healthGoalIncentives = 0
    let screeningRewards = 0
    let communityBonus = 0
    let educationBonus = 0
    let familySharingDiscount = 0

    // Tier-based base benefits
    switch (calculatorInputs.participationTier) {
      case 'BASIC':
        tierBenefits = 300
        break
      case 'ENHANCED':
        tierBenefits = 600
        break
      case 'PREMIUM':
        tierBenefits = 1000
        break
    }

    // Health goal incentives
    healthGoalIncentives = calculatorInputs.healthGoals.reduce((total, goal) => {
      const goalOption = healthGoalOptions.find(g => g.id === goal)
      return total + (goalOption?.value || 0)
    }, 0)

    // Screening rewards (more frequent = more rewards)
    screeningRewards = calculatorInputs.screeningFrequency * 75

    // Community participation bonus
    if (calculatorInputs.communityParticipation) {
      communityBonus = 150
    }

    // Health education bonus
    if (calculatorInputs.healthEducation) {
      educationBonus = 100
    }

    // Family sharing discount (larger families get better rates)
    if (calculatorInputs.familySize > 1) {
      familySharingDiscount = Math.min((calculatorInputs.familySize - 1) * 50, 200)
    }

    const totalAnnualBenefits = tierBenefits + healthGoalIncentives + screeningRewards + communityBonus + educationBonus
    const monthlyBenefit = totalAnnualBenefits / 12
    const potentialSavings = totalAnnualBenefits * 0.3 // 30% average healthcare cost reduction
    const riskReduction = calculatorInputs.chronicConditions * 15 // 15% risk reduction per chronic condition

    setBenefitsEstimate({
      tierBenefits,
      healthGoalIncentives,
      screeningRewards,
      communityBonus,
      educationBonus,
      familySharingDiscount,
      totalAnnualBenefits,
      monthlyBenefit,
      potentialSavings,
      riskReduction
    })
  }

  // Recalculate when inputs change
  useEffect(() => {
    calculateBenefits()
  }, [calculatorInputs])

  // Update specific input values
  const updateInput = (key: keyof CalculatorInputs, value: any) => {
    setCalculatorInputs(prev => ({ ...prev, [key]: value }))
  }

  const toggleHealthGoal = (goalId: string) => {
    setCalculatorInputs(prev => ({
      ...prev,
      healthGoals: prev.healthGoals.includes(goalId)
        ? prev.healthGoals.filter(g => g !== goalId)
        : [...prev.healthGoals, goalId]
    }))
  }

  return (
    <div className="space-y-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Benefits Calculator
          </CardTitle>
          <CardDescription>
            Estimate your potential Healthier SG benefits based on your participation choices and health goals.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your Participation Plan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Participation Tier */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Participation Tier</Label>
              <Select
                value={calculatorInputs.participationTier}
                onValueChange={(value: 'BASIC' | 'ENHANCED' | 'PREMIUM') => 
                  updateInput('participationTier', value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BASIC">
                    <div className="flex items-center justify-between w-full">
                      <span>Basic Tier</span>
                      <Badge variant="outline" className="ml-2">$300/year</Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="ENHANCED">
                    <div className="flex items-center justify-between w-full">
                      <span>Enhanced Tier</span>
                      <Badge variant="outline" className="ml-2">$600/year</Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="PREMIUM">
                    <div className="flex items-center justify-between w-full">
                      <span>Premium Tier</span>
                      <Badge variant="outline" className="ml-2">$1000/year</Badge>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Health Goals */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Health Goals</Label>
              <div className="grid grid-cols-2 gap-2">
                {healthGoalOptions.map((goal) => (
                  <Button
                    key={goal.id}
                    variant={calculatorInputs.healthGoals.includes(goal.id) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleHealthGoal(goal.id)}
                    className="justify-start text-left h-auto p-3"
                  >
                    <div className="text-left">
                      <div className="text-sm">{goal.label}</div>
                      <div className="text-xs text-muted-foreground">+${goal.value}/year</div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            {/* Screening Frequency */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Health Screenings per Year: {calculatorInputs.screeningFrequency}
              </Label>
              <Slider
                value={[calculatorInputs.screeningFrequency]}
                onValueChange={([value]) => updateInput('screeningFrequency', value)}
                max={4}
                min={1}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1 screening</span>
                <span>4+ screenings</span>
              </div>
            </div>

            {/* Family Size */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Family Members</Label>
              <Slider
                value={[calculatorInputs.familySize]}
                onValueChange={([value]) => updateInput('familySize', value)}
                max={8}
                min={1}
                step={1}
                className="w-full"
              />
              <div className="text-xs text-muted-foreground">
                {calculatorInputs.familySize} member{calculatorInputs.familySize > 1 ? 's' : ''} 
                {calculatorInputs.familySize > 1 && ` (${Math.min((calculatorInputs.familySize - 1) * 50, 200)} discount)`}
              </div>
            </div>

            {/* Chronic Conditions */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Chronic Conditions: {calculatorInputs.chronicConditions}
              </Label>
              <Slider
                value={[calculatorInputs.chronicConditions]}
                onValueChange={([value]) => updateInput('chronicConditions', value)}
                max={5}
                min={0}
                step={1}
                className="w-full"
              />
              <div className="text-xs text-muted-foreground">
                More conditions = higher benefits but more health support
              </div>
            </div>

            {/* Activity Level */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Activity Level</Label>
              <Select
                value={calculatorInputs.activityLevel}
                onValueChange={(value: 'LOW' | 'MODERATE' | 'HIGH') => 
                  updateInput('activityLevel', value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low (Sedentary lifestyle)</SelectItem>
                  <SelectItem value="MODERATE">Moderate (Regular light activity)</SelectItem>
                  <SelectItem value="HIGH">High (Active with regular exercise)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Additional Benefits */}
            <div className="space-y-4">
              <Label className="text-sm font-medium">Additional Benefits</Label>
              <div className="space-y-2">
                <Button
                  variant={calculatorInputs.communityParticipation ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateInput('communityParticipation', !calculatorInputs.communityParticipation)}
                  className="w-full justify-start"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Community Health Programs
                  <Badge variant="outline" className="ml-auto">+$150/year</Badge>
                </Button>
                <Button
                  variant={calculatorInputs.healthEducation ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateInput('healthEducation', !calculatorInputs.healthEducation)}
                  className="w-full justify-start"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Health Education Courses
                  <Badge variant="outline" className="ml-auto">+$100/year</Badge>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Benefits Estimate */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Your Benefits Estimate
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Total Benefits Overview */}
            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600">
                ${benefitsEstimate.totalAnnualBenefits.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">
                Total Annual Benefits
              </div>
              <div className="text-lg font-medium text-green-700 mt-2">
                ${benefitsEstimate.monthlyBenefit.toFixed(0)}/month
              </div>
            </div>

            {/* Benefits Breakdown */}
            <div className="space-y-4">
              <h4 className="font-medium">Benefits Breakdown</h4>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Base Tier Benefits</span>
                  <span className="text-sm font-medium">${benefitsEstimate.tierBenefits}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm">Health Goal Incentives</span>
                  <span className="text-sm font-medium">${benefitsEstimate.healthGoalIncentives}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm">Screening Rewards</span>
                  <span className="text-sm font-medium">${benefitsEstimate.screeningRewards}</span>
                </div>
                
                {benefitsEstimate.communityBonus > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Community Bonus</span>
                    <span className="text-sm font-medium">${benefitsEstimate.communityBonus}</span>
                  </div>
                )}
                
                {benefitsEstimate.educationBonus > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Education Bonus</span>
                    <span className="text-sm font-medium">${benefitsEstimate.educationBonus}</span>
                  </div>
                )}
                
                {benefitsEstimate.familySharingDiscount > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Family Sharing</span>
                    <span className="text-sm font-medium">-${benefitsEstimate.familySharingDiscount}</span>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Additional Benefits */}
            <div className="space-y-4">
              <h4 className="font-medium">Additional Benefits</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-lg font-semibold text-blue-600">
                    ${benefitsEstimate.potentialSavings.toFixed(0)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Healthcare Savings
                  </div>
                </div>
                
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-lg font-semibold text-purple-600">
                    {benefitsEstimate.riskReduction}%
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Health Risk Reduction
                  </div>
                </div>
              </div>
            </div>

            {/* Tier Comparison */}
            <div className="space-y-2">
              <h4 className="font-medium">Tier Comparison</h4>
              <div className="space-y-2">
                {['BASIC', 'ENHANCED', 'PREMIUM'].map((tier) => {
                  const tierName = tier.toLowerCase()
                  const isCurrentTier = calculatorInputs.participationTier === tier
                  const tierBenefits = tier === 'BASIC' ? 300 : tier === 'ENHANCED' ? 600 : 1000
                  
                  return (
                    <div
                      key={tier}
                      className={cn(
                        "flex items-center justify-between p-2 rounded border",
                        isCurrentTier ? "bg-primary/10 border-primary" : "bg-muted/50"
                      )}
                    >
                      <span className="text-sm capitalize">{tierName}</span>
                      <span className="text-sm font-medium">${tierBenefits}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Call to Action */}
            <div className="pt-4 border-t">
              <Button className="w-full" size="lg">
                <TrendingUp className="h-4 w-4 mr-2" />
                Start Your Benefits Journey
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-2">
                Estimates shown are preliminary and may vary based on eligibility verification
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Benefits Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Info className="h-5 w-5" />
            How Benefits Are Calculated
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">Tier-Based Benefits</h4>
              <p className="text-muted-foreground">
                Choose your participation level: Basic ($300), Enhanced ($600), or Premium ($1000) annually.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Health Goal Rewards</h4>
              <p className="text-muted-foreground">
                Earn up to $300 per year for completing health goals like weight management, diabetes control, and smoking cessation.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Activity Bonuses</h4>
              <p className="text-muted-foreground">
                Get rewarded for health screenings, community participation, and completing health education courses.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}