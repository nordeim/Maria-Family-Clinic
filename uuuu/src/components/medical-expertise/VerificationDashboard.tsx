import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle,
  AlertCircle,
  Clock,
  Shield,
  Award,
  FileText,
  Search,
  Filter,
  Download,
  RefreshCw,
  User,
  Building,
  Globe,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Star,
  TrendingUp,
  Users,
  Target,
  Zap,
  Activity,
  Heart,
  BookOpen,
  GraduationCap,
  Medal,
  Lock,
  Unlock,
  ExternalLink,
  Eye,
  Edit,
  Trash2,
  Plus,
  Settings
} from "lucide-react";

interface VerificationItem {
  id: string;
  type: 'license' | 'certification' | 'education' | 'specialty' | 'membership';
  doctorName: string;
  doctorId: string;
  itemName: string;
  issuingBody: string;
  status: 'pending' | 'verified' | 'rejected' | 'expired';
  submittedDate: Date;
  verifiedDate?: Date;
  expiryDate?: Date;
  verificationNotes?: string;
  documentUrl?: string;
  priority: 'high' | 'medium' | 'low';
}

interface VerificationStats {
  total: number;
  pending: number;
  verified: number;
  rejected: number;
  expired: number;
  verificationRate: number;
  averageVerificationTime: number; // in hours
}

