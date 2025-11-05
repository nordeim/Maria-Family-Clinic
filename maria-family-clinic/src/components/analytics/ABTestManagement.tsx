// A/B Testing Framework for Contact System Optimization
// Sub-Phase 9.8: A/B testing framework with statistical significance testing

'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TestTube, 
  Play, 
  Pause, 
  CheckCircle, 
  XCircle, 
  TrendingUp, 
  TrendingDown,
  BarChart3,
  Users,
  Target,
  Zap,
  AlertTriangle,
  Download,
  Eye,
  MousePointer,
  Clock,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { 
  ABTestResult, 
  ABTestVariant, 
  ABTestStatus, 
  ConversionMetrics,
  TimeRangeKey,
  TIME_RANGES 
} from '@/types/analytics';

// A/B Test Configuration Interface
interface ABTestConfig {
  id: string;
  name: string;
  description: string;
  hypothesis: string;
  successMetric: string;
  variants: ABTestVariantConfig[];
  status: ABTestStatus;
  startDate: Date;
  endDate?: Date;
  confidenceLevel: number;
  minimumSampleSize: number;
  statisticalSignificance: number;
  createdAt: Date;
  createdBy: string;
}

interface ABTestVariantConfig {
  id: string;
  name: string;
  description: string;
  trafficSplit: number;
  isControl: boolean;
  configuration: Record<string, any>;
}

// A/B Test Assignment Hook
export function useABTest(testId: string, variants: ABTestVariantConfig[]) {
  const [assignedVariant, setAssignedVariant] = useState<ABTestVariantConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get or create user session ID for consistent variant assignment
    const getSessionId = () => {
      let sessionId = localStorage.getItem('abtest_session_id');
      if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('abtest_session_id', sessionId);
      }
      return sessionId;
    };

    const assignVariant = () => {
      const sessionId = getSessionId();
      const hash = hashCode(sessionId + testId);
      const normalizedHash = Math.abs(hash) % 100;

      // Assign variant based on traffic split
      let currentSplit = 0;
      for (const variant of variants) {
        currentSplit += variant.trafficSplit * 100;
        if (normalizedHash < currentSplit) {
          setAssignedVariant(variant);
          break;
        }
      }

      setIsLoading(false);
    };

    assignVariant();
  }, [testId, variants]);

  return { assignedVariant, isLoading };
}

// A/B Test Results Component
interface ABTestResultsProps {
  testId: string;
  timeRange?: TimeRangeKey;
}

