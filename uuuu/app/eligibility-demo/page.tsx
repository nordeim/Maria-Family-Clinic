// Healthier SG Interactive Eligibility Checker Demo Page
// Complete demonstration of the Sub-Phase 8.3 implementation

'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  CheckCircle, 
  Clock, 
  Users, 
  Shield, 
  Heart,
  FileText,
  Play,
  Code,
  Download,
  ExternalLink
} from 'lucide-react'

import {
  EligibilityChecker,
  QuestionCard,
  ProgressIndicator,
  ResultsDisplay,
  EligibilityHistory,
  HelpTooltip,
  DEFAULT_HEALTHIER_SG_QUESTIONS
} from '@/components/healthier-sg'

import { 
  EligibilityAssessment, 
  QuestionnaireResponse,
  MyInfoData,
  ELIGIBILITY_HELP_CONTENT 
} from '@/components/healthier-sg/types'

export default function EligibilityCheckerDemo() {
  const [activeDemo, setActiveDemo] = useState<'full' | 'questions' | 'progress' | 'results' | 'history'>('full')
  const [assessment, setAssessment] = useState<EligibilityAssessment | null>(null)
  const [responses, setResponses] = useState<QuestionnaireResponse[]>([])
  const [showResults, setShowResults] = useState(false)

  const handleAssessmentComplete = (completedAssessment: EligibilityAssessment) => {
    setAssessment(completedAssessment)
    setShowResults(true)
  }

  const handleResponsesSave = (newResponses: QuestionnaireResponse[]) => {
    setResponses(newResponses)
  }

  const handleReset = () => {
    setAssessment(null)
    setResponses([])
    setShowResults(false)
  }

  const renderFullDemo = () => (
    <div className="space-y-6">
      {!showResults ? (
        <EligibilityChecker
          onComplete={handleAssessmentComplete}
          onSave={handleResponsesSave}
          enableRealTimeEvaluation={true}
          showProgress={true}
          enableMultilingual={true}
          enableOfflineMode={true}
        />
      ) : assessment && (
        <ResultsDisplay
          evaluation={{
            isEligible: assessment.eligibilityResult?.isEligible || false,
            confidence: assessment.eligibilityResult?.confidence || 0,
            score: assessment.eligibilityResult?.score || 0,
            criteriaResults: assessment.eligibilityResult?.criteria || [],
            nextSteps: [
              {
                title: 'Choose participating clinic',
                description: 'Find a Healthier SG partner clinic near you',
                priority: 'HIGH',
                actionRequired: true
              },
              {
                title: 'Schedule enrollment',
                description: 'Book your initial consultation',
                priority: 'HIGH',
                actionRequired: true
              }
            ]
          }}
          onReset={handleReset}
          onViewHistory={() => setActiveDemo('history')}
        />
      )}
    </div>
  )

  const renderQuestionDemo = () => (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold">QuestionCard Component Demo</h2>
        <p className="text-muted-foreground">
          Individual question components with different input types and validation
        </p>
      </div>

      <div className="grid gap-6">
        {DEFAULT_HEALTHIER_SG_QUESTIONS.slice(0, 3).map((question, index) => (
          <QuestionCard
            key={question.id}
            question={question}
            value={responses.find(r => r.questionId === question.id)?.value}
            onChange={(value) => {
              const newResponse: QuestionnaireResponse = {
                questionId: question.id,
                value,
                timestamp: new Date()
              }
              setResponses(prev => {
                const filtered = prev.filter(r => r.questionId !== question.id)
                return [...filtered, newResponse]
              })
            }}
            showValidationErrors={false}
            language="en"
          />
        ))}
      </div>
    </div>
  )

  const renderProgressDemo = () => (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold">ProgressIndicator Component Demo</h2>
        <p className="text-muted-foreground">
          Visual progress tracking with real-time updates
        </p>
      </div>

      <div className="grid gap-6">
        <ProgressIndicator
          currentStep={2}
          totalSteps={5}
          responses={responses}
        />
        
        <ProgressIndicator
          currentStep={0}
          totalSteps={5}
          responses={[]}
        />
        
        <ProgressIndicator
          currentStep={4}
          totalSteps={5}
          responses={DEFAULT_HEALTHIER_SG_QUESTIONS.map(q => ({
            questionId: q.id,
            value: 'completed',
            timestamp: new Date()
          }))}
        />
      </div>
    </div>
  )

  const renderResultsDemo = () => (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold">ResultsDisplay Component Demo</h2>
        <p className="text-muted-foreground">
          Comprehensive eligibility results with detailed breakdown
        </p>
      </div>

      <ResultsDisplay
        evaluation={{
          isEligible: true,
          confidence: 0.85,
          score: 85,
          criteriaResults: [
            {
              name: 'Age Requirement',
              passed: true,
              score: 25,
              description: 'Must be 40 years or older',
              recommendation: 'Meets age requirement'
            },
            {
              name: 'Citizenship Status',
              passed: true,
              score: 30,
              description: 'Must be Singapore Citizen or Permanent Resident',
              recommendation: 'Meets citizenship requirement'
            },
            {
              name: 'Chronic Conditions',
              passed: true,
              score: 20,
              description: 'Having chronic conditions provides priority consideration',
              recommendation: 'Has chronic conditions - eligible for priority'
            },
            {
              name: 'Screening Consent',
              passed: true,
              score: 15,
              description: 'Must consent to health screening and data collection',
              recommendation: 'Consents to screening requirements'
            },
            {
              name: 'Program Commitment',
              passed: true,
              score: 10,
              description: 'Must demonstrate willingness to participate',
              recommendation: 'Shows commitment to program'
            }
          ],
          nextSteps: [
            {
              title: 'Choose participating clinic',
              description: 'Find a Healthier SG partner clinic near you',
              priority: 'HIGH',
              actionRequired: true
            },
            {
              title: 'Schedule enrollment',
              description: 'Book your initial consultation',
              priority: 'HIGH',
              actionRequired: true
            }
          ],
          appealsAvailable: true,
          appealDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }}
        onReset={() => {}}
      />

      <ResultsDisplay
        evaluation={{
          isEligible: false,
          confidence: 0.65,
          score: 45,
          criteriaResults: [
            {
              name: 'Age Requirement',
              passed: false,
              score: 0,
              description: 'Must be 40 years or older',
              recommendation: 'Must be 40 or older to qualify'
            },
            {
              name: 'Citizenship Status',
              passed: true,
              score: 30,
              description: 'Must be Singapore Citizen or Permanent Resident',
              recommendation: 'Meets citizenship requirement'
            },
            {
              name: 'Chronic Conditions',
              passed: false,
              score: 0,
              description: 'Having chronic conditions provides priority consideration',
              recommendation: 'No chronic conditions reported'
            },
            {
              name: 'Screening Consent',
              passed: true,
              score: 15,
              description: 'Must consent to health screening and data collection',
              recommendation: 'Consents to screening requirements'
            },
            {
              name: 'Program Commitment',
              passed: false,
              score: 0,
              description: 'Must demonstrate willingness to participate',
              recommendation: 'Must be willing to participate actively'
            }
          ],
          nextSteps: [
            {
              title: 'Review eligibility criteria',
              description: 'Understand which requirements are not met',
              priority: 'HIGH',
              actionRequired: false
            }
          ],
          appealsAvailable: true,
          appealDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }}
        onReset={() => {}}
      />
    </div>
  )

  const renderHistoryDemo = () => (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold">EligibilityHistory Component Demo</h2>
        <p className="text-muted-foreground">
          Assessment tracking and comparison features
        </p>
      </div>

      <EligibilityHistory
        onBack={() => setActiveDemo('full')}
        onStartNew={() => {
          setActiveDemo('full')
          handleReset()
        }}
      />
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Healthier SG Interactive Eligibility Checker</h1>
              <p className="text-muted-foreground mt-2">
                Complete Sub-Phase 8.3 Implementation • Real-time Assessment • Government Compliant
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <Badge variant="outline" className="flex items-center space-x-1">
                <Shield className="h-3 w-3" />
                <span>WCAG 2.2 AA</span>
              </Badge>
              <Badge variant="outline" className="flex items-center space-x-1">
                <Heart className="h-3 w-3" />
                <span>MOH Compliant</span>
              </Badge>
              <Badge variant="outline" className="flex items-center space-x-1">
                <Users className="h-3 w-3" />
                <span>Multi-language</span>
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Navigation */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center space-x-2 mb-8">
          <Button
            variant={activeDemo === 'full' ? 'default' : 'outline'}
            onClick={() => setActiveDemo('full')}
            className="flex items-center space-x-2"
          >
            <Play className="h-4 w-4" />
            <span>Full Assessment</span>
          </Button>
          
          <Button
            variant={activeDemo === 'questions' ? 'default' : 'outline'}
            onClick={() => setActiveDemo('questions')}
            className="flex items-center space-x-2"
          >
            <FileText className="h-4 w-4" />
            <span>Questions</span>
          </Button>
          
          <Button
            variant={activeDemo === 'progress' ? 'default' : 'outline'}
            onClick={() => setActiveDemo('progress')}
            className="flex items-center space-x-2"
          >
            <Clock className="h-4 w-4" />
            <span>Progress</span>
          </Button>
          
          <Button
            variant={activeDemo === 'results' ? 'default' : 'outline'}
            onClick={() => setActiveDemo('results')}
            className="flex items-center space-x-2"
          >
            <CheckCircle className="h-4 w-4" />
            <span>Results</span>
          </Button>
          
          <Button
            variant={activeDemo === 'history' ? 'default' : 'outline'}
            onClick={() => setActiveDemo('history')}
            className="flex items-center space-x-2"
          >
            <FileText className="h-4 w-4" />
            <span>History</span>
          </Button>
        </div>

        {/* Demo Content */}
        {activeDemo === 'full' && renderFullDemo()}
        {activeDemo === 'questions' && renderQuestionDemo()}
        {activeDemo === 'progress' && renderProgressDemo()}
        {activeDemo === 'results' && renderResultsDemo()}
        {activeDemo === 'history' && renderHistoryDemo()}

        {/* Implementation Info */}
        <div className="mt-12 pt-8 border-t">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Code className="h-5 w-5" />
                <span>Implementation Details</span>
              </CardTitle>
              <CardDescription>
                Sub-Phase 8.3: Interactive Eligibility Checker System - Complete Implementation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold">Core Features</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Multi-step questionnaire with progressive disclosure</li>
                    <li>• Real-time eligibility evaluation with rule engine</li>
                    <li>• Auto-save functionality with offline capability</li>
                    <li>• Comprehensive results with detailed breakdown</li>
                    <li>• Assessment history tracking and comparison</li>
                    <li>• Appeal submission system</li>
                    <li>• Multilingual support (EN, ZH, MS, TA)</li>
                    <li>• WCAG 2.2 AA accessibility compliance</li>
                  </ul>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-semibold">Technical Stack</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• React with TypeScript</li>
                    <li>• tRPC for type-safe APIs</li>
                    <li>• Zod for validation schemas</li>
                    <li>• Tailwind CSS for styling</li>
                    <li>• Radix UI for accessibility</li>
                    <li>• Prisma for database integration</li>
                    <li>• Comprehensive testing suite</li>
                    <li>• Government compliance framework</li>
                  </ul>
                </div>
              </div>

              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="font-medium">Government Compliance & Security</p>
                    <p className="text-sm">
                      This implementation follows Singapore government standards for healthcare applications, 
                      including PDPA compliance, MOH regulations, and accessibility requirements. 
                      The system is designed for integration with national health systems.
                    </p>
                  </div>
                </AlertDescription>
              </Alert>

              <div className="flex flex-wrap gap-3 pt-4">
                <Button variant="outline" className="flex items-center space-x-2">
                  <Download className="h-4 w-4" />
                  <span>Download Documentation</span>
                </Button>
                
                <Button variant="outline" className="flex items-center space-x-2">
                  <ExternalLink className="h-4 w-4" />
                  <span>API Documentation</span>
                </Button>
                
                <Button variant="outline" className="flex items-center space-x-2">
                  <Code className="h-4 w-4" />
                  <span>View Source Code</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}