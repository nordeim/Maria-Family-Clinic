// HelpTooltip Component for Healthier SG Eligibility Assessment
// Provides contextual help and explanations for eligibility terms and questions

'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  HelpCircle, 
  X, 
  ExternalLink, 
  Phone, 
  Mail, 
  Globe,
  BookOpen,
  Shield,
  Heart,
  User
} from 'lucide-react'

interface HelpTooltipProps {
  content: string | React.ReactNode
  title?: string
  variant?: 'default' | 'health' | 'eligibility' | 'general'
  placement?: 'top' | 'bottom' | 'left' | 'right'
  showIcon?: boolean
  className?: string
  children?: React.ReactNode
}

export function HelpTooltip({
  content,
  title,
  variant = 'default',
  placement = 'top',
  showIcon = true,
  className,
  children
}: HelpTooltipProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const getVariantStyles = () => {
    switch (variant) {
      case 'health':
        return {
          icon: <Heart className="h-4 w-4 text-red-500" />,
          badge: 'bg-red-100 text-red-800',
          border: 'border-red-200'
        }
      case 'eligibility':
        return {
          icon: <Shield className="h-4 w-4 text-blue-500" />,
          badge: 'bg-blue-100 text-blue-800',
          border: 'border-blue-200'
        }
      case 'general':
        return {
          icon: <BookOpen className="h-4 w-4 text-green-500" />,
          badge: 'bg-green-100 text-green-800',
          border: 'border-green-200'
        }
      default:
        return {
          icon: <HelpCircle className="h-4 w-4 text-muted-foreground" />,
          badge: 'bg-gray-100 text-gray-800',
          border: 'border-gray-200'
        }
    }
  }

  const getPlacementClasses = () => {
    switch (placement) {
      case 'top':
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2'
      case 'bottom':
        return 'top-full left-1/2 transform -translate-x-1/2 mt-2'
      case 'left':
        return 'right-full top-1/2 transform -translate-y-1/2 mr-2'
      case 'right':
        return 'left-full top-1/2 transform -translate-y-1/2 ml-2'
      default:
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2'
    }
  }

  const variantStyles = getVariantStyles()

  const handleClick = () => {
    if (typeof content === 'string' && content.length > 200) {
      setIsModalOpen(true)
    } else {
      setIsOpen(!isOpen)
    }
  }

  const isLongContent = typeof content === 'string' && content.length > 200

  return (
    <>
      <div className="relative inline-block">
        <Button
          variant="ghost"
          size="sm"
          className={`h-8 w-8 p-0 ${className}`}
          onClick={handleClick}
          aria-label="Help information"
        >
          {children || (showIcon && variantStyles.icon)}
        </Button>

        {/* Tooltip */}
        {isOpen && !isLongContent && (
          <div className={`absolute z-50 ${getPlacementClasses()}`}>
            <Card className={`max-w-sm shadow-lg ${variantStyles.border}`}>
              <CardContent className="p-3">
                {title && (
                  <div className="flex items-center space-x-2 mb-2">
                    {variantStyles.icon}
                    <h4 className="font-medium text-sm">{title}</h4>
                  </div>
                )}
                <p className="text-sm text-muted-foreground">
                  {content}
                </p>
              </CardContent>
              <div className="absolute w-2 h-2 bg-background border border-border transform rotate-45" 
                   style={{
                     [placement === 'top' ? 'top-full' : 
                      placement === 'bottom' ? 'bottom-full' : 
                      placement === 'left' ? 'right-full' : 'left-full']: '-4px',
                     [placement === 'top' || placement === 'bottom' ? 'left-1/2' : 
                      'top-1/2']: 'calc(50% - 4px)'
                   }}
              />
            </Card>
          </div>
        )}
      </div>

      {/* Modal for long content */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {variantStyles.icon}
                  <CardTitle className="text-lg">{title || 'Help Information'}</CardTitle>
                  <Badge className={variantStyles.badge}>
                    {variant}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="prose prose-sm max-w-none">
                {typeof content === 'string' ? (
                  <p className="text-muted-foreground whitespace-pre-wrap">{content}</p>
                ) : (
                  content
                )}
              </div>
              
              {/* Additional Resources */}
              <div className="border-t pt-4 space-y-3">
                <h4 className="font-medium flex items-center space-x-2">
                  <ExternalLink className="h-4 w-4" />
                  <span>Additional Resources</span>
                </h4>
                
                <div className="grid gap-2">
                  <Button variant="outline" size="sm" className="justify-start">
                    <Globe className="h-4 w-4 mr-2" />
                    Visit Healthier SG Official Website
                  </Button>
                  <Button variant="outline" size="sm" className="justify-start">
                    <Phone className="h-4 w-4 mr-2" />
                    Call Healthier SG Hotline: 1800-777-9999
                  </Button>
                  <Button variant="outline" size="sm" className="justify-start">
                    <Mail className="h-4 w-4 mr-2" />
                    Email Support: healthiersg@health.gov.sg
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}

// Predefined help content for common eligibility terms
export const ELIGIBILITY_HELP_CONTENT = {
  age: {
    title: 'Age Requirement',
    content: `The Healthier SG program is primarily designed for adults aged 40 and above, as this is when preventive health measures become most beneficial for detecting and managing chronic conditions early.

**Why 40+ years?**
• Higher risk of developing chronic diseases like diabetes, hypertension, and heart disease
• Preventive care is most effective when started early
• National health statistics show significant health benefits starting from this age group

**Exceptions:**
• Adults under 40 with chronic health conditions may qualify for priority enrollment
• Age requirements may be adjusted based on individual health risk assessments

**What to do if you're under 40:**
• You can still participate in preventive health measures
• Consider enrolling when you reach 40 years of age
• Focus on building healthy lifestyle habits now`,
  },

  citizenship: {
    title: 'Citizenship and Residency Requirements',
    content: `Healthier SG is Singapore's national health initiative and is available to permanent residents and citizens who can commit to long-term health management.

**Eligible:**
• Singapore Citizens (SC)
• Singapore Permanent Residents (PR)

**Not Eligible:**
• Work Pass holders (Employment Pass, S Pass, Work Permit)
• Student Pass holders
• Short-term visitors
• Tourists

**Why these requirements?**
The program requires long-term commitment to health goals and regular participation in screening and follow-up care, which is best suited for residents who plan to stay in Singapore long-term.

**PR Specific Notes:**
• Permanent residents have full access to Healthier SG benefits
• Same screening and care protocols as citizens
• May need to verify PR status periodically`,
  },

  chronicConditions: {
    title: 'Chronic Health Conditions',
    content: `Chronic conditions are long-term health conditions that require ongoing medical management. Having these conditions may qualify you for priority enrollment in Healthier SG.

**Common Chronic Conditions:**
• Diabetes (Type 1 & Type 2)
• High blood pressure (Hypertension)
• Heart disease and cardiovascular conditions
• Asthma and chronic lung diseases
• Kidney disease
• Cancer (in remission or under treatment)
• Mental health conditions (depression, anxiety)
• High cholesterol
• Osteoporosis

**Why Chronic Conditions Matter:**
• Early detection and management prevent complications
• Regular monitoring improves quality of life
• The program provides specialized care coordination
• Access to medication management and lifestyle support

**Priority Enrollment:**
• Individuals with chronic conditions get priority access
• Faster enrollment processing
• Specialized care pathways
• Enhanced support services`,
  },

  commitment: {
    title: 'Program Commitment Level',
    content: `Healthier SG requires active participation from enrolled individuals. Your commitment level helps us provide appropriate support and ensure successful health outcomes.

**High Commitment:**
• Ready to make significant lifestyle changes
• Willing to attend regular health screenings
• Motivated to follow personalized care plans
• Open to trying new healthy habits

**Moderate Commitment:**
• Willing to try new approaches to health
• Some openness to lifestyle modifications
• May need encouragement and support
• Gradual approach to behavior change

**Low Commitment:**
• Not ready for major lifestyle changes
• May prefer minimal intervention
• More likely to benefit from information and education first

**Assessment Process:**
Your commitment level helps determine:
• Type of care plan recommended
• Level of support services provided
• Frequency of follow-up appointments
• Available wellness programs

**Support Available:**
Regardless of commitment level, support is available to help you gradually increase engagement with the program.`,
  },

  screening: {
    title: 'Health Screening and Data Collection',
    content: `Health screenings and health data collection are core components of Healthier SG, enabling personalized care and tracking your health progress over time.

**What Health Screening Includes:**
• Comprehensive health checkups
• Blood pressure and heart rate measurements
• Blood tests (cholesterol, glucose, kidney function)
• BMI and body composition analysis
• Cancer screenings based on age and risk factors
• Mental health assessments
• Vision and hearing tests

**Data Collection and Privacy:**
• All health information is protected under Singapore's Personal Data Protection Act (PDPA)
• Data is used only for your healthcare and program improvement
• You can request access to your data at any time
• Data is not shared with third parties without consent

**Benefits of Data Collection:**
• Personalized health recommendations
• Early detection of health issues
• Tracking progress toward health goals
• Research to improve healthcare services (anonymized)

**Your Rights:**
• Right to access your health data
• Right to correct inaccurate information
• Right to withdraw from data collection (may affect program participation)
• Right to know how your data is used`,
  }
}