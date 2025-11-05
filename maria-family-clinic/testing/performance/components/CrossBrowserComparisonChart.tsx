import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, ScatterChart, Scatter } from 'recharts';
import { 
  Monitor, 
  Smartphone, 
  Chrome, 
  Firefox, 
  Safari, 
  Edge,
  Globe,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Target
} from 'lucide-react';
import type { CrossBrowserTestResult } from '../types';

interface CrossBrowserComparisonChartProps {
  data: CrossBrowserTestResult | null;
  className?: string;
}

export const CrossBrowserComparisonChart: React.FC<CrossBrowserComparisonChartProps> = ({ 
  data, 
  className = '' 
}) => {
  const [selectedMetric, setSelectedMetric] = useState<string>('performanceScore');
  const [selectedBrowser, setSelectedBrowser] = useState<string>('all');

  if (!data) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Cross-Browser Performance Comparison</CardTitle>
          <CardDescription>No cross-browser test results available</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Run cross-browser tests to view comparison data
          </div>
        </CardContent>
      </Card>
    );
  }

  const getBrowserIcon = (browserName: string) => {
    switch (browserName.toLowerCase()) {
      case 'chrome': return <Chrome className="h-4 w-4" />;
      case 'firefox': return <Firefox className="h-4 w-4" />;
      case 'safari': return <Safari className="h-4 w-4" />;
      case 'edge': return <Edge className="h-4 w-4" />;
      default: return <Globe className="h-4 w-4" />;
    }
  };

  const getBrowserColor = (browserName: string) => {
    const colors: Record<string, string> = {
      chrome: '#4285F4',
      firefox: '#FF7139',
      safari: '#0066CC',
      edge: '#0078D4',
      'chrome-mobile': '#34A853',
      'safari-mobile': '#FF6B35'
    };
    return colors[browserName.toLowerCase()] || '#888888';
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  // Process data for charts
  const browsers = Object.keys(data.browserResults || {});
  const radarData = browsers.map(browserName => {
    const browserResult = data.browserResults[browserName];
    return {
      browser: browserName,
      performanceScore: (browserResult.lighthouseMetrics?.performanceScore || 0) * 100,
      firstContentfulPaint: (browserResult.lighthouseMetrics?.firstContentfulPaint || 0) / 1000,
      largestContentfulPaint: (browserResult.lighthouseMetrics?.largestContentfulPaint || 0) / 1000,
      firstInputDelay: browserResult.lighthouseMetrics?.firstInputDelay || 0,
      cumulativeLayoutShift: (browserResult.lighthouseMetrics?.cumulativeLayoutShift || 0) * 100,
      totalBlockingTime: browserResult.totalBlockingTime || 0,
      loadTime: browserResult.loadTime || 0
    };
  });

  const performanceComparisonData = browsers.map(browserName => {
    const browserResult = data.browserResults[browserName];
    return {
      browser: browserName,
      score: (browserResult.lighthouseMetrics?.performanceScore || 0) * 100,
      color: getBrowserColor(browserName)
    };
  });

  const coreWebVitalsData = browsers.map(browserName => {
    const browserResult = data.browserResults[browserName];
    return {
      browser: browserName,
      lcp: (browserResult.lighthouseMetrics?.largestContentfulPaint || 0) / 1000,
      fid: browserResult.lighthouseMetrics?.firstInputDelay || 0,
      cls: (browserResult.lighthouseMetrics?.cumulativeLayoutShift || 0),
      fcp: (browserResult.lighthouseMetrics?.firstContentfulPaint || 0) / 1000
    };
  });

  const resourceComparisonData = browsers.map(browserName => {
    const browserResult = data.browserResults[browserName];
    return {
      browser: browserName,
      bundleSize: browserResult.bundleSize || 0,
      totalRequests: browserResult.totalRequests || 0,
      totalBlockingTime: browserResult.totalBlockingTime || 0
    };
  });

  const consistencyAnalysis = data.consistencyAnalysis || {
    overallConsistency: 0.8,
    metricConsistency: {
      performanceScore: 0.9,
      loadTime: 0.85,
      resourceUsage: 0.75
    },
    outliers: [],
    recommendations: []
  };

  const getConsistencyColor = (score: number) => {
    if (score >= 0.9) return 'text-green-600';
    if (score >= 0.7) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConsistencyBadge = (score: number) => {
    if (score >= 0.9) return <Badge className="bg-green-100 text-green-800">Excellent</Badge>;
    if (score >= 0.7) return <Badge className="bg-yellow-100 text-yellow-800">Good</Badge>;
    return <Badge className="bg-red-100 text-red-800">Needs Improvement</Badge>;
  };

  return (
    <div className={`cross-browser-comparison-chart ${className}`}>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Browsers Tested</CardTitle>
            <Monitor className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{browsers.length}</div>
            <p className="text-xs text-muted-foreground">
              + {data.mobileBrowserResults ? Object.keys(data.mobileBrowserResults).length : 0} mobile
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Consistency</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getConsistencyColor(consistencyAnalysis.overallConsistency)}`}>
              {(consistencyAnalysis.overallConsistency * 100).toFixed(1)}%
            </div>
            <Progress value={consistencyAnalysis.overallConsistency * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Best Performance</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {performanceComparisonData.length > 0 ? 
                performanceComparisonData.reduce((best, current) => 
                  current.score > best.score ? current : best
                ).browser : 'N/A'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              {performanceComparisonData.length > 0 ? 
                `${Math.max(...performanceComparisonData.map(b => b.score)).toFixed(0)} score` : 'N/A'
              }
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consistency Status</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {getConsistencyBadge(consistencyAnalysis.overallConsistency)}
            <p className="text-xs text-muted-foreground mt-2">
              Cross-browser performance
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Test Configuration */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Test Configuration</CardTitle>
          <CardDescription>
            Cross-browser performance test details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Desktop Browsers</h4>
              <div className="space-y-2">
                {browsers.map(browserName => {
                  const browserResult = data.browserResults[browserName];
                  return (
                    <div key={browserName} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center space-x-2">
                        {getBrowserIcon(browserName)}
                        <span className="font-medium capitalize">{browserName}</span>
                      </div>
                      <Badge variant="outline">
                        {((browserResult.lighthouseMetrics?.performanceScore || 0) * 100).toFixed(0)}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Mobile Browsers</h4>
              {data.mobileBrowserResults && Object.keys(data.mobileBrowserResults).length > 0 ? (
                <div className="space-y-2">
                  {Object.entries(data.mobileBrowserResults).map(([browserName, browserResult]) => (
                    <div key={browserName} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center space-x-2">
                        <Smartphone className="h-4 w-4" />
                        <span className="font-medium capitalize">{browserName}</span>
                      </div>
                      <Badge variant="outline">
                        {((browserResult.lighthouseMetrics?.performanceScore || 0) * 100).toFixed(0)}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">No mobile tests</div>
              )}
            </div>

            <div>
              <h4 className="font-semibold mb-2">Test Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Test Date:</span>
                  <span>{new Date(data.testDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">URL:</span>
                  <span className="truncate max-w-32" title={data.url}>{data.url}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Network:</span>
                  <span>{data.networkConditions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Viewport:</span>
                  <span>{data.viewport}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Comparison */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="core-web-vitals">Core Web Vitals</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="consistency">Consistency</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Score Comparison</CardTitle>
                <CardDescription>
                  Lighthouse performance scores across browsers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={performanceComparisonData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="browser" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip formatter={(value) => [`${Number(value).toFixed(0)}`, 'Score']} />
                    <Bar dataKey="score" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Radar</CardTitle>
                <CardDescription>
                  Multi-dimensional performance comparison
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={radarData.slice(0, 3)}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="browser" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar name="Performance" dataKey="performanceScore" stroke="#8884d8" fill="#8884d8" fillOpacity={0.1} />
                    <Radar name="FCP" dataKey="firstContentfulPaint" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.1} />
                    <Radar name="LCP" dataKey="largestContentfulPaint" stroke="#ffc658" fill="#ffc658" fillOpacity={0.1} />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Performance Metrics</CardTitle>
              <CardDescription>
                Comprehensive performance breakdown by browser
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {browsers.map(browserName => {
                  const browserResult = data.browserResults[browserName];
                  const metrics = browserResult.lighthouseMetrics;
                  return (
                    <div key={browserName} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          {getBrowserIcon(browserName)}
                          <h4 className="font-semibold capitalize">{browserName}</h4>
                        </div>
                        <Badge 
                          className={getConsistencyColor(metrics?.performanceScore || 0)}
                          variant="outline"
                        >
                          {((metrics?.performanceScore || 0) * 100).toFixed(0)}/100
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <div className="text-sm text-muted-foreground">Load Time</div>
                          <div className="font-semibold">{formatDuration(browserResult.loadTime || 0)}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">FCP</div>
                          <div className="font-semibold">{formatDuration(metrics?.firstContentfulPaint || 0)}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">LCP</div>
                          <div className="font-semibold">{formatDuration(metrics?.largestContentfulPaint || 0)}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">TBT</div>
                          <div className="font-semibold">{formatDuration(browserResult.totalBlockingTime || 0)}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="core-web-vitals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Core Web Vitals Comparison</CardTitle>
              <CardDescription>
                LCP, FID, CLS metrics across all browsers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={coreWebVitalsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="browser" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'cls' ? Number(value).toFixed(3) : `${Number(value).toFixed(2)}s`,
                      name.toUpperCase()
                    ]}
                  />
                  <Legend />
                  <Bar dataKey="fcp" fill="#8884d8" name="FCP" />
                  <Bar dataKey="lcp" fill="#82ca9d" name="LCP" />
                  <Bar dataKey="fid" fill="#ffc658" name="FID (ms)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Resource Usage Comparison</CardTitle>
              <CardDescription>
                Bundle size, requests, and blocking time across browsers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={resourceComparisonData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="browser" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'bundleSize' ? formatBytes(Number(value)) : Number(value),
                      name
                    ]}
                  />
                  <Legend />
                  <Bar dataKey="bundleSize" fill="#8884d8" name="Bundle Size" />
                  <Bar dataKey="totalRequests" fill="#82ca9d" name="Requests" />
                  <Bar dataKey="totalBlockingTime" fill="#ffc658" name="Blocking Time (ms)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="consistency" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cross-Browser Consistency Analysis</CardTitle>
              <CardDescription>
                Performance consistency metrics and recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {(consistencyAnalysis.metricConsistency.performanceScore * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-muted-foreground">Performance Score</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">
                      {(consistencyAnalysis.metricConsistency.loadTime * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-muted-foreground">Load Time</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {(consistencyAnalysis.metricConsistency.resourceUsage * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-muted-foreground">Resource Usage</div>
                  </div>
                </div>

                {consistencyAnalysis.recommendations && consistencyAnalysis.recommendations.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">Recommendations</h4>
                    <div className="space-y-2">
                      {consistencyAnalysis.recommendations.map((recommendation, index) => (
                        <div key={index} className="flex items-start space-x-2 p-3 bg-blue-50 rounded-lg">
                          <AlertTriangle className="h-4 w-4 text-blue-600 mt-0.5" />
                          <span className="text-sm">{recommendation}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {consistencyAnalysis.outliers && consistencyAnalysis.outliers.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">Detected Outliers</h4>
                    <div className="space-y-2">
                      {consistencyAnalysis.outliers.map((outlier, index) => (
                        <div key={index} className="flex items-start space-x-2 p-3 bg-red-50 rounded-lg">
                          <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                          <span className="text-sm">{outlier}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};