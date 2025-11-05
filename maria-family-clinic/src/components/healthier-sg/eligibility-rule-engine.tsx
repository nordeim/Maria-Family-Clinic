// Healthier SG Eligibility Rule Engine
// Dynamic rule engine for real-time eligibility evaluation

'use client'

import { z } from 'zod'
import { 
  EligibilityRule, 
  RuleEvaluationResult, 
  QuestionnaireResponse,
  EligibilityRuleSchema,
  ProgressiveDisclosureRule 
} from './types'

export interface RuleEngineConfig {
  confidenceThreshold: number
  enableDebugging: boolean
  progressiveDisclosure: boolean
}

export class EligibilityRuleEngine {
  private rules: EligibilityRule[] = []
  private progressiveRules: ProgressiveDisclosureRule[] = []
  private config: RuleEngineConfig

  constructor(config: RuleEngineConfig) {
    this.config = config
  }

  /**
   * Load rules into the engine
   */
  loadRules(rules: EligibilityRule[], progressiveRules: ProgressiveDisclosureRule[] = []) {
    this.rules = rules.filter(rule => rule.active).sort((a, b) => a.order - b.order)
    this.progressiveRules = progressiveRules
  }

  /**
   * Evaluate all rules against provided responses
   */
  evaluateEligibility(responses: QuestionnaireResponse[]): {
    isEligible: boolean
    confidence: number
    score: number
    results: RuleEvaluationResult[]
    criteria: Array<{
      name: string
      passed: boolean
      weight: number
      description: string
    }>
  } {
    const responseMap = new Map(responses.map(r => [r.questionId, r.value]))
    const results: RuleEvaluationResult[] = []
    let totalScore = 0
    let maxScore = 0
    let requiredPassed = true

    // Evaluate each rule
    for (const rule of this.rules) {
      const ruleResult = this.evaluateRule(rule, responseMap)
      results.push(ruleResult)
      
      totalScore += ruleResult.score
      maxScore += rule.weight

      // Check if required rules are passed
      if (rule.isRequired && !ruleResult.passed) {
        requiredPassed = false
      }
    }

    // Calculate overall eligibility
    const finalScore = maxScore > 0 ? (totalScore / maxScore) * 100 : 0
    const isEligible = requiredPassed && finalScore >= this.config.confidenceThreshold
    const confidence = this.calculateConfidence(results)

    // Build criteria summary
    const criteria = this.rules.map(rule => {
      const result = results.find(r => r.ruleId === rule.id)
      return {
        name: rule.name,
        passed: result?.passed || false,
        weight: rule.weight,
        description: rule.description,
      }
    })

    if (this.config.enableDebugging) {
      console.log('Rule Engine Evaluation:', {
        isEligible,
        score: finalScore,
        confidence,
        requiredPassed,
        totalScore,
        maxScore,
      })
    }

    return {
      isEligible,
      confidence,
      score: finalScore,
      results,
      criteria,
    }
  }

  /**
   * Evaluate a single rule against responses
   */
  private evaluateRule(rule: EligibilityRule, responses: Map<string, any>): RuleEvaluationResult {
    const { condition } = rule
    const responseValue = responses.get(condition.field)

    let passed = false
    let score = 0
    let details = ''

    try {
      switch (condition.operator) {
        case 'EQUALS':
          passed = responseValue === condition.value
          break
        case 'NOT_EQUALS':
          passed = responseValue !== condition.value
          break
        case 'GREATER_THAN':
          passed = Number(responseValue) > Number(condition.value)
          break
        case 'LESS_THAN':
          passed = Number(responseValue) < Number(condition.value)
          break
        case 'IN':
          passed = Array.isArray(condition.value) && condition.value.includes(responseValue)
          break
        case 'NOT_IN':
          passed = Array.isArray(condition.value) && !condition.value.includes(responseValue)
          break
        case 'CONTAINS':
          if (Array.isArray(responseValue)) {
            passed = responseValue.includes(condition.value)
          } else if (typeof responseValue === 'string') {
            passed = responseValue.toLowerCase().includes(String(condition.value).toLowerCase())
          }
          break
        default:
          throw new Error(`Unknown operator: ${condition.operator}`)
      }

      score = passed ? rule.weight : 0
      details = `Field: ${condition.field}, Value: ${responseValue}, Condition: ${condition.operator} ${condition.value}, Passed: ${passed}`

    } catch (error) {
      passed = false
      score = 0
      details = `Error evaluating rule: ${error instanceof Error ? error.message : 'Unknown error'}`
    }

    return {
      ruleId: rule.id,
      passed,
      score,
      details,
      weight: rule.weight,
    }
  }