function ABTestResults({ testId, timeRange = '7d' }: ABTestResultsProps) {
  const { data: testResults, isLoading } = useQuery({
    queryKey: ['ab-test', 'results', testId, timeRange],
    queryFn: () => api.analytics.getABTestResults({ testId, timeRange }),
    refetchInterval: 60000, // Refresh every minute
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Test Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const { test, results, significance, insights } = testResults || {};

  const getVariantStatus = (variant: any, control: any) => {
    if (variant.variant.isControl) return 'control';
    const sig = significance?.find((s: any) => s.variantId === variant.variant.id);
    return sig?.isSignificant ? 'winner' : 'loser';
  };

  const controlVariant = results?.find((r: any) => r.variant.isControl);

  return (
    <div className="space-y-6">
      {/* Test Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{test?.name || 'A/B Test'}</CardTitle>
              <CardDescription>{test?.description}</CardDescription>
            </div>
            <Badge variant={test?.status === 'RUNNING' ? 'default' : 'secondary'}>
              {test?.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h4 className="font-medium mb-2">Hypothesis</h4>
              <p className="text-sm text-gray-600">{test?.hypothesis}</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Success Metric</h4>
              <p className="text-sm text-gray-600">{test?.successMetric}</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Confidence Level</h4>
              <p className="text-sm text-gray-600">{Math.round((test?.confidenceLevel || 0) * 100)}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Variant Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Variant Performance</CardTitle>
          <CardDescription>Comparison of test variants</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {results?.map((result: any) => {
              const status = getVariantStatus(result, controlVariant);
              const lift = controlVariant ? 
                ((result.conversionRate - controlVariant.conversionRate) / controlVariant.conversionRate) * 100 : 0;
              
              return (
                <div key={result.variant.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        status === 'winner' ? 'bg-green-500' :
                        status === 'loser' ? 'bg-red-500' : 'bg-blue-500'
                      }`}></div>
                      <h4 className="font-medium">{result.variant.name}</h4>
                      {result.variant.isControl && (
                        <Badge variant="outline">Control</Badge>
                      )}
                      {status === 'winner' && (
                        <Badge className="bg-green-100 text-green-800">Winner</Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {lift !== 0 && (
                        <div className="flex items-center space-x-1">
                          {lift > 0 ? (
                            <TrendingUp className="h-4 w-4 text-green-500" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-red-500" />
                          )}
                          <span className={`text-sm font-medium ${
                            lift > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {lift > 0 ? '+' : ''}{lift.toFixed(1)}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Visitors</p>
                      <p className="text-lg font-semibold">{result.visitors?.toLocaleString() || 0}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Conversions</p>
                      <p className="text-lg font-semibold">{result.conversions || 0}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Conversion Rate</p>
                      <p className="text-lg font-semibold">{((result.conversionRate || 0) * 100).toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Confidence</p>
                      <p className="text-lg font-semibold">
                        {significance?.find((s: any) => s.variantId === result.variant.id)?.confidence ?
                          `${Math.round(significance.find((s: any) => s.variantId === result.variant.id).confidence * 100)}%` : 
                          'N/A'
                        }
                      </p>
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Progress</span>
                      <span>{Math.round((result.visitors / (test?.minimumSampleSize || 100)) * 100)}%</span>
                    </div>
                    <Progress 
                      value={Math.min((result.visitors / (test?.minimumSampleSize || 100)) * 100, 100)} 
                      className="h-2" 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Statistical Significance */}
      <Card>
        <CardHeader>
          <CardTitle>Statistical Significance</CardTitle>
          <CardDescription>Statistical analysis of results</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {significance?.map((sig: any) => {
              const variant = results?.find((r: any) => r.variant.id === sig.variantId);
              if (!variant || variant.variant.isControl) return null;
              
              return (
                <div key={sig.variantId} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium">{variant.variant.name}</p>
                    <p className="text-sm text-gray-500">
                      P-value: {sig.pValue.toFixed(4)} | 
                      {sig.isSignificant ? 'Statistically Significant' : 'Not Significant'}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {sig.isSignificant ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-gray-400" />
                    )}
                    <Badge variant={sig.isSignificant ? 'default' : 'secondary'}>
                      {sig.isSignificant ? 'Significant' : 'Not Significant'}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Test Insights */}
      {insights && insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Insights</CardTitle>
            <CardDescription>Key findings and recommendations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {insights.map((insight: any, index: number) => (
                <div key={index} className="p-3 bg-blue-50 rounded border-l-4 border-blue-500">
                  <h4 className="font-medium text-blue-900">{insight.title}</h4>
                  <p className="text-sm text-blue-700 mt-1">{insight.description}</p>
                  {insight.actions && (
                    <div className="mt-2">
                      <p className="text-xs text-blue-600 font-medium">Recommended Actions:</p>
                      <ul className="text-xs text-blue-600 list-disc list-inside">
                        {insight.actions.map((action: string, i: number) => (
                          <li key={i}>{action}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// A/B Test Creation Component
interface ABTestCreatorProps {
  onTestCreated?: (testId: string) => void;
}

function ABTestCreator({ onTestCreated }: ABTestCreatorProps) {
  const queryClient = useQueryClient();
  const [testConfig, setTestConfig] = useState({
    name: '',
    description: '',
    hypothesis: '',
    successMetric: 'form_completion_rate',
    minimumSampleSize: 100,
    confidenceLevel: 0.95,
    significanceThreshold: 0.05,
    startDate: new Date().toISOString().split('T')[0],
  });

  const [variants, setVariants] = useState<ABTestVariantConfig[]>([
    {
      id: 'control',
      name: 'Control',
      description: 'Current version',
      trafficSplit: 0.5,
      isControl: true,
      configuration: {},
    },
    {
      id: 'variant-a',
      name: 'Variant A',
      description: 'Test version',
      trafficSplit: 0.5,
      isControl: false,
      configuration: {},
    },
  ]);

  const createTestMutation = useMutation({
    mutationFn: (data: any) => api.analytics.createABTest(data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['ab-tests'] });
      onTestCreated?.(result.id);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createTestMutation.mutate({
      ...testConfig,
      variants: variants,
    });
  };

  const updateVariant = (index: number, field: string, value: any) => {
    const newVariants = [...variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setVariants(newVariants);
  };

  const addVariant = () => {
    const newVariant: ABTestVariantConfig = {
      id: `variant-${variants.length}`,
      name: `Variant ${String.fromCharCode(65 + variants.length - 1)}`,
      description: '',
      trafficSplit: 1 / (variants.length + 1),
      isControl: false,
      configuration: {},
    };
    setVariants([...variants, newVariant]);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TestTube className="h-5 w-5" />
          <span>Create A/B Test</span>
        </CardTitle>
        <CardDescription>Set up a new A/B test for contact form optimization</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Test Configuration */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Test Name</Label>
              <Input
                id="name"
                value={testConfig.name}
                onChange={(e) => setTestConfig({ ...testConfig, name: e.target.value })}
                placeholder="e.g., Contact Form Button Color Test"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={testConfig.description}
                onChange={(e) => setTestConfig({ ...testConfig, description: e.target.value })}
                placeholder="Brief description of the test"
              />
            </div>

            <div>
              <Label htmlFor="hypothesis">Hypothesis</Label>
              <Textarea
                id="hypothesis"
                value={testConfig.hypothesis}
                onChange={(e) => setTestConfig({ ...testConfig, hypothesis: e.target.value })}
                placeholder="What do you expect will happen and why?"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="successMetric">Success Metric</Label>
                <Select 
                  value={testConfig.successMetric}
                  onValueChange={(value) => setTestConfig({ ...testConfig, successMetric: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="form_completion_rate">Form Completion Rate</SelectItem>
                    <SelectItem value="form_start_rate">Form Start Rate</SelectItem>
                    <SelectItem value="time_to_complete">Time to Complete</SelectItem>
                    <SelectItem value="abandonment_rate">Abandonment Rate</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="minimumSampleSize">Minimum Sample Size</Label>
                <Input
                  id="minimumSampleSize"
                  type="number"
                  value={testConfig.minimumSampleSize}
                  onChange={(e) => setTestConfig({ ...testConfig, minimumSampleSize: parseInt(e.target.value) })}
                  min="50"
                  max="10000"
                />
              </div>

              <div>
                <Label htmlFor="confidenceLevel">Confidence Level</Label>
                <Select 
                  value={testConfig.confidenceLevel.toString()}
                  onValueChange={(value) => setTestConfig({ ...testConfig, confidenceLevel: parseFloat(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0.90">90%</SelectItem>
                    <SelectItem value="0.95">95%</SelectItem>
                    <SelectItem value="0.99">99%</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={testConfig.startDate}
                  onChange={(e) => setTestConfig({ ...testConfig, startDate: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Variants Configuration */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Test Variants</h3>
              <Button type="button" variant="outline" onClick={addVariant}>
                Add Variant
              </Button>
            </div>

            <div className="space-y-4">
              {variants.map((variant, index) => (
                <div key={variant.id} className="p-4 border rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Variant Name</Label>
                      <Input
                        value={variant.name}
                        onChange={(e) => updateVariant(index, 'name', e.target.value)}
                        placeholder="Variant name"
                      />
                    </div>
                    <div>
                      <Label>Traffic Split</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="number"
                          value={variant.trafficSplit}
                          onChange={(e) => updateVariant(index, 'trafficSplit', parseFloat(e.target.value))}
                          min="0.1"
                          max="1"
                          step="0.1"
                        />
                        <span className="text-sm text-gray-500">
                          {Math.round(variant.trafficSplit * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-2">
                    <Label>Description</Label>
                    <Textarea
                      value={variant.description}
                      onChange={(e) => updateVariant(index, 'description', e.target.value)}
                      placeholder="Describe the changes in this variant"
                      rows={2}
                    />
                  </div>

                  {variant.isControl && (
                    <Badge variant="outline" className="mt-2">Control Variant</Badge>
                  )}
                </div>
              ))}
            </div>

            {/* Traffic Split Validation */}
            <div className="p-3 bg-gray-50 rounded">
              <div className="flex justify-between text-sm">
                <span>Total Traffic Split:</span>
                <span className={`font-medium ${
                  Math.abs(variants.reduce((sum, v) => sum + v.trafficSplit, 0) - 1) < 0.01 ? 
                  'text-green-600' : 'text-red-600'
                }`}>
                  {Math.round(variants.reduce((sum, v) => sum + v.trafficSplit, 0) * 100)}%
                </span>
              </div>
              {Math.abs(variants.reduce((sum, v) => sum + v.trafficSplit, 0) - 1) >= 0.01 && (
                <p className="text-xs text-red-600 mt-1">
                  Traffic split must equal 100%. Please adjust your variants.
                </p>
              )}
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={createTestMutation.isPending}
            className="w-full"
          >
            {createTestMutation.isPending ? (
              <div className="flex items-center space-x-2">
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Creating Test...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Play className="h-4 w-4" />
                <span>Create & Start Test</span>
              </div>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// A/B Test Management Dashboard
export function ABTestManagement() {
  const [selectedTestId, setSelectedTestId] = useState<string>('');
  const [activeTab, setActiveTab] = useState('create');

  const { data: tests, isLoading } = useQuery({
    queryKey: ['ab-tests'],
    queryFn: () => api.analytics.getABTests(),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-100 rounded animate-pulse"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">A/B Testing</h1>
        <p className="text-gray-600">Optimize contact forms and user experience through controlled testing</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="create">Create Test</TabsTrigger>
          <TabsTrigger value="manage">Manage Tests</TabsTrigger>
          <TabsTrigger value="results">View Results</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-4">
          <ABTestCreator onTestCreated={(testId) => {
            setSelectedTestId(testId);
            setActiveTab('results');
          }} />
        </TabsContent>

        <TabsContent value="manage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Tests</CardTitle>
              <CardDescription>Manage and monitor your A/B tests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tests?.length > 0 ? tests.map((test: ABTestConfig) => (
                  <div key={test.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{test.name}</h3>
                      <div className="flex items-center space-x-2">
                        <Badge variant={test.status === 'RUNNING' ? 'default' : 'secondary'}>
                          {test.status}
                        </Badge>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setSelectedTestId(test.id);
                            setActiveTab('results');
                          }}
                        >
                          View Results
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{test.description}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>Started: {new Date(test.startDate).toLocaleDateString()}</span>
                      <span>Variants: {test.variants.length}</span>
                      <span>Min Sample: {test.minimumSampleSize}</span>
                    </div>
                  </div>
                )) : (
                  <p className="text-center text-gray-500 py-8">No tests found. Create your first A/B test to get started.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          {selectedTestId ? (
            <ABTestResults testId={selectedTestId} />
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Select a Test</h3>
                <p className="text-gray-600">Choose a test from the Manage tab to view detailed results and analysis.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Utility function for consistent variant assignment
function hashCode(str: string): number {
  let hash = 0;
  if (str.length === 0) return hash;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash;
}

export default ABTestManagement;