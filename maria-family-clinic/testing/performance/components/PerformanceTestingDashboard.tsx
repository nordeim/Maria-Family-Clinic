import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity, 
  Zap, 
  Shield, 
  BarChart3, 
  Monitor, 
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users
} from 'lucide-react';
import { LoadTestResultsViewer } from './LoadTestResultsViewer';
import { RegressionTestMonitor } from './RegressionTestMonitor';
import { CrossBrowserComparisonChart } from './CrossBrowserComparisonChart';
import { HealthcareWorkflowMetrics } from './HealthcareWorkflowMetrics';
import { PerformanceBudgetMonitor } from './PerformanceBudgetMonitor';
import { PerformanceTestService } from '../services/PerformanceTestService';
import type {
  PerformanceTestStatus,
  LoadTestResults,
  RegressionTestResult,
  CrossBrowserTestResult,
  HealthcareWorkflowMetrics as HealthcareWorkflowMetricsType,
  PerformanceBudgetCompliance,
  TestingSummary
} from '../types';

interface PerformanceTestingDashboardProps {
  className?: string;
}

export const PerformanceTestingDashboard: React.FC<PerformanceTestingDashboardProps> = ({ 
  className = '' 
}) => {
  const [testStatus, setTestStatus] = useState<PerformanceTestStatus>('idle');
  const [testingSummary, setTestingSummary] = useState<TestingSummary | null>(null);
  const [loadTestResults, setLoadTestResults] = useState<LoadTestResults | null>(null);
  const [regressionResults, setRegressionResults] = useState<RegressionTestResult[]>([]);
  const [crossBrowserResults, setCrossBrowserResults] = useState<CrossBrowserTestResult | null>(null);
  const [healthcareMetrics, setHealthcareMetrics] = useState<HealthcareWorkflowMetricsType | null>(null);
  const [budgetCompliance, setBudgetCompliance] = useState<PerformanceBudgetCompliance | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  const performanceTestService = new PerformanceTestService();

  // Load initial data
  useEffect(() => {
    loadDashboardData();
    
    // Set up real-time updates
    const interval = setInterval(() => {
      loadDashboardData();
    }, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      const [summary, loadResults, regressionTests, crossBrowserTests, healthcareTestMetrics, budgetComplianceData] = await Promise.all([
        performanceTestService.getTestingSummary(),
        performanceTestService.getLatestLoadTestResults(),
        performanceTestService.getRegressionTestResults(),
        performanceTestService.getCrossBrowserTestResults(),
        performanceTestService.getHealthcareWorkflowMetrics(),
        performanceTestService.getPerformanceBudgetCompliance()
      ]);

      setTestingSummary(summary);
      setLoadTestResults(loadResults);
      setRegressionResults(regressionTests);
      setCrossBrowserResults(crossBrowserTests);
      setHealthcareMetrics(healthcareTestMetrics);
      setBudgetCompliance(budgetComplianceData);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const runAllTests = async () => {
    setTestStatus('running');
    try {
      await performanceTestService.runAllPerformanceTests();
      await loadDashboardData(); // Refresh data after tests
      setTestStatus('completed');
    } catch (error) {
      console.error('Performance tests failed:', error);
      setTestStatus('failed');
    }
  };

  const runLoadTests = async () => {
    setTestStatus('running');
    try {
      await performanceTestService.runLoadTests();
      await loadDashboardData();
      setTestStatus('completed');
    } catch (error) {
      console.error('Load tests failed:', error);
      setTestStatus('failed');
    }
  };

  const runRegressionTests = async () => {
    setTestStatus('running');
    try {
      await performanceTestService.runRegressionTests();
      await loadDashboardData();
      setTestStatus('completed');
    } catch (error) {
      console.error('Regression tests failed:', error);
      setTestStatus('failed');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed': return 'text-green-600';
      case 'failed': return 'text-red-600';
      case 'warning': return 'text-yellow-600';
      case 'running': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'running': return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className={`performance-testing-dashboard ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Performance Testing Dashboard</h1>
          <p className="text-muted-foreground">
            Healthcare platform performance monitoring and validation
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={testStatus === 'passed' ? 'default' : testStatus === 'failed' ? 'destructive' : 'secondary'}>
            {testStatus === 'idle' && 'Ready'}
            {testStatus === 'running' && 'Running Tests'}
            {testStatus === 'completed' && 'Tests Complete'}
            {testStatus === 'failed' && 'Tests Failed'}
          </Badge>
          <Button 
            onClick={loadDashboardData} 
            variant="outline" 
            size="sm"
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={runAllTests}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Run All Tests</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Complete</div>
            <p className="text-xs text-muted-foreground">
              Full performance validation suite
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={runLoadTests}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Load Testing</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Concurrent</div>
            <p className="text-xs text-muted-foreground">
              {loadTestResults?.concurrentUsers || 0} simulated users
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={runRegressionTests}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Regression Tests</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{regressionResults.length}</div>
            <p className="text-xs text-muted-foreground">
              Baseline comparisons
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Healthcare</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {healthcareMetrics?.pdpaCompliance?.status === 'passed' ? '✓' : '✗'}
            </div>
            <p className="text-xs text-muted-foreground">
              PDPA & Medical Compliance
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Summary Cards */}
      {testingSummary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overall Score</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getStatusColor(testingSummary.overallStatus)}`}>
                {testingSummary.overallScore}%
              </div>
              <p className="text-xs text-muted-foreground">
                {testingSummary.overallStatus} across all tests
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Budgets</CardTitle>
              <Monitor className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {budgetCompliance?.totalBudgets || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {budgetCompliance?.complianceRate || 0}% compliance rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last Updated</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {lastUpdated.toLocaleTimeString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Real-time monitoring active
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Status Alerts */}
      {budgetCompliance?.violations && budgetCompliance.violations.length > 0 && (
        <Alert className="mb-6 border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            Performance budget violations detected. Please review the budget compliance section for details.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="load">Load Testing</TabsTrigger>
          <TabsTrigger value="regression">Regression</TabsTrigger>
          <TabsTrigger value="cross-browser">Cross-Browser</TabsTrigger>
          <TabsTrigger value="healthcare">Healthcare</TabsTrigger>
          <TabsTrigger value="budgets">Budgets</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <HealthcareWorkflowMetrics data={healthcareMetrics} />
            <PerformanceBudgetMonitor data={budgetCompliance} />
          </div>
        </TabsContent>

        <TabsContent value="load" className="space-y-4">
          <LoadTestResultsViewer data={loadTestResults} />
        </TabsContent>

        <TabsContent value="regression" className="space-y-4">
          <RegressionTestMonitor data={regressionResults} />
        </TabsContent>

        <TabsContent value="cross-browser" className="space-y-4">
          <CrossBrowserComparisonChart data={crossBrowserResults} />
        </TabsContent>

        <TabsContent value="healthcare" className="space-y-4">
          <HealthcareWorkflowMetrics data={healthcareMetrics} detailed={true} />
        </TabsContent>

        <TabsContent value="budgets" className="space-y-4">
          <PerformanceBudgetMonitor data={budgetCompliance} detailed={true} />
        </TabsContent>
      </Tabs>
    </div>
  );
};