  /**
   * Calculate confidence score based on evaluation results
   */
  private calculateConfidence(results: RuleEvaluationResult[]): number {
    if (results.length === 0) return 0

    const passedRules = results.filter(r => r.passed).length
    const totalRules = results.length
    const requiredRules = this.rules.filter(r => r.isRequired).length
    const passedRequiredRules = results.filter(r => r.passed && this.rules.find(rr => rr.id === r.ruleId)?.isRequired).length

    // Base confidence from rule completion
    let confidence = passedRules / totalRules

    // Boost confidence if all required rules are passed
    if (requiredRules > 0 && passedRequiredRules === requiredRules) {
      confidence += 0.1
    }

    // Cap at 1.0
    return Math.min(confidence, 1.0)
  }

  /**
   * Get questions that should be shown based on progressive disclosure
   */
  getProgressiveQuestions(currentResponses: QuestionnaireResponse[]): {
    showQuestions: string[]
    hideQuestions: string[]
  } {
    const responseMap = new Map(currentResponses.map(r => [r.questionId, r.value]))
    const showQuestions: Set<string> = new Set()
    const hideQuestions: Set<string> = new Set()

    for (const progressiveRule of this.progressiveRules) {
      const triggerValue = responseMap.get(progressiveRule.triggerQuestionId)
      
      if (triggerValue === progressiveRule.triggerValue) {
        progressiveRule.showQuestionIds.forEach(id => showQuestions.add(id))
        progressiveRule.hideQuestionIds?.forEach(id => hideQuestions.add(id))
      }
    }

    return {
      showQuestions: Array.from(showQuestions),
      hideQuestions: Array.from(hideQuestions),
    }
  }

  /**
   * Validate required fields are answered
   */
  validateRequiredFields(responses: QuestionnaireResponse[]): {
    isValid: boolean
    missingRequired: string[]
    errors: Array<{ field: string; message: string }>
  } {
    const responseMap = new Map(responses.map(r => [r.questionId, r.value]))
    const missingRequired: string[] = []
    const errors: Array<{ field: string; message: string }> = []

    // Check required fields
    for (const rule of this.rules.filter(r => r.isRequired)) {
      const responseValue = responseMap.get(rule.condition.field)
      
      if (responseValue === undefined || responseValue === null || responseValue === '') {
        missingRequired.push(rule.condition.field)
        errors.push({
          field: rule.condition.field,
          message: `${rule.name} is required`,
        })
      }
    }

    return {
      isValid: missingRequired.length === 0,
      missingRequired,
      errors,
    }
  }

  /**
   * Get eligibility recommendation based on results
   */
  getRecommendation(results: RuleEvaluationResult[], isEligible: boolean): {
    title: string
    description: string
    nextSteps: string[]
    urgency: 'LOW' | 'MEDIUM' | 'HIGH'
  } {
    if (isEligible) {
      return {
        title: 'You are eligible for Healthier SG!',
        description: 'Based on your responses, you meet the criteria for the Healthier SG program.',
        nextSteps: [
          'Choose a participating clinic near you',
          'Schedule your initial health screening',
          'Complete enrollment documentation',
          'Prepare for your first appointment',
        ],
        urgency: 'HIGH',
      }
    }

    // Analyze why user is not eligible
    const failedRequired = results.filter(r => {
      const rule = this.rules.find(rr => rr.id === r.ruleId)
      return !r.passed && rule?.isRequired
    })

    const failedOptional = results.filter(r => {
      const rule = this.rules.find(rr => rr.id === r.ruleId)
      return !r.passed && !rule?.isRequired
    })

    if (failedRequired.length > 0) {
      return {
        title: 'Not currently eligible for Healthier SG',
        description: 'Some required criteria are not met. You may become eligible in the future.',
        nextSteps: [
          'Review the eligibility criteria',
          'Consider lifestyle changes that may improve eligibility',
          'Reassess eligibility when circumstances change',
          'Contact support if you believe there was an error',
        ],
        urgency: 'LOW',
      }
    }

    return {
      title: 'Partially eligible with additional requirements',
      description: 'You meet some criteria but additional documentation or steps may be needed.',
      nextSteps: [
        'Provide additional supporting documentation',
        'Contact your chosen clinic for clarification',
        'Consider appealing if you believe assessment is incorrect',
        'Review optional criteria for improvement',
      ],
      urgency: 'MEDIUM',
    }
  }
}

