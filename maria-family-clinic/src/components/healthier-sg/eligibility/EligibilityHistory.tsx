// EligibilityHistory Component for Healthier SG
// Shows user's assessment history with tracking and comparison features

'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  History, 
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowLeft,
  RefreshCw,
  Calendar,
  BarChart3,
  FileText,
  Filter,
  Download,
  AlertTriangle
} from 'lucide-react'

import { api } from '@/lib/trpc/client'

interface Assessment {
  id: string
  assessmentDate: Date
  eligibilityStatus: string
  evaluationResult: {
    isEligible: boolean
    confidence: number
    score: number
    criteriaResults: Array<{
      name: string
      passed: boolean
      score: number
      description: string
    }>
  }
  createdAt: Date
  updatedAt: Date
}

interface HistorySummary {
  totalAssessments: number
  eligibleAssessments: number
  successRate: number
  lastAssessmentDate?: Date
}

interface EligibilityHistoryProps {
  onBack: () => void
  onStartNew: () => void
  className?: string
}

export function EligibilityHistory({
  onBack,
  onStartNew,
  className
}: EligibilityHistoryProps) {
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null)
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ELIGIBLE' | 'NOT_ELIGIBLE'>('ALL')

  // API queries
  const { data: historyData, isLoading, error } = api.healthierSg.getEligibilityHistory.useQuery({
    limit: 50,
    offset: 0,
  })

  const getStatusIcon = (isEligible: boolean) => {
    return isEligible ? (
      <CheckCircle className="h-5 w-5 text-green-500" />
    ) : (
      <XCircle className="h-5 w-5 text-red-500" />
    )
  }

  const getStatusColor = (isEligible: boolean) => {
    return isEligible ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
  }

  const getTrendIcon = (current: boolean, previous?: boolean) => {
    if (previous === undefined) return <Minus className="h-4 w-4 text-gray-400" />
    if (current === previous) return <Minus className="h-4 w-4 text-gray-400" />
    return current ? (
      <TrendingUp className="h-4 w-4 text-green-500" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-500" />
    )
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-orange-600'
    return 'text-red-600'
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-SG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const filteredAssessments = historyData?.assessments.filter(assessment => {
    if (filterStatus === 'ALL') return true
    if (filterStatus === 'ELIGIBLE') return assessment.evaluationResult.isEligible
    if (filterStatus === 'NOT_ELIGIBLE') return !assessment.evaluationResult.isEligible
    return true
  }) || []

  const exportHistory = () => {
    if (!historyData?.assessments) return

    const exportData = historyData.assessments.map(assessment => ({
      date: formatDate(assessment.assessmentDate),
      status: assessment.eligibilityStatus,
      score: assessment.evaluationResult.score,
      confidence: Math.round(assessment.evaluationResult.confidence * 100),
      criteria: assessment.evaluationResult.criteriaResults.length
    }))

    const csvContent = [
      'Date,Status,Score,Confidence,Criteria Count',
      ...exportData.map(row => `${row.date},${row.status},${row.score}%,${row.confidence}%,${row.criteria}`)
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `healthier-sg-history-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (isLoading) {
    return (
      <div className={`max-w-6xl mx-auto p-4 ${className}`}>
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <Clock className="h-8 w-8 animate-spin mx-auto text-primary" />
              <p className="text-muted-foreground">Loading assessment history...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`max-w-6xl mx-auto p-4 ${className}`}>
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <AlertTriangle className="h-8 w-8 text-red-500 mx-auto" />
              <p className="text-red-600">Failed to load assessment history</p>
              <Button variant="outline" onClick={() => window.location.reload()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const assessments = filteredAssessments
  const summary = historyData?.summary

  return (
    <div className={`max-w-6xl mx-auto p-4 space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center space-x-2">
              <History className="h-6 w-6" />
              <span>Eligibility Assessment History</span>
            </h1>
            <p className="text-muted-foreground">Track your assessment progress over time</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={exportHistory} disabled={!assessments.length}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={onStartNew}>
            <RefreshCw className="h-4 w-4 mr-2" />
            New Assessment
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Assessments</p>
                  <p className="text-2xl font-bold">{summary.totalAssessments}</p>
                </div>
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Eligible Results</p>
                  <p className="text-2xl font-bold text-green-600">{summary.eligibleAssessments}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Success Rate</p>
                  <p className="text-2xl font-bold">{Math.round(summary.successRate)}%</p>
                </div>
                <BarChart3 className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Last Assessment</p>
                  <p className="text-sm font-medium">
                    {summary.lastAssessmentDate 
                      ? formatDate(summary.lastAssessmentDate).split(',')[0]
                      : 'None'}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4" />
              <span className="text-sm font-medium">Filter:</span>
            </div>
            <div className="flex space-x-2">
              {['ALL', 'ELIGIBLE', 'NOT_ELIGIBLE'].map((status) => (
                <Button
                  key={status}
                  variant={filterStatus === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus(status as any)}
                >
                  {status === 'ALL' ? 'All Results' : 
                   status === 'ELIGIBLE' ? 'Eligible Only' : 'Not Eligible'}
                </Button>
              ))}
            </div>
            <div className="text-sm text-muted-foreground">
              Showing {assessments.length} of {historyData?.pagination.total || 0} assessments
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assessment List */}
      {!assessments.length ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <History className="h-12 w-12 text-muted-foreground mx-auto" />
              <div>
                <p className="text-lg font-medium">No Assessment History</p>
                <p className="text-muted-foreground">
                  {filterStatus === 'ALL' 
                    ? 'You haven\'t completed any eligibility assessments yet.'
                    : `No assessments found with status: ${filterStatus}`}
                </p>
              </div>
              <Button onClick={onStartNew}>
                Start Your First Assessment
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {assessments.map((assessment, index) => {
            const previousAssessment = assessments[index + 1]
            const isLatest = index === 0

            return (
              <Card 
                key={assessment.id}
                className={`transition-all hover:shadow-md ${
                  isLatest ? 'border-primary/20 bg-primary/5' : ''
                } ${selectedAssessment?.id === assessment.id ? 'ring-2 ring-primary/50' : ''}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(assessment.evaluationResult.isEligible)}
                          <div>
                            <div className="flex items-center space-x-2">
                              <h3 className="font-semibold">
                                Assessment #{assessments.length - index}
                                {isLatest && <Badge variant="default" className="ml-2">Latest</Badge>}
                              </h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(assessment.assessmentDate)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {getTrendIcon(
                            assessment.evaluationResult.isEligible,
                            previousAssessment?.evaluationResult.isEligible
                          )}
                          <Badge className={getStatusColor(assessment.evaluationResult.isEligible)}>
                            {assessment.eligibilityStatus}
                          </Badge>
                        </div>
                      </div>

                      {/* Metrics */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className={`text-xl font-bold ${getScoreColor(assessment.evaluationResult.score)}`}>
                            {Math.round(assessment.evaluationResult.score)}%
                          </div>
                          <div className="text-xs text-muted-foreground">Overall Score</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-bold text-blue-600">
                            {Math.round(assessment.evaluationResult.confidence * 100)}%
                          </div>
                          <div className="text-xs text-muted-foreground">Confidence</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-bold">
                            {assessment.evaluationResult.criteriaResults.filter(c => c.passed).length}
                          </div>
                          <div className="text-xs text-muted-foreground">Criteria Met</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-bold">
                            {assessment.evaluationResult.criteriaResults.length}
                          </div>
                          <div className="text-xs text-muted-foreground">Total Criteria</div>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Eligibility Score</span>
                          <span className={getScoreColor(assessment.evaluationResult.score)}>
                            {Math.round(assessment.evaluationResult.score)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              assessment.evaluationResult.score >= 70 ? 'bg-green-500' : 
                              assessment.evaluationResult.score >= 50 ? 'bg-orange-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${assessment.evaluationResult.score}%` }}
                          />
                        </div>
                      </div>

                      {/* Quick Criteria Summary */}
                      <div className="flex flex-wrap gap-1">
                        {assessment.evaluationResult.criteriaResults.slice(0, 3).map((criteria, criteriaIndex) => (
                          <Badge
                            key={criteriaIndex}
                            variant={criteria.passed ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {criteria.name}
                          </Badge>
                        ))}
                        {assessment.evaluationResult.criteriaResults.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{assessment.evaluationResult.criteriaResults.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col space-y-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedAssessment(
                          selectedAssessment?.id === assessment.id ? null : assessment
                        )}
                      >
                        {selectedAssessment?.id === assessment.id ? 'Hide Details' : 'View Details'}
                      </Button>
                    </div>
                  </div>

                  {/* Detailed Breakdown */}
                  {selectedAssessment?.id === assessment.id && (
                    <div className="mt-6 pt-6 border-t space-y-4">
                      <h4 className="font-semibold">Detailed Criteria Breakdown</h4>
                      <div className="grid gap-3">
                        {assessment.evaluationResult.criteriaResults.map((criteria, criteriaIndex) => (
                          <div
                            key={criteriaIndex}
                            className={`flex items-center justify-between p-3 rounded-lg ${
                              criteria.passed ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              {getStatusIcon(criteria.passed)}
                              <div>
                                <h5 className="font-medium">{criteria.name}</h5>
                                <p className="text-sm text-muted-foreground">{criteria.description}</p>
                              </div>
                            </div>
                            <Badge variant={criteria.passed ? 'default' : 'destructive'}>
                              {criteria.passed ? 'Passed' : 'Failed'} • {criteria.score} pts
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Load More / Pagination */}
      {historyData?.pagination.hasMore && (
        <Card>
          <CardContent className="text-center py-6">
            <p className="text-muted-foreground">
              Showing {assessments.length} of {historyData.pagination.total} assessments
            </p>
            <Button variant="outline" className="mt-3">
              Load More
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Tips */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-1">
            <p className="font-medium">Assessment History Tips</p>
            <ul className="text-sm space-y-1 ml-4">
              <li>• Your eligibility can change over time as circumstances evolve</li>
              <li>• Regular assessments help track your progress and readiness</li>
              <li>• Consider reassessing if your health or personal situation changes</li>
              <li>• Successful assessments remain valid for enrollment within 6 months</li>
            </ul>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  )
}