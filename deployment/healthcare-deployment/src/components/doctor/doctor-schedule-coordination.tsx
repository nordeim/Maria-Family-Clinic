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
  Alert,
  AlertDescription,
} from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Calendar,
  Clock,
  MapPin,
  Navigation,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  RotateCcw,
  Users,
  Building,
  Car,
  Timer,
  Zap,
  Target,
  Plus,
  Settings,
  TrendingUp,
  AlertCircle,
  Info,
  ArrowRight,
  CalendarDays,
  Repeat,
  Eye
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Doctor, DoctorClinic, DoctorSchedule, DoctorAvailability } from "@/types/doctor"

interface ScheduleCoordinationProps {
  doctorId?: string
  clinicId?: string
  className?: string
}

interface ScheduleConflict {
  id: string
  conflictType: 'time-overlap' | 'travel-impossible' | 'double-booking' | 'capacity-exceeded'
  severity: 'low' | 'medium' | 'high' | 'critical'
  doctorId: string
  clinicId: string
  scheduleId?: string
  conflictingScheduleId?: string
  startTime: string
  endTime: string
  date: Date
  description: string
  resolution?: string
  suggestedResolution?: string
  affectedAppointments: number
  distance?: number
  travelTime?: number
}

interface TravelTimeCalculation {
  fromClinicId: string
  toClinicId: string
  fromClinicName: string
  toClinicName: string
  distance: number // km
  travelTime: number // minutes
  isFeasible: boolean
  conflicts: string[]
}

interface MultiClinicSchedule {
  doctor: Doctor
  schedules: Array<{
    clinicId: string
    clinicName: string
    schedules: DoctorSchedule[]
    availabilities: DoctorAvailability[]
    conflicts: ScheduleConflict[]
    totalAppointments: number
    utilizationRate: number
    efficiency: number
  }>
  overallUtilization: number
  conflictCount: number
  travelTimeToday: number
  efficiency: number
}

