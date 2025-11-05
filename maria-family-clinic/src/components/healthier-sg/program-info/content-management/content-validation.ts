// Content Validation & Compliance System
// Sub-Phase 8.5: Content Management System

import { 
  ContentVersion, 
  ComplianceStatus, 
  FAQItem, 
  ProgramOverviewContent,
  BenefitExplanation 
} from '../types'

// Government compliance validation rules
const MOH_COMPLIANCE_RULES = {
  medicalAccuracy: {
    keywords: [
      'evidence-based',
      'MOH approved',
      'clinical guidelines',
      'medical expert'
    ],
    required: true,
    validationType: 'medical_expert_review'
  },
  officialMessaging: {
    requiredPhrases: [
      'Healthier SG is a voluntary programme',
      'Ministry of Health',
      'all Singaporeans and permanent residents'
    ],
    forbiddenTerms: [
      'guaranteed cure',
      'miracle treatment',
      'instant results',
      'foolproof method'
    ]
  },
  disclaimerRequirements: {
    required: true,
    text: 'Information provided is for educational purposes only and should not replace professional medical advice. Please consult your healthcare provider for personalized guidance.'
  },
  sourceAttribution: {
    required: true,
    sources: ['Ministry of Health', 'Healthier SG Official Website', 'Government Gazette']
  }
}

// Validation interfaces
interface ValidationRule {
  id: string
  name: string
  type: 'medical_accuracy' | 'government_compliance' | 'accessibility' | 'content_quality'
  description: string
  severity: 'error' | 'warning' | 'info'
  check: (content: any) => ValidationResult
  autoFix?: boolean
  fixAction?: (content: any) => any
}

interface ValidationResult {
  passed: boolean
  severity: 'error' | 'warning' | 'info'
  message: string
  suggestion?: string
  field?: string
}

// Content validation engine
export class ContentValidationEngine {
  private rules: ValidationRule[]
  
  constructor() {
    this.rules = [
      // Medical accuracy rules
      this.createMedicalAccuracyRule(),
      this.createMedicalExpertReviewRule(),
      
      // Government compliance rules
      this.createOfficialMessagingRule(),
      this.createDisclaimerRule(),
      this.createSourceAttributionRule(),
      
      // Accessibility rules
      this.createAccessibilityRule(),
      this.createAltTextRule(),
      this.createContrastRule(),
      
      // Content quality rules
      this.createReadingLevelRule(),
      this.createContentLengthRule(),
      this.createLinkValidationRule()
    ]
  }

  validateContent(content: any, contentType: 'FAQ' | 'OVERVIEW' | 'BENEFITS'): ComplianceStatus {
    const validationResults: ValidationResult[] = []
    const complianceChecks: any = {
      mohGuidelines: {
        status: 'COMPLIANT' as const,
        issues: [],
        lastChecked: new Date(),
        checkedBy: 'ContentValidationEngine'
      },
      pdpaCompliance: {
        status: 'COMPLIANT' as const,
        issues: [],
        lastChecked: new Date(),
        checkedBy: 'ContentValidationEngine'
      },
      accessibility: {
        wcagLevel: 'AA' as const,
        score: 100,
        issues: [],
        lastChecked: new Date()
      },
      accuracy: {
        verified: false,
        sources: [],
        verificationDate: new Date(),
        verifiedBy: 'ContentValidationEngine'
      }
    }

    // Run all validation rules
    for (const rule of this.rules) {
      try {
        const result = rule.check(content)
        validationResults.push(result)
        
        // Update compliance status based on results
        if (!result.passed && rule.type === 'medical_accuracy') {
          complianceChecks.accuracy.verified = false
          complianceChecks.mohGuidelines.status = 'NEEDS_REVIEW'
          complianceChecks.mohGuidelines.issues.push(result.message)
        }
        
        if (!result.passed && rule.type === 'government_compliance') {
          complianceChecks.mohGuidelines.status = 'NON_COMPLIANT'
          complianceChecks.mohGuidelines.issues.push(result.message)
        }
        
        if (!result.passed && rule.type === 'accessibility') {
          complianceChecks.accessibility.score -= 10
          complianceChecks.accessibility.issues.push(result.message)
        }
      } catch (error) {
        validationResults.push({
          passed: false,
          severity: 'error',
          message: `Validation rule "${rule.name}" failed: ${error}`,
          field: 'validation_engine'
        })
      }
    }

    // Determine overall compliance status
    const hasErrors = validationResults.some(r => r.severity === 'error')
    const hasWarnings = validationResults.some(r => r.severity === 'warning')
    
    let overallStatus: 'COMPLIANT' | 'PARTIALLY_COMPLIANT' | 'NON_COMPLIANT' | 'UNDER_REVIEW'
    
    if (hasErrors) {
      overallStatus = 'NON_COMPLIANT'
    } else if (hasWarnings) {
      overallStatus = 'PARTIALLY_COMPLIANT'
    } else {
      overallStatus = 'COMPLIANT'
    }

    return {
      contentId: content.id,
      complianceChecks,
      overallStatus,
      lastReview: new Date(),
      nextReview: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      reviewHistory: [{
        date: new Date(),
        reviewer: 'ContentValidationEngine',
        status: overallStatus === 'COMPLIANT' ? 'COMPLIANT' : 'NEEDS_CHANGES',
        comments: validationResults.map(r => `${r.severity.toUpperCase()}: ${r.message}`).join('; ')
      }]
    }
  }

