import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, ScatterChart, Scatter } from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  RefreshCw,
  Download,
  Filter
} from 'lucide-react';
import type { RegressionTestResult } from '../types';

interface RegressionTestMonitorProps {
  data: RegressionTestResult[];
  className?: string;
}

export const RegressionTestMonitor: React.FC<RegressionTestMonitorProps> = ({ 
  data, 
  className = '' 
}) => {
  const [selectedMetric, setSelectedMetric] = useState<string>('performanceScore');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredData = data.filter(result => 
    filterStatus === 'all' || result.status === filterStatus
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'baseline': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingDown className="h-4 w-4 text-green-600" />;
      case 'regressing': return <TrendingUp className="h-4 w-4 text-red-600" />;
      case 'stable': return <Minus className="h-4 w-4 text-gray-600" />;
      default: return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving': return 'text-green-600';
      case 'regressing': return 'text-red-600';
      case 'stable': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Prepare chart data
  const performanceTrendData = filteredData.map(result => ({
    date: new Date(result.timestamp).toLocaleDateString(),
    score: result.lighthouseMetrics.performanceScore,
    fcp: result.lighthouseMetrics.firstContentfulPaint,
    lcp: result.lighthouseMetrics.largestContentfulPaint,
    fid: result.lighthouseMetrics.firstInputDelay,
    cls: result.lighthouseMetrics.cumulativeLayoutShift,
    tti: result.lighthouseMetrics.timeToInteractive,
    tbt: result.totalBlockingTime,
    bytes: result.bundleSize
  })).reverse();

  const coreWebVitalsData = filteredData.map(result => ({
    date: new Date(result.timestamp).toLocaleDateString(),
    lcp: result.lighthouseMetrics.largestContentfulPaint,
    fid: result.lighthouseMetrics.firstInputDelay,
    cls: result.lighthouseMetrics.cumulativeLayoutShift
  })).reverse();

  const regressionSeverityData = filteredData.map(result => ({
    severity: result.regressionAnalysis.severity,
    metric: Object.keys(result.regressionAnalysis.affectedMetrics)[0] || 'Unknown',
    impact: result.regressionAnalysis.impact
  }));

  const getLatestResult = () => filteredData.length > 0 ? filteredData[filteredData.length - 1] : null;
  const latestResult = getLatestResult();

  const getRegressionCount = () => {
    return filteredData.filter(result => result.status === 'failed').length;
  };

  const getImprovementCount = () => {
    return filteredData.filter(result => result.trend === 'improving').length;
  };

  return (
    <div className={`regression-test-monitor ${className}`}>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredData.length}</div>
            <p className="text-xs text-muted-foreground">
              Regression tests executed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Regressions</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{getRegressionCount()}</div>
            <p className="text-xs text-muted-foreground">
              Performance degradations detected
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Improvements</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{getImprovementCount()}</div>
            <p className="text-xs text-muted-foreground">
              Performance gains detected
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredData.length > 0 ? ((filteredData.filter(d => d.status === 'passed').length / filteredData.length) * 100).toFixed(1) : 0}%
            </div>
            <Progress 
              value={filteredData.length > 0 ? (filteredData.filter(d => d.status === 'passed').length / filteredData.length) * 100 : 0} 
              className="mt-2" 
            />
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {latestResult && latestResult.status === 'failed' && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            Performance regression detected in latest test. 
            {latestResult.regressionAnalysis.affectedMetrics && Object.keys(latestResult.regressionAnalysis.affectedMetrics).length > 0 && (
              <> Affected metrics: {Object.keys(latestResult.regressionAnalysis.affectedMetrics).join(', ')}</>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Filters and Actions */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Filter:</span>
            <Button 
              variant={filterStatus === 'all' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setFilterStatus('all')}
            >
              All
            </Button>
            <Button 
              variant={filterStatus === 'failed' ? 'destructive' : 'outline'} 
              size="sm"
              onClick={() => setFilterStatus('failed')}
            >
              Failed
            </Button>
            <Button 
              variant={filterStatus === 'passed' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setFilterStatus('passed')}
            >
              Passed
            </Button>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Latest Test Result */}
      {latestResult && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Latest Test Results</CardTitle>
            <CardDescription>
              {latestResult.url} • {new Date(latestResult.timestamp).toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Lighthouse Metrics</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Performance Score:</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={latestResult.lighthouseMetrics.performanceScore * 100} className="w-20" />
                      <span className="font-semibold">{(latestResult.lighthouseMetrics.performanceScore * 100).toFixed(0)}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">First Contentful Paint:</span>
                    <span className="font-semibold">{(latestResult.lighthouseMetrics.firstContentfulPaint / 1000).toFixed(2)}s</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Largest Contentful Paint:</span>
                    <span className="font-semibold">{(latestResult.lighthouseMetrics.largestContentfulPaint / 1000).toFixed(2)}s</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">First Input Delay:</span>
                    <span className="font-semibold">{latestResult.lighthouseMetrics.firstInputDelay.toFixed(0)}ms</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Cumulative Layout Shift:</span>
                    <span className="font-semibold">{latestResult.lighthouseMetrics.cumulativeLayoutShift.toFixed(3)}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Bundle & Resources</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Bundle Size:</span>
                    <span className="font-semibold">{formatBytes(latestResult.bundleSize)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total JS Size:</span>
                    <span className="font-semibold">{formatBytes(latestResult.totalJavaScriptSize)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total CSS Size:</span>
                    <span className="font-semibold">{formatBytes(latestResult.totalCSSSize)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Blocking Time:</span>
                    <span className="font-semibold">{latestResult.totalBlockingTime.toFixed(0)}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Requests:</span>
                    <span className="font-semibold">{latestResult.totalRequests}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Regression Analysis</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Status:</span>
                    <Badge className={getStatusColor(latestResult.status)}>
                      {latestResult.status.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Trend:</span>
                    <div className="flex items-center space-x-1">
                      {getTrendIcon(latestResult.trend)}
                      <span className={`text-sm font-semibold ${getTrendColor(latestResult.trend)}`}>
                        {latestResult.trend}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Severity:</span>
                    <span className="font-semibold capitalize">{latestResult.regressionAnalysis.severity}</span>
                  </div>
                  {latestResult.regressionAnalysis.impact && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Impact:</span>
                      <span className="font-semibold">{(latestResult.regressionAnalysis.impact * 100).toFixed(1)}%</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trends">Performance Trends</TabsTrigger>
          <TabsTrigger value="core-web-vitals">Core Web Vitals</TabsTrigger>
          <TabsTrigger value="regression-analysis">Regression Analysis</TabsTrigger>
          <TabsTrigger value="history">Test History</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Score Trends</CardTitle>
              <CardDescription>
                Lighthouse performance score over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip 
                    formatter={(value, name) => [name === 'score' ? `${(Number(value) * 100).toFixed(0)}` : `${Number(value).toFixed(0)}`, 'Score']}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#8884d8" 
                    name="Performance Score" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="core-web-vitals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Core Web Vitals Trends</CardTitle>
              <CardDescription>
                LCP, FID, and CLS metrics over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={coreWebVitalsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'cls' ? Number(value).toFixed(3) : `${(Number(value) / 1000).toFixed(2)}s`,
                      name.toUpperCase()
                    ]}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="lcp" stroke="#8884d8" name="LCP" />
                  <Line type="monotone" dataKey="fid" stroke="#82ca9d" name="FID" />
                  <Line type="monotone" dataKey="cls" stroke="#ffc658" name="CLS" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="regression-analysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Regression Severity Distribution</CardTitle>
              <CardDescription>
                Breakdown of regression severity levels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={regressionSeverityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="severity" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="impact" fill="#8884d8" name="Impact %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Test History</CardTitle>
              <CardDescription>
                Complete regression test history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredData.map((result, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-semibold">{result.url}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(result.timestamp).toLocaleString()}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(result.status)}>
                          {result.status}
                        </Badge>
                        <div className="flex items-center space-x-1">
                          {getTrendIcon(result.trend)}
                          <span className={`text-sm ${getTrendColor(result.trend)}`}>
                            {result.trend}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Score:</span>
                        <div className="font-semibold">{(result.lighthouseMetrics.performanceScore * 100).toFixed(0)}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">LCP:</span>
                        <div className="font-semibold">{(result.lighthouseMetrics.largestContentfulPaint / 1000).toFixed(2)}s</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">FID:</span>
                        <div className="font-semibold">{result.lighthouseMetrics.firstInputDelay.toFixed(0)}ms</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">CLS:</span>
                        <div className="font-semibold">{result.lighthouseMetrics.cumulativeLayoutShift.toFixed(3)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};