const VerificationDashboard: React.FC = () => {
  const [verificationItems, setVerificationItems] = useState<VerificationItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<VerificationItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [stats, setStats] = useState<VerificationStats>({
    total: 0,
    pending: 0,
    verified: 0,
    rejected: 0,
    expired: 0,
    verificationRate: 0,
    averageVerificationTime: 0
  });
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Mock data for demonstration
  useEffect(() => {
    const mockData: VerificationItem[] = [
      {
        id: "1",
        type: "license",
        doctorName: "Dr. Sarah Chen",
        doctorId: "doc-001",
        itemName: "Singapore Medical Council License",
        issuingBody: "Singapore Medical Council",
        status: "verified",
        submittedDate: new Date("2024-10-15"),
        verifiedDate: new Date("2024-10-16"),
        expiryDate: new Date("2025-12-31"),
        verificationNotes: "License verified successfully. All requirements met.",
        documentUrl: "/documents/smc-license-sarah-chen.pdf",
        priority: "high"
      },
      {
        id: "2",
        type: "certification",
        doctorName: "Dr. Ahmed Rahman", 
        doctorId: "doc-002",
        itemName: "Interventional Cardiology Certification",
        issuingBody: "Asia Pacific Heart Association",
        status: "pending",
        submittedDate: new Date("2024-11-01"),
        priority: "high"
      },
      {
        id: "3",
        type: "specialty",
        doctorName: "Dr. Maria Santos",
        doctorId: "doc-003", 
        itemName: "Dermatology Specialty Certification",
        issuingBody: "Singapore Dermatology Society",
        status: "expired",
        submittedDate: new Date("2022-01-15"),
        expiryDate: new Date("2024-10-31"),
        verificationNotes: "Certification expired. Renewal required.",
        priority: "medium"
      },
      {
        id: "4",
        type: "education",
        doctorName: "Dr. James Wong",
        doctorId: "doc-004",
        itemName: "MBBS Degree - National University of Singapore",
        issuingBody: "National University of Singapore",
        status: "verified",
        submittedDate: new Date("2024-09-20"),
        verifiedDate: new Date("2024-09-21"),
        documentUrl: "/documents/mbbs-james-wong.pdf",
        priority: "high"
      },
      {
        id: "5",
        type: "membership",
        doctorName: "Dr. Lisa Tan",
        doctorId: "doc-005",
        itemName: "Singapore Medical Association Membership",
        issuingBody: "Singapore Medical Association",
        status: "verified",
        submittedDate: new Date("2024-10-01"),
        verifiedDate: new Date("2024-10-02"),
        expiryDate: new Date("2025-12-31"),
        priority: "low"
      },
      {
        id: "6",
        type: "license",
        doctorName: "Dr. Robert Johnson",
        doctorId: "doc-006",
        itemName: "International Medical License Verification",
        issuingBody: "International Medical Education Council",
        status: "rejected",
        submittedDate: new Date("2024-10-25"),
        verificationNotes: "Documentation incomplete. Additional documents required.",
        priority: "high"
      }
    ];

    setVerificationItems(mockData);
    setFilteredItems(mockData);

    // Calculate stats
    const pending = mockData.filter(item => item.status === "pending").length;
    const verified = mockData.filter(item => item.status === "verified").length;
    const rejected = mockData.filter(item => item.status === "rejected").length;
    const expired = mockData.filter(item => item.status === "expired").length;
    
    setStats({
      total: mockData.length,
      pending,
      verified,
      rejected,
      expired,
      verificationRate: Math.round((verified / mockData.length) * 100),
      averageVerificationTime: 24 // mock hours
    });
  }, []);

  // Filter items based on search and filters
  useEffect(() => {
    let filtered = verificationItems;

    if (searchQuery) {
      filtered = filtered.filter(item => 
        item.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.issuingBody.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(item => item.status === statusFilter);
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter(item => item.type === typeFilter);
    }

    if (priorityFilter !== "all") {
      filtered = filtered.filter(item => item.priority === priorityFilter);
    }

    setFilteredItems(filtered);
  }, [verificationItems, searchQuery, statusFilter, typeFilter, priorityFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "rejected": return "bg-red-100 text-red-800";
      case "expired": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "license": return <Shield className="w-4 h-4" />;
      case "certification": return <Award className="w-4 h-4" />;
      case "education": return <GraduationCap className="w-4 h-4" />;
      case "specialty": return <Target className="w-4 h-4" />;
      case "membership": return <Users className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedItems.length === 0) return;

    setIsLoading(true);
    
    // Simulate bulk action
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    let updatedItems = [...verificationItems];
    
    if (action === "verify") {
      updatedItems = updatedItems.map(item => 
        selectedItems.includes(item.id) 
          ? { ...item, status: "verified" as const, verifiedDate: new Date() }
          : item
      );
    } else if (action === "reject") {
      updatedItems = updatedItems.map(item => 
        selectedItems.includes(item.id) 
          ? { ...item, status: "rejected" as const }
          : item
      );
    } else if (action === "expire") {
      updatedItems = updatedItems.map(item => 
        selectedItems.includes(item.id) 
          ? { ...item, status: "expired" as const }
          : item
      );
    }

    setVerificationItems(updatedItems);
    setSelectedItems([]);
    setIsLoading(false);
  };

  const calculateVerificationMetrics = () => {
    const now = new Date();
    const verifiedItems = verificationItems.filter(item => item.verifiedDate && item.submittedDate);
    
    if (verifiedItems.length === 0) return 0;

    const totalHours = verifiedItems.reduce((sum, item) => {
      if (item.verifiedDate) {
        const hours = (item.verifiedDate.getTime() - item.submittedDate.getTime()) / (1000 * 60 * 60);
        return sum + hours;
      }
      return sum;
    }, 0);

    return Math.round(totalHours / verifiedItems.length);
  };

  const generateVerificationReport = () => {
    // Mock report generation
    alert("Verification report generated and downloaded!");
  };

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Medical Professional Verification & Certification Dashboard
          </CardTitle>
          <CardDescription>
            Comprehensive verification system for MOH licenses, board certifications, and professional qualifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="pending">Pending Verification</TabsTrigger>
              <TabsTrigger value="verified">Verified</TabsTrigger>
              <TabsTrigger value="expired">Expired/Renewals</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Applications</p>
                        <p className="text-3xl font-bold">{stats.total}</p>
                      </div>
                      <div className="p-3 bg-blue-100 rounded-full">
                        <FileText className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Pending</p>
                        <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
                      </div>
                      <div className="p-3 bg-yellow-100 rounded-full">
                        <Clock className="w-6 h-6 text-yellow-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Verified</p>
                        <p className="text-3xl font-bold text-green-600">{stats.verified}</p>
                      </div>
                      <div className="p-3 bg-green-100 rounded-full">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Verification Rate</p>
                        <p className="text-3xl font-bold text-blue-600">{stats.verificationRate}%</p>
                      </div>
                      <div className="p-3 bg-blue-100 rounded-full">
                        <TrendingUp className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Verification Progress */}
              <Card>
                <CardHeader>
                  <CardTitle>Verification Progress Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Overall Progress</span>
                        <span className="text-sm text-gray-600">{stats.verificationRate}%</span>
                      </div>
                      <Progress value={stats.verificationRate} className="h-2" />
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{stats.verified}</div>
                        <div className="text-gray-600">Verified</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                        <div className="text-gray-600">Pending</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
                        <div className="text-gray-600">Rejected</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-600">{stats.expired}</div>
                        <div className="text-gray-600">Expired</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="pt-6 text-center">
                    <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-4" />
                    <h3 className="font-semibold mb-2">Auto-Verify</h3>
                    <p className="text-sm text-gray-600">Automatically verify licenses using MOH API</p>
                    <Button className="w-full mt-4" variant="outline">
                      <Zap className="w-4 h-4 mr-2" />
                      Run Auto-Verification
                    </Button>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="pt-6 text-center">
                    <AlertCircle className="w-12 h-12 mx-auto text-orange-500 mb-4" />
                    <h3 className="font-semibold mb-2">Expiry Alerts</h3>
                    <p className="text-sm text-gray-600">Manage expiring certifications and renewals</p>
                    <Button className="w-full mt-4" variant="outline">
                      <Bell className="w-4 h-4 mr-2" />
                      Manage Alerts
                    </Button>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="pt-6 text-center">
                    <Download className="w-12 h-12 mx-auto text-blue-500 mb-4" />
                    <h3 className="font-semibold mb-2">Reports</h3>
                    <p className="text-sm text-gray-600">Generate comprehensive verification reports</p>
                    <Button className="w-full mt-4" variant="outline" onClick={generateVerificationReport}>
                      <FileText className="w-4 h-4 mr-2" />
                      Generate Report
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="pending" className="space-y-4">
              {/* Search and Filters */}
              <Card>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <Label>Search</Label>
                      <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                        <Input
                          placeholder="Search doctors, items, or bodies..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Status</Label>
                      <select 
                        className="w-full p-2 border rounded-md"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                      >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="verified">Verified</option>
                        <option value="rejected">Rejected</option>
                        <option value="expired">Expired</option>
                      </select>
                    </div>
                    <div>
                      <Label>Type</Label>
                      <select 
                        className="w-full p-2 border rounded-md"
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                      >
                        <option value="all">All Types</option>
                        <option value="license">License</option>
                        <option value="certification">Certification</option>
                        <option value="education">Education</option>
                        <option value="specialty">Specialty</option>
                        <option value="membership">Membership</option>
                      </select>
                    </div>
                    <div>
                      <Label>Priority</Label>
                      <select 
                        className="w-full p-2 border rounded-md"
                        value={priorityFilter}
                        onChange={(e) => setPriorityFilter(e.target.value)}
                      >
                        <option value="all">All Priority</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Bulk Actions */}
              {selectedItems.length > 0 && (
                <Card className="border-yellow-200 bg-yellow-50">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {selectedItems.length} item(s) selected
                      </span>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => handleBulkAction("verify")}
                          disabled={isLoading}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Verify Selected
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleBulkAction("reject")}
                          disabled={isLoading}
                        >
                          <AlertCircle className="w-4 h-4 mr-2" />
                          Reject Selected
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Verification Items List */}
              <div className="space-y-4">
                {filteredItems.map((item) => (
                  <Card key={item.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={selectedItems.includes(item.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedItems([...selectedItems, item.id]);
                                } else {
                                  setSelectedItems(selectedItems.filter(id => id !== item.id));
                                }
                              }}
                            />
                            <div className="flex items-center gap-2">
                              {getTypeIcon(item.type)}
                              <h4 className="font-semibold">{item.itemName}</h4>
                              <Badge className={getStatusColor(item.status)}>
                                {item.status.toUpperCase()}
                              </Badge>
                              <Badge className={getPriorityColor(item.priority)}>
                                {item.priority.toUpperCase()}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Doctor:</span>
                              <div className="font-medium">{item.doctorName}</div>
                            </div>
                            <div>
                              <span className="text-gray-600">Issuing Body:</span>
                              <div className="font-medium">{item.issuingBody}</div>
                            </div>
                            <div>
                              <span className="text-gray-600">Submitted:</span>
                              <div className="font-medium">
                                {item.submittedDate.toLocaleDateString()}
                              </div>
                            </div>
                          </div>

                          {item.verificationNotes && (
                            <div className="text-sm">
                              <span className="text-gray-600">Notes:</span>
                              <div className="mt-1 p-2 bg-gray-50 rounded">{item.verificationNotes}</div>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col gap-2 ml-4">
                          {item.status === "pending" && (
                            <>
                              <Button size="sm" className="w-full">
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Verify
                              </Button>
                              <Button size="sm" variant="outline" className="w-full">
                                <AlertCircle className="w-4 h-4 mr-2" />
                                Reject
                              </Button>
                            </>
                          )}
                          
                          {item.documentUrl && (
                            <Button size="sm" variant="outline" className="w-full">
                              <Eye className="w-4 h-4 mr-2" />
                              View Document
                            </Button>
                          )}
                          
                          <Button size="sm" variant="ghost" className="w-full">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Contact Doctor
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="verified" className="space-y-4">
              <div className="text-center py-8">
                <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
                <h3 className="text-lg font-medium mb-2">Verified Professionals</h3>
                <p className="text-gray-600">
                  All certifications and licenses have been successfully verified
                </p>
                <div className="mt-6">
                  <Button>
                    <Download className="w-4 h-4 mr-2" />
                    Download Verified List
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="expired" className="space-y-4">
              <div className="text-center py-8">
                <Clock className="w-16 h-16 mx-auto text-orange-500 mb-4" />
                <h3 className="text-lg font-medium mb-2">Expired & Renewal Alerts</h3>
                <p className="text-gray-600">
                  {stats.expired} certifications require renewal or have expired
                </p>
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <AlertCircle className="w-8 h-8 mx-auto text-orange-500 mb-2" />
                      <div className="text-xl font-bold">{stats.expired}</div>
                      <div className="text-sm text-gray-600">Expired</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <Clock className="w-8 h-8 mx-auto text-yellow-500 mb-2" />
                      <div className="text-xl font-bold">8</div>
                      <div className="text-sm text-gray-600">Expiring Soon</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <RefreshCw className="w-8 h-8 mx-auto text-blue-500 mb-2" />
                      <div className="text-xl font-bold">15</div>
                      <div className="text-sm text-gray-600">Renewals Sent</div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Verification Metrics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Average Verification Time</span>
                        <span className="font-medium">{calculateVerificationMetrics()} hours</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Verification Rate</span>
                        <span className="font-medium">{stats.verificationRate}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Auto-Verification Success</span>
                        <span className="font-medium">87%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Document Completeness</span>
                        <span className="font-medium">94%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Compliance Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">MOH License Compliance</span>
                        <Badge className="bg-green-100 text-green-800">98% Compliant</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Board Certification Rate</span>
                        <Badge className="bg-green-100 text-green-800">92% Certified</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">International Qualification Recognition</span>
                        <Badge className="bg-blue-100 text-blue-800">85% Recognized</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">CME Compliance</span>
                        <Badge className="bg-yellow-100 text-yellow-800">78% Compliant</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Verification Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    [Verification trends chart would go here]
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default VerificationDashboard;