// Analytics & Performance Optimization Demo
// Sub-Phase 9.8: Complete analytics and optimization system showcase

'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  MessageSquare, 
  Clock, 
  Target,
  TestTube,
  Settings,
  FileText,
  Zap,
  Brain,
  Eye,
} from 'lucide-react';

// Import analytics components
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard';
import ABTestManagement from '@/components/analytics/ABTestManagement';
import AutomatedReportingSystem from '@/components/analytics/AutomatedReportingSystem';
import { AnalyticsCollector, PerformanceMonitor, useContactFormAnalytics } from '@/lib/analytics/google-analytics';
import { ContactEventType } from '@/types/analytics';

export default function AnalyticsPerformanceDemo() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <AnalyticsCollector 
      enableGoogleAnalytics={true}
      enableGoogleTagManager={true}
      customTrackingId="demo_user"
    >
      <PerformanceMonitor 
        trackMetrics={true}
        enableRealUserMonitoring={true}
      />
      
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            Analytics & Performance Optimization System
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive data-driven insights and performance monitoring to continuously improve 
            contact system efficiency, customer satisfaction, and operational effectiveness
          </p>
          <div className="flex justify-center space-x-2">
            <Badge variant="default" className="px-3 py-1">
              <BarChart3 className="h-4 w-4 mr-1" />
              Real-time Analytics
            </Badge>
            <Badge variant="default" className="px-3 py-1">
              <TestTube className="h-4 w-4 mr-1" />
              A/B Testing
            </Badge>
            <Badge variant="default" className="px-3 py-1">
              <Brain className="h-4 w-4 mr-1" />
              Predictive Analytics
            </Badge>
            <Badge variant="default" className="px-3 py-1">
              <FileText className="h-4 w-4 mr-1" />
              Automated Reports
            </Badge>
          </div>
        </div>

        {/* System Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Analytics Events</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12,847</div>
              <p className="text-xs text-muted-foreground">
                +12.5% from last week
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Form Completion</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">68.5%</div>
              <p className="text-xs text-muted-foreground">
                +5.2% improvement
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Response Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">25min</div>
              <p className="text-xs text-muted-foreground">
                -8.3% reduction
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Customer Satisfaction</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8.2/10</div>
              <p className="text-xs text-muted-foreground">
                +0.4 improvement
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Feature Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="h-5 w-5" />
              <span>System Features</span>
            </CardTitle>
            <CardDescription>
              Comprehensive analytics and performance optimization capabilities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Real-time Analytics
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Form interaction tracking</li>
                  <li>• Performance monitoring</li>
                  <li>• Live user activity feed</li>
                  <li>• Core Web Vitals tracking</li>
                </ul>
              </div>

              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center">
                  <Brain className="h-4 w-4 mr-2" />
                  Predictive Analytics
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Volume forecasting</li>
                  <li>• Staffing recommendations</li>
                  <li>• Customer satisfaction prediction</li>
                  <li>• Seasonal trend analysis</li>
                </ul>
              </div>

              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center">
                  <TestTube className="h-4 w-4 mr-2" />
                  A/B Testing
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Statistical significance testing</li>
                  <li>• Variant assignment</li>
                  <li>• Conversion tracking</li>
                  <li>• Test result analysis</li>
                </ul>
              </div>

              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  Automated Reporting
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Scheduled report generation</li>
                  <li>• Email delivery system</li>
                  <li>• Multiple export formats</li>
                  <li>• Custom templates</li>
                </ul>
              </div>

              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Customer Satisfaction
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• CSAT, NPS, CES scoring</li>
                  <li>• Satisfaction trend analysis</li>
                  <li>• Feedback collection</li>
                  <li>• Response quality metrics</li>
                </ul>
              </div>

              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center">
                  <Settings className="h-4 w-4 mr-2" />
                  Google Analytics Integration
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• GA4 integration</li>
                  <li>• Custom event tracking</li>
                  <li>• Enhanced ecommerce</li>
                  <li>• Cross-domain tracking</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Demo Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Dashboard</TabsTrigger>
            <TabsTrigger value="abtesting">A/B Testing</TabsTrigger>
            <TabsTrigger value="reporting">Reporting</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
                <p className="text-gray-600">Real-time performance monitoring and key metrics</p>
              </div>
              <Badge variant="outline" className="flex items-center">
                <div className="h-2 w-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                Live
              </Badge>
            </div>
            <AnalyticsDashboard />
          </TabsContent>

          <TabsContent value="abtesting" className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold">A/B Testing Framework</h2>
              <p className="text-gray-600">Optimize contact forms through controlled experimentation</p>
            </div>
            <ABTestManagement />
          </TabsContent>

          <TabsContent value="reporting" className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold">Automated Reporting</h2>
              <p className="text-gray-600">Schedule and deliver analytics reports to stakeholders</p>
            </div>
            <AutomatedReportingSystem />
          </TabsContent>

          <TabsContent value="insights" className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold">Analytics Insights</h2>
              <p className="text-gray-600">Key findings and optimization opportunities</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Performance Insights */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5" />
                    <span>Performance Insights</span>
                  </CardTitle>
                  <CardDescription>Real-time performance optimization opportunities</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded">
                    <h4 className="font-medium text-green-900">Form Completion Rate Improvement</h4>
                    <p className="text-sm text-green-700 mt-1">
                      Contact forms show 15% higher completion with simplified field layout
                    </p>
                    <Button size="sm" className="mt-2">View Analysis</Button>
                  </div>
                  
                  <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
                    <h4 className="font-medium text-blue-900">Mobile Performance Optimization</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Mobile users experience 20% slower load times - optimization needed
                    </p>
                    <Button size="sm" className="mt-2" variant="outline">View Details</Button>
                  </div>
                  
                  <div className="p-4 bg-orange-50 border-l-4 border-orange-500 rounded">
                    <h4 className="font-medium text-orange-900">Peak Hour Staffing</h4>
                    <p className="text-sm text-orange-700 mt-1">
                      Additional staff needed during 9-11 AM for optimal response times
                    </p>
                    <Button size="sm" className="mt-2" variant="outline">View Forecast</Button>
                  </div>
                </CardContent>
              </Card>

              {/* Customer Satisfaction Insights */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>Customer Insights</span>
                  </CardTitle>
                  <CardDescription>Customer satisfaction and feedback analysis</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Response Time Satisfaction</span>
                      <span className="text-sm text-green-600">8.5/10</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Resolution Quality</span>
                      <span className="text-sm text-blue-600">7.8/10</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: '78%' }}></div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Communication Clarity</span>
                      <span className="text-sm text-purple-600">8.9/10</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-500 h-2 rounded-full" style={{ width: '89%' }}></div>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">+45</div>
                      <div className="text-sm text-gray-600">Net Promoter Score</div>
                      <Badge variant="default" className="mt-1">Excellent</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Predictive Analytics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="h-5 w-5" />
                  <span>Predictive Analytics</span>
                </CardTitle>
                <CardDescription>AI-powered forecasts and recommendations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">127</div>
                    <div className="text-sm text-blue-800">Predicted Enquiries (Tomorrow)</div>
                    <div className="text-xs text-blue-600 mt-1">85% confidence</div>
                  </div>
                  
                  <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">3.2</div>
                    <div className="text-sm text-green-800">Staff Recommended</div>
                    <div className="text-xs text-green-600 mt-1">9 AM - 12 PM slot</div>
                  </div>
                  
                  <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">72%</div>
                    <div className="text-sm text-purple-800">Expected Completion Rate</div>
                    <div className="text-xs text-purple-600 mt-1">+3% vs current</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preview" className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold">System Preview</h2>
              <p className="text-gray-600">Interactive demonstration of analytics features</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Form Analytics Demo */}
              <Card>
                <CardHeader>
                  <CardTitle>Form Analytics Demo</CardTitle>
                  <CardDescription>Interactive form with real-time tracking</CardDescription>
                </CardHeader>
                <CardContent>
                  <ContactFormDemo />
                </CardContent>
              </Card>

              {/* Performance Monitor Demo */}
              <Card>
                <CardHeader>
                  <CardTitle>Performance Monitoring</CardTitle>
                  <CardDescription>Real-time Core Web Vitals tracking</CardDescription>
                </CardHeader>
                <CardContent>
                  <PerformanceMonitorDemo />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AnalyticsCollector>
  );
}

