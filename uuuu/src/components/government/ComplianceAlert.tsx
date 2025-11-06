import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Shield, 
  CheckCircle, 
  XCircle, 
  Clock,
  Bell,
  Eye,
  Trash2,
  Download,
  Filter,
  Search,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ComplianceAlert {
  id: string;
  type: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  category: 'SECURITY' | 'PDPA' | 'MOH' | 'AUDIT' | 'SYSTEM' | 'REGULATORY';
  title: string;
  description: string;
  details: string;
  status: 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED' | 'FALSE_POSITIVE';
  createdAt: string;
  updatedAt: string;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  affectedResources: string[];
  regulatoryFramework: string[];
  complianceStandard: string;
  recommendedActions: string[];
  escalationLevel: number;
  assignedTo?: string;
  tags: string[];
  evidence: {
    type: 'LOG' | 'SCREENSHOT' | 'REPORT' | 'DATA';
    content: string;
    timestamp: string;
  }[];
}

export default function ComplianceAlert() {
  const [alerts, setAlerts] = useState<ComplianceAlert[]>([]);
  const [filteredAlerts, setFilteredAlerts] = useState<ComplianceAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAlert, setSelectedAlert] = useState<ComplianceAlert | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [showAcknowledgeDialog, setShowAcknowledgeDialog] = useState(false);
  const [acknowledgeNotes, setAcknowledgeNotes] = useState('');
  const [showResolveDialog, setShowResolveDialog] = useState(false);
  const [resolveNotes, setResolveNotes] = useState('');

  // Mock data for demonstration
  useEffect(() => {
    const mockAlerts: ComplianceAlert[] = [
      {
        id: '1',
        type: 'CRITICAL',
        category: 'SECURITY',
        title: 'Unauthorized Access Attempt Detected',
        description: 'Multiple failed login attempts from unrecognized IP address',
        details: 'System detected 15 failed authentication attempts from IP 203.0.113.1 within 5 minutes. This may indicate a brute force attack attempt on user accounts.',
        status: 'OPEN',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        affectedResources: ['Authentication System', 'User Accounts'],
        regulatoryFramework: ['PDPA', 'Cybersecurity Act'],
        complianceStandard: 'ISO 27001:2013',
        recommendedActions: [
          'Block suspicious IP address',
          'Review and reset affected user passwords',
          'Enable enhanced monitoring',
          'Conduct security audit'
        ],
        escalationLevel: 3,
        assignedTo: 'security-team@familyclinic.sg',
        tags: ['security', 'authentication', 'intrusion-attempt'],
        evidence: [
          {
            type: 'LOG',
            content: 'Failed login attempts logged at 2025-11-04T20:05:00Z',
            timestamp: new Date().toISOString()
          }
        ]
      },
      {
        id: '2',
        type: 'HIGH',
        category: 'PDPA',
        title: 'Data Access Policy Violation',
        description: 'Healthcare data accessed without proper consent',
        details: 'Patient health records accessed by staff member without documented patient consent for the specific data sharing purpose.',
        status: 'ACKNOWLEDGED',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        updatedAt: new Date(Date.now() - 1800000).toISOString(),
        acknowledgedBy: 'compliance-officer@familyclinic.sg',
        acknowledgedAt: new Date(Date.now() - 1800000).toISOString(),
        affectedResources: ['Patient Records Database', 'Health Data Processing'],
        regulatoryFramework: ['PDPA', 'Healthcare (Privacy) Regulations'],
        complianceStandard: 'PDPA Notice 2020',
        recommendedActions: [
          'Investigate data access logs',
          'Verify consent documentation',
          'Review staff training on PDPA requirements',
          'Update access controls'
        ],
        escalationLevel: 2,
        assignedTo: 'compliance-team@familyclinic.sg',
        tags: ['pdpa', 'data-protection', 'consent'],
        evidence: [
          {
            type: 'LOG',
            content: 'Data access logged at 2025-11-04T19:05:00Z',
            timestamp: new Date(Date.now() - 3600000).toISOString()
          }
        ]
      },
      {
        id: '3',
        type: 'MEDIUM',
        category: 'SYSTEM',
        title: 'System Maintenance Required',
        description: 'Critical security patches available for application',
        details: 'Several critical security updates are available for the healthcare management system that address recent vulnerabilities.',
        status: 'RESOLVED',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 7200000).toISOString(),
        resolvedBy: 'it-admin@familyclinic.sg',
        resolvedAt: new Date(Date.now() - 7200000).toISOString(),
        affectedResources: ['Web Application', 'Database System'],
        regulatoryFramework: ['Cybersecurity Act'],
        complianceStandard: 'Security Update Policy v2.1',
        recommendedActions: [
          'Apply security patches during maintenance window',
          'Test patches in staging environment',
          'Update change management documentation'
        ],
        escalationLevel: 1,
        tags: ['system', 'maintenance', 'security-patches'],
        evidence: [
          {
            type: 'REPORT',
            content: 'Security update completed successfully',
            timestamp: new Date(Date.now() - 7200000).toISOString()
          }
        ]
      }
    ];

    setTimeout(() => {
      setAlerts(mockAlerts);
      setFilteredAlerts(mockAlerts);
      setLoading(false);
    }, 1000);
  }, []);

  // Filter alerts based on search and filters
  useEffect(() => {
    let filtered = alerts;

    if (searchTerm) {
      filtered = filtered.filter(alert => 
        alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedStatus !== 'ALL') {
      filtered = filtered.filter(alert => alert.status === selectedStatus);
    }

    if (selectedType !== 'ALL') {
      filtered = filtered.filter(alert => alert.type === selectedType);
    }

    if (selectedCategory !== 'ALL') {
      filtered = filtered.filter(alert => alert.category === selectedCategory);
    }

    setFilteredAlerts(filtered);
  }, [alerts, searchTerm, selectedStatus, selectedType, selectedCategory]);

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'CRITICAL':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'HIGH':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'MEDIUM':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'LOW':
        return <Shield className="h-4 w-4 text-blue-500" />;
      default:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'OPEN':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'ACKNOWLEDGED':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'RESOLVED':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'FALSE_POSITIVE':
        return <Shield className="h-4 w-4 text-gray-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'SECURITY':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'PDPA':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'MOH':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'AUDIT':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'SYSTEM':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'REGULATORY':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleAcknowledge = async () => {
    if (selectedAlert && acknowledgeNotes.trim()) {
      // Update alert status
      const updatedAlerts = alerts.map(alert => 
        alert.id === selectedAlert.id 
          ? {
              ...alert,
              status: 'ACKNOWLEDGED' as const,
              acknowledgedBy: 'current-user@familyclinic.sg',
              acknowledgedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          : alert
      );
      
      setAlerts(updatedAlerts);
      setShowAcknowledgeDialog(false);
      setAcknowledgeNotes('');
      setSelectedAlert(null);
    }
  };

  const handleResolve = async () => {
    if (selectedAlert && resolveNotes.trim()) {
      // Update alert status
      const updatedAlerts = alerts.map(alert => 
        alert.id === selectedAlert.id 
          ? {
              ...alert,
              status: 'RESOLVED' as const,
              resolvedBy: 'current-user@familyclinic.sg',
              resolvedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          : alert
      );
      
      setAlerts(updatedAlerts);
      setShowResolveDialog(false);
      setResolveNotes('');
      setSelectedAlert(null);
    }
  };

  const exportAlerts = () => {
    const dataStr = JSON.stringify(filteredAlerts, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `compliance-alerts-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const alertStats = {
    total: alerts.length,
    open: alerts.filter(a => a.status === 'OPEN').length,
    acknowledged: alerts.filter(a => a.status === 'ACKNOWLEDGED').length,
    resolved: alerts.filter(a => a.status === 'RESOLVED').length,
    critical: alerts.filter(a => a.type === 'CRITICAL').length,
    pdpa: alerts.filter(a => a.category === 'PDPA').length,
    security: alerts.filter(a => a.category === 'SECURITY').length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading compliance alerts...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Compliance Alerts</h1>
          <p className="text-muted-foreground mt-2">
            Monitor and manage regulatory compliance notifications and security alerts
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={exportAlerts}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Alerts</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alertStats.total}</div>
            <p className="text-xs text-muted-foreground">
              {alertStats.open} open, {alertStats.resolved} resolved
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{alertStats.critical}</div>
            <p className="text-xs text-muted-foreground">
              Require immediate attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">PDPA Alerts</CardTitle>
            <Shield className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-500">{alertStats.pdpa}</div>
            <p className="text-xs text-muted-foreground">
              Data protection related
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{alertStats.security}</div>
            <p className="text-xs text-muted-foreground">
              Security events detected
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search alerts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            <SelectItem value="OPEN">Open</SelectItem>
            <SelectItem value="ACKNOWLEDGED">Acknowledged</SelectItem>
            <SelectItem value="RESOLVED">Resolved</SelectItem>
            <SelectItem value="FALSE_POSITIVE">False Positive</SelectItem>
          </SelectContent>
        </Select>
        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Types</SelectItem>
            <SelectItem value="CRITICAL">Critical</SelectItem>
            <SelectItem value="HIGH">High</SelectItem>
            <SelectItem value="MEDIUM">Medium</SelectItem>
            <SelectItem value="LOW">Low</SelectItem>
            <SelectItem value="INFO">Info</SelectItem>
          </SelectContent>
        </Select>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Categories</SelectItem>
            <SelectItem value="SECURITY">Security</SelectItem>
            <SelectItem value="PDPA">PDPA</SelectItem>
            <SelectItem value="MOH">MOH</SelectItem>
            <SelectItem value="AUDIT">Audit</SelectItem>
            <SelectItem value="SYSTEM">System</SelectItem>
            <SelectItem value="REGULATORY">Regulatory</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Alerts Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAlerts.map((alert) => (
                <TableRow key={alert.id}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(alert.status)}
                      <span className="text-sm">{alert.status}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getAlertIcon(alert.type)}
                      <span className="text-sm">{alert.type}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getCategoryColor(alert.category)}>
                      {alert.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs">
                      <p className="text-sm font-medium truncate">{alert.title}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {alert.description}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{alert.assignedTo || 'Unassigned'}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {new Date(alert.createdAt).toLocaleDateString()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedAlert(alert)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {alert.status === 'OPEN' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedAlert(alert);
                              setShowAcknowledgeDialog(true);
                            }}
                          >
                            Acknowledge
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedAlert(alert);
                              setShowResolveDialog(true);
                            }}
                          >
                            Resolve
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Alert Details Dialog */}
      <Dialog open={!!selectedAlert} onOpenChange={() => setSelectedAlert(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              {selectedAlert && getAlertIcon(selectedAlert.type)}
              <span>{selectedAlert?.title}</span>
            </DialogTitle>
            <DialogDescription>
              {selectedAlert?.description}
            </DialogDescription>
          </DialogHeader>

          {selectedAlert && (
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="evidence">Evidence</TabsTrigger>
                <TabsTrigger value="actions">Actions</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Status</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      {getStatusIcon(selectedAlert.status)}
                      <span>{selectedAlert.status}</span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Type</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      {getAlertIcon(selectedAlert.type)}
                      <span>{selectedAlert.type}</span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Category</Label>
                    <Badge className={getCategoryColor(selectedAlert.category)}>
                      {selectedAlert.category}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Escalation Level</Label>
                    <span className="block mt-1">{selectedAlert.escalationLevel}</span>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Description</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedAlert.details}
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium">Affected Resources</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedAlert.affectedResources.map((resource, index) => (
                      <Badge key={index} variant="outline">
                        {resource}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Regulatory Framework</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedAlert.regulatoryFramework.map((framework, index) => (
                      <Badge key={index} variant="secondary">
                        {framework}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Tags</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedAlert.tags.map((tag, index) => (
                      <Badge key={index} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Created</Label>
                    <span className="block text-sm mt-1">
                      {new Date(selectedAlert.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Last Updated</Label>
                    <span className="block text-sm mt-1">
                      {new Date(selectedAlert.updatedAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="evidence" className="space-y-4">
                <ScrollArea className="h-64">
                  {selectedAlert.evidence.map((item, index) => (
                    <Card key={index} className="mb-4">
                      <CardHeader>
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-sm">{item.type}</CardTitle>
                          <span className="text-xs text-muted-foreground">
                            {new Date(item.timestamp).toLocaleString()}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm font-mono bg-gray-50 p-2 rounded">
                          {item.content}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </ScrollArea>
              </TabsContent>

              <TabsContent value="actions" className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Recommended Actions</Label>
                  <ul className="list-disc list-inside space-y-1 mt-2">
                    {selectedAlert.recommendedActions.map((action, index) => (
                      <li key={index} className="text-sm">{action}</li>
                    ))}
                  </ul>
                </div>
              </TabsContent>

              <TabsContent value="history" className="space-y-4">
                <div className="space-y-4">
                  {selectedAlert.acknowledgedBy && (
                    <div className="border-l-4 border-blue-500 pl-4">
                      <p className="text-sm font-medium">Acknowledged by {selectedAlert.acknowledgedBy}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(selectedAlert.acknowledgedAt!).toLocaleString()}
                      </p>
                    </div>
                  )}
                  {selectedAlert.resolvedBy && (
                    <div className="border-l-4 border-green-500 pl-4">
                      <p className="text-sm font-medium">Resolved by {selectedAlert.resolvedBy}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(selectedAlert.resolvedAt!).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          )}

          <DialogFooter>
            {selectedAlert?.status === 'OPEN' && (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAcknowledgeDialog(true);
                  }}
                >
                  Acknowledge
                </Button>
                <Button
                  onClick={() => {
                    setShowResolveDialog(true);
                  }}
                >
                  Resolve
                </Button>
              </>
            )}
            <Button variant="outline" onClick={() => setSelectedAlert(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Acknowledge Dialog */}
      <Dialog open={showAcknowledgeDialog} onOpenChange={setShowAcknowledgeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Acknowledge Alert</DialogTitle>
            <DialogDescription>
              Please provide notes for acknowledging this alert.
            </DialogDescription>
          </DialogHeader>
          <div>
            <Label htmlFor="acknowledge-notes">Notes</Label>
            <Textarea
              id="acknowledge-notes"
              value={acknowledgeNotes}
              onChange={(e) => setAcknowledgeNotes(e.target.value)}
              placeholder="Provide reasoning for acknowledging this alert..."
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAcknowledgeDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAcknowledge}
              disabled={!acknowledgeNotes.trim()}
            >
              Acknowledge
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Resolve Dialog */}
      <Dialog open={showResolveDialog} onOpenChange={setShowResolveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolve Alert</DialogTitle>
            <DialogDescription>
              Please provide notes for resolving this alert.
            </DialogDescription>
          </DialogHeader>
          <div>
            <Label htmlFor="resolve-notes">Resolution Notes</Label>
            <Textarea
              id="resolve-notes"
              value={resolveNotes}
              onChange={(e) => setResolveNotes(e.target.value)}
              placeholder="Describe how this alert was resolved..."
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResolveDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleResolve}
              disabled={!resolveNotes.trim()}
            >
              Resolve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}