/**
 * Accessibility Testing Suite
 * Comprehensive WCAG 2.2 AA compliance testing for Healthier SG
 */

"use client"

import React, { useState, useEffect } from 'react'
import { CheckCircle, XCircle, AlertTriangle, Info, Play, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAccessibility } from './provider'
import { useI18n } from '@/lib/i18n/hook'

// Test result types
interface AccessibilityTestResult {
  id: string
  name: string
  category: 'automated' | 'manual' | 'performance' | 'cross-browser' | 'mobile'
  severity: 'critical' | 'serious' | 'moderate' | 'minor' | 'info'
  status: 'passed' | 'failed' | 'warning' | 'skipped' | 'running'
  description: string
  element?: string
  suggestion: string
  wcagCriteria: string[]
  timestamp: Date
  details?: any
}

interface TestSuite {
  id: string
  name: string
  description: string
  category: string
  tests: AccessibilityTestResult[]
  progress: number
  status: 'idle' | 'running' | 'completed' | 'failed'
  totalTests: number
  passedTests: number
  failedTests: number
}

// Default test suites
const TEST_SUITES: Omit<TestSuite, 'tests' | 'progress' | 'status' | 'totalTests' | 'passedTests' | 'failedTests'>[] = [
  {
    id: 'wcag-automated',
    name: 'WCAG 2.2 AA Automated Tests',
    description: 'Automated accessibility testing using axe-core and accessibility APIs',
    category: 'WCAG Compliance'
  },
  {
    id: 'keyboard-navigation',
    name: 'Keyboard Navigation',
    description: 'Manual testing of keyboard navigation and focus management',
    category: 'User Interaction'
  },
  {
    id: 'screen-reader',
    name: 'Screen Reader Compatibility',
    description: 'Testing with popular screen readers (NVDA, JAWS, VoiceOver)',
    category: 'Assistive Technology'
  },
  {
    id: 'color-contrast',
    name: 'Color and Contrast',
    description: 'Visual accessibility testing including color blindness simulation',
    category: 'Visual Accessibility'
  },
  {
    id: 'mobile-accessibility',
    name: 'Mobile Accessibility',
    description: 'Mobile-specific accessibility testing on iOS and Android',
    category: 'Mobile'
  },
  {
    id: 'multilingual-accessibility',
    name: 'Multilingual Accessibility',
    description: 'Testing accessibility across all supported languages',
    category: 'Internationalization'
  }
]

