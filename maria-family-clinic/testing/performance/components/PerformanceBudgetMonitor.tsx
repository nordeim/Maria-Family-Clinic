import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { 
  Target, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Zap,
  TrendingUp,
  TrendingDown,
  DollarSign,
  FileText,
  Settings,
  Download,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  Minus
} from 'lucide-react';
import type { PerformanceBudgetCompliance } from '../types';

interface PerformanceBudgetMonitorProps {
  data: PerformanceBudgetCompliance | null;
  detailed?: boolean;
  className?: string;
}

export const PerformanceBudgetMonitor: React.FC<PerformanceBudgetMonitorProps> = ({ 
  data, 
  detailed = false,
  className = '' 
}) => {
  const [selectedBudget, setSelectedBudget] = useState<string>('all');
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('7d');

  if (!data) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Performance Budget Monitor</CardTitle>
          <CardDescription>No performance budget data available</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Run performance tests to view budget compliance
          </div>
        </CardContent>
      </Card>
    );
  }

  const getBudgetStatusColor = (status: string) => {
    switch (status) {
      case 'passing': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'failing': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getComplianceIcon = (compliance: boolean) => {
    return compliance ? (
      <ThumbsUp className="h-4 w-4 text-green-600" />
    ) : (
      <ThumbsDown className="h-4 w-4 text-red-600" />
    );
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingDown className="h-4 w-4 text-green-600" />;
      case 'degrading': return <TrendingUp className="h-4 w-4 text-red-600" />;
      case 'stable': return <Minus className="h-4 w-4 text-gray-600" />;
      default: return <Minus className="h-4 w-4 text-gray-600" />;
    }
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

  const formatPercentage = (value: number) => `${(value * 100).toFixed(1)}%`;

  // Process data for charts
  const budgetComplianceData = Object.entries(data.budgetCompliance || {}).map(([budgetName, compliance]) => ({
    budget: budgetName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
    current: compliance.current,
    limit: compliance.limit,
    percentage: (compliance.current / compliance.limit) * 100,
    status: compliance.status
  }));

  const enforcementHistoryData = (data.enforcementHistory || []).map(entry => ({
    date: new Date(entry.timestamp).toLocaleDateString(),
    violations: entry.violations,
    budgets: entry.budgets,
    enforcement: entry.enforcement
  }));

  const budgetTrendData = (data.budgetTrends || []).map(trend => ({
    date: new Date(trend.date).toLocaleDateString(),
    totalViolations: trend.totalViolations,
    resolvedViolations: trend.resolvedViolations,
    complianceRate: trend.complianceRate * 100
  }));

  const violationTypeData = data.violationsByType ? Object.entries(data.violationsByType).map(([type, count]) => ({
    name: type.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
    value: count,
    color: '#ff7300'
  })) : [];

  const getActiveViolations = () => {
    return Object.values(data.budgetCompliance || {}).filter(compliance => compliance.status !== 'passing').length;
  };

  const getResolvedToday = () => {
    const today = new Date().toDateString();
    return (data.enforcementHistory || []).filter(entry => 
      new Date(entry.timestamp).toDateString() === today && entry.resolved
    ).length;
  };

  const getBudgetHealth = () => {
    const budgets = Object.values(data.budgetCompliance || {});
    if (budgets.length === 0) return 0;
    const passing = budgets.filter(b => b.status === 'passing').length;
    return (passing / budgets.length) * 100;
  };

  return (
    <div className={`performance-budget-monitor ${className}`}>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budgets</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalBudgets || 0}</div>
            <p className="text-xs text-muted-foreground">
              Active performance budgets
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatPercentage(data.complianceRate || 0)}
            </div>
            <Progress value={(data.complianceRate || 0) * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Violations</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {getActiveViolations()}
            </div>
            <p className="text-xs text-muted-foreground">
              Budget violations detected
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Health Score</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getBudgetHealth() >= 80 ? 'text-green-600' : getBudgetHealth() >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
              {getBudgetHealth().toFixed(0)}%
            </div>
            <Progress value={getBudgetHealth()} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {getActiveViolations() > 0 && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {getActiveViolations()} active performance budget violations detected. 
            Immediate attention required to maintain system performance standards.
          </AlertDescription>
        </Alert>
      )}

      {/* Controls */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Timeframe:</span>
            <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1d">Last 24h</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Configure
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="violations">Violations</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Budget Compliance Status</CardTitle>
                <CardDescription>
                  Current performance budget utilization and compliance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={budgetComplianceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="budget" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === 'percentage' ? `${value.toFixed(1)}%` : value,
                        name === 'current' ? 'Current Usage' : 'Budget Limit'
                      ]}
                    />
                    <Bar dataKey="current" fill="#8884d8" name="Current Usage" />
                    <Bar dataKey="limit" fill="#82ca9d" name="Budget Limit" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Budget Health Overview</CardTitle>
                <CardDescription>
                  Performance budget compliance distribution
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(data.budgetCompliance || {}).map(([budgetName, compliance]) => {
                    const percentage = (compliance.current / compliance.limit) * 100;
                    return (
                      <div key={budgetName} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">
                            {budgetName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          </span>
                          <div className="flex items-center space-x-2">
                            <Badge className={getBudgetStatusColor(compliance.status)}>
                              {compliance.status}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {percentage.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                        <Progress 
                          value={Math.min(percentage, 100)} 
                          className={`h-2 ${percentage > 100 ? 'bg-red-100' : percentage > 80 ? 'bg-yellow-100' : 'bg-green-100'}`}
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{compliance.current} / {compliance.limit}</span>
                          <span>
                            {compliance.status === 'passing' ? 'Under budget' : 
                             compliance.status === 'warning' ? 'Near limit' : 'Over budget'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today's Resolved</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{getResolvedToday()}</div>
                <p className="text-xs text-muted-foreground">Violations resolved</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Budget Health</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {getBudgetHealth() >= 80 ? 'Excellent' : getBudgetHealth() >= 60 ? 'Good' : 'Poor'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {getBudgetHealth().toFixed(0)}% budget health score
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Last Enforcement</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data.enforcementHistory && data.enforcementHistory.length > 0 
                    ? new Date(data.enforcementHistory[data.enforcementHistory.length - 1].timestamp).toLocaleDateString()
                    : 'N/A'
                  }
                </div>
                <p className="text-xs text-muted-foreground">Last CI/CD check</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="violations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Budget Violations</CardTitle>
              <CardDescription>
                Current performance budget violations requiring attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(data.budgetCompliance || {})
                  .filter(([_, compliance]) => compliance.status !== 'passing')
                  .map(([budgetName, compliance]) => {
                    const percentage = (compliance.current / compliance.limit) * 100;
                    const excess = compliance.current - compliance.limit;
                    return (
                      <div key={budgetName} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                            <h4 className="font-semibold">
                              {budgetName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                            </h4>
                          </div>
                          <Badge className={getBudgetStatusColor(compliance.status)}>
                            {compliance.status}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                          <div>
                            <div className="text-sm text-muted-foreground">Current Usage</div>
                            <div className="font-semibold text-red-600">
                              {budgetName.includes('Size') || budgetName.includes('Bundle') ? 
                                formatBytes(compliance.current) : 
                                formatDuration(compliance.current)
                              }
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Budget Limit</div>
                            <div className="font-semibold">
                              {budgetName.includes('Size') || budgetName.includes('Bundle') ? 
                                formatBytes(compliance.limit) : 
                                formatDuration(compliance.limit)
                              }
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Excess</div>
                            <div className="font-semibold text-red-600">
                              {budgetName.includes('Size') || budgetName.includes('Bundle') ? 
                                formatBytes(excess) : 
                                formatDuration(excess)
                              }
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Percentage</div>
                            <div className="font-semibold text-red-600">{percentage.toFixed(1)}%</div>
                          </div>
                        </div>

                        <Progress 
                          value={Math.min(percentage, 120)} 
                          className="h-2 bg-red-100"
                        />

                        {compliance.violations && compliance.violations.length > 0 && (
                          <div className="mt-3 p-3 bg-red-50 rounded">
                            <h5 className="font-medium mb-2 text-red-800">Recent Violations</h5>
                            <div className="space-y-1">
                              {compliance.violations.slice(0, 3).map((violation, index) => (
                                <div key={index} className="text-sm text-red-700">
                                  {new Date(violation.timestamp).toLocaleString()} - 
                                  Violated {violation.metric} by {violation.severity}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>

          {data.violationsByType && Object.keys(data.violationsByType).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Violation Types Distribution</CardTitle>
                <CardDescription>
                  Breakdown of budget violations by type
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={violationTypeData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {violationTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Budget Compliance Trends</CardTitle>
              <CardDescription>
                Performance budget compliance over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              {budgetTrendData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={budgetTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="totalViolations"
                      stackId="1"
                      stroke="#ff7300"
                      fill="#ff7300"
                      name="Total Violations"
                    />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="resolvedViolations"
                      stackId="2"
                      stroke="#82ca9d"
                      fill="#82ca9d"
                      name="Resolved Violations"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="complianceRate"
                      stroke="#8884d8"
                      name="Compliance Rate %"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No trend data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Enforcement History</CardTitle>
              <CardDescription>
                Historical performance budget enforcement actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(data.enforcementHistory || []).map((entry, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {new Date(entry.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">
                          {entry.violations} violations
                        </Badge>
                        {entry.resolved ? (
                          <Badge className="bg-green-100 text-green-800">
                            Resolved
                          </Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-800">
                            Active
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Budgets Affected:</span>
                        <div className="font-semibold">{entry.budgets}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Enforcement:</span>
                        <div className="font-semibold">{entry.enforcement}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Status:</span>
                        <div className="font-semibold">{entry.resolved ? 'Resolved' : 'Pending'}</div>
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