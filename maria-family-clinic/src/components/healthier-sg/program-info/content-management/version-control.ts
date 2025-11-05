// Content Version Control & Management System
// Sub-Phase 8.5: Content Management System

import { ContentVersion } from '../types'

// Version control interfaces
interface VersionComparison {
  contentId: string
  fromVersion: number
  toVersion: number
  differences: {
    added: string[]
    removed: string[]
    modified: string[]
  }
  metadata: {
    author: string
    timestamp: Date
    changeType: 'major' | 'minor' | 'patch' | 'emergency'
    reason: string
  }
}

interface ContentWorkflow {
  id: string
  name: string
  steps: WorkflowStep[]
  isActive: boolean
}

interface WorkflowStep {
  id: string
  name: string
  type: 'draft' | 'review' | 'approval' | 'publish' | 'government_review'
  assignees: string[]
  required: boolean
  timeoutHours?: number
  conditions?: {
    contentType?: string[]
    urgency?: 'normal' | 'urgent' | 'emergency'
    tags?: string[]
  }
}

// Version control engine
export class ContentVersionControl {
  private versions: Map<string, ContentVersion[]> = new Map()
  private workflows: Map<string, ContentWorkflow> = new Map()
  
  constructor() {
    this.initializeDefaultWorkflows()
  }