// Contact Form Demo Component
function ContactFormDemo() {
  const { trackFormView, trackFormStart, trackFieldFocus, trackFormComplete } = 
    useContactFormAnalytics('demo-form', 'Demo Contact Form');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  React.useEffect(() => {
    trackFormView();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    trackFormComplete(formData);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="text-center p-8 space-y-4">
        <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold">Form Submitted!</h3>
        <p className="text-sm text-gray-600">
          Thank you for submitting the form. This interaction is being tracked for analytics.
        </p>
        <Button 
          onClick={() => {
            setSubmitted(false);
            setFormData({ name: '', email: '', message: '' });
          }}
          variant="outline"
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Name</label>
        <input
          type="text"
          className="w-full p-2 border rounded"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          onFocus={() => trackFieldFocus('name')}
          onBlur={() => {}}
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <input
          type="email"
          className="w-full p-2 border rounded"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          onFocus={() => trackFieldFocus('email')}
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Message</label>
        <textarea
          className="w-full p-2 border rounded"
          rows={3}
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          onFocus={() => trackFieldFocus('message')}
          required
        />
      </div>
      
      <Button 
        type="submit" 
        className="w-full"
        onClick={() => trackFormStart()}
      >
        Submit Form
      </Button>
      
      <p className="text-xs text-gray-500 text-center">
        This form tracks user interactions for analytics optimization
      </p>
    </form>
  );
}

// Performance Monitor Demo Component
function PerformanceMonitorDemo() {
  const [metrics, setMetrics] = useState({
    lcp: 0,
    fid: 0,
    cls: 0,
    loadTime: 0,
  });

  React.useEffect(() => {
    // Simulate performance metrics
    const timer = setTimeout(() => {
      setMetrics({
        lcp: 2100 + Math.random() * 400,
        fid: 80 + Math.random() * 40,
        cls: 0.05 + Math.random() * 0.05,
        loadTime: 1800 + Math.random() * 600,
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const getStatusColor = (value: number, thresholds: { good: number; needs: number }) => {
    if (value <= thresholds.good) return 'text-green-600';
    if (value <= thresholds.needs) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 bg-gray-50 rounded">
          <div className="text-xs text-gray-500">LCP (Largest Contentful Paint)</div>
          <div className={`text-lg font-semibold ${getStatusColor(metrics.lcp, { good: 2500, needs: 4000 })}`}>
            {Math.round(metrics.lcp)}ms
          </div>
        </div>
        
        <div className="p-3 bg-gray-50 rounded">
          <div className="text-xs text-gray-500">FID (First Input Delay)</div>
          <div className={`text-lg font-semibold ${getStatusColor(metrics.fid, { good: 100, needs: 300 })}`}>
            {Math.round(metrics.fid)}ms
          </div>
        </div>
        
        <div className="p-3 bg-gray-50 rounded">
          <div className="text-xs text-gray-500">CLS (Cumulative Layout Shift)</div>
          <div className={`text-lg font-semibold ${getStatusColor(metrics.cls * 1000, { good: 100, needs: 250 })}`}>
            {metrics.cls.toFixed(3)}
          </div>
        </div>
        
        <div className="p-3 bg-gray-50 rounded">
          <div className="text-xs text-gray-500">Page Load Time</div>
          <div className="text-lg font-semibold text-blue-600">
            {Math.round(metrics.loadTime)}ms
          </div>
        </div>
      </div>
      
      <div className="text-xs text-gray-500 space-y-1">
        <div className="flex justify-between">
          <span>LCP Target: &lt; 2.5s</span>
          <span className={getStatusColor(metrics.lcp, { good: 2500, needs: 4000 })}>
            {metrics.lcp <= 2500 ? '✓ Good' : '⚠ Needs Improvement'}
          </span>
        </div>
        <div className="flex justify-between">
          <span>FID Target: &lt; 100ms</span>
          <span className={getStatusColor(metrics.fid, { good: 100, needs: 300 })}>
            {metrics.fid <= 100 ? '✓ Good' : '⚠ Needs Improvement'}
          </span>
        </div>
        <div className="flex justify-between">
          <span>CLS Target: &lt; 0.1</span>
          <span className={getStatusColor(metrics.cls * 1000, { good: 100, needs: 250 })}>
            {metrics.cls <= 0.1 ? '✓ Good' : '⚠ Needs Improvement'}
          </span>
        </div>
      </div>
    </div>
  );
}