/**
 * Default eligibility rules for Healthier SG program
 */
export const DEFAULT_HEALTHIER_SG_RULES: EligibilityRule[] = [
  // Age requirements
  {
    id: 'age-40-plus',
    name: 'Age Requirement',
    description: 'Applicant must be 40 years or older',
    category: 'DEMOGRAPHIC',
    condition: {
      field: 'age',
      operator: 'GREATER_THAN',
      value: 39,
    },
    weight: 25,
    isRequired: true,
    active: true,
    order: 1,
  },
  {
    id: 'age-minimum',
    name: 'Minimum Age',
    description: 'Applicant must be at least 18 years old',
    category: 'DEMOGRAPHIC',
    condition: {
      field: 'age',
      operator: 'GREATER_THAN',
      value: 17,
    },
    weight: 10,
    isRequired: true,
    active: true,
    order: 2,
  },

  // Residency requirements
  {
    id: 'citizenship-status',
    name: 'Citizenship Status',
    description: 'Must be Singapore Citizen or Permanent Resident',
    category: 'DEMOGRAPHIC',
    condition: {
      field: 'citizenshipStatus',
      operator: 'IN',
      value: ['CITIZEN', 'PR'],
    },
    weight: 30,
    isRequired: true,
    active: true,
    order: 3,
  },

  // Chronic conditions
  {
    id: 'chronic-conditions',
    name: 'Chronic Conditions Priority',
    description: 'Having chronic conditions qualifies for priority enrollment',
    category: 'HEALTH',
    condition: {
      field: 'hasChronicConditions',
      operator: 'EQUALS',
      value: true,
    },
    weight: 20,
    isRequired: false,
    active: true,
    order: 4,
  },

  // Health screening readiness
  {
    id: 'health-screening-consent',
    name: 'Health Screening Consent',
    description: 'Must consent to health screening and data collection',
    category: 'HEALTH',
    condition: {
      field: 'consentToScreening',
      operator: 'EQUALS',
      value: true,
    },
    weight: 15,
    isRequired: true,
    active: true,
    order: 5,
  },

  // Commitment to program
  {
    id: 'program-commitment',
    name: 'Program Commitment',
    description: 'Must demonstrate willingness to participate in program',
    category: 'LIFESTYLE',
    condition: {
      field: 'commitmentLevel',
      operator: 'IN',
      value: ['HIGH', 'MODERATE'],
    },
    weight: 10,
    isRequired: true,
    active: true,
    order: 6,
  },

  // Geographic proximity (if clinic selection is required)
  {
    id: 'clinic-proximity',
    name: 'Clinic Accessibility',
    description: 'Must have access to participating clinic',
    category: 'GEOGRAPHIC',
    condition: {
      field: 'selectedClinicId',
      operator: 'NOT_EQUALS',
      value: '',
    },
    weight: 10,
    isRequired: true,
    active: true,
    order: 7,
  },
]

/**
 * Progressive disclosure rules
 */
export const PROGRESSIVE_DISCLOSURE_RULES: ProgressiveDisclosureRule[] = [
  {
    triggerQuestionId: 'hasChronicConditions',
    triggerValue: true,
    showQuestionIds: [
      'chronicConditionsList',
      'medicationList',
      'lastMedicalCheckup',
      'specialCareNeeds',
    ],
  },
  {
    triggerQuestionId: 'hasChronicConditions',
    triggerValue: false,
    hideQuestionIds: [
      'chronicConditionsList',
      'medicationList',
      'lastMedicalCheckup',
      'specialCareNeeds',
    ],
  },
  {
    triggerQuestionId: 'age',
    triggerValue: 65,
    showQuestionIds: [
      'mobilityRequirements',
      'caregiverSupport',
      'specialDietaryNeeds',
    ],
  },
  {
    triggerQuestionId: 'employmentStatus',
    triggerValue: 'RETIRED',
    showQuestionIds: [
      'retirementActivities',
      'socialSupport',
    ],
  },
]

/**
 * Default rule engine configuration
 */
export const DEFAULT_RULE_ENGINE_CONFIG: RuleEngineConfig = {
  confidenceThreshold: 70,
  enableDebugging: process.env.NODE_ENV === 'development',
  progressiveDisclosure: true,
}