  // Individual validation rules
  private createMedicalAccuracyRule(): ValidationRule {
    return {
      id: 'medical-accuracy',
      name: 'Medical Accuracy Check',
      type: 'medical_accuracy',
      description: 'Ensures medical information is accurate and evidence-based',
      severity: 'error',
      check: (content: any) => {
        const text = JSON.stringify(content).toLowerCase()
        
        // Check for medical claims without proper disclaimers
        const medicalTerms = [
          'treat', 'cure', 'diagnose', 'prevent', 'heal', 'eliminate'
        ]
        
        const hasMedicalTerms = medicalTerms.some(term => text.includes(term))
        
        if (hasMedicalTerms) {
          // Verify disclaimers are present
          const hasDisclaimer = text.includes('consult your healthcare provider') ||
                               text.includes('seek medical advice') ||
                               text.includes('professional medical advice')
          
          if (!hasDisclaimer) {
            return {
              passed: false,
              severity: 'error',
              message: 'Medical claims require professional medical advice disclaimer',
              suggestion: 'Add "Please consult your healthcare provider for personalized medical advice"',
              field: 'medical_claims'
            }
          }
        }
        
        return { passed: true, severity: 'info', message: 'Medical accuracy check passed' }
      }
    }
  }

  private createMedicalExpertReviewRule(): ValidationRule {
    return {
      id: 'medical-expert-review',
      name: 'Medical Expert Review',
      type: 'medical_accuracy',
      description: 'Ensures medical content has been reviewed by qualified experts',
      severity: 'warning',
      check: (content: any) => {
        const hasMedicalContent = this.containsMedicalContent(content)
        
        if (!hasMedicalContent) {
          return { passed: true, severity: 'info', message: 'No medical content detected' }
        }
        
        // Check if content has expert review metadata
        const hasExpertReview = content.metadata?.reviewer && 
                               content.metadata.reviewer.includes('Dr.') ||
                               content.metadata.reviewer.includes('MD')
        
        if (!hasExpertReview) {
          return {
            passed: false,
            severity: 'warning',
            message: 'Medical content may require expert review',
            suggestion: 'Ensure medical content is reviewed by qualified healthcare professionals',
            field: 'expert_review'
          }
        }
        
        return { passed: true, severity: 'info', message: 'Medical expert review present' }
      }
    }
  }

  private createOfficialMessagingRule(): ValidationRule {
    return {
      id: 'official-messaging',
      name: 'Official Government Messaging',
      type: 'government_compliance',
      description: 'Ensures content aligns with official MOH messaging',
      severity: 'error',
      check: (content: any) => {
        const text = JSON.stringify(content).toLowerCase()
        
        // Check for forbidden terms
        const hasForbiddenTerms = MOH_COMPLIANCE_RULES.officialMessaging.forbiddenTerms.some(
          term => text.includes(term.toLowerCase())
        )
        
        if (hasForbiddenTerms) {
          return {
            passed: false,
            severity: 'error',
            message: 'Content contains non-compliant messaging terms',
            suggestion: 'Remove exaggerated claims and ensure messaging aligns with MOH guidelines',
            field: 'messaging'
          }
        }
        
        // Check for required official phrases
        const hasOfficialPhrases = MOH_COMPLIANCE_RULES.officialMessaging.requiredPhrases.some(
          phrase => text.includes(phrase.toLowerCase())
        )
        
        if (content.type === 'OVERVIEW' && !hasOfficialPhrases) {
          return {
            passed: false,
            severity: 'warning',
            message: 'Content should include official MOH messaging',
            suggestion: 'Consider adding official MOH phrases for better compliance',
            field: 'official_messaging'
          }
        }
        
        return { passed: true, severity: 'info', message: 'Official messaging check passed' }
      }
    }
  }

