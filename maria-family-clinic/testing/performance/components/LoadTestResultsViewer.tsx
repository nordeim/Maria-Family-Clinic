import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';
import { 
  Users, 
  Clock, 
  Zap, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Activity,
  Target
} from 'lucide-react';
import type { LoadTestResults } from '../types';

interface LoadTestResultsViewerProps {
  data: LoadTestResults | null;
  className?: string;
}

export const LoadTestResultsViewer: React.FC<LoadTestResultsViewerProps> = ({ 
  data, 
  className = '' 
}) => {
  if (!data) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Load Test Results</CardTitle>
          <CardDescription>No load test results available</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Run load tests to view results
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  // Prepare chart data
  const responseTimeData = data.responseTimeMetrics.timeSeries?.map(point => ({
    time: point.timestamp,
    avg: point.avgResponseTime,
    p95: point.p95ResponseTime,
    p99: point.p99ResponseTime,
    max: point.maxResponseTime
  })) || [];

  const throughputData = data.throughputMetrics.timeSeries?.map(point => ({
    time: point.timestamp,
    requests: point.requestsPerSecond,
    errors: point.errorRate
  })) || [];

  const resourceUtilizationData = data.resourceUtilization.map(resource => ({
    name: resource.resourceName,
    cpu: resource.cpuUtilization,
    memory: resource.memoryUtilization,
    disk: resource.diskUtilization,
    network: resource.networkUtilization
  }));

  return (
    <div className={`load-test-results-viewer ${className}`}>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Badge className={getStatusColor(data.status)}>
              {data.status.toUpperCase()}
            </Badge>
            <p className="text-xs text-muted-foreground mt-2">
              Test completed successfully
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Concurrent Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.concurrentUsers}</div>
            <p className="text-xs text-muted-foreground">
              Peak concurrent load
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {((data.successRate * 100).toFixed(1))}%
            </div>
            <Progress value={data.successRate * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatDuration(data.responseTimeMetrics.avgResponseTime)}
            </div>
            <p className="text-xs text-muted-foreground">
              P95: {formatDuration(data.responseTimeMetrics.p95ResponseTime)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Results */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Load Test Details</CardTitle>
          <CardDescription>
            Comprehensive performance analysis for {data.testScenario.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Test Configuration</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration:</span>
                  <span>{data.duration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ramp-up:</span>
                  <span>{data.rampUpTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Target TPS:</span>
                  <span>{data.targetThroughput} req/s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Environment:</span>
                  <span>{data.environment}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Response Time Metrics</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Min:</span>
                  <span>{formatDuration(data.responseTimeMetrics.minResponseTime)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Avg:</span>
                  <span>{formatDuration(data.responseTimeMetrics.avgResponseTime)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">P95:</span>
                  <span>{formatDuration(data.responseTimeMetrics.p95ResponseTime)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">P99:</span>
                  <span>{formatDuration(data.responseTimeMetrics.p99ResponseTime)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Max:</span>
                  <span>{formatDuration(data.responseTimeMetrics.maxResponseTime)}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Error Analysis</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Errors:</span>
                  <span>{data.errorAnalysis.totalErrors}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Error Rate:</span>
                  <span>{((data.errorAnalysis.errorRate * 100).toFixed(2))}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Failed Requests:</span>
                  <span>{data.errorAnalysis.failedRequests}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Retries:</span>
                  <span>{data.errorAnalysis.retries}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <Tabs defaultValue="response-time" className="space-y-4">
        <TabsList>
          <TabsTrigger value="response-time">Response Time</TabsTrigger>
          <TabsTrigger value="throughput">Throughput</TabsTrigger>
          <TabsTrigger value="resources">Resource Utilization</TabsTrigger>
          <TabsTrigger value="healthcare">Healthcare APIs</TabsTrigger>
        </TabsList>

        <TabsContent value="response-time" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Response Time Analysis</CardTitle>
              <CardDescription>
                Response time trends across the test duration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={responseTimeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [formatDuration(Number(value)), 'Response Time']}
                    labelFormatter={(label) => `Time: ${label}`}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="avg" stroke="#8884d8" name="Average" />
                  <Line type="monotone" dataKey="p95" stroke="#82ca9d" name="P95" />
                  <Line type="monotone" dataKey="p99" stroke="#ffc658" name="P99" />
                  <Line type="monotone" dataKey="max" stroke="#ff7300" name="Maximum" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="throughput" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Throughput & Error Rate</CardTitle>
              <CardDescription>
                Requests per second and error trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={throughputData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="requests"
                    stackId="1"
                    stroke="#8884d8"
                    fill="#8884d8"
                    name="Requests/sec"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="errors"
                    stroke="#ff7300"
                    name="Error Rate %"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Resource Utilization</CardTitle>
              <CardDescription>
                CPU, Memory, Disk, and Network utilization during load test
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={resourceUtilizationData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value.toFixed(1)}%`, 'Utilization']} />
                  <Legend />
                  <Bar dataKey="cpu" fill="#8884d8" name="CPU %" />
                  <Bar dataKey="memory" fill="#82ca9d" name="Memory %" />
                  <Bar dataKey="disk" fill="#ffc658" name="Disk %" />
                  <Bar dataKey="network" fill="#ff7300" name="Network %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="healthcare" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Healthcare API Performance</CardTitle>
              <CardDescription>
                Performance metrics specific to healthcare endpoints
              </CardDescription>
            </CardHeader>
            <CardContent>
              {data.healthcareAPIPerformance && Object.keys(data.healthcareAPIPerformance).length > 0 ? (
                <div className="space-y-4">
                  {Object.entries(data.healthcareAPIPerformance).map(([endpoint, metrics]) => (
                    <div key={endpoint} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold">{endpoint}</h4>
                        <Badge variant="outline">
                          {((metrics.successRate || 0) * 100).toFixed(1)}% Success
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Avg Response:</span>
                          <div className="font-semibold">{formatDuration(metrics.avgResponseTime || 0)}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">P95 Response:</span>
                          <div className="font-semibold">{formatDuration(metrics.p95ResponseTime || 0)}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Requests:</span>
                          <div className="font-semibold">{metrics.totalRequests || 0}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Errors:</span>
                          <div className="font-semibold">{metrics.failedRequests || 0}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No healthcare API performance data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};