export function DoctorScheduleCoordination({ 
  doctorId, 
  clinicId, 
  className 
}: ScheduleCoordinationProps) {
  const [schedules, setSchedules] = React.useState<MultiClinicSchedule[]>([])
  const [conflicts, setConflicts] = React.useState<ScheduleConflict[]>([])
  const [travelTimes, setTravelTimes] = React.useState<TravelTimeCalculation[]>([])
  const [loading, setLoading] = React.useState(true)
  const [selectedDoctor, setSelectedDoctor] = React.useState<string>(doctorId || "")
  const [selectedDate, setSelectedDate] = React.useState<string>(new Date().toISOString().split('T')[0])
  const [viewMode, setViewMode] = React.useState<'day' | 'week' | 'month'>('day')
  const [autoResolve, setAutoResolve] = React.useState(true)
  const [showConflicts, setShowConflicts] = React.useState(true)
  const [activeTab, setActiveTab] = React.useState("overview")

  // Mock data - in real app this would come from API
  React.useEffect(() => {
    const fetchScheduleData = async () => {
      setLoading(true)
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800))
      
      const mockConflicts: ScheduleConflict[] = [
        {
          id: "conflict1",
          conflictType: "time-overlap",
          severity: "high",
          doctorId: "1",
          clinicId: "clinic1",
          startTime: "14:00",
          endTime: "15:30",
          date: new Date(),
          description: "Dr. Sarah Chen has overlapping appointments at Central Family Clinic (14:00-15:00) and Westside Medical (14:30-15:30)",
          resolution: "Pending resolution",
          suggestedResolution: "Move Westside appointment to 16:00 or reschedule to different doctor",
          affectedAppointments: 2,
          distance: 25.3,
          travelTime: 45
        },
        {
          id: "conflict2",
          conflictType: "travel-impossible",
          severity: "critical",
          doctorId: "1",
          clinicId: "clinic2",
          startTime: "11:00",
          endTime: "12:00",
          date: new Date(),
          description: "Insufficient travel time between North Clinic (10:30-11:00) and South Medical (11:00-12:00)",
          resolution: "Needs immediate attention",
          suggestedResolution: "Extend North Clinic appointment to 11:15 or use locum doctor for South Medical",
          affectedAppointments: 1
        }
      ]
      
      const mockTravelTimes: TravelTimeCalculation[] = [
        {
          fromClinicId: "clinic1",
          toClinicId: "clinic2",
          fromClinicName: "Central Family Clinic",
          toClinicName: "Westside Medical",
          distance: 15.2,
          travelTime: 35,
          isFeasible: true,
          conflicts: []
        },
        {
          fromClinicId: "clinic2",
          toClinicId: "clinic3",
          fromClinicName: "Westside Medical",
          toClinicName: "North Clinic",
          distance: 8.7,
          travelTime: 20,
          isFeasible: true,
          conflicts: []
        },
        {
          fromClinicId: "clinic1",
          toClinicId: "clinic3",
          fromClinicName: "Central Family Clinic",
          toClinicName: "North Clinic",
          distance: 22.5,
          travelTime: 55,
          isFeasible: false,
          conflicts: ["Same day appointments too far apart"]
        }
      ]
      
      const mockSchedules: MultiClinicSchedule[] = [
        {
          doctor: {
            id: "1",
            name: "Dr. Sarah Chen",
            email: "sarah.chen@clinic.sg",
            phone: "+65 9123 4567",
            medicalLicense: "ML123456",
            specialties: ["Family Medicine", "Internal Medicine"],
            languages: ["English", "Mandarin"],
            qualifications: ["MBBS", "MCGP"],
            experienceYears: 8,
            bio: "Experienced family physician",
            isActive: true,
            isVerified: true,
            rating: 4.8,
            reviewCount: 127,
            patientSatisfaction: 4.6,
            totalAppointments: 1847,
            currency: "SGD",
            privacySettings: {
              profileVisibility: "public",
              contactInfoVisible: "clinic-only",
              scheduleVisible: "clinic-only",
              availabilityVisible: true,
              reviewsVisible: true
            },
            gdprConsent: true,
            pdpaConsent: true,
            confidentialityLevel: "STANDARD",
            emergencyAvailability: true,
            cmePoints: 120,
            achievements: [],
            awards: [],
            publications: [],
            researchInterests: [],
            specializations: [],
            boardCertifications: [],
            professionalMemberships: [],
            careerHighlights: [],
            previousPositions: [],
            profileImage: undefined,
            consultationFee: 60,
            verificationDate: undefined,
            verificationNotes: undefined,
            appointmentCompletionRate: undefined,
            specializationPopularity: undefined,
            languagePreference: {},
            dataRetentionPeriod: undefined,
            preferredContactMethod: undefined,
            communicationPreferences: {
              emailNotifications: true,
              smsReminders: true,
              phoneCalls: false,
              emergencyOnly: false
            },
            emergencyContact: undefined,
            emergencyPhone: undefined,
            lastCMEUpdate: undefined,
            professionalDevelopment: [],
            onCallSchedule: undefined,
            createdAt: new Date(),
            updatedAt: new Date(),
            clinics: [],
            specialtiesRel: [],
            availabilities: [],
            educationHistory: [],
            certifications: [],
            memberships: [],
            awardsRel: [],
            schedules: [],
            leaves: [],
            appointments: [],
            searchIndex: [],
            auditLogs: []
          },
          schedules: [
            {
              clinicId: "clinic1",
              clinicName: "Central Family Clinic",
              schedules: [],
              availabilities: [
                {
                  id: "av1",
                  doctorId: "1",
                  clinicId: "clinic1",
                  date: new Date(),
                  startTime: "09:00",
                  endTime: "12:00",
                  isAvailable: true,
                  availabilityType: "REGULAR",
                  appointmentType: "General Consultation",
                  maxAppointments: 6,
                  bookedAppointments: 4,
                  availableSlots: 2,
                  location: "Clinic Room 1",
                  roomNumber: "R1",
                  slotDuration: 30,
                  breakDuration: 15,
                  bufferTime: 10,
                  isEmergency: false,
                  isWalkIn: true,
                  isTelehealth: false,
                  ageRestrictions: {},
                  genderRestrictions: [],
                  conditionsJson: [],
                  status: "ACTIVE",
                  lastUpdated: new Date(),
                  notes: undefined,
                  createdAt: new Date(),
                  updatedAt: new Date()
                }
              ],
              conflicts: [],
              totalAppointments: 4,
              utilizationRate: 67,
              efficiency: 85
            },
            {
              clinicId: "clinic2",
              clinicName: "Westside Medical",
              schedules: [],
              availabilities: [
                {
                  id: "av2",
                  doctorId: "1",
                  clinicId: "clinic2",
                  date: new Date(),
                  startTime: "14:00",
                  endTime: "17:00",
                  isAvailable: true,
                  availabilityType: "REGULAR",
                  appointmentType: "Specialist Consultation",
                  maxAppointments: 6,
                  bookedAppointments: 3,
                  availableSlots: 3,
                  location: "Clinic Room 3",
                  roomNumber: "R3",
                  slotDuration: 45,
                  breakDuration: 15,
                  bufferTime: 15,
                  isEmergency: false,
                  isWalkIn: false,
                  isTelehealth: false,
                  ageRestrictions: {},
                  genderRestrictions: [],
                  conditionsJson: [],
                  status: "ACTIVE",
                  lastUpdated: new Date(),
                  notes: undefined,
                  createdAt: new Date(),
                  updatedAt: new Date()
                }
              ],
              conflicts: [],
              totalAppointments: 3,
              utilizationRate: 50,
              efficiency: 78
            }
          ],
          overallUtilization: 58,
          conflictCount: 2,
          travelTimeToday: 80,
          efficiency: 82
        }
      ]
      
      setSchedules(mockSchedules)
      setConflicts(mockConflicts)
      setTravelTimes(mockTravelTimes)
      setLoading(false)
    }

    fetchScheduleData()
  }, [selectedDoctor, selectedDate])

  const getConflictIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      case 'medium':
        return <AlertCircle className="h-4 w-4 text-orange-600" />
      case 'low':
        return <Info className="h-4 w-4 text-yellow-600" />
      default:
        return <Info className="h-4 w-4 text-blue-600" />
    }
  }

  const getConflictVariant = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return 'destructive'
      case 'medium':
        return 'default'
      case 'low':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  const handleResolveConflict = (conflictId: string) => {
    setConflicts(prev => prev.filter(c => c.id !== conflictId))
    // In real app, this would call the API to resolve the conflict
  }

  const handleAutoResolve = () => {
    setAutoResolve(!autoResolve)
    // In real app, this would enable/disable automatic conflict resolution
  }

  const handleRefreshSchedules = () => {
    setLoading(true)
    // In real app, this would refresh all schedule data
    setTimeout(() => setLoading(false), 1000)
  }

  const renderConflictCard = (conflict: ScheduleConflict) => (
    <Card key={conflict.id} className="border-l-4 border-l-red-500">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {getConflictIcon(conflict.severity)}
              <Badge variant={getConflictVariant(conflict.severity)}>
                {conflict.conflictType.replace('-', ' ').toUpperCase()}
              </Badge>
              <Badge variant="outline">
                {conflict.severity.toUpperCase()}
              </Badge>
            </div>
            
            <p className="text-sm text-muted-foreground mb-3">
              {conflict.description}
            </p>
            
            {conflict.suggestedResolution && (
              <div className="bg-blue-50 p-3 rounded-lg mb-3">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">Suggested Resolution</span>
                </div>
                <p className="text-sm text-blue-800">
                  {conflict.suggestedResolution}
                </p>
              </div>
            )}
            
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>Date: {conflict.date.toLocaleDateString()}</span>
              <span>Time: {conflict.startTime} - {conflict.endTime}</span>
              {conflict.distance && (
                <span>Distance: {conflict.distance}km</span>
              )}
              {conflict.travelTime && (
                <span>Travel: {conflict.travelTime}min</span>
              )}
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <Button size="sm" onClick={() => handleResolveConflict(conflict.id)}>
              <CheckCircle className="h-4 w-4 mr-1" />
              Resolve
            </Button>
            <Button size="sm" variant="outline">
              <Eye className="h-4 w-4 mr-1" />
              View Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const renderTravelTimeCard = (travelTime: TravelTimeCalculation) => (
    <Card key={`${travelTime.fromClinicId}-${travelTime.toClinicId}`}>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Navigation className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                {travelTime.fromClinicName} → {travelTime.toClinicName}
              </span>
            </div>
            {travelTime.isFeasible ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <XCircle className="h-4 w-4 text-red-600" />
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-muted-foreground">Distance</div>
              <div className="font-semibold">{travelTime.distance}km</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Travel Time</div>
              <div className="font-semibold">{travelTime.travelTime}min</div>
            </div>
          </div>
          
          {travelTime.conflicts.length > 0 && (
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Conflicts</div>
              {travelTime.conflicts.map((conflict, index) => (
                <Badge key={index} variant="destructive" className="text-xs">
                  {conflict}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )

  const renderScheduleOverview = (schedule: MultiClinicSchedule) => (
    <Card key={schedule.doctor.id}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{schedule.doctor.name}</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {schedule.conflictCount} conflicts
            </Badge>
            <Badge variant="secondary">
              {schedule.overallUtilization}% utilization
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{schedule.overallUtilization}%</div>
            <div className="text-xs text-muted-foreground">Utilization</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{schedule.efficiency}</div>
            <div className="text-xs text-muted-foreground">Efficiency</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{schedule.travelTimeToday}min</div>
            <div className="text-xs text-muted-foreground">Travel Time</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{schedule.conflictCount}</div>
            <div className="text-xs text-muted-foreground">Conflicts</div>
          </div>
        </div>

        <Separator />

        {/* Clinic Schedules */}
        <div className="space-y-3">
          <h4 className="font-semibold flex items-center gap-2">
            <Building className="h-4 w-4" />
            Clinic Schedules
          </h4>
          
          {schedule.schedules.map((clinicSchedule) => (
            <div key={clinicSchedule.clinicId} className="border rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{clinicSchedule.clinicName}</span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {clinicSchedule.utilizationRate}% utilized
                  </Badge>
                  {clinicSchedule.conflicts.length > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {clinicSchedule.conflicts.length} conflicts
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="text-sm text-muted-foreground">
                {clinicSchedule.availabilities.length} availability slots • 
                {clinicSchedule.totalAppointments} appointments • 
                Efficiency: {clinicSchedule.efficiency}%
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2 border-t">
          <Button size="sm" variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            View Calendar
          </Button>
          <Button size="sm" variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Adjust Schedule
          </Button>
          <Button size="sm" variant="outline">
            <Repeat className="h-4 w-4 mr-2" />
            Optimize
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
            <Calendar className="h-5 w-5" />
            Schedule Coordination
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            Loading schedule data...
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
            <Calendar className="h-5 w-5" />
            Advanced Schedule Coordination
            <Badge variant="outline">
              Multi-Clinic
            </Badge>
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={handleRefreshSchedules}
              disabled={loading}
            >
              <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-[180px]"
            />
          </div>
          
          <Select value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Day View</SelectItem>
              <SelectItem value="week">Week View</SelectItem>
              <SelectItem value="month">Month View</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant={showConflicts ? "default" : "outline"}
            size="sm"
            onClick={() => setShowConflicts(!showConflicts)}
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            {showConflicts ? "Hide" : "Show"} Conflicts
          </Button>
          
          <Button
            variant={autoResolve ? "default" : "outline"}
            size="sm"
            onClick={handleAutoResolve}
          >
            <Zap className="h-4 w-4 mr-2" />
            Auto-Resolve {autoResolve ? "ON" : "OFF"}
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Schedule Overview</TabsTrigger>
            <TabsTrigger value="conflicts">Conflicts</TabsTrigger>
            <TabsTrigger value="travel">Travel Times</TabsTrigger>
            <TabsTrigger value="optimization">Optimization</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Overview of all doctor schedules across multiple clinics. 
                Monitor utilization rates, detect conflicts, and optimize scheduling efficiency.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-6">
              {schedules.map(renderScheduleOverview)}
            </div>
          </TabsContent>

          <TabsContent value="conflicts" className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {conflicts.length} schedule conflicts detected. Review and resolve conflicts 
                to ensure smooth operations across all clinics.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-4">
              {conflicts.length > 0 ? (
                conflicts.map(renderConflictCard)
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 mx-auto text-green-600 mb-4" />
                  <p className="text-muted-foreground">No schedule conflicts detected</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="travel" className="space-y-4">
            <Alert>
              <Navigation className="h-4 w-4" />
              <AlertDescription>
                Travel time calculations between clinic locations. 
                Ensure feasible transitions for doctors with multiple clinic affiliations.
              </AlertDescription>
            </Alert>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {travelTimes.map(renderTravelTimeCard)}
            </div>
          </TabsContent>

          <TabsContent value="optimization" className="space-y-4">
            <Alert>
              <TrendingUp className="h-4 w-4" />
              <AlertDescription>
                AI-powered schedule optimization suggestions to improve efficiency 
                and reduce conflicts across the entire doctor-clinic network.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-4">
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold">Optimization Recommendations</h3>
                    
                    <div className="space-y-3">
                      <div className="border-l-4 border-blue-500 pl-4">
                        <div className="font-medium">Route Optimization</div>
                        <div className="text-sm text-muted-foreground">
                          Reorder appointments to minimize travel time by 15%
                        </div>
                      </div>
                      
                      <div className="border-l-4 border-green-500 pl-4">
                        <div className="font-medium">Capacity Utilization</div>
                        <div className="text-sm text-muted-foreground">
                          Redistribute appointments to improve utilization from 58% to 73%
                        </div>
                      </div>
                      
                      <div className="border-l-4 border-orange-500 pl-4">
                        <div className="font-medium">Conflict Resolution</div>
                        <div className="text-sm text-muted-foreground">
                          Auto-resolve 2 time conflicts using locum coverage
                        </div>
                      </div>
                    </div>
                    
                    <Button className="w-full">
                      <Zap className="h-4 w-4 mr-2" />
                      Apply Optimizations
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}