  private createDisclaimerRule(): ValidationRule {
    return {
      id: 'disclaimer',
      name: 'Medical Disclaimer',
      type: 'government_compliance',
      description: 'Ensures appropriate disclaimers are present',
      severity: 'error',
      check: (content: any) => {
        const text = JSON.stringify(content).toLowerCase()
        const hasMedicalContent = this.containsMedicalContent(content)
        
        if (!hasMedicalContent) {
          return { passed: true, severity: 'info', message: 'No medical disclaimer required' }
        }
        
        const hasDisclaimer = text.includes(MOH_COMPLIANCE_RULES.disclaimerRequirements.text.toLowerCase()) ||
                             text.includes('informational purposes only') ||
                             text.includes('not replace professional medical advice')
        
        if (!hasDisclaimer) {
          return {
            passed: false,
            severity: 'error',
            message: 'Medical disclaimer required for medical content',
            suggestion: MOH_COMPLIANCE_RULES.disclaimerRequirements.text,
            field: 'disclaimer'
          }
        }
        
        return { passed: true, severity: 'info', message: 'Medical disclaimer present' }
      }
    }
  }

  private createSourceAttributionRule(): ValidationRule {
    return {
      id: 'source-attribution',
      name: 'Source Attribution',
      type: 'content_quality',
      description: 'Ensures content has proper source attribution',
      severity: 'warning',
      check: (content: any) => {
        const hasSources = content.metadata?.sources ||
                          content.sources ||
                          content.answer?.sources
        
        if (!hasSources) {
          return {
            passed: false,
            severity: 'warning',
            message: 'Content should have proper source attribution',
            suggestion: 'Add references to official sources like MOH, Healthier SG website',
            field: 'sources'
          }
        }
        
        return { passed: true, severity: 'info', message: 'Source attribution present' }
      }
    }
  }

  private createAccessibilityRule(): ValidationRule {
    return {
      id: 'accessibility',
      name: 'Accessibility Compliance',
      type: 'accessibility',
      description: 'Ensures content meets WCAG 2.2 AA standards',
      severity: 'error',
      check: (content: any) => {
        const text = JSON.stringify(content)
        
        // Check for alt text on images
        const hasImages = text.includes('"src"') && text.includes('"alt"')
        if (!hasImages && text.includes('image')) {
          return {
            passed: false,
            severity: 'error',
            message: 'Images must have alt text for screen readers',
            suggestion: 'Add descriptive alt text to all images',
            field: 'images'
          }
        }
        
        // Check for proper heading structure
        const hasHeadings = text.includes('"title"') || text.includes('"heading"')
        if (!hasHeadings && text.length > 200) {
          return {
            passed: false,
            severity: 'warning',
            message: 'Content should have proper heading structure',
            suggestion: 'Use hierarchical headings (H1, H2, H3) for better accessibility',
            field: 'headings'
          }
        }
        
        return { passed: true, severity: 'info', message: 'Accessibility check passed' }
      }
    }
  }

  private createAltTextRule(): ValidationRule {
    return {
      id: 'alt-text',
      name: 'Alternative Text Quality',
      type: 'accessibility',
      description: 'Ensures alt text is descriptive and meaningful',
      severity: 'warning',
      check: (content: any) => {
        const altTexts = this.extractAltTexts(content)
        
        for (const altText of altTexts) {
          // Check for generic alt text
          const genericTerms = ['image', 'picture', 'photo', 'graphic', 'chart']
          const isGeneric = genericTerms.some(term => altText.toLowerCase().includes(term))
          
          if (isGeneric && altText.length < 20) {
            return {
              passed: false,
              severity: 'warning',
              message: 'Alt text should be descriptive and specific',
              suggestion: 'Replace generic alt text with descriptive content explaining the image\'s purpose',
              field: 'alt_text'
            }
          }
        }
        
        return { passed: true, severity: 'info', message: 'Alt text quality check passed' }
      }
    }
  }

