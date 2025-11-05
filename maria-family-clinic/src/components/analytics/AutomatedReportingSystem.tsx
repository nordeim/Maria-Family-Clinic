// Automated Reporting System
// Sub-Phase 9.8: Automated reporting with email delivery and scheduling

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  Clock, 
  Download, 
  Mail, 
  Settings, 
  FileText, 
  BarChart3,
  Users,
  MessageSquare,
  TrendingUp,
  Play,
  Pause,
  Trash2,
  Edit,
  Eye,
  Plus,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/analytics/api-client';
import { 
  AutomatedReport, 
  ReportSchedule, 
  ReportRecipient, 
  ReportTemplate,
  ReportFilter,
  DeliveryStatus
} from '@/types/analytics';

// Report Template Configuration
interface ReportTemplateConfig {
  id: string;
  name: string;
  description: string;
  sections: ReportSectionConfig[];
  format: 'pdf' | 'excel' | 'csv' | 'html';
  branding: {
    primaryColor: string;
    logo?: string;
    companyName: string;
  };
}

interface ReportSectionConfig {
  id: string;
  title: string;
  type: 'summary' | 'metrics' | 'charts' | 'tables' | 'insights';
  enabled: boolean;
  configuration: Record<string, any>;
}

// Report Creation Component
function ReportCreator() {
  const queryClient = useQueryClient();
  const [reportConfig, setReportConfig] = useState({
    name: '',
    description: '',
    format: 'pdf' as const,
    isActive: true,
  });

  const [schedule, setSchedule] = useState<ReportSchedule>({
    frequency: 'weekly' as const,
    time: '09:00',
    dayOfWeek: 1, // Monday
    timezone: 'Asia/Singapore',
  });

  const [recipients, setRecipients] = useState<ReportRecipient[]>([]);
  const [filters, setFilters] = useState<ReportFilter[]>([]);
  const [template, setTemplate] = useState<ReportTemplateConfig>({
    id: 'default',
    name: 'Contact System Performance Report',
    description: 'Comprehensive analytics report for contact system',
    sections: [
      {
        id: 'summary',
        title: 'Executive Summary',
        type: 'summary',
        enabled: true,
        configuration: {},
      },
      {
        id: 'metrics',
        title: 'Key Performance Metrics',
        type: 'metrics',
        enabled: true,
        configuration: {
          kpis: ['total_enquiries', 'completion_rate', 'response_time', 'satisfaction'],
        },
      },
      {
        id: 'charts',
        title: 'Performance Charts',
        type: 'charts',
        enabled: true,
        configuration: {
          chartTypes: ['line', 'bar', 'pie'],
        },
      },
      {
        id: 'insights',
        title: 'Insights & Recommendations',
        type: 'insights',
        enabled: true,
        configuration: {},
      },
    ],
    format: 'pdf',
    branding: {
      primaryColor: '#2563eb',
      companyName: 'My Family Clinic',
    },
  });

  const [newRecipient, setNewRecipient] = useState({
    email: '',
    name: '',
    role: 'manager' as const,
    permissions: 'read' as const,
  });

  const [newFilter, setNewFilter] = useState({
    field: '',
    operator: 'equals' as const,
    value: '',
  });

  const createReportMutation = useMutation({
    mutationFn: (report: Partial<AutomatedReport>) => 
      api.analytics.createAutomatedReport(report),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automated-reports'] });
    },
  });

  const handleAddRecipient = () => {
    if (newRecipient.email && newRecipient.name) {
      setRecipients([...recipients, { ...newRecipient }]);
      setNewRecipient({ email: '', name: '', role: 'manager', permissions: 'read' });
    }
  };

  const handleRemoveRecipient = (index: number) => {
    setRecipients(recipients.filter((_, i) => i !== index));
  };

  const handleAddFilter = () => {
    if (newFilter.field && newFilter.value) {
      setFilters([...filters, { ...newFilter }]);
      setNewFilter({ field: '', operator: 'equals', value: '' });
    }
  };

  const handleRemoveFilter = (index: number) => {
    setFilters(filters.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const report: Partial<AutomatedReport> = {
      name: reportConfig.name,
      description: reportConfig.description,
      reportType: 'scheduled',
      schedule: schedule,
      recipients: recipients,
      template: {
        header: {
          title: template.name,
          subtitle: template.description,
          generatedBy: 'System',
          generatedAt: new Date(),
        },
        sections: template.sections.map(section => ({
          id: section.id,
          title: section.title,
          type: section.type,
          position: template.sections.indexOf(section),
          content: {
            kpis: [],
            charts: [],
            tables: [],
            insights: [],
            recommendations: [],
          },
        })),
        footer: {
          disclaimer: 'This report is generated automatically by the analytics system.',
          links: ['Privacy Policy', 'Terms of Service'],
        },
        branding: {
          primaryColor: template.branding.primaryColor,
          fontFamily: 'Inter, sans-serif',
          logo: template.branding.logo,
        },
      },
      filters: filters,
      format: reportConfig.format,
      isActive: reportConfig.isActive,
    };

    createReportMutation.mutate(report);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="h-5 w-5" />
          <span>Create Automated Report</span>
        </CardTitle>
        <CardDescription>Set up scheduled analytics reports for your team</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Configuration */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Report Name</Label>
              <Input
                id="name"
                value={reportConfig.name}
                onChange={(e) => setReportConfig({ ...reportConfig, name: e.target.value })}
                placeholder="e.g., Weekly Contact System Performance"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={reportConfig.description}
                onChange={(e) => setReportConfig({ ...reportConfig, description: e.target.value })}
                placeholder="Brief description of this report"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="format">Format</Label>
                <Select 
                  value={reportConfig.format}
                  onValueChange={(value: any) => setReportConfig({ ...reportConfig, format: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="excel">Excel</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="html">HTML</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={reportConfig.isActive}
                  onChange={(e) => setReportConfig({ ...reportConfig, isActive: e.target.checked })}
                />
                <Label htmlFor="isActive">Active (enable scheduling)</Label>
              </div>
            </div>
          </div>

          {/* Schedule Configuration */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Schedule</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="frequency">Frequency</Label>
                <Select 
                  value={schedule.frequency}
                  onValueChange={(value: any) => setSchedule({ ...schedule, frequency: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={schedule.time}
                  onChange={(e) => setSchedule({ ...schedule, time: e.target.value })}
                />
              </div>

              {schedule.frequency === 'weekly' && (
                <div>
                  <Label htmlFor="dayOfWeek">Day of Week</Label>
                  <Select 
                    value={schedule.dayOfWeek?.toString()}
                    onValueChange={(value) => setSchedule({ ...schedule, dayOfWeek: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Monday</SelectItem>
                      <SelectItem value="2">Tuesday</SelectItem>
                      <SelectItem value="3">Wednesday</SelectItem>
                      <SelectItem value="4">Thursday</SelectItem>
                      <SelectItem value="5">Friday</SelectItem>
                      <SelectItem value="6">Saturday</SelectItem>
                      <SelectItem value="0">Sunday</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label htmlFor="timezone">Timezone</Label>
                <Select 
                  value={schedule.timezone}
                  onValueChange={(value) => setSchedule({ ...schedule, timezone: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Asia/Singapore">Singapore (SGT)</SelectItem>
                    <SelectItem value="UTC">UTC</SelectItem>
                    <SelectItem value="America/New_York">New York (EST)</SelectItem>
                    <SelectItem value="Europe/London">London (GMT)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Recipients */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Recipients</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              <Input
                placeholder="Email address"
                value={newRecipient.email}
                onChange={(e) => setNewRecipient({ ...newRecipient, email: e.target.value })}
              />
              <Input
                placeholder="Name"
                value={newRecipient.name}
                onChange={(e) => setNewRecipient({ ...newRecipient, name: e.target.value })}
              />
              <Select 
                value={newRecipient.role}
                onValueChange={(value: any) => setNewRecipient({ ...newRecipient, role: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="executive">Executive</SelectItem>
                  <SelectItem value="analyst">Analyst</SelectItem>
                </SelectContent>
              </Select>
              <Button type="button" onClick={handleAddRecipient}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2">
              {recipients.map((recipient, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium">{recipient.name}</p>
                    <p className="text-sm text-gray-600">{recipient.email}</p>
                    <p className="text-xs text-gray-500 capitalize">{recipient.role}</p>
                  </div>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleRemoveRecipient(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Filters */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Filters</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              <Input
                placeholder="Field (e.g., clinic_id)"
                value={newFilter.field}
                onChange={(e) => setNewFilter({ ...newFilter, field: e.target.value })}
              />
              <Select 
                value={newFilter.operator}
                onValueChange={(value: any) => setNewFilter({ ...newFilter, operator: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="equals">Equals</SelectItem>
                  <SelectItem value="contains">Contains</SelectItem>
                  <SelectItem value="greater">Greater than</SelectItem>
                  <SelectItem value="less">Less than</SelectItem>
                  <SelectItem value="between">Between</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="Value"
                value={newFilter.value}
                onChange={(e) => setNewFilter({ ...newFilter, value: e.target.value })}
              />
              <Button type="button" onClick={handleAddFilter}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2">
              {filters.map((filter, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium">{filter.field}</p>
                    <p className="text-sm text-gray-600">
                      {filter.operator} {filter.value}
                    </p>
                  </div>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleRemoveFilter(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Template Preview */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Report Template</h3>
            <div className="p-4 border rounded-lg bg-gray-50">
              <h4 className="font-medium mb-2">{template.name}</h4>
              <p className="text-sm text-gray-600 mb-3">{template.description}</p>
              <div className="space-y-2">
                {template.sections.filter(s => s.enabled).map((section) => (
                  <div key={section.id} className="flex items-center space-x-2">
                    <Badge variant="outline">{section.type}</Badge>
                    <span className="text-sm">{section.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={createReportMutation.isPending}
            className="w-full"
          >
            {createReportMutation.isPending ? (
              <div className="flex items-center space-x-2">
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Creating Report...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>Create & Schedule Report</span>
              </div>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// Report Management Component
function ReportManagement() {
  const queryClient = useQueryClient();
  const { data: reports, isLoading } = useQuery({
    queryKey: ['automated-reports'],
    queryFn: () => api.analytics.getAutomatedReports(),
  });

  const generateReportMutation = useMutation({
    mutationFn: (reportId: string) => api.analytics.generateReport(reportId),
    onSuccess: (result) => {
      // Download the report
      if (result.data?.downloadUrl) {
        window.open(result.data.downloadUrl, '_blank');
      }
    },
  });

  const getNextRun = (schedule: ReportSchedule) => {
    const now = new Date();
    const [hours, minutes] = schedule.time.split(':').map(Number);
    let nextRun = new Date(now);
    
    if (schedule.frequency === 'daily') {
      nextRun.setDate(nextRun.getDate() + 1);
    } else if (schedule.frequency === 'weekly') {
      const daysUntilNext = (schedule.dayOfWeek! - now.getDay() + 7) % 7 || 7;
      nextRun.setDate(now.getDate() + daysUntilNext);
    } else if (schedule.frequency === 'monthly') {
      nextRun.setMonth(nextRun.getMonth() + 1, 1);
    } else if (schedule.frequency === 'quarterly') {
      nextRun.setMonth(nextRun.getMonth() + 3, 1);
    }
    
    nextRun.setHours(hours, minutes, 0, 0);
    return nextRun;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-100 rounded animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Automated Reports</CardTitle>
        <CardDescription>Manage your scheduled analytics reports</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {reports?.data?.length > 0 ? reports.data.map((report: AutomatedReport) => (
            <div key={report.id} className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="font-medium">{report.name}</h3>
                  <p className="text-sm text-gray-600">{report.description}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={report.isActive ? 'default' : 'secondary'}>
                    {report.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  <Badge variant="outline">{report.format.toUpperCase()}</Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Schedule</p>
                  <p className="font-medium capitalize">
                    {report.schedule?.frequency} at {report.schedule?.time} ({report.schedule?.timezone})
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Recipients</p>
                  <p className="font-medium">
                    {report.recipients?.length || 0} recipient{report.recipients?.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Generated</p>
                  <p className="font-medium">
                    {report.lastGenerated ? new Date(report.lastGenerated).toLocaleDateString() : 'Never'}
                  </p>
                </div>
              </div>

              {report.nextScheduled && (
                <div className="mt-2 text-sm">
                  <p className="text-gray-500">Next Run</p>
                  <p className="font-medium">
                    {getNextRun(report.schedule as ReportSchedule).toLocaleString()}
                  </p>
                </div>
              )}

              <div className="mt-3 flex space-x-2">
                <Button 
                  size="sm" 
                  onClick={() => generateReportMutation.mutate(report.id)}
                  disabled={generateReportMutation.isPending}
                >
                  {generateReportMutation.isPending ? (
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  Generate Now
                </Button>
                <Button size="sm" variant="outline">
                  <Eye className="h-4 w-4" />
                  Preview
                </Button>
                <Button size="sm" variant="outline">
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>
              </div>
            </div>
          )) : (
            <p className="text-center text-gray-500 py-8">
              No automated reports found. Create your first report to get started.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Report Delivery History
function ReportDeliveryHistory() {
  // This would fetch delivery history from the API
  const deliveryHistory = [
    {
      id: '1',
      recipient: 'john.doe@clinic.com',
      status: 'SENT' as DeliveryStatus,
      format: 'PDF',
      sentAt: new Date('2024-01-15T09:00:00Z'),
      filePath: '/reports/weekly-performance-2024-01-15.pdf',
    },
    {
      id: '2',
      recipient: 'manager@clinic.com',
      status: 'FAILED' as DeliveryStatus,
      format: 'EXCEL',
      sentAt: new Date('2024-01-15T09:00:00Z'),
      error: 'SMTP connection failed',
    },
    {
      id: '3',
      recipient: 'analyst@clinic.com',
      status: 'DELIVERED' as DeliveryStatus,
      format: 'HTML',
      sentAt: new Date('2024-01-15T09:00:00Z'),
    },
  ];

  const getStatusBadge = (status: DeliveryStatus) => {
    switch (status) {
      case 'SENT':
        return <Badge variant="default">Sent</Badge>;
      case 'DELIVERED':
        return <Badge className="bg-green-100 text-green-800">Delivered</Badge>;
      case 'FAILED':
        return <Badge variant="destructive">Failed</Badge>;
      case 'PENDING':
        return <Badge variant="secondary">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Delivery History</CardTitle>
        <CardDescription>Recent report delivery status</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {deliveryHistory.map((delivery) => (
            <div key={delivery.id} className="p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{delivery.recipient}</p>
                  <p className="text-sm text-gray-600">
                    {delivery.sentAt.toLocaleString()} • {delivery.format}
                  </p>
                  {delivery.error && (
                    <p className="text-sm text-red-600 mt-1">Error: {delivery.error}</p>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(delivery.status)}
                  {delivery.filePath && (
                    <Button size="sm" variant="outline" onClick={() => window.open(delivery.filePath, '_blank')}>
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Main Automated Reporting Dashboard
export function AutomatedReportingSystem() {
  const [activeTab, setActiveTab] = useState('create');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Automated Reporting</h1>
        <p className="text-gray-600">Schedule and manage automated analytics reports for your team</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="create">Create Report</TabsTrigger>
          <TabsTrigger value="manage">Manage Reports</TabsTrigger>
          <TabsTrigger value="history">Delivery History</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-4">
          <ReportCreator />
        </TabsContent>

        <TabsContent value="manage" className="space-y-4">
          <ReportManagement />
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <ReportDeliveryHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default AutomatedReportingSystem;