  // Create new version
  createVersion(
    contentId: string,
    title: string,
    content: ContentVersion['content'],
    metadata: Partial<ContentVersion['metadata']>,
    author: string
  ): ContentVersion {
    const existingVersions = this.versions.get(contentId) || []
    const nextVersion = existingVersions.length + 1
    
    const newVersion: ContentVersion = {
      id: `${contentId}-v${nextVersion}`,
      contentId,
      version: nextVersion,
      title,
      content,
      metadata: {
        author,
        approvalStatus: 'DRAFT',
        governmentCompliance: {
          verified: false
        },
        contentCategory: metadata.contentCategory || 'OVERVIEW',
        tags: metadata.tags || [],
        language: metadata.language || ['en'],
        accessibility: {
          wcagCompliant: false,
          altTextAvailable: false,
          screenReaderOptimized: false,
          highContrastSupported: false
        },
        seo: {}
      },
      analytics: {
        views: 0,
        uniqueViews: 0,
        averageEngagementTime: 0,
        completionRate: 0,
        bounceRate: 0
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    existingVersions.push(newVersion)
    this.versions.set(contentId, existingVersions)
    
    return newVersion
  }

  // Get content history
  getVersionHistory(contentId: string): ContentVersion[] {
    return this.versions.get(contentId) || []
  }

  // Get specific version
  getVersion(contentId: string, version: number): ContentVersion | null {
    const versions = this.versions.get(contentId) || []
    return versions.find(v => v.version === version) || null
  }

  // Get latest version
  getLatestVersion(contentId: string): ContentVersion | null {
    const versions = this.versions.get(contentId) || []
    return versions.length > 0 ? versions[versions.length - 1] : null
  }

  // Compare versions
  compareVersions(
    contentId: string,
    fromVersion: number,
    toVersion: number
  ): VersionComparison | null {
    const fromVersionData = this.getVersion(contentId, fromVersion)
    const toVersionData = this.getVersion(contentId, toVersion)
    
    if (!fromVersionData || !toVersionData) {
      return null
    }

    const differences = this.analyzeDifferences(fromVersionData, toVersionData)
    
    return {
      contentId,
      fromVersion,
      toVersion,
      differences,
      metadata: {
        author: toVersionData.metadata.author,
        timestamp: toVersionData.updatedAt,
        changeType: this.determineChangeType(fromVersionData, toVersionData),
        reason: `Updated from version ${fromVersion} to ${toVersion}`
      }
    }
  }

  // Rollback to previous version
  rollbackVersion(contentId: string, targetVersion: number): ContentVersion | null {
    const versions = this.versions.get(contentId) || []
    const target = versions.find(v => v.version === targetVersion)
    
    if (!target) return null
    
    // Create new version based on target
    const rollbackVersion = this.createVersion(
      contentId,
      `${target.title} (Rolled back from v${target.version})`,
      target.content,
      target.metadata,
      'System Rollback'
    )
    
    return rollbackVersion
  }

  // Update approval status
  updateApprovalStatus(
    contentId: string,
    version: number,
    status: ContentVersion['metadata']['approvalStatus'],
    reviewer?: string,
    comments?: string
  ): boolean {
    const versions = this.versions.get(contentId) || []
    const targetVersion = versions.find(v => v.version === version)
    
    if (!targetVersion) return false
    
    targetVersion.metadata.approvalStatus = status
    
    if (reviewer) {
      targetVersion.metadata.reviewer = reviewer
    }
    
    // Mark as published if approved
    if (status === 'APPROVED') {
      targetVersion.publishedAt = new Date()
    }
    
    return true
  }

  // Workflow management
  private initializeDefaultWorkflows() {
    const defaultWorkflows: ContentWorkflow[] = [
      {
        id: 'standard-content',
        name: 'Standard Content Workflow',
        isActive: true,
        steps: [
          {
            id: 'draft',
            name: 'Draft Creation',
            type: 'draft',
            assignees: [],
            required: true
          },
          {
            id: 'internal-review',
            name: 'Internal Review',
            type: 'review',
            assignees: ['content-team'],
            required: true,
            timeoutHours: 48
          },
          {
            id: 'medical-review',
            name: 'Medical Expert Review',
            type: 'review',
            assignees: ['medical-team'],
            required: true,
            timeoutHours: 72
          },
          {
            id: 'government-approval',
            name: 'Government Approval',
            type: 'government_review',
            assignees: ['moh-approver'],
            required: true,
            timeoutHours: 168
          },
          {
            id: 'publish',
            name: 'Publish',
            type: 'publish',
            assignees: ['publisher'],
            required: true
          }
        ]
      },
      {
        id: 'emergency-content',
        name: 'Emergency Content Update',
        isActive: true,
        steps: [
          {
            id: 'draft',
            name: 'Draft Creation',
            type: 'draft',
            assignees: [],
            required: true
          },
          {
            id: 'expedited-review',
            name: 'Expedited Medical Review',
            type: 'review',
            assignees: ['medical-on-call'],
            required: true,
            timeoutHours: 4,
            conditions: {
              urgency: 'urgent'
            }
          },
          {
            id: 'emergency-approval',
            name: 'Emergency Government Approval',
            type: 'government_review',
            assignees: ['moh-emergency'],
            required: true,
            timeoutHours: 2,
            conditions: {
              urgency: 'emergency'
            }
          },
          {
            id: 'immediate-publish',
            name: 'Immediate Publish',
            type: 'publish',
            assignees: ['publisher-on-call'],
            required: true
          }
        ]
      }
    ]

    defaultWorkflows.forEach(workflow => {
      this.workflows.set(workflow.id, workflow)
    })
  }

  // Start workflow for content
  startWorkflow(contentId: string, workflowId: string, initiator: string): {
    success: boolean
    workflowInstanceId?: string
    currentStep?: WorkflowStep
    error?: string
  } {
    const workflow = this.workflows.get(workflowId)
    if (!workflow || !workflow.isActive) {
      return { success: false, error: 'Invalid or inactive workflow' }
    }

    const workflowInstanceId = `workflow-${contentId}-${Date.now()}`
    const firstStep = workflow.steps[0]
    
    // Log workflow start
    console.log(`Workflow ${workflowInstanceId} started for content ${contentId} by ${initiator}`)
    
    return {
      success: true,
      workflowInstanceId,
      currentStep: firstStep
    }
  }

  // Advance workflow to next step
  advanceWorkflow(
    workflowInstanceId: string,
    currentStepId: string,
    completedBy: string,
    result: 'approved' | 'rejected' | 'needs_changes',
    comments?: string
  ): {
    success: boolean
    nextStep?: WorkflowStep
    isComplete: boolean
    error?: string
  } {
    // This would typically interact with a workflow engine
    // For now, we'll simulate the workflow advancement
    
    const workflow = Array.from(this.workflows.values()).find(w => 
      w.steps.some(s => s.id === currentStepId)
    )
    
    if (!workflow) {
      return { success: false, error: 'Workflow not found', isComplete: false }
    }
    
    const currentStepIndex = workflow.steps.findIndex(s => s.id === currentStepId)
    
    if (result === 'rejected') {
      // Workflow rejected - return to draft or cancel
      return { success: true, isComplete: true }
    }
    
    // Move to next step
    const nextStepIndex = currentStepIndex + 1
    const nextStep = workflow.steps[nextStepIndex]
    
    if (!nextStep) {
      // Workflow complete
      return { success: true, isComplete: true }
    }
    
    return {
      success: true,
      nextStep,
      isComplete: false
    }
  }

  // Private helper methods
  private analyzeDifferences(fromVersion: ContentVersion, toVersion: ContentVersion): {
    added: string[]
    removed: string[]
    modified: string[]
  } {
    const differences = {
      added: [] as string[],
      removed: [] as string[],
      modified: [] as string[]
    }

    // Simple text-based diff (in production, use a proper diff library)
    const fromText = JSON.stringify(fromVersion.content)
    const toText = JSON.stringify(toVersion.content)

    // This is a simplified approach - in production, use libraries like 'diff' or 'diff3'
    if (fromText.length < toText.length) {
      differences.added.push('Content expanded')
    } else if (fromText.length > toText.length) {
      differences.removed.push('Content reduced')
    } else {
      differences.modified.push('Content modified')
    }

    return differences
  }

  private determineChangeType(
    fromVersion: ContentVersion,
    toVersion: ContentVersion
  ): 'major' | 'minor' | 'patch' | 'emergency' {
    // Analyze changes to determine semver-style change type
    const fromText = JSON.stringify(fromVersion.content)
    const toText = JSON.stringify(toVersion.content)
    
    // Check for emergency keywords
    const emergencyKeywords = ['urgent', 'emergency', 'critical', 'immediate']
    const hasEmergency = emergencyKeywords.some(keyword => 
      toText.toLowerCase().includes(keyword)
    )
    
    if (hasEmergency) return 'emergency'
    
    // Check change magnitude
    const changeRatio = Math.abs(toText.length - fromText.length) / fromText.length
    
    if (changeRatio > 0.5) return 'major'
    if (changeRatio > 0.2) return 'minor'
    return 'patch'
  }

  // Get workflows
  getWorkflows(): ContentWorkflow[] {
    return Array.from(this.workflows.values())
  }

  // Get workflow by ID
  getWorkflow(workflowId: string): ContentWorkflow | null {
    return this.workflows.get(workflowId) || null
  }
}

// Content analytics tracking
export class ContentAnalytics {
  private analytics: Map<string, any> = new Map()

  // Track content view
  trackView(contentId: string, userId?: string, sessionId?: string): void {
    const key = contentId
    const existing = this.analytics.get(key) || {
      views: 0,
      uniqueViews: new Set(),
      timeSpent: 0,
      interactions: 0,
      shares: 0,
      downloads: 0
    }

    existing.views++
    if (userId) {
      existing.uniqueViews.add(userId)
    }
    if (sessionId) {
      existing.uniqueViews.add(sessionId)
    }

    this.analytics.set(key, existing)
  }

  // Track time spent
  trackTimeSpent(contentId: string, milliseconds: number): void {
    const key = contentId
    const existing = this.analytics.get(key) || { timeSpent: 0, views: 0 }
    
    existing.timeSpent += milliseconds
    existing.views++

    this.analytics.set(key, existing)
  }

  // Track interaction
  trackInteraction(contentId: string, interactionType: string, data?: any): void {
    const key = contentId
    const existing = this.analytics.get(key) || { interactions: 0, interactionTypes: new Map() }
    
    existing.interactions++
    const count = existing.interactionTypes.get(interactionType) || 0
    existing.interactionTypes.set(interactionType, count + 1)

    this.analytics.set(key, existing)
  }

  // Get analytics for content
  getAnalytics(contentId: string) {
    return this.analytics.get(contentId) || {
      views: 0,
      uniqueViews: 0,
      averageTimeSpent: 0,
      interactions: 0,
      shares: 0,
      downloads: 0,
      bounceRate: 0,
      completionRate: 0
    }
  }

  // Get popular content
  getPopularContent(limit: number = 10) {
    const contentData = Array.from(this.analytics.entries())
      .map(([contentId, analytics]) => ({
        contentId,
        score: analytics.views + (analytics.uniqueViews.size * 2) + (analytics.interactions * 1.5),
        analytics
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)

    return contentData
  }

  // Generate content performance report
  generateReport(contentIds: string[]) {
    const report = {
      totalViews: 0,
      totalUniqueViews: 0,
      totalTimeSpent: 0,
      totalInteractions: 0,
      averageEngagement: 0,
      topPerformingContent: [] as any[],
      recommendations: [] as string[]
    }

    let totalEngagementScore = 0
    let validContentCount = 0

    for (const contentId of contentIds) {
      const analytics = this.getAnalytics(contentId)
      
      report.totalViews += analytics.views
      report.totalUniqueViews += analytics.uniqueViews.size || 0
      report.totalTimeSpent += analytics.timeSpent
      report.totalInteractions += analytics.interactions

      const engagementScore = this.calculateEngagementScore(analytics)
      totalEngagementScore += engagementScore
      validContentCount++

      report.topPerformingContent.push({
        contentId,
        views: analytics.views,
        uniqueViews: analytics.uniqueViews.size || 0,
        engagementScore,
        performance: this.getPerformanceRating(engagementScore)
      })
    }

    report.averageEngagement = validContentCount > 0 ? totalEngagementScore / validContentCount : 0
    report.topPerformingContent.sort((a, b) => b.engagementScore - a.engagementScore)

    // Generate recommendations
    report.recommendations = this.generatePerformanceRecommendations(report)

    return report
  }

  private calculateEngagementScore(analytics: any): number {
    const viewsScore = analytics.views * 0.3
    const uniqueViewsScore = (analytics.uniqueViews.size || 0) * 0.4
    const timeScore = (analytics.timeSpent / 1000 / 60) * 0.2 // minutes
    const interactionScore = analytics.interactions * 0.1

    return viewsScore + uniqueViewsScore + timeScore + interactionScore
  }

  private getPerformanceRating(score: number): 'excellent' | 'good' | 'average' | 'poor' {
    if (score >= 80) return 'excellent'
    if (score >= 60) return 'good'
    if (score >= 40) return 'average'
    return 'poor'
  }

  private generatePerformanceRecommendations(report: any): string[] {
    const recommendations: string[] = []

    if (report.averageEngagement < 40) {
      recommendations.push('Content engagement is below average. Consider improving content relevance and readability.')
    }

    if (report.totalViews / contentIds.length < 50) {
      recommendations.push('Content visibility is low. Consider improving SEO and promoting content through official channels.')
    }

    recommendations.push('Monitor content performance regularly and update based on user feedback.')
    recommendations.push('A/B test different content formats to optimize engagement.')
    recommendations.push('Ensure content is mobile-optimized for better accessibility.')

    return recommendations
  }
}

// Export factory functions
export const createVersionControl = () => new ContentVersionControl()
export const createContentAnalytics = () => new ContentAnalytics()

// Export types for external use
export type { VersionComparison, ContentWorkflow, WorkflowStep }