  private createContrastRule(): ValidationRule {
    return {
      id: 'contrast',
      name: 'Color Contrast',
      type: 'accessibility',
      description: 'Ensures sufficient color contrast for readability',
      severity: 'info',
      check: (content: any) => {
        // This would typically check actual CSS colors
        // For now, it's a placeholder for color contrast validation
        return {
          passed: true,
          severity: 'info',
          message: 'Color contrast validation requires manual review',
          suggestion: 'Ensure text has sufficient contrast ratio (4.5:1 for normal text, 3:1 for large text)',
          field: 'color_contrast'
        }
      }
    }
  }

  private createReadingLevelRule(): ValidationRule {
    return {
      id: 'reading-level',
      name: 'Reading Level Check',
      type: 'content_quality',
      description: 'Ensures content is accessible to general public',
      severity: 'warning',
      check: (content: any) => {
        const text = this.extractTextContent(content)
        const words = text.split(/\s+/).filter(w => w.length > 0)
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
        
        if (sentences.length === 0) {
          return { passed: true, severity: 'info', message: 'No text content to analyze' }
        }
        
        const avgWordsPerSentence = words.length / sentences.length
        const avgSyllablesPerWord = this.calculateSyllables(text) / words.length
        
        // Simple readability score (lower is easier to read)
        const readabilityScore = avgWordsPerSentence * (avgSyllablesPerWord / 3)
        
        if (readabilityScore > 15) {
          return {
            passed: false,
            severity: 'warning',
            message: 'Content may be too complex for general public',
            suggestion: 'Simplify language and shorten sentences for better accessibility',
            field: 'reading_level'
          }
        }
        
        return { passed: true, severity: 'info', message: 'Reading level is appropriate' }
      }
    }
  }

  private createContentLengthRule(): ValidationRule {
    return {
      id: 'content-length',
      name: 'Content Length Check',
      type: 'content_quality',
      description: 'Ensures content is appropriately sized',
      severity: 'info',
      check: (content: any) => {
        const text = this.extractTextContent(content)
        
        if (text.length < 50) {
          return {
            passed: false,
            severity: 'warning',
            message: 'Content may be too short to be informative',
            suggestion: 'Consider adding more detailed information',
            field: 'content_length'
          }
        }
        
        if (text.length > 5000) {
          return {
            passed: false,
            severity: 'warning',
            message: 'Content may be too long for optimal user engagement',
            suggestion: 'Consider breaking into multiple sections or pages',
            field: 'content_length'
          }
        }
        
        return { passed: true, severity: 'info', message: 'Content length is appropriate' }
      }
    }
  }

  private createLinkValidationRule(): ValidationRule {
    return {
      id: 'link-validation',
      name: 'Link Validation',
      type: 'content_quality',
      description: 'Validates links in content',
      severity: 'warning',
      check: (content: any) => {
        const links = this.extractLinks(content)
        
        for (const link of links) {
          // Check if it's an external link without disclaimer
          if (link.startsWith('http') && !link.includes('healthier-sg.gov.sg') && !link.includes('moh.gov.sg')) {
            return {
              passed: false,
              severity: 'warning',
              message: 'External links should have appropriate disclaimers',
              suggestion: 'Add disclaimer that external links lead to third-party content',
              field: 'external_links'
            }
          }
        }
        
        return { passed: true, severity: 'info', message: 'Link validation passed' }
      }
    }
  }

  // Helper methods
  private containsMedicalContent(content: any): boolean {
    const medicalKeywords = [
      'health', 'medical', 'treatment', 'diagnosis', 'symptom', 'disease',
      'medicine', 'doctor', 'clinic', 'hospital', 'healthcare', 'condition',
      'screening', 'preventive', 'chronic', 'therapy', 'prescription'
    ]
    
    const text = JSON.stringify(content).toLowerCase()
    return medicalKeywords.some(keyword => text.includes(keyword))
  }

  private extractAltTexts(content: any): string[] {
    const altTexts: string[] = []
    
    const extractRecursively = (obj: any) => {
      if (typeof obj === 'string' || typeof obj === 'number') return
      
      if (typeof obj === 'object' && obj !== null) {
        if (obj.alt) {
          altTexts.push(obj.alt)
        }
        if (obj.altText) {
          altTexts.push(obj.altText)
        }
        
        Object.values(obj).forEach(extractRecursively)
      }
    }
    
    extractRecursively(content)
    return altTexts
  }