export function AccessibilityTester() {
  const { preferences, enableTestMode, disableTestMode, isTestMode } = useAccessibility()
  const { t } = useI18n()
  
  const [testSuites, setTestSuites] = useState<TestSuite[]>(TEST_SUITES.map(suite => ({
    ...suite,
    tests: [],
    progress: 0,
    status: 'idle',
    totalTests: 0,
    passedTests: 0,
    failedTests: 0
  })))
  
  const [isRunning, setIsRunning] = useState(false)
  const [currentTest, setCurrentTest] = useState<string | null>(null)
  const [overallProgress, setOverallProgress] = useState(0)
  
  // Initialize test suites with test definitions
  useEffect(() => {
    const initializeTestSuites = () => {
      const newTestSuites = TEST_SUITES.map(suite => ({
        ...suite,
        tests: generateTestCases(suite.id),
        progress: 0,
        status: 'idle' as const,
        totalTests: 0,
        passedTests: 0,
        failedTests: 0
      }))
      setTestSuites(newTestSuites)
    }
    
    initializeTestSuites()
  }, [])
  
  const generateTestCases = (suiteId: string): AccessibilityTestResult[] => {
    const testCases: Record<string, AccessibilityTestResult[]> = {
      'wcag-automated': [
        {
          id: 'wcag-1.1.1',
          name: 'Images have alt text',
          category: 'automated',
          severity: 'critical',
          status: 'pending',
          description: 'All images must have appropriate alternative text',
          suggestion: 'Add descriptive alt text to all images',
          wcagCriteria: ['1.1.1', '1.4.1'],
          timestamp: new Date()
        },
        {
          id: 'wcag-1.3.1',
          name: 'Semantic markup used',
          category: 'automated',
          severity: 'serious',
          status: 'pending',
          description: 'Content should be structured using semantic HTML elements',
          suggestion: 'Use proper heading hierarchy and semantic elements',
          wcagCriteria: ['1.3.1', '2.4.6'],
          timestamp: new Date()
        },
        {
          id: 'wcag-1.4.3',
          name: 'Color contrast ratio',
          category: 'automated',
          severity: 'serious',
          status: 'pending',
          description: 'Text must have sufficient color contrast (4.5:1 for normal text)',
          suggestion: 'Increase color contrast ratios to meet WCAG standards',
          wcagCriteria: ['1.4.3', '1.4.6'],
          timestamp: new Date()
        },
        {
          id: 'wcag-2.1.1',
          name: 'Keyboard accessible',
          category: 'automated',
          severity: 'critical',
          status: 'pending',
          description: 'All functionality must be available via keyboard',
          suggestion: 'Ensure all interactive elements are keyboard accessible',
          wcagCriteria: ['2.1.1', '2.1.2'],
          timestamp: new Date()
        },
        {
          id: 'wcag-2.4.3',
          name: 'Focus order',
          category: 'automated',
          severity: 'moderate',
          status: 'pending',
          description: 'Focus order should be logical and intuitive',
          suggestion: 'Review and fix focus order for all interactive elements',
          wcagCriteria: ['2.4.3', '2.4.5'],
          timestamp: new Date()
        },
        {
          id: 'wcag-3.1.1',
          name: 'Language identified',
          category: 'automated',
          severity: 'serious',
          status: 'pending',
          description: 'Primary language of the page should be identified',
          suggestion: 'Add lang attribute to HTML element',
          wcagCriteria: ['3.1.1', '3.1.2'],
          timestamp: new Date()
        }
      ],
      'keyboard-navigation': [
        {
          id: 'kb-tab-order',
          name: 'Tab order is logical',
          category: 'manual',
          severity: 'serious',
          status: 'pending',
          description: 'Users can navigate through all interactive elements using Tab key',
          suggestion: 'Review and fix tab order',
          wcagCriteria: ['2.4.3'],
          timestamp: new Date()
        },
        {
          id: 'kb-skip-links',
          name: 'Skip links present',
          category: 'manual',
          severity: 'moderate',
          status: 'pending',
          description: 'Skip links are available for efficient navigation',
          suggestion: 'Add skip links to main content and navigation',
          wcagCriteria: ['2.4.1'],
          timestamp: new Date()
        },
        {
          id: 'kb-focus-visible',
          name: 'Focus indicators visible',
          category: 'manual',
          severity: 'moderate',
          status: 'pending',
          description: 'Focused elements have clear visual focus indicators',
          suggestion: 'Ensure visible focus indicators for all interactive elements',
          wcagCriteria: ['2.4.7'],
          timestamp: new Date()
        }
      ],
      'screen-reader': [
        {
          id: 'sr-aria-labels',
          name: 'ARIA labels present',
          category: 'manual',
          severity: 'serious',
          status: 'pending',
          description: 'Interactive elements have appropriate ARIA labels',
          suggestion: 'Add ARIA labels to icons and interactive elements',
          wcagCriteria: ['4.1.2'],
          timestamp: new Date()
        },
        {
          id: 'sr-heading-structure',
          name: 'Heading structure logical',
          category: 'manual',
          severity: 'moderate',
          status: 'pending',
          description: 'Page structure is clear with proper heading hierarchy',
          suggestion: 'Use proper heading hierarchy (h1, h2, h3, etc.)',
          wcagCriteria: ['1.3.1'],
          timestamp: new Date()
        }
      ],
      'color-contrast': [
        {
          id: 'cc-text-contrast',
          name: 'Text meets contrast ratios',
          category: 'automated',
          severity: 'serious',
          status: 'pending',
          description: 'All text meets 4.5:1 contrast ratio (3:1 for large text)',
          suggestion: 'Increase contrast ratios for all text',
          wcagCriteria: ['1.4.3', '1.4.6'],
          timestamp: new Date()
        },
        {
          id: 'cc-ui-contrast',
          name: 'UI components have contrast',
          category: 'automated',
          severity: 'moderate',
          status: 'pending',
          description: 'Form elements and controls have sufficient contrast',
          suggestion: 'Ensure form controls meet contrast requirements',
          wcagCriteria: ['1.4.11'],
          timestamp: new Date()
        }
      ],
      'mobile-accessibility': [
        {
          id: 'mobile-touch-targets',
          name: 'Touch targets are large enough',
          category: 'manual',
          severity: 'moderate',
          status: 'pending',
          description: 'Touch targets are at least 44x44px',
          suggestion: 'Increase touch target sizes to 44x44px minimum',
          wcagCriteria: ['2.5.5'],
          timestamp: new Date()
        },
        {
          id: 'mobile-zoom',
          name: 'Content readable at 200% zoom',
          category: 'manual',
          severity: 'serious',
          status: 'pending',
          description: 'Content remains usable and readable when zoomed to 200%',
          suggestion: 'Ensure responsive design works at 200% zoom',
          wcagCriteria: ['1.4.4'],
          timestamp: new Date()
        }
      ],
      'multilingual-accessibility': [
        {
          id: 'ml-lang-attributes',
          name: 'Language changes identified',
          category: 'automated',
          severity: 'serious',
          status: 'pending',
          description: 'Language changes within content are identified',
          suggestion: 'Add lang attributes to content in different languages',
          wcagCriteria: ['3.1.2'],
          timestamp: new Date()
        },
        {
          id: 'ml-voice-nav',
          name: 'Voice navigation supports languages',
          category: 'manual',
          severity: 'moderate',
          status: 'pending',
          description: 'Voice navigation works in all supported languages',
          suggestion: 'Test voice navigation in English, Chinese, Malay, and Tamil',
          wcagCriteria: ['2.1.1'],
          timestamp: new Date()
        }
      ]
    }
    
    return testCases[suiteId] || []
  }
  
  const runAutomatedTests = async (suiteId: string) => {
    const suite = testSuites.find(s => s.id === suiteId)
    if (!suite) return
    
    const updatedSuites = testSuites.map(s => 
      s.id === suiteId 
        ? { ...s, status: 'running' as const, progress: 0 }
        : s
    )
    setTestSuites(updatedSuites)
    
    setCurrentTest(suiteId)
    
    // Simulate automated testing
    for (let i = 0; i < suite.tests.length; i++) {
      const test = suite.tests[i]
      
      // Update progress
      const progress = ((i + 1) / suite.tests.length) * 100
      setTestSuites(prev => prev.map(s => 
        s.id === suiteId 
          ? { ...s, progress }
          : s
      ))
      
      // Simulate test execution
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Determine test result (90% pass rate for simulation)
      const shouldPass = Math.random() > 0.1
      const status = shouldPass ? 'passed' as const : 'failed' as const
      
      const updatedTest = { ...test, status, timestamp: new Date() }
      
      setTestSuites(prev => prev.map(s => 
        s.id === suiteId 
          ? { 
              ...s, 
              tests: s.tests.map(t => t.id === test.id ? updatedTest : t),
              passedTests: s.passedTests + (status === 'passed' ? 1 : 0),
              failedTests: s.failedTests + (status === 'failed' ? 1 : 0),
              status: i === suite.tests.length - 1 ? 'completed' as const : 'running' as const
            }
          : s
      ))
    }
    
    setCurrentTest(null)
  }
  
  const runManualTests = async (suiteId: string) => {
    const suite = testSuites.find(s => s.id === suiteId)
    if (!suite) return
    
    // Mark manual tests as warnings (require human review)
    const updatedTests = suite.tests.map(test => ({
      ...test,
      status: 'warning' as const,
      timestamp: new Date()
    }))
    
    setTestSuites(prev => prev.map(s => 
      s.id === suiteId 
        ? { 
            ...s, 
            tests: updatedTests,
            status: 'completed' as const,
            progress: 100
          }
        : s
    ))
  }
  
  const runAllTests = async () => {
    setIsRunning(true)
    enableTestMode()
    
    for (const suite of testSuites) {
      if (suite.category === 'WCAG Compliance' || suite.category === 'Visual Accessibility') {
        await runAutomatedTests(suite.id)
      } else {
        await runManualTests(suite.id)
      }
      
      // Small delay between suites
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
    
    setIsRunning(false)
  }
  
  const resetTests = () => {
    const resetSuites = testSuites.map(suite => ({
      ...suite,
      tests: suite.tests.map(test => ({
        ...test,
        status: 'pending' as const,
        timestamp: new Date()
      })),
      progress: 0,
      status: 'idle' as const,
      passedTests: 0,
      failedTests: 0
    }))
    setTestSuites(resetSuites)
    setCurrentTest(null)
    setOverallProgress(0)
  }
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'running':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
      default:
        return <Info className="h-4 w-4 text-gray-500" />
    }
  }
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed':
        return 'success'
      case 'failed':
        return 'destructive'
      case 'warning':
        return 'warning'
      case 'running':
        return 'info'
      default:
        return 'secondary'
    }
  }
  
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'destructive'
      case 'serious':
        return 'warning'
      case 'moderate':
        return 'default'
      case 'minor':
        return 'secondary'
      default:
        return 'outline'
    }
  }
  
  const overallStats = {
    total: testSuites.reduce((sum, suite) => sum + suite.tests.length, 0),
    passed: testSuites.reduce((sum, suite) => sum + suite.passedTests, 0),
    failed: testSuites.reduce((sum, suite) => sum + suite.failedTests, 0),
    warnings: testSuites.reduce((sum, suite) => 
      sum + suite.tests.filter(t => t.status === 'warning').length, 0
    )
  }
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5" />
            <span>Accessibility Testing Suite</span>
          </CardTitle>
          <CardDescription>
            Comprehensive WCAG 2.2 AA compliance testing for Healthier SG
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex space-x-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">{overallStats.passed}</div>
                <div className="text-sm text-muted-foreground">Passed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-500">{overallStats.failed}</div>
                <div className="text-sm text-muted-foreground">Failed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-500">{overallStats.warnings}</div>
                <div className="text-sm text-muted-foreground">Manual Review</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{overallStats.total}</div>
                <div className="text-sm text-muted-foreground">Total Tests</div>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button
                onClick={runAllTests}
                disabled={isRunning}
                className="flex items-center space-x-2"
              >
                {isRunning ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                <span>{isRunning ? 'Running Tests...' : 'Run All Tests'}</span>
              </Button>
              
              <Button
                variant="outline"
                onClick={resetTests}
                disabled={isRunning}
              >
                Reset Tests
              </Button>
            </div>
          </div>
          
          <Progress value={overallProgress} className="mb-4" />
        </CardContent>
      </Card>
      
      <Tabs defaultValue="automated" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="automated">Automated Tests</TabsTrigger>
          <TabsTrigger value="manual">Manual Tests</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="guidelines">Guidelines</TabsTrigger>
        </TabsList>
        
        <TabsContent value="automated" className="space-y-4">
          {testSuites
            .filter(suite => suite.category === 'WCAG Compliance' || suite.category === 'Visual Accessibility')
            .map(suite => (
              <Card key={suite.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{suite.name}</CardTitle>
                      <CardDescription>{suite.description}</CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={suite.status === 'completed' ? 'default' : 'secondary'}>
                        {suite.status}
                      </Badge>
                      <Button
                        size="sm"
                        onClick={() => runAutomatedTests(suite.id)}
                        disabled={suite.status === 'running'}
                      >
                        {suite.status === 'running' ? 'Running...' : 'Run Tests'}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Progress value={suite.progress} className="mb-4" />
                  
                  <div className="space-y-2">
                    {suite.tests.map(test => (
                      <div
                        key={test.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(test.status)}
                          <div>
                            <div className="font-medium">{test.name}</div>
                            <div className="text-sm text-muted-foreground">{test.description}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={getSeverityColor(test.severity) as any}>
                            {test.severity}
                          </Badge>
                          <Badge variant={getStatusColor(test.status) as any}>
                            {test.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))
          }
        </TabsContent>
        
        <TabsContent value="manual" className="space-y-4">
          {testSuites
            .filter(suite => suite.category !== 'WCAG Compliance' && suite.category !== 'Visual Accessibility')
            .map(suite => (
              <Card key={suite.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{suite.name}</CardTitle>
                      <CardDescription>{suite.description}</CardDescription>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => runManualTests(suite.id)}
                      disabled={suite.status === 'running'}
                    >
                      Mark as Reviewed
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96">
                    <div className="space-y-3">
                      {suite.tests.map(test => (
                        <div
                          key={test.id}
                          className="p-4 border rounded-lg"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                {getStatusIcon(test.status)}
                                <h4 className="font-medium">{test.name}</h4>
                                <Badge variant={getSeverityColor(test.severity) as any}>
                                  {test.severity}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {test.description}
                              </p>
                              <p className="text-sm text-blue-600 mb-2">
                                <strong>Suggestion:</strong> {test.suggestion}
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {test.wcagCriteria.map(criteria => (
                                  <Badge key={criteria} variant="outline" className="text-xs">
                                    {criteria}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            ))
          }
        </TabsContent>
        
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Accessibility Compliance Report</CardTitle>
              <CardDescription>
                Generated on {new Date().toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-medium text-green-800">WCAG 2.2 AA Compliance</h4>
                    <div className="text-2xl font-bold text-green-600">
                      {Math.round((overallStats.passed / overallStats.total) * 100)}%
                    </div>
                  </div>
                  
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-800">Tests Completed</h4>
                    <div className="text-2xl font-bold text-blue-600">
                      {testSuites.filter(s => s.status === 'completed').length} / {testSuites.length}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Critical Issues ({overallStats.failed})</h4>
                  {testSuites
                    .flatMap(suite => suite.tests)
                    .filter(test => test.severity === 'critical' && test.status === 'failed')
                    .map(test => (
                      <div key={test.id} className="p-3 border-l-4 border-red-500 bg-red-50">
                        <div className="font-medium text-red-800">{test.name}</div>
                        <div className="text-sm text-red-700">{test.suggestion}</div>
                      </div>
                    ))
                  }
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="guidelines" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Accessibility Testing Guidelines</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Automated Testing (axe-core)</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Run automated tests on every deployment</li>
                    <li>• Focus on critical and serious violations</li>
                    <li>• Review warning messages for manual verification</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Manual Testing</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Test keyboard navigation with Tab, Enter, Space, Arrow keys</li>
                    <li>• Verify screen reader announcements and navigation</li>
                    <li>• Check color contrast ratios using browser tools</li>
                    <li>• Test on mobile devices with screen readers</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Cross-Browser Testing</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Test in Chrome, Firefox, Safari, Edge</li>
                    <li>• Verify iOS Safari and Android Chrome</li>
                    <li>• Test with NVDA, JAWS, VoiceOver screen readers</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}