import * as React from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert"
import {
  Users,
  Building,
  Brain,
  Calendar,
  Handshake,
  TrendingUp,
  MapPin,
  Clock,
  Star,
  AlertTriangle,
  CheckCircle,
  Activity,
  BarChart3,
  Network,
  Target,
  Zap,
  Settings,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Eye,
  ArrowRight,
  CalendarDays,
  Timer,
  Award,
  Globe,
  Phone,
  Mail,
  Crown,
  ThumbsUp
} from "lucide-react"
import { cn } from "@/lib/utils"
import { 
  ClinicDoctorManagement 
} from "./clinic-doctor-management"
import { 
  IntelligentDoctorAssignment 
} from "./intelligent-doctor-assignment"
import { 
  DoctorScheduleCoordination 
} from "./doctor-schedule-coordination"
import { 
  ClinicPartnershipManagement 
} from "./clinic-partnership-management"

interface DoctorClinicIntegrationDashboardProps {
  clinicId?: string
  doctorId?: string
  className?: string
}

interface DashboardMetrics {
  totalDoctors: number
  activeDoctors: number
  clinicAffiliations: number
  scheduleConflicts: number
  partnershipCount: number
  totalReferrals: number
  averageUtilization: number
  patientSatisfaction: number
  systemEfficiency: number
  emergencyCoverage: number
}

interface RecentActivity {
  id: string
  type: 'schedule-change' | 'new-partnership' | 'referral' | 'conflict-resolution' | 'doctor-availability'
  title: string
  description: string
  timestamp: Date
  doctorName?: string
  clinicName?: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'completed' | 'pending' | 'in-progress'
}

interface SystemHealth {
  overall: number
  scheduleOptimization: number
  partnershipNetwork: number
  availabilityAccuracy: number
  conflictResolution: number
  performance: {
    score: number
    issues: string[]
    recommendations: string[]
  }
}

