// Healthier SG Eligibility History Tracking
// Assessment history, re-evaluation workflows, and progress tracking

'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { 
  History, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText, 
  Calendar,
  TrendingUp,
  TrendingDown,
  Minus,
  Download,
  Filter,
  Search,
  Eye,
  MoreVertical
} from 'lucide-react'

import { EligibilityAssessment, AssessmentHistory, QuestionnaireResponse } from './types'

interface EligibilityHistoryProps {
  userId?: string
  onSelectAssessment?: (assessment: EligibilityAssessment) => void
  onNewAssessment?: () => void
  onExportData?: () => void
  className?: string
}

export function EligibilityHistory({
  userId,
  onSelectAssessment,
  onNewAssessment,
  onExportData,
  className
}: EligibilityHistoryProps) {
  const [assessments, setAssessments] = useState<EligibilityAssessment[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'eligible' | 'not-eligible' | 'pending'>('all')
  const [sortBy, setSortBy] = useState<'date' | 'score' | 'status'>('date')

  // Mock data for demonstration
  useEffect(() => {
    const mockAssessments: EligibilityAssessment[] = [
      {
        id: 'assessment-1',
        userId,
        responses: [],
        status: 'COMPLETED',
        eligibilityResult: {
          isEligible: true,
          confidence: 0.92,
          reason: 'Meets all eligibility criteria for Healthier SG',
          score: 88,
          criteria: []
        },
        createdAt: new Date('2025-10-15'),
        updatedAt: new Date('2025-10-15'),
        completedAt: new Date('2025-10-15'),
      },
      {
        id: 'assessment-2',
        userId,
        responses: [],
        status: 'COMPLETED',
        eligibilityResult: {
          isEligible: false,
          confidence: 0.78,
          reason: 'Age requirement not met',
          score: 45,
          criteria: []
        },
        createdAt: new Date('2025-09-20'),
        updatedAt: new Date('2025-09-20'),
        completedAt: new Date('2025-09-20'),
      },
      {
        id: 'assessment-3',
        userId,
        responses: [],
        status: 'COMPLETED',
        eligibilityResult: {
          isEligible: true,
          confidence: 0.85,
          reason: 'Meets eligibility criteria with chronic conditions priority',
          score: 92,
          criteria: []
        },
        createdAt: new Date('2025-08-10'),
        updatedAt: new Date('2025-08-10'),
        completedAt: new Date('2025-08-10'),
      },
    ]

    setTimeout(() => {
      setAssessments(mockAssessments)
      setLoading(false)
    }, 1000)
  }, [userId])

  // Filter and sort assessments
  const filteredAssessments = React.useMemo(() => {
    let filtered = assessments

    if (filter === 'eligible') {
      filtered = filtered.filter(a => a.eligibilityResult?.isEligible)
    } else if (filter === 'not-eligible') {
      filtered = filtered.filter(a => a.eligibilityResult && !a.eligibilityResult.isEligible)
    } else if (filter === 'pending') {
      filtered = filtered.filter(a => a.status !== 'COMPLETED')
    }

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.completedAt || b.updatedAt).getTime() - new Date(a.completedAt || a.updatedAt).getTime()
        case 'score':
          return (b.eligibilityResult?.score || 0) - (a.eligibilityResult?.score || 0)
        case 'status':
          return a.status.localeCompare(b.status)
        default:
          return 0
      }
    })
  }, [assessments, filter, sortBy])

  // Calculate statistics
  const stats = React.useMemo(() => {
    const total = assessments.length
    const eligible = assessments.filter(a => a.eligibilityResult?.isEligible).length
    const avgScore = assessments.length > 0 
      ? assessments.reduce((sum, a) => sum + (a.eligibilityResult?.score || 0), 0) / assessments.length
      : 0
    const lastAssessment = assessments.sort((a, b) => 
      new Date(b.completedAt || b.updatedAt).getTime() - new Date(a.completedAt || a.updatedAt).getTime()
    )[0]

    return { total, eligible, avgScore, lastAssessment }
  }, [assessments])

  const getStatusIcon = (assessment: EligibilityAssessment) => {
    if (!assessment.eligibilityResult) return <Clock className="h-4 w-4 text-yellow-600" />
    return assessment.eligibilityResult.isEligible 
      ? <CheckCircle className="h-4 w-4 text-green-600" />
      : <XCircle className="h-4 w-4 text-red-600" />
  }

  const getStatusBadge = (assessment: EligibilityAssessment) => {
    if (!assessment.eligibilityResult) {
      return <Badge variant="outline">In Progress</Badge>
    }
    return assessment.eligibilityResult.isEligible 
      ? <Badge variant="default">Eligible</Badge>
      : <Badge variant="secondary">Not Eligible</Badge>
  }

  const getScoreTrend = (currentScore: number, previousScore?: number) => {
    if (!previousScore) return <Minus className="h-3 w-3 text-gray-400" />
    const diff = currentScore - previousScore
    if (diff > 0) return <TrendingUp className="h-3 w-3 text-green-600" />
    if (diff < 0) return <TrendingDown className="h-3 w-3 text-red-600" />
    return <Minus className="h-3 w-3 text-gray-400" />
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`max-w-6xl mx-auto space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">Eligibility Assessment History</h2>
          <p className="text-muted-foreground">Track your assessment progress and results over time</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={onExportData} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={onNewAssessment} size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            New Assessment
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <History className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total Assessments</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{stats.eligible}</p>
                <p className="text-xs text-muted-foreground">Eligible Results</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{Math.round(stats.avgScore)}%</p>
                <p className="text-xs text-muted-foreground">Average Score</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-sm font-bold">
                  {stats.lastAssessment ? new Date(stats.lastAssessment.completedAt || stats.lastAssessment.updatedAt).toLocaleDateString() : 'None'}
                </p>
                <p className="text-xs text-muted-foreground">Last Assessment</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Sorting */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filter:</span>
              <div className="flex space-x-1">
                {['all', 'eligible', 'not-eligible', 'pending'].map((filterOption) => (
                  <Button
                    key={filterOption}
                    onClick={() => setFilter(filterOption as any)}
                    variant={filter === filterOption ? 'default' : 'outline'}
                    size="sm"
                  >
                    {filterOption === 'not-eligible' ? 'Not Eligible' : 
                     filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            <Separator orientation="vertical" className="h-6" />

            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Sort by:</span>
              <div className="flex space-x-1">
                {[
                  { key: 'date', label: 'Date' },
                  { key: 'score', label: 'Score' },
                  { key: 'status', label: 'Status' }
                ].map((option) => (
                  <Button
                    key={option.key}
                    onClick={() => setSortBy(option.key as any)}
                    variant={sortBy === option.key ? 'default' : 'outline'}
                    size="sm"
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assessment List */}
      <div className="space-y-4">
        {filteredAssessments.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No assessments found</h3>
              <p className="text-muted-foreground mb-4">
                {filter === 'all' 
                  ? "You haven't completed any eligibility assessments yet."
                  : `No assessments match the "${filter}" filter.`}
              </p>
              <Button onClick={onNewAssessment}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Start Your First Assessment
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredAssessments.map((assessment, index) => {
            const previousAssessment = index > 0 ? filteredAssessments[index - 1] : undefined
            const currentScore = assessment.eligibilityResult?.score || 0
            const previousScore = previousAssessment?.eligibilityResult?.score

            return (
              <Card key={assessment.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-6" onClick={() => onSelectAssessment?.(assessment)}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="mt-1">
                        {getStatusIcon(assessment)}
                      </div>
                      
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium">
                            Assessment #{assessments.length - filteredAssessments.indexOf(assessment)}
                          </h4>
                          {getStatusBadge(assessment)}
                          {getScoreTrend(currentScore, previousScore)}
                        </div>
                        
                        <p className="text-sm text-muted-foreground">
                          {assessment.eligibilityResult?.reason || 'Assessment in progress'}
                        </p>
                        
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>
                              {new Date(assessment.completedAt || assessment.updatedAt).toLocaleDateString()}
                            </span>
                          </div>
                          
                          {assessment.eligibilityResult && (
                            <div className="flex items-center space-x-1">
                              <span>Score: {Math.round(currentScore)}%</span>
                              <span>•</span>
                              <span>Confidence: {Math.round(assessment.eligibilityResult.confidence * 100)}%</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Score Visualization */}
                  {assessment.eligibilityResult && (
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Eligibility Score</span>
                        <span className="font-medium">{Math.round(currentScore)}%</span>
                      </div>
                      <Progress value={currentScore} className="h-2" />
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* Insights and Recommendations */}
      {stats.total > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Assessment Insights</CardTitle>
            <CardDescription>
              Based on your assessment history
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Alert>
                <TrendingUp className="h-4 w-4" />
                <AlertDescription>
                  <strong>Eligibility Rate:</strong> {Math.round((stats.eligible / stats.total) * 100)}% 
                  of your assessments show eligibility for Healthier SG.
                </AlertDescription>
              </Alert>
              
              <Alert>
                <RefreshCw className="h-4 w-4" />
                <AlertDescription>
                  <strong>Recommendation:</strong> 
                  {stats.eligible > 0 
                    ? ' You have shown eligibility - consider proceeding with enrollment.'
                    : ' Focus on areas that could improve your eligibility score.'}
                </AlertDescription>
              </Alert>
            </div>
            
            {stats.lastAssessment && (
              <div className="text-sm text-muted-foreground">
                <strong>Next Steps:</strong> 
                Your latest assessment was on {new Date(stats.lastAssessment.completedAt || stats.lastAssessment.updatedAt).toLocaleDateString()}.
                {stats.lastAssessment.eligibilityResult?.isEligible 
                  ? ' You appear eligible - consider finding a participating clinic.'
                  : ' Consider reassessing if your circumstances have changed.'}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Mobile-optimized history component
export function MobileEligibilityHistory(props: EligibilityHistoryProps) {
  return (
    <div className="px-4 pb-4">
      <EligibilityHistory {...props} className="max-w-full" />
    </div>
  )
}