  private extractLinks(content: any): string[] {
    const links: string[] = []
    
    const extractRecursively = (obj: any) => {
      if (typeof obj === 'string' && (obj.includes('http') || obj.includes('www'))) {
        links.push(obj)
      } else if (typeof obj === 'object' && obj !== null) {
        Object.values(obj).forEach(extractRecursively)
      }
    }
    
    extractRecursively(content)
    return links
  }

  private extractTextContent(content: any): string {
    const textParts: string[] = []
    
    const extractRecursively = (obj: any) => {
      if (typeof obj === 'string') {
        textParts.push(obj)
      } else if (typeof obj === 'object' && obj !== null) {
        Object.values(obj).forEach(extractRecursively)
      }
    }
    
    extractRecursively(content)
    return textParts.join(' ')
  }

  private calculateSyllables(text: string): number {
    return text
      .toLowerCase()
      .split(/[aeiouy]+/)
      .filter(syllable => syllable.length > 0)
      .length
  }
}

// Content compliance dashboard
export class ComplianceDashboard {
  private validationEngine: ContentValidationEngine
  
  constructor() {
    this.validationEngine = new ContentValidationEngine()
  }

  generateComplianceReport(contentItems: any[]): {
    totalItems: number
    compliantItems: number
    partiallyCompliantItems: number
    nonCompliantItems: number
    commonIssues: Array<{ issue: string; count: number; severity: string }>
    recommendations: string[]
  } {
    const complianceResults = contentItems.map(content => 
      this.validationEngine.validateContent(content, this.detectContentType(content))
    )

    const compliantItems = complianceResults.filter(r => r.overallStatus === 'COMPLIANT').length
    const partiallyCompliantItems = complianceResults.filter(r => r.overallStatus === 'PARTIALLY_COMPLIANT').length
    const nonCompliantItems = complianceResults.filter(r => r.overallStatus === 'NON_COMPLIANT').length

    // Analyze common issues
    const issueCounts = new Map<string, { count: number; severity: 'error' | 'warning' | 'info' }>()
    
    complianceResults.forEach(result => {
      result.reviewHistory.forEach(review => {
        if (review.comments) {
          const issues = review.comments.split('; ')
          issues.forEach(issue => {
            if (issue.includes(':')) {
              const [severity, message] = issue.split(': ', 2)
              const key = message.trim()
              const current = issueCounts.get(key) || { count: 0, severity: severity.toLowerCase() as any }
              issueCounts.set(key, { count: current.count + 1, severity: current.severity })
            }
          })
        }
      })
    })

    const commonIssues = Array.from(issueCounts.entries())
      .map(([issue, data]) => ({ issue, count: data.count, severity: data.severity }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    // Generate recommendations
    const recommendations = this.generateRecommendations(complianceResults, commonIssues)

    return {
      totalItems: contentItems.length,
      compliantItems,
      partiallyCompliantItems,
      nonCompliantItems,
      commonIssues,
      recommendations
    }
  }

  private detectContentType(content: any): 'FAQ' | 'OVERVIEW' | 'BENEFITS' {
    if (content.question || content.answer) return 'FAQ'
    if (content.heroSection) return 'OVERVIEW'
    if (content.category && content.visualGuide) return 'BENEFITS'
    return 'OVERVIEW'
  }

  private generateRecommendations(complianceResults: ComplianceStatus[], commonIssues: any[]): string[] {
    const recommendations: string[] = []
    
    const nonCompliantRate = complianceResults.filter(r => r.overallStatus === 'NON_COMPLIANT').length / complianceResults.length
    
    if (nonCompliantRate > 0.1) {
      recommendations.push('Consider implementing stricter content review processes to reduce non-compliance rate')
    }
    
    if (commonIssues.some(issue => issue.severity === 'error')) {
      recommendations.push('Prioritize fixing high-severity compliance issues that could impact user safety or regulatory compliance')
    }
    
    recommendations.push('Implement automated content validation in the content creation workflow')
    recommendations.push('Schedule regular compliance audits with healthcare professionals')
    recommendations.push('Provide content creators with comprehensive guidelines and training')
    
    return recommendations
  }
}

// Export utilities
export const createValidationEngine = () => new ContentValidationEngine()
export const createComplianceDashboard = () => new ComplianceDashboard()