export function DoctorClinicIntegrationDashboard({ 
  clinicId, 
  doctorId, 
  className 
}: DoctorClinicIntegrationDashboardProps) {
  const [activeTab, setActiveTab] = React.useState("overview")
  const [selectedClinic, setSelectedClinic] = React.useState<string>(clinicId || "")
  const [selectedDoctor, setSelectedDoctor] = React.useState<string>(doctorId || "")
  const [loading, setLoading] = React.useState(true)
  const [refreshing, setRefreshing] = React.useState(false)
  const [metrics, setMetrics] = React.useState<DashboardMetrics>({
    totalDoctors: 0,
    activeDoctors: 0,
    clinicAffiliations: 0,
    scheduleConflicts: 0,
    partnershipCount: 0,
    totalReferrals: 0,
    averageUtilization: 0,
    patientSatisfaction: 0,
    systemEfficiency: 0,
    emergencyCoverage: 0
  })
  const [systemHealth, setSystemHealth] = React.useState<SystemHealth>({
    overall: 0,
    scheduleOptimization: 0,
    partnershipNetwork: 0,
    availabilityAccuracy: 0,
    conflictResolution: 0,
    performance: {
      score: 0,
      issues: [],
      recommendations: []
    }
  })
  const [recentActivities, setRecentActivities] = React.useState<RecentActivity[]>([])

  // Mock data - in real app this would come from API
  React.useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true)
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800))
      
      const mockMetrics: DashboardMetrics = {
        totalDoctors: 24,
        activeDoctors: 22,
        clinicAffiliations: 47,
        scheduleConflicts: 3,
        partnershipCount: 8,
        totalReferrals: 156,
        averageUtilization: 78.5,
        patientSatisfaction: 4.6,
        systemEfficiency: 89.2,
        emergencyCoverage: 94.3
      }
      
      const mockSystemHealth: SystemHealth = {
        overall: 89,
        scheduleOptimization: 92,
        partnershipNetwork: 85,
        availabilityAccuracy: 88,
        conflictResolution: 91,
        performance: {
          score: 89,
          issues: [
            "3 schedule conflicts detected today",
            "2 partnership renewals due soon",
            "1 doctor availability not updated"
          ],
          recommendations: [
            "Consider optimizing Dr. Chen's schedule across clinics",
            "Review partnership agreements for renewal",
            "Update emergency coverage protocols"
          ]
        }
      }
      
      const mockActivities: RecentActivity[] = [
        {
          id: "1",
          type: "schedule-change",
          title: "Schedule Updated",
          description: "Dr. Sarah Chen's clinic schedule updated at Central Family Clinic",
          timestamp: new Date("2024-11-04T10:30:00"),
          doctorName: "Dr. Sarah Chen",
          clinicName: "Central Family Clinic",
          priority: "medium",
          status: "completed"
        },
        {
          id: "2",
          type: "conflict-resolution",
          title: "Schedule Conflict Resolved",
          description: "Resolved time overlap between Westside Medical and North Clinic",
          timestamp: new Date("2024-11-04T09:15:00"),
          priority: "high",
          status: "completed"
        },
        {
          id: "3",
          type: "new-partnership",
          title: "New Partnership Established",
          description: "Partnership agreement signed with Emergency Care Network",
          timestamp: new Date("2024-11-03T16:45:00"),
          clinicName: "Emergency Care Network",
          priority: "medium",
          status: "completed"
        },
        {
          id: "4",
          type: "referral",
          title: "Patient Referral",
          description: "Cardiology referral sent to Specialist Medical Center",
          timestamp: new Date("2024-11-03T14:20:00"),
          doctorName: "Dr. Michael Wong",
          clinicName: "Specialist Medical Center",
          priority: "low",
          status: "completed"
        },
        {
          id: "5",
          type: "doctor-availability",
          title: "Availability Updated",
          description: "Dr. Lisa Tan updated availability for next week",
          timestamp: new Date("2024-11-03T11:00:00"),
          doctorName: "Dr. Lisa Tan",
          priority: "low",
          status: "completed"
        }
      ]
      
      setMetrics(mockMetrics)
      setSystemHealth(mockSystemHealth)
      setRecentActivities(mockActivities)
      setLoading(false)
    }

    fetchDashboardData()
  }, [clinicId, doctorId])

  const handleRefresh = async () => {
    setRefreshing(true)
    // Simulate refresh delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    setRefreshing(false)
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'schedule-change':
        return <Calendar className="h-4 w-4 text-blue-600" />
      case 'conflict-resolution':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'new-partnership':
        return <Handshake className="h-4 w-4 text-purple-600" />
      case 'referral':
        return <ArrowRight className="h-4 w-4 text-orange-600" />
      case 'doctor-availability':
        return <Clock className="h-4 w-4 text-teal-600" />
      default:
        return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'destructive'
      case 'high':
        return 'default'
      case 'medium':
        return 'secondary'
      case 'low':
        return 'outline'
      default:
        return 'outline'
    }
  }

  const renderMetricsOverview = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            <div>
              <div className="text-2xl font-bold">{metrics.totalDoctors}</div>
              <div className="text-xs text-muted-foreground">Total Doctors</div>
              <div className="text-xs text-green-600">
                {metrics.activeDoctors} active
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Building className="h-5 w-5 text-green-600" />
            <div>
              <div className="text-2xl font-bold">{metrics.clinicAffiliations}</div>
              <div className="text-xs text-muted-foreground">Affiliations</div>
              <div className="text-xs text-muted-foreground">
                Avg {(metrics.clinicAffiliations / metrics.totalDoctors).toFixed(1)} per doctor
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Handshake className="h-5 w-5 text-purple-600" />
            <div>
              <div className="text-2xl font-bold">{metrics.partnershipCount}</div>
              <div className="text-xs text-muted-foreground">Partnerships</div>
              <div className="text-xs text-orange-600">
                {metrics.totalReferrals} referrals
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-indigo-600" />
            <div>
              <div className="text-2xl font-bold">{metrics.averageUtilization}%</div>
              <div className="text-xs text-muted-foreground">Utilization</div>
              <div className="text-xs text-green-600">
                {metrics.systemEfficiency}% efficiency
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <div>
              <div className="text-2xl font-bold">{metrics.scheduleConflicts}</div>
              <div className="text-xs text-muted-foreground">Conflicts</div>
              <div className="text-xs text-muted-foreground">
                {metrics.emergencyCoverage}% coverage
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderSystemHealth = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Health Score Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            System Health Score
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Overall Score */}
          <div className="text-center">
            <div className="relative inline-flex items-center justify-center w-32 h-32">
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="8"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="8"
                  strokeDasharray={`${systemHealth.overall * 3.14} 314`}
                  className="transition-all duration-500"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-bold text-green-600">
                  {systemHealth.overall}%
                </span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-2">Overall System Health</p>
          </div>

          {/* Component Scores */}
          <div className="space-y-3">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Schedule Optimization</span>
                <span>{systemHealth.scheduleOptimization}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{ width: `${systemHealth.scheduleOptimization}%` }}
                ></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Partnership Network</span>
                <span>{systemHealth.partnershipNetwork}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${systemHealth.partnershipNetwork}%` }}
                ></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Availability Accuracy</span>
                <span>{systemHealth.availabilityAccuracy}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full" 
                  style={{ width: `${systemHealth.availabilityAccuracy}%` }}
                ></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Conflict Resolution</span>
                <span>{systemHealth.conflictResolution}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-orange-600 h-2 rounded-full" 
                  style={{ width: `${systemHealth.conflictResolution}%` }}
                ></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Issues & Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Performance Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Issues */}
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              Issues Detected
            </h4>
            <div className="space-y-2">
              {systemHealth.performance.issues.map((issue, index) => (
                <div key={index} className="flex items-start gap-2 p-2 bg-red-50 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-red-800">{issue}</span>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Recommendations */}
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <Zap className="h-4 w-4 text-green-600" />
              Recommendations
            </h4>
            <div className="space-y-2">
              {systemHealth.performance.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start gap-2 p-2 bg-green-50 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-green-800">{recommendation}</span>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Quick Actions */}
          <div className="space-y-2">
            <h4 className="font-semibold">Quick Actions</h4>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Data
              </Button>
              <Button size="sm" variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Optimize Schedules
              </Button>
              <Button size="sm" variant="outline">
                <BarChart3 className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderRecentActivities = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Recent Activities
          <Badge variant="outline" className="ml-auto">
            {recentActivities.length} items
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recentActivities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex-shrink-0 mt-1">
                {getActivityIcon(activity.type)}
              </div>
              
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{activity.title}</span>
                  <Badge variant={getPriorityColor(activity.priority)} className="text-xs">
                    {activity.priority}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {activity.status}
                  </Badge>
                </div>
                
                <p className="text-sm text-muted-foreground">
                  {activity.description}
                </p>
                
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{activity.timestamp.toLocaleString()}</span>
                  {activity.doctorName && (
                    <span>• Dr. {activity.doctorName}</span>
                  )}
                  {activity.clinicName && (
                    <span>• {activity.clinicName}</span>
                  )}
                </div>
              </div>
              
              <Button size="sm" variant="ghost">
                <Eye className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
        
        <div className="mt-4 pt-4 border-t">
          <Button variant="outline" className="w-full">
            <Clock className="h-4 w-4 mr-2" />
            View All Activities
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  if (loading) {
    return (
      <Card className={cn("h-full", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Doctor-Clinic Integration Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn("h-full", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Doctor-Clinic Integration & Relationship Management
            <Badge variant="outline" className="ml-2">
              v7.4
            </Badge>
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={cn("h-4 w-4 mr-2", refreshing && "animate-spin")} />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Navigation & Filters */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex flex-wrap gap-2">
            <Select value={selectedClinic} onValueChange={setSelectedClinic}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select clinic..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Clinics</SelectItem>
                <SelectItem value="clinic1">Central Family Clinic</SelectItem>
                <SelectItem value="clinic2">Westside Medical</SelectItem>
                <SelectItem value="clinic3">North Clinic</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select doctor..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Doctors</SelectItem>
                <SelectItem value="doctor1">Dr. Sarah Chen</SelectItem>
                <SelectItem value="doctor2">Dr. Michael Wong</SelectItem>
                <SelectItem value="doctor3">Dr. Lisa Tan</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="management">Doctor Management</TabsTrigger>
            <TabsTrigger value="assignment">Smart Assignment</TabsTrigger>
            <TabsTrigger value="scheduling">Schedule Coordination</TabsTrigger>
            <TabsTrigger value="partnerships">Partnerships</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Alert>
              <Activity className="h-4 w-4" />
              <AlertDescription>
                Comprehensive doctor-clinic relationship management dashboard. 
                Monitor system health, track activities, and optimize healthcare delivery across multiple clinic affiliations.
              </AlertDescription>
            </Alert>

            {/* Key Metrics */}
            {renderMetricsOverview()}

            {/* System Health & Recent Activities */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {renderSystemHealth()}
              {renderRecentActivities()}
            </div>

            {/* Patient Satisfaction Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ThumbsUp className="h-5 w-5" />
                  Performance Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 flex items-center justify-center gap-1">
                      <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
                      {metrics.patientSatisfaction}
                    </div>
                    <div className="text-sm text-muted-foreground">Patient Satisfaction</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">{metrics.totalReferrals}</div>
                    <div className="text-sm text-muted-foreground">Total Referrals</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">{metrics.systemEfficiency}%</div>
                    <div className="text-sm text-muted-foreground">System Efficiency</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600">{metrics.emergencyCoverage}%</div>
                    <div className="text-sm text-muted-foreground">Emergency Coverage</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="management" className="space-y-4">
            <ClinicDoctorManagement 
              clinicId={selectedClinic || "clinic1"}
              clinicName="Central Family Clinic"
              className="h-full"
            />
          </TabsContent>

          <TabsContent value="assignment" className="space-y-4">
            <IntelligentDoctorAssignment 
              clinicId={selectedClinic}
              className="h-full"
            />
          </TabsContent>

          <TabsContent value="scheduling" className="space-y-4">
            <DoctorScheduleCoordination 
              doctorId={selectedDoctor}
              clinicId={selectedClinic}
              className="h-full"
            />
          </TabsContent>

          <TabsContent value="partnerships" className="space-y-4">
            <ClinicPartnershipManagement 
              clinicId={selectedClinic}
              className="h-full"
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}