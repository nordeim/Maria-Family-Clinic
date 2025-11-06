/**
 * Cultural Adaptation Component
 * Provides culturally sensitive content adaptation for Healthier SG
 */

"use client"

import React, { useState, useEffect } from 'react'
import { Heart, Users, Calendar, BookOpen } from 'lucide-react'
import { useI18n } from '@/lib/i18n/hook'
import { CULTURAL_CONFIGS, type CulturalContext, DEFAULT_CULTURAL_CONTEXT } from '@/lib/i18n/config'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface CulturalAdaptationProps {
  culturalContext: CulturalContext
  onContextChange?: (context: CulturalContext) => void
  showPreferences?: boolean
  className?: string
}

export function CulturalAdaptation({
  culturalContext,
  onContextChange,
  showPreferences = true,
  className = ''
}: CulturalAdaptationProps) {
  const { t, culturalContext: currentContext } = useI18n()
  
  const handleContextUpdate = (updates: Partial<CulturalContext>) => {
    const updatedContext = { ...culturalContext, ...updates }
    onContextChange?.(updatedContext)
  }
  
  const culturalGroups = [
    { value: 'chinese', label: 'Chinese (华人)', flag: '🇨🇳' },
    { value: 'malay', label: 'Malay (Melayu)', flag: '🇲🇾' },
    { value: 'indian', label: 'Indian (தமிழ்)', flag: '🇮🇳' },
    { value: 'mixed', label: 'Mixed Heritage', flag: '🌏' },
    { value: 'western', label: 'Western', flag: '🌍' }
  ]
  
  const dietaryOptions = [
    'halal', 'vegetarian', 'vegan', 'no-pork', 'no-beef', 'no-alcohol',
    'seafood', 'gluten-free', 'dairy-free', 'nut-free', 'spicy-acceptable',
    'spicy-sensitive', 'traditional-foods', 'western-foods', 'mixed-diet'
  ]
  
  const religiousOptions = [
    'islamic', 'buddhist', 'christian', 'hindu', 'sikh', 'secular',
    'traditional-chinese', 'traditional-malay', 'non-religious', 'mixed-beliefs'
  ]
  
  const healthBeliefOptions = [
    'western-medicine', 'traditional-medicine', 'integrative', 'preventive',
    'holistic', 'evidence-based', 'family-centered', 'community-focused',
    'individual-responsibility', 'collective-health'
  ]
  
  const familyStructureOptions = [
    'nuclear', 'extended', 'multi-generational', 'single-parent',
    'blended', 'childless', 'large-family', 'small-family'
  ]
  
  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Heart className="h-5 w-5" />
            <span>
              {t('accessibility.culturalAdaptation', {}, { section: 'common', domain: 'accessibility', priority: 'medium', lastUpdated: '2025-01-01' })}
            </span>
          </CardTitle>
          <CardDescription>
            Customize health information based on your cultural background and preferences for better health outcomes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="dietary">Dietary</TabsTrigger>
              <TabsTrigger value="beliefs">Health Beliefs</TabsTrigger>
              <TabsTrigger value="family">Family</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Cultural Heritage</label>
                  <Select
                    value={culturalContext.culturalGroup}
                    onValueChange={(value) => handleContextUpdate({ culturalGroup: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your cultural background" />
                    </SelectTrigger>
                    <SelectContent>
                      {culturalGroups.map((group) => (
                        <SelectItem key={group.value} value={group.value}>
                          <div className="flex items-center space-x-2">
                            <span>{group.flag}</span>
                            <span>{group.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Preferred Language</label>
                    <Select defaultValue={currentContext?.culturalGroup || 'mixed'}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="zh">中文 (Chinese)</SelectItem>
                        <SelectItem value="ms">Bahasa Melayu</SelectItem>
                        <SelectItem value="ta">தமிழ் (Tamil)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Health Communication Style</label>
                    <Select defaultValue="direct">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="direct">Direct & Clear</SelectItem>
                        <SelectItem value="indirect">Indirect & Nuanced</SelectItem>
                        <SelectItem value="consultative">Consultative</SelectItem>
                        <SelectItem value="family-oriented">Family-oriented</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="bg-accent p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Current Cultural Profile</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">
                      {culturalGroups.find(g => g.value === culturalContext.culturalGroup)?.flag} {' '}
                      {culturalGroups.find(g => g.value === culturalContext.culturalGroup)?.label}
                    </Badge>
                    <Badge variant="outline">
                      <Users className="h-3 w-3 mr-1" />
                      {culturalContext.familyStructure} Family
                    </Badge>
                    <Badge variant="outline">
                      <Calendar className="h-3 w-3 mr-1" />
                      {culturalContext.dietaryRestrictions.length} Dietary Preferences
                    </Badge>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="dietary" className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-3 block">Dietary Restrictions & Preferences</label>
                <div className="grid grid-cols-2 gap-2">
                  {dietaryOptions.map((diet) => (
                    <Button
                      key={diet}
                      variant={culturalContext.dietaryRestrictions.includes(diet) ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        const newRestrictions = culturalContext.dietaryRestrictions.includes(diet)
                          ? culturalContext.dietaryRestrictions.filter(r => r !== diet)
                          : [...culturalContext.dietaryRestrictions, diet]
                        handleContextUpdate({ dietaryRestrictions: newRestrictions })
                      }}
                      className="justify-start"
                    >
                      {diet.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div className="bg-accent p-4 rounded-lg">
                <h4 className="font-medium mb-2">Cultural Dietary Considerations</h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  {culturalContext.culturalGroup === 'chinese' && (
                    <p>• Traditional Chinese dietary concepts (hot/cold foods) are considered</p>
                  )}
                  {culturalContext.culturalGroup === 'malay' && (
                    <p>• Halal requirements and Islamic dietary laws are prioritized</p>
                  )}
                  {culturalContext.culturalGroup === 'indian' && (
                    <p>• Vegetarian preferences and spice tolerance levels are considered</p>
                  )}
                  {culturalContext.dietaryRestrictions.includes('halal') && (
                    <p>• All meal recommendations will be Halal-certified</p>
                  )}
                  {culturalContext.dietaryRestrictions.includes('vegetarian') && (
                    <p>• Plant-based protein sources will be emphasized</p>
                  )}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="beliefs" className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-3 block">Religious Considerations</label>
                <div className="grid grid-cols-2 gap-2">
                  {religiousOptions.map((religion) => (
                    <Button
                      key={religion}
                      variant={culturalContext.religiousConsiderations.includes(religion) ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        const newConsiderations = culturalContext.religiousConsiderations.includes(religion)
                          ? culturalContext.religiousConsiderations.filter(r => r !== religion)
                          : [...culturalContext.religiousConsiderations, religion]
                        handleContextUpdate({ religiousConsiderations: newConsiderations })
                      }}
                      className="justify-start"
                    >
                      {religion.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-3 block">Health Approaches & Beliefs</label>
                <div className="grid grid-cols-2 gap-2">
                  {healthBeliefOptions.map((belief) => (
                    <Button
                      key={belief}
                      variant={culturalContext.healthBeliefs.includes(belief) ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        const newBeliefs = culturalContext.healthBeliefs.includes(belief)
                          ? culturalContext.healthBeliefs.filter(b => b !== belief)
                          : [...culturalContext.healthBeliefs, belief]
                        handleContextUpdate({ healthBeliefs: newBeliefs })
                      }}
                      className="justify-start"
                    >
                      {belief.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div className="bg-accent p-4 rounded-lg">
                <h4 className="font-medium mb-2">Adapted Health Messaging</h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  {culturalContext.healthBeliefs.includes('traditional-medicine') && (
                    <p>• Traditional medicine approaches will be integrated where appropriate</p>
                  )}
                  {culturalContext.healthBeliefs.includes('holistic') && (
                    <p>• Mind-body-spirit wellness approaches will be emphasized</p>
                  )}
                  {culturalContext.religiousConsiderations.includes('islamic') && (
                    <p>• Islamic health principles will be incorporated</p>
                  )}
                  {culturalContext.healthBeliefs.includes('preventive') && (
                    <p>• Preventive care and early intervention will be prioritized</p>
                  )}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="family" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Family Structure</label>
                  <Select
                    value={culturalContext.familyStructure}
                    onValueChange={(value) => handleContextUpdate({ familyStructure: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {familyStructureOptions.map((structure) => (
                        <SelectItem key={structure} value={structure}>
                          {structure.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="bg-accent p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Family-Centered Care Approach</h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    {culturalContext.familyStructure === 'multi-generational' && (
                      <p>• Health decisions involve multiple generations</p>
                    )}
                    {culturalContext.familyStructure === 'extended' && (
                      <p>• Extended family members are involved in health planning</p>
                    )}
                    <p>• Family support systems will be considered in health goal setting</p>
                    <p>• Culturally appropriate family communication styles will be used</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Preferred Communication with Family</label>
                  <Select defaultValue="inclusive">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inclusive">Include family in discussions</SelectItem>
                      <SelectItem value="individual">Individual consultation preferred</SelectItem>
                      <SelectItem value="consultative">Consult family when needed</SelectItem>
                      <SelectItem value="elders">Defer to elder family members</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

// Cultural Adaptation Preview Component
interface CulturalPreviewProps {
  culturalContext: CulturalContext
  type: 'dietary' | 'health-goals' | 'communication' | 'family'
  className?: string
}

export function CulturalPreview({ culturalContext, type, className = '' }: CulturalPreviewProps) {
  const { t } = useI18n()
  const config = CULTURAL_CONFIGS[culturalContext.culturalGroup]
  
  const getDietaryPreview = () => {
    const restrictions = culturalContext.dietaryRestrictions
    const adaptations = []
    
    if (restrictions.includes('halal')) {
      adaptations.push('All meal recommendations will be Halal-certified')
    }
    if (restrictions.includes('vegetarian')) {
      adaptations.push('Plant-based protein sources emphasized')
    }
    if (restrictions.includes('no-pork')) {
      adaptations.push('Pork-free meal plans provided')
    }
    if (restrictions.includes('no-beef')) {
      adaptations.push('Beef-free alternatives suggested')
    }
    
    return adaptations.length > 0 ? adaptations : ['Standard dietary recommendations']
  }
  
  const getHealthGoalPreview = () => {
    const beliefs = culturalContext.healthBeliefs
    const goals = []
    
    if (beliefs.includes('preventive')) {
      goals.push('Emphasis on preventive care and early screening')
    }
    if (beliefs.includes('holistic')) {
      goals.push('Mind-body-spirit wellness goals')
    }
    if (beliefs.includes('traditional-medicine')) {
      goals.push('Integration of traditional healing approaches')
    }
    if (beliefs.includes('western-medicine')) {
      goals.push('Evidence-based medical interventions')
    }
    
    return goals.length > 0 ? goals : ['Personalized health goals based on individual needs']
  }
  
  const getCommunicationPreview = () => {
    const style = config.communicationStyle
    const approaches = []
    
    if (style === 'direct') {
      approaches.push('Clear, direct health communication')
    } else if (style === 'indirect') {
      approaches.push('Nuanced, context-aware communication')
    }
    
    approaches.push('Culturally appropriate greeting and interaction styles')
    approaches.push('Respect for cultural hierarchy and family dynamics')
    
    return approaches
  }
  
  const getFamilyPreview = () => {
    const structure = culturalContext.familyStructure
    const dynamics = []
    
    if (structure === 'multi-generational') {
      dynamics.push('Health decisions may involve multiple generations')
    }
    if (structure === 'extended') {
      dynamics.push('Extended family support systems considered')
    }
    if (config.familyHierarchy === 'vertical') {
      dynamics.push('Respect for elder family members in health decisions')
    } else {
      dynamics.push('Collaborative family decision-making')
    }
    
    return dynamics
  }
  
  const previews = {
    dietary: getDietaryPreview(),
    'health-goals': getHealthGoalPreview(),
    communication: getCommunicationPreview(),
    family: getFamilyPreview()
  }
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base flex items-center space-x-2">
          <BookOpen className="h-4 w-4" />
          <span>Cultural Adaptation Preview: {type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 text-sm">
          {previews[type].map((item, index) => (
            <li key={index} className="flex items-start space-x-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}